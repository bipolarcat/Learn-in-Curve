# Claude Code prompt — post-launch urgent fixes (2026-07-31)

**Context:** Learn in Curve (LIC) went live on Railway today at `https://www.learnincurve.com`.
These twelve issues were found during the first live smoke test. All are logged in Linear as
**Urgent** (LIC-103 → LIC-114). Fix all of them in this pass.

**Ground rules for this work:**

1. **Do not guess.** Where this prompt says "investigate" or "verify", actually reproduce the
   behaviour before changing code. Report what you found. A fix based on an assumed cause that
   silently doesn't work is worse than an unfixed bug here — this is live and taking real payments.
2. **Do not hardcode prices anywhere.** See LIC-112 below. There is already a comment in
   `src/lib/pmq/actions.ts` explaining why (the description drifted to "£9.99" after the price
   moved to £8, showing buyers two different prices at the moment of payment).
3. **Report per-issue.** When done, state for each LIC number: what the root cause was, what you
   changed, and how you verified it. Do not report "done" without verification — this project has
   already had an inaccurate "done" claim.
4. **Version bump is automatic** via the pre-commit hook (+0.1). Don't set it manually.
5. **One commit per LIC issue.** Do not squash all twelve into one commit. This is deployed on
   Railway, which rolls back **by deployment** — a single fat commit means a single bad fix forces
   you to roll back all twelve. Granular commits keep rollback surgical. (The version hook bumping
   +0.1 per commit is fine and expected.)
6. **Do not deploy all twelve at once without Sim's say-so.** Twelve simultaneous changes to a live
   site taking real payments is a large blast radius. Land them, get them reviewed, then let Sim
   decide the deploy batching.

### Commands that must pass before you report anything as done

```bash
npx tsc --noEmit          # type check
npm run lint              # next lint
npm run test:unit         # node --test tests/*.test.mjs
npm run test:a11y         # playwright a11y regressions
npm run build             # runs hero-assets test, then next build
```

`npm run build` runs `tests/hero-animals-assets.test.mjs` first — that test already broke the first
Railway deploy today when a `.gitignore` rule swept up `public/brand/hero/hero-animals-2.mp4`. If it
fails, the deploy fails. Don't skip it.

**Three existing tests directly guard work in this prompt — check them specifically:**
- `tests/plan-counts.test.mjs` → guards the advertised quiz/mock figures (LIC-112)
- `tests/pmq-tiers.test.mjs` → guards the tier gating logic (LIC-111)
- `tests/pro-buy-intent.test.mjs` → guards the Pro purchase CTA path (LIC-105)

If your change makes one of these fail, **the test is probably right and your change is probably
wrong.** Do not "fix" a guard test by loosening it without saying so explicitly in your report.

---

## LIC-103 — Remove the first-run onboarding toast

The first thing a new user sees after signup is a toast/prompt reading:

> "Add your exam date so that Sly, the AI tutor, can pace your study."

**Decision (confirmed by Sim): remove it entirely.** No replacement copy, no first-run toast at all.
New users should land with no popup.

Find the component that renders it and remove it.

**Verified constraint:** the value this toast collects is a real, persisted column —
`profiles.target_exam_date` (confirmed present in the live database 2026-07-31). Removing the toast
must **not** drop the column, the write path, or anything reading it.

**Before you remove it, check whether the exam date has any other entry point in the UI.** If this
toast is the *only* place a user can set `target_exam_date`, removing it orphans the column and
silently kills whatever depends on it (Sly pacing, progress projections, etc.). If that's the case,
**stop and flag it** — Sim wants the toast gone, but almost certainly doesn't want the feature gone.
The likely right answer is moving the input somewhere deliberate (profile/settings), which is a
scope increase Sim needs to approve, not a decision for you to make silently.

---

## LIC-104 — Practice quiz: checklist completion wrongly navigates back to the quiz

**Repro:** Don't fully complete the practice quiz → move to the next stage → click "All" and check
off every checkpoint → confetti plays → app navigates back to the quiz.

**Expected:** After the confetti/completion state, **stay on the current page.** No automatic
navigation backward to the quiz, and no automatic navigation forward either. The user moves to the
next learning objective only by explicitly clicking the button for it.

Find the checklist-completion handler and remove whatever triggers that auto-navigation.

