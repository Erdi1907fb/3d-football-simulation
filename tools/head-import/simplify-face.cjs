'use strict';
// Offline, attribute-aware source face reduction. Preserve all retained vertex data.
const fs=require('node:fs'),path=require('node:path');
(async()=>{const{MeshoptSimplifier:S}=await import(path.join(process.env.NEXT90_MESHOPT_DIR||'/tmp/head-tools/node_modules/meshoptimizer','meshopt_simplifier.js'));await S.ready;const q=JSON.parse(fs.readFileSync(0,'utf8')),idx=new Uint32Array(q.indices),[out,error]=S.simplifyWithAttributes(idx,new Float32Array(q.positions),3,new Float32Array(q.attributes),5,[.5,.5,.5,1,1],null,Math.min(75000,idx.length),.002,['LockBorder']);process.stdout.write(JSON.stringify({indices:Array.from(out),error}));})().catch(e=>{process.stderr.write(e.stack);process.exitCode=1;});
