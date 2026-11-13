# V173 — temas, takım oyunu ve video doğrulama

Başlangıç web V172 `2ba43be`. Kullanıcı beş aşamayı sırayla yetkilendirdi.
Kalıcı plan `../FOOTBALL-ROADMAP.md`; durum TASKS T-286…T-290 ve en yeni HANDOFF'tadır.

## 1. Gerçek temas ve animasyon

`football-animation.receiveContact` dondurulmuş gerçek alım noktasına yalnız
alım zarfında erişilebilir bacak IK uygular. Uzaklaşan topu ayağa geri çekmez.
`strikeContact` uzak/yüksek erişilemez hedefte uzuv uzatmaz. Normal prosedürel
oyun gain/release noktalarını, arena pas/santra/şut olayları gerçek noktaları kaydeder;
UI dünya/zaman dönüşümünü yapar. Stüdyo P/FK zaten kendi strikePoint'ini kullanır.
Mevcut authored normal sekanslarda fiziksel nokta kaydı yoksa mevcut animasyon korunur.

Kalecide eski prosedürel yay + tipOver yayı + klip root'u üst üste binmiyor:
`keeperGrounded` yolunda tek en çok.42m itiş + sınırlı gövde düzeltmesi; klip
root'u korunur. Gerçek kayıtlı temas hâlâ IK hedefidir. Root/top/skor değiştirilmez;
her fiziksel hedefin bütün oyuncu vücutlarında kusursuz erişilebilir olduğu iddiası yok.
`contact-motion.cjs`: sağ/sol temas, erişim, dondurulmuş nokta, root/top değişmezliği,
uzaklaşan topu kovalamama ve kaleci gövde sınırı.

## 2. Birlikte futbol kararları

`football-intelligence.combinations`: gerçek son pasın atan/alıcı kimliği ve
zamanından verkaç; başka uygun saha oyuncusuna üçüncü oyuncu veya bindirme
teklifi. İşler farklı oyunculara atanır, eski pas ve kaybedilen sahiplik koşuyu
sürekli açık tutmaz. Normal collective katmanı mevcut ofsayt/rest-defence sınırları
altında bu teklifleri kullanır. Arena5Hz takım planı destek açılarını ortak dağıtır.
Top kaybeden takımın baskıcı dışındaki oyuncuları kısa süre goal-side örtüye döner.
Bu teklifler eylem/sonuç senaryosu değildir; topa fiziksel ulaşmadan pas/gol üretmez.

## 3. Kalabalık Japon Kale

Topa katılmayan, kalesi uzakta olan rakip kendi sektörünü korur; bütün takımlar
aynı anda topa yığılmaz. Aynı takımın teklifleri ayrı pas açılarına dağıtılır.
Pas güvenliği gerçek ileri hedef üzerinden yeniden değerlendirilir; alıcı,
ball-aero tahmini ve kendi yetişme süresiyle yavaşlayan topun buluşma noktasına koşar.
Tahmin gözlenen topun aynı fiziğidir; sonradan üretilmiş golü okuyan oracle değildir.

## 4. Takım karakteri

`teamStyle`: kimlikten balanced/combination/vertical/wide sentetik koçluk profili.
Genişlik, pas ilerleme değeri, destek temposu ve karar sabrı değişir; açık taktikler
önceliklidir. Takımın renk objesi adını kaybettiremez; kozmetik veri eklendiğinde
aynı kimliğin stili maç tohumuna kaymaz. `verified:false`, bu profiller kulübün
ölçülmüş/resmî gerçek taktiği değildir. Sonuç/galip/istatistik kotası yok.

## Motor referansı ve korunanlar

League-Soccer/GameplayFootball yaklaşımının V172 özgün JS uyarlaması genişletildi.
FM'nin özel motoru/kodu/varlıkları aktarılmadı. V172 araştırması ve Apache lisansı
geçerlidir; yeni görsel/model/ses varlığı eklenmedi. Saha/formalar/yüzler/lig arayüzü,
PHP veri/bülten/cron akışı korunur. Normal hedef skor/goalLedger sözleşmesi aynı.
Elemede kayıtlı `frame.layout/goals/stage` ve4→3→2düzeni korunur; yeni fizik eski
tohumdaki hangi takımın elendiğini değiştirebilir. Test kimliği gerçek eleme
olaylarından türetir; sabit bir takımı eletecek fizik ayarı yapılmadı.

## Ölçüm yöntemi ve sınırı

