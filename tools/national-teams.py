#!/usr/bin/env python3
"""V124 national-team catalogue builder (UEFA Nations League + international friendlies).

- Adds every UEFA member and the major friendly nations to assets/catalog.js (league 'Millî / National').
- Existing national entries keep their data; they gain the 'unl' / 'intl' competition tags.
- Flags: flat PNGs from flagcdn.com (public-domain national flags) rendered into the same small waving-flag style
  as the existing assets/logos/<country>.png files (96x64 RGBA). Existing flag files are never overwritten.
- ESPN display names are mapped onto catalogue names in assets/provider-team-aliases.json.

Usage: python3 tools/national-teams.py [--offline]
"""
import io, json, math, os, re, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAT = os.path.join(ROOT, 'assets', 'catalog.js')
ALIASES = os.path.join(ROOT, 'assets', 'provider-team-aliases.json')
LOGOS = os.path.join(ROOT, 'assets', 'logos')

# id, catalogue name, ESPN name, flag iso, kit primary, kit secondary, short, strength, competitions
UEFA = [
 ('albania','Albania','Albania','al','#e41e20','#111111','ALB',70),
 ('andorra','Andorra','Andorra','ad','#10069f','#fedf00','AND',50),
 ('armenia','Armenia','Armenia','am','#d90012','#f2a800','ARM',62),
 ('austria','Austria','Austria','at','#ed2939','#ffffff','AUT',80),
 ('azerbaijan','Azerbaijan','Azerbaijan','az','#00b5e2','#ef3340','AZE',58),
 ('belarus','Belarus','Belarus','by','#c8313e','#ffffff','BLR',58),
 ('belgium','Belgium','Belgium','be','#c8102e','#111111','BEL',83),
 ('bosnia-and-herzegovina','Bosnia and Herzegovina','Bosnia-Herzegovina','ba','#002395','#fecb00','BIH',68),
 ('bulgaria','Bulgaria','Bulgaria','bg','#ffffff','#00966e','BUL',60),
 ('croatia','Croatia','Croatia','hr','#e8303a','#ffffff','CRO',83),
 ('cyprus','Cyprus','Cyprus','cy','#2f5aa8','#ffffff','CYP',55),
 ('czechia','Czechia','Czechia','cz','#d7141a','#11457e','CZE',75),
 ('denmark','Denmark','Denmark','dk','#c60c30','#ffffff','DEN',80),
 ('england','England','England','gb-eng','#f4f4f2','#1d3c8f','ENG',89),
 ('estonia','Estonia','Estonia','ee','#0072ce','#111111','EST',52),
 ('faroe-islands','Faroe Islands','Faroe Islands','fo','#ffffff','#005eb8','FRO',52),
 ('finland','Finland','Finland','fi','#ffffff','#002f6c','FIN',64),
 ('france','France','France','fr','#1c2b5a','#ffffff','FRA',90),
 ('georgia','Georgia','Georgia','ge','#ffffff','#da291c','GEO',70),
 ('germany','Germany','Germany','de','#f4f4f2','#111111','GER',87),
 ('gibraltar','Gibraltar','Gibraltar','gi','#da000c','#ffffff','GIB',45),
 ('greece','Greece','Greece','gr','#0d5eaf','#ffffff','GRE',72),
 ('hungary','Hungary','Hungary','hu','#ce2939','#ffffff','HUN',73),
 ('iceland','Iceland','Iceland','is','#02529c','#ffffff','ISL',63),
 ('israel','Israel','Israel','il','#0038b8','#ffffff','ISR',62),
 ('italy','Italia','Italy','it','#2f63c9','#ffffff','ITA',85),
 ('kazakhstan','Kazakhstan','Kazakhstan','kz','#00afca','#fec50c','KAZ',57),
 ('kosovo','Kosovo','Kosovo','xk','#244aa5','#d0a650','KOS',60),
 ('latvia','Latvia','Latvia','lv','#9e3039','#ffffff','LVA',50),
 ('liechtenstein','Liechtenstein','Liechtenstein','li','#002b7f','#ce1126','LIE',45),
 ('lithuania','Lithuania','Lithuania','lt','#fdb913','#006a44','LTU',52),
 ('luxembourg','Luxembourg','Luxembourg','lu','#ed2939','#ffffff','LUX',56),
 ('malta','Malta','Malta','mt','#cf142b','#ffffff','MLT',48),
 ('moldova','Moldova','Moldova','md','#0046ae','#ffd200','MDA',48),
 ('montenegro','Montenegro','Montenegro','me','#c40308','#d4af3a','MNE',60),
 ('netherlands','Netherlands','Netherlands','nl','#f36c21','#1d3c8f','NED',86),
 ('north-macedonia','North Macedonia','North Macedonia','mk','#d20000','#ffe600','MKD',58),
 ('northern-ireland','Northern Ireland','Northern Ireland','gb-nir','#00843d','#ffffff','NIR',62),
 ('norway','Norway','Norway','no','#ba0c2f','#ffffff','NOR',80),
 ('poland','Poland','Poland','pl','#f4f4f2','#dc143c','POL',75),
 ('portugal','Portugal','Portugal','pt','#b5121b','#0f6b3a','POR',88),
 ('republic-of-ireland','Republic of Ireland','Republic of Ireland','ie','#169b62','#ffffff','IRL',65),
 ('romania','Romania','Romania','ro','#fcd116','#002b7f','ROU',68),
 ('san-marino','San Marino','San Marino','sm','#5eb6e4','#ffffff','SMR',40),
 ('scotland','Scotland','Scotland','gb-sct','#1d2c5a','#ffffff','SCO',72),
 ('serbia','Serbia','Serbia','rs','#c6363c','#0c4076','SRB',74),
 ('slovakia','Slovakia','Slovakia','sk','#0b4ea2','#ffffff','SVK',70),
 ('slovenia','Slovenia','Slovenia','si','#ffffff','#2a9d4b','SVN',69),
 ('spain','Spain','Spain','es','#c60b1e','#ffc400','ESP',90),
 ('sweden','Sweden','Sweden','se','#fecc02','#006aa7','SWE',76),
 ('switzerland','Switzerland','Switzerland','ch','#d52b1e','#ffffff','SUI',80),
 ('turkiye','Türkiye','Türkiye','tr','#e30a17','#ffffff','TUR',80),
 ('ukraine','Ukraine','Ukraine','ua','#ffd500','#005bbb','UKR',73),
 ('wales','Wales','Wales','gb-wls','#c8102e','#ffffff','WAL',68),
]
# Major non-UEFA nations that play high-profile friendlies (ESPN fifa.friendly).
WORLD = [
 ('argentina','Argentina','Argentina','ar','#75aadb','#ffffff','ARG',90),
 ('brazil','Brazil','Brazil','br','#fedd00','#009c3b','BRA',88),
 ('uruguay','Uruguay','Uruguay','uy','#5cbfeb','#111111','URU',80),
 ('colombia','Colombia','Colombia','co','#fcd116','#003893','COL',80),
 ('ecuador','Ecuador','Ecuador','ec','#ffdd00','#034ea2','ECU',76),
 ('paraguay','Paraguay','Paraguay','py','#d52b1e','#ffffff','PAR',72),
 ('chile','Chile','Chile','cl','#d52b1e','#0039a6','CHI',70),
 ('peru','Peru','Peru','pe','#ffffff','#d91023','PER',68),
 ('venezuela','Venezuela','Venezuela','ve','#7b1d32','#ffcc00','VEN',66),
 ('united-states','United States','United States','us','#f4f4f2','#1d2c5a','USA',78),
 ('mexico','Mexico','Mexico','mx','#006847','#ffffff','MEX',78),
 ('canada','Canada','Canada','ca','#d80621','#ffffff','CAN',74),
 ('costa-rica','Costa Rica','Costa Rica','cr','#ce1126','#002b7f','CRC',64),
 ('panama','Panama','Panama','pa','#d21034','#ffffff','PAN',64),
 ('japan','Japan','Japan','jp','#1b2f7a','#ffffff','JPN',80),
 ('korea-republic','Korea Republic','South Korea','kr','#e8303a','#111111','KOR',76),
 ('australia','Australia','Australia','au','#ffcd00','#00843d','AUS',72),
 ('saudi-arabia','Saudi Arabia','Saudi Arabia','sa','#f4f4f2','#006c35','KSA',66),
 ('iran','Iran','Iran','ir','#f4f4f2','#da0000','IRN',72),
 ('qatar','Qatar','Qatar','qa','#8a1538','#ffffff','QAT',64),
 ('morocco','Morocco','Morocco','ma','#c1272d','#006233','MAR',82),
 ('senegal','Senegal','Senegal','sn','#ffffff','#00853f','SEN',78),
 ('nigeria','Nigeria','Nigeria','ng','#008751','#ffffff','NGA',72),
 ('egypt','Egypt','Egypt','eg','#ce1126','#ffffff','EGY',70),
 ('algeria','Algeria','Algeria','dz','#ffffff','#006233','ALG',70),
 ('cote-divoire','Côte d’Ivoire','Ivory Coast','ci','#f77f00','#009e60','CIV',74),
 ('cameroon','Cameroon','Cameroon','cm','#007a5e','#fcd116','CMR',68),
 ('ghana','Ghana','Ghana','gh','#ffffff','#006b3f','GHA',68),
 ('mali','Mali','Mali','ml','#14b53a','#fcd116','MLI',66),
 ('tunisia','Tunisia','Tunisia','tn','#e70013','#ffffff','TUN',66),
 ('china','China PR','China PR','cn','#de2910','#ffde00','CHN',58),
]
EXTRA_ALIASES = {'Italy':'Italia','Bosnia-Herzegovina':'Bosnia and Herzegovina','South Korea':'Korea Republic','Korea Republic':'Korea Republic',
 'Ivory Coast':'Côte d’Ivoire',"Cote d'Ivoire":'Côte d’Ivoire','DR Congo':'Congo DR','Cape Verde':'Cabo Verde','Cape Verde Islands':'Cabo Verde',
 'Curacao':'Curaçao','IR Iran':'Iran','USA':'United States','Turkey':'Türkiye','Turkiye':'Türkiye','Czech Republic':'Czechia','China':'China PR',
 'Ireland':'Republic of Ireland','FYR Macedonia':'North Macedonia'}

