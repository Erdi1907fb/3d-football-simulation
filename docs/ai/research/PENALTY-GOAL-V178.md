# V178 — Penaltıda görünen gol ile sonuç tutarlılığı

2026-11-14 UTC · Codex · T-312'nin doğrulanan alt işi

Eski `goalLineFlight`, planlanan uçuş süresinin sonunda henüz tam-top kale düzlemi geçilmemişse vuruşu varsayılan olarak dışarı sayıyordu. Top aynı fiziksel hızla devam edip sonradan kaleye girebiliyor, görüntü ile skor/etiket çelişiyordu. İlk direk temasında sınıflandırmayı kesmek de devam eden fiziksel pozisyonu kaçırabiliyordu.

Yeni sınıflandırma planlanan varış süresini karar son tarihi olarak kullanmaz. Ortak aerodinamik model ilerler, direk teması uygulanır ve topun tamamının kale çizgisini geçtiği an adım içinde interpolasyonla hesaplanır. `goalCrossing` düzlemi 52.61 m'dir (52.5 + 0.11 m top yarıçapı); direkler arası ve üst direğin altındaki gerçek geçiş golü belirler. `goalEvidence` geçiş noktası ve zamanını taşır. Kaleci sektirmesi ve direk sonrası devam da izlenir. Sonucu uydurmak için kaleci, top veya hedef değiştirilmez.

## Kanıt

```sh
NEXT90_PENALTY_BASELINE=/workspace/football-camera-v177/assets/penalty-engine.js \
node tests/penalty-goal-evidence.cjs
```

- Mevcut farklı kadrolarla 100 seri / 1.084 doğal vuruş. Fiziksel uçuş ve sonrasındaki iki saniyelik kuyruk, sonraki vuruşa kadar 240 Hz örneklenir. İlk tam-top çizgi geçişi ile sonuç karşılaştırılır.
- [Eski/yeni ham kontrol kaydı](v178-arena-action/penalty-goal-ab.json): eski kaynakta 39 görüntü/sonuç çelişkisi yeniden üretildi; yeni kaynakta sıfır. Yeni dağılım: 684 gol, 351 kurtarış, 23 dışarı, 26 direk.
- Ek sınır testleri: adım sonu yerine gerçek geçiş interpolasyonu, geriye geçişin gol sayılmaması, üst direkten yüksek topun gol olmaması.
- Doğal seçimde istenen sonucu bulana kadar vuruş tekrar üretme veya gol kotası eklenmedi. Legacy stüdyo yolları, doğal P/FK, normal maçlar ve arena kontrolleri ayrıca regresyon paketinde doğrulanır.

Bu değişiklik kalecinin el/ayak tutuş animasyonunu tamamlamaz. O animasyon, diğer arena kontrol/zemin işleri, VAR değişiklikleri ve seçilen süre içinde limit korunarak biten eleme ayrı T-312 WIP dalında kalır. Eski WIP dosyasının tamamını yeni kaynağın üstüne kopyalama.
