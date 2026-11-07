# PROJECT_STATE — next90sim (3D Football Simulation)

> Son güncelleme: **V110** · 2026-11-08 · Claude Code
> Bu dosya projenin “şu anki gerçeği”dir. Mimari ya da durum değiştiğinde güncelle.

## 1. Sürüm

| Alan | Değer |
|---|---|
| Kararlı sürüm | **V110** (`VERSION`) |
| Sonraki geliştirme hedefi | **V111** |
| Önceki sürüm | V107 (6 Kasım 2026, ChatGPT/Codex geçmişi — `docs/archive/SURUM-v107.txt`) |
| Yayın | Hostinger statik `public_html` + PHP 8.1. Yeni servis/cron gerekmez. |
| Sürüm doğrulama | `build.php` → `assets/release-v110.json` (sha256 listesi, `tools/make-release.cjs`) |

## 2. Giriş sayfaları ve durumları

| Sayfa | Amaç | Durum |
|---|---|---|
| `index.html` / `index.php` | Maç merkezi: bülten, normal 11’e 11 maç, sezon, konsept maçlar, video indirme | Çalışıyor (V107 davranışı korunur; V108’de savunma blok modeli iyileştirildi) |
| `penalty.html` | Penaltı Stüdyosu: takım serisi veya oyuncu düellosu, MP4 | Çalışıyor; V108’de ayarlar numaralı adımlara ayrıldı, panolar next90sim markası |
| `freekick.html` | **Serbest Vuruş Stüdyosu (V108 yeni)**: takım vs takım / oyuncu düellosu, baraj, kaleci, falso fiziği, ağır çekim tekrar, MP4 | Çalışıyor (Chromium/SwiftShader ile doğrulandı) |
| `football-lab.html` | Atak önizleme laboratuvarı | V107 hâli |
| `face-coverage.html` | Yüz kapsamı denetimi | V107 hâli |
| `next90sim-vNN.html`, `penalty-vNN.html` | Eski sürüm adresleri | Dosyalar silindi, `.htaccess` 301 ile kanonik sayfaya yönlendirir |

## 3. Mimari (katmanlar)

```
Veri          club-rosters-v75.json · catalog.js · bulletin-data.js · penalty-guests.json (100 yıldız/ikon)
              penalty-national-kits.json · national-keepers.json · kits/** · faces/** · concept/teams.js
Simülasyon    match.js (maç zaman çizelgesi, “chance” tabanlı) ← possession-engine.js, collective-play.js,
              team-organization.js, transition-play.js, loose-play.js, football-ai.js, openengine-adapter.js,
              formation-coordinator.js, steering.js, player-motion.js, football-intent.js
              penalty-engine.js (penaltı serisi)  ·  freekick-engine.js (serbest vuruş serisi, V108)
Top fiziği    football-physics.js (120 Hz, maç şutları) · open-football-adapter.js (pas uçuşu, file, blok)
              ball-aero.js (V108: sürükleme krizi, Magnus falso/topspin, knuckleball, direk, nişan çözücü)
Sunum/3D      scene.js (Three.js sahne; options: penaltyStudio / freeKickStudio / brandBoards)
              character-system.js, fullbody-runtime.js, athlete-motion.js, football-animation.js,
              football-clips.js, celebration-clips.js, player-faces.js, kit-runtime.js, jersey-print.js,
              stadium-*.js, crowd-*.js, pitch-detail.js, broadcast*.js, camera-stabilizer.js
Stüdyo UI     app.js (maç merkezi) · penalty-ui.js · freekick-ui.js (V108) · penalty-presentation.js (ortak
              sahne koordinatları, kazanan kamerası)
Video         video-core.js (+ vendor/mediabunny.js, h264-mp4-encoder) · video-ui.js · render-bridge.js
Sunucu        api.php, server/*.php (kadro/bülten/tahmin kaynakları), cron.php, render.php, export.php
```

### Üç stüdyonun ortak altyapısı (V108)
- **Sahne:** üçü de `SekmeScene.create(...)` kullanır. Stüdyo bayrakları: `penaltyStudio`,
  `freeKickStudio` → yakın plan forma baskı çözünürlüğü (1536 px), yüz LOD mesafesi, kafa
  oturtma; `brandBoards`/stüdyo → reklam panolarında lig yerine NEXT 90 SIM.
