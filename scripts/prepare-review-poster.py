"""Prepare the supplied official cover without cropping; preserve the original."""
from pathlib import Path
from PIL import Image, ImageOps

assets = Path(__file__).resolve().parents[1] / 'assets'
with Image.open(assets / 'capa-video.jpeg') as original:
    image = ImageOps.exif_transpose(original).convert('RGB')
    image.thumbnail((720, 1280), Image.Resampling.LANCZOS)
    destination = assets / 'review-murilo-fazolin-capa.webp'
    image.save(destination, quality=72, method=6)
    print(f'Capa: {image.width} x {image.height}, {destination.stat().st_size} bytes')
