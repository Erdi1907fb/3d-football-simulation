/* Head-anchored action names; never a permanent list over every player. Shared by preview/MP4. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('./player-label'),require('./japon-broadcast'));else r.Next90CompetitionLabels=f(r.SekmePlayerLabel,r.Next90JaponBroadcast);})(typeof globalThis!=='undefined'?globalThis:this,function(PlayerLabel,ArenaBroadcast){'use strict';
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),overlap=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
 function name(player){return String(player?.playerName||player?.name||player?.playingName||player?.shirtName||player?.shortName||'').replace(/[\u0000-\u001f\u007f]/g,'').trim();}
 function select(state,{frame,time=0,events=[],penaltyFrame}={}){
  if(!state||state.phase==='ceremony'||state.phase==='finished'||state.competitionCeremony)return[];
  const tag=(id,kind)=>{const p=state.players.find(p=>p.id===id);return p&&!p.dismissed&&!p.substitutionHidden&&(p.keeper||!p.fall&&!p.tackle)&&name(p)?[{id:p.id,playerId:p.playerId,name:name(p),kind}]:[];};
  if(penaltyFrame){const f=penaltyFrame;if(f.finished||time>f.kick.resolvedAt+.9)return[];return tag(f.goalkeeper.dive>.05?(1-f.kick.team)*11:state.players.find(p=>p.playerId===f.kick.shooter.id)?.id,f.goalkeeper.dive>.05?'keeper':'kick');}
  if(frame){if(frame.finished)return[];const slots=time<ArenaBroadcast.INTRO?(frame.owner>=0?[frame.owner]:[]):ArenaBroadcast.labelSlots({events},frame,time);if(slots.length)return tag(slots[0],frame.players[slots[0]]?.keeper?'keeper':'possession');
   const last=events.filter(e=>e.at<=time&&time-e.at<1.15&&['pass','shot','keeper_distribution'].includes(e.type)).at(-1);if(last){if(last.type==='pass'&&Number.isInteger(last.receiverIndex)){const p=frame.players[last.receiverIndex];if(p&&Math.hypot(p.x-frame.ball.x,p.z-frame.ball.z)<2.5)return tag(last.receiverIndex,'receiver');}return tag(last.actorIndex,'kick');}return[];
  }
  if(state.endSequence||state.pregame||state.substitution||state.review||state.replay||state.ruleReplay||state.preReview||state.outOfPlay||state.offside||state.transition>.2)return[];
  const now=state.time||0,save=events.filter(e=>e.at<=now&&now-e.at<.85&&['save','ball_secured'].includes(e.type)).at(-1);if(save){const p=state.players.find(p=>save.playerId?p.playerId===save.playerId:p.id===save.actor);if(p?.keeper)return tag(p.id,'keeper');}
  const pass=state.owner==null&&events.filter(e=>e.type==='pass'&&e.at<=now&&now-e.at<1.8&&Number.isInteger(e.receiver)).at(-1);if(pass){const p=state.players.find(p=>p.id===pass.receiver);if(p&&Math.hypot(p.x-state.ball.x,p.z-state.ball.z)<2.5)return tag(p.id,'receiver');}
  const chosen=PlayerLabel.select(state);return chosen?[chosen]:[];
 }
 function layout(anchors,width,height,measure){
  const portrait=width<height,b=portrait?{left:50,right:900,top:270,bottom:1250}:{left:45,right:1875,top:30,bottom:805},scale=width/(portrait?1080:1920),bounds=Object.fromEntries(Object.entries(b).map(([k,v])=>[k,v*scale])),font=(portrait?21:23)*scale,h=30*scale,gap=4*scale,placed=[];
  for(const a of anchors.filter(a=>a.name&&Number.isFinite(a.x)&&Number.isFinite(a.y)&&a.depth>=-1&&a.depth<=1&&a.x>=bounds.left&&a.x<=bounds.right&&a.y>=bounds.top&&a.y<=bounds.bottom).sort((a,b)=>(a.priority??1)-(b.priority??1)||a.y-b.y||a.id-b.id)){
   let text=a.name,size=font;const limit=(portrait?215:260)*scale;while(size>16*scale&&measure(text,size)>limit)size-=scale;while(measure(text,size)>limit&&Array.from(text).length>3)text=Array.from(text).slice(0,-2).join('')+'…';const w=Math.max(50*scale,measure(text,size)+18*scale),baseY=a.y-h-8*scale,candidates=[];
   for(let row=0;row<=9;row++)for(const direction of row?[ -1,1]:[0])for(const dx of[0,-32,32,-64,64,-96,96]){const x=clamp(a.x-w/2+dx*scale,bounds.left,bounds.right-w),y=clamp(baseY+row*direction*(h+gap),bounds.top,bounds.bottom-h),box={x,y,w,h},collision=placed.reduce((n,p)=>n+overlap({x:x-gap,y:y-gap,w:w+2*gap,h:h+2*gap},p),0),distance=Math.abs(y-baseY)+Math.abs(x+w/2-a.x)*1.5;candidates.push({...box,collision,cost:collision*1000+distance});}
   const box=candidates.sort((a,b)=>a.cost-b.cost)[0];placed.push({...box,id:a.id,name:a.name,text,font:size,anchorX:a.x,anchorY:a.y,color:a.color,leader:Math.abs(box.x+box.w/2-a.x)>12*scale||Math.abs(box.y-baseY)>12*scale});
  }
  return placed;
 }
 function draw(ctx,width,height,anchors){const tags=layout(anchors,width,height,(text,size)=>{ctx.font=`700 ${size}px Arial,sans-serif`;return ctx.measureText(text).width;});ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';
  for(const tag of tags){if(tag.leader){ctx.strokeStyle='#ffffff90';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(tag.anchorX,tag.anchorY);ctx.lineTo(tag.x+tag.w/2,tag.y+tag.h);ctx.stroke();}ctx.fillStyle='#071922e8';ctx.beginPath();ctx.roundRect(tag.x,tag.y,tag.w,tag.h,4);ctx.fill();if(Number.isFinite(tag.color)){ctx.fillStyle='#'+tag.color.toString(16).padStart(6,'0');ctx.fillRect(tag.x+2,tag.y+5,3,tag.h-10);}ctx.font=`700 ${tag.font}px Arial,sans-serif`;ctx.fillStyle='#ffffff';ctx.fillText(tag.text,tag.x+tag.w/2,tag.y+tag.h/2);}
  ctx.restore();return tags;
 }
 return{name,select,layout,draw};
});
