# Cursor prompt — LIC-17: fix LO-per-day grouping

Quick, isolated bug fix. Safe to run in parallel with
`cursor-prompt-quiz-content-rerun.md` (different repo/files — this touches
the native app's LO/day grouping logic, not the `PMQ in 5 days/content/*.json`
files).

**Bug:** the day/LO grouping on the new native platform doesn't match the
live `PMQ in 5 days` reference site.

**Fix:**
1. Find the live site's authoritative day→LO grouping. `PMQ in 5 days/`
   content or its rendered pages are the source of truth — each `loN.json`
   has a `day` field; confirm that's what the live site actually groups by
   (spot-check a couple of days against the deployed site if you can reach
   it, or against `content/lo*.json`'s `day` values directly if that's
   simpler and equally authoritative).
2. Find where the native app currently groups LOs by day — likely
   `src/app/courses/pmq-in-5-days/page.tsx` or a data-fetching layer that
   groups `sections` by `day`. Compare its grouping logic/output against the
   source of truth from step 1.
3. Fix the mismatch. Likely candidates: wrong field used for grouping, an
   off-by-one on day numbers, or a hardcoded/stale grouping map instead of
   reading `day` from the section data.
4. Verify: every day on the native course page should show the exact same
   set of LOs, in the same order, as the live site.

## When done

Log to `BUSINESS_STATE.md`, move LIC-17 to **In Review** in Linear.
