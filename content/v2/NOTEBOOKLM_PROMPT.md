# NotebookLM prompt — PMQ learning content

**Sources loaded in the notebook: exactly two.**
1. APM Body of Knowledge, 8th edition
2. APM Project Management Qualification: Handbook (2024)

Remove every other source before running. For the bake-off, use learning objective **1) Life cycles**.

---

## The prompt

> Using only these two sources, create the study material a candidate needs to pass the APM PMQ exam for learning objective **[NUMBER AND NAME]**, covering every sub-outcome in the Handbook syllabus for it.
>
> Include diagrams as Mermaid `flowchart` code blocks. Keep it concise enough to actually revise from.

---

## Notes

Deliberately minimal. A long prescriptive prompt would test how well the instructions were
written, not what NotebookLM does with the sources — and since the point of the bake-off is to
find out where its judgement is strong and where it drifts, constraining it would hide the answer.

Whatever it produces gets compared against `lo1.json` on: sub-outcome coverage, scope discipline
(anything belonging to a different learning objective), terminology and edition accuracy, and
whether its exam technique is specific to life cycles or generic.
