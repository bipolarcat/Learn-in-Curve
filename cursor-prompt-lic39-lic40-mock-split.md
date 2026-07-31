# Cursor prompt — LIC-39 (Lite Mock Exam) + LIC-40 (Full Mock Exam paywall)

## Context

Sim reported the Lite Mock Exam card showing long/short-answer questions,
which shouldn't be in the free tier. Investigation found the real bug: **the
Lite/Full split has never been built.** Both cards on the course overview
page (`PmqMockExamsSection.tsx`) link to the same route
(`/courses/pmq-in-5-days/mock`), which has always served all 40 mock
questions — 25 auto-marked (MCQ/dropdown) + 15 written — with **no tier
filtering and no entitlement check at all**. Any signed-in user can currently
reach the paid written/AI-graded exam for free via direct URL. This is
LIC-39 and LIC-40 in Linear, both still Backlog — the marketing cards were
built, the backend behind them wasn't.

**Already done (Claude, directly in Supabase + content files — don't redo):**
- Removed the "Space App" fictional-company case study entirely (was framing
  9 of the 40 questions, including 2 dropdown questions that would otherwise
  have leaked into Lite). Replaced those 9 questions with standalone
  equivalents — same id/part/position/type/marks/lo_reference, so the
  40-question/90-mark structure is unchanged, just no named company/personas.
- `PMQ in 5 days/content/mock.json` updated to match; `case_study` key
  removed.
- `courses.exam_config.case_study` removed from the DB row.
- All 40 mock-exam questions inserted into Supabase `questions` with
  `context = 'mock_exam'` (previously 0 rows there — the exam had been
  running entirely off the JSON fallback). Verified count: 20 MCQ + 5
  dropdown + 10 long-answer + 5 short-answer = 40 questions, 90 marks total.
- See `BUSINESS_STATE.md`, 2026-07-12 entry, for full detail.

**Your job is the application code only** — the content/DB side is done and
verified. Don't touch `mock.json` or the DB question rows.

## What to build

### 1. `getLiteMockExamQuestions()` — new query in `src/lib/pmq/queries.ts`

Filter `getMockExamQuestions()`'s result to
`question_type IN ('multiple_choice', 'select_from_list')` only (25 of the
40 questions, 30 of the 90 marks). Re-sequence the filtered set into a
single continuous part so the existing break-screen logic in
`MockExamRunner` doesn't fire for Lite: set `part = 1` and
`position = index + 1` on every returned question, regardless of their
original part/position in the full set.

### 2. `getLiteMockExamConfig()` — new function alongside `getMockExamConfig()`

Lite needs its own `MockExamConfig`, not the Full 90-mark/150-minute one:
- `total_marks`: sum of the filtered questions' marks (30)
- `pass_mark`: 60% of total_marks, rounded (18)
- `pass_percentage`: 60
- `time_allowed_minutes`: suggest 45 (single sitting, no break) — flag this
  to Sim as a default he can change, it wasn't specified anywhere before
- `break_after_question`: set to the full question count (25) so the
  part-1/part-2 break screen never triggers for a single-part exam
- `break_duration_minutes`: irrelevant since break never fires, but keep a
  placeholder value (0) for type-safety

### 3. Entitlement gate on the Full exam

`src/app/courses/pmq-in-5-days/mock/page.tsx` currently has **zero**
entitlement check — this is the actual paywall-bypass bug. Add a `tier`
search param (`?tier=lite` | `?tier=full`), read via
`searchParams` on the page. Behavior:

- **Default / missing / invalid `tier` → treat as `lite`.** Never default to
  serving Full content. This is a deliberate fail-safe: an unentitled user
  landing on the bare `/mock` URL with no param must always get the free
  tier, not the paid one.
- **`tier=lite`**: call `getLiteMockExamQuestions()` /
  `getLiteMockExamConfig()`, no case study, no entitlement check needed
  (it's free).
- **`tier=full`**: check `getAiTutorEntitlement()` (same £5 entitlement LIC-22
  and the AI tutor use) before fetching any full-exam question content. If
  `!hasEntitlement`, don't fetch/return the 40-question set at all — render
  the existing `LockedFeature` component (built for LIC-53, already used
  elsewhere) with the upgrade CTA instead of the exam. Only call
  `getMockExamQuestions()` (the full 40-question set) once entitlement is
  confirmed.

Pass a `tier` prop or equivalent down to `MockExamRunner` if it needs to know
which mode it's in (e.g. for copy like "Lite Mock Exam" vs "Full Mock Exam"
on the start screen — currently hardcoded to "PMQ Mock Exam").

### 4. `pmqMockHref()` — update in `src/lib/pmq/constants.ts`

```ts
export function pmqMockHref(tier?: "lite" | "full"): string {
  return `/courses/${PMQ_SLUG}/mock${tier ? `?tier=${tier}` : ""}`;
}
```

### 5. `PmqMockExamsSection.tsx` updates

- "Start lite mock" button → `href={pmqMockHref("lite")}`
- "Open full mock" button → `href={pmqMockHref("full")}`
- Fix `LITE_POINTS` — currently says "40 timed questions", which will now be
  wrong. Real numbers: 25 questions, 30 marks, MCQ & dropdown only, single
  sitting (no break). Suggested copy: `"25 timed questions"`,
  `"Multiple choice & dropdown only"` (already correct), drop or reword
  anything implying it matches the full 90-mark structure.

## Definition of Done

Don't mark LIC-39 or LIC-40 as done until verified in a real browser, not
just committed — per the project's standing Linear discipline:

- [ ] Unentitled account clicking "Start lite mock" gets exactly 25
      MCQ/dropdown questions, single sitting, no break screen, no written
      questions anywhere.
- [ ] Unentitled account clicking "Open full mock" — this shouldn't even be
      possible from the UI (card is locked/shows upsell), but confirm
      directly hitting `/courses/pmq-in-5-days/mock?tier=full` in the URL bar
      while unentitled shows `LockedFeature`, not the exam.
- [ ] Entitled account clicking "Open full mock" gets all 40 questions
      (25 auto-marked + 15 written), case study section absent from the
      start screen (no case study should render at all now — `caseStudy`
      will be `null` from `getCaseStudy()` since the DB key is gone).
- [ ] Bare `/courses/pmq-in-5-days/mock` with no `?tier` param defaults to
      Lite, not Full, for both entitled and unentitled accounts.
- [ ] No question anywhere in either tier mentions "Space App" or the old
      personas (Ayo/Sandeep/Alva/Robin/Lee).

Once verified, update LIC-39 and LIC-40 in Linear yourself (per
`documentation-discipline.mdc`) — status, and a short note confirming the
click-through matches this Definition of Done.
