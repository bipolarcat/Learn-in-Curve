# v2 content authoring rules

**Status:** active
**Established:** 2026-08-02 (during LO2 authoring)
**Applies to:** every file in `content/v2/loN.json`

Read this with `SOURCE_REGISTER.md` (what you may author *from*) and `SOURCE_MAP.md` (which
source pages to read for each LO). This file is the *shape and quality* rules. `lo1.json` and
`lo2.json` are the reference implementations.

---

## Schema

Top-level keys, in order:

`lo_number`, `lo_code`, `title`, `competence_area`, `exam_coverage_note`, `source_ref`,
`authored_on`, `review_status`, `apm_learning_objective`, `learning_outcomes`,
`where_this_fits`, `key_definitions`, `core_content`, `misconceptions`, `memory_aids`,
`progress_checkpoint`, `source_confidence`

All LOs must carry the same key set. Parity is checked mechanically — see Verification below.

---

## Rule 1 — Progress checkpoints: maximum eight

**Set 2026-08-02.** `progress_checkpoint` holds **no more than 8 entries**.

Why: a checkpoint list is a self-assessment tool, not a coverage audit. LO2 was drafted with 18
and became something a learner skims rather than uses. Where an LO has more than eight things
worth checking, **combine related items into one compound checkpoint** rather than dropping
coverage — for example, four factors *and* the culture model in a single line.

Applies retrospectively: `lo1.json` was trimmed from 12 to 8 on the same date.

---

## Rule 2 — Diagrams are placeholders, not code

**Set 2026-08-02.** Sim supplies the diagram assets. Claude does not author Mermaid, inline SVG,
or any other renderable diagram code into the JSON.

Each diagram object carries:

| Field | Meaning |
|---|---|
| `id` | Stable slug, `loN-short-name` |
| `figure_number` | `N.1`, `N.2`, … within the LO |
| `caption` | Displayed caption |
| `placement` | `after_heading` (currently the only value in use) |
| `heading` | The exact body heading it sits under |
| `file` | Path to the asset once supplied; **`null` until then** |
| `spec` | What the diagram must show, and the point it must make. Required whenever `file` is null |
| `alt` | Accessibility text. Always required |

`spec` is a brief to a designer, not a description of a picture. State the elements, their
arrangement, and **the argument the diagram is making** — a reader who only looks at the figure
should get the point. Where a v1 asset already exists that could be reused, name its path in the
`spec`.

Superseded: `DIAGRAM_MERMAID_AUDIT.md` recommended a hybrid Mermaid-plus-SVG approach. That
audit remains useful as an inventory of *which* diagrams exist and which shapes resist Mermaid,
but no Mermaid is authored into v2 JSON. Nothing in `src/` renders Mermaid.

---

## Rule 3 — Source confidence must be declared

**Set 2026-08-02.** Every LO carries a `source_confidence` array flagging claims where the
relationship between the syllabus, the permitted sources and what we wrote is not one-to-one.

This exists because the PMQ 2024 syllabus examines things BoK 8e does not fully cover. LO2 hit
three in one LO. Those gaps get filled by reasoning, which is legitimate — but the reasoning must
be visible, not buried in a chat log that the next session will not have.

Each entry:

```json
{
  "claim": "What we asserted, in one sentence.",
  "sub_outcome": "2b",
  "level": "sourced | assembled | inferred | constructed",
  "basis": "Exactly which source text supports it, with page refs — or the plain statement that none does.",
  "risk": "What could go wrong, and what would resolve it."
}
```

| Level | Meaning |
|---|---|
| `sourced` | Stated directly in a permitted source. Only log it when the claim *reads* like interpretation and isn't |
| `assembled` | Composed from several scattered source references; no single passage says it |
| `inferred` | Syllabus names it; sources do not define it. Written from standard practice |
| `constructed` | The components are sourced but the structure or model is ours |

### The review standard for gap-filled models

**Set 2026-08-02 by Sim, replacing an earlier stricter gate.**

The syllabus names techniques BoK 8e does not carry — SWOT, PESTLE, Maslow, Herzberg, McGregor,
Belbin, Myers-Briggs, Margerison McCann, Katzenbach and Smith, and others. These are established
techniques **adopted by APM and published by other authors**. They do not need verification
against a published sample paper.

**The standard is conceptual accuracy:** does our explanation match what the term and the concept
actually mean? If yes, the entry is reviewed and the LO can ship.

