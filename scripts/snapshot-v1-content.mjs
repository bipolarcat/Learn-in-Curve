/**
 * Snapshot live v1 course content (sections + lessons) to a timestamped file.
 * This is the rollback point for the v2 content rebuild.
 *
 * Run: node scripts/snapshot-v1-content.mjs
 * Requires SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL in .env.local
 *
 * Read-only. Never writes to the database.
 */

import { createClient } from "@supabase/supabase-js";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { config } from "dotenv";

config({ path: join(process.cwd(), ".env.local") });

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

const OUT_DIR = join(process.cwd(), "content-snapshots");

async function main() {
  const { data: courses, error: cErr } = await supabase
    .from("courses")
    .select("*");
  if (cErr) throw cErr;

  const { data: sections, error: sErr } = await supabase
    .from("sections")
    .select("*")
    .order("order_index", { ascending: true });
  if (sErr) throw sErr;

  const { data: lessons, error: lErr } = await supabase
    .from("lessons")
    .select("*")
    .order("order_index", { ascending: true });
  if (lErr) throw lErr;

  const { count: questionCount, error: qErr } = await supabase
    .from("questions")
    .select("*", { count: "exact", head: true });
  if (qErr) throw qErr;

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");

  const snapshot = {
    snapshot_meta: {
      taken_at: new Date().toISOString(),
      purpose:
        "Rollback point and pedagogy-layer reference prior to the v2 content rebuild (BoK 8th ed / PMQ 2024 handbook).",
      supabase_url: url,
      counts: {
        courses: courses.length,
        sections: sections.length,
        lessons: lessons.length,
        questions: questionCount,
      },
    },
    courses,
    sections,
    lessons,
  };

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  const outPath = join(OUT_DIR, `v1-content-${stamp}.json`);
  writeFileSync(outPath, JSON.stringify(snapshot, null, 2), "utf8");

  console.log(`Snapshot written: ${outPath}`);
  console.log(
    `  courses=${courses.length} sections=${sections.length} lessons=${lessons.length} questions=${questionCount}`,
  );

  // Per-LO index so the pedagogy layer is easy to reference during the rebuild
  const index = sections.map((s) => {
    const ls = lessons.filter((l) => l.section_id === s.id);
    return {
      order_index: s.order_index,
      lo_code: s.lo_code,
      title: s.title,
      day: s.day,
      theme: s.theme,
      lessons: ls.map((l) => ({
        title: l.title,
        lesson_type: l.lesson_type,
        body_bytes: JSON.stringify(l.body ?? {}).length,
        body_keys: Object.keys(l.body ?? {}).sort(),
      })),
    };
  });

  const indexPath = join(OUT_DIR, `v1-index-${stamp}.json`);
  writeFileSync(indexPath, JSON.stringify(index, null, 2), "utf8");
  console.log(`Index written:    ${indexPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
