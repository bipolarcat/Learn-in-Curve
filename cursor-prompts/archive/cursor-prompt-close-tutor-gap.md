# Cursor prompt — close the gap between what's shipped and what's publicly promised

**Why now:** Sim's 2026-07-09 LinkedIn post already describes the AI tutor's
weak-area summary and on-demand quiz generation as if they're live. Only the
Q&A chat itself (LIC-42) is actually built. This prompt covers the pieces
needed to make that true, in dependency order. Full context also lives in
Linear (LIC-37, LIC-36, LIC-52, LIC-48) with Status/Decided/Next-action on
each — this file is self-contained either way in case Linear isn't reachable
from this environment.

Build order matters: LIC-37 before LIC-36 (the lock state needs somewhere to
send the user). Everything below reuses `AI_TUTOR_BACKEND_SPEC.md`'s existing
patterns — don't re-architect, extend what's there.

## 1. LIC-37 — Upgrade CTA button (build first)

No CTA exists yet on the dashboard, the PMQ homepage, or inside the AI tutor
chat window. The checkout plumbing already works — `createAiTutorCheckout` in
`src/lib/pmq/actions.ts`, webhook at `src/app/api/stripe/webhook/route.ts`,
Stripe in test mode (`.env.local`), safe to test against freely.

Add the CTA button/component in all three locations, wired to the existing
`createAiTutorCheckout` action. Match the shared `LockedFeature.tsx` visual
language (dashed border, lock icon, reduced opacity) already used elsewhere —
don't invent a fourth "upgrade" visual style.

## 2. LIC-36 — 3 free messages, then lock

Per `AI_TUTOR_BACKEND_SPEC.md` §6 step 1 and §11:

1. In `src/app/api/tutor/chat/route.ts`, count `role='user'` rows in
   `tutor_messages` for this user+course. If the user lacks the `ai_tutor`
   entitlement and the count is already 3, return the locked state instead of
   calling the model.
2. In `AiTutorPanel.tsx`, render the locked state via `LockedFeature.tsx`
   (already built, LIC-53) rather than the ad-hoc 🔒 emoji/dashed-box styling
   currently there — replace, don't duplicate.
3. Locked state's action routes to the LIC-37 CTA.

**Separately, don't conflate with:** the *paid*-tier fair-usage cap in spec
§4 (~£2.50 of model cost, tracked via `input_tokens`/`output_tokens` columns
already on `tutor_messages`). That's a different gate for a different tier —
implement it too if convenient since the columns already exist, but it's not
blocking; free-tier's 3-message cap is the priority.

## 3. LIC-52 — Course-completion summary

Per `AI_TUTOR_BACKEND_SPEC.md` §10, verbatim:

- Trigger server-side when the 24th `section_progress` row for a user+course
  gets its final update (same place LO completion already gets marked, see
  LIC-32's `LoCompleteButton.tsx` flow) — don't poll client-side.
- Aggregate `attempts` for this user+course grouped by `learning_objective`/
  `is_correct` — same weak-area query pattern the regular chat already uses
  for one LO (spec §6 step 2), just run across all 24.
- Generate one message via the existing `callTutorModel` abstraction, insert
  as a normal `role: 'assistant'` row in `tutor_messages` — it just shows up
  in the persistent chat history, no new UI surface needed.
- **Paid-only**, same `feature_entitlements` gate as the rest of the tutor —
  free users who finish all 24 LOs see this locked (`LockedFeature`), not
  delivered free.
- Counts toward the §4 fair-usage cap like any other message.

## 4. LIC-48 — quick verification, no dependencies, do anytime

Open a live PMQ LO page and the course overview page. Confirm the "Not
affiliated with APM" text is actually visible somewhere on both — it was
confirmed present via `src/app/courses/layout.tsx` back on 2026-07-06, but
the LO header rework since then (LIC-33, LIC-15, Wave 2/3) may have dropped
it. If it's gone, add it back — this is a compliance item Sim's legal
checklist is blocked on, not cosmetic. Takes 5 minutes either way.

## Not in this prompt

- **LIC-22** (on-demand quiz generation) needs a content-generation decision
  first (pre-generating 30-question banks per LO, grounded in the Delegate
  Pack PDF, same pipeline as LIC-28's `scripts/rebuild-pmq-lo-quiz.mjs`) —
  bigger scope, separate prompt once Sim/Claude has sorted the content side.
- **LIC-39/LIC-40** (mock exam tiering, Real Mock Exam) — separate feature
  area, High not Urgent priority, pick up after the above.

## When done

If Linear is reachable from this environment, update LIC-37/36/52/48
directly (status, and note what was actually built vs. spec). If not,
report back per-ticket so Claude/Sim can sync Linear — don't leave it as
something only this session remembers. Log a summary to `BUSINESS_STATE.md`
either way, per the project's usual convention.
