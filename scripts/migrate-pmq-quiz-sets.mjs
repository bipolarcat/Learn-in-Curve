/**
 * Idempotent migration: quiz_set_2 / quiz_set_3 from lo*.json → questions.
 * Run: node scripts/migrate-pmq-quiz-sets.mjs
 * Requires SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL in .env.local
 *
 * Does not create sections — looks up existing section by order_index.
 * Skips rows that already exist for (section_id, context, external_id).
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { config } from "dotenv";

config({ path: join(process.cwd(), ".env.local") });

const PMQ_COURSE_ID = "3b6e12c0-321f-41b2-8536-db39f5678301";
const CONTENT_DIR = join(process.cwd(), "PMQ in 5 days", "content");

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

const SETS = [
  { key: "quiz_set_2", context: "quiz_set_2" },
  { key: "quiz_set_3", context: "quiz_set_3" },
];

function buildQuestionRow(quizItem, sectionId, loCode, context) {
  const mapped = TYPE_MAP[quizItem.type];
  if (!mapped) {
    throw new Error(`Unknown quiz type "${quizItem.type}" for ${quizItem.id}`);
  }

  const row = {
    section_id: sectionId,
    course_id: PMQ_COURSE_ID,
    external_id: quizItem.id,
    question_type: mapped.question_type,
    is_scenario: mapped.is_scenario,
    learning_objective: loCode,
    context,
    marks: quizItem.marks,
    prompt: quizItem.question,
    mock_suitable: quizItem.mock_suitable ?? false,
    explanation: quizItem.explanation ?? null,
    options: null,
    correct_answer: null,
    model_answer: null,
    marking_guide: null,
  };

  if (quizItem.type === "mcq" || quizItem.type === "scenario_mcq") {
    row.options = quizItem.options;
    row.correct_answer = quizItem.correct_answer;
  } else if (quizItem.type === "dropdown") {
    row.options = quizItem.dropdowns;
    row.correct_answer = quizItem.correct_answers;
  } else {
    row.model_answer = quizItem.model_answer ?? null;
    row.marking_guide = quizItem.marking_guide ?? null;
  }

  return row;
}

async function getSectionId(orderIndex) {
  const { data, error } = await supabase
    .from("sections")
    .select("id")
    .eq("course_id", PMQ_COURSE_ID)
    .eq("order_index", orderIndex)
    .maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
}

async function existingExternalIds(sectionId, context) {
  const { data, error } = await supabase
    .from("questions")
    .select("external_id")
    .eq("section_id", sectionId)
    .eq("context", context);

  if (error) throw error;
  return new Set((data ?? []).map((r) => r.external_id));
}

async function migrateLo(lo) {
  const orderIndex = lo.lo_number;
  const sectionId = await getSectionId(orderIndex);

  if (!sectionId) {
    return {
      orderIndex,
      missingSection: true,
      inserted: 0,
      skipped: 0,
    };
  }

  let inserted = 0;
  let skipped = 0;

  for (const { key, context } of SETS) {
    const items = lo[key] ?? [];
    const existing = await existingExternalIds(sectionId, context);
    const toInsert = [];

    for (const item of items) {
      if (existing.has(item.id)) {
        skipped += 1;
        continue;
      }
      toInsert.push(buildQuestionRow(item, sectionId, lo.lo_code, context));
    }

    if (toInsert.length > 0) {
      const { error } = await supabase.from("questions").insert(toInsert);
      if (error) throw error;
      inserted += toInsert.length;
    }
  }

  return { orderIndex, missingSection: false, inserted, skipped };
}

async function main() {
  const summary = {
    questionsInserted: 0,
    questionsSkipped: 0,
    missingSections: 0,
    errors: [],
  };

  for (let n = 1; n <= 24; n++) {
    const filePath = join(CONTENT_DIR, `lo${n}.json`);
    if (!existsSync(filePath)) {
      summary.errors.push(`Missing file: lo${n}.json`);
      continue;
    }

    const lo = JSON.parse(readFileSync(filePath, "utf8"));

    try {
      const result = await migrateLo(lo);
      if (result.missingSection) {
        summary.missingSections += 1;
        console.log(`LO${n}: SKIPPED — no section in DB`);
      } else {
        summary.questionsInserted += result.inserted;
        summary.questionsSkipped += result.skipped;
        console.log(
          `LO${n}: inserted ${result.inserted}, skipped ${result.skipped} (already present)`,
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      summary.errors.push(`LO${n}: ${message}`);
      console.error(`LO${n}: FAILED —`, message);
    }
  }

  console.log("\n--- Quiz-set migration summary ---");
  console.log(`Questions inserted: ${summary.questionsInserted}`);
  console.log(`Questions skipped:  ${summary.questionsSkipped}`);
  console.log(`Missing sections:   ${summary.missingSections}`);

  if (summary.errors.length > 0) {
    console.log(`Errors: ${summary.errors.length}`);
    summary.errors.forEach((e) => console.log(`  - ${e}`));
    process.exit(1);
  }
}

main();
