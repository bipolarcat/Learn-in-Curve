# Learn in Curve — Landing Page Hero: Content Draft

Purpose: hero copy written for animation (word/phrase segments marked so you or Cursor can stagger-reveal them). Three angle options below — pick one, mix, or hand to Cursor as-is.

---

## Option A — "Flatten the curve" (recommended)

**Eyebrow (small label above headline):**
`FOR PROJECT MANAGERS, BY A PROJECT MANAGER`

**Headline (animate word-by-word, left to right, 80–120ms stagger):**
`Learn PM.` / `Build with AI.` / `Skip the curve.`

**Subhead (fade/slide in after headline settles):**
Real APM PMQ prep from someone who's actually run projects — plus the AI skills every PM will need next.

**CTA button:**
`Start learning free`

**Secondary CTA (text link, not button):**
`See how it works →`

### Animation notes for Option A
- "Learn PM." / "Build with AI." / "Skip the curve." are three separate reveal beats — pause ~150ms between each so it reads like a rhythm, not one sentence.
- Literal opportunity: animate an actual curve/line under or through "curve" that draws itself (SVG path stroke-dashoffset) as that word appears. Ties the wordplay to a visual.
- "AI" can get a distinct treatment (subtle glow, monospace flicker, or gradient text) since it's the second pillar of the value prop — makes it visually distinct without a paragraph explaining it.

---

## Option B — "Two skills, one course"

**Eyebrow:**
`PMQ CERTIFICATION · MADE FOR THE AI ERA`

**Headline (stagger by phrase):**
`Study like a PM.` / `Think like a builder.`

**Subhead:**
One course, two skills that compound: pass your APM PMQ, and pick up the AI fluency that's already changing how projects get run.

**CTA button:**
`Get started`

### Animation notes for Option B
- Two-phrase headline suits a split-screen or seesaw entrance — "Study like a PM." slides in from left, "Think like a builder." from right, meeting in the middle.
- Good if you want the hero to visually imply "two things becoming one" (e.g., two icons merging, PM triangle + AI spark icon).

---

## Option C — "Built by someone who's lived it"

**Eyebrow:**
`NOT ANOTHER GENERIC PREP COURSE`

**Headline (stagger word-by-word):**
`Made by a PM.` / `For PMs.` / `Built with AI.`

**Subhead:**
Learn in Curve turns real project management experience into APM PMQ prep — and teaches you to build with AI along the way.

**CTA button:**
`Try it free`

### Animation notes for Option C
- Three short punchy fragments — best for a typewriter/type-on effect rather than fade, since each fragment reads like a stamp of credibility landing one after another.
- Works well if hero background has a subtle "typing cursor" blink after the last fragment, then CTA fades in.

---

## General animation guidance (applies to whichever you pick)

- **Segment structure:** headline is pre-broken into `/`-separated beats above — use these as your stagger units (one `<span>` per beat, or one per word if you want finer control).
- **Timing:** 400–600ms total for headline reveal reads as "confident," not sluggish. Don't stretch past ~1s or it feels slow on repeat visits.
- **The word "curve":** across all three options, "curve" (or "Learn in Curve" in the eyebrow/logo) is the one word worth a unique visual treatment — it's the brand name and the wordplay (learning curve). A drawn line, gradient sweep, or slight scale-bounce on that word alone reinforces brand recall without extra copy.
- **AI mention:** keep it to one clean visual beat, not a callout box — the audience (aspiring/practicing PMs) should read AI as "a skill you'll gain," not "an AI product pitch."
- **CTA reveal:** bring CTA in last, after headline + subhead settle — never simultaneously, or it competes for attention during the read.

---

## Next steps
- Pick one option (or tell me to blend, e.g. Option A headline + Option C eyebrow).
- Hand this file to Cursor with a note on which animation library you're using (Framer Motion / GSAP / CSS-only) so it can wire the stagger timing precisely.
- If you want, I can mock up the actual HTML/CSS structure with the animation hooks pre-wired.
