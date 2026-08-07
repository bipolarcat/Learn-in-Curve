/**
 * One-off backfill: re-score abandoned mock sessions that never got finalized_at
 * (pre-expired-status bug). Uses the same expireSession path as runtime.
 *
 * ONLY run after Tasks 1–5 are deployed and the `expired` migration is applied.
 *
 * First run (scoped):
 *   node scripts/backfill-abandoned-mock-scores.mjs --email sim.samaar@yahoo.in
 *
 * Dry run:
 *   node scripts/backfill-abandoned-mock-scores.mjs --email sim.samaar@yahoo.in --dry-run
 *
 * Widen later (all users with abandoned + null finalized_at):
 *   node scripts/backfill-abandoned-mock-scores.mjs --all
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

// Dynamic import of compiled-ish TS via tsx isn't available; reimplement the
// score + write using the same SQL shape as expireSession by loading the
// Next-built domain through a thin duplicate of the scoring contract.
// Prefer calling expireSession from a tsx runner when available.
async function loadExpireSession() {
  try {
    // When run under `npx tsx`, this resolves.
    const mod = await import("../src/lib/pmq/mock-terminate.ts");
    return mod.expireSession;
  } catch {
    return null;
  }
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

async function main() {
  const expireSession = await loadExpireSession();
  if (!expireSession) {
    console.error(
      "Could not import expireSession. Run with: npx tsx scripts/backfill-abandoned-mock-scores.mjs ...",
    );
    process.exit(1);
  }

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

  for (const session of sessions) {
    const clockExpired =
      (session.break_ends_at &&
        session.submitted_at &&
        new Date(session.submitted_at) > new Date(session.break_ends_at)) ||
      (session.deadline_at &&
        session.submitted_at &&
        new Date(session.submitted_at) > new Date(session.deadline_at));

    const terminalStatus = clockExpired ? "expired" : "abandoned";
    console.log(
      `\n${session.id} exam_set=${session.exam_set} → ${terminalStatus}` +
        (dryRun ? " (dry-run)" : ""),
    );

    if (dryRun) continue;

    // Session is already abandoned — expireSession gates on fromStatuses.
    // Flip briefly is unsafe; instead force-update status back to a writable
    // open status only for the update filter by including 'abandoned'.
    const updated = await expireSession(
      supabase,
      session.user_id,
      PMQ_COURSE_ID,
      session,
      ["abandoned"],
      terminalStatus,
    );

    console.log(
      `  total_score=${updated.total_score} max_score=${updated.max_score} passed=${updated.passed} status=${updated.status} finalized_at=${updated.finalized_at}`,
    );
  }

  console.log("\nDone. Verify certificates were NOT created for these sessions.");
  console.log(
    "Expected (sim.samaar@yahoo.in): exam1 → 0/90 expired; exam2 → ≥1/90 expired, Part1 14/20 answered.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
