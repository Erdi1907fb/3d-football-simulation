/* V111: wires every <select data-weather> to the shared weather preference. The same
   preference is read by every new scene, so preview and MP4 export always match. */
(function(){'use strict';const W=window.Next90Weather;if(!W)return;
const en=()=>window.Sekme3D?.lang==='en'||new URLSearchParams(location.search).get('lang')==='en';
function label(sel){for(const o of sel.options){const l=W.labels[o.value];if(l)o.textContent=en()?l[1]:l[0];}const cap=sel.closest('label')?.querySelector('[data-weather-label]');if(cap)cap.textContent=en()?'Weather':'Hava durumu';}
function redraw(){try{window.Sekme3D?.refreshAppearance?.();}catch{}for(const s of[window.Next90FreeKickStudio,window.Next90PenaltyStudio])try{if(s?.contest&&s.draw)s.draw(s.clock??0);}catch{}}
function mount(){for(const sel of document.querySelectorAll('select[data-weather]')){if(sel.dataset.ready)continue;sel.dataset.ready='1';sel.replaceChildren(...W.TYPES.map(v=>new Option(v,v)));sel.value=W.preference();label(sel);sel.addEventListener('change',()=>{W.setPreference(sel.value);for(const o of document.querySelectorAll('select[data-weather]'))o.value=sel.value;redraw();});}}
window.addEventListener('sekme-language',()=>{for(const s of document.querySelectorAll('select[data-weather]'))label(s);});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();})();
