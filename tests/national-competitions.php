<?php
// V124 UEFA Nations League + international friendlies: ESPN monthly feeds -> normalised bulletin fixtures.
// php tests/national-competitions.php  (offline: uses trimmed ESPN snapshots in tests/fixtures)
declare(strict_types=1);
require __DIR__.'/../server/lib.php';
require_once __DIR__.'/../server/live-sources.php';
require_once __DIR__.'/../server/player-lineups.php';
require_once __DIR__.'/../server/bench-policy.php';
require_once __DIR__.'/../server/national-squads.php';
$fail=0;$check=function(bool $ok,string $what)use(&$fail){if(!$ok){$fail++;fwrite(STDERR,"FAIL: $what\n");}};
$cfg=pp_config();$now=new DateTimeImmutable('2026-11-08 18:00:00',new DateTimeZone('Europe/Istanbul'));
$jobs=pp_live_jobs(['live_sources_enabled'=>true,'leagues'=>[],'unl_enabled'=>true,'intl_enabled'=>true],$now);
$check(isset($jobs['live/unl'])&&str_contains($jobs['live/unl']['url'],'uefa.nations'),'Nations League monthly ESPN job');
$check(isset($jobs['live/intl'])&&str_contains($jobs['live/intl']['url'],'fifa.friendly'),'friendlies monthly ESPN job');
$national=json_decode((string)file_get_contents(__DIR__.'/../assets/national-teams.json'),true);
$out=[];
foreach(['unl','intl'] as $league){
 $doc=json_decode((string)file_get_contents(__DIR__."/fixtures/espn-$league-202611.json"),true);
 $job=$jobs["live/$league"];$job['month']='202611';
 $rows=pp_espn_month($doc,$job);$out[$league]=$rows;
 $check(count($rows)>0,"$league produced fixtures");
 foreach($rows as $m){
  $check($m['competitionId']===$league,"$league competition id");
  $check(in_array($m['home']['name'],$national[$league],true)&&in_array($m['away']['name'],$national[$league],true),"$league teams are catalogue nations: {$m['home']['name']} v {$m['away']['name']}");
  $check(!empty($m['espnEventId'])&&!empty($m['home']['espnId'])&&!empty($m['away']['espnId']),"$league keeps ESPN ids for lineups");
 }
}
$names=array_map(fn($m)=>$m['home']['name'].' v '.$m['away']['name'],$out['unl']);
$check(in_array('Türkiye v Belgium',$names,true),'Türkiye v Belgium present (ESPN "Belgium at Türkiye")');
$check(in_array('Italia v France',$names,true),'Italy mapped to catalogue name Italia');
$check(count($out['unl'])===52,'all 52 November Nations League fixtures kept, got '.count($out['unl']));
$check(count($out['intl'])<41&&count($out['intl'])>=3,'friendlies filtered to major nations, got '.count($out['intl']));
foreach($out['intl'] as $m){$s=$national['strength'];$check(max($s[$m['home']['name']]??0,$s[$m['away']['name']]??0)>=72,'friendly involves a major nation');}
$check(pp_players_code(['competitionId'=>'unl'])==='uefa.nations'&&pp_players_code(['competitionId'=>'intl'])==='fifa.friendly','lineup provider codes');
$codes=pp_players_team_codes(['competitionId'=>'unl','home'=>['espnId'=>'465']],'home',$cfg+['storage_dir'=>sys_get_temp_dir()]);
$check($codes[0]==='uefa.nations'&&in_array('fifa.friendly',$codes,true),'national recent-XI codes: '.implode(',',$codes));
$check(pp_bench_limit('unl')===12&&pp_bench_limit('intl')===15,'bench limits');
// V125 call-ups: Türkiye's estimated XI comes from the last Nations League start but İrfan Can Kahveci, Kerem and
// Altay were not called up for November -> replaced by called-up players of the same group; coach from the call-up.
$fx=json_decode((string)file_get_contents(__DIR__.'/fixtures/espn-turkiye-202611.json'),true);
$tmp=sys_get_temp_dir().'/n90-callup-'.getmypid();@mkdir($tmp);
$fetch=function(string $url)use($fx){if(str_contains($url,'/roster'))return $fx['roster'];if(str_contains($url,'/schedule'))return $fx['schedule'];if(str_contains($url,'/summary'))return $fx['summary'];throw new RuntimeException('unexpected '.$url);};
$match=['competitionId'=>'unl','date'=>'2026-11-12','kickoff'=>'2026-11-12T19:45:00+03:00','home'=>['name'=>'Türkiye','espnId'=>'465'],'away'=>['name'=>'Belgium','espnId'=>'459']];
$xi=pp_players_recent($match,'home','uefa.nations',['storage_dir'=>$tmp,'players_request_budget'=>20]+$cfg,new DateTimeImmutable('2026-11-10T12:00:00Z'),$fetch);
$check(is_array($xi)&&count($xi['players']??[])===11,'Türkiye estimated XI built');
$squad=array_map(fn($p)=>pp_public_name($p['name']),array_merge($xi['players']??[],$xi['bench']??[]));
$call=array_map('pp_public_name',json_decode((string)file_get_contents(__DIR__.'/../assets/national-callups.json'),true)['teams']['465']['players']);
foreach($squad as $n)$check(in_array($n,$call,true),"only called-up players in squad: $n");
$check(!in_array(pp_public_name('Irfan Can Kahveci'),$squad,true),'İrfan Can Kahveci not in the November squad');
$check(($xi['coach']['name']??'')==='Sergen Yalçın','coach from federation call-up');
$check(count(array_unique(array_map(fn($p)=>$p['id'],$xi['players'])))===11,'no duplicate starters');
// V131: national fixtures get a forecast (Sep/Oct internationals as history + squad-strength prior).
$check(isset($jobs['live-prev1/unl'])&&isset($jobs['live-prev2/intl']),'previous-month national jobs');
$hist=[];foreach(['unl','intl'] as $lg)foreach(['202609','202610','202611'] as $mon){$doc=json_decode((string)file_get_contents(__DIR__."/fixtures/espn-$lg-$mon.json"),true);$job=$jobs["live/$lg"];$job['month']=$mon;foreach(pp_espn_month($doc,$job) as $row)$hist[]=$row;}
$done=count(array_filter($hist,fn($m)=>!empty($m['result'])));$check($done>=80,'played internationals as history: '.$done);
$tb=null;foreach($hist as $m)if($m['home']['name']==='Türkiye'&&$m['away']['name']==='Belgium'&&!$m['result'])$tb=$m;$check($tb!==null,'Türkiye v Belgium fixture');
$clock=new DateTimeImmutable('2026-11-10T12:00:00+03:00');$check(pp_history_ready($tb,$hist,$clock),'national match ready to forecast');
$pred=pp_build_prediction($tb,$hist,$clock);$xg=$pred['expectedGoals'];
$check($xg['home']>.4&&$xg['home']<3.2&&$xg['away']>.4&&$xg['away']<3.2,'plausible xG '.json_encode($xg));
$check(isset($pred['publishedScore']['home'],$pred['publishedScore']['away'])&&isset($pred['quality']['inputs']['nationalModel']),'published score + strength prior');
$es=null;foreach($hist as $m)if(!$m['result']&&in_array('Spain',[$m['home']['name'],$m['away']['name']],true)&&in_array('Czechia',[$m['home']['name'],$m['away']['name']],true))$es=$m;
if($es){$pe=pp_build_prediction($es,$hist,$clock);$sp=$es['home']['name']==='Spain'?'home':'away';$cz=$sp==='home'?'away':'home';$check($pe['expectedGoals'][$sp]>$pe['expectedGoals'][$cz],'Spain favoured over Czechia');}
// V132 national ratings: tournament-weighted Elo + titles + squad.
$nr=json_decode((string)file_get_contents(__DIR__.'/../assets/national-ratings.json'),true);
$check(($nr['matches']??0)>=1000&&count($nr['teams'])>=80,'national ratings built from competitive history');
$check(($nr['teams']['Spain']['rank']??99)<=5&&($nr['teams']['San Marino']['rank']??0)>60,'ratings order (Spain top-5, San Marino near bottom)');
$check(!empty($nr['teams']['Argentina']['titles']),'title history recorded');
$sample=[];foreach($hist as $m)if(!$m['result']&&$m['competitionId']==='unl'&&count($sample)<6){$pp=pp_build_prediction($m,$hist,$clock);$sample[]=$m['home']['name'].' '.round($pp['expectedGoals']['home'],2).'-'.round($pp['expectedGoals']['away'],2).' '.$m['away']['name'];}
foreach($hist as $m)if(!$m['result']&&$m['home']['name']==='England'&&$m['away']['name']==='Croatia'){$pp=pp_build_prediction($m,$hist,$clock);$check($pp['expectedGoals']['home']>$pp['expectedGoals']['away'],'England favoured at home to Croatia');}
// V134 self-updating ratings: PHP recompute == Python seed; a new result moves ratings and the next forecast;
// a forecast published before a team's earlier international is provisional until that match is played.
$seed=json_decode((string)file_get_contents(__DIR__.'/../assets/national-ratings.json'),true);$t0=new DateTimeImmutable($seed['asOf'].'T12:00:00+00:00');
$re=pp_nr_compute($seed['games'],$seed,$t0);$maxDiff=0;foreach($seed['teams'] as $n=>$t)$maxDiff=max($maxDiff,abs($t['elo']-$re['teams'][$n]['elo']));$check($maxDiff<1.0,'PHP ratings match the Python seed (max diff '.round($maxDiff,2).')');
$win=$seed['games'];$win[]=['2026-11-12T19:45','uefa.nations','Türkiye','Belgium',3,0,0,'Türkiye','test-tr-be'];$after=pp_nr_compute($win,$seed,$t0);
$check($after['teams']['Türkiye']['elo']>$re['teams']['Türkiye']['elo']+10&&$after['teams']['Belgium']['elo']<$re['teams']['Belgium']['elo']-10,'Türkiye 3-0 Belgium moves both ratings');
$tmpR=sys_get_temp_dir().'/n90-nr-'.getmypid();@mkdir($tmpR);$GLOBALS['pp_nr_storage']=$tmpR;$next=null;foreach($hist as $m)if(!$m['result']&&in_array('Türkiye',[$m['home']['name'],$m['away']['name']],true)&&$m['away']['name']!=='Belgium')$next=$m;
if($next){pp_write($tmpR.'/national-ratings.json',$re);$p1=pp_build_prediction($next,$hist,$clock);pp_write($tmpR.'/national-ratings.json',$after);clearstatcache();touch($tmpR.'/national-ratings.json',time()+5);clearstatcache();$p2=pp_build_prediction($next,$hist,$clock);$tr=$next['home']['name']==='Türkiye'?'home':'away';$check($p2['expectedGoals'][$tr]>$p1['expectedGoals'][$tr],'next Türkiye forecast rises after the win ('.round($p1['expectedGoals'][$tr],2).' -> '.round($p2['expectedGoals'][$tr],2).')');
 $check(pp_nr_pending_before($next,$hist),'second-window match is provisional while Türkiye v Belgium is unplayed');$half=array_map(fn($m)=>$m['home']['name']==='Türkiye'&&$m['away']['name']==='Belgium'?array_replace($m,['result'=>['home'=>3,'away'=>0]]):$m,$hist);$opp=$next[$next['home']['name']==='Türkiye'?'away':'home']['name'];$check(pp_nr_pending_before($next,$half)===(bool)array_filter($half,fn($m)=>!$m['result']&&($m['kickoff']??$m['date'])<($next['kickoff']??$next['date'])&&in_array($opp,[$m['home']['name'],$m['away']['name']],true)),'still provisional while the opponent ('.$opp.') has an earlier match');$played=array_map(fn($m)=>!$m['result']&&($m['kickoff']??$m['date'])<($next['kickoff']??$next['date'])?array_replace($m,['result'=>['home'=>1,'away'=>1]]):$m,$hist);$check(!pp_nr_pending_before($next,$played),'final forecast once both teams have played');}
