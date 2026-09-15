/**
 * What account deletion covers. Plain module, not a server-action file: a
 * "use server" module may only export async functions, so the constants and
 * types live here and `delete-account.ts` imports them.
 *
 * There are NO foreign keys from public tables to auth.users in this project,
 * so nothing cascades. Deleting the auth user alone would leave every row below
 * orphaned and still keyed by user_id. Every user-keyed table must be listed
 * here by hand, and tests/account-deletion-coverage.test.mjs fails if the
 * schema gains one that is not.
 */

/** Tables keyed by auth user id. Order is not significant (no FKs). */
export const USER_ID_TABLES = [
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
] as const;

/** Tables keyed by email address rather than user id. */
export const EMAIL_TABLES = [
  "leads",
  "newsletter_subscribers",
  "survey_invites",
  "waitlist_signups",
] as const;

/** The word the user must type. Kept here so the UI and the check agree. */
export const DELETE_CONFIRMATION_PHRASE = "DELETE";

export type DeleteAccountResult = { ok: true } | { ok: false; error: string };
