# Homepage Rebuild Plan — v4 "Illustrated Edition"

Precise, actionable plan for porting `brand/BRAND_KIT_v4.html` into the live Next.js
app. Read this alongside `DESIGN.md` (visual system) and `PRODUCT.md` (strategy).
Goal: a substantial, complete rebuild — not a partial pass. Work through every item
below; don't stop at "looks roughly right."

## 1. Token migration — `tailwind.config.ts`

Current tokens are still on the old v1/v2 naming scheme and are missing every v4
addition. Rename/extend, don't create a second parallel token system:

| Current (`tailwind.config.ts`) | New value/name (from v4) | Action |
|---|---|---|
| `bg.DEFAULT` `#F2E6CC` | `cream` `#F4E9D6` | update value, consider renaming `bg`→`cream` for clarity (grep for `bg-bg` usages first) |
| `bg.alt` `#E7D6AE` | `cream-2` `#EEDFB8` | update value |
| `surface` `#FFFCF3` | `paper` `#FBF3E1` | update value |
| `ink.DEFAULT` `#241A12` | `ink` `#241A12` | unchanged |
| `ink.soft` `#5C4A36` | — | keep for body copy if still used, or replace with `ink` at reduced opacity per v4 (`rgba(36,26,18,.75)` pattern) |
| `primary.DEFAULT` `#D5501F` | `orange` `#D5501F` | same value, consider renaming for consistency with brand kit |
| `primary.dark` `#A83B14` | — | v4 doesn't use a dark-orange variant; drop or keep as a hover shade |
| `gold` `#D9A441` | `gold` `#D9A441` | unchanged |
| `olive` `#5F7A3D` | `olive` `#5F7A3D` | unchanged |
| `teal` `#1B6560` | `teal` `#1B6560` | unchanged |
| `maroon` `#7A2E2E` | `rust` `#B3341C` | v4 replaces maroon with rust for the poster bands — add `rust` as new token, keep or drop `maroon` |
| — | `teal-deep` `#123F3C` | **new**, add |
| — | `sand` `#E8CE93` | **new**, add |
| `line` `#BE9F6C` | — | v4 uses `ink` at low opacity for dashed dividers instead; keep `line` if still referenced elsewhere |

Also add to `boxShadow`: the v4 ticket/card shadow is `10px 12px 0` (bigger than
existing `sticker` `7px 7px 0`) — add a `stickerLg` variant rather than changing the
existing one, since other pages may rely on the current sizes.

## 2. New components to build (don't exist yet)

- **`HeroIllustration.tsx`** — the arch/blob/sunburst layered background composition.
  Pure CSS/SVG, can be a server component (no interactivity).
- **`Mascot.tsx`** — the flat-vector raccoon SVG with the bob animation. Server
  component; animation is pure CSS keyframes, no JS needed.
- **`StatBand.tsx`** (client component) — the three stacked color bands with
  count-up numbers. Needs `IntersectionObserver` + `requestAnimationFrame` for the
  count-up, so `"use client"`.
- **`JourneyPath.tsx`** (client component) — SVG road + 5 nodes + click-to-open detail
  cards + scroll-triggered stroke-dashoffset draw-in. This is the most complex new
  component; port the vanilla JS logic from `BRAND_KIT_v4.html`'s `<script>` block
  directly into React state (`useState` for open node, `useEffect` +
  `IntersectionObserver` for the draw-in trigger).
- **`QuizDemo.tsx`** (client component) — the live interactive quiz card. Port the
  `questions` array, `handleAnswer`, XP state, and the "fly up +10 XP" animation from
  the HTML's script block. Keep the same 3 sample questions as a starting point (real
  question bank comes later, out of scope for this rebuild).
- **`GrainOverlay.tsx`** — site-wide film grain, add once in the root layout
  (`src/app/layout.tsx`), not per-page, so it persists across the whole app per
  `DESIGN.md`.

## 3. Existing components to extend, not replace

- **`CourseTicket.tsx`** — already implements the ticket-stub pattern; update styling
  to match v4's exact border/shadow/perforation values (see DESIGN.md "Ticket card"),
  keep the existing props/data contract (`UserCourse`, `getCourseHref`) as-is.
- **`Marquee.tsx`** — already exists; verify it matches v4's marquee copy/speed
  (26s linear scroll, gold dot separators). Likely just a styling pass.
- **`NewsletterSignup.tsx`** — reuse as-is inside the newsletter section; just needs
  the section wrapper restyled to the `rust` band per v4 (currently likely styled with
  old `bg-alt` token).
- **`SiteHeader.tsx` / `SiteFooter.tsx`** — update to match v4 nav (sticky, blurred
  backdrop, underline-on-hover nav links) and footer (4-column grid, mono section
  labels) if they don't already.

## 4. Page assembly — `src/app/(site)/page.tsx`

Target section order (matches `BRAND_KIT_v4.html` exactly):

1. `<Marquee />`
2. Hero — `<HeroIllustration />` (absolute background) + copy/CTAs + `<Mascot />` +
   ticket card (reuse ticket styling, this one is a static "boarding pass" not tied to
   real course data)
3. `<StatBand />` — stat numbers can be hardcoded for now (2,400 learners / 94% pass
   rate / 5 days avg) per v4; flag as placeholder copy pending real numbers
4. About — 3-card grid with icon badges (existing section, needs icon SVGs added per
   v4 and dark-ink background restyle)
5. Courses — existing `catalogCourses.map(...)` + `<CourseTicket />`, add the
   checkerboard strip accent above it
6. `<QuizDemo />` — new section
7. `<JourneyPath />` — replaces the current static "how it works" step grid
8. Newsletter — existing, restyle section background to `rust`
9. Careers/footer — existing, verify against v4 footer structure

## 5. Definition of done for this rebuild

- Every section in the list above exists and visually matches `BRAND_KIT_v4.html`
  when compared side by side (use Playwright MCP to screenshot both if available).
- Scroll-reveal, count-up, journey draw-in, and quiz click interactions all actually
  work — not just styled to look static-correct.
- `npm run dev` runs clean, no console errors.
- Real routes/links (`/auth/sign-up`, course hrefs) still work — nothing from the
  static mockup got hardcoded over real functionality.
- Site-wide grain overlay is in the root layout, not just this page.

## 6. After the rebuild lands

Run `/impeccable polish the home page` for a detail pass (alignment, spacing,
interaction-state gaps) once the structural rebuild is in — polish is a follow-up
step, not a substitute for doing the full section list above first.
