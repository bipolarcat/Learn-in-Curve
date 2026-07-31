# Site Shell, Dashboard & LO Page Rework — handoff spec for Cursor

Written after reviewing a screenshot of the live LO page plus a long list of new
requirements from the user. This doc audits what's actually built against
`GAMIFICATION_SPEC.md` and `PMQ_NATIVE_MIGRATION.md`, flags one critical DB bug
(already fixed, no action needed), diagnoses the reported "XP doesn't add up" issue,
and specs everything new that was asked for. Read in full before starting — sections
are ordered roughly by dependency, not by priority.

## 0. Audit — what's actually there vs. what was asked

Verified by reading the code directly (`SiteHeader.tsx`, `SiteFooter.tsx`,
`courses/layout.tsx`, `PmqCourseHeader.tsx`, `dashboard/page.tsx`, the LO page,
`MemoryAidsList.tsx`, `demo.ts`, `AuthForm.tsx`, `auth/callback/route.ts`) — Phase A
gamification (XP/streak backend, fly-up animation, quiz correctness) is genuinely
correct and matches spec. The gaps are all new scope, not regressions:

- No `SiteHeader`/`SiteFooter` on any `/courses/*` route — `courses/layout.tsx` is a
  bare wrapper with no shell at all.
- `PmqCourseHeader` isn't sticky, carries no XP/streak/completion, and its
  Home-vs-Dashboard link already *is* conditional on real auth (`isDemoSkipAuth() ?
  "/" : "/dashboard"`) — it only looks wrong right now because `DEMO_SKIP_AUTH=true`
  is on. See section 2.
- Dashboard (`(site)/dashboard/page.tsx`) exists but is a plain `CourseTicket` list —
  no per-course streak/completion/animated-character card.
- No LO "complete" concept, no course-wide completion %, anywhere.
- Quiz section isn't collapsible.
- `MemoryAidsList.tsx` is static, non-interactive.
- LO page sections each render a small red `section-tag` eyebrow *and* a separate,
  differently-worded `<h2>` underneath — see section 8.

## 1. Critical DB bug — already fixed, informational only

**Don't redo this — it's done.** While auditing, found that `section_progress` was
missing two columns the app code has always assumed existed: `course_id` and
`checklist_state`. `maybeMarkQuizComplete` and `updateCheckpointProgress` in
`actions.ts` both insert/update those columns — every write has been failing at the
database level since Phase A shipped. This is almost certainly the real reason
"there is no complete section" and checkboxes don't feel like they persist: they
were never actually being saved.

Applied directly to the `learn-in-curve` Supabase project (`dbjoimidfbftammchnql`),
migration `fix_section_progress_missing_columns`:

```sql
alter table public.section_progress
  add column if not exists course_id uuid references public.courses(id) on delete cascade,
  add column if not exists checklist_state jsonb not null default '[]'::jsonb,
  add column if not exists completed_at timestamptz;
```

`completed_at` is new — not used by any existing code — it's for section 7 below
(the "LO fully complete" concept). Verified via `list_tables`: all three columns now
exist, `section_progress` has 0 rows (nothing to backfill).

