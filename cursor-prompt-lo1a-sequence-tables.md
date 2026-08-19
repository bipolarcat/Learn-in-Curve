# Cursor prompt, interactive sequence tables in LO1 section 1a

**Written 19 Aug 2026.** Pilot scope. One section, one component, two tables. Nothing else in the course changes.

**Style constraint for any string you write:** no em dashes or en dashes. Commas, colons, full stops or parentheses.

## Why

A user reported that the core study content reads like a long textbook. Measured across all 24 LOs it is 58,603 words, about 12 minutes of reading per objective, and 222 tables. The tables are the most interaction-ready thing in the course: 77% of them have between three and seven rows, which is the range where an ordering or matching task feels like a puzzle rather than a chore.

This is the smallest possible test of that idea. Section 1a has three tables. Two of them are ordered phase sequences, one linear and one iterative, and putting those phases in the right order is directly examinable. The third is a reason-and-benefit table which stays exactly as it is, so the same page shows old and new next to each other.

A clickable prototype of the intended behaviour exists at `lo1a-sequence-prototype.html` in the repo root. Match its interaction model, not its styling. Styling comes from the app.

## What this pilot deliberately does not do

Read this before designing anything, because the temptation is to build the general solution.

- **No classifier.** Do not write markdown-table-shape detection. Across the course only 59% of tables classify confidently and there are 194 distinct header signatures, so a classifier will silently mis-type tables and produce nonsense questions. The pilot uses a hardcoded allowlist of two tables. Build the classifier only if the pilot earns it.
- **No persistence.** Nothing is written to Supabase. State lives in the component and resets on reload.
- **No gating.** Getting the order wrong, or skipping the interaction entirely, must not block progress through the LO. There is already a 39% drop between the Orient and Learn stages, and converting boredom into friction would make that worse.
- **No content changes.** `content/v2/lo1.json` and the live `lessons` and `lessons_v2` rows for LO1 are byte-identical and stay untouched. Everything here is render-time.
- **No changes to any other LO.**

## Task 1, the allowlist

Create `src/lib/pmq/interactive-tables.ts`.

Export a single constant describing which tables are interactive, keyed by LO code, outcome code, and the text of the table's first data cell in column one. Identify tables by that first cell, not by position index. Both target tables in 1a have the identical header row `Phase | What happens`, so a header-based key would collide, and a positional index depends on render order inside ReactMarkdown, which is fragile.

The two entries for this pilot:

- LO `1`, outcome `1a`, first cell `Concept`, mode `sequence`
- LO `1`, outcome `1a`, first cell `Pre-project and feasibility`, mode `sequence`

Also export a single boolean kill switch so the whole feature can be turned off in one edit without reverting a commit.

Document at the top of the file, in the spirit of `tiers.ts`, that this is an allowlist rather than a detector, and why: an unrecognised table must always render as it does today, and silent degradation to the current behaviour is the required failure mode.

## Task 2, the component

Create `src/components/pmq/SequenceTable.tsx`.

Props: the two header strings, and the rows as ordered pairs of left cell and right cell. The array arrives in the correct order. The component is responsible for shuffling it for display.

Behaviour, matching the prototype:

1. Only the left column is shown, as a vertical list of tappable items in shuffled order.
2. Tapping an item assigns it the next position number. Tapped items stay in place and show their number.
3. An Undo button removes the last placement. A Check button enables once every item is placed.
4. On Check, each item shows whether it is in the right position, a one-line result appears, and the full two-column table renders beneath it with the correct order and the right-hand column visible.
5. A Try again button resets.
6. A **Show me the table** button is available at all times and jumps straight to the full static table. This is the escape hatch and it is not optional.

**Hydration.** Do not shuffle during server rendering. A random order on the server and a different one on the client is a hydration mismatch. Either shuffle inside `useEffect` on mount and render the ordered list until then, or derive the shuffle from a stable seed computed from the table content. Whichever you pick, the server and first client render must agree.

**Do not use drag and drop.** Tap to place is faster on a phone, keyboard operable for free, and far cheaper to make accessible.

## Task 3, wiring it in

`src/components/pmq/CoreContentBlock.tsx` already passes a `table` override to ReactMarkdown. Extend that override.

Read the first data cell of column one out of the children, look it up against the allowlist together with `block.outcome_code` and the LO number already derived by `loNumberFromOutcomeCode`, and render `SequenceTable` on a match. On no match, or if the cell text cannot be read, render exactly what it renders today.

The lookup must be a pure string comparison after trimming and stripping markdown bold markers. The cells in the content are wrapped in `**`, so `**Concept**` has to match `Concept`.

Keep the existing `markdown-wide-artifact` and `markdown-table-shell` wrappers for the non-interactive path so nothing else shifts.

## Task 4, accessibility

These are from the Vercel Web Interface Guidelines and are requirements, not suggestions.

- Every tappable item is a real `<button>`, never a div with an onClick.
- Visible `:focus-visible` ring on every control. No `outline-none` without a replacement.
- An `aria-live="polite"` region announcing placement progress and the result, so a screen reader user is not left guessing.
- Decorative position numbers are `aria-hidden="true"`; the accessible name of each button is the phase name alone.
- Respect `prefers-reduced-motion` on any transition.
- The completed state must contain a real `<table>` element, so the content remains readable as a table.

## Task 5, analytics

Route everything through the existing `capture()` helper in `src/lib/analytics/events.ts`. Nothing fires before cookie consent, per `PostHogProvider`.

Events, all carrying LO number and outcome code:

- viewed, when the component enters the viewport
- started, on the first placement
- checked, with the number of items placed correctly and the total
- revealed, when the escape hatch is used instead of checking
- retried

The checked and revealed pair is what tells you whether people engage or bail. That is the entire measurement for this pilot.

## Do not

- Do not build a general markdown table classifier.
- Do not touch table 1 in section 1a (`Reason | What it buys you`). It is the in-page control and must stay static.
- Do not write to Supabase or add a migration.
- Do not gate LO progress, checkpoints, or the pathway on completing the interaction.
- Do not edit `content/v2/lo1.json`, the `lessons` table, or `lessons_v2`.
- Do not restyle the surrounding lesson. New styling should look like it was always in the existing markdown styles.
- Do not build the Before and After toggle from the prototype. That exists so Sim can compare, and has no place in the product.

## Report back

Append to `BUSINESS_STATE.md`: whether the allowlist matched both tables on first run, how you solved the hydration shuffle, the new analytics event names, and anything in `CoreContentBlock.tsx` that resisted the change. If reading the first cell out of the ReactMarkdown children proved unreliable, say so plainly rather than working around it, because that decides whether this approach can scale past one section.
