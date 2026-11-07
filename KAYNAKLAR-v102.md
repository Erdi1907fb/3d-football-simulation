# v102 — kullanılan kaynaklar ve uyarlama sınırları

Bu paket v99 web tabanını ve v101 değişikliklerini devam ettirir. Kaynakların tam bir oyunun yerine geçtiği iddia edilmez. Yeni kod, var olan Three.js/11v11/penaltı katmanlarına bağlanmıştır.

| Kaynak | Paketteki gerçek kullanım |
|---|---|
| [Pablo Mesquida / three-procedural-locomotion](https://github.com/PabloMesquida/three-procedural-locomotion) | FootTarget `swingArc` eğrisinin JavaScript uyarlaması; yürüyüş/koşu geçişi, destek ve salınım fazları, mevcut iki kemik IK ile birlikte. Kütüphanenin tamamı veya bütün hareket kontrolcüsü taşınmadı. MIT bildirimi ve incelenen FootTarget/FootRoll kaynakları `assets/vendor/procedural-locomotion/` içinde. |
| [Poly Haven — Stadium 01](https://polyhaven.com/a/stadium_01) | Sergej Majboroda'nın gerçek 1K HDR dosyası pakete alındı. WebGL2 ve düşük dışı kalite ayarında yansıma/ortam ışığı olarak kullanılır. CC0. Bir stadyum modeli veya yayın görüntüsü değildir. |
| [Three.js r158](https://github.com/mrdoob/three.js/tree/r158) | Mevcut yerel renderer korunur. Resmî RGBELoader, mevcut UMD yapısına paketlenmiştir. Mesh standard/Lambert, instancing ve çevre haritalama kullanılır. MIT bildirimi mevcut vendor klasöründedir. |
| [Yuka](https://github.com/Mugen87/yuka) | v101'deki Arrive/Separation uyarlaması korunur. Tarayıcı factory bağlantısındaki eksik argüman düzeltildi. |
| [Open Football](https://github.com/ZOXEXIVO/open-football) ve [OpenEngine](https://github.com/atas76/openengine) | Önceki sürümdeki uyarlamalar korunur. Yeni geometrik destek/markaj/top sürme kararı bu katmanlarla birlikte çalışır. Kaynakların bütün motorları yeniden taşınmadı. Önceki vendor bildirimleri korunur. |
| Gameplay Football / SoccerViewer, MPFB, TextureCan, SkillCorner | Önceki paketteki animasyon, anatomik model, çim ve kısıtlı tracking kaynakları korunur. Yeni satın alınmış bir mocap veya yüz tarama paketi eklenmedi. |
| [footballcsv/cache.footballsquads](https://github.com/footballcsv/cache.footballsquads) | Tarihî kulüp ve senior millî takım kadro snapshotları alındı; dönüştürülmüş kadrolar, kaynak satırları ve depo lisans metni pakete kondu. Saha içi ilk 11 seçimi, ayrıca doğrulanmadığı sürece temsili model seçimidir. |
| [National Football Teams](https://www.national-football-teams.com) | 1980–2026 yıllık millî takım oyuncu katılımları, mevki, ilk 11/sonradan giriş ve gol sayıları; mevcut ülkeler için kaynak bazında kaydedildi. Bu kayıtlar tek bir maçın resmî 11'i veya turnuva çağrı listesi değildir. Kaynakta numara yoksa forma numarası boş bırakılır. |
| [openfootball/internationals](https://github.com/openfootball/internationals) | Millî takımların yıllık ve turnuva maç/gol/galibiyet/beraberlik örneklemleri. Penaltı serisi skoru maç skoruna eklenmez. CC0 depo bildirimi. |
| [UEFA EURO 2016 final raporu](https://www.uefa.com/newsfiles/EURO/2016/2017907_FR.pdf) | Portekiz 2016 için finalin gerçek ilk 11'i, Fernando Santos, Ronaldo'nun kaptanlığı ve forma numaraları; 23 kişilik turnuva kadrosuyla birleştirildi. |

## Özgün Next90 geliştirmesi

`arena-art.js`: açık merkezli çatı, 336 çelik taşıyıcı, LED şeritler, localar ve korkuluklar; ek mimari 14 çizim grubudur. Mevcut tribün dağılımı ve bayraklar korunur. Çatı, normal maç kameralarının 22 m sınırının üstündedir.

`collective-play.js`: oyuncuların anlık konumlarından pas görünürlüğü, boş alan, rol şeridi, geride kalan savunma ve eşsiz markaj görevi hesaplar. Top taşıyıcı için 17 yönün açıklığı, rakibin öngörülen konumu ve dönüş maliyeti birlikte değerlendirilir. Bu, 17 hazır pozisyon veya 17 gol sahnesi değildir; sürekli geometri üstündeki karar adaylarıdır.

`athlete-motion.js`: mevcut model/iskelette mesafe tabanlı adımlar, ters ve yan koşular, pelvis/gövde karşı hareketleri; vuruş sonrası denge ve kalecide hazır duruş/uzanma bacak tekniği. Kesin ayak/el/top temasları mevcut temas çözücüsünde kalır.

Yeni AAA futbolcu veya yeni tüm stadyum taraması eklenmedi. Fizik motorunun bütünü Rapier/Bullet ile değiştirilmedi. Sonuçlar ayrı bir motor tarafından videoda tekrar rastgele üretilmez.

Arşiv kapsamı `assets/concept/history-coverage.json` ve ARSIV-v102.txt içindedir. Eksik kaynak yılları komşu sezonla kopyalanmaz. Kaynağı alınamayan bir alan doğrulanmış gibi işaretlenmez.
