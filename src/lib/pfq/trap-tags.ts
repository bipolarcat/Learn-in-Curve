/**
 * Maps pfq_questions.traps[] tag values → PFQ_TRAP_SCHOOL module ids.
 * DB tags and module ids disagree on purpose — do not rename existing rows.
 * Used by the trap backfill script and by inline Drill callouts (parity §3b).
 *
 * Declaration order is the callout priority: near_miss > negative_stem >
 * multi_select. `absolutes` is deliberately absent (category retired 2026-09-05).
 */

export const TRAP_TAG_TO_MODULE = {
  near_miss: "near_miss",
  negative_stem: "negative",
  multi_select: "combination",
} as const;

export type PfqTrapTag = keyof typeof TRAP_TAG_TO_MODULE;

export const PFQ_TRAP_TAGS = Object.keys(TRAP_TAG_TO_MODULE) as PfqTrapTag[];

export function isPfqTrapTag(value: string): value is PfqTrapTag {
  return value in TRAP_TAG_TO_MODULE;
}
