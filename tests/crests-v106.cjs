const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..'),F=require(root+'/assets/crest-fallbacks'),C=require(root+'/assets/catalog');
for(const team of C.all){const data=F.get(team.logo);assert(data,team.name+' missing embedded crest: '+team.logo);assert(/^data:image\/(webp|png|svg\+xml);base64,/.test(data),team.name);assert(Buffer.from(data.split(',')[1],'base64').length>100,team.name);assert.equal(F.get('./'+team.logo+'?cache=104'),data);}
const ui=fs.readFileSync(root+'/assets/penalty-ui.v106.js','utf8');assert(ui.includes('Next90CrestFallbacks?.get(src)'));assert(ui.includes('world?.setCrests?.(pictures)'));
console.log(JSON.stringify({PASS:true,catalogTeams:C.all.length,embeddedAssets:F.count,lateImageRefresh:true}));
