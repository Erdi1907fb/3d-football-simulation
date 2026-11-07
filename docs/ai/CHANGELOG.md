# CHANGELOG

Biçim: en yeni sürüm üstte. Ayrıntılı eski sürüm notları: `docs/archive/SURUM-v10x.txt`.

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
