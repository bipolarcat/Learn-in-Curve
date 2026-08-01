/**
 * Public site version (footer). Launch is **2.0**.
 *
 * Bump rules (see `scripts/bump-version.mjs` + git pre-commit):
 * - After `SITE_VERSION_AUTO_BUMP` is true, each commit increments the
 *   minor by 1 → 2.1, 2.2, … 2.10 (never float-add: 2.9 + 0.1 ≠ 3.0).
 * - Milestone jumps (3.0, 4.0, …) only when Sim asks — run
 *   `LIC_VERSION=3.0` on the commit, or `npm run version:set -- 3.0`.
 * - Skip a bump: `LIC_SKIP_VERSION=1` on the commit.
 */
export const SITE_VERSION = "2.19";

/** Flip to false to show the version but pause auto-bumps. */
export const SITE_VERSION_AUTO_BUMP = true;
