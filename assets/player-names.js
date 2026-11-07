/* Source playing names take precedence over legal-name abbreviations. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f();else r.SekmePlayerNames=f();})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
function display(p){const name=String(p.playingName||p.name||p.displayName||'').trim();if(/gabriel.*(?:gomes.*sara|sara)/i.test(name))return'Gabriel Sara';return name;}
function compact(p){const name=display(p);if(name==='Gabriel Sara')return'G. Sara';if(p.playingName&&p.shortName)return String(p.shortName);if(p.shortName&&p.shortName!==p.name)return String(p.shortName);const bits=name.split(/\s+/u);return bits.length<2?name:Array.from(bits[0])[0]+'. '+bits.at(-1);}
function normalize(p){return{...p,name:display(p),shortName:compact(p)};}
return{display,compact,normalize};
});
