/* Original procedural presentation props. No football result/physics changes. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('./vendor/three.min'));else r.Next90CompetitionCeremony=f(r.THREE);})(typeof globalThis!=='undefined'?globalThis:this,function(T){'use strict';
 function create(world){const root=new T.Group();root.name='competition-awards';world.scene.add(root);const ownedG=new Set(),ownedM=new Set(),medals=new Map();
  const mat=(color,metalness=.0)=>{const m=new T.MeshStandardMaterial({color,roughness:metalness?.25:.8,metalness});ownedM.add(m);return m;},gold=mat(0xd7b56b,.85),silver=mat(0xc4cbd2,.8),navy=mat(0x112631),ribbon=mat(0x164e69);
  function mesh(g,m,parent,x=0,y=0,z=0){ownedG.add(g);const o=new T.Mesh(g,m);o.position.set(x,y,z);parent.add(o);return o;}
  const podium=mesh(new T.CylinderGeometry(.16,.20,.80,24),navy,root,0,.40,.48);podium.name='trophy-pedestal';
  const cup=new T.Group();cup.name='competition-trophy';root.add(cup);
  mesh(new T.BoxGeometry(.30,.10,.25),navy,cup,0,.05);mesh(new T.CylinderGeometry(.075,.11,.20,16),gold,cup,0,.20);
  mesh(new T.LatheGeometry([new T.Vector2(.07,0),new T.Vector2(.14,.08),new T.Vector2(.21,.25),new T.Vector2(.25,.40),new T.Vector2(.23,.43)],32),gold,cup,0,.28);
  for(const sign of[-1,1]){const handle=mesh(new T.TorusGeometry(.16,.025,8,22,Math.PI*1.65),gold,cup,sign*.23,.56);handle.rotation.z=sign<0?Math.PI:.15;}
  cup.position.set(0,.20,-1);
  for(let i=0;i<world.actors.length;i++){const group=new T.Group();group.name='player-medal-'+i;root.add(group);const circle=mesh(new T.TorusGeometry(.13,.017,6,24),ribbon,group,0,.05,0);circle.rotation.x=Math.PI*.43;const disc=mesh(new T.CylinderGeometry(.045,.045,.012,20),gold,group,0,-.16,.055);disc.rotation.x=Math.PI/2;mesh(new T.BoxGeometry(.035,.19,.008),ribbon,group,0,-.055,.05);medals.set(i,{group,disc});}
  function update(state){const c=state.competitionCeremony;root.visible=!!c;if(!c)return;world.scene.updateMatrixWorld(true);for(const[i,m]of medals){const p=state.players[i],a=world.actors[i];m.group.visible=!!p&&!p.dismissed&&(p.medalAward||0)>0;if(!m.group.visible)continue;const neck=a.waist.localToWorld(new T.Vector3(0,.48,.12)),official=state.officials[0],q=p.medalAward;m.group.position.set(official.x,1.30,official.z-.2).lerp(neck,q);m.group.rotation.set(0,p.heading||0,0);m.disc.material=p.medalColor==='silver'?silver:gold;}
   const actor=world.actors[c.captain];if(c.age>=c.liftStart&&actor){const hands=actor.arms.map(a=>a.elbow.localToWorld(new T.Vector3(0,-.26,.005))),centre=hands[0].add(hands[1]).multiplyScalar(.5);cup.position.copy(centre);cup.position.y-=.32;cup.rotation.y=state.players[c.captain].heading||0;podium.visible=false;}else{const size=state.players.filter(p=>!p.dismissed).length/2,x=(c.captain%size-(size-1)/2)*.75;const point=c.cupPoint||{x,y:.82,z:.48};cup.position.set(point.x,point.y,point.z);podium.position.set(point.x,.40,point.z);podium.visible=true;}
   world.ball.visible=false;
  }
  return{root,cup,medals,update,dispose(){root.removeFromParent();ownedG.forEach(g=>g.dispose());ownedM.forEach(m=>m.dispose());}};
 }
 return{create};
});
