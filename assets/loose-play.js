/* Team reactions while a rebound, recovery and clearance are still live. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('./open-football-adapter.js'));else r.SekmeLoosePlay=f(r.Next90OpenFootball);})(typeof globalThis!=='undefined'?globalThis:this,function(OpenFootball){'use strict';
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),gap=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
 function targets(players,anchors,ball,{team,actor,owned=false,out=false,velocity={x:0,z:0}}){
  const active=players.filter(p=>!p.keeper&&!p.dismissed&&p.id!==actor),rank=[0,1].map(side=>active.filter(p=>p.team===side).sort((a,b)=>gap(a,ball)-gap(b,ball))),carrier=players[actor],ownerTeam=owned?carrier.team:null;
  const speed=Math.hypot(velocity.x,velocity.z),lead=ball.y<.20?OpenFootball.rollDistance(speed,.22)/Math.max(.001,speed):.22,bx=clamp(ball.x+velocity.x*lead,-50.5,51),bz=clamp(ball.z+velocity.z*lead,-32.5,32.5),initial=anchors.ball||ball,shiftX=bx-initial.x,shiftZ=bz-initial.z;
  return players.map(p=>{const home=anchors[p.id]||p,dir=p.team===team?1:-1,i=p.id%11,index=rank[p.team].findIndex(q=>q.id===p.id),side=Math.sign(home.z-bz)||((i%2)?1:-1);let q;
   if(p.keeper)q={x:dir>0?-49:50.2,z:clamp(bz*.10,-2.5,2.5)};
   else if(out)q={x:home.x+shiftX*.12,z:home.z+shiftZ*.12};
   else if(index<2&&ownerTeam!==p.team){
    // First player closes the carrier; the second shuts the adjacent passing lane.
    q={x:bx-dir*(index===0?(owned?1.05:.82):2.6),z:bz+(index===0?side*(owned?.65:.62):side*2.7)};
   }else if(index<3&&ownerTeam===p.team){
    // Offer a short, diagonal outlet, rather than bunching at the ball.
    q={x:bx-dir*(index===0?4.2:index===1?6.5:9),z:bz+(index%2?-1:1)*(index===2?9:5.2)};
   }else if(i<=4){
    const depth=dir>0?Math.min(bx-9,home.x+shiftX*.38):Math.max(bx+9,home.x+shiftX*.38);
    q={x:depth,z:home.z+shiftZ*.42};
    if(ownerTeam!==p.team){const threats=players.filter(a=>a.team!==p.team&&!a.keeper&&!a.dismissed).sort((a,b)=>gap(a,p)-gap(b,p)),mark=threats[0];if(mark){q.x=q.x*.72+(mark.x-dir*1.7)*.28;q.z=q.z*.72+mark.z*.28;}}
   }else q={x:home.x+shiftX*.48+(owned&&ownerTeam===p.team?dir*1.6:0),z:home.z+shiftZ*.50};
   return{x:clamp(q.x,-50.8,51.5),z:clamp(q.z,-33.2,33.2)};
  });
 }
 function step(players,aims,dt,{actor,protectedIds=[],time=0,contested=false}={}){
  const old=players.map(p=>({...p})),fixed=new Set([actor,...protectedIds]);
  for(const p of players){if(fixed.has(p.id))continue;const o=old[p.id];if(p.dismissed){p.vx=p.vz=p.speed=0;continue;}const q=aims[p.id];let vx=(q.x-o.x)*2.15,vz=(q.z-o.z)*2.15;
   for(const b of old){if(b.id===p.id||b.dismissed)continue;const d=gap(o,b),radius=fixed.has(b.id)?contested&&p.team!==b.team?.84:1.30:1.12;if(d<radius&&d>.001){const f=(radius-d)*8;vx+=(o.x-b.x)/d*f;vz+=(o.z-b.z)/d*f;}}
   const cap=p.keeper?4.4:6.15,mag=Math.hypot(vx,vz),f=Math.min(1,cap/Math.max(.001,mag));vx*=f;vz*=f;const ax=vx-o.vx,az=vz-o.vz,a=Math.hypot(ax,az),g=Math.min(1,8.5*dt/Math.max(.001,a));p.vx=o.vx+ax*g;p.vz=o.vz+az*g;p.x=clamp(o.x+p.vx*dt,-51,52);p.z=clamp(o.z+p.vz*dt,-33.7,33.7);
  }
  for(let pass=0;pass<3;pass++)for(let i=0;i<players.length;i++)for(let j=0;j<i;j++){const a=players[i],b=players[j];if(a.dismissed||b.dismissed||fixed.has(a.id)&&fixed.has(b.id))continue;const d=gap(a,b);if(d<.86){const nx=d>.0001?(a.x-b.x)/d:1,nz=d>.0001?(a.z-b.z)/d:0,push=Math.min(.86-d,1.5*dt),share=fixed.has(a.id)?0:fixed.has(b.id)?1:.5;a.x+=nx*push*share;a.z+=nz*push*share;b.x-=nx*push*(1-share);b.z-=nz*push*(1-share);}}
  for(const p of players){if(fixed.has(p.id))continue;const o=old[p.id];const dx=p.x-o.x,dz=p.z-o.z,d=Math.hypot(dx,dz),cap=(p.keeper?4.7:6.4)*dt;if(d>cap){p.x=o.x+dx/d*cap;p.z=o.z+dz/d*cap;}p.vx=(p.x-o.x)/dt;p.vz=(p.z-o.z)/dt;p.speed=Math.hypot(p.vx,p.vz);p.travel=(o.travel||0)+gap(o,p);const heading=p.speed>.25?Math.atan2(p.vx,p.vz):p.heading;p.heading=o.heading+clamp(Math.atan2(Math.sin(heading-o.heading),Math.cos(heading-o.heading)),-4.7*dt,4.7*dt);}
 }
 return{targets,step};
});
