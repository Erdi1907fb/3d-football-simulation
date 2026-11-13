'use strict';
const assert=require('node:assert/strict'),V=require('../assets/video-core.js');
(async()=>{
 const cfg=V.settings({duration:4}),events=[];await V.ensureAudio({withAudio:false},{},{},cfg);
 const native={canEncodeAudio:async()=>true};await V.ensureAudio({withAudio:true,onAudioEncoder:p=>events.push(p)},{},native,cfg);assert.deepEqual(events,['native-aac']);
 let recorderPath;await V.ensureAudio({withAudio:true,onAudioEncoder:p=>recorderPath=p},{MediaRecorder:{isTypeSupported:()=>true}},{canEncodeAudio:async()=>false},cfg);assert.equal(recorderPath,'native-aac-recorder');
 let registered=false,loads=0;const media={canEncodeAudio:async()=>registered},env={Worker:function(){},WebAssembly:{},document:{createElement:()=>({remove(){}}),head:{appendChild(script){loads++;assert(script.src.includes('assets/vendor/mediabunny-aac/encoder.js'));env.MediabunnyAacEncoder={registerAacEncoder(){registered=true;}};queueMicrotask(()=>script.onload());}}}};
 await Promise.all([V.ensureAudio({withAudio:true,onAudioEncoder:p=>events.push(p)},env,media,cfg),V.ensureAudio({withAudio:true},env,media,cfg)]);assert.equal(loads,1);assert.equal(events.at(-1),'software-aac');await V.ensureAudio({withAudio:true},env,media,cfg);assert.equal(loads,1);
 await assert.rejects(()=>V.ensureAudio({withAudio:true},{},{canEncodeAudio:async()=>false},cfg),e=>e.code==='audio-unavailable');
 const cancel=new AbortController();cancel.abort();await assert.rejects(()=>V.ensureAudio({withAudio:true,signal:cancel.signal},{},native,cfg),e=>e.name==='AbortError');
 let disposed=0,track=null;const mux={ALL_FORMATS:[],BlobSource:class{},Input:class{getPrimaryAudioTrack(){return Promise.resolve(track);}dispose(){disposed++;}}};const job={withAudio:true,duration:4},result={blob:new Blob()};
 await assert.rejects(()=>V.verifyAudio(result,job,{},mux,cfg),e=>e.code==='audio-unavailable');
 track={codec:'opus',computeDuration:async()=>4};await assert.rejects(()=>V.verifyAudio(result,job,{},mux,cfg),e=>e.code==='audio-unavailable');
 track={codec:'aac',computeDuration:async()=>1};await assert.rejects(()=>V.verifyAudio(result,job,{},mux,cfg),e=>e.code==='audio-unavailable');
 track={codec:'aac',computeDuration:async()=>4.01};assert((await V.verifyAudio(result,job,{},mux,cfg)).audioVerified);await assert.rejects(()=>V.verifyAudio({...result,audioOmitted:true},job,{},mux,cfg),e=>e.code==='audio-unavailable');assert.equal(disposed,5);
 console.log(JSON.stringify({pass:true,nativeWithoutDownload:true,localFallbackSingleLoad:true,cancellation:true,missingWrongShortOmittedAudioRejected:true,completeAacAccepted:true}));
})().catch(e=>{console.error(e);process.exit(1)});
