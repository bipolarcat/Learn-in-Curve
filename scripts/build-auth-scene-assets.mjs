/**
 * One-shot asset build for the auth-page desk scene.
 * - sign-up-man: flood-fill the baked off-white bg to transparent (edge-connected
 *   only, so the white monitor/mouse survive), trim, resize, emit webp+png.
 * - sign-up-finger: white-on-black silhouette -> skin-filled, ink-outlined sprite.
 */
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "brand", "auth");
fs.mkdirSync(OUT_DIR, { recursive: true });

const MAN_SRC = path.join(ROOT, ".impeccable", "Sing-up-man.png");
const FINGER_SRC = path.join(ROOT, ".impeccable", "Sing-up-finger.png");

const INK = { r: 0x2a, g: 0x1c, b: 0x10 };
const SKIN = { r: 0xef, g: 0xc4, b: 0xa5 };

async function buildMan() {
  const { data, info } = await sharp(MAN_SRC)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;

  // Edge flood-fill only. Monitor + mouse are the SAME cream as the page bg,
  // so a global chroma-key would erase them. Ink outlines keep interior cream.
  const isBg = (i) => {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    // ~#F6F5F0 baked bg — generous, but stop short of mid-grey ink AA
    return (
      r >= 228 &&
      g >= 226 &&
      b >= 216 &&
      Math.abs(r - g) < 16 &&
      Math.abs(g - b) < 18 &&
      Math.abs(r - b) < 20 &&
      // keep pure-white highlights (rare) if any
      !(r >= 252 && g >= 252 && b >= 250)
    );
  };

  const visited = new Uint8Array(W * H);
  const queue = [];
  for (let x = 0; x < W; x++) {
    queue.push(x, (H - 1) * W + x);
  }
  for (let y = 0; y < H; y++) {
    queue.push(y * W, y * W + (W - 1));
  }
  while (queue.length) {
    const p = queue.pop();
    if (visited[p]) continue;
    visited[p] = 1;
    const i = p * 4;
    if (!isBg(i)) continue;
    data[i + 3] = 0;
    const x = p % W,
      y = (p - x) / W;
    if (x > 0) queue.push(p - 1);
    if (x < W - 1) queue.push(p + 1);
    if (y > 0) queue.push(p - W);
    if (y < H - 1) queue.push(p + W);
  }

  // Fully clear any remaining exterior cream AA next to transparency
  const alphaAt = (x, y) => data[(y * W + x) * 4 + 3];
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        const i = (y * W + x) * 4;
        if (data[i + 3] === 0) continue;
        if (!isBg(i)) continue;
        if (
          alphaAt(x - 1, y) === 0 ||
          alphaAt(x + 1, y) === 0 ||
          alphaAt(x, y - 1) === 0 ||
          alphaAt(x, y + 1) === 0
        ) {
          data[i + 3] = 0;
        }
      }
    }
  }

  // Remaining interior cream (monitor + mouse) → pure white so it reads as
  // the laptop, not a cream hole punching out the page grid.
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    if (isBg(i)) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
    }
  }

  let trimmed = await sharp(data, { raw: { width: W, height: H, channels: 4 } })
    .trim({ threshold: 8 })
    .toBuffer({ resolveWithObject: true });
  console.log("man trimmed to", trimmed.info.width, "x", trimmed.info.height);

  {
    const { width: TW, height: TH } = trimmed.info;
    const td = trimmed.data;
    let cropRows = 0;
    for (let y = TH - 1; y > TH - 30; y--) {
      let dark = 0;
      for (let x = 0; x < TW; x++) {
        const i = (y * TW + x) * 4;
        if (td[i + 3] > 100 && td[i] < 110 && td[i + 1] < 90 && td[i + 2] < 80)
          dark++;
      }
      if (dark > TW * 0.5) cropRows = TH - y;
      else if (cropRows > 0) break;
    }
    console.log("desk line rows cropped:", cropRows);
    if (cropRows > 0) {
      trimmed = await sharp(td, { raw: trimmed.info })
        .extract({ left: 0, top: 0, width: TW, height: TH - cropRows })
        .toBuffer({ resolveWithObject: true });
    }
  }

  await sharp(trimmed.data, { raw: trimmed.info })
    .resize({ width: 880 })
    .webp({ quality: 88, alphaQuality: 100 })
    .toFile(path.join(OUT_DIR, "sign-up-man.webp"));
  await sharp(trimmed.data, { raw: trimmed.info })
    .resize({ width: 880 })
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT_DIR, "sign-up-man.png"));
}

async function buildFinger() {
  // Resize the silhouette down first so the ink outline can be sized for the
  // ~17px display width (band reads ~2px at 1x once displayed).
  // Silhouette occupies ~34% of the 1200px canvas; 350px canvas -> ~120px finger.
  const { data, info } = await sharp(FINGER_SRC)
    .resize({ width: 350 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;

  // Build binary mask of the white silhouette.
  const mask = new Uint8Array(W * H);
  for (let p = 0; p < W * H; p++) {
    mask[p] = data[p * 4] > 128 ? 1 : 0;
  }

  // Dilate mask by R px -> outline band.
  const R = 13;
  const dilated = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!mask[y * W + x]) continue;
      for (let dy = -R; dy <= R; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= H) continue;
        const span = Math.floor(Math.sqrt(R * R - dy * dy));
        const lo = Math.max(0, x - span), hi = Math.min(W - 1, x + span);
        dilated.fill(1, yy * W + lo, yy * W + hi + 1);
      }
    }
  }

  const out = Buffer.alloc(W * H * 4);
  for (let p = 0; p < W * H; p++) {
    const i = p * 4;
    if (mask[p]) {
      out[i] = SKIN.r; out[i + 1] = SKIN.g; out[i + 2] = SKIN.b; out[i + 3] = 255;
    } else if (dilated[p]) {
      out[i] = INK.r; out[i + 1] = INK.g; out[i + 2] = INK.b; out[i + 3] = 255;
    }
  }

  const trimmed = await sharp(out, { raw: { width: W, height: H, channels: 4 } })
    .trim({ threshold: 8 })
    .toBuffer({ resolveWithObject: true });
  console.log("finger trimmed to", trimmed.info.width, "x", trimmed.info.height);

  await sharp(trimmed.data, { raw: trimmed.info })
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT_DIR, "sign-up-finger.png"));
}

await buildMan();
await buildFinger();
console.log("done ->", OUT_DIR);
