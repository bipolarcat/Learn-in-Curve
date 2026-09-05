# PFQ — backfill the `traps` tags on the question bank

Handoff spec for Cursor. Written 2026-09-05.

**Why this exists:** `pfq_questions.traps` is a `text[]` that drives (a) trap-aware
practice selection and (b) the inline trap callouts specced in section 3b of
`cursor-prompt-pfq-pmq-parity.md`. It is almost entirely unpopulated. Only **29 of 306
active questions** carry any tag, and the callout feature is dead weight without it.

This is a detection-and-review job, not an authoring job. Most trap-bearing questions
already exist in the bank; they were simply never tagged.

**Read first:** `src/lib/pfq/trap-school-content.ts` (the four trap modules and the
near-miss confusion pairs), `src/lib/pfq/types.ts` (`PfqQuestionRow`), and
`PFQ_RESEARCH.md` §4.

---

## 0. Current state, measured

Live counts, 2026-09-05, `pfq_questions where active`:

Existing tag values, and note they do **not** match the trap school module ids:

| Tag value in `traps[]` | Count | Trap school module id |
|---|---|---|
| `negative_stem` | 24 | `negative` |
| `multi_select` | 5 | `combination` |
| (none for near-miss) | 0 | `near_miss` |
| (none for absolutes) | 0 | `absolutes` |

Rough detection sweep across the same 306 rows, to size the job:

| Trap | Detected candidates | Already tagged |
|---|---|---|
| Negative stem | ~29 | 24 |
| Multi-select combination | 5 | 5 |
| Absolutes in options | ~74 (over-inclusive, see §2c) | 0 |
| Near-miss definition | not yet measured | 0 |

## 1. Deliverable

A script at `scripts/pfq/backfill-traps.ts` runnable via `npx tsx`, with two modes:

- `--report` (default): writes `scripts/pfq/trap-backfill-report.json` and prints a
  summary. **Changes nothing.**
- `--apply`: applies only the rows marked `approved: true` in a reviewed report file.

**The script must never write to the database in a single pass.** Detection accuracy
varies sharply by trap type (see §2), and a bad tag produces a wrong inline callout at
exactly the moment a learner is trying to understand their mistake. Report, review,
then apply.

## 2. Detection rules, by trap

### 2a. Negative stem → tag `negative_stem`

Match the stem, case-insensitive, on word boundaries: `not`, `never`, `except`,
`least`, `false`, `incorrect`, `is not`, `are not`.

**Precision is high here** — a negative word in a PFQ stem almost always signals an
inverted question. Expect roughly 29 hits against 24 already tagged, so this mostly
confirms existing tags and adds a handful.

Guard against the obvious false positive: a stem containing "not" as part of a quoted
definition rather than as the question's operator. Flag any hit where the negative word
falls inside quotation marks for manual review rather than auto-approving.

### 2b. Multi-select combination → tag `multi_select`

Deterministic, no heuristic needed: `type = 'multi_select'` OR `items IS NOT NULL`.

All 5 are already tagged, so this should be a no-op that confirms the rule. If it finds
untagged rows, that is a data integrity finding worth reporting separately.

**Also report the shortfall.** `PFQ_RESEARCH.md` §4 puts numbered-list multi-selects at
**6 of 60 (10%)** of the real paper. The bank has 5 of 306, which is 1.6%. If the mock
is meant to be Surpass-faithful, this gap makes it materially easier than the real
exam. Include this as a headline number in the report summary. Do not try to fix it
here — it is a content authoring ticket, not a tagging one.

### 2c. Absolutes → tag `absolutes`

Match option text for: `always`, `never`, `all`, `only`, `every`, `must`, `none`,
`entirely`, `guarantees`.

**This one is over-inclusive and must not be auto-approved.** A naive sweep returns
~74 hits, and words like "all" and "only" appear innocuously in correct options all the
time ("all project stakeholders", "only after approval"). The trap is specifically an
*absolute claim in a distractor that is wrong because it is absolute*.

