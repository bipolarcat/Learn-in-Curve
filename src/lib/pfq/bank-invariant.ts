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
  mock_suitable?: boolean;
  variant?: number;
};

export type BankInvariantFailure = {
  code: string;
  message: string;
};

const OPTION_LETTER_RE = /\boption [a-d]\b/i;
const EM_DASH_RE = /—|–/;

export function validatePfqBank(
  questions: BankQuestion[],
  options: { requireAllOutcomes?: boolean } = {},
): BankInvariantFailure[] {
  const { requireAllOutcomes = true } = options;
  const failures: BankInvariantFailure[] = [];
  const expected = new Set(PFQ_EXPECTED_OUTCOMES);
  const found = new Set(questions.map((q) => q.learning_outcome));

  if (requireAllOutcomes) {
    for (const code of expected) {
      if (!found.has(code)) {
        failures.push({
          code: "missing_outcome",
          message: `Missing learning outcome ${code}`,
        });
      }
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
    const text = [
      q.stem ?? "",
      q.explanation ?? "",
      ...Object.values(q.options ?? {}),
      ...(q.items ?? []),
    ].join("\n");
    if (EM_DASH_RE.test(text)) {
      failures.push({
        code: "em_dash",
        message: `${q.id}: stem/options/explanation must not contain an em or en dash`,
      });
    }
  }

  return failures;
}

/**
 * Combined mock + practice bank checks used by CI and the seed script.
 */
export function validateCombinedPfqBank(
  mockQuestions: BankQuestion[],
  practiceQuestions: BankQuestion[],
): BankInvariantFailure[] {
  const failures: BankInvariantFailure[] = [];

  failures.push(
    ...validatePfqBank(mockQuestions, { requireAllOutcomes: true }),
  );
  failures.push(
    ...validatePfqBank(practiceQuestions, { requireAllOutcomes: false }),
  );

  const ids = new Set<string>();
  for (const q of [...mockQuestions, ...practiceQuestions]) {
    if (ids.has(q.id)) {
      failures.push({
        code: "id_collision",
        message: `Duplicate id across banks: ${q.id}`,
      });
    }
    ids.add(q.id);
  }

  const mockSuitableOutcomes = new Set(
    mockQuestions
      .filter((q) => q.mock_suitable === true)
      .map((q) => q.learning_outcome),
  );
  for (const code of PFQ_EXPECTED_OUTCOMES) {
    if (!mockSuitableOutcomes.has(code)) {
      failures.push({
        code: "missing_mock_suitable",
        message: `Outcome ${code} has no mock_suitable question`,
      });
    }
  }

  return failures;
}
