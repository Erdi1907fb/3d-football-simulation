<?php
declare(strict_types=1);
/* Public pre-publication evidence. Every imported score is a completed normal-time
 * result; duplicates corroborate a match but never give it a second weight. */
function pp_ap_name(string $s):string{return pp_public_name($s);}
function pp_ap_json(string $url,array $cfg,DateTimeImmutable $now,int $ttl,?callable $fetcher=null):array {
 static $calls=0,$started=null;$started=$started??microtime(true);
 if(!preg_match('~^https://apivx\.misli\.com/api/web/v1/statistics/(?:sport/SOCCER/matches/old\?fromdate=\d{13}|sportType/SOCCER/match/\d{1,12}|match/\d{1,12}/performance)$~D',$url))throw new RuntimeException('Untrusted analysis endpoint');
 $file=rtrim($cfg['storage_dir'],'/').'/analysis-public-'.hash('sha256',$url).'.json';$old=pp_read($file);$at=strtotime($old['fetchedAt']??'')?:0;if($at&&$at<=$now->getTimestamp()&&$now->getTimestamp()-$at<$ttl)return $old;
 $budget=max(0,min(80,(int)($cfg['analysis_public_request_budget']??(($cfg['_web_mode']??false)?4:40))));$seconds=max(1,min(45,(float)($cfg['analysis_max_seconds']??45)));if(++$calls>$budget||microtime(true)-$started>=$seconds)throw new RuntimeException('Public analysis budget deferred');
 $net=$cfg;$net['source_hosts']=array_values(array_unique(array_merge($cfg['source_hosts']??[],['apivx.misli.com'])));$net['request_timeout_seconds']=max(1,min(4,(int)ceil($seconds-(microtime(true)-$started))));$net['max_download_bytes']=1500000;
 $doc=$fetcher?$fetcher($url,$net):pp_fetch($url,$net);if(!is_array($doc)||($doc['success']??false)!==true)throw new RuntimeException('Public analysis unavailable');$out=['document'=>$doc,'fetchedAt'=>$now->format(DATE_ATOM),'url'=>$url];pp_write($file,$out);return $out;
}
function pp_ap_misli_header(array $doc,array $event,array $m,DateTimeImmutable $now):?array {
 $d=$doc['data']??[];$kick=pp_analysis_time($m);if(($doc['success']??false)!==true||!$kick||$now->getTimestamp()>=$kick||($d['s']??'')!=='SCHEDULED'||($d['st']??'')!=='SOCCER'||(string)($d['sgi']??'')!==(string)($event['sgId']??'')||abs((float)($d['d']??0)/1000-$kick)>=61||(int)($d['to']['i']??0)!==(int)($event['tournament']['id']??0))return null;
 foreach(['home'=>'ht','away'=>'at']as$s=>$key)if(pp_ap_name($d[$key]['n']??'')!==pp_ap_name($m[$s]['name']??'')||!preg_match('/^\d{1,12}$/',(string)($d[$key]['i']??'')))return null;return $d;
}
function pp_ap_misli_rows(array $doc,array $header,array $m,DateTimeImmutable $now,string $url):array {
 $rows=[];$cut=min($now->getTimestamp(),pp_analysis_time($m)??$now->getTimestamp());
 foreach(['home'=>'ht','away'=>'at']as$side=>$slot){$teamId=(string)$header[$slot]['i'];foreach($doc['data'][$side.'Team']??[]as$g){
  $t=is_numeric($g['d']??null)?(int)floor((float)$g['d']/1000):0;if(($g['s']??'')!=='ENDED'||($g['st']??'')!=='SOCCER'||($g['abbr']??'')!=='MS'||!$t||$t+9000>=$cut||$cut-$t>550*86400)continue;
  $present=[];foreach(['ht','at']as$key)if((string)($g[$key]['i']??'')===$teamId&&pp_ap_name($g[$key]['n']??'')===pp_ap_name($m[$side]['name']))$present[]=$key;if(count($present)!==1)continue;
  $score=[];$good=true;foreach(['ht'=>'home','at'=>'away']as$key=>$s){$n=$g[$key]['s']['r']??null;if(!is_int($n)||$n<0||$n>30||!is_string($g[$key]['n']??null)||trim($g[$key]['n'])===''){$good=false;break;}$score[$s]=$n;}if(!$good||pp_ap_name($g['ht']['n'])===pp_ap_name($g['at']['n']))continue;
  $rows[]=['date'=>gmdate('Y-m-d',$t),'kickoff'=>gmdate(DATE_ATOM,$t),'home'=>pp_team($g['ht']['n']),'away'=>pp_team($g['at']['n']),'competitionId'=>'verified-public-history','season'=>'','result'=>$score,'source'=>['name'=>'Misli','url'=>$url,'capturedAt'=>$now->format(DATE_ATOM),'providerMatchId'=>(string)($g['i']??''),'scoreBasis'=>'regulation-ENDED-MS']];
 }}return $rows;
}
function pp_ap_collect_misli(array $m,array $cfg,DateTimeImmutable $now,?callable $fetcher=null):array {
 $kick=pp_analysis_time($m);if(!$kick)return ['rows'=>[],'status'=>'unavailable'];$base='https://apivx.misli.com/api/web/v1/statistics/';$day=strtotime(gmdate('Y-m-d',$kick).'T00:00:00Z');$index=pp_ap_json($base.'sport/SOCCER/matches/old?fromdate='.($day*1000),$cfg,$now,900,$fetcher);$e=pp_misli_event($index['document'],$m);if(!$e)return ['rows'=>[],'status'=>'fixture-not-matched'];$id=(string)$e['sgId'];$meta=pp_ap_json($base.'sportType/SOCCER/match/'.$id,$cfg,$now,180,$fetcher);$header=pp_ap_misli_header($meta['document'],$e,$m,$now);if(!$header)return ['rows'=>[],'status'=>'target-not-verified'];$perf=pp_ap_json($base.'match/'.$id.'/performance',$cfg,$now,3600,$fetcher);$rows=pp_ap_misli_rows($perf['document'],$header,$m,$now,$perf['url']);return ['rows'=>$rows,'status'=>$rows?'verified-completed-history':'no-verified-completed-history','url'=>$perf['url'],'asOf'=>$perf['fetchedAt']];
}
function pp_ap_key(array $r):?string {
 $t=pp_analysis_time($r);if(!$t)return null;$h=pp_ap_name($r['home']['name']??'');$a=pp_ap_name($r['away']['name']??'');if(!$h||!$a||$h===$a)return null;$day=(new DateTimeImmutable('@'.$t))->setTimezone(new DateTimeZone('Europe/Istanbul'))->format('Y-m-d');return $h.'|'.$a.'|'.$day;
}
function pp_ap_merge(array $history,array $remote,array $m,DateTimeImmutable $now):array {
 $cut=min($now->getTimestamp(),pp_analysis_time($m)??$now->getTimestamp());$local=[];$known=[];$added=[];$conflicts=[];$corroborated=[];
 foreach(array_merge([$m],$history)as$r)foreach(['home','away']as$s)if(!empty($r[$s]['name']))$known[pp_ap_name($r[$s]['name'])]=$r[$s];
 $valid=static function(array $r)use($cut):bool{$t=pp_analysis_time($r);$score=$r['result']??[];return $t&&$t<$cut&&$cut-$t<=550*86400&&(empty($r['kickoff'])||$t+9000<$cut)&&isset($score['home'],$score['away'])&&is_numeric($score['home'])&&is_numeric($score['away'])&&min($score)>=0&&max($score)<=30;};
 foreach($history as$r)if($valid($r)&&($k=pp_ap_key($r)))$local[$k]=$r;
 foreach($remote as$r){if(!$valid($r)||!($key=pp_ap_key($r)))continue;$provider=$r['source']['name']??'';if(!in_array($provider,['Misli','Mackolik','Nesine'],true))continue;foreach(['home','away']as$s){$n=pp_ap_name($r[$s]['name']);$r[$s]=$known[$n]??$r[$s];}$score=array_map('intval',$r['result']);
  if(isset($local[$key])){if(array_map('intval',$local[$key]['result'])!==$score)$conflicts[$key]=true;else$corroborated[$provider][$key]=true;continue;}
  if(isset($conflicts[$key]))continue;if(isset($added[$key])){if(array_map('intval',$added[$key]['result'])!==$score){unset($added[$key]);$conflicts[$key]=true;}else{$added[$key]['evidenceSources']=array_values(array_unique(array_merge($added[$key]['evidenceSources'],[$provider])));}}else{$r['evidenceSources']=[$provider];$added[$key]=$r;}
 }
 $counts=[];foreach($added as$r)foreach($r['evidenceSources']as$name)$counts[$name]=($counts[$name]??0)+1;return ['history'=>array_merge($history,array_values($added)),'added'=>count($added),'sourcesAdded'=>$counts,'conflictsIgnored'=>count($conflicts),'corroborated'=>array_map('count',$corroborated)];
}
function pp_analysis_external_history(array $m,array $history,array $cfg,DateTimeImmutable $now,?callable $fetcher=null):array {
 $out=['history'=>$history,'added'=>0,'sourcesAdded'=>[],'conflictsIgnored'=>0,'corroborated'=>[],'providers'=>[],'sources'=>[]];$kick=pp_analysis_time($m);if(!$kick||$kick<=$now->getTimestamp()||($m['date']??'')<'2026-10-24'||!($cfg['analysis_enabled']??true)||!($cfg['analysis_network_enabled']??true)||($cfg['_publish_only']??false))return $out;
 $rows=[];foreach(['Misli'=>'pp_ap_collect_misli','Mackolik'=>'pp_ap_collect_mackolik','Nesine'=>'pp_ap_collect_nesine']as$name=>$fn){if(!function_exists($fn)){$out['providers'][$name]=['status'=>'adapter-unavailable','usedInModel'=>false];continue;}try{$data=$fn($m,$cfg,$now,$fetcher);$out['providers'][$name]=['status'=>$data['status'],'observedMatches'=>count($data['rows']),'usedInModel'=>false];$rows=array_merge($rows,$data['rows']);if(!empty($data['url']))$out['sources'][]=['name'=>$name.' verified completed results','url'=>$data['url'],'asOf'=>$data['asOf']??$now->format(DATE_ATOM)];}catch(Throwable $e){$out['providers'][$name]=['status'=>'unavailable-or-budget-deferred','usedInModel'=>false];}}
 $merged=pp_ap_merge($history,$rows,$m,$now);foreach($merged['sourcesAdded']as$name=>$count){$out['providers'][$name]['usedInModel']=true;$out['providers'][$name]['newUniqueMatches']=$count;}return array_merge($out,$merged);
}

