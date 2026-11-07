# CLAUDE.md

Claude Code için proje talimatı. **Asıl kurallar `AGENTS.md` içindedir** — önce onu oku;
bu dosya yalnızca Claude’a özgü ekleri içerir ve AGENTS.md ile çelişmez.

## Başlangıç sırası
1. `AGENTS.md` (mimari, test, sürüm ve Codex ile ortak çalışma kuralları)
2. `VERSION`, `docs/ai/PROJECT_STATE.md`, `docs/ai/HANDOFF.md` (en üst kayıt), `docs/ai/TASKS.md`

## Claude’a özgü notlar
- Bulut oturumlarında Chromium + Playwright hazırdır (`require('playwright')`); tarayıcı
  kontrolü için kökü `python3 -m http.server 8765` ile sun. SwiftShader WebGL yavaştır:
  stüdyo hazırlığı 1–3 dakika sürebilir.
- Kullanıcı Türkçe yazar; yanıtlar ve raporlar Türkçe, kod içi yorumlar İngilizce olabilir.
- Kullanıcı tamamlanan işlerin `main`’e push edilmesini istemiştir (V108 talimatı): testler
  geçtikten sonra çalışma dalını `main`’e hızlı ileri birleştir ve push et.
- Commit/PR metinlerine model kimliği yazma.
- Oturum sonunda `docs/ai/HANDOFF.md` en üstüne kayıt eklemek zorunludur (Codex okuyacak).
