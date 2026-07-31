# Landing Page Art Brief — Nano Banana → Veo

**Created:** 2026-07-31 · **Revised:** feature illustrations, not a day journey
**For:** the landing page feature showcase + Sly section
**Owner:** Sim generates. Claude does not author illustrations.

---

## Why this changed

The five-day version illustrated Day 1 → Day 5. That turned **"PMQ in 5 Days"** — a product
name — into an implied promise about how long the course takes. Plenty of people will take
longer, and an implied timeline you can't guarantee is exactly the kind of claim that causes
trouble. The day copy also had nothing to do with days; it was describing features.

So: **seven features, seven illustrations.** One character per image, doing something that
connects to the feature. No numbers in the art or the captions — counts live in
`plans.ts`, which is the single provable source, and duplicating them here would guarantee
they drift.

---

## How to run this

1. **Attach the group photo of the characters to every prompt.** It carries the style, line
   weight, palette and cast — none of that needs describing.
2. Generate all seven **in one session**, back to back.
3. For each after the first: *"same style as the previous image."*
4. Then take each still into Veo for the loop.

**The one thing the reference image gets wrong:** its background is white. Your site is
cream. Every prompt restates it — don't drop that line.

**Balance the palette across the set.** Roughly half the characters in orange, half in
teal. The reference skews teal, and a set that's all teal reads flat.

---

## The seven features

### 1 — Core study content · *no badge, free*

```
Use the attached image as the style and character reference.
Solid cream background, hex #F4E9D6 — not white. Flat, no texture, no gradient.
16:9 landscape. No text, no letters, no numbers, no watermark.

Scene: the cat with round glasses and a moustache, in an orange jacket, sitting at a
simple desk reading a large open book held in both paws. A small stack of two closed
books beside him. Calm and absorbed. Lots of empty cream space around the desk.
```

### 2 — Practice questions · *Pro badge*

```
Use the attached image as the style and character reference.
Solid cream background, hex #F4E9D6 — not white. Flat, no texture, no gradient.
16:9 landscape. No text, no letters, no numbers, no watermark.

Scene: the labrador in a teal jacket sitting with a laptop open in front of him, one paw
raised mid-tap above the keys, looking at the screen with a small confident smile. The
laptop screen is blank cream with three simple rounded rectangles stacked on it. Empty
cream space around him.
```

### 3 — Mock exams · *Pro badge*

```
Use the attached image as the style and character reference.
Solid cream background, hex #F4E9D6 — not white. Flat, no texture, no gradient.
16:9 landscape. No text, no letters, no numbers, no watermark.

Scene: the bear with square glasses, in an orange jacket, sitting upright at a bare desk
writing on a single sheet of paper, focused. A simple round wall clock hangs on the wall
behind him, drawn in thin outline. Quiet, exam-room stillness. Generous cream space.
```

### 4 — Common misconceptions · *no badge, free*

```
Use the attached image as the style and character reference.
Solid cream background, hex #F4E9D6 — not white. Flat, no texture, no gradient.
16:9 landscape. No text, no letters, no numbers, no watermark.

Scene: the grey wolf in the orange jacket standing at a fork in a path, facing two
simple signposts pointing in opposite directions. He points confidently at the left one.
A small orange marker sits on the correct path. Thin outlined ground line. Empty cream
space filling the upper two thirds.
```

### 5 — Memory aids · *no badge, free*

```
Use the attached image as the style and character reference.
Solid cream background, hex #F4E9D6 — not white. Flat, no texture, no gradient.
16:9 landscape. No text, no letters, no numbers, no watermark.

Scene: the rabbit in sunglasses and a teal jacket standing beside a small board covered
with four or five plain square sticky notes in orange and teal, tapping one with a paw
and looking pleased. The notes are blank. Simple thin outline board. Empty cream space
around it.
```

### 6 — Video and audio overviews · *Pro badge*

```
Use the attached image as the style and character reference.
Solid cream background, hex #F4E9D6 — not white. Flat, no texture, no gradient.
16:9 landscape. No text, no letters, no numbers, no watermark.

Scene: the giraffe with black sunglasses, in a teal jacket, wearing large over-ear
headphones, standing beside a simple rounded screen on a stand. The screen is blank
cream with a single orange triangular play shape in the centre. Relaxed posture,
long neck curving up. Generous cream space.
```

### 7 — Sly, your personal tutor · *AI Pro badge · launching soon*

**Use `brand/Mascot/sly fox png.png` as the reference for this one, not the group photo.**
Sly stays canon and is deliberately not in the cast's visual system — they're learners,
he's the tutor.

```
Use the attached image as the character reference for Sly the fox.
Solid cream background, hex #F4E9D6. Flat 2D, no shading, no gradients, no drop shadows —
flat single-hue fills only, suitable for animation.
He wears a teal necktie. Round wire glasses always on. Black gloved paws.
16:9 landscape. No text, no letters, no numbers, no watermark.

Scene: Sly standing beside a simple empty speech bubble outline, one paw raised as if
mid-explanation, warm and encouraging. Generous empty cream space around him.
```

