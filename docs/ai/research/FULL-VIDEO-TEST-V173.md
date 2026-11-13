# V173 — tam süreli sesli video doğrulaması (2026-11-13)

## Sonuç: tamamlanmadı / başarılı sayılmadı

Temel kod: `ed30b08e5ad66a4d502006fda1a85d35c15308e3`.
Ürün kodu değiştirilmedi; bu kayıt yalnız test bulgusu ve devam noktasıdır.
V173'ün önceki 0,3 saniyelik sessiz testleri bu tam süreli sesli testin yerine geçmez.

## Gerçek test koşulları

- Yerel Electron 33.4.11 / Chromium 130, Linux x86_64, SwiftShader; fiziksel GPU, Windows veya telefon yok.
- Android kullanıcı ajanı emülasyonu, uygulamanın mevcut SAFE_EXPORT/balanced yolu. İkinci denemede mevcut SEKME_LITE_RENDER uyumluluk bayrağı da kullanıldı; 3D fallback=false.
- Gerçek penalty.html arayüzü, ses kutusu açık, otomatik kodlayıcı, 1080×1920 / 60 FPS. SekmeVideo.create çağrısı izlenerek gerçek çizim sayısı kaydedildi; süre kısaltılmadı veya aynı karelerle doldurulmadı.
- Tam seri: seed=644476497, 14 vuruş, 76,9 saniye, skor 4–3; beklenen 4614 kare.

## Doğrulananlar

- Gerçek arayüzde export'u başlatıp en az iki çizimden sonra iptal etmek ve aynı seriyi tekrar başlatmak geçti.
- Gerçek job withAudio=true, quality=1080, fps=60, canvas1080×1920, 42ses/olay kaydı taşıyordu.
- Mediabunny.canEncodeAudio('aac',48kHz/mono/192kbps)=false.
- MediaRecorder audio/mp4 ve video/mp4 desteği bildiriyordu; açık mp4a.40.2 AAC MIME desteği listede yoktu.
- Uygulamanın kendi SekmeVideo.recordedAudio yolu ayrıca 1 saniyelik gerçek testte AudioContext.state=running iken **AAC audio unavailable** döndürdü. Bu yalnız AudioContext'in başlatılamaması değildir. audio/mp4 desteği tek başına AAC çıktısını garanti etmiyor.
- İlk ağır 3D denemesinde iptal edilen işler 2 ve 25 gerçek kareye kadar ilerledi; tamamlanmış dosya değildir. Lite denemesinin yalnız başlatma/iptal/tekrar başlatma bilgileri kesinleşti.

## Tamamlanmayanlar

Çalışma ortamının exec-server bağlantısı koptu; tekrar bağlantı denemesi recovery timed out verdi, ortam kullanıcı bağlamında unavailable ve durum aracında connectivity=offline oldu. Son çalışan test sürecinin daha sonra ne ürettiği okunamadı.

Bu nedenle tam 4614karenin kodlanması, AAC ses izi, dosyanın gerçek UI download olayıyla kaydedilmesi, sonuna kadar normal hızda oynatılması ve kodlanmış dosyada ileri/geri arama **PASS değildir; sonuç bilinmiyor/tamamlanmadı**. Tam MP4 üretildi veya sesli oynadı diye raporlanamaz.

Kaynak incelemesi: video-core serialEncode, recordedAudio başarısızlığında audioDisabled=true ile devam edebiliyor; P UI bu isteğe onAudioOmitted işleyicisi vermiyor. Tamamlanmış dosya olmadığı için “arayüz sessiz dosyaya hazır dedi” olayı doğrudan gözlenmiş sayılmadı. Sessiz başarı ihtimali ayrı incelenmeli; istenen sesin kaybolması başarı kabul edilmemeli.

## Kaldığı yerden devam

1. Yeni/erişilebilir ortamda en güncel main ve HANDOFF okunur. Yerel `agent/codex/full-match-video-validation` dalında `tests/browser-full-video.cjs` taslağı vardı; ortam kapanmadan commit/push edilmedi. GitHub'da yayımlanmış bir test dosyası olarak varsayılmamalı.
2. Önce 1sn recordedAudio / gerçek çıktı codec'i ve AAC kapasitesi doğrulanır. Platform AAC üretemiyorsa tam ses testini sahte ses izi, sessiz sonuç veya sonradan FFmpeg eklenmiş sesle PASS yapma.
3. Önceki `tests/browser-video.cjs` yalnız kısa sessiz testtir. Tam test, UI export → iptal → yeniden export → download.saveAs → video/audio süre/boyut/kare kontrolü → ileri/geri → playbackRate=1/muted=false/ended kontrolünü içermeli.
4. Tam sesli dosyayı ffprobe ve ffmpeg ile ayrıca çöz:1080×1920/60FPS/4614video karesi, yaklaşık76,9snvideo+ses, gerçek/sıfır olmayan ses ve tam decode. Bunlar bu oturumda yapılamadı.
5. Gerçek Windows/iPhone/Android ayrıca denenmeli. Kullanıcı ajanı emülasyonu fiziksel cihaz kanıtı değildir.
6. Ortam geri gelirse yerel günlükler: /workspace/artifacts/web-v173-full-video*.log ve web-v173-audio-probe.json. Başka ajanda bu yerel dosyaların bulunacağı garanti edilmez; yukarıdaki konsol gözlemleri kalıcı kayıttır.

T-290 kısmi kalır. T-292 tam test çalışması ortam nedeniyle blocked. V173 sürümü, oyun/AI kodu ve canlı Hostinger yayını değiştirilmedi.
