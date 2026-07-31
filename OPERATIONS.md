# Operations

Runbook for live-account support and known data-model gotchas. This is **not** where project history, decisions, or task tracking live — those stay in `BUSINESS_STATE.md` and Linear (team `LIC`) per the workflow in `CLAUDE.md`. This file is scoped to one thing: what to do when a real user hits a real problem, and what traps to avoid while doing it.

Add to this file whenever a support fix turns out to be non-obvious, or a fix gets done wrong once before getting done right (like the entry below).

## Admin playbooks

### Reset a user's course progress

Full reset (every LO back to not-started) touches **every completion signal** in `public.section_progress` — see the gotcha below for why they all matter. As of 2026-07-30 that's 9 fields, not 4 (the 5 pathway-stage timestamps were added for the progress-pie fix — see "LO progress pie" entry above). Always clear all of them in one statement:

```sql
-- 1. Find the user
select id from auth.users where email = '<email>';

-- 2. Reset everything for that user
update public.section_progress
set content_completed_at = null,
    quiz_completed_at = null,
    completed_at = null,
    checklist_state = '[]'::jsonb,
    orient_reached_at = null,
    learn_reached_at = null,
    video_reached_at = null,
    audio_reached_at = null,
    apply_reached_at = null,
    updated_at = now()
where user_id = '<uuid>';

-- 3. Verify
select count(*) filter (
    where content_completed_at is not null
       or quiz_completed_at is not null
       or completed_at is not null
       or checklist_state <> '[]'::jsonb
       or orient_reached_at is not null
       or learn_reached_at is not null
       or video_reached_at is not null
       or audio_reached_at is not null
       or apply_reached_at is not null
  ) as still_marked,
  count(*) as total
from public.section_progress where user_id = '<uuid>';
```

**If a future migration adds another stage timestamp or signal column**, add it to both the `update` and the verify `count(*) filter` above in the same commit — this playbook has already gone stale once (2026-07-30) when the 5 pathway columns shipped without an update here.

**As of 2026-07-30, "reset" also means clearing practice-quiz attempts by default — this is no longer optional/confirm-first scope.** Found the same day as the pathway-cache fix above: Sim reset both test accounts via this exact playbook, and the practice quiz on LO3 still showed prior answers, because `public.attempts` (the per-question answer history — separate from mock exam attempts, see below) was never touched. Sim's instruction: any LO or course reset now includes wiping that LO's/course's practice-quiz attempts too, standard scope, not a separate ask.

`public.attempts` rows for practice quizzes always have `exam_session_id IS NULL` (mock exam attempts have it set — those are handled by the separate playbook below and must not be touched here). There's no clean single-LO code on the `attempts` row itself (`learning_objective` is a free-text list of sub-topic codes like `"20a, 20b, 20c"` — not safe to pattern-match), so scope a single-LO reset through `questions.section_id` instead:

```sql
-- Whole course: every practice-quiz attempt for this user on this course
delete from public.attempts
where user_id = '<uuid>' and course_id = '<course_id>' and exam_session_id is null;

-- Single LO: only attempts on questions belonging to that section
delete from public.attempts
where user_id = '<uuid>'
  and exam_session_id is null
  and question_id in (select id from public.questions where section_id = '<section_id>');
```

Run whichever of these matches the reset's scope in the same pass as the `section_progress` update above — don't do one without the other, that's exactly how this gap got found.

**Explicitly out of scope (confirmed with Sim 2026-07-30, don't guess on this again):**
- **XP is not a live feature** — there's no XP system to reset or preserve; `user_course_stats.total_xp` and the derived `getPractiseQuizXp` count are not something to worry about either way when scoping a reset.
- **`user_course_stats` (streak) must never be touched by a content reset.** Streak tracks the user opening/using the course day to day, not lesson or quiz progress — it's a separate signal from everything above and should keep running across a reset, not zero out just because the LOs did.
- **`public.course_completion_reports`** (the downloadable end-of-course report) still isn't part of default scope — confirm separately if the ask is "make it look like they never touched the course at all."

Irreversible, no undo. Confirm the account and scope (single LO vs. whole course) before running.

### Reset a mock exam attempt (allow retake)

The app is one-sitting-only by design — there's no self-serve retake. Doing this manually is an admin override of that rule, not a routine action; only do it on explicit request, and confirm account + exam set first (typo'd emails happen — always cross-check against `auth.users` with `ilike` before running anything).

