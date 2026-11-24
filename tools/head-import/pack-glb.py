"""Loss-bounded standard glTF quantisation; <0.016 mm position error, 16-bit UVs.
Keeps existing WebP/JPEG images byte-for-byte. Requires KHR_mesh_quantization.
"""
import copy,json,struct,numpy as np
STEP=1/32768

def pack(raw):
    n=struct.unpack_from('<I',raw,12)[0];g=json.loads(raw[20:20+n]);start=28+n
    if g.get('extras',{}).get('packedGeometry')=='v243':return raw
    semantics={}
    for mesh in g['meshes']:
        for p in mesh['primitives']:
            semantics.update({i:k for k,i in p['attributes'].items()});semantics[p['indices']]='INDICES'
    old_views=g['bufferViews'];views=[];blob=bytearray();overrides={};removed=0;omitted=0
    def read(i):
        a=g['accessors'][i];v=old_views[a['bufferView']];size={'SCALAR':1,'VEC2':2,'VEC3':3}[a['type']];return np.frombuffer(raw,dtype={5126:'<f4',5125:'<u4',5123:'<u2'}[a['componentType']],count=a['count']*size,offset=start+v.get('byteOffset',0)+a.get('byteOffset',0)).reshape(-1,size)
    for mesh in g['meshes']:
        kept=[]
        for p in mesh['primitives']:
            pos=read(p['attributes']['POSITION']);valid=np.isfinite(pos).all(axis=1)
            if valid.all():kept.append(p);continue
            tris=read(p['indices']).reshape(-1,3);ok=valid[tris].all(axis=1);removed+=int((~ok).sum());tris=tris[ok]
            if not len(tris):omitted+=1;continue
            used=np.unique(tris);remap=np.full(len(pos),-1,dtype=np.int32);remap[used]=np.arange(len(used));overrides[p['indices']]=remap[tris].astype('<u2' if len(used)<65536 else '<u4').reshape(-1,1)
            for ai in p['attributes'].values():overrides[ai]=read(ai)[used]
            kept.append(p)
        mesh['primitives']=kept
    active=sorted({i for mesh in g['meshes'] for p in mesh['primitives'] for i in [p['indices'],*p['attributes'].values()]});mapping={old:new for new,old in enumerate(active)}
    if removed>max(30,g['extras']['triangles']*.02):raise ValueError('too much invalid source geometry')
    g['extras']['triangles']-=removed;g['extras']['discardedInvalidTriangles']=removed;g['extras']['omittedInvalidPrimitives']=omitted
    def add(data,target=None):
        blob.extend(b'\0'*((-len(blob))%4));v={'buffer':0,'byteOffset':len(blob),'byteLength':len(data)}
        if target:v['target']=target
        blob.extend(data);views.append(v);return len(views)-1
    for i in active:
        a=g['accessors'][i]
        v=old_views[a['bufferView']];kind=semantics[i];dtype={5126:'<f4',5125:'<u4',5123:'<u2'}[a['componentType']];size={'SCALAR':1,'VEC2':2,'VEC3':3}[a['type']];arr=np.frombuffer(raw,dtype=dtype,count=a['count']*size,offset=start+v.get('byteOffset',0)+a.get('byteOffset',0)).reshape(-1,size)
        arr=overrides.get(i,arr);a['count']=len(arr)
        if not np.isfinite(arr).all():raise ValueError('non-finite source attributes')
        if kind=='POSITION':
            if np.max(np.abs(arr))>=.999:raise ValueError('head position outside quantisation range')
            arr=np.rint(arr/STEP).astype('<i2');a['componentType']=5122
        elif kind=='NORMAL':arr=np.rint(np.clip(arr,-1,1)*127).astype('i1');a.update(componentType=5120,normalized=True)
        elif kind=='TEXCOORD_0' and arr.min()>=0 and arr.max()<=1:arr=np.rint(arr*65535).astype('<u2');a.update(componentType=5123,normalized=True)
        a.pop('byteOffset',None);a['bufferView']=add(arr.tobytes(),34963 if kind=='INDICES' else 34962)
        if 'min' in a:a['min']=arr.min(axis=0).tolist();a['max']=arr.max(axis=0).tolist()
    for im in g.get('images',[]):
        v=old_views[im['bufferView']];im['bufferView']=add(raw[start+v.get('byteOffset',0):start+v.get('byteOffset',0)+v['byteLength']])
    g['accessors']=[g['accessors'][i] for i in active]
    for mesh in g['meshes']:
        for p in mesh['primitives']:
            p['indices']=mapping[p['indices']];p['attributes']={k:mapping[v] for k,v in p['attributes'].items()}
    g['bufferViews']=views;g['buffers']=[{'byteLength':len(blob)}];g['nodes'][0]['scale']=[STEP]*3;g.setdefault('extras',{})['packedGeometry']='v243'
    for k in ['extensionsUsed','extensionsRequired']:g[k]=list(dict.fromkeys([*g.get(k,[]),'KHR_mesh_quantization']))
    data=json.dumps(g,separators=(',',':')).encode();data+=b' '*((-len(data))%4);blob+=b'\0'*((-len(blob))%4)
    return struct.pack('<III',0x46546c67,2,28+len(data)+len(blob))+struct.pack('<II',len(data),0x4e4f534a)+data+struct.pack('<II',len(blob),0x004e4942)+blob
