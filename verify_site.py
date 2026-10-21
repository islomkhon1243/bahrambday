from pathlib import Path
from bs4 import BeautifulSoup
import re
root=Path('dist');bad=[]
for p in root.glob('*.html'):
 s=BeautifulSoup(p.read_text(encoding='utf-8'),'html.parser')
 ids={x.get('id') for x in s.select('[id]')}
 for el in s.select('[src],[href]'):
  ref=el.get('src') or el.get('href')
  if not ref or ref.startswith(('https:','http:','data:')):continue
  file,_,anchor=ref.partition('#')
  if file and not (root/file).is_file():bad.append((p.name,ref))
  if not file and anchor and anchor not in ids:bad.append((p.name,ref))
 print(p.name,'sections',len(s.select('section')),'images',len(s.select('img')))
for p in root.glob('*.css'):
 css=re.sub(r'url\("data:.*?"\)', '', p.read_text(encoding='utf-8'))
 for ref in re.findall(r'url\([\"\']?([^\)\"\']+)',css):
  if not ref.startswith(('data:','http')) and not (root/ref).is_file():bad.append((p.name,ref))
print('Missing references:',bad)
print('Published payload MB:',round(sum(p.stat().st_size for p in root.rglob('*') if p.is_file())/1048576,2))
assert not bad
