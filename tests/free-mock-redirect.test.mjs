/**
 * Legacy /free-mock-exam must 301 to the PMQ child (preserve rankings).
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

test("next.config redirects /free-mock-exam to /free-mock-exam/apm-pmq with 301", async () => {
  const source = await readFile(join(root, "next.config.ts"), "utf8");

  assert.match(
    source,
    /source:\s*"\/free-mock-exam"/,
    "redirect source must be /free-mock-exam",
  );
  assert.match(
    source,
    /destination:\s*"\/free-mock-exam\/apm-pmq"/,
    "redirect destination must be /free-mock-exam/apm-pmq",
  );
  assert.match(
    source,
    /statusCode:\s*301/,
    "redirect must be an explicit 301",
  );
});
