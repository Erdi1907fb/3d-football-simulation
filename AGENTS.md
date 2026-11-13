# AGENTS.md — next90sim / 3D Football Simulation

Bu dosya, bu repoda çalışan **tüm yapay zekâ ajanlarının** (ChatGPT Codex, Claude Code ve
sonradan eklenecek diğerleri) ortak talimatıdır. `CLAUDE.md` bu dosyaya bağlıdır; çelişki
olursa **bu dosya geçerlidir**.

## 0. Her oturumun ilk 5 dakikası (zorunlu)

1. `git fetch origin && git checkout main && git pull` — en güncel `main` ile başla.
2. Sırayla oku: `VERSION` → `docs/ai/PROJECT_STATE.md` → `docs/ai/HANDOFF.md` (en üstteki
   kayıt en yenisidir) → `docs/ai/TASKS.md` → gerekirse `docs/ai/DECISIONS.md`.
3. Kullanıcının yeni isteğini `docs/ai/TASKS.md` içine **yeni görev** olarak ekle
   (durum: `in-progress`, sahibi: sen). Kullanıcının yeni isteği her zaman eski
   görevlerden önceliklidir.
4. Diğer ajanın açık bıraktığı işler ve “dikkat” notları varsa önce onları değerlendir.

Uzun vadeli futbol geliştirmesinde `docs/ai/FOOTBALL-ROADMAP.md` ve TASKS T-286…T-290 da okunur. Aşama/test/cihaz durumları en yeni HANDOFF ile doğrulanır; plan listesini tamamlanmış iş sanma.

## 1. Proje özeti

- Statik web sitesi + küçük PHP yardımcıları (Hostinger, `public_html`). Derleme adımı yok;
  tarayıcı `assets/*.js` dosyalarını doğrudan yükler. Three.js r15x (`assets/vendor/three.min.js`).
- Giriş sayfaları: `index.html` (maç merkezi, normal 11’e 11 maç), `penalty.html`
  (Penaltı Stüdyosu), `freekick.html` (Serbest Vuruş Stüdyosu, V108), `football-lab.html`,
  `face-coverage.html`. Sunucu tarafı: `*.php`, `server/*.php`, `cron.php`.
- Hedef çıktı: 1080×1920, 60 FPS, MP4 dikey video (Reels/Shorts). Masaüstü ve mobil ön izleme
  ve indirme akışı bozulmamalı.
- Ayrıntılı mimari: `docs/ai/PROJECT_STATE.md`.

## 2. Mimari kurallar

- **Ortak mod altyapısı.** Normal maç, Penaltı, Serbest Vuruş ve Japon Kale/Küçük Saha aynı sahneyi
  (`assets/scene.js`), aynı oyuncu/forma/yüz sistemini, aynı top fiziğini
  (`football-physics.js`, `ball-aero.js`, `open-football-adapter.js`), aynı kaleci dalış
  animasyonunu ve aynı video hattını (`video-core.js`) kullanır. Stüdyoya özel davranış,
  seçenek bayraklarıyla (`penaltyStudio`, `freeKickStudio`, `japonSides`, `brandBoards`) eklenir — ayrı
  fizik motoru yazılmaz.
- **Modül biçimi:** her dosya UMD benzeri IIFE’dir: Node’da `module.exports`, tarayıcıda
  `globalThis.<Ad>`. Yeni modül bu kalıbı izlemeli ki `tests/*.cjs` ile Node’da test edilebilsin.
- **Kanonik dosya adları:** `assets/<ad>.js` tektir. Önbellek kırma için HTML’de
  `?v=<sürüm>` kullanılır. `scene.v108.js` gibi **sürüm adlı kopya oluşturma** (V108’de 200+
  yinelenen kopya temizlendi).
- **Determinizm:** simülasyonlar tohumlu (`seed`) ve tekrar üretilebilir olmalı. Ön izleme,
  geri sarma ve MP4 aynı tohumdan aynı sonucu vermeli.
- **Fizik önce:** top ışınlanmaz; sonuç (gol/kurtarış/direk/baraj) fiziksel temasla oluşur.
  İstenen sonuç bulunamazsa fiziksel sonuç kazanır.
- **Dürüstlük:** uydurma istatistik, sahte resmî logo/forma eklenmez. Tahmin modelleri
  “model tahmini/eğlence ağırlığı” olarak etiketlenir.
- **Reels/Shorts güvenli alanı:** stüdyo grafikleri yalnız `Stage.overlayLayout` bandında (1080×1920’de x 30–909, y ≈1296–1518). Üst ~250 px, alt ~400 px ve sağ kenar platform arayüzüne aittir; kamera aksiyonu bandın üstünde tutar.
- **Sevinçler:** `assets/celebration-pack.js` (100 sevinç + 14 takım rutini) tüm modlarda ortaktır; yeni sevinç eklerken `NAMES` listesine ekle ve `tests/celebrations.cjs` çalıştır.
- **Reklam panoları:** stüdyolarda (penaltı/serbest vuruş) lig markası yok; next90sim
  markası (`assets/brand-config.js`, `assets/next90sim.png`).
