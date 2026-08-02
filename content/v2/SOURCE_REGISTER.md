# Source Register — Learn in Curve PMQ content (v2 rebuild)

**Status:** active
**Established:** 2026-08-01
**Applies to:** all content authored into `content/v2/` and published to `sections_v2` / `lessons_v2`.

This file is the clean-room boundary for the v2 content rebuild. Its purpose is to make
"this content was written from the published standard, not derived from a competitor's
material" a documented and dated fact rather than a claim made after the event.

Anyone (or any agent) authoring v2 content must work only from the permitted sources below.

---

## Permitted sources

| Source | Edition / version | Use |
|---|---|---|
| APM Body of Knowledge | 8th edition | Factual substance, terminology, concept definitions |
| APM PMQ Candidate Handbook | 2024 | Syllabus structure, learning outcomes, assessment criteria, command words, mark allocations |

**How they may be used.** Read for understanding; write from understanding. Facts,
terminology, syllabus structure and learning-outcome statements are not protectable
expression and may be used freely. Sentences, paragraphs, table structures and figures
are protectable expression and must not be reproduced or closely paraphrased.

**Quotation limits.** Short quotations are acceptable only for (a) APM's own defined terms
where the exam requires the exact wording, and (b) syllabus learning-outcome statements
used for identification. Both must be clearly marked as APM definitions in the content
(the `apm_definition` field). Everything else is written in Learn in Curve's own voice.

---

## Excluded sources — must not be used

| Source | Reason |
|---|---|
| Third-party training provider delegate packs (incl. `APM PMQ - Delegate Pack.pdf`) | Commercial competitor material. Derivation is both higher-risk and far easier to demonstrate than derivation from a published standard. |
| v1 Learn in Curve content bodies | v1 substance was derived in part from the excluded delegate pack. v2 substance must be rebuilt from permitted sources only. |
| Any AI tool output grounded on an excluded source | Laundering through a model does not change the provenance of the output. |

### Note on v1 reuse

The v1 **pedagogy layer** — the *shape* of misconceptions, worked examples, command-word
tables, progress checkpoints, memory aids — is Learn in Curve's own original work and may
be carried forward as a structural pattern. The v1 **substance** may not be copied into v2.
Rebuild the substance; keep the teaching method.

---

## Diagram rules

All diagrams are original works depicting factual content. No published figure is traced,
screenshotted, redrawn over, or "adapted from".

1. Author from the concept, not from the page. Understand it, close the source, then draw.
2. Use Learn in Curve's own visual system — brand colours, typeface, box and arrow styles —
   consistently across all 24 LOs.
3. Never reproduce a source figure's distinctive arrangement, groupings or invented axes.
   Where a layout is dictated by the underlying fact (e.g. four phases in sequence), that
   layout carries little or no protectable expression and is safe.
4. **Never use an "adapted from [source], Figure X" caption.** It is not a licence and not a
   defence; it is a written record of copying.
5. Do not use APM's logo, brand colours or house visual style. Implying accreditation or
   endorsement is a trademark and passing-off risk separate from copyright.

### Provenance record

Every diagram carries a provenance object in its LO file:

```json
{
  "id": "lo1-lifecycle-phases",
  "file": "lifecycle-phases.svg",
  "caption": "...",
  "provenance": {
    "concept": "Sequence of phases in a linear project life cycle",
    "authored_by": "Learn in Curve",
    "authored_on": "2026-08-01",
    "derived_from_published_figure": false,
    "note": "Original work drawn from the syllabus concept. Not derived from any published figure."
  }
}
```

Contemporaneous records of independent creation are the single most useful evidence if
provenance is ever questioned, and they cannot be reconstructed credibly after the fact.

---

## The test

Before any diagram or passage ships:

> If the source's version had never existed, would I have produced something roughly like this anyway?

**Yes** — it is dictated by the underlying facts. Ship it.
**No** — a distinctive choice here exists only because theirs did. Rewrite or redraw it.

---

## Standing caveat

This register reflects informal guidance, not legal advice. The diagram and content-authoring
approach set out here is how legitimate exam-prep publishers routinely operate and is low risk
when followed. The broader commercial positioning — selling preparation for another body's
certification, and any wording that could imply accreditation — is the item that warrants
review by a qualified solicitor. Tracked in `legal/PRE_LAUNCH_CHECKLIST.md`.
