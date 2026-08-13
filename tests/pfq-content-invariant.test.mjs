/**
 * CI invariant: PFQ lesson corpus (ten objective JSON files).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  validatePfqLessonCorpus,
  validatePfqObjectiveLesson,
} from "../src/lib/pfq/content.ts";
import { PFQ_EXPECTED_OUTCOMES } from "../src/lib/pfq/outcomes.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const lessonsDir = join(root, "PFQ in 2 days", "lessons");

function loadObjective(n) {
  const padded = String(n).padStart(2, "0");
  return JSON.parse(
    readFileSync(join(lessonsDir, `objective-${padded}.json`), "utf8"),
  );
}

function loadAll() {
  const lessons = [];
  for (let n = 1; n <= 10; n += 1) {
    const { lesson, failures } = validatePfqObjectiveLesson(
      loadObjective(n),
      `objective-${String(n).padStart(2, "0")}.json`,
    );
    assert.deepEqual(
      failures,
      [],
      failures.map((f) => f.message).join("\n"),
    );
    assert.ok(lesson);
    lessons.push(lesson);
  }
  return lessons;
}

test("all ten objectives validate and cover exactly 59 outcomes", () => {
  const lessons = loadAll();
  assert.equal(lessons.length, 10);
  const corpusFailures = validatePfqLessonCorpus(lessons);
  assert.deepEqual(
    corpusFailures,
    [],
    corpusFailures.map((f) => f.message).join("\n"),
  );
  const codes = new Set(
    lessons.flatMap((l) => l.core_content.map((b) => b.outcome_code)),
  );
  assert.equal(codes.size, 59);
  assert.equal(PFQ_EXPECTED_OUTCOMES.length, 59);
});

test("objective 1 fixture validates today", () => {
  const { lesson, failures } = validatePfqObjectiveLesson(
    loadObjective(1),
    "objective-01.json",
  );
  assert.deepEqual(failures, []);
  assert.equal(lesson?.objective_number, 1);
  assert.equal(lesson?.core_content.length, 6);
  assert.ok(lesson?.where_this_fits);
  assert.ok(lesson?.key_definitions.length);
  assert.ok(lesson?.misconceptions.length);
  assert.ok(lesson?.memory_aids.length);
  assert.ok(lesson?.progress_checkpoint.length);
});

test("invariant fails on em dash in body_markdown", () => {
  const raw = loadObjective(1);
  raw.core_content[0].body_markdown = "A project — unique and transient.";
  const { failures } = validatePfqObjectiveLesson(raw, "objective-01.json");
  assert.ok(failures.some((f) => f.code === "em_dash"));
});

test("invariant fails on bold markers in body_markdown", () => {
  const raw = loadObjective(1);
  raw.core_content[0].body_markdown = "A **project** is unique.";
  const { failures } = validatePfqObjectiveLesson(raw, "objective-01.json");
  assert.ok(failures.some((f) => f.code === "bold_markdown"));
});

test("invariant fails if an outcome code is removed from the corpus", () => {
  const lessons = loadAll();
  lessons[0] = {
    ...lessons[0],
    learning_outcomes: lessons[0].learning_outcomes.filter((c) => c !== "1.1"),
    core_content: lessons[0].core_content.filter(
      (b) => b.outcome_code !== "1.1",
    ),
  };
  const failures = validatePfqLessonCorpus(lessons);
  assert.ok(failures.some((f) => f.code === "missing_outcome"));
});

test("invariant fails if learning_outcomes disagree with core_content", () => {
  const raw = loadObjective(1);
  raw.learning_outcomes = raw.learning_outcomes.slice(0, -1);
  const { failures } = validatePfqObjectiveLesson(raw, "objective-01.json");
  assert.ok(failures.some((f) => f.code === "outcome_mismatch"));
});

test("invariant fails if where_this_fits is missing", () => {
  const raw = loadObjective(1);
  delete raw.where_this_fits;
  const { failures } = validatePfqObjectiveLesson(raw, "objective-01.json");
  assert.ok(failures.some((f) => f.code === "missing_section" || f.code === "missing_field"));
});

test("learner lesson type never includes source_confidence", () => {
  const lessons = loadAll();
  for (const lesson of lessons) {
    assert.equal("source_confidence" in lesson, false);
  }
});
