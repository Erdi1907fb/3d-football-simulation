#!/usr/bin/env python3
"""Convert a selected RFH1 source to the shared head schema; no FM plugin execution.
Requires numpy/Pillow. Does not mutate runtime manifests or game identities.
"""
import sys,json,struct,zlib,io,math,pathlib,hashlib,gzip,importlib.util,subprocess
import numpy as np
from PIL import Image
ROOT=pathlib.Path(__file__).resolve().parents[2]
def sections(b):
 assert b[:4]==b'RFH1' and struct.unpack_from('<I',b,4)[0]==1
 n=struct.unpack_from('<I',b,8)[0];assert 0<n<32;o=12;out={}
 for _ in range(n):
  tag=b[o:o+4].decode();size=struct.unpack_from('<I',b,o+4)[0];o+=8;assert tag not in out and o+size<=len(b);out[tag]=b[o:o+size];o+=size
 assert o==len(b);return out
def mesh(b):
 dec=zlib.decompressobj();r=dec.decompress(b,8_000_001);assert dec.eof and len(r)<=8_000_000,'Mesh exceeds decompression budget';v,n=struct.unpack_from('<II',r);assert v<100000 and n<240000 and n%3==0 and len(r)==8+v*34+n*4
 p=np.frombuffer(r,'<f4',v*3,8).reshape(v,3).copy();uv=np.frombuffer(r,'<f4',v*2,8+v*12).reshape(v,2).copy();normal=np.frombuffer(r,'<i2',v*3,8+v*20).reshape(v,3).astype(float)/32767;j=8+v*26;bi=np.frombuffer(r,'u1',v*4,j).reshape(v,4);bw=np.frombuffer(r,'u1',v*4,j+v*4).reshape(v,4);indices=np.frombuffer(r,'<u4',n,8+v*34).reshape(-1,3).copy();assert np.isfinite(p).all() and np.isfinite(uv).all() and indices.max()<v
 return p,uv,normal,indices,bi,bw
