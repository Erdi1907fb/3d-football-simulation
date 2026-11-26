#!/usr/bin/env python3
"""Verify installed bytes/hashes and preservation against an explicit Git baseline."""
import argparse,collections,hashlib,json,pathlib,subprocess
ROOT=pathlib.Path(__file__).resolve().parents[2]
def audit(baseline):
 old=json.loads(subprocess.check_output(['git','show',baseline+':assets/heads/manifest.json'],cwd=ROOT))['players'];players=json.loads((ROOT/'assets/heads/manifest.json').read_text())['players'];before={e['path']:e for e in old};now={e['path']:e for e in players};assert len(now)==len(players),'duplicate runtime path'
 for e in players:
  blob=(ROOT/e['path']).read_bytes();assert len(blob)==e['bytes'] and hashlib.sha256(blob).hexdigest()==e['sha256'],e['path']
 for path,e in before.items():assert now[path]['sha256']==e['sha256'],'baseline asset replaced: '+path
 new=[e for e in players if e['path'] not in before]
 for e in new:assert e['bytes']<2_000_000 and e['triangles']<35_000,'new asset needs explicit geometry review: '+e['name']
 return {'pass':True,'baseline':baseline,'oldModels':len(old),'oldHashesUnchanged':len(old),'models':len(players),'newModels':len(new),'bytes':sum(e['bytes'] for e in players),'addedBytes':sum(e['bytes'] for e in new),'newSources':dict(collections.Counter(e['source'] for e in new)),'sourceFamilyBytes':{k:sum(e['bytes'] for e in players if e['source']==k) for k in sorted({e['source'] for e in players})},'newAssets':[{k:e.get(k) for k in ['name','sourceId','path','source','bytes','triangles','sha256']} for e in new]}
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--baseline',default='696eeb2');p.add_argument('--report',type=pathlib.Path);a=p.parse_args();r=audit(a.baseline)
 if a.report:a.report.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({k:v for k,v in r.items() if k!='newAssets'},ensure_ascii=False))
