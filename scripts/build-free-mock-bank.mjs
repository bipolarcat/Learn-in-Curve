/**
 * One-shot: build src/content/free-mock-exam.ts from practice inventory.
 * Run: node scripts/build-free-mock-bank.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const dir = join(process.cwd(), "PMQ in 5 days", "content");
const mock = JSON.parse(readFileSync(join(dir, "mock.json"), "utf8"));
const mockPrompts = new Set();
for (const part of mock.parts ?? []) {
  for (const q of part.questions ?? []) {
    if (["mcq", "scenario_mcq", "dropdown"].includes(q.type)) {
      mockPrompts.add((q.question || "").slice(0, 80));
    }
  }
}

const picks = [
  [1, "q4"],
  [2, "q27"],
  [3, "q3"],
  [4, "q2"],
  [5, "q3"],
  [6, "q1"],
  [7, "q4"],
  [8, "q4"],
  [9, "q3"],
  [10, "q25"],
  [11, "q4"],
  [12, "q3"],
  [13, "q3"],
  [14, "q3"],
  [15, "q32"],
];

const out = [];
for (const [lo, id] of picks) {
  const j = JSON.parse(readFileSync(join(dir, `lo${lo}.json`), "utf8"));
  const q = j.quiz.find((x) => x.id === id);
  if (!q) throw new Error(`missing LO${lo} ${id}`);
  if (mockPrompts.has((q.question || "").slice(0, 80))) {
    throw new Error(`in mock LO${lo} ${id}`);
  }
  if (q.mock_suitable) throw new Error(`suitable LO${lo} ${id}`);

  /** @type {Record<string, unknown>} */
  const item = {
    id: `LO${lo}-${id}`,
    lo_number: lo,
    lo_code: `LO${lo}`,
    lo_title: j.title,
    type: q.type,
    prompt: q.question,
    marks: q.marks || 1,
    explanation: q.explanation ?? null,
  };
  if (q.type === "mcq" || q.type === "scenario_mcq") {
    item.options = q.options;
    item.correct_answer = q.correct_answer;
  } else {
    item.dropdowns = q.dropdowns;
    item.correct_answers = q.correct_answers;
  }
  out.push(item);
}

mkdirSync(join(process.cwd(), "src", "content"), { recursive: true });

const header = `/**
 * Ring-fenced free mock bank (15 auto-marked items).
 * Sourced from practice quiz inventory with mock_suitable=false and prompts
 * not present in paid Exam 1 (mock.json). Fixed order — deterministic retakes.
 * Do not add items that appear in mock Exams 1–4.
 */

export type FreeMockQuestionType = "mcq" | "scenario_mcq" | "dropdown";

export type FreeMockMcq = {
  id: string;
  lo_number: number;
  lo_code: string;
  lo_title: string;
  type: "mcq" | "scenario_mcq";
  prompt: string;
  options: string[];
  correct_answer: string;
  marks: number;
  explanation: string | null;
};

export type FreeMockDropdown = {
  id: string;
  lo_number: number;
  lo_code: string;
  lo_title: string;
  type: "dropdown";
  prompt: string;
  dropdowns: Record<string, string[]>;
  correct_answers: Record<string, string>;
  marks: number;
  explanation: string | null;
};

export type FreeMockQuestion = FreeMockMcq | FreeMockDropdown;

`;

const body = `export const FREE_MOCK_QUESTIONS: FreeMockQuestion[] = ${JSON.stringify(out, null, 2)};

export const FREE_MOCK_MAX_SCORE = FREE_MOCK_QUESTIONS.length;
`;

writeFileSync(join(process.cwd(), "src", "content", "free-mock-exam.ts"), header + body);
console.log(`Wrote ${out.length} questions`);
