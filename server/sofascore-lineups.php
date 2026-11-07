<?php
declare(strict_types=1);
/* Public SofaScore schema adapter, based on ryanlam0618/sofascore-backfill.
 * No proxy rotation, challenge bypass, Python daemon or database installation.
 * Scores/seed stay in the forecast engine. Source errors preserve local XIs. */
function pp_sofa_get(string $path,array $cfg,DateTimeImmutable $now,?callable $fetcher=null,bool $widget=false):array{
 if(!preg_match('~^(?:sport/football/scheduled-events/\d{4}-\d{2}-\d{2}|event/\d{1,15}(?:/incidents)?|team/\d{1,15}(?:/players)?)$~D',$path))throw new RuntimeException('Invalid SofaScore path');
 $url=$widget?'https://widgets.sofascore.com/embed/lineups?id='.substr($path,6):'https://www.sofascore.com/api/v1/'.$path;
 $file=$cfg['storage_dir'].'/sofa-'.hash('sha256',$url).'.json';$cache=pp_read($file);$at=strtotime($cache['fetchedAt']??'')?:0;$ttl=$widget?90:900;
 if($at&&$now->getTimestamp()-$at>=0&&$now->getTimestamp()-$at<$ttl&&!empty($cache['document']))return $cache;
 $failure=pp_read($file.'.failure');if(($failure['retryAt']??0)>$now->getTimestamp())throw new RuntimeException('SofaScore cooldown: '.($failure['reason']??'source unavailable'));
 if(isset($cfg['_lineup_deadline'])&&microtime(true)>$cfg['_lineup_deadline']-.8)throw new RuntimeException('Lineup deadline');
 $net=$cfg;$net['request_timeout_seconds']=max(1,min(3,(int)(($cfg['_lineup_deadline']??(microtime(true)+4))-microtime(true))));$net['max_download_bytes']=2500000;$net['source_hosts']=array_values(array_unique(array_merge($cfg['source_hosts']??[],['www.sofascore.com','widgets.sofascore.com'])));
 try{$raw=$fetcher?$fetcher($url,$net):pp_fetch_raw($url,$net);
  if($widget){if(is_array($raw)&&isset($raw['initialLineups']))$doc=$raw;else{if(!is_string($raw)||!preg_match('~<script\b[^>]*\bid=["\']__NEXT_DATA__["\'][^>]*>~',$raw,$m,PREG_OFFSET_CAPTURE))throw new RuntimeException('SofaScore widget data missing');$start=$m[0][1]+strlen($m[0][0]);$end=stripos($raw,'</script>',$start);if($end===false)throw new RuntimeException('Invalid widget');$doc=json_decode(substr($raw,$start,$end-$start),true,100,JSON_THROW_ON_ERROR)['props']['pageProps']??[];if(!isset($doc['initialLineups'],$doc['initialEvent'])||!empty($doc['error']))throw new RuntimeException('SofaScore lineup not published');}}
  else $doc=is_array($raw)?$raw:json_decode($raw,true,100,JSON_THROW_ON_ERROR);
  if(!is_array($doc)||isset($doc['error']))throw new RuntimeException('Invalid SofaScore response');$out=['document'=>$doc,'url'=>$url,'fetchedAt'=>$now->format(DATE_ATOM)];pp_write($file,$out);return $out;
 }catch(Throwable $e){pp_write($file.'.failure',['retryAt'=>$now->getTimestamp()+300,'reason'=>substr($e->getMessage(),0,120)]);throw $e;}
}
function pp_sofa_event_ok(array $e,array $m):bool{
 $ut=['en.1'=>17,'es.1'=>8,'de.1'=>35,'it.1'=>23,'fr.1'=>34,'tr.1'=>52,'ucl'=>7,'uel'=>679,'uecl'=>17015];$competition=$e['tournament']['uniqueTournament']['id']??null;
 if(!isset($ut[$m['competitionId']??''])||(int)$competition!==$ut[$m['competitionId']])return false;
 $stamp=strtotime($m['kickoff']??'')?:0;if(!$stamp||abs((int)($e['startTimestamp']??0)-$stamp)>900)return false;
 foreach(['home','away']as$side)if(pp_public_name($e[$side.'Team']['name']??'')!==pp_public_name($m[$side]['name']??''))return false;return preg_match('/^\d{1,15}$/D',(string)($e['id']??''))===1;
}
function pp_sofa_discover(array $m,array $cfg,DateTimeImmutable $now,?callable $fetcher=null):?array{
 $id=(string)($m['sofascoreEventId']??'');$map=pp_read($cfg['storage_dir'].'/sofa-events.json');$stored=$map[$m['id']??'']??null;if(!$id&&is_array($stored)&&pp_sofa_event_ok($stored,$m))return $stored;
 if(preg_match('/^\d{1,15}$/D',$id)){$capture=pp_sofa_get('event/'.$id,$cfg,$now,$fetcher,true);$e=$capture['document']['initialEvent']??[];return pp_sofa_event_ok($e,$m)?$e:null;}
 $date=gmdate('Y-m-d',strtotime($m['kickoff']??'')?:0);$capture=pp_sofa_get('sport/football/scheduled-events/'.$date,$cfg,$now,$fetcher);$found=[];foreach($capture['document']['events']??[]as$e)if(pp_sofa_event_ok($e,$m))$found[]=$e;if(count($found)!==1)return null;$map[$m['id']]=$found[0];if(count($map)>1000)$map=array_slice($map,-800,null,true);pp_write($cfg['storage_dir'].'/sofa-events.json',$map);return $found[0];
}
function pp_sofa_slots(string $formation):?array{
 $defs=['4-2-3-1'=>['RB','CB','CB','LB','DM','DM','RW','AM','LW','ST'],'4-3-3'=>['RB','CB','CB','LB','CM','DM','CM','RW','ST','LW'],'4-4-2'=>['RB','CB','CB','LB','RM','CM','CM','LM','ST','ST'],'3-5-2'=>['CB','CB','CB','RWB','CM','DM','CM','LWB','ST','ST'],'3-4-2-1'=>['CB','CB','CB','RWB','CM','CM','LWB','AM','AM','ST'],'3-4-3'=>['CB','CB','CB','RWB','CM','CM','LWB','RW','ST','LW'],'4-1-4-1'=>['RB','CB','CB','LB','DM','RM','CM','CM','LM','ST'],'4-3-1-2'=>['RB','CB','CB','LB','CM','DM','CM','AM','ST','ST'],'4-4-1-1'=>['RB','CB','CB','LB','RM','CM','CM','LM','AM','ST'],'5-3-2'=>['RB','CB','CB','CB','LB','CM','DM','CM','ST','ST'],'5-4-1'=>['RB','CB','CB','CB','LB','RM','CM','CM','LM','ST']];return isset($defs[$formation])?array_merge(['GK'],$defs[$formation]):null;
}
function pp_sofa_player(array $row,array $pool,string $role,array $missing,string $at,string $url):?array{
 $p=$row['player']??[];$sid=(string)($p['id']??'');$name=trim((string)($p['name']??''));if(!preg_match('/^\d{1,15}$/D',$sid)||!$name)return null;$dob=isset($p['dateOfBirthTimestamp'])?gmdate('Y-m-d',(int)$p['dateOfBirthTimestamp']):null;$matches=[];
 foreach($pool as$old)if((string)($old['providerIds']['sofascore']??'')===$sid||pp_public_name($old['name']??'')===pp_public_name($name)&&(!$dob||empty($old['dateOfBirth'])||substr($old['dateOfBirth'],0,10)===$dob))$matches[]=$old;
 $old=count($matches)===1?$matches[0]:[];$out=$old;$out['id']=(string)($old['id']??('ss-'.$sid));$out['name']=$name;$out['shortName']=$p['shortName']??$name;$out['number']=is_numeric($row['shirtNumber']??$row['jerseyNumber']??null)?(int)($row['shirtNumber']??$row['jerseyNumber']):($old['number']??null);$out['providerIds']=array_merge($old['providerIds']??[],['sofascore'=>$sid]);$out['dateOfBirth']=$dob??$old['dateOfBirth']??null;$out['roles']=[$role];$out['position']=$role;$out['naturalRoles']=$old['naturalRoles']??pp_lineup_natural_roles(['position'=>$p['position']??$row['position']??$role]);$out['captain']=($row['captain']??false)===true;
 $absence=$missing[$sid]??null;$out['availability']=$absence?(($absence['type']??'')==='doubtful'?'doubtful':'unavailable'):'not-flagged';$out['available']=$out['availability']!=='unavailable';$out['unavailable']=!$out['available'];if($absence)$out['availabilityEvidence']=['source'=>'SofaScore','asOf'=>$at,'url'=>$url,'type'=>$absence['type']??'missing','reason'=>$absence['description']??$absence['reason']??null];
 if(is_numeric($p['height']??null)&&$p['height']>=140&&$p['height']<=220)$out['physical']=array_merge($old['physical']??[],['heightCm'=>(int)$p['height'],'verifiedMeasurements'=>true,'source'=>'SofaScore player metadata']);
 // Deliberately exclude current-match statistics/ratings from pre-match prediction.
 return $out;
}
function pp_sofa_enrich(array $m,array $teams,array $cfg,DateTimeImmutable $now,?callable $fetcher=null):array{
 if(($cfg['sofascore_enabled']??true)!==true||!empty($m['concept']))return $teams;
 try{$event=pp_sofa_discover($m,$cfg,$now,$fetcher);if(!$event){pp_lineup_trace('SofaScore','no-exact-event');return $teams;}$capture=pp_sofa_get('event/'.$event['id'],$cfg,$now,$fetcher,true);$doc=$capture['document'];if(!pp_sofa_event_ok($doc['initialEvent']??[],$m))throw new RuntimeException('SofaScore event identity mismatch');$lineups=$doc['initialLineups'];$confirmed=($lineups['confirmed']??false)===true;
 foreach(['home','away']as$i=>$side){$raw=$lineups[$side]??[];$pool=array_merge($teams[$i]['players']??[],$teams[$i]['bench']??[]);$missing=[];foreach($raw['missingPlayers']??[]as$p)if(isset($p['player']['id']))$missing[(string)$p['player']['id']]=$p;
  $starters=array_values(array_filter($raw['players']??[],fn($p)=>($p['substitute']??false)!==true));$subs=array_values(array_filter($raw['players']??[],fn($p)=>($p['substitute']??false)===true));$formation=(string)($raw['formation']??'');$slots=pp_sofa_slots($formation);$xi=[];$bench=[];
  foreach($starters as$j=>$p){$role=$slots[$j]??(['G'=>'GK','D'=>'DEF','M'=>'MID','F'=>'FWD'][$p['position']??'']??'MID');$q=pp_sofa_player($p,$pool,$role,$missing,$capture['fetchedAt'],$capture['url']);if($q)$xi[]=$q;}
  foreach($subs as$p){$role=['G'=>'GK','D'=>'DEF','M'=>'MID','F'=>'FWD'][$p['position']??'']??'MID';$q=pp_sofa_player($p,$pool,$role,$missing,$capture['fetchedAt'],$capture['url']);if($q&&($confirmed||$q['available']))$bench[]=$q;}
  if(count($xi)!==11||count(array_unique(array_column($xi,'id')))!==11)continue;
  if(!$confirmed&&count(array_filter($xi,fn($p)=>!$p['available']))){$fit=pp_lineup_fit(array_column($xi,'position'),array_merge(array_filter($xi,fn($p)=>$p['available']),$bench),$xi);if(!$fit)continue;$chosen=array_fill_keys(array_column($fit,'id'),true);$bench=array_values(array_filter($bench,fn($p)=>!isset($chosen[$p['id']])));$xi=$fit;$repaired=true;}else $repaired=false;
  if(!$confirmed&&($teams[$i]['source']['status']??'')==='provider-lineup')continue;
  $coach=$doc['initialEvent'][$side.'Team']['manager']??null;$manager=!empty($coach['name'])?['id'=>'ss-manager-'.($coach['id']??''),'name'=>$coach['name'],'source'=>'SofaScore current team metadata','basis'=>'current-club','asOf'=>$capture['fetchedAt'],'url'=>$capture['url']]:($teams[$i]['coach']??null);
  $teams[$i]=array_merge($teams[$i]??[],['teamId'=>(string)($m[$side]['espnId']??''),'sofascoreTeamId'=>(string)$doc['initialEvent'][$side.'Team']['id'],'formation'=>$slots?$formation:($teams[$i]['formation']??'4-2-3-1'),'players'=>$xi,'bench'=>pp_bench_select($bench,$xi,$m['competitionId'],$confirmed),'coach'=>$manager,'missingPlayers'=>array_values($missing),'source'=>['name'=>'SofaScore','status'=>$confirmed?'provider-lineup':($repaired?'estimated-availability-repair':'provider-predicted'),'selectionVersion'=>PP_LINEUP_SELECTION_VERSION,'selectionBasis'=>$confirmed?'exact-match-confirmed':($repaired?'provider-prediction-with-absence-repair':'exact-match-unconfirmed'),'asOf'=>$capture['fetchedAt'],'url'=>$capture['url'],'providerEventId'=>(string)$event['id'],'confirmed'=>$confirmed,'benchStatus'=>$confirmed?'match-bench':'provider-predicted-bench']]);if($manager)pp_current_coach_save($m,$side,$manager,$cfg);
 }
 pp_lineup_trace('SofaScore',count(array_filter($teams,fn($t)=>($t['source']['name']??'')==='SofaScore'))?'matched':'lineup-not-published');return $teams;
 }catch(Throwable $e){pp_lineup_trace('SofaScore','unavailable',substr($e->getMessage(),0,160));return $teams;}
}

