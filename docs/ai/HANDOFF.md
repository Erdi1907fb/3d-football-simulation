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

## [2026-11-08] Claude Code · V118 → V119 (kararlı)
- **İstek:** sıradakiler + frikik/penaltı/maçta iki taraftar arasına kaba olmayan, düzgün geçişli bir duvar.
- **Yapılanlar:** CHANGELOG V119 (genel ayrım yapısı + kaleci hazır duruşları).
- **Dikkat:** ayrım yalnız temel 15104 koltuklu düzende çalışır (`BASE_SLOTS`); stadyum profili ek koltukları hariç.
  Gizli koltuklar `segHidden` → crowd-lod her karede `lodHidden=segHidden` yapar; LOD kodunu değiştirirsen koru.
  İnce şerit geometrilerinde sıfır alanlı üçgen bırakma (NaN normal + bloom = siyah ekran bloğu).
- **Testler:** `node tests/run-all.cjs` 15/15 PASS; tarayıcıda frikik + penaltı kareleri, maçta sınır çizgileri doğrulandı.
- **Sırada:** çim rüzgârı (T-233), tribün animasyonları (T-234).

---

## [2026-11-08] Claude Code · V117 → V118 (kararlı)
- **İstek:** yatan oyuncu her vuruşta olmasın; bazı vuruşlarda olsun ama o tur iki taraf için de olsun.
- **Yapılanlar:** CHANGELOG V118 (`lierRounds`, tur bazlı karar; yağmurda ıslak top kaçırma).
- **Dikkat:** `wallFor` 4. parametre verilmezse eski olasılık (%45) kullanılır (testler doğrudan çağırıyor).
  Yatan oyuncu yüzünden sonuç akışı değişince eski "wet ball" testi gürültüye düştü → gerçek fizik etkisi eklendi.
- **Testler:** `node tests/run-all.cjs --quick` 14/14 PASS (motor dosyasına dokunulmadı).

---

## [2026-11-08] Claude Code · V116 → V117 (kararlı)
- **İstek:** sıradakilere geç; frikikte yerde yatan oyuncu baraja dik yatıyor → baraj hizasına paralel, arkasında yatsın.
- **Yapılanlar:** CHANGELOG V117. Yatan oyuncu yönü düzeltildi + test; kaleci dirsek pedi; V-gövde; çim aşınması.
- **Dikkat:** `lieDown` gövdeyi actor'ün ileri ekseni etrafında 90° yatırır → yatış yönü heading'e diktir. Heading'i
  hizaya paralel verirsen oyuncu hizaya dik yatar.
- **Testler:** `node tests/run-all.cjs` 15/15 PASS; tarayıcıda yatan oyuncu ve penaltı kareleri kontrol edildi.
- **Sırada:** kaleci hazır duruş çeşitleri (T-231), çim rüzgârı (T-233), tribün animasyonları (T-234).

---

## [2026-11-08] Claude Code · V115 → V116 (kararlı)
- **İstek:** "Sıradakileri yap" → ışık kontrastı, bacak/krampon, koşu ağırlığı, taraftar çeşitliliği.
- **Yapılanlar:** CHANGELOG V116. Ek olarak hakem/yan hakemler tam vücut modele geçti (`OFFICIAL_KIT`).
- **Dikkat:** resmî görevlilerde `actor.uniform` null; fullbody-runtime içinde `actor.official` kontrolü korunmalı.
  Göğüs için dar "bump" genişletmesi kadınsı şişkinlik yaptı → göğüs sıkıştırma kullanıldı (genişletme yalnız yanlara).
- **Testler:** `node tests/run-all.cjs` (engine dahil) PASS; 1080×1920 penaltı + frikik kareleri karşılaştırıldı.
- **Sırada:** kaleci (dirsek pedi, hazır duruş çeşitleri T-231), çim aşınması/rüzgâr (T-233), tribün animasyonları (T-234).

---

## [2026-11-08] Claude Code · V114 → V115 (kararlı)
- **İstek:** her güncelleme “ağız açık kalacak” büyüklükte görsel/animasyon/fizik sıçraması olmalı.
- **Yapılanlar:** atletik gövde yeniden şekillendirme, sheen kumaş, canlı cilt, belirgin çim şeritleri (CHANGELOG V115).
  Önce/sonra kareleri 1080×1920 ile karşılaştırıldı (penaltı finali: belirgin daha atletik gövdeler).
- **Hata/öğrenim:** beyaz sheen koyu formaları griye çevirdi → sheen rengi forma renginden türetildi.
- **Sıradaki büyük adımlar:** bacak/baldır kası ve krampon tabanı (T-230 devam), ışık kontrastı (oyuncu gölgeleri), taraftar
  çeşitliliği (T-234), koşu animasyonu ağırlık hissi (T-232).

