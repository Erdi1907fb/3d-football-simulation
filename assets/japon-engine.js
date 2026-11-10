/* Multi-goal orchestration. Shared ball-aero integrates every free ball at 120 Hz.
   Metres/seconds; no authored goals, score correction or unseeded randomness. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('./ball-aero.js'),require('./japon-layout.js'));else r.Next90Japon=f(r.Next90BallAero,r.Next90JaponLayout);})(typeof globalThis!=='undefined'?globalThis:this,function(A,Layout){'use strict';
const DT=1/120,R=.11,clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
function random(seed){let s=seed>>>0||1;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296;};}
function ability(p){const raw=Number(p.rating)||7;return clamp(raw>10?(raw-50)/45:(raw-5)/4,0,1);}
function goalsFor(n,goalWidth=5){return Layout.create(n,goalWidth).goals;}
function lane(from,to,players,owner){let pressure=0;const dx=to.x-from.x,dz=to.z-from.z,dd=dx*dx+dz*dz;for(const p of players){if(!p.active||p.team===owner||p.keeper)continue;const u=clamp(((p.x-from.x)*dx+(p.z-from.z)*dz)/dd,0,1),d=Math.hypot(p.x-from.x-u*dx,p.z-from.z-u*dz);if(u>.05&&u<.97)pressure+=Math.exp(-d*d/2);}return pressure;}
function targetGoal(from,goals,players,active,owner,rng){return goals.filter(g=>g.team!==owner&&active[g.team]).map(g=>({g,value:dist(from,g)*.035+lane(from,g,players,owner)*2.8+rng()*.95})).sort((a,b)=>a.value-b.value)[0]?.g;}
function create(options){const sides=options.sides;if(!Array.isArray(sides)||sides.length<2||sides.length>6)throw Error('Japon Kale needs 2–6 sides');const small=sides.length===2,playersPerSide=small?4:3;for(const s of sides){const members=[s.keeper,s.defender,...(small?[s.midfielder]:[]),s.player];if(members.some(p=>!p?.name||p.id==null)||new Set(members.map(p=>String(p.id))).size!==playersPerSide)throw Error('Each side needs different players for every role');}
for(const s of sides)if(!(s.keeper.naturalRoles?.length?s.keeper.naturalRoles:s.keeper.roles||[s.keeper.position]).includes('GK'))throw Error('Select a goalkeeper for the keeper slot');
const n=sides.length,seed=options.seed>>>0,rng=random(seed),mode=small?'match':options.mode==='points'?'points':'elimination',limit=clamp(Number(options.goalLimit)||2,1,5),maxTime=mode!=='elimination'?clamp(Number(options.seconds)||60,30,180):900,layout=Layout.create(n,options.goalWidth||5),goals=layout.goals,radius=layout.apothem,active=Array(n).fill(true),stats=sides.map(()=>({gf:0,ga:0,roundGA:0,points:0,eliminatedAt:null})),events=[],frames=[],eliminated=[],players=goals.flatMap((g,i)=>{const make=(role,identity,d,tangent=0)=>({team:i,role,identity,keeper:role==='keeper',x:g.x-g.nx*d-g.nz*tangent,z:g.z-g.nz*d+g.nx*tangent,heading:Math.atan2(-g.nx,-g.nz),speed:0,dive:0,active:true});return[make('keeper',sides[i].keeper,.7),make('defender',sides[i].defender,4.7,1.5),...(small?[make('midfielder',sides[i].midfielder,radius*.82+(rng()-.5)*.7,(i?1:-1)*(.9+rng()*.4))]:[]),make('attacker',sides[i].player,radius*.64,-1.2)];});
const index=(team,role)=>team*playersPerSide+(role==='keeper'?0:role==='defender'?1:role==='midfielder'?2:playersPerSide-1),ownerTeam=()=>owner<0?-1:players[owner].team;
let b=A.state({x:0,y:2.4,z:0},{x:0,y:0,z:0},null,{surface:options.weather}),owner=-1,lastTouch=-1,lastActor=null,lastActorIndex=-1,nextDecision=0,kickAt=-10,pauseUntil=0,resetAt=0,round=1,ended=false,endAt=maxTime,shotTarget=null,shotAt=-10,attackTarget=null,targetDecision=0;
const emit=(type,t,extra={})=>events.push({type,at:t,round,...extra});
function reset(t){b=A.state({x:0,y:2.4,z:0},{x:0,y:0,z:0},null,{surface:options.weather});owner=-1;lastTouch=-1;lastActor=null;lastActorIndex=-1;shotTarget=null;emit('drop',t);}
function snap(t){frames.push({t,ball:{x:b.x,y:b.y,z:b.z},owner,round,players:players.map(({identity,...p})=>({...p})),stats:stats.map(s=>({...s})),active:active.slice()});}
function move(p,x,z,speed){const dx=x-p.x,dz=z-p.z,d=Math.hypot(dx,dz),desired=Math.min(speed,Math.sqrt(2*14*d)),vx=d>.01?dx/d*desired:0,vz=d>.01?dz/d*desired:0,change=Math.hypot(vx-(p.vx||0),vz-(p.vz||0)),mix=change?Math.min(1,14*DT/change):1;p.vx=(p.vx||0)+(vx-(p.vx||0))*mix;p.vz=(p.vz||0)+(vz-(p.vz||0))*mix;p.speed=Math.hypot(p.vx,p.vz);p.x+=p.vx*DT;p.z+=p.vz*DT;if(p.speed>.15)p.heading=Math.atan2(p.vx,p.vz);Layout.contain(p,layout,.4);}
emit('drop',0);snap(0);
for(let step=1;step<=Math.ceil(maxTime/DT)&&!ended;step++){const t=step*DT;
 if(resetAt&&t>=resetAt){reset(t);resetAt=0;}
 if(t<pauseUntil){if(step%6===0)snap(t);continue;}
 // One keeper anchors the goal. Defenders screen passing/shooting lanes; attackers press and break forward.
 for(let i=0;i<n;i++){
 const g=goals[i],k=players[index(i,'keeper')];for(let j=0;j<playersPerSide;j++)players[i*playersPerSide+j].active=active[i];if(!active[i])continue;
 const tangent=clamp((b.x-g.x)*(-g.nz)+(b.z-g.z)*g.nx,-g.width*.39,g.width*.39),anticipate=clamp((t-shotAt-.14)*4,0,1);move(k,g.x-g.nx*.7-g.nz*tangent*anticipate,g.z-g.nz*.7+g.nx*tangent*anticipate,2.7+ability(sides[i].keeper)*.9);k.heading=Math.atan2(b.x-k.x,b.z-k.z);k.dive=Math.max(0,k.dive-DT*1.7);
 for(let local=1;local<playersPerSide;local++){
 const at=i*playersPerSide+local,p=players[at],defender=p.role==='defender',midfielder=p.role==='midfielder',own=ownerTeam()===i,danger=owner>=0&&!own&&dist(b,g)<radius*.95;
 if(owner===at){if(!attackTarget||!active[attackTarget.team]||t>=targetDecision){attackTarget=targetGoal(p,goals,players,active,i,rng);targetDecision=t+.65;}const goal=attackTarget;if(goal){const offset=Math.sin(at*1.7)*1.1;move(p,goal.x*.6-goal.nz*offset,goal.z*.6+goal.nx*offset,3.8);}}
 else{
 let x=b.x,z=b.z;
 if(defender){const reach=dist(b,g),depth=clamp(reach*.48,3.2,radius*.55);x=g.x-g.nx*depth-g.nz*tangent*.7;z=g.z-g.nz*depth+g.nx*tangent*.7;if(own){x=g.x-g.nx*(radius*.56)-g.nz*3;z=g.z-g.nz*(radius*.56)+g.nx*3;}if(reach<6.5&&b.y<1.3){x=b.x;z=b.z;}}
 else if(midfielder){if(own){const op=players[owner];x=op.x-g.nx*1.8+g.nz*3.4;z=op.z-g.nz*1.8-g.nx*3.4;}else if(owner<0||dist(p,b)<5){x=b.x;z=b.z;}else{x=b.x*.6+g.x*.17;z=b.z*.6+g.z*.17;}}
 else if(own){const op=players[owner],sign=i%2?1:-1;x=op.x-g.nz*3.2*sign-g.nx*2;z=op.z+g.nx*3.2*sign-g.nz*2;}
 else if(danger){x=b.x*.8+g.x*.2;z=b.z*.8+g.z*.2;}else{const closer=players.filter(q=>q.active&&q.role==='attacker'&&q.team!==i&&dist(q,b)<dist(p,b)-.15).length;if(closer>=2){x=g.x*.38+b.x*.25-g.nz*2.5;z=g.z*.38+b.z*.25+g.nx*2.5;}}
 move(p,x,z,(defender?4.5:5)+ability(p.identity)*.9);

 }
 }
 }
 // Resolve body spacing before ball control, so challengers do not occupy one point.
 for(let a=0;a<players.length;a++)for(let j=a+1;j<players.length;j++){const p=players[a],q=players[j];if(!p.active||!q.active)continue;let dx=q.x-p.x,dz=q.z-p.z,d=Math.hypot(dx,dz);if(d>=.84)continue;if(d<1e-6){dx=Math.cos(a*2.4+j);dz=Math.sin(a*2.4+j);d=1;}const overlap=(.84-Math.min(.84,Math.hypot(q.x-p.x,q.z-p.z)))*.9,weight=p.keeper?.1:q.keeper?.9:.5;p.x-=dx/d*overlap*weight;p.z-=dz/d*overlap*weight;q.x+=dx/d*overlap*(1-weight);q.z+=dz/d*overlap*(1-weight);}
 for(const p of players)if(p.active)Layout.contain(p,layout,.35);
 // Resolve ball races AFTER every runner has moved; array order cannot award kickoff.
 if(b.y<1.05&&t-kickAt>.4){const contenders=players.map((p,at)=>({p,at,d:dist(p,b)})).filter(q=>q.p.active&&!q.p.keeper&&q.at!==owner&&q.d<.72&&(owner<0||q.p.team!==ownerTeam())).map(q=>({...q,control:q.d+rng()*.08-ability(q.p.identity)*.035})).sort((a,b)=>a.control-b.control),q=contenders[0];if(q&&(owner<0||rng()<DT*1.0)){owner=q.at;lastTouch=q.p.team;lastActor=q.p.identity.name;lastActorIndex=q.at;nextDecision=t+.55+rng()*.65;attackTarget=targetGoal(q.p,goals,players,active,q.p.team,rng);targetDecision=t+.65;emit('possession',t,{team:lastTouch,actor:lastActor,actorIndex:owner});}}
 if(owner>=0){const p=players[owner];const tx=p.x+Math.sin(p.heading)*.35,tz=p.z+Math.cos(p.heading)*.35,dd=Math.hypot(tx-b.x,tz-b.z)||1,move=Math.min(dd,10*DT);b.x+=(tx-b.x)/dd*move;b.z+=(tz-b.z)/dd*move;b.y=R;b.vx=b.vy=b.vz=0;
 if(t>=nextDecision){const teammates=players.filter(q=>q.active&&q.team===p.team&&!q.keeper&&q!==p&&dist(p,q)>2.8&&dist(p,q)<11&&lane(p,q,players,p.team)<.8).sort((a,b)=>dist(a,attackTarget||{x:0,z:0})-dist(b,attackTarget||{x:0,z:0})),pass=teammates.length&&rng()<(p.role==='attacker'?.22:small?.62:.42)?teammates[0]:null;if(pass){const flight=clamp(dist(b,pass)/11,.25,.95),target=Layout.contain({x:pass.x+(pass.vx||0)*flight*.55,y:R,z:pass.z+(pass.vz||0)*flight*.55},layout,.8),velocity=A.solve(b,target,flight,{x:0,y:0,z:0},{surface:options.weather});b=A.state(b,velocity,null,{surface:options.weather});emit('pass',t,{team:p.team,actor:p.identity.name,actorIndex:owner,receiver:pass.identity.name,receiverIndex:players.indexOf(pass)});lastTouch=p.team;lastActor=p.identity.name;lastActorIndex=owner;owner=-1;kickAt=t;}else{const g=targetGoal(p,goals,players,active,p.team,rng);if(g){shotTarget=g;p.heading=Math.atan2(g.x-p.x,g.z-p.z);const lateral=(rng()-.5)*(5.8-ability(p.identity)*1.1),target={x:g.x-g.nz*lateral,y:.3+rng()*1.8,z:g.z+g.nx*lateral},flight=clamp(dist(b,target)/18,.45,1.7),spin={x:0,y:(rng()-.5)*9,z:0},v=A.solve(b,target,flight,spin,{surface:options.weather});b=A.state(b,v,spin,{surface:options.weather});emit('shot',t,{team:p.team,against:g.team,actor:p.identity.name,actorIndex:owner});lastTouch=p.team;lastActor=p.identity.name;lastActorIndex=owner;owner=-1;kickAt=shotAt=t;}}}
 }else{const prev={x:b.x,y:b.y,z:b.z};A.step(b,DT);
 // Swept body/glove contact: a save is recorded only on an actual reachable crossing.
 for(let i=0;i<n;i++){if(!active[i])continue;const k=players[index(i,'keeper')],dx=b.x-prev.x,dz=b.z-prev.z,dd=dx*dx+dz*dz,u=dd?clamp(((k.x-prev.x)*dx+(k.z-prev.z)*dz)/dd,0,1):0,d=Math.hypot(prev.x+u*dx-k.x,prev.z+u*dz-k.z),height=prev.y+(b.y-prev.y)*u;
 if(t-kickAt>.12&&d<(.5+ability(sides[i].keeper)*.3)&&height<1.85&&Math.hypot(b.vx,b.vz)>2){const g=goals[i],contactSide=Math.sign((b.x-k.x)*(-g.nz)+(b.z-k.z)*g.nx)||1,speed=Math.hypot(b.vx,b.vz)*.62;b.vx=-g.nx*speed-g.nz*(rng()-.5)*5;b.vz=-g.nz*speed+g.nx*(rng()-.5)*5;b.vy=1.2;b.x=k.x-g.nx*.8;b.z=k.z-g.nz*.8;k.dive=.85;k.diveSide=contactSide;lastTouch=i;lastActor=sides[i].keeper.name;lastActorIndex=index(i,'keeper');kickAt=t;emit('save',t,{team:i,actor:sides[i].keeper.name});}}
 // Field players can physically block a shot; lane selection is not only cosmetic.
 for(const p of players){if(!p.active||p.keeper||p.team===lastTouch||t-kickAt<.16)continue;const dx=b.x-prev.x,dz=b.z-prev.z,dd=dx*dx+dz*dz,u=dd?clamp(((p.x-prev.x)*dx+(p.z-prev.z)*dz)/dd,0,1):0;if(Math.hypot(prev.x+dx*u-p.x,prev.z+dz*u-p.z)<.35&&prev.y+(b.y-prev.y)*u<1.4){b.vx*=-.38;b.vz*=-.38;b.vy=.5;lastTouch=p.team;lastActor=p.identity.name;lastActorIndex=players.indexOf(p);kickAt=t;emit('block',t,{team:p.team,actor:lastActor});break;}}
 for(const g of goals){const old=prev.x*g.nx+prev.z*g.nz,now=b.x*g.nx+b.z*g.nz,lat=-b.x*g.nz+b.z*g.nx;
 if(old<=radius&&now>radius&&Math.abs(lat)<g.width/2+R&&b.y<g.height+R&&active[g.team]){
 if(Math.abs(lat)>g.width/2-R||b.y>g.height-R){const vn=b.vx*g.nx+b.vz*g.nz;b.vx-=1.7*vn*g.nx;b.vz-=1.7*vn*g.nz;b.x=prev.x;b.z=prev.z;emit('post',t,{team:lastTouch,against:g.team});continue;}
 if(lastTouch<0)continue;const credited=small&&lastTouch===g.team?1-g.team:lastTouch;stats[g.team].ga++;stats[g.team].roundGA++;stats[g.team].points--;if(credited!==g.team){stats[credited].gf++;stats[credited].points++;}emit('goal',t,{team:credited,against:g.team,ownGoal:lastTouch===g.team,actor:lastActor||sides[lastTouch].player.name,actorIndex:lastActorIndex});
 if(mode==='elimination'&&stats[g.team].roundGA>=limit){active[g.team]=false;stats[g.team].eliminatedAt=t;eliminated.push(g.team);emit('elimination',t,{team:g.team});round++;for(let i=0;i<n;i++)if(active[i])stats[i].roundGA=0;emit('round',t,{remaining:active.filter(Boolean).length});}
 snap(t);pauseUntil=t+1.4;resetAt=pauseUntil;if(mode==='elimination'&&active.filter(Boolean).length===1){ended=true;endAt=t+1.4;}break;
 }
 }
 // Circular boards keep play compact; eliminated goals become closed boards.
 if(!resetAt)for(const edge of layout.boundaries){const goalGap=goals.some(g=>active[g.team]&&Math.abs(g.nx-edge.nx)<1e-6&&Math.abs(g.nz-edge.nz)<1e-6&&Math.abs(-b.x*g.nz+b.z*g.nx)<g.width/2+R&&b.y<g.height+R);if(goalGap)continue;const excess=b.x*edge.nx+b.z*edge.nz-edge.d+R;if(excess>0){b.x-=edge.nx*excess;b.z-=edge.nz*excess;const vn=b.vx*edge.nx+b.vz*edge.nz;if(vn>0){b.vx-=1.7*vn*edge.nx;b.vz-=1.7*vn*edge.nz;}}}
 }
 if(step%6===0||ended)snap(t);
}
const timedOut=mode==='elimination'&&!ended,liveEnd=ended?endAt:maxTime,ranking=mode==='elimination'?[...stats.map((s,i)=>i).filter(i=>active[i]).sort((a,b)=>stats[a].ga-stats[b].ga||stats[b].gf-stats[a].gf||a-b),...eliminated.slice().reverse()]:stats.map((s,i)=>i).sort((a,b)=>stats[b].points-stats[a].points||stats[b].gf-stats[a].gf||stats[a].ga-stats[b].ga||a-b);
const ranks=ranking.map((team,i)=>({team,rank:i&&mode!=='elimination'&&stats[team].points===stats[ranking[i-1]].points&&stats[team].gf===stats[ranking[i-1]].gf?null:i+1}));for(let i=1;i<ranks.length;i++)if(ranks[i].rank===null)ranks[i].rank=ranks[i-1].rank;
const draw=small&&ranks.filter(r=>r.rank===1).length>1;let duration=liveEnd+5,finaleAt=liveEnd;emit('finish',finaleAt,{winner:timedOut||draw?null:ranking[0],tied:mode!=='elimination'&&ranks.filter(r=>r.rank===1).length>1});
// Highlights retain every goal and elimination, the opening race, and a final table.
const ranges=[[0,3],...events.filter(e=>e.type==='goal').map(e=>[Math.max(0,e.at-4),Math.min(liveEnd,e.at+1.4)])];
if(mode!=='elimination')ranges.push([Math.max(0,liveEnd-3),liveEnd]);
else ranges.push([Math.max(0,liveEnd-1.4),liveEnd]);
ranges.sort((a,b)=>a[0]-b[0]);const merged=[];for(const r of ranges){const prev=merged.at(-1);if(prev&&r[0]<=prev[1]+.2)prev[1]=Math.max(prev[1],r[1]);else merged.push(r.slice());}
let cursor=0;const segments=merged.map(([start,end])=>{const s={start,end,videoStart:cursor,videoEnd:cursor+end-start};cursor=s.videoEnd;return s;});
const toVideoTime=t=>{const s=segments.find(s=>t>=s.start-1e-7&&t<=s.end+1e-7);return s?s.videoStart+t-s.start:null;};
const fromVideoTime=t=>{const s=segments.find(s=>t<s.videoEnd)||segments.at(-1);return Math.min(liveEnd,s.start+Math.max(0,t-s.videoStart));};
finaleAt=cursor;duration=cursor+5;const videoEvents=events.filter(e=>e.type!=='finish'&&toVideoTime(e.at)!==null).map(e=>({...e,liveAt:e.at,at:toVideoTime(e.at)}));videoEvents.push({...events.at(-1),liveAt:liveEnd,at:finaleAt});
function sample(time){const videoTime=clamp(time,0,duration);time=fromVideoTime(Math.min(videoTime,finaleAt));let lo=0,hi=frames.length-1;while(lo<hi){const m=Math.ceil((lo+hi)/2);if(frames[m].t<=time)lo=m;else hi=m-1;}const a=frames[lo],c=frames[Math.min(lo+1,frames.length-1)],u=clamp((time-a.t)/(c.t-a.t||1),0,1),lerp=(x,y)=>x+(y-x)*u;return{...a,time:videoTime,liveTime:time,ball:{x:lerp(a.ball.x,c.ball.x),y:lerp(a.ball.y,c.ball.y),z:lerp(a.ball.z,c.ball.z)},players:a.players.map((p,i)=>({...p,x:lerp(p.x,c.players[i].x),z:lerp(p.z,c.players[i].z)})),finished:videoTime>=finaleAt,event:videoEvents.filter(e=>e.at<=videoTime).at(-1)};}
return{seed,mode,variant:small?'small-sided':'japon',draw,goalLimit:limit,sides,playersPerSide,layout,goals,events:videoEvents,liveEvents:events,segments,toVideoTime,fromVideoTime,liveDuration:liveEnd,frames,stats,ranking,ranks,duration,finaleAt,timedOut,winner:timedOut||draw?null:ranking[0],sample};}
return{create,goalsFor,lane,targetGoal,random};});