- Kullanıcının istediği özellikleri izinsiz kaldırma. Çalışan sistemi sıfırdan yeniden yazma.

## 3. Kod standartları

- Mevcut dosyalar sıkıştırılmış tek satır stilindedir; düzenlerken aynı stili koru, büyük
  yeniden biçimlendirme yapma (diff’i okunamaz kılar). Yeni dosyalar okunabilir yazılabilir.
- Metinler TR/EN iki dillidir: `tr('Türkçe','English')` kalıbı.
- Yeni varlık (görsel/model/ses) eklerken lisansını `ASSET-LICENSES.md` içine yaz.
- 12 MB’tan büyük dosya eklemeden önce `docs/ai/DECISIONS.md`’ye gerekçe yaz.

## 4. Testler

Kökten çalıştır (Node 18+). Hepsi geçmeden sürüm “kararlı” ilan edilmez.

| Komut | Kapsam | Süre |
|---|---|---|
| `node tests/run-all.cjs [--quick]` | **Hepsini çalıştırır**, `tests/summary.json` yazar; tam paket 43 test; `--quick` `engine-test.cjs` hariç 42 test | ~2,5 dk (quick ~1 dk) |
| `node tests/audio-export.cjs` | Native AAC / yerel yazılım AAC seçimi, iptal, eksik/yanlış/kısa ses izinin reddi | <1 sn |
| `node tests/contact-motion.cjs` | Gerçek vuruş/alım IK, erişim ve root/top değişmezliği; tek kaleci yükselmesi | ~1 sn |
| `node tests/teamwork.cjs` | Verkaç/üçüncü oyuncu, destek açıları, sektör/geçiş örtüsü ve sentetik takım karakteri | ~3 sn |
| `node tests/football-intelligence.cjs` | Yetişme/pas koridoru/markaj ve gözleme dayalı fiziksel kaleci | ~2 sn |
| `node tests/arena-elimination.cjs` | Kayıtlı4→3→2saha, kimlik, fizik/render ve geri sarma | ~2 sn |
| `node tests/futsal-five.cjs` | 5v5/same pitch, yiyenin paslı santrası, alan/adam örtüsü, fiziksel ilk vuruş/kafa, yasal GK eli, taraftar finali/madalyalar ve iki video oranı | ~8 sn |
| `node tests/arena-balance.cjs` | Orta mesafe aksiyon, sabit basın tribünü, GK dönüş/temas zamanı, çarpışma öngörüsü ve top yüküyle esneyip bırakan file | ~3 sn |
| `node tests/arena-football.cjs` | Dikdörtgen, ivme/dönüş, yer direnci, alım/vuruş zamanı, şut kanalı, sekme okuyan GK, yakın açılış/kısa doğru sonuç | ~4 sn |
| `node tests/arena-broadcast-flow.cjs` | Seçici isim, tek baskıcı, çalım sonucu, hareket eden gol topu/ortak file, yan kamera ve taraftar finali | ~3 sn |
| `node tests/arena-duels.cjs` | Çalım/savunma/gerçek temas, kutu faulü/penaltı/FK, GK tutuş/geri pas/dağıtım, canlı top sınırı ve TR/EN | ~20 sn |
| `node tests/arena-rush.cjs` | 2–6 takım × 5 süre, kesintisiz zaman, farklı gerçek skor/son bölüm, anlatım, koridor/duvar/güvenlik ve boya katmanı | ~3 sn |
| `node tests/national-coverage.cjs` | 85 millî kadro/forma, ilk 11 doğruluğu, normal maç tamamlama ve güncel konsept takımlar | ~1 sn |
| `node tests/small-sided.cjs` | 5v5/3 kişilik kadro, serbest saha seçimi/GK doğrulama, santra yarışı, fiziksel pas/kurtarış, eşit/birleşik tribün ve sürekli güvenli kamera | ~2 sn |
| `node tests/japon-net.cjs` | Normal file dokusu, 4,4/5/6 m ölçü, açık kale ağzı, ayrı geometri ve ortak kaynakların korunması | <1 sn |
| `node tests/japon-camera.cjs` | Büyüyen 2–6 kale sahaları, 5v5/üçlü kadrolar/efsaneler, 4 kamera için Reels/Shorts güvenli izdüşümü ve geri sarma | ~1 sn |
| `node tests/japon-kale.cjs` | 2–6 taraf, 50 senaryo, eleme/puan, tur sıfırlama, fiziksel gol çizgisi, özet zamanları, determinizm | ~2 sn |
| `node tests/commentary.cjs` | TR/EN anlatım, gerçek olay/oyuncu, video zamanları, SRT | <1 sn |
| `node tests/freekick.cjs` | Serbest vuruş fiziği, baraj/kaleci/direk, kurallar, ayna noktalar, millî baraj verisi, marka panoları | ~10 sn |
| `node tests/penalty.cjs` | Penaltı teknikleri (9 tür), hız aralığı, ayak dışı falso, süreklilik | ~3 sn |
| `node tests/weather.cjs` | Hava durumu: uygula/geri yükle, geç kumaşlar, kalite ölçeği, zaman tabanlı yağış | <1 sn |
| `node tests/graphics.cjs` | Post-process paketi, kar izi/yağmur sıçraması, geri sarma, diziliş şeritleri | <1 sn |
| `node tests/celebrations.cjs` | 100 sevinç + 14 takım rutini, 14.400 poz sonlu/geçerli, planlayıcı dağılımı | <1 sn |
| `node tests/forecast.cjs` | Konsept analiz (1X2 toplamı, simetri, ev avantajı), sezon motoru (fikstür, puan, tohum) | ~2 sn |
| `php tests/forecast.php` | Sunucu tahmin modeli: determinizm, xG sınırları, gelecek veri sızıntısı yok, piyasa oranı, kilit özeti | <1 sn |
| `node tests/presentation.cjs` | Penaltı serileri, resmî kural, yerleşim | ~3 sn |
| `node tests/variation.cjs` | Senaryo çeşitliliği, top adım sürekliliği | ~3 sn |
| `node tests/recovery.cjs` | Misafir oyuncu düelloları, milli kaleciler | ~1 sn |
| `node tests/intent.cjs` | Oyuncu niyeti, file geometrisi | <1 sn |
| `node tests/remaster.cjs` | Taktik hedefler, kaçınma, shader sözleşmesi | <1 sn |
| `node tests/crests.cjs` / `node tests/search-test.cjs` | Arma ve arama | ~1 sn |
| `node tests/engine-test.cjs` | 18 normal maç, 500 penaltı serisi | ~2 dk |
| `node tests/duo.cjs` | 2v2 düello: ikililer sırayla vurur (penaltı + FK) | <1 sn |
| `node tests/kickoff-referee.cjs` | Başlama vuruşunda hakem/vurucu çakışması | <1 sn |
| `php tests/national-competitions.php` | Uluslar Ligi/hazırlık maçları, millî reyting güncelleyici, aday kadro (Wikipedia/Transfermarkt) | ~2 sn |
| `php tests/forecast-lock.php` | Korunan tahmin kilidi uyuşmazlığı güncellemeyi durdurmaz (V140) | <1 sn |
| `php tests/callup-filter.php` | Aday kadro filtresi tüm sağlayıcılarda, numaralar, Transfermarkt ayrıştırma | <1 sn |
| `node tests/faces.cjs` | Yüz pozları (`@napi-rs/canvas` gerekir) | — |

