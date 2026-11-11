/* Predictive interpose/evade adapted from Yuka (MIT), © 2023 Yuka authors.
 * Pinned sources/notices: assets/vendor/yuka/arena-steering-NOTICE.txt.
 * Football touches and skill envelopes are original, seeded arena behaviour. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f();else r.Next90JaponDuels=f();})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
function interpose(defender,carrier,goal){
 const mid={x:(carrier.x+goal.x)/2,z:(carrier.z+goal.z)/2},time=clamp(distance(defender,mid)/5.2,0,.35);
 const predicted={x:carrier.x+(carrier.vx||0)*time,z:carrier.z+(carrier.vz||0)*time},d=distance(predicted,goal)||1;
 return{x:predicted.x+(goal.x-predicted.x)/d*1.25,z:predicted.z+(goal.z-predicted.z)/d*1.25};
}
function evade(carrier,pursuer,goal){
 const ahead=clamp(distance(carrier,pursuer)/(4.5+Math.hypot(pursuer.vx||0,pursuer.vz||0)),0,.4),px=pursuer.x+(pursuer.vx||0)*ahead,pz=pursuer.z+(pursuer.vz||0)*ahead,dx=goal.x-carrier.x,dz=goal.z-carrier.z,d=Math.hypot(dx,dz)||1;
 return (px-carrier.x)*(-dz/d)+(pz-carrier.z)*(dx/d)>0?-1:1;
}
const MOVES=['body-feint','step-over','drag-back','roulette','elastico','chop','nutmeg'];
function envelope(skill,time){if(!skill)return null;const u=clamp((time-skill.at)/skill.duration,0,1),wave=Math.sin(Math.PI*u),side=skill.side;
 return{type:skill.type,phase:u,side,lean:side*wave*.18,lateral:side*(skill.type==='body-feint'?(u<.3?-.45*Math.sin(u/.3*Math.PI):Math.sin((u-.3)/.7*Math.PI)):skill.type==='elastico'?(u<.38?-.7*Math.sin(u/.38*Math.PI):1.25*Math.sin((u-.38)/.62*Math.PI)):skill.type==='chop'?1.35*Math.sin(Math.PI*Math.min(1,u*1.25)):skill.type==='nutmeg'?.55*wave:wave),back:skill.type==='drag-back'?-.65*wave:skill.type==='chop'?-.3*Math.sin(Math.PI*Math.min(1,u*2)):0,spin:skill.type==='roulette'?side*Math.PI*2*u:0,foot:skill.type==='step-over'?Math.sin(u*Math.PI*2):0};
}
// A foul requires late body contact; reaching the ball first is a clean challenge.
function contact(defender,carrier,ball){const body=distance(defender,carrier),reach=distance(defender,ball),dx=carrier.x-defender.x,dz=carrier.z-defender.z,d=body||1,closing=((defender.vx||0)-(carrier.vx||0))*dx/d+((defender.vz||0)-(carrier.vz||0))*dz/d;
 return{body,reach,closing,ballFirst:reach<body-.10&&reach<.85,lateBody:body<.92&&reach>.58&&reach>body-.02&&closing>.55};
}
function verdict(attackerAbility,defenderAbility,type,roll){const edge=.46+(attackerAbility-defenderAbility)*.45+(type==='nutmeg'?-.10:type==='roulette'||type==='elastico'?.04:0);return roll<Math.max(.2,Math.min(.8,edge));}
return{interpose,evade,envelope,contact,verdict,MOVES};});
