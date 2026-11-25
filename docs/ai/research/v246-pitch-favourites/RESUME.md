> Superseded by ../pitch-heads-v246/README.md: execution recovered and V246 implementation/testing resumed. The environment blocker below is historical.

# V246 hazırlığı — beyaz saha izi ve eksik yıldız kafaları

Tarih: 2026-11-25. Taban/main: 7d53f900edae618bd0af319e79820ac9eec5835d (V245).
**Bu kayıt bir düzeltme yayını değildir. Üretim kodu/model değişikliği, yeni test sonucu veya main push yok.**

## Kullanıcının yeni isteği

1. PSG–Roma Şampiyonlar Ligi serbest kısa maçında, açık hava/yayın kamerasında, yaklaşık 11:59 gösteriminde sahadan geçen uzun beyaz, yer yer kesikli/parlak eğriler var. Ekran görüntüsü konuşmada. Sorunu bütün modların ortak sahne/görüntü hattında bul ve düzelt.
2. Dembélé ve Dybala gibi tanınan oyuncuların gerçek kafalarını bütün modlarda göster; eksik aktarım/kimlik eşleşmesini araştır. Main push yetkili. Aylık modu hâlâ bekliyor.

## Doğrulanmış kafa aktarım eksikliği

FM27 güncel ücretsiz CSV'de ikisi de VAR; mevcut885kafalık manifestte ikisi de YOK.

| Oyuncu | Mevcut oyun/profil ID | Profil DOB | FM kaynak UID | Kaynak kulüp |
|---|---|---|---|---|
| Ousmane Dembélé | 229744 | 1997-05-15 | 85140178 | Paris Saint-Germain |
| Paulo Dybala | 164839 | 1993-11-15 | 14044150 | Roma |

Kimlik kaynakları: assets/player-profiles/psg.json, roma.json; Dembélé france.json'da da aynıID/DOB ile var. Ancak assets/club-rosters-v75.json içindeki statik PSG/Roma kadrolarında ikisi de yok. Önceki RFH planı statik kulüp kadrolarını taradığı için haftalık/canlı maçların kullandığı bu profilleri dışarıda bırakmış. Oyuncuları kadrolar arasında taşımayın; bu bir model katalog/kimlik kapsamı sorunu.

Profil havuzu taramasında 5818 ID/DOB kimliği ve henüz modele bağlanmamış, tekil CSV isim eşleşmesi olan2812 aday bulundu. Bu sayı doğrulanmış yeni model değildir. Bütün adayları körlemesine eklemeyin. Önce istenen iki oyuncu ve büyük kulüplerin doğrulanmış profil/canlı oyuncuları; mevcut isim/DOB/ID/staff guard'larını koruyun. Canlı FotMob kimlikleriyle oyun/profil ID bağlantısını ayrıca test edin; global yalnız-isim fallback'i eklemeyin.

Mevcut araçlar: tools/head-import/{import-fm27.py,convert-rfh.py,range-zip.py,fm27-sources.json,fm27-plan.json}. Altı arşiv/patch indeksi önceki ortamda /tmp/fm27-batch/index-*.json; CSV /tmp/fm27-realfaces-players.csv. Kaynak URL/patch önceliği repoda kayıtlı, geçici dosyalara bağımlı kalmayın. Mevcut kaynak ailesi158.2MB; planın180MB bütçesi var. Gerekirse yeni sınırlı parti bütçesini DECISIONS'a gerekçesiyle yazın. Batrakov/Fábio/Lukeba için V245 guard ve görsel ret notlarını koruyun.

## Beyaz iz: henüz kök neden doğrulanmadı

İlk statik inceleme:
- assets/stadium-lighting.js, V114: dört floodlight-beam mesh'i, açık uçlu silindir/özel additive shader; userData.floodBeam=true. Hava modülü bu etkiyi güçlendiriyor. Bu sadece incelenecek aday, suçlu olduğu kanıtlanmadı.
- assets/scene.js: replay ballTrace5noktası ve kısa ballMotionBlur; blur dt<.05 ve mesafe<1.6m koruması içeriyor. Uzun iz ile ilişki henüz kanıtlanmadı.
- Ortak HDR/MSAA/post hattı assets/broadcast-remaster.js. Gölge, ışık huzmesi, top izleri ve post/AA ayrı kapatılarak aynı kareyi karşılaştırın; paleti/kamera/fiziği rastgele değiştirmeyin.

Geçici /tmp/white-pitch-probe.cjs gerçek Scene/SekmeMatch ile PSG–Roma, seed239/free30s/sample4s/high1280x720 için baseline/no-beams/no-shadows PNG üretmeye başlatıldı. Çalışma ortamı koptuğundan sonucu OKUNMADI, görsel inceleme yapılmadı ve test geçti denemez. Yeni ortamda aynı gerçek haftalık canlı kadroları/kamerayı kullanarak tekrar üretmek gerekebilir; statik kadro kullanımı ekran görüntüsündeki maçla aynı olmak zorunda değil.

## Kesinti ve devam

Exec-server bağlantısı koptu; tekrar deneme 'recovery timed out after45s' verdi. Seçili ortam unavailable olarak bildirildi; Cloud Environment durumunda connectivity=offline, desired/observed phase=running, failure=null. Ağ politikası unrestricted; bu bilgi çalışan shell veya renderer kanıtı değil. Çalışma ortamının tekrar kullanılabilir olması gerekiyor; konfigürasyon/secret değişikliği yapılmadı.

Yerelde agent/codex/pitch-artifacts-favourite-heads-v246 dalı ve TASKS'a T-402/T-403 satırları eklenmişti, commit/push edilmemişti. Bu uzak dalda yalnız bu kalıcı devam kaydı var. Devam ederken yerel değişiklikleri koruyun, main/AGENTS/en yeni HANDOFF'u okuyun. Gerçek düzeltmeleri, kaynakları, yakınplan+maç görünümünü ve uygun testleri tamamlayıp VERSION/cache/build manifesti/CHANGELOG/HANDOFF/TASKS/PROJECT_STATE/DECISIONS'ı birlikte güncelleyin; sonra main'e push edin. V245 testlerini bu yeni hataların düzeldiğine kanıt saymayın.
