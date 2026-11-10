# AGENTS.md — next90sim / 3D Football Simulation

Bu dosya, bu repoda çalışan **tüm yapay zekâ ajanlarının** (ChatGPT Codex, Claude Code ve
sonradan eklenecek diğerleri) ortak talimatıdır. `CLAUDE.md` bu dosyaya bağlıdır; çelişki
olursa **bu dosya geçerlidir**.

## 0. Her oturumun ilk 5 dakikası (zorunlu)

1. `git fetch origin && git checkout main && git pull` — en güncel `main` ile başla.
2. Sırayla oku: `VERSION` → `docs/ai/PROJECT_STATE.md` → `docs/ai/HANDOFF.md` (en üstteki
   kayıt en yenisidir) → `docs/ai/TASKS.md` → gerekirse `docs/ai/DECISIONS.md`.
3. Kullanıcının yeni isteğini `docs/ai/TASKS.md` içine **yeni görev** olarak ekle
   (durum: `in-progress`, sahibi: sen). Kullanıcının yeni isteği her zaman eski
   görevlerden önceliklidir.
4. Diğer ajanın açık bıraktığı işler ve “dikkat” notları varsa önce onları değerlendir.

## 1. Proje özeti

- Statik web sitesi + küçük PHP yardımcıları (Hostinger, `public_html`). Derleme adımı yok;
  tarayıcı `assets/*.js` dosyalarını doğrudan yükler. Three.js r15x (`assets/vendor/three.min.js`).
- Giriş sayfaları: `index.html` (maç merkezi, normal 11’e 11 maç), `penalty.html`
  (Penaltı Stüdyosu), `freekick.html` (Serbest Vuruş Stüdyosu, V108), `football-lab.html`,
  `face-coverage.html`. Sunucu tarafı: `*.php`, `server/*.php`, `cron.php`.
- Hedef çıktı: 1080×1920, 60 FPS, MP4 dikey video (Reels/Shorts). Masaüstü ve mobil ön izleme
  ve indirme akışı bozulmamalı.
- Ayrıntılı mimari: `docs/ai/PROJECT_STATE.md`.

## 2. Mimari kurallar

- **Üç stüdyo, tek altyapı.** Normal maç, Penaltı ve Serbest Vuruş aynı sahneyi
  (`assets/scene.js`), aynı oyuncu/forma/yüz sistemini, aynı top fiziğini
  (`football-physics.js`, `ball-aero.js`, `open-football-adapter.js`), aynı kaleci dalış
  animasyonunu ve aynı video hattını (`video-core.js`) kullanır. Stüdyoya özel davranış,
  seçenek bayraklarıyla (`penaltyStudio`, `freeKickStudio`, `brandBoards`) eklenir — ayrı
  fizik motoru yazılmaz.
- **Modül biçimi:** her dosya UMD benzeri IIFE’dir: Node’da `module.exports`, tarayıcıda
  `globalThis.<Ad>`. Yeni modül bu kalıbı izlemeli ki `tests/*.cjs` ile Node’da test edilebilsin.
- **Kanonik dosya adları:** `assets/<ad>.js` tektir. Önbellek kırma için HTML’de
  `?v=<sürüm>` kullanılır. `scene.v108.js` gibi **sürüm adlı kopya oluşturma** (V108’de 200+
  yinelenen kopya temizlendi).
- **Determinizm:** simülasyonlar tohumlu (`seed`) ve tekrar üretilebilir olmalı. Ön izleme,
  geri sarma ve MP4 aynı tohumdan aynı sonucu vermeli.
- **Fizik önce:** top ışınlanmaz; sonuç (gol/kurtarış/direk/baraj) fiziksel temasla oluşur.
  İstenen sonuç bulunamazsa fiziksel sonuç kazanır.
- **Dürüstlük:** uydurma istatistik, sahte resmî logo/forma eklenmez. Tahmin modelleri
  “model tahmini/eğlence ağırlığı” olarak etiketlenir.
