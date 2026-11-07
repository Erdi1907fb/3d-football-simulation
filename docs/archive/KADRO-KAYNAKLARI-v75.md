# Kadro ve teknik direktör kaynakları — v75

Her kulübün kaynak adresi ve kontrol tarihi `assets/club-rosters-v75.json` içinde kayıtlıdır. Bu kayıtlar kaynak anındaki güncel kulüp kadrosudur; henüz açıklanmamış maçın resmî ilk 11'i olduğu iddia edilmez. Maça özel doğrulanmış açıklanmış veri önceliklidir.

- Maçkolik: mevcut lig/tarih/takım/saat eşleştirmeli maç sayfası ve ilk 11/yedek/hoca adapteri.
- Misli ve Nesine: mevcut maça özel kadro adapterleri; son maç kadrosu, açıklanmış kadro yerine geçirilmez.
- FotMob: 111 kulübün güncel takım sayfası, hoca ve kulüp kadrosu; son 11 ve doğal mevkiyle onarılmış muhtemel kadro. Kulüp kimliği ve 2026/27 sezonu kontrol edildi.
- AS Roma resmî personel sayfası: https://www.asroma.com/en/men/players-and-staff — Gian Piero Gasperini.
- Cagliari resmî kadro/personel sayfası: https://cagliaricalcio.com/squadra/prima-squadra/ — Fabio Pisacane.
- ESPN: mevcut maç kimliği, açıklanan kadro, güncel oyuncu listesi ve son maç kadrosu. Bu örnekte kulüp/roster yanıtlarında hoca alanı olmadığı gözlendi; teknik direktör için tek başına yeterli kaynak sayılmaz.

`server/club-rosters.php` kulüp hoca bilgisini 11'in hazır olmasından bağımsız çözer, geçerli kadroyu korur ve maça göre yedek sınırını uygular. `assets/club-rosters.js` sunucu cevabı gecikirse aynı doğrulanmış yedeği tarayıcıya sağlar. Resmen boş açıklanmış yedek listesi veya kullanıcı tarafından sabitlenmiş kadro yapay biçimde doldurulmaz.
