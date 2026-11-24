# T-399 / V244 temporal image quality — work in progress

This addresses full-image instability during moving/orbiting cameras, not just player/jersey LOD. User confirmed the defect also exists in downloaded normal11v11 videos; do not blame social-media recompression or declare a constant1080p buffer sufficient proof.

Implemented, awaiting full-suite/production-mode completion:
- Scene.finalizeView recomputes view-dependent crowd/labels and boot/face detail when the final camera differs after Scene.update. All world.render callers share it; bowling's direct renderer explicitly invokes it. Repeated unchanged lenses reuse the work. Partial export tiles use the whole-frame camera/LOD, preventing seams and tile-relative labels. No physics/seed/roster changes.
- Procedural grass noise is weighted by its screen-space frequency (fwidth) per band. Keep resolvable detail, remove unresolved pixel shimmer. Removed the view-dependent ±20% mowing brightness term; emerald-v239 palette and physical textures remain.
- Crowd stripe patterns use integrated pixel filtering; fan culling tests a body sphere instead of only its center. Desktop uses supported MSAA up to4x only for the scene target; post ping-pong targets remain single-sample. Owned bloom/DOF/SMAA/grade passes are explicitly disposed with their buffers (Composer.dispose alone never did this); restrained sharpening .18 (was.42). Existing mobile/lite allocation bounds retained, edge AA folded into existing grade pass without new buffers.
-1080p60 encoder budget desktop24Mbps/mobile20Mbps (was18/16); native keyframes every1s plus actual cuts. Camera-stabilizer cache now includes camera mode, preventing reuse of the previous lens path when switching views. No resolution/FPS decrease; audio/score/timeline remain. Output file sizes can grow~33%desktop/~25%mobile. iOS encoder memory blocks remain2s. MessageChannel refs now keep pending Node test work alive while still releasing idle handles (an old test could exit silently).

## Evidence so far

browser-temporal-surface.cjs compares released f0231ac shader chain vs candidate using the same world-anchored turf and8subpixel camera pan frames at540×960, then actual1080×1920 PNGs. Bilinear reprojection residual3.95376→.419659 (~89.4%lower), mean luma44.28→44.99. This is a controlled surface fixture, NOT a claim of89%improvement in every full match. surface-report.json has raw numbers; baseline.png/candidate.png are actual renderer output.

Node temporal-quality.cjs PASS: final-camera synchronization, unchanged-view cache, physics immutability, tiled export whole-view selection, supported desktop4x MSAA, lite0x/no extra passes and mobile AA uniforms. ios-encoder/audio-export/pitch-colour/graphics/player-heads targeted checks PASS. Full77-suite and8production-mode browser run still in progress at this checkpoint; do not report all passed yet. Mobile-profile browser run checks software Chromium/iPhone UA, not physical Safari.
