'use strict';
// V219/V220 football tennis: house rules hold physically in every rally.
const A=require('node:assert/strict'),F=require('../assets/footvolley-engine.js'),R=require('../assets/club-rosters-v75.json');
const pl=id=>R.teams[id].team.players.filter(p=>!(p.roles||[]).includes('GK'));
const out={},kinds=new Set();
for(const n of[1,2,3])for(const seed of[1,2,3]){const points=[3,5,7][seed-1],setsToWin=seed===3?2:1,c=F.create({sides:[{players:pl('436')},{players:pl('432')}],perSide:n,points,setsToWin,seed});
 A.equal(c.court.netHeight,1.10);A.equal(c.court.length,n===3?18:12.8);
 for(const [a,b] of c.setLog)A.equal(Math.max(a,b),points,'first to '+points);
 A.equal(c.sets[c.winner],setsToWin);
 let team=-1,touches=0,who=new Set();for(const e of c.events){if(e.type==='serve'||e.type==='point'||e.type==='cross'){team=-1;touches=0;who=new Set();continue;}
  if(e.type==='touch'){kinds.add(e.kind);if(e.team!==team){team=e.team;touches=0;who=new Set();}touches++;A(touches<=(n===1?2:n),'touch limit n'+n);if(n>1){A(!who.has(e.actorIndex),'each player touches once (n'+n+')');who.add(e.actorIndex);}}}
 const again=F.create({sides:[{players:pl('436')},{players:pl('432')}],perSide:n,points,setsToWin,seed});A.deepEqual(again.setLog,c.setLog,'deterministic');
 out['n'+n+'s'+seed]=c.setLog.map(x=>x.join('-')).join(',')+' '+Math.round(c.duration)+'s';}
console.log(JSON.stringify({pass:true,sets:out,kinds:[...kinds]}));
