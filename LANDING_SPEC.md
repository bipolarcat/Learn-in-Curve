# Landing Page Spec — v2 sections

**Created:** 2026-07-31 · **Status:** agreed, ready to build
**Goal of the page:** free signups. One CTA, repeated. Nothing competes with it.

---

## SCOPE FOR THIS RUN

**IN**
1. Section 1 — Proof
2. Section 2 — seven sticky feature cards
3. Section 3 — Sly console
4. `TrialQuiz` — three-question guest quiz replicating the real console

**OUT — do not touch in this run**
- Hero keying fix (`HeroAnimalsScene`) — separate run, needs offline proof first
- Sly avatar swap across four components — separate run
- `brand/Mascot/*.mp4` relocation
- Sly character animations — Sim has deferred these

If any IN item can't be completed cleanly, stop and report rather than half-building it.

---

## What changes

| Section | Component today | Becomes |
|---|---|---|
| Hero | `HeroAnimalsScene` | **Untouched this run** |
| Proof | `PmqLiveLamp` | "PMQ in 5 Days is live" — parallax props, no statistics |
| Features | — | New: seven sticky stacked cards |
| Quiz | `QuizDemo` | New `TrialQuiz` — three real questions, real console look |
| Sly | `SlyShowcase` | Console + text, merged demo→live, Beta badge |
| Newsletter | `NotifyBand` | Unchanged |

**Order:** Hero → Proof → Features → TrialQuiz → Sly → Newsletter.

`PmqLiveLamp` and `QuizDemo` are removed from Home but **left in the repo** — do not delete.

---

## Global rules

**Motion happens to objects, never to layout.** Props drift, cards stack, images swap.
Type never slides in from the side, the grid never reflows, colour never changes. This is
why the page can be heavily animated and still read calm.

**Engine — Framer Motion only** (`framer-motion@12.42`, already installed). **No GSAP.**
`DESIGN.md`'s existing "No GSAP scroll scrub" rule stands; sticky stacking is CSS-native so
nothing needs to pin or scrub.

**`prefers-reduced-motion` is non-negotiable.** Every animated section renders its final
composition immediately, no motion, no sticky behaviour, no layout shift.

**Surface** — continuous cream dotted paper throughout. No full-bleed colour bands, no
seams. Colour lives inside tickets, frames and stamps. Section gaps `clamp(5rem, 10vw, 8rem)`.

**Motion runs at full strength on all breakpoints.** Sim's call, taken knowingly.

---

## Assets — rename these first

All eight illustrations are in `public/Landing page/`. **That path has a space and the
filenames have commas — rename before referencing anything.**

| Current file | Move to |
|---|---|
| `Generated Image July 31, 2026 - 10_22AM.jpg` | `public/brand/features/core.jpg` |
| `Generated Image July 31, 2026 - 10_24AM.jpg` | `public/brand/features/practice.jpg` |
| `Generated Image July 31, 2026 - 10_26AM.jpg` | `public/brand/features/mocks.jpg` |
| `Generated Image July 31, 2026 - 9_53AM.jpg` | `public/brand/features/misconceptions.jpg` |
| `Generated Image July 31, 2026 - 10_28AM (1).jpg` | `public/brand/features/memory.jpg` |
| `Generated Image July 31, 2026 - 10_28AM (2).jpg` | `public/brand/features/overviews.jpg` |
| `Generated Image July 31, 2026 - 10_31AM.jpg` | `public/brand/features/sly.jpg` |
| `Generated Image July 31, 2026 - 10_34AM.jpg` | `public/brand/sly/sly-avatar.jpg` |

Convert to WebP as part of the move; keep the `.jpg` originals. Delete the
`public/Landing page/` directory once empty. Serve via `next/image` with explicit
`width`/`height` and `sizes` — these are large and will otherwise wreck LCP.

`sly-avatar.jpg` is moved but **not wired up this run** — that's the separate avatar task.

---

## 1 — Proof · "PMQ in 5 Days is live"

Replaces `PmqLiveLamp` on Home.

**No statistics.** No learner count, no question count. It's a launch announcement. This
also removes any substantiation burden — nothing to verify, nothing that goes stale.

**Composition** — centred Fraunces headline, one supporting line, one `PmqStartLink` CTA.
Type is completely static.

**Motion** — four props drift on scroll at different depths, from
`public/brand/inspo/`: `hero-plane.png`, `hero-takeoff-clouds.svg`, `paper-airplane.svg`,
`mailbox.svg`. Framer Motion `useScroll` + `useTransform`, y-offsets between -60px and
+60px, each on a different multiplier so they visibly separate.

