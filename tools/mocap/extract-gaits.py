#!/usr/bin/env python3
"""V256 locomotion curves from real motion capture (100STYLE 'Neutral', CC BY 4.0, Ian Mason).

The match engine keeps root motion, gait phase and every contact pose. This tool only turns the recorded walking and
running of one real person into normalised, phase-aligned curves that the procedural rig follows:

* BVH (XSens, cm, Y up, Z forward) -> forward kinematics for every frame inside the dataset's own clean cut window;
* the heading frame is the pelvis (hip-to-hip axis), so turns in the capture path do not leak into the curves;
* gait cycles start at left-foot contact (lowest, slowest left toe); each cycle is resampled to N samples and the
  per-sample median over all cycles becomes the curve (averages out capture noise, keeps the human shape);
* feet: forward/lateral offsets normalised by the cycle's half stride, height by hip height; foot pitch;
  pelvis: bob (by hip height), sway, yaw, roll; trunk: forward lean and counter-twist; arms: shoulder swing,
  abduction, elbow bend; head pitch. Side-stepping clips are mirrored to "moving to the actor's right".

Usage: python3 tools/mocap/extract-gaits.py --dir <folder with Neutral_*.bvh and Frame_Cuts.csv> [--write]
Data: https://zenodo.org/records/8127870 (100STYLE.zip, Neutral folder only; ~12 MB read by byte range).
"""
import argparse, csv, json, math, pathlib, re
import numpy as np

ROOT = pathlib.Path(__file__).resolve().parents[2]
N = 64


def parse_bvh(path):
    text = pathlib.Path(path).read_text()
    head, motion = text.split('MOTION', 1)
    joints, stack, order = [], [], []
    for line in head.splitlines():
        t = line.split()
        if not t: continue
        if t[0] in ('ROOT', 'JOINT'):
            joints.append({'name': t[1], 'parent': stack[-1] if stack else -1, 'offset': None, 'channels': []}); order.append(len(joints) - 1)
        elif t[0] == 'End':
            joints.append({'name': joints[stack[-1]]['name'] + '_end', 'parent': stack[-1], 'offset': None, 'channels': []}); order.append(len(joints) - 1)
        elif t[0] == '{': stack.append(order[-1])
        elif t[0] == '}': stack.pop()
        elif t[0] == 'OFFSET': joints[stack[-1]]['offset'] = np.array([float(x) for x in t[1:4]])
        elif t[0] == 'CHANNELS': joints[stack[-1]]['channels'] = t[2:]
    lines = motion.strip().splitlines()
    frames = int(lines[0].split()[1]); dt = float(lines[1].split()[2])
    data = np.array([[float(x) for x in l.split()] for l in lines[2:2 + frames]])
    return joints, data, dt


def rot(axis, deg):
    a = math.radians(deg); c, s = math.cos(a), math.sin(a)
    if axis == 'X': return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])
    if axis == 'Y': return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])


def fk(joints, data):
    F = len(data); P = np.zeros((F, len(joints), 3)); R = np.zeros((F, len(joints), 3, 3))
    for f in range(F):
        col = 0
        for j, jt in enumerate(joints):
            local = np.eye(3); pos = jt['offset'].copy()
            for ch in jt['channels']:
                v = data[f, col]; col += 1
                if ch.endswith('position'): pos[{'X': 0, 'Y': 1, 'Z': 2}[ch[0]]] = v
                else: local = local @ rot(ch[0], v)
            if jt['parent'] < 0: R[f, j] = local; P[f, j] = pos
            else:
                p = jt['parent']; R[f, j] = R[f, p] @ local; P[f, j] = P[f, p] + R[f, p] @ pos
    return P / 100.0, R  # metres


def idx(joints, name): return [j['name'] for j in joints].index(name)


def ang(v): return math.atan2(v[0], v[2])


NAMES = ('Hips', 'LeftHip', 'RightHip', 'LeftToe', 'RightToe', 'LeftAnkle', 'RightAnkle', 'Chest3', 'Neck', 'Head',
         'LeftShoulder', 'RightShoulder', 'LeftElbow', 'RightElbow', 'LeftWrist', 'RightWrist')


