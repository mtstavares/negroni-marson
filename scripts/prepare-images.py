"""Prepare responsive images from the brand's original files.

Requires Pillow with AVIF support. No asset is enlarged beyond its source.
The production build uses these files without requiring Python or Pillow.
"""
from pathlib import Path
import json
from PIL import Image, features

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / 'assets'
REFERENCES = ROOT / 'docs' / 'referencias'

if not features.check('avif'):
    raise SystemExit('Esta preparação requer Pillow com suporte a AVIF.')

report = {}


def export(slug, image, widths, quality=88):
    """Export native or downsampled variants; never synthesize extra pixels."""
    report[slug] = {'sourceWidth': image.width, 'sourceHeight': image.height, 'files': []}
    for width in widths:
        if width > image.width:
            raise ValueError(f'{slug}: largura {width} excede o original {image.width}.')
        resized = image.resize((width, round(width * image.height / image.width)), Image.Resampling.LANCZOS)
        for extension in ['webp', 'avif']:
            output = ASSETS / f'{slug}-{width}.{extension}'
            options = {'quality': quality, 'method': 6} if extension == 'webp' else {'quality': 70, 'speed': 6, 'subsampling': '4:4:4'}
            resized.save(output, extension.upper(), **options)
            report[slug]['files'].append({'path': f'assets/{output.name}', 'width': width, 'height': resized.height, 'bytes': output.stat().st_size})


for name in ['classico', 'defumado']:
    with Image.open(REFERENCES / f'{name}.png') as original:
        export(name, original.convert('RGB'), [320, 480, 800, 1024], quality=90)

for name in ['presente-classico', 'presente-defumado']:
    with Image.open(REFERENCES / f'{name}.png') as original:
        export(name, original.convert('RGB'), [480, 640, 960, 1216], quality=90)

with Image.open(REFERENCES / 'marca-original.png') as original:
    export('marca-original', original.convert('RGB'), [96, 256])

# These are the exact visible artwork bounds from the supplied captures.
# Cutting the surrounding social interface reduces decoding and network cost.
captures = [
    ('rotulo-detalhe', 'WhatsApp Image 2026-11-09 at 14.14.28 (1).jpeg', (365, 275, 725, 985), [360]),
    ('como-servir-arte', 'WhatsApp Image 2026-11-09 at 14.14.27 (1).jpeg', (0, 98, 540, 638), [360, 540]),
    ('bons-encontros-arte', 'WhatsApp Image 2026-11-09 at 14.14.27 (2).jpeg', (0, 86, 540, 806), [360, 540]),
    ('origem-amparo-arte', 'WhatsApp Image 2026-11-09 at 14.14.28.jpeg', (0, 217, 540, 937), [360, 540]),
]
for slug, filename, bounds, widths in captures:
    with Image.open(ASSETS / filename) as original:
        export(slug, original.convert('RGB').crop(bounds), widths, quality=92)

# Small browser icons do not need six embedded bitmap resolutions.
with Image.open(REFERENCES / 'favicon-marson-original.jpeg') as original:
    source = original.convert('RGB')
    side = max(source.size)
    square = Image.new('RGB', (side, side), 'black')
    square.paste(source, ((side - source.width) // 2, (side - source.height) // 2))
    square.resize((48, 48), Image.Resampling.LANCZOS).save(ASSETS / 'favicon-marson.ico', sizes=[(16, 16), (32, 32), (48, 48)])

(ROOT / 'docs' / 'imagens-responsivas.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf8')
for slug, data in report.items():
    largest = [f for f in data['files'] if f['width'] == data['sourceWidth'] and f['path'].endswith('.avif')]
    if largest:
        print(slug, f"{data['sourceWidth']} × {data['sourceHeight']}", f"{largest[0]['bytes']:,} bytes AVIF")
