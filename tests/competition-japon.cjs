'use strict';
// V190: Japon Kale league/cup inside the Competition Studio.
const A=require('node:assert/strict'),E=require('../assets/competition-engine.js'),R=require('../assets/club-rosters-v75.json');
(async()=>{
 const teams=ids=>ids.map(id=>E.entry(R,id));
 await A.rejects(E.prepare({format:'league',field:'japon',seed:1,seconds:30,teams:teams(['436','432'])}),/3 to 6/,'two-team Japon league is refused');

 // League: every matchweek is one multi-goal game with all teams; placement points build the table.
 const league=await E.prepare({format:'league',field:'japon',seed:11,seconds:45,teams:teams(['436','432','1895','997'])});
 A.equal(league.matches.length,3,'four teams play three matchweeks');
 for(const m of league.matches){A.equal(m.teams.length,4);A.equal(new Set(m.teams).size,4);A.equal(m.goals.length,4);A(m.placementPoints.every(p=>Number.isInteger(p)&&p>=0&&p<=3));
  const replay=E.buildMatch(m,league);A.deepEqual(replay.stats.map(s=>s.gf),m.goals,'same seed replays the recorded goals');
  const best=Math.min(...m.ranks);A(m.ranks.filter(r=>r===best).length>1||m.placementPoints[m.ranks.indexOf(best)]===3,'outright winner gets n-1 points');}
 const totals=new Map(league.teams.map(t=>[t.id,0]));for(const m of league.matches)m.teams.forEach((id,i)=>totals.set(id,totals.get(id)+m.placementPoints[i]));
 for(const row of league.table)A.equal(row.pts,totals.get(row.id),'table points are the sum of placement points');
 A.equal(league.champion,league.table[0].id);A(!league.chapters.some(ch=>['ceremony','champion-celebration'].includes(ch.kind)),'no 11v11/5v5 medal scene for Japon');
 A(league.chapters.some(ch=>ch.kind==='champion-intro')&&league.chapters.some(ch=>ch.kind==='final-summary'));

 // Cup: two 4-goal elimination semis, the last two of each reach the 4-goal final; physical order only.
 const cup=await E.prepare({format:'cup',field:'japon',seed:9,seconds:60,teams:teams(['436','432','1895','997','435','437','83','86'])});
 A.deepEqual(cup.matches.map(m=>m.id),['S1','S2','F1']);
 for(const m of cup.matches)A.equal(new Set(m.ranks).size,4,'elimination gives a full physical order '+m.id);
 const [s1,s2,f]=cup.matches;A.deepEqual(f.teams,[s1.order[0],s1.order[1],s2.order[0],s2.order[1]]);A.equal(cup.champion,f.order[0]);
 const opening=E.view(cup,1).fixtures.find(x=>x.id==='F1');A(opening.teams.every(id=>id===null),'finalists are not revealed before the semis');
 console.log(JSON.stringify({pass:true,league:{weeks:league.matches.length,goals:league.matches.map(m=>m.goals),champion:league.champion},cup:{champion:cup.champion,durations:cup.matches.map(m=>+m.regulationDuration.toFixed(1))}}));
})().catch(e=>{console.error(e);process.exit(1);});
