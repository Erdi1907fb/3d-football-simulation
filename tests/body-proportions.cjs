// V260: realistic athlete proportions (longer legs/arms, same real height) on the actor rig, the shared full body
// and the shared anatomy; poses authored in legacy units keep their ground contacts.
'use strict';
const A=require('node:assert/strict'),fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..'),T=require(root+'/assets/vendor/three.min');
const P=require(root+'/assets/body-proportions'),F=require(root+'/assets/fullbody-runtime'),S=require(root+'/assets/scene'),Catalog=require(root+'/assets/catalog'),C=require(root+'/assets/character-system');
(async()=>{
 A(Math.abs(P.REST_WAIST-(.92+P.LIFT))<1e-9,'standing waist lifted by exactly the extra leg length');
 for(const b of ['thigh_l','calf_r','upperarm_l','hand_r'])for(const y of [.05,.4,.77,.95,1.21,1.43])A(Number.isFinite(P.boneShift(b,y)[0]));
 A.equal(P.boneShift('thigh_l',.77)[0],P.boneShift('pelvis',.77)[0],'no seam at the hip');A.equal(P.boneShift('upperarm_l',1.43)[0],P.LIFT,'no seam at the shoulder');
 await F.loadAssets(async()=>fs.readFileSync(root+'/assets/characters/fullbody-football.glb'));
 const teams=Catalog.pair('Fenerbahçe','Liverpool'),a=S.createPlayer(0,3,false,teams,null);F.attach(a);F.apply(a);a.root.updateMatrixWorld(true);
 const v=new T.Vector3(),y=o=>o.getWorldPosition(v).y,H=1.914*a.body.scale.y/P.SCALE;
 const hip=y(a.legs[0].hip),knee=y(a.legs[0].knee),ankle=y(a.legs[0].boot),shoulder=y(a.arms[0].shoulder),head=y(a.head);
 A(hip/H>.45&&hip/H<.50,'hip joint at a real share of the height: '+(hip/H).toFixed(3));A(knee/H>.24&&knee/H<.29,'knee '+(knee/H).toFixed(3));A(ankle<.06,'ankle on the ground');
 A(shoulder/H>.74&&shoulder/H<.80,'shoulder '+(shoulder/H).toFixed(3));A(head/H>.88&&head/H<.94,'head joint stays where it was (header heights unchanged)');
 // the skinned bind pose matches the rig: every leg/arm bone sits on its actor joint at rest
 F.sync(a,{speed:0},{time:0});const r=a.fullBody;for(const [bone,node,tol=.01] of [['thigh_l',a.legs[1].hip],['calf_l',a.legs[1].knee],['foot_l',a.legs[1].boot],['lowerarm_r',a.arms[0].elbow,.04/* rig shoulder is splayed 0.14 rad, as before */]]){const b=r.bones.find(x=>x.name===bone),bw=b.getWorldPosition(new T.Vector3()),nw=node.getWorldPosition(new T.Vector3());A(bw.distanceTo(nw)<tol,bone+' on its joint '+bw.distanceTo(nw).toFixed(4));}
 // a legacy kneel (waist .52, hip -.55, knee pi/2+.55) still puts the knees on the grass
 a.waist.position.y=P.waist(.52);a.legs.forEach(l=>{l.hip.rotation.x=-.55;l.knee.rotation.x=Math.PI/2+.55;});a.root.updateMatrixWorld(true);for(const l of a.legs)A(Math.abs(y(l.knee)-.05)<.035,'kneeling knee on the ground '+y(l.knee).toFixed(3));
 // shared anatomy (mid LOD) uses the same proportions
 const raw=JSON.parse(fs.readFileSync(root+'/assets/characters/match-anatomy.json')),an=await C.loadAssets(async()=>JSON.parse(fs.readFileSync(root+'/assets/characters/match-anatomy.json')));A(an.reproportioned,'anatomy reproportioned');const ci=raw.bones.findIndex(b=>b.name==='calf_l');A(Math.abs(an.bones[ci].position[1]-(.05+P.SHIN))<1e-6,'anatomy knee on the new knee');
 console.log(JSON.stringify({pass:true,leg:P.LEG,arm:P.ARM,scale:+P.SCALE.toFixed(4),shares:{hip:+(hip/H).toFixed(3),knee:+(knee/H).toFixed(3),shoulder:+(shoulder/H).toFixed(3)}}));
})().catch(e=>{console.error(e);process.exit(1);});
