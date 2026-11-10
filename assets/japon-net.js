/* Arena coordinates adapt the SAME OpenFootball net containment and normal-match
 * pocket/travelling-wave response. No alternate ball integration or outcome model. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('./open-football-adapter.js'),require('./world-upgrade.js'));else r.Next90JaponNet=f(r.Next90OpenFootball,r.Next90WorldUpgrade);})(typeof globalThis!=='undefined'?globalThis:this,function(Open,World){'use strict';
function depthAt(g,y){return g.depth*(1-.32*Math.max(0,Math.min(1,y/g.height)));}
function contain(ball,g,dt){const sx=1.99/depthAt(g,ball.y),sy=2.33/(g.height-.11),sz=3.55/(g.width/2-.11),depth=(ball.x-g.x)*g.nx+(ball.z-g.z)*g.nz,lateral=-ball.x*g.nz+ball.z*g.nx;
 const b={netElastic:true,x:52.5+depth*sx,y:ball.y*sy,z:lateral*sz,vx:(ball.vx*g.nx+ball.vz*g.nz)*sx,vy:ball.vy*sy,vz:(-ball.vx*g.nz+ball.vz*g.nx)*sz,spin:ball.wy||0},contact=b.x>54.49||Math.abs(b.z)>3.55||b.y>2.33;
 Open.containNet(b,dt);const d=(b.x-52.5)/sx,z=b.z/sz;ball.x=g.x+g.nx*d-g.nz*z;ball.z=g.z+g.nz*d+g.nx*z;ball.y=b.y/sy;ball.vx=g.nx*b.vx/sx-g.nz*b.vz/sz;ball.vz=g.nz*b.vx/sx+g.nx*b.vz/sz;ball.vy=b.vy/sy;
 return contact?{depth:d,y:ball.y,lateral:z}:null;
}
function deform(base,g,impact,age,ball=null){
 if(!impact||age<=0)return base;const sx=2.1/depthAt(g,base.y),sy=2.44/g.height,sz=7.32/g.width,p=World.netResponse(base.x*sx,base.y*sy,base.z*sz,impact.point.y*sy,impact.point.lateral*sz,age,1,impact.speed,impact.point.depth*2.1/depthAt(g,impact.point.y)),out={x:p.x/sx,y:p.y/sy,z:p.z/sz};
 // Keep the shared travelling wave; the physical ball also loads a local cup.
 // Its actual penetration determines the cloth's stretch and release, not a
 // fixed timer after a goal. Frame, ground anchors and open mouth stay pinned.
 if(ball){const pin=Math.max(0,Math.min(1,base.x/.4))*Math.max(0,Math.min(1,(base.y-.035)/.10)),dy=base.y-ball.y,back=base.x>=depthAt(g,base.y)-.045,side=Math.abs(base.z)>=g.width/2-.02,roof=base.y>g.height-.06;
 if(back){const stretch=Math.max(0,Math.min(.55,ball.depth+.11-depthAt(g,ball.y))),weight=Math.exp(-((base.z-ball.lateral)**2+dy*dy)/(.38*.38))*pin;out.x=Math.max(out.x,base.x+stretch*weight);}
 if(side){const sign=Math.sign(base.z),stretch=Math.max(0,Math.min(.4,Math.abs(ball.lateral)+.11-g.width/2)),weight=Math.exp(-((base.x-ball.depth)**2+dy*dy)/(.35*.35))*pin;out.z=sign*Math.max(Math.abs(out.z),Math.abs(base.z)+stretch*weight);}
 if(roof){const stretch=Math.max(0,Math.min(.3,ball.y+.11-g.height)),weight=Math.exp(-((base.x-ball.depth)**2+(base.z-ball.lateral)**2)/(.35*.35))*pin;out.y=Math.max(out.y,base.y+stretch*weight);}}
 return out;
}
return{contain,deform,depthAt};});