```sql
-- 1. Find the account (fuzzy-match if the email might be mistyped)
select id, email from auth.users where email ilike '%<fragment>%';

-- 2. See what's actually there before deleting anything
select es.id, es.exam_set, es.status, es.total_score, es.passed,
  (select count(*) from public.attempts a where a.exam_session_id = es.id) as attempt_count
from public.exam_sessions es where es.user_id = '<uuid>' order by es.exam_set;

-- 3. Delete the session and everything scoped to it (order matters — attempts/flags first)
delete from public.attempts where exam_session_id = '<session_id>' and user_id = '<uuid>';
delete from public.exam_question_flags where exam_session_id = '<session_id>' and user_id = '<uuid>';
delete from public.exam_sessions where id = '<session_id>' and user_id = '<uuid>' returning id, exam_set, status;

-- 4. Verify
select count(*) from public.exam_sessions where user_id = '<uuid>'; -- for that exam_set, should be 0
```

Irreversible — this deletes real scored attempt data (submitted answers, marks), not just a status flag. If the session being reset is `finalized` with a real score, confirm with whoever's asking that losing that record is intended, not just "make the badge go away." No `certificates` cleanup needed unless `passed = true` (check `public.certificates` for `exam_session_id` in that case).

## Data-model gotchas

### `section_progress` has two independent completion signals

