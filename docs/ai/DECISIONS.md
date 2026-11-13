# DECISIONS — teknik karar kaydı

Biçim: `D-NNN · tarih · ajan · durum (kabul/değişti/iptal)` — karar, gerekçe, sonuç.
Bir kararı değiştiren yeni kayıt eskisini anar; eski kayıt silinmez.

## D-001 · 2026-11-07 · claude · kabul — Kanonik dosya adları, sürüm kopyası yok
**Karar:** `assets/<ad>.js` tek dosya; önbellek kırma `?v=<sürüm>` ile. `*.vNN.js` ve
`next90sim-vNN.html` kopyaları silindi, eski adresler `.htaccess` ile 301.
**Gerekçe:** Aynı dosyanın 5–9 özdeş kopyası vardı; hangi kopyanın canlı olduğu belirsizdi ve iki
ajan farklı kopyaları düzenleyebilirdi. **Sonuç:** −200+ dosya; testler sürümsüz adlara bağlı.

## D-002 · 2026-11-07 · claude · kabul — Üç stüdyo tek sahne/fizik altyapısı
**Karar:** Serbest vuruş için ayrı 3D motor yazılmadı; `SekmeScene` + poz alanları (`wallSet`,
`wallJump`, `penaltyDive`…) + `open-football-adapter.containNet` + `SekmeVideo` yeniden kullanıldı.
**Gerekçe:** Kullanıcı talimatı (“üç bağımsız fizik motoru kurma”). Bir kurtarış animasyonu ya da
forma iyileştirmesi otomatik olarak üç stüdyoya yansır.

## D-003 · 2026-11-07 · claude · kabul — Ball3D yaklaşımı: aerodinamik model + nişan çözücü
**Karar:** `ball-aero.js` — Cd(v) sürükleme krizi (0,45→0,22), Magnus Cl(S)=S/(2,02S+0,42) (üst
sınır 0,34), knuckleball için düşük spinli yan kuvvet salınımı, havada spin sönümü τ≈9 sn,
240 Hz yarı-örtük Euler. Hedefe ulaşan fırlatma hızı sabit nokta iterasyonuyla çözülür.
**Gerekçe:** lukaszgrad/ball3d bir araştırma kod tabanıdır, oyun motoru değildir; gerekli olan
fiziksel modeldir (Goff & Carré 2009, Asai 2007). Çözücü sayesinde falso “boyanmış” değil
fizikseldir ve istenen hedefe gider.

## D-004 · 2026-11-07 · claude · kabul — Sonuç önce olasılık, sonra fiziksel arama
**Karar:** Serbest vuruşta istenen sonuç oyuncu ağırlıklarından çekilir; 90’a kadar aday vuruş
tam çarpışma simülasyonuyla denenir; eşleşme yoksa fiziksel sonuç kabul edilir.
**Gerekçe:** Video içeriği için dengeli skor dağılımı + top ışınlanmadan tutarlı fizik. Ölçüm:
%99,8 eşleşme. “Tanınmış serbest vuruşçu” etiketi kamuya açık itibardır, istatistik değildir
(UI notunda yazılıdır).

## D-005 · 2026-11-07 · claude · kabul — Mixamo animasyonları bu sürümde eklenmedi
**Karar:** Mixamo FBX dosyaları repoya konmadı.
**Gerekçe:** Mixamo indirimi Adobe hesabı gerektirir; Adobe şartları animasyonların oyun/proje
içinde kullanımına izin verir fakat ham dosyaların yeniden dağıtımına (açık repoda ham FBX)
izin vermez. Ajanların hesap açması mümkün değildir. Mevcut sistem CC0/Unlicense klipler
(GameplayFootball, KayKit, Quaternius, MPFB) kullanır. **Sonraki adım:** kullanıcı kendi Adobe
hesabından seçilmiş klipleri indirip `assets/characters/` altına “derlenmiş/retarget edilmiş”
biçimde (ham FBX değil) eklerse entegrasyon T-205 ile yapılır.

## D-006 · 2026-11-07 · claude · kabul — Stüdyo panoları marka-yalnız
**Karar:** `stadium-boards.js` `brandOnly` modunda lig adı/logosu çizmez; `scene.js` bunu
`penaltyStudio`, `freeKickStudio` veya `brandBoards` seçeneğinde açar.
**Gerekçe:** Kullanıcı talimatı: oyuncu düellolarında (ikonlar dahil) lig markası anlamsız ve
karışık; reklam alanı next90sim’in olmalı.

## D-007 · 2026-11-07 · claude · kabul — Savunma blok modeli (veriyle uyumlu biçim)
**Karar:** `collective-play.js` içinde arka hattın en yüksek çıkabileceği nokta pres yoğunluğuna
bağlı (`mix(27, 4, press)`); baskısız (>3,6 m) ve ileri koşan top taşıyıcıda hat 4,5 m’ye kadar
geri çekilir; yatay kayma 0,48·z (±11 m).
**Gerekçe:** Metrica/SkillCorner örnek takip verilerinde savunan takım uzunluğu ≈25–35 m,
genişliği ≈35–42 m ve “baskı yoksa hat düşer” davranışı tipiktir. Değişiklik mevcut
testlerde (18 maç, korunan goller) regresyon üretmedi.

## D-008 · 2026-11-07 · claude · kabul — Ortak hafıza yalnız repoda
**Karar:** `AGENTS.md` (ortak kurallar) + `CLAUDE.md` (Claude eki) + `docs/ai/*`. Codex
`AGENTS.md`’yi otomatik okur; Claude `CLAUDE.md` üzerinden aynı dosyaya yönlendirilir.
**Gerekçe:** İki ajan birbirinin sohbetini göremez; tek doğruluk kaynağı commit edilmiş dosyalardır.

