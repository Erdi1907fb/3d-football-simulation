# Grafik kaynakları ve teknikler (V111)

Amaç: oyuncu, kaleci, top, kale/file, stadyum, taraftar, çim, krampon, forma/şort ve hava durumu görünümünü
lisansı temiz kaynaklarla yükseltmek. “Kullanıldı” = bu sürümde koda/varlığa girdi.

| Kaynak | Lisans | Ne için | Durum |
|---|---|---|---|
| three.js examples — GPU parçacık / `Points` sprite, `ShaderMaterial`, `MeshPhysicalMaterial` clearcoat | MIT | Yağmur çizgileri, kar taneleri, sıçrama halkaları, cilalı top | **Kullanıldı** (teknik; kod özgün: `weather.js`, `scene.js`) |
| Ball3D (lukaszgrad/ball3d) | araştırma | Top aerodinamiği | V108’den beri `ball-aero.js` |
| GameplayFootball / League-Soccer animasyonları | Unlicense / Apache-2.0 | Hareket, sevinç, üzgünlük klipleri | `clips.glb` (V110’da sevinç klipleri bağlandı) |
| MPFB (MakeHuman) gövde, Quaternius, KayKit | CC0 | Tam vücut oyuncu, sevinç klipleri, taraftar atlası | Projede mevcut |
| Poly Haven — HDRI (gece stadyumu), çim/kumaş dokuları | CC0 | Ortam ışığı, PBR doku | Değerlendirildi; projede RGBE yükleyici ve `assets/environment` var. Yeni 4K doku eklenmedi (dosya boyutu/mobil bellek) |
| ambientCG — kumaş, file, beton dokuları | CC0 | Forma örgüsü, file | Değerlendirildi; forma örgüsü **prosedürel** üretildi (`fullbody-runtime.js fabricNormal`, indirme yok) |
| pmndrs/postprocessing (bloom, SMAA, renk derecelendirme) | Zlib | Projektör parlaması, kenar yumuşatma | **V112 adayı**: ES modül + three sürüm uyumu gerekir; mevcut UMD `three.min.js` ile vendoring işi |
| three.quarks / three-nebula parçacık kütüphaneleri | MIT | Hava efektleri | Değerlendirildi; aynı etki 0 KB ek kütüphaneyle GPU shader’da yapıldı |
| Adobe Mixamo | Adobe şartları | Animasyon | Kapsam dışı (D-005) |

## V111’de yapılan görsel iyileştirmeler
- **Hava durumu (tüm modlar, ön izleme + MP4):** Açık / Yağmurlu / Karlı. Yağmur: kameraya göre sarılan dünya-sabit
  damla hacmi, zeminde sıçrama halkaları, ıslak çim (pürüzlülük ×0,74, koyulaşma, ortam yansıması ×1,12), ıslak formalar,
  puslu atmosfer, ışık ×0,84. Kar: yumuşak kar taneleri, saha çizgilerini kapatmayan hafif kar örtüsü, açık sis. Kalite ayarına göre parçacık
  sayısı (Yüksek 19.600 · Dengeli 11.900 · Hızlı 5.600). Zaman tabanlı olduğu için ileri/geri sarma ve video aynı kareyi verir.
- **Top:** PU deri hissi için clearcoat’lu fiziksel malzeme, gölge düşürür.
- **Kramponlar:** 10 renklik gerçekçi palet (siyah, beyaz, neon yeşil, pembe, elektrik mavisi, altın, kırmızı, turkuaz,
  turuncu, mor), oyuncu kimliğine göre sabit.
- **Forma/şort:** (V110) örgü normal haritası; yağmurda ıslak görünüm.

## Sonraki adımlar (V112)
- Bloom + SMAA post-process (pmndrs/postprocessing vendoring).
- Kale direklerine clearcoat, fileye ince ip normal haritası.
- Taraftar atlasına yağmurlukta/kapüşonlu varyasyon; karda tribün çatısına kar birikimi.
