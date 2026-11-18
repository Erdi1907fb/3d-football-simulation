/* V199: video device profile next to every video export button.
 * Automatic detection stays the default; the choice is stored per browser and read by
 * SekmeVideo.device() (assets/video-core.js), so every mode's export uses the same setting. */
(function(){'use strict';
 const KEY='next90.deviceProfile',ids=['exportBegin','competitionExport','japonExport','penaltyExport','fkExport'];
 const en=()=>document.documentElement.lang==='en'||new URLSearchParams(location.search).get('lang')==='en'||window.Sekme3D?.lang==='en';
 const get=()=>{try{const v=localStorage.getItem(KEY);return v==='desktop'||v==='phone'?v:'auto';}catch{return'auto';}};
 const set=v=>{try{if(v==='auto')localStorage.removeItem(KEY);else localStorage.setItem(KEY,v);}catch{}};
 function labels(select,note){const e=en(),d=window.SekmeVideo?.device?.()?.detected;const names=e?{auto:'Automatic',desktop:'Computer · fast',phone:'Phone · safe'}:{auto:'Otomatik',desktop:'Bilgisayar · hızlı',phone:'Telefon · güvenli'};for(const o of select.options)o.textContent=names[o.value];note.textContent=(e?'Video device · detected: ':'Video cihazı · algılanan: ')+(d?(d.ios||d.mobile?(e?'phone':'telefon'):(e?'computer':'bilgisayar')):'—');}
 /* V209: video speed select next to every studio export (the Competition Studio keeps its own) */
 const SPEEDS=Array.from({length:21},(_,i)=>Math.round((1+i/10)*10)/10),SKEY='next90.videoSpeed';
 const duration=()=>{try{return window.Next90PenaltyStudio?.contest?.duration||window.Next90FreeKickStudio?.contest?.duration||window.Next90JaponStudio?.videoDuration||window.Sekme3D?.videoDuration||0;}catch{return 0;}};
 const clock=s=>Math.floor(s/60)+':'+String(Math.round(s%60)).padStart(2,'0');
 function speedLabels(sel){const e=en(),d=duration();for(const o of sel.options){const v=Number(o.value);o.textContent=(v===1?(e?'Normal (1.0x)':'Normal (1.0x)'):v.toFixed(1)+'x')+(d>0?' · '+clock(d/v):'');}const cap=sel.parentNode?.querySelector('[data-speed-note]');if(cap)cap.textContent=e?'Video speed':'Video hızı';}
 function speedBox(button){if(button.id==='competitionExport'||document.querySelector('select[data-video-speed]'))return;const wrap=document.createElement('label'),note=document.createElement('span'),sel=document.createElement('select');note.dataset.speedNote='1';wrap.className='video-speed';wrap.style.cssText='display:inline-flex;flex-direction:column;gap:2px;font-size:12px;margin:4px 8px 4px 0;vertical-align:middle';sel.dataset.videoSpeed='1';for(const v of SPEEDS)sel.add(new Option(String(v),String(v)));let saved='1';try{saved=localStorage.getItem(SKEY)||'1';}catch{}sel.value=SPEEDS.includes(Number(saved))?String(Number(saved)):'1';sel.onchange=()=>{try{localStorage.setItem(SKEY,sel.value);}catch{}};for(const ev of['focus','pointerdown','touchstart','mouseenter'])sel.addEventListener(ev,()=>speedLabels(sel),{passive:true});wrap.append(note,sel);button.parentNode.insertBefore(wrap,button);speedLabels(sel);addEventListener('sekme-language',()=>speedLabels(sel));setInterval(()=>{if(!document.hidden)speedLabels(sel);},2500);}
 function mount(){for(const id of ids){const button=document.getElementById(id);if(!button||button.dataset.deviceProfile)continue;button.dataset.deviceProfile='1';speedBox(button);
  const wrap=document.createElement('label'),note=document.createElement('span'),select=document.createElement('select');wrap.className='device-profile';wrap.style.cssText='display:inline-flex;flex-direction:column;gap:2px;font-size:12px;margin:4px 8px 4px 0;vertical-align:middle';
  for(const v of['auto','desktop','phone'])select.add(new Option(v,v));select.value=get();select.onchange=()=>{set(select.value);for(const s of document.querySelectorAll('.device-profile select'))s.value=select.value;};
  wrap.append(note,select);button.parentNode.insertBefore(wrap,button);labels(select,note);addEventListener('sekme-language',()=>labels(select,note));}}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,0),{once:true});else setTimeout(mount,0);
})();