**No code change needed for this specific bug** — once you rebuild against current
`main`, checkbox and quiz-completion writes should just start working. Worth a quick
manual check (tick a checkbox, refresh, confirm it's still ticked) before assuming
everything downstream (completion %, dashboard card) is reading real data.

## 2. XP-not-adding-up — diagnosis, not a new bug

`src/lib/demo.ts`: `isDemoSkipAuth()` returns true when `DEMO_SKIP_AUTH=true` is set
in `.env.local`. When there's no signed-in user and this flag is on,
`submitQuizAttempt` short-circuits to `return { ok: true as const }` — no `attempts`
row, no XP, no streak, nothing written. The client's `isGamifiedResult` check
(`"totalXp" in result`) correctly detects this and skips the fly-up/counter update,
so *nothing looks broken client-side* — there's just genuinely no gamification data
to show, by design, for anonymous demo browsing.

This resolves itself once the new sign-in-gated flow in section 3 is in place,
since nobody will be hitting real quiz content without a real session anymore. For
now: to verify XP is actually working, sign in with a real account (not demo mode)
and answer a question — XP should tick up and persist across a refresh. If it still
doesn't after that, that's a real bug worth a follow-up report, but it's very
unlikely given the code is correct.

## 3. Auth flow — "Start free" → sign in → dashboard → course

**Already half-right.** `AuthForm.tsx`'s email/password path already hardcodes
`router.push("/dashboard")` after sign-in, ignoring any `?next=`. But
`auth/callback/route.ts` (Google OAuth + email-confirmation links) does the
opposite — it reads `?next=` and redirects straight back into whatever page
triggered the sign-in, defaulting to `/dashboard` only when `next` is absent. Since
the LO/overview pages redirect unauthenticated visitors to
`/auth/sign-in?next=/courses/pmq-in-5-days/...`, a Google sign-in would currently
skip the dashboard entirely and land the user back in the course — inconsistent
with the email path and with what's being asked for here.

**Fix:** make both paths consistent — always land on `/dashboard` after sign-in,
full stop. In `auth/callback/route.ts`, drop the `next` param handling:

```ts
const next = "/dashboard"; // was: searchParams.get("next") ?? "/dashboard"
```

(Or keep the param plumbing but stop passing `next` from the LO/overview redirects
— either works, but the simplest fix is just always redirecting to `/dashboard`
here, matching `AuthForm.tsx`'s existing behavior exactly.)

Confirm the actual click-path end to end: homepage "Start free →" CTA
(`CourseTicket.tsx`) → not signed in → `/auth/sign-in` → sign in → `/dashboard` →
click the PMQ card → `/courses/pmq-in-5-days` (course overview/landing page) → click
an LO → LO detail page. This is already mostly wired, just needs the OAuth-callback
fix above plus the new dashboard card (section 5).

## 4. Global header + footer on every page

`src/app/courses/layout.tsx` currently renders bare children with no shell. Give it
the same shell as `(site)/layout.tsx`:

```tsx
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream text-ink font-body flex flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
```

This makes the logo/nav/sign-in-or-get-started header and the full footer (with its
existing `/dashboard` link in the PRODUCT column) appear on the course overview
page, every LO page, and the mock exam page — not just the marketing homepage.

**Nav content while signed in:** `SiteHeader.tsx`'s right-hand nav currently always
shows "Sign in" / "Get started", regardless of auth state. Now that this header
appears on authenticated pages too, it needs to branch: signed-out keeps the
existing two buttons; signed-in should show a "Dashboard" link (and optionally
sign-out) instead of "Sign in"/"Get started". `SiteHeader` is currently a client
component with no user data — simplest fix is to fetch the user server-side in
whichever layout renders it and pass `isSignedIn` as a prop, or convert the
right-hand nav into a small server component wrapper. Either is fine; don't
overthink it.

## 5. Course sub-header — sticky, with streak + completion

`PmqCourseHeader.tsx` currently isn't sticky (scrolls away with the page) and shows
no XP/streak/completion. Rework it into a persistent bar that stays fixed at the top
of every course page (overview, every LO, mock exam) — it'll sit directly under the
new global `SiteHeader` from section 4, not replace it. Two bars stacked, both
sticky (`SiteHeader` at `top-0`, this one at `top-[78px]` to match `SiteHeader`'s
fixed `h-[78px]`).

Add:
- `<XpStreakBar xp={...} streak={...} />` (already exists, reuse as-is) — needs
  `getUserCourseStats` fetched wherever this header is rendered, not just on the LO
  page. Since the overview page (`courses/pmq-in-5-days/page.tsx`) doesn't
  currently fetch course stats, add that fetch there too.
- A course-wide completion pill/bar — see section 7 for what "complete" means and
  how the percentage is computed. Render it here once that plumbing exists; don't
  block this header rework on section 7 landing first, just leave a placeholder
  (0%) until it does if you're doing these in one pass.

Remove the existing inline `← Home` / `← Dashboard` link from `PmqCourseHeader`
entirely — that nav now lives in the global `SiteFooter` (already has a `/dashboard`
link) and, since section 4 adds a signed-in "Dashboard" link to `SiteHeader` too,
it'd be a third, redundant copy otherwise.

## 6. Dashboard rebuild

Replace the plain `CourseTicket` list in `(site)/dashboard/page.tsx` with a proper
per-course status card. For PMQ specifically, the card should show:

- Course name + "Enrolled · Ongoing" badge (vs. "Not started" / "Complete" states —
  keep the badge data-driven off completion %, not hardcoded).
- Current streak (reuse `XpStreakBar`'s streak half, or a simplified version).
- Completion percentage (see section 7) as a horizontal bar, **with an animated
  character/marker that moves along the bar** to the current completion position —
  this is the same visual language as `JourneyPath.tsx`'s SVG road + node pattern
  from the homepage rebuild (`REBUILD_PLAN.md` section 2); reuse that
  drawn-path-with-a-moving-marker approach rather than inventing a new animation
  style. A simple CSS `left: {percent}%` position with a transition is enough for
  the marker itself — the "journey path" visual is really about matching the
  existing brand motif (dashed/drawn road, gold marker), not building new physics.
- Clicking the whole card navigates to `/courses/pmq-in-5-days` (the course
  overview/landing page — **not** directly into an LO).

New component: `src/components/CourseProgressCard.tsx` (or extend `CourseTicket.tsx`
with a variant prop — reviewer's call, but don't duplicate the ticket-stub styling,
reuse it). Needs `getUserCourseStats` + the course completion query from section 7
fetched in `dashboard/page.tsx` and passed down.

## 7. "LO complete" + course-wide completion % + a QA workaround

**The concept:** an LO counts as complete when *both* its quiz is fully answered
(`section_progress.quiz_completed_at` is set — already correct, now that section
1's bug fix means it'll actually persist) *and* every item in its
`progress_checkpoint` checklist is checked (`checklist_state.length` equals the
number of checkpoint items for that section — also now fixable post-bugfix). Course
completion % = (number of complete LOs) / 24.

**Persisting it:** rather than re-deriving "all checkpoints checked" by re-fetching
`lessons.body.progress_checkpoint` every time, compute it once client-side (you
already have both counts available — the checklist items array length and the
current `completed` set size in `ProgressCheckpointList.tsx`) and call a new server
action when both conditions become true:

```ts
// src/lib/pmq/actions.ts
export async function markSectionComplete(input: {
  sectionId: string;
  courseId: string;
}) {
  // sets section_progress.completed_at = now() if not already set.
  // Safe to call optimistically whenever the client detects quiz done + all
  // checkpoints checked — don't re-verify server-side for V1, this isn't a
  // security-sensitive value.
}
```

Call this from wherever the last checkpoint gets checked (`ProgressCheckpointList`)
*and* from wherever the quiz's last question gets answered (`QuizRunner`) — whichever
condition is satisfied second is what actually triggers it, so check both
completion conditions in both places.

**New query** — `getCourseCompletion(supabase, userId, courseId)` in `queries.ts`:
count of `section_progress` rows for this user+course where `completed_at is not
null`, divided by `PMQ_SECTION_COUNT` (24). Use this for both the dashboard card
(section 6) and the course sub-header (section 5).

**Known limitation, not a bug:** only LO1 currently has a real `sections` row in the
database (per `PMQ_NATIVE_MIGRATION.md` — the full 24-LO migration, section 7 of
that doc, hasn't been run yet). Completion tracking will only ever show 1/24 max
until that migration runs, because `section_progress` rows are foreign-keyed to
real `sections.id` values and the other 23 LOs are currently served from a JSON
fallback with no real section row to attach progress to. Worth running that
migration in the same session as this work, or soon after, so this feature has
something real to show.

**The "don't gate my testing" ask:** the user explicitly doesn't want the strict
quiz+checkboxes requirement to slow down their own manual QA of the completion
bar/dashboard animation — clicking through 11 questions plus every checkbox on
every LO just to see a percentage move is a lot of friction during testing. Add a
dev-only override, gated behind the existing `DEMO_SKIP_AUTH` env var pattern (or a
new one, e.g. `NEXT_PUBLIC_QA_MODE=true`) — when on, render a small "QA: mark this
LO complete" button on the LO page (visually distinct, e.g. dashed border + "QA
ONLY" label, so it's obviously not production UI) that calls
`markSectionComplete` directly, bypassing the quiz/checklist check. Strip it or
leave it permanently behind the flag — either is fine, just make sure it's never
visible when the flag is off.

## 8. Collapsible quiz section

Wrap the `QuizRunner` section (LO page + wherever else it's used) in a
collapsible/accordion container — click the "Practice quiz" heading to
expand/collapse the question list. Default state: reviewer's call, but expanded by
default probably reads better for a page that's otherwise heavy on reading — the
main ask here is that it *can* be collapsed, not that it starts collapsed. Simple
`useState` + conditional render or a `<details>`/`<summary>` pair styled to match
the existing card aesthetic is enough; no need for a animation library.

## 9. Gamified memory aids

`MemoryAidsList.tsx` is currently static cards (acronym + expansion, no
interaction). Make each card flip/reveal on click — acronym showing by default,
click reveals the expansion (instead of always showing both at once), matching the
"reveal" pattern already used elsewhere on the page (worked example, checkpoint
model answers). Track how many of the LO's memory aids have been revealed and show
a small counter ("2 / 5 revealed") — this is the "gamified" hook: a mini completion
state scoped to this one section, distinct from the main LO-completion tracking in
section 7. Don't wire this into XP/streak — it's a lightweight engagement
affordance, not a scored activity.

## 10. Heading consolidation on the LO page

Every section on the LO page currently renders two headings: a small red
`section-tag` eyebrow, then a separate `<h2>` with different wording immediately
below it. E.g.:

| `section-tag` (small, red) | `<h2>` (large) |
|---|---|
| Memory aids | Acronyms & shortcuts |
| Recap | Quick recap |
| Go deeper | Further reading |
| Progress | Checkpoint |
| Exam technique | How to score marks |
| Practice quiz | Test yourself |

Drop the `<h2>` line for every section and promote the `section-tag` text to be the
*only* heading — restyle it up to `<h2>`-equivalent visual weight (it's currently a
small eyebrow label; give it the size/weight the `<h2>` currently has, keep the red/
`section-tag` color treatment since that's the one being kept). Apply this
consistently across every section on the page (Context, Outcomes, Definitions, Core
content, Apply it, Watch out, Exam technique, Practice quiz, Memory aids, Recap, Go
deeper, Progress) for visual consistency, not just the six named above — having
some sections single-heading and others still double-heading would look
inconsistent. This is a copy/style simplification only — no data or logic changes.

## Definition of done

- `npm run dev` clean, no console errors.
- `SiteHeader`/`SiteFooter` render on the course overview page, every LO page, and
  the mock exam page. `SiteHeader`'s right-hand nav correctly shows
  Dashboard-vs-Sign-in based on real auth state.
- The course sub-header is visibly sticky under the main header while scrolling any
  course page, and shows live XP/streak (and completion once section 7 lands).
- Signing in (either email or Google) always lands on `/dashboard`, regardless of
  which page prompted the sign-in.
- Dashboard shows a real PMQ card with streak, completion %, and an animated
  marker on a progress bar; clicking it opens the course overview page.
- Ticking the last checkbox on LO1 (with its quiz already done) — or vice versa —
  triggers `completed_at` to be set, and the dashboard/course-header % reflects it
  after a refresh.
- The QA-mode override (if built) is invisible unless its env flag is on.
- Quiz section collapses/expands on click without losing any existing
  answer-submission behavior.
- Memory aid cards flip/reveal individually and show a revealed-count.
- Every LO page section has exactly one heading, styled at the previous `<h2>`
  weight, colored/worded as the previous `section-tag`.
- Nothing from Gamification Phase A (XP math, streak math, quiz correctness,
  `attempts` writes) regresses — this build is additive on top of it.

## Explicitly out of scope for this pass

- Running the full 24-LO / mock-exam migration (`PMQ_NATIVE_MIGRATION.md` section
  7) — flagged above as a dependency for completion tracking to be meaningful, but
  it's its own separate, already-spec'd task, not part of this one.
- AI tutor chat logic, badges/leaderboards — still not in scope, as before.
- Phase B (card-based LO content flow) — still deferred, needs its own spec.
