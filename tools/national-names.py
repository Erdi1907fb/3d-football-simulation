#!/usr/bin/env python3
"""V125: Turkish / English display names for national teams in assets/catalog.js ("names": {"tr","en"}).
Turkish uses the Turkish exonyms (İtalya, Almanya, İngiltere…); English uses common English names (Italy, Turkey…).
The catalogue 'name' stays the provider-matching canonical name. Usage: python3 tools/national-names.py"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAT = os.path.join(ROOT, 'assets', 'catalog.js')
N = {
 'albania': ('Arnavutluk', 'Albania'), 'andorra': ('Andorra', 'Andorra'), 'armenia': ('Ermenistan', 'Armenia'),
 'austria': ('Avusturya', 'Austria'), 'azerbaijan': ('Azerbaycan', 'Azerbaijan'), 'belarus': ('Belarus', 'Belarus'),
 'belgium': ('Belçika', 'Belgium'), 'bosnia-and-herzegovina': ('Bosna-Hersek', 'Bosnia and Herzegovina'),
 'bulgaria': ('Bulgaristan', 'Bulgaria'), 'croatia': ('Hırvatistan', 'Croatia'), 'cyprus': ('Güney Kıbrıs', 'Cyprus'),
 'czechia': ('Çekya', 'Czechia'), 'denmark': ('Danimarka', 'Denmark'), 'england': ('İngiltere', 'England'),
 'estonia': ('Estonya', 'Estonia'), 'faroe-islands': ('Faroe Adaları', 'Faroe Islands'), 'finland': ('Finlandiya', 'Finland'),
 'france': ('Fransa', 'France'), 'georgia': ('Gürcistan', 'Georgia'), 'germany': ('Almanya', 'Germany'),
 'gibraltar': ('Cebelitarık', 'Gibraltar'), 'greece': ('Yunanistan', 'Greece'), 'hungary': ('Macaristan', 'Hungary'),
 'iceland': ('İzlanda', 'Iceland'), 'israel': ('İsrail', 'Israel'), 'italy': ('İtalya', 'Italy'),
 'kazakhstan': ('Kazakistan', 'Kazakhstan'), 'kosovo': ('Kosova', 'Kosovo'), 'latvia': ('Letonya', 'Latvia'),
 'liechtenstein': ('Lihtenştayn', 'Liechtenstein'), 'lithuania': ('Litvanya', 'Lithuania'), 'luxembourg': ('Lüksemburg', 'Luxembourg'),
 'malta': ('Malta', 'Malta'), 'moldova': ('Moldova', 'Moldova'), 'montenegro': ('Karadağ', 'Montenegro'),
 'netherlands': ('Hollanda', 'Netherlands'), 'north-macedonia': ('Kuzey Makedonya', 'North Macedonia'),
 'northern-ireland': ('Kuzey İrlanda', 'Northern Ireland'), 'norway': ('Norveç', 'Norway'), 'poland': ('Polonya', 'Poland'),
 'portugal': ('Portekiz', 'Portugal'), 'republic-of-ireland': ('İrlanda', 'Republic of Ireland'), 'romania': ('Romanya', 'Romania'),
 'san-marino': ('San Marino', 'San Marino'), 'scotland': ('İskoçya', 'Scotland'), 'serbia': ('Sırbistan', 'Serbia'),
 'slovakia': ('Slovakya', 'Slovakia'), 'slovenia': ('Slovenya', 'Slovenia'), 'spain': ('İspanya', 'Spain'),
 'sweden': ('İsveç', 'Sweden'), 'switzerland': ('İsviçre', 'Switzerland'), 'turkiye': ('Türkiye', 'Turkey'),
 'ukraine': ('Ukrayna', 'Ukraine'), 'wales': ('Galler', 'Wales'),
 'argentina': ('Arjantin', 'Argentina'), 'brazil': ('Brezilya', 'Brazil'), 'uruguay': ('Uruguay', 'Uruguay'),
 'colombia': ('Kolombiya', 'Colombia'), 'ecuador': ('Ekvador', 'Ecuador'), 'paraguay': ('Paraguay', 'Paraguay'),
 'chile': ('Şili', 'Chile'), 'peru': ('Peru', 'Peru'), 'venezuela': ('Venezuela', 'Venezuela'),
 'united-states': ('ABD', 'United States'), 'mexico': ('Meksika', 'Mexico'), 'canada': ('Kanada', 'Canada'),
 'costa-rica': ('Kosta Rika', 'Costa Rica'), 'panama': ('Panama', 'Panama'), 'haiti': ('Haiti', 'Haiti'), 'curacao': ('Curaçao', 'Curaçao'),
 'japan': ('Japonya', 'Japan'), 'korea-republic': ('Güney Kore', 'South Korea'), 'australia': ('Avustralya', 'Australia'),
 'saudi-arabia': ('Suudi Arabistan', 'Saudi Arabia'), 'iran': ('İran', 'Iran'), 'qatar': ('Katar', 'Qatar'), 'iraq': ('Irak', 'Iraq'),
 'jordan': ('Ürdün', 'Jordan'), 'uzbekistan': ('Özbekistan', 'Uzbekistan'), 'new-zealand': ('Yeni Zelanda', 'New Zealand'), 'china': ('Çin', 'China'),
 'morocco': ('Fas', 'Morocco'), 'senegal': ('Senegal', 'Senegal'), 'nigeria': ('Nijerya', 'Nigeria'), 'egypt': ('Mısır', 'Egypt'),
 'algeria': ('Cezayir', 'Algeria'), 'cote-divoire': ('Fildişi Sahili', 'Ivory Coast'), 'cameroon': ('Kamerun', 'Cameroon'),
 'ghana': ('Gana', 'Ghana'), 'mali': ('Mali', 'Mali'), 'tunisia': ('Tunus', 'Tunisia'), 'south-africa': ('Güney Afrika', 'South Africa'),
 'cabo-verde': ('Yeşil Burun Adaları', 'Cape Verde'), 'congo-dr': ('Kongo DC', 'DR Congo'),
}

def main():
    s = open(CAT, encoding='utf-8').read()
    start = s.index('const all=[') + len('const all='); end = s.index('],aliases=') + 1
    teams = json.loads(s[start:end]); done = 0; missing = []
    for t in teams:
        if t.get('league') != 'Millî / National': continue
        if t['id'] in N:
            t['names'] = {'tr': N[t['id']][0], 'en': N[t['id']][1]}; done += 1
        else: missing.append(t['id'])
    s = s[:start] + json.dumps(teams, ensure_ascii=False, indent=2) + s[end:]
    open(CAT, 'w', encoding='utf-8').write(s)
    print(json.dumps({'named': done, 'missing': missing}, ensure_ascii=False))

if __name__ == '__main__':
    main()
