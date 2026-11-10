/* Arena football decisions. Original code; coaching references in docs/ai/research.
 * Position/velocity evidence only: no authored goals or forced outcomes. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('./ball-aero.js'));else r.Next90JaponTactics=f(r.Next90BallAero);})(typeof globalThis!=='undefined'?globalThis:this,function(A){'use strict';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
function face(p,heading,dt,rate=4){const delta=Math.atan2(Math.sin(heading-p.heading),Math.cos(heading-p.heading));p.heading+=clamp(delta,-rate*dt,rate*dt);}
function move(p,target,speed,dt){
 const weight=1-Math.exp(-dt/Math.max(.10,p.keeper?.13:.18));p.steerX=(p.steerX??p.x)+(target.x-(p.steerX??p.x))*weight;p.steerZ=(p.steerZ??p.z)+(target.z-(p.steerZ??p.z))*weight;
 const dx=p.steerX-p.x,dz=p.steerZ-p.z,d=Math.hypot(dx,dz),angle=Math.atan2(dx,dz),turn=Math.abs(Math.atan2(Math.sin(angle-p.heading),Math.cos(angle-p.heading))),desired=d<.18?0:Math.min(speed,Math.sqrt(2*6*Math.max(0,d-.12)))*(p.jockey?1:clamp(1-turn*.26,.3,1)),vx=d?dx/d*desired:0,vz=d?dz/d*desired:0,change=Math.hypot(vx-(p.vx||0),vz-(p.vz||0)),accel=desired<(p.speed||0)?8:5.5,mix=change?Math.min(1,accel*dt/change):1;
 p.vx=(p.vx||0)+(vx-(p.vx||0))*mix;p.vz=(p.vz||0)+(vz-(p.vz||0))*mix;p.speed=Math.hypot(p.vx,p.vz);p.x+=p.vx*dt;p.z+=p.vz*dt;p.travel=(p.travel||0)+p.speed*dt;if(p.speed>.25&&!p.jockey&&!p.faceLocked)face(p,Math.atan2(p.vx,p.vz),dt,p.keeper?4:3.8);
}
function carryTarget(p,g,skill){const lateral=-p.x*g.nz+p.z*g.nx,depth=(g.x-p.x)*g.nx+(g.z-p.z)*g.nz,channel=clamp(lateral,-g.width*.46,g.width*.46),gate=depth>8?5.8:Math.max(4.2,depth-.7),offset=skill?skill.lateral*1.4:0;return{x:g.x-g.nx*gate-g.nz*(channel+offset),z:g.z-g.nz*gate+g.nx*(channel+offset)};}
function support(p,carrier,ownGoal,targetGoal,slot,players=[],time=0){
 const fx=targetGoal.nx,fz=targetGoal.nz,tx=-fz,tz=fx,depth=(carrier.x-ownGoal.x)*fx+(carrier.z-ownGoal.z)*fz,ballSide=carrier.x*tx+carrier.z*tz,role=p.role,forwardRun=role!=='defender'&&time<(p.followRunUntil||0)?2.4:0;
 const advance=role==='defender'?-4.6:role==='midfielder'?-1.1:3.3,line=clamp(depth+advance+forwardRun,role==='attacker'?8:role==='midfielder'?6:4.8,role==='defender'?ownGoal.radius:ownGoal.radius*2-4.6),width=role==='midfielder'?-4.1:role==='attacker'?3.7:2.9;
 const baseSide=clamp(width+ballSide*.20,-6,6),base={x:ownGoal.x+fx*line+tx*baseSide,z:ownGoal.z+fz*line+tz*baseSide};
 // A small lane adjustment opens an angle without dragging all support to the ball.
 let shift=0;for(const q of players){if(!q.active||q.team===p.team||q.keeper)continue;const d=dist(base,q);if(d<2.5)shift+=(baseSide-(-q.x*fz+q.z*fx)>=0?1:-1)*(2.5-d)*.5;}
 const side=clamp(shift,-1.3,1.3);return{x:base.x+tx*side,z:base.z+tz*side};
}
function defend(p,carrier,g,primary,slot,opponents=[]){const depth=(g.x-carrier.x)*g.nx+(g.z-carrier.z)*g.nz,lat=-carrier.x*g.nz+carrier.z*g.nx;
 if(primary){const dx=g.x-carrier.x,dz=g.z-carrier.z,d=Math.hypot(dx,dz)||1,gap=p.challengeActive?.62:1.25;return{x:carrier.x+dx/d*gap+(carrier.vx||0)*.12,z:carrier.z+dz/d*gap+(carrier.vz||0)*.12};}
 const threats=opponents.filter(q=>q.active&&!q.keeper&&q!==carrier).sort((a,b)=>dist(a,g)-dist(b,g)),mark=threats[slot%Math.max(1,threats.length)],line=clamp(depth*.48,2.5,8.2),side=(slot%2?1:-1)*2.6;
 let lateral=clamp(lat*.35+side,-5.7,5.7),cover=line;if(mark){const markedDepth=(g.x-mark.x)*g.nx+(g.z-mark.z)*g.nz;cover=clamp(line*.55+(markedDepth-1.3)*.45,1.6,Math.max(2,depth-1));lateral=lateral*.35+(-mark.x*g.nz+mark.z*g.nx)*.65;}
 return{x:g.x-g.nx*cover-g.nz*lateral,z:g.z-g.nz*cover+g.nx*lateral};
}
function avoid(p,target,players){let x=0,z=0;for(const q of players){if(q===p||!q.active)continue;const dx=p.x-q.x,dz=p.z-q.z,d=Math.hypot(dx,dz),futureX=dx+((p.vx||0)-(q.vx||0))*.28,futureZ=dz+((p.vz||0)-(q.vz||0))*.28,future=Math.hypot(futureX,futureZ),space=q.team===p.team?1.6:p.pressing&&q.controlled?.72:1.1;if(d>2.4||d<1e-5||Math.min(d,future)>space)continue;const amount=(space-Math.min(d,future))*(q.team===p.team?1.5:1);x+=dx/d*amount;z+=dz/d*amount;}const length=Math.hypot(x,z),scale=length>1.4?1.4/length:1;return{x:target.x+x*scale,z:target.z+z*scale};}
function keeperTarget(g,ball,threat,friendly){const depth=(g.x-ball.x)*g.nx+(g.z-ball.z)*g.nz,lat=-ball.x*g.nz+ball.z*g.nx,coming=ball.vx*g.nx+ball.vz*g.nz>1,reach=threat&&threat.time<1.2,step=reach?.65:friendly?1.15:clamp(1.35-depth*.035,.65,1.3);let lateral=lat*step/Math.max(2,depth);if(reach)lateral=threat.lateral;else if(!coming&&depth<6)lateral*=.3;lateral=clamp(lateral,-g.width*.40,g.width*.40);return{x:g.x-g.nx*step-g.nz*lateral,z:g.z-g.nz*step+g.nx*lateral,threat:!!reach};}
// Predict the observed free ball with the shared integrator and the same boards.
function threats(ball,layout){const b={...ball,continuousGround:true},out=Array(layout.count).fill(null),dt=1/60;if(Math.hypot(b.vx,b.vz)<2)return out;for(let t=dt;t<=1.2;t+=dt){const previous={x:b.x,z:b.z};A.step(b,dt);for(const g of layout.goals){const plane=g.radius-.7,old=previous.x*g.nx+previous.z*g.nz,now=b.x*g.nx+b.z*g.nz;if(old<plane&&now>=plane&&!out[g.team]&&b.y<g.height+.2){const lat=-b.x*g.nz+b.z*g.nx;if(Math.abs(lat)<g.width*.65)out[g.team]={time:t,lateral:lat,height:b.y};}}
 for(const e of layout.boundaries){const excess=b.x*e.nx+b.z*e.nz-e.d+.11,gap=layout.goals.some(g=>Math.abs(g.nx-e.nx)<1e-6&&Math.abs(g.nz-e.nz)<1e-6&&Math.abs(-b.x*g.nz+b.z*g.nx)<g.width/2-.11&&b.y<g.height-.11);if(excess>0&&!gap){b.x-=e.nx*excess;b.z-=e.nz*excess;const vn=b.vx*e.nx+b.vz*e.nz;if(vn>0){b.vx-=1.74*vn*e.nx;b.vz-=1.74*vn*e.nz;}}}if(layout.goals.some(g=>b.x*g.nx+b.z*g.nz>g.radius+.2))break;}
 return out;
}
function pressure(p,players,team){return players.filter(q=>q.active&&!q.keeper&&q.team!==team).reduce((sum,q)=>sum+Math.exp(-(dist(p,q)**2)/6),0);}
function choose(p,g,players,lane,rng){const distance=dist(p,g),blocked=lane(p,g,players,p.team),near=pressure(p,players,p.team),choices=players.filter(q=>q.active&&q.team===p.team&&q!==p&&dist(p,q)>2.5&&dist(p,q)<13).map(q=>{const progress=distance-dist(q,g),risk=lane(p,q,players,p.team),space=pressure(q,players,p.team);return{p:q,risk,progress,value:progress*.32+(near-space)*1.25-risk*3-(q.keeper?2.4:0)-dist(p,q)*.035+rng()*.16};}).filter(q=>q.risk<1.1).sort((a,b)=>b.value-a.value),pass=choices[0],shot=distance<10.5&&blocked<.65||distance<6.8;
 if(shot&&(!pass||pass.value<1.15||distance<6.5))return{kind:'shot'};if(pass&&(pass.value>.35&&pass.progress>.5||near>.9&&pass.value>.05||distance>14&&pass.progress>1&&pass.risk<.5))return{kind:'pass',receiver:pass.p};return{kind:'carry'};
}
function bank(from,to,layout,lane,players,team){let best;for(const e of layout.boundaries){if(layout.goals.some(g=>Math.abs(g.nx-e.nx)<1e-6&&Math.abs(g.nz-e.nz)<1e-6))continue;const d=e.d-.11,over=to.x*e.nx+to.z*e.nz-d,aim={x:to.x-2*over*e.nx,z:to.z-2*over*e.nz},vx=aim.x-from.x,vz=aim.z-from.z,den=vx*e.nx+vz*e.nz,u=(d-from.x*e.nx-from.z*e.nz)/den;if(!(u>.15&&u<.85))continue;const hit={x:from.x+vx*u,z:from.z+vz*u},length=dist(from,hit)+dist(hit,to),onBoard=layout.boundaries.every(edge=>hit.x*edge.nx+hit.z*edge.nz<=edge.d-.10+1e-6),cost=lane(from,hit,players,team)+lane(hit,to,players,team);if(onBoard&&length<16&&cost<.65&&(!best||cost<best.cost))best={aim,hit,cost,length};}return best;
}
return{face,move,carryTarget,support,defend,avoid,keeperTarget,threats,pressure,choose,bank};});
