/**
 * PFQ syllabus coverage map — 59 learning outcomes + objective weights.
 * Source: APM PFQ Handbook APM-QS-PFQ-8 V5 + PFQ_DAY_PLAN.md.
 * Short titles are study labels for the coverage UI (not APM copyright text).
 */

export type PfqObjectiveMeta = {
  objective: number;
  title: string;
  day: 1 | 2;
  marks: number;
  outcomes: readonly string[];
};

/** Exact set the bank and mock generator must cover. */
export const PFQ_EXPECTED_OUTCOMES = [
  "1.1",
  "1.2",
  "1.3",
  "1.4",
  "1.5",
  "1.6",
  "2.1",
  "2.2",
  "2.3",
  "2.4",
  "3.1",
  "4.1",
  "4.2",
  "4.3",
  "4.4",
  "4.5",
  "4.6",
  "4.7",
  "4.8",
  "4.9",
  "4.10",
  "4.11",
  "5.1",
  "5.2",
  "5.3",
  "5.4",
  "5.5",
  "5.6",
  "5.7",
  "5.8",
  "6.1",
  "6.2",
  "6.3",
  "6.4",
  "6.5",
  "6.6",
  "7.1",
  "7.2",
  "7.3",
  "7.4",
  "7.5",
  "7.6",
  "7.7",
  "7.8",
  "8.1",
  "8.2",
  "8.3",
  "8.4",
  "8.5",
  "8.6",
  "9.1",
  "9.2",
  "9.3",
  "9.4",
  "9.5",
  "10.1",
  "10.2",
  "10.3",
  "10.4",
] as const;

export type PfqOutcomeCode = (typeof PFQ_EXPECTED_OUTCOMES)[number];

export const PFQ_OUTCOME_TITLES: Record<PfqOutcomeCode, string> = {
  "1.1": "What is a project",
  "1.2": "Project vs business as usual",
  "1.3": "Project management defined",
  "1.4": "Purpose of project management",
  "1.5": "Portfolio management",
  "1.6": "PESTLE / operating environment",
  "2.1": "Linear life cycle phases",
  "2.2": "Iterative life cycle",
  "2.3": "Hybrid life cycle",
  "2.4": "Extended life cycle",
  "3.1": "Roles and responsibilities",
  "4.1": "Deployment baseline",
  "4.2": "Baseline in linear vs iterative",
  "4.3": "Sponsor and the plan",
  "4.4": "Business case contents",
  "4.5": "PM role in the business case",
  "4.6": "Stakeholder analysis",
  "4.7": "Benefits management",
  "4.8": "Estimating methods",
  "4.9": "Estimating funnel",
  "4.10": "Success criteria",
  "4.11": "Progress reporting",
  "5.1": "Scope management defined",
  "5.2": "Scope in iterative projects",
  "5.3": "PBS vs WBS",
  "5.4": "Responsibility assignment matrix",
  "5.5": "Change control defined",
  "5.6": "Change control and configuration",
  "5.7": "Change control stages",
  "5.8": "Configuration management activities",
  "6.1": "Purpose of scheduling",
  "6.2": "Critical path analysis",
  "6.3": "Milestones",
  "6.4": "Time boxing",
  "6.5": "Resource optimisation",
  "6.6": "Procurement strategy",
  "7.1": "Risk defined",
  "7.2": "Purpose of risk management",
  "7.3": "Risk management stages",
  "7.4": "Risk register",
  "7.5": "Issue defined",
  "7.6": "Purpose of issue management",
  "7.7": "Issue vs risk",
  "7.8": "Issue resolution stages",
  "8.1": "Quality defined",
  "8.2": "Purpose of quality management",
  "8.3": "Quality planning",
  "8.4": "Quality control",
  "8.5": "Quality assurance",
  "8.6": "Reviews and audits",
  "9.1": "Communication defined",
  "9.2": "Face-to-face advantages",
  "9.3": "Virtual disadvantages",
  "9.4": "Communication plan contents",
  "9.5": "Benefit of a communication plan",
  "10.1": "Leadership defined",
  "10.2": "Improving team performance",
  "10.3": "Leading a project team",
  "10.4": "Team development models",
};

export const PFQ_OBJECTIVES: readonly PfqObjectiveMeta[] = [
  {
    objective: 1,
    title: "Project management and the operating environment",
    day: 1,
    marks: 6,
    outcomes: ["1.1", "1.2", "1.3", "1.4", "1.5", "1.6"],
  },
  {
    objective: 2,
    title: "Project life cycles",
    day: 1,
    marks: 4,
    outcomes: ["2.1", "2.2", "2.3", "2.4"],
  },
  {
    objective: 3,
    title: "Roles and responsibilities",
    day: 1,
    marks: 1,
    outcomes: ["3.1"],
  },
  {
    objective: 4,
    title: "Project management planning",
    day: 1,
    marks: 11,
    outcomes: [
      "4.1",
      "4.2",
      "4.3",
      "4.4",
      "4.5",
      "4.6",
      "4.7",
      "4.8",
      "4.9",
      "4.10",
      "4.11",
    ],
  },
  {
    objective: 5,
    title: "Project scope management",
    day: 1,
    marks: 8,
    outcomes: ["5.1", "5.2", "5.3", "5.4", "5.5", "5.6", "5.7", "5.8"],
  },
  {
    objective: 6,
    title: "Resource, scheduling and optimisation",
    day: 2,
    marks: 6,
    outcomes: ["6.1", "6.2", "6.3", "6.4", "6.5", "6.6"],
  },
  {
    objective: 7,
    title: "Project risk and issue management",
    day: 2,
    marks: 8,
    outcomes: ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8"],
  },
  {
    objective: 8,
    title: "Quality",
    day: 2,
    marks: 6,
    outcomes: ["8.1", "8.2", "8.3", "8.4", "8.5", "8.6"],
  },
  {
    objective: 9,
    title: "Communication",
    day: 2,
    marks: 5,
    outcomes: ["9.1", "9.2", "9.3", "9.4", "9.5"],
  },
  {
    objective: 10,
    title: "Leadership and teamwork",
    day: 2,
    marks: 4,
    outcomes: ["10.1", "10.2", "10.3", "10.4"],
  },
] as const;

export const PFQ_PASS_MARK = 36;
export const PFQ_QUESTION_COUNT = 60;
export const PFQ_DURATION_SECONDS = 60 * 60;
export const PFQ_OUTCOME_COUNT = PFQ_EXPECTED_OUTCOMES.length;

export function outcomeTitle(code: string): string {
  return (
    PFQ_OUTCOME_TITLES[code as PfqOutcomeCode] ?? `Learning outcome ${code}`
  );
}

export function dayForOutcome(code: string): 1 | 2 {
  const n = Number(code.split(".")[0]);
  return n <= 5 ? 1 : 2;
}
