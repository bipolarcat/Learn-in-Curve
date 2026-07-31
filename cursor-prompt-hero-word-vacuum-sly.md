# Cursor prompt: hero word-vacuum animation into Sly

**Linear:** none yet — create/update in team LIC once picked up (Sim not currently authenticated to Linear in this session to do it directly). Suggest priority Medium (real launch polish, not blocking).

**Relationship to prior work:** A full-body Sly idle-loop was already built in the hero and **reverted at Sim's request** (`cursor-prompt-sly-hero-animation.md`, `SLY_CHARACTER_BIBLE.md`, 2026-07-18) — no reason was logged for the revert. Sim has confirmed (2026-07-27) he wants to proceed with this anyway: the word-vacuum mechanic is a materially different concept from the plain idle-loop placement that got pulled, not a retry of the same thing. Cursor should still read both files above for the full Sly asset history, palette, and motion-principle findings before starting.

## What this is

A hero-section animation where a set of project-management and AI-related words fly in as pill chips, travel along a curved path, and converge into/onto Sly — landing at a single point (top of head), not split into two ears. Sly himself is a separate Veo-generated video clip (Google AI Studio); Cursor is building the word layer and the compositing, not the character animation itself.

## Brand constraints (read `DESIGN.md` in full first)

Non-negotiable, per the existing design system:

- **No full-bleed colored panels.** Background stays the cream paper (`--cream` `#F4E9D6`) with the existing dot-grid + film-grain texture. Color lives inside the pill chips and the path stroke, not as a background band.
- **No generic SaaS purple/blue, no photoreal/3D.** Use the existing token palette: `orange` `#D5501F` (primary/CTA), `gold` `#D9A441` (accent), `teal` `#1B6560` (secondary accent), `olive` `#5F7A3D` (sparingly). Don't introduce new hues for this feature.
- **Typography:** word-chip text in Figtree (body weight range 400–700) or Space Mono if going for the "stamped/ticketed" chip treatment already used elsewhere (`stamp-chip.tsx`) — reuse that existing chip component/style rather than inventing a new pill style from scratch if it fits.
- **Reuse the existing "journey path" motion convention**, don't invent a new SVG technique: `DESIGN.md` already documents a signature pattern — an SVG path animated via `stroke-dashoffset` from full-length to 0 on scroll-into-view (used for the gamified journey line elsewhere in the app). The word-vacuum path should use this exact same technique for consistency, just repurposed as the "curve" the words travel along and converge on.
- **Idle motion stays slow and small** outside of the triggered word-vacuum moment itself — see Motion Principles in `DESIGN.md`.

## Inspiration notes (pulled from Mobbin, Wispr Flow — reviewed 2026-07-27)

Borrow the *mechanics*, not the *skin*:

- **Borrow:** Wispr Flow's hero uses a dotted swirl/path line as a decorative motion cue near the headline — validates the "dotted curved path" idea for the word-vacuum route. Their headline is also set in an elegant serif (visually similar spirit to Fraunces, LIC's own display font) — no change needed there, already aligned.
- **Borrow:** Wispr's "Flow is made for you" section is a wall of rounded-pill tags — the same rounded-pill token `DESIGN.md` already calls "Wispr-inspired" for LIC's header controls (`header-control.ts`). Use that existing pill styling for the flying words rather than a new shape, so this feature is visually consistent with controls already shipped.
- **Do NOT borrow:** Wispr's dark full-bleed hero panel and purple/lavender CTA color — both directly conflict with `DESIGN.md`'s explicit "reject generic SaaS," "no full-bleed color bands," and locked orange/gold/teal palette.

## Sly asset

Use the same idle-loop clip already validated for hero use: `brand/Mascot/1 animate 2 - web.mp4` (blink + subtle breathing only, loops perfectly, audio already stripped at file level). Full palette/proportion/motion validation is in `SLY_CHARACTER_BIBLE.md` — read it before touching any Sly asset. Standard embed: `<video autoplay muted loop playsinline poster="...">`, with `prefers-reduced-motion` falling back to a static poster frame (reuse `brand/Mascot/sly fox png.png` or an exported first frame).

