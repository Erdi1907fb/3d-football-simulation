// Kick-off: the referee never stands on top of a player (V121 regression: referee shared the centre spot).
const assert=require('node:assert/strict'),M=require('../assets/match.js'),C=require('../assets/catalog.js');
let samples=0,minGap=Infinity;
for(let seed=1;seed<=6;seed++){
 const teams=C.pair(...[['Alanyaspor','Trabzonspor'],['Crystal Palace','Liverpool'],['Fenerbahçe','Galatasaray']][seed%3]);
 const m=M.create(seed,{teams,targetScore:[1,1],animationProfile:'expanded-v2'});
 for(let t=0;t<Math.min(m.duration,60);t+=.25){const s=m.sample(t);if(s.phase!=='kickoff'&&!(s.pregame&&!s.pregame.ceremony))continue;
  const ref=s.officials[0];for(const p of s.players){if(p.dismissed)continue;const d=Math.hypot(p.x-ref.x,p.z-ref.z);minGap=Math.min(minGap,d);}samples++;}
}
assert(samples>0,'kick-off frames sampled');
assert(minGap>3,'referee clear of players at kick-off, min gap '+minGap.toFixed(2));
console.log(JSON.stringify({PASS:true,samples,minGap:+minGap.toFixed(2)}));
