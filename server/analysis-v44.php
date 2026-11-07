<?php
declare(strict_types=1);
/* New, unpublished fixtures only, from 24 October. Evidence is shrunk by sample
 * and age. No inferred injuries, xG, player skills or lineups are invented. */
function pp_analysis_v44(array $match,DateTimeImmutable $now):array {
    if(($match['date']??'')<'2026-10-24')return $match;
    $a=$match['analysis']??[];if(!isset($a['teams']))return $match;
    $a['version']='context-2.0-reliability';$a['weighting']=[];$adjust=[];
    foreach(['home','away']as$side){$t=$a['teams'][$side]??[];$recent=$t['recent']??[];$n=count($recent);$venue=$t['venueGoalForm']??[];$goals=$t['goalForm']??[];
        $last=$recent?strtotime($recent[0]['date'].'T23:59:59+03:00'):false;$age=$last?max(0,($now->getTimestamp()-$last)/86400):null;
        $reliability=$n/($n+7)*($age===null?0:exp(-$age/60));$vn=(int)($venue['matches']??0);$vWeight=$vn/($vn+9);
        $signal=0.0;if($n>=3&&isset($goals['weightedGoalsFor'],$goals['weightedGoalsAgainst']))$signal+=pp_analysis_clip(log(max(.25,(float)$goals['weightedGoalsFor'])/max(.25,(float)$goals['weightedGoalsAgainst'])),-1,1)*$reliability*.045;
        if($vn>=3&&isset($venue['weightedGoalsFor'],$venue['weightedGoalsAgainst']))$signal+=pp_analysis_clip(($venue['weightedGoalsFor']-$venue['weightedGoalsAgainst'])/3,-1,1)*$vWeight*.035;
        $rest=$t['restDays']??null;$congested=0;$kick=pp_analysis_time($match)??$now->getTimestamp();
        foreach($recent as$g){$stamp=strtotime($g['date'].'T12:00:00+03:00');if($stamp&&$stamp<$kick&&$kick-$stamp<=9*86400)$congested++;}
        if($rest!==null&&$rest<4)$signal-=min(.025,max(0,$congested-2)*.009);
        $adjust[$side]=$signal;$a['weighting'][$side]=['recentSample'=>$n,'recentReliability'=>round($reliability,4),'venueSample'=>$vn,'venueReliability'=>round($vWeight,4),'latestMatchAgeDays'=>$age===null?null:round($age,1),'matchesLastNineDays'=>$congested,'formSource'=>'verified-completed-results','modelCorrection'=>round(exp($signal),5)];
    }
    foreach(['home','away']as$side){$other=$side==='home'?'away':'home';$prior=(float)($a['contextFactors'][$side]??1);$a['contextFactors'][$side]=round(pp_analysis_clip($prior*exp($adjust[$side]-.30*$adjust[$other]),.84,1.16),5);}
    $a['coverage']['congestion']=min(count($a['teams']['home']['recent']??[]),count($a['teams']['away']['recent']??[]))>=3;$a['coverage']['reliabilityWeighting']=true;
    $a['unavailable']=array_values(array_unique(array_merge($a['unavailable']??[],['xG','xGA','verifiedPlayerPerformance','verifiedInjuries','verifiedSuspensions','verifiedTacticalStyle'])));
    $a['modelNote']='Reliability-weighted goal/venue history; opposition adjustment, rest and margin-normalized market use the existing validated pipeline. Unavailable signals excluded.';
    if($a['coverage']['providerH2h']??false){$a['version']='context-2.1-verified-h2h';$a['modelNote'].=' Additional verified head-to-head meetings are deduplicated, age-shrunk and weakly weighted.';}
    $a['uncertainty']=['scorePolicy'=>'most-likely-exact-score','exactScoreIsCertainty'=>false,'forcedVariety'=>false,'missingSignalsRemainUnavailable'=>true,'note'=>'The selected single score is the most likely exact score, not a guarantee; use the accompanying exact-score probability and full goal distribution.'];
    $match['analysis']=$a;$match['authorizedInputs']['contextFactors']=$a['contextFactors'];return $match;
}
