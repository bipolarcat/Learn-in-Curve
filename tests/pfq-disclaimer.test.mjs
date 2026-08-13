/**
 * Guard: the PFQ ATP / trademark disclaimer stays defined and is used on /pfq.
 * Informal legal hygiene — mirrors tests/apm-disclaimer.test.mjs.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (relative) => readFile(join(root, relative), "utf8");

test("PFQ_ATP_DISCLAIMER is defined with required claims", async () => {
  const source = await read("src/lib/legal-copy.ts");
  const match = source.match(
    /export const PFQ_ATP_DISCLAIMER\s*=\s*\n?\s*"([^"]+)"/,
  );
  assert.ok(match?.[1], "PFQ_ATP_DISCLAIMER missing from legal-copy.ts");
  const text = match[1];
  assert.match(text, /not an APM Accredited Training Provider/i);
  assert.match(text, /do not sell, administer or invigilate/i);
  assert.match(text, /trademarks of the Association for Project Management/i);
});

test("/pfq landing imports the PFQ disclaimer", async () => {
  const page = await read("src/app/(site)/pfq/page.tsx");
  assert.match(page, /PFQ_ATP_DISCLAIMER/);
});
