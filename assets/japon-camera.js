/* Stateless broadcast director. Export, seeking and preview share the same frame.
   The intersection of our Shorts/Reels action region is measured at 1080×1920. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('./vendor/three.min.js'));else r.Next90JaponCamera=f(r.THREE);})(typeof globalThis!=='undefined'?globalThis:this,function(T){'use strict';
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
function plan(contest,time,mode='broadcast'){
 const f=contest.sample(time),players=f.players.filter(p=>f.active[p.team]),owner=f.owner>=0?f.players[f.owner]:null;
 const shot=contest.events.filter(e=>e.type==='shot'&&e.at<=time+.35&&time-e.at<1.6&&f.active[e.against]).at(-1);
 const nearest=players.filter(p=>!p.keeper).sort((a,b)=>Math.hypot(a.x-f.ball.x,a.z-f.ball.z)-Math.hypot(b.x-f.ball.x,b.z-f.ball.z));
 const lead=shot&&Number.isInteger(shot.actorIndex)&&(!owner||owner.team===shot.team)?f.players[shot.actorIndex]:owner||nearest[0];
 const team=lead?.team??0,target=f.restart?contest.goals[f.restart.against]:shot?contest.goals[shot.against]:contest.goals.filter(g=>g.team!==team&&f.active[g.team]).sort((a,b)=>Math.hypot(a.x-f.ball.x,a.z-f.ball.z)-Math.hypot(b.x-f.ball.x,b.z-f.ball.z))[0];
 const g=target&&Math.hypot(target.x-f.ball.x,target.z-f.ball.z)<8?target:null;
 const overview=mode==='wide';
 if(overview){const points=contest.layout.vertices.map(p=>({...p,y:.1}));for(const goal of contest.goals)for(const side of[-1,1])for(const depth of[0,goal.depth])for(const y of[0,goal.height+.4])points.push({x:goal.x+goal.nx*depth-goal.nz*goal.width*.5*side,y,z:goal.z+goal.nz*depth+goal.nx*goal.width*.5*side});for(const p of players)points.push({...p,y:2.35});return{key:'overview',overview:true,frame:f,points,aim:new T.Vector3(0,.8,0),axis:new T.Vector3(.45,.9,1),fov:47};}
 // Follow the ball and nearby duel; reveal the target frame as the ball approaches.
 const points=[{...f.ball,y:Math.max(.3,f.ball.y)},...nearest.filter(p=>Math.hypot(p.x-f.ball.x,p.z-f.ball.z)<6.5).slice(0,2).flatMap(p=>[{...p,y:.1},{...p,y:2.4}])];
 if(lead&&Math.hypot(lead.x-f.ball.x,lead.z-f.ball.z)<6)points.push({...lead,y:.1},{...lead,y:2.4});
 if(g){for(const side of[-1,1]){points.push({x:g.x-g.nz*(g.width/2+.3)*side,y:0,z:g.z+g.nx*(g.width/2+.3)*side});points.push({x:g.x-g.nz*(g.width/2+.3)*side,y:g.height+.4,z:g.z+g.nx*(g.width/2+.3)*side});}for(const side of[-1,1])points.push({x:g.x+g.nx*g.depth-g.nz*g.width*.5*side,y:g.height+.3,z:g.z+g.nz*g.depth+g.nx*g.width*.5*side});const keeper=players.find(p=>p.team===g.team&&p.keeper);if(keeper)points.push({...keeper,y:2.4});}
 const aim=g?new T.Vector3(f.ball.x*.65+g.x*.35,.9,f.ball.z*.65+g.z*.35):new T.Vector3(f.ball.x,.9,f.ball.z);
 // Keep one side of the action: following a new goal must not reverse the screen.
 const axis=mode==='touchline'?new T.Vector3(1,.72,.35):new T.Vector3(.45,.66,1);
 return{key:shot?'shot-'+shot.at:'play-'+team+'-'+(g?.team??0),overview:false,frame:f,goal:g,points,aim,axis,fov:mode==='touchline'?49:51};
}
const paths=new WeakMap();
function trackingPath(contest,mode){let cached=paths.get(contest);if(!cached){cached=new Map();paths.set(contest,cached);}if(cached.has(mode))return cached.get(mode);
 const step=1/30,raw=Array.from({length:Math.ceil(contest.duration/step)+1},(_,i)=>{const t=Math.min(contest.duration,i*step),p=plan(contest,t,mode);p.points.push(...plan(contest,Math.max(0,t-.00001),mode).points,...plan(contest,Math.min(contest.duration,t+.00001),mode).points);return p;}),camera=new T.PerspectiveCamera();
 const path=raw.map((p,i)=>{const aim=new T.Vector3();let sum=0;for(let j=Math.max(0,i-24);j<=Math.min(raw.length-1,i+24);j++){const weight=25-Math.abs(j-i);aim.addScaledVector(raw[j].aim,weight);sum+=weight;}aim.divideScalar(sum);const envelope=raw.slice(Math.max(0,i-3),Math.min(raw.length,i+4)).flatMap(q=>q.points);return{aim,distance:fit(camera,envelope,p.axis,aim,p.fov)+2};});
 // Anticipatory zoom: a continuous upper envelope of every required safe distance.
 // Approaching a shot widens gradually; it cannot pop on a possession change.
 const rate=8*step;for(let i=1;i<path.length;i++)path[i].distance=Math.max(path[i].distance,path[i-1].distance-rate);for(let i=path.length-2;i>=0;i--)path[i].distance=Math.max(path[i].distance,path[i+1].distance-rate);
 cached.set(mode,{step,path});return cached.get(mode);
}
function apply(camera,contest,time,mode='broadcast'){
 const p=plan(contest,time,mode);
 if(p.overview){const distance=fit(camera,p.points,p.axis,p.aim,p.fov);return{...p,distance};}
 const{step,path}=trackingPath(contest,mode),t=clamp(time,0,contest.duration)/step,index=Math.min(path.length-2,Math.floor(t)),u=t-index,a=path[index],b=path[index+1],aim=a.aim.clone().lerp(b.aim,u),required=fit(camera,p.points,p.axis,aim,p.fov),distance=Math.max(required,a.distance+(b.distance-a.distance)*u);
 camera.position.copy(aim).addScaledVector(p.axis.clone().normalize(),distance);camera.lookAt(aim);camera.updateMatrixWorld();
 const segment=contest.segments?.findIndex(s=>time>=s.videoStart&&time<s.videoEnd)??0;
 return{...p,key:'tracking-'+mode+'-'+segment,aim,distance};
}
function project(camera,p){const q=v(p).project(camera);return{x:(q.x+1)*WIDTH/2,y:(1-q.y)*HEIGHT/2,z:q.z};}
function inSafe(p,padding=0){return p.x>=SAFE.left-padding&&p.x<=SAFE.right+padding&&p.y>=SAFE.top-padding&&p.y<=SAFE.bottom+padding;}
return{SAFE,WIDTH,HEIGHT,fit,plan,apply,project,inSafe};});
