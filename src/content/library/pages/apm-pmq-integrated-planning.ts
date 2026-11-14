import { scaffoldLibraryPage } from "../scaffold";

export const page = scaffoldLibraryPage({
  slug: "apm-pmq-integrated-planning",
  title: "APM PMQ integrated planning (LO19): what you need to know",
  metaTitle: "APM PMQ Integrated Planning (LO19) | Learn in Curve",
  metaDescription:
    "APM PMQ LO19 integrated planning: what goes in the project management plan, estimating methods, dependencies, contingency and the deployment baseline.",
  group: "syllabus",
  related: [
    "apm-pmq-scheduling-and-critical-path",
    "apm-pmq-budgeting-and-cost-control",
    "apm-pmq-resource-management",
    "apm-pmq-risk-management",
    "apm-pmq-business-case",
  ],
  status: "draft",
  updatedAt: "2026-11-14",
  answerFirst:
    "APM PMQ integrated planning (LO19) tests whether you understand that separate plans are not enough. Scope, schedule, cost, resources, risk and quality must be collected, aligned and kept consistent in one project management plan, so stakeholders can believe the business case is deliverable.",
  body: `This is the learning objective where everything else converges. Scope comes from solutions development (LO17), quality from LO18, the schedule from LO20, resources from LO21, the budget from LO22 and risk from LO23. Each has its own plan. Integrated planning is what turns them into one coherent statement rather than six documents that quietly contradict each other.

## What APM tests you on in LO19

The learning objective is about combining multiple plans and processes into an integrated project management plan (PMP). It splits into two learning outcomes:

- **19a:** the format of an effective integrated PMP and what it typically contains.
- **19b:** why producing an integrated PMP matters.

## What integration actually means

Three verbs carry the definition. **Collecting** gathers the separate plans. **Aligning** makes them consistent with each other. **Managing** keeps them consistent as things change.

The parts of a project are not independent. Move the schedule and you move cost and resource demand, whether you meant to or not. A schedule, a cost plan and a resource plan produced separately are three claims that have never been tested against each other. Integration is what tests them.

The purpose points straight back to the business case (LO4): the PMP exists to give stakeholders confidence that what the business case promised can actually be delivered.

## The PMP: contents and format

For 19a, hold the PMP as the container for every other plan the course teaches.

| Component | Where it is covered |
|---|---|
| Scope | LO16, LO17 |
| Schedule | LO20 |
| Cost | LO22 |
| Resources | LO21 |
| Risks and issues | LO23 |
| Success and completion criteria | LO16, LO18 |
| Benefits | LO9 |

Other plans sit inside it too, such as the procurement approach (LO5), the quality plan (LO18), the benefits realisation plan (LO9) and the approach to information management (LO6).

Format is not fixed. It depends on how complex the project is, what the organisation's own processes require, and what key stakeholders want to see. In most cases the PMP summarises the important information concisely enough for a steering committee or governance board to work from. It is not a filing cabinet of every plan in full. A document the board cannot get through fails its own purpose.

## The three things that make a first plan possible

Building the first integrated plan is hard and needs input from many people. Three techniques give stakeholders enough confidence to sign it off.

**1. Robust estimation.** Estimates inform option appraisal and the business case, feed the resource plan and schedule, set the budget, and are the starting point for risk analysis and contingency.

| Method | Approach | How it works |
|---|---|---|
| Parametric | Top-down | Uses historical rates against known variables, such as cost per square metre |
| Analogous | Top-down | Compares like for like with a similar past project |
| Analytical | Bottom-up | Breaks the work into parts and estimates each in detail |
| Delphi | Bottom-up | Reaches consensus among subject-matter experts |

Top-down methods suit early stages, when detail is not available. Bottom-up methods validate them once detail exists, and combining the two builds confidence. Three-point estimates (best case, worst case, most likely) give a range rather than a single number, and the assumptions behind them feed risk analysis. Estimating is continuous: revised estimates go through change control and update the plan.

**2. Dependency management.** A dependency means one activity cannot start or finish until something else happens.

| Type | Meaning | Can it be removed? |
|---|---|---|
| Logical (hard) | Work that cannot begin until something else is done | No |
| Preferential (soft) | Work that should not begin yet, usually a process or quality decision | Often, yes |
| Resource | Activities that must wait because they share a resource | Often, yes |

The more dependencies a project carries, the riskier it is. So the response is to strip out preferential and resource dependencies where you can, weighing the effect on cost, benefit and quality. Unmanaged dependencies lead to stoppages, replanning, higher cost and later benefits.

**3. Risk identification.** Each risk is described in three separate parts: the **cause**, the **event** that might happen, and its **impact** on objectives. Describing risks this way helps align differing stakeholder views and counters group bias. Each risk gets an owner and goes into the risk register for analysis under LO23.

## Contingency and the deployment baseline

Contingency is money and time set aside purely to respond to risk and uncertainty. It covers three things: risks you have identified, risks you have not, and the uncertainty in early estimates. That third category is the one candidates forget.

All this planning produces a deployment baseline, setting out baselines for scope, timeline, quality and budget. The baseline and the PMP are approved together at the decision gate before delivery begins. Approval is also the moment to reconfirm boundaries: what is in scope, what is out, and where the project touches other projects and business as usual. Good practice is an independent integrated baseline review, giving assurance that the baseline is achievable within its budget and schedule.

The life cycle changes how detailed that baseline is:

| | Linear | Iterative |
|---|---|---|
| Baseline | Detailed and fixed early | Still required, but much less defined |
| What drives | Scope and quality drive; time and cost follow | Resources committed over fixed timeboxes |
| How variation is handled | By exception, through change control | Scope and quality may flex as knowledge grows |

## Worked scenario: weak answer vs strong answer

> *A project board has received separate schedule, budget and resource plans for a new regional distribution centre. The figures do not agree with each other. Explain why an integrated project management plan should be produced before the board approves delivery. (5 marks)*

**Weak answer:** "An integrated plan is important because it puts all the plans in one place so the board can see everything. It means the project is well organised and everyone knows what is happening."

That answer treats integration as filing. It never says why consistency matters or what the plan enables. It might earn one mark.

**Strong answer:**

- Integration **aligns the separate plans** so the schedule, budget and resource figures are consistent rather than contradicting each other.
- An aligned plan gives the board **confidence that the business case is achievable**, which is the main purpose of the PMP.
- It provides a **single concise summary** that the board can use to make governance decisions.
- It sets a **deployment baseline** for scope, time, cost and quality against which progress is monitored.
- It gives **change control a baseline** to assess requests against, so the impact of any change can be traced across every component.

Five distinct reasons, each one something the PMP actually does.

## Common exam traps

- **"The PMP is a folder of all the project's plans."** No. Integration means aligning the plans so they are consistent with each other.
- **"The PMP should include every plan in full detail."** No. It summarises concisely enough for a governance board to use.
- **"Iterative projects do not need an integrated plan."** They do. The baseline is simply less defined and gains detail over time.
- **"The plan will change, so detailed planning is wasted."** No. Problems will arise regardless, and that is no reason to plan less carefully.
- **"Contingency only covers risks in the register."** No. It also covers unidentified risks and estimating uncertainty.
- **"Once the baseline is approved, planning is finished."** No. Estimates, dependencies and risks are reviewed and the plan is updated throughout.

## Test yourself: three quick questions

**1. Which estimating method reaches agreement among a group of subject-matter experts?**
A) Parametric  B) Analogous  C) Delphi  D) Analytical

**2. A communication must not be issued until peer review is complete. What type of dependency is this?**
A) Logical  B) Preferential  C) Resource  D) External

**3. What is the main purpose of an integrated project management plan?**
A) To replace the business case  B) To give stakeholders confidence that the business case is deliverable  C) To record lessons learned  D) To list every task in full detail

**Answers:** 1 C, 2 B, 3 B.

All three right? The written questions are where the PMQ is really won. [Try the free APM PMQ mock exam](/free-mock-exam/apm-pmq) to see how your written answers hold up.`,
  faqs: [
    {
      question: "What is LO19 in the APM PMQ?",
      answer:
        "LO19 is integrated planning: combining multiple plans and processes into one integrated project management plan. It covers the plan's typical format and contents, and why producing an integrated plan matters.",
    },
    {
      question: "What goes into an integrated project management plan?",
      answer:
        "Typically scope, schedule, cost, resources, risks and issues, success and completion criteria, and benefits, along with plans such as quality, procurement, benefits realisation and information management. It summarises them concisely for the governance board.",
    },
    {
      question: "What is the difference between top-down and bottom-up estimating?",
      answer:
        "Top-down estimating, such as parametric or analogous, estimates the whole using historical data and suits early stages. Bottom-up estimating, such as analytical or Delphi, estimates each part and adds them up. It is more detailed and often validates top-down figures.",
    },
    {
      question: "What is a deployment baseline?",
      answer:
        "It is the approved plan for executing the project, setting baselines for scope, timeline, quality and budget. It is approved with the project management plan at the gate before delivery and is what progress and change requests are measured against.",
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
