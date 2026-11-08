#!/usr/bin/env python3
"""V132 national-team strength model -> assets/national-ratings.json (used by server/lib.php pp_forecast for
UEFA Nations League and international friendlies).

Inputs (ESPN public scoreboards, monthly, cached in tools/.national-cache, git-ignored):
  World Cup, every confederation's World Cup qualifiers, EURO + EURO qualifiers, Copa America, Gold Cup,
  Africa Cup of Nations, Asian Cup, UEFA / CONCACAF Nations League, international friendlies.
Model:
  * Elo (World Football Elo style): K by competition weight x goal-difference multiplier, +100 home advantage.
    World Cup 60, continental finals 50, World Cup / EURO qualifiers 40, Nations League 35/30, friendlies 15
    (friendlies count, but much less). Initial rating seeded from the editorial catalogue strength.
  * Titles: winners of the latest major tournaments get a decaying bonus (World Cup / EURO / Copa 35,
    other continental 20; halves every 2 years).
  * Form: last 10 matches, competition-weighted points per game.
  * Squad: ESPN national roster matched by name to our club rosters (FotMob player ratings): mean of the best 16.
Usage: python3 tools/national-ratings.py [--from 2023-03] [--offline]
"""
import json, os, sys, time, math, unicodedata, re, urllib.request, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, 'tools', '.national-cache')
OUT = os.path.join(ROOT, 'assets', 'national-ratings.json')
COMPS = {  # slug: (K, label, kind)
 'fifa.world': (60, 'FIFA World Cup', 'world'),
 'uefa.euro': (50, 'UEFA EURO', 'major'), 'conmebol.america': (50, 'Copa América', 'major'),
 'concacaf.gold': (45, 'CONCACAF Gold Cup', 'continental'), 'caf.nations': (45, 'Africa Cup of Nations', 'continental'),
 'afc.asian.cup': (45, 'AFC Asian Cup', 'continental'),
 'fifa.worldq.uefa': (40, 'WC qualifying UEFA', 'qualifier'), 'fifa.worldq.conmebol': (40, 'WC qualifying CONMEBOL', 'qualifier'),
 'fifa.worldq.concacaf': (40, 'WC qualifying CONCACAF', 'qualifier'), 'fifa.worldq.caf': (40, 'WC qualifying CAF', 'qualifier'),
 'fifa.worldq.afc': (40, 'WC qualifying AFC', 'qualifier'), 'fifa.worldq.ofc': (35, 'WC qualifying OFC', 'qualifier'),
 'uefa.euroq': (40, 'EURO qualifying', 'qualifier'),
 'uefa.nations': (35, 'UEFA Nations League', 'nations'), 'concacaf.nations.league': (30, 'CONCACAF Nations League', 'nations'),
 'fifa.friendly': (15, 'International friendly', 'friendly'),
}
TITLE_BONUS = {'world': 35, 'major': 35, 'continental': 20}

def fold(s):
    s = unicodedata.normalize('NFD', str(s or '')).encode('ascii', 'ignore').decode().lower().replace('ı', 'i')
    return re.sub(r'[^a-z0-9]', '', s)

def months(start, end):
    y, m = start
    while (y, m) <= end:
        yield '%04d%02d' % (y, m)
        m += 1
        if m > 12: y, m = y + 1, 1

def fetch(slug, month, offline):
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, '%s-%s.json' % (slug, month))
    now = datetime.date.today().strftime('%Y%m')
    if os.path.exists(path) and (month < now or time.time() - os.path.getmtime(path) < 6 * 3600):
        return json.load(open(path))
    if offline: return {'events': []}
    url = 'https://site.api.espn.com/apis/site/v2/sports/soccer/%s/scoreboard?dates=%s&limit=1000' % (slug, month)
    try:
        doc = json.loads(urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'next90sim-ratings/1.0'}), timeout=30).read())
    except Exception:
        return {'events': []}
    slim = {'events': []}
    for e in doc.get('events', []):
        c = (e.get('competitions') or [{}])[0]
        slim['events'].append({'id': e.get('id'), 'date': c.get('date') or e.get('date'), 'neutral': bool(c.get('neutralSite')),
            'completed': bool(c.get('status', {}).get('type', {}).get('completed')),
            'teams': [{'side': t.get('homeAway'), 'id': t.get('team', {}).get('id'), 'name': t.get('team', {}).get('displayName'),
                       'score': t.get('score'), 'winner': t.get('winner')} for t in c.get('competitors', [])]})
    json.dump(slim, open(path, 'w'))
    time.sleep(.1)
    return slim

