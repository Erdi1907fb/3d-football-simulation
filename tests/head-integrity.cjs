// V253: every enabled real head must have a visible face. A source that shipped only the alpha-tested head shell as
// skin rendered with holes (Ronaldo before V253); an eyes-only file rendered floating eyeballs (Miretti).
'use strict';
const fs=require('fs'),zlib=require('zlib'),A=require('assert/strict'),path=require('path'),root=path.resolve(__dirname,'..');
const m=JSON.parse(fs.readFileSync(path.join(root,'assets/heads/manifest.json'),'utf8'));
// Reviewed close-ups: alpha-tested skin whose texture alpha is opaque over the face (no holes).
const REVIEWED_MASK_SKIN=new Set(['171610','142460']);
const H=require(path.join(root,'assets/player-heads.js'));
let enabled=0,disabled=0,repaired=0;
for(const e of m.players){
 if(e.disabledReason){disabled++;A.equal(H.find(m,{id:e.ids[0],name:e.name,dateOfBirth:e.dateOfBirth}),null,'disabled head must not be served: '+e.name);continue;}
 enabled++;const b=zlib.gunzipSync(fs.readFileSync(path.join(root,e.path))),n=b.readUInt32LE(12),g=JSON.parse(b.subarray(20,20+n));
 A.ok((g.extras?.triangles||0)>=4000,'head geometry present: '+e.name);
 const skin=g.materials.filter(x=>x.extras?.next90Skin||x.name==='face'||x.name==='fox_skin_mat');
 A.ok(skin.length,'skin material present: '+e.name);
 A.ok(skin.some(x=>x.alphaMode!=='MASK')||REVIEWED_MASK_SKIN.has(e.sourceId),'opaque face skin (no shell-only alpha holes): '+e.name+' '+e.sourceId);
 if(g.extras?.repair)repaired++;
}
A.ok(disabled<=10,'disabled heads stay an explicit short list');
console.log(JSON.stringify({pass:true,enabled,disabled,repaired}));
