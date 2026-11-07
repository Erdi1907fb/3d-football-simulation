/* Deterministic camera filtering, independent of render order or export FPS. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./vendor/three.min.js'));else root.SekmeCameraStabilizer=factory(root.THREE);})(typeof globalThis!=='undefined'?globalThis:this,function(T){
'use strict';
function create(sample,positionCamera,camera){
 let track=null;
 const capture=()=>{const position=camera.position.clone();return{position,aim:camera.userData.framingAim?.clone()||position.clone().addScaledVector(camera.getWorldDirection(new T.Vector3()),40),fov:camera.fov};};
 return function(state,aspect,view,critical,fit){
  if(!sample||state.outOfPlay||view==='wide'||!['playing','goal'].includes(state.phase)||state.preReview||(state.resolution&&['clearance','out','hold'].includes(state.resolution.stage))||state.replay||state.celebration)return;
  if(!track||track.chance!==state.chance||track.aspect!==aspect||track.phase!==state.phase)track={chance:state.chance,aspect,phase:state.phase,entries:new Map()};
  const fallback=capture(),at=index=>{
   if(track.entries.has(index))return track.entries.get(index);
   const other=sample(Math.max(0,index/30));let value=null;
   if(!other.outOfPlay&&other.chance===state.chance&&other.phase===state.phase&&!other.preReview&&!(other.resolution&&['clearance','out','hold'].includes(other.resolution.stage))&&!other.replay&&!other.celebration){positionCamera(other,aspect,view);value=capture();}
   track.entries.set(index,value);return value;
  };
  const position=new T.Vector3(),aim=new T.Vector3(),weights=[1,4,6,4,1],time=state.time*30;let fov=0;
  for(let i=0;i<5;i++){
   const t=time+(i-2)*2.4,index=Math.floor(t),mix=t-index,a=at(index)||fallback,b=at(index+1)||a,weight=weights[i]/16;
   position.addScaledVector(a.position,weight*(1-mix)).addScaledVector(b.position,weight*mix);aim.addScaledVector(a.aim,weight*(1-mix)).addScaledVector(b.aim,weight*mix);fov+=(a.fov*(1-mix)+b.fov*mix)*weight;
  }
  camera.fov=fov;fit(aim,position.clone().sub(aim),critical.map(p=>new T.Vector3(...p)),position.distanceTo(aim),.86,.54,.39);
 };
}
return {create};
});
