import { scaffoldLibraryPage } from "../scaffold";

export const page = scaffoldLibraryPage({
  slug: "apm-pmq-requirements-management",
  title: "APM PMQ requirements management (LO16): what you need to know",
  metaTitle: "APM PMQ Requirements Management (LO16) | Learn in Curve",
  metaDescription:
    "APM PMQ LO16 requirements management: the four-step process, MoSCoW, success criteria vs benefits, and the five steps of configuration management.",
  group: "syllabus",
  related: [
    "apm-pmq-change-control",
    "apm-pmq-benefits-management",
    "apm-pmq-business-case",
    "apm-pmq-solutions-development",
    "apm-pmq-quality-management",
  ],
  status: "draft",
  updatedAt: "2026-11-14",
  answerFirst:
    "APM PMQ requirements management (LO16) tests two linked processes. Requirements management establishes scope by gathering, analysing, prioritising and baselining what stakeholders need. Configuration management then controls that scope, so every approved change lands in an accurate, traceable record.",
  body: `LO16 is where the abstract becomes concrete. The benefits and success criteria from the business case (LO4) and benefits management (LO9) turn into requirements the team can build against and test. Approved changes come through change control (LO24), and the finished deliverables are checked in quality (LO18) and handed over in transition (LO8). Hold one split in your head: requirements management establishes scope, configuration management controls it.

## What APM tests you on in LO16

The learning objective is about capturing and monitoring the requirements of a project. It splits into two learning outcomes:

- **16a:** how requirements management establishes scope, through gathering, analysing, justifying requirements and setting a baseline.
- **16b:** how configuration management controls scope, through planning, identification, control, status accounting and verification audit.

## Requirements and scope go together

Requirements management means capturing, analysing and prioritising what stakeholders want and need. Scope is the work to be done, and you cannot describe it without knowing what stakeholders are asking for. That is the direct answer to how requirements establish scope.

Early in the life cycle, high-level requirements show how the change aligns with strategy and help define success, feeding the business case. Later, detailed requirements emerge with subject matter experts, defining objectives and acceptance criteria. A linear project front-loads the rigour; an iterative one lets requirements evolve, sometimes written as user stories with just enough detail to estimate the effort.

## Success criteria are not benefits

This is the distinction the exam most wants you to make.

| | Success criteria | Benefits |
|---|---|---|
| What they are | Measures of whether stakeholder needs were satisfied, agreed at the start | Measurable improvements the change delivers, tied to strategy |
| When you know | At handover | Often only after the output is adopted into business as usual |
| Who is accountable | The project manager | The sponsor |

Because they are measured at different times by different people, they can diverge. A project can meet its success criteria and miss its benefits, or deliver benefits and still be seen as a failure. Success criteria can change, but only through formal approval.

Good requirements form a visible chain: benefits, then success criteria, then objectives, then requirements. Each requirement should be unambiguous and pass the SMART test: specific, measurable, achievable, relevant and time-based. A requirement needs a measure to be accepted or rejected at handover. Without one, it can only be argued about. Some requirements, such as working in an environmentally sustainable way, are genuinely hard to measure, and it is better to say so than pretend otherwise.

## The four-step requirements process

The syllabus wording is gather, analyse, justify and baseline. In practice:

| Step | What happens |
|---|---|
| 1. Identify stakeholders and gather | Find who gains from or is affected by the change, choose capture methods such as workshops or surveys, and collect their view |
| 2. Analyse, validate and align | Check each proposal for dependencies, risks and constraints, validate it, and confirm it fits project objectives and organisational aims |
| 3. Prioritise and baseline | Rank requirements using MoSCoW; once stakeholders agree, the baseline is set |
| 4. Review and reprioritise | Revisit the baseline regularly, usually at stage gates or iteration ends, running new requirements through the same checks |

Step 2 is where the marks are. A stakeholder proposing something does not mean it should be accepted. "Justifying" a requirement means proving it earns its place.

MoSCoW sorts requirements into **Must have**, **Should have**, **Could have** and **Won't have**, judged on value, benefit, cost, risk and size. Won't have is the useful one: it records a deliberate decision to exclude something this time, so it cannot quietly reappear later as an assumed inclusion. If it is raised again, it goes back through change control.

Rigour here pays off commercially. Clear requirements with measures reduce the risk of disputes about acceptance, which matters most under a commercial contract.

## Configuration management: the five steps

Configuration management is the technical and administrative work of creating, maintaining, controlling changes to and quality checking the project's technical configuration. It gives an accurate current version and clear traceability between versions. At its simplest it is document version control; on complex work it covers multi-discipline designs and asset control.

| Step | What it does |
|---|---|
| 1. Planning | A plan setting out the procedures, how they apply and who does them |
| 2. Identification | Break the project into configuration items, each with a unique reference, forming the first baseline |
| 3. Control | Make sure an approved change is reflected in the latest version, including linked items |
| 4. Status accounting | Report regularly on the configuration so everyone has current information and each item stays traceable |
| 5. Verification audit | Check the deliverable matches the recorded configuration, typically at phase end, on completion or at handover |

Step 3 is the one candidates confuse. Change control approves changes. Configuration control makes sure an approved change actually lands in the record, and that any items that depend on it are updated too.

## Which process answers which question

| | Requirements management | Configuration management |
|---|---|---|
| Job | Establishes scope | Controls scope |
| Question | What are we building, and why? | What exactly is it now, and how did it get that way? |
| Output | An agreed, prioritised requirements baseline | An accurate, traceable configuration |

## Worked scenario: weak answer vs strong answer

> *Midway through a project to build a new customer portal, a senior stakeholder demands a feature that was agreed as out of scope at the start. Explain how requirements and configuration management should handle this request. (5 marks)*

**Weak answer:** "The project manager should listen to the stakeholder and add the feature if possible, as keeping senior stakeholders happy is important. If it cannot be done, they should explain why and keep the stakeholder informed."

That answer treats the decision as a matter of keeping someone happy and names no process. It might earn one mark for keeping the stakeholder informed.

**Strong answer:**

- The feature was recorded as **Won't have** in the MoSCoW prioritisation, so this is a request to change the agreed baseline, not a missed requirement.
- The request should be **analysed for dependencies, risks and constraints**, validated and checked for alignment with project objectives.
- It should then be **prioritised against the existing requirements**, since adding it may push out something already agreed.
- Because it affects the approved baseline, it must go through **change control** for a formal decision.
- If approved, **configuration control** updates the latest configuration and any linked items, and status accounting tells the whole team.

Five points that follow the request from proposal to record, which is exactly the path a marker is looking for.

## Common exam traps

- **"Meeting the success criteria means the benefits arrived."** No. They are measured at different times and can diverge.
- **"A stakeholder's request should be captured as a requirement."** No. It must be analysed, validated and aligned first.
- **"Requirements are captured once at the start."** No. The baseline is reviewed regularly throughout the life cycle.
- **"Won't have means the requirement was forgotten."** No. It is a recorded decision to exclude it this time.
- **"Configuration management approves changes."** No. Change control approves; configuration control records the approved change.
- **"Configuration management is just document version control."** Only at its simplest. It scales up to complex designs and asset control.

## Test yourself: three quick questions

**1. Who is accountable for the project's success criteria being met at handover?**
A) The sponsor  B) The project manager  C) The end users  D) The governance board

**2. Which configuration management step checks that the deliverable matches the recorded configuration?**
A) Identification  B) Control  C) Status accounting  D) Verification audit

**3. A requirement reads "the system must be fast". What is it most clearly missing?**
A) A stakeholder  B) A measure  C) A MoSCoW category  D) A configuration item

**Answers:** 1 B, 2 D, 3 B.

Got all three? The written questions are where the PMQ is really won. [Try the free APM PMQ mock exam](/free-mock-exam/apm-pmq) to see how your written answers hold up.`,
  faqs: [
    {
      question: "What is LO16 in the APM PMQ?",
      answer:
        "LO16 is requirements management: capturing and monitoring a project's requirements. It covers how requirements management establishes scope and how configuration management then controls that scope as changes are made.",
    },
    {
      question: "What is the difference between requirements management and configuration management?",
      answer:
        "Requirements management establishes scope by working out what is being built and why. Configuration management controls scope by keeping an accurate, traceable record of exactly what the deliverable is now and how it got there.",
    },
    {
      question: "What is MoSCoW prioritisation?",
      answer:
        "A technique that sorts requirements into Must have, Should have, Could have and Won't have, based on value, benefit, cost, risk and size. Won't have records a deliberate decision to exclude something this time.",
    },
    {
      question: "What are the five steps of configuration management?",
      answer:
        "Planning, identification, control, status accounting and verification audit. Control ensures an approved change reaches the latest configuration; the approval itself comes from change control.",
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