---

## [2026-11-08] Claude Code · V113 → V114 (kararlı)
- **İstek:** dış repolar olmadan, yalnız Claude + Codex ile sürekli görsel/animasyon/fizik kalite artışı; profesyonel
  yayın görünümü hedefi. Küçük dokunuşlar ve büyük adımlar.
- **Yapılanlar:** CHANGELOG V114. Sıradaki büyük adımlar TASKS T-230…T-234 (oyuncu gövdesi, kaleci donanımı, koşu
  animasyonu, çim aşınması, tribün animasyonları).
- **Dikkat:** `broadcast-remaster.js` efekt zinciri yalnız Yüksek kalitede. Yeni efektler `cinematic()` içine eklenir;
  hata olursa `composerFailed` ile eski yola düşer. Kameraya `userData.dof={focus,aperture,maxblur}` verilirse DOF açılır.

---

## [2026-11-08] Claude Code · V112 → V113 (kararlı)
- **İstek:** ticari lisanslılar da kullanılabilir (test/video, para kazanma yok); fizik ve grafiği geliştir.
- **Yapılanlar:** CHANGELOG V113; D-018 (ticari varlık politikası). Erişim: Poly Haven/ambientCG/npm açık; Fab/Rokoko
  satın alma/hesap ister.
- **Testler:** `node tests/run-all.cjs` + tarayıcıda yağmurlu frikik düellosu.
- **Dikkat:** frikik `E.create({weather})` — hava değişince sahne değil senaryo da yenilenir.
- **Ek (aynı gün):** baraj duruşu `gesture:'wall'` (`celebration-pack.js`) sahnede en son katman olarak uygulanır
  (`scene.js`, penaltyDive satırından sonra). Frikik FINAL=9,5 sn; gol tepkisi 1,3 sn.

---

## [2026-11-08] Claude Code · V111 → V112 (kararlı)

- **Kullanıcı isteği:** yağmur/karda adımlara zemin tepkisi; tüm 3D sahnelerde daha iyi kaynaklarla grafik/kalite sıçraması;
  oyuncuların birlikte hareketi, diziliş/mevkiye göre tepkiler; frikikte taraftarların karışmaması, bayraklar, koridor +
  güvenlik/duvar ayrımı. Ayrıca “bu kareler en gelişmiş hali mi, siteye yükleyince mi görünür” sorusu.
- **Yapılanlar:** CHANGELOG V112. Post-process paketi `tools/build-postfx.cjs` ile üretildi (three 0.160.0 npm paketinden).
- **Testler:** `node tests/run-all.cjs` (15 test) + tarayıcı: frikik karda (sinematik zincir aktif mi, koridor, bayrak, iz).
- **Dikkat:** `scene.userData.remaster.post` hangi efekt yolunun çalıştığını yazar. Adım algılama yalnız hava açık değilken
  ve kameraya 40 m içindeki oyuncular için çalışır (performans).

---

## [2026-11-08] Claude Code · V110 → V111 (kararlı)

- **Dal / commit:** `claude/great-curie-v7xiuc` → `main`. Commit: “V111: …”.
- **Kullanıcı isteği:** tüm öğelerde grafik seviyesi atlatma (oyuncu, kaleci, top, kale/file, stadyum, taraftar, çim,
  krampon, forma/şort, yüz), uygun repo/kaynak araştırması; üç modda ve videoda Açık/Yağmurlu/Karlı seçeneği.
- **Yapılanlar:** `weather.js`, `weather-ui.js` ve sahne/sayfa bağlantıları; frikikte kadraja sığarsa görünen hakem
  (`freekick-ui.js refereeSpot`, aday noktaları ana kamerayla izdüşümle sınar, vuruş başına önbellek); clearcoat top ve kale; krampon paleti;
  ıslak forma; `research/GRAPHICS-SOURCES.md`; `tests/weather.cjs`.
- **Yapılmayan/sonraya:** post-process bloom/SMAA (T-220), taraftar yağmurluk (T-221), file ipi normal haritası (T-222).
  Yüz fotoğrafları bu sürümde değişmedi (V107 yüz düzeltmeleri sürüyor).
- **Dikkat:** `scene.js` dönüş nesnesinde `weather` ve `setWeather(v)` var. Yeni malzeme hava durumundan etkilensin
  istenirse `userData.broadcastSurface` (zemin) veya `userData.weatherFabric` (kumaş) işaretle.

---

