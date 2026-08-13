/**
 * Idempotent PFQ question seed: mock + practice JSON → pfq_questions.
 * Run: npm run seed:pfq
 *
 * Sources of truth (do not edit rows in the DB):
 *   - PFQ in 2 days/pfq-questions.json          (mock_suitable: true, variant: 1)
 *   - PFQ in 2 days/pfq-practice-questions.json  (practice-only; partial OK while authoring)
 *
 * mock_suitable and variant are mapped explicitly — never rely on column defaults
 * (default mock_suitable=false would leave the mock undrawable).
 */

import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { config } from "dotenv";

config({ path: join(process.cwd(), ".env.local") });

const MOCK_PATH = join(process.cwd(), "PFQ in 2 days", "pfq-questions.json");
const PRACTICE_PATH = join(
  process.cwd(),
  "PFQ in 2 days",
  "pfq-practice-questions.json",
);

const EXPECTED = [
  "1.1", "1.2", "1.3", "1.4", "1.5", "1.6",
  "2.1", "2.2", "2.3", "2.4",
  "3.1",
  "4.1", "4.2", "4.3", "4.4", "4.5", "4.6", "4.7", "4.8", "4.9", "4.10", "4.11",
  "5.1", "5.2", "5.3", "5.4", "5.5", "5.6", "5.7", "5.8",
  "6.1", "6.2", "6.3", "6.4", "6.5", "6.6",
  "7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8",
  "8.1", "8.2", "8.3", "8.4", "8.5", "8.6",
  "9.1", "9.2", "9.3", "9.4", "9.5",
  "10.1", "10.2", "10.3", "10.4",
];

const EM_DASH_RE = /—|–/;
const OPTION_LETTER_RE = /\boption [a-d]\b/i;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function loadQuestions(path, { required }) {
  if (!existsSync(path)) {
    if (required) {
      console.error("Missing required bank file:", path);
      process.exit(1);
    }
    console.warn("Practice bank not found yet — seeding mock only:", path);
    return [];
  }
  const raw = JSON.parse(readFileSync(path, "utf8"));
  const questions = raw.questions;
  if (!Array.isArray(questions)) {
    console.error("Invalid bank (questions not an array):", path);
    process.exit(1);
  }
  return questions;
}

function validate(questions, { requireAllOutcomes }) {
  const failures = [];
  const expected = new Set(EXPECTED);
  const found = new Set(questions.map((q) => q.learning_outcome));
  const ids = new Set();

  if (requireAllOutcomes) {
    for (const code of expected) {
      if (!found.has(code)) failures.push(`Missing outcome ${code}`);
    }
  }
  for (const code of found) {
    if (!expected.has(code)) failures.push(`Unexpected outcome ${code}`);
  }

  for (const q of questions) {
    if (ids.has(q.id)) failures.push(`Duplicate id ${q.id}`);
    ids.add(q.id);

    const keys = Object.keys(q.options ?? {}).sort();
    if (keys.length !== 4 || keys.join("") !== "abcd") {
      failures.push(`${q.id}: options must be a,b,c,d`);
    }
    if (!keys.includes(q.answer)) {
      failures.push(`${q.id}: answer not in options`);
    }
    if (q.type === "multi_select" && (q.items ?? []).length !== 4) {
      failures.push(`${q.id}: multi_select needs 4 items`);
    }
    if (OPTION_LETTER_RE.test(q.explanation ?? "")) {
      failures.push(`${q.id}: explanation cites option letter`);
    }
    const text = [
      q.stem,
      q.explanation,
      ...Object.values(q.options ?? {}),
      ...(q.items ?? []),
    ].join("\n");
    if (EM_DASH_RE.test(text)) {
      failures.push(`${q.id}: contains em/en dash`);
    }
    if (typeof q.mock_suitable !== "boolean") {
      failures.push(`${q.id}: mock_suitable must be explicit boolean`);
    }
    if (!Number.isInteger(q.variant) || q.variant < 1) {
      failures.push(`${q.id}: variant must be integer >= 1`);
    }
  }

  return failures;
}

function toRow(q) {
  return {
    id: q.id,
    learning_outcome: q.learning_outcome,
    objective: q.objective,
    day: q.day,
    verb: q.verb,
    type: q.type,
    traps: q.traps ?? [],
    stem: q.stem,
    items: q.items ?? null,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation,
    mock_suitable: Boolean(q.mock_suitable),
    variant: Number(q.variant),
    active: true,
  };
}

