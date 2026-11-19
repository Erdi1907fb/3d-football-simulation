/* V219 Football tennis (futnet) engine. Original Next90 implementation.
 * Rules (UNIF futnet): net 1.10 m; court 12.8 × 9 m (singles/doubles) or 18 × 9 m (triples);
 * one bounce allowed on your side; singles 2 touches, doubles/triples 3 touches and no player
 * touches twice in a row; no hands. Sets to 11 (or the chosen target), two clear points, capped at 15.
 * The ball is the shared aerodynamic ball (drag, Magnus, turf bounce). Players read a predicted
 * flight, the nearest player who can arrive in time plays it; the last touch is aimed into the open
 * court. Execution error grows with ball speed, awkward height and lower ability, so points are won
 * and lost physically (net, out, double bounce, not reached). Deterministic per seed.
 * Coordinates: court centred on the stadium centre spot; x along the court (net at x = 0, side 0 at
 * x < 0), y up, z across. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('./ball-aero.js'));else r.Next90Footvolley=f(r.Next90BallAero);})(typeof globalThis!=='undefined'?globalThis:this,function(A){'use strict';
const DT=1/120,NET=1.10,R=A.R||.11,clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),hyp=Math.hypot;
function random(seed){let s=(seed>>>0)||1;return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296;};}
function gauss(rng){let u=0,v=0;while(!u)u=rng();while(!v)v=rng();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
function court(perSide){const length=perSide>=3?18:12.8;return{length,width:9,half:length/2,netHeight:NET,netHalf:4.5,postZ:5.0};}
const RULES={1:{touches:2,repeat:true},2:{touches:3,repeat:false},3:{touches:3,repeat:false}};
function ability(p){const r=Number(p?.rating);return clamp(Number.isFinite(r)?(r>10?r/10:r):6.8,5,9.5);}

function create(options={}){
 const sides=options.sides||[],n=clamp(Math.round(options.perSide||2),1,3);if(sides.length!==2||sides.some(s=>(s.players||[]).length<n))throw Error('Choose '+n+' player(s) for both sides');
 const seed=options.seed>>>0,rng=random(seed),C=court(n),rule=RULES[n],target=[5,7,11,15].includes(Number(options.points))?Number(options.points):11,sets=Number(options.sets)===3?3:1,setsToWin=sets===3?2:1,cap=Math.max(target,15),surface=['clear','rain','snow'].includes(options.weather)?options.weather:'clear',maxTime=Number(options.maxSeconds)||900;
 const homeX=(team,k)=>{const s=team?1:-1,h=C.half;if(n===1)return{x:s*h*.55,z:0};if(n===2)return{x:s*h*.55,z:k?2.0:-2.0};return[{x:s*h*.32,z:-2.6},{x:s*h*.32,z:2.6},{x:s*h*.72,z:0}][k];};
 const players=[];for(let team=0;team<2;team++)for(let k=0;k<n;k++){const h=homeX(team,k),id=sides[team].players[k];players.push({team,slot:k,identity:id,skill:ability(id),x:h.x,z:h.z,vx:0,vz:0,heading:team?-Math.PI/2:Math.PI/2,speed:0,gait:k*1.7,kick:null,jumpAt:-9,jumpHeight:0,celebrate:null});}
 const events=[],frames=[],emit=(type,t,extra={})=>{const e={type,at:t,...extra};events.push(e);return e;};
 const score=[0,0],setScore=[0,0],setLog=[];let t=0,b=null,phase='serve',serveTeam=rng()<.5?0:1,serverSlot=[0,0],pauseUntil=0,possession=-1,touches=0,bounces=0,lastToucher=-1,lastTeam=-1,plan=null,ended=false,winner=null,lastPoint=null,rallyKicks=0,netTouched=false,crossedAt=0;

 // Predicts the flight on a copy of the ball until it lands or leaves the court area.
 function predict(state,limit=3){const q={...state},path=[];let tt=0,bounced=0;while(tt<limit){for(let i=0;i<2;i++){const ev=A.step(q,DT/2);if(ev?.type==='ground')bounced++;}tt+=DT;path.push({t:tt,x:q.x,y:q.y,z:q.z,vy:q.vy,bounced});if(bounced>=2||Math.abs(q.x)>C.half+6)break;}return path;}
 const inCourt=(x,z,team)=>Math.abs(z)<=C.width/2+.02&&(team===0?x<=0&&x>=-C.half-.02:x>=0&&x<=C.half+.02);
 const sideOf=x=>x<0?0:1;

 function launch(from,to,time,spin){const v=A.solve({x:from.x,y:from.y,z:from.z},{x:to.x,y:to.y??R,z:to.z},time,spin,{surface});b=A.state({x:from.x,y:from.y,z:from.z},v,spin,{surface});netTouched=false;}
 // Clears the net? simulates and checks the height where it crosses x = 0.
 function clears(from,to,time,spin){const v=A.solve({x:from.x,y:from.y,z:from.z},{x:to.x,y:R,z:to.z},time,spin,{surface}),q=A.state({x:from.x,y:from.y,z:from.z},v,spin,{surface});let px=q.x;for(let i=0;i<Math.ceil(time/(DT/2))+2;i++){A.step(q,DT/2);if(Math.sign(px)!==Math.sign(q.x)&&px!==0)return q.y>NET+R+.08;px=q.x;}return true;}

 function setUpServe(){phase='serve';possession=-1;touches=0;bounces=0;lastToucher=-1;lastTeam=-1;plan=null;rallyKicks=0;const team=serveTeam,slot=serverSlot[team]%n,p=players[team*n+slot],s=team?1:-1;
  for(const q of players){const h=homeX(q.team,q.slot);q.tx=h.x;q.tz=h.z;}p.tx=s*(C.half+.45);p.tz=(rng()-.5)*2.4;pauseUntil=t+1.25;b=A.state({x:p.tx-s*.3,y:R,z:p.tz},{x:0,y:0,z:0},null,{surface});b.held=p;}

 function choosePlayer(team,contact){let best=null,bestScore=Infinity;for(const p of players.filter(q=>q.team===team)){if(!rule.repeat&&p===lastToucher&&possession===team&&touches>0)continue;const d=hyp(contact.x-p.x,contact.z-p.z),need=.18+d/(6.0+(p.skill-5)*.25),score=need-contact.t;/* reaction + run */if(score<bestScore){bestScore=score;best=p;}}return{player:best,late:bestScore};}

 // Plans who meets the ball and where, from the predicted flight. A ball whose first bounce is
 // out (and that came from the opponents) is left alone: letting it go wins the point.
 function replan(){const path=predict(b);plan=null;const firstBounce=path.find(q=>q.bounced>=1);
  if(firstBounce){const side=sideOf(firstBounce.x);if(lastTeam!==side&&!inCourt(firstBounce.x,firstBounce.z,side)&&Math.abs(firstBounce.x)>.4)return null;}
  for(const q of path){const team=sideOf(q.x),same=team===possession;if(same&&touches>=rule.touches)continue;if((same?bounces:0)+q.bounced>1)break;if(q.y<.15||q.y>2.25)continue;if(q.vy>0&&q.y<.5&&q.bounced===0)continue;if(team===lastTeam&&touches>0&&q.t<.38)continue;
   const pick=choosePlayer(team,q);if(pick.player&&pick.late<=0){plan={team,player:pick.player,at:t+q.t,x:q.x,y:q.y,z:q.z};break;}}
  return plan;}

 function attackTarget(team){const opp=players.filter(q=>q.team!==team),s=team?-1:1;let best=null,bs=-1;for(let i=0;i<14;i++){const x=s*(.9+rng()*(C.half-1.2)),z=(rng()*2-1)*(C.width/2-.35),d=Math.min(...opp.map(o=>hyp(o.x-x,o.z-z)));const score=d+rng()*.6;if(score>bs){bs=score;best={x,z};}}return best;}

 function touch(p){const team=p.team,contactH=b.y;if(possession!==team){possession=team;touches=0;bounces=bounces;}touches++;rallyKicks++;lastToucher=p;lastTeam=team;const left=rule.touches-touches,s=team?-1:1,speedIn=hyp(b.vx,b.vy,b.vz),header=contactH>1.25,jump=contactH>1.75,foot=(Math.sin(p.slot*2.3+rallyKicks)>0)?'right':'left',from={x:b.x,y:b.y,z:b.z};
  p.kick={at:t,foot,point:{...from},header};if(jump){p.jumpAt=t;p.jumpHeight=clamp(contactH-1.6,.15,.6);}
  const skill=(p.skill-5)/4.5,difficulty=clamp(speedIn/20,0,1)*.65+(contactH<.25?.25:0)+(header?.12:0)+(jump?.12:0),err=clamp((.9-skill*.55+difficulty*.95)*(1+rallyKicks/30),.28,2.2);/* long rallies tire legs */
  const teammates=players.filter(q=>q.team===team&&q!==p),attack=left<=0||(touches>=2&&rng()<.85)||(n===1&&touches>=1&&rng()<.55)||(touches===1&&speedIn<7&&contactH>.9&&contactH<1.6&&rng()<.12);
  if(!attack){/* set up: a soft pop to a teammate (or to yourself in singles) at a comfortable height */const mate=rule.repeat&&n===1?p:teammates.sort((a,c)=>hyp(a.x-b.x,a.z-b.z)-hyp(c.x-b.x,c.z-b.z))[0]||p,dest={x:clamp(mate.x+s*.4,-C.half+.6,C.half-.6),z:clamp(mate.z,-C.width/2+.6,C.width/2-.6)};if(Math.sign(dest.x)!==(team?1:-1))dest.x=(team?1:-1)*1.2;const time=.95+rng()*.25,aim={x:dest.x+gauss(rng)*.35*err,y:1.05,z:dest.z+gauss(rng)*.35*err};launch(from,aim,time,{x:0,y:0,z:0});emit('touch',t,{team,actor:p.identity?.name,actorIndex:players.indexOf(p),kind:header?'header-set':'set',touch:touches});plan=null;return;}
  const tgt=attackTarget(team);let time=clamp(.5+hyp(tgt.x-from.x,tgt.z-from.z)/17+(header?.15:0)+rng()*.25,.48,1.4);for(let k=0;k<6&&!clears(from,tgt,time,null);k++)time+=.16;const spinZ=(rng()-.5)*14,spin={x:0,y:spinZ*.3,z:s*(4+rng()*8)},aim={x:tgt.x+gauss(rng)*.55*err,y:R,z:tgt.z+gauss(rng)*.55*err},late=gauss(rng)*.05*err;launch(from,aim,clamp(time+late,.45,1.9),spin);
  emit('touch',t,{team,actor:p.identity?.name,actorIndex:players.indexOf(p),kind:header?'header':jump?'volley-high':'volley',touch:touches,speedKmh:Math.round(hyp(b.vx,b.vy,b.vz)*3.6)});plan=null;}

 function point(win,reason){score[win]++;lastPoint={team:win,reason,at:t};emit('point',t,{team:win,reason,score:score.slice()});phase='point';pauseUntil=t+2.2;for(const p of players)if(p.team===win)p.celebrate={at:t};if(serveTeam!==win){serveTeam=win;serverSlot[win]++;}
  const lead=score[win]-score[1-win];if((score[win]>=target&&lead>=2)||score[win]>=cap){setScore[win]++;setLog.push(score.slice());emit('set',t,{team:win,score:score.slice(),sets:setScore.slice()});if(setScore[win]>=setsToWin){ended=true;winner=win;emit('finish',t+1.6,{winner:win,sets:setScore.slice()});}else{score[0]=score[1]=0;}}}

 function snap(){frames.push({t,ball:b?{x:b.x,y:b.y,z:b.z}:null,players:players.map(p=>{const k=p.kick,age=k?t-k.at:9,j=t-p.jumpAt,c=p.celebrate&&t-p.celebrate.at<2.2?t-p.celebrate.at:null;return{x:p.x,z:p.z,heading:p.heading,speed:p.speed,gait:p.gait,kicking:!!k&&!k.header&&age>-.22&&age<.3,kickPhase:k?clamp((age+.22)/.52,0,1):0,kickFoot:k?.foot,strikePoint:k&&!k.header?k.point:null,headingBall:!!k&&k.header&&age>-.18&&age<.25,jump:j>=0&&j<.55?Math.sin(j/.55*Math.PI)*p.jumpHeight:0,celebrate:c};}),score:score.slice(),sets:setScore.slice(),phase,serveTeam,possession,touches,lastPoint});}

 setUpServe();snap();
 for(let step=0;step<maxTime/DT&&!(ended&&t>=pauseUntil);step++){t+=DT;
  // movement toward targets
  for(const p of players){let tx=p.tx??p.x,tz=p.tz??p.z;const sgn=p.team?1:-1;if(phase==='play'&&plan&&plan.player===p){tx=plan.x-Math.sin(p.heading)*.25;tz=plan.z;}else if(phase==='play'){const h=homeX(p.team,p.slot);tx=h.x;tz=h.z;if(possession===p.team&&plan&&plan.team===p.team&&plan.player!==p){tx=h.x*.85;tz=h.z;}}
   tx=clamp(tx,sgn<0?-C.half-1.6:.35,sgn<0?-.35:C.half+1.6);tz=clamp(tz,-C.width/2-1.2,C.width/2+1.2);const dx=tx-p.x,dz=tz-p.z,d=hyp(dx,dz),max=6.6*(.85+.15*(p.skill-5)/4.5),want=d>.05?Math.min(max,d*4.2):0,ax=(dx/(d||1))*want-p.vx,az=(dz/(d||1))*want-p.vz,acc=Math.min(1,9*DT/Math.max(.01,hyp(ax,az)));p.vx+=ax*acc;p.vz+=az*acc;p.x+=p.vx*DT;p.z+=p.vz*DT;p.speed=hyp(p.vx,p.vz);p.gait+=p.speed*DT*1.9;
   const look=b?Math.atan2(b.x-p.x,b.z-p.z):p.heading;let dh=look-p.heading;while(dh>Math.PI)dh-=2*Math.PI;while(dh<-Math.PI)dh+=2*Math.PI;p.heading+=dh*Math.min(1,DT*7);}
  if(phase==='serve'){const p=b.held;if(p){b.x=p.x-(p.team?1:-1)*.32;b.z=p.z;b.y=R;}if(t>=pauseUntil&&p){/* drop-kick serve deep into the far court */const s=p.team?-1:1,tgt={x:s*(C.half*(.45+rng()*.45)),z:(rng()*2-1)*(C.width/2-1)},from={x:b.x,y:.45,z:b.z};let time=1.25+rng()*.35;for(let k=0;k<5&&!clears(from,tgt,time,null);k++)time+=.15;const err=clamp(1-(p.skill-5)/6,.35,1),aim={x:tgt.x+gauss(rng)*.6*err,y:R,z:tgt.z+gauss(rng)*.6*err};p.kick={at:t,foot:'right',point:{...from}};launch(from,aim,time,{x:0,y:0,z:s*5});b.held=null;phase='play';possession=p.team;touches=rule.touches;lastToucher=p;lastTeam=p.team;bounces=0;emit('serve',t,{team:p.team,actor:p.identity?.name,actorIndex:players.indexOf(p)});}snap();continue;}
  if(phase==='point'){if(b){const ev=A.step(b,DT/2);A.step(b,DT/2);}if(t>=pauseUntil&&!ended)setUpServe();if(Math.round(t/DT)%2===0)snap();continue;}
  // live ball
  const px=b.x;let bounced=false;for(let i=0;i<2;i++){const ev=A.step(b,DT/2);if(ev?.type==='ground')bounced=true;}
  // net: crossing below the tape rebounds off the mesh
  if(Math.sign(px)!==Math.sign(b.x)&&px!==0&&Math.abs(b.z)<=C.netHalf){if(b.y<NET+R*.5){b.x=Math.sign(px)*R;b.vx=-b.vx*.18;b.vz*=.6;b.vy=Math.min(b.vy,.4);netTouched=true;emit('net',t,{team:lastTeam});}else{possession=sideOf(b.x);touches=0;bounces=0;crossedAt=t;emit('cross',t,{to:possession});plan=null;}}
  else if(Math.sign(px)!==Math.sign(b.x)&&px!==0){possession=sideOf(b.x);touches=0;bounces=0;crossedAt=t;plan=null;}
  if(bounced){const side=sideOf(b.x),inside=inCourt(b.x,b.z,side);emit('bounce',t,{side,inside,x:b.x,z:b.z});
   if(!inside){/* out: if the last touch came from the other side, the receiver wins; otherwise the hitter's own error */point(lastTeam===side?1-side:side,lastTeam===side?'own-error':'out');snap();continue;}
   if(possession!==side){possession=side;touches=0;bounces=0;}bounces++;if(bounces>1){point(1-side,'double-bounce');snap();continue;}if(lastTeam===side&&touches>=rule.touches){point(1-side,'touches');snap();continue;}plan=null;}
  if(b.y<=R+.003&&Math.abs(b.vy)<.05&&t-crossedAt>.3){const side=sideOf(b.x);point(inCourt(b.x,b.z,side)?1-side:(lastTeam===side?1-side:side),'dead-ball');snap();continue;}
  if(Math.abs(b.x)>C.half+7||Math.abs(b.z)>C.width/2+7){point(lastTeam>=0?1-lastTeam:0,'out');snap();continue;}
  // who plays it
  if(!plan||plan.at<t-.05)replan();
  if(plan&&t>=plan.at-DT){const p=plan.player,d=hyp(b.x-p.x,b.z-p.z);if(d<1.25&&b.y>.08&&b.y<2.35){if(possession!==p.team){possession=p.team;touches=0;bounces=0;}if(touches>=rule.touches){point(1-p.team,'touches');snap();continue;}touch(p);}else if(t>plan.at+.12)plan=null;}
  if(Math.round(t/DT)%2===0)snap();}
 const duration=t+(ended?0:0),finaleAt=events.find(e=>e.type==='finish')?.at??t;
 function sample(time){time=clamp(time,0,frames.at(-1).t);let lo=0,hi=frames.length-1;while(lo<hi){const m=(lo+hi+1)>>1;if(frames[m].t<=time)lo=m;else hi=m-1;}const a=frames[lo],c=frames[Math.min(lo+1,frames.length-1)],u=c.t>a.t?clamp((time-a.t)/(c.t-a.t),0,1):0,mix=(x,y)=>x+(y-x)*u;
  return{...a,t:time,ball:a.ball&&c.ball?{x:mix(a.ball.x,c.ball.x),y:mix(a.ball.y,c.ball.y),z:mix(a.ball.z,c.ball.z)}:a.ball,players:a.players.map((p,i)=>{const q=c.players[i];let dh=q.heading-p.heading;while(dh>Math.PI)dh-=2*Math.PI;while(dh<-Math.PI)dh+=2*Math.PI;return{...p,x:mix(p.x,q.x),z:mix(p.z,q.z),heading:p.heading+dh*u,speed:mix(p.speed,q.speed),gait:mix(p.gait,q.gait)};})};}
 return{seed,perSide:n,court:C,rules:{touches:rule.touches,repeat:rule.repeat,bounces:1,target,sets,cap},sides,players:players.map(p=>({team:p.team,slot:p.slot,identity:p.identity})),events,frames,duration:frames.at(-1).t,finaleAt,winner,setLog,sets:setScore.slice(),score:score.slice(),sample,version:'footvolley-v1'};}
return{create,court,RULES,NET};});
