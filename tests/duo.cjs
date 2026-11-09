// V138 2v2 player duel: both engines alternate the two players of each pair (A1, B1, A2, B2, ...).
const assert=require('node:assert/strict'),path=require('path'),root=path.resolve(__dirname,'..');
const P=require(root+'/assets/penalty-engine.js'),F=require(root+'/assets/freekick-engine.js');
const reg=Object.values(require(root+'/assets/club-rosters-v75.json').teams),guests=require(root+'/assets/penalty-guests.json').players;
let pen=0,fk=0;
for(let seed=1;seed<=120;seed++){const a=reg[seed%reg.length].team,b=reg[(seed+11)%reg.length].team,shooters=[guests[seed%guests.length],guests[(seed+5)%guests.length]],partners=[guests[(seed+9)%guests.length],guests[(seed+13)%guests.length]];
 for(const [E,opts] of [[P,{format:seed%2?'official':'complete-five-each'}],[F,{format:['five','complete-five','three','single'][seed%4]}]]){
  const c=E.create({seed,mode:'duel',lineups:[a,b],shooters,partners,...opts});const taken=[0,0];
  assert.deepEqual(c.partners.map(p=>p.id),partners.map(p=>p.id));
  for(const k of c.kicks){const want=taken[k.team]%2?partners[k.team]:shooters[k.team];assert.equal(String(k.shooter.id),String(want.id),'alternating pair taker');taken[k.team]++;}
  assert(c.score[c.winner]>c.score[1-c.winner]);assert(c.sample(c.duration).finished);
  if(c.kicks.length>=4)assert(new Set(c.kicks.map(k=>k.shooter.id)).size>=3,'both pair players kick');E===P?pen++:fk++;}
 // Without partners the single-player duel is unchanged.
 const solo=P.create({seed,mode:'duel',lineups:[a,b],shooters});assert(solo.kicks.every(k=>k.shooter.id===shooters[k.team].id));assert.equal(solo.partners,null);}
console.log(JSON.stringify({PASS:true,penaltySeries:pen,freeKickSeries:fk}));
