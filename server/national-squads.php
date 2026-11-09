<?php
declare(strict_types=1);
/* V137 self-updating national call-ups from Wikipedia ("Current squad" of each national team article).
   Editors update that section within hours of every federation announcement and cite it (e.g. TFF); it lists
   squad number, position, club and the window's match dates. Fetched as raw wikitext (index.php?action=raw,
   one request per team, cached 12 h, 6 h back-off on 429), only for teams with an upcoming international.
   Result: storage_dir/national-callups-live.json, same shape as assets/national-callups.json (editorial fallback). */
function pp_ns_page(string $catalogName):?string{
 static $special=['Türkiye'=>'Turkey_national_football_team','Italia'=>'Italy_national_football_team','Korea Republic'=>'South_Korea_national_football_team',
  'Côte d’Ivoire'=>'Ivory_Coast_national_football_team','Czechia'=>'Czech_Republic_national_football_team','China PR'=>'China_national_football_team',
  'Congo DR'=>'DR_Congo_national_football_team','Cabo Verde'=>'Cape_Verde_national_football_team','United States'=>"United_States_men's_national_soccer_team",
  'Canada'=>"Canada_men's_national_soccer_team",'Australia'=>"Australia_men's_national_soccer_team",'New Zealand'=>"New_Zealand_men's_national_football_team",
  'Republic of Ireland'=>'Republic_of_Ireland_national_football_team','Bosnia and Herzegovina'=>'Bosnia_and_Herzegovina_national_football_team'];
 if(isset($special[$catalogName]))return $special[$catalogName];if(!preg_match('/^[\p{L} .\'-]{2,40}$/u',$catalogName))return null;return str_replace(' ','_',$catalogName).'_national_football_team';
}
function pp_ns_clean(string $v):string{$v=preg_replace('/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/u','$1',$v);$v=preg_replace('/\{\{[^{}]*\}\}/u','',$v);$v=preg_replace('/<[^>]+>/u','',$v);return trim(html_entity_decode((string)$v,ENT_QUOTES|ENT_HTML5,'UTF-8'));}
/* Pure parser (tested offline). */
function pp_ns_parse(string $wikitext):?array{
 if(!preg_match('/===\s*Current squad\s*===(.*?)(?:\n===?[^=]|\z)/su',$wikitext,$m))return null;$sec=$m[1];
 $players=[];if(!preg_match_all('/\{\{\s*nat fs g player\s*\|(.*?)\}\}\s*(?=\{\{|\n|$)/su',$sec,$rows))return null;
 foreach($rows[1] as$row){$f=[];foreach(preg_split('/\|(?![^\[]*\]\])(?![^{]*\}\})/u',$row) as$part){if(!str_contains($part,'='))continue;[$k,$v]=array_map('trim',explode('=',$part,2));$f[strtolower($k)]=$v;}
  $name=pp_ns_clean($f['name']??'');if($name===''||mb_strlen($name)>80)continue;$pos=strtoupper(substr(pp_ns_clean($f['pos']??''),0,2));
  $players[]=['name'=>$name,'pos'=>in_array($pos,['GK','DF','MF','FW'],true)?$pos:null,'number'=>preg_match('/^\d{1,2}$/',trim($f['no']??''))?(int)trim($f['no']):null,'club'=>pp_ns_clean($f['club']??'')?:null,'caps'=>is_numeric($f['caps']??null)?(int)$f['caps']:null];}
 if(count($players)<11)return null;
 $intro=pp_ns_clean(strtok($sec,"\n")===false?'':substr($sec,0,1200));$dates=[];
 if(preg_match('/on\s+([\d ,and–-]+?)\s+([A-Z][a-z]+)\s+(\d{4})/u',$intro,$d)){$mon=date_parse($d[2])['month']??0;if($mon)foreach(preg_split('/[^\d]+/',$d[1],-1,PREG_SPLIT_NO_EMPTY) as$day)if((int)$day>=1&&(int)$day<=31)$dates[]=sprintf('%04d-%02d-%02d',(int)$d[3],$mon,(int)$day);}
 $coach=null;if(preg_match('/\|\s*(?:Head coach|Coach|Manager)\s*=\s*([^\n]+)/u',$wikitext,$c))$coach=pp_ns_clean($c[1])?:null;
 sort($dates);return ['players'=>$players,'dates'=>$dates,'coach'=>$coach,'intro'=>mb_substr($intro,0,300)];
}
/* Refresh the call-ups of teams with an international in the next 10 days. */
function pp_ns_update(array $cfg,array $matches,DateTimeImmutable $now,?callable $fetcher=null,int $budget=6):array{
 $dir=$cfg['storage_dir'];$file=$dir.'/national-callups-live.json';$live=pp_read($file)?:['version'=>1,'teams'=>[]];$nr=pp_nr_current($cfg);
 $back=pp_read($dir.'/national-callups-backoff.json');if(($back['until']??0)>$now->getTimestamp())return ['status'=>'backoff'];
 $want=[];$next=[];$limit=$now->modify('+10 days')->format('Y-m-d');foreach($matches as$m){if(!empty($m['result'])||($m['date']??'')<$now->format('Y-m-d')||($m['date']??'')>$limit)continue;
  foreach(['home','away'] as$s){$n=$m[$s]['name']??'';$id=(string)($m[$s]['espnId']??($nr['teams'][$n]['espnId']??''));if(isset($nr['teams'][$n])&&preg_match('/^\d{1,12}$/',$id)){$want[$id]=$n;$next[$id]=min($next[$id]??'9999',(string)$m['date']);}}}
 $done=0;$changed=0;
 foreach($want as$id=>$name){$old=$live['teams'][$id]??null;if($old&&$now->getTimestamp()-(strtotime($old['fetchedAt']??'')?:0)<(($old['provider']??'')==='transfermarkt'?6:12)*3600)continue;if($done>=$budget)break;
  // V145: Transfermarkt's national squad page (= latest federation call-up) first, Wikipedia as fallback.
  if(function_exists('pp_tm_callup')&&isset(pp_tm_map()[$name])){$done++;$validTo=(new DateTimeImmutable($next[$id]??$now->format('Y-m-d')))->modify('+1 day')->format('Y-m-d');$tm=pp_tm_callup($name,$cfg,$now,$validTo,$fetcher);if($tm){$tm['coach']=$old['coach']??null;$live['teams'][$id]=$tm;$changed++;continue;}if($done>=$budget)break;}
  $page=pp_ns_page($name);if(!$page)continue;$done++;
  $url='https://en.wikipedia.org/w/index.php?title='.rawurlencode($page).'&action=raw';
  try{$raw=$fetcher?$fetcher($url,$cfg):pp_fetch_raw($url,$cfg+['http_user_agent'=>'next90sim-squads/1.0 (football simulation; national call-ups once per 12h)']);}
  catch(Throwable $e){if(str_contains($e->getMessage(),'429'))pp_write($dir.'/national-callups-backoff.json',['until'=>$now->getTimestamp()+6*3600]);continue;}
  $p=is_string($raw)?pp_ns_parse($raw):null;if(!$p){$live['teams'][$id]=['name'=>$name,'missing'=>true,'fetchedAt'=>$now->format(DATE_ATOM)];$changed++;continue;}/* unparseable page: remember for 12 h, editorial file stays in use */
  $from=$p['dates']?(new DateTimeImmutable($p['dates'][0]))->modify('-12 days')->format('Y-m-d'):$now->modify('-1 day')->format('Y-m-d');$to=$p['dates']?(new DateTimeImmutable(end($p['dates'])))->modify('+1 day')->format('Y-m-d'):$now->modify('+10 days')->format('Y-m-d');
  $live['teams'][$id]=['name'=>$name,'validFrom'=>$from,'validTo'=>$to,'coach'=>$p['coach'],'players'=>array_map(fn($x)=>$x['name'],$p['players']),'squad'=>$p['players'],'dates'=>$p['dates'],'source'=>'Wikipedia: '.str_replace('_',' ',$page).' (Current squad) — '.$p['intro'],'sourceUrl'=>'https://en.wikipedia.org/wiki/'.$page,'fetchedAt'=>$now->format(DATE_ATOM)];$changed++;}
 if($changed)pp_write($file,$live);return ['status'=>'ok','fetched'=>$done,'updated'=>$changed,'teams'=>count($want)];
}