## [2026-11-08] Claude Code · V109 → V110 (kararlı)

- **Dal / commit:** `claude/great-curie-v7xiuc` → `main` (hızlı ileri). Commit: “V110: …”.
- **Kullanıcı isteği:** Mixamo hariç tüm açık görevler; diz kayışlarını daha görünür yapıp çimde iz bırakmak; tek kolun
  sabit kaldığı sevinçleri çeşitlendirmek; frikikte taraftarın tam ikiye bölünmesi; frikikte yalnız baraj/kaleci/vurucu,
  gol başına küçük sevinç, sonda köşede büyük sevinç; üç moddan görüntüler; tüm testler.
- **Yapılanlar:** bkz. CHANGELOG V110 ve PROJECT_STATE §4c. T-201, 202, 204–208, 210–212, 214 tamamlandı; T-203 kullanıcı
  kararıyla kapandı (D-013); T-209 (gerçek cihaz) kullanıcıda; Mixamo (T-213/215) hariç tutuldu.
- **Testler:** `node tests/run-all.cjs` → bkz. `tests/summary.json`. Tarayıcı: frikik (takım/düello), penaltı ve bültenden
  normal maç (Lorient–Brest, kişisel deneme modu) kareleri; football-lab ve face-coverage sayfa hatası kontrolü.
- **Dikkat:** Yerel test için bülten maçını `index.html`’de “Kişisel deneme” modunda aç (PHP veri uçları olmadan
  “Next90 tahmini” modu yayınlanmış veri ister). `celebration-pack.js` artık poz kütüphanesidir: `gesture` alanı
  (organizeWall, placeBall, focus, lieDown, wallCover, sad) sahne tarafından uygulanır.

---

## [2026-11-07] Claude Code · V108 → V109 (kararlı)

- **Dal / commit:** `claude/great-curie-v7xiuc` → `main` (hızlı ileri). Commit: “V109: …”.
- **Kullanıcı isteği (özet):** Tüm modlara sevinç paketi (takım + golcü, diz kayması vb., mümkünse ~100);
  serbest vuruşta dengeli rastgele noktalar (sol/sağ ayaklıyı eşit zorlayan, merkez, uzak) ve her turda iki tarafın
  aynı noktadan vurması; penaltı vuruş çeşitleri ve görünümü; millî forma düellosunda barajın doğru millî takım
  oyuncularından (doğru numaralarla) oluşması; Reels güvenli alanına göre grafik yerleşimi; kod hatası taraması;
  penaltı/maç/tahmin testleri; 1080p60 MP4’ün korunması; silinen dosyaların gözden geçirilmesi.
- **Yapılanlar:** `celebration-pack.js` (100 + 14) ve sahne/planlayıcı/stüdyo bağlantıları; `freekick-engine.js`
  `schedule()` ayna noktalar; `national-walls.json` + üretici araç; serbest vuruş grafikleri penaltı bandına,
  kameralar yeniden kadrajlandı; penaltı teknik etiketi + hız, ayak dışı falso; önceki temizlikte yanlışlıkla silinen
  küçük `assets/characters/animations/*.json` ve `base_body.joints.json` geri getirildi; yeni testler
  (`penalty`, `celebrations`, `forecast.cjs`, `forecast.php`, `run-all`).
- **Hata taraması:** tüm JS `node --check`, tüm PHP `php -l`, tüm JSON ayrıştırma, HTML/`fetch`/statik yol
  referansları ve PHP `__DIR__` yolları tarandı → hata yok (yalnız isteğe bağlı `render-config.php`).
- **Testler:** `node tests/run-all.cjs` → 13/13 PASS (`tests/summary.json`). Tarayıcı (Chromium/SwiftShader):
  serbest vuruş takım + düello, millî baraj (Portekiz 2026), sevinç kareleri, **1080×1920 / 60 FPS MP4 kodlama
  denemesi 1,5 sn klip → geçerli MP4** (tam süreli ve sesli dışa aktarma ile gerçek telefon test edilmedi).
- **Tamamlanmayanlar:** motion-capture sevinç klipleri (Mixamo vb.), penaltı yolunun `ball-aero.js`’ye taşınması,
  maçta atak/kontra çeşitleri (TASKS T-201…T-212 sürüyor).
- **Sonraki ajan için dikkat:** sevinç stili `pack:<id>` biçimindedir; eski stiller (`kneeSlide`, `packCheer`…) hâlâ
  geçerli. `celebrationSlideEnd=0` stüdyo modunu (yerinde kayış) belirtir. Grafik yerleşimini değiştirirken
  `Stage.overlayLayout` dışına çıkma.

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