def flag(iso, out):
    from PIL import Image, ImageFilter
    url = 'https://flagcdn.com/w320/%s.png' % iso
    raw = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'next90sim-build'}), timeout=30).read()
    src = Image.open(io.BytesIO(raw)).convert('RGBA')
    W, H, FW, FH = 96, 64, 82, 54
    flat = src.resize((FW * 3, FH * 3), Image.LANCZOS)
    big = Image.new('RGBA', (W * 3, H * 3), (0, 0, 0, 0))
    px, fp = big.load(), flat.load()
    for x in range(FW * 3):
        u = x / (FW * 3)
        dy = math.sin(u * math.pi * 2.0 - .6) * 5.0 * 3 * (0.35 + u)
        shade = 1.0 + 0.22 * math.cos(u * math.pi * 2.0 - .6)
        for y in range(FH * 3):
            r, g, b, a = fp[x, y]
            tx, ty = x + 7 * 3, int(y + 5 * 3 + dy)
            if 0 <= ty < H * 3:
                px[tx, ty] = (min(255, int(r * shade)), min(255, int(g * shade)), min(255, int(b * shade)), a)
    img = big.resize((W, H), Image.LANCZOS)
    shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    shadow.paste((0, 0, 0, 70), (1, 2), img.split()[3].point(lambda v: 255 if v > 20 else 0).filter(ImageFilter.GaussianBlur(1.2)))
    out_img = Image.alpha_composite(shadow, img)
    out_img.save(out)

