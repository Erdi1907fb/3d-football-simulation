/* V199: video device profile next to every video export button.
 * Automatic detection stays the default; the choice is stored per browser and read by
 * SekmeVideo.device() (assets/video-core.js), so every mode's export uses the same setting. */
(function(){'use strict';
 const KEY='next90.deviceProfile',ids=['exportBegin','competitionExport','japonExport','penaltyExport','fkExport'];
 const en=()=>document.documentElement.lang==='en'||new URLSearchParams(location.search).get('lang')==='en'||window.Sekme3D?.lang==='en';
 const get=()=>{try{const v=localStorage.getItem(KEY);return v==='desktop'||v==='phone'?v:'auto';}catch{return'auto';}};
 const set=v=>{try{if(v==='auto')localStorage.removeItem(KEY);else localStorage.setItem(KEY,v);}catch{}};
 function labels(select,note){const e=en(),d=window.SekmeVideo?.device?.()?.detected;const names=e?{auto:'Automatic',desktop:'Computer · fast',phone:'Phone · safe'}:{auto:'Otomatik',desktop:'Bilgisayar · hızlı',phone:'Telefon · güvenli'};for(const o of select.options)o.textContent=names[o.value];note.textContent=(e?'Video device · detected: ':'Video cihazı · algılanan: ')+(d?(d.ios||d.mobile?(e?'phone':'telefon'):(e?'computer':'bilgisayar')):'—');}
 function mount(){for(const id of ids){const button=document.getElementById(id);if(!button||button.dataset.deviceProfile)continue;button.dataset.deviceProfile='1';
  const wrap=document.createElement('label'),note=document.createElement('span'),select=document.createElement('select');wrap.className='device-profile';wrap.style.cssText='display:inline-flex;flex-direction:column;gap:2px;font-size:12px;margin:4px 8px 4px 0;vertical-align:middle';
  for(const v of['auto','desktop','phone'])select.add(new Option(v,v));select.value=get();select.onchange=()=>{set(select.value);for(const s of document.querySelectorAll('.device-profile select'))s.value=select.value;};
  wrap.append(note,select);button.parentNode.insertBefore(wrap,button);labels(select,note);addEventListener('sekme-language',()=>labels(select,note));}}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,0),{once:true});else setTimeout(mount,0);
})();
