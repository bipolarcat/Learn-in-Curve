/**
 * Full replace-in-place migration for the 3 served practice tiers.
 * Replaces (does NOT append to) practice_quiz / quiz_set_2 / quiz_set_3
 * for each LO section, from the current PMQ in 5 days/content/lo*.json.
 *
 * Run: node scripts/migrate-pmq-quiz-sets-v2.mjs
 * Requires SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL in .env.local
 *
 * Only touches practice_quiz/quiz_set_2/quiz_set_3 rows for this course.
 * Does not touch mock_exam rows, or quiz_set_4+ (not yet consumed by app code).
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { config } from "dotenv";

config({ path: join(process.cwd(), ".env.local") });

const PMQ_COURSE_ID = "3b6e12c0-321f-41b2-8536-db39f5678301";
const CONTENT_DIR = join(process.cwd(), "PMQ in 5 days", "content");
const SERVED_SETS = [
  { key: "quiz", context: "practice_quiz" },
  { key: "quiz_set_2", context: "quiz_set_2" },
  { key: "quiz_set_3", context: "quiz_set_3" },
];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const TYPE_MAP = {
  mcq: { question_type: "multiple_choice", is_scenario: false },
  scenario_mcq: { question_type: "multiple_choice", is_scenario: true },
  dropdown: { question_type: "select_from_list", is_scenario: false },
};

function buildRow(item, sectionId, loCode, context, position) {
  const mapped = TYPE_MAP[item.type];
  if (!mapped) throw new Error(`Unknown/unsupported type "${item.type}" for ${item.id}`);

  const row = {
    section_id: sectionId,
    course_id: PMQ_COURSE_ID,
    external_id: item.id,
    question_type: mapped.question_type,
    is_scenario: mapped.is_scenario,
    is_case_study: false,
    learning_objective: loCode,
    context,
    marks: item.marks ?? 1,
    prompt: item.question,
    mock_suitable: item.mock_suitable ?? false,
    explanation: item.explanation ?? null,
    options: null,
    correct_answer: null,
    model_answer: null,
    marking_guide: null,
    position,
  };

  if (item.type === "mcq" || item.type === "scenario_mcq") {
    row.options = item.options;
    row.correct_answer = item.correct_answer;
  } else if (item.type === "dropdown") {
    row.options = item.dropdowns;
    row.correct_answer = item.correct_answers;
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

async function migrateLo(lo) {
  const orderIndex = lo.lo_number;
  const sectionId = await getSectionId(orderIndex);
  if (!sectionId) return { orderIndex, missingSection: true, deleted: 0, inserted: 0 };

  // full replace: delete existing rows in the 3 served contexts for this section, then insert fresh
  const { error: delError, count } = await supabase
    .from("questions")
    .delete({ count: "exact" })
    .eq("course_id", PMQ_COURSE_ID)
    .eq("section_id", sectionId)
    .in("context", ["practice_quiz", "quiz_set_2", "quiz_set_3"]);
  if (delError) throw delError;

  const toInsert = [];
  for (const { key, context } of SERVED_SETS) {
    const items = lo[key] ?? [];
    items.forEach((item, idx) => {
      toInsert.push(buildRow(item, sectionId, lo.lo_code, context, idx + 1));
    });
  }

  let inserted = 0;
  if (toInsert.length > 0) {
    const { error: insError } = await supabase.from("questions").insert(toInsert);
    if (insError) throw insError;
    inserted = toInsert.length;
  }

  return { orderIndex, missingSection: false, deleted: count ?? 0, inserted };
}

async function main() {
  const summary = { deleted: 0, inserted: 0, missingSections: 0, errors: [] };

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
        console.log(`LO${n}: SKIPPED - no section in DB`);
      } else {
        summary.deleted += result.deleted;
        summary.inserted += result.inserted;
        console.log(`LO${n}: deleted ${result.deleted}, inserted ${result.inserted}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      summary.errors.push(`LO${n}: ${message}`);
      console.error(`LO${n}: FAILED -`, message);
    }
  }

  console.log("\n--- Full replace migration summary ---");
  console.log(`Rows deleted:  ${summary.deleted}`);
  console.log(`Rows inserted: ${summary.inserted}`);
  console.log(`Missing sections: ${summary.missingSections}`);
  if (summary.errors.length > 0) {
    console.log(`Errors: ${summary.errors.length}`);
    summary.errors.forEach((e) => console.log(`  - ${e}`));
    process.exit(1);
  }
}

main();
