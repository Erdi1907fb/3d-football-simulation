# Ortak geliştirme planı — Codex / Claude Code

Başlangıç: web V172 `2ba43be`; kullanıcı 2026-11-13'te aşağıdaki beş işi sırayla başlatmamızı istedi.
Kararlı sürüm VERSION'dadır. Bu planın varlığı beş aşamanın tamamlandığı anlamına gelmez.
Ajan değişiminde AGENTS.md → PROJECT_STATE → en yeni HANDOFF → TASKS → bu dosya okunur.
Her aşamada yapılan, test edilen, eksik kalan, sıradaki somut adım ve commit/dal yazılır.

| Sıra / görev | İş | Durum | Kabul ölçütü |
|---|---|---|---|
| 1 / T-286 | Oyuncu–top teması, alım/vuruş hazırlığı ve kaleci el–top pozu | done (V173) · codex | Gerçek temas zamanı/noktası; ulaşılabilir eklem hareketi, kök/top ışınlaması yok; normal/arena/P/FK'de aynı sunum yolu, arama/geri sarma deterministik |
| 2 / T-287 | Takım halinde oyun | done (V173) | Verkaç/üçüncü oyuncu/bindirme ve top kaybı sonrası savunma; kararlar gerçek sahiplik/koridor/oyuncu erişimine bağlı; gol kotası yok |
| 3 / T-288 | Kalabalık Japon Kale | done (V173) | Özellikle6takımda destek/markaj dağılımı, top çevresine yığılma; V172 sabit örnekleriyle pas alımı/risk/sahipsiz top ve yakınlık ölçümü |
| 4 / T-289 | Maç ve takım karakteri çeşitliliği | done (V173) | Tohumla tekrar üretilebilir farklı genişlik/tempo/doğrudanlık; gerçek oyuncu istatistiği veya doğrulanmış taktik iddiası yok; her mod kendi kurallarını korur |
| 5 / T-290 | Gerçek kullanım / 1080p video | partial (V174; yerel tamamlandı) | Tam34,5sn5v5sesli1080p60/2070kare, UIiptal/tekrar hazırlama/gerçekindirme/ileri-geri/1xhızended ve ffmpegdecodePASS; yalnız fizikselWindows/iPhone/Android matrisi açık |

## Motor ve tasarım kararları

- Kullanıcının web repo'su `Erdi1907fb/3d-football-simulation` esas ürün. Mevcut saha, forma, yüz, oyuncu modelleri ve lig sunumu korunur.
- League-Soccer / GameplayFootball C++ yaklaşımı (`Erdi1907fb/Yeni-Video`, Windows engine kaynağı), Apache-2.0: yetişme zamanı, pas koridoru ve gözleme dayalı kaleci V172'de özgün JavaScript olarak uyarlandı. `football-intelligence.js`, D-033 ve research/SHARED-INTELLIGENCE-V172.md esas kayıt.
- Football Manager/FM benzeri görüntü veya takım oyunu bir hedef/referans ifadesidir. FM'nin özel motoru/kodu/varlıkları bu repoya alınmadı. Tam native motor veya WASM portu yapılmış gibi raporlama.
- Normal maçın mevcut hedef skor/goalLedger sözleşmesi korunur; arena/stüdyolarda gerçek temas fizik sonucu üretir. Gol/kurtarış/seri uzunluğu kotasıyla sonucu zorlama.
- İstatistiksel ölçümler örnek mühendislik verisidir; bütün durumlarda kalite artışı diye genelleme. V172'de6taraf alımı17→15düştü; sahipsiz oranı.508→.542arttı; üçüncü aşama bunu özellikle ele alır.
- PHP bülten/5gün/veri/cron akışına bu plan kapsamında dokunma. Hostinger yayını ayrıca yapılmadıkça sadece GitHub güncellemesi olarak raporla.
- Yeni modül UMD; ortak scene/ball-aero/video-core kullanılır. Kullanıcı arayüzü TR/EN. Saha/kamera/kaleci alanları aşağıdaki mevcut sözleşmelere uyar.

## Başlangıç durumu ve bilinen açıklıklar

- V172:34Node/PHP test, yazılımsal Chromium normal/P/FK/2/3/6arena ve4→3→2→4eleme geri sarma geçti. Yeni MP4 kodlama denenmedi.
- T-283 yüksek kaleci pozunda kalan yükseliş: `scene.js` prosedürel dive + tipOver + `football-clips.js`; gerçek contactPoint/time V172'de eklendi, bütün pozlar düzelmiş kabul edilmez.
- Anlık arena geometrisi `sample(t).layout/goals/stage`; `contest.layout/goals` başlangıç. Eleme sahası yeniden kaybolup büyük zemin kalmamalı.
- İlk uygulama adımı: gerçek vuruş/alım verisinin ortak animasyon katmanına hangi modlarda taşındığını ölç, kaleci gövdesini topa ulaşmak için keyfî sürükleyen yolu sınırla; ardından takım oyunu.

