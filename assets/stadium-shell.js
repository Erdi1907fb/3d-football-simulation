/* Complete open-centre stadium envelope. Shared instanced architecture only;
 * no new textures are downloaded and no spectator/playing area is replaced. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('./vendor/three.min.js'));else r.SekmeStadiumShell=f(r.THREE);})(typeof globalThis!=='undefined'?globalThis:this,function(T){
'use strict';
function perimeter(hx,hz,r,steps=12){const p=[];for(let c=0;c<4;c++){const a=c*Math.PI/2,cx=(c===0||c===3?1:-1)*(hx-r),cz=(c<2?1:-1)*(hz-r);for(let i=0;i<steps;i++){const t=a+i/steps*Math.PI/2;p.push([cx+Math.cos(t)*r,cz+Math.sin(t)*r]);}}return p;}
function create({scene,stadium,profile={rows:4},teams=[]}={}){
 const group=new T.Group();group.name='complete-stadium-envelope';group.userData.baked=true;(stadium||scene).add(group);
 const geometries=new Set(),materials=new Set(),buckets=new Map(),oldBackground=scene.background,oldFogColor=scene.fog?.color.clone();let disposed=false;
 const info={version:54,openCentre:{halfX:69,halfZ:48},outer:{halfX:91,halfZ:70},roofHeight:23.8,architectureInstances:0,drawCalls:0,addedSpectators:0,downloadedTextures:0,backgroundBytes:1024,disposed:false};
 const material=(color,basic=false,extra={})=>{const m=basic?new T.MeshBasicMaterial({color,toneMapped:false,...extra}):new T.MeshStandardMaterial({color,roughness:.88,metalness:.05,...extra});materials.add(m);return m;};
 const facade=material(0x5c7080),dark=material(0x2c4355),silver=material(0x9babb4),roof=material(0x9dabb5,false,{side:T.DoubleSide}),under=material(0x41566b),paving=material(0x435764),street=material(0x233747),grass=material(0x223e3b),window=material(0xb1c8d6,true),warm=material(0xf2d6a3,true),accent=material(teams[0]?.primary??0x477088);
 const unit=new T.BoxGeometry(1,1,1);geometries.add(unit);
 function box(w,h,d,m,x,y,z,angle=0){if(!buckets.has(m))buckets.set(m,[]);buckets.get(m).push({w,h,d,x,y,z,angle});info.architectureInstances++;}
 function mesh(g,m,name){geometries.add(g);const o=new T.Mesh(g,m);o.name=name;o.userData.noBatch=true;group.add(o);return o;}
 function ring(outer,inner,y,m,name){const a=perimeter(...outer),b=perimeter(...inner),vertices=[];for(let i=0;i<a.length;i++){const j=(i+1)%a.length;for(const p of[a[i],b[i],a[j],a[j],b[i],b[j]])vertices.push(p[0],y,p[1]);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.computeVertexNormals();return mesh(g,m,name);}
 function wall(path,y0,y1,m,name){const vertices=[];for(let i=0;i<path.length;i++){const a=path[i],b=path[(i+1)%path.length];vertices.push(a[0],y0,a[1],b[0],y0,b[1],a[0],y1,a[1],a[0],y1,a[1],b[0],y0,b[1],b[0],y1,b[1]);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.computeVertexNormals();const o=mesh(g,m,name);o.material.side=T.DoubleSide;return o;}
 // The ground extends beyond every stadium camera, with a real plaza and ring
 // road so an aerial view reads as a venue rooted in its surroundings.
 box(1200,.35,1200,grass,0,-1.10,0);box(240,.22,190,paving,0,-.78,0);
 ring([139,115,31],[119,95,25],-.62,street,'stadium-ring-road');ring([120,96,25],[111,87,22],-.59,silver,'outer-pedestrian-concourse');
 const outer=perimeter(88.5,67.5,18),inner=perimeter(86.8,65.8,17);
 wall(outer,-.55,17.4,facade,'closed-stadium-exterior');wall(inner,15.5,19.1,dark,'upper-concourse-backwall');
 ring([89,68,18],[85.7,64.7,16],3.4,silver,'lower-concourse-belt');ring([89,68,18],[85.7,64.7,16],10.8,dark,'upper-concourse-belt');
 ring([91,70,20],[69,48,14],23.8,roof,'continuous-open-centre-canopy');ring([90.7,69.7,20],[69.1,48.1,14],23.45,under,'canopy-soffit');
 wall(perimeter(91,70,20),23.45,24.15,silver,'canopy-outer-fascia');wall(perimeter(69,48,14),23.45,24.15,dark,'canopy-inner-fascia');
 // V153 roof-edge floodlight gantry: a row of lamp housings and a lit strip under the inner canopy edge, as in modern
 // stadiums (the bowl top was a dead dark band in every studio shot). Instanced: 1 draw for housings, 1 for lenses.
 {const edge=perimeter(68.2,47.2,13.2,10),pts=[];for(let i=0;i<edge.length;i++){const a=edge[i],b=edge[(i+1)%edge.length],len=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(len/3.4));for(let k=0;k<n;k++){const u=k/n;pts.push([a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u]);}}
  const housingG=new T.BoxGeometry(1.15,.42,.62),lensG=new T.PlaneGeometry(1.0,.3);geometries.add(housingG);geometries.add(lensG);const housingM=material(0x2a3440),lensM=material(0xfff6e2,true,{toneMapped:true});lensM.color.multiplyScalar(.96);
  const housing=new T.InstancedMesh(housingG,housingM,pts.length),lens=new T.InstancedMesh(lensG,lensM,pts.length),o=new T.Object3D();housing.name='roof-floodlight-housings';lens.name='roof-floodlight-lenses';
  pts.forEach((q,i)=>{const yaw=Math.atan2(-q[0],-q[1]);o.position.set(q[0],23.05,q[1]);o.rotation.set(0,yaw,0);o.rotateX(-.5);o.updateMatrix();housing.setMatrixAt(i,o.matrix);o.translateZ(.32);o.updateMatrix();lens.setMatrixAt(i,o.matrix);});
  for(const m of[housing,lens]){m.instanceMatrix.needsUpdate=true;m.userData.noBatch=true;m.frustumCulled=false;group.add(m);}}
 // Repeating columns, glazed hospitality bands and entrance doors connect the
 // separate tiers, including all four curved corners.
 for(let i=0;i<outer.length;i++){const a=outer[i],b=outer[(i+1)%outer.length],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),segments=Math.max(1,Math.ceil(length/6)),angle=-Math.atan2(dz,dx);for(let j=0;j<segments;j++){
  const span=length/segments,u=(j+.5)/segments,x=a[0]+dx*u,z=a[1]+dz*u;
  box(.38,23.5,.65,silver,a[0]+dx*j/segments,11.55,a[1]+dz*j/segments,angle);
  box(Math.max(.4,span-.65),2.8,.12,window,x,7.2,z,angle);box(Math.max(.4,span-.65),2.0,.15,window,x,14.4,z,angle);
  box(Math.max(.4,span-.4),.30,.22,accent,x,11.05,z,angle);
  if((i+j)%3===0){box(Math.max(.5,span*.65),3.05,.18,dark,x,1.1,z,angle);box(Math.max(.5,span*.6),.15,.26,warm,x,2.6,z,angle);}
 }}
 // Roof trusses stop at the aperture; no slab is placed over the pitch.
 for(const sign of[-1,1])for(let x=-64;x<=64;x+=8){box(.23,.42,20.7,silver,x,23.18,sign*59);box(.12,5.0,.12,silver,x,20.5,sign*67.4);}
 for(const sign of[-1,1])for(let z=-40;z<=40;z+=8)box(20.4,.42,.23,silver,sign*80,23.18,z);
 // Plaza lamps, planting beds and approach markings supply scale in wide shots.
 for(const sx of[-1,1])for(let i=-4;i<=4;i++){const x=sx*105,z=i*18;box(.14,7,.14,silver,x,2.8,z);box(1.7,.14,.65,warm,x,6.35,z);box(5.5,.35,3.0,dark,sx*111,-.4,z+5);box(4.8,.75,2.3,grass,sx*111,.05,z+5);}
 for(const sz of[-1,1])for(let i=-5;i<=5;i++){const x=i*18,z=sz*82;box(.14,7,.14,silver,x,2.8,z);box(1.7,.14,.65,warm,x,6.35,z);if(i%2===0)for(let k=0;k<5;k++)box(.5,.025,4.7,window,x+k-2,-.47,sz*92);}
 // A small, deterministic urban silhouette lies outside the approach roads.
 for(let i=0;i<36;i++){const a=i/36*Math.PI*2,radius=200+(i*31%37),x=Math.cos(a)*radius,z=Math.sin(a)*radius,h=12+(i*17%28),w=12+(i*7%13),d=10+(i*3%12);box(w,h,d,dark,x,h/2-1,z);for(let row=0;row<Math.floor(h/4);row++)box(w*.72,.55,.03,i%3?window:warm,x,row*4+2,z+d/2+.02);}
 // A 2x128 procedural dusk gradient replaces the pure black void. It is not an
 // environment map and adds no real-time lighting or downloaded asset cost.
 const pixels=new Uint8Array(2*128*4);for(let y=0;y<128;y++){const t=y/127;for(let x=0;x<2;x++)pixels.set([Math.round(50-34*t),Math.round(73-44*t),Math.round(91-40*t),255],(y*2+x)*4);}
 const sky=new T.DataTexture(pixels,2,128,T.RGBAFormat);sky.colorSpace=T.SRGBColorSpace;sky.magFilter=sky.minFilter=T.LinearFilter;sky.generateMipmaps=false;sky.needsUpdate=true;scene.background=sky;if(scene.fog)scene.fog.color.setHex(0x32495b);
 const dummy=new T.Object3D();for(const [m,items]of buckets){const batch=new T.InstancedMesh(unit,m,items.length);batch.name='stadium-envelope-instances';batch.userData.noBatch=true;batch.userData.baked=true;items.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(0,p.angle,0);dummy.scale.set(p.w,p.h,p.d);dummy.updateMatrix();batch.setMatrixAt(i,dummy.matrix);});batch.instanceMatrix.needsUpdate=true;batch.computeBoundingSphere();group.add(batch);}
 info.drawCalls=group.children.length;info.geometryCount=geometries.size;info.materialCount=materials.size;info.roofApertureClear=true;group.userData.stadiumShell=info;
 return{group,info,ownsGeometry:g=>geometries.has(g),dispose(){if(disposed)return;disposed=true;info.disposed=true;group.removeFromParent();group.traverse(o=>{if(o.isInstancedMesh)o.dispose();});for(const g of geometries)g.dispose();for(const m of materials)m.dispose();sky.dispose();if(scene.background===sky)scene.background=oldBackground;if(scene.fog&&oldFogColor)scene.fog.color.copy(oldFogColor);}};
}
return{create,perimeter};
});
