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
