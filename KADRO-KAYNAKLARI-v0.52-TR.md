# Kadro kaynakları — v0.52

Kontrol tarihi: 23 Ekim 2026.

Misli kadro bağlantısı tek bir maça özel değildir. Sistemde desteklenen Süper Lig, Premier League, Bundesliga, La Liga, Serie A, Ligue 1, Şampiyonlar Ligi, Avrupa Ligi ve Konferans Ligi maçlarında tarih üzerinden fikstür aranır; karşılaşma bulunduğunda iki takımın ilk 11'i ve yedekleri sorgulanır. Sağlayıcının her ligde ve her maçta kadro yayımlaması garanti değildir.

Karşılaşma eşleştirmesinde lig, sezon, ev sahibi, deplasman ve başlangıç saati birlikte doğrulanır. Birden fazla aday ya da uyuşmazlık varsa kadro içeri alınmaz. Oyuncular mevcut kadroyla isim ve forma numarası birlikte kullanılarak eşleştirilir; yalnızca aynı numarayı taşımak oyuncu kimliği için yeterli değildir.

Açıklanmış kesin kadro, muhtemel kadrodan önceliklidir. Misli'nin `provisionalLineup` bilgisi korunur; muhtemel kadro kesin diye gösterilmez. Kesin kadro sonradan eski bir tahminle değiştirilmez. Maça iki saatten az kaldığında Misli muhtemel kadrosu bulunsa da diğer kaynaklarda kesin kadro kontrolüne devam edilir. Kaynağı bulunan muhtemel kadrodaki gerçek taktik tercihler korunur; kaynak bulunamazsa son maç ve mevcut oyuncu verilerinden oluşturulan tahmin doğal mevkilere göre onarılır. Böylece bek oyuncusunun sırf puanı yüksek diye kanada veya stopere seçilmesi önlenir.

Yedekler sağlayıcının sırasıyla alınır ve mevcut müsabaka sınırına göre kısaltılır: Süper Lig 10; İngiltere, Almanya ve Fransa 9; İspanya ve UEFA müsabakaları 12; İtalya 15. Muhtemel yedekler de kesin yedek diye etiketlenmez.

Yeni kadro seçim sürümü `2` ile eski, hatalı tahmini kadro önbellekleri yenilenir. Kullanıcı verileri silinmez; maç tahminleri ve sonuç senaryoları bu değişiklik kapsamında değiştirilmez. Maç başladıktan sonra kilitlenmiş kesin kadro korunur.

## Canlı kaynak kontrolü

- 25 Ekim Barcelona–Real Madrid karşılaşmasında Misli iki ilk 11'i ve 9/12 kişilik yedekleri döndürdü. Yanıt muhtemeldir. Barcelona dizilişinde Raphinha santrfor, Gordon sol kanat, Yamal sağ kanat olarak verilmiştir; bu nedenle Raphinha'nın konumu kaynağa rağmen değiştirilmedi.
- 26 Ekim Galatasaray–Fenerbahçe karşılaşması tarih ve takım bilgileriyle bulundu. Kadro servisi `8014 — Match line up not found` döndürdü. Bu karşılaşma için kesin veya sağlayıcıdan alınmış muhtemel ilk 11 iddia edilmez; diğer kaynaklar ve doğal mevki kontrollü tahmin kullanılır.
- Mackolik'in ilgili güncel karşılaşma sayfasına erişildi, ancak gelecek maçın kadro bölümü boştu. Nesine ve Bilyoner'de erişilen sayfalar çalışır bir kadro verisi sağlamadı. Bu kaynaklardan kadro çekiliyormuş gibi bir bağlantı eklenmedi.

Kullanılan herkese açık Misli uçları:

- Günlük fikstür: `https://apivx.misli.com/api/web/v1/statistics/sport/SOCCER/matches/old?fromdate=<UTC gün başlangıcı milisaniye>`
- Maç kadrosu: `https://aggr.misli.com/api/web/match-stats/v1/match/<sgId>/lineups`
- Kontrol edilen Barcelona–Real Madrid yanıtı: https://aggr.misli.com/api/web/match-stats/v1/match/3239077/lineups
- Kontrol edilen Galatasaray–Fenerbahçe yanıtı: https://aggr.misli.com/api/web/match-stats/v1/match/3241596/lineups
- Mackolik karşılaşma sayfası: https://www.mackolik.com/mac/galatasaray-vs-fenerbah%C3%A7e/cs47d7ciad9vvgcqwv8k03t3o

## Doğrulama

`tests/lineups-v52.php` içindeki 27 kontrol geçti. Bunlar gerçek yakalanmış Misli yanıtlarını, farklı tarih/lig eşleşmesini, yanlış takım/sezon/saat reddini, oyuncu kimliği eşleştirmesini, mevki düzeltmesini, yedek sırasını ve kesin kadro önceliğini kapsar. `public-player-sources.php`, `player-refresh.php` ve `bench-policy-v43.php` regresyon kontrolleri de geçti. Bu kontroller sunucu tarafındaki veri ve seçim işlemlerini doğrular; stadyumun görsel testi değildir.
