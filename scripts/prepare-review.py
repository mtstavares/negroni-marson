"""Prepare the supplied review without upscaling or modifying the original.

Requires ffmpeg on PATH, or imageio-ffmpeg. Pillow prepares the video poster.
Usage: python scripts/prepare-review.py
"""
import shutil
import subprocess
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets'
SOURCE = ASSETS / 'WhatsApp Video 2026-11-09 at 22.47.09.mp4'
WATERMARK = ROOT / 'docs' / 'referencias' / 'marca-original.png'
# Reuse the official transparent PNG, including the original gold/black seal.
# Keep a small inset above the native player's bottom controls.
with Image.open(WATERMARK) as logo:
    assert logo.mode == 'RGBA' and logo.getchannel('A').getextrema()[0] == 0
overlay = '[1:v]scale=84:-1,format=rgba,colorchannelmixer=aa=0.32[logo];[0:v][logo]overlay=W-w-16:H-h-64:format=auto,format=yuv420p[video]'
ffmpeg = shutil.which('ffmpeg')
if not ffmpeg:
    import imageio_ffmpeg
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()

subprocess.run([
    ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-i', str(SOURCE),
    '-i', str(WATERMARK), '-filter_complex', overlay,
    '-map', '[video]', '-map', '0:a:0', '-map_metadata', '-1',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '25',
    '-maxrate', '500k', '-bufsize', '1000k', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '72k', '-movflags', '+faststart',
    str(ASSETS / 'review-murilo-fazolin.mp4')
], check=True)
# Keep below Cloudflare Pages' 25 MiB per-file limit.
assert (ASSETS / 'review-murilo-fazolin.mp4').stat().st_size < 25 * 1024 * 1024
poster = ROOT / 'tmp' / 'review-poster.png'
poster.parent.mkdir(exist_ok=True)
subprocess.run([
    ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-ss', '15',
    '-i', str(ASSETS / 'review-murilo-fazolin.mp4'), '-frames:v', '1', str(poster)
], check=True)
with Image.open(poster) as image:
    image.convert('RGB').save(ASSETS / 'review-murilo-fazolin-capa.webp', quality=84, method=6)
print('Review MP4 e capa WebP preparados; original preservado.')
