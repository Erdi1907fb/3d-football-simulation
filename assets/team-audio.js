/* Metadata only. Decode audio for the selected match, never for the whole catalog. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('./team-audio-config.js'));else r.SekmeTeamAudio=f(r.SekmeTeamAudioConfig);})(typeof globalThis!=='undefined'?globalThis:this,function(Config){'use strict';
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/ı/g,'i').replace(/[^a-z0-9]/g,'');
function create(config={}){const assets={},teams=(config.teams||[]).map(t=>({...t})),lookup=new Map();for(const [key,t]of Object.entries(config.tracks||{}))if(t&&/^assets\/audio\/[a-zA-Z0-9_\/-]+\.(mp3|m4a|ogg|wav)$/.test(t.url||'')&&Number.isFinite(t.duration)&&t.duration>0)assets[key]={...t};for(const t of teams){lookup.set(norm(t.id),t);lookup.set(norm(t.name),t);}
function entry(t){return lookup.get(norm(t?.id))||lookup.get(norm(t?.name))||lookup.get(norm(t?.displayClubName))||lookup.get(norm(t));}
function club(t){const id=entry(t)?.id;return id==='galatasaray'?'gs':id==='fenerbahce'?'fb':id||null;}
function profile(selected=[],venue={}){const host=venue?.host,goalKeys={},result={ambient:'ambient',goalKeys};if(![0,1].includes(host))return result;const home=entry(selected[host]),away=entry(selected[1-host]);if(assets[home?.homeChant])result.ambient=home.homeChant;if(assets[home?.homeGoal])goalKeys[host]=home.homeGoal;if(assets[away?.awayChant])goalKeys[1-host]=away.awayChant;return result;}
function required(p){return [...new Set([p?.ambient,...Object.values(p?.goalKeys||{})].filter(k=>assets[k]))];}
return{assets,teams,club,profile,required};}
return{...create(Config),create};
});
