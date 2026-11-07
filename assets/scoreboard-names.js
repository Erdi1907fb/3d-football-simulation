(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f();else r.SekmeScoreboardNames=f();})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const aliases={'paris saint-germain':'PSG','paris saint germain':'PSG','manchester united':'Man United','manchester city':'Man City','nottingham forest':"Nott'm Forest",'brighton & hove albion':'Brighton','wolverhampton wanderers':'Wolves','borussia mönchengladbach':'Mönchengladbach','olympique de marseille':'Marseille','olympique lyonnais':'Lyon','istanbul başakşehir':'Başakşehir','real sociedad de fútbol':'Real Sociedad'};
function prepare(c,teams,max,size=26,min=18){
 let names=teams.map(t=>String(t.name||t));c.font=`bold ${size}px Arial`;
 names=names.map(name=>c.measureText(name).width<=max?name:aliases[name.toLocaleLowerCase('en')]||name.replace(/^(?:FC |AC |AFC )|(?: FC| AFC)$/g,''));
 for(;size>min;size--){c.font=`bold ${size}px Arial`;if(names.every(n=>c.measureText(n).width<=max))break;}
 c.font=`bold ${size}px Arial`;names=names.map(n=>c.measureText(n).width<=max?n:n.split(/[\s-]+/).filter(Boolean).map(w=>w[0]).join('').slice(0,7).toUpperCase());
 return{rows:names.map(n=>[n]),size,max,count:1};
}
return{prepare};});
