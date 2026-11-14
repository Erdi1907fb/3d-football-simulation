/* Source roster identities, deterministic simulation choices; no invented names. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f();else r.SekmeSubstitutions=f();})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
 function prepare(lineups,chances,options,seed){
  if(!lineups)return[];const automatic=options.mode==='personal'||options.mode==='concept'||options.fixture?.date>='2026-10-24',explicit=Array.isArray(options.substitutions)?options.substitutions:null;if(!automatic&&!explicit)return[];
  const live=lineups.map(t=>t?{...t,players:t.players.map(p=>({...p})),bench:(t.bench||[]).map(p=>({...p}))}:null),plan=[],counts=[0,0],windows=[new Set(),new Set()],sent=new Set();
  for(const c of chances){const batch=[];
   const requests=explicit?explicit.filter(s=>!s.used&&s.minute<=c.minute):c.minute>=58&&c.minute<91&&plan.length<3?[{team:(seed+plan.length)%2,minute:c.minute}]:[];
   for(const request of requests){const team=Number(request.team),roster=live[team];if(!roster||counts[team]>=5||!roster.bench.length||windows[team].size>=3&&!windows[team].has(c.minute))continue;
    const pairs=[];for(let i=1;i<roster.players.length;i++){const out=roster.players[i];if(sent.has(team*11+i)||request.outId&&request.outId!==out.id||out.isCaptain)continue;for(const incoming of roster.bench){if(request.inId&&request.inId!==incoming.id||!(incoming.roles||[]).includes(out.slot.role)||incoming.number==null||out.number==null)continue;pairs.push({i,out,incoming,priority:['CM','LW','RW','ST','LM','RM','AM'].includes(out.slot.role)?1:0});}}
    // Adjacent natural roles are eligible only when no exact-role change exists.
    if(!pairs.length&&(options.mode==='personal'||options.mode==='concept'||explicit)){const groups=[['DM','CM'],['CM','AM'],['LW','LM'],['RW','RM'],['LB','LWB'],['RB','RWB']];for(let i=1;i<roster.players.length;i++){const out=roster.players[i];if(out.isCaptain||sent.has(team*11+i)||request.outId&&request.outId!==out.id||chances.some(f=>f.minute>=c.minute&&f.team===team&&f.result==='goal'&&[f.finisher??9,f.wideActor??7,f.midActor??5].includes(i)))continue;for(const incoming of roster.bench){if(request.inId&&request.inId!==incoming.id||incoming.number==null||out.number==null)continue;const rs=incoming.naturalRoles?.length?incoming.naturalRoles:incoming.roles||[];if(groups.some(g=>g.includes(out.slot.role)&&rs.some(r=>g.includes(r))))pairs.push({i,out,incoming,priority:['CM','AM','LW','RW','LM','RM'].includes(out.slot.role)?1:0});}}}
    pairs.sort((a,b)=>b.priority-a.priority||((a.i+seed)%11)-((b.i+seed)%11));const pair=pairs[0];if(!pair)continue;
    const record={team,minute:c.minute,slot:pair.i,out:{...pair.out},incoming:{...pair.incoming,slot:{...pair.out.slot},isCaptain:false},simulated:!explicit};roster.players[pair.i]=record.incoming;roster.bench=roster.bench.filter(p=>p.id!==pair.incoming.id);counts[team]++;windows[team].add(c.minute);batch.push(record);plan.push(record);if(explicit)request.used=true;
   }
   if(c.card==='red'&&c.cardActor!=null)sent.add(c.cardActor);c.substitutions=batch;c.activeLineups=live.map(t=>t?{...t,players:t.players.map(p=>({...p})),bench:t.bench.map(p=>({...p}))}:null);
  }
  return plan;
 }
 const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
 function choreography(event,age){const t=Math.max(0,Math.min(3,age)),u=smooth(t/1.2),leave=smooth((t-1.55)/.45),out=smooth((t-2)/1),enter=smooth((t-1.7)/1.3),contact=smooth((t-.95)/.18)*(1-smooth((t-1.45)/.18));return{outgoing:{x:2.1+leave,z:32.3+2.1*u+.5*leave+2.3*out,heading:t<1.55?0:Math.atan2(1,1),speed:t<1.2?2.4:t>1.55?2.5:0,handshake:contact},incoming:{x:2.1,z:34.95-2.55*enter,heading:Math.PI,speed:t>1.7?2.6:0,handshake:contact},official:{x:3.4,z:34.9,heading:Math.PI,board:{out:event.out.number,in:event.incoming.number}},monitor:{x:0,z:35.8,halfWidth:.675,halfDepth:.35},exchange:{x:2.1,y:1.35,z:34.67}};}
 function at(c,time){if(!c.substitutions?.length||time>=c.start||time<c.substitutionStart)return null;const index=Math.min(c.substitutions.length-1,Math.floor((time-c.substitutionStart)/3)),event=c.substitutions[index];const age=time-c.substitutionStart-index*3;return{...event,age,duration:3,choreography:choreography(event,age)};}
 return{prepare,at,choreography};
});
