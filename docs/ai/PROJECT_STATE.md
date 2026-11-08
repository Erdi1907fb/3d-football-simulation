# PROJECT_STATE — next90sim (3D Football Simulation)

> Son güncelleme: **V128** · 2026-11-08 · Claude Code
> Bu dosya projenin “şu anki gerçeği”dir. Mimari ya da durum değiştiğinde güncelle.

## 1. Sürüm

| Alan | Değer |
|---|---|
| Kararlı sürüm | **V128** (`VERSION`) |
| Sonraki geliştirme hedefi | **V116** |
| Önceki sürüm | V107 (6 Kasım 2026, ChatGPT/Codex geçmişi — `docs/archive/SURUM-v107.txt`) |
| Yayın | Hostinger statik `public_html` + PHP 8.1. Yeni servis/cron gerekmez. |
| Sürüm doğrulama | `build.php` → `assets/release-v115.json` (sha256 listesi, `tools/make-release.cjs`) |

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
- **Serbest vuruş sahnesi:** ekranda baraj, kaleci ve vurucu; hakem yalnız kadraja sığıyorsa görünür (V111, `refereeSpot`). Vurucu topu yerleştirir,
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

## 4d. V111 eklemeleri
- **Hava durumu** `assets/weather.js` + `assets/weather-ui.js`: Açık / Yağmurlu / Karlı; maç sayfasında kamera
  seçiminin yanında, penaltıda “3 · Kurallar ve tribün”, frikikte “4 · Kamera ve görünüm” adımında. Tercih
  `localStorage next90.weather.v1` içinde; yeni her sahne (ön izleme ve MP4 dışa aktarma) aynı tercihi okur, açık
  sahneler anında değişir. Yağış GPU’da sunum zamanından hesaplanır (geri sarma/MP4 deterministik). Render tarifine
  (`exportRecipe`) `weather` eklendi.
- **Grafik:** cilalı top (clearcoat), 32 kenarlı cilalı kale çerçevesi, 10 renkli krampon paleti, yağmurda ıslak
  forma/çim. Kaynak araştırması: `docs/ai/research/GRAPHICS-SOURCES.md`.

## 4e. V112 eklemeleri
- **Sinematik görüntü (Yüksek kalite):** `broadcast-remaster.js` → three.js r160 EffectComposer: HDR RenderPass →
  UnrealBloom (ölçülü; yağmurda biraz güçlü) → OutputPass (ACES/sRGB) → SMAA. Paket: `assets/vendor/three-postfx.js`
  (`tools/build-postfx.cjs`). Hata olursa eski tek geçişli efekt yoluna kalıcı düşer. Dengeli/Hızlı kalitede eski yol.
- **Adım tepkisi:** yağmurda/karda kramponun yere değdiği an (`scene.js` adım algılama) yağmurda su sıçraması, karda kar
  bulutu + kalıcı ayak izi (`weather.js stepFx`, geri sarınca temizlenir).
- **Frikik tribünü:** eşit taraftarda iki grup arasında boş koridor, yelekli güvenlik görevlileri, şeffaf ayırıcı panel +
  korkuluk; taraftarlar takım modunda kulübün asıl renklerini giyer; her takıma kale arkasında 2 dalgalanan bayrak
  (kulüp arması / millî bayrak).
- **Oyuncu donanımı:** tam vücut modelde oyuncuya özel krampon rengi (önceden sabit lacivertti), kaleciye özel eldiven rengi.
- **Diziliş:** üçlü stoper (−10,5/0/+10,5 m), kanat beki hücumda önde, savunmada beşli; ikili stoper sol/sağ şeride ayrılır.

## 4f. V113 eklemeleri
- **Görünür top dönüşü:** frikik/penaltıda top havadayken fiziksel spin vektörü (rad/s) kadar döner (`state.ballSpin`,
  `scene.js` quaternion); ilk temasa kadar.
