> **Kullanıcının son netleştirmesi (2026-11-14): Ana hedef Hostinger web sürümüdür. Bütün kalan futbol geliştirmeleri kaynak webde yapılacak; Windows ek uyumluluk kontrolüdür. Canlı son kontrolde V176/filesMatch=true; V177 kamera ve V178 aksiyon güncellemeleri kaynakta; T-312 futbol düzeltmeleri ayrı WIP dalında, bütünü yayınlanmaz.**

# TASKS — görev panosu

Durumlar: `todo` · `in-progress` · `partial` · `blocked` · `done`
Sahip: `claude` · `codex` · `—` (boş, ilk alan alır). Bir görevi alırken sahibini ve
`files:` listesini yaz; bitirince `done` + sürüm. Kullanıcının yeni istekleri en üste eklenir.

## Aktif hedef: V178 aksiyon; T-312 futbol düzeltmelerine devam

| ID | Görev | Durum | Sahip | Notlar / files |
|---|---|---|---|---|
| T-315 | Deneysel Electron kısa MP4 testinde native indirme olayı gelmiyor; gerçek Hostinger tarayıcısında bağlantı/indirmeyi doğrula | partial | codex | İki4sn1080p60H.264dosya oluştu/oynatılıyor ve240kare dekodPASS; download event iki denemede240sTimeout. Dosyalar testprofilinin geçiciFSalanından korundu. ÜretimChromebugı olarak doğrulanmış değildir; research/v178-arena-action/clip-validation.json. |
| T-314 | Japon Kale/5v5: doğal yüksek aksiyon, yakın kaleye hücum, iyi destek/pas/şut, savunma/kurtarış/direk çeşitliliği;11v11analizi korunur | done (V178; temel ayar) | codex | files: assets/japon-engine.js, japon-tactics.js, football-intelligence.js, tests/arena-action.cjs.32eşleştirilmiş60smaç, farklı uzak/orta/yakın şutlar, daha hızlı destek/kararlar.0–0kota/seedfiltresi yok;11v11analizi değişmedi. Kanıt research/ARENA-ACTION-V178.md. |
| T-313 | Touchline kamera: Japon Kale ve5v5 kaleleri HUD üstünde, skor/kimlik Reels güvenli bandında | done (V177) | codex | files: assets/japon-camera.js, tests/touchline-safe.cjs, tests/browser-touchline.cjs. Bütün canlı kale çerçeveleri, aynı eğik izleme açısı, iki oran; yayın kaydı research/TOUCHLINE-V177.md. |
| T-312 | Penaltı gol/sonuç ve el/ayak;11v11 ilerleme;arena güvenli kaleci dağıtımı/zemin/alım;VAR dışında numaralı değişiklik;60/75/90s içine limit korunarak biten eleme | partial (V179 hedefi) | codex | Penaltı çizgi/sonuç alt işi V178’de doğrulandı; diğer kaynak taslağı `agent/codex/web-football-v177` @f3aa2a4. **Dalın bütünü main'e birleşmedi.**64fiziksel adayda5–6takım/60s/limit2 tamamlanamadı; bütünleşme testleri FAIL. D-042; sonraki ajan bu dalı devir notundan devam ettirsin, WIP'i kararlı sanmasın. |
| T-311 | Japon Kale/5v5 ve diğer stüdyolarda gereksiz aksiyon/eleme ve yardım açıklamalarını kaldır | done (V176) | codex | Yayındaki mod/tur başlığı, ölçü satırı, uzun yardım/subtitle ve P/FK notları gizlendi; işlevsel seçenekler, skor/süre/kimlik/hata ve sonuç kaldı. |
| T-310 | Web: penaltı çizgisi/file/goal-tail; normal açık kale kararı; arena kaleci geri pası, zemin/sekme/çeviklik;60/90sn elemede gerçek kazanan; renk doğrulama; gereksiz mod bilgilerini kaldır | done (V176) | codex | files: assets/{scene,world-upgrade,penalty-engine,football-intelligence,possession-engine,ball-aero,japon-*}.js, giriş HTML/UI, tests/, sürüm/devir; Arjantin–Uruguay videosu/seed sağlanmadı, tariften yeniden üretilecek. |
| T-304 | Karar çeşitliliğini koruyarak pas alımı, şut/mesafe/alan dağılımı ve hazırlama maliyetini kalibre et | todo | — | V175 karşılaştırmasında daha çok pas fakat daha düşük 3sn alım proxy'si; oyun saati farkını normalize et, gerçek olay/varış ölçümü ve uygun açık veriyle karşılaştır; gol/hata kotası ekleme. |
| T-305 | Kompakt serbest11v11 çekirdeğini tam90dakika, düşük bellek ve bölüm kayıt/arama desteğine genişlet | todo | — | V175 API15–180sn/UI30/60/90sn; bugünkü kısa örnekleri tam maç sayma. |
| T-306 | Mevcut5v5saha ve stüdyo düellolarını koruyarak alan2v2/3v3seçimi ve farklı kısa destek/rol kuralları | todo | — | V175 bütün modlara ortak çekirdek taktı; yeni küçük saha sayısı seçicisi henüz yok. |
| T-307 | Geniş duran top takım organizasyonu ve frikikte gerçek pas seçeneği | todo | — | V175 doğal FK fiziksel vuruş üretir; paslaşmalı organizasyon ve bütün özel set-piece görevleri tamamlanmadı. |
| T-308 | BodyPose örneğini tamrig/ayak temasına doğrulanmış retarget ve başarısız hareket kliplerine genişlet | todo | — | V175 yalnız12.32sn çevrimdışı diz açısı prototipi; hazır animasyon değil; mevcut iskelet/klipler korunur. |
| T-309 | Uzun hareketli eski/yeni görsel örnekler, yeni60sn+bekleme tam export ve fiziksel cihaz/GPU hız ölçümü | todo | — | V175 gerçek3D kareler/iki yönde kısa MP4; V174 tam34.5sn sesli tarihsel kanıt. W7 ile ortak, yazılımGPU donanım testi sayılmaz. |
| T-303 | Japon Kale ve küçük sahada golden yeniden başlama vuruşuna kadar saat dursun; golcü adı, mevcut yüz fotoğrafı ve gerçek takım logosu kartı | done (V175) | codex | Kullanıcının devam sırasında eklediği öncelik; files: assets/japon-engine.js, japon-broadcast.js, japon-ui.js, tests/arena-clock.cjs; video zamanı ve maç saati ayrı tutulur. |
| T-294 | Yeni sekiz aşamalı taktik zekâ / doğal karar / hareket geliştirmesi ve mevcut sistem envanteri | done (envanter) | codex | files: docs/ai/EMERGENT-FOOTBALL-PLAN.md, research/, assets/*intelligence*, *engine*, *tactics*, tests/, tools/; temel main46b9720 (V174), mevcut web ve Windows sistemleri korunur; her aşama kod/test/kanıt ile kaydedilecek. |
| T-295 | Yeni futbol zekâsı aşama 2: taktik | partial (V175) | codex | files: assets/, tests/, tools/, docs/ai/; EMERGENT-FOOTBALL-PLAN.md; sonuç kotası ve sahte veri yok |
| T-296 | Yeni futbol zekâsı aşama 3: bireysel karar | done (çekirdek V175) | codex | files: assets/, tests/, tools/, docs/ai/; EMERGENT-FOOTBALL-PLAN.md; sonuç kotası ve sahte veri yok |
| T-297 | Yeni futbol zekâsı aşama 4: hareket ve temas | partial (V175) | codex | files: assets/, tests/, tools/, docs/ai/; EMERGENT-FOOTBALL-PLAN.md; sonuç kotası ve sahte veri yok |
| T-298 | Yeni futbol zekâsı aşama 5: nedensel olaylar | done (çekirdek V175) | codex | files: assets/, tests/, tools/, docs/ai/; EMERGENT-FOOTBALL-PLAN.md; sonuç kotası ve sahte veri yok |
| T-299 | Yeni futbol zekâsı aşama 6: mod adaptörleri | partial (V175) | codex | files: assets/, tests/, tools/, docs/ai/; EMERGENT-FOOTBALL-PLAN.md; sonuç kotası ve sahte veri yok |
| T-300 | Yeni futbol zekâsı aşama 7: serbest/analize bağlı ve özet | partial (V175) | codex | files: assets/, tests/, tools/, docs/ai/; EMERGENT-FOOTBALL-PLAN.md; sonuç kotası ve sahte veri yok |
| T-301 | Yeni futbol zekâsı aşama 8: karşılaştırmalı doğrulama | partial (V175) | codex | files: assets/, tests/, tools/, docs/ai/; EMERGENT-FOOTBALL-PLAN.md; sonuç kotası ve sahte veri yok |
| T-302 | Yeni futbol zekâsı aşama Windows: kaynak senkronizasyonu ve paket | done (uyumluluk V175) | codex | files: assets/, tests/, tools/, docs/ai/; EMERGENT-FOOTBALL-PLAN.md; sonuç kotası ve sahte veri yok |
| T-292 | T-290 son test: tam süreli sesli1080p export, oynatma/arama/indirme | done (V174) | codex | files: assets/video-core.js, graphics-settings.js, AACvendor, tests/browser-full-match.cjs, AI belgeleri; tam34,5sn5v5/2070kare1080p60+AAC, UIiptal/tekrar hazırlama,69.507.448baytindirme, dörtarama, sesaçık1xhızended, ffprobe/ffmpegPASS. Electron indirme harnessi düzeltildi; aynı baytları taşıyan dosyadan teslim/oynatma devam ettirildi. Kanıt research/FULL-VIDEO-TEST-V174.md. |
| T-293 | AAC kodlanamadığında istenen sesin kaybolup sessiz devam etmesini düzelt | done (V174) | codex | files: assets/video-core.js, assets/vendor/mediabunny-aac/, tests/audio-export.cjs, browser-aac.cjs; native AAC yoksa yerel yazılım AAC; eksik/yanlış/kısa ses izi reddedilir. Gerçek1sn1080p60+AAC48kHz/nonzero ses PASS; native Safari recorder yolu korunur. |
| T-291 | V173 sonrası5v5/3taraf risk/yakınlık artışını daha geniş örnek ve tekil hazırlama süresiyle analiz et | todo | — | files: assets/football-intelligence.js, japon-tactics.js, japon-engine.js, collective-play.js, tools/measure-intelligence.cjs, tests/; sonuç/kurtarış kotası ekleme |
| T-286 | Aşama1: gerçek oyuncu–top alım/vuruş zamanı, kaleci el–top ve doğal temas animasyonu | done (V173) | codex | files: assets/football-animation.js, athlete-motion.js, scene.js, football-clips.js, japon-ui.js, penalty-engine.js, freekick-engine.js, tests/, sürüm/AI belgeleri; plan FOOTBALL-ROADMAP.md |
| T-287 | Aşama2: verkaç/üçüncü oyuncu/bindirme ve top kaybında takım savunması | done (V173) | codex | files: assets/football-intelligence.js, collective-play.js, possession-engine.js, japon-{tactics,engine}.js, tests/; T-286'dan sonra |
| T-288 | Aşama3: kalabalık Japon Kale'de alan/markaj dağılımı ve pas alımı | done (V173) | codex | files: assets/japon-{tactics,engine}.js, football-intelligence.js, tools/measure-intelligence.cjs, tests/; V172 karşılaştırması |
| T-289 | Aşama4: tohumlu takım karakteri ve hücum çeşitliliği | done (V173) | codex | files: assets/football-intelligence.js, football-ai.js, possession-engine.js, japon-{tactics,engine}.js, tests/; doğrulanmamış gerçek taktik iddiası yok |
| T-290 | Aşama5: uzun oynatma/arama/iptal ve1080pMP4 uçtan uca doğrulama | partial (V174) | codex | Yerel tam34,5sn5v5sesli1080p60/2070kare, gerçekindirme/arama/normalhızended ve37/37regresyon PASS (T-292/T-293done). Kalan yalnız fiziksel Windows/iPhone/Android doğrulaması; erişilebilir cihaz yok. Önceki76,9snpenaltı denemesi tamamlandı sayılmaz. Kanıt research/v174-full-video-validation.json. |
| T-285 | Japon Kale elemede kalan takım sayısının standart sahasına geçiş; fizik/zemin/kaleler/tribün/kamera ve geri sarma eşleşsin | done (V172) | codex | files: assets/japon-{engine,layout,arena,camera,crowd,ui}.js, tests/arena-elimination.cjs, tests/japon-kale.cjs, tests/japon-camera.cjs, sürüm/AI belgeleri |
| T-284 | Mevcut web görünümünü koruyarak League-Soccer yaklaşımından ortak oyuncu/oyun zekâsı:11v11/sezon/konsept, penaltı, FK, küçük saha ve3–6taraf Japon Kale | done (V172) | codex | files: assets/football-intelligence.js, football-ai.js, possession-engine.js, japon-tactics.js, japon-engine.js, penalty-engine.js, freekick-engine.js, tests/, giriş HTML/sürüm ve AI belgeleri; tek fizik/gerçek sonuç/determinizm korunur; detay research/SHARED-INTELLIGENCE-V172.md |
| T-283 | 11v11 açık oyun temposu (efora göre koşu, top sürme hızı), oyun değiştirme ve ara pası; penaltı kalecisinde yerçekimi sınırlı sıçrama | partial (V171) | claude | Kalan: penaltı yüksek kurtarışta kaleci hâlâ ~1 m havada (poz/klip katmanı `scene.js` tipOver + `football-clips.js`), FK oynanışı değişmedi. files: assets/possession-engine.js, assets/football-ai.js, assets/penalty-engine.js |
| T-282 | Penaltı/FK skor şeridinde gol işareti net yeşil; kale arkasındaki parlak mavi “ufuk” şeridi (V168 gökyüzü tonu) geri alındı | done (V170) | claude | files: assets/penalty-ui.js, assets/freekick-ui.js, assets/stadium-customization.js |
| T-281 | Basın kamerası (sabit açının sıkılaştırılması + yeni “yakın takip”), parlama azaltma (bloom, meşale, duman, konfeti, çizgi/LED), masaüstü arena ön izleme çözünürlüğü, 5v5 sabırlı savunma/top çevirme/savunmacının yanından geçme, 11v11 duran top çeşitliliği | done (V169) | claude | files: assets/japon-camera.js, japon-ui.js, japon-arena.js, japon-venue.js, japon-engine.js, japon-tactics.js, broadcast-remaster.js, scene.js, match.js, japon-kale.html, tests/japon-camera.cjs |
| T-280 | Tüm modlarda görsel/oynanış sıçraması: arena gece stadyumu (gökyüzü, üst tribün, LED pano, projektör), doğal çim; arena top sürme/pas/çalım düellosu/köşeye şut/kaleci tutuşu; penaltıda 11 vuruş stili + kaleci zamanlaması; FK'de aşırtma ve barajın yanından; 1v1 aşırtma; UNL bülten doğrulaması | done (V168) | claude | files: assets/japon-venue.js (yeni), assets/japon-arena.js, japon-engine.js, japon-tactics.js, japon-duels.js, japon-ui.js, athlete-motion.js, penalty-engine.js, penalty-ui.js, freekick-engine.js, football-ai.js, stadium-customization.js, server/season-data.php, tests/presentation.cjs, tests/arena-duels.cjs |
| T-279 | Penaltı/FK stüdyosunda gerçek1080p isim-arma-skor ve sıkıştırılmayan metin | done (V167) | codex | files: assets/penalty-ui.js, assets/freekick-ui.js, ortak AI belgeleri |
| T-278 | FK kalecisinde yerçekimi/sınırlı itiş, gerçek temas hedefi ve iç/dış/üst ayak-alçak falso çeşitliliği | done (V167) | codex | files: assets/freekick-engine.js, assets/freekick-ui.js, assets/athlete-motion.js, tests/freekick.cjs, ortak AI belgeleri |
| T-277 | Küçük saha 5v5/2-1-1, yiyenin paslı santrası, bağlı alan/adam savunması, hücum/şut/kaleci çeşitliliği ve taraftar finali | done (V167) | codex | files: assets/japon-*.js, assets/scene.js, assets/commentary.js, japon-kale.html, tests/*, ortak AI belgeleri |
| T-276 | Dengeli orta mesafe aksiyon / sabit basın tribünü kamerası, anlaşılır kadro seçimi, ilişkili koşu-pas-savunma ve sakin GK, esnek top-file teması | done (V166) | codex | files: assets/japon-*.js, assets/athlete-motion.js, assets/football-animation.js, assets/open-football-adapter.js, japon-kale.html, tests/*, ortak AI belgeleri |
| T-275 | Küçük saha futbol kararları/akıcı hareket/sekme öngörülü GK, gerçek dikdörtgen, yakın aksiyon ve belirgin file, kısa kazanan/sonuç finali | done (V165) | codex | files: assets/japon-*.js, assets/ball-aero.js, assets/football-animation.js, assets/athlete-motion.js, assets/commentary.js, tests/*, japon-kale.html, ortak AI belgeleri |
| T-274 | HD skor paneli, seçici oyuncu etiketleri, düzenli hücum/savunma, ortak top/file tepkisi, tam yan yayın ve taraftarla final, anlaşılır rol menüsü | done (V164) | codex | files: assets/japon-*.js, assets/commentary.js, tests/*, japon-kale.html, ortak AI belgeleri |
| T-273 | Arena net süre/skor paneli, çalım ve karşı savunma, küçük saha ceza alanı/faul/penaltı, kaleci tutuş/dağıtım ve sürekli sekmeler | done (V163) | codex | files: assets/japon-*.js, assets/athlete-motion.js, assets/football-animation.js, assets/commentary.js, assets/vendor/yuka/arena-steering-NOTICE.txt, tests/*, *.html, ortak AI belgeleri |
| T-272 | Arena tribün güvenlik/ayırıcıları, kesintisiz çizgiler, ortak sevinçler, 2–6 takım süreli seri aksiyon (30/45/60/75/90), tüm modlarda millî kadro/forma kapsamı, anlatım/video doğrulama | done (V162) | codex | files: assets/japon-*.js, assets/national-kit-profiles.js, assets/catalog.js, ortak kadro/düello JSONları, assets/club-rosters.js, assets/*ui.js, *.html, tools/build-national-coverage.cjs, tests/*, ortak AI belgeleri |
| T-271 | Küçük Saha 4v4 / Japon Kale 3–6 ayrımı, serbest saha oyuncuları, normal maç kalitesinde küçük tribünler ve gol tepkileri, eğik dinamik yayın kamerası, saha çizgileri/oynanış | done (V161) | codex | files: assets/japon-*.js, assets/scene.js, assets/commentary.js, japon-kale.html, tests/japon-*.cjs |
| T-270 | Japon Kale kale/file görünümünü normal futbol filesiyle uyumlu yap | done (V160) | codex | files: assets/japon-arena.js, tests/japon-net.cjs, sürüm/devir belgeleri |
| T-269 | Japon Kale yayın kadrajı/oyuncu isimleri, 2–6 kaleye özel saha, kaleci-defans-hücum üçlüleri ve Reels/Shorts güvenli aksiyon | done (V159) | codex | files: assets/japon-*.js, assets/scene.js, japon-kale.html, tests/japon-*.cjs |
| T-267 | Japon Kale: 2–6 taraf, eleme/puan, ortak 3D/video ve serbest oyuncu/forma | done (V158) | codex | files: assets/japon-*.js, japon-kale.html, assets/scene.js, tests/japon-kale.cjs |
| T-268 | Tüm modlarda zaman damgalı TR/EN kopyalanabilir anlatım | done (V158) | codex | files: assets/commentary*.js, assets/*ui.js, assets/app.js, assets/concept/*, *.html, tests/commentary.cjs |
| T-261 | Sıralı görsel geliştirme (zemin → kale → top → oyuncular → kaleci → stadyum → taraftar), parlaklık/kontrastla oynamadan | partial | claude | Yapılanlar: V149 şeritler, V147/V152/V153 file, V153 top izi + çatı projektörleri, V154 çim sıçraması, V155 kaleci sevinci, V156 direk titremesi/sekme tozu/hava durumu, V157 karda nefes. Açık: oyuncu animasyonları, taraftar katmanı (kullanıcıdan hedefli istek). scene.js, world-upgrade.js, stadium-shell.js |
| T-262 | Canlı sunucuda cron kurulumu (hPanel → Cron Jobs, `cron.php` her dakika) | todo | kullanıcı | Komut V141 raporunda; cron olmadan site ziyaretle dolar |
| T-263 | `kadro.php` şifresinin sahibince belirlenmesi | todo | kullanıcı | İlk kullanan şifreyi belirler; belirlendiği doğrulanmadı |
| T-264 | Canlı sunucuda BSD anahtarı tanımlı mı (`durum.php` satırı) | todo | kullanıcı | Doğrulanmadı; yoksa BSD beklenen 11 / sakat-cezalı listesi devreye girmez |
| T-265 | Transfermarkt aday kadrosunun canlı sunucudan çekildiğini doğrulama | todo | — | Yerelde sık istekte HTTP 405; sunucuda 2 sa geri çekilme. server/national-transfermarkt.php |
| T-266 | Gerçek iPhone’da kaleci gözü, 2v2 portreler, V153 file ve V154–V157 efektlerinin görünümü/FPS | todo | kullanıcı | Yalnız SwiftShader/emülasyonda görüldü |
| T-209 | Gerçek cihaz testi: iPhone Safari + Android Chrome’da penaltı/FK/maç MP4 indirme | partial | kullanıcı | Kullanıcı iPhone 13’te FK MP4’ün V146–V147 sonrası %20’yi yeniden başlamadan geçtiğini bildirdi; tam indirme ve Android doğrulanmadı. Ajanlar fiziksel cihaz testi yapamaz |
| T-216 | Kalecinin “ulaşılabilir en iyi hedef” taramasını League-Soccer’dan uyarlamak (maç + stüdyolar) | todo | — | research/LEAGUE-SOCCER.md |
| T-217 | Ofsayt çizgisine rakip hareket öngörüsü (0,1–0,15 sn) | todo | — | collective-play.js |
| T-221 | Taraftarlarda yağmurluk/kapüşon varyasyonu, karda çatıda birikme | todo | — | crowd-*.js, weather.js |
| T-222 | Fileye ip normal haritası; ıslakken file sarkması | todo | — | V153’te file `LineSegments` yerine dokulu bez panellere geçti (`goal-net-cloth`); normal harita ve ıslak sarkma yok. scene.js |
| T-223 | Çim yapraklarına rüzgâr salınımı (GrassSystemThreeJS tekniği, MIT) | todo | — | pitch-detail.js |
| T-230 | Oyuncu gövde modeli: forma/şort kesimi (göğüs-bel oranı), daha atletik bacak ve kramponda taban/çivi ayrıntısı | partial (V115 gövde + kumaş; V116 baldır + modern krampon; V117 V-gövde) | — | fullbody-runtime.js, scene.js — kendi geliştirmemiz (D-019) |
| T-232 | Animasyon: koşu-sprint geçişinde ivme eğimi, yön değişiminde ayak bastırma, top sürerken kısa adım | partial (V116 hıza bağlı gövde eğimi) | — | athlete-motion.js, football-clips.js |
| T-233 | Çim: rüzgâr salınımı, kale önü ve orta sahada aşınmış çim lekeleri, maç ilerledikçe kramponla açılan izler | partial | — | Aşınma lekeleri var (scene.js `pitch-wear`), V149 biçme şeritleri 20×5,25 m, V154 vuruş/sekme çim sıçraması; rüzgâr ve krampon izi yok. pitch-detail.js, scene.js |
| T-234 | Tribün: taraftar animasyon çeşitliliği (kalkma, el çırpma dalgası), atkı sallama, koreografi pankartı | partial | — | V116 kıyafet; atkı, dalga (V121), flaş, meşale, duman, konfeti mevcut; koreografi pankartı yok. crowd-lod.js, stadium-atmosphere.js |
| T-215 | Sevinçlerde gerçek motion-capture (kullanıcı Mixamo’dan indirip verirse) | todo | — | D-005; T-213 ile aynı iş (birleştirilebilir) |
| T-213 | Sevinçler için gerçek motion-capture klipleri (kullanıcı Mixamo’dan indirirse retarget) | todo | — | `celebration-clips.js`, D-005 |

## Tamamlananlar

| ID | Görev | Sürüm | Sahip |
|---|---|---|---|
| T-260 | Penaltı + serbest vuruşta 2v2 oyuncu düellosu | V138 | claude |
| T-224 | Normal maç ve penaltı tribününde koridor/görevli (tüm modlarda otomatik ayrım) | V119 | claude |
| T-231 | Kaleci eldiveni, dolgulu dirsek, hazır duruş varyasyonları | V114–V119 | claude |
| T-240 | Canlı veri koruması: paketlerden `data/private/state.json` çıkarıldı, test depolama izolasyonu | V136 | claude |
| T-241 | Tahmin kilidi uyuşmazlığı güncellemeleri durdurmuyor (kök neden; canlıda 32 maç ile doğrulandı) | V140 | claude |
| T-242 | Cron’suz hızlı dolum (pencere öncelikli kaynaklar), aday kadro filtresi tüm sağlayıcılarda | V141 | claude |
| T-243 | Seremoni bezleri ışıksız/net (V121 geri alındı), düelloda seçilen takım forması | V143 | claude |
| T-244 | Kaleci gözü kamerası (penaltı + FK), isim etiketi; temasta kale içine çekilme | V150, V152 | claude |
| T-245 | Kaleciler vurucu seçilebilir (penaltı + FK) | V151 | claude |
| T-246 | Penaltı skor tablosunda aralık etiketi kaldırıldı; reklam panosu: profil resmi + @next90sim | V148–V149 | claude |
| T-247 | FK takım modunda en iyi 5 vurucu, gol kaleciyi açıkça geçer (≥1.28 uzanma) | V147 | claude |
| T-201 | Penaltı uçuşu ball-aero | V110 | claude |
| T-202 | Maç şutlarında aerodinamik sürükleme | V110 | claude |
| T-203 | (Kullanıcı kararıyla değişti: frikikte yalnız baraj+kaleci+vurucu) — kapatıldı | V110 | claude |
| T-204 | Yatan baraj oyuncusu, kaleci yan adımı, vurucu hazırlığı | V110 | claude |
| T-205 | GameplayFootball sevinç/üzgün klipleri bağlandı (Mixamo hariç) | V110 | claude |
| T-206 | Kontra koşu hatları (atak aileleri zaten 30+) | V110 | claude |
| T-207 | Pres tetikleyicileri | V110 | claude |
| T-208 | League-Soccer incelemesi + kaleci açıortayı | V110 | claude |
| T-210 | football-lab / face-coverage tarayıcı doğrulaması | V110 | claude |
| T-211 | Frikik kalite ayarı | V110 | claude |
| T-214 | Kalecinin barajı yönetme jesti | V110 | claude |
| T-212 | Kumaş normal haritası, şort numarası | V110 | claude |
| T-120 | Sinematik post-process (bloom+SMAA) | V112 | claude |
| T-121 | Yağmur/kar adım tepkisi ve ayak izleri | V112 | claude |
| T-122 | Frikik taraftar ayrımı, görevliler, bayraklar | V112 | claude |
| T-123 | Krampon/eldiven rengi düzeltmesi, diziliş farkındalığı | V112 | claude |
| T-118 | Hava durumu (açık/yağmur/kar) üç modda + MP4 | V111 | claude |
| T-119 | Top/kale/krampon görsel yükseltmesi, grafik kaynak araştırması | V111 | claude |
| T-109 | Sevinç paketi: 100 gol sevinci + 14 takım rutini, tüm modlar | V109 | claude |
| T-110 | Serbest vuruş ayna nokta takvimi + aynı nokta/tur | V109 | claude |
| T-111 | Millî forma düellosunda millî kadro barajı (isim+numara) | V109 | claude |
| T-112 | Serbest vuruş grafiklerini Reels güvenli bandına taşıma, kamera kadrajı | V109 | claude |
| T-113 | Penaltı teknik etiketi + hız, ayak dışı | V109 | claude |
| T-114 | Test paketi: penaltı, sevinç, tahmin (JS+PHP), run-all | V109 | claude |
| T-101 | Repo temizliği: yinelenen sürüm kopyaları, eski HTML’ler, kullanılmayan büyük dosyalar | V108 | claude |
| T-102 | Ortak çalışma altyapısı (AGENTS/CLAUDE/VERSION/docs/ai, release manifest aracı) | V108 | claude |
| T-103 | Ortak aerodinamik top modülü `ball-aero.js` | V108 | claude |
| T-104 | Serbest Vuruş Stüdyosu (takım/düello, kit, kaleci, biçim, nokta, kamera, tekrar, MP4) | V108 | claude |
| T-105 | Stüdyo reklam panolarında lig yerine next90sim markası | V108 | claude |
| T-106 | Penaltı Stüdyosu ayarlarının adımlı ve mod-duyarlı düzeni | V108 | claude |
| T-107 | Forma isim/numara kontrast seçimi | V108 | claude |
| T-108 | Savunma blok derinliği ve step-off | V108 | claude |

## Kısmi / doğrulanmamış (V136–V157)

| ID | Görev | Sürüm | Durum | Not |
|---|---|---|---|---|
| T-250 | iPhone stüdyo çökmesi: tek yüksek sahne + iOS LITE zincir, çökme koruması | V142 | partial | Emülasyonda doğrulandı; gerçek cihaz T-209 |
| T-251 | iPhone MP4 sonrası yenilenme: sahneyi bırak, isteğe göre yeniden kur | V146 | partial | Emülasyonda doğrulandı; kullanıcı %20’ye kadar sorunsuz bildirdi |
| T-252 | Millî 11: BSD beklenen 11 + aday kadro + numaralar | V144 | partial | Sunucuda BSD anahtarı doğrulanmadı (T-264) |
| T-253 | Transfermarkt aday kadro + `kadro.php` elle düzenleme | V145 | partial | Yerelde uçtan uca test edildi; canlı erişim T-265, şifre T-263 |
| T-254 | Wikipedia canlı aday kadro güncelleyici | V137 | partial | Canlıda editoryal liste kullanıldığı görüldü; Wikipedia’nın sunucuda çekildiği doğrulanmadı |

> Not: V119–V135 işleri bu panoya ayrı satır olarak işlenmedi; ayrıntı `CHANGELOG.md` ve `HANDOFF.md`’de.
