# next90sim · 3D Football Simulation

Instagram / YouTube için dikey (1080×1920, 60 FPS) futbol simülasyon videoları üreten statik web
uygulaması. Sürüm: bkz. `VERSION`.

| Sayfa | İçerik |
|---|---|
| `index.html` | Maç merkezi: bülten, 11’e 11 3D maç, sezon, konsept maçlar, video indirme |
| `penalty.html` | Penaltı Stüdyosu (takım serisi / oyuncu düellosu) |
| `japon-kale.html` | Japon Kale: 3–6 taraf, kaleci + 2 serbest saha oyuncusu, eleme / puan, dengeli aksiyon + stadyum içi basın kamerası (dikey/yatay) |
| `japon-kale.html?mode=small` | Küçük Saha Maçı: 2 takım, kaleci + 4 serbest saha oyuncusu (5v5), süreli maç |
| `freekick.html` | Serbest Vuruş Stüdyosu (takım vs takım / oyuncu düellosu) |

**Geliştiriciler ve yapay zekâ ajanları (Codex, Claude):** önce `AGENTS.md`, sonra
`docs/ai/PROJECT_STATE.md`, `docs/ai/HANDOFF.md`, `docs/ai/TASKS.md`.

Yerel çalıştırma: `python3 -m http.server 8765` → http://127.0.0.1:8765/freekick.html
(PHP gerektiren bülten/tahmin uçları için PHP 8.1 sunucusu gerekir.)

Testler: `node tests/freekick.cjs` vb. — liste `AGENTS.md` §4.

Yayın (Hostinger): dosyaları `public_html` köküne kopyala; `config.php`, sunucudaki veri ve
hazır videoları silme; CDN önbelleğini temizle. Yeni servis/cron gerekmez.

Tüm video modlarında TR/EN zaman damgalı anlatım: kopyalama, TXT ve SRT indirme.

Arena süreleri: puan/5v5 modunda30/45/60/75/90sngerçek oyun; gol sonrası yeniden başlama beklemelerinde maç saati durur. Çok kaleli elemede60snveüstü seçim normal süredir; gerekirse tek golle eleme uzatması oynanıp gerçek kazanan çıkar. Kısa30/45sneleme eksik kalabilir. Video gerçek oyun, bekleme ve kısa sonucu içerir. Yayındaki gereksiz aksiyon/eleme/tur açıklamaları kaldırılmıştır.

Ortak millî kapsam: 85 ülkenin sağlayıcı kadrosu ve renk/desen formaları normal maç, penaltı, serbest vuruş, arena ve güncel konsept seçimine bağlıdır. İlk 11'ler simülasyon seçkisidir; formalar resmî sezon replikası değildir.

Küçük saha 5v5: kaleci + iki defans + orta saha + forvet (2–1–1); saha aynı28×18m. İlk top kapışılır, golden sonra yiyenin forveti arkadaşına pasla başlar. 3–6 takımda ortak top kapışması sürer. Saha oyuncuları serbest seçilir.
Basın kamerası için1920×1080 yatay yayın;1080×1920 dikey Reels/Shorts da seçilebilir. Penaltı ve FK ön izlemesinin metin/arma/skor katmanı gerçek1080p’dir.
