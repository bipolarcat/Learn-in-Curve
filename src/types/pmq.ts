export type KeyDefinition = {
  term: string;
  plain_english: string;
  apm_definition: string;
};

export type CoreContentBlock = {
  outcome_code: string;
  outcome_title: string;
  body_markdown: string;
  diagrams?: {
    id: string;
    file: string;
    caption: string;
    placement: string;
    heading: string;
    figure_number?: string;
    alt?: string;
  }[];
};

export type WorkedExample = {
  scenario: string;
  try_it_yourself_prompt: string;
  model_answer: string;
};

export type Misconception = {
  wrong: string;
  right: string;
};

export type ExamTechnique = {
  command_words: { word: string; what_examiner_wants: string }[];
  golden_rules: string[];
};

export type MemoryAid = {
  acronym: string;
  expansion: string;
  type: string;
};

export type FurtherReading = {
  title: string;
  url: string | null;
};

export type LessonBody = {
  apm_learning_objective: string;
  learning_outcomes: string[];
  where_this_fits: string;
  key_definitions: KeyDefinition[];
  core_content: CoreContentBlock[];
  worked_example: WorkedExample;
  misconceptions: Misconception[];
  exam_technique: ExamTechnique;
  memory_aids: MemoryAid[];
  quick_recap: string[];
  further_reading: FurtherReading[];
  progress_checkpoint: string[];
  quiz_total_marks?: number;
  quiz_set_2_total_marks?: number;
  quiz_set_3_total_marks?: number;
};

export type QuestionType =
  | "multiple_choice"
  | "select_from_list"
  | "long_answer"
  | "short_answer";

export type PmqQuestion = {
  id: string;
  section_id: string | null;
  course_id: string;
  external_id: string;
  question_type: QuestionType;
  is_scenario: boolean;
  learning_objective: string;
  context: string;
  exam_set: MockExamSet | null;
  part: number | null;
  position: number | null;
  marks: number;
  prompt: string;
  mock_suitable: boolean;
  options: string[] | Record<string, string[]> | null;
  correct_answer: string | Record<string, string> | null;
  model_answer: string | null;
  marking_guide: string | null;
  explanation: string | null;
};

export type PmqSection = {
  id: string;
  course_id: string;
  order_index: number;
  title: string;
  lo_code: string;
  day: number;
  theme: string;
};

export type PmqLesson = {
  id: string;
  section_id: string;
  order_index: number;
  lesson_type: string;
  title: string;
  body: LessonBody;
};

export type SectionProgress = {
  id: string;
  user_id: string;
  section_id: string;
  course_id: string;
  checklist_state: number[];
  quiz_completed_at: string | null;
  completed_at: string | null;
  updated_at: string;
  orient_reached_at: string | null;
  learn_reached_at: string | null;
  video_reached_at: string | null;
  audio_reached_at: string | null;
  apply_reached_at: string | null;
};

export type MockExamConfig = {
  total_marks: number;
  pass_mark: number;
  pass_percentage: number;
  time_allowed_minutes: number;
  part_duration_minutes?: number;
  break_after_question: number;
  break_duration_minutes: number;
};

export type MockExamTier = "lite" | "full";
export type MockExamSet = 1 | 2 | 3 | 4;
export type MockExamSnapshot = MockExamConfig & {
  exam_set: MockExamSet;
  question_ids: string[];
  premium_price_cents?: number;
};
export type ExamSessionStatus =
  | "active"
  | "break"
  | "self_assessing"
  | "grading"
  | "finalized"
  | "abandoned"
  | "expired";

export type CaseStudyPersona = {
  name: string;
  role: string;
  profile: string;
};

export type CaseStudy = {
  organisation: string;
  description: string;
  personas: CaseStudyPersona[];
};

export type ExamSession = {
  id: string;
  user_id: string;
  course_id: string;
  started_at: string;
  time_limit_minutes: number;
  submitted_at: string | null;
  total_score: number | null;
  max_score: number | null;
  passed: boolean | null;
  tier: MockExamTier;
  exam_set: MockExamSet;
  status: ExamSessionStatus;
  deadline_at: string;
  break_started_at: string | null;
  break_ends_at: string | null;
  config_snapshot: MockExamSnapshot;
  finalized_at: string | null;
  current_part: 1 | 2;
  current_question_id: string | null;
  part_1_started_at: string | null;
  part_1_deadline_at: string | null;
  part_1_submitted_at: string | null;
  part_2_started_at: string | null;
  part_2_deadline_at: string | null;
  part_2_submitted_at: string | null;
  /** Set when expireSession just wrote `expired` on this read (client analytics). */
  justExpired?: boolean;
  /** Set when expireSession just wrote `abandoned` on this read (client analytics). */
  justAbandoned?: boolean;
};

export type MockExamSetSummary = {
  examSet: MockExamSet;
  questionCount: number;
  totalMarks: number;
  ready: boolean;
  activeSessionId: string | null;
  latestResult: "passed" | "refer" | null;
  hasPassed: boolean;
  latestStatus?: ExamSessionStatus | null;
  /** Current part deadline (active sitting) — drives overview console timer. */
  activePartDeadlineAt?: string | null;
  activeBreakEndsAt?: string | null;
  activeCurrentPart?: 1 | 2 | null;
};

export type MockAttempt = {
  id: string;
  question_id: string;
  submitted_answer: string | Record<string, string> | null;
  is_correct: boolean | null;
  ai_score: number | null;
  ai_feedback: string | null;
  ai_rubric_evidence: string[] | null;
  ai_model: string | null;
  ai_input_tokens: number | null;
  ai_output_tokens: number | null;
  ai_cost_gbp_cents: number | null;
  grading_status: "not_required" | "pending" | "grading" | "graded" | "error";
  grading_error: string | null;
  grading_attempts: number;
  graded_at: string | null;
  attempted_at: string;
};

/** Safe to serialize before finalization: no keys, guides, or model answers. */
export type PublicMockQuestion = Omit<
  PmqQuestion,
  "correct_answer" | "model_answer" | "marking_guide" | "explanation"
>;

export type MockExamReview = {
  questionId: string;
  prompt: string;
  questionType: QuestionType;
  options: string[] | Record<string, string[]> | null;
  part: number;
  position: number;
  marks: number;
  submittedAnswer: string | Record<string, string> | null;
  correctAnswer: string | Record<string, string> | null;
  modelAnswer: string | null;
  markingGuide: string | null;
  score: number;
  feedback: string | null;
};

export type MockExamQuestionFlag = {
  question_id: string;
};

export type MockSelfAssessmentItem = {
  attemptId: string;
  questionId: string;
  prompt: string;
  submittedAnswer: string;
  modelAnswer: string;
  markingGuide: string;
  maxMarks: number;
  score: number | null;
};

export type UserCourseStats = {
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
};

export type FeatureEntitlement = {
  id: string;
  user_id: string;
  course_id: string;
  feature: string;
  source: string;
  granted_at: string;
  stripe_payment_id: string | null;
};
