# PROJECT_STATE — next90sim (3D Football Simulation)

> Son güncelleme: **V156** · 2026-11-09 · Claude Code
> Bu dosya projenin “şu anki gerçeği”dir. Mimari ya da durum değiştiğinde güncelle.

## 1. Sürüm

| Alan | Değer |
|---|---|
| Kararlı sürüm | **V156** (`VERSION`) |
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

## 4v. V129
- Kullanıcı isteği: telefonda kalite düşürülmesin. V127'deki telefon "lite" profili kapatıldı: telefon da tam sinematik
  zincir (DOF, bloom, SMAA, keskinleştirme), fiziksel saç/cilt, 4096 gölge, fenerler, tüm maç hakemleri tam vücut;
  her dışa aktarma (telefon dahil) 'high'. Acil durum için yalnız `window.SEKME_LITE_RENDER=true` lite yolu açar.
- Telefon yükü V128'deki asıl düzeltmeyle (kenar görevlileri hafif rigde) V107'ye yakın: iPhone 13 emülasyonu
  tam vücut 55/51, kemik 2915/2703, JS bellek 302/280 MB. Gerçek cihazda doğrulanmadı.

## 4w. V130
- Telefon stüdyoları (penaltı + frikik) maç sayfasıyla aynı modelde: `PHONE_STUDIO` iken önizleme sahnesi
  quality:'balanced', compact (gölge/sinematik zincir yok); dışa aktarmada `sceneTier('export')` önizleme sahnesini
  atıp high + compact:false sahne kurar (DOF/bloom/SMAA/sharpen), video bitince `sceneTier('preview')`. Video kalitesi
  masaüstüyle aynı. Kök neden: V121'den beri stüdyolar telefonda açılışta high sahneyi canlı önizlemede çiziyordu
  (8,6 sn kilit, 57 MB yükleme); şimdi 4,8 sn, 42 MB. API: `sceneTier()`, `sceneTierName`.
- INTRO=0 (penaltı + frikik motorları): video ilk vuruşla başlar (frikik: topu yere koyma). Penaltıda ilk vuruşta
  hakem düdük ara planı yok.
- Frikik gol tekrarı: vurucunun arkasından yüksek yayın açısı; uçuş ve topun ağa girdiği nokta (netContact) aynı kadrajda.

## 4x. V131 (millî maç tahminleri)
- Kök neden: `pp_history_ready` aynı organizasyonda ≥3 tamamlanmış maç istiyordu; UNL/hazırlık için yalnız bu ayın
  (oynanmamış) fikstürü çekiliyordu → tahmin hiç üretilmiyor, bülten "analiz hazırlanıyor"da kalıyordu.
- Çözüm: `pp_live_jobs` UNL ve hazırlık için önceki 2 ayın ESPN beslemesini de çeker (`live-prev1/2`, günlük);
  `pp_history_ready` millî maçlarda her zaman true; `pp_forecast` millî maçlarda katalog gücünden önsel çarpan
  (10 puan ≈ %20 gol beklentisi; az maçlı takımlarda ağırlık artar, `quality.inputs.nationalStrengthPrior`).
  Yayınlanan skor tüm liglerdeki gibi seeded senaryo. Test: `national-competitions.php` (Eyl/Eki/Kas ESPN örnekleri).

## 4y. V132 (millî takım güç modeli)
- `tools/national-ratings.py` → `assets/national-ratings.json`: ESPN'den Mart 2023'ten bugüne 3.349 millî maç
  (Dünya Kupası, tüm kıtaların DK elemeleri, EURO + elemeleri, Copa América, Gold Cup, AFCON, Asya Kupası,
  UEFA/CONCACAF Uluslar Ligi, hazırlık). Elo: K = DK 60, EURO/Copa 50, diğer kıta finalleri 45, elemeler 40,
  Uluslar Ligi 35/30, hazırlık 15; gol farkı çarpanı; ev sahibi +100. Kupa bonusu (DK/EURO/Copa 35, diğer 20; 2 yılda
  yarıya iner), son 10 maç form, kadro kalitesi (ESPN millî kadro × bizim kulüp kadrolarındaki FotMob reytingleri,
  en iyi 16). Önbellek `tools/.national-cache` (git dışı). Her millî aradan önce yeniden çalıştırılmalı.
