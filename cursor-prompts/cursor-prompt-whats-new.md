# Cursor prompt: What's New (release registry, /whats-new page, dashboard banner, DB-backed New chips)

**Branch:** work on the current working branch (`wip-2026-08-19` unless Sim says otherwise). Do not deploy. Do not run `next build` expecting it to pass in a bridged shell; Sim runs build checks in his own terminal.

**Goal:** replace the hardcoded, localStorage-based "New" chips with one release registry that drives three surfaces: nav chips, a dismissible dashboard banner, and a public `/whats-new` changelog page. Seen-state moves from the browser to `public.profiles`.

**Decided by Sim 2026-09-21:**
- Badge appears in the **nav menu only** for now. Not on dashboard cards, not on page H1s.
- The two current releases are **Mock Me** (`/mock-me`) and **The Shelf** (`/library`).
- Seen-state goes in the DB: new column `whats_new_seen_at` on `public.profiles`.
- **No emails yet.** Build the registry so an email job can read from it later, but do not wire Resend, do not add a send script, do not add any email template in this pass.

---

## 1. Migration: `supabase/migrations/<timestamp>_whats_new_seen.sql`

```sql
alter table public.profiles
  add column if not exists whats_new_seen_at timestamptz not null default now();

-- Existing accounts should see the first announcement; new signups should not
-- (default now() means anyone created after this migration starts caught up).
update public.profiles
   set whats_new_seen_at = timestamptz '2026-09-01 00:00:00+00'
 where created_at < now();
```

