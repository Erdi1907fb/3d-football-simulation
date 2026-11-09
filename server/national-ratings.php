<?php
declare(strict_types=1);
/* V134 self-updating national-team ratings (PHP port of tools/national-ratings.py).
   Seed: assets/national-ratings.json (games since 2023-03 + squad ratings). On every update the server fetches the
   current and previous month of each international competition from ESPN (bounded per run, cached in storage_dir),
   merges new results into the seed games and recomputes Elo, titles and form. Output: storage_dir/national-ratings.json,
   read by pp_forecast for UEFA Nations League and international friendlies. */
function pp_nr_comps():array{return [
 'fifa.world'=>[60,'FIFA World Cup','world'],'uefa.euro'=>[50,'UEFA EURO','major'],'conmebol.america'=>[50,'Copa América','major'],
 'concacaf.gold'=>[45,'CONCACAF Gold Cup','continental'],'caf.nations'=>[45,'Africa Cup of Nations','continental'],'afc.asian.cup'=>[45,'AFC Asian Cup','continental'],
 'fifa.worldq.uefa'=>[40,'WC qualifying UEFA','qualifier'],'fifa.worldq.conmebol'=>[40,'WC qualifying CONMEBOL','qualifier'],'fifa.worldq.concacaf'=>[40,'WC qualifying CONCACAF','qualifier'],
 'fifa.worldq.caf'=>[40,'WC qualifying CAF','qualifier'],'fifa.worldq.afc'=>[40,'WC qualifying AFC','qualifier'],'fifa.worldq.ofc'=>[35,'WC qualifying OFC','qualifier'],
 'uefa.euroq'=>[40,'EURO qualifying','qualifier'],'uefa.nations'=>[35,'UEFA Nations League','nations'],'concacaf.nations.league'=>[30,'CONCACAF Nations League','nations'],
 'fifa.friendly'=>[15,'International friendly','friendly']];}
