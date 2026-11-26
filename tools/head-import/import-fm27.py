#!/usr/bin/env python3
"""Fetch only approved player members, with current patch precedence and bounded HTTP ranges.
Stages outside the repo; --install merges checked successes, retaining all existing heads.
No executable/plugin download. Requires numpy/Pillow. Source CSV allowlist is mandatory.
"""
import unicodedata,copy,argparse,concurrent.futures,csv,gzip,hashlib,importlib.util,json,pathlib,re,shutil,struct,zipfile,zlib
ROOT=pathlib.Path(__file__).resolve().parents[2]
def module(name,file):
 spec=importlib.util.spec_from_file_location(name,ROOT/'tools/head-import'/file);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
R=module('range_zip','range-zip.py');C=module('convert_rfh','convert-rfh.py')
def norm_name(s):return ''.join(c for c in unicodedata.normalize('NFKD',s).lower().replace('ı','i').replace('ł','l').replace('ø','o') if c.isalnum() and not unicodedata.combining(c))
def has_identity(manifest,identity):
 ids=set(identity['ids']);names={norm_name(n) for n in identity['names']};dob=identity['dateOfBirth'][:10]
 return any(ids&set(e['ids']) and e.get('dateOfBirth','')[:10]==dob and names&{norm_name(n) for n in e.get('names',[e['name']])} for e in manifest['players'])
