/* Continuous geometric team coordination. Original Next90 implementation.
 * Works with the existing Apache-2.0 Open Football decision layer and OpenEngine.
 * No authored attack catalogue and no score/goal generation. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f();else r.Next90Collective=f();})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),d=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z),mix=(a,b,t)=>a+(b-a)*t;
function lane(a,b,enemies){let danger=0;const dx=b.x-a.x,dz=b.z-a.z,l=dx*dx+dz*dz;for(const p of enemies){const u=clamp(((p.x-a.x)*dx+(p.z-a.z)*dz)/Math.max(.001,l),0,1);if(u<.08||u>.95)continue;const reach=1.2+(p.speed||0)*.13;danger=Math.max(danger,clamp(1-Math.hypot(p.x-a.x-u*dx,p.z-a.z-u*dz)/reach,0,1));}return danger;}
function role(p,profiles){return profiles[p.id]?.role||'CM';}
function targets(players,ball,side,dir,profiles,tactics,primary,owner,context={}){
 const rows=players.map(p=>({...p,x:p.x*dir,z:p.z*dir,vx:(p.vx||0)*dir,vz:(p.vz||0)*dir})),b={x:ball.x*dir,z:ball.z*dir},attack=rows.filter(p=>p.team===side&&!p.dismissed&&!p.keeper),defend=rows.filter(p=>p.team!==side&&!p.dismissed&&!p.keeper),out={},offers=[],width=clamp(tactics[side]?.width??.7,.35,.95),carrier=rows.find(p=>p.id===owner),carrierRole=carrier?role(carrier,profiles):'',wide=Math.abs(b.z)>17,ballSign=Math.sign(b.z)||1,line=rows.filter(p=>p.team!==side&&!p.dismissed).map(p=>p.x).sort((a,b)=>b-a)[1]??52.5,onside=Math.max(0,b.x,line)-1.05;
 const signOf=p=>{const r=role(p,profiles);return ['LB','LWB','LW','LM'].includes(r)?-1:['RB','RWB','RW','RM'].includes(r)?1:Math.sign(p.z)||((p.id%11)%2?1:-1);};
 const roleLane=p=>{const r=role(p,profiles),sign=signOf(p);return r==='CB'?sign*7.4:['LB','RB','LWB','RWB'].includes(r)?sign*(20+width*7):['LW','RW','LM','RM'].includes(r)?sign*(19+width*10):r==='ST'||r==='CF'?sign*3.8:r==='DM'?sign*5.5:sign*10.5;};
 // Spatial roles create combinations from the current carrier, pressure and
 // pass lane, rather than selecting a predetermined sequence of attacks.
 for(const p of attack){if(p.id===owner)continue;const r=role(p,profiles),sign=signOf(p),same=sign===ballSign,back=r==='CB',anchor=r==='DM',fb=['LB','RB','LWB','RWB'].includes(r),wing=['LW','RW','LM','RM'].includes(r),striker=['ST','CF'].includes(r),mid=!back&&!anchor&&!fb&&!wing&&!striker;
  let intent=back?'rest-defence':anchor?'pivot':fb?'fullback-width':wing?'wide-offer':striker?'pin-and-run':'half-space',x=back?clamp(b.x*.40-18,-36,-4):anchor?clamp(b.x*.65-12,-31,23):fb?clamp(b.x-13,-30,37):striker?b.x+9:wing?b.x+4:b.x-2,z=roleLane(p);
  if(back)z+=clamp(b.z*.16,-3,3);if(anchor)z=clamp(z+b.z*.20,-11,11);if(mid)z+=clamp(b.z*.12,-3,3);
  if(fb&&wide){if(same&&carrierRole!=='LB'&&carrierRole!=='RB'){x=b.x+3.4;z=sign*30;intent='overlap';}else{x=b.x-18;z=sign*15;intent='inverted-cover';}}
  if(wing&&wide&&same&&['LB','RB','LWB','RWB'].includes(carrierRole)){z=sign*13;x=b.x+7;intent='underlap';}
  if(mid&&carrier&&gap2(p,carrier)<16&&Math.abs(carrier.vx)>1.6&&carrier.vx>0){x=b.x+5.5;z=sign*12;intent='third-man';}
  if(wing&&!same){z=sign*(b.x>25?11:23);x=b.x+(b.x>25?10:5);intent=b.x>25?'far-post-run':'weak-side-width';}
  if(striker){z=clamp(b.z*.25+sign*2.8,-10,10);x=b.x+10;}
  // V110 counter-attack lanes: in the first seconds after a turnover the front line
  // sprints into channels ahead of the ball and one runner attacks the far post lane.
  const sinceTurnover=Number.isFinite(context.turnoverAt)?(context.time??0)-context.turnoverAt:Infinity,counter=sinceTurnover>=0&&sinceTurnover<6.5&&b.x<30?1-clamp((sinceTurnover-4)/2.5,0,1):0;
  if(counter>0&&!back&&!fb){const lane=wing?sign*(15+((p.id%3)*1.5)):striker?clamp(b.z*.3,-6,6):mid?sign*9:z;x=mix(x,b.x+(wing?17:striker?21:mid?7:x-b.x),counter);z=mix(z,lane,counter);intent=wing||striker?'counter-lane':'counter-support';}
  const base={x:clamp(x,-43,Math.min(47,onside)),z:clamp(z,-30.3,30.3)},step=back||anchor?2.1:3.2;let best=null;
  for(let ix=-1;ix<=1;ix++)for(let iz=-1;iz<=1;iz++){const q={x:clamp(base.x+ix*step,-45,Math.min(48,onside)),z:clamp(base.z+iz*step,-31,31)},opposition=Math.min(12,...defend.map(o=>d(q,{x:o.x+o.vx*.35,z:o.z+o.vz*.35}))),spacing=Math.min(7,...offers.map(o=>d(q,o))),risk=lane(b,q,defend),distance=d(p,q),goalThreat=striker||wing?clamp((q.x-18)/28,0,1)*.22:0,score=opposition*.09+spacing*.13+(1-risk)*.85-distance*.021-Math.abs(q.x-base.x)*.03-Math.abs(q.z-base.z)*.025+goalThreat;
   if(!best||score>best.score)best={...q,score};}
  offers.push(best);out[p.id]={x:best.x*dir,z:best.z*dir,blend:back?.68:anchor?.67:.74,intent};
 }
 // Compact lines stay connected. Only the designated presser attacks the
 // carrier; centre-backs retain their line unless a nearby runner threatens it.
 // V108 block model (tracking-data shape: team length ≈25–35 m, width ≈35–42 m).
 // Low-press sides cap how high the back line steps; an unpressured carrier
 // running forward makes the line drop (step-off) instead of holding.
 // V110 pressing triggers: a carrier pinned on the touchline (trap) or receiving while
 // facing his own goal (back pass / poor touch) makes the block step up and squeeze;
 // during an opponent counter the defending lines run back goal-side.
 const sinceTurnoverD=Number.isFinite(context.turnoverAt)?(context.time??0)-context.turnoverAt:Infinity,recovering=sinceTurnoverD>=0&&sinceTurnoverD<6.5&&b.x<30?1-clamp((sinceTurnoverD-4)/2.5,0,1):0,touchTrap=carrier&&Math.abs(carrier.z)>25?1:0,facingBack=carrier&&(carrier.vx||0)<-.8?1:0,trigger=Math.max(touchTrap,facingBack)*(1-recovering);
 const press=tactics[1-side]?.press??.5,highest=mix(27,4,clamp(press,0,1)),pressure=carrier?Math.min(9,...defend.map(o=>d(o,carrier))):9,dropping=carrier&&pressure>3.6&&(carrier.vx||0)>1.2?clamp((pressure-3.6)*.9,0,4.5):0,backLine=clamp(b.x+12+(press-.5)*7+dropping-trigger*3.5+recovering*7,highest-trigger*3,47),compression=clamp((b.x-15)/25,0,1),midLine=backLine-mix(12,5.5,compression),frontLine=midLine-mix(12,8,compression),ballShift=clamp(b.z*(.48+touchTrap*.2),-11-touchTrap*4,11+touchTrap*4);
 for(const p of defend){if(p.id===primary)continue;const r=role(p,profiles),back=['CB','LB','RB','LWB','RWB'].includes(r),anchor=r==='DM',front=['ST','CF','LW','RW'].includes(r),x=back?backLine:anchor?midLine+2.4:front?frontLine:midLine,lane=roleLane(p),z=clamp(lane*(back?.78:.65)+ballShift,-27,27);const rx=recovering&&!back?Math.max(x,b.x+3+(anchor?3:0)):x;out[p.id]={x:rx*dir,z:z*dir,blend:recovering?.84:.76,intent:recovering?'recovery-run':trigger&&!back?'press-trigger':back?'back-line':anchor?'screen-pivot':front?'front-screen':'midfield-line'};}
 const threats=attack.filter(p=>p.x>backLine-9).sort((a,b)=>b.x-a.x).slice(0,3),available=new Set(defend.filter(p=>p.id!==primary).map(p=>p.id));for(const threat of threats){let best=null;for(const p of defend){if(!available.has(p.id))continue;const q=out[p.id],base={x:q.x*dir,z:q.z*dir},cost=d(p,threat)+Math.abs(base.z-threat.z)*.55;if(Math.abs(base.z-threat.z)>12||Math.abs(base.x-threat.x)>13)continue;if(!best||cost<best.cost)best={p,cost,base};}if(!best)continue;available.delete(best.p.id);const old=out[best.p.id],tx=clamp(threat.x+1.2,backLine-6,49),tz=clamp(threat.z+Math.sign(b.z-threat.z)*.6,-29,29);out[best.p.id]={x:mix(old.x,tx*dir,.42),z:mix(old.z,tz*dir,.42),blend:.72,intent:'goal-side-cover'};}
 return out;
}
function gap2(a,b){return Math.hypot(a.x-b.x,a.z-b.z);}
function carry(player,enemies,profile,dir=1){const p={x:player.x*dir,z:player.z*dir},vx=(player.vx||0)*dir,vz=(player.vz||0)*dir,goalAngle=Math.atan2(-p.z,52.5-p.x),speed=Math.hypot(vx,vz),momentum=speed>.3?Math.atan2(vz,vx):goalAngle;let best=null;for(let i=-8;i<=8;i++){const angle=goalAngle+i*.115,step=2.2+(profile?.pace||6.5)*.14,q={x:p.x+Math.cos(angle)*step,z:p.z+Math.sin(angle)*step};if(Math.abs(q.z)>31.2||q.x>50.5)continue;let clearance=10,frontRisk=0;for(const e of enemies){const o={x:e.x*dir+(e.vx||0)*dir*.25,z:e.z*dir+(e.vz||0)*dir*.25};clearance=Math.min(clearance,d(q,o));const rx=o.x-p.x,rz=o.z-p.z,along=rx*Math.cos(angle)+rz*Math.sin(angle),across=Math.abs(-rx*Math.sin(angle)+rz*Math.cos(angle));if(along>0&&along<step+1.3)frontRisk=Math.max(frontRisk,clamp(1-across/1.6,0,1));}const turn=Math.abs(Math.atan2(Math.sin(angle-momentum),Math.cos(angle-momentum))),score=clamp(clearance,0,6)*.22-frontRisk*1.3+Math.cos(angle-goalAngle)*.65-turn*.13-Math.abs(q.z)*.003;if(!best||score>best.score)best={...q,score};}return best?{x:best.x*dir,z:best.z*dir}:null;}
return{targets,lane,carry,version:'spatial-organization-v110'};});
