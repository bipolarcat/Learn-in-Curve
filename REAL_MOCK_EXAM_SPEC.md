# Real Mock Exam Spec (LIC-40)

**Implementation status — 2026-07-18:** the prerequisite integrity migration is
live and the four-paper code contract is built. The interface now uses a
server-enforced two-part state machine: 75 minutes per part, a persisted
optional 30-minute break, a 40-question status/flag rail, reversible answers
within the active part, irreversible part submission, leave/resume, one
lifetime attempt per paper and a read-only finalized answer review. Practise
and mock questions share presentation-only MCQ/inline-dropdown fields without
shipping answer keys to the active exam client. Release remains gated on
applying `20260718220000_mock_exam_sets.sql` and
`20260718234500_mock_exam_parts_navigation.sql`, loading and validating Exams
2–4, and closing the Gemini DPA/transfer safeguard.

**Tiering confirmed 2026-07-18:** free users get **Mock Exam 1**, the complete
40-question, 90-mark paper. Objective questions are auto-marked and learners
self-assess written responses against stored model answers and marking guides.
Paid users keep Exam 1 and additionally get **Mock Exams 2–4**, three distinct
40-question papers whose written responses are graded by Gemini. Paid is
additive, not a replacement. The existing `ai_tutor` entitlement unlocks all
three Pro papers; only one Pro paper can be active at a time.

Part of the £9.99 Premium bundle (price updated 2026-07-14). Depends on
`AI_TUTOR_BACKEND_SPEC.md`'s API-call pattern for grading, and on the same
fair-usage cap (§4 of that spec) if AI marking is counted against it — flag
for Sim, not yet decided whether mock-exam grading calls count toward the
tutor's £2.50 cap or have their own allowance. Written 2026-07-08, Sim to
review before Cursor builds.

## 0. What already exists — don't rebuild this

More of this is already in place than the ticket implied:

- `questions.question_type` already includes `short_answer` and `long_answer` in
  its check constraint — the schema anticipated this.
- `questions.marking_guide` and `questions.model_answer` columns already exist
  (currently empty for most rows) — exactly what an AI grader needs as input.
- `attempts.ai_score` (numeric) and `attempts.ai_feedback` (text) columns already
  exist, unused until now — this is where graded results get written.
- `exam_sessions` table (started_at, submitted_at, time_limit_minutes,
  total_score, max_score, passed) and `courses.exam_config` jsonb (mock exam
  marks/timing, case-study scenario) already exist per the 2026-07-04 native mock
  exam migration (`PMQ_NATIVE_MIGRATION.md` §7).

**What's actually missing:** live application of the exam-set migration and the
prepared Exam 2–4 content. The written-answer UI, self-assessment path, Gemini
grading, persisted state and selector are built.

## 1. Entitlement gate

Per the 2026-07-08 decision, this is bundled into the same £9.99 unlock as the AI
tutor and unlimited quiz generation — **not** a separate purchase. Reuse the
existing `feature_entitlements` row (`feature = 'ai_tutor'`) as the single gate
for all three paid perks rather than adding a new feature value or table. Cheapest
option, no migration needed, matches the "bundle not stacked paygates" reasoning
already logged. If Sim later wants to sell these separately, that's a schema
change to revisit then, not now.

## 2. Question content — the real dependency

This is the part that actually takes time. For each LO (or a representative
subset — confirm scope with Sim, doesn't need to be all 24 for v1), author:

- 1-2 short-answer and/or long-form questions per LO, `context = 'mock_exam'`,
  `mock_suitable = true`.
- A `marking_guide` (what a grader should check for) and `model_answer` (a
  reference answer) for each — these feed directly into the AI grading prompt in
  §3. Source strictly from each LO's own structured content (key_definitions,
  core_content, exam_technique), same sourcing rule already established for the
  MCQ bank (2026-07-02 decision log) — not invented or pulled from general PM
  knowledge.

Flag this to Sim explicitly: this is a content-authoring task of similar size to
LIC-28's quiz audit, not a quick add. Can run in parallel with the UI/grading
build, doesn't block it (build against a handful of seeded questions first, fill
out the rest of the bank after).

## 3. AI grading — reuse the LIC-42 pattern

New server action or API route (`src/app/api/exam/grade/route.ts` or a server
action in `actions.ts`, match whichever pattern LIC-42 lands on for consistency).
On submission of a short/long-form answer:

1. Build a grading prompt: question `prompt`, `marking_guide`, `model_answer`,
   `marks` (max score), and the user's `submitted_answer`.
2. Call the Gemini API (same client/env setup as LIC-42 — don't duplicate the
   integration, extract a shared `callTutorModel`-style helper if both land in the
   same session) asking for a numeric score out of `marks` plus short feedback
   text, structured output (JSON mode or a tightly constrained prompt — avoid
   free-text parsing that can break).
3. Write `ai_score` and `ai_feedback` to the `attempts` row.
4. Roll graded scores into `exam_sessions.total_score`/`max_score`/`passed` using
   the existing `courses.pass_mark_percent` (default 70) once all questions in the
   session are graded.

**Cost note, already flagged in the decision log:** unlike the pre-generated quiz
pool, this is a live API call per submission — same cost category as the AI
tutor. Grading only fires for entitled (paid) users, per §1's gate — don't grade
free-tier attempts.

## 4. Frontend

The course overview shows one free Exam 1 card and separate Exam 2–4 rows with
Coming soon, Start, Resume, Completed/Refer or Passed states. Exam 1 includes
the written-answer textarea and moves into a persisted self-assessment phase
after the timer. Exams 2–4 use the same question UI but move into Gemini grading.
Unavailable or partial papers never start, and while one Pro paper is open the
other two remain disabled.

Each paper is split into two locked 20-question parts. A visible rail shows all
40 questions, the break boundary, answered/unanswered/flagged/current states and
which part is locked. Learners can revisit and update answers only in the active
part. Each part has a fixed 75-minute server deadline; leaving the page does not
pause it. Part 1 submission starts an optional persisted 30-minute break, after
which Part 2 starts automatically. Finalized papers reopen directly in a
read-only question-by-question review with the learner's answer, correct/model
answer, marking guide and marker feedback.

## 5. Definition of done

- Free users can complete all 40 Exam 1 questions and securely self-score every
  submitted written response before finalization.
- Paid users can select a ready Exam 2, 3 or 4, but cannot open two Pro sessions
  simultaneously.
- Submitting a written answer returns a real AI-generated score + feedback,
  written to `attempts.ai_score`/`ai_feedback`.
- `exam_sessions.total_score`/`passed` correctly accounts for graded written
  answers alongside MCQ/dropdown scoring.
- Each paper can be started only once; the database, server action and overview
  state all enforce the same lifetime-attempt rule.
- Part deadlines, navigation position and flags survive reloads; submitted or
  timed-out parts reject all later answer mutations.
- Finalized sessions reopen in the complete 40-question review and never expose
  a new Start action.
- At least a handful of real, sourced questions exist per §2 before this is
  considered content-complete — not just the mechanism working on stub data.

## 6. Open questions for Sim

- Full 24-LO question bank now, or a smaller v1 subset?
- Locked-but-visible vs. hidden entirely for free-tier users mid-exam (§4).
- Confirm reusing the single `ai_tutor` entitlement flag rather than a distinct
  one — this is a one-way door once real purchases start happening.
