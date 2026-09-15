/**
 * Load authored PFQ questions from content/pfq/questions/objective-*.json
 * into pfq_questions.
 *
 *   npx tsx scripts/pfq/load-questions.ts          # dry-run (default)
 *   npx tsx scripts/pfq/load-questions.ts --apply  # write upserts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 * when --apply is set.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { PFQ_EXPECTED_OUTCOMES } from "../../src/lib/pfq/outcomes.ts";
import { isPfqTrapTag } from "../../src/lib/pfq/trap-tags.ts";

config({ path: join(process.cwd(), ".env.local") });

const CONTENT_DIR = join(process.cwd(), "content", "pfq", "questions");
const APPLY = process.argv.includes("--apply");
const EXPECTED = new Set<string>(PFQ_EXPECTED_OUTCOMES);

type RawQuestion = {
  id: string;
  learning_outcome: string;
  objective: number;
  day: number;
  verb: string;
  type: string;
  traps?: string[];
  stem: string;
  items?: string[] | null;
  options: Record<string, string>;
  answer: string;
  explanation: string;
  tip?: string | null;
  active?: boolean;
  mock_suitable?: boolean;
  mock_set?: number | null;
  variant?: number;
};

type FileBundle = {
  file: string;
  objective: number | null;
  questions: RawQuestion[];
};

function parseObjectiveFromName(name: string): number | null {
  const m = name.match(/objective-(\d+)/i);
  return m ? Number(m[1]) : null;
}

function loadBundles(): FileBundle[] {
  const files = readdirSync(CONTENT_DIR)
    .filter((f) => /^objective-.*\.json$/i.test(f))
    .sort();
  if (files.length === 0) {
    console.error("No objective-*.json files in", CONTENT_DIR);
    process.exit(1);
  }

  return files.map((file) => {
    const path = join(CONTENT_DIR, file);
    const raw = JSON.parse(readFileSync(path, "utf8")) as
      | RawQuestion[]
      | { questions: RawQuestion[] };
    const questions = Array.isArray(raw) ? raw : raw.questions;
    if (!Array.isArray(questions)) {
      console.error(`${file}: expected array or { questions: [] }`);
      process.exit(1);
    }
    return {
      file,
      objective: parseObjectiveFromName(file),
      questions,
    };
  });
}

function validateQuestion(
  q: RawQuestion,
  failures: string[],
  ids: Set<string>,
  variantByLo: Map<string, Set<number>>,
): void {
  if (!q.id) failures.push("missing id");
  if (ids.has(q.id)) failures.push(`duplicate id ${q.id}`);
  ids.add(q.id);

  if (!EXPECTED.has(q.learning_outcome)) {
    failures.push(`${q.id}: learning_outcome ${q.learning_outcome} not in outcomes.ts`);
  }

  const stem = String(q.stem ?? "").trim();
  const explanation = String(q.explanation ?? "").trim();
  if (!stem) failures.push(`${q.id}: empty stem`);
  if (!explanation) failures.push(`${q.id}: empty explanation`);

  const keys = Object.keys(q.options ?? {}).sort();
  if (keys.length !== 4 || keys.join("") !== "abcd") {
    failures.push(`${q.id}: options must have keys a,b,c,d`);
  }
  if (!keys.includes(q.answer)) {
    failures.push(`${q.id}: answer "${q.answer}" not in options`);
  }

  if (q.type === "multi_select") {
    const items = q.items ?? [];
    if (!Array.isArray(items) || items.length !== 4) {
      failures.push(`${q.id}: multi_select requires exactly 4 items`);
    }
  } else if (q.items != null && Array.isArray(q.items) && q.items.length > 0) {
    failures.push(`${q.id}: items only allowed on multi_select`);
  }

  for (const tag of q.traps ?? []) {
    if (!isPfqTrapTag(tag)) {
      failures.push(`${q.id}: unknown trap tag "${tag}"`);
    }
  }

  const variant = Number(q.variant ?? 1);
  const key = q.learning_outcome;
  const seen = variantByLo.get(key) ?? new Set<number>();
  if (seen.has(variant)) {
    failures.push(`${q.id}: variant ${variant} collides within LO ${key}`);
  }
  seen.add(variant);
  variantByLo.set(key, seen);
}

function toRow(q: RawQuestion) {
  const mockSet: 1 | 2 | 3 | null =
    q.mock_set === 1 || q.mock_set === 2 || q.mock_set === 3 ? q.mock_set : null;
  return {
    id: q.id,
    learning_outcome: q.learning_outcome,
    objective: Number(q.objective),
    day: Number(q.day),
    verb: String(q.verb ?? ""),
    type: q.type === "multi_select" ? "multi_select" : "single",
    traps: Array.isArray(q.traps) ? q.traps : [],
    stem: q.stem,
    items: q.type === "multi_select" ? (q.items ?? null) : null,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation,
    tip: typeof q.tip === "string" && q.tip.trim() ? q.tip.trim() : null,
    active: q.active !== false,
    mock_suitable: Boolean(q.mock_suitable),
    mock_set: mockSet === null ? null : String(mockSet),
    variant: Number(q.variant ?? 1),
  };
}

async function main() {
  const bundles = loadBundles();
  const failures: string[] = [];
  const ids = new Set<string>();
  const variantByLo = new Map<string, Set<number>>();
  const allRows: ReturnType<typeof toRow>[] = [];

  for (const bundle of bundles) {
    for (const q of bundle.questions) {
      validateQuestion(q, failures, ids, variantByLo);
      allRows.push(toRow(q));
    }
  }

  if (failures.length) {
    console.error("Validation failed:");
    for (const f of failures) console.error(" -", f);
    process.exit(1);
  }

  console.log(
    `Validated ${allRows.length} questions across ${bundles.length} file(s).`,
  );

  if (!APPLY) {
    for (const bundle of bundles) {
      console.log(
        `  ${bundle.file}: ${bundle.questions.length} question(s) (dry-run)`,
      );
    }
    console.log("Dry-run only. Pass --apply to upsert.");
    return;
  }

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

  for (const bundle of bundles) {
    const rows = bundle.questions.map(toRow);
    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (const row of rows) {
      const { data: existing, error: fetchError } = await supabase
        .from("pfq_questions")
        .select("id")
        .eq("id", row.id)
        .maybeSingle();
      if (fetchError) {
        console.error(bundle.file, row.id, fetchError.message);
        process.exit(1);
      }

      const { error } = await supabase.from("pfq_questions").upsert(row, {
        onConflict: "id",
      });
      if (error) {
        console.error(bundle.file, row.id, error.message);
        process.exit(1);
      }

      if (existing) updated += 1;
      else inserted += 1;
    }

    console.log(
      `${bundle.file}: inserted=${inserted} updated=${updated} skipped=${skipped}`,
    );
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
