# LIC-26 — Exam Technique Rewrite: LO1 Worked Example + Methodology

Status: **DRAFT — LO1 only, for Sim's review before scaling to LO2–24.** Nothing in
`PMQ in 5 days/content/*.json` has been touched. This is the proof-of-concept the
ticket asks for before burning research cycles across all 24 LOs, given this
project's history with unreviewed large batches going wrong (see LIC-28's first
attempt in `BUSINESS_STATE.md`).

## Why this exists

`exam_technique.golden_rules` and `command_words` across all 24 LOs currently
have no documented source — confirmed by a prior investigation (no citation, no
commit trail). LIC-26 asks for every claim to trace to a genuine source: APM's
own materials, real past exam questions, other accredited PMQ providers, or
community/forum discussion. Below is that treatment applied to LO1.

## Finding #1 — the current `command_words` table has a real, unsourced word in it

Current `lo1.json`:

```json
"command_words": [
  { "word": "State", "what_examiner_wants": "Short factual answer, one mark each." },
  { "word": "Explain", "what_examiner_wants": "Name and reason, with 'because' or 'so that' clauses." },
  { "word": "Describe", "what_examiner_wants": "Identify and characterise." },
  { "word": "Compare", "what_examiner_wants": "Show similarities and differences." }
]
```

