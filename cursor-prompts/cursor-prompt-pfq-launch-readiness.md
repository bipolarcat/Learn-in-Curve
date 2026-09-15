# Cursor prompt — PFQ launch readiness

**Written 13 Aug 2026.** The last build prompt before PFQ can be sold. Everything here is small; the point is that none of it can be skipped.

## Where things stand, verified against the live database

- `pfq_questions` — 306 rows, 60 mock-eligible, all 59 outcomes covered
- Course row and 10 section rows applied and confirmed
- Practice, mock, coverage and lesson tables all live
- Registry consolidated, prices defined once
- `PFQ_CHECKOUT_ENABLED = false`, correctly, pending solicitor review

There are no unapplied PFQ migrations. If this task creates one, say so explicitly in your report rather than leaving it to be discovered.

---

## Task 1 — Rebuild the `/pfq` landing page

The current page was built before the copy was rewritten. `PFQ in 2 days/PFQ_LANDING_COPY.md` is now final and reflects the paid-only product.

Render it as written. The hero, the seven sections, the footer legal block and the meta tags are all in that file. Do not paraphrase, reorder or shorten. If a section does not fit the layout, report it rather than editing the words.

Two things in that file are deliberate and must survive:

- The hero says the exam "asks 59 questions you can see in advance". That is a claim about the published syllabus, not a claim to hold exam questions. Keep the wording exactly.
- The price section states that the APM exam costs £278.40 separately and that this is not the exam and not a qualification. That paragraph is doing legal work, not marketing work.

## Task 2 — Courses card

In `CoursesCatalog.tsx`, for the `pfq-in-2-days` card:

- Remove "(coming soon)".
- Primary CTA to `/pfq`, not into a timed exam.
- Remove any free-mock CTA. There is no free surface.
- Replace the subhead with, exactly:

> 59 lessons, 306 practice questions and a full mock, mapped to every APM PFQ learning outcome

The old subhead promised to "Pass Your APM PFQ Exam", which is an outcome claim we do not make.

## Task 3 — Gate Trap School

**Decision, 13 Aug 2026: Trap School is part of the paid course.** Gate it behind the same Pro check as lessons and practice. It is not a free sample.

Content is final in `PFQ in 2 days/PFQ_TRAP_SCHOOL.md`. Every figure in it is counted from the published sample paper; do not round, restate or embellish them.

## Task 4 — Remove the hardcoded price

`src/app/(site)/pfq/pricing/page.tsx` line 24 hardcodes "£5" in the meta description while the visible price reads from the registry. That is exactly the drift the registry exists to prevent, and a stale price in a meta description is a misleading-price problem rather than a typo.

Derive it from the registry, or remove the figure from the prose entirely. Then grep the whole repo for other hardcoded course prices in copy and report anything you find rather than fixing silently.

## Task 5 — Verify the purchase email carries the acknowledgement *(legal, do not skip)*

Under the Consumer Contracts Regulations, the buyer loses the 14-day cancellation right only if three things happen: they expressly consent to immediate supply, they acknowledge losing the right, **and they receive confirmation in a durable medium**.

Checkout covers the first two. The third depends on `send-purchase-email.ts` actually sending, and on that email containing the acknowledgement.

Check it. If the email does not carry the acknowledgement, add it. If it is not reliably sent on successful payment, that is a blocker and must be reported as one, not worked around. A consent captured at checkout and never confirmed in writing leaves the customer's full statutory right intact, whatever the Terms say.

## Task 6 — End-to-end pass with checkout in test mode

Locally, with `PFQ_CHECKOUT_ENABLED` true and Stripe test keys, walk the whole journey and report what you observe rather than what should happen:

1. Signed out: `/pfq` and `/pfq/pricing` reachable. Lessons, practice, mock and Trap School all blocked, redirecting to pricing rather than erroring.
2. Test purchase completes; exactly one entitlement row is written; the user lands on `/pfq/learn`.
3. Replay the same Stripe webhook. Nothing changes on the second delivery.
4. Signed in with Pro: open a lesson, answer a practice question, sit part of the mock. Coverage map updates from the measured answers, and lesson checkpoints do not move the headline number.
5. Confirm answers and explanations are absent from every pre-submission network payload, in practice and in the mock. Read the actual response.
6. Purchase email arrives and carries the acknowledgement wording.

Leave `PFQ_CHECKOUT_ENABLED` **false** in anything that reaches production.

---

## Acceptance criteria

1. `/pfq` matches the approved copy, including the footer legal block.
2. No course price appears as a hardcoded literal in any copy string.
3. Trap School requires Pro.
4. The purchase email contains the cancellation acknowledgement, or the gap is reported as a blocker.
5. The end-to-end pass is documented with what actually happened at each step.
6. `PFQ_CHECKOUT_ENABLED` is false on the production path.
7. `get_advisors` clean, or state that the tool was unavailable in your environment so Claude runs it.

## Report back

Append to `BUSINESS_STATE.md`. State plainly: any migration written or applied, whether the purchase email carries the acknowledgement, and anything in the end-to-end pass that did not behave as expected. Leave Linear at In Review.
