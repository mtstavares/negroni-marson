"""Convert supplied Instagram captures to WebP, preserving the originals.

The website crops the surrounding Instagram interface with CSS; source images
are not retouched. Run with Python + Pillow when replacing these captures.
"""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
sources = {
    'rotulo-historia': ('WhatsApp Image 2026-11-09 at 14.14.28 (1).jpeg', [720, 1080]),
    'como-servir': ('WhatsApp Image 2026-11-09 at 14.14.27 (1).jpeg', [540]),
    'bons-encontros': ('WhatsApp Image 2026-11-09 at 14.14.27 (2).jpeg', [540]),
    'origem-amparo': ('WhatsApp Image 2026-11-09 at 14.14.28.jpeg', [540]),
}
for slug, (filename, widths) in sources.items():
    with Image.open(root / 'assets' / filename) as source:
        for width in widths:
            image = source.convert('RGB')
            image.thumbnail((width, round(width * source.height / source.width)), Image.Resampling.LANCZOS)
            output = root / 'assets' / f'{slug}-{width}.webp'
            image.save(output, 'WEBP', quality=88, method=6)
            print(f'{output.name}: {output.stat().st_size:,} bytes')
