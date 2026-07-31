# Lovable prompt — landing sections (paste as one message)

Prototype only. Illustrations are placeholders; real art arrives from Nano Banana → Veo.

---

Build a landing page section set for "Learn in Curve", a study platform for the APM PMQ
project management exam. React + Tailwind + Framer Motion. Three sections stacked
vertically on one continuous background.

DESIGN SYSTEM — follow exactly:
- Background: cream #F4E9D6 with a subtle dot grid (radial-gradient dots,
  rgba(36,26,18,0.16), 1.25px, ~22px spacing). ONE continuous background across all three
  sections. No colour bands, no section dividers, no white anywhere.
- Ink/text #241A12 · CTA orange #D5501F · teal #1B6560 · gold #C9A227 · rust #B3341C ·
  olive #5A6E3A for correct states.
- Display type: Fraunces serif, semibold, tracking -0.03em.
- Body: Figtree. Small captions and labels: Space Mono, uppercase, letterspaced.
- Buttons are flat rounded rectangles with a thin ink border. No gradients, no shadows,
  no glassmorphism.
- Aesthetic: vintage travel poster meets indie bookshop. Warm, calm, confident.
  NOT generic SaaS — no purple or blue gradients, no Inter, no three-icon feature grids.

CORE MOTION RULE: motion happens to objects, never to layout. Props drift, cards stack,
images swap. Type never slides in from the side, the grid never reflows, colour never
changes. Respect prefers-reduced-motion by rendering the final composition with zero
motion and no sticky behaviour.

Use Framer Motion only. Do not use GSAP.

---

SECTION 1 — "PMQ in 5 Days is live"

Centred Fraunces headline, one supporting line, one orange CTA button reading
"Start free with APM PMQ". The type is completely static and never animates position.

Behind and around it, four simple illustrated props — use grey placeholder rectangles
labelled "plane", "clouds", "paper plane", "mailbox" — that parallax on scroll at
different speeds using useScroll and useTransform, y-offsets between -60px and +60px,
each prop on a different multiplier so they visibly separate.

No statistics and no numbers anywhere in this section.

---

SECTION 2 — "Everything you get", seven sticky stacked feature cards

Seven cards. Each card is position: sticky at top: 12vh, so the next card slides up and
covers the previous one as you scroll. The card being covered scales down to 0.94 and
fades to 0.6 opacity, creating depth. Roughly 70vh of scroll per card.

Each card contains, and nothing more:
- a 16:9 illustration area (grey placeholder rectangle labelled with the feature name)
- the feature name in Fraunces, with a small tier badge beside it where noted
- one line of caption in Figtree

Tier badges are small, quiet 16px-tall pill chips with 9px bold uppercase text — never
loud, never the focus:
- "Pro" — teal text on a 14% teal tint
- "AI Pro" — dark gold text on a 32% gold tint

The seven cards, in order:

1. Core study content — no badge
   "Every learning objective on the APM syllabus, written to be read in short bursts."
2. Practice questions — Pro badge
   "Quiz yourself as you go. Instant marking, instant explanations."
3. Mock exams — Pro badge
   "Full-length papers under real exam conditions."
4. Common misconceptions — no badge
   "The wrong-but-common answers, corrected before the exam does it for you."
5. Memory aids — no badge
   "Acronyms and hooks that survive exam-day nerves."
6. Video and audio overviews — Pro badge
   "Watch or listen through a learning objective on the commute."
7. Sly, your personal tutor — AI Pro badge
   "Ask anything, get targeted practice, and finish with a personalised report.
    Launching soon with AI Pro — try the Beta below."

Do not put any counts or numbers in these captions.

After the seventh card releases, scroll continues into an interactive quiz card:
one multiple-choice question, four options. Correct answer turns olive green; wrong
answer turns rust and shakes once; an XP pill animates in; an explanation line appears
below. This is the interactive payoff of the section.

---

SECTION 3 — "Try Sly now"

A Mac-style chat window — rounded corners, thin ink border, title bar — sitting on the
cream background. It auto-plays a scripted conversation on a loop: a message appears from
Sly, a user reply types itself character by character, a send flash, a three-dot thinking
indicator, then Sly's reply.

Above the window: a Fraunces headline "Try Sly now", a small rust "Beta" pill badge in
the same 16px chip style as Pro and AI Pro, and a line reading "Three free questions.
No account needed."

Below the window: a smaller, quieter line — "Unlimited Sly launches later as part of
AI Pro."

In the window's corner, a small counter reading "3 questions left".

---

Make all three sections work at 375px, 768px and 1440px. On mobile, reduce the sticky
card offset but keep the stacking behaviour.
