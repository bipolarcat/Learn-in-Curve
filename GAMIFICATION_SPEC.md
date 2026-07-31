# Gamification Spec — Phase A (XP, streaks, feedback, progress ring)

Scope decision made 2026-07-03 (see `BUSINESS_STATE.md` decision log): full Duolingo-style
gamification, built in two phases. **This doc covers Phase A only** — the XP/streak
backend loop plus visible feedback on the real LO quiz. Phase B (restructuring the LO
page from one long scroll into a Duolingo-style bite-sized card flow) is intentionally
**not** in this doc — it's an information-architecture change touching every content
block on the page (definitions, core content, worked example, misconceptions, exam
technique, memory aids, recap, further reading), not just a gamification add-on, and
needs its own design pass before a build spec exists. Don't start it opportunistically
inside this build.

**Explicitly excluded from V1, not forgotten:** badges/achievements (no unlock criteria
or art designed) and leaderboards (no social/friends model exists, and the product
thesis so far is individual exam prep, not competitive). These stay open in
`BUSINESS_STATE.md`.

## 0. What already exists — don't rebuild this

`QuizRunner.tsx`'s `McqQuestion`/`DropdownQuestion` already implement correct/incorrect
color feedback (olive/rust, shake animation on wrong answer) — this is the same visual
language as the homepage's `QuizDemo.tsx`. The gap is XP, streaks, and a progress
indicator, not the base feedback colors.

## 1. Database — done

Migration `add_user_course_stats_gamification` already applied directly to the
`learn-in-curve` Supabase project (`dbjoimidfbftammchnql`). New table:

```sql
public.user_course_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  total_xp integer not null default 0,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_activity_date date,
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
)
```

RLS enabled: users can select/insert/update only their own row (`auth.uid() = user_id`).
No new audit/event table for V1 — deliberately kept to one row per user per course
rather than a `xp_events` log, since there's no badge/achievement history feature yet
that would need it. Revisit if that changes.

## 2. XP awarding rule

| Question type | Correct | Incorrect | Notes |
|---|---|---|---|
| `multiple_choice` | +10 XP | +0 XP | matches the existing homepage `QuizDemo` amount, for consistency |
| `select_from_list` | +10 XP | +0 XP | same rule as MCQ |
| `long_answer` / `short_answer` (reveal-answer, ungraded) | +2 XP flat on reveal | n/a | `is_correct` is always `null` for these — can't grade automatically, so award a small flat amount for engagement rather than nothing. This is a judgment call, flag if it feels wrong in practice. |

No XP penalty for wrong answers — don't punish attempts, matches Duolingo's actual
mechanic (people remember it as generous, not punitive).

## 3. Streak logic

One streak "tick" per **calendar day with at least one attempt**, not per question.
Server-side (in the same action that awards XP), on every `submitQuizAttempt` call:

- Read `user_course_stats.last_activity_date` for this `(user_id, course_id)`.
- If `last_activity_date` is today (UTC) → no streak change, just add XP.
- If `last_activity_date` is yesterday (UTC) → `current_streak += 1`, update
  `longest_streak` if exceeded, set `last_activity_date = today`.
- If `last_activity_date` is null or older than yesterday → `current_streak = 1`,
  `last_activity_date = today`.

**Known imprecision, accepted for V1:** streak day-boundary uses UTC, not the user's
local timezone. A user studying at 11pm local time near midnight UTC could see a streak
not tick when they'd expect it to. Not worth solving until there's real usage data
showing it's actually a problem — flag, don't block on it.

## 4. Server action changes — `src/lib/pmq/actions.ts`

Extend `submitQuizAttempt`:

1. After the existing `attempts` insert succeeds, compute `xpAwarded` per the table in
   section 2 (need `question.question_type` — already available via the `question_id`
   lookup that `maybeMarkQuizComplete` already does; reuse that fetch rather than
   querying `questions` twice).
2. Upsert `user_course_stats` for `(user.id, input.courseId)`: increment `total_xp` by
   `xpAwarded`, apply the streak logic from section 3.
