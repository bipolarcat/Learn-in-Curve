/**
 * Prove /library sample questions are outside mock.json + FREE_MOCK_QUESTIONS.
 * Run: node scripts/verify-learn-samples-ringfence.mjs
 */
import { readFileSync } from "fs";
import { join } from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// Dynamic import of generated TS via node --experimental or parse JSON from file
const poolSrc = readFileSync(
  join(process.cwd(), "src/content/library/sample-pool.ts"),
  "utf8",
);
const freeSrc = readFileSync(
  join(process.cwd(), "src/content/free-mock-exam.ts"),
  "utf8",
);
const mock = JSON.parse(
  readFileSync(join(process.cwd(), "PMQ in 5 days/content/mock.json"), "utf8"),
);

const freePrompts = new Set(
  [...freeSrc.matchAll(/"prompt":\s*"((?:\\.|[^"\\])*)"/g)].map((m) =>
    JSON.parse(`"${m[1]}"`),
  ),
);
const freeIds = new Set(
  [...freeSrc.matchAll(/"id":\s*"(LO\d+-q[^"]+)"/g)].map((m) => m[1]),
);

const mockPrompts = new Set();
for (const part of mock.parts ?? []) {
  for (const q of part.questions ?? []) {
    if (["mcq", "scenario_mcq", "dropdown"].includes(q.type)) {
      mockPrompts.add(q.question);
    }
  }
}

const poolMatch = poolSrc.match(
  /export const LIBRARY_SAMPLE_POOL[^=]*=\s*(\[[\s\S]*\]);/,
);
if (!poolMatch) {
  console.error("Could not parse LIBRARY_SAMPLE_POOL");
  process.exit(1);
}
const pool = JSON.parse(poolMatch[1]);

let fail = 0;
for (const q of pool) {
  if (freeIds.has(q.id)) {
    console.error("FAIL free-mock id:", q.id);
    fail++;
  }
  if (freePrompts.has(q.prompt)) {
    console.error("FAIL free-mock prompt:", q.id);
    fail++;
  }
  if (mockPrompts.has(q.prompt)) {
    console.error("FAIL mock.json prompt:", q.id);
    fail++;
  }
}

// Also check picks used by the 10 pages
const pageLos = {
  "apm-pmq-pass-mark": [4, 10, 23],
  "how-hard-is-apm-pmq": [1, 10, 23],
  "apm-pmq-exam-format": [1, 20, 22],
  "how-long-to-revise-for-apm-pmq": [4, 12, 23],
  "apm-pmq-vs-pfq": [1, 4, 10],
  "apm-pmq-vs-prince2": [1, 19, 23],
  "is-apm-pmq-worth-it": [10, 12, 4],
  "apm-pmq-business-case": [4],
  "apm-pmq-risk-management": [23],
  "apm-pmq-stakeholder-management": [10],
};

function pick(los, limit = 3) {
  const picked = [];
  const used = new Set();
  const take = (lo) =>
    pool
      .filter((q) => q.lo_number === lo && !used.has(q.id))
      .sort((a, b) => a.id.localeCompare(b.id))[0];
  for (const lo of los) {
    if (picked.length >= limit) break;
    const n = take(lo);
    if (!n) continue;
    used.add(n.id);
    picked.push(n);
  }
  while (picked.length < limit) {
    let added = false;
    for (const lo of los) {
      if (picked.length >= limit) break;
      const n = take(lo);
      if (!n) continue;
      used.add(n.id);
      picked.push(n);
      added = true;
    }
    if (!added) break;
  }
  return picked;
}

console.log("Pool size:", pool.length);
console.log("Rendered sample IDs by page:");
for (const [slug, los] of Object.entries(pageLos)) {
  const samples = pick(los);
  console.log(
    `  ${slug}: ${samples.map((s) => s.id).join(", ") || "(none)"}`,
  );
}

if (fail) {
  console.error(`\n${fail} ring-fence violations`);
  process.exit(1);
}
console.log("\nOK — no sample-pool item overlaps mock.json or FREE_MOCK_QUESTIONS");
void require;
