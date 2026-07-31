---
target: homepage
total_score: 24
p0_count: 1
p1_count: 3
timestamp: 2026-07-06T10-30-05Z
slug: src-app-site-page-tsx
---
Method: dual-agent (A: 8da1f922-c8f9-4313-b38b-f689d29af6e2 · B: 85a954d5-7b7e-4061-a5d5-7a9a06b700c4)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Quiz gives instant feedback; journey nodes show state. No scroll-position cues on long page. |
| 2 | Match System / Real World | 3 | Ticket metaphor fits; assumes PMQ literacy (PFQ, PMP, CAPM unexplained). |
| 3 | User Control and Freedom | 3 | Anchor links, quiz next, journey toggle. No dead ends. |
| 4 | Consistency and Standards | 3 | Ticket motif consistent; CTA labels diverge (Start free / Get started). |
| 5 | Error Prevention | 2 | PASS GUARANTEED + 94% pass rate set expectations product cannot substantiate. |
| 6 | Recognition Rather Than Recall | 2 | Mobile nav: icon-only Home; no Courses label in header. |
| 7 | Flexibility and Efficiency | 2 | Quiz keyboard-accessible; PmqStartLink sends to sign-up not course. |
| 8 | Aesthetic and Minimalist Design | 2 | Seven sections + stat band + boarding pass compete for attention. |
| 9 | Error Recovery | 3 | Quiz wrong-answer explanations; newsletter validation message. |
| 10 | Help and Documentation | 1 | No FAQ, syllabus scope, or "what is PMQ?" for first-timers. |
| **Total** | | **24/40** | **Acceptable — significant trust/clarity gaps** |

## Anti-Patterns Verdict

**LLM assessment:** Borderline pass. Boarding pass, live quiz, and journey path are distinctive product metaphors — not generic SaaS. Reflex tells remain: cream/paper body, section-tag eyebrows on every block, icon+heading card grid in AboutCards, hero-adjacent StatBand metrics, Fraunces + Space Mono pairing.

**Deterministic scan:** 0 findings across 8 homepage source files (clean exit 0). Detector did not flag structural anti-patterns in markup — but trust/copy issues (stat band, PASS GUARANTEED stamp) are outside detector scope.

**Browser visualization:** Not performed. CLI evidence only; rendered-DOM checks (contrast at viewport, layout overflow) not exercised.

## Overall Impression

The homepage has real personality — the boarding pass and interactive quiz prove the product thesis better than most edtech landings. The single biggest opportunity is trust alignment: illustrative stats, guarantee stamp, and pricing contradictions undermine the skeptical PMQ reviser this page is built for.

## What's Working

1. **HeroBoardingPass** — Perforated edges, dashed divider, rotated stamp, gold bullets. Delivers vintage ticket aesthetic intentionally.
2. **QuizDemo** — Real APM syllabus content with XP feedback. Best proof that this is not a PDF course.
3. **JourneyPath** — SVG draw-in, locked nodes, path metaphor without mascot/confetti energy.

## Priority Issues

### [P0] Unsubstantiated pass-rate social proof
- **What:** StatBand animates 94% MOCK EXAM PASS RATE and 2400 LEARNERS; disclaimer is 11px below.
- **Why:** PMQ revisers treat 94% as a claim; legal checklist already flags risk.
- **Fix:** Remove or demote until verified; replace with syllabus facts (24 LOs, timed mock, APM-aligned).
- **Suggested command:** `/impeccable clarify`

### [P1] PASS GUARANTEED stamp on boarding pass
- **What:** Rotated orange stamp with no terms link.
- **Why:** Contradicts disclaimer and Terms; reads as hype to Udemy veterans.
- **Fix:** Replace with factual stamp (MOCK EXAM INCLUDED, 24 LOs) or remove.
- **Suggested command:** `/impeccable quieter`

### [P1] Pricing model contradiction
- **What:** "One flat fee per course" vs FREE · LIVE NOW vs Start free with PMQ.
- **Why:** Jordan cannot tell if PMQ is permanently free or a teaser.
- **Fix:** Lead with PMQ free; reframe line-up copy as PMQ free today · paid courses coming.
- **Suggested command:** `/impeccable clarify`

### [P1] AboutCards generic grid
- **What:** Three identical icon+heading+body cards between stronger sections.
- **Why:** Weakest block; reads as AI scaffold; promises gamification without showing it.
- **Fix:** Replace with one proof moment (mock exam screenshot, certificate preview) or fold into quiz/journey.
- **Suggested command:** `/impeccable distill`

### [P2] Section-tag eyebrow on every block
- **What:** OUR PHILOSOPHY, THE LINE-UP, NO WAITING FOR FEEDBACK, THE JOURNEY — same pattern.
- **Why:** Dilutes ticket voice into landing-page cadence.
- **Fix:** Reserve tags for 1–2 moments; let tickets and torn dividers carry identity elsewhere.
- **Suggested command:** `/impeccable quieter`

## Persona Red Flags

**Jordan (first-timer):** No "what is PMQ?"; 4.5 stars on boarding pass with no source; AI tutor listed with no demo; mobile header has no Courses link; See how it works scrolls far to journey without explaining sign-up.

**Casey (mobile):** Boarding pass below fold; JourneyPath min-w 640px forces horizontal scroll; dark toggle 36px below thumb target; marquee consumes vertical space with zero utility.

**PMQ reviser (proof-driven):** Hero leads with "gamified"; 94% without methodology; mock exam buried as 3rd bullet; PmqStartLink to sign-up before course; NOW BOARDING implies cohort schedule for self-paced product.

## Minor Observations

- Fox mascot in DESIGN.md not rendered in hero.
- JourneyPath click-to-close resets to node 2, not clicked node.
- PFQ ticket shows placeholder noise for PMQ-only visitors.
- Newsletter fakes success client-side (prototype only).

## Questions to Consider

1. If StatBand disappeared, would QuizDemo + HeroBoardingPass convert — or were numbers compensating for missing real proof?
2. Does PASS GUARANTEED convert more than it costs in trust?
3. What if the first screen were the quiz and the theatrical hero moved below?
4. Should "gamified" be banned from marketing surfaces given PRODUCT.md anti-Duolingo stance?
5. Page promises certificate but closes on PFQ waitlist — what would peak-end look like with mock exam/certificate as the final beat?
