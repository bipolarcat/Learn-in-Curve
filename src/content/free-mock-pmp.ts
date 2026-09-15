/**
 * Ring-fenced free PMP Readiness Check bank (15 auto-marked items).
 *
 * Authored from scratch against PMI's published Examination Content Outline
 * effective 9 July 2026 (People 33%, Process 41%, Business Environment 26%).
 * Domain split here: People 5, Process 6, Business Environment 4.
 * Seven of fifteen items sit in an agile or hybrid context.
 *
 * No item is taken from, or derived from, any real PMP question, sample paper
 * or dump site. The ECO describes examinable scope, which is fact; PMI exam
 * items are protected expression. Do not add items sourced from either.
 *
 * Learn in Curve is not affiliated with, endorsed by, or accredited by PMI.
 * PMP is a registered mark of the Project Management Institute, Inc.
 */

export type PmpDomain = "People" | "Process" | "Business Environment";
export type PmpApproach = "predictive" | "agile" | "hybrid";

export type FreeMockPmpQuestion = {
  id: string;
  domain: PmpDomain;
  topic: string;
  approach: PmpApproach;
  type: "scenario_mcq";
  prompt: string;
  options: string[];
  correct_answer: string;
  marks: number;
  explanation: string;
};

export const FREE_MOCK_PMP_QUESTIONS: FreeMockPmpQuestion[] = [
  {
    id: "PMP-PE-1",
    domain: "People",
    topic: "Team working agreements",
    approach: "agile",
    type: "scenario_mcq",
    prompt:
      "A newly formed team misses its first two iteration commitments. The retrospective shows members are unclear who decides the technical approach when they disagree, so decisions stall for days. What should the project manager do first?",
    options: [
      "Ask the sponsor to grant one member decision-making authority.",
      "Appoint a technical lead with the final say on all technical disputes.",
      "Facilitate the team in agreeing a working agreement that includes how technical decisions get made.",
      "Reduce the next iteration's scope until the team's velocity stabilises.",
    ],
    correct_answer:
      "Facilitate the team in agreeing a working agreement that includes how technical decisions get made.",
    marks: 1,
    explanation:
      "A self-organising team sets its own working agreements, and the project manager serves that process rather than imposing an answer. Appointing a lead resolves this dispute but not the next one. Cutting scope treats the symptom.",
  },
  {
    id: "PMP-PE-2",
    domain: "People",
    topic: "Conflict management",
    approach: "predictive",
    type: "scenario_mcq",
    prompt:
      "Two senior specialists have started contradicting each other in front of the wider team, and the exchanges have become personal. Other members have stopped offering opinions in meetings. What is the most appropriate first action?",
    options: [
      "Raise it at the next team meeting so the group can resolve it openly.",
      "Meet each of them privately to understand their positions, then bring them together focused on the issue rather than each other.",
      "Reorganise the work so the two no longer need to interact.",
      "Report both to their functional managers for performance discussion.",
    ],
    correct_answer:
      "Meet each of them privately to understand their positions, then bring them together focused on the issue rather than each other.",
    marks: 1,
    explanation:
      "Conflict is addressed directly and early, and in private first. Handling personalised conflict in a public forum deepens it. Separating the two avoids the conflict rather than resolving it, and the damage to team psychological safety remains.",
  },
  {
    id: "PMP-PE-3",
    domain: "People",
    topic: "Distributed and hybrid teams",
    approach: "hybrid",
    type: "scenario_mcq",
    prompt:
      "A team spans four time zones. Decisions are made in a standing call scheduled in the sponsor's working hours, and two members who are always asleep for it have twice been surprised by decisions affecting their work. What should the project manager do?",
    options: [
      "Record the call and circulate the notes afterwards.",
      "Rotate the meeting time and move decision-making to a documented asynchronous channel.",
      "Ask the two members to adjust their working hours to attend.",
      "Delegate decisions affecting their work to the members who can attend.",
    ],
    correct_answer:
      "Rotate the meeting time and move decision-making to a documented asynchronous channel.",
    marks: 1,
    explanation:
      "Rotating shares the inconvenience rather than loading it onto the same two people, and asynchronous decision-making removes the dependence on attendance altogether. Recording is passive and still excludes them from the decision itself.",
  },
  {
    id: "PMP-PE-4",
    domain: "People",
    topic: "Situational leadership",
    approach: "predictive",
    type: "scenario_mcq",
    prompt:
      "A highly experienced engineer is assigned a compliance reporting task well outside their specialism. They are capable but visibly hesitant and have asked twice whether someone else should do it. What is the most appropriate leadership response?",
    options: [
      "Reassign the task to someone who has done it before.",
      "Provide clear direction on how the task is done while supporting their confidence.",
      "Delegate it fully, since they are a senior contributor who should not need supervision.",
      "Ask the sponsor to approve external support for the task.",
    ],
    correct_answer:
      "Provide clear direction on how the task is done while supporting their confidence.",
    marks: 1,
    explanation:
      "Leadership style is matched to the pairing of a person and a particular task, not to the person's seniority in general. An expert in one discipline can be a beginner in another and needs instruction plus support until capability and confidence catch up.",
  },
  {
    id: "PMP-PE-5",
    domain: "People",
    topic: "Stakeholder engagement",
    approach: "agile",
    type: "scenario_mcq",
    prompt:
      "The product owner has been an active participant for three months but has now missed two consecutive iteration reviews without explanation, and their written feedback has stopped. What should the project manager do first?",
    options: [
      "Continue delivering and record the lack of availability in the risk register.",
      "Contact them directly to understand what has changed, then update the stakeholder analysis.",
      "Escalate their non-attendance to the sponsor.",
      "Reduce the information sent to them, since they are not engaging with it.",
    ],
    correct_answer:
      "Contact them directly to understand what has changed, then update the stakeholder analysis.",
    marks: 1,
    explanation:
      "Stakeholder analysis is revisited throughout, because power, interest and attitude all move. A supportive stakeholder going quiet is a signal to investigate, not something to log and work around. Escalating first damages the relationship you still need.",
  },
  {
    id: "PMP-PR-1",
    domain: "Process",
    topic: "Hybrid integration",
    approach: "hybrid",
    type: "scenario_mcq",
    prompt:
      "Hardware is being built to a fixed baseline while the control software is delivered in two-week iterations. Integration has slipped twice because the software team commits only one iteration ahead and the hardware team plans months ahead. What is the best action?",
    options: [
      "Move the software team onto the predictive baseline so both tracks plan the same way.",
      "Move the hardware team to iterative delivery so both tracks commit at the same cadence.",
      "Agree fixed integration milestones that both tracks plan towards, and manage the interface between them as a tracked dependency.",
      "Hold hardware delivery until the software scope has stabilised.",
    ],
    correct_answer:
      "Agree fixed integration milestones that both tracks plan towards, and manage the interface between them as a tracked dependency.",
    marks: 1,
    explanation:
      "A hybrid approach exists because different parts of the work have different characteristics. The job is to manage the seam between them. Forcing either track onto the other's cadence throws away the reason the approach was chosen.",
  },
  {
    id: "PMP-PR-2",
    domain: "Process",
    topic: "Backlog versus change control",
    approach: "agile",
    type: "scenario_mcq",
    prompt:
      "Midway through an iteration, the product owner identifies a new feature they believe is more valuable than anything left in the backlog. The current iteration is already committed and underway. What should happen?",
    options: [
      "Add it to the current iteration, since value should always take priority.",
      "Add it to the product backlog so it can be prioritised into a future iteration.",
      "Raise it as a change request through the project's formal change control process.",
      "Reject it, because the release scope was agreed and baselined.",
    ],
    correct_answer:
      "Add it to the product backlog so it can be prioritised into a future iteration.",
    marks: 1,
    explanation:
      "New items entering a backlog are normal operation in iterative delivery and need no change request. Altering what is already committed to a running iteration is the disruption the timebox exists to prevent. Formal change control governs a baseline, not a backlog.",
  },
  {
    id: "PMP-PR-3",
    domain: "Process",
    topic: "Schedule compression and float",
    approach: "predictive",
    type: "scenario_mcq",
    prompt:
      "A project is reporting three weeks late. The project manager identifies the activity that caused the delay and finds it has four weeks of total float. What is the effect of crashing that activity?",
    options: [
      "The project finishes approximately three weeks earlier.",
      "The project end date does not move, because the activity was never driving it.",
      "The critical path shortens by three weeks.",
      "The activity becomes critical once compressed.",
    ],
    correct_answer:
      "The project end date does not move, because the activity was never driving it.",
    marks: 1,
    explanation:
      "Only compressing activities on the critical path shortens the project. Spending money to speed up an activity that has float simply increases its float. The real delay is on a different path and that is where the analysis should go.",
  },
  {
    id: "PMP-PR-4",
    domain: "Process",
    topic: "Earned value analysis",
    approach: "predictive",
    type: "scenario_mcq",
    prompt:
      "A project reports budget at completion of 400,000, planned value of 200,000, earned value of 160,000 and actual cost of 180,000. What is the project's status?",
    options: [
      "Ahead of schedule and under budget.",
      "Behind schedule and over budget.",
      "On schedule but over budget.",
      "Behind schedule but under budget.",
    ],
    correct_answer: "Behind schedule and over budget.",
    marks: 1,
    explanation:
      "Schedule variance is earned value minus planned value, 160,000 minus 200,000, so negative and behind. Cost variance is earned value minus actual cost, 160,000 minus 180,000, so negative and over. Less work done than planned, for more money than that work was worth.",
  },
  {
    id: "PMP-PR-5",
    domain: "Process",
    topic: "Risk response",
    approach: "predictive",
    type: "scenario_mcq",
    prompt:
      "A risk is assessed as low probability but severe impact. Every mitigation the team can identify costs more than the remaining contingency. What should the project manager do?",
    options: [
      "Remove the risk from the register, since no response is available.",
      "Accept the risk, document a contingent response, and put the funding question to the sponsor.",
      "Transfer the risk to the main supplier in the next progress meeting.",
      "Lower the impact rating so the risk falls below the escalation threshold.",
    ],
    correct_answer:
      "Accept the risk, document a contingent response, and put the funding question to the sponsor.",
    marks: 1,
    explanation:
      "Acceptance is a legitimate response, and it is not the same as doing nothing: a contingent plan is prepared and held ready. A risk that exceeds the project manager's authority to fund is escalated, not deleted and not quietly re-scored.",
  },
  {
    id: "PMP-PR-6",
    domain: "Process",
    topic: "Acceptance criteria and change",
    approach: "hybrid",
    type: "scenario_mcq",
    prompt:
      "A deliverable passes every agreed acceptance test. On first use, the business team reports it is slow to navigate and needs more clicks than the tool it replaced. Usability was never written into the acceptance criteria. What should the project manager do?",
    options: [
      "Reject the deliverable and return it to the team for rework.",
      "Accept the deliverable, then raise the usability improvement as a change request with its impact assessed.",
      "Ask the team to absorb the improvement within the current iteration and budget.",
      "Record it as a lesson learned and proceed to closure.",
    ],
    correct_answer:
      "Accept the deliverable, then raise the usability improvement as a change request with its impact assessed.",
    marks: 1,
    explanation:
      "The deliverable conforms to what was agreed, so it is accepted. A newly surfaced requirement is new scope and goes through change control with its cost and schedule impact visible. Absorbing it silently is how unpriced scope accumulates.",
  },
  {
    id: "PMP-BE-1",
    domain: "Business Environment",
    topic: "Regulatory compliance",
    approach: "predictive",
    type: "scenario_mcq",
    prompt:
      "Two months before handover, a regulation takes effect that applies directly to the project's output. The approved baseline does not account for it. What should the project manager do first?",
    options: [
      "Continue to the approved baseline and address compliance as a post-handover activity.",
      "Assess the impact on scope, schedule, cost and risk, then take it through change control.",
      "Ask the sponsor to seek an exemption from the regulator.",
      "Suspend all work until formal legal advice has been obtained.",
    ],
    correct_answer:
      "Assess the impact on scope, schedule, cost and risk, then take it through change control.",
    marks: 1,
    explanation:
      "Compliance is not optional and not deferrable to someone else after handover. The project manager's job is to make the impact visible and priced so the decision makers can act on facts. Stopping all work is disproportionate before the impact is even known.",
  },
  {
    id: "PMP-BE-2",
    domain: "Business Environment",
    topic: "Benefits realisation",
    approach: "agile",
    type: "scenario_mcq",
    prompt:
      "A product was delivered incrementally and every increment was accepted on time. Six months after the final release, the expected efficiency benefits have not appeared, and usage data shows most teams still use the old process. Who is accountable, and what is the appropriate response?",
    options: [
      "The project manager, who should reopen the project to fix adoption.",
      "The sponsor, who should either increase adoption effort or re-baseline the benefit target.",
      "The project management office, which should revise the business case.",
      "Nobody, because the project met all of its agreed success criteria.",
    ],
    correct_answer:
      "The sponsor, who should either increase adoption effort or re-baseline the benefit target.",
    marks: 1,
    explanation:
      "Outputs do not create benefits on their own: adoption produces outcomes and outcomes produce benefits. The sponsor is accountable for benefits during and after delivery, and the two honest responses are to drive adoption or to re-baseline the target.",
  },
  {
    id: "PMP-BE-3",
    domain: "Business Environment",
    topic: "Business case viability",
    approach: "hybrid",
    type: "scenario_mcq",
    prompt:
      "A project is 70 percent complete, on schedule and on budget. A competitor launches a product that halves the market advantage the project was expected to deliver. What should the project manager do?",
    options: [
      "Continue to the approved baseline, since delivery performance is on track.",
      "Surface it to the sponsor and governance so the business case can be reassessed, accepting that the outcome may be to pause, replan or terminate.",
      "Reduce scope to lower the remaining cost and protect the return.",
      "Accelerate delivery to reach the market as quickly as possible.",
    ],
    correct_answer:
      "Surface it to the sponsor and governance so the business case can be reassessed, accepting that the outcome may be to pause, replan or terminate.",
    marks: 1,
    explanation:
      "A project can be delivered flawlessly and still stop being worth doing, because the business case depends on conditions outside the project. Continuing on the basis that delivery is on track is how organisations fall into the sunk cost trap.",
  },
  {
    id: "PMP-BE-4",
    domain: "Business Environment",
    topic: "Measuring value",
    approach: "agile",
    type: "scenario_mcq",
    prompt:
      "An organisation has moved from judging projects on time and budget performance to judging them on value delivered. Which is the strongest evidence that a project is delivering value?",
    options: [
      "The schedule performance index has stayed above 1.0 all year.",
      "Every planned deliverable has been formally accepted.",
      "Benefit owners are reporting measured improvement against the pre-project baseline.",
      "The project is forecast to close under its approved budget.",
    ],
    correct_answer:
      "Benefit owners are reporting measured improvement against the pre-project baseline.",
    marks: 1,
    explanation:
      "Schedule and cost indices measure conformance to plan, and acceptance measures that outputs were produced. Neither shows that anything improved. Measured change against a baseline, reported by the people who own the benefit, is what value looks like.",
  },
];
