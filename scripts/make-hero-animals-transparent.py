"""Make hero animals loop transparent — clean edges, seamless 24fps webp.

Moving black lines came from (1) lossy alpha fringe on keyed edges and
(2) leftover dark rim pixels. We scrub that fringe, then encode at source fps.
"""
from __future__ import annotations

import collections
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image

SRC = Path(r"public/brand/hero/hero-animals-2.mp4")
OUT_WEBP = Path(r"public/brand/hero/hero-animals-transparent.webp")
OUT_POSTER = Path(r"public/brand/hero/hero-animals-poster.png")
# Pre-keyed loop for Image embed (no CPU chroma). 20fps ≈ fox smoothness / size.
FPS = 20
SCALE = 500
# Source side pillarbox (~9.5% each) — crop before keying.
CROP_X = 0.095


def is_cream(r: int, g: int, b: int) -> bool:
    if r >= 245 and g >= 245 and b >= 245:
        return True
    return (
        r >= 190
        and g >= 175
        and b >= 130
        and abs(r - g) < 55
        and (r + g) > (b + 150)
    )


def knock_cream(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, _a = px[x, y]
            if is_cream(r, g, b):
                px[x, y] = (0, 0, 0, 0)
    return im


def flood_edge_black(im: Image.Image) -> Image.Image:
    """Clear near-black letterbox connected to the frame edge."""
    px = im.load()
    w, h = im.size
    visited = [[False] * w for _ in range(h)]
    q: collections.deque[tuple[int, int]] = collections.deque()

    def is_black(x: int, y: int) -> bool:
        r, g, b, a = px[x, y]
        return a > 0 and r <= 22 and g <= 22 and b <= 22

    def try_push(x: int, y: int) -> None:
        if x < 0 or y < 0 or x >= w or y >= h or visited[y][x]:
            return
        if not is_black(x, y):
            return
        visited[y][x] = True
        q.append((x, y))

    for x in range(w):
        try_push(x, 0)
        try_push(x, h - 1)
    for y in range(h):
        try_push(0, y)
        try_push(w - 1, y)

    while q:
        x, y = q.popleft()
        px[x, y] = (0, 0, 0, 0)
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            try_push(nx, ny)
    return im


def clean_edge_fringe(im: Image.Image, passes: int = 4) -> Image.Image:
    """Remove dark/muddy/cream rim pixels sitting on transparency.

    These are what read as crawling black lines once the loop plays.
    Does not eat interior character blacks (no transparent neighbor).
    """
    for _ in range(passes):
        px = im.load()
        w, h = im.size
        clear: list[tuple[int, int]] = []
        for y in range(h):
            for x in range(w):
                r, g, b, a = px[x, y]
                if a < 12:
                    continue
                lum = (r + g + b) / 3
                chroma = max(r, g, b) - min(r, g, b)
                dirty = (
                    lum <= 70
                    or (lum <= 130 and chroma < 22)
                    or is_cream(r, g, b)
                    or a < 220  # semi-transparent keyed crumbs
                )
                if not dirty:
                    continue
                for dx, dy in (
                    (1, 0),
                    (-1, 0),
                    (0, 1),
                    (0, -1),
                    (1, 1),
                    (-1, -1),
                    (1, -1),
                    (-1, 1),
                ):
                    nx, ny = x + dx, y + dy
                    if nx < 0 or ny < 0 or nx >= w or ny >= h:
                        continue
                    if px[nx, ny][3] < 12:
                        clear.append((x, y))
                        break
        for x, y in clear:
            px[x, y] = (0, 0, 0, 0)
    return im


def content_bbox(im: Image.Image, pad: int = 2) -> tuple[int, int, int, int]:
    px = im.load()
    w, h = im.size
    minx, miny, maxx, maxy = w, h, 0, 0
    found = False
    for y in range(h):
        for x in range(w):
            if px[x, y][3] > 12:
                found = True
                minx = min(minx, x)
                miny = min(miny, y)
                maxx = max(maxx, x)
                maxy = max(maxy, y)
    if not found:
        return (0, 0, w, h)
    return (
        max(0, minx - pad),
        max(0, miny - pad),
        min(w, maxx + 1 + pad),
        min(h, maxy + 1 + pad),
    )


def process(im: Image.Image) -> Image.Image:
    return clean_edge_fringe(flood_edge_black(knock_cream(im)))


def count_dark_fringe(im: Image.Image) -> int:
    px = im.load()
    w, h = im.size
    fringe = 0
    for y in range(1, h - 1):
        for x in range(1, w - 1):
            r, g, b, a = px[x, y]
            if a < 12 or (r + g + b) / 3 > 70:
                continue
            if any(
                px[x + dx, y + dy][3] < 12
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))
            ):
                fringe += 1
    return fringe


def main() -> None:
    out_dir = Path(tempfile.mkdtemp(prefix="hero_animals_"))
    frames_dir = out_dir / "frames"
    frames_dir.mkdir()

    subprocess.check_call(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(SRC),
            "-an",
            "-vf",
            (
                f"crop=iw*(1-{CROP_X*2}):ih:iw*{CROP_X}:0,"
                f"scale={SCALE}:-2,fps={FPS}"
            ),
            str(frames_dir / "f_%04d.png"),
        ]
    )

    files = sorted(frames_dir.glob("f_*.png"))
    print("frames", len(files), "fps", FPS)

    first = process(Image.open(files[0]))
    box = content_bbox(first, pad=2)
    print("crop_box", box)

    processed: list[Image.Image] = []
    for i, f in enumerate(files):
        out = process(Image.open(f)).crop(box)
        # Force fully opaque RGB on surviving pixels — kills semi-alpha crawls.
        px = out.load()
        ow, oh = out.size
        for y in range(oh):
            for x in range(ow):
                r, g, b, a = px[x, y]
                if a < 12:
                    px[x, y] = (0, 0, 0, 0)
                else:
                    px[x, y] = (r, g, b, 255)
        processed.append(out)
        if i == 0:
            out.save(OUT_POSTER)

    duration_ms = max(1, round(1000 / FPS))
    # High-quality lossy after fringe scrub — fox-scale size, no dancing black rim.
    processed[0].save(
        OUT_WEBP,
        save_all=True,
        append_images=processed[1:],
        duration=duration_ms,
        loop=0,
        lossless=False,
        quality=92,
        method=6,
    )

    im = Image.open(OUT_POSTER)
    px = im.load()
    w, h = im.size
    print("poster", im.mode, im.size, "dark_fringe", count_dark_fringe(im))
    print("corners", px[1, 1], px[w - 2, 1], px[1, h - 2], px[w - 2, h - 2])
    print("webp_bytes", OUT_WEBP.stat().st_size)

    # Spot-check a mid frame from the saved webp
    check = Image.open(OUT_WEBP)
    check.seek(min(48, check.n_frames - 1))
    print("webp_mid_fringe", count_dark_fringe(check.convert("RGBA")))

    shutil.rmtree(out_dir, ignore_errors=True)
    print("done")


if __name__ == "__main__":
    main()
