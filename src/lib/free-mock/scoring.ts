/**
 * Score helpers for the free mock (1 point per fully-correct question).
 */
import type { FreeMockQuestion } from "@/content/free-mock-exam";

export type FreeMockAnswer =
  | { kind: "mcq"; letter: string }
  | { kind: "dropdown"; values: Record<string, string> };

export function isQuestionCorrect(
  question: FreeMockQuestion,
  answer: FreeMockAnswer | undefined,
): boolean {
  if (!answer) return false;
  if (question.type === "dropdown") {
    if (answer.kind !== "dropdown") return false;
    const keys = Object.keys(question.correct_answers);
    if (keys.length === 0) return false;
    return keys.every(
      (key) => answer.values[key] === question.correct_answers[key],
    );
  }
  if (answer.kind !== "mcq") return false;
  return answer.letter === question.correct_answer;
}

export type LoBreakdownRow = {
  lo_number: number;
  lo_code: string;
  lo_title: string;
  correct: number;
  total: number;
};

export function buildLoBreakdown(
  questions: FreeMockQuestion[],
  answers: Record<string, FreeMockAnswer>,
): LoBreakdownRow[] {
  const map = new Map<number, LoBreakdownRow>();
  for (const q of questions) {
    const row = map.get(q.lo_number) ?? {
      lo_number: q.lo_number,
      lo_code: q.lo_code,
      lo_title: q.lo_title,
      correct: 0,
      total: 0,
    };
    row.total += 1;
    if (isQuestionCorrect(q, answers[q.id])) row.correct += 1;
    map.set(q.lo_number, row);
  }
  return [...map.values()].sort((a, b) => a.lo_number - b.lo_number);
}

/** Lowest accuracy first; ties broken by lower correct count, then LO number. */
export function weakestLos(
  breakdown: LoBreakdownRow[],
  limit = 3,
): LoBreakdownRow[] {
  return [...breakdown]
    .sort((a, b) => {
      const ar = a.correct / a.total;
      const br = b.correct / b.total;
      if (ar !== br) return ar - br;
      if (a.correct !== b.correct) return a.correct - b.correct;
      return a.lo_number - b.lo_number;
    })
    .slice(0, limit);
}
