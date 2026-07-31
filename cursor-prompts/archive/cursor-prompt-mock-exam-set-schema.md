# Cursor prompt: add "which mock exam" as a schema dimension

## Why this exists

We're expanding from 1 mock exam (the current live `context = 'mock_exam'` pool, 40 questions) to 4: the existing one stays as the free-tier, self-assessed exam, and 3 new AI-graded Pro-tier exams are being added (content fully drafted — see `MOCK_EXAM_2/3/4_WRITTEN_QUESTIONS_DRAFT.md` and `MOCK_EXAM_MCQ_DROPDOWN_SELECTION.md` at the project root, ~160 questions total once all four are counted).

**The blocker:** I checked `src/lib/pmq/mock-actions.ts` (`startMockExamSession`, `loadSessionQuestion`) and `src/lib/pmq/queries.ts` — every mock-exam question query is `.eq("context", "mock_exam")` with no further dimension. `getMockExamQuestions()` pulls the *entire* `context='mock_exam'` pool for the course, and `questionsForTier(allQuestions, tier)` just splits that single pool into `lite` (MCQ/dropdown only) vs `full` (all types). There is no `exam_set`, `exam_number`, or equivalent column anywhere — confirmed against the live schema too.

If new mock-exam-context questions are inserted without a schema change, `startMockExamSession('full')` will pull **all** `context='mock_exam'` rows into one session — meaning the "Full" exam balloons from 40 to 160 questions instead of the user picking one of 4 separate 40-question exams. This would also silently break the existing live exam the moment new content lands. **Do not insert the new question content until this lands.**

Separately (found in the same investigation): `supabase/migrations/20260718180000_mock_exam_integrity.sql` already exists locally and is unapplied — it adds `exam_sessions.tier/status/deadline_at/...` and `attempts.ai_*` columns that `mock-actions.ts` already depends on. That migration is unrelated to the exam-set problem below (it fixes lite/full session state, not which-of-4-exams), but it's also a prerequisite and should be reviewed/applied first, separately, since it's simpler and already written.

## What to build

1. **Schema**: add an `exam_set` (or `mock_exam_number`) column to `questions`, `smallint` or `text`, e.g. `1`/`2`/`3`/`4`, nullable for non-mock-exam contexts, `not null default 1` (or backfill to `1`) for existing `context='mock_exam'` rows so the live exam keeps working unchanged. Add a check constraint restricting to the valid range. Consider whether `exam_sessions` also needs an `exam_set` column (it currently scopes sessions by `(user_id, course_id, tier)` only — with 3 "full" exams to choose from, a user needs to be able to have/resume a specific exam-set's session, and the existing `exam_sessions_one_open_tier_uidx` unique index will need to become `(user_id, course_id, tier, exam_set)` or equivalent so a user can't open two Pro exams at once but *can* eventually take all 3).

2. **Query layer**: update `getMockExamQuestions()` (and any other `context='mock_exam'` query in `mock-actions.ts`/`queries.ts`) to filter by `exam_set` as well as `context`.

3. **Selection UI**: the Pro tier needs a way to pick which of the 3 exams to start (and see which they've already completed/passed) — currently there's only one "Start Full Mock Exam" entry point. Free tier's exam stays exactly as-is (exam_set 1, self-assessed, no AI grading path).

4. **Entitlement**: unchanged — still gated on the existing `feature_entitlements` / `ai_tutor` flag per `REAL_MOCK_EXAM_SPEC.md` §1, no new entitlement needed, all 3 Pro exams are covered by the one Pro unlock.

5. **Grading**: the AI grading path (`REAL_MOCK_EXAM_SPEC.md` §3) is per-question, not per-exam, so it shouldn't need changes — just confirm it isn't hardcoding any assumption about a single 40-question pool.

## What's already prepared and waiting on this

- `MOCK_EXAM_2_WRITTEN_QUESTIONS_DRAFT.md`, `MOCK_EXAM_3_WRITTEN_QUESTIONS_DRAFT.md`, `MOCK_EXAM_4_WRITTEN_QUESTIONS_DRAFT.md` — 11/11/12 long-form + 5/5/5 short-form questions per exam (written, AI-grading-ready marking guides).
- `MOCK_EXAM_MCQ_DROPDOWN_SELECTION.md` — 20 MCQ + 4/4/3 dropdown selected per exam from the existing practice question bank (via the `mock_suitable` flag + manual quality check), ready to be tagged with the new `exam_set` value and migrated once this lands.
- Final target once all 4 exams are live: 160 questions total (80 MCQ / 16 dropdown / 20 short-form / 44 long-form), split 40/40/40/40 across exam_set 1–4.

## Sequencing

1. Review and apply `20260718180000_mock_exam_integrity.sql` (separate, already-written, ready).
2. Build the `exam_set` schema + query + selection-UI change described above.
3. Once both are live, the question content in the three markdown files above gets tagged with `exam_set = 2/3/4` and migrated — that step should not require another code change, just data.

Flag any of this that seems wrong before starting — in particular whether `exam_sessions` needs the extra dimension or whether resuming/re-attempting logic can stay simpler than I've assumed.
