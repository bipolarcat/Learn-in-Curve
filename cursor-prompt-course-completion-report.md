# Cursor prompt — LIC-65: downloadable course-completion report (Pro)

Full ticket: LIC-65 in Linear (spec confirmed by Sim, description has the
full decision log — read it before starting, this prompt is the build
instructions derived from it). Related: LIC-52 (existing in-chat prose
summary, Done — this report complements it, doesn't replace it) and LIC-53
(`LockedFeature` component, reuse as-is).

## What this is

Once a user completes all 24 LOs, Pro users get a downloadable PDF report:
a weak/strong meter per LO, a handful of key takeaways, and improvement
tips. Free users see a locked teaser (same pattern LIC-52 already uses).

**Everything that decides the numbers is code, not the model.** The
weak/strong meter is computed from quiz attempt data — never let the LLM
state or invent a score. The LLM only writes the explanatory text
(takeaways, per-LO notes, tips), grounded in numbers you hand it.

## 1. Migration

New table:

```sql
create table course_completion_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  course_id uuid not null,
  per_lo jsonb not null,        -- [{ loNumber, wrongCount, totalCount, tier }]
  key_takeaways jsonb not null, -- string[]
  weak_lo_notes jsonb not null, -- [{ loNumber, note }]
  improvement_tips jsonb not null, -- string[]
  pdf_storage_path text,        -- set once the PDF has been rendered + cached
  generated_at timestamptz not null default now(),
  unique (user_id, course_id)
);
```

The `unique (user_id, course_id)` constraint is the idempotency guard — one
row per user per course, ever. Also create a private Supabase Storage
bucket (e.g. `course-reports`) for the cached PDF bytes — private, not
public, served via signed URL only.

## 2. Meter computation — reuse existing data, add bucketing

`getWeakAreasForCourse` in `src/lib/tutor/tutor-db.ts` already returns
`{ learningObjective, wrongCount, totalCount }[]` for the whole course. Add
a small pure function (e.g. in a new `src/lib/tutor/course-report.ts`) that
buckets each LO:

```ts
type MeterTier = "not_enough_data" | "weak" | "developing" | "strong";

function bucketLo(wrongCount: number, totalCount: number): MeterTier {
  if (totalCount < 3) return "not_enough_data";
  const pctCorrect = ((totalCount - wrongCount) / totalCount) * 100;
  if (pctCorrect < 65) return "weak";
  if (pctCorrect < 80) return "developing";
  return "strong";
}
```

Confirmed thresholds (Sim, 2026-07-28): <3 attempts = not enough data,
<65% = weak, 65–79% = developing, 80%+ = strong. Don't change these without
checking with Sim first — they're a product decision, not an engineering
default.

## 3. Content generation — extend the LIC-52 trigger, don't build a new one

`maybeDeliverCourseCompletionSummary` in
`src/lib/tutor/course-completion-summary.ts` already fires at the right
moment (all 24 LOs complete, Pro entitlement checked, fair-usage budget
checked, fires from the `markSectionComplete` path). Extend it — after it
computes `courseWeakAreas`, also:

1. Bucket every LO via `bucketLo` above.
2. Make **one** Gemini call that returns both the existing chat-message
   prose (current behavior, don't change the chat UX) and the new
   structured report JSON, so the two can never describe the weak areas
   differently. Use Gemini's native structured output — `generationConfig:
   { responseMimeType: "application/json", responseSchema: {...} }` — not
   manual prompt-and-parse-with-regex. Schema:

```json
{
  "chatMessage": "string — the existing LIC-52-style prose, now also mentioning the downloadable report is ready",
  "keyTakeaways": ["string", "..."],       // 3-5 items, short
  "weakLoNotes": [{ "loNumber": 1, "note": "string" }],  // only LOs bucketed weak/developing
  "improvementTips": ["string", "..."]     // capped at 5
}
```

   `callTutorModel` in `src/lib/tutor/callTutorModel.ts` currently builds a
   Gemini request without `responseSchema` — add an optional parameter (or
   a sibling function, e.g. `callTutorModelJson`) rather than changing the
   existing signature, since the streaming chat path shouldn't get JSON
   mode.
3. Insert the `tutor_messages` row as before (existing behavior, just using
   `chatMessage` from the structured result instead of raw text).
4. Insert one row into `course_completion_reports` with `per_lo` (bucketed
   data from step 1, not from the model), `key_takeaways`, `weak_lo_notes`,
   `improvement_tips`. Leave `pdf_storage_path` null — PDF is rendered
   lazily on first download, not at generation time.

## 4. PDF rendering

Add `@react-pdf/renderer` as a new dependency. New API route, e.g.
`src/app/api/tutor/course-report/route.ts` (GET):

- Require signed-in user, re-check Pro entitlement server-side (same
  `getAiTutorEntitlement` check LIC-52 uses — don't trust a client-side
  locked/unlocked flag).
- Look up the `course_completion_reports` row for this user/course. 404 (or
  a clear "not ready yet" response) if it doesn't exist — i.e. course isn't
  complete yet or generation hasn't run.
- If `pdf_storage_path` is already set, fetch from Storage and stream it
  back — don't regenerate.
- If not, render the PDF from `per_lo` / `key_takeaways` / `weak_lo_notes` /
  `improvement_tips` with `@react-pdf/renderer`: one page (or section) per
  meter — simple horizontal bar per LO, colour by tier (weak/developing/
  strong/grey for not-enough-data), title + LO number, the one-line note if
  present. Then a "Key takeaways" section and a "How to improve" section
  from the tips. Keep it simple — this is explicitly meant to not overload
  the user, don't over-design it.
- Upload the rendered bytes to the `course-reports` Storage bucket, save
  the path back to `pdf_storage_path`, then return the PDF
  (`Content-Type: application/pdf`, `Content-Disposition: attachment`).

## 5. UI — dashboard + course overview

Both surfaces, per the original spec: a "Download your report" card that
only renders once `course_completion_reports` has a row for this user
(i.e. course is done and the report has been generated — check via a
lightweight existence query, not by re-running the full generation logic
client-side).

- **Free/unentitled user, course complete:** locked teaser, reuse
  `LockedFeature` (LIC-53) exactly as LIC-52's existing course-completion
  teaser does — don't build a second bespoke locked state.
- **Pro user, course complete:** button that hits
  `/api/tutor/course-report` and triggers the browser download.
- **Course not yet complete (either tier):** nothing renders — no
  placeholder card, no "coming soon."

## Dev testing

Sim's account (`simsamaarshened@gmail.com`, `user_id
67e782d3-4cd6-47ac-a261-0c8ba8e80a01`) already has a real `ai_tutor`
`feature_entitlements` row (granted for LIC-22 testing) — reuse it, no need
to grant a second one.

## Definition of done

- Free account, all 24 LOs complete: locked teaser renders on dashboard +
  course overview, no report data returned by the API route — verify via
  network tab, not just visual lock state.
- Pro account, all 24 LOs complete: download button renders, clicking it
  downloads a real PDF with per-LO bars, correct tier colours matching the
  confirmed thresholds, key takeaways, and tips.
- Re-requesting the same report a second time serves the cached PDF from
  Storage — confirm via a log line or timing, not a fresh Gemini call.
- `course_completion_reports` has exactly one row per user/course even if
  `markSectionComplete` somehow fires twice (idempotency via the unique
  constraint, not just application-level checks).
- Chat message from LIC-52's flow still appears normally, now mentioning
  the report — confirm the existing chat UX didn't regress.
- Pro account with fewer than 3 attempts on some LOs: those LOs show
  "not enough data," not a false weak/strong verdict.

## When done

Log to `BUSINESS_STATE.md` per the usual discipline. Move LIC-65 to Done
only after Sim (or you) has verified the full click-through in a real
browser, both tiers, not just on code inspection.
