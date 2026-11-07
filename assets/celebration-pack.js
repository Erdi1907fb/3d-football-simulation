/* V109 Next90 celebration pack: 100 named goal celebrations + 14 team routines.
 * Original procedural animation (no FIFA/EA or Mixamo assets). Each celebration is an
 * arrival move (knee slide, belly slide, jump-turn…) followed by a looping signature
 * movement, inspired by well-known real-football celebration types. Presentation only:
 * never reads or changes scores, RNG streams or match timelines.
 * Rig conventions (scene.js actor): shoulder.x <0 raises the arm forward/up (−2.9 = up),
 * shoulder.z (k?1:-1)*v spreads arms sideways, elbow.x <0 bends, hip.x <0 lifts thigh,
 * knee.x >0 bends, waist.position.y≈0.923 standing, body.rotation.x >0 leans forward.
 */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f();else r.Next90CelebrationPack=f();})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),smooth=v=>{v=clamp(v,0,1);return v*v*(3-2*v);},S=Math.sin,PI=Math.PI;
const arm=(a,k,x,z=0,e=0)=>{const m=a.arms[k];if(!m)return;m.shoulder.rotation.x=x;m.shoulder.rotation.z=(k?1:-1)*z;m.elbow.rotation.x=e;};
const both=(a,x,z=0,e=0)=>{arm(a,0,x,z,e);arm(a,1,x,z,e);};
const legs=(a,hip,knee,boot)=>a.legs.forEach(l=>{l.hip.rotation.x=hip;l.knee.rotation.x=knee;if(boot!=null)l.boot.rotation.x=boot;});
const kneel=(a,u,one=false)=>{if(u<=0)return;a.waist.position.y=.923+(.52-.923)*u;a.legs.forEach((l,k)=>{if(one&&k===1){l.hip.rotation.x=-1.2*u;l.knee.rotation.x=1.35*u;l.boot.rotation.x=-.15*u;return;}l.hip.rotation.x=-.55*u;l.knee.rotation.x=(PI/2+.55)*u;l.boot.rotation.x=-(l.hip.rotation.x+l.knee.rotation.x);});};
// GameplayFootball hand-keyed celebration clips (Unlicense), already shipped in clips.glb.
const clip=(a,key,t,v)=>{const C=globalThis.SekmeFootballClips;if(!C?.apply)return MOVES.doublePump(a,t,v);const d=key==='celebrateExtreme'?3.05:2.6;return C.apply(a,key,t%d,1,{mirror:v%2===1,preserveRoot:false});};
// ---- Signature movements (t = seconds into the routine, v = variant 0..5) ----
const MOVES={
 armsWide:(a,t)=>{both(a,-.2,1.35+S(t*3)*.05,-.15);a.head.rotation.x=-.2;},
 fistPump:(a,t,v)=>{const k=Math.floor(t*1.25+v)%2,p=S(t*12);arm(a,k,-1.8+p*.42,.1,-1.25);arm(a,1-k,-.5-Math.max(0,-p)*.5,.35+S(t*6)*.15,-1.1);a.body.rotation.z=S(t*6)*.05;a.body.position.y=Math.max(0,p)*.05;},
 doublePump:(a,t)=>{const p=S(t*9);both(a,-1.25+p*.26,.15,-1.7);a.body.position.y=Math.max(0,p)*.06;},
 skyPoint:(a,t)=>{both(a,-2.9,.12,-.05);a.head.rotation.x=-.4;},
 skyPointOne:(a,t,v)=>{const k=Math.floor(t*.8+v)%2;arm(a,k,-2.85,.05,-.04);arm(a,1-k,-1.2+S(t*5)*.5,.6,-.6);a.head.rotation.x=-.35;},
 earCup:(a,t,v)=>{const k=Math.floor(t*.7+v)%2;arm(a,k,-.5,.8,-2.5);arm(a,1-k,-1.4+S(t*4)*.6,.9,-.3);a.head.rotation.y=(k?1:-1)*.3;a.waist.rotation.y=(k?1:-1)*.15;},
 shush:(a,t,v)=>{const k=v%2;arm(a,k,-.95,-.15,-2.35);arm(a,1-k,-.9-S(t*3)*.4,1.1,-.25);a.head.rotation.x=.08;a.waist.rotation.y=S(t*1.5)*.25;},
 heart:(a)=>{both(a,-.85,-.45,-1.5);a.head.rotation.x=.1;},
 salute:(a,t,v)=>{const k=v%2;arm(a,k,-1.2,.45,-1.8);arm(a,1-k,-.25,.25,-.5);a.body.rotation.x=-.04;a.waist.rotation.y=S(t*1.2)*.3;},
 airplane:(a,t)=>{both(a,0,1.57,-.06);a.body.rotation.z=S(t*2.4)*.16;a.waist.rotation.y=S(t*1.2)*.25;},
 clap:(a,t)=>{both(a,-2.35,.2+S(t*12)*.1,-.7);},
 conductor:(a,t)=>{both(a,-1.6+S(t*7)*.8,.7,-.4);},
 badgeKiss:(a,t)=>{arm(a,0,-.85,-.1,-1.9);arm(a,1,-.75,-.2,-1.7);a.head.rotation.x=.3;},
 pray:(a,t)=>{both(a,-1.1,-.42,-1.55);a.head.rotation.x=-.25+S(t*1.4)*.05;},
 robot:(a,t)=>{const q=Math.floor(t*3.2)%4;arm(a,0,q<2?-1.57:0,.1,q%2?-1.57:0);arm(a,1,q>=2?-1.57:0,.1,q%2?0:-1.57);a.waist.rotation.y=(q-1.5)*.12;a.head.rotation.y=(q%2?1:-1)*.25;},
 dab:(a,t,v)=>{const k=v%2;arm(a,k,-1.9,.95,-.05);arm(a,1-k,-1.6,-.65,-2.2);a.head.rotation.x=.42;a.head.rotation.y=(k?-1:1)*.4;},
 archer:(a,t,v)=>{const k=v%2,draw=smooth(t/.8);arm(a,k,-1.57,.0,-.02);arm(a,1-k,-1.57,-.35*draw,-2.4*draw);a.waist.rotation.y=(k?1:-1)*.55;a.head.rotation.y=(k?1:-1)*.6;},
 calma:(a,t)=>{both(a,-.9+S(t*4)*.12,.35,-.2);a.body.rotation.x=-.05;},
 meditate:(a,t)=>{a.waist.position.y=.42;a.legs.forEach((l,k)=>{l.hip.rotation.x=-1.45;l.hip.rotation.z=(k?1:-1)*.75;l.knee.rotation.x=2.3;});both(a,-.55,.25,-.9);a.head.rotation.x=.05;a.body.rotation.x=-.05;},
 flex:(a,t)=>{both(a,-.15,1.45,-1.8-S(t*5)*.25);a.waist.position.y-=.05;a.head.rotation.x=-.12;},
 coolArms:(a,t)=>{both(a,-.75,-.75,-1.95);a.head.rotation.x=-.18;a.head.rotation.y=.18;},
 binoculars:(a,t)=>{both(a,-1.2,-.5,-2.45);a.head.rotation.y=S(t*1.5)*.45;},
 phone:(a,t,v)=>{const k=v%2;arm(a,k,-.6,.55,-2.6);arm(a,1-k,-1.3,.7+S(t*6)*.3,-.4);a.head.rotation.z=(k?1:-1)*.22;},
 rockBaby:(a,t)=>{both(a,-.7,-.55,-1.35);a.waist.rotation.y=S(t*5)*.28;},
 thumbsBack:(a,t)=>{both(a,.55,.35,-1.0);a.head.rotation.x=-.15;a.waist.rotation.y=S(t*2)*.1;},
 meChest:(a,t)=>{both(a,-.65,-.15,-2.2);a.body.rotation.x=-.12;a.head.rotation.x=-.2;},
 jumpSpin:(a,t)=>{const j=(t*1.6)%1;a.body.position.y=Math.max(0,S(j*PI))*.38;a.waist.rotation.y=smooth(j)*PI*2;both(a,-2.6,.3,-.2);},
 theatreBow:(a,t)=>{const b=Math.max(0,S(t*2));a.body.rotation.x=.65*b;arm(a,1,-.2-.8*b,.2,-1.4*b);arm(a,0,.3,.6,-.1);},
 micDrop:(a,t,v)=>{const k=v%2,drop=t%2>1.2;arm(a,k,drop?-.2:-1.4,.6,drop?-.1:-1.2);arm(a,1-k,drop?-.6:-.3,drop?.9:.3,-.5);a.head.rotation.x=drop?.25:-.1;},
 disbelief:(a,t)=>{both(a,-2.5,-.35,-1.9);a.head.rotation.x=-.25;a.body.rotation.x=-.08;},
 wave:(a,t,v)=>{arm(a,0,-2.5,.45+S(t*8)*.35,-.2);arm(a,1,-2.5,.45+S(t*8+PI)*.35,-.2);a.body.position.y=Math.abs(S(t*4))*.06;},
 siuLand:(a,t)=>{both(a,.15,.85,-.08);legs(a,-.25,.45,-.2);a.waist.position.y-=.12;a.body.rotation.x=-.12;a.head.rotation.x=-.3;},
 goggles:(a,t)=>{both(a,-1.25,-.45,-2.5);a.head.rotation.y=S(t*2)*.3;},
 chefKiss:(a,t,v)=>{const k=v%2,out=(t*1.5)%1>.5;arm(a,k,out?-1.2:-.9,out?.6:-.1,out?-.4:-2.4);arm(a,1-k,-.6,.5,-.9);},
 fingerGuns:(a,t)=>{both(a,-1.4+S(t*7)*.12,.25,-.08);a.waist.rotation.y=S(t*3)*.2;},
 boxing:(a,t)=>{const q=S(t*9)>0;arm(a,0,-1.5,.1,q?-.15:-1.9);arm(a,1,-1.5,.1,q?-1.9:-.15);a.waist.rotation.y=(q?1:-1)*.22;a.body.position.y=Math.abs(S(t*9))*.04;},
 samba:(a,t)=>{a.waist.rotation.y=S(t*7)*.35;a.body.rotation.z=S(t*7)*.08;a.body.position.y=Math.abs(S(t*7))*.07;both(a,-.6+S(t*7)*.4,.5,-1.2);a.legs.forEach((l,k)=>{l.knee.rotation.x=.25+Math.max(0,S(t*7+k*PI))*.4;});},
 shimmy:(a,t)=>{a.body.rotation.z=S(t*14)*.07;both(a,-.25,.55,-1.5);a.waist.rotation.y=S(t*14)*.12;},
 disco:(a,t)=>{const k=Math.floor(t*1.6)%2;arm(a,k,-2.7,.6,-.05);arm(a,1-k,.2,-.4,-.1);a.waist.rotation.y=(k?1:-1)*.3;a.body.position.y=Math.abs(S(t*6))*.05;},
 superman:(a,t)=>{both(a,-1.57,.05,-.02);a.body.rotation.x=.12;a.head.rotation.x=-.1;},
 crossArmsSky:(a,t)=>{both(a,-2.7,-.35,-.35);a.head.rotation.x=-.45;},
 kneeFist:(a,t,v)=>{const k=Math.floor(t*1.1+v)%2;arm(a,k,-1.8+S(t*10)*.35,.1,-1.4);arm(a,1-k,-1.0+S(t*10+PI)*.3,.3,-1.3);},
 clipExtreme:(a,t,v)=>clip(a,'celebrateExtreme',t,v),
 clipNormal:(a,t,v)=>clip(a,'celebrateNormal',t,v),
 kneePoint:(a,t)=>{both(a,-2.8,.12+S(t*2)*.08,-.15);a.head.rotation.x=-.3;}
};
// Arrivals happen at the end of the run (celebrationSlideEnd) or at routine start.
const ARRIVALS={none:null,
 kneeSlide:(a,t)=>{const u=smooth(t/.4)*(1-smooth((t-1.7)/.7));kneel(a,u);a.body.rotation.x=-.25*u;both(a,-.2*u,1.12*u,0);return u;},
 bellySlide:(a,t)=>{const u=smooth(t/.35)*(1-smooth((t-1.6)/.8));a.waist.position.y=.923-.62*u;a.body.rotation.x=1.35*u;both(a,-2.4*u,.55*u,-.1);legs(a,.15*u,.2*u);a.head.rotation.x=-.9*u;return u;},
 jumpTurn:(a,t)=>{const j=clamp(t/.9,0,1);a.body.position.y=S(j*PI)*.62;a.waist.rotation.y=smooth(j)*PI;both(a,-1.3*(1-j)+.15*j,.85*j,-.1);legs(a,-.3*S(j*PI),.6*S(j*PI));return t<1.1?1:0;},
 leap:(a,t)=>{const j=clamp(t/.7,0,1);a.body.position.y=S(j*PI)*.5;arm(a,1,-2.6,.1,-.2);legs(a,-.4*S(j*PI),.9*S(j*PI));return t<.9?1:0;},
 sideSlide:(a,t)=>{const u=smooth(t/.35)*(1-smooth((t-1.4)/.7));a.waist.position.y=.923-.55*u;a.body.rotation.z=.7*u;a.body.rotation.x=-.2*u;both(a,-1.6*u,.4*u,-.4);legs(a,-.6*u,.4*u);return u;},
 kneelDown:(a,t)=>{const u=smooth(t/.5);kneel(a,u);return 0;},
 oneKnee:(a,t)=>{const u=smooth(t/.5);kneel(a,u,true);return 0;}
};
const KNEEL_MOVES=new Set(['pray','kneeFist','kneePoint']);
// 100 celebrations: [id, Turkish name, English name, arrival, move, ground]
const NAMES=[
['knee-slide-arms','Diz üstü kayış · kollar açık','Knee slide · arms wide','kneeSlide','armsWide'],['knee-slide-sky','Diz üstü kayış · gökyüzüne','Knee slide · point to the sky','kneeSlide','skyPoint'],['knee-slide-fist','Diz üstü kayış · yumruk','Knee slide · fist pump','kneeSlide','fistPump'],['knee-slide-badge','Diz üstü kayış · arma öpücüğü','Knee slide · badge kiss','kneeSlide','badgeKiss'],['knee-slide-roar','Diz üstü kayış · kükreme','Knee slide · roar','kneeSlide','flex'],['knee-slide-ear','Diz üstü kayış · duymuyorum','Knee slide · ear cup','kneeSlide','earCup'],['knee-slide-pray','Diz üstü kayış · dua','Knee slide · prayer','kneeSlide','pray'],['knee-slide-heart','Diz üstü kayış · kalp','Knee slide · heart','kneeSlide','heart'],['knee-slide-clap','Diz üstü kayış · alkış','Knee slide · applause','kneeSlide','clap'],['knee-slide-cross','Diz üstü kayış · kollar çapraz','Knee slide · crossed arms up','kneeSlide','crossArmsSky'],
['knee-slide-shush','Diz üstü kayış · sus işareti','Knee slide · shush','kneeSlide','shush'],['knee-slide-guns','Diz üstü kayış · parmak tabancalar','Knee slide · finger guns','kneeSlide','fingerGuns'],['belly-superman','Göğüs üstü kayış · süpermen','Belly slide · superman','bellySlide','superman'],['belly-arms','Göğüs üstü kayış · kollar açık','Belly slide · arms wide','bellySlide','armsWide'],['belly-clap','Göğüs üstü kayış · alkış','Belly slide · applause','bellySlide','clap'],['belly-flex','Göğüs üstü kayış · güç gösterisi','Belly slide · flex','bellySlide','flex'],['side-slide-point','Yan kayış · tribünü göster','Side slide · point to the crowd','sideSlide','skyPointOne'],['side-slide-wave','Yan kayış · el salla','Side slide · wave','sideSlide','wave'],['side-slide-fist','Yan kayış · yumruk','Side slide · fist pump','sideSlide','fistPump'],['side-slide-cool','Yan kayış · soğukkanlı','Side slide · cool arms','sideSlide','coolArms'],
['jump-turn-land','Zıpla, dön ve yere bas','Jump, turn and land','jumpTurn','siuLand'],['jump-turn-sky','Zıplayıp dön · gökyüzü','Jump-turn · sky point','jumpTurn','skyPoint'],['jump-turn-flex','Zıplayıp dön · güç','Jump-turn · flex','jumpTurn','flex'],['jump-turn-calma','Zıplayıp dön · sakin ol','Jump-turn · calm down','jumpTurn','calma'],['jump-turn-arms','Zıplayıp dön · kollar açık','Jump-turn · arms wide','jumpTurn','armsWide'],['jump-turn-me','Zıplayıp dön · “bu benim”','Jump-turn · “it’s me”','jumpTurn','meChest'],['leap-punch','Havaya sıçra · yumruk','Leap and punch the air','leap','fistPump'],['leap-double','Havaya sıçra · çift yumruk','Leap · double pump','leap','doublePump'],['leap-sky','Havaya sıçra · iki el yukarı','Leap · both hands up','leap','skyPoint'],['leap-conductor','Havaya sıçra · orkestra şefi','Leap · crowd conductor','leap','conductor'],
['arms-wide','Kollar açık koşu','Arms-wide run','none','armsWide'],['airplane','Uçak','Airplane','none','airplane'],['airplane-tilt','Uçak · yatış','Airplane bank','none','airplane'],['fist-pump','Yumruk sallama','Fist pump','none','fistPump'],['double-pump','Çift yumruk','Double fist pump','none','doublePump'],['sky-point','Gökyüzünü göster','Point to the sky','none','skyPoint'],['sky-point-one','Tek elle gökyüzü','One-hand sky point','none','skyPointOne'],['ear-cup','Duymuyorum','Ear cup','none','earCup'],['shush','Sus işareti','Shush','none','shush'],['heart','Kalp','Heart hands','none','heart'],
['salute','Asker selamı','Salute','none','salute'],['clap-crowd','Tribünü alkışla','Applaud the crowd','none','clap'],['conductor','Orkestra şefi','Crowd conductor','none','conductor'],['badge-kiss','Arma öpücüğü','Badge kiss','none','badgeKiss'],['robot','Robot dansı','Robot dance','none','robot'],['dab','Dab','Dab','none','dab'],['archer','Okçu','Archer','none','archer'],['calma','Sakin ol','Calm down','none','calma'],['meditate','Meditasyon','Meditation','none','meditate'],['flex','Pazı gösterisi','Muscle flex','none','flex'],
['cool-arms','Kollar bağlı · soğukkanlı','Arms folded · ice cold','none','coolArms'],['binoculars','Dürbün','Binoculars','none','binoculars'],['phone-call','Telefon','Phone call','none','phone'],['rock-baby','Bebek sallama','Rock the baby','none','rockBaby'],['thumbs-back','İsmimi oku (forma arkası)','Read my name (thumbs to back)','none','thumbsBack'],['me-chest','“Bu benim”','“It’s me”','none','meChest'],['jump-spin','Zıplayarak dönme','Jump spin','none','jumpSpin'],['theatre-bow','Tiyatro selamı','Theatre bow','none','theatreBow'],['mic-drop','Mikrofon bırakma','Mic drop','none','micDrop'],['disbelief','İnanamıyorum','Disbelief','none','disbelief'],
['wave','Tribüne el salla','Wave to the crowd','none','wave'],['goggles','Gözlük','Goggles','none','goggles'],['chef-kiss','Şef öpücüğü','Chef’s kiss','none','chefKiss'],['finger-guns','Parmak tabancalar','Finger guns','none','fingerGuns'],['boxing','Gölge boksu','Shadow boxing','none','boxing'],['samba','Samba','Samba','none','samba'],['shimmy','Omuz dansı','Shoulder shimmy','none','shimmy'],['disco','Disko','Disco','none','disco'],['superman-run','Süpermen','Superman','none','superman'],['cross-arms-sky','Kollar çapraz yukarı','Crossed arms to the sky','none','crossArmsSky'],
['kneel-pray','Diz çök · dua','Kneel · prayer','kneelDown','pray'],['kneel-fist','Diz çök · yumruk','Kneel · fist','kneelDown','kneeFist'],['kneel-point','Diz çök · gökyüzü','Kneel · sky point','kneelDown','kneePoint'],['one-knee-point','Tek diz · gökyüzü','One knee · sky point','oneKnee','kneePoint'],['one-knee-fist','Tek diz · yumruk','One knee · fist','oneKnee','kneeFist'],['one-knee-arrow','Tek diz · okçu','One knee · archer','oneKnee','archer'],['one-knee-badge','Tek diz · arma','One knee · badge','oneKnee','badgeKiss'],['one-knee-heart','Tek diz · kalp','One knee · heart','oneKnee','heart'],['one-knee-shush','Tek diz · sus','One knee · shush','oneKnee','shush'],['one-knee-flex','Tek diz · güç','One knee · flex','oneKnee','flex'],
['leap-heart','Sıçra · kalp','Leap · heart','leap','heart'],['leap-salute','Sıçra · selam','Leap · salute','leap','salute'],['leap-ear','Sıçra · duymuyorum','Leap · ear cup','leap','earCup'],['leap-dab','Sıçra · dab','Leap · dab','leap','dab'],['leap-robot','Sıçra · robot','Leap · robot','leap','robot'],['jump-turn-archer','Zıplayıp dön · okçu','Jump-turn · archer','jumpTurn','archer'],['jump-turn-guns','Zıplayıp dön · tabancalar','Jump-turn · finger guns','jumpTurn','fingerGuns'],['jump-turn-wave','Zıplayıp dön · el salla','Jump-turn · wave','jumpTurn','wave'],['knee-slide-robot','Diz üstü kayış · robot','Knee slide · robot','kneeSlide','robot'],['knee-slide-boxing','Diz üstü kayış · boks','Knee slide · boxing','kneeSlide','boxing'],
['belly-sky','Göğüs üstü kayış · gökyüzü','Belly slide · sky point','bellySlide','skyPoint'],['belly-meditate','Göğüs üstü kayış · meditasyon','Belly slide · meditation','bellySlide','meditate'],['side-slide-dab','Yan kayış · dab','Side slide · dab','sideSlide','dab'],['side-slide-samba','Yan kayış · samba','Side slide · samba','sideSlide','samba'],['side-slide-phone','Yan kayış · telefon','Side slide · phone','sideSlide','phone'],['leap-disco','Sıçra · disko','Leap · disco','leap','disco'],['jump-spin-sky','Dönerek zıpla · gökyüzü','Spin jump · sky','jumpTurn','crossArmsSky'],['knee-slide-calma','Diz üstü kayış · sakin ol','Knee slide · calm down','kneeSlide','calma'],['knee-slide-binoculars','Diz üstü kayış · dürbün','Knee slide · binoculars','kneeSlide','binoculars'],['knee-slide-me','Diz üstü kayış · “bu benim”','Knee slide · “it’s me”','kneeSlide','meChest'],
['wild-joy','Çılgın sevinç (GameplayFootball klibi)','Wild joy (GameplayFootball clip)','none','clipExtreme'],['joy','Coşkulu sevinç (GameplayFootball klibi)','Joy (GameplayFootball clip)','none','clipNormal'],['knee-slide-wild','Diz üstü kayış · çılgın sevinç','Knee slide · wild joy','kneeSlide','clipExtreme'],['jump-turn-joy','Zıplayıp dön · coşku','Jump-turn · joy','jumpTurn','clipNormal'],['belly-joy','Göğüs üstü kayış · coşku','Belly slide · joy','bellySlide','clipNormal'],['side-slide-wild','Yan kayış · çılgın sevinç','Side slide · wild joy','sideSlide','clipExtreme']];
const LIST=NAMES.map(([id,tr,en,arrival,move],i)=>({id,index:i,tr,en,arrival,move,style:'pack:'+id}));
const BY_ID=new Map(LIST.map(c=>[c.id,c]));
// Team routines for non-scorers during the group stage.
const TEAM=['huddle','pileOn','jumpTogether','pointAtScorer','bowToScorer','clapCircle','armsLinked','fistBump','liftScorer','skyTogether','waveCrowd','danceLine','highFive','slideTogether'];
const SLIDES=LIST.filter(c=>['kneeSlide','bellySlide','sideSlide'].includes(c.arrival)),KNEE=LIST.filter(c=>c.arrival==='kneeSlide'),OTHERS=LIST.filter(c=>!SLIDES.includes(c));
// Small, on-the-spot reactions for a single penalty/free-kick goal (no runs, no slides).
const SMALL=LIST.filter(c=>c.arrival==='none'&&['fistPump','doublePump','armsWide','skyPoint','skyPointOne','earCup','shush','heart','badgeKiss','clap','calma','coolArms','flex','meChest','crossArmsSky','clipNormal','wave','disbelief','fingerGuns'].includes(c.move));
const hash=(seed,index)=>(Math.imul((seed>>>0)^0x9e3779b9,2654435761)+Math.imul(index+1,40503))>>>0;
function choose(n,mode){const r=n%100,m=n>>>7;if(mode==='small')return SMALL[m%SMALL.length];if(mode==='big')return r<45?KNEE[m%KNEE.length]:r<65?SLIDES[m%SLIDES.length]:LIST[m%LIST.length];return r<28?KNEE[m%KNEE.length]:r<40?SLIDES[m%SLIDES.length]:OTHERS[m%OTHERS.length];}
function pick(seed,index=0,exclude=null,mode='goal'){const n=hash(seed,index);let c=choose(n,mode);if(exclude&&c.id===exclude)c=choose(n+977,mode);return{style:c.style,id:c.id,variant:(n>>>8)%6,team:TEAM[(n>>>4)%TEAM.length],soloSeconds:c.arrival==='none'?3.0:3.6,name:c};}
function get(style){return typeof style==='string'&&style.startsWith('pack:')?BY_ID.get(style.slice(5))||null:null;}
// Scorer: called by scene.js after the legacy style block.
function apply(a,p,state){const c=get(p.celebrationStyle);if(!c||!a?.arms||!a.legs)return false;const stage=p.celebrationStage,age=p.celebrationTime||0,v=p.celebrationVariant||0;
 if(stage==='run'){const arr=ARRIVALS[c.arrival],slide=(p.celebrationSlideEnd||0)-1.8;if(arr&&['kneeSlide','bellySlide','sideSlide'].includes(c.arrival)&&age>slide&&age<slide+2.6){arr(a,age-slide);slideMark(a,p,age-slide,c);return true;}if(age>.35){const run=[(x,y)=>both(x,-2.6+S(y*7)*.25,.35,-.3),(x,y)=>both(x,-.15,1.4,-.1),(x,y)=>{arm(x,0,-1.6+S(y*9)*.6,.2,-1.3);arm(x,1,-1.6+S(y*9+PI)*.6,.2,-1.3);},(x,y)=>both(x,-1.9,.9+S(y*6)*.2,-.6),(x,y)=>{arm(x,0,-2.7,.25,-.1);arm(x,1,-.6+S(y*8)*.5,.6,-1.0);},(x,y)=>{arm(x,1,-2.7,.25,-.1);arm(x,0,-.6+S(y*8)*.5,.6,-1.0);}][(v+c.index)%6];run(a,age);a.head.rotation.x=-.12;}if(c.arrival==='none'&&age>.6){const m=MOVES[c.move];if(m&&!['meditate','robot','boxing','samba','shimmy','disco','jumpSpin'].includes(c.move)){m(a,age,v);a.waist.position.y=Math.min(a.waist.position.y,.923);return true;}}return false;}
 if(stage!=='solo'&&stage!=='group')return false;
 const t=stage==='solo'?Math.max(0,age-(p.celebrationSoloStart||0)):(state?.celebration?.groupAge||age),arr=ARRIVALS[c.arrival];let busy=0;
 if(arr&&stage==='solo'&&['jumpTurn','leap'].includes(c.arrival))busy=arr(a,t);
 else if(arr&&stage==='solo'&&!p.celebrationSlideEnd&&['kneeSlide','bellySlide','sideSlide'].includes(c.arrival)&&t<2.4){arr(a,t);busy=1;const h=p.heading||0,d=1.9*smooth(t/1.15);if(a.root){a.root.position.x+=Math.sin(h)*d;a.root.position.z+=Math.cos(h)*d;}slideMark(a,p,t,c);}else if(stage==='solo'&&!p.celebrationSlideEnd&&['kneeSlide','bellySlide','sideSlide'].includes(c.arrival)){const h=p.heading||0;if(a.root){a.root.position.x+=Math.sin(h)*1.9;a.root.position.z+=Math.cos(h)*1.9;}}
 if(!busy){const m=MOVES[c.move];if(m)m(a,Math.max(0,t-(['jumpTurn','leap'].includes(c.arrival)?1.1:!p.celebrationSlideEnd&&['kneeSlide','bellySlide','sideSlide'].includes(c.arrival)?2.4:0)),v);}
 if(c.arrival==='kneelDown'||KNEEL_MOVES.has(c.move)&&c.arrival!=='oneKnee')kneel(a,smooth(t/.5));else if(c.arrival==='oneKnee')kneel(a,smooth(t/.5),true);
 return true;}
