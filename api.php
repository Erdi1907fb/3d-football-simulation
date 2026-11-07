<?php
declare(strict_types=1);
require __DIR__.'/server/lib.php';
require_once __DIR__.'/server/bulletin.php';
header('Content-Type: application/json; charset=utf-8');header('X-Content-Type-Options: nosniff');
$action=$_GET['action']??'daily';$method=$_SERVER['REQUEST_METHOD']??'GET';
try{
    if(!is_string($action))throw new InvalidArgumentException('Invalid action');$cfg=pp_config();$now=new DateTimeImmutable('now',new DateTimeZone($cfg['timezone']));
    if(in_array($action,['refresh','prepare'],true)){
        header('Cache-Control: no-store');
        if($method!=='POST'){http_response_code(405);header('Allow: POST');echo '{"error":"post_required"}';exit;}
        if(($_SERVER['HTTP_SEC_FETCH_SITE']??'')==='cross-site'){http_response_code(403);echo '{"error":"same_site_only"}';exit;}
        if(isset($_SERVER['HTTP_ORIGIN'])){$host=parse_url($_SERVER['HTTP_ORIGIN'],PHP_URL_HOST);$expected=explode(':',$_SERVER['HTTP_HOST']??'')[0];if(!$host||strcasecmp($host,$expected)!==0){http_response_code(403);echo '{"error":"same_site_only"}';exit;}}
        if($action==='prepare'){$id=$_GET['id']??'';if(!is_string($id)||!preg_match('/^[a-f0-9]{24}$/',$id))throw new InvalidArgumentException('Invalid fixture');$state=pp_schedule_seed_apply(pp_read($cfg['storage_dir'].'/state.json'),$now);$existing=s3_replay($state,$id,$now);if($existing){echo json_encode(['status'=>'ready','replay'=>$existing],JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR);exit;}$m=$state['matches'][$id]??null;if(!$m||!pp_in_publication_window($m,$now))throw new InvalidArgumentException('Unknown fixture');$cfg['_prepare_fixture']=$id;}
        if(!$cfg['auto_refresh_on_visit']){$out=['status'=>'disabled'];}else{$cfg['_web_mode']=true;$out=pp_update($cfg);if($action==='refresh')pp_players_warm($cfg,$now);else{$state=pp_read($cfg['storage_dir'].'/state.json');$out['replay']=s3_replay($state,$id,$now);if(!$out['replay'])http_response_code(202);}}
    }else{
        header('Cache-Control: public, max-age=30');if($method!=='GET'){http_response_code(405);header('Allow: GET');echo '{"error":"read_only"}';exit;}
        $cached=pp_read_compact($cfg,$action,$now,is_string($_GET['id']??null)?$_GET['id']:null);if($cached!==null){$out=$cached;}else{
        $state=pp_big_seed_apply(pp_read($cfg['storage_dir'].'/state.json'),$now);
        if($action==='bulletin')$out=s3_bulletin($state,$cfg,$now);
        elseif($action==='replay'){$id=$_GET['id']??'';if(!is_string($id)||!preg_match('/^[a-f0-9]{24}$/',$id))throw new InvalidArgumentException('Invalid fixture');$out=s3_replay($state,$id,$now);if(!$out){http_response_code(409);$out=['error'=>'prediction_not_ready'];}}
        elseif($action==='lineups'){$id=$_GET['id']??'';if(!is_string($id)||!preg_match('/^[a-f0-9]{24}$/',$id))throw new InvalidArgumentException('Invalid fixture');$p=$state['predictions'][$id]??null;if(!$p||!pp_released($p,$now))throw new InvalidArgumentException('Unknown fixture');$out=pp_players_snapshot($p,$cfg,$now);header('Cache-Control: no-store');}
        elseif($action==='report')$out=s3_report($state,$now);
        elseif($action==='daily'){$date=$_GET['date']??pp_bulletin_day($now);if(!pp_valid_date($date))throw new InvalidArgumentException('Invalid date');$out=pp_daily($state,$cfg,$date,$now);}
        elseif(in_array($action,['ucl-data','uefa-data'],true))$out=pp_ucl_dataset($state);
        elseif($action==='health')$out=pp_public_health($state,$cfg,$now);
        elseif($action==='teams'){$teams=[];foreach($state['matches']??[]as$m)foreach(['home','away']as$side){$t=$m[$side];if(!isset($teams[$t['id']]))$teams[$t['id']]=array_merge($t,['competitions'=>[],'completedMatches'=>0]);$teams[$t['id']]['competitions'][$m['competitionId']]=$m['competition'];if($m['result'])$teams[$t['id']]['completedMatches']++;}$out=['teams'=>array_values($teams),'generatedAt'=>$state['generatedAt']??null];}
        elseif($action==='archive'){$all=array_map(fn($m)=>pp_present_fixture($m,$now),array_values(array_filter($state['predictions']??[],fn($m)=>pp_released($m,$now))));usort($all,fn($a,$b)=>strcmp($b['date'],$a['date']));$out=['matches'=>array_slice($all,0,300),'total'=>count($all)];}
        else{http_response_code(404);$out=['error'=>'unknown_action'];}}
    }
    echo json_encode($out,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR);
}catch(InvalidArgumentException $e){http_response_code(400);echo '{"error":"invalid_request"}';}
catch(Throwable $e){http_response_code(503);echo '{"error":"temporarily_unavailable"}';}