- **Hava fiziği (frikik):** `ball-aero.js SURFACES` — yağmur: düşük sekme, hızlı kayma; kar: düşük sekme, yüksek yuvarlanma
  direnci. Yağmurda ıslak top kalecinin elinden daha sık seker. Frikik senaryosu seçili hava ile kurulur (hava değişince
  yeniden hazırlanır).
- **Yansımalar:** Yüksek kalitede Poly Haven Stadium 01 **2K** HDRI (CC0).
- **Lisans politikası:** ticari mağaza varlıkları (Fab/Unity, ücretli mocap) hesap/satın alma ister ve çoğu motor dışı ya da
  herkese açık dağıtımı yasaklar; ajanlar satın alamaz. Kullanıcı kendi hesabıyla indirip verirse
  `assets/private-licensed/` altında (repo dışı tutulması önerilir) entegre edilir — bkz. DECISIONS D-018.

## 4g. V114 — yön değişikliği ve eklemeler
- **Kullanıcı kararı (2026-11-08):** dış repo/varlık aranmayacak; geliştirme yalnız Claude Code + Codex’in kendi
  kodlamasıyla. Nihai hedef: “profesyonel yayın” görüntüsü (oyuncu, kaleci, top, çim, kale, taraftar, tribün, atmosfer,
  animasyon). Küçük dokunuşlar + büyük kalite adımları.
- **Sinematik zincir:** RenderPass → BokehPass (alan derinliği, yalnız yakın çekim) → UnrealBloom → OutputPass (ACES) →
  yayın renk ayarı (kontrast 1,05, doygunluk 1,07, sıcak parlak / serin gölge) → SMAA.
- **Kamera:** stüdyolarda yakın plan (<13 m) çekimlerde odak = özne mesafesi, hafif zaman-tabanlı el kamerası salınımı
  (`cinematicCamera`), tekrar ve geniş açıda kapalı. `camera.userData.dof` arayüzü ana maç kamerasına da açık.
- **Atmosfer:** 4 projektör kulesinden yumuşak ışık hüzmeleri (yağmurda ×2,1, karda ×1,7); tribünlerde telefon flaşları
  (açık oyunda seyrek, gol/sevinç/finalde yoğun).
- **Araç:** stüdyolarda `snapshot(t,w,h)` → 1080×1920 tam çözünürlük kare.

## 4h. V115
- `fullbody-runtime.js athleticShape()` (yükleme anında, kemik ağırlıklı gövde şekillendirme), fizik tabanlı sheen kumaş,
  belirgin çim şeritleri (`pitch-detail.js applyPBR`). Kullanıcı beklentisi: her sürümde göze çarpan büyük görsel sıçrama.

## 4i. V116
- Yüksek kalitede güçlü ana ışık/gölge kontrastı (`broadcast-remaster.js`), baldır kası + düzleştirilmiş göğüs/karın
  (`athleticShape`), modern krampon (`scene.js` boot), hıza bağlı koşu eğimi, taraftar kıyafet çeşitliliği.
- Hakem ve yan hakemler de tam vücut MPFB modeli (`OFFICIAL_KIT`, `allVisualActors` resmî görevlileri içerir);
  `actor.uniform` resmîlerde null → `actor.official` koruması zorunlu.

## 4j. V117
- Frikikte yatan oyuncu yönü: `freekick-engine.js wallAt` → heading = baraj normali (kaleye bakar); `lieDown` gövdeyi
  ileri eksen etrafında yatırdığı için vücut baraj hattına paralel uzanır, sırtı baraja döner. Test: `tests/freekick.cjs`.
- Kaleci dirsek pedi (`lowerarm_*` kemiğinde dolgulu halka), daha belirgin V-gövde (`athleticShape` x ölçeği),
  çim aşınması (`scene.js` prosedürel kanvas dokulu `pitch-wear` düzlemleri: kale ağzı, penaltı noktası, orta nokta).

