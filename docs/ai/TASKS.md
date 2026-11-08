# TASKS — görev panosu

Durumlar: `todo` · `in-progress` · `partial` · `blocked` · `done`
Sahip: `claude` · `codex` · `—` (boş, ilk alan alır). Bir görevi alırken sahibini ve
`files:` listesini yaz; bitirince `done` + sürüm. Kullanıcının yeni istekleri en üste eklenir.

## Aktif hedef: V115

| ID | Görev | Durum | Sahip | Notlar / files |
|---|---|---|---|---|
| T-209 | Gerçek cihaz testi: iPhone Safari + Android Chrome’da `freekick.html` MP4 indirme | todo | kullanıcı | Ajanlar fiziksel cihaz testi yapamaz |
| T-215 | Sevinçlerde gerçek motion-capture (kullanıcı Mixamo’dan indirip verirse) | todo | — | D-005 |
| T-216 | Kalecinin “ulaşılabilir en iyi hedef” taramasını League-Soccer’dan uyarlamak (maç + stüdyolar) | todo | — | research/LEAGUE-SOCCER.md |
| T-217 | Ofsayt çizgisine rakip hareket öngörüsü (0,1–0,15 sn) | todo | — | collective-play.js |
| T-221 | Taraftarlarda yağmurluk/kapüşon varyasyonu, karda çatıda birikme | todo | — | crowd-*.js, weather.js |
| T-222 | Fileye ip normal haritası; ıslakken file sarkması | todo | — | scene.js netGoals |
| T-223 | Çim yapraklarına rüzgâr salınımı (GrassSystemThreeJS tekniği, MIT) | todo | — | pitch-detail.js |
| T-224 | Normal maç ve penaltı tribününde de koridor/görevli seçeneği | todo | — | scene.js |
| T-230 | Oyuncu gövde modeli: forma/şort kesimi (göğüs-bel oranı), daha atletik bacak ve kramponda taban/çivi ayrıntısı | todo | — | fullbody-runtime.js, scene.js — kendi geliştirmemiz (D-019) |
| T-231 | Kaleci: büyük eldiven (manşet + avuç ayrı renk), kaleci forması dolgulu dirsek, kale çizgisinde hazır duruş varyasyonları | todo | — | fullbody-runtime.js, football-animation.js |
| T-232 | Animasyon: koşu-sprint geçişinde ivme eğimi, yön değişiminde ayak bastırma, top sürerken kısa adım | todo | — | athlete-motion.js, football-clips.js |
| T-233 | Çim: rüzgâr salınımı, kale önü ve orta sahada aşınmış çim lekeleri, maç ilerledikçe kramponla açılan izler | todo | — | pitch-detail.js |
| T-234 | Tribün: taraftar animasyon çeşitliliği (kalkma, el çırpma dalgası), atkı sallama, koreografi pankartı | todo | — | crowd-lod.js, stadium-atmosphere.js |
| T-213 | Sevinçler için gerçek motion-capture klipleri (kullanıcı Mixamo’dan indirirse retarget) | todo | — | `celebration-clips.js`, D-005 |

## Tamamlananlar

| ID | Görev | Sürüm | Sahip |
|---|---|---|---|
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
