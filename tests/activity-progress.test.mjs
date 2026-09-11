/**
 * LIC-150 — recall activity persistence helpers + migration contract.
 * DB integration tests run only when ACTIVITY_PROGRESS_TEST_URL is set
 * (never against the production project in .env.local).
 */
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import {
  activityContentHash,
  canonicalizeForHash,
} from "../src/lib/pmq/activity-content-hash.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const migrationPath = join(
  root,
  "supabase/migrations/20260911170000_activity_progress.sql",
);

const sampleActivity = {
  id: "lo2-lineup-sponsor-phases",
  type: "lineup",
  heading: "Sponsor versus project manager, across the life cycle",
  title: "Put the phases back in order",
  items: ["Before / concept", "Definition", "Deployment", "Transition", "After"],
};

test("canonicalize sorts object keys recursively", () => {
  const raw = { b: 1, a: { z: 2, m: 3 } };
  assert.deepEqual(canonicalizeForHash(raw), {
    a: { m: 3, z: 2 },
    b: 1,
  });
});

test("activityContentHash is stable SHA-256 of canonical JSON", () => {
  const a = activityContentHash(sampleActivity);
  const b = activityContentHash({
    title: sampleActivity.title,
    type: sampleActivity.type,
    items: sampleActivity.items,
    id: sampleActivity.id,
    heading: sampleActivity.heading,
  });
  assert.equal(a, b);
  assert.equal(a.length, 64);
  const expected = createHash("sha256")
    .update(JSON.stringify(canonicalizeForHash(sampleActivity)))
    .digest("hex");
  assert.equal(a, expected);
});

test("migration defines tables, RLS select-only, and three RPCs", () => {
  const sql = readFileSync(migrationPath, "utf8");
  for (const table of [
    "activity_attempts",
    "activity_wrong_turns",
    "activity_progress",
  ]) {
    assert.match(sql, new RegExp(`create table if not exists public\\.${table}`));
    assert.match(sql, new RegExp(`${table}_select_own`));
  }
  assert.match(sql, /grant select on public\.activity_attempts to authenticated/);
  assert.match(sql, /revoke all on public\.activity_attempts from anon, authenticated/);
  assert.match(sql, /create or replace function public\.start_activity_attempt/);
  assert.match(sql, /create or replace function public\.record_activity_wrong_turn/);
  assert.match(sql, /create or replace function public\.finish_activity_attempt/);
  assert.match(sql, /security definer/);
  assert.match(sql, /ended_at is not null then\s+return/s);
  assert.match(sql, /for update/);
});

test("lifetime counter model: session baselines add across opens", () => {
  // Pure model of the UI: display = lifetime from start + session wrongs,
  // and start returns the cumulative total after prior sessions.
  let lifetime = 0;
  function openSession() {
    return { baseline: lifetime, session: 0 };
  }
  function wrong(session) {
    session.session += 1;
    lifetime += 1;
    return session.baseline + session.session;
  }

  const first = openSession();
  assert.equal(wrong(first), 1);
  const second = openSession();
  assert.equal(wrong(second), 2);
  assert.equal(wrong(second), 3);
  assert.equal(lifetime, 3);
});

const testUrl = process.env.ACTIVITY_PROGRESS_TEST_URL;
const testServiceKey = process.env.ACTIVITY_PROGRESS_TEST_SERVICE_KEY;
const testAnonKey = process.env.ACTIVITY_PROGRESS_TEST_ANON_KEY;
const hasDb =
  Boolean(testUrl && testServiceKey && testAnonKey) &&
  !String(testUrl).includes("dbjoimidfbftammchnql");

