# Oyuncu yüzleri: Gemini önerileri ve bu proje için yol

27 Ekim 2026 değerlendirmesi.

**Ortak gövde, kişiye özel kafa/saç/doku ve ortak animasyon verisi doğru yaklaşım.** Mevcut oyun Three.js ve 53 kemikli ortak futbolcu modeli kullanıyor. Her oyuncunun pozunu ayrı tutuyor, geometri ve animasyon kaynaklarını paylaşıyoruz. Baştan 22 ayrı tam vücut GLB indirerek bunları aynı sahneye eklemek bu yapının yerine otomatik geçmez. 22 model tarayıcıyı zorunlu olarak çökertmez; toplam geometri, materyal/çizim sayısı, dokular, gölgeler ve iskelet hesabı ölçülmelidir.

Fotoğrafı doku olarak kafaya giydirmek yüzün geometrisini değiştirmez. Çene, burun, alın, kulak ve yan profil için kafa biçimi; saç için ayrı geometri gerekir. Tek portreyle görünmeyen yan/arka bölümlerin doğru olduğu iddia edilemez.

## Seçenekler

| Yöntem | Bu projedeki karşılığı |
|---|---|
| Ready Player Me | Güncel bir üretim yolu değil: hizmetler 31 Ocak 2026'da kapandı. Eski dışa aktarılmış GLB'ler dosya olarak kullanılabilir; yeni üretim ve eski barındırılan bağlantılar üzerine sistem kurmayalım. |
| Avaturn | Gerçekçi avatar adayı. Resmî programatik üretim akışı bir ön ve iki yan fotoğraf istiyor. Hesap/API erişimi, sonuç kontrolü, kafa çıkarımı ve mevcut rig/ölçek/materyal uyarlaması gerekiyor. Tek kart fotoğrafını 22 kez yükleyip kusursuz futbolcu üretileceği garanti edilemez. |
| Mevcut Blender hattı | Ücretsiz ve mevcut futbolcu modeline en az uyarlama gerektiren yol. Çok açılı referansla kafa biçimi, ayrı saç/sakal, UV/doku ve yakın plan kontrolü. İşin önemli kısmı oyuncu başına elle kalite kontrolü. |
| Adobe | Photoshop referans/doku düzenleme, Substance 3D Painter hazır geometriyi boyama aşamasında kullanılabilir. Sadece Adobe hesabına giriş fotoğraftan rigli 3D futbolcu kafasını tamamlamaz. |

Bu proje için önerim: önce mevcut ortak model üzerinde Galatasaray–Fenerbahçe ilk 11'lerini yakın planda onaylanabilir kaliteye getirmek, sonra Beşiktaş ve büyük Avrupa kulüplerine aynı kafa/saç üretim düzenini uygulamak. Bir Avaturn denemesi yapılacaksa bütün takıma geçmeden önce bir oyuncunun ön/yan referanslarıyla sonuç üretip benzerlik, rig ve performansını kontrol etmek daha ölçülebilir.

Kart oyununun fotoğraflarının bir bölümü mevcut referanslarda zaten kullanılıyor; örneğin `worldofsimulation.com/futbol-atlasi/assets/players/...` kaynakları profillerde kayıtlı. Bunlar referans fotoğrafıdır; otomatik bir 3D tarama değildir. v74'te saç kontrolü için saklı portreler incelendi, 33 görünüm kaydı düzeltildi. Ayrıca saçın görünmemesine neden olan gerçek çizim grubu hatası giderildi; kıvırcık ve örgülü saçlar ayrı hacim kazandı. Yeni Avaturn modelleri üretildiği veya tüm yüzlerin birebir benzerlikte tamamlandığı iddia edilmez.

Kaynaklar:
- Avaturn resmî üretim API akışı: https://docs.avaturn.me/docs/integration/api/create-avatar-with-api/
- Avaturn resmî başlangıç ve entegrasyon bilgisi: https://docs.avaturn.me/
- Ready Player Me kapanışı ve geçiş belgesi: https://docs.genies.com/docs/sdk-unity/sdk-avatar/other-platforms/ready-player-me/

Daha önceki ücretli araç notları SONRAKI-YUZ-IS-AKISI.md dosyasında tarihsel değerlendirme olarak duruyor; satın alma/hesap gerektiren bir üretim bu sürümün tamamlanmış çıktısı değildir.
