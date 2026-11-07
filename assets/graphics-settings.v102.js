/* Presentation settings never enter the match random seed or simulation state. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f();else r.SekmeGraphics=f();})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const KEY='sekme.graphics.v102',presets={high:{id:'high',label:'Yüksek / Video',targetFps:60,maxDimension:2560,tufts:24000,shadows:true,shadowSize:2048,crowd:'high',anisotropy:16},balanced:{id:'balanced',label:'Dengeli',targetFps:60,maxDimension:1920,tufts:12000,shadows:false,shadowSize:1024,crowd:'balanced',anisotropy:8},low:{id:'low',label:'Düşük / Mobil',targetFps:30,maxDimension:1280,tufts:0,shadows:false,shadowSize:512,crowd:'low',anisotropy:4}};
function normalize(v){return presets[v]?v:'balanced';}function read(){try{return normalize(localStorage.getItem(KEY)||((typeof navigator!=='undefined'&&/Android|iPhone|iPad/.test(navigator.userAgent))?'low':'high'));}catch{return'balanced';}}
let current=read();function get(v){return{...presets[normalize(v||current)]};}function set(v){current=normalize(v);try{localStorage.setItem(KEY,current);}catch{}return get();}
function configureRenderer(renderer,T){const p=get();renderer.shadowMap.enabled=p.shadows;renderer.shadowMap.type=T.PCFSoftShadowMap;return p;}
return{get,set,presets,configureRenderer};});
