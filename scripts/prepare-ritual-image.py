"""Create responsive copies of the official ritual artwork without cropping."""
from pathlib import Path
from PIL import Image, ImageOps

assets = Path(__file__).resolve().parents[1] / 'assets'
with Image.open(assets / 'arte-como-servir.jpeg') as original:
    image = ImageOps.exif_transpose(original).convert('RGB')
    for width in [360, 720, 1000]:
        assert width <= image.width
        resized = image.resize((width, round(width * image.height / image.width)), Image.Resampling.LANCZOS)
        for extension in ['avif', 'webp']:
            destination = assets / f'arte-como-servir-{width}.{extension}'
            resized.save(destination, **({'quality': 70, 'speed': 6} if extension == 'avif' else {'quality': 84, 'method': 6}))
            print(f'{destination.name}: {destination.stat().st_size} bytes')
