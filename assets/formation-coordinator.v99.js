/* Next90 implementation informed by ball-relative formation positioning (UT Austin Villa,
 * MacAlpine/Barrera/Stone 2012). No third-party C++ or Java code is copied here. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f();else r.Next90Formation=f();})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function slot(c,p){return c.lineups?.[p.team]?.players[p.id%11]?.slot||{role:c.ai?.profiles[p.id]?.role||'CM',z:[0,-25,-8,8,25,0,-12,-24,10,0,24][p.id%11]};}
function anchor(c,p,ball,possession,dir){const s=slot(c,p),role=s.role,t=c.ai.tactics[p.team],own=p.team===possession,bx=ball.x*dir,bz=ball.z*dir,def=['CB','LB','RB','LWB','RWB'].includes(role),front=['ST','LW','RW'].includes(role),band=def?0:front?2:1;
 const back=own?clamp(bx-28,-39,10):clamp(bx-(t.depth==='high'?17:12),-44,-13),spacing=own?14:11,x=back+band*spacing+(role==='DM'?-4:role==='AM'?5:0),wide=['LB','RB','LWB','RWB','LW','RW','LM','RM'].includes(role),width=wide?clamp(t.width??.7,.45,.95)*.55+.5:own?.86:.74;
 return{x:clamp(x,-47,45)*dir,z:clamp((s.z||0)*width+bz*(band===0?.14:band===1?.20:.12),-30,30)*dir};}
function target(c,p,q,players,ball,possession,dir,pressers=[]){if(p.keeper||p.dismissed)return q;const a=anchor(c,p,ball,possession,dir),near=Math.hypot(p.x-ball.x,p.z-ball.z),presser=pressers.includes(p.id),own=p.team===possession;let blend=presser||near<4?0:own?.62:.74;const out={x:q.x*(1-blend)+a.x*blend,z:q.z*(1-blend)+a.z*blend};
 // Each slot keeps its lane. Only the designated presser may leave the block freely.
 if(!presser&&near>6){const max=slot(c,p).role==='CB'?5:9;out.z=clamp(out.z,a.z-max,a.z+max);out.x=clamp(out.x,a.x-10,a.x+10);}for(const o of players){if(o.team!==p.team||o.id===p.id||o.dismissed||o.keeper)continue;const dx=out.x-o.x,dz=out.z-o.z,d=Math.hypot(dx,dz);if(d<2.8&&d>.01){out.x+=dx/d*(2.8-d)*.4;out.z+=dz/d*(2.8-d)*.4;}}
 return{x:clamp(out.x,-50,51),z:clamp(out.z,-32,32)};}
return{slot,anchor,target,version:'coordinated-blocks-v99'};});
