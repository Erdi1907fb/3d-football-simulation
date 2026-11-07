<?php
declare(strict_types=1);
require __DIR__.'/server/lib.php';require __DIR__.'/server/render-queue.php';
header('Content-Type: application/json; charset=utf-8');header('Cache-Control: no-store');header('X-Content-Type-Options: nosniff');header('Referrer-Policy: no-referrer');
try{$cfg=pp_config();$action=(string)($_GET['action']??'health');if($action==='health'&&($_SERVER['REQUEST_METHOD']??'GET')==='GET'){echo json_encode(rq_handle($cfg,'health',[]));exit;}if(($_SERVER['REQUEST_METHOD']??'GET')!=='POST'){http_response_code(405);exit;}
 rq_auth($cfg,(string)($_SERVER['HTTP_X_RENDER_KEY']??''));if(($_SERVER['HTTP_SEC_FETCH_SITE']??'')==='cross-site')throw new UnexpectedValueException('origin');
 $raw=file_get_contents('php://input',false,null,0,1048577);if(strlen($raw)>1048576)throw new LengthException('body');$b=json_decode($raw,true,64,JSON_THROW_ON_ERROR);if(!is_array($b))throw new InvalidArgumentException('body');echo json_encode(rq_handle($cfg,$action,$b),JSON_THROW_ON_ERROR);
}catch(Throwable $e){$code=$e instanceof UnexpectedValueException?403:($e instanceof OutOfBoundsException?404:($e instanceof OverflowException?429:($e instanceof InvalidArgumentException||$e instanceof JsonException||$e instanceof LengthException?400:503)));http_response_code($code);echo json_encode(['error'=>match($code){403=>'invalid_key',404=>'missing_job',429=>'queue_full',400=>'invalid_request',default=>'render_unavailable'}]);}
