/* Shared team blocks, evaluated at 5 Hz in canonical attacking coordinates. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('../future/lineup-core.js'));else r.SekmeOrganization=f(r.SekmeFutureLineups);})(typeof globalThis!=='undefined'?globalThis:this,function(L){'use strict';
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),mix=(a,b,q)=>a+(b-a)*q;
 function slot(c,p){return c.lineups?.[p.team]?.players[p.id%11]?.slot||{role:['GK','LB','CB','CB','RB','DM','CM','LW','AM','ST','RW'][p.id%11],z:[0,-25,-8,8,25,0,-12,-24,10,0,24][p.id%11]};}
 function transition(c,t){return ['counter','turnover','keeperError'].includes(c.pattern)||c.family==='counterPress'?clamp((t-.55)/2.5,0,1):null;}
 function target(c,p,base,g,t,players){
  if(p.keeper||['freeKick','penalty','corner'].includes(c.pattern)||t>3.8)return base;
  if(c.transitionOrigin&&t<c.transitionOrigin.at&&[c.transitionOrigin.actor,c.transitionOrigin.winner].includes(p.id)){const q=c.transitionOrigin.point;
 if(p.id===c.transitionOrigin.actor&&c.transitionProfile){const v=c.transitionProfile.losingDirection;return{x:p.x+v.x*3,z:p.z+v.z*3};}
 return{x:q.x+(p.id===c.transitionOrigin.actor?.75:0),z:q.z+(p.id===c.transitionOrigin.actor?.42:0)};}
  const s=slot(c,p),role=s.role,own=p.team===c.team,tactic=c.ai.tactics[p.team],wide=['LB','RB','LWB','RWB'].includes(role),cb=role==='CB',wing=['LW','RW','LM','RM'].includes(role),side=Math.sign(s.z)||1,flank=c.flank||1,z=s.z*flank,phase=transition(c,t),ballSide=Math.sign(g.z)||1;
  if(own){
   if([c.finisher??9,c.wideActor??7,c.midActor??5].includes(p.id%11))return base;
   let x=g.x-(cb?29:role==='DM'?18:role==='CM'?10:role==='AM'?3:wide?20:-1),width=cb?.78:wing?1.05:1;
   if(wide){const overlap=Math.sign(z)===ballSide&&tactic.width>.72&&c.recipe?.support==='overlap';x=overlap?g.x-6:g.x-20;width=overlap?1.10:.92;}
   if(phase!==null){const chase=cb?0:role==='DM'?.2:1;x-=8*(1-phase)*chase;}
   // At least two centre backs plus the holding midfielder provide rest defence.
   return{x:clamp(x,-42,45),z:clamp(z*width+g.z*(cb?.14:.18),-30,30)};
  }
  const backLine=clamp(g.x+(tactic.depth==='high'?7:11),tactic.depth==='high'?27:32,45),five=/^5-/.test(tactic.formation)||/^3-/.test(tactic.formation),defender=cb||wide;
  let x=backLine-(defender?0:role==='DM'?6.3:role==='CM'?7.5:wing?9.0:18),width=defender?(five?.78:.69):wing?.78:.68,zTarget=-z*width+clamp(g.z*.34,-6,6);
  if(defender&&Math.sign(zTarget)!==ballSide)zTarget*=.87;
  // Fullbacks caught high take time to recover; the centre backs drop together.
  if(phase!==null){x-=wide?9*(1-phase):cb?2*(1-phase):5*(1-phase);zTarget=mix(-z*.95,zTarget,phase);}
  if(p.id===c.activePresser&&t<3.8){const d=Math.hypot(p.x-g.x,p.z-g.z);if(d<15&&(!cb||g.x>35||d<3))return{x:g.x+1.5,z:g.z+.5};}
  if(p.id===c.coverDefender&&t<3.8&&!cb){const presser=players.find(a=>a.id===c.activePresser),side=Math.sign((presser?.z??g.z)-g.z)||1;return{x:clamp(g.x+4,-35,47),z:clamp(g.z-side*3.8,-28,28)};}
  if(phase!==null&&c.transitionOrigin&&t>=c.transitionOrigin.at){const age=t-c.transitionOrigin.at;
   const recovery=clamp(age/1.65,0,1),exposed=clamp(tactic.risk,0,1);
   if(cb){x+=Math.min(2.2,age*1.7)*(.5+.5*exposed);zTarget=mix(zTarget,g.z*.42+Math.sign(zTarget||1)*4.4,recovery*.32);}
   if(wide){x+=2.8*(1-recovery)*exposed;zTarget=mix(zTarget,g.z*.22+Math.sign(zTarget||1)*14,recovery*.3);}
   if(p.id===c.activePresser&&age<1.7&&!cb)return{x:g.x+1.1,z:g.z+Math.sign(p.z-g.z||1)*.8};
   if(p.id===c.coverDefender&&age<1.7&&!cb)return{x:g.x+4.5,z:g.z-Math.sign(g.z||1)*3.6};
  }
  if(role==='DM'&&p.id!==c.activePresser)zTarget=mix(zTarget,g.z,.28);
  if(cb&&p.id!==c.activePresser){const threats=players.filter(a=>a.team===c.team&&!a.keeper&&!a.dismissed&&a.x>g.x-5).sort((a,b)=>Math.abs(a.z-zTarget)-Math.abs(b.z-zTarget)),assigned=players.find(a=>a.id===c.marking?.[p.id%11]&&a.team===c.team&&!a.dismissed),threat=assigned||threats[0];if(threat){x=mix(x,clamp(threat.x+1.5,backLine-2,48),.42);zTarget=mix(zTarget,threat.z+Math.sign(zTarget-threat.z||1)*1.25,.38);}}
  return{x:clamp(x,-35,48),z:clamp(zTarget,-29,29)};
 }
 function initial(c,players,g){return players.map(p=>{const q=target(c,p,p,g,0,players);return{...p,x:q.x,z:q.z};});}
 function numbers(players,team,x){return{attackers:players.filter(p=>p.team===team&&!p.keeper&&!p.dismissed&&p.x>x-6).length,defenders:players.filter(p=>p.team!==team&&!p.keeper&&!p.dismissed&&p.x>x-2).length};}
 return{target,initial,slot,transition,numbers,version:'team-blocks-v73'};
});
