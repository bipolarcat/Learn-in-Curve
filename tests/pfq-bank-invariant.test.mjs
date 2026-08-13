/**
 * CI invariant: PFQ question bank must cover exactly the 59 syllabus outcomes
 * and stay reshuffle-safe (no letter refs in explanations).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { PFQ_EXPECTED_OUTCOMES } from "../src/lib/pfq/outcomes.ts";
import { validatePfqBank } from "../src/lib/pfq/bank-invariant.ts";
import { drawPfqMockQuestionIds } from "../src/lib/pfq/generator.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const bankPath = join(root, "PFQ in 2 days", "pfq-questions.json");

function loadBank() {
  return JSON.parse(readFileSync(bankPath, "utf8"));
}

test("bank covers exactly the 59 syllabus outcomes", () => {
  const { questions } = loadBank();
  assert.equal(questions.length, 60);
  const failures = validatePfqBank(questions);
  assert.deepEqual(
    failures,
    [],
    failures.map((f) => f.message).join("\n"),
  );
  const found = new Set(questions.map((q) => q.learning_outcome));
  assert.equal(found.size, 59);
  assert.equal(PFQ_EXPECTED_OUTCOMES.length, 59);
});

test("invariant fails if a question is deleted from the JSON", () => {
  const { questions } = loadBank();
  const trimmed = questions.filter((q) => q.learning_outcome !== "3.1");
  const failures = validatePfqBank(trimmed);
  assert.ok(
    failures.some((f) => f.code === "missing_outcome"),
    "expected missing_outcome for 3.1",
  );
});

test("invariant fails if explanation cites option letters", () => {
  const { questions } = loadBank();
  const broken = questions.map((q, i) =>
    i === 0
      ? { ...q, explanation: "See option A for the definition." }
      : q,
  );
  const failures = validatePfqBank(broken);
  assert.ok(failures.some((f) => f.code === "letter_in_explanation"));
});

test("generator draws 60 without hardcoding 10.4", () => {
  const { questions } = loadBank();
  const rows = questions.map((q) => ({ ...q, active: true }));
  const ids = drawPfqMockQuestionIds(rows, () => 0.42);
  assert.equal(ids.length, 60);
  assert.equal(new Set(ids).size, 60);
});

test("public payload never includes answer or explanation keys", async () => {
  const { toPublicPfqQuestion, assertNoSecretsInPublicPayload } = await import(
    "../src/lib/pfq/public-question.ts"
  );
  const { questions } = loadBank();
  const q = questions[0];
  const pub = toPublicPfqQuestion(
    { ...q, active: true, items: q.items ?? null, traps: q.traps ?? [] },
    ["d", "c", "b", "a"],
  );
  assert.equal("answer" in pub, false);
  assert.equal("explanation" in pub, false);
  assertNoSecretsInPublicPayload({ questions: [pub] });
});
