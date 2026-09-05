# PMQ in 5 Days — plan ladder spec sheet

**Rewritten 2026-08-28.** The previous version of this file described the Pro Bundle
as "£9.99, includes Sly, 1,862 questions, 4 mock exams". Every one of those four
claims was wrong against the live product. Sly, the end-of-course report, the full
1,862-question bank and the fourth mock paper all sit in **AI Pro**, which is a
`waitlist` tier nobody can buy. See `FEATURES.md` §4 for the original correction.

---

## Where prices actually come from

`src/lib/courses/registry-data.ts` → `COURSE_STATIC["pmq-in-5-days"].priceCents`.

That single value is re-exported as `PMQ_PRO_PRICE_CENTS` / `SLY_UNLOCK_PRICE_CENTS`
(`src/lib/tutor/constants.ts`), read by `src/lib/pmq/plans.ts` for the pricing cards,
and used by `createAiTutorCheckout` for the Stripe charge. Card and charge cannot
diverge by construction — which is the point, because advertising one price and
charging another is a misleading price indication under the CPRs, not a bug.

**To move the price, do all three together:**

1. set `priceCents` on the PMQ entry in the registry,
2. add a migration so Supabase `exam_config` agrees,
3. update the Stripe product/price if a fixed Price object is ever introduced.

Never edit a displayed price in isolation, and never quote one in a markdown file
without saying where it was derived from and when.

---

## The ladder, as at 2026-08-28

| | Starter | **Pro Bundle** | AI Pro Bundle |
|---|---|---|---|
| Price | Free | **£8.00** one-off | £15.00 one-off |
| Status | live | **buyable** | **waitlist — no checkout** |
| Practice quiz sets | 1 | 1–5 | 1–8 |
| Practice questions (total) | 240 | 1,200 | 1,862 |
| Advertised increment vs Starter | — | +960 | +1,620 |
| Mock exam papers | 1 | 3 | 4 |
| Video per learning objective | — | yes | yes |
| Audio per learning objective | — | yes | yes |
| Sly, the AI tutor | — | **no** | yes |
| End-of-course report | — | **no** | yes |

Enforcement lives in `src/lib/pmq/tiers.ts` (quiz sets 1 / 2–5 / 6–8; mock papers
1 / 2–3 / 4). `plans.ts` is marketing copy only. If the two ever disagree, `tiers.ts`
is right and the card is a mis-statement.

**The advertised increments deliberately understate.** AI Pro's "+1,620" is 2 below
the true 1,622. Delivering more than promised is safe; the reverse is a misleading
action. Only ever move these figures down or to the true figure.

---

## Sly and the fair-usage credit

Sly is **AI Pro only**, and AI Pro is `waitlist` — so no one currently holds Sly
through a purchase. Do not describe Sly as part of the £8 Pro Bundle.

- `SLY_UNLOCK_CREDIT_GBP_CENTS` = £5 of fair-usage credit, carried by whichever tier
  actually grants Sly.
- Top-ups credit 70% to the meter (30% platform fee), min £1, max £500.
- Mock grading: all four papers are AI-graded by Gemini. Starter runs on a flat
  50p/user grading budget (`STARTER_MOCK_GRADING_BUDGET_GBP_CENTS`), separate from
  the Sly credit.

---

## Companion course

PFQ in 2 Days: **Pro Bundle £6**, no free slice; **AI Pro £12**, waitlist and
indicative. Source: `COURSE_STATIC["pfq-in-2-days"].priceCents` and
`src/lib/pfq/plans.ts`.

---

## Known drift — VERIFIED AGAINST LIVE SUPABASE 2026-08-28

Queried `public.courses` on project `dbjoimidfbftammchnql`. Two stale price values
are live in `exam_config`, and neither matches the code:

| Course row | Stale DB value | Code value | Delta |
|---|---|---|---|
| `pmq-in-5-days` | `exam_config.ai_tutor_price_cents: 999` | 800 | £9.99 vs £8 |
| `pfq-in-2-days` | `exam_config.pfq_pro_price_cents: 500` | 600 | £5 vs £6 |

The PMQ one was already known (`LAUNCH_RUNBOOK.md`). **The PFQ one was not documented
anywhere** and is almost certainly why `PFQ in 2 days/PFQ_LANDING_COPY.md` was written
against £5.

Checkout passes an explicit amount, so live charges are correct at £8 and £6 today.
The risk is anything that reads `exam_config` directly, now or later, and quietly
disagrees with the registry.

**Not fixed here on purpose.** A price change is code + migration + Stripe together;
a DB-only edit recreates the same class of drift in the other direction. Reconcile all
three in one change. Migration files in this repo do not reliably reflect what is
applied to production — verify the live schema before deploying.

Also note `courses.price_cents` for `pmq-in-5-days` is `0` with `is_free: true`. That is
correct: PMQ the *course* is free, and £8 buys the Pro Bundle on top. Do not "fix" it.
