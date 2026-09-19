# Cursor prompt: landing page rebuild (hero + section pruning)

Decided 2026-09-19 with Sim, after a full brief interrogation. This file is the
brief and the build instruction. Everything in "The brief" is settled, do not
reopen it or offer alternatives.

Supersedes the landing sections of `LANDING_SPEC.md`. The two August design
directions (`design-mockups/direction-1-ticket-studio.html`,
`direction-2-editorial-journal.html`) were deleted on 2026-09-19. Illustrated
Edition, as described in `DESIGN.md` v4, is the single visual system.

---

## The brief

**The page has exactly one job: get the visitor into the free PMQ mock exam.**

Not a course chooser. Not a pricing page. Not a newsletter. One job.

Decisions, all settled:

1. **Hero CTA is the free PMQ mock exam.** Single primary CTA. No secondary
   button competing with it.
2. **Hero speaks to PMQ only.** PFQ and PMP appear further down the page, never
   in the hero. A hero that offers a choice is a menu, and menus do not convert.
3. **No price anywhere on this page.** The Pro Bundle at £15 lives on
   `/courses/pmq-in-5-days/pricing`, which already exists. A page whose CTA is
   free must not give a cold visitor a number to hesitate over.
4. **TrialQuiz comes off the page.** It cannibalises the mock exam, which is now
   the capture mechanism. Every visitor who answers sample questions here
   instead of clicking through is a lost email.
5. **FeatureStack drops from seven cards to three.**
6. **NotifyBand moves out of the page and into the sitewide footer.**
7. **SlyShowcase stays**, positioned after the free CTA has had its run.

## Target section order

```
1. Hero              (rebuilt, see below)
2. PmqLaunchProof    (unchanged)
3. FeatureStack      (7 cards -> 3)
4. SlyShowcase       (unchanged, unmoved relative to what remains)
5. Repeat mock CTA   (new, small, closes the page)
```

`TrialQuiz` and `NotifyBand` are removed from `src/app/(site)/page.tsx`.

---

## 1. Hero rebuild

File: `src/components/HomeBrandHero.tsx`

