<?php
// V124 UEFA Nations League + international friendlies: ESPN monthly feeds -> normalised bulletin fixtures.
// php tests/national-competitions.php  (offline: uses trimmed ESPN snapshots in tests/fixtures)
declare(strict_types=1);
require __DIR__.'/../server/lib.php';
require_once __DIR__.'/../server/live-sources.php';
require_once __DIR__.'/../server/player-lineups.php';
require_once __DIR__.'/../server/bench-policy.php';
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
echo json_encode(['PASS'=>$fail===0,'turkiyeXI'=>array_map(fn($p)=>$p['name'],$xi['players']??[]),'unl'=>count($out['unl']),'intl'=>count($out['intl']),'sample'=>array_slice($names,0,4)],JSON_UNESCAPED_UNICODE),"\n";
exit($fail?1:0);
