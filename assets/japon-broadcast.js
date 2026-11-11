/* Presentation policy shared by preview, screenshots and MP4. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f();else r.Next90JaponBroadcast=f();})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const INTRO=1.6;
function labelSlots(contest,frame,time){if(frame.finished)return[];if(time<INTRO)return frame.players.map((p,i)=>frame.active[p.team]?i:-1).filter(i=>i>=0);
 const save=contest.events.filter(e=>['save','keeper_catch','keeper_control'].includes(e.type)&&e.at<=time&&time-e.at<.85).at(-1);if(save){const slot=save.actorIndex??frame.players.findIndex(p=>p.keeper&&p.team===save.team);if(slot>=0)return[slot];}
 if(frame.kickoff)return[frame.kickoff.taker];
 return frame.owner>=0?[frame.owner]:[];
}
function ellipsis(ctx,text,width){text=String(text);if(ctx.measureText(text).width<=width)return text;while(text.length&&ctx.measureText(text+'…').width>width)text=text.slice(0,-1);return text.trimEnd()+'…';}
function result(contest){const winners=contest.timedOut||contest.draw?[]:contest.ranks.filter(r=>r.rank===1).map(r=>r.team);return{winners,draw:!!contest.draw,incomplete:!!contest.timedOut,score:contest.stats.map(s=>s.gf)};}
function scorers(contest,team){const counts=new Map();for(const e of contest.events.filter(e=>e.type==='goal'&&e.team===team)){const key=(e.ownGoal?'OG:':'')+e.actor;counts.set(key,(counts.get(key)||0)+1);}return [...counts].map(([name,goals])=>({name:name.replace(/^OG:/,''),ownGoal:name.startsWith('OG:'),goals}));}
function standings(contest){return contest.ranks.map(r=>{const side=contest.sides[r.team],members=[side.player,side.midfielder,side.defender,side.defender2,side.keeper].filter(Boolean);return{...r,medal:contest.timedOut?null:r.rank===1?'gold':r.rank===2?'silver':r.rank===3?'bronze':null,label:side.isTeam?side.name:members.map(p=>p.name).join(' · '),points:contest.stats[r.team].points,goals:contest.stats[r.team].gf};});}
return{INTRO,labelSlots,ellipsis,result,scorers,standings};});
