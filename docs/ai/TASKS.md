# TASKS — görev panosu

Durumlar: `todo` · `in-progress` · `partial` · `blocked` · `done`
Sahip: `claude` · `codex` · `—` (boş, ilk alan alır). Bir görevi alırken sahibini ve
`files:` listesini yaz; bitirince `done` + sürüm. Kullanıcının yeni istekleri en üste eklenir.

## Aktif hedef: V109

| ID | Görev | Durum | Sahip | Notlar / files |
|---|---|---|---|---|
| T-201 | Penaltı top yolunu `ball-aero.js`’ye taşı (falso/topspin fiziksel; sonuç ve temas noktaları korunacak) | todo | — | `penalty-engine.js`; `tests/presentation.cjs`, `variation.cjs` sürekliliği korumalı |
| T-202 | Normal maç şutlarını/ortalarını `ball-aero.js` ile hesapla (falso ortalar, uzak şutlar) | todo | — | `football-physics.js`, `possession-engine.js`, `forecast-physics.js` — yayınlanmış skorlar değişmemeli |
| T-203 | Serbest vuruş: ikinci top oyunu (baraj/kaleci sekmesinden sonra kutudaki oyuncuların tepkisi, uzaklaştırma/şut) | todo | — | `freekick-engine.js`, `freekick-ui.js` |
| T-204 | Serbest vuruş: barajın arkasında yere yatan oyuncu, kalecinin yan adımı, vuruşçunun topa yerleştirme/geri sayma hazırlık animasyonu | todo | — | `freekick-ui.js`, `scene.js` poz alanları |
| T-205 | Animasyon: Mixamo yerine lisansı açık (CC0/MIT) futbol klipleri araştır; koşu-sprint-dönüş-şut-kafa-kayarak müdahale geçişleri, ortak iskelete retarget | todo | — | `football-clips.js`, `fullbody-runtime.js`, `assets/characters/` — DECISIONS D-005 |
| T-206 | Normal maç: atak çeşitleri (kanat bindirme, merkezden kombinasyon, uzun top) ve kontra atak koşu hatları; Metrica örnek verisinden koşu profilleri | todo | — | `collective-play.js`, `transition-play.js`, `tracked-runs.js` |
| T-207 | Normal maç: pres tetikleyicileri (geri pas, kenar çizgisi tuzağı, kötü ilk dokunuş) | todo | — | `team-organization.js`, `collective-play.js` |
| T-208 | League-Soccer / GameplayFootball kaynak incelemesi: takım AI, pozisyon alma, kaleci kararları → uyarlanabilir parçalar raporu | todo | — | `docs/ai/DECISIONS.md` |
| T-209 | Gerçek cihaz testi: iPhone Safari + Android Chrome’da `freekick.html` MP4 indirme | todo | kullanıcı | Ajanlar fiziksel cihaz testi yapamaz |
| T-210 | `football-lab.html`, `face-coverage.html` V108 kanonik dosyalarla tarayıcı doğrulaması | todo | — | |
| T-211 | Serbest vuruş stüdyosunda kalite ayarları (gölge, kalabalık yoğunluğu) için `studio-settings` entegrasyonu | todo | — | `studio-settings.js` |
| T-212 | Oyuncu modeli: forma kumaş kırışık normal haritası, şort/çorap numarası netliği, saç profilleri | todo | — | `scene.js`, `kit-runtime.js`, `jersey-print.js` |

## Tamamlananlar

| ID | Görev | Sürüm | Sahip |
|---|---|---|---|
| T-101 | Repo temizliği: yinelenen sürüm kopyaları, eski HTML’ler, kullanılmayan büyük dosyalar | V108 | claude |
| T-102 | Ortak çalışma altyapısı (AGENTS/CLAUDE/VERSION/docs/ai, release manifest aracı) | V108 | claude |
| T-103 | Ortak aerodinamik top modülü `ball-aero.js` | V108 | claude |
| T-104 | Serbest Vuruş Stüdyosu (takım/düello, kit, kaleci, biçim, nokta, kamera, tekrar, MP4) | V108 | claude |
| T-105 | Stüdyo reklam panolarında lig yerine next90sim markası | V108 | claude |
| T-106 | Penaltı Stüdyosu ayarlarının adımlı ve mod-duyarlı düzeni | V108 | claude |
| T-107 | Forma isim/numara kontrast seçimi | V108 | claude |
| T-108 | Savunma blok derinliği ve step-off | V108 | claude |
