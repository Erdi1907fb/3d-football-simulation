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
echo json_encode(['PASS'=>$fail===0,'unl'=>count($out['unl']),'intl'=>count($out['intl']),'sample'=>array_slice($names,0,4)],JSON_UNESCAPED_UNICODE),"\n";
exit($fail?1:0);
