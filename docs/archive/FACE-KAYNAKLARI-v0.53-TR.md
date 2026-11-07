# v0.53 yüz ve boy/kilo kaynakları

Gerçekten indirilen 3D varlık: MakeHuman Community MPFB temelinden 1010 köşe,
2000 üçgen anatomik kafa ve altı hafif morph hedefi. Kaynak kodu ve dönüştürme
kaynakları `assets/faces-source/` içinde; CC0 varlık lisansı ve SHA256 kaydı bulunur.
https://github.com/makehumancommunity/mpfb2

FM yüz paketlerindeki portreler oyun motoruna uygun rig'li 3D yüz modeli değildir.
İncelenen Galatasaray PES facepack sayfasından doğrudan kullanılabilir arşiv
alınamadı; pakete PES veya FM futbolcu taraması eklendiği iddia edilmez.
https://www.kazemario.com/2025/11/pes-2021-galatasaray-2025-26-facepack.html

ESPN güncel kadro uç noktalarından 128 oyuncu: Galatasaray 34, Fenerbahçe 28,
Barcelona 31, Real Madrid 35. 118 boy ve 111 kilo kaydı dönüştürüldü.
Ham kaynak birimleri (inç/libre) ile kaynak URL'leri JSON'da saklıdır.
Kimlik eşleşmesi olmadan boy/kilo veya portre başka oyuncuya atanmaz.
`assets/faces/four-club-rosters.json` yalnız görsel eşleşme içindir; muhtemel
11, yedek seçimi veya transfer kaynağı olarak kullanılmaz.

https://site.api.espn.com/apis/site/v2/sports/soccer/tur.1/teams/432/roster
https://site.api.espn.com/apis/site/v2/sports/soccer/tur.1/teams/436/roster
https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/teams/83/roster
https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/teams/86/roster

ESPN CDN portre denemelerinde yalnız 2 dosya indirilebildi; 126 dosya 404 verdi.
İki yerel portre kimlik/kaynak metaverisiyle tutulur. Diğerlerinde mevcut portre
servisi veya mevcut görünüm kalır. Tam fotogerçekçi 128 yüz kapsamı yoktur.
MPFB yüz biçimi varyasyonları stil tahminidir; kişinin gerçek yüz ölçümü değildir.
