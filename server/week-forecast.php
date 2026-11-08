<?php
declare(strict_types=1);
require_once __DIR__.'/season-data.php';
/* One canonical pre-match forecast serves both the weekly video and its later replay.
 * Preparing a weekly score does not release the 3D replay ahead of its normal date. */
function sw_team_id(string $name):?string{static $map=null;$map??=pp_read(__DIR__.'/../assets/seasons/team-map.json');return $map[trim($name)]??$map[pp_club_key(['name'=>trim($name)])]??null;}
function sw_active_week(array $data):?int{
 $rounds=[];foreach($data['matches']??[]as$m)if(empty($m['stage'])&&isset($m['round']))$rounds[(int)$m['round']][]=$m;ksort($rounds,SORT_NUMERIC);
 // A partial or postponed matchday stays selected until every result is known.
 foreach($rounds as$week=>$matches)foreach($matches as$m)if(($m['score']??null)===null&&!in_array($m['bsdStatus']??'',['cancelled','canceled'],true))return $week;
 return null;
}
function sw_fixture(array $row,array $data,array $state):array{
 $competition=$data['competitionId'];$season=$data['season'];$clubs=[];foreach($data['teams']as$t)$clubs[$t['id']]=$t;$teams=[];
 foreach(['home','away']as$side){$t=$clubs[$row[$side]]??null;if(!$t)throw new RuntimeException('Haftalık maçın takım kimliği eksik');$teams[$side]=pp_team($t['name']);foreach(pp_club_registry()['teams']??[]as$entry)if(sw_team_id($entry['name'])===$t['id']){$teams[$side]['espnId']=(string)$entry['espnId'];break;}}
 $event=(string)($row['espnId']??'');$id=preg_match('/^\d{1,15}$/D',$event)?substr(hash('sha256','espn|'.$competition.'|'.$event),0,24):substr(hash('sha256','weekly|'.$competition.'|'.$season.'|'.$row['home'].'|'.$row['away'].'|'.$row['round']),0,24);
 // Existing forecasts take priority, even when another provider assigned a different id.
 foreach(array_merge(array_values($state['predictions']??[]),array_values($state['matches']??[]))as$known){if(($known['competitionId']??'')!==$competition||($known['season']??$season)!==$season)continue;if(sw_team_id($known['home']['name']??'')!==$row['home']||sw_team_id($known['away']['name']??'')!==$row['away'])continue;if(!empty($known['date'])&&abs(strtotime($known['date'])-strtotime($row['date']))>21*86400)continue;$id=$known['id'];$teams=['home'=>$known['home'],'away'=>$known['away']];break;}
 $kick=$row['kickoff']??null;if(!$kick||!strtotime($kick))throw new RuntimeException('Haftalık maçın başlangıç saati henüz doğrulanmadı');
 $name=['tr.1'=>'Süper Lig','en.1'=>'Premier League','es.1'=>'La Liga','de.1'=>'Bundesliga','it.1'=>'Serie A','fr.1'=>'Ligue 1','ucl'=>'UEFA Champions League','uel'=>'UEFA Europa League','uecl'=>'UEFA Conference League','unl'=>'UEFA Nations League','intl'=>'International Friendly'][$competition]??$competition;
 $source=['name'=>$row['resultSource']??(!empty($row['bsdId'])&&($data['provider']??'')==='BSD'?'BSD':($event?'ESPN':'Verified season fixture')),'url'=>$data['baselineSource']??$data['source']??'','fetchedAt'=>$data['fetchedAt']??null,'cached'=>false,'basis'=>'validated-complete-season'];if($event)$source['providerMatchId']=$event;
 $fixture=['id'=>$id,'date'=>pp_bulletin_day(new DateTimeImmutable($kick)),'kickoff'=>$kick,'competitionId'=>$competition,'competition'=>$name,'season'=>$season,'round'=>'Matchday '.(int)$row['round'],'seasonRound'=>(int)$row['round'],'home'=>$teams['home'],'away'=>$teams['away'],'result'=>is_array($row['score']??null)?['home'=>(int)$row['score'][0],'away'=>(int)$row['score'][1]]:null,'source'=>$source,'neutral'=>false,'timeConfirmed'=>true,'scheduleProvisional'=>false];if($event){$fixture['espnEventId']=$event;$fixture['providerMatchId']=$event;}
 // Preserve pre-match market observations only when already validated for this fixture.
 $known=$state['matches'][$id]??null;if($known){foreach(['marketSnapshot','neutral','providerStatus']as$key)if(array_key_exists($key,$known))$fixture[$key]=$known[$key];$fixture['source']=$known['source']??$source;}
 return $fixture;
}
function sw_history(array $data,array $state,?array $cfg=null):array{
 $history=$state['matches']??[];$datasets=pp_read(__DIR__.'/../assets/seasons/2026-27.json');
 foreach($datasets as$id=>&$d){if($cfg){$cached=pp_read($cfg['storage_dir'].'/season-'.$id.'.json');$d=ss_latest_snapshot($d,$cached['data']??null);}if($id===$data['competitionId'])$d=$data;}unset($d);
 foreach($datasets as$d)foreach($d['matches']??[]as$row){if(($row['score']??null)===null)continue;$m=sw_fixture($row,$d,$state);if(empty($history[$m['id']]['result']))$history[$m['id']]=$m;}
 // A small, identity-checked real-results snapshot covers clubs whose domestic
 // competitions sit outside the six supported leagues (e.g. Conference League).
 foreach(pp_read(__DIR__.'/../assets/seasons/verified-team-history.json')['matches']??[]as$m)if(($m['source']['name']??'')==='BSD'&&($m['source']['basis']??'')==='verified-team-history'&&!empty($m['result'])&&!isset($history[$m['id']]))$history[$m['id']]=$m;
 return array_values($history);
}
function sw_import_history(array $m,array $history,array $cfg,DateTimeImmutable $now,?callable $fetcher=null):array{
 if(!bsd_key($cfg)&&!$fetcher)return ['rows'=>[],'status'=>'not-configured'];$cut=min($now->getTimestamp(),strtotime($m['kickoff']));$counts=['home'=>0,'away'=>0];
 foreach($history as$g){if(empty($g['result'])||(strtotime($g['kickoff']??'')?:PHP_INT_MAX)+9000>=$cut)continue;foreach(['home','away']as$s)if(in_array(sw_team_id($m[$s]['name']),[sw_team_id($g['home']['name']),sw_team_id($g['away']['name'])],true))$counts[$s]++;}
 foreach(['home','away']as$side){if($counts[$side]>=3)continue;$club=bsd_club($m[$side]);if(!$club)continue;$cfg['_bsd_deadline']=microtime(true)+6;$path='/api/v2/teams/'.$club['bsdId'].'/fixtures/?status=finished&date_from='.gmdate('Y-m-d',$cut-550*86400).'&date_to='.gmdate('Y-m-d',$cut).'&limit=20';
  try{$doc=bsd_json($path,$cfg,$now,3600,$fetcher);$rows=sw_bsd_history_rows($doc,$club,$now,$cut);return ['rows'=>$rows,'status'=>$rows?'verified':'no-completed-history'];}catch(Throwable $e){return ['rows'=>[],'status'=>'provider-deferred'];}
 }return ['rows'=>[],'status'=>'not-needed'];
}
function sw_bsd_history_rows(array $doc,array $club,DateTimeImmutable $now,?int $cut=null):array{
 $cut=min($cut??$now->getTimestamp(),$now->getTimestamp());static $canonical=null;if($canonical===null){$canonical=[];foreach(pp_read(__DIR__.'/../assets/seasons/2026-27.json')as$d)foreach($d['teams']as$t)$canonical[$t['id']]=$t['name'];}$known=[];foreach(bsd_clubs()as$eid=>$c)$known[(int)$c['bsdId']]=$c+['espnId'=>(string)$eid];$out=[];
 foreach($doc['results']??$doc['events']??[]as$e){$at=strtotime($e['event_date']??'');$hid=$e['home_team_id']??null;$aid=$e['away_team_id']??null;if(($e['status']??'')!=='finished'||!is_int($hid)||!is_int($aid)||$hid===$aid||!in_array((int)$club['bsdId'],[$hid,$aid],true)||!$at||$at+9000>=$cut||$cut-$at>550*86400||!is_int($e['home_score']??null)||!is_int($e['away_score']??null)||min($e['home_score'],$e['away_score'])<0||max($e['home_score'],$e['away_score'])>30||!is_int($e['id']??null))continue;
  $teams=[];foreach(['home'=>$hid,'away'=>$aid]as$s=>$pid){$name=$e[$s.'_team']??'';if(!is_string($name)||$name==='')continue 2;$c=$known[$pid]??null;if($c&&pp_public_name($name)!==pp_public_name($c['bsdName']))continue 2;$teams[$s]=pp_team($c?($canonical[$c['catalogId']]??$c['name']):$name);if($c)$teams[$s]['espnId']=$c['espnId'];$teams[$s]['bsdId']=$pid;}
  $out[]=['id'=>substr(hash('sha256','bsd-history|'.$e['id']),0,24),'date'=>pp_bulletin_day(new DateTimeImmutable($e['event_date'])),'kickoff'=>$e['event_date'],'competitionId'=>array_search((int)($e['league_id']??0),bsd_leagues(),true)?:'bsd-league-'.(int)($e['league_id']??0),'season'=>(string)($e['season_id']??''),'home'=>$teams['home'],'away'=>$teams['away'],'result'=>['home'=>$e['home_score'],'away'=>$e['away_score']],'source'=>['name'=>'BSD','basis'=>'verified-team-history','providerMatchId'=>(string)$e['id'],'fetchedAt'=>$now->format(DATE_ATOM),'url'=>'https://sports.bzzoiro.com/api/v2/events/'.$e['id'].'/']];
 }return $out;
}
function sw_history_ready(array $m,array $history,DateTimeImmutable $now):bool{
 if(!pp_history_ready($m,$history,$now))return false;$counts=['home'=>0,'away'=>0];$seen=[];$cut=min(strtotime($m['kickoff']),$now->getTimestamp());foreach($history as$game){if(!is_array($game['result']??null))continue;$at=strtotime($game['kickoff']??($game['date'].'T23:59:59+03:00'));if(!$at||$at+9000>=$cut)continue;$key=pp_fixture_identity($game).'|'.$game['date'];if(isset($seen[$key]))continue;$seen[$key]=true;foreach(['home','away']as$s)if(in_array(sw_team_id($m[$s]['name']),[sw_team_id($game['home']['name']),sw_team_id($game['away']['name'])],true))$counts[$s]++;}return min($counts)>=3;
}
function sw_prepare(array $cfg,string $competition,DateTimeImmutable $now):array{
 $base=pp_read(__DIR__.'/../assets/seasons/2026-27.json')[$competition]??null;if(!$base)throw new RuntimeException('Organizasyon yok');$cache=pp_read($cfg['storage_dir'].'/season-'.$competition.'.json');$data=ss_latest_snapshot($base,$cache['data']??null);$week=sw_active_week($data);if($week===null)return ['status'=>'season-complete','week'=>null,'missing'=>0];
 $targets=array_values(array_filter($data['matches'],fn($m)=>empty($m['stage'])&&(int)$m['round']===$week&&($m['score']??null)===null&&!in_array($m['bsdStatus']??'',['cancelled','canceled'],true)));usort($targets,fn($a,$b)=>strcmp($a['kickoff']??$a['date'],$b['kickoff']??$b['date']));
 $lock=fopen($cfg['storage_dir'].'/update.lock','c');if(!$lock||!flock($lock,LOCK_EX|LOCK_NB)){if($lock)fclose($lock);return ['status'=>'locked','week'=>$week];}
 try{
  $state=pp_replay_restoration_apply(pp_read($cfg['storage_dir'].'/state.json',['matches'=>[],'predictions'=>[]]),$now);$forecastLock=pp_forecast_lock_capture($cfg['storage_dir'],$state);$history=sw_history($data,$state,$cfg);$pending=[];$awaiting=0;$unready=0;
  foreach($targets as$row){$m=sw_fixture($row,$data,$state);$state['matches'][$m['id']]=$state['matches'][$m['id']]??$m;if(isset($state['predictions'][$m['id']]))continue;if($m['result']||strtotime($m['kickoff'])<=$now->getTimestamp()){$awaiting++;continue;}if(!sw_history_ready($m,$history,$now)){$unready++;continue;}$pending[]=$m;}
  $missing=count($pending)+$awaiting+$unready;
  if(!$pending&&$unready){foreach($targets as$row){$candidate=sw_fixture($row,$data,$state);if(sw_history_ready($candidate,$history,$now))continue;$import=sw_import_history($candidate,$history,$cfg,$now);$added=0;foreach($import['rows']as$g)if(!isset($state['matches'][$g['id']])){$state['matches'][$g['id']]=$g;$added++;}if($added){$state=pp_forecast_lock_merge($state,$forecastLock);pp_write($cfg['storage_dir'].'/state.json',$state);return ['status'=>'history-prepared','week'=>$week,'missing'=>$missing,'remaining'=>$missing,'historyAdded'=>$added];}break;}}
  if(!$pending){return ['status'=>$awaiting?'awaiting-result':($unready?'insufficient-history':'ready'),'week'=>$week,'missing'=>$missing,'remaining'=>$missing];}
  // One full detailed analysis per tick keeps shared hosting and phones responsive.
  $m=$pending[0];$local=$cfg;$local['analysis_timeout_seconds']=2;$local['analysis_max_seconds']=4;$local['analysis_request_budget']=1;$local['passing_request_budget']=0;$local['analysis_network_enabled']=false; // Complete verified history is already present; optional live providers must not block a weekly video.
  try{$m=pp_analysis_enrich($m,$history,$local,$now);$m=pp_passing_enrich($m,$history,$local,$now);$m=pp_analysis_v44($m,$now);}catch(Throwable $e){return ['status'=>'analysis-deferred','week'=>$week,'missing'=>$missing,'remaining'=>$missing];}
  if(empty($m['analysis']['teams'])||empty($m['analysis']['coverage']['goalForm']))return ['status'=>'insufficient-history','week'=>$week,'missing'=>$missing,'remaining'=>$missing];
  $p=pp_build_prediction($m,$history,$now);$p['weeklyPrepared']=true;$p['weeklyPreparedAt']=$now->format(DATE_ATOM);$p['weeklyRound']=$week;$p['weeklyPolicy']='shared-analysis-normal-replay-release';unset($p['weeklyPublished']);
  $state['predictions'][$m['id']]=$p;$state=pp_forecast_lock_merge($state,$forecastLock);pp_write($cfg['storage_dir'].'/state.json',$state);pp_compact_cache($state,$cfg,$now);
  return ['status'=>'prepared','week'=>$week,'fixtureId'=>$m['id'],'missing'=>$missing-1,'remaining'=>$missing-1,'replayReleased'=>pp_released($p,$now)];
 }finally{flock($lock,LOCK_UN);fclose($lock);}
}
