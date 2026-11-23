# V235 / T-384 — Hafta/tur bazında video indirme

Turnuva hazırlandıktan sonra **İndirilecek video bölümü** menüsünde Tam video ve her hafta/tur görünür. Kullanıcı bir bölümü, oranı ve **Seçili bölümün video hızı** değerini (1.0–3.0x, 0.1 adım) seçip mevcut MP4 hazırla düğmesine basar. Sonuçların her biri kendi oynatıcı/indirme kartında kalır. Bölüme tekrar dönünce hız seçimi hatırlanır; farklı hızla yeniden üretim yalnız aynı bölüm/aynı orandaki dosyayı yeniler. Diğer bölümler ve tam video korunur.

- İlk parça: turnuvanın başlangıcı (varsa kapak/sezon açılışı dahil) → ilk round-summary sonu.
- Ara parçalar: önceki özet sonundan kendi özet sonuna; sonraki maçın girişi yeni parçadadır.
- Son parça: son haftanın/turun başlangıcı → tüm video sonu; son tablo, istatistik, madalya/kutlama/sezon kapanışı dahil.
- 4 takımlı lig 3 parça; 8 takımlı kupa çeyrek/yarı/final olarak3 parça; 4 takımlı kupa yarı/final olarak2 parça. Diğer takım sayılarında gerçek hafta/tur sayısı kullanılır. Japon ve penaltı turnuvaları da aynı chapter kayıtlarını kullanır. Tek maç sayfasında bölüm seçimi gizlidir.

`Competition.exportParts(c)` yalnız kayıtlı chapter sınırlarını okur. `exportSlice(c,id,speed)` yerel süreyi, `[start,end)` seslerini ve `sourceTime(t)` fonksiyonunu sağlar. Renderer’a mutlak turnuva zamanı verilir; puan tablosu/istatistikler ve fikstür yeniden kurulmaz. End anındaki taşma son kaynak örneği end−1e−7 ile engellenir. Ses at/elapsed/videoTime yerel başlangıca ve seçili hıza taşınır. VideoCore’a speed1 iletilir; ikinci bir hız çarpanı uygulanmaz.

Doğrulama:

- `competition-export-parts.cjs`: gerçek planlayıcı ve kısa test maçlarıyla54konfigürasyon/166parça; lig2–6/kupa4–8,5v5/11v11/Japon/penaltı, hızlı/normal akış, sezon kapanışı, penaltı uzatmaları ve sonuç ekranları. Bölümler bitişik, tam kapsamlı ve sonuçları değiştirmiyor. Başlangıç/bitiş ses sınırları ve1/1.7/3x kaynak eşlemesi kontrol edilir.
- `browser-competition-export-parts.cjs`: gerçek UI/planlayıcı/VideoCore ve H.264/AAC codec; **etiketli test renderer** kullanılır. Üç bölüm1.1/1.7/2.4x, iki oranda altı gerçek0.30snHD/60FPSsesli MP4 indirildi; ffprobe ve ffmpeg decode geçti. Bir bölüm tarayıcıda sona kadar oynadı. Gerçek bölüm job süreleri ve kaynak başı/sonu ayrıca doğrulanır; kodlayıcı smoke'u yalnız kısa kesittir.
- Bağımsız hız hafızası, altı ayrı kart, tam video, iptalde dosyaların korunması,4/8takım kupa menüleri, ENtur adları ve390pxmobil taşmama geçti (`browser-report.json`, `mobile-parts.png`).

Bu yeni tam çok dakikalı turnuva/bölüm videosunun fiziksel iPhone/GPU testi değildir. Kodlayıcı/teslim hattı mevcut ortaktır; tam uzun cihaz matrisi önceki T-317/T-325/T-328 kapsamındadır. Hostinger yayını yapılmadı.

## T-385 / Ayak tenisi

