# CHANGELOG

Biçim: en yeni sürüm üstte. Ayrıntılı eski sürüm notları: `docs/archive/SURUM-v10x.txt`.

## Belge bakımı — 2026-11-10 (Claude Code) · sürüm artırılmadı (V157)
- Codex devri öncesi: `PROJECT_STATE`/`TASKS` V158 hedefine ve `release-v157.json`’a güncellendi, tarihler UTC commit
  tarihine göre düzeltildi, `AGENTS.md` test tablosu tamamlandı. Oyun kodu değişmedi.

## V163 — 2026-11-10 (Codex)
- Büyük süre/skor paneli; iki takımlıda yalnız takım veya oyuncu grubu adı ve gol skoru.
- Dört çalım, tahminli kale hattı savunması/topa dönük kayma ve gerçek temasla top kapma/faul. Yuka MIT kaynak uyarlaması ve lisans kaydı.
- Küçük saha ceza alanı/nokta, kutu içi penaltı ve dışarıda serbest vuruş; son penaltı için görünür ek süre.
- Kaleci tutuşu, elle/yerden dağıtım, geri pası ayakla kontrol edip oyun kurma. 2–6 tarafta duvar/direk/kaleci/tavan sekmeleriyle top oyunda.
- Olaylara uyan TR/EN anlatım, güvenli dinamik yayın, regresyon ve gerçek tarayıcı/kısa MP4 kontrolü; ortak ajan devri.

## V162 — 2026-11-10 (Codex)
- 2–6 takım için 30/45/60/75/90 saniye oyun; kesintisiz akış, geri sayım ve 5 saniye sonuç. Çok takımda seri aksiyon varsayılanı, küçük sahada ortak golcü/takım/taraftar sevinci.
- Tribün sektörleri arasında duvar, açık güvenlik koridoru ve normal maç güvenlik modeli. Çim şeritlerinde kesilen beyaz çizgilerin derinlik katmanı düzeltildi.
- 85 millî takımın 2.224 oyunculu sağlayıcı kadroları ve renk/desen forma profilleri tüm modların ortak sistemine eklendi; güncel konsept seçimi genişledi. İlk 11 simülasyon seçkisi, formalar sezon replikası değil.
- Aynı model/aydınlatma korunarak çizgiler, tribün ve güvenlik çizimleri gruplandı; eski görünmeyen stadyum örnekleri ayıklandı.
- Gerçek pozisyon/son bölüm çeşitliliği, süreye ve gerçek skora uyan TR/EN anlatım; video/oyun akışı kontrolleri ve ortak ajan devri.

## V161 — 2026-11-10 (Codex)
- İki kale: ayrı Küçük Saha Maçı 4v4 (GK + 3); 3–6 kale: Japon Kale (GK + 2). Serbest saha oyuncusu/kadro/forma seçimi, kaleci slotunda gerçek GK, süreli maç/beraberlik ve TR/EN anlatım.
- Referans görseldeki eğik yayın açısı; top/atağı izleyen, yumuşak hareket ve öngörülü zoom. Açılış/finalde otomatik tepe açısı kaldırıldı; Reels/Shorts güvenli alanı korunur.
- Normal maçın aynı ayrıntılı taraftar modeliyle beş sıralı birleşik küçük tribün; her tarafta tam eşit taraftar ve gerçek gole göre sevinç/üzüntü. Eski uzak stadyum/personel görünümü kaldırıldı.
- Merkez/kenar çizgileri, ivmeli koşu, kararlı dribbling hedefi, açık kanalda hareketli takım arkadaşına pas, eş zamanlı top kapma yarışı. V160 fileleri korundu.
- Yeni küçük saha/tribün/sürekli kamera testi, mevcut regresyonlar ve 2–6 takım gerçek tarayıcı görüntüleri. Ortak Codex/Claude devri güncellendi.

## V160 — 2026-11-10 (Codex)
- Japon Kale’nin fileleri normal futbol filesi görünümüne uyarlandı: aynı oyun dokusu, doğru ağ gözü aralığı, yan/üst/eğimli arka file ve yere oturan arka çerçeve.
- Kale ölçüleri doğrudan oluşturulur; büyük kaleyi küçültmekten gelen sıkışmış file görünümü kaldırıldı. Kamera ve oynanış korundu.