**Watch out:** per existing project knowledge, `section_progress` has *two* completion signals —
timestamps **and** `checklist_state`. If any part of this fix touches completion state, make sure
both stay consistent, or the in-LO pathway will show a wrong completion status.

---

## LIC-105 — Free-tier video/audio overview: button styling + dropdown placement

Three changes on the free-tier video/audio overview page (where the video is locked):

1. **Restyle the "Get Pro" button** to match the equivalent button on the dashboard's course card
   exactly. Reuse the existing component/styles from the dashboard course card rather than
   duplicating CSS — see `src/components/pmq/DashboardPmqCourseCard.tsx` for the reference
   implementation.
2. **Remove the "Pro" heading text** near that button.
3. **Move the "Watch included" dropdown.** It currently sits at the bottom of the page next to the
   accessibility dropdown. It needs to sit **directly underneath the Get Pro Bundle button**.

---

## LIC-106 — Learn pathway tab transitions are choppy

Moving between the Learn pathway tabs is visibly choppy; the transition animation isn't smooth.

**Investigate the actual cause before fixing.** Likely candidates, in rough order of probability:
- Full re-render / remount of tab content on every switch rather than swapping visibility
- Animating layout-affecting properties (width/height/top/left) instead of `transform` / `opacity`
- Missing `will-change` or compositor promotion on the animated element
- Expensive synchronous work (data fetch, heavy computation) firing on tab change and blocking paint

Profile it, find which of these it actually is, fix that. Report the real cause.

---

## LIC-107 + LIC-114 — Dark mode: scope it and stop system-driven theming

**These two tickets are almost certainly the same root cause. Fix together, close both.**

LIC-107 is the symptom Sim hit: signing in for the first time on `simsamaarshened@gmail.com` opened
the dashboard in dark mode unprompted.

LIC-114 is the full rule, and it is a **hard rule with no exceptions**:

- Dark mode is available **only** on the **dashboard** and **learning objective pages**, and **only**
  when the user is **signed in**.
- The **home page and every other public/marketing page is always light mode** — regardless of any
  stored preference, and regardless of auth state.
- The site must **never** infer dark mode from the OS/browser `prefers-color-scheme` setting. A
  device with system dark mode enabled must still render this site in light mode. Dark mode is
  **opt-in via the in-app toggle only**.
- **Default for a brand-new user is light mode.**

**Persistence (confirmed by Sim): persist per account.** Once a signed-in user toggles dark mode on,
that choice is stored against their user record and survives logout, re-login, and switching devices,
until they toggle it off. Not per-device, not per-session.

**⚠️ There is no column for this yet — verified against the live DB 2026-07-31.** The `profiles`
table has no theme/dark-mode preference column. Per-account persistence therefore requires a
**new Supabase migration** adding one (e.g. `profiles.theme_preference`), plus read/write wiring.
That is real scope this ticket didn't originally state. Follow the existing migration convention in
`supabase/migrations/`.

**Name collision warning:** `sections.theme` already exists in the database and is **unrelated** —
it's content theming for course sections, not dark mode. Do not read from or write to it.

**Flash-of-wrong-theme risk.** If the resolved theme is applied client-side after hydration, users
will see a flash of the wrong theme on every load — and on public pages forced to light, a dark-mode
user would see a dark flash before it corrects. Resolve the theme **before first paint**: a blocking
inline script in `<head>`, or a server-rendered class on `<html>`. Verify there is no flash on a
slow connection (throttle in devtools), not just on localhost.

**Tailwind config:** check `darkMode` in `tailwind.config.ts`. If it is set to `'media'`, that alone
will make the whole site follow the OS setting regardless of any JS you write. It needs to be
`'class'` (or `'selector'`).

Implementation notes:
- Remove or neutralise any `prefers-color-scheme` media query or system-preference detection that
  currently drives theme. Check both CSS and JS/TS — Tailwind's `darkMode` config in
  `tailwind.config.ts` may be set to `media`, which would need to be `class` (or `selector`).
- Gate the toggle's *availability* and its *effect* to signed-in dashboard + LO routes.
- Force light on all public routes even if a dark preference is stored on the account.