## 4k. V118
- Yatan oyuncu tur bazlı: `create()` içinde ayrı tohumlu `lierRounds` (%38, mesafe < 25,5 m şartıyla) →
  `wallFor(ball,rng,nearSign,lierRound)`. Aynı turda iki taraf da aynı baraj düzenini görür (~%23 tur).
  Ana `rng` akışı korunur (`lierRoll` yine çekilir).
- Yağmurda `smother` (tutma) denemelerinin %40'ı `reflex`e döner (ıslak top eldivenden kaçar).

## 4l. V119
- Taraftar ayrımı tüm modlarda (`scene.js buildSegregation`): her sıra için tribün halkası (`ringOf`, 944 koltuk:
  güney yan → köşe → doğu kale arkası → … ) üzerinde takım değişimi aranır, sıralar arası eşleştirilip doğrusal
  uydurulur. Her sınıra: basamaklı cam panel + çelik alt plaka (`strip`, sabit normal; sıfır genişlikli üçgen YOK —
  NaN normal bloom'da siyah dikdörtgen yapıyordu), eğimli üst korkuluk, direkler, örtülü basamaklar (instanced).
  Sınırın iki yanında 2'şer koltuk boş (`f.segHidden` → `crowd-lod.js` lodHidden), her 3 sırada yelekli görevli.
  `crowdInfo.segregation` sınır çizgilerini verir. V112 frikik koridoru ve maçtaki eski deplasman bariyeri kaldırıldı.
- Kaleci hazır duruşu kaleciye göre 3 imza (klasik / alçak-geniş / eller yüksek) + parmak ucu sekme ve ağırlık aktarımı.

## 4m. V120
- Tribün görevlileri turuncu yüksek görünürlük yeleği (0xfb6a1c, gri reflektif şerit), camın İKİ yanında (her 3 sıra).
  Saha kenarı görevlileriyle aynı turuncu. Impostor renkleri applyVenue'da yenilenir (`spriteTeam104=null`).

## 4n. V121
- **Video kalitesi kilidi:** dışa aktarma her cihazda `high` önayarıyla çizilir (maç `app.js prepareExport`
  quality:'high' + gölge açık; penaltı/frikik dünyası quality:'high', `configureRenderer(renderer,T,'high')`).
  Telefonlarda high önayarı 2048 gölge haritası kullanır (`graphics-settings.js get`). Kodlama zaten kare-kare
  (draw(i/60)) → 1080×1920, tam 60 FPS zaman damgası, 18 Mbps (mobil 16). Sezon videosundaki 6 Mbps kaldırıldı.
- Görüntü zinciri: S-eğrisi kontrast + vinyet (GRADE), SMAA sonrası keskinleştirme (SHARPEN).
- Çim: kameraya yakın ince çim teli gürültüsü (`pitch-detail.js` shader, önbellek anahtarı v121).
- Seremoni bezleri ışıklı kumaş (MeshPhysical + sheen, her karede normal), artık parlayan düz disk değil.
- Hakem santrada oyuncuların üstünde durmaz (`match.js matchClearOfficial`, test `kickoff-referee.cjs`).
- Tribün görevlileri hiç tezahürat yapmaz; kollar aşağıda, eller önde (`crowd-lod.js poseBase`).
- Meksika dalgası: 72 sn döngüde 30 sn, dalga dışındakiler oturur (`scene.js mexicanWave`).

## 4o. V122 (serbest vuruş)
- Vurucu seçimi (`freekick-engine.js skill`): editoryal uzman listesi (genişletildi: İrfan Can, Greenwood, Sara,
  Rafa Silva, Orkun, Olise, Palmer, Wirtz…) + rol tabanı (AM/kanat > CM > ST > DM > CB), rating, iri/uzun santrfor
  cezası. Gol ağırlığı (scoringWeight) artık etkisiz.
- Sonuç dağılımı: baraj ~%6 (önce ~%16); kaçanların çoğu üstten/yandan aut. Teknik seçimi uzman/uzaklık/açıya göre.
- Vuruş süresi değişken: `kick.length` (gol 8,8 sn tekrar dahil; kaçan ≈ resolvedAge+1,75). `kick.start` birikimli,
  `sample()` sıralı arama yapar. Tekrar yalnız gollerde.
- Varsayılan kamera ('behind'): penaltı stüdyosu kadrajı — vurucunun sırtı (isim/numara) ortada, baraj+kale arkada,
  grafik bandının üstünde; uçuşta nişan topu izler. 2B top izi (`ballTrail`) canlı + tekrar.
- Kaçan vuruş: vurucunun yerinde orta plan kısa tepki, kaleci yakın planı yok.

## 4p. V123
- Saç: MeshPhysical + tel kabartması (bumpMap = saç haritası) + saç rengine bağlı sheen; mat "kask" görünümü bitti.
  ANİZOTROPİ KULLANMA: MPFB modelinde teğet yok → NaN.
- Cilt: MeshPhysical + sıcak sheen (pürüzlülük .58 korunur).
- Görüntü zinciri: RenderPass'ten hemen sonra SANITIZE (NaN/Inf → 0, HDR ≤ 64). Bloom artık tek hatalı pikseli
  tüm kareye yayamaz; hata bilerek geri getirilerek doğrulandı (siyah kare %0,5–1,6, normal).

## 4q. V124 (millî takım organizasyonları)
- Yeni yarışmalar: `unl` (UEFA Uluslar Ligi / UEFA Nations League, ESPN `uefa.nations`) ve `intl` (Uluslararası
  Hazırlık Maçı / International Friendly, ESPN `fifa.friendly`). Fikstür: `server/live-sources.php` aylık ESPN işleri;
  `pp_national_allowed` yalnız `assets/national-teams.json` ülkelerini kabul eder; hazırlık maçında en az bir taraf
  güç ≥ 72 (büyük ülke). Ayarlar: `unl_enabled`, `intl_enabled` (varsayılan açık).
- Kadro/ilk 11: mevcut ESPN akışı (açıklanan 11 → `provider-lineup`; yoksa son 3 maçtan `estimated-from-recent-start`;
  millî takımlar için kodlar uefa.nations + fifa.friendly + fifa.worldq.uefa). Teknik direktör: ESPN vermiyor →
  FotMob lig sayfası (`pp_public_leagues` unl 9806 / intl 114; FotMob UNL tablosu yalnız A ligini listeler).
- Düzeltmeler (kulüpleri de etkiler): ESPN `CF-L/CF-R` pozisyonları (3-4-2-1'de 10 numara); istemci dizilişinde
  LM↔LWB, RM↔RWB eşleşmesi (3'lü defansta kanat bekler reddediliyordu).
- Katalog: 85 millî takım (54 UEFA + büyük ülkeler), bayraklar flagcdn'den mevcut dalgalı stilde
  (`tools/national-teams.py`), `crest-fallbacks.js` ve `competition-data.js` gömülü kopyaları güncellendi.
- Yayın: `broadcast.js` temaları `unl` (lacivert + camgöbeği, çapraz şerit) ve `intl` (antrasit + altın, küre çizgileri).
  Amblemler proje çizimi (`tools/competition-emblems.py`); resmî UNL logosu gelirse aynı araçla değiştirilir.
- Görsel: seremonide telefon feneri ışık şovu (instanced; Points tabanlı efektler SwiftShader'da görünmüyor),
  kameraya bağlı çim biçme şeritleri.

## 4r. V125
- Millî davet listesi: `assets/national-callups.json` (ESPN takım id → tarih aralığı, oyuncu listesi, TD, kaynak).
  `pp_national_callup_apply` ESPN geniş havuzunda listede olmayanları "uygun değil" yapar; tahmini 11'de bu oyuncu
  aynı mevki grubundan (G/D/M/F) davetli biriyle değiştirilir; yedekler davetlilerle tamamlanır; TD listeden; adlar
  federasyon yazımıyla (Şimşir, Çalhanoğlu). Maç günü sağlayıcının açıkladığı 11 olduğu gibi kullanılır.
  Her millî ara öncesi bu dosya güncellenmeli (şu an: Türkiye, Kasım 2026, 26 kişi).
- Millî takım adları dile göre: katalog `names:{tr,en}` (İtalya/Italy, Türkiye/Turkey, İngiltere/England…);
  `SekmeCatalog.team()` arayüz diline göre ad verir, `localName()`, dil değişince maç takımları güncellenir.
  Kanonik `name` (sağlayıcı eşleşmesi, ör. "Italia") değişmedi. FotMob TD eşleşmesi sağlayıcı takma adlarıyla.

## 4s. V126 (oyuncu görünümü)
- 38 büyük kulüpte (her ligin büyükleri + UCL) 889 oyuncunun saç tipi ve sakalı FotMob portrelerine bakılarak elle
  etiketlendi (`tools/appearance-labels-v126.json`); ten ve saç rengi aynı fotoğraftan ölçülür
  (`tools/appearance-from-photos.py`, foto önbelleği git dışı). Sonuç `club-rosters-v75.json` appearance.profile,
  `appearanceSource: fotmob-headshot-v126-reviewed`. Stiller: short, cropped, long, coils, twists, bald, receding.
- `club-rosters.js withLooks`: maç günü sağlayıcı (ESPN) 11'lerinde de oyuncu görünümü id/ad ile kadro verisinden
  gelir (önce yalnız tüm takım kadro dosyasından geldiğinde kullanılıyordu). Önbellek `?v=126`.

## 4t. V127
- Resmî UEFA Nations League logosu (kullanıcı verdi: `assets/competitions/source/unl-official.png`) → unl.png, thumbs,
  broadcast light (koyu yazılar beyaza çevrildi) / dark, `competition-data.js` gömülü kopyaları. Logo önbelleği ?v=126.
  UNL teması: logodaki renkli üçgen bayrak motifi + skor tabelası altında çok renkli şerit.
- Telefon profili (`SekmeGraphics.mobile`, preset `lite`): telefonda kullanıcının seçtiği ön ayar kullanılır (V121'in
  zorla 'high'ı yalnız masaüstünde), sinematik zincir HDR→ACES→grade (bloom/DOF/SMAA/sharpen/sanitize yok),
  saç/cilt MeshStandard, gölge 1024, seremoni fenerleri yok. iPhone 13 emülasyonu: JS bellek V120 ile aynı
  (318/315 MB), kare süresi ~%35 kısa. GERÇEK CİHAZDA DOĞRULANMADI.

## 4u. V128 (telefon = V107 yükü)
- Kök neden: V116'da `FullBody.attach` içindeki `actor.official` engeli kaldırılınca 50 kenar görevlisi (steward, top
  toplayıcı, basın, teknik ekip) de 53 kemikli tam vücut oldu: 51 → 101 karakter, 2.703 → 5.353 kemik/kare.
  Şimdi yalnız oyuncular + maç hakemleri (`staffRole` referee/assistant/fourth-official); telefonda yalnız orta hakem.
- Krampon çivi/şerit/bağcık nesneleri kaldırıldı (tam vücut modelde zaten gizliydi; oyuncu başına 22 nesne).
- iPhone 13 emülasyonu, penaltı stüdyosu V107'ye karşı: tam vücut 52/51, kemik 2756/2703, nesne 12356/12743,
  malzeme 2797/2748, JS bellek 298/280 MB; telefonda bloom/SMAA yok (V107'de vardı). Gerçek cihazda test edilmedi.
- Şort numarası baskı alanının düz ortasına küçültüldü (`jersey-print.js paintShort`), iki haneli numaralar kesilmiyor.

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
