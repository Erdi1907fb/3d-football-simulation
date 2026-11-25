'use strict';
// Offline build dependency: meshoptimizer@1.3.0 (MIT); never loaded in the website.
const fs=require('node:fs'),path=require('node:path');
(async()=>{const{MeshoptSimplifier:S}=await import(path.join(process.env.NEXT90_MESHOPT_DIR||'/tmp/head-tools/node_modules/meshoptimizer','meshopt_simplifier.js'));await S.ready;const q=JSON.parse(fs.readFileSync(0,'utf8')),indices=new Uint32Array(q.indices),[out,error]=S.simplifyWithAttributes(indices,new Float32Array(q.positions),3,new Float32Array(q.attributes),5,[.1,.1,.1,.25,.25],null,Math.min(q.target*3,indices.length),.01,['LockBorder','Prune']);process.stdout.write(JSON.stringify({indices:Array.from(out),error}));})().catch(e=>{process.stderr.write(e.stack);process.exitCode=1;});
