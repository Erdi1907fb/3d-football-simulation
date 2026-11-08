// Builds assets/vendor/three-postfx.js (UMD) from the official three.js r160 example
// modules (MIT): EffectComposer, RenderPass, ShaderPass, UnrealBloomPass, OutputPass, SMAAPass.
//   npm pack three@0.160.0 && tar xzf three-0.160.0.tgz
//   node tools/build-postfx.cjs path/to/package
const fs=require('fs'),path=require('path');const pkg=process.argv[2];if(!pkg)throw Error('usage: node tools/build-postfx.cjs <three package dir>');
const order=['postprocessing/Pass','shaders/CopyShader','postprocessing/ShaderPass','postprocessing/MaskPass','postprocessing/EffectComposer','postprocessing/RenderPass','shaders/LuminosityHighPassShader','postprocessing/UnrealBloomPass','shaders/OutputShader','postprocessing/OutputPass','shaders/SMAAShader','postprocessing/SMAAPass'];
let out=`/* three.js r160 post-processing examples (MIT, (c) 2010-2023 three.js authors, see THREE-LICENSE.txt),
 * repackaged for the global THREE build by tools/build-postfx.cjs. Exposes THREE.PostFX. */
(function(root){'use strict';const THREE=root.THREE||(typeof require==='function'?require('./three.min.js'):null);if(!THREE)return;const P={};\n`;
for(const m of order){let src=fs.readFileSync(path.join(pkg,'examples/jsm',m+'.js'),'utf8');const names=[];
 src=src.replace(/import\s*\{([\s\S]*?)\}\s*from\s*'three';/g,(_,list)=>`const {${list}}=THREE;`);
 src=src.replace(/import\s*\{([\s\S]*?)\}\s*from\s*'\.{1,2}\/[^']+';/g,(_,list)=>`const {${list}}=P;`);
 src=src.replace(/export\s*\{([\s\S]*?)\};?/g,(_,list)=>{for(const n of list.split(',').map(x=>x.trim()).filter(Boolean))names.push(n.split(/\s+as\s+/).pop());return '';});
 src=src.replace(/export\s+(class|const|function|let)\s+([A-Za-z0-9_]+)/g,(_,k,n)=>{names.push(n);return `${k} ${n}`;});
 out+=`// ---- ${m}.js\n(function(){\n${src}\n${names.map(n=>`P.${n}=${n};`).join('')}\n})();\n`;}
out+=`THREE.PostFX=P;if(typeof module==='object'&&module.exports)module.exports=P;})(typeof globalThis!=='undefined'?globalThis:this);\n`;
fs.writeFileSync(path.resolve(__dirname,'../assets/vendor/three-postfx.js'),out);console.log('three-postfx.js',out.length,'bytes');