What `source_confidence` is still for, given that:

1. **Provenance honesty.** A learner must never quote a gap-filled model back as APM doctrine, so
   the content says plainly where the boundary sits. That disclosure is the deliverable, not the
   flag itself.
2. **Revision safety.** When an LO is later edited, whoever does it can see which claims rest on
   the source and which on general theory, and treat them differently.
3. **Clean-room evidence.** It documents that gap-filled content was written from understanding
   rather than lifted from a competitor's material.

An `inferred` or `constructed` entry is therefore **not a blocker**. It is a record.

---

## Rule 4 — Memory aids must encode, not just name

A cue that lists items without telling the learner *which is which* is worse than no cue, because
it feels like knowledge. LO1 shipped `"Earth, water, fire, air"` with an expansion that gave a
false single spectrum and no way to tell water from fire; it was removed on 2026-08-02.

Test before keeping one: **could a learner who has forgotten the content reconstruct the mapping
from the cue alone?** If not, either rewrite it so they can, or drop it and leave the table in the
body to do the work.

---

## Rule 5 — Own voice, mechanically checked

Per `SOURCE_REGISTER.md`, facts and terminology are free; sentences and structure are not. The
working threshold: **no run of 9 or more consecutive words shared with a source**, outside
`apm_definition` fields, where short quotation of APM's defined terms is permitted by design.

Check it, don't eyeball it. LO2's first draft carried a 22-word verbatim run that read as
perfectly normal prose.

---

## Verification before handing an LO over

Run all of these. LO2 failed three of them on first draft.

1. **JSON parses.**
2. **Key parity** with `lo1.json` at top level and inside `key_definitions`, `core_content`,
   `misconceptions`, `memory_aids`.
3. **Checkpoint count ≤ 8.**
4. **Every diagram** has either a real `file` or a `spec`, plus `alt` in both cases.
5. **Syllabus term sweep** — every noun the Handbook names for this LO appears somewhere in the
   JSON.
6. **9-word overlap scan** against the extracted source text.
7. **Memory aids** pass Rule 4.
8. **`source_confidence`** covers every claim where the syllabus outran the sources.

---

## Working sequence per LO

1. Read this file, `SOURCE_REGISTER.md`, and the `SOURCE_MAP.md` row for the LO.
2. Extract the mapped BoK pages and the Handbook syllabus block for that LO. BoK 8e printed page
   +1 = PDF page in `sources/APM PMBOK 8th edition.pdf`.
3. Author the JSON.
4. Run the verification list.
5. Hand to Sim with the `source_confidence` entries called out. One LO at a time — Sim reviews
   before the next starts (decided 2026-08-02).

---

## Rule 6 — Bold is structural only

**Set 2026-09-08 by Sim, during the LO3 style pass.**

Bold carries **no emphasis** in body prose. It appears in exactly three places, none of which
are authored as `**` in `body_markdown`:

| Where | How it gets bold |
|---|---|
| A key definition's term | `key_definitions[].term`, styled by `DefinitionsReveal` |
| A section heading | `##` / `###`, styled by `CoreContentBlock` |
| A table's first column | Styled by `StudyTable` / the markdown table shell |

So: **no `**` anywhere in `body_markdown`, `exam_tips[].tip`, `misconceptions`, `memory_aids`,
`where_this_fits` or `progress_checkpoint`.**

Why: bold works by contrast. Density had drifted from 3.5 spans per 100 words in LO1 to 7.6 in
LO21, at which point nothing is emphasised and the page reads as machine-generated. Two different
jobs were also sharing one symbol: emphasis in prose, and the row-label convention in table first
columns. The second is styling, and belongs to the component.

Where a term genuinely needs to stand out mid-sentence, restructure the sentence so the term leads,
or move it into a table or a definition. Italics stay available, used sparingly, for a genuine
contrast of sense (*strategy* against *achievement*), not for emphasis.

Check it mechanically: `grep -c '\*\*' content/v2/loN.json` must return 0.

---

## Rule 7 — Exam tips are separate from study prose

**Set 2026-09-08 by Sim, during the LO3 style pass.**

Coaching about the exam does not sit inside the explanation. It lives in `exam_tips[]` on the
core content block:

```json
{ "id": "loN-tip-slug", "heading": "Exact ## body heading", "placement": "after_section", "tip": "…" }
```

Rules:

1. **One label.** Everything renders as "Exam tip". Three labels were tried and two of ten were
   misfiled inside a single LO.
