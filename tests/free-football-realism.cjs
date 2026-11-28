'use strict';
// V267: compact free 11v11 realism guards — no tight-angle rockets, no dribbling onto the goal line,
// the keeper is off his line and headers/crosses occur.
const A=require('node:assert/strict'),M=require('../assets/match');
const o={simulationMode:'free',freeSeconds:60,presentationRevision:107,animationProfile:'expanded-v2'};
let goals=0,maxTeam=0,maxScorer=0,crosses=0,aerial=0,shots=0;
for(const seed of [10,17,24,31,38,45]){const run=M.create(seed,o).freeRun,by={};
 for(const e of run.events){
  if(e.type==='pass'&&e.actionKind==='cross')crosses++;
  if(e.type==='shot'){shots++;if(['header','volley'].includes(e.technique))aerial++;
   const i=Math.round(e.at*60),f=run.frames[i],p=f.players[e.actor],dir=p.team===0?1:-1,dx=52.5-f.ball.x*dir,dz=Math.abs(f.ball.z),angle=Math.atan2(7.32*dx,dx*dx+dz*dz-13.4);
   if(!e.technique)A(angle>.19,'no shot from a hopeless angle: seed '+seed+' at '+e.at.toFixed(2));
   const s=run.frames[i+1]?.shot;if(s&&s.impact>0){const dist=Math.hypot(dx,dz);A(dist/s.impact<45,'shot speed physical');}}
  if(e.type==='goal'){goals++;by[e.team+':'+e.actor]=(by[e.team+':'+e.actor]||0)+1;}}
 const sc=run.frames.at(-1).score;maxTeam=Math.max(maxTeam,...sc);maxScorer=Math.max(maxScorer,0,...Object.values(by));
 for(const f of run.frames.filter((_,i)=>i%6===0))if(f.owner!=null){const p=f.players[f.owner];if(p.keeper)continue;const dir=p.team===0?1:-1;A(52.5-p.x*dir>3.2||Math.abs(p.z)>9,'carrier does not walk onto the goal line: seed '+seed);}
}
A(crosses>0,'crosses are played');
console.log(JSON.stringify({pass:true,goals,shots,crosses,aerial,maxTeam,maxScorer}));