---

## 2 — Features · seven sticky stacked cards

**Not a five-day journey.** Rejected 2026-07-31: illustrating Day 1 → Day 5 turns
*"PMQ in 5 Days"* — a product name — into an implied promise about completion time. Many
learners take longer, and an implied timeline you can't guarantee is a claim risk.

**Scroll behaviour** — each card is `position: sticky; top: 12vh`; the next slides up over
it. The covered card scales to ~0.94 and fades to ~0.6. Roughly 70vh of scroll per card.
On mobile reduce the offset but keep the stacking.

**Card anatomy** — illustration (16:9) · feature name + tier badge · one caption line.
Nothing else.

| # | Feature | Image | Badge | Caption |
|---|---|---|---|---|
| 1 | Core study content | `core.jpg` | — | Every learning objective on the APM syllabus, written to be read in short bursts. |
| 2 | Practice questions | `practice.jpg` | `Pro` | Quiz yourself as you go. Instant marking, instant explanations. |
| 3 | Mock exams | `mocks.jpg` | `Pro` | Full-length papers under real exam conditions. |
| 4 | Common misconceptions | `misconceptions.jpg` | — | The wrong-but-common answers, corrected before the exam does it for you. |
| 5 | Memory aids | `memory.jpg` | — | Acronyms and hooks that survive exam-day nerves. |
| 6 | Video and audio overviews | `overviews.jpg` | `Pro` | Watch or listen through a learning objective on the commute. |
| 7 | Sly, your personal tutor | `sly.jpg` | `AI Pro` | Ask anything, get targeted practice, finish with a personalised report. Launching soon with AI Pro — try the Beta below. |

Tiers verified against `src/lib/pmq/plans.ts`. **No numeric claims in these captions** —
counts live in `plans.ts`, which carries explicit compliance comments (the AI Pro figure
deliberately under-states by 2, because delivering more than advertised is safe and the
reverse is a misleading action). Duplicating numbers here guarantees drift.

**Badges** — extract `ProBadge` / `AiProBadge` from `PracticeGenerateHint.tsx` into a shared
`src/components/pmq/tier-badge.tsx`, add `BetaBadge` in rust:

```tsx
/** Rust Beta chip — same geometry as Pro / AI Pro. */
export function BetaBadge() {
  return (
    <span className="inline-flex h-4 shrink-0 items-center rounded-[0.25rem] bg-[color-mix(in_srgb,var(--rust)_16%,rgb(var(--paper-rgb)))] px-1 font-body text-[9px] font-bold tracking-[0.02em] text-rust">
      Beta
    </span>
  );
}
```

Update `PracticeGenerateHint.tsx` to import from the new file rather than keeping duplicates.

---

## 3 — TrialQuiz · three real questions

**New component `src/components/TrialQuiz.tsx`.** Do not modify `QuizRunner.tsx` — it's 967
lines, calls the `submitQuizAttempt` server action, and requires auth plus a DB write. It
cannot run for a guest.

**Import `@/components/pmq/PracticeQuiz.module.css`** — the same stylesheet the real console
uses. That's the whole point: identical `prompt`, `checkRow`, `checkBtn`, `feedback`,
`qRail`, `qGrid`, `questionPanel`, `navRow` classes, so a visitor sees the actual product,
not an approximation. Local `useState` only. No network, no server action, no DB.

Replicate from `QuizRunner`: the question rail across the top, "Check answer" button,
`aria-live="polite"` feedback region, correct/incorrect states, explanation reveal, and the
XP pill. XP is cosmetic here — display only, never persisted.

**After question 3**, the panel resolves into a signup CTA: *"That's the taster. The full
course is free."* → `PmqStartLink`. Do not offer a fourth question.

**The three questions** (verbatim from the live bank, verified 2026-07-31):

