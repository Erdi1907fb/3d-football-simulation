/* Rebound recovery: safe continuation unless pressure at our goal requires exit.
 * No scoring RNG, no extra shot, no mutation of allocated goal events. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f();else r.Next90RecoveryDecision=f();})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),gap=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
function lane(a,b,enemies){let risk=0;const dx=b.x-a.x,dz=b.z-a.z,n=dx*dx+dz*dz;for(const p of enemies){const t=clamp(((p.x-a.x)*dx+(p.z-a.z)*dz)/Math.max(.01,n),0,1);if(t>.04&&t<.96)risk=Math.max(risk,1-clamp(Math.hypot(p.x-a.x-t*dx,p.z-a.z-t*dz)/2.1,0,1));}return risk;}
function choose(p,players,dir=-1){const enemies=players.filter(q=>q.team!==p.team&&!q.dismissed&&!q.keeper),friends=players.filter(q=>q.team===p.team&&q.id!==p.id&&!q.dismissed&&!q.keeper),nearest=Math.min(50,...enemies.map(q=>gap(p,q))),pressure=1-clamp((nearest-.7)/3.0,0,1),ownDepth=p.x*dir,danger=ownDepth<-37&&Math.abs(p.z)<22;
 if(danger&&pressure>.70)return{kind:'emergency-clearance',target:{x:clamp(p.x+dir*10,-48,48),z:Math.sign(p.z||1)*35.4,y:.2},flight:1.1,arc:2.2,out:true,pressure};
 if(pressure<.30)return{kind:'carry',target:{x:clamp(p.x+dir*5.0,-47,47),z:clamp(p.z*.83,-29.5,29.5),y:.11},duration:1.65,out:false,pressure};
 const options=friends.map(q=>{const d=gap(p,q),risk=lane(p,q,enemies),advance=(q.x-p.x)*dir,space=Math.min(8,...enemies.map(e=>gap(e,q)));return{q,d,risk,advance,score:space*.3-risk*3+advance*.04-Math.abs(d-12)*.05};}).filter(o=>o.d>4&&o.d<27&&o.risk<.48&&o.advance>-5&&Math.abs(o.q.z)<31).sort((a,b)=>b.score-a.score);
 if(options.length){const q=options[0].q;return{kind:'outlet-pass',receiver:q.id,target:{x:q.x,z:q.z,y:.11},flight:clamp(options[0].d/15,.38,1.5),arc:.10,out:false,pressure};}
 return{kind:'forward-space',target:{x:clamp(p.x+dir*21,-48,48),z:clamp(p.z*.60,-25,25),y:.11},flight:1.45,arc:2.0,out:false,pressure};
}
return{choose,lane};});
