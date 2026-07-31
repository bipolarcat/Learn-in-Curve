# Cursor prompt — Learn in Curve repo hygiene cleanup

**Scope boundary — read this first:** this task is scoped to the **root
`Learn in Curve` repo only**. Do **not** touch anything inside `PMQ in 5
days/` — that folder is a separate git repo for the live, published site
real users hit daily. It is explicitly out of scope for this cleanup, even
if you spot hygiene issues in there while working (note them, don't fix
them). Also do not touch `JUNK/` — it's a discard pile, never read or
modify it.

Claude audited the repo and hit a sandbox restriction that blocks all git
writes and file deletion from that session, so nothing below has been done
yet — it's all still needed.

## 1. Clear the stale git lock

`.git/index.lock` exists at the repo root, dated 2026-07-08 21:31, and is
empty (0 bytes). Confirm no live git process is actually running (`ps aux |
grep git`), then delete the lock file. This is blocking every git command
right now.

## 2. Commit the backlog of uncommitted work (the actual priority here)

`git status` currently shows ~68 modified/untracked files with zero commits
since 2026-07-03 — three-plus days of real, shipped work (the whole Wave
1/2/3 backlog, the AI tutor backend, legal doc updates) sitting only in the
working tree with no recovery point. Commit it. Doesn't need to be one
giant commit — group logically if it's easy (e.g. tutor backend/migration
as one commit, legal doc updates as another, UI/component changes as
another), but don't let perfect grouping block on getting this checked in
today. A single well-described commit is far better than another day of
nothing committed.

Untracked paths that need `git add`: `.claude/` (just `settings.local.json`
— fine to include), `src/app/api/tutor/`, `src/lib/tutor/`,
`supabase/migrations/`, `EXAM_TECHNIQUE_REWRITE_DRAFT.md`.

## 3. Delete the build cache

`.next/` (118MB) is a pure Next.js build artifact — already gitignored,
fully regenerates on `npm run dev`/`npm run build`. Delete it, zero risk.

## 4. Spot-check `.gitignore`

It already looks correct (env files, `node_modules/`, `.next/`, `JUNK/`,
`PMQ in 5 days/`, `tsconfig.tsbuildinfo`, debug logs are all covered) — just
confirm `tsconfig.tsbuildinfo` isn't actually tracked from before the
gitignore rule was added (`git ls-files | grep tsconfig.tsbuildinfo`); if it
is, `git rm --cached` it.

## 5. Archive (don't delete) stale Cursor handoff prompts

`cursor-prompt-lic17.md`, `cursor-prompt-lic42-ai-tutor.md`,
`cursor-prompt-quiz-content-and-migration.md`,
`cursor-prompt-quiz-content-rerun.md`, `cursor-prompt-wave1.md`,
`cursor-prompt-wave2.md` all correspond to Linear tickets now closed
(LIC-17/42 and the Wave 1/2 batch are Done). Move them into a new
`cursor-prompts/archive/` folder rather than deleting — they're a useful
record of what was actually asked for, and this project's convention favors
keeping a documented trail over silently removing history.

## 6. Optional, use judgment

`.cursor/skills/ui-ux-pro-max/data/*.csv` and `scripts/search.py` show as
modified — this looks like an installed Cursor skill's own data churning
during normal use, not project hygiene debt. Either commit as-is or add it
to `.gitignore` if it's going to keep showing noisy diffs every session —
your call.

## When done

Log what you did to `BUSINESS_STATE.md` (decision log, dated, brief) — this
project has an explicit convention of logging every meaningful change
there. No Linear ticket to move; this wasn't tracked as one.
