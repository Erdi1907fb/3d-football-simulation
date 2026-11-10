/*
 * Selected algorithms ported and modified from ZOXEXIVO/open-football.
 * Copyright Open Football contributors. Apache-2.0; see vendor/open-football/.
 * Upstream 9bb183af844980ff0c398597868b635aff191674.
 * Changes: Rust -> JavaScript, native units -> metres, centered X/Z pitch,
 * stateless geometry API. This is not the complete Open Football match engine.
 */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f();else r.Next90OpenFootball=f();})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
function unit(v){const n=Math.hypot(v.x,v.z);return n>.01?{x:v.x/n,z:v.z/n}:null;}
function supportOffer(player,carrier,opponents,goal={x:52.5,z:0}){
 const own=unit({x:player.x-carrier.x,z:player.z-carrier.z});if(!own)return null;
 let presser=null,nearest=Infinity;for(const p of opponents){const d=distance(p,carrier);if(d<nearest){presser=p;nearest=d;}}
 const shadow=presser&&unit({x:carrier.x-presser.x,z:carrier.z-presser.z})||own,
 forward=unit({x:goal.x-carrier.x,z:goal.z-carrier.z})||own,
 dir=unit({x:.62*own.x+.26*shadow.x+.12*forward.x,z:.62*own.z+.26*shadow.z+.12*forward.z})||own;
 const near=9.5,far=20,held=clamp(distance(player,carrier),near,far),settled=near+(far-near)*.45,
 pressure=presser?clamp(1-nearest/5.5,0,1):0,want=settled+(near-settled)*pressure,
 radius=clamp(.45*held+.55*want,near,far);
 return{x:clamp(carrier.x+dir.x*radius,-50,50),z:clamp(carrier.z+dir.z*radius,-31.5,31.5)};
}
function passSafety(holder,target,opponents,ownGoal={x:-52.5,z:0}){
 const pass=unit({x:target.x-holder.x,z:target.z-holder.z}),goal=unit({x:ownGoal.x-holder.x,z:ownGoal.z-holder.z});
 if(!pass)return -Infinity;
 const away=goal?-(pass.x*goal.x+pass.z*goal.z):0;
 const markers=opponents.filter(p=>distance(p,target)<2.5).length;
 return away+1-Math.min(markers*.2,.8);
}
// v94: additional selected ports; mappings and changes are in OPEN-FOOTBALL-v94.md.
const dot=(a,b)=>a.x*b.x+a.z*b.z,sub=(a,b)=>({x:a.x-b.x,z:a.z-b.z}),
 pitch=q=>({x:clamp(q.x,-50,50),z:clamp(q.z,-32,32)}),
 skill=(p,k,f=.6)=>clamp(p?.[k]??f,0,1);
function pressureIntensity(p,opponents){let close=0,medium=0,far=0;for(const o of opponents){const d=distance(p,o);if(d<=3.75){far++;if(d<=2.5)medium++;if(d<=1.25)close++;}}return Math.min(1,(close*.5+medium*.3+far*.2)/3);}
function counterpressScore(p,ball,profile,condition=1){return (1-clamp(distance(p,ball)/15,0,1))*.45+skill(profile,'stamina')*.25+skill(profile,'defending')*.15+condition*.15;}
function phase(possession,ballX,since=Infinity,patience=.5,press=.5){
 const zone=ballX< -17.5?'defensive':ballX>17.5?'attacking':'middle';
 if(possession){if(since<2.5+1.5*patience)return 'attackingTransition';return zone==='defensive'?'buildUp':zone==='middle'?'progression':'attack';}
 if(since<2.2+2.8*press)return 'defensiveTransition';
 if(press>.62&&zone!=='defensive')return 'highPress';return zone==='defensive'?'lowBlock':'midBlock';
}
function pursuit(p,target,velocity,pace){const d=sub(target,p),n=Math.hypot(d.x,d.z);if(n<.125)return {...target};const u={x:d.x/n,z:d.z/n},closing=Math.max(pace-dot(velocity,u),pace*.25+.0001);
 // Upstream's 0.1..5 ticks are 1..50 ms. Deliberately calibrated to a
 // 50..350 ms anticipation window here; no quadratic-root branch flicker.
 const time=clamp(n/closing,.05,.35);return pitch({x:target.x+velocity.x*time,z:target.z+velocity.z*time});}
