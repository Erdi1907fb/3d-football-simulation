/* Full-match passing sequences on the match clock; displayed physics are compressed highlights.
 * Never rescales an observed counter. Each additional pass has an individual sampled outcome.
 * A separate RNG and presentation state keep published scores and physics immutable. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PulsePassing=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 'use strict';
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const number=(x,f)=>Number.isFinite(Number(x))?Number(x):f;
 function seedOf(value){let h=2166136261;for(const c of String(value??'passing'))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
 function random(seed){let s=seedOf(seed);return()=>{s+=0x6D2B79F5;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
 function profile(team,opponent){
  const own=number(team.strength,75),opp=number(opponent.strength,75),p=team.passingProfile;
  const observed=p&&number(p.sampleMatches,0)>=3&&p.attemptsPer90>=150&&p.attemptsPer90<=950&&p.completion>=.55&&p.completion<=.98;
  return {attemptsPer90:observed?Number(p.attemptsPer90):clamp(465+(own-75)*5,300,620),completion:observed?Number(p.completion):clamp(.845+(own-75)*.0018+(own-opp)*.0007,.75,.92),source:observed?'observed-history':'football-prior',sampleMatches:observed?p.sampleMatches:0};
 }
 function create(options={}){
  const home=options.home||{},away=options.away||{},teams=[home,away],profiles=[profile(home,away),profile(away,home)],rng=random('full-clock|'+options.seed),stats=[0,1].map(()=>({passes:0,completedPasses:0,possession:0,shortPasses:0,longPasses:0,failedPasses:0}));
  const strength=teams.map(t=>number(t.strength,75)),venue=options.context?.venue||'home',baseShare=clamp(.5+(strength[0]-strength[1])*.003+(venue==='neutral'?0:venue==='away'?-.014:.014),.3,.7);
  let tick=0,activeTime=0,nextPass=2+rng()*2,team=rng()<baseShare?0:1,chain=0,pauseUntil=0,index=0,checksum=0;
  const red=[0,0],score=[0,0],ledger=[];
  function attempt(t,completed,kind,time,origin,fromId=null,toId=null){
   const s=stats[t];s.passes++;if(completed)s.completedPasses++;else s.failedPasses++;
   if(kind==='long')s.longPasses++;else s.shortPasses++;
   checksum=(Math.imul(checksum^Math.round(time*10),16777619)^t^(completed?256:0))>>>0;
   ledger.push({team:t,completed,kind,time,origin,fromId,toId});if(ledger.length>32)ledger.shift();
  }
  // Markers bind circulation to the actual highlights without exposing unplayed scores.
  function marker(e,time){
   if(e.type==='red'&&e.team!=null)red[e.team]++;
   if(e.type==='goal'&&e.team!=null){score[e.team]++;pauseUntil=Math.max(pauseUntil,time+35);team=1-e.team;chain=0;}
   if(e.type==='half')pauseUntil=Math.max(pauseUntil,time+20);
   if(e.type==='kickoff'&&e.team!=null){team=e.team;chain=0;}
   if(['corner','freeKick','penalty','goalKick','throwIn'].includes(e.type)&&e.team!=null){team=e.team;pauseUntil=Math.max(pauseUntil,time+(e.type==='penalty'?25:10));}
  }
  function advance(seconds,events=[]){
   const end=Math.max(tick,Math.floor(seconds));
   while(tick<end){tick++;
    while(index<events.length&&events[index].time<=tick){marker(events[index],events[index].time);index++;}
    if(tick<=pauseUntil)continue;
    // About 60% effective playing time. Remaining dead time is separately sampled,
    // rather than counted as possession or pass attempts.
    if(rng()>.64)continue;
    stats[team].possession++;activeTime++;
    if(activeTime<nextPass)continue;
    const late=tick>4200,risk=late&&score[team]<score[1-team],kind=rng()<(risk?.22:.14)?'long':'short';
    const accuracy=clamp(profiles[team].completion+(kind==='long'?-.13:.021)-(late?.008:0)-red[team]*.018+(red[1-team]*.008)-(risk?.018:0),.55,.97);
    const completed=rng()<accuracy;const first=1+Math.floor(rng()*10),second=1+Math.floor(rng()*9);attempt(team,completed,kind,tick,'circulation',team*11+first,team*11+(second>=first?second+1:second));chain++;
    const target=profiles[team].attemptsPer90;
    const cadence=clamp(3456/(2*target)-.45,1.8,5.8)*(1+red[team]*.07)*(risk?.91:1);
    nextPass=activeTime+Math.max(1,cadence*(.6+rng()*.8));
    if(!completed||chain>3&&rng()<.13){const share=clamp(baseShare+(red[1]-red[0])*.045,.22,.78);team=rng()<share?0:1;chain=0;}
   }
   return stats;
  }
  return {advance,stats,profiles,get checksum(){return checksum},get ledger(){return ledger},get seconds(){return tick}};
 }
 const wrappers=new WeakMap();
 function wrapEngine(engine){
  if(!engine||engine.passingModel)return engine;if(wrappers.has(engine))return wrappers.get(engine);
  const wrapped={...engine,passingModel:'full-clock-1.0',createMatch(options={}){
   const base=engine.createMatch(options),model=create(options),display={...base.state},markers=[];let eventIndex=0;
   const whole=(90+(base.state.stoppage?.first||0)+(base.state.stoppage?.second||0))*60;
   const markerTime=e=>number(e.worldTime,number(e.elapsed,0)*45/(base.state.duration||45))/45*whole;
   function sync(){
    while(eventIndex<base.state.events.length){const e=base.state.events[eventIndex++];markers.push({...e,time:markerTime(e)});}
    const seconds=base.state.elapsed/(base.state.duration||45)*whole;
    const circulation=model.advance(seconds,markers);
    Object.assign(display,base.state);display.stats=base.state.stats.map((s,t)=>({...s,highlightPasses:s.passes,highlightCompletedPasses:s.completedPasses,passes:circulation[t].passes,completedPasses:circulation[t].completedPasses,possession:circulation[t].possession}));
    display.passing={version:'full-clock-1.0',basis:'90-minute-sequences',seconds:model.seconds,profiles:model.profiles,checksum:model.checksum,ledger:model.ledger};
   }
   sync();return {state:display,step(dt){base.step(dt);sync();return display;},get finished(){return base.finished}};
  },simulate(options){const m=wrapped.createMatch(options);while(!m.finished)m.step(1/30);return m.state;}};
  wrappers.set(engine,wrapped);return wrapped;
 }
 return {create,profile,wrapEngine};
});
