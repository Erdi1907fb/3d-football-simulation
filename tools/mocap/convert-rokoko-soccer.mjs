// V263: Rokoko "Free mocap pack 05: Soccer" (Anderson Rohr, free for personal/commercial use, no redistribution of the
// pack itself) -> assets/mocap-football.js. Only retargeted joint rotations of selected windows are shipped, never the
// FBX files. Needs three (npm i three@0.160.1) for FBXLoader.
// Usage: node tools/mocap/convert-rokoko-soccer.mjs <Rokoko_Default dir> <out.js> [--json <analysis.json>]
import * as THREE from 'three';import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js';import fs from 'fs';
globalThis.self=globalThis;globalThis.window=globalThis;console.warn=()=>{};
const [dir,out]=process.argv.slice(2);
// clip key -> file, window [from,to] seconds, contact (s, kicks only), kicking foot
export const PLAN={
 mPass:{file:'08_Side_Foot_Kick.fbx',from:.7,to:2.1,contact:1.38,foot:'R',ref:'contact'},
 mShot:{file:'09_Power_Kick.fbx',from:1.7,to:3.4,contact:2.58,foot:'L',ref:'contact'},
 mPenalty:{file:'10_Penalty_Kick_01.fbx',from:5.6,to:7.6,contact:6.56,foot:'R',ref:'contact'},
 mSaveHigh:{file:'15_Goalkeeper_Save_01.fbx',from:4.2,to:6.6,contact:5.25,ref:'contact'},
 mSaveMid:{file:'16_Goalkeeper_Save_02.fbx',from:2.4,to:4.2,contact:3.33,ref:'contact'},
 mSaveLow:{file:'17_Goalkeeper_Save_03.fbx',from:6.2,to:8.4,contact:7.3,ref:'contact'},
 mCard:{file:'20_Yellow_Card.fbx',from:.1,to:2.9,ref:'start'},
 mCeleb1:{file:'12_Goal_Celebration_01.fbx',from:.1,to:3.5,ref:'start',hips:true},
 mCeleb2:{file:'13_Goal_Celebration_02.fbx',from:.1,to:3.5,ref:'start',hips:true},
 mCeleb3:{file:'14_Goal_Celebration_03.fbx',from:.1,to:3.2,ref:'start',hips:true},
 mDefend1:{file:'18_Defending_01.fbx',from:.1,to:6.3,ref:'start',hips:true},
 mDefend2:{file:'19_Defending_02.fbx',from:.1,to:8.5,ref:'start',hips:true},
};
const FPS=30,HIPS_STAND=92,C=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),-Math.PI/2),CI=C.clone().invert();
// actor node -> [mocap bone, child for the segment direction, actor rest direction, parent node]
const NODES={body:['Hips','Spine2',[0,1,0],null],middle:['Spine3','Neck',[0,1,0],'body'],neck:['Head','HeadTip',[0,1,0],'middle'],
 right_shoulder:['RightArm','RightForeArm',[0,-1,0],'middle'],right_elbow:['RightForeArm','RightHand',[0,-1,0],'right_shoulder'],
 left_shoulder:['LeftArm','LeftForeArm',[0,-1,0],'middle'],left_elbow:['LeftForeArm','LeftHand',[0,-1,0],'left_shoulder'],
 right_thigh:['RightThigh','RightShin',[0,-1,0],'middle'],right_knee:['RightShin','RightFoot',[0,-1,0],'right_thigh'],right_ankle:['RightFoot','RightToe',[0,-.25,1],'right_knee'],
 left_thigh:['LeftThigh','LeftShin',[0,-1,0],'middle'],left_knee:['LeftShin','LeftFoot',[0,-1,0],'left_thigh'],left_ankle:['LeftFoot','LeftToe',[0,-.25,1],'left_knee']};
/* The actor's legs hang from the waist ('middle'), not from the pelvis; their local rotation is taken relative to the
   waist world frame so the leg's world orientation matches the capture whatever the spine does. */