function arrive(p,target,pace,slowing=1.25){const d=sub(target,p),n=Math.hypot(d.x,d.z);if(n<.12)return{x:0,z:0};const ratio=clamp(n/Math.max(.375,slowing),0,1),speed=pace*ratio*ratio;return{x:d.x/n*speed,z:d.z/n*speed};}
function defensivePlan(defenders,attackers,ball,profiles,phases,previous,{press=.5,condition=[]}={}){
 const active=defenders.filter(p=>!p.keeper&&!p.dismissed),duties={},goal={x:52.5,z:0},axis=unit(sub(goal,ball))||{x:1,z:0};
 const ranked=active.slice().sort((a,b)=>distance(a,ball)-distance(b,ball)||a.id-b.id);
 if(!ranked.length)return{duties,primary:null,cover:null};
 let primary=ranked[0];const prior=ranked.find(p=>p.id===previous);if(prior&&distance(prior,ball)<distance(primary,ball)+1.1)primary=prior;
 const cover=ranked.find(p=>p.id!==primary.id&&distance(p,ball)<17.5);
 duties[primary.id]={mode:'primary',target:pitch({x:ball.x+axis.x*.75,z:ball.z+axis.z*.75})};
 if(cover)duties[cover.id]={mode:'cover',target:pitch({x:ball.x+axis.x*4.2,z:ball.z+axis.z*4.2-Math.sign(primary.z-ball.z||1)*2.2})};
 const marked=new Set(),threats=attackers.filter(p=>!p.keeper&&!p.dismissed&&distance(p,ball)>1.1).sort((a,b)=>{
  const danger=p=>105-distance(p,goal)+(Math.hypot(p.vx,p.vz)>5&&dot(unit({x:p.vx,z:p.vz})||axis,unit(sub(goal,p))||axis)>.5?8:0);
  return danger(b)-danger(a)||a.id-b.id;
 });
 for(const d of ranked){if(duties[d.id])continue;const role=profiles[d.id]?.role;
  const threat=threats.filter(a=>!marked.has(a.id)&&distance(a,d)<17.5).sort((a,b)=>distance(a,d)-distance(b,d)||a.id-b.id)[0];
  if(threat&&['CB','LB','RB','DM','CM'].includes(role)){marked.add(threat.id);const toGoal=unit(sub(goal,threat))||axis;duties[d.id]={mode:'trackRunner',mark:threat.id,target:pitch({x:threat.x+toGoal.x*1.5,z:threat.z+toGoal.z*1.5})};}
  else duties[d.id]={mode:'hold'};
 }
 // Only one extra nearby worker counter-presses; everyone else recovers/marks.
 if(phases==='defensiveTransition'&&press>=.20){
  const extra=ranked.filter(p=>p.id!==primary.id&&p.id!==cover?.id&&!['CB'].includes(profiles[p.id]?.role)&&counterpressScore(p,ball,profiles[p.id],condition[p.id]??1)>.55).slice(0,1);
  for(const d of extra)duties[d.id]={mode:'counterpress',target:pitch({x:ball.x+axis.x*1.2,z:ball.z-Math.sign(primary.z-ball.z||1)*2})};
 }
 return{duties,primary:primary.id,cover:cover?.id??null};
}
function evadeMarker(player,base,ball,opponents,profile,profiles,time){
 const goal={x:52.5,z:0},toGoal=unit(sub(goal,player));if(!toGoal)return base;
 const marker=opponents.filter(o=>!o.keeper&&!o.dismissed&&distance(player,o)>.01&&distance(player,o)<7.5).filter(o=>distance(player,o)<=2||dot(unit(sub(o,player)),toGoal)>=.15).sort((a,b)=>distance(a,player)-distance(b,player)||a.id-b.id)[0];if(!marker)return base;
 const delta=unit(sub(marker,player)),toBall=unit(sub(ball,marker))||delta,across={x:-delta.z,z:delta.x},sign=dot(across,toBall)>0?-1:1,
 second=opponents.filter(o=>o.id!==marker.id&&!o.keeper&&distance(player,o)<15).sort((a,b)=>distance(a,player)-distance(b,player))[0],
 seam=second?unit({x:(marker.x+second.x)/2-player.x,z:(marker.z+second.z)/2-player.z})||{x:0,z:0}:{x:0,z:0},
 mover=.45*skill(profile,'control')+.32*clamp((profile?.acceleration||8)/12,0,1)+.23*skill(profile,'control'),holder=profiles[marker.id],
 hold=.35*skill(holder,'defending')+.30*skill(holder,'defending')+.20*skill(holder,'defending')+.15*skill(holder,'stamina'),edge=clamp(.5+(mover-hold)*.5,.05,.95),
 tight=clamp(1-distance(player,marker)/7.5,0,1),cycle=(time/2.4+(player.id%13)/13)%1,checking=cycle<.35,
 toward=unit(sub(ball,player))||across,check=checking?1:-.35/.65,effort=tight*edge*8;
 return pitch({x:base.x+(.32*across.x*sign+.20*seam.x+.48*toward.x*check)*effort,z:base.z+(.32*across.z*sign+.20*seam.z+.48*toward.z*check)*effort});
}
function dribbleSpace(p,opponents,base){const goal=unit(sub({x:52.5,z:0},p));if(!goal)return null;let best=null;
 for(const degrees of[-45,-30,0,30,45]){const a=degrees*Math.PI/180,d={x:goal.x*Math.cos(a)-goal.z*Math.sin(a),z:goal.x*Math.sin(a)+goal.z*Math.cos(a)};
  if(opponents.some(o=>{const n=distance(p,o);return n<2.5&&n>.01&&dot(unit(sub(o,p)),d)>.7;}))continue;
  const q=pitch({x:p.x+d.x*1.875,z:p.z+d.z*1.875}),v=dot(goal,d)-distance(q,base)*.08;
  if(!best||v>best.value)best={...q,value:v};
 }return best;
}
function duelEstimate(a,d,ctx={}){
 const control=skill(a,'control'),agility=control,accel=clamp((a?.acceleration||8)/12,0,1),def=skill(d,'defending'),strength=skill(d,'strength');
 // Original weights; unavailable FM mental skills use explicitly documented
 // role defaults, not invented observed ratings or downloaded FM player data.
 let attacker=control*.26+control*.18+control*.10+agility*.14+accel*.10+skill(a,'strength')*.08+control*.06+skill(a,'passing')*.05;
 let defender=def*.22+def*.18+def*.16+def*.10+strength*.08+strength*.08+skill(d,'control')*.08+skill(d,'stamina')*.06;
 if(ctx.running)attacker+=accel>=.65?.04:-.03;if(ctx.wide)attacker+=.08;if(ctx.squared)defender+=.07;if(ctx.cover)defender+=.12;
 return clamp(1/(1+Math.exp(-(attacker-defender)*2.4)),.12,.88);
}
function passPace(metres){return clamp(.55+metres*8*.0028,.5,2.2)*12.5;}
function throughBall(from,runner,opponents,pace=6,passing=.7){
 const goal={x:52.5,z:0},range=distance(from,runner);if(range<9||range>45||distance(runner,goal)>=distance(from,goal))return null;
 const line=opponents.filter(o=>!o.dismissed).map(o=>o.x).sort((a,b)=>b-a)[1]??52.5;
 if(runner.x>Math.max(from.x,line)+.03&&runner.x>0)return null;
 const toward=unit(sub(goal,runner)),speed=Math.hypot(runner.vx||0,runner.vz||0),w=clamp(speed/1.5,0,1),v=speed>.001?{x:runner.vx/speed,z:runner.vz/speed}:toward,
 direction=unit({x:v.x*w+toward.x*(1-w),z:v.z*w+toward.z*(1-w)});if(!direction||dot(direction,toward)<.30)return null;
 let aim=runner;const runSpeed=clamp(pace,3.75,5.75);for(let i=0;i<2;i++){const flight=distance(from,aim)/passPace(distance(from,aim)),lead=clamp(runSpeed*flight,5,22);aim={x:runner.x+direction.x*lead,z:runner.z+direction.z*lead};}
 aim={x:clamp(aim.x,-49.5,49.5),z:clamp(aim.z,-31,31)};
 if(distance(runner,goal)-distance(aim,goal)<6)return null;
 if(opponents.some(o=>o.keeper&&distance(o,aim)<9))return null;
 const race=distance(runner,aim)/runSpeed,field=opponents.filter(o=>!o.keeper&&!o.dismissed);
 if(field.some(o=>race>distance(o,aim)/5.75-.33))return null;
 const lane=sub(aim,from),len=Math.hypot(lane.x,lane.z),axis=unit(lane),corridor=2.6*(1-passing*.45);
 if(field.some(o=>{const offset=sub(o,from),along=dot(offset,axis);return along>0&&along<len&&Math.hypot(offset.x-axis.x*along,offset.z-axis.z*along)<corridor*(1+along/len*.35);}))return null;
 const gained=clamp((distance(from,goal)-distance(aim,goal))/(105*.45),0,1),removed=clamp(field.filter(o=>distance(o,goal)<distance(from,goal)&&distance(o,goal)>distance(aim,goal)).length/4,0,1),room=1/(1+field.filter(o=>distance(o,aim)<8).length),arrival=1-clamp(distance(aim,goal)/(105*.32),0,1);
 return{...aim,value:clamp(gained*.34+removed*.26+room*.22+arrival*.18,0,1),kind:aim.x>line?'inBehind':'intoSpace'};
}
const ROLL_K=-Math.log(1-.0016)/.01,STOP=.10,AIR_K=-Math.log(1-.04*.016/.43)/.01;
function rollRange(speed){return Math.max(0,(speed-STOP)/ROLL_K);}
function rollDistance(speed,time){return Math.min(rollRange(speed),Math.max(0,speed*(1-Math.exp(-ROLL_K*Math.max(0,time)))/ROLL_K));}
function passFlight(a,b,u,duration,arc=0,spin=0){u=clamp(u,0,1);const T=Math.max(.01,duration),t=T*u,k=arc>1?AIR_K:ROLL_K,q=-Math.expm1(-k*t)/-Math.expm1(-k*T);let y;
 if(arc>1){const g=9.81,v0=k*(b.y-a.y+g*T/k)/-Math.expm1(-k*T)-g/k;y=a.y+(v0+g/k)*-Math.expm1(-k*t)/k-g*t/k;}
 else y=a.y+(b.y-a.y)*u+4*Math.max(0,arc)*u*(1-u);
 return{x:a.x+(b.x-a.x)*q,z:a.z+(b.z-a.z)*q+spin*Math.sin(Math.PI*u),y:Math.max(.11,y)};
}
function panel(over,speed,give,dt,elastic=false){give=Math.max(.001,give);if(elastic){speed+=(-170*over-12*speed)*dt;if(over>give){over=give;if(speed>0)speed*=-.08;}return{over,speed};}const stretch=clamp(over/give,0,1),drag=speed>0?.10+(.95-.10)*stretch*stretch:.03;
 speed*=Math.pow(1-drag,dt/.01);speed-=1.2*stretch*stretch*dt;if(over>give){over=give;if(speed>0)speed=0;}return{over,speed};}
