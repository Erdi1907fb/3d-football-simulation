/* Original Next90Sim studio ground response. Fixed-time gait contacts reconstruct on
 * seek, independent of camera, preview FPS and export. Visual only: never changes outcomes. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('./vendor/three.min.js'));else r.Next90StudioGround=f(r.THREE);})(typeof globalThis!=='undefined'?globalThis:this,function(T){'use strict';
 const STEP=1/60;
 function trace(sample,time){const current=sample(time),start=current.start||0,end=Math.min(time,start+30),last=new Map(),marks=[];
  for(let tick=0;tick<=Math.floor((end-start)/STEP+1e-6);tick++){const t=start+tick*STEP,f=sample(t);if(f.id!==current.id)continue;
   (f.actors||[]).forEach((p,i)=>{if(!p||p.dismissed)return;const heading=p.heading||0,s=Math.sin(heading),c=Math.cos(heading),speed=p.speed||0;
    if(p.keeper&&(p.dive||0)>.45&&(p.diveLift||0)<.09&&!p.keeperGather){const key=i+'slide',old=last.get(key);if(!old||Math.hypot(p.x-old.x,p.z-old.z)>.15){marks.push({x:p.x,z:p.z,heading,t,slide:true});last.set(key,p);}return;}
    if((p.diveLift||0)>.06)return;
    for(let foot=0;foot<2;foot++){const phase=(p.gait||0)*(p.keeper?1:.37)+foot*Math.PI,stance=speed<.2||Math.cos(phase)<-.2;if(!stance)continue;const side=foot?.13:-.13,forward=speed>.2?Math.sin(phase)*.21:0,x=p.x+c*side+s*forward,z=p.z-s*side+c*forward,key=i+':'+foot,old=last.get(key);if(!old||Math.hypot(x-old.x,z-old.z)>.24){marks.push({x,z,heading,t,slide:false});last.set(key,{x,z});}}
   });
  }return{...current,marks};
 }
 function create(scene,kind,sample){if(typeof document==='undefined'||typeof sample!=='function')return null;const snow=kind==='snow',cv=document.createElement('canvas');cv.width=1536;cv.height=1024;const ctx=cv.getContext('2d'),texture=new T.CanvasTexture(cv);let previous='',records=[],cachedId=null,cached=[];
  // Local set-piece area: adequate texel density for studs, remaining field unchanged.
  const bounds={x:12,z:-20,w:46,h:40},plane=snow?new T.Mesh(new T.PlaneGeometry(bounds.w,bounds.h),new T.MeshStandardMaterial({map:texture,transparent:true,roughness:1,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1})):null;
  if(plane){plane.rotation.x=-Math.PI/2;plane.position.set(bounds.x+bounds.w/2,.005,bounds.z+bounds.h/2);plane.userData.noBatch=true;scene.add(plane);}
  const N=256,g=new T.BufferGeometry(),pos=new Float32Array(N*3);g.setAttribute('position',new T.BufferAttribute(pos,3).setUsage(T.DynamicDrawUsage));g.setAttribute('aFade',new T.BufferAttribute(new Float32Array(N),1).setUsage(T.DynamicDrawUsage));
  const material=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uSize:{value:1}},vertexShader:'attribute float aFade;varying float vFade;uniform float uSize;void main(){vFade=aFade;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(uSize/max(-mv.z,.5),1.,14.);}',fragmentShader:'varying float vFade;void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(.90,.95,1.,smoothstep(.5,.15,d)*vFade);}' });
  const particles=new T.Points(g,material);particles.frustumCulled=false;particles.userData.noBatch=true;particles.onBeforeRender=(renderer,sc,camera)=>{material.uniforms.uSize.value=(renderer.getDrawingBufferSize(new T.Vector2()).y||1080)*.12*(camera.projectionMatrix.elements[5]||1.7);};scene.add(particles);
  function paint(){ctx.globalCompositeOperation='source-over';ctx.fillStyle='#e0e7ec';ctx.clearRect(0,0,cv.width,cv.height);ctx.globalAlpha=.84;ctx.fillRect(0,0,cv.width,cv.height);ctx.globalAlpha=1;ctx.globalCompositeOperation='destination-out';const sx=cv.width/bounds.w,sz=cv.height/bounds.h;
   for(const m of records){ctx.save();ctx.translate((m.x-bounds.x)*sx,(m.z-bounds.z)*sz);ctx.rotate(-m.heading);ctx.fillStyle='rgba(0,0,0,.88)';ctx.beginPath();ctx.ellipse(0,0,(m.slide?.26:.075)*sx,(m.slide?.52:.16)*sz,0,0,Math.PI*2);ctx.fill();if(!m.slide)for(const x of[-.045,.045])for(const z of[-.10,0,.10]){ctx.beginPath();ctx.arc(x*sx,z*sz,.018*sx,0,Math.PI*2);ctx.fill();}ctx.restore();}texture.needsUpdate=true;
  }
  return{update(t){const current=sample(t);if(cachedId!==current.id){cachedId=current.id;cached=trace(sample,(current.end||t)-1e-7).marks;}const f={...current,marks:cached.filter(m=>m.t<=t+1e-7)},key=f.id+':'+f.marks.length;records=f.marks;if(key!==previous){previous=key;if(snow)paint();}const fades=g.attributes.aFade.array;fades.fill(0);let n=0;for(let j=records.length-1;j>=0&&n<N;j--){const m=records[j],age=t-m.t,life=snow?.75:.42;if(age<0||age>life)continue;for(let k=0;k<5&&n<N;k++,n++){const angle=(j*7+k)*2.399,vel=.35+(k%3)*.16;pos[n*3]=m.x+Math.cos(angle)*vel*age;pos[n*3+1]=.025+(snow?.7:1.1)*age-1.6*age*age;pos[n*3+2]=m.z+Math.sin(angle)*vel*age;fades[n]=Math.max(0,(1-age/life)*(snow?.65:.8));}}g.attributes.position.needsUpdate=true;g.attributes.aFade.needsUpdate=true;scene.userData.studioGround={kind,marks:records.length,kick:f.id};},dispose(){if(plane){scene.remove(plane);plane.geometry.dispose();plane.material.dispose();}texture.dispose();scene.remove(particles);g.dispose();material.dispose();delete scene.userData.studioGround;}};
 }
 return{trace,create};
});
