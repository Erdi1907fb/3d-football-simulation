/* Shared, deterministic football decisions in metres/seconds (X/Z ground).
 * League-Soccer reference: AIfunctions.cpp passing corridors/arrival time and
 * goalie_default.cpp interception. Original JS adaptation; see research/V172.
 * This module reads observations, never a requested goal/save or future score.
 * Ball integration, contact and the rules remain in the existing engines.
 * Reference copyright 2019 Google LLC & Bastiaan Konings (Apache-2.0);
 * license: assets/vendor/league-soccer/LICENSE. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.Next90Intelligence=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),gap=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
 const live=p=>p&&!p.dismissed&&p.active!==false;
 const key=p=>p.id??p.actorIndex??`${p.team}:${p.role}`;
 function arrival(player,target,{speed=player.pace??6,acceleration=player.acceleration??6,reaction=.12,reach=.4}={}){
  const dx=target.x-player.x,dz=target.z-player.z,d=Math.max(0,Math.hypot(dx,dz)-reach);
  if(d===0)return 0;
  speed=Math.max(.1,speed);acceleration=Math.max(.1,acceleration);
  const n=Math.hypot(dx,dz)||1,vx=player.vx||0,vz=player.vz||0,along=clamp((vx*dx+vz*dz)/n,-speed,speed),cross=Math.abs(vx*dz-vz*dx)/n;
  // Turning and braking cost time: the nearest actor need not arrive first.
  const turn=cross/(acceleration*2)+Math.max(0,-along)/acceleration,
   v=Math.max(0,along),ramp=(speed-v)/acceleration,rampDistance=v*ramp+.5*acceleration*ramp*ramp;
  return reaction+turn+(d<=rampDistance?(Math.sqrt(v*v+2*acceleration*d)-v)/acceleration:ramp+(d-rampDistance)/speed);
 }
 function passWindow(from,to,opponents,{speed=15,receiver=null,profiles=[]}={}){
  const distance=gap(from,to);if(distance<.05)return{risk:1,safety:0,flight:0,margin:-Infinity};
  const flight=distance/Math.max(1,speed);let risk=0,margin=Infinity,interceptor=null;
  for(const o of opponents){if(!live(o))continue;const profile=profiles[o.id]||{},ox=o.x+(o.vx||0)*.08,oz=o.z+(o.vz||0)*.08;
   const u=clamp(((ox-from.x)*(to.x-from.x)+(oz-from.z)*(to.z-from.z))/(distance*distance),.1,1);
   // Closest point plus the receiving point cover both lane and receiver races.
   for(const q of[u,1]){const point={x:from.x+(to.x-from.x)*q,z:from.z+(to.z-from.z)*q},ballTime=flight*q;
    if(gap(o,point)>1+(profile.pace??o.pace??6)*(ballTime+.3))continue;
    const eta=arrival(o,point,{speed:profile.pace??o.pace??6,acceleration:profile.acceleration??6,reaction:.16,reach:.65}),m=eta-ballTime;
    if(m<margin){margin=m;interceptor=key(o);}risk=Math.max(risk,1/(1+Math.exp(clamp(m/.16,-30,30))));
   }
  }
  const receiverTime=receiver?arrival(receiver,to,{speed:profiles[receiver.id]?.pace??receiver.pace??6,reaction:.04,reach:.65}):0;
  // A ball arriving well before its intended runner is an exposed pass.
  if(receiver)risk=Math.max(risk,clamp((receiverTime-flight-.18)/.8,0,.9));
  return{risk,safety:1-risk,flight,margin,interceptor,receiverTime};
 }
 function support(player,carrier,base,opponents,friends,{radius=2.4,bounds=null,speed=15,profiles=[]}={}){
  const d=gap(carrier,base)||1,n={x:-(base.z-carrier.z)/d,z:(base.x-carrier.x)/d},candidates=[base,{x:base.x+n.x*radius,z:base.z+n.z*radius},{x:base.x-n.x*radius,z:base.z-n.z*radius}];
  let best={...base,utility:-Infinity};
  for(const candidate of candidates){const q=bounds?bounds({...candidate}):candidate;if(gap(q,base)>radius+.01)continue;
   let room=8,spacing=8;for(const o of opponents)if(live(o))room=Math.min(room,gap(q,{x:o.x+(o.vx||0)*.25,z:o.z+(o.vz||0)*.25}));
   for(const f of friends)if(live(f)&&f!==player&&key(f)!==key(player)&&f!==carrier)spacing=Math.min(spacing,gap(q,f));
   const pass=passWindow(carrier,q,opponents,{speed,profiles}),utility=pass.safety*.65+clamp(room/5,0,1)*.22+clamp(spacing/3,0,1)*.2-gap(q,base)*.028;
   if(utility>best.utility+1e-9)best={x:q.x,z:q.z,utility,passSafety:pass.safety};
  }
  return best;
 }
 function pressers(players,ball,previous=null,{profiles=[],goal=null}={}){
  const target={x:ball.x+(ball.vx||0)*.18,z:ball.z+(ball.vz||0)*.18};
  const ranked=players.filter(p=>live(p)&&!p.keeper).map(p=>{const profile=profiles[p.id]||{},eta=arrival(p,target,{speed:profile.pace??p.pace??6,acceleration:profile.acceleration??6});
   const defender=/CB|defender/.test(profile.role||p.role||''),rest=goal&&defender&&gap(p,goal)<gap(ball,goal)-5?.3:0;
   return{player:p,eta:eta+rest};}).sort((a,b)=>a.eta-b.eta||String(key(a.player)).localeCompare(String(key(b.player))));
  const old=ranked.find(r=>key(r.player)===previous),best=ranked[0];
  return{primary:old&&best&&old.eta<best.eta+.22?key(old.player):best?key(best.player):null,ranked};
 }
 function mark(defenders,attackers,ball,{goal={x:52.5,z:0},primary=null}={}){
  const available=defenders.filter(p=>live(p)&&!p.keeper&&key(p)!==primary),duties={};
  const threats=attackers.filter(p=>live(p)&&!p.keeper).map(p=>({p,value:gap(p,goal)+gap(p,ball)*.15})).sort((a,b)=>a.value-b.value||String(key(a.p)).localeCompare(String(key(b.p))));
  for(const {p} of threats){const dx=goal.x-p.x,dz=goal.z-p.z,n=Math.hypot(dx,dz)||1,target={x:p.x+dx/n*1.4+(p.vx||0)*.18,z:p.z+dz/n*1.4+(p.vz||0)*.18};
   let index=-1,cost=Infinity;for(let i=0;i<available.length;i++){const eta=arrival(available[i],target,{reaction:0});if(eta<cost){cost=eta;index=i;}}
   if(index<0)break;const defender=available.splice(index,1)[0];duties[key(defender)]={mark:key(p),target};
  }return duties;
 }
 // An estimate from the ball visible now, not a sample of the future trajectory.
 function keeperRead(ball,keeper,{plane=keeper.x-.32,gravity=9.81,maxPrediction=1.2}={}){
  const vx=ball.vx||0,time=vx>.05?clamp((plane-ball.x)/vx,0,maxPrediction):0;
  return{time,x:plane,z:clamp(ball.z+(ball.vz||0)*time,-4.2,4.2),y:Math.max(.11,ball.y+(ball.vy||0)*time-.5*gravity*time*time)};
 }
 function keeperStep(state,ball,time,dt,model){
  const reaction=model.reaction??.2,refresh=time>=reaction&&(!state.readUntil||time>=state.readUntil),read=refresh||!state.read?keeperRead(ball,model):state.read,readUntil=refresh?time+.10:state.readUntil;
  let target=state.z;
  if(time>=reaction){const side=Math.sign(read.z-state.z);target=clamp(read.z-side*.42,-3.25,3.25);}
  else if(model.commit!=null&&time>=-(model.anticipation||0))target=model.commit;
  if(Number.isFinite(model.maxTravel))target=clamp(target,model.z-model.maxTravel,model.z+model.maxTravel);
  const delta=target-state.z,speed=model.diveSpeed||5.6,accel=model.acceleration||16,desired=Math.sign(delta)*Math.min(speed,Math.sqrt(2*accel*Math.abs(delta))),velocity=(state.vz||0)+clamp(desired-(state.vz||0),-accel*dt,accel*dt);
  const z=state.z+velocity*dt;
  return{z:clamp(z,-3.4,3.4),vz:velocity,read,readUntil};
 }
 function sampleKeeper(frames,time){
  let lo=0,hi=frames.length-1;while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(frames[mid].t<=time)lo=mid;else hi=mid-1;}
  const a=frames[lo],b=frames[Math.min(lo+1,frames.length-1)],span=b.t-a.t,u=clamp((time-a.t)/(span||1),0,1);
  return{z:a.z+(b.z-a.z)*u,vz:time<frames[0].t||time>=frames.at(-1).t?0:span?(b.z-a.z)/span:0};
 }
 function penaltyPlan(history,random,{naturalKeeper=true}={}){
  // Recent targets are observed attempts. Current shot/result is not an input.
  const recent=history.slice(-8),bias=recent.reduce((n,k)=>n+Math.sign(k.target?.z||0),0),weight=recent.length?clamp(.5+bias/(recent.length+4)*.25,.3,.7):.5,side=random()<weight?1:-1,early=random()<.72;
  return{x:52.48,z:0,commit:early?side*(1.65+random()*.4):0,anticipation:early?.12:0,reaction:naturalKeeper?.15:.24,diveSpeed:naturalKeeper?5.6:4.2,acceleration:naturalKeeper?18:12,reach:naturalKeeper?1.1:.82,side,early,basis:'observed-attempts-and-seeded-commitment'};
 }
 // Synthetic coaching presets, not claims about a club's verified real tactics.
 function teamStyle(team={},seed=0){
  const identity=String(team.registryId??team.catalogId??team.id??team.name??seed);let hash=2166136261;for(const ch of identity)hash=Math.imul(hash^ch.charCodeAt(0),16777619)>>>0;
  const families=[{name:'balanced',width:1,tempo:1,directness:.50,patience:1},{name:'combination',width:.92,tempo:.92,directness:.34,patience:1.22},{name:'vertical',width:.98,tempo:1.08,directness:.69,patience:.88},{name:'wide',width:1.16,tempo:1.02,directness:.55,patience:1.04}],base=families[hash%families.length],requested=team.conceptStyle||team.tactics||{};
  return{...base,width:clamp(Number.isFinite(requested.width)?requested.width/.72:base.width,.8,1.2),tempo:clamp(Number.isFinite(requested.tempo)?requested.tempo:base.tempo,.88,1.12),directness:clamp(Number.isFinite(requested.directness)?requested.directness:Number.isFinite(requested.direct)?requested.direct:base.directness,.2,.8),basis:'seeded-simulation-coaching-preset',verified:false};
 }
 function combinations(players,carrier,goal,{time=0,lastPass=null,bounds=p=>p,style={width:1},maxDistance=18}={}){
  const out={};if(!carrier||!goal)return out;const dx=goal.x-carrier.x,dz=goal.z-carrier.z,d=Math.hypot(dx,dz)||1,fx=dx/d,fz=dz/d,tx=-fz,tz=fx,
   mates=players.filter(p=>live(p)&&p.team===carrier.team&&!p.keeper&&key(p)!==key(carrier)&&gap(p,carrier)<maxDistance),enemies=players.filter(p=>live(p)&&p.team!==carrier.team),recent=lastPass&&time>=lastPass.at&&time-lastPass.at<2.2&&lastPass.receiver===key(carrier),passer=recent?mates.find(p=>key(p)===lastPass.actor):null;
  if(passer){const lateral=(passer.x-carrier.x)*tx+(passer.z-carrier.z)*tz,sign=Math.sign(lateral)||1,target=bounds({x:passer.x+fx*3+tx*sign*1.1,z:passer.z+fz*3+tz*sign*1.1});out[key(passer)]={...target,intent:'give-and-go',blend:.68};}
  const runners=mates.filter(p=>p!==passer&&!/^(CB|DM|defender)/.test(p.role||'')).map(p=>{const sign=Math.sign((p.x-carrier.x)*tx+(p.z-carrier.z)*tz)||1,target=bounds({x:carrier.x+fx*4+tx*sign*3.4*(style.width||1),z:carrier.z+fz*4+tz*sign*3.4*(style.width||1)}),risk=passWindow(carrier,target,enemies,{speed:12,receiver:p}).risk;return{p,target,risk,score:risk*4+gap(p,target)*.1};}).filter(r=>r.risk<.65).sort((a,b)=>a.score-b.score||String(key(a.p)).localeCompare(String(key(b.p))));
  const run=runners[0];if(run)out[key(run.p)]={...run.target,intent:passer?'third-man':'overlap-offer',blend:passer?.62:.36};return out;
 }
 function distributeOffers(offers,players,ball,{bounds=p=>p,spacing=3.1}={}){
  const assigned=[],out={};for(const offer of offers){const p=players.find(p=>key(p)===offer.id);if(!p)continue;let best=null;const dx=offer.x-ball.x,dz=offer.z-ball.z,d=Math.hypot(dx,dz)||1,tx=-dz/d,tz=dx/d;
   for(const shift of[0,-1.6,1.6,-2.8,2.8]){const q=bounds({x:offer.x+tx*shift,z:offer.z+tz*shift}),room=Math.min(spacing,...assigned.map(a=>gap(q,a))),laneAngle=Math.atan2(q.z-ball.z,q.x-ball.x),angleRoom=Math.min(.5,...assigned.map(a=>Math.abs(Math.atan2(Math.sin(laneAngle-a.angle),Math.cos(laneAngle-a.angle))))),crowd=players.filter(o=>live(o)&&o.team!==p.team).reduce((cost,o)=>cost+Math.max(0,1.8-gap(o,q)),0),score=room*.7+angleRoom*2-Math.abs(shift)*.10-crowd*.55;
    if(!best||score>best.score)best={...q,score,angle:laneAngle};}
   assigned.push(best);out[offer.id]={x:best.x,z:best.z};
  }return out;
 }
 return Object.freeze({teamStyle,combinations,distributeOffers,arrival,passWindow,support,pressers,mark,keeperRead,keeperStep,sampleKeeper,penaltyPlan,key,version:'shared-intelligence-v173'});
});