**Reference pattern:** PamPam's hero
(https://mobbin.com/sites/sections/d3a56f6d-f5bb-4d27-9278-c10c0388d8bc).
Look at it before you start. The structure is:

- Large centred serif headline, two lines maximum, deep vertical whitespace
  above and below it
- One short line of supporting copy
- One primary CTA button
- Illustrated objects scattered around the **edges** of the viewport as
  stickers, never behind or crowding the centre column
- The middle third of the hero is empty space. That emptiness is what makes it
  read as minimal and premium. Do not fill it.

**Type:** Fraunces, already loaded in `src/app/layout.tsx` as `--font-fraunces`.
Headline should be noticeably larger than the current hero.

**Scatter assets, all already in the repo:**

```
public/brand/inspo/hero-plane.png
public/brand/inspo/paper-airplane.svg
public/brand/inspo/mailbox.svg
public/brand/inspo/thumbs-up.png
public/brand/inspo/thumbs-down.png
public/brand/inspo/hero-takeoff-clouds.svg
public/brand/auth/sign-up-fox-transparent.webp
```

Use four to six of these, not all. Asymmetric placement, varied scale and
slight rotation, anchored to the left and right edges. On phone width, drop to
two and keep them small and out of the text's way.

**SEQUENCING DEPENDENCY:** several of these are multi-megabyte and are being
compressed by `cursor-prompt-seo-audit-fixes-2026-09-19.md`. Run that prompt
first, or you will wire a 3MB fox into the hero.

**CTA:** keep the existing `FreeMockExamLink` component and its analytics
(`location="hero"`). Only the styling and placement change. Do not rewrite its
tracking.

**Copy:** leave the existing headline text in place for now and ship the layout.
Sim is doing copy separately. If the current headline does not fit two lines at
the new size, flag it rather than rewriting it yourself.

**Existing behaviour that must not break:**

- `HeroPmqMacDemo` and `HeroAnimalsScene`: decide whether either survives the new
  arrangement. If the mac demo no longer has a place in a scatter hero, unmount
  it from the hero but leave the component in the repo, following the existing
  convention documented at the top of `src/app/(site)/page.tsx`.
- `src/lib/pmq/hero-assets.ts` resolves hero mode via `fs.existsSync` on
  `hero-sky-clouds.png`, `hero-plane.png`, `hero-prop.png`, `hero-flight-wide.png`
  and `hero-flight.png`. If the new hero no longer uses that resolver, say so
  explicitly in your report rather than silently leaving dead code.
- The theme script in `src/app/layout.tsx` forces light mode on `/`. Hero must
  look correct in light mode. It is never dark on the home page.
- Entrance animations must not use `animation-fill-mode: both` with an
  `opacity: 0` start. See the LIC-113 comment in `src/app/layout.tsx` for why.

## 2. FeatureStack: seven cards to three

File: `src/components/FeatureStack.tsx`

Keep the three that most directly support "this will get me through the exam".
Sim's steer: the three strongest are the ones about syllabus coverage, practice
that explains why you were wrong, and mocks marked the way the real paper is.
Adjust if the existing card content does not map cleanly, and report what you
chose and what you dropped.

Preserve the sticky stacking behaviour if it still reads well with three cards.
If three cards makes the sticky effect look broken or pointless, flatten it to a
simple three-across row and say so.

## 3. Remove TrialQuiz from the landing page

File: `src/app/(site)/page.tsx`

Remove the `TrialQuiz` dynamic import and its `<section id="home-trial-quiz">`
wrapper. Leave `src/components/TrialQuiz.tsx` in the repo, unmounted, and add it
to the existing "intentionally left in the repo but unmounted" comment block at
the top of the file.

Check whether `TrialQuiz` is mounted anywhere else before assuming this removes
it entirely, and report.

## 4. NotifyBand to the sitewide footer

- Remove the `#newsletter` section from `src/app/(site)/page.tsx`.
- Mount `NewsletterSignup` in the site footer component so it appears on every
  page. Use a compact variant, not the full `NotifyBand` glass shell, which was
  designed to be a page section.
- Keep the "Unsubscribe any time" line and the `/privacy` link. Those are there
  for a compliance reason, not decoration.
- If any page links to `/#newsletter`, update or remove that link.

## 5. Repeat mock CTA at the page bottom

New, small. A single line of copy and the same `FreeMockExamLink`, with
`location="footer-cta"` so it tracks separately from the hero. This is what the
newsletter was occupying. One button, no form, no card.

---

## Out of scope, do not build

The free mock exam currently captures nothing. Sim has decided the score shows
instantly and the detailed breakdown gets emailed in exchange for an address.
**That is separate work with its own Linear ticket. Do not build it here.** This
prompt only changes the landing page.

## Constraints

- Do not bump `SITE_VERSION` manually, the pre-commit hook handles it.
- No database changes. No Stripe changes. No pricing logic.
- Do not touch `/mock-me`, the library, or any course page.
- Use existing tokens from `DESIGN.md`. No new colours, no new fonts.
- Read the "What NOT to do" section of `DESIGN.md` before you start.

## Report back

1. Before and after screenshots of the hero at desktop and phone width.
2. Which scatter assets you used and where you placed them.
3. What happened to `HeroPmqMacDemo`, `HeroAnimalsScene` and the
   `hero-assets.ts` resolver.
4. Which three FeatureStack cards survived and which four you dropped.
5. Whether the sticky stack still works at three cards.
6. Anywhere else `TrialBoard`, `TrialQuiz` or `NotifyBand` was mounted.
7. Confirmation that `npm run build` passes and `/` renders correctly in light
   mode at 375px, 768px and 1440px.