**Verify explicitly:** on a device with OS dark mode switched on, load the home page signed out
(must be light), then sign in and open the dashboard (must be light until toggled), toggle dark on,
log out and back in (must still be dark on dashboard), and navigate to the home page (must be light).

---

## LIC-108 — Signup "check your email" card has no way forward

After signup, a card appears saying "Please check your email." Once the user goes to their inbox,
confirms, and returns to the tab, the card gives them no way onward — they have to manually use the
header's home button to get back into the flow.

Add a **"Continue"** action to that card so the user can proceed directly, and/or a **close/dismiss**
control. At minimum the user must not be stuck relying on header navigation.

Relevant component is likely `src/components/AuthCheckInbox.tsx` — verify before editing.

---

## LIC-109 — Collapsed feature-set tabs: colour, glass effect, stray pagination text

On the stacked feature-set component (`src/components/FeatureStack.tsx` — verify) in its
**collapsed/closed** state:

1. **Colour** should match the site's standard button colour token, with a **glassmorphism**
   treatment applied (translucency + `backdrop-blur`) so it reads as sleek rather than flat.
   Use the existing button colour token — don't introduce a new hardcoded colour.
2. **Remove the stray pagination text** from the collapsed tabs (appearing as "1/2", "1/7", "2/7"
   style fragments). These should not be on the collapsed tabs at all.

Note this is distinct from LIC-110 below — that one is about page numbers on the *cards*, this one
is about pagination fragments on the *collapsed tabs*.

**Contrast risk — this is why `npm run test:a11y` matters here.** Glassmorphism means a translucent
background, so the effective contrast ratio depends on whatever content sits behind it and will vary
as the user scrolls. Text that passes WCAG AA over one background can fail over another. This is the
single most likely change in this prompt to break `tests/a11y-regressions.spec.ts`.

Check contrast against the **worst-case** backdrop, not a convenient one, and check it in **both**
light and dark mode (this component may render in both — verify which). If you can't hit AA with the
intended translucency, reduce the transparency rather than shipping failing contrast, and say so in
your report. Do not loosen the a11y test to make this pass.

---

## LIC-110 — Feature cards show the page number twice

Every feature card displays its page number **twice**: once baked into the source image itself, and
once added by the app's code/overlay.

**Keep the code-added number. Remove the one baked into the source image.**

Preferred fix is replacing the source images with versions that don't have the number rendered into
them. If that isn't possible with the assets available, crop or mask that region — but say so in your
report rather than quietly doing the fallback.

**Before touching any image assets:** per existing project knowledge, some brand/Mascot SVGs in this
repo are fake (raster wrapped in SVG) and are in active use elsewhere. Check what else references an
asset before replacing it.

---

## LIC-111 — Signed-in users can't use Sly; free-message limit should be per-IP

**Three parts.**

**1. Bug:** Signed-in users are currently unable to use Sly at all. Find and fix the cause.

**2. Intended logic:** Every IP address gets **3 free Sly messages**, applied **uniformly whether the
user is signed in or signed out**. Auth state must not affect the free allowance.

**3. Exhausted-state CTA (confirmed by Sim):** Once the 3 free messages are used up:
- The **button label** is **"Join Waitlist"** — matching the existing button on the AI Pro Bundle
  pricing card. Reuse that component/styling; don't rebuild it.
- **"AI Pro Bundle launching soon"** appears as **supporting text** above or below the button — it is
  *not* the button label.

**Important constraint from prior project experience:** for Sly, hard behavioural limits must be
**enforced in code, not via prompt wording** — soft instructions to the LLM have already proven
unreliable here (see LIC-61, spaced-review timing). The 3-message cap must be a real server-side
gate, not an instruction in Sly's system prompt.

**Security note:** IP-based limiting is trivially bypassed (VPN, mobile network change, shared IP
affecting multiple legitimate users on the same office/household connection). That's an accepted
trade-off for a free-tier teaser, not a billing control — but do not let the same mechanism gate
anything the user has *paid* for. Paid entitlements must be tied to the account, never the IP.

### Scope: this is the LANDING PAGE demo Sly, not the in-app tutor

**Read `src/lib/pmq/tiers.ts` before touching anything here.** The tier split has landed and is the
source of truth:

```
             quiz sets   mock exams   video/audio   Sly   report
  starter    1           1            no            no    no
  pro        1-5         1-3          yes           no    no
  ai_pro     1-8         1-4          yes           yes   yes
```