2. **`after_section` by default.** A section reads heading, prose, table, diagram, tip. Nothing
   goes between a heading and its first sentence. `after_heading` exists for the rare tip that must
   frame a section, and should be argued for.
3. **Diagrams follow the same rule.** `placement: "after_section"`, rendered just before the tip.
4. **Split per sentence, not per passage.** A distinction the learner needs in order to understand
   the topic is teaching and stays in the flow. Only the how-the-exam-behaves half lifts out.
   Example from 3b: "LCA is about a product, EIA is about a project or plan" stayed in the body;
   "if the scenario is a construction go/no-go decision, it is an EIA" became the tip.
5. **One tip per heading.** Two tips on the same section stack into a wall. Merge them.

---

## Rule 8 — Recall activities and worked examples

**Set 2026-09-08 by Sim.** Both live inside the `core_content` block, so they survive
`toLessonBody` in `scripts/migrate-v2-content.mjs` without a schema change there.

Three activity types, and no more. A learner cannot tell eight mechanics apart, and each
extra one costs more in interface noise than it returns.

| Type | Use it when | Authoring cost |
|---|---|---|
| `pairup` | A two-column table whose right-hand cells average **under ~20 words** | None, the cells already exist |
| `lineup` | A genuine sequence, not a list that happens to be numbered | One ordered array |
| `groupup` | The buckets are **unarguable**. A contestable bucket teaches a wrong model | Buckets plus a tag per item |

Limits, all learned on LO3:

1. **Max two activities per `##` heading.** More reads as a quiz, not a lesson.
2. **Pair up: 3 to 6 pairs.** Above six the learner scans instead of retrieving. Chunk a
   nine-row table rather than showing all nine.
3. **Skip pair up where cells are long.** LO3's life cycle table averages 30 words a cell
   and peaks at 47. Those become paragraphs on a card. That table is a `lineup` anyway.
4. **Reject a contestable groupup.** The nine benefits could be split commercial / legal /
   delivery, and it was dropped because several rows argue both ways. Sorting them wrong
   teaches a model that is wrong.
5. **Worked examples anchor to a table ROW**, via `row_label` matching the first-column
   text exactly. Everything else anchors to a heading.
6. **Worked examples run 60 to 70 words**, in three beats: situation, ask, answer with the
   reason. The reason clause is the part that must never be cut, because it is the only
   thing separating a worked example from an exam tip.
7. **Voice.** Written in the Enthusiast register per `VOICE_GUIDE.md`. The Professional
   register (passive, process-heavy) is the default trap when writing about project
   management and has to be actively resisted. Read that file before authoring either.

Both are **Pro** features, gated only through `canAccessRecallActivities()` in
`src/lib/pmq/tiers.ts`. Starter sees the table with no icon and no padlock.

---

## Status: the full pass is complete

**2026-09-08.** All 24 PMQ LOs now meet Rules 6, 7 and 8. Authored one LO per fresh context
against a single written brief, then verified mechanically, specifically to avoid the drift that
produced the original problem (bold density climbed from 3.5 spans per 100 words in LO1 to 7.6 in
LO21 as the first pass wore on).

| | Course total |
|---|---|
| Exam tips | 224 |
| Recall activities | 231 (131 pair up, 44 lineup, 56 group up) |
| Worked examples | 88 |
| Em/en dashes in learner text | 0 |
| Bold markers in learner text | 0 |
| `key_takeaway` | removed from PMQ entirely |

Drift check across the run, first third against last third: activities per LO 9.1 then 9.8, tips
per LO 9.0 then 9.9, worked examples 3.6 then 3.8. No degradation.

### The verification any future pass must repeat

Per LO: JSON parses, key parity with lo1, zero dashes and bold in learner text, every tip,
diagram, activity and worked example anchor resolves, activity size limits hold, max two
activities and one tip per heading, and **no original sentence lacks a counterpart** (a
difflib similarity sweep at 0.55, plus a content-word set difference). The last check is the
one that matters: it is what proves a rewrite re-expressed the content rather than trimming it.

Words the VOICE_GUIDE tells you to cut (`candidates`, `just`, `really`, `basically`,
`obviously`, `actually`) are exempt from the content-word check. Their disappearance is the point.

### Rendering

`LoLearnStage` no longer branches per LO. `Lo1InteractiveTable` is superseded by `StudyTable`
and has been removed from `src/`. One Learn layout, one table component, for all 24.
