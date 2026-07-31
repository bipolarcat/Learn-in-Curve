/**
 * Idempotent PMQ content migration: lo*.json → sections / lessons / questions.
 * Run: node scripts/migrate-pmq-content.mjs
 * Requires SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL in .env.local
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

function buildLessonBody(lo) {
  return {
    apm_learning_objective: lo.apm_learning_objective,
    learning_outcomes: lo.learning_outcomes,
    where_this_fits: lo.where_this_fits,
    key_definitions: lo.key_definitions,
    core_content: lo.core_content,
    worked_example: lo.worked_example,
    misconceptions: lo.misconceptions,
    exam_technique: lo.exam_technique,
    memory_aids: lo.memory_aids,
    quick_recap: lo.quick_recap,
    further_reading: lo.further_reading,
    progress_checkpoint: lo.progress_checkpoint,
    quiz_total_marks: lo.quiz_total_marks,
  };
}

function buildQuestionRow(quizItem, sectionId, loCode) {
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
    context: "practice_quiz",
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

async function sectionExists(orderIndex) {
  const { data, error } = await supabase
    .from("sections")
    .select("id")
    .eq("course_id", PMQ_COURSE_ID)
    .eq("order_index", orderIndex)
    .maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
}

async function migrateLo(lo) {
  const orderIndex = lo.lo_number;

  const existingId = await sectionExists(orderIndex);
  if (existingId) {
    return { skipped: true, orderIndex, questions: lo.quiz?.length ?? 0 };
  }

  const { data: section, error: sectionError } = await supabase
    .from("sections")
    .insert({
      course_id: PMQ_COURSE_ID,
      order_index: orderIndex,
      title: lo.title,
      lo_code: lo.lo_code,
      day: lo.day,
      theme: lo.theme,
    })
    .select("id")
    .single();

  if (sectionError) throw sectionError;

  const { error: lessonError } = await supabase.from("lessons").insert({
    section_id: section.id,
    course_id: PMQ_COURSE_ID,
    order_index: 1,
    lesson_type: "content",
    title: lo.title,
    body: buildLessonBody(lo),
  });

  if (lessonError) throw lessonError;

  const questionRows = (lo.quiz ?? []).map((item) =>
    buildQuestionRow(item, section.id, lo.lo_code),
  );

  if (questionRows.length > 0) {
    const { error: questionsError } = await supabase
      .from("questions")
      .insert(questionRows);

    if (questionsError) throw questionsError;
  }

  return {
    skipped: false,
    orderIndex,
    questions: questionRows.length,
  };
}

async function main() {
  const summary = {
    sectionsInserted: 0,
    sectionsSkipped: 0,
    lessonsInserted: 0,
    questionsInserted: 0,
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
      if (result.skipped) {
        summary.sectionsSkipped += 1;
        console.log(`LO${n}: skipped (already exists)`);
      } else {
        summary.sectionsInserted += 1;
        summary.lessonsInserted += 1;
        summary.questionsInserted += result.questions;
        console.log(`LO${n}: inserted section + lesson + ${result.questions} questions`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      summary.errors.push(`LO${n}: ${message}`);
      console.error(`LO${n}: FAILED —`, message);
    }
  }

  console.log("\n--- Migration summary ---");
  console.log(`Sections inserted: ${summary.sectionsInserted}`);
  console.log(`Sections skipped:  ${summary.sectionsSkipped}`);
  console.log(`Lessons inserted:  ${summary.lessonsInserted}`);
  console.log(`Questions inserted: ${summary.questionsInserted}`);

  if (summary.errors.length > 0) {
    console.log(`Errors: ${summary.errors.length}`);
    summary.errors.forEach((e) => console.log(`  - ${e}`));
    process.exit(1);
  }
}

main();
