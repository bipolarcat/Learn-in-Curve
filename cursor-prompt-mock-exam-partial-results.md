# Cursor prompt — mock exam: show real results for incomplete sittings

**Written 2026-08-07 by Claude. Every claim below was verified against the live
`learn-in-curve` Supabase project and the current repo — not inferred from
docs.** Read `OPERATIONS.md` before touching `exam_sessions` or `attempts`.

---

## The bug, precisely

Two real sessions on `sim.samaar@yahoo.in` (verified in prod):

| session | exam_set | status | attempts | part 1 submitted | total_score | max_score | finalized_at |
|---|---|---|---|---|---|---|---|
| `6491b66a-70c0-40c9-ad11-ffe920bb2eab` | 1 | `abandoned` | 0 | no | 0 | **null** | **null** |
| `75b4db0f-ff95-4d24-9c16-529254827039` | 2 | `abandoned` | **14** | **yes** | **0** | **null** | **null** |

Session 2 is the real problem. The learner submitted Part 1 with 14 answered
questions — 10 multiple choice (1 correct, 1 mark earned of 10 available), 2
select-from-list (0 of 4), 2 short answer (0 of 4, **never graded**). The break
expired, and the session was flipped to `abandoned` with `total_score = 0`.
Genuine work, scored zero, results hidden.

**Root cause chain — three separate defects, all needed for the fix:**

1. **`abandonSession()` in `src/lib/pmq/mock-domain.ts` (~line 240)** hard-writes
   `total_score: 0, passed: false` and never scores existing attempts, never
   sets `max_score`, never sets `finalized_at`. The code comment at
   mock-domain.ts ~line 294 already anticipates this exact request: *"If partial
   credit for a completed part is wanted instead, this is the place to change
   it."* That is now the requirement.
2. **`getFinalizedMockReview()` in `src/lib/pmq/mock-actions.ts` line 807**
   gates on `session.status !== "finalized"` and returns the string
   `"Answers are available only after finalization."` Since expiry produces
   `abandoned`, never `finalized`, the review is permanently unreachable.
3. **The scoring loop is trapped inside `finalizeMockExam`**
   (`mock-actions.ts` lines 740–766). Nothing else can score a session, so
   expiry has no way to produce a number even if it wanted to.

**Do not "fix" this by making expiry call `finalizeMockExam`.** That function
issues a certificate when `passed` is true (lines 783–796). An incomplete
sitting must never be able to produce a certificate.

---

## Design decisions — follow these, don't re-litigate them

**D1. New status value `expired`.** Verified: `exam_sessions_status_check`
currently allows exactly `active, break, self_assessing, grading, finalized,
abandoned`. A migration is required.

Why a new value rather than reusing `abandoned`: after this change a session can
be terminal *and* carry a real score, so the status has to say *why* it ended.
`abandoned` = the learner pressed "abandon exam". `expired` = a clock ran out.
They deserve different copy, and today `mock-domain.ts` ~line 114 already
mislabels a manual abandon as "Time expired", which this fixes as a side effect.

**D2. Both terminal states get scored.** Expired and abandoned alike. The
principle Sim gave: *if the exam was left midway it must clearly state the
result and the status.* Zero answers legitimately scores 0 — but as a real
result, not a hidden one.

**D3. Score is always out of the full paper (`config.total_marks`, 90).** Do not
scale to "out of what was attempted" — that would flatter the learner and make
scores incomparable between sittings. Show the part breakdown alongside it so
the honest context is visible.

**D4. An incomplete sitting can never pass, and never issues a certificate.**
`passed` may only be true when **both** `part_1_submitted_at` and
`part_2_submitted_at` are set. Everything else is `passed: false` regardless of
marks earned. Certificate insertion stays exclusively inside `finalizeMockExam`.

**D5. `finalized_at` stops being the "results are ready" signal.** It currently
does double duty and that is what hides the results. Introduce an explicit
concept — a session is readable when `status` is one of
`finalized | expired | abandoned`. Set `finalized_at` on expiry too (it means
"scoring completed at", and leaving it null is what broke the review gate).

---

## Task 1 — Migration

New migration file. Add `expired` to the status constraint:

```sql
alter table public.exam_sessions
  drop constraint exam_sessions_status_check;

alter table public.exam_sessions
  add constraint exam_sessions_status_check
  check (status = any (array[
    'active','break','self_assessing','grading',
    'finalized','abandoned','expired'
  ]));
```

