/* V260 realistic athlete proportions (one place for every rig that uses the shared actor skeleton).
 * The legacy rig had ~25% short legs (hip at 0.40 of the height instead of ~0.50) and short arms. The legs (thigh,
 * shin) and arms (upper arm, forearm) are lengthened here, the upper body is lifted by the extra leg length, and the
 * whole body is scaled back uniformly so every player keeps exactly his real height (head ~13% of the height,
 * shoulders/hips narrower as in real anthropometry). Animation code keeps authoring in legacy units: an absolute
 * waist height goes through waist(), a crouch/drop distance through drop(). */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f();else r.Next90Proportions=f();})(typeof self!=='undefined'?self:this,function(){
 'use strict';
 const LEG=1.33,ARM=1.2,HIP=.77,KNEE=.40,ANKLE=.05,SHOULDER=1.43,TOP=1.914,PIVOT=.20/* waist height whose legs would have zero length: hip .15 below the waist + ankle .05 */;
 const LIFT=(HIP-ANKLE)*(LEG-1),SCALE=TOP/(TOP+LIFT),SEG=(HIP-ANKLE)*LEG/2,THIGH_K=SEG/(HIP-KNEE),SHIN_K=SEG/(KNEE-ANKLE)/* equal thigh and shank (Drillis-Contini: knee midway between hip and ankle) */;
 const waist=y=>y>PIVOT?PIVOT+(y-PIVOT)*LEG:y,drop=d=>d*LEG;
 /* Bind-pose remap of the shared full-body mesh: leg bones stretch between ankle and hip, arm bones between shoulder
    and wrist, everything else (pelvis up, head) is lifted rigidly. Returns [dy, dDy/dy] for a vertex bound to `bone`. */
 function boneShift(bone,y){
  if(/^(thigh|calf|foot|ball)_/.test(bone)){if(y<=ANKLE)return[0,1];if(y>=HIP)return[LIFT,1];if(y<=KNEE)return[(y-ANKLE)*(SHIN_K-1),SHIN_K];return[(KNEE-ANKLE)*(SHIN_K-1)+(y-KNEE)*(THIGH_K-1),THIGH_K];}
  if(/^(upperarm|lowerarm|hand|index|middle|ring|pinky|thumb)_/.test(bone)){const wrist=.95;if(y>=SHOULDER)return[LIFT,1];const yy=Math.max(y,wrist),d=LIFT-(SHOULDER-yy)*(ARM-1);return[d,y>=wrist?ARM:1];}
  return[LIFT,1];
 }
 return Object.freeze({LEG,ARM,LIFT,SCALE,TOP,THIGH:SEG,SHIN:SEG,UPPER_ARM:.22*ARM,FOREARM:.26*ARM,HAND:.26*ARM,REST_WAIST:waist(.92),waist,drop,boneShift});
});