3. Change the return type from `{ ok: true }` to
   `{ ok: true, xpAwarded, totalXp, currentStreak }` so the client can animate without
   a full page reload. Keep the `{ error }` shape unchanged for the existing failure
   path.

Add a new query — `src/lib/pmq/queries.ts` — `getUserCourseStats(supabase, userId, courseId)`
returning the current row (or zeroed defaults if none exists yet, since the row won't
exist until the first attempt). Used for initial render state on the LO page.

## 5. Component changes

**New: `src/components/pmq/XpStreakBar.tsx`** (client component). Small pill/bar
showing total XP (Space Mono, gold-on-ink per `DESIGN.md`'s "stamped" accent use) and a
streak count with a flame or similar icon. Accepts `initialXp` / `initialStreak` props,
holds local state, exposes a way for its parent to bump it (simplest: parent owns the
state and passes `xp`/`streak` down as props, this component is presentational only —
avoids duplicating state).

**Port `QuizDemo.tsx`'s fly-up animation.** The `spawnFlyXP` pattern (position a
"+N XP" span near the clicked button, animate up and fade via the existing
`animate-fly-up` keyframe, clear after ~1s) already exists and works — reuse it as-is
inside `QuizRunner.tsx`'s question components rather than reinventing it.

**Modify `QuizRunner.tsx`:**
- Accept `initialXp: number` and `initialStreak: number` props from the LO page.
- Lift XP/streak into local state at the `QuizRunner` level (not per-question) since
  it's shared across all questions on the page.
- Pass an `onCorrect(xpAwarded: number, btn: HTMLButtonElement)` callback down into
  `McqQuestion` / `DropdownQuestion` / `RevealAnswerQuestion`, called after a successful
  `submitQuizAttempt` response, which updates local state and triggers the fly-up.
- Render `<XpStreakBar xp={xp} streak={streak} />` at the top of the quiz section.

**New: `src/components/pmq/LoProgressRing.tsx`.** SVG ring (or simple radial
progress — match `DESIGN.md`'s existing "journey path" visual language rather than
introducing a new unrelated style) showing % of this LO's quiz questions answered.
Render it in the LO page `<header>` next to the existing `LO {n}` / `Day {n}` badges.

Data needed: count of distinct `question_id`s this user has attempted in this section
vs. `questions.length` for the section. Add a lightweight
`getSectionAttemptCount(supabase, userId, sectionId)` query in `queries.ts` rather than
fetching full attempt rows — this is a `count(distinct question_id)`, not the join
`maybeMarkQuizComplete` already does server-side for completion-marking.

**LO page (`src/app/courses/pmq-in-5-days/lo/[loNumber]/page.tsx`) changes:**
- Fetch `getUserCourseStats` and `getSectionAttemptCount` alongside the existing
  `getSectionProgress` call (same `Promise.all`, only runs when `user` exists — mirror
  the existing pattern).
- Pass `initialXp`/`initialStreak` into `<QuizRunner>`.
- Render `<LoProgressRing>` in the header section.

## 6. Definition of done

- `npm run dev` clean, no console errors.
- Answering a question correctly shows the fly-up "+N XP" and updates the XP pill
  immediately, no page reload.
- Refreshing the page after answering shows the same cumulative XP/streak — confirms
  it's actually persisted, not just client-side state.
- Answering two questions on the same calendar day increments XP twice but the streak
  only once.
- `LoProgressRing` reflects the real attempted-question count, and reads 100% when
  `section_progress.quiz_completed_at` is set.
- Existing MCQ/Dropdown/RevealAnswer correctness logic, `attempts` insert, and
  `section_progress` checkpoint flow are unchanged — this is additive, not a rewrite of
  the quiz logic itself.
- No regression to the AI tutor panel or paywall — untouched by this build.

## 7. After Phase A lands

Phase B (card-based LO flow) needs its own spec written the same way
`PMQ_NATIVE_MIGRATION.md` and `REBUILD_PLAN.md` were — a full pass through what breaks
into "screens," how the quiz interleaves with content, and how navigation between
screens works — before handing to Cursor. Don't start it in the same session as Phase A.
