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

## [2026-11-10] Codex · V158 → V159
- Dal / commit / PR: `agent/codex/japon-broadcast-trios`; başlangıç `main` @ 25ff94f. Sürüm commit’i `V159: Japon Kale üçlüleri ve güvenli yayın kadrajı`; main’e fast-forward push. PR yok.
- Kullanıcı isteği: Japon Kale görüntüsü ve kamera ilgi çekici değil; oyuncu isimleri oyuncuların üstünde, takım adı kalede. Takımlarda kaleci + defans + hücum; Messi/Piqué/ter Stegen ve Ronaldo/Ramos/Casillas gibi özel üçlüler seçilebilsin. 2–6 kale için ayrı ve büyüyen saha, büyüyen kaleyle büyüyen alan. İndirilen video Instagram Reels ve YouTube Shorts arayüzlerinden korunmuş ana aksiyon kadrajını kullansın. Yeni sürüm main’e push.
- Yapılanlar: PROJECT_STATE 4az / D-021. Kaleci-defans-hücum rolleri ve özel üçlüler (6–18 oyuncu), eski ikililer korunur. 29 mevcut arşiv savunmacısı/kalecisi hafif JSON’a seçildi; hazır efsane eşleşmesi düğmesi. Oyuncu başında gerçek isim/kısa isim, çakışma yerleşimi; kulüp adı kalede. Görsel/fizik aynı çokgen saha verisi; alan kale sayısıyla artar, kale boyutu ölçekler. Ayrı zemin, sınır bandı, kale bölgeleri; eski normal saha parçaları bu modda gizlenir. Üç kamera: aksiyon yayını, saha kenarı, taktik genel. Top, taşıyıcı/hücumcu, yakın saha oyuncuları, kaleci ve direk/net köşeleri perspektifle ortak güvenli bölgeye sığdırılır; MP4 aynı draw yoludur.
- Değişen önemli dosyalar: `assets/japon-layout.js`, `assets/japon-camera.js`, `assets/japon-arena.js`, `assets/japon-engine.js`, `assets/japon-ui.js`, `assets/japon-legends.json`, `tools/build-japon-legends.cjs`, `assets/scene.js` (yalnız japonSides/japonSize dalı), `japon-kale.html`, `tests/japon-camera.cjs`, `tests/run-all.cjs`, VERSION/build/HTML sürüm referansları, release manifesti ve ortak belgeler.
- Tamamlanmayanlar / kısmi: gerçek iPhone/Android/GPU FPS ve tam uzunlukta MP4 kontrolü yapılmadı. 2 sn 1080p60 yazılımsal GPU testi çok yavaş ilerlediği için durdurulup aynı üretim düğmesi/aksiyon draw hattıyla 0,25 sn örnek kodlandı. Bu süre yalnız test kesitidir, ürün maç süreleri/kalitesi düşürülmedi. Hostinger’a yükleme yapılmadı.
- Karşılaşılan sorunlar: ilk varsayılan seçiciler aynı oyuncuyu defans/hücum seçebiliyordu; otomatik seçim farklı kimlikleri tercih eder, manuel tekrarlar doğrulamada reddedilir. Yeni panolar ilk denemede kale çizgisi önünde topu kesiyordu; aktif kale ağızları pano çarpışmasından ayrıldı (görünür/fiziksel açıklık eşleşir). Normal sahnenin batch edilmiş çizim kalıntıları yalnız Japon Kale dalında gizlendi. Kamera testi stateless tutuldu; önceki kareyle yumuşatma kullanılmadı.
- Testler (komut → sonuç):
  - `PATH=/workspace/bin:$PATH node tests/run-all.cjs` → **23/23 PASS**, engine-test dahil (500 seri + 18 normal maç). Test anında VERSION V158; aynı kod V159 numarasıyla kapatıldı. Son yalnız-Japon-Kale sahne maskesi ve son baş yönü düzeltmesinden sonra ilgili sözdizimi/arena/kamera testleri tekrar geçti.
  - `node tests/japon-kale.cjs` → **PASS, 50 senaryo**; mevcut eleme/puan/puan zamanı/sıfırlama/özet/fizik gol çizgisi korunur.
  - `node tests/japon-camera.cjs` → **PASS, 10 üçlü senaryo / 2.103 kadraj kontrolü**, 3 kamera, 2–6 kale, eleme/puan; toplam alan ve büyük kale ölçeği, gerçek rol/actorIndex, güvenli frustum ve deterministik geri sarma. Hedef netin arka köşeleri dahil.
  - Ek 60 üçlü eleme simülasyonu (2–6 taraf, seed 1–12) → **60 tamamlandı, 0 süre aşımı**.
  - Chromium + SwiftShader: 2–6 kale → 6/9/12/15/18 görünür oyuncu; bütün üç kamera gerçek render sonrası güvenli nokta izdüşümünden geçti. İkiliye dönüşte 6 tarafta 12 oyuncu. Hazır Messi/Piqué/ter Stegen – Ronaldo/Ramos/Casillas seçimi doğru; 6 m kale alanı büyütüyor. iPhone 13 viewport: innerWidth=390, scrollWidth=390, üçlü sahne hazır.
  - Son kaynakla gerçek aksiyon karesindeki tüm görünür aktör alt nesneleri `matrixWorld` sonlu; browser pageerror yok.
  - Gerçek MP4 düğmesi, testte yalnız job süresi 0,25 sn’ye ve draw zamanı şut kesitine yönlendirildi (kaynak dosya değişmeden): **PASS**, 543.866 bayt, sayfa hatası yok. `ffprobe` H.264, **1080×1920, 60/1 FPS, 15 kare**. Ön izleme/kamera/etiket çizimi aynıdır. Uzun video/gerçek telefon FPS sonucu olarak yorumlama.
  - `php build.php` → build 159, filesMatch true, mismatches []. `node --check` değişen modüller, `git diff --check` → PASS.
