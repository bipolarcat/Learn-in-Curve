# Session handover: Windows to MacBook migration

Written 2026-08-26 at the end of the migration. Project memory does not travel between machines, so this file is the record. Read it before doing anything with git or deployment.

Full runbook, including how everything was verified:
https://claude.ai/code/artifact/5d0deb19-398b-42d6-8a7e-d9311d2a4c41

---

## The three things that will bite you

**1. `master` is a deploy button, not a branch.**
Railway auto-deploys every push to `master`. On 2026-08-25 a push of unfinished work started a production deploy; it was cancelled in time and production never moved off `97b18c9`. Never push `master` unless the intent is literally "ship this now".

**2. Active work lives on `wip-2026-08-19`, not `master`.**
A fresh clone checks out `master`, which is the OLD production code from 19 August. Run `git switch wip-2026-08-19` or the work looks like it vanished.

**3. Deployment is Railway. It is NOT Vercel.**
The repo contains a `.vercel/` folder from an abandoned setup on 4 August, and the Vercel plugin is still enabled in the tracked `.cursor/settings.json`. Both are misleading leftovers. `PRD.md` is correct: Railway. Railway runs node@22.23.2, US West, 1 replica. There is no tracked deploy config of any kind, it is all dashboard-driven.

---

## Current state

| | |
|---|---|
| `origin/master` | `97b18c9` "SEO: real anchors, canonicals, noindex on signup, sitemap" — what production runs |
| `wip-2026-08-19` | all work from 13 to 19 August, ~80 Cursor checkpoint commits, plus Mac verification commits |
| Repo | `github.com/bipolarcat/Learn-in-Curve`, **PUBLIC** |
| Local path | `~/Projects/Learn-in-Curve` |
| Node | 24.15.0 locally via fnm; Railway builds on 22.23.2; `package.json` declares no `engines` |
| Railway auto-deploy | turned OFF during the migration, confirm before assuming a push deploys |

Verified working on the Mac 2026-08-26: `npm run build` green (15/15 tests, 76 routes), dev server serves on :3000, sign-in works, lesson audio plays.

## Things that are not in git

- `.env.local` — 13 vars, gitignored correctly. `NEXT_PUBLIC_SITE_URL` must be `http://localhost:3000` locally. `DEMO_SKIP_AUTH` is local-only and in no dashboard.
- `public/videos/pmq/*.mp4` — gitignored via the blanket `*.mp4` rule. Causes a known 404 on lesson video. Pre-existing, also affects production, deliberately deferred.
- NotebookLM `.mp4` masters — on the external drive at `F:\LIC`, ~1.4 GB. The matching `.m4a` audio IS tracked.
- `PMQ in 5 days/` — the old static site repo, deliberately left on the Windows laptop. That site is being retired.

`F:\LIC` on the external drive holds `PMP in 5 days` and the NotebookLM folder. Keep it until at least late September. The Windows laptop is still intact as a fallback.

## Workflow

Daily:
```
cd ~/Projects/Learn-in-Curve
git switch wip-2026-08-19
npm run dev
git push origin wip-2026-08-19    # end of session, safe, no deploy
```

Cursor's stop hook (`.cursor/hooks/git-checkpoint.mjs`) auto-commits after every turn, so commits accumulate without being asked for. The pre-commit hook also bumps `site-version` on every commit, so version numbers track commits rather than releases.

Shipping a finished slice, file level not commit level, because the checkpoint commits bundle unrelated files:
```
git fetch origin
git switch -c ship-<thing> origin/master
git checkout wip-2026-08-19 -- "src/path/one.tsx" "src/path/two.ts"
npm run build          # the gate
git push origin HEAD:master
```
If the build fails, take fewer files, not more. Paths containing `(site)` must be quoted.

Never `git rebase origin/master` on this repo. It replays all 80 checkpoint commits and re-hits the same conflicts. Use `git merge`.

## Open items

1. Lesson videos 404 (`public/videos/pmq`), deferred by Sim, files still on the Windows laptop.
2. `.cursor/mcp.json` is tracked and public. Keys were rotated so nothing live is exposed, but untrack it BEFORE pasting new keys in, or they leak again.
3. Staging environment. A second Railway service on `wip-2026-08-19` is the biggest workflow gap.
4. Build gate on merge, a GitHub Action running `npm run build` on a PR.
5. Pin Node so dev and production agree.
6. Delete `.vercel/` and disable the Vercel plugin in `.cursor/settings.json`.
7. Repo is 845 MB, 55 tracked `.m4a`, the same 24 recordings stored three times over.
8. Tracked junk at repo root: 15 zero-byte `.tsc*.log`, six `.tmp-*.png`, `.sync-check.tmp`.
9. `wip-2026-08-19` is a rescue branch name, not a workflow. Decide the branching model.
10. Retire pmqin5days: shut the Caddy host down, keep the 301 on the subdomain.
