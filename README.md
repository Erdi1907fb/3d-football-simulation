# next90sim · 3D Football Simulation

Instagram / YouTube için dikey (1080×1920, 60 FPS) futbol simülasyon videoları üreten statik web
uygulaması. Sürüm: bkz. `VERSION`.

| Sayfa | İçerik |
|---|---|
| `index.html` | Maç merkezi: bülten, 11’e 11 3D maç, sezon, konsept maçlar, video indirme |
| `penalty.html` | Penaltı Stüdyosu (takım serisi / oyuncu düellosu) |
| `japon-kale.html` | Japon Kale: 3–6 taraf, kaleci + 2 serbest saha oyuncusu, eleme / puan, tam yan saha yayını + dinamik yakın kamera |
| `japon-kale.html?mode=small` | Küçük Saha Maçı: 2 takım, kaleci + 3 serbest saha oyuncusu (4v4), süreli maç |
| `freekick.html` | Serbest Vuruş Stüdyosu (takım vs takım / oyuncu düellosu) |

**Geliştiriciler ve yapay zekâ ajanları (Codex, Claude):** önce `AGENTS.md`, sonra
`docs/ai/PROJECT_STATE.md`, `docs/ai/HANDOFF.md`, `docs/ai/TASKS.md`.

Yerel çalıştırma: `python3 -m http.server 8765` → http://127.0.0.1:8765/freekick.html
(PHP gerektiren bülten/tahmin uçları için PHP 8.1 sunucusu gerekir.)

Testler: `node tests/freekick.cjs` vb. — liste `AGENTS.md` §4.

Yayın (Hostinger): dosyaları `public_html` köküne kopyala; `config.php`, sunucudaki veri ve
hazır videoları silme; CDN önbelleğini temizle. Yeni servis/cron gerekmez.

Tüm video modlarında TR/EN zaman damgalı anlatım: kopyalama, TXT ve SRT indirme.

Arena süreleri: 2–6 takımda 30/45/60/75/90 saniye oyun + 12 saniye sonuç/koşu/taraftar kutlaması. Süreli maçlar kesintisizdir.
Ortak millî kapsam: 85 ülkenin sağlayıcı kadrosu ve renk/desen formaları normal maç, penaltı, serbest vuruş, arena ve güncel konsept seçimine bağlıdır. İlk 11'ler simülasyon seçkisidir; formalar resmî sezon replikası değildir.