- Sonraki ajan için dikkat:
  - Güncel sürüm V159, sonraki hedef V160. `japon-layout.js` fizik ve render için tek kaynaktır; daire/bağımsız saha kopyasına dönme. Aktif kale ağızlarını panoyla kapatma. 3–6 çokgenlerin toplam alanı büyür; şekilleri farklı olduğundan tek eksen uzunluğu tek başına büyüme ölçütü değildir.
  - `frame.owner` gerçek global aktör slotu; `playersPerSide` 2 veya 3. Şutlarda `actorIndex`; yalnız `team*2+1` hesaplama. Ortak scene `japonSize` kimlik/forma eşlemesi aynı olmalı.
  - Kritik aksiyon bölgesi: 1080×1920 **x64–884 / y295–1220**. Skor bandı x30–909 / y1296–1518. Üst/sağ/alt platform UI alanlarına kritik top/oyuncu/kale taşırma. Camera.fit view-offset/critical-point testini koru; export/seek kameraları geçmiş kareye bağlı olamaz.
  - `japon-arena` yalnız kendi kaynaklarını dispose eder, ortak saha/net/çim kaynaklarını silmez. UI `disposeScene` arena→world sırasını korur. Genel scene maskeleri yalnız `options.japonSides` dalındadır.
  - Oyuncu adları üstte, takım adı kalede; özel üçlülerin logoları giyilen forma takımına aittir. Arşiv seçkisi mevcut veri kaynağından yeniden üretilebilir, ek harici medya yok.
  - Görsel kanıtlar bu çalışma alanında `/workspace/artifacts/v159/` (iki özel üçlü açısı, 3/6 saha, 6 kale aksiyon, kısa MP4); yeni ortamda tekrar üretilmelidir. Gerçek cihaz/uzun MP4 testi T-209/T-266 kapsamında açıktır. Önceki iOS/veri/renk/kontrast kuralları devam eder.

---

## [2026-11-10] Codex · V157 → V158
- Dal / commit / PR: `agent/codex/japon-kale-commentary`; başlangıç `main` @ 13472f2. Sürüm commit’i `V158: Japon Kale ve zamanlı anlatım`; testlerden sonra `main`’e fast-forward push. PR yok.
- Kullanıcı isteği: 2–6 taraflı Japon Kale; her tarafta 1 kaleci + 1 saha oyuncusu; gol yiyerek eleme ve tur sayacı sıfırlama / gol +1, yenilen −1 puan modu; takım/serbest ikili/forma seçimi; dikey video ve dereceler. Bütün maç/stüdyolarda video zamanına bağlı TR/EN kopyalanabilir anlatım; görsel kanıt; testler ve main push.
- Yapılanlar: PROJECT_STATE 4ay, DECISIONS D-020. Yeni mod ana sayfa ve iki stüdyo menüsünden açılır. Kaleci/oyuncu/forma kaynakları bağımsız; yıldızlar ve millî kaleciler dahil. Ortak 120 Hz aerodinamik top adımları; kaleci/gövde/direk teması, açık şut yolu seçimi ve gövde aralığı. Bütün golleri koruyan video kesitleri, genel/aksiyon kamera, eleme turu ve altın/gümüş/bronz/dereceler. Anlatım gerçek olay ve isimlerden çıkar; TXT/SRT/kopyala; ses sentezi eklenmedi.
- Değişen önemli dosyalar: `japon-kale.html`, `assets/japon-engine.js`, `assets/japon-ui.js`, `assets/commentary.js`, `assets/commentary-ui.js`, `assets/scene.js` (yalnız japonSides aktör seçimi), `assets/app.js` (salt okunur commentaryMatch), `assets/freekick-ui.js` (participantName dışa açıldı), `assets/penalty-link.js`, HTML önbellek sürümleri, `VERSION`, `build.php`, `index.php`, release manifesti, iki yeni test ve `tests/run-all.cjs`, ortak belgeler.
- Tamamlanmayanlar / kısmi: fiziksel iPhone/Android ve gerçek GPU testi yok; tam maç uzunluğunda Japon Kale MP4’ü bu ortamda baştan sona kodlanmadı. MP4 hazırlama düğmesi kısa 0,2 sn gerçek örnekte çalıştı; uzun üretim aynı paylaşılan video hattını kullanır. Canlı Hostinger’a yükleme yapılmadı. Önceki T-209/T-262…T-266 açık kalır.
- Karşılaşılan sorunlar: ortamda PHP yoktu; PHP 8.4 CLI ve mbstring yalnız `/tmp/php-runtime` içine indirildi (`/workspace/bin/php` sarmalayıcı), sunucu/proje PHP kodu değiştirilmedi. İlk national-competitions testi mbstring eksikliğiyle başarısızdı; eklentiyle tekrar geçti. İlk yapay konsept test yükü eksikti; gerçek `SekmeConceptEngine.payload` ile test yeniden yapıldı ve geçti. Kale çerçevesi kaynak sahnede batch edildiği için arena klonlarında görünmüyordu; ortak net + görünür küçük kale çerçevesi eklendi. Kalecilerde diveSide açıkça verilir.
- Testler (komut → sonuç):
  - `PATH=/workspace/bin:$PATH node tests/run-all.cjs --quick` → **21/21 PASS** (başlık sürümü test sırasında V157; aynı kod sonra V158 numarasını aldı).
  - `node tests/engine-test.cjs` → **PASS**, 500 penaltı serisi + 18 maç (tam paket içinde ~110,5 sn).
  - Son arena gövde aralığı/reyting/blok düzenlemesinden sonra `node tests/japon-kale.cjs` → **PASS, 50 senaryo**, `node tests/commentary.cjs` → **PASS**.
  - `php build.php` → `build:158, filesMatch:true, mismatches:[]` (manifest final kod/build dosyalarından üretildi).
  - Chromium + SwiftShader: penaltı ve FK hazırlandı, İngilizce anlatım, hata yok; Japon Kale 4 taraf eleme, 6 taraf puan ve final, 2 taraf Messi & Ederson serbest ikilisi + Barcelona forması; iPhone 13 viewport 390 px → belge genişliği 390 px, sayfa hatası yok.
  - Ana sayfa gerçek konsept üreticisi: İspanya 2010–Brezilya 2002; metindeki golcüler Rivaldo/Ronaldo/David Villa, skor 1–2, video zaman eşlemesi doğrulandı. Normal resmî/personal ve konsept aynı `Sekme3D.commentaryMatch` kaynağından geçer.
  - Panoya kopyalanan metin textarea ile birebir; SRT indirme gerçek tarayıcıda alındı. Gerçek MP4 düğmesi 0,2 sn kodlama örneğini tamamladı; ffprobe önceki aynı kodlama kontrolünde H.264, 1080×1920, 60/1 FPS, 12 kare gösterdi. Tarayıcı testleri fiziksel cihaz testi değildir.
  - `node --check` yeni dört modül + `git diff --check` → PASS.
