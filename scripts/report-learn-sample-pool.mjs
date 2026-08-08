/**
 * Report eligible practice questions per LO after free-mock + paid-mock exclusions.
 * Run: node scripts/report-learn-sample-pool.mjs
 */
import { readFileSync } from "fs";
import { join } from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
// free-mock is TS — parse prompts via regex from the file
const freeMockSrc = readFileSync(
  join(process.cwd(), "src/content/free-mock-exam.ts"),
  "utf8",
);
const freePrompts = new Set(
  [...freeMockSrc.matchAll(/"prompt":\s*"((?:\\.|[^"\\])*)"/g)].map((m) =>
    JSON.parse(`"${m[1]}"`).slice(0, 80),
  ),
);
const freeIds = new Set(
  [...freeMockSrc.matchAll(/"id":\s*"(LO\d+-q[^"]+)"/g)].map((m) => m[1]),
);

const dir = join(process.cwd(), "PMQ in 5 days", "content");
const mock = JSON.parse(readFileSync(join(dir, "mock.json"), "utf8"));
const mockPrompts = new Set();
for (const part of mock.parts ?? []) {
  for (const q of part.questions ?? []) {
    if (["mcq", "scenario_mcq", "dropdown"].includes(q.type)) {
      mockPrompts.add((q.question || "").slice(0, 80));
    }
  }
}

const byLo = {};
for (let n = 1; n <= 24; n++) {
  const j = JSON.parse(readFileSync(join(dir, `lo${n}.json`), "utf8"));
  let eligible = 0;
  const ids = [];
  for (const q of j.quiz || []) {
    if (!["mcq", "scenario_mcq", "dropdown"].includes(q.type)) continue;
    if (q.mock_suitable) continue;
    const p = (q.question || "").slice(0, 80);
    if (mockPrompts.has(p)) continue;
    if (freePrompts.has(p)) continue;
    const id = `LO${n}-${q.id}`;
    if (freeIds.has(id)) continue;
    eligible++;
    ids.push(id);
  }
  byLo[n] = { title: j.title, eligible, sampleIds: ids.slice(0, 5) };
}

console.log(JSON.stringify(byLo, null, 2));
const thin = Object.entries(byLo).filter(([, v]) => v.eligible < 2);
console.log("\nLOs with <2 eligible:", thin);
void require;
