'use strict';
// Hypothetical formations using compatible existing roster positions. These are
// simulation examples, not verified real club formations or predicted results.
const fs=require('fs'),assert=require('node:assert/strict'),crypto=require('crypto'),M=require('../assets/match'),L=require('../future/lineup-core'),rows=Object.values(require('../assets/club-rosters-v75.json').teams);
const out=process.argv[2]||'docs/ai/research/v175-free-examples.json',report={method:'Eight compact 30-second physical 11v11 samples; actual catalogue identities, hypothetical compatible formations; no target score. Not full 90-minute matches.',matches:[]};
for(const formation of ['4-3-3','4-2-3-1','4-4-2','3-5-2']){
 const compatible=rows.filter(r=>{try{L.buildLineup({...r.team,formation});return true;}catch{return false;}}).slice(0,2);assert.equal(compatible.length,2);
 for(const seed of [3,4]){const teams=compatible.map(r=>({name:r.name,espnId:r.team.teamId})),lineups={teams:compatible.map(r=>({...r.team,formation}))},fixture={id:'free-example-'+formation,concept:true,home:teams[0],away:teams[1]},options={simulationMode:'free',freeSeconds:30,fixture,teams,lineups},m=M.create(seed,options),last=m.sample(m.duration);
 assert.equal(last.players.length,22);assert(m.lineups.every(l=>l.formation===formation));assert.equal(m.analysisTargetUsed,false);const events=m.events.filter(e=>['pass','shot','goal','turnover','save'].includes(e.type));report.matches.push({seed,formation,teams:teams.map(t=>t.name),seconds:m.freeRun.duration,score:last.score,stats:last.stats,events,signature:crypto.createHash('sha256').update(JSON.stringify(m.freeRun.actions)).digest('hex').slice(0,16)});console.log(formation+' seed '+seed+' '+last.score.join('-'));}
}
fs.writeFileSync(out,JSON.stringify(report,null,2));console.log('Saved '+report.matches.length+' examples to '+out);
