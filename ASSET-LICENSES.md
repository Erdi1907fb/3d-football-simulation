# Goal celebration animations — v73

KayKit Cheer and Quaternius Dance_Loop (free Standard) are CC0; converted
upper-body tracks and original license notices are in
assets/animations/celebrations/. See SOURCES.md there for exact provenance.

# Referee whistle recordings

Source: “Referee whistle sound.wav”, Rosa-Orenes256, Freesound sound 538422.
https://freesound.org/people/Rosa-Orenes256/sounds/538422/

License: CC0 1.0 Public Domain Dedication.
https://creativecommons.org/publicdomain/zero/1.0/

Downloaded public HQ preview on 19 October 2026. Edited with trimming, timing,
tempo adjustment, fades, equalization and quiet short reflections to make five
separate match cues. These are variations of one real recording, not five
independent original recordings. No external sound service is contacted during
playback or video export. Copies are in assets/audio and whistle-data.js.

whistleStart: kickoff, including second-half restart.
whistleFoul: stop play for a foul.
whistleRestart: permission to take a free kick or penalty.
whistleHalf: two blows to end the first half.
whistleFull: three blows to end the match.

Other pre-existing sound and graphical assets retain their existing provenance.

# Viking FK crest refresh (21 October 2026)

Club page: https://football-logos.cc/norway/viking/
Downloaded PNG, 1500 × 1500 pixels:
https://assets.football-logos.cc/logos/norway/1500x1500/viking.5cde2850.png

File: assets/logos/viking.png. This is the existing club identity, not an
AI-generated replacement or a claim of ownership of the club trademark.
The provider spelling “Viking FK” is resolved to the existing “Viking” entry.


## v0.44 owner-supplied identity

`assets/next90sim.png` is the unchanged image supplied by the project owner
for this stadium use. No additional rights are asserted. Instagram and YouTube
are identified by small vector camera/play symbols drawn on the board canvas;
their names and marks remain associated with their respective owners.
Competition boards use existing competition names; this release does not
invent official competition logo files.


## v0.45 board and press update

Competition boards now reuse the existing `assets/competitions/broadcast/*-light.png`
marks with the existing competition name below. The owner-supplied 90 emblem
remains unchanged. Camera/play platform symbols are drawn larger on canvas;
platform names and marks retain their respective ownership. Photographers,
DSLR bodies, long lenses, PRESS bibs and flash sprites are procedural scene
geometry and canvas artwork created for this project.


## v0.47 FM26 kit textures and shirt-print font

106 2026/27 textures by biavva, from the public creator-linked Italia Kits
26-27 ZIP. Repacked as 1024 WebP for this simulator; original artwork marks
are retained. Source, team/FМ ID mapping, variants and unavailable teams are
listed in FORMA-KAYNAKLARI-v0.47-TR.md and FORMA-KAPSAMI-v0.47.csv.

Barlow Condensed Bold: The Barlow Project Authors; SIL OFL 1.1.
Source https://github.com/google/fonts/tree/main/ofl/barlowcondensed
The full font license is preserved at assets/fonts/OFL.txt.


## v0.48 FM Kits Hub expansion

550 additional FM26 community textures for 94 catalog clubs, retrieved from the public FM Kits Hub per-club downloads on 2026-10-22. Per-club creators, source URLs and variants are credited in FORMA-KAYNAKLARI-v0.48-TR.md and FORMA-KAPSAMI-v0.48.csv. Converted to 1024 WebP with source artwork retained. No FM executable, plugin or 2D preview is bundled. Community goalkeeper sets have not all been independently verified against actual match usage.


## v0.49 additional FM26 creator textures

31 additional European clubs / 148 converted atlases from FM Kits Hub public club downloads and original public creator posts on the Sortitoutsi FM26 official thread. Creators and per-source URLs and available original atlas URLs/captions are retained in FORMA-KAYNAKLARI-v0.49-TR.md and diagnostics/kit-sources-v49.json. Authors include Community, Laurent Czerwinski, klyt, bolid74, cakilinho, attlee74, biavva, feltronnn, kosic, RisingStarKiller, priority76 / @onkelboxer and Kadir genco arslan. Original image author marks outside the UV regions are retained. Team trademarks/sponsors remain their holders' property. These are community kit assets, not a transfer of ownership. The 22 Hub source seasons were not independently confirmed as 2026/27; Lillestrøm is calendar 2026. No executable, account credentials or external game installation is included.

## v0.53 MPFB anatomical head
MPFB asset base and morphs: MakeHuman Community, CC0-1.0. Exact sources and hashes: assets/faces-source/manifest.json. This is a generic anatomical base, not footballer scans. ESPN roster measurements/2 portrait references retain their upstream source attribution in assets/faces/four-club-rosters.json.

## v79 original concept identity and optional render helper

The interlocking era-gates model (`assets/concept/trophy.glb`), its rendered PNG and `assets/concept-asset.js` are original procedural WOS assets. The v79 concept broadcast layout is original Canvas code. No third-party badge pack is used.

The optional PC render helper installs Playwright and ffmpeg-static locally through npm. Their binaries are not bundled in this ZIP. Project notices/licenses remain with their installed distributions: https://github.com/microsoft/playwright (Apache-2.0), https://github.com/eugeneware/ffmpeg-static (distribution wrapper; consult downloaded FFmpeg build licensing). Video muxing uses stream copy and AAC encoding; it does not change ownership of source audio assets.

## Open Football adaptation (v93)
Selected support-position and pass-safety algorithms from ZOXEXIVO/open-football, commit 9bb183af844980ff0c398597868b635aff191674; Apache-2.0. Original modules, license and attribution: assets/vendor/open-football/. Modified JavaScript port: assets/open-football-adapter.js. This is a partial adaptation, not the entire Rust engine.

