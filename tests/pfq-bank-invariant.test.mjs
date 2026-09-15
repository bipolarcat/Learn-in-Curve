/**
 * CI invariant: combined PFQ mock + practice bank.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { PFQ_EXPECTED_OUTCOMES, PFQ_OBJECTIVES } from "../src/lib/pfq/outcomes.ts";
import {
  validateCombinedPfqBank,
  validatePfqBank,
  validatePfqMockSets,
} from "../src/lib/pfq/bank-invariant.ts";
import { drawPfqMockQuestionIds } from "../src/lib/pfq/generator.ts";
import {
  __clearPfqFreeSampleCacheForTests,
  getPfqFreeSampleQuestionIds,
  selectPfqFreeSampleIds,
  PFQ_FREE_SAMPLE_SIZE,
  PFQ_FREE_SAMPLE_PER_OBJECTIVE,
} from "../src/lib/pfq/free-sample.ts";

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

/** Build a valid mock_set=1 paper from syllabus outcomes (tests only). */
function syntheticMockSetRows(mockSet = 1) {
  const outcomes = [...PFQ_EXPECTED_OUTCOMES];
  assert.equal(outcomes.length, 59);
  const doubled = outcomes[0];
  const list = [...outcomes, doubled];
  assert.equal(list.length, 60);

  return list.map((code, index) => {
    const isMulti = index < 6;
    return {
      id: `SYN-SET${mockSet}-${index + 1}`,
      learning_outcome: code,
      objective: Number(code.split(".")[0]),
      day: 1,
      verb: "define",
      type: isMulti ? "multi_select" : "single",
      traps: isMulti ? ["multi_select"] : [],
      stem: `Synthetic stem ${index + 1}`,
      items: isMulti ? ["One", "Two", "Three", "Four"] : null,
      options: { a: "A", b: "B", c: "C", d: "D" },
      answer: "a",
      explanation: "Synthetic explanation.",
      tip: null,
      active: true,
      mock_suitable: true,
      mock_set: mockSet,
      variant: index + 1,
    };
  });
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

test("validatePfqMockSets accepts a well-formed set and skips empty sets", () => {
  const rows = syntheticMockSetRows(1);
  assert.deepEqual(validatePfqMockSets(rows), []);
});

test("validatePfqMockSets rejects broken set counts", () => {
  const rows = syntheticMockSetRows(2).slice(0, 59);
  const failures = validatePfqMockSets(rows);
  assert.ok(failures.some((f) => f.code === "mock_set_count"));
});

test("generator draws 60 from a mock_set paper", () => {
  const rows = syntheticMockSetRows(1);
  const ids = drawPfqMockQuestionIds(rows, 1, () => 0.42);
  assert.equal(ids.length, 60);
  assert.equal(new Set(ids).size, 60);
  const byId = new Map(rows.map((q) => [q.id, q]));
  for (const id of ids) {
    assert.equal(byId.get(id)?.mock_set, 1);
    assert.equal(byId.get(id)?.mock_suitable, true);
  }
});

test("generator rejects wrong mock_set shape", () => {
  const rows = syntheticMockSetRows(1).slice(0, 50);
  assert.throws(() => drawPfqMockQuestionIds(rows, 1, () => 0.1), /expected 60/);
});

test("public payload never includes answer, explanation, or tip keys", async () => {
  const { toPublicPfqQuestion, assertNoSecretsInPublicPayload } = await import(
    "../src/lib/pfq/public-question.ts"
  );
  const { questions } = loadMock();
  const q = questions[0];
  const pub = toPublicPfqQuestion(
    {
      ...q,
      tip: "Never leak this",
      active: true,
      mock_suitable: true,
      mock_set: null,
      variant: 1,
      items: q.items ?? null,
      traps: q.traps ?? [],
    },
    ["d", "c", "b", "a"],
  );
  assert.equal("answer" in pub, false);
  assert.equal("explanation" in pub, false);
  assert.equal("tip" in pub, false);
  assertNoSecretsInPublicPayload({ questions: [pub] });
  assert.throws(
    () => assertNoSecretsInPublicPayload({ tip: "secret" }),
    /tip/,
  );
});

test("free sample picks 5 practice rows per objective, spread across outcomes", () => {
  __clearPfqFreeSampleCacheForTests();
  const make = (code, variant, mockSet) => ({
    id: `FS-${code}-v${variant}${mockSet ? "-m" : ""}`,
    learning_outcome: code,
    objective: Number(code.split(".")[0]),
    day: 1,
    verb: "define",
    type: "single",
    traps: [],
    stem: "s",
    items: null,
    options: { a: "A", b: "B", c: "C", d: "D" },
    answer: "a",
    explanation: "e",
    tip: null,
    active: true,
    mock_suitable: Boolean(mockSet),
    mock_set: mockSet ?? null,
    variant,
  });

  // six practice variants per outcome, so even a single-outcome objective
  // (objective 3) can supply five.
  const rows = PFQ_EXPECTED_OUTCOMES.flatMap((code) => [
    make(code, 1, 1),
    ...[6, 5, 4, 3, 2, 1].map((variant) => make(code, variant, null)),
  ]);

  const ids = selectPfqFreeSampleIds(rows);
  assert.equal(ids.length, PFQ_FREE_SAMPLE_SIZE);
  assert.equal(new Set(ids).size, ids.length);

  // never a mock row
  assert.equal(ids.some((id) => id.endsWith("-m")), false);

  // exactly 5 per objective
  const perObjective = new Map();
  for (const id of ids) {
    const code = id.split("-")[1];
    const objective = code.split(".")[0];
    perObjective.set(objective, (perObjective.get(objective) ?? 0) + 1);
  }
  assert.equal(perObjective.size, PFQ_OBJECTIVES.length);
  for (const count of perObjective.values()) {
    assert.equal(count, PFQ_FREE_SAMPLE_PER_OBJECTIVE);
  }

  // objective 1 has 6 outcomes, so pass one takes the first 5 at variant 1
  assert.deepEqual(ids.slice(0, 5), [
    "FS-1.1-v1",
    "FS-1.2-v1",
    "FS-1.3-v1",
    "FS-1.4-v1",
    "FS-1.5-v1",
  ]);
});

test("free sample cache returns same ids until cleared", async () => {
  __clearPfqFreeSampleCacheForTests();
  let fetches = 0;
  const fetchRows = async () => {
    fetches += 1;
    return PFQ_EXPECTED_OUTCOMES.slice(0, 3).map((code) => ({
      id: `C-${code}`,
      learning_outcome: code,
      objective: 1,
      day: 1,
      verb: "define",
      type: "single",
      traps: [],
      stem: "s",
      items: null,
      options: { a: "A", b: "B", c: "C", d: "D" },
      answer: "a",
      explanation: "e",
      tip: null,
      active: true,
      mock_suitable: false,
      mock_set: null,
      variant: 1,
    }));
  };
  const a = await getPfqFreeSampleQuestionIds(fetchRows);
  const b = await getPfqFreeSampleQuestionIds(fetchRows);
  assert.deepEqual(a, b);
  assert.equal(fetches, 1);
  __clearPfqFreeSampleCacheForTests();
});
