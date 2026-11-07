/* Validated lineup/role planning; activated only for supported new fixtures. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('../assets/player-names.js'));else r.SekmeFutureLineups=f(r.SekmePlayerNames);})(typeof globalThis!=='undefined'?globalThis:this,function(N){'use strict';
const flags=Object.freeze({lineups:true,playerNames:true,playerAppearance:true,kickoffFormation:true,scorerNames:true});
const roles=Object.freeze({GK:{label:'Goalkeeper',band:'goalkeeper'},CB:{label:'Centre-back',band:'defence'},LB:{label:'Left-back',band:'defence'},RB:{label:'Right-back',band:'defence'},LWB:{label:'Left wing-back',band:'defence'},RWB:{label:'Right wing-back',band:'defence'},DM:{label:'Holding midfielder / 6',band:'midfield'},CM:{label:'Central midfielder / 8',band:'midfield'},AM:{label:'Attacking midfielder / 10',band:'midfield'},LM:{label:'Left midfielder',band:'midfield'},RM:{label:'Right midfielder',band:'midfield'},LW:{label:'Left winger',band:'attack'},RW:{label:'Right winger',band:'attack'},ST:{label:'Striker',band:'attack'}});
const aliases={G:'GK',GOALKEEPER:'GK',KALECI:'GK',STOPER:'CB',CENTREBACK:'CB',CENTERBACK:'CB',SOLBEK:'LB',SAGBEK:'RB',CDM:'DM',DMF:'DM','6':'DM',CMF:'CM','8':'CM',CAM:'AM',AMF:'AM','10':'AM',SOLKANAT:'LW',SAGKANAT:'RW',CF:'ST',FORVET:'ST','9':'ST',D:'DEF',DEFENDER:'DEF',M:'MID',MIDFIELDER:'MID',F:'FWD',FORWARD:'FWD'};
function normalizeRole(value){const key=String(value||'').normalize('NFKD').replace(/[\u0300-\u036f\s_-]/g,'').replace(/ı/g,'i').toUpperCase();return roles[key]?key:aliases[key]||null;}
const slot=(id,role,x,z)=>Object.freeze({id,role,x,z});
const back4=[slot('LB','LB',-29,-25),slot('LCB','CB',-34,-8),slot('RCB','CB',-34,8),slot('RB','RB',-29,25)],keeper=slot('GK','GK',-48,0);
const formations=Object.freeze({
 '4-3-2-1':[keeper,...back4,slot('LCM','CM',-4,-14),slot('DM','DM',-15,0),slot('RCM','CM',-4,14),slot('LAM','AM',13,-10),slot('RAM','AM',13,10),slot('ST','ST',30,0)],
 '3-4-1-2':[keeper,slot('LCB','CB',-32,-16),slot('CB','CB',-36,0),slot('RCB','CB',-32,16),slot('LWB','LWB',-6,-28),slot('LCM','CM',-6,-9),slot('RCM','CM',-6,9),slot('RWB','RWB',-6,28),slot('AM','AM',15,0),slot('LST','ST',29,-8),slot('RST','ST',29,8)],
 '3-1-4-2':[keeper,slot('LCB','CB',-32,-16),slot('CB','CB',-36,0),slot('RCB','CB',-32,16),slot('DM','DM',-17,0),slot('LM','LM',3,-27),slot('LCM','CM',3,-9),slot('RCM','CM',3,9),slot('RM','RM',3,27),slot('LST','ST',29,-8),slot('RST','ST',29,8)],
 '4-5-1':[keeper,...back4,slot('LM','LM',2,-27),slot('LCM','CM',-3,-12),slot('DM','DM',-14,0),slot('RCM','CM',-3,12),slot('RM','RM',2,27),slot('ST','ST',29,0)],
 '4-2-1-3':[keeper,...back4,slot('LDM','DM',-14,-10),slot('RDM','DM',-14,10),slot('AM','AM',8,0),slot('LW','LW',24,-24),slot('ST','ST',31,0),slot('RW','RW',24,24)],
 '4-2-3-1':[keeper,...back4,slot('LDM','DM',-12,-9),slot('RDM','DM',-12,9),slot('LW','LW',13,-24),slot('AM','AM',12,0),slot('RW','RW',13,24),slot('ST','ST',29,0)],
 '4-3-3':[keeper,...back4,slot('DM','DM',-14,0),slot('LCM','CM',2,-12),slot('RCM','CM',2,12),slot('LW','LW',21,-24),slot('ST','ST',30,0),slot('RW','RW',21,24)],
 '4-4-2':[keeper,...back4,slot('LM','LM',-1,-25),slot('LCM','CM',-7,-8),slot('RCM','CM',-7,8),slot('RM','RM',-1,25),slot('LST','ST',27,-7),slot('RST','ST',27,7)],
 '4-1-4-1':[keeper,...back4,slot('DM','DM',-17,0),slot('LM','LM',5,-25),slot('LCM','CM',1,-9),slot('RCM','CM',1,9),slot('RM','RM',5,25),slot('ST','ST',29,0)],
 '4-3-1-2':[keeper,...back4,slot('DM','DM',-14,0),slot('LCM','CM',-3,-13),slot('RCM','CM',-3,13),slot('AM','AM',14,0),slot('LST','ST',28,-7),slot('RST','ST',28,7)],
 '3-5-2':[keeper,slot('LCB','CB',-32,-16),slot('CB','CB',-36,0),slot('RCB','CB',-32,16),slot('LWB','LWB',-7,-28),slot('LCM','CM',-1,-11),slot('DM','DM',-15,0),slot('RCM','CM',-1,11),slot('RWB','RWB',-7,28),slot('LST','ST',28,-7),slot('RST','ST',28,7)],
 '3-4-3':[keeper,slot('LCB','CB',-32,-16),slot('CB','CB',-36,0),slot('RCB','CB',-32,16),slot('LWB','LWB',-6,-28),slot('LCM','CM',-6,-9),slot('RCM','CM',-6,9),slot('RWB','RWB',-6,28),slot('LW','LW',20,-22),slot('ST','ST',30,0),slot('RW','RW',20,22)],
 '4-4-1-1':[keeper,...back4,slot('LM','LM',-1,-25),slot('LCM','CM',-7,-8),slot('RCM','CM',-7,8),slot('RM','RM',-1,25),slot('AM','AM',15,0),slot('ST','ST',29,0)],
 '4-2-2-2':[keeper,...back4,slot('LDM','DM',-12,-9),slot('RDM','DM',-12,9),slot('LAM','AM',12,-14),slot('RAM','AM',12,14),slot('LST','ST',29,-7),slot('RST','ST',29,7)],
 '5-3-2':[keeper,slot('LWB','LWB',-27,-28),slot('LCB','CB',-34,-14),slot('CB','CB',-37,0),slot('RCB','CB',-34,14),slot('RWB','RWB',-27,28),slot('LCM','CM',-6,-12),slot('DM','DM',-14,0),slot('RCM','CM',-6,12),slot('LST','ST',29,-7),slot('RST','ST',29,7)],
 '5-4-1':[keeper,slot('LWB','LWB',-27,-28),slot('LCB','CB',-34,-14),slot('CB','CB',-37,0),slot('RCB','CB',-34,14),slot('RWB','RWB',-27,28),slot('LM','LM',0,-23),slot('LCM','CM',-8,-8),slot('RCM','CM',-8,8),slot('RM','RM',0,23),slot('ST','ST',29,0)],
 '3-4-2-1':[keeper,slot('LCB','CB',-32,-16),slot('CB','CB',-36,0),slot('RCB','CB',-32,16),slot('LWB','LWB',-6,-28),slot('LCM','CM',-6,-9),slot('RCM','CM',-6,9),slot('RWB','RWB',-6,28),slot('LAM','AM',16,-12),slot('RAM','AM',16,12),slot('ST','ST',30,0)]
});Object.values(formations).forEach(Object.freeze);
function cost(slotRole,playerRole){if(slotRole===playerRole)return 0;if(slotRole==='GK'||playerRole==='GK')return Infinity;
 if(playerRole==='DEF')return roles[slotRole].band==='defence'?2:Infinity;if(playerRole==='MID')return roles[slotRole].band==='midfield'?2:Infinity;if(playerRole==='FWD')return roles[slotRole].band==='attack'?2:Infinity;
 for(const group of [['LB','LWB'],['RB','RWB'],['LW','LM'],['RW','RM'],['DM','CM'],['CM','AM']])if(group.includes(slotRole)&&group.includes(playerRole))return 1;
 if(['AM','ST'].includes(slotRole)&&['AM','ST'].includes(playerRole))return 2;
 if(['LW','RW','ST'].includes(slotRole)&&['LW','RW','ST'].includes(playerRole))return 3;return Infinity;
}
function buildLineup(input){const formation=String(input.formation||''),slots=formations[formation];if(!slots)throw Error('Unsupported formation');if(!Array.isArray(input.players)||input.players.length!==11)throw Error('Exactly eleven starters required');
 const ids=new Set(),players=input.players.map(p=>{const id=String(p.id||'');if(!id||ids.has(id))throw Error('Player IDs must be unique');ids.add(id);const positions=[...new Set((p.roles||[p.position]).map(normalizeRole).filter(Boolean))];if(!positions.length)throw Error('Explicit position required; shirt number is not a position');return{...N.normalize(p),id,roles:positions};});
 if(players.filter(p=>p.roles.includes('GK')).length!==1)throw Error('Exactly one goalkeeper required');
 // Global assignment avoids greedily using the only right-back in a central slot.
 const memo=new Map();function assign(index,mask){if(index===11)return{cost:0,order:[]};const key=index+':'+mask;if(memo.has(key))return memo.get(key);let best=null;
  for(let j=0;j<11;j++)if(!(mask&(1<<j))){const c=Math.min(...players[j].roles.map(r=>cost(slots[index].role,r)));if(!Number.isFinite(c))continue;const tail=assign(index+1,mask|(1<<j));if(tail&&(!best||c+tail.cost<best.cost))best={cost:c+tail.cost,order:[j,...tail.order]};}memo.set(key,best);return best;
 }
 const assignment=assign(0,0);if(!assignment)throw Error('Starters cannot fill this formation with their stated positions');
 const benchIds=new Set(players.map(p=>p.id)),bench=[];for(const p of input.bench||[]){const id=String(p.id||'');if(!id||benchIds.has(id)||!p.name)continue;benchIds.add(id);bench.push({...N.normalize(p),id,number:Number.isInteger(p.number)?p.number:null});if(bench.length>=23)break;}
 const requested=input.captainId||players.find(p=>p.captain)?.id,sourceCaptain=players.find(p=>p.id===requested),chosen=sourceCaptain||players.filter(p=>p.roles.some(r=>['DM','CB','CM'].includes(r))).sort((a,b)=>String(a.dateOfBirth||'9999').localeCompare(String(b.dateOfBirth||'9999')))[0]||players[0],captainId=chosen.id;return{formation,bench,captainId,captainVerified:!!sourceCaptain,captainSource:sourceCaptain?'source':'simulation-deputy',coach:input.coach&&typeof input.coach.name==='string'?{...input.coach}:null,teamId:input.teamId||null,source:input.source||{status:'unverified'},setPieceTakers:{...(input.setPieceTakers||{})},players:assignment.order.map((j,i)=>({...players[j],isCaptain:players[j].id===captainId,slot:{...slots[i]}}))};
}
function kickoffPositions(home,away,half=1){if(![1,2].includes(half))throw Error('Half must be 1 or 2');return[home,away].flatMap((lineup,team)=>lineup.players.map(p=>{const dir=(team===0?1:-1)*(half===2?-1:1);return{playerId:p.id,team,role:p.slot.role,x:(-48+(p.slot.x+48)*.55)*dir,z:p.slot.z*dir,dir,keeper:p.slot.role==='GK'};}));}
const weights={open:{ST:7,LW:3,RW:3,AM:2.6,CM:.8,LM:1,RM:1,DM:.20,LB:.16,RB:.16,LWB:.24,RWB:.24,CB:.025},corner:{ST:5,CB:4,CM:1.5,DM:1,AM:.8,LW:.7,RW:.7,LB:.3,RB:.3,LWB:.3,RWB:.3,LM:.5,RM:.5},freeKick:{AM:4,ST:3,CM:2.5,LW:2,RW:2,DM:1,CB:.15,LB:.4,RB:.4},penalty:{ST:6,AM:4,LW:3,RW:3,CM:2,DM:.5,CB:.1}};
function random(seed){let n=(Number(seed)||1)>>>0;n=Math.imul(n^(n>>>16),0x21f0aaad);n=Math.imul(n^(n>>>15),0x735a2d97);return((n^(n>>>15))>>>0)/4294967296;}
function movementEnvelope(player,phase='open'){const r=player.slot.role;if(r==='GK')return{x:[-51,-37],z:[-12,12]};if(phase==='cornerAttack'&&r==='CB')return{x:[35,49],z:[-11,11]};if(r==='CB')return{x:[-47,5],z:[player.slot.z-11,player.slot.z+11]};if(['LB','LWB','RB','RWB'].includes(r))return{x:[-41,37],z:r[0]==='L'?[-33,-7]:[7,33]};if(r==='DM')return{x:[-33,22],z:[-20,20]};if(r==='CM')return{x:[-25,37],z:[-23,23]};if(['LW','LM'].includes(r))return{x:[-12,48],z:[-33,2]};if(['RW','RM'].includes(r))return{x:[-12,48],z:[-2,33]};return{x:[-8,51],z:[-22,22]};}
function planGoal(lineup,options={}){const kind=options.kind||'open';if(!weights[kind])throw Error('Unknown goal context');const unavailable=new Set(options.unavailableIds||[]),eligible=lineup.players.filter(p=>p.slot.role!=='GK'&&!unavailable.has(p.id)),designated=eligible.find(p=>p.id===lineup.setPieceTakers[kind]),preferred=options.preferredScorerId||(['penalty','freeKick'].includes(kind)?designated?.id:null);
 let scorer=preferred?eligible.find(p=>p.id===preferred):null;if(preferred&&!scorer)throw Error('Scorer is not an eligible starter');
 if(!eligible.length)throw Error('No eligible scorer');
 if(!scorer){const weighted=eligible.map(p=>({p,w:(weights[kind][p.slot.role]||.1)*Math.max(.25,Math.min(3,Number(p.scoringWeight)||1))})),sum=weighted.reduce((s,v)=>s+v.w,0);if(!sum)throw Error('No eligible scorer');let pick=random(options.seed)*sum;scorer=weighted.at(-1).p;for(const v of weighted){pick-=v.w;if(pick<=0){scorer=v.p;break;}}}
 const aerial=kind==='corner'&&['CB','ST','DM','CM'].includes(scorer.slot.role),side=scorer.slot.z<0?-1:1,open=kind==='open',zone=movementEnvelope(scorer),finish={x:kind==='freeKick'?27:kind==='penalty'?41.5:open?Math.min(44,zone.x[1]):44,z:kind==='penalty'?0:aerial?side*4:Math.max(-12,Math.min(12,scorer.slot.z*.35))};
 if(open)finish.z=Math.max(zone.z[0],Math.min(zone.z[1],finish.z));
 return{scorerId:scorer.id,scorerRole:scorer.slot.role,slotId:scorer.slot.id,kind,takerId:kind==='corner'&&designated?.id!==scorer.id?designated?.id||null:kind==='corner'?null:scorer.id,finishAction:aerial?'header':kind==='freeKick'?'direct-free-kick':kind==='penalty'?'penalty':finish.x<30?'long-shot':'shot',routes:[{playerId:scorer.id,stages:[{phase:'build',x:scorer.slot.x,z:scorer.slot.z},{phase:kind==='corner'?'set-piece-box-entry':'attacking-run',x:finish.x-6,z:finish.z},{phase:'finish',...finish},{phase:'recover',x:scorer.slot.x,z:scorer.slot.z}]}],appearance:scorer.appearance||null};
}
// Activation deliberately has no setters or fetch side effects in this release.
function activePayload(){return null;}
return{flags,roles,formations,normalizeRole,buildLineup,kickoffPositions,movementEnvelope,planGoal,activePayload};
});
