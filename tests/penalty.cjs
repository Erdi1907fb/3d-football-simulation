// V109 penalty techniques: labels, speed range, outside-foot curve and continuity.
const assert=require('node:assert/strict'),path=require('path'),root=path.resolve(__dirname,'..'),E=require(root+'/assets/penalty-engine.js');
const reg=Object.values(require(root+'/assets/club-rosters-v75.json').teams);const tech={},speeds=[];let kicks=0,outside=0,maxStep=0;
for(let seed=1;seed<=400;seed++){const c=E.create({seed,mode:'team',format:seed%2?'official':'complete-five-each',lineups:[reg[seed%reg.length].team,reg[(seed+9)%reg.length].team]});
 for(const k of c.kicks){kicks++;tech[k.technique]=(tech[k.technique]||0)+1;speeds.push(k.speedKmh);assert(k.speedKmh>=40&&k.speedKmh<=140,'speed '+k.speedKmh);if(k.technique==='outside-foot'){outside++;assert(Math.sign(k.swerve)===(k.foot==='left'?-1:1)||k.swerve===0,'outside foot curls away');}}
 let prev=null;for(let t=0;t<c.duration;t+=1/60){const f=c.sample(t);if(prev&&prev.kick===f.kick)maxStep=Math.max(maxStep,Math.hypot(f.ball.x-prev.ball.x,f.ball.y-prev.ball.y,f.ball.z-prev.ball.z));prev=f;}}
assert(Object.keys(tech).length>=9,'nine techniques incl. outside-foot');assert(outside>0);assert(maxStep<.6);speeds.sort((a,b)=>a-b);
console.log(JSON.stringify({PASS:true,series:400,kicks,techniques:tech,speedKmh:{min:speeds[0],median:speeds[speeds.length>>1],max:speeds.at(-1)},maxStep60fps:+maxStep.toFixed(3)}));
