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

## [2026-11-10] Claude Code · V146 → V147 (kararlı)
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
