<?php
declare(strict_types=1);
require_once __DIR__.'/availability.php';
function pp_bench_limit(string $competition):int{return ['ucl'=>12,'uel'=>12,'uecl'=>12,'tr.1'=>10,'en.1'=>9,'de.1'=>9,'fr.1'=>9,'es.1'=>12,'it.1'=>15][$competition]??12;}
function pp_bench_evidence():array{static $doc=null;return $doc??=json_decode(file_get_contents(__DIR__.'/../assets/squad-evidence.json'),true);}
function pp_bench_travel(array $m,string $side):?array{
 foreach(pp_bench_evidence()['matchSquads']??[]as$e)if(($e['date']??'')===($m['date']??'')&&pp_public_name($e['home'])===pp_public_name($m['home']['name']??'')&&pp_public_name($e['away'])===pp_public_name($m['away']['name']??'')&&pp_public_name($e['team'])===pp_public_name($m[$side]['name']??''))return $e;return null;
}
function pp_bench_band(array $p):string{
 $r=strtoupper((string)($p['positionIdsDesc']??implode(',', $p['roles']??[(string)($p['position']??'')])));
 if(preg_match('/\b(GK|G)\b/',$r))return 'GK';if(preg_match('/\b(CB|LB|RB|LWB|RWB|DEF|DC|DL|DR)\b/',$r))return 'DEF';if(preg_match('/\b(ST|LW|RW|FWD|CF)\b/',$r))return 'FWD';return 'MID';
}
function pp_bench_select(array $candidates,array $xi,string $competition,bool $official=false,array $recent=[],?array $travel=null):array{
 $limit=pp_bench_limit($competition);$ids=[];$names=[];$numbers=[];foreach($xi as$p){if(isset($p['number']))$numbers[(int)$p['number']]=true;$ids[(string)$p['id']]=true;$names[pp_public_name($p['name'])]=true;}
 $allowed=$travel?array_fill_keys(array_map('pp_public_name',$travel['players']),true):null;$pool=[];
 foreach($candidates as$i=>$p){$id=(string)($p['id']??'');$name=pp_public_name($p['name']??'');$number=$p['number']??null;if($number!==null&&isset($numbers[(int)$number]))continue;if(!$id||!$name||isset($ids[$id])||isset($names[$name])||$allowed&&!isset($allowed[$name])||!$official&&($p['unavailable']??false))continue;$ids[$id]=true;$names[$name]=true;if($number!==null)$numbers[(int)$number]=true;$p['_order']=$i;$p['_band']=pp_bench_band($p);$p['_score']=(isset($recent[$id])||isset($recent[(string)($p['providerIds']['fotmob']??'')])?80:0)+min(25,(float)($p['seasonMinutes']??0)/100)+min(10,(float)($p['appearances']??0))+(float)($p['rating']??0);$pool[]=$p;}
 if(!$official&&!$travel){usort($pool,fn($a,$b)=>($b['_score']<=>$a['_score'])?:($a['_order']<=>$b['_order']));$chosen=[];$take=function(string $band,int $n)use(&$pool,&$chosen){foreach($pool as$i=>$p)if($p['_band']===$band&&$n>0){$chosen[]=$p;unset($pool[$i]);$n--;}};$take('GK',$limit>=12?2:1);$take('DEF',min(3,$limit-4));$take('MID',min(3,$limit-4));$take('FWD',2);foreach($pool as$p){if(count($chosen)>=$limit)break;if($p['_band']==='GK'&&count(array_filter($chosen,fn($a)=>$a['_band']==='GK'))>=($limit>=12?2:1))continue;$chosen[]=$p;}$pool=$chosen;}
 $pool=array_slice($pool,0,$limit);foreach($pool as&$p)unset($p['_order'],$p['_band'],$p['_score']);unset($p);return array_values($pool);
}
// Explicit user override for one match. Remote providers must not replace it.
function pp_fixture_lineup_locked(array $m):bool{return ($m['date']??'')==='2026-10-26'&&pp_public_name($m['home']['name']??'')==='galatasaray'&&pp_public_name($m['away']['name']??'')==='fenerbahce';}
function pp_derby_probable(array $snapshot,array $m):array{
 if(!pp_fixture_lineup_locked($m))return $snapshot;
 $team=json_decode(file_get_contents(__DIR__.'/../assets/derby-lineup-lock.json'),true);$snapshot['teams']=$snapshot['teams']??[null,null];if(count($snapshot['teams'][0]['players']??[])!==11)$snapshot['teams'][0]=json_decode(file_get_contents(__DIR__.'/../assets/derby-home-fallback.json'),true);$snapshot['teams'][1]=$team;$snapshot['fixtureLocked']=true;$snapshot['version']=5;$snapshot['selectionVersion']=PP_LINEUP_SELECTION_VERSION;$snapshot['status']=empty($snapshot['teams'][0])?'partial':'ready';$snapshot['locked']=true;return $snapshot;
}
function pp_source_fixture_fallback(array $snapshot,array $m):array{
 if(pp_fixture_lineup_locked($m))return pp_derby_probable($snapshot,$m);
 if(($m['date']??'')!=='2026-10-25'||pp_public_name($m['home']['name']??'')!=='barcelona'||pp_public_name($m['away']['name']??'')!=='realmadrid')return $snapshot;
 $fallback=json_decode(file_get_contents(__DIR__.'/../assets/clasico-source-fallback.json'),true);
 foreach(['barcelona','real-madrid']as$i=>$club){$t=$snapshot['teams'][$i]??null;if(count($t['players']??[])!==11||(!in_array($t['source']['status']??'',['provider-lineup','provider-predicted'],true)&&($t['source']['selectionVersion']??0)<6))$snapshot['teams'][$i]=$fallback[$club];}
 $t=&$snapshot['teams'][0];$raph=$fallback['barcelona']['players'][10];$has=count(array_filter($t['players'],fn($p)=>(int)($p['number']??0)===11))>0;if(!$has)foreach($t['players']as$k=>$p)if((int)($p['number']??0)===9){$t['players'][$k]=$raph;$t['bench']=array_values(array_filter($t['bench']??[],fn($a)=>!in_array((int)($a['number']??0),[9,11],true)));array_unshift($t['bench'],$p);$t['bench']=array_slice($t['bench'],0,12);$t['source']['status']='estimated-user-forward';$t['source']['fixtureForwardLocked']=true;break;}unset($t);
 $t=&$snapshot['teams'][0];if(!in_array($t['source']['status']??'',['provider-lineup','provider-predicted'],true)){
  foreach($t['bench']??[]as$j=>$p)if(str_contains(pp_public_name($p['name']??''),'raphinha')&&!pp_lineup_out($p)){
   foreach($t['players']as$k=>$current)if(str_contains(pp_public_name($current['name']??''),'gabrieljesus')&&($current['position']??'')==='ST'&&($p['seasonStarts']??0)>($current['seasonStarts']??0)){$p['roles']=['ST'];$p['position']='ST';$t['players'][$k]=$p;$t['bench'][$j]=$current;$t['source']['selectionBasis']='Nesine current-season participation estimate for returned Raphinha; not announced';break;}
  }
 }unset($t);$snapshot['status']='ready';return $snapshot;
}
function pp_bench_snapshot(array $snapshot,array $m):array{
 $snapshot=pp_source_fixture_fallback($snapshot,$m);
 $snapshot=pp_availability_snapshot($snapshot,$m);
 foreach(['home','away']as$i=>$side){if(empty($snapshot['teams'][$i]))continue;$t=&$snapshot['teams'][$i];$official=in_array($t['source']['benchStatus']??'',['match-bench','provider-predicted-bench'],true)||(($t['source']['name']??'')==='ESPN'&&($t['source']['status']??'')==='provider-lineup');$travel=$official?null:pp_bench_travel($m,$side);$t['bench']=pp_bench_select($t['bench']??[],$t['players']??[],$m['competitionId']??'', $official, array_fill_keys($t['source']['recentBenchIds']??[],true),$travel);$t['benchLimit']=pp_bench_limit($m['competitionId']??'');
  if(!$official&&!$travel)$t['source']['benchStatus']='expected-from-current-squad';if($travel){$t['source']['benchStatus']='expected-from-official-travelling-squad';$t['source']['benchEvidence']=$travel['source'];$canonical=[];foreach($travel['players']as$name)$canonical[pp_public_name($name)]=$name;foreach(['players','bench']as$key)foreach($t[$key]as&$p){$name=$canonical[pp_public_name($p['name'])]??null;if($name){$p['name']=$name;$bits=preg_split('/\s+/u',$name);preg_match('/^./u',$bits[0],$initial);$p['shortName']=count($bits)>1?$initial[0].'. '.end($bits):$name;}}unset($p);}
  foreach(pp_bench_evidence()['captains']??[]as$e)if(($m['date']??'')>=$e['validFrom']&&($m['date']??'')<=$e['validUntil']&&pp_public_name($e['team'])===pp_public_name($m[$side]['name']??'')){foreach($t['players']as$p)if(pp_public_name($p['name'])===pp_public_name($e['name'])){$hasSource=count(array_filter($t['players'],fn($a)=>$a['captain']??false))>0;if(!$hasSource){$t['captainId']=$p['id'];$t['captainEvidence']=$e['source'];}break;}}
  unset($t);
 }return $snapshot;
}
