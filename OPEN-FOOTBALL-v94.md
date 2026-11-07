# Open Football → next90sim v94: genişletilmiş uyarlama

Kaynak: https://github.com/ZOXEXIVO/open-football
Sabitlenen commit: `9bb183af844980ff0c398597868b635aff191674`.
Lisans: Apache-2.0. Asıl Rust dosyaları ve lisans: `assets/vendor/open-football/`.

Bu sürüm seçilmiş algoritmaları JavaScript'e çevirir ve mevcut maç motorunun
hareket, pas, temas ve fizik döngülerinde kullanır. Tam Rust maç motorunun
birebir derlenmiş tarayıcı sürümü değildir. Mevcut oyuncu modelleri, animasyon
iskeleti, kaleci erişim modeli, tahmin sistemi ve sonuçları kısıtlayan çözücü
çalışmaya devam eder. Kaynak repodaki bütün durum makineleri, antrenör/mental
beceri modeli veya tüm fizik kanalları taşındı iddiası yoktur.

## Gerçekte bağlanan parçalar

| Kaynak | Alınan hesap | Sitemizde çalıştığı yer |
| --- | --- | --- |
| support.rs / passing.rs | Pas destek mesafesi, baskıcı gölgesi, pas güvenliği | v93 desteği ve uyarlanabilir pas puanı |
| pressure.rs | 1.25/2.5/3.75 m baskı ağırlıkları; mesafe, çalışma, öngörü ve kondisyonla karşı pres uygunluğu | Baskı okuması; kayıptan sonra birincil pres ve sınırlı ek presçi seçimi |
| tactical/phase.rs | Saha üçte birlikleri, 2.5–4 s hücum ve 2.2–5 s savunma geçiş pencereleri | Top sahipliğine göre takım fazları |
| defensive.rs | Birincil savunma, kademe, yardım; tehlikeli koşu hızı/açısı ve kale tarafı | Paylaşılan savunma planı, koşucuya eşsiz markaj, kademe |
| marker_evasion.rs | Kör tarafa hareket, iki savunmacı arasındaki aralık, kısa gelip uzaklaşma | Topsuz oyuncu hedefleri; temas oyuncularında sınırlı ve vuruşa yaklaşırken sönen sapma |
| attacking/movement.rs | Beş açıda boş dripling koridoru arama | Top taşıyan oyuncunun baskıdan çıkış yönü |
| dribble_duel.rs | Hücum/savunma beceri ağırlıkları, geniş alan, kademe ve yüzü dönük savunma etkisi | Taşıyıcının dripling kararı; bağımsız faul/kart sonucu üretmez |
| passing/through_ball.rs | Koşucuyu öne alma, iki adımlı buluşma noktası, ofsayt, kaleci mesafesi, savunmacıyla yarış ve pas koridoru | Uygun yerden oynanan ara pasları ve alıcının koşu hedefi |
| behaviours/steering.rs | Kareli varış yavaşlaması ve sürekli kapanma hızıyla takip | Gerçek hareket hedefleri; mevcut ivme ve dönüş sınırlarıyla birlikte |
| flight/ballistics.rs | Mesafeye göre pas hızı, sürtünmeli uçuşun zaman/varış hesabı | Pasın çıkış aralığı ve gerçek top yolu |
| flight/roll.rs | Üstel yuvarlanma kaybı ve durana kadar yol kestirimi | Seken/boşta kalan topun takip hedefi ve yer fiziği |
| contest/reach.rs | Boy/temas sınırı ve gövdeye en yakın geçişte temas | Şutun savunmacıya gerçek temas testi; yüksekten geçen top görünmez bir gövdeye çarpmaz |
| boundary/net.rs | Gerildikçe artan file direnci, boşalırken daha az direnç, yatay sönüm ve yerçekiminin korunması | Gol sonrası top–file etkileşimi; normal maç ve penaltı sonrası top |

Bunlar yalnızca kaydedilmiş yardımcı fonksiyonlar değildir: AI.readBall,
AI.refresh, AI.openTarget, AI.adaptPlan ve AI.steer gerçek maç karesi hazırlama
döngüsünde çağrılır. Fizik fonksiyonları da gerçek pas/şut ve penaltı kuyruğunda
çalışır. Kullanılmayan bir Rust motoru indirip motor adı değiştirilmedi.

## Ölçek ve davranış uyarlamaları

Kaynak yatay eksenlerde metre başına 8 birim ve 10 ms tik kullanır; sitemiz
metre, saniye ve X/Z zemin eksenleri kullanır. Varış frenlemesi pozisyona
ulaşmak içindir; videonun veya tüm kontra atağın zaman ölçeği düşürülmedi.
Takip öngörüsü kaynakta 1–50 ms iken burada 50–350 ms aralığına kalibre edildi.
File derinliği kaynakta 1.9 m; bizim çizilen kalede 2.1 m olduğundan temas
paneli 2.1 m derinliğe ve 11 cm top yarıçapına uyarlandı. Yerçekimi korunur;
fileye takılan top havada asılı kalmaz.

