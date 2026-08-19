# Learn in Curve — Feature Reference (Free vs. Pro)

**Purpose:** canonical feature list for the APM PMQ course, dictated by Sim on 2026-07-15. Use this as the source of truth for marketing copy, content writing, sales material, course cards, landing pages, etc. — don't re-derive feature claims from memory, check here first, and check the live product/DB if a number is load-bearing (see note at bottom).

## Free tier — "PMQ in 5 Days Starter"

**Gamification**
- Completion meter (visual progress across the course)
- Daily streak tracking — keeps learners returning and finishing

**Learning**
- 24 learning objectives (LOs), full APM syllabus coverage for the exam
- No AI tutor. Sly is an AI Pro feature; the landing page offers a capped
  guest taster only.
- Exam command words explained (State / Explain / Describe / Compare etc.) — teaches exactly what examiners want from each command word
- Common misconceptions section per LO — corrects wrong-but-common assumptions
- Memory aids per LO (acronyms etc.) for recall

**Practice**
- Interactive quizzes — 240 questions across all 24 LOs (the one count still
  written out here; it matches `PMQ_PLANS.starter` and is covered by
  `tests/plan-counts.test.mjs`)
- Mock Exam 1 — complete 40-question, 90-mark mixed-format paper; objective
  questions are auto-marked and written responses are AI-graded by Gemini
  (same grading engine as Pro's Exams 2-4, on a flat free-tier budget)

## Pro bundle — one-time unlock

**Sly is NOT in this tier.** Corrected 2026-07-31 — see note 4 below.

Everything in Starter, plus:

**Practice — unlocked**
- Additional practice questions on top of Starter's bank, across all 24 LOs

**Media**
- One video per learning objective
- Audio overview per learning objective

**Mock exam upgrade**
- Additional 40-question papers, each separate from the free Exam 1; written
  answers are AI-graded by Gemini, same as Exam 1
- Timed, proctored-style format with a scheduled break, matching the real exam experience for confidence-building

**Pricing mechanics**
- One-time unlock. **The price is `SLY_UNLOCK_PRICE_CENTS` in
  `src/lib/tutor/constants.ts` — do not restate a figure here.** That constant
  is what `createAiTutorCheckout` charges and what the pricing page renders, so a
  number typed into this doc can only ever be wrong. As of 2026-07-31 it is £8.00.
- Part of the payment is credited as Sly usage allowance
  (`SLY_UNLOCK_CREDIT_GBP_CENTS`, £5.00 as of 2026-07-31)
- Top-ups available once the allowance runs out; 70% of any top-up is credited as further Sly usage (30% platform fee)

## AI Pro bundle — waitlist, NOT purchasable

Status in `src/lib/pmq/plans.ts` is `waitlist`: there is no checkout, and
`NotifyDialog` collects an email for the launch list. Its indicative price is
not charged anywhere. Everything in Starter, plus:

**Sly, the AI tutor**
- Chat subject to fair-usage policy, exam-focused answers only
- Sly's whole purpose: get the learner to pass the exam, not general chit-chat
- End-of-course report — strengths, weaknesses, and suggestions, generated from quiz performance + chat history once all LOs are complete

**Practice / mocks** — the largest question bank and every mock paper.

**Guest taster (live since 2026-07-17):** unsigned visitors get
`GUEST_TIER_MESSAGE_CAP` free Sly messages per hashed IP from the landing page,
under a global spend cap (`GUEST_TUTOR_BUDGET_CAP_GBP_CENTS`). This is a Beta
taster of a paid feature, not part of the free account. Marketing copy must not
let a visitor infer that a free account includes the tutor — that would be a
misleading omission under the CPRs, and in practice it generates refunds.

---

### Accuracy note (2026-07-15, updated same day)
1. **Quiz count / tiering — corrected by Sim.** Free tier (now "Starter") gets a fixed question bank across all 24 LOs; Pro unlocks the remaining quiz sets per LO on top of that. Earlier drafts of this doc used placeholder/rounded figures here — see note 3 below for the current DB-verified numbers, which supersede any count elsewhere in this section.
2. **Mock exams — corrected 2026-07-18, updated 2026-07-28.** There are four
   distinct 40-question papers. Exam 1 is free; Exams 2–4 are included with
   Pro. As of 2026-07-28, all four are AI-graded by Gemini — Exam 1's written
   answers are no longer self-assessed, on a flat free-tier grading budget
   (50p/user, separate from Pro's £5 credit). Never describe Pro as grading the
   same paper or imply that more than one Pro exam may be active at once.
4. **AI Pro / Pro split and price — corrected 2026-07-31.** This doc had Sly,
   the end-of-course report and the full 1,862-question bank under "Pro bundle —
   one-time unlock, £9.99". All four claims were wrong against the live product:
   `src/lib/pmq/plans.ts` puts Sly and the report in **AI Pro**, which is a
   `waitlist` tier with no checkout; Pro's advertised increment is smaller than
   the full bank; and the charged price comes from `SLY_UNLOCK_PRICE_CENTS`
   (£8.00), not £9.99. Since this file is where marketing copy gets derived, a
   stale over-claim here propagates into an advertised price and feature set the
   product doesn't deliver — a misleading action under the CPRs, not a typo.
   **Rule going forward: quote no price or question count in this file. Point at
   `plans.ts` / `constants.ts`, which are commented and test-covered.**
   Caveat that matters commercially: entitlement today is still the single
   `feature_entitlements.feature = 'ai_tutor'` boolean, so a Pro purchase
   currently unlocks everything listed under AI Pro too. The tier split is
   marketing until **LIC-98** lands — do not put Pro on sale at a Pro price
   before then.
6. **XP removed, 2026-08-19 — do not reinstate.** Sim confirmed the XP-per-answer
   feature has been taken out of the product. The bullet that claimed "XP on every
   quiz answer (10 XP each)" has been deleted from this file. **Daily streaks and the
   completion meter remain live and may still be sold.** Two other places still
   referenced XP at the time of this edit and are being handled separately:
   `src/lib/pmq/pro-included.ts` (`PMQ_TICKET_SELL_POINTS[0]`, which is live copy on
   the courses catalogue card) and `src/components/pmq/XpStreakBar.tsx` (the XP pill
   itself). If either of those still mentions XP when you read this, the removal was
   not finished. Do not re-add XP to this file on the basis of finding it in code.

5. **Free-tier rename, 2026-07-27.** "Lite" renamed to "Starter" across marketing/landing copy (`FEATURES.md`, `PmqPreviewCompare.tsx`) — "Lite" tested as implying reduced value. Quiz counts also corrected to live DB-verified numbers same day: Starter = 240 questions (was documented as "~280"), Pro = 1,862 total / 1,622 Starter-exclusive extra (was documented as "800+", now stale-low). Note: the internal `MockExamTier` type (`"lite" | "full"`) in `src/lib/pmq/{mock-domain,mock-actions,constants,queries}.ts` and `src/types/pmq.ts` still uses `"lite"` as a code-level value — this wasn't touched, since it's an internal/routing identifier (not displayed to users) and renaming it touches URL params and session-tier comparisons across several files. Flag if you want that renamed too.
