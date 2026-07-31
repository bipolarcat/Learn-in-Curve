# Learn in Curve — Design System (v4, "Illustrated Edition")

Source of truth: `brand/BRAND_KIT_v4.html`. This file exists so Impeccable and any
coding agent have the visual system in one place instead of re-deriving it from the
HTML each time. If `BRAND_KIT_v4.html` and this file ever disagree, the HTML wins —
update this file to match.

## Color tokens

| Token | Hex | Use |
|---|---|---|
| `ink` | `#241A12` | Text, borders, dark sections (nav bg tint, about/footer bg) |
| `cream` | `#F4E9D6` | Page background |
| `cream-2` | `#EEDFB8` | Secondary surface (cards / soft fills) — not full-bleed page bands |
| `sand` | `#E8CE93` | NEW — arch/illustration fill in hero background |
| `orange` | `#D5501F` | Primary action color, hero highlight text, CTAs |
| `gold` | `#D9A441` | Accent — eyebrow dots, list bullets, badges, mascot book prop |
| `olive` | `#5F7A3D` | Success/complete state — live course badge, complete journey nodes |
| `teal` | `#1B6560` | Secondary accent — tags, meta text |
| `teal-deep` | `#123F3C` | Deep accent (illustration fill, dark panels inside tickets) |
| `rust` | `#B3341C` | Quiz incorrect + accent fills — not full-bleed page bands |
| `paper` | `#FBF3E1` | Card surfaces (ticket, quiz card) — slightly lighter than cream |

Deltas from v3: added `sand`, `teal-deep`, `rust` for the new illustration/poster
layer. Every other token is unchanged in value — only some were renamed for brevity
going from v2 → v3 (`--color-primary` → `--orange`, etc.), and that renamed set is
what carries forward into v4 unchanged.

## Typography

- **Display** — Fraunces (variable, opsz 9–144, weight 300–900). Headlines, ticket
  titles, big stat numbers. Weight 600 by default, 800 for the stat-block numbers.
- **Body** — Figtree, weights 400–700. Everything else.
- **Mono/stamp accent** — Space Mono, 400/700. Eyebrows, tags, badges, captions,
  marquee text, XP counters — anything meant to read as "stamped" or "ticketed."

## Motion principles

- **One orchestrated entrance, not scattered micro-interactions.** Scroll-reveal
  (`IntersectionObserver` + `.reveal`/`.visible` classes, staggered via
  `transition-delay`) is the default for every section header and card grid.
- **Idle motion is slow and small.** The hero illustration blobs float Â±18px over
  9–11s; the mascot bobs Â±4Â° / 9px over 4.5s. Nothing should feel jittery or demand
  attention outside of a direct interaction.
- **Interaction feedback is immediate and slightly theatrical.** Hover-tilt on cards
  (`translate(-3px,-3px)` + shadow growth), button press-shadow ("sticker" shadow that
  grows on hover), quiz answer shake/flash, "+10 XP" flying text — these should feel
  responsive within ~150ms, not eased into existence.
- **Progress draws itself in.** The journey path SVG uses `stroke-dashoffset` animated
  from full-length to 0 when scrolled into view — this is the core "gamified journey"
  signature and should be preserved in any reimplementation, not simplified to a
  static line.
- **Lamp reveal (Home PMQ live).** Aceternity-style Framer Motion `whileInView`
  (beams widen + copy rises once). Cream/orange skin; `prefers-reduced-motion`
  → final pose. No GSAP scroll scrub. *(Retired from Home 2026-07-31 —
  `PmqLiveLamp` / `ui/lamp` stay in the repo, unmounted.)*
- **Motion happens to objects, never to layout (2026-07-31).** Props drift,
  cards stack, images swap. Type never slides in from the side, the grid never
  reflows, colour never changes. This is why Home can be heavily animated and
  still read calm. Engine is **Framer Motion only** — the No-GSAP-scroll-scrub
  rule above stands, and sticky stacking is CSS-native so nothing pins or scrubs.
  Every animated section renders its final composition immediately under
  `prefers-reduced-motion: reduce`, with no motion, no sticky behaviour and no
  layout shift.

