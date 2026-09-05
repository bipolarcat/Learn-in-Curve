# PFQ, backfill the `traps` tags on the question bank

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

### 2a. Negative stem -> tag `negative_stem`

**Tightened 2026-09-05 after the first apply put 10 false positives into the bank.**
The naive word match is wrong. Do not use it.

Trap school defines the trap as an *inverted* question: three of the four options are
true statements, and the eye grabs a true one, which is exactly wrong. So the test is
not "does the stem contain a negative word", it is **"is the question inverted".**

Two uses of "not" look identical to a regex and are completely different:

| Use | Example | Trap? |
|---|---|---|
| **Operator**: pick the false or absent one | "Which of the following would **not** normally appear in a business case?" | Yes |
| **Contrastive**: still pick a true statement | "What does leadership produce that formal authority alone does **not**?" | No |
| **Scenario constraint**: describes the situation | "...when the completion date must **not** move" | No |

Tag only the operator case. Concretely, require the negative word to govern the
question's own demand, which in this bank means one of:

- `which ... is/are not` , `which ... would not` , `which ... does not`
- `... is false` , `... is incorrect`
- `least` , `except`
- `not a genuine` / `not a real` difference

**Reject** when the negative appears in a trailing comparative clause (`that X does
not`, `but not in`, `alone does not`), in a scenario constraint (`must not`, `will not
fit`, `with no`), or when it heads a `Why can ... not` explanation question. All of
those still ask for a true statement.

These ten were tagged by the loose rule and have since been removed from the bank.
They are the regression set: a corrected detector must not re-propose any of them.

`PFQ-008`, `PFQ-035`, `PFQP-1-1-5`, `PFQP-10-1-4`, `PFQP-4-1-4`, `PFQP-6-1-3`,
`PFQP-6-1-4`, `PFQP-6-4-2`, `PFQP-7-6-2`, `PFQP-7-6-3`

Expected yield after tightening: 22 questions, all of which are already tagged in the
bank. A correct re-run therefore proposes **zero** new negative stems.

### 2b. Multi-select combination → tag `multi_select`

Deterministic, no heuristic needed: `type = 'multi_select'` OR `items IS NOT NULL`.

All 5 are already tagged, so this should be a no-op that confirms the rule. If it finds
untagged rows, that is a data integrity finding worth reporting separately.

**Also report the shortfall.** `PFQ_RESEARCH.md` §4 puts numbered-list multi-selects at
**6 of 60 (10%)** of the real paper. The bank has 5 of 306, which is 1.6%. If the mock
is meant to be Surpass-faithful, this gap makes it materially easier than the real
exam. Include this as a headline number in the report summary. Do not try to fix it
here, it is a content authoring ticket, not a tagging one.

### 2c. Absolutes → RETIRED, do not implement

**Decided 2026-09-05 after reviewing the first `--report` run. Remove this detector.**

It produced 85 candidates of which roughly 14 were genuine. The problem is not the
regex, it is the category: an absolute word can be an overclaim that makes the option
wrong, or it can be plain description in an option that is wrong for an unrelated
reason, and nothing short of semantics separates those. "recording the current version
of every project document" is a *correct* description of configuration management being
used as a near-miss distractor.

`trap-school-content.ts` describes absolutes as "a tie-breaker, not a rule. Use it when
you're down to two options and out of time." That is a strategy the learner applies, not
a property of a question, so there is nothing to tag. It also has no measured frequency
where traps 1 and 2 both do, and `PFQ_RESEARCH.md` never mentions it.

Actions: delete the absolutes detection branch, drop `absolutes` from
`TRAP_TAG_TO_MODULE` in `src/lib/pfq/trap-tags.ts`, and stop emitting these proposals so
a re-run does not regenerate 85 rows that will only be rejected again. Leave the Trap 4
section in `trap-school-content.ts` alone, it stays as reading material.

### 2d. Near-miss definition → tag `near_miss`

The highest-value trap and the least mechanical. `PFQ_TRAP_SCHOOL.traps` includes a
`pairs` array of `{ confused, holdApart }`, risk/issue, programme/portfolio and so on.

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
    "by_trap": { "near_miss": 0, "negative_stem": 0, "multi_select": 0 },
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

## 5. The vocabulary mismatch, fix it once, here

`traps[]` uses `negative_stem` and `multi_select`. `PFQ_TRAP_SCHOOL` uses module ids
`negative`, `combination`, `near_miss`, `absolutes`. These disagree, and section 3b of
the parity prompt needs to map between them.

Export a single constant that both this script and the callout component import:

```ts
// src/lib/pfq/trap-tags.ts
export const TRAP_TAG_TO_MODULE = {
  near_miss: "near_miss",
  negative_stem: "negative",
  multi_select: "combination",
} as const;
// Declaration order is the callout priority: near_miss wins over negative_stem,
// which wins over multi_select. See section 3b of the parity prompt.
// `absolutes` is deliberately absent, see section 2c.
export type PfqTrapTag = keyof typeof TRAP_TAG_TO_MODULE;
```

Do not rename the existing DB tag values, 29 rows already use them and renaming buys
nothing. Map instead.

## 5a. Review outcome of the first report run, 2026-09-05

The first `--report` run has been generated and reviewed. `scripts/pfq/trap-backfill-report.json`
on disk already carries the review decisions; the pre-review copy is at
`scripts/pfq/trap-backfill-report.pre-review.json`.

| Trap | Proposed | Approved | Rejected | Net after correction |
|---|---|---|---|---|
| `negative_stem` | 8 new | 8, then 5 reverted | 0 | **22** |
| `multi_select` | 0 | 0 | 0 | **5** |
| `near_miss` | 34 | 32 | 2 | **32** |
| `absolutes` | 85 | 0 | 85 (category retired) | **0** |

**Post-apply correction, 2026-09-05.** The apply landed 32 negative stems, of which 10
were contrastive rather than inverted (5 added by this run, 5 already in the bank from
before). All 10 were removed, see the regression set in section 2a. The loose rule in
2a is what caused it and has been rewritten.

The two rejected near-misses are `PFQP-4-11-4` and `PFQP-7-6-5`: in both the matched
pair terms are incidental distractors and the stem is not a discrimination question.

Verified live state after the correction: **59 tags across 58 of 306 questions (19%)**.
`PFQP-7-7-2` is the only question carrying two tags, so it is the single test case for
the callout priority rule in section 3b of the parity prompt.

Per objective (tagged / total): LO1 8/28, LO2 3/22, LO3 1/7, LO4 5/56, LO5 12/42,
LO6 4/30, LO7 14/42, LO8 7/30, LO9 2/26, LO10 2/23.

LO7 at 33% and LO5 at 29% are the two worth demoing the callouts on. LO4 at 9% and
LO9 at 8% are thin, and LO3 has only seven questions in total so there is nothing more
to find there.

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
