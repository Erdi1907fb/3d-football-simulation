# HANDOFF — ajanlar arası devir kayıtları

Kurallar: **en yeni kayıt en üstte.** Her oturum sonunda aşağıdaki şablonla yeni kayıt ekle.
Diğer ajan sohbetini göremez; burada yazmayan şey bilinmez.

```
## [YYYY-MM-DD] <Ajan> · V<başlangıç> → V<bitiş/hedef>
- Dal / commit / PR:
- Kullanıcı isteği (özet):
- Yapılanlar:
- Değişen önemli dosyalar:
- Tamamlanmayanlar / kısmi:
- Karşılaşılan sorunlar:
- Testler (komut → sonuç):
- Sonraki ajan için dikkat:
```

---

## [2026-11-07] Claude Code · V107 → V108 (kararlı)

- **Dal / commit:** `claude/great-curie-v7xiuc` → `main`’e hızlı ileri birleştirildi
  (kullanıcı talimatı: tamamlanan işler `main`’e push edilecek). Commit’ler: “V108 cleanup…”,
  “V108: Free Kick Studio…”, “V108: collaboration docs, release manifest…”.
- **Kullanıcı isteği (özet):** Ortak fizik/animasyon/grafik altyapısıyla yeni Serbest Vuruş
  Stüdyosu (takım vs takım, oyuncu düellosu, forma/millî takım seçimi, oyuncunun arkasından
  kamera); penaltı stüdyosu ayarlarını anlaşılır yapmak; stüdyolarda lig reklamı yerine
  next90sim panoları; forma isim/numara netliği; oynanış gerçekçiliği; Codex ile ortak rapor
  sistemi; gereksiz dosya temizliği; `main`’e push.
- **Yapılanlar:**
  1. Temizlik: 200+ yinelenen `*.vNN.js` kopyası, 20 eski giriş HTML’i, kullanılmayan GLB/ham
     veri (≈150 MB) silindi; HTML’ler kanonik `assets/<ad>.js?v=108` yükler; eski adresler
     `.htaccess` 301. Eski raporlar `docs/archive/`’e taşındı. Testler sürümsüz adlara geçti,
     V107 sonuçları `tests/baselines/v107/`.
  2. `assets/ball-aero.js`: ortak aerodinamik top modeli (sürükleme krizi, Magnus, knuckleball,
     direk/üst direk, zemin sekmesi, nişan çözücü).
  3. `assets/freekick-engine.js` + `freekick-ui.js` + `freekick.html` + `assets/studio.css`:
     Serbest Vuruş Stüdyosu (ayrıntı PROJECT_STATE §4).
  4. `assets/stadium-boards.js`: `brandOnly` modu; stüdyolarda lig adı/logosu yerine
     NEXT 90 SIM + logo + @next90sim. `scene.js` stüdyolarda otomatik açar.
  5. `assets/jersey-print.js`: forma rengine göre otomatik kontrastlı isim/numara rengi ve
     kontur; serbest vuruşta da 1536 px yakın plan baskı.
  6. `penalty.html` / `penalty-ui.js`: ayarlar numaralı adımlara (Kapışma türü → Taraflar →
     Kurallar ve tribün) ayrıldı; düello modunda etiketler “1. oyuncu / Kadro / Oyuncu” olur;
     stüdyolar arası gezinme.
  7. `assets/collective-play.js`: savunma blok modeli — pres düşükse hat yüksek çıkmaz
     (alçak/orta/yüksek blok), baskısız ileri koşan top taşıyıcıda hat geri çekilir (step-off),
     yatay kayma artırıldı.
  8. `penalty-link.js`: ana sayfa gezinmesine iki stüdyo bağlantısı.
  9. Ortak çalışma: `AGENTS.md`, `CLAUDE.md`, `VERSION`, `docs/ai/*`, `tools/make-release.cjs`,
     `assets/release-v108.json`, `build.php`/`index.php` build 108.
- **Tamamlanmayanlar / kısmi:** bkz. `TASKS.md` (T-201…T-212). Özellikle: Mixamo/yeni
  animasyon klipleri eklenmedi; penaltı top yolu henüz `ball-aero.js`’ye taşınmadı; normal maçta
  atak çeşitleri/kontra atak yeniden çalışılmadı (yalnızca savunma bloğu); League-Soccer
  (GameplayFootball) kaynak kodu indirilip ayrıntılı incelenmedi.
- **Karşılaşılan sorunlar:** SwiftShader’da stüdyo hazırlığı 1–3 dk sürüyor. Kick nesnesinde
  `keeper` alan adı çakışması (oyuncu vs. model) → `keeperModel` olarak ayrıldı.
- **Testler:**
  - `node tests/freekick.cjs` → PASS (240 seri, 2.084 vuruş, fiziksel eşleşme 0,998,
    60 FPS’te en büyük top adımı 0,585 m, marka panosu kontrolü)
  - `node tests/engine-test.cjs` → PASS (18 maç, 500 penaltı serisi, 54 gol korundu, ~109 sn)
  - `presentation`, `variation`, `recovery`, `intent`, `remaster`, `crests`, `search-test` → PASS
  - Chromium (SwiftShader) ile `freekick.html` ve `penalty.html` açıldı, kareler çizildi,
    sayfa hatası yok. Fiziksel telefon ve tam süreli MP4 dışa aktarma bu oturumda test edilmedi.
- **Sonraki ajan için dikkat:**
  - Yeni iş **V109** hedefiyle yapılır; `VERSION` V108 kalır, V109 bitince artırılır.
  - `scene.js` içinde `options.penaltyStudio||options.freeKickStudio` kalıbı stüdyo davranışını
    belirler; yeni stüdyo eklenirse aynı kalıbı genişlet.
  - Serbest vuruş kalitesi için en verimli sonraki adımlar: kutudaki oyuncular için ikinci top
    (rebound) oyunu, barajda “yere yatan” oyuncu, kaleci yan adım animasyonu, vuruş anında
    gövde eğimi klibi (TASKS T-203/T-204).
