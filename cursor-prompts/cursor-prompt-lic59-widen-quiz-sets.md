# Cursor prompt: widen LO1 practice quiz from 3 sets to 7

**Linear:** LIC-59
**Data status:** Already done — do not touch Supabase. Skip straight to the code.

## What's already true in the database

`questions` table, `learning_objective = '1a, 1b, 1c, 1d'` (LO1), now has 75 rows across 7 `context` values:

| context | count | intended set |
|---|---|---|
| `practice_quiz` | 11 | Set 1 (free) |
| `quiz_set_2` | 10 | Set 2 (paid) |
| `quiz_set_3` | 10 | Set 3 (paid) |
| `quiz_set_4` | 10 | Set 4 (paid) |
| `quiz_set_5` | 10 | Set 5 (paid) |
| `quiz_set_6` | 10 | Set 6 (paid) |
| `quiz_set_7` | 14 | Set 7 (paid) |

The `questions_context_check` DB constraint has already been widened to allow `quiz_set_4` through `quiz_set_7` (was previously capped at `quiz_set_2`/`quiz_set_3`). No migration needed on your end.

This is LO1-only for now — the other 23 LOs are still on 3 sets (`practice_quiz`/`quiz_set_2`/`quiz_set_3`) and should keep working exactly as before. **Do not hardcode "7" as a global constant** — derive set count from what's actually in the DB for a given LO, since other LOs will get expanded later with different counts.

## The problem

Two files hardcode exactly 3 sets:

### `src/lib/pmq/actions.ts` — `getQuizSet()`
```ts
export async function getQuizSet(input: {
  loNumber: number;
  setNumber: 2 | 3;   // <-- hardcoded union, only supports sets 2 and 3
}): ...
  const context = input.setNumber === 2 ? "quiz_set_2" : "quiz_set_3";  // <-- binary branch
```
Needs to accept `setNumber: 2 | 3 | 4 | 5 | 6 | 7` (or just `number`, validated at runtime) and map to `` `quiz_set_${setNumber}` `` generically instead of a hardcoded ternary.

### `src/components/pmq/PracticeQuizSection.tsx`
Hardcodes three separate pieces of state (`set1Visible`, `set2Questions`, `set3Questions`), a `setsUnlocked` calculation that only sums three things, a `setNumber: 2 | 3` local type, an `allPaidSetsUnlocked` check gated on `set2Questions && set3Questions`, copy strings `` `${setsUnlocked}/3 sets unlocked` `` and "Want two more quiz sets for this LO?", and three separate hardcoded `<QuizRunner>` blocks for sets 1/2/3.

Needs to become count-driven: fetch how many extra sets exist for this LO (either pass a `totalSets` prop down from the server component that already knows the LO, or have `getQuizSet`/a new query return how many sets exist), track unlocked sets as an array/map keyed by set number instead of three named variables, and generate the "Generate quiz" progression loop and `<QuizRunner>` blocks from that count instead of three copy-pasted blocks.

## What to check while you're in there

- Wherever the LO page / server component currently passes `set1Questions` into `PracticeQuizSection`, check if there's a natural place to also pass the total set count for that LO (e.g. a count query on `questions` grouped by `context`, or a small lookup). Don't assume 7 — for every LO except LO1 right now, it should still resolve to 3.
- `src/lib/pmq/queries.ts` — the initial page load only reads `context = "practice_quiz"` (Set 1), so this file shouldn't need logic changes, but grep it for any other hardcoded set-count assumptions just in case.
- Grep the rest of `src/` for other hardcoded "3 sets" / "/3" references tied to quiz sets specifically (e.g. `src/components/SiteHeaderControls.tsx`, `src/lib/tutor/course-completion-summary.ts`, `src/lib/pmq/content-fallback.ts`) — these showed up in a broad search for "set" but weren't confirmed relevant; check each one before assuming it needs changing.
- Once done, manually verify LO1's practice quiz section actually offers 7 "Generate another quiz" clicks and that all 4 new sets render real questions (not the "content may still need migrating" error state) — that error message exists in the current code specifically for this failure mode.

## Why this exists

Sim generated 44 new, deduped MCQs for LO1 via NotebookLM to make the premium bundle's quiz offering meaningfully bigger (was 3 sets of 10, now 7 sets for LO1). This is the UI/logic half of that work — Claude handled the content generation, dedup analysis, and Supabase insert; this file is the code half, per the usual Claude-plans / Cursor-executes split. Report back in `BUSINESS_STATE.md` or update LIC-59 directly once done — Sim will verify against actual repo state before marking it done, same as always.