```ts
export const TRIAL_QUESTIONS = [
  {
    id: "Q20",
    lo: "LO1",
    prompt:
      "You are PM on a long, complex vehicle manufacturing project where the full set of requirements is still being developed. Which life cycle is NOT suitable?",
    options: ["Extended", "Linear", "Iterative", "Hybrid"],
    correct: "B",
    explanation:
      "Linear assumes scope is fixed upfront. With requirements still evolving, iterative or hybrid is preferable.",
  },
  {
    id: "Q22",
    lo: "LO4",
    prompt:
      "A sponsor asks you to review the business case daily. As project manager, what is the most appropriate response?",
    options: [
      "Agree and produce a daily report.",
      "Refuse on the basis that the business case is fixed.",
      "Propose review at decision gates and a periodic interval (e.g. monthly), explaining that daily review will slow delivery without proportionate benefit.",
      "Delegate the daily review to the PMO.",
    ],
    correct: "C",
    explanation:
      "Reviews should be tied to decision gates and a proportionate periodic rhythm. Daily review is disproportionate; refusing or delegating misses the sponsor's underlying concern.",
  },
  {
    id: "Q13",
    lo: "LO21",
    prompt:
      "Your project has a strict completion date that cannot change. Which resource optimisation technique is most appropriate?",
    options: [
      "Resource smoothing",
      "Resource levelling",
      "Project scheduling",
      "Resource allocation",
    ],
    correct: "A",
    explanation:
      "Smoothing protects the end date by adjusting resource demand within float. Levelling would extend the end date; the other options are general activities, not named techniques.",
  },
] as const;
```

---

## 4 — Sly · console + text

**Sly guest chat is live in production** — `guest_tutor_budget.enabled = true` since
2026-07-17, £0 of a £3 cap spent. Not "launching soon". Three free messages per visitor,
IP-hashed, streamed over SSE.

**Headline:** "Try Sly now" · `BetaBadge` · "Three free questions. No account needed."
**Sub-line, quieter:** "Unlimited Sly launches later as part of AI Pro."

That pairs with feature card 7's "Launching soon with AI Pro — try the Beta below" rather
than contradicting it.

**No Sly character animation this run.** Console and text only.

### The merge

`SlyShowcase` currently stacks two versions of the same idea: `SlyMacConsole` (decorative
canned loop, `aria-hidden`) and `GuestSlyPanel` (real streaming chat). Merge into one window.

- Plays the `SLY_SHOWCASE_CHAT` loop until the visitor clicks or focuses the composer.
- On interaction, hands over to live `GuestSlyPanel` in place — `aria-hidden` drops, the
  composer becomes real, focus moves into the input.
- Remaining allowance visible: **"2 questions left"**.
- At the cap, resolves into the signup CTA — never an error state.

### Performance and feel — explicit requirements

Sim's brief: *optimised, snappy, easy to use, modern app-like.*

- Handover from canned loop to live chat must feel instant — mount `GuestSlyPanel` behind
  the loop, don't lazy-load it on click.
- The canned loop must stop its timers the moment handover happens. Currently
  `SlyMacConsole` holds an array of `window.setTimeout` ids in `timersRef` — clear all of
  them, or you get a decorative message appearing mid-real-conversation.
- Keep the existing `IntersectionObserver` gate so nothing animates off-screen.
- Streaming replies must render token-by-token without layout jump — reserve the message
  height, don't reflow the scroll container on every chunk.
- Auto-scroll to the newest message, but stop auto-scrolling if the user scrolls up.
- Composer: Enter sends, Shift+Enter newlines, disabled state while streaming.
- `AItutor-window-wallpaper.jpg` → WebP.
- The window is now interactive: it needs a real accessible name, keyboard focus order,
  and a visible focus ring on the composer.

### Compliance

Sly is a Beta taster of a paid feature. The free/paid boundary must be unmissable: a free
account gets the course; three tutor questions are a taster; unlimited Sly is AI Pro, later.
If a visitor could reasonably infer a free account includes the tutor, that's a misleading
omission under the CPRs — and practically, it generates refund requests.

`FEATURES.md` is stale on this (describes AI Pro as purchasable; `NotifyDialog` treats it as
a waitlist). Fix it in this run — it's the file marketing copy gets derived from.

---

## Acceptance criteria

- [ ] `npx tsc --noEmit` clean
- [ ] All sections render at 375px, 768px, 1440px
- [ ] `prefers-reduced-motion: reduce` → final composition, zero motion, no layout shift
- [ ] Sticky cards stack and hold; no scroll trap; clean release after card 7
- [ ] `TrialQuiz` is visually indistinguishable from the real practice console
- [ ] `TrialQuiz` makes zero network requests and stops after question 3
- [ ] Sly console handover is instant; no canned message ever appears after handover
- [ ] Only one primary CTA per section, all pointing to the same destination
- [ ] No numeric claims anywhere in the new sections
- [ ] `public/Landing page/` no longer exists; no asset path contains a space or comma
- [ ] `PmqLiveLamp` and `QuizDemo` still exist in the repo, just unused on Home
- [ ] `DESIGN.md` updated with the new sections; the No-GSAP rule left intact
- [ ] `FEATURES.md` corrected on AI Pro availability
- [ ] Lighthouse performance not regressed against current Home
