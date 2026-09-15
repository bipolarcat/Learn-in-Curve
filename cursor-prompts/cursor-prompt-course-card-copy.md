# Cursor prompt — course card copy update (Free vs. Pro)

**Context:** Marketing copy for the PMQ course card was finalized with Claude on 2026-07-15. Source of truth for all feature facts is `FEATURES.md` (project root) — check it if a number here looks off, don't guess.

**Where this copy currently lives in code:**
- `src/lib/pmq/pro-included.ts` — `PMQ_TICKET_SELL_POINTS` (compact stamps on the homepage/course-card ticket) and `PRO_INCLUDED` (fuller Pro feature list).
- `src/lib/courses-catalog.ts` — course `description` field.
- Rendered by `src/components/CourseTicket.tsx`.

**Task:** update the copy in those two files to match the pointers below. Keep existing component structure, styling, and props untouched — this is a content-only change.

## Free tier ("PMQ in 5 Days Lite") pointers
- Streaks + XP that pull you back every day
- 24 LOs, full syllabus, nothing skipped
- ~280 quizzes, answer wrong, know why instantly
- Full 40-question mock exam included
- Exam command words, decoded
- Misconceptions busted before they cost you marks

## Pro bundle pointers
- Meet Sly — your AI tutor, on call
- 800+ questions total — unlock the full bank
- Every written answer, AI-marked. No self-scoring
- End-of-course report: your weak spots, before exam day
- Video + audio recap, every single LO
- Real exam conditions — timed, breaks, the works
- £9.99. Once. That's the whole price.

## Two accuracy rules to follow when wording this
1. **Quiz numbers are tier-specific.** ~280 = what Lite gets. 800+ = what Pro unlocks (this includes the Lite 280, not on top of it). Never state 800+ as a Lite-tier number.
2. **The mock exam is one shared 40-question exam**, not two different exams for Lite vs. Pro (20 MCQ, 5 dropdown, 5 short written, 10 long written). Pro's upgrade is AI-grading of the written answers plus a timed/proctored format — not extra questions. Word it as "same exam, properly graded and timed," not "bigger exam."

Don't invent additional copy beyond what's above — if something's missing, flag it back rather than filling the gap.
