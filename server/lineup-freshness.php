<?php
declare(strict_types=1);
/* Field-level metadata: a historical XI is never evidence of today's manager. */
function pp_lineup_trace(?string $provider=null,string $status='',?string $detail=null):array{static $rows=[];if($provider==='__reset'){$rows=[];return [];}if($provider!==null)$rows[$provider]=['provider'=>$provider,'status'=>$status,'detail'=>$detail];return array_values($rows);}
function pp_current_coach_save(array $m,string $side,array $coach,array $cfg):void{$id=(string)($m[$side]['espnId']??'');if(!preg_match('/^\d{1,12}$/D',$id)||empty($coach['name'])||empty($coach['asOf']))return;$previous=pp_read($cfg['storage_dir'].'/coach-current-'.$id.'.json');if((strtotime($previous['coach']['asOf']??'')?:0)>(strtotime($coach['asOf'])?:0))return;pp_write($cfg['storage_dir'].'/coach-current-'.$id.'.json',['teamId'=>$id,'name'=>$m[$side]['name'],'coach'=>$coach]);}
function pp_coaches_finalize(array $snapshot,array $m,array $cfg,DateTimeImmutable $now):array{
 if(($m['date']??'')<$now->format('Y-m-d')||!empty($m['concept']))return $snapshot;
 if(function_exists('pp_national_callup_filter'))$snapshot=pp_national_callup_filter($snapshot,$m,$now,$cfg);
 foreach(['home','away']as$i=>$side){if(empty($snapshot['teams'][$i]))continue;$t=&$snapshot['teams'][$i];$id=(string)($m[$side]['espnId']??'');$saved=pp_read($cfg['storage_dir'].'/coach-current-'.$id.'.json');$fresh=((string)($saved['teamId']??'')===$id&&pp_public_name($saved['name']??'')===pp_public_name($m[$side]['name']??''))?($saved['coach']??null):null;$entry=pp_club_entry($m[$side]);$club=$entry['team']['coach']??null;
  foreach([$club]as$c)if($c&&strtotime($c['asOf']??'')>strtotime($fresh['asOf']??''))$fresh=$c;
  $exact=($t['source']['status']??'')==='provider-lineup'&&($t['coach']['basis']??'')==='exact-match';
  if(!$exact&&$fresh&&(strtotime($fresh['asOf']??'')?:0)>=(strtotime($t['coach']['asOf']??'')?:0)){$at=strtotime($fresh['asOf']??'')?:0;if($at&&$at<=$now->getTimestamp()&&$now->getTimestamp()-$at<86400){$t['coach']=$fresh;$t['coach']['basis']='current-club';$t['coach']['stale']=$now->getTimestamp()-$at>1800;}}
  if(!empty($t['coach'])){$at=strtotime($t['coach']['asOf']??'')?:0;$t['coach']['stale']=($t['coach']['stale']??false)||!$at||$now->getTimestamp()-$at>86400;$t['source']['coachBasis']=$t['coach'];}
  $t['source']['stale']=($t['source']['stale']??false)||$now->getTimestamp()-(strtotime($t['source']['asOf']??'')?:0)>21600;unset($t);
 }if(pp_lineup_trace()){$snapshot['sourceAttempts']=pp_lineup_trace();foreach($snapshot['teams']??[]as$i=>$team)if($team)$snapshot['teams'][$i]['source']['attempts']=pp_lineup_trace();}return $snapshot;
}
function pp_club_refresh_provider(array $m,array $teams,array $cfg,DateTimeImmutable $now,?callable $fetcher=null):array{
 $teams=pp_club_complete(['teams'=>$teams],$m,$cfg,$now,true,$fetcher)['teams']??$teams;
 if(!($cfg['mackolik_enabled']??false))return $teams;
 foreach(['home','away']as$i=>$side){$entry=pp_club_entry($m[$side]);$mk=$entry['mackolik']??null;if(!$mk)continue;try{$url='https://www.mackolik.com/takim/'.$mk['slug'].'/kadro/'.$mk['id'];$page=pp_mackolik_page($url,$cfg,$now,$fetcher);$coach=pp_mackolik_club_coach($page['html'],$mk,$page['fetchedAt'],$url);if($coach){pp_current_coach_save($m,$side,$coach,$cfg);if(!empty($teams[$i])&&($teams[$i]['source']['status']??'')!=='provider-lineup')$teams[$i]['coach']=$coach;}}catch(Throwable $e){pp_lineup_trace('Mackolik coach','unavailable',$e->getMessage());}}
 return $teams;
}
