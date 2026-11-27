// V255: regional body shapes + knee/elbow correctives on the shared full body (all modes use this body).
'use strict';
const A=require('node:assert/strict'),fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..'),T=require(root+'/assets/vendor/three.min');
const F=require(root+'/assets/fullbody-runtime'),S=require(root+'/assets/scene'),Catalog=require(root+'/assets/catalog'),C=require(root+'/assets/character-system');
(async()=>{await F.loadAssets(async()=>fs.readFileSync(root+'/assets/characters/fullbody-football.glb'));C.setBuilds(require(root+'/assets/player-builds.json'));
 const teams=Catalog.pair('Fenerbahçe','Liverpool');
 const make=identity=>{const a=S.createPlayer(0,3,false,teams,identity);F.attach(a);C.apply(a,identity);F.apply(a);a.root.updateMatrixWorld(true);F.sync(a,{speed:0},{time:0});return a;};
 const kane=make({id:'142200',name:'Harry Kane',dateOfBirth:'1993-07-28',position:'ST'}),yamal=make({id:'362150',name:'Lamine Yamal',dateOfBirth:'2007-07-13',position:'RW'});
 const fb=kane.fullBody,g=fb.mesh.geometry,names=F.inspect().morphNames||[];
 const morphs=g.morphAttributes.position.length,inf=fb.mesh.morphTargetInfluences;A.equal(inf.length,morphs);
 A.ok(morphs>=8+9+6,'face + 9 regions + 6 joint correctives (knees, elbows, hips)');
 // every printed/hair/beard part shares the same morph set so numbers and hair stay on the body
 for(const m of [fb.hair,fb.beard,...fb.printed])if(m)A.equal(m.morphTargetInfluences.length,morphs);
 // regions follow the build: the strong striker's shoulders/chest exceed the slim winger's
 A.ok(kane.fullBody.shape[0]>yamal.fullBody.shape[0]&&kane.fullBody.shape[1]>yamal.fullBody.shape[1],'shoulders/chest follow build');
 A.ok(kane.fullBody.shape.every(v=>v>=-1&&v<=1));
 // neck/head vertices never move with region shapes (real heads keep their fit)
 const si=g.attributes.skinIndex,sw=g.attributes.skinWeight,bn=fb.skeleton.bones.map(b=>b.name),neck=bn.indexOf('neck_01'),head=bn.indexOf('head');let moved=0;
 for(let v=0;v<si.count;v++){let w=0;for(let k=0;k<4;k++){const b=si.getComponent(v,k);if(b===neck||b===head)w+=sw.getComponent(v,k);}if(w<.9)continue;for(let t=8;t<morphs;t++){const a=g.morphAttributes.position[t];if(Math.abs(a.getX(v))+Math.abs(a.getY(v))+Math.abs(a.getZ(v))>1e-6)moved++;}}
 A.equal(moved,0,'neck/head untouched by body shapes');
 // standing straight: joint correctives off; a bent knee drives its corrective
 const off=morphs-6;A.ok([0,1,2,3,4,5].every(k=>inf[off+k]<.05),'straight joints: '+[0,1,2,3,4,5].map(k=>inf[off+k].toFixed(2)));
 console.log(JSON.stringify({pass:true,morphs,kane:kane.fullBody.shape.map(v=>+v.toFixed(2)),yamal:yamal.fullBody.shape.map(v=>+v.toFixed(2))}));
})().catch(e=>{console.error(e);process.exit(1);});