## D-009 · 2026-11-07 · claude · kabul — Sevinçler prosedürel paket
**Karar:** 100 sevinç, 8 varış × 43 imza hareketin adlandırılmış birleşimleri olarak `celebration-pack.js` içinde
prosedürel eklem animasyonu; FIFA/EA varlıkları kullanılmaz (telif). **Gerekçe:** lisans temiz, dosya boyutu küçük
(~15 KB), mevcut iskelet ve tam vücut çalışma zamanıyla uyumlu; motion-capture gelirse aynı `style` adıyla değiştirilebilir.

## D-010 · 2026-11-07 · claude · kabul — Stüdyo grafikleri tek güvenli bantta
**Karar:** Serbest vuruş grafikleri penaltıdaki `Stage.overlayLayout` bandına taşındı. **Gerekçe:** kullanıcı: Reels/Shorts
üst ve alt bölgeleri platform arayüzü altında kalıyor; penaltı yerleşimi sahada doğrulanmış.

## D-011 · 2026-11-07 · claude · kabul — Millî baraj verisi ön hesaplanmış
**Karar:** 32 MB `concept/teams.js` yerine `national-walls.json` (≈630 KB, 16 ülke, 1980–2026). **Gerekçe:** serbest vuruş
sayfasının yükü; kaynak aynı, `tools/build-national-walls.cjs` ile yeniden üretilebilir.

## D-012 · 2026-11-07 · claude · kabul — V108 temizliğinde geri alınan dosyalar
**Karar:** `assets/characters/animations/*.json` (index.json, land.json dahil) ve `base_body.joints.json` geri getirildi.
**Gerekçe:** klasör toptan silinirken referans taramasında listelenmeyen iki dosya da gitmişti; çalışma anında kullanılmıyorlar
ama küçük ve `sources.json` tarafından belgeleniyorlar. Kural AGENTS.md §7’ye eklendi.

## D-013 · 2026-11-08 · claude · kabul — Frikikte yalnız baraj, kaleci, vurucu; küçük/büyük sevinç ayrımı
**Karar:** Kullanıcı isteğiyle kutudaki oyuncular ve hakem kaldırıldı (T-203 ikinci top oyunu bu yüzden kapatıldı).
Her gol için yerinde küçük sevinç, seri sonunda köşede büyük sevinç (penaltı ile aynı). 

## D-014 · 2026-11-08 · claude · kabul — Penaltı uçuşu aerodinamik, sonuç modeli sabit
**Karar:** `penalty-engine.js` görünen uçuşu `ball-aero.solve` ile hesaplar; hedef ve varış zamanı aynı kalır (testte
<0,1 mm). RNG akışı değişmedi; `presentation`/`variation` testleri aynı vuruş sayılarını verir.

## D-015 · 2026-11-08 · claude · kabul — Maç fiziğinde aerodinamik sürükleme
**Karar:** `football-physics.advance` havadaki sürüklemeyi `ball-aero.dragCoefficient` ile hesaplar (0,55 ölçekli).
**Gerekçe:** daha gerçekçi uzak şut yavaşlaması; `engine-test` (18 maç, 54 korunan gol) değişmeden geçti. Yayınlanmış
skorlar `forecast-physics` ile fiziksel olarak yeniden çözülür, değişmez.

## D-016 · 2026-11-08 · claude · kabul — Frikik taraftar bölünmesi uzun eksende
**Karar:** Frikik kamerası her turda farklı açıdan baktığı için bölünme penaltı kamera ışını yerine sahanın uzun ekseninde
(z=0) yapılır: kalenin arkasındaki tribün tam ortadan ikiye ayrılır.

## D-017 · 2026-11-08 · claude · kabul — Hava durumu GPU’da, zaman tabanlı, tek tercih
**Karar:** Yağış parçacıkları shader’da sunum zamanından hesaplanır; kamera çevresinde sarılan dünya-sabit hacim.
Tercih tek yerde (`Next90Weather.preference`) tutulur ve tüm sahneler okur. **Gerekçe:** MP4 kare kare çizilir;
CPU tabanlı parçacık durumu ileri/geri sarmada ve dışa aktarmada tutarsızlık üretirdi. Ek kütüphane yok (0 KB).

## D-018 · 2026-11-08 · claude · kabul — Ticari lisanslı varlıklar
**Bağlam:** Kullanıcı ticari lisanslıların da kullanılabileceğini söyledi (para kazanmayan test/video).
**Karar:** Ajanlar satın alma/hesap gerektiren varlıkları indiremez. Unity/Fab “Standard License” varlıkları yalnız Unreal/Unity
içinde kullanım ve ham dosyayı herkese açık dağıtmama şartı taşır; web sitesi ve GitHub reposu dağıtım sayılır. Bu yüzden repoya
konmaz. Kullanıcı kendi hesabıyla indirip lisansını onaylayarak verirse, `assets/private-licensed/` (gitignore) üzerinden
yerelde/sunucuda yüklenebilecek bir yol kurulur. Erişilebilen en iyi açık kaynaklar (Poly Haven, ambientCG CC0; three.js MIT)
kullanılmaya devam eder.

## D-019 · 2026-11-08 · claude · kabul — Dış kaynak yok, kendi geliştirmemiz
**Karar (kullanıcı):** Bundan sonra harici repo/varlık aranmaz ve eklenmez; grafik, animasyon ve fizik Claude Code ve Codex
tarafından projenin içinde geliştirilir. Mevcut lisanslı içerikler (three.js MIT, CC0 varlıklar, GameplayFootball klipleri)
yerinde kalır. Öncelik: görsel kalite (profesyonel yayın hissi), animasyon, oyuncu/kaleci donanımı, atmosfer.


