import type { PmqQuestion } from "@/types/pmq";

export type MockScoreAttempt = {
  question_id: string;
  is_correct: boolean | null;
  ai_score: number | null;
  grading_status?: string | null;
};

export type MockScoreQuestion = {
  id: string;
  marks: number;
  question_type: string;
  part: number | null;
};

export type MockScoreBreakdown = {
  totalScore: number;
  maxScore: number;
  partOne: { earned: number; available: number; answered: number };
  partTwo: { earned: number; available: number; answered: number };
  /** Written answers submitted but with grading_status not 'graded'. */
  ungradedWritten: number;
};

function isWrittenType(questionType: string): boolean {
  return questionType === "long_answer" || questionType === "short_answer";
}

function partOf(question: MockScoreQuestion): 1 | 2 {
  return question.part === 2 ? 2 : 1;
}

/**
 * Single scorer for finalize + expire/abandon. Behaviour matches the former
 * finalizeMockExam loop: written → ai_score ?? 0; objective → marks if is_correct.
 * Part `available` comes from config questions, not attempts.
 */
export function scoreMockSession(
  questions: MockScoreQuestion[],
  attempts: MockScoreAttempt[],
  maxScore: number,
): MockScoreBreakdown {
  const questionById = new Map(questions.map((q) => [q.id, q]));
  const attemptByQuestion = new Map(
    attempts.map((attempt) => [attempt.question_id, attempt]),
  );

  let totalScore = 0;
  let ungradedWritten = 0;

  for (const attempt of attempts) {
    const question = questionById.get(attempt.question_id);
    if (!question) continue;
    if (isWrittenType(question.question_type)) {
      totalScore += attempt.ai_score ?? 0;
      if (attempt.grading_status !== "graded") {
        ungradedWritten += 1;
      }
    } else if (attempt.is_correct) {
      totalScore += question.marks;
    }
  }

  const partStats = (part: 1 | 2) => {
    const partQuestions = questions.filter((q) => partOf(q) === part);
    const available = partQuestions.reduce((sum, q) => sum + q.marks, 0);
    let earned = 0;
    let answered = 0;
    for (const question of partQuestions) {
      const attempt = attemptByQuestion.get(question.id);
      if (!attempt) continue;
      answered += 1;
      if (isWrittenType(question.question_type)) {
        earned += attempt.ai_score ?? 0;
      } else if (attempt.is_correct) {
        earned += question.marks;
      }
    }
    return { earned, available, answered };
  };

  return {
    totalScore,
    maxScore,
    partOne: partStats(1),
    partTwo: partStats(2),
    ungradedWritten,
  };
}

export function normalizeDropdownAnswer(
  value: Record<string, string>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(value).map(([k, v]) => [k, v.trim().toLowerCase()]),
  );
}

export function dropdownIsCorrect(
  submitted: Record<string, string>,
  correct: Record<string, string> | null,
): boolean {
  if (!correct) return false;
  const a = normalizeDropdownAnswer(submitted);
  const b = normalizeDropdownAnswer(correct);
  return Object.keys(b).every((key) => a[key] === b[key]);
}

export function scoreAutoMarkedQuestion(
  question: PmqQuestion,
  submittedAnswer: string | Record<string, string> | null,
): boolean {
  if (question.question_type === "multiple_choice") {
    return (
      typeof submittedAnswer === "string" &&
      submittedAnswer === (question.correct_answer as string)
    );
  }
  if (question.question_type === "select_from_list") {
    return (
      submittedAnswer != null &&
      typeof submittedAnswer === "object" &&
      !Array.isArray(submittedAnswer) &&
      dropdownIsCorrect(
        submittedAnswer as Record<string, string>,
        question.correct_answer as Record<string, string>,
      )
    );
  }
  return false;
}

export function isWrittenQuestion(question: PmqQuestion): boolean {
  return (
    question.question_type === "long_answer" ||
    question.question_type === "short_answer"
  );
}

export function questionTypeLabel(question: PmqQuestion): string {
  if (question.question_type === "multiple_choice") {
    return question.is_scenario ? "Scenario MCQ" : "Multiple choice";
  }
  if (question.question_type === "select_from_list") return "Drop-down";
  if (question.question_type === "long_answer") return "Long form";
  return "Short recall";
}

export function parseMarkingPoints(guide: string | null): string[] {
  if (!guide) return [];
  return guide
    .split(/\n|•|·|-/)
    .map((s) => s.trim())
    .filter(Boolean);
}
