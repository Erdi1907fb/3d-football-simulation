'use strict';
const assert=require('node:assert/strict'),M=require('../assets/athlete-motion'),C=require('../assets/football-clips'),T=require('../assets/japon-tactics'),A=require('../assets/ball-aero');
for(const dir of [-1,1])for(const flank of [-1,1])for(const angle of [0,Math.PI/2,1.1]){
 const vx=Math.sin(angle)*4,vz=Math.cos(angle)*4,heading=(flank<0?Math.PI-angle:angle)+(dir<0?Math.PI:0),p={speed:4,vx:vx*dir,vz:vz*dir*flank,heading};
 const m=M.movement(p,{dir,flank});assert(Math.abs(m.forward-1)<1e-9);assert(Math.abs(m.lateral)<1e-9);assert.equal(C.reverseWeight(p,{dir,flank}),0);
 const back=M.movement({...p,vx:-p.vx,vz:-p.vz},{dir,flank});assert(Math.abs(back.forward+1)<1e-9);assert.equal(C.reverseWeight({...p,vx:-p.vx,vz:-p.vz},{dir,flank}),1);
}
assert.equal(M.movement({speed:4,vx:0,vz:4,heading:1},{}).vx,0);
assert.equal(M.movement({speed:4,vx:4,vz:0,heading:1},{}).vz,0);
for(const surface of ['clear','rain','snow'])for(const distance of [3,6,10]){
 const t=T.passFlight(distance,surface),b=A.state({x:0,y:.11,z:0},{x:T.passSpeed(distance),y:0,z:0},null,{rollingResistance:1.9,surface});b.continuousGround=true;b.skid=T.passSpeed(distance)*2/7;
 let at=0;while(at+1/240<t){A.step(b,1/240);at+=1/240;}A.step(b,t-at);
 assert(t===3||Math.abs(b.x-distance)<.08,`forecast arrival at ${distance}m: ${b.x}`);
 assert(t>distance/T.passSpeed(distance),'rolling drag delays arrival');
 const aim=T.passAim({x:0,z:0},{x:distance,z:0,vx:0,vz:2});assert(aim.z>distance/T.passSpeed(distance)*2*.65,'lead reflects slower ball');
}
console.log('PASS: mirrored running/backpedal, zero velocity, physical pass arrival and moving receiver lead');
