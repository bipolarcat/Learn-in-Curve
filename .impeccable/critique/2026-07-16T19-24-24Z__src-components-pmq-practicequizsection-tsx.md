---
target: practise stage in LO
total_score: 21
p0_count: 1
p1_count: 2
timestamp: 2026-07-16T19-24-24Z
slug: src-components-pmq-practicequizsection-tsx
---
# Critique — Practise stage (LO)

**Target:** Practise stage in LO study journey (`PracticeQuizSection.tsx` + `QuizRunner.tsx`)  
**Register:** product (authenticated study UI; brand tokens still apply)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Q progress, ✓/✗ counts, set/tab state solid; some submit failures quiet |
| 2 | Match System / Real World | 3 | “Test yourself” lands; free “Generate Quiz” is checkout-speak |
| 3 | User Control and Freedom | 1 | One-tap MCQ/dropdown lock forever; no undo |
| 4 | Consistency and Standards | 2 | Dual tablists; Generate vs stamp CTA vocabulary drift |
| 5 | Error Prevention | 2 | Can’t skip ahead (good); no confirm before irreversible commit (bad) |
| 6 | Recognition Rather Than Recall | 3 | Result-colored stepper helps; feedback clipped at max-h |
| 7 | Flexibility and Efficiency | 1 | No keyboard accelerators; forced linear frontier |
| 8 | Aesthetic and Minimalist Design | 2 | Stage header + XP + Generate + set tabs + runner chrome stack |
| 9 | Error Recovery | 2 | Wrong-answer diagnosis strong; recovery = none; thin paywall errors |
| 10 | Help and Documentation | 2 | One-attempt note exists; Pro CTA never shows price (`priceCents` unused) |
| **Total** | | **21/40** | **Acceptable** |

## Anti-Patterns Verdict

**LLM assessment:** Not generic SaaS purple / AI landing-page slop. Brand tokens and olive/rust feedback are intentional and coherent with the marketing quiz demo. Product-slop risk is craft inconsistency (double frame, ArtPlaceholder, CTA vocabulary drift) plus irreversible one-tap and an abrupt Stripe redirect that feel stranger than the visual system.

**Deterministic scan:** `detect.mjs` on `PracticeQuizSection.tsx` + `QuizRunner.tsx` returned `[]` (exit 0). Zero rule hits. Detector and LLM disagree only in coverage: detector watches for known visual anti-patterns; the real issues here are interaction/UX (commit irreversibility, paywall honesty, ending), which CLI rules don’t catch.

**Visual overlays:** No reliable user-visible overlay — browser/MCP automation unavailable this session (`browser_visualization: skipped`).

## Overall Impression

Solid quiz feedback and progress chrome for exam prep — frontier nav and olive/rust states earn trust. The biggest opportunity is making the one-attempt rule *feel deliberate* (confirm before lock) and giving free→Pro and set-complete endings the same confidence as a correct answer.

## What's Working

1. **Frontier navigation** — answered questions reviewable; ahead locked until reached. Honest exam-prep structure.
2. **Brand-coherent feedback** — olive correct / rust incorrect / orange current matches DESIGN.md without Duolingo noise.
3. **Result-aware stepper** — colored Q tabs + ✓/✗ counts make weak spots visible on review without a separate results screen.

## Priority Issues

### [P0] One-tap irreversible commit
- **What:** MCQ `handlePick` locks and submits on first option click; dropdown auto-reveals when the last blank is filled — no Confirm, no Undo.
- **Why it matters:** Core audience revises tired / on phone; one mis-tap burns the attempt permanently.
- **Fix:** Explicit “Check answer” before lock (keep one-attempt after confirm), or a short undo window; mirror severity in copy near the options.
- **Suggested command:** `/impeccable harden`

### [P1] Pro paywall is a trapdoor
- **What:** Free CTA labeled “Generate Quiz” → checkout redirect; `priceCents` is unused (`_priceCents`); locked set tabs are non-interactive spans that look tappable.
- **Why it matters:** High-stakes money moment with no price, benefit, or calm explanation — undermines “confident, unpretentious.”
- **Fix:** Inline soft wall (price, what unlocks, then CTA); rename free CTA to unlock language; focusable disabled locked tabs with reason.
- **Suggested command:** `/impeccable clarify` (then `/impeccable harden` for a11y)

### [P1] Set-complete ending is emotionally thin
- **What:** End state is a quiet olive “Set complete” line — no score summary, XP this set, or in-runner next step.
- **Why it matters:** Peak-end rule: wrong-answer valleys outrank the ending; session feels unfinished.
- **Fix:** Compact end panel: correct/total, XP gained, primary continue / secondary review wrong.
- **Suggested command:** `/impeccable delight`

### [P2] Stacked chrome / hierarchy noise
- **What:** Stage block (eyebrow, “Quiz set N”, body, XP, Generate, set tabs) then runner (Question x/y, score, Q tabs, “Qn.” in prompt).
- **Why it matters:** Extraneous load before the first option; two competing “where am I” systems.
- **Fix:** One progress system; demote XP; one primary orange action.
- **Suggested command:** `/impeccable distill`

### [P2] Locked-set a11y + truncated explanations
- **What:** Locked sets not in tab order; feedback `max-h-[5.5rem] overflow-y-auto` clips teaching copy.
- **Why it matters:** Keyboard users can’t inspect locks; wrong-answer teachable moment gets scrolled away.
- **Fix:** Focusable `aria-disabled` controls with reason; expand full explanation.
- **Suggested command:** `/impeccable audit`

## Persona Red Flags

**Jordan (First-Timer):** Misses one-attempt note; first MCQ tap burns attempt; “Generate Quiz” doesn’t read as paywall; locked Set 2/3 look tappable but do nothing.

**Casey (Distracted Mobile):** Generate/XP top-right outside thumb zone; dense `h-8` Q tabs invite mis-taps; listboxes under blanks risk clip inside overflow-hidden card; prior attempts persist (good) but accidental lock does not forgive interruption.

**Sam (Accessibility):** Locked set spans not keyboard-reachable; custom listbox lacks clear arrow-key pattern in code; result meaning still leans on color fills (aria-labels help).

**Evening reviser (project):** Irreversible mis-tap is the worst night-mode failure; thin “Set complete” gives no closure; paywall redirect mid-burst kills a 12-minute session.

## Cognitive load

**6/8 checklist failures → high extraneous load.** Decision points with >4 options: full question stepper; MCQs with 5+ choices.

## Minor Observations

- `ArtPlaceholder` quiz icon feels generic next to pathway Practise icon.
- Duplicate enumeration: chrome “Question n / N” + prompt `Qn.`
- Feedback spacer `min-h-[2.75rem]` is layout-stable but hollow.
- Third semantic hue (`teal-deep`) after olive/rust in feedback text.
- Free Generate discoverability is good; honesty lags until price/copy catch up.

## Questions to Consider

1. If one attempt is sacred for exam realism, why does the UI still look like casual “pick an option” instead of deliberate “lock in”?
2. Should free users see “Generate Quiz” at all — or only “Unlock more sets” with price on the button?
3. Are set-tabs + question-tabs teaching structure, or burning viewport before the first answer?
4. What would a confident anti-Duolingo *ending* look like — ticket stamp, score line, or hard cut to Checkpoint — instead of pale “Set complete”?
