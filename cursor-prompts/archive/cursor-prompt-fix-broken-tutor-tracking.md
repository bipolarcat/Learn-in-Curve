# Cursor prompt — URGENT: fix broken git tracking on the AI tutor backend before touching anything else

**Do this before any other work on this repo.** The last hygiene pass left
the working tree in a state where committing right now would delete real,
working code from git history.

## What's wrong

`git status` currently shows these as **staged deletions**:

- `src/lib/tutor/buildSystemPrompt.ts`
- `src/lib/tutor/callTutorModel.ts`
- `src/lib/tutor/constants.ts`
- `src/lib/tutor/course-completion-summary.ts`
- `src/lib/tutor/fair-usage.ts`
- `src/lib/tutor/loadLoContent.ts`
- `src/lib/tutor/tutor-db.ts`
- `src/lib/tutor/types.ts`
- `src/types/database.ts`
- `src/types/pmq.ts`
- `supabase/functions/survey/index.ts`
- `supabase/migrations/20260708120000_tutor_messages.sql`
- `tailwind.config.ts`
- `tsconfig.json`

At the same time, `src/lib/tutor/`, `src/types/`, `supabase/`,
`tailwind.config.ts`, and `tsconfig.json` all show up again as **untracked**.
That means the files physically exist on disk (nothing is actually lost
right now), but git's index has them recorded as removed rather than as the
current versions — almost certainly from a `git rm`/move that wasn't
followed by `git add` on the recreated files.

**If anyone commits in this state, it deletes the entire AI tutor backend
and the project's Tailwind/TypeScript config from git history**, even
though the working files are fine today. This is the highest-priority fix
— everything else waits on it.

## Fix

1. Confirm the untracked versions of each file above are correct/current
   (diff against the last known-good commit if unsure — `a200c34` should
   have the tutor backend as it was before this broke).
2. `git add` the untracked files so they replace the staged deletions
   (`git add src/lib/tutor/ src/types/ supabase/ tailwind.config.ts
   tsconfig.json`).
3. Confirm `git status` shows normal modifications/additions, not deletions,
   for any of the paths above.
4. Commit with a clear message (e.g. `fix: restore tutor backend + config
   tracking after hygiene pass broke git index`).
5. Re-run `git status` and confirm it's actually clean — don't just assert
   it, paste the output.

## Also still true from the original hygiene prompt

- Confirm no live git process is actually holding `.git/index.lock` —
  Claude's sandbox still sees a stale one dated 2026-07-08 21:31 that it
  cannot remove or write past; worth deleting it directly if it's genuinely
  not needed.
- Scope stays the same: don't touch `PMQ in 5 days/` or `JUNK/`.

## When done

Log to `BUSINESS_STATE.md` with the actual verified `git status` output
pasted in, not a summary — this specific ticket is about a prior "done"
claim not matching reality, so the log entry should be checkable.
