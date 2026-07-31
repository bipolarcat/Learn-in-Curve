# Cursor prompt — Wave 1 (mechanical/copy/quick-bug tickets)

12 tickets from the LIC-5..41 Linear backlog push, all in **Todo**, all confirmed
ready to build (open questions resolved with Sim 2026-07-08). Independent files,
low collision risk — work through in the order below, commit as you go (the
existing `stop` hook auto-commits, but a clean run-through matters more than usual
here since Claude is working on specs/content in parallel in other files this
session).

## Step 0 — before touching anything

`git status` first. There are 38 modified/untracked files sitting uncommitted
since the last checkpoint (2026-07-07 15:48) — mostly `.cursor/skills/` data
files plus some real `src/` changes (SiteHeader, SiteFooter, AuthForm, layout
files, courses page). **Do not discard or force-reset anything.** If you hit a
stale `.git/index.lock`, confirm no other git process is actually running before
removing it. If the pending `src/` changes look intentional/finished, commit them
first with an honest message before starting Wave 1 — don't let Wave 1's commits
get tangled up with unrelated prior work. Flag to Sim if any of the 38 files look
like something you don't recognize or can't explain.

## Tickets, in order

**LIC-6** — Homepage: remove the "See how it works" button from the top of the
hero. `src/app/(site)/page.tsx` (or wherever the hero CTA row lives).

**LIC-8** — Homepage boarding-pass card copy: "Free - no card required" →
"Free resource". `HeroBoardingPass.tsx`.

**LIC-9** — Header: remove the "Courses" nav item. `SiteHeader.tsx`.

**LIC-25** — Copy: remove the "Golden Rule" prefix wording from exam technique
items. Pure copy change, wherever `golden_rules` content renders on the LO page.

**LIC-23** — LO exam technique section: stop rendering the command-words table
(`exam_technique.command_words`) within each LO's exam technique section. Keep
the underlying data — just don't render this table there. (The new PMQ overview
page, LIC-18, already excludes it by design — this ticket is about the per-LO
section only.)

**LIC-30** — Remove the "Go Deeper" section from every LO page.
`src/app/courses/pmq-in-5-days/lo/[loNumber]/page.tsx`, lines 203–206 — delete
the whole `<section>` block:
```tsx
<section>
  <LoSectionHeading>Go deeper</LoSectionHeading>
  <FurtherReadingList items={body.further_reading} />
</section>
```
This is NOT the same as "Further Reading" on the homepage/overview page
(`PmqOverviewSections.tsx`) — that one stays untouched. One template file, applies
to all 24 LOs automatically.

**LIC-29** — Memory aid cards: enlarge, 3-per-row grid, full-width margin
alignment. Find the memory-aid card component on the LO page and adjust the grid
layout (likely a Tailwind grid-cols change plus sizing).

**LIC-7** — Copy: remove the word "gamified"/"Gamified" from all user-visible
copy. Grep across `src/components`, `src/app`, and any content files — this needs
a full sweep, not just one page. Code comments can keep the word; this is
user-visible copy only.

**LIC-16** — Bug: study plan Day 1 card shows the theme word twice (pill +
plain text). Remove the pill component, keep just the plain-text theme word after
"Day N".

**LIC-14** — Bug (confirm, not necessarily fix): the "DEMO MODE - SIGN-IN
SKIPPED" banner should only show on the no-auth-session/demo path, never for a
real signed-in user. Check the gating logic. If it's already correctly scoped,
close as "confirmed working, not a bug" rather than changing anything. If it
does show for real sessions, that's the actual fix.

**LIC-5** — Homepage: conditional header CTA — "Sign Up" for a new visitor,
"Sign In" for a returning visitor who's already signed up. Note: `PmqStartLink`
already has auth-state routing logic (signed in → dashboard, returning via
`localStorage.lic_has_account` → sign-in, new → sign-up — see 2026-07-06 decision
log). Reuse that same `lic_has_account` signal for the header CTA copy rather than
building new auth-state detection from scratch.

**LIC-38** — In-app feedback via Intercom Messenger (revised scope — see Linear
comment). Install the Intercom Messenger script site-wide, booted from
`NEXT_PUBLIC_INTERCOM_APP_ID`. **Build this defensively: if the env var is unset,
skip rendering/booting the widget entirely — don't throw or break the build.**
Sim is setting up the Intercom account in parallel; the App ID may not exist yet
when you reach this ticket. "Send Feedback" button (wherever it's meant to live —
check for an existing placeholder) calls `window.Intercom('show')` rather than
using Intercom's default launcher bubble, to match the brand system.

## When done

Per `.cursor/rules/documentation-discipline.mdc` (already active): log a
BUSINESS_STATE.md decision-log entry, update `docs/roadmap.md` checkboxes if
relevant, check `legal/PRE_LAUNCH_CHECKLIST.md`. Move each Linear ticket to
**In Review** (not Done) as you finish it — Sim/Claude will do a pass before
marking Done and starting Wave 2.
