/**
 * Idempotent PFQ question seed: JSON → pfq_questions.
 * Run: npm run seed:pfq
 *
 * Source of truth: PFQ in 2 days/pfq-questions.json — do not edit rows in the DB.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";
import { config } from "dotenv";

config({ path: join(process.cwd(), ".env.local") });

const BANK_PATH = join(process.cwd(), "PFQ in 2 days", "pfq-questions.json");

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

function validate(questions) {
  const failures = [];
  const expected = new Set(EXPECTED);
  const found = new Set(questions.map((q) => q.learning_outcome));
  for (const code of expected) {
    if (!found.has(code)) failures.push(`Missing outcome ${code}`);
  }
  for (const code of found) {
    if (!expected.has(code)) failures.push(`Unexpected outcome ${code}`);
  }
  for (const q of questions) {
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
    if (/\boption [a-d]\b/i.test(q.explanation ?? "")) {
      failures.push(`${q.id}: explanation cites option letter`);
    }
  }
  return failures;
}

const raw = JSON.parse(readFileSync(BANK_PATH, "utf8"));
const questions = raw.questions;
if (!Array.isArray(questions) || questions.length === 0) {
  console.error("No questions in", BANK_PATH);
  process.exit(1);
}

const failures = validate(questions);
if (failures.length) {
  console.error("Bank invariant failed:");
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}

const rows = questions.map((q) => ({
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
  active: true,
  updated_at: new Date().toISOString(),
}));

const { error } = await supabase.from("pfq_questions").upsert(rows, {
  onConflict: "id",
});

if (error) {
  console.error("Upsert failed:", error.message);
  console.error(
    "Did you apply supabase/migrations/20260813180000_pfq_mock.sql?",
  );
  process.exit(1);
}

console.log(`Upserted ${rows.length} PFQ questions (idempotent).`);
