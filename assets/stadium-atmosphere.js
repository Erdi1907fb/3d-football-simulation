/* Additive packed upper tiers, architectural detail and one shared live screen texture. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('./vendor/three.min.js'),require('./broadcast.js'),require('./match.js'));else r.SekmeStadiumAtmosphere=f(r.THREE,r.SekmeBroadcast,r.SekmeMatch);})(typeof globalThis!=='undefined'?globalThis:this,function(T,B,M){'use strict';
function profile(teams,venue,occasion){const home=venue?.host??0,strength=Number(teams[home]?.strength)||76,rows=occasion?.big||strength>=82?4:strength>=76?2:1;return{key:rows===4?'grand':rows===2?'club':'compact',rows,source:'illustrative-strength-profile'};}
function slots(p){const out=[];
 for(const side of[-1,1])for(let row=0;row<p.rows;row++)for(let j=0;j<360;j++){const half=67.4+row*.72;out.push({row:16+row,detail:false,x:-half+j*2*half/359,z:side*(60.5+row*1.05),y:12.3+row*.56,heading:side>0?Math.PI:0,sector:'upperHome',neutralTeam:side>0?1:0});}
 for(const side of[-1,1])for(let row=0;row<p.rows;row++)for(let j=0;j<210;j++){const z=-42+j*.4;out.push({row:12+row,detail:false,x:side*(80.5+row*1.285),z,y:12.4+row*.56,heading:-side*Math.PI/2,sector:side>0&&z>23?'awayCorner':'upperHome',neutralTeam:side>0?1:0});}
 for(const sx of[-1,1])for(const sz of[-1,1])for(let row=0;row<p.rows;row++)for(let j=0;j<64;j++){const a=(j+.5)/64*Math.PI/2,lx=67.4+row*.72,ex=80.5+row*1.285,lz=60.5+row*1.05,x=sx*(lx+(ex-lx)*Math.sin(a)),z=sz*(42+(lz-42)*Math.cos(a));out.push({row:16+row,detail:false,x,z,y:12.3+row*.56,heading:Math.atan2(-x,-z),sector:sx>0&&sz>0?'awayCorner':'upperHome',neutralTeam:sx>0?1:0});}
 return out;
}
function create(stadium,p,teams,canvasFactory){const materials=[],geometries=[];
 const material=(color,unlit=false)=>{const m=unlit?new T.MeshBasicMaterial({color,toneMapped:false}):new T.MeshStandardMaterial({color,roughness:.85});materials.push(m);return m;},concrete=material(0x344a59),rim=material(0x6b8796),dark=material(0x122431),light=material(0xc0d9e9,true);
 function box(parent,w,h,d,m,x,y,z){const g=new T.BoxGeometry(w,h,d),o=new T.Mesh(g,m);geometries.push(g);o.position.set(x,y,z);parent.add(o);return o;}
 for(const side of[-1,1]){
  for(let row=0;row<p.rows;row++){box(stadium,136+row*1.44,.42,1.45,concrete,0,12.0+row*.56,side*(60.5+row*1.05));box(stadium,1.9,.42,85,concrete,side*(80.5+row*1.285),12.1+row*.56,0);}
  box(stadium,148,2.4,.3,dark,0,13.4+p.rows*.56,side*(61.7+p.rows*1.05));
  box(stadium,.3,3.8,92,dark,side*(82+p.rows*1.285),13+p.rows*.56,0);
  box(stadium,148,.08,.12,light,0,14.6+p.rows*.56,side*(61.4+p.rows*1.05));
  // Narrow continuous fascia, rather than large empty black rectangles.
  box(stadium,139,.8,.15,rim,0,11.85,side*59.4);
 }
 for(const sx of[-1,1])for(const sz of[-1,1])for(let row=0;row<p.rows;row++)for(let j=0;j<16;j++){const a=j/16*Math.PI/2,b=(j+1)/16*Math.PI/2,lx=67.4+row*.72,ex=80.5+row*1.285,lz=60.5+row*1.05,x1=sx*(lx+(ex-lx)*Math.sin(a)),z1=sz*(42+(lz-42)*Math.cos(a)),x2=sx*(lx+(ex-lx)*Math.sin(b)),z2=sz*(42+(lz-42)*Math.cos(b)),step=box(stadium,Math.hypot(x2-x1,z2-z1)+.15,.42,1.5,concrete,(x1+x2)/2,12+row*.56,(z1+z2)/2);step.rotation.y=-Math.atan2(z2-z1,x2-x1);}
 const canvas=canvasFactory?canvasFactory(1024,256):typeof document!=='undefined'?document.createElement('canvas'):null;
 let texture=null,ctx=null,key='',images={};if(canvas){canvas.width=1024;canvas.height=256;ctx=canvas.getContext('2d');texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.minFilter=T.LinearFilter;texture.generateMipmaps=false;}
 const screenMaterial=new T.MeshBasicMaterial({map:texture,color:texture?0xffffff:0x244862,toneMapped:false});materials.push(screenMaterial);const screens=[];
 for(const side of[-1,1]){const root=new T.Group();root.position.set(side*37,9.35,side*58.5);root.rotation.y=side>0?Math.PI:0;stadium.add(root);box(root,18.6,4.85,.5,dark,0,0,0);const g=new T.PlaneGeometry(17.8,4.1),screen=new T.Mesh(g,screenMaterial);geometries.push(g);screen.position.z=.27;screen.userData.noBatch=true;root.add(screen);screens.push(screen);for(const x of[-9.12,9.12])box(root,.10,4.55,.04,light,x,0,.3);
  // Glass-front media / DJ booth beside the screen, with a visible operator.
  box(root,6.1,2.9,2.7,concrete,-13,-1,-1);box(root,5.6,1.75,.08,material(0x527082),-13,-.65,.40);box(root,5.6,.18,.7,dark,-13,-.98,.58);box(root,.55,.58,.30,material(0xb78669),-13,-.12,.50);box(root,.9,.85,.38,dark,-13,-.85,.51);for(const x of[-14.5,-11.5])box(root,1.1,.65,.06,material(0x6babc0,true),x,-.55,.62);
 }
 function setCrests(value){images=value;key='';}
 function update(state){if(!ctx)return;const k=M.clock(state.minute)+'|'+state.score.join(':')+'|'+(M.competitionKey(state.fixture)||'')+'|'+state.phase;if(k===key)return;key=k;
  const theme=B.themeFor(state.fixture),bg=theme?.dark||'#142b3e',accent=theme?.accent||'#d3e9b5';ctx.fillStyle=bg;ctx.fillRect(0,0,1024,256);ctx.fillStyle=accent;ctx.fillRect(0,0,1024,7);ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 28px Arial';ctx.fillStyle='#ffffff';if(!['intro','ceremony'].includes(state.phase))ctx.fillText(M.competitionName(state.fixture,'en'),512,40,960);
  function crest(i,x){const im=images[i];if(!im)return;const w=im.naturalWidth||im.width,h=im.naturalHeight||im.height,k=76/Math.max(w,h);ctx.drawImage(im,x-w*k/2,111-h*k/2,w*k,h*k);}
  crest(0,65);crest(1,959);ctx.font='bold 30px Arial';ctx.fillText(teams[0].name,270,111,290);ctx.fillText(teams[1].name,754,111,290);ctx.font='bold 56px Arial';ctx.fillText(state.score.join('  :  '),512,114,170);ctx.fillStyle=accent;ctx.font='bold 43px Arial';ctx.fillText(M.clock(state.minute),512,195,300);texture.needsUpdate=true;
 }
 return{profile:p,screens,texture,setCrests,update,dispose(){texture?.dispose();}};
}
return{profile,slots,create};
});
