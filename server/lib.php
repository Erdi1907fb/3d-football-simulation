<?php
declare(strict_types=1);
require_once __DIR__.'/sources.php';
require_once __DIR__.'/analysis.php';
require_once __DIR__.'/analysis-v44.php';
require_once __DIR__.'/forecast-lock.php';
require_once __DIR__.'/published-replay-restoration.php';
require_once __DIR__.'/market-model.php';
require_once __DIR__.'/passing-profiles.php';
require_once __DIR__.'/read-cache.php';
require_once __DIR__.'/player-lineups.php';
require_once __DIR__.'/big-matches.php';

function pp_config(): array {
    $cfg = require __DIR__ . '/defaults.php';
    $local = __DIR__ . '/../config.php';
    if (is_file($local)) $cfg = array_replace($cfg, require $local);
    // One calendar window for list, publication and replay, including existing installs.
    $cfg['publish_ahead_days'] = 5;
    $cfg['big_match_ahead_days'] = 5;
    $cfg['publication_policy'] = '3d-v74-all-fixtures-six-day-window';
    $cfg['live_sources_enabled'] = true;
    $cfg['mackolik_enabled'] = false;
    $cfg['source_hosts'] = array_values(array_unique(array_merge($cfg['source_hosts'],['site.api.espn.com','www.tff.org','www.fotmob.com'])));
    if (!is_dir($cfg['storage_dir']) && !mkdir($cfg['storage_dir'], 0750, true)) throw new RuntimeException('Storage could not be created');
    return $cfg;
}
function pp_read(string $path, array $fallback = []): array {
    if (!is_file($path)) return $fallback;
    $raw = file_get_contents($path);
    if ($raw === false) return $fallback;
    try { $obj = json_decode($raw, true, 512, JSON_THROW_ON_ERROR); return is_array($obj) ? $obj : $fallback; }
    catch (JsonException $e) { return $fallback; }
}
function pp_write(string $path, array $value): void {
    $tmp = tempnam(dirname($path), 'pp-');
    if ($tmp === false) throw new RuntimeException('Temporary file could not be created');
    try {
        $raw = json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR);
        if (file_put_contents($tmp, $raw, LOCK_EX) === false) throw new RuntimeException('Write failed');
        chmod($tmp, 0640);
        if (!rename($tmp, $path)) throw new RuntimeException('Atomic rename failed');
    } finally { if (is_file($tmp)) unlink($tmp); }
}
// Calendar fixtures switch at midnight; archive settlement remains separate at 06:00.
function pp_bulletin_day(DateTimeImmutable $clock):string {
    return $clock->setTimezone(new DateTimeZone('Europe/Istanbul'))->format('Y-m-d');
}
function pp_date_only_deadline(array $match):DateTimeImmutable {
    return new DateTimeImmutable($match['date'].'T12:00:00+03:00');
}
function pp_team(string $name): array {
    $name=trim($name);$aliases=['FC Arsenal'=>'Arsenal FC','FC Liverpool'=>'Liverpool FC','Manchester City'=>'Manchester City FC','Real Madrid'=>'Real Madrid CF','Atletico Madrid'=>'Club Atlético de Madrid','Inter Mailand'=>'FC Internazionale Milano','AS Rom'=>'AS Roma','Paris St. Germain'=>'Paris Saint-Germain FC','Galatasaray Istanbul'=>'Galatasaray','Fenerbahçe SK'=>'Fenerbahçe','FC Brügge'=>'Club Brugge','FK Bodö/Glimt'=>'Bodø/Glimt','Feyenoord Rotterdam'=>'Feyenoord','Slavia Prag'=>'Slavia Praha','AEK Athen'=>'AEK Athens','SSC Napoli'=>'SSC Napoli','Atiker Konyaspor'=>'Konyaspor','Kasimpasa'=>'Kasımpaşa','Gençlerbirligi'=>'Gençlerbirliği','Aytemiz Alanyaspor'=>'Alanyaspor','İstanbul Başakşehir'=>'Başakşehir','Amed'=>'Amed SK','BB Erzurumspor'=>'Erzurumspor FK','Çorum'=>'Çorum FK'];$name=$aliases[$name]??$name;
    return ['id'=>substr(hash('sha256',$name),0,16),'name'=>$name];
}
function pp_match_id(string $league, string $season, string $home, string $away, string $round): string {
    // Deliberately excludes date: rescheduling must not regenerate a published prediction.
    return substr(hash('sha256', "$league|$season|$home|$away|$round"), 0, 24);
}
function pp_fetch_raw(string $url, array $cfg): string {
    $parts = parse_url($url);
    $host = strtolower($parts['host'] ?? '');
    if (($parts['scheme'] ?? '') !== 'https' || isset($parts['user']) || isset($parts['pass']) || (isset($parts['port']) && $parts['port'] !== 443) || !in_array($host, $cfg['source_hosts'], true)) throw new RuntimeException('Feed host is not authorized');
    if (function_exists('curl_init')) {
        $body=''; $agent=$cfg['http_user_agent']??'WoS-PulsePitch/1.0 (CC0 fixture cache)'; $ch=curl_init($url);
        if ($ch===false) throw new RuntimeException('Source initialization failed');
        curl_setopt_array($ch,[CURLOPT_ENCODING=>'',CURLOPT_FOLLOWLOCATION=>false,CURLOPT_CONNECTTIMEOUT=>(int)$cfg['request_timeout_seconds'],CURLOPT_TIMEOUT=>(int)$cfg['request_timeout_seconds'],CURLOPT_SSL_VERIFYPEER=>true,CURLOPT_SSL_VERIFYHOST=>2,CURLOPT_PROTOCOLS=>CURLPROTO_HTTPS,CURLOPT_USERAGENT=>$agent,CURLOPT_HTTPHEADER=>['Accept: application/json'],CURLOPT_WRITEFUNCTION=>function($handle,string $chunk) use (&$body,$cfg):int {if(strlen($body)+strlen($chunk)>$cfg['max_download_bytes'])return 0;$body.=$chunk;return strlen($chunk);}]);
        try {
            if (curl_exec($ch)===false) throw new RuntimeException('Source transfer failed');
            if ((int)curl_getinfo($ch,CURLINFO_HTTP_CODE)!==200) throw new RuntimeException('Source HTTP '.curl_getinfo($ch,CURLINFO_HTTP_CODE));
            return $body;
        } finally { curl_close($ch); }
    }
    // Redirects disabled: a trusted host may not redirect into private services.
    $ctx = stream_context_create(['http' => ['timeout' => $cfg['request_timeout_seconds'], 'ignore_errors' => true, 'follow_location' => 0, 'user_agent' => $cfg['http_user_agent']??'WoS-PulsePitch/1.0 (CC0 fixture cache)', 'header' => "Accept: application/json\r\n"], 'ssl' => ['verify_peer' => true, 'verify_peer_name' => true]]);
    $fh = @fopen($url, 'rb', false, $ctx);
    if ($fh === false) throw new RuntimeException('Source connection failed');
    try {
        $meta = stream_get_meta_data($fh);
        $headers = $meta['wrapper_data'] ?? [];
        if (!preg_match('/^HTTP\/\S+ 200\b/', $headers[0] ?? '')) throw new RuntimeException('Source HTTP error: ' . ($headers[0] ?? 'unknown'));
        $raw = stream_get_contents($fh, (int)$cfg['max_download_bytes'] + 1);
        if ($raw === false || strlen($raw) > $cfg['max_download_bytes']) throw new RuntimeException('Source exceeds size limit');
        return $raw;
    } finally { fclose($fh); }
}
function pp_fetch(string $url, array $cfg): array {
    $obj=json_decode(pp_fetch_raw($url,$cfg),true,64,JSON_THROW_ON_ERROR);
    if(!is_array($obj))throw new RuntimeException('JSON object required');return $obj;
}
function pp_valid_date($date): bool {
    if (!is_string($date) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) return false;
    $d = DateTimeImmutable::createFromFormat('!Y-m-d', $date); return $d && $d->format('Y-m-d') === $date;
}
function pp_normalize(array $doc, string $league, string $season, array $meta, string $url): array {
    if (!isset($doc['matches']) || !is_array($doc['matches']) || count($doc['matches']) > 2000) throw new RuntimeException('Invalid matches array');
    $out = [];
    foreach ($doc['matches'] as $m) {
        if (!is_array($m) || !pp_valid_date($m['date'] ?? null)) continue;
        $home = $m['team1'] ?? ''; $away = $m['team2'] ?? '';
        if (!is_string($home) || !is_string($away) || trim($home) === '' || trim($away) === '' || $home === $away || strlen($home) > 120 || strlen($away) > 120) continue;
        $home=pp_team($home)['name'];$away=pp_team($away)['name'];$kickoff = null; $date = $m['date'];
        if (isset($m['time']) && preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $m['time'])) {
            $dt = new DateTimeImmutable($date . ' ' . $m['time'], new DateTimeZone($meta['timezone']));
            $kickoff = $dt->format(DATE_ATOM); $date = pp_bulletin_day($dt);
        }
        $ft = $m['score']['ft'] ?? null;
        $result = is_array($ft) && count($ft) === 2 && is_int($ft[0]) && is_int($ft[1]) && min($ft) >= 0 && max($ft) <= 30 ? ['home' => $ft[0], 'away' => $ft[1]] : null;
        $out[] = ['id' => pp_match_id($league, $season, $home, $away, (string)($m['round'] ?? '')), 'date' => $date, 'kickoff' => $kickoff, 'competition' => $meta['name'], 'competitionId' => $league, 'season' => $season, 'round' => (string)($m['round'] ?? ''), 'home' => pp_team($home), 'away' => pp_team($away), 'result' => $result, 'source' => ['name' => 'OpenFootball CC0', 'url' => $url], 'sourceTimezone' => $meta['timezone'], 'timeConfirmed'=>$kickoff!==null, 'neutral'=>($m['neutral']??false)===true];
    }
    if (!$out) throw new RuntimeException('No valid fixtures');
    return $out;
}
function pp_poisson(float $lambda, int $max = 18): array {
    $out = [exp(-$lambda)]; for ($k = 1; $k <= $max; $k++) $out[] = $out[$k - 1] * $lambda / $k;
    return $out;
}
function pp_distribution(float $h, float $a): array {
    $ph = pp_poisson($h); $pa = pp_poisson($a); $p = ['home' => 0.0, 'draw' => 0.0, 'away' => 0.0, 'over25' => 0.0, 'over35' => 0.0, 'over45' => 0.0, 'over55' => 0.0, 'btts' => 0.0]; $best = -1.0; $score = ['home' => 0, 'away' => 0]; $sum = 0.0; $totals = array_fill(0, 37, 0.0);
    foreach ($ph as $i => $hp) foreach ($pa as $j => $ap) {
        $v = $hp * $ap; $sum += $v; $totals[$i+$j] += $v; $p[$i > $j ? 'home' : ($i === $j ? 'draw' : 'away')] += $v;
        if($i+$j>2)$p['over25']+=$v;if($i+$j>3)$p['over35']+=$v;if($i+$j>4)$p['over45']+=$v;if($i+$j>5)$p['over55']+=$v; if ($i > 0 && $j > 0) $p['btts'] += $v;
        if ($v > $best) { $best = $v; $score = ['home' => $i, 'away' => $j]; }
    }
    foreach ($p as &$v) $v /= $sum; unset($v);
    return ['probabilities' => $p, 'goalDistribution'=>array_map(fn($v)=>$v/$sum,$totals), 'scoreSelection'=>['policy'=>'most-likely-exact-score','probability'=>$best/$sum,'forcedHighScores'=>false], 'mostLikelyScore' => $score, 'modelOdds' => ['home' => round(1 / $p['home'], 2), 'draw' => round(1 / $p['draw'], 2), 'away' => round(1 / $p['away'], 2), 'label' => 'MODEL']];
}
function pp_scenario_score(float $h,float $a,int $seed):array {
 $ph=pp_poisson($h,10);$pa=pp_poisson($a,10);$sum=array_sum($ph)*array_sum($pa);$u=(hexdec(substr(hash('sha256','score-scenario-v72|'.$seed),0,8))+.5)/4294967296;$cursor=0.;$selected=['home'=>10,'away'=>10];$prob=0.;
 foreach($ph as$i=>$hp)foreach($pa as$j=>$ap){$v=$hp*$ap/$sum;$cursor+=$v;if($cursor>=$u){$selected=['home'=>$i,'away'=>$j];$prob=$v;break 2;}}
 return ['score'=>$selected,'selection'=>['policy'=>'seeded-predictive-scenario','probability'=>$prob,'forcedHighScores'=>false,'note'=>'One reproducible model-weighted scenario, not the modal exact-score estimate.']];
}
function pp_club_key(array $team):string {
    static $aliases=null;
    if($aliases===null)$aliases=pp_read(__DIR__.'/../assets/club-aliases.json');
    $name=$team['name']??$team['id']??'';return $aliases[$name]??$name;
}
function pp_forecast(array $match, array $history, DateTimeImmutable $now): array {
    $cutoff = $match['kickoff'] ? new DateTimeImmutable($match['kickoff']) : new DateTimeImmutable($match['date'] . ' 06:00:00', new DateTimeZone('Europe/Istanbul'));
    // Only data from before publication and before kick-off may influence the model.
    if ($cutoff > $now) $cutoff = $now;
    $stats=[];$leagueH=0.0;$leagueA=0.0;$weight=0.0;$games=0;$valid=[];$means=[];$seen=[];
    foreach($history as $m){
        if(!$m['result'])continue;
        $date=!empty($m['kickoff'])?(new DateTimeImmutable($m['kickoff']))->modify('+150 minutes'):new DateTimeImmutable($m['date'].' 23:59:59',new DateTimeZone('Europe/Istanbul'));
        $days=($cutoff->getTimestamp()-$date->getTimestamp())/86400;
        if($days<=0||$days>550)continue;
        $key=$m['competitionId'].'|'.pp_club_key($m['home']).'|'.pp_club_key($m['away']).'|'.(!empty($m['kickoff'])?pp_bulletin_day(new DateTimeImmutable($m['kickoff'])):$m['date']);
        if(isset($seen[$key]))continue;$seen[$key]=true;
        $w=pow(0.5,$days/120);$r=$m['result'];$comp=$m['competitionId'];$valid[]=[$m,$w];
        if(!isset($means[$comp]))$means[$comp]=['goals'=>0.0,'weight'=>0.0];
        $means[$comp]['goals']+=$w*($r['home']+$r['away']);$means[$comp]['weight']+=2*$w;
        if($comp===$match['competitionId']){$leagueH+=$w*$r['home'];$leagueA+=$w*$r['away'];$weight+=$w;$games++;}
    }
    // Pool verified club aliases across competitions; normalize each competition's goal environment.
    // Other competitions receive less weight. No absent squad/market input is fabricated.
    foreach($valid as [$m,$w]){
        $comp=$m['competitionId'];$r=$m['result'];$meanGoals=($means[$comp]['goals']+1.34*30)/($means[$comp]['weight']+30);
        if($comp!==$match['competitionId'])$w*=.65;
        if($comp==='intl')$w*=.5; // V132: friendlies count, at half weight
        foreach(['home','away']as$side){$id=pp_club_key($m[$side]);$other=$side==='home'?'away':'home';
            if(!isset($stats[$id]))$stats[$id]=['w'=>0.0,'gf'=>0.0,'ga'=>0.0,'n'=>0];
            $stats[$id]['w']+=$w;$stats[$id]['gf']+=$w*$r[$side]/$meanGoals;$stats[$id]['ga']+=$w*$r[$other]/$meanGoals;$stats[$id]['n']++;
        }
    }
    $baseH=($leagueH+1.5*15)/($weight+15);$baseA=($leagueA+1.18*15)/($weight+15);
    $ratings=[];
    foreach(['home','away']as$side){
        $s=$stats[pp_club_key($match[$side])]??['w'=>0.0,'gf'=>0.0,'ga'=>0.0,'n'=>0];
        $ratings[$side]=['attack'=>($s['gf']+8)/($s['w']+8),'defence'=>($s['ga']+8)/($s['w']+8),'matches'=>$s['n']];
    }
    $h = max(0.2, min(4.5, $baseH * $ratings['home']['attack'] * $ratings['away']['defence']));
    $a = max(0.2, min(4.5, $baseA * $ratings['away']['attack'] * $ratings['home']['defence']));
    if($match['neutral']??false){$factor=sqrt($baseH/$baseA);$h/=$factor;$a*=$factor;}
    $inputs = ['weightedResults' => true, 'goalTailAudit'=>true, 'marketOdds' => false, 'squads' => false,'context'=>false];
    if (isset($match['authorizedInputs'])) {
        $in = $match['authorizedInputs'];
        if(isset($in['contextFactors'])){foreach(['home','away']as$side){$v=$in['contextFactors'][$side]??1;if(!is_numeric($v)||!is_finite((float)$v))$v=1;$v=max(.8,min(1.2,(float)$v));if($side==='home')$h*=$v;else $a*=$v;}$inputs['context']=true;}
        // Squad factors represent provider-supplied relative strength multipliers.
        if (isset($in['squadFactors'])) { $h *= $in['squadFactors']['home']; $a *= $in['squadFactors']['away']; $inputs['squads'] = true; }
        if(isset($in['marketOdds'])&&pp_market_valid($in['marketOdds'])){$blend=.65;if(($match['date']??'')>='2026-10-24'){$evidence=$match['analysis']??[];$rel=min((float)($evidence['weighting']['home']['recentReliability']??0),(float)($evidence['weighting']['away']['recentReliability']??0));$stamp=strtotime($evidence['market']['capturedAt']??'');$age=$stamp?max(0,$now->getTimestamp()-$stamp):21600;$blend=max(.15,min(.60,(.30+.30*$rel)*exp(-$age/43200)));}$inputs['marketWeight']=round($blend,4);[$h,$a]=pp_market_fit($h,$a,$in['marketOdds'],$blend);$inputs['marketOdds']=true;}
    }
    // V132 national-team model: assets/national-ratings.json (tools/national-ratings.py) - Elo from World Cup,
    // every confederation's WC qualifiers, continental finals + qualifiers, Nations Leagues and (lightly) friendlies,
    // plus decaying title bonus, recent form and squad quality (club ratings of the national roster). It carries 70%
    // of the expected goals; the recent internationals inside this model (friendlies at half weight) carry 30%.
    if(in_array($match['competitionId']??'',['unl','intl'],true)){static $nr=null,$nat=null;if($nr===null)$nr=pp_read(__DIR__.'/../assets/national-ratings.json');if($nat===null)$nat=pp_read(__DIR__.'/../assets/national-teams.json');
     $th=$nr['teams'][$match['home']['name']]??null;$ta=$nr['teams'][$match['away']['name']]??null;
     if($th&&$ta){$sq=fn($t)=>isset($t['squad']['rating'])?(float)$t['squad']['rating']:null;$fm=fn($t)=>isset($t['form'])?(float)$t['form']:1.35;
      $dr=(float)$th['elo']-(float)$ta['elo']+(($match['neutral']??false)?0:80);
      if($sq($th)!==null&&$sq($ta)!==null)$dr+=($sq($th)-$sq($ta))*120;   // 0.1 squad-rating points ~ 12 Elo
      $dr+=($fm($th)-$fm($ta))*25;                                         // short-term form
      $total=max(1.9,min(3.4,$baseH+$baseA));$sup=max(-3.2,min(3.2,$dr*.0048));$eh=max(.25,($total+$sup)/2);$ea=max(.25,($total-$sup)/2);
      $h=.7*$eh+.3*$h;$a=.7*$ea+.3*$a;$inputs['nationalModel']=['eloDiff'=>round($dr,1),'homeElo'=>$th['elo'],'awayElo'=>$ta['elo'],'homeRank'=>$th['rank']??null,'awayRank'=>$ta['rank']??null,'squad'=>[$sq($th),$sq($ta)],'form'=>[$th['form']??null,$ta['form']??null],'titles'=>[array_map(fn($t)=>$t['competition'].' '.$t['year'],$th['titles']??[]),array_map(fn($t)=>$t['competition'].' '.$t['year'],$ta['titles']??[])],'asOf'=>$nr['asOf']??null,'weight'=>.7];}
     else{$sh=(float)($nat['strength'][$match['home']['name']]??70);$sa=(float)($nat['strength'][$match['away']['name']]??70);$h*=exp(($sh-$sa)*.018);$a*=exp(($sa-$sh)*.018);$inputs['nationalStrengthPrior']=['home'=>$sh,'away'=>$sa];}}
    $h = max(.2,min(4.5,$h)); $a=max(.2,min(4.5,$a));
    
    $profiles=[]; foreach (['home','away'] as $side) { $attack=max(40,min(95,75+24*log($ratings[$side]['attack']))); $defense=max(40,min(95,75-24*log($ratings[$side]['defence']))); $profiles[$side]=['attack'=>$attack,'defense'=>$defense,'strength'=>($attack+$defense)/2]; }
    return array_merge(['teamProfiles'=>$profiles,'expectedGoals' => ['home' => $h, 'away' => $a], 'quality' => ['status' => min($ratings['home']['matches'], $ratings['away']['matches']) >= 10 ? 'history' : 'limited', 'completedMatches' => $games, 'homeMatches' => $ratings['home']['matches'], 'awayMatches' => $ratings['away']['matches'], 'inputs' => $inputs, 'modelVersion' => ($match['date']>='2026-10-24'?'pp-poisson-3.1-reliability':'pp-poisson-3.0-goal-audit')]], pp_distribution($h, $a));
}
function pp_authorized_feed(array $doc, array $cfg, DateTimeImmutable $now): array {
    $stamp = $doc['updatedAt'] ?? null;
    if (!is_string($stamp)) throw new RuntimeException('Authorized feed requires updatedAt');
    try { $dt = new DateTimeImmutable($stamp); } catch (Exception $e) { throw new RuntimeException('Invalid feed timestamp'); }
    if ($dt>$now || $now->getTimestamp() - $dt->getTimestamp() > 172800) throw new RuntimeException('Authorized feed older than 48 hours or dated in future');
    if (!isset($doc['matches']) || !is_array($doc['matches']) || count($doc['matches']) > 2000) throw new RuntimeException('Authorized matches invalid');
    $out = [];
    foreach ($doc['matches'] as $m) {
        $league = $m['competitionId'] ?? ''; $name = $m['competition'] ?? ''; $season = $m['season'] ?? '';
        if (!is_string($league) || !preg_match('/^[a-zA-Z0-9_.-]{1,40}$/', $league) || !is_string($name) || !is_string($season)) continue;
        $tz = $m['timezone'] ?? 'Europe/Istanbul';
        if (!in_array($tz, DateTimeZone::listIdentifiers(), true)) continue;
        try { $rows=pp_normalize(['matches'=>[$m]],$league,$season,['name'=>substr($name,0,100),'timezone'=>$tz],$cfg['normalized_feed_url']); } catch (RuntimeException $e) { continue; }
        foreach ($rows as $row) {
            $row['source']['name'] = $cfg['normalized_feed_label']; $row['source']['updatedAt']=$stamp; $inputs = [];
            if (isset($m['marketOdds']) && is_array($m['marketOdds'])) {
                $v=$m['marketOdds']; $valid=true;
                foreach (['home','draw','away'] as $k) if (!isset($v[$k]) || !is_numeric($v[$k]) || $v[$k]<1.01 || $v[$k]>1000) $valid=false;
                if ($valid) $inputs['marketOdds']=array_map('floatval',array_intersect_key($v,array_flip(['home','draw','away'])));
            }
            if (isset($m['squadFactors']) && is_array($m['squadFactors'])) {
                $v=$m['squadFactors']; if (isset($v['home'],$v['away']) && is_numeric($v['home']) && is_numeric($v['away']) && min($v['home'],$v['away'])>=.65 && max($v['home'],$v['away'])<=1.35) $inputs['squadFactors']=['home'=>(float)$v['home'],'away'=>(float)$v['away']];
            }
            $row['authorizedInputs']=$inputs; $out[]=$row;
        }
    }
    if (!$out) throw new RuntimeException('No valid authorized fixtures');
    return $out;
}
function pp_is_featured(array $match, array $rank, array $cfg): bool {
    if(($cfg['fixture_scope']??'all')==='all')return true;
    $league=$match['competitionId']; $top=array_slice(array_keys($rank[$league]??[]),0,8);
    $aliases=$cfg['featured_team_aliases']??[];
    $home=$aliases[$match['home']['name']]??$match['home']['name']; $away=$aliases[$match['away']['name']]??$match['away']['name'];
    return ($cfg['leagues'][$league]['all']??false) || !isset($cfg['leagues'][$league]) || in_array($home,$cfg['featured_teams'],true) || in_array($away,$cfg['featured_teams'],true) || in_array($match['home']['id'],$top,true) || in_array($match['away']['id'],$top,true);
}
function pp_build_prediction(array $m,array $history,DateTimeImmutable $now):array{
$prediction=array_merge($m,pp_forecast($m,$history,$now));$prediction['home']=array_merge($prediction['home'],$prediction['teamProfiles']['home']);$prediction['away']=array_merge($prediction['away'],$prediction['teamProfiles']['away']);unset($prediction['teamProfiles']);
            $prediction['publishedScore']=$prediction['mostLikelyScore'];$prediction['engineVersion']=$m['date']>='2026-10-24'?'2.6.0':'2.5.0';$prediction['animationProfile']='expanded-v2';$prediction['playerPolicy']=$m['date']>='2026-10-21'?'role-xi-v1':null;$prediction['replayDuration']=35;$prediction['replayPlan']=['policy'=>'pre-match-likelihood-v1','candidates'=>8];$prediction['context']=['venue'=>($m['neutral']??false)?'neutral':'home'];$prediction['forecastSource']=$m['source'];$prediction['seed']=(int)hexdec(substr(hash('sha256','pp-daily-v1|'.$m['id']),0,8));if($m['date']>='2026-10-27'){$scenario=pp_scenario_score((float)$prediction['expectedGoals']['home'],(float)$prediction['expectedGoals']['away'],$prediction['seed']);$prediction['publishedScore']=$scenario['score'];$prediction['scoreSelection']=$scenario['selection'];if(isset($prediction['analysis']['uncertainty']))$prediction['analysis']['uncertainty']=array_replace($prediction['analysis']['uncertainty'],['scorePolicy'=>'seeded-predictive-scenario','note'=>'A reproducible model-weighted scenario; the modal exact score and broader outcome probabilities are separate statistics.']);$prediction['engineVersion']='2.7.0';}$prediction['createdAt']=$now->format(DATE_ATOM);$prediction['originalPublishedDate']=$m['date'];$prediction['inputSnapshot']=$prediction['authorizedInputs']??[];unset($prediction['authorizedInputs']);return $prediction;
}
function pp_update(array $cfg, bool $force = false, ?DateTimeImmutable $clock = null, ?callable $fetcher = null): array {
    $now=($clock??new DateTimeImmutable('now'))->setTimezone(new DateTimeZone($cfg['timezone']));$epoch=$now->getTimestamp();$bulletinDay=pp_bulletin_day($now);$web=(bool)($cfg['_web_mode']??false);$started=microtime(true);$prepared=$cfg['_prepare_fixture']??null;$published=0;
    $path=$cfg['storage_dir'];$lock=fopen($path.'/update.lock','c');if(!$lock||!flock($lock,LOCK_EX|LOCK_NB))return ['status'=>'locked'];
    try{
        $rawState=pp_read($path.'/state.json',['sources'=>[],'matches'=>[],'predictions'=>[],'health'=>[]]);$state=pp_schedule_seed_apply($rawState,$now);if(($state['publicationRestorationVersion']??0)===96&&($rawState['predictions']??[])!==($state['predictions']??[])){if(!is_file($path.'/state-before-published-replay-v96.json'))pp_write($path.'/state-before-published-replay-v96.json',$rawState);pp_write($path.'/state.json',$state);}$forecastLock=pp_forecast_lock_capture($path,$state);$rollover=pp_publication_needed($state,$cfg,$now);
        if($web && !$prepared && $epoch-(int)($state['webLastAttemptEpoch']??0)<(int)$cfg['web_cooldown_seconds'])return ['status'=>'throttled'];
        $jobs=pp_source_jobs($cfg,$now);$due=$force?$jobs:pp_due_jobs($jobs,$state,$cfg,$now);
        if(!$due&&!$rollover&&!pp_pending_forecasts($state,$now)){pp_compact_cache($state,$cfg,$now);return ['status'=>'cached','pending'=>0,'health'=>pp_public_health($state,$cfg,$now)];}
        // Publish the new day from the validated cache before slow network work.
        if(($cfg['_publish_only']??false)&&!$rollover&&!pp_pending_forecasts($state,$now))return ['status'=>'cached','pending'=>count($due)];
        $chosen=(($cfg['_publish_only']??false)||($web&&$rollover))?[]:($web?array_slice(array_keys($due),0,1):array_keys($due));
        if($prepared){$fixture=$state['matches'][$prepared]??null;$league=$fixture['competitionId']??null;$chosen=array_slice(array_keys(array_filter($due,fn($j)=>($j['league']??null)===$league&&in_array($j['format'],['espn-month','tff-week'],true))),0,1);}
        if(!empty($cfg['_only_jobs']))$chosen=array_values(array_intersect($chosen,$cfg['_only_jobs']));
        $downloadCfg=$cfg;if($web)$downloadCfg['request_timeout_seconds']=min((int)$cfg['web_request_timeout_seconds'],(int)$cfg['request_timeout_seconds']);
        $fetch=$fetcher??function(string $url)use($downloadCfg){return (str_ends_with($url,'.txt')||str_contains($url,'www.tff.org/'))?pp_fetch_raw($url,$downloadCfg):pp_fetch($url,$downloadCfg);};
        $sources=$state['sources']??[];$attempts=$state['refreshAttempts']??[];$checks=[];$fresh=0;
        foreach($jobs as $key=>$job){
            if(!in_array($key,$chosen,true)){
                $old=$state['health']['sourceChecks'][$key]??[];$stamp=$sources[$key]['fetchedAt']??null;$age=$stamp?$epoch-strtotime($stamp):PHP_INT_MAX;
                $checks[$key]=array_merge($old,['status'=>$age<$job['interval']?'recent':($stamp?'cached':'waiting'),'fetchedAt'=>$stamp,'matches'=>count($sources[$key]['matches']??[])]);
                if(isset($old['error'])&&($attempts[$key]['ok']??true)===false)$checks[$key]['error']=$old['error'];continue;
            }
            try{
                $doc=$fetch($job['url']);
                if($job['format']==='espn-month'){
                    $job['observedAt']=$now->format(DATE_ATOM);$matches=pp_espn_month($doc,$job);
                    if(!$matches)foreach($state['matches']??[]as$known)if($known['competitionId']===$job['league']&&substr(str_replace('-','',$known['date']),0,6)===$job['month'])throw new RuntimeException('Empty live month conflicts with known season fixtures; cache retained');
                }
                elseif($job['format']==='tff-week')$matches=pp_tff_week($doc,$job);
                elseif($job['format']==='authorized')$matches=pp_authorized_feed($doc,$cfg,$now);
                elseif($job['format']==='openligadb-uefa')$matches=pp_openliga_uefa($doc,$job['season'],$job['url'],$job['league'],$job['shortcut'],$job['minimum']);
                else{
                    if($job['format']==='turkey-txt'){if(!is_string($doc))throw new RuntimeException('Text fixture source required');$doc=pp_turkey_txt($doc,$job['season']);}
                    $matches=pp_normalize($doc,$job['league'],$job['season'],$job['meta'],$job['url']);
                    if($job['format']==='turkey-txt')foreach($matches as &$m){$m['source']['name']='OpenFootball Europe CC0';$m['source']['format']='football-txt';$m['scheduleProvisional']=$m['kickoff']===null;}unset($m);
                }
                if(isset($job['meta']['expected_matches']) && count($matches)<(int)$job['meta']['expected_matches'])throw new RuntimeException('Incomplete league fixture source; last full cache retained');
                if(count(array_unique(array_column($matches,'id')))!==count($matches))throw new RuntimeException('Duplicate source fixtures; cache retained');
                $sources[$key]=['url'=>$job['url'],'fetchedAt'=>$now->format(DATE_ATOM),'matches'=>$matches];$fresh++;
                $latest=null;$past=0;$unknown=0;foreach($matches as $m){if(!$m['kickoff'])$unknown++;if($m['result']&&(!$latest||$m['date']>$latest))$latest=$m['date'];elseif(!$m['result']&&$m['date']<$now->modify('-2 days')->format('Y-m-d'))$past++;}
                $checks[$key]=['status'=>'ok','fetchedAt'=>$now->format(DATE_ATOM),'matches'=>count($matches),'unknownKickoffs'=>$unknown,'latestResultDate'=>$latest,'unscoredPastFixtures'=>$past];$attempts[$key]=['epoch'=>$epoch,'ok'=>true];
            }catch(Throwable $e){$checks[$key]=['status'=>isset($sources[$key])?'cached':'unavailable','error'=>substr($e->getMessage(),0,160),'fetchedAt'=>$sources[$key]['fetchedAt']??null];$attempts[$key]=['epoch'=>$epoch,'ok'=>false];if($key==='authorized')unset($sources[$key]);}
        }
        $all=[];foreach($sources as $key=>$source){if(!isset($jobs[$key])){unset($sources[$key]);continue;}if(in_array($jobs[$key]['format'],['espn-month','tff-week'],true))continue;foreach($source['matches'] as $m){
            if($m['kickoff'])$m['date']=pp_bulletin_day(new DateTimeImmutable($m['kickoff']));
            if($m['date']<$now->modify('-550 days')->format('Y-m-d')||$m['date']>$now->modify('+400 days')->format('Y-m-d'))continue;
            $m['source']['fetchedAt']=$source['fetchedAt'];$m['source']['cached']=!in_array($checks[$key]['status'],['ok','recent'],true);$all[$m['id']]=$m;
        }}
        $all=pp_overlay_live($all,$sources,$jobs,$checks);
        $all=pp_shared_fixture_retain($all,$state);
        $seeded=pp_big_seed_apply(['matches'=>$all,'predictions'=>$state['predictions']??[]],$now);$all=$seeded['matches'];$history=array_values($all);$predictions=$seeded['predictions'];$rank=[];
        // Published replays remain frozen, including tomorrow's advance release.
        // A policy migration must never regenerate an already shared match.
        foreach($history as $m)if($m['result']&&$m['date']<$bulletinDay)foreach(['home','away']as$side){$id=$m[$side]['id'];$other=$side==='home'?'away':'home';$rank[$m['competitionId']][$id]=($rank[$m['competitionId']][$id]??0)+($m['result'][$side]>$m['result'][$other]?3:($m['result'][$side]===$m['result'][$other]?1:0));}
        foreach($rank as &$r)arsort($r);unset($r);$limit=(new DateTimeImmutable($bulletinDay))->modify('+'.(int)$cfg['publish_ahead_days'].' days')->format('Y-m-d');usort($history,fn($a,$b)=>strcmp($a['date'].($a['kickoff']??''),$b['date'].($b['kickoff']??'')));$dayCount=[];foreach($predictions as$p)$dayCount[$p['date']]=($dayCount[$p['date']]??0)+1;
        foreach($history as $m){$id=$m['id'];if(isset($predictions[$id])){
            $oldResult=$predictions[$id]['result']??null;
            foreach(['date','kickoff','result','source','timeConfirmed','scheduleProvisional']as$field)if(array_key_exists($field,$m))$predictions[$id][$field]=$m[$field];
            if($m['result']&&$m['result']!==$oldResult){$predictions[$id]['resultReceivedAt']=$predictions[$id]['resultReceivedAt']??$now->format(DATE_ATOM);$predictions[$id]['resultUpdatedAt']=$now->format(DATE_ATOM);}

            if($m['result']){$p=$predictions[$id]['probabilities'];$r=$m['result'];$outcome=$r['home']>$r['away']?'home':($r['home']===$r['away']?'draw':'away');$brier=0;foreach(['home','draw','away']as$k)$brier+=pow($p[$k]-($k===$outcome?1:0),2);$predictions[$id]['evaluation']=['outcome'=>$outcome,'brierScore'=>$brier,'logLoss'=>-log(max(1e-12,$p[$outcome]))];}else unset($predictions[$id]['evaluation']);continue;
        }
            if($prepared&&$id!==$prepared)continue;
            if(!pp_forecast_eligible($m,$now))continue;
            if(!pp_history_ready($m,$history,$now))continue;
            // Persist each bounded batch before the next browser/cron tick.
            if($web&&($published>=($prepared?1:2)||microtime(true)-$started>14))continue;
            if($m['kickoff']&&new DateTimeImmutable($m['kickoff'])<=$now)continue;
            if(!$m['kickoff']&&$now>=pp_date_only_deadline($m))continue;
            if((($cfg['fixture_scope']??'all')!=='all' && (int)$cfg['max_daily_matches']>0 && ($dayCount[$m['date']]??0)>=$cfg['max_daily_matches'])||!pp_is_featured($m,$rank,$cfg))continue;
            $analysisCfg=$cfg;if($web){$analysisCfg['analysis_timeout_seconds']=2;$analysisCfg['analysis_max_seconds']=3;$analysisCfg['passing_request_budget']=0;}if($fetcher!==null){$analysisCfg['analysis_enabled']=false;$analysisCfg['analysis_network_enabled']=false;}try{$m=pp_analysis_enrich($m,$history,$analysisCfg,$now);$m=pp_passing_enrich($m,$history,$analysisCfg,$now);$m=pp_analysis_v44($m,$now);}catch(Throwable $e){$m['analysis']=['version'=>'evidence-v1','status'=>'unavailable','asOf'=>$now->format(DATE_ATOM),'sources'=>[],'missing'=>['analysis']];}
            $prediction=pp_build_prediction($m,$history,$now);$predictions[$id]=$prediction;$published++;$dayCount[$m['date']]=($dayCount[$m['date']]??0)+1;
        }
        $oldest=$now->modify('-'.(int)$cfg['keep_archive_days'].' days')->format('Y-m-d');foreach($predictions as$id=>$p)if($p['date']<$oldest&&!pp_forecast_protected($p))unset($predictions[$id]);
        $currentChecks=array_filter($checks,fn($v,$key)=>$jobs[$key]['current'],ARRAY_FILTER_USE_BOTH);$ok=count(array_filter($currentChecks,fn($v)=>in_array($v['status'],['ok','recent'],true)));$coverage=[];
        foreach($jobs as$key=>$job)if($job['current']&&$key!=='authorized'){$c=$checks[$key];$coverage[]=['id'=>$job['league'],'name'=>$job['meta']['name'],'status'=>$c['status'],'fetchedAt'=>$c['fetchedAt']??null,'fixtureCount'=>$c['matches']??0,'unknownKickoffs'=>$c['unknownKickoffs']??null,'latestResultDate'=>$c['latestResultDate']??null,'unscoredPastFixtures'=>$c['unscoredPastFixtures']??null];}
        $health=['competitionCoverage'=>$coverage,'status'=>$ok===count($currentChecks)?'ok':($ok?'partial':'stale'),'lastAttempt'=>$now->format(DATE_ATOM),'lastSuccess'=>$fresh?$now->format(DATE_ATOM):($state['health']['lastSuccess']??null),'nextRefresh'=>$now->modify('+'.(int)$cfg['refresh_seconds'].' seconds')->format(DATE_ATOM),'sourceChecks'=>$checks,'coverage'=>['configuredCompetitions'=>array_merge(array_keys($cfg['leagues']),array_values(array_filter(['ucl','uel','uecl','unl','intl'],fn($cup)=>$cfg[$cup.'_enabled']??false))),'defaultUnavailable'=>['National teams'],'note'=>'Community fixtures/results. Unknown times remain provisional. Download freshness does not guarantee source accuracy or complete results.'],'authorizedFeedConfigured'=>(bool)$cfg['normalized_feed_url'],'fixtureCount'=>count($all),'predictionCount'=>count($predictions)];
        $state=array_merge($state,['version'=>2,'publicationPolicy'=>$cfg['publication_policy'],'publicationDay'=>$bulletinDay,'lastAttemptEpoch'=>$epoch,'generatedAt'=>$now->format(DATE_ATOM),'sources'=>$sources,'matches'=>$all,'predictions'=>$predictions,'health'=>$health,'refreshAttempts'=>$attempts]);if($web)$state['webLastAttemptEpoch']=$epoch;else $state['fullLastAttemptEpoch']=$epoch;
        $state=pp_forecast_lock_merge($state,$forecastLock);$forecastLock=pp_forecast_lock_capture($path,$state);pp_forecast_lock_assert($state,$forecastLock);pp_write($path.'/state.json',$state);pp_compact_cache($state,$cfg,$now);return ['status'=>'updated','sourcesUpdated'=>$fresh,'pending'=>count(pp_due_jobs($jobs,$state,$cfg,$now)),'health'=>pp_public_health($state,$cfg,$now)];
    }finally{flock($lock,LOCK_UN);fclose($lock);}
}
function pp_history_ready(array $match,array $history,DateTimeImmutable $now):bool {
    // V131: national teams are always forecast (recent internationals + squad-strength prior in pp_forecast).
    if(in_array($match['competitionId']??'',['unl','intl'],true))return true;
    $n=0;foreach($history as$m){if(($m['competitionId']??'')!==$match['competitionId']||empty($m['result']))continue;$at=!empty($m['kickoff'])?(new DateTimeImmutable($m['kickoff']))->modify('+150 minutes'):new DateTimeImmutable($m['date'].'T23:59:59+03:00');if($at<$now&&++$n>=3)return true;}return false;
}
function pp_forecast_eligible(array $m,DateTimeImmutable $now):bool {
    if(!pp_in_publication_window($m,$now)||!empty($m['result']))return false;
    if(!empty($m['kickoff'])&&new DateTimeImmutable($m['kickoff'])<=$now)return false;
    if(empty($m['kickoff'])&&$now>=pp_date_only_deadline($m))return false;
    // A recently validated provider schedule can survive a temporary fetch failure.
    if(!empty($m['source']['cached'])){$at=strtotime($m['source']['fetchedAt']??'');if(!$at||$at>$now->getTimestamp()||$now->getTimestamp()-$at>86400)return false;}
    return true;
}
function pp_pending_forecasts(array $state,DateTimeImmutable $now):int {
    $count=0;foreach($state['matches']??[]as$m)if(!isset($state['predictions'][$m['id']])&&in_array($m['source']['name']??'',['ESPN','TFF','BSD'],true)&&pp_forecast_eligible($m,$now))$count++;return $count;
}
function pp_publication_needed(array $state,array $cfg,DateTimeImmutable $now):bool {
    return ($state['publicationPolicy']??'')!==$cfg['publication_policy'] || ($state['publicationDay']??substr($state['generatedAt']??'',0,10))!==pp_bulletin_day($now);
}
function pp_public_health(array $state, array $cfg, DateTimeImmutable $now): array {
    $health=$state['health']??['status'=>'not_initialized','lastSuccess'=>null,'coverage'=>['note'=>'Refresh has not completed. No real fixture data available.']];
    $health['pendingForecasts']=pp_pending_forecasts($state,$now);$health['liveCoverage']=[];$day=pp_bulletin_day($now);$next=(new DateTimeImmutable($day))->modify('+1 day')->format('Y-m-d');
    foreach(pp_live_jobs($cfg,$now)as$key=>$job)if($job['format']==='espn-month'&&str_starts_with($key,'live/')){
        $rows=array_values(array_filter($state['matches']??[],fn($m)=>$m['competitionId']===$job['league']&&in_array($m['source']['name']??'',['ESPN','TFF','BSD'],true)));$check=$state['health']['sourceChecks'][$key]??[];
        $health['liveCoverage'][]=['id'=>$job['league'],'name'=>$job['meta']['name'],'status'=>$check['status']??'waiting','today'=>count(array_filter($rows,fn($m)=>$m['date']===$day)),'tomorrow'=>count(array_filter($rows,fn($m)=>$m['date']===$next)),'fetchedAt'=>$check['fetchedAt']??null];
    }
    $portraits=pp_read(__DIR__.'/../assets/faces/player-portraits.json');$health['secondaryData']=['provider'=>'BSD','configured'=>bsd_key($cfg)!=='','coachPolicy'=>'independent-current-club-source','faces'=>$portraits['summary']??[]];
    $health['rolloverHour']=6;$health['bulletinDay']=pp_bulletin_day($now);$health['schedulerLastRunAt']=pp_read($cfg['storage_dir'].'/scheduler.json')['lastRunAt']??null;
    $health['pollAfterSeconds']=(int)$cfg['browser_poll_seconds'];$health['resultRefreshSeconds']=(int)$cfg['result_refresh_seconds'];$health['publicationNeeded']=pp_publication_needed($state,$cfg,$now);$health['fixtureScope']=$cfg['fixture_scope'];$health['publishAheadDays']=$cfg['publish_ahead_days'];$health['autoRefreshEnabled']=(bool)$cfg['auto_refresh_on_visit'];$health['pendingSources']=count(pp_due_jobs(pp_source_jobs($cfg,$now),$state,$cfg,$now));$health['webCooldownSeconds']=(int)$cfg['web_cooldown_seconds'];
    $scheduled=strtotime($health['schedulerLastRunAt']??'');$health['backgroundVerified']=$scheduled&&$scheduled<=$now->getTimestamp()&&$now->getTimestamp()-$scheduled<=600;$last=(int)($state['lastAttemptEpoch']??0);$health['cronOverdue']=!$health['backgroundVerified'];$health['dataOverdue']=$last===0||$now->getTimestamp()-$last>max(86400,$cfg['refresh_seconds']*2);
    if ($health['dataOverdue'] && ($health['status']??'')!=='not_initialized') $health['status']='stale';
    return $health;
}
function pp_fixture_status(array $match,DateTimeImmutable $now):string {
    if($match['result']??null)return 'finished';
    if(!empty($match['kickoff'])){
        $kickoff=new DateTimeImmutable($match['kickoff']);
        if($kickoff>$now)return 'scheduled';
        return $now->getTimestamp()-$kickoff->getTimestamp()<130*60?'in_progress':'awaiting_result';
    }
    $today=pp_bulletin_day($now);
    if($match['date']<$today)return 'awaiting_result';
    return $match['date']===$today?'time_unconfirmed':'scheduled';
}
function pp_release_time(array $m):string {return (new DateTimeImmutable($m['date'].'T00:00:00+03:00'))->modify('-'.pp_publication_days($m).' days')->format(DATE_ATOM);}
function pp_released(array $m,DateTimeImmutable $now):bool {return new DateTimeImmutable(pp_release_time($m))<=$now;}
function pp_replay_key(array $m):string {
    return hash('sha256',json_encode([$m['engineVersion']??'1.0.0',$m['seed'],$m['home'],$m['away'],$m['expectedGoals'],$m['context']??[],$m['replayPlan']??null],JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES));
}
function pp_present_fixture(array $match,DateTimeImmutable $now):array {
    $match['status']=pp_fixture_status($match,$now);$match['releaseAt']=pp_release_time($match);
    if(isset($match['seed'])){
        $match['replayKey']=pp_replay_key($match);$match['predictionBasis']='fixed-physical-replay';
        // No alternate model score or verdict can spoil or mis-score the fixed simulation.
        unset($match['mostLikelyScore'],$match['publishedScore'],$match['comparison'],$match['evaluation'],$match['inputSnapshot']);
    }
    return $match;
}
function pp_compare_result(array $m):?array {return null;} // Historical point-score comparisons deliberately retired.
function pp_result_summary(array $matches):array {return ['basis'=>'fixed-physical-replay','calculation'=>'replay-worker','total'=>count($matches),'settled'=>count(array_filter($matches,fn($m)=>$m['result']??false))];}
function pp_schedule_fixture(array $m,DateTimeImmutable $now):array {
    return pp_present_fixture(array_intersect_key($m,array_flip(['id','date','kickoff','competition','competitionId','home','away','source','timeConfirmed','scheduleProvisional','result'])),$now);
}
function pp_daily(array $state,array $cfg,string $date,DateTimeImmutable $now):array {
    $today=pp_bulletin_day($now);$released=array_filter($state['predictions']??[],fn($m)=>pp_released($m,$now));
    $public=array_map(fn($m)=>pp_present_fixture($m,$now),array_values($released));
    $matches=array_values(array_filter($public,fn($m)=>$m['date']===$date));
    $anchor=max($date,$today);$end=(new DateTimeImmutable($anchor))->modify('+7 days')->format('Y-m-d');
    $scheduled=[];
    foreach($state['matches']??[] as $m){
        if(isset($released[$m['id']])||$m['date']<$anchor||$m['date']>$end)continue;
        $scheduled[]=pp_schedule_fixture($m,$now);
    }
    $sort=fn($a,$b)=>strcmp($a['date'].($a['kickoff']??'23:59'),$b['date'].($b['kickoff']??'23:59'));usort($matches,$sort);usort($scheduled,$sort);
    $yesterday=(new DateTimeImmutable($today))->modify('-1 day')->format('Y-m-d');$reportDate=min($date,$yesterday);
    $report=array_values(array_filter($public,fn($m)=>$m['date']===$reportDate));usort($report,$sort);
    return ['date'=>$date,'serverNow'=>$now->format(DATE_ATOM),'timezone'=>$cfg['timezone'],'rolloverHour'=>6,'bulletinDay'=>$today,'generatedAt'=>$state['generatedAt']??null,'matches'=>$matches,'upcoming'=>[],'scheduled'=>$scheduled,'recent'=>[],'reportDate'=>$reportDate,'reportMatches'=>$report,'health'=>pp_public_health($state,$cfg,$now)];
}

function pp_ucl_dataset(array $state):array {
    $datasets=[];
    foreach($state['sources']??[] as $key=>$source){
        if(!in_array(explode('/',$key)[1]??'',['ucl','uel','uecl'],true)||!str_contains($source['url']??'','api.openligadb.de/'))continue;
        $datasets[]=['competitionId'=>explode('/',$key)[1],'season'=>explode('/',$key)[0],'fetchedAt'=>$source['fetchedAt'],'matches'=>$source['matches']];
    }
    return ['attribution'=>'Contains UEFA fixture information from OpenLigaDB, available under ODbL1.0.','source'=>'https://www.openligadb.de/','license'=>'ODbL-1.0','licenseUrl'=>'https://opendatacommons.org/licenses/odbl/1-0/','adaptations'=>'Canonical team names, UTC kickoff normalization, stable match ids, full-time scores; external logos/goals omitted.','datasets'=>$datasets];
}
