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
