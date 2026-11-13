/* Shared, deterministic football decisions in metres/seconds (X/Z ground).
 * League-Soccer reference: AIfunctions.cpp passing corridors/arrival time and
 * goalie_default.cpp interception. Original JS adaptation; see research/V172.
 * This module reads observations, never a requested goal/save or future score.
 * Ball integration, contact and the rules remain in the existing engines.
 * Reference copyright 2019 Google LLC & Bastiaan Konings (Apache-2.0);
 * license: assets/vendor/league-soccer/LICENSE. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./emergent-football.js'));else root.Next90Intelligence=factory(root.Next90Emergent);})(typeof globalThis!=='undefined'?globalThis:this,function(Emergent){'use strict';
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
 function penaltyPlan(history,random,{naturalKeeper=true,keeperTraits=null}={}){
  // Recent targets are observed attempts. Current shot/result is not an input.
  const traits=keeperTraits||{reflexes:.65,awareness:.6,decisions:.6,composure:.6};const recent=history.slice(-8),bias=recent.reduce((n,k)=>n+Math.sign(k.target?.z||0),0),weight=recent.length?clamp(.5+bias/(recent.length+4)*.25,.3,.7):.5,side=random()<weight?1:-1,early=random()<.72;
  return{x:52.48,z:0,commit:early?side*(1.65+random()*.4):0,anticipation:early?.12:0,reaction:(naturalKeeper?.15:.24)+(1-traits.reflexes)*.09,diveSpeed:naturalKeeper?5.2+traits.reflexes*.4:4.0+traits.reflexes*.2,acceleration:naturalKeeper?18:12,reach:naturalKeeper?1.1:.82,side,early,basis:'observed-attempts-and-seeded-commitment'};
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

 // Arrival-time proxy, not a fitted Spearman pitch-control/EPV model.
 function pitchControl(point,friends,opponents){const eta=ps=>Math.min(12,...ps.filter(live).map(p=>arrival(p,point,{reaction:.18}))),ours=eta(friends),theirs=eta(opponents);return 1/(1+Math.exp(clamp((ours-theirs)/.35,-30,30)));}
 function attackValue(point,goal,{length=105,width=68}={}){const distance=gap(point,goal),angle=2*Math.atan2(Math.min(3.66,width*.12),Math.max(1,distance));return clamp(Math.exp(-distance/(length*.24))*(.35+angle),0,1);}
 function teamPlan(players,ball,team,ownGoal,goal,{profiles=[],tactics={},time=0,lostAt=-Infinity,owner=null,length=105,width=68,bounds=q=>q}={}){
  const friends=players.filter(p=>live(p)&&p.team===team&&!p.keeper),enemies=players.filter(p=>live(p)&&p.team!==team&&!p.keeper),d=gap(ownGoal,goal)||1,fx=(goal.x-ownGoal.x)/d,fz=(goal.z-ownGoal.z)/d,tx=-fz,tz=fx,
   depth=p=>(p.x-ownGoal.x)*fx+(p.z-ownGoal.z)*fz,lateral=p=>(p.x-ownGoal.x)*tx+(p.z-ownGoal.z)*tz,hasBall=owner!=null&&owner.team===team,ballDepth=depth(ball),small=friends.length<7,block=tactics.depth||'mid',blockBase=block==='high'?.47:block==='deep'||block==='low'?.22:.34,
   line=clamp(ballDepth-(small?3:13),length*blockBase,length*(small?.72:.68)),press=tactics.press??.5,recent=time-lostAt>=0&&time-lostAt<2.6,near=friends.filter(p=>gap(p,ball)<(small?5:10)),counter=recent&&press>.5&&near.length>=2,
   ranked=pressers(friends,ball,null,{profiles,goal:ownGoal}).ranked,primary=ranked[0]?.player,cover=ranked.find(q=>q.player!==primary&&gap(q.player,ball)<(small?8:18))?.player,pressEnabled=counter||primary&&gap(primary,ball)<(small?7:10+press*9)&&ballDepth<length*(block==='high'?.95:block==='deep'?.52:.76),marking=tactics.marking||'mixed',marks=mark(friends.filter(p=>p!==primary&&p!==cover),enemies,ball,{goal:ownGoal}),out={};
  const role=p=>profiles[p.id]?.role||p.role||'CM',backs=friends.filter(p=>/CB|defender/.test(role(p))).sort((a,b)=>lateral(a)-lateral(b));
  for(const p of friends){if(hasBall&&key(p)===key(owner))continue;const r=role(p),back=/CB|defender/.test(r),mid=/DM|CM|midfielder/.test(r),side=Math.sign(lateral(p))||1;let q,intent,blend=.30;
   if(!hasBall&&pressEnabled&&p===primary){const away={x:ball.x-ownGoal.x,z:ball.z-ownGoal.z},n=Math.hypot(away.x,away.z)||1;q={x:ball.x-away.x/n*.6-tx*side*.35,z:ball.z-away.z/n*.6-tz*side*.35};intent=counter?'counter-press':'first-pressure';blend=.7;}
   else if(!hasBall&&pressEnabled&&p===cover){q={x:ball.x-fx*(small?2.4:4.8)+tx*side*1.5,z:ball.z-fz*(small?2.4:4.8)+tz*side*1.5};intent='cover-pressure';blend=.55;}
   else{const rank=backs.indexOf(p),baseSide=back&&backs.length>1?(rank/(backs.length-1)-.5)*width*(small?.25:.32):clamp(lateral(p),-width*.38,width*.38),progress=hasBall?back?Math.min(ballDepth-(small?5:18),length*.52):mid?ballDepth-2:ballDepth+Math.min(8,length*.12):line-(back?0:mid?-(small?2:7):-(small?4:13)),z=clamp(baseSide*.8+lateral(ball)*.18,-width*.43,width*.43);q={x:ownGoal.x+fx*clamp(progress,small?2:7,length*.88)+tx*z,z:ownGoal.z+fz*clamp(progress,small?2:7,length*.88)+tz*z};intent=hasBall&&back?'rest-defense':hasBall?'offer-between-lines':'compact-'+block;
    const duty=marks[key(p)];if(!hasBall&&duty&&marking!=='zone'){const a=enemies.find(e=>key(e)===duty.mark),weight=marking==='man'?.78:a&&gap(a,p)<(small?5:10)?.48:.12;q={x:q.x+(duty.target.x-q.x)*weight,z:q.z+(duty.target.z-q.z)*weight};intent=weight>.4?'track-runner':intent;}
   }out[key(p)]={...bounds(q),intent,blend};
  }return{targets:out,primary:pressEnabled&&primary?key(primary):null,cover:pressEnabled&&cover?key(cover):null,counterPress:counter,block,line};
 }
 function finishingOpportunity(p,g,enemies){
  const nx=g.nx??1,nz=g.nz??0,width=g.width||7.32,depth=(g.x-p.x)*nx+(g.z-p.z)*nz,lateral=-(p.x-g.x)*nz+(p.z-g.z)*nx,distance=gap(p,g);
  if(depth<.35||depth>8||Math.abs(lateral)>width*.58||distance>9)return{clear:false};
  const active=enemies.filter(q=>live(q)),keeper=active.find(q=>q.keeper),near=active.filter(q=>!q.keeper).some(q=>gap(p,q)<2.0),lanes=[-.27,0,.27].map(a=>{const target={x:g.x-nz*width*a,z:g.z+nx*width*a},dx=target.x-p.x,dz=target.z-p.z,dd=dx*dx+dz*dz;return{target,blocked:active.filter(q=>!q.keeper).some(q=>{const u=((q.x-p.x)*dx+(q.z-p.z)*dz)/dd;return u>.02&&u<1&&Math.hypot(q.x-p.x-u*dx,q.z-p.z-u*dz)<.7;})};}).filter(q=>!q.blocked),empty=!keeper||gap(keeper,g)>4.2||keeper.recoverUntil>0&&keeper.dive>.5;
  return{clear:!near&&lanes.length>=2&&(empty||distance<4.5),target:lanes.sort((a,b)=>(keeper?gap(b.target,keeper)-gap(a.target,keeper):0))[0]?.target,distance,empty};
 }
 function arenaDecision(p,g,players,lane,rng,context={}){
  const identity=p.identity||p,traits=p.traits||Emergent.character(identity),style=context.style||{directness:.5,patience:1},enemies=players.filter(q=>live(q)&&q.team!==p.team),friends=players.filter(q=>live(q)&&q.team===p.team&&q!==p),distance=gap(p,g),pressure=enemies.filter(q=>!q.keeper).reduce((n,q)=>n+Math.exp(-(gap(p,q)**2)/6),0),options=[],maxPass=context.layout?.count>2?15:18;
  options.push({kind:'carry',utility:.36+traits.control*.18-Math.min(1,pressure)*.16,risk:pressure*.14});
  for(const q of friends){const d=gap(p,q);if(d<1.6||d>maxPass)continue;const target=context.passAim?context.passAim(p,q):{x:q.x+(q.vx||0)*.22,z:q.z+(q.vz||0)*.22},risk=passWindow(p,target,enemies,{speed:context.passSpeed?context.passSpeed(d):12,receiver:q}).risk,gain=(distance-gap(q,g))/maxPass,control=pitchControl(target,[q],enemies),value=attackValue(target,g,{length:28,width:18})-attackValue(p,g,{length:28,width:18});
   if(risk<Math.min(.68,.52+traits.vision*.12+pressure*.025))options.push({kind:'pass',receiver:q,utility:.35+gain*(.3+style.directness*.45)+control*.23+value*.35+Math.min(pressure,1.5)*.15-(q.keeper?.22:0),risk});
   if(!q.keeper&&context.layout&&d>3&&d<13&&distance>6){const n=gap(q,g)||1,lead=Math.min(3.2,Math.max(1.5,n-4)),through={x:q.x+(g.x-q.x)/n*lead,z:q.z+(g.z-q.z)/n*lead},inside=context.layout.boundaries.every(e=>through.x*e.nx+through.z*e.nz<=e.d-.8),window=passWindow(p,through,enemies,{speed:13,receiver:q});if(inside&&window.risk<.72&&gap(through,g)<distance-1.5)options.push({kind:'pass',receiver:q,through,utility:.55+(distance-gap(through,g))*.025+traits.vision*.12,risk:window.risk,creative:.8});}
   const depth=(g.x-q.x)*g.nx+(g.z-q.z)*g.nz;if(!q.keeper&&depth<8&&d>3&&d<14&&Math.abs(-p.x*g.nz+p.z*g.nx)>3&&pressure<2.5)options.push({kind:'cross',receiver:q,utility:.48+(1-pressure*.2)*.08,risk:Math.min(.9,risk*.7+.13),creative:.3});
  }
  const blocked=lane(p,g,players,p.team),depth=(g.x-p.x)*g.nx+(g.z-p.z)*g.nz,lateral=Math.abs(-p.x*g.nz+p.z*g.nx),angle=Math.atan2(g.width/2,Math.max(.1,distance));
  if(distance<16&&depth>.6&&lateral<g.width*.5+depth*.9)options.push({kind:'shot',utility:.15+clamp((15-distance)/10,0,1)*.65+angle*.2+(context.keeper?.rushing?.12:0),risk:clamp(blocked*.20+Math.max(0,distance-7)*.025,0,.85),creative:distance>11?.4:0});
  const finish=finishingOpportunity(p,g,enemies),viable=finish.clear?options.filter(o=>o.kind==='shot'||o.kind==='pass'&&gap(o.receiver,g)<distance-1&&o.risk<.15):options;return Emergent.choose(viable.length?viable:options,traits,rng,{pressure,fatigue:p.fatigue||0});
 }
 return Object.freeze({finishingOpportunity,Emergent,pitchControl,attackValue,teamPlan,arenaDecision,teamStyle,combinations,distributeOffers,arrival,passWindow,support,pressers,mark,keeperRead,keeperStep,sampleKeeper,penaltyPlan,key,version:'shared-intelligence-v176'});
});
