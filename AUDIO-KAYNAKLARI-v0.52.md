# v0.52 takım sesleri ve yuhalama

## Kullanıcının sağladığı kayıtlar

Kayıtlar kullanıcı tarafından 23 Ekim 2026'da bu simülasyonda kullanılmak üzere sağlandı; üçüncü taraf lisansı veya hak sahipliği doğrulanmış gibi sunulmaz.

| Özgün dosya | Kullanım | Yerel karşılık |
|---|---|---|
| gs tezahürat.m4a | Galatasaray ev sahibi olduğunda tribün döngüsü; Galatasaray deplasmanda gol attığında deplasman tezahüratı | assets/audio/gs-chant.mp3 |
| gs gol müziği.m4a | Galatasaray ev sahibi olarak onaylanmış gol attığında ilk gol sesinden 0,8 saniye sonra | assets/audio/gs-goal.mp3 |
| FB deplasman tezahürat.m4a | Fenerbahçe herhangi bir ev sahibine karşı deplasmanda onaylanmış gol attığında 0,8 saniye sonra | assets/audio/fb-away-goal.mp3 |

Galatasaray deplasmanında veya tarafsız sahada Galatasaray ev sahibi döngüsü kullanılmaz. Fenerbahçe ev sahibi olduğunda deplasman klibi çalınmaz. Diğer eşleşmeler önceki genel sesleri kullanır. Takım sesleri sadece ilgili seçili maç gerektiğinde yerel dosyalardan çözülür; toplam havuz üç küçük takım kaydıyla sınırlıdır.

Klipler mono32kHz/96kbit MP3 olarak normalize edildi; GStribün-20LUFS, gol/deplasman-18LUFS, hedeftruepeak-2dBTP. GStribün döngüsünün son/baş0,35saniyesi çaprazkarıştırıldı. Gol klipleri doğal sona kadar veya sonraki atak/santra/tekrar/VAR başlangıcına kadar çalar, sonrasında yumuşakça kesilir. Takım gol klibi sırasında ev sahibi tezahüratı kısılır; sonra aynı döngüye döner. İleri/geri sarma ve duraklatıp sürdürme klibi video zamanına göre devam ettirir. Canlı, kaydedilen sesli video ve PCM dışa aktarma aynı zamanlama kurallarını kullanır.

## Ev sahibinin deplasman golüne yuhalaması

Gerçek insan kaydı: **crowd booing**, HowardV, Freesound264378,17Şubat2015. Yaklaşık20yetişkin, Somerset/UK küçük salon, futbol temalı amatör gösteri; RodeVideoMicPro/PanasonicHCX-900. Yapay ses üretimi kullanılmadı.

- Birincil kaynak ve **CC0** lisans beyanı: https://freesound.org/people/HowardV/sounds/264378/
- Lisans: https://creativecommons.org/publicdomain/zero/1.0/
- İndirilen yüksek kaliteli önizleme: https://cdn.freesound.org/previews/264/264378_1654262-hq.mp3
-1,2.saniyeden3,2saniye kesit;100Hz/6,5kHzfiltre,-18LUFS, giriş/çıkış yumuşatma,mono32kHz64kbitMP3. `assets/boo-data.js` içinde gömülüdür; çalışma sırasında Freesound oturumu veya internetten dosya indirmesi gerekmez.
- İşlenmiş dosya:26253bayt;SHA256:`7eaaba18810fa4b973912798dc1830a231eeb99e2d68ba47c5e564861932390e`.

Sadece taraflı sahada ev sahibi olmayan takımın golünde çalar; nötr sahada/ev sahibi golünde yuhalama yoktur. Kontrol bekleyen golde kısa tepki; VAR veya iptal bunu keser. Deplasman golünde genel sevinç daha küçük tribün köşesi düzeyine indirilir ve ayrı yuhalama duyulur.


## Her takımın üç isteğe bağlı alanı

Katalogdaki 229 takımın her biri `assets/team-audio-config.js` içinde `homeChant` (ev sahibi tezahüratı), `awayChant` (deplasman golü sonrası tezahürat) ve `homeGoal` (ev sahibi gol müziği) alanlarına sahiptir. `null` alanlar mevcut genel seslere döner. Galatasaray'ın homeChant ve awayChant alanları aynı sağlanan GS tezahüratını, homeGoal alanı GS gol müziğini kullanır. Fenerbahçe yalnız awayChant alanında sağlanan deplasman kaydını kullanır; diğer iki alan boştur. Diğer takımların üç alanı da boştur.

Yeni kayıt geldiğinde yerel ses dosyası ve süresi tracks bölümüne eklenir; ilgili takım alanı bu anahtara bağlanır. Motor kodunu takıma özel değiştirmek gerekmez. Ses verisi yalnız seçilen maç için çözülür; önceki maçın artık gerekmeyen takım sesleri bellekten çıkarılır.

Mevcut ilk **goooool** efekti bütün takımlar için aynen korunur. Takım müziği veya tezahüratı onun yerine geçmez; onaylanmış golden 0,8 saniye sonra eklenir.


## Deplasman tezahüratına gecikmeli ev sahibi tepkisi

Onaylanmış deplasman golünde özel deplasman tezahüratı varsa önce mevcut goooool efekti, 0,8 saniye sonra tezahürat çalar. Tezahüratın başlamasından 2 saniye sonra ev sahibi yuhalaması 0,55 saniyede yükselir. Ana yuhalama düzeyi 0,50, deplasman tezahüratı bu sırada yaklaşık 0,24 düzeyindedir; tezahürat kesilmez. Yuhalama bitince tezahürat önceki düzeyine döner. Bu oranlar normalize edilmiş kayıtların mikser düzeyleridir.

Yuhalama en fazla 3,2 saniye sürer ve atak/santra/tekrar/VAR/iptal ile kesilir. Canlı dinleme, ileri-geri sarma ve iki dışa aktarma yolu aynı zaman çizgisini kullanır. Tarafsız sahada ve ev sahibi golünde yuhalama yoktur. Özel deplasman kaydı olmayan eşleşmeler mevcut genel tepkiyi kullanır.
