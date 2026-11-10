/* Dedicated arena dressing; existing player, net, turf and lighting resources are reused. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('./vendor/three.min.js'));else r.Next90JaponArena=f(r.THREE);})(typeof globalThis!=='undefined'?globalThis:this,function(T){'use strict';
function create(world,contest,sides){
 const root=new T.Group();root.name='japon-arena';world.scene.add(root);const l=contest.layout,goals=[],barriers=[],owned=[];
 function mesh(geometry,material,x=0,y=0,z=0,parent=root){owned.push(geometry,material);const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.receiveShadow=true;parent.add(m);return m;}
 function material(color){const m=new T.MeshStandardMaterial({color,roughness:.95});owned.push(m);return m;}
 function stroke(points,color=0xdde9d9,width=.065,parent=root){for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b.x-a.x,dz=b.z-a.z,m=mesh(new T.BoxGeometry(Math.hypot(dx,dz),.014,width),new T.MeshBasicMaterial({color}), (a.x+b.x)/2,.018,(a.z+b.z)/2,parent);m.rotation.y=-Math.atan2(dz,dx);}}
 // A continuous run-off carpet covers old match markings; this arena has its own perimeter.
 const runOff=mesh(new T.PlaneGeometry(112,78),material(0x173b2c),0,.001,0);runOff.rotation.x=-Math.PI/2;
 const shape=new T.Shape();l.vertices.forEach((p,i)=>i?shape.lineTo(p.x,-p.z):shape.moveTo(p.x,-p.z));shape.closePath();
 const geometry=new T.ShapeGeometry(shape),uv=geometry.attributes.uv,pos=geometry.attributes.position;
 for(let i=0;i<uv.count;i++)uv.setXY(i,pos.getX(i)/8,pos.getY(i)/8);
 const turfMap=world.pitchDetail.grass.clone();turfMap.wrapS=turfMap.wrapT=T.RepeatWrapping;turfMap.repeat.set(1,1);turfMap.needsUpdate=true;owned.push(turfMap);
 const turf=material(0x347e46);turf.map=turfMap;turf.normalMap=world.pitchDetail.grassNormal;turf.normalScale=new T.Vector2(.10,.10);
 const surface=mesh(geometry,turf,0,.005,0);surface.rotation.x=-Math.PI/2;surface.name='japon-playing-surface';
 // Subtle mowing bands, clipped to the actual shape, share the original grass map.
 for(let band=0;band<Math.ceil(l.width/4);band++){if(band%2)continue;const x0=-l.width/2+band*4,x1=x0+4;
 let polygon=l.vertices.map(p=>({...p}));for(const [cut,sign]of[[x0,-1],[x1,1]]){const out=[];for(let i=0;i<polygon.length;i++){const a=polygon[i],b=polygon[(i+1)%polygon.length],aIn=(a.x-cut)*sign<=0,bIn=(b.x-cut)*sign<=0;if(aIn)out.push(a);if(aIn!==bIn){const u=(cut-a.x)/(b.x-a.x);out.push({x:cut,z:a.z+(b.z-a.z)*u});}}polygon=out;}
 if(polygon.length<3)continue;const s=new T.Shape();polygon.forEach((p,i)=>i?s.lineTo(p.x,-p.z):s.moveTo(p.x,-p.z));s.closePath();const g=new T.ShapeGeometry(s),u=g.attributes.uv,p=g.attributes.position;for(let i=0;i<u.count;i++)u.setXY(i,p.getX(i)/8,p.getY(i)/8);const m=material(0x307640);m.map=turfMap;m.polygonOffset=true;m.polygonOffsetFactor=-1;m.polygonOffsetUnits=-1;const stripe=mesh(g,m,0,.007,0);stripe.rotation.x=-Math.PI/2;}
 stroke([...l.vertices,l.vertices[0]],0xe8eee1,.09);
 const center=Array.from({length:65},(_,i)=>({x:Math.cos(i*Math.PI/32)*1.9,z:Math.sin(i*Math.PI/32)*1.9}));stroke(center,0xe8eee1,.065);
 const dot=mesh(new T.CylinderGeometry(.10,.10,.02,16),new T.MeshBasicMaterial({color:0xf4f1df}),0,.02,0);dot.name='center-drop';
 const boardMat=material(0x132f35),postMat=new T.MeshPhysicalMaterial({color:0xf8f8f4,roughness:.26,clearcoat:.85});owned.push(postMat);
 for(const edge of l.boundaries){const gap=l.goals.find(g=>Math.abs(g.nx-edge.nx)<1e-6&&Math.abs(g.nz-edge.nz)<1e-6),length=Math.hypot(edge.b.x-edge.a.x,edge.b.z-edge.a.z),tx=(edge.b.x-edge.a.x)/length,tz=(edge.b.z-edge.a.z)/length;
 const pieces=gap?[[0,(length-gap.width)/2-.14],[(length+gap.width)/2+.14,length]]:[[0,length]];
 for(const [start,end]of pieces){if(end<=start)continue;const mid=(start+end)/2,m=mesh(new T.BoxGeometry(end-start,.45,.14),boardMat,edge.a.x+tx*mid,.30,edge.a.z+tz*mid);m.rotation.y=-Math.atan2(tz,tx);const top=mesh(new T.BoxGeometry(end-start,.035,.16),material(0x879b91),m.position.x,.54,m.position.z);top.rotation.y=m.rotation.y;}}
 for(const g of l.goals){
 const goal=world.netGoals.find(n=>n.userData.sign===1).clone(true);goal.name='japon-goal-'+g.team;goal.position.set(g.x,.012,g.z);goal.rotation.y=-Math.atan2(g.nz,g.nx);goal.scale.set(g.depth/2,g.height/2.44,g.width/7.32);root.add(goal);
 for(const z of[-3.66,3.66])mesh(new T.CylinderGeometry(.07,.07,2.44,20),postMat,0,1.22,z,goal).castShadow=true;
 const bar=mesh(new T.CylinderGeometry(.07,.07,7.32,20),postMat,0,2.44,0,goal);bar.rotation.x=Math.PI/2;bar.castShadow=true;goals.push(goal);
 const sideColor=sides[g.team].team.primary,paint=Array.from({length:33},(_,i)=>{const a=-Math.PI/2+i*Math.PI/32,r=g.width*.72;return{x:g.x-g.nx*Math.cos(a)*r-g.nz*Math.sin(a)*r,z:g.z-g.nz*Math.cos(a)*r+g.nx*Math.sin(a)*r};});stroke(paint,sideColor,.11);
 const barrier=mesh(new T.BoxGeometry(.14,.45,g.width),boardMat,g.x,.30,g.z);barrier.rotation.y=goal.rotation.y;barrier.visible=false;barriers.push(barrier);
 }
 return{root,goals,update(frame){for(let i=0;i<goals.length;i++){goals[i].visible=frame.active[i]||frame.finished;barriers[i].visible=!frame.active[i]&&!frame.finished;}},dispose(){root.removeFromParent();for(const resource of new Set(owned))resource.dispose();}};
}
return{create};});
