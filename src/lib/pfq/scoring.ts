import {
  PFQ_OBJECTIVES,
  PFQ_OUTCOME_COUNT,
  PFQ_PASS_MARK,
  dayForOutcome,
  outcomeTitle,
} from "./outcomes.ts";
import { bankToDisplayAnswer } from "./shuffle.ts";
import type {
  PfqCoverageOutcome,
  PfqObjectiveResult,
  PfqQuestionRow,
  PfqResultsPayload,
  PfqReviewQuestion,
} from "./types.ts";

type AnswerRow = {
  question_id: string;
  selected: string | null;
  correct: boolean | null;
  flagged: boolean;
  option_order: string[];
};

export function isDisplayAnswerCorrect(
  bankAnswer: string,
  selectedDisplay: string | null,
  optionOrder: string[],
): boolean {
  if (!selectedDisplay) return false;
  return bankToDisplayAnswer(bankAnswer, optionOrder) === selectedDisplay;
}

export function buildPfqResults(input: {
  attemptId: string;
  questionIds: string[];
  questionsById: Map<string, PfqQuestionRow>;
  answers: AnswerRow[];
}): PfqResultsPayload {
  const answerById = new Map(input.answers.map((a) => [a.question_id, a]));
  let score = 0;

  const reviews: PfqReviewQuestion[] = input.questionIds.map((id) => {
    const q = input.questionsById.get(id);
    if (!q) throw new Error(`Missing question ${id}`);
    const a = answerById.get(id);
    const optionOrder = a?.option_order ?? ["a", "b", "c", "d"];
    const selected = a?.selected ?? null;
    const correct = isDisplayAnswerCorrect(q.answer, selected, optionOrder);
    if (correct) score += 1;

    const options: Record<string, string> = {};
    optionOrder.forEach((bankKey, index) => {
      options[String.fromCharCode(97 + index)] = q.options[bankKey] ?? "";
    });

    return {
      id: q.id,
      learning_outcome: q.learning_outcome,
      objective: q.objective,
      day: q.day,
      verb: q.verb,
      type: q.type as "single" | "multi_select",
      traps: q.traps ?? [],
      stem: q.stem,
      items: q.items,
      options,
      option_order: optionOrder,
      answer: bankToDisplayAnswer(q.answer, optionOrder),
      explanation: q.explanation,
      selected,
      correct,
      flagged: a?.flagged ?? false,
    };
  });

  type OutcomeAgg = {
    total: number;
    correct: number;
    attempted: number;
    wrongExplanation: string;
    wrongQuestionId: string;
  };

  const byOutcome = new Map<string, OutcomeAgg>();
  for (const r of reviews) {
    const cur = byOutcome.get(r.learning_outcome) ?? {
      total: 0,
      correct: 0,
      attempted: 0,
      wrongExplanation: "",
      wrongQuestionId: "",
    };
    cur.total += 1;
    if (r.selected) cur.attempted += 1;
    if (r.correct) cur.correct += 1;
    else if (!cur.wrongExplanation) {
      cur.wrongExplanation = r.explanation;
      cur.wrongQuestionId = r.id;
    }
    byOutcome.set(r.learning_outcome, cur);
  }

  const coverage: PfqCoverageOutcome[] = [];
  for (const obj of PFQ_OBJECTIVES) {
    for (const code of obj.outcomes) {
      const row = byOutcome.get(code);
      let state: PfqCoverageOutcome["state"] = "unattempted";
      const marks = row?.total ?? 1;
      if (row && row.total > 0) {
        if (row.correct === row.total) state = "correct";
        else if (row.attempted === 0) state = "unattempted";
        else state = "incorrect";
      }
      coverage.push({
        code,
        title: outcomeTitle(code),
        objective: obj.objective,
        day: obj.day,
        state,
        marks,
      });
    }
  }

  const outcomesAnsweredCorrectly = coverage.filter(
    (c) => c.state === "correct",
  ).length;

  const objectives: PfqObjectiveResult[] = PFQ_OBJECTIVES.map((obj) => {
    let scored = 0;
    let available = 0;
    for (const r of reviews) {
      if (r.objective !== obj.objective) continue;
      available += 1;
      if (r.correct) scored += 1;
    }
    return {
      objective: obj.objective,
      title: obj.title,
      day: obj.day,
      available: available || obj.marks,
      scored,
    };
  });

  const gaps = coverage
    .filter((c) => c.state !== "correct")
    .map((c) => {
      const row = byOutcome.get(c.code);
      return {
        code: c.code,
        title: c.title,
        marks: c.marks,
        day: dayForOutcome(c.code),
        explanation: row?.wrongExplanation ?? "",
        questionId: row?.wrongQuestionId ?? "",
      };
    })
    .sort((a, b) => b.marks - a.marks || a.code.localeCompare(b.code));

  return {
    attemptId: input.attemptId,
    score,
    maxScore: reviews.length,
    passed: score >= PFQ_PASS_MARK,
    outcomesAnsweredCorrectly,
    outcomeCount: PFQ_OUTCOME_COUNT,
    coverage,
    objectives,
    gaps,
    reviews,
  };
}
