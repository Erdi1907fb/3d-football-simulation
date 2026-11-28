'use strict';
// V268: "100,000 runs" option — deterministic per seed, follows the model with luck, most frequent score published.
const A=require('node:assert/strict'),M=require('../assets/monte-carlo.js');
const a=M.run(2.337,.857,{seed:2186787619}),b=M.run(2.337,.857,{seed:2186787619});
A.deepEqual(a,b,'same fixture, same answer');A.equal(a.runs,100000);A.deepEqual(a.score,[2,0],'Fenerbahce-Erzurumspor most frequent');
A(a.outcome.home>.6&&a.outcome.away>.05,'favourite usually wins, upsets exist');
A.equal(a.top[0].count,Math.max(...a.top.map(t=>t.count)));
const big=M.run(4.6,.25,{seed:9});A(big.score[0]>=3,'lopsided data gives a big score (no cap)');
const even=M.run(1.3,1.3,{seed:9});A(Math.abs(even.outcome.home-even.outcome.away)<.03);
console.log(JSON.stringify({pass:true,fbErz:a.score,share:+a.share.toFixed(3),big:big.score,even:even.score}));
