# v0.54 — Nesine kaynağı ve muhtemel kadro onarımı

23 Ekim 2026 tarihinde Nesine'nin yayımladığı Statistics uygulaması ve gerçek
anonim veri uç noktaları incelendi. Kullanıcı hesabı veya özel anahtar gerekmedi.

## Gerçek kaynaklar

- https://istatistik.nesine.com/3241596/ozet
- https://apistats.nesine.com/api/v3/HeadToHead/3241596/Header
- https://apistats.nesine.com/api/v4/HeadToHead/3241596/LineUps
- https://apistats.nesine.com/api/v3/HeadToHead/3241596/LastMatches
- El Clásico için aynı adaptör 3239077 kimliğiyle doğrulandı.

Genel keşif, Misli'nin desteklenen tüm lig/turnuvalar için tarihli fikstür
kimliğini kullanır. Nesine başlığı bağımsız olarak takım adları/kimlikleri,
turnuva, sezon, İstanbul tarihi ve saatiyle eşleşmeden veri aktarılmaz.
Kimliğin varlığı tek başına yeterli sayılmaz. Desteklenmeyen veya farklı bir
format dönen kaynağa mevcut doğrulanmış kadrolarla devam edilir.

Nesine'nin `SLU` bölümü, ilk 11 açıklanmadığında aynı turnuvada bir önceki maçın
ilk 11'idir. Bu veri kesin veya açıklanmış muhtemel 11 diye etiketlenmez.
`ISML` ilk 11 duyuru bayrağı, oyuncu listesi ve formasyon birlikte kontrol edilir.
`APVZ` ise yaş bilgisinin gösterimini yöneten bayraktır; duyuru kabul edilmez.
Derbide `ISML` henüz kapalıydı. Geçmiş ilk 11 yalnız tahmini başlangıç
referansı olur; sakat/cezalılar, doğal roller ve sezon katılımı ayrıca değerlendirilir.
Yeni bir resmi 11 geldiğinde resmi kaynak tahmine önceliklidir.

## GS neden Berat Luş'a dönüyordu?

FotMob'un güncel kadrosunda Barış Alper Yılmaz için `Doubtful` (şüpheli)
bilgisi vardı. Önceki kod, herhangi bir sakatlık nesnesini kesin yok sayarak
Barış'ı çıkarıyordu. Yunus Akgün'ün rolleri CAM,RW,ST,LW; Berat Luş'un rolü LW.
Önceki uyum hesabı saf LW olmayı çok baskın tuttuğu için yedek genç oyuncuyu,
daha çok oynayan ama sol kanadı ikincil rol olan Yunus'un önüne koyuyordu.

Gerçek Nesine sezon verisi: Yunus 8 maç / 7 ilk 11, Barış 8 maç / 6 ilk 11,
Berat Luş ise 0 maç / 0 ilk 11. Yeni genel seçim hesabı rol uyumuyla birlikte
bu katılımı dikkate alır. Şüpheli oyuncu kesin yok sayılmaz; belirsizlik
cezası ve metaverisiyle aday kalır. Kesin sakatlık/ceza dışlanmaya devam eder.
Bu, Barış'ın oynayacağına dair kesin haber veya resmi kadro anlamına gelmez.

Gerçek GS FotMob kadrosu + Nesine katılımı ile onarılan tahmin:
Uğurcan; Sallai, Sánchez, Bardakcı, Jakobs; Torreira, Sara; Sané, Yunus, Barış;
Osimhen. Bu sonuç kulüp/oyuncu adına özel kodla sabitlenmedi. Güncel resmî 11
veya yeni güçlü sakatlık bilgisi geldiğinde kaynak önceliğiyle değişebilir.
Yedek adayları da sezon katılımı ve müsabakanın yedek sınırıyla seçilir.

## Analiz ve veri koruma

Nesine son maç kayıtları yeni yayımlanacak analizlerin form, iç/dış saha,
dinlenme ve H2H bağlamına eklenir. Aynı maç, farklı sağlayıcı veya filtre
listeleri yüzünden tekrar ağırlık kazanmaz. Gelecek tarihli kayıtlar,
anormal skorlar ve uzatma/penaltı sütunu bulunan sonuçlar dışlanır.
Kaynak erişimi veya istek bütçesi yetmezse mevcut doğrulanmış geçmiş korunur.
Bu ilave bağımsız bir başarı garantisi veya tüm maçlarda eksiksiz veri vaadi değildir.

Yayımlanmış skorlar, tahminler, seed ve geçmişler değiştirilmez. Kadro seçim
sürümü 3 yapıldığı için maç öncesindeki eski tahmini kadro önbelleği yeniden
değerlendirilir. Kesinleşmiş kilitli kadroların geçmiş kimlikleri korunur.

## Doğrulama

29 yeni kontrol: iki gerçek maç başlığı, yanlış tarih/klüp/turnuva/sezon/spor,
önceki 11'in doğru etiketlenmesi, gerçek sezon katılımı, şüpheli-kesin sakat
ayrımı, rol/katılım dengesi, geçmiş sonuç analizi, tekrar sayım, gelecek veri,
resmi kadroyu koruma, eski formasyon/yeni oyuncu kimliği uyuşmazlığını reddetme,
belirsizlikten güçlü kesin yokluk bilgisine öncelik ve URL sınırı. v0.52 kadro (27), analiz (42), herkese açık
kaynak ve oyuncu yenileme testleri de geçti. Gerçek kaynak örnekleri
`tests/fixtures/v54/` altında bulunur.
