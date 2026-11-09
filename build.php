<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');header('Cache-Control: no-store');header('CDN-Cache-Control: no-store');
$release=json_decode((string)file_get_contents(__DIR__.'/assets/release-v141.json'),true);$mismatches=[];
foreach($release['files'] as $file=>$hash){$path=__DIR__.'/'.$file;if(!is_file($path)||!hash_equals($hash,(string)hash_file('sha256',$path)))$mismatches[]=$file;}
echo json_encode(['build'=>141,'filesMatch'=>!$mismatches,'mismatches'=>$mismatches],JSON_UNESCAPED_SLASHES);
