# Cursor prompt — PFQ mock exam + 59-outcome coverage map

**Status:** ready to execute. Written 13 Aug 2026.
**Scope:** ship the free PFQ practice mock and the outcome coverage map. **Not** the full 2-day course — that is gated on this shipping and drawing traffic (see `PFQ in 2 days/PFQ_RESEARCH.md` §10).

## Inputs already produced (do not regenerate)

| File | What it is |
|---|---|
| `PFQ in 2 days/PFQ_RESEARCH.md` | Research, evidence, market, legal flags. Read §1, §4, §9 before starting. |
| `PFQ in 2 days/PFQ_DAY_PLAN.md` | Day 1 = LO1–5 (30 marks), Day 2 = LO6–10 (30 marks). Coverage invariant. |
| `PFQ in 2 days/pfq-questions.json` | **60 authored questions, one per learning outcome + 10.4 doubled. Source of truth.** |

---

## Division of labour

**Claude does** (already done, or on request): question authoring and wording, syllabus interpretation, legal/compliance copy, positioning, spec changes. Do not rewrite question text, stems, options or explanations in code — if a question looks wrong, flag it, don't fix it.

**Cursor does** (this prompt): schema + migration, seed script, mock runner UI, coverage map UI, scoring, CI invariant check, tests.

---

## 1. Schema

New migration. Follow the existing migration naming and RLS conventions in this repo — read an existing migration first and match it; do not invent a new style.

```
pfq_questions
  id                text primary key        -- 'PFQ-001'
  learning_outcome  text not null           -- '4.10'  ← the whole product depends on this column
  objective         int  not null           -- 1..10
  day               int  not null           -- 1 or 2
  verb              text not null           -- Define | State | Outline | Explain | Describe | Differentiate
  type              text not null           -- 'single' | 'multi_select'
  traps             text[] not null default '{}'
  stem              text not null
  items             jsonb                   -- multi_select only: the four numbered items
  options           jsonb not null          -- {a,b,c,d}
  answer            char(1) not null
  explanation       text not null
  active            boolean not null default true

pfq_attempts
  id            uuid pk
  user_id       uuid references auth.users on delete cascade   -- nullable: guests allowed
  guest_token   text                                            -- for signed-out attempts
  started_at    timestamptz not null default now()
  submitted_at  timestamptz
  score         int
  question_ids  text[] not null            -- the 60 drawn, in served order

pfq_answers
  attempt_id    uuid references pfq_attempts on delete cascade
  question_id   text references pfq_questions
  selected      char(1)                    -- null = unattempted
  correct       boolean
  flagged       boolean not null default false
  option_order  char(1)[] not null         -- the per-attempt shuffle, so review renders identically
  primary key (attempt_id, question_id)
```

**Non-negotiables**
- Every `user_id` FK gets `ON DELETE CASCADE` (we have been bitten by this before — see the 2026-08-04 auth incident).
- RLS: users read/write only their own attempts and answers. `pfq_questions` is readable by all, writable by service role only. **Never expose `answer` or `explanation` to the client before submission** — serve questions through an API route that strips both fields until the attempt is submitted. A public read policy on the whole table is a leaked answer key.
- Guest attempts: allow them (the PMQ side already proved guests convert badly when gated). Store `guest_token`, no PII.

## 2. Seed

Script `scripts/seed-pfq-questions.ts` reading `PFQ in 2 days/pfq-questions.json`, upserting on `id`. Idempotent — re-running must not duplicate. JSON stays the source of truth; **nobody edits questions in the database.**

## 3. CI invariant (do this early, not last)

A test that fails the build if:
1. the distinct `learning_outcome` values in the bank ≠ the 59 syllabus outcomes exactly (no missing, no extras);
2. any question's `answer` is not a key of its `options`, or `options` doesn't have exactly 4 keys;
3. any `multi_select` question doesn't have exactly 4 `items`;
4. any `explanation` contains a letter reference (regex `\boption [a-d]\b`, case-insensitive) — options are re-shuffled per attempt, so letter references would be wrong on screen.

The 59 expected outcomes: 1.1–1.6, 2.1–2.4, 3.1, 4.1–4.11, 5.1–5.8, 6.1–6.6, 7.1–7.8, 8.1–8.6, 9.1–9.5, 10.1–10.4.

## 4. Mock generator

