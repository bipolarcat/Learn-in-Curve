from PIL import Image

im = Image.open(r".tmp-pricing-mobile.png").convert("RGB")
w, h = im.size
pixels = im.load()

print("size", w, h)
for y in range(400, 560):
    vals = [sum(pixels[x, y]) / 3 for x in range(50, w - 50)]
    avg = sum(vals) / len(vals)
    span = max(vals) - min(vals)
    dark = sum(1 for x in range(30, w - 30) if pixels[x, y][0] < 80)
    if dark > 15 or (span < 8 and avg < 235):
        print(f"y={y} avg={avg:.1f} span={span:.1f} dark={dark}")