## V159 — 2026-11-10 (Codex)
- Japon Kale’de kaleci–defans–hücum üçlüleri; özel üçlü ve mevcut ikili seçimi. Messi/Piqué/ter Stegen – Ronaldo/Ramos/Casillas hazır örneği ve 29 arşiv oyuncusu.
- Oyuncu isimleri başlarının üzerinde; takım adı kalede. Kale sayısı ve boyutuna göre büyüyen, aynı fizik sınırlarını kullanan beş saha düzeni.
- Aksiyon yayını, saha kenarı ve taktik kameraları; top/oyuncu/kaleyi Reels–Shorts güvenli alanına sığdıran otomatik kadraj, aynı MP4 çıktısı.
- Yeni arena çimi, sınır bantları, kale bölgeleri; eski saha çizimleri kaldırıldı. Ayrıntı ve testler HANDOFF V159.

## V158 — 2026-11-10 (Codex)
- Japon Kale Stüdyosu: 2–6 taraf, kaleci + saha oyuncusu, eleme / puan biçimleri, bağımsız oyuncu ve forma seçimi.
- Dairesel arena, açık şut yolu seçimi, ortak top fiziği ve oyuncu animasyonları; genel/aksiyon kamera, tüm golleri içeren dikey MP4 özeti, dereceler.
- Tüm maç/stüdyo videolarına TR/EN zamanlı anlatım metni: kopyala, TXT, SRT; gerçek golcü/olay ve video zamanları kullanılır.
- Test/cihaz sınırları ve devir ayrıntıları: HANDOFF V158.

## V157 — 2026-11-10 (Claude Code) · kararlı
- **Karda nefes buharı:** karlı havada oyuncuların ağzından soğuk nefes buharı çıkıyor.

## V156 — 2026-11-10 (Claude Code) · kararlı
- **Direkten dönen top:** kale çerçevesi çarpma anında kısa bir an titriyor.
- **Sekmede toz:** top yere sert sekince küçük çim tozu kalkıyor.
- **Yağmur/kar:** vuruş ve sekmede toprak yerine su damlacıkları ya da kar sıçrıyor.

## V155 — 2026-11-10 (Claude Code) · kararlı
- **Kaleci kurtarınca seviniyor:** penaltıda ve serbest vuruşta kurtarış yapan kaleci kalkıp sevinç gösteriyor.

## V154 — 2026-11-10 (Claude Code) · kararlı
- **Vuruşta çim sıçraması:** sert vuruşlarda topun durduğu yerden küçük çim ve toprak parçaları kalkıyor (maç, penaltı,
  serbest vuruş); ön izleme ve MP4 aynı.

## V153 — 2026-11-10 (Claude Code) · kararlı
- **File (FC27 tarzı):** sık 12 cm gözlü, ince düğümlü, uzaktan yumuşak beyaz tül gibi görünen file; top cebi ve dalga aynı.
- **Top:** hızlı şutlarda topun arkasında hafif hareket izi; yön ve hız okunur.
- **Stadyum:** çatı kenarı boyunca projektör sırası.

## V152 — 2026-11-10 (Claude Code) · kararlı
- **Kaleci gözü:** vuruştan sonra kamera kalenin içine çekilip sahaya bakıyor; kaleci artık kamerayı kapatmıyor.
- **Takım penaltıları:** bekleyen oyuncular takım takım ayrı (kaleci gözünde biri solda, biri sağda).
- **File:** top çarptığı yerde fileyi top büyüklüğünde dışarı itiyor, sonra yumuşakça eski haline dönüyor.

## V151 — 2026-11-10 (Claude Code) · kararlı
- **Kaleciler de vurabilir:** penaltı ve serbest vuruş düellolarında kaleci vurucu seçilebilir (kaleci–kaleci kapışması);
  takım penaltıları uzarsa kaleci de sırası gelince vurur.

## V150 — 2026-11-10 (Claude Code) · kararlı
- **Kaleci gözü kamerası (penaltı + serbest vuruş):** vuruşu kalecinin gözünden izle; vurucu yakından, üstünde adıyla;
  vuruşla birlikte top kaleye/eldivene/auta kadar takip edilir. MP4 de bu açıyla alınabilir.

## V149 — 2026-11-10 (Claude Code) · kararlı
- Penaltı skor tablosundaki “6–8” gibi aralık yazıları kaldırıldı.
- Zemin: çim biçme şeritleri gerçek stadyumlardaki gibi daha dar ve daha çok (5,25 m); renkler aynı.

