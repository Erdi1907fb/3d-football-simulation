#!/usr/bin/env python3
"""Fetch only approved player members, with current patch precedence and bounded HTTP ranges.
Stages outside the repo; --install merges checked successes, retaining all existing heads.
No executable/plugin download. Requires numpy/Pillow. Source CSV allowlist is mandatory.
"""
import unicodedata,copy,argparse,concurrent.futures,csv,gzip,hashlib,importlib.util,json,pathlib,re,shutil,struct,zipfile
ROOT=pathlib.Path(__file__).resolve().parents[2]
def module(name,file):
 spec=importlib.util.spec_from_file_location(name,ROOT/'tools/head-import'/file);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
R=module('range_zip','range-zip.py');C=module('convert_rfh','convert-rfh.py')
def archive_index(item,stage):
 order,url=item;path=stage/f'index-{order}.json'
 if path.exists():return json.loads(path.read_text())
 remote=R.RemoteZip(R.direct(url));z=zipfile.ZipFile(remote);rows=[]
 for e in z.infolist():
  uid=pathlib.PurePosixPath(e.filename).name
  if re.fullmatch(r'[0-9]{1,12}\.rfh',uid):rows.append({'uid':uid[:-4],'member':e.filename,'bytes':e.file_size,'packed':e.compress_size,'crc32':e.CRC})
 result={'order':order,'url':url,'archiveBytes':remote.total,'rangeBytes':remote.downloaded,'files':rows};path.write_text(json.dumps(result));print('INDEX',order,len(rows),remote.downloaded,flush=True);return result

def convert_archive(job,stage,existing_paths):
 index,players=job;results=[];remote=None;z=None
 for identity,member in players:
  uid=identity['fmUID'];dest=stage/'converted'/uid;entryfile=dest/'entry.json'
  try:
   if entryfile.exists():
    entry=json.loads(entryfile.read_text());b=(dest/'head.glb.gz').read_bytes();assert hashlib.sha256(b).hexdigest()==entry['sha256'];results.append(entry);continue
   assert 0<member['bytes']<=12_000_000 and member['packed']<=12_000_000
   rawfile=stage/(uid+'.rfh')
   if not rawfile.exists():
    if z is None:remote=R.RemoteZip(R.direct(index['url']));z=zipfile.ZipFile(remote)
    raw=z.read(member['member']);assert len(raw)==member['bytes'];rawfile.write_bytes(raw)
   raw=rawfile.read_bytes();entry=C.convert(rawfile,dest,identity)
   if entry['path'] in existing_paths:
    old=existing_paths[entry['path']];norm=lambda t:''.join(c for c in unicodedata.normalize('NFD',t).lower().replace('ł','l') if c.isalnum())
    assert old.get('dateOfBirth')==identity['dateOfBirth'] and norm(old['name'])==norm(identity['name']),'source path belongs to another identity'
    old=copy.deepcopy(old);old['ids']=sorted(set(old['ids']+identity['ids']));old['clubs']=sorted(set(old['clubs']+identity['clubs']));old['names']=list(dict.fromkeys(old.get('names',[old['name']])+identity.get('names',[identity['name']])))
    old['identityExtension']={'fmUID':uid,'sourceCSV':SOURCE['csv'],'evidence':identity['identityEvidence']};old['reuseExisting']=True;results.append(old);print('REUSE',uid,old['name'],flush=True);continue
   assert entry['bytes']<2_000_000 and entry['triangles']<35_000,'Source exceeds 2MB/35k-triangle runtime budget; retain own portrait'
   entry.update(sourcePage=SOURCE['page'],sourceCredit=SOURCE['credit'],sourceSeason='FM27 v2 / SP Football Life 2026-27',rfhSHA256=hashlib.sha256(raw).hexdigest(),sourceArchive=index['url'],sourceMember=member['member'],identityEvidence={k:identity[k] for k in ['sourceName','sourceClub','gameClub','identityEvidence']})
   entryfile.write_text(json.dumps(entry,ensure_ascii=False,indent=2)+'\n');results.append(entry);print('OK',uid,entry['name'],entry['bytes'],flush=True)
  except Exception as e:results.append({'failed':True,'fmUID':uid,'name':identity['name'],'error':repr(e)});print('FAIL',uid,repr(e),flush=True)
 if z:z.close()
 return results

