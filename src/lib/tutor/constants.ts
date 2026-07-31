/** Free-tier cap for users without ai_tutor entitlement (LIC-36). */
export const FREE_TIER_MESSAGE_CAP = 3;

/** Homepage guest trial: live Sly messages per hashed IP (unsigned visitors). */
export const GUEST_TIER_MESSAGE_CAP = 3;

/** Max user message length for the guest trial (shorter than signed-in). */
export const GUEST_MESSAGE_MAX_LENGTH = 1000;

/** Prior turns (+ current) sent to Gemini for guest chat. */
export const GUEST_CONTEXT_MESSAGE_LIMIT = 6;

/**
 * Global guardrail: total Gemini spend across ALL guest trial users, ever,
 * in GBP pence. Separate from GUEST_TIER_MESSAGE_CAP (that's per-visitor).
 * Resets only via explicit manual instruction — see the migration comment
 * in supabase/migrations/20260717140000_guest_tutor_budget.sql. Kept here
 * as the default seeded into the DB row; the DB value is the source of
 * truth once seeded (change via SQL, not just this constant).
 */
export const GUEST_TUTOR_BUDGET_CAP_GBP_CENTS = 300; // £3.00

/** Gemini 3 Flash pricing (USD per million tokens) — AI_TUTOR_BACKEND_SPEC.md §3. */
export const TUTOR_INPUT_USD_PER_M = 0.5;
export const TUTOR_OUTPUT_USD_PER_M = 3.0;

/**
 * Fixed USD per GBP for converting model spend into fair-usage GBP.
 * Conservative (slightly high USD) so budget burns a touch faster than mid-market FX.
 */
export const USD_PER_GBP = 1.27;

/** One-off unlock: £8.00 → £5.00 fair-usage credit. */
export const SLY_UNLOCK_PRICE_CENTS = 800;
export const SLY_UNLOCK_CREDIT_GBP_CENTS = 500;

/**
 * Flat Gemini grading budget for the free Starter mock exam (Exam 1), in GBP
 * pence. Separate from Pro's Sly/grading credit — Starter users have no
 * entitlement and no purchase, so this is a hard, session-scoped cap rather
 * than a fair-usage share. Set 2026-07-28: estimated real cost is ~15-40p per
 * user for one full grading pass (15 written questions); 50p leaves headroom.
 * A user can only ever claim one session per exam_set, so this is a one-time
 * cost per free signup, not a recurring one.
 */
export const STARTER_MOCK_GRADING_BUDGET_GBP_CENTS = 50;

/**
 * Per-session AI grading budget for a PAID mock paper (Pro / AI Pro), in GBP
 * pence. Set 2026-07-30 when the fair-usage credit ledger was removed for
 * grading: grading is now a flat operating cost priced into the tier, so the
 * cap is structural rather than accounted. A tier unlocks a fixed number of
 * papers (Pro 3, AI Pro 4) and each paper gets one budget, so worst-case Pro
 * exposure is ~3 × 50p against an £8 price. Same 50p as Starter — the grading
 * pass is identical work, roughly 15-40p in practice.
 */
export const PAID_MOCK_GRADING_BUDGET_GBP_CENTS = 50;

/** Top-ups: 70% of payment credited to fair-usage; 30% platform fee. */
export const SLY_TOPUP_CREDIT_RATE = 0.7;
export const SLY_TOPUP_MIN_CENTS = 100;
export const SLY_TOPUP_PRESETS_CENTS = [100, 200, 500] as const;

/** @deprecated Prefer credit ledger; kept as legacy fallback label only. */
export const PAID_FAIR_USAGE_BUDGET_USD = 3.15;

/** Sentinel learning_objective for the one-time course-completion summary (§10). */
export const COURSE_COMPLETION_LO = "__course_completion__";

/** Default model — override via GEMINI_MODEL env var (spec: Gemini 3 Flash). */
export const DEFAULT_TUTOR_MODEL = "gemini-3-flash-preview";

/** Max prior turns (+ current user message) sent to Gemini — keeps latency bounded. */
export const TUTOR_CONTEXT_MESSAGE_LIMIT = 20;

export function topUpCreditGbpCents(grossGbpCents: number): number {
  return Math.floor(grossGbpCents * SLY_TOPUP_CREDIT_RATE);
}