## D-020 · 2026-11-10 · codex · kabul — Japon Kale varyantı ve video olay zamanı
**Karar:** Kullanıcının kaleci+saha oyunculu 2–6 taraf varyantı: elemede tur gol sayacı sıfırlanır, puanda gol +1/yenen −1. Ortak top fiziği ve ortak sahne aktörleri kullanılır. Araştırılan yerel oyunlarda kurallar değişiyor; bu sürüm resmî Japon futbolu kuralı olarak sunulmaz.
**Kaynak:** https://reisspor.com.tr/page/japon-saha (çoklu kale, gol yiyerek elenme); https://www.ekonomim.com/kose-yazisi/japon-kale-futbol-maci-ve-rekabet-analizi/691008 (herkes kendi kalesini korur). Tur sıfırlama ve kaleci+saha oyuncusu kullanıcının açık tercihidir. Harici kod/varlık eklenmedi.
**Video:** Kesitler bütün golleri korur; anlatım aynı video zamanına bağlıdır. SRT/TXT/kopyalama metin üretir, TTS üretmez. Eşitlikte ortak derece; eleme süresi aşılırsa tamamlanmamış sonuç.


## D-021 · 2026-11-10 · codex · kabul — Üçlü roller ve geometriye bağlı güvenli kamera
**Karar:** Takımlarda/özel üçlülerde kaleci–defans–hücum, mevcut ikililer korunur. Görsel saha ve fizik aynı `japon-layout.js` verisini kullanır; toplam alan kale sayısıyla artar, kale genişliğiyle ölçeklenir. Kullanıcı görsel geri bildirimi: ayrı daire ve uzak kamera yetersizdi.
**Yayın:** `japon-camera.js` kritik noktaları platform arayüzleri için ayrılan ortak aksiyon alanına perspektif olarak sığdırır. Geçmiş kamera durumuna bağlı yumuşatma kullanılmaz; export/seek aynı kareyi üretir. Kulüp adı kalede, isim oyuncuda. Efsaneler mevcut veri arşivinden türetildi; dış kaynak/medya indirilmedi.


## D-022 · 2026-11-10 · codex · kabul — Küçük Saha ayrımı ve referansa uygun yakın yayın
**Karar:** Kullanıcının son talebi D-020/D-021 kadrolarını değiştirir: iki kale süreli Küçük Saha 4v4 (GK+3), 3–6 kale Japon Kale (GK+2). Saha oyuncusu mevkiyle sınırlanmaz; yalnız GK gerçek kaleci. Eski ikili seçimi bu açık talep nedeniyle kaldırıldı; aynı sayfa/ortak altyapı korunur. İlk ev sahibi santrası talebi kullanıcı tarafından geri alındı: top merkezden düşer ve yarışılır.
**Görsel tercih:** Gönderilen eğik yakın çekim referansı tüm takım sayılarında geçerli. Çok takım nedeniyle otomatik üstten genel açıyı seçme. Kamera gerçek atağı izler, aynı tarafta kalır; önceden hesaplanan zaman tabanlı yumuşatma/zoom ve güvenli izdüşüm kullanır. Normal maçın ayrıntılı taraftar modeli, yalnız daha az kişi ve küçük birleşik tribün; ucuz farklı bir figür veya uzak büyük stadyum yok. Eşit taraftar/forma/gol tepkileri.
**Sonuç:** Ek fizik motoru veya harici varlık yok. `japon-crowd.js` ortak spectator yapıcısını kullanır ve kendi poz örneklerini/materiallerini yönetir; normal mod davranışı değişmez. Kullanıcının en son kamera/tribün düzeltmesi bu sürüme dahildir.


## D-023 · 2026-11-10 · codex · kabul — Süreli seri aksiyon ve ortak millî kapsam
**Oyun:** 2–6 takımda 30/45/60/75/90 saniye seçilir. İki takım küçük saha olarak kalır ve ortak normal maç sevinç planından tam takım tepkisi alır; 3–6 takımın varsayılanı süreli puan/seri aksiyondur, gol molası kısadır. Süreli maç bütünü kesintisiz oynar, ardından 5 sn sonuç gelir. İsteğe bağlı eleme seçilen sürede bitmezse tamamlanmamış gösterilir, sahte şampiyon veya geç gol yazılmaz. Normal API'nin süresiz eleme çağrılarında eski 900 sn güvenlik sınırı korunur. Geç dakikalardaki tempo ve öndeki rakibe yönelme oyun kararlarını etkiler, skor/kaleci becerisi zorla değiştirilmez. Her yeni hazırlama yeni kriptografik tohum alır; aynı skorun tekrar etmesi yasaklanmaz.
**Millî takımlar:** Kullanıcı belirsiz cümlesini açıkça “Eksik millî takım ve formaları tüm oyuna ekle” şeklinde netleştirdi. Katalogdaki 85 ülke için mevcut ESPN sağlayıcısından 2.224 oyuncu kadrosu alındı; `club-rosters-v75.json` içinde kulüpler korunarak ortak kayıtlar eklendi. İlk 11 simülasyon seçkisidir, resmî maç kadrosu değildir. `national-kit-profiles.js` mevcut millî renk/desenlerden türetilir, dört mevcut atlas korunur; sezon replikası iddiası veya yeni harici medya yok. Aynı kayıtlar normal maç, penaltı, FK, küçük saha/Japon Kale ve 85 güncel konsept takıma bağlanır. Tarihî arşiv dönemleri korunur.
**Görsel:** Taraftar sektörleri arasında güvenlik koridoru/duvar ve ortak normal güvenlik aktörü. Çim biçme şeritlerinin negatif derinlik ofseti beyaz boyayı örtüyordu; çizgiler ayrı boya katmanında tutarlı derinlik sırasına taşındı. Parlaklık/kontrast değişmedi.


