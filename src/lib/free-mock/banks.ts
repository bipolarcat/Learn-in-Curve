/**
 * Adapters: content-file shapes -> FreeMockItem[].
 * Do not edit the three content banks to suit this module.
 */

import { FREE_MOCK_QUESTIONS } from "@/content/free-mock-exam";
import { FREE_MOCK_PFQ_QUESTIONS } from "@/content/free-mock-pfq";
import { FREE_MOCK_PMP_QUESTIONS } from "@/content/free-mock-pmp";
import type { FreeMockExamId, FreeMockItem } from "@/lib/free-mock/types";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Some PMQ items store correct_answer as a letter; resolve to option text. */
function resolveMcqCorrectAnswer(
  options: string[],
  correct: string,
): string {
  if (options.includes(correct)) return correct;
  const index = LETTERS.indexOf(correct.trim().toUpperCase());
  if (index >= 0 && index < options.length) {
    return options[index] ?? correct;
  }
  return correct;
}

export function adaptPmqBank(): FreeMockItem[] {
  return FREE_MOCK_QUESTIONS.map((q) => {
    if (q.type === "dropdown") {
      return {
        id: q.id,
        category: { key: q.lo_code, label: q.lo_title },
        type: "dropdown",
        prompt: q.prompt,
        dropdowns: q.dropdowns,
        correct_answers: q.correct_answers,
        marks: q.marks,
        explanation: q.explanation,
      };
    }
    return {
      id: q.id,
      category: { key: q.lo_code, label: q.lo_title },
      type: q.type,
      prompt: q.prompt,
      options: q.options,
      correct_answer: resolveMcqCorrectAnswer(q.options, q.correct_answer),
      marks: q.marks,
      explanation: q.explanation,
    };
  });
}

export function adaptPfqBank(): FreeMockItem[] {
  return FREE_MOCK_PFQ_QUESTIONS.map((q) => ({
    id: q.id,
    category: {
      key: `LO${q.objective}`,
      label: q.objective_title,
    },
    type: q.type,
    prompt: q.prompt,
    options: q.options,
    correct_answer: resolveMcqCorrectAnswer(q.options, q.correct_answer),
    marks: q.marks,
    explanation: q.explanation,
  }));
}

export function adaptPmpBank(): FreeMockItem[] {
  return FREE_MOCK_PMP_QUESTIONS.map((q) => ({
    id: q.id,
    category: { key: q.domain, label: q.domain },
    type: q.type,
    prompt: q.prompt,
    options: q.options,
    correct_answer: resolveMcqCorrectAnswer(q.options, q.correct_answer),
    marks: q.marks,
    explanation: q.explanation,
  }));
}

const BANK_BY_ID: Record<FreeMockExamId, () => FreeMockItem[]> = {
  "apm-pmq": adaptPmqBank,
  "apm-pfq": adaptPfqBank,
  pmp: adaptPmpBank,
};

export function getFreeMockBank(examId: FreeMockExamId): FreeMockItem[] {
  return BANK_BY_ID[examId]();
}
