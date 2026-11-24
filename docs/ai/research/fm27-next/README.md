# T-400 — FM27 Real 3D Faces preparation (not integrated)

User order: T-399 general temporal image quality across every mode FIRST; then add missing heads. Aylık / Headers and Volleys explicitly paused (T-401). Do not describe the following investigation as shipped faces.

Source: author melrosehlf release https://sortitoutsi.net/content/78621/fm27-real-3d-faces-v10-11164-3d-player-heads-in-match
CSV: https://www.mediafire.com/file/v2y98q28lzgele4/RealFaces-players.csv/file
11,634 rows (11,475 players +159 managers),448,917bytes; columns UID;Name;Club. Downloaded CSV has Yunus Akgün70110533, no Batrakov/Batrak spelling. Names alone are candidate discovery, not proof of identity/DOB. Never assign another footballer's head. Priority missing-name candidates: GS7/11, FB4/8, TS13/22, Liverpool9/9, United8/8; counts are candidates, not successful conversion/verified identities.

Public archives (not added to repository):
- https://www.mediafire.com/file/gzs58ktjbuqcazc/RealFaces-v1.0-Faces-Part1of4.zip/file
- https://www.mediafire.com/file/1hzlg25gbxbt8hs/RealFaces-v1.0-Faces-Part2of4.zip/file
- https://www.mediafire.com/file/kwzqxmenbbx7vhi/RealFaces-v1.0-Faces-Part3of4.zip/file
- https://www.mediafire.com/file/ligqnigls8cfm1a/RealFaces-v1.0-Faces-Part4of4.zip/file
- Plugin info only: https://www.mediafire.com/file/bmqb09cyhk35pwz/RealFaces-v2.0-Plugin-only.zip/file

**Important discovery:** Ordinary public download links honor HTTP byte ranges (206). Python ZipFile on a seekable HTTP Range reader can fetch the ZIP central directory and selected UID.rfh members WITHOUT downloading8.9GB. Four indexes together used~1.28MB. If Range is ignored (200), refuse the full download. CRC verified by ZipFile.read. Keep indexes/raw RFHs/source archives outside runtime/repo. No FM installation or plugin execution is needed for conversion.

Scratch only (may disappear): /tmp/fm27-source/{part1-index.json,...,part4-index.json,37024025.rfh}; /tmp/fm27-range.py range reader; /tmp/fm27-one.py member extraction. Scripts not yet promoted to reproducible repository tools. Recreate public download URL from the downloadButton anchor on each ordinary MediaFire page, not a hardcoded signed URL.

## RFH format verified on one public sample

Virgil van Dijk: FMUID37024025, source PES44840 (in META.source), sample SHA25692191e555268401bd3f2d7db0de9f57b880a02fa7b5fc82a37a5cb666fb90269.965,024bytes; fetched~1.28MB total including ZIP index; no full archive stored.

- Magic ASCII RFH1; uint32LE version1; uint32LE sectionCount. Each section:4ASCII tag +uint32LE payloadLength +payload.
- FMSH face mesh, HMSH hair mesh: zlib compressed. Uncompressed:uint32LE vertexCount,indexCount; positions float32LE[v,3];UV float32LE[v,2];normals int16LE[v,3]/32767;boneIndices uint8[v,4];boneWeights uint8[v,4]/255;triangle indices uint32LE[indexCount]. Validate lengths/bounds/finiteness/count budgets before use.
- FTEX face image (sample JPEG1024²); HCOL hair RGB (JPEG1024²), HALP hair alpha (PNG grayscale1024²). Combine RGB+alpha before WebP conversion; no source normal map in this RFH.
- META JSON contains original PES ID in source path, pesTop/pesEyeY/pesEyeZ, shift[x,y,z], neckCut, face/hair bounds and FM skin-transfer diagnostics.
- Sample geometry positions are already shifted for FM. Inverse META.shift returns native PES coordinates; then subtract the known PES head origin (current converter uses1.640058m unless actual bone origin exists). Example source nose.z .196107 +shift.z -.053024112 =RFH maxZ .143082888. Do not blindly use RFH's FM transform as our head-local positions.
- Current plugin flips triangle winding for Unity. Our original converter also reverses original PES triangles for Three. Verify winding and UV orientation visually, not by guessing.
- RFH uses FM eyes/skeleton. Portable eye positions/whites/iris and collar fit MUST be tested before batch import. META eye Y/Z helps; original eyelid aperture/weights need inspection. Do not mark converted merely because triangles parse.
- Follow existing pack-glb.py quantisation/WebP/gzip pipeline, source credits, exact identity guards and head-fit.js. Prefer original PES ID under existing assets/heads/pes to avoid duplicate models/parallel runtime; do not overwrite an existing good real head merely to grow counts.

Potential Batrakov source listing: https://pes-files.com/pes-2021-aleksey-batrakov-face/ (Valerchi7). Page fetch403 in web tool; earlier separate Sharemods source hit CAPTCHA. No model acquired/converted; no bypass. Seek another ordinary public free source or retain his own verified photograph.

Pilot refinement: canonical PES origin is [0,1.640058,.05433055], including Z; flip RFH UV.v before Three texture.flipY=false. Set extras.hasEyes=true when baking portable eyes; otherwise runtime adds a second unshifted pair. Corrected VanDijk369KB pilot is /tmp/fm27-pilot-flip, browser /tmp/fm27-pilot-fixed-ui; no runtime model installed yet.