## D-024 · 2026-11-10 · codex · kabul — Fiziksel arena mücadeleleri ve okunaklı yayın skoru
**Kullanıcı:** İki takımlıda yalnız takım/oyuncu grubu adı ve gol skoru, daha net süre. 2–6 tarafta çalım ve karşı savunma, kalecinin tutup dağıtması/geri pasla oyun kurması ve topun çevreden sekerek oyunda kalması. Küçük sahada ceza alanı ve gerçek faulden penaltı.
**Kaynak:** Kullanıcı açıkça GitHub araştırması/uygun kaynak alımı istedi; D-019'un önceki harici kaynak kısıtı bu istek kapsamında güncellendi. Mugen87/Yuka MIT, `10591304811222d6856020d5de129b39ef43b58d` sürümündeki InterposeBehavior/EvadeBehavior okunup küçük 2D tahmin uyarlaması yapıldı. Tam lisans/bağlantılar `assets/vendor/yuka/arena-steering-NOTICE.txt`, kayıt ASSET-LICENSES. Harici servis, bütün motor veya lisansı belirsiz futbol animasyon paketi eklenmedi.
**Oyun:** Dört prosedürel çalımın gövde/ayak/top taşıma yönü aynı olay zarfından; savunmacı gelecekteki taşıyıcı–kale hattını kapatıp topa dönük kayar. Topa önce ulaşma temiz mücadele, geç vücut teması gerçek mesafe/kapanma hızıyla faul adayıdır. Kazanma/sonuç önceden yazılmaz. İki takımda kutu içi penaltı, dışı serbest vuruş; oyuncular/top fiziksel yerleşir, gerçek atış sonucu geçerlidir. Çok takımda avantajla seri aksiyon sürer.
**Süre istisnası:** D-023'ün sabit süre kuralı yalnız son saniyedeki penaltıyı kullanmak için uzatılabilir; ek süre gerçek olayla kayıtlı, panel +süre gösterir ve anlatım bildirir. Genel 30/45/60/75/90 seçimi, gol molaları ve 5 sn sonuç korunur. Duvar/direk/kaleci sekmeleri ve tavanda yumuşak yansıma fizik adımına uygulanır; skor/gol düzeltmesi yapılmaz.
**Kaleci:** Gerçek erişilebilir topu tutar; yerden yuvarlama/elle atma veya ayak pasıyla en açık arkadaşına çıkar. Kendi takımının geri pası elle alınmaz, ayak kontrolü/ayak dağıtımıdır. Ortak keeper IK ve vuruş animasyonları korunur.


## D-025 · 2026-11-10 · codex · kabul — Seçici isimler, yan yayın ve gerçek taraftar finali
**Kullanıcı:** İsim kalabalığını kaldır: açılışta tüm isimler, sonra yalnız top sahibi veya kurtaran kaleci. Skor/logolar/atılan-yenilen daha net. Daha düzenli pas/çalım/şut, gol sonrası doğal top/file tepkisi, tüm sahayı yandan gösteren kamera, kazananın kendi taraftarıyla yakın kutlaması ve anlaşılır mevki menüsü.
**Yayın:** Ön izlemenin 3D çözünürlüğü 540p kalırken 2D skor/isim/arma katmanı doğrudan 1080×1920 çizilir; export yine standart 1080p60. Yatay maxWidth ile harf sıkıştırma kaldırıldı, gerçek genişlik ölçülür ve uzun metin üç noktayla kısaltılır. Çok takımlı destek satırı 14 → 20 px. `japon-broadcast.labelSlots`: ilk1,6 sn tüm aktifler, sonra tek sahip; gerçek kurtarış/tutuş/ayak kontrolünde kısa GK etiketi. Finalde isim yok. Yeni `side-full` yatay yan yayın bütün saha/kaleler/oyuncuları güvenli alana sığdırır ve varsayılandır; yakın aksiyon/saha kenarı/taktik açıları seçenek olarak korunur. Bu açık yeni kullanıcı isteği, D-022'nin otomatik genel açıdan kaçınma kuralını yalnız yeni seçilebilir varsayılan yan yayın/açılış kapsamı için günceller.
**Oyun:** Bir takımda bir baskıcı; sahipli oyunda 3–6 tarafta en yakın iki rakip baskıya girer, diğerleri alan tutar. Takım arkadaşları farklı genişlik/derinlikte pas desteği verir, pas alıcısı uçuşta hedef koşusunu tamamlar. Uygun mesafe/kanal ve rolle pas/şut; baskıda fırsat bulunca çalım, tamamlanmadan otomatik pasla kesilmez. Başarı/başarısızlık gerçek kontrol/mücadele olayından kaydedilir. Skor/sonuç zorlanmaz.
**File:** Ayrı fizik motoru yok. `japon-net.js`, yerel eğimli file ölçülerini normal maçın OpenFootball.containNet panel esnekliğine ve world-upgrade.netResponse cep/dalga tepkisine dönüştürür. Gol molasında da ball-aero adımları sürer, ilk gerçek file temasının zamanı/yer/hızı dalgayı tetikler. Son gol/maç sonu topu da hareket etmeye devam eder. Görsel aynı yerel düğümlere saf zaman örneklemesi uygular; geri sarma ve export aynıdır.
**Final:** Kullanıcı fiziksel koşu ve yakın taraftar kutlaması istediği için D-023/024'teki 5 sn sonuç, 12 sn sonuç/koşu/kutlamaya yükseltildi (`resultDuration`). Kazananlar aynı geometride kendi taraftar sektörünün yanına en çok4,5m/sn ile gider; paylaşılan `pack:wave`/`waveCrowd`, aynı taraftar modeli/tepkisi. Yakın final kameraya bilinçli kesme vardır. Beraberlik/eksik elemede sahte galip/kutlama yok; ortak birincilik korunur. 30/45/60/75/90 sn oyun süreleri ve geç penaltı istisnası aynıdır.
**Menü:** Forvet / Orta saha / Defans / Kaleci başlangıç görevleri açıkça yazılır; saha oyuncusu seçimi hâlâ serbesttir, yalnız GK gerçek kaleciyle sınırlıdır. Millî kadro/forma, normal maç motoru ve diğer stüdyoların davranışları korunur.


