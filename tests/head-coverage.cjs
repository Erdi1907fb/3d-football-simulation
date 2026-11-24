'use strict';
const A=require('node:assert/strict'),Coverage=require('../assets/head-coverage'),Heads=require('../assets/player-heads'),registry=require('../assets/club-rosters-v75.json'),manifest=require('../assets/heads/manifest.json'),photos=require('../assets/faces/player-portraits.json'),data=Coverage.build(registry,manifest,photos);
A.equal(data.rows.length,Object.keys(registry.teams).length);A.equal(data.models,manifest.players.length);for(const r of data.rows){A.equal(r.total,r.real+r.photo+r.generic);for(const p of r.players)if(p.kind==='real')A(p.sourceId);}
for(const id of['432','436','1895','359','382','363','364','360','86','83']){const row=data.rows.find(r=>r.id===id);A(row?.real>0);A.equal(row.generic,0,'priority club keeps real models or its own verified portrait for every squad player');}
const e=manifest.players.find(p=>p.sourceId==='46815');for(let side=0;side<6;side++)A.equal(Heads.find(manifest,{id:'studio-436-side'+side+'-'+e.ids[0],name:e.name,dateOfBirth:e.dateOfBirth}),e);
A.equal(Heads.find(manifest,{id:e.ids[0],name:'Éderson',dateOfBirth:'1999-07-07'}),null,'different Ederson is never substituted');
A(manifest.players.some(p=>p.sourceId==='63607'&&p.dateOfBirth==='1993-10-23'));A(!manifest.players.some(p=>p.sourceId==='140624'),'different young Fabinho is not substituted');
console.log(JSON.stringify({pass:true,teams:data.rows.length,models:data.models,prioritySquadCoverage:true,allSixSides:true}));