def link_profile_identities(manifest,plan):
 """Join explicit offline IDs to a unique existing full-name+DOB head, never by name at runtime."""
 norm=lambda t:''.join(c for c in unicodedata.normalize('NFD',t).lower().replace('ı','i').replace('ł','l') if c.isalnum())
 day=lambda s:s[:10] if s else None
 registry=json.loads((ROOT/'assets/club-rosters-v75.json').read_text())['teams']
 by={}
 for e in manifest['players']:
  for name in e.get('names',[e['name']]):
   if len(norm(name))>=4:by.setdefault((norm(name),day(e.get('dateOfBirth'))),{}).update({e['path']:e})
 # Existing head families also cover explicit ESPN/live profiles outside the static roster.
 changes=[]
 for slug in plan.get('priorityProfileSlugs',[]):
  profile_path=ROOT/'assets/player-profiles'/f'{slug}.json'
  if not profile_path.exists():continue
  doc=json.loads(profile_path.read_text())
  team=registry.get(str(doc.get('providerTeamId')),{}).get('team',{})
  people=[(p,'assets/player-profiles/'+slug+'.json') for p in doc.get('players',[])]+[(p,'assets/club-rosters-v75.json') for p in team.get('players',[])+team.get('bench',[])]
  for p,profile_source in people:
   dob=day(p.get('dateOfBirth'));matches={}
   if not dob:continue
   for name in [p['name'],*p.get('aliases',[])]:
    if len(norm(name))>=4:matches.update(by.get((norm(name),dob),{}))
   if len(matches)!=1:continue
   e=next(iter(matches.values()));ids=[str(p['id'])];providers=p.get('providerIds') or {}
   if providers.get('espn'):ids.append(str(providers['espn']))
   if providers.get('fotmob'):ids.append('fm-'+str(providers['fotmob']))
   ids=list(dict.fromkeys(ids));new=[i for i in ids if i not in e['ids']]
   if not new:continue
   e['ids']=list(dict.fromkeys(e['ids']+new));e['names']=list(dict.fromkeys(e.get('names',[e['name']])+[p['name'],*p.get('aliases',[])]));e['clubs']=list(dict.fromkeys(e['clubs']+[str(doc['providerTeamId'])]));e.setdefault('profileIdentityLinks',[]).append({'ids':new,'dateOfBirth':dob,'profiles':[profile_source],'evidence':'unique explicit full-name/alias and full DOB; existing verified head'})
   changes.append({'name':e['name'],'ids':new,'path':e['path']})
 for p in plan['players']:
  if p.get('importDisabledReason'):continue
  matches={}
  for name in p.get('names',[p['name']]):
   if len(norm(name))>=4:matches.update(by.get((norm(name),day(p['dateOfBirth'])),{}))
  if len(matches)!=1:continue
  e=next(iter(matches.values()));new=[i for i in p['ids'] if i not in e['ids']]
  if not new:continue
  e['ids']=list(dict.fromkeys(e['ids']+new));e['names']=list(dict.fromkeys(e.get('names',[e['name']])+p['names']));e['clubs']=list(dict.fromkeys(e['clubs']+p['clubs']));e.setdefault('profileIdentityLinks',[]).append({'ids':new,'dateOfBirth':p['dateOfBirth'],'profiles':p.get('profileSources',[]),'evidence':'unique explicit full-name/alias plus full DOB; preserve existing asset'})
  changes.append({'name':e['name'],'ids':new,'path':e['path']})
 return changes

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
   cached=None
   if entryfile.exists():
    try:
     cached=json.loads(entryfile.read_text());b=(dest/'head.glb.gz').read_bytes()
     if hashlib.sha256(b).hexdigest()!=cached['sha256']:cached=None
    except (OSError,ValueError,KeyError):cached=None
   if cached:
    entry=cached;entry['dateOfBirth']=entry['dateOfBirth'][:10];assert entry['dateOfBirth']==identity['dateOfBirth'][:10];entry['ids']=list(dict.fromkeys(entry['ids']+identity['ids']));entry['names']=list(dict.fromkeys(entry.get('names',[entry['name']])+identity['names']));entry['clubs']=list(dict.fromkeys(entry['clubs']+identity['clubs']));results.append(entry);continue
   assert 0<member['bytes']<=12_000_000 and member['packed']<=12_000_000
   rawfile=stage/(uid+'.rfh')
   if rawfile.exists():
    prior=rawfile.read_bytes()
    if len(prior)!=member['bytes'] or zlib.crc32(prior)!=member['crc32']:rawfile.unlink()
   if not rawfile.exists():
    if z is None:remote=R.RemoteZip(R.direct(index['url']));z=zipfile.ZipFile(remote)
    raw=z.read(member['member']);assert len(raw)==member['bytes'];tempraw=rawfile.with_suffix('.rfh.tmp');tempraw.write_bytes(raw);tempraw.replace(rawfile)
   raw=rawfile.read_bytes();entry=C.convert(rawfile,dest,identity)
   if entry['path'] in existing_paths:
    old=existing_paths[entry['path']];norm=lambda t:''.join(c for c in unicodedata.normalize('NFD',t).lower().replace('ı','i').replace('ł','l') if c.isalnum())
    if not(old.get('dateOfBirth')==identity['dateOfBirth'] and norm(old['name'])==norm(identity['name'])):
     alternate={**identity,'assetKey':'fm27-'+uid};entry=C.convert(rawfile,dest,alternate);old=None
    if old is not None:
     old=copy.deepcopy(old);old['ids']=sorted(set(old['ids']+identity['ids']));old['clubs']=sorted(set(old['clubs']+identity['clubs']));old['names']=list(dict.fromkeys(old.get('names',[old['name']])+identity.get('names',[identity['name']])))
     old['identityExtension']={'fmUID':uid,'sourceCSV':SOURCE['csv'],'evidence':identity['identityEvidence']};old['reuseExisting']=True;results.append(old);print('REUSE',uid,old['name'],flush=True);continue
   assert entry['bytes']<2_000_000 and entry['triangles']<(80_000 if entry.get('geometryBudget') else 35_000),'Source exceeds 2MB/35k-triangle runtime budget; retain own portrait'
   entry.update(sourcePage=SOURCE['page'],sourceCredit=SOURCE['credit'],sourceSeason='FM27 v2 / SP Football Life 2026-27',rfhSHA256=hashlib.sha256(raw).hexdigest(),sourceArchive=index['url'],sourceMember=member['member'],identityEvidence={k:identity[k] for k in ['sourceName','sourceClub','gameClub','identityEvidence']})
   tmpentry=entryfile.with_suffix('.json.tmp');tmpentry.write_text(json.dumps(entry,ensure_ascii=False,indent=2)+'\n');tmpentry.replace(entryfile);results.append(entry);print('OK',uid,entry['name'],entry['bytes'],flush=True)
  except Exception as e:results.append({'failed':True,'fmUID':uid,'name':identity['name'],'error':repr(e)});print('FAIL',uid,repr(e),flush=True)
 if z:z.close()
 return results

