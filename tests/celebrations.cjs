// V109 celebration pack: 100 unique celebrations, finite poses at every stage, planner mix.
const assert=require('node:assert/strict'),path=require('path'),root=path.resolve(__dirname,'..');
const P=require(root+'/assets/celebration-pack.js'),C=require(root+'/assets/celebration.js');
const v=()=>({x:0,y:0,z:0}),joint=()=>({rotation:v(),position:v()}),actor=i=>({index:i,arms:[{shoulder:joint(),elbow:joint()},{shoulder:joint(),elbow:joint()}],legs:[{hip:joint(),knee:joint(),boot:joint()},{hip:joint(),knee:joint(),boot:joint()}],body:joint(),waist:{rotation:v(),position:{x:0,y:.923,z:0}},head:joint()});
const finite=o=>Object.values(o).every(x=>typeof x==='number'?Number.isFinite(x):x&&typeof x==='object'?finite(x):true);
assert.equal(P.list.length,100);assert.equal(new Set(P.list.map(c=>c.id)).size,100);assert.equal(new Set(P.list.map(c=>c.tr)).size,100,'unique Turkish names');
let poses=0,moved=0;
for(const c of P.list)for(const stage of['run','solo','group'])for(const slideEnd of[0,3])for(let t=0;t<6;t+=.25){const a=actor(3),p={celebrate:true,goalScorer:true,celebrationStyle:c.style,celebrationStage:stage,celebrationTime:t,celebrationSlideEnd:slideEnd,celebrationSoloStart:0,celebrationVariant:t*4%6|0};P.apply(a,p,{celebration:{groupAge:t,beat:t}});assert(finite(a),c.id+' finite');assert(a.waist.position.y>.3&&a.waist.position.y<1.1,c.id+' hip height');assert(a.body.position.y<.8);poses++;if(JSON.stringify(a)!==JSON.stringify(actor(3)))moved++;}
for(const r of P.teamRoutines)for(let t=0;t<5;t+=.5){const a=actor(5);assert(P.team(a,{celebrate:true},{celebration:{groupAge:t}},r));assert(finite(a));}
const seen=new Set();let pack=0;for(let seed=1;seed<=400;seed++)for(let i=0;i<4;i++){const p=C.plan(seed,i);if(String(p.style).startsWith('pack:')){pack++;seen.add(p.style);assert(P.get(p.style));assert(P.teamRoutines.includes(p.teamRoutine));}}
assert(pack/1600>.75&&pack/1600<.95,'85% pack share');assert(seen.size>=95,'pack coverage');
console.log(JSON.stringify({PASS:true,celebrations:P.list.length,moves:P.moves.length,arrivals:P.arrivals.length,teamRoutines:P.teamRoutines.length,posesChecked:poses,posesWithMotion:moved,planPackShare:+(pack/1600).toFixed(3),distinctPicked:seen.size}));
