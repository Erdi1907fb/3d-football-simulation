/* Dead balls remain inside the stadium perimeter, independent of camera order. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('./football-physics.js'));else r.SekmeBallBoundary=f(r.SekmeFootballPhysics);})(typeof globalThis!=='undefined'?globalThis:this,function(P){'use strict';
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),outside=p=>Math.abs(p.x)>52.61||Math.abs(p.z)>34.11;
 function bake(sample,end){let start=null,exit=null;
  for(let t=3.8+P.STEP;t<=end+P.STEP/2;t+=P.STEP){const p=sample(t);if(outside(p)){let low=t-P.STEP,high=t;for(let k=0;k<12;k++){const mid=(low+high)/2;if(outside(sample(mid)))high=mid;else low=mid;}start=high;exit=sample(start);break;}}
  if(start===null)return null;
  const before=sample(Math.max(3.8,start-.02)),b={...exit,vx:clamp((exit.x-before.x)/.02,-42,42),vz:clamp((exit.z-before.z)/.02,-42,42),vy:clamp((exit.y-before.y)/.02,-16,16),spin:0},frames=[{...exit}],hits=[];
  for(let i=1;i<=Math.ceil(Math.max(.1,end-start)/P.STEP)+2;i++){const beforeX=Math.abs(b.x);P.advance(b);const endWall=beforeX<=58.85&&Math.abs(b.z)>=12&&Math.abs(b.z)<=32?58.85:60.3;
   for(const [axis,limit]of[['x',endWall],['z',37.75]])if(Math.abs(b[axis])>limit){b[axis]=Math.sign(b[axis])*(2*limit-Math.abs(b[axis]));const velocity=axis==='x'?'vx':'vz';b[velocity]*=-.25;b.vy*=.45;if(axis==='x')b.vz*=.5;else b.vx*=.5;hits.push({at:start+i*P.STEP,axis});}
   frames.push({x:b.x,y:b.y,z:b.z});
  }
  return{start,exit,kind:Math.abs(exit.z)>34?'throwIn':'goalKick',frames,hits};
 }
 return{bake,outside};
});
