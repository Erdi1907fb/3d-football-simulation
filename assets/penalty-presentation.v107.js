/* Shared pitch coordinates: ceremony, supporters and winner camera use one map. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f();else r.Next90PenaltyStage=f();})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),smooth=v=>{v=clamp(v,0,1);return v*v*(3-2*v);};
// Exact centre ray of the unchanged penalty camera. Positive Z is screen right.
function splitZ(x){return .3+(x-27.8)*(-1.2/21.5);}
function supporter(p,mode='equal'){if(mode!=='equal'){const main=mode==='away'?1:0;return p.x<0?1-main:main;}const cut=splitZ(Math.abs(p.x));return p.x>=0?(p.z>=cut?1:0):(p.z>=-cut?1:0);}
function corner(winner,mode='equal'){const primary=mode==='away'?1:0,goal=mode!=='equal'&&winner!==primary?-1:1,side=winner===0?-1:1;return{x:goal*50,z:side*32,side,goal};}
function winnerPose(winner,index,age,mode='equal',solo=false){const c=corner(winner,mode),j=solo?0:index,u=smooth(age/2.65),start={x:c.goal*(43.4-j*.18),z:c.side*(22+j%3*.6)},target={x:c.x-c.goal*(j%4)*.52,z:c.z-c.side*(Math.floor(j/4)*.86)};return{x:start.x+(target.x-start.x)*u,z:start.z+(target.z-start.z)*u,heading:c.goal*Math.PI/2-Math.PI*c.goal*smooth((age-3.1)/.8),speed:age<2.65?4.5*Math.sin(Math.PI*clamp(age/2.65,0,1)):0,gait:age*10+j};}
function winnerCamera(winner,age,mode,solo){const c=corner(winner,mode),p=winnerPose(winner,solo?0:5,age,mode,solo);return{kind:solo?'duel-winners':'team-winners',fov:solo?43:48,position:[p.x-c.goal*(solo?6:8.5),solo?2.5:3.4,p.z-c.side*(solo?3.4:4.5)],aim:[p.x,solo?.40:.35,p.z]};}
function overlayLayout(h=1920){return{x:30,y:Math.round(h*.675),scale:.84,right:30+1046*.84,bottom:Math.round(h*.675)+.84*264};}
function lowerThirdLayout(){return{x:34,y:0,width:1012,height:110,bottom:110};}
return{splitZ,supporter,corner,winnerPose,winnerCamera,overlayLayout,lowerThirdLayout};});
