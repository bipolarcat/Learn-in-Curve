# Cursor prompt — PFQ paywall, pricing page and Stripe

**Written 13 Aug 2026.** Third of three PFQ prompts. Runs independently of `cursor-prompt-pfq-content.md`, so it can be built in parallel.

- `cursor-prompt-pfq-mock.md` — shipped
- `cursor-prompt-pfq-content.md` — lesson pipeline and renderer
- **this one** — entitlement, paywall, pricing, payment

**Read first:** `PFQ in 2 days/PFQ_COURSE_SPEC.md` §1 and §5.

---

## Task 1 — Entitlement

Read `src/lib/pmq/tiers.ts` and follow its shape. PFQ has two states only:

- `starter` — the absence of an entitlement row. Marketing pages only.
- `pro` — lessons, practice, mock, coverage map.

`starter` stays an absence, never a stored value. That property is load-bearing: a failed payment write must leave someone unpaid rather than half-provisioned. Every gate calls one function in one file; nothing re-derives tier from its own row lookup.

There is no `ai_pro` on PFQ. Do not add one speculatively.

## Task 2 — Paywall the existing mock

`/pfq/mock` currently serves 60 questions to anyone including guests. It now requires `pro`. Unauthorised visitors get `/pfq/pricing`, not a 403.

Leave `guest_token` in the schema. It costs nothing and avoids a migration if a free trial returns.

## Task 3 — Pricing page

`/pfq/pricing`. One product, one price. No comparison table, because there is nothing to compare against.

Copy, to be used verbatim:

> ### PFQ in 2 Days
> **£5**
>
> Everything you need to pass the APM Project Fundamentals Qualification, and nothing you don't.
>
> - 59 lessons, one for every learning outcome in the APM syllabus
> - Around 300 practice questions, each mapped to the outcome it tests
> - A full 60-question mock exam, timed and formatted like the real one
> - A coverage map that tells you which outcomes you can answer and which you can't
> - Trap School: the question formats that cost people marks
>
> One payment. No subscription. Yours for good.

Below the fold, the honest note:

> The APM exam itself is booked and paid separately with APM, and currently costs £278.40 for non-members. This course prepares you for it. It is not the exam and it is not a qualification.

That paragraph stays. It manages the single most likely support question and it keeps us clear of implying we sell the qualification.

## Task 4 — Checkout

Stripe hosted checkout. Never handle card data.

A **required, unticked** checkbox before payment can complete:

> I want access straight away, and I understand that by starting the course I lose my right to cancel for a refund within 14 days.

Without that checkbox and an explicit tick, the 14-day cancellation right survives the full fortnight even after someone has read every lesson and sat the mock. This is the Consumer Contracts Regulations, not a preference.

**Do not deploy checkout to production until Sim confirms this wording has been reviewed.** Build it, test it against Stripe test keys, leave it behind a flag.

Link T&Cs and the refund policy from the checkout page. If either does not exist yet, the checkout is not ready to ship, and that is Sim's blocker rather than yours — report it, don't work around it.

## Task 5 — Post-purchase

- On successful payment, write the entitlement, then send the user to `/pfq/learn`, not back to the pricing page.
- Send a receipt and an access email. Reuse the Resend pattern already in `src/lib/notify/`.
- The entitlement write must be idempotent. A duplicated webhook must not create two rows or double-charge state.
- If the webhook fails after payment succeeds, the user must still be recoverable — log enough to reconcile manually, and make sure the failure is visible rather than silent.

## Task 6 — Courses card and landing

- `/pfq` landing rebuilt from Claude's rewritten copy. **Do not ship the current `PFQ_LANDING_COPY.md`** — it is written around a free mock that no longer exists. Wait for the rewrite.
- Courses card in `CoursesCatalog.tsx`: primary CTA to `/pfq`, not straight into a timed exam. Drop "(coming soon)" when lessons are live. Remove the free-mock CTA. Subhead replaced with Claude's wording; the current "Pass Your APM PFQ Exam" is an outcome claim we don't make.
- `PFQ_ATP_DISCLAIMER` and the trademark notice on the pricing page as well as the course.

## Do not build

No `ai_pro` tier. No Sly on PFQ. No second or third mock. No free taster and no `free_sample` flag. If an older doc mentions any of these, this prompt wins.

---

## Acceptance criteria

1. A signed-out visitor reaches `/pfq` and `/pfq/pricing` and nothing else. No lesson, no practice question, no mock.
2. Checkout cannot complete with the consent box unticked.
3. A successful test payment writes exactly one entitlement row and lands the user on `/pfq/learn`.
4. Replaying the same Stripe webhook twice leaves the database unchanged after the first.
5. Revoking an entitlement drops the user to starter cleanly, with no orphaned access.
6. No card data touches our servers or our logs.
7. `get_advisors` shows no new security warnings.

## Report back

Append to `BUSINESS_STATE.md`: what shipped, what didn't, any deviation and why. State plainly whether any migration was applied or only written. Leave Linear at In Review for Claude to verify.
