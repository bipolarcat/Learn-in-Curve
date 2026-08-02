/**
 * Load content/v2/lo*.json into the database.
 *
 *   node scripts/migrate-v2-content.mjs --lo 1 --target staging   (default)
 *   node scripts/migrate-v2-content.mjs --lo 1 --target live
 *   node scripts/migrate-v2-content.mjs --all --target staging
 *
 * target=staging  → sections_v2 / lessons_v2 (safe, invisible to learners)
 * target=live     → overwrites lessons.body for that section (VISIBLE IMMEDIATELY)
 *
 * Rollback for --target live: content-snapshots/v1-content-*.json holds the
 * original bodies. Re-run with --restore <snapshotfile> to put them back.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import { config } from "dotenv";

config({ path: join(process.cwd(), ".env.local") });

const V2_DIR = join(process.cwd(), "content", "v2");
const SNAPSHOT_DIR = join(process.cwd(), "content-snapshots");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? null : (args[i + 1] ?? true);
};
const target = flag("target") ?? "staging";
const restoreFile = flag("restore");

/** Fields the site renders. Anything else in the JSON is build metadata. */
function toLessonBody(lo) {
  return {
    apm_learning_objective: lo.apm_learning_objective,
    learning_outcomes: lo.learning_outcomes,
    key_definitions: lo.key_definitions,
    core_content: lo.core_content,
    misconceptions: lo.misconceptions,
    memory_aids: lo.memory_aids,
    progress_checkpoint: lo.progress_checkpoint,
    ...(lo.where_this_fits ? { where_this_fits: lo.where_this_fits } : {}),
  };
}

async function restore(file) {
  const path = join(SNAPSHOT_DIR, file);
  if (!existsSync(path)) throw new Error(`No snapshot at ${path}`);
  const snap = JSON.parse(readFileSync(path, "utf8"));
  for (const lesson of snap.lessons) {
    const { error } = await supabase
      .from("lessons")
      .update({ body: lesson.body })
      .eq("id", lesson.id);
    if (error) throw error;
  }
  console.log(`Restored ${snap.lessons.length} lesson bodies from ${file}`);
}

async function loadLo(loNumber) {
  const file = join(V2_DIR, `lo${loNumber}.json`);
  if (!existsSync(file)) throw new Error(`Missing ${file}`);
  const lo = JSON.parse(readFileSync(file, "utf8"));
  const body = toLessonBody(lo);

  const { data: section, error: sErr } = await supabase
    .from("sections")
    .select("id, title, course_id, order_index, lo_code, day, theme")
    .eq("order_index", loNumber)
    .single();
  if (sErr) throw sErr;

  if (target === "live") {
    const { data: lesson, error: lErr } = await supabase
      .from("lessons")
      .select("id")
      .eq("section_id", section.id)
      .single();
    if (lErr) throw lErr;

    const { error } = await supabase
      .from("lessons")
      .update({ body, title: lo.title })
      .eq("id", lesson.id);
    if (error) throw error;
    console.log(`LIVE  LO${loNumber} "${lo.title}" → lessons.${lesson.id}`);
    return;
  }

  // staging
  const { data: s2, error: s2Err } = await supabase
    .from("sections_v2")
    .upsert(
      {
        course_id: section.course_id,
        order_index: lo.lo_number,
        title: lo.title,
        lo_code: lo.lo_code,
        day: section.day,
        theme: section.theme,
        source_ref: lo.source_ref,
        authored_on: lo.authored_on,
        review_status: lo.review_status ?? "draft",
      },
      { onConflict: "course_id,order_index" },
    )
    .select("id")
    .single();
  if (s2Err) throw s2Err;

  const { error: l2Err } = await supabase.from("lessons_v2").upsert(
    {
      section_id: s2.id,
      order_index: 1,
      lesson_type: "content",
      title: lo.title,
      body,
    },
    { onConflict: "section_id,order_index" },
  );
  if (l2Err) throw l2Err;
  console.log(`STAGE LO${loNumber} "${lo.title}" → sections_v2.${s2.id}`);
}

async function main() {
  if (restoreFile) return restore(restoreFile);

  if (target !== "staging" && target !== "live") {
    throw new Error(`--target must be "staging" or "live"`);
  }
  if (target === "live") {
    const snaps = existsSync(SNAPSHOT_DIR)
      ? readdirSync(SNAPSHOT_DIR).filter((f) => f.startsWith("v1-content-"))
      : [];
    if (!snaps.length) {
      throw new Error(
        "Refusing to write live content with no snapshot present. Run scripts/snapshot-v1-content.mjs first.",
      );
    }
    console.log(`Snapshot present (${snaps.at(-1)}) — proceeding.`);
  }

  const los = flag("all")
    ? readdirSync(V2_DIR)
        .map((f) => /^lo(\d+)\.json$/.exec(f)?.[1])
        .filter(Boolean)
        .map(Number)
        .sort((a, b) => a - b)
    : [Number(flag("lo"))];

  if (!los.length || los.some(Number.isNaN)) {
    throw new Error("Pass --lo <n> or --all");
  }

  for (const n of los) await loadLo(n);
  console.log(`Done (${los.length} LO${los.length > 1 ? "s" : ""}, target=${target}).`);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
