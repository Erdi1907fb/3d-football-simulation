# OpenEngine incelemesi ve v98 bağlantısı

Kaynak: https://github.com/atas76/openengine
Sabit commit: 84bc2b32a1027e775321b57bc6e85c91ec3ba147
MIT, Andreas Tasoulas. İncelenen 20 Java/kaynak dosyası ve lisans assets/vendor/openengine içinde.

| Alan | Kaynakta bulunan | v98 davranışı |
| --- | --- | --- |
| Taktik geometri | vanilla/Tactic 5×7 bölge ve mesafe katsayıları | Metrik saha 5×7 bölgeye çevrilir; pas seçimi mesafe/yatay geçiş/markajla ağırlıklandırılır. Negatif yön ve indis sınırları düzeltilir. |
| Markaj | vanilla/Player ağırlıklı markaj ve kümülatif seçim | Gerçek yakınlık ve savunma özelliğinden ağırlık; topa yeterince yakın müdahaleciler arasından seed ile seçim. Boş liste güvenli. |
| Pas sonucu | vanilla/State xP ve markaj × geometri | Seçim faydası mevcut fiziksel pas/önleme modeline bağlanır. Kaynaktaki sabit %90 başarı gerçek sonuç sayılmaz; fiziksel temas sonucu belirler. |
| Pas ağı | Tactic komşu pozisyonlar; Team içindeki eksik TODO | En yakın taktik bölge bağlantıları gerçek 22 oyuncu koordinatlarından tamamlanır ve pas seçimine bağlanır. |
| Hat organizasyonu | abstractmodel/Formations dizileri; Heatmap boş veri kabı | Mevcut formasyon/rol sistemi korunur. Ek savunma üçgeni, hat uyumu, genişlik ve takım arkadaşı mesafesi hedef düzeltmesi 5 Hz çalışır; hareket 60 Hz. Bunlar Next90 uygulamasıdır, kaynakta tamamlanmış sayılmaz. |
| Futbolcu özellikleri | mv/PlayerAttributes yalnız shooting alanı | Açıkça verilen 0–1 / ölçekli 20 / 100 özellikleri ve kondisyon kullanılır. Eksik değerler mevcut rol varsayımlarıdır; gerçek ölçülmüş oyuncu yeteneği diye sunulmaz. |
| Şut/gol | vanilla/State sabit xG=.1 | Alınmadı. Mevcut açı/mesafe/baskı/kaleci ve top fiziği korunur. |
| Fizik, kurtarış, sakatlık | İncelenen dallar tamamlanmış 3D fizik/kaleci/sakatlık motoru sağlamıyor | Mevcut Next90 uygulamaları korunur. Kaynakta bulunmayan özellikler taşındı denmez. |

Yeni bağ gerçek procedural-possession karar döngüsündedir: openengine-adapter.passValue, supportNetwork, weighted ve shape çağrıları seçimi/hareketi değiştirir. Java kaynaklarını yanına koymakla sınırlı değildir. Normal ve özel maçlar yeni revizyonla açılır. Eski yayımlanmış skor/golcü defteri korunur; görünür istatistikler ve video aynı event/sample akışını kullanır.

## Sınırlar
Bu sürüm FM eşdeğeri veya tamamı serbest çalışan 90 dakikalık yeni motor değildir. Mevcut sistem skorla kısıtlanan maç özeti üretir; procedural gelişim seçilmiş ataklarda çalışır, son vuruş çözücüsü yayımlanmış sonucu korur. Dolayısıyla istatistikleri tam 90 dakikalık gerçek maç dağılımıyla kalibre edilmiş diye nitelemek doğru olmaz. Duran top, kart, ofsayt, oyuncu değişikliği, sakatlık kapsamı önceki motor kadardır; bu alanlarda bağımsız yeni OpenEngine portu yoktur. Şut ve kurtarış fiziği mevcut Open Football/Next90 katmanıdır. Tüm motorun Java'dan birebir taşındığı iddia edilmez.

Video kodlayıcısı ve teslim yolu değişmedi. Hostinger için sürekli Node/Python gerekmez. Yeni analitik katman tarayıcı JS'sidir. Gerçek GPU, fiziksel iPhone ve bütün cihazlar üzerinde uçtan uca test yapıldığı iddia edilmez.
