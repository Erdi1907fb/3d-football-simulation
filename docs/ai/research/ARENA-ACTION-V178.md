# V178 — Doğal arena aksiyonu

2026-11-14 UTC · Codex · T-314

## İstek ve uygulama

Japon Kale ve 5v5 daha çok hücum ve şut denemesi üretmeli. Kullanıcının son netleştirmesi **kale önüne yığılma değildir**: orta saha/uzak şutlar, kombinasyonlar, koşular ve yakın bitirişler birlikte bulunmalı. Normal 11v11 tahmin ve analiz yolu korunur.

Arena varsayılanı `actionIntensity=1` oldu:

- Mevcut takım tarzının üstüne sınırlı tempo, doğrudanlık ve daha kısa karar aralığı uygulanır. Tempo artışı en çok %8, toplam çarpan en çok 1.2. Takım karakteri korunur; bunlar doğrulanmış gerçek kulüp taktikleri değil, etiketli sentetik koçluk öncülleridir.
- Güvenli ileri pas, ara pas, destek koşusu ve açık koridorda şut tercihleri güçlenir. Sadece yakın şutlara ağırlık verilmez: saha ölçeğine göre 16–23 m mesafeden deneme mümkündür. Mesafe, açı, baskı ve teknik risk ağırlıkları sürer.
- Yakın taşıyıcı, eski 3.3 m şut kanalına geriye dönmez; fiziksel kale çizgisinin önünde ilerleme hedefi alır. Mevcut açık kale bitiriş filtresi devam eder.
- Kaleci rutin kontrolünden sonra daha hızlı dağıtır. Hareket ivmesi/dönüşü, vuruş hazırlığı, gerçek top yolu, temas, kaleci becerisi ve kurtarış fiziği korunur.

Gol/direk/şut sayısı zorunluluğu, rastgele gol komutu veya uygun skor/seed seçimi eklenmedi. API'deki `0` karşılaştırma içindir; yeni bir UI bilgi bandı eklenmedi.

## Aynı başlangıç koşullarında A/B

```sh
NEXT90_ACTION_BASELINE=/workspace/football-camera-v177/assets/japon-engine.js \
NEXT90_ACTION_SEEDS=1907,2026,81,991,177,54321,314,2718 \
node tools/validate-arena-action.cjs /workspace/artifacts/v178-action-final-ab.json
```

Eski kaynak V177 (oynanış V176), yeni kaynak V178. Mevcut kadro JSON'undan aynı takımlar, her çiftte aynı seed ve 60 oyun saniyesi kullanıldı. 2/3/4/6 takım × 8 seed = 32 çift, **64 gerçek simülasyon**. Hiçbir sonuç elenmedi. Ham kayıt: [ab-32-pairs.json](v178-arena-action/ab-32-pairs.json).

| 60 oyun saniyesi başına ortalama | Eski | Yeni |
|---|---:|---:|
| Şut denemesi | 5.94 | 7.59 |
| Uzak şut (≥12 m; mesafesi kayıtlı denemeler) | 1.38 | 2.59 |
| Pas | 15.00 | 16.16 |
| Tamamlanan pas (sonraki gerçek alım) | 10.22 | 11.38 |
| Kurtarış/tutuş | 3.63 | 4.59 |
| Gol | 1.69 | 1.69 |
| Direk | 0.31 | 0.13 |
| Top sahibinin rakip kaleye 8 m içinde geçirdiği süre | 3.90 sn | 3.39 sn |

Şut +%27.9, uzak şut +%88.6, kurtarış +%26.7. Son satır hedef metrik değildir; amaç kale önünde daha çok zaman geçirmek değil, farklı mesafelerden aksiyon üretmek. Gol ortalaması sabit kaldı; direk sayısı artmadı. Sonuçları bütün olay türlerinde ve her seed'de artış diye sunma.

5v5 tek başına ortalama 3.38→4.63 şut, 0.50→1.38 uzak şut ve 14.00→16.75 tamamlanan pas üretti. Seed 1907 maçı yine 0–0 bitti ama 2 yerine 6 şut gerçekleşti. Altı takımda şut 5.25→6.88 ve kurtarış 3.13→5.13 iken gol 1.50→0.50 oldu. Her modda gol artışı **yok**; bu küçük örneklem bir gol garantisi veya gerçek maç verisiyle tamamlanmış kalibrasyon değildir. Sonuçlar mevcut ownGoal/son temas muhasebesini kullanır; bu değişiklik o muhasebeyi yeniden yazmaz.

