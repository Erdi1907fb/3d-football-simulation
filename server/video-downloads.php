<?php
declare(strict_types=1);
// Temporary, byte-preserving video delivery. Nothing here changes forecasts.
function vd_root(array $cfg): string {
    $root=$cfg['storage_dir'].'/video-exports';
    if(!is_dir($root)&&!mkdir($root,0750,true)&&!is_dir($root))throw new RuntimeException('storage');
    return $root;
}
function vd_id(string $id): void {if(!preg_match('/^[a-f0-9]{32}$/D',$id))throw new InvalidArgumentException('id');}
function vd_read(string $root,string $id): array {
    vd_id($id);$p=$root.'/'.$id.'.json';$m=is_file($p)?json_decode((string)file_get_contents($p),true):null;
    if(!is_array($m)||$m['expires']<time())throw new OutOfBoundsException('expired');return $m;
}
function vd_write(string $root,array $m): void {
    $tmp=tempnam($root,'vd-');if(!$tmp)throw new RuntimeException('storage');
    try{if(file_put_contents($tmp,json_encode($m,JSON_THROW_ON_ERROR))===false||!rename($tmp,$root.'/'.$m['id'].'.json'))throw new RuntimeException('storage');chmod($root.'/'.$m['id'].'.json',0640);}finally{if(is_file($tmp))unlink($tmp);}
}
function vd_lock(string $root,string $id) {
    vd_id($id);$h=fopen($root.'/'.$id.'.lock','c');if(!$h||!flock($h,LOCK_EX))throw new RuntimeException('lock');return $h;
}
function vd_unlock($h): void {flock($h,LOCK_UN);fclose($h);}
function vd_auth(array $m,string $token): void {if(!hash_equals($m['secret'],hash('sha256',$token)))throw new UnexpectedValueException('token');}
function vd_public(array $m): array {return ['id'=>$m['id'],'size'=>$m['size'],'offset'=>$m['offset'],'ready'=>$m['ready'],'expires'=>$m['expires']];}
function vd_create(array $cfg,int $size,string $name,string $mime,string $owner): array {
    if($size<12||$size>(int)($cfg['video_export_max_bytes']??1073741824))throw new LengthException('size');
    if(!in_array($mime,['video/mp4','video/webm','application/zip'],true))throw new InvalidArgumentException('type');
    $root=vd_root($cfg);$pool=fopen($root.'/.pool.lock','c');if(!$pool||!flock($pool,LOCK_EX))throw new RuntimeException('lock');
    try{$used=0;$pending=0;foreach(glob($root.'/*.json')?:[] as $p){$m=json_decode((string)file_get_contents($p),true);$id=basename($p,'.json');if(!preg_match('/^[a-f0-9]{32}$/D',$id))continue;
        if(!is_array($m)||($m['expires']??0)<time()){$h=vd_lock($root,$id);try{foreach(['.part','.mp4','.webm','.zip','.json']as$ext)if(is_file($root.'/'.$id.$ext))unlink($root.'/'.$id.$ext);}finally{vd_unlock($h);}continue;}
        $used+=$m['size'];if($m['owner']===$owner&&!$m['ready'])$pending++;
    }
    // Reservations include unfinished uploads, so concurrent requests cannot fill the disk.
    if($pending>=3||$used+$size>(int)($cfg['video_export_pool_bytes']??8589934592))throw new OverflowException('busy');
    $free=@disk_free_space($root);if($free!==false&&$free<$size+67108864)throw new OverflowException('space');
    $id=bin2hex(random_bytes(16));$token=bin2hex(random_bytes(24));$ext=$mime==='video/mp4'?'mp4':($mime==='video/webm'?'webm':'zip');
    $name=preg_replace('/[^a-zA-Z0-9._-]/','-',basename($name));$name=substr($name?:'SEKME-video',0,180);if(!str_ends_with(strtolower($name),'.'.$ext))$name.='.'.$ext;
    $m=['id'=>$id,'secret'=>hash('sha256',$token),'owner'=>$owner,'name'=>$name,'mime'=>$mime,'ext'=>$ext,'size'=>$size,'offset'=>0,'ready'=>false,'expires'=>time()+(int)($cfg['video_export_ttl_seconds']??172800)];
    if(file_put_contents($root.'/'.$id.'.part','')===false)throw new RuntimeException('storage');chmod($root.'/'.$id.'.part',0640);vd_write($root,$m);return vd_public($m)+['token'=>$token];
    }finally{vd_unlock($pool);}
}
function vd_status(array $cfg,string $id,string $token): array {$m=vd_read(vd_root($cfg),$id);vd_auth($m,$token);return vd_public($m);}
function vd_chunk(array $cfg,string $id,string $token,int $offset,string $bytes,string $digest): array {
    $root=vd_root($cfg);$h=vd_lock($root,$id);
    try{$m=vd_read($root,$id);vd_auth($m,$token);$n=strlen($bytes);
        if($m['ready']||$offset<0||$n<1||$n>2097152||$offset+$n>$m['size']||!hash_equals(hash('sha256',$bytes),$digest))throw new InvalidArgumentException('chunk');
        $p=$root.'/'.$id.'.part';$fp=fopen($p,'c+b');if(!$fp)throw new RuntimeException('storage');
        try{if($offset<$m['offset']){if($offset+$n>$m['offset']||fseek($fp,$offset)!==0||!hash_equals(hash('sha256',(string)fread($fp,$n)),$digest))throw new DomainException('offset');return vd_public($m);}
            if($offset!==$m['offset'])throw new DomainException('offset');
            // The metadata is the commit point. A retry overwrites an uncommitted tail.
            if(!ftruncate($fp,$offset)||fseek($fp,$offset)!==0)throw new RuntimeException('storage');$written=0;while($written<$n){$w=fwrite($fp,substr($bytes,$written));if(!$w)throw new RuntimeException('storage');$written+=$w;}fflush($fp);
            $m['offset']+=$n;vd_write($root,$m);return vd_public($m);
        }finally{fclose($fp);}
    }finally{vd_unlock($h);}
}
function vd_finish(array $cfg,string $id,string $token): array {
    $root=vd_root($cfg);$h=vd_lock($root,$id);
    try{$m=vd_read($root,$id);vd_auth($m,$token);if($m['ready'])return vd_public($m);$p=$root.'/'.$id.'.part';clearstatcache(true,$p);
        // Recover a finalize request interrupted after rename but before metadata commit.
        $final=$root.'/'.$id.'.'.$m['ext'];if(!is_file($p)&&is_file($final)&&filesize($final)===$m['size']){$m['ready']=true;vd_write($root,$m);return vd_public($m);}
        if($m['offset']!==$m['size']||!is_file($p)||filesize($p)!==$m['size'])throw new DomainException('incomplete');
        $fp=fopen($p,'rb');$head=fread($fp,12);fclose($fp);
        if(($m['ext']==='mp4'&&substr($head,4,4)!=='ftyp')||($m['ext']==='webm'&&substr($head,0,4)!=="\x1a\x45\xdf\xa3")||($m['ext']==='zip'&&substr($head,0,4)!=="PK\x03\x04"))throw new InvalidArgumentException('format');
        if(!rename($p,$root.'/'.$id.'.'.$m['ext']))throw new RuntimeException('storage');$m['ready']=true;vd_write($root,$m);return vd_public($m);
    }finally{vd_unlock($h);}
}
// Returns inclusive byte endpoints, or null for a full response. Reject multi-range.
function vd_range(?string $range,int $size): ?array {
    if($range===null||$range==='')return null;
    if(!preg_match('/^bytes=(\d*)-(\d*)$/D',$range,$m)||($m[1]===''&&$m[2]===''))throw new RangeException('range');
    if($m[1]===''){$n=(int)$m[2];if($n<1)throw new RangeException('range');$a=max(0,$size-$n);$b=$size-1;}
    else{$a=(int)$m[1];$b=$m[2]===''?$size-1:min($size-1,(int)$m[2]);if($a>=$size||$b<$a)throw new RangeException('range');}
    return [$a,$b];
}
function vd_file(array $cfg,string $id,string $method): void {
    $root=vd_root($cfg);$m=vd_read($root,$id);$path=$root.'/'.$id.'.'.$m['ext'];if(!$m['ready']||!is_file($path))throw new OutOfBoundsException('missing');
    $etag='"'.$id.'-'.$m['size'].'"';$range=$_SERVER['HTTP_RANGE']??null;if(isset($_SERVER['HTTP_IF_RANGE'])&&$_SERVER['HTTP_IF_RANGE']!==$etag)$range=null;
    header('Content-Type: '.$m['mime']);header('Content-Disposition: attachment; filename="'.$m['name'].'"');header('Accept-Ranges: bytes');header('ETag: '.$etag);header('Cache-Control: private, max-age=21600, no-transform');header('X-Content-Type-Options: nosniff');header('X-Accel-Buffering: no');
    try{$r=vd_range($range,$m['size']);}catch(RangeException $e){http_response_code(416);header('Content-Range: bytes */'.$m['size']);header('Content-Length: 0');return;}
    [$a,$b]=$r??[0,$m['size']-1];if($r){http_response_code(206);header('Content-Range: bytes '.$a.'-'.$b.'/'.$m['size']);}header('Content-Length: '.($b-$a+1));
    if($method==='HEAD')return;@ini_set('zlib.output_compression','0');@set_time_limit(0);while(ob_get_level()>0)ob_end_clean();
    $fp=fopen($path,'rb');if(!$fp)throw new RuntimeException('storage');try{fseek($fp,$a);$left=$b-$a+1;while($left>0&&!connection_aborted()){$bytes=fread($fp,min(524288,$left));if($bytes===false||$bytes==='')break;echo $bytes;$left-=strlen($bytes);flush();}}finally{fclose($fp);}
}
