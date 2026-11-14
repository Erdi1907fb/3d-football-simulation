'use strict';
const assert=require('node:assert/strict');
const T=require('../assets/vendor/three.min.js');
const Layout=require('../assets/japon-layout');
const Camera=require('../assets/japon-camera');
let frames=0,goalPoints=0;
// Exercise the camera independently of match-generation randomness, including
// distant/near goals and each geometry used during a 6 -> 2 elimination.
for(const count of [2,3,4,5,6]) {
 const layout=Layout.create(count),duration=4;
 const contest={layout,goals:layout.goals,duration,finaleAt:duration+1,events:[],sample(t){
  const ball={x:Math.sin(t*1.7)*layout.apothem*.8,y:.11,z:Math.cos(t*1.3)*layout.apothem*.65};
  return {layout,goals:layout.goals,active:Array(count).fill(true),owner:0,ball,players:[{...ball,y:0,team:0,keeper:false}],finished:false};
 }};
 for(const orientation of ['portrait','landscape']) {
  const camera=new T.PerspectiveCamera();let previous=null;
  for(let i=0;i<=120;i++) {
   const t=i/30,p=Camera.apply(camera,contest,t,'touchline',orientation);
   assert(p.axis.x===1&&p.axis.y===.72&&p.axis.z===.35,'preserve requested touchline angle');
   for(const goal of layout.goals)for(const side of [-1,1])for(const depth of [0,goal.depth])for(const y of [0,goal.height]) {
    const point={x:goal.x+goal.nx*depth-goal.nz*goal.width*.5*side,y,z:goal.z+goal.nz*depth+goal.nx*goal.width*.5*side};
    const screen=Camera.project(camera,point);
    assert(screen.z>-1&&screen.z<1);assert(Camera.inSafe(screen),`goal behind HUD/platform UI: ${JSON.stringify({count,orientation,t,screen})}`);goalPoints++;
   }
   if(previous)assert(camera.position.distanceTo(previous)<2,'no abrupt tracking zoom');
   previous=camera.position.clone();frames++;
  }
  Camera.apply(camera,contest,1.6,'touchline',orientation);const expected=camera.matrixWorld.toArray();
  Camera.apply(camera,contest,3,'touchline',orientation);Camera.apply(camera,contest,1.6,'touchline',orientation);
  assert.deepEqual(camera.matrixWorld.toArray(),expected,'rewind/export uses same camera');
 }
}
const ui=require('node:fs').readFileSync(require('node:path').join(__dirname,'../assets/japon-ui.js'),'utf8');
assert(ui.includes('landscape()?830:1296,w=879,h=222'),'HUD remains in existing Reels safe band');
console.log(JSON.stringify({pass:true,frames,goalPoints,coverage:'2–6 live goal frames, portrait/landscape safe area, angle, continuity, deterministic seeking; unchanged safe HUD band'}));