## D-026 · 2026-11-10 · codex · kabul — Futbol kararları, iç aksiyon ve kısa maç sonucu
**Yeni kullanıcı kararı:** Küçük saha AI/hareketleri hâlâ göze batıyor; kale dibine taşıma, gelişigüzel sekme ve kalecinin duvar topuna kör takibi düzeltilsin. İki taraflı saha dört dik köşe olsun. Aksiyon kamerası açılış dahil yakın/oyun içinde kalsın. Final kısa olsun; iki taraflı oyunda maç sonucu/skor/golcüler ve kazanan, Japon Kale'de kazanan takım/oyuncular açık yazılsın. Bu açık istek D-025'in 12 sn taraftara yürüyüşü ve varsayılan tam yan yayını günceller.
**Karar katmanı:** Özgün `japon-tactics.js`: atış kanalına taşıma, açık pas/alan/mesafe değerlendirmesi, hareketli alıcıya yerden pas ve uçuşta takım şeklinin korunması, fiziksel duvar temaslı bank pası, hazırlık/plant/vuruş ve bir sonraki aksiyona bağlı kısa niyet. Defansın baskıcı seçimi kısa süre kararlı, diğerleri ayrı hatları korur. Ayak-top mesafesi uygunsa vuruş yapılır; bütün sonuçlar ortak ball-aero/gerçek temasla oluşur.
**Kaleci:** Açı/mesafeye göre kale koruma; 0,16 sn gecikmiş gözlemden aynı top integratörü ve duvarlarla kısa yörünge tahmini. Gelecekteki skor/şut sonucuna erişmez. Tehlike/geri pas/yerine dönüş ayrılır; kurtarış/tutuş yine fiziksel erişim şartlı. İtiş sonrası toparlanma, ayağı/eli uygun kurtarış ve kesin sıfıra dönen dalış zarfı. Kendi tuttuğu topun peşinden kale içinde yürümez.
**Hareket/fizik:** İvme/fren/yön değiştirme sınırları ve filtreli hareket hedefleri, mesafeden akıcı koşu. Sürekli tam slide tackle yerine ayakta müdahale. Vuruş öncesi ayak hazırlığı ve gerçek alım zamanında kontrol pozu; sahip kaybedilince eski hazırlık iptal edilir. Dribbling küçük gerçek temas darbeleri ve serbest fizik arasında akar. `ball-aero.step`te arena'ya özgü `continuousGround` bayrağı, tam yarıçapta duran topun yuvarlanma direncini her adımda uygular; diğer modların varsayılanı değişmez.
**Geometri/yayın:** İki takımda 28×18 m dört köşeli dikdörtgen (boyut ölçeği korunur); 3–6 çokgen değişmez. Yeni varsayılan yakın broadcast; tam yan/taktik seçenekleri durur. Açılışta zoom-out yok, görünür oyuncu etiketlerine ek güvenli bantta bütün başlangıç kadrosu. Kale top yaklaşınca kadraja girer. Gol sonrası merkeze top bırakma bilinçli kamera kesmesidir; izleme/zoom zarfı bu sınırı aşmaz. Böylece santrayı göstermek için bütün önceki aksiyon uzaktan izlenmez. Top örneklemesi de bu gerçek reseti ara konumlardan uçurarak enterpole etmez.
**Sonuç:** 4,5 sn kısa sonuç/yakın kutlama; uzun taraftar turu kaldırıldı. Küçük saha: MAÇ SONU, gerçek kazanan/beraberlik, iki tarafın gol skoru ve golcüler. Çok taraf: yalnız kazanan takım/oyuncu grubu ve puanı; ortak birincilik/eksik eleme dürüst gösterilir. Kazananlar yakınlarında kısa toplanır, oyuncu ışınlanmaz. Seçilen oyun süresi ve geç penaltı istisnası korunur.
**Referans:** FIFA Training Centre ve The FA'nın pas desteği/kaleci pozisyon ilkeleri okundu (`docs/ai/research/ARENA-FOOTBALL-V165.md`). Harici klip/kod/medya alınmadı; maç videosuyla model eğitildiği iddia edilmez.


