// V256: motion-capture gait curves drive locomotion (walk/jog/sprint/back/side); engine root/phase untouched.
'use strict';
const A=require('node:assert/strict'),path=require('path'),root=path.resolve(__dirname,'..');
const G=require(root+'/assets/mocap-gaits.js'),AM=require(root+'/assets/athlete-motion.js'),S=require(root+'/assets/scene.js'),Cat=require(root+'/assets/catalog.js');
A.equal(G.schema,1);for(const k of ['walk','run','sprint','backWalk','backRun','sideWalk','sideRun']){const g=G.gaits[k];A.ok(g&&g.cycles>=4,k+' cycles');for(const [n,c] of Object.entries(g.curves)){A.equal(c.length,G.samples,k+'.'+n);A.ok(c.every(Number.isFinite));}}
A.ok(G.gaits.sprint.speed>3&&G.gaits.sprint.stride>2,'sprint source is real running');
A.match(G.source,/100STYLE/);A.match(G.source,/CMU/);
const a=S.createPlayer(0,5,false,Cat.pair('Fenerbahçe','Liverpool'),{id:'t',name:'T'}),rootPos=a.root.position.clone();
const run=(speed,vx,vz,phase)=>{const travel=phase*2*1.42,p={speed,heading:0,vx,vz,gait:travel*2*Math.PI/2.15};AM.apply(a,p,{time:1});return a.root.userData.athleteMotion;};
let m=run(6.5,0,6.5,0);A.equal(m.source,'mocap');A.equal(m.mode,'run');
// realistic pelvis height (no 57-71 deg crouch) and arms/legs move in counter-phase over a cycle
const waist=[],swing=[];for(let k=0;k<12;k++){run(6.5,0,6.5,k/12);waist.push(a.waist.position.y);swing.push(a.arms[1].shoulder.rotation.x-a.arms[0].shoulder.rotation.x);}
const PW=require(root+'/assets/body-proportions.js').waist;/* V260: waist heights in rig units of the realistic proportions */A.ok(Math.min(...waist)>PW(.84)&&Math.max(...waist)<PW(.95),'pelvis height '+Math.min(...waist).toFixed(3));
A.ok(Math.max(...swing)>.2&&Math.min(...swing)<-.2,'arms alternate');
// every gait yields finite joints and a stance foot on the ground
for(const [s,vx,vz,mode] of [[1.2,0,1.2,'jog'],[2.6,0,2.6,'jog'],[2.2,0,-2.2,'backpedal'],[1.8,1.8,0,'shuffle'],[1.8,-1.8,0,'shuffle']]){let stance=0;for(let k=0;k<8;k++){const r=run(s,vx,vz,k/8);A.equal(r.mode,mode);stance+=r.feet.some(f=>f.stance)?1:0;for(const o of [a.waist,a.body,...a.legs.flatMap(l=>[l.hip,l.knee,l.boot]),...a.arms.flatMap(l=>[l.shoulder,l.elbow])])A.ok([o.position.x,o.position.y,o.position.z,o.rotation.x,o.rotation.y,o.rotation.z].every(Number.isFinite));}A.ok(stance>=4,mode+' keeps a planted foot');}
// banking: a left turn (positive turn rate) leans the body left (negative body z), braking leans back
AM.apply(a,{speed:6,heading:0,vx:0,vz:6,gait:1,turnRate:0},{time:1});const straightZ=a.body.rotation.z,straightX=a.body.rotation.x;
AM.apply(a,{speed:6,heading:0,vx:0,vz:6,gait:1,turnRate:1.5},{time:1});A.ok(a.body.rotation.z<straightZ-.1&&a.body.rotation.z>straightZ-.4,'bank into turn');
AM.apply(a,{speed:6,heading:0,vx:0,vz:6,gait:1,accel:-6},{time:1});A.ok(a.body.rotation.x<straightX-.1,'brake leans back');
// personal style differs between builds
const b=S.createPlayer(0,6,false,Cat.pair('Fenerbahçe','Liverpool'),{id:'u',name:'U'});b.root.userData.playerId='strong';b.characterRig={...(b.characterRig||{}),profile:{build:{m:.8,u:1,l:0}}};const c=S.createPlayer(0,7,false,Cat.pair('Fenerbahçe','Liverpool'),{id:'v',name:'V'});c.root.userData.playerId='light';c.characterRig={...(c.characterRig||{}),profile:{build:{m:-.8,u:-1,l:.5}}};
for(const x of [b,c])AM.apply(x,{speed:6,heading:0,vx:0,vz:6,gait:1},{time:1});A.ok(b.root.userData.runStyle.arm>c.root.userData.runStyle.arm&&c.root.userData.runStyle.lift>b.root.userData.runStyle.lift,'running style follows build');
// V259 speed-dependent steps: with the engine's step count the cadence follows speed and the walking stance foot stays nearly planted
{const T=require(root+'/assets/vendor/three.min'),L=v=>Math.max(.6,Math.min(2.1,.42+.2*v)),w=S.createPlayer(0,8,false,Cat.pair('Fenerbahçe','Liverpool'),{id:'w',name:'W'});let slide=0,st=0,prev=[null,null];const v=1.5;for(let f=0;f<240;f++){const d=v*f/60;w.root.position.set(0,0,d);AM.apply(w,{speed:v,heading:0,vx:0,vz:v,gait:d*2*Math.PI/2.15,gaitSteps:d/L(v)},{time:f/60});w.root.updateMatrixWorld(true);const ft=w.root.userData.athleteMotion.feet;for(let k=0;k<2;k++){const q=new T.Vector3();w.legs[k].boot.getWorldPosition(q);if(ft[k].stance){if(prev[k]){slide+=Math.hypot(q.x-prev[k].x,q.z-prev[k].z);st+=1/60;}prev[k]=q;}else prev[k]=null;}}A.ok(slide/st<.8,'walking stance slide '+(slide/st).toFixed(2)+' m/s');}
A.ok(a.root.position.equals(rootPos),'root motion untouched');
console.log(JSON.stringify({pass:true,gaits:Object.keys(G.gaits).length,waist:[+Math.min(...waist).toFixed(3),+Math.max(...waist).toFixed(3)]}));