Tarayıcı kontrolü: `python3 -m http.server` ile kökü sun, Playwright/Chromium ile
`freekick.html`, `penalty.html`, `index.html` aç; `window.Next90FreeKickStudio.draw(t)` /
`window.Next90PenaltyStudio.draw(t)` ile kare çizdir. Yazılımsal WebGL testi fiziksel cihaz
testi değildir — raporda böyle belirt.

## 5. Sürüm politikası

- Tek kaynak: kökteki `VERSION` dosyası (ör. `V108`).
- Sürüm numarası her commit’te değil, **test edilmiş ve bütünleşmiş** bir sürüm
  tamamlandığında artırılır. V108 tamamlandı → yeni işler **V109** hedefiyle yapılır.
- Sürüm kapatırken: `VERSION` güncelle → HTML’lerde `?v=` değerini güncelle →
  `build.php`, `index.php` ve `assets/penalty-link.js` build numaralarını güncelle →
  `node tools/make-release.cjs` (assets/release-vNNN.json; `build.php` bunu kullanır) →
  `php build.php` ile filesMatch doğrula → `docs/ai/CHANGELOG.md`. Manifest kod değişikliklerinden sonra üretilir.
- Eski sürüm giriş adresleri (`next90sim-vNN.html`, `penalty-vNN.html`) `.htaccess` ile
  kanonik sayfaya yönlenir; yeni sürüm kopyası HTML üretme.

## 6. Ortak çalışma protokolü (Codex ⇄ Claude)

Ajanlar birbirinin sohbetini **göremez**. Ortak hafıza yalnızca bu repodaki commit edilmiş
dosyalardır.

1. **Dal:** her görev için `agent/<ajan>/<kısa-konu>` (ör. `agent/codex/match-ai-pressing`)
   ya da platformun verdiği dal. Kullanıcı `main`’e push istediyse, testler geçtikten sonra
   `main`’e hızlı ileri (fast-forward) birleştir; zorla push (`--force`) yapma.
2. **Dosya sahipliği:** üzerinde çalıştığın dosyaları `docs/ai/TASKS.md` görev satırına yaz
   (`files:`). Diğer ajanın `in-progress` görevindeki dosyaya dokunmadan önce HANDOFF’a not düş.
3. **Silme/geri alma:** diğer ajanın işini habersiz silme, üzerine yazma veya eski sürüme
   döndürme. Gerekiyorsa gerekçesini `DECISIONS.md`’ye yaz.