// Team-mates: one routine shared by the group, with per-player phase offsets.
function team(a,p,state,routine){if(!a?.arms||!a.legs)return false;const t=(state?.celebration?.groupAge??p.celebrationTime??0)+(a.index||0)*.07,i=a.index||0,beat=S(t*8+i*.3);
 switch(routine){
  case'huddle':both(a,-.9,-.35,-.9);a.body.rotation.x=.35;a.body.position.y=Math.max(0,beat)*.05;break;
  case'pileOn':a.body.rotation.x=.55+S(t*3+i)*.08;both(a,-1.3,-.2,-.5);kneel(a,i%3===0?.6:0);break;
  case'jumpTogether':a.body.position.y=Math.max(0,S(t*7))*.32;both(a,-2.6,.25,-.2);break;
  case'pointAtScorer':arm(a,i%2,-1.5,-.15,-.05);arm(a,1-i%2,-.2,.3,-.3);break;
  case'bowToScorer':{const b=Math.max(0,S(t*2.4+i*.2));a.body.rotation.x=.75*b;both(a,-2.4*b,.1,-.1);kneel(a,.85);break;}
  case'clapCircle':both(a,-1.3,.15+Math.max(0,S(t*12))*.18,-1.2);break;
  case'armsLinked':both(a,-.25,1.25,-.25);a.body.position.y=Math.max(0,beat)*.12;a.waist.rotation.y=S(t*4)*.08;break;
  case'fistBump':arm(a,i%2,-1.5,.1,-1.0-Math.max(0,beat)*.4);break;
  case'liftScorer':both(a,-2.5,.25,-.6);a.waist.position.y-=.08;break;
  case'skyTogether':both(a,-2.9,.12,-.05);a.head.rotation.x=-.35;break;
  case'waveCrowd':arm(a,i%2,-2.5,.45+S(t*8)*.35,-.2);break;
  case'danceLine':a.waist.rotation.y=S(t*6+i)*.3;a.body.position.y=Math.abs(S(t*6))*.08;both(a,-.6+S(t*6)*.3,.45,-1.2);break;
  case'highFive':arm(a,i%2,-2.6,.25,-.15);a.body.position.y=Math.max(0,S(t*5+i))*.18;break;
  case'slideTogether':{const u=smooth(t/.4)*(1-smooth((t-2.2)/.6));kneel(a,u);both(a,-.25,1.1*u,-.1);break;}
  default:return false;}
 return true;}
