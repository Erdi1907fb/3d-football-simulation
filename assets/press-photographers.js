(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('./vendor/three.min.js'),require('./stadium-layout.js'));else r.SekmePress=f(r.THREE,r.SekmeStadiumLayout);})(typeof globalThis!=='undefined'?globalThis:this,function(T,Layout){'use strict';
 function create({scene,makeActor,box,cylinder,sphere,mesh,geo,mat,armTarget,canvasFactory}){
  const makeCanvas=(w,h)=>canvasFactory?canvasFactory(w,h):typeof document!=='undefined'?document.createElement('canvas'):null,canvas=makeCanvas(64,64);let glow=null;
  if(canvas){canvas.width=canvas.height=64;const c=canvas.getContext('2d'),g=c.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'#ffffffff');g.addColorStop(.10,'#ffffffff');g.addColorStop(.30,'#e7f3ffd0');g.addColorStop(1,'#ffffff00');c.fillStyle=g;c.fillRect(0,0,64,64);glow=new T.CanvasTexture(canvas);glow.colorSpace=T.SRGBColorSpace;}
  const label=makeCanvas(128,64);let pressTexture=null;if(label){label.width=128;label.height=64;const c=label.getContext('2d');c.fillStyle='#164c34';c.fillRect(0,0,128,64);c.fillStyle='#eef4de';c.font='bold 34px Arial, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('PRESS',64,34);pressTexture=new T.CanvasTexture(label);pressTexture.colorSpace=T.SRGBColorSpace;}
  const items=Layout.photographers.map((base,index)=>{
   const a=makeActor(index);a.root.userData.animate=true;a.root.userData.photographer=base.id;scene.add(a.root);
   a.root.traverse(o=>{if(o.isMesh&&o.material?.color){const color=o.material.color.getHex();if(color===0xd9ed53)o.material=mat(index%3?0x297b4d:0x368b58,.9);if(color===0x172630)o.material=mat(0x28333b,.92);}});
   for(const arm of a.arms)for(const part of arm.elbow.children)if(part.geometry?.type==='CylinderGeometry')part.material=mat(index%3?0x297b4d:0x368b58,.9);
   box(a.waist,.33,.36,.012,0x46905f,0,.30,.165);if(pressTexture){const sign=mesh(geo('PlaneGeometry',.26,.13),new T.MeshBasicMaterial({map:pressTexture,toneMapped:false}),a.waist,0,.34,.177);sign.userData.noBatch=true;}
   const camera=new T.Group();camera.name='press-camera';camera.position.set(0,.69,.27);a.waist.add(camera);box(camera,.28,.19,.15,0x172027,0,0,0);box(camera,.085,.21,.15,0x202a30,.14,-.015,.015);box(camera,.105,.07,.11,0x151c21,0,.115,-.015);box(camera,.085,.045,.07,0xe0e6e5,.08,.13,.045);
   const barrel=cylinder(camera,.078,.086,.28,0x111a20,0,-.012,.21);barrel.rotation.x=Math.PI/2;for(const z of[.14,.24,.32]){const ring=cylinder(camera,.089,.089,.018,0x465258,0,-.012,z);ring.rotation.x=Math.PI/2;}const hood=cylinder(camera,.11,.09,.11,0x131d23,0,-.012,.40);hood.rotation.x=Math.PI/2;const glass=cylinder(camera,.084,.084,.008,0x3f7187,0,-.012,.457);glass.rotation.x=Math.PI/2;sphere(camera,.012,0xc6473d,.10,.055,.085);
   for(const side of[-1,1]){const strap=box(a.waist,.026,.35,.018,0x17282d,side*.13,.54,.18);strap.rotation.z=side*.20;}
   const source=new T.Object3D();source.position.set(.08,.15,.09);camera.add(source);const material=new T.MeshBasicMaterial({color:0xf3f8ff,map:glow,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false,side:T.DoubleSide}),flash=new T.Mesh(new T.PlaneGeometry(.72,.72),material);flash.userData.noBatch=true;flash.visible=false;scene.add(flash);
   return{base,actor:a,camera,source,flash,index,flashPulse:0,subject:null};
  });
  function update(state,showTime,poseActor){const celebration=state.celebration,scorer=celebration?state.players.find(p=>p.id===celebration.scorer):null,shooting=!!scorer&&!!state.goalCelebration&&!state.replay&&['solo','join','group'].includes(celebration.stage),group=celebration?.stage==='group';
   let subject=scorer?{x:scorer.x,z:scorer.z}:state.ball;if(group){const nearby=state.players.filter(p=>p.team===celebration.team&&!p.keeper&&!p.dismissed&&Math.hypot(p.x-scorer.x,p.z-scorer.z)<7);if(nearby.length)subject={x:nearby.reduce((a,p)=>a+p.x,0)/nearby.length,z:nearby.reduce((a,p)=>a+p.z,0)/nearby.length};}
   for(const p of items){const {actor:a,base}=p,near=shooting&&Math.hypot(subject.x-base.x,subject.z-base.z)<16,aim=near?subject:state.ball,heading=Math.atan2(aim.x-base.x,aim.z-base.z);poseActor(a,{x:base.x,z:base.z,heading,speed:0,gait:0,lookAngle:0});a.body.rotation.x=.035;a.head.rotation.x=base.stance==='kneel'?-.06:.025;a.camera=p.camera;
    if(base.stance==='kneel'){a.waist.position.y=.65;a.legs[0].hip.rotation.x=-1.10;a.legs[0].knee.rotation.x=1.70;a.legs[0].boot.rotation.x=-.60;a.legs[1].hip.rotation.x=.20;a.legs[1].knee.rotation.x=1.40;a.legs[1].boot.rotation.x=-1.60;}
    armTarget(a,0,[-.07,.64,.39]);armTarget(a,1,[.13,.69,.28]);p.camera.rotation.x=base.stance==='kneel'?-.05:.015;
    const cycle=((showTime*(state.matchPresentation?.big?2.4:1.65)+p.index*.317)%1+1)%1;p.flashPulse=near&&cycle<.11?Math.sin(Math.PI*cycle/.11):0;p.subject=near?{...subject}:null;p.flash.visible=p.flashPulse>.02;p.flash.material.opacity=p.flashPulse*.92;p.flash.scale.setScalar(.60+p.flashPulse*.65);
    a.root.updateMatrixWorld(true);p.source.getWorldPosition(p.flash.position);
   }
  }
  return{items,update,face(camera){for(const p of items)if(p.flash.visible)p.flash.quaternion.copy(camera.quaternion);},dispose(){glow?.dispose();pressTexture?.dispose();for(const p of items){p.flash.material.dispose();p.flash.geometry.dispose();}}};
 }
 return{create,positions:Layout.photographers};
});