## V148 — 2026-11-10 (Claude Code) · kararlı
- **Reklam panoları:** “NEXT 90 SIM” yazısı kaldırıldı; panolarda solda sayfanın profil resmi, sağda @next90sim.

## V147 — 2026-11-09 (Claude Code) · kararlı
- **Kale fileleri:** her yüzde eşit, dengeli göz; top filede net görünür (maç, penaltı, serbest vuruş, konsept).
- **2v2 portreler:** ikinci oyuncunun (ör. Yamal, Mbappé) fotoğrafı artık görünüyor.
- **Serbest vuruş:** takım modunda en iyi 5 frikikçi sırayla; goller kaleciyi açıkça geçiyor ya da parmak ucuna değip giriyor.

## V146 — 2026-11-09 (Claude Code) · kararlı
- **iPhone'da MP4 sonrası yenilenme:** video bitince 3D ön izleme bellekten bırakılıyor; video ve Kaydet düğmesi açık kalıyor.
  Oynat'a basınca aynı seri yeniden yükleniyor.

## V145 — 2026-11-09 (Claude Code) · kararlı
- **Aday kadro Transfermarkt'tan:** millî takımların güncel federasyon kadrosu otomatik (Türkiye'de TFF listesiyle birebir).
- **Kendin düzelt: `kadro.php`** — aday kadroyu, ilk 11'i, dizilişi ve teknik direktörü şifreyle elle girebilirsin;
  girdiğin liste her kaynağın önüne geçer.

## V144 — 2026-11-09 (Claude Code) · kararlı
- **Millî takım kadroları:** muhtemel 11 artık BSD'nin (bzzoiro) maç tahmininden, yalnız TFF aday kadrosundaki oyuncularla
  kurulur; sakat ve cezalılar çıkar. Herkesin farklı bir forma numarası var (Arda 8, Hakan 10…), yedeklerde önce kaleciler.

## V143 — 2026-11-09 (Claude Code) · kararlı
- **Seremoni:** sahadaki bayrak/logo bezleri eskisi gibi net; parlama yok, turnuva logosu ve bayraklar kendi renkleriyle.
- **Düelloda istediğin takımın forması:** “Seçtiğin takımın forması” seçeneğiyle ör. Messi & Yamal Barcelona, Ronaldo &
  Mbappé Real Madrid formasıyla, her biri kendi numarasıyla oynar (ikonlar ve yıldızlar dahil).

## V142 — 2026-11-09 (Claude Code) · kararlı
- **iPhone'da penaltı/serbest vuruş MP4:** sekme bellek yetmediği için kapanıyordu (“bu sayfada birçok kez sorun oluştu”).
  iPhone'da sahne artık bir kez kuruluyor, video için ikinci sahne açılmıyor; görüntü zinciri iPhone'a uygun. Yine
  çökerse bir sonraki açılış otomatik olarak daha hafif sahneyle çalışır.

## V141 — 2026-11-09 (Claude Code) · kararlı
- **Cron olmadan kendi dolar:** site ilk ziyarette eksik kaynakları toplu çeker, yaklaşan maçı olan kaynakları öne alır.
- **Millî kadrolar:** aday kadroda olmayan oyuncular (ör. İrfan Can, Kerem) artık hiçbir kaynaktan muhtemel 11'e ya da
  yedeğe giremez; yerlerine aday kadrodan oyuncu gelir.

## V140 — 2026-11-09 (Claude Code) · kararlı
- **Maçlar ve Uluslar Ligi geri geliyor (kök neden):** sunucudaki eski tahmin kilidi dosyası, veri dosyasıyla uyuşmayınca
  bütün güncellemeleri iptal ediyordu. Artık kilit yalnız korunan eski tahminleri geri koyar, güncellemeyi durdurmaz.

## V139 — 2026-11-09 (Claude Code) · kararlı
- **Sunucu durumu sayfası (`durum.php`):** maçların neden görünmediğini gösterir (veri klasörü izinleri, cron, kaynak
  hataları, ESPN bağlantısı) ve “Verileri şimdi topla” düğmesiyle cron olmadan tüm kaynakları toplar.
- Ziyaretçi yenilemesi bir seferde 3 kaynağa kadar çeker; site boş veriden daha hızlı dolar.
- **Telefonda MP4:** iPhone'da sesin geç açılması yüzünden “zaman aşımı” ile iptal olan export düzeltildi; yavaş mobil
  veride stüdyo hazırlığı artık hata vermeden bekler.

