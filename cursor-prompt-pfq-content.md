# Cursor prompt — PFQ lesson content pipeline and renderer

**Written 13 Aug 2026.** Runs alongside `cursor-prompt-pfq-course.md` (entitlement, paywall, pricing). That prompt still stands. This one covers content only, and it is the part that can start immediately because the schema is fixed and objective 1 exists as a reference fixture.

**Read first:** `PFQ in 2 days/lessons/objective-01.json`. That file is the contract. Claude is authoring objectives 2 to 10 to the identical shape while you build.

---

## Task 0 — Check before you build

The PMQ v2 content in `content/v2/lo*.json` uses substantially the same schema, and something already renders it. **Find that renderer and establish whether it can be reused for PFQ.** Reusing it is strongly preferred over a second implementation. Report what you find either way before writing a new component.

Differences to expect between the PMQ files and the PFQ ones:

| PMQ v2 | PFQ | Note |
|---|---|---|
| `lo_number`, `lo_code` | `objective_number`, `objective_code` | Renamed because PFQ has 10 objectives containing 59 outcomes, and calling both "LO" caused real confusion |
| `key_definitions[].apm_definition` | `key_definitions[].definition` | PFQ definitions are originally worded, not quoted from APM |
| `core_content[].diagrams` | absent for now | Decision pending. Treat as optional |
| — | `core_content[].watch_for` | New. Exam traps for that outcome |
| — | `competence_area: null` | Deliberately null. The handbook publishes no per-objective mapping. Do not populate it |

## Task 1 — Content loader

- Load `PFQ in 2 days/lessons/objective-*.json` at build time. Do not read them at request time and do not paste content into components.
- Type the schema properly in `src/lib/pfq/content.ts`. Every field in objective 1 is required except `competence_area` and `diagrams`.
- Fail the build on a malformed file. Silent partial content is worse than a broken build.

## Task 2 — Validation test

Extend `tests/` with a content invariant test. It must fail if:

1. The union of `core_content[].outcome_code` across all ten files is not exactly the 59 syllabus outcomes.
2. `learning_outcomes` in a file disagrees with the `outcome_code` values in its `core_content`.
3. Any `body_markdown`, `key_takeaway`, `watch_for`, misconception or checkpoint string contains an **em dash** (`—`, U+2014). House rule, no exceptions.
4. Any `body_markdown` contains bold markers (`**`). Bold is not used in core content. Tables and headings are fine.
5. Any objective file is missing `where_this_fits`, `key_definitions`, `misconceptions`, `memory_aids`, `progress_checkpoint` or `source_confidence`.

Rules 3 and 4 are Sim's house style for this course. Enforcing them in CI means nobody has to remember them.

## Task 3 — Lesson map at `/pfq/learn`

- Ten objectives, split Day 1 (objectives 1 to 5, 30 marks) and Day 2 (objectives 6 to 10, 30 marks).
- Each objective shows its title, outcome count, mark count and completion state.
- Mark weighting must be visible. Objective 4 is 11 marks, objective 3 is 1 mark, and a learner deciding what to revise tonight needs to see that. Do not render ten identical cards.
- Outcome display names come from `PFQ in 2 days/pfq-outcome-titles.json`. Do not invent strings.

## Task 4 — Objective page

One page per objective, rendering in this order:

1. `where_this_fits`
2. `key_definitions` as a term list, each with its plain English gloss
3. `core_content`, one block per outcome: `outcome_code` and `outcome_title` as the heading, `key_takeaway` called out, `body_markdown` rendered as markdown including tables, then `watch_for` in a distinct treatment
4. `misconceptions` as wrong/right pairs, visually contrasted
5. `memory_aids`
6. `progress_checkpoint` as interactive checkboxes

`source_confidence` is internal. Do not render it to learners.

## Task 5 — Checkpoints and progress

- Checkpoint items are tickable and persist per user.
- Use `section_progress`. **Known gotcha:** completion has two signals, timestamps and `checklist_state`. A reset must clear both, or the pathway still reads complete. See `OPERATIONS.md`.
- An objective counts as complete when its checkpoints are all ticked. Do not infer completion from scroll position or time on page.
- Feed completion into the existing coverage map so lessons, practice and mock all report against the same 59 outcomes.

## Task 6 — Deep links

Every outcome needs a stable anchor, for example `/pfq/learn/4#4.10`. The mock results screen links a missed outcome straight to the passage that teaches it. That link is the main reason the coverage map is worth anything, so it must not break when content is re-authored.

---

## Acceptance criteria

1. All ten objective files load and render; a malformed file fails the build.
2. The validation test passes on objective 1 today, and demonstrably fails if an em dash, a `**`, or a missing outcome code is introduced.
3. `/pfq/learn` shows both days with real mark weights.
4. Every one of the 59 outcomes is reachable by a stable anchor.
5. Ticking all checkpoints in an objective marks it complete, and a reset clears both completion signals.
6. `source_confidence` appears nowhere in the client bundle.
7. Content is gated at `pro` once `cursor-prompt-pfq-course.md` Task 1 lands. Until then, gate behind a flag rather than shipping it open.

## Report back

Append to `BUSINESS_STATE.md`: what shipped, what didn't, and specifically whether the PMQ v2 renderer was reusable. Leave Linear at In Review. State plainly whether any migration was applied, not just written.
