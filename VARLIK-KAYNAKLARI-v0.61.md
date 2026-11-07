# Yeni varlıkların kaynakları ve sınırları

Kontrol ve indirme: 23 Ekim 2026. Önceden bulunan forma, arma, ses ve diğer dosyaların kaynak/lisans notları `ASSET-LICENSES.md` ve önceki kaynak belgelerinde korunmuştur. Bu belge yalnız bu sürümün yeni varlıklarını kapsar; bütün projedeki tüm markalar için CC0 iddiası değildir.

| Varlık | Kaynak | Lisans ve gerçek kullanım |
|---|---|---|
| Anatomik insan GLB, ortak rig, morphlar ve 12 hareket klibi | https://github.com/kblood/CharacterCreator — commit `852e48f316b90a0937234886630e4fb4cdfd1f78` | Üretilmiş output varlıkları CC0. GPL uygulama kodu projeye aktarılmadı. |
| Asıl anatomik altyapı | https://www.makehumancommunity.org/about/license.html | MakeHuman / MPFB temel varlıkları CC0. Programın lisansı varlık lisansından farklıdır. |
| Çim PBR | https://www.texturecan.com/details/469/ | Ground0040, CC0. Gerçek 1K ve 2K kaynak arşivleri indirildi; yerel WebP albedo/detail, OpenGL normal, roughness, AO dönüştürüldü. |
| Stadyum ek mimarisi ve hareketli taraftar LOD | Bu proje için üretilmiş geometri ve animasyon | Yeni özgün geometri için CC0; gerçek stadın birebir kopyası değildir. |

Karakter dosyaları `assets/characters/` içindedir. `sources.json` kaynak commit, SHA256 ve dosya boyutlarını içerir. Kaynak lisans metinleri de aynı klasördedir. `base_body.glb` ve `base_body_anim.glb` tam 53 kemikli, morph içeren kaynaktır; **maçta bütün vücut olarak yüklenmez**. Aktif `match-anatomy.json` ve `shared-match-anatomy.glb` bu kaynaktan türetilen, mevcut forma ve eklemlerle uyumlu 12 kemikli kol/bacak adaptörüdür. Kaleci ve saha oyuncusu aynı temel adaptörü paylaşır. `animations/` altındaki 12 kaynak klibi paketlenmiştir; mevcut maç animasyonları hâlâ olay güdümlü prosedürel pozlardan gelir, bu klipler maçta oynatılıyor denmez.

Çim dosyaları `assets/pitch/` içindedir. Renk haritasının geniş aydınlatma bantları normalize edilerek mevcut 14 biçme şeridinin üzerine bindirilen `detail` varyantları üretildi. Çalışma anında albedo/detail, normal, roughness yüklenir. AO dosyası hazırdır, mevcut sahada ayrı bir AO kanalı olarak bağlı değildir. Harita yüklenemezse eski prosedürel çim kalır.

Aday karşılaştırması `diagnostics/asset-research-v61.json` içindedir:

- Modern Stadium / Razny: yaklaşık 6,2 milyon üçgen; bu web uygulaması için ağır. Arşiv edinilemedi ve gösterilen Free Standard lisansının ayrıntıları doğrulanamadı. **Kullanılmadı.**
- Hoa Xuan Stadium: yaklaşık 1,3 milyon üçgen, CC Attribution. Resmî indirme isteği hesap doğrulaması istedi (401). **İndirilmedi, kullanılmadı.**
- Low Detail Animated Crowd: yaklaşık 10,3 bin üçgen, CC Attribution. Resmî indirme isteği hesap doğrulaması istedi (401). **İndirilmedi, kullanılmadı.**
- CGTrader Soccer Stadium: 114770 poligon, GLTF/FBX/BLEND listeleniyor; Royalty Free/noAI. Erişilebilir arşiv alınamadı. **Kullanılmadı.**
- Mixamo: Adobe hesabı gerektiren indirme akışı nedeniyle varlık alınmadı; Mixamo animasyonu veya mocap kullanıldığı iddia edilmez.
- MPFB bir Blender eklentisidir, tarayıcıda çalışıyor varsayılmadı. Hazır ücretsiz çıktı varlıkları dönüştürüldü. Bu ortamda Blender kullanılarak yeni export yapılmadı; geliştirici dönüşüm araçları `tools/` içindedir.

Aday bağlantıları:
https://sketchfab.com/3d-models/modern-stadium-21767e058e9e4df8a1c57352611756aa
https://sketchfab.com/3d-models/hoa-xuan-stadium-5fc8ffbb5c824d20b2bdb74a26e093f1
https://sketchfab.com/3d-models/low-detail-animated-crowd-4fe76fdec12d456f9b0db06b45cc53d6
https://www.cgtrader.com/free-3d-models/exterior/stadium/soccer-stadium-3d-model-d8108d1a-059f-49d6-a860-517d49110d63