## D-027 · 2026-11-10 · codex · kabul — Orta mesafe yayın, anlaşılır seçim ve ilişkili arena hareketi
**Kullanıcı kararı:** V165 kamerası aşırı yakın. Top/atak, pas seçenekleri ve saha anlaşılır olsun; dışarıdaki boşluklar baskın olmasın. Sabit yan seçenek, orta çizgideki basın tribününden karşıya bakan yayın olsun. Oyuncu ilişkileri/kaleci daha doğal, file top baskısına göre gerilip bıraksın. Menüde kaynak ve oyuncu seçimleri anlaşılır ayrılsın. Bu yeni karar D-026'nın çok yakın kadraj tercihini günceller; kısa sonuç ve gerçek sonuç politikası korunur.
**Kamera:** En az yaklaşık10×7m saha bağlamı ve7m içindeki ilgili oyuncular, hedef kaleye7m'de direk/file dahil. Hedef sahanın içine sınırlanır; yumuşak takip/zoom ve santra kesitleri korunur. `side-full` sabit noktalar/merkez/zoom kullanır; oyuncu veya top konumu kamerayı oynatmaz. Portre tam saha seçeneği, dikdörtgenin gerçek oranından dolayı aksiyona göre daha geniştir; bütün oyuncuları bir yakın plana sıkıştırma iddiası yok. Kritik noktalar Reels/Shorts güvenli bölgesindedir.
**Oyun:** Hücumda ayrı derinlik/genişlik pas hatları ve pas sonrası devam koşusu, top karşılamada ilk dokunuşla hız alma. İleri güvenli alıcı varken anlamsız geriye dönüş döngüsüne girmez. Rakipte, pas uçuşunda da savunma şekli; birinci baskıcı topa çıkar, diğerleri tehlikeli koşucuları kale tarafından örter. Yaklaşan oyuncular göreli hızdan çarpışmayı öngörür; kalan küçük fiziksel örtüşme ivme/hızla çözülür. Çok takımda her oyuncu aynı serbest topa koşmaz. Bütün sonuçlar gerçek temasla; gol/puan/direk/kurtarış zorlanmaz.
**Kaleci/animasyon:** Hareket yönüne dönüp aynı adımda topa tekrar dönme kaldırılır; hedefte küçük ölü bölge ve kontrollü yan adım/plant. Kurtarış sonrası toparlanırken koşmaz. Ortak keeperContactTime gerçek arena temas zamanını kabul eder, reach hedefi parry sonrası uzaklaşan top yerine gerçek temas noktasıdır; kısa el uzantısı sonra biter. `arenaKeeper` ortak adım ve hazır duruşu etkinleştirir. Eski normal maç template pozları arena durumuna taşınmaz. Drop snapshot'ından sonra aynı adımın tekrar entegre edilmesi giderilir.
**File:** Yeni bağımsız fizik yok. Mevcut OpenFootball panel fonksiyonunda `netElastic` opt-in yay/sönüm, gerçek topu karşılayıp geri bırakır; varsayılan yol diğer modlarda aynıdır. Mevcut world netResponse dalgası, gerçek top yüzeyinin arka/yan/tavan netinde yüklediği yerel cep ile birleştirilir; ağız ve yer bağları sabit. Geri sarma aynı fizik/frame örneğini kullanır. Harici kod/medya eklenmedi.
**Menü:** Takım kimliği/başlangıç kadrosu → rol kartları (“Nereden seçilecek?” / “Kim oynayacak?”) → bağımsız forma. Mevcut takım, ikon, millî takım ve GK kaynakları korunur; saha rolleri seçim kısıtı değildir. TR/EN etiketler ve erişilebilir role özgü select isimleri vardır.

**Regresyon dürüstlüğü:** Yeni şut/koşu kararları eski tohumlarda aynı olay sayılarını üretmez. 25 küçük-saha fixture'ında8 gerçek kurtarış,65pas,56gol oluştu; “mutlaka11 kurtarış” kotası yerine her parry'nin gerçek top temas noktası/erişimi ve her catch'in gerçek GK sahipliği doğrulanır. 45duel fixture'ında kutu penaltısı oluşmadı: penaltı kuralı gerçek geç vücut teması + ceza alanı/nokta/uzatma sınır senaryosuyla, bütün fiilî faul/serbest vuruşlar da uçtan uca doğrulanır. Ürün davranışı test kotasını doldurmak için değiştirilmez.


## D-028 · 2026-11-11 · codex · kabul — 5v5, yasal santra, bağlı savunma ve taraftar/madalya finali
Kullanıcının yeni isteği D-027'nin4v4ve yerinde final kurallarını değiştirir. İki takım kaleci+iki serbest defans+orta saha+forvet (2–1–1), aynı28×18m saha. Diğer3–6takım üçlüdür. Açılış ortak top; sonra küçük sahada yiyenin forvetinden gerçek pas santrası, Japon Kale’de ortak drop. Oyuncular yerlerine yürür/koşar; süreye göre sonucu bitirmek için ışınlanmaz.
Baskı/örtü/adam takibi ve rol bağlantısı; farklı taşıma koridorları, geri dönüş/verkaç, gerçek gelen topa ilk vuruş ve kafa. Plase/sert/alçak/yüksek/aşırtma/orta profilleri, açık alan ve GK konumundan seçilir. Tutuş/parry yalnız ulaşılabilir temasla ve alan içinde; alan dışı/geri pas alçak topları ayakla. `keeperContact` aynı yasayı motorda ve testte kullanır. Gol veya olay kotası yok.
Galipler kendi taraftar sektörüne fiziksel gider,4,5–9sn koşu/kısa kutlama. Japon Kale’ye ardından1,8sn altın/gümüş/bronz ve4–6tam tablo; ortak sıra dürüstçe korunur, eksik elemede madalya yok. Küçük saha maç sonucu/golcüler aynı. Kullanıcı madalyaları açıkça tekrar istediği için önceki yalnız-kazanan tablosu değiştirildi.
Basın kamerası alçak orta stadyum açısıdır. İki kaleyi tümüyle ve oyuncuları büyük görmek portreye göre yatayda daha uygundur; kullanıcıya seçenek soruldu, çalışma sürerken yanıt gelmeyince dikey korunarak ayrıca yatay1920×1080 eklendi. Basın seçimi elle biçim seçilmediyse yatayı açar; elle dikey seçimi korunur. Aksiyon/diğer tercihler ve Reels güvenli alanı sürer. Araç video biçimini kullanır, anamorfik görüntü/oyuncu esnetmesi yok. Near/far hassasiyeti, zemin/çim depth sırası ve arka planla uzak görüntüde siyah çizgili çakışmalar/hard zemin sınırı giderilir.
FIFA pas desteği, baskı–örtü, pivot ve kaleci alan kapatma ilkeleri okundu (`research/FUTSAL-FIVE-V167.md`). Harici video/kod/varlık alınmadı, modelin maç videosuyla eğitildiği iddia edilmez. Ürün kuralları resmî tam futsal kural seti olarak sunulmaz.

