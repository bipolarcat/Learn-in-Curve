/**
 * Guard: the PFQ ATP / trademark disclaimer stays defined and is used on the
 * PFQ course overview and pricing pages.
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

test("PFQ overview imports the PFQ disclaimer", async () => {
  const page = await read("src/app/courses/pfq-in-2-days/page.tsx");
  assert.match(page, /PFQ_ATP_DISCLAIMER/);
});

test("PFQ pricing matches PMQ footer (ATP disclaimer stays on overview)", async () => {
  const page = await read("src/app/courses/pfq-in-2-days/pricing/page.tsx");
  // Pricing chrome was aligned to PMQ on 2026-09-21 — same legal footer line,
  // no ATP block. The disclaimer remains on the public PFQ overview.
  assert.doesNotMatch(page, /PFQ_ATP_DISCLAIMER/);
  assert.match(page, /Prices in GBP and include any applicable tax/);
});
