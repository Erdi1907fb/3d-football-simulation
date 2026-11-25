#!/usr/bin/env python3
"""Bounded read-only byte-range ZIP access; refuses full archive fallback."""
import urllib.request,re,html,io,zipfile,json,pathlib,collections,concurrent.futures
def direct(public):
 s=urllib.request.urlopen(public,timeout=40).read().decode();m=re.search(r'<a[^>]*id="downloadButton"[^>]*href="([^"]+)"',s) or re.search(r'<a[^>]*href="([^"]+)"[^>]*id="downloadButton"',s);assert m,'No ordinary public download link';return html.unescape(m.group(1))
class RemoteZip(io.RawIOBase):
 def __init__(self,url):
  self.url=url;self.position=0;self.downloaded=0;self.cache=collections.OrderedDict();self.cacheBytes=0
  with urllib.request.urlopen(urllib.request.Request(url,headers={'Range':'bytes=-65536'}),timeout=60) as r:
   assert r.status==206,'Server did not honor byte range; refusing full archive download';self.total=int(r.headers['Content-Range'].split('/')[-1]);assert 0<self.total<20_000_000_000;self.tail=r.read(65537);assert len(self.tail)<=65536;self.downloaded+=len(self.tail)
 def seekable(self):return True
 def readable(self):return True
 def tell(self):return self.position
 def seek(self,offset,whence=0):assert whence in (0,1,2);self.position=offset if whence==0 else self.position+offset if whence==1 else self.total+offset;assert 0<=self.position<=self.total;return self.position
 def read(self,n=-1):
  if n<0:n=self.total-self.position
  assert 0<=n<=32_000_000,'Oversize read refused'
  n=min(n,self.total-self.position)
  if not n:return b''
  if self.position>=self.total-len(self.tail):
   out=self.tail[self.position-(self.total-len(self.tail)):self.position-(self.total-len(self.tail))+n];self.position+=len(out);return out
  key=(self.position,n)
  if key in self.cache:
   self.cache.move_to_end(key);data=self.cache[key]
  else:
   with urllib.request.urlopen(urllib.request.Request(self.url,headers={'Range':f'bytes={self.position}-{self.position+n-1}'}),timeout=60) as r:
    assert r.status==206,'Server ignored range';assert r.headers.get('Content-Range','').startswith(f'bytes {self.position}-{self.position+n-1}/');data=r.read(n+1);assert len(data)==n;self.downloaded+=len(data)
   if n<=8_000_000:
    while self.cacheBytes+n>8_000_000 and self.cache:
     _,old=self.cache.popitem(last=False);self.cacheBytes-=len(old)
    self.cache[key]=data;self.cacheBytes+=n
  self.position+=n;return data
