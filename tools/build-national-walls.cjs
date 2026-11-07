// Builds assets/national-walls.json from assets/concept/teams.js (national line-ups with
// real names and shirt numbers). Used by the Free Kick Studio to form a wall of the
// correct national team when a duel player wears a national kit.
//   node tools/build-national-walls.cjs
const fs=require('fs'),vm=require('vm'),path=require('path'),root=path.resolve(__dirname,'..');
const w={};vm.runInNewContext(fs.readFileSync(root+'/assets/concept/teams.js','utf8'),{window:w});
const out={};for(const t of w.SEKME_CONCEPT_DATA.teams){if(t.kind!=='national'||!t.country||t.lineup?.players?.length!==11)continue;const c=String(t.country).toLowerCase();(out[c]=out[c]||[]).push({year:Number(t.year)||Number(t.era)||0,label:t.labelEn||t.label,players:t.lineup.players.map(p=>({id:p.id,name:p.name,number:p.number??null,roles:p.roles||[p.position].filter(Boolean)}))});}
for(const c of Object.keys(out))out[c].sort((a,b)=>a.year-b.year);
fs.writeFileSync(root+'/assets/national-walls.json',JSON.stringify({version:108,source:'assets/concept/teams.js national line-ups (FootballSquads/national records, see ASSET-LICENSES.md)',countries:out}));
console.log(Object.keys(out).length,'countries',fs.statSync(root+'/assets/national-walls.json').size,'bytes');
