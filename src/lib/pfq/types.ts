export type PfqQuestionType = "single" | "multi_select";

export type PfqQuestionRow = {
  id: string;
  learning_outcome: string;
  objective: number;
  day: number;
  verb: string;
  type: PfqQuestionType;
  traps: string[];
  stem: string;
  items: string[] | null;
  options: Record<string, string>;
  answer: string;
  explanation: string;
  active: boolean;
  /** May be drawn into the timed 60-question mock. */
  mock_suitable: boolean;
  /** Ordinal within a learning outcome (1 = mock-eligible; 2+ practice-only). */
  variant: number;
};

/** Coverage signal source. Lesson checkpoints land here when content ships. */
export type PfqCoverageSource = "practice" | "mock" | "lesson";

/**
 * Per-outcome readiness for the coverage map.
 * Resolve rule (product decision 2026-08-13): **most recent answer wins** —
 * the latest practice submit or mock submit for an outcome overwrites prior
 * state. "Best ever" was rejected so the headline "you can currently answer"
 * stays honest after a later miss.
 */
export type PfqCoverageSignal = {
  learning_outcome: string;
  correct: boolean;
  source: PfqCoverageSource;
  question_id: string | null;
  updated_at: string;
};

/** Served to the client during an in-progress attempt — no answer key. */
export type PfqPublicQuestion = {
  id: string;
  learning_outcome: string;
  objective: number;
  day: number;
  verb: string;
  type: PfqQuestionType;
  traps: string[];
  stem: string;
  items: string[] | null;
  /** Options already shuffled for this attempt (keys a–d in display order). */
  options: Record<string, string>;
  option_order: string[];
};

export type PfqAnswerState = {
  question_id: string;
  selected: string | null;
  flagged: boolean;
  option_order: string[];
};

export type PfqAttemptRow = {
  id: string;
  user_id: string | null;
  guest_token: string | null;
  started_at: string;
  submitted_at: string | null;
  score: number | null;
  question_ids: string[];
};

export type PfqReviewQuestion = PfqPublicQuestion & {
  answer: string;
  explanation: string;
  selected: string | null;
  correct: boolean | null;
  flagged: boolean;
};

export type PfqOutcomeChipState = "correct" | "incorrect" | "unattempted";

export type PfqCoverageOutcome = {
  code: string;
  title: string;
  objective: number;
  day: 1 | 2;
  state: PfqOutcomeChipState;
  /** Marks at risk if incorrect/unattempted (1, or more if doubled). */
  marks: number;
};

export type PfqObjectiveResult = {
  objective: number;
  title: string;
  day: 1 | 2;
  available: number;
  scored: number;
};

export type PfqResultsPayload = {
  attemptId: string;
  score: number;
  maxScore: number;
  passed: boolean;
  outcomesAnsweredCorrectly: number;
  outcomeCount: number;
  coverage: PfqCoverageOutcome[];
  objectives: PfqObjectiveResult[];
  gaps: Array<{
    code: string;
    title: string;
    marks: number;
    day: 1 | 2;
    explanation: string;
    questionId: string;
  }>;
  reviews: PfqReviewQuestion[];
};
