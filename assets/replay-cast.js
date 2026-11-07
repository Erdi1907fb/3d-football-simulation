/* Reviewed replay presentation only; never changes a forecast or available squad. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f();else r.SekmeReplayCast=f();})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const scenes={'4f0b86b64af636978150a4fc':{seed:790353970,goals:[{minute:8,team:1,name:'Kerem Aktürkoğlu'},{minute:31,team:0,name:'Victor Osimhen'}]}};
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/ı/g,'i').replace(/[^a-z0-9]/g,'');
function resolve(fixture,seed,c,players){const entry=scenes[fixture?.id];if(!entry||entry.seed!==seed||!(c.result==='goal'||c.followUpGoal))return null;const goal=entry.goals.find(g=>g.minute===c.minute&&g.team===c.team);if(!goal)return null;let matches=players.map((p,index)=>({p,index})).filter(v=>norm(v.p.name)===norm(goal.name));if(!matches.length){const last=norm(goal.name.split(' ').pop());matches=players.map((p,index)=>({p,index})).filter(v=>norm((v.p.name||'').split(' ').pop())===last);}if(matches.length!==1)return null;const {p,index}=matches[0];if(p.slot?.role==='GK'||c.dismissed?.includes(c.team*11+index))return null;return{index,playerId:p.id,name:p.name,source:'reviewed-replay-presentation'};}
return{resolve};
});
