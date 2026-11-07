<?php
declare(strict_types=1);
// Full unattended refresh for hPanel cron. The separate API tick is bounded and rate limited.
if (PHP_SAPI!=='cli') { http_response_code(403); exit('CLI only'); }
require __DIR__.'/server/lib.php';
try {
    $cfg=pp_config();
    // Rotate a few due sources per minute rather than starting one long shared-hosting process.
    $force=in_array('--force',$argv,true);if(!$force){$now=new DateTimeImmutable('now',new DateTimeZone($cfg['timezone']));$state=pp_read($cfg['storage_dir'].'/state.json');$due=pp_due_jobs(pp_source_jobs($cfg,$now),$state,$cfg,$now);$cfg['_only_jobs']=array_slice(array_keys($due),0,3);unset($state);}
    $result=pp_update($cfg,$force);
    require_once __DIR__.'/server/season-data.php';require_once __DIR__.'/server/week-forecast.php';
    $clock=new DateTimeImmutable('now',new DateTimeZone('Europe/Istanbul'));$competitions=['tr.1','en.1','es.1','de.1','it.1','fr.1','ucl','uel','uecl'];$competition=$competitions[((int)floor($clock->getTimestamp()/60))%9];
    try{$season=ss_get($competition,$cfg,$clock);$result['weeklyCompetition']=$competition;$weeklyStarted=microtime(true);for($weeklyStep=0;$weeklyStep<3;$weeklyStep++){$result['weekly']=sw_prepare($cfg,$competition,$clock);if(($result['weekly']['status']??'')!=='prepared'||($result['weekly']['remaining']??0)===0||microtime(true)-$weeklyStarted>=10)break;}}catch(Throwable $e){$result['weeklyUpdateError']=$e->getMessage();}
    // Warm a bounded number of player snapshots without extending visitor refresh work.
    if(($result['status']??'')!=='locked')pp_players_warm($cfg,new DateTimeImmutable('now',new DateTimeZone($cfg['timezone'])));
    if(($result['status']??'')!=='locked')pp_write($cfg['storage_dir'].'/scheduler.json',[
        'lastRunAt'=>(new DateTimeImmutable('now',new DateTimeZone($cfg['timezone'])))->format(DATE_ATOM),
        'status'=>$result['status']??'unknown',
    ]);
    echo json_encode($result,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT|JSON_THROW_ON_ERROR).PHP_EOL;
    exit(($result['health']['status']??'')==='stale'?2:0);
} catch (Throwable $e) { fwrite(STDERR,'Pulse Pitch: '.$e->getMessage().PHP_EOL); exit(1); }
