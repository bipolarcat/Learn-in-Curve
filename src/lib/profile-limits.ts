/**
 * Field limits and normalisation for the user profile.
 *
 * Single source of truth for three layers that must agree: the form's
 * `maxLength`, the server action's validation, and the CHECK constraints in
 * 20260730180000_profile_field_limits.sql. Client-side `maxLength` alone is
 * decoration — `saveUserProfile` is a server action and is directly callable,
 * so an unbounded field was accepting arbitrarily large input straight into
 * Postgres. The DB constraint is the real backstop; these are the friendly
 * layers in front of it.
 *
 * Limits are generous on purpose. They exist to stop abuse and layout breakage
 * (the first name renders in site chrome via `getDisplayFirstName`), not to
 * second-guess unusual real names, job titles or company names — which are far
 * longer and stranger than most forms assume.
 */

export const PROFILE_LIMITS = {
  first_name: 80,
  last_name: 80,
  profession: 120,
  company: 120,
  study_goal: 200,
} as const;

export type ProfileTextField = keyof typeof PROFILE_LIMITS;

export const PROFILE_AGE_MIN = 13; // UK age of digital consent (ICO)
export const PROFILE_AGE_MAX = 120;

/**
 * Collapses internal whitespace and trims. Returns null for empty.
 *
 * Normalising matters beyond tidiness: "Project  Manager" and "project manager "
 * are the same answer, and storing them differently makes any future grouping
 * or segmentation quietly wrong.
 */
export function normalizeProfileText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const collapsed = value.replace(/\s+/g, " ").trim();
  return collapsed.length > 0 ? collapsed : null;
}

/**
 * Normalises then enforces the field's limit.
 * Returns `"too_long"` rather than silently truncating — quietly cutting
 * someone's name in half is worse than telling them.
 */
export function normalizeProfileField(
  field: ProfileTextField,
  value: unknown,
): string | null | "too_long" {
  const normalized = normalizeProfileText(value);
  if (normalized === null) return null;
  return normalized.length > PROFILE_LIMITS[field] ? "too_long" : normalized;
}

const FIELD_LABELS: Record<ProfileTextField, string> = {
  first_name: "First name",
  last_name: "Last name",
  profession: "Profession",
  company: "Company",
  study_goal: "Study goal",
};

export function tooLongMessage(field: ProfileTextField): string {
  return `${FIELD_LABELS[field]} must be ${PROFILE_LIMITS[field]} characters or fewer.`;
}
