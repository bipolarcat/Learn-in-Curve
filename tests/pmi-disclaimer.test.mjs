/**
 * PMP readiness-check disclaimer + no "PMP in 5 Days" course framing in src/.
 */
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (relative) => readFile(join(root, relative), "utf8");

async function walkSrcFiles(dir, out = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkSrcFiles(full, out);
      continue;
    }
    if (/\.(ts|tsx|js|jsx|mjs|css|md)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

test("PMI_DISCLAIMER is defined with the required claims", async () => {
  const source = await read("src/lib/legal-copy.ts");
  const disclaimer = source.match(
    /export const PMI_DISCLAIMER\s*=\s*\n?\s*"([^"]+)"/,
  )?.[1];

  assert.ok(disclaimer, "PMI_DISCLAIMER export missing");
  assert.match(disclaimer, /not affiliated with/i);
  assert.match(disclaimer, /\bPMI\b/);
  assert.match(disclaimer, /Project Management Institute/);
  assert.match(disclaimer, /Examination Content Outline/);
});

test("PMP free-mock route keeps PMI_DISCLAIMER on results", async () => {
  const [page, client, config] = await Promise.all([
    read("src/app/(site)/free-mock-exam/pmp/page.tsx"),
    read("src/components/free-mock/FreeMockExamClient.tsx"),
    read("src/lib/free-mock/config.ts"),
  ]);

  assert.match(config, /disclaimer:\s*PMI_DISCLAIMER/);
  assert.match(client, /config\.disclaimer/);
  assert.match(page, /getFreeMockExamConfig\("pmp"\)/);
});

test('"PMP in 5 Days" does not appear under src/', async () => {
  const files = await walkSrcFiles(join(root, "src"));
  const hits = [];
  for (const file of files) {
    const text = await readFile(file, "utf8");
    if (text.includes("PMP in 5 Days")) {
      hits.push(file.slice(join(root, "src").length + 1));
    }
  }
  assert.deepEqual(hits, [], `forbidden phrase in: ${hits.join(", ")}`);
});
