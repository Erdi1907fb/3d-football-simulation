<?php
declare(strict_types=1);
// Small private read models keep visitors out of the full historical dataset.
function pp_compact_cache(array $state,array $cfg,DateTimeImmutable $now):void {
    $state=pp_replay_restoration_apply($state,$now);
    if(!function_exists('s3_bulletin'))require_once __DIR__.'/bulletin.php';
    $bulletin=s3_bulletin($state,$cfg,$now);$path=$cfg['storage_dir'];$ids=[];
    foreach(array_merge($bulletin['matches'],$bulletin['bigMatches'])as$m){$id=$m['id'];if(in_array($id,$ids,true))continue;$replay=s3_replay($state,$id,$now);if(!$replay)continue;$ids[]=$id;$file=$path.'/replay-'.$id.'.json';$payload=['schema'=>1,'replay'=>$replay];if(pp_read($file)!==$payload)pp_write($file,$payload);}
    pp_write($path.'/public-window.json',['schema'=>6,'writtenAt'=>$now->format(DATE_ATOM),'today'=>$bulletin['today'],'replayIds'=>$ids,'bulletin'=>$bulletin,'report'=>s3_report($state,$now),'health'=>pp_public_health($state,$cfg,$now)]);
    // Only generated replay caches are disposable; frozen predictions remain in state.json.
    foreach(glob($path.'/replay-*.json')?:[]as$file)if(preg_match('/^replay-([a-f0-9]{24})\.json$/',basename($file),$m)&&!in_array($m[1],$ids,true))@unlink($file);
}
function pp_read_compact(array $cfg,string $action,DateTimeImmutable $now,?string $id=null):?array {
    if(!in_array($action,['bulletin','report','health','replay'],true))return null;
    $cache=pp_read($cfg['storage_dir'].'/public-window.json');$at=strtotime($cache['writtenAt']??'');
    if(($cache['schema']??null)!==6||($cache['today']??'')!==pp_bulletin_day($now)||!$at||$at>$now->getTimestamp()||$now->getTimestamp()-$at>600)return null;
    if($action==='replay'){
        if(!$id||!preg_match('/^[a-f0-9]{24}$/',$id)||!in_array($id,$cache['replayIds']??[],true))return null;
        $row=pp_read($cfg['storage_dir'].'/replay-'.$id.'.json');return ($row['schema']??null)===1?($row['replay']??null):null;
    }
    $out=$cache[$action]??null;if(!is_array($out))return null;if($action==='bulletin')$out['serverNow']=$now->format(DATE_ATOM);if($action==='report')$out['finalized']=(int)$now->setTimezone(new DateTimeZone('Europe/Istanbul'))->format('G')>=6&&$out['settled']===$out['total'];if($action==='health'){$last=pp_read($cfg['storage_dir'].'/scheduler.json')['lastRunAt']??null;$stamp=strtotime($last??'');$out['schedulerLastRunAt']=$last;$out['backgroundVerified']=$stamp&&$stamp<=$now->getTimestamp()&&$now->getTimestamp()-$stamp<=600;$out['cronOverdue']=!$out['backgroundVerified'];}return $out;
}
