(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('./kit-selection.js'));else r.SekmeCatalog=f(r.SekmeKitSelection);})(typeof globalThis!=='undefined'?globalThis:this,function(K){'use strict';
const all=[
  {
    "id": "galatasaray",
    "name": "Galatasaray",
    "league": "Türkiye",
    "strength": 85,
    "attack": 87,
    "defense": 80,
    "color": "#fdb912",
    "secondary": "#a90432",
    "short": "GS",
    "quality": "editorial",
    "competitions": [
      "super",
      "ucl"
    ],
    "logo": "assets/logos/galatasaray.png"
  },
  {
    "id": "fenerbahce",
    "name": "Fenerbahçe",
    "league": "Türkiye",
    "strength": 84,
    "attack": 85,
    "defense": 81,
    "color": "#002b5c",
    "secondary": "#ffed00",
    "short": "FB",
    "quality": "editorial",
    "competitions": [
      "super",
      "ucl"
    ],
    "logo": "assets/logos/fenerbahce.png"
  },
  {
    "id": "besiktas",
    "name": "Beşiktaş",
    "league": "Türkiye",
    "strength": 78,
    "attack": 79,
    "defense": 76,
    "color": "#ffffff",
    "secondary": "#111111",
    "short": "BJK",
    "quality": "editorial",
    "competitions": [
      "super",
      "uel"
    ],
    "logo": "assets/logos/besiktas.png"
  },
  {
    "id": "trabzonspor",
    "name": "Trabzonspor",
    "league": "Türkiye",
    "strength": 76,
    "attack": 76,
    "defense": 74,
    "color": "#7a1737",
    "secondary": "#5bb8e8",
    "short": "TS",
    "quality": "editorial",
    "competitions": [
      "super",
      "uecl"
    ],
    "logo": "assets/logos/trabzonspor.png"
  },
  {
    "id": "basaksehir",
    "name": "Başakşehir",
    "league": "Türkiye",
    "strength": 75,
    "attack": 75,
    "defense": 75,
    "color": "#f58220",
    "secondary": "#0b2447",
    "short": "IBB",
    "quality": "editorial",
    "competitions": [
      "super"
    ],
    "logo": "assets/logos/basaksehir.png"
  },
  {
    "id": "goztepe",
    "name": "Göztepe",
    "league": "Türkiye",
    "strength": 72,
    "attack": 72,
    "defense": 72,
    "color": "#ffcc00",
    "secondary": "#d71920",
    "short": "GÖZ",
    "quality": "editorial",
    "competitions": [
      "super"
    ],
    "logo": "assets/logos/goztepe.png"
  },
  {
    "id": "samsunspor",
    "name": "Samsunspor",
    "league": "Türkiye",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#d71920",
    "secondary": "#ffffff",
    "short": "SAM",
    "quality": "editorial",
    "competitions": [
      "super"
    ],
    "logo": "assets/logos/samsunspor.png"
  },
  {
    "id": "caykur-rizespor",
    "name": "Çaykur Rizespor",
    "league": "Türkiye",
    "strength": 66,
    "attack": 66,
    "defense": 66,
    "color": "#006b3f",
    "secondary": "#00a3e0",
    "short": "RİZ",
    "quality": "editorial",
    "competitions": [
      "super"
    ],
    "logo": "assets/logos/caykur-rizespor.png"
  },
  {
    "id": "alanyaspor",
    "name": "Alanyaspor",
    "league": "Türkiye",
    "strength": 63,
    "attack": 63,
    "defense": 63,
    "color": "#f58220",
    "secondary": "#00843d",
    "short": "ALN",
    "quality": "editorial",
    "competitions": [
      "super"
    ],
    "logo": "assets/logos/alanyaspor.png"
  },
  {
    "id": "konyaspor",
    "name": "Konyaspor",
    "league": "Türkiye",
    "strength": 62,
    "attack": 62,
    "defense": 62,
    "color": "#007a3d",
    "secondary": "#ffffff",
    "short": "KON",
    "quality": "editorial",
    "competitions": [
      "super"
    ],
    "logo": "assets/logos/konyaspor.png"
  },
  {
    "id": "kasimpasa",
    "name": "Kasımpaşa",
    "league": "Türkiye",
    "strength": 60,
    "attack": 60,
    "defense": 60,
    "color": "#0b2f6b",
    "secondary": "#ffffff",
    "short": "KAS",
    "quality": "editorial",
    "competitions": [
      "super"
    ],
    "logo": "assets/logos/kasimpasa.png"
  },
  {
    "id": "kocaelispor",
    "name": "Kocaelispor",
    "league": "Türkiye",
    "strength": 58,
    "attack": 58,
    "defense": 58,
    "color": "#098b45",
    "secondary": "#111111",
    "short": "KOC",
    "quality": "editorial",
    "competitions": [
      "super"
    ],
    "logo": "assets/logos/kocaelispor.png"
  },
  {
    "id": "gaziantep-fk",
    "name": "Gaziantep FK",
    "league": "Türkiye",
    "strength": 57,
    "attack": 57,
    "defense": 57,
    "color": "#d71920",
    "secondary": "#111111",
    "short": "GFK",
    "quality": "editorial",
    "competitions": [
      "super"
    ],
    "logo": "assets/logos/gaziantep-fk.png"
  },
  {
    "id": "genclerbirligi",
    "name": "Gençlerbirliği",
    "league": "Türkiye",
    "strength": 55,
    "attack": 55,
    "defense": 55,
    "color": "#d71920",
    "secondary": "#111111",
    "short": "GEN",
    "quality": "editorial",
    "competitions": [
      "super"
    ],
    "logo": "assets/logos/genclerbirligi.png"
  },
  {
    "id": "amed-sk",
    "name": "Amed SK",
    "league": "Türkiye",
    "strength": 52,
    "attack": 52,
    "defense": 52,
    "color": "#00843d",
    "secondary": "#d71920",
    "short": "AMD",
    "quality": "editorial",
    "competitions": [
      "super"
    ],
    "logo": "assets/logos/amed-sk.png"
  },
  {
    "id": "corum-fk",
    "name": "Çorum FK",
    "league": "Türkiye",
    "strength": 51,
    "attack": 51,
    "defense": 51,
    "color": "#d71920",
    "secondary": "#111111",
    "short": "ÇFK",
    "quality": "editorial",
    "competitions": [
      "super"
    ],
    "logo": "assets/logos/corum-fk.png"
  },
  {
    "id": "erzurumspor-fk",
    "name": "Erzurumspor FK",
    "league": "Türkiye",
    "strength": 50,
    "attack": 50,
    "defense": 50,
    "color": "#005eb8",
    "secondary": "#ffffff",
    "short": "ERZ",
    "quality": "editorial",
    "competitions": [
      "super"
    ],
    "logo": "assets/logos/erzurumspor-fk.png"
  },
  {
    "id": "eyupspor",
    "name": "Eyüpspor",
    "league": "Türkiye",
    "strength": 56,
    "attack": 56,
    "defense": 56,
    "color": "#5b2a86",
    "secondary": "#ffd100",
    "short": "EYP",
    "quality": "editorial",
    "competitions": [
      "super"
    ],
    "logo": "assets/logos/eyupspor.png"
  },
  {
    "id": "arsenal",
    "name": "Arsenal",
    "league": "England",
    "strength": 89,
    "attack": 88,
    "defense": 90,
    "color": "#e30613",
    "secondary": "#ffffff",
    "short": "ARS",
    "quality": "editorial",
    "competitions": [
      "premier",
      "ucl"
    ],
    "logo": "assets/logos/arsenal.png"
  },
  {
    "id": "aston-villa",
    "name": "Aston Villa",
    "league": "England",
    "strength": 84,
    "attack": 84,
    "defense": 84,
    "color": "#670e36",
    "secondary": "#95c9f5",
    "short": "AVL",
    "quality": "editorial",
    "competitions": [
      "premier",
      "ucl"
    ],
    "logo": "assets/logos/aston-villa.png"
  },
  {
    "id": "bournemouth",
    "name": "Bournemouth",
    "league": "England",
    "strength": 76,
    "attack": 76,
    "defense": 76,
    "color": "#d71920",
    "secondary": "#111111",
    "short": "BOU",
    "quality": "editorial",
    "competitions": [
      "premier",
      "uel"
    ],
    "logo": "assets/logos/bournemouth.png"
  },
  {
    "id": "brentford",
    "name": "Brentford",
    "league": "England",
    "strength": 77,
    "attack": 77,
    "defense": 77,
    "color": "#d50032",
    "secondary": "#ffffff",
    "short": "BRE",
    "quality": "editorial",
    "competitions": [
      "premier"
    ],
    "logo": "assets/logos/brentford.png"
  },
  {
    "id": "brighton",
    "name": "Brighton",
    "league": "England",
    "strength": 80,
    "attack": 80,
    "defense": 80,
    "color": "#0057b8",
    "secondary": "#ffffff",
    "short": "BHA",
    "quality": "editorial",
    "competitions": [
      "premier",
      "uecl"
    ],
    "logo": "assets/logos/brighton.png"
  },
  {
    "id": "chelsea",
    "name": "Chelsea",
    "league": "England",
    "strength": 85,
    "attack": 87,
    "defense": 81,
    "color": "#034694",
    "secondary": "#ffffff",
    "short": "CHE",
    "quality": "editorial",
    "competitions": [
      "premier"
    ],
    "logo": "assets/logos/chelsea.png"
  },
  {
    "id": "coventry-city",
    "name": "Coventry City",
    "league": "England",
    "strength": 71,
    "attack": 71,
    "defense": 71,
    "color": "#77c8ef",
    "secondary": "#10284c",
    "short": "COV",
    "quality": "editorial",
    "competitions": [
      "premier"
    ],
    "logo": "assets/logos/coventry-city.png"
  },
  {
    "id": "crystal-palace",
    "name": "Crystal Palace",
    "league": "England",
    "strength": 79,
    "attack": 79,
    "defense": 79,
    "color": "#1b458f",
    "secondary": "#c4122e",
    "short": "CRY",
    "quality": "editorial",
    "competitions": [
      "premier",
      "uel"
    ],
    "logo": "assets/logos/crystal-palace.png"
  },
  {
    "id": "everton",
    "name": "Everton",
    "league": "England",
    "strength": 77,
    "attack": 77,
    "defense": 77,
    "color": "#003399",
    "secondary": "#ffffff",
    "short": "EVE",
    "quality": "editorial",
    "competitions": [
      "premier"
    ],
    "logo": "assets/logos/everton.png"
  },
  {
    "id": "fulham",
    "name": "Fulham",
    "league": "England",
    "strength": 76,
    "attack": 76,
    "defense": 76,
    "color": "#ffffff",
    "secondary": "#111111",
    "short": "FUL",
    "quality": "editorial",
    "competitions": [
      "premier"
    ],
    "logo": "assets/logos/fulham.png"
  },
  {
    "id": "hull-city",
    "name": "Hull City",
    "league": "England",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#f6a800",
    "secondary": "#111111",
    "short": "HUL",
    "quality": "editorial",
    "competitions": [
      "premier"
    ],
    "logo": "assets/logos/hull-city.png"
  },
  {
    "id": "ipswich-town",
    "name": "Ipswich Town",
    "league": "England",
    "strength": 72,
    "attack": 72,
    "defense": 72,
    "color": "#0057b8",
    "secondary": "#ffffff",
    "short": "IPS",
    "quality": "editorial",
    "competitions": [
      "premier"
    ],
    "logo": "assets/logos/ipswich-town.png"
  },
  {
    "id": "leeds-united",
    "name": "Leeds United",
    "league": "England",
    "strength": 75,
    "attack": 75,
    "defense": 75,
    "color": "#ffffff",
    "secondary": "#1d428a",
    "short": "LEE",
    "quality": "editorial",
    "competitions": [
      "premier"
    ],
    "logo": "assets/logos/leeds-united.png"
  },
  {
    "id": "liverpool",
    "name": "Liverpool",
    "league": "England",
    "strength": 90,
    "attack": 92,
    "defense": 86,
    "color": "#c8102e",
    "secondary": "#ffffff",
    "short": "LIV",
    "quality": "editorial",
    "competitions": [
      "premier",
      "ucl"
    ],
    "logo": "assets/logos/liverpool.png"
  },
  {
    "id": "man-city",
    "name": "Manchester City",
    "league": "England",
    "strength": 90,
    "attack": 92,
    "defense": 86,
    "color": "#6cabdd",
    "secondary": "#ffffff",
    "short": "MCI",
    "quality": "editorial",
    "competitions": [
      "premier",
      "ucl"
    ],
    "logo": "assets/logos/man-city.png"
  },
  {
    "id": "man-utd",
    "name": "Manchester United",
    "league": "England",
    "strength": 82,
    "attack": 83,
    "defense": 79,
    "color": "#da291c",
    "secondary": "#ffffff",
    "short": "MUN",
    "quality": "editorial",
    "competitions": [
      "premier",
      "ucl"
    ],
    "logo": "assets/logos/man-utd.png"
  },
  {
    "id": "newcastle",
    "name": "Newcastle United",
    "league": "England",
    "strength": 83,
    "attack": 84,
    "defense": 82,
    "color": "#111111",
    "secondary": "#ffffff",
    "short": "NEW",
    "quality": "editorial",
    "competitions": [
      "premier"
    ],
    "logo": "assets/logos/newcastle.png"
  },
  {
    "id": "nottingham-forest",
    "name": "Nottingham Forest",
    "league": "England",
    "strength": 79,
    "attack": 79,
    "defense": 79,
    "color": "#dd0000",
    "secondary": "#ffffff",
    "short": "NFO",
    "quality": "editorial",
    "competitions": [
      "premier"
    ],
    "logo": "assets/logos/nottingham-forest.png"
  },
  {
    "id": "sunderland",
    "name": "Sunderland",
    "league": "England",
    "strength": 71,
    "attack": 71,
    "defense": 71,
    "color": "#e30613",
    "secondary": "#ffffff",
    "short": "SUN",
    "quality": "editorial",
    "competitions": [
      "premier",
      "uel"
    ],
    "logo": "assets/logos/sunderland.png"
  },
  {
    "id": "tottenham",
    "name": "Tottenham Hotspur",
    "league": "England",
    "strength": 81,
    "attack": 85,
    "defense": 75,
    "color": "#ffffff",
    "secondary": "#132257",
    "short": "TOT",
    "quality": "editorial",
    "competitions": [
      "premier"
    ],
    "logo": "assets/logos/tottenham.png"
  },
  {
    "id": "athletic",
    "name": "Athletic Club",
    "league": "España",
    "strength": 81,
    "attack": 80,
    "defense": 83,
    "color": "#e30613",
    "secondary": "#ffffff",
    "short": "ATH",
    "quality": "editorial",
    "competitions": [
      "laliga"
    ],
    "logo": "assets/logos/athletic.png"
  },
  {
    "id": "atletico",
    "name": "Atlético de Madrid",
    "league": "España",
    "strength": 85,
    "attack": 84,
    "defense": 87,
    "color": "#d71920",
    "secondary": "#ffffff",
    "short": "ATM",
    "quality": "editorial",
    "competitions": [
      "laliga",
      "ucl"
    ],
    "logo": "assets/logos/atletico.png"
  },
  {
    "id": "ca-osasuna",
    "name": "CA Osasuna",
    "league": "España",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#d00027",
    "secondary": "#001b5e",
    "short": "OSA",
    "quality": "editorial",
    "competitions": [
      "laliga"
    ],
    "logo": "assets/logos/ca-osasuna.png"
  },
  {
    "id": "deportivo-alaves",
    "name": "Deportivo Alavés",
    "league": "España",
    "strength": 66,
    "attack": 66,
    "defense": 66,
    "color": "#005eb8",
    "secondary": "#ffffff",
    "short": "ALA",
    "quality": "editorial",
    "competitions": [
      "laliga"
    ],
    "logo": "assets/logos/deportivo-alaves.png"
  },
  {
    "id": "elche-cf",
    "name": "Elche CF",
    "league": "España",
    "strength": 64,
    "attack": 64,
    "defense": 64,
    "color": "#007a3d",
    "secondary": "#ffffff",
    "short": "ELC",
    "quality": "editorial",
    "competitions": [
      "laliga"
    ],
    "logo": "assets/logos/elche-cf.png"
  },
  {
    "id": "barcelona",
    "name": "FC Barcelona",
    "league": "España",
    "strength": 90,
    "attack": 93,
    "defense": 83,
    "color": "#004d98",
    "secondary": "#a50044",
    "short": "BAR",
    "quality": "editorial",
    "competitions": [
      "laliga",
      "ucl"
    ],
    "logo": "assets/logos/barcelona.png"
  },
  {
    "id": "getafe-cf",
    "name": "Getafe CF",
    "league": "España",
    "strength": 68,
    "attack": 68,
    "defense": 68,
    "color": "#0052a5",
    "secondary": "#ffffff",
    "short": "GET",
    "quality": "editorial",
    "competitions": [
      "laliga",
      "uecl"
    ],
    "logo": "assets/logos/getafe-cf.png"
  },
  {
    "id": "levante-ud",
    "name": "Levante UD",
    "league": "España",
    "strength": 63,
    "attack": 63,
    "defense": 63,
    "color": "#00529f",
    "secondary": "#cf1734",
    "short": "LEV",
    "quality": "editorial",
    "competitions": [
      "laliga"
    ],
    "logo": "assets/logos/levante-ud.png"
  },
  {
    "id": "malaga-cf",
    "name": "Málaga CF",
    "league": "España",
    "strength": 62,
    "attack": 62,
    "defense": 62,
    "color": "#00a3e0",
    "secondary": "#ffffff",
    "short": "MAL",
    "quality": "editorial",
    "competitions": [
      "laliga"
    ],
    "logo": "assets/logos/malaga-cf.png"
  },
  {
    "id": "r-racing-club",
    "name": "R. Racing Club",
    "league": "España",
    "strength": 61,
    "attack": 61,
    "defense": 61,
    "color": "#00843d",
    "secondary": "#ffffff",
    "short": "RAC",
    "quality": "editorial",
    "competitions": [
      "laliga"
    ],
    "logo": "assets/logos/r-racing-club.png"
  },
  {
    "id": "rayo-vallecano",
    "name": "Rayo Vallecano",
    "league": "España",
    "strength": 69,
    "attack": 69,
    "defense": 69,
    "color": "#ffffff",
    "secondary": "#d71920",
    "short": "RAY",
    "quality": "editorial",
    "competitions": [
      "laliga"
    ],
    "logo": "assets/logos/rayo-vallecano.png"
  },
  {
    "id": "rc-celta",
    "name": "RC Celta",
    "league": "España",
    "strength": 72,
    "attack": 72,
    "defense": 72,
    "color": "#8bc5e8",
    "secondary": "#ffffff",
    "short": "CEL",
    "quality": "editorial",
    "competitions": [
      "laliga",
      "uel"
    ],
    "logo": "assets/logos/rc-celta.png"
  },
  {
    "id": "rc-deportivo",
    "name": "RC Deportivo",
    "league": "España",
    "strength": 63,
    "attack": 63,
    "defense": 63,
    "color": "#0057b8",
    "secondary": "#ffffff",
    "short": "DEP",
    "quality": "editorial",
    "competitions": [
      "laliga"
    ],
    "logo": "assets/logos/rc-deportivo.png"
  },
  {
    "id": "rcd-espanyol",
    "name": "RCD Espanyol",
    "league": "España",
    "strength": 67,
    "attack": 67,
    "defense": 67,
    "color": "#0057b8",
    "secondary": "#ffffff",
    "short": "ESP",
    "quality": "editorial",
    "competitions": [
      "laliga"
    ],
    "logo": "assets/logos/rcd-espanyol.png"
  },
  {
    "id": "real-betis",
    "name": "Real Betis",
    "league": "España",
    "strength": 79,
    "attack": 79,
    "defense": 79,
    "color": "#00954c",
    "secondary": "#ffffff",
    "short": "BET",
    "quality": "editorial",
    "competitions": [
      "laliga",
      "ucl"
    ],
    "logo": "assets/logos/real-betis.png"
  },
  {
    "id": "real-madrid",
    "name": "Real Madrid",
    "league": "España",
    "strength": 91,
    "attack": 92,
    "defense": 87,
    "color": "#ffffff",
    "secondary": "#d4af37",
    "short": "RMA",
    "quality": "editorial",
    "competitions": [
      "laliga",
      "ucl"
    ],
    "logo": "assets/logos/real-madrid.png"
  },
  {
    "id": "real-sociedad",
    "name": "Real Sociedad",
    "league": "España",
    "strength": 79,
    "attack": 79,
    "defense": 79,
    "color": "#0067b1",
    "secondary": "#ffffff",
    "short": "RSO",
    "quality": "editorial",
    "competitions": [
      "laliga",
      "uel"
    ],
    "logo": "assets/logos/real-sociedad.png"
  },
  {
    "id": "sevilla-fc",
    "name": "Sevilla FC",
    "league": "España",
    "strength": 75,
    "attack": 75,
    "defense": 75,
    "color": "#ffffff",
    "secondary": "#d71920",
    "short": "SEV",
    "quality": "editorial",
    "competitions": [
      "laliga"
    ],
    "logo": "assets/logos/sevilla-fc.png"
  },
  {
    "id": "valencia-cf",
    "name": "Valencia CF",
    "league": "España",
    "strength": 73,
    "attack": 73,
    "defense": 73,
    "color": "#f58220",
    "secondary": "#111111",
    "short": "VAL",
    "quality": "editorial",
    "competitions": [
      "laliga"
    ],
    "logo": "assets/logos/valencia-cf.png"
  },
  {
    "id": "villarreal-cf",
    "name": "Villarreal CF",
    "league": "España",
    "strength": 82,
    "attack": 82,
    "defense": 82,
    "color": "#ffe600",
    "secondary": "#0057b8",
    "short": "VIL",
    "quality": "editorial",
    "competitions": [
      "laliga",
      "ucl"
    ],
    "logo": "assets/logos/villarreal-cf.png"
  },
  {
    "id": "milan",
    "name": "AC Milan",
    "league": "Italia",
    "strength": 84,
    "attack": 85,
    "defense": 80,
    "color": "#fb090b",
    "secondary": "#000000",
    "short": "MIL",
    "quality": "editorial",
    "competitions": [
      "seriea",
      "uel"
    ],
    "logo": "assets/logos/milan.png"
  },
  {
    "id": "atalanta",
    "name": "Atalanta",
    "league": "Italia",
    "strength": 84,
    "attack": 87,
    "defense": 79,
    "color": "#1f4ba8",
    "secondary": "#000000",
    "short": "ATA",
    "quality": "editorial",
    "competitions": [
      "seriea",
      "uecl"
    ],
    "logo": "assets/logos/atalanta.png"
  },
  {
    "id": "bologna",
    "name": "Bologna",
    "league": "Italia",
    "strength": 77,
    "attack": 77,
    "defense": 77,
    "color": "#1c3477",
    "secondary": "#d71920",
    "short": "BOL",
    "quality": "editorial",
    "competitions": [
      "seriea"
    ],
    "logo": "assets/logos/bologna.png"
  },
  {
    "id": "cagliari",
    "name": "Cagliari",
    "league": "Italia",
    "strength": 67,
    "attack": 67,
    "defense": 67,
    "color": "#003f7f",
    "secondary": "#d71920",
    "short": "CAG",
    "quality": "editorial",
    "competitions": [
      "seriea"
    ],
    "logo": "assets/logos/cagliari.png"
  },
  {
    "id": "como",
    "name": "Como",
    "league": "Italia",
    "strength": 76,
    "attack": 76,
    "defense": 76,
    "color": "#0057b8",
    "secondary": "#ffffff",
    "short": "COM",
    "quality": "editorial",
    "competitions": [
      "seriea",
      "ucl"
    ],
    "logo": "assets/logos/como.png"
  },
  {
    "id": "fiorentina",
    "name": "Fiorentina",
    "league": "Italia",
    "strength": 78,
    "attack": 78,
    "defense": 78,
    "color": "#552583",
    "secondary": "#ffffff",
    "short": "FIO",
    "quality": "editorial",
    "competitions": [
      "seriea"
    ],
    "logo": "assets/logos/fiorentina.png"
  },
  {
    "id": "frosinone",
    "name": "Frosinone",
    "league": "Italia",
    "strength": 63,
    "attack": 63,
    "defense": 63,
    "color": "#f7d117",
    "secondary": "#0057b8",
    "short": "FRO",
    "quality": "editorial",
    "competitions": [
      "seriea"
    ],
    "logo": "assets/logos/frosinone.png"
  },
  {
    "id": "genoa",
    "name": "Genoa",
    "league": "Italia",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#003f7f",
    "secondary": "#d71920",
    "short": "GEN",
    "quality": "editorial",
    "competitions": [
      "seriea"
    ],
    "logo": "assets/logos/genoa.png"
  },
  {
    "id": "inter",
    "name": "Inter",
    "league": "Italia",
    "strength": 88,
    "attack": 87,
    "defense": 90,
    "color": "#0057b8",
    "secondary": "#111111",
    "short": "INT",
    "quality": "editorial",
    "competitions": [
      "seriea",
      "ucl"
    ],
    "logo": "assets/logos/inter.png"
  },
  {
    "id": "juventus",
    "name": "Juventus",
    "league": "Italia",
    "strength": 85,
    "attack": 82,
    "defense": 89,
    "color": "#ffffff",
    "secondary": "#111111",
    "short": "JUV",
    "quality": "editorial",
    "competitions": [
      "seriea",
      "uel"
    ],
    "logo": "assets/logos/juventus.png"
  },
  {
    "id": "lazio",
    "name": "Lazio",
    "league": "Italia",
    "strength": 79,
    "attack": 79,
    "defense": 79,
    "color": "#87ceeb",
    "secondary": "#ffffff",
    "short": "LAZ",
    "quality": "editorial",
    "competitions": [
      "seriea"
    ],
    "logo": "assets/logos/lazio.png"
  },
  {
    "id": "lecce",
    "name": "Lecce",
    "league": "Italia",
    "strength": 65,
    "attack": 65,
    "defense": 65,
    "color": "#d71920",
    "secondary": "#f6d100",
    "short": "LEC",
    "quality": "editorial",
    "competitions": [
      "seriea"
    ],
    "logo": "assets/logos/lecce.png"
  },
  {
    "id": "monza",
    "name": "Monza",
    "league": "Italia",
    "strength": 65,
    "attack": 65,
    "defense": 65,
    "color": "#d71920",
    "secondary": "#ffffff",
    "short": "MON",
    "quality": "editorial",
    "competitions": [
      "seriea"
    ],
    "logo": "assets/logos/monza.png"
  },
  {
    "id": "napoli",
    "name": "Napoli",
    "league": "Italia",
    "strength": 86,
    "attack": 87,
    "defense": 83,
    "color": "#12a5e5",
    "secondary": "#ffffff",
    "short": "NAP",
    "quality": "editorial",
    "competitions": [
      "seriea",
      "ucl"
    ],
    "logo": "assets/logos/napoli.png"
  },
  {
    "id": "parma",
    "name": "Parma",
    "league": "Italia",
    "strength": 66,
    "attack": 66,
    "defense": 66,
    "color": "#f5d000",
    "secondary": "#0057b8",
    "short": "PAR",
    "quality": "editorial",
    "competitions": [
      "seriea"
    ],
    "logo": "assets/logos/parma.png"
  },
  {
    "id": "roma",
    "name": "Roma",
    "league": "Italia",
    "strength": 81,
    "attack": 81,
    "defense": 82,
    "color": "#8e1f2f",
    "secondary": "#f6b900",
    "short": "ROM",
    "quality": "editorial",
    "competitions": [
      "seriea",
      "ucl"
    ],
    "logo": "assets/logos/roma.svg"
  },
  {
    "id": "sassuolo",
    "name": "Sassuolo",
    "league": "Italia",
    "strength": 68,
    "attack": 68,
    "defense": 68,
    "color": "#00843d",
    "secondary": "#111111",
    "short": "SAS",
    "quality": "editorial",
    "competitions": [
      "seriea"
    ],
    "logo": "assets/logos/sassuolo.png"
  },
  {
    "id": "torino",
    "name": "Torino",
    "league": "Italia",
    "strength": 72,
    "attack": 72,
    "defense": 72,
    "color": "#7a1721",
    "secondary": "#ffffff",
    "short": "TOR",
    "quality": "editorial",
    "competitions": [
      "seriea"
    ],
    "logo": "assets/logos/torino.png"
  },
  {
    "id": "udinese",
    "name": "Udinese",
    "league": "Italia",
    "strength": 69,
    "attack": 69,
    "defense": 69,
    "color": "#ffffff",
    "secondary": "#111111",
    "short": "UDI",
    "quality": "editorial",
    "competitions": [
      "seriea"
    ],
    "logo": "assets/logos/udinese.png"
  },
  {
    "id": "venezia",
    "name": "Venezia",
    "league": "Italia",
    "strength": 64,
    "attack": 64,
    "defense": 64,
    "color": "#f58220",
    "secondary": "#00843d",
    "short": "VEN",
    "quality": "editorial",
    "competitions": [
      "seriea"
    ],
    "logo": "assets/logos/venezia.png"
  },
  {
    "id": "angers-sco",
    "name": "Angers SCO",
    "league": "France",
    "strength": 66,
    "attack": 66,
    "defense": 66,
    "color": "#111111",
    "secondary": "#ffffff",
    "short": "ANG",
    "quality": "editorial",
    "competitions": [
      "ligue1"
    ],
    "logo": "assets/logos/angers-sco.png"
  },
  {
    "id": "aj-auxerre",
    "name": "AJ Auxerre",
    "league": "France",
    "strength": 68,
    "attack": 68,
    "defense": 68,
    "color": "#0057b8",
    "secondary": "#ffffff",
    "short": "AUX",
    "quality": "editorial",
    "competitions": [
      "ligue1"
    ],
    "logo": "assets/logos/aj-auxerre.png"
  },
  {
    "id": "stade-brestois-29",
    "name": "Stade Brestois 29",
    "league": "France",
    "strength": 72,
    "attack": 72,
    "defense": 72,
    "color": "#d71920",
    "secondary": "#ffffff",
    "short": "BRE",
    "quality": "editorial",
    "competitions": [
      "ligue1"
    ],
    "logo": "assets/logos/stade-brestois-29.png"
  },
  {
    "id": "havre-ac",
    "name": "Havre AC",
    "league": "France",
    "strength": 66,
    "attack": 66,
    "defense": 66,
    "color": "#6bb6ff",
    "secondary": "#001f5b",
    "short": "HAC",
    "quality": "editorial",
    "competitions": [
      "ligue1"
    ],
    "logo": "assets/logos/havre-ac.png"
  },
  {
    "id": "le-mans-fc",
    "name": "Le Mans FC",
    "league": "France",
    "strength": 61,
    "attack": 61,
    "defense": 61,
    "color": "#d71920",
    "secondary": "#f6d100",
    "short": "LMF",
    "quality": "editorial",
    "competitions": [
      "ligue1"
    ],
    "logo": "assets/logos/le-mans-fc.png"
  },
  {
    "id": "rc-lens",
    "name": "RC Lens",
    "league": "France",
    "strength": 80,
    "attack": 80,
    "defense": 80,
    "color": "#d71920",
    "secondary": "#f6d100",
    "short": "RCL",
    "quality": "editorial",
    "competitions": [
      "ligue1",
      "ucl"
    ],
    "logo": "assets/logos/rc-lens.png"
  },
  {
    "id": "losc",
    "name": "LOSC",
    "league": "France",
    "strength": 80,
    "attack": 80,
    "defense": 80,
    "color": "#d71920",
    "secondary": "#1d2b5f",
    "short": "LIL",
    "quality": "editorial",
    "competitions": [
      "ligue1",
      "ucl"
    ],
    "logo": "assets/logos/losc.png"
  },
  {
    "id": "fc-lorient",
    "name": "FC Lorient",
    "league": "France",
    "strength": 67,
    "attack": 67,
    "defense": 67,
    "color": "#f58220",
    "secondary": "#111111",
    "short": "LOR",
    "quality": "editorial",
    "competitions": [
      "ligue1"
    ],
    "logo": "assets/logos/fc-lorient.png"
  },
  {
    "id": "olympique-lyonnais",
    "name": "Olympique Lyonnais",
    "league": "France",
    "strength": 81,
    "attack": 81,
    "defense": 81,
    "color": "#0057b8",
    "secondary": "#d71920",
    "short": "OL",
    "quality": "editorial",
    "competitions": [
      "ligue1",
      "uel"
    ],
    "logo": "assets/logos/olympique-lyonnais.png"
  },
  {
    "id": "marseille",
    "name": "Olympique de Marseille",
    "league": "France",
    "strength": 81,
    "attack": 83,
    "defense": 77,
    "color": "#00a3e0",
    "secondary": "#ffffff",
    "short": "OM",
    "quality": "editorial",
    "competitions": [
      "ligue1",
      "uel"
    ],
    "logo": "assets/logos/marseille.png"
  },
  {
    "id": "monaco",
    "name": "AS Monaco",
    "league": "France",
    "strength": 81,
    "attack": 84,
    "defense": 76,
    "color": "#d71920",
    "secondary": "#ffffff",
    "short": "ASM",
    "quality": "editorial",
    "competitions": [
      "ligue1",
      "uecl"
    ],
    "logo": "assets/logos/monaco.png"
  },
  {
    "id": "ogc-nice",
    "name": "OGC Nice",
    "league": "France",
    "strength": 77,
    "attack": 77,
    "defense": 77,
    "color": "#d71920",
    "secondary": "#111111",
    "short": "NIC",
    "quality": "editorial",
    "competitions": [
      "ligue1"
    ],
    "logo": "assets/logos/ogc-nice.png"
  },
  {
    "id": "paris-fc",
    "name": "Paris FC",
    "league": "France",
    "strength": 65,
    "attack": 65,
    "defense": 65,
    "color": "#14213d",
    "secondary": "#74c0fc",
    "short": "PFC",
    "quality": "editorial",
    "competitions": [
      "ligue1"
    ],
    "logo": "assets/logos/paris-fc.png"
  },
  {
    "id": "psg",
    "name": "Paris Saint-Germain",
    "league": "France",
    "strength": 90,
    "attack": 94,
    "defense": 84,
    "color": "#004170",
    "secondary": "#e30613",
    "short": "PSG",
    "quality": "editorial",
    "competitions": [
      "ligue1",
      "ucl"
    ],
    "logo": "assets/logos/psg.png"
  },
  {
    "id": "stade-rennais",
    "name": "Stade Rennais",
    "league": "France",
    "strength": 78,
    "attack": 78,
    "defense": 78,
    "color": "#d71920",
    "secondary": "#111111",
    "short": "REN",
    "quality": "editorial",
    "competitions": [
      "ligue1",
      "uel"
    ],
    "logo": "assets/logos/stade-rennais.png"
  },
  {
    "id": "rc-strasbourg",
    "name": "RC Strasbourg",
    "league": "France",
    "strength": 74,
    "attack": 74,
    "defense": 74,
    "color": "#0057b8",
    "secondary": "#ffffff",
    "short": "STR",
    "quality": "editorial",
    "competitions": [
      "ligue1"
    ],
    "logo": "assets/logos/rc-strasbourg.png"
  },
  {
    "id": "toulouse-fc",
    "name": "Toulouse FC",
    "league": "France",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#5b2a86",
    "secondary": "#ffffff",
    "short": "TFC",
    "quality": "editorial",
    "competitions": [
      "ligue1"
    ],
    "logo": "assets/logos/toulouse-fc.png"
  },
  {
    "id": "estac-troyes",
    "name": "ESTAC Troyes",
    "league": "France",
    "strength": 63,
    "attack": 63,
    "defense": 63,
    "color": "#0057b8",
    "secondary": "#ffffff",
    "short": "TRY",
    "quality": "editorial",
    "competitions": [
      "ligue1"
    ],
    "logo": "assets/logos/estac-troyes.png"
  },
  {
    "id": "fc-augsburg",
    "name": "FC Augsburg",
    "league": "Deutschland",
    "strength": 75,
    "attack": 75,
    "defense": 75,
    "color": "#c1272d",
    "secondary": "#ffffff",
    "short": "FCA",
    "quality": "editorial",
    "competitions": [
      "bundesliga"
    ],
    "logo": "assets/logos/fc-augsburg.png"
  },
  {
    "id": "union-berlin",
    "name": "Union Berlin",
    "league": "Deutschland",
    "strength": 76,
    "attack": 76,
    "defense": 76,
    "color": "#d71920",
    "secondary": "#ffffff",
    "short": "FCU",
    "quality": "editorial",
    "competitions": [
      "bundesliga"
    ],
    "logo": "assets/logos/union-berlin.png"
  },
  {
    "id": "werder-bremen",
    "name": "Werder Bremen",
    "league": "Deutschland",
    "strength": 77,
    "attack": 77,
    "defense": 77,
    "color": "#168554",
    "secondary": "#ffffff",
    "short": "SVW",
    "quality": "editorial",
    "competitions": [
      "bundesliga"
    ],
    "logo": "assets/logos/werder-bremen.png"
  },
  {
    "id": "dortmund",
    "name": "Borussia Dortmund",
    "league": "Deutschland",
    "strength": 84,
    "attack": 87,
    "defense": 78,
    "color": "#f4df16",
    "secondary": "#191919",
    "short": "BVB",
    "quality": "editorial",
    "competitions": [
      "bundesliga",
      "ucl"
    ],
    "logo": "assets/logos/dortmund.png"
  },
  {
    "id": "sv-elversberg",
    "name": "SV Elversberg",
    "league": "Deutschland",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#ffffff",
    "secondary": "#171717",
    "short": "SVE",
    "quality": "editorial",
    "competitions": [
      "bundesliga"
    ],
    "logo": "assets/logos/sv-elversberg.png"
  },
  {
    "id": "eintracht-frankfurt",
    "name": "Eintracht Frankfurt",
    "league": "Deutschland",
    "strength": 81,
    "attack": 81,
    "defense": 81,
    "color": "#dd1726",
    "secondary": "#171717",
    "short": "SGE",
    "quality": "editorial",
    "competitions": [
      "bundesliga"
    ],
    "logo": "assets/logos/eintracht-frankfurt.png"
  },
  {
    "id": "sc-freiburg",
    "name": "SC Freiburg",
    "league": "Deutschland",
    "strength": 79,
    "attack": 79,
    "defense": 79,
    "color": "#d2232a",
    "secondary": "#ffffff",
    "short": "SCF",
    "quality": "editorial",
    "competitions": [
      "bundesliga",
      "uecl"
    ],
    "logo": "assets/logos/sc-freiburg.png"
  },
  {
    "id": "hamburger-sv",
    "name": "Hamburger SV",
    "league": "Deutschland",
    "strength": 74,
    "attack": 74,
    "defense": 74,
    "color": "#2463a0",
    "secondary": "#ffffff",
    "short": "HSV",
    "quality": "editorial",
    "competitions": [
      "bundesliga"
    ],
    "logo": "assets/logos/hamburger-sv.png"
  },
  {
    "id": "tsg-hoffenheim",
    "name": "TSG Hoffenheim",
    "league": "Deutschland",
    "strength": 76,
    "attack": 76,
    "defense": 76,
    "color": "#2365ad",
    "secondary": "#ffffff",
    "short": "TSG",
    "quality": "editorial",
    "competitions": [
      "bundesliga",
      "uel"
    ],
    "logo": "assets/logos/tsg-hoffenheim.png"
  },
  {
    "id": "1-fc-koln",
    "name": "1. FC Köln",
    "league": "Deutschland",
    "strength": 74,
    "attack": 74,
    "defense": 74,
    "color": "#db2632",
    "secondary": "#ffffff",
    "short": "KOE",
    "quality": "editorial",
    "competitions": [
      "bundesliga"
    ],
    "logo": "assets/logos/1-fc-koln.png"
  },
  {
    "id": "leipzig",
    "name": "RB Leipzig",
    "league": "Deutschland",
    "strength": 82,
    "attack": 84,
    "defense": 78,
    "color": "#e9e9e2",
    "secondary": "#c73f4c",
    "short": "RBL",
    "quality": "editorial",
    "competitions": [
      "bundesliga",
      "ucl"
    ],
    "logo": "assets/logos/leipzig.png"
  },
  {
    "id": "leverkusen",
    "name": "Bayer Leverkusen",
    "league": "Deutschland",
    "strength": 85,
    "attack": 86,
    "defense": 83,
    "color": "#df494d",
    "secondary": "#25282e",
    "short": "B04",
    "quality": "editorial",
    "competitions": [
      "bundesliga",
      "uel"
    ],
    "logo": "assets/logos/leverkusen.png"
  },
  {
    "id": "mainz-05",
    "name": "Mainz 05",
    "league": "Deutschland",
    "strength": 77,
    "attack": 77,
    "defense": 77,
    "color": "#d3172e",
    "secondary": "#ffffff",
    "short": "M05",
    "quality": "editorial",
    "competitions": [
      "bundesliga"
    ],
    "logo": "assets/logos/mainz-05.png"
  },
  {
    "id": "borussia-monchengladbach",
    "name": "Borussia Mönchengladbach",
    "league": "Deutschland",
    "strength": 77,
    "attack": 77,
    "defense": 77,
    "color": "#ffffff",
    "secondary": "#1b1b1b",
    "short": "BMG",
    "quality": "editorial",
    "competitions": [
      "bundesliga"
    ],
    "logo": "assets/logos/borussia-monchengladbach.png"
  },
  {
    "id": "bayern",
    "name": "Bayern München",
    "league": "Deutschland",
    "strength": 90,
    "attack": 94,
    "defense": 83,
    "color": "#dc454b",
    "secondary": "#f2f1e5",
    "short": "FCB",
    "quality": "editorial",
    "competitions": [
      "bundesliga",
      "ucl"
    ],
    "logo": "assets/logos/bayern.png"
  },
  {
    "id": "sc-paderborn",
    "name": "SC Paderborn",
    "league": "Deutschland",
    "strength": 71,
    "attack": 71,
    "defense": 71,
    "color": "#2154a0",
    "secondary": "#171717",
    "short": "SCP",
    "quality": "editorial",
    "competitions": [
      "bundesliga"
    ],
    "logo": "assets/logos/sc-paderborn.png"
  },
  {
    "id": "schalke-04",
    "name": "Schalke 04",
    "league": "Deutschland",
    "strength": 73,
    "attack": 73,
    "defense": 73,
    "color": "#14529a",
    "secondary": "#ffffff",
    "short": "S04",
    "quality": "editorial",
    "competitions": [
      "bundesliga"
    ],
    "logo": "assets/logos/schalke-04.png"
  },
  {
    "id": "vfb-stuttgart",
    "name": "VfB Stuttgart",
    "league": "Deutschland",
    "strength": 82,
    "attack": 82,
    "defense": 82,
    "color": "#ffffff",
    "secondary": "#df2434",
    "short": "VFB",
    "quality": "editorial",
    "competitions": [
      "bundesliga",
      "ucl"
    ],
    "logo": "assets/logos/vfb-stuttgart.png"
  },
  {
    "id": "sporting",
    "name": "Sporting CP",
    "league": "Portugal",
    "strength": 85,
    "attack": 88,
    "defense": 80,
    "color": "#037859",
    "secondary": "#ffffff",
    "short": "SPO",
    "quality": "editorial",
    "competitions": [
      "ucl"
    ],
    "logo": "assets/logos/sporting.png"
  },
  {
    "id": "porto",
    "name": "Porto",
    "league": "Portugal",
    "strength": 82,
    "attack": 81,
    "defense": 85,
    "color": "#007bc1",
    "secondary": "#ffffff",
    "short": "POR",
    "quality": "editorial",
    "competitions": [
      "ucl"
    ],
    "logo": "assets/logos/porto.png"
  },
  {
    "id": "club-brugge",
    "name": "Club Brugge",
    "league": "Belgique",
    "strength": 82,
    "attack": 82,
    "defense": 82,
    "color": "#0078bf",
    "secondary": "#ffffff",
    "short": "BRU",
    "quality": "editorial",
    "competitions": [
      "ucl"
    ],
    "logo": "assets/logos/club-brugge.png"
  },
  {
    "id": "psv",
    "name": "PSV Eindhoven",
    "league": "Nederland",
    "strength": 83,
    "attack": 87,
    "defense": 77,
    "color": "#bb9752",
    "secondary": "#ffffff",
    "short": "PSV",
    "quality": "editorial",
    "competitions": [
      "ucl"
    ],
    "logo": "assets/logos/psv.png"
  },
  {
    "id": "feyenoord",
    "name": "Feyenoord",
    "league": "Nederland",
    "strength": 82,
    "attack": 82,
    "defense": 82,
    "color": "#b0a072",
    "secondary": "#000000",
    "short": "FEY",
    "quality": "editorial",
    "competitions": [
      "ucl"
    ],
    "logo": "assets/logos/feyenoord.png"
  },
  {
    "id": "bodo-glimt",
    "name": "Bodø/Glimt",
    "league": "Norge",
    "strength": 80,
    "attack": 80,
    "defense": 80,
    "color": "#f9dd00",
    "secondary": "#000000",
    "short": "BOD",
    "quality": "editorial",
    "competitions": [
      "ucl"
    ],
    "logo": "assets/logos/bodo-glimt.png"
  },
  {
    "id": "shakhtar-donetsk",
    "name": "Shakhtar Donetsk",
    "league": "Україна",
    "strength": 78,
    "attack": 78,
    "defense": 78,
    "color": "#f27022",
    "secondary": "#ffffff",
    "short": "SHA",
    "quality": "editorial",
    "competitions": [
      "ucl"
    ],
    "logo": "assets/logos/shakhtar-donetsk.png"
  },
  {
    "id": "slavia-prague",
    "name": "Slavia Prague",
    "league": "Česko",
    "strength": 75,
    "attack": 75,
    "defense": 75,
    "color": "#d82333",
    "secondary": "#fffffe",
    "short": "SLA",
    "quality": "editorial",
    "competitions": [
      "ucl"
    ],
    "logo": "assets/logos/slavia-prague.png"
  },
  {
    "id": "slovan-bratislava",
    "name": "Slovan Bratislava",
    "league": "Slovensko",
    "strength": 73,
    "attack": 73,
    "defense": 73,
    "color": "#0a689b",
    "secondary": "#ffffff",
    "short": "SLO",
    "quality": "editorial",
    "competitions": [
      "ucl"
    ],
    "logo": "assets/logos/slovan-bratislava.png"
  },
  {
    "id": "aek-athens",
    "name": "AEK Athens",
    "league": "Ελλάδα",
    "strength": 69,
    "attack": 69,
    "defense": 69,
    "color": "#fcd20f",
    "secondary": "#231f20",
    "short": "AEK",
    "quality": "editorial",
    "competitions": [
      "ucl"
    ],
    "logo": "assets/logos/aek-athens.png"
  },
  {
    "id": "lask",
    "name": "LASK",
    "league": "Österreich",
    "strength": 68,
    "attack": 68,
    "defense": 68,
    "color": "#ffffff",
    "secondary": "#151616",
    "short": "LSK",
    "quality": "editorial",
    "competitions": [
      "ucl"
    ],
    "logo": "assets/logos/lask.png"
  },
  {
    "id": "viking",
    "name": "Viking",
    "league": "Norge",
    "strength": 62,
    "attack": 62,
    "defense": 62,
    "color": "#72121c",
    "secondary": "#dbc067",
    "short": "VIK",
    "quality": "editorial",
    "competitions": [
      "ucl"
    ],
    "logo": "assets/logos/viking.png"
  },
  {
    "id": "sabah",
    "name": "Sabah",
    "league": "Azərbaycan",
    "strength": 60,
    "attack": 60,
    "defense": 60,
    "color": "#e055a0",
    "secondary": "#161514",
    "short": "SAB",
    "quality": "editorial",
    "competitions": [
      "ucl"
    ],
    "logo": "assets/logos/sabah.png"
  },
  {
    "id": "mexico",
    "name": "Mexico",
    "league": "Millî / National",
    "strength": 78,
    "attack": 78,
    "defense": 78,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "MX",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "intl"
    ],
    "logo": "assets/logos/mexico.png",
    "group": "A",
    "names": {
      "tr": "Meksika",
      "en": "Mexico"
    }
  },
  {
    "id": "south-africa",
    "name": "South Africa",
    "league": "Millî / National",
    "strength": 66,
    "attack": 66,
    "defense": 66,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "ZA",
    "quality": "editorial",
    "competitions": [
      "worldcup"
    ],
    "logo": "assets/logos/south-africa.png",
    "group": "A",
    "names": {
      "tr": "Güney Afrika",
      "en": "South Africa"
    }
  },
  {
    "id": "korea-republic",
    "name": "Korea Republic",
    "league": "Millî / National",
    "strength": 77,
    "attack": 77,
    "defense": 77,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "KR",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "intl"
    ],
    "logo": "assets/logos/korea-republic.png",
    "group": "A",
    "names": {
      "tr": "Güney Kore",
      "en": "South Korea"
    }
  },
  {
    "id": "czechia",
    "name": "Czechia",
    "league": "Millî / National",
    "strength": 75,
    "attack": 75,
    "defense": 75,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "CZ",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/czechia.png",
    "group": "A",
    "names": {
      "tr": "Çekya",
      "en": "Czechia"
    }
  },
  {
    "id": "canada",
    "name": "Canada",
    "league": "Millî / National",
    "strength": 76,
    "attack": 76,
    "defense": 76,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "CA",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "intl"
    ],
    "logo": "assets/logos/canada.png",
    "group": "B",
    "names": {
      "tr": "Kanada",
      "en": "Canada"
    }
  },
  {
    "id": "switzerland",
    "name": "Switzerland",
    "league": "Millî / National",
    "strength": 82,
    "attack": 82,
    "defense": 82,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "CH",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/switzerland.png",
    "group": "B",
    "names": {
      "tr": "İsviçre",
      "en": "Switzerland"
    }
  },
  {
    "id": "qatar",
    "name": "Qatar",
    "league": "Millî / National",
    "strength": 65,
    "attack": 65,
    "defense": 65,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "QA",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "intl"
    ],
    "logo": "assets/logos/qatar.png",
    "group": "B",
    "names": {
      "tr": "Katar",
      "en": "Qatar"
    }
  },
  {
    "id": "bosnia-and-herzegovina",
    "name": "Bosnia and Herzegovina",
    "league": "Millî / National",
    "strength": 73,
    "attack": 73,
    "defense": 73,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "BA",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/bosnia-and-herzegovina.png",
    "group": "B",
    "names": {
      "tr": "Bosna-Hersek",
      "en": "Bosnia and Herzegovina"
    }
  },
  {
    "id": "brazil",
    "name": "Brazil",
    "league": "Millî / National",
    "strength": 89,
    "attack": 91,
    "defense": 84,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "BR",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "intl"
    ],
    "logo": "assets/logos/brazil.png",
    "group": "C",
    "names": {
      "tr": "Brezilya",
      "en": "Brazil"
    }
  },
  {
    "id": "morocco",
    "name": "Morocco",
    "league": "Millî / National",
    "strength": 84,
    "attack": 84,
    "defense": 84,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "MA",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "intl"
    ],
    "logo": "assets/logos/morocco.png",
    "group": "C",
    "names": {
      "tr": "Fas",
      "en": "Morocco"
    }
  },
  {
    "id": "haiti",
    "name": "Haiti",
    "league": "Millî / National",
    "strength": 59,
    "attack": 59,
    "defense": 59,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "HT",
    "quality": "editorial",
    "competitions": [
      "worldcup"
    ],
    "logo": "assets/logos/haiti.png",
    "group": "C",
    "names": {
      "tr": "Haiti",
      "en": "Haiti"
    }
  },
  {
    "id": "scotland",
    "name": "Scotland",
    "league": "Millî / National",
    "strength": 74,
    "attack": 74,
    "defense": 74,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "GB-SCT",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/scotland.png",
    "group": "C",
    "names": {
      "tr": "İskoçya",
      "en": "Scotland"
    }
  },
  {
    "id": "united-states",
    "name": "United States",
    "league": "Millî / National",
    "strength": 79,
    "attack": 79,
    "defense": 79,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "US",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "intl"
    ],
    "logo": "assets/logos/united-states.png",
    "group": "D",
    "names": {
      "tr": "ABD",
      "en": "United States"
    }
  },
  {
    "id": "paraguay",
    "name": "Paraguay",
    "league": "Millî / National",
    "strength": 75,
    "attack": 75,
    "defense": 75,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "PY",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "intl"
    ],
    "logo": "assets/logos/paraguay.png",
    "group": "D",
    "names": {
      "tr": "Paraguay",
      "en": "Paraguay"
    }
  },
  {
    "id": "australia",
    "name": "Australia",
    "league": "Millî / National",
    "strength": 73,
    "attack": 73,
    "defense": 73,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "AU",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "intl"
    ],
    "logo": "assets/logos/australia.png",
    "group": "D",
    "names": {
      "tr": "Avustralya",
      "en": "Australia"
    }
  },
  {
    "id": "turkiye",
    "name": "Türkiye",
    "league": "Millî / National",
    "strength": 81,
    "attack": 83,
    "defense": 77,
    "color": "#df2035",
    "secondary": "#ffffff",
    "short": "TR",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/turkiye.png",
    "group": "D",
    "names": {
      "tr": "Türkiye",
      "en": "Turkey"
    }
  },
  {
    "id": "germany",
    "name": "Germany",
    "league": "Millî / National",
    "strength": 87,
    "attack": 88,
    "defense": 84,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "DE",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/germany.png",
    "group": "E",
    "names": {
      "tr": "Almanya",
      "en": "Germany"
    }
  },
  {
    "id": "curacao",
    "name": "Curaçao",
    "league": "Millî / National",
    "strength": 58,
    "attack": 58,
    "defense": 58,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "CW",
    "quality": "editorial",
    "competitions": [
      "worldcup"
    ],
    "logo": "assets/logos/curacao.png",
    "group": "E",
    "names": {
      "tr": "Curaçao",
      "en": "Curaçao"
    }
  },
  {
    "id": "cote-divoire",
    "name": "Côte d’Ivoire",
    "league": "Millî / National",
    "strength": 76,
    "attack": 76,
    "defense": 76,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "CI",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "intl"
    ],
    "logo": "assets/logos/cote-divoire.png",
    "group": "E",
    "names": {
      "tr": "Fildişi Sahili",
      "en": "Ivory Coast"
    }
  },
  {
    "id": "ecuador",
    "name": "Ecuador",
    "league": "Millî / National",
    "strength": 78,
    "attack": 78,
    "defense": 78,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "EC",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "intl"
    ],
    "logo": "assets/logos/ecuador.png",
    "group": "E",
    "names": {
      "tr": "Ekvador",
      "en": "Ecuador"
    }
  },
  {
    "id": "netherlands",
    "name": "Netherlands",
    "league": "Millî / National",
    "strength": 89,
    "attack": 89,
    "defense": 89,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "NL",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/netherlands.png",
    "group": "F",
    "names": {
      "tr": "Hollanda",
      "en": "Netherlands"
    }
  },
  {
    "id": "japan",
    "name": "Japan",
    "league": "Millî / National",
    "strength": 82,
    "attack": 82,
    "defense": 82,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "JP",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "intl"
    ],
    "logo": "assets/logos/japan.png",
    "group": "F",
    "names": {
      "tr": "Japonya",
      "en": "Japan"
    }
  },
  {
    "id": "tunisia",
    "name": "Tunisia",
    "league": "Millî / National",
    "strength": 69,
    "attack": 69,
    "defense": 69,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "TN",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "intl"
    ],
    "logo": "assets/logos/tunisia.png",
    "group": "F",
    "names": {
      "tr": "Tunus",
      "en": "Tunisia"
    }
  },
  {
    "id": "sweden",
    "name": "Sweden",
    "league": "Millî / National",
    "strength": 78,
    "attack": 78,
    "defense": 78,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "SE",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/sweden.png",
    "group": "F",
    "names": {
      "tr": "İsveç",
      "en": "Sweden"
    }
  },
  {
    "id": "belgium",
    "name": "Belgium",
    "league": "Millî / National",
    "strength": 86,
    "attack": 86,
    "defense": 86,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "BE",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/belgium.png",
    "group": "G",
    "names": {
      "tr": "Belçika",
      "en": "Belgium"
    }
  },
  {
    "id": "egypt",
    "name": "Egypt",
    "league": "Millî / National",
    "strength": 75,
    "attack": 75,
    "defense": 75,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "EG",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "intl"
    ],
    "logo": "assets/logos/egypt.png",
    "group": "G",
    "names": {
      "tr": "Mısır",
      "en": "Egypt"
    }
  },
  {
    "id": "iran",
    "name": "Iran",
    "league": "Millî / National",
    "strength": 73,
    "attack": 73,
    "defense": 73,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "IR",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "intl"
    ],
    "logo": "assets/logos/iran.png",
    "group": "G",
    "names": {
      "tr": "İran",
      "en": "Iran"
    }
  },
  {
    "id": "new-zealand",
    "name": "New Zealand",
    "league": "Millî / National",
    "strength": 58,
    "attack": 58,
    "defense": 58,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "NZ",
    "quality": "editorial",
    "competitions": [
      "worldcup"
    ],
    "logo": "assets/logos/new-zealand.png",
    "group": "G",
    "names": {
      "tr": "Yeni Zelanda",
      "en": "New Zealand"
    }
  },
  {
    "id": "spain",
    "name": "Spain",
    "league": "Millî / National",
    "strength": 91,
    "attack": 92,
    "defense": 88,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "ES",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/spain.png",
    "group": "H",
    "names": {
      "tr": "İspanya",
      "en": "Spain"
    }
  },
  {
    "id": "cabo-verde",
    "name": "Cabo Verde",
    "league": "Millî / National",
    "strength": 66,
    "attack": 66,
    "defense": 66,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "CV",
    "quality": "editorial",
    "competitions": [
      "worldcup"
    ],
    "logo": "assets/logos/cabo-verde.png",
    "group": "H",
    "names": {
      "tr": "Yeşil Burun Adaları",
      "en": "Cape Verde"
    }
  },
  {
    "id": "saudi-arabia",
    "name": "Saudi Arabia",
    "league": "Millî / National",
    "strength": 68,
    "attack": 68,
    "defense": 68,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "SA",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "intl"
    ],
    "logo": "assets/logos/saudi-arabia.png",
    "group": "H",
    "names": {
      "tr": "Suudi Arabistan",
      "en": "Saudi Arabia"
    }
  },
  {
    "id": "uruguay",
    "name": "Uruguay",
    "league": "Millî / National",
    "strength": 84,
    "attack": 84,
    "defense": 84,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "UY",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "intl"
    ],
    "logo": "assets/logos/uruguay.png",
    "group": "H",
    "names": {
      "tr": "Uruguay",
      "en": "Uruguay"
    }
  },
  {
    "id": "france",
    "name": "France",
    "league": "Millî / National",
    "strength": 91,
    "attack": 92,
    "defense": 88,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "FR",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/france.png",
    "group": "I",
    "names": {
      "tr": "Fransa",
      "en": "France"
    }
  },
  {
    "id": "senegal",
    "name": "Senegal",
    "league": "Millî / National",
    "strength": 80,
    "attack": 80,
    "defense": 80,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "SN",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "intl"
    ],
    "logo": "assets/logos/senegal.png",
    "group": "I",
    "names": {
      "tr": "Senegal",
      "en": "Senegal"
    }
  },
  {
    "id": "norway",
    "name": "Norway",
    "league": "Millî / National",
    "strength": 83,
    "attack": 83,
    "defense": 83,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "NO",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/norway.png",
    "group": "I",
    "names": {
      "tr": "Norveç",
      "en": "Norway"
    }
  },
  {
    "id": "iraq",
    "name": "Iraq",
    "league": "Millî / National",
    "strength": 66,
    "attack": 66,
    "defense": 66,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "IQ",
    "quality": "editorial",
    "competitions": [
      "worldcup"
    ],
    "logo": "assets/logos/iraq.png",
    "group": "I",
    "names": {
      "tr": "Irak",
      "en": "Iraq"
    }
  },
  {
    "id": "argentina",
    "name": "Argentina",
    "league": "Millî / National",
    "strength": 91,
    "attack": 92,
    "defense": 89,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "AR",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "intl"
    ],
    "logo": "assets/logos/argentina.png",
    "group": "J",
    "names": {
      "tr": "Arjantin",
      "en": "Argentina"
    }
  },
  {
    "id": "algeria",
    "name": "Algeria",
    "league": "Millî / National",
    "strength": 76,
    "attack": 76,
    "defense": 76,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "DZ",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "intl"
    ],
    "logo": "assets/logos/algeria.png",
    "group": "J",
    "names": {
      "tr": "Cezayir",
      "en": "Algeria"
    }
  },
  {
    "id": "austria",
    "name": "Austria",
    "league": "Millî / National",
    "strength": 81,
    "attack": 81,
    "defense": 81,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "AT",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/austria.png",
    "group": "J",
    "names": {
      "tr": "Avusturya",
      "en": "Austria"
    }
  },
  {
    "id": "jordan",
    "name": "Jordan",
    "league": "Millî / National",
    "strength": 62,
    "attack": 62,
    "defense": 62,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "JO",
    "quality": "editorial",
    "competitions": [
      "worldcup"
    ],
    "logo": "assets/logos/jordan.png",
    "group": "J",
    "names": {
      "tr": "Ürdün",
      "en": "Jordan"
    }
  },
  {
    "id": "portugal",
    "name": "Portugal",
    "league": "Millî / National",
    "strength": 89,
    "attack": 91,
    "defense": 84,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "PT",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/portugal.png",
    "group": "K",
    "names": {
      "tr": "Portekiz",
      "en": "Portugal"
    }
  },
  {
    "id": "uzbekistan",
    "name": "Uzbekistan",
    "league": "Millî / National",
    "strength": 68,
    "attack": 68,
    "defense": 68,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "UZ",
    "quality": "editorial",
    "competitions": [
      "worldcup"
    ],
    "logo": "assets/logos/uzbekistan.png",
    "group": "K",
    "names": {
      "tr": "Özbekistan",
      "en": "Uzbekistan"
    }
  },
  {
    "id": "colombia",
    "name": "Colombia",
    "league": "Millî / National",
    "strength": 83,
    "attack": 83,
    "defense": 83,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "CO",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "intl"
    ],
    "logo": "assets/logos/colombia.png",
    "group": "K",
    "names": {
      "tr": "Kolombiya",
      "en": "Colombia"
    }
  },
  {
    "id": "congo-dr",
    "name": "Congo DR",
    "league": "Millî / National",
    "strength": 72,
    "attack": 72,
    "defense": 72,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "CD",
    "quality": "editorial",
    "competitions": [
      "worldcup"
    ],
    "logo": "assets/logos/congo-dr.png",
    "group": "K",
    "names": {
      "tr": "Kongo DC",
      "en": "DR Congo"
    }
  },
  {
    "id": "england",
    "name": "England",
    "league": "Millî / National",
    "strength": 90,
    "attack": 91,
    "defense": 86,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "GB-ENG",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/england.png",
    "group": "L",
    "names": {
      "tr": "İngiltere",
      "en": "England"
    }
  },
  {
    "id": "croatia",
    "name": "Croatia",
    "league": "Millî / National",
    "strength": 82,
    "attack": 82,
    "defense": 82,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "HR",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/croatia.png",
    "group": "L",
    "names": {
      "tr": "Hırvatistan",
      "en": "Croatia"
    }
  },
  {
    "id": "ghana",
    "name": "Ghana",
    "league": "Millî / National",
    "strength": 75,
    "attack": 75,
    "defense": 75,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "GH",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "intl"
    ],
    "logo": "assets/logos/ghana.png",
    "group": "L",
    "names": {
      "tr": "Gana",
      "en": "Ghana"
    }
  },
  {
    "id": "panama",
    "name": "Panama",
    "league": "Millî / National",
    "strength": 64,
    "attack": 64,
    "defense": 64,
    "color": "#f6f6f0",
    "secondary": "#263f62",
    "short": "PA",
    "quality": "editorial",
    "competitions": [
      "worldcup",
      "national",
      "intl"
    ],
    "logo": "assets/logos/panama.png",
    "group": "L",
    "names": {
      "tr": "Panama",
      "en": "Panama"
    }
  },
  {
    "id": "benfica",
    "name": "Benfica",
    "league": "Portugal",
    "strength": 84,
    "attack": 85,
    "defense": 81,
    "color": "#e44c50",
    "secondary": "#f4efdf",
    "short": "SLB",
    "quality": "editorial",
    "competitions": [
      "other",
      "uel"
    ],
    "logo": "assets/logos/benfica.png"
  },
  {
    "id": "ajax",
    "name": "Ajax",
    "league": "Nederland",
    "strength": 80,
    "attack": 83,
    "defense": 74,
    "color": "#e26765",
    "secondary": "#f2f0e7",
    "short": "AJA",
    "quality": "editorial",
    "competitions": [
      "other",
      "uecl"
    ],
    "logo": "assets/logos/ajax.png"
  },
  {
    "id": "italy",
    "name": "Italia",
    "league": "Millî / National",
    "strength": 85,
    "attack": 82,
    "defense": 89,
    "color": "#648cda",
    "secondary": "#ede9df",
    "short": "IT",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/italy.png",
    "names": {
      "tr": "İtalya",
      "en": "Italy"
    }
  },
  {
    "id": "az-alkmaar",
    "name": "AZ Alkmaar",
    "league": "netherlands",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "AZA",
    "quality": "generic-prior",
    "competitions": [
      "uel"
    ],
    "logo": "assets/logos/fl-az-alkmaar.png"
  },
  {
    "id": "torreense",
    "name": "S.C.U. Torreense",
    "league": "portugal",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "SCU",
    "quality": "generic-prior",
    "competitions": [
      "uel"
    ],
    "logo": "assets/logos/fl-torreense.png"
  },
  {
    "id": "union-saint-gilloise",
    "name": "Union Saint-Gilloise",
    "league": "belgium",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "USG",
    "quality": "generic-prior",
    "competitions": [
      "uel"
    ],
    "logo": "assets/logos/fl-union-saint-gilloise.png"
  },
  {
    "id": "sparta-praha",
    "name": "AC Sparta Praha",
    "league": "czech-republic",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "ACS",
    "quality": "generic-prior",
    "competitions": [
      "uel"
    ],
    "logo": "assets/logos/fl-sparta-praha.png"
  },
  {
    "id": "olympiacos",
    "name": "Olympiacos",
    "league": "greece",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "O",
    "quality": "generic-prior",
    "competitions": [
      "uel"
    ],
    "logo": "assets/logos/fl-olympiacos.png"
  },
  {
    "id": "sturm-graz",
    "name": "Sturm Graz",
    "league": "austria",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "SG",
    "quality": "generic-prior",
    "competitions": [
      "uel"
    ],
    "logo": "assets/logos/fl-sturm-graz.png"
  },
  {
    "id": "celtic",
    "name": "Celtic",
    "league": "scotland",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "C",
    "quality": "generic-prior",
    "competitions": [
      "uel"
    ],
    "logo": "assets/logos/fl-celtic.png"
  },
  {
    "id": "hapoel-beer-sheva",
    "name": "Hapoel Be'er Sheva",
    "league": "israel",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "HBS",
    "quality": "generic-prior",
    "competitions": [
      "uel"
    ],
    "logo": "assets/logos/fl-hapoel-beer-sheva.png"
  },
  {
    "id": "nec-nijmegen",
    "name": "N.E.C. Nijmegen",
    "league": "netherlands",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "NEC",
    "quality": "generic-prior",
    "competitions": [
      "uel"
    ],
    "logo": "assets/logos/fl-nec-nijmegen.png"
  },
  {
    "id": "levski",
    "name": "Levski Sofia",
    "league": "bulgaria",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "LS",
    "quality": "generic-prior",
    "competitions": [
      "uel"
    ],
    "logo": "assets/logos/fl-levski.png"
  },
  {
    "id": "dinamo-zagreb",
    "name": "GNK Dinamo Zagreb",
    "league": "croatia",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "GNK",
    "quality": "generic-prior",
    "competitions": [
      "uel"
    ],
    "logo": "assets/logos/fl-dinamo-zagreb.png"
  },
  {
    "id": "celje",
    "name": "Celje",
    "league": "slovenia",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "C",
    "quality": "generic-prior",
    "competitions": [
      "uel"
    ],
    "logo": "assets/logos/fl-celje.png"
  },
  {
    "id": "ararat-armenia",
    "name": "Ararat-Armenia",
    "league": "armenia",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "AA",
    "quality": "generic-prior",
    "competitions": [
      "uel"
    ],
    "logo": "assets/logos/fl-ararat-armenia.png"
  },
  {
    "id": "jagiellonia",
    "name": "Jagiellonia Białystok",
    "league": "poland",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "JBł",
    "quality": "generic-prior",
    "competitions": [
      "uel"
    ],
    "logo": "assets/logos/fl-jagiellonia.png"
  },
  {
    "id": "omonoia",
    "name": "Omonoia Nicosia",
    "league": "cyprus",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "ON",
    "quality": "generic-prior",
    "competitions": [
      "uel"
    ],
    "logo": "assets/logos/fl-omonoia.png"
  },
  {
    "id": "viktoria-plzen",
    "name": "Viktoria Plzeň",
    "league": "czech-republic",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "VPň",
    "quality": "generic-prior",
    "competitions": [
      "uel"
    ],
    "logo": "assets/logos/fl-viktoria-plzen.png"
  },
  {
    "id": "lillestrom",
    "name": "Lillestrøm",
    "league": "norway",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "Lø",
    "quality": "generic-prior",
    "competitions": [
      "uel"
    ],
    "logo": "assets/logos/fl-lillestrom.png"
  },
  {
    "id": "salzburg",
    "name": "Salzburg",
    "league": "austria",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "S",
    "quality": "generic-prior",
    "competitions": [
      "uel"
    ],
    "logo": "assets/logos/fl-salzburg.png"
  },
  {
    "id": "lech-poznan",
    "name": "Lech Poznań",
    "league": "poland",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "LPń",
    "quality": "generic-prior",
    "competitions": [
      "uel"
    ],
    "logo": "assets/logos/fl-lech-poznan.png"
  },
  {
    "id": "ofi",
    "name": "OFI",
    "league": "greece",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "OFI",
    "quality": "generic-prior",
    "competitions": [
      "uel"
    ],
    "logo": "assets/logos/fl-ofi.png"
  },
  {
    "id": "ferencvaros",
    "name": "Ferencváros",
    "league": "hungary",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "Fá",
    "quality": "generic-prior",
    "competitions": [
      "uel"
    ],
    "logo": "assets/logos/fl-ferencvaros.png"
  },
  {
    "id": "anderlecht",
    "name": "RSC Anderlecht",
    "league": "belgium",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "RSC",
    "quality": "generic-prior",
    "competitions": [
      "uel"
    ],
    "logo": "assets/logos/fl-anderlecht.png"
  },
  {
    "id": "borac",
    "name": "Borac Banja Luka",
    "league": "bosnia-and-herzegovina",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "BBL",
    "quality": "generic-prior",
    "competitions": [
      "uecl"
    ],
    "logo": "assets/logos/fl-borac.png"
  },
  {
    "id": "sc-braga",
    "name": "SC Braga",
    "league": "portugal",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "SCB",
    "quality": "generic-prior",
    "competitions": [
      "uecl"
    ],
    "logo": "assets/logos/fl-sc-braga.png"
  },
  {
    "id": "brann",
    "name": "Brann",
    "league": "norway",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "B",
    "quality": "generic-prior",
    "competitions": [
      "uecl"
    ],
    "logo": "assets/logos/fl-brann.png"
  },
  {
    "id": "copenhagen",
    "name": "F.C. Copenhagen",
    "league": "denmark",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "FCC",
    "quality": "generic-prior",
    "competitions": [
      "uecl"
    ],
    "logo": "assets/logos/fl-copenhagen.png"
  },
  {
    "id": "gent",
    "name": "KAA Gent",
    "league": "belgium",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "KAA",
    "quality": "generic-prior",
    "competitions": [
      "uecl"
    ],
    "logo": "assets/logos/fl-gent.png"
  },
  {
    "id": "hajduk-split",
    "name": "Hajduk Split",
    "league": "croatia",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "HS",
    "quality": "generic-prior",
    "competitions": [
      "uecl"
    ],
    "logo": "assets/logos/fl-hajduk-split.png"
  },
  {
    "id": "hearts",
    "name": "Hearts",
    "league": "scotland",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "H",
    "quality": "generic-prior",
    "competitions": [
      "uecl"
    ],
    "logo": "assets/logos/fl-hearts.png"
  },
  {
    "id": "inter-escaldes",
    "name": "Inter Escaldes",
    "league": "andorra",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "IE",
    "quality": "generic-prior",
    "competitions": [
      "uecl"
    ],
    "logo": "assets/logos/fl-inter-escaldes.png"
  },
  {
    "id": "jablonec",
    "name": "Jablonec",
    "league": "czech-republic",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "J",
    "quality": "generic-prior",
    "competitions": [
      "uecl"
    ],
    "logo": "assets/logos/fl-jablonec.png"
  },
  {
    "id": "kups",
    "name": "KuPS",
    "league": "finland",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "KPS",
    "quality": "generic-prior",
    "competitions": [
      "uecl"
    ],
    "logo": "assets/logos/fl-kups.png"
  },
  {
    "id": "lincoln-red-imps",
    "name": "Lincoln Red Imps",
    "league": "gibraltar",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "LRI",
    "quality": "generic-prior",
    "competitions": [
      "uecl"
    ],
    "logo": "assets/logos/fl-lincoln-red-imps.png"
  },
  {
    "id": "lugano",
    "name": "Lugano",
    "league": "switzerland",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "L",
    "quality": "generic-prior",
    "competitions": [
      "uecl"
    ],
    "logo": "assets/logos/fl-lugano.png"
  },
  {
    "id": "midtjylland",
    "name": "FC Midtjylland",
    "league": "denmark",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "FCM",
    "quality": "generic-prior",
    "competitions": [
      "uecl"
    ],
    "logo": "assets/logos/fl-midtjylland.png"
  },
  {
    "id": "nordsjaelland",
    "name": "FC Nordsjælland",
    "league": "denmark",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "FCN",
    "quality": "generic-prior",
    "competitions": [
      "uecl"
    ],
    "logo": "assets/logos/fl-nordsjaelland.png"
  },
  {
    "id": "pafos",
    "name": "Pafos",
    "league": "cyprus",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "P",
    "quality": "generic-prior",
    "competitions": [
      "uecl"
    ],
    "logo": "assets/logos/fl-pafos.png"
  },
  {
    "id": "panathinaikos",
    "name": "Panathinaikos",
    "league": "greece",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "P",
    "quality": "generic-prior",
    "competitions": [
      "uecl"
    ],
    "logo": "assets/logos/fl-panathinaikos.png"
  },
  {
    "id": "riga",
    "name": "Riga",
    "league": "latvia",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "R",
    "quality": "generic-prior",
    "competitions": [
      "uecl"
    ],
    "logo": "assets/logos/fl-riga.png"
  },
  {
    "id": "twente",
    "name": "Twente",
    "league": "netherlands",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "T",
    "quality": "generic-prior",
    "competitions": [
      "uecl"
    ],
    "logo": "assets/logos/fl-twente.png"
  },
  {
    "id": "u-craiova",
    "name": "Universitatea Craiova",
    "league": "romania",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "UC",
    "quality": "generic-prior",
    "competitions": [
      "uecl"
    ],
    "logo": "assets/logos/fl-u-craiova.png"
  },
  {
    "id": "iberia",
    "name": "Iberia",
    "league": "georgia",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "I",
    "quality": "generic-prior",
    "competitions": [
      "uecl"
    ],
    "logo": "assets/logos/fl-iberia.png"
  },
  {
    "id": "sint-truidense",
    "name": "Sint-Truidense VV",
    "league": "belgium",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "STV",
    "quality": "generic-prior",
    "competitions": [
      "uecl"
    ],
    "logo": "assets/logos/fl-sint-truidense.png"
  },
  {
    "id": "crvena-zvezda",
    "name": "Crvena Zvezda",
    "league": "serbia",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "CZ",
    "quality": "generic-prior",
    "competitions": [
      "uecl"
    ],
    "logo": "assets/logos/fl-crvena-zvezda.png"
  },
  {
    "id": "egnatia",
    "name": "Egnatia",
    "league": "albania",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "E",
    "quality": "generic-prior",
    "competitions": [
      "uecl"
    ],
    "logo": "assets/logos/fl-egnatia.png"
  },
  {
    "id": "mjallby",
    "name": "Mjällby",
    "league": "sweden",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "Mä",
    "quality": "generic-prior",
    "competitions": [
      "uecl"
    ],
    "logo": "assets/logos/fl-mjallby.png"
  },
  {
    "id": "kauno-zalgiris",
    "name": "Kauno Žalgiris",
    "league": "lithuania",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "KŽ",
    "quality": "generic-prior",
    "competitions": [
      "uecl"
    ],
    "logo": "assets/logos/fl-kauno-zalgiris.png"
  },
  {
    "id": "thun",
    "name": "Thun",
    "league": "switzerland",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "T",
    "quality": "generic-prior",
    "competitions": [
      "uecl"
    ],
    "logo": "assets/logos/fl-thun.png"
  },
  {
    "id": "agf",
    "name": "AGF",
    "league": "denmark",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "AGF",
    "quality": "generic-prior",
    "competitions": [
      "uecl"
    ],
    "logo": "assets/logos/fl-agf.png"
  },
  {
    "id": "cska-sofia",
    "name": "CSKA-Sofia",
    "league": "bulgaria",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "CSK",
    "quality": "generic-prior",
    "competitions": [
      "uecl"
    ],
    "logo": "assets/logos/fl-cska-sofia.png"
  },
  {
    "id": "kairat",
    "name": "Kairat",
    "league": "kazakhstan",
    "strength": 70,
    "attack": 70,
    "defense": 70,
    "color": "#34536b",
    "secondary": "#ffffff",
    "short": "K",
    "quality": "generic-prior",
    "competitions": [
      "uecl"
    ],
    "logo": "assets/logos/fl-kairat.png"
  },
  {
    "id": "albania",
    "name": "Albania",
    "league": "Millî / National",
    "strength": 70,
    "attack": 69,
    "defense": 71,
    "color": "#e41e20",
    "secondary": "#111111",
    "short": "ALB",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/albania.png",
    "names": {
      "tr": "Arnavutluk",
      "en": "Albania"
    }
  },
  {
    "id": "andorra",
    "name": "Andorra",
    "league": "Millî / National",
    "strength": 50,
    "attack": 49,
    "defense": 51,
    "color": "#10069f",
    "secondary": "#fedf00",
    "short": "AND",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/andorra.png",
    "names": {
      "tr": "Andorra",
      "en": "Andorra"
    }
  },
  {
    "id": "armenia",
    "name": "Armenia",
    "league": "Millî / National",
    "strength": 62,
    "attack": 61,
    "defense": 63,
    "color": "#d90012",
    "secondary": "#f2a800",
    "short": "ARM",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/armenia.png",
    "names": {
      "tr": "Ermenistan",
      "en": "Armenia"
    }
  },
  {
    "id": "azerbaijan",
    "name": "Azerbaijan",
    "league": "Millî / National",
    "strength": 58,
    "attack": 57,
    "defense": 59,
    "color": "#00b5e2",
    "secondary": "#ef3340",
    "short": "AZE",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/azerbaijan.png",
    "names": {
      "tr": "Azerbaycan",
      "en": "Azerbaijan"
    }
  },
  {
    "id": "belarus",
    "name": "Belarus",
    "league": "Millî / National",
    "strength": 58,
    "attack": 57,
    "defense": 59,
    "color": "#c8313e",
    "secondary": "#ffffff",
    "short": "BLR",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/belarus.png",
    "names": {
      "tr": "Belarus",
      "en": "Belarus"
    }
  },
  {
    "id": "bulgaria",
    "name": "Bulgaria",
    "league": "Millî / National",
    "strength": 60,
    "attack": 59,
    "defense": 61,
    "color": "#ffffff",
    "secondary": "#00966e",
    "short": "BUL",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/bulgaria.png",
    "names": {
      "tr": "Bulgaristan",
      "en": "Bulgaria"
    }
  },
  {
    "id": "cyprus",
    "name": "Cyprus",
    "league": "Millî / National",
    "strength": 55,
    "attack": 54,
    "defense": 56,
    "color": "#2f5aa8",
    "secondary": "#ffffff",
    "short": "CYP",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/cyprus.png",
    "names": {
      "tr": "Güney Kıbrıs",
      "en": "Cyprus"
    }
  },
  {
    "id": "denmark",
    "name": "Denmark",
    "league": "Millî / National",
    "strength": 80,
    "attack": 79,
    "defense": 81,
    "color": "#c60c30",
    "secondary": "#ffffff",
    "short": "DEN",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/denmark.png",
    "names": {
      "tr": "Danimarka",
      "en": "Denmark"
    }
  },
  {
    "id": "estonia",
    "name": "Estonia",
    "league": "Millî / National",
    "strength": 52,
    "attack": 51,
    "defense": 53,
    "color": "#0072ce",
    "secondary": "#111111",
    "short": "EST",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/estonia.png",
    "names": {
      "tr": "Estonya",
      "en": "Estonia"
    }
  },
  {
    "id": "faroe-islands",
    "name": "Faroe Islands",
    "league": "Millî / National",
    "strength": 52,
    "attack": 51,
    "defense": 53,
    "color": "#ffffff",
    "secondary": "#005eb8",
    "short": "FRO",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/faroe-islands.png",
    "names": {
      "tr": "Faroe Adaları",
      "en": "Faroe Islands"
    }
  },
  {
    "id": "finland",
    "name": "Finland",
    "league": "Millî / National",
    "strength": 64,
    "attack": 63,
    "defense": 65,
    "color": "#ffffff",
    "secondary": "#002f6c",
    "short": "FIN",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/finland.png",
    "names": {
      "tr": "Finlandiya",
      "en": "Finland"
    }
  },
  {
    "id": "georgia",
    "name": "Georgia",
    "league": "Millî / National",
    "strength": 70,
    "attack": 69,
    "defense": 71,
    "color": "#ffffff",
    "secondary": "#da291c",
    "short": "GEO",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/georgia.png",
    "names": {
      "tr": "Gürcistan",
      "en": "Georgia"
    }
  },
  {
    "id": "gibraltar",
    "name": "Gibraltar",
    "league": "Millî / National",
    "strength": 45,
    "attack": 44,
    "defense": 46,
    "color": "#da000c",
    "secondary": "#ffffff",
    "short": "GIB",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/gibraltar.png",
    "names": {
      "tr": "Cebelitarık",
      "en": "Gibraltar"
    }
  },
  {
    "id": "greece",
    "name": "Greece",
    "league": "Millî / National",
    "strength": 72,
    "attack": 71,
    "defense": 73,
    "color": "#0d5eaf",
    "secondary": "#ffffff",
    "short": "GRE",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/greece.png",
    "names": {
      "tr": "Yunanistan",
      "en": "Greece"
    }
  },
  {
    "id": "hungary",
    "name": "Hungary",
    "league": "Millî / National",
    "strength": 73,
    "attack": 72,
    "defense": 74,
    "color": "#ce2939",
    "secondary": "#ffffff",
    "short": "HUN",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/hungary.png",
    "names": {
      "tr": "Macaristan",
      "en": "Hungary"
    }
  },
  {
    "id": "iceland",
    "name": "Iceland",
    "league": "Millî / National",
    "strength": 63,
    "attack": 62,
    "defense": 64,
    "color": "#02529c",
    "secondary": "#ffffff",
    "short": "ISL",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/iceland.png",
    "names": {
      "tr": "İzlanda",
      "en": "Iceland"
    }
  },
  {
    "id": "israel",
    "name": "Israel",
    "league": "Millî / National",
    "strength": 62,
    "attack": 61,
    "defense": 63,
    "color": "#0038b8",
    "secondary": "#ffffff",
    "short": "ISR",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/israel.png",
    "names": {
      "tr": "İsrail",
      "en": "Israel"
    }
  },
  {
    "id": "kazakhstan",
    "name": "Kazakhstan",
    "league": "Millî / National",
    "strength": 57,
    "attack": 56,
    "defense": 58,
    "color": "#00afca",
    "secondary": "#fec50c",
    "short": "KAZ",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/kazakhstan.png",
    "names": {
      "tr": "Kazakistan",
      "en": "Kazakhstan"
    }
  },
  {
    "id": "kosovo",
    "name": "Kosovo",
    "league": "Millî / National",
    "strength": 60,
    "attack": 59,
    "defense": 61,
    "color": "#244aa5",
    "secondary": "#d0a650",
    "short": "KOS",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/kosovo.png",
    "names": {
      "tr": "Kosova",
      "en": "Kosovo"
    }
  },
  {
    "id": "latvia",
    "name": "Latvia",
    "league": "Millî / National",
    "strength": 50,
    "attack": 49,
    "defense": 51,
    "color": "#9e3039",
    "secondary": "#ffffff",
    "short": "LVA",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/latvia.png",
    "names": {
      "tr": "Letonya",
      "en": "Latvia"
    }
  },
  {
    "id": "liechtenstein",
    "name": "Liechtenstein",
    "league": "Millî / National",
    "strength": 45,
    "attack": 44,
    "defense": 46,
    "color": "#002b7f",
    "secondary": "#ce1126",
    "short": "LIE",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/liechtenstein.png",
    "names": {
      "tr": "Lihtenştayn",
      "en": "Liechtenstein"
    }
  },
  {
    "id": "lithuania",
    "name": "Lithuania",
    "league": "Millî / National",
    "strength": 52,
    "attack": 51,
    "defense": 53,
    "color": "#fdb913",
    "secondary": "#006a44",
    "short": "LTU",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/lithuania.png",
    "names": {
      "tr": "Litvanya",
      "en": "Lithuania"
    }
  },
  {
    "id": "luxembourg",
    "name": "Luxembourg",
    "league": "Millî / National",
    "strength": 56,
    "attack": 55,
    "defense": 57,
    "color": "#ed2939",
    "secondary": "#ffffff",
    "short": "LUX",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/luxembourg.png",
    "names": {
      "tr": "Lüksemburg",
      "en": "Luxembourg"
    }
  },
  {
    "id": "malta",
    "name": "Malta",
    "league": "Millî / National",
    "strength": 48,
    "attack": 47,
    "defense": 49,
    "color": "#cf142b",
    "secondary": "#ffffff",
    "short": "MLT",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/malta.png",
    "names": {
      "tr": "Malta",
      "en": "Malta"
    }
  },
  {
    "id": "moldova",
    "name": "Moldova",
    "league": "Millî / National",
    "strength": 48,
    "attack": 47,
    "defense": 49,
    "color": "#0046ae",
    "secondary": "#ffd200",
    "short": "MDA",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/moldova.png",
    "names": {
      "tr": "Moldova",
      "en": "Moldova"
    }
  },
  {
    "id": "montenegro",
    "name": "Montenegro",
    "league": "Millî / National",
    "strength": 60,
    "attack": 59,
    "defense": 61,
    "color": "#c40308",
    "secondary": "#d4af3a",
    "short": "MNE",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/montenegro.png",
    "names": {
      "tr": "Karadağ",
      "en": "Montenegro"
    }
  },
  {
    "id": "north-macedonia",
    "name": "North Macedonia",
    "league": "Millî / National",
    "strength": 58,
    "attack": 57,
    "defense": 59,
    "color": "#d20000",
    "secondary": "#ffe600",
    "short": "MKD",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/north-macedonia.png",
    "names": {
      "tr": "Kuzey Makedonya",
      "en": "North Macedonia"
    }
  },
  {
    "id": "northern-ireland",
    "name": "Northern Ireland",
    "league": "Millî / National",
    "strength": 62,
    "attack": 61,
    "defense": 63,
    "color": "#00843d",
    "secondary": "#ffffff",
    "short": "NIR",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/northern-ireland.png",
    "names": {
      "tr": "Kuzey İrlanda",
      "en": "Northern Ireland"
    }
  },
  {
    "id": "poland",
    "name": "Poland",
    "league": "Millî / National",
    "strength": 75,
    "attack": 74,
    "defense": 76,
    "color": "#f4f4f2",
    "secondary": "#dc143c",
    "short": "POL",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/poland.png",
    "names": {
      "tr": "Polonya",
      "en": "Poland"
    }
  },
  {
    "id": "republic-of-ireland",
    "name": "Republic of Ireland",
    "league": "Millî / National",
    "strength": 65,
    "attack": 64,
    "defense": 66,
    "color": "#169b62",
    "secondary": "#ffffff",
    "short": "IRL",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/republic-of-ireland.png",
    "names": {
      "tr": "İrlanda",
      "en": "Republic of Ireland"
    }
  },
  {
    "id": "romania",
    "name": "Romania",
    "league": "Millî / National",
    "strength": 68,
    "attack": 67,
    "defense": 69,
    "color": "#fcd116",
    "secondary": "#002b7f",
    "short": "ROU",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/romania.png",
    "names": {
      "tr": "Romanya",
      "en": "Romania"
    }
  },
  {
    "id": "san-marino",
    "name": "San Marino",
    "league": "Millî / National",
    "strength": 40,
    "attack": 40,
    "defense": 41,
    "color": "#5eb6e4",
    "secondary": "#ffffff",
    "short": "SMR",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/san-marino.png",
    "names": {
      "tr": "San Marino",
      "en": "San Marino"
    }
  },
  {
    "id": "serbia",
    "name": "Serbia",
    "league": "Millî / National",
    "strength": 74,
    "attack": 73,
    "defense": 75,
    "color": "#c6363c",
    "secondary": "#0c4076",
    "short": "SRB",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/serbia.png",
    "names": {
      "tr": "Sırbistan",
      "en": "Serbia"
    }
  },
  {
    "id": "slovakia",
    "name": "Slovakia",
    "league": "Millî / National",
    "strength": 70,
    "attack": 69,
    "defense": 71,
    "color": "#0b4ea2",
    "secondary": "#ffffff",
    "short": "SVK",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/slovakia.png",
    "names": {
      "tr": "Slovakya",
      "en": "Slovakia"
    }
  },
  {
    "id": "slovenia",
    "name": "Slovenia",
    "league": "Millî / National",
    "strength": 69,
    "attack": 68,
    "defense": 70,
    "color": "#ffffff",
    "secondary": "#2a9d4b",
    "short": "SVN",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/slovenia.png",
    "names": {
      "tr": "Slovenya",
      "en": "Slovenia"
    }
  },
  {
    "id": "ukraine",
    "name": "Ukraine",
    "league": "Millî / National",
    "strength": 73,
    "attack": 72,
    "defense": 74,
    "color": "#ffd500",
    "secondary": "#005bbb",
    "short": "UKR",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/ukraine.png",
    "names": {
      "tr": "Ukrayna",
      "en": "Ukraine"
    }
  },
  {
    "id": "wales",
    "name": "Wales",
    "league": "Millî / National",
    "strength": 68,
    "attack": 67,
    "defense": 69,
    "color": "#c8102e",
    "secondary": "#ffffff",
    "short": "WAL",
    "quality": "editorial",
    "competitions": [
      "national",
      "unl",
      "intl"
    ],
    "logo": "assets/logos/wales.png",
    "names": {
      "tr": "Galler",
      "en": "Wales"
    }
  },
  {
    "id": "chile",
    "name": "Chile",
    "league": "Millî / National",
    "strength": 70,
    "attack": 69,
    "defense": 71,
    "color": "#d52b1e",
    "secondary": "#0039a6",
    "short": "CHI",
    "quality": "editorial",
    "competitions": [
      "national",
      "intl"
    ],
    "logo": "assets/logos/chile.png",
    "names": {
      "tr": "Şili",
      "en": "Chile"
    }
  },
  {
    "id": "peru",
    "name": "Peru",
    "league": "Millî / National",
    "strength": 68,
    "attack": 67,
    "defense": 69,
    "color": "#ffffff",
    "secondary": "#d91023",
    "short": "PER",
    "quality": "editorial",
    "competitions": [
      "national",
      "intl"
    ],
    "logo": "assets/logos/peru.png",
    "names": {
      "tr": "Peru",
      "en": "Peru"
    }
  },
  {
    "id": "venezuela",
    "name": "Venezuela",
    "league": "Millî / National",
    "strength": 66,
    "attack": 65,
    "defense": 67,
    "color": "#7b1d32",
    "secondary": "#ffcc00",
    "short": "VEN",
    "quality": "editorial",
    "competitions": [
      "national",
      "intl"
    ],
    "logo": "assets/logos/venezuela.png",
    "names": {
      "tr": "Venezuela",
      "en": "Venezuela"
    }
  },
  {
    "id": "costa-rica",
    "name": "Costa Rica",
    "league": "Millî / National",
    "strength": 64,
    "attack": 63,
    "defense": 65,
    "color": "#ce1126",
    "secondary": "#002b7f",
    "short": "CRC",
    "quality": "editorial",
    "competitions": [
      "national",
      "intl"
    ],
    "logo": "assets/logos/costa-rica.png",
    "names": {
      "tr": "Kosta Rika",
      "en": "Costa Rica"
    }
  },
  {
    "id": "nigeria",
    "name": "Nigeria",
    "league": "Millî / National",
    "strength": 72,
    "attack": 71,
    "defense": 73,
    "color": "#008751",
    "secondary": "#ffffff",
    "short": "NGA",
    "quality": "editorial",
    "competitions": [
      "national",
      "intl"
    ],
    "logo": "assets/logos/nigeria.png",
    "names": {
      "tr": "Nijerya",
      "en": "Nigeria"
    }
  },
  {
    "id": "cameroon",
    "name": "Cameroon",
    "league": "Millî / National",
    "strength": 68,
    "attack": 67,
    "defense": 69,
    "color": "#007a5e",
    "secondary": "#fcd116",
    "short": "CMR",
    "quality": "editorial",
    "competitions": [
      "national",
      "intl"
    ],
    "logo": "assets/logos/cameroon.png",
    "names": {
      "tr": "Kamerun",
      "en": "Cameroon"
    }
  },
  {
    "id": "mali",
    "name": "Mali",
    "league": "Millî / National",
    "strength": 66,
    "attack": 65,
    "defense": 67,
    "color": "#14b53a",
    "secondary": "#fcd116",
    "short": "MLI",
    "quality": "editorial",
    "competitions": [
      "national",
      "intl"
    ],
    "logo": "assets/logos/mali.png",
    "names": {
      "tr": "Mali",
      "en": "Mali"
    }
  },
  {
    "id": "china",
    "name": "China PR",
    "league": "Millî / National",
    "strength": 58,
    "attack": 57,
    "defense": 59,
    "color": "#de2910",
    "secondary": "#ffde00",
    "short": "CHN",
    "quality": "editorial",
    "competitions": [
      "national",
      "intl"
    ],
    "logo": "assets/logos/china.png",
    "names": {
      "tr": "Çin",
      "en": "China"
    }
  }
],aliases={
  "Hoffenheim":"TSG Hoffenheim", "Celta":"RC Celta", "Rennes":"Stade Rennais", "Freiburg":"SC Freiburg",
  "Coventry City FC": "Coventry City",
  "Hull City AFC": "Hull City",
  "Ipswich Town FC": "Ipswich Town",
  "Sunderland AFC": "Sunderland",
  "Nottingham Forest FC": "Nottingham Forest",
  "Leeds United FC": "Leeds United",
  "Everton FC": "Everton",
  "Crystal Palace FC": "Crystal Palace",
  "Brentford FC": "Brentford",
  "AFC Bournemouth": "Bournemouth",
  "Brighton & Hove Albion FC": "Brighton",
  "Aston Villa FC": "Aston Villa",
  "Newcastle United FC": "Newcastle United",
  "Fulham FC": "Fulham",
  "1. FSV Mainz 05": "Mainz 05",
  "SC Paderborn 07": "SC Paderborn",
  "1. FC Union Berlin": "Union Berlin",
  "SV 07 Elversberg": "SV Elversberg",
  "Bayer 04 Leverkusen": "Bayer Leverkusen",
  "TSG 1899 Hoffenheim": "TSG Hoffenheim",
  "SV Werder Bremen": "Werder Bremen",
  "FC Schalke 04": "Schalke 04",
  "Udinese Calcio": "Udinese",
  "AC Monza": "Monza",
  "Genoa CFC": "Genoa",
  "Parma Calcio 1913": "Parma",
  "Cagliari Calcio": "Cagliari",
  "Frosinone Calcio": "Frosinone",
  "Venezia FC": "Venezia",
  "US Lecce": "Lecce",
  "Atalanta BC": "Atalanta",
  "US Sassuolo Calcio": "Sassuolo",
  "Torino FC": "Torino",
  "Bologna FC 1909": "Bologna",
  "SS Lazio": "Lazio",
  "ACF Fiorentina": "Fiorentina",
  "Rayo Vallecano de Madrid": "Rayo Vallecano",
  "Real Racing Club de Santander": "R. Racing Club",
  "RCD Espanyol de Barcelona": "RCD Espanyol",
  "RC Deportivo La Coruña": "RC Deportivo",
  "Real Betis Balompié": "Real Betis",
  "Real Sociedad de Fútbol": "Real Sociedad",
  "RC Celta de Vigo": "RC Celta",
  "RC Strasbourg Alsace": "RC Strasbourg",
  "Racing Club de Lens": "RC Lens",
  "ES Troyes AC": "ESTAC Troyes",
  "Le Havre AC": "Havre AC",
  "AS Monaco FC": "AS Monaco",
  "Stade Rennais FC 1901": "Stade Rennais",
  "Sporting Clube de Portugal": "Sporting CP",
  "Sport Lisboa e Benfica": "Benfica",
  "SL Benfica": "Benfica",
  "Kasımpaşa SK": "Kasımpaşa",
  "Arsenal FC": "Arsenal",
  "Chelsea FC": "Chelsea",
  "Liverpool FC": "Liverpool",
  "Manchester City FC": "Manchester City",
  "Manchester United FC": "Manchester United",
  "Tottenham Hotspur FC": "Tottenham Hotspur",
  "Real Madrid CF": "Real Madrid",
  "FC Barcelona": "FC Barcelona",
  "FC Bayern München": "Bayern München",
  "FC Internazionale Milano": "Inter",
  "AC Milan": "AC Milan",
  "Juventus FC": "Juventus",
  "AS Roma": "Roma",
  "SSC Napoli": "Napoli",
  "Paris Saint-Germain FC": "Paris Saint-Germain",
  "FC Porto": "Porto",
  "Lille OSC": "LOSC",
  "Como 1907": "Como",
  "Club Atlético de Madrid": "Atlético de Madrid",
  "Club Brugge": "Club Brugge",
  "Bodø/Glimt": "Bodø/Glimt",
  "Slavia Praha": "Slavia Prague",
  "AEK Athens": "AEK Athens",
  "Galatasaray İstanbul": "Galatasaray",
  "Fenerbahçe İstanbul": "Fenerbahçe",
  "AC Mailand": "AC Milan",
  "Juventus Turin": "Juventus",
  "TSG Hoffenheim": "TSG Hoffenheim",
  "Real Sociedad": "Real Sociedad",
  "Celta Vigo": "RC Celta",
  "Olympique Marseille": "Olympique de Marseille",
  "Stade Rennes": "Stade Rennais",
  "AZ Alkmaar": "AZ Alkmaar",
  "SC União Torreense": "S.C.U. Torreense",
  "Union Saint-Gilloise": "Union Saint-Gilloise",
  "Sparta Prag": "AC Sparta Praha",
  "Olympiakos Piräus": "Olympiacos",
  "Sturm Graz": "Sturm Graz",
  "Celtic Glasgow": "Celtic",
  "Hapoel Beer Scheva": "Hapoel Be'er Sheva",
  "NEC Nijmegen": "N.E.C. Nijmegen",
  "Levski Sofia": "Levski Sofia",
  "Dinamo Zagreb": "GNK Dinamo Zagreb",
  "NK Celje": "Celje",
  "Olympique Lyon": "Olympique Lyonnais",
  "FC Ararat-Armenia": "Ararat-Armenia",
  "Jagiellonia Bialystok": "Jagiellonia Białystok",
  "Omonia Nikosia": "Omonoia Nicosia",
  "Viktoria Pilsen": "Viktoria Plzeň",
  "Lillestrøm SK": "Lillestrøm",
  "RB Salzburg": "Salzburg",
  "Besiktas Istanbul": "Beşiktaş",
  "Lech Poznan": "Lech Poznań",
  "Benfica Lissabon": "Benfica",
  "OFI Kreta": "OFI",
  "Ferencváros Budapest": "Ferencváros",
  "RSC Anderlecht": "RSC Anderlecht",
  "Ajax Amsterdam": "Ajax",
  "Atalanta Bergamo": "Atalanta",
  "Borac Banja Luka": "Borac Banja Luka",
  "Sporting Braga": "SC Braga",
  "Brann": "Brann",
  "Brighton & Hove Albion F.C.": "Brighton",
  "FC Kopenhagen": "F.C. Copenhagen",
  "SC Freiburg": "SC Freiburg",
  "KAA Gent": "KAA Gent",
  "FC Getafe": "Getafe CF",
  "Hajduk Split": "Hajduk Split",
  "Heart of Midlothian FC": "Hearts",
  "Inter Club d'Escaldes": "Inter Escaldes",
  "FK Jablonec": "Jablonec",
  "KuPS Kuopio": "KuPS",
  "Lincoln Red Imps": "Lincoln Red Imps",
  "FC Lugano": "Lugano",
  "FC Midtjylland": "FC Midtjylland",
  "AS Monaco": "AS Monaco",
  "FC Nordsjaelland": "FC Nordsjælland",
  "Paphos FC": "Pafos",
  "Panathinaikos FC": "Panathinaikos",
  "Riga FC": "Riga",
  "FC Twente Enschede": "Twente",
  "Universitatea Craiova": "Universitatea Craiova",
  "FC Iberia 1999 Tiflis": "Iberia",
  "VV Sint-Truiden": "Sint-Truidense VV",
  "Roter Stern Belgrad": "Crvena Zvezda",
  "KF Egnatia": "Egnatia",
  "Mjällby AIF": "Mjällby",
  "FK Kauno Žalgiris": "Kauno Žalgiris",
  "FC Thun": "Thun",
  "AGF Aarhus": "AGF",
  "ZSKA Sofia": "CSKA-Sofia",
  "Trabzonspor": "Trabzonspor",
  "FK Kairat": "Kairat",
  "FC Arsenal": "Arsenal",
  "FC Liverpool": "Liverpool",
  "Manchester City": "Manchester City",
  "Real Madrid": "Real Madrid",
  "Atletico Madrid": "Atlético de Madrid",
  "Inter Mailand": "Inter",
  "AS Rom": "Roma",
  "Paris St. Germain": "Paris Saint-Germain",
  "Galatasaray Istanbul": "Galatasaray",
  "Fenerbahçe SK": "Fenerbahçe",
  "FC Brügge": "Club Brugge",
  "FK Bodö/Glimt": "Bodø/Glimt",
  "Feyenoord Rotterdam": "Feyenoord",
  "Slavia Prag": "Slavia Prague",
  "AEK Athen": "AEK Athens",
  "Beşiktaş İstanbul": "Beşiktaş"
},provider={
  "Rayo Vallecano": "Rayo Vallecano",
  "Athletic Club": "Athletic Club",
  "Atlético Madrid": "Atlético de Madrid",
  "Real Madrid": "Real Madrid",
  "Celta Vigo": "RC Celta",
  "Real Sociedad": "Real Sociedad",
  "Real Betis": "Real Betis",
  "Le Havre AC": "Havre AC",
  "AS Monaco": "AS Monaco",
  "Paris FC": "Paris FC",
  "Paris Saint-Germain": "Paris Saint-Germain",
  "Stade Rennais": "Stade Rennais",
  "AJ Auxerre": "AJ Auxerre",
  "Galatasaray": "Galatasaray",
  "Genclerbirligi": "Gençlerbirliği",
  "Alanyaspor": "Alanyaspor",
  "Samsunspor": "Samsunspor",
  "Trabzonspor": "Trabzonspor",
  "Caykur Rizespor": "Çaykur Rizespor",
  "Fenerbahce": "Fenerbahçe",
  "Konyaspor": "Konyaspor",
  "Gaziantep FK": "Gaziantep FK",
  "Çorum FK": "Çorum FK",
  "Besiktas": "Beşiktaş",
  "Kocaelispor": "Kocaelispor",
  "Eyupspor": "Eyüpspor",
  "Goztepe": "Göztepe",
  "Sporting CP": "Sporting CP",
  "Slavia Prague": "Slavia Prague",
  "Arsenal": "Arsenal",
  "Manchester United": "Manchester United",
  "Club Brugge": "Club Brugge",
  "RB Leipzig": "RB Leipzig",
  "PSV Eindhoven": "PSV Eindhoven",
  "Napoli": "Napoli",
  "Feyenoord Rotterdam": "Feyenoord",
  "Como": "Como",
  "Liverpool": "Liverpool",
  "AS Roma": "Roma",
  "Aston Villa": "Aston Villa",
  "Borussia Dortmund": "Borussia Dortmund",
  "Manchester City": "Manchester City",
  "FC Porto": "Porto",
  "Shakhtar Donetsk": "Shakhtar Donetsk",
  "AEK Athens": "AEK Athens",
  "Slovan Bratislava": "Slovan Bratislava",
  "VfB Stuttgart": "VfB Stuttgart",
  "Genoa": "Genoa",
  "Fiorentina": "Fiorentina",
  "Parma": "Parma",
  "Frosinone": "Frosinone",
  "Lazio": "Lazio",
  "Monza": "Monza",
  "Lecce": "Lecce",
  "Bologna": "Bologna",
  "Sassuolo": "Sassuolo",
  "AC Milan": "AC Milan",
  "Cagliari": "Cagliari",
  "Juventus": "Juventus",
  "Atalanta": "Atalanta",
  "Venezia": "Venezia",
  "Torino": "Torino",
  "Udinese": "Udinese",
  "Leeds United": "Leeds United",
  "Brentford": "Brentford",
  "Chelsea": "Chelsea",
  "AFC Bournemouth": "Bournemouth",
  "Ipswich Town": "Ipswich Town",
  "Fulham": "Fulham",
  "Sunderland": "Sunderland",
  "Tottenham Hotspur": "Tottenham Hotspur",
  "Crystal Palace": "Crystal Palace",
  "Nottingham Forest": "Nottingham Forest",
  "Hull City": "Hull City",
  "Everton": "Everton",
  "Coventry City": "Coventry City",
  "Newcastle United": "Newcastle United",
  "AZ Alkmaar": "AZ Alkmaar",
  "Lech Poznan": "Lech Poznań",
  "Bayer Leverkusen": "Bayer Leverkusen",
  "NK Celje": "Celje",
  "RB Salzburg": "Salzburg",
  "Benfica": "Benfica",
  "Celtic": "Celtic",
  "Dinamo Zagreb": "GNK Dinamo Zagreb",
  "Ferencvaros": "Ferencváros",
  "Viktoria Plzen": "Viktoria Plzeň",
  "Jagiellonia Bialystok": "Jagiellonia Białystok",
  "Ararat-Armenia": "Ararat-Armenia",
  "Olympiacos": "Olympiacos",
  "NEC Nijmegen": "N.E.C. Nijmegen",
  "Levski Sofia": "Levski Sofia",
  "TSG Hoffenheim": "TSG Hoffenheim",
  "CSKA Sofia": "CSKA-Sofia",
  "Egnatia": "Egnatia",
  "FC Midtjylland": "FC Midtjylland",
  "FC Lugano": "Lugano",
  "Hajduk Split": "Hajduk Split",
  "Ajax Amsterdam": "Ajax",
  "KAA Gent": "KAA Gent",
  "AGF": "AGF",
  "KuPS Kuopio": "KuPS",
  "Mjällby AIF": "Mjällby",
  "Panathinaikos": "Panathinaikos",
  "Borac Banja Luka": "Borac Banja Luka",
  "Riga FC": "Riga",
  "Pafos": "Pafos",
  "Kauno Zalgiris": "Kauno Žalgiris",
  "FC Thun": "Thun",
  "FC Nordsjælland": "FC Nordsjælland",
  "SC Freiburg": "SC Freiburg",
  "Jablonec": "Jablonec",
  "Lincoln Red Imps": "Lincoln Red Imps",
  "Werder Bremen": "Werder Bremen",
  "1. FC Union Berlin": "Union Berlin",
  "SV Elversberg": "SV Elversberg",
  "FC Augsburg": "FC Augsburg",
  "SC Paderborn 07": "SC Paderborn",
  "Eintracht Frankfurt": "Eintracht Frankfurt",
  "Borussia Mönchengladbach": "Borussia Mönchengladbach",
  "Schalke 04": "Schalke 04",
  "Alavés": "Deportivo Alavés",
  "Amed SFK": "Amed SK",
  "Anderlecht": "RSC Anderlecht",
  "Angers": "Angers SCO",
  "Barcelona": "FC Barcelona",
  "Bayern Munich": "Bayern München",
  "Bodo/Glimt": "Bodø/Glimt",
  "Braga": "SC Braga",
  "Brest": "Stade Brestois 29",
  "Brighton & Hove Albion": "Brighton",
  "CSU Craiova": "Universitatea Craiova",
  "Deportivo": "RC Deportivo",
  "Elche": "Elche CF",
  "Erzurum BB": "Erzurumspor FK",
  "Espanyol": "RCD Espanyol",
  "F.C. København": "F.C. Copenhagen",
  "FC Cologne": "1. FC Köln",
  "FC Twente": "Twente",
  "Getafe": "Getafe CF",
  "Hamburg SV": "Hamburger SV",
  "Hapoel Be'er": "Hapoel Be'er Sheva",
  "Heart of Midlothian": "Heart of Midlothian FC",
  "Iberia 1999": "Iberia",
  "Inter D'Escaldes": "Inter Escaldes",
  "Internazionale": "Inter",
  "Istanbul Basaksehir": "Başakşehir",
  "Kairat Almaty": "Kairat",
  "Kasimpasa": "Kasımpaşa",
  "LASK Linz": "LASK",
  "Le Mans": "Le Mans FC",
  "Lens": "RC Lens",
  "Levante": "Levante UD",
  "Lille": "Lille OSC",
  "Lillestrom": "Lillestrøm",
  "Lorient": "FC Lorient",
  "Lyon": "Olympique Lyonnais",
  "Mainz": "Mainz 05",
  "Marseille": "Olympique Marseille",
  "Málaga": "Málaga CF",
  "Nice": "OGC Nice",
  "OFI Crete": "OFI Kreta",
  "Omonia Nicosia": "Omonoia Nicosia",
  "Osasuna": "CA Osasuna",
  "Racing Santander": "R. Racing Club",
  "Red Star Belgrade": "Crvena Zvezda",
  "SK Brann": "Brann",
  "SK Sturm Graz": "Sturm Graz",
  "Sabah FK": "Sabah",
  "Sevilla": "Sevilla FC",
  "Sint-Truidense": "Sint-Truidense VV",
  "Sparta Prague": "Sparta Prag",
  "Strasbourg": "RC Strasbourg",
  "Torreense": "S.C.U. Torreense",
  "Toulouse": "Toulouse FC",
  "Troyes": "ESTAC Troyes",
  "Union St.-Gilloise": "Union Saint-Gilloise",
  "VIKING FK": "Viking",
  "Valencia": "Valencia CF",
  "Villarreal": "Villarreal CF",
  "ARCA ÇORUM FK": "Çorum FK",
  "ÇAYKUR RİZESPOR A.Ş.": "Çaykur Rizespor",
  "ERZURUMSPOR FK": "Erzurumspor FK",
  "EYÜPSPOR": "Eyüpspor",
  "AMED SPORTİF FAALİYETLER": "Amed SK",
  "TÜMOSAN KONYASPOR": "Konyaspor",
  "GENÇLERBİRLİĞİ": "Gençlerbirliği",
  "GALATASARAY A.Ş.": "Galatasaray",
  "FENERBAHÇE A.Ş.": "Fenerbahçe",
  "CORENDON ALANYASPOR": "Alanyaspor",
  "KASIMPAŞA A.Ş.": "Kasımpaşa",
  "SAMSUNSPOR A.Ş.": "Samsunspor",
  "KOCAELİSPOR": "Kocaelispor",
  "GÖZTEPE A.Ş.": "Göztepe",
  "İSTANBUL BAŞAKŞEHİR FK": "Başakşehir",
  "GAZİANTEP FUTBOL KULÜBÜ A.Ş.": "Gaziantep FK",
  "TRABZONSPOR A.Ş.": "Trabzonspor",
  "BEŞİKTAŞ A.Ş.": "Beşiktaş"
}
,fold=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i').toLowerCase().replace(/[^a-z0-9]/g,'');
function find(input){const name=typeof input==='string'?input:input.name,key=Object.keys(provider).find(k=>fold(k)===fold(name)),provided=provider[name]||provider[key]||name,canonical=aliases[provided]||provided;return all.find(t=>fold(t.name)===fold(canonical)||fold(t.id)===fold(canonical))||all.find(t=>t.names&&(fold(t.names.tr)===fold(canonical)||fold(t.names.en)===fold(canonical)))||null;}
// V125 display language for national-team names (TR: İtalya, Türkiye · EN: Italy, Turkey).
function uiLang(){try{const l=globalThis.Sekme3D?.lang||(typeof document!=='undefined'&&document.documentElement?.lang)||'tr';return String(l).startsWith('en')?'en':'tr';}catch{return 'tr';}}
function localName(input,lang=uiLang()){const t=typeof input==='object'&&input?.names?input:find(input||'');const raw=typeof input==='string'?input:input?.name;return t?.names?.[lang==='en'?'en':'tr']||raw||t?.name||'';}
// Club identities, not a claim to reproduce every season's licensed shirt.
const kitIdentity={
 'viking':{style:'solid',shirt:0x102d4b,stripe:0xf4f1e8,shorts:0xf4f1e8,socks:0x102d4b,number:0xffffff},
 'galatasaray':{style:'halves',shirt:0xfdb912,stripe:0xa90432,shorts:0xa90432,socks:0xa90432,number:0xffffff},
 'fenerbahce':{style:'stripes',shirt:0xf5cf22,stripe:0x10254b,shorts:0x10254b,socks:0x10254b,number:0xffffff},
 'besiktas':{style:'stripes',shirt:0xf4f2ed,stripe:0x15191e,shorts:0x15191e,socks:0xf4f2ed,number:0x15191e},
 'trabzonspor':{style:'stripes',shirt:0x5a0e27,stripe:0x75b7e5,shorts:0x5a0e27,socks:0x5a0e27,number:0xffffff},
 'arsenal':{style:'sleeves',shirt:0xc91b2c,stripe:0xf5f3ee,shorts:0xf5f3ee,socks:0xc91b2c,number:0xffffff},
 'ajax':{style:'centre',shirt:0xf5f3ee,stripe:0xc81e32,shorts:0xf5f3ee,socks:0xf5f3ee,number:0xffffff},
 'barcelona':{style:'stripes',shorts:0x102d71},'juventus':{style:'stripes',number:0xffffff},
 'milan':{style:'stripes'},'inter':{style:'stripes'},'atletico':{style:'stripes'},
 'newcastle':{style:'stripes'},'brighton':{style:'stripes'},'brentford':{style:'stripes'},
 'udinese':{style:'stripes'},'real-sociedad':{style:'stripes'},'athletic':{style:'stripes'},
 'psg':{style:'centre'},'celtic':{style:'hoops',shirt:0x007f45,stripe:0xffffff,shorts:0xffffff,socks:0xffffff,number:0x15222c},'sporting':{style:'hoops'},
 'rayo-vallecano':{style:'sash'}
};
function team(input,index=0){if(input?.conceptTeam)return{...input,kit:{...input.kit}};const source=typeof input==='string'?{name:input}:input,t=find(source)||{},primary=kitIdentity[t.id]?.shirt??parseInt((t.color||'#385b72').slice(1),16),secondary=kitIdentity[t.id]?.stripe??parseInt((t.secondary||'#f2f3ee').slice(1),16),name=t.names?.[uiLang()]||t.name||source.name;return{...t,...source,id:t.id||source.id,name,short:t.short||name.slice(0,3).toUpperCase(),strength:source.strength||t.strength||75,primary,secondary,logo:t.logo||null,kit:{shirt:primary,stripe:secondary,shorts:primary,socks:primary,number:primary>0xaaaaaa?0x15222c:0xffffff,keeper:index?0x2f9d98:0xe4a137,style:'solid',...(kitIdentity[t.id]||{})}};}
const alternates={galatasaray:[{shirt:0x303239,stripe:0xc14734,shorts:0x303239,socks:0x303239,style:'solid',number:0xffffff},{shirt:0xf5f4ee,stripe:0xa90432,shorts:0xf5f4ee,socks:0xf5f4ee,style:'solid',number:0x20252b}]};
function colorDistance(a,b){const rgb=n=>[n>>16&255,n>>8&255,n&255],x=rgb(a),y=rgb(b);return Math.hypot(...x.map((v,i)=>v-y[i]));}
function kitOptions(t){const home={...t.kit,variant:'home'},supplied=t.kits||{},custom=[supplied.away,supplied.third].filter(Boolean),fallback=alternates[t.id]||[{shirt:0xf4f4ee,stripe:t.primary,shorts:0xf4f4ee,socks:0xf4f4ee,style:'solid',number:0x17232e},{shirt:0x172331,stripe:t.secondary,shorts:0x172331,socks:0x172331,style:'solid',number:0xffffff}];return K.variants(t,[home,...(custom.length?custom:fallback).map((k,i)=>({...home,...k,variant:i?'third':'away'}))]);}
function pair(home,away){const ts=[team(home,0),team(away,1)];return K.select(ts,ts.map(kitOptions));}

function logo(t,thumbnail=false){const embedded=typeof window!=='undefined'&&(window.PULSE_LOGOS?.[t.logo]||window.Next90CrestFallbacks?.get(t.logo));const value=embedded||(thumbnail&&t.logo?.endsWith('.png')?t.logo.replace('/logos/','/logos/thumbs/'):t.logo)||null;return value?.startsWith('assets/')?value+'?v=39':value;}
return{all,find,team,pair,logo,kitOptions,colorDistance,localName,uiLang};});
