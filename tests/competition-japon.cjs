'use strict';
// V190: Japon Kale league/cup inside the Competition Studio. V192: league fast flow.
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
 // V192/V193 fast flow (every field): video opens on the first match; one short table scene between matches.
 for(const field of['five','japon']){const fast=await E.prepare({format:'league',field,seed:21,seconds:60,fastFlow:true,teams:teams(['436','432','1895','997'])});A.equal(fast.chapters[0].kind,'match','fast flow starts on the first match ('+field+')');A(fast.liveTable);A(!fast.chapters.some(ch=>['cover','opening','match-intro'].includes(ch.kind)));
  // V193: a short result card after every match; the detailed table only after the last match of a matchweek.
  A(!fast.chapters.some(ch=>ch.kind==='standings-update'));const ms=fast.chapters.filter(ch=>ch.kind==='match');for(const ch of ms){const k=fast.chapters.indexOf(ch),m=fast.matches.find(x=>x.id===ch.matchId);A.equal(fast.chapters[k+1].kind,'match-result');A(fast.chapters[k+1].duration<=3);const last=fast.matches.filter(x=>x.round===m.round).at(-1)===m;A.equal(fast.chapters[k+2]?.kind==='round-summary',last,'table only at the end of round '+m.round);}}
 const cupFast=await E.prepare({format:'cup',field:'five',seed:3,seconds:60,fastFlow:true,teams:teams(['436','432','1895','997','435','437','83','86'])});A.equal(cupFast.chapters[0].kind,'match','cup fast flow also opens on the first match');A(!cupFast.liveTable);A.equal(cupFast.chapters.filter(ch=>ch.kind==='round-summary').length,3,'bracket after each cup round');
 // V193 match of the week: single 5v5 clash (60/75/90 s) and a penalty shootout with chosen keeper + takers in order.
 const one=await E.prepare({format:'single',content:'five',field:'five',seed:5,seconds:75,teams:teams(['436','432'])});A.deepEqual(one.chapters.map(ch=>ch.kind),['match','match-result']);A.equal(one.seconds,75);A.deepEqual(E.buildMatch(one.matches[0],one).stats.map(x=>x.gf),one.matches[0].score);
 const pk=teams(['436','432']);pk[0].penalty=[pk[0].roster.players[0].id,...pk[0].roster.players.slice(6,11).map(p=>p.id)];pk[1].penalty=[pk[1].roster.players[0].id,...pk[1].roster.players.slice(1,6).map(p=>p.id)];
 const pens=await E.prepare({format:'single',content:'penalties',field:'five',seed:5,teams:pk});A.deepEqual(pens.chapters.map(ch=>ch.kind),['shootout','match-result']);const kicks=pens.matches[0].shootoutKicks;
 for(const team of[0,1]){const names=kicks.filter(k=>k.team===team).slice(0,5).map(k=>k.actor),want=pk[team].penalty.slice(1).map(id=>pk[team].roster.players.find(p=>String(p.id)===String(id)).name);A.deepEqual(names,want.slice(0,names.length),'kick order follows the selection');}
 A(pens.matches[0].penalties[0]!==pens.matches[0].penalties[1]&&pens.champion);
 // V196 four-team cups: 5v5/11v11 semis + final; Japon one 4-goal elimination final.
 const cup4=await E.prepare({format:'cup',field:'five',seed:4,seconds:60,teams:teams(['436','432','1895','997'])});A.deepEqual(cup4.matches.map(m=>m.id),['S1','S2','F1']);A.deepEqual([cup4.matches[2].home,cup4.matches[2].away],[cup4.matches[0].winner,cup4.matches[1].winner]);A.equal(cup4.champion,cup4.matches[2].winner);A(cup4.matches.every(m=>m.winner));
 const jk4=await E.prepare({format:'cup',field:'japon',seed:4,seconds:60,teams:teams(['436','432','1895','997'])});A.deepEqual(jk4.matches.map(m=>m.id),['F1']);A.equal(new Set(jk4.matches[0].ranks).size,4);A.equal(jk4.champion,jk4.matches[0].order[0]);
 await A.rejects(E.prepare({format:'cup',field:'five',seed:1,seconds:60,teams:teams(['436','432','1895','997','435','437'])}),/4 or 8/);
 // V204 penalty tournament: league = five kicks each, a level score is a draw on the table; cup = official shootout to a winner.
 let drawSeen=false;for(const seed of[2,4,5]){const pl=await E.prepare({format:'league',field:'five',content:'penalties',seed,teams:teams(['436','432','1895','997'])});A(pl.penaltyTournament);A(pl.liveTable,'penalty league shows the live table');A(pl.matches.every(m=>m.shootoutKicks.length===10&&m.score[0]===m.penalties[0]&&m.score[1]===m.penalties[1]),'league shootouts stop after five each');
  for(const m of pl.matches){const goals=[0,1].map(t=>m.shootoutKicks.filter(k=>k.team===t&&k.outcome==='goal').length);A.deepEqual(goals,m.score);if(m.score[0]===m.score[1]){drawSeen=true;A.equal(m.winner,null);}else A.equal(m.winner,m.score[0]>m.score[1]?m.home:m.away);A.deepEqual(E.buildShootout(m,pl).score,m.score,'replay matches');}
  const pts=new Map(pl.teams.map(t=>[t.id,0]));for(const m of pl.matches){const[x,y]=m.score;pts.set(m.home,pts.get(m.home)+(x>y?3:x===y?1:0));pts.set(m.away,pts.get(m.away)+(y>x?3:x===y?1:0));}for(const r of pl.table)A.equal(r.pts,pts.get(r.id));
  A(!pl.chapters.some(ch=>['match','ceremony','champion-celebration'].includes(ch.kind)));A(pl.chapters.some(ch=>ch.kind==='standings-update'));A.equal(pl.champion,pl.table[0].id);}
 A(drawSeen,'a level penalty league game is recorded as a draw');
 for(const n of[4,8]){const pc=await E.prepare({format:'cup',field:'five',content:'penalties',seed:7,teams:teams(['436','432','1895','997','435','437','83','86'].slice(0,n))});A.deepEqual(pc.matches.map(m=>m.stage),n===8?['quarter','quarter','quarter','quarter','semi','semi','final']:['semi','semi','final']);A(pc.matches.every(m=>m.winner&&m.score[0]!==m.score[1]));A.equal(pc.champion,pc.matches.at(-1).winner);A(/PENALTY CUP/.test(pc.name));}
 console.log(JSON.stringify({pass:true,league:{weeks:league.matches.length,goals:league.matches.map(m=>m.goals),champion:league.champion},cup:{champion:cup.champion,durations:cup.matches.map(m=>+m.regulationDuration.toFixed(1))}}));
})().catch(e=>{console.error(e);process.exit(1);});
