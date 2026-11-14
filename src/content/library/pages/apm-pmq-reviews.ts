import { scaffoldLibraryPage } from "../scaffold";

export const page = scaffoldLibraryPage({
  slug: "apm-pmq-reviews",
  title: "APM PMQ reviews (LO6): what you need to know",
  metaTitle: "APM PMQ Reviews (LO6) | Learn in Curve",
  metaDescription:
    "APM PMQ LO6 reviews: decision gates, what gets reported, information management and why plans change after a review, plus a five-mark answer.",
  group: "syllabus",
  related: [
    "apm-pmq-assurance",
    "apm-pmq-governance",
    "apm-pmq-business-case",
    "apm-pmq-benefits-management",
    "how-to-answer-apm-pmq-exam-questions",
  ],
  loNumber: 6,
  status: "published",
  updatedAt: "2026-11-14",
  answerFirst:
    "APM PMQ reviews (LO6) tests whether you understand reviews as the internal check on a project's status and ongoing viability. Decision gates re-test the business case, reports pair each deviation with a reason and a response, and a review can rightly end in re-planning or termination.",
  body: `Reviews are the mechanism that keeps everything else honest. Governance (LO2) built the structure; reviews feed it information. The business case (LO4) must be re-tested; reviews are where that happens. Benefits management (LO9) and assurance (LO7) both connect here too. Fix one distinction early and never lose it: **reviews are internal to the initiative, assurance is independent of it.**

## What APM tests you on in LO6

The learning objective is about reviews as a way of gathering information to assess a project's status and whether the work is still viable. It has four learning outcomes:

- **6a:** the benefits of reviews throughout the life cycle, including decision gates, benefits reviews and audits.
- **6b:** the factors typically reported on to help a project succeed.
- **6c:** why producing information and collecting data matters for decisions, and for communicating actions and decisions to stakeholders.
- **6d:** why activities may be re-planned after a review.

## Why reviews matter (6a)

A review gathers information so decision-makers have something factual to decide on. It is the initiative looking at itself, which is why reviews can be frequent and candid, and why independent assurance exists alongside them.

| | Reviews | Assurance |
|---|---|---|
| Position | Internal to the initiative | Independent of it |
| Who takes part | The project's governance tiers and stakeholders such as users | People outside the initiative |

The benefits to hold, if you can only hold three:

- **Governance and oversight:** reviews are the basis for informed decisions.
- **Keeping the project relevant:** assumptions about benefits are re-tested, and the work is checked against the organisation's current strategy.
- **Remedial actions:** recording a variance is easy; the value lies in the actions it produces.

Reviews also give advice and confidence to the team, feed lessons into knowledge management, and are a chance to engage stakeholders and win backing.

The principles are the same in linear and iterative life cycles. Linear reviews are less frequent and more formal, at milestones and stage boundaries. Iterative reviews happen at the start or end of each cycle, with formats such as the sprint review (what the team produced) and the retrospective (how the team worked).

## Decision gates: go, no go or conditional go

A decision gate is a formal review point that confirms viability against the business case. Every gate asks two questions:

| Direction | Question |
|---|---|
| Backward-looking | Has everything that should be done by now actually been done? |
| Forward-looking | Does the business case still stand, with benefits reachable at acceptable cost and risk? |

Passing the first and failing the second is still a no-go. The outcomes are go, no go, or **conditional go**: proceed, provided specific conditions are met within a set timeframe. Gates are also a chance to get authority for procurement, release of funding or scope changes.

Reviewers act as a critical friend, not an ambush. But the gate's job is the right decision for the organisation, which may be to pause, re-plan or terminate. That is how organisations avoid the **sunk cost trap**: money already spent should not decide what happens next.

Later in the extended life cycle come the post-project review after transition, and the benefits review during adoption, which tests whether the expected benefits actually arrived. Audits are independent, which puts them closer to assurance than review.

## Who owns what

- **The sponsor and governance board** are accountable for the decision to continue at a gate, and the sponsor holds accountability between gates.
- **The project manager** is responsible for arriving ready, with documentation complete and on time.
- **The PMO**, where one exists, provides the support and people that stop reviews becoming a tick-box exercise, and helps spread lessons to other projects.

## What gets reported (6b)

Reviews identify deviation against plan, budget, scope and quality. But a deviation alone is not a report. Three things travel together:

| Element | Why it is needed |
|---|---|
| The deviation | What has moved, and by how much |
| The reason | Why it moved; without it, remedial action is guesswork |
| The response | The proposed remedial action, where the real value sits |

**Tolerances** turn numbers into signal. They set how far off plan is acceptable before someone must act, benchmarked against the master plan and business case. Reviews also cover whether assumptions still hold, fit with current strategy, risks and issues, progress against milestones, and business case viability.

How formal and frequent reporting is should follow the project's risk, complexity and value. Reporting a small internal project like a national programme wastes delivery effort.

## Information, data and decisions (6c)

The quality of decisions is capped by the quality of information. A board with poor information does not make cautious decisions; it makes uninformed ones.

One easily missed point: **the closer reviewers get to raw data, the more objective the decision**, because every round of summarising is another chance for bias. Stakeholders are both a source of information and an audience, so ask what they need to know and in what form.

Information management covers six stages: collection, storage, curation, dissemination, archiving and destruction. Destruction is the one people forget, and it follows statutory requirements and organisational policy, because keeping information forever is a data protection problem. Version control matters too: people working from out-of-date documents cause wasted time and expensive errors. Decisions then have to flow back out, so changes are communicated to the stakeholders who need them.

## Why plans change after a review (6d)

Re-planning is not a sign the review found a problem. It is the review working. Common triggers include a variance beyond tolerance, approved remedial actions that pull resources off baseline work, assumptions or strategic fit that no longer hold, a business case in doubt, and conditions attached to a conditional go.

The sequence matters: the review records the deviation, reason and response; governance scrutinises and approves the response; the team implements it; and governance expects the remediation to be monitored and reported. The team does not re-plan on its own authority.

In a linear project, re-planning responds to variance. In an iterative one, adaptive planning and backlog grooming make it part of the normal rhythm.

## Worked scenario: weak answer vs strong answer

> *At a stage gate, a project has completed all planned work for the phase, but a competitor has launched a similar product and the forecast benefits now look doubtful. Explain how the gate review should handle this. (5 marks)*

**Weak answer:** "The project has done all its work so it should pass the gate. The project manager should keep going and try to finish quickly so the money spent so far is not wasted."

That answer only asks the backward-looking question, gives the decision to the wrong person and walks straight into the sunk cost trap. It might scrape one mark.

**Strong answer:**

- The gate should ask the **forward-looking question**: is the business case still viable at acceptable cost and risk, not just whether the work is complete.
- The review should report the change with its **reason and a proposed response**, using data as close to raw as possible.
- The **sponsor and governance board** make the decision; the project manager's role is to arrive with complete documentation.
- Options include go, no go or a **conditional go** with specific conditions and a timeframe, or re-planning the remaining work.
- Money already spent should not drive the decision; pausing or terminating may be right, avoiding the **sunk cost trap**.

Five distinct points, each one easy for a marker to find and credit.

## Common exam traps

- **"Reviews and assurance are the same thing."** No. Reviews are internal; assurance is independent.
- **"A decision gate is a completeness check."** No. It also re-tests the business case going forward.
- **"The project manager decides whether the project passes the gate."** No. The sponsor and governance board are accountable.
- **"A well-run project should never be stopped at a gate."** No. Terminating can be the right decision for the organisation.
- **"A polished summary is the best input to a review."** No. Raw data gives a more objective decision.
- **"Once a remedial action is approved, the review is closed."** No. Governance expects the remediation to be monitored and reported.

`,
  practice: [
    {
      prompt: "What makes a review different from assurance?",
      options: [
        { key: "A", label: "Reviews only happen at the end" },
        { key: "B", label: "Reviews are internal to the initiative" },
        { key: "C", label: "Reviews are always run by auditors" },
        { key: "D", label: "Reviews never involve stakeholders" },
      ],
      correctKey: "B",
    },
    {
      prompt: "A gate allows the project to proceed provided two issues are fixed within a month. What is this outcome called?",
      options: [
        { key: "A", label: "Go" },
        { key: "B", label: "No go" },
        { key: "C", label: "Conditional go" },
        { key: "D", label: "Re-baseline" },
      ],
      correctKey: "C",
    },
    {
      prompt: "Which of these is the stage of information management people most often forget?",
      options: [
        { key: "A", label: "Collection" },
        { key: "B", label: "Dissemination" },
        { key: "C", label: "Storage" },
        { key: "D", label: "Destruction" },
      ],
      correctKey: "D",
    },
  ],
  faqs: [
    {
      question: "What is LO6 in the APM PMQ?",
      answer:
        "LO6 is reviews: the benefits of reviews across the life cycle, including decision gates, benefits reviews and audits, what is typically reported, why good information and data matter for decisions, and why activities may be re-planned after a review.",
    },
    {
      question: "What is the difference between a review and assurance?",
      answer:
        "A review is internal to the project and involves its governance tiers and stakeholders. Assurance is independent of the project. A decision gate can be either, depending on whether the reviewers come from inside or outside the initiative.",
    },
    {
      question: "Who decides whether a project passes a decision gate?",
      answer:
        "The sponsor and governance board are accountable for the decision to continue. The project manager is responsible for being ready, with documentation complete and available on time.",
    },
    {
      question: "Why might a project be re-planned after a review?",
      answer:
        "Because a variance is beyond tolerance, remedial actions need resources, assumptions or strategic fit no longer hold, the business case is in doubt, or a conditional go has set new conditions. Re-planning can also mean pausing or terminating.",
    },
  ],
  sources: [
    {
      label: "APM Project Management Qualification (PMQ)",
      url: "https://www.apm.org.uk/qualifications-and-training/project-management-qualification/",
      publisher: "Association for Project Management",
    },
  ],
});