- **Kaleci:** penaltıdaki dalış poz alanları (`penaltyDive`, `dive`, `diveSide`, `diveLift`,
  `saveReach`, `keeperHold`) serbest vuruşta aynen kullanılır.
- **Baraj:** maç motorundaki `wallSet` / `wallJump` poz alanları serbest vuruş stüdyosunda kullanılır.
- **File:** `open-football-adapter.containNet` her üç akışta topu fileye hapseder; file dalgası
  `chance.penaltyContact/penaltyFlight/penaltyNetContact` alanlarıyla tetiklenir.
- **Video:** `SekmeVideo.create(job)` — 1080×1920, 60 FPS, ses olayları (düdük/şut/sonuç).

### Koordinatlar
Metre; saha 105×68. `x` hücum yönü (+52.5 kale çizgisi), `y` yukarı, `z` hücum yönüne bakarken
sağ. Kale ağzı |z|<3.66, y<2.44. Top yarıçapı 0.11 m. Yön (heading): `atan2(dx, dz)`.

## 4. Serbest Vuruş Stüdyosu (V108) — özet
- Motor: `assets/freekick-engine.js` (`Next90FreeKicks.create({seed, mode:'team'|'duel', lineups,
  shooters?, keepers, format:'five'|'complete-five'|'three'|'single', spots:'varied'|'central'|'left'|'right'|'long'})`).
- Her vuruş: ceza sahası dışı nokta (18–32 m), mesafeye göre 3–5 kişilik baraj (9,15 m, yakın direği
  kapatır, vuruşta zıplar), baraj gölgesinde kalecinin konumu, tepki gecikmesi + uzanma elipsi.
- Teknikler: falso (iç ayak), dış ayak (trivela), topspin düşen, knuckleball, sert vuruş, baraj altı.
- Sonuç: istenen sonuç (oyuncu kalitesi ağırlıkları) fiziksel aday vuruşlar arasında aranır;
  bulunamazsa fiziksel sonuç geçerli olur. Testte %99,8 eşleşme.
- Zaman çizelgesi (her vuruş 8,8 sn): hazırlık → düdük 1,25 sn → koşu 1,55 sn → temas 2,6 sn →
  sonuç → tepki → gol/kurtarış/direkte 5,35 sn’den itibaren ağır çekim tekrar (topu izleyen kamera).
- Kameralar: oyuncunun arkasından (varsayılan), omuz üstü, yayın açısı, kale arkası.
- UI: `freekick.html` + `assets/freekick-ui.js`; dışa açık API `window.Next90FreeKickStudio`.

## 4b. V109 eklemeleri
- **Sevinç paketi** `assets/celebration-pack.js`: 100 adlandırılmış gol sevinci (8 varış: diz üstü/göğüs üstü/yan kayış,
  zıplayıp dönme, sıçrama, diz çökme, tek diz; 43 imza hareket) + 14 takım rutini. Normal maçta gollerin ~%85’i paketten
  seçilir (`celebration.js plan()`), penaltı/serbest vuruş tepkileri ve final sevinçleri de paketi kullanır.
  Sahne kancası: `scene.js` → `CelebrationPack.apply` (golcü) ve `CelebrationPack.team` (takım arkadaşları).
- **Serbest vuruş noktaları:** `schedule()` — sol/sağ noktalar birebir ayna çiftleri (bir sol ayaklıyı zorlayan nokta,
  sağ ayaklıyı zorlayan aynasıyla eşleşir), ayrıca merkez ve uzak mesafe; her turda iki taraf aynı noktadan vurur.
- **Millî baraj:** düelloda millî forma seçilince barajı o ülkenin gerçek kadrosu (isim + forma numarası) oluşturur,
  formanın dönemine en yakın yıl seçilir (`assets/national-walls.json`, `tools/build-national-walls.cjs`, 16 ülke).
- **Güvenli alan:** serbest vuruş grafikleri penaltı stüdyosundaki bantla birebir aynı yere taşındı; kamera aksiyonu
  bandın üstünde tutar.
- **Penaltı:** teknik etiketi + hız (ayak içi köşe, doksana, sert, ayak üstü güçlü, ayak dışı, Panenka, ortaya…);
  ayak dışı vuruşta falso ters yöne. Sonuç modeli ve rastgele akış değişmedi (testler aynı sayıları verir).

