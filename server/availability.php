<?php
declare(strict_types=1);
/* Dated user-provided absence evidence. Confirmed match XI supersedes an estimate. */
function pp_availability_snapshot(array $snapshot,array $m):array{
 if(!empty($m['concept']))return $snapshot;$rules=pp_read(__DIR__.'/../assets/availability-overrides.json');
 foreach(['home','away']as$i=>$side){if(empty($snapshot['teams'][$i])||($snapshot['teams'][$i]['source']['status']??'')==='provider-lineup')continue;$t=&$snapshot['teams'][$i];$excluded=[];
 foreach($rules['entries']??[]as$r)if(pp_public_name($m[$side]['name']??'')===pp_public_name($r['team'])&&($m['date']??'')>=$r['from']&&($m['date']??'')<=$r['until'])$excluded[pp_public_name($r['name'])]=$r;
 $pool=array_merge($t['players']??[],$t['bench']??[]);foreach($pool as$p)if(pp_lineup_out($p))$excluded[pp_public_name($p['name'])]=['source'=>$p['availabilityEvidence']['source']??$t['source']['name']??'provider'];if(!$excluded){unset($t);continue;}$available=[];foreach($pool as$p){if(isset($excluded[pp_public_name($p['name'])])||pp_lineup_out($p))continue;$available[]=$p;}$changed=false;$xi=$t['players'];
 foreach($xi as$j=>$p)if(isset($excluded[pp_public_name($p['name'])])){$used=array_fill_keys(array_column($xi,'id'),true);$candidates=array_values(array_filter($available,fn($q)=>!isset($used[$q['id']])));$fit=pp_lineup_fit([$p['position']??$p['roles'][0]??'CB'],$candidates,[$p]);if(!$fit)continue;$q=$fit[0];$q['roles']=$p['roles'];$q['position']=$p['position'];$xi[$j]=$q;$changed=true;}
 if($changed){$t['players']=$xi;$t['source']['availabilityRepair']=['source'=>'dated-report-or-provider-absence','asOf'=>$rules['asOf']??null,'excluded'=>array_keys($excluded)];$t['source']['status']='estimated-availability-repair';}$used=array_fill_keys(array_column($t['players'],'id'),true);$t['bench']=array_values(array_filter($t['bench']??[],fn($p)=>!isset($used[$p['id']])&&!isset($excluded[pp_public_name($p['name'])])));unset($t);
 }return $snapshot;
}
