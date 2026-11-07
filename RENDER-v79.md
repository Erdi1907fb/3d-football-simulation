> v96 notu: Bu arşivde aşağıda adı geçen tools/render-worker programı bulunmuyor. Bu belge eski tasarımı açıklar; yükleme tek başına otomatik ön üretimi başlatmaz. Ayrı PC/VPS üreticisi kurulmalıdır.

# Hazır MP4 sistemi — v79

Telefonun yalnızca internet hızına göre indirmesi için MP4'ün önceden üretilmiş olması gerekir. Bu sürüm aynı orijinal dosyayı telefona yeniden çizmeden/kodlamadan indirir. Mevcut web hosting yalnızca kuyruğu ve dosyayı saklar; üretimi bağlı bilgisayar veya ayrı bir render makinesi yapar. Siteyi ziyaret etmek ve mevcut tarayıcı üretimini kullanmak için Node gerekmez.

## Bir kez bağlantı kur

1. ZIP'i web köküne yükle. Mevcut `data/` klasörünü koru.
2. Hostingde `render-config.example.php` dosyasını `render-config.php` adıyla kopyala. Örnek metnin yerine sana özel, rastgele en az 24 karakterlik anahtar yaz. Bu örnek anahtarla sistem etkinleşmez. Anahtarı herkese açık paylaşma.
3. Bilgisayarında Node.js 22 veya üzeri kurulu olsun. Paketin `tools/render-worker` klasörünü bilgisayarında tut; içindeki `BASLAT.cmd` dosyasını aç. İlk çalıştırma gerekli tarayıcı/video araçlarını indirir.
4. İlk çalışmada oluşan `worker-config.json` dosyasında `site` alanına simülasyonun tam HTTPS adresini (sonunda `/` ile), `key` alanına aynı özel anahtarı yaz. `BASLAT.cmd` dosyasını tekrar çalıştır. Pencereyi açık bırak.
5. Telefonda video penceresini aç. **Bilgisayarı bağla** bölümünde aynı anahtarı bir kez girip **Bağlan** de.

Artık **Bilgisayarda hazırla · 1080p / 60 FPS** işi bilgisayara yollar. Telefon sayfasını kapatsan da bilgisayar üretime devam eder. Sonra **Hazır videolarım** ile orijinal MP4'ü doğrudan indir. Bilgisayarda normal tarayıcıdan hazırladığın videolar da aynı anahtar kayıtlıysa bu listeye eklenir. WhatsApp'tan video taşıman gerekmez. Aynı kayıtlı hazır iş yeniden üretilmez.

Bilgisayar kapalıysa yeni iş sırada bekler; hazır dosyalar sunucuda oldukları sürece indirilebilir. Bu sürüm bir Unreal/Godot/Unity uygulamasına geçiş yapmaz; mevcut web simülasyonunun isteğe bağlı üretim yardımcısıdır.

Bağlantı anahtarı girilmemişse bilgisayardaki yerel üretim doğrudan kaydedilir; iOS dosya paylaşımını destekliyorsa orada da dosya gereksiz yere sunucuya yüklenip yeniden indirilmez. Eski iOS indirme uyumluluğu için sunucu aktarım yedeği korunur.

## Kalite ve süre

- 1080×1920 veya 1920×1080, gerçek 60 kare/saniye; High Profile H.264 destekleniyorsa önce o seçilir. Çözünürlük/kare sayısı sessizce düşürülmez.
- Yerel donanım kodlayıcısında `quality` modu ve değişken bit oranı. Birkaç karede bir `flush` yapmak kaldırıldı; sınırlandırılmış kuyruk kullanılır. 60 FPS hedef bit oranı 24 Mbps; ses AAC 48 kHz / 192 kbps. iOS yazılım yedeğinde ilk kullanılabilir karede anahtar kare korunur.
- Bilgisayar yardımcısı sesi çevrimdışı PCM olarak karıştırıp AAC'ye çevirir; sesi maç süresi kadar gerçek zamanda kaydetmeyi beklemez. Video akışı ses eklenirken yeniden kodlanmaz.
- Sahaya çıkan oyuncular dışa aktarımda kamera uzaklığı nedeniyle daha basit modele geçmez. Bu, oyuncu detayındaki ani değişimi azaltır; çim dokusunun mevcut mipmap/uzaklık filtrelemesi korunur.
- Sunucuya parçalı aktarım SHA-256 ile kontrol edilir. İndirme byte-range ile devam edebilir. Hazır dosyaya yeniden sıkıştırma uygulanmaz. Dosyalar varsayılan 48 saat saklanır; toplam havuz 8 GiB ile sınırlıdır. Yeni yüklemelerde süresi geçen dosyalar temizlenir.
- 24 Mbps'de 90 saniyelik bir video yaklaşık 272 MB olabilir. İki dakikada indirmek için gerçek aktarım hızının yaklaşık 18 Mbps veya üstü olması gerekir. Video hazır değilse bilgisayarın üretim ve yükleme süresi de eklenir. Her cihaz ve her bağlantı için iki dakika garantisi verilmez.
- WhatsApp veya Instagram'ın dosyayı yeniden işlediği bir akışın sonucu bu uygulamadan garanti edilemez. Instagram'a orijinal MP4'ü yükle; uygulamanın yüksek kaliteli yükleme ayarını açık tut. Bu sürümde uygulama içinden orijinal dosya korunur.

## Teknik doğrulama ve sınır

Tarayıcı testi: 126 farklı kare, 1080×1920, H.264 High, yuv420p, 60/1 FPS; kare kaybı yok. Bu kısa kodlayıcı testidir, tam maç üretim süresi ölçümü değildir. Kuyruk testleri: anahtar doğrulama, tek iş/tek kiralama, tekrar kullanım, SHA-256 ve kesilen indirmeye devam. Skor/gol dakikası/golcü karşılaştırmaları ve oynanış testleri tanı kayıtlarında bulunur.

Birincil teknik referanslar:
- https://www.w3.org/TR/webcodecs/ — quality/realtime kodlama modları.
- https://www.hostinger.com/support/which-media-compression-and-web-applications-are-supported-at-hostinger/ — ağır video/FFmpeg üretimi web hostingde çalıştırılmaz.
- https://github.com/eugeneware/ffmpeg-static — bilgisayar yardımcısının FFmpeg ikili dağıtımı; FFmpeg lisansları ilgili dağıtıma aittir. İkili dosya bu ZIP'te yoktur, bilgisayarda kurulur.
