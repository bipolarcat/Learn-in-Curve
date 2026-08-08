# Business State — Learn in Curve

Living summary of where the business/project stands. Updated whenever a meaningful change or decision happens — treat entries as a running log, newest first.

## Current phase

Phase 1 platform shell — in progress. Next.js app scaffolded at repo root with Supabase Auth, home page, dashboard, and PMQ course embedded via read-only static serving from `PMQ in 5 days/`. See `docs/roadmap.md` for the full phased plan.

## Key facts

- **Existing asset:** "PMQ in 5 days" is live at v1.7 with ~60 logins. Currently free and basic (static). It becomes the first course inside the new platform, later upgraded into the gamified/AI-tutor flagship experience (Phase 2).
- **Product thesis:** not a general PM learning platform — a gamified, interactive, exam-focused revision tool. Pitch: pay a small one-time fee for an interactive course rather than more for a static PDF.
- **Planned course catalog (project management category):** PMQ in 5 days (live), PFQ in 2 days (planned, first paid course), PMP in 5 days (planned), CAPM in 2 days (planned). Architecture must treat courses as a reusable, first-class concept from the start so new courses are a data/content insert, not a rebuild.
- **Monetization:** PMQ Premium bundle is a one-time **Â£9.99** unlock (includes Â£5 Sly fair-usage credit), not a subscription. Future courses may use their own one-time prices. Decided originally 2026-07-01; Premium price locked at Â£9.99 on 2026-07-13/14.
- **AI tutor scope:** answers questions on the topic currently being studied and surfaces performance/weak-area insights from quiz results. Deliberately not a general subject tutor — stays scoped to passing the specific exam.
- **Content pipeline (per course):** source material (textbook, NotebookLM-processed notes, videos) → curated knowledge base → Claude-generated quiz bank + tutor grounding, scoped strictly to exam content.
- **Design direction:** top-notch UI/UX is the main focus, retro 70s aesthetic, dedicated Learn in Curve brand kit applied consistently across the whole platform.
- **Voice mode** (ElevenLabs) is a later phase (Phase 5 / PRD's Phase 2), not part of the near-term build.
- No users, revenue, or infrastructure stood up for the new platform yet (no Supabase project, no Stripe account, no deployment) — the 60 logins are on the existing standalone "PMQ in 5 days" site.
- **How the backlog gets built:** Claude plans/specs/grooms Linear/verifies; **Cursor** (a separate AI coding agent Sim runs locally) executes the actual code changes, picking up work from `cursor-prompt-*.md` files Claude writes at the project root. Full definition in `CLAUDE.md` under "Collaborators & tools" — check there first if a session ever seems unsure what "Cursor" refers to.

- **2026-07-03** — Investigated a reported "LO1 doesn't match" issue. Verified live via browser (both the new native `/courses/pmq-in-5-days/lo/1` and the old static `lo.html?lo=1`) — both correctly show the rebuilt LO1 content (11 questions, matching definitions), confirming `app.js` fetches from `content/lo*.json` (the folder edited all session), not the separate `PMQ in 5 days/JSON content/` folder (a stale, untouched duplicate of all 24 LOs — still has the old difficulty/time fields and original quiz banks. Not used by any live code path per a grep of `app.js`, but worth deleting or renaming to avoid future confusion — flagged to user, not deleted without confirmation). Did find and fix one real regression: `lo.html`'s hero pills still referenced `data.estimated_study_time_minutes` and `data.difficulty`, which were removed from the JSON earlier — rendering as "undefined min" / "undefined". Fixed by removing those two pills from `lo.html`, leaving just the question-count pill.

## Decision log

- **2026-08-08** — Site version set to **2.40** and pushed to `origin/master` (`2b41953`) for Railway production. Live www still showed **v2.39** at check time (library/free-mock 404) — Railway deploy not confirmed from this session (CLI unauthorized; not Vercel).

- **2026-08-08** — Library hub: removed intro subhead under “APM PMQ guides”.

- **2026-08-08** — Free mock soft-nav back: `?from=home|library` → “Go back to home/library” with ring spinner (`FREE_MOCK_SOFT_NAV_BACK`); hero + library entry points set `from` via `withSoftNavFrom` / `FreeMockExamLink`.

- **2026-08-08** — Library article free-mock CTA: “Start free PMQ mock exam” + right arrow (`showArrow` on `FreeMockExamLink`).

- **2026-08-08** — Library article free-mock CTA label → “Start free PMQ mock exam”.

- **2026-08-08** — Library layout: article reading card stops above FAQ; FAQ + free-mock CTA are separate full-width cards; Related + APM disclaimer uncarded. Hub opaque card removed. Soft-nav: ring on breadcrumbs/topics/related; ellipsis on free-mock CTAs (`LibrarySoftNavLink`, `FreeMockExamLink`).

- **2026-08-08** — Library hub + article pages: opaque paper reading card (`productSurfaceOpaque`) so body copy sits above the site dot grid.

- **2026-08-08** — Reverted home hero subhead to prior copy (“Sharpen your project management skills…”).

- **2026-08-08** — Home hero subhead copy → “Exam revision that works… Free to start.” (`page.tsx`).

- **2026-08-08** — Hero Free PMQ CTA: removed arrow icon from `FreeMockExamLink`.

- **2026-08-08** — Free mock FAQ heading: “asked” in orange (`FaqAccordion` title ReactNode).

- **2026-08-08** — FAQ accordion width fix: answers always `text-wrap: wrap` (dropped `pretty`, which left unused right space above 640px); side padding aligned to titleBar; `w-full`/`min-w-0` on shell/clip/panel.

- **2026-08-08** — FAQ accordion answers fill card width on mobile (`text-wrap: wrap` + `width: 100%`; pretty wrap from `sm` up) in `FaqAccordion.module.css`.

- **2026-08-08** — Free mock: removed page-header “Free readiness check” eyebrow; quiz-card eyebrow copy → “Free mock exam”.

- **2026-08-08** — Free mock quiz-card eyebrow (“Free readiness check”) reduced to 9px / 10px sm.

- **2026-08-08** — Free mock intro copy uses full section width on mobile (`w-full`; forced line breaks from `sm` up only).

- **2026-08-08** — Free mock polish: answered rail cells use subtle grey `qCellDone` (not teal/green); FAQ + disclaimer widened to `max-w-[46rem]`; nav CTAs compact; intro copy one block on three lines (“Complete it within 10 minutes”).

- **2026-08-08** — Free mock polish follow-up: hero Free PMQ CTA uses Explore-style soft-nav + teal fill (`FreeMockExamLink`); header Free mock chip removed; free-mock eyebrow restored, orange “PMQ” in H1, 5-minute line on its own row; quiz Continue bars only while clicking (not hover/disabled wait); answered rail cells use stronger teal `qCellDone`.

- **2026-08-08** — Free mock exam UX polish: hero CTA "Free PMQ mock exam"; header drops Library chip and scroll-reveals Free mock like Courses on home; `/free-mock-exam` copy/FAQ accordion (`FaqAccordion`), no mid-quiz green/red (rail uses `qCellDone`), Continue/Previous layout + bars spinner on nav/results buttons (`FreeMockExamClient`).

- **2026-08-08** — Renamed public content hub `/learn` → `/library` (dirs, symbols, nav/sitemap URLs; brand "Learn in Curve" and paid `LoLearnStage` untouched). Library FAQs now use shared `FaqAccordion` (SSR answers stay in DOM; first item open by default).

- **2026-08-08** — Growth Pass 2 (traffic layer): public `/library` hub + `/library/[slug]` for content pages (`src/content/library/`). Machine + prose; FAQ/Article/Breadcrumb JSON-LD; sitemap published-only. Paid LO/mock routes untouched.

- **2026-08-08** — Growth Pass 1: consent-gated signup attribution (`referrer.ts`, `attribution.ts`, `AttributionCapture` in root layout) + `signup_completed` (replaces `signed_up`; Google new-user via `auth_ok=google_signup` when `created_at` within ~60s). Public `/free-mock-exam` lead magnet: static 15-Q bank (`src/content/free-mock-exam.ts`, practice inventory not in Exam 1), `FreeMockExamClient`, `leads` migration + `submitFreeMockLead`, sitemap/robots, FAQ JSON-LD, entry points on home/header/footer/PMQ overview. Paid `/courses/pmq-in-5-days/mock` untouched. Events: `free_mock_completed`, `lead_captured` (no PII).

- **2026-08-07** — PostHog analytics v2 complete (A–G): auth fail/success + password reset; Google `signed_in` via `auth_ok` beacon; course/LO/stage/section; quiz lock/hint/XP/streak_broken; mock lifecycle + expire flag; tutor/checkout; exam_date_set; dashboard person props (`DashboardAnalyticsPerson`). All via `events.ts` only. **Next for Claude/Sim:** set PostHog `signup_event` = `signup_completed` (renamed 2026-08-08), then funnel + starter dashboard.

- **2026-08-07** — PostHog Groups D+E+F(partial): mock expire flag (`justExpired`/`justAbandoned` from `expireSession` → client `trackMockExamExpired`); mock runner lifecycle events; tutor open/send/limit (course + guest); checkout started/completed + top-up click; `exam_date_set` on dashboard deadline save. All via `@/lib/analytics/events` only.

- **2026-08-07** — PostHog Groups B+C wired (course/LO progression + practice quizzes): new `LoAnalytics` on LO page (`lo_opened` / `course_started` when `percentExact===0` / `course_completed` when 24 LOs sealed); `trackLoStageReached` after `markLoStageReached` in `LoStudyJourney`; `trackSectionCompleted` after seal in `LoCheckpointStage`; `trackQuizSetOpened` / `trackQuizSetLockedHit` in `PracticeQuizSection`; `trackHintViewed` from `QuizRunner` + `TrialQuiz`; `submitQuizAttempt` returns `streakBroken`/`previousStreak` and `trackAttempt` fires `xp_awarded` + `streak_broken`. All via `@/lib/analytics/events` only.

- **2026-08-07** — Password reset hardening (LIC-120 follow-up): `/auth/reset-password` gates on `getUser()` and shows an expired/used-link state (no form) with link to `/auth/forgot-password`; `ResetPasswordForm` maps `updateUser` errors via `getPasswordUpdateErrorMessage` + `console.error`; `ForgotPasswordForm` uses `getCanonicalOrigin()` for unused `redirectTo`. Google OAuth `redirectTo` → `/auth/callback` audited — correct code-exchange flow, left unchanged.

- **2026-08-07** — Site version jumped to **2.38** (`site-version.ts` / `package.json`) so the next deploy recovers the missed 2.37 bump from the prior checkpoint ship that left production on 2.36.

- **2026-08-07** — Backfill dry-run now previews real scores: `previewSessionScore` extracted from `expireSession` in `mock-terminate.ts` (read+score only, no write/AI); `backfill-abandoned-mock-scores.mjs` prints part breakdown + asserts `certificates` count unchanged across the write loop.

- **2026-08-07** — Mock exam incomplete sittings now score and open review: new `expired` status (migration `20260807180000_exam_sessions_expired_status.sql`); shared `scoreMockSession` in `mock-scoring.ts`; `expireSession` / `expireBreakIfNeeded` in server-only `mock-terminate.ts` (grade written best-effort with timeout, then score out of 90, set `finalized_at`, never certificates); review gate accepts `finalized|expired|abandoned`; Results UI shows status-aware header, part breakdown, incomplete verdict, ungraded-written notice, and "Review answers"; legal pre-commit auto-bumps `Last updated` via `scripts/bump-legal-dates.mjs` (`LIC_SKIP_LEGAL_DATE=1` escape). One-off repair: `scripts/backfill-abandoned-mock-scores.mjs` (run after deploy + migration, scoped by email first). Fixes prod `sim.samaar@yahoo.in` sessions that abandoned at 0 with review blocked.

- **2026-08-07** — PostHog custom events wired: `identify()` + `AnalyticsIdentify` in site/courses layouts (UUID only — **tier omitted** to avoid `getPmqTier` round-trip on every page); central `src/lib/analytics/events.ts`; `submitQuizAttempt` returns `streakIncremented` / `loCompleted` / `questionType`; shared `trackAttempt` in `QuizRunner`; homepage CTA + TrialQuiz/QuizDemo demo events; AI unlock click intent on Sly/Pro checkout CTAs. Consent gating untouched.

- **2026-08-06** — Silent ship: pushed `master` `a488be2..d91407d` to GitHub (`bipolarcat/Learn-in-Curve`) to trigger Railway production deploy. Batch includes About restage, tip positioning fixes, footer company LinkedIn, status-page Go back copy, and related polish — no user announcement (Level 0 changelog ladder).

- **2026-08-06** — Status page secondary CTA always reads **Go back** (error no longer shows Try again); navigates with `router.back()` (`SiteStatusPage.tsx`).

- **2026-08-06** — About: Vision/Goal/Values/Founder titles orange, larger, and bold (`AboutPage.module.css`).

- **2026-08-06** — About: Vision/Goal/Values/Founder titles larger + gold; founder intro unbolded; shared 48rem rail so founder panel matches hero/story width (`AboutPage.module.css`).

- **2026-08-06** — About polish: drop company LinkedIn text link; hero tagline from LinkedIn company line; orange section titles; leads stay bold, other copy regular; no em dashes / section rules; one wrap stack with founder panel matching hero rail width; tighter type scale; founder named Sim Samaar Shened (`(site)/about/*`, `ABOUT_PAGE_COPY.md`).

- **2026-08-06** — Footer LinkedIn → company page (`https://www.linkedin.com/company/learn-in-curve/`). About restaged to match Home cream-paper language: larger framed art, lead/body hierarchy, founder paper panel; copy swapped from Notion “About section content update” (`SiteFooter.tsx`, `(site)/about/page.tsx`, `AboutPage.module.css`, `ABOUT_PAGE_COPY.md`).

- **2026-08-06** — Quiz empty-answer tip + pathway locked-stage tip: stop using CSS `transform` for centering (Framer’s `y` was overwriting it and shoving tips off the right on mobile). Tips now use measured width + fixed `left`/`bottom` clamped to the quiz card / viewport (`CheckAnswerHint`, `ExpandableTabs`).

- **2026-08-06** — Removed the “What’s included” dropdown from free-tier locked Video/Audio (`ProMediaLockedPreview`); upsell is heading + Get Pro Bundle only.

- **2026-08-06** — Pathway tip: no caret; edge-pins on mobile so the last Checkpoint tip stays on-screen. Check-answer empty tip now anchors to the quiz card bottom (animates up from the card, not the viewport) via `CheckAnswerHintHost` (`ExpandableTabs`, `CheckAnswerHint`).

- **2026-08-06** — Pathway disabled tip: portals below the tapped icon (`position: fixed`) so it no longer covers the mobile pathway row; upward caret tracks the icon; still auto-dismisses at 2.5s (`ExpandableTabs`).

- **2026-08-06** — Pathway disabled-stage tip: bottom placement (clears site header), subtler paper chip, tiny warning icon, compact 9px type; LO chrome raised to `z-30` so the tip stacks above stage cards (`ExpandableTabs`, `LoPageHeader`).

- **2026-08-06** — Pathway bar layout restored: removed Tooltip wrappers that broke compact flex; cream hint is again an absolute tip on the tab and auto-dismisses after 2.5s (`ExpandableTabs`).

- **2026-08-06** — Signup terms gate: keep the inline warning only; removed the duplicate short toast on missing agreement (`AuthForm` `requireTermsAcceptance`).

- **2026-08-06** — Integrated 21st Tooltip into `src/components/ui/tooltip.tsx` (LIC tokens + `cream` type, `delay={false}` / `openOnClick`); pathway unreached stages use that no-delay cream tooltip (`ExpandableTabs`). Did not replace existing Button/Spinner/Badge with demo shugar copies. Geist CSS aliases already present in `globals.css` / `tailwind.config.ts`.

- **2026-08-06** — Warning toasts use an opaque light-teal fill (not translucent outline); pathway `disabledHint` is a cream small-text tooltip with no-delay top entrance (`ui/toast`, `ExpandableTabs`).

- **2026-08-06** — Guidance toasts use light teal chips (`warning` in `ui/toast`); LO unreached pathway stages show a teal tooltip above the icon (`ExpandableTabs` `disabledHint`) instead of a page toast; Check-answer empty hints keep the shared teal toast.

- **2026-08-06** — Signup terms alert copy set to “Please agree to the Terms and Privacy Policy to continue.” (`AuthForm` `TERMS_REQUIRED_COPY`).

- **2026-08-06** — Signup/LO/quiz clarity UX: redesigned terms-acceptance alert in `AuthForm` (full-width orange paper chip + pulse + toast); unreached LO pathway tabs in `ExpandableTabs`/`LoPageHeader` now show a “Use Next…” toast via `PathwayStageHint` instead of a silent no-op; practise `Check answer` with no selection toasts via `CheckAnswerHint` (`QuizRunner`, `TrialQuiz`); slightly brighter `--olive`/`--rust` + stronger correct/incorrect fills in `QuestionResponseFields` and quiz/mock rails so right/wrong read clearly on cream.

- **2026-07-31** — Corrected oversized mobile “Try Sly now” portrait in `SlyShowcase`: 48px with a lighter 1.2× crop below 640px; desktop remains 64px / 1.28×. The Mac title icon remains 20px.

- **2026-07-31** — Landing “Try Sly now” lockup refined in `SlyShowcase` / `pmq/tier-badge`: portrait grows to 64px with a looser crop so both ears remain visible and sits in its own row above the title; the title is locked to one line down to 320px; `AiTutorBadge` now shares the exact matt-gold geometry and colour definition used by `AiProBadge`.

- **2026-07-31** — Landing Sly section quieter/direct-use pass in `SlyShowcase` and `SlyTutorWindow`: replace the large sticker-shadow mascot and Mac title icon with the supplied `public/brand/sly/sly-tutor-portrait.png`; reduce the “AI TUTOR” stamp to a flat muted label; remove the automated scripted typing/reply loop so the real three suggested questions and composer are available immediately. Guest allowance, API, disclosures and signed-in course routing are unchanged.

- **2026-07-31** — Two dev-only errors seen while testing on a phone: added `allowedDevOrigins` (private LAN ranges) to `next.config.ts` so loading the dev server over the LAN IP stops warning about cross-origin `/_next/*`, and `suppressHydrationWarning` on `<body>` in `app/layout.tsx` because Intercom and mobile password managers decorate `<body>` before React hydrates (same reasoning as the existing `<html>` opt-out). Neither reproduced in headless Chromium across `/`, `/courses`, `/about`, `/contact`, auth and dashboard.

- **2026-07-31** — `ui/expand-cards` quieter pass: labelled orange collapsed plates now apply on desktop too (vertical spine labels) rather than mobile only, the deck centres itself, the “What’s included” heading drops from a display headline to quiet Figtree at `text-ink/65`, and the open mobile card is sized to the slides' exact 16:9 so nothing is letterboxed or cropped. Plate colour is brand orange mixed 85% toward ink — full-strength orange gives paper text 3.8:1, short of 4.5:1 at label size.

- **2026-07-31** — Polished the mobile landing syllabus accordion in `FeatureStack` and `ui/expand-cards`: added the single “What’s included” section heading; collapsed rows are now labelled orange 44px targets; opening a row crossfades the orange cover into the full uncropped slide with a slight rightward optical bias. Reduced-motion still resolves instantly.

- **2026-07-31** — Mobile `ui/expand-cards` changed from a horizontal swipe strip to the requested tap accordion: all seven syllabus slides remain visible as 44px collapsed rows and clicking one expands it to the full uncropped composition.

- **2026-07-31** — Landing “What’s inside” rebuild: replace the seven-card sticky `FeatureStack` and its separate heading/captions with the seven supplied `/public/Landing page/Learn the full syllabus/*.png` slides in reusable `ui/expand-cards`. Desktop expands on hover/focus/click; mobile uses tap-to-expand rows. Surfaces copy the Courses catalogue card’s 1.25rem radius, border and shadow. Pro media and not-yet-live AI Pro slides retain small tier qualifiers.

- **2026-07-31** — Free-tier dashboard Pro cost guard made quieter in `DashboardPmqCourseCard`: retain the dark button, Pro chip, £8 price and full “What’s included” disclosure, but move them into a compact lower card row with the CTA right-aligned and reduced in height/type size.

- **2026-07-31** — Dashboard PMQ card: hide “Get Pro Bundle” upgrade footer for Pro / AI Pro owners (was gated only on Sly unlock, so Pro buyers still saw checkout). Starter keeps the CTA.

- **2026-07-31** — Dashboard PMQ card CTA: `Start · LO N` when the next LO has no pathway stages reached yet; `Continue · LO N` once any stage is reached (`getLoStageReachedMap` + `nextLoStarted`).

- **2026-07-31** — AI Pro pricing CTA → `Join Waitlist`; Starter/free card CTA gets right arrow (`CtaArrow` on `StartFreeButton`).

- **2026-07-31** — AI Pro pricing card CTA: `Notify me` → `Notify me to join waitlist` (`src/lib/pmq/plans.ts`).

- **2026-07-30** — Home lamp mobile: phone-first radial washes + solid 3px orange line (no reliance on iOS-dropped blur/conic); conics desktop-only; fixed-height horizon stage so the light isn’t lost in absolute flex stacking; keep Framer Motion whileInView.

- **2026-07-30** — Home lamp: remove GSAP scroll scrub; restore original Aceternity Framer Motion `whileInView` beams + copy rise (`ui/lamp`, `PmqLiveLamp`). Keep cream/orange LIC skin and under-CTA placement.

- **2026-07-30** — Home lamp phone visibility: solid 3px orange line + radial washes (blur is additive only — iOS was dropping blur-only glow); higher brightness floor; drop invalid `calc(span * n)`; text settles lower under the line (`endY` positive, less negative margin).

- **2026-07-30** — Home lamp mobile scroll: longer ScrollTrigger range (`top bottom`→`top 32%`), `ignoreMobileResize` + refresh after layout, shorter touch travel, drop stage `overflow-hidden` that clipped startY, `fastScrollEnd` for momentum.

- **2026-07-30** — Home lamp: drop horizon further under CTAs; lock line + conic + core glow to shared `--lamp-span` and drop line `scaleX` scrub so widths match from scroll start. Text rise scrub unchanged.

- **2026-07-30** — Home lamp `/impeccable animate`: drop horizon a beat under CTAs; signature scroll scrub — readable copy translates up toward the orange line while `--lamp-brightness` + line scaleX ramp (GSAP ScrollTrigger; reduced-motion → final pose; no opacity-gated blank text).

- **2026-07-30** — Home lamp: pull orange line + “now live” copy up under brand-hero CTAs (drop hero bottom pad, remove low flex spacer) so the fold reads seamless.

- **2026-07-30** — Home lamp: restore Aceternity conic luminance (revert soft radial wash); push light source to bottom of the lamp hero via flex spacer + clipped downward beams. Keep GSAP scroll brighten + copy rise.

- **2026-07-30** — Home lamp polish: hard-clip glow below the orange horizon (no light above the line); wider soft radial wash; GSAP ScrollTrigger scrub — copy rises from below toward the light while `--lamp-brightness` ramps. Took scroll-link pattern from horizon-hero demo; skipped Three.js/cosmos scene (wrong register for cream paper).

- **2026-07-30** — Home: remove teal framed PMQ band (Mac console + compare + heading); replace with cream-grid `LampContainer` (`src/components/ui/lamp.tsx`) + scroll-in “PMQ in 5 Days is now live” copy (`PmqLiveLamp`). Orange brand glow; framer-motion already in tree; `bg-gradient-conic` added to Tailwind.

- **2026-07-30** — Auth sign-up confirm-email: replace inline success line with quiet `AuthCheckInbox` card (echoes address, resend + 60s refresh-proof `sessionStorage` cooldown keyed `lic_resend_until:{email}`, use different email). Shared for saas + default `AuthForm` variants; errors/sign-in unchanged. Deviations: inline SVG mail glyph (same pattern as `GoogleMark`, no new icon dep); on resend error UI shows quiet failure copy while client throttle still holds until expiry. Build/test unblock (unrelated to auth): `LoOrientStage.splitOutcome` regex dropped `/s` + unicode dash escapes; `markLoStageReached` cast via `unknown` for dynamic `section_progress` select typing; refreshed stale `tests/mock-exam.test.mjs` expectations (`formatExamTime` seconds, AI grading vs self-assessment, `overallRemaining` vs removed `Overall ·` chrome).

- **2026-07-30** — Dev Turbopack panic: `HeroPmqMacDemo.module.css` had Windows-1252 bytes (invalid UTF-8) which crashed compiling `/`; re-encoded to UTF-8 and cleared `.next`.

- **2026-07-30** — Status pages: drop fox + “Lost the path” kicker; brand lockup matches header (stacked Learn in / orange Curve) (`SiteStatusPage`).

- **2026-07-30** — Custom status pages: LIC rewrite of demo 404 (cream paper, Fraunces, fox, soft brand-colour wipe — no black/stick figures). Shared `SiteStatusPage` for `app/not-found.tsx` (404), `app/error.tsx` (route errors), `app/global-error.tsx` (root crash). Preview 404 via any missing URL.

- **2026-07-30** — Sitewide stamp type → body Figtree: courses card CTAs/labels and all `font-stamp` / CSS Space Mono text rules remapped to Figtree; dropped Space Mono from root layout (`semantic.ts`, `stamp-chip`, catalog, tutor/XP chrome, etc.).

- **2026-07-30** — Feedback modal icon: knock out cream plate to transparent fox cutout; bottom-align “Send feedback” with icon (`write-note.png`, `FeedbackModal.tsx`).

- **2026-07-30** — Feedback modal icon: mailbox → writing-wolf illustration (`/brand/feedback/write-note.png`, `FeedbackModal.tsx`).

- **2026-07-30** — Feedback modal polish: quiet form surface, mailbox icon beside “Send feedback”, body Figtree (no stamp), smaller right-aligned Send message + ellipsis pending, auth-style fields (`FeedbackModal.tsx`, `/brand/inspo/mailbox.svg`).

- **2026-07-30** — Contact copy: phone `+44 7552 249 983`; subheading em dash → hyphen (`contact/page.tsx`).

- **2026-07-30** — Contact desktop layout: left copy column stretched to form card (title top / email·phone·web bottom, Figtree not stamp); Send message body-font, right-aligned (`ContactForm`, `ContactPage.module.css`).

- **2026-07-30** — Contact `/contact` polished to LIC paper/auth language: Fraunces title, quiet form surface, stamp compact Send + ellipsis pending, SoftNav ← Back to home; removed generic `contact-2` shadcnblocks template. Signup preview back link removed (hero/enrol soft-nav `?from=` no longer surfaces a back control).

- **2026-07-30** — Soft-nav back links: hero “Start Free with APM PMQ” / quiz enrol / catalogue “Enrol for free” / pricing “Start Free” pass `?from=` so preview signup shows ← Back (home / courses / plans). Hero “Explore Courses” passes `from=home` so `/courses` shows ← Back to home. Shared `SoftNavBackLink` + `lib/soft-nav-back.ts`; pricing reuses it.

- **2026-07-30** — Auth sign-up heading: orange accent on “free” in “Start learning for free” (`AuthDeskPanel`).

- **2026-07-30** — Auth cards unified: PMQ preview “Start Free” uses same fox + `AuthDeskPanel` as `/auth/sign-up` (logo removed; copy stays “Start learning for free” / “Upgrade anytime after.”). Sign-in heading/sub use the same Fraunces + Figtree typography (`AuthDeskPanel`, `preview/page.tsx`).

- **2026-07-30** — Checkpoint complete celebration: replace CSS/framer particle fall with Magic UI `canvas-confetti` fireworks (`components/ui/confetti.tsx`, `LoCheckpointCelebration.tsx`); brand colours; reduced-motion still skips particles.

- **2026-07-30** — Auth saas “or email” divider: drop white punch-out box; use split hairlines so label sits on any card colour (`AuthForm.tsx`).

- **2026-07-30** — PMQ preview sign-up: on mobile, pull title/sub closer to logo and add space above Google CTA (`PreviewPage.module.css`).

- **2026-07-30** — PMQ preview sign-up card: restore logo + “Start learning for free” / “Upgrade anytime after.”; widen to ~28rem so Terms checkbox copy stays one line (`preview/page.tsx`, `PreviewPage.module.css`).

- **2026-07-30** — PMQ preview (`/preview`): sign-up card only — dropped course lead, Starter plan card, and auth heading/subheading/logo; hero Start Free still lands here (`preview/page.tsx`).

- **2026-07-30** — PMQ preview signup: replace Starter/Pro compare table with pricing **Starter** card only, CTAs hidden (`PmqPlanCards` `planIds` + `showCtas`, `preview/page.tsx`).

- **2026-07-30** — Hero Explore Courses soft-nav: ellipsis pending spinner while routing to `/courses` (`ExploreCoursesLink`, home `page.tsx`).

- **2026-07-30** — Quiet form/field errors sitewide: shared `fieldErrorHint` (Figtree body, `text-ink/55`) replaces stamp/rust/maroon validation copy. Applied to newsletter, notify dialogs, auth, checkout/top-up/unlock CTAs, profile save, course report, practise save errors, Sly chat banners; invalid email borders softened to ink (`semantic.ts` + call sites). Quiz wrong-answer rust unchanged.

- **2026-07-30** — Landing “Join our newsletter” Notify me: ellipsis pending spinner; label uses body Figtree (not stamp uppercase) (`NewsletterSignup` notify variant).

- **2026-07-30** — Course overview header + dashboard card paid mark is tier-aware: AI Pro → matt-gold **AI Pro** chip; Pro → teal **Pro**; starter → none (`PmqCourseHeader` `userTier`, `DashboardPmqCourseCard` `userTier`).

- **2026-07-30** — Mock lock badges corrected to the real ladder: exams 2–3 = subtle teal **Pro** Bundle; exam 4 = subtle gold **AI Pro** Bundle. Reverted the mistaken Pro=1–2 / AI Pro=3–4 split (`PmqMockExamsSection`, `tiers.ts`, `plans.ts` +2 mocks, tests).

- **2026-07-30** — Mock exam lock badges: exam 2 = subtle teal **Pro** + “Bundle”; exams 3–4 = subtle gold **AI Pro** (quiz-chip language). Ladder updated to match — Pro unlocks papers 1–2, AI Pro 1–4; pricing Pro “+1 mock”; gates/tests/comments aligned (`PmqMockExamsSection`, `tiers.ts`, `plans.ts`, `mock-actions`, tests).

- **2026-07-30** — Dashboard What’s included separator → thin grey (`border-ink/15`, dark `white/15`) instead of near-invisible ink/8 (`DashboardPmqCourseCard`).

- **2026-07-30** — Dashboard What’s included: lead with “All the starter pack features” (teal inherits arrow); Pro feature rows use pricing icons (orange, 1.1rem) with `items-center` horizontal align (`DashboardPmqCourseCard`).

- **2026-07-30** — Dashboard Get Pro CTA: drop Sly fox leading icon; teal **Pro** chip in the label; What’s included lists the same four Pro Bundle features as pricing (`PMQ_PLANS` pro) with plan icons (`DashboardPmqCourseCard`, `AiTutorUpgradeCta` ReactNode label).

- **2026-07-30** — Checkpoint header **Next LO** de-emphasised until checklist complete: muted ink (`text-ink/30`) instead of faded orange; full orange returns when ready (`LoPageHeader` PathwayNextButton).

- **2026-07-30** — LIC short toast shell → `w-fit` (content-sized) instead of full-width max chip; Sonner wrapper matches (`toast.tsx`). Applies to Checkpoint Next LO + Practise Generate tips.

- **2026-07-30** — Practise Generate gate tips: local absolute Pro tip (clipped under LO chrome) → same Sonner short toast as Checkpoint Next LO, with teal Pro / matt-gold AI Pro leading chips; LO chrome z-40→z-10 so Generate isn’t buried; Pro past set 5 shows AI Pro toast (`PracticeGenerateHint`, `PracticeQuizSection`, `toast.tsx` leading slot, `LoPageHeader`, `LoStudyJourney` `userTier`).

- **2026-07-30** — Reverted Mac demo frame to `mac-screen-transparent.webp` + original CRT inset (`HeroPmqMacDemo`); dropped cutout experiment.

- **2026-07-30** — Mac walkthrough clipped inside CRT: cutout bezel (`mac-screen-no-bg-cutout.webp`) stacks above UI; overlay inset from glass rim (`HeroPmqMacDemo`).

- **2026-07-30** — Home Mac demo frame → `mac-screen-no-bg.png` (from inspo); CRT overlay inset recalibrated (`HeroPmqMacDemo`).

- **2026-07-30** — Ellipsis pending on PFQ “Notify me” + all header soft-nav controls (`CoursesCatalog`, `SiteHeaderControls` `HeaderNavButton`). Sign out already had ellipsis.

- **2026-07-30** — Courses catalog tickets: ellipsis pending on Enrol / View plans (`PmqStartLink`, `CoursesCatalog`).

- **2026-07-30** — APM disclaimer only on PMQ course-overview footer (`CoursesSiteFooter` → `SiteFooter showApmDisclaimer`); removed from site-wide footer. Pricing “Back to courses” → `/courses` (`PricingBackLink`). Checklist + `tests/apm-disclaimer.test.mjs` updated.

- **2026-07-30** — Pricing cards: “Launching soon” stays on the title row, flush right (`PmqPlanCards`).

- **2026-07-30** — Pricing cards: divider back under price/tagline (before features); kept looser feature-row spacing (`PmqPlanCards`).

- **2026-07-30** — Pricing cards compact pass: tighter gaps; bold Q/mock counts on Pro/AI Pro; no CTA arrows; orange “Start free.”; Launching soon inline beside AI Pro title (`PmqPlanCards`, `plans.ts`, `pricing/page.tsx`).

- **2026-07-30** — Pricing cards: Launching soon → quiet body-font top-right; plan names flush top; Pro/AI Pro taglines shortened; shared `.split` rule so feature dividers align across the three cards (`PmqPlanCards`, `plans.ts`).

- **2026-07-30** — PMQ pricing page restage: “Back to course” (LO-style ← soft-nav); two-line “Start free. / Upgrade only if you love it.”; new subhead; dropped Most popular + assurance trio; price notes beside amounts; teal **Pro** / matt-gold **AI Pro** name chips; equal cream cards (no teal top rail); sleeker body-font CTAs with ellipsis pending; Pro **£8** via `SLY_UNLOCK_PRICE_CENTS=800`; feature/tagline copy refresh; footer rule full card width. (`pricing/page.tsx`, `PmqPlanCards`, `plans.ts`, `PricingBackLink`, Terms + checklist). **Ops:** sync Stripe Price + Supabase `exam_config` to £8 before live charges.

- **2026-07-30** — PMQ preview sign-up subcopy: “Unlock Pro anytime after.” → “Upgrade anytime after.” (`preview/page.tsx`).

- **2026-07-30** — Rewound Home PMQ band changes (full-bleed teal, Mac crop rebuild, preview subhead) — restored inset teal stadium panel state.

- **2026-07-30** — Home PMQ section: teal-deep inset stadium band (Wispr-style rounded panel) around compare + Mac; desktop horizontal / mobile stacked (`PmqHomeBand.module.css`, `page.tsx`). Not a full-bleed section wash.

- **2026-07-30** — Mac hero shadow flicker: moved `drop-shadow` from animating `.mac` onto static `.frame` so scene/cursor ticks don’t re-raster the silhouette (`HeroPmqMacDemo.module.css`).

- **2026-07-30** — Landing PMQ section: swapped journey/stamps proof for preview Starter/Pro compare table beside Mac (`page.tsx`, `PmqPreviewCompare` `labelledBy`).

- **2026-07-30** — Home Mac walkthrough recoded to quieter SaaS course UI: plan console + day tabs + LO rows/pie, streak/% (no XP), pathway **Quiz**, LO1 Life cycles, Context/Key definitions/Practise quiz cards (`HeroPmqMacDemo`).

- **2026-07-30** — Header: hide Sign in / Get Started on PMQ preview (same minimal chrome as `/auth/*`) (`SiteHeaderControls.tsx`).

- **2026-07-30** — PMQ preview compare table: header “What’s Included” → “What you get”, vertically centred and left-aligned in the header row (`PmqPreviewCompare`).

- **2026-07-30** — Reverted Home Mac hero video swap; restored coded CRT walkthrough (`HeroPmqMacDemo`, Playwright).

- **2026-07-30** — Checkpoint complete: confetti-only overlay (no “LO complete” chip); denser particles (~110); Complete badge stays on checkpoint panel (`LoCheckpointCelebration`, `LoCheckpointStage`).

- **2026-07-30** — Footer: dropped Courses and Careers; order About → Get in touch → Privacy → Terms → Cookies → Send feedback (`SiteFooter.tsx`).

- **2026-07-30** — Cream background “gone” on OS-dark machines: browser auto-dark remapped light paint (`bodyBg` near-black while `--cream-rgb` stayed light). Fixed with `color-scheme: only light|dark` in CSS, boot script, and theme helpers. (`globals.css`, `layout.tsx`, `theme-routes`)

- **2026-07-30** — Hydration mismatch fixes: defer `AppToaster` until mount; ThemeToggle SSR-stable light shell + `suppressHydrationWarning`; mock timer no longer seeds `Date.now()`; ExpandableTabs ignores `useReducedMotion` until mounted; ThemeRoutePolicy observers post-hydrate. (`toast`, `theme-toggle`, `PmqMockExamsSection`, `expandable-tabs`, `ThemeRoutePolicy`)

- **2026-07-30** — Dark mode toggle fix: shared `setDocumentTheme` / `applyDocumentTheme`; MutationObserver re-asserts `.dark` if React strips it from `<html>`; toggle uses fixed ink/paper hex + real `<button>` (knob right = dark). (`theme-routes`, `ThemeRoutePolicy`, `theme-toggle`, `globals.css`)

- **2026-07-30** — Site footer quieter restage: drop Product/Company/Legal stamp headings; flat 3-col (mobile) / wrap link strip; borderless social chips; shorter flicker band + Figtree © line. (`SiteFooter`, `FooterFlickerBand`)

- **2026-07-30** — Edit Profile: drop Reset + Exit; compact ToastSave; X close in header top-right. (`DashboardProfileMenu`, `toast-save`)

- **2026-07-30** — Edit Profile Save uses morphing `ToastSave` bar (unsaved → saving → saved); orange Save + olive success (no violet); dirty-gated with Reset. (`toast-save.tsx`, `DashboardProfileMenu`; deps already present — Button/Spinner/framer-motion)

- **2026-07-30** — LIC short toast via Sonner: `src/components/ui/toast.tsx` (paper chip, ink/olive/rust/orange variants, 160ms motion); `AppToaster` in root layout. Checkpoint gate uses `showToast` — top-right on Next LO, bottom-center on Continue (`CheckpointGateHint`, `LoPageHeader`, `LoStudyJourney`). Kept existing `button.tsx`; no demo page.

- **2026-07-30** — Checkpoint Next/Continue gated until all checklist items are ticked; blocked taps show a short toast (“Tick off all the checkpoints…”); bottom uses Continue CTA (Prev stays in adjacent nav). (`LoStudyJourney`, `LoPageHeader`, `LoCheckpointStage`, `ProgressCheckpointList`)

- **2026-07-30** — LO pathway Next/Continue stay visible after a stage (or whole LO) is already complete — only Checkpoint omits the bottom Continue (uses Next LO in the subheader instead). (`LoStudyJourney`)

- **2026-07-30** — LO subheader course progress: desktop overview-style chip between pathway tabs and Next; mobile 2px Progress replaces the hairline separator (`interfaces-progress` + `CourseChromeProgress`; wired `completionPercent` from LO page). (`LoPageHeader`, `PmqCourseHeader`, `LoStudyJourney`)

- **2026-07-30** — LO stage Continue (and pathway Next) scrolls to top after advancing so the next stage starts at the pathway, not the footer. (`LoStudyJourney`)

- **2026-07-30** — Checkpoint Complete pill uses `rounded-xl` (same corner as Prev/Next CTAs); size unchanged. (`LoCheckpointStage`)

- **2026-07-30** — Course overview section stack gaps match header→plan spacing (`gap-6` / `sm:gap-[2.125rem]` = header `pb` + overview `pt`). (`PmqOverview`)

- **2026-07-30** — 5-day plan LO row soft-nav uses default Spinner (not bars). (`PmqDayPlan`)

- **2026-07-30** — 5-day plan LO rows: replace trailing `→` with stage pie (conic orange fill from journey `sessionStorage`, 0–7 stages) and olive Check when LO is complete (`PmqDayPlan`, `LoStagePie`, `lo-stages` helpers).

- **2026-07-30** — Checkpoint complete status: quiet header pill (Lucide Check + “Complete”) instead of retro unicode ✓ block; confetti drops stamp ticks for clean rect/square only. (`LoCheckpointStage`, `LoCheckpointCelebration`, `LoProgressRing`)

- **2026-07-30** — Checkpoint Prev/Next LO CTAs get shared `CtaArrowLeft` / `CtaArrow`. (`LoCheckpointStage`, `stamp-chip`)

- **2026-07-30** — Checkpoint celebration chip matches LO subheader language: orange Flag icon, Figtree body, chrome paper shell; heading `LO n – {title} complete` + “Keep going!!” (`LoCheckpointCelebration`, `LoCheckpointStage`, `LoStudyJourney`).

- **2026-07-30** — Checkpoint celebration chip: gold stamp `LO n` on top, ink-bordered paper surface, snappy 280ms pop — quieter LIC character without the old olive badge (`LoCheckpointCelebration`).

- **2026-07-30** — Checkpoint celebration toast quieter + centre-aligned (confetti unchanged): drop olive badge / “Locked in”; soft paper chip, centred copy “Learning objective complete” + muted LO n (`LoCheckpointCelebration`).

- **2026-07-30** — Checkpoint: removed Mark complete button; last checklist tick seals the LO and fires Framer Motion confetti + toast (`LoCheckpointCelebration`); quiet “Learning objective complete” status in-card (`LoCheckpointStage`, `ProgressCheckpointList`; deleted `LoCompleteButton`).

- **2026-07-30** — Checkpoint polish: Prev/Next labels `Previous: LOn` / `Next: LOn` with orange Next; checklist full-width + card `max-w-wrap` (matches header); subheader **Next LO** on Checkpoint; seal gated on checklist only (quiz no longer required — `canSealLo`, `markSectionComplete`); quieter seal CTA + infinite spinner; optimistic snappy ticks (`LoCheckpointStage`, `ProgressCheckpointList`, `LoCompleteButton`, `LoPageHeader`, `LoStudyJourney`, `lo-stages`, `actions`).

- **2026-07-30** — Checkpoint quieter SaaS restyle: opaque card + Flag header; snappy orange custom ticks; drop “Finish the quiz” / checklist helper copy; Prev/Next LO outside the card with bars spinners (`LoCheckpointStage`, `ProgressCheckpointList`, `LoCompleteButton`, `LoStudyJourney`; removed unused `LoNav` from `PmqCourseHeader`).

- **2026-07-30** — LO pathway mobile Next pending state: ring spinner instead of infinity. (`LoPageHeader`)

- **2026-07-30** — Dashboard course-card Continue CTA gets the shared `CtaArrow` (same as plan Continue). (`DashboardPmqCourseCard`)

- **2026-07-30** — Practise single-card polish: drop “Set N · questions” / “Question N of M” copy; one opaque card (header + sets + body); smaller question rail; mobile Generate = top-right Zap icon with pinwheel loading; press-scale on controls. (PracticeQuizSection, QuizRunner, PracticeQuiz.module.css)
- **2026-07-30** — Practise quieter restage (Mock dialect): wrap-width opaque stack; soft set rail + question rail (inset orange current); solid orange only on Check/Generate; strip XP badge/fly-up/tallies; soft MCQ review tints; 150ms transitions; drop duplicate visible `Qn` on dropdown prompts (rail already owns index). (PracticeQuizSection, QuizRunner, PracticeQuiz.module.css, QuestionResponseFields, LoStudyJourney)

- **2026-07-30** — Misconceptions: full-width body (no `70ch` cap); numbered Wrong/Right labels (`Wrong 1`, `Right 1`, …). (MisconceptionsList)

- **2026-07-30** — Misconceptions clarify: section “Common misconceptions”; each row framed Wrong (trap) → Right (correction); aria-labels “Show/Hide the right take”. (MisconceptionsList, LoApplyStage)

- **2026-07-30** — Memory aids: separator is thin grey hairline; cue copy “Flip to reveal”. (MemoryFlashCard.module.css, MemoryAidsList)

- **2026-07-30** — Memory aids flashcards: applied audit stack under `/impeccable quieter` — `*-rgb` tokens (no broken `--ink`/`--paper`), no deck/01/glow/dashed frames, quieter ink reverse, 340ms flip, focus on `.card`, stronger Flip contrast, polite live region. (MemoryAidsList, MemoryFlashCard.module.css)

- **2026-07-30** — Memory aids editorial flashcards (pushed): Fraunces acronym, gold rule, soft deck stack, deep ink reverse with gold mono label; 560ms flip; reduced-motion face swap. (MemoryAidsList, MemoryFlashCard.module.css)

- **2026-07-30** — Memory aids: clean 3D flip flashcards (acronym → expansion); `prefers-reduced-motion` swaps faces without rotate; 480ms ease-out-quint. (MemoryAidsList)

- **2026-07-30** — Apply: removed Worked example section from UI (content remains in LO JSON); deleted `WorkedExampleBlock`. Misconceptions + Memory aids only. (LoApplyStage, LoStudyJourney)

- **2026-07-30** — Apply: three always-open opaque cards again (Worked / Misconceptions / Memory); kept distilled inner disclosure. (LoApplyStage)

- **2026-07-30** — Apply distill + polish (flagship): one opaque surface (not three cards); single disclosure vocabulary (chevron accordion = definitions); cut Mistake N / Correction / Tap to reveal / memory card grid; “Show answer”; empty worked-example state; 150ms motion + 44px targets. (LoApplyStage, WorkedExampleBlock, MisconceptionsList, MemoryAidsList)

- **2026-07-30** — Apply quieter restage: wrap width; single-open opaque accordion (Worked / Misconceptions / Memory); Lucide + Figtree titles; reveal controls match definitions dialect (no stamp/heavy borders). (LoApplyStage, WorkedExampleBlock, MisconceptionsList, MemoryAidsList, LoStudyJourney)

- **2026-07-30** — LO Video + Audio restaged to Orient/Learn dialect: wrap width, Lucide `size-7/8` + Figtree `text-lg` titles, opaque cards; quieter player frames + locked Pro preview (snappy 150ms). (LoVideoStage, LoAudioStage, LoStudyJourney, LoExplainerVideo/Audio, ProMediaLockedPreview)

- **2026-07-29** — Starter/free (`!hasEntitlement`): LO Next from Learn jumps to Apply (skips locked Video/Audio); desktop label “Continue to Apply”; skipped media stages marked done so locked tabs stay tappable. (LoStudyJourney)

- **2026-07-29** — Key definitions: APM body uses same type as Plain English (`bodyClass`). (DefinitionsTable)

- **2026-07-29** — LO mobile Next always orange (idle + ∞ loading; no ink→hover swap). (LoPageHeader)

- **2026-07-29** — LO mobile Next: on tap, swap label/▶▶ for `Spinner variant="infinite"` (~420ms) then advance; desktop Continue unchanged. (LoPageHeader)

- **2026-07-29** — LO mobile pathway advance: flat “Next” + double filled ▶▶ glyph (no orange pill); desktop Continue unchanged. (LoPageHeader)

- **2026-07-29** — Key definitions: APM definition body no longer italic (mobile accordion + desktop table). (DefinitionsTable)

- **2026-07-29** — Mobile key definitions: single-open accordion (term row + chevron; Plain English / APM in panel). Desktop table unchanged. (DefinitionsTable)

- **2026-07-29** — Mobile key definitions polish: clearer scan — larger term, looser leading, more card padding, Plain English / APM split by hairline, stronger contrast (`ink/90` body, `ink/60` labels), stronger between-term dividers. (DefinitionsTable)

- **2026-07-29** — Mobile key definitions distilled: visible “Plain English” / “APM definition” field labels (same quiet style as desktop column headers); no stamp/eyebrow chrome. (DefinitionsTable)

- **2026-07-29** — Learn core outcome titles: `2a)` inline on first line with title; wraps use full card width (no side column); section titles `flex-1` full remaining width; dropped `text-balance` so lines fill before wrapping. (LoLearnStage)

- **2026-07-29** — Learn overflow fix (`min-w-0` / `overflow-x-clip` / scrollable tables); diagrams size to image (`h-auto`, no fixed aspect); caption inside box, centred, no hairline; outcome codes `2a)` match section heading type (`text-lg` semibold). (LoLearnStage, CoreContentBlock, DefinitionsTable, globals.css)

- **2026-07-29** — Learn quieter redesign: Key definitions + Core content as separate opaque cards at `max-w-wrap` (Orient/overview dialect); definitions list/table without stamp chips; diagram captions inside diagram box (small italic); Figtree headings/body full width. (LoLearnStage, DefinitionsTable, CoreContentBlock, LoStudyJourney, globals.css)

- **2026-07-29** — Orient: section headings vertically centered with pathway icons (`items-center`). (LoOrientStage)

- **2026-07-29** — Orient: larger pathway icons (`size-7`/`8`) bottom-aligned with headings; Context heading→body gap eased to `mt-1.5`. (LoOrientStage)

- **2026-07-29** — Orient: Context heading→body pulled tighter (`items-end` title row, `leading-none`, `-mt-1.5` on body). (LoOrientStage)

- **2026-07-29** — Orient: Context + outcome body locked to shared `text-[15px]` / `leading-[1.65]` (same element class). (LoOrientStage)

- **2026-07-29** — Orient: heading→body gap flushed (`mt-0` / first outcome `pt-0`). (LoOrientStage)

- **2026-07-29** — Orient: outcome codes show `1a)`; heading→body gap tightened to `mt-0.5`. (LoOrientStage)

- **2026-07-29** — Orient: outcome codes (`1a`…) sit in the icon column; heading→body gap tightened (`mt-1.5` / `sm:mt-2`). (LoOrientStage)

- **2026-07-29** — Orient: removed Next→Learn footer; unified heading/body/code type (Figtree `text-lg` / `text-base`); tighter icon→title gap; text column shares one left edge. (LoOrientStage)

- **2026-07-29** — Orient critique fixes (width kept `max-w-wrap`): opaque `productSurfaceOpaque` (no glass); Context primary / Outcomes secondary type; empty-state + Next→Learn footer; Learn + `LoStageHeader` rhyme pathway dialect (Lucide glyphs, Figtree titles, quiet lowercase codes). (LoOrientStage, LoLearnStage, LoStagePanel, semantic.ts)

- **2026-07-29** — Orient typeset: rem scale — titles `text-lg` / semibold / snug; body + outcomes `text-base` / leading 1.7; codes `text-sm`. Drops muddy 15px title≈body pairing. (LoOrientStage)

- **2026-07-29** — Orient hierarchy: section break Context↔Outcomes uses `ink/15` + more margin; outcome rows use quieter `black/[0.05]` dividers. Glyphs larger (`size-10` / `sm:size-11`). (LoOrientStage)

- **2026-07-29** — Orient section glyphs bumped again (`size-8` / `sm:size-9`). (LoOrientStage)

- **2026-07-29** — Orient polish: slightly larger section glyphs (size-7/8); body/code contrast bumped (`ink/85`, `ink/55`); tighter title→body rhythm. (LoOrientStage)

- **2026-07-29** — Orient outcome codes: lowercase `1a`/`1b`… as quiet text, no chip/border. (LoOrientStage)

- **2026-07-29** — Orient: single quiet card with hairline between Context / Outcomes; context prose full-width; smaller glyphs; outcome list shows 1A/1B… chips only (no 1/2/3). (LoOrientStage)

- **2026-07-29** — Orient quieter: full `max-w-wrap` (matches LO chrome); Context + Learning outcomes as separate quiet panels; photo frames → Lucide Compass / ListChecks (pathway language); stamp brows + orange outcome cards removed. (LoOrientStage, LoStudyJourney)

- **2026-07-29** — LO mobile chrome: thin hairline between location/Next row and stage tabs. (LoPageHeader)

- **2026-07-29** — LO mobile advance CTA restored as labeled chip reading “Next” (not Continue / not Play key). (LoPageHeader)

- **2026-07-29** — LO mobile Continue = solid square transport key (filled Play triangle); title + expanding stage labels restored. Desktop Continue stays labeled. (LoPageHeader)

- **2026-07-29** — LO mobile chrome polish: drop long LO title (LO N only); Continue as compact h-6 chip with extended tap target; icon-only stage rail (no expand labels) with selected fill; desktop row unchanged. (LoPageHeader, expandable-tabs)

- **2026-07-29** — LO header Continue corners match day-plan console Start/Continue (`rounded-xl`). (LoPageHeader)

- **2026-07-29** — LO header Continue corners tightened to `rounded-[0.25rem]` (squarer, matches dashboard chrome chips). (LoPageHeader)

- **2026-07-29** — LO header Continue corners `rounded-md` (less pill-like at compact height; size unchanged). (LoPageHeader)

- **2026-07-29** — LO header Continue sized down (min-h-7 / 11px / tighter padding). (LoPageHeader)

- **2026-07-29** — LO header Continue uses productActionPrimary compact (same as day-plan / dashboard CTAs) + CtaArrow. (LoPageHeader)

- **2026-07-29** — LO desktop chrome: removed hairline separators between location / tabs / Continue. (LoPageHeader)

- **2026-07-29** — LO mobile tabs: expandable label animation restored (compact size kept). (LoPageHeader, expandable-tabs)

- **2026-07-29** — LO chrome polish: smaller Continue (h-7 / 11px; mobile label “Continue”); mobile tabs compact equal-flex icon-only (no expand/wrap); tighter header density aligned to course chrome. (LoPageHeader, expandable-tabs)

- **2026-07-29** — LO chrome layout fix: Continue always visible (mobile row with location; desktop after hairline); no staggered wrap; desktop tabs centered between thin separators. (LoPageHeader)

- **2026-07-29** — LO chrome single row: Overview · LO title · ExpandableTabs · compact Continue (dynamic label); streak/% removed from LO header; stage-body Continue CTAs removed. (LoPageHeader, LoStudyJourney)

- **2026-07-29** — LO chrome: LO title + streak/% back on row 1; stage pathway always on its own row; ExpandableTabs nav (outline → solid current, grey locked-ahead); Pro lock is bare Lucide icon (mock-exam style, no circle). Added `expandable-tabs` + `usehooks-ts`. (LoPageHeader, expandable-tabs.tsx, LoStudyJourney, lo page)

- **2026-07-29** — LO stages folded into sub-header (`LoPageHeader`): Overview · LO N + equal-flex icon rail (no scroll); streak/% removed on LO pages; standalone `LoStudyPath` removed. Journey owns state and renders chrome. (LoPageHeader, LoStudyJourney, lo/[loNumber]/page.tsx)

- **2026-07-29** — LO pathway: Pro lock back on video/audio icons; panel width restored to full wrap (same as header/sub-header). (LoStudyPath)

- **2026-07-29** — LO pathway more compact: stage labels removed (aria/title only); icon-only rail; Pro lock moved to meta row (not on video/audio icons); desktop capped at max-w-3xl; single-row chrome on sm+. (LoStudyPath)

- **2026-07-29** — LO page layout: page gutter outside `max-w-wrap` (same as SiteHeader / PmqCourseHeader) so the pathway matches header width. (lo/[loNumber]/page.tsx)

- **2026-07-29** — LO pathway quieter pass: header-matched quiet chrome at full wrap width; dropped nested track + station plates/pulse; state via large filled icons + label weight only; Pro lock as small glyph. Stage content stays max-w-3xl. (LoStudyPath, LoStudyJourney, lo/[loNumber]/page.tsx)

- **2026-07-29** — Dashboard course card: Get Pro Bundle footer uses the same grey thin divider as card chrome (`border-black/[0.08]`). (DashboardPmqCourseCard)

- **2026-07-29** — Exam-date calendar: past days stay muted and unclickable, no strikethrough (removed from shared Calendar defaults too — classNames merge kept the old style). (calendar.tsx, DashboardPmqCourseCard)

- **2026-07-29** — Exam-date calendar: past days stay muted and unclickable, no strikethrough. (DashboardPmqCourseCard)

- **2026-07-29** — Exam-date coach tip copy: “Add your exam date so that Sly, the AI tutor, can pace your study.” (DashboardPmqCourseCard)

- **2026-07-29** — Mobile profile panel left-aligns under the trigger and clamps into the viewport (was right-anchored, so a left-side button clipped the panel off-screen). (DashboardProfileMenu)

- **2026-07-29** — Mobile edit-profile is an anchored dropdown under the trigger (not a bottom sheet), portaled fixed above the footer; body scroll locked + panel `overflow-y-auto` so scrolling the form doesn’t dismiss it. (DashboardProfileMenu)

- **2026-07-29** — Mobile edit-profile sheet portals to `document.body` at z-100/110 so it stacks above SiteFooter (was trapped under footer by dashboard stacking context). (DashboardProfileMenu)

- **2026-07-29** — Profile form snappier: uncontrolled fields (no per-keystroke re-render); save uses immediate saving state + bars spinner (dropped useTransition deferral). (DashboardProfileMenu)

- **2026-07-29** — Exam-date save uses ring spinner; “Saved” on deadline + profile menu is grey (ink/45) not olive. (DashboardPmqCourseCard, DashboardProfileMenu)

- **2026-07-29** — Exam-date picker disables days before today (UI + saveExamDeadline server check). (DashboardPmqCourseCard, profile-actions.ts)

- **2026-07-29** — Dashboard greeting: first-time (no LOs done) “Welcome!”; returning (any LO complete) “Welcome back, {name}”. (user-display.ts, dashboard/page.tsx)

- **2026-07-29** — Day-plan console Continue uses body Figtree (not stamp mono), matching dashboard CTAs. (PmqPlanContinue)

- **2026-07-29** — Dashboard Continue / Overview soft-nav shows bars spinner only (no “Opening…” label). (DashboardPmqCourseCard)

- **2026-07-29** — Profile dropdown: removed footer divider above Exit/Save for a tighter panel. (DashboardProfileMenu)

- **2026-07-29** — Profile trigger avatar gets header-grey ring; productSurfaceQuiet fill/blur matched to SiteHeader chrome (course card border/shadow already shared). (DashboardProfileMenu, semantic.ts)

- **2026-07-29** — Profile trigger + form fields use header-matched grey outline (order-black/[0.08]). (DashboardProfileMenu)

- **2026-07-29** — Profile menu: divider borders match header grey (order-black/[0.08]); avatar row evenly spaced with thin grey rings; life-achievement placeholder updated. (DashboardProfileMenu)

- **2026-07-29** — Dashboard profile menu quieter/compact (thin chrome, smaller trigger/avatars); added optional company field + migration 20260729190000_profile_company.sql. (DashboardProfileMenu, profile.ts, profile-actions.ts)

- **2026-07-29** — Dashboard exam-date empty state: label “Exam date” + one-time coach tip (localStorage lic_exam_date_coach_v1) explaining pacing; Set date / Not now. (DashboardPmqCourseCard)

- **2026-07-29** — Dashboard Get Pro CTA: label “Get Pro Bundle · £9.99”; price uses same body/semibold 12.5px type as Continue / Overview (not stamp). (DashboardPmqCourseCard.tsx)

- **2026-07-29** — Mock results “Back to course overview” soft-nav with ring spinner. (MockExamRunner.tsx)

- **2026-07-29** — Mock results verdict: “Refer - keep going.” uses hyphen instead of em dash. (MockExamRunner.tsx)

- **2026-07-29** — Day-plan console: removed LO enter / panel-swap animation on day-tab switch (instant LO list). (PmqDayPlan.tsx)

- **2026-07-29** — Sub-header Overview soft-nav shows ring spinner while opening course overview. (PmqCourseHeader.tsx)

- **2026-07-29** — Dashboard: removed “Continue” heading; welcome text is large animated Fraunces (`fadeSlideIn`); card buttons back to `rounded-xl` matching hero CTAs. (`dashboard/page.tsx`, `DashboardPmqCourseCard.tsx`, `globals.css`)

- **2026-07-29** — Dashboard footer now peeks (first half visible) while the “Keep Learning” flickering grid stays blank until the band is scrolled into view. (`dashboard/page.tsx`, `src/components/ui/flickering-footer.tsx`)

- **2026-07-29** — Dashboard Pro chip shrunk (`h-4`, `9px` type). (`DashboardPmqCourseCard`)

- **2026-07-29** — Dashboard: larger Fraunces course title (`1.125`/`1.25rem`); page `min-h` fills viewport under header so site footer sits below the fold. (`DashboardPmqCourseCard`, `dashboard/page.tsx`)

- **2026-07-29** — Dashboard card CTAs: squarish `0.25rem` radius; course title uses logo `font-display` (Fraunces); Continue + Overview both soft-nav with bars spinner. (`DashboardPmqCourseCard`)

- **2026-07-29** — Dashboard course card compact layout: streak/%/deadline top-right; Continue + Overview side-by-side; LO number on Continue (dropped “LO N · title” line); orange “5 days” in course name; Sly fair-usage `card` strip (click bar / Top up). (`DashboardPmqCourseCard`, `SlyUsageMeter`)

- **2026-07-29** — Dashboard quieter SaaS restage (`/impeccable polish` + `quieter`): page shell uses body-weight “Continue” header + `max-w-wrap`; course card drops XP (streak + % chips match course chrome), soft-nav Continue with bars spinner, quieter Pro footer / deadline picker; `CourseReportCard` + empty state matched. (`dashboard/page.tsx`, `DashboardPmqCourseCard.tsx`, `CourseReportCard.tsx`)

- **2026-07-29** — Header Sign out shows ellipsis spinner while signing out (same soft-pending language as Dashboard). (`SignOutButton.tsx`)

- **2026-07-29** — Header Dashboard control shows ellipsis spinner while soft-navigating to `/dashboard`. (`SiteHeaderControls.tsx`)

- **2026-07-29** — Mock exams notice: dropped bold on “One sitting only.” (`PmqMockExamsSection`)

- **2026-07-29** — Sub-header Pro mark uses teal accent (`bg-teal/12` + `text-teal`). (`PmqCourseHeader.tsx`)

- **2026-07-29** — Pro-unlocked course overview sub-header shows a quiet squarish “Pro” mark beside the course name (`isPro` from AI-tutor entitlement). (`PmqCourseHeader.tsx`, `pmq-in-5-days/page.tsx`)

- **2026-07-29** — `/impeccable polish` mock final-result card: heading is `Mock Exam N`; score + % on one quiet line; hierarchy matched to start/break cards. (`MockExamRunner`)

- **2026-07-29** — `/impeccable quieter` mock final result + grading cards: flat header-matched chrome, body-weight score (no display/stamp shout), quiet pass/refer line, softer review notes; Review CTA with Loading… spinner. (`MockExamRunner`)

- **2026-07-29** — Course sub-header streak + % chips use squarish `0.25rem` radius (matches rail cells); progress track no longer pill/`rounded-full`. (`PmqCourseHeader.tsx`)

- **2026-07-29** — Reverted Choose-dropdown restyle; back to prior inline-select look. (`QuestionResponseFields.tsx`)

- **2026-07-29** — Start Part 2 uses dedicated `startingPart2` loading state (bars + “Starting…”) so the spinner stays visible for the whole network round-trip, not just the brief `useTransition` flash. (`MockExamRunner.tsx`)

- **2026-07-29** — `/impeccable quieter` optional break card: flat header-matched chrome, body-weight title, new copy; break timer shows minutes + seconds (`12m 34s`); Start Part 2 with Starting… spinner. (`MockExamRunner`, `mock-domain.ts`)

- **2026-07-29** — Part-submit dialog stays open while submitting so Submit Part shows bars + “Submitting…” (was closing immediately, so the spinner never appeared). (`MockExamRunner.tsx`)

- **2026-07-29** — Part-submit dialog: unanswered-zero-marks line sits directly under the irreversible-submit copy (above the stats strip). (`MockExamRunner.tsx`)

- **2026-07-29** — Part-submit dialog copy centre-aligned; body “Once submitted, your answers can't be changed.” (`MockExamRunner`)

- **2026-07-29** — `/impeccable quieter` part-submit confirm: softer scrim, flat header-matched dialog, body-weight title, single muted stats strip (no nested metric cards / teal-rust shout), quieter unanswered note + compact actions with Submitting… spinner. (`MockExamRunner`)

- **2026-07-29** — Mock Next scrolls to page top (`window.scrollTo(0)`), not the course sub-header. (`MockExamRunner.tsx`)

- **2026-07-29** — Question-bank flagged cells use a small filled Flag icon inset from the corner (replaces orange corner dot). (`MockExamRunner`)

- **2026-07-29** — Mock pre-start: CTA “Start Exam”; card copy centre-aligned; dropped bold emphasis on notice/title. (`MockExamRunner`)

- **2026-07-29** — `/impeccable quieter` mock pre-start card: flatter header-matched chrome, body-weight title (no display shout / teal stamp), one-attempt warning in quiet notice; CTA swapped to `Start Mock Exam N` with bars + “Starting…”. (`MockExamRunner.tsx` / `.module.css`)

- **2026-07-29** — Mock exam snappiness: flag snaps to orange (no color tween / fill uses `--orange`); Next/rail nav updates instantly and persists in background; part submit uses dedicated `submittingPart` + bars spinner on Submit part. (`MockExamRunner.tsx` / `.module.css`)

- **2026-07-29** — Flag toggle no longer uses the shared `useTransition` pending flag, so Submit/nav don’t flicker/disable while the flag save round-trips. (`MockExamRunner.tsx`)

- **2026-07-29** — Flagged Flag icon keeps stroke so the pole stays visible when the cloth is filled. (`MockExamRunner.tsx`)

- **2026-07-29** — Mock question bank + question card use the same border/shadow chrome as `PmqCourseHeader` (`rounded-xl`, `border-black/8`, soft dual shadow). (`MockExamRunner.module.css`)

- **2026-07-29** — Mock sitting tweaks: Next scrolls course header into view (not rail); Submit part moved to question-bank rail top-right; Part label plain in sub-header; timer chip squarish orange; dropdown blanks use `leading-relaxed`, shorter fixed-width Choose selects. (`MockExamSession`, `MockExamRunner`, `QuestionResponseFields`, `PmqCourseHeader`)

- **2026-07-29** — Mock sitting layout polish: Part chip in sub-header (not question card); Submit stays top-right; rail+question match `max-w-wrap` header rail; tighter sub-header→rail gap; Next scrolls rail to top; SiteHeader unpinned on `/mock`; Next right + solid paper fill (no dots bleed). (`MockExamSession`, `MockExamRunner`, `constants.ts`)

- **2026-07-29** — `/impeccable polish` mock sitting chrome: streak/% removed from mock sub-header; overall H:MM:SS timer lives there instead; dual timer card removed; Part 1/2 question rail is tabbed + denser. (`MockExamSession.tsx`, `MockExamRunner.tsx` / `.module.css`, `PmqCourseHeader.tsx`, `mock/page.tsx`)

- **2026-07-29** — `/impeccable quieter` on mock exam runner: flat timer/rail/question panels; **Submit part** moved to question header; **Flag** is icon-only; prev/next quieter. Logic unchanged. (`MockExamRunner.tsx`, `MockExamRunner.module.css`)

- **2026-07-30** — LO stage Continue button gets a right `CtaArrow`. (`LoStudyJourney.tsx`)

- **2026-07-30** — LO pathway: colourless centered **Continue to X** under every stage (outside cards; not on Checkpoint); bars spinner while advancing. (`LoStudyJourney.tsx`)

- **2026-07-30** — Practise `+N more` sits in the set rail immediately beside the last set pill (not a separate far-right column). (`PracticeQuizSection.tsx`, `PracticeQuiz.module.css`)

- **2026-07-30** — Practise header is three rows only: title + Generate; one-try subhead; sets rail + `+N more`. Generate uses ring spinner. (`PracticeQuizSection.tsx`, `PracticeQuiz.module.css`)

- **2026-07-30** — Practise mobile sets chrome: Generate/`+N more` sit on a fixed row above; unlocked sets use an 8-column equal grid (7 sets → one empty slot). (`PracticeQuizSection.tsx`, `PracticeQuiz.module.css`)

- **2026-07-30** — Practise naming + chrome: section title **Practise quiz** + restored “One try per question…” subhead; LO pathway label **Quiz**; video/audio Pro locks are filled glyphs (no circle); desktop uses the same flat **Next ▶▶** as mobile; quiz prompt/options span full card width with normal line wrap (no `text-pretty`). (`PracticeQuizSection`, `PracticeQuiz.module.css`, `lo-stages.ts`, `LoPageHeader`, `QuizRunner`, `QuestionResponseFields`)

- **2026-07-30** — Practise Generate: boxy chip like set highlight; Pro uses teal Pro-badge wash; free-tier tip anchors quietly above the button (no heavy centered toast). (`PracticeQuizSection.tsx`, `PracticeQuiz.module.css`)

- **2026-07-30** — Practise: Q number rail spans full card width in one equal-column row (mobile + desktop); active set chip uses boxy `0.25rem` highlight matching course sub-header streak/% chips. (`PracticeQuiz.module.css`, `QuizRunner.tsx`)

- **2026-07-30** — Practise quiz chrome rethink: only unlocked sets as pills (`+N more` advertises the rest); Q index is a single sleek scroll row (not block grid); dropped “One try — check when you're sure.”; unpaid Generate is muted and opens a brief paper Pro toast (“Generate quiz sets with the Pro Bundle” + teal Pro badge) instead of checkout; question body is the visual priority. (`PracticeQuizSection.tsx`, `QuizRunner.tsx`, `PracticeQuiz.module.css`)

- **2026-07-30** — Orient/Learn/Apply body copy uses full card width on mobile + desktop: dropped Orient’s icon-column indent (outcomes inline like Learn); explicit `w-full` on Learn markdown blocks and Apply list shells. (`LoOrientStage.tsx`, `LoLearnStage.tsx`, `LoApplyStage.tsx`, `globals.css`)

- **2026-07-30** — Header ThemeToggle height dropped to `h-6` (tighter `p-0.5`, smaller glyphs) for a sleeker app-switch profile. (`src/components/ui/theme-toggle.tsx`)

- **2026-07-30** — Learn core markdown tables: continuous thin outline via `markdown-table-shell` frame + ink-token internal grid (fixes missing/collapsed edges and dark-mode invisibility of `border-black/8`). (`CoreContentBlock.tsx`, `globals.css`)

- **2026-07-29** — LO Orient: Context and Learning outcomes each get their own opaque card (was one panel with a divider). (`LoOrientStage.tsx`)

- **2026-07-29** — FAQ section title: orange accent on the final “s” (`FAQs`), matching other overview console headings. (`PmqFaqSection.tsx` / `.module.css`)

- **2026-07-29** — Header ThemeToggle: restored wide track (`w-14`); made vertically thinner (`h-7` vs sibling `h-8`) with fully rounded pill corners for an app-switch feel. (`src/components/ui/theme-toggle.tsx`)

- **2026-07-29** — FAQ question weight: 500 (not bold). (`PmqFaqSection.module.css`)

- **2026-07-29** — FAQ accordion motion: fluid height (0fr→1fr) + fade/slide; panels stay mounted; reduced-motion snaps. (`PmqFaqSection.tsx` / `.module.css`)

- **2026-07-29** — FAQs quieter/SaaS restage: one flat console accordion (no sticker borders/shadows); questions/answers/link URLs unchanged. (`PmqFaqSection.tsx`, `PmqFaqSection.module.css`)

- **2026-07-29** — More resources blurbs tightened: dropped BoK “authoritative source” clause; podcast → “Free podcast series covering all LOs for the 2024 syllabus.” (`PmqOverviewSections.tsx`)

- **2026-07-29** — More resources desktop: dropped vertical rule; two soft wells with gap instead. (`PmqMoreResources.module.css`)

- **2026-07-29** — More resources APM link label: `Visit website →` (was Visit apm.org.uk). (`PmqOverviewSections.tsx`)

- **2026-07-29** — Further reading → **More resources**: flat console (no glass/stripe/stamp CTAs), dense resource rows; link copy unchanged. (`PmqMoreResources.module.css`, `PmqOverviewSections.tsx`)

- **2026-07-29** — Command words desktop table: removed Word / What they want header + rule. (`PmqOverviewSections.tsx`, `PmqCommandWords.module.css`)

- **2026-07-29** — Command words lede: “Examiners use these words in questions. Know what each one is asking for before you write.” (`PmqOverviewSections.tsx`)

- **2026-07-29** — `/impeccable quieter` on command words: flat console chrome (no glass/stamp pills/dark thead); desktop quiet table; mobile dense `<dl>` stack. Copy unchanged. (`PmqCommandWords.module.css`, `PmqOverviewSections.tsx`)

- **2026-07-29** — Mock console timer: soft chip fill matching course sub-header streak/% meta (`bg-ink/5`). (`PmqMockExamsSection.module.css`)

- **2026-07-29** — Mock console timer spacing: middot+clock inline inside status (same rhythm as `Completed · Refer`), not flex-gapped siblings. (`PmqMockExamsSection.tsx`)

- **2026-07-29** — Mock console timer: middot separator between status (`In progress` / `On break`) and H:MM:SS. (`PmqMockExamsSection.tsx`)

- **2026-07-29** — Mock exams console: live H:MM:SS timer on the started paper (overall remaining while active; break window while on break). Summaries now include part/break deadlines. (`PmqMockExamsSection.tsx`, `mock-domain.ts`, `queries.ts`, `types/pmq.ts`)

- **2026-07-29** — Mock console row labels: `Exam N` → `Mock exam N`. (`PmqMockExamsSection.tsx`)

- **2026-07-29** — Mock exam open rows: soft-nav + bars spinner (same as 5-day plan LO rows); dropped press scale. (`PmqMockExamsSection.tsx`)

- **2026-07-29** — Locked mock rows: filled lock glyph immediately after Exam N (no chip/border); Pro bundle stays far right. (`PmqMockExamsSection.tsx`)

- **2026-07-29** — Locked mock rows: solid lock chip on the far right (beside Pro bundle); title is Exam N only. (`PmqMockExamsSection.tsx`)

- **2026-07-29** — Locked mock rows (Exams 2–4): lock icon beside title; right meta `Pro bundle` (replaces Pro / Locked). (`PmqMockExamsSection.tsx`)

- **2026-07-29** — Mock exams console: removed Unlock Pro footer CTA (exams 2–4 stay locked for Starter; upgrade lives elsewhere). (`PmqMockExamsSection.tsx`)

- **2026-07-29** — Mock exams one-sitting copy: “Once the timer ends, your exam is over.” (`PmqMockExamsSection.tsx`)

- **2026-07-29** — Mock exams: removed entitlement subtitle (`Exam 1 free · 2–4 Pro` / `4 papers`); format line stays beside title. (`PmqMockExamsSection.tsx`)

- **2026-07-29** — Mock exams title-bar subtitle ↔ meta facts swapped: format (`40 questions · 90 marks · Pass 54/90`) beside title; entitlement line (`Exam 1 free · 2–4 Pro` / `4 papers`) under meta. (`PmqMockExamsSection.tsx`)

- **2026-07-29** — `/impeccable quieter` on mock exams console: flat paper panel (no shadow/cream band), title in-panel like day plan, facts as plain meta text (no chips), quieter lock labels + LO-matched row density/chevrons. Logic unchanged. (`PmqMockExamsSection.tsx` / `.module.css`)

- **2026-07-29** — 5-day plan console LO rows: soft-nav with bars spinner (same pattern as Continue) so LO clicks feel snappy while the route loads. (`PmqDayPlan.tsx` / `.module.css`)

- **2026-07-29** — Course sub-header LO trail: `|` between ← Overview and current LO (matches overview course|Overview). (`PmqCourseHeader.tsx`)

- **2026-07-29** — Course sub-header % complete: same soft chip as streak (body semibold tabular, bar + `n%` inside); dropped stamp font on %. (`PmqCourseHeader.tsx`)

- **2026-07-29** — Course sub-header: `|` between course name and Overview; no separator between streak and %; streak restyled as compact SaaS chip (Lucide `Flame` + number in soft fill). (`PmqCourseHeader.tsx`)

- **2026-07-29** — Course sub-header: removed `|` glyphs from location trail (spacing only between Overview / LO). Hairline still separates streak from % metre. (`PmqCourseHeader.tsx`)

- **2026-07-29** — Course sub-header meta: streak vs % metre split by a 1px hairline rule (not a `|` glyph) so location trail and study stats use different separator logic. (`PmqCourseHeader.tsx`)

- **2026-07-29** — `/impeccable polish` on PMQ course sub-header: paired SiteHeader chrome (padding/shadow/radius), `min-h-10/11` strip, tighter shell gap, unified `|` separators, Overview tap target + focus ring, fire/number optical align, progress a11y (`role="group"` + single progressbar label). (`PmqCourseHeader.tsx`)

- **2026-07-29** — PMQ course sub-header streak: fire icon + number (`🔥 3`), flat stamp type beside % bar. (`PmqCourseHeader.tsx`)

- **2026-07-29** — PMQ course sub-header: flat streak mark (`✦ 3 days`) beside the narrow % bar — stamp type, no pill. (`PmqCourseHeader.tsx`)

- **2026-07-29** — `/impeccable polish` on PMQ course sub-header: removed XP + completion pills; moved course progress here as a **narrow % bar** (`w-10` / `sm:w-14` + `42%`); dropped the LO-count bar from the 5-day plan console. Streak/XP stay on dashboard card only. (`PmqCourseHeader.tsx`, `PmqDayPlan.tsx` / `.module.css`)

- **2026-07-29** — PMQ course sub-header separator: `·` → `|`. (`PmqCourseHeader.tsx`)

- **2026-07-29** — `/impeccable distill` on PMQ course sub-header: dropped slash-breadcrumb “Course Overview” mid-trail (looked like location, not back). LO pages now show explicit **← Overview** + current `LO n`; overview shows `Course · Overview`. (`PmqCourseHeader.tsx`)

- **2026-07-29** — PMQ course overview width: body matches SiteHeader + `PmqCourseHeader` rail (`flex justify-center px-3 sm:px-5` + `max-w-wrap`), replacing `.wrap`’s heavier `px-5 sm:px-8` so plan/mocks/FAQ align with header edges. LO pages unchanged (`max-w-3xl`). (`PmqOverview.tsx`)

- **2026-07-29** — 5-day plan heading copy: “Your **5-day** plan” (numeral, orange on “5-day”). (`PmqDayPlan.tsx`)

- **2026-07-29** — 5-day plan heading copy: “Your **5-day** plan” (numeral, orange on “5-day”). (`PmqDayPlan.tsx`)

- **2026-07-29** — 5-day plan heading font: use `--font-fraunces` (same as header wordmark / `font-display`), not broken `--font-display` fallback. (`PmqDayPlan.module.css`)

- **2026-07-29** — 5-day plan console copy/layout: heading → “Your **five-day** plan” (Fraunces, orange on “five-day”); course progress bar moved between day tabs and LO list. (`PmqDayPlan.tsx` / `.module.css`)

- **2026-07-29** — `/impeccable polish` on PMQ 5-day plan console: removed day-rail + LO meta dividers; dropped per-day progress for a full-width **course** progress bar (`n/24`) under the title; seamless day tabs → LO list; ~80–90ms snappy motion; touch targets ≥2.75rem. (`PmqDayPlan.tsx` / `.module.css`, `PmqOverview.tsx`)

- **2026-07-29** — `/impeccable quieter` on PMQ 5-day plan console: flat paper (no inner gradient/cream washes, no panel/tab shadows, no olive LO-row fill); ~100–120ms snappy transitions; Continue/Start/Open Mock uses bars `Spinner` while soft-nav pending (`PmqDayPlan.module.css`, `PmqPlanContinue.tsx`, `PmqOverview.tsx`).

- **2026-07-29** — Shared `Spinner` UI (`src/components/ui/spinner.tsx`, 8 variants). AI tutor / Guest Sly: **ellipsis** for history load, thinking bubble, and send busy. Mutations (quiz check/retry, generate set, mock start/submit/mark/review, auth, notify, profile save, unlock/top-up, LO seal): **bars** instead of “Checking…/Saving…” labels; `aria-busy` + `aria-label` keep meaning for screen readers.

- **2026-07-28** — PMQ course sub-header (`PmqCourseHeader`): border + shadow matched to SiteHeader (`border-black/[0.08]`, same dual-layer soft shadow, `rounded-xl`, paper/blur fill). Dropped `glassPanel` on that strip.

- **2026-07-28** — `/impeccable polish` on PMQ 5-day plan: folded title + Continue/Start into the console title bar (no external header); day-tab roving tabindex + arrow/Home/End keys; day panel swap motion; LO chevron always faintly visible on mobile. (`PmqDayPlan.tsx` / `.module.css`, `PmqOverview.tsx`)

- **2026-07-28** — Reverted mock exams sealed-booklet restage; back to the horizontal row console (facts + one-sitting notice + Exam 1–4 rows; Starter locks 2–4). (`PmqMockExamsSection.tsx` / `.module.css`)

- **2026-07-28** — Mock exams visual language shifted off the 5-day plan SaaS panel: **sealed exam booklet** — teal-deep spine, ink cover border + sticker offset, Fraunces/mono mark sheet, 40/90/54 spec grid + pass scale, ruled Paper 01–04 ledger rows, Starter “Sealed” stamps on 2–4. (`PmqMockExamsSection.tsx` / `.module.css`)

- **2026-07-28** — Mock exams console: dropped day-plan-style tabs for a clean horizontal row list (Exam 1–4); shared facts + one-sitting notice at top; Starter locks 2–4 with footer Unlock Pro. (`PmqMockExamsSection.tsx` / `.module.css`)

- **2026-07-28** — Mock exams overview: one SaaS console (Exam 1–4 tabs, same panel language as 5-day plan); Starter locks 2–4; sparse facts (40Q / 90 marks / pass 54/90) + one-sitting / clock-runs-out notice; Start/Unlock in section header. (`PmqMockExamsSection.tsx` / `.module.css`)

- **2026-07-28** — Reverted mock exams overview SaaS panel restage; back to the prior two-card Lite / Pro layout. (`PmqMockExamsSection.tsx`; removed `.module.css`)

- **2026-07-28** — SiteHeader no longer sticky/fixed on PMQ course overview + LO pages (`isPmqStudySurface`); scrolls with the page. Catalogue `/courses` stays pinned. (`SiteHeader.tsx`, `constants.ts`, `SiteHeaderControls.tsx`)

- **2026-07-28** — Reverted PMQ 5-day plan Mac console restage; back to SaaS day-tab panel with Continue in the section header. (`PmqDayPlan.tsx` / `.module.css`, `PmqOverview.tsx`)

- **2026-07-28** — PMQ overview **5-day plan** redesign: accordion cards → single SaaS day-tab panel (`PmqDayPlan` + module CSS); LO rows stay; Continue/Start (or Open Mock when done) moved into section header top-right; removed standalone ResumeCta card above the plan. Same day/LO logic. (`PmqDayPlan.tsx` / `.module.css`, `PmqOverview.tsx`)

- **2026-07-28** — Cookie notice banner: paper card (Notify/courses chrome — cream paper, soft shadow, stamp CTAs, flat cookie mark) bottom-left; “Got it” + Learn more → `/cookies`; ack in `localStorage` (`lic_cookie_notice_v1`). Honest copy: session cookie only, no ads/analytics. Mounted in root layout. Cookie Notice + Privacy §3 updated. Still not a non-essential consent gate — upgrade before Intercom/App ID goes live. (`CookieBanner.tsx`, `layout.tsx`, `legal/COOKIE_NOTICE.md`, `PRIVACY_POLICY.md`, `PRE_LAUNCH_CHECKLIST.md`)

- **2026-07-28** — Header ThemeToggle: resized to `h-8` / `w-14` with aligned knob travel so it sits flush with the other header controls (was still `h-6` after the signed-in chrome bump). (`theme-toggle.tsx`)

- **2026-07-28** — Signed-in header controls: dropped compact `h-6` discs; Dashboard / Courses / Home / Sign out now use the same `h-8` icon chrome as signed-out. (`SiteHeaderControls.tsx`)

- **2026-07-28** — LIC-65 end-of-course report (code complete, pending Sim browser verify before Linear Done): `course_completion_reports` migration + private `course-reports` Storage bucket; `bucketLo` thresholds (<3 / <65% / <80% / 80%+); extend `maybeDeliverCourseCompletionSummary` with Gemini JSON (`callTutorModelJson`) writing chat + report row (meters from quiz data, not the model); lazy PDF via `@react-pdf/renderer` at `GET /api/tutor/course-report` with Storage cache; dashboard + overview `CourseReportCard` (LockedFeature teaser for free, download for Pro when row exists). Apply migration in Supabase before testing. (`supabase/migrations/20260728200000_course_completion_reports.sql`, `src/lib/tutor/course-report.ts`, `course-completion-summary.ts`, `callTutorModel.ts`, `CourseReportPdf.tsx`, `api/tutor/course-report/route.ts`, `CourseReportCard.tsx`, dashboard + PMQ overview)

- **2026-07-28** — PFQ Notify success: removed Done CTA; close via existing X only. (`PfqNotifyDialog.tsx`)

- **2026-07-28** — Landing below-hero: replaced “ticket out” copy + Start free CTA with illustrative **PMQ in 5 Days** proof — Day 1–5 path + Starter feature stamps (24 LOs / Quizzes / Mock / Myths / Memory); Macintosh demo kept (Mac-first on mobile). (`PmqLandingProof.tsx` / `.module.css`, `(site)/page.tsx`)

- **2026-07-28** — Footer: removed Meet Sly link from Product column. (`SiteFooter.tsx`)

- **2026-07-28** — Footer copyright: removed mobile `max-w-[18rem]` clamp so the © line isn’t width-limited. (`FooterFlickerBand.tsx`)

- **2026-07-28** — Hero animals first-frame warp: poster was a differently cropped 390×332 still in a 1037/720 box. Regenerated `hero-animals-poster.png` as keyed frame 0 at canvas crop (`CROP_X` 0.105 → 1011×720), scene aspect + `object-fit: fill` match canvas; `scripts/make-hero-animals-poster.py` to rebuild. Soft-nav still shows poster until motion ready. (`HeroAnimalsScene.tsx`, poster asset, globals/CSS)

- **2026-07-28** — Hero animals animation restored (canvas chroma over `hero-animals-2.mp4`, exact outlines). Rejected poster-only / webp. Load contract: poster reveals first; canvas stays hard-hidden until 3 stable keyed paints then bitmap freeze (no `canvas.width` changes while visible — that was the soft-nav DPR flash). (`HeroAnimalsScene.tsx` / `.module.css`, `globals.css`, tests)

- **2026-07-28** — Hero animals: dropped motion for launch (poster only). Canvas soft-nav flash + animated webp looked crushed/wrong in the wrong aspect box. Scene aspect now matches poster `390/332`, `object-fit: contain`. Re-add animation later with a correctly authored asset — no canvas. (`HeroAnimalsScene.tsx` / `.module.css`, `globals.css`, tests)

- **2026-07-28** — Hero animals flash (final): abandoned runtime canvas chroma-key entirely — DPR buffer size kept flashing on soft-nav remount despite CSS locks. Visible path is poster + pre-keyed `/brand/hero/hero-animals-transparent.webp` only (absolute `object-fit: cover` fill, `visibility:hidden` until box+media + double rAF). Asset/Playwright guards ban `<canvas>` and cover remount. (`HeroAnimalsScene.tsx` / `.module.css`, `globals.css`, `tests/hero-animals*`)

- **2026-07-28** — Hero animals soft-nav flash: remount was painting canvas at DPR buffer size for a frame. Fix: `lockCanvasCssSize` (layout px) before buffer resize; `visibility:hidden` until double-rAF after box+media ready; removed `hero-enter` wrap on animals (re-trigger looked like a pop). (`HeroAnimalsScene.tsx`, `(site)/page.tsx`, tests)

- **2026-07-28** — Hero animals load flash (launch-critical): root causes were (1) canvas `width:auto` displaying the DPR buffer as CSS pixels (giant warped frame), (2) poster HTML `width={390}` FOUC before CSS module, (3) reveal before measured layout. Fix: canvas always `width/height:100%`, critical `[data-hero-animals]` sizing in `globals.css` + inline clamps, reveal only when `boxReady && (posterReady || motionReady)`, no 390 attrs. Tests extended. (`HeroAnimalsScene.tsx` / `.module.css`, `globals.css`, `tests/hero-animals-assets.test.mjs`)

- **2026-07-28** — Hero animals mobile blank: root cause was (1) stack stayed `opacity:0` until `motionReady`, and (2) ResizeObserver cleared `motionReady` on mobile URL-bar resize. Fix: show poster as soon as loaded, never unset motionReady after first reveal, 2.5s autoplay fallback → still poster, keep video mounted, `webkit-playsinline`. Guard extended in `tests/hero-animals-assets.test.mjs`. (`HeroAnimalsScene.tsx`)

- **2026-07-28** — Landing Notify band: headline bottoms-aligned + tighter to mailbox; divider + card border/shadow match SiteHeader (`border-black/[0.08]`, header shadow). (`NotifyBand.tsx`)

- **2026-07-28** — Landing Notify band: copy → “Join our newsletter.”; sleeker/tighter chrome; compact `h-8` email + `stampCtaPrimaryCompact` Notify me. (`NotifyBand.tsx`, `NewsletterSignup.tsx`)

- **2026-07-28** — PFQ Notify dialog: mobile disclaimer locked to two lines (course line + marketing/Privacy line, `whitespace-nowrap` + 9px). (`PfqNotifyDialog.tsx`)

- **2026-07-28** — PFQ Notify dialog: removed email field focus ring/orange highlight. (`PfqNotifyDialog.tsx`)

- **2026-07-28** — `/impeccable harden` on PFQ Notify dialog: drop “Get notified.”; mailbox centred; focus + abortable fetch; client email validation/`maxLength`; offline/error + Try again; long-email wrap; no dismiss while submitting. (`PfqNotifyDialog.tsx`)

- **2026-07-28** — PFQ Notify dialog: tighter gap between mailbox and “Get notified.” (`PfqNotifyDialog.tsx`)

- **2026-07-28** — PFQ Notify dialog: heading bottoms-aligned with mailbox; tighter top padding; disclaimer + Privacy on two lines. (`PfqNotifyDialog.tsx`)

- **2026-07-28** — PFQ Notify dialog: mailbox + “Get notified.” left-aligned and mid-aligned as a pair. (`PfqNotifyDialog.tsx`)

- **2026-07-28** — PFQ Notify dialog: full mailbox icon sits beside “Get notified.”; email row is email + CTA only. (`PfqNotifyDialog.tsx`)

- **2026-07-28** — `/impeccable layout` on PFQ Notify dialog: 3-col grid (mailbox | email | CTA) with tick under email column; cropped mailbox viewBox for optical h-8 alignment; spacing rhythm (tight action cluster, air around heading + disclaimer). (`PfqNotifyDialog.tsx`)

- **2026-07-28** — PFQ Notify dialog: “Get notified.” centred; “notified” in orange. (`PfqNotifyDialog.tsx`)

- **2026-07-28** — PFQ Notify dialog: restored heading “Get notified.” (`PfqNotifyDialog.tsx`)

- **2026-07-28** — PFQ Notify dialog: mailbox/input/CTA locked to `h-8` row; tick indented under email field (`max-w-[22rem]`); disclaimer/Privacy → `10px`. (`PfqNotifyDialog.tsx`)

- **2026-07-28** — PFQ Notify dialog: drop body copy; mailbox + email + Notify me on one row; centre disclaimer; tick copy loses em dash. (`PfqNotifyDialog.tsx`)

- **2026-07-28** — PFQ Notify dialog polish: landing mailbox mark (not dog art); drop “Get notified”; body copy = PM/AI newsletters line; checkbox borderless; disclaimer = course email + marketing only if ticked; wider compact shell (`32rem`). (`PfqNotifyDialog.tsx`)

- **2026-07-28** — PFQ Notify dialog: new illustration; email + compact **Notify me** on one row (`stampCtaPrimaryCompact`, same size as course-card CTAs); unticked marketing checkbox for PM/AI newsletters; consent stored in Storage (`waitlist-private`) + migration `20260728150000_newsletter_marketing_consent.sql` for DB columns. Privacy table updated. (`PfqNotifyDialog.tsx`, `api/notify/route.ts`, `stamp-chip.tsx`, `CoursesCatalog.tsx`)

- **2026-07-28** — PFQ **Notify me** opens a modal (illustration + email + stamp CTA) that writes to `newsletter_subscribers` via `POST /api/notify`, then confirms the logged email. Asset: `public/brand/Courses/pfq-notify-me.png`. (`PfqNotifyDialog.tsx`, `CoursesCatalog.tsx`, `api/notify/route.ts`)

- **2026-07-28** — Header controls: corner radius set to `rounded-xl` to match stamp CTAs (Notify me / Enrol). (`header-control.ts`, `theme-toggle.tsx`)

- **2026-07-28** — Header controls: radius tightened again to `rounded-sm` so chips read sharper / less pill-like. (`header-control.ts`, `theme-toggle.tsx`)

- **2026-07-28** — Header controls: corner radius tightened to `rounded-md` so compact chips don’t read as pills next to site `rounded-xl` CTAs. (`header-control.ts`, `theme-toggle.tsx`)

- **2026-07-28** — `/courses` + site header: Notify me → cream secondary stamp; sticky/fixed header restored on courses; more space under header before “Pick your course”; header controls shrunk (h-8 / compact h-6); course-card hover lift removed. (`CoursesCatalog`, `courses/layout.tsx`, `SiteHeader.tsx`, `header-control.ts`, `theme-toggle.tsx`)

- **2026-07-28** — `/courses`: Enrol arrow only when not enrolled; PFQ footer → **Notify me** (mailto); title shows `(coming soon)`; PMQ subhead hyphen + mobile split “APM - Project / Management Qualification Exam”; desktop filter chevron flush right. (`CoursesCatalog.tsx` / `.module.css`)

- **2026-07-28** — `/courses` PFQ card: illustration bg recolored to PMQ cream `#f6efdd`, bear scaled up, card uses one cream throughout (no band seam / no planned fade). (`pfq-in-2-days.png`, `CoursesCatalog.module.css`)

- **2026-07-28** — `/courses`: PFQ card wired with bear illustration (`pfq-in-2-days.png`) + subhead “Build Strong Project Management Foundations / and Pass Your APM PFQ Exam”; mobile subheads force longer-first two-line break; catalogue CTAs omit arrow (`showArrow={false}`). (`CoursesCatalog.tsx` / `.module.css`, `PmqStartLink.tsx`)

- **2026-07-28** — `/courses` card cream matched to PMQ art (`#f7efdc`) across head/art/footer so the illustration and chrome read as one surface. (`CoursesCatalog.module.css`)

- **2026-07-28** — `/courses` PMQ card layout: stacked bands (title/subhead → illustration → CTA) so type never overlays the art; uses illustration-only asset. (`CoursesCatalog.tsx` / `.module.css`)

- **2026-07-28** — `/courses`: mobile keeps native filter picker; desktop uses LIC paper menu; course cards centred on small screens; PMQ desktop type band cleared from illustration (art `object-position` + head cream plate + reserved art window). (`CoursesCatalog.tsx` / `.module.css`)

- **2026-07-28** — `/courses` filter: swapped broken custom menu for a compact native `<select>` (All courses / Live / Coming soon); raised catalogue stacking so the control isn’t under the header hit layer. (`CoursesCatalog.tsx` / `.module.css`, `courses/page.tsx`)

- **2026-07-28** — `/courses` filter dropdown: compact SaaS chip (value + chevron); options select on pointerdown with elevated z-index so hits aren’t stolen by course tiles. (`CoursesCatalog.tsx` / `.module.css`)

- **2026-07-28** — `/courses` polish: “Pick your **course**.”; filter moved to header-matched dropdown on the title row; tighter top padding under site header; PMQ card type band given more air above the illustration (`object-position` + head margin). (`CoursesCatalog.tsx` / `.module.css`, `courses/page.tsx`)

- **2026-07-28** — `/courses` PMQ card: landscape image is the card surface; Fraunces title + subhead + stamp CTA overlay the same cream art (`pmq-in-5-days-card.png`). Subhead → “Everything You Need to Pass Your APM - Project Management Qualification Exam”. (`CoursesCatalog.tsx` / `.module.css`)

- **2026-07-28** — `/courses` PMQ card matched to mockup stack: Fraunces title with orange “5 Days”, subhead “Get Project Management Qualification Exam Ready”, cropped cat-study art (`pmq-in-5-days.png`), real stamp CTA sized down vs landing. (`CoursesCatalog.tsx` / `.module.css`)

- **2026-07-28** — `/courses` cards restaged as compact LIC “pass tiles”: ~14rem square art plates with perforation dots, slight alternate tilt, title + Enrol/Enrolled only (course blurbs + page lead removed). (`CoursesCatalog.tsx` / `.module.css`, `courses/page.tsx`)

- **2026-07-28** — `/courses` catalogue CTA: signed-in users with the course in `getUserCourses` see **Enrolled** (quiet secondary stamp) instead of **Enrol for free**; still links through to dashboard. (`courses/page.tsx`, `CoursesCatalog.tsx`)

- **2026-07-28** — `/courses` restaged as Wispr-style modern blog catalogue: left All/Live/Coming soon filter pills, 2-up posts with large rounded illustration wells, Fraunces title + one benefit line + **Enrol for free** only (PFQ CTA disabled, empty art well). PMQ art from `public/brand/Courses/pmq-in-5-days.jpg`. Ticket cards no longer used on this page. (`CoursesCatalog.tsx` / `.module.css`, `courses/page.tsx`, `courses-catalog.ts`)

- **2026-07-28** — PMQ preview compare: mock-exam cells show plain counts (`1` / `4`) — dropped “(self-assessed)” / “(auto-graded)”. (`PmqPreviewCompare.tsx`)

- **2026-07-28** — Exam deadline day picker: solid `bg-paper` (dropped translucent blur fill) so calendar dates stay readable over the course card. (`DashboardPmqCourseCard.tsx`)

- **2026-07-28** — Dashboard course card + exam deadline picker: borders/shadows matched to site header (`border-black/[0.08]`, soft dual-layer shadow; dark `border-white/[0.12]`). (`semantic.ts` `productSurface`, `DashboardPmqCourseCard.tsx`)

- **2026-07-28** — Dashboard exam deadline picker: open upward (above the control) so it no longer sits in the Pro footer; further compacted (~15.5rem, size-6 cells). (`DashboardPmqCourseCard.tsx`)

- **2026-07-28** — Dashboard exam deadline calendar: compact popover (7×7 day cells, tighter caption/nav/padding) for a sleeker picker. (`DashboardPmqCourseCard.tsx`)

- **2026-07-28** — Dashboard exam deadline: swapped native `<input type="date">` for Origin/shadcn `Calendar` (`react-day-picker` v9) via `ExamDeadlinePicker` popover on `DashboardPmqCourseCard`. Added `src/components/ui/calendar.tsx` + `button.tsx`; Tailwind aliases for shadcn tokens (primary-foreground, muted, accent, etc.) mapped to LIC colours; deps `react-day-picker@9`, `@radix-ui/react-slot`, `class-variance-authority` (lucide already present).

- **2026-07-28** — PMQ preview compare: “What's Included” centred across the first-column card width. (`PmqPreviewCompare.tsx` / `.module.css`)

- **2026-07-28** — PMQ preview compare: “What's Included” aligned with feature text (icon-width spacer); first-column rules run from icon left edge with matching right inset. (`PmqPreviewCompare.tsx` / `.module.css`)

- **2026-07-28** — PMQ preview: sign-up card cream matched to compare cards; first-column row rules equal inset (14% both sides); header “Features” → “What's Included”. (`PreviewPage.module.css`, `PmqPreviewCompare.tsx` / `.module.css`)

- **2026-07-28** — PMQ preview: reverted last pin/portal + white-card pass — back to CSS sticky sign-up + 55/45 cream table cards. (`PreviewSignupPin.tsx`, `PreviewPage.module.css`, `PmqPreviewCompare.module.css`)

- **2026-07-28** — PMQ preview: table cards pure white to match sign-up (`quietFormSurface`). Sign-up pin: portal to `document.body` + CSS-only `top` (no scroll-linked position updates) so the card cannot drift. (`PmqPreviewCompare.module.css`, `PreviewSignupPin.tsx`, `PreviewPage.module.css`)

- **2026-07-28** — PMQ preview: compare cards slightly creamier (55% white / 45% paper). Sign-up card: dropped JS fixed positioning for CSS `position: sticky` on a rail stretched to the main column height; unlock `html`/`body` overflow-x while mounted so sticky actually works. (`PmqPreviewCompare.module.css`, `PreviewSignupPin.tsx`, `PreviewPage.module.css`, `globals.css`)

- **2026-07-28** — PMQ preview compare cards: dialled back cream fill (≈78% white / 22% paper) so Features / Starter / Pro read closer to the header & sign-up chrome. (`PmqPreviewCompare.module.css`)

- **2026-07-28** — PMQ preview compare: feature label “Practice quiz” → “Practice quiz questions”. (`PmqPreviewCompare.tsx`)

- **2026-07-28** — PMQ preview sign-up pin fix: always lock to viewport centre (clamped to heading→table). Previous “content midpoint” path made the card scroll with the page whenever the band wasn’t taller than the viewport — that was why it “still wasn’t stuck.” (`PreviewSignupPin.tsx`)

- **2026-07-28** — PMQ preview sign-up pin: card tracks viewport centre but clamps to the heading→table band (`#preview-pin-range`) so it stays in the middle of that content, not free-floating on the page. (`PreviewSignupPin.tsx`, `preview/page.tsx`)

- **2026-07-28** — PMQ preview sign-up: replaced broken sticky with `PreviewSignupPin` — `position: fixed` centred in the viewport, locked to the right grid column via ResizeObserver (body `overflow-x-clip` kills sticky). (`PreviewSignupPin.tsx`, `preview/page.tsx`, `PreviewPage.module.css`)

- **2026-07-28** — PMQ preview sign-up card: sticky in the viewport vertical middle on desktop (`top: max(5.75rem, 50dvh - 14rem)`); removed courses-layout `overflow-x-clip` so sticky isn’t killed by a nested scrollport. (`PreviewPage.module.css`, `courses/layout.tsx`)

- **2026-07-28** — PMQ preview compare: Features column wrapped in the same paper card chrome as Starter / Pro. (`PmqPreviewCompare.tsx` / `.module.css`)

- **2026-07-28** — PMQ preview compare: “Features” aligned on the same header line as “Starter” / plan names (spacer matches plan meta). (`PmqPreviewCompare.tsx` / `.module.css`)

- **2026-07-28** — PMQ preview compare mobile: drop 32rem min-width (was clipped by `overflow-x-clip`); board fits viewport with fluid columns + smaller type; scroller bounded (`min-width: 0` / `max-width: 100%`). (`PmqPreviewCompare.module.css`)

- **2026-07-28** — PMQ preview compare: feature-column row rules extend flush to the left edge; plan-column rules stay inset. (`PmqPreviewCompare.module.css`)

- **2026-07-28** — PMQ preview compare: restored row separators as short inset rules (~72% width) across features + both plan columns. (`PmqPreviewCompare.module.css`)

- **2026-07-28** — PMQ preview compare: removed row divider lines for a cleaner look. (`PmqPreviewCompare.module.css`)

- **2026-07-28** — PMQ preview compare: Pro mock label “auto-graded” (lowercase). (`PmqPreviewCompare.tsx`)

- **2026-07-28** — PMQ preview compare: opaque header-matched plan cards (no dot-grid bleed, header border/shadow/radius); practice cells “240” / “1800+”; mock labels nowrap (“self-assessed” / “Auto-graded”). (`PmqPreviewCompare.tsx` / `.module.css`)

- **2026-07-28** — PMQ preview compare polish: drop icon tile borders/shadows, tighter rows (less scroll), Figtree body + Fraunces headers, mock exam icon → computer screen. (`PmqPreviewCompare.module.css`, `PmqPreviewFeatureIcons.tsx`)

- **2026-07-28** — PMQ preview compare icons: swapped custom hero tiles for the same LO stage icons (Learn stack, Practise quiz, Checkpoint seal, Misconceptions, Memory aids, Sly fox-face, Video/Audio overview) in LO header chrome. (`PmqPreviewFeatureIcons.tsx`, `PmqPreviewCompare.module.css`)

- **2026-07-28** — PMQ preview compare: Affinity-style redesign — paper plan cards with soft elevation, ink circular ticks, feature column with hero-animals flat icons (cream tile + orange/teal/ink). All copy unchanged. (`PmqPreviewCompare.tsx` / `.module.css`, `PmqPreviewFeatureIcons.tsx`)

- **2026-07-28** — Landing hero animals load flash: CSS-module box (width + aspect-ratio + overflow) from first paint so media can’t paint at intrinsic 390px / full column; stack stays invisible until 3 stable keyed paints (`readyState≥3`, fonts ready); dropped Next/Image poster (was flashing oversized); plain absolute `img` only for reduced-motion. (`HeroAnimalsScene.tsx` / `.module.css`)

- **2026-07-28** — Landing hero animals: kill load-time warp — hold poster until two keyed paints at a stable layout size, ResizeObserver keeps the canvas buffer matched (no CSS stretch of an old bitmap), wait for decoded video (`canplay`/`readyState≥2`), `preload="auto"`, longer poster→canvas crossfade, poster `object-cover` to match canvas fill. (`HeroAnimalsScene.tsx`)

- **2026-07-28** — Sign-in card: tighter gap between “Welcome back” and “Pick up where you left off.” (`AuthDeskPanel.module.css`)

- **2026-07-28** — PMQ preview sign-up: tighter gap between “Start learning for free” and “Unlock Pro anytime after.” (`preview/page.tsx`)

- **2026-07-28** — PMQ preview sign-up card: LIC fox logo above the headline. (`preview/page.tsx`)

- **2026-07-28** — PMQ preview sign-up: email/password fields left-aligned; rest of card stays centred. (`PreviewPage.module.css`)

- **2026-07-28** — PMQ preview sign-up card: centre-aligned copy, labels, inputs, terms, and switch line (preview-scoped). (`preview/page.tsx`, `PreviewPage.module.css`, `AuthForm` className)

- **2026-07-28** — Auth saas sign-up: Terms/Privacy above the Sign in switch line. (`AuthForm.tsx`)

- **2026-07-28** — PMQ preview sign-up card: removed divider under headline; Terms/Privacy checkbox moved to bottom of saas AuthForm. (`PreviewPage.module.css`, `AuthForm.tsx`)

- **2026-07-28** — PMQ preview sign-up panel: centre-aligned “Start learning for free” / “Unlock Pro anytime after.” (`preview/page.tsx`)

- **2026-07-28** — PMQ preview compare: Pro price meta matches Free grey; Pro numeric cells match Starter text weight/colour. (`PmqPreviewCompare.tsx`, `.module.css`)

- **2026-07-28** — PMQ preview compare: plan metas in brackets — Starter (Free), Pro Bundle (£9.99 One-off). (`PmqPreviewCompare.tsx`)

- **2026-07-28** — PMQ preview compare header: Features column label; Starter Free / Pro Bundle £9.99 One-off on one line. (`PmqPreviewCompare.tsx`)

- **2026-07-28** — PMQ preview compare: stronger hyphen (weight/contrast) so it reads over the cream dot grid. (`PmqPreviewCompare.module.css`)

- **2026-07-28** — PMQ preview compare: split Misconceptions / Memory Aids (below Mock exam); dropped Exam Techniques; core study on two lines; ticks vs hyphens. (`PmqPreviewCompare.tsx`)

- **2026-07-28** — PMQ preview lead: “APM PMQ” → “APM - Project Management Qualification”. (`preview/page.tsx`)

- **2026-07-27** — PMQ preview lead: trimmed to two sentences (dropped quizzes/mocks closing line). (`preview/page.tsx`)

- **2026-07-27** — PMQ preview compare polish: Starter / Pro Bundle copy refresh; Common Misconceptions row; no Get Pro CTA; Apple-compact hairline table in LIC tokens (no em dashes). (`PmqPreviewCompare.tsx`, `PmqPreviewCompare.module.css`)

- **2026-07-27** — PMQ preview lead: dropped AI-tutor clause from subhead; quizzes + mock exams only. (`preview/page.tsx`)

- **2026-07-27** — PMQ preview: reverted orange on subhead “five structured days”; orange “5 Days” in the page heading instead. (`preview/page.tsx`)

- **2026-07-27** — PMQ preview lead: longer exam-ready subhead under the course title. (`preview/page.tsx`)

- **2026-07-27** — PMQ preview compare: removed “Lite or Pro” heading and support line; table stands alone. (`PmqPreviewCompare.tsx`)

- **2026-07-27** — PMQ preview: removed the 5-day plan block; page is lead + Lite/Pro compare + sign-up. (`preview/page.tsx`)

- **2026-07-27** — PMQ preview sign-up panel copy: “Start learning for free” / “Unlock Pro anytime after.” (`preview/page.tsx`)

- **2026-07-27** — Footer: tightened gap between brand mark/wordmark and tagline (`mb-3` → `mb-1.5` on `.brand`) (`SiteFooter.tsx`).

- **2026-07-27** — Wordmark gap tightened (`-mt-[0.04em]` → `-mt-[0.08em]`) in header and footer (`SiteHeader.tsx`, `SiteFooter.tsx`).

- **2026-07-27** — Footer tagline swapped to “Master project Management & AI” (AI in orange) (`SiteFooter.tsx`).

- **2026-07-27** — Wordmark: slightly more gap between “Learn in” and “Curve” (`-mt-[0.12em]` → `-mt-[0.04em]`) in header and footer (`SiteHeader.tsx`, `SiteFooter.tsx`).

- **2026-07-27** — PMQ preview sign-up panel copy: “Start learning for free” / “Unlock Pro anytime after.” (`preview/page.tsx`)

- **2026-07-27** — PMQ preview: plan above pricing; title “The 5-day plan”; all 24 LOs always visible via `layout="open"` compact day lists (no accordion). (`preview/page.tsx`, `PmqDayPlan.tsx`)

- **2026-07-27** — PMQ sign-up preview redesign: Lite/Pro comparison table + Get Pro CTA (scrolls to sign-up), compact day accordion (`density="compact"`), trimmed lead copy. Homepage-adjacent paper restraint. (`preview/page.tsx`, `PmqPreviewCompare.tsx`, `PmqDayPlan.tsx`, `PreviewPage.module.css`)

- **2026-07-27** — Moved PMQ FAQs from sign-up preview (`/courses/pmq-in-5-days/preview`) onto the course overview (`PmqOverview` at `/courses/pmq-in-5-days`). (`preview/page.tsx`, `PmqOverview.tsx`)

- **2026-07-27** — Landing hero animals: fixed broken loop — assets live under `public/brand/hero/` but `HeroAnimalsScene` still pointed at `/brand/hero-animals-*`. Updated component + rebuild script paths; added `tests/hero-animals-assets.test.mjs` (runs on `npm run build`) so a path/file mismatch fails before deploy.

- **2026-07-27** — Profile bear avatar: full bust crop (shoulders/jacket visible) at slightly smaller scale than the head-zoom. (`bear.png?v=11`)

- **2026-07-27** — Profile avatars dark mode: circle shells use locked `bg-avatar-plate` (PNG cream `#F4E9D6`, does not follow theme `--cream`); `AvatarImage` scales slightly so `translate-y` doesn’t expose theme fill. (`globals.css`, `tailwind.config.ts`, `AvatarImage.tsx`, `DashboardProfileMenu.tsx`, `AiTutorPanel.tsx`, `SlyMacConsole.tsx`)

- **2026-07-27** — Profile avatars: removed outer rings/borders around avatar circles (picker, header trigger, panel header, tutor UserFace). Selected picker state keeps a single orange ring, no offset ring.

- **2026-07-27** — Profile avatars: removed duplicate wolf option labeled “fox” (source `7.png` / extreme-right picker slot). Remap `fox`→`wolf`; picker is 5 options. (`avatars.ts`, `DashboardProfileMenu.tsx`, migration `20260727223000_profile_avatars_drop_fox.sql`)

- **2026-07-27** — Reverted wolf avatar zoom; restored pre-zoom crop (`wolf.png?v=4`).

- **2026-07-27** — Profile avatars: reverted border/scale crop-hide; only a slight `translate-y-[6%]` on the portrait. (`AvatarImage.tsx`, `DashboardProfileMenu.tsx`, `AiTutorPanel.tsx`)

- **2026-07-27** — Profile avatars: removed thin circle borders/rings; shift+scale portrait in `AvatarImage` so the flat torso crop sits below the circular mask. (`AvatarImage.tsx`, `DashboardProfileMenu.tsx`, `AiTutorPanel.tsx`)

- **2026-07-27** — Profile avatars: swapped white plate for brand cream (`#F4E9D6`) in assets + circle shells (`bg-cream`); cache `?v=4`. (`public/avatars/*.png`, `DashboardProfileMenu.tsx`, `AiTutorPanel.tsx`)

- **2026-07-27** — Profile avatars framing: re-cropped all six to match bunny vertical fill (~90% height, same top pad); side-trim wide busts so head scale matches in the circle. Cache bump `?v=3`. (`public/avatars/*.png`, `avatars.ts`)

- **2026-07-27** — Profile avatars clarity: pre-cropped each PNG to tight 512² face square (was wide 1512×1051 with empty plate → soft when circled); `AvatarImage` serves 3× retina bitmaps; larger picker thumbs + white fill. (`public/avatars/*.png`, `AvatarImage.tsx`, `DashboardProfileMenu.tsx`, `AiTutorPanel.tsx`)

- **2026-07-27** — Dashboard profile avatars: replaced owl/badger/otter/hedgehog with illustrated cast from `public/avatars/new avatars` → `wolf/rabbit/cat/dog/bear.png`; legacy ids remapped in `resolveAvatarId` + migration `20260727220000_profile_avatars_v2.sql`; picker grid for 5 options. (`avatars.ts`, `DashboardProfileMenu.tsx`, `AiTutorPanel.tsx`, `SlyMacConsole.tsx`)

- **2026-07-27** — Hero animals stroke fidelity: gaps came from over-keying anti-aliased outline pixels + bilinear downscale cream bleed. Now strict cream plate only, ink-adjacent samples preserved, no fringe/flood/gutter erase, `imageSmoothingEnabled=false`. (`HeroAnimalsScene.tsx`)

- **2026-07-27** — Hero animals mobile: remove leftover left vertical black rail — slightly deeper side crop (`CROP_X` 0.102), edge-flood near-black, plus thin L/R gutter clear. (`HeroAnimalsScene.tsx`)

- **2026-07-27** — Hero animals outlines: removed silhouette thicken — stroke width matches source video exactly; keying only removes cream plate / light halo. (`HeroAnimalsScene.tsx`)

- **2026-07-27** — Hero animals outlines: stopped fringe-scrub from eating black strokes; thicken dark silhouette ~1 CSS px (2 buffer px on retina) so borders read on mobile + desktop. (`HeroAnimalsScene.tsx`)

- **2026-07-27** — Hero animals mobile edge cleanup: paint at laid-out box × retina DPR (was 1× → soft/dirty borders after CSS scale); fringe-scrub muddy plate halos; remove conflicting `max-h` so buffer isn’t double-scaled. (`HeroAnimalsScene.tsx`)

- **2026-07-27** — Hero animals clarity: lossy animated webp was crushing flat blacks again; restored canvas chroma over `/brand/hero-animals-2.mp4` (DPR-safe full-buffer key + side crop) with IntersectionObserver / tab / reduced-motion pause and capped paint size so it stays clearer without full-time CPU burn. (`HeroAnimalsScene.tsx`)

- **2026-07-27** — Brand hero audit fix-all: dropped CPU canvas chroma for pre-keyed `/brand/hero-animals-transparent.webp` (Image embed + IntersectionObserver pause + reduced-motion poster); capped animals height on short viewports; h1 nowrap removed (`text-balance`); section `aria-labelledby`; unused `stampCtaPrimary` import removed. (`HeroAnimalsScene.tsx`, `(site)/page.tsx`, rebuild script)

- **2026-07-27** — Brand hero headline casing: “Master Project Management & AI” (`(site)/page.tsx`).

- **2026-07-27** — Brand hero: tightened headline→subhead gap (`mb-5` → `mb-2` on h1 in `(site)/page.tsx`).

- **2026-07-27** — Hero animals loop: trimmed last 0.5s from `/brand/hero-animals-2.mp4` (8.0s → 7.5s).

- **2026-07-27** — Hero animals black/white block fix: canvas was DPR-scaled then `getImageData`'d only the top-left CSS quadrant, leaving unkeyed letterbox (black bars + white crumbs) visible around the scene. Now paints/keys the full device-pixel buffer, crops ~9.5% side pillarbox before draw, and keys cream + pure white. (`HeroAnimalsScene.tsx`)

- **2026-07-27** — Hero animals chop/black-line fix: dropped lossy animated webp (re-encoding flat black fills caused crawling noise). Live path is canvas chroma-key over `/brand/hero-animals-2.mp4` at native 24fps (`requestVideoFrameCallback` when available); cream + letterbox keyed out; CSS bob removed (subpixel shimmer). Poster kept for reduced-motion / load. (`HeroAnimalsScene.tsx`)

- **2026-07-27** — Brand hero animals: swapped source to `hero animals 2` (`/brand/hero-animals-2.mp4`). Rebuilt transparent loop `/brand/hero-animals-transparent.webp` + poster (cream keyed, letterbox cleared, first=last frames → seamless). `HeroAnimalsScene` uses Image/webp like sign-up fox, no plate/border, soft idle bob (`.hero-animals`), reduced-motion → poster.

- **2026-07-27** — Brand hero: inserted transparent looping `hero animals` animation above headline (same Image/webp pattern as sign-up fox). Asset processed via `scripts/make-hero-animals-transparent.py` → `/brand/hero-animals-transparent.webp` (cream keyed, edge letterbox cleared, audio stripped, 12fps loop). Component: `HeroAnimalsScene.tsx`.

- **2026-07-27** — Guest header: labeled Courses also on About, Careers, Privacy, Terms (plus existing PMQ preview) (`SiteHeaderControls.tsx`).

- **2026-07-27** — Guest header on PMQ preview (`/courses/pmq-in-5-days/preview`): added labeled Courses control alongside Home + Get Started (`SiteHeaderControls.tsx`).

- **2026-07-27** — LO pathway panel heading: show learning-objective title after `LO {n}` instead of the current stage name (stage kept in `sr-only`) (`LoStudyPath.tsx`).

- **2026-07-27** — Hero word-vacuum into Sly reverted at Sim’s request: removed `HeroWordVacuum`, restored centered brand-hero copy/CTAs only, deleted `/mascot/sly-hero-idle.mp4` + poster; prompt restored to `cursor-prompt-hero-word-vacuum-sly.md` for possible later retry.

- **2026-07-27** — Hero word-vacuum into Sly: scroll-triggered gold/teal/orange journey-path arcs (`stroke-dashoffset`) + staggered PM/AI pill chips converging to one point above Sly’s head; idle Veo loop `/mascot/sly-hero-idle.mp4` with poster + reduced-motion still; word layer hidden below `md` so CTAs stay reachable. Figtree variable weight used for chip thinning (no new font). Wired into brand hero (`HeroWordVacuum.tsx` / `.module.css`, `(site)/page.tsx`, assets under `public/mascot/`). Prompt archived to `cursor-prompts/archive/cursor-prompt-hero-word-vacuum-sly.md`.

- **2026-07-27** — Brand hero layout: reverted Macintosh console back beside ticket-out copy (not above brand headline) (`src/app/(site)/page.tsx`).

- **2026-07-27** — Brand hero layout: Macintosh console moved above “Master project management & AI” copy; ticket-out section is copy-only (`src/app/(site)/page.tsx`).

- **2026-07-27** — Brand hero copy: headline → “Master project management & AI”; subhead → “Sharpen your project management skills…” (`src/app/(site)/page.tsx`).

- **2026-07-27** — Brand hero copy: headline → “Project Management, AI.”; subhead added (master PM / stay ahead in AI; learn faster, work smarter, grow career) (`src/app/(site)/page.tsx`).

- **2026-07-27** — Guest header CTA: first-time users (no account hint) see “Get Started” → `/auth/sign-up`; returning guests still see “Sign in” (`SiteHeaderControls.tsx`).

- **2026-07-27** — Sitewide button language: unified to landing-hero style — `rounded-xl`, no sticker shadows (header Sign out/Dashboard/Courses/theme toggle + shell, `.btn`, stamp/semantic actions, footer social chips, key course CTAs) (`header-control.ts`, `SiteHeader.tsx`, `theme-toggle.tsx`, `semantic.ts`, `stamp-chip.tsx`, `globals.css`, related button call sites).

- **2026-07-27** — Macintosh walkthrough: console header inset to match LO/content card width (same side margins + cream card chrome as `loHeading`) (`HeroPmqMacDemo.module.css`).

- **2026-07-27** — Macintosh walkthrough: removed opaque CRT fill so the frame asset’s native screen glass shows through; cream header/pathway/cards unchanged (`HeroPmqMacDemo.module.css`).

- **2026-07-27** — Macintosh walkthrough: black CRT screen fill; cream header + pathway; cream content cards on the black screen (`HeroPmqMacDemo.module.css`).

- **2026-07-27** — Macintosh walkthrough: cream fill reserved for content cards only (resume/day/orient/learn/quiz); screen chrome (header, path, page) matches paper screen so cards stand out (`HeroPmqMacDemo.module.css`).

- **2026-07-27** — Macintosh walkthrough: locked light-mode cream/paper hex fills + full ink (`#241A12`) text on banner/cards/rows so the landing preview stays opaque and readable (no theme-token/`var(--ink)` breakage); quiz/XP chrome aligned closer to real course (`HeroPmqMacDemo.module.css`).

- **2026-07-27** — Macintosh walkthrough: restored cream/paper fills by using `rgb(var(--paper-rgb))` / `rgb(var(--cream-rgb))` (invalid `--paper`/`--cream` vars had made banners/boxes transparent) (`HeroPmqMacDemo.module.css`).

- **2026-07-27** — Macintosh walkthrough clarity: removed CRT scanline/glow wash, opaque paper/cream UI surfaces, stronger mini-type contrast, higher-quality frame asset (`HeroPmqMacDemo.module.css`, `HeroPmqMacDemo.tsx`).

- **2026-07-27** — Site header outline: swapped ink rim for an extremely thin neutral grey (`border-black/[0.08]`, soft white rim in dark) (`SiteHeader.tsx`).

- **2026-07-27** — Site header chrome: crisper thin ink outline (`border-ink/22`) and a tighter, quieter shadow so the floating bar edge reads sleek instead of washed/white (`SiteHeader.tsx`).

- **2026-07-27** — Primary home hero: removed subhead; Explore Courses uses solid cream fill so body dots don’t show through; dropped the hairline between brand hero and ticket-out section (`page.tsx`, `semantic.ts`).

- **2026-07-27** — Landing header Courses chip: hidden while `#home-brand-hero` is in view; pops in via Framer Motion once the user scrolls past it (respects reduced motion) (`SiteHeaderControls.tsx`, `page.tsx`).

- **2026-07-27** — Primary home hero: widened copy column (`max-w` ~52–58rem) so “Master Project Management.” stays on one line from `sm` up; subhead matches that width (`page.tsx`).

- **2026-07-27** — Primary home hero polish: tighter header gap (`pt-4`/`pt-6`/`pt-8`), forced center alignment at all breakpoints, flat no-shadow CTAs (`stampCtaPrimaryFlat` / `stampCtaSecondaryFlat`) (`page.tsx`, `semantic.ts`, `stamp-chip.tsx`).

- **2026-07-27** — Home: added primary brand hero above the ticket-out/Mac proof fold — “Master Project Management. Keep up with AI.” with Explore Courses (↗) + Start Free with APM PMQ (→); demoted existing headline to `h2` for a single page `h1` (`page.tsx`, `CtaArrowUpRight`, `stampCtaSecondary`).

- **2026-07-27** — Signed-in landing header: Courses icon disc shrunk to `h-7` to match Dashboard / Sign out (`headerIconCompactTeal`, `SiteHeaderControls.tsx`).

- **2026-07-27** — Sign out header control: replaced hardcoded ink hex with theme tokens (`border-ink` / `text-ink`) so the control stays visible in dark mode (`header-control.ts`).

- **2026-07-27** — Sign out door seal: on click the open-door outline swaps to a fully closed rectangle (complete left edge + fill) so the doorway no longer looks incomplete (`SiteHeaderControls.tsx`).

- **2026-07-27** — Quieter Dashboard header control: removed hover lift + icon rotate/scale; keeps orange hover wash and a soft 0.98 press only (`header-control.ts`, `SiteHeaderControls.tsx`).

- **2026-07-27** — Sign out click polish: faster arrow exit (150ms); door fill now seals the full rectangle including the left opening the arrow leaves through (`SiteHeaderControls.tsx`, `SignOutButton.tsx`).

- **2026-07-27** — Sign out icon polish: subtler hover nudge (tip no longer clips); on click the arrow exits fully left while the door rectangle fills in (`SiteHeaderControls.tsx`, `SignOutButton.tsx`, `header-control.ts`).

- **2026-07-27** — Sign out control: stronger ink outline; arrow nudges left on hover and exits fully left on click (brief exit delay before auth sign-out) (`header-control.ts`, `SiteHeaderControls.tsx`, `SignOutButton.tsx`).

- **2026-07-27** — Header signed-in chrome: Dashboard + Sign out resized to ThemeToggle height (`h-7`), Curve ink/orange compact discs, hover-lift + icon micro-motion (`header-control.ts`, `SiteHeaderControls.tsx`).

- **2026-07-27** — Header polish: shrank the ThemeToggle pill and removed the Home chip from `/dashboard` (`src/components/ui/theme-toggle.tsx`, `src/components/SiteHeaderControls.tsx`).

- **2026-07-27** — Header dark-mode pill palette: swapped stark white/zinc pill colors to Curve ink/cream tokens in `ThemeToggle` (`src/components/ui/theme-toggle.tsx`) to match the header branding.

- **2026-07-27** — Header dark-mode toggle now uses the wide pill UI from `ThemeToggle` (removed the `headerThemeToggle` size/class override), so it’s clearly visible on course overview + LO pages (`src/components/ui/theme-toggle.tsx`, `src/components/SiteHeaderControls.tsx`).

- **2026-07-27** — Header controls: swapped `DarkModeToggle` → `ThemeToggle` (lucide-react) in the header (`src/components/ui/theme-toggle.tsx`, `src/components/SiteHeaderControls.tsx`). Keeps the existing route-gated dark-mode behavior while using the shadcn-style UI component structure.

- **2026-07-27** — Header controls: hid the Home icon chip on the PMQ course overview and individual LO pages (`src/components/SiteHeaderControls.tsx`). This reduces redundant navigation while studying inside the course experience.

- **2026-07-27** — Header controls: removed colored glow/inset shadows for a flat, snappy look (hover wash + 150ms press scale only) in `header-control.ts` / `DarkModeToggle.tsx`.

- **2026-07-27** — Header Sign up/Sign in label now shows on mobile (was icon-only below `sm`); primary pill always padded (`header-control.ts`, `SiteHeaderControls.tsx`).

- **2026-07-27** — Header controls redesigned to Wispr-soft modern chrome: rounded-full pills, sentence-case Figtree, orange glow primary CTA, quiet secondary Courses, soft icon circles (`header-control.ts`, `SiteHeaderControls.tsx`, `DarkModeToggle.tsx`). Stamp chips kept for marketing CTAs only.

- **2026-07-27** — Header/footer wordmark: dropped logo edge-alignment; compact stack with a tighter inter-line gap (`-mt-[0.12em]`) while keeping Curve at 1.41× width match (`SiteHeader.tsx`, `SiteFooter.tsx`).

- **2026-07-27** — Header/footer wordmark: stack height matches the fox mark (`h-8`/`h-10`); “Learn in” / “Curve” pinned to top/bottom with `justify-between` for edge alignment and a slightly wider inter-line gap (`SiteHeader.tsx`, `SiteFooter.tsx`).

- **2026-07-27** — Header/footer wordmark: “Curve” sized at 1.41× “Learn in” so both lines share the same width; line gap tightened (`SiteHeader.tsx`, `SiteFooter.tsx`).

- **2026-07-27** — Header/footer wordmark: smaller type; “Learn in” and “Curve” stacked on two lines (`SiteHeader.tsx`, `SiteFooter.tsx`).

- **2026-07-26** — Site mark (`Logo.tsx`) now uses `public/brand/logo/fox-logo-png.png` (replacing the earlier extracted `fox-logo.png`).

- **2026-07-26** — Replaced site mark (`Logo.tsx`) with the fox asset from `public/brand/logo/fox logo.svg` (embedded raster extracted + resized to 512px `fox-logo.png` for header/footer use; original SVG left in place).

- **2026-07-25** — Footer LED flicker: “Keep Learning” letter cells use brand orange (`#d5501f`); ambient field stays cream (`#F4E9D6`) via new `textColor` on `FlickeringGrid` (`FooterFlickerBand.tsx`, `ui/flickering-footer.tsx`).

- **2026-07-23** — Fixed invisible footer “Keep Learning” flicker text: canvas now resolves `--font-fraunces` (no CSS `var()` in `ctx.font`), waits for `document.fonts`, raises text-cell opacity, and drops the ink wash overlay (`ui/flickering-footer.tsx`, `FooterFlickerBand.tsx`).

- **2026-07-23** — Reverted the full-width stamp “KEEP LEARNING” treatment; footer flicker band is back to title-case “Keep Learning” at the previous size (`FooterFlickerBand.tsx`, `ui/flickering-footer.tsx`).

- **2026-07-23** — Replaced the footer dither-wave band with a cream flickering-grid spelling “Keep Learning” (LIC links/brand unchanged); added `clsx` / `tailwind-merge` / `color-bits`, `src/lib/utils.ts` `cn()`, and `FlickeringGrid` (`FooterFlickerBand.tsx`, `src/components/ui/flickering-footer.tsx`, `SiteFooter.tsx`; removed `FooterDitherWave` + `dithering-shader`).

- **2026-07-23** — Replaced the footer LED London-skyline canvas with a full-bleed dithered wave WebGL band (ink + orange), keeping © + version overlay, reduced-motion static frame, and off-screen pause (`FooterDitherWave.tsx`, `src/components/ui/dithering-shader.tsx`, `SiteFooter.tsx`; removed `FooterLedGrid.tsx`).

- **2026-07-23** — Sign-up intro is now just “Get Started” — dropped “Start PMQ free” and the no-card / trial-clock supporting line (`src/components/AuthDeskPanel.tsx`).

- **2026-07-23** — Removed the fine desk baseline under the auth-page Sly loop by cropping the bottom of `AuthDeskScene` so the paws sit directly on the form card edge (`src/components/AuthDeskScene.tsx`).

- **2026-07-18** — Rebuilt the PMQ mock-exam interface and lifecycle around two irreversible 20-question parts with fixed 75-minute timers, a persisted optional 30-minute break, all-40 question rail, answered/flagged/current/locked states, autosaved revisit navigation, timeout locking, one lifetime attempt per paper and durable finalized answer review. Practise and mock flows now share presentation-only MCQ/inline-dropdown fields while active mock answer keys remain server-only (`MockExamRunner`, `QuestionResponseFields`, `QuizRunner`, `mock-domain`, `mock-actions`, `queries`, PMQ mock route/selector, `20260718234500_mock_exam_parts_navigation.sql`). The new migration requires a duplicate-session preflight before live application.

- **2026-07-18** — Restyled the Home Macintosh walkthrough’s pause/play control as a compact, text-free control embedded into the computer’s bottom-left casing: only the two-bar pause or triangular play glyph is visible, with no circular background. Positioning is viewport-stable and the control retains an accessible state label and visible keyboard focus (`src/components/HeroPmqMacDemo.tsx`, `src/components/HeroPmqMacDemo.module.css`).

- **2026-07-18** — Reduced the Home Macintosh screen’s clipping radius and increased the miniature header’s horizontal inset so “PMQ in 5 Days” clears the curved CRT corners without creating abrupt square edges (`src/components/HeroPmqMacDemo.module.css`).

- **2026-07-18** — Corrected every simulated cursor target in the Home Macintosh walkthrough after the seven-stage pathway changed the internal layout. The cursor now lands on Start, Learn, Practise and answer B; a dedicated answer scene performs the click before the correct-state feedback appears (`src/components/HeroPmqMacDemo.tsx`, `src/components/HeroPmqMacDemo.module.css`).

- **2026-07-18** — Increased legibility inside the Home Macintosh walkthrough by giving both the learning-objective heading and seven-stage pathway bar opaque cream surfaces with subtle borders, using the valid `--cream-rgb` design token so the backgrounds render rather than falling back to transparency (`src/components/HeroPmqMacDemo.module.css`).

- **2026-07-18** — Refined the Home hero’s Macintosh walkthrough to mirror the live PMQ interface more closely: the overview now uses the real Day 1/Pick up here hierarchy, the LO journey shows all seven production stages, and “5 Days” is orange in the miniature course header (`src/components/HeroPmqMacDemo.tsx`, `src/components/HeroPmqMacDemo.module.css`).

- **2026-07-18** — Added the four-paper mock-exam contract across `20260718220000_mock_exam_sets.sql`, `src/types/pmq.ts`, `src/lib/pmq/{mock-domain,mock-actions,queries,constants}.ts`, the mock route/runner and course selector: Exam 1 now serves all 40 free questions with persisted self-assessment, while ready Exams 2–4 are separate Pro/Gemini papers with one active Pro session across sets. Runtime readiness requires exactly 40 questions / 90 marks. The prerequisite integrity columns are live; the exam-set migration and prepared Exam 2–4 content still require ordered live application.

- **2026-07-18** — Tightened the sign-in intro copy to “Pick up where you left off.” and styled “back” in the orange brand-lockup treatment used by the site header (`src/components/AuthDeskPanel.tsx`).

- **2026-07-18** — Added a fully coded Macintosh PMQ walkthrough to the Home hero (`HeroPmqMacDemo.tsx` + CSS module, `mac-screen-transparent.webp`, asset-build script, responsive hero grid). The 9.35-second in-screen loop mirrors the real course overview, LO pathway, Orient/Learn content, practice feedback, XP and saved progress without auth, Supabase calls or fake progress writes; it pauses offscreen/on hidden tabs, has an explicit pause control and becomes a static overview under reduced motion. Added two passing Playwright regressions alongside 12 passing unit tests and a clean type-check.

- **2026-07-18** — Replaced the man-and-monitor illustration above both auth forms with a cropped, transparent and web-optimised version of the supplied looping Sly video. The final reframing retains the full ear movement, trims the desk baseline to a fine rule and slightly overlaps it with the auth card for a seamless join; delivery uses animated WebP so mobile Safari does not render a white WebM background (`src/components/AuthDeskScene.tsx`, `src/components/AuthDeskScene.module.css`, `public/brand/auth/sign-up-fox-transparent.webp`).

- **2026-07-18** — Reverted the Home hero to its earlier left-aligned layout at Sim’s request: restored the original headline, supporting paragraph, CTA placement, spacing and restrained staggered entrance (`src/app/(site)/page.tsx`, `src/app/globals.css`).

- **2026-07-18** — Tightened the Home hero’s gap below the floating site header and restored the centered supporting sentence between the animated headline and Start free CTA (`src/app/(site)/page.tsx`, `src/app/globals.css`).

- **2026-07-18** — Restaged the Home hero as centered type-on-paper: removed the supporting paragraph, kept the single Start free CTA, changed the comma in the orange “your ticket out,” line to ink, and added a nine-word staggered blur/translate/rotate entrance with route-line and CTA finishes (`src/app/(site)/page.tsx`, `src/app/globals.css`). Reduced-motion visitors receive the same fully visible static composition.

- **2026-07-18** — Reverted the full-body Sly Home-hero animation at Sim’s request: restored the copy-only hero layout and removed `SlyHeroIdle.tsx` plus its public video/poster assets (`src/app/(site)/page.tsx`, `src/components/SlyHeroIdle.tsx`, `public/mascot/sly-hero-idle.*`).

- **2026-07-18** — Added the web-ready full-body Sly idle loop only to the Home hero, with a responsive text/mascot grid, fast-start muted MP4, static poster, hydration-safe reduced-motion fallback and staggered hero entrance (`src/app/(site)/page.tsx`, `src/components/SlyHeroIdle.tsx`, `public/mascot/sly-hero-idle.*`). Existing circular `/mascot/fox-face.svg` avatars remain deliberately static. Verified at 375px and 1440px: CTA remains visible, video autoplays muted, reduced motion renders no video, and horizontal overflow is zero.

- **2026-07-18** — Reverted the Home page to its previous layout at Sim’s request: restored the copy-only hero followed by the full `SlyShowcase`, then Quiz and newsletter; removed the split first-fold compact Sly proof and deleted `HomePage.module.css` (`src/app/(site)/page.tsx`). Verified at 375px and 1440px: HTTP 200, one h1, zero horizontal overflow.

- **2026-07-18** — Completed the LIC × Wispr audit remediation across accessibility, auth, mock integrity, captions, design-system ownership and route hierarchy. The refreshed audit is 18/20: 12 unit tests, 8 Playwright tests, production build and 45 responsive/reduced-motion checks pass; `globals.css` fell from 1,939 to 1,131 lines; dead visual clusters were removed; Home now proves Sly in the first fold while preserving LIC’s paper-ticket identity (`src/`, `tests/`, `.impeccable/audit/2026-07-18__lic-wispr-full-site.md`, audit Canvas).

- **2026-07-18** — Mock Lite/Full contracts are now explicit and server-enforced in code: Lite defaults to MCQ/dropdown; Full requires the existing Pro entitlement, uses server deadlines/persisted breaks, auto-finalization, structured Gemini marking and stored grading metadata (`mock-domain`, `mock-actions`, `callExamGrader`, `MockExamRunner`, `PmqMockExamsSection`, migration `20260718180000_mock_exam_integrity.sql`). Live read-only preflight found 1 mock attempt with 0 duplicate session/question pairs and 2 open sessions with 0 duplicate user/course groups, so the migration’s unique constraints are clear; the new columns are confirmed absent (`42703`). **Release gate:** apply the migration before runtime use; Gemini DPA/transfer safeguards remain legally blocking for real written answers.

- **2026-07-18** — Generated machine WebVTT drafts for all 24 PMQ videos (3,439 cues; 24/24 structurally valid) with resumable SHA manifest and QA sidecars (`scripts/captions/`). They remain deliberately unwired (`captionsSrc: null`): 1,130 reading-speed/terminology/timing warnings and the full three-hour playback require human QA before approval/publication.

- **2026-07-18** — Completed the full LIC × Wispr Flow design audit (`.impeccable/audit/2026-07-18__lic-wispr-full-site.md` plus `lic-wispr-design-audit.canvas.tsx`): 14/20 health score, 0 P0 / 9 P1 / 8 P2 / 3 P3 findings across 45 rendered route/viewport checks and source-reviewed protected flows. Direction locked: adopt Wispr’s calm hierarchy, early product proof and interaction polish, but preserve LIC’s paper-ticket, orange/teal, Sly and exam-journey identity.

- **2026-07-18** — Guest Sly migration is now active: local `/api/tutor/guest-chat` returned 200 with live usage and `enabled: true`, superseding the 2026-07-17 “migration still not applied” status.

- **2026-07-17** — Removed `CurveMascot` from About Founder photo (deleted `CurveMascot.tsx`; founder frame restored to single overflow-hidden stamp div; dropped “Meet Curve…” line).

- **2026-07-17** — Guest Sly live trial code committed to git (panel, API, migration file, legal/docs). **Migration still not applied** on live Supabase `dbjoimidfbftammchnql` — `guest_tutor_usage` missing until `20260717130000_guest_tutor_usage.sql` is run in the SQL editor (or via MCP). Guest sends will 500 until then.

- **2026-07-17** — Homepage guest Sly live trial: “Try Sly for free” opens `GuestSlyPanel`; unsigned visitors get 3 live Gemini messages per hashed IP (`guest_tutor_usage` + `/api/tutor/guest-chat`), then sign-up CTA. Signed-in CTA routes to PMQ course overview. Guest chat text not stored; Privacy/Terms/checklist + LIC-12 demo spec updated. Apply migration `20260717130000_guest_tutor_usage.sql`.

- **2026-07-17** — Header navigation colors made breakpoint-stable: auth Home is orange and Courses is teal on mobile/desktop; Home-page Courses is teal on mobile/desktop. Added reusable teal stamp variants (`stamp-chip`, `SiteHeaderControls`).

- **2026-07-17** — Dark mode is now route-gated: only `/dashboard`, the PMQ course overview, and individual PMQ LO pages may show/use the toggle. All other routes—including Home, auth, Courses and legal pages—are forced light at first paint and after client navigation, ignoring stored/device/Chrome dark preference (`theme-routes`, `ThemeRoutePolicy`, root `layout`, `SiteHeaderControls`, `DarkModeToggle`, `globals.css`).

- **2026-07-17** — Auth header order: Courses (left) then Home icon (right) (`SiteHeaderControls`).

- **2026-07-17** — Auth header chrome: drop Sign in/up CTA; show Home (icon only) + Courses (icon + label) (`SiteHeaderControls` on `/auth/*`).

- **2026-07-17** — Sign-in/sign-up always render in light mode regardless of OS/Chrome dark or stored theme: boot script skips `dark` on `/auth/*`, `AuthForceLightMode` strips/restores the class on enter/leave, auth SaaS dark CSS variants removed (`layout.tsx`, `AuthForceLightMode`, `AuthDeskPanel`, `AuthForm`, `globals.css`).

- **2026-07-17** — Sign-up Terms checkbox moved below the primary CTA, right-aligned above "Already have an account?" (`AuthForm` saas variant).

- **2026-07-17** — Dark mode toggle hidden in the header on `/auth/*` pages (`SiteHeaderControls` skips the `DarkModeToggle` chip when the path starts with `/auth`) to keep auth chrome minimal.

- **2026-07-17** — Auth click spark position (`AuthDeskScene` left 15%, top 81%).

- **2026-07-17** — Reverted auth click-spark fingertip repositioning; restored prior index-finger placement (`AuthDeskScene`, `AuthDeskPanel`, `globals.css`).

- **2026-07-17** — Auth click spark lines thinned (`AuthDeskScene` strokeWidth 2.8 → 1.5).

- **2026-07-17** — Auth click spark moved from the mouse body onto the drawn index finger and its visible phase lengthened so the 2s click reads clearly (`AuthDeskScene`, `globals.css`).

- **2026-07-17** — Auth polish: removed laptop LIC logo and thick desk line above the form card (`AuthDeskScene`, `AuthDeskPanel`).

- **2026-07-17** — Auth polish: retro three-line click spark (no finger overlay / no ripple); desk line is the card’s top edge; Welcome-back/subcopy removed; LIC logo on the laptop lid; form compacted + site footer hidden on `/auth/*` so sign-in fits one screen; sprite exterior re-keyed transparent and monitor/mouse painted white so the page grid reads around the guy (`AuthDeskScene`, `AuthDeskPanel`, `ConditionalSiteFooter`, `scripts/build-auth-scene-assets.mjs`).

- **2026-07-17** — Auth redesign pass 2: removed the overlay finger sprite (odd on the drawn hand); click is now a soft ripple on the existing mouse only. Auth card re-imagined as a Wispr-soft SaaS panel (white, hairline border, soft depth shadow — no ink ticket border / sticker shadow / stamp mono). Form uses `AuthForm variant="saas"` (sentence-case labels, soft inputs, quiet Google/primary buttons). Copy: "Start free." / "Welcome back." (`AuthDeskScene`, `AuthDeskPanel`, `AuthForm`, `globals.css`).

- **2026-07-17** — Auth pages redesigned as a desk-scene ticket panel (modern-SaaS pass, Wispr-Flow-style single centred panel in LIC paper branding): illustrated man sits behind the auth panel with the panel's ink border as his desk, page h1 lives on his monitor screen, and his index finger clicks the mouse every 2s (click-flash strokes; static under reduced motion). Brand SVGs `Sing up man/finger` processed into transparent sprites via `scripts/build-auth-scene-assets.mjs` → `public/brand/auth/`. New `AuthDeskScene.tsx` + `AuthDeskPanel.tsx`; both auth pages rebuilt around them; `AuthForm.tsx` gained the Google logo + branded checkbox; sign-up shows "Free account · No card needed" (`globals.css` auth-finger keyframes).

- **2026-07-17** — Loaded NotebookLM audio overviews for LO18–24 into `public/audio/pmq/lo-18.m4a`…`lo-24.m4a` (from Downloads) and wired `PMQ_LO_AUDIO_OVERVIEWS` for all 24 LOs (`src/lib/pmq/constants.ts`). Source copies archived under `LIC - PMQ in 5days/Notebook LM/LO18`…`LO24`.

- **2026-07-16** — Locked Video/Audio Pro upsell card: “Pro bundle feature” + overview heading center-aligned (`ProMediaLockedPreview.tsx`).

- **2026-07-16** — Loaded NotebookLM audio overviews for LO1–17 into stable public URLs (`public/audio/pmq/lo-01.m4a`…`lo-17.m4a`) and wired `PMQ_LO_AUDIO_OVERVIEWS` to expose them; LO18–24 retain the placeholder (`src/lib/pmq/constants.ts`).

- **2026-07-16** — LO pathway bar icons converted from thin outlines to solid filled glyphs (SF Symbols `.fill` style), same silhouettes; lock pill glyph also filled (`LoStudyPath.tsx`).

- **2026-07-16** — Practise quiz typography: question number, stem, and MCQ option letters all use `font-body` (Figtree); Qn + A–D get slight semibold weight (removed Space Mono stamp on letters) (`QuizRunner.tsx`).

- **2026-07-16** — Quiz set panel unified: `QuizRunner` `embedded` mode drops inner card chrome so the active set reads as one glass panel with the “Quiz set N” header (`QuizRunner.tsx`, `PracticeQuizSection.tsx`).

- **2026-07-16** — Free-tier Practise CTA copy → “Unlock 1000+ questions” (`PracticeQuizSection.tsx`).

- **2026-07-16** — “One try per question…” supporting line moved under “Practice quiz” in the top panel (removed from Quiz set panel) (`PracticeQuizSection.tsx`).

- **2026-07-16** — Practise top panel: unlock/generate CTA sits top-right of the header on desktop; stays full-width below the set rail on mobile (`PracticeQuizSection.tsx`).

- **2026-07-16** — Practise top panel heading shortened to “Practice quiz” (`PracticeQuizSection.tsx`).

- **2026-07-16** — Practise stage split into two floating glass panels: (1) icon + “Practise quizzes and all the sets” + set rail + unlock CTA; (2) “Quiz set N” + XP + quiz runner unchanged (`PracticeQuizSection.tsx`). Free CTA copy → “Unlock the 1,000+ questions”.

- **2026-07-16** — Practise mobile set pills: two equal rows (e.g. 6 → 3+3) instead of a 2-column wrap that made three rows; desktop stays one full row (`PracticeQuizSection.tsx`).

- **2026-07-16** — Practise Check-answer hint copy: “One try, check answer when you’re sure.” (`QuizRunner.tsx`).

- **2026-07-16** — Practise set pills selected state: solid bright teal fill (`bg-teal text-paper`), no teal border accent (`PracticeQuizSection.tsx`).

- **2026-07-16** — Practise set pills selected state switched from orange to teal (`border-teal/45 bg-teal/10 text-teal`) so the stage isn’t all orange/rust (`PracticeQuizSection.tsx`).

- **2026-07-16** — Free-tier “Unlock 1,000+ questions” CTA now black (`bg-ink`, `hover:bg-teal-deep`) with inverted paper Pro pill — matches the dashboard Pro-unlock button language; Pro “Generate set N” stays orange (`PracticeQuizSection.tsx`).

- **2026-07-16** — Free-tier Practise CTA relabelled to “Unlock 1,000+ questions” (`PracticeQuizSection.tsx`). Added legal checklist note to verify the count before public/paid launch because it is a numeric advertising claim.

- **2026-07-16** — LO page course chrome breadcrumb shows “LO N” only (drops the LO title after the middot), e.g. “PMQ in 5 days / Course Overview / LO 5” (`lo/[loNumber]/page.tsx`). Full title remains in the sr-only `h1` for accessibility.

- **2026-07-16** — Course overview sub-header no longer includes the learning objective title name (now “Learning Objective N” only) in free locked/placeholder media (`ProMediaLockedPreview.tsx`, `LoMediaPlaceholder.tsx`).

- **2026-07-16** — Free-tier “Unlock more quiz” CTA drops the arrow icon (Pro “Generate set N” keeps it) to keep the button compact (`PracticeQuizSection.tsx`).

- **2026-07-16** — Practise stage supporting line shortened to “One try per question. Review feedback any time.” (`PracticeQuizSection.tsx`).

- **2026-07-16** — Practise mobile tweaks (desktop unchanged): question nav splits into two equal bars (e.g. 10 → 5+5) with separate cream tracks; XP pill sits top-right of the title row on mobile (`QuizRunner.tsx`, `PracticeQuizSection.tsx`).

- **2026-07-16** — Practise mobile overflow fix: replaced the previous horizontal-scroll mobile treatment with wrapping grids for set pills and question steps; restored quiz-card `overflow-hidden`; moved dropdown menus to a viewport-bound fixed panel on mobile; stacked the XP/CTA area so the Practise section no longer renders wider than the phone viewport (`PracticeQuizSection.tsx`, `QuizRunner.tsx`).

- **2026-07-16** — Practise mobile adaptation: header actions stack into a touch-friendly row, free/pro CTA is 44px high on mobile, set pills and question steps scroll horizontally instead of shrinking, dropdown options use 44px touch rows, and the quiz card no longer clips dropdown panels (`PracticeQuizSection.tsx`, `QuizRunner.tsx`).

- **2026-07-16** — Free-tier Practise CTA relabelled “Unlock more quiz” (was “Generate Quiz”) so the paywall reads honestly before the Stripe redirect — follows the critique’s paywall-honesty finding (`PracticeQuizSection.tsx`).

- **2026-07-16** — Practise quiz harden/clarify/polish (critique P0): MCQ + dropdown select first, then explicit **Check answer** before one-shot lock; copy at decision point (“One try — check when you’re sure”) + stage line updated; feedback no longer clipped; hollow spacer removed (`QuizRunner.tsx`, `PracticeQuizSection.tsx`).

- **2026-07-16** — LO pathway Pro lock pills (video/audio): black (`bg-ink`) with paper text so they read as hard locks (`LoStudyPath.tsx`).

- **2026-07-16** — LO pathway bar header: “Learning Objective N” + title on one truncated line (shorter, minimal chrome) (`LoStudyPath.tsx`).

- **2026-07-16** — Dropdown quiz blanks: replaced native `<select>` with branded paper listbox (card border/shadow, cream hover, orange selected) matching MCQ/question-card language; olive/rust submit states unchanged (`QuizRunner.tsx`).

- **2026-07-16** — Quiz Q-nav shows right/wrong: olive = correct, rust = incorrect (soft fill + status pip); current answered keeps orange focus ring. Header tally shows correct · wrong counts (`QuizRunner.tsx`).

- **2026-07-16** — Quiz question nav restyled as modern SaaS segmented control: cream toolbar with “Question N / total” + answered count; soft track (`bg-ink/6`) with equal steps — current orange, done olive on paper, locked muted (`QuizRunner.tsx`).

- **2026-07-16** — Practise set rail: compact h-7 pills + Generate CTA (`flex-nowrap`) so Set pills and Generate stay on one row (`PracticeQuizSection.tsx`).

- **2026-07-16** — Practise layout: Generate Quiz / Generate set N sits on the same row as set pills (band removed); free keeps Pro lock pill. Question card is flat `bg-paper` (no teal→cream gradient); Q1…Qn nav is a full-bleed equal-column strip across the card top (`PracticeQuizSection.tsx`, `QuizRunner.tsx`).

- **2026-07-16** — Practise UX polish: locked set pills are non-interactive (`span`, no click); unlocked pills navigate for review only. Generate Quiz moved into a ticket-style band (spark kicker, set count, price hint) with free-tier **Generate Quiz** stamp CTA + Pro lock pill on the right → Stripe (`PracticeQuizSection.tsx`).

- **2026-07-16** — Free Practise set rail: `getPmqPracticeSetCount` now uses service-role (+ JSON max) so locked Set 2…N pills show for free users too (was under-counting when RLS hid paid rows). Free CTA is stamp “Generate Quiz” (not “More sets” + Pro); Generate / locked-pill clicks go straight to Stripe checkout via `createAiTutorCheckout` (`PracticeQuizSection.tsx`, `queries.ts`).

- **2026-07-16** — Practise stage header now mirrors the other LO stages: same 14/16px art frame (`ArtPlaceholder`) with a quiz-sheet icon, eyebrow at `ink/70`, and a one-line supporting description ("One attempt per question — review your answers and feedback any time"), matching the Orient/Learn/Apply/Checkpoint `PanelHeader` pattern (`PracticeQuizSection.tsx`).

- **2026-07-16** — Practise stage clarify + distill: one Orient-matched glass panel; title = active “Quiz set N”; short Set tabs; homepage XP pill + Generate in header; nested workspace chrome removed; copy tightened (`PracticeQuizSection.tsx`, `QuizRunner.tsx`).

- **2026-07-16** — Practise stage simplification: homepage-style XP pill restored; generate action moved into the Practise header; duplicate “ready to generate” strip removed; feedback returned to simple teal text; Q labels now sit inline with the question (`PracticeQuizSection.tsx`, `QuizRunner.tsx`).

- **2026-07-16** — Practise stage redesign: workspace shell with set rail (“Quiz set N”), XP/progress header, inset runner; questions labelled Q1…Qn; review logic unchanged (`PracticeQuizSection.tsx`, `QuizRunner.tsx`).

- **2026-07-16** — Practise quiz UI: numbered selectable progress chips (not thin bars); dropped Scenario / external-id headers — only “Question N” + prompt (`QuizRunner.tsx`).

- **2026-07-16** — Practise quiz review: Previous + clickable progress bars to revisit answered questions with locked selection + feedback; session attempts cached so remount stays read-only (`QuizRunner.tsx`).

- **2026-07-16** — LIC-59: Practise section is count-driven — `totalSets` from DB per LO (not hardcoded 3); `getQuizSet` accepts set 2+; prior attempts / XP / Sly mistakes cover `quiz_set_N` (`PracticeQuizSection.tsx`, `quiz-sets.ts`, `queries.ts`, `actions.ts`, `LoStudyJourney.tsx`, LO page).

- **2026-07-16** — Header: removed “Project Management & AI” tagline under the wordmark (`SiteHeader.tsx`, `DESIGN.md`).

- **2026-07-16** — Header tagline typeset: Figtree medium sentence-case under Fraunces wordmark (dropped Space Mono uppercase stamp) (`SiteHeader.tsx`, `DESIGN.md`).

- **2026-07-16** — Header brand lockup: stamp tagline “Project Management & AI” under the wordmark (`SiteHeader.tsx`, `DESIGN.md`).

- **2026-07-16** — Mobile header: keep labeled **Courses** (browse prompt); Sign up/in stays icon-only below `sm` so wordmark fits (`SiteHeaderControls.tsx`, `DESIGN.md`).

- **2026-07-16** — Mobile header: guest Courses / Sign in|up stamps are icon-only below `sm` so “Learn in Curve” stays visible; labels return from `sm` up; slightly smaller logo on narrow (`SiteHeader.tsx`, `SiteHeaderControls.tsx`, `DESIGN.md`).

- **2026-07-16** — Meet Sly console: disabled user scroll on chat body (`overflow-hidden` instead of `overflow-y-auto` in `SlyMacConsole.tsx`); demo still auto-advances to latest message.

- **2026-07-16** — Hero: removed boarding-pass cohort card; kept single Start free CTA under copy; dropped duplicate `CtaArrow` (PmqStartLink already adds one); deleted `HeroCohortCard.tsx` (`page.tsx`, `DESIGN.md`).

- **2026-07-16** — Homepage audit fixes: boarding-pass meta `ink/70` + title demoted from h2; Start free restored under hero copy; hero entrance no longer opacity-gated; notify `backdrop-blur-md` + denser paper; dynamic import SlyShowcase/QuizDemo; mobile pass max-width; tokenized shadows; DESIGN.md synced (`page.tsx`, `HeroCohortCard.tsx`, `NotifyBand.tsx`, `SlyShowcase.tsx`, `globals.css`).

- **2026-07-16** — Homepage polish: longer boarding-pass (max ~26rem) is the only Start free with PMQ CTA; removed hero text CTA; Meet Sly swaps to console left / copy right (`page.tsx`, `HeroCohortCard.tsx`, `SlyShowcase.tsx`).

- **2026-07-16** — Hero cohort card: boarding-pass form restored (coupon + perforation + stub) with lean copy and soft shadow — no heavy sticker shadow or dense blurb (`HeroCohortCard.tsx`).

- **2026-07-16** — Hero cohort card restage: modern paper/glass panel (thin border, soft shadow, no rotate/stub/barcode); less copy — Open + PMQ · 5 days + headline + CTA (`HeroCohortCard.tsx`).

- **2026-07-16** — Hero cohort card: removed flight video/animation strip; static boarding-pass only (`HeroCohortCard.tsx`).

- **2026-07-16** — Hero cohort flight strip: switched to paper-matched `cohort-plane-2.mp4` (inspo “cohort plane 2”); dropped mix-blend; slim full-bleed strip + soft paper fade; IO play/pause (`HeroCohortCard.tsx`).

- **2026-07-16** — Hero cohort card: replaced SVG/Framer takeoff with small top-of-card looping video from inspo (`cohort-plane.mp4` ← Flat vector illustration.mp4); `mix-blend-multiply` for solid plate; reduced-motion pauses (`HeroCohortCard.tsx`).

- **2026-07-16** — Hero cohort plane: `mix-blend-multiply` knocks out baked white in inspo SVG; takeoff slowed to ~4.4s with longer pause between loops (`HeroCohortCard.tsx`).

- **2026-07-16** — Homepage hero cohort card restaged as subtle boarding pass (perforation + stub + barcode); tiny takeoff of `hero plane.svg` clipped inside the card; “Start free with PMQ” stamp CTA duplicated in-card (`HeroCohortCard.tsx`, `page.tsx`).

- **2026-07-16** — Homepage hero: added right-side `HeroCohortCard` (“Now onboarding the PMQ cohort”) — paper/glass status card with live olive pill, scroll-tipped ticket stamp (mailbox motion), Join link (`HeroCohortCard.tsx`, `page.tsx`).

- **2026-07-16** — Footer LED: top/edge dots inset so they’re full circles (not clipped); snappier motion (2.4s scenes, 220ms fades, 60fps desktop, earlier IO start) (`FooterLedGrid.tsx`).

- **2026-07-16** — Footer LED: removed solid ink scrim under ©/version (was reading as a brown band); text stays overlaid with ink text-shadow for contrast (`FooterLedGrid.tsx`).

- **2026-07-16** — Footer LED: dots span full band edge-to-edge (flush to page bottom); © + version stay overlaid (`FooterLedGrid.tsx`).

- **2026-07-16** — Footer audit fixes: `<nav aria-label="Footer">` + stamp labels as `<p>` (not h4); logo `alt=""` beside wordmark; 44×44 social chips + `min-h-11` links; LED fewer cells / 24fps on small viewports, CSS token colors, ink scrim + `cream/80` for © contrast (`SiteFooter.tsx`, `FooterLedGrid.tsx`, `Logo.tsx`, `globals.css` `--orange-rgb`).

- **2026-07-16** — Courses cards: orange duration in titles — PMQ “5 days”, PFQ “2 days” (`CourseTicket.tsx`).

- **2026-07-16** — Courses catalog: equal-width two-column cards again; keep `items-start` so PFQ doesn’t stretch when PMQ Optional Pro expands (`CoursesCatalog.tsx`).

- **2026-07-16** — Courses catalog: “Optional Pro Bundle” label; PMQ CTA “Start learning for free”; PFQ coming-soon card narrower + `items-start` so it no longer stretches when PMQ Optional Pro expands (`CourseTicket.tsx`, `CoursesCatalog.tsx`).

- **2026-07-16** — Courses page Optional Pro CTA: matched dashboard purchase button (`Get Pro bundle · £X`, fox leading, full-width ink stamp) in `CourseTicket.tsx` via same `AiTutorUpgradeCta` props as `DashboardPmqCourseCard`.

- **2026-07-16** — Notify band mailbox tip: trigger delayed so the flag tips once the band is well into mid-viewport (`NotifyBand.tsx` `useScroll` offsets + deliver threshold).

- **2026-07-16** — Footer: © all-rights line bottom-left and version bottom-right inside the LED grid band; removed from brand column (`FooterLedGrid.tsx`, `SiteFooter.tsx`).

- **2026-07-16** — Reverted hero plane takeoff animation (removed `HeroPlaneTakeoff` / `hero-plane-takeoff.svg`; hero is copy-only again).

- **2026-07-16** — Footer: © + version tucked into brand column as one compact stamp line (no separate strip); tighter padding before LED (`SiteFooter.tsx`).

- **2026-07-16** — Footer: full-bleed ink (`bg-ink`) for links + copyright + LED grid as one continuous brown band (`SiteFooter.tsx`).

- **2026-07-16** — Footer: dropped glass card shell for full-bleed cream layout; copyright + version compacted into the ink LED strip above the grid (`SiteFooter.tsx`).

- **2026-07-16** — Site footer restaged to modern paper brand: glass paper panel (header/notify language), stamp social chips, teal stamp column labels, orange link hover; all copy kept; LED study-scene band unchanged on ink strip at bottom (`SiteFooter.tsx`).

- **2026-07-16** — Footer LED: removed “Learn” word; wider denser grid; cycles three study scenes (open book, desk lamp, coffee + notes) with orange flicker (`FooterLedGrid.tsx`).

- **2026-07-16** — Footer LED: orange dots spell “Learn” along a curved baseline; removed solid `pb` band so the dotted grid is the last section of the page (`FooterLedGrid.tsx`, `SiteFooter.tsx`).

- **2026-07-16** — Site footer: formula-footer LED band under copyright — canvas starburst pulse in brand orange `#D5501F` on ink (`FooterLedGrid.tsx`, `SiteFooter.tsx`); reduced-motion + off-screen pause; inspo reference copied to `public/brand/inspo/formula-footer.mp4`.

- **2026-07-16** — Notify band adapt+polish: mobile/tablet stack until `lg` (avoids cramped side-by-side); subjects line wraps on small screens, one line on `lg`; hairline divider + stronger ink contrast; mailbox tokens aligned to brand hex; form input 16px + 48px touch targets + focus ring offset (`NotifyBand.tsx`, `NewsletterSignup.tsx`).

- **2026-07-16** — Notify band: subjects line moved to the bottom of the glass panel (`NotifyBand.tsx`).

- **2026-07-16** — Notify band: larger mailbox; subhead stays one line (“Project management and AI”); orange “Curve” brand treatment (`NotifyBand.tsx`).

- **2026-07-16** — Notify band: removed plane + trail; mailbox tip animation lives inside the glass banner; copy → “Be first to know when new courses drop.” + subjects subhead (`NotifyBand.tsx`); deleted `HomeMailFlight.tsx`.

- **2026-07-16** — Notify mail flight polish: flight lane above the glass banner (not over it); thin closely-packed dashed teal trail that draws then reduces with the plane; inline paper-airplane SVG; cleaner L→R motion (`HomeMailFlight.tsx`).

- **2026-07-16** — Notify mail flight scoped to the notify row only: plane starts left of the glass banner and flies horizontally into the right-hand mailbox (no site-wide path) (`HomeMailFlight.tsx` → `NotifyMailDelivery`, `(site)/page.tsx`).

- **2026-07-16** — Homepage scroll mail delivery: Framer Motion `useScroll`/`useTransform` paper-plane flight from hero → notify mailbox (`HomeMailFlight.tsx`), teal trail `pathLength`, plane fade + mailbox flag tip on arrival; `prefers-reduced-motion` disables flight (`(site)/page.tsx`, assets `/brand/inspo/paper-airplane.svg` + `mailbox.svg`).

- **2026-07-16** — Homepage Get Notified: restyled to match floating glass site header (`border-ink/12`, `bg-paper/75`, `backdrop-blur-xl`, soft diffuse shadow); headline left / signup right like nav brand + controls (`NotifyBand.tsx`, `NewsletterSignup.tsx`).

- **2026-07-16** — Homepage Get Notified: paper panel + thin orange top rule + sticker shadow so the quiet signup lifts off dotted cream (`NotifyBand.tsx`); cream input inside paper for depth.

- **2026-07-16** — Homepage Get Notified: stripped illustration/floating stamps; quiet centered type + email/stamp CTA on cream paper (Apple-simple SaaS, LIC brand) (`NotifyBand.tsx`, `NewsletterSignup.tsx`, `globals.css`).

- **2026-07-16** — Homepage Get Notified: redesigned as illustrated paper ticket (`NotifyBand.tsx`) — teal-deep street art rail, floating Live/Soon stamps + envelope bob, dense paper signup with `stampCtaPrimary`; replaced rust text slab. Honest mailto waitlist kept (`NewsletterSignup` `notify` variant, `(site)/page.tsx`, `globals.css`).

- **2026-07-16** — Landing layout: tightened stacked section padding (hero / Meet Sly / quiz / notify) so adjacent `py-16`–`py-24` voids no longer leave large empty gaps (`(site)/page.tsx`, `SlyShowcase.tsx`).

- **2026-07-16** — Checkpoint stage: removed sealed-state helper copy (“This learning objective is sealed…”) (`LoCheckpointStage.tsx`).

- **2026-07-16** — Checkpoint LO nav buttons show number + title again (e.g. `LO2: Life cycles →`) on stamp chips (`PmqCourseHeader.tsx` LoNav).

- **2026-07-16** — Checkpoint stage buttons modernised to stamp CTA language (same as Continue / header chips): Mark complete uses `stampCtaPrimary`, done/disabled olive/paper stamps, LO prev/next nav uses labeled stamp chips (`LoCompleteButton.tsx`, `PmqCourseHeader.tsx` LoNav, `QaCompleteButton.tsx`).

- **2026-07-16** — AI tutor composer footer modernised to match slim header density: stronger frosted paper blur kept, flatter input well, quieter disclaimer, smaller send control (`AiTutorPanel.tsx`, `globals.css`).

- **2026-07-16** — Sly chat bubbles: removed backdrop-blur glass (caused flickering corner rectangles over wallpaper); opaque orange/paper fills kept (`globals.css`).

- **2026-07-16** — AI tutor panel locks page scroll while open (body/html overflow hidden + iOS fixed-position restore) (`AiTutorPanel.tsx`).

- **2026-07-16** — AI tutor header flicker fix: solid teal chrome (dropped backdrop-blur over wallpaper), fair-usage state no longer cleared to null on soft updates, header metre paints without width entrance animation (`globals.css`, `AiTutorPanel.tsx`, `SlyUsageMeter.tsx`).

- **2026-07-16** — LO Video overview notes: Accessibility + About this overview share one right-aligned row; expanded copy is full-width justified. Audio About toggle also right-aligned (`LoVideoOverviewNotes.tsx`, `AiMediaOverviewDisclaimer.tsx`, `LoExplainerVideo.tsx`).

- **2026-07-16** — LO Video/Audio Accessibility + About this overview: dropped bordered cream boxes for plain muted text toggles; removed em dashes from copy (`LoExplainerVideo.tsx`, `AiMediaOverviewDisclaimer.tsx`).

- **2026-07-16** — LO Video/Audio overview stages: subtle expandable “About this overview” disclaimer (NotebookLM AI-generated; may have inaccuracies) with Send feedback (`AiMediaOverviewDisclaimer.tsx`, `LoExplainerVideo.tsx`, `LoExplainerAudio.tsx`).

- **2026-07-16** — Dashboard PMQ course card mobile fix: flex column card with integrated Pro footer (`mt-auto`), stacked meta row on narrow screens, responsive fair-usage metre layout; Pro users always get usage data (fallback summary if fetch fails); repaired broken `SlyTopUpDialog` mount (`DashboardPmqCourseCard.tsx`, `SlyUsageMeter.tsx`, `dashboard/page.tsx`).

- **2026-07-16** — AI tutor header: “Your AI Tutor” subtitle, frosted teal glass (`.sly-panel-header`), usage bar always shows `% left` with taller orange track (`AiTutorPanel.tsx`, `SlyUsageMeter.tsx`, `globals.css`).

- **2026-07-16** — Sly chat bubbles: light frosted glass (backdrop blur, semi-transparent fills, inset highlight) on user orange + assistant paper bubbles over the wallpaper thread (`globals.css`, `AiTutorPanel.tsx`).

- **2026-07-16** — AI tutor panel header: teal-deep single-row toolbar retained; usage whisper bar bumped to `h-1` with orange fill on paper track (`AiTutorPanel.tsx`, `SlyUsageMeter.tsx`).

- **2026-07-16** — AI tutor panel header slimmed to a single-row paper SaaS toolbar (28px avatar, body-type title, inline whisper usage bar); teal block + stacked metre row removed (`AiTutorPanel.tsx`, `SlyUsageMeter.tsx`).

- **2026-07-16** — Sly fair-usage metre moved into the AI tutor panel header (compact `h-1` bar, no top-up button in-panel); dashboard card metre unchanged (`SlyUsageMeter.tsx`, `AiTutorPanel.tsx`).

- **2026-07-16** — Reverted Sly AI tutor panel modernisation pass (glass thread, softer shell/composer, compact strip restyle); launcher teal + other session changes kept (`AiTutorPanel.tsx`, `SlyUnlockInvite.tsx`, `globals.css`).

- **2026-07-16** — AI tutor launcher button: removed Pro/lock pill entirely and updated the launcher to a full teal background with paper text so it stands out more (`AiTutorPanel.tsx`).

- **2026-07-16** — Disabled demo/auth-skip flag (`src/lib/demo.ts`), removing the “Demo mode - sign-in skipped” banner and preventing anonymous quiz/gamification short-circuits on mobile. 

- **2026-07-16** — Sly launcher restyle: frosted glass paper (matches dashboard/LO panels), inset from edge, softer ambient shadow; pay-urge glow animation updated off sticker shadow (`AiTutorPanel.tsx`, `globals.css`).

- **2026-07-16** — Free-tier Sly launcher: same label as Pro (`Sly · your AI tutor`); lock + Pro pill badge on mobile FAB and desktop tab instead of “Sly · unlock” (`AiTutorPanel.tsx`).

- **2026-07-16** — Dashboard PMQ course card: frosted glass surface (thin border, backdrop blur) with softer ambient shadow; sticker offset shadow removed. CTA/Pro button shadows stepped down to 1px. Layout unchanged (`DashboardPmqCourseCard.tsx`).

- **2026-07-16** — LO Video stage a11y/perf pass (LO17 audit harden/optimize/adapt/clarify/polish): posters for all 24 LOs (`public/videos/pmq/posters/`); free lock uses JPEG only (no MP4); StagePanel stage titles are `h3` under pathway `h2`; LO-specific Video/Audio panel titles; poster + optional captions track + Accessibility disclosure with jump-to-Learn; Pro sheet solid paper (less nested glass); What’s included min-h-11; `motion-safe` blur. Timed VTT still pending (`captionsSrc: null`). Files: `LoExplainerVideo.tsx`, `ProMediaLockedPreview.tsx`, `constants.ts`, `LoStudyJourney.tsx`.

- **2026-07-16** — Course sub-header breadcrumb: “Overview” → “Course Overview”; course name (e.g. PMQ in 5 Days) is plain text, not a link (`PmqCourseHeader.tsx`).

- **2026-07-16** — All 24 LOs share LO1 pathway (Orient→…→Checkpoint always). Copied Notebook LM videos → `public/videos/pmq/lo-01…24.mp4` and wired `PMQ_LO_EXPLAINER_VIDEOS`. Audio stage always present; LO1 plays existing m4a, LOs 2–24 show `LoMediaPlaceholder` until `/audio/pmq/lo-NN.m4a` files land (`constants.ts`, `lo-stages.ts`, `LoStudyJourney.tsx`).

- **2026-07-16** — Course sub-header (`PmqCourseHeader`) no longer sticky; scrolls with the page like the pathway bar.

- **2026-07-16** — Pathway bar no longer sticky; scrolls with the page. Course strip sticky again on LO pages (`LoStudyPath.tsx`, `lo/[loNumber]/page.tsx`).

- **2026-07-16** — Practise XP pill moved to the Practise glass panel (sums across sets 1–3 on that LO, +10 per correct). Course sub-header / overview XP = correct practise answers × 10 across all 24 LOs (`getPractiseQuizXp`, `PracticeQuizSection`, LO + overview + mock pages).

- **2026-07-16** — Practise quiz one-shot: once a question is attempted it stays locked (review only). Server rejects duplicate `submitQuizAttempt`; UI hydrates from `getLoQuizPriorAttempts` (`actions.ts`, `queries.ts`, `QuizRunner.tsx`, LO page).

- **2026-07-16** — Checkpoint stage restyle: Orient-matched glass panel (stamp eyebrow “Lock it in”, art placeholder); recap removed; checklist + seal CTA + LO nav only (`LoCheckpointStage.tsx`, `LoStudyJourney.tsx`).

- **2026-07-16** — Fix Practise→Checkpoint yank: answering a quiz option called `router.refresh()`, which re-ran the sealed effect and always forced `currentId` to checkpoint. Now only auto-jumps when the LO newly seals (`LoStudyJourney.tsx`).

- **2026-07-16** — Practise stage restyle: one glass panel (Orient-matched) + homepage Try-a-question card (`QuizRunner` one-Q-at-a-time, progress segments, gold XP). Free: set 1 open; Generate quiz locked with lock+Pro pill (+ compact upsell). Pro: Generate unlocks set 2 then set 3 (`PracticeQuizSection.tsx`, `QuizRunner.tsx`).

- **2026-07-16** — Removed auto-scroll-to-pathway on stage change (`scrollStageIntoView` in `LoStudyJourney.tsx`); pathway/Continue no longer snaps page top under the sticky bar.

- **2026-07-16** — Apply stage restyle to match Orient/Learn: three glass panels (worked example / misconceptions / memory aids) with stamp eyebrows + placeholder art; wired via `LoApplyStage.tsx` in `LoStudyJourney.tsx`. Softened memory-aid tiles (no sticker shadow nested in glass).

- **2026-07-16** — Locked media/path microfixes: “Pro bundle feature” → orange; pathway Pro pill top-right on stage icon; What’s included expands below the media window (not inside the player overlay) (`ProMediaLockedPreview.tsx`, `LoStudyPath.tsx`).

- **2026-07-16** — Locked media/pro path polish: overlay eyebrow → “Pro bundle feature”; LO-specific watch/listen heading; What’s included toggle (dashboard list); stage headers get Orient-style art + eyebrow for Video/Audio; pathway keeps video/audio icons with small “Pro” lock pill (`ProMediaLockedPreview.tsx`, `LoStudyJourney.tsx`, `LoStudyPath.tsx`).

- **2026-07-16** — Free-tier Video/Audio stages: show real media chrome (blurred, non-playable) with quiet frost overlay + Pro CTA matching dashboard course-card (`Get Pro bundle · £…` + fox chip). Replaces dashed `LockedFeature` shell (`ProMediaLockedPreview.tsx`, `LoStudyJourney.tsx`).

- **2026-07-16** — Pathway navigation gated: forward only via Continue; pathway clicks revisit reached stages only (`doneIds` + current). Removed orange hairline fill; completed stages keep stage icons on orange wash (progress-bar feel, no ticks). Course completion % still LO-seal based (`LoStudyPath.tsx`, `LoStudyJourney.tsx`).

- **2026-07-16** — LO pathway reimagine (Apple-on-brand): liquid-glass sheet (`rounded-[22px]`, heavy blur, inset highlight); Figtree title + “n of N” meta; iOS segmented control rail with sliding paper selection pill; soft orange current node + thin progress hairline; stamp uppercase dropped (`LoStudyPath.tsx`, `globals.css`). Still sticky on LO pages.

- **2026-07-16** — Fixed stage Continue UX: scroll pathway/stage into view on `currentId` change (was advancing while viewport stayed at previous stage bottom); Continue clears Sly FAB on mobile (`pr-[4.5rem]`) (`LoStudyJourney.tsx`).

- **2026-07-16** — Learn polish: centre diagram captions; core chips show outcome codes (`1a`/`1b`) with title only (no duplicate); stage Continue CTA attached to bottom of every stage (Orient/Learn/Practise wrappers + StagePanel footer) (`CoreContentBlock.tsx`, `LoLearnStage.tsx`, `LoStudyJourney.tsx`).

- **2026-07-16** — Learn diagram figure distilled: removed “Diagram” stamp label and double nested frames — single rounded bordered image + caption only (`CoreContentBlock.tsx`).

- **2026-07-16** — LO Learn audit fix-all (`adapt`/`distill`/`optimize`/`harden`/`polish`): demote core markdown headings to `h4`/`h5` under outcome `h3`; bump stamp labels to `ink/70` (≥AA); sand/ink index chips; flatten nested cream cards to divide-y lists; `next/image` diagrams; silent art placeholders + table `<caption>` (`LoLearnStage.tsx`, `DefinitionsTable.tsx`, `CoreContentBlock.tsx`).

- **2026-07-16** — LO sticky chrome swap: pathway bar sticks (`LoStudyPath` `sticky top-0`); course strip scrolls away on LO pages only (`PmqCourseHeader sticky={false}` in `lo/[loNumber]/page.tsx`). Overview/mock keep sticky course header.

- **2026-07-16** — Learn core content polish: diagram figures restyled to soft glass/cream frames (stamp “Diagram” label + display caption); markdown h2/h3 match Learn title weight; strip duplicate leading codes (`1a.` / `1b)` / `2.1`) from subheadings on display only so orange chips aren’t doubled (`CoreContentBlock.tsx`).

- **2026-07-16** — Learn stage restyle to match Orient: new `LoLearnStage.tsx` (two glass panels — Key definitions + Core content; stamp eyebrows; orange number chips; SVG art placeholders); `DefinitionsTable` cream-row craft; wired in `LoStudyJourney.tsx`. Nano Banana briefs in `docs/LO_LEARN_ILLUSTRATION_BRIEFS.md`.

- **2026-07-16** — LO pathway bar craft: `LoStudyPath` rebuilt as journey-map stations on a soft path rail (icon nodes + short labels, olive done / orange current pulse / lock glyph for Pro); path fill tracks current stage; active station scrolls into view; CSS in `globals.css` (`lo-path-pulse`, `.lo-path-fill`) with `prefers-reduced-motion` fallbacks. Props API unchanged; bar still not sticky.

- **2026-07-16** — Free tier: LO Video + Audio stages locked behind Pro (`hasEntitlement`); media players not rendered when locked; pathway pills show lock state; unlock via `AiTutorUpgradeCta` / `LockedFeature` (`LoStudyJourney.tsx`, `LoStudyPath.tsx`). Matches Pro included “Video + audio per LO”.

- **2026-07-15** — LO mobile width align: context copy fills panel (`max-w-[55ch]` removed); pathway lost bleed `-mx`; LO main uses same `max-w-wrap` + `px-3`/`sm:px-5` as floating SiteHeader/course chrome (`LoOrientStage.tsx`, `LoStudyPath.tsx`, `lo/[loNumber]/page.tsx`, `LoStudyJourney.tsx`).

- **2026-07-15** — Orient polish: drop inner “Orient” title; smaller art (56–64px); outcomes art → `lo-orient-outcomes-2.jpg`; all orange number chips (no alternating colours); Context + Outcomes as separate glass panels; panel + row settle motion (`LoOrientStage.tsx`).

- **2026-07-15** — Orient restyle (mobile-first): About-style stamp art frames + stamp outcome rows; Udemy-inspired inspo art at `lo-orient-context.jpg` / `lo-orient-outcomes.jpg`; all Orient copy kept (`LoOrientStage.tsx`, `LoStudyJourney.tsx`, `docs/LO_ORIENT_ILLUSTRATION_BRIEFS.md`).

- **2026-07-15** — LO pathway bar: not sticky — scrolls with the page (`LoStudyPath.tsx`).

- **2026-07-15** — LO page: drop duplicate LO badge / Day label / APM blurb / “complete — review anytime” banner; sticky pathway bar carries title (`lo/[loNumber]/page.tsx`, `LoStudyJourney.tsx`).

- **2026-07-15** — LO study pathway redesign (LO1 media wired; shell applies to all LOs): Orient → Learn → Video → Audio → Apply (worked example / misconceptions / memory aids) → Practise (quiz only) → Checkpoint (recap + checklist + Mark complete + prev/next). Glass sticky path with LO title + step pills; LO1 video `Mastering_Life_Cycles.mp4` + audio `Linear_Iterative_and_Hybrid_Life_Cycles.m4a` from Notebook LM → `public/videos|audio/pmq/` (`lo-stages.ts`, `LoStudyJourney.tsx`, `LoStudyPath.tsx`, `LoExplainerAudio.tsx`, `constants.ts`, LO page).

- **2026-07-15** — Overview: remove mobile Continue FAB (bottom-left); Continue / Lite mock stays in the resume card on all breakpoints (`PmqOverview.tsx`).

- **2026-07-15** — Mobile Sly launcher: full-width bottom bar → round FAB bottom-right (`AiTutorPanel.tsx`). Overview Continue companion FAB bottom-left so the two don’t collide (`PmqOverview.tsx`).

- **2026-07-15** — PMQ course sub-header: remove full-bleed cream gradient blur strip so only the centered glass pill shows (`PmqCourseHeader.tsx`).

- **2026-07-15** — Course overview glass SaaS redesign (mobile-first): courses `SiteHeader` floats but scrolls away (`pinned={false}`); sticky frosted `PmqCourseHeader` at viewport top; resume/day accordion/mocks/command words/reading use shared `glass` panels + stamp CTAs; snappy accordion + settle motion (`SiteHeader.tsx`, `courses/layout.tsx`, `PmqCourseHeader.tsx`, `PmqOverview.tsx`, `PmqDayPlan.tsx`, `PmqMockExamsSection.tsx`, `PmqOverviewSections.tsx`, `ui/glass.ts`, `globals.css`).

- **2026-07-15** — Course overview shape (confirmed): keep floating `SiteHeader`; sticky cream course strip under it (`top` matches header spacer); overview polish — stamp resume + section headings, SaaS rhythm / 70s ticket vibe (`PmqCourseHeader.tsx`, `PmqOverview.tsx`, day `scroll-mt`).

- **2026-07-15** — PMQ overview: drop glass/blur for solid paper stamps; cut teal in favor of orange/gold/olive/ink; restore ink borders + sticker shadows on study strip, resume, days, mocks, command words (`PmqCourseHeader.tsx`, `PmqOverview.tsx`, `PmqDayPlan.tsx`, `PmqMockExamsSection.tsx`, `PmqOverviewSections.tsx`).

- **2026-07-15** — PMQ overview colorize + mobile-first: orange/teal/olive accents on resume, day chips, mocks, reading rails; mobile sticky Continue/Mock CTA, stacked command-word cards (no table scroll), larger touch targets, study strip tint (`PmqOverview.tsx`, `PmqDayPlan.tsx`, `PmqMockExamsSection.tsx`, `PmqOverviewSections.tsx`, `PmqCourseHeader.tsx`).

- **2026-07-15** — PMQ course overview restage: removed FAQs from overview; soft SaaS panels on wrap (resume CTA, day accordion, mocks, command words, further reading) aligned with home/courses/about paper language + mobile-friendly stacking (`PmqOverview.tsx`, `PmqDayPlan.tsx`, `PmqMockExamsSection.tsx`, `PmqOverviewSections.tsx`). Preview page still mounts `PmqFaqSection`.

- **2026-07-15** — PMQ study strip restyled as soft inset panel matching floating `SiteHeader` (same max-w-wrap / rounded-2xl / thin border / blur); single-line SaaS breadcrumbs + quiet XP pills (`PmqCourseHeader.tsx`, `XpStreakBar.tsx`).

- **2026-07-15** — PMQ study chrome: restore floating `SiteHeader` on overview + LO (removed pathname null-out); `PmqCourseHeader` is now an in-page study strip (Now studying / crumbs / XP·streak·% done) instead of a second site header (`SiteHeader.tsx`, `PmqCourseHeader.tsx`, overview + LO pages).

- **2026-07-15** — Courses catalogue card restage: free-first "PMQ in **5 days**" (orange), Lite sell points from FEATURES.md, soft SaaS elevation (no sticker shadow), Pro nested in collapsed `<details>` + `PMQ_PRO_SELL_POINTS` / updated `PRO_INCLUDED` (`CourseTicket.tsx`, `pro-included.ts`, `courses-catalog.ts`).

- **2026-07-15** — Header: hide Dashboard stamp while already on `/dashboard` (`SiteHeaderControls.tsx`).

- **2026-07-15** — Header nav swap: Courses only on landing (`/`); Home on every other page (careers, about, courses, auth, etc.) — was limited to `/courses*` before (`SiteHeaderControls.tsx`).

- **2026-07-15** — Quiz demo card surface: opaque teal-wash gradient + soft elevation shadow so body dot grid does not show through (`QuizDemo.tsx`).

- **2026-07-15** — Quiz demo layout stability: pre-reserved feedback + CTA footer height so selecting an answer no longer shifts the Get Notified section below (`QuizDemo.tsx`).

- **2026-07-15** — Quiz demo CTA label: "Next" → "Next question" on the practice card (`QuizDemo.tsx`).

- **2026-07-15** — Landing quiz layout tweak: question card left, copy right; removed tri-color top rail from practice card (`QuizDemo.tsx`).

- **2026-07-15** — Landing quiz copy + card restyle: Practice Questions / Give it a try + feature bullets; sleek teal-tinted card with gold XP pill, teal progress track (`QuizDemo.tsx`).

- **2026-07-15** — Landing CTAs: shared `CtaArrow` on hero / Meet Sly (`PmqStartLink`), quiz Next + Enrol, and Notify me (`stamp-chip.ts`, `QuizDemo.tsx`, `NewsletterSignup.tsx`).

- **2026-07-15** — Reverted landing quiz bolder pass; restored snappy SaaS Try-a-question card (soft elevation, short copy, Enrol to PMQ for free) (`QuizDemo.tsx`, `(site)/page.tsx`).

- **2026-07-15** — Landing “Try a question”: removed diner/tail scene; two-col SaaS layout (short copy + card); thinner border / soft elevation (no heavy sticker shadow); snappier 150–200ms option feedback; post-quiz CTA → **Enrol to PMQ for free**; cut section + card copy (`QuizDemo.tsx`, `(site)/page.tsx`).

- **2026-07-15** — Header nav: Courses↔Home swap in one slot — show **Courses** on landing (and non-courses routes); show **Home** on `/courses` (no both) (`SiteHeaderControls.tsx`).

- **2026-07-15** — `/courses` catalogue: removed van illustration + sand gradients; continuous dotted cream paper from body `--dot-grid` (layout no longer paints solid `bg-cream` over it). Hero is type + tickets only (`courses/page.tsx`, `courses/layout.tsx`).

- **2026-07-15** — Landing hero copy: forced lines so row 2 reads “your ticket out,”; fixed clipped “y” descender (looser leading, phrase padding, clip-path bottom inset, `overflow-x-clip` instead of `overflow-hidden`) (`(site)/page.tsx`, `globals.css`).

- **2026-07-15** — Landing hero motion: signature entrance — blur→sharp staggered copy (`hero-enter`), boarding-pass clip wipe on “your ticket out” (`hero-ticket-phrase`), stamp CTA press-in (`hero-stamp-cta`); all respect `prefers-reduced-motion` (`globals.css`, `(site)/page.tsx`).

- **2026-07-15** — About art much smaller (128/144px stamps) + layout retuned to tight flex rows (`art | copy`, Goal mirrored); content col `max-w-[52rem]` so tiny stamps don't float in empty grid space (`(site)/about/page.tsx`).

- **2026-07-15** — About: restored Goal illustration (fixed stamp frame to explicit 260/280px so `fill` art no longer collapses under `justify-self-end`); clean **About Us** h1 + supporting “Why Learn in Curve exists” line (`(site)/about/page.tsx`).

- **2026-07-15** — About polish: illustrations smaller (~280–300px), straight (no tilt), crisp stamp border + sticker shadow; stronger extrabold type hierarchy; dropped soft founder card for hairline rule + compact profile stamp (`(site)/about/page.tsx`).

- **2026-07-15** — `/about` restaged onto continuous dotted cream paper (landing pattern): dropped orange/teal/rust full-bleed bands + checker strips; Vision/Goal/Values keep same copy + illustrations in thin-border frames; Founder becomes a paper stamp panel with `stampCtaPrimary` / labeled idle CTAs (`(site)/about/page.tsx`). Synced the drift into `DESIGN.md` + `PRODUCT.md` (continuous paper / floating stamp header / no full-bleed bands).

- **2026-07-15** — Hero + Meet Sly CTAs use shared stamp chips (`stampCtaPrimary` in `stamp-chip.ts`): same rounded-xl / thin border / sticker shadow as header; dropped pill `.btn` and arrows.

- **2026-07-15** — Header: guests see labeled **Courses** + **Sign up/in**; signed-in users get icon-only stamp chips (`SiteHeaderControls.tsx`).

- **2026-07-15** — Header controls icon-only (square stamp chips): removed button labels; Dashboard/Courses/Home/Auth/Sign out use SVGs + aria-label/title; staggered chip-in + icon hover micro-motion (`SiteHeaderControls.tsx`, `SignOutButton.tsx`, `DarkModeToggle.tsx`).

- **2026-07-15** — Removed hero takeoff animation (`HeroTakeoff.tsx` deleted; climb/cruise CSS removed). Landing hero is copy-only again on dotted paper.

- **2026-07-15** — Landing notify panel: removed “PFQ, PMP, and CAPM…” supporting line under the heading (`(site)/page.tsx`).

- **2026-07-15** — `/dashboard` matches landing dotted cream paper: removed `DashboardBackdrop` living-room SVG so body `--dot-grid` shows through (`dashboard/page.tsx`).

- **2026-07-15** — Removed landing marquee strip under the header (`(site)/page.tsx`).

- **2026-07-15** — Site header reshaped to Tines-style floating glass rectangle: `fixed` inset bar, `rounded-2xl`, paper/`backdrop-blur`, thin ink border; control shapes unchanged (`SiteHeader.tsx`, `globals.css`).

- **2026-07-15** — Landing hero: removed flight illustration; emphasised body dot grid (`--dot-grid` ~0.16, 1.25px dots / 20px pitch) so paper texture carries the hero (`(site)/page.tsx`, `globals.css`).

- **2026-07-15** — Landing continuous dotted-paper restage: removed full-bleed teal/cream-2/rust bands and torn dividers; hero fades to cream with ink type; Sly on paper (dark chrome only in Mac console); quiz diner as framed `LandingScene`; notify as rust stamp ticket on cream (`(site)/page.tsx`, `SlyShowcase.tsx`, `HeroFlightScene.tsx`, `QuizDemo.tsx`).

- **2026-07-15** — Header chrome polish: keep stamp-chip / CTA shapes; thin site header rule + chip/CTA borders from ~2.5–3px to 1px (`SiteHeader.tsx`, `SiteHeaderControls.tsx`, `PmqCourseHeader.tsx`, `.site-header .btn` in `globals.css`).

- **2026-07-15** — Removed landing “Pick your exam” teaser; Sly now tears into the quiz demo (`(site)/page.tsx`, `torn-divider-from-teal-deep` → cream-2).

- **2026-07-15** — `/courses`: more bottom wallpaper before footer — larger scene padding (~48–54vh), lower `object-position`, lighter bottom wash so the caravan isn’t cropped by the footer (`courses/page.tsx`).

- **2026-07-15** — Removed stale rust/`torn-divider-to-ink` seam on `/courses` (it assumed the old orange notify band above the footer).

- **2026-07-15** — Reverted `/courses` two-zone caravan/UI split back to single full-bleed sky+van scene (`courses/page.tsx`).

- **2026-07-15** — Removed `/courses` waitlist/notify banner and ticket “Notify me” CTA (`courses/page.tsx`, `CourseTicket.tsx`); locked tickets show plain “Coming soon”.

- **2026-07-15** — `/courses` notify strip narrowed into a max-w-md rust panel over the van scene (`courses/page.tsx`); full-bleed rust waitlist band removed so more caravan shows at the sides.

- **2026-07-15** — `/courses` sky-card layout: `course-page-van-2.jpg` full-bleed; headline + tickets sit in sky; van shows below (`courses/page.tsx`). URL-safe copy of `course-page-van 2.jpg`.

- **2026-07-15** — Courses hero: strip supporting line + Browse the line-up CTA — headline only over van (`courses/page.tsx`).

- **2026-07-15** — Courses page: remove catalogue sticky bar, THE LINE-UP stamp, and Start PMQ free CTA (`courses/page.tsx`, `CoursesCatalog.tsx`).

- **2026-07-15** — Courses hero polish: zoom out van frame, shift object-position right, lighter left-only wash for copy (`courses/page.tsx`, `globals.css`).

- **2026-07-15** — Courses hero: locked to new `course-page-van.jpg`; crop to lower-left + lighter top wash so the van stays visible (no heavy side dim) (`courses/page.tsx`).

- **2026-07-15** — `/courses` bolder redesign: full-bleed van hero (no image card, landing-hero energy), sticky catalogue chrome + filters, stronger CTAs (`courses/page.tsx`, `CoursesCatalog.tsx`, `globals.css`).

- **2026-07-15** — Courses catalogue: drop PMP/CAPM placeholder cards — `/courses` shows PMQ live + PFQ coming soon only (`courses-catalog.ts`).

- **2026-07-15** — Courses catalogue page `/courses`: van hero (`course-page-van.jpg`), filter chips, four-course catalogue (`courses-catalog.ts`), notify band; landing card grid → Browse courses teaser; PMQ ticket gains **Get Pro** checkout CTA beside Start free (`CourseTicket`, `CoursesCatalog`, `courses/page.tsx`, header/footer/dashboard links). Illustration briefs: `docs/COURSES_PAGE_ILLUSTRATION_BRIEFS.md`.

- **2026-07-15** — Meet Sly polish: face + stamp + headline as one lockup (no bob, no sticker-shadow portrait); quieter paper ring (`SlyShowcase.tsx`).

- **2026-07-15** — Meet Sly landing band: Sly fox face (`/mascot/fox-face.svg`) above the headline with stamp border + `mascot-bob` (`SlyShowcase.tsx`).

- **2026-07-15** — Public site version **v2.0** in footer (`SiteFooter` â† `SITE_VERSION`). Auto +0.1 on each commit after launch via `scripts/bump-version.mjs` + git pre-commit (`scripts/git-hooks/pre-commit`, installed by `npm prepare`). Milestone jumps only when told (`LIC_VERSION=3.0` / `npm run version:set`). Skip: `LIC_SKIP_VERSION=1`. Source of truth: `src/lib/site-version.ts`.

- **2026-07-14** — AiTutorPanel: match Mac showcase wallpaper language — sharp `AItutor-window-wallpaper.jpg` + `from-paper/15 → to-cream/30` wash; translucent paper composer (`bg-paper/92` + light blur) so the wash reads at the dock (`AiTutorPanel.tsx`, `globals.css`).

- **2026-07-14** — SlyMacConsole showcase: user chip “You” → “Sim” + badger avatar (`/avatars/badger.jpg`).

- **2026-07-14** — SlyMacConsole: 11-message LO10 stakeholder showcase; `runLoop` walks full `SLY_SHOWCASE_CHAT` by role (type user / think+append Sly) instead of hardcoding indices 0–2 (`SlyMacConsole.tsx`).

- **2026-07-14** — Landing: removed hero boarding pass + floating fox; restored Mac-style Sly showcase console/section (`page.tsx`, `SlyMacConsole.tsx`, `SlyShowcase.tsx`).

- **2026-07-14** — Landing critique follow-through (kept all CTAs): `PmqStartLink` guests → PMQ preview (aligned with quiz); boarding pass + fox re-mounted in hero; unverified stars removed; Sly console restickered (teal header, no Mac traffic lights); Sly beats drop `01/02/03`; newsletter honest mailto (no fake list); header Courses/# on home instead of redundant Home; footer Curve orange + Meet Sly + feedback mailto; torn seams cream→cream-2→rust→ink (`page.tsx`, `SlyMacConsole`, `NewsletterSignup`, `SiteHeaderControls`, `SiteFooter`, `globals.css`).

- **2026-07-14** — Reverted hero→Sly seam to zigzag tear line (`.torn-divider-to-teal-deep`, sky `#063e5c` base → teal teeth); removed `HeroSlySeam` punch/fade stub (`page.tsx`, `globals.css`).

- **2026-07-14** — Hardened hero→Sly seam (`HeroSlySeam.tsx`): removed paper shelf (wrong for live wide flight plate); sky→teal fade overlap + always-visible punch/stub; motion is progressive enhancement only (`globals.css`, `page.tsx`).

- **2026-07-14** — Hero→Sly seam redesigned as boarding-pass perforation (`HeroSlySeam.tsx`): paper scallop matching hero clouds, gold “Meet Sly” stub, stitch + sheen on scroll-in; removed mismatched ink torn-divider (`page.tsx`, `globals.css`).

- **2026-07-14** — Sly showcase layout: copy column capped at 20rem, console widened to laptop landscape (`h-[360–400]` fill remaining column); tighter section gap (`SlyShowcase.tsx`, `SlyMacConsole.tsx`).

- **2026-07-14** — SlyMacConsole: fixed taller window (`h-[480px]`/`sm:h-[520px]`) so bubbles don’t expand the section; restored AI tutor wallpaper (`AItutor-window-wallpaper.jpg`).

- **2026-07-14** — Sly showcase console redesigned as Mac-style SaaS chat window (`SlyMacConsole.tsx`): traffic-light chrome, cream chat body, looping type→send→Sly-reply choreography; Veo skipped for brand fidelity (`SlyShowcase.tsx`, `globals.css`).

- **2026-07-14** — SlyShowcase: removed “Unlock Pro after you taste it Â· Â£9.99” line under CTA (`SlyShowcase.tsx`).

- **2026-07-14** — SlyShowcase animate+bolder pass: larger Meet Sly / orange name, gold AI stamp, sticker console tilt, scroll text-pop + console entrance, directional bubble stagger, wallpaper drift, send pulse (`SlyShowcase.tsx`, `globals.css`).

- **2026-07-14** — SlyShowcase console mirrors live tutor panel (teal header, wallpaper thread, cream composer, real bubble styles); CTA “Try Sly for free”; Pro price under button; fox bob removed; scroll text-pop on copy (`SlyShowcase.tsx`, `globals.css`).

- **2026-07-14** — Landing craft: Sly showcase band (`SlyShowcase.tsx`) between hero + Line-up; torn dividers retinted for teal-deep seams; Line-up drops flat-fee subcopy + courses-car art; PMQ ticket sells Sly/Pro (`CourseTicket.tsx`); shared `src/lib/pmq/pro-included.ts`.

- **2026-07-14** — Removed homepage StatBand (learners / pass rate / avg finish + caption) from landing page (`page.tsx`).

- **2026-07-14** — Removed homepage `#about` / OUR PHILOSOPHY band from landing page; `/about` and footer About link unchanged (`page.tsx`).

- **2026-07-14** — Dashboard course card CTAs: `rounded-full` → `rounded-xl` (Continue, Overview, Get Pro, Top up) to match ticket/sticker corners (`DashboardPmqCourseCard.tsx`).

- **2026-07-14** — Dashboard card: What’s included link colour → teal (`DashboardPmqCourseCard.tsx`).

- **2026-07-14** — Dashboard course card: sticker+ambient shadow (`5px 6px` ink offset) + slightly stronger border (`DashboardPmqCourseCard.tsx`).

- **2026-07-14** — Dashboard card: slight dashed hairline separator above Get Pro bundle footer (`DashboardPmqCourseCard.tsx`).

- **2026-07-14** — Dashboard PMQ card layout: study-first 3 zones — full-width title; pills + deadline meta row; stacked Continue (h-11) above Overview (h-10); quieter Pro footer (`py-5`, `gap-2`) (`DashboardPmqCourseCard.tsx`).

- **2026-07-14** — Dashboard card: XP/streak/done pills smaller (`size="sm"`) tucked under course title; Deadline label → retro target icon (`DashboardPmqCourseCard.tsx`, `XpStreakBar.tsx`).

- **2026-07-14** — Dashboard card: removed Recommended badge; study CTAs taller (h-11) than Get Pro bundle (h-9) (`DashboardPmqCourseCard.tsx`).

- **2026-07-14** — Recommended badge quieted: soft teal pill, no stamp/rotate/shadow (`DashboardPmqCourseCard.tsx`).

- **2026-07-14** — Pro CTA: price back in button (`Get Pro bundle Â· Â£X`), Sly face leading icon, Recommended as rotated orange stamp top-right, What’s included in bold orange (`DashboardPmqCourseCard.tsx`, `AiTutorUpgradeCta` `leading` prop).

- **2026-07-14** — Dashboard Pro strip distilled (Apple-restraint): Recommended badge + Get Pro bundle CTA + quiet price + What’s included only; dropped headline/blurb (`DashboardPmqCourseCard.tsx`).

- **2026-07-14** — Dashboard PMQ card: What’s included accordion defaults collapsed (`DashboardPmqCourseCard.tsx`).

- **2026-07-14** — Dashboard PMQ card: larger Fraunces course title (~1.65–1.85rem) for emphasis (`DashboardPmqCourseCard.tsx`).

- **2026-07-14** — Dashboard PMQ card polish: Deadline chip top-right; Course overview / Continue learning; Fraunces course title; shadow on overview CTA; Unlock Pro bundle + Get Pro bundle CTA (no em dashes); Sly fox + feature icons in What’s included (`DashboardPmqCourseCard.tsx`).

- **2026-07-14** — Dashboard PMQ card SaaS redesign: exam deadline input (profiles.target_exam_date), smaller Overview/Continue CTAs, Unlock Pro + expanded What’s included copy; soft border card (not sticker) (`DashboardPmqCourseCard.tsx`, migration `20260714160000_profile_exam_deadline.sql`).

- **2026-07-14** — Profile trigger pill shows “Edit profile” when no name is set (`DashboardProfileMenu.tsx`).

- **2026-07-14** — Profile “Saved” only after Save succeeds; clears on close/reopen/edit and auto-hides after 2s (`DashboardProfileMenu.tsx`).

- **2026-07-14** — Profile trigger pill: modern SaaS account chip (soft hairline, 32px avatar, single-line name, no Edit caption / ink invert) (`DashboardProfileMenu.tsx`).

- **2026-07-14** — Profile panel compacted (no scroll, denser fields, smaller Exit/Save actions; Done→Exit) (`DashboardProfileMenu.tsx`).

- **2026-07-14** — Profile trigger: circular avatar; name lead (bold / larger / wider truncate); “Edit profile” demoted to quiet caption (`DashboardProfileMenu.tsx`).

- **2026-07-14** — Profile menu bolder SaaS redesign (ink-bordered trigger, teal-deep hero, avatar radios, mobile bottom sheet); Age “Optional” removed; Study goal → Life achievement (`DashboardProfileMenu.tsx`, Privacy Policy).

- **2026-07-14** — Collapsible dashboard Profile menu (avatar trigger); four animal avatars (owl/badger/otter/hedgehog) used in Sly user face; dropped target exam date + weekly study hours (`DashboardProfileMenu.tsx`, `avatars.ts`, migration `20260714150000_profile_avatars.sql`, `AiTutorPanel.tsx`).

- **2026-07-14** — Profile on dashboard (not signup): removed first-name from sign-up; added `profiles` table + Profile panel (first/last name, age, profession, exam date, study goal, weekly hours). Welcome + Sly labels read profile first name (`AuthForm.tsx`, `DashboardProfileForm.tsx`, migration `20260714140000_profiles.sql`). Privacy Policy updated.

- **2026-07-14** — First name at email signup (`user_metadata.first_name`); Dashboard eyebrow becomes “Welcome, {name}” (or “Welcome”); Sly user messages get a face pill mirroring Sly (`AuthForm.tsx`, `user-display.ts`, dashboard, `AiTutorPanel.tsx`). Privacy Policy updated for first-name collection.

- **2026-07-14** — Sly reply scroll: horizontal scroll only on wide artefacts (table/`pre` wrapped in `.sly-md-artefact`); prose no longer slides sideways (`MarkdownBlock.tsx`, `AiTutorPanel.tsx`, `globals.css`).

- **2026-07-14** — Sly tables/Gantt: stop mid-cell letter wrap — cells `white-space: nowrap` + `table-layout: auto` with horizontal scroll; system prompt hard rules for single-line cells / Gantt tokens (`globals.css`, `buildSystemPrompt.ts`).

- **2026-07-14** — Sly thread scroll styled to LIC: thin cream track, teal-ink thumb, orange on hover; same language on in-bubble markdown overflow (`.sly-scroll`, `.sly-md`) (`AiTutorPanel.tsx`, `globals.css`).

- **2026-07-14** — Sly assistant bubbles contain wide content: `min-w-0`/`overflow-hidden` on bubbles; `.sly-md` clamps images/video/svg, wraps table cells with scroll fallback, constrains `pre`/`code` (`AiTutorPanel.tsx`, `globals.css`).

- **2026-07-14** — Sly: rating toggle-off restored (re-click clears); user bubbles orange fill again (`sly-user-bubble` color-mix for AA paper text) (`AiTutorPanel.tsx`, `globals.css`).

- **2026-07-14** — Sly ratings polish: drop square selected wash; idle thumbs muted (desaturated); selected state full saturation/brightness on the icon only (`globals.css`).

- **2026-07-14** — Sly ratings: pull thumbs-down left (`margin-left: -0.85rem`) so icons sit closer; rating is exclusive single-select (no toggle-off; switching upâ†”down replaces highlight) (`AiTutorPanel.tsx`, `globals.css`).

- **2026-07-14** — Sly audit remediation (14→target): focus trap + restore, list sentinel outside `<ul>`, full-contrast paused chat (no opacity mute), paper/orange-border user bubbles + cream Sly chip, stronger placeholder/disclaimer, 44px thumbs, Unlock `min-h-11`, reduced-motion for `.sly-msg-in`/panel, `--teal-rgb` tokens (`AiTutorPanel.tsx`, `SlyUnlockInvite.tsx`, `globals.css`).

- **2026-07-14** — Sly colour roles clarified: teal-deep only for header + launchers (identity); cream composer dock with sand seam, teal focus ring, orange send, rust errors only — no second coloured banner at the bottom (`AiTutorPanel.tsx`, `globals.css`).

- **2026-07-14** — Sly chrome colorize: swap teal-deep → rust for header, composer dock, and launchers (token from DESIGN.md band accents); keep orange as send CTA; sand/gold meta on rust (`AiTutorPanel.tsx`, `globals.css`).

- **2026-07-14** — Sly composer bolder pass: teal-deep dock bookends the header, sand top edge, paper input nest, larger orange send, gold/sand feedback link; locked-cap footer matches (`AiTutorPanel.tsx`, `globals.css`).

- **2026-07-14** — Sly panel SaaS polish: quieter chrome (soft elevation, thin borders), full-bleed mountain wallpaper `AItutor-window-wallpaper.jpg` with no washout overlay, message skeletons, fill-only suggestion chips, markdown assistant replies via `MarkdownBlock`, Escape/focus/aria-live/send spinner/Retry (`AiTutorPanel.tsx`, `globals.css`).

- **2026-07-14** — Revert Sly replies to SaaS-style modern chat bubbles (cream assistant / orange user, thin border, small face label above streak); drop ticket-slip header and sticker edges. Keep in-bubble thumbs (`AiTutorPanel.tsx`, `globals.css`).

- **2026-07-14** — Sly assistant replies redesigned as ticket slips: teal-deep stamp header (or teal bar on streak), 2.5px ink border, paper + sticker shadow, denser body type; user bubbles keep orange with ink sticker edge (`AiTutorPanel.tsx`, `globals.css`).

- **2026-07-14** — Sly ratings: stop half-fading buttons (rust down looked disabled vs orange up); optical lift on down plate + shared full-weight idle (`globals.css`, `AiTutorPanel.tsx`).

- **2026-07-14** — Sly ratings: move thumbs inside the assistant bubble (connected to text); equal up/down treatment; shrink to 18px with shared quiet pop (`AiTutorPanel.tsx`, `globals.css`).

- **2026-07-14** — Sly ratings: switch to transparent `thumbs-up.png` / `thumbs-down.png`, drop multiply blend, quieter chat-density motion (`AiTutorPanel.tsx`, `globals.css`).

- **2026-07-14** — Sly ratings: separate `thumbs-up.jpg` / `thumbs-down.jpg`, no circular wash, cream plate knocked out with multiply, hover lift + select pop (`AiTutorPanel.tsx`, `globals.css`).

- **2026-07-14** — Sly ratings: swap deformed SVG thumbs for crops from `public/brand/inspo/thumbs.jpg` (`AiTutorPanel.tsx`).

- **2026-07-14** — Sly message ratings: text Helpful/Not helpful replaced with Illustrated Edition cel thumbs-up / thumbs-down SVGs (`AiTutorPanel.tsx`).

- **2026-07-14** — Sly free-tier chrome: unlock strip copy drops “unlock once for Â£9.99”, strip made smaller than header; panel title always “Sly” (not “Try Sly”) (`SlyUnlockInvite`, `AiTutorPanel`).

- **2026-07-14** — Full mock card: removed unlocked “Unlocked”/watermark chrome that was clipping to look like “LOKE” (`PmqMockExamsSection.tsx`).

- **2026-07-14** — Premium bundle price locked at **Â£9.99** everywhere: `SLY_UNLOCK_PRICE_CENTS` drives UI + Stripe checkout; migration `20260714120000_pmq_premium_price_999.sql` updates `exam_config`; Terms + philosophy copy updated. (Â£5 remains the included Sly fair-usage credit, not the unlock price.)

- **2026-07-14** — Free-tier Sly unlock strip: sand + ink (not teal-deep header, not cream composer) (`SlyUnlockInvite` compact).

- **2026-07-14** — Free-tier Sly unlock strip: `teal-deep` + paper text so it separates from the cream composer (`SlyUnlockInvite` compact).

- **2026-07-14** — Removed on-page “Not affiliated with or endorsed by APM.” from PMQ overview + LO pages; deleted `ApmDisclaimer.tsx`. Statement still in Terms of Service.

- **2026-07-14** — Polish Sly chat layout: one unlock meta strip (free count folded in), smaller centred empty state, cleaner composer + inline disclaimer Â· feedback, quieter ratings (`AiTutorPanel.tsx`, `SlyUnlockInvite.tsx`).

- **2026-07-14** — Sly composer: AI-mistake disclaimer under the input + Send feedback (Intercom, mailto fallback) (`AiTutorPanel.tsx`, `SendFeedbackButton.tsx`).

- **2026-07-14** — Modern Sly chat redesign: three-zone panel (header / scroll-thread / sticky composer), right-orange / left-cream bubbles, typing dots, Helpful/Not ratings, compact unlock meta strip, empty-state plate `public/brand/inspo/sly-empty.jpg`, desktop width ~440px + 200ms enter (`AiTutorPanel.tsx`, `SlyUnlockInvite.tsx` compact variant, `globals.css`).

- **2026-07-14** — AI tutor panel opens scrolled to latest messages (scroll container `scrollTop`, after history load) (`AiTutorPanel.tsx`).

- **2026-07-14** — Fix tutor “Empty response from tutor model”: harden Gemini SSE parsing (flush trailing events, skip thought-only parts) and fall back to non-streaming `generateContent` when the stream yields no text (`callTutorModel.ts`).

- **2026-07-14** — AI tutor snappiness: Phase A (keep optimistic user bubble, “Sly is thinking…” pending assistant, soft history reload, auto scroll only on send/stream, last-20 Gemini context cap) + Phase B (Gemini `:streamGenerateContent` SSE from `/api/tutor/chat`, client chunk append). Lighter unlock animations (no blur enter; slower shimmer/glow) (`AiTutorPanel.tsx`, `callTutorModel.ts`, `chat/route.ts`, `constants.ts`, `globals.css`).

- **2026-07-13** — Footer: LinkedIn icon beside Instagram, linking to https://www.linkedin.com/in/simsamaarshened (`SiteFooter.tsx`).

- **2026-07-13** — Footer: Instagram icon link to https://www.instagram.com/learn.in.curve/ under the brand blurb (`SiteFooter.tsx`).

- **2026-07-13** — About Founder: added `Get in touch` beside LinkedIn — `mailto:simsamaarshened@gmail.com` opens the user’s email app (`about/page.tsx`, `ABOUT_PAGE_COPY.md`).

- **2026-07-13** — About: removed Goal `PASS` and Founder `BUILT SOLO` overlays; Founder photo top-aligned with the Founder heading (`about/page.tsx`).

- **2026-07-13** — About Founder photo: shrunk to ~148–168px square thumbnail; grid rebalanced so copy leads (`about/page.tsx`).

- **2026-07-13** — About Founder: removed SIM photo badge; band bg ink → teal-deep so it doesn’t melt into the ink footer (`about/page.tsx`).

- **2026-07-13** — About Founder band: dropped stamp-desk game idea; static ink poster redesign instead — large tilted photo with orange sticker shadow + SIM badge, extrabold Founder H2, orange LinkedIn CTA, orange/gold closer stripes (`about/page.tsx`).

- **2026-07-13** — About hero: moved ABOUT US to left margin as plain stamp type (no paper chip / border / sticker shadow — was reading as a button) (`about/page.tsx`).

- **2026-07-13** — About hero bolder pass: poster masthead — extrabold stacked H1, rotated paper ABOUT US stamp, ink/gold/checker closer stripes (StatBand language), load `hero-enter` instead of scroll-reveal (`about/page.tsx`).

- **2026-07-13** — About page redesign (`/about`): bold poster bands — orange hero, cream Vision + art, teal-deep Goal + art, rust Values + art, cream Founder ticket with Sim photo + LinkedIn. Copy from `ABOUT_PAGE_COPY.md` (Values paragraph drafted for ship from philosophy trust pillars — editable). Assets: `public/brand/inspo/about-{vision,goal,values}.jpg`, `public/brand/sim-profile.jpg`. Homepage `#about` untouched (`about/page.tsx`).

- **2026-07-13** — About page (`/about`): Vision / Goal / Founder from `ABOUT_PAGE_COPY.md` verbatim; ink band + `ScrollReveal` (reduced-motion aware); LinkedIn link with inline SVG icon; footer Company → About now points to `/about` (homepage `#about` philosophy section left untouched) (`about/page.tsx`, `SiteFooter.tsx`).

- **2026-07-13** — Homepage hero: removed “NOW BOARDING - PMQ COHORT” eyebrow chip (`page.tsx`).

- **2026-07-13** — Homepage hero: removed boarding pass (looked out of place on the flight plate). Hero keeps Now Boarding, headline, subcopy, Start free CTA (`page.tsx`). `HeroBoardingPass.tsx` left in place unused.

- **2026-07-13** — Reverted homepage hero split / check-in section. Restored single hero with Now Boarding, subcopy, Start free CTA, and horizontal boarding pass over clouds; removed `CheckInSection.tsx` (`page.tsx`).

- **2026-07-13** — Homepage hero split: slim flight hero (plane + H1 only); new check-in band (`CheckInSection`) with `check-in-wide.png`, Now Boarding, horizontal boarding pass, Start free CTA. Asset normalized from `check-in-wide.png.jpg` → `check-in-wide.png` (`page.tsx`, `CheckInSection.tsx`, `public/brand/inspo/`).

- **2026-07-13** — Hero “Start free with PMQ” clicks were swallowed: lg boarding-pass row used full-width `pointer-events-auto` over the CTA. Events only on the pass width now. `PmqStartLink` uses plain `<a>` + client `getUser()` so href is `/auth/sign-up` or `/dashboard` from live session (`page.tsx`, `PmqStartLink.tsx`).

- **2026-07-13** — `PmqStartLink` hardened: plain `<a href>` (full navigation) to `/auth/sign-up` or `/dashboard`; dropped Next `<Link>` soft-nav. Hero CTA stack `z-10` so it stays above the flight plate.

- **2026-07-13** — `PmqStartLink` (hero / course ticket “Start free…”): unsigned → `/auth/sign-up`, signed-in → `/dashboard` (was sending unsigned users to PMQ preview).

- **2026-07-13** — Homepage hero: removed scroll-linked plate drift in `HeroFlightScene` (translating the full-bleed image under `overflow:hidden` cropped the scene and read as the hero shrinking). Wake / static plate unchanged.

- **2026-07-13** — Homepage boarding pass: horizontal airline layout (main + vertical tear-off stub), minimal type (no proof list, no Sly paragraph, no em dashes); Sly = fox face + “SLY AI TUTOR”; wider lower-right placement (`HeroBoardingPass.tsx`, `page.tsx`).

- **2026-07-13** — Homepage boarding pass craft: moved to lower-right over clouds (plane clear above); redesigned as airline coupon (START→PASS route, COURSE/DURATION/GATE meta, barcode stub, denser proof); named **Sly Â· your AI tutor** beat with fox-face (dropped generic “AI tutor included”); cloud-tan punch holes (`HeroBoardingPass.tsx`, `page.tsx`).

- **2026-07-13** — Reverted homepage hero CSS prop-spin overlay (didn’t read correctly on the baked plate). Wide mode is back to full-bleed `hero-flight-wide.png` + wake + scroll drift only (`HeroFlightScene.tsx`, `globals.css`).

- **2026-07-13** — Homepage hero prop spin (impeccable animate): wide plate now overlays a foreshortened CSS prop disc locked to the nose via a 16:9 cover-matched plate (`HeroCoverPlate` + `HeroPropeller perspective` at ~64%/26.5%); 0.22s linear spin, reduced-motion static; wake unchanged (`HeroFlightScene.tsx`, `globals.css`).

- **2026-07-13** — Homepage hero AI Studio plate live: exported `hero-flight-wide.png` (2400Ã—1350 from Generated Image) + transparent `hero-plane.png` (from Untitled design, black keyed out — waiting on `hero-sky-clouds.png` for layered). `HeroFlightScene` now runs **wide** mode (full-bleed plate, wake + scroll drift; no CSS prop duplicate over baked blur); boarding-pass punches match teal sky `rgb(6 62 92)` (`hero-assets.ts`, `HeroFlightScene.tsx`, `page.tsx`, `public/brand/inspo/`).

- **2026-07-13** — Homepage hero flight motion architecture: `resolveHeroAssets()` swaps in AI Studio drops (`hero-flight-wide.png` or `hero-sky-clouds`+`hero-plane`[+`hero-prop`]); until then composed mode (SVG full-width clouds + plane crop). Client `HeroFlightScene` — motion-safe prop spin, wake streaks, subtle scroll plane drift (`hero-assets.ts`, `HeroFlightScene.tsx`, `HeroIllustration.tsx`, `globals.css`).

- **2026-07-13** — Homepage hero clouds: full-width SVG cloud horizon (cream/tan cel-shade, continuous lobes — not a tiled cutout); clipped plane PNG above its own cloud bottoms so the scene reads as one poster (`HeroIllustration`).

- **2026-07-13** — Homepage hero craft redesign: flight poster from attached art (`hero-flight.png`). Solid sky fill + **contained** plane (avoids soft full-bleed upscale of ~723px source); no cream fade; teal multiply grade; cream type on sky; pass punches match sky (`HeroIllustration`, `HeroBoardingPass`, `page.tsx`). Visual-direction-by-generation skipped.

- **2026-07-13** — Homepage hero edge fix: root cause was a **white border baked into** `hero-radio.jpg` (~47px), not layout padding. Cropped border at JPEG quality 95; left-only text scrim (no full-bleed cream washes); slight overscale + `quality={92}` (`HeroIllustration`, `public/brand/inspo/hero-radio.jpg`).

- **2026-07-13** — Homepage hero polish: removed corner TV overlay (`hero-tv.jpg`); radio/sideboard scene is full-bleed; killed ken-burns/float idle motion on hero (static art + soft cream wash only) (`HeroIllustration`).

- **2026-07-13** — Homepage Inspo craft/animate: replaced rotating CSS sunburst with mid-century scenes from `brand/Inspo` (copied to `public/brand/inspo/`). New `HeroIllustration` (radio/sideboard + TV layer) and `LandingScene` accents on About/Courses/Quiz/Newsletter; ken-burns/float/sway motion with reduced-motion freeze. CTAs/logic unchanged (`page.tsx`, `HeroIllustration`, `LandingScene`, `globals.css`).

- **2026-07-13** — Homepage: removed the “THE JOURNEY / Five stops” section (`JourneyPath`) from `src/app/(site)/page.tsx`. Component file left in place unused.

- **2026-07-13** — Course overview day cards “stuck” (Day 1 open, 2–5 dead): not accordion logic — stale Next.js on :3000 was 404ing `/_next/static/chunks/app/courses/layout.js`, so React never hydrated and triggers had no `onClick`. Killed stale node, cleared `.next`, restarted `npm run dev`. Accordion code + sticky-header click-through (`PmqDayPlan` / `PmqCourseHeader`) verified working after restart.

- **2026-07-13** — Course overview day expand/collapse: restored independent per-day open state (removed exclusive accordion + sync effect that fought toggles); sticky `PmqCourseHeader` is `pointer-events-none` with `pointer-events-auto` only on chrome so day Open buttons still receive clicks when scrolled under the header (`PmqDayPlan`, `PmqCourseHeader`).

- **2026-07-13** — Course overview day accordion: days 2–5 wouldn’t open when scrolled under sticky `PmqCourseHeader` — exclusive one-day-open + scroll-clear sticky header on toggle; expanded LO panel colorized (sand tray, orange LO stamps, ink-border sticker LO tiles, olive complete) (`PmqDayPlan`).

- **2026-07-13** — Dashboard course card CTAs dead on localhost: animated home-scene SVG was stealing clicks (full-width on mobile). Backdrop now `pointer-events: none !important` on all descendants, scene hidden below `md`, both CTAs plain `<a>` hard links, card `isolate z-20`.

- **2026-07-13** — Dashboard “Course overview” CTA: use plain `<a href>` (full page load) instead of Next `<Link>` soft-nav across layout groups; only mount `SlyTopUpDialog` when open; `dialog:not([open]){display:none}` so a closed dialog can’t steal clicks.

- **2026-07-13** — Dashboard “Course overview” CTA: solid secondary link (not transparent ghost), default `/courses/pmq-in-5-days`, raised z-index so backdrop can’t steal clicks (`DashboardPmqCourseCard`).

- **2026-07-13** — APM disclaimer (“Not affiliated with or endorsed by APM.”) shown only on PMQ course overview + LO pages (`ApmDisclaimer`); removed from global `SiteFooter`.

- **2026-07-13** — Dashboard PMQ card title: “5 days” in orange (`DashboardPmqCourseCard`).

- **2026-07-13** — Dashboard localhost 500: `sumTutorCreditGbpCents` no longer throws when `tutor_usage_credits` is missing (migration not applied yet) — returns 0 + logs; dashboard also catches fair-usage failures so the page stays up.

- **2026-07-13** — Dashboard PMQ card craft: dual CTAs (Course overview + Continue → next incomplete LO); Sly unlock **Â£9.99** grants **Â£5** fair-usage credit; anytime **Top up** modal (Â£1/Â£2/Â£5 + custom) credits **70%** to metre (30% platform fee, not labelled “tax”). Ledger `tutor_usage_credits` + webhook; fair-usage budget from credits (`SlyTopUpDialog`, `DashboardPmqCourseCard`, Stripe webhook/actions, `fair-usage.ts`). Apply migration `20260713100000_tutor_usage_credits.sql`.

- **2026-07-12** — Dashboard PMQ card: “Fair-usage remaining” → “Fair-usage metre” (`DashboardPmqCourseCard`).

- **2026-07-12** — Header bottom edge: removed scroll-stacked/extra soft shadows under the ink border so the rule stays one thickness (`SiteHeader`, `PmqCourseHeader`).

- **2026-07-12** — Course overview FAQ heading: “Frequently asked questions” → “FAQs” (`PmqFaqSection`).

- **2026-07-12** — Course overview day plan quieter/polish: expanded LO tiles no longer use `ticket-card` sticker shadows — nested in a soft cream tray under the day row with light borders, body type, quiet olive âœ“ (no sparks), teal LO labels (`PmqDayPlan`). Day trigger keeps the louder sticker chrome so hierarchy stays clear.

- **2026-07-12** — LO page UX reshape (shape brief): replaced flat accordion wall with within-LO journey (`LoStudyPath` + `LoStudyJourney`) — stages Watch→Orient→Learn→Apply→Practice→Seal; free nav until seal; sticky path nodes; Continue CTAs. Seal gated on quiz + checklist (UI + `markSectionComplete`); sealed LOs are review-only (checklist read-only, no un-complete). All prior content blocks preserved. Files: `src/lib/pmq/lo-stages.ts`, `LoStudyPath.tsx`, `LoStudyJourney.tsx`, LO `page.tsx`, `LoCompleteButton`, `ProgressCheckpointList`, `actions.ts`.

- **2026-07-12** — LO 1: added top “Video” accordion with Project Life Cycles explainer (`docs/Videos/Project_Life_Cycles.mp4` copied to `public/videos/pmq/`; `LoExplainerVideo`, `PMQ_LO_EXPLAINER_VIDEOS` in constants). Jump nav includes Video on LO 1; Context keeps “Start here” only when no video.

- **2026-07-12** — LO polish: Practice quiz back to peer ink border (no orange emphasis / “Check yourself”); removed muted/start shell tones that washed out accordion titles — all sections share full-weight ink tickets; Context keeps default-open + “Start here” cue only (`LoAccordionSection`, `PracticeQuizSection`, LO page).

- **2026-07-12** — LO page guided path + mobile definitions (critique P1s; completion model left alone): Context accordion opens by default with “Start here” tone; `LoStudyJumpNav` jump chips; Practice quiz elevated as mid-page milestone (`border-orange`, “Check yourself”); completed LOs mute non-quiz sections. `DefinitionsTable` stacks Plain-English-first cards below `md`, keeps table from `md` up (`LoAccordionSection`, `LoStudyJumpNav`, `PracticeQuizSection`, LO page).

- **2026-07-12** — Study plan heading: “Your 5-day study plan” with “5-day” in orange (`PmqOverview`, preview).

- **2026-07-12** — Study plan day labels use numerals (“Day 1”…“Day 5”), no theme names. Section heading “Your five-day study plan”. Shared via `PMQ_DAY_LABELS` / `getDayLabel()` in `src/lib/pmq/constants.ts`.

- **2026-07-12** — Study plan day labels restored as “Day one”…“Day five” (no Foundations/Planning/Control/Delivery/Closure themes). Section heading back to “Your five-day study plan”. Shared via `PMQ_DAY_LABELS` / `getDayLabel()` in `src/lib/pmq/constants.ts`.

- **2026-07-12** — Removed Day 1–5 labels and theme headings (Foundations / Planning / Control / Delivery / Closure) from study UI: overview resume CTA, study-plan accordion rows (now `LO n–m`), LO page chip, and preview study-plan copy. Heading is “Your study plan”.

- **2026-07-12** — Course overview study hub: added primary Resume/Continue CTA from next incomplete LO (`getNextIncompleteSection` in `src/lib/pmq/progress.ts`, `ResumeCta` in `PmqOverview.tsx`), auto-expands that day in `PmqDayPlan`, removed duplicate body course title + hero stats pill so the header owns course identity. Empty day-plan copy is learner-facing (refresh + feedback) instead of migration-script jargon; `PmqHeroStats` link relabelled “Mock exams”. Overview Sly panel now grounds on the next LO, not always LO1.

- **2026-07-12** — Course overview: removed FAQ / Resources tags and “Go deeper with the official APM resources” subtitle.

- **2026-07-12** — Mock Exams section: removed “Practice papers” tag above the heading.

- **2026-07-12** — Mock Exams section: removed intro subtitle under the heading.

- **2026-07-12** — Course overview: removed “Study plan” tag; heading is now “Your 5-Day Study Plan”.

- **2026-07-12** — Course overview study plan: removed “Bite-sized days…” subtitle under “Your 5-day plan”.

- **2026-07-12** — Course overview page title: dropped “24 learning objectives” tag; “5 Days” / “five days” in the course name rendered in orange.

- **2026-07-12** — Overview study header: “Course overview” restyled as display heading (not a stamp/button chip).

- **2026-07-12** — Overview study header: “Course overview” emphasized as ink stamp chip (`aria-current="page"`) instead of muted gray text.

- **2026-07-12** — PMQ course overview uses the same study header as LO pages (`PmqCourseHeader` + `showStudyNav`); global `SiteHeader` hidden on `/courses/pmq-in-5-days`; overview meta shows “Course overview” instead of back link; XP/streak moved out of page body into the header.

- **2026-07-12** — Course overview: removed intro blurb under course name (“Five days, twenty-four objectives…”).

- **2026-07-12** — Mock Exams section redesign (bolder): Lite as hero ticket (teal-deep band, large display copy, check-list, primary CTA); Full as narrower paid ticket (ink band, gold unlock stamp when locked / olive when unlocked). Same logic — Lite free, Full behind Â£5 entitlement. Cleaned Lite bullets to MCQ/dropdown-only (no contradictory short-answer lines).

- **2026-07-12** — Sly fox-face icon: removed idle nudge animation from AI tutor launcher + panel header + unlock invite.

- **2026-07-12** — Lite mock answer selection: replaced orange (reads as wrong/alert) with teal selection — ink stamp chip + teal-deep border/fill; no orange/rust/olive on select. Dropdown filled state matches (`MockExamRunner`).

- **2026-07-12** — Mock exam no longer gated on completing all 24 LOs: removed locked UI from `MockExamRunner`, dropped unlock fetch on mock page; `getMockUnlockStatus` always returns `unlocked: true`.

- **2026-07-12** — Lite Mock Exam card: renamed from “Light”; removed “Free for everyone”; bullet description (MC/dropdown, short answers, 40 timed Qs, short answers in / long answers out, first-run after 5-day plan).

- **2026-07-12** — Course overview reorder: Study plan → Mock Exams (Light free + Full/Real locked for free via `LockedFeature` / unlock CTA; both open when entitled) → Exam prep (command words) → FAQ → Further reading. Removed What’s Included from overview (`PmqMockExamsSection`, `PmqOverview`).

- **2026-07-12** — LO page header: removed percentage progress ring next to the Day badge (kept LO + Day tags only).

- **2026-07-12** — LO complete: replaced fullscreen journey modal with in-page brand-color confetti + floating “LO complete” toast (`LoCompleteButton`); completed LO badge + progress ring turn olive with âœ“; button becomes olive success state. Reduced-motion: toast only, no confetti.

- **2026-07-12** — Header controls: dark mode toggle moved to leftmost chip (signed-in and guest) via `SiteHeaderControls`.

- **2026-07-12** — Dashboard: removed Sly edge/mobile launcher; restored course-card unlock strip for free users (usage meter when unlocked). Sly panel stays on course overview + LO pages.

- **2026-07-12** — Sly launcher: removed Â£ price badge from the open button (price stays in the panel unlock invite only).

- **2026-07-12** — Sly unlock: removed dashboard / overview “Unlock your AI tutor” boxes; paywall lives in Sly launcher + panel via desire-led `SlyUnlockInvite` (ticket stub, soft copy, glow/nudge/shimmer motion). `AiTutorPanel` mounts on dashboard; locked course card shows study CTA only (usage meter when unlocked).

- **2026-07-12** — LO header XP / streak / % info pills: solid paper fill + light border + slight shadow so they stay readable over the living-room atmosphere; paper fade behind header content strengthened (`XpStreakBar` info variant, `PmqCourseHeader`).

- **2026-07-12** — Sly AI tutor launcher: renamed open control from “AI Tutor” to “Sly Â· your AI tutor” with fox-face icon; larger teal edge tab on desktop + full-width mobile thumb bar; panel also mounts on PMQ course overview (`page.tsx` + `AiTutorPanel.tsx`). Mobile overview gets extra bottom padding so content clears the bar.

- **2026-07-12** — Dashboard PMQ card: XP / streak / % done as the same quiet info pills as the LO header (`StudyInfoPills` + `getCourseCompletion`).

- **2026-07-12** — Home header chip: no longer ink/active on landing; matches Sign out (paper stamp + rust hover) for signed-in and guest.

- **2026-07-12** — Dark mode toggle: black (ink) chip in light mode, light (paper) chip in dark mode — fixed hex so theme tokens don’t invert it; applies site-wide via `DarkModeToggle`.

- **2026-07-12** — LO header “Back to course overview”: light orange fill/border/text highlight.

- **2026-07-12** — LO header atmosphere flipped to the left (sideboard/lamps/light) so Dashboard/Home/Dark/Sign out no longer cover it; paper fade strengthens toward the right.

- **2026-07-12** — Header wordmark: only “Curve” in orange on SiteHeader + LO study header.

- **2026-07-12** — LO header meta row: “Back to course overview” link on the right opposite XP / streak / % done.

- **2026-07-12** — LO header polish: XP/streak/% as small info pills on a quiet bottom meta row; primary row = brand + Now studying | site controls; tighter mobile chips; header focus/caret reverted to orange across `.site-header` (not gold).

- **2026-07-12** — LO study header: right side uses the exact site controls (`SiteHeaderControls` — Dashboard / Home / Dark / Sign out); XP, streak, and % complete sit on the left with logo + “Now studying”.

- **2026-07-12** — LO study header redesign (`PmqCourseHeader` + `LoHeaderAtmosphere`): logo + wordmark, XP/streak/% stamps, Course/Dashboard/Sign out stamp chips moved up from page body; living-room ambient bar (lamp sway / light breathe). Removed duplicate nav row under LO title.

- **2026-07-12** — Dashboard “home” backdrop: mid-century living-room SVG (`DashboardHomeScene` / `DashboardBackdrop`) from living-room inspo, LIC tokens; continuous lamp sway, shadow drift, light breathe, radio dial pulse; cream fade keeps left-column copy readable. Reduced-motion → static scene.

- **2026-07-12** — Complete LO âœ“ celebration on day-card open: stamp slam + olive ring burst + gold/olive sparks (`lo-complete-celebrate` in `PmqDayPlan.tsx` / `globals.css`); reduced-motion shows static âœ“ only.

- **2026-07-12** — Reverted complete-LO “DONE” rubber-stamp / olive-wash treatment; back to corner olive âœ“ stamp.

- **2026-07-12** — Complete LO cards: dropped olive border highlight; completion shown as a corner olive âœ“ stamp (top-right, pop-in) instead of in-header badge.

- **2026-07-12** — PMQ day cards: single-row layout (title Â· progress Â· bold Open/Close stamp); narrower height; LO grid uses staggered `day-lo-in` animation on expand (`PmqDayPlan.tsx` + `globals.css`).

- **2026-07-12** — PMQ overview: removed course-level “% complete” pill; each Day 1–5 card now has a stamped completion bar (`completed/total` from LOs with `completed_at`). Complete LOs get a âœ“ chip. Query: `getCompletedSectionIds`.

- **2026-07-12** — Quiz dropdown blanks: fixed overlapping “Choose…” pills when blanks wrap (`my-1.5`, `align-middle`, taller `leading-[2.15]`). Applied in `QuizRunner.tsx` + `MockExamRunner.tsx`.

- **2026-07-11** — Header: removed gold ring outline on Dashboard CTA when active; dashboard page: removed duplicate Sign out next to “Your courses” (sign-out stays in the header).

- **2026-07-11** — Dashboard unlocked Sly strip: swapped “unlocked” copy for a bold fair-usage meter (`% left` + stamped fill bar; olive → orange → rust). Usage from `getAiTutorFairUsageSummary` / `summarizeFairUsage` (token spend vs `PAID_FAIR_USAGE_BUDGET_USD`).

- **2026-07-11** — Dashboard Sly strip polish/layout: one-line row (face Â· Sly Â· compact Unlock); lock badge removed; cream/heavy tutor chrome dropped; “What’s included” is a quiet example list under the row.

- **2026-07-11** — Dashboard PMQ card (`adapt`): study block enlarged (bigger title + taller Continue studying CTA); AI tutor strip compacted and named **Sly** with fox-face mascot (`public/mascot/fox-face.svg` from `brand/Mascot/`). Unlock CTA: “Unlock Sly — Â£…”.

- **2026-07-11** — Dashboard PMQ card polish: **Continue studying** is the primary full-width CTA; Unlock tutor demoted to compact secondary `size="sm"` (`AiTutorUpgradeCta`).

- **2026-07-11** — Dashboard PMQ card: removed “Â£5 one-time” label next to AI tutor (price remains on the Unlock CTA).

- **2026-07-11** — Dashboard PMQ card polish: “What’s included” is an inline grid-rows expand (chevron) instead of a `<dialog>`; unlock CTA stays always visible in-card.

- **2026-07-11** — Dashboard PMQ card redesign (`animate` + `harden`): dropped portal/accordion that painted over the footer. Card is self-contained — compact in-flow unlock + CTA; “What’s included” opens a native `<dialog>`. Truncate long titles, min-w-0 flex, reduced-motion-safe entrances.

- **2026-07-11** — Dashboard tutor details: switched from absolute-in-card to a **fixed** portal panel (`createPortal` + `getBoundingClientRect`). Absolute still extended document scroll overflow and shoved the flex sticky footer; fixed does not.

- **2026-07-11** — Dashboard PMQ card: smaller + left-aligned (`max-w-md`); tutor details expand as absolute overlay so the sticky-bottom site footer no longer jumps on open/close.

- **2026-07-11** — Dashboard: AI tutor unlock moved into the PMQ course ticket (`DashboardPmqCourseCard`) as a course-scoped collapsible strip (grid-rows expand, staggered benefit list, compact Stripe CTA). Removed the sibling sidebar CTA so each future course can own its own tutor unlock.

- **2026-07-11** — Sign-up success copy (`AuthForm.tsx`): dropped “or sign in if confirmation is disabled” — internal config note, not user-facing.

- **2026-07-11** — Header follow-up: removed outer stamped tray around controls; fixed Home chip invisible on landing (`bg-paper`/`text-ink` were winning over active `bg-ink`/`text-paper` — split idle vs active class sets).

- **2026-07-11** — Site header revamp (`/impeccable bolder` + `animate`): stamped control tray; signed-in **Dashboard** primary CTA; Home / Dark / Sign out as sticker chips (hover lift); guest keeps Sign up/in; staggered chip entrance + theme icon pop; thicker ink bar + scroll sticker shadow. LO routes still hide global header.

- **2026-07-11** — Common misconceptions interaction redesign: each item shows Mistake N + text, then “Reveal the correction” chevron (toggle, olive open state, grid-rows expand). Removed nested sticker/rust/olive boxes.

- **2026-07-11** — LO section “Watch out” renamed to “Common misconceptions”.

- **2026-07-11** — Worked example interaction redesign: Scenario → Your turn → Reveal model answer (chevron control with hover/focus/open states, olive when open, grid-rows expand + slip-in). No nested content boxes.

- **2026-07-11** — LO “Apply it” renamed to “Worked example”; removed nested teal/inner boxes in `WorkedExampleBlock` so content sits directly in the section.

- **2026-07-11** — `/impeccable polish` on LO sections: removed header/content divider line; continuous padding rhythm; body text `15px` / 1.65 leading / full ink; softer quiz slips and checklist rows; definitions table less heavy for reading comfort.

- **2026-07-11** — Memory aids: removed the “N / M revealed” counter.

- **2026-07-11** — LO page: “Progress” renamed to “Checklist” and made always-open (not an accordion).

- **2026-07-11** — LO pages: removed `lo_code` (e.g. 3a, 3b) under the main title — title + APM objective only.

- **2026-07-11** — Simplified LO/quiz accordion visuals: dropped sand fill, open-stamp badge, and nested paper slips. Cards stay plain `bg-paper` with border + sticker shadow; expand/collapse motion kept.

- **2026-07-11** — LO page sections: Context, Outcomes, and Progress are collapsible; `LoAccordionSection` restyled to the Practice quiz ticket envelope (sand body, dashed header, chevron, grid-rows expand, slip entrance) so every LO heading shares one card language.

- **2026-07-11** — `/impeccable polish` + `animate` on quiz sets: one sand ticket envelope (sticker shadow on the set, not nested stickers); questions as paper “slips”; dashed header perforation; chevron rotate; grid-rows expand 380ms; staggered slip entrance (`--i` Ã— 45ms, capped); gold XP pills; reduced-motion kill-switch.

- **2026-07-11** — Expanded quiz sets in `QuizRunner`: header + questions sit in one ink-bordered `cream-2` panel so the ten cards read as a single set, not floating isolates.

- **2026-07-11** — Practice quiz UX: shell card keeps “Practice quiz” + Generate on the right; sets reveal one click at a time (Set 1 free → Sets 2/3 entitlement-gated). Marks removed; set headers and question cards show XP (sums into header XP via existing `submitQuizAttempt`). Dropdown blanks use olive/rust colour coding like MCQs. `PracticeQuizSection` replaces `GenerateQuizButton`.

- **2026-07-10** — LIC-22 Generate Quiz build (Cursor): `scripts/migrate-pmq-quiz-sets.mjs` (idempotent `quiz_set_2`/`quiz_set_3` → `questions`); `content-fallback` + `getPmqQuizSetQuestions`; entitlement-gated `getQuizSet`; `submitQuizAttempt` optional `context` (sets 2/3 never flip `quiz_completed_at`); `GenerateQuizButton` after set 1 on LO pages (locked → `AiTutorUpgradeCta`). **Blocked on migrate:** `.env.local` has empty `SUPABASE_SERVICE_ROLE_KEY` — run `node scripts/migrate-pmq-quiz-sets.mjs` after restoring the key. Leave LIC-22 In Review until browser-verified (do not mark Done yet).

- **2026-07-10** — Generated the full 30-question-per-LO quiz content bank across all 24 LOs (LIC-22), while Sim/Cursor worked on site UI in parallel. Added `quiz_set_2` and `quiz_set_3` (10 new questions each, ids continuing from the existing `quiz` array) to every `lo1.json`–`lo24.json`, plus matching `quiz_set_2_total_marks`/`quiz_set_3_total_marks`. Free tier = existing `quiz` (set 1); paid tier = sets 2 and 3, unlocked via the "Generate Quiz" button per LIC-22's spec. Hard constraint honoured: every new question was hand-authored directly from that LO's own curated JSON (key_definitions, core_content, worked_example, misconceptions, exam_technique) — the same PDF-derived material the existing bank draws from — nothing introduced from outside that source. Verified programmatically after each batch: valid JSON, exactly 10 questions per new set, no duplicate ids across all three sets per LO, only allowed types (`mcq`/`scenario_mcq`/`dropdown`) used. `QuizRunner.tsx` already takes questions as a generic prop, so no component changes needed to serve the new sets. LIC-22 moved to In Review with next action reassigned to Cursor: build the button/serving logic only — content work is done.

- **2026-07-10** — Homepage “Pick your exam” PMQ card “Start free” now uses `PmqStartLink` (unsigned → `/courses/pmq-in-5-days/preview`, signed-in → `/dashboard`) instead of `getCourseHref` straight into the course home.

- **2026-07-10** — Enrollment/overview LO cards in `PmqDayPlan`: lock icon sits on the same row as “LO n” (right-aligned); cards tightened (`p-3.5`, `text-base` titles, tighter gaps).

- **2026-07-10** — Enrollment preview LO cards: removed the “Locked” label text; lock icon only (still `aria-label="Locked"` for screen readers).

- **2026-07-10** — Enrollment “Start free” sticky: set `top` to `calc(78px + 5rem)` to match `section-pad`’s `sm:py-20`, so the card’s initial viewport Y equals the sticky threshold and it no longer slides up on the first scroll. Added max-height + overflow for short viewports.

- **2026-07-10** — Enrollment preview “Start free” card: restored sticky sidebar (`lg:sticky` below the 78px site header) so it stays put while the left column scrolls. Switched `body` from `overflow-x-hidden` to `overflow-x-clip` so sticky isn’t broken by the classic overflow-x containment bug.

- **2026-07-10** — Enrollment preview (`/courses/pmq-in-5-days/preview`): removed `sticky top-[90px]` from the “Start free” signup card so it stays in document flow and no longer slides while scrolling.

- **2026-07-10** — PMQ study-plan UX cleanup on course overview + enrollment preview: removed `lo_code` (1a/1b…) from LO cards; preview cards no longer use `opacity-70` or “Locked preview” copy (lock icon + “Locked” only); theme pills next to day headings removed. Reordered so What’s Included sits above the 5-day plan. Days 1–5 are QuizRunner-style collapsible boxes (collapsed by default) via shared `PmqDayPlan.tsx` (`mode="linked"` | `"locked"`).

- **2026-07-10** — Reverted homepage header fox run animation (Sim request). Removed `HeaderFoxRun.tsx`, restored `SiteHeader.tsx`, stripped fox-run CSS from `globals.css`.

- **2026-07-10 (later same day)** — Two things resolved in this session, one legal, one a correction. **Legal:** asked Sim directly whether to (a) fill in real placeholder content but keep the "not yet reviewed by a solicitor" banners until LIC-46 closes, or (b) remove the banners and publish all four legal docs as final now regardless. Sim chose (b) explicitly. Removed the draft banners from `TERMS_OF_SERVICE.md`, `PRIVACY_POLICY.md`, `COOKIE_NOTICE.md`, `RECRUITMENT_PRIVACY_NOTICE.md`; drafted real content for the previously-placeholder sections (ToS refund policy — 14-day no-questions-asked if unused, LIC-51; new fair-usage clause, LIC-55; liability cap sized at trailing-12-month amount paid, un-reviewed by a solicitor); fixed Privacy Policy Â§4/5's stale "Stripe/Gemini not currently in use" language (verified via Supabase: 1 user, 2 tutor messages — Sim's own trial only, not public) to say Gemini is in use for internal testing ahead of public launch. Removed an internal dev-note blockquote from the public Terms admitting the 94%-pass-rate/no-guarantee inconsistency (LIC-47) — the inconsistency itself is **not** fixed, just no longer narrated inside a live legal document; tracked in `legal/PRE_LAUNCH_CHECKLIST.md` and LIC-47. LIC-46 (solicitor review) stays open but downgraded High→Medium, Sim's own conscious deprioritization, not a resolved risk. **Correction:** while preparing a Cursor prompt for LIC-37/36/52/48, discovered `BUSINESS_STATE.md` already had a same-session entry claiming Cursor had shipped exactly that work (commit `375ef9c`) — before Claude had written it a prompt. Verified independently against the git object (`git show 375ef9c`, bypassing this sandbox's own corrupted index/truncated working-tree mount — same known sandbox-only issue as 2026-07-10 earlier entry, not a real file problem): the work is genuinely committed and matches the claim. Moved LIC-37/36/52/48 to In Review in Linear (not Done — still needs a real browser click-through) and marked the now-redundant `cursor-prompt-close-tutor-gap.md` as superseded rather than deleting it (sandbox can't reliably delete git-adjacent files here).

- **2026-07-10** — Closed the gap between LinkedIn-promised AI tutor features and what's actually shipped (LIC-37/36/52/48). **LIC-37:** new shared `AiTutorUpgradeCta.tsx` (LockedFeature visual language + `createAiTutorCheckout`) on dashboard, PMQ course overview, and inside `AiTutorPanel` (free-cap lock + always-visible compact unlock). Checkout action now accepts `{ loNumber?, returnPath? }`. **LIC-36:** free-tier 3-message cap was already in `/api/tutor/chat`; panel now routes the lock state through `AiTutorUpgradeCta` / fixed `LockedFeature` (was dropping children when locked). Paid fair-usage cap already present. **LIC-52:** course-completion summary already existed; also fires from `markSectionComplete` (LIC-32 path); free users who finish all 24 LOs see a LockedFeature teaser for the summary. **LIC-48:** restored "Not affiliated with or endorsed by APM." in `SiteFooter.tsx` (covers overview + LO pages via courses layout); checked off in `legal/PRE_LAUNCH_CHECKLIST.md`. Linear: no CLI here — move LIC-37/36/52/48 to In Review manually. Out of scope (as prompted): LIC-22, LIC-39/40.

- **2026-07-10** — Workflow change: Linear is now the single source of truth for outstanding work (see `CLAUDE.md` "Workflow" section, added this session). Reprioritized and rewrote the description of every open LIC issue (21 Backlog + 1 Todo) so each stands alone: Status / Decided / Next action, verified against actual repo and legal-doc state rather than copied from memory. Notable corrections made in the process: LIC-42 moved Backlog→**Done** (tutor backend is genuinely built and verified working as of 2026-07-09, ticket had been sitting in Todo despite being complete); LIC-52 and LIC-22 escalated to **Urgent** because Sim's 2026-07-09 LinkedIn post already publicly describes both features (weak-area summary, quiz generation) as if live — neither is built; LIC-36/37 (paywall mechanics) and LIC-49/50/51/55/45 (payments/legal) also set Urgent since `AI_TUTOR_LAUNCHED` is now `true` (for trial) and everything gated on that flag is live risk, not future risk. LIC-43 rewritten as a proper index of the launch gate in priority order. Full rationale for each ticket's priority now lives in the ticket itself, not just here.

- **2026-07-10** — URGENT check: Claude reported staged deletions of the AI tutor backend (`src/lib/tutor/*`, migration, `src/types/*`, `tailwind.config.ts`, `tsconfig.json`, survey function) with the same paths reappearing as untracked — risk of a commit deleting working code from history. **Verified on Cursor's local machine: that broken index state is NOT present.** No `.git/index.lock`. Files exist on disk. All listed paths are tracked in HEAD (`a200c34` / `989004b`). `git diff a200c34 -- src/lib/tutor/ supabase/migrations/ tailwind.config.ts tsconfig.json src/types/` is empty. Forced `git add src/lib/tutor/ src/types/ supabase/ tailwind.config.ts tsconfig.json` — no-op, nothing staged. **No restore commit made** (would have been a fake fix). Claude's report likely came from a sandbox/stale view that did not match this working tree. Verified `git status` output (paste):
  ```
  On branch master
  Untracked files:
    (use "git add <file>..." to include in what will be committed)
  	cursor-prompt-fix-broken-tutor-tracking.md

  nothing added to commit but untracked files present (use "git add" to track)
  ```
  After archiving that prompt, status should be clean aside from this log entry. Prompt archived to `cursor-prompts/archive/`.

- **2026-07-09** — Repo hygiene cleanup (Cursor). Removed stale empty `.git/index.lock` (no live git process), deleted `.next/` build cache. Committed ~3 days of uncommitted root-repo work in two commits (`a200c34` LIC-42 tutor backend + exam-technique removal; `a82ea1c` docs/legal + archived prompts). Archived completed handoff prompts to `cursor-prompts/archive/` (Wave 1/2, LIC-17/28/42, repo-hygiene). `.claude/settings.local.json` exists locally but is globally gitignored — not committed. Confirmed `tsconfig.tsbuildinfo` not tracked; `.gitignore` already correct. `.cursor/skills/ui-ux-pro-max/` showed no git diff — left as-is.

- **2026-07-09** — Attempted a repo hygiene cleanup (Sim's request, full autonomy given, "nothing built so far should be affected"). **Stopped short of any deletions — here's why, and what's actually needed from Sim/Cursor:**
  1. **Root repo has ~68 uncommitted files** (real feature work: this session's tutor unblock, plus prior Cursor sessions' src/ changes never checked in) and **a stale, empty `.git/index.lock`** dated 2026-07-08 21:31 that this session could not remove (`Operation not permitted`) — confirmed no live git process is holding it, so it's genuinely stale, but Claude's sandbox can't delete/write inside `.git/` on this mounted folder at all. **This blocks every git command** (`git add`/`commit` all fail on the same lock) — so no safety-checkpoint commit could be made before any cleanup. Given that, no deletions were attempted at all: the risk of removing something without a git fallback was too high. **Action needed from Sim (2 minutes, locally):** delete `.git/index.lock` in the repo root, then commit the pending work — this alone fixes the single biggest hygiene problem flagged repeatedly in this log (uncommitted work with no recovery point).
  2. **The separate `PMQ in 5 days` repo has the same stale-lock problem, plus something more concerning:** `git status` there shows **117 deleted files** (uncommitted) under `.claude/skills/impeccable/...` — the whole Impeccable design-critique skill folder is gone from disk but git still has it as tracked. Could be an intentional plugin uninstall, could be something else — **not touched, not committed, not investigated further** since it's the live production repo and the cause is unconfirmed. Sim should check this locally before anything else happens in that repo.
  3. **Confirmed but NOT deleted (needs Sim's own call, likely from Cursor or locally, not this sandbox):** `.next/` build cache (118MB, fully regenerable, zero risk) sat in root; the stale duplicate `PMQ in 5 days/JSON content/` folder (484K, flagged back on 2026-07-03 as unused dead weight, still not deleted — same "confirm first" caveat still applies); `.gitignore` itself already looks properly maintained (env files, node_modules, `.next`, JUNK/, tsconfig.tsbuildinfo, debug logs all covered) — no gap found there.
  4. **Reason for the sandbox restriction:** this Claude session's shell mounts the real project folder but apparently can't delete files in it (tested well beyond git internals — plain `rm -rf .next` failed the same way on every single file). Read this as a deliberate guardrail, not a bug to route around. **Practical implication for future sessions:** any actual file/folder deletion in this project needs to go through Cursor (which runs with real local access) or Sim directly — Claude can audit, flag, and edit file contents, but not delete.

- **2026-07-09** — Unblocked LIC-42 AI tutor for Sim's local trial. Cursor flagged two blockers: `AI_TUTOR_LAUNCHED` still `false` (panel stuck on "Coming soon") and the `tutor_messages` migration never applied to Supabase (chat load/save would 500). Flipped the flag to `true` in `src/lib/pmq/constants.ts` (comment updated to note this is a trial-only flip — revert or gate properly before any real deploy per LIC-49/50/51) and applied the existing `20260708120000_tutor_messages.sql` migration to the `learn-in-curve` Supabase project (`dbjoimidfbftammchnql`) via MCP — confirmed the table now exists and the referenced `courses` row (`3b6e12c0-...`, slug `pmq-in-5-days`) is present so inserts won't hit the FK. Confirmed `GEMINI_API_KEY` is set and Stripe keys in `.env.local` are test-mode, so no real-charge risk if the paid-unlock CTA gets clicked during testing. **Still required to actually chat:** Sim signs in via Supabase Auth — `DEMO_SKIP_AUTH` doesn't cover the tutor API routes. No other build changes made; quiz-history/entitlement data wasn't migrated (only affects grounding quality, not core chat, per Cursor's note). Separately surfaced: ~27 issues are sitting in "In Review" (Wave 1/2 backlog, e.g. LIC-5–34/38) — several prior entries said to move them manually because "no Linear CLI/MCP in this environment," which is no longer true (a Linear MCP is connected this session). Per the standing verify-before-trusting-"done" rule, none were bulk-closed without Sim confirming scope first.

- **2026-07-08** — Removed the "Exam technique" accordion section from all native LO pages (`src/app/courses/pmq-in-5-days/lo/[loNumber]/page.tsx`); deleted unused `ExamTechniqueBlock.tsx`. `exam_technique` data remains in LO JSON and tutor grounding — only the on-page section is gone.

- **2026-07-08** — LIC-42 AI tutor real chat backend built (not launched). Added `supabase/migrations/20260708120000_tutor_messages.sql` (`tutor_messages` with `input_tokens`/`output_tokens`, owner-only RLS select/insert/update). New tutor lib: `src/lib/tutor/callTutorModel.ts` (sole Gemini vendor code), `buildSystemPrompt.ts` (syllabus grounding + redirect few-shots per Â§2), `fair-usage.ts`, `tutor-db.ts`, `course-completion-summary.ts`. API: `src/app/api/tutor/chat/route.ts` (GET history + POST message with free-tier 3-message cap and paid ~$3.15 fair-usage token budget), `src/app/api/tutor/rating/route.ts` (thumbs → `rating`). Frontend: `AiTutorPanel.tsx` — persistent chat, send, ratings, `LockedFeature` for free/fair-usage caps + upgrade CTA (closes LIC-36/37 scope). Course-completion summary fires server-side from `maybeMarkQuizComplete` when all 24 `quiz_completed_at` rows exist and user has `ai_tutor` entitlement. **`AI_TUTOR_LAUNCHED` left `false`** — launch gate is Sim's explicit go-ahead after verification, not this build. Apply migration to Supabase before testing. Default model `gemini-2.5-flash` via `GEMINI_MODEL` env override. Linear: move LIC-42 (and LIC-36/37 if accepted as closed by this) to In Review manually.

- **2026-07-08** — LIC-28 quiz content rebuild completed (clean re-run). Rebuilt `PMQ in 5 days/content/lo2.json`–`lo24.json` via `scripts/rebuild-pmq-lo-quiz.mjs`: stripped all `long_form`/`short_recall` items, topped each LO to 10 MCQ/scenario_mcq/dropdown questions sourced only from that LO's `key_definitions`, `misconceptions`, and `exam_technique.command_words`; renumbered ids and recomputed `quiz_total_marks`. Committed incrementally in the `PMQ in 5 days` repo (`3b99b53` lo2–6, `1950705` lo7–11, `17b5139` lo12–16, `f056fa4` lo17–21, `9ba8127` lo22–24, `f82c8b1` `_schema.json` note). `lo1.json` untouched. **Validation pass (all 23 files):** `lo2`–`lo24` each `JSON.parse PASS`; zero legacy types; 10 questions each (12–14 marks); `quiz_total_marks` matches sum; `_schema.json` quiz type enum still valid. Full output: `ALL 23 FILES VALID`. Supabase migration (Part 2) explicitly out of scope here — Claude runs via MCP. Linear: move LIC-28 to In Review (no `gh`/Linear CLI in this environment).

- **2026-07-08** — LIC-17: fixed LO-per-day grouping on the native PMQ course overview and LO pages. Root cause: native app grouped by each `loN.json` `day` field (and matching Supabase `sections.day` rows), but the live PMQ in 5 days site uses the hardcoded `DAY_LOS` map in `PMQ in 5 days/scripts/app.js` — five sequential LOs per day. JSON `day` is wrong for LO4 (says 2, should be 1) and LO5 (says 3, should be 1). Fix: added `PMQ_DAY_LOS` + `getDayForLo()` in `src/lib/pmq/constants.ts`; `groupSectionsByDay`, `getPmqSections`, `getPmqLoPageData`, and `content-fallback.ts` now derive day from LO number via that map instead of trusting stored `day`. Linear: move LIC-17 to In Review manually (no Linear CLI/MCP in this environment). Opening any LO page now ticks the streak once per UTC calendar day (no quiz attempt required), and a new shared `src/components/LockedFeature.tsx` component was added for consistent locked-feature rendering in Wave 3. Reason: keep passive study streaks honest and standardize the locked-state UI primitive before deeper Phase B rebuilds.
- **2026-07-08** — Wave 2 LO-template cluster shipped for In Review (LIC-33/34/20/32/24/21). LO pages now hide the global branded `SiteHeader` (client pathname guard) and remove the LO breadcrumb, keeping only the sticky `PmqCourseHeader` (“Now studying / PMQ in 5 days”) (`src/components/SiteHeader.tsx`, `src/components/pmq/PmqCourseHeader.tsx`, `src/app/courses/pmq-in-5-days/lo/[loNumber]/page.tsx`). The requested LO UX improvements are in place: collapsed-by-default accordions for Definitions/Core content/Apply it/Watch out/Exam technique/Memory aids/Recap, a “Mark this Learning Objective as Complete” button with a journey-path full-screen animation, misconceptions now reveal correct-after-click, and quiz options now click-to-reveal and lock the question (no “Check answer” button) (`LoAccordionSection.tsx`, `LoCompleteButton.tsx`, `MisconceptionsList.tsx`, `QuizRunner.tsx`). Reason: reduce cognitive load on LO pages and tighten the click-to-learn feedback loop to match the homepage quiz UX.

- **2026-07-08** — Wave 1 mechanical/copy/quick-bug tickets shipped for In Review (LIC-5,6,7,8,9,14,16,23,25,29,30,38). Prior uncommitted src work was already in checkpoint `09cc112` (2026-07-07 15:48); left Claude's parallel uncommitted specs (`AI_TUTOR_*`, `ANALYTICS_SPEC`, `REAL_MOCK_EXAM_SPEC`, etc.) untouched. Stale empty `.git/index.lock` removed after confirming no live git process. Changes: removed hero "See how it works" (`page.tsx`); boarding-pass "Free resource" + dropped "gamified" line (`HeroBoardingPass.tsx`); removed header "Courses" nav; exam technique no longer renders command-words table or "Golden rule" prefix (`ExamTechniqueBlock.tsx` — data kept); removed per-LO "Go deeper" section (overview Further Reading untouched); memory aids → full-width 3-col grid (`MemoryAidsList.tsx`); stripped user-visible "gamified"/"Gamified" across `src/` + Privacy XP row (code identifiers like `isGamifiedResult` kept); study-plan day cards lost the duplicate theme pill (`PmqOverview.tsx`); Demo banner now also gated on `!isSignedIn` so a real session never sees it even with `DEMO_SKIP_AUTH=true` (LIC-14 confirmed as hardening, not a pure false alarm); header guest CTA uses `lic_has_account` → "Sign in" vs "Sign up" (`SiteHeader.tsx`); Intercom via `IntercomProvider` + footer `SendFeedbackButton` calling `Intercom('show')`, no-op without `NEXT_PUBLIC_INTERCOM_APP_ID`. Legal: Cookie Notice + Privacy Â§3/Â§4 + PRE_LAUNCH_CHECKLIST annotated for dormant Intercom — **do not put App ID in production until consent/DPA catch up** (informal flag, not solicitor sign-off). Linear: no `gh`/Linear CLI/MCP in this environment — Sim/Claude please move those 12 tickets to In Review manually.

- **2026-07-08** — Expanded the PMQ paid-upgrade model: the Â£5 one-time unlock (previously AI-tutor-only, see 2026-07-03 entry below) now covers three things bundled under a single upgrade — unlimited AI tutor messaging (free tier capped at 3 messages before lock + upgrade prompt), unlimited quiz generation beyond the first free 10-question set per LO (LIC-22), and a new "Real Mock Exam" feature with short/long-form AI-assessed answers (LIC-40, still needs its own spec). **Reasoning shift worth flagging:** the original AI-tutor-only paywall was justified by marginal cost — live Claude API calls scale with usage. Quiz generation doesn't share that justification: LIC-22 was decided to be pre-generated/static content, same cost profile as what's already free. So bundling it into the Â£5 upgrade is a value-metering choice, not a cost-recovery one — Sim made this call explicitly after a bundle-vs-stacked-paywalls discussion; logging the "why" so it isn't lost later. Upgrade CTA needs to appear in three places: dashboard, PMQ homepage, AI tutor chat window (LIC-37). Also decided this session: standard free mock exam restricted to MCQ/dropdown only (LIC-39), matching the broader LO2–24 quiz-type cleanup (LIC-28); in-app feedback widget originally planned via a new Supabase `feedback` table rather than a mailto: link (LIC-38) — **superseded later the same day, see the Wave 1 entry above: now built on Intercom Messenger instead**; versioning convention set — first public launch tags v2.0, +0.1 per git push thereafter unless Sim explicitly calls a bigger jump (now in `CLAUDE.md`). Full backlog for this batch: LIC-20 through LIC-41 in Linear (Learn in Curve is now its own Linear team, key `LIC`, replacing the old `SIM` prefix — team reorg also done this session).

- **2026-07-07** — Re-hosted the survey backend as a Supabase Edge Function
  instead of the Next.js `/survey/[token]` page, after realizing neither
  website could actually serve it today: the new Learn in Curve platform
  isn't deployed anywhere, and the live "PMQ in 5 days" site
  (`pmqin5days.learnincurve.com`) is a pure static-file Caddy `file_server`
  with no backend at all — permission to touch that folder was granted this
  session, but there's nothing to bolt a dynamic endpoint onto without adding
  a new server, which the Edge Function makes unnecessary. New file:
  `supabase/functions/survey/index.ts`, deployed to the `learn-in-curve`
  Supabase project (`dbjoimidfbftammchnql`), `verify_jwt: false` (the
  per-recipient token is the auth). Same click → record → branch flow as the
  original Next.js page (kept in place for whenever that app deploys). Live
  URL: `https://dbjoimidfbftammchnql.supabase.co/functions/v1/survey?token=<uuid>&r=<1-5>`.
  Caught and fixed two real bugs during testing: (1) `req.url`'s origin/path
  inside the edge runtime don't match the public `/functions/v1/survey`
  invocation URL — had to hardcode the public base rather than derive it;
  (2) GET `<form>` submission replaces the action URL's query string
  entirely rather than appending to it, so `token` had to be added as a
  hidden input on both free-text forms, not just carried in the action URL.
  Verified end-to-end via direct HTTP calls to both branches (negative:
  r=1→l=n→improve-text form; positive: r=5→l=y→a=y→note form→done) and
  confirmed the DB row updates correctly at each step before touching the
  real Gmail draft. Also adopted Sim's own edit of the email copy (shorter
  opening line, dropped the "clicking is the whole thing" explainer) as the
  new canonical wording — kept the "not affiliated with APM" footer
  disclaimer by default since it wasn't clear it was intentionally cut
  (flagged to Sim, not removed silently). New Gmail draft created to Sim's
  own address for visual + link review — **not sent**, per Sim's standing
  rule to never send any email without asking first. Old draft (pointing at
  the incorrect `learnincurve.com` links) still sits in Drafts and should be
  deleted once the new one is confirmed.

- **2026-07-07 (later same day)** — Sim tested the draft and Gmail showed a
  "Redirect Notice" interstitial on the raw `*.supabase.co` link before
  letting the click through. Root cause: a long, machine-generated
  subdomain of a shared hosting domain (supabase.co) is a common phishing
  signature, so Gmail's link-safety scanning doesn't treat it as a trusted
  destination and inserts a click-through warning — the link itself was
  never broken. Fix: added a `handle_path /survey*` block to
  `PMQ in 5 days/Caddyfile` that reverse-proxies to the same Edge Function,
  so the **email links** now point at
  `https://pmqin5days.learnincurve.com/survey?token=<uuid>&r=<1-5>` — a
  domain the 43 recipients already know and have already used, which
  shouldn't trip the same heuristic. Only the five entry links in the email
  template changed; the Edge Function's own internal Yes/No/form links
  (steps 2–4) still point at the raw `supabase.co` URL on purpose — those
  are normal in-browser link clicks after landing on the page, not links
  inside an email, so Gmail's interstitial doesn't apply to them and no
  extra deploy dependency is needed there.
  **Blocking:** this fix only takes effect once the `PMQ in 5 days` repo
  (separate git remote, `pmq-in-5-days.git`) is redeployed with the updated
  Caddyfile — editing the file locally doesn't change the live site. Until
  that deploy happens, `pmqin5days.learnincurve.com/survey` will 404; the
  raw `supabase.co` link still works (with the Gmail warning) as a fallback.
  Do not send the real batch until (a) the Caddy change is deployed and (b)
  Sim has re-tested the new draft end to end.

- **2026-07-06** — Built the user feedback survey for the 43 deduped emails
  from the old "PMQ in 5 days" `public.emails` table (see the entry below on
  the 71-vs-43 duplicate finding). Zero-JS, click-through design: rating
  (1–5, standard emoji, "Got 10 seconds?" header) embedded directly in the
  email, landing on a server-rendered `/survey/[token]` page for a universal
  login-trouble yes/no, then a score-branch (1–2 gets an open "what could we
  improve" text box; 3–5 gets "we're about to launch a free gamified upgrade
  incl. an AI tutor, want early access?" yes/no), then one optional closing
  text box. New Supabase tables in `learn-in-curve`
  (`survey_invites`: email/token/source; `survey_responses`: rating/
  login_issue/early_access/improve_text/additional_text, upserted per click)
  — RLS locked to service-role only, no anon access, so a token can't be used
  to read anyone else's response. New page:
  `src/app/survey/[token]/page.tsx` — deliberately outside the `(site)/`
  route group so it renders standalone (no header/footer chrome), reads
  everything from `searchParams`, records on the server before rendering the
  next step. Email template saved at
  `scripts/survey-email-template.html` for reuse across the real batch.
  Generated one test invite (`simsamaarshened@gmail.com`, source
  `test_send`) and created a **Gmail draft** (not sent — user's explicit
  rule this session: never send without asking first) via the connected
  Gmail MCP, so the actual visual/copy can be reviewed before anything goes
  near the 43. **Known gap, flagged directly to the user:** the email's links
  point at `https://learnincurve.com`, which is not deployed anywhere yet —
  checked `.env.local` (no `NEXT_PUBLIC_APP_URL`), no Railway/Vercel config,
  no deploy script. So today's draft is a visual/copy review only, not yet a
  working end-to-end click test — the same draft becomes fully functional
  the moment the site has a real live URL, no template changes needed. Only
  1 of 43 real invite rows exists (the test one); generating the other 42
  and actually sending is explicitly gated on the user's go-ahead, not
  assumed.

- **2026-07-06** — Audited whether the 2026-07-03 documentation-discipline
  setup (`.cursor/rules/documentation-discipline.mdc`) is actually keeping
  `BUSINESS_STATE.md`/`docs/roadmap.md` in sync with what Cursor ships.
  **Verdict: partially working — better than feared, but real gaps
  confirmed.** On the positive side: when Cursor removed the "Not affiliated
  with APM" line from `SiteFooter.tsx` today, it *did* follow the rule and
  annotate `legal/PRE_LAUNCH_CHECKLIST.md` itself (see that file's
  disclaimer item) — the rule clearly fires sometimes. But real gaps found:
  (1) the Stripe checkout + webhook code (logged above) shipped with no
  decision-log entry of its own — found only by grepping the code today;
  (2) `docs/roadmap.md` had three stale checkboxes despite the rule's
  explicit instruction to update them — Gamification Phase A (shipped,
  logged 2026-07-03) still showed fully open, the brand kit (built
  2026-07-01/02) still showed not started, and Stripe integration showed not
  started despite the code existing. Corrected all three today, each
  annotated with why it was stale. **Bigger, separate finding — not what was
  asked but too important not to flag:** `git log` shows the last commit was
  2026-07-03 17:09; every substantive thing since then (all four legal docs,
  careers page, gamification, native LO migration work, Stripe integration,
  everything in today's session) exists only as uncommitted working-tree
  changes — `git status` showed dozens of modified/untracked files, zero
  checkpoints for 3 days of legally- and financially-relevant work. Given
  both the confirmed Rule gaps and this much bigger git-safety gap,
  implemented the hook-based backstop flagged as an option back on
  2026-07-03. Researched Cursor's current hook system first rather than
  trust stale knowledge (v1.7+, beta: `beforeSubmitPrompt`,
  `beforeShellExecution`, `beforeMCPExecution`, `beforeReadFile`,
  `afterFileEdit`, `stop` — confirmed via cursor.com/docs/hooks and a
  GitButler deep-dive on the same feature). Added
  `.cursor/hooks/git-checkpoint.mjs`, registered as a new `stop` entry in
  `.cursor/hooks.json` alongside the existing, unrelated `preToolUse` entry
  from the Impeccable design-critique skill (left untouched) — commits
  whatever changed at the end of every Cursor turn, so a git checkpoint
  always exists regardless of whether anyone remembers to commit. It also
  does a mechanical (not LLM-judged) check: if `src/`/`legal/`/`docs/`
  changed but `BUSINESS_STATE.md` didn't, it logs a WARNING to
  `.cursor/checkpoint.log` — informational only, since Cursor's `stop` hook
  can't block or message the agent back (confirmed via the same research;
  only the `before*` hooks can). **Known, stated tradeoff:** this produces
  frequent un-curated "Cursor checkpoint: <timestamp>" commits rather than
  clean history — an intentional choice given 3 days of zero commits;
  squash later for a real release if wanted. The Rule still does the actual
  thinking about *what* to log and *why* — the hook only guarantees a
  recovery point exists and surfaces drift. Also tidied `.gitignore`
  (`.cursor/debug-*.log`, `.cursor/checkpoint.log`, `tsconfig.tsbuildinfo`,
  `.impeccable/config.local.json`) so the auto-commit doesn't sweep in junk.
  **Not done:** commit messages aren't descriptive (would need to correlate
  `beforeSubmitPrompt` prompt text with `stop`'s IDs across hook
  invocations — more plumbing than today's scope), and today's existing
  backlog of uncommitted work hasn't been committed yet — the hook covers it
  next time Cursor finishes a turn, but it should be committed by hand
  sooner if that's not imminent. **Also surfaced during this audit, separate
  from the hook work:** the APM-disclaimer removal above reopens
  `legal/PRE_LAUNCH_CHECKLIST.md`'s "visible on course pages" item — it's
  now not visible on any page by default (only inside the linked Terms
  document), which is a step down from where it stood this morning, not
  neutral. Flagged to the user as a live, current compliance question, not
  assumed resolved.
- **2026-07-06** — Hero "Start free with PMQ" CTA (`PmqStartLink`) routes by auth state: signed in → `/dashboard`, returning visitor with account (localStorage `lic_has_account`) → `/auth/sign-in`, new visitor → `/auth/sign-up`. Flag set on successful sign-up/sign-in/OAuth start in `AuthForm.tsx`.
- **2026-07-06** — Header nav simplified in `SiteHeader.tsx`: removed About and Careers links; added Home (stroke house icon + label on desktop, icon-only button on mobile) beside the dark mode toggle.
- **2026-07-06** — Debugged homepage dark mode + quiz demo both dead: corrupted `.next` caused 404 on `main-app.js` / `app-pages-internals.js` (no React hydration). Fix: kill dev server, delete `.next`, restart `npm run dev`. Dark toggle also now reads theme state from DOM to avoid stale React state. (`DarkModeToggle.tsx`, CSS variable theme in `globals.css`/`tailwind.config.ts`) in header left of About; header/footer "Dashboard" labels changed to "Sign in"; fox mascot removed from homepage hero again; boarding pass stamp simplified to "PASS GUARANTEED" and "AI tutor included" added to feature list. across `src/` components/pages and the four published `legal/*.md` docs; replaced with hyphens. Code comments unchanged.
- **2026-07-06** — Removed "Not affiliated with APM." from `SiteFooter.tsx` bottom bar per user request.
- **2026-07-06** — Pushed toward today's public launch. Found the AI tutor
  already had a real, wired Stripe checkout + webhook
  (`src/app/api/stripe/webhook/route.ts`, `createAiTutorCheckout` in
  `src/lib/pmq/actions.ts`) — undocumented since the last session, so someone
  could currently pay Â£5 for a feature that's just a "launching soon" message.
  Fixed by adding an `AI_TUTOR_LAUNCHED` flag (`src/lib/pmq/constants.ts`,
  currently `false`) — `AiTutorPanel.tsx` now shows a "Coming soon" state (no
  unlock button, no checkout call) regardless of entitlement, whenever the
  flag is off. Flip it to `true` once the tutor itself actually exists;
  everything in `legal/PRE_LAUNCH_CHECKLIST.md` Â§4 (Stripe live mode, PCI SAQ
  A, DPAs, refund policy) becomes blocking again at that point. Also added a
  required "I agree to the Terms and Privacy Policy" checkbox to
  `AuthForm.tsx` (blocks both email and Google sign-up paths) — closes a real
  gap since personal data collection starts at sign-up regardless of
  payments. Finalized all four `legal/*.md` docs' placeholder text (dates,
  international-transfer wording, retention windows, refund section,
  governing law) — see `PRE_LAUNCH_CHECKLIST.md` Â§2 for the full breakdown.
  Two items were consciously *deferred*, not resolved: solicitor review of
  the docs, and the homepage's "94% pass rate" stat vs. the Terms' "no
  guarantee" disclaimer (user's call: fix later with other staff). Both are
  logged as accepted risk in the checklist, not silently dropped. Confirmed
  UK/England & Wales governing law with the user. Confirmed the "not
  affiliated with APM" footer disclaimer already renders on every
  `/courses/*` route via `src/app/courses/layout.tsx` — no fix needed there.
  Drafted a LinkedIn launch post reflecting the actual shipped scope (PMQ
  free, AI tutor coming soon) — deliberately excludes the pass-rate stat from
  the post copy, so a viral/wider-reach post doesn't amplify a
  known-unresolved compliance risk.
- **2026-07-06** — Practice quiz on LO pages now starts collapsed (`QuizRunner.tsx` default `expanded: false`); user must click the header to open questions. Previously defaulted expanded.
- **2026-07-04** — User reports all 24 LOs are now migrated natively, with "some fixes required," to continue 2026-07-05. **Not yet independently verified** — a direct DB check the same day still showed only 1 row in `sections`/`lessons` and 11 in `questions` (LO1 only), and `list_migrations` shows nothing new since `fix_section_progress_missing_columns` (2026-07-03). Could mean the insert happened via a non-migration script not yet visible here, or hasn't actually landed — needs a fresh DB check at the start of the next session before trusting the dashboard's completion %.
- **2026-07-03** — Reverted the illustrated footer band (`FooterIllustration.tsx` deleted, `SiteFooter.tsx` back to plain `bg-ink` columns) — user review: the flat SVG scene didn't land visually. Fox mascot on homepage unchanged.
- **2026-07-03** — Fox mascot on homepage + illustrated footer band shipped in Cursor. Mascot: copied `brand/Mascot/Fox mascot - Full body.svg` → `public/mascot/fox-full-body.svg`, placed in the homepage hero (`src/app/(site)/page.tsx`) beside `HeroBoardingPass` with `mascot-bob` keyframes in `globals.css` (`motion-safe:`). Replaces the retired raccoon concept; arch/blob hero shapes stay cut per `DESIGN.md`. Footer: new `FooterIllustration.tsx` (flat SVG study scene — book hills, lamp sun, olive tree, bench reader) with existing `SiteFooter.tsx` nav overlaid and a distinct `bg-ink` bottom bar (logo + copyright + APM disclaimer). Mobbin Duna pattern for structure only; palette from existing tokens. *(Footer portion reverted same day — see entry above.)*
- **2026-07-04** — Fox mascot artwork finalized (generated externally, not the earlier raccoon concept) and dropped into `brand/Mascot/` (`Fox mascot - Full body.svg`, `Fox mascot - Face.svg`) — no bandit mask, kept deliberately simple/flat per the user's steer away from the "vigilante" raccoon direction. Brainstormed alternatives to raccoon first (fox, badger, magpie/crow, heron, tortoise, an abstract curve-mark character) before the user picked fox. Also scoped a footer rebuild inspired by a Mobbin reference (Duna's illustrated-band-plus-dark-bottom-bar pattern) using `brand/Inspo/` as mood/palette reference only, not literal art — user chose (via explicit question) to have Cursor build this as flat SVG/CSS in the existing brand system rather than generating a separate painterly image first, to stay consistent with `DESIGN.md`'s "flat illustration, not photoreal" rule and avoid a blocking external step. Handed both to Cursor as `cursor-prompt-mascot-and-footer.md`. This reverses the 2026-07-02 "mascot removed, don't reintroduce without sign-off" note in `DESIGN.md` — that sign-off is this decision.
- **2026-07-03** — Researched real careers-page patterns via the Mobbin MCP (connected, previously used for Brand Kit v2 research per the 2026-07-01 entry) to design a proper `/careers` page replacing the two placeholder role listings ("Content author (contract)", "Full-stack engineer") that lived directly in `SiteFooter.tsx`. Landed on a structural blend: Clay's minimal eyebrow→headline→two-paragraphs→contact-line rhythm (mobbin.com/sites/sections/d849986c-5e2d-4243-bdc2-9e13a3a1db80), Jeton's direct "no open roles at this time" framing rather than an apologetic one (mobbin.com/sites/sections/658f06c7-2c20-4c09-a057-ff7bce698fe2), and Homerun's tone for the "sort of people we want" line (mobbin.com/sites/sections/3994b587-46fb-4638-ab2c-bbcd09294ca1) — translated into Learn in Curve's own tokens, not copied literally. Also closes a previously-flagged gap: the Recruitment Privacy Notice had no page or link anywhere; it now gets one (`/recruitment-privacy`, same read-from-`legal/*.md` pattern as the other three legal pages) linked both from the new careers page and the footer's LEGAL column. Handed to Cursor as `cursor-prompt-careers-page.md` rather than built directly this time, since the user explicitly asked for a Cursor prompt as the deliverable. This is also the first real change routed through the new `.cursor/rules/documentation-discipline.mdc` workflow — Cursor's own execution of this prompt should log itself here without Claude needing to re-log it afterward; worth checking that it actually did once it lands.
- **2026-07-03** — Set up a workflow so direct Cursor tweaks (bypassing Claude) don't cause drift: added `.cursor/rules/documentation-discipline.mdc` (new Cursor Rule, `alwaysApply: true`, loads automatically every Cursor session alongside the existing `.cursor/rules/project-context.mdc`). Instructs Cursor to log a decision-log entry here, update `docs/roadmap.md` checkboxes, and check `legal/PRE_LAUNCH_CHECKLIST.md` after every change, however small — since Claude reads this file fresh every session, whatever Cursor logs here is automatically what Claude picks up next time, no manual bridging needed. Also added `CLAUDE.md`'s "Informal legal advisor mode" working preference this same session, and confirmed via web search that Cursor Hooks (`hooks.json`, e.g. a `stop` hook) exist as a stronger, script-enforced backstop if the Rules-based approach (which depends on Cursor's agent actually following the instruction, not a hard guarantee) turns out not to be reliable enough in practice — not implemented yet, flagged as a future option rather than guessed at.
- **2026-07-03** — Filled two placeholders that were previously flagged as "don't guess, ask": contact email across all four legal docs is now simsamaarshened@gmail.com (replacing the placeholder hello@learnincurve.com), and the Privacy Policy's data-controller name field is now "Sim Samaar Shened" (as an individual, since the entity isn't incorporated — this doesn't resolve the incorporate-or-not decision, just names a real person per UK GDPR's identification requirement). Also made the footer's Privacy/Terms links real: added `/privacy`, `/terms`, `/cookies` pages under `(site)/` that render `legal/*.md` directly (via the existing `MarkdownBlock`/`react-markdown` component already used for LO content) rather than duplicating the text, so the live pages can't drift from the reviewed source docs. `SiteFooter.tsx`'s "Privacy (soon)"/"Terms (soon)" placeholder spans replaced with working links; added a Cookies link alongside them. Deliberately left for a future pass (per user's explicit scope choice): no page/link yet for the Recruitment Privacy Notice, and the footer's own "Contact" mailto still says hello@learnincurve.com (distinct from the legal docs' email — flagged in the checklist rather than changed without being asked). `legal/PRE_LAUNCH_CHECKLIST.md` updated to check off what's now resolved.
- **2026-07-03** — First-draft legal docs written while Cursor worked on the site-shell/dashboard build: `legal/PRIVACY_POLICY.md`, `legal/TERMS_OF_SERVICE.md`, `legal/COOKIE_NOTICE.md`, `legal/RECRUITMENT_PRIVACY_NOTICE.md` (new `legal/` folder). Confirmed with the user: Learn in Curve is not yet incorporated (sole trader/pre-incorporation) — docs use a trading-name placeholder pending a real legal-entity name, and flag incorporating before Stripe payments go live as worth considering (not decided, just surfaced). Grounded in the actual schema rather than generic templates: data table in the privacy policy maps 1:1 to real Supabase tables (entitlements, feature_entitlements, attempts, section_progress, user_course_stats, exam_sessions, certificates, newsletter_subscribers); cookie notice confirms (via `package.json`) no analytics/tracking libraries are installed anywhere, so only the Supabase auth session cookie exists today and no consent banner is currently required. Flagged one real legal-risk item in the Terms draft: the homepage's hardcoded "94% pass rate" stat (`StatBand.tsx`, already noted as placeholder in `REBUILD_PLAN.md` section 3) sits awkwardly next to a "no guarantee of exam success" disclaimer — recommend replacing with a real measured number or softer copy before publishing to real users, this is an ASA/consumer-protection consideration, not just a copy nit. All four docs are explicitly marked first-draft/not-legal-advice pending solicitor review — none are wired into the site yet (footer still shows "Privacy (soon)"/"Terms (soon)" as plain text); that page-creation + footer-linking step is separate follow-up work once content is approved.
- **2026-07-03** — Audited the live build against a user screenshot + a long list of new asks, and found/fixed a real bug: `section_progress` was missing `course_id` and `checklist_state` columns that `actions.ts` (`maybeMarkQuizComplete`, `updateCheckpointProgress`) has always written to — every checkbox check and quiz-completion write has been silently failing at the DB level since Phase A shipped, which explains the reported "no complete section" issue. Fixed directly via migration `fix_section_progress_missing_columns` on `dbjoimidfbftammchnql` (added `course_id`, `checklist_state` default `[]`, and a new `completed_at` for the LO-completion concept below) — no Cursor action needed for this specific fix. Separately diagnosed (not a bug): reported "XP doesn't add up" is `DEMO_SKIP_AUTH=true` correctly bypassing all DB writes for anonymous browsing, by design — resolves once real sign-in is required. Wrote `SITE_SHELL_DASHBOARD_SPEC.md` covering everything else asked for: global header/footer on all `/courses/*` routes (currently missing entirely), a sticky course sub-header with XP/streak/completion (replacing the non-sticky `PmqCourseHeader`), an auth-flow fix so both email and Google sign-in always land on `/dashboard` (currently inconsistent — email already does, OAuth callback honors `?next=` instead), a real dashboard course-status card (streak, completion %, animated marker reusing `JourneyPath`'s visual language, replacing the plain course-list dashboard), a new "LO complete" concept (quiz done AND all checkpoints checked) feeding a course-wide completion %, a QA-only override to bypass that gate during testing, a collapsible quiz section, gamified flip-to-reveal memory aid cards, and consolidating each LO section's duplicate heading (small red tag + separate differently-worded `<h2>`) down to one. Flagged one dependency: course completion % can only ever show 1/24 until the already-spec'd full 24-LO migration (`PMQ_NATIVE_MIGRATION.md` Â§7) runs, since only LO1 has a real `sections` row today.
- **2026-07-03** — Gamification Phase A shipped by Cursor per `GAMIFICATION_SPEC.md` — verified the diff (`src/lib/pmq/actions.ts`, `QuizRunner.tsx`) matches spec. `submitQuizAttempt` now awards XP (+10 correct MCQ/dropdown, +2 flat on reveal, +0 wrong) and upserts `user_course_stats` with UTC-day streak logic, returning `{ ok, xpAwarded, totalXp, currentStreak }`. New `XpStreakBar` (presentational pill) and `LoProgressRing` (journey-path-style SVG ring) components; `QuizRunner` lifted XP/streak into local state, ported `QuizDemo`'s fly-up `+N XP` animation, calls `router.refresh()` after each answer to update the ring without a full reload. Existing MCQ/dropdown correctness colors, `attempts` insert, and `section_progress` checkpoint flow untouched, as required. Not yet independently smoke-tested end-to-end in a browser (persistence-after-refresh, same-day-streak-only-once) — flagged as the next verification step before calling this fully closed. Phase B (card-based LO page restructure) remains open, needs its own spec per `GAMIFICATION_SPEC.md` section 7 — don't start it opportunistically.
- **2026-07-03** — Resolved the gamification open question: reviewed Cursor's first LO build against a Duolingo/Mimo baseline (5/10 — solid study guide + quiz, but no XP, streaks, per-question feedback pop, or per-LO progress indicator; the XP counter/animation on the homepage's `QuizDemo` was built for the marketing page only and was never wired into the real `QuizRunner`). Decided on a full rebuild rather than a partial patch, split into two phases so the DB/backend loop ships independently of the much bigger LO-page restructure. Phase A (XP + streaks + fly-up feedback + per-LO progress ring, spec'd in new `GAMIFICATION_SPEC.md`) is ready for Cursor now — DB migration (`user_course_stats` table: total_xp/current_streak/longest_streak/last_activity_date, RLS scoped to own row) already applied directly to the `learn-in-curve` Supabase project. Phase B (breaking the single long-scroll LO page into a Duolingo-style bite-sized card flow) is deliberately deferred — it's an information-architecture change touching every content block, not a gamification add-on, and needs its own spec doc first. Explicitly excluded from V1: badges/achievements and leaderboards — no unlock criteria, art, or social/friends model exist yet, and the product thesis so far is individual exam prep, not competitive. These stay open below.
- **2026-07-04** — LO1's native demo approved; greenlit the full rebuild — all 24 LOs migrated for real (not just proof-of-concept) plus a native mock exam replacing `mock.html`/`quiz.html`. Added as section 7 of `PMQ_NATIVE_MIGRATION.md`. DB prep done directly: `questions` gained two nullable columns (`part`, `position`) for mock-exam question ordering; `courses.exam_config` for PMQ gained `mock_exam` (marks/timing/break config) and `case_study` (the "Space App" scenario + 5 personas), reusing the existing jsonb column rather than new tables. Made one explicit call: the old site's mock-exam unlock check read a stale `emailCaptured` localStorage flag (a pre-accounts leftover) even though its displayed copy said "complete all 24 LOs" — for the native version, unlock now genuinely follows the displayed copy (all 24 sections' `quiz_completed_at` set), since real accounts make the old email-capture gate meaningless. Passing the mock exam now also issues a `certificates` row (table existed, unused until now).
- **2026-07-03** — Parity check of Cursor's first native build against the old static site (via direct browser comparison) found two real gaps, documented as a new section 6 in `PMQ_NATIVE_MIGRATION.md`: (a) the `diagrams` array on `core_content` items isn't rendered on the native LO detail page — old site shows an inline SVG image (e.g. LO1's lifecycle-staircase diagram), native page shows nothing; (b) four home-page-only sections from the old `index.html` are entirely missing from the native course overview page — "What's Included?" (6 cards), "Exam Question Command Words" (global 6-row reference table, distinct from each LO's smaller command-words subset), "Frequently asked questions" (5 items), and "Further Reading" (2 global APM resource cards — distinct from and in addition to the per-LO `further_reading` field, which is already correct and stays put). User explicitly paused further work until this is fixed. Full copy/spec handed to Cursor via the migration doc rather than resummarized here.
- **2026-07-03** — Master PDF for PMQ arrived: `PMQ in 5 days/content/APM PMQ - Delegate Pack.pdf` (341-page delegate slide deck). This becomes the authoritative full-syllabus reference — usable now for verifying/filling gaps in lo*.json content, and later as the AI tutor's core grounding material. Also confirmed: Stripe account setup and go-live for the AI tutor's Â£5 unlock is the user's to handle on their own timeline — the locked/"coming soon" panel Cursor is building doesn't need real payment wiring yet, just the visual lock and entitlement check.
- **2026-07-03** — Revised the PMQ monetization model: course access (content, quizzes, progress) stays completely free, but the AI tutor specifically is a paid add-on — visually present and locked on every LO page, unlocked with a one-time Â£5 payment. This supersedes the 2026-07-02 "no paygate at any tier" entry below — that was too broad. Added a new `feature_entitlements` table (user_id, course_id, feature='ai_tutor', source, granted_at, stripe_payment_id, RLS: users can read their own rows) deliberately separate from the existing `entitlements` table, so a tutor-unlock purchase can never be misread as a full-course entitlement by `getUserCourses`. Set `courses.exam_config.ai_tutor_price_cents = 500` for PMQ. Reasoning: this keeps the gamified revision experience as the free hook (drives adoption, matches "PMQ stays free" intent) while still monetizing the AI tutor specifically, which is the feature actually costing money to run (Claude API calls) and the one users are paying to access, rather than gating content that costs nothing extra to serve.
- **2026-07-02** — Wrote `PMQ_NATIVE_MIGRATION.md` as the handoff spec for Cursor to execute the native migration (Claude does planning/data-model work + a one-LO proof of concept; Cursor writes the actual migration script and Next.js pages). Added `day` and `theme` columns to the `sections` table (didn't exist before) and seeded LO1 end-to-end (1 section, 1 lesson, 11 questions) as a working proof that the sections/lessons/questions schema mapping is correct before Cursor migrates the remaining 23. Full field mapping (lo*.json → sections/lessons/questions, including the quiz-type mapping mcq/scenario_mcq/dropdown/long_form/short_recall → multiple_choice/select_from_list/long_answer/short_answer) is documented in that file rather than repeated here.
- **2026-07-02** — Confirmed PMQ in 5 days is permanently free within Learn in Curve — no paygate at any tier. Supabase `courses` row already has `is_free=true`/`price_cents=0`; this locks that in as policy rather than a placeholder. Reasoning: the AI tutor and gamified experience are what should differentiate Learn in Curve, not a small fee gating access to PMQ itself — charging for PMQ would undercut the value of building those features. Monetization (Phase 3, Stripe, ~Â£10 one-time) still applies to future courses (PFQ in 2 days onward). `docs/roadmap.md` Phase 3 updated to state this explicitly so it isn't accidentally reversed when Stripe work starts.
- **2026-07-02** — Decided to migrate PMQ in 5 days off the Phase-1 iframe embed and into Learn in Curve's own native pages/database (the `sections`/`lessons`/`questions`/`attempts` tables already existed in the Supabase schema but were empty). Reason: an iframe is a black box — the outer app can't see quiz attempts or section completions happening inside the embedded static site, which blocks both the AI tutor (needs to know what the user got wrong) and gamification (needs to know when to award XP/streaks) from working. Native migration removes that wall. User will supply the full PMQ syllabus as a master PDF to use as the AI tutor's core knowledge base once the native course experience is live.
- **2026-07-02** — Quiz format decision + AI tutor UX direction, made while working through LO1 as the gamification worked example. **Quiz:** dropped `long_form`/`short_recall` question types (can't be auto-marked); quiz banks now MCQ/scenario_mcq/dropdown only, minimum 10 questions per LO, wrong answers feed the AI tutor's weak-area detection later. `content/lo1.json` rebuilt as the template (11 questions, 14 marks); `content/_schema.json` updated to match (type enum restricted, with a note that lo2–lo24 still hold legacy long_form/short_recall items pending the same rebuild). New questions are sourced strictly from each LO's own existing structured content (key_definitions/core_content/misconceptions/exam_technique) — not internet search — to stay exam-scoped and avoid non-APM terminology drift. Also removed `difficulty` and `estimated_study_time_minutes` from all 24 `lo*.json` files and from the schema's required fields — there was never a documented rubric behind the old ratings (checked via cross-file analysis, no clean correlation existed). **AI tutor:** confirmed as a universal, fixed right-side expandable chat panel on every LO page (Cursor-agent-sidebar style, not a floating bubble), grounded in the full course syllabus rather than just the current LO, strictly exam-scoped (no answers beyond syllabus), offering guided/quick-reply options mid-conversation, and adaptive to the user's quiz-attempt history rather than raw chat logs (respects the PRD's no-raw-conversation-storage GDPR constraint). Page design should actively encourage tutor usage. Full behavior spec deferred to a future markdown doc — this is direction only, not yet a build spec. **Content sourcing:** for PMQ, a single master PDF (forthcoming) plus the existing lo*.json content is the source of truth; for future courses (PFQ, PMP, CAPM), the plan is to use NotebookLM as the knowledge-gathering/database layer instead.
- **2026-07-02** — Rebuilt the homepage (`src/app/(site)/page.tsx`) in Cursor to match Brand Kit v4, closing out Phase 1's last open item. New components: `HeroIllustration`, `HeroBoardingPass`, `StatBand` (animated count-up), `QuizDemo` (live interactive quiz), `JourneyPath` (scroll-drawn SVG road with clickable nodes), `GrainOverlay` (site-wide, added to root layout), `ScrollReveal`, `AboutCards`. `tailwind.config.ts` migrated to the v4 token set (`cream`/`paper`/`sand`/`teal.deep`/`rust`) while keeping legacy `bg`/`surface`/`primary` aliases for routes not yet touched. On review, removed the raccoon mascot and the hero's decorative arch/blob shapes (kept the sunburst) — see `DESIGN.md` for why and what not to reintroduce without sign-off. Phase 1 (`docs/roadmap.md`) is now fully checked off.
- **2026-07-02** — Built Brand Kit v4 (`brand/BRAND_KIT_v4.html`, "Illustrated Edition") on direct request to push v3 further: more animated, illustrative, bold, highly interactive and gamified. Used 3 reference images in `brand/inspo/` as direction — flat color-blocked geometric retro illustration (arches/circles), a vintage diner scene (checkerboard tile, ink-line linework), and Kodak's bold poster color-blocking. Changes from v3: added a flat-vector mascot (masked-raccoon) bobbing in the hero beside the ticket — first real illustrated appearance beyond the earlier flat chest-emblem placeholder, still a placeholder pending a proper AI-illustrated or hand-refined pass; layered an arch/circle geometric composition behind the hero; added a fixed film-grain overlay (SVG feTurbulence) across the whole page; added a Kodak-inspired bold stat block (stacked color bands, animated count-up numbers, black caption bar) as a new trust/social-proof section; added a checkerboard texture accent above the courses section; replaced the static 4-step "how it works" grid with a fully interactive gamified journey path — an SVG road that draws in on scroll, with 5 clickable nodes (complete/current/locked states) that open detail cards; added a live interactive quiz demo card with real click-through logic (correct/incorrect states, XP counter, animated XP bar, floating "+10 XP", explanation copy) so the gamification mechanic is demonstrated, not just described. Palette extended with `--rust` (#B3341C), `--teal-deep` (#123F3C), `--sand` (#E8CE93) for the illustration/poster layer; core tokens (ink/cream/orange/gold/olive/teal) unchanged. Kept v1–v3 intact alongside it, per the existing versioning convention.
- **2026-07-02** — Built Brand Kit v3 (`brand/BRAND_KIT_v3.html`, "Direction 1 — Ticket Studio"). Not logged at the time it was created; backfilled here. Evolved the brand kit from a style-guide/swatch showcase (v2 — isolated color chips, type specimens, mark comparisons) into an applied landing-page mockup demonstrating the same tokens inside a real page: nav, marquee ticker, hero with the boarding-pass ticket card, about, courses, how-it-works, newsletter, footer. Simplified the CSS token names (`--ink`/`--cream`/`--orange`/etc., replacing v2's verbose `--color-*` names) but kept the underlying palette and type system from v2 unchanged.
- **2026-07-02** — Phase 1 platform shell built at repo root: Next.js 15 (App Router, TypeScript, Tailwind), Supabase Auth (email + Google OAuth), retro-70s home page per brand kit v2, protected dashboard querying `courses` + `entitlements` tables, PMQ in 5 days embedded via iframe serving read-only static files from sibling `PMQ in 5 days/` folder (no deployed URL found in that repo — see decision log). Supabase project: `dbjoimidfbftammchnql`. Logo: removed the two mustard-gold dot terminals; the orange curve now ends in small hook flourishes that curl back along the inside of the ink/gold ring instead. Mascot: decided on a masked-raccoon "vigilante" mascot (cowl mask with pointed ears + eye cutouts, playing on raccoons' natural bandit-mask markings) rather than a cute/soft creature, to reinforce "sophisticated gamified, not childish." First-pass version hand-built as flat SVG (chest emblem echoes the main curve mark, striped tail, burnt-orange cape) since the AI image-generation tool (Gemini/banana skill) isn't configured in this environment — no API key set up. Flagged as a placeholder pending either a proper AI-illustrated pass (needs a Google AI Studio key) or further manual refinement. Name not yet decided.
- **2026-07-01** — Built Brand Kit v2 (`brand/BRAND_KIT_v2.html`) after feedback that v1 rated 6/10 — felt templated, colors too safe, typography too tame. Used Mobbin MCP (required reconnecting the claude.ai connector to pick up the paid Team plan) to pull real references: rejected Duolingo's bright mascot-driven gamification as too childish; drew instead on Replit's "100 Day Journey" path map, plus Claude/Savee/Sana AI's vintage ticket-stub and cassette-sleeve aesthetics. V2 changes: deepened every palette value one notch (primary now `#D5501F`, ink `#241A12`, background `#F2E6CC`), added Space Mono as a third "stamped ticket" accent font alongside Fraunces (now bold-italic by default) and Figtree, restyled the course card as a literal ticket stub with perforation, and replaced the plain progress ring with a "journey path" SVG (drawn-in stroke animation, pulsing current-position node) as the core gamification metaphor instead of mascots/badges. Added marquee ticker, scroll-reveal, and hover-tilt motion throughout per the "more animation" ask. Kept v1 alongside it for comparison.
- **2026-07-01** — Built Brand Kit v1 (`brand/BRAND_KIT.html`), kicking off Phase 0. Kept the existing S-curve mark (circle + curve, the "learning curve" concept) rather than replacing it, but recolored it into a retro-70s palette: ink `#3A2A1E` (replaces black), parchment `#F4E9D6` (replaces white), burnt orange `#E8672B` (primary, evolved from the existing brand orange `#F07B3A`), mustard gold `#D9A441` (secondary), avocado olive `#6B7A3A` (success states), petrol teal `#1F6F6B` (info/streaks), maroon `#7A2E2E` (alerts, used sparingly). Typography: Fraunces (display/headlines) + Figtree (body/UI) — deliberately avoided Inter/Roboto/Space Grotesk. Visual language: thick ink borders + offset "sticker" shadows, sunburst/halftone/arch motifs used sparingly as background texture only. CSS variables in the file's `:root` are the reusable design tokens for Phase 1 build.
- **2026-07-01** — Pivoted product scope from single-course AI tutor to multi-course SaaS platform. Defined phased roadmap (Phase 0 foundation/brand kit → Phase 1 platform shell → Phase 2 PMQ gamification + AI tutor → Phase 3 monetization → Phase 4 PFQ in 2 days as first paid course → Phase 5 voice mode + remaining courses). Decided payment model: one-time purchase per course, not subscription. Rewrote `docs/roadmap.md` accordingly; kept `PRD.md` untouched as the historical V1 scope document.
- **2026-07-01** — Set up project environment: created `CLAUDE.md`, `BUSINESS_STATE.md` (this file, replacing a README), `PRD.md`, and `docs/roadmap.md` at the root of `Learn in Curve/`. Decided not to nest new work in a separate subfolder — everything sits alongside `PMQ in 5 days/` and `JUNK/`.

## âš  Pre-launch gate

**Do not publish/go live until `legal/PRE_LAUNCH_CHECKLIST.md` is fully checked
off.** Created 2026-07-03 alongside the four draft legal docs (Privacy Policy,
Terms, Cookie Notice, Recruitment Notice) — covers entity/ICO registration,
finalizing document placeholders, wiring the docs into real site pages/footer
links, a sign-up terms-acceptance checkbox, and Stripe/data-processor
compliance steps. Surface this any time publishing/launch/going-live comes up.

## Open questions / not yet decided

- Exact repo/build strategy for continuing off "PMQ in 5 days" (fork it, build the new platform alongside it and migrate content in, or extract pieces from it).
- Gamification Phase B: card-based LO page flow (needs its own spec — see `GAMIFICATION_SPEC.md` section 7). Badges/leaderboards remain deliberately out of scope for V1. **Possibly triggered by LIC-20** (2026-07-08, "make LO sections collapsible like the live site") — that ticket may either *be* the Phase B spec's trigger or a lighter-weight version of it; needs a call before building, not yet resolved.
- Brand kit specifics (colors, type, retro 70s references) — not yet created.
- Timeline/start date for Phase 0.

- **2026-07-08 (later same day)** — Kicked off the Wave 0 pass on the LIC-5..41
  backlog push (see decision log entry above, same day). Found and fixed three
  real gaps before letting Cursor touch anything: (1) git was dirty — 38
  modified/untracked files including core `src/` components uncommitted since
  the last checkpoint (2026-07-07 15:48), plus a stale `.git/index.lock` —
  flagged to Sim as a repo-hygiene blocker, not yet resolved; (2) the Supabase DB
  only has LO1 migrated (`sections`/`lessons`/`questions` = 1 row/11 questions)
  despite all 24 `lo*.json` source files existing and being ready — most LO-page
  tickets can be built against the LO1 template but can't be verified/closed
  course-wide until the rest migrate (`PMQ_NATIVE_MIGRATION.md` Â§7, greenlit
  2026-07-04, not finished); (3) the AI tutor chat backend itself doesn't exist —
  `AiTutorPanel.tsx` is a complete UI shell gated on `AI_TUTOR_LAUNCHED = false`
  with no API route anywhere (`src/app/api` only has `stripe/webhook`) — LIC-36/
  37/40 all assume it's there. Created **LIC-42** (new ticket, High priority) for
  the real build, set to block LIC-36/37/40.

  Resolved with Sim: LIC-30 ("Go Deeper") is NOT the same as "Further Reading" —
  Further Reading stays on the PMQ homepage; "Go Deeper" is a distinct heading on
  the LO page template only (`src/app/courses/pmq-in-5-days/lo/[loNumber]/
  page.tsx` lines 203–206), fix is deleting that one `<section>` block. LIC-20
  ("make LO sections collapsible") confirmed as the light-tweak interpretation —
  accordio
- **2026-07-08 (AI tutor design reversal)** — Sim explicitly overrode three
  parts of the AI_TUTOR_BACKEND_SPEC.md draft written earlier today:
  1. **Persistent chat history, reversing the PRD's "no raw conversation
     storage" constraint** (2026-07-02 decision log). Sim's reasoning: a tutor
     that forgets the user every session defeats the point of having one.
     Explicit instruction: "ignore what's in the PRD... GDPR can be updated."
     PRD.md is deliberately left untouched as a historical doc (per the
     2026-07-01 convention) — this entry is the actual current policy. New
     `tutor_messages` table stores real message content, RLS to owner. **Real
     consequence, not just a schema change:** `PRIVACY_POLICY.md` section 2's
     "no raw conversation storage" commitment is now false and needs rewriting
     with a real retention period before this ships to real users —
     `legal/PRE_LAUNCH_CHECKLIST.md` Â§4 already anticipated this exact
     check. Not rewritten yet — flagged to Sim, waiting on a go-ahead plus a
     retention-window number.
  2. **Tone: redirect, not refuse, on off-syllabus questions.** System prompt
     rewritten (see spec Â§2) to acknowledge, answer what's reasonably
     answerable, then pivot back to exam-relevant framing — rather than a flat
     decline. Sim's framing: shouldn't feel stonewalling, shouldn't need to be
     asked twice.
  3. **Model provider open — Gemini vs. Anthropic.** Researched current
     pricing (July 2026): Gemini's Flash/Flash-Lite tier ($0.10-0.50/M input)
     undercuts Claude Haiku ($1/M) and Sonnet ($3/M) meaningfully; no strong
     quality argument either way for this use case. Recommendation: build the
     model call behind a one-function abstraction so the provider is
     swappable, not hard-coded — decision on which to start with still open.
     **[RESOLVED same day — see the retention-window entry below and
     `AI_TUTOR_BACKEND_SPEC.md` Â§3: started with Gemini 3 Flash, on cost
     grounds. `callTutorModel` abstraction still built regardless, so this
     stays swappable.]**
  4. **Flagged, not yet decided:** unlimited AI tutor access under a one-time
     Â£5 fee, combined with persistent full-history context, is a real
     unit-economics risk (cost grows with conversation length, revenue
     doesn't). Logged in spec Â§4, no number picked yet.
  5. **"Gets smarter over time" ask, scoped realistically.** Not live model
     fine-tuning (no infra/data volume to justify it yet) — thumbs up/down per
     message written to `tutor_messages.rating`, periodic manual review of
     low-rated exchanges to refine the system prompt/content. Human-curated
     loop, not automatic self-improvement — expectation set explicitly in the
     spec so it isn't misread later.

  `AI_TUTOR_BACKEND_SPEC.md` rewritten in place to reflect all of the above.

- **2026-07-08 (Intercom account claimed)** — Sim confirmed claiming an
  Intercom account for LIC. `legal/PRE_LAUNCH_CHECKLIST.md` already shows
  Cursor picked up the LIC-38 work same-day (`IntercomProvider`/
  `SendFeedbackButton` referenced as wired, dormant pending
  `NEXT_PUBLIC_INTERCOM_APP_ID`) — checklist flags a real follow-up: Cookie
  Notice needs an Intercom-specific update (and a consent banner, per
  `PRIVACY_POLICY.md` Â§3) the day the App ID actually goes into production —
  not required while it stays dormant.
  **[Note: this sentence was found truncated mid-word ("...an Interc") when
  reviewed 2026-07-08 — same interrupted-write pattern as the LIC-28 JSON
  corruption elsewhere in this doc's history. Completed from context; the
  underlying fact (Cookie Notice needs an Intercom-specific pass before
  launch) was never in doubt, only the sentence itself was cut off.]**
- **2026-07-08 (AI tutor decisions, batch 2 — fair usage, completion summary,
  launch scope)** — Sim answered the outstanding AI tutor questions plus set
  new launch scope:
  1. **Fair usage cap, decided:** paid AI tutor access capped at 50% of the Â£5
     fee in estimated model cost (~Â£2.50), tracked via real input/output token
     counts on `tutor_messages` rather than a flat message count (cost varies
     with conversation length). Past the cap: locked state, future
     pay-as-you-go top-up for unlimited (logged as LIC-54, explicitly not
     built now). Distinct from LIC-36's separate 3-free-messages limit for
     unpurchased users — don't conflate the two.
  2. **New: course-completion summary (LIC-52).** Once all 24 LOs are marked
     complete, the tutor proactively delivers a strengths/weaknesses/exam-tips
     summary from real quiz attempt data, delivered into the same persistent
     chat history. Gating (free vs. paid) still open.
     **[RESOLVED same day — confirmed paid-only, it's part of the AI tutor
     feature. See `AI_TUTOR_BACKEND_SPEC.md` Â§10 and the LIC-52 Linear ticket
     description.]**
  3. **Launch quiz scope narrowed:** all 24 LOs need a 10-question MCQ/dropdown
     base pack (LIC-28, now the priority content task) — the 30-question
     quick-generation pool (LIC-22) is explicitly deferred to post-launch,
     downgraded to Low priority.
  4. **Mock exam tiering confirmed:** free = Lite Mock Exam only (LIC-39,
     renamed from "standard"). Paid = Lite **and** Real Mock Exam (LIC-40),
     additive, not a replacement.
  5. **New: shared `LockedFeature` component (LIC-53).** Every paid
     feature visible to a free-tier user must render locked — lock icon,

- **2026-07-17 (guest Sly global £3 spend cap + kill switch)** — Following the
  DPA conversation, Sim asked for a hard guardrail on total Gemini spend from
  the public, unauthenticated homepage guest trial (separate concern from the
  per-visitor 3-message cap already in place). Clarified via three decisions:
  1. **Cap type:** £3 lifetime total, resets only on Sim's explicit
     instruction — not automatic daily/monthly.
  2. **Enforcement:** notify-only, not auto-stop. Guest chat keeps running
     after the cap is crossed until Sim manually flips it off — so a fast
     manual kill switch was a hard requirement, not optional, given that
     choice.
  3. **Notification:** email (real-time, fires from the same request that
     crosses the cap — chosen over a Cowork polling check, which would lag
     up to ~15 min).
  Built and shipped to live Supabase (`dbjoimidfbftammchnql`, the
  `learn-in-curve` project) same day:
  - New singleton table `guest_tutor_budget` (id=1) + atomic RPC
    `record_guest_tutor_spend`, in
    `supabase/migrations/20260717140000_guest_tutor_budget.sql`. Applied and
    round-trip tested live (increment verified, then reset to a clean 0
    state).
  - Real per-message cost computed from actual Gemini token usage (reusing
    `estimateTokenCostUsd/usdToGbpCents` from `fair-usage.ts` — the same
    pricing math already used for paid fair-usage tracking, not a new/parallel
    estimate) and recorded after every guest reply in
    `/api/tutor/guest-chat/route.ts`.
  - `enabled` kill-switch column checked before every guest send — **fails
    closed** (transient DB read errors are treated as disabled) since this is
    a cost guardrail, not a feature flag where availability should win ties.
  - Alert email via Resend's REST API called directly (no new npm dependency)
    — `src/lib/tutor/guest-budget-alert.ts`. **Not yet live**: no
    `RESEND_API_KEY` configured anywhere Claude could find (checked
    `.env.local` only — may exist in Railway prod env, unconfirmed). Until
    it's set, a cap-crossing logs loudly server-side but sends no email.
    Sim needs to create a free Resend account and add the key wherever
    `GEMINI_API_KEY` lives.
  - `GuestSlyPanel.tsx` gained a distinct `unavailable` UI state (kill switch
    off) separate from `locked` (per-visitor 3-message cap used up) — the two
    read differently to a user and shouldn't be conflated.
  - Manual ops (reset counter / flip kill switch / change cap) documented as
    plain SQL at the bottom of the migration file — no admin UI built, matches
    solo-founder scale.
  Not committed to git yet (same standing pattern as the guest-chat feature
  itself) — pending Sim's go-ahead, likely via Cursor next session.
     dashed/dotted outline, de-emphasized — rather than hidden or a full
     paywall interstitial. One shared component, not reimplemented per
     feature (full spec in `AI_TUTOR_BACKEND_SPEC.md` Â§11). **Shipped**
     2026-07-08 as part of Wave 2 (`src/components/LockedFeature.tsx`).
- **2026-07-08** — Retention window for AI tutor chat storage decided: 12
  months, rolling from the last message in a conversation (resets on each new
  message, so only truly abandoned conversations age out). `legal/
  PRIVACY_POLICY.md` rewritten to match: section 2 discloses conversation
  messages as a stored data type (replacing the now-false "no raw storage"
  line), section 4 names Google/Gemini as the model provider for tutor
  responses, and section 5 flags accepting Google's Gemini API
  data-processing terms as a still-open pre-launch item (tracked as LIC-50).
  **[Note: the last sentence of this entry was found truncated mid-word
  ("...names Google/Gemini as the") when reviewed 2026-07-08 — same
  interrupted-write pattern noted elsewhere. Completed from `PRIVACY_POLICY.md`
  section 4's actual current text and `AI_TUTOR_BACKEND_SPEC.md` Â§3/Â§9.]**
## 2026-07-08 — LIC-28 quiz content rebuild found broken, reverted, clean re-run queued

Cursor's earlier status report claimed Part 1 of the quiz-content-and-migration
task ("rebuild lo2.json–lo24.json") was done. It wasn't. All 23 files were
truncated invalid JSON (cut off mid-sentence, never closed), never committed
— mtimes from 2026-07-02/03 show the write was interrupted and never resumed
before being reported complete. Verified via `JSON.parse` on all 23 files
(100% failure) and `git status`/`git log` (nothing committed, working tree
had the broken state).

Claude reverted all 23 files to last good commit `1e76b0e` (pre-rebuild
content, `long_form`/`short_recall` still present, valid JSON) via `git
checkout` in the `PMQ in 5 days` repo — cleared a stale `.git/index.lock`
first (13 min old, zero-byte, no live process; same pattern as the one
Cursor's hook cleared earlier today). `_schema.json`/`lo1.json` from that same
2026-07-02 pass were valid and left untouched; `mock.json` changes are
unrelated (June 13, separate work) and also left untouched.

New prompt written: `cursor-prompt-quiz-content-rerun.md` — same scope, plus
process fixes (commit every 4-5 files instead of one big batch, validate JSON
after every file write, paste validation output into the status report
instead of asserting "done"). Supabase migration (Part 2) stays with Claude,
running directly via the Supabase MCP — no service-role key needed, avoids
pasting a full-DB-write-access secret into any chat interface.

Also this session: Linear MCP briefly disconnected/reconnected (unrelated
platform hiccup, not a project issue). Once back, moved 7 confirmed-done Wave
2 tickets to In Review: LIC-13, LIC-15, LIC-18, LIC-27, LIC-31, LIC-10,
LIC-53. LIC-17 (LO-per-day grouping bug) verified NOT done despite being in
the original Wave 2 ticket list — confirmed via `git log` grep (zero matches)
and Linear state history (never left Todo) — stays queued, not started.

## 2026-07-08 — LIC-28 clean re-run + LIC-17 fix landed; 24-LO Supabase migration finished

Cursor's clean re-run of LIC-28 shipped correctly this time: all 23
`lo2.json`–`lo24.json` files rebuilt (MCQ/dropdown only, ~10 questions each,
zero legacy `long_form`/`short_recall` items), committed incrementally across
6 commits (`3b99b53`..`f82c8b1`), validated per-file before each commit.
LIC-17 also fixed correctly — root cause was the live site's day/LO grouping
living in a hardcoded `DAY_LOS` map (`PMQ in 5 days/scripts/app.js`) while the
native app read each LO's own (partly stale) `day` field; `lo4.json`/
`lo5.json` had incorrect `day` values (4 and 5 respectively, should both be
1). Fix: `PMQ_DAY_LOS`/`getDayForLo()` added to `src/lib/pmq/constants.ts` as
the single authoritative mapping, used everywhere grouping happens.

**Verification hit a real snag worth recording:** Claude's first read of the
rebuilt content via the bash tool showed all 23 files as truncated/invalid —
looked identical to the original corruption. Turned out to be a stale FUSE
mount cache in the sandbox (bash's view of the `Learn in Curve` folder froze
at the moment of an earlier `git checkout`, ~17:13, and never picked up
Cursor's subsequent commits — confirmed by a new file Cursor created not
even appearing in a bash `ls`). The Read tool and `git show HEAD:path` (reads
git's object store, not the frozen working-tree cache) both showed the true,
current, valid state. Lesson: if a previously-fixed problem seems to have
reappeared identically, check for a stale-read explanation before re-flagging
it as a regression — Cursor's work was correct both times it was falsely
flagged.

**Supabase migration (Part 2, `PMQ_NATIVE_MIGRATION.md` Â§7) is now
complete.** Ran directly via the Supabase MCP (`execute_sql`), sourcing fresh
content via `git show HEAD:content/loN.json` per LO to route around the stale
mount. Caught two real schema mismatches against the original
`migrate-pmq-content.mjs` field mapping during this: `lessons` has no
`course_id` column (only `sections`/`questions` do — fixed the insert), and
inserting `course_id` inside a `UNION ALL` chain needs an explicit `::uuid`
cast (Postgres won't infer it from a bare string literal in that context).
Also deliberately overrode each LO's own (sometimes-stale) `day` field with
the same `PMQ_DAY_LOS` mapping LIC-17 just fixed at the app layer, rather
than trusting the JSON — avoids reintroducing that exact bug at the DB layer.

Final verified state: **24 sections, 24 lessons, 241 questions** (LO1's
pre-existing 11 + 23 Ã— 10 new), day groupings confirmed matching
`PMQ_DAY_LOS` exactly ([1-5]→day1, [6-10]→day2, [11-15]→day3, [16-20]→day4,
[21-24]→day5). LIC-28 and LIC-17 moved to In Review. This closes the "24-LO
migration verification" open item and unblocks true closure of the LO-page
ticket cluster from Wave 2.

## 2026-07-08 — LIC-42 (AI tutor backend) unblocked and handed to Cursor

`GEMINI_API_KEY` added to `.env.local` (Sim provided it directly in chat —
noted this once, going forward drop API keys straight into env files rather
than pasting into chat; not a big deal this time since it's a lower-privilege
key than a DB service-role key would be). LIC-42 moved Backlog → Todo.

**Wrote `cursor-prompt-lic42-ai-tutor.md`** — full build handoff referencing
`AI_TUTOR_BACKEND_SPEC.md` section-by-section (DB migration → `callTutorModel`
abstraction → system prompt → API route → frontend → completion summary →
`LockedFeature` adoption). Two open spec questions (Â§9: free-tier cap number,
exact soft-cap token budget) given explicit non-blocking defaults in the
prompt (keep cap at 3; hardcode the soft cap off current Gemini pricing)
rather than stalling the build. **Explicitly instructed Cursor NOT to flip
`AI_TUTOR_LAUNCHED` to `true`** — that stays a Sim go/no-go decision once the
build is verified working, not something Cursor decides at build time.

**Posted an update to the LIC-42 Linear comment thread** — the original
comment (posted when the ticket was moved to Todo) said it was blocked on a
missing `GEMINI_API_KEY`; that's now stale since the key was added
afterward. Follow-up comment posted confirming the unblock and that the build
prompt is ready, so the Linear thread itself doesn't mislead a future reader
of that ticket.

## 2026-07-12 — Mock exam Lite/Full split found unbuilt; Space App case study removed

Sim reported the Lite Mock Exam card showing long/short-answer questions,
which shouldn't be in a free MCQ/dropdown-only tier. Investigation found the
bug was bigger than reported: **LIC-39 (Lite) and LIC-40 (Full) were both
still Backlog, never built.** Cursor's "lite mock exam" and "full mock exam"
cards on the overview page (`PmqMockExamsSection.tsx`) are marketing copy
only — both link to the same single route (`/courses/pmq-in-5-days/mock`),
which has always served all 40 questions from `mock.json` (25 auto-marked +
15 written) with **no tier filtering and no entitlement check at all**. Any
signed-in user could reach the full written/AI-graded exam for free via
direct URL — a real paywall gap, not just wrong question types.

Also found: 9 of those 40 questions (2 dropdown, 7 written) were framed
around a case study — a fictional company "Space App" with 5 named personas
(Ayo/Sandeep/Alva/Robin/Lee) and a "Devon conversion" scenario, defined in
both `mock.json` and `courses.exam_config.case_study`. Since 2 of the 9 were
dropdown questions, they'd have surfaced in Lite even after a pure type-filter
fix — the Space App removal and the Lite/Full fix turned out to be the same
piece of work.

**Decided with Sim:** remove the Space App case study entirely rather than
rename or generalize it. Replaced all 9 dependent questions with fresh
standalone questions (same id/part/position/type/marks/lo_reference, so the
90-mark/40-question exam structure is unchanged) — no named company or
persona, generic scenarios instead (supply-chain upgrade, factory automation,
distribution centre, warehouse expansion, customer service centre relocation,
hospital refurbishment, construction contract, etc.), still mapped to the
same LOs. Updated directly:
- `PMQ in 5 days/content/mock.json` — 9 questions replaced, `case_study` key
  removed entirely.
- Supabase `courses.exam_config` — `case_study` key removed via `exam_config
  - 'case_study'`.
- Supabase `questions` table — all 40 mock-exam questions inserted with
  `context='mock_exam'` (previously 0 rows existed there; the mock exam had
  been running entirely off the `mock.json` fallback since LIC-42-era work).
  Verified: 25 auto-marked (20 MCQ + 5 dropdown, 30 marks) + 15 written (10
  long + 5 short, 60 marks) = 40 questions / 90 marks, matching
  `exam_config.mock_exam.total_marks`.
- Confirmed via direct grep of `PMQ in 5 days/content/` and `src/` that no
  other Space App / persona-name references remain anywhere in the codebase
  (the earlier whole-repo grep missed `mock.json` because ripgrep respects
  `.gitignore` by default and content JSON is gitignored — worth remembering
  for future greps in that directory, use `Read` or a raw bash `grep`
  instead).

**Still to do (handed to Cursor via `cursor-prompt-lic39-lic40-mock-split.md`):**
the actual Lite/Full split and entitlement gate don't exist yet — only the
content is now correct. Lite should filter to `question_type IN
('multiple_choice','select_from_list')` only (25 questions / 30 marks, not
the 40/90 the current "Lite" marketing copy claims — that copy needs updating
too), no case study, no entitlement check. Full keeps all 40 questions but
must gain the entitlement check it's never had. See LIC-39 and LIC-40 for
current status; both updated with this session's findings and kept in
Backlog/Todo (not started) until Cursor ships the actual split.
the way the file state briefly did.

**Also handed off `cursor-prompt-lic17.md`** (day/LO grouping fix) and
`cursor-prompt-quiz-content-rerun.md` (LIC-28 clean re-run) in the same
batch — both since confirmed shipped correctly, see the migration entry
above.

As of this entry, LIC-42's actual status: Todo in Linear, build prompt
written and current, not yet confirmed started or finished by Cursor — check
Linear directly and/or ask Sim whether Cursor has picked it up, don't assume
either way from this file alone.

## 2026-07-14 — Applied profiles/avatar/tutor-credit migrations for Cursor-shipped Sly + profile UI

Cursor shipped the app code for Sly (AI tutor chat/ratings/streaming/credit
meter) and user profiles (dashboard Profile menu + animal avatars used in the
Sly chat face). Claude's half of the split: apply the matching SQL on the
live `learn-in-curve` Supabase project (`dbjoimidfbftammchnql`), confirm RLS,
verify against the schema the app code actually expects. No UI code touched
— verification found no schema mismatch, so there was nothing to hand back.

**Checked live state before touching anything** (`list_migrations` +
`list_tables`): `tutor_messages` was already live — applied 2026-07-09,
schema matched the migration file exactly (19 real rows, RLS enabled,
select/insert/update-own policies present) — left untouched, not reapplied.
`tutor_usage_credits` and `profiles` didn't exist at all.
`courses.exam_config.ai_tutor_price_cents` for `pmq-in-5-days` was still
`500` (the old Â£5 placeholder).

**Applied four migrations, in order, via `apply_migration`:**
- `20260713100000_tutor_usage_credits.sql` — fair-usage/top-up credit
  ledger. RLS: `select` own-row only, intentionally **no insert policy for
  authenticated users** — inserts are Stripe-webhook/service-role only, per
  the migration's own comment. Confirmed this is what actually landed (not
  an oversight).
- `20260714120000_pmq_premium_price_999.sql` — `ai_tutor_price_cents` on
  `pmq-in-5-days` now `999`, confirmed by direct read after applying. This
  is the code implementation of **LIC-56** (pricing decided 2026-07-12: Â£9.99
  total, Â£5.00 usage allowance + Â£4.99 margin) — LIC-56 was "decided but not
  yet implemented" before this session; the DB side is now done. Also
  resolves the stale "Â£5 one-off" pricing framing flagged on **LIC-60**
  (About page ticket) as inconsistent with LIC-56 — the live platform fee is
  now correctly Â£9.99, so any philosophy/about copy touching pricing should
  be revised to match before publishing.
- `20260714140000_profiles.sql` then `20260714150000_profile_avatars.sql`
  (applied together, in order, per the handoff instructions) — created
  `public.profiles`, then dropped `target_exam_date`/`weekly_study_hours`
  and added `avatar_id`. Net result verified column-by-column against the
  handoff's expected final shape: `user_id uuid` PK → `auth.users(id) on
  delete cascade`; `first_name`/`last_name`/`profession`/`study_goal` text
  nullable; `age` smallint nullable with `13–120` check (confirmed via
  `pg_constraint`); `avatar_id` text **not null**, default `'owl'`, check
  constrained to `owl`/`badger`/`otter`/`hedgehog`; `created_at`/`updated_at`
  timestamptz. No `target_exam_date`, no `weekly_study_hours` — confirmed
  absent. RLS: `select`/`insert`/`update` own-row only
  (`auth.uid() = user_id`), all three policies present and correctly scoped.

**Verification method and its limit:** schema shape and RLS policy
definitions were confirmed directly against `information_schema.columns`,
`pg_constraint`, and `pg_policies` — this is a complete check of what the
database will actually enforce, and it matches the app code's expected shape
exactly (no mismatch found, so no UI changes were needed). What this session
did **not** do: the literal signed-in click-through (open dashboard → Profile
→ pick avatar + save name → confirm row appears → open Sly on an LO → confirm
the face pill shows the chosen animal + first name). That needs either a live
browser session or Sim doing the 30-second check himself and confirming back
— flagging this explicitly rather than claiming it's done when it wasn't
actually clicked through.

**Security advisor check (`get_advisors`, security) after all four
migrations:** no new findings on any of the tables touched this session.
Four pre-existing, unrelated findings remain (out of scope for this pass,
noting for whoever picks them up next): `survey_invites` and
`survey_responses` have RLS enabled with no policies at all (currently
inaccessible to any non-service-role client — may be intentional,
unconfirmed); `newsletter_subscribers` has an intentionally permissive
`INSERT ... WITH CHECK (true)` policy for the public signup form (expected,
not a bug); and Supabase Auth's leaked-password protection
(HaveIBeenPwned check) is disabled at the project level.

**Next action:** Sim (or Cursor) to run the actual signed-in smoke test and
confirm; if it passes, this and the underlying Cursor profile/avatar/Sly work
can be considered fully verified end-to-end.

## 2026-07-14 — Regression from same-day work: `target_exam_date` dropped, re-add migration applied

Follow-up to the entry directly above. Cursor wired the dashboard PMQ
course-card exam deadline (`DashboardPmqCourseCard` → `saveExamDeadline` →
`upsertExamDeadline` in `src/lib/profile.ts`) against
`public.profiles.target_exam_date`, and saving failed in production with
"Couldn't save your deadline."

**Root cause confirmed, not assumed:** this session's own earlier migration
pass dropped `target_exam_date` from `profiles` (that was correct at the
time — the handoff explicitly said no `target_exam_date` in the final
shape, since the deadline feature didn't exist yet). Cursor then built the
dashboard deadline feature against that column and added
`supabase/migrations/20260714160000_profile_exam_deadline.sql` to re-add it,
but that migration had never been applied to the live project — confirmed
via `list_migrations` (not present) and a direct column check
(`information_schema.columns` returned zero rows for `target_exam_date`
before this fix).

**Applied:** `20260714160000_profile_exam_deadline.sql` — `alter table
public.profiles add column if not exists target_exam_date date;` — exactly
as written, no changes. Verified after: column exists, type `date`.

**RLS: not touched, and confirmed unnecessary.** `profiles_update_own` /
`profiles_insert_own` are row-level policies (`auth.uid() = user_id`) with
no column-level restriction — they already covered the new column the
moment it existed, same as every other column on the table. Re-checked
`pg_policies` after applying to confirm the policy set is unchanged (still
exactly select/insert/update own-row, nothing added or removed).

**Code-side sanity check (read-only, no edits made):** read
`upsertExamDeadline` in `src/lib/profile.ts` — it upserts
`{user_id, target_exam_date, updated_at}` onto `profiles` with
`onConflict: "user_id"`. Column name, table name, and upsert semantics all
match the schema now live. No mismatch found, so per the handoff's
instructions, no UI code was touched.

**Not done, same limitation as the entry above:** the literal signed-in
click-through (`/dashboard`, set a date on the course-card control, confirm
"Saved" rather than the migration error). Verified everything SQL/RLS-level
can prove — the actual save call is now hitting a schema that matches what
the code expects, so there's no structural reason left for it to fail — but
that's a inference from a clean schema+RLS check, not a substitute for
someone actually clicking it. Sim (or Cursor) to confirm.

## 2026-07-28 — Notify-me confirmation email + unsubscribe, built end to end

Sim asked to build the full "notify me" confirmation-email flow (DB storage
already existed as of Cursor's `700aaa7` commit; this added the actual send +
branding + unsubscribe) with Learn in Curve branding, sent immediately on
signup (not delayed 24h — Sim's belief that a 24h-delayed email already
existed didn't hold up; only a DB-write-only capture flow existed before
this).

**Concurrent-edit collision found and reconciled.** While this was being
built, Cursor's own auto-checkpoint hook (`.cursor/hooks/git-checkpoint.mjs`)
committed (`46812c8`, 15:03) over the top of this session's earlier edit to
`src/app/api/notify/route.ts` — since both Claude and Cursor edit the same
working-tree checkout, the checkpoint's snapshot mixed Cursor's own rewrite
(adding a `marketing_consent` checkbox to `PfqNotifyDialog.tsx`, a Storage
sidecar backup, and a new `course_interest`/`marketing_consent` schema) with
whatever was on disk from this session, and this session's confirmation-email
wiring got silently dropped in the process. Same failure pattern as the
2026-07-14 `target_exam_date` entry above: **Cursor's new migration file
(`20260728150000_newsletter_marketing_consent.sql`) was committed to git but
never actually applied to the live DB** — its own comment even said "apply in
Supabase SQL editor when convenient." `route.ts` was writing to
`course_interest`/`marketing_consent` columns that didn't exist, silently
falling back to a bare email-only insert (`PGRST204` retry) every time.

**Reconciled rather than reverted** — kept Cursor's marketing-consent
checkbox and Storage-sidecar backup (both good ideas), but: applied a new
migration (`newsletter_marketing_consent_real`) adding the real
`marketing_consent`/`marketing_consent_at` columns; standardised on this
session's existing `course` column instead of Cursor's unapplied
`course_interest` (avoids two columns meaning the same thing — Cursor's
migration file with `course_interest` is still on disk but is now dead code,
left in place rather than deleted since it's Cursor-authored); re-wired
`sendNotifyConfirmationEmail` into the route so it actually fires on a fresh
signup; and now stamp `confirmation_sent_at` only when Resend confirms the
send (function now returns `boolean`, not `void`).

**Built new this session:**
- `src/lib/notify/send-confirmation-email.ts` — branded HTML confirmation
  email via Resend's REST API directly (`fetch`, no new npm dependency —
  same pattern as `src/lib/tutor/guest-budget-alert.ts`). Sender defaults to
  `onboarding@resend.dev` (Resend's zero-setup shared sender), overridable via
  a new `NOTIFY_EMAIL_FROM` env var once Sim verifies a real sending domain.
  Reads whichever `RESEND_API_KEY` is set in this app's own Railway env — see
  "Resend account/domain" note below.
- `src/app/(site)/unsubscribe/page.tsx` — zero-JS server page, reads
  `?token=`, unsubscribes immediately on load (idempotent), branded
  confirm/invalid states. Matches the `/survey/[token]` page's Shell pattern.
- `src/components/NewsletterSignup.tsx` (all 3 variants) — was `mailto:`-only
  ("launch list isn't wired yet"); now POSTs to `/api/notify` like
  `PfqNotifyDialog.tsx` already did, so the homepage `NotifyBand` actually
  saves to the DB and triggers the same confirmation email.

**RLS gap found and fixed:** `newsletter_subscribers` had a permissive
`"Anyone can subscribe"` policy (`WITH CHECK (true)` for `INSERT`, `public`
role) — meaning anyone could insert arbitrary rows directly via Supabase's
REST API, bypassing this app's own email validation entirely. The app only
ever writes via the service-role client (which bypasses RLS anyway), so this
policy was never needed. Dropped it (migration
`newsletter_subscribers_remove_anon_insert`) — confirmed via `get_advisors`
the WARN is gone, table now behaves like the other service-role-only tables
(no anon policy, same as `guest_tutor_budget`).

**Resend account/domain — explained to Sim, not yet decided by him:** one
Resend API key belongs to one Resend account (login), not one website; an
account can verify multiple sending domains. The `RESEND_API_KEY` already in
Railway for the live PMQ in 5 Days site will work here too as-is (same
account can send for any domain), defaulting to the shared
`onboarding@resend.dev` sender — no action required to ship this. Sim can
later verify `learnincurve.com` (or whatever domain) in that same Resend
account and set `NOTIFY_EMAIL_FROM` to a branded address once he's ready;
doesn't need a second Resend account unless he wants billing/limits kept
fully separate from PMQ in 5 Days.

**Not done / flagged, not fixed:** Linear wasn't reachable this session (MCP
not authorized) so this build isn't reflected there yet — worth a ticket
close-out next session per the standing Linear workflow. Also: Cursor's
orphaned `course_interest` migration file is still on disk (harmless, just
dead code) and hasn't been deleted or discussed with Sim.

**2026-07-28, later same day — copy finalized.** Iterated the confirmation
email copy directly with Sim (via rendered previews, not guessed): course
card sends ("We'll let you know as soon as X launches...") and the general
homepage/newsletter send now have genuinely different body copy (not just a
label swap) — the newsletter one reads "We'll keep you updated with new
project management resources, AI insights, and course launches." / "No spam
- just useful content to help you learn, grow, and stay ahead." as two
separate paragraphs. Logo in the email now matches the site header exactly
(stacked "Learn in" / "Curve" wordmark, Fraunces font, next to the fox mark).
Signed off personally: "All the best, Sim Samaar Shened" — no CTA button
(removed per Sim's request; "Explore Courses" felt like a needless ask on
what's meant to read as a personal note). This is the final approved copy —
`src/lib/notify/send-confirmation-email.ts` is the source of truth, don't
regenerate copy from this log entry if it ever drifts, always read the file.

**Still outstanding before this is truly done:** (1) real inbox test — every
check so far has been the rendered-HTML preview, never an actual send,
because Learn in Curve isn't deployed yet and local testing hits the
localhost-image problem (email clients can't fetch a localhost logo URL);
(2) Linear ticket for this whole build still not created/closed (see above);
(3) `NOTIFY_EMAIL_FROM` still unset anywhere, so live sends will show
`onboarding@resend.dev` until Sim verifies a domain in Resend.