İki saha boyutunda (1v1/2v2 12.8m; 3v3 18m) ortak PBR zemin, ince kontrast sınırlar, 12cm gözlü antialias file, beyaz bant/direkler. File altı 8cm. Gerçek top küresi ıslak/kuru BallAero adımının ardından süpürülmüş temasla karşılanır; yüksek hızda merkez fileyi geçmeden temas bulunur. File üstü/kenarından gerçekten geçen top serbesttir; file üstünden RNG ile karşı tarafa taşıma kaldırıldı. File hızına bağlı sönümlü yerel esneme ve kısa temas halkası aynı kayıtlı lastNet noktasını kullanır.

- `footvolley-net.cjs`: 3 oyuncu sayısı×2 yön×3 hız×3 yükseklik, mesh yansıması/sönüm, üstten/dıştan geçiş, 6 gerçek maçta20temas, deterministik esneme ve seek. `footvolley.cjs` dokuz karışık maç/set ve tekrar determinismi geçti.
- `browser-footvolley-net.cjs`: gerçek stüdyo/maç/Three sahnesinde12.8m(seed2) ve18m(seed1), ikisinde PBR+gerçek file olayı+esneme+geri sarma eşitliği. JS/GL hata0. `footvolley-browser-report.json` ve `footvolley-1.png`/`footvolley-3.png`. Test fixture'ı temas göstermek için mevcut seed'lerden temas içereni seçer; üretim kodunda seed filtrelemesi yoktur.

## T-386 / 11v11 bitiriş

Net açık açı algısı normal kalede merkez16.5m içinde erken çalışır; arkadaki savunmacı şutu tek başına ertelemez. Sahip finişör hedefe kadar sürmeyi bırakır. Kaynak SHOT sözleşmesi korunur; yalnız hareketsiz hazırlık aralığı sunum zamanından çıkarılıp kısa kontrol/vuruş bırakılır. Oyuncuların konumları/taşıdıkları top, geçişte sıçramaz; normal hareket hızı değiştirilmez. Kaleci ek rush'u hücumcuyu geçmez. Yakın boş kale için yayımlanmış nonGoal'u yapay auta/yükseğe vurarak gerçekleştirme reddedilir; mevcut skor koruyan koreografi recovery kullanılır.

- `normal-finishing.cjs`: önden/arkadan baskı, boş kale/açık14.5m açı, kaleci mesafe sınırı, 2.5m boş kale için fiziksel nonGoal üretimi, üç GS/Aston Villa fixture'ında6erken vuruş ve24fiziksel şut; kısa görünür hazırlık, kök/top geçiş sürekliliği, yayımlanmış skor korunumu.
- Ayrı öncesi/sonrası audit: dört GS/Aston Villa seed'i1/2/3/7, toplam32şut. En yakın başlangıç4.998m→7.763m; gol dakika/aktörleri aynı. `finishing-baseline.json` / `finishing-after.json`. Denetim son başlangıç-açısı ve kaynak-zaman sağlamlaştırmalarından sonra yeniden çalıştırıldı.
- Kullanıcının özgün Jackson videosunun seed/replay'i elde değil; bire bir o kaydı yeniden ürettik iddiası yok. Oyuncu adına özel hile veya zorunlu gol eklenmedi.

## Son regresyon durumu

66/66 PASS (`full-summary.json`, ilk football-fixes hatasından sonra gerçek --failed tekrar). Başlangıçta açık fırsatın reddi üretim kodunda düzeltildi; mevcut test gevşetilmedi. Bu değişiklikten sonra etkilenen competition-kits/frames/competition/free-football/teamwork yeniden geçti (`targeted-summary.json`). Normal bitirişin son boş kale ve top geçişi testleri `normal-finishing.log`, mevcut25eleme/120boş kale testi `football-fixes.log`. Son gerçek11v11üç kare `normal-browser-report.json`/`normal-finish-0..2.png` (JS/GL0). Bu ham görüntüler HUD eklenmeden paylaşılan sahne çizimidir.
