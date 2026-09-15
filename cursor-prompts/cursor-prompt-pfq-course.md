# Cursor prompt — PFQ in 2 Days, single paid course

**Rewritten 13 Aug 2026** after Sim collapsed the product to one tier. Replaces the earlier three-tier version of this file. Extends the shipped mock build (`cursor-prompt-pfq-mock.md` — that work stays, don't unpick it).

**Read first:** `PFQ in 2 days/PFQ_COURSE_SPEC.md`. It holds the decisions; this holds the build order.

---

## What changed from the previous prompt

Delete from your mental model: the AI Pro tier, Sly on PFQ, three mocks, the 10-question free taster, and the 50-questions-per-objective figure. **None of those are being built.**

One course, one price, £5, one entitlement. One mock. ~300 practice questions. **No free surface** — the 60-question mock currently public at `/pfq/mock` moves behind payment.

## Not blocked

The previous prompt was blocked on whether the AI Pro bundle spanned PMQ. That tier no longer exists, so nothing here is blocked. Start at Task 1.

## Division of labour, unchanged

Claude authors all lessons, all ~300 questions, all copy and legal wording. Cursor builds. If content looks wrong, flag it — don't rewrite it.

---

## Task 1 — Entitlement and gating

Read `src/lib/pmq/tiers.ts` and follow its shape. Two states only:

- **starter** — the absence of an entitlement row. Marketing pages only.
- **pro** — lessons, practice, mock, coverage map.

Keep starter as an absence, never a stored value: a failed payment write must leave someone unpaid rather than half-provisioned. Every gate derives from one function in one file — do not re-derive tier from a row lookup at the call site.

## Task 2 — Put the existing mock behind the paywall

`/pfq/mock` currently serves 60 questions to anyone, including guests. After this task it requires `pro`. Unauthorised visitors get the pricing page, not a 403.

Guest attempt support (`guest_token`) stays in the schema — it costs nothing and avoids a migration if a free trial ever returns. It is simply unreachable while there is no free surface.

Everything else about the runner — timer, flagging, review filters, per-attempt option shuffle, results — is unchanged.

## Task 3 — Lesson routes

- `/pfq/learn` — the 2-day map: 10 objectives, 59 outcomes, Day 1 / Day 2 split, per-outcome completion state.
- `/pfq/learn/[objective]/[outcome]` — one lesson.
- Content compiles from `PFQ in 2 days/lessons/*.md` at build time, same as the PMQ course content. Never paste lesson text into components.
- Progress via `section_progress`. **Known gotcha:** completion has two signals — timestamps *and* `checklist_state`. A reset must clear both or the pathway still reads complete. See `OPERATIONS.md`.
- Gated at `pro`.

## Task 4 — Practice runner

- `/pfq/practice/[objective]` — practice for one learning objective.
- Draws from the shared bank filtered by objective. **No tier cap** — one tier, everything included.
- Immediate feedback per question with the explanation. Not timed; the mock is the timed artefact.
- Score tracked per **learning outcome**, so practice feeds the same coverage map as the mock.
- Gated at `pro`.

## Task 5 — Coverage map

Single source of truth for "you can currently answer N of 59." Combines practice and mock results per outcome. Reuse the existing `PfqCoverageMap` component; it now needs to accept results from both sources rather than a single attempt.

Outcome labels come from `PFQ in 2 days/pfq-outcome-titles.json`. Do not invent display strings.

## Task 6 — Pricing and payment

- `/pfq/pricing` — one column, £5, the inclusions list from spec §1. No tier comparison table; there is nothing to compare.
- Stripe hosted checkout. Never touch card data.
- At checkout, a **required, unticked** checkbox: the customer consents to immediate access and acknowledges losing the 14-day cancellation right. Without it that right survives the full fortnight even after the course has been fully consumed. Copy from Claude. **Do not ship to production before Sim has had it reviewed.**
- T&Cs and refund policy linked from checkout.
- `PFQ_ATP_DISCLAIMER` and the trademark notice on the pricing page as well as the course.

## Task 7 — Courses card and landing page

- `/pfq` landing: rebuild from Claude's rewritten copy. **Do not ship the current `PFQ_LANDING_COPY.md`** — it is written around a free mock that no longer exists. Wait for the rewrite.
- Courses card (`CoursesCatalog.tsx`): drop "(coming soon)" when lessons are live; primary CTA to `/pfq`, not straight into a timed exam; remove the free-mock CTA; subhead replaced with Claude's wording. The current "Pass Your APM PFQ Exam" is an outcome claim we don't make.

## Removed — do not build

Sly on PFQ. The AI Pro tier. Mocks 2 and 3. The free taster and its `free_sample` flag. If any of these appear in an older doc, this prompt wins.

---

## Acceptance criteria

1. A signed-out visitor can reach `/pfq` and `/pfq/pricing` and nothing else — no lesson, no practice question, no mock.
2. A `pro` user gets 59 lessons, all practice questions, one mock.
3. Revoking an entitlement drops the user to starter cleanly, no orphaned access.
4. Answers and explanations absent from every pre-submission network payload, practice and mock alike. Check the real payload, don't assume.
5. Checkout cannot complete with the consent box unticked.
6. Coverage map reflects practice *and* mock results, not just the last attempt.
7. Bank invariant test still passes: exactly 59 outcomes represented, every question carries a valid `learning_outcome`.
8. `get_advisors` shows no new security warnings.

## Report back

Append to `BUSINESS_STATE.md`: what shipped, what didn't, any deviation and why. Leave Linear at In Review — Claude verifies against repo and live DB before anything moves to Done. State explicitly whether any migration was applied, not just written.