def load_bvh(path, start, stop):
    joints, data, dt = parse_bvh(path)
    P, _ = fk(joints, data[start:stop])
    return {n: P[:, idx(joints, n)] for n in NAMES}, dt


ACCAD = {'Hips': 'Hips', 'LeftHip': 'LeftUpLeg', 'RightHip': 'RightUpLeg', 'LeftToe': 'LeftToeBase', 'RightToe': 'RightToeBase', 'LeftAnkle': 'LeftFoot',
         'RightAnkle': 'RightFoot', 'Chest3': 'Spine1', 'Neck': 'Neck', 'Head': 'Head', 'LeftShoulder': 'LeftArm', 'RightShoulder': 'RightArm',
         'LeftElbow': 'LeftForeArm', 'RightElbow': 'RightForeArm', 'LeftWrist': 'LeftHand', 'RightWrist': 'RightHand'}


def load_accad(path):
    """ACCAD BVH (metres, 30 fps), mapped to the 100STYLE joint names used above."""
    joints, data, dt = parse_bvh(path)
    P, _ = fk(joints, data); names = [j['name'] for j in joints]
    return {n: P[:, names.index(m)] for n, m in ACCAD.items()}, dt


def euler(rx, ry, rz):
    return rot('Z', rz) @ rot('Y', ry) @ rot('X', rx)


def load_amc(asf, amcs):
    """CMU ASF/AMC (VICON, 120 fps). Positions at bone ends; length unit 1/0.45 inch."""
    text = pathlib.Path(asf).read_text(); bones = {}; cur = None
    for line in text.split(':bonedata', 1)[1].split(':hierarchy', 1)[0].splitlines():
        t = line.split()
        if not t: continue
        if t[0] == 'begin': cur = {'dof': []}
        elif t[0] == 'end': bones[cur['name']] = cur
        elif t[0] == 'name': cur['name'] = t[1]
        elif t[0] == 'direction': cur['dir'] = np.array([float(x) for x in t[1:4]])
        elif t[0] == 'length': cur['len'] = float(t[1]) / 0.45 * 0.0254
        elif t[0] == 'axis': cur['axis'] = [float(x) for x in t[1:4]]
        elif t[0] == 'dof': cur['dof'] = t[1:]
    parent = {}
    for line in text.split(':hierarchy', 1)[1].splitlines():
        t = line.split()
        if t and t[0] not in ('begin', 'end'):
            for c in t[1:]: parent[c] = t[0]
    order = ['root']; k = 0
    while k < len(order):
        order += [c for c, p in parent.items() if p == order[k]]; k += 1
    frames = []
    for amc in amcs:
        cur = None
        for line in pathlib.Path(amc).read_text().splitlines():
            t = line.split()
            if not t or t[0].startswith(('#', ':')): continue
            if t[0].isdigit(): cur = {}; frames.append(cur); continue
            cur[t[0]] = [float(x) for x in t[1:]]
    out = {n: np.zeros((len(frames), 3)) for n in NAMES}
    end_of = {'LeftHip': 'lhipjoint', 'RightHip': 'rhipjoint', 'LeftAnkle': 'ltibia', 'RightAnkle': 'rtibia', 'LeftToe': 'lfoot',
              'RightToe': 'rfoot', 'Chest3': 'upperback', 'Neck': 'thorax', 'Head': 'upperneck', 'LeftShoulder': 'lclavicle',
              'RightShoulder': 'rclavicle', 'LeftElbow': 'lhumerus', 'RightElbow': 'rhumerus', 'LeftWrist': 'lradius', 'RightWrist': 'rradius'}
    for f, fr in enumerate(frames):
        r = fr['root']; R = {'root': euler(*r[3:6])}; Pp = {'root': np.array(r[:3]) / 0.45 * 0.0254}
        for b in order[1:]:
            bd = bones[b]; C = euler(*bd['axis']); vals = dict(zip(bd['dof'], fr.get(b, [])))
            M = euler(vals.get('rx', 0), vals.get('ry', 0), vals.get('rz', 0))
            R[b] = R[parent[b]] @ C @ M @ C.T
            Pp[b] = Pp[parent[b]] + R[b] @ (bd['dir'] * bd['len'])
        out['Hips'][f] = Pp['root']
        for n, b in end_of.items(): out[n][f] = Pp[b]
    return out, 1 / 120


