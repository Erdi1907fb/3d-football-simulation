/* Next90 Competition Studio. One immutable competition, two export orientations.
 * Uses the existing analysis, match, arena and physical penalty engines. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('./catalog'),require('./concept-engine'),require('./season-engine'),require('../future/lineup-core'),require('./match'),require('./japon-engine'),require('./penalty-engine'));else r.Next90Competition=f(r.SekmeCatalog,r.SekmeConceptEngine,r.SekmeSeason,r.SekmeFutureLineups,r.SekmeMatch,r.Next90Japon,r.Next90Penalties);})(typeof globalThis!=='undefined'?globalThis:this,function(C,Concept,Season,Lineups,Match,Arena,Penalties){'use strict';
 const copy=x=>JSON.parse(JSON.stringify(x)),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const RULES={id:'fifa-2022-group',source:'https://www.fifa.com/en/articles/world-cup-qatar-2022-group-c-guide-teams-fixtures-regulations',order:['points','goal-difference','goals-for','head-to-head-points','head-to-head-goal-difference','head-to-head-goals-for','team-conduct','seeded-draw']};
 function shuffle(values,seed){const a=values.slice(),rng=Concept.rng(seed);for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 function entry(registry,id,selection={},archive=[]){
  const source=registry.teams[String(id)];if(!source?.team)throw Error('Unknown squad: '+id);
  const identity=C.team(source.catalogId||source.name),raw=source.team,pool=[...raw.players,...raw.bench||[]],byId=new Map(pool.map(p=>[String(p.id),p]));
  const formation=selection.formation||raw.formation,slots=Lineups.formations[formation];if(!slots)throw Error('Unsupported formation: '+formation);
  const ids=selection.eleven||raw.players.map(p=>String(p.id));if(ids.length!==11||new Set(ids.map(String)).size!==11)throw Error('Choose eleven different players');
  const players=ids.map((id,i)=>{const p=byId.get(String(id));if(!p)throw Error('Player outside selected squad');const roles=p.naturalRoles||p.roles||[p.position];if((i===0)!==roles.includes('GK'))throw Error('Choose one natural goalkeeper and ten outfield players');return{...copy(p),naturalRoles:roles.slice(),roles:[slots[i].role],simulationPosition:slots[i].role};});
  const lineup=Lineups.buildLineup({...copy(raw),formation,players,bench:pool.filter(p=>!ids.map(String).includes(String(p.id))),source:{...raw.source,status:'manual-simulation-selection',asOf:source.asOf}});
  const fiveIds=selection.five||[players[0].id,players[2].id,players[3].id,players[5].id,players[9].id];
  if(fiveIds.length!==5||new Set(fiveIds.map(String)).size!==5)throw Error('Choose five different players');
  const five=fiveIds.map((id,i)=>{const p=byId.get(String(id));if(!p)throw Error('Player outside selected squad');const roles=p.naturalRoles||p.roles||[p.position];if((i===0)!==roles.includes('GK'))throw Error('The five needs one natural goalkeeper');return copy(p);});
  const reference=archive.find(t=>String(t.registryId)===String(id)&&t.kind==='current');
  return{id:String(id),name:source.name,identity:{...identity,name:source.name},roster:lineup,five,definition:{...(reference||{}),id:'studio-'+id,registryId:String(id),kind:'current',name:source.name,label:source.name,labelEn:source.name,era:String(source.asOf||'2026').slice(0,4),logo:identity.logo,short:identity.short,primary:identity.primary,secondary:identity.secondary,kit:copy(identity.kit),kits:copy(identity.kits||{}),baseline:reference?.baseline||identity.strength||84,lineup,source:reference?.source||{name:'Existing squad and catalog priors',asOf:source.asOf}},source:{asOf:source.asOf,roster:raw.source,analysis:reference?'existing-concept-performance':'catalog-strength-prior'}};
 }
 function conduct(events){const rows=new Map();for(const e of events||[]){if(!['yellow','red'].includes(e.type))continue;const key=e.team+':'+(e.playerId??e.actorIndex??e.actor??'unknown');const p=rows.get(key)||{team:e.team,yellow:0,red:false,indirect:false};if(e.type==='yellow')p.yellow++;else{p.red=true;p.indirect=!!e.secondYellow;}rows.set(key,p);}const out=[0,0];for(const p of rows.values())if(p.team===0||p.team===1)out[p.team]+=p.red?(p.indirect?3:p.yellow?5:4):p.yellow?1:0;return out;}
 function standings(teams,played,{seed=1,final=false}={}){
  const rows=teams.map(t=>({id:t.id,name:t.name,p:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,pts:0,conduct:0})),map=new Map(rows.map(r=>[r.id,r]));
  for(const m of played){if(!Array.isArray(m.score)||m.score.length!==2||!m.score.every(n=>Number.isInteger(n)&&n>=0))throw Error('Invalid match result');const a=map.get(m.home),b=map.get(m.away);if(!a||!b)throw Error('Result refers to an unknown team');const[x,y]=m.score;a.p++;b.p++;a.gf+=x;a.ga+=y;b.gf+=y;b.ga+=x;a.conduct+=m.conduct?.[0]||0;b.conduct+=m.conduct?.[1]||0;if(x===y){a.d++;b.d++;a.pts++;b.pts++;}else{const win=x>y?a:b,lose=x>y?b:a;win.w++;win.pts+=3;lose.l++;}}
  for(const r of rows)r.gd=r.gf-r.ga;
  rows.sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf);
  const lots=shuffle(teams.map(t=>t.id),Concept.hash(seed+'|ranking-lots')),lot=new Map(lots.map((id,i)=>[id,i]));
  for(let start=0;start<rows.length;){let end=start+1;const first=rows[start];while(end<rows.length&&['pts','gd','gf'].every(k=>rows[end][k]===first[k]))end++;const group=rows.slice(start,end),ids=new Set(group.map(r=>r.id)),mini=new Map(group.map(r=>[r.id,{pts:0,gd:0,gf:0}]));
   for(const m of played)if(ids.has(m.home)&&ids.has(m.away)){const a=mini.get(m.home),b=mini.get(m.away),[x,y]=m.score;a.gf+=x;b.gf+=y;a.gd+=x-y;b.gd+=y-x;a.pts+=x>y?3:x===y?1:0;b.pts+=y>x?3:x===y?1:0;}
   group.sort((a,b)=>{const x=mini.get(a.id),y=mini.get(b.id);return y.pts-x.pts||y.gd-x.gd||y.gf-x.gf||a.conduct-b.conduct||(final?lot.get(a.id)-lot.get(b.id):teams.findIndex(t=>t.id===a.id)-teams.findIndex(t=>t.id===b.id));});
   for(const r of group){r.headToHead={...mini.get(r.id)};r.drawnLots=final&&group.some(q=>q.id!==r.id&&['pts','gd','gf'].every(k=>mini.get(q.id)[k]===mini.get(r.id)[k])&&q.conduct===r.conduct);r.provisional=!final;}
   rows.splice(start,end-start,...group);start=end;
  }
  return rows.map((r,i)=>({...r,rank:i+1}));
 }
 function plan(format,teams,seed,draw=true){
  const count=format==='cup'?8:format==='league'?4:0;if(teams.length!==count)throw Error('Select '+count+' different teams');if(new Set(teams.map(t=>t.id)).size!==count)throw Error('A team cannot enter twice');
  const ids=draw?shuffle(teams.map(t=>t.id),Concept.hash(seed+'|fixtures')):teams.map(t=>t.id);
  if(format==='league')return Season.schedule(ids,false).flat().map((m,i)=>({...m,id:'L'+(i+1),stage:'league',index:i}));
  return[...Array.from({length:4},(_,i)=>({id:'Q'+(i+1),stage:'quarter',round:1,index:i,home:ids[i*2],away:ids[i*2+1]})),{id:'S1',stage:'semi',round:2,index:4,homeFrom:'Q1',awayFrom:'Q2'},{id:'S2',stage:'semi',round:2,index:5,homeFrom:'Q3',awayFrom:'Q4'},{id:'F1',stage:'final',round:3,index:6,homeFrom:'S1',awayFrom:'S2'}];
 }
 function matchSeed(seed,id){return Concept.hash(seed+'|match|'+id);}
 function analysePair(home,away,seed){const p=Concept.payload(home.definition,away.definition,{seed,venue:'neutral',neutralStadium:'Next90Sim Arena'},null);p.analysis.generatedAt=null;p.fixture.competition='Next90Sim CUP';return p;}
 function arenaSides(entries){const kits=C.pair(entries[0].identity,entries[1].identity);return entries.map((e,i)=>({name:e.name,label:e.name,isTeam:true,logo:e.identity.logo,team:kits[i],keeper:copy(e.five[0]),defender:copy(e.five[1]),defender2:copy(e.five[2]),midfielder:copy(e.five[3]),player:copy(e.five[4])}));}
 function buildMatch(record,competition){const pair=[record.home,record.away].map(id=>competition.teams.find(t=>t.id===id));if(record.field==='five')return Arena.create({sides:arenaSides(pair),seed:record.seed,mode:'points',seconds:competition.seconds,goalWidth:5});const p=record.analysisPayload||analysePair(pair[0],pair[1],record.seed);return Match.create(record.seed,{...p,venue:'neutral',mode:'personal',preMatchDuration:12,animationProfile:'expanded-v2'});}
 function buildShootout(record,competition){const pair=[record.home,record.away].map(id=>competition.teams.find(t=>t.id===id)),five=record.field==='five';return Penalties.create({seed:Concept.hash(record.seed+'|shootout'),mode:'team',naturalDecisions:true,squadSize:five?5:11,lineups:pair.map(e=>five?{players:copy(e.five),bench:[]}:copy(e.roster))});}
 function matchScore(engine,field){return field==='five'?engine.stats.map(s=>s.gf):engine.sample(engine.duration).score.slice();}
 async function prepare(options,hooks={}){
  const teams=copy(options.teams),seed=options.seed>>>0,format=options.format||'cup',field=options.field||'five',seconds=clamp(Number(options.seconds)||60,30,180);if(!['five','eleven'].includes(field))throw Error('Unknown match field');
  const fixtures=plan(format,teams,seed,options.draw!==false),c={seed,format,field,seconds,teams,name:options.name||'Next90Sim '+(format==='cup'?'CUP':'LEAGUE'),fixtures,matches:[],rules:copy(RULES),tiePolicy:'single-leg-straight-physical-penalties',chapters:[],duration:0};
  const played=[];let cache=null;const add=(kind,length,data={})=>{const chapter={id:c.chapters.length,kind,start:c.duration,end:c.duration+length,duration:length,...data};c.chapters.push(chapter);c.duration=chapter.end;return chapter;};
  add('cover',2.2,{completed:0});add('opening',7,{completed:0});
  for(let i=0;i<fixtures.length;i++){
   if(hooks.signal?.aborted)throw new DOMException('Preparation cancelled','AbortError');const f=fixtures[i];if(f.homeFrom){f.home=c.matches.find(m=>m.id===f.homeFrom).winner;f.away=c.matches.find(m=>m.id===f.awayFrom).winner;}
   const record={...f,field,seed:matchSeed(seed,f.id)},pair=[f.home,f.away].map(id=>teams.find(t=>t.id===id));record.analysisPayload=field==='eleven'?analysePair(pair[0],pair[1],record.seed):null;
   const engine=await(hooks.playMatch?hooks.playMatch(record,c):buildMatch(record,c));record.score=matchScore(engine,field);record.conduct=conduct((engine.events||[]).map(e=>{if(field!=='eleven'||!['yellow','red'].includes(e.type))return e;const actor=engine.sample(e.at+.001).players[e.actorIndex??e.actor];return{...e,playerId:actor?.playerId??e.playerId};}));record.regulationDuration=field==='five'?engine.duration:engine.videoDuration;record.winner=record.score[0]===record.score[1]?null:record.score[0]>record.score[1]?record.home:record.away;
   if(field==='eleven'&&record.analysisPayload.targetScore.some((n,j)=>n!==record.score[j]))throw Error('Analysis and match score disagree: '+record.id);
   add('match-intro',3,{matchId:f.id,completed:i});const segment=add('match',record.regulationDuration,{matchId:f.id,completed:i});
   record.events=(engine.events||[]).map(e=>({...e,at:field==='eleven'?engine.toVideoTime(e.at):e.at}));
   if(format==='cup'&&!record.winner){const p=await(hooks.playShootout?hooks.playShootout(record,c):buildShootout(record,c));if(p.winner!==0&&p.winner!==1)throw Error('Shootout has no physical winner');record.penalties=p.score.slice();record.winner=p.winner===0?record.home:record.away;record.shootoutDuration=p.duration;record.shootoutKicks=p.kicks.map(k=>({team:k.team,outcome:k.outcome,resolvedAt:k.resolvedAt,actor:k.shooter.name}));add('shootout',p.duration,{matchId:f.id,completed:i});}
   c.matches.push(record);played.push(record);add('match-result',4,{matchId:f.id,completed:i+1});add('standings-update',5,{matchId:f.id,completed:i+1});
   const endRound=i===fixtures.length-1||fixtures[i+1].round!==f.round;if(endRound)add('round-summary',6,{round:f.round,completed:i+1});
   cache={id:record.id,engine};hooks.onProgress?.({done:i+1,total:fixtures.length,match:record});if(hooks.yield)await hooks.yield();
  }
  c.table=standings(teams,played,{seed,final:true});c.champion=format==='cup'?c.matches.at(-1).winner:c.table[0].id;c.runnerUp=format==='cup'?[c.matches.at(-1).home,c.matches.at(-1).away].find(id=>id!==c.champion):c.table[1].id;
  const ceremonyMatch=c.matches.find(m=>[m.home,m.away].includes(c.champion)&&[m.home,m.away].includes(c.runnerUp));c.ceremonyMatchId=ceremonyMatch.id;c.ceremonyDuration=field==='five'?19:28;
  add('ceremony',c.ceremonyDuration-6,{matchId:ceremonyMatch.id,completed:fixtures.length});add('champion-intro',3,{completed:fixtures.length});add('champion-celebration',field==='five'?15:19,{matchId:ceremonyMatch.id,completed:fixtures.length});add('final-summary',8,{completed:fixtures.length});
  Object.defineProperty(c,'cachedMatch',{enumerable:false,get:()=>cache});Object.defineProperty(c,'cache',{enumerable:false,value:(id,engine)=>{cache={id,engine};}});
  c.audioEvents=[];for(const chapter of c.chapters){const m=c.matches.find(m=>m.id===chapter.matchId);if(chapter.kind==='match')c.audioEvents.push(...m.events.map(e=>({...e,at:chapter.start+e.at,type:e.type==='drop'?'kickoff':e.type==='finish'?'fulltime':e.type==='keeper_catch'?'ball_secured':e.type,team:e.team,competitionMatchId:m.id})));if(chapter.kind==='shootout')c.audioEvents.push(...m.shootoutKicks.map(k=>({at:chapter.start+k.resolvedAt,type:k.outcome==='goal'?'goal':k.outcome==='save'?'save':k.outcome==='post'?'post':'wide',team:k.team,competitionMatchId:m.id})));if(chapter.kind==='champion-celebration')c.audioEvents.push({type:'ceremony_cheer',at:chapter.start+5,team:m.home===c.champion?0:1,ceremony:true});}
  return c;
 }
 function locate(c,t){const time=clamp(Number(t)||0,0,Math.max(0,c.duration-1e-7)),chapter=c.chapters.find(p=>time<p.end)||c.chapters.at(-1);return{chapter,time,local:time-chapter.start,match:c.matches.find(m=>m.id===chapter.matchId),completed:chapter.completed};}
 function view(c,t){const at=locate(c,t),played=c.matches.slice(0,at.completed),final=at.completed===c.matches.length;return{...at,played,table:standings(c.teams,played,{seed:c.seed,final}),champion:['ceremony','champion-intro','champion-celebration','final-summary'].includes(at.chapter.kind)?c.champion:null,fixtures:c.fixtures.map(f=>{const known=played.find(m=>m.id===f.id);return{...f,home:known?.home||(f.homeFrom?played.find(m=>m.id===f.homeFrom)?.winner:f.home)||null,away:known?.away||(f.awayFrom?played.find(m=>m.id===f.awayFrom)?.winner:f.away)||null,score:known?.score||null,penalties:known?.penalties||null,winner:known?.winner||null};})};}
 return{entry,conduct,standings,plan,prepare,buildMatch,buildShootout,arenaSides,analysePair,locate,view,shuffle,matchSeed,RULES};
});
