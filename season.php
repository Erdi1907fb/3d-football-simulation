<?php
declare(strict_types=1);require __DIR__.'/server/lib.php';require __DIR__.'/server/season-data.php';
header('Content-Type: application/json; charset=utf-8');header('X-Content-Type-Options: nosniff');header('Cache-Control: no-store');
try{echo json_encode(ss_get($_GET['competition']??'en.1',pp_config(),new DateTimeImmutable('now',new DateTimeZone('Europe/Istanbul'))),JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR);}catch(Throwable $e){http_response_code(409);echo json_encode(['error'=>$e->getMessage()],JSON_UNESCAPED_UNICODE);}