if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('--stage',type=pathlib.Path,required=True);ap.add_argument('--csv',type=pathlib.Path,required=True);ap.add_argument('--install',action='store_true');ap.add_argument('--workers',type=int,default=4);a=ap.parse_args();a.stage.mkdir(parents=True,exist_ok=True)
 SOURCE=json.loads((ROOT/'tools/head-import/fm27-sources.json').read_text());plan=json.loads((ROOT/'tools/head-import/fm27-plan.json').read_text());allow={r['UID']:r for r in csv.DictReader(a.csv.open(encoding='utf-8-sig'),delimiter=';') if r['Club']!='Manager'}
 manifest=json.loads((ROOT/'assets/heads/manifest.json').read_text());existing_paths={e['path']:e for e in manifest['players']};existing_ids={i for e in manifest['players'] for i in e['ids']}
 with concurrent.futures.ThreadPoolExecutor(max_workers=a.workers) as pool:indexes=list(pool.map(lambda item:archive_index(item,a.stage),enumerate(SOURCE['archivesInOverrideOrder'])))
 members={row['uid']:(idx,row) for idx in sorted(indexes,key=lambda i:i['order']) for row in idx['files']};groups={};unavailable=[]
 for p in plan['players']:
  uid=p['fmUID']
  if p.get('importDisabledReason'):unavailable.append({'name':p['name'],'fmUID':uid,'reason':p['importDisabledReason']});continue
  assert uid in allow and allow[uid]['Name']==p['sourceName'] and allow[uid]['Club']==p['sourceClub'],'CSV identity changed; re-review plan'
  if any(i in existing_ids for i in p['ids']):continue
  if uid not in members:unavailable.append({'name':p['name'],'fmUID':uid,'reason':'not in indexed public player archives'});continue
  idx,row=members[uid];groups.setdefault(idx['order'],(idx,[]))[1].append((p,row))
 with concurrent.futures.ThreadPoolExecutor(max_workers=a.workers) as pool:results=[e for batch in pool.map(lambda job:convert_archive(job,a.stage,existing_paths),groups.values()) for e in batch]
 good=[e for e in results if not e.get('failed')];failed=[e for e in results if e.get('failed')];budget=sum(e['bytes'] for e in good if not e.get('reuseExisting'));paths=[e['path'] for e in good];assert len(paths)==len(set(paths)),'source ID collision in staged entries';assert budget+sum(e['bytes'] for e in manifest['players'] if e.get('source')==SOURCE['key'])<=plan['budgetBytes'],'new head budget exceeded; reduce plan, do not silently lower runtime quality'
 report={'pass':not failed,'csvSHA256':hashlib.sha256(a.csv.read_bytes()).hexdigest(),'converted':sum(not e.get('reuseExisting') for e in good),'identityExtensions':sum(bool(e.get('reuseExisting')) for e in good),'bytes':budget,'failed':failed,'unavailable':unavailable,'installed':False}
 if a.install:
  for e in good:
   if e.get('reuseExisting'):
    prior=next(p for p in manifest['players'] if p['path']==e['path']);prior.update({k:v for k,v in e.items() if k!='reuseExisting'});continue
   dest=ROOT/e['path'];assert not dest.exists();dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(a.stage/'converted'/e['fmUID']/'head.glb.gz',dest)
  manifest['players'].extend(e for e in good if not e.get('reuseExisting'));manifest['version']=int((ROOT/'VERSION').read_text().strip().lstrip('vV'));
  if good and not any(s.get('key')==SOURCE['key'] for s in manifest['sources']):manifest['sources'].append({**SOURCE,'csvSHA256':report['csvSHA256'],'note':'Selected missing identities only; no FM plugin or source archives shipped.'})
  manifest['source']='PES community and FM27 RealFaces heads; identity matched to game data';(ROOT/'assets/heads/manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n');report['installed']=True
 (a.stage/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print('REPORT',json.dumps(report,ensure_ascii=False),flush=True)
