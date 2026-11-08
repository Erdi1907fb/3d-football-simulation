(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f();else r.SekmeCompetitionRules=f();})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const limits=Object.freeze({'concept':15,'ucl':12,'uel':12,'uecl':12,'unl':12,'intl':15,'tr.1':10,'en.1':9,'de.1':9,'fr.1':9,'es.1':12,'it.1':15});
function benchLimit(competition){return limits[typeof competition==='string'?competition:competition?.competitionId]||12;}
function bench(players,starters,competition){const ids=new Set((starters||[]).map(p=>String(p.id))),out=[],numbers=new Set((starters||[]).filter(p=>Number.isInteger(p.number)).map(p=>p.number)),names=new Set((starters||[]).map(p=>p.name));for(const p of players||[]){if(!p?.id||!p.name||ids.has(String(p.id))||names.has(p.name)||Number.isInteger(p.number)&&numbers.has(p.number))continue;ids.add(String(p.id));names.add(p.name);if(Number.isInteger(p.number))numbers.add(p.number);out.push(p);if(out.length>=benchLimit(competition))break;}return out;}
return{limits,benchLimit,bench};
});
