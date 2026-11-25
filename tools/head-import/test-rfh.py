#!/usr/bin/env python3
"""Build-tool validation, using synthetic RFH bytes; no copyrighted fixture required."""
import importlib.util,struct,zlib,unittest,numpy as np
from pathlib import Path
spec=importlib.util.spec_from_file_location('rfh',Path(__file__).with_name('convert-rfh.py'));C=importlib.util.module_from_spec(spec);spec.loader.exec_module(C)
def container(tags):return b'RFH1'+struct.pack('<II',1,len(tags))+b''.join(tag+struct.pack('<I',len(data))+data for tag,data in tags)
def triangle():
 p=np.array([[0,1.6,.1],[.1,1.6,.1],[0,1.7,.1]],dtype='<f4');uv=np.array([[0,0],[1,0],[0,1]],dtype='<f4');normal=np.tile([0,0,32767],(3,1)).astype('<i2');bi=np.zeros((3,4),dtype='u1');bw=bi.copy();bw[:,0]=255;idx=np.array([0,1,2],dtype='<u4');return struct.pack('<II',3,3)+p.tobytes()+uv.tobytes()+normal.tobytes()+bi.tobytes()+bw.tobytes()+idx.tobytes()
class Format(unittest.TestCase):
 def test_mesh_roundtrip(self):
  p,uv,n,idx,bi,bw=C.mesh(zlib.compress(triangle()));self.assertEqual(idx.tolist(),[[0,1,2]]);self.assertTrue(np.allclose(n,[0,0,1]));self.assertEqual(bw[0].tolist(),[255,0,0,0])
 def test_section_bounds_and_duplicates(self):
  b=container([(b'META',b'{}')]);self.assertEqual(C.sections(b)['META'],b'{}')
  for bad in [b[:-1],b+b'junk',container([(b'META',b'{}'),(b'META',b'{}')]),b'BAD!'+b[4:]]:
   with self.assertRaises((AssertionError,struct.error)):C.sections(bad)
 def test_mesh_rejects_truncated_or_bad_index(self):
  raw=triangle()
  for bad in [raw[:-1],raw[:-4]+struct.pack('<I',99),struct.pack('<II',999999,3)+raw[8:]]:
   with self.assertRaises((AssertionError,ValueError)):C.mesh(zlib.compress(bad))
 def test_inflate_budget(self):
  with self.assertRaises(AssertionError):C.mesh(zlib.compress(b'0'*8_000_002))
 def test_nonfinite_position(self):
  b=bytearray(triangle());struct.pack_into('<f',b,8,float('nan'))
  with self.assertRaises(AssertionError):C.mesh(zlib.compress(b))
class RangeReader(unittest.TestCase):
 def test_bounded_cache_and_full_download_refusal(self):
  import io,unittest.mock
  spec=importlib.util.spec_from_file_location('range_zip',Path(__file__).with_name('range-zip.py'));R=importlib.util.module_from_spec(spec);spec.loader.exec_module(R)
  payload=b'a'*20_000_000
  class Response(io.BytesIO):
   status=206
   def __init__(self,start,end):
    super().__init__(payload[start:end+1]);self.headers={'Content-Range':f'bytes {start}-{end}/{len(payload)}'}
  def fetch(request,**_):
   value=request.get_header('Range').split('=')[1]
   if value.startswith('-'):start,end=len(payload)-int(value[1:]),len(payload)-1
   else:start,end=map(int,value.split('-'))
   return Response(start,end)
  with unittest.mock.patch.object(R.urllib.request,'urlopen',fetch):
   r=R.RemoteZip('https://example.invalid/archive.zip');self.assertEqual(r.total,len(payload))
   r.seek(0);self.assertEqual(len(r.read(9_000_000)),9_000_000);self.assertEqual(r.cacheBytes,0)
   for at in [0,4_000_000,8_000_000]:r.seek(at);self.assertEqual(len(r.read(4_000_000)),4_000_000);self.assertLessEqual(r.cacheBytes,8_000_000)
   r.seek(0)
   with self.assertRaises(AssertionError):r.read(32_000_001)
  bad=Response(0,10);bad.status=200
  with unittest.mock.patch.object(R.urllib.request,'urlopen',return_value=bad):
   with self.assertRaises(AssertionError):R.RemoteZip('https://example.invalid/archive.zip')
if __name__=='__main__':unittest.main()
