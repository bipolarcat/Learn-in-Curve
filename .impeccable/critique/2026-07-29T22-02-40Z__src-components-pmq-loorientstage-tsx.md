---
target: the orient section
total_score: 24
p0_count: 0
p1_count: 2
timestamp: 2026-07-29T22-02-40Z
slug: src-components-pmq-loorientstage-tsx
---
# Critique — Orient section (`LoOrientStage.tsx`)

Method: dual-agent (A: 16badeca-b7f0-461c-b7b5-a123a3fafbff · B: 1b93b5fe-21ae-4d4c-86e7-e7b00ddd096d)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Stage status lives in LO header; empty `context` still mounts a blank Context block |
| 2 | Match System / Real World | 3 | “Learning outcomes” + LO codes fit APM syllabus; Compass slightly metaphorical for Context |
| 3 | User Control and Freedom | 3 | Read-only; exit/advance owned by journey chrome |
| 4 | Consistency and Standards | 2 | Learn stage still uses framed icons, display titles, sand chips, `max-w-3xl` — dialect break |
| 5 | Error Prevention | 2 | No interactive guards; empty context has no fallback |
| 6 | Recognition Rather Than Recall | 3 | Codes + full text on-screen; titles label icons; sr-only codes for AT |
| 7 | Flexibility and Efficiency | 2 | Linear read only; no skim/collapse |
| 8 | Aesthetic and Minimalist Design | 3 | Quiet direction lands; glass + full-wrap prose + peer section weight hold it back |
| 9 | Error Recovery | 2 | No error/empty guidance |
| 10 | Help and Documentation | 2 | No in-stage “why Orient / what’s next”; Continue only in header |
| **Total** | | **24/40** | **Acceptable** |

## Anti-Patterns Verdict

**LLM assessment:** Does **not** read as classic AI landing slop. Cleared: side-stripes, gradient text, hero-metrics, identical card grids, uppercase eyebrows, `01/02` scaffolding. Residual product tells: glass (`backdrop-blur` via `productSurfaceQuiet`), twin icon+title scaffolds, full-wrap Context as a content dump.

**Deterministic scan:** `detect.mjs` exit 0, findings `[]` — no rule hits on `LoOrientStage.tsx`.

**Visual overlays:** Skipped — no browser automation available in Assessment B. No user-visible overlay.

## Overall Impression

Quieting worked: one card, honest Context → Outcomes IA, rem Figtree scale, bare Lucide, lowercase codes. Biggest opportunity: make Orient a **brief priming beat** again — reading measure + clearer primary/secondary hierarchy — without undoing the quiet direction, and rhyme with Learn so the stage jump doesn’t feel like two products.

## What's Working

1. **Quiet craft matches the audience** — hairline section break, no chips/eyebrows, lowercase syllabus codes.
2. **IA is correct** — Context then Outcomes in one surface; not a card grid.
3. **A11y basics** — labelled sections, sr-only codes, reduced-motion via `PmqMotion`.

## Priority Issues

**[P1] Full-wrap Context measure breaks reading**
- **Why:** Evening revisers bounce off long lines at `max-w-wrap`.
- **Fix:** Constrain Orient prose (and/or column) to ~65–75ch; keep chrome at wrap if needed.
- **Suggested command:** `/impeccable typeset` or `/impeccable layout`

**[P1] Stage dialect break vs Learn**
- **Why:** Orient → Learn flips to Fraunces, sand chips, framed icons — trust erodes.
- **Fix:** Shared pathway header/code treatment across stages (Orient can stay quieter but should rhyme).
- **Suggested command:** `/impeccable distill` or `/impeccable polish`

**[P2] Peer hierarchy (Context ≈ Outcomes)**
- **Why:** Same title/glyph weight; tired users don’t know what to prioritize.
- **Fix:** Context primary; Outcomes secondary (tighter type, denser list, or progressive disclosure).
- **Suggested command:** `/impeccable layout`

**[P2] Decorative glass on quiet surface**
- **Why:** `productSurfaceQuiet` blur is product glass-as-default; no task value.
- **Fix:** Opaque/tinted paper without blur for Orient (or shared LO panels).
- **Suggested command:** `/impeccable quieter`

**[P3] No empty-state / stage-closure copy**
- **Why:** Blank context still shows “Context”; list ends cold with no next-step cue in-panel.
- **Fix:** Empty copy; optional one-line next-step near list end.
- **Suggested command:** `/impeccable harden` + `/impeccable clarify`

## Persona Red Flags

**Jordan (First-Timer):** “Context” unexplained; Compass doesn’t teach; LO codes (`1a`) look like UI chrome; no confirmation what Continue unlocks.

**Casey (Distracted Mobile):** Wide Context = scroll tax; Continue in header not co-located with end of content; long outcome lists feel endless one-handed.

**Sim’s PMQ reviser (evening study):** Wants exam triage; full-wrap Context wall fights them; glass/glyphs risk polish-for-polish; dialect flip into Learn chips after quiet Orient.

## Minor Observations

- Glyph hit areas (`size-10/11`) larger than quiet brief implies.
- `key={outcome}` collision risk on duplicate strings.
- Context always mounts; Outcomes omit when empty (asymmetric).
- Section `ink/15` vs row `black/[0.05]` opacity languages differ slightly (intentional hierarchy — good).

## Questions to Consider

1. If Orient’s job is priming Learn, why is Context a full essay at header width instead of a 2–3 sentence brief?
2. Should outcome codes look identical in Orient and Learn, or is quiet→stamp escalation intentional — and is the jump too sharp?
3. What if “I’m oriented — start Learn” lived at the end of the card, not only in journey chrome?