- `pp_forecast` (unl/intl): Elo farkı + kadro (0,1 reyting ≈ 12 Elo) + form → gol üstünlüğü (Elo×0,0048), toplam gol
  lig ortamından; %70 bu model, %30 modeldeki son millî maçlar (hazırlık maçları yarı ağırlık). Katalogda olmayan
  takım için eski güç önseli. `quality.inputs.nationalModel` ayrıntıları taşır.
- Kadro piyasa değeri kaynağı yok (eklenmedi).

## 4z. V133 (geçişlerde siyahlık / kalite)
- Siyahlık: `broadcast.js` her pozisyon başında/sonunda ve aksiyon anında `state.transition` ile tam ekrana
  rgba(8,22,31,≤.55) perde çiziyordu → kaldırıldı (gol sting'i duruyor). Ölçüm: eski perde anlarında parlaklık
  1 sn sonrasıyla aynı.
- Kodlayıcı: WebCodecs `latencyMode` önce 'quality' (realtime yalnız yedek); kamera kesmelerinde anahtar kare
  (`job.isCut`, maç `prepareExport` + penaltı/frikik draw: kamera >2,5 m sıçrar, yön >~20° döner ya da FOV >6
  değişirse). Yazılım kodlayıcı (telefon yedeği) speed 6→4. Worker önbelleği `?v=133`.

## 4aa. V134 (kendi güncellenen millî reytingler)
- `server/national-ratings.php` (Python aracının PHP karşılığı; çıktı Python ile ≤1 Elo aynı). `pp_update` her
  çalışmada `pp_nr_update`: 16 millî organizasyonun bu ay + önceki ay ESPN beslemesi (bu ay 3 sa, önceki 12 sa
  önbellek; web isteğinde en çok 6, cron'da 32 istek), tohum maçlarla birleşir, Elo/kupa/form yeniden hesaplanır →
  `storage_dir/national-ratings.json`; `pp_forecast` onu okur (yoksa `assets/national-ratings.json` tohumu).
- Geçici tahmin: millî maç tahmini, iki takımdan birinin 10 gün içinde daha önce oynanmamış millî maçı varken
  yayınlanırsa `nationalProvisional`; o maç(lar) oynanınca ve başlama saatinden önce güncel reytinglerle yeniden
  üretilir (`revision`, `revisedAt`, `previousPublishedScore`). 22–23 Ekim kilitli tahminlere dokunulmaz.
- Kadro kalitesi (squad) tohumdan gelir; yeni millî kadrolar için ara sıra `python3 tools/national-ratings.py`.

## 4ab. V135
- Millî reyting hafızası kalıcı ve kesintisiz: `pp_nr_fetch` tohum tarihinden bugüne HER ayı kapsar (bu ay 3 sa,
  önceki ay 12 sa, daha eski aylar bir kez çekilip `finalAt` ile kapanır); uzun sunucu duraklamaları otomatik
  tamamlanır. Tüm sonuçlar `storage_dir/national-ratings.json` `games` listesinde birikir; Elo her seferinde tüm
  geçmişten hesaplanır (kulüp liglerindeki geçmiş sonuç mantığıyla aynı).
- Model ve geçici-tahmin kuralı yalnız unl/intl değil, iki taraf da reytingli millî takım olan HER fikstüre uygulanır
  (ileride bültene eklenecek eleme/turnuva fikstürleri dahil).

## 4ac. V136 (ACİL: canlı veri + bellek sızıntısı)
- `data/private/state.json` (V110'da bir testin yazdığı, 680 maç / 0 tahmin) yanlışlıkla commit edilmişti ve V110+
  güncelleme ZIP'lerine girdi → sunucuya yüklenince canlı tahminleri sildi. Dosyalar git'ten çıkarıldı,
  `.gitignore` `data/private/*` (yalnız .htaccess izli). Testler `NEXT90_STORAGE_DIR` geçici klasörünü kullanır
  (`pp_config`, `run-all.cjs`). ZIP üretiminde `data/` her zaman hariç tutulmalı.
- Millî reyting güncellemesi yayın döngüsünden SONRA çalışır (web isteğinde ≤2 besleme ve yalnız süre kaldıysa);
  web isteğinin 14 sn yayın bütçesini tüketemez. En yeni ay önce çekilir.
- Bellek sızıntısı: sahne `dispose` hava durumunu silmiyordu; `weather.js`'in genel `live` kümesi her silinen sahneyi
  (önizleme/video/analiz) bellekte tutuyordu. Düzeltildi: iPhone emülasyonunda video sahnesi 380→263 MB, geçiş tepesi
  464→338 MB, 3 tekrarlı geçişte sabit (E260/P255). Telefonda 1K HDR + 2048 gölge; dışa aktarma her karede yield.

## 4ad. V137 (canlı millî aday kadrolar)
- `server/national-squads.php`: önümüzdeki 10 gün içinde millî maçı olan takımlar için Wikipedia makalesinin
  "Current squad" bölümü (index.php?action=raw, 12 sa önbellek, 429'da 6 sa bekleme, cron 6 / web 1 sayfa).
  Ayrıştırma: oyuncu adı/mevki/forma no/kulüp, aday kadronun maç tarihleri (geçerlilik penceresi), teknik direktör.
  Çıktı `storage_dir/national-callups-live.json` (ESPN takım id anahtarlı) → `pp_national_callup` önce bunu, yoksa
  editoryal `assets/national-callups.json`'u kullanır. ESPN geniş havuzundaki davetsiz oyuncular tahmini 11'den
  çıkarılır, forma numarası kadrodan gelir. `en.wikipedia.org` izinli host. SofaScore otomatik erişime kapalı (403).
- Sınır: ESPN havuzunda hiç olmayan yeni davetliler tahmini 11'e giremez (ESPN kimliği yok).

## 4ae. V138 (2v2 oyuncu düellosu)
- Penaltı ve serbest vuruş stüdyolarında “Kapışma” listesine üçüncü seçenek: **2v2 oyuncu düellosu** (`<option value="duel" data-duo="1">`).
  Değer yine `duel` olduğu için tek oyunculu düellonun tüm mantığı (forma, misafir yıldızlar, ortak kaleci, düello finali) aynen
  geçerli; ikili tespiti `isDuo()` = seçili seçeneğin `data-duo`'su. Her tarafa “İkinci oyuncu” seçimi (`penaltyPartner0/1`,
  `fkPartner0/1`, `.duo-only`), seçenekler o tarafın vurucu listesinden kopyalanır (kadro + yıldızlar/ikonlar).
- Motorlar (`penalty-engine.js`, `freekick-engine.js`): `options.partners` (iki oyuncu) verilirse taraf içinde sırayla
  A1, B1, A2, B2… vurulur; dönüşte `partners` alanı. Partner yoksa tek oyunculu düello birebir aynı.
- İlk kez 2v2 seçildiğinde (veya `?mode=duo`) vitrin ön ayarı: Barcelona + Messi & Yamal vs Real Madrid + Ronaldo & Mbappé.
- Grafikler: tanıtım/kazanan panelinde iki portre üst üste ve “Soyad & Soyad”; finalde kazanan ikili birlikte sevinir
  (ikinci oyuncu slot 10). Yüzler ve portreler hazırlıkta ısıtılır.
- Telefon: FK paylaşım hatası artık sessiz kalmıyor, indirmeye düşüyor (penaltıdaki gibi). Test: `tests/duo.cjs`.

## 4af. V139 (canlı sunucuda maç yok + telefonda hata)
- Yerel tanı: güncel kod boş veriyle, V107/V110 `state.json` ile ve yalnız ziyaretçi tetiklemesiyle hatasız; 9–14 Kasım millî
  ara (kulüp maçı yok), bu pencerede yalnız Uluslar Ligi/hazırlık maçları var. Kullanıcı sunucusunda neden olmadığı
  görülemiyor → **`durum.php`**: PHP/cURL, veri klasörü ve `state.json` yazılabilirliği, cron son çalışma, kayıtlı maç/tahmin,
  önümüzdeki 6 gün, kaynak başına durum/hata, canlı ESPN testi; “Verileri şimdi topla” (POST `durum.php?action=collect`,
  cron.php gibi 4'er kaynak, aynı site, kilitli) cron olmadan veriyi doldurur.
- Ziyaretçi yenilemesi artık 1 yerine en fazla 3 kaynak çeker (~7 sn bütçe; ilk kaynak hep çekilir).
- Stüdyolar (telefon): ses bağlamı MP4 düğmesine basıldığı anda açılır (iOS uzun sahne kurulumundan sonra sesi başlatmıyor,
  5 sn sonra “zaman aşımı” ile export iptal oluyordu); ses başlamazsa video sessiz hazırlanır. Sahne hazırlığı telefonda
  120 sn'ye kadar bekler; yüz/portre/arma ve kadro zenginleştirme zaman aşımı artık ölümcül değil.

## 4ag. V140 (KÖK NEDEN: korunan tahmin kilidi tüm güncellemeleri durduruyordu)
- `server/forecast-lock.php`: veri klasöründeki `forecast-lock-20261022-23.json` (22–23 Ekim tahminleri) `state.json` ile
  uyuşmayınca `pp_forecast_lock_capture/assert` RuntimeException atıyordu → `pp_update` her istekte iptal (api 503),
  hiçbir lig/Uluslar Ligi yazılamıyordu. V110–V135 paketlerindeki eski `state.json` sunucudakinin üstüne yazılınca bu
  durum oluştu; sonradan V107 datası konsa da kilit dosyası kaldığı için düzelmedi. Artık assert yalnız günlüğe yazar,
  okunamayan kilit yok sayılır, `pp_update` başta `pp_forecast_lock_merge` ile korunan kayıtları geri koyar.
- Yayın döngüsünde tek bir maçın tahmin hatası artık tüm güncellemeyi durdurmaz (try/catch, maç atlanır).
- Test: `tests/forecast-lock.php`. Kullanıcı durumunun kopyası (V110 state + uyuşmayan kilit, cron yok) 12 ziyarette
  bültene 26 UNL + 6 hazırlık maçı getiriyor.

## 4ah. V141 (cron'suz hızlı dolum + aday kadro her kaynakta)
- Canlı site: https://darkgreen-penguin-901774.hostingersite.com (Hostinger, PHP 8.3, cron YOK). `durum.php` ile izlenebilir.
- `pp_due_jobs`: önümüzdeki 6 günde maçı olan ya da hiç çekilmemiş kaynaklar öne (`windowPriority`). Ziyaretçi yenilemesi
  6+ kaynak eksikse 10 kaynağa kadar (~25 sn bütçe) çeker; yayın sınırı ziyaret başına 4. Boş veriden ilk ziyaretten
  ~20 sn sonra Uluslar Ligi bültende.
- `pp_national_callup_filter` (player-lineups.php), `pp_coaches_finalize` başında her dönüş yolunda: resmî kadro
  (provider-lineup) dışındaki tüm tahmini millî XI/yedeklere aday kadro uygulanır; çağrılmayanlar aynı hattan en yüksek
  reytingli davetli ile değişir (kulüp kadrosundan yüz/reyting), kalan davetliler yedeğe eklenir, teknik direktör
  federasyon listesinden. Canlıdaki hata: FotMob “son 11” yolunda İrfan Can/Kerem kalıyordu. Test: `tests/callup-filter.php`.

## 4ai. V142 (iPhone 13: “bu sayfada birçok kez sorun oluştu” — sekme bellek çöküşü)
- Ölçüm (WebGL çağrıları sayılarak, iPhone 13 profili): V130 katmanlı model ön izleme ~230 MB doku + MP4'te ikinci yüksek
  sahne ~340 MB + tam sinematik zincir RT'leri → iOS WebGL belleğini geç bıraktığı için ~600 MB+ tepe. V127'de bulunan
  “tam çözünürlük bloom/DOF/SMAA/sharpen arabellekleri iPhone'u öldürür” notu V129'da yanlışlıkla geri alınmıştı.
- iOS (`IOS_STUDIO`): stüdyolar yüksek sahneyi bir kez kurar, katman değişimi yok (export ek ~70 MB); `broadcast-remaster.js`
  iOS'ta LITE zincir (HDR→ACES→grade). Android katmanlı modelde kalır.
- Çöküş koruması: `sessionStorage['next90-export-<sayfa>']` hazırlık/export sırasında set edilir; sekme ölürse sonraki
  açılışta hafif (balanced, compact) sahne kullanılır.

## 4aj. V143 (seremoni logoları + düelloda takım forması)
- `pregame-ceremony.js`: seremoni bezleri yeniden ışıksız `MeshBasicMaterial` (V107 görünümü), renk 0xd6d6d6 → beyaz bloom
  eşiğinin (0.74) altında, logolar kendi renk/kontrastıyla; logo büyütüldü (690→760 px), halka inceldi. V121'deki ışıklı
  kumaş + sheen, floodlight ve ACES ile logoları yıkıyordu.
- Düello/2v2 forma: penaltı `penaltyGuestKit` ve FK `fkKit0/1`'e `team` seçeneği (“Seçtiğin takımın forması (Kadro)”):
  forma, isim ve arma seçilen kadro takımından; oyuncu kendi numarasıyla (Messi 10, Yamal 10, Ronaldo 7, Mbappé 10).
  2v2 vitrin ön ayarı artık Barcelona / Real Madrid formasıyla açılır.
- Not: kullanıcı V141'i (aday kadro filtresi) yüklememişti; canlı `build.php` 140 gösteriyordu.

## 4ak. V144 (millî 11: TFF aday kadro + BSD beklenen 11 + numaralar)
- BSD (sports.bzzoiro.com, `Authorization: Token`, anahtar sunucuda config/`bsd-credentials.json`): millî maçlar da var
  (UNL league_id 64; Türkiye team 932). `/api/v2/events/{id}/lineups/` → `lineup_status` predicted/confirmed (beta, AI),
  `unavailable_players` (injured/suspended). BSD millî **aday kadroyu bilmez** (squad uç noktası boş; tahmini yedeklerde
  İrfan Can, Kerem, Altay, Şengezer vardı). `bsd_national_lineup()` tarih + takım adıyla (pp_provider_name) eşleştirir.
- `pp_national_callup_filter($snap,$m,$now,$cfg)` yeniden yazıldı: kim oynayabilir = aday kadro; kim başlar = BSD beklenen
  11 (sağlayıcı XI'nın formasyon slotlarına grup bazlı), BSD sakat/cezalı çıkarılır; yedek: BSD yedekleri sonra reyting,
  kaleciler önde, ≤12; numara: federasyon > sağlayıcı millî no > bilinen (Hakan 10, Arda 8, Orkun 6, Kenan 19) > boş no.
  Grup: kaleci federasyon listesinden, saha oyuncusu kulüp kadrosu doğal rolünden; reyting statik kaynaktan → idempotent.
- `assets/national-callups.json` Türkiye: 26 kişi + mevki + Wikipedia numaraları (TFF 6 Kasım listesi, haberlerle teyit).
- `durum.php`: BSD anahtarı tanımlı mı satırı.

## 4al. V145 (Transfermarkt aday kadro + elle düzenleme)
- Kaynak araştırması (9 Kasım 2026, Türkiye): TFF listesi 26 kişi (haberlerle teyitli). **Transfermarkt** millî takım
  `kader` sayfası birebir aynı (Kerem/İrfan Can/Altay/Şengezer yok; Hakan kaptan). FotMob millî kadro listesi ESKİ (Kerem,
  İrfan, Altay var); BSD tahmini 11/yedekleri de aday kadroyu bilmiyor (Kerem 11'de); BSD squad uç noktası boş.
- `server/national-transfermarkt.php`: `pp_tm_parse` (isim, hat, ayrıntılı mevki, no, kaptan, kulüp), `pp_tm_callup`;
  `assets/national-transfermarkt.json` 85 millî takımın TM slug/id'si. `pp_ns_update` önce TM (6 sa önbellek, 403/405/429'da
  2 sa bekleme), olmazsa Wikipedia. TM sık istekte 405 veriyor → nazik kullanım şart.
- `pp_national_callup` önceliği: elle (`national-callups-manual.json`) > canlı (TM/Wikipedia) > editoryal; eksik no/teknik
  direktör editoryal listeden.
- **`kadro.php`**: şifreli (ilk kullanımda belirlenir, hash `kadro-admin.json`) elle aday kadro / ilk 11 / diziliş / TD
  düzenleme; kayıt takımın bu aradaki son maçına kadar geçerli; “Otomatiğe dön”.
- Filtre: diziliş elle > BSD > sağlayıcı; elle XI'da hat sayılarına en yakın şablon; oyuncu-slot ataması doğal role göre
  açgözlü maliyet (`pp_lineup_role_cost`).

## 4am. V146 (iPhone: MP4 bittikten sonra sayfa yenileniyordu)
- iPhone 13'te export tamamlanıyor, ardından sekme çöküyordu: 3D sahne (~400 MB GPU) + bitmiş MP4 blob + 1080×1920
  `<video>` ön izleme aynı anda. iOS'ta (`IOS_STUDIO`) MP4 hazır olunca `releaseScene()` sahneyi ve WebGL bağlamını
  bırakır (`forceContextLoss`), `<video preload=metadata>`; Oynat/ileri sarma/yeni MP4'te `ensureScene()` aynı seriyi
  (aynı contest, yeni senaryo değil) yeniden kurar.

## 4an. V147 (file, düello portreleri, FK gerçekçiliği)
- `scene.js` kale filesi: her yüzde eşit ~24 cm göz (arka/çatı 31 ip, yatay 11 sıra, yan/çatı derinlik 9 ip; çatıya
  çapraz ipler eklendi), renk/opaklık 0xe8eee9/.72. Eski 12 cm göz 1080 px'te hareli yüzey yapıp topu gizliyordu.
  Tüm modlarda (maç, penaltı, FK, konsept) aynı `SekmeScene` filesi. Fizik (düğüm yer değiştirmesi) değişmedi.
- Düello portreleri: kulüp kadrosundan seçilen oyuncunun `portrait.php` adresi stüdyoda çalışmıyordu (yalnız kayıtlı
  maç XI'ları); `portraitFor()` önce yerel `assets/faces/player-portraits.json` fotoğrafını kullanır (ör. Yamal 745.webp).
- FK takım modu: en iyi **5** vurucu sırayla (önce 3); `SPECIALISTS` 36 güncel frikikçiyle genişledi.
- FK gol seçimi: `ok` artık gol için kaleci geçiş mesafesi ≥1.28 (uzanma elipsinin açıkça dışı) ya da parmak ucu teması
  ister → kaleci yanından sızan gol 423'te 2 (yedek seçim).

## 4ao. V148 (marka panoları)
- Sahibin isteği: oyun içinde hiçbir panoda “NEXT 90 SIM” yazısı olmayacak. `stadium-boards.js` `house()` artık yalnız
  sayfanın profil resmi (assets/next90sim.png) + büyük `@next90sim`, yan yana ortalı (stüdyolar ve brandBoards maçları).
  `tests/freekick.cjs` bunu doğrular. Not: `brand-config.js` `name` alanı yalnız sayfa başlıklarında kalır.
- Kullanıcı: iPhone'da FK MP4 %20'yi yeniden başlamadan geçti (V146–V147 düzeltmeleri sahada çalışıyor).

## 4ap. V149 (skor tablosu + zemin, sıralı geliştirme 1. adım)
- Penaltı skor tablosundaki ani ölüm aralık etiketi (“6–8”) kaldırıldı (`label:''`); FK tablosunda zaten yoktu.
- Zemin: biçme şeritleri 14×7.5 m → 20×5.25 m (`STRIPES` scene.js, tufts rengi pitch-detail.js). Renk/parlaklık/ton
  eşleme DEĞİŞMEDİ (kullanıcı: parlaklık/kontrast oynaması istemiyor; V121 seremoni dersi).
- Sıralı geliştirme planı (kullanıcı sırası): zemin ✓ → kale (file V147 ✓; sırada sallanma) → top fiziği → top →
  oyuncular → kaleci → stadyum → taraftar/animasyonlar. Her adımda önce/sonra görüntüsü.

## 4aq. V150 (kaleci gözü kamerası)
- Penaltı: yeni `penaltyCamera` seçimi (Yayın kamerası / Kaleci gözü). FK: `fkCamera`'ya `keeper`.
- Kaleci gözü: kale çizgisinde göz hizası (penaltı x=52.05,y=1.74; FK kalecinin yüzünün 0.38 m önü, barajın açık
  tarafına 0.42 m eğik, y=1.8). Vuruştan önce dar açı (penaltı fov 27, FK 17) vurucuya; temasla genişleyip (≈56–58)
  topu izler. Vurucunun üstünde maçtaki gibi isim etiketi (`nameTag`/`shooterTag`, temas anına kadar). Tekrar ve final
  kameraları değişmedi; MP4 de seçilen kamerayla.

## 4ar. V151 (kaleciler vurucu)
- Penaltı düellosunda vurucu/ikinci oyuncu listesine “Kaleciler · diğer kulüpler” (`keeper:club:id`) ve “Kaleciler ·
  millî takımlar” (`national:id`) grupları (yalnız düelloda açık; partner listesi grupları etiketiyle kopyalar).
  Kendi kadrodaki kaleci zaten seçilebiliyordu. Takım penaltılarında kaleci 11. vurucu (motor `automaticKeeperLast`).
- FK: kadrodaki kaleci de listede (` · GK`); düelloda aynı iki kaleci grubu. Motorlar kaleci vurucuyu zaten destekliyor
  (test: Ederson–Uğurcan penaltı ve FK düellosu).

## 4as. V152 (kaleci gözü düzeltmesi, takımlar ayrı, file cebi)
- Kaleci gözü: temasla kamera kalenin içine (x=53.4, y=1.85) çekilir ve sahaya bakar (aim ≈ x 46.2–46.5, y 1.0);
  önceki sürümde uzanan kaleci kamerayı kaplıyordu, yüksek kamerada üst direk bant gibi görünüyordu.
- Takım penaltıları: bekleyen oyuncular her takım kendi tarafında (z işareti = takım; orta yuvarlak), kaleci gözünde
  bir takım solda, diğeri sağda.
- File (kale adımı): `world-upgrade.js netResponse` + top büyüklüğünde cep (r≈0.34 m, 0.1 sn'de açılır, 0.35–0.8 sn
  arası gevşer, en çok ≈0.3 m × enerji); yayılan dalga aynı.

## 4at. V153 (FC tarzı file, top izi, çatı projektörleri)
- File: `LineSegments` yerine 4 bez panel (arka 48×16, çatı 48×14 hafif sarkma, yanlar 14×16 bölüt) + 64 px
  düğümlü ip dokusu (12 cm göz, mipmap + anizotropi; uzakta yumuşak beyaz tül, hare yok). `goal-net-cloth`;
  aynı düğüm haritası/netResponse (cep + dalga) çalışır. Kullanıcı FC27 görselleri referans.
- Top: hızlı topa (>12 m/s, kare arası) yön boyunca top genişliğinde soluk iz (`ballMotionBlur`, durum zamanıyla
  deterministik; MP4 = ön izleme).
- Stadyum: çatı iç kenarında projektör gantrisi (`roof-floodlight-housings/lenses`, 2 instanced çizim, ~3.4 m aralık).
- Kalan (açık, T-11): oyuncu/kaleci animasyon ve taraftar katmanında görünür yenilik bu sürümde yok.

## 4au. V154 (vuruşta çim sıçraması)
- `scene.js updateSpray`: yerdeki top sert vurulunca (kare arası hız <4 → >14 m/s, top y<0.35) vuruş noktasından
  26 çim + 26 toprak parçası (instanced, 2 çizim) kalkar; konum vuruştan geçen durum zamanının saf fonksiyonu
  (ön izleme = ileri/geri sarma = MP4). Düşük kalitede kapalı. Maç, penaltı, FK, konsept hepsinde otomatik.
- Denenip geri alınan: dünya uzayı gece gökyüzü kubbesi (görünen kadrajlarda fark yaratmadı).
- Kalan katmanlar incelendi: oyuncular (mocap idle/koşu), kaleci (yaylanma, adım, kurtarış türleri), taraftar
  (atkı, flaş, meşale, duman, konfeti, dalga) zaten mevcut; hedefli istek bekleniyor.

## 4av. V155 (kaleci kurtarış sevinci)
- Penaltı/FK: kurtarışta kaleci tepkisizdi. Artık tepki yaşı penaltıda 0.9 sn, FK'de 0.75 sn sonra (kaleci doğrulunca)
  `happy(...,'small')` ile sevinç (kutlama paketinden, vuruş indeksine göre deterministik). Tepki süresi penaltıda
  ≈1.5–2.1 sn, FK'de ≈1.6 sn. Tribün tepkisi (kaleci tarafı konfeti) zaten vardı.

## 4aw. V156 (direk titremesi, sekme tozu, yağmurda su)
- `state.woodworkHit={at,sign}` (penaltı: kickContact+flight; FK: 2.6+woodwork.time) → sahnede kale grubu
  ≈18 Hz, ±1.4 cm, 0.75 sn sönümlü titreşir (ölçüldü).
- Sıçrama sistemi: sert sekme (önceki vy<−3.2 → ≥−0.5, y<0.3) küçük ölçekli toz (scale≤0.75); ikinci malzeme hava
  durumuna göre (açık: toprak, yağmur: yarı saydam su, kar: kar) — `sprayWeather` setWeather ve Next90Weather tercihinden.

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
