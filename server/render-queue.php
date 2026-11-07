<?php
declare(strict_types=1);
// The PHP host stores jobs and original bytes; an authenticated PC/VPS does the rendering.
require_once __DIR__.'/video-downloads.php';
function rq_key(array $cfg): string { $p=__DIR__.'/../render-config.php';$r=is_file($p)?require $p:[];$k=(string)($r['key']??$cfg['render_bridge_key']??'');return str_starts_with($k,'REPLACE-')?'':$k; }
function rq_root(array $cfg): string {$p=$cfg['storage_dir'].'/render-queue';if(!is_dir($p)&&!mkdir($p,0750,true)&&!is_dir($p))throw new RuntimeException('storage');return $p;}
function rq_auth(array $cfg,string $key): void {$expected=rq_key($cfg);if(strlen($expected)<24||!hash_equals($expected,$key))throw new UnexpectedValueException('key');}
function rq_id(string $id): void {if(!preg_match('/^[a-f0-9]{64}$/D',$id))throw new InvalidArgumentException('id');}
function rq_read(string $root,string $id): array {rq_id($id);$p=$root.'/'.$id.'.json';return is_file($p)?json_decode((string)file_get_contents($p),true,64,JSON_THROW_ON_ERROR):[];}
function rq_write(string $root,array $j): void {$p=tempnam($root,'rq-');try{if(file_put_contents($p,json_encode($j,JSON_THROW_ON_ERROR|JSON_UNESCAPED_UNICODE))===false||!rename($p,$root.'/'.$j['id'].'.json'))throw new RuntimeException('write');}finally{if(is_file($p))unlink($p);}}
function rq_public(array $j): array {return array_intersect_key($j,array_flip(['id','state','progress','created','updated','error','fileId','size','expires','sha256','metadata']));}
function rq_handle(array $cfg,string $action,array $b): array {
 $root=rq_root($cfg);$lock=fopen($root.'/.queue.lock','c');if(!$lock||!flock($lock,LOCK_EX))throw new RuntimeException('lock');
 try{
  $now=time();$worker=$root.'/worker.json';
  if($action==='health'){$w=is_file($worker)?json_decode((string)file_get_contents($worker),true):[];return ['enabled'=>strlen(rq_key($cfg))>=24,'online'=>$now-($w['at']??0)<45,'lastSeen'=>$w['at']??null];}
  if($action==='library'){$files=[];foreach(glob($root.'/*.json')?:[]as$p){$v=json_decode((string)file_get_contents($p),true);if(($v['state']??'')==='ready'&&($v['expires']??0)>$now)$files[]=rq_public($v);}usort($files,fn($a,$b)=>$b['updated']<=>$a['updated']);return ['files'=>array_slice($files,0,30)];}
  if($action==='publish'){$id=hash('sha256','published:'.($b['fileId']??''));$j=['id'=>$id,'state'=>'rendering','lease'=>'publish','created'=>$now,'updated'=>$now];$b['lease']='publish';$action='complete';rq_write($root,$j);$b['id']=$id;}
  if($action==='enqueue'){
   $recipe=$b['recipe']??null;$id=(string)($b['id']??'');rq_id($id);
   if(!is_array($recipe)||($recipe['version']??0)!==79||!is_array($recipe['payload']??null)||!is_array($recipe['options']??null))throw new InvalidArgumentException('recipe');
   $o=$recipe['options'];if(($o['fps']??0)!==60||!in_array($o['orientation']??'', ['portrait','landscape'],true)||!in_array($o['quality']??'', ['auto','1080'],true))throw new InvalidArgumentException('format');
   $j=rq_read($root,$id);if($j&&(in_array($j['state'],['queued','rendering'],true)||$j['state']==='ready'&&($j['expires']??0)>$now))return rq_public($j);
   $w=is_file($worker)?json_decode((string)file_get_contents($worker),true):[];if($now-(int)($w['at']??0)>=45)throw new RuntimeException('worker_offline');
   $count=0;foreach(glob($root.'/*.json')?:[]as$p){if(basename($p)==='worker.json')continue;$v=json_decode((string)file_get_contents($p),true);if(($v['created']??0)<$now-7*86400){unlink($p);continue;}if(in_array($v['state']??'',['queued','rendering'],true))$count++;}if($count>=20)throw new OverflowException('queue_full');
   $j=['id'=>$id,'state'=>'queued','progress'=>0,'created'=>$now,'updated'=>$now,'attempts'=>0,'recipe'=>$recipe];rq_write($root,$j);return rq_public($j);
  }
  if($action==='claim'){
   file_put_contents($worker,json_encode(['at'=>$now]));$list=[];
   foreach(glob($root.'/*.json')?:[]as$p){if(basename($p)==='worker.json')continue;$j=json_decode((string)file_get_contents($p),true);if(($j['state']??'')==='rendering'&&($j['leaseUntil']??0)<$now){$j['state']=($j['attempts']??0)<3?'queued':'failed';$j['error']='worker_disconnected';rq_write($root,$j);}if(($j['state']??'')==='queued')$list[]=$j;}
   usort($list,fn($a,$b)=>$a['created']<=>$b['created']);if(!$list)return ['job'=>null];$j=$list[0];$j['state']='rendering';$j['attempts']++;$j['lease']=bin2hex(random_bytes(24));$j['leaseUntil']=$now+120;$j['updated']=$now;rq_write($root,$j);return ['job'=>$j];
  }
  $id=(string)($b['id']??'');$j=rq_read($root,$id);if(!$j)throw new OutOfBoundsException('missing');
  if($action==='status'){if(($j['state']==='rendering'&&($j['leaseUntil']??0)+20<$now)||($j['state']==='queued'&&($j['created']??0)+600<$now)){$j['state']='failed';$j['error']='worker_disconnected';$j['updated']=$now;rq_write($root,$j);}return rq_public($j);}
  if(!isset($j['lease'])||!hash_equals($j['lease'],(string)($b['lease']??''))||$j['state']!=='rendering')throw new UnexpectedValueException('lease');
  if($action==='progress'){$j['progress']=max($j['progress'],min(.99,max(0,(float)($b['progress']??0))));$j['leaseUntil']=$now+120;file_put_contents($worker,json_encode(['at'=>$now]));}
  elseif($action==='complete'){$m=vd_read(vd_root($cfg),(string)($b['fileId']??''));vd_auth($m,(string)($b['uploadToken']??''));if(!$m['ready']||$m['mime']!=='video/mp4')throw new InvalidArgumentException('file');$meta=$b['metadata']??[];if(($meta['fps']??0)!==60||sort_dimensions($meta)!==[1080,1920])throw new InvalidArgumentException('resolution');$j['state']='ready';$j['progress']=1;$j['fileId']=$m['id'];$j['size']=$m['size'];$j['expires']=$m['expires'];$j['metadata']=$meta;$j['sha256']=hash_file('sha256',vd_root($cfg).'/'.$m['id'].'.mp4');unset($j['recipe']);}
  elseif($action==='fail'){$j['state']='failed';$j['error']=substr((string)($b['error']??'render_failed'),0,160);}
  else throw new InvalidArgumentException('action');
  $j['updated']=$now;rq_write($root,$j);return rq_public($j);
 }finally{flock($lock,LOCK_UN);fclose($lock);}
}
function sort_dimensions(array $m):array {$a=[(int)($m['width']??0),(int)($m['height']??0)];sort($a);return $a;}