Kaynak Football Manager tarzı çok sayıda oyuncu özelliği bekler. Elimizde
aynı doğrulanmış özellikler olmadığında mevcut açık rol varsayımları kontrol,
savunma, pas, kuvvet ve stamina üzerinden eşlenir. Bunlar gerçek oyuncudan
ölçülmüş mental özellik veya gizli FM/EA verisi olarak sunulmaz. Yeni ücretli
servis veya hesap gerekmez.

## Duruma göre üretilen pozisyon akışı

Varsayılan açık oyun artık yedi veya başka bir sabit sayıdaki klipten seçilmez.
`assets/possession-engine.js`, 22 oyuncuyu ve topu 60 Hz ilerleten, topa sahip
oyuncunun kararlarını ve takım yerleşimini ayrı aralıklarda değerlendiren bir
pozisyon üreticisidir. Aksiyonlar önceden yazılmış bir olay sırası değildir:

- Pas adayları takım arkadaşlarının o anki konumundan çıkarılır. İleri kazanç,
  alıcı etrafındaki boşluk, pas koridoru, baskı ve oyuncu profili ağırlığı belirler.
- Taşıyıcı; pas, uzun/havadan pas, ara pası buluşma noktası, çapraz taşıma,
  koruma veya şut arasında bağlama göre karar verir. İleri koşucu da markaj ve
  ofsayt çizgisini okur. Sonraki karar yeni saha durumunda tekrar hesaplanır.
- Pas hedefindeki hata, baskı ve kontrol profiline bağlıdır. Rakip topa fiziksel
  erişim içinde girerse pası kesebilir; ağır kontrol ve driplingde mücadele de
  topu boşta bırakabilir. Kazanan takımın pres/kademe ve destek görevleri değişir.
- Boşta kalan ve kaleciden dönen topa iki takım da tepki verir. Kaleci de
  topu kazanıp uzun dağıtımla bir sonraki atağı başlatabilir. Top kayıpları
  yalnızca orta sahada veya belli bir yönde koşarken oluşmaz.
- Müdahale, vuruş, karşılama, kaleci uzanışı, gövde yatışı ve koşu parametreleri
  oluşan olayın zamanından ve gerçek hareketten türetilir. Mevcut 3D animasyon
  iskeleti kullanılır; yeni fotogerçekçi animasyon arşivi eklendiği iddia edilmez.

Bu motor next90sim'e özgü bir entegrasyondur; kaynak tablosundaki Open Football
algoritmalarını kullanır. Kaynak Rust dosyasının bütünüymüş gibi sunulmaz.
Eski yedi geçiş profili, `proceduralPossession:false` ile seçilebilen eski akış
uyumluluğunda kalır; yeni varsayılan akış bunlarla seçilmez.

Analizin skorları hâlâ bağlayıcıdır. Üretilen bölüm, geçerli bir top sahipliği
ve vuruşa bağlanabilecek yerleşim bulduğunda mevcut son vuruş bölümüne bağlanır.
Son vuruşun mevcut aileleri ve fiziksel sonuç çözücüsü korunur. Dolayısıyla bu,
tüm maçın skorunu bağımsız hesaplayan, bütün FM kapsamını taşıyan sınırsız bir
motor değildir. İlave şutlar gol dışındaki sonuçları üretebilir; yeni gol eklemek
yerine mevcut tahminin gol olayları terminal çözücü tarafından gerçekleştirilir.
Kalecinin dokunup içeri bıraktığı terminal şutlarda top çizgiyi gerçekten geçer;
eldiven, gol çizgisi ve file teması ayrı zamanlardır.

Geçersiz veya dışarıda kalan dallar ekrana bozuk bir akış olarak verilmez.
Üretim en fazla 10 deterministik deneme, her denemede en fazla 17 saniyeyle
sınırlıdır. Duran top, bazı disiplin/değişiklik sahneleri ve güvenli bir canlı
bağlantı bulunamayan durumlar mevcut akışı kullanabilir. Sonsuz deneme ve sonsuz
video hazırlama döngüsü yoktur. Üretim video kareleri çizilirken tekrar yapılmaz;
bitmiş kareler ve olay günlüğü oynatılır. Aynı seed aynı akışı üretir.

Ofsaytlı bir terminal pasında oyuncuları kesme noktasında geriye sıçratmak yerine
uygun erken pas anı aranır. Oluşan bölüm ile son bölüm arasındaki top ve oyuncu
konum sürekliliği test edilir. Sahne oluşturma işlevleri ve büyük ön bölüm
verileri penaltı şablonuna kopyalanmaz; böylece kopyalama hatası ve kare başına
gereksiz büyük veri kopyası önlenir.

## Sınırlar ve yeniden üretim

Bu çalışma oynanışın bu parçalarını derinleştirir. Her olası gerçek futbol
pozisyonunu kapsadığı veya tüm animasyon/model kalitesini Open Football'den
aldığı söylenemez. Yeni yüz, forma ya da fotogerçekçi model paketi eklenmedi.
Önceden hazır MP4 dosyaları değişmez; yeni oynanış için yeniden video üret.
Yeni oyun revizyonu dışa aktarma reçetesine ve yerel video anahtarına eklendi.
Yeni iş, eski revizyonun hazır videosuyla aynı anahtara düşmez.
