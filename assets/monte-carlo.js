/* V268: "100,000 simulations" option. The fixture's model expected goals are played 100,000 times; every run gets
 * its own luck (form/finishing swing per team and a shared match-tempo swing), and the most frequent exact score is
 * the one published for this option. Deterministic per seed, so the same fixture gives the same answer. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f();else r.Next90MonteCarlo=f();})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
 function rng(seed){let x=(seed>>>0)||1;return()=>{x=(x+0x6d2b79f5)>>>0;let t=Math.imul(x^x>>>15,1|x);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};}
 function gauss(r){return Math.sqrt(-2*Math.log(Math.max(1e-12,r())))*Math.cos(2*Math.PI*r());}
 function poisson(r,l){const L=Math.exp(-l);let k=0,p=1;do{k++;p*=r();}while(p>L&&k<30);return k-1;}
 function run(home,away,{runs=100000,seed=1,luck=.18,tempo=.10}={}){
  home=Math.max(.05,Number(home)||0);away=Math.max(.05,Number(away)||0);const r=rng(seed),counts=new Map(),outcome={home:0,draw:0,away:0};
  for(let i=0;i<runs;i++){const pace=Math.exp(gauss(r)*tempo),h=poisson(r,home*pace*Math.exp(gauss(r)*luck)),a=poisson(r,away*pace*Math.exp(gauss(r)*luck)),k=h+'-'+a;counts.set(k,(counts.get(k)||0)+1);outcome[h>a?'home':h===a?'draw':'away']++;}
  const top=[...counts].sort((x,y)=>y[1]-x[1]||x[0].localeCompare(y[0])).slice(0,6).map(([k,n])=>{const[h,a]=k.split('-').map(Number);return{score:[h,a],count:n,share:n/runs};});
  return{runs,score:top[0].score,share:top[0].share,top,outcome:{home:outcome.home/runs,draw:outcome.draw/runs,away:outcome.away/runs},expectedGoals:{home,away}};
 }
 return Object.freeze({run,version:'monte-carlo-v268'});
});