function pp_sofa_fresh(?array $t,DateTimeImmutable $now):bool{
 $at=strtotime($t['source']['asOf']??'')?:0;
 return ($t['source']['name']??'')==='SofaScore'&&count($t['players']??[])===11&&in_array($t['source']['status']??'',['provider-predicted','provider-lineup','estimated-availability-repair'],true)&&!($t['source']['stale']??false)&&$at>0&&$at<=$now->getTimestamp()&&$now->getTimestamp()-$at<180;
}
function pp_secondary_fresh(?array $t,DateTimeImmutable $now):bool{if(pp_sofa_fresh($t,$now))return true;$at=strtotime($t['source']['asOf']??'')?:0;return ($t['source']['name']??'')==='BSD'&&count($t['players']??[])===11&&in_array($t['source']['status']??'',['provider-predicted','provider-lineup'],true)&&!($t['source']['stale']??false)&&$at>0&&$at<=$now->getTimestamp()&&$now->getTimestamp()-$at<180;}
function pp_sofa_fotmob(array $m,array $teams,array $cfg,DateTimeImmutable $now,?callable $fetcher=null):array{
 $original=$teams;
 if(count(array_filter($teams,fn($t)=>pp_secondary_fresh($t,$now)))===2)return ['teams'=>$teams,'venue'=>null];
 pp_lineup_trace('FotMob','checking-after-sofascore');$fallback=$cfg;$fallback['_lineup_deadline']=min($cfg['_lineup_deadline'],microtime(true)+8);
 $public=pp_public_enrich($m,$teams,$fallback,$now,$fetcher);$teams=pp_club_refresh_provider($m,$public['teams'],$fallback,$now,$fetcher);
 foreach([0,1]as$i)if(pp_secondary_fresh($original[$i]??null,$now)&&(($original[$i]['source']['status']??'')==='provider-lineup'||($teams[$i]['source']['status']??'')!=='provider-lineup'))$teams[$i]=$original[$i];
 pp_lineup_trace('FotMob',count(array_filter($teams,fn($t)=>($t['source']['name']??'')==='FotMob'))?'matched':'saved-roster-preserved');return ['teams'=>$teams,'venue'=>$public['venue']??null];
}