test(
  "DB: counter persists across two opens; concurrent wrongs both count; finish is idempotent; RLS blocks foreign reads and client inserts",
  { skip: !hasDb },
  async () => {
    const admin = createClient(testUrl, testServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const emailA = `activity-a-${randomUUID()}@example.com`;
    const emailB = `activity-b-${randomUUID()}@example.com`;
    const password = `Test-${randomUUID()}!`;

    const userA = await admin.auth.admin.createUser({
      email: emailA,
      password,
      email_confirm: true,
    });
    const userB = await admin.auth.admin.createUser({
      email: emailB,
      password,
      email_confirm: true,
    });
    assert.ok(userA.data.user?.id);
    assert.ok(userB.data.user?.id);

    // Grant Pro so server actions would pass; RPCs only need auth.uid().
    await admin.from("feature_entitlements").upsert({
      user_id: userA.data.user.id,
      course_id: process.env.ACTIVITY_PROGRESS_TEST_COURSE_ID,
      feature: "pro",
      status: "active",
    });

    const clientA = createClient(testUrl, testAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const clientB = createClient(testUrl, testAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    await clientA.auth.signInWithPassword({ email: emailA, password });
    await clientB.auth.signInWithPassword({ email: emailB, password });

    const activityId = `test-lineup-${randomUUID()}`;
    const hash = activityContentHash({
      ...sampleActivity,
      id: activityId,
    });

    const start1 = await clientA.rpc("start_activity_attempt", {
      p_activity_id: activityId,
      p_activity_type: "lineup",
      p_course_id: process.env.ACTIVITY_PROGRESS_TEST_COURSE_ID ?? null,
      p_lo_number: 2,
      p_heading: "test",
      p_content_hash: hash,
      p_input_mode: "drag",
      p_device: "desktop",
    });
    assert.equal(start1.error, null, start1.error?.message);
    const attempt1 = start1.data[0];
    assert.equal(attempt1.total_wrong_turns, 0);

    await clientA.rpc("record_activity_wrong_turn", {
      p_attempt_id: attempt1.attempt_id,
      p_item: null,
      p_chosen: "a | b",
      p_expected: "a | b | c",
      p_detail: { submitted: ["a", "b"], wrong_positions: [0] },
      p_ms_since_start: 100,
    });
    await clientA.rpc("finish_activity_attempt", {
      p_attempt_id: attempt1.attempt_id,
      p_outcome: "abandoned",
      p_moves: 1,
      p_duration_ms: 200,
    });

    const start2 = await clientA.rpc("start_activity_attempt", {
      p_activity_id: activityId,
      p_activity_type: "lineup",
      p_course_id: process.env.ACTIVITY_PROGRESS_TEST_COURSE_ID ?? null,
      p_lo_number: 2,
      p_heading: "test",
      p_content_hash: hash,
      p_input_mode: "drag",
      p_device: "desktop",
    });
    assert.equal(start2.error, null, start2.error?.message);
    assert.equal(start2.data[0].total_wrong_turns, 1);
    const attempt2 = start2.data[0].attempt_id;

    const [r1, r2] = await Promise.all([
      clientA.rpc("record_activity_wrong_turn", {
        p_attempt_id: attempt2,
        p_item: null,
        p_chosen: "x",
        p_expected: "y",
        p_detail: null,
        p_ms_since_start: 10,
      }),
      clientA.rpc("record_activity_wrong_turn", {
        p_attempt_id: attempt2,
        p_item: null,
        p_chosen: "x2",
        p_expected: "y",
        p_detail: null,
        p_ms_since_start: 20,
      }),
    ]);
    assert.equal(r1.error, null, r1.error?.message);
    assert.equal(r2.error, null, r2.error?.message);
    const totals = [r1.data, r2.data].map(Number).sort((a, b) => a - b);
    assert.deepEqual(totals, [2, 3]);

    await clientA.rpc("finish_activity_attempt", {
      p_attempt_id: attempt2,
      p_outcome: "completed",
      p_moves: 3,
      p_duration_ms: 500,
    });
    const finishAgain = await clientA.rpc("finish_activity_attempt", {
      p_attempt_id: attempt2,
      p_outcome: "abandoned",
      p_moves: 99,
      p_duration_ms: 1,
    });
    assert.equal(finishAgain.error, null, finishAgain.error?.message);
    const { data: attemptRow } = await clientA
      .from("activity_attempts")
      .select("outcome, moves")
      .eq("id", attempt2)
      .single();
    assert.equal(attemptRow.outcome, "completed");
    assert.equal(attemptRow.moves, 3);

    const foreignRead = await clientB
      .from("activity_progress")
      .select("*")
      .eq("activity_id", activityId);
    assert.equal(foreignRead.error, null);
    assert.equal(foreignRead.data?.length ?? 0, 0);

    const directInsert = await clientA.from("activity_wrong_turns").insert({
      attempt_id: attempt2,
      user_id: userA.data.user.id,
      activity_id: activityId,
      activity_type: "lineup",
      turn_index: 99,
    });
    assert.ok(directInsert.error, "direct client insert must be rejected");

    await admin.auth.admin.deleteUser(userA.data.user.id);
    await admin.auth.admin.deleteUser(userB.data.user.id);
  },
);
