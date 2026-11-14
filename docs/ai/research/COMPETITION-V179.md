# V179 — Next90Sim Competition Studio

2026-11-14 UTC. Base main V178 / 178dfaa. Delivery is Hostinger web, not Windows.

## Implemented

- `competition.html`: eight-team / seven-game cup; four-team / six-game, three-week league. Single leg. Manual current-squad XI/formation or five including a natural goalkeeper. Duplicate entrants/players rejected. Existing catalog/squad sources, explicitly simulation lineups. No fabricated live/official starting eleven or measured team style.
- Shared Concept analysis + Match highlights for 11v11, with no imposed highlight duration cap. Shared physical Arena for 5v5. Cup draws go directly to the existing physical Penalty Studio with exactly the selected five/eleven. Regular shootout defaults remain eleven.
- FIFA **2022 group** ranking: points, global GD, GF, tied-group H2H points/GD/GF, conduct, reproducible lots. This is a chosen published ruleset, not a claim every FIFA edition uses the same order. Cards use individual identities when substitutions change occupants of a slot. Source in D-046 / UI.
- Immutable prepared match descriptors; deterministic replay checks reject score divergence. Future scores/advancing participants hidden until earned. One live Three world and one cached match, not seven full worlds. Large historical archive not loaded.
- One global timeline: actual cover, opening, match intros, full games/highlights, physical deciders, result cards, **after-every-match table/bracket**, extra week/round summaries, medals, champions transition, trophy celebration, final board. Goal pauses/deciders extend total video. No guarantee of a specific total number of minutes.
- Same prepared results exported separately as 1920×1080 and 1080×1920, 60 FPS, H.264/AAC MP4. Optional stadium sound. Shared `prepareFrame` waits for worlds before drawing/encoding fixed timestamps; never inserts wall-clock loading gaps into audio/video.
- Original canvas cover using actual game render, existing verified crests and **Next90Sim** branding; separate PNG and first video chapter. Arbitrary full-resolution frame PNG, plus quick navigation to result/week/round screens. No AI-generated photo or new external asset.
- Latest user corrections: Next90Sim CUP / Next90Sim LEAGUE; no 5v5/2v2/11v11 label beside/over the symbol. Light broadcast standings, point column, week grouping, full fixture names. Silver and gold recipients share medals stage; only champion remains at trophy lift. Cup supporters stay 50/50. League cuts to a separate club-branded small pitch / big stadium and all supporters belong to champion. Existing procedural venue architecture is reused, not a new licensed reconstruction of every real stadium.

## Automated verification

- `PATH=/workspace/deps/web-tools:$PATH node tests/run-all.cjs`: **48/48 PASS**, including existing 500-penalty/18-match engine regression. `tests/summary.json`.
- Final targeted `node tests/competition.cjs`: real 6-game small league, 7-game small cup / selected-five physical penalties, full 6-game analysis league, ranking, discipline/substitutions, seeded lots, roster errors, timeline continuity, no future leaks, medals/champion separation, full-name graphics, cancellation.
- `node tests/competition-frames.cjs`: 94 shared presentation samples exactly equal frozen V178 UI behavior; asynchronous prepare-before-draw ordering and cancellation.
- Optional real-browser scripts: `tests/browser-competition.cjs`, `tests/browser-competition-ceremony.cjs`. Chromium + SwiftShader, existing renderer/assets, native PNG/MP4 downloads, ffprobe/ffmpeg, actual HTML video metadata/seek/play-to-end, equal cup / all-home league crowd and visible actors. Detailed final results in the handoff.

## Limits — do not overclaim

Browser MP4 integration exports are **0.75-second excerpts** spanning actual cover, game, week board and trophy scene, in both orientations; they verify muxing, sound, native download, seek and playback. Full multi-minute fixture/timeline simulation is tested. **A complete multi-minute 1080p60 3D export has not been rendered end to end on target hardware.** Software GPU in this two-CPU environment is slow; first portrait run hit the harness's 240-second timeout, so final harness allows 900 seconds and uses shorter excerpts. This is not evidence of a production browser download bug. Hardware/GPU and long-file storage/download testing remains a separate task. No Instagram/YouTube duration eligibility guarantee.

Live read-only check: build176 / filesMatch=true. V179 is not automatically uploaded to Hostinger. Incremental ZIP must be extracted into existing public_html; existing data/config/assets retained. Check build.php after upload.

T-312 old keeper/VAR/friction/bounded-elimination WIP remains separate; this new mode does not complete it. No whole-branch merge of f3aa2a4.

Final fixes during validation: the normal-stadium medals state now clears the legacy goal-celebration camera object; otherwise it attempted to read a missing celebration target. The browser ceremony regression exercises both normal stadium stages. Async world loading also checks world identity before disposing or completing; cancellation while loading/warming faces cannot destroy a newly retried world (two VM regression cases). The browser harness now skips the hidden 5v5-seconds select in 11v11; its earlier wait was a test-action error, not a stuck match simulation.

Final evidence: `competition-v179/validation.json`. Four real ceremony snapshots pass: cup10→5actors/equal280+280supporters; league22→11actors/all20688spectators champion-only in the final club stadium. Trophy framing includes the actual supporter stand, not just the pitch.
