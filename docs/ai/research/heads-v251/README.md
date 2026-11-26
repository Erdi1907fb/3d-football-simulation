# V251 — Cloud line verification and all-club real heads

Base: Cloud V250, `696eeb2`. The unpublished earlier V247 line experiment is archived on local branch `agent/codex/stable-touchlines-v247` (`2b7d210`); it is NOT merged. Cloud's V247–250 work remains present.

## Measured line result

Cloud's code really splits pitch paint into ≤1m sections, places paint at64mm above58mm grass tips, uses sine-free hashes and enforces a screen-space minimum width. The independent isolated **production outer-boundary** fixture uses640×360 single-sample orthographic output,16subpixel phases at each nominal width3.2/1.6/0.8px. V246's0.8px line disappears6/16frames; Cloud V250 disappears0/16. However Cloud's near-line centroid jitter failed the stricter regression: RMS0.15391/0.10930/0.10890px at those widths. That initial failed report is retained as cloud-v250-line-check.json.

V251 preserves Cloud's segmentation/height/min-width and adds a transparent raster fringe, screen-derivative edge coverage and filtered paint grain. Final RMS0.00640/0.03579/0.03462px; energy flicker0.00314/0.00994/0.00966; no missing line in48phases. final-line-check.json is PASS. This fixture isolates paint; it is NOT a score for complete-match quality. PSG–Roma seed4002331474 at11:59 loads22real heads without shader errors and compiles rain/snow. The user's original curved white leak was not reproduced on SwiftShader before or after, so this is not physical-Windows-GPU proof.

## Installed heads and actual coverage

3,073 real models: Cloud's1,081preserved +1,992new (1,988RFH and4individually reviewed public PES heads). Runtime compressed model bytes 951,342,838; additional 544,601,689. All1,081previous asset hashes are unchanged. Every new model is<2MB/<35k triangles. No full source archive, raw RFH, plugin, paid-game install or executable ships. Only selected scene players load at runtime. The RFH source-family cap is800million bytes after the user explicitly broadened scope to every represented league/cup.

Coverage accounts for **all180installed clubs**, first11+bench+profiles: 3,857/8,140distinct identity records real; first11 1336/1980. Named priority group: 66clubs, 1924/2732records, first11 661/726. Variants of the same human can be counted separately (ID/name/DOB key), so these are not unique-human totals. The historic Antalyaspor priority name is explicitly marked missing-profile and is absent from the installed registry; a fake club is not created.

club-coverage.json lists every identity, source and unresolved reason. remaining-identities.json keeps the actual queue: missing public reviewed models, conflicting profile DOBs, missing DOBs and unlinked identities. This is substantial completion of available sources, **not a claim of all players complete**. Own portraits/general fallback remain when a real source cannot be safely matched. Forecasts, seeds, squads, kits and gameplay physics are not changed.

## Identity and source fixes

Both sides of birth-date comparison use full ISO day. Recycled ID alone never suppresses an import; explicit names/aliases plus full DOB and uniqueness still apply. Reviewed name-order/nickname/transliteration links are in tools/head-import/reviewed-identities-v251.json. Club-vote normalisation merges legal FC/FK/RSC prefixes, preserving distinct city/united/real terms; this recovers Anderlecht/Crvena zvezda and other split source clubs. Examples: Kim Min-jae, Allan Elias, Yuri Berchiche, Abner, Josafat Mendes and the two distinct Nico González players. Actual DOB conflicts (e.g. Lewis Hall1999vs2004) remain rejected.

Four free public PES sources supplement RFH: Equi Fernández (Tobias), Koulierakis (Luka), Joe Willock (Newcastle pack's explicit117917ID list) and Batrakov (Obsessed Artist, creator's custom95182folder). The ShareMods Batrakov attempt returned Wrong captcha; shared handoff was unavailable in the user's current chat UI. A separate explicitly listed **free** ModsFire release succeeded through normal download. No CAPTCHA bypass, account creation, paid Ko-fi source or artist messaging. Batrakov's initial face was transparent: a source skin bit128 was incorrectly treated as a hair mask. That conversion was rejected; converter/test fixed, replacement pilot visually reviewed in actual Galatasaray kit. A stricter opaque-skin pilot also caught Willock's unnecessary skin mask; all three other new public heads were rebuilt with the same corrected converter, preserving source archive hashes and all pre-V251binaries. Do not reuse the rejected temporary conversion.

## Validation and limits

Full Node/PHP suite: 78/78PASS at the3,073model catalogue (suite.json); after the final public-skin material repair, affected head checks are rerun (targeted-checks.json). All model hashes/geometries and representative animated body/skin/neck/kit/rewind checks: targeted-checks.json.8Python identity/material/preservation tests and6RFH parser tests PASS. The8mode camera/material/head/kit/rewind browser audit passed on the intermediate1,646→1,650catalogue; new assets afterward are validated by final library tests, final-mode-check and real shared-actor sample pilots. Actual buffers/source buffers and sample times are in the JSON, not inferred from screenshot dimensions. Software WebGL is not a physical phone/Safari/Windows GPU test. No full-length final MP4 export is claimed.

Images are actual shared game actors with real game kits. Public-and-nickname pilot includes Batrakov/Willock/Koulierakis/Yuri/Abner/Josafat. Twelve initial RFH/public samples and the final all-club sample are visual samples, not a claim that every new face was individually viewed. Geometry/hash checks cover every installed model. All proofs are source/research only; Hostinger blocks docs/tests/tools as before. Main push is not Hostinger deployment.

## Reproduction and continuation

See tools/head-import/README.md and committed source specs. `extend-plan.py --all-clubs` retains the named big-club priorities and audits remaining club profiles; the importer has atomic cache/install writes and can resume. `audit-library.py --baseline 696eeb2 --report inventory.json` verifies preservation and all bytes. `audit-priority-coverage.cjs club-coverage.json` compares against the exact V250 runtime. Keep the remaining identity queue; never assign another player's face or relax wrong-day guards to improve a percentage. Aylık/Headers and Volleys remains paused by the user.

## Explicitly named clubs

| Club | First XI real | All roster/profile identity records real |
|---|---:|---:|
| Galatasaray | 11/11 | 34/44 |
| Fenerbahçe | 11/11 | 34/40 |
| Beşiktaş | 11/11 | 35/41 |
| Trabzonspor | 10/11 | 30/45 |
| Arsenal | 11/11 | 28/32 |
| Manchester United | 11/11 | 36/38 |
| Manchester City FC | 11/11 | 32/34 |
| Liverpool | 11/11 | 38/41 |
| Chelsea | 11/11 | 29/33 |
| Tottenham Hotspur | 11/11 | 34/34 |
| Bayern München | 11/11 | 26/33 |
| Borussia Dortmund | 11/11 | 30/38 |
| RB Salzburg | 5/11 | 30/57 |
| Bayer Leverkusen | 11/11 | 31/36 |
| Real Madrid CF | 11/11 | 30/36 |
| FC Barcelona | 11/11 | 29/33 |
| Atlético de Madrid | 11/11 | 25/32 |
| Real Betis | 11/11 | 28/31 |
| Villarreal CF | 11/11 | 21/29 |