- Sonraki ajan için dikkat:
  - Güncel sürüm **V158**, yeni hedef **V159**. Önce fetch/pull ve ortak belgeler. Kullanıcının yeni isteği eski görevlerden öncelikli.
  - Japon Kale `sample(t)` **video saniyesi** alır; `liveTime` ayrı. `liveEvents` ile `events` zamanlarını karıştırma. Tüm gol/elemeler video kesitlerinde korunur; seyrek atak araları kesilir. Elemede tur GA sıfırlanır, toplam GA kalır.
  - `japonSides` sadece bu modda kullanılmalı; diğer modların sahnesi/renkleri/kontrastı değişmedi. Yeni arena görüntüsü ortak oyuncu/forma/yüz/animasyonlarla üretilir.
  - Anlatım TTS değildir. Eksik veride kafa vuruşu, asist veya istatistik uydurma; maç zamanını doğrudan SRT’ye koyma (`toVideoTime` gerekir). Aynı senaryo metni TR/EN yeniden üretilebilir.
  - Yeni stüdyo MP4 sonrası GPU sahnesini bırakır; oynatma/seek aynı contest ile yeniden kurar. Tam uzunlukta ve gerçek telefon MP4 testi sonraki doğrulama önceliğidir.
  - Önceki iOS LITE/tek sahne, veri paketi dışlama, canlıya yalnız GET ve parlaklık/kontrast kuralları geçerlidir. `data/` güncelleme paketine girmez.

---

## [2026-11-10] Claude Code · V157 → V157 (belge bakımı, sürüm artırılmadı)
- Dal / commit / PR: `claude/great-curie-v7xiuc` → `main`’e hızlı ileri; başlangıç `main` @ 961f797 (V157). Bu bakımın
  commit kimliği commit mesajında “docs: Codex devri öncesi belge bakımı”; PR yok.
- Kullanıcı isteği (özet): Codex ile ortak çalışmaya geçmeden önce devir düzenini toparla; VERSION V157 iken eski V116
  hedefleri, `release-v115.json` referansı ve tutarsız tarihleri düzelt; görev panosunu eşitle (emin olunmayan iş
  “tamamlandı” sayılmaz); HANDOFF’a devir raporu; oyun kodu değişmez, sürüm artmaz; `main`’e push.
