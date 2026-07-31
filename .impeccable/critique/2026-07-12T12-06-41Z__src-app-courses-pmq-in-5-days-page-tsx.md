---
target: PMQ course overview page
total_score: 24
p0_count: 0
p1_count: 3
timestamp: 2026-07-12T12-06-41Z
slug: src-app-courses-pmq-in-5-days-page-tsx
---
# Critique: PMQ course overview (`/courses/pmq-in-5-days`)

Method: dual-agent (A: fae6b2bc-7541-43bd-9a23-01e2be297cea · B: f05588fd-9c57-4439-b58a-4dce89b92b59)
Target: `src/app/courses/pmq-in-5-days/page.tsx` (+ overview components)
Register: Product UI (authenticated study) inside brand-forward ticket/stamp system
Date: 2026-07-12

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | XP/streak/completion and day progress present; no “you’re on Day X / next LO” cue |
| 2 | Match System / Real World | 3 | Day themes + Lite/Full map to real PMQ; “LO” + career FAQ assume context |
| 3 | User Control and Freedom | 3 | Accordions + dismissible Sly; weak escape-to-next-lesson shortcut |
| 4 | Consistency and Standards | 2 | Day vs FAQ accordion dialects; course name as header h1 and body h2; “Full mock exam” label collision |
| 5 | Error Prevention | 2 | Full mock gated clearly; empty day-plan copy is migration-script/dev-facing |
| 6 | Recognition Rather Than Recall | 2 | Progress on closed days; no Continue / last-visited cue |
| 7 | Flexibility and Efficiency | 2 | Days opened one-by-one; no jump-to-incomplete |
| 8 | Aesthetic and Minimalist Design | 2 | Strong mock hierarchy, but stacks plan + mocks + command words + FAQ + further reading + sticky chrome + Sly |
| 9 | Error Recovery | 2 | Little overview error surface; empty content not recoverable for a learner |
| 10 | Help and Documentation | 3 | Help present but mis-aimed (what is PMQ / career) vs “how do I resume tonight” |
| **Total** | | **24/40** | **Acceptable** — solid brand foundation; study-hub UX gaps before a happy evening session |

## Anti-Patterns Verdict

**Start here.** Does this look AI-generated?

**LLM assessment:** No — does not scream generic AI SaaS. Ticket/stamp language, Fraunces display, teal/orange/olive ink borders, and the asymmetric Lite/Full mock layout read as intentional LIC brand craft. Failure mode is closer to **marketing content left on a study dashboard** than purple-gradient template slop.

Absolute bans: side-stripe, gradient text, glassmorphism-as-default, hero-metric template, identical card grids, 01/02/03 markers — clear or mostly clear. Partial hit on stamp-uppercase density (brand system, still noisy for product density). Product-register drift: FAQ + Further Reading feel like landing leftovers; fluid clamp display titles on a task surface.

**Deterministic scan:** `detect.mjs --json` over 7 overview files → `[]`, exit 0, zero hits by rule. Detector and LLM agree there is no classic AI-slop markup pattern; the real problems are IA/hierarchy/copy, which the detector does not score.

**Visual overlays:** No reliable user-visible overlay. Assessment B had no mutable browser injection; CLI scan was the fallback signal. Local Next.js responded 200 on `127.0.0.1:3000` but overlay was skipped.

## Overall Impression

Brand-coherent study hub with a clear Lite/Full mock split and useful day-accordion progress — undermined by missing Continue studying, marketing FAQ/Further Reading on a study surface, and header vs body title hierarchy collision. Single biggest opportunity: make the first viewport answer “what do I do tonight?” in one tap.

## What's Working

1. **Lite vs Full mock split** (`PmqMockExamsSection`) — Asymmetric 7/5 grid, teal Lite “Open now” vs ink Full + gold unlock nest. Teaches free path first; voice lands (“No paywall.”).
2. **Study plan accordion** (`PmqDayPlan`) — Collapsed days, stamp labels, progress bars, LO tickets with complete stamps. Progressive disclosure fits evening revisers once they know which day to open.
3. **Brand-forward study chrome** (`PmqCourseHeader` + `showStudyNav`) — Feels like a study room, not a generic LMS top bar.

