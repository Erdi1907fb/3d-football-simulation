# SofaScore kaynak bağlantısı

İncelenen kullanıcı seçimi: https://github.com/ryanlam0618/sofascore-backfill
Şema: https://github.com/ryanlam0618/sofascore-backfill/blob/master/fetch_lineups.py

Bağımsız PHP adaptörü `server/sofascore-lineups.php`, mevcut ilk 11 yenileme
ve cron hazırlık akışına bağlıdır. Repo Python kodu, proxy/kimlik döndürme
mekanizmaları veya veritabanı kurulumu siteye kopyalanmadı.

- Keşif: `https://www.sofascore.com/api/v1/sport/football/scheduled-events/YYYY-MM-DD`
- Kadro: `https://widgets.sofascore.com/embed/lineups?id=EVENT_ID`
- Widget verisi: `__NEXT_DATA__.props.pageProps.initialLineups` / `initialEvent`.
- `confirmed === true`: açıklanmış kadro. Diğer durum: onaylanmamış/muhtemel.
- `substitute`: yedek ayrımı. `missingPlayers`: yok/şüpheli ayrımı.
- Tarihsel widget içindeki teknik direktör güncel metadata olabilir; tarihsel
  maça kesin atanmış teknik direktör diye etiketlenmez.
- Tarihsel oyuncunun `teamId` alanı transfer sonrası kulübü gösterebilir;
  maçın doğrulanmış ev/deplasman tarafı esas alınır.
- Oynanan maçın rating/gol/şut gibi istatistikleri gelecek maç tahminine
  yanlışlıkla sonradan aktarılmaz; skor ve seed ayrı motorda kalır.

Kontrol anında 14025013 widget'i HTTP200 döndü ve gerçek HTML ayrıştırıldı.
Doğrudan etkinlik keşfi/team/event uçları bu ortamda HTTP403 döndü.
Bu nedenle her gelecek fikstürün muhtemel 11'inin alınabildiği iddia edilmez.
Repo README'si de 403 ve veri kapsamı sınırlarını bildirir. Kaynak hatasında
beş dakikalık tekrar beklemesi, sınırlı ağ süresi ve mevcut kadroyu koruma
uygulanır. Kaynak erişiminin Hostinger üzerinde de açık olması gerekir.