- Draw **one question per learning outcome (59)**, plus **one duplicate outcome chosen at random** = 60.
- **Do not hardcode 10.4 as the duplicate.** The handbook says one outcome is doubled, not which. Right now the bank only has two questions for 10.4, so with a single question per other outcome the 60th will in practice be the second 10.4 — that is fine, but the *generator* must not assume it, because the bank will grow.
- Shuffle option order per attempt, per question; persist the order in `pfq_answers.option_order` so the review screen matches what was sat.
- Serve in a fixed random order per attempt, stored in `pfq_attempts.question_ids`.

## 5. Mock runner UI — mirror the real thing

The real exam runs in Surpass. APM's only free practice artefact is a 2022 pencil-and-paper PDF, so a faithful runner is the main differentiator. Match these behaviours (all documented in the PFQ Handbook §13b–c):

- 60 questions, **60:00 countdown**, auto-submit at zero.
- Question navigator: numbered tabs down the left; next/back buttons.
- **Flag** any question for later.
- **Review panel** filterable by **Unattempted / Attempted / Flagged**, pinnable open.
- Progress + time remaining visible throughout.
- Warn on submit if any questions are unanswered or still flagged.
- On submit: immediate provisional score, pass/fail against **36/60**.
- Pacing nudge: 1 minute per question is APM's own guidance — show it, don't nag.

No negative marking. Unanswered scores 0. The UI should gently push the learner to answer everything (APM explicitly advises guessing).

## 6. Results screen — this is the product, not a score

A percentage is what everyone else ships. Ship the outcome map instead:

- **"You can currently answer 47 of 59 learning outcomes."** Headline number, not a percentage.
- Grid of 59 chips, one per outcome, coloured by state (correct / incorrect / not yet attempted), grouped by learning objective, each labelled with its outcome code and short title.
- Per-objective bar showing marks available vs marks scored, with **the real exam weighting visible** (LO4 = 11 marks, LO3 = 1 mark). Learners should be able to see instantly that they are strong in a 1-mark area and weak in an 11-mark one.
- Every wrong answer shows its explanation, the outcome it maps to, and the day it's taught on.
- Gap list is ordered by **marks at risk**, not by question number.

## 7. Trap School (small, high value)

Filter the bank by `traps`. Currently 3 `multi_select` questions are tagged. Also add a short static explainer covering: negatively-worded stems (~8% of the real paper), multi-select combinations (~10%), near-miss definition distractors, and the no-negative-marking guessing policy. Content will come from Claude — build the shell.

## 8. Routing and entry

- `/pfq` — landing page. Hero is the coverage map concept, CTA is "Sit the free 60-question mock".
- `/pfq/mock` — runner. `/pfq/mock/[attemptId]` — results/review.
- Update the existing `pfq-in-2-days` course card in `src/components/CoursesCatalog.tsx`: keep "(coming soon)" for the full course, add a live secondary CTA to the free mock. Leave the `PfqNotifyDialog` waitlist wired as-is.

## 9. Legal — must ship with the build, not after

- Footer/landing disclaimer: **"Learn in Curve is not an APM Accredited Training Provider. We do not sell, administer or invigilate the APM PFQ exam. APM, Association for Project Management and Project Fundamentals Qualification are trademarks of the Association for Project Management."**
- No claim of accreditation, endorsement, official status, or guaranteed pass. No pass-rate figure unless it is our own measured data with the sample size shown.
- Do not import, scrape or reference any third-party PFQ question set or "dump". Every question in this repo is originally authored; keep it that way.
- Consent: PostHog stays consent-gated. Reuse the existing `lists.ts` consent model unchanged if the results screen offers an email capture.

## 10. Acceptance criteria

1. `npm run seed:pfq` loads 60 questions; re-running changes nothing.
2. CI invariant test passes and demonstrably fails if a question is deleted from the JSON.
3. A signed-out user can complete a full 60-question timed mock, flag questions, filter the review panel, submit, and see the outcome map.
4. Answers and explanations are provably not in the network response before submission (check the actual payload, don't assume).
5. Time expiry auto-submits and scores correctly.
6. Reloading mid-attempt resumes with the same questions, same option order, same flags.
7. Results are reproducible on the review screen — same option order as sat.
8. `get_advisors` shows no new security warnings after the migration.

## 11. Report back

Append a `BUSINESS_STATE.md` entry with what was built and what wasn't, and note anything in this prompt you deviated from and why. **Do not** mark the Linear ticket beyond In Review — Claude verifies against actual repo and DB state before anything moves to Done.
