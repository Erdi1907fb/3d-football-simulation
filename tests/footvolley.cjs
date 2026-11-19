'use strict';
// V219 football tennis (futnet): rules hold physically in every rally.
const A=require('node:assert/strict'),F=require('../assets/footvolley-engine.js'),R=require('../assets/club-rosters-v75.json');
const pl=id=>R.teams[id].team.players.filter(p=>!(p.roles||[]).includes('GK'));
const out={};
for(const n of[1,2,3])for(const seed of[1,2,3]){const c=F.create({sides:[{players:pl('436')},{players:pl('432')}],perSide:n,points:7,seed});
 A.equal(c.court.netHeight,1.10);A.equal(c.court.length,n===3?18:12.8);A.equal(c.court.width,9);
 for(const [a,b] of c.setLog){const w=Math.max(a,b),l=Math.min(a,b);A((w>=7&&w-l>=2)||w===15,'set score '+a+'-'+b);}
 A(c.winner===0||c.winner===1);
 let team=-1,touches=0,lastActor=-1;for(const e of c.events){if(e.type==='serve'||e.type==='point'||e.type==='cross'){team=-1;touches=0;lastActor=-1;continue;}
  if(e.type==='touch'){if(e.team!==team){team=e.team;touches=0;lastActor=-1;}touches++;A(touches<=(n===1?2:3),'touch limit n'+n+' seed'+seed);if(n>1)A.notEqual(e.actorIndex,lastActor,'no player touches twice in a row');lastActor=e.actorIndex;}}
 const again=F.create({sides:[{players:pl('436')},{players:pl('432')}],perSide:n,points:7,seed});A.deepEqual(again.setLog,c.setLog,'deterministic');
 out['n'+n+'s'+seed]=c.setLog.map(x=>x.join('-')).join(',');}
console.log(JSON.stringify({pass:true,sets:out}));