## Signature components

**Ticket card** — the core recurring motif (course cards, hero boarding-pass). Paper
background, 2.5px ink border, offset "sticker" box-shadow (`10px 12px 0 ink`), rotated
2–3deg, circular perforation cutouts on left/right edge, dashed divider line, small
rotated stamp badge in the corner.

**Marketing page layout (locked 2026-07-15)** — continuous cream dotted-paper scroll
for landing, dashboard, and about. Color lives *inside* framed tickets / illustrations /
stamp panels, not as stacked full-bleed section bands. **2026-07-30:** Home teal-deep
Mac/compare stadium band removed — replaced by cream-grid orange lamp + “PMQ in 5 Days
is now live” (`PmqLiveLamp`, `ui/lamp`). Hero is type-on-paper with a single
**Start free with PMQ** stamp CTA under the copy. Meet Sly: console left /
copy right on desktop. No torn seams or checker masthead strips between sections.
**2026-07-31:** Home restaged again — see "Home sections (restaged 2026-07-31)"
below for the current order and per-section rules.

**PMQ live lamp (2026-07-30)** — Aceternity-style conic lamp on the same cream +
dot-grid as `body`; orange brand glow; scroll-in Fraunces title + Figtree body.
Legacy Mac walkthrough components remain in repo but are not mounted on Home.

### Home sections (restaged 2026-07-31)

Order: Hero → Proof → Features → TrialQuiz → Sly → Newsletter. One continuous
cream dotted-paper surface throughout — no full-bleed colour bands, no seams.
Section gaps are `clamp(5rem, 10vw, 8rem)`. One primary CTA per section, all
pointing at the same free-signup destination (`PmqStartLink`).

**Proof — "PMQ in 5 Days is live"** (`PmqLaunchProof.tsx`). Replaces
`PmqLiveLamp` on Home. Centred Fraunces headline, one supporting line, one
`PmqStartLink`; type is completely static. Four props from `brand/inspo/`
(`hero-plane.png`, `hero-takeoff-clouds.svg`, `paper-airplane.svg`,
`mailbox.svg`) drift on `useScroll` + `useTransform`, each on a different
multiplier so they separate in depth. **Deliberately statistic-free** — a launch
announcement carries no substantiation burden and nothing goes stale.

**Features — expanding syllabus slides** (`FeatureStack.tsx`,
`ui/expand-cards.tsx`). Seven supplied 16:9 marketing slides from
`public/Landing page/Learn the full syllabus/`; one quiet Figtree “What’s
included” line sits above them (`text-ink/65`, not a display headline), with no
overlay captions because the artwork contains its own copy. At both sizes a
closed card is a labelled orange plate that crossfades into the artwork on
open, so the collapsed deck reads as a contents list rather than cropped
slivers — vertical spine labels on desktop, 44px rows on mobile. Desktop
expands on hover/focus/click and the deck stays centred; mobile taps expand in
place at the slides' exact 16:9, so nothing is letterboxed or cropped. Plate
colour is `--orange` mixed 85% toward ink: full-strength orange only reaches
3.8:1 against paper text, short of 4.5:1 at label size. Border, 1.25rem radius,
cream and shadow match the Courses catalogue tiles. Pro-only media and the
not-yet-live AI Pro slide retain tier qualifiers.

**Tier badges** — `pmq/tier-badge.tsx` is the single definition of
`ProBadge` / `AiProBadge` / `BetaBadge` (rust). `PracticeGenerateHint.tsx`
imports from there rather than keeping its own copies.

**TrialQuiz** (`TrialQuiz.tsx`) — three real questions for guests, importing
`pmq/PracticeQuiz.module.css` and `McqResponseFields` so it is visually the real
practice console, not an approximation. Local state only: no fetch, no server
action, no DB, and the XP pill is cosmetic. `QuizRunner` is untouched — it needs
auth and writes an attempt row, so it cannot run for a guest. After question 3
the panel resolves into the signup CTA; there is no fourth question.

