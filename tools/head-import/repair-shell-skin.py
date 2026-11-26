#!/usr/bin/env python3
"""V253 repair for PES heads whose only skin material is the alpha-tested head *shell*.

Some community face folders ship without their own face texture; the converter then mapped every skin primitive to the
shell texture (face_bsm_alp, 512 px, alpha 0 over the face). With alpha-test the face became see-through (holes in
cheeks/temples, empty face). The shell texture's RGB still holds a low-resolution face, so the repair:

* drops alpha-test/double-siding from the skin materials (opaque, front-facing like every healthy head);
* softens the block artefacts only where the source alpha hid the face (alpha < 128), keeping hairline/ears untouched;
* rewrites the gz GLB and the manifest entry (bytes, rawBytes, sha256, repair note). Geometry is untouched.

Heads that stay unusable after visual review are not repaired here but disabled with --disable (manifest
`disabledReason`; the runtime skips them and the player keeps the standard head). Usage:
  python3 tools/head-import/repair-shell-skin.py --repair 4522 --disable 147950:"..." --disable 179090:"..."
"""
import argparse, gzip, hashlib, io, json, pathlib, struct
from PIL import Image, ImageFilter

ROOT = pathlib.Path(__file__).resolve().parents[2]


def read_glb(raw):
    assert struct.unpack('<I', raw[:4])[0] == 0x46546C67
    n = struct.unpack('<I', raw[12:16])[0]
    return json.loads(raw[20:20 + n]), raw[20 + n:]


def write_glb(doc, bin_chunk_with_header):
    js = json.dumps(doc, separators=(',', ':')).encode()
    js += b' ' * (-len(js) % 4)
    body = struct.pack('<II', len(js), 0x4E4F534A) + js + bin_chunk_with_header
    return struct.pack('<III', 0x46546C67, 2, 12 + len(body)) + body


def repair(entry):
    path = ROOT / entry['path']
    raw = gzip.decompress(path.read_bytes())
    doc, rest = read_glb(raw)
    blen, btype = struct.unpack('<II', rest[:8])
    assert btype == 0x004E4942
    binary = bytearray(rest[8:8 + blen])
    skins = [m for m in doc['materials'] if (m.get('extras') or {}).get('next90Skin')]
    assert skins and all(m.get('alphaMode') == 'MASK' for m in skins), 'not a shell-only skin head'
    tex_ids = set()
    for m in skins:
        m.pop('alphaMode', None); m.pop('alphaCutoff', None); m['doubleSided'] = False
        tex_ids.add(m['pbrMetallicRoughness']['baseColorTexture']['index'])
    # re-encode each shell texture (appended as a new buffer view so offsets of other views are untouched)
    for ti in sorted(tex_ids):
        tex = doc['textures'][ti]
        src = (tex.get('extensions') or {}).get('EXT_texture_webp', {}).get('source', tex.get('source'))
        img = doc['images'][src]; view = doc['bufferViews'][img['bufferView']]
        start = view.get('byteOffset', 0)
        im = Image.open(io.BytesIO(bytes(binary[start:start + view['byteLength']]))).convert('RGBA')
        rgb, alpha = im.convert('RGB'), im.getchannel('A')
        soft = rgb.filter(ImageFilter.GaussianBlur(2.2))
        mask = alpha.point(lambda a: 255 if a < 128 else 0).filter(ImageFilter.GaussianBlur(3))
        out = Image.composite(soft, rgb, mask)
        buf = io.BytesIO(); out.save(buf, 'WEBP', quality=92, method=6)
        data = buf.getvalue()
        while len(binary) % 4: binary.append(0)
        view.clear(); view.update({'buffer': 0, 'byteOffset': len(binary), 'byteLength': len(data)})
        binary.extend(data)
        img['mimeType'] = 'image/webp'
    while len(binary) % 4: binary.append(0)
    doc['buffers'][0]['byteLength'] = len(binary)
    doc.setdefault('extras', {})['repair'] = 'v253-shell-only-skin-opaque'
    glb = write_glb(doc, struct.pack('<II', len(binary), 0x004E4942) + bytes(binary))
    gz = gzip.compress(glb, 9, mtime=0)
    path.write_bytes(gz)
    entry.update(bytes=len(gz), rawBytes=len(glb), sha256=hashlib.sha256(gz).hexdigest(),
                 repair='V253: source shipped only the alpha-tested head shell as skin (holes in the face); skin made opaque, face blocks softened. Geometry unchanged.')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--repair', action='append', default=[])
    ap.add_argument('--disable', action='append', default=[], help='sourceId:reason')
    a = ap.parse_args()
    mpath = ROOT / 'assets/heads/manifest.json'
    manifest = json.loads(mpath.read_text())
    by = {e['sourceId']: e for e in manifest['players']}
    for sid in a.repair:
        repair(by[sid]); print('REPAIRED', sid, by[sid]['name'])
    for item in a.disable:
        sid, reason = item.split(':', 1)
        by[sid]['disabledReason'] = reason; print('DISABLED', sid, by[sid]['name'])
    mpath.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')


if __name__ == '__main__':
    main()
