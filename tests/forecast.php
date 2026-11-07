<?php
// V109 server forecast model checks (php tests/forecast.php). No network, no data writes.
declare(strict_types=1);
require __DIR__.'/../server/lib.php';
$fail=0;$check=function(bool $ok,string $what)use(&$fail){if(!$ok){$fail++;fwrite(STDERR,"FAIL: $what\n");}};
$now=new DateTimeImmutable('2026-11-07 12:00:00',new DateTimeZone('Europe/Istanbul'));
// Synthetic league: Strong beats everyone, Weak loses; deterministic schedule.
$teams=['Strong FC','Mid United','Weak Town','Other City'];$hist=[];$d=0;
for($r=0;$r<6;$r++)foreach($teams as $i=>$h)foreach($teams as $j=>$a){if($i===$j)continue;$d++;$gh=($h==='Strong FC'?3:1)+($a==='Weak Town'?1:0);$ga=($a==='Strong FC'?2:0)+($h==='Weak Town'?1:0);
 $hist[]=['competitionId'=>'tr.1','home'=>['name'=>$h],'away'=>['name'=>$a],'date'=>$now->modify('-'.(3+$d).' days')->format('Y-m-d'),'kickoff'=>null,'result'=>['home'=>$gh,'away'=>$ga]];}
$match=['competitionId'=>'tr.1','home'=>['name'=>'Strong FC'],'away'=>['name'=>'Weak Town'],'date'=>'2026-11-08','kickoff'=>'2026-11-08T17:00:00+03:00'];
$a=pp_forecast($match,$hist,$now);$b=pp_forecast($match,$hist,$now);
$check(json_encode($a)===json_encode($b),'deterministic forecast');
$xh=$a['expectedGoals']['home'];$xa=$a['expectedGoals']['away'];
$check(is_finite($xh)&&is_finite($xa)&&$xh>=.2&&$xh<=4.5&&$xa>=.2&&$xa<=4.5,'xG bounded');
$check($xh>$xa,'stronger side has higher xG');
$rev=pp_forecast(['competitionId'=>'tr.1','home'=>['name'=>'Weak Town'],'away'=>['name'=>'Strong FC'],'date'=>'2026-11-08','kickoff'=>'2026-11-08T17:00:00+03:00'],$hist,$now);
$check($rev['expectedGoals']['away']>$rev['expectedGoals']['home'],'reverse fixture keeps strength order');
$neutral=pp_forecast($match+['neutral'=>true],$hist,$now);$check($neutral['expectedGoals']['home']/$neutral['expectedGoals']['away']<$xh/$xa,'neutral venue removes home edge');
// Future results must not leak into a forecast published now.
$leak=$hist;$leak[]=['competitionId'=>'tr.1','home'=>['name'=>'Weak Town'],'away'=>['name'=>'Strong FC'],'date'=>'2026-11-20','kickoff'=>null,'result'=>['home'=>9,'away'=>0]];
$check(json_encode(pp_forecast($match,$leak,$now)['expectedGoals'])===json_encode($a['expectedGoals']),'no future data leakage');
$check(pp_market_valid(['home'=>1.5,'draw'=>4.2,'away'=>6.5])&&!pp_market_valid(['home'=>0.5,'draw'=>4,'away'=>6]),'market odds validation');
$fit=pp_market_fit($xh,$xa,['home'=>1.5,'draw'=>4.2,'away'=>6.5]);$check(is_array($fit),'market fit returns array');
$pub=['id'=>'x','score'=>['home'=>2,'away'=>1],'forecast'=>['home'=>2,'away'=>1]];$check(pp_forecast_digest($pub)===pp_forecast_digest($pub),'lock digest stable');
echo json_encode(['PASS'=>$fail===0,'failures'=>$fail,'xg'=>[$xh,$xa],'quality'=>$a['quality']['status']??null]),"\n";exit($fail?1:0);
