#!/usr/bin/env python3
"""Offline reference diagnostics. Raw data is never shipped or loaded by the game.
Usage: python3 tools/analyse-football-reference.py CACHE OUTPUT.json
Metrica: acknowledge Metrica Sports. SkillCorner: MIT, credit SkillCorner/PySport.
StatsBomb terms are restrictive: no derived StatsBomb model/metrics in this tool.
"""
import csv,gzip,json,math,statistics,sys,pathlib,hashlib
cache=pathlib.Path(sys.argv[1]);dest=pathlib.Path(sys.argv[2])
def q(values,p):
    values=sorted(v for v in values if math.isfinite(v));at=(len(values)-1)*p
    if not values:return None
    a=math.floor(at);b=math.ceil(at);return round(values[a]+(values[b]-values[a])*(at-a),4)
def summary(values):return {'n':len(values),'p10':q(values,.1),'median':q(values,.5),'p90':q(values,.9)}
def number(v):
    try:return float(v)
    except (TypeError,ValueError):return float('nan')
result={'scope':'Small public reference samples; not a fitted league model or proof of real player mental attributes. No StatsBomb-derived product parameters.', 'units':'metres/seconds/radians','metrica':{},'skillcorner':{},'pose':{}}
for team in ['home','away']:
    with (cache/f'metrica-{team}-prefix.csv').open() as f:rows=list(csv.reader(f))[3:]
    speeds=[];lengths=[];widths=[];last={}
    for row in rows:
        time=number(row[2]);points=[]
        for i in range(3,len(row)-2,2):
            x=number(row[i]);z=number(row[i+1]);
            if not(math.isfinite(x) and math.isfinite(z)):continue
            x=(x-.5)*105;z=(z-.5)*68;points.append((x,z))
            if i in last:
                before=last[i];dt=time-before[0]
                if .02<dt<.1:
                    speed=math.hypot(x-before[1],z-before[2])/dt
                    if speed<12:speeds.append(speed)
            last[i]=(time,x,z)
        if len(points)>=8:
            lengths.append(max(p[0] for p in points)-min(p[0] for p in points));widths.append(max(p[1] for p in points)-min(p[1] for p in points))
    result['metrica'][team]={'frames':len(rows),'seconds':number(rows[-1][2])-number(rows[0][2]),'speed':summary(speeds),'allTrackedTeamLength':summary(lengths),'allTrackedTeamWidth':summary(widths),'note':'300-second prefix, includes stoppages and GK; anonymised IDs, not player skill labels. Speeds >12m/s treated as tracking outliers.'}
with (cache/'metrica-events.csv').open() as f:events=list(csv.DictReader(f))
passes=[]
for e in events:
    if e['Type']=='PASS':
        x,z,xx,zz=map(number,[e['Start X'],e['Start Y'],e['End X'],e['End Y']]);d=math.hypot((xx-x)*105,(zz-z)*68)
        if math.isfinite(d):passes.append(d)
result['metrica']['passDistance']=summary(passes)
with (cache/'skill-phases.csv').open() as f:phases=list(csv.DictReader(f))
for kind in sorted(set(p['team_out_of_possession_phase_type'] for p in phases)):
    rows=[p for p in phases if p['team_out_of_possession_phase_type']==kind]
    result['skillcorner'][kind]={'phases':len(rows),'width':summary([number(p['team_out_of_possession_width_start']) for p in rows]),'length':summary([number(p['team_out_of_possession_length_start']) for p in rows])}
frames=0;observed=0;missing=0;rejected=0;knees=[];clips={};errors=[]
def angle(a,b,c):
    u=[a[i]-b[i] for i in range(3)];v=[c[i]-b[i] for i in range(3)];den=math.sqrt(sum(x*x for x in u)*sum(x*x for x in v))
    return math.acos(max(-1,min(1,sum(u[i]*v[i] for i in range(3))/den))) if den>1e-8 else None
with gzip.open(cache/'bodypose-sample.jsonl.gz','rt') as f:
    for line in f:
        frame=json.loads(line);frames+=1
        for p in frame['player_data']:
            joints=p.get('joints')
            if not joints:missing+=1;continue
            observed+=1
            for side in ['l','r']:
                names=[side+'Hip',side+'Knee',side+'Ankle'];js=[joints.get(n) for n in names]
                if any(not j or j['p90_mae_cm']>25 for j in js):rejected+=1;continue
                theta=angle(*(j['xyz'] for j in js))
                if theta is None:continue
                flex=math.pi-theta;knees.append(flex);errors.extend(j['p90_mae_cm'] for j in js)
                # Diagnostic retarget to the existing knee hinge. No root motion,
                # foot strike, ball contact or complete animation is inferred.
                identity=str(p['player_id']);clip=clips.setdefault(identity,[])
                if len(clip)<40 and side=='l':clip.append({'frame':frame['frame'],'time':round((frame['frame']-124487)/25,3),'leftKneeFlex':round(flex,5),'maxErrorCm':max(j['p90_mae_cm'] for j in js)})
result['pose']={'frames':frames,'posePlayerFrames':observed,'missingPlayerFrames':missing,'rejectedLimbs':rejected,'kneeFlexRadians':summary(knees),'jointErrorCm':summary(errors),'sampleDuration':(frames-1)/25,'prototypeOnly':True,'limitations':'12.32s second-half quick-break sample. 25Hz pose vs10Hz tracking; missing detections, p90 estimation errors and uncertain absolute vertical root. Hinge-angle prototype is not a ready-made game animation and is not enabled in runtime.'}
result['posePrototype']=next(({'player':k,'samples':v} for k,v in clips.items() if len(v)>=20),None)
result['sourceFiles']=[{'name':f.name,'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()} for f in cache.iterdir() if f.name.startswith(('metrica-','skill-','bodypose-')) and f.suffix not in ['html']]
dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'metricaPass':result['metrica']['passDistance'],'pose':result['pose'],'skillPhases':list(result['skillcorner'])},indent=2))
