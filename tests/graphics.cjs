// V112: footstep ground response (rain splashes / snow prints, cleared on rewind), the
// three.js r160 post-processing bundle, and formation-aware defensive lanes.
const assert=require('node:assert/strict'),path=require('path'),root=path.resolve(__dirname,'..');
global.document={createElement:()=>null};global.THREE=require(root+'/assets/vendor/three.min.js');
const T=global.THREE,W=require(root+'/assets/weather.js'),PF=require(root+'/assets/vendor/three-postfx.js'),C=require(root+'/assets/collective-play.js');
for(const k of['EffectComposer','RenderPass','UnrealBloomPass','OutputPass','SMAAPass','ShaderPass'])assert.equal(typeof PF[k],'function',k);
const s=new T.Scene(),w=W.create(s,{weather:'snow',quality:'low'});w.update(1);assert(w.stepping,'snow steps active');
const prints=()=>s.children.find(o=>o.isInstancedMesh),pts=()=>s.children.find(o=>o.isPoints&&o.geometry.attributes.aBirth);
for(let i=0;i<30;i++){w.update(1+i*.1);w.footstep(i*.4,0,0,1+i*.1);}assert.equal(prints().count,30,'snow footprints');assert(pts().geometry.attributes.aBirth.array.filter(b=>b>0).length===30,'snow puffs');
w.update(.2);assert.equal(prints().count,0,'rewind clears prints');
w.set('rain');w.update(2);w.footstep(1,1,0,2);assert(!prints(),'rain has no persistent prints');assert(pts().geometry.attributes.aBirth.array.some(b=>b===2),'rain splash');
w.set('clear');assert(!w.stepping);
// Formation lanes: back three spreads CBs, wing-backs push on; back four CBs split left/right.
const mk=r=>{const pl=[];for(let t=0;t<2;t++)for(let i=0;i<11;i++)pl.push({id:t*11+i,team:t,x:(t?1:-1)*(8+i*3),z:(i-5)*4.5,vx:0,vz:0,keeper:i===0});const prof={};pl.forEach(p=>prof[p.id]={role:r[p.id%11]});return{pl,prof};};
let m=mk(['GK','CB','CB','CB','LWB','RWB','CM','CM','AM','ST','ST']),t=C.targets(m.pl,{x:5,z:0},0,1,m.prof,[{press:.5},{press:.5}],12,7,{time:1});assert(t[1].z<-6&&Math.abs(t[2].z)<4&&t[3].z>6,'back three spread');assert.equal(t[4].intent,'wing-back');
m=mk(['GK','LB','CB','CB','RB','DM','CM','CM','LW','ST','RW']);t=C.targets(m.pl,{x:5,z:0},0,1,m.prof,[{press:.5},{press:.5}],12,7,{time:1});assert(t[2].z<0&&t[3].z>0,'back four CBs either side');
console.log(JSON.stringify({PASS:true,postfx:Object.keys(PF).length,snowPrints:30,rewindClears:true,rainSplash:true,backThree:true,backFour:true}));
