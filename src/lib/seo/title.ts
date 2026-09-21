/**
 * Single source of truth for page <title> construction.
 *
 * Why this exists: titles were being written by hand with four different
 * separators (em dash, hyphen, colon, pipe). That is inconsistent in search
 * results, and it kept reintroducing em dashes, which are banned in our copy.
 * Build every title through buildTitle() so the separator is defined in exactly
 * one place and nobody has to remember the rule.
 *
 * Usage: buildTitle("Sign in") -> "Sign in | Learn in Curve"
 * Pass the page name only. The brand is appended here, never by hand.
 */

export const SITE_NAME = "Learn in Curve";

/** Page-to-brand separator. Pipe only. Never an em dash or en dash. */
const TITLE_SEPARATOR = "|";

export function buildTitle(page: string): string {
  const trimmed = page.trim();
  if (!trimmed || trimmed === SITE_NAME) return SITE_NAME;
  return `${trimmed} ${TITLE_SEPARATOR} ${SITE_NAME}`;
}
