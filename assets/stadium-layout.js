/* One metre-based layout for advertising, press, security and celebration paths. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f();else r.SekmeStadiumLayout=f();})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
 const photographers=[];
 for(const sign of[-1,1])for(const z of[-27,-20,20,27])photographers.push({id:'end-'+sign+'-'+z,x:sign*56.9,z,stance:Math.abs(z)===20?'kneel':'stand',zone:'end'});
 for(const x of[-44,-28,-12,12,28,44])photographers.push({id:'touch-'+x,x,z:-36.8,stance:Math.abs(x)===28?'kneel':'stand',zone:'touchline'});
 for(const x of[-50,-44,44,50])photographers.push({id:'near-'+x,x,z:36.8,stance:'kneel',zone:'touchline'});
 const stewards=[];for(const z of[-39.9,39.5])for(const x of[-49,-43,-37,-31,-25,-19,20,26,32,38,44,50])stewards.push({x,z});
 for(const x of[-60,60])for(const z of[-30,-23,-14,-7,7,14,23,30])stewards.push({x,z});
 const boards=[
  {id:'far-instagram',kind:'instagram',x:-29,z:-38.0,width:24,height:2.2,rotation:0},
  {id:'far-competition',kind:'competition',x:0,z:-38.0,width:32,height:2.2,rotation:0},
  {id:'far-youtube',kind:'youtube',x:29,z:-38.0,width:24,height:2.2,rotation:0}
 ];
 for(const sign of[-1,1])for(const side of[-1,1])boards.push({id:'end-'+sign+'-'+side,kind:side<0?'instagram':'youtube',x:sign*59.1,z:side*22,width:20,height:2.2,rotation:-sign*Math.PI/2,competition:true});
 function supporterTeam(p,venue){
  if(venue.host===null){if(Math.abs(p.x)>52)return p.x>0?1:0;return p.z>0?1:0;}
  return p.x>52&&p.z>17?1-venue.host:venue.host;
 }
 function destination(team,dir,venue,variant=0){
  const host=venue.host,home=host!==null&&team===host;
  // The away section is the fixed +X/+Z corner. Attacking direction flips at
  // half-time; supporter ownership never flips with it.
  if((home||host===null&&team===0)&&variant%4===1){const x=dir*28;return{x,z:-34.15,normal:{x:0,z:-1},media:{x,z:-36.8},side:'touchline',supporters:true,supporterTeam:team};}
  const end=host===null?(team?1:-1):home?dir:1,z=host===null?(variant%2?-20:20):home&&end>0?-20:home?(variant%2?-20:20):27;
  return{x:end*54.25,z,normal:{x:end,z:0},media:{x:end*56.9,z},side:'goal-side',supporters:true,supporterTeam:team};
 }
 function nearbyDestination(team,dir,venue,variant,origin){
  const preferred=destination(team,dir,venue,variant),candidates=[];
  for(const sign of[-1,1])for(const z of[-20,20])candidates.push({x:sign*54.25,z,normal:{x:sign,z:0},media:{x:sign*56.9,z},side:'goal-side'});
  candidates.sort((a,b)=>Math.hypot(a.x-origin.x,a.z-origin.z)-Math.hypot(b.x-origin.x,b.z-origin.z));const nearest=candidates[0],distance=p=>Math.hypot(p.x-origin.x,p.z-origin.z),chosen=distance(preferred)<=distance(nearest)+4?preferred:nearest,owner=supporterTeam(chosen.media,venue);
  return {...chosen,supporterTeam:owner,supporters:owner===team,nearby:true};
 }
 function groupSlots(target){const {normal:n}=target,t={x:-n.z,z:n.x},out=[{x:target.x,z:target.z}];
  for(const [radius,angles]of[[1.85,[-60,-20,20,60]],[3.25,[-70,-35,0,35,70]]])for(const angle of angles){const rad=angle*Math.PI/180,depth=radius*Math.cos(rad),offset=radius*Math.sin(rad);out.push({x:target.x-n.x*depth+t.x*offset,z:target.z-n.z*depth+t.z*offset});}return out;
 }
 function playerSafe(p){return Math.abs(p.x)<=55.05&&p.z>=-35.05&&p.z<=35.05;}
 function obstacles(){return [...photographers.map(p=>({...p,radius:1.55})),...stewards.map(p=>({...p,radius:1.05})),...[-1,1].flatMap(s=>[-3,0,3].map(z=>({x:s*53.6,z,radius:1.35,net:true})))];}
 return{photographers,stewards,boards,supporterTeam,destination,nearbyDestination,groupSlots,playerSafe,obstacles,version:'stadium-own-supporters-v2'};
});
