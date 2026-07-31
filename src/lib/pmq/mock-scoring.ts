import type { PmqQuestion } from "@/types/pmq";

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
