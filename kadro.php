<?php
declare(strict_types=1);
/* V145 manual national call-up editor. Owner-only (password set on first use, stored as a hash in the private data
   folder). A saved list wins over Transfermarkt / Wikipedia / the editorial file until the team's next match is over.
   Optional: the starting XI (11 names). Nothing else on the server is changed. */
header('Cache-Control: no-store');header('X-Content-Type-Options: nosniff');header('Content-Type: text/html; charset=utf-8');
require __DIR__.'/server/lib.php';require_once __DIR__.'/server/player-lineups.php';
$cfg=pp_config();$dir=$cfg['storage_dir'];$tz=new DateTimeZone($cfg['timezone']);$now=new DateTimeImmutable('now',$tz);
$esc=fn($v)=>htmlspecialchars((string)$v,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8');$authFile=$dir.'/kadro-admin.json';$auth=pp_read($authFile);$msg='';$ok=false;
// Upcoming national matches (next 10 days) -> teams.
$state=pp_read($dir.'/state.json');$nr=pp_nr_current($cfg);$teams=[];$limit=$now->modify('+10 days')->format('Y-m-d');$today=$now->format('Y-m-d');
foreach($state['matches']??[]as$m){if(($m['date']??'')<$today||($m['date']??'')>$limit||!empty($m['result']))continue;foreach(['home','away']as$s){$n=$m[$s]['name']??'';$id=(string)($m[$s]['espnId']??($nr['teams'][$n]['espnId']??''));if(!isset($nr['teams'][$n])||!preg_match('/^\d{1,12}$/',$id))continue;$opp=$m[$s==='home'?'away':'home']['name']??'';$teams[$id]??=['name'=>$n,'matches'=>[]];$teams[$id]['matches'][]=['date'=>$m['date'],'kickoff'=>$m['kickoff']??null,'opp'=>$opp];}}
uasort($teams,fn($a,$b)=>strcmp($a['matches'][0]['date'].$a['name'],$b['matches'][0]['date'].$b['name']));
$sel=preg_match('/^\d{1,12}$/',(string)($_GET['team']??''))?(string)$_GET['team']:(string)(array_key_first($teams)??'');
if(($_SERVER['REQUEST_METHOD']??'')==='POST'){
 if(($_SERVER['HTTP_SEC_FETCH_SITE']??'')==='cross-site'){http_response_code(403);exit('same-site only');}
 $pw=(string)($_POST['password']??'');
 if(empty($auth['hash'])){if(mb_strlen($pw)<8)$msg='Şifre en az 8 karakter olmalı.';else{pp_write($authFile,['hash'=>password_hash($pw,PASSWORD_DEFAULT),'createdAt'=>$now->format(DATE_ATOM)]);$auth=pp_read($authFile);$msg='Şifre oluşturuldu. Bu şifreyi sakla; kaydetmek için gerekecek.';$ok=true;}}
 elseif(!password_verify($pw,(string)$auth['hash'])){usleep(800000);$msg='Şifre yanlış.';}
 elseif(isset($teams[$sel])){
  $file=$dir.'/national-callups-manual.json';$doc=pp_read($file)?:['version'=>1,'teams'=>[]];
  if(($_POST['action']??'')==='reset'){unset($doc['teams'][$sel]);pp_write($file,$doc);$msg='Elle girilen liste silindi; otomatik kaynak kullanılıyor.';$ok=true;}
  else{$squad=[];foreach(preg_split('/\R/u',(string)($_POST['squad']??''))as$line){$line=trim($line);if($line==='')continue;$parts=array_map('trim',explode('|',$line));$no=null;$pos=null;$name='';
    foreach($parts as$p){if(preg_match('/^\d{1,2}$/',$p))$no=(int)$p;elseif(preg_match('/^(GK|DF|MF|FW|K|D|O|F)$/iu',$p))$pos=['K'=>'GK','D'=>'DF','O'=>'MF','F'=>'FW'][mb_strtoupper($p)]??mb_strtoupper($p);elseif($p!=='')$name=$p;}
    if($name!==''&&mb_strlen($name)<=60)$squad[]=['name'=>$name,'pos'=>$pos,'number'=>$no];}
   $xi=array_values(array_filter(array_map('trim',preg_split('/\R/u',(string)($_POST['xi']??''))),fn($x)=>$x!==''));
   $names=array_map(fn($x)=>pp_public_name($x['name']),$squad);$last=fn($n)=>pp_public_name((string)(preg_split('/\s+/u',trim($n))?:[''])[count(preg_split('/\s+/u',trim($n)))-1]);$lasts=array_map(fn($x)=>$last($x['name']),$squad);$bad=array_filter($xi,fn($x)=>!in_array(pp_public_name($x),$names,true)&&count(array_keys($lasts,$last($x)))!==1);
   if(count($squad)<11||count($squad)>40)$msg='Kadroda 11 ile 40 arası oyuncu olmalı ('.count($squad).' girildi).';
   elseif($xi&&count($xi)!==11)$msg='İlk 11 ya boş bırakılmalı ya da tam 11 isim olmalı ('.count($xi).' girildi).';
   elseif($bad)$msg='İlk 11’deki şu isimler kadroda yok: '.implode(', ',$bad);
   else{$last=end($teams[$sel]['matches'])['date'];$doc['teams'][$sel]=['name'=>$teams[$sel]['name'],'validFrom'=>$now->modify('-1 day')->format('Y-m-d'),'validTo'=>(new DateTimeImmutable($last))->modify('+1 day')->format('Y-m-d'),'coach'=>trim((string)($_POST['coach']??''))?:null,'players'=>array_map(fn($x)=>$x['name'],$squad),'squad'=>$squad,'startXI'=>$xi,'formation'=>isset(pp_national_formations()[trim((string)($_POST['formation']??''))])?trim((string)$_POST['formation']):null,'source'=>'Elle girildi (kadro.php)','provider'=>'manual','updatedAt'=>$now->format(DATE_ATOM)];
    pp_write($file,$doc);$msg='Kaydedildi. Kadro hemen sitede geçerli ('.count($squad).' oyuncu'.($xi?', ilk 11 sabit':', ilk 11 otomatik').').';$ok=true;}}
 }
}
$cur=null;$curSource='';if(isset($teams[$sel])){$m0=['date'=>$teams[$sel]['matches'][0]['date'],'kickoff'=>$teams[$sel]['matches'][0]['kickoff']];$cur=pp_national_callup($sel,$m0);$curSource=$cur['source']??'—';}
$lines=[];foreach($cur['squad']??array_map(fn($n)=>['name'=>$n],$cur['players']??[])as$x)$lines[]=trim(($x['number']??'').' | '.$x['name'].' | '.($x['pos']??''),' |');
?><!doctype html><html lang="tr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>next90sim · Millî kadro</title>
<style>body{font:15px/1.55 system-ui,Arial;background:#0c1d26;color:#e7f0f4;max-width:820px;margin:0 auto;padding:16px}h1{font-size:22px}label{display:block;margin:14px 0 6px;color:#9fc3d3}select,input,textarea{width:100%;box-sizing:border-box;font:inherit;padding:11px;border-radius:8px;border:1px solid #3d5968;background:#091a24;color:#fff}textarea{min-height:300px;font:14px/1.5 ui-monospace,monospace}.row{display:flex;gap:10px;flex-wrap:wrap}.row button{flex:1}button{font:inherit;font-weight:700;padding:13px;border-radius:9px;border:0;background:#b3e6cf;color:#0f2a23;cursor:pointer}.sec{background:#1b3543;color:#fff}.msg{padding:12px;border-radius:8px;background:<?= $ok?'#1d4535':'#493b34' ?>}small{color:#9fb6c1}</style>
<h1>Millî takım aday kadrosu</h1>
<p><small>Otomatik kaynak (Transfermarkt → Wikipedia → TFF listesi) yanlışsa buradan düzelt. Kaydettiğin liste, takımın bu aradaki son maçı bitene kadar her şeyin önüne geçer: kadroda olmayan oyuncu 11’e de yedeğe de giremez.</small></p>
<?php if($msg)echo '<p class="msg">'.$esc($msg).'</p>'; ?>
<?php if(!$teams): ?><p>Önümüzdeki 10 günde millî maç bulunamadı.</p><?php else: ?>
<form method="get"><label>Takım</label><select name="team" onchange="this.form.submit()"><?php foreach($teams as$id=>$t)echo '<option value="'.$esc($id).'"'.($id===$sel?' selected':'').'>'.$esc($t['name'].' — '.implode(', ',array_map(fn($x)=>substr($x['date'],8,2).'.'.substr($x['date'],5,2).' '.$x['opp'],$t['matches']))).'</option>'; ?></select></form>
<form method="post" action="kadro.php?team=<?= $esc($sel) ?>">
<p><small>Şu anki kaynak: <?= $esc($curSource) ?></small></p>
<label>Aday kadro — her satıra bir oyuncu: <b>numara | isim | mevki</b> (GK, DF, MF, FW). Numara ve mevki boş kalabilir.</label>
<textarea name="squad"><?= $esc(implode("\n",$lines)) ?></textarea>
<label>İlk 11 (isteğe bağlı) — her satıra bir isim, tam 11 isim. Boş bırakırsan ilk 11 otomatik (BSD tahmini + kadro).</label>
<textarea name="xi" style="min-height:220px"><?= $esc(implode("\n",$cur['startXI']??[])) ?></textarea>
<label>Diziliş (isteğe bağlı, ör. 4-2-3-1, 4-3-3, 3-4-2-1)</label><input name="formation" value="<?= $esc($cur['formation']??'') ?>" placeholder="boş = otomatik">
<label>Teknik direktör</label><input name="coach" value="<?= $esc($cur['coach']??'') ?>">
<label><?= empty($auth['hash'])?'Yeni şifre belirle (ilk kullanım, en az 8 karakter)':'Şifre' ?></label><input type="password" name="password" autocomplete="current-password" required>
<div class="row" style="margin-top:16px"><button name="action" value="save">Kaydet</button><button class="sec" name="action" value="reset" onclick="return confirm('Elle girilen liste silinsin ve otomatik kaynağa dönülsün mü?')">Otomatiğe dön</button></div>
</form><?php endif; ?></html>
