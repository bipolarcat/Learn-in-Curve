/**
 * CI invariant: combined PFQ mock + practice bank.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { PFQ_EXPECTED_OUTCOMES } from "../src/lib/pfq/outcomes.ts";
import {
  validateCombinedPfqBank,
  validatePfqBank,
} from "../src/lib/pfq/bank-invariant.ts";
import { drawPfqMockQuestionIds } from "../src/lib/pfq/generator.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const mockPath = join(root, "PFQ in 2 days", "pfq-questions.json");
const practicePath = join(root, "PFQ in 2 days", "pfq-practice-questions.json");

function loadMock() {
  return JSON.parse(readFileSync(mockPath, "utf8"));
}

function loadPractice() {
  if (!existsSync(practicePath)) return { questions: [] };
  return JSON.parse(readFileSync(practicePath, "utf8"));
}

test("combined bank passes all invariants", () => {
  const mock = loadMock().questions;
  const practice = loadPractice().questions;
  assert.equal(mock.length, 60);
  const failures = validateCombinedPfqBank(mock, practice);
  assert.deepEqual(
    failures,
    [],
    failures.map((f) => f.message).join("\n"),
  );
  assert.equal(PFQ_EXPECTED_OUTCOMES.length, 59);
});

test("invariant fails if a mock_suitable question is removed from an outcome", () => {
  const mock = loadMock().questions.map((q) =>
    q.learning_outcome === "3.1" ? { ...q, mock_suitable: false } : q,
  );
  const practice = loadPractice().questions;
  const failures = validateCombinedPfqBank(mock, practice);
  assert.ok(
    failures.some((f) => f.code === "missing_mock_suitable"),
    "expected missing_mock_suitable for 3.1",
  );
});

test("invariant fails if ids collide across files", () => {
  const mock = loadMock().questions;
  const practice = [
    { ...mock[0], mock_suitable: false, variant: 99 },
    ...loadPractice().questions,
  ];
  const failures = validateCombinedPfqBank(mock, practice);
  assert.ok(failures.some((f) => f.code === "id_collision"));
});

test("invariant fails if explanation cites option letters", () => {
  const mock = loadMock().questions.map((q, i) =>
    i === 0
      ? { ...q, explanation: "See option A for the definition." }
      : q,
  );
  const failures = validatePfqBank(mock);
  assert.ok(failures.some((f) => f.code === "letter_in_explanation"));
});

test("invariant fails on em dash in stem", () => {
  const mock = loadMock().questions.map((q, i) =>
    i === 0 ? { ...q, stem: "What is — project?" } : q,
  );
  const failures = validatePfqBank(mock);
  assert.ok(failures.some((f) => f.code === "em_dash"));
});

test("generator draws 60 from mock_suitable only", () => {
  const mock = loadMock().questions;
  const practice = loadPractice().questions;
  const rows = [...mock, ...practice].map((q) => ({
    ...q,
    active: true,
    mock_suitable: Boolean(q.mock_suitable),
    variant: Number(q.variant ?? 1),
    items: q.items ?? null,
    traps: q.traps ?? [],
  }));
  const ids = drawPfqMockQuestionIds(rows, () => 0.42);
  assert.equal(ids.length, 60);
  assert.equal(new Set(ids).size, 60);
  const byId = new Map(rows.map((q) => [q.id, q]));
  for (const id of ids) {
    assert.equal(byId.get(id)?.mock_suitable, true);
  }
});

test("public payload never includes answer or explanation keys", async () => {
  const { toPublicPfqQuestion, assertNoSecretsInPublicPayload } = await import(
    "../src/lib/pfq/public-question.ts"
  );
  const { questions } = loadMock();
  const q = questions[0];
  const pub = toPublicPfqQuestion(
    {
      ...q,
      active: true,
      mock_suitable: true,
      variant: 1,
      items: q.items ?? null,
      traps: q.traps ?? [],
    },
    ["d", "c", "b", "a"],
  );
  assert.equal("answer" in pub, false);
  assert.equal("explanation" in pub, false);
  assertNoSecretsInPublicPayload({ questions: [pub] });
});
