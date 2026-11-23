# V237 · bowling presentation and shared results

Production Three.js/Scene athletes, kits, football and seeded bowling/futnet/5v5 engines. No generated replacement game imagery or forced match results. All browser checks use Chromium with software WebGL; these are correctness checks, not a physical GPU performance benchmark.

- `tests/bowling-presentation.cjs`: gutter floor/edge clearance, continuous finale entry, 1/2 actual winning players, same-time rewind, winner-first score identity, card layout and nonzero export PCM. Real encode-input normalization must preserve custom whistle/kick/pin/cheer/winner-song events.
- `tests/browser-bowling.cjs`: actual 2v2 short / 1v1 classic studio, portrait framing; wide view checks real athletes and active lane, athlete pixel height and distance before room fog. Empty hall-corner fit alone does not establish readability.
- `tests/browser-bowling-presentation.cjs`: actual GS–Aston Villa selection, active-head projection, 24 equal supporters and deterministic reactions, actual winner arm pose, Three mesh raycasts against lane and open gutter, UCL mark loaded, preview AudioContext running, existing GS audio decoded, generic cheer fallback. Downloaded MP4 excerpts use the actual production draw/export job and shared buffers/events. AAC is decoded by ffmpeg and measured for energy; track presence alone is insufficient.
- MP4 files are **short excerpts**, 1080×1920 H264 / 60 FPS / AAC, not complete match exports. The explicit kickoff-silence cue prevents the exporter injecting a test whistle that could mask a missing kick/pin/cheer. Production whistle, kick, pin and finale clips are tested separately.
- `tests/browser-five-results.cjs`: actual standalone 5v5 final scene plus a real single-match competition plan/result-card draw with the selected competition mark. Existing scorer panel remains in standalone mode. Futnet final screenshot comes from the actual prepared studio.

An intermediate downloaded finale clip caught the common encode-input whitelist dropping new custom event types. `VideoCore.exportAudioEvents` now preserves opt-in audio keys and their local cue times. The final browser report records the corrected AAC outputs. Earlier failing reports are not treated as successful validation.

Full Node/PHP suite, final browser reports and source manifest status are saved alongside this file after completion. No Hostinger deployment or physical iPhone test was performed in this task.

Final result: **69/69 Node/PHP checks pass** in `final-test-summary.json`. The first full run is preserved separately: the new layout check initially used strict `<` where a card ending exactly at the HUD start is valid (`<=`). The corrected check and final encode-input cue regression pass in the rerun. All four downloaded AAC excerpts and both 5v5 routes pass. The final source manifest reports build237/filesMatch=true/528 files.
