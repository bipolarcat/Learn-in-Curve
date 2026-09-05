# PFQ bank expansion: `tip` field, 3 mock sets, free tier, loader

Handoff spec for Cursor. Written 2026-09-05.

**Context.** The PFQ question bank is being expanded from 306 to roughly 770 questions:
590 in the practice bank plus 3 mock papers of 60. New content is authored as JSON
files and loaded by script. This spec covers the platform changes that content needs.
It does **not** author questions.

**Read first:** `src/lib/pfq/types.ts`, `src/lib/pfq/generator.ts`,
`src/lib/pfq/practice-actions.ts`, `OPERATIONS.md`.

**Related prompts:** `cursor-prompt-pfq-pmq-parity.md` (Phase 2 and 3),
`cursor-prompt-pfq-trap-backfill.md`. This one is independent of both and can run in
parallel.

---

## 1. Schema: two new columns

One migration, both columns nullable so nothing existing breaks.

```sql
alter table public.pfq_questions
  add column if not exists tip text,
  add column if not exists mock_set smallint;

create index if not exists pfq_questions_mock_set_idx
  on public.pfq_questions (mock_set) where mock_set is not null;
```

**`tip`** is a short exam-technique pointer shown separately from the explanation.
Nullable by design: not every question has a transferable technique, and a forced tip
is filler. Roughly 4 in 5 questions carry one.

**`mock_set`** is 1, 2 or 3, identifying which mock paper a question belongs to. Null
means practice-only. This replaces the current situation where `mock_suitable` is a
bare boolean and all mock-eligible questions collapse into a single pool.

Do not drop or repurpose `mock_suitable`. It stays as the eligibility flag; `mock_set`
is the assignment.

## 2. Types

`src/lib/pfq/types.ts`:

- `PfqQuestionRow` gains `tip: string | null` and `mock_set: 1 | 2 | 3 | null`.
- `PfqReviewQuestion` gains `tip: string | null`. It must **not** gain `mock_set`.
- `PfqPublicQuestion` gains neither. A question served during an in-progress attempt
  must not leak the tip, because the tip often points at the answer.

That last point is the one to get right. The tip is review-time content only.

## 3. Mock generation

`src/lib/pfq/generator.ts` currently filters on `active !== false && mock_suitable === true`
and draws one pool. Change it to take a mock set number and filter on
`mock_set === n` as well.

Invariants to assert, and to fail loudly on rather than silently serving a short paper:

- each set has exactly 60 questions
- each set covers all 59 learning outcomes, with exactly one outcome appearing twice
- no question id appears in more than one set
- each set contains 6 `multi_select` questions, matching the real paper

`src/lib/pfq/bank-invariant.ts` already exists for this kind of check. Extend it rather
than writing a parallel one, and wire it into the build so a bad load cannot ship.

The UI needs a mock picker: three papers, each showing whether it has been attempted
and the last score. Do not auto-advance the learner from one to the next.

## 4. Free tier: the 50-question sample

Product decision: lessons and Trap School are free, the practice bank and mocks are
paid, and free users get 50 practice questions.

Those 50 must be **selected, not random**. One question per learning outcome for the
first 50 outcomes in syllabus order, so a free user finishes having been tested across
50 of the 59 outcomes rather than on a scattered sample.

- Select with `distinct on (learning_outcome)`, ordered by outcome then variant,
  limited to 50, and excluding anything with a non-null `mock_set` so the mock papers
  stay entirely behind the paywall.
- Make it a stable, deterministic set. The same free user must see the same 50, and it
  must not reshuffle between sessions.
- Cache the id list rather than recomputing the selection per request.

**The end-of-free-tier screen matters more than the questions.** When a free user
finishes question 50, show:

- how many of the 50 tested outcomes they answered correctly
- the names of the outcomes they missed, from `pfq-outcome-titles.json`
- that 9 outcomes were not tested at all
- what Pro adds: the full bank, 3 mock papers, and the per-outcome report

Name the missed outcomes specifically. "You are weak on LO7" is what competitors say.
"7.7 issues versus risks, and 7.3 the risk management process" is the differentiator,
and it is the only version supported by the feedback evidence, because it points at
work rather than at the person.

## 5. Render the tip

In `PfqPracticeRunner` and in mock review, after the explanation:

- italic text, with a bulb icon
- render **only** when `tip` is non-null. No empty block, no placeholder
- the icon is decorative: `aria-hidden="true"`, with a visible or screen-reader text
  label "Tip", because an icon alone carries no meaning
- keep it to the one or two lines it currently runs to. Italic body text at length
  hurts readability, so do not let this block grow into a second explanation

Use the existing v4 tokens. `--gold` is the natural accent for a tip block against
`--paper`; check contrast in both themes before settling on it.

## 6. Loader script

`scripts/pfq/load-questions.ts`, runnable with `npx tsx`.

- reads JSON files matching `content/pfq/questions/objective-*.json`
- validates every row before writing anything: 4 options, answer key present in
  options, non-empty stem and explanation, `items` present if and only if
  `type === 'multi_select'`, every trap tag a key of `TRAP_TAG_TO_MODULE`, no duplicate
  ids, no variant collision within a learning outcome
- `--dry-run` reports what would change and writes nothing. Default to dry run
- upserts on `id` so a re-run is idempotent
- refuses to run if any row's `learning_outcome` is not one of the 59 in
  `src/lib/pfq/outcomes.ts`

Report inserted, updated and skipped counts per objective.

## 7. Constraints

- Never use em dashes or en dashes in any user-facing copy you write.
- Do not touch `pfq_coverage_signals` or the coverage resolve rule.
- Do not author, edit or "improve" question content. If a question looks wrong, report
  it; do not fix it.
- `PFQ_CHECKOUT_ENABLED` stays false. This work does not open checkout.
- Report by appending a `BUSINESS_STATE.md` decision-log entry, stating what you
  verified rather than what you assume.

## 8. Verification

1. Migration applied; both columns exist and are nullable.
2. `npx tsx scripts/pfq/load-questions.ts --dry-run` runs clean on the LO4 files.
3. A second `--apply` run inserts nothing new.
4. A question with `tip: null` renders no tip block at all.
5. A `PfqPublicQuestion` payload during a live attempt contains no `tip` field. Check
   the actual network response, not the type.
6. Each mock set returns exactly 60 questions, 59 distinct outcomes, 6 multi-selects.
7. No question id appears in two mock sets.
8. A free user sees exactly 50 questions spanning 50 distinct outcomes, none of them
   from a mock set, and the same 50 on a second visit.
9. `npm run build` clean.
