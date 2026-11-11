/* Dedicated arena dressing; existing player, net, turf and lighting resources are reused. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('./vendor/three.min.js'),require('./japon-crowd.js'),require('./japon-net.js'));else r.Next90JaponArena=f(r.THREE,r.Next90JaponCrowd,r.Next90JaponNet);})(typeof globalThis!=='undefined'?globalThis:this,function(T,Crowd,Net){'use strict';
// Keep the shared game's 12 cm cord spacing in metres. Scaling a cloned 7.32 m
// goal also compressed its texture grid and kept shared, mutable net geometry.
function netGeometry(width,height,depth){
 const positions=[],uv=[],indices=[],cell=.12,topDepth=depth*.68,y0=.035;
 function panel(w,h,sw,sh,point,texcoord){const first=positions.length/3;for(let j=0;j<=sh;j++)for(let i=0;i<=sw;i++){const u=i/sw,v=j/sh;const p=point(u,v);positions.push(...p);uv.push(...(texcoord?texcoord(u,v,p):[u*w/cell,v*h/cell]));}for(let j=0;j<sh;j++)for(let i=0;i<sw;i++){const p=first+j*(sw+1)+i;indices.push(p,p+1,p+sw+1,p+1,p+sw+2,p+sw+1);}}
 const backLength=Math.hypot(height-y0,depth-topDepth);
 panel(width,backLength,40,18,(u,v)=>[depth+(topDepth-depth)*v,y0+(height-y0)*v,-width/2+u*width]);
 panel(width,topDepth,40,12,(u,v)=>[v*topDepth,height-.035*Math.sin(Math.PI*u)*Math.sin(Math.PI*v),-width/2+u*width]);
 for(const sign of[-1,1])panel(depth,height-y0,14,18,(u,v)=>[u*(depth+(topDepth-depth)*v),y0+(height-y0)*v,sign*width/2],(u,v,p)=>[p[0]/cell,v*backLength/cell]);
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();geometry.userData.cellMetres=cell;return geometry;
}
function create(world,contest,sides){
 const originalBackground=world.scene.background;world.scene.background=new T.Color(0x173b2c);const root=new T.Group();root.name='japon-arena';world.scene.add(root);const l=contest.layout,goals=[],barriers=[],owned=[],paint=[];
 function mesh(geometry,material,x=0,y=0,z=0,parent=root){owned.push(geometry,material);const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.receiveShadow=true;parent.add(m);return m;}
 function material(color){const m=new T.MeshStandardMaterial({color,roughness:.95});owned.push(m);return m;}
 function stroke(points,color=0xdde9d9,width=.065){for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b.x-a.x,dz=b.z-a.z;paint.push({color,width,length:Math.hypot(dx,dz)+.004,x:(a.x+b.x)/2,z:(a.z+b.z)/2,heading:-Math.atan2(dz,dx)});}}

 // A continuous run-off carpet covers old match markings; this arena has its own perimeter.
 const runOff=mesh(new T.PlaneGeometry(420,420),material(0x173b2c),0,.001,0);runOff.rotation.x=-Math.PI/2;
 const shape=new T.Shape();l.vertices.forEach((p,i)=>i?shape.lineTo(p.x,-p.z):shape.moveTo(p.x,-p.z));shape.closePath();
 const geometry=new T.ShapeGeometry(shape),uv=geometry.attributes.uv,pos=geometry.attributes.position;
 for(let i=0;i<uv.count;i++)uv.setXY(i,pos.getX(i)/8,pos.getY(i)/8);
 const turfMap=world.pitchDetail.grass.clone();turfMap.wrapS=turfMap.wrapT=T.RepeatWrapping;turfMap.repeat.set(1,1);turfMap.needsUpdate=true;owned.push(turfMap);
 const turf=material(0x347e46);turf.map=turfMap;turf.normalMap=world.pitchDetail.grassNormal;turf.normalScale=new T.Vector2(.10,.10);
 const surface=mesh(geometry,turf,0,.005,0);surface.rotation.x=-Math.PI/2;surface.name='japon-playing-surface';
 // Subtle mowing bands, clipped to the actual shape, share the original grass map.
 for(let band=0;band<Math.ceil(l.width/4);band++){if(band%2)continue;const x0=-l.width/2+band*4,x1=x0+4;
 let polygon=l.vertices.map(p=>({...p}));for(const [cut,sign]of[[x0,-1],[x1,1]]){const out=[];for(let i=0;i<polygon.length;i++){const a=polygon[i],b=polygon[(i+1)%polygon.length],aIn=(a.x-cut)*sign<=0,bIn=(b.x-cut)*sign<=0;if(aIn)out.push(a);if(aIn!==bIn){const u=(cut-a.x)/(b.x-a.x);out.push({x:cut,z:a.z+(b.z-a.z)*u});}}polygon=out;}
 if(polygon.length<3)continue;const s=new T.Shape();polygon.forEach((p,i)=>i?s.lineTo(p.x,-p.z):s.moveTo(p.x,-p.z));s.closePath();const g=new T.ShapeGeometry(s),u=g.attributes.uv,p=g.attributes.position;for(let i=0;i<u.count;i++)u.setXY(i,p.getX(i)/8,p.getY(i)/8);const m=material(0x307640);m.map=turfMap;m.depthWrite=false;m.polygonOffset=true;m.polygonOffsetFactor=-1;m.polygonOffsetUnits=-1;const stripe=mesh(g,m,0,.007,0);stripe.rotation.x=-Math.PI/2;stripe.renderOrder=1;}
 stroke([...l.vertices,l.vertices[0]],0xe8eee1,.09);
 const center=Array.from({length:65},(_,i)=>({x:Math.cos(i*Math.PI/32)*1.9,z:Math.sin(i*Math.PI/32)*1.9}));stroke(center,0xe8eee1,.065);
 const dot=mesh(new T.CylinderGeometry(.10,.10,.02,16),new T.MeshBasicMaterial({color:0xf4f1df}),0,.02,0);dot.name='center-drop';
 // The halfway line joins the centre circle to both touchlines on the short pitch.
 if(l.count===2){stroke([{x:0,z:-l.length/2},{x:0,z:l.length/2}],0xe8eee1,.07);}else{for(let i=0;i<l.vertices.length;i+=2){const p=l.vertices[i],length=Math.hypot(p.x,p.z);stroke([{x:p.x/length*1.9,z:p.z/length*1.9},p],0xc9d8c7,.045);}}
 if(l.count===2)for(const g of l.goals){const depth=5.4*l.scale,half=4.9*l.scale,point=(d,t)=>({x:g.x-g.nx*d-g.nz*t,z:g.z-g.nz*d+g.nx*t});stroke([point(0,-half),point(depth,-half),point(depth,half),point(0,half)],0xe8eee1,.09);const p=point(5*l.scale,0),spot=mesh(new T.CylinderGeometry(.10,.10,.02,16),new T.MeshBasicMaterial({color:0xf4f1df}),p.x,.035,p.z);spot.name='penalty-spot-'+g.team;}
 const crowd=world.farBatches?Crowd.create(world,contest,sides):null;
 const boardMat=material(0x132f35),postMat=new T.MeshPhysicalMaterial({color:0xf8f8f4,roughness:.26,clearcoat:.85});owned.push(postMat);
 for(const edge of l.boundaries){const gap=l.goals.find(g=>Math.abs(g.nx-edge.nx)<1e-6&&Math.abs(g.nz-edge.nz)<1e-6),length=Math.hypot(edge.b.x-edge.a.x,edge.b.z-edge.a.z),tx=(edge.b.x-edge.a.x)/length,tz=(edge.b.z-edge.a.z)/length;
 const pieces=gap?[[0,(length-gap.width)/2-.14],[(length+gap.width)/2+.14,length]]:[[0,length]];
 for(const [start,end]of pieces){if(end<=start)continue;const mid=(start+end)/2,m=mesh(new T.BoxGeometry(end-start,.45,.14),boardMat,edge.a.x+tx*mid,.30,edge.a.z+tz*mid);m.rotation.y=-Math.atan2(tz,tx);const top=mesh(new T.BoxGeometry(end-start,.035,.16),material(0x879b91),m.position.x,.54,m.position.z);top.rotation.y=m.rotation.y;}}
 for(const g of l.goals){
 const goal=new T.Group();goal.name='japon-goal-'+g.team;goal.position.set(g.x,.012,g.z);goal.rotation.y=-Math.atan2(g.nz,g.nx);root.add(goal);
 // The normal match / Penalty / Free Kick cord material is reused, with a local
 // material and correctly sized back, roof and side nets; the mouth stays open.
 const source=world.netGoals.find(n=>n.userData.sign===1).getObjectByName('goal-net-cloth');
 const netMat=source.material.clone(),net=mesh(netGeometry(g.width,g.height,g.depth),netMat,0,0,0,goal);net.userData.base=net.geometry.attributes.position.array.slice();net.geometry.attributes.position.setUsage(T.DynamicDrawUsage);net.name='goal-net-cloth';net.renderOrder=3;net.frustumCulled=false;
 for(const z of[-g.width/2,g.width/2])mesh(new T.CylinderGeometry(.06,.06,g.height,24),postMat,0,g.height/2,z,goal).castShadow=true;
 const bar=mesh(new T.CylinderGeometry(.06,.06,g.width,24),postMat,0,g.height,0,goal);bar.rotation.x=Math.PI/2;bar.castShadow=true;
 // Conventional rear ground frame anchors the sloping net on the turf.
 for(const z of[-g.width/2,g.width/2]){const rail=mesh(new T.CylinderGeometry(.025,.025,g.depth,12),postMat,g.depth/2,.035,z,goal);rail.rotation.z=Math.PI/2;}
 const rear=mesh(new T.CylinderGeometry(.025,.025,g.width,12),postMat,g.depth,.035,0,goal);rear.rotation.x=Math.PI/2;goals.push(goal);
 const sideColor=sides[g.team].team.primary,paint=Array.from({length:33},(_,i)=>{const a=-Math.PI/2+i*Math.PI/32,r=g.width*.72;return{x:g.x-g.nx*Math.cos(a)*r-g.nz*Math.sin(a)*r,z:g.z-g.nz*Math.cos(a)*r+g.nx*Math.sin(a)*r};});stroke(paint,sideColor,.11);
 const barrier=mesh(new T.BoxGeometry(.14,.45,g.width),boardMat,g.x,.30,g.z);barrier.rotation.y=goal.rotation.y;barrier.visible=false;barriers.push(barrier);
 }
 // Paint is one draw per colour, with identical metre-sized continuous segments.
 const paintDummy=new T.Object3D();for(const color of new Set(paint.map(p=>p.color))){const pieces=paint.filter(p=>p.color===color),g=new T.BoxGeometry(1,.014,1),m=new T.MeshBasicMaterial({color,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6}),batch=new T.InstancedMesh(g,m,pieces.length);owned.push(g,m);batch.name='japon-pitch-marking';batch.renderOrder=4;batch.frustumCulled=false;pieces.forEach((p,i)=>{paintDummy.position.set(p.x,.03,p.z);paintDummy.rotation.set(0,p.heading,0);paintDummy.scale.set(p.length,1,p.width);paintDummy.updateMatrix();batch.setMatrixAt(i,paintDummy.matrix);});root.add(batch);}
 return{root,goals,crowd,update(frame){crowd?.update(frame);for(let i=0;i<goals.length;i++){const goal=goals[i],last=contest.events?.filter(e=>e.type==='goal'&&e.against===i&&e.at<=frame.time).at(-1),recent=last&&frame.time-last.at<(contest.goalPause||1);goal.visible=frame.active[i]||frame.finished||recent;barriers[i].visible=!frame.active[i]&&!frame.finished&&!recent;const hit=contest.events?.filter(e=>e.type==='net_contact'&&e.against===i&&e.at<=frame.time&&frame.time-e.at<3).at(-1),net=goal.getObjectByName('goal-net-cloth'),positions=net.geometry.attributes.position,base=net.userData.base;for(let j=0;j<positions.count;j++){const point={x:base[j*3],y:base[j*3+1],z:base[j*3+2]},g=l.goals[i],ball=frame.netGoal===i?{depth:(frame.ball.x-g.x)*g.nx+(frame.ball.z-g.z)*g.nz,lateral:-frame.ball.x*g.nz+frame.ball.z*g.nx,y:frame.ball.y}:null,q=hit?Net.deform(point,g,hit,frame.time-hit.at,ball):point;positions.setXYZ(j,q.x,q.y,q.z);}positions.needsUpdate=true;goal.userData.netImpact=hit||null;const post=contest.events?.filter(e=>e.type==='post'&&e.against===i&&e.at<=frame.time&&frame.time-e.at<.75).at(-1),age=post?frame.time-post.at:9;goal.position.y=.012+(age<.75?Math.abs(Math.sin(age*113))*.004*Math.exp(-age*5.5):0);}},dispose(){world.scene.background=originalBackground;crowd?.dispose();root.traverse(o=>{if(o.isInstancedMesh)o.dispose();});root.removeFromParent();for(const resource of new Set(owned))resource.dispose();}};
}
return{create,netGeometry};});