- Yapılanlar:
  - `PROJECT_STATE.md`: sürüm tablosu (V157 @ 961f797, sonraki hedef **V158**, manifest `release-v157.json`, canlı
    sunucu PHP 8.3.36 + cron yok), tarih kuralı (UTC commit tarihi), “Bilinen sınırlar” eskimiş maddeleri düzeltildi
    (penaltı `ball-aero` V110’da bitti) ve doğrulanmamış canlı/cihaz konuları eklendi.
  - `TASKS.md`: “Aktif hedef V116” → V158; açık işler yeniden sıralandı; yeni T-261…T-266; V136–V157 için
    tamamlanan (T-240…T-247) ve **kısmi/doğrulanmamış** (T-250…T-254) tabloları; T-209/T-222/T-233/T-234 notları
    güncel duruma göre; T-213 ile T-215 aynı iş olarak işaretlendi.
  - Tarihler (UTC commit tarihine göre): V154–V157 2026-11-11 → 2026-11-10; V147 2026-11-10 → 2026-11-09; V110
    2026-11-08 → 2026-11-07 (`CHANGELOG.md`, `HANDOFF.md`).
  - `AGENTS.md` test tablosuna eksik 5 test eklendi (duo, kickoff-referee, national-competitions, forecast-lock,
    callup-filter); `--quick` kapsamı yazıldı.
- Değişen önemli dosyalar: `AGENTS.md`, `docs/ai/PROJECT_STATE.md`, `docs/ai/TASKS.md`, `docs/ai/HANDOFF.md`,
  `docs/ai/CHANGELOG.md`. Oyun/sunucu kodu, `VERSION`, `?v=` değerleri ve release manifesti **değişmedi**.
- Tamamlanmayanlar / kısmi: T-261 (görsel geliştirme; oyuncu animasyonu ve taraftar katmanı açık), T-209/T-266
  (gerçek cihaz), T-262…T-265 (canlı sunucu: cron, `kadro.php` şifresi, BSD anahtarı, Transfermarkt erişimi).
- Karşılaşılan sorunlar: belgelerde karışık tarih kuralı (UTC/TRT) ve sonraki sürümlerde güncellenmeyen V116/V115
  satırları vardı; V119–V135 işleri panoya ayrı satır olarak hiç işlenmemişti (CHANGELOG’da var, panoda not düşüldü).
- Testler (komut → sonuç; 2026-11-10, belge değişikliğinden önce, kod V157):
  - `node tests/run-all.cjs --quick` → 19/19 PASS (çıkış 0).
  - `node tests/engine-test.cjs` → PASS (500 penaltı serisi, 18 maç; ~142 sn).
  - Tarayıcı/cihaz testi bu bakımda **çalıştırılmadı** (kod değişmedi). `tests/summary.json` ve
    `tests/variation-results.json` test çıktıları commit’e alınmadı (geri yüklendi).
- Sonraki ajan için dikkat (Codex):
  - Önce `git fetch && git checkout main && git pull`; tek kaynak `VERSION` (V157), yeni iş **V158** hedefiyle.
  - Sürüm kapatma: `VERSION` → HTML `?v=` → `node tools/make-release.cjs` → `build.php`/`index.php` build no →
    `git rm` eski `assets/release-vNNN.json`. Güncelleme ZIP’ine **asla** `data/` koyma (V136 olayı; kullanıcı sunucudaki
    `data/private`’ı korur).
  - **Parlaklık, kontrast, ton eşleme ve bloom ile oynama** (kullanıcının açık isteği; V121 seremoni hatası, V143).
    Görsel işte her adımda önce/sonra görüntüsü göster.
  - iOS: `broadcast-remaster.js` iOS’ta LITE zincir, stüdyolarda tek yüksek sahne + MP4 sonrası sahne bırakma
    (V142/V146) — tam zinciri ya da iki sahneli katman değişimini iOS’ta geri açma.
  - Millî kadro: `pp_national_callup` önceliği elle > Transfermarkt > Wikipedia > editoryal; BSD tahmini yalnız aday
    listesiyle süzülür. Aday kadroda olmayan oyuncu 11’e de yedeğe de giremez (kullanıcının kesin kuralı).
  - Canlı site okumak için yalnız GET; `durum.php?action=collect` ve `kadro.php` yazma işlemlerini kullanıcı onayı
    olmadan yapma. `forecast-lock` artık geri yükler, durdurmaz (V140) — `throw` geri ekleme.
  - Kullanıcı Türkçe yazar; yanıt/rapor Türkçe. Commit/PR metnine model kimliği yazma.

---

## [2026-11-10] Claude Code · V156 → V157 (kararlı)
- Karda nefes buharı (PROJECT_STATE 4ax). quick 19/19; kaleci gözü kar görüntü dizisi.

---

## [2026-11-10] Claude Code · V155 → V156 (kararlı)
- Direk titremesi, sekme tozu, hava durumuna göre sıçrama (PROJECT_STATE 4aw). quick 19/19; titreşim sayısal ölçüldü,
  yağmurda FK görüntüsü.

---

## [2026-11-10] Claude Code · V154 → V155 (kararlı)
- Kaleci kurtarış sevinci (PROJECT_STATE 4av). quick 19/19; penaltı kurtarış görüntüsü.

---

## [2026-11-10] Claude Code · V153 → V154 (kararlı)
- **İstek:** kalanları (oyuncu/kaleci/taraftar) seremonideki gibi bozmadan geliştir.
- **Yapılanlar:** PROJECT_STATE 4au. quick 19/19; penaltı + FK sıçrama görüntüleri.

---

