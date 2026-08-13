import { PFQ_EXPECTED_OUTCOMES } from "./outcomes.ts";

export type BankQuestion = {
  id: string;
  learning_outcome: string;
  type: string;
  traps?: string[];
  stem: string;
  items?: string[] | null;
  options: Record<string, string>;
  answer: string;
  explanation: string;
};

export type BankInvariantFailure = {
  code: string;
  message: string;
};

const OPTION_LETTER_RE = /\boption [a-d]\b/i;

export function validatePfqBank(
  questions: BankQuestion[],
): BankInvariantFailure[] {
  const failures: BankInvariantFailure[] = [];
  const expected = new Set(PFQ_EXPECTED_OUTCOMES);
  const found = new Set(questions.map((q) => q.learning_outcome));

  for (const code of expected) {
    if (!found.has(code)) {
      failures.push({
        code: "missing_outcome",
        message: `Missing learning outcome ${code}`,
      });
    }
  }
  for (const code of found) {
    if (!expected.has(code as (typeof PFQ_EXPECTED_OUTCOMES)[number])) {
      failures.push({
        code: "extra_outcome",
        message: `Unexpected learning outcome ${code}`,
      });
    }
  }

  for (const q of questions) {
    const keys = Object.keys(q.options ?? {}).sort();
    if (keys.length !== 4 || keys.join("") !== "abcd") {
      failures.push({
        code: "options_shape",
        message: `${q.id}: options must have exactly keys a,b,c,d`,
      });
    }
    if (!keys.includes(q.answer)) {
      failures.push({
        code: "answer_key",
        message: `${q.id}: answer "${q.answer}" is not a key of options`,
      });
    }
    if (q.type === "multi_select") {
      const items = q.items ?? [];
      if (items.length !== 4) {
        failures.push({
          code: "multi_items",
          message: `${q.id}: multi_select must have exactly 4 items`,
        });
      }
    }
    if (OPTION_LETTER_RE.test(q.explanation ?? "")) {
      failures.push({
        code: "letter_in_explanation",
        message: `${q.id}: explanation references an option letter (options are reshuffled)`,
      });
    }
  }

  return failures;
}
