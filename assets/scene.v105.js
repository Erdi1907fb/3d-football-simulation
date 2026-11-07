(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./vendor/three.min.js'),require('./match.js'),require('./broadcast.js'),require('./stadium-lighting.js'),require('./camera-stabilizer.js'),require('./pitch-detail.js'),require('./stadium-atmosphere.js'),require('./pregame-ceremony.js'),require('./stadium-boards.js'),require('./stadium-layout.js'),require('./press-photographers.js'),require('./kit-runtime.js'),require('./jersey-print.js'),require('./match-presentation.js'),require('./player-physique.js'),require('./player-faces.js'),require('./player-label.js'),require('./stadium-shell.js'),require('./character-system.js'),require('./stadium-customization.js'),require('./crowd-lod.js'),require('./graphics-settings.js'),require('./fullbody-runtime.js'),require('./football-animation.js'),require('./football-clips.js'),require('./tracked-runs.js'),require('./celebration-clips.js'),require('./contact-shadows.js'),require('./penalty-presentation.js'),require('./world-upgrade.js'),require('./arena-art.js'),require('./athlete-motion.js'),require('./preferred-foot.js'),require('./broadcast-remaster.js'),require('./crowd-impostors.js'));else root.SekmeScene=factory(root.THREE,root.SekmeMatch,root.SekmeBroadcast,root.SekmeStadiumLighting,root.SekmeCameraStabilizer,root.SekmePitchDetail,root.SekmeStadiumAtmosphere,root.SekmePregameCeremony,root.SekmeBoards,root.SekmeStadiumLayout,root.SekmePress,root.SekmeKitRuntime,root.SekmeJerseyPrint,root.SekmeMatchPresentation,root.SekmePhysique,root.SekmeFaces,root.SekmePlayerLabel,root.SekmeStadiumShell,root.SekmeCharacters,root.SekmeStadiumCustomization,root.SekmeCrowdLOD,root.SekmeGraphics,root.SekmeFullBody,root.SekmeFootballAnimation,root.SekmeFootballClips,root.SekmeTrackedRuns,root.SekmeCelebrationClips,root.SekmeContactShadows,root.Next90PenaltyStage,root.Next90WorldUpgrade,root.Next90ArenaArt,root.Next90AthleteMotion,root.Next90PreferredFoot,root.Next90BroadcastRemaster,root.Next90CrowdImpostors);})(typeof globalThis!=='undefined'?globalThis:this,function(T,M,B,N,C,P,A,PC,Boards,Layout,Press,Kits,Jersey,Presentation,Physique,Faces,PlayerLabel,Shell,Characters,StadiumCustomization,CrowdLOD,Graphics,FullBody,Motion,FootballClips,TrackedRuns,CelebrationClips,ContactShadows,PenaltyStage,Enhance,ArenaArt,Athlete,Feet,Remaster,CrowdImpostors){
'use strict';
const geometries={},materials={};
function mat(color,roughness=.8){const key=color+':'+roughness;return materials[key]||(materials[key]=new T.MeshStandardMaterial({color,roughness,metalness:0}));}
function geo(type,...args){const k=type+args.join(':');return geometries[k]||(geometries[k]=new T[type](...args));}
function mesh(g,c,parent,x=0,y=0,z=0){const m=new T.Mesh(g,typeof c==='object'?c:mat(c));m.position.set(x,y,z);if(parent)parent.add(m);return m;}
function box(parent,w,h,d,color,x=0,y=0,z=0){return mesh(geo('BoxGeometry',w,h,d),color,parent,x,y,z)}
function armTarget(actor,index,target){const arm=actor.arms[index],start=arm.shoulder.position,end=new T.Vector3(...target),direction=end.clone().sub(start),distance=Math.max(.02,Math.min(.479,direction.length()));direction.normalize();const along=(.22*.22-.26*.26+distance*distance)/(2*distance),height=Math.sqrt(Math.max(0,.22*.22-along*along)),bend=new T.Vector3(0,0,1).addScaledVector(direction,-direction.z).normalize(),joint=start.clone().addScaledVector(direction,along).addScaledVector(bend,height),down=new T.Vector3(0,-1,0);arm.shoulder.quaternion.setFromUnitVectors(down,joint.clone().sub(start).normalize());arm.elbow.quaternion.setFromUnitVectors(down,end.sub(joint).applyQuaternion(arm.shoulder.quaternion.clone().invert()).normalize());}
function sphere(parent,r,color,x=0,y=0,z=0){return mesh(geo('SphereGeometry',r,18,12),color,parent,x,y,z)}
function cylinder(parent,r1,r2,h,color,x=0,y=0,z=0){return mesh(geo('CylinderGeometry',r1,r2,h,18),color,parent,x,y,z)}
function limb(parent,x,y,length,radius,color){const group=new T.Group();group.position.set(x,y,0);parent.add(group);cylinder(group,radius,radius*.85,length,color,0,-length/2,0);return group;}
function scalp(style){
 const key='scalp-'+style;if(geometries[key])return geometries[key];
 const g=new T.SphereGeometry(1,24,14,0,Math.PI*2,0,1.9),p=g.attributes.position;
 // Shape the hairline around the actual head surface. Flattening a complete
 // sphere left the skin sticking through the crown, especially on short cuts.
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),r=Math.hypot(x,z),u=Math.acos(Math.max(-1,Math.min(1,y)))/1.9,front=r>1e-6?Math.max(0,z/r):0,back=r>1e-6?Math.max(0,-z/r):0,edge=1.58-front*.48+back*(style==='long'?.52:.38),angle=u*edge,s=Math.sin(angle);p.setXYZ(i,r>1e-6?x/r*s:0,Math.cos(angle),r>1e-6?z/r*s:0);}
 g.computeVertexNormals();geometries[key]=g;return g;
}
function player(team,index,official=false,roster=M.teams,identity=null,canvasFactory=null){
 const root=new T.Group(),body=new T.Group();root.add(body);const keeper=index===0&&!official,uniform=roster[team].kit,kit=official?0xd9ed53:keeper?uniform.keeper:uniform.shirt,trim=official?0x14232d:keeper?(uniform.keeperSet?.stripe??0x153b3b):uniform.stripe,appearance=identity?.appearance,skin=appearance?.skin??[0xc88f6c,0x89573b,0xe1b08d,0xa06b4b][(index+team)%4];root.userData.playerId=identity?.id||null;root.userData.appearanceSource=appearance?.source||'generic';root.userData.skinColor=skin;
 const waist=new T.Group();body.add(waist);waist.position.y=.92;
 const kitParts=[],kitLegacy=[];
 const torso=cylinder(waist,.245,.19,.53,mat(kit,.68),0,.30,0);torso.scale.z=.66;kitParts.push({mesh:torso,kind:'body'});
 for(const side of[-1,1]){const seam=box(waist,.012,.40,.022,trim,side*.177,.28,.11);seam.rotation.z=side*-.09;kitLegacy.push(seam);}
 // Proper shirt sleeves, collar, shorts and socks; deliberately stylised athletes.
 const collar=cylinder(waist,.09,.12,.04,trim,0,.58,0);collar.scale.z=.85;
 cylinder(waist,.07,.075,.10,skin,0,.63,0);
 const head=new T.Group();waist.add(head);head.position.set(0,.81,.005);
 const legacyFace=[],skinHead=sphere(head,.155,skin);skinHead.scale.set(.83,1.1,.87);legacyFace.push(skinHead);
 const hairStyle=(appearance?.hairStyle==='bald'&&appearance?.source==='source-photo-estimate')?'short':appearance?.hairStyle||'short',hair=mesh(scalp(hairStyle),appearance?.hair??0x272321,head,0,0,-.002);hair.visible=hairStyle!=='bald';hair.name='player-hair';hair.userData.hairStyle=hairStyle;hair.userData.noBatch=hairStyle==='bald';hair.scale.set(...(hairStyle==='cropped'?[.151,.198,.165]:hairStyle==='long'?[.164,.210,.175]:[.157,.203,.170]));

 const nose=sphere(head,.035,skin,0,-.015,.13);nose.scale.set(.7,1,1);legacyFace.push(nose);
 for(const x of[-.052,.052])legacyFace.push(sphere(head,.012,0x262626,x,.015,.137));if(identity?.staffRole||!official&&Faces.supported(roster[team]))for(const o of [...legacyFace,hair])o.userData.noBatch=true;

 const shortsColor=official?0x172630:keeper?(uniform.keeperSet?.shorts??trim):uniform.shorts,shortsBody=cylinder(waist,.208,.204,.12,shortsColor,0,-.025,0);shortsBody.scale.z=.66;kitParts.push({mesh:shortsBody,kind:'shortWaist'});
 if(!keeper&&!official){
  const panel=(angle,width,height=.49,y=.30)=>{const o=mesh(geo('CylinderGeometry',.247,.192,height,18,1,true,angle,width),trim,waist,0,y,0);o.scale.z=.66;kitLegacy.push(o);};
  const style=uniform.style||'solid';
  if(style==='stripes')for(const angle of[0,Math.PI/2,Math.PI,Math.PI*1.5])panel(angle-.25,.5);
  if(style==='halves')panel(0,Math.PI);
  if(style==='centre')for(const angle of[0,Math.PI])panel(angle-.5,1);
  if(style==='hoops')for(const y of[.14,.29,.44])panel(0,Math.PI*2,.065,y);
  if(style==='sash'){for(const front of[1,-1]){const o=box(waist,.085,.56,.012,trim,0,.30,front*.17);o.rotation.z=-.48;kitLegacy.push(o);}}

 }
 let numberLabel=null,shortNumberLabel=null,numberTexture=null,shortNumberTexture=null;const jersey=identity?identity.number:index+1,print=Jersey.style(uniform,keeper),printedName=Jersey.shirtName(identity||{});print.resolution=index>=11?256:512;
 root.userData.jerseyNumber=jersey==null?'':String(jersey);root.userData.shirtName=printedName;
 if(!official){const canvas=canvasFactory?canvasFactory(512,512):typeof document!=='undefined'?document.createElement('canvas'):null;
  if(canvas){Jersey.paint(canvas,jersey,printedName,print);const texture=new T.CanvasTexture(canvas);numberTexture=texture;texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=8;texture.generateMipmaps=true;texture.minFilter=T.LinearMipmapLinearFilter;const material=new T.MeshBasicMaterial({map:texture,transparent:true,side:T.DoubleSide,alphaTest:.03,toneMapped:false,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
   numberLabel=mesh(geo('CylinderGeometry',.247,.200,.44,24,1,true,Math.PI-1.10,2.20),material,waist,0,.305,0);numberLabel.scale.z=.69;numberLabel.userData.jerseyTexture=true;numberLabel.userData.noBatch=true;
   const shortCanvas=canvasFactory?canvasFactory(128,128):typeof document!=='undefined'?document.createElement('canvas'):null;if(shortCanvas){Jersey.paintShort(shortCanvas,jersey,uniform,keeper);shortNumberTexture=new T.CanvasTexture(shortCanvas);shortNumberTexture.colorSpace=T.SRGBColorSpace;shortNumberTexture.generateMipmaps=false;shortNumberTexture.minFilter=T.LinearFilter;const shortMaterial=material.clone();shortMaterial.map=shortNumberTexture;shortNumberLabel=mesh(geo('CylinderGeometry',.112,.106,.11,12,1,true,-.6,1.2),shortMaterial,waist);shortNumberLabel.scale.z=1.18;shortNumberLabel.userData.noBatch=true;shortNumberLabel.userData.jerseyTexture=true;}

  }
 }
 const arms=[],legs=[];
 for(const side of[-1,1]){
  const sleeve=!keeper&&!official&&uniform.style==='sleeves'?trim:!keeper&&!official&&uniform.style==='halves'&&side>0?trim:kit;const shoulder=limb(waist,side*.27,.51,.22,.072,mat(sleeve,.68));kitParts.push({mesh:shoulder.children[0],kind:side>0?'sleeveL':'sleeveR'});kitLegacy.push(cylinder(shoulder,.075,.071,.028,trim,0,-.205,0));shoulder.rotation.z=side*.14;
  if(side===-1&&!official&&identity?.isCaptain){const band=cylinder(shoulder,.079,.079,.085,new T.MeshBasicMaterial({color:0xf3d45a,toneMapped:false}),0,-.09,0);band.name='captain-armband';box(shoulder,.046,.046,.008,0x152630,0,-.09,.074);}const elbow=limb(shoulder,0,-.22,.25,.05,keeper?kit:skin);sphere(elbow,keeper?.065:.052,keeper?0xf5f5e9:skin,0,-.26,.005);arms.push({shoulder,elbow});
  const hip=limb(waist,side*.12,-.15,.37,.087,skin),knee=limb(hip,0,-.37,.35,.062,skin);
  const shortLeg=cylinder(hip,.108,.102,.20,shortsColor,0,-.025,0);shortLeg.scale.z=1.18;kitParts.push({mesh:shortLeg,kind:side>0?'shortL':'shortR'});kitLegacy.push(box(hip,.009,.18,.13,trim,side*.106,-.025,0));
  const sock=cylinder(knee,.066,.055,.22,official?0x182732:keeper?(uniform.keeperSet?.socks??trim):uniform.socks,0,-.24,0);kitParts.push({mesh:sock,kind:side>0?'sockL':'sockR'});
  kitLegacy.push(cylinder(knee,.067,.058,.035,trim,0,-.145,0));
  const boot=new T.Group();boot.position.set(0,-.35,.055);knee.add(boot);sphere(boot,1,(index%3===0)?0xf19a58:0x202e38).scale.set(.071,.046,.132);const sole=sphere(boot,1,0xc8d2d3,0,-.035,0);sole.scale.set(.073,.014,.134);for(const z of[-.041,-.013,.015]){const lace=box(boot,.065,.006,.009,0xe5e9e9,0,.043,z);lace.rotation.y=side*.13;}
  legs.push({hip,knee,boot,sole});
 }
 if(shortNumberLabel){legs[1].hip.add(shortNumberLabel);shortNumberLabel.position.set(0,-.025,0);}
 if(identity?.staffRole)root.traverse(o=>{if(o.isMesh&&o.material?.color?.getHex()===skin)o.userData.noBatch=true;});const actor={root,body,waist,head,arms,legs,legacyFace,identity:identity||{},team,index,official,numberLabel,numberTexture,shortNumberTexture,print,kitParts,kitLegacy,uniform:official?null:uniform};Physique.apply(actor,identity||{});if(!official){Characters.attach(actor);Characters.apply(actor,identity||{});FullBody.mark(actor);}return actor;
}
function line(parent,points,color=0xe5eee1){const geometry=new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(p[0],p[1]||.035,p[2])));const l=new T.Line(geometry,new T.LineBasicMaterial({color}));parent.add(l);return l;}
function pitchStroke(parent,points,width=.12){const vertices=[];for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b[0]-a[0],dz=b[2]-a[2],len=Math.hypot(dx,dz);if(len<.0001)continue;const x=-dz/len*width/2,z=dx/len*width/2,y=.043;vertices.push(a[0]+x,y,a[2]+z,a[0]-x,y,a[2]-z,b[0]+x,y,b[2]+z,b[0]+x,y,b[2]+z,a[0]-x,y,a[2]-z,b[0]-x,y,b[2]-z);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.computeVertexNormals();const m=new T.MeshBasicMaterial({color:0xe1e8d8,side:T.DoubleSide,toneMapped:false});return mesh(g,m,parent);}
function rect(parent,x,z,w,d){pitchStroke(parent,[[x,.045,z],[x+w,.045,z],[x+w,.045,z+d],[x,.045,z+d],[x,.045,z]]);}

