<?php
declare(strict_types=1);
require __DIR__.'/server/lib.php';
require_once __DIR__.'/server/video-downloads.php';
$method=$_SERVER['REQUEST_METHOD']??'GET';$action=$_GET['action']??'capabilities';
header('X-Content-Type-Options: nosniff');header('Referrer-Policy: no-referrer');
try{
    if(!is_string($action))throw new InvalidArgumentException('action');$cfg=pp_config();
    if($action==='file'){
        if(!in_array($method,['GET','HEAD'],true)){http_response_code(405);header('Allow: GET, HEAD');exit;}
        vd_file($cfg,(string)($_GET['id']??''),$method);exit;
    }
    header('Content-Type: application/json; charset=utf-8');header('Cache-Control: no-store');
    if($action==='capabilities'&&$method==='GET'){$root=vd_root($cfg);$out=['supported'=>is_writable($root),'chunkBytes'=>2097152,'maxBytes'=>(int)($cfg['video_export_max_bytes']??1073741824)];}
    else{
        if($method!=='POST'){http_response_code(405);header('Allow: POST');exit;}
        $origin=$_SERVER['HTTP_ORIGIN']??null;$host=$_SERVER['HTTP_HOST']??'';$scheme=(!empty($_SERVER['HTTPS'])&&$_SERVER['HTTPS']!=='off')?'https':'http';
        if(($_SERVER['HTTP_SEC_FETCH_SITE']??'')==='cross-site'||($origin!==null&&strcasecmp(rtrim($origin,'/'),$scheme.'://'.$host)!==0))throw new UnexpectedValueException('origin');
        $id=(string)($_GET['id']??'');$token=(string)($_SERVER['HTTP_X_UPLOAD_TOKEN']??'');
        if($action==='chunk'){
            $offset=filter_var($_GET['offset']??null,FILTER_VALIDATE_INT);if($offset===false)throw new InvalidArgumentException('offset');
            $input=fopen('php://input','rb');$bytes=stream_get_contents($input,2097153);fclose($input);if($bytes===false)throw new RuntimeException('input');
            $out=vd_chunk($cfg,$id,$token,$offset,$bytes,(string)($_SERVER['HTTP_X_CHUNK_SHA256']??''));
        }elseif($action==='create'){
            $raw=file_get_contents('php://input',false,null,0,4097);if(strlen($raw)>4096)throw new InvalidArgumentException('body');$body=json_decode($raw,true,32,JSON_THROW_ON_ERROR);
            $owner=hash('sha256',($_SERVER['REMOTE_ADDR']??'unknown').'|'.__DIR__);$out=vd_create($cfg,(int)($body['size']??0),(string)($body['name']??''),(string)($body['mime']??''),$owner);
        }elseif($action==='status')$out=vd_status($cfg,$id,$token);
        elseif($action==='finish')$out=vd_finish($cfg,$id,$token);
        else throw new InvalidArgumentException('action');
    }
    echo json_encode($out,JSON_THROW_ON_ERROR);
}catch(Throwable $e){
    $code=$e instanceof UnexpectedValueException?403:($e instanceof OutOfBoundsException?410:($e instanceof DomainException?409:($e instanceof OverflowException?507:($e instanceof LengthException?413:($e instanceof InvalidArgumentException||$e instanceof JsonException?400:503)))));
    http_response_code($code);header('Content-Type: application/json');header('Cache-Control: no-store');echo json_encode(['error'=>match($code){403=>'forbidden',410=>'expired',409=>'offset',507=>'storage_busy',413=>'file_too_large',400=>'invalid_request',default=>'temporarily_unavailable'}]);
}
