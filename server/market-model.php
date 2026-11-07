<?php
declare(strict_types=1);
/* Fit all three normalized market outcomes, retaining the independent history prior. */
function pp_market_valid(array $odds):bool {
    foreach(['home','draw','away'] as $side)if(!isset($odds[$side])||!is_numeric($odds[$side])||!is_finite((float)$odds[$side])||$odds[$side]<1.01||$odds[$side]>1000)return false;
    $margin=1/$odds['home']+1/$odds['draw']+1/$odds['away'];
    return $margin>=.85&&$margin<=1.4;
}
function pp_market_fit(float $home,float $away,array $odds,float $blend=.65):array {
    if(!pp_market_valid($odds))return [$home,$away];
    $margin=1/$odds['home']+1/$odds['draw']+1/$odds['away'];$target=[];
    foreach(['home','draw','away']as$side)$target[$side]=(1/$odds[$side])/$margin;
    $priorTotal=$home+$away;$best=INF;$chosen=[$home,$away];
    $evaluate=function(float $h,float $a)use($target,$home,$away,&$best,&$chosen):void{
        if(min($h,$a)<.2||max($h,$a)>4.5)return;
        $p=pp_distribution($h,$a)['probabilities'];$loss=0;
        foreach($target as$k=>$v)$loss+=pow($p[$k]-$v,2);
        // Weak prior prevents unstable rates when the three-way market is inconsistent.
        $loss+=.0006*(pow(log($h/$home),2)+pow(log($a/$away),2));
        if($loss<$best){$best=$loss;$chosen=[$h,$a];}
    };
    for($total=1.;$total<=6.01;$total+=.5)for($share=.1;$share<=.9001;$share+=.1)$evaluate($total*$share,$total*(1-$share));
    foreach([.2,.08,.025]as$step){[$h,$a]=$chosen;foreach([-1,0,1]as$x)foreach([-1,0,1]as$y)$evaluate($h+$x*$step,$a+$y*$step);}
    // A market snapshot is evidence, not ground truth. Retain 35% of the history/context model.
    $blend=max(.15,min(.65,$blend));return [max(.2,min(4.5,$blend*$chosen[0]+(1-$blend)*$home)),max(.2,min(4.5,$blend*$chosen[1]+(1-$blend)*$away))];
}
