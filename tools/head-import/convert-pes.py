#!/usr/bin/env python3
"""Convert an explicitly selected PES/Fox head to static, metre-scale glTF 2 GLB.
External reader: the4chancup/pes-fmdl-blender (FmdlFile.py); source models stay outside git.
Preserves source mesh/UVs; bakes head-relative coordinates, not a photo-generated likeness.
"""
import argparse, importlib.util, io, json, math, pathlib, struct, zlib
import numpy as np
from PIL import Image

def ftex_image(path):
    s=path.read_bytes()
    if s[:4]==b'DDS ':return Image.open(io.BytesIO(s)).convert('RGBA')
    if s[:4]!=b'FTEX':return Image.open(path).convert('RGBA')
    fmt,w,h=struct.unpack_from('<HHH',s,8);off,usize,csize=struct.unpack_from('<III',s,64);chunks=struct.unpack_from('<H',s,78)[0]
    if chunks:
        parts=[]
        for i in range(chunks):
            size,_,pos=struct.unpack_from('<HHI',s,off+8*i);raw=s[off+(pos&0x7fffffff):off+(pos&0x7fffffff)+size];parts.append(raw if pos&0x80000000 else zlib.decompress(raw))
        raw=b''.join(parts)
    else:raw=s[off:off+(csize or usize)];raw=zlib.decompress(raw) if csize else raw
    if len(raw)!=usize:raise ValueError('Invalid mip0 length')
    four={2:b'DXT1',3:b'DXT3',4:b'DXT5'}.get(fmt,b'DX10');dx={0:28,1:61,8:80,9:83,11:98}.get(fmt)
    header=struct.pack('<4s7I44x2I4s5I2I12x',b'DDS ',124,0x81007,h,w,len(raw),0,1,32,4,four,0,0,0,0,0,0x1000,0)
    if four==b'DX10':
        if dx is None:raise ValueError('Unsupported texture format '+str(fmt))
        header+=struct.pack('<5I',dx,3,0,1,0)
    return Image.open(io.BytesIO(header+raw)).convert('RGBA')

def unpack_fpk(path):
    s=path.read_bytes()
    if s[:6]!=b'foxpk\0' and s[:6]!=b'foxfpk':raise ValueError('Not FPK')
    count=struct.unpack_from('<I',s,36)[0]
    for i in range(count):
        off,size,no,nl=struct.unpack_from('<4Q',s,48+i*48)
        if off+size>len(s) or no+nl>len(s):raise ValueError('FPK bounds')
        name=pathlib.PurePosixPath(s[no:no+nl].decode()).name
        target=path.parent/'face_fpk'/name;target.parent.mkdir(exist_ok=True);target.write_bytes(s[off:off+size])

