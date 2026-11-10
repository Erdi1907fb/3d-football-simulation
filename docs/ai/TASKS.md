# TASKS — görev panosu

Durumlar: `todo` · `in-progress` · `partial` · `blocked` · `done`
Sahip: `claude` · `codex` · `—` (boş, ilk alan alır). Bir görevi alırken sahibini ve
`files:` listesini yaz; bitirince `done` + sürüm. Kullanıcının yeni istekleri en üste eklenir.

## Aktif hedef: V167

| ID | Görev | Durum | Sahip | Notlar / files |
|---|---|---|---|---|
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