else $check(false,'Türkiye second November fixture present');
$tmpU=sys_get_temp_dir().'/n90-nru-'.getmypid();@mkdir($tmpU);$feed=json_decode((string)file_get_contents(__DIR__.'/fixtures/espn-unl-202611.json'),true);
foreach($feed['events'] as &$ev){if(($ev['name']??'')==='Belgium at Türkiye'){$ev['competitions'][0]['status']['type']=['name'=>'STATUS_FULL_TIME','state'=>'post','completed'=>true];foreach($ev['competitions'][0]['competitors'] as &$c){$c['score']=$c['homeAway']==='home'?'3':'0';$c['winner']=$c['homeAway']==='home';}unset($c);}}unset($ev);
$calls=0;$fake=function(string $url)use($feed,&$calls){$calls++;return str_contains($url,'uefa.nations')&&str_contains($url,'202611')?$feed:['events'=>[]];};
$u=pp_nr_update(['storage_dir'=>$tmpU,'unl_enabled'=>true]+$cfg,new DateTimeImmutable('2026-11-13T09:00:00Z'),$fake,false);$live=json_decode((string)file_get_contents($tmpU.'/national-ratings.json'),true);
$check(($u['status']??'')==='updated'&&($u['newResults']??0)>=1&&$calls>=24,'server updater fetched feeds and found the new result '.json_encode($u));
$check(($live['teams']['Türkiye']['elo']??0)>$seed['teams']['Türkiye']['elo'],'stored ratings include Türkiye 3-0 Belgium');
$u2=pp_nr_update(['storage_dir'=>$tmpU,'unl_enabled'=>true]+$cfg,new DateTimeImmutable('2026-11-13T10:00:00Z'),$fake,false);for($k=0;$k<5;$k++)pp_nr_update(['storage_dir'=>$tmpU,'unl_enabled'=>true]+$cfg,new DateTimeImmutable('2026-11-13T10:00:00Z'),$fake,false);$c1=$calls;$u3=pp_nr_update(['storage_dir'=>$tmpU,'unl_enabled'=>true]+$cfg,new DateTimeImmutable('2026-11-13T10:30:00Z'),$fake,false);$check(($u3['status']??'')==='current'&&$calls===$c1,'cached: no refetch within the refresh interval');
// V135 back-fill: after a long pause every missed month is fetched once (bounded per run), closed months are never refetched.
$tmpB=sys_get_temp_dir().'/n90-nrb-'.getmypid();@mkdir($tmpB);$months=[];$spy=function(string $url)use(&$months){if(preg_match('/dates=(\d{6})/',$url,$mm))$months[$mm[1]]=true;return ['events'=>[]];};
pp_nr_update(['storage_dir'=>$tmpB,'unl_enabled'=>true]+$cfg,new DateTimeImmutable('2027-03-20T09:00:00Z'),$spy,false);for($k=0;$k<20;$k++)pp_nr_update(['storage_dir'=>$tmpB,'unl_enabled'=>true]+$cfg,new DateTimeImmutable('2027-03-20T09:00:00Z'),$spy,false);
foreach(['202611','202612','202701','202702','202703'] as $mm)$check(isset($months[$mm]),"back-filled month $mm");
$before=count($months);$n0=0;$spy2=function(string $url)use(&$n0){if(!preg_match('/dates=(20270[23])/',$url))$n0++;return ['events'=>[]];};pp_nr_update(['storage_dir'=>$tmpB,'unl_enabled'=>true]+$cfg,new DateTimeImmutable('2027-03-25T09:00:00Z'),$spy2,false);$check($n0===0,'closed months are not refetched');

