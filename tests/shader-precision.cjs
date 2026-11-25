'use strict';
// V247: pitch paint and turf noise must not hash with fract(sin(large)) — sin() of arguments in the millions (world
// coordinates x 90..260 x 127) is evaluated with GPU-dependent precision, so lines/turf grain could crawl or flicker
// on some graphics cards even though the software renderer looks stable.
const A=require('node:assert/strict'),fs=require('fs');
for(const f of['assets/scene.js','assets/pitch-detail.js']){const s=fs.readFileSync(f,'utf8');A(!/fract\(sin\(/.test(s),f+': sine hash in a pitch shader');}
const s=fs.readFileSync('assets/scene.js','utf8'),m=s.match(/function pitchStroke[\s\S]*?y=([\d.]+)/);A(m&&Number(m[1])>=.05,'paint sits above the tallest close-up grass blade (4.6 cm)');
const p=fs.readFileSync('assets/pitch-detail.js','utf8');A(/0\.022\+0\.024\*fract/.test(p),'blade height range unchanged (max 4.6 cm)');
/* V248: lines keep at least ~1.7 px on screen (sub-pixel touchlines broke up into crawling dashes), opacity scaled to keep coverage, per-pixel edge AA */
A(/attribute vec3 lat/.test(s)&&/0\.85\/max\(px/.test(s)&&/vCover/.test(s)&&/fwidth\(vAcross\)/.test(s),'screen-space minimum line width');
console.log(JSON.stringify({pass:true,files:2,paintHeight:Number(m[1]),minWidthPx:1.7}));
