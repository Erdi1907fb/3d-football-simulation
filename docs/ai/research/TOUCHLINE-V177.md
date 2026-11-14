# V177 · Touchline güvenli kadraj · 2026-11-14 UTC

## Problem ve değişiklik

5v5dikey Touchline görüntüsünde yakın kale skor bandının arkasında kalıyordu. Eski yönetmen yalnız topun7metre yaklaştığı hedef kaleyi koruyordu. Mevcut `frame.layout.goals` içindeki bütün canlı kalelerin ağız, taban, üst ve ağ derinliği köşeleri artık Touchline izleme zarfında. Eksen(1,.72,.35), öngörülü zoom/yumuşatma, kayıt/geri sarma yolu korunur. Elenen kale eski geometriden taşınmaz; karedeki güncel saha kullanılır.

Dikey aksiyon:x64–884/y295–1220; skor/kimlik:x30–909/y1296–1518. Yatay aksiyon:x70–1850/y55–795, HUD:y830–1052. Kale çerçeveleri HUD'dan önce biter. Finalin mevcut kısa yakın planı korunur.

## Doğrulama

- `node tests/touchline-safe.cjs`:PASS;2–6takım×dikey/yatay,1210kare,38720kale köşesi. Aynı eğik eksen, kesintisiz takipte sıçrama yok, tekrar aramada aynı matris ve mevcut güvenli HUD bandı.
- `tests/browser-touchline.cjs /workspace/artifacts/v177-touchline-release`:PASS; gerçek Chromium/ElectronWebGL,2ve4takım,1080×1920ve1920×1080;4tam görüntü, kale izdüşümleri ve sıfır sayfa hatası. Ortam:`DISPLAY=:112`,Mesa/llvmpipe,ANGLEgl,2CPU. Bu fiziksel telefon/GPU testi değildir.
- Kanıt:[rapor](v177-touchline/report.json),[5v5dikey](v177-touchline/touchline-2-portrait.png),[Japon Kale dikey](v177-touchline/touchline-4-portrait.png). İki yatay kare yerelartifact klasöründe; harness yeniden üretir.
- `PATH=/workspace/deps/web-tools:$PATH php build.php`:build177/filesMatch=true,501dosya.
- `PATH=/workspace/deps/web-tools:$PATH node tests/run-all.cjs`:**44/44PASS**, `tests/summary.json`. Kamera önizleme ve MP4 aynı draw yolundadır; yeni tam MP4 kodlama/gerçek cihaz testi bu kamera değişikliğinde tekrarlanmadı.

## Kapsam / açık işler

Bu V177kamera düzeltmesidir. T-312penaltı/kaleci/fizik/VARve seçilen süre içinde biten eleme taslakları ayrı `agent/codex/web-football-v177` @f3aa2a4dalında; main'e alınmadı. Taslakta60sn/5–6takım/limit2tam eleme üretilemiyor, bütünleşme testleri de tamamlanmadı. Kullanıcının uzatma/limit düşürme istemediği(D-042)açık kaydedildi. T-314yüksek doğal aksiyon ayrıV178çalışmasıdır.

CanlıHostinger salt-okuma kontrolü:build176/filesMatch=true. V177ZIP,public_htmlüzerine dosyalar korunarak açılmak üzere hazırlanır;config.php/veri/kadrolar/yüzler/formalar veya videolar pakete dahil edilmez. Bu oturumdan Hostinger'a yükleme yapılmadı.