unset($GLOBALS['pp_nr_storage']);
// V137 live call-ups from Wikipedia "Current squad" (self-updating): parser, updater, and the XI built from it.
$wiki=(string)file_get_contents(__DIR__.'/fixtures/wiki-turkey-squad-202611.txt');$ws=pp_ns_parse($wiki);
$wn=array_map(fn($p)=>$p['name'],$ws['players']??[]);$check(count($wn)===26,'26 players in the Wikipedia current squad');
$check(in_array('Aral Şimşir',$wn,true)&&in_array('Arda Güler',$wn,true)&&!in_array('İrfan Can Kahveci',$wn,true)&&!in_array('Kerem Aktürkoğlu',$wn,true),'Aral and Arda in, İrfan Can and Kerem out');
$check(($ws['coach']??'')==='Sergen Yalçın'&&($ws['dates']??[])===['2026-11-12','2026-11-15'],'coach and window dates parsed '.json_encode([$ws['coach']??null,$ws['dates']??null]));
$tmpW=sys_get_temp_dir().'/n90-ns-'.getmypid();@mkdir($tmpW);$wcalls=0;$wf=function(string $url)use($wiki,&$wcalls){$wcalls++;return str_contains($url,'Turkey_national_football_team')?$wiki:'';};
$fx=[['date'=>'2026-11-12','home'=>['name'=>'Türkiye','espnId'=>'465'],'away'=>['name'=>'Belgium','espnId'=>'459'],'result'=>null]];
$nu=pp_ns_update(['storage_dir'=>$tmpW]+$cfg,$fx,new DateTimeImmutable('2026-11-09T10:00:00Z'),$wf);$lv=json_decode((string)file_get_contents($tmpW.'/national-callups-live.json'),true);
$check(($nu['updated']??0)>=1&&count($lv['teams']['465']['players']??[])===26,'call-ups stored for Türkiye '.json_encode($nu));
pp_ns_update(['storage_dir'=>$tmpW]+$cfg,$fx,new DateTimeImmutable('2026-11-09T12:00:00Z'),$wf);$check($wcalls===4,'cached for 12 h (Transfermarkt then Wikipedia per team, no refetch), calls='.$wcalls);
$GLOBALS['pp_nr_storage']=$tmpW;$xi2=pp_players_recent($match,'home','uefa.nations',['storage_dir'=>$tmpW,'players_request_budget'=>20]+$cfg,new DateTimeImmutable('2026-11-10T12:00:00Z'),$fetch);unset($GLOBALS['pp_nr_storage']);
$names2=array_map(fn($p)=>pp_public_name($p['name']),array_merge($xi2['players']??[],$xi2['bench']??[]));$check(count($xi2['players']??[])===11&&!in_array(pp_public_name('İrfan Can Kahveci'),$names2,true)&&in_array(pp_public_name('Aral Şimşir'),$names2,true),'XI from live call-ups: Aral in, İrfan Can out');
$check(str_starts_with((string)($xi2['source']['callup']['source']??''),'Wikipedia'),'XI cites the live source');
echo json_encode(['PASS'=>$fail===0,'forecasts'=>$sample??[],'turkiyeBelgium'=>$pred['publishedScore']??null,'xg'=>$xg??null,'turkiyeXI'=>array_map(fn($p)=>$p['name'],$xi['players']??[]),'unl'=>count($out['unl']),'intl'=>count($out['intl']),'sample'=>array_slice($names,0,4)],JSON_UNESCAPED_UNICODE),"\n";
exit($fail?1:0);
