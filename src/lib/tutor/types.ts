export type TutorChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type TutorModelResult = {
  content: string;
  inputTokens: number;
  outputTokens: number;
};

/** One wrong practice-quiz answer, with enough detail for Sly to reference the exact question. */
export type MistakeDetail = {
  questionId: string;
  prompt: string;
  questionType: string;
  options: unknown;
  correctAnswer: unknown;
  submittedAnswer: unknown;
  explanation: string | null;
  attemptedAt: string;
};

/** A completed LO due for spaced-repetition resurfacing (5-completed-LOs spacing rule). */
export type SpacedReviewSignal = {
  sourceLoNumber: number;
  mistakes: MistakeDetail[];
};

/** Exam-deadline pace signal for `profiles.target_exam_date` — null when no deadline is set or nudging is throttled. */
export type ExamPaceSignal = {
  daysRemaining: number;
  losCompleted: number;
  losTotal: number;
  losRemaining: number;
  /** null when there isn't enough data yet (e.g. zero progress, no course-start signal) to judge pace. */
  onTrack: boolean | null;
  method: "even_pace" | "recent_pace" | "insufficient_data";
};

export type CallTutorModel = (
  systemPrompt: string,
  messages: TutorChatMessage[],
) => Promise<TutorModelResult>;
