/**
 * Single source of truth for short legal strings that must appear in the UI.
 *
 * These live in their own module — not inline in a component — because the APM
 * disclaimer has now been silently deleted twice by unrelated redesign passes
 * (see Linear LIC-48). A named export can be imported by a test, so a third
 * removal fails CI instead of shipping.
 *
 * If you change wording here, change the corresponding clause in
 * `legal/TERMS_OF_SERVICE.md` in the same commit. A footer that contradicts the
 * published Terms is worse than no footer line at all.
 */

/**
 * Affiliation disclaimer. Must stay consistent with
 * `legal/TERMS_OF_SERVICE.md` §2 ("What the service is").
 *
 * "APM" and "PMQ" are the Association for Project Management's trade marks. We
 * market revision material aimed at their published syllabus and charge for
 * part of it, so an unambiguous, *visible* disclaimer — not one buried in the
 * Terms — is what keeps this the right side of implied endorsement.
 */
export const APM_DISCLAIMER =
  "Not affiliated with, endorsed by, or acting on behalf of APM (the Association for Project Management). Revision material is our own, aimed at their published syllabus — not official APM content.";

/** Shorter variant for tight chrome where the full sentence won't fit. */
export const APM_DISCLAIMER_SHORT =
  "Not affiliated with or endorsed by APM.";

/**
 * Learn hub wording (Growth Pass 2). Slightly different from `APM_DISCLAIMER`
 * ("accredited by") — keep both; Terms §2 remains the legal source of truth
 * for the site-wide footer string.
 */
export const LEARN_HUB_APM_DISCLAIMER =
  "Learn in Curve is not affiliated with, endorsed by, or accredited by the Association for Project Management.";

