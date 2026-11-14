import { scaffoldLibraryPage } from "../scaffold";

export const page = scaffoldLibraryPage({
  slug: "apm-pmq-solutions-development",
  title: "APM PMQ solutions development (LO17): what you need to know",
  metaTitle: "APM PMQ Solutions Development (LO17) | Learn in Curve",
  metaDescription:
    "APM PMQ LO17 solutions development: framing, option evaluation, scope, linear vs iterative scope, MVP vs MMP, and how to write a five-mark answer.",
  group: "syllabus",
  related: [
    "apm-pmq-requirements-management",
    "apm-pmq-breakdown-structures",
    "apm-pmq-business-case",
    "apm-pmq-change-control",
    "apm-pmq-project-life-cycles",
  ],
  loNumber: 17,
  status: "published",
  updatedAt: "2026-11-14",
  answerFirst:
    "APM PMQ solutions development (LO17) tests whether you can get from agreed requirements to the best way of meeting them. That means framing the problem, generating several options, judging them against criteria agreed in advance, then defining scope tightly enough to control it.",
  body: `Requirements management (LO16) works out what stakeholders need. LO17 works out how to provide it. The scope it produces feeds the breakdown structures behind scheduling (LO20) and budgeting (LO22), the option appraisal feeds back into the business case (LO4), and the decisions it records are what change control (LO24) later protects.

## What APM tests you on in LO17

The learning objective is about determining the optimal solution to satisfy agreed requirements. It has a single learning outcome, but it is a broad one:

- **17a:** how to evaluate and prioritise requirements to reach the best solution, and how the approach differs between life cycle models, including the use of a minimum viable product (MVP) and a minimum marketable product (MMP) in iterative life cycles.

## Start with the problem, not the answer

Solutions development begins by getting clear on the problem being solved. That forces you to rank the competing requirements different stakeholders brought, because no solution satisfies everyone equally.

The single most useful idea here is framing. How the objective is worded decides which options anyone will even consider.

| Framing | Options it allows |
|---|---|
| "Build a bridge between A and B" | Where the bridge goes and what type it is |
| "Help people move between A and B" | A bridge, a tunnel, a ferry, moving the destination, or removing the need to travel |

Frame the objective as a problem, and the outcomes and benefits follow from it. Frame it as a solution and you have chosen before you started.

Solutions must also meet both kinds of requirement. Functional requirements describe what the solution has to do. Non-functional requirements describe its qualities: appearance, durability, reliability, security, safety, sustainability, performance and maintainability. Non-functional requirements are the ones most often under-specified, and they tend to resurface later as acceptance disputes.

## Generating and evaluating options

APM is direct about the failure mode: too often there is a rush to a solution. Good practice is to set aside time at the start purely for generating options. On larger, more complex projects a dedicated options phase shows good governance and makes it clear to others why the final approach was chosen.

Options should cover a range of dimensions:

| Dimension | The question it asks |
|---|---|
| Do nothing | What happens if we do not proceed? This is always an option |
| Minimum viable to complete solution | How much of the possible scope do we build? |
| Single or multi-phase | One pass, or a pilot, trial or discovery phase first? |
| Technology maturity | How proven does the technology need to be? |

The minimum viable solution should always be considered. It is the cheapest and quickest option, and it forces people to work out the least that must be true for the project to succeed. It is a benchmark to reason from, though, not an automatic recommendation, because stakeholders may choose to go further for greater long-term benefits.

Each option is named and roughly assessed to reach a shortlist, covering the problem being solved, the effect on the organisation's future, risk and likelihood of success, deliverability, and cost, time and quality.

The sequencing point is the one that earns marks: **agree the evaluation criteria with stakeholders before the options are identified.** Criteria written afterwards can be shaped, consciously or not, to favour a preferred answer.

Remember the strategic angle too. Starting one project closes off other options. Some choices keep future opportunities open, others commit the organisation to a narrow path, so options are judged against strategic direction rather than in isolation.

## From chosen option to controlled scope

Once a solution is selected, it is documented with the decision process behind it and communicated to stakeholders. Delivery is then monitored, including quality assurance and quality control, and any request to change features or functionality goes through change control. Sign-off before handover closes the process.

The chosen solution becomes a scope. Scope should state what is in and what is out, with assumptions and exclusions recorded. That is the main defence against scope creep, and it creates the baseline that change requests are judged against. Poorly defined scope is a well-known route to delay, overspend and benefits that never arrive.

## Linear vs iterative: when scope is fixed

This is the distinction the exam wants. Both life cycles identify options in much the same way. The difference is when they commit.

| | Linear | Iterative |
|---|---|---|
| When scope is fixed | At approval of the scope definition | Later, and a stage at a time |
| How scope is held | Breakdown structures (PBS, WBS, OBS, CBS) | A prioritised product backlog, often as user stories |
| How scope changes | Only through formal change control | Each iteration draws down the highest-priority items |
| When it stops | At the agreed scope | When the next increment would cost more than it returns |

Deferring commitment suits situations where committing early would be a mistake: requirements that keep moving, technology still being developed, or a build process the team expects to learn from.

## MVP vs MMP: two different questions

The syllabus names both, and they are not the same thing.

- **A minimum viable product** is the smallest thing that works and lets the team learn. Its job is to test assumptions and reduce the risk of building the wrong thing.
- **A minimum marketable product** is the smallest thing the market or user base would actually accept. It is the point at which the output is good enough to release, and where benefits can start to be realised.

In an iterative life cycle, early iterations typically produce an MVP to test whether the solution is right at all. Later iterations build towards an MMP, and work continues beyond it while each increment still pays for itself.

## Worked scenario: weak answer vs strong answer

> *A hospital trust asks its project team to "build a larger outpatient waiting room" because patients complain about long waits. Explain how solutions development should be applied before the solution is agreed. (5 marks)*

**Weak answer:** "The team should look at different waiting room designs and pick the best one. They should check it meets the requirements and stays within budget. Then they should agree the scope and get started."

That answer accepts the solution it was handed and evaluates only within it. It names no process and no criteria. It might earn one mark.

**Strong answer:**

- The objective should be **reframed as the problem**, for example reducing how long patients wait, rather than as a bigger room.
- That framing allows a **wider set of options**, such as better appointment scheduling, online check-in or extra clinic sessions, alongside a larger room.
- **Doing nothing** and a **minimum viable solution** should be included as options, so the others have a baseline to be compared against.
- **Evaluation criteria should be agreed with stakeholders before options are identified**, covering cost, risk, deliverability and strategic fit.
- The selected option and the reasons for it should be **documented and communicated**, with in-scope and out-of-scope items recorded to control scope creep.

Five distinct points, each tied to a named technique a marker can credit.

## Common exam traps

- **"Solutions development starts once a solution has been chosen."** No. It starts with clarity about the problem, then generates and evaluates options.
- **"Wording the objective does not change the answer."** It does. Framing decides which options are considered at all.
- **"The minimum viable solution is the one to recommend."** No. It must always be considered, but it is a benchmark, not a default.
- **"Criteria are drawn up once the options are known."** No. Agree them with stakeholders first, so they cannot be shaped to suit a favourite.
- **"Iterative projects do not define scope."** They do, just later and in stages, through a prioritised backlog.
- **"MVP and MMP mean the same thing."** No. An MVP is for learning; an MMP is the smallest thing worth releasing to users.
`,
  practice: [
    {
      prompt: "Why should evaluation criteria be agreed before options are identified?",
      options: [
        { key: "A", label: "It saves time later" },
        { key: "B", label: "It stops criteria being shaped to favour a preferred option" },
        { key: "C", label: "It is required by the procurement strategy" },
        { key: "D", label: "It removes the need for a business case" },
      ],
      correctKey: "B",
    },
    {
      prompt: "Which option should always be considered in solutions development?",
      options: [
        { key: "A", label: "The most innovative option" },
        { key: "B", label: "The supplier's recommended option" },
        { key: "C", label: "Doing nothing" },
        { key: "D", label: "The option with the longest life" },
      ],
      correctKey: "C",
    },
    {
      prompt: "In an iterative life cycle, how is potential scope usually held?",
      options: [
        { key: "A", label: "In a fixed work breakdown structure" },
        { key: "B", label: "In a prioritised product backlog" },
        { key: "C", label: "In the risk register" },
        { key: "D", label: "In the benefits realisation plan" },
      ],
      correctKey: "B",
    },
  ],
  faqs: [
    {
      question: "What is LO17 in the APM PMQ?",
      answer:
        "LO17 is solutions development: determining the optimal solution to satisfy agreed requirements. It covers how to evaluate and prioritise requirements and options, and how the approach differs between linear and iterative life cycles, including MVP and MMP.",
    },
    {
      question: "What is framing in solutions development?",
      answer:
        "Framing is how the project objective is worded. Stating it as a solution, such as building a bridge, limits the options considered. Stating it as a problem, such as helping people cross a river, opens up a wider and usually better range of options.",
    },
    {
      question: "What is the difference between an MVP and an MMP?",
      answer:
        "A minimum viable product is the smallest thing that works, built to test assumptions and learn. A minimum marketable product is the smallest thing users or the market would actually accept, and is the point where benefits can begin to be realised.",
    },
    {
      question: "How is scope defined differently in linear and iterative life cycles?",
      answer:
        "In a linear life cycle scope is fixed at approval, held in breakdown structures and changed only through change control. In an iterative life cycle scope is fixed later and in stages, held in a prioritised backlog, and each iteration takes the highest-priority items.",
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
