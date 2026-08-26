/**
 * Public site version (footer). Launch is **2.0**.
 *
 * This number tracks PRODUCTION DEPLOYS, not commits. It is bumped in exactly
 * one place: `npm run deploy` (`scripts/deploy.mjs`), which bumps, commits and
 * pushes `master` — and pushing `master` is what makes Railway deploy. So the
 * value below is always the version that is actually live.
 *
 * - Normal deploy: `npm run deploy` → minor + 1 (2.43 → 2.44 → … → 2.50;
 *   never float-add, 2.9 + 0.1 ≠ 3.0).
 * - Milestone jump: `npm run deploy -- --set 3.0`.
 * - Deploy without bumping: set `SITE_VERSION_AUTO_BUMP` to false below.
 *
 * Ordinary commits never touch this file. The git pre-commit hook only
 * enforces legal "Last updated:" dates.
 */
export const SITE_VERSION = "2.43";

/** Flip to false to show the version but pause deploy-time bumps. */
export const SITE_VERSION_AUTO_BUMP = true;
