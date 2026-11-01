#!/usr/bin/env python3
"""Import large images from the original DE-YI Classic Works pages into this repository.
Run only for images the website owner has authorized for republication.
Never use unknown third-party real-estate imagery or guess photo identities.
"""
import io,json,re,time
from pathlib import Path
from urllib.parse import urljoin,urlparse
import requests
from bs4 import BeautifulSoup
from PIL import Image,ImageOps

YEARS=list(range(2023,2001,-1))
DEST=Path('assets/official')
DEST.mkdir(parents=True,exist_ok=True)
UA={'User-Agent':'Mozilla/5.0 (compatible; DEYI-archive-migration/1.0)'}
NAMES={
 2023:['等露','尋常院','借墨','掬茶金'],
 2022:['海洋恰恰','知一二','金宴'],
 2021:['一院久樹','山茶花森','花曆河','日光耶加'],
 2018:['白鹿山丘','18富','大藏'],
 2017:['和簷．悅舍','河日子','得邑萬市興'],
 2016:['里山六帖','早稻墅','得邑希真'],
 2015:['得邑倫敦大道','得邑巨商','墨問'],
 2014:['得邑．羅森堡','得邑捷市堡','得邑大道東','得邑道後'],
 2013:['得邑愛丁堡Ⅱ','得邑獅子堡','得邑香波堡Ⅱ','得邑佩納堡'],
 2009:['寬御','河堤大樂 No. 12','青年巨商No.13','青年巨商No.15']
}
session=requests.Session();session.headers.update(UA)
manifest={}
for year in YEARS:
 page=None
 for base in ['https://www.de-yi.com.tw/','http://www.de-yi.com.tw/']:
  try:
   res=session.get(base+str(year)+'.htm',timeout=9)
   if res.ok and len(res.content)>1500:
    page=res;break
  except requests.RequestException as exc:
   print(f'{year}: {type(exc).__name__}: {str(exc)[:130]}',flush=True)
 if page is None:
  print(f'{year}: source page could not be fetched',flush=True);continue
 page.encoding=page.apparent_encoding or 'utf-8'
 soup=BeautifulSoup(page.text,'html.parser')
 imgs=[]
 for img in soup.find_all('img'):
  src=img.get('data-src') or img.get('data-original') or img.get('src')
  if not src:continue
  src=src.split(',')[0].strip()
  if src.startswith('data:'):continue
  src=urljoin(page.url,src)
  low=src.lower()
  if any(bad in low for bad in ['logo','icon','btn','arrow','loader','facebook','line_','facebook','logo','sprite']):continue
  if src not in imgs:imgs.append(src)
 print(f'{year}: found {len(imgs)} candidate image links, e.g. {imgs[:3]}',flush=True)
 saved=[]
 folder=DEST/str(year);folder.mkdir(exist_ok=True)
 for idx,url in enumerate(imgs):
  if len(saved)>=8:break
  try:
   res=session.get(url,timeout=12,headers={'Referer':page.url})
   res.raise_for_status()
   if len(res.content)>8_000_000:continue
   im=Image.open(io.BytesIO(res.content))
   im=ImageOps.exif_transpose(im).convert('RGB')
   if im.width<460 or im.height<260:continue
   # Avoid wide navigation banners, tiny thumbnail placeholders, and irrelevant icons.
   if im.width/im.height>4.5:continue
   im.thumbnail((1350,1350),Image.Resampling.LANCZOS)
   dst=folder/f'photo-{len(saved)+1:02}.webp'
   im.save(dst,'WEBP',quality=86,method=5)
   saved.append({'src':dst.as_posix(),'source':url,'width':im.width,'height':im.height})
  except Exception as exc:
   print(f'  image skipped: {url}: {type(exc).__name__}',flush=True)
 if not saved:
  print(f'{year}: no eligible full-size images downloaded',flush=True);continue
 # The first large photo is used as the YEAR cover only. No false project
 # matching: project photo associations must be independently confirmed.
 manifest[str(year)]={'cover':saved[0]['src'],'gallery':saved,'names':NAMES.get(year,[]),'official_page':page.url}
 print(f'{year}: saved {len(saved)} real images',flush=True)
 time.sleep(.2)
(DEST/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'DONE: {len(manifest)} years, {sum(len(y["gallery"]) for y in manifest.values())} downloaded pictures',flush=True)
