# T-382 ilk düzeltme paketi — V233 tabanı

Ortak mocap reverseWeight, örneklenmiş hızları ikinci kez dir/flank ile çeviriyordu. Match.sample çıktısının vx/vz alanları zaten dünya koordinatında. Bu çifte dönüşüm kaldırıldı. Prosedürel yürüyüşte `vx || fallback` yerine sonluluk denetimiyle gerçek sıfırlar korunuyor. Kök/top/sonuç bu animasyon değişikliğinden etkilenmez.

Arena pas alıcısına pay: mesafe / ilk hız yerine BallAero ile kuru çimde 1.9 m/s² yuvarlanma direnci altında varış tahmini. 5 cm örnekleme, en çok 801 önbellek kaydı; tarihçeden bağımsız. Kaleci geri pas hedefleri ve through hedefleri korunur. Yağmur/kar ve skid için tam kalibrasyon yapılmadı; varış hesabı kuru referans modelidir.

8 eşleştirilmiş sentetik 60sn 5v5, seed1–8; comparison.json ham veridir. Şut66→69, pas160→154, gol13→13, 0–0 üç→bir, loose-ball3→2. Tek tek seed'lerde kazanım/kayıp var; gol artırma garantisi veya gerçek haftalık maç doğruluğu iddiası yok. Kadro/tracking kalibrasyonu, gerçek cihaz/MP4 ve görsel değerlendirme bu ölçümde yok.

Yeni test movement-passing.cjs: dört dir/flank birleşiminde ileri/geri mocap seçimi, sıfır hız bileşenleri, 3/6/10/14m için 240Hz fizik ile varış doğrulaması (<8cm), hareketli alıcı payı. Ortak quick pakete eklendi.

Geniş kullanıcı talebi T-382 kısmi: savunma/kaleci/şut çeşitleri/boy ve rig/çim-grafik iyileştirmeleri bu dar pakette uygulanmadı. V233 sürüm numarası korunur; Hostinger dağıtımı yok.

Son doğrulama 2026-11-23 UTC: `node tests/run-all.cjs --quick` → 57 Node PASS; 4 PHP testi `spawnSync php ENOENT` nedeniyle çalıştırılamadı. Paket çıkış kodu1; tam yeşil değildir. engine-test quick kapsamı dışındadır. Kalıcı quick-summary.json ham sonuçları içerir.
