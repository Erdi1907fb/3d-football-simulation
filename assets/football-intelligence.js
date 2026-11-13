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
 return Object.freeze({arrival,passWindow,support,pressers,mark,keeperRead,keeperStep,sampleKeeper,penaltyPlan,key,version:'shared-intelligence-v172'});
});
