#!/usr/bin/env python3
"""V254 body builds from the public EA SPORTS FC 26 player dataset (community CSV, snapshot 2025-09-21).

Only three derived render coefficients are shipped per player (mass, upper-body strength, lower-body power, -1..1);\nno EA ratings and not the CSV itself.
Identity guard (same spirit as the head importers): a game player is matched only when
  * the CSV row has exactly the player's date of birth, and
  * the normalised surname (last token of the game name or of a full-name alias) appears in the CSV long_name, and
  * exactly one CSV row satisfies both.
mass: body_type (Lean/Normal/Stocky; Unique from BMI) plus a small BMI term; upper: strength; lower: sprint,
acceleration and jumping. Category for older code: mass <= -0.25 slim, >= 0.3 muscular. Game measurements unchanged.

Usage: python3 tools/body-import/fc26-builds.py --csv players.csv [--write]
Source: github.com/ismailoksuz/EAFC26-DataHub data/players.csv (same file as FC26_20250921.csv on Kaggle).
"""
import argparse, csv, glob, json, pathlib, re, unicodedata, collections

ROOT = pathlib.Path(__file__).resolve().parents[2]


def norm(s):
    s = (s or '').replace('ı', 'i').replace('İ', 'I').replace('ø', 'o').replace('Ø', 'O').replace('ß', 'ss').replace('đ', 'd').replace('ł', 'l').replace('æ', 'ae')
    s = ''.join(c for c in unicodedata.normalize('NFKD', s) if not unicodedata.combining(c))
    return re.sub(r'[^a-z ]+', ' ', s.lower()).split()


def build(row):
    """Return (m, u, l): mass, upper-body strength, lower-body power in -1..1 (0.1 steps). Ratings are not shipped."""
    def num(k, d=None):
        try: return float(row[k])
        except Exception: return d
    t = row['body_type'].split(' ')[0]
    h, w = num('height_cm'), num('weight_kg')
    bmi = w / ((h / 100) ** 2) if h and w else 23.0
    m = {'Lean': -0.45, 'Normal': 0.0, 'Stocky': 0.55}.get(t, max(-0.8, min(0.9, (bmi - 23.0) / 2.5)))
    m += max(-0.25, min(0.25, (bmi - 23.0) / 6))          # same category, heavier frame -> a little more mass
    strength, sprint, accel, jump, agility = (num(k, 65) for k in ('power_strength', 'movement_sprint_speed', 'movement_acceleration', 'power_jumping', 'movement_agility'))
    u = (strength - 68) / 18
    l = ((sprint + accel) / 2 * 0.65 + jump * 0.35 - 70) / 16
    m -= max(0.0, (agility - 80) / 60)                    # very agile players read lighter
    q = lambda x: round(max(-1.0, min(1.0, x)), 1)
    return q(m), q(u), q(l)


def category(m):
    return 'slim' if m <= -0.25 else 'muscular' if m >= 0.3 else 'athletic'


def identities():
    out = {}
    for f in sorted(glob.glob(str(ROOT / 'assets/player-profiles/*.json'))):
        d = json.load(open(f)); ps = d if isinstance(d, list) else d.get('players', [])
        for p in ps: out.setdefault(str(p['id']), p)
    reg = json.load(open(ROOT / 'assets/club-rosters-v75.json'))['teams']
    for t in reg.values():
        for p in (t['team'].get('players') or []) + (t['team'].get('bench') or []): out.setdefault(str(p['id']), p)
    return out


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--csv', required=True); ap.add_argument('--write', action='store_true'); a = ap.parse_args()
    rows = list(csv.DictReader(open(a.csv, encoding='utf-8')))
    by_dob = collections.defaultdict(list)
    for r in rows: by_dob[r['dob'][:10]].append((set(norm(r['long_name'])) | set(norm(r['short_name'])), r))
    players, stats = {}, collections.Counter()
    for pid, p in identities().items():
        dob = (p.get('dateOfBirth') or '')[:10]
        if not dob: stats['no-dob'] += 1; continue
        surnames = {norm(n)[-1] for n in [p.get('name')] + list(p.get('aliases') or []) if n and norm(n) and len(norm(n)[-1]) > 1}
        hits = [r for toks, r in by_dob.get(dob, []) if surnames & toks]
        if len(hits) != 1: stats['no-unique-match' if not hits else 'ambiguous'] += 1; continue
        m, u, l = build(hits[0]); c = category(m)
        players[pid] = [m, u, l, dob]; stats['matched'] += 1; stats['build-' + c] += 1
    out = {'schema': 2, 'source': 'EA SPORTS FC 26 player dataset (community CSV, 2025-09-21 snapshot): derived render build only, no ratings',
           'fields': ['mass', 'upper', 'lower', 'dateOfBirth'], 'range': [-1, 1], 'players': dict(sorted(players.items()))}
    if a.write: (ROOT / 'assets/player-builds.json').write_text(json.dumps(out, separators=(',', ':')) + '\n')
    print(json.dumps(dict(stats)))


if __name__ == '__main__':
    main()