**Sly — one live window** (`SlyShowcase.tsx` + `SlyTutorWindow.tsx`). No scripted
typing loop: the Mac window opens directly to three suggested questions and the
real composer, backed by `lib/tutor/use-guest-sly-chat.ts` (shared with
`GuestSlyPanel`). Remaining allowance is shown in the title bar; at the cap it
resolves into the signup CTA, never an error. Signed-in visitors get a direct
link into their course because the guest route rejects an authenticated session.
The supplied `brand/sly/sly-tutor-portrait.png` is used for the quiet heading
avatar and Mac title icon. The heading portrait is 48px on mobile and 64px from
640px, with breakpoint-specific loose crops that preserve both ears; it and the
badge sit above the nowrap “Try Sly now” title so the lockup remains one line at
320px. The Mac title icon stays 20px. `AiTutorBadge` shares the exact matt-gold
geometry and colour definition used by `AiProBadge`.

**Floating glass header** — fixed inset rounded-2xl bar (`SiteHeader.tsx`): paper fill,
backdrop-blur, thin `border-ink/25`. Brand lockup: Fraunces wordmark + fox mark.
Controls are modern soft pills (`header-control.ts` / `SiteHeaderControls.tsx`),
Wispr-inspired: rounded-full, sentence-case Figtree, flat fills with no glow
shadow — snappy 150ms press scale. Primary CTA = solid orange; Courses = quiet
bordered pill; icon chrome = transparent circles with ink hover wash. Stamp chips
(`stamp-chip.tsx`) remain for marketing/page CTAs only. Guests: labeled **Courses**
and **Sign up / Sign in** at all sizes. Signed-in users: icon-only soft pills
at all sizes.

**Site footer (2026-07-16, flicker band 2026-07-23)** — full-bleed ink band; labeled footer `<nav>`;
© + version overlaid on a cream flickering-grid spelling “Keep Learning”
(`SiteFooter.tsx`, `FooterFlickerBand.tsx`, `ui/flickering-footer.tsx`). Reduced-motion freezes
the grid; animation pauses off-screen.

**Stamp CTAs** — primary enrol actions use `stampCtaPrimary` from `stamp-chip.ts`
(hero copy, Meet Sly, about LinkedIn), not pill `.btn`. `PmqStartLink` appends
the arrow — do not nest a second `CtaArrow`.

**Live quiz card** — interactive demo on the marketing page: question, four options,
correct (olive) / incorrect (rust, shake), XP pill + progress, explanation line.
**2026-07-31:** Home now uses `TrialQuiz`, which borrows the real practice
console's stylesheet instead of this bespoke card. `QuizDemo` stays in the repo,
unmounted — see "Home sections" above.

**About / content pages** — same paper scroll; Vision/Goal/Values as art+copy grids with
thin-bordered illustration frames; Founder as a paper stamp panel (profile + copy +
stamp CTAs), not a teal-deep band.

## Background texture

- **Dot grid** — body-level `radial-gradient` via `--dot-grid` (emphasized ~0.16 opacity
  ink dots on cream). Default surface for marketing + dashboard. Sections should
  leave it transparent so dots read through.
- **Film grain** — fixed, full-viewport `feTurbulence` SVG data-URI on `body::after`,
  `mix-blend-mode: multiply`, ~5% opacity. Site-wide.
- **Checkerboard accent** — sparingly as a strip accent only; never a dominant bg.
  Do not use checker mastheads between marketing sections after the 2026-07 paper
  restage.

## What NOT to do

- Don't reintroduce full-bleed colored section bands on landing/about/dashboard —
  color goes in tickets, frames, and stamps on cream paper.
- Don't soften the palette into generic SaaS purple/blue. Brand decision (2026-07-01)
  was rejecting a safe/templated look; paper + stamps is the modern restage of that.
- Don't replace flat illustrations with photoreal or 3D.
- Don't turn gamification into badges/confetti-first — journey-path + quiz feedback.