def convert(file,out,identity):
 flip=True
 sec=sections(file.read_bytes());meta=json.loads(sec['META']);sid=meta['source'].replace('\\','/').split('/')[-1].split('_')[0];assert sid.isascii() and sid.isdigit() and len(sid)<=12;assert identity['ids'] and identity['dateOfBirth'] and str(identity['fmUID']).isdigit();name=identity['name'];origin=np.array([0,1.640058,.05433055]);shift=np.array(meta['shift']);face=mesh(sec['FMSH']);hair=mesh(sec['HMSH']) if 'HMSH' in sec else None
 if hair is not None and len(hair[3])<=1 and np.ptp(hair[0],axis=0).max()<.0001:hair=None
 blob=bytearray();g={'asset':{'version':'2.0','generator':'next90 RFH pilot'},'scene':0,'scenes':[{'nodes':[0]}],'nodes':[{'mesh':0,'name':name}],'meshes':[{'primitives':[]}],'accessors':[],'bufferViews':[],'buffers':[],'materials':[],'images':[],'textures':[],'extensionsUsed':['EXT_texture_webp'],'extensionsRequired':['EXT_texture_webp'],'extras':{'schema':'next90-real-head-v1','sourceId':sid,'name':name,'source':'FM27 Real 3D Faces / SP Football Life','headRelative':True,'sourceHeadOrigin':origin.tolist(),'eyes':[],'hasEyes':True}}
 def buf(data,target=None):
  blob.extend(b'\0'*((-len(blob))%4));o=len(blob);blob.extend(data);v={'buffer':0,'byteOffset':o,'byteLength':len(data)}
  if target:v['target']=target
  g['bufferViews'].append(v);return len(g['bufferViews'])-1
 def acc(a,size,index=False):
  a=np.asarray(a,dtype='<u2' if index and np.max(a)<65536 else '<u4' if index else '<f4').reshape(-1,size);g['accessors'].append({'bufferView':buf(a.tobytes(),34963 if index else 34962),'componentType':5123 if a.dtype==np.dtype('<u2') else 5125 if index else 5126,'count':len(a),'type':{1:'SCALAR',2:'VEC2',3:'VEC3'}[size],**({} if index else {'min':a.min(0).tolist(),'max':a.max(0).tolist()})});return len(g['accessors'])-1
 def texture(im,name,maxdim,alpha=False):
  rgb=im.convert('RGB');rgb.thumbnail((maxdim,maxdim),Image.Resampling.LANCZOS)
  if alpha:a=im.getchannel('A').resize(rgb.size,Image.Resampling.LANCZOS);rgb=rgb.convert('RGBA');rgb.putalpha(a)
  stream=io.BytesIO();rgb.save(stream,'WEBP',quality=89 if alpha else 90,method=4);g['images'].append({'bufferView':buf(stream.getvalue()),'mimeType':'image/webp','name':name});g['textures'].append({'extensions':{'EXT_texture_webp':{'source':len(g['images'])-1}}});return len(g['textures'])-1
 def prim(p,n,uv,ids,mat):g['meshes'][0]['primitives'].append({'attributes':{'POSITION':acc(p,3),'NORMAL':acc(n,3),'TEXCOORD_0':acc(uv,2)},'indices':acc(ids,1,True),'material':mat})
 im=Image.open(io.BytesIO(sec['FTEX'])).convert('RGB');ft=texture(im,'face_bsm_alp',1024);g['materials'].append({'name':'face','extras':{'next90Skin':True},'pbrMetallicRoughness':{'baseColorTexture':{'index':ft},'metallicFactor':0,'roughnessFactor':.82}})
 for mat,data in enumerate([face]+([hair] if hair is not None else [])):
  p,uv,n,ids,bi,bw=data;p=p-shift-origin
  if flip:uv[:,1]=1-uv[:,1]
  if mat:
   h=Image.open(io.BytesIO(sec['HCOL'])).convert('RGBA');h.putalpha(Image.open(io.BytesIO(sec['HALP'])).convert('L'));ht=texture(h,'hair_parts',512,True);g['materials'].append({'name':'hair','alphaMode':'MASK','alphaCutoff':.22,'doubleSided':True,'pbrMetallicRoughness':{'baseColorTexture':{'index':ht},'metallicFactor':0,'roughnessFactor':.7}})
  else:
   pix=[];arr=np.asarray(im)
   for point,(u,v) in zip(p,uv):
    if -.19<point[1]<-.08 and abs(point[0])<.065 and point[2]>.025:
     px=arr[min(arr.shape[0]-1,max(0,int(v*arr.shape[0]))),min(arr.shape[1]-1,max(0,int(u*arr.shape[1])))];
     if px[0]>25 and px.max()<250:pix.append(px)
   if not pix:pix=arr[int(arr.shape[0]*.68):int(arr.shape[0]*.84),int(arr.shape[1]*.35):int(arr.shape[1]*.65)].reshape(-1,3)
   g['extras']['skinRGB']=np.median(np.array(pix),axis=0).astype(int).tolist()
  if mat and len(face[3])+len(ids)+832>=35_000:
   # Source face stays byte-for-byte geometrically identical. Simplify hair indices
   # with locked card borders and normal/UV error weights; never move vertices.
   target=min(20_000,34_000-len(face[3])-832);assert target>0,'Face alone exceeds geometry budget'
   job={'positions':p.reshape(-1).tolist(),'indices':ids.reshape(-1).tolist(),'attributes':np.concatenate([n,uv],axis=1).reshape(-1).tolist(),'target':target}
   result=json.loads(subprocess.run(['node',str(ROOT/'tools/head-import/simplify-hair.cjs')],input=json.dumps(job),text=True,capture_output=True,check=True).stdout);ids=np.array(result['indices'],dtype=np.uint32).reshape(-1,3)
   assert result['error']<=.01001 and len(face[3])+len(ids)+832<35_000,'Hair exceeds appearance/triangle budget'
   g['extras']['hairSimplification']={'sourceTriangles':len(data[3]),'triangles':len(ids),'relativeError':result['error'],'method':'meshoptimizer1.3.0 attribute-aware; locked card borders; face untouched'}
  used=np.unique(ids);remap=np.full(len(p),-1,dtype=np.int32);remap[used]=np.arange(len(used));prim(p[used],n[used],uv[used],remap[ids[:,[0,2,1]]],mat)
 # Portable eyes from source eyelash Y/Z and the FM-transferred eyelid aperture X.
 fp,uv,n,ids,bi,bw=face
 for sign,bones in [(-1,[10,11]),(1,[13,14])]:
  w=np.where(np.isin(bi,bones),bw,0).sum(1);part=fp[w>50];x=float(np.median(part[:,0])) if len(part) else sign*.031
  eye=np.array([x,meta['pesEyeY'],meta['pesEyeZ']-.009])-origin;g['extras']['eyes'].append(eye.tolist())
  mat=len(g['materials']);g['materials'].append({'name':'portable-white','pbrMetallicRoughness':{'baseColorFactor':[.38,.37,.35,1],'roughnessFactor':.52,'metallicFactor':0}});pos=[];norm=[];uv=[];tri=[]
  for iy in range(13):
   phi=math.pi*iy/12
   for ix in range(17):
    theta=math.pi*2*ix/16;nn=np.array([-math.cos(theta)*math.sin(phi),math.cos(phi),math.sin(theta)*math.sin(phi)]);pos.append((eye+nn*.012).tolist());norm.append(nn.tolist());uv.append([ix/16,iy/12])
  for iy in range(12):
   for ix in range(16):
    a=iy*17+ix+1;b=a-1;c=(iy+1)*17+ix;d=c+1
    if iy:tri.append([a,b,d])
    if iy<11:tri.append([b,c,d])
  prim(pos,norm,uv,tri,mat)
  for radius,depth,color in [(.0055,.0122,[.085,.061,.038,1]),(.0025,.0125,[.004,.005,.006,1])]:
   mat=len(g['materials']);g['materials'].append({'name':'portable-iris','pbrMetallicRoughness':{'baseColorFactor':color,'roughnessFactor':.5,'metallicFactor':0}});pos=[(eye+np.array([0,0,depth])).tolist()];uv=[[.5,.5]]
   for i in range(33):
    a=i*math.pi*2/32;pos.append((eye+np.array([math.cos(a)*radius,math.sin(a)*radius,depth])).tolist());uv.append([.5+math.cos(a)*.5,.5-math.sin(a)*.5])
   prim(pos,[[0,0,1]]*len(pos),uv,[[0,i+1,i+2] for i in range(32)],mat)
 g['extras']['triangles']=sum(g['accessors'][p['indices']]['count']//3 for p in g['meshes'][0]['primitives']);g['buffers']=[{'byteLength':len(blob)}];text=json.dumps(g,separators=(',',':')).encode();text+=b' '*((-len(text))%4);blob+=b'\0'*((-len(blob))%4);raw=struct.pack('<III',0x46546c67,2,28+len(text)+len(blob))+struct.pack('<II',len(text),0x4e4f534a)+text+struct.pack('<II',len(blob),0x004e4942)+blob
 spec=importlib.util.spec_from_file_location('pack',ROOT/'tools/head-import/pack-glb.py');pack=importlib.util.module_from_spec(spec);spec.loader.exec_module(pack);raw=pack.pack(raw);b=gzip.compress(raw,compresslevel=9,mtime=0);out.mkdir(parents=True,exist_ok=True);(out/'head.glb.gz').write_bytes(b);entry={'fmUID':str(identity['fmUID']),'names':identity.get('names',[name]),'sourceId':sid,'name':name,'ids':identity['ids'],'clubs':identity['clubs'],'dateOfBirth':identity['dateOfBirth'],'source':'fm27-realfaces-v2','path':f'assets/heads/pes/{sid}/head.glb.gz','bytes':len(b),'rawBytes':len(raw),'sha256':hashlib.sha256(b).hexdigest(),'skinRGB':g['extras']['skinRGB'],'triangles':g['extras']['triangles'],'eyes':g['extras']['eyes'],'hairSimplification':g['extras'].get('hairSimplification')};return entry
if __name__=='__main__':
 import argparse
 ap=argparse.ArgumentParser();ap.add_argument('rfh',type=pathlib.Path);ap.add_argument('out',type=pathlib.Path);ap.add_argument('--identity',type=pathlib.Path,required=True);a=ap.parse_args();entry=convert(a.rfh,a.out,json.loads(a.identity.read_text()));print(json.dumps(entry,ensure_ascii=False))
