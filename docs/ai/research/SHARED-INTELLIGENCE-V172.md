# V172 — Web görünümünü koruyan ortak futbol zekâsı

Kullanıcının isteği: normal11v11, sezon/konsept, penaltı, FK,5v5 ve3–6taraf
Japon Kale'de mevcut saha/model/forma/sunumla birlikte daha iyi oyuncu ve oyun
kararları. C++ görüntü motoru veya masaüstü uygulaması web'e eklenmedi.

## Kaynak ve uygulama sınırı

İncelenen kaynak `Erdi1907fb/Yeni-Video@f987081230e1498a2ad3b3c53437035ec39c5a73`:
`engine/src/onthepitch/AIsupport/AIfunctions.cpp` (`AI_CalculatePassingOdds`,
`AI_GetTimeNeededForDistance_ms`) ve `player/controller/strategies/offtheball/goalie_default.cpp`.
League-Soccer/GameplayFootball Apache-2.0. Yeni JavaScript özgün uyarlamadır;
bütün motorun veya bütün C++ yapay zekâsının birebir portu olduğu iddia edilmez.
Harici model, animasyon, çim, arma, forma, yüz veya ses alınmadı.

`assets/football-intelligence.js` bağımsız UMD, metre/saniye ve X/Z koordinatları:

- `arrival`: hedefe olan uzaklığın yanında mevcut hızın doğrultusu, yan hız,
  ters yönde frenleme, ivme, tepki ve erişim yarıçapı. C++10ms aramasının yerine
  tarayıcıya uygun analitik yaklaşım; tam motorun sprint/eklem simülasyonu değildir.
- `passWindow`: pas segmentindeki yakın kesişme ve alıcı noktası, topun geliş
  zamanı ile rakibin yetişme zamanını karşılaştırır. `risk` bir karar maliyetidir;
  doğrulanmış gerçek maç pas yüzdesi veya oyuncu reytingi değildir.
- `support`: rolün temel konumunu küçük bir yarıçapta tutup markaj gölgesinden
  çıkacak ayrı pas açısı arar. Şekil ve rest defence korunur.
- `pressers`/`mark`: ivme ve momentumla birinci baskıcı, kararlı seçim payı ve
  koşucu başına tek örtü. Normal maçta mevcut primary/cover/counterpress görevleri
  korunur; yeni modül tüm oyuncuları aynı top hedefine yollamaz.
- `keeperRead`/`keeperStep`: o anda gözlenen topun hızından kısa tahmin, tepki
  süresi,10Hz karar, sınırlı ivme/hız/uzanma. İstenen gol/kurtarış veya ilerideki
  skor karar girişine verilmez. Topu hâlâ mevcut ball-aero/football-physics entegre eder.

## Mod bağlantıları

11v11/sezon/konsept `football-ai`, `possession-engine`,
`open-football-adapter.defensivePlan` üzerinden aynı katmandadır. Yayımlanmış
skor/gol defteri doğruluk kaynağı olarak kalır; bu sürüm ayrı yeni tahmin modeli değildir.

5v5/Japon Kale: `japon-tactics` aynı pas/ETA/destek katmanını kullanır;
`japon-engine` dönüş/hazırlık gecikmesinden sonra pas koridorunu tekrar kontrol
eder. Araya rakip girdiyse eski pası körlemesine vurmaz. Şut, sahiplik, faul,
kaleci eli/geri pas, drop/santra ve skor yalnız gerçek temaslarla oluşur.

Penaltı: istatistiksel örnek artık yalnız vuruş adayıdır. Kaleci geçmiş görülen
vuruşlar ve ayrı tohumlu ilk köşe tercihiyle başlar, sonra gözlenen topu okur.
Gerçek el erişimi kurtarışı belirler; aday sonuç gerekirse değişir. Geçmişteki
`outcome==='save'` → doğru köşeyi bilme yolu kaldırıldı. Parmak ucu temasından
sonraki top da aynı ball-aero ile devam eder; dokunulmuş gol türü korunur.
Ön izleme ve MP4 aynı kayıtlı top/kaleci izini örnekler.

FK: barajın görüş maliyeti baştan sabittir; sonradan tepki süresini değiştirip
kaleciyi geçmişte hareket etmiş sayma yok. Toplam uzanma hesabına bir daha
sınırsız gövde yolculuğu eklenmez. `keeperFrames`, hem fiziksel temas hem de
render pozudur. El teması zamanı/noktası ortak animasyona verilir.

## Doğrulama ve yorum