## Her devirde güncellenecek

1. TASKS'ta görev durumu/sahibi/dosyaları.
2. HANDOFF'ın en yeni kaydında son somut iş, doğrulama ve sonraki adım.
3. PROJECT_STATE'te kararlı sürüm ve devam eden geliştirme.
4. Sürüm kapanınca CHANGELOG/manifest ve test özeti, aynı commit.
5. Yarım bir aşamayı done yapma; fiziksel telefon/Windows yoksa ona ait satırı açık bırak.

## V173 çalışma kaydı — 2026-11-13 UTC / Codex

- T-286 uygulandı: ortak erişilebilir vuruş/alım IK, dondurulmuş alım noktası, arena gerçek pas/vuruş noktaları, normal prosedürel alım noktası; kalecide tek yükselme ve sınırlı gövde düzeltmesi. Sol/sağ temas, kök/top değişmezliği ve sınır testleri PASS. Tarayıcı doğrulaması sürüyor.
- T-287 uygulandı: gözlenen son pasa bağlı verkaç/üçüncü oyuncu teklifleri, normal collective bağlantısı ve arena takım destek planı; top kaybında örtü koşusu. `teamwork.cjs` PASS; gerçek gol sonucu değişmezlik şartı korunur.
- T-288 uygulandı: katılmayan rakip sektöründe örtü tutar; takım destek açıları ortak dağıtılır, pas alıcısı ball-aero ile yavaşlayan topun erişilebilir noktasına koşar. Altı takımlı örnekte15→26alım, yakın çift/kare1.715→1.403. 5v5yakınlık/risk her ölçüde iyileşmedi; tam sonuç final rapora girecek.
- T-289 uygulandı: balanced/combination/vertical/wide sentetik takım kimliği profilleri; açık kullanıcı taktikleri önceliklidir. Kimlikten deterministik, gerçek kulüp taktiği iddiası yok.
- T-290 çalışılıyor: tüm maç zamanı/ileri-geri çizim, gerçek1080pMP4 üretim+decode ve iptal/yeniden üretim için Chromium harness hazırlanıyor. Fiziksel telefon/Windows testi yapılmış değildir.
- Tam36testlik paket ve tarayıcı çalışması sürüyor; henüz V173kararlı ilan edilmedi. Sonraki adım: testleri bitir, çıkan gerçek hatayı düzelt, kod/rapor/manifesti beraber kapat.

## V173 kapanış / sonraki ajan

T-286…T-289uygulandı,36regresyon geçti ve normal/P/FK/2/3/6arena Chromium'da
çizildi. Ara günlükteki "testler sürüyor" ifadeleri bu kayıtla tarihsel kalır.
T-290kısmi: yerel tarayıcı/kodlama sonucu araştırma raporu ve en yeni HANDOFF'ta;
fiziksel Windows/telefon ve tam süreli sesli maç kanıtı hâlâ açık.
T-291:5v5/3taraf risk/yakınlık tradeoff'u ve izole hazırlama süresi. Sonraki hedefV174.
Ajan değişiminde önce en yeni main, sonra en yeni HANDOFF; WIPkontrol noktasını
son sürüm sanma. Kullanıcının saha/forma/lig görünümü ve V172eleme düzeni korunur.

Yerel T-290sonucu:51.4snzaman çizelgesi ileri/geri PASS, iptal/yeniden üretim PASS;
0.3snsessiz1080×1920/60FPSgerçek sahne klibi WebCodecs ve software yollarında
üretildi, ffprobe/ffmpeg18ayrı kareyi çözdü. Detay research/v173-video-validation.json.
Fiziksel Windows/telefon ve tam süreli sesli1080p maç hâlâ bekliyor; bu yüzden kısmi.


## V174 — son yerel test kapandı (2026-11-13 UTC)
T-292/T-293done: AACyoksa yerel yazılımAAC ve sesdoğrulama; hafifgrafikte ağırgölge düzeltmesi.37/37paket+sonhedefliPASS. Tam34,5sn5v5/2070kare1080p60+AAC, gerçekindirme/arama/sesaçık1xhızendedveffmpegdecodePASS. Electronharnessidüzeltildi; teslim/oynatma byte'ıaynı tamamlanmışdosyadan devam ettirildi. Raporresearch/FULL-VIDEO-TEST-V174.md. Beş aşamanın yerel çalışması bitti; T-290fizikselcihazlar bakımındanpartial. SonrakihedefV175/T-291. Canlıyayın yapılmadı.