4. **Oturum sonu (zorunlu):** `docs/ai/HANDOFF.md`’nin **en üstüne** yeni kayıt ekle
   (şablon dosyada), `TASKS.md` durumlarını güncelle, değişen mimariyi
   `PROJECT_STATE.md`’ye işle, önemli kararları `DECISIONS.md`’ye ekle. Kod ve raporlar aynı
   commit/PR’da olmalı.
5. **Dürüst rapor:** başarısız/yarım işi tamamlanmış gibi yazma; `TASKS.md`’de `blocked` veya
   `partial` olarak bırak, nedenini yaz.
6. Commit mesajları: `V109: <özet>` biçimi; gövdede ne/niçin.

## 7. Dokunurken dikkat

- `assets/club-rosters-v75.json`, `assets/kits/**`, `assets/faces/**`, `assets/concept/teams.js`
  büyük veri dosyalarıdır; adlarını değiştirme (sunucu ve testler bu yollara bağlı).
- `data/private/` ve sunucudaki `config.php` gizlidir; repoya gerçek anahtar koyma.
- `.htaccess` `docs/`, `tests/`, `tools/`, `*.md` erişimini engeller; yayına bunları açma.
- **Dosya silme kuralı:** bir dosyayı silmeden önce `index.html`, `penalty.html`, `freekick.html`, tüm `*.php`, `server/*.php` ve aktif JS’ten (dinamik yol birleştirmeleri dahil: `'assets/pitch/turf-'+kind`) referans taraması yap. PHP veri akışı (haftalık bülten, 5 gün ileri maçlar, cron) dosyalarına dokunma. Emin değilsen silme, `TASKS.md`’ye not düş.

## 8. Japon Kale ve anlatım (V158)
- `japon-kale.html`: 3–6 taraf Japon Kale (kaleci + 2 serbest saha oyuncusu); `?mode=small`: 2 taraf Küçük Saha Maçı (kaleci + 3 serbest saha oyuncusu, süreli 4v4). Eski ikili seçimi son kullanıcı talebiyle kaldırıldı. Yalnız kaleci slotu GK ile sınırlıdır. `japon-engine.js` ortak `ball-aero.js` ile 120 Hz fizik, 20 Hz kayıt; V162 süreli oyun kesintisizdir; eski süresiz eleme API kesitleri tüm golleri/elemeleri korur. `sample` video zamanı alır, `liveTime` oyun zamanıdır.
- `scene.js` `japonSides` yalnız bu modun aktör formalarını/kimliklerini seçer; diğer modların sahne yolu korunur.
- `commentary.js` gerçek olaylardan metin üretir, TTS değildir. Normal maçta `match.toVideoTime`, stüdyolarda `resolvedAt`, Japon Kale’de özet video olay zamanlarını kullan. Sonuç/isim uydurma.
- Süresiz API elemesinde 900 sn (arayüzde seçilen 30–90 sn) oyun sınırı aşılırsa sonuç tamamlanmamış gösterilir; zorla şampiyon üretme.

## 9. Japon Kale yayın kuralları (V159)
- `japon-layout.js`: görünür zemin/sınır ile fizik aynı geometriden gelir. 2 kale kısa dikdörtgen; 3–6 kale köşeleri kesilmiş çokgen; toplam alan kale sayısı ve kale genişliğiyle artar.
- `japon-camera.js`: yakın kritik oyuncuların ayak/baş noktaları ve top; top kaleye yaklaşırken hedef kalenin direk/net köşeleri 1080×1920’de x=64–884 / y=295–1220 içine sığdırılır. Sabit geniş açıya dönme; `tests/japon-camera.cjs` kontrolünü koru. Skor bandı y=1296–1518.
- İsimler oyuncuların üstünde, kulüp adı yalnız kalede (takım modunda); etiket çakışmalarını yönet. Kamera ve isimler MP4’te de aynı draw yolundan geçer.
- `japonSize` 4/3 ortak sahne aktörlerinin rol/forma eşlemesini belirler. 18 aktör (6×3) en çoktur; iki takımda 8 aktör (2×4). Eski `team*2+1` varsayımını kullanma; `frame.owner` gerçek aktör slotudur, olaylarda `actorIndex` bulunur.
- `japon-legends.json` yalnız mevcut konsept arşivinin 29 kişilik hafif seçkisidir (`node tools/build-japon-legends.cjs`). Harici veri/varlık eklenmedi.

