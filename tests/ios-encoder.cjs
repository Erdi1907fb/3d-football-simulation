'use strict';
const A=require('node:assert/strict'),V=require('../assets/video-core'),G=require('../assets/graphics-settings');
async function run(ios,{cancelAt,failAt}={}){
 const cfg={...V.settings({env:{navigator:{userAgent:ios?'iPhone':'Linux'}},duration:4.1}),ios},instances=[],timestamps=[],controller=new AbortController();let live=0,maxLive=0,disposed=0,finalized=0,released=0;
 class Encoder{
  constructor(callbacks){this.cb=callbacks;this.frames=[];this.encodeQueueSize=0;this.state='unconfigured';instances.push(this);maxLive=Math.max(maxLive,++live);}
  configure(){this.state='configured';}
  encode(f,options){A.equal(f.closed,false);this.frames.push(f.timestamp);timestamps.push(f.timestamp);if(!this.frames.length||this.frames.length===1)A(options.keyFrame,'each independent block starts with a keyframe');if(failAt===timestamps.length)this.cb.error(Error('hardware failure'));else this.cb.output({byteLength:4,timestamp:f.timestamp},{});}
  flush(){return Promise.resolve();}close(){A.notEqual(this.state,'closed');this.state='closed';live--;}
 }
 const env={navigator:{},VideoEncoder:Encoder,VideoFrame:class{constructor(c,options){Object.assign(this,options);this.closed=false;}close(){this.closed=true;}},document:{hidden:false}},media={StreamTarget:class{constructor(s){this.stream=s;}},Output:class{constructor({target}){this.target=target;}addVideoTrack(){}async start(){}async finalize(){finalized++;const w=this.target.stream.getWriter();await w.write({position:0,data:new Uint8Array(64)});await w.close();}async cancel(){}},Mp4OutputFormat:class{},EncodedVideoPacketSource:class{async add(){}close(){}},EncodedPacket:{fromEncodedChunk:c=>c}};
 const promise=V.serialEncode({signal:controller.signal,onFramesComplete:()=>released++,onMetrics:m=>{if(m.frame===cancelAt)controller.abort();}},env,media,{},()=>{},{duration:4.1,score:[0,0],events:[]},cfg,{codec:'avc1.42E02A'});
 if(cancelAt||failAt){await A.rejects(promise,e=>cancelAt?e.name==='AbortError':/hardware failure/.test(e.message));A.equal(finalized,0);}else{const result=await promise;await result.dispose();A.equal(timestamps.length,246);A(timestamps.every((t,i)=>t===Math.round(i*1e6/60)),'no frame or timestamp reset');A.equal(finalized,1);A.equal(released,1);A.equal(instances.length,ios?3:1);if(ios)A(instances.every(e=>e.frames.length<=120));}
 A.equal(live,0);A.equal(maxLive,1,'old encoder closes before next allocation');return instances.length;
}
(async()=>{await run(true);await run(false);await run(true,{cancelAt:121});await run(true,{failAt:122});const p=G.get('mobileExport');A.equal(p.targetFps,60);A.equal(p.maxDimension,1920);A.equal(p.shadows,false);A.equal(p.jerseyResolution,512);A.equal(p.tufts,0);A.equal(G.get('high').anisotropy,16);console.log(JSON.stringify({pass:true,iosEncoderBlocks:3,frames:246,globalTimestamps:true,oneEncoderAtATime:true,cancelAndFailureClose:true,desktopUnchanged:true,fullResolutionAndFps:true}));})().catch(e=>{console.error(e);process.exit(1)});
