<?php
declare(strict_types=1);
/* Optional observed passing evidence; absence must remain absence, never invented club data. */
function pp_passing_observation(array $doc,string $teamId,int $cut):?array{
 $c=$doc['header']['competitions'][0]??[];$id=(string)($doc['header']['id']??'');$t=strtotime((string)($c['date']??''));$status=$c['status']['type']??[];
 if(!preg_match('/^\d{1,15}$/',$id)||!$t||$t+9000>=$cut||$cut-$t>180*86400||($status['name']??'')!=='STATUS_FULL_TIME'||!($status['completed']??false))return null;
 // Reject extra-time/shootout summaries rather than mislabelling 120-minute totals per90.
 if(($c['status']['period']??2)>2||isset($doc['format']['overtime'])||isset($doc['format']['shootout']))return null;
 $ids=[];foreach($c['competitors']??[]as$r)$ids[]=(string)($r['team']['id']??$r['id']??'');if(count(array_unique($ids))!==2||!in_array($teamId,$ids,true))return null;
 foreach($doc['boxscore']['teams']??[]as$row){if((string)($row['team']['id']??'')!==$teamId)continue;$stats=[];foreach($row['statistics']??[]as$v){$name=$v['name']??'';if(!in_array($name,['totalPasses','accuratePasses'],true))continue;$raw=$v['value']??$v['displayValue']??null;if(is_numeric($raw))$stats[$name]=(float)$raw;}
  $a=$stats['totalPasses']??null;$s=$stats['accuratePasses']??null;if($a===null||$s===null||$a<100||$a>1200||$s<0||$s>$a||floor($a)!=$a||floor($s)!=$s||$s/$a<.4||$s/$a>.99)return null;
  return ['eventId'=>$id,'teamId'=>$teamId,'kickoff'=>gmdate(DATE_ATOM,$t),'attempts'=>(int)$a,'completed'=>(int)$s];
 }return null;
}
function pp_passing_from_summaries(array $documents,string $teamId,DateTimeImmutable $now,string $kickoff):?array{
 $kick=strtotime($kickoff);if(!$kick||$kick<=$now->getTimestamp())return null;$cut=min($kick,$now->getTimestamp());$rows=[];
 foreach($documents as$doc){if(!is_array($doc))continue;$row=pp_passing_observation($doc,$teamId,$cut);if($row)$rows[$row['eventId']]=$row;}
 usort($rows,fn($a,$b)=>strcmp($b['kickoff'],$a['kickoff']));$rows=array_slice($rows,0,8);if(count($rows)<3)return null;
 $attempts=array_sum(array_column($rows,'attempts'));$completed=array_sum(array_column($rows,'completed'));
 return ['attemptsPer90'=>round($attempts/count($rows),2),'completion'=>round($completed/$attempts,5),'sampleMatches'=>count($rows),'asOf'=>$now->format(DATE_ATOM),'latestMatch'=>$rows[0]['kickoff'],'basis'=>'observed-regulation-match-totals','provider'=>'ESPN completed match boxscores','eventIds'=>array_column($rows,'eventId')];
}
/* Receives the already validated pre-match summary. Never fetches a season endpoint that returns empty results. */
function pp_passing_enrich(array $match,array $history,array $cfg,DateTimeImmutable $now,?callable $fetcher=null):array{
 static $requests=0,$started=null;if($started===null)$started=microtime(true);$kick=strtotime((string)($match['kickoff']??''));if(!$kick||$kick<=$now->getTimestamp())return $match;
 $map=['tr.1'=>'tur.1','en.1'=>'eng.1','de.1'=>'ger.1','it.1'=>'ita.1','es.1'=>'esp.1','fr.1'=>'fra.1','ucl'=>'uefa.champions','uel'=>'uefa.europa','uecl'=>'uefa.europa.conf'];$code=$map[$match['competitionId']??'']??null;if(!$code)return $match;
 // Reuse the existing pre-publication summary cache; no extra upcoming-summary request.
 $eventId=(string)($match['espnEventId']??(($match['source']['name']??'')==='ESPN'?($match['source']['providerMatchId']??''):''));
 $analysisPath=rtrim($cfg['storage_dir'],'/').'/analysis-'.hash('sha256',$code.'|'.$eventId.'|'.$match['kickoff'].'|'.pp_club_key($match['home']).'|'.pp_club_key($match['away'])).'.json';
 $pre=pp_read($analysisPath);$observedAt=strtotime((string)($pre['fetchedAt']??''));$summary=$pre['document']??[];
 if(!$observedAt||$observedAt>$now->getTimestamp()||$observedAt>=$kick||$now->getTimestamp()-$observedAt>21600)return $match;
 // Validate upcoming event, kickoff, side identities using the application's same summary guard.
 try{if(!function_exists('pp_analysis_summary'))return $match;pp_analysis_summary($summary,$match,$now);}catch(Throwable $e){return $match;}
 $ids=[];foreach($summary['header']['competitions'][0]['competitors']??[]as$r){$side=$r['homeAway']??'';if(in_array($side,['home','away'],true))$ids[$side]=(string)($r['team']['id']??'');}
 $budget=($cfg['_web_mode']??false)||($cfg['_publish_only']??false)||!($cfg['analysis_network_enabled']??true)?0:max(0,min(30,(int)($cfg['passing_request_budget']??6)));
 foreach($ids as$side=>$teamId){if(!preg_match('/^\d{1,15}$/',$teamId))continue;$candidates=[];foreach($summary['lastFiveGames']??[]as$group){if((string)($group['team']['id']??'')!==$teamId)continue;foreach($group['events']??[]as$event){$id=(string)($event['id']??'');$t=strtotime((string)($event['gameDate']??''));if(preg_match('/^\d{1,15}$/',$id)&&$t&&$t+9000<$now->getTimestamp()&&$now->getTimestamp()-$t<180*86400)$candidates[$id]=$t;}}
  arsort($candidates);$documents=[];foreach(array_slice($candidates,0,5,true)as$id=>$time){$path=rtrim($cfg['storage_dir'],'/').'/passing-summary-'.hash('sha256',$code.'|'.$id).'.json';$cache=pp_read($path);$stamp=strtotime((string)($cache['fetchedAt']??''));$doc=$stamp&&$stamp<=$now->getTimestamp()?($cache['document']??null):null;
   try{if(!$doc&&$requests<$budget&&microtime(true)-$started<19){$requests++;$net=$cfg;$net['request_timeout_seconds']=max(1,min(5,(int)(20-(microtime(true)-$started)),(int)($cfg['request_timeout_seconds']??5)));$net['max_download_bytes']=min(1500000,(int)($cfg['max_download_bytes']??1500000));$url='https://site.api.espn.com/apis/site/v2/sports/soccer/'.$code.'/summary?event='.$id;$doc=$fetcher?$fetcher($url,$net):pp_fetch($url,$net);if(!is_array($doc)||(string)($doc['header']['id']??'')!==(string)$id)continue;$doc=array_intersect_key($doc,array_flip(['header','boxscore','format']));if(pp_passing_observation($doc,$teamId,$now->getTimestamp()))pp_write($path,['fetchedAt'=>$now->format(DATE_ATOM),'document'=>$doc]);}
    if(is_array($doc)&&(string)($doc['header']['id']??'')===(string)$id)$documents[]=$doc;
   }catch(Throwable $e){}if(count($documents)>=3)break;
  }
  $profile=pp_passing_from_summaries($documents,$teamId,$now,$match['kickoff']);if($profile){$match['authorizedInputs']['passingProfiles'][$side]=$profile;$match[$side]['passingProfile']=$profile+['source'=>$profile['provider']];$match['analysis']['teams'][$side]['passing']=$profile;}
 }
 $match['analysis']['coverage']['passing']=isset($match['authorizedInputs']['passingProfiles']['home'],$match['authorizedInputs']['passingProfiles']['away']);return $match;
}
