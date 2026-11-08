const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..'),F=require(root+'/assets/crest-fallbacks'),C=require(root+'/assets/catalog');
for(const team of C.all){const data=F.get(team.logo);assert(data,team.name+' missing embedded crest: '+team.logo);assert(/^data:image\/(webp|png|svg\+xml);base64,/.test(data),team.name);assert(Buffer.from(data.split(',')[1],'base64').length>100,team.name);assert.equal(F.get('./'+team.logo+'?cache=104'),data);}
const ui=fs.readFileSync(root+'/assets/penalty-ui.js','utf8');assert(ui.includes('Next90CrestFallbacks?.get(src)'));assert(ui.includes('world?.setCrests?.(pictures)'));
// V125 national-team display names: Turkish exonyms in TR, English names in EN; every national team has both.
for(const t of C.all.filter(t=>t.league==='Millî / National'))assert(t.names?.tr&&t.names?.en,t.id+' localized names');
assert.equal(C.localName('Italia','tr'),'İtalya');assert.equal(C.localName('Italia','en'),'Italy');assert.equal(C.localName('Türkiye','en'),'Turkey');assert.equal(C.localName('Türkiye','tr'),'Türkiye');assert.equal(C.localName('Germany','tr'),'Almanya');assert.equal(C.find('İngiltere')?.id,'england');assert.equal(C.localName('Galatasaray','en'),'Galatasaray');
console.log(JSON.stringify({PASS:true,catalogTeams:C.all.length,embeddedAssets:F.count,lateImageRefresh:true}));
