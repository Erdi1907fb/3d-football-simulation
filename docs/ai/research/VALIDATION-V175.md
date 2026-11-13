# V175 doğrulama ve sınırlar

2026-11-13 UTC. TemelV174 `46b9720`; yeni ortak JS çekirdeği. Fiziksel Windows/GPU/iPhone/Android testi yapılmış sayılmaz.

## Kullanıcının ek isteği: saat ve golcü kartı

Japon Kale ve iki takımlı5v5küçük sahada golden yeniden başlatmaya kadar **oyun saati durur**, fizik/video saati devam eder. Küçük sahada yiyen takımın gerçek santra pası, Japon Kale'de merkezden top oyuna girdikten sonraki sahiplik saati açar. Sonuç/yerleşme süresi videoda kalır. Eleme erken biterse kalan süre sıfırlanmaz.

`node tests/arena-clock.cjs`: iki/dört takım,60 sn×6 seed; son kodda10 gerçek gol-restart aralığı (4 küçük saha,6 çok kale), sabit saat/yeniden çalışma, kendi kalesine golde gerçek aktör, serbest oyuncuda sahte takım logosu yok, geri sarma PASS.

[Gerçek tarayıcı kaydı](v175-clock-browser.json): gerçek katalog/Fenerbahçe–Galatasaray,seed 5,60 snoyun;70.191667 sn canlı+4.5 sn sonuç=74.691667 sn video. Guendouzi golü28.758333 sn; santra33.641667 sn; sayaç arada0:32 sabit. Dört taraflı seed 5'te Yamal golü ve Barcelona arması, EN arayüz;60 sngerçek oyun,71.586679 sn toplam video. Fotoğraflar mevcut doğrulanmış portre manifestinden; olmayan fotoğraf uydurulmaz.

[TRdikey gol kartı](v175-examples/goal-2-tr.png) · [ENyatay çok kale kartı](v175-examples/goal-4-en-landscape.png).

## Kod ve tarayıcı regresyonu

- `PATH=/workspace/deps/web-tools:$PATH node tests/run-all.cjs`: **42/42 PASS**, PHPdahil. Son pas nişanı/hız eşleme ve son saat düzeltmesinin ardından `arena-football`, `arena-clock`, `teamwork`, `commentary` hedefli testleri ayrıcaPASS. `tests/summary.json` son tam koşudur; bütün testlerin her ara değişiklikten sonra yeniden koşulduğu iddia edilmez.
- `tests/natural-studios.cjs`:100 doğal penaltı serisi/1058 vuruş+166 FK;12 teknik, nedensel fizik, sonuca göre yeniden örnekleme yok. Bu frekanslar gerçek maç kalibrasyonu/başarı kotası değildir.
- `tests/free-football.cjs`:30 sngerçek22 oyuncu; hedef9-8yerine0-0 ve rmek aynı olayları/skoru üretir; farklı seed kararları değiştirir, geri sarma değişmez.
- [Kompakt serbest UI](v175-free-browser.json): mevcut konsept menüsünden geçiş,22 oyuncu, recipe/arama PASS. Zorlanmış AACönkontrol hatasında export hazırlığı0 ve hazır sonuçgizli: sessiz başarı yok.
- Gerçek Electron33/Mesa llvmpipe kullanıldı; üretim sahnesi çizildi. Düşük kalite/uyumluluk profili fiziksel yüksek kaliteGPUtesti değildir. P/FK/normal ve2/3/6taraflı örnekler `v175-all-modes-browser.json` dosyasında.

## MP4

Son gol kartının **0.2 sn test kesiti**, her yönde12 gerçek1080p60kare: [ffprobe/decode/ses](v175-mp4-probes.json). Dikey1080×1920, yatay1920×1080,H.264+48kHzAAC; tümü ffmpeg ile hatasız çözüldü, ses max−26.9dB. Bu kısa test tam74.69snvideonun yeniden kodlandığı anlamına gelmez. ÖncekiV174 tam 34.5 sn/2070 kare sesli1080pvideo kanıtı tarihsel olarak korunur (`FULL-VIDEO-TEST-V174.md`).

Yeniden üretim: `NEXT90_TEST_NODE_MODULES=<Electron/Playwright node_modules> NEXT90_CLOCK_SECONDS=60 NEXT90_CLOCK_EXPORT=1 node tests/browser-arena-clock.cjs <output>`. DISPLAY ve çalışanWebGLortamı gerekir. `NEXT90_TEST_ANGLE=gl` bu ortamdaMesa'yı seçti.

## Aynı koşullarda100 eski+100 yeni arena

`node tools/compare-emergent.cjs --baseline <V174checkout> --samples 100 --out report.json`. İlk eski ölçümü tekrarlamadan kullanmak için `--baseline-report docs/ai/research/v175-comparison-initial.json`. Aynı kimlik/puan/takım sayısı/seçili30 snsüre/seed1001–1025. Yeni saat gol beklemesini dışladığından gerçek duvar süresi farklıdır; ham sayılar yalnız AIkazancı sayılamaz. Alım metriği sonraki3 sniçinde takım dokunuşu proxy'sidir, resmî pas isabeti değildir.

