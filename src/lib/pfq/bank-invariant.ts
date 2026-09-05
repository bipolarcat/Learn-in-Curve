import { PFQ_EXPECTED_OUTCOMES } from "./outcomes.ts";
import type { PfqMockSet } from "./generator.ts";
import { PFQ_MOCK_SETS } from "./generator.ts";

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
  tip?: string | null;
  mock_suitable?: boolean;
  mock_set?: 1 | 2 | 3 | null;
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

function isMockSet(value: unknown): value is PfqMockSet {
  return value === 1 || value === 2 || value === 3;
}

/**
 * Validate assigned mock papers. Only checks sets that have any rows;
 * empty / unassigned banks are fine during authoring.
 */
export function validatePfqMockSets(
  questions: BankQuestion[],
): BankInvariantFailure[] {
  const failures: BankInvariantFailure[] = [];
  const bySet = new Map<PfqMockSet, BankQuestion[]>();
  const idToSets = new Map<string, PfqMockSet[]>();

  for (const q of questions) {
    if (!isMockSet(q.mock_set)) continue;
    const list = bySet.get(q.mock_set) ?? [];
    list.push(q);
    bySet.set(q.mock_set, list);

    const sets = idToSets.get(q.id) ?? [];
    sets.push(q.mock_set);
    idToSets.set(q.id, sets);
  }

  for (const [id, sets] of idToSets) {
    const unique = new Set(sets);
    if (unique.size > 1) {
      failures.push({
        code: "mock_set_id_collision",
        message: `Question ${id} appears in more than one mock_set: ${[...unique].join(", ")}`,
      });
    }
  }

  for (const mockSet of PFQ_MOCK_SETS) {
    const rows = bySet.get(mockSet);
    if (!rows || rows.length === 0) continue;

    if (rows.length !== 60) {
      failures.push({
        code: "mock_set_count",
        message: `Mock set ${mockSet}: expected 60 questions, got ${rows.length}`,
      });
    }

    const outcomes = rows.map((q) => q.learning_outcome);
    const distinct = new Set(outcomes);
    if (distinct.size !== 59) {
      failures.push({
        code: "mock_set_outcomes",
        message: `Mock set ${mockSet}: expected 59 distinct outcomes, got ${distinct.size}`,
      });
    }

    const counts = new Map<string, number>();
    for (const code of outcomes) {
      counts.set(code, (counts.get(code) ?? 0) + 1);
    }
    const doubled = [...counts.entries()].filter(([, n]) => n === 2);
    const over = [...counts.entries()].filter(([, n]) => n > 2);
    if (doubled.length !== 1 || over.length > 0) {
      failures.push({
        code: "mock_set_double",
        message: `Mock set ${mockSet}: expected exactly one outcome doubled once, got doubles=${doubled.map(([c]) => c).join(",") || "none"} overs=${over.map(([c, n]) => `${c}x${n}`).join(",") || "none"}`,
      });
    }

    const multiSelect = rows.filter((q) => q.type === "multi_select").length;
    if (multiSelect !== 6) {
      failures.push({
        code: "mock_set_multi_select",
        message: `Mock set ${mockSet}: expected exactly 6 multi_select, got ${multiSelect}`,
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

  const combined = [...mockQuestions, ...practiceQuestions];
  if (combined.some((q) => isMockSet(q.mock_set))) {
    failures.push(...validatePfqMockSets(combined));
  }

  return failures;
}
