/* Equal local terraces use the shared game's spectator poses, beside the actual pitch. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('./vendor/three.min.js'));else r.Next90JaponCrowd=f(r.THREE);})(typeof globalThis!=='undefined'?globalThis:this,function(T){'use strict';
function offsetEdges(layout,offset){const edges=layout.boundaries,meet=(a,b)=>{const ad=a.d+offset,bd=b.d+offset,det=a.nx*b.nz-b.nx*a.nz;return{x:(ad*b.nz-bd*a.nz)/det,z:(a.nx*bd-b.nx*ad)/det};};return edges.map((e,i)=>({...e,a:meet(edges[(i+edges.length-1)%edges.length],e),b:meet(e,edges[(i+1)%edges.length])}));}
function slots(layout){const edges=layout.boundaries,lengths=edges.map(e=>Math.hypot(e.b.x-e.a.x,e.b.z-e.a.z)),perimeter=lengths.reduce((a,b)=>a+b,0),rows=5,perTeam=Math.max(20,Math.round(perimeter/(layout.count*.82)))*rows,count=layout.count*perTeam,perRow=count/rows,baseAngle=layout.count===2?0:-Math.PI/2,out=[];
 for(let row=0;row<rows;row++){const ring=offsetEdges(layout,4.1+row*1.05),lens=ring.map(e=>Math.hypot(e.b.x-e.a.x,e.b.z-e.a.z)),total=lens.reduce((a,b)=>a+b,0);for(let i=0;i<perRow;i++){let along=(i+.5)*total/perRow,index=0;while(index<ring.length-1&&along>lens[index])along-=lens[index++];const e=ring[index],u=along/lens[index],x=e.a.x+(e.b.x-e.a.x)*u,z=e.a.z+(e.b.z-e.a.z)*u;out.push({x,z,y:.65+row*.55,row,heading:Math.atan2(-x,-z),angle:(Math.atan2(z,x)-baseAngle+Math.PI/layout.count+Math.PI*4)%(Math.PI*2)});}}
 out.sort((a,b)=>a.angle-b.angle||a.row-b.row);return out.map((p,i)=>({...p,id:i,team:Math.floor(i/perTeam),phase:(i*1.618)%6.28}));
}
// Bake the NORMAL match's detailed, articulated spectator into shared pose buffers.
// Heads/eyes/hair, collars, bent limbs, shoes, hats and scarves stay the same model.
function detailedTemplates(world){if(!world.createSpectator)return world.farBatches;
 const result=[];
 for(const pose of[0,1,3,4,6])for(let variant=0;variant<3;variant++){const holder=new T.Group(),f=world.createSpectator({id:[0,13,26][variant],x:0,y:.23,z:0,heading:0,team:0,detail:true},holder);f.root.scale.setScalar(1);
 if(pose===6){f.body.position.y=-.25;for(const leg of f.legs){leg.rotation.x=-Math.PI/2;leg.userData.knee.rotation.x=Math.PI/2;}}
 f.head.rotation.x=pose===4?.22:pose===3?-.1:0;
 for(const [i,a]of f.arms.entries()){a.shoulder.rotation.x=pose===3?-2.35:pose===1?-2.45:pose===4?-2.4:-.12;a.shoulder.rotation.z=(i?1:-1)*(pose===4?.32:pose===0||pose===6?.12:.25);a.elbow.rotation.x=pose===4?-1.65:pose===0||pose===6?-.4:-.28;}
 if(f.scarf){f.scarf.visible=pose===3;f.scarf.position.y=1.73;}
 holder.updateMatrixWorld(true);const grouped=new Map();f.root.traverse(o=>{if(!o.isMesh||!o.visible||o.parent?.visible===false)return;const part=o.userData.fan?.part||'fixed-'+o.material.color.getHexString(),g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);if(!grouped.has(part))grouped.set(part,[]);grouped.get(part).push(g);});
 for(const [part,parts]of grouped){const positions=[],normals=[];for(const g of parts){positions.push(...g.attributes.position.array);normals.push(...g.attributes.normal.array);g.dispose();}const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(normals,3));result.push({pose,variant,part,geometry,owned:true});}holder.clear();
 }return result;
}
function reaction(contest,time,team){const goals=contest.events.filter(e=>e.type==='goal'&&e.at<=time),last=goals.at(-1);if(last&&time-last.at<3.1){const age=time-last.at;if(last.team===team&&(!last.ownGoal||last.team!==last.against))return{kind:'cheer',age};if(last.against===team)return{kind:'conceded',age};}
 if(time>=contest.finaleAt&&!contest.timedOut&&!contest.draw&&contest.ranks.some(r=>r.team===team&&r.rank===1))return{kind:'cheer',age:time-contest.finaleAt};return{kind:'calm',age:0};}
function create(world,contest,sides){const root=new T.Group();root.name='arena-local-terraces';world.scene.add(root);const fans=slots(contest.layout),owned=[],counts=sides.map(()=>0),batches=[],dummy=new T.Object3D(),color=new T.Color();for(const fan of fans)counts[fan.team]++;
 const mat=new T.MeshLambertMaterial({color:0xffffff});owned.push(mat);
 for(const source of detailedTemplates(world)){const{pose,part,variant}=source;if(source.owned)owned.push(source.geometry);const batch=new T.InstancedMesh(source.geometry,mat,fans.length);batch.frustumCulled=false;batch.name='local-fans-'+pose+'-'+part;root.add(batch);batches.push({batch,pose,part,variant,count:0});}
 const standMat=new T.MeshStandardMaterial({color:0x3b494a,roughness:.9}),seatMat=new T.MeshStandardMaterial({color:0x24383d,roughness:1});owned.push(standMat,seatMat);
 const seatsMat=new T.MeshStandardMaterial({color:0xa72835,roughness:.76}),railMat=new T.MeshStandardMaterial({color:0x99a8aa,roughness:.48});owned.push(seatsMat,railMat);
 const addBox=(w,h,d,mat,x,y,z,angle=0)=>{const g=new T.BoxGeometry(w,h,d);owned.push(g);const m=new T.Mesh(g,mat);m.position.set(x,y,z);m.rotation.y=angle;m.receiveShadow=true;root.add(m);return m;};
 for(let row=0;row<5;row++)for(const e of offsetEdges(contest.layout,4.1+row*1.05)){const dx=e.b.x-e.a.x,dz=e.b.z-e.a.z;addBox(Math.hypot(dx,dz)+.16,.45,1.05,row%2?seatMat:standMat,(e.a.x+e.b.x)/2,.43+row*.55,(e.a.z+e.b.z)/2,-Math.atan2(dz,dx));}
 for(const e of offsetEdges(contest.layout,9.1)){const dx=e.b.x-e.a.x,dz=e.b.z-e.a.z,length=Math.hypot(dx,dz),angle=-Math.atan2(dz,dx),x=(e.a.x+e.b.x)/2,z=(e.a.z+e.b.z)/2;addBox(length+.16,3.8,.22,standMat,x,1.9,z,angle);addBox(length+.16,.12,.22,railMat,x,3.86,z,angle);}
 // The same individual moulded seat silhouette as the normal stadium, scaled in count.
 const seatGeometry=new T.BoxGeometry(.43,.10,.40),backGeometry=new T.BoxGeometry(.43,.43,.08);owned.push(seatGeometry,backGeometry);
 for(const [geometry,back]of[[seatGeometry,false],[backGeometry,true]]){const batch=new T.InstancedMesh(geometry,seatsMat,fans.length);fans.forEach((f,i)=>{dummy.position.set(f.x+(back?Math.sin(f.heading)*-.18:0),f.y+(back?.42:.12),f.z+(back?Math.cos(f.heading)*-.18:0));dummy.rotation.set(0,f.heading,0);dummy.scale.setScalar(1);dummy.updateMatrix();batch.setMatrixAt(i,dummy.matrix);});root.add(batch);}
 let reactions=[];
 function update(frame){reactions=sides.map((_,i)=>reaction(contest,frame.time,i));for(const entry of batches)entry.count=0;
 for(const fan of fans){const r=reactions[fan.team],delay=(fan.id%7)*.025,age=r.age-delay,excited=r.kind==='cheer'&&age>=0,conceded=r.kind==='conceded'&&age>=0,pose=excited?(fan.id%3?3:1):conceded?4:fan.id%8?6:0,team=sides[fan.team].team,skin=[0xb98363,0x8c5c43,0xe1b08d,0x674734,0xd5a17c][fan.id%5];dummy.position.set(fan.x,fan.y+(excited?Math.max(0,Math.sin(age*7+fan.phase))*.13:0),fan.z);dummy.rotation.set(0,fan.heading,excited?Math.sin(age*6+fan.phase)*.04:0);dummy.scale.setScalar(.98);dummy.updateMatrix();
 for(const entry of batches){if(entry.pose!==pose||(entry.variant!==undefined&&entry.variant!==fan.id%3))continue;const index=entry.count++;entry.batch.setMatrixAt(index,dummy.matrix);const hex=entry.part.startsWith('fixed-')?parseInt(entry.part.slice(6),16):entry.part==='skin'?skin:entry.part==='dark'?0x18272e:entry.part==='stripe'?(team.kit.stripe??team.secondary):(fan.id%11===0?0x24323b:team.kit.shirt??team.primary);color.setHex(hex);entry.batch.setColorAt(index,color);}}
 for(const e of batches){e.batch.count=e.count;e.batch.visible=e.count>0;if(e.count){e.batch.instanceMatrix.needsUpdate=true;e.batch.instanceColor.needsUpdate=true;}}}
 return{root,fans,counts,get reactions(){return reactions;},update,dispose(){root.removeFromParent();for(const e of batches)e.batch.dispose();for(const r of new Set(owned))r.dispose();}};
}
return{slots,offsetEdges,reaction,create};});
