# Cursor prompt: build the About page

**Linear:** none yet — Linear wasn't connected in the session that wrote this, so this hasn't been logged as a ticket. Create one in team LIC (or ask Sim to) once this is picked up, per the usual workflow.

## What this is

A new standalone About page for the main Next.js app (the one at the repo root — `src/app/(site)/...` — not the `PMQ in 5 days` static site). Copy is finalized and lives in `ABOUT_PAGE_COPY.md` at the project root. Use that file's text verbatim — don't rewrite or embellish it, the wording has already been through a few review rounds with Sim.

There's also a longer, more detailed version of this content in `PHILOSOPHY_PAGE_DETAILED.md` (pricing transparency breakdown, three reworked pillar cards, longer founder bio) — **do not build that one now**. This prompt is for the short/casual version only. The detailed one will get its own prompt later once Sim is ready for it.

## What to build

- New route: `src/app/(site)/about/page.tsx` (URL: `/about`).
- Three short sections in order: **Vision**, **Goal**, **Founder** — headline + one paragraph each, exactly as written in `ABOUT_PAGE_COPY.md`.
- Founder section needs a LinkedIn link with the LinkedIn icon, pointing to `https://www.linkedin.com/in/simsamaarshened`. Check if an icon set is already in use elsewhere in the codebase (e.g. an icon library or inline SVGs already imported in `src/components/`) before adding a new dependency — reuse whatever's already there.
- Follow the existing design system, don't invent a new one: colors/typography/tokens are documented in `DESIGN.md` at the project root (Fraunces for headlines, Figtree for body, the `ink`/`cream`/`orange`/`gold` token palette, etc.), and the homepage's existing "About" section (`src/app/(site)/page.tsx`, search for `OUR PHILOSOPHY`) shows the pattern already in use for a similar dark-background section with `ScrollReveal` — reuse that pattern's structure (section tag, `section-title`, `section-sub` classes) rather than building new components from scratch.
- Keep it visually simple — this is explicitly the "high-level, casual" version. No stat blocks, no pricing breakdowns, no multi-card grids. Three stacked text sections is enough.
- Link to `/about` from wherever makes sense for nav (check `src/app/(site)/layout.tsx` or footer/header components for the existing nav structure and add it consistently with how other pages like `/careers` are linked, if they are).

## What to check while you're in there

- Confirm there isn't already an `/about` route or an anchor link (`#about`) elsewhere pointing somewhere else that this would collide with — the homepage already has an `id="about"` section (the "OUR PHILOSOPHY" one). This new page is a separate route, not a replacement for that homepage section, so don't delete or modify the homepage section as part of this.
- Reduced-motion support: per `PRODUCT.md`'s accessibility section, this codebase requires `prefers-reduced-motion` support on any scroll/entrance animation — make sure `ScrollReveal` (or whatever entrance pattern gets reused) already respects that (it should, if reused correctly from the homepage).

## Why this exists

Sim wanted a simple, casual "why we exist" page distinct from a more detailed philosophy/trust write-up that'll come later. Claude drafted both versions of the copy and this implementation brief; this file is the code half, per the usual Claude-plans / Cursor-executes split. Report back once done — Sim will check the live `/about` route against `ABOUT_PAGE_COPY.md` before considering this done, same as always.