**The trap:** it looks like completion is one thing (`completed_at` is set, or it isn't). It's actually two unrelated fields that both have to agree, or the UI looks half-reset:

1. **Timestamps** — `content_completed_at`, `quiz_completed_at`, `completed_at`. Drive the outer "LO complete" badge and the dashboard's overall course-complete rollup.
2. **`checklist_state`** — a jsonb array of checked checkpoint indices. Drives the in-LO checkpoint seal gate (`LoStudyJourney.tsx` → `canSealLo` in `src/lib/pmq/lo-stages.ts`). As of 2026-07-30, sealing an LO requires the checklist only — `quiz_completed_at` no longer gates Mark complete (client or `markSectionComplete`).

Found 2026-07-29: a progress reset cleared only the three timestamps. The outer badge updated correctly, but the in-LO pathway still showed complete, because `checklist_state` still held the full checked-index array from an earlier test seed. Nothing in the reset touched it because nothing about the schema suggests it should be treated separately — it just is.

**Rule going forward:** treat any "reset" or "mark incomplete" action on `section_progress` as incomplete unless it clears all four fields together (see playbook above).

### There's a third completion signal, and it's client-only

**The trap:** even after both DB signals above are correctly cleared, the in-LO stage journey (Orient/Learn/Apply/Checkpoint pills) can keep showing every stage as done. This is not a DB problem at all — `LoStudyJourney.tsx` caches which stages the user has clicked through in `window.sessionStorage`, key `lic-lo-journey-v2-<loNumber>`, entirely separate from `section_progress`. No admin SQL can touch it, because it lives in the user's browser, not the database.

Found 2026-07-29, same incident as above: after both DB fields were fixed, the stage pills still showed complete because the browser tab's `sessionStorage` still held the `doneIds` snapshot from before the reset, and the component blindly trusted it on load.

**Fixed in code** (`LoStudyJourney.tsx` hydration effect): on mount, if the cached `doneIds` claims every stage is done but the server (`isSectionCompleted` prop, from `completed_at`) says the LO isn't sealed, the cache is treated as stale and discarded — the journey starts fresh instead of trusting a snapshot the backend no longer agrees with. This self-heals on the user's next page load; no manual `sessionStorage` clearing needed once this fix has shipped.

**Rule going forward:** any future client-side progress/journey cache in this app must reconcile against server props on hydration, not just restore blindly. If you add a new one, ask "what happens to this cache when an admin resets the account server-side?" before shipping it.

### LO progress pie / overall progress bar was reading the client-only cache above

**Fixed 2026-07-30.** Same root cause as the entry directly above, new symptom: Sim added a per-LO progress pie chart and the overall course progress bar, and both fed off `getLoJourneyReachedCount()` — i.e. the same `sessionStorage` snapshot already documented as unreliable (resets per tab, never syncs across devices, doesn't survive a server-side reset). This is a new manifestation of the known pattern, not a new bug class.

Sim gave explicit progress-calculation rules and required no guesswork on the ambiguous parts (confirmed via `AskUserQuestion` before building):
- Every LO pathway has **7 stages** — Orient, Learn, Video, Audio, Apply, Quiz, Checkpoint — each worth an **even 1/7 slice** of that LO's pie (not the illustrative 80/20 split Sim used in his example).
- Checkpoint is **all-or-nothing**: the pie stays at 6/7 until every checklist box is ticked, then jumps straight to 7/7 + a tick mark replaces the pie (no partial credit for a partially-checked checklist).
- **Overall course progress = simple average of all 24 LOs' individual percentages** (sum ÷ 24), every LO weighted equally.

**DB change:** migration `add_lo_pre_quiz_stage_timestamps` added five new nullable columns to `section_progress` — `orient_reached_at`, `learn_reached_at`, `video_reached_at`, `audio_reached_at`, `apply_reached_at` — each set once, idempotently, via the new `markLoStageReached` server action the first time the user reaches that stage. Quiz and Checkpoint don't get new columns; they reuse the existing `quiz_completed_at` and `completed_at` (the latter is only set once the full checklist is done, via `tryMarkSectionCompleteIfReady`, which is exactly the all-or-nothing semantics needed).

**Mechanism:** `getLoReachedCountFromProgress()` (`lo-stages.ts`) is now the single shared source of truth — counts how many of the 7 `*_reached_at`/`quiz_completed_at`/`completed_at` fields are non-null, straight from the DB row. `getCourseCompletion()` (`queries.ts`) averages this across all 24 sections for the overall bar; `getLoStageReachedMap()` (`queries.ts`) supplies the per-section count the day-plan pies use. At the time this entry was first written, `getLoJourneyReachedCount()` and its `sessionStorage` cache were kept around for same-tab "which stage to resume on" continuity — **that turned out to be wrong and was removed the same day; see the entry directly below.**

**Rule going forward (superseded, see below):** ~~the client-side journey cache in `LoStudyJourney.tsx` is fine for "which stage was I on in this tab" but must never again be the source of truth for anything that renders as "% done."~~ It wasn't fine even for that — see next entry. If a future stage gets added to the pathway, it needs its own `*_reached_at` column (or a documented reuse of an existing timestamp) wired into `getLoReachedCountFromProgress` and `STAGE_REACHED_COLUMN`, not a client-only flag.

### The "keep the cache for resume position" call above was wrong — reset didn't reset the in-LO pathway

**Fixed 2026-07-30, hours after the entry above shipped.** Sim reset both test accounts to zero via the playbook above, then walked LO2 start to finish (progress climbed 1/7 → 7/7 correctly — that part worked). Moving on to LO3, the page opened **directly on the Quiz stage** instead of Orient, with no Continue-button unlocking in between.

**Root cause:** the previous entry's decision to keep `LoStudyJourney.tsx`'s `sessionStorage` cache (key `lic-lo-journey-v2-<loNumber>`) for "same-tab resume position" was itself unsafe. The hydration effect unioned DB-confirmed stages with whatever the cache remembered, and only discarded the cache if it claimed *every single stage* was done. LO3 had been visited before (in an earlier test pass) up to Quiz but not Checkpoint — so the "all 7 done" stale-guard never tripped, the DB reset was ignored, and the cache's old `currentId` (Quiz) and `doneIds` won. Same failure shape as the two prior entries above, just triggered by a partial (not full) stale cache.

**Fixed by removing the cache outright**, not patching the guard again: `LoStudyJourney.tsx` no longer reads or writes `sessionStorage` at all. `getLoJourneyReachedCount()` and `loJourneyStorageKey()` are deleted from `lo-stages.ts` (had zero other call sites — verified by grep before deleting). The hydration effect now derives both `doneIds` and `currentId` from `dbReachedStageIds`/`quizCompleted`/`isSectionCompleted` alone, every mount, with no client-side memory layered on top. This works because a stage's `*_reached_at` is only written when the learner clicks Continue *off* that stage (`advance()` in the same file) — so "the stage right after the furthest DB-confirmed stage" is always exactly where they left off. No cache was needed for that; it only ever introduced a way for the UI to disagree with the database.

**Why this is different from "fine to keep a client cache for position, just not for %":** that framing (previous entry) assumed a client cache could safely hold *some* truth as long as it wasn't the progress number. In practice any client-only "done stages" memory is the same failure mode regardless of what it's used for — it has no way to learn that the account was reset. The fix is to not have one, not to scope it more narrowly.

**If a user reports "I reset but LO N still shows old progress / opens on the wrong stage":** this class of bug should now be structurally impossible (nothing left to go stale), so first check whether the fix above has actually been deployed — `LoStudyJourney.tsx` should have no `sessionStorage` references at all. If it does, the removal got reverted or bypassed; re-apply it rather than re-adding a guard.

**Rule going forward:** don't add a new client-only cache to paper over "which stage/step a user is on" for anything backed by a resettable server record, even scoped narrowly ("just for resume position, not for %"). If the position can be derived from data the server already has (as it can here — furthest reached stage + 1), derive it fresh every time instead of remembering it client-side.

### Profile save showed an error even though the save succeeded (SOLVED 2026-07-30)

**Root cause — confirmed, not a theory.** `DashboardProfileMenu.handleSubmit` read `e.currentTarget` *after* `await saveUserProfile(...)`:

```ts
const result = await saveUserProfile(formData);
const nextBaseline = readFormSnapshot(e.currentTarget, avatarId); // ← null here
```

`e.currentTarget` is only valid while the event is dispatching — the DOM sets it to `null` as soon as the handler's synchronous portion returns. (This is DOM behaviour, not React 17 event pooling, which is why it survived the React upgrade.) After the await it was `null`, so `readFormSnapshot(null)` threw inside `new FormData(null)`. That throw hit the `catch`, which set "Couldn't save your profile. Try again."

**The save had already succeeded.** That's why this was so hard to see: the row was written, `revalidatePath` ran, the action returned `{ok:true}` — then the *client* threw while updating its own dirty-state baseline. Every previous investigation looked for a failed write, and there wasn't one.

**How it was finally caught:** by checking the data instead of the code path. Reported live on `sim.samaar@yahoo.in`; a query showed that profile's `updated_at` was 57 seconds old with `profession` populated — i.e. the write the user was told had failed. Once "the save works and the error is false" was established, the only place left to look was the post-await client code.

**Fix:** capture the form element before any await (`const form = e.currentTarget`) and use that reference afterwards.

**Lesson for this codebase:** when a user reports "it didn't save," query the row's `updated_at` before reading any code. Distinguishing *"the write failed"* from *"the write worked and the UI lied"* halves the search space immediately, and the second case is invisible in Postgres logs — which is exactly why three earlier passes found nothing. Also: `QuizRunner.tsx:532` does this correctly (`const target = event.currentTarget` before `startTransition`) — that's the pattern to copy.

---

**Original investigation notes (superseded by the above, kept for context):**

**Symptom:** Sim hit "Couldn't save your profile. Try again." on `simsamaarshened@gmail.com` while running locally (`http://localhost:3000`, per the auth logs at the time).

**Checked and ruled out (2026-07-30):** this is *not* a data-layer bug, as far as the evidence goes —
- `public.profiles` schema, `profiles_age_check`/`profiles_avatar_id_check`/PK/FK constraints all match the app's own validation exactly (age 13–120, avatar in the 5-value enum). No mismatch.
- RLS policies (`profiles_insert_own`/`_select_own`/`_update_own`) are all plain `auth.uid() = user_id`, nothing unusual.
- Postgres logs for the project show zero errors referencing `profiles` around the incident (only an unrelated stale `attempts_context_check` error from the earlier, already-fixed incident, and routine checkpoint noise).
- The user's `profiles` row already exists with valid, sensible data and a recent `updated_at` — so saves are getting through at least some of the time.

**Why no root cause is written down here:** the exact thrown error was never seen — `DashboardProfileMenu.tsx`'s save handler had an empty `catch {}` that only set the generic UI message, with nothing logged anywhere. Since nothing reached Postgres (confirmed by the logs above), whatever threw did so client-side or in the Server Action layer, on Sim's own machine — a `next dev` process I have no visibility into (unlike Postgres, there's no `get_logs` for a local dev server).

**Most likely explanation, unconfirmed:** local dev, not production. Editing a `"use server"` file while `next dev` is running can invalidate the opaque Server Action ID a client bundle is holding — the next call to it throws a generic fetch error client-side (a well-known Next.js App Router dev-mode quirk, not a data bug). Several server files were edited earlier the same session. This is a guess, not a diagnosis — flagged as such rather than written up as fact.

**Fixed the actual gap (2026-07-30):** the empty `catch {}` in `DashboardProfileMenu.tsx` now does `console.error("[DashboardProfileMenu] saveUserProfile threw:", err)` before setting the UI message, so the real error is visible in browser DevTools next time instead of being silently swallowed.

**If this happens again:** open DevTools Console (now logs the real error) and the Network tab (look at the failed request to see if it's a 4xx/5xx from the server action, a network-level failure, or something else), and check whether it happens on the deployed site too or only in local dev with the server running. That distinction — reproducible in production vs. local-dev-only — is the one piece of evidence that would actually confirm or rule out the Server-Action-staleness theory above. Bring back the DevTools error text rather than just "it happened again."

### Mock exam break window (`exam_sessions`) wasn't enforced

**The trap:** `break_ends_at` was written the moment a session entered `status = 'break'` (Part 1 submitted) but nothing ever read it back. `startMockPartTwo` only checked `status === 'break'`, not whether the 30-minute window had actually passed — so a session could sit "on break" for days and still resume into a brand-new full-length Part 2 window, blowing past the intended 180-minute total (75 Part 1 + 30 break + 75 Part 2).

Found and fixed 2026-07-29. Fix: `expireBreakIfNeeded()` in `src/lib/pmq/mock-domain.ts` — a lazy, on-read check (no cron in this app) that flips an expired `break` session straight to `status = 'abandoned'` (0 score, not passed — same terminal state the existing user-initiated "abandon exam" button already uses, not a partial-credit finalize of Part 1 alone). Wired into the three places a session gets touched:
- `startMockPartTwo` (`mock-actions.ts`) — the actual resume action; now rejects with "Break time ran out" instead of granting a fresh window.
- `getActiveExamSession` (`queries.ts`) — the exam runner page load.
- `getMockExamSetSummaries` (`queries.ts`) — the exam selector list (this is what was showing "On break" indefinitely).

**Rule going forward:** any deadline/window field on `exam_sessions` (or a future timed feature) needs an enforcement point, not just a stored timestamp. Storing `X_ends_at` and never checking `isDeadlineExpired(X_ends_at)` anywhere is the same shape of bug as this one — grep for the field's write site and confirm there's a matching read-and-enforce site before shipping.

**If you find another account stuck like this:** check `exam_sessions` for `status = 'break'` with `break_ends_at` in the past, or `status = 'active'` with a suspiciously distant `part_2_started_at` relative to `break_ends_at` (meaning they resumed after this fix should have blocked it, or before this fix shipped). If no Part 2 attempts exist yet (`select count(*) from attempts join questions on questions.id = attempts.question_id where attempts.exam_session_id = '<id>' and questions.part = 2`), it's safe to force-abandon:
```sql
update public.exam_sessions
set status = 'abandoned', submitted_at = now(), passed = false, total_score = 0
where id = '<session_id>' and user_id = '<user_id>';
```
If Part 2 attempts already exist, stop and ask before touching it — that's real answer data, not a clean bug case.

**Follow-up found the same day:** setting `status = 'abandoned'` wasn't enough on its own — `MockExamRunner.tsx`'s `initialPhase()` maps DB status to UI phase and had no branch for `"abandoned"`, so it fell through to the default `"exam"` phase and the user could still answer Part 2 on a session the selector correctly labeled "Time expired." Fixed by routing `abandoned` into the same read-only `"results"` phase used for `finalized` (score/passed are already 0/false on abandon, so it renders sensibly). Also updated `mockExamSelectorState`'s action label so `abandoned` shows "View result →" instead of "Start Exam →". **Lesson:** a status value isn't actually enforced until every place that branches on status has a case for it — the DB write, the list/selector label, *and* the detail-page phase router are three separate switch statements over the same field, and this bug shipped with only two of the three updated.

### `mockExamSelectorState`'s "Finish Exam X first" block didn't exempt completed exams

**The trap:** the block that stops a user opening a *second* Pro exam while one is already in progress checked only "is a different exam set active" — not "is *this* exam set already finished." Result: a finalized (or abandoned) exam set showed "Finish Exam N first" instead of "View Exam N result" any time another exam set had an open session, because the check ran before the terminal-status branch that would've produced the correct label.

Found and fixed 2026-07-29 (`simsamaarshened@gmail.com`: Exam 2 finalized, Exam 3 active mid-session — Exam 2's row showed "Finish Exam 3 first"). Fix: `mockExamSelectorState` (`mock-domain.ts`) now checks `latestStatus === "finalized" || "abandoned"` first and skips the block entirely for terminal exam sets, since a finished exam can't be "started" or "resumed" and so can never legitimately be blocked by another exam being active.

**Rule going forward:** any "block action X while Y is in progress" guard needs to ask "is X itself even attemptable right now?" before asking "is something else blocking it?" — order of these two checks matters, and this is the same status-enforcement-per-branch pattern as the entries above.

### Active exam-part timeout had no server-side enforcement

**Fixed 2026-07-30.** The 30-minute *break* window was already enforced server-side (`expireBreakIfNeeded`), but the 75-minute *active part* window (Part 1 or Part 2) was only enforced client-side — `MockExamRunner.tsx` only submits the part automatically when its on-screen timer hits zero, which never runs if the tab is closed or the user never returns. Reported live 2026-07-30 (`simsamaarshened@gmail.com`): left mid-Part-1, came back later, and reopening triggered the client's timer-zero handler at *click time* — anchoring `break_started_at`/`break_ends_at` to the moment they clicked instead of the deadline that had actually passed, silently granting extra time and defeating the intended 75+30+75 = 180-minute budget.

Fix: `expireBreakIfNeeded` in `src/lib/pmq/mock-domain.ts` now does three things, checked in order, any time a session is read (same three call sites as before, plus `ownedSession` in `mock-actions.ts` — so every server action self-heals first, not just page loads):
1. **Hard 180-minute backstop** from `started_at`, across every open status (`active`, `break`, `self_assessing`, `grading`) — abandons unconditionally, no matter what state the session is stuck in.
2. **Part 1 left unattended past its own 75-minute deadline** — transitions to `"break"` anchored to the true `part_1_deadline_at`, not read-time, so the break timer is always correct even if nobody opens the exam again for hours.
3. **Part 2 left unattended past its own 75-minute deadline** — abandons (0 score) rather than lazily triggering real, billed AI grading from a passive page load. This resolves the product decision this section previously flagged as open: option (b), zero-score/abandon, not (a) lazy real grading.

Plus the original break-expiry check (unchanged): an unattended break window abandons rather than letting Part 2 start days later.

**Rule going forward:** same as the break-window entry above — any deadline field on `exam_sessions` needs an enforcement point wired into every place the row is read, not just the client-side timer. `ownedSession` in `mock-actions.ts` is now the single choke point for all mutating actions; if a new action bypasses it and queries `exam_sessions` directly, it won't get this reconciliation for free.

### `attempts` and `questions` context check constraints drifted out of sync

**The trap:** `public.questions.context` allows `practice_quiz`, `mock_exam`, and `quiz_set_2` through `quiz_set_8` (the paid AI-tutor-unlocked extra practice sets, added for LIC-22/LIC-59). `public.attempts.context` was never updated to match — it only allowed `practice_quiz`/`mock_exam`. Any answer submitted against a `quiz_set_N` question hit `attempts_context_check` and failed the insert in `submitQuizAttempt` (`actions.ts`), surfacing to the user as the generic "Your answer is shown, but it wasn't saved" toast in `QuizRunner.tsx` — with no server-side log to explain why, so the only way to find the real cause was reading raw Postgres logs directly.

Found live 2026-07-30 (`simsamaarshened@gmail.com`, reported while answering paid-tier quiz-set questions). Confirmed via `get_logs` (postgres service): two `"new row for relation \"attempts\" violates check constraint \"attempts_context_check\""` errors. Fixed via migration `fix_attempts_context_check_quiz_sets` — `attempts_context_check` now allows the same context list as `questions_context_check`.

Also fixed while in there: `submitQuizAttempt` now `console.error`s the actual Postgres error (user/question/context) on any DB insert failure instead of silently returning it to the client with no server-side trace, and the "not signed in" case is now returned as a distinct `"not_signed_in"` error code (was a generic `"Not signed in"` string indistinguishable from a DB error) — `QuizRunner.tsx`'s toast and retry button both branch on this now: session-expiry shows "sign in again" copy with a **Reload to sign in** action, a real DB error shows the original retry-save copy and action.

**Rule going forward:** whenever a new `context` value is added to `questions` (a new quiz-set tier, a new exam mode, etc.), `attempts_context_check` must be updated in the same migration — these two constraints have no shared source of truth (no enum type, no generated check), so they will silently drift again unless both are touched together on purpose. Consider replacing both inline `CHECK` clauses with a single Postgres `domain` or enum type as a follow-up so this class of drift becomes impossible instead of just documented.
