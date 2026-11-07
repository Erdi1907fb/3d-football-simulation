# League-Soccer / GameplayFootball inceleme raporu (T-208, V110)

Kaynak: https://github.com/awest813/League-Soccer (GameplayFootball çatalı) · Lisans: **Apache-2.0**
(özgün GameplayFootball animasyonları Unlicense). İnceleme: `src/onthepitch/teamAIcontroller.cpp`,
`player/controller/strategies/offtheball/{goalie_default,default_def,default_mid,default_off}.cpp`,
`player/controller/strategies/special/celebration.cpp`, `data/media/animations/**` (293 `.anim`).

## Teknik uyumluluk
- C++/OpenGL/SDL2 masaüstü oyunu; tarayıcıda doğrudan çalışmaz, WebAssembly’ye taşımak büyük iş
  (OpenGL 3.2 + SQLite + thread). **Kod olarak entegre edilmedi**; algoritmalar ve veriler uyarlandı.
- Animasyonlar zaten projede: `assets/animations/soccerviewer/clips.glb` (293 klip, Rowlinson MIT
  dönüştürücüsü). V110’da hiç bağlanmamış `celebration/happy_extreme`, `happy_normal`, `sad_normal`,
  `special/000_showcard` klipleri `football-clips.js`’ye eklendi ve sevinç paketinde kullanılıyor.

## Uyarlanan / uyarlanabilir parçalar
| Parça | Kaynak | Durum |
|---|---|---|
| Kalecinin açıortay konumu (topun iki direğe açısının açıortayı, kaleyi ikiye bölme) | `goalie_default.cpp` | **V110’da serbest vuruş kalecisine uyarlandı** (`freekick-engine.js bisectorZ`) |
| Kaleci “ulaşılabilir en iyi hedef” taraması (top yolu boyunca zaman/mesafe karşılaştırması) | `CalculateBestAchievableTarget` | Bizde uzanma elipsi + tepki gecikmesi var; V111’de top yolu taramasıyla değiştirilebilir |
| Ofsayt tuzağı çizgisi = en tehlikeli rakibin x’i + hareket öngörüsü | `teamAIcontroller.cpp offsideTrapX` | Bizde `collective-play.js` arka hat + step-off; öngörü terimi (0.1–0.15 s) eklenebilir |
| Formasyon konumu: topun 3,5–4 sn ortalama konumu, aciliyete göre kısalır; ofans/defans derinlik-genişlik faktörleri (0.92/0.80, 0.90/0.74) | `GetAdaptedFormationPosition` | Bizim blok modeli aynı fikirde; V110’da kontra/pres tetikleyicileri eklendi |
| Kontra atakta derinlik faktörünün `counterAttack` ile karıştırılması | `mixup(..., counterAttack)` | **V110’da kontra koşu hatları** olarak uyarlandı (`collective-play.js counter-lane`) |
| Gol sevinci stratejisi (golcü köşeye koşar, takım arkadaşları ona yönelir) | `celebration.cpp` | Bizde `celebration.js` aynı yapıda + 106 sevinçlik paket |
| PES 5/6 tarzı ayarlar (kaleci çizgiye yakın, dar defans) | `gameplaytuning` yorumları | Not alındı |

## Değerlendirilen diğer kaynaklar
- **Metrica Sports sample-data / SkillCorner opendata:** takım uzunluğu/genişliği ve hat davranışı
  için kullanıldı (D-007); `assets/tracking/phase406.json` SkillCorner örneği zaten koşu çeşitliliğinde.
- **Ball3D:** aerodinamik model (D-003) — `ball-aero.js`.
- **Mixamo:** hesap gerektirir, ham dosya dağıtımı yasak (D-005) — kullanıcı indirirse T-213.