## 10. Küçük Saha / Japon Kale görsel tercihi (V161)
- Kullanıcının görsel referansı: eğik, yakın, topu/atağı takip eden yayın açısı. Takım sayısı arttığı için otomatik tepe kamerasına dönme. `wide` yalnız açıkça seçilen taktik alternatiftir; açılış ve finalde otomatik genel açı yok.
- Kamera, video zamanına göre önceden hesaplanan yumuşak hedef ve öngörülü zoom zarfıdır (`japon-camera.js`). Ön izleme/geri sarma/MP4 aynı kareyi verir; top + ilgili oyuncular + hedef kale Reels/Shorts aksiyon alanında kalır. Yeni top/pozisyon sahipliğinde ani ekran yönü dönüşü yapma.
- `japon-crowd.js`: normal maçın **aynı** `scene.createSpectator` ayrıntılı modeli, geometriye uygun birleşik beş sıralı küçük tribünler. Eşit kişi sayısı ve seçili forma renkleri; gol tepkileri gerçek video olaylarından. Kendi kaleye gol ve beraberlikte yanlış sevinç üretme. Paylaşılan geometri/materyalleri local dispose içinde serbest bırakma.
- Açılışta ve gol sonrası top ortaya düşer, fiziksel yakınlıkla kapışılır; dizideki oyuncu sırası topu kazandırmaz. Defans/orta saha/hücum rolü yalnız başlangıç yerleşimi/davranışıdır, saha oyuncusu seçimi mevkiyle sınırlanmaz.

## 11. Süreli arena ve millî kapsam (V162)
- Arayüzde 2–6 takımın hepsinde 30/45/60/75/90 sn oyun süresi + 5 sn sonuç ekranı vardır. Süreli oyun kesintisizdir; özet kesiti gibi zaman atlatma. 3–6 takım varsayılanı seri aksiyon/puan; eleme isteğe bağlı ve süre dolunca eksik turnuva dürüstçe etiketlenir. Node API'sinde `seconds` verilmeyen eleme için eski güvenlik sınırı sürer.
- Küçük sahada `SekmeCelebration.plan` ve takım rutini kullanılır; takım arkadaşları golcüye yaklaşır. Çok takımlı oyunda kısa gol molası. Sonucu son ana kadar yakın tutmak için skor/şut/kurtarış uydurma. Aynı tohum aynı maçı verir; yeni hazırlama yeni tohum verir, skor tekrarı mümkündür.
- Ortak kadro JSON'unda 180 kulüp + 85 millî takım vardır; millî kayıtlar `national:true` ve `catalogId` taşır. Yeni listeler millî takımları yanlışlıkla kulüp filtresiyle dışlamasın. `national-kit-profiles.js`, katalogdan önce yüklenir ve Node factory bağımlılığıdır. 2.224 oyuncu sağlayıcı kadrosudur; ilk 11 resmî değildir. Millî forma görselleri renk/desen tasarımıdır, lisanslı sezon replikası iddia etme.
- `tools/build-national-coverage.cjs <raw-json-directory>` kaynağı koruyarak üretir; ESPN ham kadroları yerel JSON dosyalarından okur. Kaynak URL/tarih her takımda kayıtlı. Arşiv oyuncularını/yıllarını silme veya güncel kadroyu tarihî maç olarak etiketleme.
- Taraftar duvarları için güvenlik koridorlarını koru, kişi sayıları eşit kalsın. `japon-pitch-marking` materyal derinlik sırası biçme şeritlerinin üzerinde kalmalı; kesik boya hatasını geri getirme.


## 12. Arena mücadeleleri ve kaleci oyunu (V163)
- `japon-duels.js` engine'den önce yüklenir; Yuka tahmin uyarlamasının MIT notice kaydını koru. Çalım/savunma pozu yalnız görsel değildir, hareket hedefi ve gerçek temasla birlikte çalışır. Başarıyı/golü zorla yazma.
- Küçük sahada HUD yalnız isim ve gol skorudur; atılan/yenilen alt satırını geri ekleme. Büyük süre ve skor güvenli bandın içindedir.
- `frame.owner` GK de olabilir, yalnız `frame.holding.actorIndex` ile eşleştiğinde. Geri pas elle tutulmaz. Keeper kontrol/dağıtım ve restart kayıtları video/live zaman dönüşümünde korunur.
- Ceza alanı faulü yalnız iki takımda penaltı, dışı FK; çok taraflı seri aksiyon avantajla sürer. Son saniye penaltısı için kayıtlı `added_time` ve `addedTime` istisnası vardır; sabit süre testinde bunu yok sayma. Sonuç ekranı yine 5 sn.
- Duvar/direk/kaleci sekmesi ve tavan yansıması tüm 2–6 taraf varyantlarında. Gerçek gol ağzı hariç top dışarıda kalamaz; sahipli top da sınıra tabidir. Sonuç üretmek için topu ışınlama.