`canAccessSly(tier)` returns `tierAtLeast(tier, "ai_pro")`. **Sly is AI Pro only.** AI Pro is
`status: "waitlist"` and not for sale, so today *no one* has in-app Sly access — including £8 Pro
Bundle buyers. That is correct and intended.

**Therefore the 3-free-messages-per-IP rule in this ticket applies to the guest/demo Sly on the
landing page only.** It is a public teaser for a product that isn't on sale yet, which is why the
exhausted-state CTA is "Join Waitlist" rather than a checkout button.

**Hard constraint — do not violate.** `tiers.ts` states, in its own comment on `canAccessSly`:

> Sly must stay completely hidden — not locked-with-a-teaser — for Starter and Pro until the
> AI Pro Bundle is on sale. Showing a padlocked tutor advertises something the user cannot buy.

So: **do not** surface an in-app Sly panel, padlock, teaser, or upsell to Starter or Pro users while
fixing this. The fix for "signed-in users can't use Sly" is about the **landing page demo working
for signed-in visitors**, not about opening in-app Sly to signed-in users. If your reading of the
bug leads you toward exposing in-app Sly to Pro users, stop and flag it — that would contradict
`tiers.ts` and needs a decision from Sim, not a guess.

**Note for Claude Code:** the comment block at `src/lib/pmq/plans.ts` lines 24-31 is **stale**. It
describes the pre-2026-07-30 single-boolean (`feature = 'ai_tutor'`) model and claims "a Pro
purchase grants everything listed under AI Pro as well." That is no longer true — the webhook grants
real tiers and `tiers.ts` enforces them. Update or delete that comment block as part of this pass so
it stops misleading future readers.

---

## LIC-112 — Stripe checkout description copy

**File:** `src/lib/pmq/actions.ts`, in the `product_data` block of the Checkout Session
(currently around line 803-810).

**Current text:**

> One-time £8 unlock including £5 of Sly fair-usage credit, plus Sly tutoring, extra quiz sets, and
> the AI-graded full mock.

**Replace with (final, confirmed by Sim):**

> Unlock the complete PMQ revision experience with 960 additional practice questions, 2 extra mock
> exams, and video & audio overviews for every learning objective. One-off payment. No subscription.

**These figures were verified against the live database on 2026-07-31 before being approved:**
- Practice: Starter advertises 240, Pro adds 960 → 1,200 claimed. Live practice pool is **1,862**
  (`questions` where `exam_set is null`). Claim sits below reality. ✅
- Mocks: Starter advertises 1, Pro adds 2 → 3 claimed. Live bank has **4** exam sets
  (40 questions / 90 marks each). Claim sits below reality. ✅
- Both match `PMQ_PLANS.pro.features` in `src/lib/pmq/plans.ts` exactly.

**Strongly preferred implementation:** derive "960" and "2" from `PMQ_PLANS` rather than hardcoding
them into the description string. Same reasoning as the price — the pricing card and the Stripe
checkout page must never be able to drift apart and show a buyer two different numbers at the moment
of payment. If the plan features array changes, this string should follow automatically. If deriving
is genuinely impractical, hardcode but add a comment pointing at `plans.ts` as the source of truth,
and say so in your report.

**Also note:** this new copy deliberately **drops the previous promise of "Sly tutoring" and "£5 of
Sly fair-usage credit."** That is correct and intentional — per `plans.ts`, Sly belongs to the
**AI Pro Bundle**, which is `status: "waitlist"` and not for sale. The old description was
over-promising relative to the pricing page. Removing it aligns the two. Do not re-add Sly to this
description.

**Price safety still applies:** the new copy contains no money figure at all, which is the safest
option — Stripe renders the actual charged amount from `unit_amount` beside it. If anyone later adds
a price back into this string, it must use `formatGbp(SLY_UNLOCK_PRICE_CENTS)`, never a literal.
The existing code comment explains why: this string read "£9.99" for a period after the price moved
to £8, showing the buyer two different prices at the point of payment — a misleading price
indication, not merely untidy copy.

Note the product **name** ("Pro Bundle — PMQ in 5 days") is separate from the description and Sim
did not ask for it to change — leave it unless told otherwise.

---