- **Reels/Shorts güvenli alanı:** stüdyo grafikleri yalnız `Stage.overlayLayout` bandında (1080×1920’de x 30–909, y ≈1296–1518). Üst ~250 px, alt ~400 px ve sağ kenar platform arayüzüne aittir; kamera aksiyonu bandın üstünde tutar.
- **Sevinçler:** `assets/celebration-pack.js` (100 sevinç + 14 takım rutini) tüm modlarda ortaktır; yeni sevinç eklerken `NAMES` listesine ekle ve `tests/celebrations.cjs` çalıştır.
- **Reklam panoları:** stüdyolarda (penaltı/serbest vuruş) lig markası yok; next90sim
  markası (`assets/brand-config.js`, `assets/next90sim.png`).
- Kullanıcının istediği özellikleri izinsiz kaldırma. Çalışan sistemi sıfırdan yeniden yazma.

## 3. Kod standartları

- Mevcut dosyalar sıkıştırılmış tek satır stilindedir; düzenlerken aynı stili koru, büyük
  yeniden biçimlendirme yapma (diff’i okunamaz kılar). Yeni dosyalar okunabilir yazılabilir.
- Metinler TR/EN iki dillidir: `tr('Türkçe','English')` kalıbı.
- Yeni varlık (görsel/model/ses) eklerken lisansını `ASSET-LICENSES.md` içine yaz.
- 12 MB’tan büyük dosya eklemeden önce `docs/ai/DECISIONS.md`’ye gerekçe yaz.

## 4. Testler

Kökten çalıştır (Node 18+). Hepsi geçmeden sürüm “kararlı” ilan edilmez.

| Komut | Kapsam | Süre |
|---|---|---|
| `node tests/run-all.cjs [--quick]` | **Hepsini çalıştırır**, `tests/summary.json` yazar; `--quick` `engine-test.cjs` hariç 19 test | ~2,5 dk (quick ~1 dk) |
| `node tests/freekick.cjs` | Serbest vuruş fiziği, baraj/kaleci/direk, kurallar, ayna noktalar, millî baraj verisi, marka panoları | ~10 sn |
| `node tests/penalty.cjs` | Penaltı teknikleri (9 tür), hız aralığı, ayak dışı falso, süreklilik | ~3 sn |
| `node tests/weather.cjs` | Hava durumu: uygula/geri yükle, geç kumaşlar, kalite ölçeği, zaman tabanlı yağış | <1 sn |
| `node tests/graphics.cjs` | Post-process paketi, kar izi/yağmur sıçraması, geri sarma, diziliş şeritleri | <1 sn |
| `node tests/celebrations.cjs` | 100 sevinç + 14 takım rutini, 14.400 poz sonlu/geçerli, planlayıcı dağılımı | <1 sn |
| `node tests/forecast.cjs` | Konsept analiz (1X2 toplamı, simetri, ev avantajı), sezon motoru (fikstür, puan, tohum) | ~2 sn |
| `php tests/forecast.php` | Sunucu tahmin modeli: determinizm, xG sınırları, gelecek veri sızıntısı yok, piyasa oranı, kilit özeti | <1 sn |
| `node tests/presentation.cjs` | Penaltı serileri, resmî kural, yerleşim | ~3 sn |
| `node tests/variation.cjs` | Senaryo çeşitliliği, top adım sürekliliği | ~3 sn |
| `node tests/recovery.cjs` | Misafir oyuncu düelloları, milli kaleciler | ~1 sn |
| `node tests/intent.cjs` | Oyuncu niyeti, file geometrisi | <1 sn |
| `node tests/remaster.cjs` | Taktik hedefler, kaçınma, shader sözleşmesi | <1 sn |
| `node tests/crests.cjs` / `node tests/search-test.cjs` | Arma ve arama | ~1 sn |
| `node tests/engine-test.cjs` | 18 normal maç, 500 penaltı serisi | ~2 dk |
| `node tests/duo.cjs` | 2v2 düello: ikililer sırayla vurur (penaltı + FK) | <1 sn |
| `node tests/kickoff-referee.cjs` | Başlama vuruşunda hakem/vurucu çakışması | <1 sn |
| `php tests/national-competitions.php` | Uluslar Ligi/hazırlık maçları, millî reyting güncelleyici, aday kadro (Wikipedia/Transfermarkt) | ~2 sn |
| `php tests/forecast-lock.php` | Korunan tahmin kilidi uyuşmazlığı güncellemeyi durdurmaz (V140) | <1 sn |
| `php tests/callup-filter.php` | Aday kadro filtresi tüm sağlayıcılarda, numaralar, Transfermarkt ayrıştırma | <1 sn |
| `node tests/faces.cjs` | Yüz pozları (`@napi-rs/canvas` gerekir) | — |

