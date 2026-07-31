# Cursor prompt — LIC-22: "Generate Quiz" button (quiz sets 2 & 3)

Content is done. This prompt is the remaining build: migrate the new content
into Supabase, then wire the button + serving logic. Full ticket: LIC-22 in
Linear (now In Review, not Done — move to Done only once you've verified this
end-to-end in a real browser).

## What already exists (don't redo this)

Claude hand-authored 20 new questions per LO (10 for `quiz_set_2`, 10 for
`quiz_set_3`), grounded strictly in each LO's own curated JSON content — same
source discipline as the existing `quiz` array. Every `PMQ in 5 days/content/lo1.json`
through `lo24.json` now has, alongside the existing `quiz` array:

```json
"quiz_set_2": [ /* 10 questions, same shape as `quiz` items */ ],
"quiz_set_2_total_marks": 12,
"quiz_set_3": [ /* 10 questions, same shape */ ],
"quiz_set_3_total_marks": 12
```

Question shape is identical to `quiz` items: `{id, type, marks, question,
options?, correct_answer?, dropdowns?, correct_answers?, explanation,
mock_suitable}`, `type` ∈ `mcq | scenario_mcq | dropdown`. IDs continue
numbering from wherever each LO's existing `quiz` array ends (e.g. most LOs:
`quiz` = q1–q10, `quiz_set_2` = q11–q20, `quiz_set_3` = q21–q30; LO1's `quiz`
has 11 items so its sets are q12–q21 and q22–q31 — **don't hardcode "10
existing questions", check per-LO**). Verified: all 24 files are valid JSON,
each new set has exactly 10 questions, no duplicate `id`s across all three
sets in any LO.

**Important — this content is not live yet.** I checked: `sections` (24),
`lessons` (24) and `questions` (241, all `context = 'practice_quiz'`) are
already fully migrated into Supabase, so `getPmqLoPageData` in
`src/lib/pmq/queries.ts` is reading from the DB path, not the
`content-fallback.ts` JSON-fallback path, for every LO. The new
`quiz_set_2`/`quiz_set_3` questions sitting in the JSON files are invisible to
the running app until you migrate them in. That's step 1 below, not
optional polish.

## Build order

### 1. Migration script — get the new questions into `questions`

Model this on `scripts/migrate-pmq-content.mjs` (same `TYPE_MAP`, same
`buildQuestionRow` shape) but as a new script, e.g.
`scripts/migrate-pmq-quiz-sets.mjs`, because the existing script's
`sectionExists` guard skips every LO outright (sections already exist) — it
will never reach the question-insert step for sets 2/3.

New script needs to, per LO 1–24:
- Look up the existing `section_id` (`sections` table, `order_index = lo_number`)
  — do **not** create a new section, it's already there.
- Read `quiz_set_2` and `quiz_set_3` from the LO's JSON.
- Insert into `questions` with `context: "quiz_set_2"` / `context:
  "quiz_set_3"` respectively (**not** `"practice_quiz"` — that value is
  reserved for set 1 and is load-bearing elsewhere, see step 4).
- Idempotent: check for an existing row by `(section_id, context,
  external_id)` before inserting so reruns don't duplicate. Follow the
  existing script's console-summary-per-LO pattern so a rerun is easy to
  eyeball.

Also extend `src/lib/pmq/content-fallback.ts`'s `LoJson` type and
`loadLoPageFromJson` to read `quiz_set_2`/`quiz_set_3` the same way it already
reads `quiz` (reuse `buildQuestionFromQuiz` — it's generic over the quiz item
shape already). This keeps the JSON-fallback path consistent with the DB path
in case a section ever falls back (new courses, local dev without a seeded
DB, etc.) — low effort, don't skip it.

### 2. Query layer — `src/lib/pmq/queries.ts`

Add something like:

```ts
export async function getPmqQuizSetQuestions(
  supabase: SupabaseClient,
  sectionId: string,
  context: "quiz_set_2" | "quiz_set_3",
): Promise<PmqQuestion[]>
```