def main():
    offline = '--offline' in sys.argv
    s = open(CAT, encoding='utf-8').read()
    start = s.index('const all=[') + len('const all=')
    end = s.index('],aliases=') + 1
    teams = json.loads(s[start:end])
    by_id = {t['id']: t for t in teams}
    added = tagged = flags = 0
    for group, tag in ((UEFA, ['national', 'unl', 'intl']), (WORLD, ['national', 'intl'])):
        for (tid, name, espn, iso, c1, c2, short, strength) in group:
            logo = 'assets/logos/%s.png' % tid
            path = os.path.join(ROOT, logo)
            if not os.path.exists(path) and not offline:
                flag(iso, path); flags += 1
            if tid in by_id:
                t = by_id[tid]
                for c in tag:
                    if c not in t['competitions']:
                        t['competitions'].append(c); tagged += 1
                continue
            t = {'id': tid, 'name': name, 'league': 'Millî / National', 'strength': strength,
                 'attack': max(40, strength - 1), 'defense': max(40, strength + 1), 'color': c1, 'secondary': c2,
                 'short': short, 'quality': 'editorial', 'competitions': list(tag), 'logo': logo}
            teams.append(t); by_id[tid] = t; added += 1
    s = s[:start] + json.dumps(teams, ensure_ascii=False, indent=2) + s[end:]
    open(CAT, 'w', encoding='utf-8').write(s)
    aliases = json.load(open(ALIASES, encoding='utf-8'))
    for group in (UEFA, WORLD):
        for (tid, name, espn, *_rest) in group:
            if espn != name: aliases[espn] = name
    aliases.update(EXTRA_ALIASES)
    json.dump(aliases, open(ALIASES, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    nat = sorted([t for t in teams if 'national' in t['competitions']], key=lambda t: t['name'])
    json.dump({'version': 1, 'note': 'Server-side allow-list for national-team competitions (generated by tools/national-teams.py).',
               'unl': [t['name'] for t in nat if 'unl' in t['competitions']],
               'intl': [t['name'] for t in nat if 'intl' in t['competitions']],
               'strength': {t['name']: t['strength'] for t in nat}},
              open(os.path.join(ROOT, 'assets', 'national-teams.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(json.dumps({'added': added, 'tagged': tagged, 'flags': flags, 'nationalTotal': sum(1 for t in teams if 'national' in t['competitions'])}))

if __name__ == '__main__':
    main()
