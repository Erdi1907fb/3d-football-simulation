<?php
declare(strict_types=1);
function s3_window(DateTimeImmutable $now):array {$today=$now->setTimezone(new DateTimeZone('Europe/Istanbul'))->format('Y-m-d');return array_map(fn($i)=>(new DateTimeImmutable($today,new DateTimeZone('Europe/Istanbul')))->modify('+'.$i.' days')->format('Y-m-d'),range(0,5));}
function s3_team(array $t):array{return array_intersect_key($t,array_flip(['id','name','strength','attack','defense','espnId']));}
function s3_fixture(array $m,array $state):array{return ['id'=>$m['id'],'date'=>$m['date'],'kickoff'=>$m['kickoff']??null,'competition'=>$m['competition'],'competitionId'=>$m['competitionId'],'home'=>s3_team($m['home']),'away'=>s3_team($m['away']),'neutral'=>$m['neutral']??false,'timeConfirmed'=>$m['timeConfirmed']??false,'predictionAvailable'=>isset($state['predictions'][$m['id']]),'forecastStatus'=>isset($state['predictions'][$m['id']])?'ready':(!empty($m['result'])?'unavailable-after-kickoff':'preparing'),'result'=>$m['result']??null,'comparison'=>!empty($m['result'])&&isset($state['predictions'][$m['id']])?s3_comparison($state['predictions'][$m['id']],$m['result']):null,'source'=>array_intersect_key($m['source']??[],array_flip(['name','fetchedAt','cached']))];}
function s3_bulletin(array $state,array $cfg,DateTimeImmutable $now):array {
 $dates=s3_window($now);[$today,$tomorrow]=$dates;$matches=[];$big=[];
 foreach($state['matches']??[]as$m){if(!in_array($m['source']['name']??'',['ESPN','TFF','BSD'],true)||pp_big_cancelled($m))continue;if(in_array($m['date'],$dates,true))$matches[]=s3_fixture($m,$state);$info=pp_big_match_info($m);if($info&&pp_in_publication_window($m,$now)&&empty($m['result'])&&pp_fixture_status($m,$now)==='scheduled')$big[]=array_merge(s3_fixture($m,$state),['bigMatch'=>$info,'releaseAt'=>pp_release_time($m)]);}
 usort($big,fn($a,$b)=>strcmp($a['kickoff']??($a['date'].'T23:59'),$b['kickoff']??($b['date'].'T23:59')));
 usort($matches,fn($a,$b)=>strcmp($a['kickoff']??($a['date'].'T23:59'),$b['kickoff']??($b['date'].'T23:59')));
 return ['serverNow'=>$now->format(DATE_ATOM),'today'=>$today,'tomorrow'=>$tomorrow,'dates'=>$dates,'windowEnd'=>$dates[5],'aheadDays'=>5,'pendingForecasts'=>pp_pending_forecasts($state,$now),'timezone'=>'Europe/Istanbul','generatedAt'=>$state['generatedAt']??null,'matches'=>$matches,'bigMatches'=>$big,'bigMatchAheadDays'=>5,'coverage'=>pp_public_health($state,$cfg,$now)['liveCoverage']??[],'todayReport'=>s3_report($state,$now,$today),'pollAfterSeconds'=>300];
}
function s3_replay(array $state,string $id,DateTimeImmutable $now):?array {
 $p=$state['predictions'][$id]??null;if(!$p||!pp_released($p,$now))return null;
 $score=$p['publishedScore']??$p['mostLikelyScore']??null;if(!is_array($score)||!isset($score['home'],$score['away']))return null;
 $distribution=pp_distribution((float)$p['expectedGoals']['home'],(float)$p['expectedGoals']['away']);
 return ['fixture'=>s3_fixture($p,$state),'seed'=>$p['seed'],'targetScore'=>[(int)$score['home'],(int)$score['away']],'expectedGoals'=>$p['expectedGoals'],'home'=>$p['home'],'away'=>$p['away'],'goalProbabilities'=>array_intersect_key(array_replace(pp_distribution((float)$p['expectedGoals']['home'],(float)$p['expectedGoals']['away'])['probabilities'],$p['probabilities']??[]),array_flip(['over25','over35','over45','over55','btts'])),'scoreSelection'=>$p['scoreSelection']??($score==$distribution['mostLikelyScore']?$distribution['scoreSelection']:null),'outlook'=>s3_outlook($distribution),'quality'=>$p['quality']??null,'analysis'=>$p['analysis']??null,'publishedAt'=>$p['createdAt'],'mode'=>'official','animationProfile'=>$p['animationProfile']??'classic'];
}
function s3_outlook(array $distribution):array {
 $goals=$distribution['goalDistribution'];$sum=0.;$low=0;$high=count($goals)-1;$lower=false;
 foreach($goals as$n=>$v){$sum+=$v;if(!$lower&&$sum>=.10){$low=$n;$lower=true;}if($sum>=.90){$high=$n;break;}}
 $p=$distribution['probabilities'];$favorite=abs($p['home']-$p['away'])<.03?'balanced':($p['home']>$p['away']?'home':'away');
 return ['totalGoalsInterval'=>['low'=>$low,'high'=>$high,'mass'=>array_sum(array_slice($goals,$low,$high-$low+1))],'favorite'=>$favorite,'underdogWinProbability'=>$favorite==='balanced'?null:min($p['home'],$p['away']),'note'=>'Model-weighted uncertainty, not guaranteed outcomes or a forced surprise.'];
}
function s3_comparison(array $p,array $r):?array {
 $s=$p['publishedScore']??$p['mostLikelyScore']??null;if(!$s)return null;
 $h=(int)$s['home'];$a=(int)$s['away'];$rh=(int)$r['home'];$ra=(int)$r['away'];$deviation=abs($h-$rh)+abs($a-$ra);
 return ['prediction'=>[$h,$a],'result'=>[$rh,$ra],'exact'=>$deviation===0,'outcome'=>($h<=>$a)===($rh<=>$ra),'near'=>$deviation<=1,'deviation'=>$deviation,'goalDifferenceError'=>abs(($h-$a)-($rh-$ra))];
}
function s3_report(array $state,DateTimeImmutable $now,?string $reportDate=null):array {
 [$today]=s3_window($now);$date=$reportDate??(new DateTimeImmutable($today))->modify('-1 day')->format('Y-m-d');$rows=[];$exact=0;$outcome=0;$near=0;$settled=0;$sumError=0;
 foreach($state['predictions']??[]as$p)if($p['date']===$date){$score=$p['publishedScore']??$p['mostLikelyScore']??null;if(!$score)continue;$r=$p['result']??null;
 // Hide the shared ending of today's unplayed matches.
 if($date===$today&&!$r)continue;
 $comparison=$r?s3_comparison($p,$r):null;
 if($comparison){$settled++;$exact+=(int)$comparison['exact'];$outcome+=(int)$comparison['outcome'];$near+=(int)($comparison['near']&&!$comparison['exact']);$sumError+=$comparison['deviation'];}
 $rows[]=array_merge(['id'=>$p['id'],'home'=>$p['home']['name'],'away'=>$p['away']['name'],'prediction'=>[(int)$score['home'],(int)$score['away']],'result'=>null,'exact'=>null,'outcome'=>null,'near'=>null,'deviation'=>null,'goalDifferenceError'=>null],$comparison??[]);}
 return ['date'=>$date,'finalized'=>$date<$today&&(int)$now->setTimezone(new DateTimeZone('Europe/Istanbul'))->format('G')>=6&&$settled===count($rows),'rows'=>$rows,'total'=>count($rows),'settled'=>$settled,'exact'=>$exact,'outcome'=>$outcome,'near'=>$near,'meanScoreError'=>$settled?round($sumError/$settled,2):null,'outcomeRate'=>$settled?round(100*$outcome/$settled,1):null,'exactRate'=>$settled?round(100*$exact/$settled,1):null];
}
