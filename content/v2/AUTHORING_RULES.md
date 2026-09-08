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
