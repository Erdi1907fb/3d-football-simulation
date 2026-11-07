<?php
declare(strict_types=1);require __DIR__.'/server/lib.php';require __DIR__.'/server/week-forecast.php';
header('Content-Type: application/json; charset=utf-8');header('Cache-Control: no-store');header('X-Content-Type-Options: nosniff');
if(($_SERVER['REQUEST_METHOD']??'GET')!=='POST'){http_response_code(405);exit('{"error":"post_required"}');}
if(($_SERVER['HTTP_SEC_FETCH_SITE']??'')==='cross-site'){http_response_code(403);exit('{"error":"same_site_only"}');}
if(isset($_SERVER['HTTP_ORIGIN'])&&strcasecmp(parse_url($_SERVER['HTTP_ORIGIN'],PHP_URL_HOST)??'',explode(':',$_SERVER['HTTP_HOST']??'')[0])!==0){http_response_code(403);exit('{"error":"same_origin_required"}');}
try{$id=$_GET['competition']??'';if(!is_string($id)||!in_array($id,['tr.1','en.1','es.1','de.1','it.1','fr.1','ucl','uel','uecl'],true))throw new RuntimeException('Geçersiz organizasyon');$cfg=pp_config();echo json_encode(sw_prepare($cfg,$id,new DateTimeImmutable('now',new DateTimeZone('Europe/Istanbul'))),JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);}catch(Throwable $e){http_response_code(409);echo json_encode(['error'=>$e->getMessage()],JSON_UNESCAPED_UNICODE);}
