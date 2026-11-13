# V174 — AAC düzeltmesi ve tam maç videosu

2026-11-13 UTC · Codex · temel main `29201ad` · çalışma dalı `agent/codex/aac-video-finish`.

## Sorun ve düzeltme

V173'te Chromium native AAC kodlayamıyordu. `MediaRecorder.isTypeSupported('audio/mp4')` tek başına AAC garantisi değildi. `video-core.js`, native AAC veya açık AAC-recorder MIME desteği yoksa yerel `@mediabunny/aac-encoder@1.65.2` paketini tembel yükler. İstenen sesin AAC izi, kodeği ve tam süresi mux sonunda doğrulanır; ses kaybı başarı sayılmaz. Native AAC kullanan tarayıcı ek paketi indirmez. Açık native AAC-recorder yolu eski Safari için korunur. Medya dış servise gönderilmez.

Mevcut `SEKME_LITE_RENDER` yolunda high gölgelerinin açık kalması da düzeltildi: hafif yolda shadows=false, shadowSize512, tufts0. Normal high profili aynı kalır. Çıktı çözünürlüğü/FPS, gerçek oyun süresi, saha, forma ve oyuncu modelleri değişmez. Geçici farklı sahne/kalabalık deneyleri yarar sağlamadığı için geri alındı.

## Yeniden üretme

- Node/PHP: `node tests/run-all.cjs`; ek hedefli `node tests/audio-export.cjs` ve `node tests/graphics.cjs`.
- Gerçek AAC kısa entegrasyon: `NEXT90_TEST_NODE_MODULES=/external/node_modules node tests/browser-aac.cjs /tmp/aac-proof`.
- Tam maç: Xvfb/display altında `NEXT90_TEST_ANGLE=gl NEXT90_TEST_NODE_MODULES=/external/node_modules node tests/browser-full-match.cjs /tmp/full-match-proof`.
- Yazılım Mesa koşulu: `LIBGL_ALWAYS_SOFTWARE=1 GALLIUM_DRIVER=llvmpipe LP_NUM_THREADS=2`; Electron argümanları `--use-gl=angle --use-angle=gl --ignore-gpu-blocklist --disable-gpu-sandbox`. Ortamına uygun DISPLAY/LD_LIBRARY_PATH ayrıca ayarlanır. Electron33.4.11 ve Playwright dış geliştirme bağımlılıklarıdır, siteye eklenmez.
- Tam test gerçek `japon-kale.html?mode=small` arayüzünden 30sn5v5 hazırlar; 4,5sn sonuçla34,5sn, seed1,4şut ve2070gerçek1080×1920/60FPSkaresi. Süre kesilmez, kare tekrarıyla doldurulmaz. Aynı maç gerçekUI iptal→yeniden hazırlama→download→kodlanmış videoda ileri/geri→normal hızda ses açık ended kontrollerinden geçirilir.
- Yerel PHP yanıtları ve dış ağ istekleri harness içinde izole edilmiştir. Canlı bülten/veri sağlayıcı testi değildir.
- Fiziksel cihaz yok: Linux x86_64, Chromium130, Mesa llvmpipe yazılım GPU. Android kullanıcı ajanı emülasyonu fiziksel Android/Windows/iPhone doğrulaması değildir.

## Kanıtlar

Tam paket37/37PASS (`tests/summary.json`). Son native-recorder guard ve hafif gölge düzeltmesi ayrıca hedefli testlerle PASS.

1snAACentegrasyonu: nativeBefore=false, software-aac, audioVerified=true, JSerror0. ffprobe H.2641080×1920/60FPS/1sn +AAC48kHzmono/1,002667sn; ffmpeg max_volume−27,2dB (sıfır olmayan ses). Bu dosya uygulamanın kendi ses hattından çıkar; sonradan FFmpeg ile ses eklenmez.

Tam maç **PASS**: gerçek3D34,5sn/2070kare, H.2641080×1920/60FPS +AAC48kHzmono34,517333sn, audioVerified=true, audioOmitted=false,69.507.448bayt. UIiptal/yeniden hazırlama, gerçekindirme, dörtileri/geri arama ve playbackRate1/muted=false/ended PASS; JSerror0. Yerel yazılım GPU oynatmada1710video-frame-callbackbildirdi; bu fiziksel cihazda60FPSperformans garantisi değildir. ffprobe2070kare, ffmpeg tümvideo/sesdecodehatasız; ses mean−30,6dB/max−7,7dB. 12.snkaresi görsel olarak da incelendi.

İlk tam kodlama2070kareyi veAACizini başarıyla tamamladı; Playwright'ın Electron `download` olayı gelmeyince harness zaman aşımına uğradı. Aynı tamamlanmış dosya OPFS'ten korundu, SHA-256 `df7c2e1239cff1c4a1035b377d172a91e3d5b731cf44cc35f1f0f6dfc8d59492`. Teslim/oynatma adımı `NEXT90_RESUME_VIDEO=/path/to/encoded-full-match.mp4` ile aynı dosyadan yeniden yürütüldü; bu ikinci bir render değildir. Uygulamanın gerçekexportsonucu/bağlantı atama/indirme handler'ı çalışır, native Electron session `will-download` completed olayı69.507.448baytı doğrular. İndirilen dosyanın SHA-256'sı birebir aynıdır. MP4fetchile taşımadaki harness sorunu dosya girdisiyle giderildi; ürünün video/ses verisi değiştirilmedi. Sonradan ses ekleme veya eksik kareyi kopyalama yok.

Kalıcı makine kanıtı: [v174-full-video-validation.json](v174-full-video-validation.json). Büyük MP4/screenshotlar repoya eklenmedi; oturum artefaktlarında tutulur.

V173'ün76,9snpenaltı denemesi tarihsel olarak tamamlanmamıştır; [eski rapor](FULL-VIDEO-TEST-V173.md) olduğu gibi korunur. Buradaki tam5v5maçı farklı bir uçtan uca senaryodur. Fiziksel cihaz testleri ayrıca açıktır. Canlı Hostinger dağıtımı veya Windowsinstaller yayını yapılmadı.
