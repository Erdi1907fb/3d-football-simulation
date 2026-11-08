<?php
declare(strict_types=1);
// Classification is independent of scores, odds and forecast strength.
function pp_big_rules():array {static $rules=null;return $rules??=pp_read(__DIR__.'/../assets/big-match-rules.json');}
function pp_big_key(array $team):string {
    $name=pp_club_key($team);
    $extra=['Barcelona'=>'FC Barcelona','FC Bayern München'=>'Bayern München','Bayern Munich'=>'Bayern München','SSC Napoli'=>'Napoli','Juventus FC'=>'Juventus','Club Atlético de Madrid'=>'Atlético de Madrid','Atletico Madrid'=>'Atlético de Madrid','Lille'=>'LOSC Lille','LOSC'=>'LOSC Lille'];
    return $extra[$name]??$name;
}
function pp_big_match_info(array $m):?array {
    $rules=pp_big_rules();$league=$m['competitionId']??'';
    if(!array_key_exists($league,$rules['competitions']??[]))return null;
    $pair=[pp_big_key($m['home']??[]),pp_big_key($m['away']??[])];sort($pair);
    foreach($rules['derbies']??[]as$r){$teams=array_map(fn($n)=>pp_big_key(['name'=>$n]),$r['teams']);sort($teams);if($pair===$teams)return ['type'=>'derby','tr'=>$r['tr'],'en'=>$r['en']];}
    $top=$rules['competitions'][$league]??[];
    if(in_array($league,['ucl','uel','uecl'],true))$top=array_merge(...array_values($rules['competitions']));
    $top=array_unique(array_map(fn($n)=>pp_big_key(['name'=>$n]),$top));
    return count(array_intersect($pair,$top))===2?['type'=>'big','tr'=>'Büyük Maç','en'=>'Big Match']:null;
}
function pp_big_cancelled(array $m):bool {return in_array($m['providerStatus']??'',['STATUS_POSTPONED','STATUS_CANCELED','STATUS_CANCELLED','STATUS_ABANDONED'],true);}
function pp_publication_days(array $m):int {return 5;}
function pp_in_publication_window(array $m,DateTimeImmutable $now):bool {
    $today=pp_bulletin_day($now);$end=(new DateTimeImmutable($today,new DateTimeZone('Europe/Istanbul')))->modify('+'.pp_publication_days($m).' days')->format('Y-m-d');
    return ($m['date']??'')>=$today&&$m['date']<=$end&&!pp_big_cancelled($m);
}
// Verified release fixtures ship with the package for immediate review.
// Existing server identities/forecasts always take precedence; never reset state.
function pp_big_seed_apply(array $state,DateTimeImmutable $now):array {
    $state=pp_schedule_seed_apply($state,$now);
    $seed=pp_read(__DIR__.'/big-match-seed.json');$matches=$state['matches']??[];$predictions=$state['predictions']??[];
    foreach($seed['predictions']??[]as$p){
        if(!pp_in_publication_window($p,$now)||empty($p['kickoff'])||new DateTimeImmutable($p['kickoff'])<=$now)continue;
        $same=fn($m)=>($m['competitionId']??'')===$p['competitionId']&&pp_big_key($m['home'])===pp_big_key($p['home'])&&pp_big_key($m['away'])===pp_big_key($p['away'])&&abs(strtotime($m['date'])-strtotime($p['date']))<14*86400;
        $known=null;foreach($matches as$m)if($same($m)){$known=$m;break;}
        if($known&&(($known['result']??null)||pp_big_cancelled($known)||$known['date']!==$p['date']||strtotime($known['kickoff']??'')!==strtotime($p['kickoff'])))continue;
        $existing=false;foreach($predictions as$old)if($same($old)){$existing=true;break;}
        if($existing)continue;
        $id=$known['id']??$p['id'];$p['id']=$id;
        if($known){foreach(['source','date','kickoff','providerMatchId','espnEventId']as$key)if(array_key_exists($key,$known))$p[$key]=$known[$key];}
        $predictions[$id]=$p;
        if(!$known)$matches[$id]=array_diff_key($p,array_flip(['publishedScore','mostLikelyScore','analysis','probabilities','seed','quality','expectedGoals','inputSnapshot']));
    }
    $state['matches']=$matches;$state['predictions']=$predictions;return $state;
}

// Release-time verified schedule only. Existing server fixtures/results always win.
function pp_schedule_seed_apply(array $state,DateTimeImmutable $now):array {
 $state=pp_replay_restoration_apply($state,$now);
 $seed=pp_read(__DIR__.'/window-seed-v74.json');$at=strtotime($seed['generatedAt']??'');if(!$at||$at>$now->getTimestamp()||$now->getTimestamp()-$at>7*86400)return $state;
 $matches=$state['matches']??[];$pairs=[];foreach($matches as$m)$pairs[pp_fixture_identity($m)][]=$m;
 foreach($seed['matches']??[]as$m){if(!pp_in_publication_window($m,$now)||!empty($m['result'])||strtotime($m['kickoff']??'')<=$now->getTimestamp()||isset($matches[$m['id']]))continue;
  $known=false;foreach($pairs[pp_fixture_identity($m)]??[]as$other)if(abs(strtotime($other['date'])-strtotime($m['date']))<14*86400){$known=true;break;}if($known)continue;
  $m['source']['cached']=$now->getTimestamp()-$at>1800;$matches[$m['id']]=$m;
 }
 foreach($seed['history']??[]as$m){if(empty($m['result'])||strtotime($m['kickoff']??'')+9000>$now->getTimestamp()||isset($matches[$m['id']])||($m['source']['basis']??'')!=='validated-complete-season')continue;$known=false;foreach($pairs[pp_fixture_identity($m)]??[]as$other)if(abs(strtotime($other['date'])-strtotime($m['date']))<14*86400){$known=true;break;}if($known)continue;$m['source']['cached']=true;$matches[$m['id']]=$m;}
 $state['matches']=$matches;return $state;
}
