#!/usr/bin/env python3
"""Build identity-matched head assets from acquired source folders; never alter squads.
python3 tools/head-import/build-library.py --input-root /tmp --reader /tmp/pes-fmdl-blender/pes-fmdl
"""
import argparse, concurrent.futures, gzip, hashlib, struct, importlib.util, json, pathlib, re, unicodedata
ROOT=pathlib.Path(__file__).resolve().parents[2]
def norm(s):return ''.join(c for c in unicodedata.normalize('NFD',s).lower().replace('ı','i') if c.isalnum())
def convert_job(job):
    spec=importlib.util.spec_from_file_location('pes_convert',ROOT/'tools/head-import/convert-pes.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
    entry,source,reader,prior=job;out=ROOT/pathlib.Path(entry['path']).parent
    try:
        if prior and (out/'head.glb.gz').exists() and hashlib.sha256((out/'head.glb.gz').read_bytes()).hexdigest()==prior.get('sha256'):
            entry.update({k:prior[k] for k in ['bytes','rawBytes','triangles','meshes','eyes','skinRGB','sha256'] if k in prior});return entry,None
        result=mod.convert(pathlib.Path(source),out,pathlib.Path(reader),entry['sourceId'],entry['name']);entry.update(result);spec=importlib.util.spec_from_file_location('glb_pack',ROOT/'tools/head-import/pack-glb.py');packer=importlib.util.module_from_spec(spec);spec.loader.exec_module(packer);raw=(out/'head.glb').read_bytes();raw=packer.pack(raw);n=struct.unpack_from('<I',raw,12)[0];meta=json.loads(raw[20:20+n])['extras'];entry.update(triangles=meta['triangles'],discardedInvalidTriangles=meta['discardedInvalidTriangles']);encoded=gzip.compress(raw,compresslevel=9,mtime=0);(out/'head.glb.gz').write_bytes(encoded);(out/'head.glb').unlink();entry.update(rawBytes=len(raw),bytes=len(encoded),sha256=hashlib.sha256(encoded).hexdigest());return entry,None
    except Exception as e:return None,{'sourceId':entry['sourceId'],'name':entry['name'],'error':repr(e)}
if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--input-root',type=pathlib.Path,required=True);ap.add_argument('--reader',type=pathlib.Path,required=True);ap.add_argument('--reuse',action='store_true');ap.add_argument('--workers',type=int,default=2);a=ap.parse_args();config=json.loads((ROOT/'tools/head-import/sources.json').read_text());registry=json.loads((ROOT/'assets/club-rosters-v75.json').read_text())['teams'];pool=[(tid,p) for tid,t in registry.items() for p in [*t['team'].get('players',[]),*t['team'].get('bench',[])]]
    portraits=json.loads((ROOT/'assets/faces/player-portraits.json').read_text()).get('players',{})
    pool.extend(('verified-photo',{**p,'aliases':[p.get('bsdName','')]}) for p in portraits.values() if p.get('dateOfBirth') and p.get('verifiedBy'))
    archive_text=(ROOT/'assets/concept/teams.js').read_text().split('=',1)[1].lstrip();archive=json.JSONDecoder().raw_decode(archive_text)[0]
    for team in archive.get('teams',[]):
        lineup=team.get('lineup',{})
        for p in [*lineup.get('players',[]),*lineup.get('bench',[])]:
            if not p.get('dateOfBirth') or not p.get('id'):continue
            pool.append(('concept',p))
            if p.get('sourceId'):pool.append(('concept',{**p,'id':p['sourceId']}))
    for path in (ROOT/'assets/player-profiles').glob('*.json'):
        profile=json.loads(path.read_text())
        pool.extend(('profile',p) for p in profile.get('players',[]) if p.get('id') and p.get('dateOfBirth'))
    for file in ['penalty-guests.json','japon-legends.json']:
        pool.extend(('guests',p) for p in json.loads((ROOT/'assets'/file).read_text()).get('players',[]))
    by_name={}
    for tid,p in pool:
        for n in {norm(p['name']),*[norm(n) for n in p.get('aliases',[]) if n]}:by_name.setdefault(n,[]).append((tid,p))
    if not a.reuse and any(p.get('source')=='fm27-realfaces-v2' for p in json.loads((ROOT/'assets/heads/manifest.json').read_text()).get('players',[])):raise ValueError('Use --reuse to preserve the installed RFH source family')
    previous={p['source']+'|'+p['sourceId']:p for p in json.loads((ROOT/'assets/heads/manifest.json').read_text()).get('players',[])} if a.reuse else {};entries=[];unmatched=[];seen=set();source_records=[]
    for src in config['sources']:
        folder=a.input_root/src['directory'];idfile=ROOT/src['verifiedIds'] if src.get('verifiedIds') else folder/src['ids']
        if not idfile.exists():continue
        archive=a.input_root/src['archive'];record={**src,'archiveSHA256':hashlib.file_digest(archive.open('rb'),'sha256').hexdigest() if archive.exists() else src.get('archiveSHA256')};source_records.append(record)
        for row in idfile.read_text(encoding='utf-8-sig').splitlines():
            cols=[p.strip() for p in row.split('\t') if p.strip()]
            if len(cols)!=2:
                match=re.fullmatch(r'(\d{4,})\s*[-:]\s*(.+)',row.strip()) or re.fullmatch(r'(.+?)\s+(\d+)\s*',row.strip())
                if not match:continue
                cols=list(match.groups())
            sid,name=(cols[0],cols[1]) if cols[0].isdigit() else (cols[1],cols[0]);
            if not sid.isascii() or not sid.isdigit() or len(sid)>12:
                unmatched.append({'source':src['key'],'id':sid,'name':name,'reason':'invalid-source-id'});continue
            if sid in src.get('excludeSourceIds',{}):
                unmatched.append({'source':src['key'],'id':sid,'name':name,'reason':src['excludeSourceIds'][sid]});continue
            names=[name,*config['aliases'].get(name,[])];matches=list({(tid,str(p['id'])):(tid,p) for n in {norm(n) for n in names} for tid,p in by_name.get(n,[])}.values());primary=[(tid,p) for tid,p in matches if tid==src.get('clubId')]
            if len(name.split())<2 or any(len(n.split())<2 for n in names):
                if primary:
                    primary_ids={str(p['id']) for tid,p in primary};matches=[(tid,p) for tid,p in matches if str(p['id']) in primary_ids or (len(p['name'].split())>1 and norm(p['name']) in {norm(n) for n in names if len(n.split())>1})]
                elif len({norm(p['name']) for tid,p in matches})>1:
                    unmatched.append({'source':src['key'],'id':sid,'name':name,'reason':'ambiguous-short-name'});continue
            expected_dob=src.get('birthDates',{}).get(sid) or (primary[0][1].get('dateOfBirth') if primary else None)
            dates={p.get('dateOfBirth') for tid,p in matches if p.get('dateOfBirth')}
            if not expected_dob and len(dates)>1:
                unmatched.append({'source':src['key'],'id':sid,'name':name,'reason':'ambiguous-birth-dates'});continue
            expected_dob=expected_dob or next(iter(dates),None)
            if expected_dob:matches=[(tid,p) for tid,p in matches if not p.get('dateOfBirth') or p['dateOfBirth']==expected_dob]
            ids=sorted({str(p['id']) for tid,p in matches})
            if not ids:unmatched.append({'source':src['key'],'id':sid,'name':name});continue
            if any(i in seen for i in ids):continue
            source=folder/sid
            if not source.is_dir() and name=='Fabio Miretti':source=folder/'MIRETTI'
            if not source.is_dir():unmatched.append({'source':src['key'],'id':sid,'name':name,'reason':'source-folder-missing'});continue
            seen.update(ids);entry={'sourceId':sid,'name':(primary[0][1] if primary else matches[0][1])['name'],'names':list(dict.fromkeys([*names,*[p['name'] for tid,p in matches],*[p.get('shortName') for tid,p in matches if p.get('shortName')]])),'ids':ids,'clubs':sorted({tid for tid,p in matches}),'path':f'assets/heads/pes/{sid}/head.glb.gz','source':src['key'],'sourcePage':src['page'],'sourceCredit':src['credit'],'sourceSeason':src['season'],'dateOfBirth':expected_dob};entries.append((entry,str(source),str(a.reader),previous.get(src['key']+'|'+sid)))
    manifest={'schema':1,'version':int((ROOT/'VERSION').read_text().strip().lstrip('vV')),'source':'PES community real heads; identity matched to current game data','sources':source_records,'players':[],'unmatched':unmatched,'failed':[]}
    with concurrent.futures.ProcessPoolExecutor(max_workers=a.workers) as ex:
        for entry,error in ex.map(convert_job,entries):
            if entry:manifest['players'].append(entry);print('OK',entry['name'],entry['bytes'],flush=True)
            else:manifest['failed'].append(error);print('FAILED',error,flush=True)
    # Selected RFH heads are a separate reproducible source family. A PES rebuild
    # must never silently drop them or overwrite their numeric source path.
    retained=[p for p in previous.values() if p.get('source')=='fm27-realfaces-v2']
    active_ids={i for p in manifest['players'] for i in p['ids']};active_paths={p['path'] for p in manifest['players']}
    for p in retained:
        if any(i in active_ids for i in p['ids']) or p['path'] in active_paths:raise ValueError('PES rebuild collides with retained RFH identity; review source precedence')
        asset=ROOT/p['path']
        if not asset.exists() or hashlib.sha256(asset.read_bytes()).hexdigest()!=p['sha256']:raise ValueError('retained RFH asset missing or changed')
        manifest['players'].append(p)
    if retained:
        old=json.loads((ROOT/'assets/heads/manifest.json').read_text())
        manifest['sources'].extend(s for s in old.get('sources',[]) if s.get('key')=='fm27-realfaces-v2')
    for tid in ['432','436','1895','997']:

        if tid not in registry:continue
        known={i for p in manifest['players'] for i in p['ids']};team=registry[tid];players=[*team['team']['players'],*team['team'].get('bench',[])];print('COVERAGE',team['name'],sum(str(p['id']) in known for p in players),'/',len(players),flush=True)
    path=ROOT/'assets/heads/manifest.json';path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n');print('TOTAL',len(manifest['players']),'FAILED',len(manifest['failed']),flush=True)
