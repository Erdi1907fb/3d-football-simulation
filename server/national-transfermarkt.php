<?php
declare(strict_types=1);
/* V145 national call-ups from Transfermarkt: the national team's "kader" page lists the latest federation call-up
   (verified for Türkiye, November 2026: identical to the TFF list). Parsed per row: name, line, detailed position,
   shirt number when published, captain, club. Fetched politely (cache 6 h, back-off on 403/405/429). */
function pp_tm_map():array{static $m=null;return $m??=pp_read(__DIR__.'/../assets/national-transfermarkt.json')['teams']??[];}
function pp_tm_parse(string $html):?array{
 if(!str_contains($html,'rn_nummer'))return null;$rows=preg_split('/<tr class="(?:odd|even)">/u',$html);array_shift($rows);$out=[];$seen=[];
 foreach($rows as$r){if(!preg_match('/<td class="hauptlink">\s*<a href="\/[^"]*\/profil\/spieler\/(\d+)">\s*([^<]+?)\s*(?:<span|<\/a>)/u',$r,$n))continue;$name=trim(html_entity_decode($n[2],ENT_QUOTES|ENT_HTML5,'UTF-8'));if($name===''||isset($seen[$n[1]]))continue;$seen[$n[1]]=true;
  $line=preg_match('/rueckennummer[^"]*"\s+title="([^"]+)"/u',$r,$t)?$t[1]:'';$pos=['Goalkeeper'=>'GK','Defender'=>'DF','Midfield'=>'MF','Attack'=>'FW'][$line]??null;
  $detail=preg_match('/<\/table>/u',$r)&&preg_match('/<tr>\s*<td>\s*([A-Za-z -]+?)\s*<\/td>\s*<\/tr>/u',$r,$d)?trim($d[1]):null;
  if(!$pos&&$detail)$pos=$detail==='Goalkeeper'?'GK':(str_contains($detail,'Back')?'DF':(str_contains($detail,'Midfield')?'MF':'FW'));
  $no=preg_match('/<div class=rn_nummer>(\d{1,2})<\/div>/u',$r,$x)?(int)$x[1]:null;$club=preg_match('/<td class="zentriert"><a title="([^"]+)" href="\/[^"]*\/startseite\/verein\//u',$r,$c)?html_entity_decode($c[1],ENT_QUOTES|ENT_HTML5,'UTF-8'):null;
  $out[]=['name'=>$name,'pos'=>$pos,'position'=>$detail,'number'=>$no,'captain'=>str_contains($r,'kapitaenicon'),'club'=>$club,'tmId'=>(int)$n[1]];}
 return count($out)>=18&&count($out)<=40?$out:null;
}
/* Returns a call-up entry (same shape as assets/national-callups.json teams) or null. */
function pp_tm_callup(string $name,array $cfg,DateTimeImmutable $now,string $validTo,?callable $fetcher=null):?array{
 $t=pp_tm_map()[$name]??null;if(!$t||!preg_match('/^[a-z0-9-]{2,60}$/',(string)$t['slug']))return null;$dir=$cfg['storage_dir'];
 $back=pp_read($dir.'/national-tm-backoff.json');if(($back['until']??0)>$now->getTimestamp())return null;
 $url='https://www.transfermarkt.com/'.$t['slug'].'/kader/verein/'.(int)$t['id'];
 try{$raw=$fetcher?$fetcher($url,$cfg):pp_fetch_raw($url,$cfg+['http_user_agent'=>'Mozilla/5.0 (compatible; next90sim/1.0; national call-ups twice a day)']);}
 catch(Throwable $e){if(preg_match('/40[35]|429/',$e->getMessage()))pp_write($dir.'/national-tm-backoff.json',['until'=>$now->getTimestamp()+2*3600]);return null;}
 $p=is_string($raw)?pp_tm_parse($raw):null;if(!$p)return null;
 return ['name'=>$name,'validFrom'=>$now->modify('-1 day')->format('Y-m-d'),'validTo'=>$validTo,'coach'=>null,'players'=>array_map(fn($x)=>$x['name'],$p),'squad'=>$p,'dates'=>[],'source'=>'Transfermarkt: '.$name.' current squad (federation call-up)','sourceUrl'=>$url,'fetchedAt'=>$now->format(DATE_ATOM),'provider'=>'transfermarkt'];
}
