# V245 / T-400 — selected FM27 real-head expansion (validation in progress)

879 runtime heads:332 existing retained +547 additions,155,095,635 additional bytes;
total343,901,365bytes. New model max552,928bytes /31,165triangles. All are lazy-loaded
only for selected identities;8.9GB archive/RFH/plugin/game files are not deployed.

Sources/plan/reproduction: tools/head-import/README.md, fm27-sources.json and
fm27-plan.json. Current CSV SHA256 aec39104895990d07ceb7e2e072a6f83ee4d104e1e9e74bf36aecb4a8b0d2c9d.
Base archives plus v1.0.2 then v1.1.1 patches; latest CSV excludes managers and
removed wrong matches. Unique source name + reviewed same-club alias matches the
existing game ID and DOB; source CSV has no DOB, so this does not claim independent
source birth-date data. Different-club/ambiguous candidates stay deferred.

556 planned:547 accepted,1 joined to the same Slonina head already installed,
8 rejected by strict2MB/35k-triangle guards. source-attempt-report.pass=false records
these deliberate source rejections, not a failed game regression suite. Heavy:
Rafael Leão,Fábio Silva,Wagner Pina,Lennart Karl,Jakub Kiwior,Sacha Boey,Tammy Abraham,
Castello Lukeba. An attribute-aware locked-border hair simplification trial could
not meet the conservative error budget; the experimental dependency/tool is not
shipped. Three degenerate dummy hair shells were safely omitted; no face geometry
or texture detail was silently lowered. Rejected players retain own portrait.

Batrakov is NOT present in the author's currentCSV. Additional public source:
https://pes-files.ru/aleksei_bartakov_face (Obsessed Artist) links
https://modsfire.com/Wzbdv46yewcHIfp (A.Batrakov.rar,7.53MB). Ordinary page/link steps
worked but final anonymous request returned403/HTML, including cookie-session retry;
no model acquired and no bypass attempted. Older Valerchi7 source
https://pes-files.com/pes-2021-aleksey-batrakov-face/ links
https://sharemods.com/2sixo133kh3m/A._BATRAKOV.rar.html (earlier CAPTCHA blocked).
Keep Batrakov's own portrait; do not assign a different player.

closeups.png is actual current shared actor/head/skin/kit renderer output for11
players, not generated artwork; pilot-report gives source IDs and actual kit paths.
RFH format/range tests6/6 PASS; expanded head-body/coverage checks PASS at suite start.
Full77-suite and8production-mode browser checks are running. Do not label stable
until final reports are copied here. Physical Safari/mobile device not tested.
Coverage.json is current runtime coverage (real3D vs own photograph vs generic),
not a claim that every squad member has a real head.153/180club squads have at least
one real head;56national squads also use matching IDs. Example Liverpool23/23real;
GS23real+6photo;FB21+4;BJK23+4;TS19+8+2generic. Remaining CSV candidates outside
selected big-club/all-uncovered-club-first-starter scope are not silently added,
keeping this increment under180MB. A future budgeted batch requires identity review.

Shared V244 temporal fixes, existing body/neck fit, skin transfer, football motion,
boots and kit authority stay in place. No FM plugin skeleton, facial animation or
new locomotion pack was imported. Aylık/Headers and Volleys remains paused.
