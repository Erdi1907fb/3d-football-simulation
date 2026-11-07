/* MIT adaptations from atas76/openengine, commit 84bc2b32a1027e775321b57bc6e85c91ec3ba147.
 * Tactic.computeDistanceUnitFactor + Player weighted markers. See OPENENGINE-v98.md.
 * Metric coordinates, seeded selection and contextual weights are Next90 additions. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f();else r.Next90OpenEngine=f();})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n)),gap=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
function cell(p){return{row:Math.floor(clamp((p.x+52.5)/105,0,.999999)*5),lane:Math.floor(clamp((p.z+34)/68,0,.999999)*7)};}
function geometry(a,b){a=cell(a);b=cell(b);const v=Math.abs(b.row-a.row),h=Math.abs(b.lane-a.lane);return [1,1.3,1.6,2.4,3.2][v]*(h===0?1:h===1?1.4:2.1);}
function markers(p,opponents,profiles=[]){return opponents.filter(o=>!o.dismissed&&!o.keeper).map(o=>{const d=gap(p,o),skill=profiles[o.id]?.defending??.65;return{actor:o.id,weight:Math.max(0,1-d/7.5)**2*(.55+skill*.7)};}).filter(o=>o.weight>0).sort((a,b)=>b.weight-a.weight||a.actor-b.actor);}
function weighted(items,rng){let n=items.reduce((s,q)=>s+Math.max(0,q.weight),0);if(n<=0)return null;let v=rng()*n;for(const q of items){v-=Math.max(0,q.weight);if(v<0)return q;}return items.at(-1);}
function passValue(from,to,opponents,profile={},profiles=[]){const factor=geometry(from,to),mark=markers(to,opponents,profiles).reduce((s,m)=>s+m.weight,0),skill=clamp(profile.passing??.7),d=gap(from,to);return clamp((.72+.23*skill)/(1+(.15+(factor-1)*.45)*mark)*Math.exp(-Math.max(0,d-14)/95),.08,.98);}
function supportNetwork(players,side,dir=1){const own=players.filter(p=>p.team===side&&!p.dismissed),network={};for(const p of own){const a=cell({x:p.x*dir,z:p.z*dir});network[p.id]=own.filter(q=>q.id!==p.id&&gap(p,q)>2).map(q=>{const b=cell({x:q.x*dir,z:q.z*dir});return{actor:q.id,weight:1/(1+Math.abs(b.row-a.row)+Math.abs(b.lane-a.lane)*.5),distance:gap(p,q)};}).sort((a,b)=>b.weight-a.weight||a.actor-b.actor).slice(0,5);}return network;}
function shape(p,q,players,ball,profile,tactic,attacking,dir){if(p.keeper)return q;const role=profile.role,cb=role==='CB',wide=['LB','RB','LWB','RWB','LW','RW','LM','RM'].includes(role),deep=cb||role==='DM',width=clamp(tactic.width??.7,.4,1),home=p.slot?.z??q.z;let out={...q};
 // Keep a defensive triangle behind possession; other lines respond with bounded lag.
 if(attacking&&deep){const rest=ball.x*dir-(cb?23:13);out.x=out.x*.78+clamp(rest,-44,37)*dir*.22;}
 if(!attacking&&cb){const same=players.filter(o=>o.team===p.team&&!o.dismissed&&o.id!==p.id&&Math.abs(o.x-p.x)<14);if(same.length){const x=same.reduce((s,o)=>s+o.x,0)/same.length;out.x=out.x*.85+x*.15;}}
 if(wide&&attacking)out.z=out.z*.9+Math.sign(home||p.z||1)*Math.max(12,22*width)*.1;
 const friends=players.filter(o=>o.team===p.team&&o.id!==p.id&&!o.dismissed&&!o.keeper);for(const o of friends){const dx=out.x-o.x,dz=out.z-o.z,d=Math.hypot(dx,dz);if(d<3.2&&d>.001){const w=(3.2-d)*.5;out.x+=dx/d*w;out.z+=dz/d*w;}}
 return{x:clamp(out.x,-50,51),z:clamp(out.z,-32.5,32.5)};
}
function attributes(player,base){base={...base};if(Number.isFinite(player?.condition)&&player.condition>=0&&player.condition<=1)base.stamina*=.65+.35*player.condition;if(Number.isFinite(player?.form)&&player.form>=0&&player.form<=1)for(const k of ['passing','finishing','control'])if(Number.isFinite(base[k]))base[k]=clamp(base[k]*(.9+.2*player.form),.1,.98);const a=player?.attributes;if(!a||typeof a!=='object')return base;const scale=a.scale===20?20:a.scale===100?100:1,out={...base},applied=[];for(const key of ['passing','finishing','control','defending','strength','aerial','keeping','stamina'])if(Number.isFinite(a[key])&&a[key]>=0&&a[key]<=scale){out[key]=clamp(a[key]/scale,.1,.98);applied.push(key);}if(applied.length){out.provenance='explicit-player-attributes';out.attributeFields=applied;out.verified=a.verified===true;}return out;}
return{cell,geometry,markers,weighted,passValue,supportNetwork,shape,attributes,version:'openengine-context-v98',sourceCommit:'84bc2b32a1027e775321b57bc6e85c91ec3ba147'};});
