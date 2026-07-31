import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = path.join(root, "public", "brand", "inspo", "mac screen.jpg");
const output = path.join(
  root,
  "public",
  "brand",
  "inspo",
  "mac-screen-transparent.webp",
);

const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const visited = new Uint8Array(width * height);
const queue = new Int32Array(width * height);
let read = 0;
let write = 0;

function isBackground(pixelIndex) {
  const offset = pixelIndex * channels;
  const red = data[offset];
  const green = data[offset + 1];
  const blue = data[offset + 2];
  const minimum = Math.min(red, green, blue);
  const maximum = Math.max(red, green, blue);
  return minimum >= 225 && maximum - minimum <= 20;
}

function enqueue(pixelIndex) {
  if (visited[pixelIndex] || !isBackground(pixelIndex)) return;
  visited[pixelIndex] = 1;
  queue[write] = pixelIndex;
  write += 1;
}

for (let x = 0; x < width; x += 1) {
  enqueue(x);
  enqueue((height - 1) * width + x);
}
for (let y = 0; y < height; y += 1) {
  enqueue(y * width);
  enqueue(y * width + width - 1);
}

while (read < write) {
  const pixelIndex = queue[read];
  read += 1;
  const x = pixelIndex % width;
  const y = Math.floor(pixelIndex / width);

  data[pixelIndex * channels + 3] = 0;

  if (x > 0) enqueue(pixelIndex - 1);
  if (x + 1 < width) enqueue(pixelIndex + 1);
  if (y > 0) enqueue(pixelIndex - width);
  if (y + 1 < height) enqueue(pixelIndex + width);
}

await sharp(data, { raw: info })
  .webp({ quality: 88, alphaQuality: 100, effort: 6 })
  .toFile(output);

console.log(`Built ${path.relative(root, output)} (${width}x${height})`);
