/* Original close-view boot trims, no claimed licensed brand/model.
 * Shared instanced geometry; stable identity colourway and camera-only detail LOD. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('./vendor/three.min'));else r.Next90BootDetail=f(r.THREE);})(typeof globalThis!=='undefined'?globalThis:this,function(T){'use strict';
const laceGeo=new T.BoxGeometry(.056,.0028,.0032),studGeo=new T.CylinderGeometry(.005,.007,.014,6),panelGeo=new T.BoxGeometry(.0018,.020,.085),cache=new Map(),m=new T.Matrix4(),q=new T.Quaternion(),scale=new T.Vector3(1,1,1),pos=new T.Vector3();
function hash(s){let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
function material(color){if(!cache.has(color))cache.set(color,new T.MeshStandardMaterial({color,roughness:.43,metalness:.08}));return cache.get(color);}
function attach(actor){if(actor.official||actor.bootDetail)return;const h=hash(actor.identity?.id??actor.identity?.name??actor.index),palette=[0xe5ddcb,0x1d252c,0xdc653b,0x59bfa3,0xb6d65e,0x7c66b0],main=palette[h%palette.length],bright=new T.Color(main).getHSL({h:0,s:0,l:0}).l>.5,accents=[0xf0e9dc,0x50d3ba,0xf4b444,0x7bb7e4,0xed769b],colour=bright?0x142330:accents[h%accents.length],groups=[];
 actor.root.userData.bootColor=main;for(const leg of actor.legs){for(const o of leg.boot.children.slice(0,2)){if(o.isMesh){o.material=material(main);o.userData.sharedBootDetail=true;}}const group=new T.Group();group.name='close-boot-detail';leg.boot.add(group);const laces=new T.InstancedMesh(laceGeo,material(colour),10);for(let i=0;i<10;i++){pos.set(0,.040+Math.sin(i*.4)*.003,-.035+Math.floor(i/2)*.019);q.setFromAxisAngle(new T.Vector3(0,1,0),(i%2?1:-1)*.24);m.compose(pos,q,scale);laces.setMatrixAt(i,m);}laces.instanceMatrix.needsUpdate=true;group.add(laces);
 const studs=new T.InstancedMesh(studGeo,material(h%2?0x252c35:0xb9c9ca),10);for(let i=0;i<10;i++){pos.set((i%2?1:-1)*.032,-.047,-.095+Math.floor(i/2)*.049);q.identity();m.compose(pos,q,scale);studs.setMatrixAt(i,m);}studs.instanceMatrix.needsUpdate=true;group.add(studs);
 for(const side of[-1,1]){const panel=new T.Mesh(panelGeo,material(colour));panel.position.set(side*.047,-.004,.005);panel.rotation.x=(h%3-1)*.13;group.add(panel);}group.traverse(o=>{if(o.isMesh){o.userData.noBatch=true;o.userData.sharedBootDetail=true;o.wosFullBodyEquipment=true;}});groups.push(group);}
 actor.bootDetail={groups,colour,variant:h%3};setLOD(actor,0);
}
function setLOD(actor,distance){if(!actor.bootDetail)return;for(const g of actor.bootDetail.groups)g.visible=distance<9;}
return{attach,setLOD,hash};});
