#!/usr/bin/env python3
"""V126 player appearance from FotMob headshots (192x192 transparent cut-outs).

Estimates, per player: skin tone, hair colour, hair style (bald / cropped / short / long / coils / receding),
beard preset (0-3) and beard colour. Writes appearance.profile into assets/club-rosters-v75.json for the selected
teams. Existing face-morph values are kept; only the colour/hair/beard fields are replaced. Each estimate stores
its evidence (fractions) so a later review can see why it was chosen.

Usage: python3 tools/appearance-from-photos.py [--all] [--only "Team A,Team B"] [--dry]
Photos are cached in tools/.photo-cache (git-ignored)."""
import io, json, os, sys, time, urllib.request, colorsys, statistics
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROSTERS = os.path.join(ROOT, 'assets', 'club-rosters-v75.json')
CACHE = os.path.join(ROOT, 'tools', '.photo-cache')
BIG = {'tr.1': ['Galatasaray', 'Fenerbahçe', 'Beşiktaş', 'Trabzonspor', 'Başakşehir'],
       'en.1': ['Arsenal', 'Liverpool', 'Manchester City', 'Manchester United', 'Chelsea', 'Tottenham', 'Newcastle', 'Aston Villa'],
       'es.1': ['Real Madrid', 'Barcelona', 'Atlético', 'Athletic', 'Villarreal', 'Real Betis', 'Real Sociedad'],
       'de.1': ['Bayern', 'Dortmund', 'Leverkusen', 'Leipzig', 'Stuttgart', 'Frankfurt'],
       'it.1': ['Inter', 'Milan', 'Juventus', 'Napoli', 'Roma', 'Atalanta', 'Lazio'],
       'fr.1': ['Paris Saint', 'Marseille', 'Monaco', 'Lyon', 'Lille'],
       'ucl': [''], 'uel': [], 'uecl': []}

def fetch(fid):
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, '%s.png' % fid)
    if not os.path.exists(path):
        url = 'https://images.fotmob.com/image_resources/playerimages/%s.png' % fid
        raw = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'next90sim-appearance/1.0'}), timeout=20).read()
        open(path, 'wb').write(raw); time.sleep(.15)
    return Image.open(path).convert('RGBA')

def is_skin(r, g, b):
    y = .299 * r + .587 * g + .114 * b
    cr = (r - y) * .713 + 128; cb = (b - y) * .564 + 128
    return 133 <= cr <= 180 and 75 <= cb <= 130 and r > g * .92 and r >= b and y > 25

def hexc(rgb): return '#%02x%02x%02x' % tuple(int(max(0, min(255, v))) for v in rgb)

def med(px): return tuple(statistics.median(c) for c in zip(*px)) if px else None

