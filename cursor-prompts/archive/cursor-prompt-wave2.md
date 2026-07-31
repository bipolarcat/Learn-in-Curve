# Cursor prompt — Wave 2 (LO / dashboard / course-page cluster)

12 tickets plus one new component, all in **Todo** in Linear. These share
templates with each other (and with what Wave 1 touched) — work through in
this order on one branch, don't jump around, commit as you go.

## Order matters — do LO template tickets together

LIC-33, 34, 20, 32, 24, 21 all touch
`src/app/courses/pmq-in-5-days/lo/[loNumber]/page.tsx` and its child
components. Do these six back-to-back before moving to the dashboard/course
tickets, so you're not context-switching between files repeatedly.

**LIC-33** — Remove the "Learn in Curve" branded header from LO pages
specifically — keep only "Now Studying / PMQ in 5 days". Distinct from LIC-15
below (course overview page, different page).

**LIC-34** — Add three buttons to the LO page header: back to course home,
back to dashboard, sign out.

**LIC-20** — Confirmed scope (2026-07-08, see Linear comment): wrap each
existing content block (definitions, core content, worked example,
misconceptions, exam technique, memory aids, recap) in an accordion, collapsed
by default. This is the light-tweak version, NOT the full Gamification Phase B
card restructure — don't scope-creep into that.

**LIC-32** — "Mark this Learning Objective as Complete" button at the end of
each LO. On click: marks complete, plays a full-screen completion animation
matching `DESIGN.md`'s "journey path" visual language.

**LIC-24** — Misconceptions ("Watch Out") section: show the wrong/common
mistake first, click to reveal the correct version. `MisconceptionsList.tsx`.

**LIC-21** — Quiz: replace the "check answer" submit-button pattern with
click-an-option-to-reveal (same pattern as the homepage `QuizDemo.tsx`).
Once answered, question locks — no retake for that attempt. Applies globally,
`QuizRunner.tsx`.

## Dashboard / course overview tickets

**LIC-13** — Dashboard PMQ card: heading only, no other body text. XP/streak
as a badge in the top-right corner only (not shown elsewhere on the
dashboard). `src/app/(site)/dashboard`.

**LIC-15** — Course overview page (`src/app/courses/pmq-in-5-days/page.tsx`):
remove the "Now studying / PMQ in 5 days" header block (that treatment is
LO-pages-only per LIC-33). Move completion %, streak, XP below the top area,
to the right of the main "PMQ in 5 days" heading.

**LIC-27** — Remove the XP/streak badge from the LO-level practice quiz card
specifically — it's a course-level indicator only (ties to LIC-13 above).

**LIC-18** — New page: PMQ overview/preview, reached from "Start Free with
PMQ" CTA. Same design system as the course page. Shows: summary of every
LO (locked, nothing clickable — this is a preview), "What's Included?"
section, FAQ section. Do NOT include "Further Reading" or the command-words
table — those stay LO/course-page-only. Sign-up panel on the right per the
original ticket description.

**LIC-10** — Homepage `QuizDemo.tsx`: swap the 3 placeholder questions for 3
real ones, add a segmented progress bar (burnt-orange fill per question
completed), "Enrol for free" CTA after all 3 are done (same destination as
the existing "Start free with PMQ" button).

**LIC-31** — Streak ticks on any course activity, not just quiz attempts.
Change: opening any LO page that day ticks the streak (still once per
calendar day, UTC, per the existing logic in `submitQuizAttempt`) — no quiz
attempt required. Likely a small addition to the LO page's server-side data
fetch, not a `QuizRunner` change.

## Bonus, do last — unblocks Wave 3

**LIC-53** — New shared component, `src/components/LockedFeature.tsx`. Wraps
any child content, takes an `unlocked: boolean`, renders either the real
content or a locked variant: lock icon, dashed/dotted outline, reduced
opacity/de-emphasized. `AiTutorPanel.tsx` already has ad-hoc lock styling (🔒
emoji, one dashed-border box) — don't touch `AiTutorPanel.tsx` itself in this
pass (that's LIC-42's job), just build the standalone component so Wave 3 can
adopt it. No consumers wired up yet in this ticket — just the component.

## When done

Same as Wave 1: log a BUSINESS_STATE.md decision-log entry, update
`docs/roadmap.md`, check `legal/PRE_LAUNCH_CHECKLIST.md` — flag if LIC-33/34/
15/18 touch anything near the "Not affiliated with APM" disclaimer
(`src/app/courses/layout.tsx`), since that's a live pre-launch checklist item
(LIC-48). Move each ticket to **In Review**, not Done, when finished.