## Open Football expanded adaptation (v94)
Selected algorithms from the same pinned Apache-2.0 source are now used in
team phases, defensive duties, off-ball evasion, dribble lane/duel evaluation,
through balls, steering, rolling/pass flight, contact and net response. See
OPEN-FOOTBALL-v94.md for the exact mapping, changes and integration limits.
Original Rust files and license remain in assets/vendor/open-football/.

The live-possession generator in assets/possession-engine.js is Next90sim
integration code using these selected algorithms, not an additional verbatim
Open Football module. The exact source-to-integration mapping is documented.

## V112–V113 additions
- `assets/environment/stadium_01_2k.hdr` — Poly Haven “Stadium 01” by Sergej Majboroda, CC0 1.0 (https://polyhaven.com/a/stadium_01). High-quality reflections only.
- `assets/vendor/three-postfx.js` — three.js r160 example post-processing modules (EffectComposer, RenderPass, ShaderPass, MaskPass, UnrealBloomPass, OutputPass, SMAAPass and shaders), MIT, © three.js authors; repackaged by `tools/build-postfx.cjs`.
- `assets/national-walls.json` — derived from `assets/concept/teams.js` national line-ups (existing sources).


### V162 — Millî takım kapsamı
- 85 ülkenin kadro metaverisi, mevcut ESPN entegrasyonunun `fifa.friendly/teams/<id>/roster` uçlarından 2026-11-10 tarihinde alındı; boş dönen Suudi Arabistan `fifa.world` kaydından tamamlandı. Her takımın kaynak URL/tarihi `club-rosters-v75.json` içinde bulunur. Bunlar sağlayıcı kadrolarıdır; seçilen simülasyon ilk 11'i resmî maç kadrosu olarak sunulmaz. Yeni fotoğraf, logo veya lisanslı forma görseli indirilmedi.
- `national-kit-profiles.js`: mevcut katalog ve millî arşivin renk/desen bilgilerinden proje içinde üretilen tasarımlar; resmî sezon replikası iddiası yok. Mevcut dört yerel millî atlas korunur; yeni üçüncü taraf medya varlığı eklenmedi.

# Arena defensive steering (V163, 10 November 2026)

`assets/japon-duels.js` adapts predictive interpose/evade from
[Mugen87/Yuka](https://github.com/Mugen87/yuka), MIT © 2023 Yuka authors,
pinned at `10591304811222d6856020d5de129b39ef43b58d`. Exact source links and full
license are in `assets/vendor/yuka/arena-steering-NOTICE.txt`. Football skill
envelopes, contacts and arena integration are original; no external service
is required at runtime. This is a small 2D adaptation, not the whole Yuka engine
or imported football motion-capture clips. The user explicitly requested
GitHub research/reuse for skills and their defensive counterpart.

# V172 shared football intelligence — League-Soccer references

`assets/football-intelligence.js` is an original JavaScript adaptation of
arrival-time, passing-corridor and keeper-reading principles examined in
`Erdi1907fb/Yeni-Video@f987081230e1498a2ad3b3c53437035ec39c5a73`,
`engine/src/onthepitch/AIsupport/AIfunctions.cpp` and the goalkeeper strategy.
The underlying League-Soccer / GameplayFootball source is Apache-2.0,
Copyright 2019 Google LLC & Bastiaan Konings; license copy:
`assets/vendor/league-soccer/LICENSE`. This is not a complete engine port.
No player model, pitch, kit, face, image, animation or audio asset was added
or replaced for this adaptation.

## Local AAC-LC fallback (V174)

`assets/vendor/mediabunny-aac/encoder.js` is the unmodified browser bundle from
`@mediabunny/aac-encoder@1.65.2`, Vanilagy/contributors, MPL-2.0 (LICENSE beside it).
Source: https://github.com/Vanilagy/mediabunny/tree/v1.65.2/packages/aac-encoder .
The embedded unmodified FFmpeg AAC build is LGPL-2.1-or-later; COPYING.LGPLv2.1,
FFMPEG-LICENSE.md, upstream README/build instructions and bridge.c accompany it.
Pinned FFmpeg source:60a2818f76dcd1fee3155b1791304af104a0fc1b; Emscripten4.0.21.
It includes no GPL/nonfree build components. Rebuild/replace the standalone bundle
using the provided source instructions to use a modified AAC library. The AAC code
is loaded locally only when native AAC is absent; no media is uploaded to a service.

## Offline football research (V175)

The small research summaries credit Metrica Sports, SkillCorner and PySport;
no raw research datasets are bundled in the game runtime. SkillCorner Open Data
MIT notice: `docs/ai/research/licenses/SkillCorner-MIT.txt`. Body Pose is labelled
MIT by the provider's dataset card; its short sample was used only for an offline
angle-extraction prototype, not as ready-made game animation. FIFA is conceptual
reference only. No StatsBomb raw data or derived product parameters are shipped.
Full source-specific terms and limits: `docs/ai/research/EMERGENT-SOURCES-V175.md`.


### V179 Competition Studio graphics
`competition-broadcast.js` canvas layout and `competition-ceremony.js` procedural cup, pedestal and medals are original project code. Covers use existing game renders and already tracked team crest/kit assets; no new third-party photographs, logos, fonts, animations or generated art were downloaded. Existing crest/player likeness terms remain unchanged.


### V180 action names / Orkun membership correction
Competition action-name panels are original project code. Orkun Kökçü reuses the existing player profile/reference and portrait endpoint; no new photo/model/audio/font was downloaded. Club membership, number and position facts are sourced to the official Beşiktaş player page recorded on the player entry.
