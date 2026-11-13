/* V108 shared ball aerodynamics (normal match, Penalty Studio, Free Kick Studio).
 * Deterministic metre/second model. References: drag-crisis and Magnus
 * lift models summarised by the Ball3D research project (lukaszgrad/ball3d),
 * Asai et al. (2007) knuckle-ball wind-tunnel data, Goff & Carré (2009).
 * Coordinates: x toward the attacked goal (goal line x=52.5), y up, z right
 * when facing +x. Goal mouth |z|<3.66, y<2.44. Ball radius 0.11 m.
 */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f();else r.Next90BallAero=f();})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const R=.11,MASS=.43,RHO=1.2,AREA=Math.PI*R*R,G=9.81,STEP=1/240,GOAL_X=52.5,POST_Z=3.66,BAR_Y=2.44,POST_R=.06;
const K=.5*RHO*AREA/MASS,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// Drag coefficient with the smooth drag crisis of a modern 26-panel ball
// (≈0.45 below 10 m/s, ≈0.22 above 16 m/s).
function dragCoefficient(speed,knuckle=false){const t=clamp((speed-9)/8,0,1),cd=.45+(.22-.45)*(t*t*(3-2*t));return knuckle?cd+.04:cd;}
// Lift coefficient from spin parameter S=rω/v (bounded empirical fit).
function liftCoefficient(S){S=Math.max(0,S);return clamp(S/(2.02*S+.42),0,.34);}
function knuckleForce(t,seed,speed){if(speed<14)return{y:0,z:0};const a=K*speed*speed*.035,f1=4.6+(seed%7)*.35,f2=7.1+(seed%5)*.4,p=(seed%97)*.13;return{y:a*Math.sin(t*f1*2*Math.PI+p)*.55,z:a*(Math.sin(t*f1*2*Math.PI+p*1.7)+.55*Math.sin(t*f2*2*Math.PI+p))};}
// V113 surface response: wet turf skids (lower bounce, faster roll), snow grabs the ball
// (low bounce, strong rolling resistance). Values are relative to dry broadcast turf.
const SURFACES={clear:{bounce:1,roll:1,grip:1},rain:{bounce:.82,roll:.55,grip:1.07},snow:{bounce:.68,roll:2.1,grip:.86}};
function state(p,v,w,opt={}){return{x:p.x,y:p.y??R,z:p.z,vx:v.x,vy:v.y,vz:v.z,wx:w?.x||0,wy:w?.y||0,wz:w?.z||0,t:0,knuckle:!!opt.knuckle,seed:opt.seed|0,bounces:0,rollingResistance:Number.isFinite(opt.rollingResistance)?opt.rollingResistance:.55,surface:SURFACES[opt.surface]||SURFACES.clear};}
// One integration step in free air or on the turf; returns events.
function step(b,dt=STEP){
 const speed=Math.hypot(b.vx,b.vy,b.vz),air=b.y>R+.002||b.vy>.05;let ax=0,ay=0,az=0;
 if(speed>.05){const cd=dragCoefficient(speed,b.knuckle),drag=K*cd*speed;ax-=drag*b.vx;ay-=drag*b.vy;az-=drag*b.vz;
  const w=Math.hypot(b.wx,b.wy,b.wz);if(w>.1){const cl=liftCoefficient(R*w/speed),cx=b.wy*b.vz-b.wz*b.vy,cy=b.wz*b.vx-b.wx*b.vz,cz=b.wx*b.vy-b.wy*b.vx,cn=Math.hypot(cx,cy,cz)||1,lift=K*cl*speed*speed;ax+=lift*cx/cn;ay+=lift*cy/cn;az+=lift*cz/cn;}
  if(b.knuckle){const k=knuckleForce(b.t,b.seed,speed);ay+=k.y;az+=k.z;}}
 if(air)ay-=G;
 b.vx+=ax*dt;b.vy+=ay*dt;b.vz+=az*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;b.t+=dt;
 // Spin decays slowly in air (time constant ≈ 9 s) and quickly while rolling.
 const decay=Math.exp(-dt*(air?.11:2.2));b.wx*=decay;b.wy*=decay;b.wz*=decay;
 let event=null;
 if(b.y<R||b.continuousGround&&b.y<=R+1e-6){const impact=-b.vy,sf=b.surface||SURFACES.clear;b.y=R;if(impact>.6){const e=clamp(.62-impact*.012,.42,.6)*sf.bounce;b.vy=impact*e;const grip=Math.min(.97,clamp(.86-impact*.008,.72,.86)*sf.grip);b.vx*=grip;b.vz*=grip;b.bounces++;event={type:'ground',speed:impact};}else{b.vy=0;const v=Math.hypot(b.vx,b.vz);if(v>.02){const keep=Math.max(0,1-((b.rollingResistance??.55)*sf.roll*dt)/v);b.vx*=keep;b.vz*=keep;}else b.vx=b.vz=0;}}
 return event;
}
// Woodwork: two uprights (vertical cylinders) and the crossbar (horizontal).
function woodwork(b,restitution=.72){
 const hit=(nx,ny,nz,d)=>{const pen=R+POST_R-d;if(pen<=0)return null;const vn=b.vx*nx+b.vy*ny+b.vz*nz;if(vn>=0)return null;b.x+=nx*pen;b.y+=ny*pen;b.z+=nz*pen;b.vx-=(1+restitution)*vn*nx;b.vy-=(1+restitution)*vn*ny;b.vz-=(1+restitution)*vn*nz;b.wx*=.4;b.wy*=.4;b.wz*=.4;return{type:'woodwork',normal:{x:nx,y:ny,z:nz},speed:-vn};};
 for(const side of[-1,1]){if(b.y>BAR_Y+R)continue;const dx=b.x-GOAL_X,dz=b.z-side*POST_Z,d=Math.hypot(dx,dz);if(d<R+POST_R){const e=hit(dx/(d||1),0,dz/(d||1),d);if(e)return{...e,part:'post',side};}}
 if(Math.abs(b.z)<POST_Z+POST_R){const dx=b.x-GOAL_X,dy=b.y-BAR_Y,d=Math.hypot(dx,dy);if(d<R+POST_R){const e=hit(dx/(d||1),dy/(d||1),0,d);if(e)return{...e,part:'bar'};}}
 return null;
}
// Free flight (no obstacles) used by the aiming solver.
function fly(p,v,w,time,opt={}){const b=state(p,v,w,opt);let left=time;while(left>1e-9){const dt=Math.min(STEP,left);step(b,dt);left-=dt;}return b;}
// Finds the launch velocity that reaches `target` after `time` seconds
// with the given spin, so curl/dip/knuckle are physical, not painted on.
function solve(p,target,time,w,opt={}){let v={x:(target.x-p.x)/time,y:(target.y-p.y)/time+G*time/2,z:(target.z-p.z)/time};
 for(let i=0;i<24;i++){const b=fly(p,v,w,time,opt),ex=target.x-b.x,ey=target.y-b.y,ez=target.z-b.z;if(Math.hypot(ex,ey,ez)<.004)break;const g=1.05/time;v={x:v.x+ex*g,y:v.y+ey*g,z:v.z+ez*g};}
 return v;}
// Samples a recorded path (array of {t,x,y,z}) at any time.
function at(frames,time){if(!frames.length)return null;if(time<=frames[0].t)return{...frames[0]};const last=frames[frames.length-1];if(time>=last.t)return{x:last.x,y:last.y,z:last.z,t:time};let lo=0,hi=frames.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(frames[m].t<=time)lo=m;else hi=m;}const a=frames[lo],b=frames[hi],q=(time-a.t)/Math.max(1e-9,b.t-a.t);return{x:a.x+(b.x-a.x)*q,y:a.y+(b.y-a.y)*q,z:a.z+(b.z-a.z)*q,t:time};}
function speedKmh(v){return Math.round(Math.hypot(v.x,v.y,v.z)*3.6);}
return{SURFACES,R,MASS,STEP,G,GOAL_X,POST_Z,BAR_Y,POST_R,dragCoefficient,liftCoefficient,state,step,woodwork,fly,solve,at,speedKmh,version:'aero-v108'};
});