## V138 — 2026-11-09 (Claude Code) · kararlı
- **2v2 oyuncu düellosu (penaltı + serbest vuruş):** her tarafa iki oyuncu seçilir (ör. Messi & Yamal vs Ronaldo &
  Mbappé); ikililer sırayla vurur, panelde iki portre, finalde kazanan ikili birlikte sevinir. Video yine 1080×1920 60 FPS.
- **Telefon:** serbest vuruşta paylaşım menüsü açılamazsa dosya doğrudan indirilir.

## V137 — 2026-11-09 (Claude Code) · kararlı
- **Millî aday kadrolar kendiliğinden güncellenir:** her millî arada açıklanan aday kadro (Wikipedia "Current squad",
  federasyon duyurusuna dayanır) sunucu tarafından çekilir; muhtemel 11 yalnız davetli oyunculardan kurulur, teknik
  direktör ve forma numaraları buradan gelir (ör. Türkiye: İrfan Can ve Kerem yok, Aral ve Arda var).

## V136 — 2026-11-09 (Claude Code) · kararlı
- **Kayıp maçlar:** güncelleme paketlerine yanlışlıkla eski bir sunucu veri dosyası giriyordu; yüklenince yayımlanmış
  tahminler siliniyordu. Paketten ve depodan çıkarıldı; sunucu tahminleri yeniden üretir.
- **Telefonda/bilgisayarda video hazırlama:** her yeni sahne eskisini bellekte bırakıyordu (bellek sızıntısı) → giderildi;
  video hazırlarken sayfa takılmaz.

## V135 — 2026-11-08 (Claude Code) · kararlı
- **Millî maç hafızası:** oynanan her millî maç (Dünya Kupası, elemeler, kıta turnuvaları, Uluslar Ligi'ler,
  hazırlık) kalıcı olarak birikir ve sonraki tüm millî maç analizlerini etkiler — lig sistemindeki gibi. Sunucu
  uzun süre kapalı kalsa bile eksik aylar otomatik tamamlanır.

## V134 — 2026-11-08 (Claude Code) · kararlı
- **Millî reytingler artık kendiliğinden güncellenir:** site, normal güncelleme döngüsünde son millî maç sonuçlarını
  ESPN'den çekip reytingleri yeniden hesaplar.
- **Grubun son maçı ilk maçın sonucunu bilir:** bir takımın önünde oynanmamış bir millî maç varken yayınlanan tahmin
  geçicidir; o maç oynanınca yeni reytinglerle yeniden hesaplanır (ör. Türkiye–Belçika sonucu Türkiye'nin sonraki
  maçını etkiler).

## V133 — 2026-11-08 (Claude Code) · kararlı
- **Siyahlık giderildi:** pozisyon geçişlerinde ekranı kısa süre karartan perde kaldırıldı (maç, konsept maç).
- **Geçişlerde kalite:** video kodlayıcı canlı yayın modundan kalite moduna alındı; her kamera kesmesinde yeni anahtar
  kare → kesme anında bloklanma/bulanıklık yok (maç, penaltı, serbest vuruş). Telefon yedek kodlayıcısı daha kaliteli.

## V132 — 2026-11-08 (Claude Code) · kararlı
- **Millî takım analizi:** son 3,5 yılın 3.349 millî maçı turnuva ağırlığıyla (Dünya Kupası > kıta şampiyonaları >
  elemeler ve Uluslar Ligi > hazırlık) reytinge dönüştürüldü; kazanılan kupalar, son form ve kadrodaki oyuncuların
  kulüp reytingleri eklendi. Uluslar Ligi ve hazırlık maçı tahminleri bu modelle yapılır.

## V131 — 2026-11-08 (Claude Code) · kararlı
- **Uluslar Ligi ve hazırlık maçları artık açılıyor:** Eylül–Ekim millî maç sonuçları + takım gücüyle tahmin üretilir;
  maçlar izlenebilir ve indirilebilir. Kadrolar/ilk 11 açıklandıkça mevcut sistemle güncellenir.

## V130 — 2026-11-08 (Claude Code) · kararlı
- **Telefon:** penaltı ve serbest vuruş stüdyoları telefonda açılırken donup sayfayı yeniliyordu. Önizleme artık hafif,
  video indirilirken en yüksek kalitede ayrı sahne kurulur (normal maç sayfası gibi) — video kalitesi düşmedi.
