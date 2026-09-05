# Business State — Learn in Curve

Living summary of where the business/project stands. Updated whenever a meaningful change or decision happens — treat entries as a running log, newest first.

## Current phase

Phase 1 platform shell — in progress. Next.js app scaffolded at repo root with Supabase Auth, home page, dashboard, and PMQ course embedded via read-only static serving from `PMQ in 5 days/`. See `docs/roadmap.md` for the full phased plan.

## Key facts

- **Existing asset:** "PMQ in 5 days" is live at v1.7 with ~60 logins. Currently free and basic (static). It becomes the first course inside the new platform, later upgraded into the gamified/AI-tutor flagship experience (Phase 2).
- **Product thesis:** not a general PM learning platform — a gamified, interactive, exam-focused revision tool. Pitch: pay a small one-time fee for an interactive course rather than more for a static PDF.
- **Planned course catalog (project management category):** PMQ in 5 days (live), PFQ in 2 days (planned, first paid course), PMP in 5 days (planned), CAPM in 2 days (planned). Architecture must treat courses as a reusable, first-class concept from the start so new courses are a data/content insert, not a rebuild.
- **Monetization:** one-time unlocks, never subscriptions. Canonical prices live in `src/lib/courses/registry-data.ts` (`COURSE_STATIC[*].priceCents`) — that value is what Stripe charges and what the pricing cards render, so never quote a price anywhere without deriving it from there. As of 2026-08-28: **PMQ Pro Bundle £8** (Starter free), **PMQ AI Pro Bundle £15** (waitlist, indicative, not charged), **PFQ Pro Bundle £6** (no free slice), **PFQ AI Pro Bundle £12** (waitlist, indicative). The £5 Sly fair-usage credit (`SLY_UNLOCK_CREDIT_GBP_CENTS`) rides on the tier that actually carries Sly. Price history: £9.99 decided 2026-07-01, locked 2026-07-13/14, moved to £8 on 2026-07-31.
- **AI tutor scope:** answers questions on the topic currently being studied and surfaces performance/weak-area insights from quiz results. Deliberately not a general subject tutor — stays scoped to passing the specific exam.
- **Content pipeline (per course):** source material (textbook, NotebookLM-processed notes, videos) → curated knowledge base → Claude-generated quiz bank + tutor grounding, scoped strictly to exam content.
- **Design direction:** top-notch UI/UX is the main focus, retro 70s aesthetic, dedicated Learn in Curve brand kit applied consistently across the whole platform.
- **Voice mode** (ElevenLabs) is a later phase (Phase 5 / PRD's Phase 2), not part of the near-term build.
- No users, revenue, or infrastructure stood up for the new platform yet (no Supabase project, no Stripe account, no deployment) — the 60 logins are on the existing standalone "PMQ in 5 days" site.
- **How the backlog gets built:** Claude plans/specs/grooms Linear/verifies; **Cursor** (a separate AI coding agent Sim runs locally) executes the actual code changes, picking up work from `cursor-prompt-*.md` files Claude writes at the project root. Full definition in `CLAUDE.md` under "Collaborators & tools" — check there first if a session ever seems unsure what "Cursor" refers to.

- **2026-09-05** — PFQ trap-tag `--apply` after review: 40 approved proposals → 39 rows updated (append-only); tagged active questions 29 → 67. Second `--apply` wrote nothing (idempotent). Per-objective tagged counts: LO1 9, LO2 4, LO3 1, LO4 6, LO5 12, LO6 7, LO7 16, LO8 7, LO9 2, LO10 3. Absolutes/near_miss still mostly unapproved in the report unless flipped during review.

- **2026-09-05** — PFQ trap-tag backfill tooling (`cursor-prompt-pfq-trap-backfill.md`): added `src/lib/pfq/trap-tags.ts` (`TRAP_TAG_TO_MODULE` for parity §3b callouts) and `scripts/pfq/backfill-traps.ts` (`--report` / `--apply`, append-only, never auto-writes). Ran `--report`: 306 active, 29 tagged, checksum unchanged (`90395eea…`); negative_stem overlap 24/32 already tagged (+8 auto-approved candidates); multi_select 5/306 = 1.6% vs exam 10% (authoring gap); +85 absolutes and +34 near_miss all `approved: false`. Report at `scripts/pfq/trap-backfill-report.json`. No `--apply` yet — awaiting human review.

- **2026-09-05** — PFQ↔PMQ parity Phase 1 (shell + routes): generalised `PmqCourseHeader` → `src/components/course/CourseHeader.tsx` (+ moved `CourseChromeProgress`); `PmqCourseHeader` is a thin `slug={PMQ_SLUG}` wrapper. Moved `src/app/(site)/pfq/**` → `src/app/courses/pfq-in-2-days/**`; href constants, `revalidatePath`, sitemap/robots, soft-nav, catalog, and checkout cancel URL updated. Old `/pfq/*` 301s via `middleware.ts` + `next.config.ts` redirects. Verified: curl 301 for `/pfq`, `/pfq/learn`, `/pfq/pricing?x=1`, `/pfq/mock/abc-123`; new overview and learn routes in `npm run build`; PMQ call sites unchanged (wrapper only). Not verified this pass: signed-in progress row (no session in this environment) or PMQ pixel screenshots (overview/LO require auth).

- **2026-09-05** — LO1 mobile Core sticky header: replaced orange “Core” label with the shared teal `OutcomeCodeBadge` (same 1A/1B box as Orient Learning outcomes). (`Lo1CoreContentStudy`)

-