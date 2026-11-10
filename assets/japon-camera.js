/* Stateless broadcast director. Export, seeking and preview share the same frame.
   The intersection of our Shorts/Reels action region is measured at 1080×1920. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('./vendor/three.min.js'),require('./japon-layout.js'));else r.Next90JaponCamera=f(r.THREE,r.Next90JaponLayout);})(typeof globalThis!=='undefined'?globalThis:this,function(T,Layout){'use strict';
const SAFE={left:64,right:884,top:295,bottom:1220},WIDTH=1080,HEIGHT=1920;
const v=p=>new T.Vector3(p.x,p.y??0,p.z),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function fit(camera,points,axis,aim,fov=48){
 camera.clearViewOffset();camera.aspect=9/16;camera.fov=fov;camera.near=.1;camera.far=900;
 const cx=(SAFE.left+SAFE.right)/2,cy=(SAFE.top+SAFE.bottom)/2;
 camera.setViewOffset(WIDTH,HEIGHT,WIDTH/2-cx,HEIGHT/2-cy,WIDTH,HEIGHT);
 axis=axis.clone().normalize();camera.position.copy(aim).addScaledVector(axis,30);camera.lookAt(aim);camera.updateMatrixWorld();
 const right=new T.Vector3().setFromMatrixColumn(camera.matrixWorld,0),up=new T.Vector3().setFromMatrixColumn(camera.matrixWorld,1),tan=Math.tan(fov*Math.PI/360),hx=(SAFE.right-SAFE.left)/WIDTH*.94,hy=(SAFE.bottom-SAFE.top)/HEIGHT*.94;
 let distance=10;
 for(const p of points){const delta=v(p).sub(aim),depth=delta.dot(axis);distance=Math.max(distance,depth+Math.abs(delta.dot(right))/(tan*camera.aspect*hx),depth+Math.abs(delta.dot(up))/(tan*hy));}
 camera.position.copy(aim).addScaledVector(axis,distance+.6);camera.lookAt(aim);camera.updateProjectionMatrix();camera.updateMatrixWorld();camera.userData.framingAim=aim.clone();
 return distance+.6;
}
function cutTime(contest,time){const cut=contest.events.find(e=>e.type==='drop'&&Math.abs(e.at-time)<1e-7);return cut?cut.at:time;}
function plan(contest,time,mode='broadcast'){
 time=cutTime(contest,time);
 const f=contest.sample(time),players=f.players.filter(p=>f.active[p.team]),owner=f.owner>=0?f.players[f.owner]:null;
 // Short in-place winner coverage, followed by the clear result panel.
 if(f.finished&&!contest.timedOut&&!contest.draw){const champions=contest.ranks.filter(r=>r.rank===1).map(r=>r.team),team=champions[0],group=f.players.filter(p=>p.team===team),lead=group.find(p=>p.role==='attacker')||group[0],near=group.filter(p=>Math.hypot(p.x-lead.x,p.z-lead.z)<6),points=near.flatMap(p=>[{...p,y:.1},{...p,y:2.5}]);return{key:'winner-finale-'+team,celebration:true,overview:false,frame:f,points,aim:new T.Vector3(near.reduce((v,p)=>v+p.x,0)/near.length,1.1,near.reduce((v,p)=>v+p.z,0)/near.length),axis:new T.Vector3(.3,.72,1),fov:46};}
 const shot=contest.events.filter(e=>e.type==='shot'&&e.at<=time+.35&&time-e.at<1.6&&f.active[e.against]).at(-1);
 const nearest=players.filter(p=>!p.keeper).sort((a,b)=>Math.hypot(a.x-f.ball.x,a.z-f.ball.z)-Math.hypot(b.x-f.ball.x,b.z-f.ball.z));
 const lead=shot&&Number.isInteger(shot.actorIndex)&&(!owner||owner.team===shot.team)?f.players[shot.actorIndex]:owner||nearest[0];
 const team=lead?.team??0,target=f.netGoal!=null?contest.goals[f.netGoal]:owner?.keeper?contest.goals[owner.team]:f.restart?contest.goals[f.restart.against]:shot?contest.goals[shot.against]:contest.goals.filter(g=>g.team!==team&&f.active[g.team]).sort((a,b)=>Math.hypot(a.x-f.ball.x,a.z-f.ball.z)-Math.hypot(b.x-f.ball.x,b.z-f.ball.z))[0];
 const g=target&&Math.hypot(target.x-f.ball.x,target.z-f.ball.z)<7?target:null;
 const overview=mode==='wide'||mode==='side-full';
 if(overview){const points=contest.layout.vertices.map(p=>({...p,y:.1}));for(const goal of contest.goals)for(const side of[-1,1])for(const depth of[0,goal.depth])for(const y of[0,goal.height+.4])points.push({x:goal.x+goal.nx*depth-goal.nz*goal.width*.5*side,y,z:goal.z+goal.nz*depth+goal.nx*goal.width*.5*side});points.push({x:0,y:4.6,z:0});return{key:'overview',overview,frame:f,points,aim:new T.Vector3(0,.8,0),axis:mode==='side-full'?new T.Vector3(0,.8,1):new T.Vector3(.45,.66,1),fov:47};}
 // A readable phase of play: show the carrier, passing options and cover,
 // with a minimum patch of pitch instead of framing one player's feet.
 const centre=Layout.contain({x:f.ball.x*.72,z:f.ball.z*.72},contest.layout,4.3),points=[{...f.ball,y:Math.max(.3,f.ball.y)}];
 for(const x of[-5.2,5.2])for(const z of[-3.6,3.6])points.push({...Layout.contain({x:centre.x+x,z:centre.z+z},contest.layout,.2),y:.1});
 for(const p of players.filter(p=>!p.keeper&&Math.hypot(p.x-f.ball.x,p.z-f.ball.z)<7).sort((a,b)=>Math.hypot(a.x-f.ball.x,a.z-f.ball.z)-Math.hypot(b.x-f.ball.x,b.z-f.ball.z)).slice(0,5))points.push({...p,y:.1},{...p,y:2.4});
 if(lead&&Math.hypot(lead.x-f.ball.x,lead.z-f.ball.z)<8)points.push({...lead,y:.1},{...lead,y:2.4});
 if(g){for(const side of[-1,1]){points.push({x:g.x-g.nz*(g.width/2+.3)*side,y:0,z:g.z+g.nx*(g.width/2+.3)*side});points.push({x:g.x-g.nz*(g.width/2+.3)*side,y:g.height+.4,z:g.z+g.nx*(g.width/2+.3)*side});}for(const side of[-1,1])points.push({x:g.x+g.nx*g.depth-g.nz*g.width*.5*side,y:g.height+.3,z:g.z+g.nz*g.depth+g.nx*g.width*.5*side});const keeper=players.find(p=>p.team===g.team&&p.keeper);if(keeper)points.push({...keeper,y:2.4});}
 const aim=new T.Vector3(centre.x,.9,centre.z);
 // Keep one side of the action: following a new goal must not reverse the screen.
 const axis=mode==='touchline'?new T.Vector3(1,.72,.35):new T.Vector3(.08,.9,1);
 return{key:shot?'shot-'+shot.at:'play-'+team+'-'+(g?.team??0),overview:false,frame:f,goal:g,points,aim,axis,fov:mode==='touchline'?49:48};
}
const paths=new WeakMap();
function trackingPath(contest,mode){let cached=paths.get(contest);if(!cached){cached=new Map();paths.set(contest,cached);}if(cached.has(mode))return cached.get(mode);
 const step=1/30,drops=contest.events.filter(e=>e.type==='drop').map(e=>e.at),segmentAt=t=>Math.max(0,drops.filter(at=>at<=t+1e-8).length-1),raw=Array.from({length:Math.ceil(contest.duration/step)+1},(_,i)=>{const t=Math.min(contest.finaleAt-.001,i*step),segment=segmentAt(t),p=plan(contest,t,mode);return{...p,segment};}),camera=new T.PerspectiveCamera();
 const path=raw.map((p,i)=>{const aim=new T.Vector3();let sum=0;for(let j=Math.max(0,i-12);j<=Math.min(raw.length-1,i+12);j++){if(raw[j].segment!==p.segment)continue;const weight=13-Math.abs(j-i);aim.addScaledVector(raw[j].aim,weight);sum+=weight;}aim.divideScalar(sum);const envelope=raw.slice(Math.max(0,i-3),Math.min(raw.length,i+4)).filter(q=>q.segment===p.segment).flatMap(q=>q.points);return{aim,segment:p.segment,distance:fit(camera,envelope,p.axis,aim,p.fov)+.35};});
 const rate=8*step;for(let i=1;i<path.length;i++)if(path[i].segment===path[i-1].segment)path[i].distance=Math.max(path[i].distance,path[i-1].distance-rate);for(let i=path.length-2;i>=0;i--)if(path[i].segment===path[i+1].segment)path[i].distance=Math.max(path[i].distance,path[i+1].distance-rate);
 cached.set(mode,{step,path,segmentAt});return cached.get(mode);
}
function apply(camera,contest,time,mode='broadcast'){
 // Floating playback increments must select the same side of a centre-drop cut
 // as the segment cache; otherwise the old net briefly forces a distant fit.
 time=cutTime(contest,time);
 const p=plan(contest,time,mode);if(p.overview||p.celebration){const distance=fit(camera,p.points,p.axis,p.aim,p.fov);return{...p,distance};}
 const{step,path,segmentAt}=trackingPath(contest,mode),t=clamp(time,0,contest.duration)/step,index=Math.min(path.length-2,Math.floor(t)),segment=segmentAt(time);let u=t-index,a=path[index],b=path[index+1];if(a.segment!==b.segment){a=b=a.segment===segment?a:b;u=0;}const aim=a.aim.clone().lerp(b.aim,u),required=fit(camera,p.points,p.axis,aim,p.fov),distance=Math.max(required,a.distance+(b.distance-a.distance)*u);
 camera.position.copy(aim).addScaledVector(p.axis.clone().normalize(),distance);camera.lookAt(aim);camera.updateMatrixWorld();return{...p,key:'tracking-'+mode+'-'+segment,aim,distance};
}
function project(camera,p){const q=v(p).project(camera);return{x:(q.x+1)*WIDTH/2,y:(1-q.y)*HEIGHT/2,z:q.z};}
function inSafe(p,padding=0){return p.x>=SAFE.left-padding&&p.x<=SAFE.right+padding&&p.y>=SAFE.top-padding&&p.y<=SAFE.bottom+padding;}
return{SAFE,WIDTH,HEIGHT,fit,plan,apply,project,inSafe};});
