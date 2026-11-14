import { scaffoldLibraryPage } from "../scaffold";

export const page = scaffoldLibraryPage({
  slug: "apm-pmq-resource-management",
  title: "APM PMQ resource management (LO21): what you need to know",
  metaTitle: "APM PMQ Resource Management (LO21) | Learn in Curve",
  metaDescription:
    "APM PMQ LO21 resource management: identifying resources, the RACI matrix, linear vs iterative allocation, and resource levelling vs smoothing explained.",
  group: "syllabus",
  related: [
    "apm-pmq-scheduling-and-critical-path",
    "apm-pmq-integrated-planning",
    "apm-pmq-breakdown-structures",
    "apm-pmq-budgeting-and-cost-control",
    "apm-pmq-governance",
  ],
  status: "draft",
  updatedAt: "2026-11-14",
  answerFirst:
    "APM PMQ resource management (LO21) tests whether you can identify, schedule and manage the internal and external resources a project needs. Expect questions on building a RACI matrix from the OBS and WBS, allocating resources in linear and iterative life cycles, and levelling versus smoothing.",
  body: `Resources are the constraint the schedule collides with. The critical path in LO20 deliberately ignores them, and this learning objective is what puts them back. The resourced schedule then feeds the budget (LO22) and the integrated plan (LO19). Get resource management wrong and you invite delay, weaker quality, higher cost and thinner benefits: all four things a project is judged on.

## What APM tests you on in LO21

The learning objective is about identifying and scheduling the internal and external resources a project needs. It splits into four learning outcomes:

- **21a:** how to work out what resources are needed and whether they are available.
- **21b:** how an organisational breakdown structure is used to build a responsibility assignment matrix (RACI).
- **21c:** how resources are categorised and allocated in linear and iterative schedules.
- **21d:** the difference between resource smoothing and resource levelling.

## Working out what you need

A resource is anything the project needs to complete its work: labour, bought-in services, materials and consumables, and assets such as equipment or vehicles. In practice the emphasis falls on people.

Identification starts once the high-level scope exists, because you cannot say who you need until you know what is being built. For people, four things are identified:

| Requirement | Example |
|---|---|
| Skills | Hard skills such as a coding language, soft skills such as communication |
| Seniority | Junior, mid-level or senior, matched to complexity |
| Domain expertise | Previous experience in a particular sector |
| Qualifications | Industry-specific professional qualifications |

These come from subject-matter experts, from what comparable projects used and learned, or from a skills analysis such as job role mapping. Capacity is then estimated: full-time or part-time, and how many hours or days a week.

Constraints shape the answer: availability, budget, seniority, hiring lead times and location. Together they settle whether a resource is found internally or brought in from outside. Working with HR helps line requirements up with established job roles.

Availability is usually managed above the project, through resource capacity planning at programme, portfolio or organisational level. When demand exceeds capacity, a trade-off is unavoidable. The right move is to set out what each initiative is worth, how it ranks and what it depends on, so stakeholders can decide on the facts. Request resources early, because late requests cost time.

## Building the RACI matrix

A responsibility assignment matrix (RAM) combines two breakdown structures:

| Structure | What it defines |
|---|---|
| Organisational breakdown structure (OBS) | The people, shown as the project hierarchy that comes from the chosen organisational structure |
| Work breakdown structure (WBS) | The work, broken into work packages at the lowest level you intend to manage |

Put work down one axis and people across the other, and the cells show who does what. RACI coding gives each cell a role:

| Letter | Role | Meaning |
|---|---|---|
| R | Responsible | Carries out the work |
| A | Accountable | Owns the work and approves it when complete |
| C | Consulted | Involved in decisions and supports the work |
| I | Informed | Kept up to date on progress |

The distinction that carries marks: R does the work, A owns it. They can be the same person, but accountability does not move when the work is delegated. **Only one person is accountable for each item**, because shared accountability means nobody is accountable.

The RAM allocates resources at the right time in line with the schedule, sets clear expectations, and links each person's work to the project's purpose. It is not fixed. Allocations shift as the project moves, and a change to the resource requirement is assessed for its impact on quality and cost, then raised as a formal change request against the baseline.

## Linear vs iterative allocation

The same skills can have a completely different demand curve depending on the life cycle.

| | Linear | Iterative |
|---|---|---|
| Commitment | The whole plan, fixed at approval | One timebox at a time |
| Skill demand | Design and planning specialists concentrated at the front | Those skills needed throughout |
| What flexes | Time and cost flex against fixed scope and quality | Time and cost fixed; scope and quality flex |
| Team shape | Specialists join and leave as their phase runs | A stable cross-functional team across iterations |
| Changing resource | A change request against the baseline | Adjust what goes into the next timebox |

In a linear schedule, the WBS defines work packages, each is given a start and end date, the RAM allocates people to them, and resource managers are asked for allocation as early as possible. In an iterative schedule, resources are committed for fixed periods called timeboxes. A specialist who can only be released for a few weeks is a real constraint on an iterative approach, not just an inconvenience.

Once allocated, resources are monitored through timesheets, task tracking, stakeholder feedback and resource histograms, and reported against plan for performance, availability and utilisation.

## Levelling vs smoothing

This is the distinction the exam tests hardest. Hold each technique by the question it answers.

| | Resource levelling | Resource smoothing |
|---|---|---|
| Question | With the resources we have, when can this finish? | What resource do we need to hit the date? |
| Held fixed | Resource constraints | Scope, quality and time |
| Allowed to move | The timeline | Cost |
| Use when | You cannot get more resource | The date cannot move |

Levelling uses critical path or critical chain to rework the schedule beneath a resource ceiling, so the end date moves.

Smoothing is not simply adding people. It also means getting more from existing capacity, or rearranging when work happens so peaks and troughs flatten. Both techniques happen before the budget is finalised, because costing works from the resourced schedule.

## Worked scenario: weak answer vs strong answer

> *A software upgrade must go live before a fixed regulatory deadline. The resource histogram shows the testing team is overloaded in month four and underused in months two and three. Explain how the project manager should respond. (5 marks)*

**Weak answer:** "The project manager should use resource levelling to sort out the overload. They could also ask for more testers and make sure everyone knows what they are doing."

That answer names the wrong technique for a fixed date and gives no reasoning. It might earn one mark.

**Strong answer:**

- Because the deadline is fixed, **resource smoothing** is the right technique, holding time while accepting an impact on cost.
- **Levelling would move the end date**, so it is not appropriate when the date cannot change.
- Some testing could be **rescheduled into months two and three** to flatten the peak without buying extra resource.
- If that is not enough, **additional or external testers** could be brought in, with the cost impact assessed.
- Any change to the resource requirement should be **raised through change control** and the RACI matrix updated so roles stay clear.

Five distinct points, each one tied to the fixed date in the question.

## Common exam traps

- **"Resource management just means managing people."** No. Resources include services, materials and assets, though people get the most attention.
- **"Responsible and accountable mean the same."** No. Responsible does the work; accountable owns and approves it.
- **"Shared work can have several accountable people."** No. One accountable person per work item.
- **"Levelling and smoothing are two names for the same thing."** No. Levelling moves the date; smoothing holds the date and accepts cost.
- **"Smoothing means hiring more people."** Not necessarily. Reshaping when work happens is also smoothing.
- **"Resources are optimised after the budget is set."** No. The budget is built on the resourced schedule.

## Test yourself: three quick questions

**1. Which two structures are combined to create a responsibility assignment matrix?**
A) PBS and CBS  B) OBS and WBS  C) WBS and CBS  D) PBS and OBS

**2. Resources are fixed and no more can be obtained. Which technique should be used?**
A) Resource smoothing  B) Resource levelling  C) Crashing  D) Fast tracking

**3. In a RACI matrix, what is the role of the person marked "A"?**
A) Carries out the work  B) Is kept informed of progress  C) Owns the work and approves it when complete  D) Gives advice on the work

**Answers:** 1 B, 2 B, 3 C.

Scored three? The written questions are where the PMQ is really won. [Try the free APM PMQ mock exam](/free-mock-exam/apm-pmq) to see how your written answers hold up.`,
  faqs: [
    {
      question: "What is LO21 in the APM PMQ?",
      answer:
        "LO21 is resource management: identifying and scheduling the internal and external resources a project needs. It covers working out requirements and availability, building a RACI matrix, allocating resources in linear and iterative life cycles, and levelling versus smoothing.",
    },
    {
      question: "What is the difference between resource levelling and resource smoothing?",
      answer:
        "Resource levelling holds resources fixed and lets the end date move to fit them. Resource smoothing holds scope, quality and time fixed and accepts an impact on cost, either by adding resource or by reshaping when work happens.",
    },
    {
      question: "How is a RACI matrix created?",
      answer:
        "By combining the organisational breakdown structure, which shows the people, with the work breakdown structure, which shows the work packages. Each cell is coded Responsible, Accountable, Consulted or Informed, with only one accountable person per item.",
    },
    {
      question: "How does resource allocation differ in iterative projects?",
      answer:
        "Iterative projects commit resources one timebox at a time, keep a stable cross-functional team, and need design and planning skills throughout rather than mainly at the start. Time and cost are fixed per timebox, while scope and quality can flex.",
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
