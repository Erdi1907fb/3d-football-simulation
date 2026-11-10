const assert=require('node:assert/strict'),T=require('../assets/vendor/three.min.js'),Arena=require('../assets/japon-arena.js'),Layout=require('../assets/japon-layout.js');
for(const width of[4.4,5,6]){
 const spec=Layout.create(4,width).goals[0],g=Arena.netGeometry(spec.width,spec.height,spec.depth),p=g.attributes.position,uv=g.attributes.uv;g.computeBoundingBox();
 assert(Math.abs(g.boundingBox.max.z-g.boundingBox.min.z-spec.width)<1e-5);assert(Math.abs(g.boundingBox.max.y-spec.height)<1e-5);assert(Math.abs(g.boundingBox.max.x-spec.depth)<1e-5);
 assert(Math.abs(uv.getX(40)*.12-spec.width)<1e-5,'back-net cord spacing remains 12 cm at every goal size');
 const ids=g.index.array;for(let i=0;i<ids.length;i+=3){const points=[ids[i],ids[i+1],ids[i+2]];assert(!points.every(j=>Math.abs(p.getX(j))<1e-7),'goal mouth is open');}
 assert(g.boundingBox.min.x>=0,'net stays behind the goal line');g.dispose();
}
const shared=new T.Texture(),sourceGeometry=new T.PlaneGeometry(1,1),sourceMaterial=new T.MeshStandardMaterial({map:shared,transparent:true,depthWrite:false,side:T.DoubleSide}),source=new T.Group(),net=new T.Mesh(sourceGeometry,sourceMaterial);net.name='goal-net-cloth';source.userData.sign=1;source.add(net);
const world={scene:new T.Scene(),pitchDetail:{grass:new T.Texture(),grassNormal:new T.Texture()},netGoals:[source]},layout=Layout.create(6),arena=Arena.create(world,{layout},layout.goals.map(()=>({team:{primary:0x336633}})));
assert(arena.goals.every(g=>g.scale.equals(new T.Vector3(1,1,1))),'goal geometry is built in metres instead of scaling shared net');
const nets=arena.goals.map(g=>g.getObjectByName('goal-net-cloth'));assert.equal(new Set(nets.map(n=>n.geometry)).size,6);assert(nets.every(n=>n.geometry!==sourceGeometry&&n.material!==sourceMaterial&&n.material.map===shared));
let sharedDisposed=false,sourceDisposed=false,localDisposed=0;shared.addEventListener('dispose',()=>sharedDisposed=true);sourceGeometry.addEventListener('dispose',()=>sourceDisposed=true);for(const n of nets)n.geometry.addEventListener('dispose',()=>localDisposed++);arena.dispose();assert.equal(localDisposed,6);assert(!sharedDisposed&&!sourceDisposed,'other studios retain their shared net resources');
console.log(JSON.stringify({pass:true,coverage:'4.4/5/6 m physical net sizes, regular 12 cm grid, open goal mouth, six independent nets, shared normal-game material, local-only disposal'}));
