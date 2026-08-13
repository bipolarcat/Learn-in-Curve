# Cursor prompt — PFQ practice questions: seed and runner

**Written 13 Aug 2026.** Fourth PFQ prompt. Depends on the shipped mock build; independent of the content pipeline and commerce prompts, so it can run in parallel with both.

---

## What changed in the database

**A migration has already been applied to the live `learn-in-curve` project.** It is recorded at `supabase/migrations/20260813210000_pfq_practice_bank.sql` for the repo's history. Do not apply it again; do not assume it is unapplied.

Two columns were added to `pfq_questions`:

| Column | Type | Meaning |
|---|---|---|
| `mock_suitable` | boolean, default false | May this question be drawn into the 60-question mock |
| `variant` | integer, default 1 | Ordinal within a learning outcome. Variant 1 is the mock-eligible question; 2 upwards are practice-only |

Two partial indexes were added, one for the mock draw and one for practice by objective.

## Task 1 — Fix the seed before anything else

`pfq_questions` is currently **empty**. The seed has never successfully run against the live database, so the tagging update in the migration touched zero rows.

That creates a trap: the new columns default `mock_suitable` to false, so a naive re-seed would load every question as practice-only and the mock generator would find nothing to draw. Both source files now carry `mock_suitable` and `variant` explicitly.

- `PFQ in 2 days/pfq-questions.json` — the 60 mock questions, all `mock_suitable: true`, `variant: 1`
- `PFQ in 2 days/pfq-practice-questions.json` — practice-only questions, `mock_suitable: false`, `variant: 2` upwards

Update `scripts/seed-pfq-questions.mjs` to load **both** files, map the two new fields explicitly rather than relying on column defaults, and stay idempotent on `id`. After seeding, assert that every one of the 59 outcomes has at least one `mock_suitable` question, and fail loudly if not.

Claude is still authoring the practice file; it is being delivered objective by objective. Build the seed to read whatever is present rather than to a fixed count.

## Task 2 — Practice runner

`/pfq/practice/[objective]` — practice for one learning objective.

- Draws every active question for that objective, mock-eligible and practice-only alike. One tier, no caps.
- Not timed. The mock is the timed artefact; this is practice.
- Immediate feedback per question, showing the explanation and the outcome code it tests.
- Order randomised per attempt, and options shuffled per attempt using the existing `shuffle.ts` helpers rather than a second implementation.
- Track results per **learning outcome**, not per objective, so practice feeds the same coverage map as the mock.
- Gated at `pro` once the commerce prompt lands. Until then, behind a flag.

## Task 3 — Answers stay server side

Same rule as the mock, and worth restating because practice is the easier place to get it wrong: `answer` and `explanation` must not appear in any payload before the learner has answered that question. Reuse `toPublicPfqQuestion` and `assertNoSecretsInPublicPayload`. Revealing the explanation on submit of a single question is fine; shipping the whole set with answers attached at page load is not.

## Task 4 — Extend the invariant test

`tests/pfq-bank-invariant.test.mjs` currently validates the 60-question mock bank. Extend it to cover the combined bank:

1. Every one of the 59 outcomes has at least one `mock_suitable` question. Fail if any outcome has none.
2. No `id` collides across the two files.
3. Every question still has four options, a valid `answer` key, and a `learning_outcome` in the syllabus set.
4. `multi_select` questions still have exactly four `items`.
5. No explanation contains a letter reference matching `\boption [a-d]\b`, because options are re-shuffled per attempt.
6. No stem, option or explanation contains an em dash.

## Task 5 — Practice results feed the coverage map

The coverage map is the product. It must combine lesson checkpoints, practice results and mock results into one per-outcome state. Practice answered correctly should count towards "you can answer this outcome"; practice answered wrongly should mark it as a gap, in the same way a mock miss does.

Decide and document how repeated attempts resolve — most recent answer, or best answer. Flag your choice in the report rather than picking silently.

---

## Acceptance criteria

1. `npm run seed:pfq` loads both files, is idempotent, and every outcome ends up with at least one mock-eligible question.
2. Re-running the seed changes no rows.
3. A `pro` user can practise any objective and sees an explanation after each answer.
4. Answers and explanations are absent from the page-load payload. Check the real network response.
5. The invariant test passes, and demonstrably fails if a `mock_suitable` question is removed from an outcome.
6. Practice results appear in the coverage map alongside mock results.
7. `get_advisors` shows no new security warnings.

## Report back

Append to `BUSINESS_STATE.md`: what shipped, what didn't, your decision on repeated-attempt resolution, and any deviation with the reason. State plainly whether any further migration was applied or only written. Leave Linear at In Review.