## Priority Issues

### [P1] No “continue studying” / next-LO primary action
- **What:** Five closed day accordions + completion stats; never surfaces next incomplete LO despite `completedSectionIds`.
- **Why:** Primary job after work is open the next lesson in ≤10 seconds. Without one CTA, users hunt through Days.
- **Fix:** Primary “Continue: LO N — …” (or “Start Day 1”) linking to `pmqLoHref`; optionally auto-expand that day.
- **Suggested command:** `/impeccable distill` (or `/impeccable shape` if IA needs a short pass)

### [P1] Marketing FAQ + Further Reading on authenticated study hub
- **What:** FAQ answers “What is the APM PMQ?”, career value, booking via APM; Further Reading is 2-up emoji tickets after real study tools.
- **Why:** Extraneous load for signed-in revisers; softens peak-end; register drift (landing → product).
- **Fix:** Move to preview/marketing only, or replace with study FAQs; keep command words.
- **Suggested command:** `/impeccable quieter` + `/impeccable clarify`

### [P1] Title / location hierarchy collision
- **What:** Sticky h1 = course name; meta = “Course overview”; body h2 restates course name + stats; then “Your 5-Day Study Plan” in a different heading style.
- **Why:** Unclear in 5s what the page is *for* vs where you already are.
- **Fix:** Body leads with study job (Continue / study plan), not duplicate course title; keep identity in header only.
- **Suggested command:** `/impeccable layout` + `/impeccable typeset`

### [P2] “Full mock exam” label ambiguity in `PmqHeroStats`
- **What:** Stats pill links “Full mock exam” via `pmqMockHref()` while Lite is free MCQ and Full is paid written paper.
- **Why:** Undermines careful Lite/Full teaching in the mock section.
- **Fix:** Relabel to “Mock exams” / “Lite mock” or remove link.
- **Suggested command:** `/impeccable clarify`

### [P2] Empty-state / edge copy is developer-facing
- **What:** Day plan empty: “run the migration script if sections are missing.”
- **Why:** Breaks trust if content fails for a real user.
- **Fix:** Learner copy + retry / contact path.
- **Suggested command:** `/impeccable harden`

## Cognitive Load

~5–6 checklist failures → **high** for short evening sessions. Closed overview already presents Day1–5 + Lite + Full + Sly (~7 options). Working memory: system knows next incomplete LO but doesn’t surface it.

## Emotional Journey

Land: mild reassurance (XP/streak). Body open: soft confusion (no resume). Study plan: competent but cool. **Peak:** Lite mock card. FAQ/Further reading: **valley / soft end** — peak-end wasted. Sly: companion warmth; pay-urge pulse can add pressure.

## Persona Red Flags

**Jordan (First-Timer):** Duplicate course titles; five collapsed Days with no “Start Day 1”; “LO” jargon; FAQ teaches certification theory before product use — likely opens FAQ instead of Day 1.

**Casey (Mobile):** Two-row sticky header eats first viewport; long scroll (plan → mocks → command table with horizontal scroll → FAQ → reading); Sly bottom bar is thumb-friendly.

**Ayesha (mid-career PM, after-work revise):** Needs 25-minute resume → quiz → done; page offers curriculum brochure. Command words high value but buried. Emotional end should be progress + next step, not APM BoK link.

## Minor Observations

- Study plan h2 omits `section-title` while neighbors use it.
- Two accordion dialects (day sticker Open/Close vs FAQ chevron).
- Further Reading emoji tickets echo removed feature-grid pattern.
- Header “Course overview” correct as `aria-current` but visually heavy next to XP pills.
- `DemoBanner` compounds sticky chrome height when active.

## Questions to Consider

1. If this page had one job after auth, is it “resume the next LO” or “choose mock vs plan”?
2. Should authenticated overview feel like a study cockpit while FAQ/BoK live only on `/preview`?
3. Confident first viewport: kill duplicate course title, lead with Continue + today’s day auto-expanded?
4. Is Sly’s pay-urge pulse appropriate on overview, or only after free-message cap / inside the panel?
