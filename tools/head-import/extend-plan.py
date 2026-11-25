#!/usr/bin/env python3
"""V248 plan extension for the FM27 RealFaces source (reproducible, identity-guarded).

Adds missing real heads for the big clubs of every league (and the whole Turkish Süper Lig) to
tools/head-import/fm27-plan.json. It never edits squads and never matches on a name alone:

* every candidate is a game identity (registry roster or verified player profile) with an ESPN id
  and full date of birth, and no existing head;
* the team's own spelling in the author CSV is found by vote: the CSV club of that team's players who
  already carry an FM27 head (falling back to unique full-name votes). At least 3 votes and a majority
  are required, otherwise the team is skipped;
* a CSV row is accepted only if its normalised full name (or a full-name alias) matches and its club
  is that team's CSV club, and exactly one such row exists. Abbreviated aliases ("M. Neuer") are not
  used. Anything else stays out (reported), exactly like the V245/V246 guards;
* national squads are only reached through a player's club identity; DOB is bound from the game data,
  never invented. The new-head budget is respected in priority order (first-team players first).

Usage: python3 tools/head-import/extend-plan.py --csv RealFaces-players.csv [--write] [--budget-mb 260] [--available-index stage/index-4.json ...]
"""
import argparse, csv, json, pathlib, unicodedata, collections, re

ROOT = pathlib.Path(__file__).resolve().parents[2]
AVG_BYTES = 300_000
TR_SUPER_LIG = ['galatasaray', 'fenerbahce', 'besiktas', 'trabzonspor', 'basaksehir', 'samsunspor', 'goztepe', 'kasimpasa',
                'eyupspor', 'alanyaspor', 'konyaspor', 'kocaelispor', 'gaziantep-fk', 'caykur-rizespor', 'genclerbirligi', 'antalyaspor']
BIG_CLUBS = ['real-madrid', 'barcelona', 'atletico', 'athletic', 'villarreal-cf', 'real-sociedad', 'real-betis', 'sevilla-fc',
             'man-city', 'liverpool', 'arsenal', 'man-utd', 'chelsea', 'tottenham', 'newcastle', 'aston-villa',
             'bayern', 'dortmund', 'leverkusen', 'leipzig', 'eintracht-frankfurt', 'vfb-stuttgart',
             'inter', 'milan', 'juventus', 'napoli', 'roma', 'lazio', 'atalanta', 'fiorentina',
             'psg', 'marseille', 'monaco', 'olympique-lyonnais', 'losc', 'ogc-nice', 'rc-lens',
             'benfica', 'porto', 'sporting', 'sc-braga', 'ajax', 'psv', 'feyenoord', 'az-alkmaar',
             'celtic', 'club-brugge', 'olympiacos', 'panathinaikos', 'shakhtar-donetsk', 'salzburg']

def norm(s):
    s = (s or '').replace('ı', 'i').replace('İ', 'I').replace('ø', 'o').replace('Ø', 'O').replace('ß', 'ss').replace('đ', 'd').replace('ł', 'l').replace('æ', 'ae')
    s = ''.join(c for c in unicodedata.normalize('NFKD', s) if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9]+', ' ', s.lower()).strip()