Fetch from `questions` filtered by `section_id` + `context`, sort using the
same external-id-numeric-suffix pattern `getPmqLoPageData` already uses.
Return `[]` if nothing found (don't throw — treat as "not migrated yet /
nothing to show" gracefully).

### 3. Entitlement-gated server action

New server action (add to `src/lib/pmq/actions.ts` or a new
`src/lib/pmq/quiz-sets.ts` if you'd rather keep it separate from the
gamification logic already in `actions.ts`):

```ts
export async function getQuizSet(input: { loNumber: number; setNumber: 2 | 3 })
```

- Require a signed-in user (same pattern as `submitQuizAttempt`).
- Check the entitlement server-side via `getAiTutorEntitlement` — LIC-22's
  spec gates quiz sets 2/3 behind the **same £5 `ai_tutor` feature
  entitlement** as LIC-36/37/40, not a separate paywall. If there's no
  entitlement row, return `{ error: "locked" }` and do not return any
  question data. This has to be enforced server-side — don't just hide the
  button client-side, since that leaves the data fetchable by anyone who
  inspects the network tab.
- Look up the section (`order_index = loNumber`), call
  `getPmqQuizSetQuestions` for the requested context, return `{ ok: true,
  questions }`.

### 4. `submitQuizAttempt` needs a `context` param

Right now `submitQuizAttempt` in `src/lib/pmq/actions.ts` hardcodes `context:
"practice_quiz"` on the `attempts` insert, and `maybeMarkQuizComplete` only
ever checks `context = 'practice_quiz'` when deciding whether the LO's quiz
is "done" (which gates `section_progress.quiz_completed_at`, which gates LO
completion, which gates the course-completion summary in LIC-52). That check
must **stay scoped to `practice_quiz` only** — answering set 2/3 questions
should never be required for, or trigger, LO completion.

So: add an optional `context` param to `submitQuizAttempt` (default
`"practice_quiz"` for backward compat with the existing quiz), thread it into
the `attempts` insert, and make sure `maybeMarkQuizComplete` keeps its
`.eq("context", "practice_quiz")` filters untouched. XP awarding
(`awardXpAndUpdateStreak`) is already context-agnostic — no change needed
there, answering set 2/3 questions should still earn XP normally.

### 5. UI — the button itself

Add to the LO page (`src/app/courses/pmq-in-5-days/lo/[loNumber]/page.tsx`),
right after the existing `<QuizRunner .../>` for set 1. New client component,
something like `GenerateQuizButton.tsx`:

- Only renders once `quizCompleted` is true (that variable already exists in
  the LO page — set 1 must be finished first).
- Three states: not entitled / entitled-set2-available / entitled-set3-available
  / all-unlocked.
- **Not entitled**: show the paywall, don't build a second bespoke one — reuse
  `AiTutorUpgradeCta` (compact variant already exists, already wired to the
  real Stripe checkout via `createAiTutorCheckout`). Consistent upsell surface
  across the AI tutor and the quiz sets, since they're the same purchase.
- **Entitled, 0/2 regenerations used**: "Generate Quiz" button. On click,
  calls `getQuizSet({ loNumber, setNumber: 2 })`, then renders a second
  `<QuizRunner questions={set2Questions} .../>` inline below the button
  (reuse the component as-is — it already takes `questions` as a generic
  prop, no changes needed there). Button then relabels to prompt set 3.
- **Entitled, 1/2 used**: same again for `setNumber: 3`.
- **2/2 used**: button disabled/hidden, something like "All 30 questions
  unlocked for this LO."

## Dev testing — my account is already entitled

I granted `simsamaarshened@gmail.com`'s account (`user_id
67e782d3-4cd6-47ac-a261-0c8ba8e80a01`) a real `feature_entitlements` row
directly in the `learn-in-curve` Supabase project (`feature: "ai_tutor"`,
`course_id` = the PMQ course id, `source: "free"`, `stripe_payment_id: null`)
so Sim can click-through test the paid path — AI tutor unlock, course
summary, and this quiz-sets feature once built — without a real Stripe
charge. `source = "free"` (not `"purchase"`) so it's clearly distinguishable
from a real transaction in any reporting. If you query
`feature_entitlements` and see that row, that's expected — it's not a bug or
stray test data.

## Definition of done

- Free/unentitled account: "Generate Quiz" surfaces the upsell
  (`AiTutorUpgradeCta`), no question data returned by the server action —
  verify via network tab, not just that the button is visually locked.
- Entitled account (Sim's own, per above): clicking through serves set 2 then
  set 3, 10 questions each, then locks out further clicks.
- Answering set 2/3 questions awards XP and records attempts under
  `context: "quiz_set_2"` / `"quiz_set_3"` — confirm this does **not** flip
  `section_progress.quiz_completed_at` on its own and does **not** double-fire
  the LIC-52 course-completion summary logic.
- Re-running `migrate-pmq-quiz-sets.mjs` twice is a no-op the second time.
- Spot-check at least LO1 (11 base questions, sets start at q12/q22) and one
  normal LO (10 base, sets start at q11/q21) — don't assume every LO's `quiz`
  array is exactly 10 long.

## When done

Log to `BUSINESS_STATE.md` per the usual documentation discipline. Move
LIC-22 to **Done** only after you've verified the full click-through
yourself (or Sim has) in a real browser — In Review isn't enough for this one
given it was already flagged Urgent for being publicly promised before it was
built.