def analyse(im):
    W, H = im.size; P = im.load()
    rows = [y for y in range(H) if any(P[x, y][3] > 128 for x in range(W // 4, 3 * W // 4))]
    if not rows: return None
    top = rows[0]
    # Face: skin pixels in the middle band.
    face = [P[x, y][:3] for y in range(int(H * .38), int(H * .62)) for x in range(int(W * .36), int(W * .64)) if P[x, y][3] > 200 and is_skin(*P[x, y][:3])]
    if len(face) < 80: return None
    skin = med(face)
    sk_l = sum(skin) / 3
    def near_skin(c):
        return abs(c[0] - skin[0]) + abs(c[1] - skin[1]) + abs(c[2] - skin[2]) < 75 and is_skin(*c)
    # Crown band: first 12% of head height, central 50%.
    head_h = H * .62 - top
    crown = [P[x, y][:3] for y in range(top, top + max(6, int(head_h * .16))) for x in range(int(W * .3), int(W * .7)) if P[x, y][3] > 200]
    crown_skin = sum(1 for c in crown if near_skin(c)) / max(1, len(crown))
    hair_px = [c for c in crown if not near_skin(c)]
    hair = med(hair_px) if len(hair_px) > 20 else None
    # Hair thickness above the forehead: first skin row on the centre column.
    cx = W // 2; first_skin = None
    for y in range(top, int(H * .6)):
        if P[cx, y][3] > 200 and near_skin(P[cx, y][:3]):
            run = all(P[cx, yy][3] > 200 and near_skin(P[cx, yy][:3]) for yy in range(y, min(H, y + 4)))
            if run: first_skin = y; break
    thickness = (first_skin - top) if first_skin is not None else 0
    # Forehead sides (temples) vs centre: receding hairline shows skin at the temples high up.
    def frac(x0, x1, y0, y1, pred):
        px = [P[x, y][:3] for y in range(y0, y1) for x in range(x0, x1) if P[x, y][3] > 200]
        return sum(1 for c in px if pred(c)) / max(1, len(px))
    hairlike = (lambda c: hair is not None and abs(c[0] - hair[0]) + abs(c[1] - hair[1]) + abs(c[2] - hair[2]) < 90 and not near_skin(c))
    sides = (frac(int(W * .12), int(W * .3), int(H * .5), int(H * .8), hairlike) + frac(int(W * .7), int(W * .88), int(H * .5), int(H * .8), hairlike)) / 2
    temples = (frac(int(W * .33), int(W * .42), top + int(head_h * .18), top + int(head_h * .3), near_skin) + frac(int(W * .58), int(W * .67), top + int(head_h * .18), top + int(head_h * .3), near_skin)) / 2
    # Head silhouette width at the crown relative to face width: big afro/coils.
    def width(y): xs = [x for x in range(W) if P[x, y][3] > 128]; return (xs[-1] - xs[0]) if xs else 0
    crown_w = width(top + int(head_h * .12)); face_w = width(int(H * .45))
    # Texture of the hair region (coils/twists are high-frequency).
    tex = 0.0
    if len(hair_px) > 40:
        ls = [sum(c) / 3 for c in hair_px]; tex = statistics.pstdev(ls)
    beard_band = [P[x, y][:3] for y in range(int(H * .7), int(H * .86)) for x in range(int(W * .38), int(W * .62)) if P[x, y][3] > 200]
    beard_dark = sum(1 for c in beard_band if not near_skin(c) and sum(c) / 3 < sk_l * .82) / max(1, len(beard_band))
    # Decisions.
    if crown_skin > .62 and thickness < 4: style = 'bald'
    elif crown_skin > .38 and thickness < 7: style = 'cropped'
    elif temples > .55 and thickness < 16: style = 'receding'
    elif sides > .3: style = 'long'
    elif hair is not None and sum(hair) / 3 < 70 and (crown_w > face_w * 1.02 or thickness > 22) and tex > 14: style = 'coils'
    elif thickness < 9: style = 'cropped'
    else: style = 'short'
    beard = 0 if beard_dark < .08 else 1 if beard_dark < .2 else 2 if beard_dark < .38 else 3
    hair_rgb = hair or tuple(v * .35 for v in skin)
    if style == 'bald': hair_rgb = tuple(v * .55 for v in skin)
    return {'skinTone': hexc(skin), 'hairColor': hexc(hair_rgb), 'hairStyle': style, 'beardPreset': beard,
            'beardColor': hexc(tuple(v * .9 for v in hair_rgb)),
            'evidence': {'crownSkin': round(crown_skin, 2), 'thickness': thickness, 'sides': round(sides, 2), 'temples': round(temples, 2),
                         'crownWidthRatio': round(crown_w / max(1, face_w), 2), 'hairTexture': round(tex, 1), 'beardDark': round(beard_dark, 2)}}

def selected(team, all_teams):
    if all_teams: return True
    names = BIG.get(team.get('competitionId'), [])
    return any(n and n.lower() in team.get('name', '').lower() for n in names)

LABELS = os.path.join(ROOT, 'tools', 'appearance-labels-v126.json')

def main():
    all_teams = '--all' in sys.argv; dry = '--dry' in sys.argv
    labels = json.load(open(LABELS, encoding='utf-8'))['players'] if os.path.exists(LABELS) else {}
    only = None
    if '--only' in sys.argv: only = [x.strip().lower() for x in sys.argv[sys.argv.index('--only') + 1].split(',')]
    doc = json.load(open(ROSTERS, encoding='utf-8'))
    stats = {'teams': 0, 'players': 0, 'updated': 0, 'noPhoto': 0, 'unreadable': 0}; styles = {}
    for key, t in doc['teams'].items():
        if only and not any(o in t.get('name', '').lower() for o in only): continue
        if not only and not selected(t, all_teams): continue
        stats['teams'] += 1
        for p in t['team'].get('players', []) + t['team'].get('bench', []):
            stats['players'] += 1
            fid = (p.get('providerIds') or {}).get('fotmob') or (str(p.get('id', ''))[3:] if str(p.get('id', '')).startswith('fm-') else None)
            if not fid: stats['noPhoto'] += 1; continue
            try: res = analyse(fetch(fid))
            except Exception: res = None
            if not res: stats['unreadable'] += 1; continue
            lab = labels.get(str(p.get('id')))
            if lab:  # reviewed hair style / beard win over the heuristic
                res['hairStyle'] = lab['hairStyle']; res['beardPreset'] = lab['beardPreset']; res['evidence']['reviewed'] = True
                if lab['hairStyle'] == 'bald':
                    res['hairColor'] = hexc(tuple(int(res['skinTone'][i:i + 2], 16) * .55 for i in (1, 3, 5)))
            elif not all_teams and not only:
                continue
            styles[res['hairStyle']] = styles.get(res['hairStyle'], 0) + 1
            if dry: print(p['name'], res['hairStyle'], res['skinTone'], res['hairColor'], res['beardPreset'], res['evidence']); continue
            app = p.get('appearance') or {}
            prof = dict(app.get('profile') or {})
            for k in ('skinTone', 'hairColor', 'hairStyle', 'beardPreset', 'beardColor'): prof[k] = res[k]
            prof.setdefault('bodyType', 'athletic'); prof.setdefault('shoulderWidth', 1)
            app['profile'] = prof
            app['appearanceSource'] = 'fotmob-headshot-v126' + ('-reviewed' if res['evidence'].get('reviewed') else '-auto')
            app['appearanceEvidence'] = res['evidence']
            app.setdefault('source', 'photo-colour-estimate'); app.setdefault('reviewed', False)
            p['appearance'] = app; stats['updated'] += 1
    if not dry: json.dump(doc, open(ROSTERS, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(json.dumps({**stats, 'styles': styles}, ensure_ascii=False))

if __name__ == '__main__':
    main()
