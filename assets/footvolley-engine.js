/* V220 Football tennis (futnet) engine. Original Next90 implementation.
 * Court/net from UNIF futnet: net 1.10 m; court 12.8 × 9 m (1v1, 2v2) or 18 × 9 m (3v3).
 * House rules chosen by the user: one bounce on your side; 1v1 = one or two touches by the player;
 * 2v2 / 3v3 = every player at most ONE touch per possession (so 2 or 3 touches a side); first to the
 * chosen points (1–10) wins the set; first to the chosen sets (1–3) wins the match.
 * The ball is the shared aerodynamic ball (drag, Magnus, turf bounce). Players read the predicted flight
 * and pick a comfortable contact (volley, or after the one allowed bounce); first touches control or set,
 * the last touch attacks: volley, header, jumping smash at the net, lob or a short drop over the tape.
 * Execution error grows with incoming pace, awkward height, difficulty of the stroke and lower ability,
 * so points are won and lost physically (net, out, double bounce, not reached). Deterministic per seed.
 * Coordinates: x along the court (net at x = 0, side 0 at x < 0), y up, z across. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('./ball-aero.js'));else r.Next90Footvolley=f(r.Next90BallAero);})(typeof globalThis!=='undefined'?globalThis:this,function(A){'use strict';
const DT=1/120,NET=1.10,R=A.R||.11,G=9.81,clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),hyp=Math.hypot;
function random(seed){let s=(seed>>>0)||1;return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296;};}
function gauss(rng){let u=0,v=0;while(!u)u=rng();while(!v)v=rng();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
function court(perSide){const length=perSide>=3?18:12.8;return{length,width:9,half:length/2,netHeight:NET,netHalf:4.5,postZ:5.0};}
function rules(n){return n===1?{touches:2,repeat:true,once:false}:{touches:n,repeat:false,once:true};}
function ability(p){const r=Number(p?.rating);return clamp(Number.isFinite(r)?(r>10?r/10:r):6.8,5,9.5);}

function create(options={}){
 const sides=options.sides||[],n=clamp(Math.round(options.perSide||2),1,3);if(sides.length!==2||sides.some(s=>(s.players||[]).length<n))throw Error('Choose '+n+' player(s) for both sides');
 const seed=options.seed>>>0,rng=random(seed),C=court(n),rule=rules(n),target=clamp(Math.round(Number(options.points)||5),1,10),setsToWin=clamp(Math.round(Number(options.setsToWin??options.sets)||1),1,3),surface=['clear','rain','snow'].includes(options.weather)?options.weather:'clear',maxTime=Number(options.maxSeconds)||1200;
 const homeX=(team,k)=>{const s=team?1:-1,h=C.half;if(n===1)return{x:s*h*.55,z:0};if(n===2)return{x:s*h*(k?.62:.42),z:k?1.9:-1.9};return[{x:s*h*.24,z:-1.4},{x:s*h*.55,z:2.6},{x:s*h*.74,z:-2.2}][k];};
 const players=[];for(let team=0;team<2;team++)for(let k=0;k<n;k++){const h=homeX(team,k),id=sides[team].players[k];players.push({team,slot:k,identity:id,skill:ability(id),x:h.x,z:h.z,vx:0,vz:0,heading:team?-Math.PI/2:Math.PI/2,speed:0,gait:k*1.7,kick:null,jumpAt:-9,jumpHeight:0,celebrate:null,sad:null});}
 const events=[],frames=[],emit=(type,t,extra={})=>{const e={type,at:t,...extra};events.push(e);return e;};
 const score=[0,0],setScore=[0,0],setLog=[];let t=0,b=null,phase='serve',serveTeam=rng()<.5?0:1,serverSlot=[0,0],pauseUntil=0,kickAt=0,possession=-1,touches=0,bounces=0,touchedBy=new Set(),lastToucher=null,lastTeam=-1,plan=null,ended=false,winner=null,lastPoint=null,rallyKicks=0,crossedAt=0,lastTouch=null,lastBounce=null;

 function predict(state,limit=3){const q={...state},path=[];let tt=0,bounced=0;while(tt<limit){for(let i=0;i<2;i++){const ev=A.step(q,DT/2);if(ev?.type==='ground')bounced++;}tt+=DT;path.push({t:tt,x:q.x,y:q.y,z:q.z,vx:q.vx,vy:q.vy,vz:q.vz,bounced});if(bounced>=2||Math.abs(q.x)>C.half+6)break;}return path;}
 /* a ball that touches the 5 cm line is in (contact patch included) */const LINE=.08,inCourt=(x,z,team)=>Math.abs(z)<=C.width/2+LINE&&(team===0?x<=0&&x>=-C.half-LINE:x>=0&&x<=C.half+LINE);
 const sideOf=x=>x<0?0:1;
 function launch(from,to,time,spin){const v=A.solve({x:from.x,y:from.y,z:from.z},{x:to.x,y:to.y??R,z:to.z},time,spin,{surface});b=A.state({x:from.x,y:from.y,z:from.z},v,spin,{surface});}
 function clears(from,to,time,spin,margin=.08){const v=A.solve({x:from.x,y:from.y,z:from.z},{x:to.x,y:to.y??R,z:to.z},time,spin,{surface}),q=A.state({x:from.x,y:from.y,z:from.z},v,spin,{surface});let px=q.x;for(let i=0;i<Math.ceil(time/(DT/2))+2;i++){A.step(q,DT/2);if(Math.sign(px)!==Math.sign(q.x)&&px!==0)return q.y>NET+R+margin;px=q.x;}return true;}

 function newPossession(team){possession=team;touches=0;bounces=0;touchedBy=new Set();}
 function setUpServe(){phase='serve';newPossession(-1);lastToucher=null;lastTeam=-1;plan=null;rallyKicks=0;const team=serveTeam,slot=serverSlot[team]%n,p=players[team*n+slot],s=team?1:-1;
  for(const q of players){const h=homeX(q.team,q.slot);q.tx=h.x;q.tz=h.z;q.sad=null;}p.tx=s*(C.half+.5);p.tz=(rng()-.5)*2.6;pauseUntil=t+1.35;kickAt=pauseUntil+.42;b=A.state({x:p.tx-s*.32,y:1.02,z:p.tz},{x:0,y:0,z:0},null,{surface});b.held=p;}

 function canTouch(p){if(possession!==p.team)return true;if(touches>=rule.touches)return false;if(rule.once&&touchedBy.has(p))return false;return true;}
 function reach(p,q){/* reaction + accelerating run (same acceleration and top speed as the movement model); ≤ 0 means in time */const dx=q.x-p.x,dz=q.z-p.z,d=Math.max(0,hyp(dx,dz)-.55),vmax=6.7*(.86+.14*(p.skill-5)/4.5),a=9.5,v0=Math.max(0,d>0?(p.vx*dx+p.vz*dz)/hyp(dx,dz):0),d1=Math.max(0,(vmax*vmax-v0*v0)/(2*a)),run=d<=d1?(-v0+Math.sqrt(v0*v0+2*a*d))/a:(vmax-v0)/a+(d-d1)/vmax;return .14+run-q.t;}

 // Comfortable contact first: a knee/foot volley around 0.5–1.2 m or a header around 1.5–1.9 m; letting
 // the ball bounce once is used when the volley would be awkward. The best (not merely the first) reachable
 // contact within the next 0.9 s is chosen. Balls whose first bounce is out are left.
 function replan(){const path=predict(b);plan=null;const firstBounce=path.find(q=>q.bounced>=1);
  if(firstBounce){const side=sideOf(firstBounce.x),alreadyBounced=possession===side&&bounces>0;if(!alreadyBounced&&lastTeam!==side&&!inCourt(firstBounce.x,firstBounce.z,side)&&Math.abs(firstBounce.x)>.35)return null;}/* only an untouched, not-yet-bounced ball heading out is left alone */
  let best=null,firstOk=null;for(const q of path){const team=sideOf(q.x),same=team===possession;if((same?bounces:0)+q.bounced>1)break;if(q.y<.14||q.y>2.3)continue;if(q.vy>0&&q.y<.45&&q.bounced===0)continue;if(team===lastTeam&&touches>0&&q.t<.4)continue;if(firstOk&&q.t>firstOk+.9)break;
   for(const p of players){if(p.team!==team||!canTouch(p))continue;const late=reach(p,q);if(late>0)continue;firstOk??=q.t;const h=q.y,comfort=h<.25?1.2:h<.5?.45:h<1.25?0:h<1.45?.45:h<2?.08:.55,pace=hyp(q.vx,q.vy,q.vz)/25,wait=q.t*.18+q.bounced*.08,cost=comfort+pace+wait+(rng()*.06);if(!best||cost<best.cost)best={cost,team,player:p,at:t+q.t,x:q.x,y:q.y,z:q.z,bounced:q.bounced};}}
  if(best)plan=best;return plan;}

 /* V228: a real attacker aims inside the lines by a margin that matches how precisely he can strike this ball
 * (sigma = 0.55 x expected error), instead of always picking the spot right on the line farthest from the defenders. */
