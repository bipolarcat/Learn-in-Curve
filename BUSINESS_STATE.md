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

- **2026-09-11** — Multi-column study tables: hoist Pair up / Group up onto the ## heading (same as two-col) on LO2; one hoist for mobile+desktop so icons aren’t duplicated (`StudyTable`).
- **2026-09-11** — LO2 heading + activity icons: true vertical align — fixed `h-9` row, title `leading-9`, no leftover `mt-5` on the heading (`CoreContentBlock`).
- **2026-09-11** — Reverted LO2 chrome heading center; title left / icons right again (`justify-between`) (`CoreContentBlock`).
- **2026-09-11** — LO2 Learn chrome headings: title + activity icons centered as one row (`justify-center`) (`CoreContentBlock`).
- **2026-09-11** — LO2 Learn headings: keep Pair up / Group up icons on the same row as the section title (drop `w-full` on chrome headings; `flex-nowrap` + `items-center`) (`CoreContentBlock`, `StudyTable`).
- **2026-09-11** — Two-col study tables (mobile): CSS module resets `.pmq-markdown table { my-4 }` + learn-core cell chrome with `!important` so gaps/borders stick (`StudyTable.module.css`).
- **2026-09-11** — Two-col study tables: kill stale top/bottom gap (`!my-0` + cell resets so `.pmq-markdown table` margin/borders don’t stack) (`StudyTable`).
- **2026-09-11** — Two-column study tables: real side-by-side `<table>` (header + vertical rule) instead of stacked term/meaning cards (`StudyTable` `TwoColumnTable`).
- **2026-09-11** — Pair up / Group up launcher icons: `size-6` (were too large at `size-8`) (`ActivityIcons`, `ActivityLauncher`).
- **2026-09-11** — Group up launcher: app-squircle icon (ink plate + teal/olive/gold/cream tiles; tiles converge on hover/open); sized like Pair up (`ActivityGroupupIcon`, `ActivityLauncher`).
- **2026-09-11** — Pair up icon: cream pillars + teal arrow (swapped) on orange plate (`ActivityPairupIcon`).
- **2026-09-11** — Pair up launcher icon: squircle plate fill → brand orange (`ActivityPairupIcon`).
- **2026-09-11** — Shared `ActivityCorrectMark` for Pair up + Group up correct ticks (one size/stroke); Group up float spacer uses `ACTIVITY_CORRECT_MARK_PX` so they can’t drift (`ActivityCorrectMark`, `Pairup`, `Groupup`).
- **2026-09-11** — Group up chips: empty float spacer for wrap-under + absolute Lucide check (data-URI tick wasn’t painting); swallow finish guarded once (`Groupup`).
- **2026-09-11** — Group up chips: float tick is a fixed 14×14 painted spacer (no flex/SVG children — iOS was inflating the float and blocking wrap-under). Activity modal focuses the panel, not the X, so no stale teal focus ring (`Groupup`, `ActivityModal`).
- **2026-09-11** — Group up placed chips: plain `li` + inline `float:right` tick (Framer was breaking float → tick left / huge gaps); `rounded-sm`, line-height 1.25 (`Groupup`).
- **2026-09-11** — Group up placed chips: softer `rounded-md`; tick `float-right` so line 2+ uses full width under the mark (`Groupup`).
- **2026-09-11** — Group up mobile trays: grid chip (tick top-right, no absolute), smaller type, no min-height / top-aligned so chips stay slim (`Groupup`).
- **2026-09-11** — Group up placed chips: mobile-safe tick gutter (`pl`/`pr` not `px`+`pr`), full-width `text-xs` label so wrap matches desktop (`Groupup`).
- **2026-09-11** — Group up placed chips: tick absolute top-right; label uses full row width so trays stay slim (`Groupup`).
- **2026-09-11** — Group up placed chips: top-aligned in trays (drop `mt-auto`) (`Groupup`).
- **2026-09-11** — Group up tray hints: use ≥12px + text-size-adjust so iOS Safari doesn’t inflate the dense caption on mobile (`Groupup`).
- **2026-09-11** — Group up: drag-only (removed tap card → tap tray); how-to copy matches (`Groupup`, `ActivityLauncher`).
- **2026-09-11** — Group up: no modal body scroll (drag can't auto-scroll); wide sheet + always 3-up trays when ≥3 buckets so the play fits the window (`ActivityModal`, `ActivityLauncher`, `Groupup`).
- **2026-09-11** — Group up pocket marks: body is stroke-only with a gap under the cap (`Groupup`).
- **2026-09-11** — Group up pocket marks: cap + rounded body only; dropped light wash fill / outline / flap highlight (`Groupup`).
- **2026-09-11** — Group up marks: reverted to original hinged-lid pocket SVGs (dropped arch niche + cap-tab/stripe experiments) (`Groupup`).
- **2026-09-11** — Group up marks: cap-tab folder (tab lifts on invite) + tone header stripe per tray; dropped arch niche (`Groupup`).
- **2026-09-11** — Group up category marks: dropped cartoon folder SVGs for LIC stamp niches (soft tone plate + opening arch well); swallow animation kept (`Groupup`).
- **2026-09-11** — Group up: removed per-pocket item count; miss/done status stays at the bottom like Pair up (`Groupup`).
- **2026-09-11** — Group up pockets: item count sits top-right as a quiet numeral (drops “N items” under the title) so the header stays narrow (`Groupup`).
- **2026-09-11** — Group up: Pair-up-level sleek chrome + Crouton/Matter pocket vessels (lid opens on hover); correct drops fly-and-swallow into the pocket (`Groupup`). Refs: Mobbin Crouton folders, Matter category tiles.
- **2026-09-11** — Pair up highlight: drop orange outlines (read as error); teal/ink wash + soft scale instead. Sheet chrome quieter (deeper shadow, rounder, capsule progress) (`Pairup`, `ActivityModal`).
- **2026-09-11** — Pair up chrome tidy: no modal header divider; how-to sits under title; drop term bullets; progress = dots only (status text only on miss/done) (`ActivityModal`, `ActivityLauncher`, `Pairup`).
- **2026-09-11** — Pair up visual polish: continuous Apple-style list (hairlines, inset wells, pill chips) instead of nested bordered cards; quieter copy/status + progress dots (`Pairup`).
- **2026-09-11** — Recall activities reimagined as distinct Apple-in-LIC play: Pair up = drag meaning onto term line; Lineup = grip reorder (tap-swap if reduced motion); Group up = drag into trays with instant lock/bounce. Shared `ActivityPlayChrome`; wider play modal (`ActivityModal` max-w-xl).
- **2026-09-11** — Activity modal open/close: Apple-style spring (21st.dev Motion Primitives — bounce 0.05) + separate backdrop fade; static blur to avoid choppiness (`ActivityModal`).
- **2026-09-11** — Removed study-table “Test yourself” / recall hide-reveal (`RecallToggle`); Pair up covers the same retrieval outcome. Two-column tables always show meanings (`StudyTable`).
- **2026-09-11** — Pair up bridge arrow thickened (heavier shaft + head) (`ActivityPairupIcon`).
- **2026-09-11** — Pair up thumbnail: cream arrow restored; squircle plate hardcoded to dark-mode paper `rgb(42 34 28)` so light + dark match the mobile dark look (`ActivityPairupIcon`).
- **2026-09-11** — Pair up squircle fill locked to `--avatar-plate-rgb` (not `--paper-rgb`) so dark mode on LO pages doesn’t turn the thumbnail plate near-black (`ActivityPairupIcon`).
- **2026-09-11** — Pair up launcher mark: iPhone-squircle thumbnail (twin teal pillars + cream bridge arrow, soft depth) — LIC palette, not the blue reference (`ActivityPairupIcon`).
- **2026-09-11** — Activity launchers: dropped teal chip chrome (border/fill); plain monoline icons only (`ActivityLauncher`).
- **2026-09-10** — Activity modals (Pair up / Lineup / Group up): centered popup on mobile too (was bottom sheet); full rounded-2xl (`ActivityModal`).
- **2026-09-10** — Recall activity launchers: replaced Lucide Link2/ListOrdered/LayoutGrid with custom monoline glyphs (`ActivityIcons`, same language as header menu) + MenuToggle-style morph on hover/open (`ActivityLauncher`).
- **2026-09-10** — LO2 section `##` headings: restored `font-semibold` + full ink (kept 15px so they stay below the 20px outcome title).
- **2026-09-10** — LO2 mobile outcome title: dropped `text-balance` so the first line fills the row instead of balancing wraps (`Lo1CoreContentStudy`).
- **2026-09-10** — LO2 Orient: outcome badges jump straight to Learn at that sub-outcome (`jumpToStage` marks Orient done — same as Continue). Wired via `LoOrientStage` → `LoStudyJourney` → `Lo1CoreContentStudy` `focusOutcomeCode`.
- **2026-09-10** — LO2 Learn hierarchy: outcome title 20px semibold ink; in-body `##` sections quieter (15px medium, ink/70) so they don’t compete with the sticky outcome title (`Lo1CoreContentStudy` / `CoreContentBlock`).
- **2026-09-10** — LO2 mobile Learn header: drop duplicate stamp beside title; larger outcome title (17px); no sticky header divider under switcher (`Lo1CoreContentStudy`).
- **2026-09-10** — LO2 mobile Learn header: outcome switcher above the outcome title (`Lo1CoreContentStudy`).
- **2026-09-10** — LO2 `OutcomeStampSwitcher`: selected thumb is teal with cream type (Apple segment shape kept).
- **2026-09-10** — LO2 `OutcomeStampSwitcher`: reverted ticket/stamp chrome; Apple-like segmented control (soft track, white sliding thumb, quiet type). Keeps spring thumb motion.
- **2026-09-10** — LO2 `OutcomeStampSwitcher` character pass: ticket-strip track (ink border, perforated edges, punch-dot dividers, sticker offset shadow) + selected code tilts like a rubber stamp; keeps 21st sliding thumb. No cute helper copy.
- **2026-09-10** — LO2 mobile outcome switcher reimagined: 21st.dev segmented-control style (`OutcomeStampSwitcher`) — equal segments, spring sliding teal thumb, stamp codes only (no expandable title clutter). Other LOs keep ExpandableTabs.
- **2026-09-10** — LO2 mobile Learn outcome switcher: ExpandableTabs use stamp `OutcomeCodeBadge` marks instead of Lucide icons (`expandable-tabs` `mark` slot + `Lo1CoreContentStudy`).
- **2026-09-10** — LO2 Learn: replaced exam-tip callout cards with **Insights** disclosure (bulb + label, click expands tip). Animated Lucide bulb from 21st.dev / `@animateicons/react` (`InsightsDisclosure`); other LOs keep `ExamTipCallout`.
- **2026-09-10** — LO2 stamp badge: removed inset ring; flat teal fill + cream type only (`OutcomeCodeBadge`).
- **2026-09-10** — LO2 only: trial ink-stamp `OutcomeCodeBadge` (`variant="stamp"` — filled teal, cream type) on Orient + Learn; other LOs keep outline. Flip `loNumber === 2` when rolling out.
- **2026-09-10** — LO2 Learn study tables only: Pair up + “Test yourself” sit on the section `##` heading row; removed the uppercase first-column label (e.g. LEVEL) above the table (`StudyTable` heading chrome + `CoreContentBlock` `loNumber === 2`). Other LOs unchanged until rolled out.
- **2026-09-08** — Orient Key definitions: tighter gap under heading (`tightBody` mt-0.5) before the reveal helper (`LoOrientStage` / `DefinitionsReveal`).
- **2026-09-08** — Orient Context body flush-left (no icon-column indent); heading row keeps gutter (`LoOrientStage` `flushBody`).
- **2026-09-08** — Orient: centre-align pathway icon with section headings (Learning outcomes / Context / Key definitions) via `items-center` on the title row only (`LoOrientStage`).
- **2026-09-08** — `OutcomeCodeBadge`: fixed square `size-7` for all LOs; type bumped to 11px (tighter tracking) so 1A–24C stay in the same box.
- **2026-09-08** — Orient parity LO2–24 with LO1: Learning outcomes → Context → Key definitions (same gutter/alignment). `LoStudyJourney` now always passes `key_definitions` to `LoOrientStage` and never to Learn.
- **2026-09-08** — LO3 Learn design: reuse LO1 notebook shell (`Lo1CoreContentStudy`) for LO3 — outcome rail, spine, mobile tabs — while keeping study tables + recall activities. Definitions stay on Learn for LO3; LO1 unchanged (defs on Orient).
- **2026-09-08** — LO3 Learn recall activities: Pair up / Lineup / Group up + worked-example launchers (Pro via `canAccessRecallActivities`). Components under `src/components/pmq/activities/`; wired through `StudyTable`, `CoreContentBlock` (`activities` prop), `LoLearnStage` + `LoStudyJourney` userTier. Starter sees no icons/padlocks. Content already in `content/v2/lo3.json`.
- **2026-09-08** — LO1 Learn desktop spine: reverted zipper/stitch experiment; restored original teal thumb scrollbar (`Lo1SpineScrollbar`, `Lo1CoreContentStudy`).
- **2026-09-08** — LO1 zipper spine tightened into one track: 1A–1D punches sit inside the scrollbar (same axis as zip); removed teal→orange gradient fill for solid teal progress (`Lo1SpineScrollbar`).
- **2026-09-08** — LO1 Learn desktop spine: replaced bland scrollbar with notebook zipper/stitch (`Lo1SpineScrollbar`) — perforated binding, ticket-punch 1A–1D notches (jump), orange zip pull scrubber; mobile progress bar unchanged. Wired from `Lo1CoreContentStudy`.
- **2026-09-07** — LO1 Learn impeccable fix-all (keep brand tokens): AA contrast (`ink/70+`, orange as wash/dot not micro-type), opaque sticky mobile header, touch ExpandableTabs + ledger/table targets ≥44px, wider spine scrollbar, focus rings, flatter takeaway. Touched `Lo1CoreContentStudy`, `Lo1InteractiveTable`, `Lo1SpineScrollbar`, `expandable-tabs`.
- **2026-09-07** — LO pathway: opening a partially complete learning objective always starts on Orient (no auto-jump to the next incomplete stage). Shared `StudyJourney` change; PMQ + PFQ. Progress ticks from `*_reached_at` unchanged.
- **2026-09-05** — Site header: Home Page menu icon → house with chimney (replacing parked van) in `SiteHeaderMenuIcons`.
- **2026-09-05** — Site header: Home menu item label **Home Page** + parked van icon (replacing porch light / "Back to Home") in `SiteHeaderMenu` / `SiteHeaderMenuIcons`.
- **2026-09-05** — Site header: Back to Home menu icon → porch light (replacing house) in `SiteHeaderMenuIcons`.
- **2026-09-05** — Site header: My dashboard menu icon → workstation (monitor + desk; replacing kanban board) in `SiteHeaderMenuIcons`.
- **2026-09-05** — Site header: Sign out menu icon → power-off mark (replacing animated door) in `SiteHeaderMenuIcons`.
- **2026-09-05** — Site header: The Shelf menu icon → Mac-style folder (replacing bookcase) in `SiteHeaderMenuIcons`.
- **2026-09-05** — Site header: Mock Me menu icon → dice (replacing stopwatch) in `SiteHeaderMenuIcons`.
- **2026-09-05** — Site header: Explore Courses menu icon → rocket (replacing stacked books) in `SiteHeaderMenuIcons`.
- **2026-09-05** — Site header: Mock Me menu icon → stopwatch (timed mock), replacing person+bulb in `SiteHeaderMenuIcons`.
- **2026-09-05** — Site header: Behind the Curve menu icon uses the real LIC logo (`fox-logo-png.png`) as a solid currentColor silhouette via CSS mask (not a hand-drawn outline).
- **2026-09-05** — Site header menu icons: matched monoline set in `SiteHeaderMenuIcons` (stacked books / shelf / person+bulb / LIC mark outline / home / board / talk / theme). Inspired by Mobbin settings sidebars + 21st.dev icon menus; replaces mixed Lucide picks.
- **2026-09-05** — Site header menu: icons on every overflow item (Back to Home, Explore Courses, Mock Me, The Shelf, Behind the Curve, Let's Talk, Theme; signed-in dashboard/sign-out already had icons) via Lucide in `SiteHeaderMenu`.
- **2026-09-05** — Site header: removed the Home icon chip from the bar; added **Back to Home** (house icon) as the first site link in the overflow menu (`SiteHeaderControls`, `SiteHeaderMenu`). Hidden on `/` only.
- **2026-09-05** — PFQ mock UI copy: "mock paper" → "mock exam" (console rows, runner, free-sample Pro blurb, Start/Resume/View/Finish labels).
- **2026-09-05** — PFQ Progress checkpoint: fire the same canvas-confetti celebration as PMQ (`LoCheckpointCelebration`) when the checklist transitions to fully ticked (`PfqCheckpointList`); respects reduced motion; does not re-fire on remount if already complete.
- **2026-09-05** — PFQ mock console PMQ parity: drop idle "Not attempted yet"; show In progress + live countdown timer, Passed / Completed · Refer; Start / Resume / View result (or Finish paper N first); summaries include activeAttemptId + endsAt from unsubmitted attempts.
- **2026-09-05** — PFQ mock console: Mock paper 1–3 "Start" buttons match Practise/Open (transparent ink text + arrow, no filled orange background).
- **2026-09-05** — PFQ mock console: Mock paper 1–3 rows now use explicit primary "Start" stamp buttons (same affordance language as Practise / Open), instead of full-row chevron clicks.
- **2026-09-05** — PFQ bank expansion platform (tip, mock_set, free sample, loader). **Verified:** `npx tsx scripts/pfq/load-questions.ts --dry-run` validates 55 LO4 rows in `content/pfq/questions/`; unit tests 17/17 (`pfq-bank-invariant` + `pfq-tiers`); `npm run build` clean; public payload assert rejects `tip`/`answer`/`explanation`; generator requires `mock_set` papers of 60/59 LOs/6 multi_select; free-sample picker is deterministic + cached; `PFQ_CHECKOUT_ENABLED` still false. **UI wired:** 3-paper mock picker (no auto-advance), `PfqTip` in practice + mock review, free sample at `/courses/pfq-in-2-days/practice/sample`, lessons/Trap School signed-in, full practice + mocks Pro. **Not verified live:** migration `20260905150000_pfq_tip_and_mock_set.sql` is in-repo but not applied to Supabase from this session (needs SQL editor / push); mock papers and free-sample end-to-end against production bank wait on columns + content load with `mock_set` assigned.
- **2026-09-05** — PFQ bank-expansion UI: three-paper mock picker (`PfqMockConsole` + `PfqMockRunner` via `?set=` / `listPfqMockSetSummaries` / `startPfqAttempt({ mockSet })`, no auto-advance between papers); `PfqTip` after explanations in practice + mock review; free-sample practice runner (`/practice/sample`, `startPfqFreeSamplePractice` / `finishPfqFreeSampleSummary`); practice index signed-in with free-sample CTA for all and objective grid Pro-only; lessons + Trap School signed-in (mocks + objective practice stay Pro).
- **2026-09-05** — Library hub width fix: gutter (`px-3 sm:px-5`) sits *outside* `max-w-wrap`, matching SiteHeader shell so hero/content edges align with the header bar (not inset by padding-inside-wrap).
- **2026-09-05** — Library hub shell width aligned to SiteHeader (`max-w-wrap` + `px-3 sm:px-5`) so `/library` content matches the header bar edge-to-edge.
- **2026-09-05** — Redesigned `/library` hub only (`LibraryHub` + `libraryIllustrations` + CSS module): illustrated hero, sticky browse/filter side panel (group + search), mobile chips/search, unique flat-retro plate art per guide and per section heading. Article routes `/library/[slug]` unchanged. Inspiration: Mobbin (Claude filter rail + illustrated cards, Codecademy subject sidebar, Uxcel/Deel illustration plates) + 21st grid/blog patterns; brand cream/orange/teal register kept.
- **2026-09-05** — Split PFQ “course overview” surfaces: `/courses/pfq-in-2-days` is marketing only (no study console). `/courses/pfq-in-2-days/learn` is the enrolled study overview matching PMQ rhythm (`CourseHeader` + `PfqOverview`: day-plan console, mock/practice/Trap School console, exam structure, syllabus weight, traps teaser). Coverage map removed from learn hub (stays on mock results). Dashboard + LO “Overview” links point at `/learn`, not the marketing page.

-