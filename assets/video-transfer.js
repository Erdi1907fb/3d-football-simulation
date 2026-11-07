(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SekmeVideoTransfer=api;})(typeof window==='object'?window:globalThis,function(){'use strict';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const aborted=()=>new DOMException('Cancelled','AbortError');
function failure(message,status){const e=new Error(message);e.status=status;return e;}
async function request(env,url,options={},signal,timeout=60000){
 const controller=new AbortController(),stop=()=>controller.abort();if(signal?.aborted)throw aborted();signal?.addEventListener('abort',stop,{once:true});const timer=setTimeout(stop,timeout);
 try{const response=await env.fetch(url,{...options,credentials:'same-origin',cache:'no-store',signal:controller.signal});if(!response.ok)throw failure('File transfer HTTP '+response.status,response.status);const data=await response.json();if(!data||typeof data!=='object')throw Error('Invalid transfer response');return data;}
 catch(e){if(signal?.aborted)throw aborted();throw e;}
 finally{clearTimeout(timer);signal?.removeEventListener('abort',stop);}
}
async function retry(fn,signal){let last;for(let i=0;i<4;i++){if(signal?.aborted)throw aborted();try{return await fn();}catch(e){last=e;if(signal?.aborted)throw aborted();if(e.status&&e.status<500&&e.status!==408&&e.status!==429)throw e;if(i<3)await pause(300*2**i);}}throw last;}
function create(env=globalThis){let capability;
 const endpoint=()=>new URL('export.php',env.location.href).href;
 const path=(action,session)=>endpoint()+'?action='+action+(session?'&id='+encodeURIComponent(session.id):'');
 async function supported(){
  if(!/^https?:$/.test(env.location?.protocol||'')||!env.crypto?.subtle||!env.fetch)return false;
  if(!capability)capability=request(env,path('capabilities'),{},null,12000).then(c=>c.supported&&c.chunkBytes>0?c:false).catch(()=>{capability=null;return false;});return capability;
 }
 async function upload(file,name,{signal,onProgress=()=>{},session=null,onSession=()=>{}}={}){
  const caps=await supported();if(!caps)throw failure('Server download unavailable',503);if(file.size>caps.maxBytes)throw failure('Temporary storage limit',413);
  const post=(action,s,body,headers={})=>retry(()=>request(env,path(action,s),{method:'POST',headers:{'X-Upload-Token':s?.token||'','Content-Type':'application/octet-stream',...headers},body},signal),signal);
  if(!session||session.size!==file.size||session.expires*1000<Date.now()){
   // Creation is not retried automatically: an acknowledgement could have been lost.
   session=await request(env,path('create'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({size:file.size,name,mime:file.type||(/\.webm$/i.test(name)?'video/webm':/\.zip$/i.test(name)?'application/zip':'video/mp4')})},signal);
   if(!/^[a-f0-9]{32}$/.test(session.id)||!/^[a-f0-9]{48}$/.test(session.token))throw Error('Invalid transfer session');onSession(session);
  }
  let state=await post('status',session);if(state.size!==file.size||!Number.isSafeInteger(state.offset)||state.offset<0||state.offset>file.size)throw Error('Invalid transfer offset');
  let offset=state.offset;onProgress(offset/file.size);
  const chunkBytes=Math.min(2097152,caps.chunkBytes),prepare=async from=>{if(signal?.aborted)throw aborted();const end=Math.min(file.size,from+chunkBytes),bytes=await file.slice(from,end).arrayBuffer(),digest=[...new Uint8Array(await env.crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');return{from,end,bytes,digest};};
  let next=!state.ready&&offset<file.size?prepare(offset):null;next?.catch(()=>{});
  while(!state.ready&&offset<file.size){
   if(signal?.aborted)throw aborted();const chunk=await next;
   // Read and hash the next bounded chunk while this request uses the network.
   next=chunk.end<file.size?prepare(chunk.end):null;next?.catch(()=>{});
   state=await retry(()=>request(env,path('chunk',session)+'&offset='+chunk.from,{method:'POST',headers:{'X-Upload-Token':session.token,'X-Chunk-SHA256':chunk.digest,'Content-Type':'application/octet-stream'},body:chunk.bytes},signal),signal);
   if(state.offset!==chunk.end)throw Error('Incomplete transfer acknowledgement');offset=chunk.end;onProgress(offset/file.size);
  }
  state=await post('finish',session);if(!state.ready||state.offset!==file.size)throw Error('Incomplete server file');return {url:path('file',session),session};
 }
 return {supported,upload};
}
return {create};
});