## [2026-11-10] Claude Code · V152 → V153 (kararlı)
- **İstek (gece, otonom):** FC27 gibi file; sonra top fiziği, top, oyuncular, kaleci, stadyum, taraftar hepsi.
- **Yapılanlar:** PROJECT_STATE 4at. quick 19/19; penaltı yayın + kaleci gözü + maç görüntüleri.
- **Yapılmayan:** oyuncu/kaleci/taraftar animasyon katmanı (büyük, riskli; ayrı adımlarda önce/sonra ile yapılmalı).

---

## [2026-11-10] Claude Code · V151 → V152 (kararlı)
- **İstek:** kaleci gözünde takımlar sağ/sol ayrı; sonra file → top fiziği → top → oyuncular → kaleci → stadyum → taraftar.
- **Yapılanlar:** PROJECT_STATE 4as. quick 19/19; kaleci gözü ve yayın açısında gol anı kare dizileri.
- **Sıradaki:** top fiziği / top.

---

## [2026-11-10] Claude Code · V150 → V151 (kararlı)
- **İstek:** kaleciler de penaltı/FK vurucusu olabilsin. Yapıldı (PROJECT_STATE 4ar). quick 19/19; tarayıcıda GK düellosu.

---

## [2026-11-10] Claude Code · V149 → V150 (kararlı)
- **İstek:** penaltı/FK için kaleci gözü açısı, vurucunun üstünde isim; ardından sıradaki kalite adımları (kale → top…).
- **Yapılanlar:** PROJECT_STATE 4aq. quick 19/19; penaltı + FK kaleci gözü görüntüleri (vuruş öncesi / top yolda).
- **Sıradaki:** kale filesinin topla etkileşimi (sallanma), sonra top fiziği / top, oyuncular, kaleci, stadyum, taraftar.

---

## [2026-11-10] Claude Code · V148 → V149 (kararlı)
- **İstek:** “6–8” yazısını kaldır; sırayla zemin → kale → top fiziği → top → oyuncular → kaleci → stadyum → taraftar.
  Parlaklık/kontrastla oynama YOK. **Yapılanlar:** PROJECT_STATE 4ap. quick 19/19; önce/sonra maç görüntüsü.

---

## [2026-11-10] Claude Code · V147 → V148 (kararlı)
- **İstek:** panolarda “NEXT 90 SIM” istemiyor; profil resmi + @next90sim. Yapıldı (PROJECT_STATE 4ao). quick 19/19.

---

## [2026-11-09] Claude Code · V146 → V147 (kararlı)
- **İstek:** 2v2 ikinci oyuncu portresi boş; fileler çok sık; FK çeşitliliği/kaleci gerçekçiliği; FK takımda 5 vurucu;
  genel grafik/FPS “çağ atlatma”.
- **Yapılanlar:** PROJECT_STATE 4an. Genel “çağ atlatma” (T-11) bu sürümde yalnız file + FK olarak ele alındı; kalan
  geniş görsel geliştirme açık görev.
- **Testler:** quick 19/19 (freekick.cjs physicalMatch .997); penaltı/FK gol anı görüntüsü yeni fileyle.

---

## [2026-11-09] Claude Code · V145 → V146 (kararlı)
- **İstek:** iPhone'da video oluşuyor ama sonra sayfa çöküp yenileniyor.
- **Yapılanlar:** PROJECT_STATE 4am. **Testler:** quick 19/19; iPhone 13 emülasyonu (kısaltılmış seri): iki stüdyoda MP4 →
  sahne bırakıldı, video + Kaydet görünür, Oynat → sahne yeniden kuruldu, hata yok.

---

