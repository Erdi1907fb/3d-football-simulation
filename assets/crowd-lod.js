/* World of Simulation: original instanced spectator LOD and deterministic GPU motion.
 * No external model or runtime network dependency. Event gestures remain owned by scene.js.
 */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('./vendor/three.min.js'));else r.SekmeCrowdLOD=f(r.THREE);})(typeof globalThis!=='undefined'?globalThis:this,function(T){'use strict';
const PRESETS={high:{near:64,middle:192,nearDistance:22,middleDistance:44,motion:1},balanced:{near:20,middle:72,nearDistance:18,middleDistance:34,motion:.8},low:{near:0,middle:20,nearDistance:0,middleDistance:25,motion:.5}};
let headAsset=null,headPending=null;
function loadHead(loader){if(headAsset)return Promise.resolve(headAsset);if(loader)return Promise.resolve(loader('assets/faces/mpfb-head.json')).then(d=>headAsset=d).catch(()=>null);if(headPending)return headPending;if(typeof document==='undefined'||typeof fetch!=='function')return Promise.resolve(null);return headPending=fetch('assets/faces/mpfb-head.json?v=70').then(r=>{if(!r.ok)throw Error('crowd_head');return r.json();}).then(d=>headAsset=d).catch(()=>null);}
function anatomicalHead(data){if(!data||data.positions?.length!==data.vertexCount*3||data.vertexCount>5000||!data.indices?.length)return null;const g=new T.BufferGeometry(),p=new Float32Array(data.positions);for(let i=0;i<p.length;i+=3){p[i]/=.13;p[i+1]/=.17;p[i+2]/=.135;}g.setAttribute('position',new T.BufferAttribute(p,3));g.setIndex(data.indices);g.computeVertexNormals();g.computeBoundingSphere();return g;}
function preset(value){const key=typeof value==='object'?value?.id:value;return PRESETS[key]||PRESETS.balanced;}
function configureFar(entries,quality){const uniforms={wosCrowdTime:{value:0},wosCrowdMotion:{value:preset(quality).motion}},owned=[];
 for(const entry of entries||[]){const m=entry.batch.material.clone();m.name='wos-crowd-gpu-'+entry.pose+'-'+entry.part;entry.batch.material=m;owned.push(m);m.onBeforeCompile=shader=>{Object.assign(shader.uniforms,uniforms);shader.vertexShader='uniform float wosCrowdTime;\nuniform float wosCrowdMotion;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
 #ifdef USE_INSTANCING
 float wosSeed=dot(instanceMatrix[3].xz,vec2(1.719,2.371));
 float wosPhase=wosCrowdTime*(1.05+.28*sin(wosSeed*1.3))+wosSeed;
 float wosUpper=smoothstep(.40,1.40,position.y);
 transformed.x+=sin(wosPhase)*.017*wosUpper*wosCrowdMotion;
 transformed.z+=cos(wosPhase*.79)*.012*wosUpper*wosCrowdMotion;
 transformed.x*=1.0+.035*sin(wosSeed*2.03);
 transformed.y+=sin(wosPhase*2.2)*.008*smoothstep(.65,1.45,position.y)*wosCrowdMotion;
 #endif`);};m.customProgramCacheKey=()=> 'wos-crowd-gpu-v61';m.needsUpdate=true;}
 return{uniforms,update(time){uniforms.wosCrowdTime.value=Number.isFinite(time)?time:0;},dispose(){owned.forEach(m=>m.dispose());},owned};
}
function buildRig(detailed){const root=new T.Group(),body=new T.Group(),parts=[];root.add(body);
 const geometries={box:new T.BoxGeometry(1,1,1),ball:new T.SphereGeometry(1,detailed?12:8,detailed?8:5),tube:new T.CylinderGeometry(1,.9,1,detailed?10:6)};
 function part(name,parent,kind,scale,position,colour){const o=new T.Object3D();o.position.set(...position);o.scale.set(...scale);parent.add(o);parts.push({name,object:o,geometry:geometries[kind],colour});return o;}
 part('shirt',body,'tube',[.23,.55,.16],[0,.88,0],'shirt');part('stripe',body,'box',[.10,.47,.014],[-.07,.87,.162],'stripe');
 part('pelvis',body,'box',[.34,.19,.25],[0,.57,0],'dark');
 const neck=part('neck',body,'tube',[.061,.10,.061],[0,1.19,0],'skin');
 const head=new T.Group();head.position.set(0,1.34,0);body.add(head);
 part('head',head,'ball',[.119,.148,.12],[0,0,0],'skin');
 const hair=part('hair',head,'ball',[.123,.079,.122],[0,.095,-.007],'hair');
 if(detailed)for(const side of[-1,1]){part('ear'+side,head,'ball',[.025,.044,.025],[side*.113,-.01,0],'skin');part('brow'+side,head,'box',[.036,.009,.009],[side*.043,.048,.116],'hair');}
 const hat=detailed?part('hat',head,'box',[.238,.043,.20],[0,.102,.055],'stripe'):null;
 if(detailed){part('nose',head,'ball',[.025,.029,.030],[0,-.01,.118],'skin');for(const k of[-1,1])part('eye'+k,head,'ball',[.012,.008,.008],[k*.043,.03,.119],'eye');}
 const arms=[],legs=[];
 for(const side of[-1,1]){const shoulder=new T.Group();body.add(shoulder);shoulder.position.set(side*.243,1.08,0);part('sleeve'+side,shoulder,'tube',[.065,.23,.065],[0,-.115,0],'shirt');
  const elbow=new T.Group();elbow.position.y=-.23;shoulder.add(elbow);part('forearm'+side,elbow,'tube',[.047,.225,.047],[0,-.1125,0],'skin');part('hand'+side,elbow,'ball',[.047,.055,.039],[0,-.248,0],'skin');arms.push({shoulder,elbow,side});
  const hip=new T.Group();hip.position.set(side*.105,.49,0);body.add(hip);part('thigh'+side,hip,'tube',[.067,.25,.068],[0,-.125,0],'dark');const knee=new T.Group();knee.position.y=-.25;hip.add(knee);part('shin'+side,knee,'tube',[.055,.22,.057],[0,-.11,0],'dark');part('shoe'+side,knee,'box',[.137,.075,.23],[0,-.21,.045],'shoe');legs.push({hip,knee});
 }
 const scarf=detailed?part('scarf',body,'box',[.78,.10,.035],[0,1.52,.11],'stripe'):null;
 const flag=detailed?new T.Group():null;if(flag){body.add(flag);flag.position.set(.31,1.38,.12);part('flagPole',flag,'tube',[.009,.88,.009],[0,.32,0],'dark');part('flagCloth',flag,'box',[.49,.29,.014],[.23,.59,0],'shirt');part('flagStripe',flag,'box',[.49,.075,.017],[.23,.59,.009],'stripe');}
 const lid=detailed?part('eyelids',head,'box',[.109,.014,.015],[0,.042,.116],'skin'):null;return{root,body,head,hair,hat,scarf,flag,arms,legs,parts,geometries,lid};
}
const hairs=[0x201d19,0x50382a,0x87654a,0xc0a177,0x2a2c31],eyes=new T.Color(0x22272c),shoes=new T.Color(0x23313b),dark=new T.Color(0x293541),hidden=new T.Matrix4().makeScale(0,0,0);
function poseBase(rig,fan,time){const id=fan.slot.id,pose=fan.displayPose??0,phase=time*(.91+(id%7)*.037)+id*1.73,sit=pose===6;
 rig.root.matrixAutoUpdate=false;rig.root.matrix.copy(fan.baseMatrix||fan.root.matrixWorld);rig.root.matrix.elements[12]+=(fan.sway||0)+(fan.surgeX||0);rig.root.matrix.elements[13]+=fan.hop||0;rig.root.matrix.elements[14]+=fan.surgeZ||0;
 rig.body.position.y=sit?-.24:0;rig.body.rotation.set(pose===4?.06:0,0,Math.sin(phase)*.012);rig.body.scale.set(1+(id%5-2)*.022,1,1+(id%3-1)*.04);rig.head.rotation.set(pose===4?.12:Math.sin(phase*.68)*.02,Math.sin(phase*.5)*.11,0);
 rig.hair.scale.set(.123+(id%3)*.005,.065+(id%4)*.012,.122);rig.hair.position.y=.095;rig.hair.visible=id%11!==0;if(id%6===0)rig.hair.scale.y=.105;
 if(rig.hat)rig.hat.visible=id%9===0;
 for(const l of rig.legs){l.hip.rotation.x=sit?-Math.PI/2:0;l.knee.rotation.x=sit?Math.PI/2:0;}
 for(const a of rig.arms){const k=a.side,clap=Math.sin(time*(7.3+(id%5)*.27)+phase*.13);
  a.shoulder.rotation.set(-.15+Math.sin(phase)*.025,0,k*.13);a.elbow.rotation.set(-.27,0,0);
  if(pose===1){a.shoulder.rotation.set(-2.55+Math.sin(phase*2)*.12,0,k*.25);a.elbow.rotation.x=-.18;}
  if(pose===2){a.shoulder.rotation.set(-1.08,0,-k*(.43+clap*.075));a.elbow.rotation.x=-1.08;}
  if(pose===3){a.shoulder.rotation.set(-2.60,0,k*.22);a.elbow.rotation.x=-.20;}
  if(pose===4){a.shoulder.rotation.set(-2.25,0,k*.28);a.elbow.rotation.x=-1.52;}
  if(pose===5){a.shoulder.rotation.set(-1.21+Math.sin(phase*2.3)*.12,0,k*.41);a.elbow.rotation.x=-.65;}
 }
 // Stand stewards: upright, arms down with hands loosely together in front, no gestures.
 if(fan.steward==='vest'){for(const a of rig.arms){a.shoulder.rotation.set(-.34,0,a.side*.04);a.elbow.rotation.set(-.62,0,0);}rig.body.rotation.set(0,0,0);rig.head.rotation.set(0,Math.sin(phase*.3)*.25,0);}
 if(rig.scarf){rig.scarf.visible=pose===3;rig.scarf.rotation.z=Math.sin(phase)*.035;rig.scarf.position.y=1.52+Math.sin(phase)*.018;if(pose===3)for(let i=0;i<2;i++)fanReach(rig,i,[rig.arms[i].side*.34,rig.scarf.position.y,.11]);}
 if(pose===2){const gap=.037+.026*(1+Math.sin(time*(7.3+(id%5)*.27)+phase*.13));for(let i=0;i<2;i++)fanReach(rig,i,[rig.arms[i].side*gap,1.10,.32]);}
 if(rig.flag){rig.flag.visible=(pose===1||pose===5)&&id%17===0&&!fan.steward;rig.flag.rotation.z=Math.sin(phase*2.3)*.12;rig.flag.rotation.y=Math.sin(phase*1.9)*.35;if(rig.flag.visible)fanReach(rig,1,[.31,1.38,.12]);}
 rig.root.updateMatrixWorld(true);return rig;
}
// Arm IK keeps clapping hands and scarf ends attached to the spectators.
function fanReach(rig,index,target){const a=rig.arms[index],start=a.shoulder.position,end=new T.Vector3(...target),d=end.sub(start),raw=d.length(),l1=.23,l2=.248,r=Math.max(.019,Math.min(l1+l2-.0001,raw)),dir=d.normalize(),bend=new T.Vector3(a.side*.5,0,1).addScaledVector(dir,-new T.Vector3(a.side*.5,0,1).dot(dir)).normalize(),along=(l1*l1+r*r-l2*l2)/(2*r),joint=start.clone().addScaledVector(dir,along).addScaledVector(bend,Math.sqrt(Math.max(0,l1*l1-along*along))),q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,-1,0),joint.clone().sub(start).normalize());a.shoulder.quaternion.copy(q);a.elbow.quaternion.setFromUnitVectors(new T.Vector3(0,-1,0),start.clone().addScaledVector(dir,r).sub(joint).applyQuaternion(q.clone().invert()).normalize());}
function poseRig(rig,fan,time){poseBase(rig,fan,time);const mix=fan.reactionMix??1;if(mix<1){const nodes=[rig.body,rig.head,...rig.arms.flatMap(a=>[a.shoulder,a.elbow]),...rig.legs.flatMap(l=>[l.hip,l.knee])],target=nodes.map(n=>[n.position.clone(),n.quaternion.clone()]);poseBase(rig,{...fan,displayPose:fan.poseFrom??6,reactionMix:1},time);nodes.forEach((n,i)=>{n.position.lerp(target[i][0],mix);n.quaternion.slerp(target[i][1],mix);});if(rig.scarf)rig.scarf.visible=fan.displayPose===3&&mix>.5;if(rig.flag)rig.flag.visible=(fan.displayPose===1||fan.displayPose===5)&&fan.slot.id%17===0&&mix>.5;rig.root.updateMatrixWorld(true);}return rig;}
function createTier(scene,count,detailed){const rig=buildRig(detailed),material=new T.MeshStandardMaterial({color:0xffffff,roughness:.92,metalness:0}),batches=rig.parts.map(p=>{const b=new T.InstancedMesh(p.geometry,material,Math.max(1,count));b.name='wos-crowd-'+(detailed?'near-':'middle-')+p.name;b.userData.noBatch=true;b.frustumCulled=false;b.instanceMatrix.setUsage(T.DynamicDrawUsage);b.visible=false;b.count=0;scene.add(b);return b;});
 let detailedHead=null;const colours={eye:eyes,shoe:shoes,dark},hair=new T.Color(),skin=new T.Color();
 return{rig,batches,capacity:count,installHead(data){const g=anatomicalHead(data);if(!g)return false;detailedHead?.dispose();detailedHead=g;const index=rig.parts.findIndex(p=>p.name==='head');rig.parts[index].geometry=g;batches[index].geometry=g;const nose=rig.parts.find(p=>p.name==='nose');if(nose)nose.object.scale.setScalar(0);for(const part of rig.parts)if(part.name.startsWith('eye')){if(part.name==='eyelids'){part.object.position.y=.013;part.object.position.z=.080;part.object.scale.set(.109,.013,.015);}else{part.object.position.y=-.002;part.object.position.z=.081;part.object.scale.set(.010,.006,.006);}}return true;},write(fans,time){for(const b of batches){b.count=fans.length;b.visible=fans.length>0;}for(let i=0;i<fans.length;i++){const fan=fans[i];poseRig(rig,fan,time);hair.setHex(hairs[(fan.slot.id*7)%hairs.length]);skin.set(fan.skin||0xc38b69);const palette={...colours,shirt:fan.colours?.shirt||new T.Color(0x7d3341),stripe:fan.colours?.stripe||new T.Color(0xe3b94d),skin:fan.colours?.skin||skin,hair};rig.parts.forEach((part,k)=>{batches[k].setMatrixAt(i,part.object.visible&&(!rig.flag||part.object.parent!==rig.flag||rig.flag.visible)?part.object.matrixWorld:hidden);batches[k].setColorAt(i,palette[part.colour]);});}for(const b of batches){b.instanceMatrix.needsUpdate=true;if(b.instanceColor)b.instanceColor.needsUpdate=true;}},dispose(){for(const b of batches){scene.remove(b);b.dispose();}material.dispose();detailedHead?.dispose();Object.values(rig.geometries).forEach(g=>g.dispose());}};
}
function create({fans=[],farBatches=[],scene,quality='balanced',loadJSON}={}){if(!scene)throw Error('crowd_scene_required');const settings=preset(quality),gpu=configureFar(farBatches,quality),near=createTier(scene,settings.near,true),middle=createTier(scene,settings.middle,false),candidates=fans,frustum=new T.Frustum(),projection=new T.Matrix4(),point=new T.Vector3();let disposed=false;
 for(const f of fans)if(f.body&&!f.baseMatrix)f.baseMatrix=f.root.matrixWorld.clone();
 const ready=settings.near?loadHead(loadJSON).then(data=>{if(!disposed&&data)info.anatomicalHeads=near.installHead(data);}):Promise.resolve();
 const info={anatomicalHeads:false,quality:typeof quality==='string'?quality:quality?.id||'balanced',total:fans.length,near:0,middle:0,far:candidates.length,baselineArticulated:fans.filter(f=>f.body).length,tiers:3,gpuMicroMotion:true,gestureIK:true,reactionBlend:true,asset:'original-instanced-crowd',estimatedFrameRate:null};
 function prepare(state,camera,time){if(disposed)return;const now=Number.isFinite(time)?time:state?.presentationTime??state?.time??0;gpu.update(now);for(const f of candidates)f.lodHidden=!!f.segHidden;
  camera.updateMatrixWorld();projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);frustum.setFromProjectionMatrix(projection);const visible=[];
  for(const f of candidates){if(f.segHidden)continue;point.set(f.slot.x,f.slot.y+.9,f.slot.z);const distance=camera.position.distanceTo(point);if(distance>settings.middleDistance||!frustum.containsPoint(point))continue;visible.push({f,distance});}
  visible.sort((a,b)=>a.distance-b.distance||a.f.slot.id-b.f.slot.id);const n=[],m=[];for(const {f,distance}of visible){if(distance<settings.nearDistance&&n.length<settings.near)n.push(f);else if(m.length<settings.middle)m.push(f);else continue;f.lodHidden=true;}
  near.write(n,now);middle.write(m,now);info.near=n.length;info.middle=m.length;info.far=candidates.length-n.length-m.length;scene.userData.crowdLOD={...info};
 }
 return{ready,prepare,update:prepare,info,near,middle,gpu,dispose(){if(disposed)return;disposed=true;for(const f of candidates)delete f.lodHidden;near.dispose();middle.dispose();gpu.dispose();}};
}
return{anatomicalHead,create,configureFar,preset,PRESETS,buildRig,poseRig};
});
