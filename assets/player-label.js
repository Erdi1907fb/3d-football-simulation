(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.SekmePlayerLabel=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
// Pure, seek-safe selection: never guess possession from the nearest player.
function select(s){
 if(!s||s.pregame||s.substitution||s.review||s.replay||s.ruleReplay||s.preReview||s.outOfPlay||s.offside||s.transition>.2)return null;
 let p=null,kind='possession';
 if(s.phase==='celebration'&&s.celebration&&['run','solo','join','group'].includes(s.celebration.stage)){
  p=s.players.find(p=>p.id===s.celebration.scorer);kind='scorer';
 }else if(['playing','interception','kickoff','goal'].includes(s.phase)&&s.ball?.y<.6){
  const k=s.kickoff,owner=k?(k.age<.6?k.taker:k.age>=1.25&&k.age<1.7?k.receiver:k.age>=2.35?k.secondReceiver:null):s.owner;
  p=Number.isInteger(owner)?s.players.find(p=>p.id===owner):null;
  if(!p||Math.hypot(p.x-s.ball.x,p.z-s.ball.z)>1.25||p.fall||p.tackle)p=null;
 }
 // A released shot has no owner. Keep its actual actor for a short,
 // deterministic hold; never infer the shooter from proximity to a flying ball.
 if(!p&&['playing','interception','goal'].includes(s.phase)&&Number.isInteger(s.kick?.actor)&&s.kick.age>=-.18&&s.kick.age<=1.15){p=s.players.find(p=>p.id===s.kick.actor);kind='kick';}
 if(!p||p.dismissed||p.substitutionHidden||p.fall||p.tackle)return null;
 const name=String(p.playingName||p.shirtName||p.playerName||'').replace(/[\u0000-\u001f\u007f]/g,'').trim();
 return name?{id:p.id,playerId:p.playerId,name,kind,opacity:kind==='kick'?Math.min(1,(1.15-s.kick.age)/.18):1}:null;
}
function draw(ctx,w,h,label){
 if(!label||label.x<.045||label.x>.955||label.y<.17||label.y>.83)return null;
 const u=Math.min(w/720,h/720),size=20*u,pad=11*u,hh=31*u;
 ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,label.opacity??1));ctx.font=`700 ${size}px "Sekme Jersey", Arial, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
 let name=label.name;const max=Math.min(w*.33,220*u);while(name.length>2&&ctx.measureText(name).width>max)name=Array.from(name).slice(0,-2).join('')+'…';
 const ww=ctx.measureText(name).width+pad*2,x=w*label.x,y=h*label.y-hh;
 // Hide near an edge instead of pinning a detached label to the screen border.
 if(x-ww/2<12*u||x+ww/2>w-12*u){ctx.restore();return null;}
 ctx.shadowColor='#0008';ctx.shadowBlur=5*u;ctx.shadowOffsetY=2*u;
 ctx.fillStyle='#0a1726d9';ctx.beginPath();ctx.roundRect(x-ww/2,y,ww,hh,6*u);ctx.fill();
 ctx.shadowBlur=0;ctx.shadowOffsetY=0;ctx.strokeStyle='#ffffff2c';ctx.lineWidth=.75*u;ctx.stroke();
 ctx.fillStyle='#f8fafc';ctx.fillText(name,x,y+hh*.52);ctx.fillStyle='#e7edf0aa';ctx.beginPath();ctx.moveTo(x-3*u,y+hh+3*u);ctx.lineTo(x+3*u,y+hh+3*u);ctx.lineTo(x,y+hh+6*u);ctx.closePath();ctx.fill();ctx.restore();
 return{x:x-ww/2,y,w:ww,h:hh,text:name};
}
return{select,draw};
});
