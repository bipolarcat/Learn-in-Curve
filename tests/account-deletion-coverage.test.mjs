/**
 * Guard for LIC account deletion (UK GDPR Art. 17).
 *
 * There are no foreign keys from public tables to auth.users, so nothing
 * cascades: every table holding a user_id must be deleted explicitly in
 * src/lib/account/delete-account.ts. If someone adds a user-keyed table and
 * forgets that file, deletion silently leaves personal data behind. This test
 * pins the known set so the omission shows up as a failing build, not as a
 * data-protection incident.
 *
 * When a new user-keyed table is added: add it to USER_ID_TABLES in
 * delete-account.ts AND to EXPECTED_USER_ID_TABLES here, in the same commit.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const action = readFileSync(
  join(root, "src/lib/account/delete-account.ts"),
  "utf8",
);
const source = readFileSync(
  join(root, "src/lib/account/deletion-scope.ts"),
  "utf8",
);

const EXPECTED_USER_ID_TABLES = [
  "attempts",
  "certificates",
  "course_completion_reports",
  "entitlements",
  "exam_question_flags",
  "exam_sessions",
  "feature_entitlements",
  "pfq_attempts",
  "pfq_coverage_signals",
  "pfq_practice_sessions",
  "profiles",
  "section_progress",
  "tutor_deadline_nudges",
  "tutor_messages",
  "tutor_spaced_reviews",
  "tutor_usage_credits",
  "user_course_stats",
];

const EXPECTED_EMAIL_TABLES = [
  "leads",
  "newsletter_subscribers",
  "survey_invites",
  "waitlist_signups",
];

function listBetween(startMarker) {
  const start = source.indexOf(startMarker);
  assert.notEqual(start, -1, `${startMarker} not found`);
  const end = source.indexOf("] as const;", start);
  assert.notEqual(end, -1, `end of ${startMarker} not found`);
  return [...source.slice(start, end).matchAll(/"([a-z_]+)"/g)].map((m) => m[1]);
}

test("every user-keyed table is deleted on account deletion", () => {
  const listed = listBetween("export const USER_ID_TABLES");
  assert.deepEqual([...listed].sort(), [...EXPECTED_USER_ID_TABLES].sort());
  assert.equal(new Set(listed).size, listed.length, "duplicate table listed");
});

test("email-keyed marketing tables are deleted on account deletion", () => {
  const listed = listBetween("export const EMAIL_TABLES");
  assert.deepEqual([...listed].sort(), [...EXPECTED_EMAIL_TABLES].sort());
});

test("deletion removes the auth user, not just the app rows", () => {
  assert.match(action, /auth\.admin\.deleteUser\(userId\)/);
});

test("deletion requires the typed confirmation phrase", () => {
  assert.match(source, /DELETE_CONFIRMATION_PHRASE = "DELETE"/);
  assert.match(action, /confirmation\.trim\(\)\.toUpperCase\(\) !==/);
});
