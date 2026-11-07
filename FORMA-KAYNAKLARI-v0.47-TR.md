# 2026/27 forma kaynakları ve gerçek kapsam

22 Ekim 2026. Bu sürümde 20 kulübe ait **106 gerçek FM26 3D doku** bulunur:
55 saha oyuncusu (20 iç saha, 20 deplasman, 15 üçüncü forma) ve 51 kaleci seti.
Diğer 160 kulüp ve 49 millî takım mevcut görünümünü kullanır. Eksik üçüncü
formalarda önceki alternatif görünüm korunur. Bu paket tüm liglerin tamamlandığı
iddiasını taşımaz. Takım bazında tam envanter `FORMA-KAPSAMI-v0.47.csv` içindedir.

## İçe alınan paket

Üretici: **biavva**. “Italy – Serie A 3D 26/27 for FM26”.

- Üretici sayfası: https://sortitoutsi.net/content/77736/italy-serie-a-3d2627-for-fm26-new-17092026
- Üreticinin açık indirmesi: https://drive.google.com/file/d/1OwvK6T79iAVEXO0nQVHKX8qSmeUjtxDf/view
- Kaynak arşiv: `Italia Kits 26-27.zip`; bütün arşivin ZIP CRC denetimi geçti.
- Yalnız 3D saha oyuncusu ve kaleci PNG dosyaları alındı; 2D menü görselleri
  ve Football Manager eklentileri uygulamaya eklenmedi.
- Kaynak FM takım kimlikleri hem config.xml hem forma armalarıyla eşleştirildi.
  Bunlar uygulamadaki kadro/oyuncu kimliklerini değiştirmez.
- Dokular 1024×1024 WebP olarak saklanır. Kaynak arma, sponsor, desen ve üretici
  işaretleri dokunun içindedir; üzerine ikinci bir arma çizilmez.
- Gövde önü/arkası, kollar, şort önü/arkası ve çoraplar ayrı UV bölgelerine
  bağlanır. Şablonun tamamı gövdeye yapıştırılmaz.
- Takım seti sezon ve kaynak bilgisi `assets/kit-manifest.js` içindedir.

| Takım | Üçüncü forma | Kaleci seti |
|---|---|---:|
| AC Milan | Var | 3 |
| Atalanta | Var | 2 |
| Bologna | Mevcut alternatif | 2 |
| Cagliari | Var | 2 |
| Como | Mevcut alternatif | 2 |
| Fiorentina | Var | 2 |
| Frosinone | Var | 3 |
| Genoa | Var | 3 |
| Inter | Var | 3 |
| Juventus | Var | 3 |
| Lazio | Var | 3 |
| Lecce | Var | 3 |
| Monza | Mevcut alternatif | 2 |
| Napoli | Var | 3 |
| Parma | Var | 3 |
| Roma | Var | 2 |
| Sassuolo | Mevcut alternatif | 2 |
| Torino | Var | 3 |
| Udinese | Mevcut alternatif | 2 |
| Venezia | Var | 3 |

## İncelenen, bu sürümde indirilemeyen paketler

- İngiltere / bolid74: https://sortitoutsi.net/content/77657/england-levels-1-6-3d2627-fm26-new-080926
- Almanya / Uwe Seeler: https://sortitoutsi.net/content/77558/germany-league-level-1-3d2627-new-300826
- İspanya / CarlosJFT90: https://sortitoutsi.net/content/77743/spain-la-liga-3d2627-for-fm26-new-19092026
- Fransa / klyt: https://sortitoutsi.net/content/77706/france-ligue-1-3d-2d-kit-pack-2627-season
- Türkiye / egemend: https://sortitoutsi.net/content/77654/turkey-super-lig-1-lig-2026-27-3d-kits-pack
- Toplu FM26 paket: https://sortitoutsi.net/graphics/style/40/unity-3d-kits

Üyelik girişi yapıldı; ücretsiz dosya sunucusuna indirme geçişi bu çalışma
tarayıcısının güvenlik/erişim sınırında engellendi. Hesaptan çıkış yapılıp ilgili
sekmeler kapatıldı. Kimlik doğrulama bilgileri bu projeye alınmadı. Kaynak
sayfasının erişilebilir olması, arşivin indirildiği veya formanın eklendiği
anlamına gelmez. Bu liglerin formaları güncellendi şeklinde işaretlenmedi.

## Tamamlayıcı görsel başvuru

Kullanıcının verdiği https://www.footyheadlines.com/26-27-kit-overview/
incelendi. Eksik takımların iç saha, deplasman ve üçüncü formalarını karşılaştırmak
ve sezon doğrulamak için başvuru kaynağıdır. Bu sayfadaki forma fotoğrafları FM26
UV dokusu olarak etiketlenmedi ve yapay sırt görünüşü üretilmedi. Bu sürümde bu
siteden yeni bir forma dokusu kopyalanmadı.

## Sırt baskısı

Kadro numarası ve varsa `shirtName`, `jerseyName` veya `nameOnShirt` kullanılır.
Bunlar yoksa oyuncunun görünen adının soyadı kullanılır; isim uydurulmaz. Baskı
rengi ve kontur seçili setle eşleşir; şort numarası şortun açıklığına göre ayrı
çizilir. Kalecilerin baskı stili de kendi seçilen setinden alınır. Yerel Barlow
Condensed Bold yazı tipi cihazlar arasında tutarlılık sağlar. Bu, kulüp veya
liglerin özel tescilli rakam fontunun birebir kopyası olduğu iddiasını taşımaz.
Font: https://github.com/google/fonts/tree/main/ofl/barlowcondensed
Üretici: The Barlow Project Authors. Lisans: SIL Open Font License 1.1;
`assets/fonts/OFL.txt` içinde korunmuştur.
