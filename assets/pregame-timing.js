/* Seconds here are real video seconds, independent of match playback speed. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f();else r.SekmePregameTiming=f();})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
function plan(seconds){const extended=Number(seconds)===30,explicit=Number(seconds)===10;return{extended,total:extended?30:explicit?10:12,intro:extended?3:2,lineup:extended?11:explicit?3:4,ceremony:extended?5:2};}
function order(players){const rank=a=>a.slot?.role==='GK'?0:/^(CB|LB|RB|LWB|RWB|SW|DEF)$/.test(a.slot?.role)?1:/^(ST|CF|LW|RW|FW)$/.test(a.slot?.role)?3:2;return players.slice().sort((a,b)=>rank(a)-rank(b)||(a.slot?.x||0)-(b.slot?.x||0)||(a.slot?.z||0)-(b.slot?.z||0));}
function reveal(players,p){const sorted=order(players);if(!p.extended)return{players:sorted.map(a=>({a,alpha:1,scale:1})),bench:1,complete:true};const age=p.stageAge,step=.47,first=.35,fade=.34,done=first+Math.max(0,sorted.length-1)*step+fade,items=sorted.map((a,i)=>{const q=Math.max(0,Math.min(1,(age-first-i*step)/fade)),u=q*q*(3-2*q);return{a,alpha:u,scale:.86+.14*u};});return{players:items,bench:Math.max(0,Math.min(1,(age-done)/.45)),complete:age>=done};}
return{plan,order,reveal};
});
