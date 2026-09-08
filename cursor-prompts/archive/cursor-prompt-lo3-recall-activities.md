# Cursor prompt — LO3 recall activities (pair up / lineup / group up)

**Written 2026-09-08 by Claude. Status: queued for Cursor. Scope: LO3 only.**

## What already exists

Content and types are authored. Do not re-author them.

- `content/v2/lo3.json` carries `activities[]` and `worked_examples[]` inside each
  `core_content` block, alongside the existing `exam_tips[]` and `diagrams[]`.
- `src/types/pmq.ts` has `LoActivity` (`PairupActivity | LineupActivity | GroupupActivity`)
  and `WorkedExampleCard`.
- `src/lib/pmq/tiers.ts` has `canAccessRecallActivities(tier)`, Pro and above.
- `src/components/pmq/CoreContentBlock.tsx` already splits the body at `##` headings and
  renders diagrams then exam tips at the end of each section. Activities hang off the same
  split.

## Build this

**1. Three activity components**, `src/components/pmq/activities/`:

| Component | Data | Interaction |
|---|---|---|
| `Pairup.tsx` | `pairs[]` | Tap a term, tap a meaning. Correct pair locks and fades. Wrong pair flashes and resets. Count wrong turns, never time. |
| `Lineup.tsx` | `items[]` (stored in correct order, shuffle on open) | Tap two cards to swap. Check button. Correct positions lock. |
| `Groupup.tsx` | `buckets[]`, `items[]` | Tap a card, tap a bucket. Tap a placed card to send it back. Check button. |

Shuffle on every open, and reshuffle if the shuffle happens to equal the answer.

**2. `ActivityLauncher.tsx`** — the icon that sits in the table's `rowhead`, opens the
activity in a modal. Two activities max per heading, which the content already respects.

**3. `WorkedExampleLauncher.tsx`** — an icon on a single table row, keyed by
`row_label` matching the row's first-column text. Opens situation, ask, answer.
Anchor by trimmed string match, and render nothing if the row is not found rather
than throwing.

**4. Wire into `CoreContentBlock.tsx`** behind a new `activities` prop, and set it in
`LoLearnStage.tsx` from the existing `STUDY_TREATMENT_LOS` set (currently `[3]`).

## Rules that are not negotiable

- **Pro gate.** Gate on `canAccessRecallActivities(userTier)` only. Never re-derive tier.
  Starter sees the table exactly as it is today: **no icon, no padlock, no teaser.**
  A locked control mid-table interrupts a lesson to sell to someone.
- **Nothing hides on first read.** These are opt-in from an icon. The table stays fully
  visible underneath at all times.
- **Wrong turns, not timers.** A clock rewards guessing. Wrong turns tell the learner what
  they do not know and tell us which cell is written badly.
- **Tap, never drag.** Drag interactions die on mobile.
- **Display names live in one UI constant**, not in the content: pair up, lineup, group up.
  Sim may rename them.
- **Modal for all three.** These are deliberate practice, so clearing the screen is doing
  real work. Escape and backdrop close, focus moves into the modal, focus returns to the
  launching icon on close.
- Respect `prefers-reduced-motion`.

## Reference

A working prototype of all three mechanics on this exact LO3 content exists as a Claude
artifact. Behaviour there is the spec; the visual design is Sim's to redo.

## Verify before handing back

1. `npx tsc --noEmit` clean.
2. LO3 Learn renders 8 activities: 3 pair up, 3 lineup, 2 group up.
3. LO3 Learn renders 3 worked example icons, on the rows `Long-term value`,
   `Deployment`, and `Environmental impact assessment (EIA)`.
4. A Starter account sees none of it, and no padlock.
5. LO1 and every other LO are untouched.