Also generate a **wave** still (paw raised in greeting) and a **thinking** still (paw to
chin, head tilted) for the Sly section — `GuestSlyPanel.tsx` already has a literal
"Sly is thinking" state the second one maps onto.

> Canon reminder: the teal necktie was canonised 2026-07-18 because it appeared unprompted
> in 3/3 generations. The master PNG predates it and doesn't show it — the tie is current
> canon, that file isn't.

---

## Sly's avatar — passport photo

The current icon is `/mascot/fox-face.svg`, which is a raster PNG wrapped in an SVG
container (not a real vector, 0 path elements) and an older fox design. It's used at
**20–68px, cropped circular**, across `SlyShowcase`, `GuestSlyPanel`, `SlyMacConsole` and
`DashboardPmqCourseCard`.

Two constraints that decide everything about this image:

**It has to survive 20px.** At that size all you get is silhouette and two or three shapes.
Head fills the frame, ears clearly separated, glasses readable as two circles, no fine
detail, no thin lines that vanish.

**It has to work in dark mode.** The site has a theme toggle. A passport-photo frame solves
this — a printed photo with a border reads deliberately on either background, where a
floating cream head on dark would look like a mistake. It also fits the ticket-stub and
boarding-pass language the brand already uses.

```
Use the attached image as the character reference for Sly the fox.

A passport photograph of Sly. Square 1:1 format. Head and shoulders only, centred,
facing directly forward, looking straight at camera, neutral friendly expression with a
small closed-mouth smile. The head fills most of the frame with a little headroom above
the ears, exactly like a real passport photo.

Flat 2D illustration, no shading, no gradients, no drop shadows. Solid cream background
hex #F4E9D6. Fur flat orange hex #D46320, cream cheek and chest markings hex #F8F1E0,
outlines dark brown-black hex #2C1E15 at consistent weight. Teal shirt hex #6DA490 with a
teal necktie, collar visible at the bottom edge. Round wire glasses, clearly readable as
two circles.

Bold, simple shapes that stay legible when the image is shrunk to 20 pixels wide.
No fine detail, no thin lines, no background objects.
No text, no letters, no numbers, no watermark.
```

Export at **512×512 PNG**, then downscale. Ask for a second version framed slightly wider
if the first crops the ears.

---

## Veo looping

Veo takes the still plus a motion instruction. Keep the motion tiny — these sit behind
text and loop forever, so anything energetic becomes irritating within thirty seconds.

**Shared instruction — put this on every clip:**

```
Animate this illustration as a seamless perfect loop, 4 seconds.
The camera never moves. The composition never changes. The character stays in exactly
the same position within the frame and never walks, exits, or is replaced.
Only the specific small motion described below moves. Everything else is completely still.
Flat 2D animation matching the source image exactly — no added shading, no added depth,
no parallax, no 3D, no style change. First and last frame identical.
```

**Per-clip motion:**

| Clip | Motion |
|---|---|
| Core study content | A slow blink. The page of the open book turns once, then settles. |
| Practice questions | The raised paw taps down once and lifts. A slow blink. |
| Mock exams | The pen hand moves in a small writing motion. The clock's second hand ticks. |
| Common misconceptions | A slow blink. The pointing paw lifts slightly and settles. |
| Memory aids | One sticky note lifts a corner and settles. A slow blink. |
| Video and audio overviews | The head nods gently, twice, in time. A slow blink. |
| Sly explaining | The raised paw moves gently as if mid-sentence. A slow blink. |
| Sly wave | The raised paw waves twice, slowly, then rests. |
| Sly thinking | The paw at the chin shifts slightly. Head tilts a few degrees and returns. |

**Amplitude, per `DESIGN.md`:** float ±18px over 9–11s, mascot bob ±4° / 9px over 4.5s.
If a clip comes back livelier than that, regenerate rather than accept it — a busy loop
behind body copy makes the page feel cheap, which is the exact opposite of the brief.

**Export** a web variant alongside full-res, matching the existing
`brand/Mascot/1 wave - web.mp4` convention. Every clip needs a still poster frame too, so
the section renders correctly before video loads and for `prefers-reduced-motion` users.

---

## Where the files go

Anything the site serves must live under `public/`. The existing Sly clips sit in
`brand/Mascot/` at the repo root and are **not being served** — fix that when the Sly
section is built.

```
public/brand/features/core.png          practice.png    mocks.png
                      misconceptions.png  memory.png    overviews.png
public/brand/features/*.mp4             Veo loops, web variant
public/brand/sly/sly-explaining.png, sly-wave.png, sly-thinking.png
public/brand/sly/*.mp4
public/mascot/sly-avatar.png            512×512, replaces fox-face.svg
```

**Avatar swap is a real change, not a drop-in.** `/mascot/fox-face.svg` is referenced in at
least four components. Replace the references rather than overwriting the file — per
`SLY_CHARACTER_BIBLE.md`, the old fake-vector fox files are still in active use elsewhere
in LIC and shouldn't be deleted without checking every call site.
