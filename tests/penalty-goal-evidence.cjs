'use strict';
const assert=require('node:assert/strict'),P=require('../assets/penalty-engine'),reg=Object.values(require('../assets/club-rosters-v75.json').teams);
const old=process.env.NEXT90_PENALTY_BASELINE?require(process.env.NEXT90_PENALTY_BASELINE):null;
let kicks=0,goals=0,oldContradictions=0;const outcomes={};
function crossing(c,k,index){const end=Math.min(k.resolvedAt+2,c.kicks[index+1]?.start??c.duration);let prior=c.sample(k.start+k.contact).ball;for(let t=k.start+k.contact+1/240;t<=end;t+=1/240){const ball=c.sample(t).ball;const cross=P.goalCrossing(prior,ball);if(cross)return cross.goal;prior=ball;}return false;}
assert(P.goalCrossing({x:52.5,y:1,z:3.4},{x:52.7,y:1,z:3.6}).goal,'interpolate the crossing rather than classify a later endpoint');assert.equal(P.goalCrossing({x:52.7,y:1,z:0},{x:52.4,y:1,z:0}),null,'backward crossing is not a goal');assert.equal(P.goalCrossing({x:52.5,y:2.5,z:0},{x:52.7,y:2.5,z:0}).goal,false,'above-bar crossing is not a goal');
for(let seed=1;seed<=100;seed++){
 const options={seed,lineups:[reg[seed%reg.length].team,reg[(seed+9)%reg.length].team],mode:seed%2?'team':'duel',naturalDecisions:true},c=P.create(options);
 for(let i=0;i<c.kicks.length;i++){const k=c.kicks[i],cross=crossing(c,k,i);kicks++;outcomes[k.outcome]=(outcomes[k.outcome]||0)+1;assert.equal(cross,k.outcome==='goal',`goal/flight disagreement seed=${seed},kick=${i},outcome=${k.outcome}`);if(cross)goals++;}
 if(old){const b=old.create(options);for(let i=0;i<b.kicks.length;i++)if(crossing(b,b.kicks[i],i)!==(b.kicks[i].outcome==='goal'))oldContradictions++;}
}
assert(goals>0);if(old)assert(oldContradictions>0,'baseline reproduces visible goals incorrectly labelled non-goals');
console.log(JSON.stringify({pass:true,series:100,kicks,goals,outcomes,oldContradictions,coverage:'whole-ball swept goal-plane crossing agrees with outcome through physical flight and two-second tail; no desired-result resampling'}));
