#!/usr/bin/env python3
"""
Build the default social preview image: public/brand/og/og-default.png

There is only ONE image. The square thumbnail is not a second asset: Telegram,
WhatsApp, iMessage, Slack's compact unfurl and Google mobile all take a CENTRE
SQUARE CROP of this same 1200x630 file. Everything below follows from that.

The brief: square crop shows the mark alone, wide card shows mark plus
wordmark. Both are satisfiable at once only if the mark sits dead centre and
the wordmark sits entirely OUTSIDE the centre square, which starts at x=285
and ends at x=915. Hence the layout: mark centred, "Learn in" / "Curve"
stacked as in the site header, starting at x=922.

That forces a gap between mark and wordmark wider than a header lockup would
use. It is not a mistake, it is the cost of the crop. Closing it puts the text
back inside the square and the square thumbnail stops being mark-only. The
corner blooms are positioned clear of the square for the same reason.

The script prints the geometry against the safe square on every run. If it
says OVERFLOWS, the square crop is cutting something.

Type is Fraunces (the site's font-display), bundled at scripts/assets/ so this
renders identically on any machine. Fraunces is SIL OFL 1.1; the licence sits
next to it as Fraunces-OFL.txt and must stay there.

Run:  python3 scripts/build-og-default.py
Then: bump OG_IMAGE_REVISION in src/lib/seo/og.ts, or every platform keeps
serving the preview it already cached.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
LOGO = ROOT / "public" / "brand" / "logo" / "fox-logo-png.png"
FONT = ROOT / "scripts" / "assets" / "Fraunces-Variable.ttf"
OUT = ROOT / "public" / "brand" / "og" / "og-default.png"

W, H = 1200, 630
SAFE_LEFT, SAFE_RIGHT = (W - H) // 2, (W + H) // 2  # 285, 915

CREAM = (244, 233, 214)
INK = (27, 21, 16)
ORANGE = (213, 80, 31)  # brand orange.DEFAULT, #D5501F

# Corner blooms. Both clear the safe square, so neither shows up in the square
# crop. The top-right one also has to clear the wordmark, which is why it is
# small and high.
BLOOMS = [((1140, 60), 150, (240, 215, 193)), ((99, 559), 140, (242, 221, 199))]

MARK_H = 340  # tall enough to fill the square crop with margin to spare
TEXT_LEFT = 922  # first inked pixel of the wordmark, must exceed SAFE_RIGHT
LEARN_PX = 56
CURVE_PX = 80  # header ratio: "Curve" 1.41x "Learn in"
LEADING = 0.10  # share of CURVE_PX between the two lines

SS = 3  # supersample, keeps the bloom edges and the serifs clean
VARIATION = [144, 700, 0, 0]  # Fraunces axes: opsz, wght, SOFT, WONK


def load_font(px: int) -> ImageFont.FreeTypeFont:
    f = ImageFont.truetype(str(FONT), px * SS)
    f.set_variation_by_axes(VARIATION)
    return f


def main() -> None:
    canvas = Image.new("RGB", (W * SS, H * SS), CREAM)
    draw = ImageDraw.Draw(canvas)
    for (cx, cy), r, colour in BLOOMS:
        draw.ellipse(
            [(cx - r) * SS, (cy - r) * SS, (cx + r) * SS, (cy + r) * SS],
            fill=colour,
        )

    mark = Image.open(LOGO).convert("RGBA")
    # Trim the transparent padding first, or the mark reads small and sits
    # off-centre by however much padding the source file happens to carry.
    box = mark.getbbox()
    if box:
        mark = mark.crop(box)
    mark_h = MARK_H * SS
    mark = mark.resize(
        (round(mark.width * mark_h / mark.height), mark_h), Image.LANCZOS
    )
    mark_x = (W * SS - mark.width) // 2
    canvas.paste(mark, (mark_x, (H * SS - mark.height) // 2), mark)

    learn_font, curve_font = load_font(LEARN_PX), load_font(CURVE_PX)
    # Measured boxes, not nominal sizes: the offsets are what keep the two
    # lines optically stacked rather than spaced by the font's line height.
    lb = draw.textbbox((0, 0), "Learn in", font=learn_font)
    cb = draw.textbbox((0, 0), "Curve", font=curve_font)
    lh, ch = lb[3] - lb[1], cb[3] - cb[1]
    lead = round(LEADING * CURVE_PX * SS)
    word_w = max(lb[2] - lb[0], cb[2] - cb[0])
    word_y = (H * SS - (lh + lead + ch)) // 2
    word_x = TEXT_LEFT * SS
    draw.text((word_x - lb[0], word_y - lb[1]), "Learn in", font=learn_font, fill=INK)
    draw.text(
        (word_x - cb[0], word_y + lh + lead - cb[1]),
        "Curve",
        font=curve_font,
        fill=ORANGE,
    )

    canvas = canvas.resize((W, H), Image.LANCZOS)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(OUT, "PNG", optimize=True)

    m_left, m_right = mark_x // SS, (mark_x + mark.width) // SS
    t_right = TEXT_LEFT + word_w // SS
    clean = SAFE_LEFT < m_left and m_right < SAFE_RIGHT and TEXT_LEFT > SAFE_RIGHT
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size / 1024:.1f} KB)")
    print(f"safe square {SAFE_LEFT}..{SAFE_RIGHT}")
    print(f"  mark     {m_left}..{m_right}   (must sit inside)")
    print(f"  wordmark {TEXT_LEFT}..{t_right}   (must start after {SAFE_RIGHT}, end before {W})")
    print("  " + ("OK: square crop is mark only" if clean and t_right < W else "OVERFLOWS"))


if __name__ == "__main__":
    main()
