/**
 * Ring-fenced free mock bank (15 auto-marked items).
 * Sourced from practice quiz inventory with mock_suitable=false and prompts
 * not present in paid Exam 1 (mock.json). Fixed order — deterministic retakes.
 * Do not add items that appear in mock Exams 1–4.
 */

export type FreeMockQuestionType = "mcq" | "scenario_mcq" | "dropdown";

export type FreeMockMcq = {
  id: string;
  lo_number: number;
  lo_code: string;
  lo_title: string;
  type: "mcq" | "scenario_mcq";
  prompt: string;
  options: string[];
  correct_answer: string;
  marks: number;
  explanation: string | null;
};

export type FreeMockDropdown = {
  id: string;
  lo_number: number;
  lo_code: string;
  lo_title: string;
  type: "dropdown";
  prompt: string;
  dropdowns: Record<string, string[]>;
  correct_answers: Record<string, string>;
  marks: number;
  explanation: string | null;
};

export type FreeMockQuestion = FreeMockMcq | FreeMockDropdown;

export const FREE_MOCK_QUESTIONS: FreeMockQuestion[] = [
  {
    "id": "LO1-q4",
    "lo_number": 1,
    "lo_code": "LO1",
    "lo_title": "Life cycles",
    "type": "dropdown",
    "prompt": "You are PM on a large IT development project with high uncertainty about final deliverables. __(a)__ life cycle would be most appropriate. Use of this life cycle will help to __(b)__.",
    "marks": 2,
    "explanation": "Iterative suits high uncertainty. Repeated cycles of planning, delivery and review help the team clarify priorities as scope evolves.",
    "dropdowns": {
      "a": [
        "A linear",
        "A hybrid",
        "An iterative",
        "An evolutionary"
      ],
      "b": [
        "clearly identify priorities",
        "avoid changes to deliverables",
        "strengthen the Business Case",
        "decide if the project is viable"
      ]
    },
    "correct_answers": {
      "a": "An iterative",
      "b": "clearly identify priorities"
    }
  },
  {
    "id": "LO2-q27",
    "lo_number": 2,
    "lo_code": "LO2",
    "lo_title": "Governance Arrangements",
    "type": "mcq",
    "prompt": "A colleague claims iterative life cycles have no financial controls at all. What's the correct position?",
    "marks": 1,
    "explanation": "Iterative life cycles still have financial control — it's exercised through smaller, more frequent releases rather than large gate-based drawdowns.",
    "options": [
      "Iterative life cycles use smaller, more frequent funding releases — control is present, just at a different cadence",
      "Iterative life cycles never require any budget approval",
      "Iterative life cycles are always cheaper than linear ones",
      "Iterative life cycles remove the need for a business case"
    ],
    "correct_answer": "A"
  },
  {
    "id": "LO3-q3",
    "lo_number": 3,
    "lo_code": "LO3",
    "lo_title": "Sustainability",
    "type": "dropdown",
    "prompt": "It is best practice to report on sustainability considerations __(a)__. Sustainability measurements include ESG data and __(b)__.",
    "marks": 2,
    "explanation": "Sustainability reporting runs throughout the life cycle. KPIs are the named sustainability metric alongside ESG data, operational carbon and embodied carbon measures.",
    "dropdowns": {
      "a": [
        "throughout the project",
        "at the start of the project",
        "at the end of the project",
        "when requested"
      ],
      "b": [
        "Key Performance Indicators",
        "budget spend profile",
        "quality indicators",
        "earned value"
      ]
    },
    "correct_answers": {
      "a": "throughout the project",
      "b": "Key Performance Indicators"
    }
  },
  {
    "id": "LO4-q2",
    "lo_number": 4,
    "lo_code": "LO4",
    "lo_title": "Business Case",
    "type": "dropdown",
    "prompt": "Complete the sentences. After several years of delivery and significant changes in leadership and technology, you are confident the business case is still valid because __(a)__. One reason the project could close early would be if the __(b)__.",
    "marks": 2,
    "explanation": "Validity comes from periodic review at decision gates, not from the original approval or who is in post. Projects can be stopped when benefits become unviable.",
    "dropdowns": {
      "a": [
        "it has been reviewed at decision gates",
        "the original sponsor approved it",
        "the project manager has not changed",
        "the contract is still active"
      ],
      "b": [
        "governance structure changes",
        "project manager changes",
        "benefits are no longer viable",
        "risk appetite increases"
      ]
    },
    "correct_answers": {
      "a": "it has been reviewed at decision gates",
      "b": "benefits are no longer viable"
    }
  },
  {
    "id": "LO5-q3",
    "lo_number": 5,
    "lo_code": "LO5",
    "lo_title": "Procurement",
    "type": "scenario_mcq",
    "prompt": "A key reason for entering into a joint venture with a supplier is:",
    "marks": 1,
    "explanation": "JVs are about long-term collaboration and shared benefit, not cost transfer, IP protection or transactional incentives.",
    "options": [
      "To pass on the development costs to the supplier in return for them receiving a fee.",
      "To protect the intellectual property of your organisation.",
      "To develop a longer-term collaborative relationship and deliver mutual benefits.",
      "To use penalties and bonuses to motivate supplier performance."
    ],
    "correct_answer": "C"
  },
  {
    "id": "LO6-q1",
    "lo_number": 6,
    "lo_code": "LO6",
    "lo_title": "Reviews",
    "type": "mcq",
    "prompt": "Why is it important to conduct reviews of your project throughout the life cycle?",
    "marks": 1,
    "explanation": "Reviews exist to evaluate performance and inform decisions. Informing stakeholders, reporting to the team and setting RAG are by-products, not the primary purpose.",
    "options": [
      "To ensure stakeholders are continuously informed.",
      "To evaluate project performance and inform decision-making.",
      "To report on progress to the project team.",
      "To determine the RAG rating for the project."
    ],
    "correct_answer": "B"
  },
  {
    "id": "LO7-q4",
    "lo_number": 7,
    "lo_code": "LO7",
    "lo_title": "Assurance",
    "type": "dropdown",
    "prompt": "Complete the sentences by selecting the most appropriate option for each gap. An effective assurance plan must be __(a)__ to the work, and it must show a clear __(b)__ for reporting outcomes and resolving issues.",
    "marks": 2,
    "explanation": "Proportionate is one of the five plan criteria. A clear governance route is the fifth criterion: findings must have a defined path to a decision-maker.",
    "dropdowns": {
      "a": [
        "proportionate",
        "exhaustive",
        "delegated",
        "informal"
      ],
      "b": [
        "governance route",
        "budget line",
        "supplier list",
        "project schedule"
      ]
    },
    "correct_answers": {
      "a": "proportionate",
      "b": "governance route"
    }
  },
  {
    "id": "LO8-q4",
    "lo_number": 8,
    "lo_code": "LO8",
    "lo_title": "Transition Management",
    "type": "dropdown",
    "prompt": "You are PM on a new intranet. You should start transition planning __(a)__. The relationship between the project team and BAU adoption owners needs careful management; __(b)__ activities help ensure end users buy into the change.",
    "marks": 2,
    "explanation": "Transition planning starts at project beginning. Business readiness activities prepare users to adopt.",
    "dropdowns": {
      "a": [
        "at the beginning of a project",
        "when all deliverables are decided",
        "at the end of the definition phase",
        "when stakeholders are satisfied"
      ],
      "b": [
        "business readiness",
        "team building",
        "risk identification",
        "budget review"
      ]
    },
    "correct_answers": {
      "a": "at the beginning of a project",
      "b": "business readiness"
    }
  },
  {
    "id": "LO9-q3",
    "lo_number": 9,
    "lo_code": "LO9",
    "lo_title": "Benefits Management",
    "type": "dropdown",
    "prompt": "Complete the sentences. To identify the benefits a project will deliver, you gather information from __(a)__. Once benefits are identified, the next step in the process is to __(b)__ the benefits.",
    "marks": 2,
    "explanation": "Benefits originate in the business case with sponsor input. Definition follows identification in the five-step sequence.",
    "dropdowns": {
      "a": [
        "the project sponsor and business case",
        "the project schedule",
        "the risk register",
        "the supplier contract"
      ],
      "b": [
        "define",
        "realise",
        "track",
        "close down"
      ]
    },
    "correct_answers": {
      "a": "the project sponsor and business case",
      "b": "define"
    }
  },
  {
    "id": "LO10-q25",
    "lo_number": 10,
    "lo_code": "LO10",
    "lo_title": "Stakeholder Engagement and Communications Management",
    "type": "dropdown",
    "prompt": "A colleague claims tailoring messages is dishonest. Correcting this: tailoring is about level of __(a)__, channel and __(b)__ — not saying different things to different people.",
    "marks": 2,
    "explanation": "Tailoring adjusts detail, channel and timing — the underlying message content stays honest and consistent.",
    "dropdowns": {
      "a": [
        "detail",
        "truth",
        "budget",
        "risk"
      ],
      "b": [
        "timing",
        "content",
        "ownership",
        "governance"
      ]
    },
    "correct_answers": {
      "a": "detail",
      "b": "timing"
    }
  },
  {
    "id": "LO11-q4",
    "lo_number": 11,
    "lo_code": "LO11",
    "lo_title": "Conflict Resolution",
    "type": "dropdown",
    "prompt": "In the Thomas Kilmann model, low assertiveness and low cooperativeness is known as __(a)__. High assertiveness and low cooperativeness is known as __(b)__.",
    "marks": 2,
    "explanation": "Avoid is low on both axes; Compete is high assertiveness paired with low cooperativeness.",
    "dropdowns": {
      "a": [
        "Avoidance",
        "Competition",
        "Collaboration",
        "Accommodation"
      ],
      "b": [
        "Compromise",
        "Accommodation",
        "Collaboration",
        "Competition"
      ]
    },
    "correct_answers": {
      "a": "Avoidance",
      "b": "Competition"
    }
  },
  {
    "id": "LO12-q3",
    "lo_number": 12,
    "lo_code": "LO12",
    "lo_title": "Leadership",
    "type": "dropdown",
    "prompt": "Your team is in handover and closure phase, with most members working on their own development during a quiet period of uncertainty. The most appropriate leadership approach is __(a)__. You also decide to develop your emotional intelligence, knowing that as well as being empathetic it is important to __(b)__.",
    "marks": 2,
    "explanation": "Quiet phases with team development needs suit a coaching/mentoring/supportive style. EQ pairs empathy with self-regulation, not hiding or sharing every emotion.",
    "dropdowns": {
      "a": [
        "mentoring and support",
        "close supervision",
        "training according to project needs",
        "clear goals and objectives"
      ],
      "b": [
        "regulate your emotions",
        "trust your emotions",
        "share your emotions",
        "hide your emotions"
      ]
    },
    "correct_answers": {
      "a": "mentoring and support",
      "b": "regulate your emotions"
    }
  },
  {
    "id": "LO13-q3",
    "lo_number": 13,
    "lo_code": "LO13",
    "lo_title": "Team Management",
    "type": "dropdown",
    "prompt": "For a project team to be as effective as possible, it is important that the team has __(a)__. If a team has __(b)__, they will feel more confident to be innovative and creative when developing solutions.",
    "marks": 2,
    "explanation": "Shared accountability is a characteristic of effective teams. Open and honest communication creates psychological safety for innovation.",
    "dropdowns": {
      "a": [
        "a shared sense of accountability",
        "regular face-to-face meetings",
        "close oversight by their manager",
        "responsibility for their own time"
      ],
      "b": [
        "open and honest communication",
        "a hierarchical structure",
        "clear rewards",
        "a focus on their own roles"
      ]
    },
    "correct_answers": {
      "a": "a shared sense of accountability",
      "b": "open and honest communication"
    }
  },
  {
    "id": "LO14-q3",
    "lo_number": 14,
    "lo_code": "LO14",
    "lo_title": "Diversity and Inclusion",
    "type": "dropdown",
    "prompt": "Complete the sentences. Embracing diverse thinking in teams is crucial for generating innovative solutions because it encourages __(a)__. To support a positive working environment, project team members should __(b)__.",
    "marks": 2,
    "explanation": "Open communication is what surfaces diverse thinking; welcoming difference is the behavioural test the syllabus uses for a positive environment.",
    "dropdowns": {
      "a": [
        "open communication",
        "conflict resolution",
        "risk management",
        "technical expertise"
      ],
      "b": [
        "understand and welcome difference",
        "avoid disagreeing with each other",
        "avoid escalating concerns",
        "often meet in person"
      ]
    },
    "correct_answers": {
      "a": "open communication",
      "b": "understand and welcome difference"
    }
  },
  {
    "id": "LO15-q32",
    "lo_number": 15,
    "lo_code": "LO15",
    "lo_title": "Ethics, Compliance and Professionalism",
    "type": "mcq",
    "prompt": "You are a senior project manager working on a project to improve business operations. Within your project team, a number of junior team members have missed meetings with key stakeholders, and completed project documents to a poor standard. Which three of these actions could help them to improve their professionalism, standards, and conduct as project professionals?** (1. Read the company’s Code of Professional Conduct. 2. Speak with friends in other professions to learn how they act day-to-day. 3. Complete regular continual professional development (CPD). 4. Get a mentor from outside the company to help identify career opportunities. 5. Identify root cause of falling standards. 6. Ensure meetings are face-to-face to build rapport with key stakeholders.)",
    "marks": 1,
    "explanation": "Correct answer: 1, 3, 5.",
    "options": [
      "1, 2, 5",
      "1, 3, 4",
      "2, 4, 6",
      "1, 3, 5"
    ],
    "correct_answer": "D"
  }
];

export const FREE_MOCK_MAX_SCORE = FREE_MOCK_QUESTIONS.length;
