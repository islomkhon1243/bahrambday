from PIL import Image,ImageOps
from pathlib import Path
src=Path.cwd().parents[1]/'assets'
out=Path('dist/assets')
items={'bahram-hero.png':('hero.webp',1500),'photo_2026-10-21_15-11-41.jpg':('portrait.webp',1000),'photo_2026-10-21_15-11-59.jpg':('waterfall.webp',1300),'photo_2026-10-21_15-12-03.jpg':('fighter.webp',1000),'photo_2026-10-21_15-12-06.jpg':('okay.webp',850),'photo_2026-10-21_15-12-09.jpg':('cheers.webp',850),'photo_2026-10-21_15-12-11.jpg':('friends.webp',1100)}
for name,(target,width) in items.items():
 im=ImageOps.exif_transpose(Image.open(src/name))
 if im.width>width:im.thumbnail((width,5000),Image.Resampling.LANCZOS)
 im.save(out/target,'WEBP',quality=88,method=6)
 print(target,(out/target).stat().st_size)
