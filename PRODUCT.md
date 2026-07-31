# Learn in Curve — Product Context

This file exists so Impeccable (and any other design-aware agent) has real strategic
context instead of generic defaults. Written directly from `BUSINESS_STATE.md` rather
than an interview — treat this as an answer key, edit anything that feels wrong.

## Register

**Brand surface.** This is a marketing/landing page — a first impression that has to
sell the idea "revision that doesn't feel like revision" in about eight seconds. It is
not a dashboard or workflow tool; density and restraint are not the goal here. Bold,
confident, a little theatrical is correct.

## Who this is for

Not "learners." Specifically: someone studying for the APM PMQ exam, most likely a
junior-to-mid project coordinator/PM who's been told to get certified, revising in
short bursts around a day job — evenings, commutes, lunch breaks. They've probably
already looked at a 200-page PDF or a generic Udemy-style video course and found it
lifeless. They are not looking for entertainment; they're looking for something that
makes a boring, necessary task less punishing, and they want proof (a mock exam pass,
a certificate) that it worked.

## Brand voice, in three words

**Confident, warm, unpretentious.** Not corporate-EdTech ("empower your learning
journey"). Not childish-gamified (no mascots-as-cute-pets, no confetti-for-everything).
Think: a well-designed travel/transit brand crossed with a good indie bookshop —
playful in craft and detail, serious about the outcome.

## Visual references (named, not adjectives)

- **Replit's "100 Day Journey"** — path-map gamification metaphor, not badges/points-first.
- **Claude / Savee / Sana AI** — vintage ticket-stub and cassette-sleeve aesthetics,
  perforated edges, boarding-pass framing.
- **Vintage travel/film poster design** (Kodak-era print ads) — bold flat color in
  framed stamps/tickets (not stacked full-bleed page bands after the 2026-07 paper
  restage), confident oversized wordmarks, film grain, dotted cream paper scroll.
- **Flat geometric retro illustration** (see `brand/inspo/`) — simplified shapes, warm
  saturated palette (teal / mustard-orange / cream / rust), arch and circle motifs used
  as background composition, not decoration for its own sake.

## Anti-references (explicitly not this)

- Duolingo-style bright, mascot-cute, confetti-heavy gamification — rejected on
  2026-07-01 as too childish for this audience (see `BUSINESS_STATE.md` decision log).
- Generic SaaS landing page patterns: purple/blue gradients, Inter/Roboto type,
  hero-with-stock-photo-of-laptop, three-icon feature grids with no personality.
- Anything that reads as a PDF-with-a-UI. The entire point of the product is that it
  isn't that.

## Product thesis

A gamified, interactive, exam-focused revision platform — not a general PM learning
platform. Pitch: pay a small one-time fee (~Â£10) for an interactive course instead of
paying more for a static PDF. First course: APM PMQ in 5 Days (free, live). Planned:
PFQ in 2 Days, PMP in 5 Days, CAPM in 2 Days.

## What "gamified" actually means here

Not points for their own sake. Specifically: a visible journey/path metaphor with
locked/current/complete states, instant feedback on practice questions (not a wait for
a marked script), streaks that reward consistency over cramming, and a real mock exam
+ certificate as the payoff — not a badge, an actual credential-shaped outcome.

## Current build context

Next.js 15 (App Router) + Tailwind + Supabase Auth. Homepage lives at
`src/app/(site)/page.tsx`. The live brand direction is `brand/BRAND_KIT_v4.html`
("Illustrated Edition") — see `DESIGN.md` for the full token/component breakdown and
`REBUILD_PLAN.md` for exactly what needs to change in the Next.js app to match it.
