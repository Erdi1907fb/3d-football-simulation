<?php
declare(strict_types=1);
/* Current club metadata is independent of whether an XI has been announced. */
function pp_club_registry():array {static $r=null;return $r??=pp_read(__DIR__.'/../assets/club-rosters-v75.json');}
function pp_club_entry(array $team):?array {
 $all=pp_club_registry()['teams'];$e=$all[(string)($team['espnId']??'')]??null;if(!$e&&empty($team['espnId'])){$matches=array_values(array_filter($all,fn($e)=>pp_public_name($e['name'])===pp_public_name($team['name']??'')));if(count($matches)===1)$e=$matches[0];}
 return $e&&pp_public_name($e['name'])===pp_public_name($team['name']??'')?$e:null;
}
function pp_club_estimate_from_squad(array $squad,array $existing):?array{
 $pool=[];foreach($squad as$p)if(!pp_lineup_out($p)&&is_numeric($p['shirtNumber']??null)&&pp_lineup_natural_roles($p))$pool[]=$p;
 $fit=pp_lineup_fit(['GK','RB','CB','CB','LB','DM','DM','RW','AM','LW','ST'],$pool,[]);if(!$fit)return null;return array_map(fn($p)=>pp_public_player($p,$squad,$existing),$fit);
}
function pp_club_team_from_page(array $page,array $entry,DateTimeImmutable $now,array $existing=[]):?array {
 $v=$page['fallback']['team-'.$entry['fotmobId']]??[];$d=$v['details']??[];$season=(int)$now->format('Y')-((int)$now->format('n')<7?1:0);
 if((string)($d['id']??'')!==(string)$entry['fotmobId']||pp_public_name($d['name']??'')!==pp_public_name($entry['fotmobName'])||substr($d['latestSeason']??'',0,4)!==(string)$season)return null;
 $squad=[];$coaches=[];foreach($v['squad']['squad']??[]as$g){if(($g['title']??'')==='coach'){$coaches=$g['members']??[];continue;}foreach($g['members']??[]as$p)$squad[(string)$p['id']]=$p;}
 $coach=count($coaches)===1&&!empty($coaches[0]['name'])?['id'=>'fm-'.$coaches[0]['id'],'name'=>$coaches[0]['name'],'source'=>'FotMob current club','asOf'=>$now->format(DATE_ATOM),'url'=>$entry['url']]:null;
 $last=$v['overview']['lastLineupStats']??[];$xi=pp_public_roles((string)($last['formation']??''),$last['starters']??[]);$players=[];$bench=[];
 if($xi){$fixed=pp_public_repair($xi,$squad,[],true)??pp_public_repair($xi,$squad,[],false);if($fixed)$xi=$fixed;foreach($xi as$p){$id=(string)$p['id'];if(!isset($squad[$id])||pp_lineup_out($squad[$id])){$players=[];break;}$players[]=pp_public_player($p,$squad,$existing);}}
 $estimated=false;if(count($players)!==11){$fit=pp_club_estimate_from_squad($squad,$existing);if($fit){$players=$fit;$estimated=true;}}
 if(count($players)===11){$selected=array_fill_keys(array_map(fn($p)=>pp_public_name($p['name']),$players),true);foreach($squad as$p){if(isset($selected[pp_public_name($p['name']??'')])||pp_lineup_out($p)||!is_numeric($p['shirtNumber']??null))continue;$p['_role']=pp_lineup_natural_roles($p)[0]??'MID';$out=pp_public_player($p,$squad,$existing);$out['roles']=$out['naturalRoles']?:[$p['_role']];$bench[]=$out;}}
 return ['teamId'=>(string)$entry['espnId'],'formation'=>$estimated?'4-2-3-1':($last['formation']??'4-2-3-1'),'players'=>$players,'bench'=>$bench,'coach'=>$coach,'source'=>['name'=>'FotMob','status'=>$estimated?'estimated-from-current-squad':'estimated-from-recent-start','selectionVersion'=>PP_LINEUP_SELECTION_VERSION,'selectionBasis'=>$estimated?'model-role-fit-of-current-available-squad-not-announced':'current-club-roster-and-most-recent-XI','asOf'=>$now->format(DATE_ATOM),'url'=>$entry['url'],'benchStatus'=>'club-roster-reserves','providerTeamId'=>(string)$entry['fotmobId']]];
}
function pp_club_complete(array $snapshot,array $m,array $cfg,DateTimeImmutable $now,bool $network=false,?callable $fetcher=null):array {
 foreach(['home','away']as$i=>$side){$entry=pp_club_entry($m[$side]);$id=(string)($m[$side]['espnId']??'');if(!$entry&&preg_match('/^\d{1,12}$/',$id))$entry=pp_read($cfg['storage_dir'].'/club-entry-'.$id.'.json')?:null;
  if(!$entry&&$network){try{$league=pp_public_leagues()[$m['competitionId']]??null;if($league){$index=pp_public_page('https://www.fotmob.com/leagues/'.$league[0].'/table/'.$league[1],$cfg,$now,$fetcher);foreach($index['page']['fixtures']['allMatches']??[]as$e)foreach(['home','away']as$s)if(pp_public_name($e[$s]['name'])===pp_public_name($m[$side]['name'])){$t=$e[$s];$entry=['espnId'=>$id,'name'=>$m[$side]['name'],'fotmobId'=>(string)$t['id'],'fotmobName'=>$t['name'],'url'=>'https://www.fotmob.com/teams/'.$t['id'].'/squad/'.preg_replace('/[^a-z0-9-]/','-',strtolower($t['name']))];break 2;}if($entry)pp_write($cfg['storage_dir'].'/club-entry-'.$id.'.json',$entry);}}catch(Throwable $e){}}
  if(!$entry||pp_public_name($entry['name'])!==pp_public_name($m[$side]['name']))continue;$tid=(string)$entry['espnId'];$path=$cfg['storage_dir'].'/club-team-'.$tid.'.json';$saved=pp_read($path);$useSaved=(strtotime($saved['asOf']??'')?:0)>=(strtotime($entry['asOf']??'')?:0);$base=$useSaved?($saved['team']??$entry['team']??null):($entry['team']??$saved['team']??null);$at=strtotime($useSaved?($saved['asOf']??$entry['asOf']??''):($entry['asOf']??''))?:0;
  if($network&&($now->getTimestamp()-$at>900||empty($base['coach']))){try{$r=pp_public_page($entry['url'],$cfg,$now,$fetcher);$fresh=pp_club_team_from_page($r['page'],$entry,new DateTimeImmutable($r['fetchedAt']),array_merge($snapshot['teams'][$i]['players']??[],$snapshot['teams'][$i]['bench']??[]));if($fresh){$fresh['source']['stale']=$r['stale'];if(!empty($fresh['coach'])){$fresh['coach']['stale']=$r['stale'];$fresh['coach']['basis']='current-club';pp_current_coach_save($m,$side,$fresh['coach'],$cfg);}$base=$fresh;$at=strtotime($r['fetchedAt']);pp_write($path,['asOf'=>$r['fetchedAt'],'team'=>$fresh]);}}catch(Throwable $e){}}
  if(!$base||(string)($base['teamId']??'')!==$tid)continue;$old=$snapshot['teams'][$i]??null;if($old&&!empty($old['teamId'])&&(string)$old['teamId']!==$tid)continue;
  if(count($old['players']??[])!==11&&count($base['players']??[])===11)$old=$base;
  if(!$old)continue;$old['teamId']=$tid;if(!empty($base['coach'])&&(empty($old['coach'])||($old['source']['status']??'')!=='provider-lineup'&&!pp_fixture_lineup_locked($m)&&(strtotime($base['coach']['asOf']??'')?:0)>(strtotime($old['coach']['asOf']??'')?:0))){$old['coach']=$base['coach'];$old['source']['coachBasis']=['source'=>$base['coach']['source'],'asOf'=>$base['coach']['asOf']??null,'url'=>$entry['url']];}
  if(empty($old['bench'])&&($old['source']['benchStatus']??'')!=='match-bench'&&!empty($base['bench'])){$pool=array_merge($base['players']??[],$base['bench']);$old['bench']=pp_bench_select($pool,$old['players'],$m['competitionId']);$old['source']['benchStatus']='club-roster-reserves';$old['source']['benchAsOf']=$base['source']['asOf']??null;}
  $snapshot['teams'][$i]=$old;
 }
 if(count(array_filter($snapshot['teams']??[],fn($t)=>count($t['players']??[])===11))===2)$snapshot['status']='ready';
 return pp_bench_snapshot($snapshot,$m);
}