Ham sonuç [v173-intelligence-metrics.json](v173-intelligence-metrics.json).
`node tools/measure-intelligence.cjs --baseline <V172> --out report.json`:
2/3/6taraf için6tohum×45sn, iki normal fikstür ve30P/FKseri. İki sürüm aynı
risk değerlendiricisiyle ölçülür. Yakınlık: aktif saha oyuncularının1.5maltındaki
çift sayısı/kare; hangi takımdan olduğuna bakmadan. Alım:2sn içinde sonraki
sahiplik hedef alıcıya ait, ilk vuruş golü alım sayılmaz. Profesyonel maç verisi değildir.

|Mod|Pas|Hedefe alım|Sahipsiz kare oranı|Yakın çift/kare|Ortalama pas riski|
|---|---:|---:|---:|---:|---:|
|5v5|55→56|38→39|.580→.508|1.081→1.297|.092→.136|
|3taraf|31→28|17→18|.540→.554|1.992→1.908|.152→.208|
|6taraf|31→43|15→26|.542→.524|1.715→1.403|.155→.131|

Yüksek riskli pas (risk>.65) sayısı5v5te0→4,3tarafta1→2,6tarafta1→2oldu; mutlak sayı pas hacmiyle birlikte okunmalı.

Her ölçü iyileşmedi:5v5yakınlığı/risk ve3taraf sahipsiz oranı/risk arttı.
Bütün modlarda mutlak kalite artışı iddia edilmez. Altı taraflı hedefte alım,
ortalama risk ve yığılma örneği birlikte iyileşti. Normal iki fikstürün bütün
goalLedger kayıtlarının eşitliği ayrıca assert edilir. P/FK sonuç oranları bu
sürümün sunum düzeltmeleriyle ayarlanmadı.

## 5. Çalıştırma / cihaz / video

`tests/browser-intelligence.cjs`: gerçek Chromium/SwiftShader normal11v11,
P/FK,2/3/6arena. PHP yanıtları mock; canlı sağlayıcı veya fiziksel GPU testi değil.
`tests/browser-video.cjs`: gerçek stüdyo çiziminden1080×1920kareler, ortak
SekmeVideo.create; kodlamadan önce/ortada iptal, yeniden üretim, MP4 çözümleme.
Tam maç zamanı farklı noktalara çizilip geri sarma değişmezliği denetlenir.
Kısa sessiz kodlama klibi tam süreli/sesli maç veya fiziksel Windows/iPhone denemesi
değildir. Bu sınırlamalar sonuç kayıtlarında ayrıca belirtilir.

Yerel test bağımlılıkları Electron ve Playwright; site runtime'ına paket eklenmedi.
Linux örneği: `DISPLAY=:108 NEXT90_TEST_NODE_MODULES=<harici-node_modules> node tests/browser-video.cjs <çıktı>`.
Windows'ta aynı test Node ile ve Windows Electron/Playwright kurulumu yolunu
`NEXT90_TEST_NODE_MODULES` vererek çalıştırılabilir; bu oturumda çalıştırılmış sayılmaz.
MP4 `ffprobe`/`ffmpeg` ile ayrıca boyut/fps/kare/decode doğrulanır.

Fiziksel cihaz kalan kontrolü: gerçek Windows Chrome/Edge, iPhone Safari, Android
Chrome; tam süreli sesli1080p dışa aktar, sonuna kadar oynat/ileri-geri sar/indir,
iptal et ve yeniden hazırla. Sonuç cihaz/sürüm/çözünürlük/süreyle HANDOFF'a yazılır.

### Son yerel video sonucu

Kayıt: [v173-video-validation.json](v173-video-validation.json).
51.4snpenaltı zaman çizelgesinde4ileri/geri konum değişmezliği PASS; kodlamadan
önce/ortada iptal ve sonraki temiz iş PASS. Gerçek18ayrı1080×1920sahne karesinden
0.3snsessiz60FPSklip hem **WebCodecs** hem bağımsız **software** yoluyla üretildi.
Her dosya ffprobe:H.264,1080×1920,60/1,18kare,.300000sn; ffmpeg tam decode PASS
ve18/18farklı kare MD5. İki yol gerçekten ayrı; sadece kodlayıcı seçeneğini
işaretlemek başarı sayılmadı. Tarayıcı JS hatası yok.

36/36Node/PHP paketi PASS. Son küçük stil girdi koruması/aktif alım ayağı için
hedefli teamwork/contact-motion testleri ek tekrar PASS. Engine-test259.8sn,
eşzamanlı SwiftShader oturumu: bunun önceki tekil sürelerle farkı cihaz/FPS
benchmark'ı olarak yorumlanmaz. Fiziksel cihaz ve tam süreli sesli export açık.
