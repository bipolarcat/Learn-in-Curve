# Cursor: PFQ in 2 Days, 3-tier commerce + pricing page

**Ticket:** LIC-157 (PFQ pricing page) / LIC-166 (purchase UX)
**Branch:** `wip-2026-08-19`
**Backend status:** DONE by Claude 2026-09-15. `npx tsc --noEmit` clean, all 28 build tests pass. Do not redo it. Your job is Stripe objects + UI.

---

## The ladder (decided by Sim 2026-09-15)

|                    | Free            | Pro (£10)     | AI Pro (£20) |
|--------------------|-----------------|---------------|--------------|
| Lesson scaffolding | all 10 LOs      | all 10        | all 10       |
| Lesson insights    | **LO1 only**    | all 10        | all 10       |
| Practice questions | 50 (set 1)      | 565 (all sets)| all          |
| Timed mock papers  | **none**        | all 3         | all 3        |
| Coverage map       | no              | yes           | yes          |
| Sly AI tutor       | no              | no            | yes          |
| End-of-course report | no            | no            | yes          |

"Insights" is the learner-facing name for the lesson body, stored as
`body_markdown`. **The field is NOT renamed.** PMQ shares the key and the
renderer; renaming would be a 34-file content migration on a live course.
Insights is the word on the page, `body_markdown` is the word in code.

AI Pro is **£20, waitlist only, no checkout**. A Pro holder upgrades later for
**£10**, so Pro + upgrade equals AI Pro exactly and there is no two-step
arbitrage. Neither price is charged anywhere yet.

VAT: prices are **inclusive**, Stripe Tax **off**.

---

## What is already built (do not rewrite)

- `src/lib/pfq/tiers.ts` — `starter | pro | ai_pro`, every gate. **This file is
  the enforcement.** Any card claim you write must be backed by a function here,
  and no gate may be more generous than the claim.
  New gates: `canAccessPfqInsights(tier, objectiveNumber)`,
  `canAccessPfqCoverageMap`, `canAccessPfqTutor`,
  `canAccessPfqCompletionReport`.
- `src/lib/courses/registry-data.ts` — PFQ `priceCents: 1000`, plus
  `aiProPriceCents: 2000`, `aiProUpgradePriceCents: 1000`, and null Stripe price
  id slots. **All prices derive from here.** Never write a price literal in a
  component.
- `src/lib/pfq/plans.ts` — 3 plan cards with verified counts and derived prices.
- `src/lib/pfq/redact-insights.ts` — strips `body_markdown` server-side for
  locked objectives. Already wired into the objective page.
- `src/lib/pfq/checkout.ts` — prefers a fixed Stripe Price id, falls back to
  inline `price_data`. Blocks anyone already at Pro or above.
- `src/app/api/stripe/webhook/route.ts` — PFQ path now accepts `pro` and
  `ai_pro` via `isPfqPaidTier`.
- `PFQ_CHECKOUT_ENABLED = true` in `src/lib/pfq/constants.ts`. PFQ takes real
  money on the next deploy.
- `legal/TERMS_OF_SERVICE.md` Schedule and `legal/PRE_LAUNCH_CHECKLIST.md`
  updated the same day.

---

## Task 1: Stripe objects (do this first)

1. Create a Stripe **Product** "PFQ in 2 Days" if one does not exist.
2. Create a **Price**: GBP, one-off, **1000** minor units. Create it in BOTH
   test and live mode.
3. Put the live Price id in `COURSE_STATIC["pfq-in-2-days"].stripePriceId` in
   `src/lib/courses/registry-data.ts`.
4. Do **not** create AI Pro prices. There is no AI Pro checkout, and creating
   an unused live Price invites someone wiring it up before the £10 upgrade path
   exists, which would charge a Pro holder the full £20.
5. Confirm the webhook endpoint is registered for `checkout.session.completed`
   in both modes, and that `STRIPE_WEBHOOK_SECRET` matches per environment.

**Verify before moving on:** run a test-mode purchase end to end and confirm
(a) a `feature_entitlements` row appears with `feature = 'pro'`,
`source = 'purchase'` and a non-null `stripe_payment_id`; (b) the purchase email
sends; (c) `purchase_completed` appears in PostHog. **(c) has never once fired
in production despite three real purchases**, so treat a missing event as a real
defect, not a flake, and report it rather than swallowing it.

## Task 2: Pricing page, 3 cards

`src/app/courses/pfq-in-2-days/pricing/page.tsx` +
`src/components/pfq/PfqPlanCards.tsx`.

- Model it on the PMQ pricing page (`src/components/pmq/PmqPlanCards.tsx` and
  its CSS module, already shared).
- Three cards from `PFQ_PLANS`: Free, Pro, AI Pro.
- Free card: price renders as the word "Free", not "£0". The null handling is
  already in place, keep it.
- Pro: `PfqCheckoutButton`, existing intent round trip (`?intent=pro`) works.
- AI Pro: `JoinWaitlistButton` with `PFQ_AI_PRO_NOTIFY_KEY`, "Launching soon"
  badge, no checkout. Show the £10 upgrade note from `priceNote`.
- `inheritsFrom` renders "Everything in {plan}, plus …" exactly as PMQ does.

**Copy constraint, not a style note:** the free tier must not be described as
including "the learning material" or "the lessons" without qualification. The
teaching text is locked on 9 of 10 objectives. Say what is actually free:
takeaways, definitions, misconceptions, memory aids, 50 practice questions, and
objective 1 in full. Overstating a free tier is a misleading action under the
Consumer Protection from Unfair Trading Regulations, and the same applies to the
counts: 565 practice questions and 3 mock papers are verified against production
as of 2026-09-15, so do not round them up.

## Task 3: Locked states in the product

- **Insights:** `PfqObjectiveLessonView` takes `insightsLocked`. There is a
  plain placeholder there now. Replace it with the designed upsell. The body
  text is genuinely absent from the payload, so there is nothing to blur or
  truncate: design for absence, not for a fade-out.
- **Practice:** sets 2+ locked for starters via `canAccessPfqQuizSet`. Locked
  set should read as "part of Pro", never as an error.
- **Mock:** all 3 papers locked for starters. `/mock` already redirects through
  `requirePfqProOrRedirect`. A starter arriving from the objective page should
  land somewhere that explains why, not a bare pricing redirect.

## Task 4: Dashboard

A user may now hold PMQ and PFQ entitlements at different tiers. The dashboard
must show each course at its own tier without implying one unlocks the other.

---

## Do not

- Do not add price literals to components. Everything derives from
  `registry-data.ts`.
- Do not edit `tiers.ts` to make a card claim true. Change the card.
- Do not build an AI Pro checkout.
- Do not rename `body_markdown`.
- Do not touch `src/lib/pfq/free-sample.ts`. The free 50 are already correct
  (5 per objective, round-robin across outcomes, mock rows never eligible).
- Do not revoke the two existing `source = 'free'` PFQ pro grants.

## Done means

- `npx tsc --noEmit` clean.
- `npm run build` passes (it runs the 4 invariant tests first).
- Test-mode purchase grants the entitlement, sends the email and fires
  `purchase_completed`.
- A signed-out visitor, a signed-in starter, and a Pro holder each see the
  correct state on: pricing, objective 1, objective 5, practice set 2, mock.
