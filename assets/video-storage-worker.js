/* OPFS synchronous access is supported in Safari workers even without createWritable. */
'use strict';let directory,access,name;
self.onmessage=async({data:m})=>{try{if(m.type==='open'){if(!/^sekme-export-[a-z0-9.-]+\.mp4$/.test(m.name))throw Error('Invalid file name');directory=await navigator.storage.getDirectory();name=m.name;const handle=await directory.getFileHandle(name,{create:true});access=await handle.createSyncAccessHandle();self.postMessage({id:m.id,ok:true});return;}
 if(m.type==='write'){const bytes=new Uint8Array(m.data);let written=0;while(written<bytes.length){const n=access.write(bytes.subarray(written),{at:m.position+written});if(!n)throw Error('Incomplete disk write');written+=n;}self.postMessage({id:m.id,ok:true});return;}
 if(m.type==='close'||m.type==='abort'){if(access){if(m.type==='close')access.flush();access.close();access=null;}self.postMessage({id:m.id,ok:true});return;}throw Error('Unknown storage operation');
}catch(e){try{access?.close();}catch{}access=null;self.postMessage({id:m.id,error:e.message||'Device storage unavailable'});}};