Notes:
- Additive and reversible. No RLS change needed: existing profile policies already scope rows to `auth.uid()`.
- **Do not apply this to production yourself.** Write the file, and state clearly in your report that it is unapplied. Sim applies it (the repo's `supabase/migrations` folder is not a reliable record of what is live, so the file existing does not mean it ran).

## 2. Release registry: `src/content/whats-new.ts`

Single source of truth. Adding a future feature must be one object in this array and nothing else.

```ts
export type ReleaseNote = {
  /** Stable slug, never reused. Used as the analytics property and the anchor id. */
  id: string;
  /** ISO date, publication date, not build date. */
  publishedAt: string;
  title: string;
  /** One or two plain sentences. No marketing claims about outcomes. */
  body: string;
  /** Where the feature lives. */
  href: string;
  /** Banner and changelog CTA label. */
  cta: string;
  /** Nav hrefs that get a New chip while this note is unseen. */
  badgeHrefs?: readonly string[];
};

export const RELEASE_NOTES: readonly ReleaseNote[] = [
  {
    id: "2026-09-the-shelf",
    publishedAt: "2026-09-18",
    title: "The Shelf",
    body: "Every practice question in one browsable place, grouped by learning objective.",
    href: "/library",
    cta: "Open The Shelf",
    badgeHrefs: ["/library"],
  },
  {
    id: "2026-09-mock-me",
    publishedAt: "2026-09-14",
    title: "Mock Me",
    body: "Free mock exams for APM PMQ, APM PFQ and PMP, with a readiness score at the end.",
    href: "/mock-me",
    cta: "Try a free mock",
    badgeHrefs: ["/mock-me"],
  },
];
```

Keep the array sorted newest first and add a comment saying so. Dates above are placeholders: use the actual ship dates if you can find them in git log, otherwise leave these.

## 3. Pure helpers: `src/lib/whats-new/index.ts`

No React, no Supabase, so they are unit-testable:

```ts
export const MAX_BADGE_AGE_DAYS = 30;

export function unseenNotes(notes, seenAtIso, nowIso): ReleaseNote[]
export function newestUnseen(notes, seenAtIso, nowIso): ReleaseNote | null
export function newBadgeHrefs(notes, seenAtIso, nowIso): string[]
```

Rules, implement exactly:
- A note is **unseen** when `publishedAt > seenAt`.
- A note only produces a **badge** when it is unseen AND `now - publishedAt <= MAX_BADGE_AGE_DAYS`. The age cap is the whole point: without it a dormant learner returns in six months to a nav full of permanent New chips and the chip stops meaning anything.
- `newestUnseen` ignores the age cap (the banner should still work for a user who has been away), but returns at most one note. Never stack banners.
- All comparisons on ISO strings via `Date.parse`, guard `NaN`, and treat an unparseable or missing `seenAt` as "epoch" (show the note) rather than throwing.

## 4. Profile plumbing

- `src/types/profile.ts`: add `whats_new_seen_at: string;` to `UserProfile`.
- `src/lib/profile.ts`: add it to `emptyProfile` (use `new Date().toISOString()`, matching the DB default so an absent row does not fire a stale banner) and to `normalizeProfile` (`String(row.whats_new_seen_at ?? new Date().toISOString())`).
- Do **not** add it to `UserProfileInput`. It is never user-edited in the profile form.

## 5. Server action: `src/lib/whats-new/actions.ts`

```ts
"use server";
export async function markWhatsNewSeen(): Promise<void>
```

- Resolve the user via `createClient()` and `supabase.auth.getUser()`. No-op silently if signed out.
- `update public.profiles set whats_new_seen_at = now() where user_id = <uid>`. Use `now()` server-side semantics (send `new Date().toISOString()`), never a client-supplied timestamp.
- `revalidatePath("/dashboard")` afterwards.
- Follow the existing style in `src/lib/profile-actions.ts`.

## 6. Nav chips: thread seen-state down, delete the localStorage path

Current state to replace: `MENU_ITEMS` in `src/components/SiteHeaderMenu.tsx` has hardcoded `badge: "New"` on `/mock-me` and `/library`, plus `MENU_NEW_SEEN_KEY = "lic_menu_new_v1"`, `readMenuNewSeen`, `writeMenuNewSeen`, `badgeKeyForPath`, `seenNew` state and `markNewSeen`.

Changes:
1. `src/components/SiteHeaderWithAuth.tsx` already calls `getUserProfile`. Compute `newBadgeHrefs` there from `RELEASE_NOTES` and `profile.whats_new_seen_at`. For a signed-out visitor pass `[]` (see below).
2. Thread a `newBadgeHrefs: readonly string[]` prop through `SiteHeader` -> `SiteHeaderControls` -> `SiteHeaderMenu`. These are typed props, not context. Keep it required in the child, defaulted at the top.
3. In `SiteHeaderMenu`, delete `badge?: "New"` from `MENU_ITEMS` and render `<NewBadge />` when `newBadgeHrefs.includes(item.href)`.
4. **Delete** `MENU_NEW_SEEN_KEY`, `readMenuNewSeen`, `writeMenuNewSeen`, `badgeKeyForPath`, `seenNew`, `markNewSeen` and their effects. Do not leave a dual-source fallback: two sources of truth for "have you seen this" is exactly the bug this change exists to remove.
5. Signed-out visitors get no chips. That is deliberate: the chip is a "since you last looked" signal, and there is no "last looked" for an anonymous visitor. They discover the features from the nav labels and the changelog page.
6. Clicking a badged nav item does **not** mark it seen any more. Only the banner dismiss/CTA and the `/whats-new` page do (section 7 and 8). Keeps one write path.

## 7. Dashboard banner

New client component `src/components/WhatsNewBanner.tsx`, rendered from `src/app/(site)/dashboard/page.tsx` above the existing cards.

- Props: `note: ReleaseNote`.
- Renders title, body, a primary link to `note.href` (label `note.cta`), a quiet text link "See all updates" to `/whats-new`, and a dismiss X.
- Dismiss and CTA click both call `markWhatsNewSeen()`.
- **Not a modal, not a full-screen takeover, no auto-open dialog.** A dismissible inline strip.
- Accessibility: wrap in `<section aria-labelledby>`; the X needs `aria-label="Dismiss update"` and a visible focus ring matching the existing `focus-visible:ring-orange/55` convention. The banner must not be the first focusable element that traps keyboard users before the page heading.
- Styling: reuse existing surface tokens (`productSurfaceQuiet` is already imported in the dashboard page) and the orange accent used by `NewBadge`. Do not introduce new colour values.
- In `dashboard/page.tsx`, compute `newestUnseen(RELEASE_NOTES, profile.whats_new_seen_at, new Date().toISOString())` server-side and render nothing when it is null.

## 8. Public changelog page: `src/app/(site)/whats-new/page.tsx`

- Server component, public, no auth gate. Signed-out visitors can read it.
- Maps `RELEASE_NOTES` in order: date, title, body, link. Each entry gets `id={note.id}` so `/whats-new#2026-09-mock-me` works.
- `export const metadata`: title "What's New", a one-line description. Follow whatever canonical/OG helper the other `(site)` pages use, and add the route to the sitemap alongside the existing entries.
- If the user is signed in, call `markWhatsNewSeen()` when the page renders (they have now literally seen everything). Do this in the page body, not in a client effect.
- Link to `/whats-new` from the footer and from `DashboardProfileMenu`.

## 9. Analytics

Existing PostHog capture conventions live in `src/lib/analytics` (follow whatever wrapper the dashboard components already use, do not call posthog directly). Add:

- `whats_new_banner_shown` with `{ note_id }`, fired once per render of the banner.
- `whats_new_banner_clicked` with `{ note_id, href }`.
- `whats_new_dismissed` with `{ note_id }`.
- `whats_new_page_viewed`.

Without these there is no way to tell whether announcing a feature moves adoption, which is the reason the banner exists.

## 10. Tests: `tests/whats-new.test.mjs`

`node --test` style, matching the existing `.test.mjs` files. Cover:
1. A note published after `seenAt` is unseen; one published before is not.
2. A note older than `MAX_BADGE_AGE_DAYS` produces no badge href even when unseen.
3. `newestUnseen` returns exactly one note when several are unseen, and the newest one.
4. `newestUnseen` still returns an old unseen note (age cap does not apply to the banner).
5. Missing or malformed `seenAt` does not throw and treats the note as unseen.
6. Every `badgeHrefs` value in `RELEASE_NOTES` matches a real `MENU_ITEMS` href, so a typo in the registry cannot silently produce a chip that never renders.
7. Every `id` in `RELEASE_NOTES` is unique and the array is sorted newest first.

Add `tests/whats-new.test.mjs` to the `build` script's `node --test` list in `package.json`, next to the other invariant tests.

## Constraints

- `npx tsc --noEmit` must be clean.
- `npm run test:unit` must pass.
- No new npm dependencies.
- No hardcoded prices, copy or dates anywhere except `src/content/whats-new.ts`.
- Do not touch PFQ or PMQ entitlement, tier or checkout code. This change has no commercial gating in it.
- Do not apply the migration to production.
- House style: no em dashes or en dashes in user-facing copy.

## Report back

State plainly: files added, files changed, files deleted, whether tsc and unit tests pass, and that the migration is written but unapplied. If you could not do something, say so rather than reporting it done.