Two constraints:

1. Only consider options that are **not** the correct answer. An absolute in the
   correct answer is not a trap.
2. Emit every hit to the report with the full option text and a `confidence` field, and
   default `approved: false`. A human decides.

Expect the true count to be far below 74. If the reviewed set comes out under ~15,
report that and flag whether `absolutes` is worth carrying as a trap category at all.

### 2d. Near-miss definition → tag `near_miss`

The highest-value trap and the least mechanical. `PFQ_TRAP_SCHOOL.traps` includes a
`pairs` array of `{ confused, holdApart }` — risk/issue, programme/portfolio and so on.

Detection: for each pair, split `confused` on `/` to get the individual terms. Tag a
question when **two or more terms from the same pair** appear across its stem and
options. That is the signature of a discrimination question.

This is the trap `PFQ_RESEARCH.md` describes as the dominant failure mode (29 of 59
outcomes begin with "Define" or "State"), so expect a meaningful yield. Report every
hit with the matched pair so a reviewer can sanity check it.

## 3. Report format

```jsonc
{
  "generated_at": "2026-09-05T00:00:00Z",
  "summary": {
    "active_questions": 306,
    "currently_tagged": 29,
    "proposed_additions": 0,
    "by_trap": { "negative_stem": 0, "multi_select": 0, "absolutes": 0, "near_miss": 0 },
    "multi_select_shortfall": {
      "bank_percent": 1.6,
      "exam_percent": 10.0,
      "note": "Authoring gap, not a tagging gap. See section 2b."
    }
  },
  "proposals": [
    {
      "question_id": "…",
      "objective": 4,
      "learning_outcome": "4.10",
      "trap": "near_miss",
      "confidence": "high",
      "evidence": "matched pair: Risk / issue",
      "stem_excerpt": "…",
      "existing_traps": [],
      "approved": false
    }
  ]
}
```

`--apply` reads this file, ignores everything with `approved: false`, and appends the
tag to the existing `traps` array rather than replacing it. Appending matters: a
question can legitimately carry both `negative_stem` and `near_miss`.

## 4. Constraints

- **Never replace the `traps` array.** Append, and de-duplicate.
- **Do not touch any other column**, and do not touch `pfq_coverage_signals`,
  `pfq_answers` or `pfq_practice_answers`.
- Operate only on `active = true` rows.
- The script must be idempotent: running `--apply` twice produces the same result.
- Write the report to disk. Do not print 300 rows to stdout.
- Use the existing Supabase client setup in the repo; do not introduce a new DB
  connection pattern.

## 5. The vocabulary mismatch — fix it once, here

`traps[]` uses `negative_stem` and `multi_select`. `PFQ_TRAP_SCHOOL` uses module ids
`negative`, `combination`, `near_miss`, `absolutes`. These disagree, and section 3b of
the parity prompt needs to map between them.

Export a single constant that both this script and the callout component import:

```ts
// src/lib/pfq/trap-tags.ts
export const TRAP_TAG_TO_MODULE = {
  negative_stem: "negative",
  multi_select: "combination",
  near_miss: "near_miss",
  absolutes: "absolutes",
} as const;
export type PfqTrapTag = keyof typeof TRAP_TAG_TO_MODULE;
```

Do not rename the existing DB tag values — 29 rows already use them and renaming buys
nothing. Map instead.

## 6. Acceptance

1. `npx tsx scripts/pfq/backfill-traps.ts --report` writes a report and changes no
   database rows. Verify the row count and a checksum of `traps` before and after.
2. The report's negative-stem proposals substantially overlap the 24 existing tags,
   which is the sanity check that detection works.
3. After a reviewed `--apply`, every tag value present in the database is a key of
   `TRAP_TAG_TO_MODULE`.
4. Running `--apply` a second time proposes and writes nothing.
5. Report the final tagged count per objective, so the parity prompt's inline callouts
   can be assessed for whether they will actually fire often enough to matter.