| Taraf | Pas eski → yeni | Alım proxy eski → yeni | Yakın çift oranı farkı | Hazırlama medyan oranı |
|---|---|---|---|---|
| 2 | 144 → 249 | 81.2% → 75.5% | +0.0028 | 1.54× |
| 3 | 100 → 130 | 51.0% → 43.9% | -0.0065 | 1.36× |
| 4 | 105 → 142 | 59.1% → 50.7% | -0.0001 | 1.33× |
| 6 | 125 → 127 | 66.4% → 58.3% | +0.0014 | 1.45× |

[Ham maçlar/mesafe dağılımları/şut tipleri](v175-comparison.json). Yakın çift oranında eksi daha az kalabalıklaşmadır. CPUtestler/tarayıcıyla paylaşıldı; oranlar donanımFPSölçümü değildir. Daha çok pasın yanında alım proxy'si geriliyor; iki modda yakınlaşma azalırken ikisinde artıyor. Bu sürüme tüm alanlarda üstün denmez. T-304kalibrasyon açık; gole/hata sayısına kota ekleyerek “düzeltmeyin”.

Her iki motor da mod başına25/25 ayrı olay ve konum hash'i üretiyor; bu yeni motorun görsel tekrarları tüm maçlarda azalttığını kanıtlamaz. [Aynı başlangıç/seed görsel kaydı](v175-visual-comparison.json), [eski ilk pas](v175-examples/v174-first-pass.png), [yeni ilk pas](v175-examples/v175-first-pass.png): aksiyon türlerine ait zamanlar farklı, görüntüler tek bir koreografi değildir. Altı gerçek görüntü incelendi; tekil kareler geniş video incelemesinin yerine geçmez.

`node tools/measure-intelligence.cjs --baseline <V174checkout> --out report.json`: [Normal analiz/P/FK/arena karşılaştırması](v175-intelligence-metrics.json). Aynı normal maçların yayınlanmış gol defterleri değişmedi; programatik eski P/FKAPI yolu uyumluluk için korunur, yeni doğal UIyolu ayrıca test edilmiştir.

## Kaynaklar ve açık işler

[Kaynak/lisans envanteri](EMERGENT-SOURCES-V175.md), [örneklem istatistikleri](v175-reference-statistics.json), [indirme/hash manifesti](v175-reference-manifest.json). StatsBombürün verisi/parametresi olarak alınmadı. BodyPose12.32sn yalnız çevrimdışı küçük diz açısı prototipi, hazır animasyon/rigretarget değildir. xT/VAEP öğrenilmiş model diye sunulmaz.

Tam sekiz aşama **tamamlanmadı**. Takip: `../EMERGENT-FOOTBALL-PLAN.md`. Açık: pas/şut/takım mesafesi kalibrasyonu, bütün duran top organizasyonları ve paslı FK, alan2v2/3v3 seçicisi, tam 90dkakış, tam rig BodyPose/başarısız hareket klipleri, geniş hareketli görsel karşılaştırma ve fizikselGPU cihazlar. Windows paketi ayrı repo/CI ile doğrulanır; native C++ motor özgünlüğü korunur.

[Kompakt 11v11 örnekleri](v175-free-examples.json): mevcut katalog kadrolarıyla 4-3-3, 4-2-3-1, 4-4-2 ve 3-5-2; her biri seed 3/4. `node tools/sample-free-football.cjs` ile yeniden üretilebilir. Bunlar hipotetik dizilişlerdir; gerçek takımın doğrulanmış taktiği veya 90 dakikalık sonuç tahmini değildir. Son kodda eleme, futsal-five, arena-rush ve japon-kale testleri de yeniden geçti (1+18+25+50 örnek).


## Canlı web ile kaynak farkı

2026-11-13 18:00 UTC civarında canlı `build.php`: build170 / filesMatch=true. Kaynak main V175'e alındı; Hostinger'a dağıtılmadı. `Next90-Web-V170-to-V175.zip` (778257 bayt) yalnız değişen55yayın dosyasını içerir; V170manifesti + ZIP üzerinde501V175kod hash'i doğrulandı. Paket config.php, sunucu verileri ve videoları içermez; dosya silmez. [Paket manifesti](v175-web-update-package.json). Kullanıcı Hostinger `public_html` köküne aynı klasör yapısıyla çıkardıktan sonra `build.php` build175/filesMatch=true olmalı; canlı dağıtım başarısı bu oturumda iddia edilmez.


Ek uyumluluk: [Windows Actions43476769057](https://github.com/Erdi1907fb/Yeni-Video/actions/runs/43476769057) Node ve Windows success; W0.1.4/build-20. Kullanıcı ana hedefin **Hostinger web** olduğunu yeniden netleştirdi. Bu ek paket testi web kodunun Windows kopyası içindir; sonraki geliştirmelerin hedefi kaynak webdir.