## Regresyon ve görüntü

- `node tests/arena-action.cjs`: PASS. 3.100 karar örneği; yakın/açık/uzak/kale arkası sınırları; pas ve taşıma çeşitliliği; 8 gerçek kısa maç; aynı seed ile yeniden üretim; sonlu top yolu ve başarısız denemeler. 20 m fikstüründe 1.000 seed'in 64'ünde uzak şut seçildi; zorunlu hareket yok.
- Koçluk testi, iki gerçek simülasyonun kozmetik takım renkleri değiştiğinde aynı tarz ve olayları ürettiğini karşılaştırır. Eleme geometri fikstürü, kesintili orijinal takım kimliklerini gerçekten üreten seed 2 ile tutulur. Yakın taşıma testi hem geriye dönmemeyi hem kale çizgisinin önünde kalmayı doğrular.
- Saat testi yeni tohumlarda küçük sahada gol çıkarmayan örneklem nedeniyle kapsam kontrolünde kaldı. Eski tohumlar korunup gerçek gol/restart üreten seed 1 eklendi. Bir koşuda üç PHP `spawnSync` çağrısı EPERM verdi; ayrı PHP kontrolleri geçti. Yayın paketi ayrıca yeniden çalıştırıldı; nihai sonuç HANDOFF ve `tests/summary.json` içindedir.
- Son kaynakta gerçek WebGL ile 2/4 takım × dikey/yatay dört görüntü geçti, sayfa hatası yok: [render-report.json](v178-arena-action/render-report.json). Ortam Mesa/llvmpipe yazılım GPU'su ve 2 CPU'dur. Fiziksel telefon/GPU veya gerçek zamanlı 60 FPS performans testi değildir.
- Eski V177 ve yeni V178, aynı seed 5 ve arayüz kadrolarıyla iki gerçek 4 sn / 1080×1920 / 60 FPS / H.264 / 240 kare MP4 üretti. ffprobe ve ffmpeg dekodu geçti; her dosyadan alınan beş örnek kare farklıdır. Bu sessiz kısa klipler tam maç/sesli export testi değildir. Kanıt: [clip-validation.json](v178-arena-action/clip-validation.json).
- **Yerel Electron native indirme olayı iki denemede 240 sn bekleme sonunda gelmedi; bu test başarısızdır.** Arayüz video hazır ve oynatılabilir durumdaydı. Üretilen dosyalar değiştirilmeden test profilinin geçici File System alanından alındı. Bunu başarılı native indirme veya Hostinger Chrome/iPhone indirme testi olarak sunma. Takip: T-315. Gelecek harness denemesinde bekleme 15 sn ile sınırlı, alternatif blob kaydı ve indirme olayı ayrı raporlanır.

## Açık işler ve teslim sınırı

T-313 Touchline kamera V177'den korunur. T-312'nin penaltı çizgi/sonuç alt işi ayrıca [PENALTY-GOAL-V178](PENALTY-GOAL-V178.md) ile tamamlandı. El/ayak animasyonu, 11v11 ilerleme, gelişmiş güvenli kaleci dağıtımı/alım/zemin, VAR değişikliği ve seçilen süre/limit içinde eleme taslağının bütünü **tamamlanmadı**. Ayrı `agent/codex/web-football-v177` @f3aa2a4 kaynağını kaybetme ve topluca main'e birleştirme. Yeni V178 ağırlıkları, tempo ve bayraklarla kontrollü birleştirilmeli. V176'nın mevcut uzatma davranışı kullanıcının yeni 60/75/90 içinde bitirme talebini karşılamaz; D-042/T-312 açık kalır.

Canlı Hostinger son salt okunur kontrolde V176/filesMatch=true. Bu oturumda sunucuya yükleme yapılmadı. V176→V178 web fark paketi 501 manifest dosyası karşılaştırılarak hazırlanır; config, veri, kadro, forma, yüz veya videolar pakete eklenmez.
