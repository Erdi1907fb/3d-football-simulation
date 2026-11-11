const assert=require('node:assert/strict'),E=require('../assets/japon-engine.js');
const sides=n=>Array.from({length:n},(_,i)=>({name:'Side '+i,player:{id:'p'+i,name:'Player '+i},keeper:{id:'k'+i,name:'Keeper '+i,roles:['GK']},defender:{id:'d'+i,name:'Outfield 1 '+i},...(n===2?{defender2:{id:'d2'+i,name:'Second defender '+i,roles:['CB']},midfielder:{id:'m'+i,name:'Outfield 3 '+i}}:{})}));
let games=0;
for(let n=2;n<=6;n++)for(const mode of ['elimination','points'])for(let seed=1;seed<=5;seed++){
 const c=E.create({sides:sides(n),seed,mode,seconds:30}),score=c.stats.map(()=>({gf:0,ga:0,points:0,roundGA:0})),active=Array(n).fill(true);let outs=0;
 for(const e of c.liveEvents){if(e.type==='goal'){assert(active[e.against]);assert(active[e.team]);score[e.against].ga++;score[e.against].roundGA++;score[e.against].points--;if(e.team!==e.against){score[e.team].gf++;score[e.team].points++;}const v=c.toVideoTime(e.at);assert(v!==null,'every goal retained');const f=c.sample(v+1e-5);assert.equal(f.stats[e.against].ga,score[e.against].ga,'score changes at physical goal time');const ball=f.ball,g=c.goals[e.against];assert(ball.x*g.nx+ball.z*g.nz>g.radius-.2,'goal at own oriented line');}
 if(e.type==='elimination'){assert.equal(c.mode,'elimination');assert.equal(score[e.team].roundGA,c.goalLimit);active[e.team]=false;outs++;for(let i=0;i<n;i++)if(active[i])score[i].roundGA=0;}}
 c.stats.forEach((s,i)=>{assert.equal(s.gf,score[i].gf);assert.equal(s.ga,score[i].ga);assert.equal(s.points,score[i].points);assert.equal(s.roundGA,score[i].roundGA);});
 if(c.mode!=='elimination'){assert.equal(outs,0);assert.equal(c.liveDuration,30+c.addedTime);}else if(!c.timedOut){assert.equal(outs,n-1);assert(active[c.winner]);assert.equal(c.ranking[0],c.winner);}
 assert.equal(new Set(c.ranking).size,n);for(const f of c.frames.filter((_,i)=>i%31===0))for(const p of [f.ball,...f.players])for(const k of ['x','z'])assert(Number.isFinite(p[k]));
 const a=c.sample(c.duration*.4);c.sample(c.duration*.9);assert.deepEqual(c.sample(c.duration*.4),a,'rewind is pure');games++;
}
const a=E.create({sides:sides(4),seed:77}),b=E.create({sides:sides(4),seed:77});assert.deepEqual(a.events,b.events);assert.deepEqual(a.stats,b.stats);
const gs=[{team:1,x:10,z:0},{team:2,x:0,z:10}],players=[{active:true,team:2,x:5,z:0,keeper:false}],from={x:0,z:0};assert.equal(E.targetGoal(from,gs,players,[true,true,true],0,()=>.5).team,2,'choose unblocked lane');
assert.throws(()=>E.create({sides:sides(1)}));assert.throws(()=>E.create({sides:sides(7)}));
console.log(JSON.stringify({pass:true,games,coverage:'2–6 sides, two formats, exact goal score, round reset, elimination, ranking, physical goal plane, highlights, seeded rewind, open lanes'}));
