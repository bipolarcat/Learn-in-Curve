/**
 * Rebuild PMQ LO quiz banks (lo2–lo24) to remove legacy question types.
 *
 * Part 1 requirements implemented here:
 * - Drop any quiz items with type "long_form" or "short_recall".
 * - Top up to at least MIN_QUESTIONS using new MCQ/dropdown questions.
 * - New questions are sourced only from each LO's existing structured content:
 *   key_definitions, misconceptions, exam_technique.
 * - Renumber quiz item ids to q1..qN.
 * - Recompute quiz_total_marks.
 *
 * Run:
 *   node scripts/rebuild-pmq-lo-quiz.mjs
 */

import fs from "fs";
import { join } from "path";
import process from "process";

const CONTENT_DIR = join(process.cwd(), "PMQ in 5 days", "content");
const MIN_QUESTIONS = 10;

const args = process.argv.slice(2);
function readArg(name, fallback) {
  const idx = args.indexOf(name);
  if (idx === -1 || idx === args.length - 1) return fallback;
  const n = Number(args[idx + 1]);
  return Number.isInteger(n) ? n : fallback;
}

const LO_START = readArg("--start", 2);
const LO_END = readArg("--end", 24);

const ALLOWED_TYPES = new Set(["mcq", "scenario_mcq", "dropdown"]);
const OPTION_LETTERS = ["A", "B", "C", "D"];

function sumMarks(quiz) {
  return (quiz ?? []).reduce((acc, q) => acc + (q.marks ?? 0), 0);
}

function pickDistractors({ correct, pool, count }) {
  const res = [];
  for (const t of pool) {
    if (t !== correct) res.push(t);
    if (res.length >= count) break;
  }
  return res;
}

function mcqFromDefinition({ keyDefs, termIndex }) {
  const term = keyDefs[termIndex]?.term;
  const correct = term;
  if (!correct) throw new Error("Missing term for definition MCQ");

  const distractors = pickDistractors({
    correct,
    pool: keyDefs.map((d) => d.term),
    count: 3,
  });

  const options = [correct, ...distractors];
  if (options.length !== 4) throw new Error("Not enough key_definitions to build MCQ options");

  const def = keyDefs[termIndex]?.apm_definition ?? keyDefs[termIndex]?.plain_english;
  const explanation = `${correct} — ${keyDefs[termIndex]?.plain_english ?? def}`;

  return {
    type: "mcq",
    marks: 1,
    question: `Which term matches this definition: "${def}"?`,
    options,
    correct_answer: OPTION_LETTERS[0], // correct at options[0]
    explanation,
    mock_suitable: false,
  };
}

function dropdownFromDefinitionPair({ keyDefs, aIndex, bIndex }) {
  const a = keyDefs[aIndex];
  const b = keyDefs[bIndex];
  if (!a || !b) throw new Error("Not enough key_definitions for dropdown pair");

  const pool = keyDefs.map((d) => d.term);
  const aDistractors = pickDistractors({ correct: a.term, pool, count: 3 });
  const bDistractors = pickDistractors({ correct: b.term, pool, count: 3 });

  const optionsA = [a.term, ...aDistractors];
  const optionsB = [b.term, ...bDistractors];

  if (optionsA.length !== 4 || optionsB.length !== 4) {
    throw new Error("Not enough key_definitions to build dropdown options");
  }

  return {
    type: "dropdown",
    marks: 2,
    question: `Select the correct terms for the definitions: __(a)__ — ${a.plain_english}. __(b)__ — ${b.plain_english}.`,
    dropdowns: {
      a: optionsA,
      b: optionsB,
    },
    correct_answers: {
      a: a.term,
      b: b.term,
    },
    explanation: `__(a)__ matches "${a.plain_english}", and __(b)__ matches "${b.plain_english}".`,
    mock_suitable: false,
  };
}

function mcqFromMisconception({ misconceptions, misIndex }) {
  const current = misconceptions[misIndex];
  if (!current) throw new Error("Missing misconception");

  const correct = current.right;
  const pool = misconceptions.map((m) => m.right);
  const distractors = pickDistractors({ correct, pool, count: 3 });

  const options = [correct, ...distractors];
  if (options.length !== 4) throw new Error("Not enough misconceptions to build MCQ options");

  return {
    type: "mcq",
    marks: 1,
    question: `A statement is often misunderstood: "${current.wrong}". What is the correct position?`,
    options,
    correct_answer: OPTION_LETTERS[0],
    explanation: `Correct position: ${current.right}`,
    mock_suitable: false,
  };
}

