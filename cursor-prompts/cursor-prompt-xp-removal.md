# Cursor prompt — finish the XP removal (code)

**Written 2026-09-03 by Claude. Status: queued for Cursor.**

## Why this exists

XP was decided-removed on **2026-08-19** (see `FEATURES.md` item 6). The docs
were updated that day. **The code removal was never finished.** As of
2026-09-03 the XP write path is still live in production and still awarding
points — `neil.feve@wsp.com` signed up on 1 Sep and has 450 XP written against
their `user_course_stats` row.

`FEATURES.md` set its own test for whether the removal landed: *"If either of
those still mentions XP when you read this, the removal was not finished."*
That test currently fails.

`OPERATIONS.md` line 68 asserts *"XP is not a live feature — there's no XP
system to reset or preserve."* That statement is false and has been corrected
in the same pass as this prompt.

## Decisions locked in (Sim, 2026-09-03)

1. Remove XP from code properly — write path, UI, analytics.
2. **`user_course_stats.total_xp` stays in the database.** Stop writing to it;
   do not drop it, do not null it, do not migrate it. The historical points for
   27 users stay queryable. Dropping it is a separate, later decision.

## Scope — files to change

### 1. Kill the write path

**`src/lib/pmq/actions.ts`** — the core of it.
- Remove `computeXpAwarded` and every caller.
- Stop including `total_xp` in the upsert to `user_course_stats` (~line 121).
  Streak fields (`current_streak`, `longest_streak`, `last_activity_date`) all
  stay — streaks are **not** being removed.
- Remove `totalXp` / `xpAwarded` from the action's return type (~lines 73, 140,
  223, 259).

**`src/lib/pmq/queries.ts`**
- Drop `total_xp` from the `user_course_stats` select and from the default
  stats object (~lines 278, 291, 304).
- Delete `getPractiseQuizXp` entirely (~line 384) and its error branch (~406).

### 2. Remove the UI surface

**`src/components/QuizDemo.tsx`** — this is the one users can still see.
- Line ~166 renders `{xp} XP` as a live counter; lines ~63, 71, 116, 252–256
  hold the `xp` state and the "+10 XP" fly-up animation.
- Remove the counter and the animation. Keep the correct/incorrect feedback and
  the explanation line — those carry the demo, not the points.
- Note `DESIGN.md` and `LANDING_SPEC.md` describe this pill as *cosmetic,
  display-only, never persisted*. That was accurate. It still goes.

**`src/components/pmq/QuizRunner.tsx`** — `xpAwarded`, `totalXp`, `onXpGained`
(~lines 32–33, 45, 59–70, 106, 113–118, 352–353, 558–559, 647–648, 730–731,
831, 869–872). Remove the prop, the callback, and the "max XP per question"
constant.

**`src/components/pmq/LoStudyJourney.tsx`** (~115, 156) and
**`src/components/pmq/PracticeQuizSection.tsx`** (~39) — remove `initialLoXp`.

**`src/app/courses/pmq-in-5-days/lo/[loNumber]/page.tsx`** — remove the
`getPractiseQuizXp` import, `loPractiseXp` (~74, 97) and `total_xp` (~122).

**`src/components/pmq/PmqCourseHeader.tsx`** — delete the already-deprecated
`xp?: number` prop (~21–22).

### 3. Analytics — read the warning below before touching

**`src/lib/analytics/events.ts`** (~296, 343, 353),
**`src/components/analytics/DashboardAnalyticsPerson.tsx`** (~18, 25, 34, 42),
**`src/app/(site)/dashboard/page.tsx`** (~147) — remove `total_xp` and
`xp_awarded` from the event props.

⚠️ **This changes the PostHog taxonomy.** `quiz_attempt_submitted` currently
ships `xp_awarded` and is documented in `ANALYTICS_SPEC.md` line 55. Any saved
PostHog insight or dashboard filtering on `xp_awarded` or `total_xp` will go
flat, not error — silent breakage. Before merging, check PostHog for saved
insights using either property and tell Sim what will break. Historical events
already captured are unaffected.

### 4. Naming leftover

**`src/components/pmq/XpStreakBar.tsx`** — the file no longer has any XP in it;
it takes `streak` only and renders streak/completion pills. Only the filename
and the exported `XpStreakBar` name still say "Xp". Rename the file and the
export to `StreakBar.tsx` / `StreakBar`, update the import sites. Cosmetic, but
it is the thing that keeps making future sessions think XP is still live.

**`src/components/TrialQuiz.tsx`** (~78) — comment says XP "is being removed";
update to past tense once this lands.

### 5. Types

**`src/types/pmq.ts`** (~274) — `total_xp` stays in the row type *only if* the
type is a faithful mirror of the DB table (the column still exists). If it is a
mirror, leave it and add a one-line comment: *"Column retained for historical
data; nothing writes it as of 2026-09-03."* If it is an app-level type, remove
it.

## Do NOT touch

- **`content/v2/Diagrams/*.svg`** — these contain "XP" meaning **Extreme
  Programming**, the agile method, which is legitimate PMQ syllabus content.
  Do not let a broad find-and-replace near these.
- **`src/lib/pfq/*` and `src/lib/pmq/constants.ts`** — matches there are
  `PFQ_EXPECTED_OUTCOMES` and `PMQ_LO_EXPLAINER_VIDEOS`. False positives.
- **Streaks.** `current_streak`, `longest_streak`, `last_activity_date` and the
  streak pills all stay. Only XP goes.
- **The `total_xp` column itself.** Stop writing; do not drop.

## Grep that should come back clean when you are done

```
grep -rnE 'XP|Xp|xp_|_xp|\bxp\b' src \
  | grep -v EXPECTED | grep -v EXPLAINER | grep -v expand
```

## Verification before you report done

1. Answer a practice quiz question as a signed-in user on a scratch account.
2. Confirm no new `total_xp` value is written: the row's `total_xp` must be
   unchanged, while `current_streak` and `last_activity_date` still update.
3. Confirm the streak pill still renders and the demo quiz still works.
4. `npm run build` clean, no unused-import or unused-var warnings left behind.