**Then grep the whole repo for every `.in("status", [...])` and every
`status === "abandoned"` / `"finalized"` comparison and decide each one
explicitly.** Known sites that must be updated — verify there are no others:

- `mock-actions.ts` line 199 — the "already have an active session" guard.
  `expired` is terminal, so it must **not** appear here.
- `mock-actions.ts` line 883 (`abandonMockExamSession`) — the `.in()` of
  statuses eligible to be abandoned. Terminal states excluded.
- `mock-domain.ts` line 133 and line 144 — `isTerminal` and the action label.
  Both must include `expired`.
- `mock-domain.ts` ~line 111 — the status label map. `expired` → `"Time
  expired"`, and `abandoned` → change to `"Ended early"` (it currently
  incorrectly reads "Time expired").
- `mock-domain.ts` `canFinalizeStatus` (line 391) — `expired` must **not** be
  finalizable.
- `MockExamRunner.tsx` line 104 — the "show the result screen" branch. Must
  include `expired`.

---

## Task 2 — Extract the scorer

Pull the loop at `mock-actions.ts` lines 748–763 into a reusable function.
Suggested home: `src/lib/pmq/mock-domain.ts` (or a new
`src/lib/pmq/mock-scoring.ts` if importing Supabase types there is awkward).

```ts
export type MockScoreBreakdown = {
  totalScore: number;
  maxScore: number;
  partOne: { earned: number; available: number; answered: number };
  partTwo: { earned: number; available: number; answered: number };
  /** Written answers submitted but with grading_status not 'graded'. */
  ungradedWritten: number;
};
```

Behaviour must match the existing loop exactly so finalized scores don't shift:
objective questions award `question.marks` when `is_correct`, written questions
award `ai_score ?? 0`. **Refactor `finalizeMockExam` to call this too** — one
scorer, or the two paths will drift apart within a month.

`available` per part comes from the questions in `config_snapshot.question_ids`,
not from the attempts — otherwise an unanswered question silently vanishes from
the denominator.

---

## Task 3 — Replace `abandonSession` with `expireSession`

In `mock-domain.ts`. New behaviour:

1. Grade any submitted-but-ungraded written answers by calling the existing
   `gradeWrittenAttempts`. **Wrap it in try/catch.** If grading fails or times
   out, continue with objective-only scoring and leave those attempts at
   `grading_status = 'error'` — **never leave the session stuck in a non-terminal
   state because grading failed.** A session that can't reach a terminal state
   is a worse bug than an unmarked short answer.
2. Score via the Task 2 function.
3. Write: `status` (`'expired'` or `'abandoned'` per caller), `submitted_at`,
   `finalized_at`, `total_score`, `max_score: config.total_marks`,
   `passed` per **D4**.
4. Never touch `certificates`.

**Performance note, and it matters:** `expireBreakIfNeeded` is called from
`getActiveExamSession` and `getMockExamSetSummaries` — i.e. on page load. AI
grading on a page load is slow. Acceptable because it happens at most once per
session and the alternative (a cron) doesn't exist in this app. But put a
sensible timeout on the grading call and let it fail open per step 1.

Keep the existing three expiry triggers exactly as they are (180-minute
backstop, Part 1 deadline, Part 2 deadline, break expiry) — that logic was
fixed on 2026-07-29 and is correct. **Only the terminal write changes.**

---

## Task 4 — Open the review gate

`mock-actions.ts` line 807. Replace the `!== "finalized"` check:

```ts
const READABLE_STATUSES = ["finalized", "expired", "abandoned"] as const;
if (!session || !READABLE_STATUSES.includes(session.status)) {
  return { error: "Results aren't ready for this exam yet." };
}
```

Note the message change too — the old string was also just wrong for a session
that will never be finalized.

Unanswered questions already fall through correctly: `attemptByQuestion.get()`
returns undefined and `submittedAnswer` becomes `null`. Confirm the review UI
renders that as "Not answered" rather than blank.

---

## Task 5 — Results UI (`MockExamRunner.tsx`)

**5a. Button copy — Sim asked for this specifically.** Lines ~1196 and ~1213:
`"Review all 40 answers"` → `"Review answers"`. Both the `aria-label` and the
visible text. The hardcoded 40 was already wrong for a partial sitting.