def convert(source,out,reader,source_id,name):
    spec=importlib.util.spec_from_file_location('FmdlFile',reader/'FmdlFile.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
    for f in source.rglob('face.fpk'):unpack_fpk(f)
    models=list(source.rglob('face_high.fmdl'))+list(source.rglob('hair_high.fmdl'))+list(source.rglob('oral.fmdl'))
    if not models:raise ValueError('No head model')
    out.mkdir(parents=True,exist_ok=True);textures={p.stem.lower():p for p in source.rglob('*') if p.suffix.lower() in ['.ftex','.dds','.png','.tga']};image_cache={};blobs=bytearray();g={'asset':{'version':'2.0','generator':'next90sim PES head converter'},'scene':0,'scenes':[{'nodes':[0]}],'nodes':[{'mesh':0,'name':name}],'meshes':[{'primitives':[]}],'accessors':[],'bufferViews':[],'buffers':[],'materials':[],'images':[],'textures':[],'extras':{'schema':'next90-real-head-v1','sourceId':str(source_id),'name':name,'source':'PES 2021 community facepack','headRelative':True,'eyes':[]}}
    def buffer(data,target=None):
        while len(blobs)%4:blobs.append(0)
        start=len(blobs);blobs.extend(data);v={'buffer':0,'byteOffset':start,'byteLength':len(data)}
        if target:v['target']=target
        g['bufferViews'].append(v);return len(g['bufferViews'])-1
    def accessor(values,size,indices=False):
        raw=np.asarray(values);small=indices and raw.max()<65536;a=np.asarray(values,dtype='<u2' if small else '<u4' if indices else '<f4').reshape(-1,size);v=buffer(a.tobytes(),34963 if indices else 34962);acc={'bufferView':v,'componentType':5123 if small else 5125 if indices else 5126,'count':len(a),'type':{1:'SCALAR',2:'VEC2',3:'VEC3'}[size]}
        if not indices:acc.update(min=a.min(axis=0).tolist(),max=a.max(axis=0).tolist())
        g['accessors'].append(acc);return len(g['accessors'])-1
    def texture(stem,alpha=False,normal=False):
        key=(stem,alpha,normal)
        if key in image_cache:return image_cache[key]
        p=textures.get(stem.lower())
        if p is None:return None
        im=ftex_image(p);rgb=im.convert('RGB');rgb.thumbnail((1024,1024) if stem=='face_bsm_alp' and not normal and not alpha else (512,512),Image.Resampling.LANCZOS);a=im.getchannel('A').resize(rgb.size,Image.Resampling.LANCZOS);im=rgb.convert('RGBA');im.putalpha(a);stream=io.BytesIO()
        if alpha:im.save(stream,format='WEBP',quality=89,method=4);mime='image/webp'
        elif normal:im.convert('RGB').save(stream,format='JPEG',quality=93,subsampling=0);mime='image/jpeg'
        else:im.convert('RGB').save(stream,format='WEBP',quality=90,method=4);mime='image/webp'
        vi=buffer(stream.getvalue());g['images'].append({'bufferView':vi,'mimeType':mime,'name':stem});g['textures'].append({'extensions':{'EXT_texture_webp':{'source':len(g['images'])-1}}} if mime=='image/webp' else {'source':len(g['images'])-1});
        if mime=='image/webp':g['extensionsUsed']=['EXT_texture_webp'];g['extensionsRequired']=['EXT_texture_webp']
        idx=len(g['textures'])-1;image_cache[key]=idx;return idx
    origin=None;skin_samples=[];material_cache={}
    for file in models:
        f=mod.FmdlFile();f.readFile(str(file));head=next((b for b in f.bones if b.name=='sk_head'),None)
        if origin is None:
            origin=np.array([getattr(head.globalPosition,k) for k in ['x','y','z']]) if head else np.array([0,1.640058,.05433])
            if not 1.60<origin[1]<1.72:origin=np.array([0,1.640058,.05433055])
            for side in ['l','r']:
                lids=[b for b in f.bones if b.name in ['skf_eyelid_t_'+side,'skf_eyelid_b_'+side]]
                if lids:
                    eye=np.mean([[getattr(b.globalPosition,k) for k in ['x','y','z']] for b in lids],axis=0)-origin;eye[2]-=.009;g['extras']['eyes'].append(eye.tolist())
        for mesh in f.meshes:
            mat=mesh.materialInstance;texmap={role:pathlib.Path(t.filename).stem.lower() for role,t in mat.textures};base=texmap.get('Base_Tex_SRGB');hair=bool(mesh.alphaFlags&128) or 'Hair' in mat.technique or bool(base and ('hair_parts' in base or 'beard_parts' in base or 'cap_parts' in base));skin=base=='face_bsm_alp';eyeocc='occlusion' in mat.name.lower();lashes='eyelash' in mat.name.lower()
            # Wet waterline and unsupported common lash geometry are optional cosmetic layers.
            if not base or (base not in textures and (eyeocc or lashes)):continue
            if base not in textures:continue
            positions=np.array([[v.position.x,v.position.y,v.position.z] for v in mesh.vertices])-origin
            if base in ['eye','eye_bsm','eye_sclera_bsm']:continue
            if base.startswith('eye_occlusion'):
                eyes=[]
                for sign in [1,-1]:
                    part=positions[positions[:,0]*sign>0]
                    if len(part):eyes.append([float((part[:,0].min()+part[:,0].max())/2),float((part[:,1].min()+part[:,1].max())/2),float(part[:,2].min()-.006)])
                if len(eyes)==2:g['extras']['eyes']=eyes
                continue
            # Retain a short actual source neck, leaving the existing animated lower neck/body intact.
            vertex_ids={id(v):i for i,v in enumerate(mesh.vertices)}
            faces=[[vertex_ids[id(v)] for v in reversed(face.vertices)] for face in mesh.faces]
            faces=[ids for ids in faces if min(positions[i,1] for i in ids)>=-.27]
            if not faces:continue
            signature=(base,texmap.get('NormalMap_Tex_NRM'),hair,eyeocc,lashes)
            if signature not in material_cache:
                alpha=bool(hair or eyeocc or lashes);mi={'name':mat.name,'extras':{'next90Skin':skin},'pbrMetallicRoughness':{'baseColorFactor':[1,1,1,1],'metallicFactor':0,'roughnessFactor':.65 if hair else .82},'doubleSided':bool(alpha)};ti=texture(base,alpha)
                if ti is not None:mi['pbrMetallicRoughness']['baseColorTexture']={'index':ti}
                if eyeocc:mi.update(alphaMode='BLEND')
                elif alpha:mi.update(alphaMode='MASK',alphaCutoff=.22 if hair else .08)
                # PES normals may store gloss in alpha; decode only RGB normal channels.
                ni=texture(texmap.get('NormalMap_Tex_NRM',''),False,True)
                if ni is not None and not eyeocc:mi['normalTexture']={'index':ni,'scale':.45}
                if skin and not skin_samples:
                    im=np.array(ftex_image(textures[base]));samples=[]
                    for vertex,point in zip(mesh.vertices,positions):
                        if -.19<point[1]<-.08 and abs(point[0])<.065 and point[2]>.025 and vertex.uv:
                            u,v=vertex.uv[0].u,vertex.uv[0].v;pixel=im[min(im.shape[0]-1,max(0,int(v*im.shape[0]))),min(im.shape[1]-1,max(0,int(u*im.shape[1]))),:3]
                            if pixel[0]>25 and pixel.max()<250:samples.append(pixel)
                    pix=np.asarray(samples) if len(samples)>8 else im[int(im.shape[0]*.68):int(im.shape[0]*.84),int(im.shape[1]*.35):int(im.shape[1]*.65),:3].reshape(-1,3)
                    skin_samples.extend(np.median(pix,axis=0).astype(int).tolist())
                g['materials'].append(mi);material_cache[signature]=len(g['materials'])-1
            used=sorted({i for face in faces for i in face});remap={old:new for new,old in enumerate(used)};faces=[[remap[i] for i in face] for face in faces];positions=positions[used];verts=[mesh.vertices[i] for i in used]
            normals=[[v.normal.x,v.normal.y,v.normal.z] if v.normal else [0,0,1] for v in verts];uvs=[[v.uv[0].u,v.uv[0].v] if v.uv else [0,0] for v in verts]
            g['meshes'][0]['primitives'].append({'attributes':{'POSITION':accessor(positions,3),'NORMAL':accessor(normals,3),'TEXCOORD_0':accessor(uvs,2)},'indices':accessor(faces,1,True),'material':material_cache[signature]})
    # The source game supplies shared eyeballs outside face.fpk. Bake portable eyes at
    # the imported eyelid apertures, retaining the supplied iris texture when available.
    g['extras']['hasEyes']=True
    eye_material=len(g['materials']);g['materials'].append({'name':'portable-eye-white','pbrMetallicRoughness':{'baseColorFactor':[.38,.37,.35,1],'roughnessFactor':.52,'metallicFactor':0}})
    iris_material=len(g['materials']);iris_pbr={'baseColorFactor':[.085,.061,.038,1],'roughnessFactor':.5,'metallicFactor':0}
    if 'eye' in textures:
        eye_im=ftex_image(textures['eye']).convert('RGB');w,h=eye_im.size
        if sum(eye_im.getpixel((w//2,h//2)))<250:
            iris_im=eye_im.crop((int(w*.29),int(h*.29),int(w*.71),int(h*.71))).resize((128,128),Image.Resampling.LANCZOS);stream=io.BytesIO();iris_im.save(stream,format='JPEG',quality=95,subsampling=0);vi=buffer(stream.getvalue());g['images'].append({'bufferView':vi,'mimeType':'image/jpeg','name':'source-iris'});g['textures'].append({'source':len(g['images'])-1});iris_pbr.update(baseColorFactor=[1,1,1,1],baseColorTexture={'index':len(g['textures'])-1});g['extras']['sourceIris']=True
    g['materials'].append({'name':'portable-source-iris','pbrMetallicRoughness':iris_pbr})
    pupil_material=len(g['materials']);g['materials'].append({'name':'portable-pupil','pbrMetallicRoughness':{'baseColorFactor':[.004,.005,.006,1],'roughnessFactor':.35,'metallicFactor':0}})
    def primitive(pos,normals,uvs,faces,material):g['meshes'][0]['primitives'].append({'attributes':{'POSITION':accessor(pos,3),'NORMAL':accessor(normals,3),'TEXCOORD_0':accessor(uvs,2)},'indices':accessor(faces,1,True),'material':material})
    for eye in g['extras']['eyes']:
        eye=np.array(eye);pos=[];normals=[];uv=[];faces=[]
        for iy in range(13):
            phi=math.pi*iy/12
            for ix in range(17):
                theta=math.pi*2*ix/16;n=np.array([-math.cos(theta)*math.sin(phi),math.cos(phi),math.sin(theta)*math.sin(phi)]);pos.append((eye+n*.012).tolist());normals.append(n.tolist());uv.append([ix/16,iy/12])
        for iy in range(12):
            for ix in range(16):
                a=iy*17+ix+1;b=a-1;c=(iy+1)*17+ix;d=c+1
                if iy:faces.append([a,b,d])
                if iy<11:faces.append([b,c,d])
        primitive(pos,normals,uv,faces,eye_material)
        for radius,depth,material in [(.0055,.0122,iris_material)]+([] if g['extras'].get('sourceIris') else [(.0025,.0125,pupil_material)]):
            pos=[(eye+np.array([0,0,depth])).tolist()];uv=[[.5,.5]]
            for i in range(33):
                a=i*math.pi*2/32;pos.append((eye+np.array([math.cos(a)*radius,math.sin(a)*radius,depth])).tolist());uv.append([.5+math.cos(a)*.5,.5-math.sin(a)*.5])
            primitive(pos,[[0,0,1]]*len(pos),uv,[[0,i+1,i+2] for i in range(32)],material)
    g['extras']['skinRGB']=skin_samples;g['extras']['sourceHeadOrigin']=origin.tolist();g['extras']['triangles']=sum(g['accessors'][p['indices']]['count']//3 for p in g['meshes'][0]['primitives']);g['buffers']=[{'byteLength':len(blobs)}]
    text=json.dumps(g,separators=(',',':')).encode();text+=b' '*((-len(text))%4);blobs+=b'\0'*((-len(blobs))%4);data=struct.pack('<III',0x46546c67,2,28+len(text)+len(blobs))+struct.pack('<II',len(text),0x4e4f534a)+text+struct.pack('<II',len(blobs),0x004e4942)+blobs;dest=out/'head.glb';dest.write_bytes(data);return {'bytes':len(data),'triangles':g['extras']['triangles'],'meshes':len(g['meshes'][0]['primitives']),'eyes':g['extras']['eyes'],'skinRGB':skin_samples}
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('source',type=pathlib.Path);p.add_argument('out',type=pathlib.Path);p.add_argument('--reader',type=pathlib.Path,required=True);p.add_argument('--id',required=True);p.add_argument('--name',required=True);a=p.parse_args();print(json.dumps(convert(a.source,a.out,a.reader,a.id,a.name)))