## 13. Arena yayın ve final tercihi (V164)
- Kullanıcının yeni isteği: açılış1,6sn bütün isimler, sonra yalnız top sahibi/kurtaran kaleci; finalde oyuncu etiketi yok. `japon-broadcast.js` bu politikayı paylaşır. Ön izleme2D katmanı1080p, 3D540p; export1080p60. Metni fillText maxWidth ile yatay sıkıştırma, ölçüp kısalt.
- Yeni varsayılan `side-full` bütün sahayı yandan gösterir; kullanıcı bunu açıkça istedi. Önceki aksiyon/touchline/wide seçenekleri korunur. Aksiyon intro noktaları yumuşak izleme yolunda kalır, final yakın kesmedir. Geçmiş yakın kamera tercihleri yeni yan seçeneği kaldırma gerekçesi değildir.
- `japon-net.js` ortak OpenFootball.containNet ve world-upgrade.netResponse kullanır; normal/penaltı/FK fiziğinin kopyasını yazma. Gol molasında ball-aero durmaz. Yerel eğimli file boyutu/temas/dalga ve geri sarma testini koru.
- Kazananlar kendi taraftar sektörüne fiziksel koşu ile gider. Sonuç süresi artık `resultDuration=12`; eski5sn varsayımına geri çevirme. Beraberlik/eksik elemede galip uydurma. Kaleci de final grubuna katılır, ortak waveCrowd kullanılır.
- Takım başına tek baskıcı; sahipli çok takım oyununda yalnız en yakın iki rakip aktif baskıda, diğerleri alan tutar. Saha rolleri serbest oyuncu seçimini sınırlamaz; menüde başlangıç görevleri anlaşılır yazılır.


## 14. Dar alan futbolu ve kısa sonuç (V165)
- Kullanıcının yeni kararı D-026: iki takımda dört dik köşe; varsayılan yeniden yakın broadcast, ilk karede de uzak genel açı yok. Açılışta tüm kadro güvenli skor bandına sığar, görünen oyuncular baş etiketi alabilir. Önceki yan/taktik seçenekler korunur.
- Aksiyon takip yolu gerçek `drop` kesitlerini ayrı tutar. Santraya bilinçli kamera kesmesini oyun içi sıçramayla karıştırma; aynı `cameraInfo.key` içinde süreklilik denetlenir. Topun gerçek resetini sahanın içinden uçarak enterpole etme.
- Yeni `japon-tactics.js` engine'den önce yüklenir. GK gelecekteki sonucu okuyamaz: gecikmeli gözlem + ortak top/duvar projeksiyonu + gerçek erişim. Oyuncu hız/yön/ayak hazırlığı ve sahip kaybı temizliği korunur.
- `continuousGround` arena ball state'inde opt-in'dir; ball-aero'nun diğer modlarının davranışını sessizce değiştirme. `receiveContact` varsa gerçek alım zamanı, yoksa eski ortak animasyon zamanlaması.
- Sonuç artık 4,5 sn; uzun taraftar turunu geri ekleme. Küçük saha MAÇ SONU/kazanan veya beraberlik/skor/golcüler; çok taraflıda kazanan takım/oyuncu grubu. Kısa kutlama fiziksel mevcut pozisyonda, ışınlanma yok. Eksik eleme veya beraberlikte galip uydurma.
- Küçük sahada 3,2 sn gol molası; yeni fiziksel kararlar eski tohumdaki skor/olay sayısını korumak zorunda değildir. Tohumla sonuç zorlama, gol veya kurtarış sayısı şartına göre beceri bastırma. Keeper catch de fiziksel kurtarıştır; testte yalnız parry sayımına dönme.


## 15. Dengeli yayın ve ilişkili hareket (V166)
- D-027, V165'in aşırı yakın aksiyonunu günceller: varsayılan kamera taşıyıcıyla birlikte pas seçeneklerini ve savunma örtüsünü gösteren orta mesafedir; ilk kare yakın plan değildir. En geniş sınır tam saha kadrajıdır. `side-full` orta çizgide sabit basın tribünüdür, maç içinde konumu/zoom'u oyuncu veya topa göre değişmez. Finaldeki kısa yakın kutlama kesmesi kalır.
- Menüde her rol kendi kartındadır: “Nereden seçilecek?” kadro/kaynak seçer, “Kim oynayacak?” o kadrodan kişiyi seçer. Takım kimliği, kadro ve forma ayrı adımlardır. Havuzları veya serbest saha seçimini kaldırma; yalnız kaleci filtresi sürer.
- GK bakışı ve hareket heading'i aynı adımda iki kez dönmez. Gerçek `keeperSaveAt` ve `keeperContactPoint` ortak animasyona geçer; parry sonrası el, uzaklaşan topu izleyip gövdeyi sürüklemez. `arenaKeeper` ortak lokomosyon/ready-stance bayrağıdır; normal modların varsayılanı aynı.
- File: paylaşılan OpenFootball.containNet içinde opt-in `netElastic` yay/sönüm tepkisi; arena yerel koordinata dönüştürür. Dünya netResponse dalgası korunur; gerçek topun baskısı render edilen cebi ek olarak yükler. Kalede topu sabitleme, animasyonu fizik yerine sonuç üretmekte kullanma. Diğer modlar bayrağı açmadıkça eski fizik yolundadır.
- Gerçek drop anında snapshot sonrası o adımı bir daha entegre etme; aksi hâlde kayıtta GK dönüşü hız sınırını aşar. Pas sırasında her iki tarafın hücum/savunma şekli korunur. Önleyici kaçınma + küçük fiziksel çakışma düzeltmesi, normal maç template'inden kalan askPass/organize/ceremony pozlarını temizleme korunur.


