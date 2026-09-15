/**
 * Free-mock banks: expected counts, non-empty explanations, answer membership,
 * and unique ids. Content files import as TypeScript (Node strip-types).
 * Letter-style PMQ answers are resolved the same way as banks.ts adapters.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { FREE_MOCK_QUESTIONS } from "../src/content/free-mock-exam.ts";
import { FREE_MOCK_PFQ_QUESTIONS } from "../src/content/free-mock-pfq.ts";
import { FREE_MOCK_PMP_QUESTIONS } from "../src/content/free-mock-pmp.ts";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function resolveCorrect(options, correct) {
  if (options.includes(correct)) return correct;
  const index = LETTERS.indexOf(String(correct).trim().toUpperCase());
  if (index >= 0 && index < options.length) return options[index];
  return correct;
}

function assertBank(items, expectedCount, label) {
  assert.equal(items.length, expectedCount, `${label} count`);
  const ids = new Set();
  for (const item of items) {
    assert.ok(item.id, `${label} item missing id`);
    assert.equal(ids.has(item.id), false, `${label} duplicate id ${item.id}`);
    ids.add(item.id);
    assert.ok(
      typeof item.explanation === "string" && item.explanation.trim().length > 0,
      `${label} ${item.id} needs a non-empty explanation`,
    );
    if (item.type === "dropdown") {
      assert.ok(item.correct_answers, `${label} ${item.id} dropdown answers`);
      continue;
    }
    assert.ok(Array.isArray(item.options), `${label} ${item.id} options`);
    const resolved = resolveCorrect(item.options, item.correct_answer);
    assert.ok(
      item.options.includes(resolved),
      `${label} ${item.id} correct_answer must appear in options`,
    );
  }
}

test("PMQ free-mock bank: 15 items, valid answers, unique ids", () => {
  assertBank(FREE_MOCK_QUESTIONS, 15, "PMQ");
});

test("PFQ free-mock bank: 10 items, valid answers, unique ids", () => {
  assertBank(FREE_MOCK_PFQ_QUESTIONS, 10, "PFQ");
});

test("PMP free-mock bank: 15 items, valid answers, unique ids", () => {
  assertBank(FREE_MOCK_PMP_QUESTIONS, 15, "PMP");
});
