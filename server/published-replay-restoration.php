<?php
declare(strict_types=1);
/* Restore the user's original, already published 1-3 scenario. This is not a
 * new probability model and never labels a selected exact score as certain. */
function pp_restoration_v96_target(array $m):bool {
    if(($m['date']??'')!=='2026-11-04'||!in_array($m['competitionId']??'', ['ucl','uefa.champions'],true))return false;
    $club=function(array $t,string $id,array $names):bool {
        if((string)($t['espnId']??'')===$id)return true;
        $s=strtolower(strtr((string)($t['name']??''),['Ç'=>'c','ç'=>'c','Ğ'=>'g','ğ'=>'g','İ'=>'i','ı'=>'i','Ö'=>'o','ö'=>'o','Ş'=>'s','ş'=>'s','Ü'=>'u','ü'=>'u']));
        return in_array(preg_replace('/[^a-z0-9]/','',$s),$names,true);
    };
    return $club($m['home']??[],'436',['fenerbahce','fenerbahcesk'])&&$club($m['away']??[],'364',['liverpool','liverpoolfc']);
}
function pp_replay_restoration_apply(array $state,DateTimeImmutable $now):array {
    static $snapshot=null;$snapshot??=pp_read(__DIR__.'/published-replay-v96.json');
    if(($snapshot['targetScore']??null)!==[1,3]||($snapshot['seed']??null)!==927387921||!pp_restoration_v96_target($snapshot['fixture']??[]))return $state;
    $ids=[];foreach(['matches','predictions']as$bucket)foreach($state[$bucket]??[]as$id=>$m)if(pp_restoration_v96_target($m)&&empty($m['result']))$ids[$id]=true;
    // An empty installation may recover this known advance publication before
    // kickoff. Never bootstrap an already played or unknown fixture.
    if(!$ids&&empty($state['matches'])&&$now->getTimestamp()<strtotime($snapshot['fixture']['kickoff'])){
        $id=$snapshot['fixture']['id'];$state['matches'][$id]=$snapshot['fixture'];$ids[$id]=true;
    }
    if(!$ids)return $state;
    $distribution=pp_distribution((float)$snapshot['expectedGoals']['home'],(float)$snapshot['expectedGoals']['away']);
    foreach(array_keys($ids)as$id){
        $existing=$state['predictions'][$id]??[];$fixture=$state['matches'][$id]??$existing;
        if(!empty($existing['result'])||!empty($fixture['result']))continue;
        $p=array_replace($snapshot['fixture'],$fixture,$existing);
        foreach(['expectedGoals','quality','analysis','scoreSelection','animationProfile']as$key)if(array_key_exists($key,$snapshot))$p[$key]=$snapshot[$key];
        $p['id']=$id;$p['seed']=$snapshot['seed'];$p['publishedScore']=['home'=>1,'away'=>3];
        $p['mostLikelyScore']=$distribution['mostLikelyScore'];$p['modelOdds']=$distribution['modelOdds'];$p['probabilities']=array_replace($distribution['probabilities'],$snapshot['goalProbabilities']??[]);
        $p['createdAt']=$snapshot['publishedAt'];$p['originalPublishedDate']=$snapshot['fixture']['date'];$p['engineVersion']='2.7.0';$p['context']=['venue'=>'home'];$p['forecastSource']=$existing['forecastSource']??$snapshot['fixture']['source'];
        $p['publicationRestoration']=['version'=>96,'kind'=>'original-published-replay','originalPublishedAt'=>$snapshot['publishedAt'],'restoredScore'=>[1,3],'certainty'=>false];
        $state['predictions'][$id]=$p;
    }
    $state['publicationRestorationVersion']=96;return $state;
}