## 16. 5v5 / çeşitli hücum / madalyalar / net stüdyolar (V167)
- D-028 günceldir: iki takımda5oyuncu (`keeper, defender, defender2, midfielder, attacker`), aynı28×18m saha. `defender2` ikinci serbest seçilebilir kimliktir; aktör slotları0–4/5–9. 3–6takımda3oyuncu aynı. `scene.js` ve UI kimliklerini bu eşlemeyle koru; 4/3 varsayımını geri getirme.
- İlk top her modda ortak drop. Golden sonra yalnız küçük sahada yiyenin forveti, herkes yerine fiziksel dönünce arkadaşına pasla santra yapar. `kickoff_setup` kamera kesmesidir; gol sonrası santrayı tekrar ortak kapışmaya döndürme. Japon Kale’de her gol sonrası drop devam eder. Seçilen süreyi veya skoru bu kurala uydurmak için uzatma/uydurma; yalnız geç penaltı süre istisnası sürer.
- Hücum/savunma ayrı bağlantılı hatlardır; pres seçimi rol+mesafe/histerezisle, diğerleri koşucu/alan örtüsüyle. İlk vuruş ve kafa, gerçekten erişilebilen serbest topa temasla oluşur. `Tactics.keeperContact` gerçek süpürülmüş temas/alan/geri pas yasasını paylaşır. Alan dışı el/tutuş/parry yok; alçak ayak kontrolü mümkündür. Şut türleri gol sonucu değildir; skor fiziksel kalır.
- Kazananlar kendi taraftar sektörüne koşup döner/kutlar. `celebrationDuration`4,5–9sn; Japon Kale’de ardından1,8sn `podiumAt`/`frame.podium` sıralaması. İlk3gerçek derece altın/gümüş/bronz;4–6da listelenir. Ortak dereceye ortak madalya, eksik elemede şampiyon/madalya uydurma. Küçük saha gerçek maç sonucu/golcülerini korur.
- Basın (`side-full`) alçak orta stadyum açısı. Arayüzde bu kamerayı seçmek, kullanıcı video biçimini elle seçmediyse yatayı açar; dikeyReels korunur. Kamera/project/inSafe boyut bilgisi taşır; tracking cache oranı da anahtarlar. Dikey kritik alan eski64–884/295–1220, yatay70–1850/55–795; skor yatayda830–1052. Export kullanılan biçimi aynen alır. Farklı oranı dikey koordinatlara sıkıştırma.
- Arena near1,5/far300 hassasiyeti, zemin420×420 ve yerel arka plan, biçme şeritlerinde depthWrite=false/renderOrder1. Milimetrelik çim/boya/gölge katmanlarını uzak kamerada tekrar çakıştırma. Renk/forma varlıkları değiştirilmedi.
- D-029 FK: keeperTravel ivmeli ve hız sınırlı; fiziksel reach ve görünen dalış aynı modeli kullanır. Yerçekimi9,81, en çok0,38m ek itiş; `keeperGrounded` opt-in zemin düzeltmesi. Gerçek temas zamanı/noktası, uçan topu kovalayan IK yok. Dış ayak gerçekten `outside-foot`, alçak falso gerçek spin/nişan profili; eski mod varsayılanları değişmez.
- D-030: penaltı/FK2Dcanvas1080×1920; WebGLönizleme adaptif kalır. İsim/arma/skor büyütülür, fillText(maxWidth) ile harf sıkıştırılmaz. Video yolu aynı; telefon bellek/kalite korumalarını kaldırma.


## 17. Arena mekânı ve akıcı oyun (V168)
- D-031: `japon-venue.js` yalnız görseldir; fizik/sonuç eklemeyin. Üst tribün ve direkler `cull(camera)` ile kamera önünden çekilir — bu gizlemeyi kaldırıp aksiyonu kapatmayın. LED pano dokusu takım rengi + `SekmeBrand`; lig/sponsor logosu uydurmayın.
- Top sürme dokunuşu `carryX/carryZ` (yönelinen yön) ve gerçek hız bileşeniyle verilir; `p.heading`'e göre itmeye geri dönmeyin (dönüşlerde top kaçıyordu). Çalım `Duels.verdict` yalnız hareketi etkiler; sahiplik/gol yine fiziksel.
- `Duels.MOVES` 7 hareket, penaltıda 11 `shotStyle`, FK'de 9 teknik: `tests/arena-duels.cjs`, `tests/presentation.cjs` bu sayıları denetler; yeni hareket eklerken testi ve `athlete-motion.js` pozunu birlikte güncelleyin.
- Kaleci 1v1 çıkışı en çok 3,55 m (test sınırı 3,7 m). Penaltıda `keeperTiming` erken/bekle/normal; kurtarışlarda dalış temas anına senkron kalır.


