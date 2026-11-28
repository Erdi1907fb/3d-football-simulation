<?php
declare(strict_types=1);
// V268: data-weighted published scenario — result follows the model (favourite usually wins, upsets possible), never capped.
require __DIR__.'/../server/lib.php';
$fail=fn($m)=>[fwrite(STDERR,"FAIL $m\n"),exit(1)];
$a=pp_scenario_score_v2(2.34,.86,12345);$b=pp_scenario_score_v2(2.34,.86,12345);if($a!==$b)$fail('reproducible');
if($a['selection']['policy']!==PP_SCENARIO_POLICY_V2)$fail('policy');
$c=[];$big=0;for($s=1;$s<=3000;$s++){$r=pp_scenario_score_v2(2.34,.86,$s)['score'];$c[$r['home'].'-'.$r['away']]=($c[$r['home'].'-'.$r['away']]??0)+1;}
arsort($c);$top=array_slice(array_keys($c),0,4);foreach(['2-0','1-0','2-1'] as $k)if(!in_array($k,$top,true))$fail("likely score $k in the top four");
if(count($c)<12)$fail('upsets and varied scores remain possible');
for($s=1;$s<=3000;$s++){$r=pp_scenario_score_v2(4.6,.25,$s)['score'];if($r['home']>=6)$big++;}if($big<20)$fail('a lopsided model still produces big scores (no cap)');
$fb=pp_scenario_score_v2(2.3368942088752043,.8572216436369888,2186787619)['score'];if(!($fb['home']>$fb['away']&&$fb['home']<6))$fail('Fenerbahce-Erzurumspor follows the model (home win, no 0.4% tail)');
$o=['h'=>0,'d'=>0,'a'=>0];for($s=1;$s<=3000;$s++){$r=pp_scenario_score_v2(1.4,1.3,$s)['score'];$o[$r['home']>$r['away']?'h':($r['home']===$r['away']?'d':'a')]++;}if(min($o)<300)$fail('balanced match keeps all three results');
$up=0;for($s=1;$s<=3000;$s++){$r=pp_scenario_score_v2(2.34,.86,$s)['score'];if($r['home']<=$r['away'])$up++;}if($up<150||$up>900)$fail('favourite usually wins but upsets stay possible: '.$up);
echo json_encode(['pass'=>true,'top'=>$top,'distinct'=>count($c),'bigLopsided'=>$big,'fbErz'=>$fb]),"\n";
// Migration: unplayed old-policy forecast is re-drawn; played, kicked-off or protected ones are untouched.
$now=new DateTimeImmutable('2026-11-28T21:00:00+03:00');$old=['id'=>'e0de9bda0a9e0039ba8bb521','date'=>'2026-11-29','kickoff'=>'2026-11-29T17:00:00+00:00','seed'=>2186787619,'expectedGoals'=>['home'=>2.3368942088752043,'away'=>.8572216436369888],'publishedScore'=>['home'=>7,'away'=>2],'scoreSelection'=>['policy'=>'seeded-predictive-scenario'],'result'=>null,'analysis'=>['uncertainty'=>['scorePolicy'=>'seeded-predictive-scenario']]];
$new=pp_scenario_migrate($old,$old,$now);if($new['publishedScore']===['home'=>7,'away'=>2]||$new['previousPublishedScore']!==['home'=>7,'away'=>2]||$new['scoreSelection']['policy']!==PP_SCENARIO_POLICY_V2||$new['revision']!==1)$fail('unplayed forecast re-drawn once');
if(pp_scenario_migrate($new,$new,$now)!==$new)$fail('migration is idempotent');
$played=$old;$played['result']=['home'=>2,'away'=>0];if(pp_scenario_migrate($played,$played,$now)!==$played)$fail('played untouched');
$late=$old;$late['kickoff']='2026-11-28T15:00:00+00:00';if(pp_scenario_migrate($late,$late,$now)!==$late)$fail('kicked-off untouched');
$lock=$old;$lock['originalPublishedDate']='2026-10-22';if(pp_scenario_migrate($lock,$lock,$now)!==$lock)$fail('protected untouched');
echo json_encode(['migration'=>true,'fbErzNow'=>$new['publishedScore']]),"\n";
