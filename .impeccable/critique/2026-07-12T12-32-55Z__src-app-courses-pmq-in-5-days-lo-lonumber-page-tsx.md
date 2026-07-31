---
target: PMQ learning objective page
total_score: 22
p0_count: 0
p1_count: 3
timestamp: 2026-07-12T12-32-55Z
slug: src-app-courses-pmq-in-5-days-lo-lonumber-page-tsx
---
# Critique: PMQ Learning Objective page (`/courses/pmq-in-5-days/lo/[loNumber]`)

Method: dual-agent (A: ccda77f5-488e-40b8-aabc-05f42cfcc1d5 · B: d2517284-d0bb-48a9-9a8b-ed2872badf45)
Target: `src/app/courses/pmq-in-5-days/lo/[loNumber]/page.tsx` (+ LO study components)
Register: Product UI (authenticated study) inside brand-forward ticket/stamp system
Date: 2026-07-12

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Course XP/% visible; no in-LO section progress; completion criteria opaque |
| 2 | Match System / Real World | 3 | APM voice fits; “LO” / outcome codes assume literacy |
| 3 | User Control and Freedom | 3 | Collapse/reveal/nav solid; Mark complete not undoable in UI |
| 4 | Consistency and Standards | 2 | Checklist always open vs accordion peers; quiz shell ≠ LoAccordionSection |
| 5 | Error Prevention | 2 | Mark complete ungated; tiny checkboxes; upsell easy to mis-tap |
| 6 | Recognition Rather Than Recall | 2 | Content hidden until open; no TOC/jump list |
| 7 | Flexibility and Efficiency | 1 | No open-all, jump nav, keyboard accelerators, or resume |
| 8 | Aesthetic and Minimalist Design | 2 | Brand craft present; stamp density + chrome + FAB compete with study |
| 9 | Error Recovery | 2 | Some quiz/tutor alerts; vague failures; no failed-complete path |
| 10 | Help and Documentation | 2 | Sly is help but launch/cap/locked; no “how this LO works” |
| **Total** | | **22/40** | **Acceptable** |

## Anti-Patterns Verdict

**Start here.** Does this look AI-generated?

**LLM assessment:** Not generic SaaS purple-slop. Ticket/paper/ink is intentional LIC voice. The AI tell is **product surface wearing marketing stamp density**: identical accordion tickets, identical memory-aid cards, uppercase micro-labels on nearly every control. Absolute bans mostly clean; hits on identical card grids (`MemoryAidsList`) and stamp-eyebrow saturation.

**Deterministic scan:** `detect.mjs --json` over 12 LO page / pmq component files → `[]`, exit 0. Detector and LLM agree there is no classic markup slop; problems are IA, hierarchy, mobile definitions, and completion model — which the detector does not score.

**Visual overlays:** No reliable user-visible overlay. Assessment B had no mutable browser injection; localhost:3000 unreachable. CLI scan was the fallback signal.

## Overall Impression

Strong pedagogical reveal craft (worked examples, misconceptions) and a solid complete celebration — undermined by a closed accordion wall on arrival, unclear when you’re “done,” and a definitions table that fights phones. Biggest opportunity: guided path + one completion model + mobile definitions, before more delight.

## What's Working

1. **Pedagogical reveal craft** — Worked examples (Scenario → Your turn → Reveal) and misconceptions (Mistake → Reveal correction) match how PMQ revision should feel.
2. **Brand-forward study chrome** — Paper/ink/sticker tickets make LIC recognizable vs generic courseware.
3. **Peak-end celebration** — In-page confetti + “Locked in” toast with reduced-motion hygiene; LoNav next LO as exit.

## Priority Issues

### [P1] Flat accordion wall / no guided study path
- **What:** All LoAccordionSections closed by default; equal orange stamp weight; no recommended next step.
- **Why:** After-work reviser faces 8+ decisions before learning; first-timer doesn’t know the first action in 5s.
- **Fix:** Default-open Context (or first unread); sticky mini-progress / jump list; elevate Practice quiz; mute completed sections.
- **Suggested command:** `/impeccable distill` (then `/impeccable layout`)

### [P1] Completion path unclear / Mark complete bypasses study gates
- **What:** Full-width Mark complete beside Checklist; server does not require quiz/checklist.
- **Why:** Undermines trust in progress %; click too early or without practicing.
- **Fix:** One model — gate the button with clear unmet requirements, or remove manual mark and only auto-complete; copy must match system.
- **Suggested command:** `/impeccable clarify` (+ `/impeccable shape` if model changes)

### [P1] DefinitionsTable hostile on mobile
- **What:** `min-w-[640px]` forces horizontal scroll for three dense columns.
- **Why:** Phone revisers hit foundational content sideways before quiz.
- **Fix:** Stack as term cards on small breakpoints; table from `md` up; lead with Plain English.
- **Suggested command:** `/impeccable adapt`

### [P2] Competing primaries + Sly chrome vs study focus
- **What:** btn-primary on Generate, Mark complete, LoNav next; mobile Sly bar fights Complete.
- **Why:** Single-focus failure at end of LO.
- **Fix:** One primary per viewport region; demote Mark complete until ready; quiet Sly until help intent.
- **Suggested command:** `/impeccable quieter`

### [P2] MemoryAidsList identical card grid + stamp-eyebrow saturation
- **What:** Uniform tap grid + page-wide uppercase stamp on controls.
- **Why:** Template feel after 24 LOs; product register wants the tool to disappear into the task.
- **Fix:** List/ticket strip for aids; reserve uppercase stamp for true badges.
- **Suggested command:** `/impeccable quieter` / `/impeccable typeset`

## Cognitive Load

**6/8 checklist failures → high** for evening revision. Arrival is a wall of peer tickets; working memory taxed when quiz runs with Definitions/Core collapsed.

## Emotional Journey

Arrival: valley (closed identical tickets). Mid: mixed (smart reveals, accordion admin). Quiz: peak candidate. Upsell: dip. Complete: strong peak. Opening valley is the bigger problem than celebration polish.

## Persona Red Flags

**Jordan (First-Timer):** “LO N” before plain next action; closed tickets; outcome codes; Mark complete with no “done” definition.

**Casey (Mobile):** Definitions sideways scroll; 16×16 checkboxes; Sly bar vs Complete thumb fight; many nested taps.

**Ayesha (after-work reviser):** No resume of last open section; wants quiz fast but must excavate; stamp theatricality fights “one LO before bed.”

## Minor Observations

- Dual `h1` (course name in header + LO title on page).
- Checklist outside accordion pattern break.
- LoNav above Mark complete — awkward seal sequence.
- Confetti `z-[90]` arbitrary vs semantic z-scale.
- Recap checkmarks vs Checklist checkboxes — two “check” metaphors.

## Questions to Consider

1. If this page had one job at 9:40pm — would half these accordions still be peer tickets?
2. Should Mark complete exist as a button, or is completion a consequence of quiz + checklist?
3. Is the stamp system a study interface or a brand souvenir — which wins on cognitive load?
4. What would “resume LO 12” look like if the page remembered last open section?
