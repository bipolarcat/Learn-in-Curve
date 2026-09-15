# Cursor prompt: add Sly animation to the homepage hero

**Linear:** none yet — Linear wasn't connected in the session that wrote this, so this hasn't been logged as a ticket. Create one in team LIC (or ask Sim to) once this is picked up, per the usual workflow.

## What this is

Add a looping Sly animation to the homepage hero section — and **only** the hero. Sim explicitly decided the small circular avatar icons elsewhere in the app (`SlyShowcase.tsx`, `GuestSlyPanel.tsx`, `AiTutorPanel.tsx`, `SlyMacConsole.tsx`, `DashboardPmqCourseCard.tsx`, all using `/mascot/fox-face.svg`) stay static — don't touch any of those as part of this task, that's a separate, deliberately-shelved idea (see `cursor-prompts/archive/cursor-prompt-sly-avatar-animations.md` if curious, but it's superseded, not something to also implement).

The hero is `src/app/(site)/page.tsx`, the `<section className="hero ...">` block (roughly lines 41–75 in the version read for this prompt). Right now it's text-only: an `h1`, a paragraph, and a CTA button, all inside a `max-w-[38rem]` div, with staggered entrance animations already wired up (`hero-enter` class + `--hero-i` CSS custom property per element, defined in `globals.css`). **There's no mascot here today at all** — this isn't a swap, it's new real estate. Two things in the existing markup hint the section was left room for a visual: the content div is capped at `max-w-[38rem]` (implying space to its side isn't meant to stay empty on wider screens), and the section itself has `overflow-x-clip` (a bleed allowance typically used for a decorative graphic that extends past its container). Treat both as a hint, not a hard spec — use your judgment on the actual layout, see below.

The clip to use is the idle loop: `brand/Mascot/1 animate 2 - web.mp4` — blink + subtle breathing only, no other motion, loops perfectly (first and last frame match), audio already stripped at the file level. Full validation notes, palette, and proportions are documented in `SLY_CHARACTER_BIBLE.md` at the project root — read that first. Don't use the wave, jump, or thinking clips here; this is the one built for exactly this kind of ambient, always-on placement.

## What to build

1. **Copy `brand/Mascot/1 animate 2 - web.mp4` into `public/mascot/`** (e.g. `public/mascot/sly-hero-idle.mp4`) — it currently lives outside the served asset root. Also export a still frame from it (first frame is fine, it's the loop's neutral rest pose) as a poster/fallback image, or just reuse `brand/Mascot/sly fox png.png` (the master color reference, already full-body neutral pose) — either works as the `<video poster>` and as the reduced-motion fallback image.

2. **Add the video to the hero**, sized as a genuine visual element (not a tiny icon — this is the one place in the app that's meant to show Sly full-body). Reasonable default: a two-column layout on larger screens (text left, Sly right), collapsing to stacked on mobile — `SlyShowcase.tsx` already uses a comparable grid (`grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]`) for a similar text+visual pairing; mirroring that pattern would keep it consistent with the rest of the homepage rather than inventing a new layout approach. This is a real layout call — use your own judgment on exact proportions and breakpoints, just don't let Sly crowd out or push the CTA below the fold on mobile.

3. **`<video autoplay muted loop playsinline poster="...">`** pointing at `sly-hero-idle.mp4`. Give it its own `--hero-i` value and the `hero-enter` class (or a variant of it) so it participates in the same staggered fade-up entrance as the text, rather than popping in separately.

4. **Respect `prefers-reduced-motion`**: fall back to the static poster image (no video element rendering, or a paused/hidden video — follow whatever mechanism `AuthDeskScene.tsx` already uses for its reduced-motion fallback, for consistency with the rest of the codebase).

5. **Optional, not required:** `globals.css` already has two unused motion keyframes that were seemingly set up for a mascot-style element and never wired to anything — `mascot-bob` (a gentle rotate+bob wiggle, `.motion-safe:animate-mascot-bob`) and `courses-hero-img`'s drift animation. If either adds something on top of the video's own built-in motion (e.g. a subtle container-level sway framing the loop), feel free to use it — but don't force it in if the video's native motion already reads well on its own; two overlapping motions can look busy.

## What to check while you're in there

- **This is the only full-body Sly placement in the app right now** — there's no existing crop/framing precedent to lean on like there was for the avatar icons. Check the actual composition at real hero display size, on both desktop and mobile breakpoints (the hero visibly reflows a lot between them — `max-w-[38rem]` on the text column, stacked layout implied on mobile). Don't assume the raw 1280×720 Veo framing works at whatever size you land on without looking.
- **Performance**: unlike the tiny avatar icons, this is an above-the-fold, immediately-visible video on the homepage's most-loaded page. Check actual load behavior — whether `preload="auto"` vs. relying on the poster + lazy start is the better call, and confirm it doesn't visibly delay or shift the text entrance animation (`hero-enter`) that's already there.
- Confirm the CTA button (`hero-stamp-cta`, "Start free with PMQ") stays fully visible and easy to tap on mobile once Sly is added — don't let the mascot push it below the fold.
- `muted` needs to be a real attribute (not just relying on autoplay-without-sound browser defaults) for autoplay to work reliably — the source file already has its audio track stripped too, so this is belt-and-suspenders, but keep the attribute regardless.
- Don't touch the circular avatar icon instances anywhere else in the app as part of this task — that's explicitly out of scope, see above.

## Why this exists

Sim wants the hero to feel alive rather than static text-and-button, and specifically wants this scoped to just the hero for now — the earlier idea of animating every small avatar icon across the app was shelved in favor of one deliberate, higher-impact placement. This is genuinely new UI (no existing full-body Sly slot to swap into), so there's more layout judgment involved here than in a typical asset swap — use the guidance above as a strong default, not a pixel-exact spec. Claude drafted this brief and did not touch any code, per Sim's standing instruction — Cursor does the implementation. Report back once done; Sim will check the live hero (desktop and mobile) against the framing and performance notes above before considering this finished.
