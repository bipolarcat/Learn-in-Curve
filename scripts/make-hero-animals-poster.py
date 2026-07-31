"""Write hero-animals poster = first video frame, same crop + key as HeroAnimalsScene.

Run: python scripts/make-hero-animals-poster.py
Keeps the load-time still identical to the canvas loop so soft-nav / first paint
never shows a differently framed (\"distorted\") frame.
"""
from __future__ import annotations

import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image

SRC = Path(r"public/brand/hero/hero-animals-2.mp4")
OUT_POSTER = Path(r"public/brand/hero/hero-animals-poster.png")
# Must stay in sync with CROP_X in HeroAnimalsScene.tsx
CROP_X = 0.105
OUT_W = 1011  # round(1280 * (1 - 2 * CROP_X))
OUT_H = 720


def is_strong_plate(r: int, g: int, b: int) -> bool:
    if r >= 248 and g >= 245 and b >= 230:
        return True
    return (
        r >= 215
        and g >= 200
        and b >= 155
        and min(r, g, b) >= 150
        and abs(r - g) < 40
        and r + g > b + 175
    )


def is_ink(r: int, g: int, b: int) -> bool:
    return (r + g + b) / 3 <= 95


def key_frame(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, _a = px[x, y]
            if not is_strong_plate(r, g, b):
                continue
            touches_ink = False
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    if dx == 0 and dy == 0:
                        continue
                    nx, ny = x + dx, y + dy
                    if nx < 0 or ny < 0 or nx >= w or ny >= h:
                        continue
                    rr, gg, bb, _ = px[nx, ny]
                    if is_ink(rr, gg, bb):
                        touches_ink = True
                        break
                if touches_ink:
                    break
            if not touches_ink:
                px[x, y] = (r, g, b, 0)
    return im


def main() -> None:
    td = Path(tempfile.mkdtemp(prefix="hero_poster_"))
    frame = td / "f.png"
    try:
        subprocess.check_call(
            [
                "ffmpeg",
                "-y",
                "-i",
                str(SRC),
                "-an",
                "-vf",
                (
                    f"crop=iw*(1-{CROP_X * 2}):ih:iw*{CROP_X}:0,"
                    f"scale={OUT_W}:{OUT_H}:flags=neighbor"
                ),
                "-frames:v",
                "1",
                "-update",
                "1",
                str(frame),
            ]
        )
        out = key_frame(Image.open(frame))
        out.save(OUT_POSTER)
        print("poster", out.size, OUT_POSTER.stat().st_size)
    finally:
        shutil.rmtree(td, ignore_errors=True)


if __name__ == "__main__":
    main()
