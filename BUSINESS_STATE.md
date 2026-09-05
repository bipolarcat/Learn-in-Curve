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

- **2026-09-05** — Dashboard PFQ course card uses the same chrome as PMQ (`DashboardPmqCourseCard` / `DashboardCourseCard`): title with orange “2 Days”, Pro badge, streak, completion %, exam deadline, Continue + Course overview. Tutor/Sly footer off for PFQ (`showTutorFooter={false}`). Resume + % from `getPfqDashboardCardState` (pathway stages × 10 LOs). (`dashboard/page.tsx`, `DashboardPmqCourseCard.tsx`, `lesson-actions.ts`)

-