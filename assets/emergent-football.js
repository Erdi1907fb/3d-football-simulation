/* Original deterministic decision/execution model. No outcomes or event quotas.
 * Unknown mental traits are labelled synthetic priors, never real player data. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f();else r.Next90Emergent=f();})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 function hash(value){let h=2166136261;for(const c of String(value))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
 function stream(seed){let s=seed>>>0;const next=()=>{s=(s+0x6d2b79f5)>>>0;let t=Math.imul(s^s>>>15,1|s);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};next.state=()=>s;next.restore=n=>{s=n>>>0;};return next;}
 function runtime(seed,snapshot){const streams=new Map();if(snapshot)for(const [name,state]of Object.entries(snapshot))streams.set(name,stream(state));return{seed,stream(name){name=String(name);if(!streams.has(name))streams.set(name,stream(hash(seed+'|'+name)));return streams.get(name);},snapshot(){return Object.fromEntries([...streams].map(([name,r])=>[name,r.state()]));},at(name,tick){return stream(hash(seed+'|'+name+'|'+tick));}};}
 function unit(value,fallback){if(!Number.isFinite(value))return fallback;return clamp(value>1?value/100:value);}
 function character(identity={},profile={}){
  const explicit={...identity,...identity.attributes,...profile},id=identity.id??identity.name??profile.id??profile.role??'anonymous',r=stream(hash('character|'+id)),rating=Number(identity.rating),base=Number.isFinite(rating)?clamp(rating>10?(rating-45)/55:(rating-4)/6,.25,.95):.58;
  const synthetic={},read=(name,aliases=[],bias=0)=>{const v=[name,...aliases].map(k=>explicit[k]).find(Number.isFinite);synthetic[name]=v==null;return unit(v,clamp(base+bias+(stream(hash('character|'+id+'|'+name))()-.5)*.18,.2,.92));};
  const result={risk:read('risk',['riskTaking']),creativity:read('creativity'),vision:read('vision'),passing:read('passing',['passQuality']),control:read('control',['ballControl']),shooting:read('shooting',['finishing']),weakFoot:read('weakFoot'),awareness:read('awareness',['defensiveAwareness','positioning']),decisions:read('decisions',['decisionMaking']),composure:read('composure'),concentration:read('concentration'),aggression:read('aggression'),balance:read('balance'),stamina:read('stamina'),reflexes:read('reflexes',['keeperReflexes']),distribution:read('distribution',['keeperDistribution']),foot:identity.preferredFoot||identity.foot||'right',synthetic};
  return result;
 }
 function condition(p,traits,{pressure=0,fatigue=p.fatigue||0,confidence=p.confidence??.5}={}){
  const speed=Math.hypot(p.vx||0,p.vz||0),h=p.heading||0,alignment=speed>.3?((p.vx||0)*Math.sin(h)+(p.vz||0)*Math.cos(h))/speed:1;
  return{pressure:clamp(pressure,0,3),fatigue:clamp(fatigue,0,.8),confidence:clamp(confidence),balance:clamp(traits.balance*(.7+.3*Math.max(0,alignment))-(p.imbalance||0),.05,1),stress:clamp(pressure*.22+fatigue*.3-(traits.composure-.5)*.3)};
 }
 // Softmax is over feasible options only. The lapse component changes decisions,
 // rather than manufacturing a goal/mistake after an action has been selected.
 function choose(options,traits,rng,context={}){
  const valid=options.filter(o=>o.feasible!==false&&Number.isFinite(o.utility));if(!valid.length)return null;
  const pressure=clamp(context.pressure||0,0,3),fatigue=clamp(context.fatigue||0),temperature=.16+(1-traits.decisions)*.30+pressure*.055+fatigue*.12,scored=valid.map(o=>{
   const risk=clamp(o.risk||0),creative=o.creative||0,type=o.kind||o.type||o.mode;
   return{option:o,value:o.utility-risk*(.25+(1-traits.risk)*.8)+creative*(traits.creativity-.4)*.6+(type==='shot'?(traits.shooting-.5)*.18:0)+(type==='carry'?(traits.control-.5)*.2:0)};
  }),max=Math.max(...scored.map(x=>x.value)),lapse=clamp((1-traits.decisions)*pressure*.035+fatigue*.03,0,.12),weights=scored.map(x=>(1-lapse)*Math.exp(clamp((x.value-max)/temperature,-35,0))+lapse/valid.length),sum=weights.reduce((a,b)=>a+b,0);let pick=rng()*sum,index=weights.length-1;
  for(let i=0;i<weights.length;i++){pick-=weights[i];if(pick<=0){index=i;break;}}
  const selected={...scored[index].option};selected.evaluation={count:valid.length,utility:scored[index].value,probability:weights[index]/sum,temperature};return selected;
 }
 function normal(rng){return clamp(Math.sqrt(-2*Math.log(Math.max(1e-9,rng())))*Math.cos(2*Math.PI*rng()),-3,3);}
 function execute(kind,p,traits,rng,context={}){
  const c=condition(p,traits,context),skill=kind==='shot'?traits.shooting:kind==='touch'?traits.control:kind==='distribution'?traits.distribution:traits.passing,turn=Math.abs(context.turn||0),weak=!!context.weakFoot,
   sigma=(kind==='touch'?.04:.025)+(1-skill)*.22+c.pressure*.055+(1-c.balance)*.08+c.fatigue*.12+Math.min(Math.PI,turn)*.035+(weak?(1-traits.weakFoot)*.13:0),distance=Math.max(1,context.distance||1),scale=kind==='touch'?1+Math.hypot(p.vx||0,p.vz||0)*.2:Math.sqrt(distance);
  return{lateral:normal(rng)*sigma*scale,longitudinal:normal(rng)*sigma*scale*.4,speed:clamp(1+normal(rng)*sigma*.12,.80,1.12),delay:clamp(.08+(1-traits.decisions)*.18+c.stress*.12,.08,.45),sigma,balance:c.balance,pressure:c.pressure,fatigue:c.fatigue,skill};
 }
 function applyAim(from,target,error){const dx=target.x-from.x,dz=target.z-from.z,d=Math.hypot(dx,dz)||1;return{...target,x:target.x-dz/d*error.lateral+dx/d*error.longitudinal,z:target.z+dx/d*error.lateral+dz/d*error.longitudinal};}
 function workload(p,traits,dt){const speed=Math.hypot(p.vx||0,p.vz||0),effort=clamp(speed/6,0,1.6);p.fatigue=clamp((p.fatigue||0)+dt*(effort>.7?effort*.0009*(1.35-traits.stamina):-.0005),0,.65);p.imbalance=Math.max(0,(p.imbalance||0)-dt*(.7+traits.balance));}
 function distributions(options,traits,rng,context={}){return choose(options.map(o=>({...o,kind:'distribution',utility:o.utility})),traits,rng,context);}
 return Object.freeze({hash,stream,runtime,character,condition,choose,execute,applyAim,workload,distributions,version:'emergent-football-v175'});
});