def main():
    offline = '--offline' in sys.argv
    start = (2023, 3)
    if '--from' in sys.argv:
        y, m = sys.argv[sys.argv.index('--from') + 1].split('-'); start = (int(y), int(m))
    today = datetime.date.today(); end = (today.year, today.month)
    aliases = json.load(open(os.path.join(ROOT, 'assets', 'provider-team-aliases.json'), encoding='utf-8'))
    nat = json.load(open(os.path.join(ROOT, 'assets', 'national-teams.json'), encoding='utf-8'))
    strength = nat['strength']; canon = {fold(n): n for n in strength}
    def name(espn):
        n = aliases.get(espn, espn); return canon.get(fold(n), n)
    games = []; espn_ids = {}
    for slug in COMPS:
        for mon in months(start, end):
            for e in fetch(slug, mon, offline)['events']:
                if not e['completed'] or len(e['teams']) != 2: continue
                h = next((t for t in e['teams'] if t['side'] == 'home'), None); a = next((t for t in e['teams'] if t['side'] == 'away'), None)
                try: hs, as_ = int(h['score']), int(a['score'])
                except Exception: continue
                hn, an = name(h['name']), name(a['name'])
                espn_ids[hn] = h['id']; espn_ids[an] = a['id']
                games.append({'date': e['date'], 'slug': slug, 'home': hn, 'away': an, 'hs': hs, 'as': as_, 'neutral': e['neutral'],
                              'winner': hn if h.get('winner') else an if a.get('winner') else None, 'id': e['id']})
    games.sort(key=lambda g: g['date'])
    seen = set(); uniq = []
    for g in games:
        if g['id'] in seen: continue
        seen.add(g['id']); uniq.append(g)
    games = uniq
    elo = {n: 1200 + (s - 40) * 16 for n, s in strength.items()}
    hist = {}
    for g in games:
        for n in (g['home'], g['away']): elo.setdefault(n, 1350)
        K = COMPS[g['slug']][0]; d = abs(g['hs'] - g['as'])
        K *= 1 if d <= 1 else 1.5 if d == 2 else (11 + d) / 8
        dr = elo[g['home']] - elo[g['away']] + (0 if g['neutral'] else 100)
        we = 1 / (10 ** (-dr / 400) + 1)
        w = 1 if g['hs'] > g['as'] else .5 if g['hs'] == g['as'] else 0
        delta = K * (w - we)
        elo[g['home']] += delta; elo[g['away']] -= delta
        for n, pts, kind in ((g['home'], 3 * w if w != .5 else 1, g['slug']), (g['away'], 3 * (1 - w) if w != .5 else 1, g['slug'])):
            hist.setdefault(n, []).append((g['date'], pts, COMPS[kind][0], kind))
    # Titles: the last finished match of each tournament edition decides the winner (ESPN winner flag covers penalties).
    titles = {}
    for slug, (K, label, kind) in COMPS.items():
        if kind not in TITLE_BONUS: continue
        eds = {}
        for g in games:
            if g['slug'] == slug: eds.setdefault(g['date'][:4] if slug != 'caf.nations' else ('%d' % (int(g['date'][:4]) - (1 if g['date'][5:7] == '01' else 0))), []).append(g)
        for year, gs in eds.items():
            if len(gs) < 8: continue
            final = gs[-1]; win = final['winner'] or (final['home'] if final['hs'] > final['as'] else final['away'] if final['as'] > final['hs'] else None)
            if win: titles.setdefault(win, []).append({'competition': label, 'year': int(year), 'kind': kind, 'date': final['date'][:10]})
    rosters = json.load(open(os.path.join(ROOT, 'assets', 'club-rosters-v75.json'), encoding='utf-8'))['teams']
    rating = {}
    for t in rosters.values():
        for p in t['team'].get('players', []) + t['team'].get('bench', []):
            if p.get('rating'):
                for k in {fold(p['name']), fold(p.get('shortName', ''))}:
                    if k: rating[k] = max(rating.get(k, 0), float(p['rating']))
    out = {}; ref = datetime.datetime.strptime(today.strftime('%Y-%m-%d'), '%Y-%m-%d')
    for n in strength:
        h = hist.get(n, [])[-10:]
        form = sum(p * k for _, p, k, _ in h) / max(1e-9, sum(k for _, _, k, _ in h)) if h else None
        bonus = 0.0
        for t in titles.get(n, []):
            years = (ref - datetime.datetime.strptime(t['date'], '%Y-%m-%d')).days / 365.25
            bonus += TITLE_BONUS[t['kind']] * 0.5 ** (years / 2)
        squad = None
        tid = espn_ids.get(n)
        if tid and not offline:
            cpath = os.path.join(CACHE, 'roster-%s.json' % tid)
            try:
                if os.path.exists(cpath) and time.time() - os.path.getmtime(cpath) < 7 * 86400: doc = json.load(open(cpath))
                else:
                    doc = json.loads(urllib.request.urlopen(urllib.request.Request('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.friendly/teams/%s/roster' % tid, headers={'User-Agent': 'next90sim-ratings/1.0'}), timeout=30).read())
                    doc = {'athletes': [{'displayName': a.get('displayName'), 'shortName': a.get('shortName')} for a in doc.get('athletes', [])]}; json.dump(doc, open(cpath, 'w')); time.sleep(.1)
                rs = sorted((rating.get(fold(a.get('displayName')), 0) or rating.get(fold(a.get('shortName')), 0) for a in doc.get('athletes', [])), reverse=True)
                matched = [r for r in rs if r > 0]
                if len(matched) >= 5:
                    top = (matched + [6.6] * 16)[:16]; squad = {'rating': round(sum(top) / 16, 3), 'matched': len(matched)}
            except Exception:
                pass
        out[n] = {'elo': round(elo[n] + bonus, 1), 'eloBase': round(elo[n], 1), 'titleBonus': round(bonus, 1), 'titles': titles.get(n, []),
                  'matches': len(hist.get(n, [])), 'competitive': sum(1 for x in hist.get(n, []) if x[3] != 'fifa.friendly'),
                  'form': round(form, 3) if form is not None else None, 'squad': squad, 'espnId': tid}
    ranked = sorted(out, key=lambda n: -out[n]['elo'])
    for i, n in enumerate(ranked): out[n]['rank'] = i + 1
    doc = {'version': 1, 'asOf': today.isoformat(), 'from': '%04d-%02d' % start, 'matches': len(games),
           'method': 'World-Football-Elo style; K: World Cup 60, EURO/Copa 50, other continental finals 45, WC/EURO qualifiers 40, Nations Leagues 35/30, friendlies 15; title bonus decays (half-life 2 y); squad = mean FotMob rating of best 16 matched national-roster players.',
           'teams': out,
           # V134 seed for the PHP updater (server/national-ratings.php): every rated match, compact rows.
           'games': [[g['date'][:16], g['slug'], g['home'], g['away'], g['hs'], g['as'], 1 if g['neutral'] else 0, g['winner'], str(g['id'])] for g in games]}
    json.dump(doc, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(json.dumps({'games': len(games), 'teams': len(out), 'top': [(n, out[n]['elo'], out[n]['squad']['rating'] if out[n]['squad'] else None) for n in ranked[:12]],
                      'turkiye': out.get('Türkiye'), 'titles': {n: [t['competition'] + ' ' + str(t['year']) for t in v] for n, v in titles.items() if n in strength}}, ensure_ascii=False))

if __name__ == '__main__':
    main()
