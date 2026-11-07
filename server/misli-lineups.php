<?php
declare(strict_types=1);
/* Public Misli application endpoints. No account, token, wagering or private API.
 * Club names, kickoff, competition and season must all match before importing XI. */
function pp_misli_json(string $url,array $cfg,DateTimeImmutable $now,?callable $fetcher=null):array {
 static $calls=0;
 if(!preg_match('~^https://(?:apivx\.misli\.com/api/web/v1/statistics/sport/SOCCER/matches/old\?fromdate=\d{13}|aggr\.misli\.com/api/web/match-stats/v1/match/\d{1,12}/lineups)$~D',$url))throw new RuntimeException('Invalid public lineup endpoint');
 $file=$cfg['storage_dir'].'/players-misli-'.hash('sha256',$url).'.json';$old=pp_read($file);$at=strtotime($old['fetchedAt']??'')?:0;$ttl=str_ends_with($url,'/lineups')?90:900;
 if($at&&$at<=$now->getTimestamp()&&$now->getTimestamp()-$at<$ttl)return $old;
 try{if(isset($cfg['_lineup_deadline'])&&microtime(true)>$cfg['_lineup_deadline']-1)throw new RuntimeException('Lineup deadline');if(++$calls>($cfg['players_misli_budget']??6))throw new RuntimeException('Public lineup budget');$net=$cfg;$net['source_hosts']=array_values(array_unique(array_merge($cfg['source_hosts']??[],['aggr.misli.com','apivx.misli.com'])));$net['request_timeout_seconds']=isset($cfg['_lineup_deadline'])?max(1,min(4,(int)($cfg['_lineup_deadline']-microtime(true)))):4;$net['max_download_bytes']=2500000;
  $doc=$fetcher?$fetcher($url,$net):pp_fetch($url,$net);if(!is_array($doc)||($doc['success']??false)!==true)throw new RuntimeException('Lineup unavailable');$out=['document'=>$doc,'fetchedAt'=>$now->format(DATE_ATOM),'url'=>$url,'stale'=>false];pp_write($file,$out);return $out;
 }catch(Throwable $e){pp_lineup_trace('Misli','unavailable',$e->getMessage());if($at&&$at<=$now->getTimestamp()&&$now->getTimestamp()-$at<21600)return array_merge($old,['stale'=>true]);throw $e;}
}
function pp_misli_competition(array $e,array $m):bool {
 $ids=['tr.1'=>584,'en.1'=>43,'de.1'=>45,'es.1'=>129,'it.1'=>143,'fr.1'=>381];$code=$m['competitionId']??'';if(isset($ids[$code]))return (int)($e['tournament']['id']??0)===$ids[$code];
 $cups=['ucl'=>'sampiyonlarligi','uel'=>'avrupaligi','uecl'=>'konferansligi'];$name=pp_public_name($e['tournament']['name']??'');return isset($cups[$code])&&str_contains($name,$cups[$code]);
}
function pp_misli_event(array $doc,array $m):?array {
 $kick=strtotime($m['kickoff']??'');if(!$kick)return null;$year=(int)gmdate('Y',$kick)-((int)gmdate('n',$kick)<7?1:0);$found=[];
 foreach($doc['data']['data']??[]as$e){if(($e['sportType']??'')!=='SOCCER'||!pp_misli_competition($e,$m)||abs((float)($e['date']??0)/1000-$kick)>=61||substr($e['stage']['name']??'',0,4)!==(string)$year||!preg_match('/^\d{1,12}$/',(string)($e['sgId']??'')))continue;
  $ok=true;foreach(['home','away']as$side)if(pp_public_name($e[$side.'Team']['name']??'')!==pp_public_name($m[$side]['name']??''))$ok=false;if($ok)$found[]=$e;
 }return count($found)===1?$found[0]:null;
}
function pp_misli_formation(array $starting):?string {
 if(count($starting)!==11)return null;$ys=[];$gk=0;foreach($starting as$p){if((int)($p['positionId']??0)===1){$gk++;continue;}if(!is_numeric($p['positionY']??null)||!is_numeric($p['positionX']??null))return null;$ys[]=(float)$p['positionY'];}if($gk!==1)return null;sort($ys);$bands=[];$last=null;
 foreach($ys as$y){if($last===null||$y-$last>8)$bands[]=1;else$bands[count($bands)-1]++;$last=$y;}$f=implode('-',$bands);return in_array($f,['4-2-3-1','4-3-3','4-4-2','4-1-4-1','4-3-1-2','4-3-2-1','3-5-2','3-4-3','4-4-1-1','4-2-2-2','5-3-2','5-4-1','3-4-2-1','3-4-1-2','3-1-4-2','4-5-1','4-2-1-3'],true)?$f:null;
}
function pp_misli_player(array $a,array $pool,string $team,string $season,string $role='MID'):?array {
 $name=trim((string)($a['name']??''));$number=$a['shirtNumber']??null;if(!$name||strlen($name)>160||!is_numeric($number)||(int)$number<0||(int)$number>999)return null;$number=(int)$number;$parts=preg_split('/\s+/u',$name);$last=pp_public_name((string)end($parts));$matches=[];
 foreach($pool as$p){$pn=$p['number']??$p['jersey']??null;if($pn===null||(int)$pn!==$number)continue;$full=$p['name']??$p['displayName']??$p['fullName']??'';$bits=preg_split('/\s+/u',$full);$same=pp_public_name($name)===pp_public_name($full)||$last!==''&&$last===pp_public_name((string)end($bits));if($same)$matches[(string)($p['id']??$full)]=$p;}
 $p=count($matches)===1?array_values($matches)[0]:[];$id=(string)($p['id']??('ms-'.$team.'-'.$season.'-'.$number));$full=$p['name']??$p['displayName']??$p['fullName']??$name;
 return array_merge($p,['id'=>$id,'name'=>$full,'shortName'=>$p['shortName']??$name,'number'=>$number,'roles'=>[$role],'position'=>$role,'naturalRoles'=>pp_lineup_natural_roles($p),'appearance'=>$p['appearance']??null,'portrait'=>$p['portrait']??(preg_match('/^(?:fm-)?\d{1,12}$/',$id)?'portrait.php?id='.$id:null),'identitySource'=>count($matches)===1?'current-roster-name-and-number':'Misli club-season-shirt identifier']);
}
function pp_misli_enrich(array $m,array $teams,array $cfg,DateTimeImmutable $now,?callable $fetcher=null):array {
 $kick=strtotime($m['kickoff']??'');if(!$kick)return $teams;
 try{$day=strtotime(gmdate('Y-m-d',$kick).'T00:00:00Z');$index=pp_misli_json('https://apivx.misli.com/api/web/v1/statistics/sport/SOCCER/matches/old?fromdate='.($day*1000),$cfg,$now,$fetcher);$event=pp_misli_event($index['document'],$m);if(!$event)return $teams;
  $doc=pp_misli_json('https://aggr.misli.com/api/web/match-stats/v1/match/'.$event['sgId'].'/lineups',$cfg,$now,$fetcher);$d=$doc['document']['data']??[];if(!is_bool($d['provisionalLineup']??null))return $teams;$actual=$d['provisionalLineup']===false;if(!$actual&&$now->getTimestamp()>=$kick)return $teams;
  foreach(['home','away']as$i=>$side){if(($teams[$i]['source']['status']??'')==='provider-lineup'&&!$actual)continue;if(($teams[$i]['source']['name']??'')==='Mackolik'&&($teams[$i]['source']['status']??'')==='provider-predicted'&&!$actual)continue;$raw=$d[$side.'Team']??[];if(pp_public_name($raw['name']??'')!==pp_public_name($m[$side]['name']??''))continue;
   $formation=pp_misli_formation($raw['starting']??[]);if(!$formation)continue;$rows=[];foreach($raw['starting']as$a)$rows[]=array_merge($a,['id'=>(string)$a['shirtNumber'],'verticalLayout'=>['x'=>(float)$a['positionX']/100,'y'=>(float)$a['positionY']/100]]);$rows=pp_public_roles($formation,$rows);if(!$rows)continue;
   $coach=$teams[$i]['coach']??null;$pool=array_merge($teams[$i]['players']??[],$teams[$i]['bench']??[]);try{$code=pp_players_code($m);$roster=pp_players_json('https://site.api.espn.com/apis/site/v2/sports/soccer/'.$code.'/teams/'.($m[$side]['espnId']??'').'/roster',$cfg,$now,$fetcher);if((string)($roster['team']['id']??'')===(string)($m[$side]['espnId']??'')){$currentCoach=pp_players_coach($roster['coach']??$roster['coaches']??[]);if($currentCoach){$currentCoach+=['asOf'=>$roster['_wosSource']['asOf']??$now->format(DATE_ATOM),'basis'=>'current-club'];$coach=$currentCoach;}foreach($roster['athletes']??[]as$p)$pool[]=['id'=>(string)$p['id'],'name'=>$p['displayName']??$p['fullName']??'','number'=>$p['jersey']??null,'roles'=>[pp_players_role($p['position']['abbreviation']??'')??'MID']];}}catch(Throwable $e){}
   $season=gmdate('Y',$kick);$players=[];$seen=[];foreach($rows as$a){$p=pp_misli_player($a,$pool,(string)$raw['teamId'],$season,$a['_role']);if(!$p||isset($seen[$p['id']])){$players=[];break;}$seen[$p['id']]=true;$players[]=$p;}if(count($players)!==11)continue;$bench=[];foreach($raw['bench']??[]as$a){$p=pp_misli_player($a,$pool,(string)$raw['teamId'],$season);if(!$p||isset($seen[$p['id']]))continue;$seen[$p['id']]=true;$bench[]=$p;}
   $teams[$i]=array_merge($teams[$i]??[],['teamId'=>(string)($m[$side]['espnId']??''),'formation'=>$formation,'coach'=>$coach,'players'=>$players,'bench'=>array_slice($bench,0,pp_bench_limit($m['competitionId']??'')),'source'=>['name'=>'Misli','status'=>$actual?'provider-lineup':'provider-predicted','selectionVersion'=>PP_LINEUP_SELECTION_VERSION,'selectionBasis'=>'exact-match-'.($actual?'confirmed':'probable'),'benchStatus'=>$actual?'match-bench':'provider-predicted-bench','asOf'=>$doc['fetchedAt'],'url'=>$doc['url'],'fixtureUrl'=>$index['url'],'providerMatchId'=>(string)$event['sgId'],'providerTeamId'=>(string)$raw['teamId'],'stale'=>$doc['stale']||$index['stale']]]);
  }
 }catch(Throwable $e){/* An unpublished lineup never erases another validated provider. */}return $teams;
}
