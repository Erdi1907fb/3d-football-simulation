'use strict';
const A=require('node:assert/strict'),I=require('../assets/football-intelligence'),AI=require('../assets/football-ai'),E=require('../assets/competition-engine'),M=require('../assets/match'),R=require('../assets/club-rosters-v75.json');
const goal={x:52.5,z:0,width:7.32},p={id:9,x:38,z:0},keeper={id:11,keeper:true,x:50.2,z:0};
A(I.finishingOpportunity(p,goal,[keeper,{id:12,x:36.8,z:0}]).clear,'a trailing defender does not prevent a clear 14.5m shot');
A(!I.finishingOpportunity(p,goal,[keeper,{id:12,x:39,z:0}]).clear,'facing pressure still blocks a clear shot');
A(!I.finishingOpportunity({...p,x:30},goal,[keeper]).clear,'not every distant possession is a clear finish');
A(I.finishingOpportunity({...p,x:49},goal,[]).clear,'empty six-yard finish');
const frames=Array.from({length:367},()=>new Float32Array(22*7));for(const f of frames){f[9*7]=48;f[11*7]=49;}
const c={team:0,finisher:9,pattern:'through',ai:{seed:1}};AI.prepareFinish(c,frames,()=>Array.from({length:22},(_,id)=>({id,team:Math.floor(id/11),keeper:id%11===0,x:id===9?48:id===11?49:20,z:id===9||id===11?0:20})));
A.equal(c.keeperRush,0,'keeper cannot rush through an attacker');
// Reproduce the essential failure: attacker 2.5m out, keeper behind him,
// published non-goal. The replay solver must reject an invented wide/high miss.
const FP=require('../assets/forecast-physics'),ps=Array.from({length:22},(_,id)=>({id,team:Math.floor(id/11),keeper:id%11===0,x:id===9?50:id===11?46:20,z:id===9||id===11?0:20})),close={lockedOutcome:{result:'wide'},team:0,finisher:9,pattern:'through',finish:'placed',target:5,ai:{seed:1,profiles:ps.map(p=>({...AI.defaults[p.keeper?'GK':'ST'],reaction:.2}))}};
try{FP.resolve(close,Array.from({length:367},()=>new Float32Array(154)),()=>ps,p=>({x:p.x,y:.11,z:p.z}));A(['save','block','post'].includes(close.physicalShot.result),'no manufactured empty-net miss');}catch(e){A.equal(e.code,'forecast-physics','only the normal choreography recovery is permitted');}
const entries=['432','362'].map(id=>E.entry(R,id));let quick=0,shots=0;
for(const seed of [1,2,7]){const options={...E.analysePair(...entries,seed),presentationRevision:107,mode:'official'},m=M.create(seed,options);A.deepEqual(m.sample(m.duration).score,options.targetScore);
 for(const ch of m.chances){if(ch.physicalShot)shots++;if(!ch.quickRelease)continue;quick++;const q=ch.quickRelease;
 A(m.toVideoTime(ch.start+M.SHOT)-m.toVideoTime(ch.start+q.readyAt)<.4,'clear chance releases within a short preparation');
 const before=ch.frames[Math.floor(q.from*60)],after=ch.frames[Math.ceil(q.to*60)-1];for(let j=0;j<22;j++){A.equal(after[j*7],before[j*7],'held x');A.equal(after[j*7+1],before[j*7+1],'held z');}
 const edge=m.toVideoTime(ch.start+q.from),a=m.sample(m.fromVideoTime(edge-1e-6)),b=m.sample(m.fromVideoTime(edge+1e-6));A(Math.hypot(a.ball.x-b.ball.x,a.ball.y-b.ball.y,a.ball.z-b.ball.z)<.2,'no ball jump across early release');for(let j=0;j<a.players.length;j++)A(Math.hypot(a.players[j].x-b.players[j].x,a.players[j].z-b.players[j].z)<.2,'no visible skip/teleport across source interval');
 }
}
A(quick>0,'actual Galatasaray / Aston Villa fixture uses early finishing');A(shots>0);console.log(JSON.stringify({pass:true,fixtures:3,quick,shots,coverage:'clear chance readiness, facing/trailing defence, keeper goal-side cap, short visible release and continuous actor positions, published score preserved'}));