function crowdLayout(venue=M.venueConfig(),profile=null){
 if(typeof venue==='string')venue=M.venueConfig(venue);const slots=[];
 // The terraces widen towards the back: occupy the full usable tread,
 // rather than repeating a narrow front-row strip on every upper row.
 for(const side of[-1,1])for(let row=0;row<16;row++)for(let j=0;j<250;j++){const half=55.2+row*.72;slots.push({row,detail:row===0&&j%4===0,x:-half+j*(2*half/249),z:side*(41+row*1.05),y:1.78+row*.55,heading:side>0?Math.PI:0,sector:side>0?'north':'south',neutralTeam:side>0?1:0});}
 for(const sign of[-1,1])for(let row=0;row<16;row++)for(let j=0;j<150;j++){const half=34+row*.55,z=-half+j*2*half/149;slots.push({row,detail:row===0&&j%4===0,x:sign*(61+row*1.285),z,y:1.85+row*.55,heading:-sign*Math.PI/2,sector:sign>0&&z>17?'awayCorner':'homeEnd',neutralTeam:sign>0?1:0});}
 for(const sx of[-1,1])for(const sz of[-1,1])for(let row=0;row<16;row++)for(let j=0;j<36;j++){
  const angle=(j+.5)/36*Math.PI/2,lx=55.2+row*.72,ex=61+row*1.285,ez=34+row*.55,lz=41+row*1.05,x=sx*(lx+(ex-lx)*Math.sin(angle)),z=sz*(ez+(lz-ez)*Math.cos(angle));slots.push({row,detail:false,x,z,y:1.82+row*.55,heading:Math.atan2(-x,-z),sector:sx>0&&sz>0?'awayCorner':'homeCorner',neutralTeam:sx>0?1:0});
 }
 if(profile)slots.push(...A.slots(profile));slots.forEach((p,i)=>{p.team=venue.host===null?p.neutralTeam:p.sector==='awayCorner'?1-venue.host:venue.host;p.id=i;});return slots;
}
function crowdReaction(state){
 const p=state.penaltyShootout;if(p){return p.active&&p.celebratingTeam!=null?{goal:{team:p.celebratingTeam,penalty:true},age:p.reactionAge,pending:false,cancelled:false}:{goal:null,age:Infinity,pending:false,cancelled:false};}
 const event=state.events.filter(e=>['goal','goal_pending','goal_disallowed'].includes(e.type)).at(-1);
 const now=state.phase==='finished'?(state.activeVideoDuration??state.duration-M.HOLD):(state.presentationTime??state.time);
 if(!event||event.type==='goal_disallowed'||state.initialDecision?.allowed===false)return{goal:null,age:Infinity,pending:false,cancelled:event?.type==='goal_disallowed'};
 const age=now-(event.videoAt??event.at),pending=event.type==='goal_pending';
 return{goal:pending&&state.phase==='var'?null:event,age,pending,cancelled:false};
}
function goalAtmosphere(state){
 const reaction=crowdReaction(state),goals=state.events.filter(e=>e.type==='goal');if(reaction.goal?.type==='goal_pending')goals.push(reaction.goal);const goal=goals.at(-1);if(!goal)return{goal:null,intensity:0,kind:'none',before:[0,0],after:[0,0]};
 const before=[0,0];for(const e of goals.slice(0,-1))before[e.team]++;const after=before.slice(),team=goal.team,other=1-team;after[team]++;
 const late=goal.minute>=85?1:goal.minute>=75?.55:0,lead=after[team]>after[other]&&before[team]<=before[other],equal=after[team]===after[other],trailed=goals.slice(0,-1).some((_,i)=>{const q=[0,0];for(const e of goals.slice(0,i+1))q[e.team]++;return q[team]<q[other];});
 const intensity=Math.min(state.matchPresentation?.big?2.7:2.1,(state.matchPresentation?.level||1)*(lead?1.12+late*.65+(trailed?.24:0):equal?.88+late*.3:after[team]<after[other]?.60:Math.max(.64,1.0-(after[team]-after[other]-1)*.12)));
 return{goal,intensity,kind:lead&&late?'late-lead':lead?'lead':equal?'equaliser':after[team]<after[other]?'consolation':'extension',before,after};
}
function football(parent){
 const ico=geo('IcosahedronGeometry',1,0),pos=ico.attributes.position,vs=[],faces=[],keys=new Map();
 for(let i=0;i<pos.count;i+=3){const f=[];for(let j=0;j<3;j++){const v=new T.Vector3().fromBufferAttribute(pos,i+j),key=v.toArray().map(n=>n.toFixed(5)).join(',');if(!keys.has(key)){keys.set(key,vs.length);vs.push(v);}f.push(keys.get(key));}faces.push(f);}
 const neighbours=vs.map(()=>new Set());faces.forEach(f=>f.forEach((a,i)=>{neighbours[a].add(f[(i+1)%3]);neighbours[a].add(f[(i+2)%3]);}));
 const at=(a,b)=>vs[a].clone().multiplyScalar(2).add(vs[b]).multiplyScalar(1/3),scale=M.BALL/at(0,[...neighbours[0]][0]).length(),dark=[],light=[];
 function polygon(points,dst){const centre=points.reduce((a,v)=>a.add(v),new T.Vector3()).multiplyScalar(1/points.length),normal=points[1].clone().sub(points[0]).cross(points[2].clone().sub(points[0]));points=points.map(p=>p.clone().lerp(centre,.014));if(normal.dot(centre)<0)points.reverse();const tri=(a,b,c,depth)=>{if(depth){const ab=a.clone().add(b).multiplyScalar(.5),bc=b.clone().add(c).multiplyScalar(.5),ca=c.clone().add(a).multiplyScalar(.5);tri(a,ab,ca,depth-1);tri(ab,b,bc,depth-1);tri(ca,bc,c,depth-1);tri(ab,bc,ca,depth-1);}else for(const v of[a,b,c]){const p=v.clone().normalize().multiplyScalar(M.BALL);dst.push(p.x,p.y,p.z);}};for(let i=0;i<points.length;i++)tri(centre,points[i],points[(i+1)%points.length],2);}
 vs.forEach((v,i)=>{const axis=v.clone().normalize(),basis=at(i,[...neighbours[i]][0]).sub(v).normalize(),other=new T.Vector3().crossVectors(axis,basis).normalize(),pts=[...neighbours[i]].map(j=>at(i,j));pts.sort((a,b)=>Math.atan2(a.clone().sub(v).dot(other),a.clone().sub(v).dot(basis))-Math.atan2(b.clone().sub(v).dot(other),b.clone().sub(v).dot(basis)));polygon(pts,dark);});
 for(const[a,b,c]of faces)polygon([at(a,b),at(b,a),at(b,c),at(c,b),at(c,a),at(a,c)],light);
 sphere(parent,M.BALL*.997,mat(0x4a5357,.48));for(const[data,color]of[[dark,0x18212a],[light,0xfffbef]]){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(data,3));g.setAttribute('normal',new T.Float32BufferAttribute(data.map(v=>v/M.BALL),3));mesh(g,mat(color,.40),parent);}
}
function netResponse(...args){return Enhance.netResponse(...args);}
function create(options={}){
 let sceneDisposed=false;
 const quality=Graphics.get(options.quality);
 const teams=options.teams||M.teams,compact=!!options.compact,stadiumProfile=A.profile(teams,options.venue,Presentation.profile(options.fixture,teams));
 // Every seat remains occupied on phones. Only nearby articulation is simplified.
 const penaltySupporter=p=>PenaltyStage.supporter(p,options.penaltyCrowd);const seats=venue=>{const rows=crowdLayout(venue,stadiumProfile).map(p=>{if(options.penaltyCrowd)p={...p,team:penaltySupporter(p)};return compact?{...p,detail:p.detail&&p.id%8===0}:p;});if(options.penaltyCrowd==='equal'){const count=rows.reduce((n,p)=>n+(p.team===0),0),target=Math.floor(rows.length/2),from=count>target?0:1;let left=Math.abs(count-target);const offCamera=rows.filter(p=>p.team===from&&p.x<0&&Math.abs(p.z)<5).sort((a,b)=>Math.abs(a.z)-Math.abs(b.z));for(const p of offCamera){if(!left)break;p.team=1-from;left--;}}return rows;};

 const kitRuntime=Kits.create(teams,{loadImage:options.loadKitImage});
 const scene=new T.Scene();
 const flagTextures=[],flagMaterials=[0,1].map(i=>new T.MeshBasicMaterial({color:teams[i].primary,side:T.DoubleSide,toneMapped:false})),crestMaterials=[0,1].map(()=>new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide})),crestTextures=[];
 function paintFlag(image,team){
  const canvas=options.canvasFactory?options.canvasFactory(2048,1024):typeof document!=='undefined'?document.createElement('canvas'):null;if(!canvas)return null;
  canvas.width=2048;canvas.height=1024;const ctx=canvas.getContext('2d'),hex=n=>'#'+n.toString(16).padStart(6,'0');if(!ctx)return null;ctx.scale(2048/768,1024/480);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.fillStyle=hex(teams[team].primary);ctx.fillRect(0,0,768,480);ctx.fillStyle=hex(teams[team].secondary);ctx.beginPath();ctx.moveTo(0,390);ctx.lineTo(768,60);ctx.lineTo(768,145);ctx.lineTo(0,475);ctx.closePath();ctx.fill();
  const iw=image.naturalWidth||image.width,ih=image.naturalHeight||image.height,k=Math.min(350/iw,390/ih);ctx.drawImage(image,(768-iw*k)/2,(480-ih*k)/2,iw*k,ih*k);
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=8;texture.wrapS=texture.wrapT=T.ClampToEdgeWrapping;texture.generateMipmaps=true;texture.needsUpdate=true;return texture;
 }
 function setCrests(images){stadiumExtras.setCrests(images);adboards.setAssets(images);ceremony.setCrests(images);for(let i=0;i<2;i++)if(images[i]&&crestTextures[i]?.image!==images[i]){if(crestTextures[i])crestTextures[i].dispose();const texture=new T.Texture(images[i]);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=8;texture.needsUpdate=true;crestTextures[i]=texture;crestMaterials[i].map=texture;crestMaterials[i].opacity=1;crestMaterials[i].needsUpdate=true;const flag=paintFlag(images[i],i);if(flag){flagTextures[i]?.dispose();flagTextures[i]=flag;flagMaterials[i].map=flag;flagMaterials[i].color.setHex(0xffffff);flagMaterials[i].needsUpdate=true;}}}
 const badge=(parent,team,w,h,x,y,z)=>mesh(geo('PlaneGeometry',w,h),crestMaterials[team],parent,x,y,z);
 const netGoals=[];
 const stadium=new T.Group();stadium.userData.baked=true;scene.add(stadium);box(stadium,164,.6,128,0x173529,0,-.4,0);const lighting=N.create(scene,stadium);scene.fog.near=450;scene.fog.far=900;const stadiumShell=Shell.create({scene,stadium,profile:stadiumProfile,teams});const stadiumExtras=A.create(stadium,stadiumProfile,teams,options.canvasFactory);const ceremony=PC.create(scene,teams,options.canvasFactory);scene.userData.stadium={...stadiumProfile};
 const adboards=Boards.create(stadium,options.canvasFactory,{fixture:options.fixture});const pitchDetail=P.create(stadium,{quality:quality.id,tufts:quality.tufts,anisotropy:quality.anisotropy}),{grass,grassNormal}=pitchDetail;
 const turf=[0x2f7d44,0x38894c].map(color=>new T.MeshStandardMaterial({color,map:grass,normalMap:grassNormal,normalScale:new T.Vector2(.11,.12),roughness:.98}));
 scene.userData.turf=pitchDetail.info;
 const turfMeshes=[];for(let i=0;i<14;i++)turfMeshes.push(box(stadium,105/14,.035,68,turf[i%2],-52.5+(i+.5)*105/14,-.015,0));for(const m of turfMeshes){m.userData.noBatch=true;m.receiveShadow=quality.shadows;}const turfReady=pitchDetail.bind(turf,turfMeshes);
 rect(stadium,-52.5,-34,105,68);pitchStroke(stadium,[[0,.04,-34],[0,.04,34]]);
 const circle=(x,z,r,a=0,b=2*Math.PI)=>pitchStroke(stadium,Array.from({length:65},(_,i)=>[x+Math.cos(a+(b-a)*i/64)*r,.045,z+Math.sin(a+(b-a)*i/64)*r]));circle(0,0,9.15);sphere(stadium,.12,0xe9f0de,0,.04,0).scale.y=.15;
 for(const sign of[-1,1]){
  rect(stadium,sign<0?-52.5:36,-20.16,16.5,40.32);rect(stadium,sign<0?-52.5:47,-9.16,5.5,18.32);sphere(stadium,.12,0xe9f0de,sign*41.5,.04,0).scale.y=.15;
  const goal=new T.Group();stadium.add(goal);goal.position.x=sign*52.5;
  for(const z of[-3.66,3.66])mesh(geo('CylinderGeometry',.06,.06,2.44,24),mat(0xf5f5ee,.36),goal,0,1.22,z);
  const bar=mesh(geo('CylinderGeometry',.06,.06,7.32,24),mat(0xf5f5ee,.36),goal,0,2.44,0);bar.rotation.x=Math.PI/2;
  // One dynamic draw per goal, with finer 12cm cords. Posts stay separate and rigid.
  const cordPoints=[],cord=(a,b)=>{for(let i=0;i<18;i++)for(const u of[i/18,(i+1)/18])for(let k=0;k<3;k++)cordPoints.push(a[k]+(b[k]-a[k])*u);};
  for(let i=0;i<=60;i++){const z=-3.66+i*7.32/60;cord([0,2.44,z],[sign*2.1,2.44,z]);cord([sign*2.1,2.44,z],[sign*2.1,.05,z]);}
  for(let i=0;i<=20;i++){const y=.05+i*2.39/20;cord([sign*2.1,y,-3.66],[sign*2.1,y,3.66]);for(const z of[-3.66,3.66])cord([0,y,z],[sign*2.1,y,z]);}
  for(let i=1;i<=14;i++)for(const z of[-3.66,3.66])cord([sign*i*.15,.05,z],[sign*i*.15,2.44,z]);
  const netGeometry=new T.BufferGeometry();netGeometry.setAttribute('position',new T.Float32BufferAttribute(cordPoints,3));const net=new T.LineSegments(netGeometry,new T.LineBasicMaterial({color:0xdce8e1,transparent:true,opacity:.80}));net.name='goal-net-ropes';net.userData.noBatch=true;net.frustumCulled=false;goal.add(net);goal.userData.sign=sign;goal.userData.net=[{mesh:net,base:new Float32Array(netGeometry.attributes.position.array)}];goal.userData.netDrawCalls=1;
  // Evaluate shared cord junctions once; retain the single LineSegments draw.
  for(const entry of goal.userData.net){const lookup=new Map(),nodes=[],index=new Uint32Array(entry.base.length/3);for(let i=0;i<index.length;i++){const at=i*3,x=entry.base[at],y=entry.base[at+1],z=entry.base[at+2],key=x.toFixed(5)+'|'+y.toFixed(5)+'|'+z.toFixed(5);let id=lookup.get(key);if(id===undefined){id=nodes.length;lookup.set(key,id);nodes.push({x,y,z});}index[i]=id;}entry.nodes=nodes;entry.index=index;entry.displaced=new Float32Array(nodes.length*3);}
  netGoals.push(goal);
  const arc=sign>0?[2.216,4.067]:[-.926,.926];circle(sign*41.5,0,9.15,...arc);
  for(const z of[-34,34]){cylinder(stadium,.04,.04,1.5,0xf4f1dd,sign*52.5,.75,z);box(stadium,.55,.32,.02,0xe9cd5a,sign*52.5+.25,1.35,z);}
 }
 // Modest stadium shell: no heavy crowd textures or real-time shadow maps on phones.
 for(const side of[-1,1]){
  box(stadium,125,1.1,.45,0xdce2db,0,.55,side*39);
  for(let row=0;row<16;row++){
   box(stadium,111.4+row*1.44,.45,2.2,row%2?0x293f4d:0x23404c,0,1.3+row*.55,side*(41+row*1.05));
   // Standing supporters cover these treads; no oversized empty seat blocks.
  }
  // Open broadcast bowl: no roof slab or support can sit between a corner camera and the pitch.
 }
 for(const sign of[-1,1])for(let row=0;row<16;row++)box(stadium,2,.45,69+row*1.1,0x2b4351,sign*(61+row*1.285),1.6+row*.55,0);

 for(const side of[-1,1]){box(stadium,145,11.8,.35,0x304652,0,6.1,side*59);box(stadium,128,.15,.18,0x99a8aa,0,11.8,side*58.9);for(let j=-5;j<=5;j++)box(stadium,.20,6.6,.28,0x50616b,j*11.2,4.6,side*58.7);}
 for(const sign of[-1,1]){box(stadium,.35,6.5,89,0x304652,sign*78,5.8,0);box(stadium,.2,.15,89,0x99a8aa,sign*77.8,11.1,0);}
 for(const sx of[-1,1])for(const sz of[-1,1])for(let row=0;row<16;row++)for(let j=0;j<12;j++){const a=j/12*Math.PI/2,b=(j+1)/12*Math.PI/2,lx=55.2+row*.72,ex=61+row*1.285,ez=34+row*.55,lz=41+row*1.05,x1=sx*(lx+(ex-lx)*Math.sin(a)),z1=sz*(ez+(lz-ez)*Math.cos(a)),x2=sx*(lx+(ex-lx)*Math.sin(b)),z2=sz*(ez+(lz-ez)*Math.cos(b)),step=box(stadium,Math.hypot(x2-x1,z2-z1)+.12,.40,1.5,0x2a414d,(x1+x2)/2,1.52+row*.55,(z1+z2)/2);step.rotation.y=-Math.atan2(z2-z1,x2-x1);}
 // The visiting corner remains separated from the adjacent home long stand.
 for(let row=0;row<7;row++){cylinder(stadium,.035,.035,1.2,0xa9bfc1,55.15+row*.72,2.4+row*.72,41.25+row*.55);}
 // A compact VAR station is actually present at the touchline.
 const varStation=new T.Group();scene.add(varStation);varStation.position.set(0,0,35.8);
 box(varStation,1.35,.82,.14,0x14252d,0,1.48,0);box(varStation,1.14,.60,.025,0x588077,0,1.5,-.085);for(const y of[1.25,1.76])box(varStation,1.0,.012,.008,0xbdd8c6,0,y,-.105);for(const x of[-.5,.5])box(varStation,.012,.52,.008,0xbdd8c6,x,1.5,-.105);box(varStation,.012,.52,.008,0xbdd8c6,0,1.5,-.105);sphere(varStation,.025,0xf2f0c6,.26,1.47,-.13);
 cylinder(varStation,.045,.06,1.12,0x778c92,0,.56,0);box(varStation,1.0,.06,.65,0x1b313d,0,.04,0);
 // One corner visiting section. Neutral grounds split all occupied seats exactly in half.
 const fanMaterial=new T.MeshLambertMaterial({color:0xffffff}),fans=[],tinted=[],banners=[],farTemplates=[];
 function tintPart(g,parent,part,x,y,z,slot){const o=mesh(g,fanMaterial,parent,x,y,z);o.userData.fan={slot,part};tinted.push(o);return o;}
 function fanShape(key,parts){if(geometries[key])return geometries[key];const vertices=[],normals=[];for(const [g,x,y,z,sx=1,sy=1,sz=1]of parts){const copy=(g.index?g.toNonIndexed():g.clone());copy.scale(sx,sy,sz);copy.translate(x,y,z);vertices.push(...copy.attributes.position.array);normals.push(...copy.attributes.normal.array);copy.dispose();}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));return geometries[key]=g;}
 function farFan(root,slot,skin){if(!farTemplates.length)for(const pose of[0,1,2,3,4,5,6]){const lower=pose===6?-.28:0,armY=pose===3?1.34:pose===1?1.26:pose===2?1.02:pose===4?1.19:pose===5?1.02:.63,handY=pose===3?1.63:pose===1?1.54:pose===2?1.03:pose===4?1.44:pose===5?1.06:.42;const shirt=fanShape('fan-shirt-'+pose,[[geo('CylinderGeometry',.23,.19,.58,8),0,.88+lower,0,1,1,.7],...[1,-1].map(k=>[geo('BoxGeometry',.13,.25,.15),k*.24,armY,0])]);const skinShape=fanShape('fan-skin-'+pose,[[geo('SphereGeometry',.11,8,5),0,1.31+lower,0,.91,1.1,.95],[geo('CylinderGeometry',.065,.065,.11,5),0,1.16+lower,0],...[1,-1].map(k=>[geo('BoxGeometry',.10,.24,.11),k*(pose===2?.12:pose===4?.16:pose===5?.20:.265),handY,pose===5?.36:pose===2?.18:.035])]);const dark=fanShape('fan-pants-'+pose,[[geo('BoxGeometry',.34,.18,.25),0,.57+lower,0],...[1,-1].map(k=>pose!==6?[geo('BoxGeometry',.12,.43,.14),k*.105,.28,0]:[geo('BoxGeometry',.12,.14,.32),k*.105,.25,.13]),...(pose===6?[...[1,-1].map(k=>[geo('BoxGeometry',.12,.23,.14),k*.105,.13,.30])]:[]),...[1,-1].map(k=>[geo('BoxGeometry',.14,.08,.24),k*.105,.045,.045]),[geo('SphereGeometry',.136,8,4,0,Math.PI*2,0,1.6),0,1.355+lower,-.012,.94,.86,.94]]);const stripe=fanShape('fan-markings-'+pose,[...(pose===3?[[geo('BoxGeometry',.91,.14,.035),0,1.73,.035]]:[]),[geo('BoxGeometry',.115,.47,.019),-.08,.89+lower,.158],[geo('BoxGeometry',.07,.47,.019),.12,.89+lower,.158],[geo('CylinderGeometry',.09,.105,.035,8),0,1.105+lower,0,1,1,.8]]);farTemplates.push({geometry:shirt,part:'shirt',pose},{geometry:skinShape,part:'skin',pose},{geometry:dark,part:'dark',pose},{geometry:stripe,part:'stripe',pose});}
  return{root,skin,body:null,head:null,legs:[],arms:[],scarf:null,slot,team:slot.team,variation:(Math.floor(slot.id/4)+Math.floor(slot.id/13))%4,goalPose:0};}
 for(const slot of seats()){
  const root=new T.Group();if(slot.detail)root.userData.animate=true;root.position.set(slot.x,slot.y-.23,slot.z);root.rotation.y=slot.heading;const size=.94+(slot.id*17%19)/180;root.scale.set(size,size,size);stadium.add(root);
  const skin=[0xb98363,0x8c5c43,0xe1b08d,0x674734,0xd5a17c][slot.id%5];if(!slot.detail){fans.push(farFan(root,slot,skin));continue;}const hair=[0x292722,0x3f2b21,0x84654a,0xb39b79,0x211e20][slot.id*7%5],body=new T.Group();root.add(body);
  const torso=tintPart(geo('CylinderGeometry',.23,.19,.58,8),body,'shirt',0,.89,0,slot.id);torso.scale.z=.69;
  tintPart(geo('BoxGeometry',.10,.48,.018),body,'stripe',-.085,.89,.157,slot.id);
  if(slot.detail){tintPart(geo('BoxGeometry',.10,.48,.018),body,'stripe',.085,.89,.157,slot.id);tintPart(geo('TorusGeometry',.088,.018,4,8),body,'stripe',0,1.12,0,slot.id).rotation.x=Math.PI/2;}
  mesh(geo('CylinderGeometry',.065,.07,.1,6),skin,body,0,1.17,0);
  const head=new T.Group();head.position.y=1.32;body.add(head);mesh(geo('SphereGeometry',.135,slot.detail?10:6,slot.detail?7:4),skin,head).scale.set(.9,1.12,.91);
  const hairCap=mesh(geo('SphereGeometry',.138,slot.detail?10:6,4,0,Math.PI*2,0,1.6),hair,head,0,.04,-.012);hairCap.scale.set(.93,.88,.94);
  if(slot.detail){box(head,.045,.037,.025,skin,0,.005,.118);for(const x of[-.045,.045])box(head,.022,.017,.012,0x263039,x,.035,.119);}
  if(slot.id%7===0){const cap=tintPart(geo('SphereGeometry',.142,6,4,0,Math.PI*2,0,1.5),head,'shirt',0,.055,0,slot.id);cap.scale.y=.7;tintPart(geo('BoxGeometry',.24,.026,.14),head,'shirt',0,.055,.105,slot.id);}
  box(body,.34,.19,.25,slot.id%3?0x25313c:0x47515a,0,.57,0);
  const legs=[];for(const side of[-1,1]){const leg=new T.Group();body.add(leg);leg.position.set(side*.105,.49,0);mesh(geo('CylinderGeometry',.066,.058,.26,5),slot.id%4?0x34434e:0x67717a,leg,0,-.13,0);const knee=new T.Group();leg.add(knee);knee.position.y=-.26;box(knee,.11,.21,.12,0x34434e,0,-.105,0);box(knee,.13,.085,.23,slot.id%3?0x23313a:0xd5d7ce,0,-.20,.04);leg.userData.knee=knee;legs.push(leg);}
  const arms=[];for(const side of[-1,1]){const shoulder=new T.Group();body.add(shoulder);shoulder.position.set(side*.245,1.035,0);tintPart(geo('CylinderGeometry',.067,.06,.23,5),shoulder,'shirt',0,-.115,0,slot.id);const elbow=new T.Group();shoulder.add(elbow);elbow.position.y=-.23;mesh(geo('CylinderGeometry',.051,.045,.22,5),skin,elbow,0,-.11,0);mesh(geo('SphereGeometry',.052,6,4),skin,elbow,0,-.235,0);arms.push({shoulder,elbow});}
  let scarf=null;if(Math.floor(slot.id/4)%4===0){scarf=new T.Group();body.add(scarf);scarf.position.set(0,1.15,.19);tintPart(geo('BoxGeometry',.86,.13,.028),scarf,'shirt',0,0,0,slot.id);for(const x of[-.27,-.09,.09,.27])tintPart(geo('BoxGeometry',.065,.11,.032),scarf,'stripe',x,0,0,slot.id);}
  fans.push({root,body,head,legs,arms,scarf,slot,team:slot.team,variation:(Math.floor(slot.id/4)+Math.floor(slot.id/13))%4});
 }
 const distant=fans.filter(f=>!f.body),emptyFanMatrix=new T.Matrix4().makeScale(0,0,0),farBatches=farTemplates.map(template=>{const batch=new T.InstancedMesh(template.geometry,fanMaterial,distant.length);batch.userData.noBatch=true;batch.frustumCulled=false;batch.instanceMatrix.setUsage(T.DynamicDrawUsage);for(let i=0;i<distant.length;i++)batch.setMatrixAt(i,emptyFanMatrix);scene.add(batch);return{...template,batch};});
 // Coloured end banners and actual club crests make stadium ownership visible.
 for(const side of[-1,1])for(const x of[-27,27]){
  const root=new T.Group();root.position.set(x,2.5,side*38.50);root.rotation.y=side>0?Math.PI:0;stadium.add(root);const material=new T.MeshStandardMaterial({color:0x5a0e27,roughness:.9}),cloth=mesh(geo('BoxGeometry',5.6,2.1,.06),material,root),logo=badge(root,0,1.5,1.8,0,0,.05);logo.userData.noBatch=true;logo.frustumCulled=false;cloth.frustumCulled=false;banners.push({cloth,logo,neutralTeam:side>0?1:0});
 }
 // Flags share two crest maps; only their small cloth vertex arrays move.
 const flags=[];
 let flagSites=[...[-1,1].flatMap(side=>[-48,-31,-14,14,31,48].map(x=>({x,z:side*57.8,y:12.4,angle:side>0?Math.PI:0,neutralTeam:side>0?1:0}))),...[-1,1].flatMap(sign=>[-24,-9,9,24].map(z=>({x:sign*76.9,z,y:11.2,angle:-sign*Math.PI/2,neutralTeam:sign>0?1:0,away:sign>0&&z>=17})))];
 if(options.penaltyStudio){const length=Math.hypot(21.5,1.2),rx=1.2/length,rz=21.5/length;flagSites=[-1,1].flatMap(side=>[4.8,9.2].map((d,j)=>({x:68+rx*(side*d-1.7),z:PenaltyStage.splitZ(68)+rz*(side*d-1.7),y:5.6+j*1.5,angle:Math.atan2(-rz,rx),neutralTeam:side>0?1:0})));}
 for(const [i,site]of flagSites.entries()){
  const root=new T.Group();root.userData.animate=true;root.position.set(site.x,site.y,site.z);root.rotation.y=site.angle;stadium.add(root);
  cylinder(root,.035,.035,5.1,0xe0e4df,0,1.85,0);
  const geometry=new T.PlaneGeometry(3.4,2.1,12,6),cloth=mesh(geometry,flagMaterials[0],root,1.7,3.25,0);cloth.userData.noBatch=true;cloth.frustumCulled=false;cloth.renderOrder=2;
  // The fallback crest also needs both faces; the waving cloth is visible
  // from both sides of the bowl. Keep it independently outside batching.
  const logoGeometry=new T.PlaneGeometry(1.55,1.65,8,6),logoMaterial=new T.MeshBasicMaterial({transparent:true,opacity:0,side:T.DoubleSide,depthWrite:false,toneMapped:false}),logo=mesh(logoGeometry,logoMaterial,root,1.7,3.25,.025);logo.userData.noBatch=true;logo.frustumCulled=false;
  flags.push({root,cloth,logo,site,team:0,phase:i*1.73,base:new Float32Array(geometry.attributes.position.array),logoBase:new Float32Array(logoGeometry.attributes.position.array)});
 }
 if(!options.penaltyCrowd){
 // The away block occupies the positive-end corner, beyond a low aisle barrier.
 for(const z of[16.1,17.3]){box(stadium,13,1.4,.10,0xa9bac0,70,3.8,z);for(let x=60;x<78;x+=1.4)cylinder(stadium,.035,.035,2.4,0xb7c5ca,x,4.15,z);}box(stadium,13,.12,2.6,0x647982,70,1.15,16.7);box(stadium,.10,1.5,30,0x9cabb1,59.5,2.8,17);
 const cornerBanner=new T.Group();cornerBanner.position.set(58.9,3.0,25);cornerBanner.rotation.y=-Math.PI/2;stadium.add(cornerBanner);
 const awayCloth=mesh(geo('BoxGeometry',6,2,.05),new T.MeshStandardMaterial({roughness:.9}),cornerBanner),awayLogo=badge(cornerBanner,1,1.5,1.8,0,0,.04);awayLogo.userData.noBatch=true;awayLogo.frustumCulled=false;awayCloth.frustumCulled=false;banners.push({cloth:awayCloth,logo:awayLogo,neutralTeam:1,away:true});
 }
 let venueKey='',crowdInfo={counts:[0,0],total:fans.length};
 function applyVenue(venue){if(venueKey===venue.mode)return;venueKey=venue.mode;const slots=seats(venue),counts=[0,0];fans.forEach((f,i)=>{f.team=slots[i].team;counts[f.team]++;});
  for(const {batch,sources} of batches)if(sources.some(o=>o.userData.fan)){sources.forEach((o,i)=>batch.setColorAt(i,new T.Color(o.userData.fan?(o.userData.fan.part==='shirt'?teams[fans[o.userData.fan.slot].team].primary:teams[fans[o.userData.fan.slot].team].secondary):0xffffff)));batch.instanceColor.needsUpdate=true;}
  const teamColours=teams.map(t=>({shirt:new T.Color(t.primary),stripe:new T.Color(t.secondary),dark:new T.Color(0x253541)})),skinColours=new Map();for(const f of fans){if(f.skin===undefined)f.skin=[0xb98363,0x8c5c43,0xe1b08d,0x674734,0xd5a17c][f.slot.id%5];if(!skinColours.has(f.skin))skinColours.set(f.skin,new T.Color(f.skin));const shade=.80+((f.slot.id*37)%23)/100;f.colours={...teamColours[f.team],shirt:teamColours[f.team].shirt.clone().multiplyScalar(shade),stripe:teamColours[f.team].stripe.clone().multiplyScalar(.88+((f.slot.id*17)%17)/100),skin:skinColours.get(f.skin)};}
  for(const b of banners){const team=options.penaltyCrowd?(options.penaltyCrowd==='equal'?b.neutralTeam:penaltySupporter({x:b.logo.getWorldPosition(new T.Vector3()).x,z:0})):(venue.host===null?b.neutralTeam:b.away?1-venue.host:venue.host);b.cloth.material.color.setHex(teams[team].primary);b.logo.material=crestMaterials[team];}
  for(const f of flags){f.team=options.penaltyCrowd?penaltySupporter(f.site):(venue.host===null?f.site.neutralTeam:f.site.away?1-venue.host:venue.host);f.cloth.material=flagMaterials[f.team];}
  crowdInfo={counts,total:fans.length,venue};scene.userData.crowd=crowdInfo;
 }

 const smokeCanvas=options.canvasFactory?options.canvasFactory(128,128):typeof document!=='undefined'?document.createElement('canvas'):null;let smokeTexture=null;
 if(smokeCanvas){smokeCanvas.width=128;smokeCanvas.height=128;const ctx=smokeCanvas.getContext('2d'),g=ctx.createRadialGradient(64,64,2,64,64,63);g.addColorStop(0,'#fff9');g.addColorStop(.4,'#fff7');g.addColorStop(1,'#fff0');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);smokeTexture=new T.CanvasTexture(smokeCanvas);smokeTexture.colorSpace=T.SRGBColorSpace;}
 let flareAnchorKey='';const flareAnchors=[[],[]];
 const flares=[],flareLights=[0,1].map(()=>{const light=new T.PointLight(0xff6b28,0,12,2);scene.add(light);return light;});
 for(let team=0;team<2;team++)for(let i=0;i<16;i++){
  const root=new T.Group();root.userData.animate=true;scene.add(root);cylinder(root,.025,.035,.22,0x354047,0,-.08,0);
  const core=sphere(root,.11,new T.MeshBasicMaterial({color:0xfff0b5}),0,.06,0),flame=sphere(root,.17,new T.MeshBasicMaterial({color:0xff6833,transparent:true,opacity:.8,depthWrite:false}),0,.13,0);flame.scale.set(.55,2.6,.55);
  const halo=mesh(geo('PlaneGeometry',1.35,1.35),new T.MeshBasicMaterial({color:0xff5525,map:smokeTexture,transparent:true,opacity:.65,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending}),root,0,.16,0);
  const smoke=Array.from({length:6},()=>{const p=new T.Object3D();p.visible=false;return p;});
  root.traverse(o=>{if(o.isMesh)o.userData.noBatch=true;});root.visible=false;flares.push({root,core,flame,halo,smoke,team,index:i,fan:null,active:false});
 }
 const smokeBatch=new T.InstancedMesh(geo('PlaneGeometry',1,1),new T.MeshBasicMaterial({color:0xc2b9b0,map:smokeTexture,transparent:true,opacity:.25,depthWrite:false,side:T.DoubleSide}),flares.length*6);smokeBatch.userData.noBatch=true;smokeBatch.frustumCulled=false;scene.add(smokeBatch);
 const effectDummy=new T.Object3D(),effectHidden=new T.Matrix4().makeScale(0,0,0),confetti=[0,1].map(team=>{const batch=new T.InstancedMesh(geo('PlaneGeometry',.22,.36),new T.MeshBasicMaterial({color:0xffffff,side:T.DoubleSide}),4096);batch.userData.noBatch=true;batch.frustumCulled=false;batch.visible=false;const palette=[teams[team].primary,teams[team].secondary,0xf6f2df,0xd1dbe0];for(let i=0;i<4096;i++)batch.setColorAt(i,new T.Color(palette[i%4]));scene.add(batch);return{team,batch,active:false,count:0};});
 let faceRuntime=null;const actors=[];for(let team=0;team<2;team++)for(let i=0;i<11;i++){const a=player(team,i,false,teams,options.lineups?.[team]?.players[i],options.canvasFactory);a.print.penaltyStudio=!!options.penaltyStudio;actors.push(a);scene.add(a.root);badge(a.waist,team,.075,.10,-.10,.42,.181);a.kitLegacy.push(a.waist.children.at(-1));kitRuntime.register(a);}
 const officials=[];for(let i=0;i<4;i++){const ref=options.fixture?.referee,identity={id:i===0&&ref?.id?'referee:'+ref.id:'generic-referee:'+i,name:i===0?(typeof ref==='string'?ref:ref?.name)||'Referee':['','Assistant referee 1','Assistant referee 2','Fourth official'][i],staffRole:i===0?'referee':i===3?'fourth-official':'assistant'};const a=player(0,i+1,true,teams,identity);{const head=a.head;const ear=sphere(head,.023,0x152129,.143,.008,0);ear.name='referee-earpiece';const boom=line(head,[[.144,.005,0],[.13,-.045,.12],[.052,-.053,.16]],0x152129);boom.name='referee-mic-boom';sphere(head,.012,0x111820,.052,-.053,.16).name='referee-microphone';}officials.push(a);scene.add(a.root);if(i===1||i===2){const flag=box(a.arms[1].elbow,.28,.24,.012,0xf4c240,.12,-.30,0);flag.rotation.z=.3;}}
 // Technical areas stay outside the touchline. Shared geometry is instanced with the stadium.
 const sidelines=[],stewards=[],benchRoster=teams.map(t=>({...t,kit:{...t.kit,shirt:t.kit.shirt,shorts:t.kit.shorts}}));
 function addSideline(team,index,kind,x,z,identity=null){
  if(kind!=='substitute'&&!identity)identity={id:'generic-'+kind+':'+team+':'+x+':'+z,name:kind,staffRole:kind};
  const a=player(team,kind==='substitute'&&identity?.roles?.includes('GK')?0:index,kind!=='substitute',kind==='substitute'?benchRoster:teams,identity,options.canvasFactory);a.root.userData.animate=true;a.root.position.set(x,0,z);scene.add(a.root);
  if(kind==='coach'){a.root.traverse(o=>{if(o.isMesh&&o.material?.color?.getHex()===0xd9ed53)o.material=mat(0x223341,.8);});}
  if(kind==='steward'){a.root.traverse(o=>{if(o.isMesh&&o.material?.color?.getHex()===0xd9ed53)o.material=mat(0xfb782c,.8);});box(a.waist,.37,.055,.022,0xe6edcc,0,.34,.15);box(a.waist,.37,.055,.022,0xe6edcc,0,.34,-.15);}
  kitRuntime.register(a);const item={actor:a,team,index,kind,base:{x,z}};sidelines.push(item);if(kind==='steward')stewards.push(item);return item;
 }
 for(let team=0;team<2;team++){
  const sign=team?1:-1,cx=sign*16.5;
  rect(stadium,cx-7,35,14,3.4);
  const shelter=new T.Group();shelter.position.set(cx,0,39);stadium.add(shelter);
  box(shelter,13,.20,.14,0x4b6470,0,1.02,1.35);box(shelter,13,.09,2.7,0x344c5a,0,.08,0);
  const canopy=mesh(geo('CylinderGeometry',1.5,1.5,12.6,18,1,true,0,Math.PI),new T.MeshStandardMaterial({color:0xabc8d0,roughness:.22,transparent:true,opacity:.14,depthWrite:false,side:T.DoubleSide}),shelter,0,1.0,0);canopy.rotation.z=Math.PI/2;canopy.userData.noBatch=true;
  for(const x of[-6.4,0,6.4])line(shelter,Array.from({length:25},(_,i)=>{const t=i*Math.PI/24;return[x,1.0+Math.sin(t)*1.52,Math.cos(t)*1.52];}),0x91a8ae);
  for(const side of[-1,1]){box(shelter,12.8,.42,.05,teams[team].primary,0,2.13,side*1.45);for(const x of[-4.3,0,4.3]){const mark=badge(shelter,team,.62,.74,x,2.14,side*1.49);if(side<0)mark.rotation.y=Math.PI;mark.userData.noBatch=true;}}

  const bench=options.lineups?.[team]?.bench,count=Array.isArray(bench)?Math.min(15,bench.length):7;
  for(let i=0;i<count;i++){
   const row=Math.floor(i/8),x=cx-5.25+(i%8)*1.5,z=38.3+row*1.2;box(stadium,.82,.13,.65,teams[team].primary,x,.58,z);box(stadium,.82,.80,.10,teams[team].primary,x,1.01,z+.35);
   const item=addSideline(team,12+i,'substitute',x,z,bench?.[i]);item.warmupSlot=i>=count-3?i-(count-3):null;
  }
  const manager=options.lineups?.[team]?.coach,coach=addSideline(team,22,'coach',cx,35.8,{id:'coach:'+teams[team].id,name:manager?.name||'Coach',staffRole:'manager'});coach.actor.root.scale.setScalar(1.10);badge(coach.actor.waist,team,.09,.12,-.10,.42,.181);box(coach.actor.waist,.025,.45,.014,teams[team].secondary,0,.30,.17);
 }
 // Outward-facing stewards are deliberately sparse, with the away corridor kept clear.
 for(const p of Layout.stewards)addSideline(0,24,'steward',p.x,p.z);
 for(const sign of[-1,1])for(const z of[-32.5,32.5]){const item=addSideline(0,30,'ballboy',sign*55.8,z);sphere(item.actor.arms[0].elbow,.11,0xf2eee1,0,-.24,.10);}
 const press=Press.create({scene,makeActor:i=>player(0,31+i,true,teams,{id:'generic-press:'+i,name:'Press '+(i+1),staffRole:'press'}),box,cylinder,sphere,mesh,geo,mat,armTarget,canvasFactory:options.canvasFactory});
 // Medical vehicles are omitted: no service tunnel exists outside the celebration routes.
 const ambulances=[];
 for(const a of actors){const mark=badge(a.waist,a.team,.09,.11,-.095,.39,.176);mark.userData.noBatch=true;if(options.neutralKeepers&&a.index===0)mark.visible=false;else a.kitLegacy.push(mark);}
 const refWhistle=cylinder(officials[0].arms[1].elbow,.028,.028,.055,0x161d24,0,-.265,.055);refWhistle.name='referee-whistle';refWhistle.visible=false;const ballGroup=new T.Group();scene.add(ballGroup);football(ballGroup);
 const trailGeometry=new T.BufferGeometry();trailGeometry.setAttribute('position',new T.Float32BufferAttribute(new Float32Array(15),3));const trail=new T.Line(trailGeometry,new T.LineBasicMaterial({color:0xfff9df,transparent:true,opacity:.12,depthWrite:false}));trail.frustumCulled=false;trail.visible=false;scene.add(trail);
 const ballShadow=mesh(geo('PlaneGeometry',.70,.70),new T.MeshBasicMaterial({color:0x07120e,map:lighting.shadowTexture,transparent:true,opacity:.52,depthWrite:false}),scene);ballShadow.rotation.x=-Math.PI/2;
 const contactShadows=ContactShadows.create(scene,lighting.shadowTexture);
 if(quality.shadows)for(const a of [...actors,...sidelines.map(s=>s.actor)])a.root.traverse(o=>{if(o.isMesh)o.castShadow=true;});
 // Static stadium parts and distant spectators are uploaded once; articulated near rows stay live.
 scene.updateMatrixWorld(true);
 for(const f of fans)if(f.body)f.root.traverse(o=>{if(o.isMesh)o.userData.crowdOwner=f.slot.id;});
 const groups=new Map();scene.traverse(o=>{if(o.isMesh&&!o.userData.noBatch){const key=o.geometry.uuid+o.material.uuid;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(o);}});
 const isStatic=o=>{for(let n=o;n&&n!==scene;n=n.parent){if(n.userData.animate)return false;if(n.userData.baked)return true;}return false;};
 const batches=[];let frozenParts=0;for(const originals of groups.values())if(originals.length>1){
  const batch=new T.InstancedMesh(originals[0].geometry,originals[0].material,originals.length);batch.frustumCulled=false;scene.add(batch);
  batch.castShadow=quality.shadows&&originals.some(o=>o.castShadow);batch.receiveShadow=quality.shadows&&originals.some(o=>o.receiveShadow);
  const sources=originals.map(o=>{o.userData.instancedSource=true;o.visible=false;if(!isStatic(o))return o;const packed={matrixWorld:o.matrixWorld.clone(),userData:{...o.userData},frozen:true,uploaded:false};o.removeFromParent();frozenParts++;return packed;});batches.push({batch,sources});
 }
 tinted.length=0;for(const f of distant){f.baseMatrix=f.root.matrixWorld.clone();f.root.removeFromParent();}
 const stadiumCustomization=StadiumCustomization.create({scene,stadium,teams,profile:stadiumProfile,canvasFactory:options.canvasFactory,quality:quality.id,lighting,adboards});
 const crowdLOD=CrowdLOD.create({fans,farBatches,scene,quality:quality.id,loadJSON:options.loadFaceJSON});
 const crowdImpostors=CrowdImpostors.create({scene,fans,teams,quality,loadTexture:options.loadCrowdTexture});
 const allVisualActors=[...actors,...sidelines.map(s=>s.actor)];
 if(quality.shadows){for(const a of allVisualActors)a.root.traverse(o=>{if(o.isMesh)o.castShadow=true;});for(const m of turfMeshes)m.receiveShadow=true;const key=lighting.lights[0];if(key){key.castShadow=true;key.shadow.mapSize.set(quality.shadowSize,quality.shadowSize);key.shadow.bias=-.0003;key.shadow.normalBias=.035;key.shadow.camera.near=4;key.shadow.camera.far=170;}}
 scene.userData.graphics={...quality};scene.userData.penaltyBowl={enabled:!!options.penaltyCrowd,crowd:options.penaltyCrowd||null,opaqueAwayDivider:!options.penaltyCrowd};
 let crowdBuffersFreed=false;const farByPose=Array.from({length:7},(_,pose)=>farBatches.filter(e=>e.pose===pose));
 scene.userData.performance={frozenParts,nearSpectators:fans.filter(f=>f.body).length,totalSpectators:fans.length,directCrowdInstances:distant.length,farBatches:farBatches.length};
 const fourthBoard=new T.Group();officials[3].root.add(fourthBoard);fourthBoard.position.set(0,2.04,.12);box(fourthBoard,.68,.34,.05,0x101b22);const addDigits=(parent,offset,color,segments)=>{const definitions={a:[0,.095,.10,.022],b:[.055,.048,.022,.082],c:[.055,-.048,.022,.082],d:[0,-.095,.10,.022],e:[-.055,-.048,.022,.082],f:[-.055,.048,.022,.082],g:[0,0,.10,.022]};for(const code of segments){const [x,y,w,h]=definitions[code];box(parent,w,h,.012,color,offset+x,y,.034);}};box(fourthBoard,.075,.022,.012,0x75e39a,-.23,0,.034);box(fourthBoard,.022,.075,.012,0x75e39a,-.23,0,.034);const fourDigit=new T.Group(),twoDigit=new T.Group();fourthBoard.add(fourDigit,twoDigit);addDigits(fourDigit,.09,0x75e39a,'fgbc');addDigits(twoDigit,.09,0x75e39a,'abged');fourthBoard.visible=false;
 const subBoardCanvas=options.canvasFactory?options.canvasFactory(256,128):typeof document!=='undefined'?document.createElement('canvas'):null;let subBoardTexture=null,subBoardKey='';if(subBoardCanvas){subBoardCanvas.width=256;subBoardCanvas.height=128;subBoardTexture=new T.CanvasTexture(subBoardCanvas);subBoardTexture.colorSpace=T.SRGBColorSpace;const panel=mesh(geo('PlaneGeometry',.65,.30),new T.MeshBasicMaterial({map:subBoardTexture,toneMapped:false}),fourthBoard,0,0,.045);panel.userData.noBatch=true;}
 const substitutionActors=[0,1].map(team=>[0,1].map(j=>{const a=player(team,j+1,false,teams,{id:'sub-scene-'+team+'-'+j,number:0},options.canvasFactory);a.root.visible=false;scene.add(a.root);return a;}));

 function updateJerseyDetail(){const near=actors.filter(a=>a.root.visible&&a.root.position.distanceTo(camera.position)<(options.penaltyStudio?30:15)).sort((a,b)=>a.root.position.distanceTo(camera.position)-b.root.position.distanceTo(camera.position)).slice(0,3),chosen=new Set(near);for(const a of actors){const size=chosen.has(a)?(options.penaltyStudio?1536:1024):512;if(!a.numberTexture||a.print.resolution===size)continue;a.print.resolution=size;Jersey.paint(a.numberTexture.image,a.root.userData.jerseyNumber,a.root.userData.shirtName,a.print);a.numberTexture.needsUpdate=true;}}
 function jersey(a,number,id,identity={}){const name=Jersey.shirtName(identity),value=number==null?'':String(number),visualKey=id+'|'+name+'|'+value+'|'+JSON.stringify(identity.appearance||null)+'|'+JSON.stringify(identity.physical||null);if(a.lastVisualIdentityKey===visualKey)return;a.lastVisualIdentityKey=visualKey;const visualIdentity=faceRuntime?.apply(a,{...identity,id})||{...identity,id};Physique.apply(a,visualIdentity);a.identity=visualIdentity;Characters.apply(a,a.identity);FullBody.apply(a);if(a.root.userData.playerId===id&&a.root.userData.jerseyNumber===value&&a.root.userData.shirtName===name)return;a.root.userData.playerId=id;a.root.userData.jerseyNumber=value;a.root.userData.shirtName=name;const texture=a.numberTexture,canvas=texture?.image;if(!canvas?.getContext)return;Jersey.paint(canvas,number,name,a.print);texture.needsUpdate=true;if(a.shortNumberTexture){Jersey.paintShort(a.shortNumberTexture.image,number,a.uniform,a.index===0);a.shortNumberTexture.needsUpdate=true;}}
 const yellowCard=box(officials[0].arms[1].elbow,.10,.14,.012,0xffdd42,0,-.28,0);yellowCard.visible=false;
 const offsideLine=line(scene,[[0,.08,-34],[0,.08,34]],0xf4c466);offsideLine.visible=false;
 const receiverLine=line(scene,[[0,.085,-34],[0,.085,34]],0xf66d67);receiverLine.visible=false;
 const receiverMark=mesh(geo('TorusGeometry',.65,.055,6,24),new T.MeshBasicMaterial({color:0xffc271,toneMapped:false}),scene);receiverMark.rotation.x=Math.PI/2;receiverMark.visible=false;
 const hiddenMatrix=new T.Matrix4().makeScale(0,0,0),crowdMatrix=new T.Matrix4();
 function fitCamera(aim,offset,points,minDistance,xLimit=.80,top=.48,bottom=.34){
  camera.userData.framingAim=aim.clone();
  const axis=offset.clone().normalize();camera.position.copy(aim).addScaledVector(axis,minDistance);camera.lookAt(aim);camera.updateMatrixWorld();
  const right=new T.Vector3().setFromMatrixColumn(camera.matrixWorld,0),up=new T.Vector3().setFromMatrixColumn(camera.matrixWorld,1),tan=Math.tan(camera.fov*Math.PI/360);let distance=minDistance;
  for(const p of points){const r=p.clone().sub(aim),depth=r.dot(axis),x=r.dot(right),y=r.dot(up);distance=Math.max(distance,depth+Math.abs(x)/(tan*camera.aspect*xLimit),depth+(y>=0?y/(tan*top):-y/(tan*bottom)));}
  camera.position.copy(aim).addScaledVector(axis,distance+.35);camera.lookAt(aim);camera.updateProjectionMatrix();camera.updateMatrixWorld();return distance;
 }

 const camera=new T.PerspectiveCamera(39,16/9,.1,1200),ceremonyDistances=new Map();
 // Broadcast cameras stay below the roof line and inside the occupied bowl.
 // Framing compensates with a bounded field of view instead of moving outside.
 function keepInterior(state,critical=[]){
  if(state.pregame?.ceremony){scene.userData.interiorCamera={active:false};return;}
  if(scene.userData.setPieceCamera?.critical)critical=[...critical,...scene.userData.setPieceCamera.critical];
  if(scene.userData.offsideCamera?.critical)critical=[...critical,...scene.userData.offsideCamera.critical];
  const aim=camera.userData.framingAim?.clone()||new T.Vector3(state.ball.x,.8,state.ball.z);
  camera.position.x=Math.max(-58.5,Math.min(58.5,camera.position.x));camera.position.z=Math.max(-44,Math.min(44,camera.position.z));camera.position.y=Math.min(22,camera.position.y);camera.lookAt(aim);camera.updateMatrixWorld();
  if(state.goalCelebration&&!state.review){const scorer=state.players.find(p=>p.goalScorer);if(scorer)critical=[...critical,[scorer.x,1.1,scorer.z]];}
  let tangent=Math.tan(camera.fov*Math.PI/360);const inverse=camera.matrixWorld.clone().invert();
  for(const value of critical){const p=new T.Vector3(...value).applyMatrix4(inverse),depth=-p.z;if(depth>.5)tangent=Math.max(tangent,Math.abs(p.x)/(depth*camera.aspect*.90),Math.abs(p.y)/(depth*.83));}
  camera.fov=Math.min(camera.aspect<.95?80:65,Math.max(camera.fov,Math.atan(tangent)*360/Math.PI));
  if(!scene.userData.setPieceCamera&&!state.offsideEvidence&&state.ruleReplay?.kind!=='offside'&&!state.refereeCut&&!state.goalCelebration&&!state.review&&!state.pregame&&state.ball){const ball=new T.Vector3(state.ball.x,state.ball.y,state.ball.z),screen=ball.clone().project(camera);if(Math.abs(screen.x)>.92||Math.abs(screen.y)>.92){const corrected=new T.Vector3(state.ball.x,.8,state.ball.z);camera.lookAt(corrected);camera.userData.framingAim=corrected;camera.updateMatrixWorld();}}scene.userData.interiorCamera={active:true,limitY:22,limitX:58.5,limitZ:44};
 }
 function positionCamera(state,aspect,view){scene.userData.attackCamera=null;scene.userData.offsideCamera=null;scene.userData.refereeCamera=null;scene.userData.setPieceCamera=null;
  camera.aspect=aspect;const narrow=aspect<.95;camera.fov=narrow?45:37;
  const wide=view==='wide'||state.phase==='kickoff'||state.phase==='intro'||state.phase==='lineup'||state.phase==='finished'||state.phase==='halftime',f=state.focus;
  if(state.phase==='endWhistle'){const ref=state.officials[0],age=state.endSequence.age,u=Math.max(0,Math.min(1,(age-.1)/1.7));camera.fov=narrow?42:35;camera.position.set(ref.x+(narrow?4:6)-u*.6,5.2-u*.7,ref.z+(narrow?13:15)-u);camera.lookAt(ref.x,1.0,ref.z);camera.userData.framingAim=new T.Vector3(ref.x,1,ref.z);
  }else if(state.pregame?.ceremony){camera.fov=narrow?62:48;const points=ceremony.cloths.flatMap(f=>[-1,1].flatMap(a=>[-1,1].map(b=>new T.Vector3(f.cx+a*(f.radius+.9),1.8,b*(f.radius+.9)))));points.push(...state.players.map(p=>new T.Vector3(p.x,2,p.z)));points.push(...state.officials.slice(0,3).map(p=>new T.Vector3(p.x,2,p.z)));for(const x of[-25,0,25])for(const z of[34.8,42.2])for(const y of[.05,3.0])points.push(new T.Vector3(x,y,z));const turn=Math.max(0,Math.min(1,((state.pregame.ceremonyAge||0)-(state.preMatchPlan?.extended?2:.12))/(state.preMatchPlan?.extended?1.65:1.15))),ease=turn*turn*turn*(turn*(turn*6-15)+10),angle=Math.PI*ease;const aim=new T.Vector3(0,.8,12),orbitKey=aspect.toFixed(5);if(!ceremonyDistances.has(orbitKey)){let distance=68;for(let i=0;i<=24;i++){const a=i*Math.PI/24;distance=Math.max(distance,fitCamera(aim,new T.Vector3(Math.sin(a),1.1,Math.cos(a)),points,68,.86,.70,.70));}ceremonyDistances.set(orbitKey,distance*1.035);}camera.position.copy(aim).addScaledVector(new T.Vector3(Math.sin(angle),1.1,Math.cos(angle)).normalize(),ceremonyDistances.get(orbitKey));camera.lookAt(aim);camera.userData.framingAim=aim;camera.updateMatrixWorld();scene.userData.ceremonyCamera={shared:true,includesTechnicalAreas:true,reverse:turn<1,settled:turn===1,turn,ease,aspect};
  }else if(state.refereeCut){const ref=state.officials[0],forward=new T.Vector3(Math.sin(ref.heading),0,Math.cos(ref.heading)),aim=new T.Vector3(ref.x,1.18,ref.z);camera.fov=narrow?43:36;camera.position.copy(aim).addScaledVector(forward,narrow?5.8:5.2);camera.position.y=2.45;camera.lookAt(aim);camera.userData.framingAim=aim;scene.userData.refereeCamera={pose:ref.pose};
  }else if(state.review?.monitor&&view!=='wide'){
   camera.fov=42;camera.position.set(5.6,3.2,29.8);camera.lookAt(0,1.2,35.3);camera.userData.framingAim=new T.Vector3(0,1.2,35.3);
  }else if((state.offsideEvidence||state.review?.reason==='offside'||state.ruleReplay?.kind==='offside')&&view!=='wide'){
   const snap=state.ruleReplay?.snapshot??state.chance.offsideSnapshot,receiver=state.players[snap.receiverId],defenders=state.players.filter(p=>p.team!==state.chance.team&&!p.dismissed).sort((a,b)=>b.x*state.dir-a.x*state.dir),lineDefender=defenders[1],x=snap.line*state.dir,rz=snap.receiver.z*state.dir*state.flank,points=[receiver,lineDefender].filter(Boolean).flatMap(p=>[new T.Vector3(p.x,0,p.z),new T.Vector3(p.x,2.25,p.z)]);points.push(new T.Vector3(snap.receiver.x*state.dir,1,rz));const z=points.reduce((n,p)=>n+p.z,0)/points.length,aim=new T.Vector3((snap.receiver.x*state.dir+x)/2,1,z);camera.fov=narrow?61:46;fitCamera(aim,new T.Vector3(0,.68,1),points,25,.77,.65,.58);scene.userData.offsideCamera={receiver:snap.receiverId,defender:lineDefender?.id,critical:points.map(p=>p.toArray())};
  }else if(state.chance.pattern==='corner'&&state.physicsTime<3.9&&!state.pregame&&!state.kickoff&&!state.celebration&&!state.review){
   const dir=state.dir,side=dir*state.flank,points=[new T.Vector3(36*dir,.05,-20),new T.Vector3(52.5*dir,2.3,20),new T.Vector3(52*dir,2.3,34.5*side),new T.Vector3(state.ball.x,state.ball.y,state.ball.z)],aim=new T.Vector3(44*dir,.8,11*side);camera.fov=narrow?67:48;fitCamera(aim,new T.Vector3(0,.75,-side),points,64,.83,.65,.62);scene.userData.setPieceCamera={kind:'corner',critical:points.map(p=>p.toArray())};
  }else if(state.chance.pullIncident&&view!=='wide'&&!state.pregame&&!state.review?.monitor&&((state.physicsTime>=1.7&&state.physicsTime<=3.6)||state.review?.reason==='foul')){
   const f=state.chance.pullIncident,a=state.players[f.actor],v=state.players[f.victim],aim=new T.Vector3((a.x+v.x)/2,.85,(a.z+v.z)/2),points=[a,v].flatMap(p=>[new T.Vector3(p.x,.05,p.z),new T.Vector3(p.x,2.15,p.z)]);points.push(new T.Vector3(state.ball.x,state.ball.y,state.ball.z));camera.fov=narrow?48:40;fitCamera(aim,new T.Vector3(-state.dir*.6,.55,state.dir*state.flank),points,9,.82,.65,.6);scene.userData.foulCamera={kind:'shirt_pull',actor:a.id,victim:v.id};
  }else if(state.celebration){
   const celebration=state.celebration,team=state.players.filter(p=>p.team===celebration.team&&!p.keeper),scorer=team.find(p=>p.id===celebration.scorer),group=celebration.stage==='group',solo=celebration.stage==='solo',sign=Math.sign(celebration.target.x),ownAway=state.venue.host!==null&&celebration.team!==state.venue.host;
   // Follow the scorer and arriving teammates, never pull back to fit players
   // still waiting across the pitch. Keep the shot among the pitchside crowd.
   const near=team.filter(p=>Math.hypot(p.x-scorer.x,p.z-scorer.z)<(group?10:8)).sort((a,b)=>Math.hypot(a.x-scorer.x,a.z-scorer.z)-Math.hypot(b.x-scorer.x,b.z-scorer.z)).slice(0,group?10:4),reveal=group?Math.min(1,celebration.groupAge/2.2):0;
   const target=celebration.target,normal=target.normal||{x:sign,z:0},tangent={x:-normal.z,z:normal.x};
   if(solo){camera.fov=narrow?49:43;camera.position.set(target.x+normal.x*3.6+tangent.x*(state.matchPresentation?.big?3.5+Math.sin(celebration.age*.65)*.6:3.5),2.1,target.z+normal.z*3.6+tangent.z*(state.matchPresentation?.big?3.5+Math.sin(celebration.age*.65)*.6:3.5));camera.lookAt(scorer.x,1.10,scorer.z);camera.userData.framingAim=new T.Vector3(scorer.x,1.10,scorer.z);}
   else{const aim=new T.Vector3(scorer.x-normal.x*(group?1.0:0),group?1.25:1.1,scorer.z-normal.z*(group?1.0:0));camera.fov=narrow?48:42;const offset=new T.Vector3(-normal.x*.95+tangent.x*.65,.65,-normal.z*.95+tangent.z*.65),bounds=near.flatMap(p=>[new T.Vector3(p.x,.05,p.z),new T.Vector3(p.x,2.15,p.z)]);fitCamera(aim,offset,bounds,group?15:17,.83,.66,.59);}
   camera.position.x=Math.max(-58.5,Math.min(58.5,camera.position.x));camera.position.z=Math.max(-38.5,Math.min(38.5,camera.position.z));camera.position.y=Math.min(18,camera.position.y);camera.lookAt(camera.userData.framingAim);
   // Blend from the live goal shot without a frame-history dependency. Seeking
   // and exported 30/60 FPS videos therefore use the same transition.
   const blendSeconds=.55,q=Math.min(1,celebration.age/(M.CELEBRATION_RATE*blendSeconds));
   if(q<1&&options.sampleCamera){const endPosition=camera.position.clone(),endAim=camera.userData.framingAim.clone(),endFov=camera.fov,previous=options.sampleCamera(Math.max(0,state.chance.start+state.chance.celebrationStart-.002));if(previous.chance===state.chance&&!previous.celebration){positionCamera(previous,aspect,view);const beginAim=camera.userData.framingAim?.clone()||new T.Vector3(scorer.x,1.1,scorer.z),u=q*q*(3-2*q);camera.position.lerp(endPosition,u);camera.fov+=(endFov-camera.fov)*u;camera.lookAt(beginAim.lerp(endAim,u));camera.userData.framingAim=beginAim;}}
   scene.userData.celebrationCamera={stage:celebration.stage,reveal,ownAway,scorer:scorer.id,big:!!state.matchPresentation?.big,framedPlayers:near.map(p=>p.id),interior:true};
  }else if(state.outOfPlay&&!wide&&!state.replay){
   // Show the crossed line and nearby perimeter, never chase a dead ball beyond the bowl.
   const exit=state.outOfPlay.exit,aim=new T.Vector3(Math.max(-52,Math.min(52,exit.x)),.6,Math.max(-34,Math.min(34,exit.z))),position=new T.Vector3(Math.max(-38,Math.min(38,exit.x*.65)),narrow?28:21,narrow?62:54),age=state.outOfPlay.age,q=Math.max(0,Math.min(1,age/.45)),u=q*q*(3-2*q);let from=null,look=null,fromFov=narrow?44:36;
   if(u<1&&options.sampleCamera){const previous=options.sampleCamera(Math.max(0,state.time-age-.002));if(previous.chance===state.chance&&!previous.outOfPlay){positionCamera(previous,aspect,view);from=camera.position.clone();look=camera.userData.framingAim?.clone();fromFov=camera.fov;}}
   camera.fov=fromFov+(narrow?44-fromFov:36-fromFov)*u;camera.position.copy(from?from.lerp(position,u):position);camera.lookAt(look?look.lerp(aim,u):aim);camera.userData.framingAim=aim.clone();scene.userData.outCamera={exit:{...exit},age};
  }else if(!wide&&state.resolution&&state.chance?.resolution&&Number.isFinite(state.chance.resolution.kickAt)&&['clearance','out'].includes(state.resolution.stage)&&state.physicsTime>(state.chance.resolution.start??M.BASE)&&state.physicsTime-(state.chance.resolution.start??M.BASE)>state.chance.resolution.kickAt+.4){
   // Follow the completed clearance over the line; no need to keep the distant goal in this shot.
   const b=state.ball,side=Math.sign(b.z)||1,aim=new T.Vector3(b.x,.7,(b.z+side*34)/2),points=[new T.Vector3(b.x,b.y,b.z),new T.Vector3(b.x-4,.05,side*34),new T.Vector3(b.x+4,.05,side*34)];let distance=26;camera.fov=narrow?44:36;
   fitCamera(aim,new T.Vector3(-state.dir*.65,.65,.75),points,28,.80,.47,.32);
  }else if(state.phase==='kickoff'){const age=state.kickoff.age,q=Math.max(0,Math.min(1,(age-.75)/1.65)),u=q*q*(3-2*q),aim=new T.Vector3(state.ball.x*u,.65*u,state.ball.z*u),near=[state.ball,...state.players.filter(p=>(age<1.6?[state.kickoff.taker,state.kickoff.receiver]:[state.kickoff.receiver,state.kickoff.secondReceiver]).includes(p.id))],points=state.players.flatMap(p=>[new T.Vector3(p.x*(1-u)+aim.x*u,0,p.z*(1-u)+aim.z*u),new T.Vector3(p.x*(1-u)+aim.x*u,2,p.z*(1-u)+aim.z*u)]);points.push(...near.map(p=>new T.Vector3(p.x,1.9,p.z)));camera.fov=(narrow?49:40)-u*3;fitCamera(aim,new T.Vector3(0,.9-u*.20,1),points,(narrow?88:76)*(1-u)+29*u,.86,.63,.60);}
  else if(['tactical','goal','keeper'].includes(view)&&!['intro','lineup','finished','halftime'].includes(state.phase)){
   const ball=state.ball,aim=new T.Vector3(ball.x,.8,ball.z);camera.fov=narrow?62:48;
   if(view==='tactical'){camera.position.set(Math.max(-38,Math.min(38,ball.x*.7)),21,40);camera.lookAt(aim);}
   else{const keeper=state.players.find(p=>p.keeper&&p.team!==state.chance.team),sign=Math.sign(keeper?.x||state.dir*52.5);camera.position.set(sign*(view==='keeper'?56.5:49),view==='keeper'?3.8:7.5,(view==='keeper'?10:25));camera.lookAt(aim);}
   camera.userData.framingAim=aim;
  }
  else if(wide){const follow=view==='wide'&&!['intro','lineup','finished','halftime'].includes(state.phase),x=follow?Math.max(-42,Math.min(42,state.focus.x)):0,z=follow?Math.max(-18,Math.min(18,state.focus.z)):0;camera.fov=narrow?76:58;camera.position.set(x,22,43);camera.lookAt(x,.8,z);camera.userData.framingAim=new T.Vector3(x,.8,z);}
  else{
   // Keep the broadcast on the same touchline in both halves (the 180-degree rule).
   // World +X must project right and world -X left, regardless of who attacks.
   const threshold=state.chance.pattern==='corner'?3.85:3.28,corner=state.chance.pattern==='corner',progress=state.preReview?0:Math.max(0,Math.min(1,(state.physicsTime-threshold+1.25)/1.20)),shotMix=progress*progress*(3-2*progress),shot=shotMix>.80||!!state.replay,striker=state.flowStage==='opponentBuildUp'?state.players[state.owner??state.chance.opening?.loser]:state.players[state.chance.team*11+(state.chance.finisher??9)],gx=state.dir*52.5;
   const recoveryQ=state.resolution?Math.max(0,Math.min(1,(state.physicsTime-M.IMPACT)/.85)):0,recovery=recoveryQ*recoveryQ*(3-2*recoveryQ);
   const ball=new T.Vector3(state.ball.x,state.ball.y,state.ball.z),points=[ball,new T.Vector3(ball.x+(striker.x-ball.x)*(1-recovery),1.9,ball.z+(striker.z-ball.z)*(1-recovery))];
   // Continuous influence avoids camera jumps when a player enters a distance threshold.
   for(const p of state.players){if(p.dismissed||p.keeper)continue;const d=Math.hypot(p.x-ball.x,p.z-ball.z),weight=Math.max(0,Math.min(1,(17-d)/9));points.push(new T.Vector3(ball.x+(p.x-ball.x)*weight,1.9,ball.z+(p.z-ball.z)*weight));}
   const goalWeight=(corner?1:shotMix)*(1-recovery);
   for(const z of[-3.95,3.95])points.push(new T.Vector3(ball.x+(gx-ball.x)*goalWeight,2.65*goalWeight,ball.z+(z-ball.z)*goalWeight));
   points.push(new T.Vector3(ball.x+(state.dir*54.8-ball.x)*goalWeight,2.6*goalWeight,ball.z+(-3.95-ball.z)*goalWeight));if(['post','wide'].includes(state.chance.result))points.push(new T.Vector3(ball.x+(state.dir*(state.chance.result==='wide'?57.5:48)-ball.x)*goalWeight,.8,ball.z+(state.chance.target*state.dir*state.flank-ball.z)*goalWeight));
   if(state.preReview)points.push(new T.Vector3(state.officials[0].x,1.6,state.officials[0].z));
   const aim=new T.Vector3((Math.min(...points.map(p=>p.x))+Math.max(...points.map(p=>p.x)))/2,.8,(Math.min(...points.map(p=>p.z))+Math.max(...points.map(p=>p.z)))/2);
   camera.fov=corner?48-shotMix*4:narrow?44-shotMix*2:37-shotMix;
   const distance=fitCamera(aim,new T.Vector3(0,corner?.85-shotMix*.15:narrow?.72-shotMix*.04:.62-shotMix*.03,corner?1:narrow?1.05:1.15),points,corner?40:28-shotMix,.78,.47,.32);
   scene.userData.attackCamera={distance,shotMix,goalWeight,critical:points.map(p=>p.toArray())};
  }
  keepInterior(state,scene.userData.attackCamera?.critical);camera.updateProjectionMatrix();camera.updateMatrixWorld();
 }
 const stabilizeCamera=C.create(options.sampleCamera,positionCamera,camera);
 const arenaArt=ArenaArt.create({scene,stadium,teams,quality,canvasFactory:options.canvasFactory,loadEnvironment:options.loadEnvironment,allowHDR:options.allowHDR});
 const enhancement=Enhance.create({scene,stadium,quality,actors,ball:ballGroup,lighting,canvasFactory:options.canvasFactory});
 const remaster=Remaster.create({scene,stadium,quality,lighting,actors,ball:ballGroup,canvasFactory:options.canvasFactory});
 function update(state,aspect=16/9,view='broadcast'){
  state=TrackedRuns.apply(state);
  const exteriorOpening=!!state.pregame?.ceremony;stadiumShell.group.visible=exteriorOpening;scene.userData.exteriorOpening=exteriorOpening;
  applyVenue(state.venue||M.venueConfig());stadiumCustomization.update(state,state.venue||M.venueConfig());stadiumExtras.update(state);adboards.update(state);ceremony.update(state);ballGroup.visible=!state.pregame?.ceremony;const showTime=state.phase==='finished'?(state.activeVideoDuration??state.duration-M.HOLD):(state.presentationTime??state.time),reaction=crowdReaction(state),lastGoal=reaction.goal,goalAge=reaction.age,supporting=!!state.goalCelebration,groupSync=state.celebration?.stage==='group',groupJump=Math.max(0,Math.sin((state.celebration?.beat||0)*9)),atmosphere=goalAtmosphere(state),energy=atmosphere.intensity,occasion=Presentation.reaction(state),big=occasion.big,miss=occasion.nearMiss;scene.userData.atmosphere={...atmosphere,...occasion};
  for(const f of fans){const delay=(f.slot.id*13%17)*.012+Math.floor(f.slot.id/32)%7*.025+Math.min(.55,Math.hypot(f.slot.x-state.dir*52.5,f.slot.z-(state.chance.target||0))/210),age=goalAge-delay,cheer=!!lastGoal&&age>=0&&(age<4.5+energy||supporting)&&lastGoal.team===f.team,conceded=!!lastGoal&&age>=0&&(age<4.5+energy||supporting)&&lastGoal.team!==f.team||!!miss&&miss.team===f.team,phase=showTime*(.75+(f.slot.id%5)*.08)+f.slot.id*1.71,wave=Math.sin(phase),burst=cheer?Math.sin(Math.min(1,age/.25)*Math.PI/2):0;
   const section=Math.floor(f.slot.id/32),threat=state.phase==='playing'&&state.chance.team===f.team&&state.physicsTime>1.6&&state.physicsTime<4.5,standing=cheer||threat||(f.slot.id*31%100)<(big?82:32)+14*Math.sin(showTime*.15+f.slot.id*.73),support=standing&&!cheer&&!conceded&&state.phase!=='finished';f.sway=conceded?0:support?Math.sin(showTime*3.8+section*.6)*.11:0;f.supportActive=support;f.choreography=support&&(state.phase==='intro'||state.phase==='kickoff'||occasion.chant||showTime%24<3.8);f.goalPose=cheer?1:0;f.reactionPose=conceded?(miss?'hands-head':f.variation===0?'hands-head':f.variation===1?'disappointed':'protest'):'none';f.displayPose=cheer?(f.variation===1?2:f.variation===3?3:1):conceded?(miss?4:f.variation===0?4:f.variation===1?0:5):support?(Math.floor(showTime*2.6+section*.38)%4<2?3:2):standing?0:6;f.hop=cheer?Math.max(0,Math.sin(age*10-(f.slot.row||0)*.30+section*.06))*(.25+energy*.14):occasion.chant&&support?Math.max(0,Math.sin(showTime*6.3+Math.floor(f.slot.id/280)*.28))*.10:0;const surge=cheer?Math.sin(Math.min(1,age/.38)*Math.PI/2)*(.16+energy*.05):0,norm=Math.hypot(f.slot.x,f.slot.z)||1;f.surgeX=-f.slot.x/norm*surge;f.surgeZ=-f.slot.z/norm*surge;f.reactionMix=(cheer||conceded)?Motion.smooth(0,.55,Math.max(0,age)):1;f.poseFrom=(f.slot.id*31%100)<(big?82:32)?0:6;f.cheering=cheer;f.threat=threat;if(support){const cycle=showTime*2.6+section*.38;f.reactionMix=Motion.smooth(0,.48,cycle-2*Math.floor(cycle/2));f.poseFrom=f.displayPose===3?2:3;}if(!f.body||crowdImpostors.active)continue;const rise=standing?1:0;f.body.position.y=-.25*(1-rise);for(const leg of f.legs){leg.rotation.x=-Math.PI/2*(1-rise);leg.userData.knee.rotation.x=Math.PI/2*(1-rise);}f.root.position.y=f.slot.y-.23+f.hop;f.root.position.x=f.slot.x+f.surgeX;f.root.position.z=f.slot.z+f.surgeZ;f.body.rotation.z=wave*(cheer?.065:support?.064:.007);f.body.rotation.x=conceded?.11:cheer?-.04:0;f.head.rotation.y=conceded?Math.sin(age*7+f.slot.id)*.28:Math.sin(phase*.6)*.12;f.head.rotation.x=cheer?-.1:conceded?.22:support?Math.sin(showTime*7+section)*.04:Math.sin(phase*.45)*.025;
   if(f.scarf){f.scarf.rotation.z=wave*(cheer?.24:support?.095:.025);f.scarf.position.y=1.13+burst*(.55+energy*.12)+(support?.52+Math.sin(showTime*4+section)*.12:0);}
   f.arms.forEach((a,k)=>{const clap=cheer&&f.variation===1;a.shoulder.rotation.x=cheer?f.scarf?-2.35:clap?-1.1:-2.45+Math.sin(age*8+k)*.15:support?(f.displayPose===3?-2.45+Math.sin(showTime*4+section)*.28:-.9+Math.sin(showTime*8+section)*.30):-.12+wave*.035;a.shoulder.rotation.z=(k?1:-1)*(clap?-.58+Math.sin(age*14)*.10:cheer?.25:support?-.32+Math.sin(showTime*4.8+section)*.14:.12);a.elbow.rotation.x=clap||support&&f.displayPose!==3?-1.05:cheer?-.28:-.4;});
   if(conceded){f.arms.forEach((a,k)=>{const head=f.reactionPose==='hands-head',protest=f.reactionPose==='protest';a.shoulder.rotation.x=head?-2.4:protest?-1.30+Math.sin(age*6+k)*.18:-.12;a.shoulder.rotation.z=(k?1:-1)*(head?.32:protest?.45:.10);a.elbow.rotation.x=head?-1.65:protest?-.65:-.35;});if(f.scarf)f.scarf.position.y=.85;}
  }
  for(let team=0;team<2;team++){
   const active=occasion.opening||!!lastGoal&&lastGoal.team===team&&goalAge>=0&&(goalAge<4.5+energy||supporting)&&state.phase!=='finished';
   const target=state.chance.celebration?.target||{x:state.dir*56.3,z:22},anchorKey=venueKey+'|'+(occasion.opening?'opening':lastGoal?.at);
   if(active&&flareAnchorKey!==anchorKey){for(let side=0;side<2;side++){const own=fans.filter(f=>f.team===side);if(!own.length){flareAnchors[side]=[];continue;}const nearest=own.slice().sort((a,b)=>Math.hypot(a.slot.x-target.x,a.slot.z-target.z)-Math.hypot(b.slot.x-target.x,b.slot.z-target.z)),chosen=[];for(const f of nearest){if(chosen.every(p=>Math.hypot(p.slot.x-f.slot.x,p.slot.z-f.slot.z)>2.7)){chosen.push(f);if(chosen.length===4)break;}}for(const sector of new Set(own.map(f=>f.slot.sector))){const section=own.filter(f=>f.slot.sector===sector);chosen.push(section[Math.floor(section.length/2)]);}for(let j=0;chosen.length<16;j++)chosen.push(own[Math.floor((j+.4)*own.length/12)%own.length]);flareAnchors[side]=chosen;}flareAnchorKey=anchorKey;}
   for(const e of flares.filter(e=>e.team===team)){e.fan=flareAnchors[team][e.index];e.active=active&&e.index<16&&!!e.fan;e.root.visible=e.active;if(!e.active){e.smoke.forEach(p=>p.visible=false);continue;}
    const slot=e.fan.slot,age=Math.max(0,(occasion.opening?showTime:goalAge)-e.index*.045),flicker=.88+Math.sin(showTime*29+e.index*2.1)*.12;e.root.position.set(slot.x+.24*Math.cos(slot.heading),slot.y+1.36,slot.z-.24*Math.sin(slot.heading));e.flame.scale.set(.8,3.3+energy*2.1,.8);e.flame.scale.multiplyScalar(flicker);e.halo.scale.setScalar(1.6+energy*.8);e.halo.material.opacity=.65*flicker;e.core.scale.setScalar(flicker*(1+energy*.35));
    e.smoke.forEach((p,j)=>{const delay=j*.24,born=age-delay;p.visible=born>=0;if(!p.visible)return;const cycle=born%3.5,u=cycle/3.5,spread=(.65+u*3.8)*(1+energy*.35);p.position.set(e.root.position.x+Math.sin(j*2+e.index)*u*.8+cycle*.25,e.root.position.y+.3+cycle*(1.5+energy*.3),e.root.position.z+Math.cos(j+e.index)*u*.7);p.scale.set(spread,spread,1);p.scale.multiplyScalar(Math.max(.01,Math.sin(Math.PI*u)));});
   }
   const lit=flares.find(e=>e.team===team&&e.active);flareLights[team].intensity=lit?3+energy*2.2:0;if(lit)flareLights[team].position.copy(lit.root.position);
  }
  for(const effect of confetti){const active=!!lastGoal&&lastGoal.team===effect.team&&goalAge>.12&&(goalAge<5.7+energy||supporting)&&state.phase!=='finished';effect.active=active;effect.batch.visible=active;effect.count=active?Math.min(4096,Math.round(2250+energy*1000)):0;if(!active)continue;const anchors=flareAnchors[effect.team].filter(f=>f?.slot);for(let i=0;i<4096;i++){if(i>=effect.count||!anchors.length){effect.batch.setMatrixAt(i,effectHidden);continue;}const fan=anchors[i%anchors.length],slot=fan.slot,t=Math.max(0,goalAge-.15-(i%19)*.028)%3.6,angle=i*2.39996,v=.65+(i%13)*.085,life=Math.max(0,1-t/3.6),norm=Math.hypot(slot.x,slot.z)||1,inwardX=-slot.x/norm,inwardZ=-slot.z/norm;effectDummy.position.set(slot.x+Math.cos(angle)*v*t+inwardX*t*1.4,slot.y+1.2+(6.2+energy*1.4+(i%7)*.12)*t-1.4*t*t,slot.z+Math.sin(angle)*v*t+inwardZ*t*1.4);const alive=effectDummy.position.y>slot.y*.65;effectDummy.scale.setScalar(alive?(.7+energy*.22)*Math.min(1,life*3):0);effectDummy.rotation.set(t*5+angle,t*3+angle,t*4);effectDummy.updateMatrix();effect.batch.setMatrixAt(i,effectDummy.matrix);}effect.batch.instanceMatrix.needsUpdate=true;}
  for(const f of flags){
   const age=goalAge,cheer=!!lastGoal&&age>=0&&(age<4.5+energy||supporting)&&lastGoal.team===f.team,envelope=cheer?Math.min(1,age/.4)*(.8+.2*Math.sin(age*2)):.30+.10*Math.sin(showTime*.7+f.phase),t=showTime*2.7+f.phase,wind=1+envelope*(.9+energy*.3)+(big?.65:0);
   f.logo.visible=!flagTextures[f.team];
   for(const [object,base]of [[f.cloth,f.base],[f.logo,f.logoBase]]){if(!object.visible)continue;const p=object.geometry.attributes.position;for(let i=0;i<p.count;i++){const x=base[i*3],y=base[i*3+1],u=(x+1.7)/3.4;p.setXYZ(i,x,y+Math.sin(t+u*3)*.085*u,Math.sin(t-u*5+y*.6)*.25*u*wind+(object===f.logo?.035:0));}p.needsUpdate=true;object.geometry.computeVertexNormals();}
   if(f.logo.material.map!==crestTextures[f.team]){f.logo.material.map=crestTextures[f.team];f.logo.material.opacity=crestTextures[f.team]?1:0;f.logo.material.needsUpdate=true;}
   // Fixed poles: waving only the cloth prevents it rotating into the rear
   // wall. Disable stale bounds on both deforming surfaces, keep depth tests.
   f.root.rotation.z=0;f.root.rotation.x=0;
  }
  for(const g of netGoals){
   const age=state.physicsTime-(state.chance.penaltyContact!=null?state.chance.penaltyContact+state.chance.penaltyFlight+(state.chance.penaltyNetContact?.time??.085):(state.chance.followUpGoal?(state.chance.goalImpact??M.IMPACT)+.17:state.chance.physicalShot?.netContactAt!=null?M.SHOT+state.chance.physicalShot.netContactAt:(state.chance.goalImpact??M.IMPACT)+.17)),hit=state.chance.result==='goal'&&g.userData.sign===state.dir&&age>=0&&age<2.5;if(!hit&&!g.userData.netActive)continue;g.userData.netActive=hit;
   const hitY=state.chance.penaltyNetContact?.point?.y??state.chance.penaltyTarget?.y??state.chance.physicalShot?.netPoint?.y??(state.chance.followUpGoal?.26:state.chance.finish==='chip'?1.6:state.chance.finish==='curl'?1.48:state.chance.finish==='driven'?.18:['cross','corner','overlapCross'].includes(state.chance.pattern)?.85:.40),hitZ=state.chance.penaltyNetContact?.point?.z??state.chance.penaltyTarget?.z??(state.chance.followUpGoal?state.chance.followUpTarget:state.chance.physicalShot?.netPoint?.z??state.chance.target)*state.dir*state.flank;
   for(const entry of g.userData.net){const {mesh,base,nodes,index,displaced}=entry,p=mesh.geometry.attributes.position,speed=state.chance.penaltyFlight?11.1/state.chance.penaltyFlight:(state.ballSpeed||24),hitX=state.chance.penaltyNetContact?.point?.x!=null?Math.abs(state.chance.penaltyNetContact.point.x)-52.5:2.1;
    for(let j=0;j<nodes.length;j++){const n=nodes[j],moved=hit?netResponse(n.x,n.y,n.z,hitY,hitZ,age,g.userData.sign,speed,hitX):n;displaced[j*3]=moved.x;displaced[j*3+1]=moved.y;displaced[j*3+2]=moved.z;}
    const values=p.array;for(let j=0;j<index.length;j++){const k=index[j]*3;values[j*3]=displaced[k];values[j*3+1]=displaced[k+1];values[j*3+2]=displaced[k+2];}p.needsUpdate=true;
   }
  }

  const poseActor=(a,p,official=false)=>{
   if(p.kicking&&!p.kickFoot)p={...p,kickFoot:Feet.resolve(p).foot};if(p.kicking&&!p.headingBall&&!p.strikePoint&&p.kickPhase*.52-.22<.025&&state.ball)p={...p,strikePoint:{...state.ball}};
   a.root.position.set(p.x,0,p.z);a.root.rotation.y=p.heading;
   const presentation=!official&&(state.phase==='intro'||p.ceremony),speed=presentation?0:p.speed||0,strength=Math.min(1,speed/5.8),gait=p.gait||0;
   a.waist.position.x=0;a.waist.position.y=.885+Math.abs(Math.sin(gait))*strength*.025;a.waist.rotation.set(0,0,0);a.body.rotation.set(0,0,0);a.body.position.set(0,0,0);a.head.rotation.y=p.lookAngle||0;a.head.rotation.x=0;a.head.rotation.z=0;
   for(let k=0;k<2;k++){
    const sign=k===0?1:-1,l=a.legs[k],arm=a.arms[k],phase=gait+(k?Math.PI:0),forward=Math.sin(phase)*.28*strength*(p.backpedal?-.6:1),lift=Math.max(0,Math.cos(phase))*(p.backpedal?.10:.18)*strength,dy=a.waist.position.y-.15-(.065+lift),r=Math.min(.716,Math.hypot(dy,forward)),alpha=Math.acos(Math.max(-1,Math.min(1,(.37*.37+r*r-.35*.35)/(2*.37*r)))),theta=Math.atan2(-forward,dy);
    l.hip.rotation.set(theta-alpha,0,0);l.knee.rotation.set(Math.PI-Math.acos(Math.max(-1,Math.min(1,(.37*.37+.35*.35-r*r)/(2*.37*.35)))),0,0);l.boot.rotation.set(-(l.hip.rotation.x+l.knee.rotation.x),0,0);
    arm.shoulder.rotation.set(-Math.sin(phase)*.45*strength,0,sign*-.13);arm.elbow.rotation.set(-.48-.15*strength,0,0);
   }
   a.waist.rotation.y=Math.sin(gait)*.045*strength;a.body.rotation.x=.09*strength;a.body.rotation.z=p.bodyLean||0;if(!p.celebrate&&!p.dive){a.waist.position.y+=Math.sin(showTime*3.5+a.index*.7)*.006*(1-strength);a.head.rotation.x=-.025*strength;}if(!official){FootballClips.locomotion(a,p,state);Athlete.apply(a,p,state);}if(p.receiving){const pose=Motion.begin(a,'receive');const receiveFoot=p.kickFoot==='left'?1:0;a.legs[receiveFoot].hip.rotation.x=-.20;a.legs[receiveFoot].boot.rotation.z=receiveFoot?-.14:.14;a.head.rotation.x=.12;a.waist.rotation.y-=.07;a.arms.forEach((arm,k)=>{arm.shoulder.rotation.x=-.2;arm.shoulder.rotation.z=(k?1:-1)*.24;});Motion.blend(pose,Motion.receiveWeight(p,state));}else a.legs[1].boot.rotation.z=0;if(p.pressing){const w=p.pressWeight??1;a.waist.position.y-=.035*w;a.arms.forEach((arm,k)=>arm.shoulder.rotation.z+=( (k?1:-1)*.35-arm.shoulder.rotation.z)*w);}
   if(presentation){const phase=showTime*.85+a.index*.73+a.team*1.9,shift=Math.sin(phase)*.007;a.waist.position.x=shift;a.head.rotation.y=(p.lookAngle||0)+Math.sin(phase*.72)*.055;a.head.rotation.x=Math.sin(phase*.6)*.012;a.arms.forEach((arm,k)=>{arm.shoulder.rotation.set(-.055+Math.sin(phase+k*.4)*.018,0,(k?1:-1)*.11);arm.elbow.rotation.set(-.18-Math.sin(phase*.8+k*.3)*.035,0,0);});a.legs.forEach(l=>{l.hip.rotation.z=-shift/.69;l.boot.rotation.z=shift/.69;});a.root.userData.presentationPose='relaxed';}else a.root.userData.presentationPose=null;
   if(p.askPass&&!p.kicking&&!p.receiving){const pose=Motion.begin(a,'askPass');a.arms[0].shoulder.rotation.x=-2.35;a.arms[0].shoulder.rotation.z=-.18;a.arms[0].elbow.rotation.x=-.22;Motion.blend(pose,p.askPassWeight??1);}if(p.scan)a.head.rotation.y=p.scan;
   if(p.organize){const pose=Motion.begin(a,'organize');a.arms[1].shoulder.rotation.x=-1.4;a.arms[1].shoulder.rotation.z=.65;a.arms[1].elbow.rotation.x=-.18;Motion.blend(pose,p.organizeWeight??1);}
   if(p.balance){a.waist.rotation.z+=p.balance;a.arms.forEach((arm,k)=>arm.shoulder.rotation.z=(k?1:-1)*(.3+p.balance));}
   if(p.missed&&!p.celebrate){const q=p.missed;a.head.rotation.x=-.22*q;a.arms.forEach((arm,k)=>{arm.shoulder.rotation.x=-2*q;arm.shoulder.rotation.z=(k?1:-1)*.20*q;arm.elbow.rotation.x=-1.7*q;});}
   if(p.kicking){const pose=Motion.begin(a,'kick'),q=p.kickPhase,contact=.22/.52,u=Math.max(0,Math.min(1,(q-contact)/(1-contact))),swing=q<contact?.48-1.30*(q/contact)**2*(3-2*q/contact):-.82-.4*Math.sin(u*Math.PI)+.82*u*u*(3-2*u);a.legs[1].hip.rotation.x=swing;a.legs[1].knee.rotation.x=q<contact?.65*(1-q/contact):.08;a.legs[1].boot.rotation.x=q<contact?-.22:.14;a.legs[0].hip.rotation.x=-.10;a.arms[0].shoulder.rotation.z=.45*Math.sin(q*Math.PI);a.arms[1].shoulder.rotation.x=-.6*Math.sin(q*Math.PI);a.waist.rotation.y=-.30*Math.sin(q*Math.PI);a.waist.rotation.z=-.045*Math.sin(q*Math.PI);a.legs[0].knee.rotation.x=.18+.10*Math.sin(q*Math.PI);a.head.rotation.x=-.08*Math.sin(q*Math.PI);a.body.rotation.x=p.finish==='volley'?-.12:.10;Motion.blend(pose,Motion.kickWeight(p));}
   if(!official)FootballClips.action(a,p,state);if(p.kicking&&p.kickFoot!=='left'){for(const key of ['hip','knee','boot']){const q=a.legs[0][key].quaternion.clone();a.legs[0][key].quaternion.copy(a.legs[1][key].quaternion);a.legs[1][key].quaternion.copy(q);}a.waist.rotation.y*=-1;a.waist.rotation.z*=-1;}
   if(p.headingBall){a.body.position.y=p.jump||0;a.body.rotation.x=.25*Math.sin((state.physicsTime-M.SHOT)*7)-.08;a.head.rotation.x=-.18;}if(!official)FootballClips.heading?.(a,p,state);if(p.wallSet){a.arms.forEach(arm=>{arm.shoulder.rotation.x=-.30;arm.elbow.rotation.x=-1.35;});a.legs.forEach(leg=>leg.knee.rotation.x=.10);}if(p.wallJump){a.body.position.y=p.wallJump;a.arms.forEach(arm=>{arm.shoulder.rotation.x=-.4;arm.elbow.rotation.x=-1.1;});}if(p.aerialContest){a.body.position.y=p.aerialContest;a.arms.forEach((arm,k)=>arm.shoulder.rotation.z=(k?1:-1)*.7);}
   if(p.celebrate){
    const age=p.celebrationTime,style=a.index%3;
    if(p.celebrationStage==='run'||p.celebrationStage==='solo'&&!p.goalScorer){if(p.goalScorer){a.arms[1].shoulder.rotation.x=-1.35+Math.sin(age*5)*.16;a.arms[1].elbow.rotation.x=-1.0;a.arms[0].elbow.rotation.x=-.7;a.head.rotation.y=Math.sin(age*3)*.18;}a.head.rotation.y*=.35;}
    else{const group=p.celebrationStage==='group',beat=Math.max(0,Math.sin((state.celebration?.beat??age)*9));a.head.rotation.y=Math.sin(age*2+a.index)*.16;
     a.arms.forEach((arm,k)=>{arm.shoulder.rotation.z=(k===0?-1:1)*(group&&!p.goalScorer?1.25:style===1?.35:1.45);arm.shoulder.rotation.x=group&&!p.goalScorer?-.12:style===1?-1.15:style===0&&k===1?-2.25+.22*Math.sin(age*11):-.2;arm.elbow.rotation.x=group&&!p.goalScorer?-.45:style===1?-.85-.24*Math.sin(age*13+k*.4):style===0&&k===1?-1.1:-.3;});
     a.body.position.y=group?beat*.15:Math.max(0,Math.sin(age*5+a.index*.37))*.055;a.waist.rotation.y=group?Math.sin(age*4)*.035:Math.sin(age*4+a.index)*.08;if(group)a.legs.forEach(l=>{l.hip.rotation.x=-.08;l.knee.rotation.x=.16*(1-beat);l.boot.rotation.x=-.08;});
    }
   }
   if(p.celebrate&&p.goalScorer){const style=p.celebrationStyle,age=p.celebrationTime,group=p.celebrationStage==='group';
    if(style==='kneeSlide'&&['run','solo'].includes(p.celebrationStage)&&age>p.celebrationSlideEnd-1.8&&age<p.celebrationSlideEnd+.8){const t=age-(p.celebrationSlideEnd-1.8),u=Math.min(1,t/.45)*(1-Math.min(1,Math.max(0,t-1.8)/.8));a.waist.position.y-=.55*u;a.body.rotation.x=-.22*u;a.legs.forEach(l=>{l.hip.rotation.x=-.35*u;l.knee.rotation.x=1.9*u;l.boot.rotation.x=-.35*u;});a.arms.forEach((arm,k)=>{arm.shoulder.rotation.z=(k?1:-1)*1.12;arm.shoulder.rotation.x=-.2;});}

    if(style==='bow'){a.body.rotation.x=.6*Math.max(0,Math.sin(age*2));a.arms.forEach(arm=>{arm.shoulder.rotation.x=-.2;arm.elbow.rotation.x=-.4;});}
    if((style==='dance'||style==='packDance')&&p.celebrationStage!=='run'){a.waist.rotation.y=Math.sin(age*8)*.38;a.body.position.y=Math.abs(Math.sin(age*8))*.12;a.arms.forEach((arm,k)=>{arm.shoulder.rotation.x=-.7+Math.sin(age*8+k*Math.PI)*.5;arm.elbow.rotation.x=-1.4;});}
    if(style==='packDance'&&p.celebrationStage!=='run'){a.body.position.y=0;a.waist.rotation.y*=.45;}
    if(style==='earCup'){a.arms[1].shoulder.rotation.x=-.5;a.arms[1].shoulder.rotation.z=.8;a.arms[1].elbow.rotation.x=-2.5;a.head.rotation.y=.3;}
    if(style==='skyPoint'){a.arms.forEach((arm,k)=>{arm.shoulder.rotation.x=-2.9;arm.shoulder.rotation.z=(k?1:-1)*.12;arm.elbow.rotation.x=-.05;});a.head.rotation.x=-.35;}
    if(style==='spin'&&p.celebrationStage==='solo')a.waist.rotation.y=age*5;
    if(style==='powerStance'){a.waist.position.y-=.12;a.arms.forEach((arm,k)=>{arm.shoulder.rotation.z=(k?1:-1)*.5;arm.elbow.rotation.x=-1.3;});a.head.rotation.x=-.15;}
    if(style==='kneeFist'&&p.celebrationStage==='solo'){a.waist.position.y-=.5;a.legs.forEach(l=>{l.hip.rotation.x=-.4;l.knee.rotation.x=1.9;});a.arms[1].shoulder.rotation.x=-1.8+Math.sin(age*10)*.35;a.arms[1].elbow.rotation.x=-1.4;}
    if(style==='crowdConductor'){a.arms.forEach((arm,k)=>{arm.shoulder.rotation.x=-1.6+Math.sin(age*7)*.8;arm.shoulder.rotation.z=(k?1:-1)*.7;arm.elbow.rotation.x=-.4;});}
    if(style==='fistPump'){a.arms[1].shoulder.rotation.x=-1.8+Math.sin(age*12)*.42;a.arms[1].elbow.rotation.x=-1.25;a.body.rotation.z=Math.sin(age*6)*.05;}
    if(style==='pointToCrowd'){a.arms[1].shoulder.rotation.x=-1.55;a.arms[1].elbow.rotation.x=-.06;a.head.rotation.y=.24;}
    if(style==='armsWide'&&!group)a.arms.forEach((arm,k)=>{arm.shoulder.rotation.z=(k?1:-1)*1.35;arm.shoulder.rotation.x=-.2;arm.elbow.rotation.x=-.15;});
    if(style==='heart'){a.arms.forEach((arm,k)=>{arm.shoulder.rotation.x=-.85;arm.shoulder.rotation.z=(k?1:-1)*-.45;arm.elbow.rotation.x=-1.5;});a.head.rotation.x=.10;}
    if(style==='salute'){a.arms[1].shoulder.rotation.x=-1.2;a.arms[1].shoulder.rotation.z=.45;a.arms[1].elbow.rotation.x=-1.8;}
    if(style==='kneelPoint'&&['solo','group'].includes(p.celebrationStage)){const u=Math.min(1,(p.celebrationStage==='solo'?Math.max(0,age-p.celebrationSlideEnd+1.4):state.celebration?.groupAge||0)*3);a.waist.position.y-=.48*u;a.legs[0].knee.rotation.x=1.9*u;a.legs[0].hip.rotation.x=-.35*u;a.arms[1].shoulder.rotation.x=-2.8*u;a.arms[1].elbow.rotation.x=-.15;}
    if((style==='doublePump'||style==='packCheer')&&p.celebrationStage!=='run'){const pump=Math.sin(age*9+(p.celebrationVariant||0));a.arms.forEach(arm=>{arm.shoulder.rotation.x=-1.25+pump*.26;arm.elbow.rotation.x=-1.7;});}
    if(style==='badgeKiss'){a.arms[0].shoulder.rotation.x=-.85;a.arms[0].elbow.rotation.x=-1.9;a.head.rotation.x=.28;}
    if(style==='airplane'&&!group){a.arms.forEach((arm,k)=>{arm.shoulder.rotation.z=(k?1:-1)*1.57;arm.elbow.rotation.x=-.06;});a.body.rotation.z=Math.sin(age*2.4)*.14;}
    if(style==='clapCrowd'){a.arms.forEach((arm,k)=>{arm.shoulder.rotation.x=-2.35;arm.shoulder.rotation.z=(k?1:-1)*(.2+Math.sin(age*12)*.1);arm.elbow.rotation.x=-.7;});}
    if(style==='leapPunch'&&['solo','group'].includes(p.celebrationStage)){const jump=Math.max(0,Math.sin((state.celebration?.beat||0)*8));a.body.position.y+=jump*.28;a.arms[1].shoulder.rotation.x=-2.4;a.arms[1].elbow.rotation.x=-.45;}
   }
   if(p.celebrate&&p.goalScorer&&!p.photoPose){const style=p.celebrationStyle,age=p.celebrationTime;let kneel=0;
    if(style==='kneeSlide'&&['run','solo'].includes(p.celebrationStage)&&age>p.celebrationSlideEnd-1.8&&age<p.celebrationSlideEnd+.8){const t=age-(p.celebrationSlideEnd-1.8);kneel=Math.min(1,t/.45)*(1-Math.min(1,Math.max(0,t-1.8)/.8));}
    if(style==='kneeFist'&&p.celebrationStage==='solo')kneel=1;
    if(style==='kneelPoint'&&['solo','group'].includes(p.celebrationStage))kneel=Math.min(1,(p.celebrationStage==='solo'?Math.max(0,age-p.celebrationSlideEnd+1.4):state.celebration?.groupAge||0)*3);
    if(kneel>0){a.waist.position.y=.923+(.52-.923)*kneel;for(const l of a.legs){l.hip.rotation.x=l.hip.rotation.x*(1-kneel)-.55*kneel;l.knee.rotation.x=l.knee.rotation.x*(1-kneel)+(Math.PI/2+.55)*kneel;l.boot.rotation.x=-l.hip.rotation.x-l.knee.rotation.x;}}
   }
   if(p.celebrate&&p.celebrationStage==='group'&&!p.goalScorer){const variant=((state.chance.celebrationVariant||0)+a.index)%6,beat=state.celebration?.beat||0;
    if(variant===0){a.arms.forEach((arm,k)=>{arm.shoulder.rotation.x=-.7;arm.shoulder.rotation.z=(k?1:-1)*.6;arm.elbow.rotation.x=-1.0;});a.waist.rotation.y=Math.sin(beat*4+a.index)*.12;}
    if(variant===1){a.arms[a.index%2].shoulder.rotation.x=-2.7;a.arms[a.index%2].elbow.rotation.x=-.15;a.body.position.y=Math.max(0,Math.sin(beat*8+a.index*.3))*.13;}
    if(variant===2){a.arms.forEach((arm,k)=>{arm.shoulder.rotation.x=-1.2;arm.shoulder.rotation.z=(k?1:-1)*(-.3+Math.sin(beat*12)*.10);arm.elbow.rotation.x=-1.25;});}
    if(variant===4){a.waist.rotation.y=Math.sin(beat*5+a.index)*.18;a.arms.forEach((arm,k)=>{arm.shoulder.rotation.z=(k?1:-1)*1.5;arm.elbow.rotation.x=-.2;});}
    if(variant===5){a.arms.forEach(arm=>{arm.shoulder.rotation.x=-2.8;arm.elbow.rotation.x=-.1;});a.body.position.y=Math.max(0,Math.sin(beat*7+a.index*.16))*.25;}
    if(variant===3){a.arms.forEach(arm=>{arm.shoulder.rotation.x=-1.4+Math.sin(beat*9+a.index*.2)*.3;arm.elbow.rotation.x=-1.5;});a.body.position.y=Math.max(0,Math.sin(beat*9))*.20;}
   }
   if(state.matchPresentation?.big&&p.celebrate&&p.celebrationStage==='group'&&!p.goalScorer)a.body.position.y*=1.3;
   if(p.keeper&&!p.dive&&!p.celebrate&&p.speed>.1){a.body.rotation.x=.06;a.arms.forEach((arm,k)=>{arm.shoulder.rotation.z=(k?1:-1)*.32;arm.elbow.rotation.x=-.65;});}if(p.keeperSet){const pose=Motion.begin(a,'keeperReady');a.waist.position.y-=.065;a.legs.forEach(l=>{l.hip.rotation.x=-.24;l.knee.rotation.x=.48;});a.arms.forEach((arm,k)=>{arm.shoulder.rotation.z=(k?1:-1)*.48;arm.elbow.rotation.x=-.7;});Motion.blend(pose,Motion.readyWeight(p,state));}if(p.dive){const q=p.dive;const full=['fullStretch','parryWide','tipOver','reflex'].includes(p.saveStyle);a.legs.forEach((l,k)=>{l.hip.rotation.x=(k?-.3:.25)*q;l.knee.rotation.x=(full?.2:.65)*q;l.boot.rotation.x=-.12*q;});const smother=p.saveStyle==='smother';a.body.rotation.z=-p.diveSide*q*(smother?.38:1.42);a.body.position.y=smother?-.16*q:.12*q+Math.sin(q*Math.PI)*.30+(1-Math.cos(1.42*q))*.34;a.head.rotation.z=p.diveSide*q*.32;a.arms.forEach(arm=>{arm.shoulder.rotation.x=-1.9*q;arm.elbow.rotation.x=-.08;});}
   if(p.penaltyDive&&p.dive){a.body.position.y+=p.diveLift||0;}if(p.dive&&p.saveStyle==='tipOver'){a.body.rotation.z*=.45;a.body.position.y+=Math.sin(p.dive*Math.PI)*.30;a.arms[1].shoulder.rotation.x=-2.7*p.dive;}if(p.dive&&p.saveStyle==='foot'){a.body.rotation.z*=.30;a.waist.position.y-=.14*p.dive;a.legs[1].hip.rotation.z=.7*p.dive;a.legs[1].knee.rotation.x=.08;}
   if(!official){FootballClips.goalkeeper(a,p,state);Motion.keeperRecovery(a,p,state);}
   const hold=Motion.holdWeight(p,state);if(hold){const pose=Motion.begin(a,'keeperHold');a.body.rotation.z=0;a.body.position.y=-.08;a.legs.forEach(l=>{l.hip.rotation.x=-.18;l.knee.rotation.x=.36;});Motion.blend(pose,hold);}
   if(!official)Athlete.action(a,p,state);
   if(Motion.keeperSignal(p,state))Motion.keeperReach(a,p,state,{distance:FullBody.gloveDistance});else delete a.root.userData.keeperContact;if(p.disappointed){a.body.rotation.x=.16;a.arms.forEach(arm=>arm.shoulder.rotation.x=-.15);}
   if(p.blocking&&!p.fall){const q=p.blocking;a.waist.position.y-=.13*q;a.body.rotation.x=.12*q;a.legs.forEach((l,k)=>{l.hip.rotation.z=(k?1:-1)*.26*q;l.hip.rotation.x=-.25*q;l.knee.rotation.x=.50*q;});a.arms.forEach((arm,k)=>{arm.shoulder.rotation.z=(k?1:-1)*.20*q;arm.shoulder.rotation.x=-.35*q;arm.elbow.rotation.x=-.85*q;});}
   if(p.fall){const q=p.fall,roll=Math.sin(Math.min(1,(p.fallAge||0)/.75)*Math.PI)*.10;a.body.rotation.set(p.fallDirection==='backward'?-1.42*q:p.fallDirection==='forward'?1.32*q:.16*q,0,p.fallDirection==='backward'?.10*q:p.fallDirection==='forward'?-.12*q:-1.48*q-roll);a.body.position.y=0;a.head.rotation.set(-.12*q,0,.18*q);a.legs.forEach((l,k)=>{l.hip.rotation.x=(k?-.38:.18)*q;l.knee.rotation.x=(k?.86:.44)*q;l.boot.rotation.x=-.16*q;});a.arms.forEach((arm,k)=>{arm.shoulder.rotation.x=-(k?.90:1.15)*q;arm.shoulder.rotation.z=(k?.25:-.35)*q;arm.elbow.rotation.x=-.75*q;});}
   if(!official)FootballClips.defence?.(a,p,state);
   if(p.fall){a.root.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(a.root);a.body.position.y+=.025-bounds.min.y;}if(p.push){a.arms[1].shoulder.rotation.x=-1.5*p.push;a.arms[1].elbow.rotation.x=-.2;}
   if(p.tackle){a.body.position.y-=.48*p.tackle;a.body.rotation.x=.55*p.tackle;a.body.rotation.z=-.42*p.tackle;a.legs[0].hip.rotation.x=-1.3*p.tackle;a.legs[0].knee.rotation.x=.15*p.tackle;a.legs[1].hip.rotation.x=.6*p.tackle;a.legs[1].knee.rotation.x=1.1*p.tackle;a.arms[0].shoulder.rotation.x=-.8*p.tackle;}
   if(!official&&p.endReaction){const q=Math.min(1,(p.endReactionAge||0)/.6);if(p.endReaction==='headDown'){a.head.rotation.x=.65*q;a.waist.rotation.x=.08*q;}if(p.endReaction==='handsOnHips')a.arms.forEach((arm,k)=>{arm.shoulder.rotation.z=(k?1:-1)*.5*q;arm.elbow.rotation.x=-1.1*q;});if(p.endReaction==='headInHands'){a.head.rotation.x=.25*q;a.arms.forEach((arm,k)=>{arm.shoulder.rotation.x=-1.7*q;arm.shoulder.rotation.z=(k?1:-1)*.2*q;arm.elbow.rotation.x=-1.7*q;});}if(p.endReaction==='crouch'){a.waist.position.y-=.28*q;a.body.rotation.x=.35*q;a.head.rotation.x=.3*q;a.legs.forEach(l=>{l.hip.rotation.x=-.55*q;l.knee.rotation.x=1.05*q;});}}
   if(official){
    if(p.pose==='endWhistle'){const whistleArm=a.arms[1],neutralShoulder=whistleArm.shoulder.quaternion.clone(),neutralElbow=whistleArm.elbow.quaternion.clone(),whistleProgress=Math.max(0,Math.min(1,p.whistleProgress??(p.whistling?1:0)));const bend=p.collectBall||0,signal=p.signal||0;a.waist.rotation.x=bend*.9;a.waist.position.y-=bend*.15;a.legs.forEach(l=>l.hip.rotation.x-=bend*.9);a.arms[0].shoulder.rotation.x=-.80*(p.holdBall||0);a.arms[0].elbow.rotation.x=-1.85*(p.holdBall||0);a.arms[0].shoulder.rotation.z=-.06;if(whistleProgress>0){a.arms[1].shoulder.rotation.x=-1.1;a.arms[1].shoulder.rotation.z=.2;a.arms[1].elbow.rotation.x=-2.45;}else{a.arms[1].shoulder.rotation.x=-(p.endKind==='full'?2.2:1.40)*signal;a.arms[1].shoulder.rotation.z=(p.endKind==='full'?.6:-.9)*signal;a.arms[1].elbow.rotation.x=-.15;}if(p.holdBall>.55)armTarget(a,0,[-.24,.10,.25]);if(whistleProgress>0){armTarget(a,1,[.045,.755,.135]);const targetShoulder=whistleArm.shoulder.quaternion.clone(),targetElbow=whistleArm.elbow.quaternion.clone();whistleArm.shoulder.quaternion.slerpQuaternions(neutralShoulder,targetShoulder,whistleProgress);whistleArm.elbow.quaternion.slerpQuaternions(neutralElbow,targetElbow,whistleProgress);a.root.userData.whistleProgress=whistleProgress;}a.head.rotation.x=-bend*.22;}
    if(['review','monitor'].includes(p.pose)){armTarget(a,1,[.16,.79,.025]);a.head.rotation.z=-.06;}
    if(p.pose==='screenSignal'){const u=Math.max(0,Math.min(1,p.signalProgress??.5)),x=u<.30?.29*u/.30:u<.72?.29:.29*(1-(u-.72)/.28),y=u<.30?.82:u<.72?.82-(u-.30)/.42*.28:.54;armTarget(a,0,[-x,y,.29]);armTarget(a,1,[x,y,.29]);}
    if(['confirm','penalty'].includes(p.pose)){a.arms[1].shoulder.rotation.x=-1.48;a.arms[1].elbow.rotation.x=-.04;}
    if(p.pose==='yellow'||p.pose==='red'){a.arms[1].shoulder.rotation.x=-2.8;a.arms[1].elbow.rotation.x=-.15;}
    if(p.pose==='indirect'||p.pose==='offside'){a.arms[1].shoulder.rotation.x=-3.05;a.arms[1].elbow.rotation.x=0;}if(p.pose==='disallow'){const u=Math.min(1,(p.decisionAge??1)/.55),x=.13+.22*u;armTarget(a,0,[x,.49,.32]);armTarget(a,1,[-x,.57,.28]);}
   }
   a.root.userData.photoPose=false;
   if(p.photoPose){a.body.rotation.set(0,0,0);a.body.position.y=0;a.waist.position.set(0,.923,0);a.waist.rotation.set(0,0,0);a.head.rotation.set(0,0,0);a.legs.forEach(l=>{l.hip.rotation.set(-.04,0,0);l.knee.rotation.set(.08,0,0);l.boot.rotation.x=-.04;});a.root.userData.photoPose=true;const v=p.photoVariant;
    if(v===0)a.arms.forEach((arm,k)=>{arm.shoulder.rotation.set(-.20,0,(k?1:-1)*1.10);arm.elbow.rotation.x=-.2;});
    if(v===1){armTarget(a,0,[-.10,.40,.20]);a.arms[1].shoulder.rotation.set(-2.15,0,.15);a.arms[1].elbow.rotation.x=-.75;}
    if(v===2){armTarget(a,1,[.12,.54,.43]);a.arms[0].shoulder.rotation.set(-.1,0,-.15);a.arms[0].elbow.rotation.x=-.25;}
    if(v===3){armTarget(a,0,[-.04,.49,.20]);armTarget(a,1,[.04,.49,.20]);}}
   if(!official)CelebrationClips.apply(a,p,state);
   if(!official){enhancement.pose(a,p,state);Motion.supportFeet(a,p,state);Motion.groundFeet?.(a,p,state);Motion.strikeContact?.(a,p);}
   // Final lower-body constraint also covers crouched celebration variants.
   // Use the exact transformed sole ellipsoid, avoiding a full actor Box3 scan.
   if(p.celebrate||p.photoPose){a.root.updateMatrixWorld(true);let floor=Infinity;for(const l of a.legs){const m=l.sole.matrixWorld.elements;floor=Math.min(floor,m[13]-Math.hypot(m[1],m[5],m[9]));}if(floor<.003)a.waist.position.y+=(.003-floor)/Math.max(.2,Math.abs(a.body.matrixWorld.elements[5]));}
  };
  for(let i=0;i<actors.length;i++){const p=state.players[i];actors[i].root.scale.setScalar(1);actors[i].root.visible=!(p.dismissed||p.substitutionHidden);if(!actors[i].root.visible)continue;jersey(actors[i],p.number,p.playerId,p);poseActor(actors[i],p);}
  contactShadows.update(state,actors);
  // Solve the gripping hand after both actors have their final poses/matrices.
  for(const p of state.players){if(!p.shirtPull)continue;const a=actors[p.id],victim=actors[p.foulVictimId];if(!a||!victim)continue;victim.root.updateMatrixWorld(true);a.root.updateMatrixWorld(true);const target=victim.waist.localToWorld(new T.Vector3(.13,.42,-.18)),local=a.waist.worldToLocal(target.clone()),arm=a.arms[0],before=arm.shoulder.quaternion.clone(),elbow=arm.elbow.quaternion.clone();armTarget(a,0,local.toArray());arm.shoulder.quaternion.slerpQuaternions(before,arm.shoulder.quaternion.clone(),p.shirtPull);arm.elbow.quaternion.slerpQuaternions(elbow,arm.elbow.quaternion.clone(),p.shirtPull);a.root.userData.shirtPull={victim:p.foulVictimId,weight:p.shirtPull,target:target.toArray()};}
  officials.forEach((a,i)=>poseActor(a,state.officials[i],true));refWhistle.visible=state.officials[0].pose==='endWhistle'&&(state.officials[0].whistleProgress??(state.officials[0].whistling?1:0))>.01;yellowCard.visible=['yellow','red'].includes(state.officials[0].pose);yellowCard.material=mat(state.officials[0].pose==='red'?0xf04443:0xffdd42);fourthBoard.visible=!!state.officials[3]?.board;if(fourthBoard.visible){if(subBoardTexture){const board=state.officials[3].board,key=JSON.stringify(board);if(key!==subBoardKey){subBoardKey=key;const x=subBoardCanvas.getContext('2d');x.fillStyle='#101b22';x.fillRect(0,0,256,128);x.textBaseline='middle';x.textAlign='center';x.font='bold 86px Arial, sans-serif';if(typeof board==='object'){x.fillStyle='#f05c58';x.fillText(board.out,66,69,116);x.fillStyle='#77e6a3';x.fillText(board.in,194,69,116);}else{x.fillStyle='#77e6a3';x.fillText(board,128,69,240);}subBoardTexture.needsUpdate=true;}}fourDigit.visible=state.officials[3].board==='+4';twoDigit.visible=!fourDigit.visible;if(subBoardTexture){fourDigit.visible=twoDigit.visible=false;}officials[3].arms.forEach(a=>{a.shoulder.rotation.x=-2.5;a.elbow.rotation.x=-.15;});if(typeof state.officials[3].board==='object'){armTarget(officials[3],0,[-.27,.99,.12]);armTarget(officials[3],1,[.27,.99,.12]);}}
  for(let team=0;team<2;team++)for(let j=0;j<2;j++){const a=substitutionActors[team][j],sub=state.substitution;a.root.visible=!!sub&&sub.team===team;if(!a.root.visible)continue;const identity=j?sub.incoming:sub.out;jersey(a,identity.number,identity.id,identity);const u=Math.max(0,Math.min(1,(sub.age-(j?.75:0))/2)),x=(j?-.45:.45),z=j?36.5-u*4.1:32.4+u*4.1;poseActor(a,{x,z,heading:j?Math.PI:0,speed:u>0&&u<1?2.5:0,gait:sub.age*7,lookAngle:0});}
  for(const item of sidelines){const {actor:a,base,kind,team,index}=item,age=goalAge,cheer=['coach','substitute'].includes(kind)&&lastGoal?.team===team&&age>=0&&(kind==='coach'||index%4!==0)&&(age<4.5+energy||supporting)&&state.phase!=='finished',important=energy>1.3;
   if(kind==='substitute'){const onField=state.players.some(p=>p.playerId&&p.playerId===a.root.userData.playerId);a.root.scale.setScalar(onField?0:1);}
   const warm=kind==='substitute'&&item.warmupSlot!=null&&!cheer&&state.minute>25&&state.minute<88;
   let x=base.x,z=base.z,speed=0,heading=Math.PI;
   if(warm){const u=showTime*.7+index,run=Math.sin(u);x=(team?1:-1)*42+run*5;z=36.8+item.warmupSlot*.8;speed=Math.abs(Math.cos(u))*3.5;heading=Math.cos(u)>0?Math.PI/2:-Math.PI/2;}
   if(['medic','ballboy','photographer'].includes(kind))heading=Math.atan2(-x,-z);
   if(kind==='coach'){x+=Math.sin(showTime*.65+team)*1.1;heading=Math.atan2(state.ball.x-x,state.ball.z-z);speed=.5;}
   if(cheer&&important){const u=Math.min(1,Math.max(0,age-.2)/1.0);z-=u*(kind==='coach'?1.15:1.6);}
   if(kind==='steward'){heading=Math.abs(base.x)>55?(base.x>0?Math.PI/2:-Math.PI/2):(base.z>0?0:Math.PI);}
   poseActor(a,{x,z,heading,speed,gait:showTime*speed*3,lookAngle:kind==='steward'?Math.sin(showTime*.35+index)*.10:0});
   if(kind==='substitute'&&!warm&&!cheer){a.waist.position.y=.61;a.legs.forEach(l=>{l.hip.rotation.x=-Math.PI/2;l.knee.rotation.x=Math.PI/2;l.boot.rotation.x=0;});a.arms.forEach(arm=>{arm.shoulder.rotation.x=-.55;arm.elbow.rotation.x=-.65;});}
   if(kind==='coach'&&!cheer&&state.phase==='playing'&&state.chance.team===team&&state.physicsTime<2.2){a.arms[1].shoulder.rotation.x=-1.4;a.arms[1].elbow.rotation.x=-.15;}if(kind==='photographer'){a.waist.position.y=.65;a.legs[0].knee.rotation.x=1.6;a.arms.forEach(arm=>{arm.shoulder.rotation.x=-1.4;arm.elbow.rotation.x=-1.7;});}
   if(cheer){a.body.position.y=Math.max(0,Math.sin(age*9+index*.6))*(important?.22:.10);a.arms.forEach((arm,k)=>{arm.shoulder.rotation.x=-2.4;arm.shoulder.rotation.z=(k?1:-1)*.35;arm.elbow.rotation.x=-.35;});}
  }
  press.update(state,showTime,poseActor);
  trail.visible=!!state.replay&&state.ballTrace?.length===5;if(trail.visible){const p=trailGeometry.attributes.position;state.ballTrace.forEach((v,i)=>p.setXYZ(i,v.x,v.y,v.z));p.needsUpdate=true;}
  ballGroup.position.set(state.ball.x,state.ball.y,state.ball.z);if(state.endSequence?.ballHeld){officials[0].root.updateMatrixWorld(true);const hand=new T.Vector3(0,-.26,.005);officials[0].arms[0].elbow.localToWorld(hand);hand.add(new T.Vector3(.035,.03,.025));const grip=Math.max(0,Math.min(1,(state.endSequence.age-.30)/.32));ballGroup.position.lerp(hand,grip*grip*(3-2*grip));}ballGroup.rotation.set(state.ballRoll?.x||0,0,state.ballRoll?.z||0);ballShadow.position.set(state.ball.x,.025,state.ball.z);ballShadow.scale.setScalar(1+state.ball.y*.2);ballShadow.material.opacity=.52/(1+state.ball.y*.35);
  offsideLine.visible=state.offsideEvidence||state.review?.reason==='offside'||state.ruleReplay?.kind==='offside';receiverLine.visible=receiverMark.visible=offsideLine.visible;if(offsideLine.visible){const snap=state.ruleReplay?.snapshot??state.chance.offsideSnapshot;offsideLine.position.x=Math.max(snap.line,snap.ball?.x??-Infinity)*state.dir;receiverLine.position.x=snap.receiver.x*state.dir;receiverMark.position.set(snap.receiver.x*state.dir,.1,snap.receiver.z*state.dir*state.flank);}
  positionCamera(state,aspect,view);const rawCamera=scene.userData.attackCamera;if(rawCamera)stabilizeCamera(state,aspect,view,rawCamera.critical,fitCamera);scene.userData.attackCamera=rawCamera;


  if(state.substitution){camera.fov=42;camera.position.set(-4.8,3.4,26.5);camera.lookAt(0,1.3,34.5);camera.userData.framingAim=new T.Vector3(0,1.3,34.5);camera.updateProjectionMatrix();camera.updateMatrixWorld();}
  if(state.cardCut){const p=state.players[state.cardCut.actor],r=state.officials[0];if(p&&r){const x=(p.x+r.x)/2,z=(p.z+r.z)/2;camera.fov=38;camera.position.set(x-3.8,2.5,z+5.8);camera.lookAt(x,1.35,z);camera.userData.framingAim=new T.Vector3(x,1.35,z);}}
  keepInterior(state,rawCamera?.critical);camera.updateProjectionMatrix();camera.updateMatrixWorld();press.face(camera);let smokeIndex=0;for(const e of flares){if(e.active)e.halo.quaternion.copy(camera.quaternion);for(const p of e.smoke){if(p.visible){p.quaternion.copy(camera.quaternion);p.updateMatrix();smokeBatch.setMatrixAt(smokeIndex,p.matrix);}else smokeBatch.setMatrixAt(smokeIndex,effectHidden);smokeIndex++;}}smokeBatch.visible=flares.some(e=>e.active);smokeBatch.instanceMatrix.needsUpdate=true;scene.updateMatrixWorld(true);
  for(const a of [...allVisualActors,...substitutionActors.flat()]){const detailed=camera.position.distanceTo(a.root.position)<(quality.id==='high'?105:quality.id==='balanced'?85:65);Characters.setLOD(a,detailed);FullBody.setLOD(a,detailed);if(!a.fullBody?.visible){Characters.sync(a);Characters.setLOD(a,detailed);}const ai=actors.indexOf(a);FullBody.sync(a,ai<0?{}:state.players[ai],state);}
  if(!options.penaltyStudio)updateJerseyDetail();faceRuntime?.updateLOD(camera);remaster.update(state,camera);
  crowdLOD.prepare(state,camera,showTime);for(const f of fans)if(f.body)f.root.traverse(o=>{if(o.isMesh&&!o.userData.instancedSource)o.visible=!f.lodHidden&&!crowdImpostors.active;});
  const selectedLabel=PlayerLabel.select(state);scene.userData.playerLabel=null;if(selectedLabel){const a=actors[selectedLabel.id];if(a){const head=a.head.getWorldPosition(new T.Vector3());head.y+=.30*(a.body.scale.y||1);const projected=head.project(camera);if(projected.z>-1&&projected.z<1)scene.userData.playerLabel={...selectedLabel,x:(projected.x+1)/2,y:(1-projected.y)/2,time:state.time};}}
  // Pack only the currently displayed poses. Hidden pose copies do not consume vertex work.
  if(!crowdImpostors.active){
  for(const entry of farBatches)entry.writeCount=0;
  for(const f of distant){if(f.lodHidden)continue;const pose=f.displayPose??0;crowdMatrix.copy(f.baseMatrix);crowdMatrix.elements[12]+=(f.sway||0)+(f.surgeX||0);crowdMatrix.elements[13]+=f.hop||0;crowdMatrix.elements[14]+=f.surgeZ||0;for(const entry of farByPose[pose]){const index=entry.writeCount++;entry.batch.setMatrixAt(index,crowdMatrix);const mosaic=entry.part==='shirt'&&f.choreography&&((Math.floor((f.slot.x+85)/7)+Math.floor(f.slot.row/2))%4===0);entry.batch.setColorAt(index,f.colours[mosaic?'stripe':entry.part]);}f.priorPose=pose;}
  for(const entry of farBatches){entry.batch.count=entry.writeCount;entry.batch.visible=entry.writeCount>0;if(!entry.writeCount)continue;entry.batch.instanceMatrix.clearUpdateRanges();entry.batch.instanceMatrix.addUpdateRange(0,entry.writeCount*16);entry.batch.instanceMatrix.needsUpdate=true;entry.batch.instanceColor.clearUpdateRanges();entry.batch.instanceColor.addUpdateRange(0,entry.writeCount*3);entry.batch.instanceColor.needsUpdate=true;}
  }else{if(!crowdBuffersFreed){for(const e of farBatches){e.batch.dispose();e.batch.instanceMatrix=new T.InstancedBufferAttribute(new Float32Array(16),16);if(e.batch.instanceColor)e.batch.instanceColor=new T.InstancedBufferAttribute(new Float32Array(3),3);e.batch.count=0;}crowdBuffersFreed=true;}for(const e of farBatches)e.batch.visible=false;crowdImpostors.update(state);}
  for(const {batch,sources} of batches){const crowdOnly=sources.every(o=>o.userData.crowdOwner!==undefined||o.userData.fan);if(crowdImpostors.active&&crowdOnly){batch.visible=false;continue;}let changed=false;sources.forEach((o,i)=>{const ownerFan=o.userData.crowdOwner!==undefined?fans[o.userData.crowdOwner]:null,fullHidden=o.wosFullBodyOwner?.root.visible===false||!!ownerFan&&(ownerFan.lodHidden||crowdImpostors.active)||o.wosFullBodyOwner?.fullBody?.visible&&!o.wosFullBodyEquipment;const fan=o.userData.crowdPose!==undefined?fans[o.userData.crowdSlot]:null,pose=fan?(fan.displayPose??fan.goalPose):null,hop=fan?.hop||0;if(o.frozen&&o.uploaded&&o.priorPose===pose&&o.priorHop===hop&&o.priorLOD===ownerFan?.lodHidden)return;let matrix=o.matrixWorld;if(hop){crowdMatrix.copy(matrix);crowdMatrix.elements[13]+=hop;matrix=crowdMatrix;}batch.setMatrixAt(i,fullHidden||pose!==null&&o.userData.crowdPose!==pose?hiddenMatrix:matrix);o.uploaded=true;o.priorPose=pose;o.priorHop=hop;o.priorLOD=ownerFan?.lodHidden;changed=true;});if(changed)batch.instanceMatrix.needsUpdate=true;}
 }
 faceRuntime=Faces.create({T,actors:[...actors,...officials,...sidelines.map(s=>s.actor),...press.items.map(s=>s.actor),...substitutionActors.flat()],teams,loadJSON:options.loadFaceJSON,loadTexture:options.loadFaceTexture,canvasFactory:options.canvasFactory,headFit:options.penaltyStudio?'penalty':'default'});const staffLoader=options.loadFaceJSON||((typeof document!=='undefined'&&typeof fetch==='function')?async file=>{const r=await fetch(file+'?v=89',{signal:AbortSignal.timeout(6000)});if(!r.ok)throw Error('staff');return r.json();}:null),staffReady=staffLoader?Promise.all([faceRuntime.ready,staffLoader('assets/faces/staff-portraits.json')]).then(async([,doc])=>{if(sceneDisposed)return;const n=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/ı/g,'i').replace(/[^a-z0-9]/g,'');for(const item of sidelines.filter(x=>x.kind==='coach')){const matches=Object.values(doc.people||{}).filter(p=>p.role==='manager'&&n(p.name)===n(item.actor.identity.name));if(matches.length===1)faceRuntime.apply(item.actor,{...item.actor.identity,id:matches[0].id});}await faceRuntime.whenIdle?.();}).catch(()=>{}):Promise.resolve();for(const a of substitutionActors.flat())kitRuntime.register(a);const kitReady=kitRuntime.prepare(),jerseyReady=Jersey.ready().then(()=>{if(kitRuntime.info.disposed)return;for(const a of [...actors,...sidelines.map(s=>s.actor),...substitutionActors.flat()])if(a.numberTexture){Jersey.paint(a.numberTexture.image,a.root.userData.jerseyNumber,a.root.userData.shirtName,a.print);a.numberTexture.needsUpdate=true;if(a.shortNumberTexture){Jersey.paintShort(a.shortNumberTexture.image,a.root.userData.jerseyNumber,a.uniform,a.index===0);a.shortNumberTexture.needsUpdate=true;}}});if(options.crests)setCrests(options.crests);return{scene,stadium,arenaArt,contactShadows,architectureBatches:batches,camera,lighting,pitchDetail,actors,officials,sidelines,stewards,ambulances,farBatches,fans,banners,flags,flares,confetti,smokeBatch,netGoals,ball:ballGroup,setCrests,get crowdInfo(){return crowdInfo},stadiumExtras,stadiumShell,press,adboards,faceInfo:faceRuntime.info,stadiumCustomization,crowdLOD,crowdImpostors,fullBodyInfo:FullBody.inspect,footballClipInfo:FootballClips.inspect,celebrationClipInfo:CelebrationClips.inspect,trackedRunInfo:TrackedRuns.inspect,whenFacesReady:()=>faceRuntime?.whenIdle?.()||Promise.resolve(),warmFaces:identities=>faceRuntime?.preload?.(identities)||Promise.resolve(),refreshFaceLOD(){updateJerseyDetail();faceRuntime?.updateLOD(camera);},refreshAppearance(){for(const a of [...allVisualActors,...substitutionActors.flat()]){Characters.apply(a,a.identity);FullBody.apply(a);}},ready:Promise.all([arenaArt.ready,CelebrationClips.load(options.loadCelebrationClips),crowdLOD.ready,crowdImpostors.ready,TrackedRuns.load(options.loadTracking),FootballClips.load(options.loadFootballClips),FullBody.loadAssets(options.loadFullBody),adboards.ready,kitReady,jerseyReady,faceRuntime.ready,staffReady,turfReady,stadiumCustomization.ready,Characters.loadAssets().then(()=>{if(sceneDisposed)return;for(const a of [...allVisualActors,...substitutionActors.flat()]){Characters.attach(a);Characters.apply(a,a.identity);if(quality.shadows)a.root.traverse(o=>{if(o.isMesh)o.castShadow=true;});}})]).then(()=>{if(sceneDisposed)return;for(const a of [...allVisualActors,...substitutionActors.flat()]){FullBody.attach(a,{canvasFactory:options.canvasFactory});FullBody.apply(a);}enhancement.refresh();remaster.refresh();}),render(renderer){remaster.render(renderer,camera);},remaster,kitInfo:kitRuntime.info,kitImages:kitRuntime.images,ceremony,update,dispose(){if(sceneDisposed)return;sceneDisposed=true;arenaArt.dispose();enhancement.dispose();remaster.dispose();for(const a of [...allVisualActors,...substitutionActors.flat()]){FullBody.dispose(a);Characters.dispose(a);}crowdLOD.dispose();crowdImpostors.dispose();stadiumCustomization.dispose();pitchDetail.dispose();stadiumShell.dispose();faceRuntime?.dispose();press.dispose();subBoardTexture?.dispose();adboards.dispose();ceremony.dispose();stadiumExtras.dispose();lighting.dispose();grass.dispose();grassNormal.dispose();smokeTexture?.dispose();crestTextures.forEach(t=>t&&t.dispose());flagTextures.forEach(t=>t&&t.dispose());const owned=new Set(flagMaterials),sharedMaterials=new Set(Object.values(materials)),sharedGeometry=new Set(Object.values(geometries)),uniqueGeometry=new Set();scene.traverse(o=>{if(o.material&&!sharedMaterials.has(o.material)&&!kitRuntime.ownsMaterial(o.material))owned.add(o.material);if(o.isInstancedMesh)o.dispose();if(o.geometry&&!sharedGeometry.has(o.geometry)&&!kitRuntime.ownsGeometry(o.geometry)&&!faceRuntime.ownsGeometry(o.geometry))uniqueGeometry.add(o.geometry);});const jerseyMaps=new Set();scene.traverse(o=>{if(o.userData.jerseyTexture&&o.material.map)jerseyMaps.add(o.material.map);});jerseyMaps.forEach(t=>{t.dispose();if(t.image?.getContext){t.image.width=1;t.image.height=1;}});owned.forEach(m=>{if(Array.isArray(m))m.forEach(x=>x.dispose());else m.dispose();});uniqueGeometry.forEach(g=>g.dispose());kitRuntime.dispose();}};
}
function layout(w,h){
 const portrait=w<h,scale=portrait?w/720:w/1280;
 return{portrait,scale,score:{x:w*.055,y:h*(portrait?.103:.045),w:w*.89,h:94*scale},stats:{x:w*.055,y:h*(portrait?.80:.73),w:portrait?w*.89:340*scale,h:134*scale},eventY:h*(portrait?.732:.69)};
}
const visibleTypes=new Set(['substitution','goalKick','throwIn','interception','block','offside','corner','penalty','penalty_awarded','goal','goal_pending','goal_disallowed','var_start','var_decision','save','post','wide','half','fulltime','yellow','red']);
function visibleEvents(events){return events.filter(e=>visibleTypes.has(e.type));}
function eventText(e,lang='tr'){const en=lang==='en';if(e.type==='substitution')return(en?'SUBSTITUTION · ':'OYUNCU DEĞİŞİKLİĞİ · ')+e.outNumber+' '+(e.outName||'')+' → '+e.inNumber+' '+(e.inName||'');if(e.type==='goal'&&e.playerName)return (en?'GOAL · ':'GOL · ')+e.playerName;if(e.type==='goal_disallowed')return en?'GOAL DISALLOWED':'GOL İPTAL';if(e.type==='var_start'||e.type==='goal_pending')return en?'VAR CHECK':'VAR KONTROLÜ';if(e.type==='var_decision')return e.reviewType==='penalty'?(en?'PENALTY':'PENALTI'):e.allowed?(en?'GOAL CONFIRMED':'GOL ONAYLANDI'):(en?'GOAL DISALLOWED':'GOL İPTAL');return M.label(e.type,lang);}
function broadcastNotice(state,lang='tr'){
 const en=lang==='en';if(state.ruleReplay)return{text:(en?'REPLAY · ':'TEKRAR · ')+(state.ruleReplay.kind==='offside'?(en?'OFFSIDE':'OFSAYT'):(en?'FOUL':'FAUL')),tone:'replay'};if(state.phase==='initialDecision')return{text:en?'ON-FIELD DECISION · NO GOAL':'SAHA KARARI · GOL İPTAL',tone:'review'};if(state.phase==='kickoff')return{text:state.kickoff?.half===2?(en?'SECOND HALF':'İKİNCİ YARI'):(en?'KICK OFF':'SANTRA'),tone:'restart'};if(state.phase==='finished'||state.phase==='halftime'||state.phase==='endWhistle'||state.phase==='intro')return null;
 if(state.phase==='var'||state.preReview&&state.chance.penaltyReview){const reason=state.review?.reason||state.chance.reason;return{text:'VAR · '+(state.preReview?(en?'PENALTY':'PENALTI'):reason==='offside'?(en?'OFFSIDE':'OFSAYT'):reason==='foul'?(en?'ATTACKING FOUL':'HÜCUM FAULÜ'):(en?'GOAL CHECK':'GOL KONTROLÜ')),tone:'review'};}
 if(state.phase==='interception')return{text:en?'INTERCEPTION':'PAS ARASI',tone:'result'};if(state.phase==='offside')return{text:en?'OFFSIDE':'OFSAYT',tone:'restart'};if(['yellow','red'].includes(state.officials?.[0]?.pose))return{text:state.officials[0].pose==='red'?(en?'RED CARD':'KIRMIZI KART'):(en?'YELLOW CARD':'SARI KART'),tone:'review'};
 if(state.phase==='disallowed')return {text:en?'GOAL DISALLOWED':'GOL İPTAL',tone:'review'};
 if(state.phase==='replay')return {text:(en?'REPLAY':'TEKRAR')+(['post','wide'].includes(state.chance.result)?' · '+(state.chance.result==='post'?(en?'POST':'DİREK'):(en?'WIDE':'DIŞARI')):''),tone:'replay'};
 if(state.phase==='goal'||state.phase==='celebration')return {text:(en?'GOAL':'GOL')+' · '+state.teams[state.chance.team].name,tone:'goal'};
 if(state.outOfPlay)return{text:(en?'BALL OUT · ':'TOP DIŞARIDA · ')+(state.outOfPlay.kind==='throwIn'?(en?'THROW-IN':'TAÇ'):state.outOfPlay.kind==='corner'?(en?'CORNER':'KORNER'):(en?'GOAL KICK':'AUT')),tone:'result'};
 if(state.resolution?.stage==='hold'&&state.owner===state.resolution.actor)return {text:en?'KEEPER HAS IT':'TOP KALECİDE',tone:'result'};
 if(state.resolution?.stage==='clearance')return {text:en?'CLEARED':'UZAKLAŞTIRILDI',tone:'result'};
 if(state.resolution?.stage==='out')return {text:en?'BALL OUT':'TOP DIŞARIDA',tone:'result'};
 const activeShot=state.chance.resolution?.secondaryShot&&state.physicsTime>=(state.chance.resolution.start??M.BASE)+state.chance.resolution.kickAt?state.chance.resolution.secondaryShot:state.chance.physicalShot;if(activeShot?.result==='block'&&state.physicsTime>=M.IMPACT)return{text:en?'BLOCKED':'BLOK',tone:'result'};
 if(state.chance.followUpGoal&&state.physicsTime>=M.IMPACT&&state.physicsTime<state.chance.goalImpact)return {text:en?'REBOUND':'DÖNEN TOP',tone:'result'};if(state.physicsTime>=M.IMPACT)return {text:state.chance.result==='post'?(en?'OFF THE POST':'DİREKTEN DÖNDÜ'):state.chance.result==='wide'?(en?'WIDE':'DIŞARIDA'):state.chance.result==='save'?(en?'SAVED':'KURTARIŞ'):(en?'VAR CHECK':'VAR KONTROLÜ'),tone:'result'};
 if(state.chance.pattern==='corner'&&state.physicsTime<M.SHOT)return {text:en?'CORNER':'KORNER',tone:'restart'};
 if(state.chance.pattern==='penalty'&&state.physicsTime<M.SHOT)return {text:en?'PENALTY':'PENALTI',tone:'restart'};return null;
}
function statRows(state,lang='tr'){
 const en=lang==='en',A=state.stats[0],B=state.stats[1],sum=A.possession+B.possession,share=sum?Math.round(A.possession/sum*100):50;
 const defs=[['possession','Topla oynama','Possession'],['shots','Şut','Shots'],['on','İsabetli şut','Shots on target'],['xg','Gol beklentisi · xG','Expected goals · xG'],['passes','Pas','Passes'],['completedPasses','İsabetli pas','Completed passes'],['accuracy','Pas isabeti','Pass accuracy'],['corners','Korner','Corners'],['saves','Kurtarış','Saves'],['fouls','Faul','Fouls'],['yellow','Sarı kart','Yellow cards'],['red','Kırmızı kart','Red cards']];
 return defs.map(([key,tr,name])=>{const value=(s,i)=>key==='possession'?(i?100-share:share)+'%':key==='xg'?Number(s[key]||0).toFixed(2):key==='accuracy'?(s[key]||0)+'%':String(s[key]||0);return{key,name:en?name:tr,home:value(A,0),away:value(B,1)};});
}
function scoreGeometry(ctx,w,h,teams){
 const L=layout(w,h),s=L.scale,centreW=88*s,maxWing=(L.score.w-centreW)/2,nameMax=maxWing-132*s;
 const wrap=(name,size)=>{ctx.font=`bold ${size*s}px Arial`;const lines=[];let row='';for(const word of name.split(/\s+/)){const next=row?row+' '+word:word;if(row&&ctx.measureText(next).width>nameMax){lines.push(row);row=word;}else row=next;}if(row)lines.push(row);return lines;};
 let nameSize=L.portrait?17:20;while(nameSize>10&&!teams.every(t=>{const rows=wrap(t.name,nameSize);return rows.length<=2&&rows.every(r=>ctx.measureText(r).width<=nameMax);}))nameSize--;
 const names=teams.map(t=>wrap(t.name,nameSize));ctx.font=`bold ${nameSize*s}px Arial`;const nameWidth=Math.min(nameMax,Math.max(...names.flat().map(row=>ctx.measureText(row).width))),wing=Math.min(maxWing,132*s+nameWidth),ww=2*wing+centreW;
 return{...L.score,x:(w-ww)/2,w:ww,h:84*s,centreW,nameSize,names,nameMax:nameWidth,wing};
}
function overlay(ctx,w,h,state,images={},lang='tr'){
 const label=images.playerLabel;if(label&&label.time===state.time)PlayerLabel.draw(ctx,w,h,label);
 if(B&&B.render(ctx,w,h,state,images,lang,{layout,statRows,notice:broadcastNotice,visibleEvents,eventText}))return;
 const teams=state.teams||M.teams,L=layout(w,h),s=L.scale,P=L.portrait,box=scoreGeometry(ctx,w,h,teams),tx=(a,b)=>lang==='tr'?a:b,hex=v=>'#'+(v??0x668392).toString(16).padStart(6,'0');
 const panel=(x,y,ww,hh,color)=>{if(color)ctx.fillStyle=color;else{const g=ctx.createLinearGradient(x,y,x+ww*.35,y+hh);g.addColorStop(0,'#142d3df5');g.addColorStop(1,'#07151ff2');ctx.fillStyle=g;}ctx.fillRect(x,y,ww,hh);ctx.strokeStyle='#bbd6df25';ctx.lineWidth=.7*s;ctx.strokeRect(x,y,ww,hh);},crest=(i,x,y,n)=>{ctx.save();if(images[i]){const im=images[i],iw=im.naturalWidth||im.width||1,ih=im.naturalHeight||im.height||1,k=n/Math.max(iw,ih);ctx.shadowColor='#0006';ctx.shadowBlur=4*s;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(im,x-iw*k/2,y-ih*k/2,iw*k,ih*k);}ctx.restore();};ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.textBaseline='middle';
 const competitionMark=(x,y,n)=>{if(!images.competition||!M.competitionLogo(state.fixture))return false;const im=images.competition,iw=im.naturalWidth||im.width||1,ih=im.naturalHeight||im.height||1,k=n/Math.max(iw,ih);ctx.save();ctx.fillStyle='#f6f6ee';ctx.beginPath();ctx.arc(x,y,n*.64,0,Math.PI*2);ctx.fill();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(im,x-iw*k/2,y-ih*k/2,iw*k,ih*k);ctx.restore();return true;};
 if(state.phase==='intro'){
  const t=state.presentationTime||0,opacity=Math.min(1,.7+t*3,Math.max(0,((state.preMatchPlan?.intro||2)-t)/.18)),ww=w*(P?.92:.60),hh=h*(P?.32:.55),x=(w-ww)/2,y=(h-hh)/2,unit=Math.min(ww/660,hh/410),left=w/2-ww*.28,right=w/2+ww*.28;
  ctx.fillStyle='#04121a35';ctx.fillRect(0,0,w,h);ctx.globalAlpha=opacity;panel(x,y,ww,hh);
  const sweep=ctx.createLinearGradient(x,y,x+ww,y+hh);sweep.addColorStop(0,hex(teams[0].primary)+'44');sweep.addColorStop(.5,'#142f4822');sweep.addColorStop(1,hex(teams[1].primary)+'44');ctx.fillStyle=sweep;ctx.fillRect(x,y,ww,hh);
  ctx.fillStyle='#9eb9ca';ctx.font=`bold ${12*unit}px Arial`;ctx.textAlign='center';
  const cy=y+hh*.49,n=114*unit;
  for(let i=0;i<2;i++){const cx=i?right:left;ctx.save();ctx.shadowColor='#0008';ctx.shadowBlur=12*unit;if(images[i]){const im=images[i],iw=im.naturalWidth||im.width||1,ih=im.naturalHeight||im.height||1,k=n/Math.max(iw,ih);ctx.drawImage(im,cx-iw*k/2,cy-ih*k/2,iw*k,ih*k);}else crest(i,cx,cy,n);ctx.restore();
   const max=ww*.39,words=teams[i].name.split(/\s+/);let size=22,lines=[];for(;size>=12;size--){ctx.font=`bold ${size*unit}px Arial`;lines=[];let line='';for(const word of words){const next=line?line+' '+word:word;if(line&&ctx.measureText(next).width>max){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);if(lines.length<=2&&lines.every(l=>ctx.measureText(l).width<=max))break;}ctx.fillStyle='#f0f4ef';ctx.textAlign='center';lines.forEach((line,j)=>ctx.fillText(line,cx,cy+n*.65+j*(size+4)*unit,max));
  }
  if(!competitionMark(w/2,cy-12*unit,65*unit)){ctx.font=`bold ${31*unit}px Arial`;ctx.fillStyle='#d3e0e5';ctx.fillText('VS',w/2,cy);}
  let date='';try{if(state.fixture?.kickoff){const at=new Date(state.fixture.kickoff);if(Number.isFinite(+at)){const locale=lang==='tr'?'tr-TR':'en-GB';date=new Intl.DateTimeFormat(locale,{day:'numeric',month:'long',timeZone:'Europe/Istanbul'}).format(at);}}else if(state.fixture?.date){const at=new Date(state.fixture.date+'T12:00:00+03:00');if(Number.isFinite(+at))date=new Intl.DateTimeFormat(lang==='tr'?'tr-TR':'en-GB',{day:'numeric',month:'long',timeZone:'Europe/Istanbul'}).format(at);}}catch{}
  if(date){ctx.fillStyle='#c1d1d8';ctx.font=`bold ${18*unit}px Arial`;ctx.fillText(date,w/2,y+hh-31*unit,ww*.9);}
  ctx.fillStyle=hex(teams[0].primary);ctx.fillRect(x,y+hh-3*unit,ww*.5,3*unit);ctx.fillStyle=hex(teams[1].primary);ctx.fillRect(w/2,y+hh-3*unit,ww*.5,3*unit);ctx.restore();return;
 }
 panel(box.x,box.y,box.w,box.h);
 const centre=w/2,centreW=box.centreW,cy=box.y+box.h*.48;
 // Equal compact wings, open score typography and a dedicated crest/clock column.
 for(let team=0;team<2;team++){
  const right=team===1,edge=right?box.x+box.w:box.x,nameX=edge+(right?-62:62)*s,scoreX=centre+(right?1:-1)*(centreW/2+27*s);
  ctx.fillStyle=hex(teams[team].primary);ctx.fillRect(right?centre+centreW/2:box.x,box.y+box.h-2*s,box.wing,2*s);
  crest(team,edge+(right?-28:28)*s,cy,46*s);
  ctx.font=`bold ${box.nameSize*s}px Arial`;ctx.fillStyle='#edf3f2';ctx.textAlign=right?'right':'left';
  const nameY=cy-(Math.max(...box.names.map(n=>n.length))-1)*(box.nameSize+3)*s/2;
  box.names[team].forEach((row,j)=>ctx.fillText(row,nameX,nameY+j*(box.nameSize+3)*s,box.nameMax));
  ctx.textAlign='center';ctx.font=`bold ${36*s}px Arial`;ctx.fillStyle='#ffffff';ctx.fillText(String(state.score[team]),scoreX,cy+1*s,42*s);
 }
 ctx.fillStyle='#06151eaa';ctx.fillRect(centre-centreW/2,box.y,centreW,box.h);
 ctx.strokeStyle='#bed7e027';for(const x of[centre-centreW/2,centre+centreW/2]){ctx.beginPath();ctx.moveTo(x,box.y+12*s);ctx.lineTo(x,box.y+box.h-12*s);ctx.stroke();}
 competitionMark(centre,box.y+25*s,35*s);
 ctx.fillStyle='#e9f4ec';ctx.font=`bold ${17*s}px Arial`;ctx.textAlign='center';ctx.fillText(M.clock(state.minute),centre,box.y+57*s,80*s);
 ctx.font=`${8*s}px Arial`;ctx.fillStyle='#9fb7c1';ctx.fillText(state.phase==='finished'?tx('MAÇ SONU','FULL TIME'):state.phase==='halftime'?tx('İLK YARI','HALF TIME'):(state.minute>45?tx('2. YARI','2ND HALF'):tx('1. YARI','1ST HALF')),centre,box.y+74*s,80*s);
 const notice=broadcastNotice(state,lang);if(notice){const width=Math.min(box.w,Math.max(152*s,(notice.text.length*8.5+30)*s)),x=(w-width)/2,y=box.y+box.h+10*s,tone=notice.tone==='goal'?'#d6e6cf':notice.tone==='review'?'#e2c58b':'#142c39ed';panel(x,y,width,31*s,tone);ctx.fillStyle=['goal','review'].includes(notice.tone)?'#13282a':'#e5edef';ctx.font=`bold ${12*s}px Arial`;ctx.textAlign='center';ctx.fillText(notice.text,w/2,y+15.5*s,width-18*s);}
 if(state.substitution){const sub=state.substitution,ww=Math.min(w*.9,620*s),hh=108*s,x=(w-ww)/2,y=h*.69,alpha=Math.min(1,sub.age/.18,(sub.duration-sub.age)/.22);ctx.save();ctx.globalAlpha=Math.max(0,alpha);panel(x,y,ww,hh);ctx.textAlign='left';ctx.font=`bold ${11*s}px Arial`;ctx.fillStyle='#bdcbd2';ctx.fillText(tx('OYUNCU DEĞİŞİKLİĞİ','SUBSTITUTION')+' · '+teams[sub.team].name,x+16*s,y+20*s,ww-32*s);for(const [p,row,color,label]of[[sub.out,0,'#ed8b86',tx('ÇIKAN','OUT')],[sub.incoming,1,'#a9dfb0',tx('GİREN','IN')]]){ctx.fillStyle=color;ctx.font=`bold ${15*s}px Arial`;ctx.fillText(label+'  '+p.number+' · '+p.name+'  '+(p.slot?.role||p.position||''),x+16*s,y+(48+row*31)*s,ww-32*s);}ctx.restore();}
 const rows=statRows(state,lang),st=L.stats;
 if(!['finished','halftime'].includes(state.phase)){
  panel(st.x,st.y,st.w,st.h);
  const live=rows.filter(r=>['possession','shots','xg','passes','completedPasses'].includes(r.key));
  live.forEach((r,i)=>{const y=st.y+(17+i*25)*s;if(i){ctx.fillStyle='#94b0be17';ctx.fillRect(st.x+12*s,y-12*s,st.w-24*s,.6*s);}ctx.font=`bold ${13*s}px Arial`;ctx.fillStyle='#f1f5ef';ctx.textAlign='left';ctx.fillText(r.home,st.x+15*s,y,65*s);ctx.textAlign='right';ctx.fillText(r.away,st.x+st.w-15*s,y,65*s);ctx.font=`${10*s}px Arial`;ctx.fillStyle='#b9ccd3';ctx.textAlign='center';ctx.fillText(r.name,st.x+st.w/2,y,st.w-145*s);});
  if(!P){const x=w*.70,y=st.y,ww=w*.245;panel(x,y,ww,98*s);ctx.font=`bold ${10*s}px Arial`;ctx.fillStyle='#9eb8c3';ctx.textAlign='left';ctx.fillText(tx('MAÇ AKIŞI','MATCH FLOW'),x+15*s,y+17*s);visibleEvents(state.events).slice(-2).reverse().forEach((e,i)=>{ctx.fillStyle='#e5ece8';ctx.font=`${11*s}px Arial`;ctx.fillText((e.minute||0)+'′  '+(e.team!=null?teams[e.team].name+'  ':'')+eventText(e,lang),x+15*s,y+(45+i*28)*s,ww-28*s);});}
 }
 if(['finished','halftime'].includes(state.phase)){
  const ww=P?w*.89:Math.min(w*.82,850*s),x=(w-ww)/2,cols=P?1:2,rowH=27*s,top=184*s,hh=top+Math.ceil(rows.length/cols)*rowH+18*s,y=(h-hh)/2;
  panel(x,y,ww,hh,'#0b202cf7');ctx.fillStyle='#b7cec0';ctx.fillRect(x,y,ww,2*s);
  ctx.textAlign='center';ctx.font=`bold ${13*s}px Arial`;ctx.fillStyle='#d1dfd3';ctx.fillText(state.phase==='halftime'?tx('İLK YARI SONUCU','HALF-TIME RESULT'):tx('MAÇ SONU','FULL TIME'),w/2,y+23*s);
  crest(0,x+ww*.21,y+69*s,61*s);crest(1,x+ww*.79,y+69*s,61*s);
  ctx.font=`bold ${43*s}px Arial`;ctx.fillStyle='#fbfdf6';ctx.fillText(state.score.join(' : '),w/2,y+70*s,ww*.32);
  let fullNameSize=16;while(fullNameSize>9){ctx.font=`bold ${fullNameSize*s}px Arial`;if(teams.every(t=>ctx.measureText(t.name).width<=ww*.39))break;fullNameSize--;}
  teams.forEach((t,i)=>ctx.fillText(t.name,x+ww*(i?.79:.21),y+119*s,ww*.39));
  competitionMark(w/2,y+141*s,27*s);ctx.font=`bold ${11*s}px Arial`;ctx.fillStyle='#b9ccd4';ctx.fillText(M.competitionName(state.fixture,lang),w/2,y+172*s,ww-30*s);
  const gap=20*s,inner=ww-32*s,cw=(inner-gap*(cols-1))/cols;
  rows.forEach((r,i)=>{const col=P?0:Math.floor(i/6),n=P?i:i%6,xx=x+16*s+col*(cw+gap),yy=y+top+n*rowH;
   ctx.fillStyle=i%2?'#a8c4d40a':'#a8c4d413';ctx.fillRect(xx,yy,cw,rowH-1*s);
   ctx.font=`bold ${12*s}px Arial`;ctx.fillStyle='#f0f5ee';ctx.textAlign='left';ctx.fillText(r.home,xx+12*s,yy+rowH/2,65*s);ctx.textAlign='right';ctx.fillText(r.away,xx+cw-12*s,yy+rowH/2,65*s);
   ctx.font=`${10*s}px Arial`;ctx.fillStyle='#bdced6';ctx.textAlign='center';ctx.fillText(r.name,xx+cw/2,yy+rowH/2,cw-145*s);
  });
 }
 ctx.fillStyle='#e3ece6';ctx.font=`bold ${16*s}px Arial`;ctx.textAlign='left';ctx.fillStyle='#8ca4ad';ctx.font=`${9*s}px Arial`;ctx.textAlign='right';ctx.fillText('WORLD OF SIMULATION',w*.945,h*.95);
 if(state.transition>0&&!['finished','intro','kickoff'].includes(state.phase)){ctx.fillStyle=`rgba(210,222,230,${state.transition*.45})`;ctx.fillRect(0,h*.115,w,Math.max(1,h*.0015));}ctx.restore();
}
return{build:105,create,netResponse,createPlayer:player,overlay,layout,crowdLayout,visibleEvents,eventText,broadcastNotice,goalAtmosphere,crowdReaction,scoreGeometry,statRows};
});