def _collect(src, mirror_side=False):
    Pn, dt = src
    F = len(Pn['Hips'])
    hipH = float(np.median(Pn['Hips'][:, 1] - np.minimum(Pn['LeftToe'][:, 1], Pn['RightToe'][:, 1]).min()))
    floor = float(np.percentile(np.minimum(Pn['LeftToe'][:, 1], Pn['RightToe'][:, 1]), 2))
    for n in Pn: Pn[n] = Pn[n] - np.array([0, floor, 0])
    hipH = float(np.median(Pn['Hips'][:, 1]))
    # heading frame from the pelvis: x = left hip direction (actor's left), z = forward (BVH: left side +X, forward +Z)
    across = Pn['LeftHip'] - Pn['RightHip']; across[:, 1] = 0; across /= np.linalg.norm(across, axis=1, keepdims=True)
    fwd = np.stack([-across[:, 2], np.zeros(F), across[:, 0]], 1)  # rotate +90 deg about Y: left->forward
    # smooth heading (pelvis yaw oscillates within a stride; the frame should follow the path, not the stride)
    k = 31; ker = np.ones(k) / k
    fs = np.stack([np.convolve(np.pad(fwd[:, i], k // 2, mode='edge'), ker, 'valid') for i in range(3)], 1); fs /= np.linalg.norm(fs, axis=1, keepdims=True)
    ls = np.stack([fs[:, 2], np.zeros(F), -fs[:, 0]], 1)
    def local(v, origin):
        d = v - origin; return np.stack([(d * ls).sum(1), d[:, 1], (d * fs).sum(1)], 1)
    ground = np.stack([Pn['Hips'][:, 0], np.zeros(F), Pn['Hips'][:, 2]], 1)
    vel = np.gradient(Pn['Hips'], dt, axis=0); vel[:, 1] = 0
    speed = float(np.median(np.linalg.norm(vel, axis=1)))
    vloc = np.stack([(vel * ls).sum(1), (vel * fs).sum(1)], 1)
    move = np.median(vloc, 0) / max(1e-6, np.linalg.norm(np.median(vloc, 0)))
    mirror = mirror_side and move[0] > 0  # side clips: normalise to moving towards the actor's right (-x local)
    S = -1 if mirror else 1
    L = {n: local(Pn[j], ground) for n, j in [('lt', 'LeftToe'), ('rt', 'RightToe'), ('la', 'LeftAnkle'), ('ra', 'RightAnkle')]}
    if mirror: L = {'lt': L['rt'] * [-1, 1, 1], 'rt': L['lt'] * [-1, 1, 1], 'la': L['ra'] * [-1, 1, 1], 'ra': L['la'] * [-1, 1, 1]}
    # left contacts: left toe+ankle low and slow
    lh = np.minimum(L['lt'][:, 1], L['la'][:, 1]); lv = np.linalg.norm(np.gradient(Pn['LeftToe' if not mirror else 'RightToe'], dt, axis=0), axis=1)
    contact = (lh < np.percentile(lh, 25) + .02) & (lv < np.percentile(lv, 35))
    starts = [i for i in range(1, F) if contact[i] and not contact[i - 1]]
    starts = [s for k2, s in enumerate(starts) if k2 == 0 or s - starts[k2 - 1] > int(.25 / dt)]
    cyc = [(a, b) for a, b in zip(starts, starts[1:]) if int(.35 / dt) <= b - a <= int(2.2 / dt)]
    def series():
        out = {}
        for n in ('lt', 'rt'):
            out[n + 'x'] = L[n][:, 0]; out[n + 'y'] = L[n][:, 1]; out[n + 'z'] = L[n][:, 2]
        def pitch_of(a, t):
            d = t - a; return np.arctan2(d[:, 1], np.hypot(d[:, 0], d[:, 2]))
        out['lpitch'] = pitch_of(L['la'], L['lt']); out['rpitch'] = pitch_of(L['ra'], L['rt'])
        hl = local(Pn['Hips'], ground); out['bob'] = hl[:, 1] - hipH; out['sway'] = hl[:, 0] * S
        pel = local(Pn['LeftHip'], ground) - local(Pn['RightHip'], ground)
        out['pyaw'] = np.arctan2(-pel[:, 2], pel[:, 0]) * S; out['proll'] = np.arctan2(pel[:, 1], pel[:, 0]) * S
        tr = local(Pn['Neck'], ground) - local(Pn['Hips'], ground); out['lean'] = np.arctan2(tr[:, 2], tr[:, 1]); out['tilt'] = np.arctan2(tr[:, 0], tr[:, 1]) * S
        sh = local(Pn['LeftShoulder'], ground) - local(Pn['RightShoulder'], ground); out['tyaw'] = np.arctan2(-sh[:, 2], sh[:, 0]) * S
        for side, s0, e0, w0 in (('l', 'LeftShoulder', 'LeftElbow', 'LeftWrist'), ('r', 'RightShoulder', 'RightElbow', 'RightWrist')):
            ua = local(Pn[e0], ground) - local(Pn[s0], ground); fa = local(Pn[w0], ground) - local(Pn[e0], ground)
            swing = np.arctan2(ua[:, 2], -ua[:, 1]); abd = np.arctan2(np.abs(ua[:, 0]), -ua[:, 1])
            elbow = np.arccos(np.clip((ua * fa).sum(1) / (np.linalg.norm(ua, axis=1) * np.linalg.norm(fa, axis=1)), -1, 1))
            out[side + 'swing'], out[side + 'abd'], out[side + 'elbow'] = swing, abd, elbow
        if mirror:
            for a, b in (('lswing', 'rswing'), ('labd', 'rabd'), ('lelbow', 'relbow')): out[a], out[b] = out[b].copy(), out[a].copy()
        hd = local(Pn['Head'], ground) - local(Pn['Neck'], ground); out['hpitch'] = np.arctan2(hd[:, 2], hd[:, 1])
        return out
    sr = series(); cycles = []; strides = []
    for a, b in cyc:
        t = np.linspace(a, b, N, endpoint=False)
        cycles.append({k2: np.interp(t, np.arange(F), v) for k2, v in sr.items()})
        d = Pn['Hips'][b] - Pn['Hips'][a]; d[1] = 0; strides.append(float(np.linalg.norm(d)))
    return {'cycles': cycles, 'strides': strides, 'speed': speed, 'hipH': hipH, 'move': move, 'mirror': mirror, 'durs': [(b - a) * dt for a, b in cyc]}


def extract(srcs, mirror_side=False):
    """Cycles are found inside each recording (never across a cut) and pooled before the per-sample median."""
    parts = [_collect(s, mirror_side) for s in (srcs if isinstance(srcs, list) else [srcs])]
    cycles = [c for p in parts for c in p['cycles']]; strides = [x for p in parts for x in p['strides']]
    if not cycles: raise SystemExit('no gait cycles found')
    sr = cycles[0]; hipH = float(np.median([p['hipH'] for p in parts])); move = np.mean([p['move'] for p in parts], 0); move /= np.linalg.norm(move)
    mirror = any(p['mirror'] for p in parts); speed = float(np.median([p['speed'] for p in parts]))
    cyc = [None] * len(cycles); durs = [x for p in parts for x in p['durs']]
    med = {k2: np.median(np.stack([c[k2] for c in cycles]), 0) for k2 in sr}
    stride = float(np.median(strides)); half = stride / 2
    # normalise: feet forward/lateral by half stride (centred), heights by hip height
    for n in ('lt', 'rt'):
        med[n + 'z'] = (med[n + 'z'] - np.mean(med[n + 'z'])) / max(1e-6, half) if abs(move[1]) >= abs(move[0]) else (med[n + 'z'] - np.mean(med[n + 'z'])) / hipH
        med[n + 'x'] = (med[n + 'x'] - np.mean(med[n + 'x'])) / (max(1e-6, half) if abs(move[0]) > abs(move[1]) else hipH)
        med[n + 'y'] = (med[n + 'y'] - np.min(med[n + 'y'])) / hipH
    med['bob'] = (med['bob'] - np.mean(med['bob'])) / hipH; med['sway'] = (med['sway'] - np.mean(med['sway'])) / hipH
    for k2 in ('pyaw', 'proll', 'tyaw', 'tilt'): med[k2] = med[k2] - np.mean(med[k2])
    dur = float(np.median(durs))
    return {'cycles': len(cyc), 'speed': round(speed, 3), 'stride': round(stride, 3), 'hipHeight': round(hipH, 3), 'cycleSeconds': round(dur, 3),
            'direction': [round(float(move[0]) * (-1 if mirror else 1), 2), round(float(move[1]), 2)], 'mirrored': bool(mirror),
            'curves': {k2: [round(float(x), 4) for x in v] for k2, v in med.items()}}




def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--dir', required=True); ap.add_argument('--cmu'); ap.add_argument('--accad', help='dir with ACCAD Male1_C03_Run.bvh, Male2_C3_Run.bvh, Female1_C03_Run.bvh (V264 sprint)'); ap.add_argument('--write', action='store_true'); a = ap.parse_args()
    d = pathlib.Path(a.dir)
    cuts = {r['STYLE_NAME']: r for r in csv.DictReader(open(d / 'Frame_Cuts.csv'))}['Neutral']
    gaits = {}
    for key, name, side in (('walk', 'FW', False), ('run', 'FR', False), ('backWalk', 'BW', False), ('backRun', 'BR', False), ('sideWalk', 'SW', True), ('sideRun', 'SR', True), ('idle', 'ID', False)):
        if key == 'idle': continue
        g = extract(load_bvh(d / f'Neutral_{name}.bvh', int(cuts[name + '_START']), int(cuts[name + '_STOP'])), side)
        gaits[key] = g; print(key, {k: v for k, v in g.items() if k != 'curves'})
    if a.cmu:
        c = pathlib.Path(a.cmu); srcs = [load_amc(c / '09.asf', [f]) for f in sorted(c.glob('09_*.amc')) if f.name not in ('09_12.amc', '09_10.amc')]  # 09_12 in-place take, 09_10 slow
        c35 = c.parent / 'cmu35'
        if (c35 / '35.asf').exists(): srcs += [load_amc(c35 / '35.asf', [f]) for f in sorted(c35.glob('35_*.amc'))]
        g = extract(srcs, False)
        gaits['sprint'] = g; print('sprint', {k: v for k, v in g.items() if k != 'curves'})
    if a.accad:
        # V264: ACCAD Open Motion Project runs (3.8-5.1 m/s, CC BY 3.0) replace the 3.5 m/s CMU sprint: 7 m/s stance slide 2.50 -> 1.71 m/s
        d2 = pathlib.Path(a.accad); srcs = [load_accad(d2 / f) for f in ('Male1_C03_Run.bvh', 'Male2_C3_Run.bvh', 'Female1_C03_Run.bvh')]
        g = extract(srcs, False); gaits['sprint'] = g; print('sprint (ACCAD)', {k: v for k, v in g.items() if k != 'curves'})
    out = {'schema': 1, 'samples': N, 'source': '100STYLE Neutral (Ian Mason, CC BY 4.0, https://zenodo.org/records/8127870); sprint: ' + ('ACCAD Open Motion Project, The Ohio State University (CC BY 3.0), Male1/Male2/Female1 run' if a.accad else 'CMU Graphics Lab Motion Capture Database subjects 9 and 35 (http://mocap.cs.cmu.edu, created with funding from NSF EIA-0196217)'),
           'credit': 'The 100STYLE Dataset - Ian Mason', 'gaits': gaits}
    if a.write:
        js = '/* Generated by tools/mocap/extract-gaits.py from the 100STYLE dataset (Ian Mason, CC BY 4.0)' + (' and ACCAD Open Motion Project runs (The Ohio State University, CC BY 3.0)' if a.accad else '') + '. Phase-normalised gait curves. */\n' \
             "(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f();else r.Next90MocapGaits=f();})(typeof globalThis!=='undefined'?globalThis:this,function(){return " + json.dumps(out, separators=(',', ':')) + ';});\n'
        (ROOT / 'assets/mocap-gaits.js').write_text(js)
        print('wrote', len(js), 'bytes')


if __name__ == '__main__':
    main()