## D-029 · 2026-11-11 · codex · kabul — FK kalecisinde sınırlı itiş ve vuruş çeşitleri
Kullanıcı bar üstüne gerçek dışı sıçrama ve tekdüze ayak vuruşları bildirdi. Eski `(hedefY-.5)*.8` yüksekliği ortak dalış kaldırmasına ekleniyordu; artık9,81m/s² balistik yükseklik, en çok0,38m itiş ve16m/s² sınırlı yanal hızlanma vardır. Aynı keeperTravel fiziksel erişim elipsinde ve görünür konumda kullanılır. Gerçek temas noktası/zamanı; tutuşta gerçek GK sahipliği ve el teması. `keeperGrounded` yalnız bu pozlarda zemine gömülmeyi düzeltir; diğer modların varsayılanı aynı.
Gerçek spin/nişanlı alçak falso profili eklendi. İç/dış/üst ayak, baraj altı, knuckle/topspin/sert vuruşlar farklı ayak/gövde pozları taşır; dış ayak artık iç ayak etiketi/pozu değildir. Eski fiziksel aday arama ve “bulunamazsa gerçek sonuç kazanır” korunur.

## D-030 · 2026-11-11 · codex · kabul — Penaltı/FK HD arma/isim/skor
Kullanıcı arena netliğini diğer iki stüdyoda istedi. 2D canvas gerçek1080p, adaptif WebGL ön izleme çözünürlüğü ve telefon bellek/kalite koruması aynı. Arma56, ana ad38, skor55px mantıksal boyutta; bandın aynı güvenli ölçeği uygulanır. Ölçülmüş yazı/punto/üç nokta, yatay harf sıkıştırma yok. Sonuç/menü/forma seçimi ve ortak1080p60 MP4 yolu korunur.

## D-031 · 2026-11-11 · claude · kabul — Arena mekânı ve top sürme/düello modeli (V168)
Kullanıcı tüm modlarda “gerçekten futbol oynanıyor” hissi ve stadyum atmosferi istedi. Arena mekânı `japon-venue.js` içinde yalnız görseldir (fizik/sonuç yok, video zamanıyla deterministik); üst tribün bölümleri ve direkler kamera ile saha arasına girerse gizlenir (kesit görünüm), Reels güvenli alanı ve kamera sözleşmeleri değişmedi. Top sürme dokunuşu artık oyuncunun fiilen yöneldiği yöne ve gerçek hız bileşenine göredir; eski “gövde yönüne it” modeli dönüşlerde topu oyuncudan kaçırıyordu (ölçüm: maç başına 4,8 kendi kendine kayıp). Çalım düellosu tohumlu bir okuma kararıdır ve yalnız hareketi etkiler (patlama/gecikme); top sahipliği yine fiziksel temasla değişir, gol/sonuç zorlanmaz. Kaleci derinlik üst sınırı (3,7 m, `arena-football` testi) korunur. Penaltı/FK yeni stilleri mevcut sonuç-önce/fiziksel-arama mimarisinin içindedir; tohum başına eski sonuçların korunması hedeflenmedi.

## D-032 · 2026-11-11 · claude · kabul — Basın kamerası iki seçenek; parlaklık yerine netlik (V169)
Kullanıcı basın kamerasının daha yakın olmasını, yine kaleleri ve oynanan alanı göstermesini istedi. Tüm sahayı sabit kadrajda tutarken oyuncu boyu geometrik olarak sınırlıdır (1080p yatayda ~66 px); bu yüzden D-027'nin sabit `side-full` seçeneği korunup yalnız sıkılaştırıldı ve yanına fazı izleyen `press-follow` eklendi. `side-full` hâlâ top/oyuncuya göre hareket etmez (arena-balance testi). Kullanıcı ayrıca “bir yerin parlaması kalite değildir” dedi: bloom yalnız gerçek ışık kaynaklarında kalacak şekilde kısıldı, meşale/duman/konfeti ve beyaz çizgi/LED tonları düşürüldü. Bu değerleri “daha canlı” görünsün diye geri yükseltmeyin; kalite artışı çözünürlük/doku/gölge üzerinden yapılır.

## D-033 · 2026-11-13 UTC · codex · kabul — Mevcut web görüntüsünde ortak futbol zekâsı
Kullanıcının web isteği doğrultusunda League-Soccer AI yaklaşımını hafif, özgün UMD JavaScript katmanında uyarladık. C++ çalıştırıcı, yeni görsel motor veya varlık eklenmedi. Yetişme süresi/pas koridoru/destek/markaj/pres ortak; her mod kendi fizik ve kurallarını korur. Normal maç hedef skor sözleşmesi değişmez. Penaltıda kaleci istenen sonucu okuyamaz; vuruş adayı gerçek top/erişim sonucuna yenilir. Kaleci temasından sonra top aynı ball-aero yoluyla devam eder. FK'de toplam erişimi gövde yolculuğuyla iki kez sayma yok. Yeni fizikten sonra eski seri uzunluğu/sonuç oranını korumak için kota veya beceri bastırma uygulanmaz. Lisans ve ölçüm yöntemi araştırma raporunda.

## D-034 · 2026-11-13 UTC · codex · kabul — Eleme sahası kalan takım sayısına dönüşür
Kullanıcı kalenin kaybolup büyük sahanın aynı kalmasını istemiyor. Elemede gol molası sonrası ortak drop'ta kalan en az iki takım için `Layout.create(remaining)` geometrisine geçilir. Fizik ve görünür saha aynı kaydı kullanır. Bu açık tur kesmesinde oyuncular yeni kale yerleşimine göre yeniden yerleştirilir; oyun sırasında saha sınırı değiştirilmez. Mevcut oyuncu/forma kimliği ve üçerli kadro korunur; iki takımlı final5v5 moduna dönmez. Kazananla tek kale sahası yaratılmaz. Puan modu ve bağımsız5v5 aynı kalır. Geçiş/geri sarma, kamera ve yerel kaynak temizliği birlikte test edilir.

