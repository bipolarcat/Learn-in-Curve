/**
 * User-facing copy for auth failures that arrive as a `?error=` query param.
 *
 * Why this exists (LIC-120): `/auth/callback` already redirected to
 * `/auth/sign-in?error=oauth` when a code exchange failed — but the sign-in page
 * ignored the param entirely. The user clicked "Confirm your email", landed on a
 * form that cheerfully said "Welcome back", and had no idea anything had gone
 * wrong. A silent failure is a bug you find from a customer instead of a log.
 *
 * Keys are deliberately coarse and non-specific: they end up in a URL the user
 * can see and edit, so they must not leak whether an address exists, whether a
 * token was valid, or anything else that would help enumerate accounts.
 */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth: "We couldn't finish signing you in. Please try again.",
  confirm:
    "That confirmation link didn't work — it may have expired or already been used. Sign in below, or sign up again to get a new one.",
  expired:
    "That link has expired. Sign up again and we'll send you a fresh one.",
};

/**
 * Maps a raw `?error=` value to display copy. Unknown values return null so a
 * user pasting `?error=<anything>` can't inject arbitrary text into the page.
 */
export function getAuthErrorMessage(
  value: string | string[] | null | undefined,
): string | null {
  if (typeof value !== "string") return null;
  return AUTH_ERROR_MESSAGES[value] ?? null;
}
