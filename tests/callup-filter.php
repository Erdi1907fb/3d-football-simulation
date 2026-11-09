<?php
declare(strict_types=1);
// V141: federation call-ups apply to every provider's estimated national XI (live site: FotMob XI still had İrfan Can).
$dir=sys_get_temp_dir().'/next90-callup-'.getmypid();@mkdir($dir,0700,true);putenv('NEXT90_STORAGE_DIR='.$dir);
require __DIR__.'/../server/lib.php';require_once __DIR__.'/../server/player-lineups.php';
$fail=fn($m)=>[fwrite(STDERR,"FAIL $m\n"),exit(1)];
$d=json_decode(file_get_contents(__DIR__.'/fixtures/lineup-turkey-belgium-202611.json'),true);
$m=['date'=>'2026-11-12','kickoff'=>'2026-11-12T17:00:00+00:00','home'=>['name'=>'Türkiye','espnId'=>'465'],'away'=>['name'=>'Belgium','espnId'=>'459']];
$t=pp_national_callup_filter($d,$m,new DateTimeImmutable('2026-11-09T18:00:00+03:00'))['teams'][0];
$all=array_merge($t['players'],$t['bench']);$names=array_map(fn($p)=>$p['name'],$all);
foreach(['İrfan Kahveci','Kerem Aktürkoglu','Altay Bayındır','Muhammed Şengezer'] as$n)if(in_array($n,$names,true))$fail("$n is not called up");
foreach(['Arda Güler','Hakan Çalhanoğlu','Aral Şimşir','Uğurcan Çakır'] as$n)if(!in_array($n,$names,true))$fail("$n missing");
if(count($t['players'])!==11||count(array_unique(array_map(fn($p)=>$p['id'],$all)))!==count($all))$fail('XI size / unique ids');
if(count(array_filter($t['players'],fn($p)=>$p['position']==='GK'))!==1)$fail('one goalkeeper');
if(($t['coach']['name']??'')==='')$fail('coach');
$nums=array_map(fn($p)=>$p['number']??null,$all);if(in_array(null,$nums,true)||count(array_unique($nums))!==count($nums))$fail('every player needs a distinct number');
if(($t['bench'][0]['position']??'')!=='GK')$fail('bench starts with a goalkeeper');if(count($t['bench'])>12)$fail('bench at most 12');
$again=pp_national_callup_filter(['teams'=>[$t,null]],$m,new DateTimeImmutable('2026-11-09T18:00:00+03:00'))['teams'][0];if(array_map(fn($p)=>$p['name'].$p['number'],array_merge($again['players'],$again['bench']))!==array_map(fn($p)=>$p['name'].$p['number'],$all))$fail('filter must be idempotent');
@rmdir($dir);echo json_encode(['PASS'=>true,'xi'=>array_map(fn($p)=>$p['name'],$t['players'])],JSON_UNESCAPED_UNICODE),"\n";
