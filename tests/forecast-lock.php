<?php
declare(strict_types=1);
// V139: a protected-forecast lock that does not match state.json (older data uploaded) must restore, never abort updates.
$dir=sys_get_temp_dir().'/next90-lock-'.getmypid();@mkdir($dir,0700,true);putenv('NEXT90_STORAGE_DIR='.$dir);
require __DIR__.'/../server/lib.php';ini_set('error_log','/dev/null');
$rec=['id'=>'aaaaaaaaaaaaaaaaaaaaaaaa','date'=>'2026-10-22','originalPublishedDate'=>'2026-10-22','competitionId'=>'ucl','home'=>['id'=>'x','name'=>'A'],'away'=>['id'=>'y','name'=>'B'],'publishedScore'=>[2,1]];
file_put_contents($dir.'/forecast-lock-20261022-23.json',json_encode(['version'=>1,'predictions'=>[$rec['id']=>['record'=>$rec,'sha256'=>pp_forecast_digest($rec)]]]));
$fail=fn($m)=>[fwrite(STDERR,"FAIL $m\n"),exit(1)];
try{$lock=pp_forecast_lock_capture($dir,['predictions'=>[]]);}catch(Throwable $e){$fail('capture threw: '.$e->getMessage());}
$state=pp_forecast_lock_merge(['predictions'=>[],'matches'=>[]],$lock);
if(($state['predictions'][$rec['id']]['publishedScore']??null)!==[2,1])$fail('protected forecast not restored');
$changed=$state;$changed['predictions'][$rec['id']]['publishedScore']=[0,0];$back=pp_forecast_lock_merge($changed,$lock);
if($back['predictions'][$rec['id']]['publishedScore']!==[2,1])$fail('modified protected forecast not restored');
file_put_contents($dir.'/forecast-lock-20261022-23.json','{"broken":');try{pp_forecast_lock_capture($dir,['predictions'=>[]]);}catch(Throwable $e){$fail('unreadable lock threw');}
array_map('unlink',glob($dir.'/*'));rmdir($dir);echo json_encode(['PASS'=>true]),"\n";
