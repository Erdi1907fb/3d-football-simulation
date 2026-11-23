# T-382 — ortak futbol geliştirmesi, V234

V233'teki ilk koşu/pas paketinin devamı. Haftanın maçı 5v5'i, Turnuva Stüdyosu 5v5/Japon ve bağımsız küçük saha/Japon aynı motor ve sunumdan yararlanır. Normal 11v11'de ortak animasyon, markaj ve çim katmanı değişir; haftalık tahmin/goalLedger sözleşmesi korunur.

## Uygulama

- **Koşu/boy:** mocap adım evresi çizim geçmişinden bağımsız, gerçek kat edilen mesafeden hesaplanır. 1.42m referans adımı mevcut doğrulanmış boy ölçeğiyle sınırlı biçimde ölçeklenir; prosedürel alt gövde aynı evreyi kullanır. Bu sabit referans, hızla değişen adım uzunluğunu her karede entegre eden eski yola göre geri sarma/MP4 eşitliğini önceler; yeni tracking/mocap kalibrasyonu iddiası değildir.
- **Dribbling:** fiziksel dokunuş noktası ve topun yakındaki ayağı kaydedilir; sunum o ayağı oynatır, erişim sınırlı IK ve denge kolu uygular. Görsel katman topu/kökü taşımıyor.
- **Savunma:** arena örtüsü ve ortak 11v11 markajı koşucunun gözlenen hızını öngörür. Mevcut tek baskıcı, ayrı markaj ve geçiş kademesi korunur.
- **Kaleci:** iki direğe giden ışınların açıortayında yerleşim; mevcut gerçek tehdit/sekme okuma ve el/geri pas kuralları geçerli. Uzaklaşan yakın yan top ve taşıyıcı yokken merkezlenme güçlendirildi (arena-football sınır testi).
- **Şut/aksiyon:** uygun mesafe/açıda fiziksel falso ve sıfır dönüşlü knuckle; farklı animasyon tekniği. Açık koridor şut önceliği ve beceriye bağlı tek vuruş isteği arttı. Gol/kurtarış/skor kotası yok. Bütün vuruşlarda gerçek top integratörü, çarpışma ve temas sonuç verir.
- **Pas/top fiziği:** clear/rain/snow + ilk kayma/yuvarlanma için aynı BallAero ile varış; 120Hz tahmin, yüzey başına 801 kayıt üst sınırı. Alıcı payı, kaleciye pas yetişme denetimi ve pas niyeti süresi aynı tahmini kullanır. Geri pasın güvenli yan hedefi korunur.
- **Grafik:** arenada mevcut PBR albedo/normal/roughness/detail haritaları ortaklaştırıldı. Yakın plan yaprakları saha çokgeniyle kırpılır, zamandan hesaplanan hafif rüzgâr ve yakındaki sekiz aktif oyuncuya sınırlı eğilme uygular. Kamera seçimi çizim anında yapılır; önceki kare seçimini kullanmaz. High arena38k/balanced18k; low/mobileExport0 ek yaprak. Yeni dış varlık veya atlas yok.

## Ölçüm

`comparison.json`: aynı gerçek seçili kadro kaynakları/tohumlarla V233 ilk paketine karşı son kod, 60sn. Sekiz 5v5: şut72→61, pas170→167, gol18→11, sahipsiz top6→2. Dört çok kaleli oyun: şut38→43, pas56→45, gol8→10, sahipsiz top3→1. Güçlenen savunmayla bu 5v5 örnekleminde gol/şut düştü; her maçta daha çok gol veya üstün doğruluk iddiası yok. Son hedefli v188-fixes:24 gerçek kadrolu60sn5v5, ortalama7.5şut/2.04gol,2golsüzmaç. Gerçek lig sonucu tahmini veya tracking kalibrasyonu değildir.

## Doğrulama

- `football-upgrade.cjs`: ileri/geri arama evresi, boy ölçeği, kaleci açıortayı, koşucu takibi, beş teknik, bounded çim uniformları.
- `movement-passing.cjs`: dört saha yönü/sıfır hız, clear/rain/snow ve ilk kayma; 240Hz fizik ile varış kontrolü.
- `competition-frames.cjs`: eski sunumla106kare parity; yalnız yeni dribbling metadata/şut tekniği açıkça beklenir. İptal/yeniden deneme testleri aynen durur.
- Chromium/SwiftShader: 10oyuncu/38k yaprak/PBR,8→3→8aynı bacak pozları, JS/GL hatası yok (`browser-five.json`), gerçek1080×1920 kare. Çok kaleli12oyunculu Japon da PBR/38k/geri sarma eşitliği/JS-GL hatasız (`browser-japon.json`, `japon-portrait.png`). Normal11v11 22oyunculu sahne gerçek çizildi (`eleven-landscape.png`). Yerel statik sunucunun PHP yanıtları backend doğrulaması olarak kullanılmadı.
- PHP CLI8.4 + ctype/iconv/mbstring resmi Debian paketleri yalnız `/tmp` altına çıkarıldı; dört PHP testi geçti. Sistem kurulumu/depo bağımlılığı eklenmedi.
- Tam paket ve başarısız kontrollerin düzeltme sonrası sonuçları ayrı JSON'da kaydedilir. Sürüm etiketi testlerden sonra paketlenir; ham test kaydı V233 tabanını gösterebilir.

Fiziksel iPhone/gerçek GPU60FPS veya yeni tam çok dakikalı MP4 ölçümü yapılmadı. Eski T-325/T-328/T-317 bu iş kapsamında tamamlanmış sayılmaz. Hostinger yayını yapılmadı.

Son18maçlık futsal-five kontrolü:184şut/57gol,9vuruş örüntüsü, kale tarafı savunma örtüsü .987. Nihai hedefli çıktılar `targeted-summary.json` içinde.

Kapanış: tam paket63kontrol (engine-test dahil) ardından düzeltme/PHP sonrası6başarısız kontrol --failed ile PASS; `test-summary.json` toplam63/63. Yerel build.php: build234/filesMatch=true/mismatches=[]. Hostinger yayını değildir.
