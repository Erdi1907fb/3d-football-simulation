# Gerçekçi futbol atakları ve kadro verisi — 3 Kasım 2026

## İncelenen açık kaynak motorlar

1. **Open Football — ZOXEXIVO/open-football**
   https://github.com/ZOXEXIVO/open-football
   Rust ile yazılmış, Football Manager benzeri bağımsız futbol dünyası ve maç
   simülasyonu. Takımlar, maçlar, oyuncular, transferler ve uzun vadeli sonuçlar
   için yakın bir referans. Kendi çalıştırılabilir uygulaması/server yapısı var.
   Bu araştırma, görsel kalitesinin Football Manager'a eşit olduğunu doğrulamaz.

2. **Google Research Football — google-research/football**
   https://github.com/google-research/football
   https://research.google/pubs/google-research-football-a-novel-reinforcement-learning-environment/
   Fizik tabanlı 3D futbol ortamı, tam 11v11 ve Football Academy senaryoları var.
   API top konumu/hızı/sahibi, oyuncu konumları/rolleri ve kısa-yüksek-uzun pas,
   şut, top sürme, sprint, kayarak müdahale gibi eylemleri sunuyor. Öğrenilmiş
   ajanlar ve yerleşik AI ile oyun akışı üretilebiliyor. Asıl repo 19 Ağustos
   2026'da arşivlenmiş; güncel bakım varsayılmamalı. Python/C++/SDL bağımlılıkları
   nedeniyle mevcut statik HTML sitesine bir script etiketiyle eklenmez.
   İnceleme kaynağı:
   https://github.com/google-research/football/blob/master/gfootball/doc/observation.md
   https://github.com/google-research/football/blob/master/gfootball/doc/scenarios.md

3. **HELIOS Base — helios-base/helios-base**
   https://github.com/helios-base/helios-base
   RoboCup 2D takım ajanı ve formasyon/taktik araştırması için referans. Hazır
   gerçekçi 3D insan futbolu grafikleri sunan bir paket değildir.

Benim değerlendirmem: FM benzeri bütün bir simülasyon için Open Football;
fizik, sürekli top sahipliği ve atak kararları için Google Research Football
öncelikli inceleme adayları. Salt yeni gol animasyonları eklemek yerine
oyuncuların pas/taşıma/şut/boş alan kararlarını çeşitlendirmek gerekir.
Bu değerlendirme kaynaklara dayanan bir mühendislik çıkarımıdır; motorlar
çalıştırılıp aynı takımlarla kalite benchmark'ı yapılmadı.

## Mevcut sitemize uygulanabilir yol

- Maç analizimizi/kimliklerimizi ve 3D görselleştirmemizi koruyup atak karar
  modelini ayrı geliştirmek; pas opsiyonları, topsuz koşu, savunma şekli,
  pres/kontra pres ve ikinci top devamlarını aynı oyun durumundan üretmek.
- Dış motor kullanılacaksa çıktı pozisyonlarını ve olaylarını JSON'a dönüştüren
  bir adaptör veya ayrı derleme gerekir. Bu, Hostinger'a yalnız ZIP yüklenen
  mevcut düzenin doğrudan bir eklentisi değildir. Önceden üretilmiş sekanslar
  daha kolaydır ama sonlu bir havuz yine tekrar edebilir.
- Bu pakette motor değişimi yapılmadı; araştırma istendiği için sonuç raporlandı.
  Öncelik, tekrarlanabilen video kamera hatasının somut düzeltmesidir.

## FotMob alternatifleri

- Mevcut BSD API bağlantısı artık SofaScore başarısızlığından sonra FotMob'dan
  önce kadro için deneniyor. Kaynak kendi predicted/confirmed ayrımını korur.
  BSD'nin AI tahminlerinin kesinlikle daha doğru olduğu iddia edilmiyor.
- Sportmonks Expected Lineups, beklenen ilk 11/formasyon ve aday yedekleri;
  sidelined verisi sakatlık/cezalı durumunu sunan uygun bir alternatif.
  https://www.sportmonks.com/football-api/expected-lineups-api/
  https://www.sportmonks.com/glossary/injuries-and-suspensions/
  Beklenen 11 özelliği ücretli Growth/Pro eklentisi; ayrı token ve kapsama
  ihtiyacı var. Mevcut BSD anahtarı onun yerine kullanılamaz. Bu hesap/token
  olmadan canlı bağlantı yapılmış gibi sunulmadı; satın alma yapılmadı.
- API-Football, sakatlık ve kadro uç noktaları olan başka bir seçenek:
  https://www.api-football.com/news/post/how-to-get-started-with-api-football-the-complete-beginners-guide
  Normal lineups ile predicted winner/score ürünleri aynı şey değildir;
  muhtemel 11 varmış gibi tahmin sonucunundan oyuncu türetilmemeli.

Sakatlık bildirimi, açıklanmış resmi maç kadrosu ve model tahmini ayrı
saklanmalı. Hiçbir muhtemel 11 kaynağı her maçta yüzde yüz doğruluk sağlamaz.
