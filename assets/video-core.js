/* Independent, bounded-memory match export. No screen/camera/microphone capture. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./team-audio.js'));else root.SekmeVideo=factory(root.SekmeTeamAudio);})(typeof globalThis!=='undefined'?globalThis:this,function(TeamAudio){
'use strict';
const FPS=60,HOLD=4.5,WIDTH=1080,HEIGHT=1920;
const FULL_RATE_KEY='com.apple.quicktime.full-frame-rate-playback-intent';
function setFullRateMetadata(output,cfg){if(cfg.fps===120)output.setMetadataTags?.({raw:{[FULL_RATE_KEY]:new Uint8Array([1])}});}
// Apple's movie-level integer flag prevents automatic Slo-mo interpretation of HFR exports.
// Patch only the metadata type, without copying/transcoding video payload or changing offsets.
async function normalPlayback(result,cfg){
 if(cfg.fps!==120||result.extension!=='mp4')return result;const blob=result.blob,read=async(at,n)=>new Uint8Array(await blob.slice(at,at+n).arrayBuffer());let moov=null;
 for(let at=0;at+8<=blob.size;){const h=await read(at,16),v=new DataView(h.buffer),type=String.fromCharCode(...h.slice(4,8));let size=v.getUint32(0),header=8;if(size===1){size=Number(v.getBigUint64(8));header=16;}if(!size)size=blob.size-at;if(!Number.isSafeInteger(size)||size<header||at+size>blob.size)throw Error('Invalid MP4 atom');if(type==='moov'){if(size>16*1024*1024)throw Error('MP4 index exceeds limit');moov={at,bytes:await read(at,size),header};break;}at+=size;}
 if(!moov)throw Error('MP4 index missing');const bytes=moov.bytes,view=new DataView(bytes.buffer),decode=new TextDecoder(),children=(start,end)=>{const out=[];for(let at=start;at+8<=end;){const size=view.getUint32(at);if(size<8||at+size>end)break;out.push({at,size,type:decode.decode(bytes.subarray(at+4,at+8))});at+=size;}return out;};
 const udta=children(moov.header,bytes.length).find(b=>b.type==='udta');let offset=-1;
 if(udta)for(const meta of children(udta.at+8,udta.at+udta.size).filter(b=>b.type==='meta')){let boxes=children(meta.at+8,meta.at+meta.size);if(!boxes.some(b=>b.type==='keys'))boxes=children(meta.at+12,meta.at+meta.size);const keys=boxes.find(b=>b.type==='keys'),ilst=boxes.find(b=>b.type==='ilst');if(!keys||!ilst)continue;const count=view.getUint32(keys.at+12);let cursor=keys.at+16,index=0;for(let n=1;n<=count&&cursor+8<=keys.at+keys.size;n++){const size=view.getUint32(cursor);if(size<8||cursor+size>keys.at+keys.size)break;if(decode.decode(bytes.subarray(cursor+8,cursor+size))===FULL_RATE_KEY)index=n;cursor+=size;}if(!index)continue;const item=children(ilst.at+8,ilst.at+ilst.size).find(b=>view.getUint32(b.at+4)===index),data=item&&children(item.at+8,item.at+item.size).find(b=>b.type==='data');if(data&&data.size===17&&bytes[data.at+16]===1)offset=moov.at+data.at+8;}
 if(offset<0)throw Error('Normal-speed HFR metadata missing');const marker=new Uint8Array([0,0,0,21]);return{...result,blob:new Blob([blob.slice(0,offset),marker,blob.slice(offset+4)],{type:'video/mp4'}),fullFrameRatePlayback:true};
}
const yieldTask=()=>new Promise(r=>setTimeout(r,0));
function signalError(signal){return signal?.reason instanceof Error?signal.reason:new DOMException('Export cancelled','AbortError');}
function check(signal){if(signal?.aborted)throw signalError(signal);}
function wait(promise,signal,ms=10000){return new Promise((resolve,reject)=>{const finish=(fn,v)=>{clearTimeout(timer);signal?.removeEventListener('abort',abort);fn(v);},abort=()=>finish(reject,signalError(signal)),timer=setTimeout(()=>finish(reject,Error('Video encoder timeout')),ms);signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted){abort();return;}Promise.resolve(promise).then(v=>finish(resolve,v),e=>finish(reject,e));});}
function device(env=globalThis){const n=env.navigator||{},ua=n.userAgent||'',ios=!!env.SEKME_PHONE||/iPhone|iPad|iPod/.test(ua)||(n.platform==='MacIntel'&&n.maxTouchPoints>1);return {ios,mobile:ios||/Android|Mobile/.test(ua)||(Number(n.deviceMemory)>0&&n.deviceMemory<=4)};}
function settings(job={}){
 const d=device(job.env||globalThis),orientation=job.orientation==='landscape'?'landscape':'portrait',q=job.quality||'auto',fps=[30,60,120].includes(Number(job.fps))?Number(job.fps):60,short=q==='compatible'?540:q==='720'?720:1080,long=Math.round(short*16/9),defaultBitrate=short===540?(job.env?.SEKME_PHONE||globalThis.SEKME_PHONE?1000000:1500000)*(fps===120?2:1):short===720?(fps===120?8000000:2800000):fps===30?18000000:fps===120?48000000:(d.mobile?16000000:18000000);
 const bitrate=Number.isFinite(job.bitrate)?Math.max(3000000,Math.min(48000000,job.bitrate)):defaultBitrate;
 const seconds=Number(job.duration)||65,estimated=(bitrate+192000)*seconds/8,maxBytes=Math.max((d.mobile?24:64)*1024*1024,Math.ceil(estimated*1.6+2*1024*1024));
 return {orientation,fps,width:orientation==='landscape'?long:short,height:orientation==='landscape'?short:long,bitrate,audioBitrate:192000,sampleRate:48000,mobile:d.mobile,ios:d.ios,maxBytes};
}
function useSoftware(env=globalThis,quality='auto'){return (quality==='1080'||quality==='auto')&&typeof env.Worker==='function'&&!!env.WebAssembly;}
// Audio-only recording runs beside frame generation, rather than adding a whole match afterwards.
function prepareSoftwareAudio(job,env,media,info,cfg){
 const controller=new AbortController(),abort=()=>controller.abort();job.signal?.addEventListener('abort',abort,{once:true});if(job.signal?.aborted)abort();
 const task=(async()=>{if(!job.withAudio)return {native:false};try{check(controller.signal);let native=false;try{native=await wait(media.canEncodeAudio('aac',{sampleRate:48000,numberOfChannels:1,bitrate:cfg.audioBitrate}),controller.signal,5000);}catch(e){if(e.name==='AbortError')throw e;}if(native)return {native:true};const recorded=await recordedAudio({...job,signal:controller.signal,onProgress:null},env,media,info,cfg);return {native:false,recorded};}catch(e){if(e.name==='AbortError')return {native:false,cancelled:true};job.onAudioOmitted?.();return {native:false};}})();
 return {task,async dispose(){job.signal?.removeEventListener('abort',abort);controller.abort();await wait(task,null,5000).catch(()=>{});}};
}
function coalesceWrites(parts,limit=262144){const out=[];let group=[],size=0,start=0;const flush=()=>{if(!size)return;const data=new Uint8Array(size);let at=0;for(const p of group){const b=new Uint8Array(p.data);data.set(b,at);at+=b.byteLength;}out.push({position:start,data:data.buffer});group=[];size=0;};for(const p of parts){const n=p.data.byteLength;if(size&&(p.position!==start+size||size+n>limit))flush();if(n>limit){out.push(p);continue;}if(!size)start=p.position;group.push(p);size+=n;}flush();return out;}
async function softwareEncode(job,env,media,canvas,draw,info,cfg){
 if(!env.Worker||!env.WebAssembly){const e=Error('This browser does not expose Worker/WebAssembly for the independent 1080p encoder.');e.code='software-unavailable';throw e;}
 const rawStorage=await streamStorage(env,media,cfg),rawWriter=rawStorage.stream.getWriter();let rawClosed=false,worker;try{worker=new env.Worker('assets/software-worker.js?v=133');}catch(e){try{await wait(rawWriter.abort(),null,3000);}catch{}await rawStorage.dispose();throw e;}let sequence=0,pending=null,disposed=false;const audioPreparation=prepareSoftwareAudio(job,env,media,info,cfg);
 const terminate=()=>{if(disposed)return;disposed=true;worker.terminate();};
 const abort=()=>{pending?.reject(signalError(job.signal));pending=null;terminate();};job.signal?.addEventListener('abort',abort,{once:true});
 worker.onmessage=async({data})=>{if(!pending||data.id!==pending.id)return;const p=pending;pending=null;try{if(data.type==='error')throw Error(data.message);for(const part of coalesceWrites(data.writes||[]))await rawWriter.write({position:part.position,data:new Uint8Array(part.data)});p.resolve(data);}catch(e){p.reject(e);}};worker.onerror=e=>{pending?.reject(Error(e.message||'1080p worker failed'));pending=null;};
 const send=(data,transfer=[])=>{check(job.signal);return wait(new Promise((resolve,reject)=>{const id=++sequence;pending={id,resolve,reject};worker.postMessage({...data,id},transfer);}),job.signal,60000);};
 try{
  job.onStage?.('software');await send({type:'init',width:cfg.width,height:cfg.height,kbps:Math.round(cfg.bitrate/1000),maxBytes:cfg.maxBytes,fps:(cfg.fps||FPS)});
  const ctx=canvas.getContext('2d',{alpha:false,willReadFrequently:true}),count=Math.ceil(info.duration*(cfg.fps||FPS));
  let flight=null,hasFrame=false;
  try{for(let i=0;i<count;i++){
   check(job.signal);if(env.document?.hidden)throw Error('Keep the page visible while preparing video');
   // Only one frame in the worker and one next-frame readback: bounded overlap, no queue growth.
   const changed=draw(i/(cfg.fps||FPS)),pixels=changed===false&&hasFrame?null:ctx.getImageData(0,0,cfg.width,cfg.height);if(flight)await flight;hasFrame=true;
   flight=(async()=>{if(!pixels)return send({type:'frame',repeat:true});try{return await send({type:'frame',rgba:pixels.data.buffer},[pixels.data.buffer]);}catch(e){if(e.name!=='DataCloneError')throw e;const copy=new Uint8Array(pixels.data);return send({type:'frame',rgba:copy.buffer},[copy.buffer]);}})();flight.catch(()=>{});
   job.onProgress?.((i+1)/count*.9);job.onMetrics?.({frame:i+1,total:count,queue:flight?1:0});if(i%4===0)await yieldTask();
  }if(flight)await flight;}finally{if(flight)await flight.catch(()=>{});}
  job.onStage?.('finalize');const done=await send({type:'finish'});if(done.count!==count||done.width!==cfg.width||done.height!==cfg.height)throw Error('Incomplete 1080p video');terminate();job.onFramesComplete?.();
  await wait(rawWriter.close(),job.signal,30000);rawClosed=true;const blob=await wait(rawStorage.finish(),job.signal,30000);const result={blob,dispose:rawStorage.dispose,extension:'mp4',method:'software-worker',trimStart:done.trimStart||0,score:info.score,width:cfg.width,height:cfg.height};
  const completed=await softwareAudio(result,job,env,media,info,cfg,audioPreparation.task);job.onStage?.('verify');return await verifyResolution(completed,media,cfg,job.signal);
 }finally{job.signal?.removeEventListener('abort',abort);terminate();if(!rawClosed)try{await wait(rawWriter.abort(),null,3000);}catch{}await audioPreparation.dispose();await rawStorage.dispose();}
}
// The software encoder emits a conservative level-4.0 SPS at higher frame rates.
// Its one-reference stream needs level 4.2 at 60 FPS and 5.1 at 120 FPS; announce the correct
// processing level in both avcC and its SPS without touching compressed pictures.
function avcRateConfig(config,cfg){
 const rate=Math.ceil(cfg.width/16)*Math.ceil(cfg.height/16)*(cfg.fps||FPS),level=rate>522240?51:42;if(rate<=245760||!config.description)return config;
 const source=config.description,d=new Uint8Array(source.buffer||source,source.byteOffset||0,source.byteLength).slice();if(d.length<7||d[0]!==1||d[3]>=level)return config;
 d[3]=level;let at=6;for(let n=0;n<(d[5]&31);n++){if(at+2>d.length)throw Error('Incomplete H264 parameter set');const length=(d[at]<<8)|d[at+1];at+=2;if(at+length>d.length)throw Error('Invalid H264 parameter set');if(length>3&&(d[at]&31)===7)d[at+3]=level;at+=length;}
 return {...config,codec:config.codec.slice(0,-2)+level.toString(16).toUpperCase(),description:d};
}
async function softwareAudio(result,job,env,media,info,cfg,audioTask){
 job.onStage?.('audio');const {recorded,native}=await wait(audioTask,job.signal,Math.max(15000,(info.duration+15)*1000));check(job.signal);
 if(!job.withAudio||!native&&!recorded)return normalizeMp4(result,job,env,media,cfg);
 const input=new media.Input({formats:media.ALL_FORMATS,source:new media.BlobSource(result.blob)});let storage,output;
 try{const v=await input.getPrimaryVideoTrack(),vc=avcRateConfig(await v.getDecoderConfig(),cfg);storage=await streamStorage(env,media,cfg);output=new media.Output({target:storage.target,format:new media.Mp4OutputFormat({fastStart:'reserve',...(cfg.fps===120?{metadataFormat:'mdta'}:{})})});const vs=new media.EncodedVideoPacketSource('avc'),as=native?new media.AudioBufferSource({codec:'aac',quality:new media.Quality({bitrate:cfg.audioBitrate})}):new media.EncodedAudioPacketSource('aac');output.addVideoTrack(vs,{frameRate:(cfg.fps||FPS),maximumPacketCount:Math.ceil(info.duration*(cfg.fps||FPS)+8)});output.addAudioTrack(as,{maximumPacketCount:Math.ceil(info.duration*100+256)});setFullRateMetadata(output,cfg);await wait(output.start(),job.signal,15000);let until=0,index=0;
 for await(const raw of new media.EncodedPacketSink(v).packets()){const offset=result.trimStart||0;if(raw.timestamp<offset-.00001)continue;const p=offset?raw.clone({timestamp:Math.max(0,raw.timestamp-offset)}):raw;check(job.signal);if(native){while(until<info.duration&&until<=p.timestamp){const len=Math.min(1,info.duration-until);await wait(as.add(audioSegment(env,job.audioBuffers||{},info.events,until,len,info.duration)),job.signal);until+=len;}}else while(index<recorded.packets.length&&recorded.packets[index].timestamp<p.timestamp+1)await wait(as.add(recorded.packets[index++],{decoderConfig:recorded.config}),job.signal);await wait(vs.add(p,{decoderConfig:vc}),job.signal);}
 vs.close();as.close();await wait(output.finalize(),job.signal,20000);const blob=await wait(storage.finish(),job.signal,30000);await result.dispose?.();return {...result,blob,dispose:storage.dispose,storage:storage.method,trimStart:0,container:'standard-mp4'};
 }catch(e){try{await wait(output?.cancel(),null,3000);}catch{}await storage?.dispose();if(e.name==='AbortError')throw e;job.onAudioOmitted?.();return normalizeMp4(result,job,env,media,cfg);}finally{input.dispose();}
}

// STORE ZIP: preserves the MP4 bytes during messaging/upload, without transcoding or full-file buffering.
async function originalZip(blob,name,signal){
 if(blob.size>=0xffffffff)throw Error('File too large');const filename=new TextEncoder().encode(name),table=new Uint32Array(256);for(let i=0;i<256;i++){let c=i;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;table[i]=c>>>0;}let crc=0xffffffff;
 for(let at=0;at<blob.size;at+=262144){check(signal);const bytes=new Uint8Array(await blob.slice(at,at+262144).arrayBuffer());for(const b of bytes)crc=table[(crc^b)&255]^(crc>>>8);if(at%4194304===0)await yieldTask();}crc=(crc^0xffffffff)>>>0;
 const head=new Uint8Array(30+filename.length),h=new DataView(head.buffer);h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x800,true);h.setUint32(14,crc,true);h.setUint32(18,blob.size,true);h.setUint32(22,blob.size,true);h.setUint16(26,filename.length,true);head.set(filename,30);
 const central=new Uint8Array(46+filename.length),c=new DataView(central.buffer);c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x800,true);c.setUint32(16,crc,true);c.setUint32(20,blob.size,true);c.setUint32(24,blob.size,true);c.setUint16(28,filename.length,true);central.set(filename,46);
 const end=new Uint8Array(22),e=new DataView(end.buffer);e.setUint32(0,0x06054b50,true);e.setUint16(8,1,true);e.setUint16(10,1,true);e.setUint32(12,central.length,true);e.setUint32(16,head.length+blob.size,true);return new Blob([head,blob,central,end],{type:'application/zip'});
}

function soundCue(type){return ['goal','goal_pending'].includes(type)?'goal':['post','save','wide','goal_disallowed'].includes(type)?'miss':null;}
function soundDuration(type){return type==='goal_pending'?.6:Infinity;}
function oppositionLevel(e){if(!['goal','goal_pending'].includes(e?.type)||![0,1].includes(e.venueHost)||![0,1].includes(e.team)||e.team===e.venueHost)return 0;return .22*Math.min(1.2,Math.max(1,Number(e.atmosphere)||1));}
function goalLevel(e,base=.48){return base*(oppositionLevel(e)>0?.48:1);}
function oppositionCue(e,events=[],key='elapsed'){
 const base=oppositionLevel(e);if(!base)return null;const at=Number(e[key]??e.videoAt??e.at??0),music=e.type==='goal'?teamCue(e,events,key):null,delay=music?music.delay+2:.18,start=at+delay,gain=music?.62*Math.min(1.15,Math.max(1,Number(e.atmosphere)||1)):base;
 let duration=music?music.start+music.duration-start:e.type==='goal_pending'?.42:3.2;
 for(const next of events){const t=Number(next[key]??next.videoAt??next.at??0);if(t>at&&['var_start','goal_disallowed','half','fulltime',...(music?['attack','kickoff','replay']:[])].includes(next.type))duration=Math.min(duration,Math.max(0,t-start));}
 return duration>.015?{id:'boo|'+at+'|'+e.team,key:'boo',start,eventAt:at,musicId:music?.id,gain,delay,duration,loop:!!music,attack:music?.35:.06,release:Math.min(music?.85:.20,duration/2),tail:music?.25:1}:null;
}
function oppositionCueAt(t,events=[],upcoming=false){let active=null;for(const e of events){const cue=oppositionCue(e,events);if(cue&&t>=(upcoming?cue.eventAt:cue.start)&&t<cue.start+cue.duration)active={...cue,offset:t-cue.start};}return active;}
const audioSmooth=v=>{const x=Math.max(0,Math.min(1,v));return x*x*(3-2*x);};
// A clear initial home protest gives way to a quieter, persistent opposition bed.
function oppositionMusicLevel(cue,t){const age=t-cue.start;if(age<0||age>=cue.duration)return 0;const protest=1-audioSmooth((age-cue.attack-.9)/3.2),shape=(cue.tail??1)+(1-(cue.tail??1))*protest;return cue.gain*shape;}
function teamMusicLevel(cue,t,events=[]){const boo=oppositionCueAt(t,events);if(!boo||boo.musicId!==cue.id)return cue.gain;const protest=oppositionMusicLevel(boo,t)/boo.gain,envelope=Math.min(1,Math.max(0,(t-boo.start)/boo.attack),Math.max(0,(boo.start+boo.duration-t)/boo.release));return cue.gain*(1-.28*protest*envelope);}
function teamCue(e,events=[],key='elapsed'){
 if(e?.type!=='goal')return null;const asset=e.audioProfile?.goalKeys?.[e.team],meta=TeamAudio?.assets[asset];if(!meta)return null;const at=Number(e[key]??e.videoAt??e.at??0),delay=.8,start=at+delay;
 // Source clips may be shorter than the rendered celebration. The timeline,
 // rather than the source file, owns the stop time; short clips loop locally.
 let end=Number.isFinite(e.musicEnd)?e.musicEnd:start+meta.duration;end=Math.min(end,start+90);
 for(const next of events){const t=Number(next[key]??next.videoAt??next.at??0);if(t>at&&['attack','kickoff','half','fulltime','goal_disallowed','var_start','replay'].includes(next.type))end=Math.min(end,t);}
 const duration=end-start;return duration>.12?{id:asset+'|'+at,key:asset,start,eventAt:at,gain:asset==='gsGoal'?.40:.38,delay,duration,loop:true,attack:.12,release:Math.min(.85,duration/2)}:null;
}
function teamCueAt(t,events=[]){let active=null;for(const e of events){const cue=teamCue(e,events);if(cue&&t>=cue.start&&t<cue.start+cue.duration)active={...cue,offset:t-cue.start};}return active;}
function ambientLevel(t,events=[],profile=events[0]?.audioProfile,level=events[0]?.atmosphere||1){
 const base=profile?.ambient&&profile.ambient!=='ambient'?(level>1?.42:.38):crowdLevel(t,events,level);let factor=1;
 for(const e of events){const cue=teamCue(e,events);if(!cue||t<cue.eventAt||t>=cue.start+cue.duration)continue;const into=audioSmooth((t-cue.eventAt)/(cue.delay+.35)),out=audioSmooth((cue.start+cue.duration-t)/.85);factor=Math.min(factor,1-.75*Math.min(into,out));}
 return base*factor;
}
// Crossfade the last 120 ms into the beginning once; a selected match reuses the
// same compact loop buffer in live playback, PCM chunks and recorder fallback.
const loopBuffers=new WeakMap();
function loopBuffer(env,source){
 if(!source||!Number.isInteger(source.length)||!source.sampleRate||!source.numberOfChannels)return source;if(loopBuffers.has(source))return loopBuffers.get(source);
 const overlap=Math.min(Math.round(source.sampleRate*.12),Math.floor(source.length*.1));if(overlap<2)return source;const length=source.length-overlap;let out;
 try{out=typeof env.createBuffer==='function'?env.createBuffer(source.numberOfChannels,length,source.sampleRate):new env.AudioBuffer({numberOfChannels:source.numberOfChannels,length,sampleRate:source.sampleRate});}catch{return source;}
 for(let c=0;c<source.numberOfChannels;c++){const a=source.getChannelData(c),b=out.getChannelData(c);b.set(a.subarray(0,length));for(let j=0;j<overlap;j++){const q=j/(overlap-1);b[j]=a[length+j]*(1-q)+a[j]*q;}}
 loopBuffers.set(source,out);return out;
}

function crowdLevel(t,events=[],level=events[0]?.atmosphere||1){
 let last=null,goal=null;const score=[0,0];for(const e of events){if(e.type==='attack_end'&&e.ending==='goal')continue;const at=e.elapsed??e.videoAt??e.at??0;if(at<=t&&['goal','goal_pending'].includes(e.type)){const team=e.team??0,before=score[team]-score[1-team];if(e.type==='goal')score[team]++;const diff=score[team]-score[1-team]+(e.type==='goal_pending'?1:0),late=e.minute>=85?1:e.minute>=75?.55:0;goal={age:t-at,energy:diff>0&&before<=0?1.12+late*.65:diff===0?.88+late*.3:diff<0?.6:.9};}if(at<=t&&['var_start','goal_disallowed'].includes(e.type))goal=null;if(at<=t&&['kickoff','attack','shot','save','post','wide','goal','goal_pending','goal_disallowed','var_start','var_decision','ball_secured','ball_out','offside','interception','block','attack_end','fulltime'].includes(e.type))last={type:e.type,age:t-at};}
 const big=level>1,base=(big?.18:.13)+.014*(.5+.5*Math.sin(t*2.2))**2+(big?.025*(.5+.5*Math.sin(t*3.15))**2:0);if(!last)return base;
 if(goal&&goal.age<5.5&&!['var_start','goal_disallowed','fulltime'].includes(last.type))return base+level*(.045+goal.energy*.065)*Math.exp(-goal.age*.16);
 if(last.type==='fulltime')return .085;
 if(['shot','post','save',...(big?['wide']:[])].includes(last.type)&&last.age<(big?2.8:1.4))return base+level*.065*Math.exp(-last.age*.7);
 if(last.type==='attack'&&last.age<3.5)return base+.025;
 if(last.type.startsWith('var')&&last.age<1.8)return .075;
 return base;
}
function whistleKey(type){return({whistle:'whistleStart',kickoff:'whistleStart',freeKick:'whistleRestart',penalty:'whistleRestart',foul_whistle:'whistleFoul',half:'whistleHalf',fulltime:'whistleFull'})[type]||null;}
const whistleTypes=new Set(['whistle','kickoff','freeKick','penalty','foul_whistle','half','fulltime']);
function whistleCues(type){return type==='fulltime'?[[0,2200,.13,.052],[.31,2350,.15,.052],[.67,2250,.50,.065]]:type==='half'?[[0,2250,.18,.052],[.34,2300,.34,.052]]:[[0,2200,type==='foul_whistle'?.25:type==='kickoff'?.36:.29,.052]];}
function audioEvents(events,key='elapsed',until=Infinity){
 const out=events.slice(),at=e=>Number(e[key]??e.at??0);
 for(const e of events){const t=at(e);if(e.type==='half'&&!events.some(k=>k.type==='kickoff'&&(k.half===2||k.secondHalf||Math.abs(at(k)-(t+2))<.03)))out.push({...e,type:'kickoff',[key]:t+2,secondHalf:true});
  if(e.type==='foul'&&!events.some(w=>w.type==='foul_whistle'&&Math.abs(at(w)-t)<.35))out.push({...e,type:'foul_whistle',[key]:t+.10});
 }
 return out.filter(e=>at(e)<=until+1e-8).sort((a,b)=>at(a)-at(b));
}
async function profile(media,withAudio,cfg={width:WIDTH,height:HEIGHT,bitrate:6000000}){
 if(!media)return null;
 for(const [video,audio,format,ext,mime]of[['avc','aac','Mp4OutputFormat','mp4','video/mp4'],['vp9','opus','WebMOutputFormat','webm','video/webm'],['vp8','opus','WebMOutputFormat','webm','video/webm']]){
  try{if(await media.canEncodeVideo(video,{width:cfg.width,height:cfg.height,bitrate:cfg.bitrate})&&(!withAudio||await media.canEncodeAudio(audio,{sampleRate:48000,numberOfChannels:1,bitrate:96000})))return {video,audio,format,ext,mime};}catch{}
 }
 return null;
}
function needsMedia(env=globalThis,quality='auto'){return quality==='1080'||quality==='auto'||!device(env).ios||!recorderMime(env);}
function recorderMime(env){return ['video/mp4;codecs=avc1.64002A,mp4a.40.2','video/mp4;codecs=avc1.42E02A,mp4a.40.2','video/mp4;codecs=avc1.42E01F,mp4a.40.2','video/mp4','video/webm;codecs=vp8,opus','video/webm;codecs=vp9,opus','video/webm'].find(m=>env.MediaRecorder?.isTypeSupported(m));}
// One second of PCM at a time, rather than a whole-match OfflineAudioContext buffer.
function audioSegment(env,buffers,events,start,duration,total=Infinity){
 const rate=48000,b=new env.AudioBuffer({numberOfChannels:1,length:Math.round(duration*rate),sampleRate:rate}),out=b.getChannelData(0);
 const add=(key,at,gain,loop=false,limit=Infinity,attack=0,release=.12)=>{const src=loop&&Number.isFinite(limit)?loopBuffer(env,buffers[key]):buffers[key];if(!src)return;const channels=Array.from({length:src.numberOfChannels},(_,i)=>src.getChannelData(i)),from=Math.max(0,Math.ceil((at-start)*rate)),end=Math.min(out.length,Math.ceil((at+(loop?limit:Math.min(src.duration,limit))-start)*rate));for(let i=from;i<end;i++){let pos=(start+i/rate-at)*src.sampleRate;if(loop)pos%=src.length;if(pos<0||pos>=src.length)continue;const j=Math.floor(pos),k=Math.min(j+1,src.length-1),f=pos-j;let v=0;for(const ch of channels)v+=ch[j]*(1-f)+ch[k]*f;const index=(i/rate)*20,jj=Math.min(Math.floor(index),Array.isArray(gain)?gain.length-1:0),level=Array.isArray(gain)?gain[jj]+((gain[jj+1]??gain[jj])-gain[jj])*(index-jj):gain;out[i]+=v/channels.length*level*(attack?Math.min(1,Math.max(0,(start+i/rate-at)/attack)):1)*(Number.isFinite(limit)?Math.min(1,Math.max(0,(at+limit-start-i/rate)/Math.max(.001,release))):1);}};
 const tone=(at,hz,length,gain)=>{const from=Math.max(0,Math.ceil((at-start)*rate)),end=Math.min(out.length,Math.ceil((at+length-start)*rate));for(let i=from;i<end;i++){const t=start+i/rate-at;out[i]+=Math.sin(t*2*Math.PI*hz)*gain*Math.exp(-6*t/length);}};
 const ambient=events[0]?.audioProfile?.ambient||'ambient';add(buffers[ambient]?ambient:'ambient',0,Array.from({length:Math.ceil(duration*20)+1},(_,i)=>ambientLevel(start+i/20,events)),true);
 for(const e of(events.some(e=>e.type==='kickoff')?events:[{type:'whistle',elapsed:0},...events])){const t=e.elapsed||0;const opposition=oppositionCue(e,events);if(opposition)add(opposition.key,t+opposition.delay,Array.from({length:Math.ceil(duration*20)+1},(_,i)=>oppositionMusicLevel(opposition,start+i/20)),opposition.loop,opposition.duration,opposition.attack,opposition.release);const team=teamCue(e,events);if(team)add(team.key,t+team.delay,Array.from({length:Math.ceil(duration*20)+1},(_,i)=>teamMusicLevel(team,start+i/20,events)),team.loop,team.duration,team.attack,team.release);if(soundCue(e.type))add(soundCue(e.type),t,soundCue(e.type)==='goal'?goalLevel(e,Math.min(.66,.48*(e.atmosphere||1))):.09*(e.atmosphere>1?2:1),false,soundDuration(e.type));else if(e.type.startsWith('var')){tone(t,530,.1,.04);tone(t+.13,710,.1,.04);}else if(['shot','clearance'].includes(e.type)){tone(t,120,.08,.045);}else if(whistleTypes.has(e.type)){const key=whistleKey(e.type);if(buffers[key])add(key,t,.28);else for(const [offset,hz,length,gain] of whistleCues(e.type))tone(t+offset,hz,length,gain);}}
 for(let i=0;i<out.length;i++)out[i]*=.85*Math.min(1,Math.max(0,(total-start-i/rate)/.4));
 return b;
}
function liveAudio(a,buffers,events,duration,stream){
 const dest=a.createMediaStreamDestination(),master=a.createGain(),nodes=[],start=a.currentTime+.03;master.gain.value=.85;master.gain.setValueAtTime(.85,start+Math.max(0,duration-.4));master.gain.linearRampToValueAtTime(0,start+duration);master.connect(dest);dest.stream.getAudioTracks().forEach(t=>stream.addTrack(t));
 const sample=(key,at,gain,loop=false,limit=Infinity,attack=0,release=.12)=>{if(!buffers[key])return;const s=a.createBufferSource(),g=a.createGain();s.buffer=loop&&Number.isFinite(limit)?loopBuffer(a,buffers[key]):buffers[key];s.loop=loop;const curve=Array.isArray(gain),base=curve?gain[0]:gain;g.gain.value=attack?0:base;if(curve){for(let i=0;i<gain.length;i++){const dt=Math.min(limit,i/20),level=gain[i]*Math.min(1,attack?dt/attack:1,Number.isFinite(limit)?(limit-dt)/Math.max(.001,release):1);g.gain.linearRampToValueAtTime(Math.max(0,level),start+at+dt);}}else if(attack){g.gain.setValueAtTime(0,start+at);g.gain.linearRampToValueAtTime(gain,start+at+attack);}if(loop&&!Number.isFinite(limit))for(let t=0;t<=duration;t+=.1)g.gain.linearRampToValueAtTime(ambientLevel(t,events),start+t);s.connect(g);g.connect(master);s.start(start+at);if(Number.isFinite(limit)){if(!curve){g.gain.setValueAtTime(gain,start+at+Math.max(attack,limit-release));g.gain.linearRampToValueAtTime(0,start+at+limit);}s.stop(start+at+limit);}if(loop&&!Number.isFinite(limit))s.stop(start+duration);nodes.push(s,g);};
 const tone=(at,hz,length,gain)=>{const s=a.createOscillator(),g=a.createGain();s.frequency.value=hz;g.gain.setValueAtTime(gain,start+at);g.gain.exponentialRampToValueAtTime(.001,start+at+length);s.connect(g);g.connect(master);s.start(start+at);s.stop(start+at+length);nodes.push(s,g);};
 const ambient=events[0]?.audioProfile?.ambient||'ambient';sample(buffers[ambient]?ambient:'ambient',0,ambientLevel(0,events),true);for(const e of(events.some(e=>e.type==='kickoff')?events:[{type:'whistle',elapsed:0},...events])){const t=e.elapsed||0;const opposition=oppositionCue(e,events);if(opposition)sample(opposition.key,t+opposition.delay,Array.from({length:Math.ceil(opposition.duration*20)+1},(_,i)=>oppositionMusicLevel(opposition,opposition.start+i/20)),opposition.loop,opposition.duration,opposition.attack,opposition.release);const team=teamCue(e,events);if(team)sample(team.key,t+team.delay,Array.from({length:Math.ceil(team.duration*20)+1},(_,i)=>teamMusicLevel(team,team.start+i/20,events)),team.loop,team.duration,team.attack,team.release);if(soundCue(e.type))sample(soundCue(e.type),t,soundCue(e.type)==='goal'?goalLevel(e,Math.min(.66,.48*(e.atmosphere||1))):.09*(e.atmosphere>1?2:1),false,soundDuration(e.type));else if(e.type.startsWith('var')){tone(t,530,.1,.04);tone(t+.13,710,.1,.04);}else if(['shot','clearance'].includes(e.type)){tone(t,120,.08,.045);}else if(whistleTypes.has(e.type)){const key=whistleKey(e.type);if(buffers[key])sample(key,t,.28);else for(const [offset,hz,length,gain] of whistleCues(e.type))tone(t+offset,hz,length,gain);}}
 return ()=>{for(const n of nodes){try{n.stop?.()}catch{}try{n.disconnect()}catch{}}master.disconnect();};
}
async function create(job){
 const env=job.env||globalThis,cfg=settings(job),media=job.media||env.Mediabunny,signal=job.signal,onProgress=job.onProgress||(()=>{});check(signal);
 const canvas=job.canvas||env.document.createElement('canvas');canvas.width=cfg.width;canvas.height=cfg.height;
 const info={duration:job.duration,events:audioEvents((job.events||[]).filter(e=>['kickoff','attack','shot','save','wide','clearance','ball_secured','ball_out','offside','interception','block','attack_end','goal','goal_pending','post','goal_disallowed','penalty','freeKick','corner','half','fulltime','yellow','red','foul','foul_whistle','var_start','var_decision'].includes(e.type)).map(e=>({...e,elapsed:e.at}))),score:job.score},draw=job.draw;
 try{cfg.expectedDuration=info.duration;onProgress(0);if(!Number.isFinite(info.duration)||info.duration<=0)throw Error('Invalid match duration');
  const native=job.encodingConfig||await preflight({...job,env,media},cfg);
  if(native?.software)return await softwareEncode(job,env,media,canvas,draw,info,cfg);
  if(native){
   const parallelAudio=job.withAudio&&native.audioMode==='recorded'?prepareSoftwareAudio(job,env,media,info,cfg):null;let result;
   try{try{result=await serialEncode(parallelAudio?{...job,withAudio:false}:job,env,media,canvas,draw,info,cfg,parallelAudio?{...native,audioMode:'native'}:native);}catch(e){if(e.name!=='AbortError'&&useSoftware(env,job.quality)&&!job.forceNative){const retry=new Error(e.message||String(e));retry.name=e.name||'Error';retry.code=typeof e.code==='string'?e.code:'native-encode-failed';retry.cause=e;retry.softwareRetryAvailable=true;throw retry;}throw e;}
    job.onFramesComplete?.();if(parallelAudio)result=await softwareAudio(result,job,env,media,info,cfg,parallelAudio.task);job.onStage?.('verify');return await verifyResolution(result,media,cfg,signal);
   }catch(e){await result?.dispose?.();throw e;}finally{await parallelAudio?.dispose();}
  }
  // Timed capture is an automatic fallback, never user-operated screen recording.
  const captured=await capture(job,env,canvas,draw,info,cfg);return await verifyResolution(await normalizeMp4(captured,job,env,media,cfg),media,cfg,signal);
 }finally{if(!job.canvas){canvas.width=1;canvas.height=1;}}
}
async function verifyPlayback(result,cfg,signal,env=globalThis){
 if(!env.document?.createElement||!env.URL?.createObjectURL)throw Error('Playback verification unavailable');
 const video=env.document.createElement('video'),url=env.URL.createObjectURL(result.blob);video.preload='auto';video.muted=true;video.playsInline=true;video.disableRemotePlayback=true;
 const event=(name,act,ready)=>new Promise((resolve,reject)=>{
  let timer;const done=(fn,value)=>{clearTimeout(timer);video.removeEventListener(name,ok);video.removeEventListener('error',bad);signal?.removeEventListener('abort',abort);fn(value);};
  const ok=()=>done(resolve),bad=()=>done(reject,Error('MP4 playback failed: '+(video.error?.code||'media'))),abort=()=>done(reject,new DOMException('Export cancelled','AbortError'));
  video.addEventListener(name,ok);video.addEventListener('error',bad);signal?.addEventListener('abort',abort,{once:true});timer=setTimeout(()=>done(reject,Error('MP4 playback verification timeout')),15000);
  try{check(signal);act?.();if(ready?.())ok();}catch(e){done(reject,e);}
 });
 try{
  await event('loadedmetadata',()=>{video.src=url;video.load();},()=>video.readyState>=1);
  if(video.videoWidth!==cfg.width||video.videoHeight!==cfg.height)throw Error('MP4 playback resolution mismatch');
  if(!Number.isFinite(video.duration)||video.duration<=0||cfg.expectedDuration&&Math.abs(video.duration-cfg.expectedDuration)>Math.max(.2,2/cfg.fps))throw Error('MP4 playback duration mismatch');
  for(const t of[0,video.duration*.5,Math.max(0,video.duration-1/cfg.fps)]){
   if(Math.abs(video.currentTime-t)<.0001){if(video.readyState<2)await event('loadeddata',null,()=>video.readyState>=2);}
   else await event('seeked',()=>{video.currentTime=t;});
   if(video.readyState<2||video.error)throw Error('MP4 frame could not be decoded');
  }
  return {...result,decodePath:'html-video'};
 }finally{video.pause();video.removeAttribute('src');video.load();env.URL.revokeObjectURL(url);}
}
async function verifyResolution(result,media,cfg,signal){
 result=await normalPlayback(result,cfg);
 if(Math.min(cfg.width,cfg.height)!==1080||!media?.Input||!media?.BlobSource)return result;
 const input=new media.Input({formats:media.ALL_FORMATS,source:new media.BlobSource(result.blob)});
 try{const track=await wait(input.getPrimaryVideoTrack(),signal);if(!track)throw Error('Video track missing');const width=await wait(track.getDisplayWidth(),signal),height=await wait(track.getDisplayHeight(),signal);if(width!==cfg.width||height!==cfg.height){const e=Error('The encoder did not produce the selected resolution');e.code='resolution';throw e;}
  // Check complete duration and decode the tail for every 1080p frame rate.
  const duration=await wait(track.computeDuration(),signal);if(cfg.expectedDuration&&(!Number.isFinite(duration)||Math.abs(duration-cfg.expectedDuration)>Math.max(.2,2/cfg.fps))){const e=Error('Video duration does not match the complete match');e.code='incomplete';throw e;}
  if(typeof globalThis.VideoDecoder==='function'&&media.VideoSampleSink){try{const sink=new media.VideoSampleSink(track);for(const t of[0,duration*.5,Math.max(0,duration-1/cfg.fps)]){const sample=await wait(sink.getSample(t),signal,10000);try{if(!sample||sample.displayWidth!==width||sample.displayHeight!==height)throw Error('Invalid decoded frame');}finally{sample?.close();}}}catch(error){if(error.name==='AbortError')throw error;try{return await verifyPlayback(result,cfg,signal);}catch(playbackError){if(playbackError.name==='AbortError')throw playbackError;const e=Error(cfg.fps+' FPS decoding failed: '+error.message+' / '+playbackError.message);e.code=cfg.fps===120?'fps120':'decode';throw e;}}}
  return {...result,width,height};}catch(e){await result.dispose?.();throw e;}finally{input.dispose();}
}
async function preflight(job,cfg=settings(job)){
 if(cfg.fps===120){const env=job.env||globalThis;let supported=false;try{supported=!!(await env.VideoDecoder?.isConfigSupported?.({codec:'avc1.420033',codedWidth:cfg.width,codedHeight:cfg.height}))?.supported;}catch{}if(!supported){const e=Error('120 FPS playback support could not be verified. Select 60 FPS to keep 1080p.');e.code='fps120';throw e;}}
 const env=job.env||globalThis,media=job.media||env.Mediabunny,software=useSoftware(env,job.quality)&&!job.forceNative;
 // Probe the fast platform encoder before selecting the independent iPhone fallback.
 const native=await serialConfig(env,media,cfg,job.withAudio,job.signal);
 if(!native&&software)return {software:true,width:cfg.width,height:cfg.height};
 const local=env.SEKME_PHONE||env.location?.protocol==='file:';if(!native&&local&&Math.min(cfg.width,cfg.height)<1080&&recorderMime(env)){if(!job.canvas&&!env.HTMLCanvasElement?.prototype?.captureStream&&!env.document?.createElement?.('canvas')?.captureStream){const e=Error('Canvas recording is not supported in this viewer');e.code='capture-unavailable';throw e;}return null;}
 if(!native&&cfg.fps===120){const e=Error('120 FPS encoding is unavailable in this browser. Select 60 FPS to keep 1080p.');e.code='fps120';throw e;}if(!native&&cfg.ios&&Math.min(cfg.width,cfg.height)===1080){const e=Error(!env.VideoEncoder||!env.VideoFrame?'This browser does not expose the video encoder. Open the HTTPS page directly in Safari.':'The available H.264 encoders failed the 1080p frame test.');e.code='unsafe1080';throw e;}if(native?.audioMode==='unavailable'){const e=Error('1080p video is supported but this browser cannot encode the selected audio.');e.code='audio-unavailable';e.videoConfig={...native,audioMode:'native'};throw e;}return native;
}
// Seekable small blocks allow a standard MP4 header/index without one contiguous heap buffer.
const liveStorageNames=new Set();let lastStorageSweep=0,diskDisabled=false;
function storageFailure(error){diskDisabled=true;const e=Error("Video storage stopped responding");e.code="storage-stall";e.cause=error;return e;}
async function cleanupStorage(directory,now=Date.now()){
 if(!directory?.entries||now-lastStorageSweep<60000)return 0;lastStorageSweep=now;let removed=0,seen=0;
 try{for await(const [name]of directory.entries()){if(++seen>512)break;const match=/^sekme-export-(\d{13})-[a-z0-9]+\.mp4$/.exec(name);if(match&&now-Number(match[1])>2*3600000&&!liveStorageNames.has(name)){await directory.removeEntry(name);removed++;}}}catch{}return removed;
}
async function streamStorage(env,media,cfg){
 let directory,handle,writable,name,closed=false,bytes=0;const blocks=new Map(),BLOCK=65536;
 try{directory=diskDisabled?null:await wait(env.navigator?.storage?.getDirectory?.(),null,5000);if(directory){await wait(cleanupStorage(directory),null,5000);name='sekme-export-'+Date.now()+'-'+Math.random().toString(36).slice(2)+'.mp4';handle=await wait(directory.getFileHandle(name,{create:true}),null,5000);writable=await wait(handle.createWritable(),null,5000);liveStorageNames.add(name);}}catch{try{if(name)await wait(directory?.removeEntry(name),null,3000);}catch{}liveStorageNames.delete(name);directory=handle=writable=null;}
 const stream=new WritableStream({async write({data,position}){
  if(!Number.isSafeInteger(position)||position<0)throw Error('Invalid MP4 write position');const end=position+data.byteLength;if(end>cfg.maxBytes)throw Error('Video file too large');
  const copy=new Uint8Array(data.byteLength);copy.set(data);
  if(writable){try{await wait(writable.write({type:'write',position,data:copy}),null,15000);}catch(e){throw storageFailure(e);}}else for(let from=0;from<copy.length;){const at=position+from,index=Math.floor(at/BLOCK),offset=at%BLOCK,n=Math.min(BLOCK-offset,copy.length-from);let block=blocks.get(index);if(!block){block=new Uint8Array(BLOCK);blocks.set(index,block);}block.set(copy.subarray(from,from+n),offset);from+=n;}bytes=Math.max(bytes,end);
 },async close(){if(writable){try{await wait(writable.close(),null,15000);closed=true;}catch(e){throw storageFailure(e);}}}});
 const target=new media.StreamTarget(stream,{chunked:true,chunkSize:256*1024});
 const dispose=async()=>{liveStorageNames.delete(name);if(writable&&!closed)try{await wait(writable.abort(),null,3000);}catch{}if(name)try{await wait(directory?.removeEntry(name),null,3000);}catch{}blocks.clear();};
 return {target,stream,async finish(){if(!bytes)throw Error('Empty video');if(handle){try{return await wait(handle.getFile(),null,10000);}catch(e){throw storageFailure(e);}}const parts=[];for(let at=0;at<bytes;at+=BLOCK){const n=Math.min(BLOCK,bytes-at),block=blocks.get(at/BLOCK)||new Uint8Array(n);parts.push(block.subarray(0,n));}const blob=new Blob(parts,{type:'video/mp4'});blocks.clear();return blob;},dispose,method:writable?'disk':'fragments'};
}
// Standard, seekable MP4 with its index reserved at the start, suitable for file sharing.
async function normalizeMp4(result,job,env,media,cfg){
 if(!media?.Input||!media?.EncodedPacketSink||!media?.BlobSource||result.extension!=='mp4')return result;
 const input=new media.Input({formats:media.ALL_FORMATS,source:new media.BlobSource(result.blob)});let storage,output;
 try{const v=await input.getPrimaryVideoTrack(),a=await input.getPrimaryAudioTrack();if(!v)throw Error('Video track missing');const config=result.method==='software-worker'?avcRateConfig(await v.getDecoderConfig(),cfg):await v.getDecoderConfig();if(!config.codec.startsWith('avc1.')&&!config.codec.startsWith('avc3.'))throw Error('An H.264 MP4 is required');
  const width=await v.getDisplayWidth(),height=await v.getDisplayHeight();if(width!==cfg.width||height!==cfg.height){const e=Error('The encoder changed video resolution');e.code='resolution';throw e;}
  storage=await streamStorage(env,media,cfg);output=new media.Output({target:storage.target,format:new media.Mp4OutputFormat({fastStart:'reserve',...(cfg.fps===120?{metadataFormat:'mdta'}:{})})});
  const vs=new media.EncodedVideoPacketSource('avc'),as=a?new media.EncodedAudioPacketSource('aac'):null;output.addVideoTrack(vs,{frameRate:(cfg.fps||FPS),maximumPacketCount:Math.ceil(job.duration*(cfg.fps||FPS)*2+120)});if(as){const ac=await a.getDecoderConfig();if(!ac.codec.startsWith('mp4a.'))throw Error('An AAC audio track is required');output.addAudioTrack(as,{maximumPacketCount:Math.ceil(job.duration*100+256)});}
  setFullRateMetadata(output,cfg);await wait(output.start(),job.signal,15000);const offset=result.trimStart||0;async function* packets(){for await(const p of new media.EncodedPacketSink(v).packets()){if(p.timestamp<offset-.00001)continue;yield offset?p.clone({timestamp:Math.max(0,p.timestamp-offset)}):p;}}const vi=packets()[Symbol.asyncIterator](),ai=a?new media.EncodedPacketSink(a).packets()[Symbol.asyncIterator]():null,ac=a?await a.getDecoderConfig():null;let vp=await wait(vi.next(),job.signal),ap=ai?await wait(ai.next(),job.signal):{done:true};
  while(!vp.done||!ap.done){check(job.signal);if(ap.done||!vp.done&&vp.value.timestamp<=ap.value.timestamp){await wait(vs.add(vp.value,{decoderConfig:config}),job.signal);vp=await wait(vi.next(),job.signal);}else{await wait(as.add(ap.value,{decoderConfig:ac}),job.signal);ap=await wait(ai.next(),job.signal);}}
  vs.close();as?.close();await wait(output.finalize(),job.signal,20000);const blob=await wait(storage.finish(),job.signal,30000);await result.dispose?.();return {...result,blob,dispose:storage.dispose,storage:storage.method,trimStart:0,width,height,container:'standard-mp4'};
 }catch(e){try{await wait(output?.cancel(),null,3000);}catch{}await storage?.dispose();await result.dispose?.();throw e;}finally{input.dispose();}
}
// Video support is independent of audio support. Probe real output at the requested dimensions.
async function probeVideo(env,config,signal){
 if(!env.document?.createElement)return true;
 const canvas=env.document.createElement('canvas');if(!canvas?.getContext)return true;
 canvas.width=config.width;canvas.height=config.height;let encoder,decoder,frames=0,rejectError;const verify=config.framerate===120&&typeof env.VideoDecoder==='function',chunks=[];let decoderConfig;
 const failed=new Promise((_,reject)=>{rejectError=reject;});failed.catch(()=>{});
 try{const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw Error('2D canvas unavailable');ctx.fillStyle='#142a34';ctx.fillRect(0,0,canvas.width,canvas.height);
  encoder=new env.VideoEncoder({output(chunk,meta){frames++;if(verify){chunks.push(chunk);if(meta.decoderConfig)decoderConfig=meta.decoderConfig;}},error:rejectError});encoder.configure(config);
  const count=verify?6:2;for(let i=0;i<count;i++){ctx.fillStyle=i%2?'#eee':'#151515';ctx.fillRect(0,0,canvas.width,canvas.height);const frame=new env.VideoFrame(canvas,{timestamp:Math.round(i*1e6/(config.framerate||FPS)),duration:Math.round((i+1)*1e6/(config.framerate||FPS))-Math.round(i*1e6/(config.framerate||FPS))});try{encoder.encode(frame,{keyFrame:i===0});}finally{frame.close();}}
  await wait(Promise.race([encoder.flush(),failed]),signal,5000);if(frames!==count)throw Error('Encoder lost video frames');
  if(verify){if(!decoderConfig)throw Error('Missing decoder configuration');let decoded=0,decodeError=null;const pixel=env.document.createElement('canvas');pixel.width=2;pixel.height=2;const c=pixel.getContext('2d',{willReadFrequently:true});
   decoder=new env.VideoDecoder({output(frame){try{const i=Math.round(frame.timestamp*config.framerate/1e6);if(frame.displayWidth!==config.width||frame.displayHeight!==config.height||i!==decoded)throw Error('120 FPS frame order or dimensions changed');c.drawImage(frame,0,0,2,2);const level=c.getImageData(0,0,1,1).data[0];if(i%2?level<180:level>70)throw Error('120 FPS frame pixels changed');decoded++;}catch(e){decodeError=e;}finally{frame.close();}},error(e){decodeError=e;}});decoder.configure(decoderConfig);for(const chunk of chunks)decoder.decode(chunk);await wait(decoder.flush(),signal,5000);pixel.width=pixel.height=1;if(decodeError)throw decodeError;if(decoded!==count)throw Error('120 FPS decoder lost frames');
  }return true;
 }finally{try{if(encoder&&encoder.state!=='closed')encoder.close();}catch{}try{decoder?.close();}catch{}canvas.width=1;canvas.height=1;}
}
async function serialConfig(env,media,cfg,withAudio,signal){
 if(!env.VideoEncoder||!env.VideoFrame||!media?.EncodedVideoPacketSource)return null;
 const profiles=['avc1.64002a','avc1.4d002a','avc1.42002a','avc1.42E02A'];if(cfg.fps===30||cfg.fps===120)for(let i=0;i<profiles.length;i++)profiles[i]=profiles[i].slice(0,-2)+(cfg.fps===120?'33':'28');let chosen;const deadline=Date.now()+12000;
 for(const codec of profiles){for(const hardwareAcceleration of['prefer-hardware','no-preference']){
  if(Date.now()>=deadline)return null;/* V133: offline export -> 'quality' latency mode first (realtime rate control starves scene cuts); realtime only as fallback */for(const latencyMode of['quality','realtime']){const config={codec,width:cfg.width,height:cfg.height,bitrate:cfg.bitrate,framerate:(cfg.fps||FPS),latencyMode,bitrateMode:'variable',hardwareAcceleration,avc:{format:'avc'}};
  try{const support=await wait(env.VideoEncoder.isConfigSupported(config),signal,5000);if(support.supported&&await probeVideo(env,config,signal)){chosen=config;break;}}catch(e){if(e.name==='AbortError')throw e;}}if(chosen)break;
 }if(chosen)break;}
 if(!chosen)return null;
 let audioMode='native';if(withAudio){let supported=false;try{supported=await wait(media.canEncodeAudio('aac',{sampleRate:48000,numberOfChannels:1,bitrate:cfg.audioBitrate}),signal,5000);}catch(e){if(e.name==='AbortError')throw e;}
  if(!supported){audioMode=audioRecorderMime(env)&&env.MediaStream&&media.EncodedAudioPacketSource&&media.EncodedPacketSink&&media.Input?'recorded':'unavailable';}}
 return {...chosen,audioMode};
}
function audioRecorderMime(env){return ['audio/mp4;codecs=mp4a.40.2','audio/mp4','video/mp4'].find(m=>env.MediaRecorder?.isTypeSupported(m));}
// Older iOS can encode video through WebCodecs but has no AudioEncoder. Record only the tiny audio
// track first, then remux its AAC packets with serial video frames. No full-HD MediaRecorder surface.
async function recordedAudio(job,env,media,info,cfg){
 const signal=job.signal,a=job.audioContext||new(env.AudioContext||env.webkitAudioContext)(),stream=new env.MediaStream();let recorder,cleanup,timer,watchdog,visibility,abort,input;
 try{await wait(a.resume(),signal,5000);if(a.state!=='running')throw Error('Audio export unavailable');
  const blob=await new Promise((resolve,reject)=>{const chunks=[];let bytes=0,settled=false,start=env.performance.now();
   const fail=e=>{if(settled)return;settled=true;reject(e);};abort=()=>fail(new DOMException('Export cancelled','AbortError'));visibility=()=>{if(env.document.hidden)fail(Error('Export interrupted'));};signal?.addEventListener('abort',abort,{once:true});env.document.addEventListener('visibilitychange',visibility);
   cleanup=liveAudio(a,job.audioBuffers||{},info.events,info.duration,stream);recorder=new env.MediaRecorder(stream,{mimeType:audioRecorderMime(env),audioBitsPerSecond:cfg.audioBitrate});
   recorder.ondataavailable=e=>{if(e.data.size){bytes+=e.data.size;if(bytes>Math.max(4e6,info.duration*cfg.audioBitrate/8*3))fail(Error('Audio track too large'));else chunks.push(e.data);}};recorder.onerror=()=>fail(Error('Audio export failed'));recorder.onstop=()=>{if(!settled){settled=true;bytes?resolve(new Blob(chunks,{type:'audio/mp4'})):reject(Error('Empty audio'));}};
   recorder.start(1000);
   const tick=()=>{if(settled)return;try{check(signal);if(env.document.hidden)throw Error('Export interrupted');const t=(env.performance.now()-start)/1000;job.onProgress?.(Math.min(.12,t/info.duration*.12));if(t>=info.duration+.07)recorder.stop();else timer=setTimeout(tick,150);}catch(e){fail(e);}};watchdog=setTimeout(()=>fail(Error('Audio encoder timeout')),(info.duration+12)*1000);tick();
  });
  input=new media.Input({formats:media.ALL_FORMATS,source:new media.BlobSource(blob)});const track=await wait(input.getPrimaryAudioTrack(),signal);if(!track||track.codec!=='aac')throw Error('AAC audio unavailable');const config=await wait(track.getDecoderConfig(),signal),packets=[];let bytes=0;
  for await(const packet of new media.EncodedPacketSink(track).packets()){check(signal);if(packet.timestamp<info.duration){bytes+=packet.data.byteLength;if(bytes>Math.max(4e6,info.duration*cfg.audioBitrate/8*3))throw Error('Audio track too large');packets.push(packet);}}
  if(!packets.length)throw Error('Empty audio packets');return {packets,config};
 }finally{clearTimeout(timer);clearTimeout(watchdog);if(visibility)env.document.removeEventListener('visibilitychange',visibility);if(abort)signal?.removeEventListener('abort',abort);if(recorder&&recorder.state!=='inactive')recorder.stop();stream.getTracks().forEach(t=>t.stop());cleanup?.();input?.dispose();if(a!==job.audioContext)await a.close().catch(()=>{});}
}
async function serialEncode(job,env,media,canvas,draw,info,cfg,config){
 const signal=job.signal;let recorded=null,audioDisabled=false;if(config.audioMode==='recorded'){job.onStage?.('audio');try{recorded=await recordedAudio(job,env,media,info,cfg);}catch(e){if(e.name==='AbortError')throw e;audioDisabled=true;job.onAudioOmitted?.();}}job.onStage?.('video');const onProgress=p=>job.onProgress?.(recorded?.packets?.length ? .12+p*.88 : p),storage=await streamStorage(env,media,cfg);
 let output,video,audio,encoder,error=null,pending=Promise.resolve(),packets=0,expected=0,encodedBytes=0;
 try{output=new media.Output({target:storage.target,format:new media.Mp4OutputFormat({fastStart:'reserve',...(cfg.fps===120?{metadataFormat:'mdta'}:{})})});video=new media.EncodedVideoPacketSource('avc');output.addVideoTrack(video,{frameRate:(cfg.fps||FPS),maximumPacketCount:Math.ceil(info.duration*(cfg.fps||FPS)+4)});
 if(job.withAudio&&!audioDisabled){audio=recorded?new media.EncodedAudioPacketSource('aac'):new media.AudioBufferSource({codec:'aac',quality:new media.Quality({bitrate:cfg.audioBitrate})});output.addAudioTrack(audio,{maximumPacketCount:Math.ceil(info.duration*100+256)});}
  encoder=new env.VideoEncoder({output:(chunk,meta)=>{encodedBytes+=chunk.byteLength;if(encodedBytes>cfg.maxBytes){error=Error('Video file too large');return;}packets++;pending=pending.then(()=>video.add(media.EncodedPacket.fromEncodedChunk(chunk),meta));pending.catch(e=>{error=e;});},error:e=>{error=e;}});const {audioMode,...encoderConfig}=config;encoder.configure(encoderConfig);setFullRateMetadata(output,cfg);await wait(output.start(),job.signal,15000);let audioUntil=0,audioIndex=0;
  const count=Math.ceil(info.duration*(cfg.fps||FPS));
  for(let i=0;i<count;i++){
   check(signal);if(env.document?.hidden)throw Error('Export interrupted');if(error)throw error;const time=i/(cfg.fps||FPS);
   if(recorded){while(audioIndex<recorded.packets.length&&recorded.packets[audioIndex].timestamp<time+1){await wait(audio.add(recorded.packets[audioIndex++],{decoderConfig:recorded.config}),signal);}}else if(audio&&time>=audioUntil){const duration=Math.min(1,info.duration-audioUntil);if(duration>0){await wait(audio.add(audioSegment(env,job.audioBuffers||{},info.events,audioUntil,duration,info.duration)),signal);audioUntil+=duration;}}
   draw(time);const frame=new env.VideoFrame(canvas,{timestamp:Math.round(i*1e6/(cfg.fps||FPS)),duration:Math.round((i+1)*1e6/(cfg.fps||FPS))-Math.round(i*1e6/(cfg.fps||FPS))});
   try{encoder.encode(frame,{keyFrame:i%Math.max(1,Math.round((cfg.fps||FPS)*2))===0||(i>0&&!!job.isCut?.(time,1/(cfg.fps||FPS)))});/* V133: a fresh key frame on every camera cut keeps the first frames of the new shot sharp */expected++;}finally{frame.close();}
   // Flush only at the end: frequent flushes cut temporal compression and stall the GPU.
   // Bound queued surfaces; dequeue does not reset the codec's reference pictures.
   if(encoder.encodeQueueSize>=2)await wait(new Promise((resolve,reject)=>{const drain=()=>{if(error){encoder.removeEventListener('dequeue',drain);reject(error);}else if(encoder.encodeQueueSize<2){encoder.removeEventListener('dequeue',drain);resolve();}};encoder.addEventListener('dequeue',drain);drain();}),signal,15000);
   if((i+1)%8===0)await wait(pending,signal);
   onProgress(Math.min(.99,(i+1)/count));job.onMetrics?.({frame:i+1,total:count,queue:encoder.encodeQueueSize,packets});if(i%4===0)await yieldTask();
  }
  await wait(encoder.flush(),signal,30000);await wait(pending,signal);if(error)throw error;
  if(packets!==expected)throw Error('Incomplete encoded video');encoder.close();encoder=null;audio?.close();video.close();job.onStage?.('finalize');await wait(output.finalize(),signal,30000);check(signal);
  const blob=await wait(storage.finish(),job.signal,30000);if(blob.size>cfg.maxBytes)throw Error('Video file too large');onProgress(1);
  return {blob,dispose:storage.dispose,storage:storage.method,extension:'mp4',score:info.score,method:'serial-frames',audioOmitted:audioDisabled,width:cfg.width,height:cfg.height,container:'standard-mp4'};
 }catch(e){if(encoder&&encoder.state!=='closed')try{encoder.close()}catch{}try{await wait(output?.cancel(),null,3000);}catch{}await storage.dispose();throw e;}
}
async function capture(job,env,canvas,draw,info,cfg){
 const Recorder=env.MediaRecorder,mime=recorderMime(env),signal=job.signal,onProgress=job.onProgress||(()=>{});if(!Recorder||!canvas.captureStream||!mime)throw Error('Video export unavailable');
 let stream,a,recorder,timer,watchdog,visibility,abort,cleanupAudio,settled=false;
 try{stream=canvas.captureStream((cfg.fps||FPS));if(!stream.getVideoTracks?.().length&&stream.getVideoTracks)throw Error('No video track');
  if(job.withAudio){a=job.audioContext||new(env.AudioContext||env.webkitAudioContext)();await wait(a.resume(),signal,5000);if(a.state!=='running')throw Error('Audio export unavailable');}
  check(signal);if(env.document.hidden)throw Error('Keep export visible');draw(0);
  return await new Promise((resolve,reject)=>{
   const chunks=[];let bytes=0;if(a)cleanupAudio=liveAudio(a,job.audioBuffers||{},info.events,info.duration,stream);recorder=new Recorder(stream,{mimeType:mime,videoBitsPerSecond:cfg.bitrate,audioBitsPerSecond:cfg.audioBitrate});
   const fail=e=>{if(settled)return;settled=true;reject(e);};abort=()=>fail(new DOMException('Export cancelled','AbortError'));visibility=()=>{if(env.document.hidden)fail(Error('Export interrupted'));};env.document.addEventListener('visibilitychange',visibility);signal?.addEventListener('abort',abort,{once:true});
   recorder.ondataavailable=e=>{if(e.data.size){bytes+=e.data.size;if(bytes>cfg.maxBytes){fail(Error('Video file too large'));return;}chunks.push(e.data)}};recorder.onerror=()=>fail(Error('Video export failed'));recorder.onstop=()=>{if(!settled){if(!bytes){fail(Error('Empty video'));return;}settled=true;onProgress(1);resolve({blob:new Blob(chunks,{type:mime}),extension:mime.startsWith('video/mp4')?'mp4':'webm',score:info.score,method:'capture',width:cfg.width,height:cfg.height});}};
   recorder.start(1000);const start=env.performance.now();watchdog=setTimeout(()=>fail(Error('Video encoder timeout')),(info.duration+15)*1000);
   const tick=()=>{if(settled)return;try{check(signal);const t=(env.performance.now()-start)/1000;draw(Math.min(t,info.duration));onProgress(Math.min(.99,t/info.duration));if(t>=info.duration){recorder.stop();return;}timer=setTimeout(tick,1000/(cfg.fps||FPS));}catch(e){fail(e)}};tick();
  });
 }finally{clearTimeout(timer);clearTimeout(watchdog);if(visibility)env.document.removeEventListener('visibilitychange',visibility);if(abort)signal?.removeEventListener('abort',abort);if(recorder){recorder.ondataavailable=null;recorder.onerror=null;recorder.onstop=null;if(recorder.state!=='inactive')try{recorder.stop();}catch{}}stream?.getTracks().forEach(t=>t.stop());cleanupAudio?.();if(a&&a!==job.audioContext)await a.close().catch(()=>{});}
}
return {build:96,cleanupStorage,normalPlayback,create,coalesceWrites,oppositionLevel,oppositionCue,oppositionCueAt,oppositionMusicLevel,loopBuffer,goalLevel,teamCue,teamCueAt,teamMusicLevel,ambientLevel,crowdLevel,soundCue,soundDuration,whistleKey,whistleCues,audioEvents,audioSegment,profile,settings,device,needsMedia,originalZip,useSoftware,prepareSoftwareAudio,softwareEncode,normalizeMp4,probeVideo,verifyPlayback,serialConfig,preflight,streamStorage,recordedAudio,audioRecorderMime,recorderMime,verifyResolution,WIDTH,HEIGHT,FPS,HOLD};
});
