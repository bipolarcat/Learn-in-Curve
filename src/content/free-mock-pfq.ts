/**
 * Ring-fenced free PFQ Readiness Check bank (10 auto-marked items).
 *
 * Selected from the 246-item PFQ practice bank (all flagged mock_suitable:false).
 * Verified at build time as absent from the paid 60-question mock in
 * "PFQ in 2 days/pfq-questions.json". This mirrors the ring-fencing rule
 * already applied to the PMQ free mock. Do not add items from the paid mock set.
 *
 * Objective spread is weighted to the published PFQ mark distribution rather
 * than spread evenly: LO4 is 11 of 60 marks so it gets two items, LO3 is a
 * single mark so it gets none. LO10 is included because outcome 10.4 is the
 * outcome doubled in APM's published sample paper.
 *
 * Learn in Curve is not affiliated with, endorsed by, or accredited by APM.
 */

export type FreeMockPfqQuestion = {
  id: string;
  objective: number;
  outcome_code: string;
  objective_title: string;
  type: "mcq";
  prompt: string;
  options: string[];
  correct_answer: string;
  marks: number;
  explanation: string;
};

export const FREE_MOCK_PFQ_QUESTIONS: FreeMockPfqQuestion[] =
[
  {
    "id": "PFQP-4-5-4",
    "objective": 4,
    "outcome_code": "4.5",
    "objective_title": "Project management planning",
    "type": "mcq",
    "prompt": "Which pairing is correct?",
    "options": [
      "Sponsor owns both documents.",
      "Project manager owns both documents.",
      "Sponsor owns the business case; project manager produces the project management plan.",
      "Project manager owns the business case; sponsor produces the project management plan."
    ],
    "correct_answer": "Sponsor owns the business case; project manager produces the project management plan.",
    "marks": 1,
    "explanation": "Why versus how, applied to two documents. The sponsor owns the justification and the project manager owns the delivery plan."
  },
  {
    "id": "PFQP-4-4-5",
    "objective": 4,
    "outcome_code": "4.4",
    "objective_title": "Project management planning",
    "type": "mcq",
    "prompt": "When is the business case reviewed?",
    "options": [
      "Only if the project exceeds its budget.",
      "Once, at the start of the project.",
      "At each decision gate, to confirm the justification still holds.",
      "After handover, as part of the benefits review."
    ],
    "correct_answer": "At each decision gate, to confirm the justification still holds.",
    "marks": 1,
    "explanation": "It is a live document, tested at every gate. A project whose costs have doubled and benefits halved should fail its next gate, and the business case is how that becomes visible."
  },
  {
    "id": "PFQP-5-5-3",
    "objective": 5,
    "outcome_code": "5.5",
    "objective_title": "Project scope management",
    "type": "mcq",
    "prompt": "Which verb best characterises change control?",
    "options": [
      "Records.",
      "Estimates.",
      "Decides.",
      "Tests."
    ],
    "correct_answer": "Decides.",
    "marks": 1,
    "explanation": "Change control decides yes or no, with reasons. Configuration management records. Testing each option against its verb resolves most questions in this pair."
  },
  {
    "id": "PFQP-7-1-3",
    "objective": 7,
    "outcome_code": "7.1",
    "objective_title": "Project risk and issue management",
    "type": "mcq",
    "prompt": "Which statement about risk is correct?",
    "options": [
      "A risk is always a threat to the project.",
      "A risk exists only once it has been recorded in the register.",
      "A risk is a problem currently affecting delivery.",
      "A risk can have either a positive or a negative effect on objectives."
    ],
    "correct_answer": "A risk can have either a positive or a negative effect on objectives.",
    "marks": 1,
    "explanation": "Negative risks are threats and positive ones are opportunities. Treating risk as a synonym for bad news loses marks."
  },
  {
    "id": "PFQP-1-5-2",
    "objective": 1,
    "outcome_code": "1.5",
    "objective_title": "Project management and the operating environment",
    "type": "mcq",
    "prompt": "Which of the following describes programme management?",
    "options": [
      "Delivering a single set of objectives within agreed constraints.",
      "Managing a project that has grown beyond its original budget.",
      "Coordinating related projects and business as usual to deliver benefits not available from managing them individually.",
      "Prioritising investment across unrelated initiatives to match strategy."
    ],
    "correct_answer": "Coordinating related projects and business as usual to deliver benefits not available from managing them individually.",
    "marks": 1,
    "explanation": "Programme management coordinates related work. Prioritising across unrelated initiatives is portfolio management, and size has nothing to do with the distinction."
  },
  {
    "id": "PFQP-6-1-2",
    "objective": 6,
    "outcome_code": "6.1",
    "objective_title": "Resource, scheduling and optimisation",
    "type": "mcq",
    "prompt": "Which of the following does scheduling establish?",
    "options": [
      "The acceptance criteria for each deliverable.",
      "The current version of each configuration item.",
      "The order of activities, their durations and the resources they need.",
      "The justification for undertaking the project."
    ],
    "correct_answer": "The order of activities, their durations and the resources they need.",
    "marks": 1,
    "explanation": "Scheduling answers when and with what. Justification is the business case and criteria come from quality planning."
  },
  {
    "id": "PFQP-8-3-2",
    "objective": 8,
    "outcome_code": "8.3",
    "objective_title": "Quality in the context of a project",
    "type": "mcq",
    "prompt": "When does quality planning take place?",
    "options": [
      "Early, during definition, before the work is done.",
      "After each deliverable is produced.",
      "At the post project review.",
      "Continuously during deployment only."
    ],
    "correct_answer": "Early, during definition, before the work is done.",
    "marks": 1,
    "explanation": "Planning produces the reference that assurance and control both use later. Without it there is nothing to test against."
  },
  {
    "id": "PFQP-9-2-2",
    "objective": 9,
    "outcome_code": "9.2",
    "objective_title": "Communication in the context of a project",
    "type": "mcq",
    "prompt": "Which is an advantage of physical, written communication?",
    "options": [
      "It is the cheapest way to reach a dispersed team.",
      "It provides immediate feedback.",
      "It produces a durable and accurate record that everyone receives in identical form.",
      "It allows body language to be observed."
    ],
    "correct_answer": "It produces a durable and accurate record that everyone receives in identical form.",
    "marks": 1,
    "explanation": "The record and the identical form are its strengths. Body language and immediate feedback belong to face to face."
  },
  {
    "id": "PFQP-10-4-6",
    "objective": 10,
    "outcome_code": "10.4",
    "objective_title": "Leadership and teamwork within a project",
    "type": "mcq",
    "prompt": "Which Belbin role turns ideas into practical action?",
    "options": [
      "Monitor evaluator.",
      "Implementer.",
      "Plant.",
      "Resource investigator."
    ],
    "correct_answer": "Implementer.",
    "marks": 1,
    "explanation": "The plant generates the ideas, the implementer delivers them, and the resource investigator looks outside the team for contacts and opportunities."
  },
  {
    "id": "PFQP-2-3-3",
    "objective": 2,
    "outcome_code": "2.3",
    "objective_title": "Project life cycles",
    "type": "mcq",
    "prompt": "Why might a project adopt a hybrid life cycle?",
    "options": [
      "Because the project has run past its original completion date.",
      "Because benefits will not be realised until after handover.",
      "Because different parts of the work have different characteristics and suit different approaches.",
      "Because the sponsor has withdrawn support for iterative delivery."
    ],
    "correct_answer": "Because different parts of the work have different characteristics and suit different approaches.",
    "marks": 1,
    "explanation": "Physical construction rarely suits iterations while the software controlling it may. Hybrid lets each part of the work use the approach that fits it. Benefits after handover describes an extended life cycle."
  }
];