function sameRow(existing, next) {
  return (
    existing.learning_outcome === next.learning_outcome &&
    Number(existing.objective) === Number(next.objective) &&
    Number(existing.day) === Number(next.day) &&
    existing.verb === next.verb &&
    existing.type === next.type &&
    JSON.stringify(existing.traps ?? []) === JSON.stringify(next.traps ?? []) &&
    existing.stem === next.stem &&
    JSON.stringify(existing.items ?? null) === JSON.stringify(next.items ?? null) &&
    JSON.stringify(existing.options) === JSON.stringify(next.options) &&
    existing.answer === next.answer &&
    existing.explanation === next.explanation &&
    Boolean(existing.mock_suitable) === Boolean(next.mock_suitable) &&
    Number(existing.variant) === Number(next.variant) &&
    existing.active !== false
  );
}

const mockQuestions = loadQuestions(MOCK_PATH, { required: true });
const practiceQuestions = loadQuestions(PRACTICE_PATH, { required: false });

if (mockQuestions.length === 0) {
  console.error("No questions in", MOCK_PATH);
  process.exit(1);
}

const mockFailures = validate(mockQuestions, { requireAllOutcomes: true });
if (mockFailures.length) {
  console.error("Mock bank invariant failed:");
  for (const f of mockFailures) console.error(`  ${f}`);
  process.exit(1);
}

const practiceFailures = validate(practiceQuestions, {
  requireAllOutcomes: false,
});
if (practiceFailures.length) {
  console.error("Practice bank invariant failed:");
  for (const f of practiceFailures) console.error(`  ${f}`);
  process.exit(1);
}

const combined = [...mockQuestions, ...practiceQuestions];
const idSet = new Set();
for (const q of combined) {
  if (idSet.has(q.id)) {
    console.error(`id collides across banks: ${q.id}`);
    process.exit(1);
  }
  idSet.add(q.id);
}

const mockSuitableOutcomes = new Set(
  mockQuestions.filter((q) => q.mock_suitable).map((q) => q.learning_outcome),
);
const missingMockSuitable = EXPECTED.filter((c) => !mockSuitableOutcomes.has(c));
if (missingMockSuitable.length) {
  console.error(
    "Every outcome needs at least one mock_suitable question. Missing:",
    missingMockSuitable.join(", "),
  );
  process.exit(1);
}

const rows = combined.map(toRow);
const ids = rows.map((r) => r.id);

const { data: existing, error: fetchError } = await supabase
  .from("pfq_questions")
  .select(
    "id, learning_outcome, objective, day, verb, type, traps, stem, items, options, answer, explanation, mock_suitable, variant, active",
  )
  .in("id", ids);

if (fetchError) {
  console.error("Fetch existing failed:", fetchError.message);
  console.error(
    "Did you apply supabase/migrations/20260813180000_pfq_mock.sql and 20260813210000_pfq_practice_bank.sql?",
  );
  process.exit(1);
}

const existingById = new Map((existing ?? []).map((r) => [r.id, r]));
const toUpsert = [];
for (const row of rows) {
  const prev = existingById.get(row.id);
  if (!prev || !sameRow(prev, row)) {
    toUpsert.push({
      ...row,
      updated_at: new Date().toISOString(),
    });
  }
}

if (toUpsert.length === 0) {
  console.log(
    `No changes — ${rows.length} questions already match (${mockQuestions.length} mock + ${practiceQuestions.length} practice).`,
  );
} else {
  const { error } = await supabase.from("pfq_questions").upsert(toUpsert, {
    onConflict: "id",
  });
  if (error) {
    console.error("Upsert failed:", error.message);
    console.error(
      "Did you apply supabase/migrations/20260813180000_pfq_mock.sql and 20260813210000_pfq_practice_bank.sql?",
    );
    process.exit(1);
  }
  console.log(
    `Upserted ${toUpsert.length} of ${rows.length} PFQ questions (${mockQuestions.length} mock + ${practiceQuestions.length} practice).`,
  );
}

const { data: verify, error: verifyError } = await supabase
  .from("pfq_questions")
  .select("learning_outcome")
  .eq("active", true)
  .eq("mock_suitable", true);

if (verifyError) {
  console.error("Post-seed verify failed:", verifyError.message);
  process.exit(1);
}

const liveMockOutcomes = new Set(
  (verify ?? []).map((r) => r.learning_outcome),
);
const stillMissing = EXPECTED.filter((c) => !liveMockOutcomes.has(c));
if (stillMissing.length) {
  console.error(
    "FATAL: after seed, outcomes still lack a mock_suitable question:",
    stillMissing.join(", "),
  );
  process.exit(1);
}

console.log(
  `OK — ${EXPECTED.length} outcomes each have ≥1 mock_suitable question in the live bank.`,
);
