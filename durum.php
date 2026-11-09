<?php
declare(strict_types=1);
/* V139 server status page: shows why fixtures are (not) published and can collect the data now without cron.
   Read-only except the "collect" POST, which runs the same bounded refresh as cron.php (same-site only, locked). */
header('Cache-Control: no-store');header('X-Content-Type-Options: nosniff');
$fatal=null;try{require __DIR__.'/server/lib.php';$cfg=pp_config();}catch(Throwable $e){$fatal=$e;}
$esc=fn($v)=>htmlspecialchars((string)$v,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8');
if(($_GET['action']??'')==='collect'){
 header('Content-Type: application/json; charset=utf-8');
 if(($_SERVER['REQUEST_METHOD']??'')!=='POST'){http_response_code(405);echo '{"error":"post_required"}';exit;}
 if(($_SERVER['HTTP_SEC_FETCH_SITE']??'')==='cross-site'){http_response_code(403);echo '{"error":"same_site_only"}';exit;}
 if($fatal){http_response_code(500);echo json_encode(['error'=>$fatal->getMessage()],JSON_UNESCAPED_UNICODE);exit;}
 @set_time_limit(60);
 try{$tz=new DateTimeZone($cfg['timezone']);$now=new DateTimeImmutable('now',$tz);$state=pp_read($cfg['storage_dir'].'/state.json');
  $due=pp_due_jobs(pp_source_jobs($cfg,$now),$state,$cfg,$now);$run=$cfg;$run['_only_jobs']=array_slice(array_keys($due),0,4);unset($state);
  $t=microtime(true);$out=pp_update($run,false);$after=pp_read($cfg['storage_dir'].'/state.json');
  echo json_encode(['status'=>$out['status']??null,'fetched'=>$run['_only_jobs'],'pending'=>count(pp_due_jobs(pp_source_jobs($cfg,$now),$after,$cfg,$now)),'seconds'=>round(microtime(true)-$t,1),'matches'=>count($after['matches']??[]),'predictions'=>count($after['predictions']??[]),'errors'=>array_filter(array_map(fn($c)=>$c['error']??null,$after['health']['sourceChecks']??[]))],JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
 }catch(Throwable $e){http_response_code(500);echo json_encode(['error'=>$e->getMessage(),'where'=>basename($e->getFile()).':'.$e->getLine()],JSON_UNESCAPED_UNICODE);}
 exit;
}
header('Content-Type: text/html; charset=utf-8');
$rows=[];$add=function(string $k,$v,?bool $ok=null)use(&$rows){$rows[]=[$k,$v,$ok];};
$add('PHP sürümü',PHP_VERSION,PHP_VERSION_ID>=80100);$add('cURL',function_exists('curl_init')?'var':'yok',function_exists('curl_init'));
$add('allow_url_fopen',ini_get('allow_url_fopen')?'açık':'kapalı',null);$add('memory_limit',ini_get('memory_limit'),null);$add('max_execution_time',ini_get('max_execution_time'),null);
$state=null;$net=null;$sources=[];$byDay=[];$released=0;
if($fatal)$add('Sunucu kodu yüklenemedi',$fatal->getMessage().' — '.basename($fatal->getFile()).':'.$fatal->getLine(),false);
else{
 try{$dir=$cfg['storage_dir'];$add('Veri klasörü',realpath($dir)?:$dir,is_dir($dir));$add('Veri klasörü yazılabilir mi',is_writable($dir)?'evet':'HAYIR',is_writable($dir));
  $f=$dir.'/state.json';$add('state.json',is_file($f)?number_format(filesize($f)/1024,0).' KB · '.date('d.m.Y H:i',filemtime($f)):'yok',is_file($f)?is_writable($f):null);
  if(is_file($f)&&!is_writable($f))$add('state.json yazılabilir mi','HAYIR — sunucu yeni maçları kaydedemez (izinleri 644/755 yapın, sahibi aynı kullanıcı olsun)',false);
  $lock=$dir.'/update.lock';if(is_file($lock))$add('update.lock yazılabilir mi',is_writable($lock)?'evet':'HAYIR',is_writable($lock));
  $tz=new DateTimeZone($cfg['timezone']);$now=new DateTimeImmutable('now',$tz);$state=pp_schedule_seed_apply(pp_read($f),$now);
  $add('Kayıtlı maç / tahmin',count($state['matches']??[]).' / '.count($state['predictions']??[]),count($state['predictions']??[])>0);
  $sched=pp_read($dir.'/scheduler.json')['lastRunAt']??null;$add('Son cron çalışması',$sched?:'hiç (cron kurulu değil ya da çalışmıyor)',$sched&&time()-strtotime($sched)<900);
  $add('Son ziyaretçi yenilemesi',($state['webLastAttemptEpoch']??0)?date('d.m.Y H:i:s',(int)$state['webLastAttemptEpoch']):'hiç',null);
  $add('Bekleyen kaynak',count(pp_due_jobs(pp_source_jobs($cfg,$now),$state,$cfg,$now)),null);
  $day=pp_bulletin_day($now);for($i=0;$i<6;$i++){$d=(new DateTimeImmutable($day))->modify("+$i day")->format('Y-m-d');$byDay[$d]=['fixtures'=>0,'published'=>0];}
  foreach($state['matches']??[]as$m)if(isset($byDay[$m['date']]))$byDay[$m['date']]['fixtures']++;
  foreach($state['predictions']??[]as$p){if(isset($byDay[$p['date']]))$byDay[$p['date']]['published']++;if(pp_released($p,$now))$released++;}
  $add('Sitede yayında olan tahmin',$released,$released>0);
  foreach(pp_source_jobs($cfg,$now)as$key=>$job){$c=$state['health']['sourceChecks'][$key]??[];$sources[]=[$key,$c['status']??'waiting',$c['fetchedAt']??($state['sources'][$key]['fetchedAt']??null),$c['matches']??count($state['sources'][$key]['matches']??[]),$c['error']??''];}
 }catch(Throwable $e){$add('Durum okunamadı',$e->getMessage().' — '.basename($e->getFile()).':'.$e->getLine(),false);}
 try{$t=microtime(true);$doc=pp_fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.nations/scoreboard?dates='.date('Ym'),$cfg);$net=['ok'=>true,'ms'=>round((microtime(true)-$t)*1000),'n'=>count($doc['events']??[])];}
 catch(Throwable $e){$net=['ok'=>false,'ms'=>round((microtime(true)-$t)*1000),'error'=>$e->getMessage()];}
}
$mark=fn($ok)=>$ok===null?'':($ok?'<b class=ok>✓</b>':'<b class=bad>✗</b>');
?><!doctype html><html lang="tr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>next90sim · Sunucu durumu</title>
<style>body{font:15px/1.6 system-ui,Arial;background:#0c1d26;color:#e7f0f4;max-width:900px;margin:0 auto;padding:16px}h1{font-size:22px}table{border-collapse:collapse;width:100%;margin:10px 0 22px}th,td{text-align:left;padding:7px 8px;border-bottom:1px solid #2b4350;vertical-align:top;word-break:break-word}th{color:#9fc3d3;font-weight:600}.ok{color:#7ee0a5}.bad{color:#ff8a7a}button{font:inherit;font-weight:700;padding:13px 18px;border-radius:9px;border:0;background:#b3e6cf;color:#0f2a23;cursor:pointer;width:100%}#log{white-space:pre-wrap;background:#081218;border:1px solid #2b4350;border-radius:8px;padding:10px;font:13px/1.5 monospace;min-height:40px}small{color:#9fb6c1}</style>
<h1>Sunucu durumu</h1><p><small>Bu sayfanın ekran görüntüsünü gönderirsen sorunun nerede olduğu görünür. Veri dosyalarını değiştirmez; yalnız aşağıdaki düğme verileri toplar.</small></p>
<table><?php foreach($rows as[$k,$v,$ok])echo '<tr><th>'.$esc($k).'</th><td>'.$mark($ok).' '.$esc($v).'</td></tr>'; ?>
<?php if($net)echo '<tr><th>ESPN bağlantı testi (Uluslar Ligi)</th><td>'.$mark($net['ok']).' '.($net['ok']?$esc($net['n'].' maç · '.$net['ms'].' ms'):$esc(($net['error']??'').' · '.$net['ms'].' ms')).'</td></tr>'; ?></table>
<?php if($byDay){echo '<h2>Önümüzdeki günler</h2><table><tr><th>Gün</th><th>Bilinen maç</th><th>Hazır tahmin</th></tr>';foreach($byDay as$d=>$c)echo '<tr><td>'.$esc($d).'</td><td>'.$c['fixtures'].'</td><td>'.$c['published'].'</td></tr>';echo '</table>';} ?>
<h2>Verileri şimdi topla</h2><p><small>Cron kurulu değilse ya da maçlar görünmüyorsa bu düğmeye bas; sayfa kaynakları 4'er 4'er çeker ve bekleyen kalmayana kadar devam eder (birkaç dakika sürebilir).</small></p>
<button id="go" type="button">Verileri şimdi topla</button><div id="log"></div>
<?php if($sources){echo '<h2>Kaynaklar</h2><table><tr><th>Kaynak</th><th>Durum</th><th>Son çekim</th><th>Maç</th><th>Hata</th></tr>';foreach($sources as$s)echo '<tr><td>'.$esc($s[0]).'</td><td>'.$esc($s[1]).'</td><td>'.$esc($s[2]?substr((string)$s[2],0,16):'—').'</td><td>'.$esc($s[3]).'</td><td>'.$esc($s[4]).'</td></tr>';echo '</table>';} ?>
<script>
document.getElementById('go').onclick=async()=>{const b=document.getElementById('go'),log=document.getElementById('log');b.disabled=true;log.textContent='Başladı…\n';
 for(let i=0;i<20;i++){let r;try{const res=await fetch('durum.php?action=collect',{method:'POST',cache:'no-store'});r=await res.json();}catch(e){log.textContent+='Hata: '+e.message+'\n';break;}
  if(r.error){log.textContent+='Hata: '+r.error+(r.where?' ('+r.where+')':'')+'\n';break;}
  log.textContent+=`${i+1}. tur: ${r.status} · çekilen ${r.fetched.length} · bekleyen ${r.pending} · maç ${r.matches} · tahmin ${r.predictions} · ${r.seconds} sn\n`;
  const errs=Object.entries(r.errors||{});if(errs.length)log.textContent+='  Kaynak hataları: '+errs.slice(0,4).map(([k,v])=>k+': '+v).join(' | ')+'\n';
  if(!r.pending&&r.status!=='locked')break;if(r.status==='locked')await new Promise(x=>setTimeout(x,4000));}
 log.textContent+='Bitti. Ana sayfayı yenile.\n';b.disabled=false;};
</script></html>