## 4c. V110 eklemeleri
- **Serbest vuruş sahnesi:** ekranda yalnız baraj, kaleci ve vurucu; hakem kadraj dışında. Vurucu topu yerleştirir,
  geri çekilir, odaklanır; kaleci önce yakın direkte barajı yönetir (kol işareti), sonra yan adımla açıortay
  konumuna geçer (League-Soccer `goalie_default` uyarlaması). Kısa mesafede bazen barajın arkasına bir oyuncu yatar
  ve alçak şutları fiziksel olarak keser. Taraftar: “eşit” seçilirse stadyum uzun eksen (z=0) boyunca tam ikiye
  bölünür; tek taraf seçilirse tüm tribün o takımın.
- **Sevinç kuralı (stüdyolar):** her penaltı/frikik golünde vurucu topun önünde *küçük* bir sevinç yapar (yerinde, kayışsız);
  kaçırınca bazen GameplayFootball “üzgün” klibi. Seri bitince kazanan köşeye koşar ve *büyük* sevinç (çoğunlukla diz
  üstü kayış, çimde iz bırakarak).
- **Sevinç paketi v110:** 106 sevinç (6’sı GameplayFootball el yapımı `happy_extreme/happy_normal` klipleri), koşu
  sırasında iki kolun da oynadığı 6 kol düzeni, maç gollerinin ~%41’inde kayış (%28 diz üstü), stüdyoda kayış öne
  ilerler ve **çimde kayma izi** bırakır (`useTrails`, geri sarınca sıfırlanır).
- **Fizik:** penaltı uçuşu `ball-aero.js` ile (çözücü hedef/zamanı korur, sonuç değişmez); maç şutlarında hava direnci
  sürükleme krizi eğrisine bağlandı (`football-physics.js`).
- **Maç taktikleri:** top kazanımından sonraki 6,5 sn kontra koşu hatları; pres tetikleyicileri (kenar çizgisi tuzağı,
  geriye dönük top alma) ve rakip kontrasında geri koşu (`collective-play.js`).
- **Görünüm:** forma/şortta prosedürel örgü normal haritası, şort numarası 512 px.
- **Serbest vuruş kalite ayarı:** Yüksek/Dengeli/Hızlı (site geneli `SekmeGraphics` ile ortak).

## 5. Bilinen sınırlar / sorunlar
- Tarayıcı testleri Chromium + SwiftShader yazılımsal WebGL’dir; gerçek iPhone/Android ve
  gerçek GPU FPS ölçülmedi.
- Serbest vuruşta baraj oyuncuları ve kutudaki oyuncular basit poz kullanır (koşu/zıplama);
  ikili mücadele veya kafa vuruşu ile ikinci top (rebound) oyunu yok.
- Oyuncu modelleri MPFB tabanlı stilize modellerdir; yüzler fotoğraf dokusudur, 3D tarama değildir.
- Sevinçler prosedüreldir (eklem açıları); motion-capture klibi değildir. Mixamo animasyonları **eklenmedi** (lisans: Adobe hesabı ve dağıtım şartları; bkz. DECISIONS D-005).
- Normal maç motoru “chance” (pozisyon) tabanlı zaman çizelgesi üretir; tam 90 dakikalık sürekli
  fizik simülasyonu değildir. V108’de yalnızca savunma blok derinliği/step-off eklendi.
- Penaltı motoru kendi parabolik yolunu kullanır; `ball-aero.js`’ye taşınması V109 görevidir.
- `football-lab.html`, `face-coverage.html` V108’de tarayıcıda yeniden doğrulanmadı.

## 6. Önemli dosyalar (hızlı başvuru)
- Sahne: `assets/scene.js` (≈134 KB) — `Boards.create`, `player()`, `update(state, aspect, mode)`.
- Panolar: `assets/stadium-boards.js` (`paint(..., brandOnly)`), yerleşim `assets/stadium-layout.js`.
- Forma baskısı: `assets/jersey-print.js` (`style()` kontrast seçimi, `paint()`).
- Marka: `assets/brand-config.js`, `assets/next90sim.png`.
- Arşiv: `docs/archive/` (V72–V107 sürüm notları, kaynak araştırmaları, lisans notları).
