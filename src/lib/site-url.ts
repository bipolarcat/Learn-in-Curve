/**
 * Canonical public origin, safe to use from CLIENT components.
 *
 * Why this exists (LIC-120): auth redirect targets were built from
 * `window.location.origin`. That is technically "correct" — it is the real
 * browser origin — but it is the WRONG origin whenever the user happens to be
 * on the apex domain.
 *
 * `https://learnincurve.com/` redirects to `https://www.learnincurve.com/`, but
 * that redirect strips the path: `https://learnincurve.com/auth/callback`
 * returns a bare "Not Found" and never reaches the app. So a user who signed up
 * on the apex got a confirmation email whose link pointed at the apex, clicked
 * it, and landed on a dead page. That is the "random page" bug.
 *
 * Fixing the apex redirect to preserve paths is still worth doing (LIC-117),
 * but it lives in DNS/host config outside this repo. This helper removes the
 * dependency entirely: every auth URL we hand to Supabase is built from the one
 * canonical origin, regardless of which hostname the user arrived on.
 *
 * Server-side equivalent is `getSiteOrigin(request)` in src/lib/site-origin.ts.
 * They must agree — both read NEXT_PUBLIC_SITE_URL first.
 *
 * NEXT_PUBLIC_SITE_URL must be set in the deployed environment to
 * `https://www.learnincurve.com` (no trailing slash). If it is missing we fall
 * back to `window.location.origin`, which restores the old broken-on-apex
 * behaviour rather than crashing — a misconfigured env var should degrade, not
 * take sign-up down.
 */
const CONFIGURED_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(
  /\/+$/,
  "",
);

export function getCanonicalOrigin(): string {
  if (CONFIGURED_ORIGIN) return CONFIGURED_ORIGIN;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

/** True when NEXT_PUBLIC_SITE_URL is configured. Used by the dev-time warning. */
export function hasCanonicalOrigin(): boolean {
  return Boolean(CONFIGURED_ORIGIN);
}
