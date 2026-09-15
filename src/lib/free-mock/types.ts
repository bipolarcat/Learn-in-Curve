/**
 * Neutral free-mock shapes shared by PMQ, PFQ and PMP readiness checks.
 * Content banks keep their own types; adapters in banks.ts map into these.
 */

export type FreeMockExamId = "apm-pmq" | "apm-pfq" | "pmp";

export type FreeMockCategory = {
  key: string;
  label: string;
};

export type FreeMockItem = {
  id: string;
  category: FreeMockCategory;
  type: "mcq" | "scenario_mcq" | "dropdown";
  prompt: string;
  options?: string[];
  correct_answer?: string;
  dropdowns?: Record<string, string[]>;
  correct_answers?: Record<string, string>;
  marks: number;
  explanation: string | null;
};

export type FreeMockAnswer =
  | { kind: "mcq"; letter: string }
  | { kind: "dropdown"; values: Record<string, string> };

export type CategoryBreakdownRow = {
  key: string;
  label: string;
  correct: number;
  total: number;
  /** Stable sort: LO number when numeric, else label order. */
  sortIndex: number;
};

/** @deprecated Prefer CategoryBreakdownRow. Kept for lead JSON shape continuity. */
export type LoBreakdownRow = {
  lo_number: number;
  lo_code: string;
  lo_title: string;
  correct: number;
  total: number;
};
