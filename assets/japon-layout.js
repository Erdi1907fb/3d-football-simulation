/* Arena geometry is shared by physics, rendering and broadcast framing (metres). */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f();else r.Next90JaponLayout=f();})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
function area(vertices){return Math.abs(vertices.reduce((sum,a,i)=>{const b=vertices[(i+1)%vertices.length];return sum+a.x*b.z-b.x*a.z;},0))/2;}
function create(count,goalWidth=5){
 if(!Number.isInteger(count)||count<2||count>6)throw Error('Arena needs 2–6 goals');
 const scale=Math.max(.8,Math.min(1.4,Number(goalWidth)/5||1)),apothem=([0,0,14,11.5,14.5,17,19][count])*scale;
 let corners;
 if(count===2)corners=[{x:-apothem,z:-9*scale},{x:apothem,z:-9*scale},{x:apothem,z:9*scale},{x:-apothem,z:9*scale}];
 else{const radius=apothem/Math.cos(Math.PI/count);corners=Array.from({length:count},(_,i)=>{const a=-Math.PI/2+(i+.5)*2*Math.PI/count;return{x:Math.cos(a)*radius,z:Math.sin(a)*radius};});}
 // Cut off empty corners; the playable perimeter and visible boards are identical.
 const vertices=count===2?corners:corners.flatMap((a,i)=>{const prev=corners[(i+corners.length-1)%corners.length],next=corners[(i+1)%corners.length],bevel=count===2?.10:.12;return[{x:a.x+(prev.x-a.x)*bevel,z:a.z+(prev.z-a.z)*bevel},{x:a.x+(next.x-a.x)*bevel,z:a.z+(next.z-a.z)*bevel}];});
 const boundaries=vertices.map((a,i)=>{const b=vertices[(i+1)%vertices.length],dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz);let nx=dz/len,nz=-dx/len,d=nx*a.x+nz*a.z;if(d<0){nx=-nx;nz=-nz;d=-d;}return{a,b,nx,nz,d};});
 const goals=Array.from({length:count},(_,team)=>{const a=count===2?team*Math.PI:-Math.PI/2+team*2*Math.PI/count,nx=Math.cos(a),nz=Math.sin(a);return{team,x:nx*apothem,z:nz*apothem,nx,nz,width:5*scale,height:2.1*scale,radius:apothem,depth:1.5*scale};});
 const xs=vertices.map(p=>p.x),zs=vertices.map(p=>p.z),width=Math.max(...xs)-Math.min(...xs),length=Math.max(...zs)-Math.min(...zs);
 return{count,scale,apothem,vertices,boundaries,goals,width,length,area:area(vertices),shape:count===2?'rectangle':count===3?'triangle':count===4?'square':count===5?'pentagon':'hexagon'};
}
function penaltyArea(layout,team){const g=layout.goals[team];return{team,depth:5.4*layout.scale,halfWidth:4.9*layout.scale,spot:5*layout.scale};}
function inGoalArea(p,layout,team){const g=layout.goals[team],a=penaltyArea(layout,team),depth=g.radius-p.x*g.nx-p.z*g.nz,lateral=-p.x*g.nz+p.z*g.nx;return depth>=0&&depth<=a.depth&&Math.abs(lateral)<=a.halfWidth;}
function inPenaltyArea(p,layout,team){return layout.count===2&&inGoalArea(p,layout,team);}
function foulRestart(layout,point,against,at,until){const penalty=inPenaltyArea(point,layout,against),g=layout.goals[against],distance=penaltyArea(layout,against).spot;return{kind:penalty?'penalty':'free_kick',spot:penalty?{x:g.x-g.nx*distance,z:g.z-g.nz*distance}:contain({x:point.x,z:point.z},layout,.8),until:penalty?Math.max(until,at+5):until};}
function supporterAnchor(layout,team){const angle=(layout.count===2?0:-Math.PI/2)+team*Math.PI*2/layout.count+Math.PI/(layout.count*3),nx=Math.cos(angle),nz=Math.sin(angle),r=Math.min(...layout.boundaries.map(e=>{const d=e.nx*nx+e.nz*nz;return d>1e-7?(e.d-1.1)/d:Infinity;}));return{x:nx*r,z:nz*r,nx,nz};}
function contain(p,layout,margin=.4){for(let pass=0;pass<2;pass++)for(const edge of layout.boundaries){const excess=p.x*edge.nx+p.z*edge.nz-edge.d+margin;if(excess>0){p.x-=edge.nx*excess;p.z-=edge.nz*excess;}}return p;}
function inside(p,layout,margin=0){return layout.boundaries.every(e=>p.x*e.nx+p.z*e.nz<=e.d-margin+1e-7);}
return{create,contain,inside,area,foulRestart,supporterAnchor,penaltyArea,inPenaltyArea,inGoalArea};});
