<?php
declare(strict_types=1);
const PP_LINEUP_SELECTION_VERSION=11;
function pp_lineup_natural_roles(array $p):array {
 $aliases=['G'=>'GK','DC'=>'CB','CD'=>'CB','DL'=>'LB','DR'=>'RB','WBL'=>'LWB','WBR'=>'RWB','DMC'=>'DM','CDM'=>'DM','MC'=>'CM','AMC'=>'AM','CAM'=>'AM','ML'=>'LM','MR'=>'RM','AML'=>'LW','AMR'=>'RW','CF'=>'ST','F'=>'FWD','D'=>'DEF','M'=>'MID'];
 $raw=$p['positionIdsDesc']??$p['naturalRoles']??$p['roles']??$p['position']??[];if(!is_array($raw))$raw=preg_split('/[,;\s\/]+/',strtoupper((string)$raw));$out=[];
 foreach($raw as$v){if(!is_scalar($v))continue;$v=strtoupper(trim((string)$v));$v=$aliases[$v]??$v;if(in_array($v,['GK','CB','LB','RB','LWB','RWB','DM','CM','AM','LM','RM','LW','RW','ST','DEF','MID','FWD'],true)&&!in_array($v,$out,true))$out[]=$v;}return $out;
}
function pp_lineup_role_cost(string $slot,array $roles):float {
 if(!$roles)return 10000;$primary=$roles[0];if($slot==='GK'||$primary==='GK')return $slot==='GK'&&$primary==='GK'?0:10000;
 $def=['CB','LB','RB','LWB','RWB','DEF'];if(in_array($slot,['LW','RW'],true)&&in_array($primary,$def,true))return 10000;
 $best=10000;foreach($roles as$i=>$r){$v=10000;if($slot===$r)$v=0;elseif($r==='DEF'&&in_array($slot,$def,true)||$r==='MID'&&in_array($slot,['DM','CM','AM','LM','RM'],true)||$r==='FWD'&&in_array($slot,['ST','LW','RW'],true))$v=3;else{foreach([['LB','LWB'],['RB','RWB'],['LW','LM'],['RW','RM'],['DM','CM'],['AM','CM']]as$group)if(in_array($slot,$group,true)&&in_array($r,$group,true)){$v=1;break;}if($v>=10000&&in_array($slot,['LW','RW'],true)&&in_array($r,['LW','RW'],true))$v=2;if($v>=10000&&in_array($slot,['ST','AM','LW','RW'],true)&&in_array($r,['ST','AM','LW','RW'],true))$v=5;}$best=min($best,$v+($i?2.5:0));}return $best;
}
// An uncertain return is not a confirmed absence. Preserve it as a penalized
// candidate and expose the uncertainty rather than silently selecting a youth.
function pp_lineup_doubtful(array $p):bool {
 $i=$p['injury']??null;$r=is_array($i)?($i['expectedReturn']??$i['status']??$i['type']??''):($p['expectedReturn']??$p['MTMR']??'');$r=strtolower((string)$r);return str_contains($r,'doubtful')||str_contains($r,'questionable')||str_contains($r,'şüpheli')||str_contains($r,'supheli');
}
function pp_lineup_out(array $p):bool {
 // Explicitly unavailable/suspended beats soft doubt. FotMob's coarse injured
 // flag also accompanies expectedReturn=Doubtful, so that flag alone is not
 // stronger evidence than the more specific uncertain-return classification.
 if(($p['available']??true)===false)return true;$statusValue=$p['availability']??$p['status']??'';$status=is_string($statusValue)?strtolower($statusValue):'';if(in_array($status,['out','unavailable','suspended','banned'],true))return true;
 if(!empty($p['IMTM'])&&!preg_match('/doubtful|questionable|şüpheli|supheli/ui',(string)($p['MTMR']??'')))return true;
 if(pp_lineup_doubtful($p))return false;return !empty($p['injury'])||!empty($p['injured'])||!empty($p['IMTM']);
}
function pp_lineup_fit(array $slots,array $pool,array $original):?array {
 $n=count($slots);$m=count($pool);if(!$n||$m<$n||$n>11||$m>80)return null;$in=array_fill_keys(array_map(fn($a)=>(string)$a['id'],$original),true);$cost=[];
 foreach($slots as$i=>$role)foreach($pool as$j=>$p){$rs=pp_lineup_natural_roles($p);$fit=pp_lineup_role_cost($role,$rs);if(!$rs&&($p['_role']??'')===$role)$fit=0;$same=(string)($original[$i]['id']??'')===(string)$p['id'];$recent=isset($in[(string)$p['id']]);$minutes=is_numeric($p['minutesPlayed']??$p['minutes']??null)?(float)($p['minutesPlayed']??$p['minutes']):0;$rating=is_numeric($p['rating']??null)?(float)$p['rating']:0;$starts=is_numeric($p['seasonStarts']??$p['starts']??null)?max(0,(float)($p['seasonStarts']??$p['starts'])):null;$apps=is_numeric($p['appearances']??null)?max(0,(float)$p['appearances']):null;$experience=min(900,($starts??0)*110)+min(80,($apps??0)*10)+min(90,max(0,$minutes)/10);$cost[$i+1][$j+1]=$fit>=10000?10000000:$fit*100+($same?0:($recent?100:300))-$experience-min(15,max(0,$rating))*2+(pp_lineup_doubtful($p)?220:0)+$j*.0001;}
 $u=array_fill(0,$n+1,0.0);$v=array_fill(0,$m+1,0.0);$p=array_fill(0,$m+1,0);$way=$p;
 for($i=1;$i<=$n;$i++){$p[0]=$i;$j0=0;$minv=array_fill(0,$m+1,INF);$used=array_fill(0,$m+1,false);do{$used[$j0]=true;$i0=$p[$j0];$delta=INF;$j1=0;for($j=1;$j<=$m;$j++)if(!$used[$j]){$cur=$cost[$i0][$j]-$u[$i0]-$v[$j];if($cur<$minv[$j]){$minv[$j]=$cur;$way[$j]=$j0;}if($minv[$j]<$delta){$delta=$minv[$j];$j1=$j;}}if(!is_finite($delta))return null;for($j=0;$j<=$m;$j++)if($used[$j]){$u[$p[$j]]+=$delta;$v[$j]-=$delta;}else$minv[$j]-=$delta;$j0=$j1;}while($p[$j0]!==0);do{$j1=$way[$j0];$p[$j0]=$p[$j1];$j0=$j1;}while($j0!==0);}
 $out=[];for($j=1;$j<=$m;$j++)if($p[$j]){if($cost[$p[$j]][$j]>=10000000)return null;$out[$p[$j]-1]=array_merge($pool[$j-1],['_role'=>$slots[$p[$j]-1]]);}ksort($out);return array_values($out);
}
