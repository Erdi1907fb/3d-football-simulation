(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./stadium-layout.js'));else root.SekmeCelebration=factory(root.SekmeStadiumLayout);})(typeof globalThis!=='undefined'?globalThis:this,function(Layout){
'use strict';
const STEP=1/30,HOLD=3.8,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),gap=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z),turn=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
const destination=(team,dir,venue,variant=0)=>Layout.destination(team,dir,venue,variant);
function curve(a,b,c,u){const v=1-u;return{x:v*v*a.x+2*v*u*b.x+u*u*c.x,z:v*v*a.z+2*v*u*b.z+u*u*c.z};}
function path(a,b,c,obstacles){
 const clear=(a,b)=>{const dx=b.x-a.x,dz=b.z-a.z,len=dx*dx+dz*dz;return obstacles.every(o=>{const u=clamp(((o.x-a.x)*dx+(o.z-a.z)*dz)/Math.max(.001,len),0,1),d=Math.hypot(a.x+dx*u-o.x,a.z+dz*u-o.z);return d>=(o.radius||.96)||u<1e-5&&gap(a,o)<(o.radius||.96)&&gap(b,o)>gap(a,o);});};
 let points=Array.from({length:41},(_,i)=>curve(a,b,c,i/40));
 if(points.some((p,i)=>i&&!clear(points[i-1],p))){
  const nodes=[a,b];for(const o of obstacles)for(let k=0;k<8;k++){const p={x:o.x+Math.cos(k*Math.PI/4)*((o.radius||.96)+.46),z:o.z+Math.sin(k*Math.PI/4)*((o.radius||.96)+.46)};if(obstacles.every(o=>gap(p,o)>(o.radius||.96)+.04))nodes.push(p);}
  const costs=nodes.map(()=>Infinity),previous=nodes.map(()=>-1),visited=new Set();costs[0]=0;
  while(visited.size<nodes.length){let best=-1;for(let i=0;i<nodes.length;i++)if(!visited.has(i)&&(best<0||costs[i]<costs[best]))best=i;if(best<0||!Number.isFinite(costs[best])||best===1)break;visited.add(best);for(let i=1;i<nodes.length;i++)if(!visited.has(i)&&clear(nodes[best],nodes[i])){const cost=costs[best]+gap(nodes[best],nodes[i]);if(cost<costs[i]){costs[i]=cost;previous[i]=best;}}}
  if(Number.isFinite(costs[1])){const route=[];for(let i=1;i>=0;i=previous[i]){route.push(nodes[i]);if(i===0)break;}points=route.reverse().concat(c);}else points=[a,{x:(a.x+b.x)/2,z:Math.sign(b.z||1)*35},b,c];
 }
 let length=0;points=points.map((p,i)=>{if(i)length+=gap(p,points[i-1]);return {...p,d:length};});
 return{length,at(q){const d=clamp(q,0,1)*length;let i=1;while(i<points.length-1&&points[i].d<d)i++;const a=points[i-1],b=points[i],u=(d-a.d)/Math.max(.001,b.d-a.d);return{x:a.x+(b.x-a.x)*u,z:a.z+(b.z-a.z)*u};}};
}
function create({players,team,dir,flank,venue,scorerId,variant=0,holdSeconds=HOLD,soloSeconds=2.7,dismissed=[]}){
 const hold=clamp(holdSeconds,2,8),world=p=>({x:p.x*dir,z:p.z*dir*flank}),local=world,origin=world(players.find(p=>p.id===scorerId)||players.find(p=>p.team===team&&!p.keeper)),target=Layout.nearbyDestination(team,dir,venue,variant,origin);
 const runners=players.filter(p=>p.team===team&&!p.keeper&&!dismissed.includes(p.id)).sort((a,b)=>gap(world(a),origin)-gap(world(b),origin)).slice(0,6).map(p=>({...p,vx:0,vz:0})),scorer=runners.find(p=>p.id===scorerId)||runners[0],slots=Layout.groupSlots(target).slice(0,runners.length),assignment=new Map([[scorer.id,slots[0]]]),available=slots.slice(1);
 for(const p of runners.filter(p=>p!==scorer).sort((a,b)=>world(a).z-world(b).z)){let k=0;for(let i=1;i<available.length;i++)if(gap(world(p),available[i])<gap(world(p),available[k]))k=i;assignment.set(p.id,available.splice(k,1)[0]);}
 const fixedPlayers=players.filter(p=>(p.team!==team||p.keeper)&&!dismissed.includes(p.id)),allObstacles=[...fixedPlayers.map(p=>({...world(p),radius:.88,id:p.id})),...Layout.obstacles()];
 const routes=runners.map(p=>{const start=world(p),end=assignment.get(p.id),gate=target.side==='goal-side'?{x:Math.sign(target.x)*49,z:end.z}:{x:end.x,z:-29};
  const obs=allObstacles.filter(o=>o.x>=Math.min(start.x,gate.x,end.x)-3&&o.x<=Math.max(start.x,gate.x,end.x)+3&&o.z>=Math.min(start.z,gate.z,end.z)-3&&o.z<=Math.max(start.z,gate.z,end.z)+3);
  const route=path(start,gate,end,obs);return{length:route.length,end:local(end),at:q=>local(route.at(q))};
 });
 const scorerIndex=runners.indexOf(scorer),scorerTime=routes[scorerIndex].length/4.1+1.6,soloStart=scorerTime,soloEnd=soloStart+clamp(soloSeconds,2.7,4),joinAt=.65,teamTime=Math.max(0,...routes.filter((_,i)=>i!==scorerIndex).map(r=>r.length/4.2+1.8));
 let runDuration=Math.ceil(Math.max(soloEnd+.8,Math.min(joinAt+teamTime+1.1,soloEnd+3))/STEP)*STEP;const maxRun=runDuration,frames=[],staticLocal=allObstacles.map(p=>({...local(p),radius:p.radius||.88}));
 const record=()=>{const frame=new Float32Array(runners.length*7);runners.forEach((p,i)=>frame.set([p.x,p.z,p.vx,p.vz,p.heading,p.travel||0,p.speed||0],i*7));frames.push(frame);};record();
 for(let tick=1;tick<=Math.round(runDuration/STEP);tick++){
  const t=tick*STEP,old=runners.map(p=>({...p}));
  runners.forEach((p,i)=>{const o=old[i],isScorer=p.id===scorer.id,start=isScorer?0:joinAt,travelTime=isScorer?scorerTime:routes[i].length/4.2+1.8,age=Math.max(0,t-start),q=clamp(age/travelTime,0,1),smooth=q*q*(3-2*q),aim=routes[i].at(smooth);let vx=t<start?0:(aim.x-o.x)*5.5,vz=t<start?0:(aim.z-o.z)*5.5;
   for(const b of [...old,...staticLocal]){if(b.id===p.id)continue;const d=gap(o,b),r=b.radius||1.02;if(d<r+.20&&d>.001){const force=(r+.20-d)*7;vx+=(o.x-b.x)/d*force;vz+=(o.z-b.z)/d*force;}}
   const speed=Math.hypot(vx,vz),cap=Math.min(1,6.2/Math.max(.001,speed));vx*=cap;vz*=cap;const ax=vx-o.vx,az=vz-o.vz,acc=Math.hypot(ax,az),f=Math.min(1,9*STEP/Math.max(.001,acc));p.vx=o.vx+ax*f;p.vz=o.vz+az*f;p.x=o.x+p.vx*STEP;p.z=o.z+p.vz*STEP;
  });
  for(let pass=0;pass<3;pass++)for(let i=0;i<runners.length;i++){const a=runners[i];for(const b of [...runners.slice(0,i),...staticLocal]){const d=gap(a,b),r=b.radius||.90;if(d<r&&d>.001){const push=r-d,nx=(a.x-b.x)/d,nz=(a.z-b.z)/d,moving=runners.includes(b);a.x+=nx*push*(moving?.5:1);a.z+=nz*push*(moving?.5:1);if(moving){b.x-=nx*push*.5;b.z-=nz*push*.5;}}}}
  runners.forEach((p,i)=>{const o=old[i],w=world(p);w.x=clamp(w.x,-55.02,55.02);w.z=clamp(w.z,-34.75,34.75);Object.assign(p,local(w));const d=gap(p,o),max=6.65*STEP;if(d>max){p.x=o.x+(p.x-o.x)*max/d;p.z=o.z+(p.z-o.z)*max/d;}p.vx=(p.x-o.x)/STEP;p.vz=(p.z-o.z)/STEP;p.speed=Math.hypot(p.vx,p.vz);p.travel=(o.travel||0)+gap(p,o);const desired=p.speed>.18?Math.atan2(p.vx,p.vz):Math.atan2(local(target.media).x-p.x,local(target.media).z-p.z);p.heading=o.heading+clamp(turn(o.heading,desired),-4.7*STEP,4.7*STEP);});
  record();if(tick===Math.round(runDuration/STEP)&&runDuration<maxRun&&runners.some((p,i)=>gap(p,routes[i].end)>.35))runDuration+=1;
 }
 const ids=runners.map(p=>p.id),scorerArrival=soloStart;
 return{target,scorer:scorer.id,scorerArrival,leadDelay:joinAt,soloStart,soloEnd,runDuration,duration:runDuration+hold,hold,frames,ids,stageAt(time){return time<soloStart?'run':time<soloEnd?'solo':time<runDuration?'join':'group';},sample(time){const t=clamp(time/STEP,0,frames.length-1),i=Math.min(frames.length-2,Math.floor(t)),q=t-i,a=frames[i],b=frames[i+1];return ids.map((id,j)=>{const k=j*7;return{id,x:a[k]+(b[k]-a[k])*q,z:a[k+1]+(b[k+1]-a[k+1])*q,vx:a[k+2]+(b[k+2]-a[k+2])*q,vz:a[k+3]+(b[k+3]-a[k+3])*q,heading:a[k+4]+turn(a[k+4],b[k+4])*q,travel:a[k+5]+(b[k+5]-a[k+5])*q,speed:time>=runDuration?0:a[k+6]+(b[k+6]-a[k+6])*q};});}};
}
// V109: 85% of goals draw from the 100-celebration pack; the rest keep the original clip styles.
const Pack=(typeof globalThis!=='undefined'&&globalThis.Next90CelebrationPack)||(typeof module==='object'&&module.exports?require('./celebration-pack.js'):null);
function plan(seed,index){const n0=(Math.imul((seed||91)^0x51ed27,2246822519)+index*7919)>>>0;if(Pack&&n0%100<85){const c=Pack.pick(seed||91,index);return{style:c.style,variant:c.variant,soloSeconds:c.soloSeconds,teamRoutine:c.team,packId:c.id};}return legacyPlan(seed,index);}
function legacyPlan(seed,index){const n=(Math.imul((seed||91)^0x736576,1664525)>>>0),styles=['armsWide','heart','salute','airplane','clapCrowd','pointToCrowd','doublePump','earCup','skyPoint','crowdConductor'];return{style:index%2===0?((Math.floor(index/2)+(n%2))%2?'packDance':'packCheer'):styles[(Math.floor(index/2)+n)%styles.length],variant:(n+index*5)%6,soloSeconds:3.2};}
return{create,destination,HOLD,STEP,plan};
});
