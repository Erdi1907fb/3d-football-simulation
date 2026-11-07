# Open Football → next90sim: ilk uyarlama

Kaynak: https://github.com/ZOXEXIVO/open-football
Sabitlenen sürüm: `9bb183af844980ff0c398597868b635aff191674`.

Tam maç motoru Rust'tır. Repodaki WASM maç görüntüleyicisi, tüm karar motorunun
tarayıcı sürümü değildir. Hostinger HTML/PHP kurulumu için bu sürümde iki gerçek
algoritma JavaScript'e çevrilip mevcut maç motoruna bağlandı:

- **Pas desteği:** taşıyıcıya göre oyuncunun kendi açısı, en yakın baskıcıdan
  uzak yön ve ileri yön birlikte hesaplanır. Kaynaktaki 9.5–20 metre destek
  aralığı ve baskı arttığında daha yakına destek verme davranışı korunur.
- **Pas güvenliği:** kendi kalesinden uzaklaşan pas yönü ve alıcının 2.5 metre
  çevresindeki rakip sayısı, uyarlanabilir pas planında seçenek puanına girer.

Üç temas oyuncusu ve mevcut son vuruşlar korunur. Topsuz bek/kanat/orta saha
desteği 5 Hz karar döngüsünde, 60 Hz hareket sistemi üzerinden uygulanır.
Yazılmış atak aileleri korunur; mevcut ailelerin hepsi aynı pas zincirine
çevrilmedi. Pas güvenliği, özellikle uyarlanabilir kontra planlarında çalışır;
her yazılmış pas artık tamamen serbest bir karardır iddiası yoktur.

Yeni destek hedefi, mevcut taktik hedefinden en fazla 5 metre sapabilir.
Duran toplar, kaleci, stoperlerin gerideki güvenliği ve gol temas oyuncuları
bu ilk destek uyarlamasının dışında tutuldu. Hücum koordinatlarında iki takım
için de +X yönü kullanıldığı dikkate alındı. Analiz tahmini skorları korunur;
bu değişiklik futbol tahmin modelini değiştirmez.

Tam Rust maç motoru, öğrenilmiş oyuncu zekâsı veya Football Manager eşdeğeri
fizik bu pakette yoktur. Yüz, forma ve penaltı animasyonlarında bu sürüme özel
yeni bir değişiklik yapılmadı. Önceki sürümdeki düzeltmeler korunmuştur.

Lisans Apache-2.0'dır. Asıl Rust dosyaları ve lisans
`assets/vendor/open-football/` içindedir; çeviri ve değişiklikler
`assets/open-football-adapter.js` başlığında işaretlenmiştir.
