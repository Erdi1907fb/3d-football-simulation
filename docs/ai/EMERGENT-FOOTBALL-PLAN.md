# Taktik zekâ ve doğal futbol — uygulama kaydı

Başlangıç: V174 / `46b9720`. Kaynak web: `Erdi1907fb/3d-football-simulation`; Windows: `Erdi1907fb/Yeni-Video`. Kullanıcının yeni isteği iki repoda mevcut altyapıyı geliştirmeyi yetkilendiriyor; önceki web/Windows ayrımı silinmez, kaynak web kopyası yalnız sync aracıyla taşınır.

| Aşama | İş | Durum | Kanıt |
|---|---|---|---|
| 1 / T-294 | Mevcut kod, modlar ve tüm belirtilen kaynakların lisans/veri envanteri | done | V174 baseline worktree; research/ |
| 2 / T-295 | Saha kontrolü, blok/markaj/geçiş ve takım hedefleri | partial | Gerçek gözlemler, değişken dizilişler |
| 3 / T-296 | Karakter, bağımsız seed akışları, anlamlı seçeneklerden olasılıksal karar | done (çekirdek) | Aynı seed tekrar; özellik müdahalesi testleri |
| 4 / T-297 | Denge/atalet, uygulama kalitesi ve gerçek temas | partial | Önceki ortak fizik ve animasyon yolu |
| 5 / T-298 | Nedensel hata, serbest top ve kaleci dağıtımı | done (çekirdek) | Sonuç/hata kotası yok |
| 6 / T-299 | Normal, küçük saha, çok kale, penaltı ve frikik adaptörleri | partial | Her modun kuralları korunur |
| 7 / T-300 | Serbest/analize bağlı kipler ve gerçekleşmiş olaydan özet seçimi | partial | Analiz skoruna fiziksel aday doğrulama; açık hata kaydı |
| 8 / T-301 | Aynı koşullarda eski/yeni, çok tohum, görsel ve performans doğrulama | partial (yerel testler tamam) | 42 test, 200 karşılaştırmalı arena, 8 kompakt 11v11, gerçek 3D ve kısa MP4; kalibrasyon/GPU açık |
| Windows / T-302 | Kaynak web senkronizasyonu, köprü/paket/CI uyumu | done (ek uyumluluk) | build-20 / Actions43476769057 success; fizikselGPU ayrı |

Her aşamada çalışan kod ve test kaydı güncellenir. Kaynak veriler runtime'a konmaz. Eğitim referansı, açık kaynak kod ve kısıtlı veri ayrı değerlendirilir. Fiziksel cihaz veya tam maç denenmediyse yapılmış sayılmaz.

## Tamamlanan kod ve açık sınırlar

T-303ek isteği: gol→yeniden başlama arasında durdurulan maç saati ve güvenli HUD bandında gerçek golcü adı/fotoğraf/logo kartı eklendi; hedefli ve tarayıcı kontrolleri var. Bütün sekiz aşamayı eksiksiz tamamlandı saymayın. Kısa serbest11v11tam90dakika değildir; yeni alan2v2/3v3 seçici, FKpasları, tamrigbodypose ve büyük veriyle öğrenilmiş xT/VAEP henüz yok. Mevcut2v2stüdyo düelloları korunur. Gerçek cihaz/GPU deneyi ayrı. Kaynak dosya ve eski/yeni ölçümler research/ altında; ilk100lü ölçümde gerilemeler de vardır.

Kullanıcının son netleştirmesi: **asıl ürün Hostinger web sitesidir**. Yeni futbol geliştirmeleri tarayıcı JS ve mevcut PHP akışına uygulanır; Windows kontrolleri ek uyumluluktur. Hostinger runtime'ına C++/EXE/Python bağımlılığı eklenmedi.
