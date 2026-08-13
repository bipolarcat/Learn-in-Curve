# PFQ in 2 Days — Day Split

**Decided 13 Aug 2026.** Split is chronological (syllabus order, LO1→LO10, nothing reordered) and lands on an exact 30/30 mark split. No judgement call was needed — the syllabus happens to divide cleanly at the LO5/LO6 boundary.

| Day | Learning objectives | Outcomes | Exam marks | % of paper |
|---|---|---|---|---|
| **Day 1** | LO1 – LO5 | 30 | **30** | 50% |
| **Day 2** | LO6 – LO10 | 29 | **30** | 50% |
| | | 59 | 60 | 100% |

Day 2 carries one fewer outcome but the same marks because LO10.4 (team development models — Belbin *and* Tuckman) is the outcome assessed twice.

---

## Day 1 — Foundations, planning and scope (30 marks)

| Session | LO | Title | Outcomes | Marks |
|---|---|---|---|---|
| 1.1 | LO1 | Project management and the operating environment | 1.1–1.6 | 6 |
| 1.2 | LO2 | Project life cycles | 2.1–2.4 | 4 |
| 1.3 | LO3 | Roles and responsibilities | 3.1 | 1 |
| 1.4 | LO4 | Project management planning | 4.1–4.11 | **11** |
| 1.5 | LO5 | Project scope management | 5.1–5.8 | 8 |

**Why this holds together:** LO1–3 are the vocabulary spine — you cannot answer a planning question without knowing what a project, a life cycle and a sponsor are. LO4 and LO5 are then the two heaviest blocks in the syllabus (19 marks between them, 32% of the paper), and both depend on the life-cycle model taught in LO2.

**Pacing note for the learner:** LO4 alone is 11 marks — more than Day 2's entire quality *and* communication content combined. LO3 is 1 mark for seven role definitions. Tell them this; don't let session length imply weighting.

## Day 2 — Delivery, control and people (30 marks)

| Session | LO | Title | Outcomes | Marks |
|---|---|---|---|---|
| 2.1 | LO6 | Resource, scheduling and optimisation | 6.1–6.6 | 6 |
| 2.2 | LO7 | Project risk and issue management | 7.1–7.8 | 8 |
| 2.3 | LO8 | Quality | 8.1–8.6 | 6 |
| 2.4 | LO9 | Communication | 9.1–9.5 | 5 |
| 2.5 | LO10 | Leadership and teamwork | 10.1–10.4 | 5 |
| 2.6 | — | Trap school (negative stems, multi-select, near-miss distractors, pacing) | — | 0 direct |
| 2.7 | — | Full 60-question timed mock, scored per outcome | — | — |

**Why this holds together:** Day 2 is everything that happens *during* delivery plus the people content, ending in the mock. Trap school sits immediately before the mock so the format training is fresh when it's tested.

---

## Coverage invariant

The product's core promise depends on one invariant that must be enforced in code, not by convention:

> Every one of the 59 learning outcomes has at least one question, and the mock draws exactly one question per outcome plus one duplicate.

`pfq-questions.json` is the source of truth. A CI check should fail the build if the set of `learning_outcome` values in the bank does not exactly equal the 59 syllabus outcomes.

**Do not hardcode 10.4 as the doubled outcome.** The handbook states only that *one* outcome is assessed twice, not which. The 2022 sample paper doubles 10.4; that is one observation, not a rule. The mock generator should pick the duplicate at random (or from a weighted pool) so learners aren't trained on a false pattern.