## [2026-11-09] Claude Code · V144 → V145 (kararlı)
- **İstek:** BSD tahmininde de Kerem var; doğru kaynak bul, olmazsa elle düzenlenebilir sistem.
- **Yapılanlar:** PROJECT_STATE 4al (Transfermarkt + kadro.php).
- **Testler:** quick 19/19 (TM ayrıştırma fixture'ı `tests/fixtures/tm-turkey-squad-202611.html`); kadro.php yerelde:
  şifre oluşturma, kayıt, yanlış şifre, elle 11 → API'de 4-1-4-1 ve doğru mevkiler.
- **Dikkat:** kullanıcı kadro.php şifresini yüklemeden hemen sonra belirlemeli (ilk gelen belirler).

---

## [2026-11-09] Claude Code · V143 → V144 (kararlı)
- **İstek:** millî kadrolar hâlâ yanlış (Arda'nın numarası yok, yedekler garip); BSD'den (bzzoiro) düzgün çek.
- **Yapılanlar:** PROJECT_STATE 4ak. BSD anahtarı kullanıcı tarafından bu oturumun ortamına kaydedildi (değer görülmedi);
  API canlı incelendi. Aday kadro haberlerle doğrulandı (Hürriyet, Habertürk, Aksiyon).
- **Testler:** quick 19/19 (`callup-filter.php`: numaralar benzersiz, yedek kaleciyle başlar, ≤12, idempotent);
  canlı BSD ile Türkiye XI: Uğurcan; Ferdi, Ozan, Merih; Zeki, Hakan, İsmail, Oğuz; Salih, Arda; Deniz.

---

## [2026-11-09] Claude Code · V142 → V143 (kararlı)
- **İstek:** aday kadro dışı oyuncular (İrfan Can, Kerem, Altay, Şengezer) yedekte bile olmasın; seremoni logoları eski
  netlikte; düelloda istenen takımın forması.
- **Yapılanlar:** PROJECT_STATE 4aj. Canlı site hâlâ build 140'tı → V141 aday kadro filtresi yüklenmemişti.
- **Testler:** quick 19/19; seremoni önce/sonra görüntüsü; iPhone 13 emülasyonunda 2v2 Barcelona/Real Madrid formaları.

---

## [2026-11-09] Claude Code · V141 → V142 (kararlı)
- **İstek:** iPhone 13'te stüdyolardan MP4 inmiyor, Safari “birçok kez sorun oluştu” (sekme çöküşü).
- **Yapılanlar:** PROJECT_STATE 4ai. **Asla** iOS'ta tam sinematik zinciri ya da iki sahneli katman değişimini geri açma.
- **Testler:** quick 19/19; iPhone 13 emülasyonu: iki stüdyoda MP4 1 sn'de kodlamaya başlıyor, güvenli mod yükleniyor.
  Gerçek cihaz testi kullanıcıda.

---

## [2026-11-09] Claude Code · V140 → V141 (kararlı)
- **İstek:** site kaynakları kendi çeksin; geçmiş istatistikler; İrfan Can hâlâ kadroda.
- **Yapılanlar:** PROJECT_STATE 4ah. V140 canlıda doğrulandı (kullanıcı sitesi, durum.php ile toplama → 32 maç).
- **Testler:** quick 19/19 (yeni callup-filter.php); boş veri + yalnız ziyaret → 20 sn'de 26 UNL maçı.
- **Dikkat:** canlı siteyi okumak için yalnız GET kullan; durum.php collect kullanıcı onayıyla.

---

## [2026-11-09] Claude Code · V139 → V140 (kararlı, ACİL)
- **İstek:** V139 sonrası da maç yok, Uluslar Ligi de yok; V107 datası da çalışmıyor.
- **Kök neden ve çözüm:** PROJECT_STATE 4ag (forecast-lock RuntimeException → her güncelleme 503). Kilit artık geri yükler,
  durdurmaz; tek maç hatası yayını durdurmaz. Kullanıcı hiçbir dosya silmeden V140'ı yüklemeli.
- **Testler:** quick 18/18 (yeni `tests/forecast-lock.php`); kullanıcı senaryosu yerelde 26 UNL + 6 hazırlık.

---

## [2026-11-09] Claude Code · V138 → V139 (kararlı)
- **İstek:** canlı sitede maçlar (Uluslar Ligi dahil) gelmiyor, V107 ya da bizim data konunca da düzelmedi; telefonda stüdyolar
  yüklenirken hata veriyor, MP4 inmiyor.
- **Bulgular/yapılanlar:** PROJECT_STATE 4af. Kod yerelde her veriyle çalışıyor → kullanıcı sunucusuna özgü (izin/cron/ağ);
  `durum.php` tanı + elle veri toplama. Stüdyo export'unda iOS ses kilidi (AudioContext dokunuştan sonra açılıyordu) düzeltildi.
- **Testler:** quick 17/17; `durum.php` boş veriden 8 turda 4889 maç / 32 UNL tahmini; iPhone 13 emülasyonunda iki stüdyoda MP4
  düğmesi → kodlama başladı, hata yok.
- **Dikkat:** kullanıcıdan `durum.php` ekran görüntüsü beklenecek; kırmızı satır kök nedeni gösterir.

---

## [2026-11-09] Claude Code · V137 → V138 (kararlı)
- **İstek:** penaltı ve serbest vuruş stüdyolarına 2v2 oyuncu düellosu (ör. Messi & Yamal vs Ronaldo & Mbappé); yeni modda
  ve diğer kısımlarda telefonda indirme/yükleme sorunsuz olsun.
- **Yapılanlar:** PROJECT_STATE 4ae. Motorlara `partners` (A1,B1,A2,B2 sırası), arayüzde `data-duo` seçeneği + “İkinci oyuncu”
  seçimleri, çift portre/“Soyad & Soyad”, ikili final sevinci, `?mode=duo` vitrin ön ayarı. FK paylaşım hatasında indirmeye düşer.
- **Testler:** `node tests/run-all.cjs --quick` → 17/17 (yeni `tests/duo.cjs`). Playwright iPhone 13 emülasyonu (SwiftShader):
  iki stüdyoda `?mode=duo` hazırlık, `sceneTier('export')` → anlık görüntüler → 1080×1920 60 FPS MP4 kodlama (video/mp4),
  `preview`'a dönüş; sayfa hatası yok, heap ~290 MB.
- **Dikkat:** ikili, birinci oyuncunun formasını giyer (forma numarası oyuncunun kendi numarası; aynı numara görülebilir).

---

## [2026-11-09] Claude Code · V136 → V137 (kararlı)
- **İstek:** millî kadrolar her arada değişiyor; doğru ve kendini güncelleyen bir kaynak.
- **Yapılanlar:** PROJECT_STATE 4ad. Test: Türkiye/Belçika Wikipedia örnekleri (`tests/fixtures/wiki-turkey-squad-202611.txt`).

---

## [2026-11-09] Claude Code · V135 → V136 (kararlı, ACİL)
- **Sorun:** sitede diğer liglerin maçları kayboldu; telefonda/PC'de MP4 hazırlarken sayfa yeniden yükleniyor/takılıyor.
- **Kök nedenler ve çözüm:** PROJECT_STATE 4ac. Kullanıcıya: sunucudaki `data/private/state.json`'u yedekten
  dönebiliyorsa döndürsün; yoksa tahminler cron/ziyaretle yeniden üretilir (geçmiş arşiv tahminleri geri gelmez).

---

## [2026-11-08] Claude Code · V134 → V135 (kararlı)
- **İstek:** yalnız UNL'nin iki maçı değil; tüm millî maçlar lig sistemindeki gibi kalıcı geçmiş olarak birikip
  gelecekteki her millî maç analizine etki etsin.
- **Yapılanlar:** PROJECT_STATE 4ab. Test: back-fill + kapalı ay kontrolü (`national-competitions.php`).

---

## [2026-11-08] Claude Code · V133 → V134 (kararlı)
- **İstek:** millî reytingler site tarafından otomatik güncellensin; grubun ilk maçının sonucu son maçın tahminini etkilesin.
- **Yapılanlar:** PROJECT_STATE 4aa. Test: `national-competitions.php` (PHP=Python, sonuç etkisi, geçici tahmin, uçtan uca güncelleyici).

---

## [2026-11-08] Claude Code · V132 → V133 (kararlı)
- **İstek:** yayın kamerasında aralıklı siyahlık ve geçişlerde kalite düşüşü (tüm modlar, indirilen video).
- **Yapılanlar:** PROJECT_STATE 4z. Gerçek telefonda indirme testi kullanıcıda.

---

## [2026-11-08] Claude Code · V131 → V132 (kararlı)
- **İstek:** millî maç analizinde hazırlık maçları az etkili; kıta elemeleri/şampiyonaları, kupalar, form, oyuncu
  istatistikleri ve kadro gücü daha etkili olsun.
- **Yapılanlar:** PROJECT_STATE 4y. Her millî ara öncesi `python3 tools/national-ratings.py` çalıştırıp
  `assets/national-ratings.json`'u commit et (sunucu bu dosyayı okur).

---

## [2026-11-08] Claude Code · V130 → V131 (kararlı)
- **İstek:** UNL/hazırlık maçları "analiz hazırlanıyor"da kalıyor; mevcut verilerle tahmin üretilip oynanabilsin.
- **Yapılanlar:** PROJECT_STATE 4x. Sunucuda ilk güncellemede önceki ay beslemeleri çekilmeli (Hostinger'da kontrol).

---

## [2026-11-08] Claude Code · V129 → V130 (kararlı)
- **İstek:** telefonda stüdyolar açılmıyor; frikik gol tekrarı golü göstermiyor; ara sahne kalksın, video topun yere
  konmasıyla başlasın.
- **Yapılanlar:** CHANGELOG V130 / PROJECT_STATE 4w. Gerçek telefonda test edilmedi (iPhone 13 emülasyonu).

---

## [2026-11-08] Claude Code · V128 → V129 (kararlı)
- **İstek:** sorunu kalite düşürerek çözme; telefonda da en yüksek kaliteyle indirme.
- **Yapılanlar:** PROJECT_STATE 4v. Telefon = masaüstü kalitesi. Kullanıcıdan gerçek cihaz geri bildirimi bekleniyor.

---

## [2026-11-08] Claude Code · V127 → V128 (kararlı)
- **İstek:** şort numaraları kesik; telefonda çalışma V107 (kullanıcının son çalışan sürümü) ile kıyaslanarak düzelsin.
- **Yapılanlar:** CHANGELOG V128 / PROJECT_STATE 4u (ölçümler orada).
- **Dikkat:** `FullBody.attach`'e yeni aktör türü eklerken kemik maliyetini düşün; kenar görevlilerini tam vücut yapma.

---

## [2026-11-08] Claude Code · V126 → V127 (kararlı)
- **İstek:** resmî UNL logosunu her yere yerleştir; telefonda penaltı/frikik/maç indirme çöküyor (siyah ekran, yeniden yükleme).
- **Yapılanlar:** CHANGELOG V127 / PROJECT_STATE 4t.
- **Dikkat:** telefona yeni efekt eklerken `quality.lite` / `SekmeGraphics.mobile` kontrol et; tam çözünürlüklü ek
  render hedefi ekleme. Gerçek iPhone'da test edilmedi — kullanıcı geri bildirimi bekleniyor.

---

## [2026-11-08] Claude Code · V125 → V126 (kararlı)
- **İstek:** büyük takım oyuncularının saç/ten/kel vb. doğru olsun; grafik sıçramasına devam.
- **Yapılanlar:** CHANGELOG V126 / PROJECT_STATE 4s. Test: `crests.cjs` (Lukaku kel, Kanté kazınmış…, ≥850 incelenmiş).
- **Kısmi:** yalnız büyük kulüpler; diğer takımlar eski tahmin/portre yolu. 'short' saç modeli hâlâ kask gibi
  duruyor (geometri sınırı) — sıradaki iş saç geometrisi çeşitliliği.
- **Dikkat:** yeni oyuncular için `python3 tools/appearance-from-photos.py` (etiket dosyasına eklenmeyenler atlanır;
  `--all` ile otomatik tahmin).

---

## [2026-11-08] Claude Code · V124 → V125 (kararlı)
- **İstek:** İrfan Can millî takıma seçilmedi; UNL logosu football-logos.cc sayfasından; doğru TR/EN ülke adları.
- **Yapılanlar:** CHANGELOG V125 / PROJECT_STATE 4r. Testler: `national-competitions.php` (davet listesi), `crests.cjs` (adlar).
- **Eksik:** resmî UNL logosu otomatik indirilemiyor (dosya sunucusu bot korumalı; aşılmadı). Kullanıcı PNG'yi
  verirse: `python3 tools/competition-emblems.py <dosya.png>` → tüm boyutlar + `competition-data.js` gömülüsünü
  (unl anahtarları) yeniden üret.
- **Dikkat:** davet listeleri editoryal; yeni millî arada `assets/national-callups.json` güncellenmeli.

---

## [2026-11-08] Claude Code · V123 → V124 (kararlı)
- **İstek:** UEFA Uluslar Ligi + dostluk maçları yeni lig olarak (API'den fikstür, kadro, TD, muhtemel/kesin 11,
  numaralar, pozisyonlar, bayraklar, uygun scoreboard/seremoni/istatistik şablonu); ayrıca büyük görsel/fizik sıçraması.
- **Yapılanlar:** CHANGELOG V124 / PROJECT_STATE 4q. Test: `php tests/national-competitions.php` (çevrimdışı ESPN örnekleri).
- **Eksik/kısmi:** resmî UNL logosu indirilemedi (football-logos.cc dosya sunucusu bot korumalı; aşılmadı) → proje
  amblemi kullanılıyor. Teknik direktör yalnız FotMob'da bulunan takımlar için. Fizik tarafında bu sürümde büyük
  değişiklik yok. Gerçek sunucuda (Hostinger) ilk cron çalışmasında fikstürlerin geldiği kontrol edilmeli.
- **Dikkat:** Points tabanlı efektler (flaş) SwiftShader'da görünmüyor; yeni efektlerde instanced mesh kullan.

---

## [2026-11-08] Claude Code · V122 → V123 (kararlı)
- **İstek:** kalan grafik/animasyon/görünüm geliştirmelerine devam.
- **Yapılanlar:** CHANGELOG V123 (saç, cilt, NaN güvenlik adımı).
- **Dikkat:** MeshPhysical `anisotropy` bu modelde NaN üretir (teğet yok). SANITIZE adımını kaldırma.
- **Testler:** `node tests/run-all.cjs --quick` 15/15 PASS; penaltı 1080×1920 kareleri kontrol edildi.

---

## [2026-11-08] Claude Code · V121 → V122 (kararlı)
- **İstek:** frikik: mantıklı vurucular, daha az baraj, net top takibi, penaltı gibi açılış kadrajı, yalnız golde tekrar,
  kaçanda kısa yerinde tepki, daha iyi vuruş stilleri.
- **Yapılanlar:** CHANGELOG V122 / PROJECT_STATE 4o. Testler: `tests/freekick.cjs` V122 bloğu.
- **Dikkat:** FK varsayılan kamerası `cameraPlan` içindeki son dönüş ('behind'); 'player' omuz üstüdür. Vuruşlar
  artık sabit 8,8 sn değil — `kick.start/length` kullan, KICK ile çarpma.
- **Sırada:** kaleci uçuş animasyonlarında çeşitlilik, kafa üstü/köşeye yakın gol varyasyonları.

---

## [2026-11-08] Claude Code · V120 → V121 (kararlı)
- **İstek:** görevliler kollar aşağıda; her modda her zaman 1080p 60 FPS, sabit kalite; hakem-oyuncu santra
  çakışması; seremoni çok parlak; yalnız parlaklık/kontrast değil gerçek görsel sıçrama.
- **Yapılanlar:** CHANGELOG V121 / PROJECT_STATE 4n.
- **Dikkat:** dışa aktarmada kaliteyi düşürme (kullanıcı videoları Instagram/YouTube'a yüklüyor). Telefonda bellek
  sorunu görülürse önce gölge haritasını düşür, önayarı değil. Meksika dalgası tarayıcıda görsel olarak
  doğrulanmadı (yakalanan anlar sevinç/finale denk geldi).
- **Testler:** `node tests/run-all.cjs` 16/16 PASS (yeni `kickoff-referee.cjs`).

---

## [2026-11-08] Claude Code · V119 → V120 (kararlı)
- **İstek:** görevliler turuncu steward yelekli olsun, camın iki yanında, iki takım taraftarının yanında.
- **Yapılanlar:** CHANGELOG V120. `buildSegregation` her sınırda a ve b koltuğunu aynı sıralarda 'vest' yapar.
- **Testler:** `node tests/run-all.cjs --quick` 14/14 PASS; frikik + penaltı kareleri kontrol edildi.

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

## [2026-11-07] Claude Code · V109 → V110 (kararlı)

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
