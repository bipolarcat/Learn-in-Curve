# PMQ Native Migration — handoff spec for Cursor

## Why

PMQ in 5 days is currently shown inside Learn in Curve via an iframe (`src/app/courses/pmq-in-5-days/[[...path]]/route.ts` serves the static files; `src/app/courses/[slug]/page.tsx` embeds `/courses/pmq-in-5-days/index.html` in an `<iframe>`). That's fine for a basic embed, but it's a black box: the outer app can't see quiz attempts or section completions happening inside it. That blocks both the AI tutor (needs to know what the user got wrong) and gamification (needs to know when to award XP/streaks/mark progress).

This migration moves the actual LO content out of the static site and into Learn in Curve's own Supabase tables and its own Next.js pages, so there's one app, not an embedded second one. Decided and logged in `BUSINESS_STATE.md` (2026-07-02).

**Also locked in (already done, no action needed here):** PMQ stays permanently free within Learn in Curve — no paygate at any tier. `courses.is_free = true`, `courses.price_cents = 0`. Don't add entitlement checks for this course.

## Current DB state (already done, don't redo)

Project: `dbjoimidfbftammchnql`. These tables already existed (empty) and now have one column addition + one proof-of-concept row:

- `courses` — 1 row: `pmq-in-5-days`, `status='live'`, `is_free=true`, `price_cents=0`. id: `3b6e12c0-321f-41b2-8536-db39f5678301`.
- `sections` — added two columns: `day integer`, `theme text` (didn't exist before). Has 1 row (LO1) as a working proof-of-concept.
- `lessons` — 1 row (LO1's content lesson).
- `questions` — 11 rows (LO1's quiz, migrated).
- `attempts`, `section_progress`, `exam_sessions`, `certificates` — empty, schema only, not touched.

**Do not re-insert LO1** — check `sections` for `order_index = 1` before migrating, and make the migration script idempotent (skip or upsert LOs that already exist by `order_index`).

## Content source

`PMQ in 5 days/content/lo1.json` through `lo24.json`, validated against `PMQ in 5 days/content/_schema.json`. All 24 files are structurally consistent. Note: `lo1.json` has already been rebuilt to the new quiz format (MCQ/scenario_mcq/dropdown only, 11 questions); `lo2.json`–`lo24.json` still contain legacy `long_form`/`short_recall` quiz items pending the same rebuild (separate future task, not blocking this migration — migrate them as-is).

## Schema mapping

One `sections` row per LO:

| lo*.json field | sections column |
|---|---|
| `lo_number` | `order_index` |
| `title` | `title` |
| `lo_code` | `lo_code` |
| `day` | `day` |
| `theme` | `theme` |
| (fixed) | `course_id` = the PMQ course id |

One `lessons` row per section (`order_index=1`, `lesson_type='content'`, `title` = LO title). `body` (jsonb) = everything else non-quiz, as one object:

```json
{
  "apm_learning_objective": "...",
  "learning_outcomes": [...],
  "where_this_fits": "...",
  "key_definitions": [...],
  "core_content": [...],
  "worked_example": {...},
  "misconceptions": [...],
  "exam_technique": {...},
  "memory_aids": [...],
  "quick_recap": [...],
  "further_reading": [...],
  "progress_checkpoint": [...]
}
```

One `questions` row per quiz item. Type mapping (lo*.json `type` → DB `question_type`):

| lo*.json `type` | DB `question_type` | `is_scenario` |
|---|---|---|
| `mcq` | `multiple_choice` | `false` |
| `scenario_mcq` | `multiple_choice` | `true` |
| `dropdown` | `select_from_list` | `false` |
| `long_form` | `long_answer` | `false` |
| `short_recall` | `short_answer` | `false` |

Other question fields: `external_id` = the `id` field (e.g. `"q1"`), `learning_objective` = the LO's `lo_code`, `context = 'practice_quiz'`, `marks`, `prompt` = `question`, `mock_suitable`. For mcq/scenario_mcq: `options` = the options array (jsonb), `correct_answer` = the letter as a jsonb string (e.g. `"D"`). For dropdown: `options` = the `dropdowns` object (jsonb), `correct_answer` = the `correct_answers` object (jsonb). For long_form/short_recall: `options`/`correct_answer` = `NULL`, use `model_answer` and `marking_guide` instead. `explanation` copied where present.

## 1. Migration script

Write `scripts/migrate-pmq-content.mjs` (or `.ts`), run manually via `node`, not part of the app build:

- Uses `@supabase/supabase-js` with `SUPABASE_SERVICE_ROLE_KEY` (add this to `.env.local` locally — it's not in the repo and shouldn't be committed; RLS blocks the anon key from writing to these tables) and `NEXT_PUBLIC_SUPABASE_URL`.
- Reads `PMQ in 5 days/content/lo1.json`...`lo24.json`.
- For each LO: skip if a `sections` row with that `order_index` already exists (idempotent — safe to re-run); otherwise insert section → lesson → questions per the mapping above.
- Log a summary at the end (sections/lessons/questions inserted vs skipped).

## 2. Native course overview page

Replace what's currently just an iframe-src assumption with a real overview at `/courses/pmq-in-5-days`: query `sections` (order by `day`, `order_index`), group into Day 1–5, list all 24 LOs as clickable cards/list items linking to the LO detail page. Style with the existing Tailwind tokens from the v4 rebuild (`cream`/`paper`/`ink`/`orange`/`rust`/`teal`, ticket/sticker motifs already used in `CourseTicket.tsx`/`HeroBoardingPass.tsx`) — this should feel like the same app as the homepage, not a different product.

## 3. Native LO detail page + quiz runner

Dynamic route, e.g. `/courses/pmq-in-5-days/lo/[loNumber]`. Server-fetch the matching `sections` row (by `order_index`) plus its `lessons.body` and all `questions` for that section. Render, in order:

1. Hero: title, lo_code pills, day/theme.
2. `where_this_fits`.
3. `key_definitions` as a definitions table (see `PMQ in 5 days/specs/components/lo-page.md` for the existing `.def-table` visual pattern to match).
4. `core_content` (render each `body_markdown` — needs a markdown renderer; a lightweight one is fine, this is simple markdown with headings/tables/lists).
5. `worked_example` (scenario box + reveal-toggle for `model_answer`, matching the existing `.scenario-box`/`.reveal-toggle` pattern in the same spec file).
6. `misconceptions` (wrong/right pairs).
7. `exam_technique` (command words table + golden rules callouts).
8. **Quiz runner** (client component): render each question by type — `multiple_choice` as radio options, `select_from_list` as two dropdowns (there are always exactly two blanks, `a` and `b`, per the existing content shape), `long_answer`/`short_answer` as a reveal-toggle showing `model_answer` (no free-text grading — this matches how the old static site handled these before they's rebuilt to auto-markable types). On submit, write a row to `attempts` (user_id, question_id, course_id, learning_objective, context='practice_quiz', submitted_answer, is_correct, attempted_at) — this is the data the AI tutor and gamification will read later, so get this write right even though nothing consumes it yet.
9. `memory_aids`, `quick_recap`, `further_reading`, `progress_checkpoint` (checklist — on check, write/update a `section_progress` row for that user+section).

Match the visual language already documented in `PMQ in 5 days/specs/components/lo-page.md`, `progress.md`, and `flashcards.md` — reuse those class/token patterns translated into Tailwind rather than inventing a new visual style for this page.

## 4. Retire the iframe

Once the native LO page works end-to-end for at least a few LOs, update `src/app/courses/[slug]/page.tsx`: for `slug === 'pmq-in-5-days'`, render the native course overview (item 2 above) instead of the `<iframe>` block. Leave the old catch-all static-file route (`src/app/courses/pmq-in-5-days/[[...path]]/route.ts`) in place but unused — don't delete it yet in case anything still needs to fall back to it.

## 5. AI tutor — visual lock + £5 unlock (added 2026-07-03)

**Course access stays completely free.** The AI tutor specifically is a paid add-on. This is now in scope for this pass — not the tutor's actual chat functionality (still a separate, not-yet-written spec), but the locked panel and the paywall mechanic around it.

DB already set up (done, don't redo):
- New `feature_entitlements` table: `user_id`, `course_id`, `feature` (currently only `'ai_tutor'`), `source` (`'purchase'`|`'free'`), `granted_at`, `stripe_payment_id`. RLS: users can `SELECT` their own rows only. Deliberately separate from `entitlements` (which represents full-course access) so a tutor unlock can never be misread as course access.
- `courses.exam_config.ai_tutor_price_cents = 500` for PMQ (fetch the price from here, don't hardcode it).

Build:
1. **Panel placement**: the fixed right-side expandable AI tutor panel (Cursor-agent-sidebar style — click to expand/collapse) should be present on every LO detail page, per the existing AI tutor UX direction. Build it now even though the tutor itself isn't wired up.
2. **Locked state (default)**: query `feature_entitlements` for `(user_id, course_id=PMQ id, feature='ai_tutor')`. No row → panel shows a locked/teaser state: a short description of what the tutor does, a lock icon, and an "Unlock AI Tutor — £5" button. This should look like an inviting preview, not a dead end — per the existing UX direction, the design should make people want to open it.
3. **Unlock flow**: Stripe Checkout for a one-time £5 payment (amount from `exam_config.ai_tutor_price_cents`, not hardcoded). On successful payment, the webhook inserts a `feature_entitlements` row (`source='purchase'`, `stripe_payment_id` from the Stripe event). This needs `STRIPE_SECRET_KEY` and a webhook secret in `.env.local` — ask me for test-mode keys if they're not already there; don't block on live keys, test mode is fine to build against.
4. **Unlocked state**: if a `feature_entitlements` row exists, show the panel as unlocked. Since the tutor's actual chat logic isn't specified yet, unlocked state can render a simple "You've unlocked the AI tutor — full experience launching soon" placeholder for now. Don't build tutor chat logic itself in this pass.

## 6. Fix pass — parity gaps found in the first build (added 2026-07-03)

Spot-checked the first build (native LO1 page + native overview) side by side against the old static site in a real browser. Two confirmed gaps — fix both before continuing to anything else:

**A. Diagrams are missing from the native LO page.** Each `core_content[]` entry in lo*.json can carry a `diagrams` array, e.g. lo1.json's `core_content[0].diagrams`:
```json
[{"id":"lo1-lifecycle-staircase","file":"project-lifecycle-staircase.svg","caption":"Project Lifecycle – six phases from Concept through to Benefits Realisation","placement":"after_heading","heading":"Three life cycles to know"}]
```
The old static `lo.html` renders this image inline right after the heading named in `heading`. The native LO detail page currently renders `body_markdown` only and drops the `diagrams` array entirely — confirmed by comparing the two pages directly (old site shows the image, native doesn't). Files live at `PMQ in 5 days/public/diagrams/{file}` (SVGs). Fix: when rendering each `core_content` item's markdown, after the heading matching `diagrams[].heading`, insert an `<img>` (or inline the SVG) using `diagrams[].file` and `diagrams[].caption` as alt text. Not every core_content item has a diagrams array — most don't; only render when present.

**B. Home-page-only sections are missing from the native course overview.** These are NOT the same as the per-LO `further_reading` field (that one is correct — each LO's own further_reading renders fine on its own detail page). These are separate, hardcoded, global sections that only ever appeared once on the old `index.html` (the course home page), and the native `/courses/pmq-in-5-days` overview currently only has the day-grouped LO list. Missing sections, in order, with exact copy from `PMQ in 5 days/index.html`:

1. **Hero stats**: "24 learning objectives · 100+ quiz questions · Full mock exam" (mock exam isn't built yet — keep the stat as aspirational copy, don't link it anywhere until it exists).
2. **"What's Included?"** — 6 cards: 24 Learning Objectives, Interactive Quizzes, Full Mock Exam, Common Misconceptions, Exam Techniques, Memory Aids (each with the one-line body copy from `index.html` lines ~128-172).
3. **"Exam Question Command Words"** — a global 6-row reference table (State / Describe / Explain / Identify / Analyse / Evaluate with the examiner's-expectation copy from `index.html` lines ~182-194). This is a superset reference table, distinct from the 4-row subset each LO's own `exam_technique.command_words` shows.
4. **"Frequently asked questions"** — 5 FAQ items (accordion), copy verbatim from `index.html` lines ~202-260 (what PMQ is, who it's for, career impact, exam format, how to book).
5. **"Further Reading"** (global, home-page-level) — 2 cards: APM Body of Knowledge 8th Edition, and the Parallel Project Training PMQ 2024 podcast series, copy and links verbatim from `index.html` lines ~270-282.

Build these as real sections on the native `/courses/pmq-in-5-days` overview page (below or around the day-plan), not per-LO. Reuse the existing Tailwind tokens/components already established for the site.

## 7. Full rebuild — all 24 LOs + native mock exam (added 2026-07-04)

LO1's native demo looked good. Time to do the whole course: migrate all 24 LOs for real (not just the proof-of-concept), and build the mock exam natively too, replacing `mock.html`/`quiz.html`.

**A. Run the full LO migration.** The migration script from section 1 already handles all 24 files and is idempotent (skips `order_index=1` since LO1 exists). Just run it for real now — no design changes needed, `lo2.json`–`lo24.json` still have some legacy `long_form`/`short_recall` quiz items and that's fine, migrate them as-is per the type mapping in the schema table above (they render as reveal-toggle model-answer questions, same as any other long_answer/short_answer). The separate task of rebuilding those quiz banks to MCQ/dropdown-only is still in progress on the content side independently — don't wait for it.

**B. Mock exam — DB is ready, build the native page.** Already done on my end (don't redo):
- `questions` table: added two nullable columns, `part integer` and `position integer` (used only by mock-exam questions; practice-quiz questions leave these null).
- `courses.exam_config` for PMQ now also has `mock_exam` (total_marks: 90, pass_mark: 54, pass_percentage: 60, time_allowed_minutes: 150, break_after_question: 20, break_duration_minutes: 30). Fetch from `exam_config`, don't hardcode. **(Updated 2026-07-12: the `case_study` key described in an earlier version of this doc — a "Space App" fictional-company scenario — has been removed entirely, along with the 9 mock questions that referenced it, which were replaced with standalone questions. Don't reintroduce a case-study concept without checking with Sim first — see `BUSINESS_STATE.md` 2026-07-12 entry.)**

Still to do:
1. **Mock migration script**: read `PMQ in 5 days/content/mock.json`, flatten `parts[].questions[]`, insert each into `questions` with `course_id` = PMQ's id, `section_id = NULL`, `context = 'mock_exam'`, `part` and `position` from the source data, `question_type`/`is_scenario` mapped the same way as practice questions (mcq→multiple_choice, scenario_mcq→multiple_choice/is_scenario=true, dropdown→select_from_list, long_form→long_answer, short_recall→short_answer), `options`/`correct_answer` or `model_answer`/`marking_guide` per type, `marks`, `prompt` = `question`. Make it idempotent (skip if `context='mock_exam'` questions already exist for this course).
2. **Native mock exam page** (`/courses/pmq-in-5-days/mock`), replacing `mock.html`. Same flow as the old static version, rebuilt against the DB instead of `sessionStorage`/`localStorage`:
   - **Unlock gate**: the old site's displayed copy says "complete all 24 learning objectives to unlock" but its actual code only checked a stale `emailCaptured` flag — a leftover from before real accounts existed, no longer meaningful now that users sign in via Supabase Auth. Use the copy's actual stated intent instead: unlock when all 24 `sections` have a `section_progress` row with `quiz_completed_at` set for that user. Show the same locked screen (progress bar, "N / 24 complete") when not yet unlocked.
   - **Start screen**: title, stats pills (40 questions · 90 marks · 2.5 hours), the case-study intro (organisation + description + persona cards from `exam_config.case_study`), "Begin Part 1" button.
   - **On begin**: create an `exam_sessions` row (`user_id`, `course_id`, `started_at = now()`, `time_limit_minutes = 150`). Store its id client-side (React state / URL, not localStorage) to attach attempts to it.
   - **Question flow**: same as old site — one question at a time, progress "Question X of Y, Part Z", MCQ radio / dropdown double-select / textarea for long_form-short_recall, "Next" advances, crossing from part 1 to part 2 triggers the break screen (30 min countdown, skippable). On each answer, write (or upsert) an `attempts` row: `user_id`, `question_id`, `course_id`, `learning_objective` (use the question's part/position context since mock questions aren't tied to a specific LO — `learning_objective` can be null or a placeholder like `'mock'`), `context='mock_exam'`, `submitted_answer` (jsonb — the option index, dropdown array, or text), `exam_session_id`, `is_correct` (computed immediately for mcq/dropdown; null for long_form/short_recall until self-assessed).
   - **Self-assessment screen** (written questions only): same UX as old site — show the user's own answer, the `model_answer`, the `marking_guide` split into checkable points, and a marks-earned input. On submit, update that question's `attempts` row: set `ai_score` (reuse this numeric field for the self-assessed score, since there's no separate "self_score" column) and `is_correct = ai_score >= marks * 0.5` (or leave `is_correct` null and just rely on `ai_score` — reviewer's call, either is fine since the results screen sums `ai_score`/marks directly rather than reading `is_correct` for these).
   - **Results screen**: sum MCQ/dropdown marks (from `attempts.is_correct`) + written marks (from `attempts.ai_score`), same table layout as old site (auto-marked row, self-assessed row, total), pass/refer banner at 54/90. On computing the final score, update the `exam_sessions` row: `submitted_at = now()`, `total_score`, `max_score = 90`, `passed = total_score >= 54`. If `passed`, insert a `certificates` row (`user_id`, `course_id`, `exam_session_id`) — `certificate_number` auto-generates, no need to set it. Add a "Review all answers" toggle identical to the old site's.
   - **Resuming**: if the user navigates away mid-exam, look up their most recent `exam_sessions` row for this course with `submitted_at IS NULL` and resume from their last-answered question (derived from existing `attempts` rows for that `exam_session_id`) rather than session-storage.

Match the same visual language as the LO detail page and the rest of the site (Tailwind tokens, ticket/sticker motifs) — this should feel like one continuous product, not a bolted-on exam tool.

## Explicitly out of scope for this pass

- The AI tutor's actual chat functionality (grounding, prompts, conversation logic) — separate spec, not written yet. Only the locked/unlocked panel shell and the paywall mechanic are in scope here.
- Gamification mechanics (XP, streaks, badges) — separate spec, not written yet. This migration just needs to get `attempts` and `section_progress` being written to correctly, since that's the data those features will read.
- Rebuilding lo2–lo24's quiz banks to drop `long_form`/`short_recall` — separate content task, in progress independently on the content side. Don't block the migration or mock-exam build on it.
