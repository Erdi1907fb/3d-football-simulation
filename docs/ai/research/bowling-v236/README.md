# V236 / T-387 — Futbol bowlingi ve haftalık oyuncu kapışmaları

Eğlence Arenası → Futbol Bowling (`bowling.html`); 1v1/2v2, takım veya serbest oyuncu, yıldız/ikon/efsane, forma takımı + iç/deplasman/üçüncü ve numara. Tamamı ayak tenisiyle **aynı** seçim ve VideoCore yoludur. Ayak tenisinin1v1/2v2/3v3 seçenekleri korunur. Yeni bowling salonunda orijinal ahşap kulvar, on kuka, oluklar, futbol/taktik panoları, top dönüş rafı ve yakın/darbe/geniş kameralar; sporcu/forma/yüz/top paylaşılan sistemdir. Krampon ana rengi, bağcık, yan panel ve dişler kimliğe bağlıdır; yakın9mLOD dışında ek ayrıntı kapanır.

## Dört vuruş ve puanlama

Varsayılan **taraf başına dört gerçek vuruş** (toplam8);2v2’de kişi başına2. Her seferde bir vuruş ve taraflar dönüşümlüdür. Strike10+sonraki2, spare10+sonraki1; kısa formatın sınırından sonra ek vuruş yoktur. Bu nedenle menü bu formatı tam standart bowling diye sunmaz. Kullanıcının4vuruş sınırı korunurken tam klasik matematik için ayrıca **4 frame** seçeneği vardır: son frame’in kazanılan bonusları, strike sonrası yeniden on kuka ve bonuslarda doğru kalan rack. Mükemmel dört frame120; eşit skorda beraberlik, zorunlu galip yok.

Top ortak BallAero0.11m/0.43kg.1.067m kulvar, head-pin18.288m,10adet0.381mkuka. Kayıtlı top-kuka ve kuka-kuka darbeleri, dönme/kayma, oluk ve fiziksel devrilme skor kaynağıdır. Puan/strike hedefiyle pin devrilmesi uydurulmaz. Devreden dik kukalar ikinci atışta aynı rack’tir; rack değişimi yaklaşma kamera kesmesinde yapılır. Görsel yatmış pinin profile bağlı zemin payı, mesh’in ahşaba gömülmesini önler. Salon/pin/chime sesleri özgün prosedürel PCM, ortak AAC hattına aynı olay zamanlarında girer.

## Haftanın maçı ve analiz

Maç sayfasında11v11/5v5/Penaltı yanında Ayak tenisi2v2 ve Futbol bowling2v2 vardır. Kaynak fixture id/seed, güncelXI/bench/eksikler taşınır. En teknik uygun ikili rol/nitelik/reyting profiline göre seçilir. Oyuncu değiştirilince hazır analiz geçersizleşir; **Analiz et ve hazırla** profil, tohum ve fiziksel simülasyonu yeniler. Forma/numara sonuç tohumundan bağımsızdır. Eksik/null sağlayıcı alanı bilinen kadro verisini silmez; mevcut katalogda olmayan bir takım, sağlanan geçerli11kişilik kadrosuyla kendi adı altında eklenir. Yüklenemeyen takım sessizceGS/FB olmaz. Ana11v11 analizi/goalLedger ve PHP veri akışı değişmez.

Yüzdeler **eğlence modeli** olarak açıkça etiketlidir. Açık oyuncu nitelikleri varsa kullanılır; yoksa mevcut rol öncülleri ve kadro reytingi. Gerçek bowling/futnet başarısına kalibre edilmiş tahmin iddiası yok. Bu profil futnet hata payını ve bowling hedef/hız/isabetini gerçekten etkiler; yalnız etiket/sonuç kartı değişmez.

## Kanıt ve sınırlar

-68/68 tam Node/PHP paketi PASS (`full-summary.json`); son kapsam genişletilmiş bowling/analiz kontrolleri ayrıca PASS (`bowling-unit.log`, `duel-analysis.log`).
- `bowling.cjs`:12karışık1v1/2v2×kısa/klasik oyun ve fiziksel son-frame bonus vakası;90kısa/120klasik matematik,spare,oluk0, gerçek temasla strike10, kare/seek determinizmi, kişi başı iki vuruş, skor ve rack doğrulaması. Fiziksel küçük örneklem46pinfall/53temas; bu istatistik kalibrasyon iddiası değildir.
- `duel-analysis.cjs`: aynı kimlikler/tohumda yalnız nitelik değişince **gerçek top yolları** her iki modda değişir; model/varsayılan seçim, seed ve görsel bağımsızlık, eksik/null nitelik, mevcut/katalog dışıXI, oyuncu uygunluğu, değişmeyen kaynak veri; gerçek ortak aktörde krampon10bağcık/10diş ve LOD/kök korunumu.
- Gerçek Chromium/SwiftShader stüdyo:2v2kısa8vuruş,1v1klasik4frame, dikey vurucu/ayak/top ve geniş tümkulvar/oyuncu alanı güvenli projeksiyon; JS/GLhata0 (`studio-browser-report.json`, dörtPNG).
- Gerçek haftalık kadro verisiyle EN/embed iki stüdyo açıldı; ikili varsayılanlar, oyuncu değişiminde yeni analiz imzası/tohum, değişmeyen sessionStoragekaynağı,390px menü taşmaması (`weekly-browser-report.json`). Sekme yönlendirme/dil/currentXI/bellek bırakma/geri alma testi gerçek app.matchExtras fonksiyonunu izoleDOM’da,11v11world çağrılarını stub ederek sınar (`weekly-tabs.log`); tek başına tam ana sayfa uçtan uca3Dtesti değildir. Stüdyoların kendi gerçek3Dtestleri ayrıdır.
- Gerçek3D21kare kısa0.362667snH264/AAC1080×1920/60FPSMP4 indirildi, ffprobe/ffmpegdecode geçti (`bowling-portrait-excerpt.mp4`). **Tam uzun bowling videosunun dışa aktarımı veya fiziksel iPhone/Safari testi değildir.** T-317/T-325/T-328 ayrı açık. Kaynak GitHub paketi; Hostinger dağıtımı yapılmadı.

- Ek gerçek oyuncu modu testi: Messi–Ronaldo1v1, Messi için Fenerbahçe iç saha forması ve99numara gerçek aktöre taşındı; kitFailed=[], JS0 (`players-browser-report.json`). Son hedefli testler oluk girişinin yanal/düşey sürekliliğini de sınar; topu oluğa sabitlemek için konum sıçratılmaz.
