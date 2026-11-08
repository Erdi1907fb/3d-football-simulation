# CHANGELOG

Biçim: en yeni sürüm üstte. Ayrıntılı eski sürüm notları: `docs/archive/SURUM-v10x.txt`.

## V112 — 2026-11-08 (Claude Code) · kararlı

### Yeni
- Sinematik görüntü zinciri (Yüksek kalite): UnrealBloom + ACES + SMAA (three.js r160 resmî modülleri, MIT).
- Yağmur/kar adım tepkisi: su sıçraması, kar bulutu, karda kalıcı ayak izleri.
- Frikikte taraftar ayrımı: koridor, güvenlik görevlileri, şeffaf panel ve korkuluk; takım başına 2 dalgalanan bayrak.
- Diziliş farkındalığı: üçlü stoper ve kanat bekleri, ikili stoperin sol/sağ ayrımı.

### Düzeltmeler
- Tam vücut oyuncu modeli krampon rengini yok sayıyordu → oyuncuya özel renk; kaleci eldiveni rengi.
- Frikikte taraftarlar değişik formanın (ör. 3. forma) rengini giyip karışık görünüyordu → kulüp renkleri.
- Hava “Açık”a dönünce adım efektleri temizlenmiyordu (test yakaladı).

### Testler
- `tests/graphics.cjs` (post-process paketi, kar izi/yağmur sıçraması, geri sarma temizliği, diziliş şeritleri) → run-all 15 test.

## V111 — 2026-11-08 (Claude Code) · kararlı

### Yeni
- Hava durumu seçeneği (Açık / Yağmurlu / Karlı) normal maç, penaltı ve serbest vuruşta; ön izleme ve 1080×1920 MP4’te.
  Yağmur: damlalar, zeminde sıçrama halkaları, ıslak çim ve formalar, pus. Kar: kar taneleri, beyazlaşan çim, açık sis.
- Kalite ayarına göre parçacık bütçesi (Yüksek/Dengeli/Hızlı).
- Serbest vuruşta hakem geri geldi: her vuruşta ana kameradan kadraja sığan (grafik bandının üstünde, şut yolunu ve
  barajı kapatmayan) ilk gerçekçi noktaya yerleşir — çoğunlukla barajın dış ucunda; sığmazsa gösterilmez. Düdük pozu korunur.

### Görsel iyileştirmeler
- Clearcoat’lu maç topu; cilalı, daha yuvarlak kale çerçevesi (gölge düşürür); 10 renkli krampon paleti.
- `docs/ai/research/GRAPHICS-SOURCES.md` kaynak/lisans değerlendirmesi.

### Testler
- `tests/weather.cjs` (uygula/geri yükle, geç yüklenen formalar, kalite ölçeği, zaman tabanlı yağış) → run-all 14 test.

## V110 — 2026-11-08 (Claude Code) · kararlı

### Yeni
- Çimde diz/göğüs kayma izleri; stüdyoda kayışlar gerçekten öne ilerler.
- GameplayFootball el yapımı sevinç (`happy_extreme`, `happy_normal`) ve üzgünlük (`sad_normal`) klipleri bağlandı;
  sevinç sayısı 106.
- Frikik: barajın arkasında yatan oyuncu (alçak şutu keser), kalecinin barajı yönetmesi ve açıortay konumu, vurucunun
  topu yerleştirip geri çekilmesi, kalite ayarı.
- Maç: kontra koşu hatları, pres tetikleyicileri, rakip kontrasında geri koşu.
- `docs/ai/research/LEAGUE-SOCCER.md` inceleme raporu.

### Değişen
- Frikikte ekranda yalnız baraj + kaleci + vurucu; her golde topun önünde küçük sevinç, seri sonunda köşede büyük sevinç.
- Penaltıda da gol başına küçük sevinç, finalde büyük sevinç.
- Frikik taraftarı: eşit → stadyum tam ortadan ikiye; tek taraf → tüm tribün.
- Koşu sırasında iki kol da hareketli (6 düzen); maç gollerinde kayış oranı ~%41.
- Penaltı uçuşu ve maç şutları aerodinamik modelde; forma/şort kumaş dokusu, şort numarası netliği.

### Testler
- `run-all` 13/13; frikik testine yatan oyuncu, açıortay, hazırlık; sevinç testine küçük/büyük set, iki kol, kayış ilerlemesi,
  jestler; penaltı testine aerodinamik hedef doğruluğu ve kavis eklendi.

## V109 — 2026-11-07 (Claude Code) · kararlı

### Yeni
- **Sevinç paketi:** 100 adlandırılmış gol sevinci (diz üstü kayış, göğüs üstü kayış, yan kayış, zıplayıp dönme, sıçrayıp
  yumruk, diz çökme, tek diz; uçak, kalp, sus, kulak, okçu, robot, dab, meditasyon, samba, gölge boksu…) ve 14 takım
  rutini (kucaklaşma, üst üste yığılma, birlikte zıplama, golcüye selam, alkış halkası, birlikte kayış…). Normal maç,
  penaltı ve serbest vuruşta.
