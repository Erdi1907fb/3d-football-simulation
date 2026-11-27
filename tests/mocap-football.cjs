// V263: real football capture (Anderson Rohr free soccer pack, Rokoko) retargeted to the 13 actor joints drives the
// stationary pass/shot, the penalty kick and the holding saves; data is unit quaternions, contacts inside the clips.
'use strict';
const A=require('node:assert/strict'),fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..');
const M=require(root+'/assets/mocap-football.js'),F=require(root+'/assets/football-clips.js'),S=require(root+'/assets/scene.js'),Cat=require(root+'/assets/catalog.js');
(async()=>{A.equal(M.schema,1);A.equal(M.clips.length,7);for(const c of M.clips){A.equal(Object.keys(c.tracks).length,13,c.key);if(c.contact!=null)A(c.contact>0&&c.contact<c.duration,c.key+' contact inside');const v=Buffer.from(c.tracks.right_thigh,'base64');A.equal(v.length,c.frames*4*2);}
 await F.load(async()=>fs.readFileSync(root+'/assets/animations/soccerviewer/clips.glb'));const info=F.inspect();A.deepEqual(info.mocap.sort(),M.clips.map(c=>'mocap/'+c.key).sort());
 const a=S.createPlayer(0,9,false,Cat.pair('Fenerbahçe','Liverpool'),{id:'t',name:'T'});
 for(const [type,want] of [['open','mocap/mShot'],['penalty','mocap/mPenalty']]){F.action(a,{kicking:true,kickPhase:.20,speed:0,kickFoot:'right'},{chance:{type},kick:{at:4},physicsTime:4});A.equal(a.root.userData.footballClip?.source,want,type);for(const l of a.legs)A(Math.abs(l.hip.quaternion.length()-1)<1e-3);}
 F.action(a,{kicking:true,kickPhase:.20,speed:0,kickFoot:'left'},{chance:{type:'open'},kick:{at:2},physicsTime:2});A.equal(a.root.userData.footballClip?.source,'mocap/mPass');
 F.goalkeeper(a,{keeper:true,saveReach:1,saveStyle:'smother',saveHeight:1.6,diveSide:1,keeperSaveAt:3},{physicsTime:3,chance:{}});A.equal(a.root.userData.footballClip?.source,'mocap/mSaveHigh');
 {const T=require(root+'/assets/vendor/three.min.js');a.arms.forEach(m=>{m.shoulder.rotation.set(0,0,0);m.elbow.rotation.set(0,0,0);});A(F.mocapPose(a,'mCard',1.4,1));a.root.updateMatrixWorld(true);A(a.arms[1].elbow.getWorldPosition(new T.Vector3()).y>a.arms[0].elbow.getWorldPosition(new T.Vector3()).y+.25,'referee raises the card with the left arm');}
 console.log(JSON.stringify({pass:true,clips:M.clips.map(c=>c.key+':'+c.frames)}));})().catch(e=>{console.error(e);process.exit(1);});
