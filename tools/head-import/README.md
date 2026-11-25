# Real-head conversion pilot (V243)

This is an offline importer for freely downloadable community PES facepacks, not a new roster database. No paid game installation is required. Source pages, credits, archive checksums and exact parser commit are recorded in `sources.json`; source archives and the external parser are not bundled here.

1. Acquire the source packs through their public download pages and retain maker credits. Extract each pack's numeric player folders, `#Win`/`sourceimages` and the included player-ID list into the configured `directory` under an input root. Preserve the original source-ID names. ID lists can be tab-separated or `Name 12345` rows.
2. Install the recorded `the4chancup/pes-fmdl-blender` commit outside the game repository. Pass its `pes-fmdl` directory to `--reader`. Python dependencies: Pillow and numpy.
3. Run `python3 tools/head-import/build-library.py --input-root /path/to/packs --reader /path/to/pes-fmdl` from the repository. The converter reads FPK/FMDL and FTEX directly, embeds portable eye geometry and standard PBR textures into each GLB, and generates `assets/heads/manifest.json` with per-file hashes and coverage. Shipped paths end in head.glb.gz; gzip is decoded locally before the standard glTF geometry is read. `--reuse` validates hashes and reuses already converted assets, without needing their raw source again. Raw archives are not needed at runtime.
4. Run `node tests/player-heads.cjs`, then the actual shared-actor browser pilot in `tests/browser-head-pilot.cjs`. `HEAD_IDS`, `PILOT_LIMIT` and `ARTIFACT_DIR` select the pilot. Visual review remains required; a successful file conversion is not proof of final likeness or seam quality.

Matching uses explicit source names/aliases, the current roster identity and date of birth. Ambiguous names are rejected. Do not pair a list of names with sorted numeric folders; recycled PES IDs and replacement players make that unsafe. In particular, goalkeeper Ederson (1993) must not match midfielder Éderson (1999). The Barcelona pack's replacement Hamza/Amr Warda line is deliberately skipped until independently verified. Mega-pack names without a verified source-ID/name mapping are skipped. The younger Fabinho (140624) is explicitly excluded from the 1993-born Fabinho (63607). Current club membership is never changed to match an old pack.

V243: 332 identity-matched real heads. The library matches current squads, verified player profiles, concept/archived squads and guest identities; it does not add or transfer players. Exact per-team availability is exposed at face-coverage.html. This is incomplete coverage, particularly for Trabzonspor. Unmatched players retain the existing face system. Source geometry/textures are real community models; portable eyes and the runtime neck fit are adaptations, not claimed scans. Collar/skin fit, 36 neck poses, fullbody readiness, seven production modes and software mobile-profile checks are covered by the V243 evidence. Physical phone GPU testing remains separate.

Free Standard Quaternius locomotion data is separately sampled by `tools/motion-import/convert-standard.cjs`. Those experimental arm tracks are not connected to gameplay or shipped as unused runtime data. No Mixamo import is claimed.

## V245 · selective FM27 RFH source

The library now contains879 heads (332 existing +547 selected missing identities).
Use `fm27-sources.json` for public source URLs, CSV and oldest→newest patch order;
`fm27-plan.json` records the reviewed game ID/DOB/name/club plan. Author CSV has
unique name/club evidence; DOB is bound from the existing game identity, not
invented as source data. Ambiguous or different-club matches remain deferred.
Batrakov is absent from this CSV; keep his own portrait until an accessible
identity-checked source passes conversion.

Reproduce outside the repository (requires Python numpy/Pillow, Node for tests):
```
python tools/head-import/import-fm27.py --stage /tmp/fm27-stage --csv /tmp/RealFaces-players.csv
python tools/head-import/import-fm27.py --stage /tmp/fm27-stage --csv /tmp/RealFaces-players.csv --install
python tools/head-import/test-rfh.py
node tests/head-coverage.cjs
node tests/head-body-fit.cjs
```
Download the current CSV from the public catalogue. If its name/club entries
changed, re-review the plan instead of bypassing the identity guard. Current
installed IDs are skipped; existing model paths are never overwritten. A PES
rebuild must use `--reuse` to preserve the RFH source family and fails on collision.
Range reader refuses full-download fallback and bounds its cache to8MB/read32MB;
ZipFile verifies member CRC. Only selected members are staged, never the full8.9GB.
RFH decompression is bounded, meshes/counts/indices/finiteness validated. Runtime
budget: model<2MB, triangles<35k, total new assets<=180MB. Over-budget sources are
reported/rejected; no silent resolution reduction. Dummy three-vertex hair shells
are omitted. No new face animation or FM skeleton is imported; existing football
animation and shared head/neck fit remain authoritative.

Source transform: undo META.shift, subtract PES origin[0,1.640058,.05433055], reverse
triangle winding, flip RFH UV.v for Three flipY=false. Bake portable eyes and set
hasEyes=true to prevent duplicates. Face1024/hair512 WebP, 16-bit positions/normals/
UV and deterministic gzip use the V243 packing path. No source archives/executable,
experimental simplifier or extra locomotion pack is shipped.
