/* Deterministic metre/second ball integration. Used by the v3 shot resolver. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('./open-football-adapter.js'));else r.SekmeFootballPhysics=f(r.Next90OpenFootball);})(typeof globalThis!=='undefined'?globalThis:this,function(OpenFootball){'use strict';
const STEP=1/120,R=.11,clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function advance(b,dt=STEP){
 const air=b.y>R+.003||Math.abs(b.vy)>.12,drag=air?.035:0,v=Math.hypot(b.vx,b.vz),mx=-(b.spin||0)*b.vz*.0035,mz=(b.spin||0)*b.vx*.0035;
 b.vx+=(mx-b.vx*drag)*dt;b.vz+=(mz-b.vz*drag)*dt;if(!air&&v>.01){const retained=Math.max(0,1-.62*dt/Math.max(.01,v))*Math.exp(-.035*dt);b.vx*=retained;b.vz*=retained;if(Math.hypot(b.vx,b.vz)<.10)b.vx=b.vz=0;}
 b.x+=b.vx*dt;b.z+=b.vz*dt;b.y+=b.vy*dt-(air?4.905*dt*dt:0);if(air)b.vy-=9.81*dt;
 if(b.y<R){const impact=Math.abs(b.vy),restitution=clamp(.34+impact*.008,.36,.48),grip=clamp(.94-impact*.012,.80,.92);b.y=R;b.vy=impact>.45?impact*restitution:0;b.vx*=grip;b.vz*=grip;}b.spin=(b.spin||0)*Math.exp(-dt*.40);return b;
}
function pass(a,b,u,duration,arc=0,spin=0){
 if(OpenFootball)return OpenFootball.passFlight(a,b,u,duration,arc,spin);u=clamp(u,0,1);const k=.28,q=(1-Math.exp(-k*u))/(1-Math.exp(-k)),lift=4*Math.max(Math.max(0,arc),arc>1?1.22625*duration*duration:0)*u*(1-u);
 return{x:a.x+(b.x-a.x)*q,z:a.z+(b.z-a.z)*q+spin*Math.sin(Math.PI*u),y:Math.max(R,a.y+(b.y-a.y)*u+lift)};
}
function at(path,time){const x=clamp(time/STEP,0,path.length-1),i=Math.min(path.length-2,Math.floor(x)),q=x-i,a=path[i],b=path[i+1];return {x:a.x+(b.x-a.x)*q,y:a.y+(b.y-a.y)*q,z:a.z+(b.z-a.z)*q};}
function shot({start,target,power,spin=0,keeper,defenders=[],reaction=.2,reach=1.05,probe=false,finish='placed',oneOnOne=false}){
 const desired=Math.max(.16,(52.65-start.x)/power),gravity=4.905*desired*desired,b={...start,vx:power,vz:(target.z-start.z)/desired,vy:(target.y-start.y+gravity)/desired,spin},raw=probe?[]:[{x:b.x,y:b.y,z:b.z}],frame=()=>{if(!probe)raw.push({x:b.x,y:b.y,z:b.z});};let netContact=false,result=null,contact=null,terminal=null,exit=null,saveStyle=null,keeperTouch=null,netContactAt=null,netPoint=null,previous={...b};if(finish==='chip'){b.vy+=Math.max(1.5,desired*2.2);}
 for(let tick=1;tick<=Math.ceil(3.8/STEP);tick++){
  const t=tick*STEP;previous={...b};advance(b);const interpolate=x=>{const q=clamp((x-previous.x)/Math.max(.00001,b.x-previous.x),0,1);return{x,y:previous.y+(b.y-previous.y)*q,z:previous.z+(b.z-previous.z)*q};};
  if(!result){
   for(const d of defenders){const hit=OpenFootball?.blockContact(previous,b,d,.49,1.75);if(!hit)continue;result='block';b.x=hit.x;b.y=hit.y;b.z=hit.z;contact={x:b.x,y:b.y,z:b.z,actor:d.id,time:t-STEP+hit.fraction*STEP};b.vx=-Math.abs(b.vx)*.30;b.vz+=(d.z-b.z)*2;b.vy=1.1;break;}
   if(!result&&keeper&&previous.x<keeper.x-.38&&b.x>=keeper.x-.38){const p=interpolate(keeper.x-.38),available=Math.max(0,t-reaction),span=Math.min(reach,.85+available*4.5),distance=Math.hypot((p.z-keeper.z)/span,(p.y-1.05)/1.32);if(distance<1){result='save';contact={...p,actor:keeper.id,time:t};b.x=p.x;b.y=p.y;b.z=p.z;const lateral=Math.abs(p.z-keeper.z),speed=Math.hypot(b.vx,b.vz),side=Math.sign(p.z-keeper.z||p.z||1);
     saveStyle=p.y>1.7?'tipOver':oneOnOne&&p.y<.55?'foot':lateral<.60&&speed<30?'smother':lateral>1.0?'parryWide':p.y<.65?'collapse':'reflex';
     if(distance>.76&&speed>26&&Math.abs(p.z)<3.45&&p.y<2.20){keeperTouch={...contact};result=null;b.vx=Math.abs(b.vx)*.68;b.vz*=.80;b.vy*=.72;saveStyle='spill';}
     else if(saveStyle==='tipOver'){b.vx=7;b.vz=side*2.5;b.vy=6.8;}
     else if(saveStyle==='parryWide'){b.vx=6.5;b.vz=side*13;b.vy=1.4;}
     else if(saveStyle==='smother'){b.vx=b.vz=b.vy=0;}
     else{b.vx=-Math.max(2,Math.abs(b.vx)*.23);b.vz=side*(saveStyle==='foot'?8:4.5);b.vy=saveStyle==='foot'?.7:1.8;}}}
   if(!result&&previous.x<52.5&&b.x>=52.5){const p=interpolate(52.5),post=Math.abs(Math.abs(p.z)-3.66)<R+.06&&p.y<2.55,bar=Math.abs(p.y-2.44)<R+.06&&Math.abs(p.z)<3.78;
    if(post||bar){result='post';contact={...p,time:t,bar};b.x=52.48;b.vx=-Math.abs(b.vx)*.63;if(post)b.vz=-b.vz*.65;else b.vy=-Math.abs(b.vy)*.60;}
    else if(Math.abs(p.z)<3.66-R&&p.y<2.44-R){result='goal';b.x=Math.max(52.62,b.x);contact={...p,x:52.62,time:t};}
    else{result='wide';contact={...p,time:t};}
   }
   if(!result&&b.x>53.5){result='wide';contact={x:b.x,y:b.y,z:b.z,time:t};}
  }
  if(!probe&&result&&result!=='goal'&&!exit){if(previous.x<52.61&&b.x>=52.61){const p=interpolate(52.61);exit={kind:result==='save'?'corner':'goalKick',team:result==='save'?'attacking':'defending',time:t,...p};}else if(Math.abs(previous.z)<34.11&&Math.abs(b.z)>=34.11)exit={kind:'throwIn',time:t,x:b.x,y:b.y,z:b.z};}
  if(probe&&result)return{result,contact,impact:contact?.time||t};
  // Flexible net absorbs the shot instead of returning it onto the pitch during VAR.
  if(result==='goal'&&b.x>=52.62){
   OpenFootball.containNet(b,STEP);if(!netContactAt&&(b.x>54.465||Math.abs(b.z)>3.525||b.y>2.305)){netContactAt=t;netPoint={x:b.x,y:b.y,z:b.z};netContact=true;}
  }
  frame();if(result&&contact&&!terminal)terminal=contact.time;
 }
 // Contact is retimed as a single event boundary shared by rendering and the score.
 result=result||'wide';if(probe)return{result,contact,impact:terminal||desired};const impact=terminal||desired,visible=[];
 for(let tick=0;tick<=Math.ceil(8/STEP);tick++){const time=tick*STEP,source=time<=.7?time/.7*impact:impact+time-.7;visible.push(at(raw,source));}
 if(result==='goal'){visible[Math.round(.7/STEP)].x=Math.max(52.62,visible[Math.round(.7/STEP)].x);}
 return {result,contact,impact,exit,saveStyle,keeperTouch,netPoint,netContactAt:netContactAt==null?null:.7+netContactAt-impact,frames:visible,step:STEP,trajectory:raw,verifiedPhysics:true};
}
return{STEP,R,advance,pass,shot,at,containNet:OpenFootball.containNet,rollDistance:OpenFootball.rollDistance,version:'grass-impact-roll-v101'};
});