function mcqFromCommandWord({ commandWords, cmdIndex }) {
  const current = commandWords[cmdIndex];
  if (!current) throw new Error("Missing command word");

  const correct = current.what_examiner_wants;
  const pool = commandWords.map((c) => c.what_examiner_wants);
  const distractors = pickDistractors({ correct, pool, count: 3 });
  const options = [correct, ...distractors];

  if (options.length !== 4) throw new Error("Not enough command_words to build MCQ options");

  return {
    type: "mcq",
    marks: 1,
    question: `When the examiner says "${current.word}", what do they want?`,
    options,
    correct_answer: OPTION_LETTERS[0],
    explanation: `The command word "${current.word}" expects: ${current.what_examiner_wants}`,
    mock_suitable: false,
  };
}

function generateReplacementQuestions({ lo, needed }) {
  const keyDefs = lo.key_definitions ?? [];
  const misconceptions = lo.misconceptions ?? [];
  const commandWords = lo.exam_technique?.command_words ?? [];

  const newQuestions = [];
  let termIndex = 0;
  let misIndex = 0;
  let cmdIndex = 0;

  let guard = 0;
  while (newQuestions.length < needed) {
    guard++;
    if (guard > 1000) throw new Error(`Guard tripped while generating questions for LO${lo.lo_number}`);

    const slot = newQuestions.length % 4;
    if (slot === 0 && keyDefs.length >= 2) {
      const aIndex = termIndex % keyDefs.length;
      const bIndex = (termIndex + 1) % keyDefs.length;
      newQuestions.push(dropdownFromDefinitionPair({ keyDefs, aIndex, bIndex }));
      termIndex++;
    } else if (slot === 1 && keyDefs.length >= 4) {
      const idx = termIndex % keyDefs.length;
      newQuestions.push(mcqFromDefinition({ keyDefs, termIndex: idx }));
      termIndex++;
    } else if (slot === 2 && misconceptions.length >= 2) {
      const idx = misIndex % misconceptions.length;
      newQuestions.push(mcqFromMisconception({ misconceptions, misIndex: idx }));
      misIndex++;
    } else if (slot === 3 && commandWords.length >= 4) {
      const idx = cmdIndex % commandWords.length;
      newQuestions.push(mcqFromCommandWord({ commandWords, cmdIndex: idx }));
      cmdIndex++;
    } else {
      // Fallback: definition MCQ (it needs the least structure).
      if (keyDefs.length >= 4) {
        const idx = termIndex % keyDefs.length;
        newQuestions.push(mcqFromDefinition({ keyDefs, termIndex: idx }));
        termIndex++;
      } else {
        throw new Error(
          `Not enough LO structured content to build clean MCQ/dropdown questions for LO${lo.lo_number}. key_definitions=${keyDefs.length}, command_words=${commandWords.length}, misconceptions=${misconceptions.length}`
        );
      }
    }
  }

  return newQuestions;
}

for (let n = LO_START; n <= LO_END; n++) {
  const filePath = join(CONTENT_DIR, `lo${n}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing file: ${filePath}`);
    continue;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const lo = JSON.parse(raw);

  const kept = (lo.quiz ?? []).filter((q) => ALLOWED_TYPES.has(q.type));
  const legacyCount = (lo.quiz ?? []).filter((q) => !ALLOWED_TYPES.has(q.type)).length;

  const needed = Math.max(0, MIN_QUESTIONS - kept.length);
  const generated = needed > 0 ? generateReplacementQuestions({ lo, needed }) : [];

  const rebuiltQuiz = [...kept, ...generated].map((q, idx) => ({
    ...q,
    id: `q${idx + 1}`,
  }));

  lo.quiz = rebuiltQuiz;
  lo.quiz_total_marks = sumMarks(rebuiltQuiz);

  fs.writeFileSync(filePath, JSON.stringify(lo, null, 2) + "\n", "utf8");

  // Validate immediately after write — do not proceed if parse fails.
  JSON.parse(fs.readFileSync(filePath, "utf8"));

  console.log(
    `LO${n}: kept=${kept.length}, legacyRemoved=${legacyCount}, added=${generated.length}, final=${rebuiltQuiz.length}, marks=${lo.quiz_total_marks} — OK`
  );
}

