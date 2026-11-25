# V246 — missing favourite heads and pitch render compatibility

Public source fixture: PSG–Roma,25 November2026, seed4002331474. Source release main7d53f90.

## What changed
- Static squads omitted Dembélé/Dybala even though the game profile data and public RFH CSV contained them. Plan now includes32 priority-club profiles.181 models added,1,066 total;55,589,176 additional compressed bytes,402,624,818 total. Previous885 binary hashes unchanged. No full source archive/plugin ships.
- Verified profile aliases/IDs extend existing heads; provider fallback requires full DOB, explicit name and a unique model.17 reviewed source aliases cover PSG and other big clubs. Recycled source PES IDs receive separate namespaced paths. No roster, forecast, outcome or physics edits.
- Dembélé's108,389 source face triangles needed bounded index simplification; original attributes retained,0.2% normal/UV error bound. Hair uses1%. Three dense sources stay under the pre-existing80k runtime limit, all new files<2MB. Existing kit/neck/body/skin system remains authoritative.
- White pitch streaks from the user's Windows/Chrome capture did **not** reproduce on SwiftShader with the actual seed/lineups/time. V244 custom half-float MSAA resolve removed; single-sample HDR targets feed the existing SMAA/grade chain. Reversed GLSL smoothstep edges in paint, fan flashes, weather and studio particles changed to defined ordered edges. A regression guard scans numeric shader edge pairs. Palette/resolution remain unchanged. This is a compatibility correction, not a proven diagnosis or physical Windows retest.

## Evidence and reproduction
- `inventory.json`: exact addition names/IDs/bytes and previous hash retention.
- `lineup-heads.json`: all22 public PSG–Roma starters resolve real heads; Dybala also independently displayed in closeups.
- `profile-coverage.json`: complete32-profile counts and unresolved names; not a claim that every player has a real model. Some old profiles have conflicting DOB/ID records (e.g. Hofmann/Hall); do not bypass identity guards to increase counts. Batrakov absent current source; Lukeba source hair remains rejected. Own portrait/general appearance preserved.
- `closeups.png` and `dense-closeups.png`: actual shared Scene actors, real kit runtime and imported geometry; no generated imagery. `HEAD_IDS=110626,47179,135067,45993,134930,180303 PILOT_LIMIT=6 ARTIFACT_DIR=/tmp/v246-head-pilot node tests/browser-head-pilot.cjs`; dense IDs108239,143844,178137,137000,132974,113711.
- `node tests/browser-render-compat.cjs`: public actual fixture around11:59 (time41.153478), moving preceding frames,22 actual loaded heads, no head failures, direct HDR route assertions; final rain/snow shaders additionally compiled with zero shader errors; outputs scene-only PNG without application HUD. User's GPU streak was not reproduced before or after. A redundant20-frame attempt was stopped to avoid two expensive simultaneous software GPU jobs; the permanent3-frame test completed.
- `NEXT90_HEAD_AUDIT=1 NEXT90_PITCH_MODES=japon,five,penalty,freekick,futnet1,bowling,eleven,competition ARTIFACT_DIR=/tmp/v246-mode-audit node tests/browser-pitch-colour.cjs`: shared production scene / fixed quality over seeking / rewind / actual heads and kits.
- `node tests/run-all.cjs`, `python tools/head-import/test-rfh.py`. See saved test reports for final outcomes. The controlled surface comparison against pre-V244 f0231ac has errorRatio0.1122 (~88.8% less reprojection residual in this synthetic surface fixture, not a whole-match quality score); the0.2s1080×1920/60fps12-frame H.264 software-worker export decodes in ffmpeg. Physical mobile Safari, user's Windows GPU and full-length match MP4 are not tested here.

No Hostinger upload performed. Main source push does not establish live deployment. Aylık/Headers and Volleys remains paused. Claude should start from the latest HANDOFF/T-402/T-403 and this report.

## Final validation
77/77 full Node/PHP suite PASS. The initial suite head checks ran at1,054 models; after12 final imports, the affected head checks were repeated at1,066 models/288neck poses/734RFH models and PASS, plus6RFH parser tests. Final temporal/shader-edge, weather and studio-ground units were also repeated after the last GLSL edit.
Eight production modes PASS (Japon,5v5,penalty,free kick,foot tennis,bowling,11v11,competition), four seek times each, zero browser/shader errors and no head/kit failures. Source/output buffers, active-body/jersey detail and post chain remain fixed; desktop source-buffer sizes vary by studio's existing profile, not by playback time. Actual PSG–Roma scene PASS with22 loaded heads and clear/rain/snow shader compilation. Controlled surface motion +0.2s1080p60H.264 decode PASS; this is not a full-match export.
Release246 has531code/text files, `php build.php` reports filesMatch=true. Physical user WindowsGPU confirmation remains T-402partial; head source gaps remain T-400partial.
