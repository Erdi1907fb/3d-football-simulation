/* Shared entertainment model for football tennis / football bowling.
 * Uses the existing role priors, explicit attributes and roster rating. It is
 * not a calibrated forecast of real futnet/bowling ability. Never changes 11v11. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('./football-ai'),require('./openengine-adapter'));else r.Next90DuelAnalysis=f(r.SekmeFootballAI,r.Next90OpenEngine);})(typeof globalThis!=='undefined'?globalThis:this,function(AI,OE){'use strict';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function hash(value){let n=2166136261;for(const c of String(value))n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;}
function profile(player,mode='footvolley'){
 const role=player.naturalRoles?.[0]||player.roles?.[0]||player.position||'CM',base=OE.attributes(player,AI.profile(player,role,{strength:75})),raw=Number(player.rating),rating=Number.isFinite(raw)&&raw>0?clamp(raw>10?raw/10:raw,5,9.5):null;
 const technique=mode==='bowling'?base.control*.36+base.passing*.46+base.finishing*.18:base.control*.45+base.passing*.25+base.finishing*.20+base.aerial*.10;
 const skill=clamp(5+(technique-.35)*5+(rating==null?0:(rating-6.8)*.38),5,9.5),fields=base.attributeFields||[];
 return{skill,technique,control:base.control,passing:base.passing,finishing:base.finishing,rating,role,fields,basis:fields.length?'explicit-attributes':rating!=null?'role-and-roster-rating':'role-prior',verified:base.verified===true};
}
function ability(p,mode){return profile(p,mode).skill;}
function available(p){return !p.squadOut&&!['unavailable','injured','suspended','out'].includes(p.availability);}
function isKeeper(p){return(p.naturalRoles||p.roles||[p.position]).includes('GK');}
function best(players,n,mode){return players.filter(p=>available(p)&&!isKeeper(p)).slice().sort((a,b)=>ability(b,mode)-ability(a,mode)||String(a.id).localeCompare(String(b.id))).slice(0,n);}
function analyse(sides,mode='footvolley'){
 const rows=sides.map(s=>s.players.map(p=>({id:String(p.id),name:p.name,...profile(p,mode)}))),strength=rows.map(ps=>ps.reduce((v,p)=>v+p.skill,0)/Math.max(1,ps.length)),share=1/(1+Math.exp(-(strength[0]-strength[1])*.95));
 return{mode,players:rows,strength,winShare:[share,1-share],basis:'entertainment-model-not-calibrated',signature:hash(JSON.stringify(rows.map(ps=>ps.map(p=>[p.id,p.skill,p.fields,p.rating])))),label:'role priors + available player attributes / roster rating'};
}
function seed(base,sides,mode,settings={}){return hash(JSON.stringify([base,analyse(sides,mode).signature,mode,settings]));}
function importFixture(registry,extra,home,away){
 if(!extra||String(extra.home?.id)!==String(home)||String(extra.away?.id)!==String(away))return false;
 const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/ı/g,'i');let imported=false;
 for(const side of ['home','away']){const latest=extra[side];if(!Array.isArray(latest.players)||latest.players.length!==11)continue;let entry=registry.teams[String(latest.id)];if(!entry&&latest.name){entry={name:latest.name,asOf:latest.date||null,fixtureOnly:true,team:{name:latest.name,formation:'4-3-3',players:[],bench:[]}};registry.teams[String(latest.id)]=entry;}if(!entry?.team)continue;
 const prior=[...entry.team.players,...entry.team.bench||[]],out=new Set((latest.out||[]).map(normalize)),norm=p=>{const old=prior.find(q=>String(q.id)===String(p.id))||prior.find(q=>normalize(q.name)===normalize(p.name)),role=p.slot?.role||p.position||(p.keeper?'GK':old?.position||'CM');return{...old,...p,id:String(p.id),naturalRoles:old?.naturalRoles||[role],roles:old?.roles||[role],position:role,number:p.number??old?.number,rating:Number.isFinite(p.rating)&&p.rating>0?p.rating:old?.rating,attributes:p.attributes||old?.attributes,appearance:p.appearance||old?.appearance,availability:out.has(normalize(p.name))?'unavailable':p.availability||old?.availability};};
 const xi=latest.players.map(norm);if(!xi.some(isKeeper))continue;const bench=(latest.bench||[]).map(norm).filter(p=>!xi.some(q=>q.id===p.id)),seen=new Set([...xi,...bench].map(p=>p.id));entry.team={...entry.team,players:xi,bench:[...bench,...prior.filter(p=>!seen.has(String(p.id))).map(p=>({...p,squadOut:true}))]};imported=true;
 }return imported;
}
return{hash,profile,ability,available,isKeeper,best,analyse,seed,importFixture};});
