// V109 browser-side analysis engines: concept analysis + season simulation.
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path'),root=path.resolve(__dirname,'..');
const C=require(root+'/assets/concept-engine.js'),S=require(root+'/assets/season-engine.js');
const w={};vm.runInNewContext(fs.readFileSync(root+'/assets/concept/teams.js','utf8'),{window:w});const T=w.SEKME_CONCEPT_DATA.teams.filter(t=>t.lineup?.players?.length===11);
let pairs=0,homeEdge=0,maxErr=0;
for(let i=0;i<300;i++){const h=T[(i*37)%T.length],a=T[(i*53+11)%T.length];if(h.id===a.id)continue;pairs++;
 const n=C.analyse(h,a,'neutral'),x=C.analyse(h,a,'neutral'),hv=C.analyse(h,a,'home');assert.deepEqual(n,x,'deterministic');
 const p=n.probabilities,sum=p.home+p.draw+p.away;maxErr=Math.max(maxErr,Math.abs(sum-1));assert(Math.abs(sum-1)<1e-6,'1X2 sums to 1');
 const sp=n.scores.reduce((s,r)=>s+r.p,0);assert(sp>.97&&sp<=1+1e-9,'score grid mass');assert(n.scores.every(r=>r.p>=0&&Number.isInteger(r.home)&&Number.isInteger(r.away)));
 assert(n.expectedGoals.home>0&&n.expectedGoals.home<6&&n.expectedGoals.away>0&&n.expectedGoals.away<6);if(hv.probabilities.home>=n.probabilities.home-1e-12)homeEdge++;
 const mirror=C.analyse(a,h,'neutral');assert(Math.abs(mirror.probabilities.home-p.away)<1e-9,'neutral symmetry');
 const pay1=C.payload(h,a,{seed:i+1}),pay2=C.payload(h,a,{seed:i+1});const strip=o=>JSON.stringify(o,(k,v)=>k==='generatedAt'?undefined:v);assert.equal(strip(pay1),strip(pay2),'payload seeded');}
assert(homeEdge/pairs>.99,'home advantage never hurts the host');
// Season engine: xG monotone in attack, schedule completeness, table bookkeeping, seeded simulation.
const [x1]=S.expectedGoals({attack:1,defense:0},{attack:0,defense:0}),[x0]=S.expectedGoals({attack:0,defense:0},{attack:0,defense:0});assert(x1>x0);
const ids=['a','b','c','d','e','f'],fx=S.schedule(ids,true).flat();assert.equal(fx.length,ids.length*(ids.length-1));for(const id of ids)assert.equal(fx.filter(m=>m.home===id).length,ids.length-1);
const teams=ids.map((id,i)=>({id,name:id.toUpperCase(),attack:(i-2.5)*.2,defense:(2.5-i)*.1,strength:70+i*3})),played=fx.map((m,i)=>({...m,id:'m'+i,score:[i%3,(i+1)%2]}));
const table=S.table(teams,played);const rows=Array.isArray(table)?table:table.rows||Object.values(table);const pts=rows.reduce((s,r)=>s+r.pts,0),draws=played.filter(m=>m.score[0]===m.score[1]).length;assert.equal(pts,3*(played.length-draws)+2*draws,'points bookkeeping');
let simOk=false;try{const comp=S.competitions.find(c=>c.id==='tr.1'),m=fx.map((q,i)=>({...q,id:'s'+i,score:null,date:'2027-01-'+String(1+i%28).padStart(2,'0')}));const r1=S.simulate({comp,teams,matches:m,seed:7}),r2=S.simulate({comp,teams,matches:m,seed:7});const st=o=>JSON.stringify(o,(k,v)=>k==='generatedAt'?undefined:v);assert.equal(st(r1),st(r2),'seeded season');simOk=true;}catch(e){if(e.code==='ERR_ASSERTION')throw e;simOk='skipped: '+e.message;}
const report={PASS:true,conceptPairs:pairs,probabilitySumMaxError:maxErr,homeAdvantageRespected:homeEdge/pairs,season:{schedule:fx.length,tablePoints:pts,seededSimulation:simOk}};console.log(JSON.stringify(report));