## The word-vacuum mechanic

1. **Word chips** — small rounded-pill elements (reuse existing chip/stamp-chip styling), each containing one word from the list below.
2. **Path** — one (or a small number of) hand-feeling curved SVG path(s), drawn using the existing `stroke-dashoffset` journey-path technique, converging toward a single point at/above Sly's head. This path can also serve double duty as a literal visual nod to "Learn in **Curve**" — an ascending curve shape, not just an arbitrary swirl.
3. **Motion** — chips travel along the path toward the convergence point, staggered (150–300ms apart per chip) so they arrive in sequence, not all at once. As each chip approaches the convergence point, animate it: scaling down, fading out, and — if using a variable-weight font for the chip label — reducing font weight toward a thin value in sync with the scale-down, so it reads as "thinning into the vacuum" rather than just shrinking.
4. **Convergence point** — single point at top of Sly's head/brain, not two separate ear-points. Simpler to keep readable at hero scale and matches the "everything compounds into one place" idea in the copy.
5. **Trigger** — fire once on scroll-into-view (`IntersectionObserver`, consistent with the rest of the site's `.reveal`/`.visible` scroll-reveal pattern), not on page load.
6. **Reduced motion** — chips render statically near the path (no flight animation) if `prefers-reduced-motion` is set; Sly's video falls back to poster per the existing pattern.
7. **Mobile** — this is a visually dense composition. Don't force-scale it down; either simplify to a smaller chip count (4–6 words) or hide the word layer on narrow breakpoints and keep Sly + headline/subhead/CTA alone, matching how `cursor-prompt-sly-hero-animation.md` already handled Sly-on-mobile.

## Word list (trim to ~16–20 total for the actual build — this is the full candidate pool)

**Project management:** Scope · Risk · Stakeholders · Milestone · Sprint · Budget · Timeline · Deliverables · Agile · Kanban · Gantt Chart · Dependencies · Scrum · Roadmap · Backlog · Prioritization · Change Management · RACI · Critical Path · Resource Planning · Governance · Lessons Learned

**AI:** Prompting · Automation · AI Agents · Machine Learning · Generative AI · Copilot · Workflow Automation · Predictive Analytics · No-Code · AI Literacy · Smart Scheduling · Data-Driven Decisions

## Headline / subhead (for context — not this task's job to change, just what the animation sits alongside)

**Headline (confirmed):** `Master Project Management. Keep up with AI.`
*(An alt verb-matched phrasing — "Ride the AI Wave" instead of "Keep up with AI" — was discussed but not decided; don't swap it without Sim's sign-off.)*

**Subhead:** still being finalized separately — leading candidate is confidence-first, PM-skill-led, AI-second. Don't block this animation work on that copy decision; wire the layout to accept whatever final subhead text lands.

## What to check while building

- Confirm the CTA stays fully visible and reachable on mobile once both Sly and the word layer are added — this sank part of the value of the prior attempt's real estate, don't repeat it.
- Frame-check the word-vacuum animation against the actual Sly clip framing at real hero size (not just at 1280×720 native Veo resolution) — same lesson as the prior Sly-hero prompt.
- Performance: this is above-the-fold on the most-loaded page. Check whether the added SVG animation + video autoplay together introduce any visible delay to the existing `hero-enter` text entrance.
- If a variable font is needed for the thinning effect and Figtree/Fraunces/Space Mono don't have a usable variable-weight axis already loaded, flag that as a font-loading decision before implementing rather than silently adding a new font family.

## Why this exists

Sim wants the hero to feel alive and to visually encode the brand's core idea — PM knowledge and AI fluency both feeding into mastery — rather than just decorative motion. The word-vacuum-into-Sly concept ties three things together in one shot: Sly (character/brand recognition), the curve path (literal brand-name wordplay), and the specific PM+AI vocabulary (message). Claude drafted this brief and did not touch any code, per standing instruction — Cursor does the implementation. Report back once done; Sim will check the live hero (desktop and mobile, reduced-motion on/off) before considering this finished.