- **Açılış:** ara sahne kaldırıldı; videolar doğrudan ilk vuruşla (frikikte topun yere konduğu an) başlar.
- **Frikik gol tekrarı:** topun barajı aşıp ağlara girdiği an kadrajda.

## V129 — 2026-11-08 (Claude Code) · kararlı
- Telefonda kalite düşürme geri alındı: telefon da bilgisayarla aynı en yüksek kalitede çizer ve video indirir
  (çökmenin asıl nedeni V128'de giderildi).

## V128 — 2026-11-08 (Claude Code) · kararlı
- **Telefon:** asıl sebep bulundu — kenardaki 50 görevli de ağır tam vücut modele geçmişti (çizim yükü ikiye
  katlanmıştı). Yük V107 seviyesine indirildi; telefonda yalnız oyuncular ve orta hakem tam vücut.
- **Şort numaraları:** taşma/kesilme düzeltildi.

## V127 — 2026-11-08 (Claude Code) · kararlı
- **Resmî UEFA Uluslar Ligi logosu:** seremoni orta bayrağı, skor tabelası, kadro, devre ve maç sonu ekranları;
  tema logodaki renkli bayrak deseniyle.
- **Telefon düzeltmesi:** stüdyolar ve video indirme telefonda sayfayı yeniden başlatıyordu (bellek). Telefonlar artık
  hafif görüntü zinciri ve hafif malzemeler kullanır; seçilen kalite ayarına uyulur.

## V126 — 2026-11-08 (Claude Code) · kararlı
- **Gerçek oyuncu görünümü:** büyük takımlardaki 889 oyuncunun fotoğrafı tek tek incelendi: kel, kazınmış, kısa,
  uzun, kıvırcık, örgülü, açılmış alın + sakal yoğunluğu; ten ve saç rengi fotoğraftan ölçüldü (ör. Lukaku kel ve
  sakallı, Kanté/Mbappé kazınmış, Guendouzi/Cucurella/Haaland uzun, Sané örgülü).
- Düzeltme: maç günü açıklanan kadrolarda oyuncuların görünüm verisi kullanılmıyordu.

## V125 — 2026-11-08 (Claude Code) · kararlı
- **Millî kadro:** güncel davet listesine göre muhtemel 11 (Kasım: İrfan Can, Kerem, Altay yok); davet edilmeyen
  oyuncu aynı mevkiden davetliyle değişir; TD Sergen Yalçın; Türkçe karakterli oyuncu adları.
- **Çeviri:** Türkçe'de İtalya, Türkiye, İngiltere, Almanya…; İngilizce'de Italy, Turkey, England, Germany…
  (94 millî takım).

## V124 — 2026-11-08 (Claude Code) · kararlı
- **Yeni lig: UEFA Uluslar Ligi** ve **Uluslararası Hazırlık Maçları** (büyük ülkeler) — ESPN'den fikstür, açıklanan
  ya da muhtemel ilk 11, forma numaraları, pozisyonlar, dizilişler; bayraklar logo olarak.
- Kendi yayın temaları: Uluslar Ligi (lacivert/camgöbeği) ve Hazırlık Maçı (antrasit/altın) skor tabelası, kadro
  ekranı, seremoni, devre ve maç sonu istatistikleri.
- 45 yeni millî takım ve bayrağı (toplam 85).
- Düzeltme: 3'lü defans + kanat bek dizilişleri (ör. Türkiye 3-4-2-1) reddediliyordu; ESPN CF-L/CF-R pozisyonları.
- Seremonide tribünlerde telefon feneri ışık şovu; kameraya göre değişen çim biçme şeritleri.

## V123 — 2026-11-08 (Claude Code) · kararlı
- **Saç:** ışığı tutam tutam alan parlak saç (tel kabartması + parlaklık), artık mat kask gibi değil.
- **Cilt:** daha yumuşak, canlı cilt ışıltısı.
- **Güvenlik:** videoda tek bir hatalı piksel artık bütün kareyi karartamaz (NaN temizleme adımı).

## V122 — 2026-11-08 (Claude Code) · kararlı
- **Serbest vuruş vurucuları:** takım düellosunda gerçek frikikçiler (ör. Fenerbahçe: Greenwood, İrfan Can, Oğuz
  Aydın); Lukaku/Kanté/Brown gibi oyuncular artık seçilmiyor.
- **Daha az baraj:** baraja takılan oran ~%16 → ~%6; kaçan vuruşlar çoğunlukla üstten ya da direğin yanından.
- **Vuruş stilleri:** uzmanlar falso/düşen top, diğerleri sert/knuckleball; uzaklık ve açıya göre.
- **Kamera:** penaltıdaki gibi açılış — vurucunun sırtı, numarası, baraj ve kale aynı karede, skor tablosu ayrı.
  Top uçarken kamera onu izler ve topun arkasında ince bir iz bırakır: barajı geçince nereye gittiği net.
- **Akış:** tekrar yalnız gollerde; kaçan vuruşta vurucunun yerinde ~1 sn tepki, sonra hemen sonraki vuruş.

## V121 — 2026-11-08 (Claude Code) · kararlı
- **Video:** her cihazda (telefon dahil) Yüksek kalite + gölgelerle çizilen 1080×1920 / tam 60 FPS dışa aktarma
  (maç, penaltı, serbest vuruş, konsept maçlar). Önceden telefonda Düşük/Dengeli ve gölgesiz çiziliyordu.
- **Görüntü:** gerçek kontrast eğrisi, vinyet ve keskinleştirme (sosyal medya sıkıştırmasından sonra netlik);
  kameraya yakın çimde ince çim dokusu.
- **Seremoni:** sahadaki takım/turnuva bezleri artık parlayan disk değil, ışığı alan kıvrımlı kumaş.
- **Düzeltme:** santrada hakem oyuncuyla aynı noktada duruyordu → serbest bir noktaya geçer (yeni test).
- **Görevliler:** kollar aşağıda, hareketsiz, gerçek steward duruşu.
- **Tribün:** dönem dönem stadyumda dönen meksika dalgası.

## V120 — 2026-11-08 (Claude Code) · kararlı
- Tribün güvenlik görevlileri turuncu reflektif yelekli (steward), ayırıcı camın iki yanında, her iki takımın
  taraftarlarının yanında.

## V119 — 2026-11-08 (Claude Code) · kararlı
- **Taraftar ayrımı (frikik, penaltı, maç):** iki taraftar grubunun buluştuğu her yerde önden arkaya uzanan
  basamaklı cam panel, çelik alt plaka, eğimli korkuluk; arada örtülü boş koltuk koridoru ve her 3 sırada yelekli
  görevli. Sınır otomatik bulunur (eşit bölünme, deplasman köşesi, tek taraf vb. hepsinde).
- **Kaleci:** her kalecinin kendi hazır duruşu (klasik / alçak-geniş / eller yüksek), parmak ucunda hafif sekme.
- Düzeltme: ince cam şeridin dejenere üçgenleri yüksek kalitede ekranda siyah dikdörtgen oluşturuyordu.

## V118 — 2026-11-08 (Claude Code) · kararlı
- **Frikik – yatan oyuncu:** her vuruşta değil, turların yaklaşık dörtte birinde; o turda iki takım/iki oyuncu için de
  aynı (adil ve tutarlı). Testle korunuyor.
- **Yağmur:** ıslak top kalecinin eldiveninden daha sık kaçıyor (tutma ~%35 daha az); test örneklemi büyütüldü.

## V117 — 2026-11-08 (Claude Code) · kararlı
- **Frikik barajı – yatan oyuncu:** artık baraj hizasına paralel, barajın hemen arkasında yatıyor (sırtı baraja dönük);
  önceden baraja dik uzanıyordu. Testle korunuyor.
- **Kaleci:** ön kolun üst kısmında dolgulu dirsek pedi (forma renginin koyusu).
- **Gövde:** daha belirgin V şekli — omuzlar geniş, bel ince (fıçı görünümü azaldı).
- **Çim aşınması:** kale ağzında, penaltı noktasında ve orta noktada yıpranmış, seyrelmiş çim lekeleri.

## V116 — 2026-11-08 (Claude Code) · kararlı
- **Hakemler tam vücut:** hakem ve yan hakemler artık oyuncularla aynı MPFB modelinde (sarı forma, siyah şort/çorap);
  önceki manken görünümü gitti.
- **Işık:** Yüksek kalitede daha güçlü projektör ana ışığı, daha yumuşak/koyu gölgeler, kontur ışığı → derinlik.
- **Gövde/bacak:** göğüs ve karın düzleşti (yuvarlak göğüs yok), baldır kası arkada dolgun, bilek üstü ince.
- **Krampon:** ince modern üst, topuk desteği, beyaz taban + 6 çivi, yan şeritler ve bağcık.
- **Koşu:** hızlandıkça gövde öne eğilir, dönüşte içe yatar.
- **Taraftar:** kulüp rengi + ikinci renk, koyu mont, beyaz tişört karışımı (tek düze blok yerine gerçek kalabalık).

## V115 — 2026-11-08 (Claude Code) · kararlı
- **Atletik gövde:** tam vücut modeli yüklenirken kemik ağırlığına göre yeniden şekillenir — karın öne çıkıntısı %22 azalır,
  bel incelir, göğüs/sırt ve omuz başları dolgunlaşır (forma, şort ve isim/numara katmanları aynı tepe noktalarını izler).
  Ön profil: göğüs 0,193 > bel 0,166 > karın 0,154 m (önce karın 0,177 ile bele göre öndeydi).
- **Kumaş:** forma ve şort `MeshPhysicalMaterial` + forma rengine bağlı sheen (projektör altında spor kumaşı ışıltısı).
- **Cilt:** biraz daha canlı (pürüzlülük 0,58).
- **Çim:** yayındaki gibi belirgin biçme şeritleri.

## V114 — 2026-11-08 (Claude Code) · kararlı
- Yön: dış kaynak yok, yalnız kendi geliştirmemiz (D-019).
- Sinematik zincire alan derinliği (yakın çekim) ve yayın renk ayarı eklendi.
- Stüdyo yakın çekimlerinde odak + hafif el kamerası hareketi.
- Projektör ışık hüzmeleri (hava durumuna duyarlı) ve tribünde telefon flaşları.
- Stüdyolarda 1080×1920 tam çözünürlük kare alma (`snapshot`).
- Kaleci eldiveni: iri avuç yastığı + zıt renkli bilek manşeti (tam vücut el kemiklerine bağlı).

## V113 — 2026-11-08 (Claude Code) · kararlı
- Top havada fiziksel dönüşüyle görünür şekilde döner (frikik + penaltı).
- Frikikte hava fiziği: yağmurda kayan/az seken top, karda çabuk duran top; yağmurda kaleci daha az tutar.
- Yüksek kalitede 2K stadyum HDRI (CC0) ile daha keskin yansımalar.
- Testler: frikik testine yüzey/hava fiziği ve ıslak top kontrolleri eklendi.
- Frikik barajı: tek ortak yön (topa kare), dik ve omuz omuza duruş, eller koruma pozisyonunda, düz zıplama ve aynı
  duruşa iniş; diğer animasyon katmanlarından sonra uygulanır; topa çarpan oyuncuya öne atılma pozu verilmez.
- Frikik golünde yerinde ~1,3 sn kısa sevinç; final bölümü 9,5 sn — kazanan köşede ~5,6 sn uzun ve yalnız gösterişli
  sevinç (diz/göğüs/yan kayış, zıplayıp dönme, sıçrama), kayış kadrajda kalacak kadar (1 m).

## V112 — 2026-11-08 (Claude Code) · kararlı

### Yeni
- Sinematik görüntü zinciri (Yüksek kalite): UnrealBloom + ACES + SMAA (three.js r160 resmî modülleri, MIT).
- Yağmur/kar adım tepkisi: su sıçraması, kar bulutu, karda kalıcı ayak izleri.
- Frikikte taraftar ayrımı: koridor, güvenlik görevlileri, şeffaf panel ve korkuluk; takım başına 2 dalgalanan bayrak.
- Diziliş farkındalığı: üçlü stoper ve kanat bekleri, ikili stoperin sol/sağ ayrımı.

### Düzeltmeler
- Tam vücut oyuncu modeli krampon rengini yok sayıyordu → oyuncuya özel renk; kaleci eldiveni rengi.
- Frikikte taraftarlar değişik formanın (ör. 3. forma) rengini giyip karışık görünüyordu → kulüp renkleri.
- Hava “Açık”a dönünce adım efektleri temizlenmiyordu (test yakaladı).

### Testler
- `tests/graphics.cjs` (post-process paketi, kar izi/yağmur sıçraması, geri sarma temizliği, diziliş şeritleri) → run-all 15 test.

## V111 — 2026-11-08 (Claude Code) · kararlı

### Yeni
- Hava durumu seçeneği (Açık / Yağmurlu / Karlı) normal maç, penaltı ve serbest vuruşta; ön izleme ve 1080×1920 MP4’te.
  Yağmur: damlalar, zeminde sıçrama halkaları, ıslak çim ve formalar, pus. Kar: kar taneleri, beyazlaşan çim, açık sis.
- Kalite ayarına göre parçacık bütçesi (Yüksek/Dengeli/Hızlı).
- Serbest vuruşta hakem geri geldi: her vuruşta ana kameradan kadraja sığan (grafik bandının üstünde, şut yolunu ve
  barajı kapatmayan) ilk gerçekçi noktaya yerleşir — çoğunlukla barajın dış ucunda; sığmazsa gösterilmez. Düdük pozu korunur.

### Görsel iyileştirmeler
- Clearcoat’lu maç topu; cilalı, daha yuvarlak kale çerçevesi (gölge düşürür); 10 renkli krampon paleti.
- `docs/ai/research/GRAPHICS-SOURCES.md` kaynak/lisans değerlendirmesi.

### Testler
- `tests/weather.cjs` (uygula/geri yükle, geç yüklenen formalar, kalite ölçeği, zaman tabanlı yağış) → run-all 14 test.

## V110 — 2026-11-07 (Claude Code) · kararlı

### Yeni
- Çimde diz/göğüs kayma izleri; stüdyoda kayışlar gerçekten öne ilerler.
- GameplayFootball el yapımı sevinç (`happy_extreme`, `happy_normal`) ve üzgünlük (`sad_normal`) klipleri bağlandı;
  sevinç sayısı 106.
- Frikik: barajın arkasında yatan oyuncu (alçak şutu keser), kalecinin barajı yönetmesi ve açıortay konumu, vurucunun
  topu yerleştirip geri çekilmesi, kalite ayarı.
- Maç: kontra koşu hatları, pres tetikleyicileri, rakip kontrasında geri koşu.
- `docs/ai/research/LEAGUE-SOCCER.md` inceleme raporu.

### Değişen
- Frikikte ekranda yalnız baraj + kaleci + vurucu; her golde topun önünde küçük sevinç, seri sonunda köşede büyük sevinç.
- Penaltıda da gol başına küçük sevinç, finalde büyük sevinç.
- Frikik taraftarı: eşit → stadyum tam ortadan ikiye; tek taraf → tüm tribün.
- Koşu sırasında iki kol da hareketli (6 düzen); maç gollerinde kayış oranı ~%41.
- Penaltı uçuşu ve maç şutları aerodinamik modelde; forma/şort kumaş dokusu, şort numarası netliği.

### Testler
- `run-all` 13/13; frikik testine yatan oyuncu, açıortay, hazırlık; sevinç testine küçük/büyük set, iki kol, kayış ilerlemesi,
  jestler; penaltı testine aerodinamik hedef doğruluğu ve kavis eklendi.

## V109 — 2026-11-07 (Claude Code) · kararlı

### Yeni
- **Sevinç paketi:** 100 adlandırılmış gol sevinci (diz üstü kayış, göğüs üstü kayış, yan kayış, zıplayıp dönme, sıçrayıp
  yumruk, diz çökme, tek diz; uçak, kalp, sus, kulak, okçu, robot, dab, meditasyon, samba, gölge boksu…) ve 14 takım
  rutini (kucaklaşma, üst üste yığılma, birlikte zıplama, golcüye selam, alkış halkası, birlikte kayış…). Normal maç,
  penaltı ve serbest vuruşta.
- **Millî baraj:** düelloda millî forma → barajda o ülkenin gerçek oyuncuları ve forma numaraları.
- **Testler:** `penalty.cjs`, `celebrations.cjs`, `forecast.cjs`, `forecast.php`, `run-all.cjs` (+ `tests/summary.json`).

### İyileştirmeler
- Serbest vuruş noktaları: sol/sağ ayna çiftleri, merkez ve uzak; her turda iki taraf aynı noktadan.
- Serbest vuruş grafikleri Reels/Shorts güvenli bandında (penaltı ile aynı yer); kamera kadrajı aksiyonu bandın üstünde tutar.
- Penaltı: vuruş tekniği + hız etiketi; ayak dışı vuruş falsosu.

### Düzeltmeler
- V108 temizliğinde yanlışlıkla silinen küçük animasyon JSON dosyaları geri getirildi.

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