/* Mackolik form rows are discovery only. Scores enter the model only after the
 * dated public fixture feed confirms the same ID, teams and normal-time result. */
function pp_ap_mackolik_day_rows(array $doc,array $event,array $m,DateTimeImmutable $now,string $url):array {
 $out=[];$cut=min($now->getTimestamp(),pp_analysis_time($m)??$now->getTimestamp());
 foreach($doc['data']['matches']??[]as$g){$t=(int)floor((float)($g['mstUtc']??0)/1000);if(($g['state']??'')!=='post'||($g['substate']??'')!=='fullTime'||($g['statusBoxContent']??'')!=='MS'||!$t||$t+9000>=$cut||$cut-$t>550*86400||!empty($g['score']['pen']))continue;
  $matched=false;foreach(['home','away']as$s)foreach(['home','away']as$target)if(($g[$s.'Team']['id']??'')===($event[$target.'Team']['id']??null)&&pp_mackolik_name($g[$s.'Team']['name']??'')===pp_mackolik_name($m[$target]['name']??''))$matched=true;if(!$matched)continue;
  $r=[];foreach(['home','away']as$s){$v=$g['score'][$s]??null;if(!is_scalar($v)||!preg_match('/^\d{1,2}$/D',(string)$v)||(int)$v>30||empty($g[$s.'Team']['name']))continue 2;$r[$s]=(int)$v;}
  $out[]=['date'=>(new DateTimeImmutable('@'.$t))->setTimezone(new DateTimeZone('Europe/Istanbul'))->format('Y-m-d'),'kickoff'=>gmdate(DATE_ATOM,$t),'home'=>pp_team($g['homeTeam']['name']),'away'=>pp_team($g['awayTeam']['name']),'competitionId'=>'verified-public-history','season'=>'','result'=>$r,'source'=>['name'=>'Mackolik','url'=>$url,'capturedAt'=>$now->format(DATE_ATOM),'providerMatchId'=>$g['id'],'scoreBasis'=>'normal-time-post-fullTime-MS']];
 }return $out;
}
function pp_ap_collect_mackolik(array $m,array $cfg,DateTimeImmutable $now,?callable $fetcher=null):array {
 $kick=pp_analysis_time($m);$day=(new DateTimeImmutable('@'.$kick))->setTimezone(new DateTimeZone('Europe/Istanbul'))->format('Y-m-d');
 $cfg['mackolik_request_budget']=$cfg['mackolik_request_budget']??(($cfg['_web_mode']??false)?4:12);$cfg['mackolik_max_seconds']=20;
 $index=pp_mackolik_page(pp_mackolik_day_url($day),$cfg,$now,$fetcher);$event=pp_mackolik_event($index['document'],$m);if(!$event)return ['rows'=>[],'status'=>'fixture-not-matched'];
 $page=pp_mackolik_page(pp_mackolik_match_url($event,true),$cfg,$now,$fetcher);if(!pp_mackolik_header_ok($page['html'],$event))return ['rows'=>[],'status'=>'target-not-verified'];$settings=pp_mackolik_settings($page['html'],'perform/p0/components/match/previous-games');if(($settings['asyncRequestParams']['matchId']??'')!==$event['id'])return ['rows'=>[],'status'=>'no-form-widget'];
 $start=strpos($page['html'],'data-module="perform/p0/components/match/previous-games"');$section=substr($page['html'],$start);preg_match_all('~p0c-match-head-to-head__last-games--date"[^>]*>\s*(\d{2}/\d{2}/\d{2})\s*<~',$section,$dates);$days=[];foreach($dates[1]as$d){$dt=DateTimeImmutable::createFromFormat('!d/m/y',$d,new DateTimeZone('Europe/Istanbul'));if($dt&&$dt->format('d/m/y')===$d&&$dt->getTimestamp()+86400<$now->getTimestamp()&&$now->getTimestamp()-$dt->getTimestamp()<550*86400)$days[$dt->format('Y-m-d')]=true;}krsort($days);$rows=[];$observed=0;
 foreach(array_slice(array_keys($days),0,10)as$d){try{$url=pp_mackolik_day_url($d);$capture=pp_mackolik_page($url,$cfg,$now,$fetcher);$rows=array_merge($rows,pp_ap_mackolik_day_rows($capture['document'],$event,$m,$now,$url));$observed++;}catch(Throwable $e){break;}}
 return ['rows'=>$rows,'status'=>$rows?'verified-completed-history':($observed?'no-verified-completed-history':'unavailable-or-budget-deferred'),'url'=>$page['url'],'asOf'=>$page['fetchedAt']];
}
