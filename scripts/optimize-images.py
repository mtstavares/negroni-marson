from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
root=Path(__file__).resolve().parent.parent
for name in ['classico','defumado','presente-classico','presente-defumado','marca-original']:
    src=root/'docs'/'referencias'/f'{name}.png'
    im=Image.open(src).convert('RGB')
    widths=[96,256] if name=='marca-original' else ([640,1000] if name.startswith('presente') else [480,800])
    for width in widths:
        out=im.copy(); out.thumbnail((width,round(width*im.height/im.width)),Image.Resampling.LANCZOS)
        out.save(root/'assets'/f'{name}-{width}.webp','WEBP',quality=86,method=6)
og=Image.new('RGB',(1200,630),'#0B0B09'); bottle=Image.open(root/'docs/referencias/classico.png').convert('RGB'); bottle.thumbnail((370,590),Image.Resampling.LANCZOS); og.paste(bottle,(760,20))
d=ImageDraw.Draw(og)
serif=ImageFont.truetype('C:/Windows/Fonts/georgia.ttf',70)
small=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',22)
d.text((75,75),'MARSON',font=serif,fill='#E2BE7B')
d.text((78,170),'NEGRONI ARTESANAL',font=small,fill='#E2BE7B')
d.text((75,285),'Um clássico.',font=serif,fill='#F4EEE2')
d.text((75,380),'O seu momento.',font=serif,fill='#E2BE7B')
d.text((78,530),'CLÁSSICO  /  DEFUMADO  /  500 ML',font=small,fill='#F4EEE2')
og.save(root/'assets/social.jpg',quality=88,optimize=True)
print('\n'.join(f'{p.name}: {p.stat().st_size:,} bytes' for p in (root/'assets').iterdir()))
