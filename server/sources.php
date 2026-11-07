<?php
declare(strict_types=1);
require_once __DIR__.'/live-sources.php';
/* No-key fixture adapters: OpenFootball CC0 and OpenLigaDB ODbL. Keep unconfirmed times unknown. */
function pp_turkey_txt(string $raw, string $season): array {
    if (strlen($raw)>2500000 || !str_contains($raw,'Süper Lig')) throw new RuntimeException('Invalid Turkey fixture file');
    $year=(int)substr($season,0,4); $date=null; $time=null; $round=''; $rows=[]; $previousMonth=0;
    $months=['Jan'=>1,'Feb'=>2,'Mar'=>3,'Apr'=>4,'May'=>5,'Jun'=>6,'Jul'=>7,'Aug'=>8,'Sep'=>9,'Oct'=>10,'Nov'=>11,'Dec'=>12];
    foreach (preg_split('/\R/u',$raw) as $line) {
        if (preg_match('/^▪\s*(.+)$/u',trim($line),$m)) { $round=trim($m[1]); continue; }
        if (preg_match('/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+([A-Z][a-z]{2})\s+(\d{1,2})(?:\s+(\d{4}))?\s*$/',trim($line),$m)) {
            $month=$months[$m[1]]??0; if(!$month)continue;
            if(isset($m[3])&&$m[3]!=='')$year=(int)$m[3];elseif($previousMonth && $month<$previousMonth)$year++;
            $previousMonth=$month; $date=sprintf('%04d-%02d-%02d',$year,$month,(int)$m[2]); $time=null; continue;
        }
        if (!$date || !pp_valid_date($date)) continue;
        $row=trim($line); if ($row==='' || $row[0]==='(' || $row[0]==='#') continue;
        if(preg_match('/^(\d{2}:\d{2})\s+(.+)$/u',$row,$m)) { $time=$m[1];$row=$m[2]; }
        if (!preg_match('/^(.+?)\s{2,}(?:(\d{1,2})-(\d{1,2})(?:\s+\(\d+-\d+\))?|v)\s{2,}(.+?)\s*$/u',$row,$m)) continue;
        $value=['round'=>$round,'date'=>$date,'team1'=>trim($m[1]),'team2'=>trim($m[4])];
        if($time!==null)$value['time']=$time;
        if(($m[2]??'')!=='' && ($m[3]??'')!=='')$value['score']=['ft'=>[(int)$m[2],(int)$m[3]]];
        $rows[]=$value;
    }
    if(count($rows)<100 || count($rows)>2000)throw new RuntimeException('Incomplete Turkey parser output');
    return ['matches'=>$rows];
}
function pp_openliga_uefa(array $doc,string $season,string $url,string $competition,string $shortcut,int $minimum):array {
    if(!array_is_list($doc)||!$doc||count($doc)>2000)throw new RuntimeException('Invalid UEFA source');
    $year=(int)substr($season,0,4);$rows=[];$seen=[];
    $meta=['name'=>['ucl'=>'Şampiyonlar Ligi','uel'=>'Avrupa Ligi','uecl'=>'Konferans Ligi'][$competition],'timezone'=>'UTC'];
    foreach($doc as $raw){
        if(!is_array($raw)||($raw['leagueShortcut']??'')!==$shortcut||(int)($raw['leagueSeason']??0)!==$year)throw new RuntimeException('Wrong UEFA competition or season');
        $external=$raw['matchID']??null;
        if(!is_int($external)||$external<=0||isset($seen[$external]))throw new RuntimeException('Invalid or duplicate UEFA match id');
        $seen[$external]=true;
        $home=trim($raw['team1']['teamName']??'');$away=trim($raw['team2']['teamName']??'');
        $stamp=$raw['matchDateTimeUTC']??null;
        if(!is_string($stamp)||!preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/',$stamp))throw new RuntimeException('UEFA UTC kickoff missing');
        try{$dt=new DateTimeImmutable($stamp);}catch(Throwable $e){throw new RuntimeException('Invalid UEFA kickoff');}
        if((int)$dt->format('Y')<$year||(int)$dt->format('Y')>$year+1)throw new RuntimeException('UEFA date outside season');
        $round=trim($raw['group']['groupName']??'');
        $value=['round'=>$round,'date'=>$dt->format('Y-m-d'),'time'=>$dt->format('H:i'),'team1'=>$home,'team2'=>$away,'neutral'=>in_array(strtolower($round),['final','finale','finals'],true)];
        if(($raw['matchIsFinished']??false)===true){
            $results=$raw['matchResults']??[];$full=null;
            foreach($results as $r)if(($r['resultTypeKind']??'')==='After90Minutes'){$full=$r;break;}
            // Older OpenLigaDB seasons only supplied resultTypeID. Never use halftime or shootout scores.
            if($full===null)foreach($results as $r)if(!isset($r['resultTypeKind'])&&(int)($r['resultTypeID']??0)===2){$full=$r;break;}
            if($full===null)throw new RuntimeException('Finished UEFA match has no full-time result');
            $value['score']=['ft'=>[$full['pointsTeam1']??null,$full['pointsTeam2']??null]];
        }
        $normalized=pp_normalize(['matches'=>[$value]],$competition,$season,$meta,$url);
        if(count($normalized)!==1||(($raw['matchIsFinished']??false)&&!$normalized[0]['result']))throw new RuntimeException('Invalid UEFA match row');
        $m=$normalized[0];$m['id']=substr(hash('sha256','openligadb|'.$competition.'|'.$year.'|'.$external),0,24);
        $m['providerMatchId']=$external;$m['scheduleProvisional']=false;
        $m['source']=['name'=>'OpenLigaDB','url'=>$url,'license'=>'ODbL-1.0','licenseUrl'=>'https://opendatacommons.org/licenses/odbl/1-0/','providerMatchId'=>$external,'updatedAt'=>$raw['lastUpdateDateTime']??null];
        $rows[]=$m;
    }
    // Retain the last complete cache if the provider accidentally truncates a season.
    if($year>=2024&&count($rows)<$minimum)throw new RuntimeException('Incomplete UEFA season (league phase fixture count below configured minimum)');
    return $rows;
}
function pp_openliga_ucl(array $doc,string $season,string $url):array {return pp_openliga_uefa($doc,$season,$url,'ucl','ucl',144);}
function pp_source_jobs(array $cfg, DateTimeImmutable $now): array {
    $year=(int)$now->format('Y')-((int)$now->format('n')<7?1:0);
    $seasons=[$year.'-'.substr((string)($year+1),-2),($year-1).'-'.substr((string)$year,-2)];$jobs=[];
    foreach($seasons as $index=>$season)foreach($cfg['leagues'] as $league=>$meta){
        $txt=$league==='tr.1' && $index===0;
        $jobs[$season.'/'.$league]=['key'=>$season.'/'.$league,'url'=>$txt?'https://raw.githubusercontent.com/openfootball/europe/master/turkey/'.$season.'_tr1.txt':'https://raw.githubusercontent.com/openfootball/football.json/master/'.$season.'/'.$league.'.json','format'=>$txt?'turkey-txt':'json','league'=>$league,'season'=>$season,'meta'=>$meta,'current'=>$index===0,'interval'=>$index===0?(int)$cfg['refresh_seconds']:604800];
    }
    foreach(['ucl'=>['Şampiyonlar Ligi',144],'uel'=>['Avrupa Ligi',144],'uecl'=>['Konferans Ligi',108]] as $cup=>$details){
        if(!($cfg[$cup.'_enabled']??false))continue;
        foreach($seasons as $index=>$season){
            // Current EL/Conference feeds verified; no complete prior feed exists.
            if($index>0&&$cup!=='ucl')continue;
            $key=$season.'/'.$cup;$start=(int)substr($season,0,4);$shortcut=$cup==='ucl'?'ucl':$cup.$start;
            $jobs[$key]=['key'=>$key,'url'=>'https://api.openligadb.de/getmatchdata/'.$shortcut.'/'.$start,'format'=>'openligadb-uefa','league'=>$cup,'season'=>$season,'shortcut'=>$shortcut,'minimum'=>$details[1],'meta'=>['name'=>$details[0],'timezone'=>'UTC'],'current'=>$index===0,'interval'=>$index===0?(int)$cfg['refresh_seconds']:604800];
        }
    }
    if($cfg['normalized_feed_url'])$jobs['authorized']=['key'=>'authorized','url'=>$cfg['normalized_feed_url'],'format'=>'authorized','current'=>true,'interval'=>(int)$cfg['refresh_seconds']];
    return pp_live_jobs($cfg,$now)+$jobs;
}
function pp_result_watch(array $job,array $state,DateTimeImmutable $now):bool {
    if(!$job['current'])return false;
    $epoch=$now->getTimestamp();$today=$now->format('Y-m-d');
    foreach($state['sources'][$job['key']]['matches']??[] as $m){
        if($m['result'])continue;
        if($m['kickoff']){
            $kickoff=strtotime($m['kickoff']);
            if($epoch>=$kickoff+90*60&&$epoch<$kickoff+36*3600)return true;
        }elseif($m['date']<=$today&&$m['date']>=$now->modify('-1 day')->format('Y-m-d'))return true;
    }
    return false;
}
function pp_job_interval(array $job,array $state,array $cfg,DateTimeImmutable $now):int {
    return pp_result_watch($job,$state,$now)?min($job['interval'],(int)$cfg['result_refresh_seconds']):$job['interval'];
}
function pp_due_jobs(array $jobs, array $state, array $cfg, DateTimeImmutable $now): array {
    $due=[];$epoch=$now->getTimestamp();
    foreach($jobs as $key=>$job){$fetched=strtotime($state['sources'][$key]['fetchedAt']??'1970-01-01');$attempt=(int)($state['refreshAttempts'][$key]['epoch']??0);$failed=($state['refreshAttempts'][$key]['ok']??true)===false;
        $adapterChanged=isset($state['sources'][$key]['url'])&&$state['sources'][$key]['url']!==$job['url'];
        if($failed&&$epoch-$attempt<(int)$cfg['failure_retry_seconds'])continue;
        if(!$adapterChanged&&$epoch-$fetched<pp_job_interval($job,$state,$cfg,$now))continue;
        $due[$key]=$job+['fetchedEpoch'=>$fetched,'livePriority'=>in_array($job['format'],['espn-month','tff-week'],true),'resultPriority'=>pp_result_watch($job,$state,$now)];
    }
    uasort($due,fn($a,$b)=>($b['livePriority']<=>$a['livePriority'])?:($b['current']<=>$a['current'])?:($b['resultPriority']<=>$a['resultPriority'])?:($a['fetchedEpoch']<=>$b['fetchedEpoch']));return $due;
}