function load(f){const buf=fs.readFileSync(dir+'/'+f);return new FBXLoader().parse(buf.buffer.slice(buf.byteOffset,buf.byteOffset+buf.byteLength),'');}
const yawOf=obj=>{const l=obj.getObjectByName('LeftThigh').getWorldPosition(new THREE.Vector3()),r=obj.getObjectByName('RightThigh').getWorldPosition(new THREE.Vector3()),left=l.sub(r).setY(0).normalize(),fwd=new THREE.Vector3().crossVectors(left,new THREE.Vector3(0,1,0));return Math.atan2(fwd.x,fwd.z);};
function convert(key,plan){const obj=load(plan.file),clip=obj.animations[0],B=n=>obj.getObjectByName(n);
 obj.updateMatrixWorld(true);const bindYaw=yawOf(obj),bindAlign=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),-bindYaw),restFix={};
 for(const[node,[bone,child,dir]]of Object.entries(NODES)){const w=B(bone).getWorldQuaternion(new THREE.Quaternion()).premultiply(bindAlign),d=B(child).getWorldPosition(new THREE.Vector3()).sub(B(bone).getWorldPosition(new THREE.Vector3())).applyQuaternion(bindAlign).normalize(),fix=new THREE.Quaternion().setFromUnitVectors(d,new THREE.Vector3(...dir).normalize());restFix[node]=fix.multiply(w).invert();/* (fix*Wrest)^-1 */}
 const mixer=new THREE.AnimationMixer(obj);mixer.clipAction(clip).play();mixer.setTime(plan.ref==='contact'?plan.contact:plan.from);obj.updateMatrixWorld(true);const align=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),-yawOf(obj));
 const bindHips=(obj=>{mixer.setTime(0);return 0;})(obj),n=Math.round((plan.to-plan.from)*FPS)+1,tracks={},hips=plan.hips?new Float32Array(n):null;for(const node in NODES)tracks[node]=new Float32Array(n*4);
 for(let i=0;i<n;i++){mixer.setTime(plan.from+i/FPS);obj.updateMatrixWorld(true);if(hips){const hy=B('Hips').getWorldPosition(new THREE.Vector3()).y,toe=Math.min(B('LeftToe').getWorldPosition(new THREE.Vector3()).y,B('RightToe').getWorldPosition(new THREE.Vector3()).y,B('LeftFoot').getWorldPosition(new THREE.Vector3()).y-6,B('RightFoot').getWorldPosition(new THREE.Vector3()).y-6);hips[i]=(hy-toe)/HIPS_STAND-1;/* relative pelvis height (0 = standing) */}const W={};for(const[node,[bone]]of Object.entries(NODES))W[node]=B(bone).getWorldQuaternion(new THREE.Quaternion()).premultiply(align).multiply(restFix[node]);
  for(const[node,[, , ,parent]]of Object.entries(NODES)){const local=parent?W[parent].clone().invert().multiply(W[node]):W[node].clone();const s=CI.clone().multiply(local).multiply(C);/* stored in the soccerviewer convention: local = C*s*C^-1 */if(i&&(s.x*tracks[node][(i-1)*4]+s.y*tracks[node][(i-1)*4+1]+s.z*tracks[node][(i-1)*4+2]+s.w*tracks[node][(i-1)*4+3])<0)s.set(-s.x,-s.y,-s.z,-s.w);tracks[node].set([s.x,s.y,s.z,s.w],i*4);}}
 const enc=a=>Buffer.from(Int16Array.from(a,v=>Math.round(Math.max(-1,Math.min(1,v))*32767)).buffer).toString('base64');
 return{key,source:plan.file.replace(/\.fbx$/,''),fps:FPS,frames:n,duration:(n-1)/FPS,contact:plan.contact!=null?+(plan.contact-plan.from).toFixed(4):null,foot:plan.foot||null,hips:hips?enc(hips):null,tracks:Object.fromEntries(Object.entries(tracks).map(([k,v])=>[k,enc(v)]))};}
const clips=Object.entries(PLAN).map(([k,p])=>convert(k,p));
const js=`/* Generated by tools/mocap/convert-rokoko-soccer.mjs (V263/V264). Retargeted joint rotations (13 actor joints, 30 fps,
   int16 quaternions, soccerviewer axis convention) from "Free mocap pack 05: Soccer" by Anderson Rohr (Rokoko capture),
   free for personal and commercial projects; the pack itself is not redistributed. See ASSET-LICENSES.md. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f();else r.Next90MocapFootball=f();})(typeof globalThis!=='undefined'?globalThis:this,function(){return ${JSON.stringify({schema:1,source:'Anderson Rohr, Free mocap pack 05: Soccer (Rokoko)',clips})};});
`;fs.writeFileSync(out,js);console.log('wrote',out,(js.length/1024).toFixed(0)+' KB',clips.map(c=>c.key+':'+c.frames).join(' '));
