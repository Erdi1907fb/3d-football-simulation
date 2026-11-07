<?php
declare(strict_types=1);
/* Additive, first-install snapshot. Never bootstrap a new forecast from a lock. */
function pp_forecast_protected(array $p):bool {
    return in_array($p['originalPublishedDate']??$p['date']??'', ['2026-10-22','2026-10-23'], true);
}
function pp_forecast_frozen_fields(array $p):array {
    // Settlement and source freshness may advance; published identity, date, score,
    // analysis, scorer/event records and any pre-existing evaluation stay fixed.
    return array_diff_key($p,array_flip(['result','resultReceivedAt','resultUpdatedAt','source']));
}
function pp_forecast_digest(array $p):string {
    $normalize=function($v)use(&$normalize){if(!is_array($v))return $v;if(!array_is_list($v))ksort($v);foreach($v as&$item)$item=$normalize($item);unset($item);return $v;};
    return hash('sha256',json_encode($normalize(pp_forecast_frozen_fields($p)),JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR));
}
function pp_forecast_lock_capture(string $dir,array $state):array {
    $file=$dir.'/forecast-lock-20261022-23.json';$existing=pp_read($file);
    if(is_file($file)&&(!isset($existing['predictions'])||!is_array($existing['predictions'])))throw new RuntimeException('Forecast lock is unreadable; state retained');
    $lock=$existing?:['version'=>1,'createdAt'=>(new DateTimeImmutable())->format(DATE_ATOM),'predictions'=>[]];$changed=false;
    foreach($state['predictions']??[]as$id=>$p)if(pp_forecast_protected($p)&&!isset($lock['predictions'][$id])){
        $lock['predictions'][$id]=['record'=>$p,'sha256'=>pp_forecast_digest($p)];$changed=true;
    }
    if($changed){
        if(!is_file($dir.'/state-before-v44.json'))pp_write($dir.'/state-before-v44.json',$state);
        pp_write($file,$lock);
    }
    // Missing / modified records are an error, not permission to learn a new baseline.
    pp_forecast_lock_assert($state,$lock);return $lock;
}
function pp_forecast_lock_assert(array $state,array $lock):void {
    foreach($lock['predictions']??[]as$id=>$entry){$p=$state['predictions'][$id]??null;
        if(!$p||!hash_equals($entry['sha256'],pp_forecast_digest($p)))throw new RuntimeException('Protected forecast mismatch: '.$id.'; write cancelled');
    }
}
function pp_forecast_lock_merge(array $next,array $lock):array {
    foreach($lock['predictions']??[]as$id=>$entry){$old=$entry['record'];$settlement=array_intersect_key($next['predictions'][$id]??[],array_flip(['result','resultReceivedAt','resultUpdatedAt','source']));$next['predictions'][$id]=array_replace($old,$settlement);}
    // Retain exact fixture identities and dates in the public selector as well.
    foreach($next['matches']??[]as$key=>$m){$old=$lock['predictions'][$m['id']??'']['record']??null;if($old)foreach(['id','home','away','date','kickoff','competition','competitionId']as$field)if(array_key_exists($field,$old))$next['matches'][$key][$field]=$old[$field];}
    pp_forecast_lock_assert($next,$lock);return $next;
}

/* Weekly forecasts are made before replay publication. Keep their identity when
 * monthly feeds replace a complete-season fixture with another provider id. */
function pp_shared_fixture_team(array $team):string{
 static $map=null;$map??=pp_read(__DIR__.'/../assets/seasons/team-map.json');$name=trim((string)($team['name']??''));$canonical=pp_club_key($team);return (string)($map[$name]??$map[$canonical]??$canonical);
}
function pp_shared_fixture_same(array $a,array $b):bool{
 if(!empty($a['date'])&&!empty($b['date'])&&abs(strtotime($a['date'])-strtotime($b['date']))>21*86400)return false;
 return ($a['competitionId']??'')===($b['competitionId']??'')&&(empty($a['season'])||empty($b['season'])||$a['season']===$b['season'])&&pp_shared_fixture_team($a['home']??[])===pp_shared_fixture_team($b['home']??[])&&pp_shared_fixture_team($a['away']??[])===pp_shared_fixture_team($b['away']??[]);
}
function pp_shared_fixture_retain(array $all,array $state):array{
 $records=$state['predictions']??[];foreach($state['matches']??[]as$id=>$m)if(!isset($records[$id])&&($m['source']['basis']??'')==='validated-complete-season')$records[$id]=$m+['_retainSeed'=>true];
 foreach($records as$id=>$p){if(empty($p['weeklyPrepared'])&&empty($p['weeklyPublished'])&&empty($p['_retainSeed'])&&!(isset($p['publishedScore'])&&isset($p['seed'])))continue;$found=null;foreach($all as$key=>$m)if(pp_shared_fixture_same($p,$m)){$found=$key;break;}
  if($found!==null){$m=$all[$found];unset($all[$found]);$m['id']=$id;$all[$id]=$m;}
  elseif(isset($state['matches'][$id]))$all[$id]=$state['matches'][$id];
 }
 return $all;
}
