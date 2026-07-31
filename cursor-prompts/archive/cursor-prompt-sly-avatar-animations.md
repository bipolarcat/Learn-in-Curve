> **Superseded 2026-07-18 — do not pick this up.** Sim decided the circular avatar icons (fox-face.svg) stay static; the hero-only animation prompt (`cursor-prompt-sly-hero-animation.md` at the project root) replaces this scope. Archived unexecuted, kept for reference only (the clip inventory and public/ copy step below are still accurate if avatar animation ever comes back).

# Cursor prompt: animate the Sly avatar icon (idle + thinking states)

**Linear:** none yet — Linear wasn't connected in the session that wrote this, so this hasn't been logged as a ticket. Create one in team LIC (or ask Sim to) once this is picked up, per the usual workflow.

## What this is

Sly (the fox mascot) currently appears everywhere in the app as a **static image**: `/mascot/fox-face.svg`, rendered inside a small circular wrapper (`overflow-hidden rounded-full`, `object-cover object-top`) at sizes ranging from 20px to 68px. Sim asked for this to become a subtle looping animation instead — scope explicitly limited to **swapping the existing static icon for video, with no layout or design changes**. This is not a full-body hero placement (that was considered and explicitly ruled out for this pass — see `SLY_CHARACTER_BIBLE.md`'s Animation section for why: nothing in the current UI has a full-body Sly slot, and building one is a separate design decision for later).

Two Veo-generated, web-ready clips exist for this, already trimmed and with audio stripped (raw + processed versions both live in `brand/Mascot/`, not yet copied into `public/`):

- `brand/Mascot/1 animate 2 - web.mp4` — idle loop: blink + subtle breathing only, loops cleanly (first/last frame match). This is the default/ambient state.
- `brand/Mascot/1 think - web.mp4` — thinking pose, trimmed to a genuine ~5.15s held-pose window (paw to chin). Use this specifically for the "Sly is thinking" state described below, not as a general-purpose loop.

Full detail on both clips (proportions, palette, validation notes) is in `SLY_CHARACTER_BIBLE.md` at the project root — read that first for context on what's locked (palette, outline weight, proportions) vs. flexible, and don't regenerate or re-trim these clips without checking it.

## What to build

1. **Copy the two web-ready clips into `public/mascot/`** (e.g. `public/mascot/sly-idle.mp4`, `public/mascot/sly-thinking.mp4`) — they currently live outside the served asset root and need to be there for a `<video src>` to work. Feel free to re-encode/compress further if file size matters for your target (they're currently h264, ~700KB–1MB each).

2. **Build a small shared component** (e.g. `SlyFace` — note there are already two near-duplicate local `SlyFace` functions, one in `GuestSlyPanel.tsx` and one in `AiTutorPanel.tsx` — worth consolidating into one shared component in `src/components/SlyChrome.tsx` or similar while you're touching this, rather than editing both in parallel and letting them drift further) that renders:
   - `<video autoplay muted loop playsinline>` pointing at `sly-idle.mp4` by default, using the exact same wrapper/sizing classes the current `<Image src="/mascot/fox-face.svg">` calls use (circular clip and cropping should come for free from the existing container styles — verify this visually once wired up, see note below).
   - An optional prop (e.g. `state: "idle" | "thinking"`) that swaps the video `src` to `sly-thinking.mp4` when thinking, `loop` still on (the clip is a held pose, so looping it reads fine as ambient "still thinking").
   - Respect `prefers-reduced-motion`: fall back to the static `/mascot/fox-face.svg` image (no video) when the user has reduced motion enabled. There's precedent for this pattern already in `AuthDeskScene.tsx` (comment: "Static under prefers-reduced-motion") — follow whatever mechanism that file uses for consistency.

3. **Wire the `thinking` state into the two chat panels** where it has a real semantic match:
   - `GuestSlyPanel.tsx` — the `isThinking` boolean (line ~395 in the version read for this prompt) already exists and drives the three-dot typing indicator. Pass `state={isThinking ? "thinking" : "idle"}` into the SlyFace instance rendered alongside it (`showAssistantFace` block, ~line 410).
   - `AiTutorPanel.tsx` — same pattern, its own local `isThinking` (~line 592) and `SlyFace` usage (~line 609).

4. **Swap the remaining static `fox-face.svg` instances to the idle-loop video**, for consistency, at your judgment on which are worth it: `SlyShowcase.tsx` (68px, homepage "Meet Sly" module — probably the highest-value one after the two above), `DashboardPmqCourseCard.tsx` (two instances, 20–28px), `SlyMacConsole.tsx` (20px, Mac title bar). The very small ones (≤20px) may not be worth the video overhead — use your judgment, this isn't a hard requirement, just leave them as the static SVG if a video swap doesn't add anything visible at that size.

## What to check while you're in there

- **Crop framing — verify visually, don't assume.** The static SVG is a pre-cropped face-only asset; the video clips are the full-body Veo output (1280×720, fox standing/reading, framed with room around him). `object-cover object-top` on a circular container will crop the video the same way it crops the image, but whether that lands on Sly's face nicely (vs. too much headroom, or cutting off the top of his head) needs an actual look once it's wired up — may need `object-position` tuned, or the source clips cropped/re-exported tighter before this even reaches `public/`. Don't ship this without eyeballing it at actual render size (20–68px), not just at full video resolution.
- Reduced-motion fallback is a real accessibility requirement in this codebase (see the note in `cursor-prompt-about-page.md` referencing `PRODUCT.md`'s accessibility section) — don't skip it because the motion here is small.
- `<video>` elements need `muted` as an actual attribute (not just relying on autoplay-without-sound policy) for autoplay to work reliably across browsers — the source files already have audio stripped at the file level too, so this is belt-and-suspenders, but keep the attribute anyway.
- Don't touch `/mascot/fox-face.svg` or `/mascot/fox-full-body.svg` themselves — they're fake vectors (raster-wrapped) but still referenced elsewhere; this task replaces *usages* of them with video, not the files.

## Why this exists

Sim wants Sly to feel alive in the product without a full redesign. A full-body animated placement was considered (see `SLY_CHARACTER_BIBLE.md`) but explicitly deferred — nothing in the current UI has a slot for it, and that's a design decision for later, not a code task. This is the scoped-down version: animate the avatar icon that already exists everywhere, using the two clips whose motion actually reads well at small size (idle ambient loop, and a thinking pose that has a genuine semantic match in the chat panels' typing-indicator state). Claude drafted this brief and did not touch any code, per Sim's standing instruction — Cursor does the implementation. Report back once done; Sim will check it live against the crop-framing note above before considering this finished.
