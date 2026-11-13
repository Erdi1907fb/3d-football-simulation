'use strict';
const assert=require('node:assert/strict'),I=require('../assets/football-intelligence'),P=require('../assets/penalty-engine'),F=require('../assets/freekick-engine'),fs=require('fs');
const from={x:0,z:0},to={x:12,z:0},away={id:1,x:2,z:0,vx:5,vz:0},coming={id:2,x:4,z:0,vx:-5,vz:0};
assert(I.arrival(coming,from)<I.arrival(away,from),'momentum beats nearest-distance chase');
assert.equal(I.pressers([away,coming],from).primary,2);
const crossing={id:3,x:6,z:3,vx:0,vz:-6},leaving={...crossing,vz:6};
assert(I.passWindow(from,to,[crossing]).risk>I.passWindow(from,to,[leaving]).risk+.2,'moving interception threat');
assert.equal(I.passWindow(from,to,[]).safety,1);assert(I.passWindow(from,to,[{id:4,x:6,z:0}]).risk>.8);
assert.equal(I.passWindow(from,to,[{...crossing,active:false}]).safety,1);
const p={id:5,team:0,x:10,z:0},block={id:6,team:1,x:5,z:0};
const offered=I.support(p,from,{x:10,z:0},[block],[],{radius:3});assert(Math.abs(offered.z)>1,'opens the marking shadow');assert(Math.hypot(offered.x-10,offered.z)<=3.001);
const defenders=[{id:10,x:40,z:-5},{id:11,x:39,z:6},{id:12,x:30,z:2}],attackers=[{id:20,x:39,z:-4},{id:21,x:40,z:5},{id:22,x:28,z:0}],marked=I.mark(defenders,attackers,{x:25,z:0});
assert.equal(new Set(Object.values(marked).map(m=>m.mark)).size,3,'unique runners');
for(const duty of Object.values(marked)){const actor=attackers.find(p=>p.id===duty.mark);assert(duty.target.x>actor.x,'goal-side cover');}
const forbidden={x:40,y:1,z:0,vx:24,vy:1,vz:4};Object.defineProperty(forbidden,'outcome',{get(){throw Error('future outcome read');}});
const model={x:52.48,z:0,reaction:.2,diveSpeed:5.6,acceleration:16};
let state={z:0,vz:0},last=state;for(let n=0;n<180;n++){const time=n/240;state=I.keeperStep(state,forbidden,time,1/240,model);assert(Number.isFinite(state.z));assert(Math.abs(state.vz)<=5.6+1e-8);assert(Math.abs(state.vz-last.vz)<=16/240+1e-8);if(time<.2)assert.equal(state.z,0);last=state;}
assert(state.z>0,'reads the observed outgoing ball');
assert.equal(I.sampleKeeper([{t:0,z:0,vz:5},{t:1,z:1,vz:5}],2).vz,0,'stopped keeper does not run in place after contact');
const history=[{target:{z:3}}];Object.defineProperty(history[0],'outcome',{get(){throw Error('result oracle');}});assert(I.penaltyPlan(history,()=>.4).side===1);
const Tac=require('../assets/japon-tactics'),carrier={id:0,team:0,x:0,z:0,active:true},receiver={id:1,team:0,x:10,z:0,active:true},defender={id:2,team:1,x:5,z:5,active:true};
assert(Tac.canRelease(carrier,{kind:'pass',receiverIndex:1},[carrier,receiver,defender]));defender.z=0;assert(!Tac.canRelease(carrier,{kind:'pass',receiverIndex:1},[carrier,receiver,defender]),'re-check the lane after the turning/preparation delay');
const registry=Object.values(require('../assets/club-rosters-v75.json').teams),lineups=registry.slice(1,3).map(r=>r.team);let saves=0,changed=0;
for(let seed=1;seed<=18;seed++){
 const c=P.create({seed,mode:seed%2?'team':'duel',lineups}),again=P.create({seed,mode:seed%2?'team':'duel',lineups});
 assert.deepEqual(c.kicks.map(k=>[k.outcome,k.target,k.keeperFrames]),again.kicks.map(k=>[k.outcome,k.target,k.keeperFrames]));
 for(const k of c.kicks){if(k.glove){assert(k.keeperContact.partial&&k.keeperContact.ellipse>.88&&k.keeperContact.incomingSpeed>18);const touched=c.sample(k.start+k.contact+k.keeperContactOffset).ball;assert(Math.hypot(touched.x-k.glove.x,touched.y-k.glove.y,touched.z-k.glove.z)<.02,'deflection starts at the true glove contact');}assert(k.physical&&k.intelligenceVersion===I.version);if(k.requestedOutcome!==k.outcome)changed++;
  for(let n=1;n<k.keeperFrames.length;n++){const a=k.keeperFrames[n-1],b=k.keeperFrames[n],dt=b.t-a.t;assert(Math.abs(b.z-a.z)<=k.keeperModel.diveSpeed*dt+1e-8);}
  if(k.outcome==='save'){saves++;assert(k.keeperContact.ellipse<=1);const f=c.sample(k.resolvedAt-1e-7);assert(Math.hypot(f.ball.x-k.target.x,f.ball.y-k.target.y,f.ball.z-k.target.z)<.015);assert.deepEqual(f.goalkeeper.keeperContactPoint,k.target);assert.equal(f.goalkeeper.keeperSaveAt,k.contact+k.flight);}
 }
 const time=c.kicks[0].resolvedAt;assert.deepEqual(c.sample(time),c.sample(time));
}
assert(saves>0);assert(changed>0,'physical keeper contact can override the statistical proposal');
let fkContacts=0;for(let seed=1;seed<=8;seed++){const c=F.create({seed,mode:'team',lineups});for(const k of c.kicks){assert.equal(k.intelligenceVersion,I.version);assert(k.keeperFrames.length>2);if(k.outcome==='save'){fkContacts++;const sample=c.sample(k.start+2.6+k.contact.time);assert(Math.abs(sample.goalkeeper.z-k.crossing.keeperZ)<.08,'visible and physical keeper use same track');}}}
assert(fkContacts>0);
for(const file of['index.html','penalty.html','freekick.html','japon-kale.html','football-lab.html']){const html=fs.readFileSync(file,'utf8');assert(html.indexOf('football-intelligence.js')>=0);const first=['collective-play.js','open-football-adapter.js','football-ai.js','penalty-engine.js','freekick-engine.js','japon-tactics.js'].map(x=>html.indexOf(x)).filter(x=>x>=0);assert(first.every(i=>html.indexOf('football-intelligence.js')<i),'dependency order '+file);}
console.log(JSON.stringify({PASS:true,arrivalAndMovingLanes:true,uniqueCover:true,observationOnly:true,deterministicRewind:true,physicalPenaltySaves:saves,physicalOverrides:changed,freeKickContacts:fkContacts}));
