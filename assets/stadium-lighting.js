/* Stable night-match lighting. Four visible corner towers share four broad lights. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./vendor/three.min.js'));else root.SekmeStadiumLighting=factory(root.THREE);})(typeof globalThis!=='undefined'?globalThis:this,function(T){
'use strict';
function radialTexture(size,shadow=false){
 const pixels=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const r=Math.hypot((x+.5-size/2)/(size/2),(y+.5-size/2)/(size/2)),alpha=Math.max(0,1-r);
  pixels.set([255,255,255,Math.round(255*Math.pow(alpha,shadow?1.8:2.5))],(y*size+x)*4);
 }
 const texture=new T.DataTexture(pixels,size,size,T.RGBAFormat);texture.magFilter=T.LinearFilter;texture.minFilter=T.LinearMipmapLinearFilter;texture.generateMipmaps=true;texture.needsUpdate=true;return texture;
}
function create(scene,stadium){
 scene.background=new T.Color(0x040a16);scene.fog=new T.Fog(0x081321,155,340);
 const ambient=new T.HemisphereLight(0xcbdff5,0x183023,1.05);ambient.name='night-sky-fill';scene.add(ambient);
 const metal=new T.MeshStandardMaterial({color:0x71838f,roughness:.76,metalness:.18}),dark=new T.MeshStandardMaterial({color:0x17232f,roughness:.85}),concrete=new T.MeshStandardMaterial({color:0x455660,roughness:1}),face=new T.MeshBasicMaterial({color:0xeaf4ff,toneMapped:false});
 const poleGeometry=new T.CylinderGeometry(.095,.095,1,10),housingGeometry=new T.BoxGeometry(1.16,.70,.36),faceGeometry=new T.PlaneGeometry(1.02,.56),haloTexture=radialTexture(64),shadowTexture=radialTexture(64,true);
 const haloMaterial=new T.MeshBasicMaterial({color:0xaaceff,map:haloTexture,transparent:true,opacity:.13,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});
 function part(parent,geometry,material,x=0,y=0,z=0){const mesh=new T.Mesh(geometry,material);mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
 function bar(parent,a,b,radius=.095){const d=new T.Vector3().subVectors(b,a),mesh=part(parent,poleGeometry,metal);mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.scale.set(radius/.095,d.length(),radius/.095);mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return mesh;}
 const towers=[],lights=[];
 for(const sx of[-1,1])for(const sz of[-1,1]){
  const root=new T.Group();root.name='floodlight-tower-'+sx+'-'+sz;root.position.set(sx*80,0,sz*63);root.userData.baked=true;stadium.add(root);
  part(root,new T.BoxGeometry(3.4,.65,3.4),concrete,0,.25,0);
  const h=43,edge=y=>1.12-.68*y/h;
  for(const dx of[-1,1])for(const dz of[-1,1])bar(root,new T.Vector3(dx*edge(0),.55,dz*edge(0)),new T.Vector3(dx*edge(h),h,dz*edge(h)),.12);
  for(let i=0;i<8;i++){
   const y=.8+i*5.2,next=Math.min(h,y+5.2),e=edge(y),en=edge(next);
   for(const side of[-1,1]){
    bar(root,new T.Vector3(-e,y,side*e),new T.Vector3(e,y,side*e),.065);
    bar(root,new T.Vector3(side*e,y,-e),new T.Vector3(side*e,y,e),.065);
    bar(root,new T.Vector3(-e,y,side*e),new T.Vector3(en,next,side*en),.055);
    bar(root,new T.Vector3(side*e,y,-e),new T.Vector3(side*en,next,en),.055);
   }
  }
  // A maintenance ladder and service platform make the mast read as stadium equipment.
  for(let y=1;y<42;y+=.75)bar(root,new T.Vector3(-.29,y,-edge(y)-.08),new T.Vector3(.29,y,-edge(y)-.08),.033);
  part(root,new T.BoxGeometry(8.9,.18,2.2),metal,0,43.15,0);
  const head=new T.Group();head.name='inward-projector-array';head.position.set(0,45.2,0);root.add(head);
  const target=new T.Vector3(sx*16,.5,sz*9);head.lookAt(target);
  const panels=[];
  for(let row=0;row<4;row++)for(let col=0;col<6;col++){
   const x=(col-2.5)*1.32,y=(row-1.5)*.88;part(head,housingGeometry,dark,x,y,0);
   const lens=part(head,faceGeometry,face,x,y,.19);panels.push(lens);
  }
  part(head,new T.PlaneGeometry(10.6,5.4),haloMaterial,0,0,.22);
  const light=new T.SpotLight(0xe4efff,1.75,190,Math.PI*.285,.72,0);light.name='pitch-floodlight-'+sx+'-'+sz;light.position.copy(root.position).add(new T.Vector3(0,45.2,0));light.target.position.copy(target);light.castShadow=false;scene.add(light,light.target);lights.push(light);
  towers.push({root,head,panels,light,target:target.clone(),height:45.2});
 }
 // Steady architectural strips remain below the tower brightness; no strobe or auto exposure.
 const rimMaterial=new T.MeshBasicMaterial({color:0x516c83,toneMapped:false});
 for(const side of[-1,1]){part(stadium,new T.BoxGeometry(126,.075,.10),rimMaterial,0,8.64,side*53.75);part(stadium,new T.BoxGeometry(.10,.075,88),rimMaterial,side*71.65,8.35,0);}
 const info={mode:'night',temperatureK:5600,towers:4,panels:96,realTimeLights:4,shadowMaps:0,steady:true};scene.userData.lighting=info;
 return {towers,lights,ambient,shadowTexture,info,dispose(){haloTexture.dispose();shadowTexture.dispose();}};
}
return {create};
});
