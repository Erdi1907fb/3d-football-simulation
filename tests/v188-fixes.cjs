'use strict';
// V188: outside-net containment and competition face ids.
const A=require('node:assert/strict');
const P=require('../assets/football-physics.js'),Boundary=require('../assets/ball-boundary.js'),Faces=require('../assets/player-faces.js');

// 1. A missed shot never travels through the side/roof netting into the goal volume.
let seed=7;const rnd=()=>(seed=(seed*1664525+1013904223)>>>0)/4294967296;
const inside=p=>Math.abs(p.x)>52.62&&Math.abs(p.x)<54.6&&Math.abs(p.z)<3.55&&p.y<2.33;
let wide=0,goals=0;
for(let i=0;i<2500;i++){const start={x:52.5-(8+rnd()*25),z:(rnd()-.5)*40,y:.11},side=rnd()<.5?-1:1,target={x:52.5,z:side*(3.9+rnd()*2.5),y:.2+rnd()*2.6};if(rnd()<.3){target.z=(rnd()-.5)*7;target.y=2.62+rnd()*1.2;}
 const r=P.shot({start,target,power:18+rnd()*14,spin:(rnd()-.5)*12});if(r.result==='goal'){goals++;continue;}if(r.result!=='wide')continue;wide++;
 A(!r.trajectory.some(inside),'wide shot entered the goal through the outside netting');}
A(wide>1500,'enough wide samples');
// Goals still enter through the mouth and stay contained by the inner net.
const goal=P.shot({start:{x:40,z:0,y:.11},target:{x:52.5,z:1.5,y:1},power:24});A.equal(goal.result,'goal');A(goal.trajectory.some(inside),'a real goal is still inside the net');

// 2. Dead-ball bake: a ball rolling along the byline into the side netting stops outside it.
for(const sign of[1,-1]){const path=t=>{const u=Math.max(0,t-4);return{x:sign*(52.4+u*2),y:.11,z:5.2-u*4};};const baked=Boundary.bake(path,8);A(baked,'ball leaves the pitch');A(!baked.frames.some(inside),'dead ball cannot cross the side netting');A(baked.hits.some(h=>h.axis==='net'),'outside net contact recorded');}

// 3. Competition 11v11 rosters prefix ids per side; photographic faces use the source id.
A.equal(Faces.sourceId('studio-432-side0-193149'),'193149');A.equal(Faces.sourceId('studio-436-side1-fm-309328'),'fm-309328');A.equal(Faces.sourceId('176948'),'176948');

console.log(JSON.stringify({pass:true,wideShots:wide,goals}));
