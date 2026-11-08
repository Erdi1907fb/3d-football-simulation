<?php
declare(strict_types=1);
// Small cached monthly feeds. Date ranges are not supported by this soccer endpoint.
function pp_live_jobs(array $cfg,DateTimeImmutable $now):array {
 if(!($cfg['live_sources_enabled']??false))return [];
 $codes=['tr.1'=>'tur.1','en.1'=>'eng.1','de.1'=>'ger.1','it.1'=>'ita.1','es.1'=>'esp.1','fr.1'=>'fra.1','ucl'=>'uefa.champions','uel'=>'uefa.europa','uecl'=>'uefa.europa.conf','unl'=>'uefa.nations','intl'=>'fifa.friendly'];
 $names=['ucl'=>'Şampiyonlar Ligi','uel'=>'Avrupa Ligi','uecl'=>'Konferans Ligi','unl'=>'UEFA Uluslar Ligi','intl'=>'Uluslararası Hazırlık Maçı'];$jobs=[];
 $local=$now->setTimezone(new DateTimeZone('Europe/Istanbul'));$months=[$local->format('Ym')];foreach([$local->setTime(0,0)->setTimezone(new DateTimeZone('UTC'))->format('Ym'),$local->modify('+5 days')->setTime(23,59)->setTimezone(new DateTimeZone('UTC'))->format('Ym')]as$month)if(!in_array($month,$months,true))$months[]=$month;
 foreach($months as$i=>$month)foreach($codes as$league=>$code){
  if(!isset($cfg['leagues'][$league])&&!($cfg[$league.'_enabled']??false))continue;
  $key=($i?'live-next/':'live/').$league;$year=(int)substr($month,0,4)-((int)substr($month,4,2)<7?1:0);
  $jobs[$key]=['key'=>$key,'url'=>'https://site.api.espn.com/apis/site/v2/sports/soccer/'.$code.'/scoreboard?dates='.$month.'&limit=1000','format'=>'espn-month','league'=>$league,'code'=>$code,'month'=>$month,'season'=>$year.'-'.substr((string)($year+1),-2),'meta'=>['name'=>$cfg['leagues'][$league]['name']??$names[$league],'timezone'=>'UTC'],'current'=>true,'interval'=>1800];
 }
 if(isset($cfg['leagues']['tr.1']))$jobs['tff/tr.1']=['key'=>'tff/tr.1','url'=>'https://www.tff.org/default.aspx?pageID=198','format'=>'tff-week','league'=>'tr.1','meta'=>['name'=>'Süper Lig · TFF','timezone'=>'Europe/Istanbul'],'current'=>true,'interval'=>1800];
 return $jobs;
}
// V124 national-team competitions: only nations in assets/national-teams.json; friendlies need at least one major nation.
function pp_national_allowed(string $league,string $home,string $away):bool{static $n=null;if($n===null)$n=pp_read(__DIR__.'/../assets/national-teams.json');if(!in_array($league,['unl','intl'],true))return true;$list=$n[$league]??[];if(!in_array($home,$list,true)||!in_array($away,$list,true))return false;if($league==='unl')return true;$s=$n['strength']??[];return max((int)($s[$home]??0),(int)($s[$away]??0))>=72;}
function pp_provider_name(string $name):string {static $a=null;if($a===null)$a=pp_read(__DIR__.'/../assets/provider-team-aliases.json');return $a[$name]??pp_team($name)['name'];}
function pp_espn_month(array $doc,array $job):array {
 if(($doc['leagues'][0]['slug']??'')!==$job['code']||!isset($doc['events'])||!is_array($doc['events'])||count($doc['events'])>=1000)throw new RuntimeException('Wrong or truncated live competition feed');
 $out=[];$ids=[];
 foreach($doc['events']as$e){
  $id=(string)($e['id']??'');$c=$e['competitions'][0]??[];$stamp=$c['date']??$e['date']??'';
  if(!preg_match('/^\d+$/',$id)||isset($ids[$id])||!preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?Z$/',$stamp))throw new RuntimeException('Invalid live event identity or UTC date');
  // Monthly feeds may retain a fixture rescheduled across the month boundary.
  $monthStart=DateTimeImmutable::createFromFormat('!Ym',$job['month'],new DateTimeZone('UTC'));$eventTime=new DateTimeImmutable($stamp);if(!$monthStart||$eventTime<$monthStart->modify('-7 days')||$eventTime>=$monthStart->modify('+1 month')->modify('+14 days'))throw new RuntimeException('Live event outside adjacent schedule boundary');
  $dt=new DateTimeImmutable($stamp);$sides=[];foreach($c['competitors']??[]as$t)if(in_array($t['homeAway']??'',['home','away'],true))$sides[$t['homeAway']]=$t;
  if(count($sides)!==2)throw new RuntimeException('Live event missing teams');
  if(!pp_national_allowed($job['league'],pp_provider_name($sides['home']['team']['displayName']??''),pp_provider_name($sides['away']['team']['displayName']??'')))continue;
  $row=['date'=>$dt->format('Y-m-d'),'time'=>$dt->format('H:i'),'team1'=>pp_provider_name($sides['home']['team']['displayName']??''),'team2'=>pp_provider_name($sides['away']['team']['displayName']??''),'round'=>'ESPN '.$id,'neutral'=>($c['neutralSite']??false)===true];
  $status=$c['status']['type']??$e['status']['type']??[];
  // Only explicit FT includes a regulation-time result. AET/PEN never substitute for90min.
  if(($status['completed']??false)===true&&($status['name']??'')==='STATUS_FULL_TIME'){
   $h=$sides['home']['score']??null;$a=$sides['away']['score']??null;
   if(!is_scalar($h)||!is_scalar($a)||!preg_match('/^\d+$/',(string)$h)||!preg_match('/^\d+$/',(string)$a))throw new RuntimeException('Invalid completed live score');
   $row['score']=['ft'=>[(int)$h,(int)$a]];
  }
  $rows=pp_normalize(['matches'=>[$row]],$job['league'],$job['season'],$job['meta'],$job['url']);if(count($rows)!==1)throw new RuntimeException('Invalid live fixture');$m=$rows[0];
  $m['id']=substr(hash('sha256','espn|'.$job['league'].'|'.$id),0,24);$m['providerMatchId']=$id;$m['espnEventId']=$id;foreach(['home','away']as$side)if(isset($sides[$side]['team']['id']))$m[$side]['espnId']=(string)$sides[$side]['team']['id'];$m['source']=['name'=>'ESPN','url'=>$job['url'],'providerMatchId'=>$id,'license'=>'provider-terms'];if(!empty($job['observedAt'])&&($status['state']??'')==='pre'&&!empty($c['odds'])){try{$observed=new DateTimeImmutable($job['observedAt']);$marketOdds=$c['odds'];foreach($marketOdds as&$price){if(!isset($price['homeTeamOdds'])&&isset($price['moneyline'])){$money=$price['moneyline'];$converted=[];$valid=true;foreach(['home','draw','away']as$side){$v=$money[$side]['close']??null;if(!is_array($v)||!isset($v['odds'])){$valid=false;break;}$tracking=$v['link']['tracking']['tags']??[];if(isset($tracking['gameId'])&&(string)$tracking['gameId']!==$id){$valid=false;break;}if(isset($tracking['betSide'])&&$tracking['betSide']!==$side){$valid=false;break;}$converted[$side]=$v['odds'];}if($valid){$price['homeTeamOdds']=['team'=>['id'=>(string)($sides['home']['team']['id']??'')],'moneyLine'=>$converted['home']];$price['awayTeamOdds']=['team'=>['id'=>(string)($sides['away']['team']['id']??'')],'moneyLine'=>$converted['away']];$price['drawOdds']=['moneyLine'=>$converted['draw']];}}}unset($price);$marketDoc=['header'=>['id'=>$id,'competitions'=>[$c]],'odds'=>$marketOdds];$extra=pp_analysis_summary($marketDoc,$m,$observed);if($extra['marketOdds'])$m['marketSnapshot']=['odds'=>$extra['marketOdds'],'provider'=>$extra['marketProvider'],'capturedAt'=>$observed->format(DATE_ATOM),'eventId'=>$id];}catch(Throwable $e){}}$m['providerStatus']=$status['name']??'unknown';$m['scheduleProvisional']=!($c['timeValid']??true);$out[]=$m;$ids[$id]=true;
 }
 $calendar=in_array($job['league'],['unl','intl'],true)?[]:($doc['leagues'][0]['calendar']??[]);foreach($calendar as$day)if(is_string($day)&&substr(str_replace('-','',$day),0,6)===$job['month']){
  $found=false;foreach($out as$m)if(substr($m['kickoff'],0,10)===substr($day,0,10)){$found=true;break;}if(!$found)throw new RuntimeException('Live calendar day missing all events; previous cache retained');
 }
 return $out;
}
function pp_tff_week(string $raw,array $job):array {
 if(!preg_match('//u',$raw))$raw=iconv('Windows-1254','UTF-8//IGNORE',$raw);
 if(!preg_match('/Süper Lig\s+(20\d{2})-(20\d{2})\s+Sezonu/u',strip_tags($raw),$year))throw new RuntimeException('TFF season header missing');
 $season=$year[1].'-'.substr($year[2],-2);preg_match_all('/<tr\s+class="haftaninMaclariTr"[^>]*>(.*?)<\/tr>/su',$raw,$blocks);$out=[];$ids=[];
 foreach($blocks[1]as$b){
  $span=function($suffix)use($b){preg_match('/<span[^>]*id="[^"]*_'.$suffix.'"[^>]*>(.*?)<\/span>/su',$b,$m);return trim(html_entity_decode(strip_tags($m[1]??''),ENT_QUOTES|ENT_HTML5,'UTF-8'));};
  $date=$span('lblTarih');$time=$span('lblSaat');$home=pp_provider_name($span('Label4'));$away=pp_provider_name($span('Label1'));
  if(!preg_match('/^(\d{2})\.(\d{2})\.(\d{4})$/',$date,$d)||!preg_match('/macId=(\d+)/i',$b,$id)||isset($ids[$id[1]]))throw new RuntimeException('Invalid TFF fixture');
  $row=['date'=>$d[3].'-'.$d[2].'-'.$d[1],'time'=>$time,'team1'=>$home,'team2'=>$away,'round'=>'TFF '.$id[1]];$r=pp_normalize(['matches'=>[$row]],'tr.1',$season,['name'=>'Süper Lig','timezone'=>'Europe/Istanbul'],$job['url']);if(count($r)!==1)throw new RuntimeException('Invalid TFF row');$m=$r[0];$m['id']=substr(hash('sha256','tff|'.$id[1]),0,24);$m['providerMatchId']=$id[1];$m['source']=['name'=>'TFF','url'=>$job['url'],'providerMatchId'=>$id[1],'license'=>'provider-terms'];$out[]=$m;$ids[$id[1]]=true;
 }
 if(count($out)!==9)throw new RuntimeException('TFF week must contain nine distinct fixtures');return $out;
}
function pp_fixture_identity(array $m):string {return ($m['season']??'').'|'.$m['competitionId'].'|'.pp_club_key($m['home']).'|'.pp_club_key($m['away']);}
function pp_overlay_live(array $all,array $sources,array $jobs,array $checks):array {
 $byPair=[];foreach($all as$id=>$m)$byPair[pp_fixture_identity($m)][]=$id;
 // Explicit provider job order: ESPN monthly first, official TFF schedule last.
 foreach($jobs as$key=>$job){if(!in_array($job['format'],['espn-month','tff-week'],true)||!isset($sources[$key]))continue;
  foreach($sources[$key]['matches']as$m){$identity=pp_fixture_identity($m);$candidates=$byPair[$identity]??[];$id=count($candidates)===1?$candidates[0]:$m['id'];
   if(count($candidates)>1){$nearest=null;$gap=PHP_INT_MAX;foreach($candidates as$c){$g=abs(strtotime($all[$c]['date'])-strtotime($m['date']));if($g<$gap){$nearest=$c;$gap=$g;}}if($gap<28*86400)$id=$nearest;}
   $m['id']=$id;$m['source']['fetchedAt']=$sources[$key]['fetchedAt'];$m['source']['cached']=!in_array($checks[$key]['status']??'',['ok','recent'],true);
   if($job['format']==='tff-week'&&isset($all[$id])){if(isset($all[$id]['espnEventId']))$m['espnEventId']=$all[$id]['espnEventId'];foreach(['home','away']as$side)if(isset($all[$id][$side]['espnId']))$m[$side]['espnId']=$all[$id][$side]['espnId'];if(isset($all[$id]['marketSnapshot']))$m['marketSnapshot']=$all[$id]['marketSnapshot'];$m['result']=$all[$id]['result'];$m['resultSource']=$all[$id]['resultSource']??$all[$id]['source'];}
   $all[$id]=$m;if(!in_array($id,$byPair[$identity]??[],true))$byPair[$identity][]=$id;
  }
 }
 return $all;
}