function containNet(b,dt=1/120){
 if(b.x<52.5)return;const slack=h=>{const t=clamp(h/2.44,0,1);return 4*t*(1-t);};let contact=false;
 const back=54.49,side=3.55,roof=2.33;
 if(b.x>back){const p=panel(b.x-back,b.vx,.32*slack(b.y),dt,b.netElastic);b.x=back+p.over;b.vx=p.speed;contact=true;}
 if(Math.abs(b.z)>side){const sign=Math.sign(b.z),p=panel(Math.abs(b.z)-side,b.vz*sign,.20*slack(b.y),dt,b.netElastic);b.z=sign*(side+p.over);b.vz=sign*p.speed;contact=true;}
 if(b.y>roof){const p=panel(b.y-roof,b.vy,.16,dt,b.netElastic);b.y=roof+p.over;b.vy=p.speed;contact=true;}
 if(contact||b.x>back-.025||Math.abs(b.z)>side-.025||b.y>roof-.025){const damp=Math.pow(b.netElastic?.985:.75,dt/.01);b.vx*=damp;b.vz*=damp;b.spin=(b.spin||0)*damp;}
}
function blockContact(previous,ball,defender,reach=.49,ceiling=1.75){const v=sub(ball,previous),n=v.x*v.x+v.z*v.z;if(n<1e-12)return null;
 const raw=dot(sub(defender,previous),v)/n;if(raw<0||raw>1)return null;const q=raw,p={x:previous.x+v.x*q,z:previous.z+v.z*q,y:previous.y+(ball.y-previous.y)*q};return p.y<=ceiling&&distance(p,defender)<=reach?{...p,fraction:q}:null;
}
return Object.freeze({supportOffer,passSafety,pressureIntensity,counterpressScore,phase,defensivePlan,evadeMarker,dribbleSpace,duelEstimate,throughBall,passPace,pursuit,arrive,rollDistance,rollRange,passFlight,containNet,blockContact,version:'open-football-port-2',upstream:'9bb183af844980ff0c398597868b635aff191674'});
});
