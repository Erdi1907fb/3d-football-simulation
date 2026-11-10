/* Presentation policy shared by preview, screenshots and MP4. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f();else r.Next90JaponBroadcast=f();})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const INTRO=1.6;
function labelSlots(contest,frame,time){if(frame.finished)return[];if(time<INTRO)return frame.players.map((p,i)=>frame.active[p.team]?i:-1).filter(i=>i>=0);
 const save=contest.events.filter(e=>['save','keeper_catch','keeper_control'].includes(e.type)&&e.at<=time&&time-e.at<.85).at(-1);if(save){const slot=save.actorIndex??frame.players.findIndex(p=>p.keeper&&p.team===save.team);if(slot>=0)return[slot];}
 return frame.owner>=0?[frame.owner]:[];
}
function ellipsis(ctx,text,width){text=String(text);if(ctx.measureText(text).width<=width)return text;while(text.length&&ctx.measureText(text+'…').width>width)text=text.slice(0,-1);return text.trimEnd()+'…';}
return{INTRO,labelSlots,ellipsis};});
