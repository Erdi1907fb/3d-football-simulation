#!/usr/bin/env python3
"""V254 body builds from the public EA SPORTS FC 26 player dataset (community CSV, snapshot 2025-09-21).

Only a three-way render category is derived and shipped (slim / athletic / muscular); the CSV itself is not committed.
Identity guard (same spirit as the head importers): a game player is matched only when
  * the CSV row has exactly the player's date of birth, and
  * the normalised surname (last token of the game name or of a full-name alias) appears in the CSV long_name, and
  * exactly one CSV row satisfies both.
Mapping: Lean -> slim, Normal -> athletic, Stocky -> muscular; 'Unique' bodies use the CSV height/weight
(BMI < 21.5 slim, > 24.3 muscular, else athletic). Measurements already in the game are never changed.

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
    t = row['body_type'].split(' ')[0]
    if t == 'Lean': return 'slim'
    if t == 'Stocky': return 'muscular'
    if t == 'Normal': return 'athletic'
    try:
        h, w = float(row['height_cm']) / 100, float(row['weight_kg'])
        bmi = w / (h * h)
    except Exception:
        return None
    return 'slim' if bmi < 21.5 else 'muscular' if bmi > 24.3 else 'athletic'


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
        b = build(hits[0])
        if not b: stats['no-build'] += 1; continue
        players[pid] = [b[0], dob]; stats['matched'] += 1; stats['build-' + b] += 1
    out = {'schema': 1, 'source': 'EA SPORTS FC 26 player dataset (community CSV, 2025-09-21 snapshot): body_type mapped to a render build only',
           'codes': {'s': 'slim', 'm': 'muscular'}, 'note': 'athletic is the runtime default and is not stored',
           'players': dict(sorted((k, v) for k, v in players.items() if v[0] != 'a'))}
    if a.write: (ROOT / 'assets/player-builds.json').write_text(json.dumps(out, separators=(',', ':')) + '\n')
    print(json.dumps(dict(stats)))


if __name__ == '__main__':
    main()
