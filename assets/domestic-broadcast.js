(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('./match.js'),require('./scoreboard-names.js'));else r.SekmeDomesticBroadcast=f(r.SekmeMatch,r.SekmeScoreboardNames);})(typeof globalThis!=='undefined'?globalThis:this,function(M,N){'use strict';
const styles=Object.freeze({
 'tr.1':Object.freeze({key:'tr.1',name:'Trendyol Süper Lig',accent:'#e92b35',dark:'#13161e',light:'#ffffff',secondary:'#e92b35',domestic:true}),
 'it.1':Object.freeze({key:'it.1',name:'Serie A',accent:'#00d2ff',dark:'#063eab',light:'#ffffff',secondary:'#00d2ff',domestic:true}),
 'es.1':Object.freeze({key:'es.1',name:'LALIGA EA SPORTS',accent:'#ff5058',dark:'#161719',light:'#ffffff',secondary:'#ff5058',domestic:true,lightPanel:true}),
 'fr.1':Object.freeze({key:'fr.1',name:'Ligue 1',accent:'#dcff01',dark:'#101b44',light:'#ffffff',secondary:'#dcff01',domestic:true}),
 'de.1':Object.freeze({key:'de.1',name:'Bundesliga',accent:'#e90028',dark:'#16191b',light:'#ffffff',secondary:'#e90028',domestic:true,lightPanel:true})
});let assets={};
function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h);}
function round(c,x,y,w,h,r,color){c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
function text(c,value,x,y,size=24,color='#fff',align='left',bold=true,max){c.font=`${bold?'bold ':''}${size}px Arial`;c.fillStyle=color;c.textAlign=align;c.textBaseline='middle';if(max)c.fillText(String(value),x,y,max);else c.fillText(String(value),x,y);}
function poly(c,pts,color){c.fillStyle=color;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
function grad(c,x,y,w,h,a,b){const g=c.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,a);g.addColorStop(1,b);rect(c,x,y,w,h,g);}
function image(c,key,x,y,n){const im=assets[key];if(!im)return;const scale=n/Math.max(im.naturalWidth||im.width,im.naturalHeight||im.height);c.drawImage(im,x-(im.naturalWidth||im.width)*scale/2,y-(im.naturalHeight||im.height)*scale/2,(im.naturalWidth||im.width)*scale,(im.naturalHeight||im.height)*scale);}
function club(c,t,side,x,y,n){image(c,side,x,y,n);}
function logo(c,t,x,y,n,onDark=true){image(c,onDark?'light':'dark',x,y,n);}
function panel(c,t,x,y,w,h,white=t.lightPanel){const dark=white?'#fafafa':t.dark;rect(c,x,y,w,h,dark);c.save();c.beginPath();c.rect(x,y,w,h);c.clip();
if(t.key==='tr.1'){grad(c,x,y,w,h,'#11151d','#282333');poly(c,[[x+w*.72,y],[x+w,y],[x+w,y+h],[x+w*.45,y+h]],'#e92b3513');rect(c,x,y,w,5,t.accent);}
if(t.key==='it.1'){grad(c,x,y,w,h,'#063a9a','#062065');for(let i=0;i<5;i++)poly(c,[[x+w*(.45+i*.14),y],[x+w*(.60+i*.14),y],[x+w*(.20+i*.14),y+h],[x+w*(.05+i*.14),y+h]],'#00cfff12');rect(c,x,y,w,5,t.accent);}
if(t.key==='es.1'){rect(c,x,y,w,h,'#f7f5f1');poly(c,[[x+w*.72,y],[x+w*.88,y],[x+w*.65,y+h],[x+w*.49,y+h]],'#ff50580d');rect(c,x,y,12,h,t.accent);}
if(t.key==='fr.1'){rect(c,x,y,w,h,'#101b44');for(let i=0;i<7;i++)poly(c,[[x+w*(.82+i*.055),y],[x+w*(.85+i*.055),y],[x+w*(.45+i*.055),y+h],[x+w*(.42+i*.055),y+h]],'#dcff010a');rect(c,x,y,w,7,t.accent);}
if(t.key==='de.1'){rect(c,x,y,w,h,white?'#f8f8f7':'#191d20');poly(c,[[x,y],[x+w*.12,y],[x+w*.50,y+h],[x+w*.38,y+h]],white?'#00000006':'#ffffff06');rect(c,x,y,w,8,t.accent);}c.restore();}
function liveName(c,names,side,x,y,max,color){const shape=N.prepare(c,names.map(name=>({name})),max,26,18);text(c,shape.rows[side][0],x,y,shape.size,color,side?'right':'left',true,max);}
function live(c,t,st,images){assets={0:images[0],1:images[1],light:images.competitionIconLight||images.competition,dark:images.competitionIconDark||images.competition};const x=0,y=0,w=970,h=92,score=st.score,time=M.clock(st.minute),nm=st.teams.map(t=>t.name);c.save();c.shadowColor='#0006';c.shadowBlur=18;c.shadowOffsetY=6;rect(c,x,y,w,h,t.dark);c.restore();
if(t.key==='tr.1'){
rect(c,x,y,105,h,'#f4f4f4');logo(c,t,x+52,y+46,68,false);rect(c,x+105,y,7,h,t.accent);club(c,t,0,x+147,y+46,43);liveName(c,nm,0,x+180,y+46,175,'#fff');rect(c,x+388,y,145,h,'#f4f4f4');text(c,score[0],x+425,y+46,42,'#191b20','center');text(c,score[1],x+498,y+46,42,'#191b20','center');club(c,t,1,x+782,y+46,43);liveName(c,nm,1,x+746,y+46,175,'#fff');rect(c,x+823,y,147,h,'#242a34');text(c,time,x+897,y+46,29,'#fff','center');rect(c,x+112,y+h,858,3,t.accent);
}else if(t.key==='it.1'){
rect(c,x,y,113,h,'#fafafa');logo(c,t,x+57,y+46,72,false);poly(c,[[x+113,y],[x+141,y],[x+113,y+h]],'#00d2ff');club(c,t,0,x+161,y+46,42);liveName(c,nm,0,x+195,y+46,175,'#fff');poly(c,[[x+375,y],[x+555,y],[x+535,y+h],[x+355,y+h]],'#fff');text(c,score[0],x+406,y+46,42,'#063c9e','center');text(c,score[1],x+493,y+46,42,'#063c9e','center');liveName(c,nm,1,x+745,y+46,175,'#fff');club(c,t,1,x+780,y+46,42);rect(c,x+825,y,145,h,'#06215d');text(c,time,x+898,y+46,29,'#fff','center');rect(c,x+113,y+h,857,4,t.accent);
}else if(t.key==='es.1'){
rect(c,x,y,w,h,'#f9f7f2');rect(c,x,y,103,h,t.accent);logo(c,t,x+51,y+46,65,true);club(c,t,0,x+143,y+46,43);liveName(c,nm,0,x+180,y+46,175,'#151719');rect(c,x+404,y,140,h,'#ffffff');rect(c,x+473,y+20,1,52,'#d4d0ca');text(c,score[0],x+439,y+46,42,'#151719','center');text(c,score[1],x+509,y+46,42,'#151719','center');liveName(c,nm,1,x+744,y+46,175,'#151719');club(c,t,1,x+780,y+46,43);rect(c,x+821,y+15,1,62,'#d3d1cc');text(c,time,x+897,y+46,28,'#151719','center');rect(c,x,y+h,w,4,t.accent);
}else if(t.key==='fr.1'){
rect(c,x,y,110,h,t.accent);logo(c,t,x+55,y+46,68,false);club(c,t,0,x+153,y+46,43);liveName(c,nm,0,x+191,y+46,175,'#fff');rect(c,x+404,y,154,h,t.accent);text(c,score[0],x+443,y+46,42,t.dark,'center');text(c,score[1],x+521,y+46,42,t.dark,'center');liveName(c,nm,1,x+749,y+46,175,'#fff');club(c,t,1,x+784,y+46,43);rect(c,x+824,y+15,1,62,'#879fbe55');text(c,time,x+899,y+46,29,'#fff','center');rect(c,x,y+h,w,4,t.accent);
}else{
rect(c,x,y,w,h,'#fafafa');rect(c,x,y,110,h,t.accent);logo(c,t,x+55,y+46,80,true);club(c,t,0,x+150,y+46,43);liveName(c,nm,0,x+185,y+46,175,'#131517');rect(c,x+403,y,73,h,'#17191b');rect(c,x+476,y,73,h,'#17191b');rect(c,x+475,y+19,1,54,'#ffffff38');text(c,score[0],x+439,y+46,42,'#fff','center');text(c,score[1],x+513,y+46,42,'#fff','center');liveName(c,nm,1,x+749,y+46,175,'#131517');club(c,t,1,x+785,y+46,43);rect(c,x+825,y,145,h,'#eceeed');text(c,time,x+898,y+46,29,'#131517','center');rect(c,x+110,y+h,860,4,t.accent);
}
}
function clip(c,w,h,q,t){c.beginPath();if(['it.1','tr.1'].includes(t.key)){c.moveTo(0,0);c.lineTo(w*q+w*.2,0);c.lineTo(w*q-w*.2,h);c.lineTo(0,h);c.closePath();}else if(t.key==='fr.1')c.rect(0,0,w,h*q);else c.rect(0,0,w*q,h);c.clip();}
function kitBars(key){return key==='it.1'?[132,813]:key==='tr.1'?[113,811]:key==='fr.1'?[111,813]:key==='es.1'?[104,811]:[111,813];}
return{styles,panel,live,clip,kitBars};});
