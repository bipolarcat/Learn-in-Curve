export type CourseSlug = "pmq-in-5-days" | "pfq-in-2-days";

/**
 * Stable feature ids for Free / Paid lists. Wording in the Terms Schedule is
 * human-readable; these ids are what code checks against.
 */
export type CourseFeatureId =
  | "core_content"
  | "standard_quizzes"
  | "first_mock_exam"
  | "additional_quiz_sets"
  | "further_mock_exams"
  | "video_audio"
  | "ai_tutor"
  | "ai_marked_mocks"
  | "lessons"
  | "practice_bank"
  | "mock_exam"
  | "coverage_map";