## 18. Basın kameraları ve parlaklık (V169)
- D-032: `side-full` sabit kalır (top/oyuncuya göre hareket ve zoom yok); yakın görüntü isteyen `press-follow` seçer. İkisini birleştirmeyin, birini kaldırmayın. Yeni kamera modu eklerseniz `tests/japon-camera.cjs` mod listesine ekleyin.
- Parlaklık kalite değildir: bloom 0,10/eşik 0,92, meşale/duman/konfeti ve çizgi/LED tonları bilinçli olarak düşüktür. Yeni efektlerde `toneMapped:false` beyaz yüzey ve additive hale kullanmaktan kaçının.
- Arena ön izlemesi masaüstünde 0,75×, telefonda 0,5× çözünürlüktür; telefon değerini yükseltmeyin (bellek).

## 19. V175 — maç saati ve karar sistemi devralma kuralları
- Kullanıcının yeni isteği T-303: gol sonrası bekleme/yerleşme maç süresinden düşmez. Duvar/fizik/video zamanı ile `gameClock` ayrıdır. Küçük saha gerçek santra pasında, Japon Kale merkezden top oyuna girince saat açılır; yalnız sabit gol molası sonunda açma. Erken eleme bitişinde kalan süreyi sıfırlama.
- Golcü kartı gerçek olay aktörü, mevcut doğrulanmış fotoğraf ve gerçek takım logosunu kullanır. Serbest oyuncu grubunda forma seçimi takım kimliği değildir. Kart ortak önizleme/export HUD güvenli bandındadır.
- `emergent-football.js` bağımsız RNG akışlarını korur. Mental karakterlerin bilinmeyen değerleri etiketli sentetik öncüllerdir, gerçek ölçüm sayılmaz. Pas değerlendirmesi ve fiziksel vuruş aynı nişan/hız yardımcılarını kullanır.
- `free-football.js` 15–180snkompakt11v11; UI30/60/90. Tam90dakika veya kalibre edilmiş xT/VAEP iddiasında bulunma. Mevcut analiz kipini koru. İsteğe bağlı özet kesilirse görüntü, olay, ses/anlatım veSRT zamanlarını birlikte dönüştür.
- Devam: `docs/ai/EMERGENT-FOOTBALL-PLAN.md`, `research/VALIDATION-V175.md`; kısmi aşamalar tamamlandı sayılmaz.

- Kullanıcının 2026-11-13 son netleştirmesi: **ana hedef Hostinger web sürümü**. Bütün futbol geliştirmeleri web reposunda çalışmalı; Windows yalnız ek uyumluluk. Kullanıcıya web teslimini ve canlı dağıtım durumunu açıkça anlat. Web güncellemesi bir EXE paketi değildir.

## 20. V176 — kullanıcının web düzeltmeleri
- T-310/T-311: ana ürün Hostinger web. Gereksiz aksiyon/eleme/tur ve yardım metinlerini yayın/UI'ye geri eklemeyin. İşlevsel seçimler, gerçek hata/işlem durumu, skor/süre, kimlik ve sonuç kalır.
- Geri pas ve yavaş top ayakla kontrol/dağıtımdır; acil kurtarış değildir. Kaleci kendi oyuncusu sürerken rutin alıma çıkmaz. Taşıyıcıya takım arkadaşları alan bırakır. Ulaşılamayan durmuş topta sahiplik düşer; son alım/dokunuşun en yenisi kullanılır. Seed1015/5taraf/90sn/limit5 takılması testte tutulur.
- 60/75/90sn çok kaleli eleme normal süre sonrası tek golle eleme uzatmasıdır. Tur sayaçları sıfırlanır, frame.overtime taşınır ve HUD barajı1 olur. Gerçek gol olmadan eleme/şampiyon yazılmaz. 30/45sn kısa eleme ve puan/5v5 süre/beraberlik korunur. Video, gerçek uzatma ve gol beklemeleri kadar uzar. Bütçe aşımında kontrollü hata; sessiz yarım sonuç veya sahte gol yok.
- Penaltı golünün varış vektörünü ilk fırlatma vektörüyle değiştirmeyin. Ortak file yay/sönüm ve topun görsel panel yükü birlikte çalışır. Kale çizgisi polygonOffset/renderOrder4/depthWritefalse/noBatch ile çimden ayrılır.
- Açık kale fırsatını uygun seçenek filtresiyle bitirin; rastlantı hareketin teknik sonucunda sürer. Analiz gol defterini değiştirmeyin; çelişen başlangıçları yeniden örnekleyin. `openFinish` normal fiziksel bitiriciye devirdir, yeni gol ekleme değildir.
- Renk paleti League-Soccer'dan taşınmadı. Arena çim tinti yeşil kalmalı; world.pitchDetail.grass ile geç yüklenen PBR haritasını aynı sanıp nötr beyaz tint uygulamayın. Taraftar/forma paletini ve global pozlamayı sebepsiz değiştirmeyin.
- Kanıt/komutlar: `docs/ai/research/FIXES-V176.md`, `tests/football-fixes.cjs`, `tools/validate-elimination.cjs`. Geniş sekiz aşama planı hâlâ kısmi; mikro düzeltmeler onu tamamlandı yapmaz.
