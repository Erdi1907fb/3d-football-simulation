// Lightweight selections from our existing concept archive; no external roster or asset import.
const fs=require('fs'),vm=require('vm'),path=require('path'),root=path.resolve(__dirname,'..'),ctx={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/concept/teams.js'),'utf8'),ctx);
const wanted=['Gerard Piqué','Sergio Ramos','Iker Casillas','Marc-André ter Stegen','Carles Puyol','Paolo Maldini','Alessandro Nesta','Fabio Cannavaro','Franco Baresi','Roberto Carlos','Cafu','Philipp Lahm','Dani Alves','Gianluigi Buffon','Manuel Neuer','Oliver Kahn','Edwin van der Sar','Peter Schmeichel','Nemanja Vidić','Rio Ferdinand','John Terry','Ashley Cole','Javier Mascherano','Thiago Silva','David Alaba','Lúcio','Jérôme Boateng','Pepe','Víctor Valdés'];
const chosen=new Map();
for(const t of ctx.window.SEKME_CONCEPT_DATA.teams.filter(t=>t.kind==='club'))for(const p of [...(t.lineup?.players||[]),...(t.lineup?.bench||[])])if(wanted.includes(p.name)&&!chosen.has(p.name)&&p.number!=null)chosen.set(p.name,{...p,naturalRoles:p.roles,archiveTeam:t.label,archiveSource:t.id});
const players=[...chosen.values()].sort((a,b)=>a.name.localeCompare(b.name));
fs.writeFileSync(path.join(root,'assets/japon-legends.json'),JSON.stringify({source:'Existing assets/concept/teams.js; model appearance is stylised, not a scan.',players},null,1)+'\n');console.log(players.length+' archived players; '+Buffer.byteLength(JSON.stringify(players))+' bytes');