function pp_nr_seed():array{static $s=null;return $s??=pp_read(__DIR__.'/../assets/national-ratings.json');}
function pp_nr_current(array $cfg=[]):array{
 static $memo=[];$dir=$cfg['storage_dir']??null;if($dir){$f=$dir.'/national-ratings.json';$k=$f.'|'.(@filemtime($f)?:0);if(isset($memo[$k]))return $memo[$k];$live=pp_read($f);if(!empty($live['teams'])){$memo=[$k=>$live];return $live;}}return pp_nr_seed();
}
function pp_nr_name(string $espn,array $canon):string{$n=function_exists('pp_provider_name')?pp_provider_name($espn):$espn;return $canon[pp_public_name($n)]??$canon[pp_public_name($espn)]??$n;}
/* Fetch the recent months; returns ['games'=>rows,'fetched'=>n,'complete'=>bool]. */
function pp_nr_fetch(array $cfg,DateTimeImmutable $now,?callable $fetcher=null,int $budget=32):array{
 $dir=$cfg['storage_dir'];$utc=$now->setTimezone(new DateTimeZone('UTC'));
 // Every month from the seed date to now is covered: recent months refresh, older months are fetched once and kept,
 // so a server pause of any length is back-filled and every international result ever played stays in the model.
 $seedAsOf=(string)(pp_nr_seed()['asOf']??'2026-11-01');$cursor=(new DateTimeImmutable(substr($seedAsOf,0,7).'-01',new DateTimeZone('UTC')))->modify('-1 month');$months=[];
 for($m=$utc->modify('first day of this month');$m>=$cursor&&count($months)<120;$m=$m->modify('-1 month'))$months[]=$m->format('Ym');
 $nat=pp_read(__DIR__.'/../assets/national-teams.json');$canon=[];foreach(array_keys($nat['strength']??[])as$n)$canon[pp_public_name($n)]=$n;
 $rows=[];$fetched=0;$complete=true;
 foreach($months as$i=>$month)foreach(pp_nr_comps() as$slug=>$meta){/* newest month first: fresh results win the per-run budget */
  $path=$dir.'/national-feed-'.$slug.'-'.$month.'.json';$cache=pp_read($path);$age=$now->getTimestamp()-(strtotime($cache['fetchedAt']??'')?:0);$ttl=$i===0?3*3600:($i===1?12*3600:($cache&&($cache['finalAt']??null)?PHP_INT_MAX:24*3600));
  if((!$cache||$age>$ttl)&&$fetched<$budget){
   $url='https://site.api.espn.com/apis/site/v2/sports/soccer/'.$slug.'/scoreboard?dates='.$month.'&limit=1000';$fetched++;
   try{$doc=$fetcher?$fetcher($url,$cfg):pp_fetch($url,$cfg);if(!is_array($doc)||!isset($doc['events'])||!is_array($doc['events']))throw new RuntimeException('bad feed');
    $events=[];foreach($doc['events'] as$e){$c=$e['competitions'][0]??[];if(!(($c['status']['type']['completed']??false)===true))continue;$s=[];foreach($c['competitors']??[]as$t)$s[$t['homeAway']??'']=$t;if(!isset($s['home'],$s['away']))continue;$h=$s['home']['score']??null;$a=$s['away']['score']??null;if(!is_scalar($h)||!is_scalar($a)||!preg_match('/^\d+$/',(string)$h)||!preg_match('/^\d+$/',(string)$a))continue;
     $events[]=[substr((string)($c['date']??$e['date']??''),0,16),$slug,pp_nr_name((string)($s['home']['team']['displayName']??''),$canon),pp_nr_name((string)($s['away']['team']['displayName']??''),$canon),(int)$h,(int)$a,($c['neutralSite']??false)?1:0,($s['home']['winner']??false)?pp_nr_name((string)$s['home']['team']['displayName'],$canon):((($s['away']['winner']??false))?pp_nr_name((string)$s['away']['team']['displayName'],$canon):null),(string)($e['id']??'')];}
    $cache=['fetchedAt'=>$now->format(DATE_ATOM),'events'=>$events];if($i>=2)$cache['finalAt']=$now->format(DATE_ATOM);/* closed month: never refetched */pp_write($path,$cache);
   }catch(Throwable $e){$complete=false;}
  }elseif(!$cache)$complete=false;
  foreach($cache['events']??[]as$r)$rows[]=$r;
 }
 return ['games'=>$rows,'fetched'=>$fetched,'complete'=>$complete];
}
/* Pure computation: same model as tools/national-ratings.py. $games rows: [date,slug,home,away,hs,as,neutral,winner,id]. */
function pp_nr_compute(array $games,array $seed,DateTimeImmutable $now):array{
 $comps=pp_nr_comps();$nat=pp_read(__DIR__.'/../assets/national-teams.json');$strength=$nat['strength']??[];
 $uniq=[];foreach($games as$g){if(!is_array($g)||count($g)<9||!isset($comps[$g[1]]))continue;$uniq[$g[8]!==''?$g[8]:md5(json_encode($g))]=$g;}
 $games=array_values($uniq);usort($games,fn($a,$b)=>strcmp($a[0],$b[0]));
 $elo=[];foreach($strength as$n=>$s)$elo[$n]=1200+((float)$s-40)*16;$hist=[];
 foreach($games as$g){[$date,$slug,$h,$a,$hs,$as,$neutral]=$g;$elo[$h]??=1350;$elo[$a]??=1350;$K=$comps[$slug][0];$d=abs($hs-$as);$K*=$d<=1?1:($d===2?1.5:(11+$d)/8);
  $dr=$elo[$h]-$elo[$a]+($neutral?0:100);$we=1/(10**(-$dr/400)+1);$w=$hs>$as?1:($hs===$as?.5:0);$delta=$K*($w-$we);$elo[$h]+=$delta;$elo[$a]-=$delta;
  $hist[$h][]=[$date,$w===.5?1:3*$w,$comps[$slug][0],$slug];$hist[$a][]=[$date,$w===.5?1:3*(1-$w),$comps[$slug][0],$slug];}
 $bonusOf=['world'=>35,'major'=>35,'continental'=>20];$titles=[];
 foreach($comps as$slug=>[$K,$label,$kind]){if(!isset($bonusOf[$kind]))continue;$eds=[];foreach($games as$g)if($g[1]===$slug){$y=(int)substr($g[0],0,4);if($slug==='caf.nations'&&substr($g[0],5,2)==='01')$y--;$eds[$y][]=$g;}
  foreach($eds as$y=>$gs){if(count($gs)<8)continue;$f=end($gs);$win=$f[7]??($f[4]>$f[5]?$f[2]:($f[5]>$f[4]?$f[3]:null));if($win)$titles[$win][]=['competition'=>$label,'year'=>$y,'kind'=>$kind,'date'=>substr($f[0],0,10)];}}
 $out=[];foreach($strength as$n=>$s){$h=array_slice($hist[$n]??[],-10);$wsum=array_sum(array_map(fn($x)=>$x[2],$h));$form=$h?array_sum(array_map(fn($x)=>$x[1]*$x[2],$h))/max(1e-9,$wsum):null;$bonus=0.;
  foreach($titles[$n]??[]as$t){$years=($now->getTimestamp()-strtotime($t['date']))/(365.25*86400);$bonus+=$bonusOf[$t['kind']]*0.5**($years/2);}
  $prev=$seed['teams'][$n]??[];$out[$n]=['elo'=>round($elo[$n]+$bonus,1),'eloBase'=>round($elo[$n],1),'titleBonus'=>round($bonus,1),'titles'=>$titles[$n]??[],'matches'=>count($hist[$n]??[]),'competitive'=>count(array_filter($hist[$n]??[],fn($x)=>$x[3]!=='fifa.friendly')),'form'=>$form===null?null:round($form,3),'squad'=>$prev['squad']??null,'espnId'=>$prev['espnId']??null];}
 uasort($out,fn($a,$b)=>$b['elo']<=>$a['elo']);$r=0;foreach($out as&$t)$t['rank']=++$r;unset($t);
 $last=$games?end($games)[0]:null;
 return ['version'=>1,'asOf'=>$now->format(DATE_ATOM),'lastResult'=>$last,'from'=>$seed['from']??'2023-03','matches'=>count($games),'method'=>($seed['method']??'').' Updated on the server (server/national-ratings.php).','teams'=>$out,'games'=>$games];
}
/* Called from pp_update: refresh feeds (bounded) and recompute when anything new arrived. */
function pp_nr_update(array $cfg,DateTimeImmutable $now,?callable $fetcher=null,bool $web=false):array{
 if(!(($cfg['unl_enabled']??false)||($cfg['intl_enabled']??false)))return ['status'=>'disabled'];
 $dir=$cfg['storage_dir'];$seed=pp_nr_seed();if(empty($seed['games']))return ['status'=>'no-seed'];
 $f=pp_nr_fetch($cfg,$now,$fetcher,$web?2:24);$live=pp_read($dir.'/national-ratings.json');
 $base=!empty($live['games'])?$live['games']:$seed['games'];$games=array_merge($base,$f['games']);
 $ids=[];foreach($games as$g)$ids[$g[8]??'']=true;$known=[];foreach($live['games']??[]as$g)$known[$g[8]??'']=true;
 $new=count(array_diff_key($ids,$known));if(!empty($live['teams'])&&$new===0&&$f['fetched']===0)return ['status'=>'current','matches'=>$live['matches']??0];
 $doc=pp_nr_compute($games,$seed,$now);pp_write($dir.'/national-ratings.json',$doc);return ['status'=>'updated','matches'=>$doc['matches'],'newResults'=>$new,'fetched'=>$f['fetched']];
}
/* A national prediction is provisional while either team still has an earlier, unplayed international in the window. */
function pp_nr_pending_before(array $m,array $matches):bool{
 $nr=pp_nr_current(['storage_dir'=>$GLOBALS['pp_nr_storage']??null]);$nat=fn($x)=>in_array($x['competitionId']??'',['unl','intl'],true)||(isset($nr['teams'][$x['home']['name']??''])&&isset($nr['teams'][$x['away']['name']??'']));
 if(!$nat($m))return false;$at=$m['kickoff']??$m['date'];
 foreach($matches as$o){if(($o['id']??'')===($m['id']??'')||!$nat($o)||!empty($o['result']))continue;$oat=$o['kickoff']??$o['date'];if($oat>=$at||strtotime($at)-strtotime($oat)>10*86400)continue;
  foreach(['home','away']as$s)foreach(['home','away']as$t)if(pp_club_key($o[$s])===pp_club_key($m[$t]))return true;}
 return false;
}
