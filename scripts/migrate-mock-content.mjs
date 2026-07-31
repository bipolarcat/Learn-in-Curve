/**
 * Idempotent mock exam migration: mock.json → questions (context=mock_exam).
 * Run: node scripts/migrate-mock-content.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";
import { config } from "dotenv";

config({ path: join(process.cwd(), ".env.local") });

const PMQ_COURSE_ID = "3b6e12c0-321f-41b2-8536-db39f5678301";
const MOCK_PATH = join(process.cwd(), "PMQ in 5 days", "content", "mock.json");

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

const TYPE_MAP = {
  mcq: { question_type: "multiple_choice", is_scenario: false },
  scenario_mcq: { question_type: "multiple_choice", is_scenario: true },
  dropdown: { question_type: "select_from_list", is_scenario: false },
  long_form: { question_type: "long_answer", is_scenario: false },
  short_recall: { question_type: "short_answer", is_scenario: false },
};

function buildMockQuestionRow(item) {
  const mapped = TYPE_MAP[item.type];
  if (!mapped) {
    throw new Error(`Unknown type "${item.type}" for ${item.id}`);
  }

  const row = {
    section_id: null,
    course_id: PMQ_COURSE_ID,
    external_id: item.id,
    question_type: mapped.question_type,
    is_scenario: mapped.is_scenario,
    learning_objective: item.lo_reference ?? "mock",
    context: "mock_exam",
    exam_set: 1,
    part: item.part,
    position: item.position,
    marks: item.marks,
    prompt: item.question,
    mock_suitable: true,
    explanation: item.explanation ?? null,
    options: null,
    correct_answer: null,
    model_answer: null,
    marking_guide: null,
  };

  if (item.type === "mcq" || item.type === "scenario_mcq") {
    row.options = item.options;
    row.correct_answer = item.correct_answer;
  } else if (item.type === "dropdown") {
    row.options = item.dropdowns;
    row.correct_answer = item.correct_answers;
  } else {
    row.model_answer = item.model_answer ?? null;
    row.marking_guide = item.marking_guide ?? null;
  }

  return row;
}

async function mockQuestionsExist() {
  const { count, error } = await supabase
    .from("questions")
    .select("id", { count: "exact", head: true })
    .eq("course_id", PMQ_COURSE_ID)
    .eq("context", "mock_exam")
    .eq("exam_set", 1);

  if (error) throw error;
  return (count ?? 0) > 0;
}

async function main() {
  if (await mockQuestionsExist()) {
    console.log("Mock Exam 1 questions already exist — skipping.");
    return;
  }

  const mock = JSON.parse(readFileSync(MOCK_PATH, "utf8"));
  const rows = [];

  for (const part of mock.parts ?? []) {
    for (const q of part.questions ?? []) {
      rows.push(buildMockQuestionRow(q));
    }
  }

  const { error } = await supabase.from("questions").insert(rows);
  if (error) throw error;

  console.log(`Inserted ${rows.length} mock exam questions.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