## LIC-113 — Mobile: header intermittently invisible until reload

On mobile, the site sometimes renders with **no visible header**. Reloading brings it back.
Intermittent, not every load.

**Not yet diagnosed — reproduce it first on a real mobile device, not devtools emulation.**
Emulation will very likely not reproduce this, since the most probable causes are mobile-browser
specific.

Candidate causes to investigate (verify, don't assume):
- **Hydration mismatch** on first paint — server and client rendering the header differently
- A scroll-position-dependent show/hide header behaviour initialising to the "hidden" state
- An `IntersectionObserver` or sticky-header effect not firing reliably on first load
- CSS depending on a viewport measurement (`100vh`, `dvh`, safe-area insets) taken before mobile
  browser chrome settles

**Do not "fix" this by forcing a re-render or adding a timeout to paper over it.** Find the actual
cause and report it. A defensive re-render would mask this until it reappears differently later.

**Investigate this together with LIC-107/114 (theme).** Both are "wrong thing renders on first paint,
correct after a reload" symptoms, and both are prime hydration-mismatch candidates. They may well
share one root cause. If you fix the theme's first-paint resolution and the header issue disappears,
say so explicitly rather than reporting two independent fixes — and vice versa.

---

## Verification before you report back

Run through the full smoke path on the live domain in a private window, on both desktop and a real
mobile device:

- [ ] Home loads, light mode, header visible (repeat several times on mobile for LIC-113)
- [ ] Sign up → "check your email" card has a working Continue/Close (LIC-108)
- [ ] No first-run toast appears (LIC-103)
- [ ] Dashboard opens in **light** mode on first sign-in (LIC-107/114)
- [ ] Toggle dark → log out → log back in → still dark on dashboard; home page still light (LIC-114)
- [ ] Learn pathway tabs transition smoothly (LIC-106)
- [ ] Practice quiz → next stage → check all → confetti → **stays put** (LIC-104)
- [ ] Free-tier video overview: button matches dashboard card, no "Pro" heading, dropdown under the
      Get Pro button (LIC-105)
- [ ] Feature cards show exactly one page number each (LIC-110)
- [ ] Collapsed feature tabs: button-coloured, glassy, no pagination fragments (LIC-109)
- [ ] Sly works signed in **and** signed out; 3 messages per IP; then "Join Waitlist" button with
      "AI Pro Bundle launching soon" supporting text (LIC-111)
- [ ] Stripe checkout shows the new description with the correct interpolated figures (LIC-112)

**Do not mark any Linear ticket past In Review yourself.** Report back with root causes and
verification evidence; Claude verifies against actual repo state before anything moves to Done.

---

## LIC-115 — Sell copy must derive from `tiers.ts`, with a test that fails on drift

**Part of this is already done — verify it, don't redo it.** `src/lib/pmq/pro-included.ts` was
rewritten on 2026-07-31 to remove false Pro claims. Confirm it still reads correctly after your
other changes, then build the durable fix.

**What was wrong:** `PRO_INCLUDED` sold "Meet Sly", "AI-marked written answers" and "End-of-course
report" as part of the £8 Pro Bundle, rendered directly under the Get Pro button in
`ProMediaLockedPreview`. `tiers.ts` grants none of those to `pro` — they're `ai_pro`, which is
waitlist-only and not on sale. It also claimed "800+ questions" where /pricing says 960 additional,
and "~280 quizzes" free where /pricing says 240. Dead `PMQ_PRO_SELL_POINTS` (same false claims,
unreferenced) was deleted.

**The canonical claim set is the /pricing page**, which matches `tiers.ts`. Confirmed by Sim:

- **Starter (free):** core content all 24 LOs · 240 practice questions · 1 mock exam · common
  misconceptions · memory aids
- **Pro (£8):** everything in Starter, plus 960 additional practice questions · 2 additional mock
  exams · video overview every LO · audio overview every LO
- **AI Pro (£15, waitlist):** everything in Starter, plus 1,620 additional practice questions ·
  3 additional mock exams · Sly · personalised end-of-course report

**Nothing anywhere may claim more than this for a given tier.** Claiming *less* is safe
(over-delivery). Claiming *more* is a misleading action at the point of sale.

### The work — three layers

**Layer 1.** Formalise `tiers.ts` into a declarative per-tier capability map (data, not just the
existing `canAccessSly` / `canAccessVideo` / `tierForExamSet` / `tierForQuizSet` functions), so sell
surfaces can consume it rather than restate it.

**Layer 2.** Derive every sell surface from that map: `PRO_INCLUDED`, `PMQ_PLANS`, the Stripe
checkout description, `PMQ_TICKET_SELL_POINTS`, FEATURES.md. Wording can live per capability; the
*set of capabilities per tier* must never be hand-written twice.

**Layer 3 — the important one.** Add a test asserting that for every tier, every claim on every
sell surface maps to a capability that tier's gate actually grants. Wire it so `npm run build`
fails on drift. Model it on the existing `tests/plan-counts.test.mjs`, which already guards the
numeric claims.

**Do Layer 3 even if you run out of time for 1 and 2.** Layers 1-2 are hygiene that decays; Layer 3
is what stops this recurring. Without a failing build, the next person to write appealing copy
reintroduces the same exposure silently, on a live site taking payments.

**Also fix in this pass:** the `pro-included.ts` header previously named FEATURES.md as source of
truth. FEATURES.md is stale. If any other file still points at it for feature facts, repoint it at
`tiers.ts` + `plans.ts`.

---

## Known risk register — read before starting

These are the places this work is most likely to go wrong. Each has already been verified against
the live repo or database, so treat them as facts, not speculation.

| # | Risk | Affects | Guard |
|---|------|---------|-------|
| 1 | No `profiles` column exists for theme preference — per-account persistence needs a **new migration** | LIC-114 | Verified against live DB 2026-07-31 |
| 2 | `sections.theme` exists but is **content theming, unrelated to dark mode** — easy to grab the wrong column | LIC-114 | Verified against live DB |
| 3 | Glassmorphism is translucent, so contrast varies with the backdrop and can fail WCAG AA | LIC-109 | `npm run test:a11y` |
| 4 | `tailwind.config.ts` `darkMode: 'media'` would override any JS theme logic | LIC-114 | Manual check |
| 5 | Theme resolved after hydration = flash of wrong theme on every load | LIC-107/114 | Manual check on throttled connection |
| 6 | `profiles.target_exam_date` is a real column — removing its only input orphans the feature | LIC-103 | Verified against live DB |
| 7 | `section_progress` has **two** completion signals (timestamps AND `checklist_state`) — updating one without the other leaves the pathway showing a wrong state | LIC-104 | Known from a prior bad fix in this project |
| 8 | Advertised quiz/mock figures must stay provably true; an unprovable count is a misleading commercial practice under the CPRs | LIC-112 | `tests/plan-counts.test.mjs` |
| 9 | `plans.ts` lines 24-31 comment is **stale and wrong** — says Pro grants AI Pro features. It already caused one false alarm today | LIC-111 | Delete/update it |
| 10 | Some brand/Mascot SVGs in this repo are raster-wrapped fakes in active use elsewhere — check references before replacing any asset | LIC-110 | Known project gotcha |
| 11 | Soft prompt instructions to Sly are unreliable — hard limits must be code-enforced | LIC-111 | Known from LIC-61 |
| 12 | Twelve changes at once on a live site taking payments = large blast radius; Railway rolls back per deployment | All | One commit per issue |
| 13 | Sell copy lives in several hand-maintained arrays with nothing checking them against `tiers.ts` — three false Pro claims shipped to a live buy button this way | LIC-115 | Layer 3 drift test |
| 14 | FEATURES.md is stale and was cited as "source of truth" in `pro-included.ts` — do not trust it for feature facts | LIC-115 | Repoint at `tiers.ts` + `plans.ts` |

## If you disagree with anything in this prompt

Say so before implementing. Several instructions here were written against verified repo state, but
**one instruction in an earlier draft of this document was flat wrong** — it claimed paying Pro
customers were entitled to Sly and would be locked out by LIC-111. That came from trusting a stale
code comment instead of reading `tiers.ts`. It was caught and retracted before implementation.

The lesson applies to you too: **verify against `tiers.ts`, the migrations, and the live schema —
not against comments or ticket descriptions.** If a comment and the code disagree, the code wins and
the comment is a bug to fix. If this prompt and the code disagree, stop and flag it.
