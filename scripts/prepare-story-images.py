"""Create responsive versions of the founder's supplied images without cropping."""
from pathlib import Path
import json
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
report = {}
for source, slug in [('img1.jpeg', 'leandro-apresentacao'), ('img2.jpeg', 'leandro-historia')]:
    with Image.open(ROOT / 'assets' / source) as original:
        image = ImageOps.exif_transpose(original).convert('RGB')
        report[slug] = {'source': source, 'original': list(image.size), 'files': []}
        for width in [320, 640, 960]:
            assert width <= image.width
            resized = image.resize((width, round(width * image.height / image.width)), Image.Resampling.LANCZOS)
            for extension in ['avif', 'webp']:
                destination = ROOT / 'assets' / f'{slug}-{width}.{extension}'
                options = {'quality': 70, 'speed': 6} if extension == 'avif' else {'quality': 88, 'method': 6}
                resized.save(destination, **options)
                report[slug]['files'].append({'path': f'assets/{destination.name}', 'width': width, 'height': resized.height, 'bytes': destination.stat().st_size})
(ROOT / 'docs' / 'imagens-historia.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf8')
print(json.dumps(report))