**5b. Status-aware header.** Line ~1168 hardcodes
`"Final result · attempt complete"`. Make it reflect reality:

- `finalized` → `Final result · attempt complete`
- `expired` → `Incomplete · time expired`
- `abandoned` → `Incomplete · ended early`

**5c. Show the breakdown.** Under the `X / 90` figure, for non-finalized
statuses, render the part split — e.g. *"Part 1: 1 / 45 (14 of 20 answered) ·
Part 2: not attempted"*. This is the difference between a number that looks
broken and a number the learner understands.

**5d. Verdict line.** `passed ? "Pass" : "Refer - keep going."` is misleading on
an incomplete paper — it implies they were assessed and fell short. For
`expired` / `abandoned`, replace with something accurate:
*"Not assessed — this sitting wasn't completed."*

**5e.** If `ungradedWritten > 0`, say so plainly: *"2 written answers couldn't be
marked and scored 0."* Silent zeroes are how users lose trust in a score.

---

## Task 6 — Repair the two live sessions

**Only after Tasks 1–5 are merged and deployed.** Do not hand-write scores into
these rows — let the fixed code produce them, so the repair and the runtime path
can't disagree.

Both rows are terminal already, so the new expiry logic won't pick them up.
Write a **one-off, idempotent** backfill script (not a migration, not a
long-lived route) that, for sessions where
`status = 'abandoned' and finalized_at is null`:

1. Sets `status = 'expired'` where the session ended on a clock rather than a
   user action — for these two, `submitted_at` is hours after `deadline_at` /
   `break_ends_at`, so both are genuine expiries.
2. Runs the Task 2/3 scoring path.

Expected outcomes (verify against these — if you get different numbers, stop and
report rather than shipping):

- `6491b66a…` (exam 1): 0 attempts → `total_score = 0`, `max_score = 90`,
  `passed = false`, status `expired`. Results page shows a real zero.
- `75b4db0f…` (exam 2): objective marks earned = **1** (one correct multiple
  choice). Plus whatever the 2 short answers grade to. `max_score = 90`,
  `passed = false`, status `expired`. Part 1 breakdown should read 14 of 20
  answered.

Run against these two rows only — scope the script by `user_id` for the first
run, confirm the numbers, then decide whether to widen it. Per `OPERATIONS.md`,
cross-check the account with
`select id, email from auth.users where email ilike '%sim.samaar%'` first.

---

## Task 7 — Legal doc date enforcement

Sim's requirement: the "Last updated" date must change whenever a legal doc
changes. `PRIVACY_POLICY.md` line 77 already *promises* users this happens, so a
miss is a false statement in a published policy, not just untidiness. It was
missed today (policy edited, date left at 4 August; corrected by hand to
7 August).

Make it mechanical, in `scripts/git-hooks/pre-commit` alongside the existing
version bump:

- If any file under `legal/` is staged, check that the staged version's
  `Last updated:` line differs from `HEAD`'s.
- If it doesn't, **either** auto-update it to today's date in `D Month YYYY`
  format (matching the existing style) and re-stage, **or** abort the commit
  with a clear message. Prefer auto-update — a hook that blocks gets bypassed;
  a hook that fixes gets kept.
- Same treatment for `COOKIE_NOTICE.md` and any other dated doc in `legal/`.
- Respect the existing `LIC_SKIP_VERSION`-style escape hatch pattern for the
  rare intentional case (e.g. fixing a typo in a heading).

---

## Definition of done

- `npm run build` passes.
- Grep confirms no remaining `status === "abandoned"` or `.in("status", …)` site
  was left un-reviewed for the new `expired` value.
- A session expired with zero answers shows `0 / 90`, status "time expired", and
  the review opens showing every question as unanswered.
- A session expired after Part 1 shows the real earned marks, the part
  breakdown, and the review opens showing the submitted answers.
- No certificate row is created for any `expired` or `abandoned` session —
  check `public.certificates` after testing.
- Finalized-exam scores are **unchanged** by the scorer refactor. Verify against
  an existing finalized session if one exists before/after.
- Editing any `legal/*.md` file and committing bumps its `Last updated:` date.

## Out of scope

- Self-serve retake. Still admin-only per `OPERATIONS.md`.
- Any change to the three expiry triggers or the 180-minute backstop.
- Changing the pass mark or `config_snapshot` structure.