`tests/football-intelligence.cjs`: hareketli rakip/yetişme, tekil örtü, pas
hazırlığından sonra kapanan koridor, skor/sonuç alanına bakmayan kaleci,
ivme/hız, gerçek el teması, aynı tohum/geri sarma ve script yükleme sırası.
Mevcut bütün regresyonlar ayrıca çalışır. `variation.cjs` sabit bir tohum
örneğinde “en az12tur olsun” kotası yerine gerçek sudden-death/alternatif
sonuç/sonlu top ve eşit vuruş kurallarını kontrol eder. Ürün bu kotaya göre
sonuç üretmez. `penalty.cjs`, dokunuş sonrası da aynı tam fiziksel uçuşu sınar.

`tools/measure-intelligence.cjs --baseline /path/to/V171 --out report.json`
iki sürümü aynı V172 risk değerlendiricisiyle ölçer; eski/yeni farklı risk
ölçeğini karşılaştırmaz. Sabit tohum örneği profesyonel maç istatistiği değildir;
altı taraflı kalabalık oyunda her ölçünün mutlaka iyileştiği iddia edilmez.
Tarayıcı smoke testi Electron/Chromium+SwiftShader ile çalışır; gerçek telefon/GPU
performansı veya tam1080p60 video hızı olarak sunulmaz.

## Eleme turunda fizik ve saha geometrisi

`japon-engine` her golün kısa molasının sonundaki reset'te aktif takımları sayar.
En az iki takım kaldığında yeni `Layout.create(count,goalWidth)` düzeni oluşturur;
geometrik kale slotları asıl takım ID'lerine eşlenir. Aktör/kadro/forma slotları
aynı kalır; üçerli takımlı final bir5v5 kadro değişimi değildir. Standart üçgenin
ölçüleri iki kaleli dikdörtgenden farklıdır; geometrik dönüşümü yalnız homojen
küçültme olarak tanımlamayın. Bir kazanan kalınca son iki kaleli düzen korunur.

`stages` ve her fizik karesindeki `stage/layout/goals`, sample/geri sarma/video
zamanında aynı turu seçer. Restart kesmesinde eski/yeni koordinatlar arasında
enterpolasyon yoktur. Arena yeni yerel saha/çizgi/tribün/kale kaynaklarını oluşturur;
eski yerel kaynakları serbest bırakır, ortak kaynakları korur. Taraftar sektörleri,
forma renkleri ve kale etiketleri geometri slotu yerine asıl takım ID'sini izler.
`arena-elimination.cjs` fiziksel4→3→2turu, [0,2,3]→[2,3]kimlik eşlemesi,
standart geometri, oyuncu sınırları, kale/zemin mesh'i, geri sarma, kamera ve yerel
dispose'u sınar. `japon-kale.cjs` gol düzlemini artık olay anındaki kayıtlı kaleden okur.

## Sabit örnek ölçümü — V171 → V172

Ham sonuç: [v172-intelligence-metrics.json](v172-intelligence-metrics.json).
V171 temeli `21f1fd2`; aynı sürümün Windows paketindeki değişmemiş web kopyası
kullanıldı. Arena her sayı için6tohum×45sn; normal2fikstür; penaltı/FK30seri.
Risk>.65koridoru iki sürüm için de **aynı yeni değerlendirici** ile sayılır.

| Mod | Pas sayısı | İlk hedefe alım | Riskli pas | Ortalama risk |
|---|---:|---:|---:|---:|
|5v5|55→55|36→38|5→0|.156→.092|
|3taraf|32→31|17→17|4→1|.228→.152|
|6taraf|33→31|17→15|3→1|.160→.155|
|Normal11v11|29→34|—|5→4|.251→.158|

Altı taraflı örnekte alım17→15ve sahipsiz top kare oranı.508→.542:
her metriğin iyileştiği söylenemez. Normal iki maçın **bütün goalLedger kayıtları**
önce/sonra aynıdır. Bunlar sınırlı mühendislik örnekleri, genel kalite/gerçek maç
başarı oranı veya tüm fikstürlerde nicel iyileşme kanıtı değildir.

Penaltı:313→304vuruş,232→180gol,47→107kurtarış; eski55yazılmış el teması
yerine17gerçek parmak ucu teması;110aday sonuç gerçek erişimle değişti. FK:
162→160vuruş,42→42gol,48→45kurtarış. Bu dağılımlar kota veya hedef değildir.

Tarayıcı kayıt özeti: [v172-browser-smoke.json](v172-browser-smoke.json).
Normal konsept11v11,penaltı,FK,2/3/6taraf arena ve elemede4→3→2→4geri sarma
çekildi. Gerçek çizim yolunda kale sayısı, kalan asıl takım kimliği ve tribün
kişi sayısı/renk eşlemesi kontrol edildi; JavaScript hatası yok. PHP yanıtları
smoke testinde taklittir, gerçek sağlayıcı/veri doğrulaması sayılmaz.
