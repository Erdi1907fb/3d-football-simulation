// V221 physics plausibility audit (60 fps): player speed/acceleration, body overlap (<0.5 m), ball under turf, ball jumps, snap turns.
// Usage: node tools/physics-audit.cjs [11v11|free|5v5|pen|fk]
// Physical plausibility audit across modes (60 fps sampling). Usage: node audit.cjs [mode]
const root=(process.env.ROOT||require('path').resolve(__dirname,'..'))+'/assets/';const M=require(root+'match.js'),J=require(root+'japon-engine.js'),P=require(root+'penalty-engine.js'),F=require(root+'freekick-engine.js');
const reg=Object.values(require(root+'club-rosters-v75.json').teams);
const sides=n=>Array.from({length:n},(_,i)=>({name:'S'+i,keeper:{id:'k'+i,name:'K',roles:['GK']},defender:{id:'d'+i,name:'D',roles:['CB']},defender2:{id:'e'+i,name:'E',roles:['CB']},midfielder:{id:'m'+i,name:'M',roles:['CM']},player:{id:'p'+i,name:'P',roles:['ST']}}));
function audit(name,contests){const r={frames:0,speed:0,speedN:0,accN:0,teleport:0,overlap:0,overlapPairs:0,ballUnder:0,ballJump:0,turn:0,worst:{}};
 for(const c of contests){let prev=null,pprev=null,win=[];const dt=1/60;for(let t=0;t<c.duration;t+=dt){const f=c.sample(t);r.frames++;const ps=(f.players||[]).filter(p=>p&&!p.dismissed&&p.active!==false&&Number.isFinite(p.x));
  if(f.ball&&f.ball.y<.09)r.ballUnder++;
  if(prev&&f.ball&&prev.ball){const d=Math.hypot(f.ball.x-prev.ball.x,f.ball.y-prev.ball.y,f.ball.z-prev.ball.z);if(d>1.2&&d<20&&(f.kick?.index??0)===(prev.kick?.index??0)){r.ballJump++;if(process.env.V)console.log(name,'jump',t.toFixed(2),d.toFixed(2),JSON.stringify(prev.ball),JSON.stringify(f.ball));}}
  let ov=0;for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){if(Math.hypot(ps[i].x-ps[j].x,ps[i].z-ps[j].z)<.5)ov++;}r.overlapPairs+=ov;if(ov)r.overlap++;
  if(prev){const key=(p,i)=>p.id??i,map=new Map((prev.players||[]).map((p,i)=>[key(p,i),p]));const map2=win.length>=12?new Map((win[win.length-12].players||[]).map((p,i)=>[key(p,i),p])):null,mid=win.length>=12?new Map((win[win.length-6].players||[]).map((p,i)=>[key(p,i),p])):null;for(const p of ps){const q=map.get(key(p,(f.players||[]).indexOf(p)));if(!q||!Number.isFinite(q.x))continue;const v=Math.hypot(p.x-q.x,p.z-q.z)/dt;if(v>30){r.teleport++;continue;}if(v>9.6){r.speedN++;}r.speed=Math.max(r.speed,v);
   const k=key(p,(f.players||[]).indexOf(p)),o=map2&&map2.get(k),m=mid&&mid.get(k);if(o&&m&&Number.isFinite(o.x)){const v1=Math.hypot(m.x-o.x,m.z-o.z)/.1,v2=Math.hypot(p.x-m.x,p.z-m.z)/.1;if(v1<14&&v2<14&&Math.abs(v2-v1)/.1>12)r.accN++;}
   if(Number.isFinite(p.heading)&&Number.isFinite(q.heading)){let dh=p.heading-q.heading;while(dh>Math.PI)dh-=2*Math.PI;while(dh<-Math.PI)dh+=2*Math.PI;if(Math.abs(dh)/dt>14)r.turn++;}}}
  pprev=prev;prev=f;win.push(f);if(win.length>13)win.shift();}}
 const pc=x=>+(100*x/r.frames).toFixed(2);console.log(name.padEnd(10),JSON.stringify({frames:r.frames,maxSpeed:+r.speed.toFixed(1),'fastFrames‰':+(1000*r.speedN/r.frames).toFixed(1),'hardAcc‰':+(1000*r.accN/r.frames).toFixed(1),teleports:r.teleport,'overlap%':pc(r.overlap),'ballUnder%':pc(r.ballUnder),ballJumps:r.ballJump,'snapTurns‰':+(1000*r.turn/r.frames).toFixed(1)}));}
const only=process.argv[2];
if(!only||only==='11v11')audit('11v11',[1,2,3].map(s=>M.create(s,{presentationRevision:107,animationProfile:'expanded-v2'})));
if(!only||only==='free')audit('free11',[1,2].map(s=>M.create(s,{simulationMode:'free',freeSeconds:40,presentationRevision:107,animationProfile:'expanded-v2'})));
if(!only||only==='5v5')audit('5v5',[1,2,3].map(seed=>J.create({sides:sides(2),seed,seconds:45,mode:'points'})));
if(!only||only==='pen')audit('penalty',[1,2,3].map(seed=>P.create({seed,mode:'team',format:'official',lineups:[reg[seed].team,reg[seed+9].team]})));
if(!only||only==='fk')audit('freekick',[1,2,3,4].map(seed=>F.create({seed,mode:'team',format:'five',spots:'varied',lineups:[reg[seed].team,reg[seed+17].team]})));