I pulled APM's own published command-words document
([apm.org.uk PDF](https://www.apm.org.uk/v2/media/efane2fn/exam-technique-documentcommand-words-1.pdf))
and cross-checked against the **official 2024 APM PMQ sample paper**
([apm.org.uk PDF](https://www.apm.org.uk/media/q30cvpim/apm-project-management-qualification-sample-paper.pdf)).
Two things worth flagging rather than silently fixing:

- APM's command-words PDF headers itself "IPMA Qualifications" — it may be
  written for a different APM-administered qualification (e.g. Registered
  Project Professional), not specifically PMQ. Its definitions for **Describe**
  ("Give an account, including all the relevant characteristics, qualities and
  events") and **Compare** ("Identify similarities and differences such as
  advantages/disadvantages/strengths/weaknesses") match current content closely
  enough to trust. **"State" does not appear in that document at all.**
- But "State" genuinely is used in real PMQ papers — the 2024 sample paper uses
  it twice: *"State two review points during a project where it would be
  appropriate to report on financial performance. (2 marks)"* and *"State two
  tools or techniques that can be used to identify and analyse these
  factors."* Both are 2 marks for 2 discrete points — **1 mark per point**,
  which actually matches (not contradicts) the current content's claim.

**Open question for Sim, not resolved here:** keep "State" in the table sourced
from real paper usage (defensible) rather than from APM's formal command-words
glossary (which doesn't define it)? I'd lean yes — the goal is "how the exam
actually behaves," and real papers settle that — but flagging it as a judgment
call rather than deciding it silently.

## Finding #2 — a specific bad claim I almost included, caught by cross-checking

One early search result claimed *"An 'Explain', 'Describe' or 'Differentiate'
question will always be 10 marks per point, and a 'State' or 'Outline' question
will be worth 5 marks per point."* This does not hold up against the real
sample paper: Question 27 (*"Explain the purpose of each of the five steps."*)
is 5 marks for 5 purposes = **1 mark per point**, not 10. Question 15 (*"Explain
the five steps in a configuration management process."*) is the same ratio.
That 10/5 claim is likely bleeding in from a different qualification also
abbreviated "APM" (ACCA/CIMA's Advanced Performance Management paper — an
accounting exam, unrelated) that showed up in the same search. **Not including
it.** This is exactly the kind of unsourced-claim risk the ticket is trying to
eliminate — flagging it here so the same bad claim doesn't get reintroduced
from a future search pass on a different LO.

**Corrected mark-value guidance for the command words table, source-backed:**
mark allocation is not fixed per command word — it's *(total marks) ÷ (number
of discrete points asked for)*. State/Explain/Describe questions in the real
paper all follow this, not a fixed multiplier.

## Finding #3 — LO1's substantive golden_rules hold up well

Current content:

```
"golden_rules": [
  "Use 'linear' and 'iterative', never 'waterfall' or 'agile'. APM terminology only.",
  "Memorise the four project phases: Concept, Definition, Deployment, Transition. Two extended phases on top: Adoption, Benefits Realisation.",
  "When asked 'which life cycle', justify with three reasons tied to the scenario, and explain why one alternative does not fit.",
  "For a high-uncertainty IT project, pick iterative and pair it with the phrase 'allows objectives to evolve as learning and discovery take place'."
]
```

The four-phase / two-extended-phase structure is confirmed verbatim against
APM's own terminology (Concept, Definition, Deployment, Transition; extended =
+ Adoption, Benefits Realisation) via multiple accredited-provider study guides
citing the current APM syllabus. The 2024 official sample paper's Question 1
(*"which life cycle would not be suitable"* for a project with requirements
still being developed) and Question 22 (*"which statement describes the
strengths of a linear project life cycle"*) confirm this is a genuinely
recurring, scenario-based question pattern — not guesswork. So the substance
here was actually right; it was just never cited. **Recommend keeping these
four rules, with sources attached** rather than rewriting the content itself.

**Added, source-backed rule** (from
[Parallel Project Training's exam technique article](https://www.parallelprojecttraining.com/blog/how-to-answer-apmp-exam-questions-the-secret-tips/),
an accredited APM training provider — real named author, Paul Naybour):
scoring on "explain/describe" questions splits into *basic understanding* and
*further understanding*, each worth roughly half the marks. Basic understanding
is stating the fact; further understanding requires justification — the
article's own example phrase is *"this is important because…"* tied back to
the scenario. This is a genuinely useful, previously-missing technique note
that applies to LO1 specifically (life-cycle justification questions) and
arguably to most LOs' `golden_rules`.

## Proposed LO1 `golden_rules` rewrite (for review, not yet applied)

```json
"golden_rules": [
  "Use 'linear' and 'iterative', never 'waterfall' or 'agile' — APM terminology only. [Source: APM PMQ sample paper Qs 1, 22, 2024]",
  "Memorise the four project phases: Concept, Definition, Deployment, Transition. Two extended phases on top: Adoption, Benefits Realisation. [Source: APM PMQ syllabus, corroborated by accredited-provider study guides]",
  "When asked 'which life cycle', justify with reasons tied to the scenario, and explain why an alternative doesn't fit — this is a recurring real question pattern (see sample paper Qs 1, 13, 22). [Source: APM PMQ sample paper, 2024]",
  "For a high-uncertainty project (unclear requirements, evolving solution), iterative is the defensible answer — pair it with why: 'allows objectives to evolve as learning and discovery take place'. [Source: consistent with sample paper Q1's scenario framing]",
  "On explain/describe questions, half the marks are for stating the fact, half for justifying it against the scenario — use a phrase like 'this is important because...' to make the justification explicit rather than assumed. [Source: Parallel Project Training, accredited APM provider, 'How to answer APM PMQ exam questions']"
]
```

Each rule now carries a source. Where I couldn't find a genuine citation for a
claim, I didn't invent one — see the open "State" question above instead of a
silent decision either way.

## Sources used (LO1 pass)

- [APM PMQ Sample Paper, 2024](https://www.apm.org.uk/media/q30cvpim/apm-project-management-qualification-sample-paper.pdf) — official, apm.org.uk. Real questions, real mark values.
- [APM Command Words document](https://www.apm.org.uk/v2/media/efane2fn/exam-technique-documentcommand-words-1.pdf) — official, apm.org.uk, though possibly written for a different APM/IPMA qualification level — flagged above, not silently trusted.
- [Parallel Project Training — "How to answer APM PMQ exam questions the secret tips"](https://www.parallelprojecttraining.com/blog/how-to-answer-apmp-exam-questions-the-secret-tips/) — accredited APM training provider, named author (Paul Naybour).
- Cross-referenced against (not directly cited, corroborating only): Wellingtone's PMQ exam guide, Training ByteSize's PMQ hints and tips, multiple accredited-provider study guides on project life cycle phase definitions.

## Methodology proposed for LO2–24 (needs your go-ahead before I run it)

Per LO, same three-tier approach, cheapest/most-authoritative first:

1. **APM's own public materials** — sample papers, published guides, syllabus documents at apm.org.uk. Highest trust, used first.
2. **Accredited PMQ training providers' public content** (Parallel Project Training, Training ByteSize, Wellingtone, QA, Projex Academy, etc.) — real named authors/companies with accreditation to lose if wrong, used for exam-technique framing APM itself doesn't publish (e.g. marking-scheme psychology, common mistakes).
3. **Forum/community discussion** (Reddit, LinkedIn posts from people who've actually sat it) — used sparingly, for "what actually trips people up" texture, always flagged as anecdotal rather than authoritative.

Any claim I can't source at one of these three tiers gets flagged as an open
question for you, the way "State" is flagged above — not silently kept,
silently dropped, or invented. Given LO1 alone took a meaningful research pass,
expect this to be a multi-session effort across the remaining 23 — I'd suggest
batching by the existing day groupings (LO2–5 next, matching `PMQ_DAY_LOS`)
rather than trying all 23 at once, so you can review and course-correct early
rather than at the end.

**Not done yet:** LO2 through LO24. Nothing has been written to any `lo*.json`
file. This document is the review checkpoint before that work starts.