Tarayıcı kontrolü: `python3 -m http.server` ile kökü sun, Playwright/Chromium ile
`freekick.html`, `penalty.html`, `index.html` aç; `window.Next90FreeKickStudio.draw(t)` /
`window.Next90PenaltyStudio.draw(t)` ile kare çizdir. Yazılımsal WebGL testi fiziksel cihaz
testi değildir — raporda böyle belirt.

## 5. Sürüm politikası

- Tek kaynak: kökteki `VERSION` dosyası (ör. `V108`).
- Sürüm numarası her commit’te değil, **test edilmiş ve bütünleşmiş** bir sürüm
  tamamlandığında artırılır. V108 tamamlandı → yeni işler **V109** hedefiyle yapılır.
- Sürüm kapatırken: `VERSION` güncelle → HTML’lerde `?v=` değerini güncelle →
  `node tools/make-release.cjs` (assets/release-vNNN.json; `build.php` bunu kullanır) →
  `build.php` ve `index.php` içindeki build numarasını güncelle → `docs/ai/CHANGELOG.md`.
- Eski sürüm giriş adresleri (`next90sim-vNN.html`, `penalty-vNN.html`) `.htaccess` ile
  kanonik sayfaya yönlenir; yeni sürüm kopyası HTML üretme.

## 6. Ortak çalışma protokolü (Codex ⇄ Claude)

Ajanlar birbirinin sohbetini **göremez**. Ortak hafıza yalnızca bu repodaki commit edilmiş
dosyalardır.

1. **Dal:** her görev için `agent/<ajan>/<kısa-konu>` (ör. `agent/codex/match-ai-pressing`)
   ya da platformun verdiği dal. Kullanıcı `main`’e push istediyse, testler geçtikten sonra
   `main`’e hızlı ileri (fast-forward) birleştir; zorla push (`--force`) yapma.
2. **Dosya sahipliği:** üzerinde çalıştığın dosyaları `docs/ai/TASKS.md` görev satırına yaz
   (`files:`). Diğer ajanın `in-progress` görevindeki dosyaya dokunmadan önce HANDOFF’a not düş.
3. **Silme/geri alma:** diğer ajanın işini habersiz silme, üzerine yazma veya eski sürüme
   döndürme. Gerekiyorsa gerekçesini `DECISIONS.md`’ye yaz.
4. **Oturum sonu (zorunlu):** `docs/ai/HANDOFF.md`’nin **en üstüne** yeni kayıt ekle
   (şablon dosyada), `TASKS.md` durumlarını güncelle, değişen mimariyi
   `PROJECT_STATE.md`’ye işle, önemli kararları `DECISIONS.md`’ye ekle. Kod ve raporlar aynı
   commit/PR’da olmalı.
5. **Dürüst rapor:** başarısız/yarım işi tamamlanmış gibi yazma; `TASKS.md`’de `blocked` veya
   `partial` olarak bırak, nedenini yaz.
6. Commit mesajları: `V109: <özet>` biçimi; gövdede ne/niçin.

## 7. Dokunurken dikkat

- `assets/club-rosters-v75.json`, `assets/kits/**`, `assets/faces/**`, `assets/concept/teams.js`
  büyük veri dosyalarıdır; adlarını değiştirme (sunucu ve testler bu yollara bağlı).
- `data/private/` ve sunucudaki `config.php` gizlidir; repoya gerçek anahtar koyma.
- `.htaccess` `docs/`, `tests/`, `tools/`, `*.md` erişimini engeller; yayına bunları açma.
- **Dosya silme kuralı:** bir dosyayı silmeden önce `index.html`, `penalty.html`, `freekick.html`, tüm `*.php`, `server/*.php` ve aktif JS’ten (dinamik yol birleştirmeleri dahil: `'assets/pitch/turf-'+kind`) referans taraması yap. PHP veri akışı (haftalık bülten, 5 gün ileri maçlar, cron) dosyalarına dokunma. Emin değilsen silme, `TASKS.md`’ye not düş.
