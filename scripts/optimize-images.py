"""Compatibility entry point; use prepare-images.py for all responsive assets."""
from pathlib import Path
import runpy

runpy.run_path(str(Path(__file__).with_name("prepare-images.py")), run_name="__main__")
