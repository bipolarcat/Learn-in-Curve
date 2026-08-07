/**
 * One-off backfill: re-score abandoned mock sessions that never got finalized_at
 * (pre-expired-status bug). Uses the same expireSession / previewSessionScore
 * path as runtime.
 *
 * ONLY run after Tasks 1–5 are deployed and the `expired` migration is applied.
 *
 * First run (scoped):
 *   npx tsx scripts/backfill-abandoned-mock-scores.mjs --email sim.samaar@yahoo.in
 *
 * Dry run (scores without writing):
 *   npx tsx scripts/backfill-abandoned-mock-scores.mjs --email sim.samaar@yahoo.in --dry-run
 *
 * Widen later (all users with abandoned + null finalized_at):
 *   npx tsx scripts/backfill-abandoned-mock-scores.mjs --all
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
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

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const allUsers = args.has("--all");
const emailFlag = process.argv.indexOf("--email");
const emailFilter =
  emailFlag >= 0 ? process.argv[emailFlag + 1]?.trim() : null;

if (!allUsers && !emailFilter) {
  console.error(
    "Pass --email <address> for the first scoped run, or --all to widen.",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const PMQ_COURSE_ID = "3b6e12c0-321f-41b2-8536-db39f5678301";

async function loadTerminateFns() {
  try {
    const mod = await import("../src/lib/pmq/mock-terminate.ts");
    return {
      expireSession: mod.expireSession,
      previewSessionScore: mod.previewSessionScore,
    };
  } catch {
    return null;
  }
}

async function certificateCount() {
  const { count, error } = await supabase
    .from("certificates")
    .select("id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

async function resolveUserIds() {
  if (allUsers) return null;

  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (error) throw error;

  const needle = emailFilter.toLowerCase();
  const matches = (data.users ?? []).filter((u) =>
    (u.email ?? "").toLowerCase().includes(needle.replace(/%/g, "")),
  );

  console.log("auth.users cross-check:");
  for (const u of matches) {
    console.log(`  ${u.id}  ${u.email}`);
  }

  if (matches.length === 0) {
    console.error(`No auth.users row matching email ilike %${emailFilter}%`);
    process.exit(1);
  }
  return matches.map((u) => u.id);
}

function printPreview(session, terminalStatus, preview, tag = "") {
  const { breakdown, passed } = preview;
  console.log(
    `\n${session.id} exam_set=${session.exam_set} → ${terminalStatus}${tag}`,
  );
  console.log(
    `  total=${breakdown.totalScore}/${breakdown.maxScore} passed=${passed} ungradedWritten=${breakdown.ungradedWritten}`,
  );
  console.log(
    `  part1: ${breakdown.partOne.earned}/${breakdown.partOne.available} earned, ${breakdown.partOne.answered} answered`,
  );
  console.log(
    `  part2: ${breakdown.partTwo.earned}/${breakdown.partTwo.available} earned, ${breakdown.partTwo.answered} answered`,
  );
}

async function main() {
  const fns = await loadTerminateFns();
  if (!fns) {
    console.error(
      "Could not import mock-terminate. Run with: npx tsx scripts/backfill-abandoned-mock-scores.mjs ...",
    );
    process.exit(1);
  }
  const { expireSession, previewSessionScore } = fns;

  const userIds = await resolveUserIds();

  let query = supabase
    .from("exam_sessions")
    .select(
      "id, user_id, course_id, exam_set, tier, status, started_at, deadline_at, break_ends_at, submitted_at, finalized_at, total_score, max_score, passed, part_1_submitted_at, part_2_submitted_at, config_snapshot",
    )
    .eq("course_id", PMQ_COURSE_ID)
    .eq("status", "abandoned")
    .is("finalized_at", null);

  if (userIds) {
    query = query.in("user_id", userIds);
  }

  const { data: sessions, error } = await query;
  if (error) throw error;

  console.log(`Found ${sessions?.length ?? 0} abandoned session(s) to repair.`);
  if (!sessions?.length) return;

  const certsBefore = await certificateCount();
  console.log(`certificates count before: ${certsBefore}`);

  for (const session of sessions) {
    const clockExpired =
      (session.break_ends_at &&
        session.submitted_at &&
        new Date(session.submitted_at) > new Date(session.break_ends_at)) ||
      (session.deadline_at &&
        session.submitted_at &&
        new Date(session.submitted_at) > new Date(session.deadline_at));

    const terminalStatus = clockExpired ? "expired" : "abandoned";

    if (dryRun) {
      const preview = await previewSessionScore(
        supabase,
        session.user_id,
        PMQ_COURSE_ID,
        session,
      );
      printPreview(session, terminalStatus, preview, " (dry-run)");
      continue;
    }

    const updated = await expireSession(
      supabase,
      session.user_id,
      PMQ_COURSE_ID,
      session,
      ["abandoned"],
      terminalStatus,
    );

    const preview = await previewSessionScore(
      supabase,
      session.user_id,
      PMQ_COURSE_ID,
      session,
    );
    printPreview(session, updated.status, preview);
    console.log(
      `  wrote total_score=${updated.total_score} max_score=${updated.max_score} passed=${updated.passed} finalized_at=${updated.finalized_at}`,
    );
  }

  const certsAfter = await certificateCount();
  console.log(`\ncertificates count after: ${certsAfter}`);
  if (certsAfter !== certsBefore) {
    console.error(
      `CERTIFICATE INVARIANT FAILED: count changed ${certsBefore} → ${certsAfter}. Abort.`,
    );
    process.exit(1);
  }

  console.log("Done. Certificate count unchanged.");
  console.log(
    "Expected (sim.samaar@yahoo.in): exam1 → 0/90 expired; exam2 → ≥1/90 expired, Part1 14/20 answered.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