- **Millî baraj:** düelloda millî forma → barajda o ülkenin gerçek oyuncuları ve forma numaraları.
- **Testler:** `penalty.cjs`, `celebrations.cjs`, `forecast.cjs`, `forecast.php`, `run-all.cjs` (+ `tests/summary.json`).

### İyileştirmeler
- Serbest vuruş noktaları: sol/sağ ayna çiftleri, merkez ve uzak; her turda iki taraf aynı noktadan.
- Serbest vuruş grafikleri Reels/Shorts güvenli bandında (penaltı ile aynı yer); kamera kadrajı aksiyonu bandın üstünde tutar.
- Penaltı: vuruş tekniği + hız etiketi; ayak dışı vuruş falsosu.

### Düzeltmeler
- V108 temizliğinde yanlışlıkla silinen küçük animasyon JSON dosyaları geri getirildi.

## V108 — 2026-11-07 (Claude Code) · kararlı

### Yeni
- **Serbest Vuruş Stüdyosu** (`freekick.html`): takım vs takım veya oyuncu düellosu; 100 yıldız/
  ikon; millî takım ya da kulüp forması; her taraf için kaleci seçimi (kulüp, diğer kulüpler, millî
  kaleciler); 5’er (erken bitiş) / 5’erin tamamı / 3’er / tek vuruş + ani ölüm; karışık, merkez,
  sol, sağ, uzak vuruş noktaları; 3–5 kişilik zıplayan baraj; falso, dış ayak, topspin,
  knuckleball, sert vuruş, baraj altı teknikleri; vuruş hızı (km/s) ve mesafe grafiği; gol/
  kurtarış/direkte topu izleyen ağır çekim tekrar; kameralar: oyuncunun arkasından (varsayılan),
  omuz üstü, yayın, kale arkası; 1080×1920 / 60 FPS MP4 ve paylaşım.
- **Ortak aerodinamik top modeli** `assets/ball-aero.js` (üç stüdyo için).
- **Ortak çalışma sistemi:** `AGENTS.md`, `CLAUDE.md`, `VERSION`, `docs/ai/` (PROJECT_STATE,
  HANDOFF, TASKS, DECISIONS, CHANGELOG), `tools/make-release.cjs`.

### İyileştirmeler
- Penaltı ve serbest vuruş stüdyolarında reklam panoları lig yerine **NEXT 90 SIM** markası.
- Penaltı Stüdyosu ayarları numaralı adımlarda; düello modunda “1. oyuncu / Kadro / Oyuncu /
  Oyuncuların forması” etiketleri; stüdyolar arası gezinme; açıklama satırları.
- Forma isim/numarası: forma rengine göre otomatik kontrast ve kontur.
- Normal maç: savunma blok derinliği (alçak/orta/yüksek) ve baskısız taşıyıcıya karşı hat
  geri çekilmesi; daha güçlü yatay kayma.
- Ana sayfaya Penaltı ve Serbest Vuruş stüdyo bağlantıları.

### Temizlik
- 200+ özdeş `*.vNN.js` kopyası, 20 eski giriş HTML’i, kullanılmayan GLB ve ham veri (≈150 MB)
  kaldırıldı; eski adresler 301 yönlendirmeli. Eski raporlar `docs/archive/`.

### Korunanlar (değişmedi)
- Maç bülteni, tahmin/arşiv verileri, sezon modu, konsept maçlar, PHP sunucu katmanı, video
  kodlayıcı, yüz/forma veri dosyaları, penaltı motorunun sonuç modeli ve resmî seri kuralı.

### Testler
- `tests/freekick.cjs` (yeni) PASS; `engine-test`, `presentation`, `variation`, `recovery`,
  `intent`, `remaster`, `crests`, `search-test` PASS. Chromium/SwiftShader tarayıcı kontrolü.
  Fiziksel cihaz ve tam süreli sesli MP4 testi yapılmadı.

### Kaynaklar
- Ball3D (lukaszgrad/ball3d) aerodinamik yaklaşımı; Goff & Carré (2009), Asai vd. (2007).
- Metrica Sports / SkillCorner açık örnek verilerindeki takım biçimi ölçüleri (blok modeli).
- Mevcut: GameplayFootball klipleri (Unlicense), Open Football (Apache-2.0), OpenEngine (MIT),
  Yuka (MIT) — bkz. `ASSET-LICENSES.md`.

## V107 — 2026-11-06 (ChatGPT/Codex)
Okunur penaltı yayın grafikleri, resmî erken bitiş + ani ölüm, her analizde yeni senaryo,
yüz/forma iyileştirmeleri. Ayrıntı: `docs/archive/SURUM-v107.txt`.

## V102–V105
Ayrıntı: `docs/archive/SURUM-v102.txt` … `SURUM-v105.txt`.