def full_names(p):
    out = []
    for n in [p.get('name')] + list(p.get('aliases') or []) + list(p.get('names') or []):
        k = norm(n)
        if k and len(k.split()) >= 1 and not re.match(r'^[a-z] ', k) and k not in out:  # no "m neuer" style initials
            out.append(k)
    return out

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--csv', required=True); ap.add_argument('--write', action='store_true'); ap.add_argument('--budget-mb', type=float); ap.add_argument('--available-index', action='append', default=[], help='stage index-N.json; keep only candidates whose FM UID is in these archives')
    a = ap.parse_args()
    rows = [r for r in csv.DictReader(open(a.csv, encoding='utf-8-sig'), delimiter=';') if r['Club'] not in ('Manager', '', '-')]
    by_name = collections.defaultdict(list)
    for r in rows: by_name[norm(r['Name'])].append(r)
    uid_club = {r['UID']: r['Club'] for r in rows}
    plan_path = ROOT / 'tools/head-import/fm27-plan.json'; plan = json.loads(plan_path.read_text())
    manifest = json.loads((ROOT / 'assets/heads/manifest.json').read_text())
    have_ids = {i for e in manifest['players'] for i in e['ids']}
    head_uid = {i: e.get('fmUID') for e in manifest['players'] for i in e['ids'] if e.get('fmUID')}
    planned_uids = {p['fmUID'] for p in plan['players']}; planned_ids = {i for p in plan['players'] for i in p['ids']}
    reg = json.loads((ROOT / 'assets/club-rosters-v75.json').read_text())['teams']
    budget = (a.budget_mb * 1e6 if a.budget_mb else plan['budgetBytes'])
    used = sum(e['bytes'] for e in manifest['players'] if e.get('source') == 'fm27-realfaces-v2')
    room = max(0, int((budget - used) // AVG_BYTES))
    TOP = set(TR_SUPER_LIG + ['real-madrid', 'barcelona', 'atletico', 'man-city', 'liverpool', 'arsenal', 'man-utd', 'chelsea', 'tottenham', 'bayern', 'dortmund', 'leverkusen', 'inter', 'milan', 'juventus', 'napoli', 'roma', 'psg'])
    teams = [(s, 0 if s in TOP else 1) for s in TR_SUPER_LIG + BIG_CLUBS]
    cands, skipped, team_clubs = [], collections.Counter(), {}
    for slug, tier in teams:
        f = ROOT / f'assets/player-profiles/{slug}.json'
        if not f.exists(): skipped['no-profile:' + slug] += 1; continue
        prof = json.loads(f.read_text()); reg_id = str(prof.get('providerTeamId') or '')
        roster = reg.get(reg_id, {}).get('team') or {}
        first = {str(p['id']) for p in (roster.get('players') or [])}
        people = {str(p['id']): p for p in prof['players']}
        for p in (roster.get('players') or []) + (roster.get('bench') or []): people.setdefault(str(p['id']), p)
        votes = collections.Counter(uid_club[head_uid[i]] for i in people if i in head_uid and head_uid[i] in uid_club)
        if sum(votes.values()) < 3:
            for i, p in people.items():
                for k in full_names(p)[:1]:
                    if len(by_name.get(k, [])) == 1: votes[by_name[k][0]['Club']] += 1
        if not votes: skipped['no-club-vote:' + slug] += 1; continue
        club, n = votes.most_common(1)[0]
        if n < 3 or n < .5 * sum(votes.values()): skipped['weak-club-vote:' + slug] += 1; continue
        team_clubs[slug] = club
        for i, p in people.items():
            if i in have_ids or i in planned_ids or not p.get('dateOfBirth'): continue
            hits = {r['UID']: r for k in full_names(p) for r in by_name.get(k, []) if r['Club'] == club}
            if len(hits) != 1: skipped['no-unique-same-club-row'] += 1; continue
            r = next(iter(hits.values()))
            if r['UID'] in planned_uids: skipped['uid-already-planned'] += 1; continue
            prio = (0 if i in first else 1, tier)  # every first-team player before any reserve; then Turkish league and biggest clubs
            cands.append((prio, {'name': p['name'], 'names': list(dict.fromkeys([p['name']] + list(p.get('aliases') or []))), 'ids': [i],
                'clubs': [reg_id] if reg_id in reg else [], 'dateOfBirth': p['dateOfBirth'], 'fmUID': r['UID'], 'sourceName': r['Name'],
                'sourceClub': r['Club'], 'gameClub': prof.get('name') or slug, 'profileSources': [f'assets/player-profiles/{slug}.json'],
                'identityEvidence': 'V248 extension: exactly one author-CSV row with this full name/alias at the team club found by vote of existing heads; bind existing game ID and full DOB; no roster edits'}))
    if a.available_index:
        avail = {f['uid'] for x in a.available_index for f in json.loads(pathlib.Path(x).read_text())['files']}
        cands = [(p, c) for p, c in cands if c['fmUID'] in avail]
    seen, chosen = set(), []
    for prio, c in sorted(cands, key=lambda x: x[0]):
        if c['fmUID'] in seen: continue
        seen.add(c['fmUID']); chosen.append(c)
    kept = chosen[:room]
    report = {'candidates': len(chosen), 'room': room, 'added': len(kept), 'teamClubs': team_clubs, 'skipped': dict(skipped),
              'deferredByBudget': [c['name'] for c in chosen[room:]], 'byTeam': collections.Counter(c['gameClub'] for c in chosen).most_common(), 'firstTeamCandidates': sum(1 for p, c in sorted(cands, key=lambda x: x[0]) if p[0] == 0), 'added_names': [c['name'] + ' (' + c['gameClub'] + ')' for c in kept]}
    if a.write:
        plan['players'].extend(kept)
        if a.budget_mb: plan['budgetBytes'] = int(a.budget_mb * 1e6)
        plan_path.write_text(json.dumps(plan, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(report, ensure_ascii=False, indent=1))

if __name__ == '__main__':
    main()