// ---- Knee/body slide marks torn into the turf (deterministic per playback, reset on rewind) ----
let trails=null;
function slideMark(a,p,t,c){if(!trails||!a.root||t<.15||t>1.5)return;const h=p.heading||0,x=a.root.position.x,z=a.root.position.z,cx=Math.cos(h),sx=Math.sin(h),w=c.arrival==='bellySlide'?.22:.16;trails.add(a.index??0,[{x:x+cx*w,z:z-sx*w},{x:x-cx*w,z:z+sx*w}],c.arrival==='bellySlide'?.42:.13);}
function createTrails(T,parent){if(!T||!parent)return null;const max=10,points=90,strips=[],mat=new T.MeshBasicMaterial({color:0xb8c486,transparent:true,opacity:.62,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});const dark=new T.MeshBasicMaterial({color:0x3f5a2b,transparent:true,opacity:.5,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
 for(let i=0;i<max;i++){const g=new T.BufferGeometry(),pos=new Float32Array(points*2*3),idx=[];for(let k=0;k<points-1;k++){const a=k*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}g.setAttribute('position',new T.BufferAttribute(pos,3));g.setIndex(idx);g.setDrawRange(0,0);const m=new T.Mesh(g,i%2?dark:mat);m.frustumCulled=false;m.renderOrder=1;m.userData.noBatch=true;parent.add(m);strips.push({mesh:m,n:0,last:null,owner:null});}
 let lastT=-1,key=null;
 return{frame(state){const t=state?.t??state?.time??0,k=state?.chance?(state.chance.minute+'|'+state.chance.team+'|'+(state.chance.start??'')):'';if(t<lastT-.05||k!==key){for(const s of strips){s.n=0;s.last=null;s.owner=null;s.mesh.geometry.setDrawRange(0,0);}key=k;}lastT=t;},
  add(owner,knees,width){knees.forEach((kp,j)=>{const id=owner*2+j;let s=strips.find(q=>q.owner===id);if(!s){s=strips.find(q=>q.owner===null);if(!s)return;s.owner=id;}if(s.last&&Math.hypot(kp.x-s.last.x,kp.z-s.last.z)<.06)return;if(s.n>=points)return;const pos=s.mesh.geometry.attributes.position.array,dir=s.last?{x:kp.x-s.last.x,z:kp.z-s.last.z}:{x:1,z:0},l=Math.hypot(dir.x,dir.z)||1,nx=-dir.z/l*width/2,nz=dir.x/l*width/2,o=s.n*6;pos[o]=kp.x+nx;pos[o+1]=.014;pos[o+2]=kp.z+nz;pos[o+3]=kp.x-nx;pos[o+4]=.014;pos[o+5]=kp.z-nz;if(s.n===0){pos[o]=kp.x;pos[o+2]=kp.z;}s.n++;s.last=kp;s.mesh.geometry.attributes.position.needsUpdate=true;s.mesh.geometry.setDrawRange(0,Math.max(0,(s.n-1)*6));});},
  get count(){return strips.filter(s=>s.n>1).length;},dispose(){for(const s of strips){s.mesh.geometry.dispose();parent.remove(s.mesh);}mat.dispose();dark.dispose();}};}
function useTrails(T,parent){trails=createTrails(T,parent);return trails;}
// ---- Set-piece gestures shared by studios (keeper organising the wall, taker placing the ball, lying wall player) ----
function gesture(a,p){if(!a?.arms||!a.legs)return false;const t=p.gestureTime||0;switch(p.gesture){
 case'organizeWall':{const k=p.gestureSide>0?1:0;arm(a,k,-1.5+S(t*6)*.2,1.25,-.15);arm(a,1-k,-.4,.3,-.7);a.head.rotation.y=(k?1:-1)*.5;break;}
 case'placeBall':{const u=smooth(t/.35)*(1-smooth((t-.55)/.25));a.body.rotation.x=.75*u;kneel(a,.55*u);both(a,-1.0*u,.1,-.3*u);a.head.rotation.x=.4*u;break;}
 case'focus':{both(a,-.15,.25,-.35);a.body.position.y=S(t*1.6)*.015;a.head.rotation.x=.08;break;}
 case'lieDown':{a.waist.position.y=.16;a.body.rotation.z=PI/2;a.body.rotation.x=0;both(a,-.3,.2,-.4);legs(a,-.05,.1,0);break;}
 case'wallCover':{both(a,-.35,-.25,-1.45);break;}
 case'sad':{const C=globalThis.SekmeFootballClips;if(C?.apply)C.apply(a,'sad',Math.min(t,2.4),1,{});else{a.body.rotation.x=.25;both(a,-2.4,-.3,-1.9);}break;}
 default:return false;}return true;}
return{list:LIST,small:SMALL,useTrails,gesture,teamRoutines:TEAM,moves:Object.keys(MOVES),arrivals:Object.keys(ARRIVALS),pick,get,apply,team,version:'celebration-pack-v109'};
});