## D-035 · 2026-11-13 UTC · codex · kabul — Ortak temas ve tek kaleci yükselmesi
Alım/vuruş noktası engine gözleminden dondurulur; pozu topun peşinden uzatarak veya root'u oynatarak temas üretilmez. Aktif ayak ve destek ayağı aynı seçim kullanır. Grounded GK'de eski prosedürel arc + tipOver arc + klip root'u yerine tek sınırlı itiş ve sınırlı gövde düzeltmesi. Gerçek erişilemeyen nokta raporlanır; top/sonuç bu yüzden değiştirilmez. Authored normal sekanslarda nokta yoksa eski yol korunur.

## D-036 · 2026-11-13 UTC · codex · kabul — Gözlenen pasla takım koşusu ve kimlikten sentetik karakter
Verkaç/üçüncü oyuncu gerçek son pas ve sahiplikle açılır, takım desteği ayrı açılara atanır. Çok taraflı arenada topa katılmayan uzaktaki takım kendi sektörünü korur; bütün takımlar aynı taşıyıcıya yığılmaz. Alıcı yavaşlayan topa erişimini tahmin eder. Dört koçluk profili sentetiktir, `verified:false`; isim/ID korunur, sadece renk objesi stil kimliğini değiştiremez. Açık taktik öncelikli; skor/galip/uzun seri kotası yok. League-Soccer yaklaşımı genişletilir, FM özel kodu alınmaz.

## D-038 · 2026-11-13 UTC · codex · kabul — AAC yoksa yerel yazılım kodlayıcısı, sessiz başarı yok
MediaRecorder audio/mp4 desteği AAC garantisi değildir. Native AAC veya açık native AAC-recorder desteği yoksa yerel @mediabunny/aac-encoder1.65.2paketi tembel yüklenir. WebCodecs video ve bağımsız software video aynı AAC kaynağını kullanır. Ses istendiğinde mux sonunda AAC izi ve tam süre doğrulanır; kayıt/kodlama hatası sessiz MP4'e dönüştürülmez. Dış servise medya yüklenmez;1,1MBayrı LGPL/MPL vendor paketi kaynak/rebuild/lisanslarıyla korunur. Native AAC cihazı bu paketi indirmez.


## D-039 · 2026-11-13 UTC · codex · kabul — Acil hafif çizimde gölge bütçesi
Mevcut `SEKME_LITE_RENDER` bellek/uyumluluk yolunda `lite=true` yanında gölgeler kapatılır, shadowSize512 ve tufts0 olur. Önceden high profilinin2048/4096gölge bütçesi hafif yola taşınıyordu; yazılım GPU'da tam video testi ağırlaşıyordu. Normal high profil gölgeleri değişmez. Video çözünürlüğü1080p/60FPS kalır; gerçek maç süresi/kareleri, saha, oyuncu, forma ve fizik değiştirilmez. Yazılımsal GPU hızını fiziksel cihaz performansı diye raporlama.

## D-040 · 2026-11-13 UTC · codex · kabul — Doğal karar ve gerçek süre
Kullanıcının yeni talimatıyla oyuncu kararları yalnız en yüksek puanlı seçenekten seçilmez; önce fiziksel/taktiksel uygunluk, sonra karakter/maç durumundan ağırlıklı seçim yapılır. Karar, teknik uygulama ve kaleci rastlantısı bağımsız seed akışlarıdır. Bilinmeyen mental özellikler etiketli sentetik öncüllerdir. Gerçekçi hata kotası veya istenen skor için top/oyuncu ışınlama yok.

D-004'ün istenen sonuca göre aday arama yolu programatik eski P/FKAPI uyumluluğu için kalır; yeni stüdyo UI doğal karar bayrağıyla doğrudan fiziksel vuruş üretir ve önceki skor farklı olsun diye tekrar örneklemez. Normal analizli özet korunur; ayrı kompakt serbest11v11 hedef skoru kullanmaz. Bu henüz tam90dakika değildir.

T-303, eski video süresi varsayımını değiştirir: gol→gerçek yeniden başlatma arasında maç saati durur, fizik/video çalışır. Golcü kartı yalnız gerçek aktör/portre/takım kimliğidir. Özet kesilirse anlatım/SRT dahil tüm zaman çizelgesi dönüşür. Yerel testler fiziksel Windows/GPUkanıtı sayılmaz.

## D-041 · 2026-11-13 UTC · codex · kabul — Eleme kazananı ve gerçek kontrol
Kullanıcı60/90sn çok kaleli elemede mutlaka sahada kazanan istedi. Seçili süre normal süredir;60sn ve üzeri tercihlerde sonuç yoksa tek golle eleme uzatmasına geçilir, tur sayaçları sıfırlanır. Gerçek gol/eleme beklenir; skor veya galip uydurulmaz. 30/45sn kısa eleme ile puan/5v5 süre/beraberlik aynı kalır. Video gerçek uzatmayı gösterir. Beklenmedik fiziksel kilit bütçede çözülemezse kontrollü hata üretmek sahte şampiyondan önceliklidir.

Seed1015 sorunu, kalecinin kendi taşıyıcısına çıkması ve topa dokunamayan taşıyıcının sahte sahipliğiydi. Kaleci yalnız serbest topa alım yapar; yakın takım arkadaşı kaçınması taşıyıcıyı toptan kovmaz. Durmuş topa uzun süre dokunamayan oyuncu kontrolü kaybeder; son alım/dokunuş zamanı birlikte değerlendirilir. Bu hata golleri zorlayarak çözülmedi.

Kullanıcının ek talimatıyla yayın mod/tur açıklamaları ve uzun stüdyo bilgi notları kaldırılır. Anlamlı kontrol seçenekleri, skor/süre/kimlik/gerçek hata ve sonuçlar korunur. Fiziksel ve taktiksel çeşitlilik, mantıksız açık kale adaylarını elemekle birlikte sürer.
