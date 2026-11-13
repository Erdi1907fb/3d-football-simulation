/* Deterministic, state-driven possession simulation. Selected decision/steering
 * algorithms are Apache-2.0 Open Football ports; see OPEN-FOOTBALL-v94.md.
 * No catalogue of play clips: actions are evaluated against live geometry.
 * Published scoring events remain the responsibility of the terminal solver. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('./open-football-adapter.js'),require('./football-physics.js'),require('./player-motion.js'),require('./openengine-adapter.js'),require('./formation-coordinator.js'),require('./steering.js'),require('./collective-play.js'),require('./football-intent.js'),require('./football-intelligence.js'));else r.Next90Possession=f(r.Next90OpenFootball,r.SekmeFootballPhysics,r.SekmePlayerMotion,r.Next90OpenEngine,r.Next90Formation,r.Next90Steering,r.Next90Collective,r.Next90FootballIntent,r.Next90Intelligence);})(typeof globalThis!=='undefined'?globalThis:this,function(OF,Physics,Motion,OE,Formation,Steering,Collective,Intent,Intelligence){'use strict';
const DT=1/60,clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),gap=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z),lerp=(a,b,u)=>a+(b-a)*u;
function random(seed){let x=seed>>>0;return()=>{x+=0x6d2b79f5;let t=x;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
const relative=(p,dir)=>({...p,x:p.x*dir,z:p.z*dir,vx:(p.vx||0)*dir,vz:(p.vz||0)*dir});
function choose(r,items){const sum=items.reduce((n,a)=>n+a.weight,0);let pick=r()*sum;for(const a of items){pick-=a.weight;if(pick<=0)return a;}return items.at(-1);}
function laneRisk(a,b,opponents){return Intelligence.passWindow(a,b,opponents,{speed:15}).risk;}
function simulate(c,initial,foot,attempt){
 const free=c.simulationMode==='free',freeSeconds=clamp(Number(c.freeSeconds)||90,15,180),freeScore=[0,0];let restartPlan=null;
 const rng=random(c.ai.seed^Math.imul(attempt+1,0x9e3779b1)),profiles=c.ai.profiles,
 E=Intelligence.Emergent,randomness=E.runtime(c.ai.seed+'|'+attempt),decisionRng=randomness.stream('decision'),executionRng=randomness.stream('execution'),direction=side=>side===c.team?1:-1,initialTeam=attempt>=4?c.team:rng()<.60?c.team:1-c.team,shift=free?0:c.liveGeometry&&attempt>=10?2+rng()*4:initialTeam===c.team?3+rng()*(attempt>=4?12:23):20+rng()*24,players=initial.map(p=>({...p,x:p.keeper?p.x:clamp(p.x-shift,-47,48),z:p.keeper||free?p.z:clamp(p.z+(rng()-.5)*5,-30,30),vx:0,vz:0,speed:0})),
 pool=players.filter(p=>p.team===initialTeam&&!p.keeper&&!p.dismissed&&!['CB'].includes(profiles[p.id].role)),
 starting=(c.liveGeometry&&attempt>=9?players[c.team*11+(c.finisher??9)]:null)||pool[Math.floor(rng()*pool.length)]||players.find(p=>p.team===initialTeam&&!p.keeper&&!p.dismissed);
 if(!starting)return null;
 let owner=starting.id,ball=foot(starting,0),flight=null,loose=null,control=null,nextDecision=.12+rng()*.20,carryAim=null,lastPossession=initialTeam,turnoverAt=-Infinity,duelAt=-Infinity,previousPrimary=null,world=null,lastTackle=null,giveAndGo=null;
 const frames=[],events=[],actions=[],minimum=free?freeSeconds:3.5+rng()*2.5,maximum=free?freeSeconds:minimum+5.5;let horizon=maximum,finished=false;
 const trace=(type,t,data={})=>events.push({type,at:t,minute:free?t/60:c.minute,stage:'procedural',...data}),action=(type,t,data={})=>actions.push({type,at:t,...data});
 trace('attack',0,{team:initialTeam,pattern:'attack'});
 function gain(p,t,cause){const prior=lastPossession;p.receivedAt=t;p.receivePoint={...ball};control={from:{...ball},at:t,...Intent.control(p,ball,profiles[p.id],players.filter(o=>o.team!==p.team),direction(p.team))};world=null;owner=p.id;flight=null;loose=null;carryAim=null;nextDecision=t+.18+rng()*.28;
  if(p.team!==prior){turnoverAt=t;trace('interception',t,{team:p.team,actor:p.id,lossKind:cause});trace('ball_secured',t+.02,{team:p.team,actor:p.id});action('recovery',t,{actor:p.id,cause,x:ball.x,z:ball.z});}
  lastPossession=p.team;
 }
 function release(p,target,t,kind,receiver){const from=foot(p,t);p.kickFoot=profiles[p.id].traits?.foot==='left'?'left':'right';p.strikePoint={...from};p.strikeAt=t;const d=gap(from,target),duration=c.liveGeometry?clamp(d/(12+d*.12),.32,3.3):clamp(d/OF.passPace(d),.28,2.15),opponents=players.filter(o=>o.team!==p.team&&!o.dismissed),pressure=OF.pressureIntensity(p,opponents),quality=profiles[p.id].passing;
  const error=E.execute('pass',p,profiles[p.id].traits||E.character(p,profiles[p.id]),executionRng,{distance:d,pressure,fatigue:p.fatigue||0}),aim=E.applyAim(from,{...target,y:.11},error);
  if(kind==='through'){const line=opponents.map(o=>o.x*direction(p.team)).sort((a,b)=>b-a)[1]??52.5;aim.x=Math.min(aim.x*direction(p.team),Math.max(from.x*direction(p.team),line)-.65)*direction(p.team);}
  const arc=kind==='cross'?2.3:kind==='loft'?1.8:.08;giveAndGo={actor:p.id,receiver,at:t,target:Intent.runAfterPass(p,players[receiver],ball,direction(p.team),profiles[p.id].role)};
  flight={type:'pass',from,to:aim,start:t,end:t+duration,arc,receiver,passer:p.id,team:p.team,kind,completed:false};owner=null;control=null;
  trace('pass',t,{team:p.team,actor:p.id,receiver,completed:false,actionKind:kind});flight.event=events.at(-1);action(kind,t,{actor:p.id,receiver,x:from.x,z:from.z,target:{x:aim.x,z:aim.z}});
 }
 function decide(p,t){const dir=direction(p.team),me=relative(p,dir),friends=players.filter(o=>o.team===p.team&&o.id!==p.id&&!o.dismissed),enemies=players.filter(o=>o.team!==p.team&&!o.dismissed),opponents=enemies.map(o=>relative(o,dir)),pressure=OF.pressureIntensity(me,opponents),opts=[],profile=profiles[p.id];
  // V171 switch of play: a lofted diagonal to a free wide player on the far side.
  for(const friend of friends){const d=gap(p,friend);if(friend.keeper||d<24||d>44||Math.abs(friend.z-p.z)<20)continue;const f=relative(friend,dir);if(f.x<me.x-6)continue;const room=1-OF.pressureIntensity(f,opponents),alone=opponents.reduce((m,o)=>Math.min(m,gap(o,f)),99);if(room>.9&&alone>6.5)opts.push({type:'loft',friend,weight:.55+pressure*1.2+Math.min(1,(alone-6.5)/6)*.6});}
  for(const friend of friends){if(c.liveGeometry){const line=opponents.map(o=>o.x).sort((a,b)=>b-a)[1]??52.5;if(friend.x*dir>0&&friend.x*dir>Math.max(me.x,line)-.65)continue;}const d=gap(p,friend);if(d<3||d>(c.liveGeometry?(p.keeper?44:Math.abs(me.z)>21?32:25):(p.keeper?74:43))||friend.keeper&&pressure<.5)continue;const f=relative(friend,dir),window=Intelligence.passWindow(me,f,opponents,{speed:c.liveGeometry?12+d*.12:OF.passPace(d),profiles}),risk=window.risk,safety=OF.passSafety(me,f,opponents),progress=(f.x-me.x)/30,space=1-OF.pressureIntensity(f,opponents);
   let weight=Math.exp(clamp(progress*.65+safety*.45+space*.5-risk*(c.liveGeometry?1.8:1.6)-d/(c.liveGeometry?13:70),-3,2));if(friend.id===c.team*11+(c.finisher??9)&&p.team===c.team)weight*=c.liveGeometry?1.15+clamp((t-minimum+2)/4,0,1)*2.1:1.1;
   if(c.ai.openEngine){const link=world?.network?.[p.id]?.find(n=>n.actor===friend.id);weight*=(.3+window.safety*.9);weight*=(.45+OE.passValue(me,f,opponents,profile,profiles)*1.1)*(link?1+link.weight*.25:.95);}
   if(giveAndGo?.receiver===p.id&&giveAndGo.actor===friend.id&&t-giveAndGo.at<2.0&&risk<.45)weight*=2.25;
   opts.push({risk,type:(p.keeper&&d>25||risk>.6&&d>17)?'loft':Math.abs(me.z)>20&&f.x>31&&Math.abs(f.z)<17?'cross':'pass',friend,weight});
   const through=OF.throughBall(me,f,opponents,profiles[friend.id].pace,profile.passing);if(through&&(!c.liveGeometry||gap(me,through)<28))opts.push({type:'through',friend,aim:{x:through.x*dir,z:through.z*dir},weight:1.3+through.value*2.6});
  }
  const nearest=enemies.filter(o=>!o.keeper).sort((a,b)=>gap(p,a)-gap(p,b))[0],beat=nearest?OF.duelEstimate(profile,profiles[nearest.id],{running:p.speed>3,wide:Math.abs(p.z)>18,cover:enemies.filter(o=>gap(p,o)<5).length>1}):.8,
  space=OF.dribbleSpace(me,opponents,{x:me.x+5,z:me.z});
  opts.push({type:'carry',weight:(.7+beat*2.4+(space?.value||0)*.5-pressure*.25)*(c.liveGeometry&&attempt>=10&&p.id===c.team*11+(c.finisher??9)?5:1)});
  if(pressure>.2)opts.push({type:'shield',weight:.2+(1-beat)*pressure});
  if(me.x>(free?16:27)&&Math.abs(me.z)<23)opts.push({type:'shot',weight:free?.18+Math.max(0,me.x-20)/16:.65+(me.x-27)/11});
  const selected=E.choose(opts.map(o=>({...o,creative:o.type==='through'?.9:o.type==='loft'?.4:0,utility:Math.log(Math.max(.0001,o.weight))})),profile.traits||E.character(p,profile),decisionRng,{pressure,fatigue:p.fatigue||0});nextDecision=t+((c.liveGeometry?.42:.35)+rng()*(c.liveGeometry?.75:.55))*(c.ai.tactics[p.team].style?.patience||1);
  if(['pass','loft','cross','through'].includes(selected.type)){const f=selected.friend,target=selected.aim||Intent.lead(p,f,c.liveGeometry?14:18);release(p,target,t,selected.type,f.id);return;}
  if(selected.type==='shot'){
   // Extra chances may fail, rebound or turn into a counter; new goals are
   // reserved for the existing score-constrained terminal solver.
   const keeper=enemies.find(o=>o.keeper),origin=relative(ball,dir),start={x:origin.x,y:origin.y,z:origin.z},defenders=opponents.filter(o=>!o.keeper);let shot;p.strikePoint={...ball};p.strikeAt=t;p.kickFoot=profile.traits?.foot==='left'?'left':'right';
   for(let n=0;n<(free?1:4);n++){const target=free?{z:(executionRng()<.5?-1:1)*(1.4+executionRng()*1.9),y:.2+executionRng()*1.8}:{z:n<2?relative(keeper,dir).z+(rng()-.5)*1.2:(rng()-.5)*11,y:n<2?.45+rng()*.6:.2+rng()*2.5};shot=Physics.shot({start,target,power:22+profile.strength*8,keeper:relative(keeper,dir),defenders,reaction:profiles[keeper.id].reaction,reach:1.65});if(shot.result!=='goal')break;}
   if(free||shot.result!=='goal'){horizon=free?freeSeconds:Math.min(17,Math.max(horizon,t+8.0));flight={type:'shot',start:t,end:t+Math.min(shot.impact+.45,2.4),shot,dir,passer:p.id,team:p.team,reported:false};owner=null;control=null;trace('shot',t,{team:p.team,actor:p.id,xg:.10,onTarget:shot.result==='save'||shot.result==='block'});action('shot',t,{actor:p.id,outcome:shot.result,x:p.x,z:p.z});return;}
  }
  const probe=Collective.carry(p,enemies,profile,dir),forward=probe?relative(probe,dir):space||{x:me.x+3,z:me.z},side=selected.type==='shield'?-1:1;
  carryAim={x:clamp((me.x+(forward.x-me.x)*side*2)*dir,-49,49),z:clamp((me.z+(forward.z-me.z)*2)*dir,-31,31)};
  action(selected.type==='shield'?'shield':'carry',t,{actor:p.id,x:p.x,z:p.z,target:{...carryAim}});
 }
 for(let tick=0;tick<=Math.ceil((free?freeSeconds:17)/DT);tick++){
  const t=tick*DT;if(t>horizon)break;const old=players.map(p=>({...p}));
  if(owner!=null&&!restartPlan&&t>=nextDecision)decide(players[owner],t);
  if(tick%12===0||!world){const side=owner!=null?players[owner].team:flight?.team??lastPossession,dir=direction(side),ps=players.map(p=>relative(p,dir)),b={...relative(ball,dir),vx:loose?.vx||0,vz:loose?.vz||0},att=ps.filter(p=>p.team===side),def=ps.filter(p=>p.team!==side),phase=OF.phase(false,-b.x,t-turnoverAt,.5,c.ai.tactics[1-side].press);
   world={oeOffsets:{},network:c.ai.openEngine?OE.supportNetwork(ps,side):null,side,dir,ps,b,attackers:att,defenders:def,plan:OF.defensivePlan(def,att,b,profiles,phase,previousPrimary,{press:c.ai.tactics[1-side].press})};world.collective=Collective.targets(players,ball,side,dir,profiles,c.ai.tactics,world.plan.primary,owner,{time:t,turnoverAt,flight,lastPass:giveAndGo});previousPrimary=world.plan.primary;
  }
  const goals=players.map(p=>{const profile=profiles[p.id],role=profile.role,dir=world.dir,canon=relative(p,dir),isAttack=p.team===world.side,home=relative(initial[p.id],dir),b=world.b;let q;
   if(restartPlan){return p.id===restartPlan.taker?restartPlan.spot:{x:initial[p.id].x,z:initial[p.id].z};}
   if(p.keeper){const ownDir=direction(p.team);q={x:-ownDir*49.6,z:clamp(ball.z*.12,-2.4,2.4)};return q;}
   if(owner===p.id)q=carryAim||{x:p.x+direction(p.team)*2,z:p.z};
   else if(isAttack){if(flight?.type==='pass'&&flight.receiver===p.id)q={x:flight.to.x,z:flight.to.z};
    else{const roleDepth=role==='CB'?24:role==='DM'?14:['LB','RB'].includes(role)?11:['ST','LW','RW'].includes(role)?-6:3,
      anchor={x:clamp(b.x-roleDepth,-44,46),z:clamp(home.z*.75+b.z*.20,-29,29)},offer=OF.supportOffer(canon,b,world.defenders)||anchor;
      const target=role==='CB'||role==='DM'?anchor:{x:anchor.x*.6+offer.x*.4,z:anchor.z*.6+offer.z*.4},evaded=OF.evadeMarker(canon,target,b,world.defenders,profile,profiles,t);
      q={x:evaded.x*dir,z:evaded.z*dir};}
   }else{const duty=world.plan.duties[p.id];if(duty?.target)q={x:duty.target.x*dir,z:duty.target.z*dir};else{const x=clamp(b.x+(['CB','LB','RB'].includes(role)?11:role==='DM'?4:-4),-40,47);q={x:x*dir,z:clamp(home.z*.72+b.z*.25,-29,29)*dir};}}
   if(c.ai.formation99&&owner!==p.id&&!(flight?.type==='pass'&&flight.receiver===p.id))q=Formation.target(c,p,q,old,ball,world.side,direction(p.team),[world.plan.primary]);
   if(c.ai.openEngine&&owner!==p.id&&!(flight?.type==='pass'&&flight.receiver===p.id)){if(!world.oeOffsets[p.id]){const shaped=OE.shape(p,q,old,ball,profile,c.ai.tactics[p.team],isAttack,direction(p.team));world.oeOffsets[p.id]={x:shaped.x-q.x,z:shaped.z-q.z};}const d=world.oeOffsets[p.id];q={x:q.x+d.x,z:q.z+d.z};}
   if(giveAndGo?.actor===p.id&&giveAndGo.target&&p.team===world.side&&t-giveAndGo.at<1.8&&owner!==p.id){const r=giveAndGo.target;q={x:r.x,z:r.z};}
   const collective=world.collective[p.id];if(collective&&!(giveAndGo?.actor===p.id&&giveAndGo.target&&t-giveAndGo.at<1.8)&&owner!==p.id&&!(flight?.type==='pass'&&flight.receiver===p.id)){const w=collective.blend;q={x:q.x+(collective.x-q.x)*w,z:q.z+(collective.z-q.z)*w};}
   if(owner==null&&!flight){const contenders=players.filter(a=>a.team===p.team&&!a.keeper&&!a.dismissed).sort((a,b)=>Intelligence.arrival(a,ball,{speed:profiles[a.id].pace,acceleration:profiles[a.id].acceleration})-Intelligence.arrival(b,ball,{speed:profiles[b.id].pace,acceleration:profiles[b.id].acceleration}));if(contenders[0]?.id===p.id||!c.ai.formation99&&contenders[1]?.id===p.id){const v={x:loose?.vx||0,z:loose?.vz||0};q=OF.pursuit(p,ball,v,profile.pace);}}
   if(isAttack&&owner!==p.id&&!(flight?.type==='pass'&&flight.receiver===p.id)){const line=world.defenders.filter(o=>!o.dismissed).map(o=>o.x).sort((a,b)=>b-a)[1]??52.5;const onside=Math.max(world.b.x,line)-4.0;if(q.x*dir>0)q.x=Math.min(q.x*dir,Math.max(0,onside))*dir;}
   return{x:clamp(q.x,-50.5,51.5),z:clamp(q.z,-32.8,32.8)};
  });
  for(const p of players){if(p.dismissed)continue;E.workload(p,profiles[p.id].traits||E.character(p,profiles[p.id]),DT);const o=old[p.id],profile=profiles[p.id],q=goals[p.id],urgent=owner===p.id||flight?.receiver===p.id,shape=Steering.support(c,o,q,ball,world.side,world.dir),/* V171 tempo: only players involved in the phase sprint; the rest hold shape at a jog, and a dribbler is slower than a free runner */chasing=owner==null&&!flight&&gap(o,ball)<14,pressing=world.plan.primary===p.id||world.plan.cover===p.id,away=gap(o,ball),adrift=gap(o,q),effort=p.keeper||flight?.receiver===p.id||chasing||pressing?1:owner===p.id?(()=>{const near=players.reduce((m,e)=>e.team!==p.team&&!e.keeper&&!e.dismissed?Math.min(m,gap(o,e)):m,99);return .80+.20*clamp((near-3)/5,0,1);})():Math.max(clamp(1.10-away/40,.50,1),adrift>13?.84:adrift>7?.68:0),desired=p.keeper||urgent?OF.arrive(o,q,profile.pace*effort,owner===p.id?.55:1.0):Steering.desired(o,shape,{...profile,pace:profile.pace*effort},old,false);
   for(const other of old){if(other.id===p.id||other.dismissed)continue;const d=gap(o,other);if(d<.92&&d>.001){desired.x+=(o.x-other.x)/d*(.92-d)*6;desired.z+=(o.z-other.z)/d*(.92-d)*6;}}
   const planned=Steering.avoid(o,old,desired),v=Motion.velocity(o,planned,profile,.9,DT);p.x=clamp(p.x+v.x*DT,-51,51.8);p.z=clamp(p.z+v.z*DT,-33.3,33.3);p.vx=v.x;p.vz=v.z;p.speed=Math.hypot(v.x,v.z);p.travel+=p.speed*DT;
   p.bodyLean=Motion.turnLean(p,o,DT);p.heading=Intent.facing(p,ball,p.team===world.side,owner,DT);
  }
  Motion.resolveBodies(players,DT);let kick=null;
  if(restartPlan){ball={...restartPlan.spot,y:.11};if(t>=restartPlan.readyAt&&gap(players[restartPlan.taker],ball)<1.1){const taker=players[restartPlan.taker],friends=players.filter(p=>p.team===taker.team&&p.id!==taker.id&&!p.keeper).sort((a,b)=>gap(taker,a)-gap(taker,b)),receiver=friends[0];trace(restartPlan.kind==='kickoff'?'kickoff':'throw_in',t,{team:taker.team,actor:taker.id});restartPlan=null;owner=taker.id;if(receiver)release(taker,receiver,t,'pass',receiver.id);}}
  else if(owner!=null){const p=players[owner],held=foot(p,t),controlAge=control?t-control.at:1,blend=control?clamp(controlAge/control.duration,0,1):1;if(control&&controlAge<control.duration){const touch=Math.sin(Math.PI*blend)*(1-blend);held.x+=control.offset.x*touch;held.z+=control.offset.z*touch;}ball={x:lerp(control?.from.x??held.x,held.x,blend),y:lerp(control?.from.y??held.y,held.y,blend),z:lerp(control?.from.z??held.z,held.z,blend)};
   const nearby=players.filter(o=>o.team!==p.team&&!o.keeper&&!o.dismissed&&gap(o,ball)<1.20),marker=c.ai.openEngine?OE.weighted(OE.markers(ball,nearby,profiles),rng):null,defender=marker?players[marker.actor]:nearby.sort((a,b)=>Intelligence.arrival(a,ball,{speed:profiles[a.id].pace,acceleration:profiles[a.id].acceleration})-Intelligence.arrival(b,ball,{speed:profiles[b.id].pace,acceleration:profiles[b.id].acceleration}))[0];
   if(defender&&t-duelAt>.65&&t>(control?.at??-1)+.2){duelAt=t;const beat=OF.duelEstimate(profiles[p.id],profiles[defender.id],{running:p.speed>3,wide:Math.abs(p.z)>18,cover:players.filter(o=>o.team!==p.team&&!o.keeper&&gap(o,p)<4).length>1});
    if(rng()>beat){gain(defender,t,'tackle');lastTackle={at:t,actor:defender.id,victim:p.id};action('tackle',t,{actor:defender.id,victim:p.id,x:ball.x,z:ball.z});}
    else if(rng()>(profiles[p.id].control+.12)){loose={...ball,vx:p.vx*1.3+direction(p.team)*2,vy:.3,vz:p.vz*1.3+(rng()-.5)*2};owner=null;control=null;action('heavyTouch',t,{actor:p.id,x:ball.x,z:ball.z});}
   }
  }else if(flight){if(flight.type==='pass'){const u=clamp((t-flight.start)/(flight.end-flight.start),0,1);ball=Physics.pass(flight.from,flight.to,u,flight.end-flight.start,flight.arc);kick={id:flight.passer,at:flight.start};
     const near=players.filter(p=>p.id!==flight.passer&&!p.dismissed&&gap(p,ball)<.82&&ball.y<1.65&&(t-flight.start>.12)).sort((a,b)=>Intelligence.arrival(a,ball,{speed:profiles[a.id].pace,acceleration:profiles[a.id].acceleration})-Intelligence.arrival(b,ball,{speed:profiles[b.id].pace,acceleration:profiles[b.id].acceleration}))[0];
     if(near){flight.event.completed=near.team===flight.team;flight.event.completedAt=t;flight.event.receiver=near.id;gain(near,t,near.team===flight.team?'reception':'passIntercept');}
     else if(t>=flight.end){const dx=flight.to.x-flight.from.x,dz=flight.to.z-flight.from.z,d=Math.hypot(dx,dz),speed=OF.passPace(d)*.55;loose={...ball,vx:dx/Math.max(.1,d)*speed,vy:0,vz:dz/Math.max(.1,d)*speed};flight=null;}
    }else{const f=flight,age=t-f.start,raw=Physics.at(f.shot.trajectory,age);ball={x:raw.x*f.dir,y:raw.y,z:raw.z*f.dir};kick={id:f.passer,at:f.start};if(!f.reported&&age>=f.shot.impact){f.reported=true;trace(f.shot.result==='block'?'block':f.shot.result,t,{team:f.team,actor:f.passer,physical:true,point:{...ball}});if(free&&f.shot.result==='goal')freeScore[f.team]++;}
     if(t>=f.end){if(free&&f.shot.result==='goal'){const conceding=1-f.team,taker=players.filter(p=>p.team===conceding&&!p.keeper).sort((a,b)=>gap(a,{x:0,z:0})-gap(b,{x:0,z:0}))[0];restartPlan={kind:'kickoff',spot:{x:0,z:0},readyAt:t+1.5,taker:taker.id};trace('restart_setup',t,{team:conceding,kind:'kickoff'});flight=null;loose=null;}else{const next=Physics.at(f.shot.trajectory,age+.01);loose={...ball,vx:(next.x*f.dir-ball.x)/.01,vy:(next.y-ball.y)/.01,vz:(next.z*f.dir-ball.z)/.01};flight=null;}}
    }
  }else if(loose){Physics.advance(loose,DT);ball={x:loose.x,y:loose.y,z:loose.z};const p=players.filter(p=>!p.dismissed&&gap(p,ball)<.85&&ball.y<1.7).sort((a,b)=>Intelligence.arrival(a,ball,{speed:profiles[a.id].pace,acceleration:profiles[a.id].acceleration})-Intelligence.arrival(b,ball,{speed:profiles[b.id].pace,acceleration:profiles[b.id].acceleration}))[0];if(p)gain(p,t,'looseBall');}
  if((Math.abs(ball.z)>34||Math.abs(ball.x)>52.65)&&!restartPlan&&!(free&&flight?.type==='shot')){
   // A real miss/out is shown. Reject this branch for a continuous highlight
   // rather than teleport a throw-in or silently add a scoring event.
   if(!free)break;const team=1-(flight?.team??lastPossession),spot={x:clamp(ball.x,-50,50),z:clamp(ball.z,-33.5,33.5)},taker=players.filter(p=>p.team===team&&!p.keeper).sort((a,b)=>gap(a,spot)-gap(b,spot))[0];restartPlan={kind:'throw_in',spot,readyAt:t+1.5,taker:taker.id};trace('ball_out',t,{team,point:{...ball}});trace('restart_setup',t,{team,kind:'throw_in',spot});owner=null;flight=null;loose=null;
  }
  frames.push({players:players.map(p=>({...p})),ball:{...ball},owner,kick,flight:flight?.type||null,possession:lastPossession,tackle:lastTackle,score:freeScore.slice(),restart:restartPlan?{...restartPlan}:null,shot:flight?.type==='shot'?{at:flight.start,impact:flight.shot.impact,team:flight.team,result:flight.shot.result,style:flight.shot.saveStyle,contact:flight.shot.contact,dir:flight.dir}:null});
  const striker=players[c.team*11+(c.finisher??9)];const defenceLine=players.filter(p=>p.team!==c.team&&!p.dismissed).map(p=>p.x).sort((a,b)=>b-a)[1]??52.5,
 onside=c.liveGeometry?(owner===striker.id||striker.x<=0||striker.x<=Math.max(ball.x,defenceLine)-.65):players.filter(p=>p.team===c.team&&!p.keeper&&!p.dismissed).every(p=>p.x<=0||p.x<=Math.max(ball.x,defenceLine)-1.0);
  if(!free&&onside&&t>=minimum&&owner!=null&&players[owner].team===c.team&&!players[owner].keeper&&striker.x>16&&Math.abs(striker.z)<29&&gap(players[owner],striker)<(c.liveGeometry?17:43)&&t>(control?.at??-1)+.25){finished=true;break;}
 }
 if(free)finished=frames.length>2;if(!finished||frames.length<180)return null;
 const duration=(frames.length-1)*DT,end=frames.at(-1);return{frames,events,actions,duration,endPlayers:end.players.map(p=>({...p})),owner:end.owner,endBall:{...end.ball},score:freeScore,initialTeam,procedural:true,kind:'live-possession',attempt};
}
function create(c,initial,foot){
 if(!c.proceduralBuildUp||!c.ai||c.pre||(!c.liveGeometry&&c.substitutions?.length)||c.review||c.contactFoul||['corner','freeKick','penalty'].includes(c.pattern))return null;
 for(let attempt=0;attempt<(c.liveGeometry?14:10);attempt++){const run=simulate(c,initial,foot,attempt);if(!run)continue;
  run.sample=time=>{const f=clamp(time/DT,0,run.frames.length-1),i=Math.min(run.frames.length-2,Math.floor(f)),u=f-i,a=run.frames[i],b=run.frames[i+1];return{players:a.players.map((p,id)=>{const q=b.players[id],angle=Math.atan2(Math.sin(q.heading-p.heading),Math.cos(q.heading-p.heading));return{...p,x:lerp(p.x,q.x,u),z:lerp(p.z,q.z,u),vx:lerp(p.vx,q.vx,u),vz:lerp(p.vz,q.vz,u),speed:lerp(p.speed,q.speed,u),travel:lerp(p.travel,q.travel,u),heading:p.heading+angle*u};}),ball:{x:lerp(a.ball.x,b.ball.x,u),y:lerp(a.ball.y,b.ball.y,u),z:lerp(a.ball.z,b.ball.z,u)},owner:u<.5?a.owner:b.owner,possession:a.possession,shot:a.shot,tackle:a.tackle,kick:a.kick,velocity:{x:(b.ball.x-a.ball.x)/DT,y:(b.ball.y-a.ball.y)/DT,z:(b.ball.z-a.ball.z)/DT}};};
  Object.defineProperty(run,'sample',{enumerable:false});return run;
 }return null;
}
function createFree(c,initial,foot){const run=simulate({...c,simulationMode:'free'},initial,foot,0);if(!run)throw Error('Free simulation failed');run.sample=time=>{const index=clamp(Math.floor(time/DT),0,run.frames.length-1);return run.frames[index];};return run;}
return{create,createFree,version:'receive-support-facing-v105'};
});
