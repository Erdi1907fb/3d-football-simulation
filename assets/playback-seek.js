(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f();else r.SekmePlaybackSeek=f();})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
function attach(input,api){let dragging=false,resume=false;
 const start=()=>{if(api.blocked())return false;if(!dragging){dragging=true;resume=api.running();api.pause();}return true;};
 const seek=()=>{if(!start())return;const duration=api.duration(),ratio=Math.max(0,Math.min(1,Number(input.value)/1000));api.seek(ratio*duration);paint(ratio);};
 const end=()=>{if(!dragging)return;dragging=false;if(resume&&!api.blocked()&&api.time()<api.duration()-.001)api.resume();resume=false;};
 function paint(ratio){input.style.setProperty('--played',Math.max(0,Math.min(100,ratio*100))+'%');}
 input.addEventListener('pointerdown',e=>{if(start())input.setPointerCapture?.(e.pointerId);});input.addEventListener('input',seek);input.addEventListener('change',end);input.addEventListener('pointerup',end);input.addEventListener('pointercancel',end);input.addEventListener('lostpointercapture',end);
 return{sync(time,duration,disabled){input.disabled=!!disabled;const ratio=duration?time/duration:0;if(!dragging)input.value=String(ratio*1000);paint(ratio);input.setAttribute('aria-valuetext',Math.floor(time)+' / '+Math.ceil(duration)+' s');},cancel(){dragging=false;resume=false;}};
}
return{attach};
});