if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('--stage',type=pathlib.Path,required=True);ap.add_argument('--csv',type=pathlib.Path,required=True);ap.add_argument('--install',action='store_true');ap.add_argument('--workers',type=int,default=4);ap.add_argument('--only-archives',help='comma-separated archive orders to index (e.g. 4,5 when the main parts are unreachable); override order is kept');a=ap.parse_args();a.stage.mkdir(parents=True,exist_ok=True)
 SOURCE=json.loads((ROOT/'tools/head-import/fm27-sources.json').read_text());plan=json.loads((ROOT/'tools/head-import/fm27-plan.json').read_text());allow={r['UID']:r for r in csv.DictReader(a.csv.open(encoding='utf-8-sig'),delimiter=';') if r['Club']!='Manager'}
 manifest=json.loads((ROOT/'assets/heads/manifest.json').read_text());
 for e in manifest['players']:
  if e.get('dateOfBirth'):e['dateOfBirth']=e['dateOfBirth'][:10]
 profile_links=link_profile_identities(manifest,plan);existing_paths={e['path']:e for e in manifest['players']};existing_ids={i for e in manifest['players'] for i in e['ids']}
 with concurrent.futures.ThreadPoolExecutor(max_workers=a.workers) as pool:indexes=list(pool.map(lambda item:archive_index(item,a.stage),[(o,u) for o,u in enumerate(SOURCE['archivesInOverrideOrder']) if not a.only_archives or str(o) in a.only_archives.split(',')]))
 members={row['uid']:(idx,row) for idx in sorted(indexes,key=lambda i:i['order']) for row in idx['files']};groups={};unavailable=[]
 for p in plan['players']:
  uid=p['fmUID']
  if p.get('importDisabledReason'):unavailable.append({'name':p['name'],'fmUID':uid,'reason':p['importDisabledReason']});continue
  assert uid in allow and allow[uid]['Name']==p['sourceName'] and allow[uid]['Club']==p['sourceClub'],'CSV identity changed; re-review plan'
  if has_identity(manifest,p):continue
  if uid not in members:unavailable.append({'name':p['name'],'fmUID':uid,'reason':'not in indexed public player archives'});continue
  idx,row=members[uid];groups.setdefault(idx['order'],(idx,[]))[1].append((p,row))
 with concurrent.futures.ThreadPoolExecutor(max_workers=a.workers) as pool:results=[e for batch in pool.map(lambda job:convert_archive(job,a.stage,existing_paths),groups.values()) for e in batch]
 good=[e for e in results if not e.get('failed')];failed=[e for e in results if e.get('failed')];budget=sum(e['bytes'] for e in good if not e.get('reuseExisting'));paths=[e['path'] for e in good];assert len(paths)==len(set(paths)),'source ID collision in staged entries';assert budget+sum(e['bytes'] for e in manifest['players'] if e.get('source')==SOURCE['key'])<=plan['budgetBytes'],'new head budget exceeded; reduce plan, do not silently lower runtime quality'
 report={'pass':not failed,'csvSHA256':hashlib.sha256(a.csv.read_bytes()).hexdigest(),'converted':sum(not e.get('reuseExisting') for e in good),'identityExtensions':sum(bool(e.get('reuseExisting')) for e in good),'bytes':budget,'failed':failed,'unavailable':unavailable,'installed':False,'profileIdentityLinks':profile_links}
 if a.install:
  required=sum(e['bytes'] for e in good if not e.get('reuseExisting') and not (ROOT/e['path']).exists())
  assert shutil.disk_usage(ROOT).free>required+50_000_000,'Not enough free disk for atomic head installation; stage retained for retry'
  for e in good:
   if e.get('reuseExisting'):
    prior=next(p for p in manifest['players'] if p['path']==e['path']);prior.update({k:v for k,v in e.items() if k!='reuseExisting'});continue
   dest=ROOT/e['path']
   if dest.exists():
    assert hashlib.sha256(dest.read_bytes()).hexdigest()==e['sha256'],'Existing unlisted asset differs; never overwrite another model'
   else:
    dest.parent.mkdir(parents=True,exist_ok=True);temporary=dest.with_suffix('.gz.tmp');shutil.copyfile(a.stage/'converted'/e['fmUID']/'head.glb.gz',temporary);temporary.replace(dest)
  manifest['players'].extend(e for e in good if not e.get('reuseExisting'));manifest['version']=int((ROOT/'VERSION').read_text().strip().lstrip('vV'));
  if good and not any(s.get('key')==SOURCE['key'] for s in manifest['sources']):manifest['sources'].append({**SOURCE,'csvSHA256':report['csvSHA256'],'note':'Selected missing identities only; no FM plugin or source archives shipped.'})
  manifest['source']='PES community and FM27 RealFaces heads; identity matched to game data';target=ROOT/'assets/heads/manifest.json';temporary=target.with_suffix('.json.tmp');temporary.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n');temporary.replace(target);report['installed']=True
 (a.stage/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print('REPORT',json.dumps(report,ensure_ascii=False),flush=True)
