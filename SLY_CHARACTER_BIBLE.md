# Sly the Fox — Character Bible

Master reference for Learn in Curve's mascot. Any new Sly asset (illustration, animation, merch, UI icon) must match this spec. If something isn't documented here, don't guess — extend this file first, then produce the asset.

**Master reference file:** `brand/Mascot/sly fox png.png` (1377×768, full color, standing/reading pose)
**Vector trace:** `brand/Mascot/sly mascot full body.svg` (real vector — B&W line trace, threshold 50, produced via Canva Tracer)

Note: `Fox mascot - Full body.svg` and `Fox mascot - Face.svg` in this same folder are NOT true vectors (raster PNG wrapped in an SVG container, 0 path elements) and are a different, older fox design. They're still in active use elsewhere in LIC — don't delete or replace them. Use the two files above for all new Sly work.

## Proportions

Measured directly off the vector trace (ink bounding box analysis, not eyeballed):

- **Total figure height:** ~325px reference unit (ear tip to base of feet)
- **Head height (ear tip to chin):** ~100px → **head ≈ 31% of total body height**. This is a deliberately oversized head — standard for friendly/approachable mascot design (same logic as Duolingo's owl).
- **Ear height (tip to base):** ~45px → **ear ≈ 45% of head height**
- Torso/leg split: legs visibly separate from the torso mass around 65-70% down the total height.

When redrawing or regenerating Sly in a new pose, these ratios should hold within a few percent. If a pose looks "off-model," proportions drifting is the first thing to check.

## Color Palette

Sampled directly from the master reference PNG (pixel-exact, not estimated):

| Element | Hex | Notes |
|---|---|---|
| Fur — primary orange | `#D46320` | Main body/head fur |
| Fur — orange (shadow tone) | `#C2632A` | Secondary shading seen on thighs in the painterly reference; flatten to primary orange for the rigged/flat-vector version |
| Fur — cream/white | `#F8F1E0` | Chest patch, cheek, tail tip |
| Outline / linework | `#2C1E15` | All character outlines |
| Paws / gloves | `#332214` | Slightly warmer than pure outline black — keep distinct |
| Shirt — teal | `#6DA490` | |
| Background — cream | `#F5ECE0` | Very close to fur cream but a distinct value; keep them separate unless a designer intentionally unifies them |

For the rigged/animated version, use flat single-hue fills (no painterly shading) — shading complicates rigging and doesn't hold up under animation.

## Never Changes

These identity markers must appear in every version of Sly, regardless of pose or animation:

- Glasses — always on, same frame shape
- Thick, consistent outline weight (`#2C1E15`)
- Ear shape and proportion (see Proportions above)
- Tail shape with cream/white tip
- Black-gloved paws (not bare paws)
- **Teal necktie** — canonized 2026-07-18. It appeared unprompted in 3/3 AI generations (both reference poses and the idle-loop animation), so rather than keep fighting the model's default, it's now official. Master reference PNG/SVG predate this decision and don't show it — treat the tie as the current canon going forward, not those two files.
- The color palette above

## Allowed to Vary

- Pose and body position
- Facial expression
- Props/accessories (book, graduation cap, trophy, laptop, etc.)
- What he's holding or interacting with

Being explicit about what's flexible matters as much as what's fixed — it prevents both over-caution (never varying anything) and drift (accidentally varying something that should be fixed).

## Reference Poses

Generated via Google AI Studio (Nano Banana), image-referenced off the master PNG. All three saved in `brand/Mascot/`:

- `1.jpg` — neutral standing, arms at sides, no props
- `2.jpg` — same standing pose, big open-mouth laughing/celebration expression
- `3.jpg` — intended as a 3/4 turn; in practice reads very close to the master reference's existing angle, so it doesn't add much as a true turnaround view. Kept as-is for now (not worth a regen cycle at this stage).

**Necktie — resolved 2026-07-18:** appeared unprompted across 3/3 AI generations. Canonized as part of the outfit — see Never Changes above.

## Animation

**Tool/approach (point 2 of the animation directive):** Google AI Studio / Veo (image-to-video), not a reusable After Effects/Duik rig. Sim already has Google AI Pro (confirmed via Lenny's Product Pass in Notion), and it's the same workflow already used for the reference poses. Trade-off: no reusable puppet rig — each animation moment is its own Veo generation from a reference still, budgeted against the ~1,000 Flow credits/month on the Pro plan (roughly 100 Lite / 50 Fast / 10 Quality-tier clips).

**Idle loop — validated 2026-07-18.** Two iterations:
- `1 animate.mp4` (v1): motion included an unrequested hand-to-chest gesture; loop seam didn't close cleanly (first/last frame mismatched).
- `1 animate 2.mp4` (v2, current template): tightened prompt to blink + subtle breathing only, no arm movement, explicit "loop perfectly" instruction. Result: clean loop, first/last frame match closely, palette and proportions held throughout. **Use this as the template prompt structure for all future animation-vocabulary clips.**

Template prompt pattern that worked: describe the ONE small motion allowed, explicitly say "no other movement," and explicitly request the loop to close (first frame = last frame).

**Animation vocabulary — CORRECTED 2026-07-18.** The table below (hero section / enrol gate modal / `#progressFill` / FAQ section) was grounded in `PMQ in 5 days/index.html`, the live static site. That site is **not** the target — Sim confirmed 2026-07-18 that this work is for the separate, not-yet-launched Learn in Curve Next.js app (`src/app/`), and that Cursor (not Claude) will write the embed code. The mapping below never applied to that codebase and has been struck.

Read-only investigation of the real Next.js app (`src/app/`, `src/components/`) turned up a more fundamental finding: **there is no full-body Sly placement anywhere in the current UI.** Every existing Sly appearance is a small circular face-crop icon (20–68px) used as an avatar/chrome element — `/mascot/fox-face.svg` (the fake-vector file, see note at top of this doc) cropped to just the face, reused across `SlyShowcase.tsx` (homepage "Meet Sly" section, 68px), `GuestSlyPanel.tsx` and `SlyMacConsole.tsx` (tutor chat header/messages, 20–28px), and `DashboardPmqCourseCard.tsx` (20–28px). None of these are a full-body shot at any size, so the Veo clips (built around full-body standing/reading Sly) don't have an obvious drop-in slot — this is a real design decision, not a code task, and shouldn't be handed to Cursor as if it were one.

One genuine semantic match did turn up: `GuestSlyPanel.tsx` has a literal "Sly is thinking" typing-indicator state (three bouncing dots, rendered while waiting on the AI response) — an exact conceptual fit for the thinking-pose clip, just currently rendered at tiny avatar scale, not full-body.

| Animation | Old (wrong) mapping | Real Next.js situation |
|---|---|---|
| Idle loop | ~~Hero section~~ | No full-body hero slot exists. Closest candidate: `SlyShowcase.tsx`'s "Meet Sly" module (right after the homepage hero) — but it's currently a small avatar + text layout, not a full-body-mascot layout. Would need a real design decision, not a swap. |
| Greeting wave | ~~Enrol gate modal~~ | No enrol-gate modal exists in this app. The sign-up page (`auth/sign-up/page.tsx`) uses `AuthDeskScene.tsx` — a *different* illustration (a man at a monitor), not Sly at all. No wave-shaped moment identified yet. |
| Celebration | ~~Progress bar milestone~~ | `DashboardPmqCourseCard.tsx` takes `streak`/`completionPercent`/`xp` props and is the real progress-tracking surface — but again only shows a tiny avatar icon today, not a full-body moment. |
| Thinking pose | ~~FAQ / Command Words section~~ | `GuestSlyPanel.tsx`'s "Sly is thinking" typing-dots state is a real, well-matched moment conceptually — just needs a placement decision (replace the tiny avatar with a looping crop vs. a bigger redesigned panel). |

**Current placement status — 2026-07-18:** the full-body Home-hero implementation was tried and reverted at Sim's request. The separate circular-avatar animation idea remains shelved; all current Sly placements are static.

## Motion Principles (point 5)

Checked against all four clips, retroactively — this is the actual observed behavior, not aspirational:

- **Clip length:** all four Veo generations came out at 8 seconds (Veo's default), longer than the 3-6 second range originally recommended for ambient loops. Not a hard problem — the meaningful motion in each clip is only 2-4 seconds of that 8, the rest is settle/hold. Worth trimming to the active window when these get embedded, but not blocking.
- **Audio — action required:** every clip has real, non-trivial generated audio (`1 wave.mp4` and `2 jump.mp4` peak near 0dB, not just noise floor). These were never asked for and must not play. Any embed **must** mute the video element (`muted` attribute, not just low system volume) — don't rely on autoplay-without-sound browser defaults alone. Stripping the audio track entirely at the file level (one ffmpeg pass) is cleaner than relying on the muted attribute alone, since it also shrinks file size.
- **Restraint held up in practice:** the two idle-loop iterations proved the lesson directly — v1 had an unprompted hand gesture and read as fidgety, v2 (blink + breath only) read as calm and professional. The working prompt pattern (name the one allowed motion, say "no other movement," explicitly request loop closure for loops) is now the standard — see the Animation section above.

## Delivery Format (point 6)

**Correction to the original plan:** the original creative directive recommended Lottie (vector JSON) for homepage delivery. That assumed an After Effects/rigged-puppet pipeline. Since the actual approach that got used is Veo image-to-video, the output is raster video, not vector — **Lottie isn't an option for these clips.** The real format decision is MP4 vs. WebM:

- Current files: MP4 (h264), 1280×720, 24fps, ~700KB-990KB each for the full 8-second clip (before trimming/muting).
- Recommendation: keep MP4 for universal browser support without transcoding; WebM (VP9) would shrink file size further but adds a transcode step and isn't necessary at this file size for just 4 short clips.
- Loops (idle, thinking) → `<video autoplay muted loop playsinline>`. One-shots (wave, celebration) → `<video autoplay muted playsinline>` triggered on the relevant event, no loop attribute.
- None of this is implemented yet — noted here for when embedding work is greenlit, not done.

## Production Pipeline (point 7)

The actual pipeline that emerged, worth documenting since it replaces the original "hire an animator, deliver .aep + Lottie" plan:

1. Character bible (this file) is the single source of truth for palette/proportions/rules.
2. Sim generates each clip directly in Google AI Studio (Veo), image-referenced off a locked reference still (`1.jpg` or `2.jpg`) plus a one-sentence plain-English motion prompt.
3. Claude checks each result: frame-by-frame extraction, palette/proportion consistency check, and for loops specifically a first-frame-vs-last-frame comparison.
4. Findings get logged in this file immediately (what worked, what drifted, whether it's usable as-is).
5. No freelancer, no After Effects rig — this whole vocabulary was produced solo, in-session, using tools already in Sim's stack (Google AI Pro).

## Quality Bar (point 8)

Checklist actually used across all four clips, now formalized for future ones:

- Palette and proportions must hold within the locked spec across every frame checked (not just the first) — verified via contact-sheet frame extraction, not a single-frame glance.
- No popping/snapping between poses — motion should read as continuous, not jump-cut.
- For loop-type clips: first frame and last frame must be compared directly, not assumed to match from the prompt alone (the idle-loop v1 failure only showed up this way).
- Restraint over spectacle — if a generation adds unprompted motion (the tie, the v1 hand gesture), that's a flag to evaluate, not silently accept or silently reject.

## Status

- [x] Vectorize master reference
- [x] Measure proportions
- [x] Lock color palette
- [x] Document never-changes / allowed-to-vary rules
- [x] Generate additional reference poses
- [x] Pick animation tool/approach (Veo, point 2)
- [x] Validate approach with idle-loop test
- [x] Define full animation vocabulary (point 4) and generate remaining clips
- [x] Document motion principles (point 5)
- [x] Document delivery format decision (point 6)
- [x] Document production pipeline (point 7)
- [x] Document quality bar (point 8)
- [x] Mute/strip audio and trim clips to active motion window (asset prep)
- [x] Correct animation-vocabulary mapping to the real target (Learn in Curve Next.js app, not `PMQ in 5 days`) — see corrected section above
- [x] Scope decision: no active animated placement — full-body Home hero reverted and circular-avatar animation idea shelved, 2026-07-18
- [x] Cursor hero implementation trial — completed, reviewed and reverted at Sim's request; no animation embed remains in the app

## Web-Ready Clips

Processed versions live alongside the raw Veo outputs in `brand/Mascot/` (raw originals kept untouched for reference/re-editing). All audio stripped — a proper ffmpeg `-an` pass, not just a `muted` HTML attribute, so there's no dependency on the embed code doing the right thing.

A finer-grained motion analysis (8fps frame-diffing, not just eyeballing 8 stills) than what I did on first pass turned up more precise cut points than my earlier per-clip notes suggested:

| File | Raw duration | Web version | Trim applied | Why |
|---|---|---|---|---|
| `1 animate 2.mp4` | 8s | `1 animate 2 - web.mp4` | None, audio stripped only | Motion is continuous low-level breathing/blinking across the full 8s — it's all loop content, nothing to cut |
| `1 wave.mp4` | 8s | `1 wave - web.mp4` | None, audio stripped only | The wave actually repeats in bursts across nearly the entire clip (multiple wave-and-pause cycles), not one isolated gesture — no clean dead time to remove |
| `2 jump.mp4` | 8s | `2 jump - web.mp4` | Trimmed to 0-3.5s | Frame-diff analysis showed the full clip has 2-3 separate jump/bounce cycles, not one clean arc like the 8-still preview suggested. Trimmed to the first jump, ending on a crisp triumphant fist-up-and-laughing hold — right for a one-shot celebration trigger, and avoids the repeated bouncing reading as glitchy |
| `1 think.mp4` | 8s | `1 think - web.mp4` | Trimmed to 1.0s-6.15s (~5.15s) | This is the real find: the raw clip has a genuine ~5-second held thinking-pose window in the middle (verified by comparing frames at 1.0s and 6.15s side by side — both show the same held paw-to-chin pose), bookended by transition-in and transition-out. Trimming to that window turns this from the "gesture cycle" I flagged earlier into the sustained held-pose loop that was actually intended, matching the idle loop's pattern |