function attackTarget(team,kind,sigma=.5){const opp=players.filter(q=>q.team!==team),s=team?-1:1,m=rng()<.14?.2/* going for the line */:clamp(1.2*sigma,.4,1.5),zMax=Math.max(.6,C.width/2-m),xMax=Math.max(1.6,C.half-m);let best=null,bs=-Infinity;for(let i=0;i<16;i++){let x,z;if(kind==='drop'){x=s*(.7+rng()*1.4);z=(rng()*2-1)*Math.min(zMax,C.width/2-.6);}else if(kind==='lob'){x=s*Math.min(xMax,C.half-.5-rng()*1.6);z=(rng()*2-1)*zMax;}else{x=s*(1+rng()*(xMax-1));z=(rng()*2-1)*zMax;}const d=Math.min(...opp.map(o=>hyp(o.x-x,o.z-z)));const sc=d+rng()*.5;if(sc>bs){bs=sc;best={x,z};}}return best;}

 function touch(p){const team=p.team,contactH=b.y;if(possession!==team)newPossession(team);touches++;touchedBy.add(p);rallyKicks++;lastToucher=p;lastTeam=team;const left=rule.once?Math.min(rule.touches-touches,players.filter(q=>q.team===team&&!touchedBy.has(q)).length):rule.touches-touches,s=team?-1:1,speedIn=hyp(b.vx,b.vy,b.vz),nearNet=Math.abs(b.x)<2.3,header=contactH>1.3,foot=Math.sin(p.slot*2.3+rallyKicks*1.7)>0?'right':'left',from={x:b.x,y:b.y,z:b.z};
  const skill=(p.skill-5)/4.5,difficulty=clamp(speedIn/20,0,1)*.6+(contactH<.28?.28:0)+(header?.1:0),fatigue=1+rallyKicks/32;
  const teammates=players.filter(q=>q.team===team&&q!==p&&!touchedBy.has(q)),attack=left<=0||(n===1&&touches===1&&(speedIn<6.5&&contactH>.55&&contactH<1.7?rng()<.35:rng()<.15))||(n>1&&touches===1&&rng()<.08);
  let kind,move=null,aim,time,spin={x:0,y:0,z:0},err;
  if(!attack){/* control/set: singles pop the ball up to yourself; doubles pass to the partner; triples set high near the net for the attacker */
   const mate=n===1?p:(n===3&&touches===2?teammates[0]:teammates.sort((a,c)=>Math.abs(a.x)-Math.abs(c.x))[0])||p,setter=n===3&&touches===2,dest=setter?{x:-s*(1.0+rng()*.6),z:clamp(mate.z*.6,-3,3)}:n===1?{x:clamp(p.x+s*(.25+rng()*.4),-C.half+.5,C.half-.5),z:clamp(p.z+(rng()-.5)*.6,-C.width/2+.5,C.width/2-.5)}:{x:mate.x+s*.3,z:mate.z};
   if(Math.sign(dest.x)!==(team?1:-1))dest.x=(team?1:-1)*1.0;kind=n===1?(header?'header-control':'juggle'):setter?'set':header?'header-pass':'pass';
   /* V221 footvolley control moves: chest trap between waist and head height, thigh pop at knee-to-waist height */if(!header&&contactH>=1.0)move='chest';else if(contactH>=.5&&contactH<.85&&rng()<.45)move='thigh';if(move&&!setter)kind=move;time=n===1?.85+rng()*.2:setter?1.05+rng()*.2:.95+rng()*.25;err=clamp((.55-skill*.3+difficulty*.6+(move==='chest'?.06:0))*fatigue,.18,1.4);
   aim={x:dest.x+gauss(rng)*.32*err,y:setter?1.75:n===1?.95:1.05,z:dest.z+gauss(rng)*.32*err};launch(from,aim,time,spin);
   if(setter&&mate){mate.tx=dest.x;mate.tz=dest.z;}
  }else{
   kind=nearNet&&contactH>1.6&&rng()<(n===1?.45:.8)?'smash':!nearNet&&contactH>1.25&&contactH<2.1&&rng()<.16?'bicycle':header?'header':contactH<.35?'scoop':rng()<.14?'drop':rng()<.18?'lob':'volley';
   /* V221 footvolley strikes: the smash is a jumping side kick over the net ("pedalada"/shark attack) about half the time; the bicycle (makaslama) is struck with the back to the net */if(kind==='smash'&&rng()<.5)move='shark';if(kind==='bicycle')move='bicycle';
   const hard0={smash:.5,bicycle:.45,header:.15,scoop:.35,drop:.3,lob:.1,volley:0}[kind]||0,tgt=attackTarget(team,kind,.46*clamp((.85-skill*.55+difficulty*.9+hard0)*fatigue,.25,2.3));time=kind==='smash'?clamp(.32+hyp(tgt.x-from.x,tgt.z-from.z)/30,.32,.7):kind==='drop'?.85+rng()*.2:kind==='lob'?1.45+rng()*.35:kind==='scoop'?1.05+rng()*.3:clamp(.48+hyp(tgt.x-from.x,tgt.z-from.z)/17+(header?.12:0)+rng()*.22,.48,1.35);
   spin=kind==='lob'?{x:0,y:0,z:-s*6}:kind==='drop'?{x:0,y:0,z:-s*9}:{x:0,y:(rng()-.5)*4,z:s*(5+rng()*9)};
   for(let k=0;k<7&&!clears(from,tgt,time,spin,kind==='drop'?.06:.12);k++)time+=kind==='smash'?.06:.14;/* the clearance check flies the real spin (topspin dips) */
   const hard={smash:.5,bicycle:.45,header:.15,scoop:.35,drop:.3,lob:.1,volley:0}[kind];err=clamp((.85-skill*.55+difficulty*.9+hard)*fatigue,.25,2.3);
   aim={x:tgt.x+gauss(rng)*.46*err,y:R,z:tgt.z+gauss(rng)*.46*err};launch(from,aim,clamp(time+gauss(rng)*.04*err,.3,2.0),spin);}
  const label=move==='shark'?'shark':kind,jump=!move&&(contactH>1.72||kind==='smash');p.kick={at:t,foot,point:{...from},header:!move&&(header||kind==='smash'),move,away:move==='bicycle'?Math.atan2(-s,0):null};if(jump){p.jumpAt=t-.18;p.jumpHeight=clamp(contactH-1.55,.18,.62);}
  lastTouch={at:t,actor:players.indexOf(p),kind:label,team};patchBack(p);emit('touch',t,{team,actor:p.identity?.name,actorIndex:players.indexOf(p),kind:label,move,touch:touches,attack,speedKmh:Math.round(hyp(b.vx,b.vy,b.vz)*3.6),point:{...from}});plan=null;
  // teammates reposition: after a set the attacker attacks the ball, the others cover
  for(const q of players)if(q.team===team&&q!==p&&!touchedBy.has(q)&&!attack){/* moves on replan */}}

 function point(win,reason){score[win]++;lastPoint={team:win,reason,at:t,by:lastTouch};emit('point',t,{team:win,reason,score:score.slice()});phase='point';pauseUntil=t+2.3;for(const p of players){if(p.team===win)p.celebrate={at:t};else p.sad={at:t};}if(serveTeam!==win){serveTeam=win;serverSlot[win]++;}
  if(score[win]>=target){setScore[win]++;setLog.push(score.slice());emit('set',t,{team:win,score:score.slice(),sets:setScore.slice()});if(setScore[win]>=setsToWin){ended=true;winner=win;pauseUntil=t+3.4;emit('finish',t+1.4,{winner:win,sets:setScore.slice()});}else{score[0]=score[1]=0;pauseUntil=t+3.0;}}}

 /* Move timing (lead before contact, total length). Contact happens at lead/total of the move phase. */
 const MOVES={bicycle:[.4,1.0],shark:[.3,.72],chest:[.24,.62],thigh:[.2,.52]};
 function pose(p,time,heading){const k=p.kick,age=k?time-k.at:9,j=time-p.jumpAt,c=p.celebrate&&time-p.celebrate.at<2.3?time-p.celebrate.at:null,sd=p.sad&&time-p.sad.at<2.0?time-p.sad.at:null,m=k?.move?MOVES[k.move]:null,inMove=!!m&&age>-m[0]&&age<m[1]-m[0];
  let h=heading;if(inMove&&k.away!=null){/* turn the back to the net for the bicycle */let d=k.away-h;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;const w=clamp((age+m[0])/.22,0,1)*clamp((m[1]-m[0]-age)/.25,0,1);h+=d*w*w*(3-2*w);}
  return{heading:h,kicking:!m&&!!k&&!k.header&&age>-.22&&age<.3,kickPhase:k?clamp((age+.22)/.52,0,1):0,kickFoot:k?.foot,strikePoint:k&&!k.header&&!m?k.point:null,headingBall:!m&&!!k&&k.header&&age>-.2&&age<.28,jump:j>=0&&j<.62?Math.sin(j/.62*Math.PI)*p.jumpHeight:0,move:inMove?k.move:null,movePhase:inMove?clamp((age+m[0])/m[1],0,1):0,celebrate:c,sad:sd};}
 /* frames are written as the rally runs, so the wind-up before a contact is drawn by re-posing the striker in the frames just before it */
 function patchBack(p){const i=players.indexOf(p),lead=p.kick.move?MOVES[p.kick.move][0]:.22,jumpLead=p.jumpAt>t-1?t-p.jumpAt:0;for(let f=frames.length-1;f>=0&&frames[f].t>=t-Math.max(lead,jumpLead)-.02;f--){const q=frames[f].players[i];Object.assign(q,pose(p,frames[f].t,q.heading),{celebrate:q.celebrate,sad:q.sad});}}
 function snap(){frames.push({t,ball:b?{x:b.x,y:b.y,z:b.z}:null,players:players.map(p=>({x:p.x,z:p.z,speed:p.speed,gait:p.gait,...pose(p,t,p.heading)})),score:score.slice(),sets:setScore.slice(),phase,serveTeam,possession,touches,lastPoint,lastTouch,lastBounce});}

 setUpServe();snap();
 for(let step=0;step<maxTime/DT&&!(ended&&t>=pauseUntil);step++){t+=DT;
  for(const p of players){let tx=p.tx??p.x,tz=p.tz??p.z;const sgn=p.team?1:-1;if(phase==='play'){if(plan&&plan.player===p){const back=plan.bounced?.35:.28;tx=plan.x-Math.sin(p.heading)*back;tz=plan.z-Math.cos(p.heading)*back*.4;}else{const h=homeX(p.team,p.slot);tx=h.x;tz=h.z;if(possession===p.team&&canTouch(p)&&plan&&plan.team===p.team&&plan.player!==p){/* offer for the next touch: step toward the ball's side */tx=h.x*.8;tz=h.z*.8+plan.z*.2;}if(possession!==p.team&&b){/* defending: shade toward where the attack can go */tz=h.z*.85+clamp(b.z,-3,3)*.15;}}}
   if(!(plan&&plan.player===p))for(const q of players)if(q!==p&&q.team===p.team){/* V221 partners keep apart instead of stacking on the same spot */const ex=p.x-q.x,ez=p.z-q.z,e=hyp(ex,ez);if(e<1.7){const ux=e>.01?ex/e:0,uz=e>.01?ez/e:(p.slot<q.slot?-1:1);tx+=ux*(1.7-e)*1.4;tz+=uz*(1.7-e)*1.4;}}
   tx=clamp(tx,sgn<0?-C.half-1.8:.3,sgn<0?-.3:C.half+1.8);tz=clamp(tz,-C.width/2-1.3,C.width/2+1.3);const dx=tx-p.x,dz=tz-p.z,d=hyp(dx,dz),max=6.7*(.86+.14*(p.skill-5)/4.5),want=d>.04?Math.min(max,d*4.4):0,ax=(dx/(d||1))*want-p.vx,az=(dz/(d||1))*want-p.vz,acc=Math.min(1,9.5*DT/Math.max(.01,hyp(ax,az)));p.vx+=ax*acc;p.vz+=az*acc;p.x+=p.vx*DT;p.z+=p.vz*DT;p.speed=hyp(p.vx,p.vz);p.gait+=p.speed*DT;/* metres: the renderer turns distance into steps (was 1.9x, legs spun too fast) */
   const look=b?Math.atan2(b.x-p.x,b.z-p.z):p.heading;let dh=look-p.heading;while(dh>Math.PI)dh-=2*Math.PI;while(dh<-Math.PI)dh+=2*Math.PI;p.heading+=dh*Math.min(1,DT*7.5);}
  if(phase==='serve'){const p=b.held;if(p){const s=p.team?1:-1;b.x=p.x-s*.32;b.z=p.z;if(t<pauseUntil)b.y=1.02;else{const age=t-pauseUntil;b.y=Math.max(.42,1.02-.5*G*age*age);}}
   if(t>=kickAt&&p){/* dropped from the hands and struck on the way down, deep into the far court */const s=p.team?-1:1,tgt={x:s*(C.half*(.45+rng()*.45)),z:(rng()*2-1)*(C.width/2-1)},from={x:b.x,y:b.y,z:b.z};const serveSpin={x:0,y:0,z:s*6};let time=1.2+rng()*.35;for(let k=0;k<6&&!clears(from,tgt,time,serveSpin,.3);k++)time+=.15;const err=clamp(.85-(p.skill-5)/6,.3,.9),aim={x:tgt.x+gauss(rng)*.6*err,y:R,z:tgt.z+gauss(rng)*.6*err};p.kick={at:t,foot:'right',point:{...from}};launch(from,aim,time,serveSpin);b.held=null;phase='play';newPossession(p.team);touches=rule.touches;touchedBy=new Set(players.filter(q=>q.team===p.team));lastToucher=p;lastTeam=p.team;lastTouch={at:t,actor:players.indexOf(p),kind:'serve',team:p.team};emit('serve',t,{team:p.team,actor:p.identity?.name,actorIndex:players.indexOf(p)});}snap();continue;}
  if(phase==='point'){if(b){A.step(b,DT/2);A.step(b,DT/2);}if(t>=pauseUntil&&!ended)setUpServe();if(Math.round(t/DT)%2===0)snap();continue;}
  const px=b.x;let bounced=false;for(let i=0;i<2;i++){const ev=A.step(b,DT/2);if(ev?.type==='ground')bounced=true;}
  if(Math.sign(px)!==Math.sign(b.x)&&px!==0&&Math.abs(b.z)<=C.netHalf+.5){if(b.y<NET+R*.9&&b.y>NET-R*.4&&Math.abs(b.z)<=C.postZ&&rng()<.5){/* V228 net cord: clipping the tape, the ball dies and trickles over */b.x=Math.sign(b.x)*R;b.vx*=.28;b.vz*=.6;b.vy=.8+rng()*1.4;newPossession(sideOf(b.x));crossedAt=t;emit('cross',t,{to:possession,netcord:true});plan=null;}else if(b.y<NET+R*.5&&Math.abs(b.z)<=C.postZ){/* net: the mesh absorbs most of the pace */b.x=Math.sign(px)*R;b.vx=-b.vx*.16;b.vz*=.55;b.vy=Math.min(b.vy,.3);emit('net',t,{team:lastTeam});}else{newPossession(sideOf(b.x));crossedAt=t;emit('cross',t,{to:possession});plan=null;}}
  else if(Math.sign(px)!==Math.sign(b.x)&&px!==0){newPossession(sideOf(b.x));crossedAt=t;plan=null;}
  if(bounced){const side=sideOf(b.x),inside=inCourt(b.x,b.z,side);lastBounce={at:t,x:b.x,z:b.z,inside};emit('bounce',t,{side,inside,x:b.x,z:b.z});
   if(!inside&&possession===side&&bounces>=1){point(1-side,'double-bounce');snap();continue;}/* bounced in once, then out: the receiver failed to play it */
   if(!inside){point(lastTeam===side?1-side:side,lastTeam===side?'own-error':'out');snap();continue;}
   if(possession!==side)newPossession(side);bounces++;if(bounces>1){point(1-side,'double-bounce');snap();continue;}if(lastTeam===side&&touches>=rule.touches){point(1-side,'touches');snap();continue;}plan=null;}
  if(b.y<=R+.003&&Math.abs(b.vy)<.05&&t-crossedAt>.3){const side=sideOf(b.x);point(inCourt(b.x,b.z,side)?1-side:(lastTeam===side?1-side:side),'dead-ball');snap();continue;}
  if(Math.abs(b.x)>C.half+7||Math.abs(b.z)>C.width/2+7){point(lastTeam>=0?1-lastTeam:0,'out');snap();continue;}
  if(!plan||plan.at<t-.05)replan();
  if(plan&&t>=plan.at-DT){const p=plan.player,d=hyp(b.x-p.x,b.z-p.z);if(d<1.25&&b.y>.08&&b.y<2.4&&canTouch(p))touch(p);else if(t>plan.at+.12)plan=null;}
  if(Math.round(t/DT)%2===0)snap();}
 const finaleAt=events.find(e=>e.type==='finish')?.at??t;
 function sample(time){time=clamp(time,0,frames.at(-1).t);let lo=0,hi=frames.length-1;while(lo<hi){const m=(lo+hi+1)>>1;if(frames[m].t<=time)lo=m;else hi=m-1;}const a=frames[lo],c=frames[Math.min(lo+1,frames.length-1)],u=c.t>a.t?clamp((time-a.t)/(c.t-a.t),0,1):0,mix=(x,y)=>x+(y-x)*u;
  return{...a,t:time,ball:a.ball&&c.ball?{x:mix(a.ball.x,c.ball.x),y:mix(a.ball.y,c.ball.y),z:mix(a.ball.z,c.ball.z)}:a.ball,players:a.players.map((p,i)=>{const q=c.players[i];let dh=q.heading-p.heading;while(dh>Math.PI)dh-=2*Math.PI;while(dh<-Math.PI)dh+=2*Math.PI;return{...p,x:mix(p.x,q.x),z:mix(p.z,q.z),heading:p.heading+dh*u,speed:mix(p.speed,q.speed),gait:mix(p.gait,q.gait)};})};}
 return{seed,perSide:n,court:C,rules:{touches:rule.touches,once:rule.once,bounces:1,target,setsToWin},sides,players:players.map(p=>({team:p.team,slot:p.slot,identity:p.identity})),events,frames,duration:frames.at(-1).t,finaleAt,winner,setLog,sets:setScore.slice(),score:score.slice(),sample,version:'footvolley-v2'};}
return{create,court,rules,NET};});
