#!/usr/bin/env python3
"""V264: re-sample each real head's skin colour from the lit cheeks of its own face texture.

The import tools sampled the neck/jaw band (baked shadow) and stored a skin colour ~30-130 luminance darker than the
face: bodies (matched to that colour) were visibly darker than the faces (e.g. Skriniar, Kane, Rice, Salah).
Cheek region = skin vertices facing forward, 2-6 cm below the eye line, 2.2-5.5 cm from the centre line.
Usage: python3 tools/head-import/resample-skin.py [--write] [--only sid,sid]
"""
import argparse, gzip, io, json, pathlib, struct
import numpy as np
from PIL import Image
ROOT = pathlib.Path(__file__).resolve().parents[2]
CT = {5126: np.float32, 5123: np.uint16, 5125: np.uint32, 5121: np.uint8, 5122: np.int16, 5120: np.int8}
NORM = {5122: 32767., 5120: 127., 5123: 65535., 5121: 255.}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}


def load(path):
    raw = gzip.decompress(path.read_bytes())
    n = struct.unpack('<I', raw[12:16])[0]; g = json.loads(raw[20:20 + n]); binary = raw[20 + n + 8:]
    def acc(i):
        a = g['accessors'][i]; v = g['bufferViews'][a['bufferView']]; off = v.get('byteOffset', 0) + a.get('byteOffset', 0)
        stride = v.get('byteStride'); size = NC[a['type']]; dt = np.dtype(CT[a['componentType']])
        if stride and stride != size * dt.itemsize:
            out = np.stack([np.frombuffer(binary, dt, size, off + i * stride) for i in range(a['count'])])
        else:
            out = np.frombuffer(binary, dt, a['count'] * size, off).reshape(a['count'], size)
        if a.get('normalized'): out = out.astype(np.float32) / NORM[a['componentType']]
        elif a['componentType'] != 5126 and a['componentType'] in NORM and size > 1: out = out.astype(np.float32)
        return out
    return g, binary, acc


def image(g, binary, tex_index):
    tex = g['textures'][tex_index]; src = (tex.get('extensions') or {}).get('EXT_texture_webp', {}).get('source', tex.get('source'))
    v = g['bufferViews'][g['images'][src]['bufferView']]; o = v.get('byteOffset', 0)
    return np.asarray(Image.open(io.BytesIO(binary[o:o + v['byteLength']])).convert('RGBA'))


def sample(entry):
    g, binary, acc = load(ROOT / entry['path'])
    eyes = (g.get('extras') or {}).get('eyes') or []
    ey = float(np.mean([e[1] for e in eyes])) if eyes else None
    pix = []
    for prim in g['meshes'][0]['primitives']:
        mat = g['materials'][prim['material']]
        if not (mat.get('extras') or {}).get('next90Skin'): continue
        tex = (mat.get('pbrMetallicRoughness') or {}).get('baseColorTexture')
        if not tex: continue
        node = next((nd for nd in g['nodes'] if nd.get('mesh') == 0), {}); sc = np.array(node.get('scale', [1, 1, 1]), np.float32); tr = np.array(node.get('translation', [0, 0, 0]), np.float32)
        P = acc(prim['attributes']['POSITION']).astype(np.float32) * sc + tr  # KHR_mesh_quantization: int16 positions, node scale -> metres
        UV = acc(prim['attributes']['TEXCOORD_0']); N = acc(prim['attributes']['NORMAL']).astype(np.float32); N = N / np.maximum(1e-6, np.linalg.norm(N, axis=1, keepdims=True))
        im = image(g, binary, tex['index']); h, w = im.shape[:2]
        y0 = ey if ey is not None else float(np.percentile(P[:, 1], 70))
        sel = (N[:, 2] > .55) & (np.abs(P[:, 0]) > .022) & (np.abs(P[:, 0]) < .055) & (P[:, 1] < y0 - .02) & (P[:, 1] > y0 - .06)
        for u, v in UV[sel]:
            px = im[min(h - 1, max(0, int(v * h))), min(w - 1, max(0, int((u % 1) * w)))]
            if px[3] >= 128 and 25 < px[:3].max() < 250: pix.append(px[:3])
    if len(pix) < 12: return None, len(pix)
    return np.median(np.asarray(pix, float), axis=0).round().astype(int).tolist(), len(pix)


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--write', action='store_true'); ap.add_argument('--only'); a = ap.parse_args()
    mp = ROOT / 'assets/heads/manifest.json'; man = json.loads(mp.read_text()); only = set(a.only.split(',')) if a.only else None
    done = skipped = 0
    for e in man['players']:
        if e.get('disabledReason') or (only and e['sourceId'] not in only): continue
        rgb, n = sample(e)
        if rgb is None: skipped += 1; continue
        if only: print(e['name'], 'old', e.get('skinRGB'), 'new', rgb, 'samples', n)
        e['skinRGB'] = rgb; e['skinSample'] = 'cheeks-v264'; done += 1
    print('resampled', done, 'kept (too few cheek samples)', skipped)
    if a.write: mp.write_text(json.dumps(man, ensure_ascii=False, indent=2) + '\n')


if __name__ == '__main__':
    main()
