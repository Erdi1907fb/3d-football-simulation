/* Published scores are immutable. Realise each allocated outcome with the same
 * collision/integration kernel used by personal matches, without rewriting data.
 * This is a constrained replay solver, not an independent second prediction. */
(function(root,factory){
 if(typeof module==='object'&&module.exports)module.exports=factory(require('./football-ai.js'),require('./football-physics.js'));
 else root.SekmeForecastPhysics=factory(root.SekmeFootballAI,root.SekmeFootballPhysics);
})(typeof globalThis!=='undefined'?globalThis:this,function(AI,Physics){
 'use strict';
 const SHOT=3.8,IMPACT=4.5,DT=1/60,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function random(seed){let n=seed>>>0;return()=>{n+=0x6D2B79F5;let x=n;x=Math.imul(x^x>>>15,x|1);x^=x+Math.imul(x^x>>>7,x|61);return((x^x>>>14)>>>0)/4294967296;};}
 function intent(c){return c.lockedOutcome.result==='goal'?(c.followUpGoal?c.initialResult:'goal'):'nonGoal';}
 function matches(result,wanted){return wanted==='nonGoal'?result!=='goal':result===wanted;}
 function context(c,frames,at,foot){
  const players=at(frames,SHOT),shooter=players[c.team*11+(c.finisher??9)],keeper=players[(1-c.team)*11],profile=c.ai.profiles[shooter.id],gk=c.ai.profiles[keeper.id],start=['penalty','freeKick'].includes(c.pattern)?{x:c.pattern==='penalty'?41.5:31.5,z:c.pattern==='penalty'?0:5,y:.11}:foot(shooter,SHOT);
  if(['header','volley','halfVolley'].includes(c.finish)){start.x=shooter.x;start.z=shooter.z;start.y=c.finish==='header'?2.02:c.finish==='halfVolley'?.40:.8;}
  return{c,players,shooter,keeper,profile,gk,start,baseKeeper:at(frames,IMPACT)[keeper.id],defenders:at(frames,IMPACT).filter(p=>p.team!==c.team&&!p.keeper&&!c.dismissed?.includes(p.id))};
 }
 function keeperFor(ctx,target,power,error){
  if(ctx.fixedKeeper)return{...ctx.keeper,shift:0,travel:0};
  const {start,keeper,gk,baseKeeper}=ctx,travel=Math.max(0,(49.7-start.x)/power-gk.reaction),shift=clamp(AI.keeperRead(ctx.c,target,error)-keeper.z,-travel*4.7,travel*4.7),fraction=clamp((.7-gk.reaction)/Math.max(.2,travel+.1),0,1);
  return{...baseKeeper,z:keeper.z+shift*fraction*fraction*(3-2*fraction),shift,travel};
 }
 function solve(ctx,wanted,seed,preferred){
  const rng=random(seed),errors=[(rng()-.5)*.8,(rng()-.5)*.8],trials=[],side=rng()<.5?-1:1,base=21+ctx.profile.strength*7;
  if(preferred)trials.push({z:preferred,y:ctx.c.finish==='curl'?1.7:.65,power:base,spin:ctx.c.finish==='curl'?side*8:0});
  // Keep non-goal outcomes varied; never silently let a new rebound add a goal.
  for(let i=0;i<10;i++)trials.push({z:(rng()-.5)*12,y:.2+rng()*2.8,power:base+(rng()-.5)*5,spin:ctx.c.finish==='curl'?side*8:0});
  const zs=wanted==='post'?[3.66,3.85,4.02,4.18,4.35]:wanted==='save'?[0,.5,1.1,1.7]:[3.05,2.45,1.65,.7];
  for(const height of[2.18,1.65,.75,.28])for(const z of zs)for(const sign of[side,-side])trials.push({z:z*sign,y:height,power:base+(height>2?1:0),spin:0});
  // A 21 m free kick needs a slower, higher launch to clear a real wall.
  // Search different launch speeds with the ordinary gravity/collision kernel;
  // the allocated score never changes the wall or the ball's collision radius.
  if(ctx.c.pattern==='freeKick')for(const power of[20,18,17,22])for(const height of[2.12,1.65,.75])for(const z of[3.05,2.45,1.65])for(const sign of[side,-side])trials.push({z:z*sign,y:height,power,spin:0});
  let attempts=0;
  for(const trial of trials){const target={z:trial.z,y:trial.y},keeper=keeperFor(ctx,target,trial.power,errors[0]),args={start:ctx.start,target,power:trial.power,spin:trial.spin,keeper,defenders:ctx.defenders,reaction:ctx.gk.reaction,reach:.95+(ctx.gk.keeping||.76),finish:ctx.c.finish,oneOnOne:ctx.c.oneOnOne};attempts++;
   if(!matches(Physics.shot({...args,probe:true}).result,wanted))continue;
   return{physical:Physics.shot(args),keeper,attempts,args};
  }
  return{attempts};
 }
 function moveStrike(frames,id,dz){
  const slot=id*7;
  for(let i=0;i<frames.length;i++){const t=i*DT,q=clamp((t-(SHOT-1.25))/1.25,0,1),blend=q*q*(3-2*q);frames[i][slot+1]+=dz*blend;}
  for(let i=0;i<frames.length;i++){const prev=frames[Math.max(0,i-1)],next=frames[Math.min(frames.length-1,i+1)],den=i===0||i===frames.length-1?DT:DT*2;frames[i][slot+3]=(next[slot+1]-prev[slot+1])/den;frames[i][slot+6]=Math.hypot(frames[i][slot+2],frames[i][slot+3]);}
 }
 function applyKeeper(ctx,frames,chosen){
  for(let i=Math.ceil(SHOT/DT);i<frames.length;i++){const t=i*DT,slot=ctx.keeper.id*7,q=clamp((t-SHOT-ctx.gk.reaction)/Math.max(.2,chosen.travel+.1),0,1),previous=frames[Math.max(0,i-1)];frames[i][slot+1]=ctx.keeper.z+chosen.shift*q*q*(3-2*q);frames[i][slot+3]=(frames[i][slot+1]-previous[slot+1])/DT;frames[i][slot+6]=Math.hypot(frames[i][slot+2],frames[i][slot+3]);frames[i][slot+5]=previous[slot+5]+frames[i][slot+6]*DT;}
 }
 function resolve(c,frames,at,foot){
  const wanted=intent(c),original=c.target,seed=c.ai.seed^0x3849;let ctx=context(c,frames,at,foot),chosen=solve(ctx,wanted,seed,original),attempts=chosen.attempts;
  // If a defender completely blocks the original corridor, take an actual
  // lateral setup touch over 1.25 s. The ball still leaves the rendered foot.
  if(!chosen.physical&&!['penalty','freeKick'].includes(c.pattern)){
   const base=frames.map(f=>f.slice());
   for(const dz of[1.2,-1.2,2.3,-2.3]){frames.forEach((f,i)=>f.set(base[i]));moveStrike(frames,ctx.shooter.id,dz);ctx=context(c,frames,at,foot);if(ctx.players.some(p=>p.id!==ctx.shooter.id&&!c.dismissed?.includes(p.id)&&Math.hypot(p.x-ctx.shooter.x,p.z-ctx.shooter.z)<.68))continue;chosen=solve(ctx,wanted,seed,original);attempts+=chosen.attempts;if(chosen.physical)break;}
   if(!chosen.physical)frames.forEach((f,i)=>f.set(base[i]));
  }
  if(!chosen.physical){const error=Error('No physical forecast shot: '+wanted+' / '+c.pattern+' / '+c.minute);error.code='forecast-physics';throw error;}
  applyKeeper(ctx,frames,chosen.keeper);const physical=chosen.physical;c.physicalShot=physical;c.blocked=physical.result==='block';c.physicsMode='forecast-locked';c.physicsSearch={attempts,conditionedOnPublishedScore:true};c.target=physical.contact?.z??original;
  if(c.lockedOutcome.result!=='goal')c.result=c.blocked?'save':physical.result;
  if(c.followUpGoal)c.initialResult=physical.result;
  c.retain=!c.followUpGoal&&physical.result==='save'&&Math.abs(c.target-chosen.keeper.z)<.7;c.saveStyle=c.retain?'smother':'fullStretch';AI.saveDescription(c,physical,chosen.keeper);c.xg=AI.xg({start:ctx.start,shooter:ctx.profile,keeper:ctx.keeper,defenders:ctx.defenders,type:c.finish,penalty:c.pattern==='penalty'});c.replay=c.result==='goal'&&c.review!=='disallowed';return physical;
 }
 function rebound(c,start,players,actor){
  const keeper=players[(1-c.team)*11],ctx={c,start,players,fixedKeeper:true,shooter:players[actor],keeper,baseKeeper:keeper,profile:c.ai.profiles[actor],gk:c.ai.profiles[keeper.id],defenders:players.filter(p=>p.team!==c.team&&!p.keeper&&!c.dismissed?.includes(p.id))},wanted=c.lockedOutcome.result==='goal'?'goal':'nonGoal';
  const chosen=solve(ctx,wanted,c.ai.seed^0x384a,c.followUpTarget);
  if(!chosen.physical){const e=Error('No physical forecast rebound at '+c.minute);e.code='forecast-physics';throw e;}
  c.physicsSearch.reboundAttempts=chosen.attempts;return{physical:chosen.physical,xg:AI.xg({start,shooter:ctx.profile,keeper,defenders:ctx.defenders})};
 }
 return{resolve,rebound,version:'forecast-physics-v1'};
});
