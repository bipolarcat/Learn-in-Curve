import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { LessonBody, PmqLesson, PmqQuestion, PmqSection } from "@/types/pmq";
import { getDayForLo, PMQ_COURSE_ID } from "./constants";

const CONTENT_DIR = join(process.cwd(), "PMQ in 5 days", "content");

const TYPE_MAP = {
  mcq: { question_type: "multiple_choice" as const, is_scenario: false },
  scenario_mcq: { question_type: "multiple_choice" as const, is_scenario: true },
  dropdown: { question_type: "select_from_list" as const, is_scenario: false },
  long_form: { question_type: "long_answer" as const, is_scenario: false },
  short_recall: { question_type: "short_answer" as const, is_scenario: false },
};

type LoQuizItem = {
  id: string;
  type: keyof typeof TYPE_MAP;
  marks: number;
  question: string;
  options?: string[];
  correct_answer?: string;
  dropdowns?: Record<string, string[]>;
  correct_answers?: Record<string, string>;
  model_answer?: string;
  marking_guide?: string;
  explanation?: string;
  mock_suitable?: boolean;
};

type LoJson = {
  lo_number: number;
  lo_code: string;
  title: string;
  day: number;
  theme: string;
  apm_learning_objective: string;
  learning_outcomes: string[];
  where_this_fits: string;
  key_definitions: LessonBody["key_definitions"];
  core_content: LessonBody["core_content"];
  worked_example: LessonBody["worked_example"];
  misconceptions: LessonBody["misconceptions"];
  exam_technique: LessonBody["exam_technique"];
  memory_aids: LessonBody["memory_aids"];
  quick_recap: string[];
  further_reading: LessonBody["further_reading"];
  progress_checkpoint: string[];
  quiz_total_marks?: number;
  quiz_set_2_total_marks?: number;
  quiz_set_3_total_marks?: number;
  quiz?: LoQuizItem[];
  quiz_set_2?: LoQuizItem[];
  quiz_set_3?: LoQuizItem[];
  [key: string]: unknown;
};

function readLoJson(loNumber: number): LoJson | null {
  const filePath = join(CONTENT_DIR, `lo${loNumber}.json`);
  if (!existsSync(filePath)) return null;
  return JSON.parse(readFileSync(filePath, "utf8")) as LoJson;
}

function buildLessonBody(lo: LoJson): LessonBody {
  return {
    apm_learning_objective: lo.apm_learning_objective,
    learning_outcomes: lo.learning_outcomes,
    where_this_fits: lo.where_this_fits,
    key_definitions: lo.key_definitions,
    core_content: lo.core_content,
    worked_example: lo.worked_example,
    misconceptions: lo.misconceptions,
    exam_technique: lo.exam_technique,
    memory_aids: lo.memory_aids,
    quick_recap: lo.quick_recap,
    further_reading: lo.further_reading,
    progress_checkpoint: lo.progress_checkpoint,
    quiz_total_marks: lo.quiz_total_marks,
    quiz_set_2_total_marks: lo.quiz_set_2_total_marks,
    quiz_set_3_total_marks: lo.quiz_set_3_total_marks,
  };
}

function buildQuestionFromQuiz(
  item: LoQuizItem,
  sectionId: string,
  loCode: string,
  context: string = "practice_quiz",
): PmqQuestion {
  const mapped = TYPE_MAP[item.type];
  const row: PmqQuestion = {
    id: `json-${sectionId}-${context}-${item.id}`,
    section_id: sectionId,
    course_id: PMQ_COURSE_ID,
    external_id: item.id,
    question_type: mapped.question_type,
    is_scenario: mapped.is_scenario,
    learning_objective: loCode,
    context,
    exam_set: null,
    part: null,
    position: null,
    marks: item.marks,
    prompt: item.question,
    mock_suitable: item.mock_suitable ?? false,
    explanation: item.explanation ?? null,
    options: null,
    correct_answer: null,
    model_answer: null,
    marking_guide: null,
  };

  if (item.type === "mcq" || item.type === "scenario_mcq") {
    row.options = item.options ?? null;
    row.correct_answer = item.correct_answer ?? null;
  } else if (item.type === "dropdown") {
    row.options = item.dropdowns ?? null;
    row.correct_answer = item.correct_answers ?? null;
  } else {
    row.model_answer = item.model_answer ?? null;
    row.marking_guide = item.marking_guide ?? null;
  }

  return row;
}

export function loadSectionsFromJson(): PmqSection[] {
  const sections: PmqSection[] = [];
  for (let n = 1; n <= 24; n++) {
    const lo = readLoJson(n);
    if (!lo) continue;
    sections.push({
      id: `json-section-${n}`,
      course_id: PMQ_COURSE_ID,
      order_index: lo.lo_number,
      title: lo.title,
      lo_code: lo.lo_code,
      day: getDayForLo(lo.lo_number),
      theme: lo.theme,
    });
  }
  return sections;
}

export function mergeSections(
  dbSections: PmqSection[],
  jsonSections: PmqSection[],
): PmqSection[] {
  const byIndex = new Map<number, PmqSection>();
  for (const s of jsonSections) byIndex.set(s.order_index, s);
  for (const s of dbSections) byIndex.set(s.order_index, s);
  return Array.from(byIndex.values()).sort((a, b) => a.order_index - b.order_index);
}

export function loadLoPageFromJson(loNumber: number): {
  section: PmqSection;
  lesson: PmqLesson;
  body: LessonBody;
  questions: PmqQuestion[];
} | null {
  const lo = readLoJson(loNumber);
  if (!lo) return null;

  const sectionId = `json-section-${loNumber}`;
  const section: PmqSection = {
    id: sectionId,
    course_id: PMQ_COURSE_ID,
    order_index: lo.lo_number,
    title: lo.title,
    lo_code: lo.lo_code,
    day: getDayForLo(lo.lo_number),
    theme: lo.theme,
  };

  const body = buildLessonBody(lo);
  const lesson: PmqLesson = {
    id: `json-lesson-${loNumber}`,
    section_id: sectionId,
    order_index: 1,
    lesson_type: "content",
    title: lo.title,
    body,
  };

  const sortByExternalId = (a: PmqQuestion, b: PmqQuestion) => {
    const num = (id: string) => parseInt(id.replace(/\D/g, "") || "0", 10);
    return num(a.external_id) - num(b.external_id);
  };

  const questions = (lo.quiz ?? [])
    .map((q) => buildQuestionFromQuiz(q, sectionId, lo.lo_code, "practice_quiz"))
    .sort(sortByExternalId);

  return { section, lesson, body, questions };
}

/** JSON-fallback path for entitlement-gated quiz sets 2+ (LIC-22 / LIC-59). */
export function loadQuizSetFromJson(
  loNumber: number,
  context: string,
): PmqQuestion[] {
  const lo = readLoJson(loNumber);
  if (!lo) return [];

  const sectionId = `json-section-${loNumber}`;
  const raw = lo[context];
  const items = Array.isArray(raw) ? (raw as LoQuizItem[]) : [];

  return items
    .map((q) => buildQuestionFromQuiz(q, sectionId, lo.lo_code, context))
    .sort((a, b) => {
      const num = (id: string) => parseInt(id.replace(/\D/g, "") || "0", 10);
      return num(a.external_id) - num(b.external_id);
    });
}

/** How many practice sets the JSON bank exposes for this LO. */
export function loadPracticeSetCountFromJson(loNumber: number): number {
  const lo = readLoJson(loNumber);
  if (!lo) return 1;

  let max = Array.isArray(lo.quiz) && lo.quiz.length ? 1 : 0;
  for (let n = 2; n <= 20; n++) {
    const items = lo[`quiz_set_${n}`];
    if (Array.isArray(items) && items.length) max = n;
  }
  return Math.max(1, max);
}

export function loadMockQuestionsFromJson(): PmqQuestion[] {
  const mockPath = join(CONTENT_DIR, "mock.json");
  if (!existsSync(mockPath)) return [];

  const mock = JSON.parse(readFileSync(mockPath, "utf8")) as {
    parts?: {
      part: number;
      questions?: {
        id: string;
        part: number;
        position: number;
        type: keyof typeof TYPE_MAP;
        marks: number;
        lo_reference?: string;
        question: string;
        options?: string[];
        correct_answer?: string;
        dropdowns?: Record<string, string[]>;
        correct_answers?: Record<string, string>;
        model_answer?: string;
        marking_guide?: string;
        explanation?: string;
      }[];
    }[];
  };

  const rows: PmqQuestion[] = [];

  for (const part of mock.parts ?? []) {
    for (const item of part.questions ?? []) {
      const mapped = TYPE_MAP[item.type];
      const row: PmqQuestion = {
        id: `json-mock-${item.id}`,
        section_id: null,
        course_id: PMQ_COURSE_ID,
        external_id: item.id,
        question_type: mapped.question_type,
        is_scenario: mapped.is_scenario,
        learning_objective: item.lo_reference ?? "mock",
        context: "mock_exam",
        exam_set: 1,
        part: item.part,
        position: item.position,
        marks: item.marks,
        prompt: item.question,
        mock_suitable: true,
        explanation: item.explanation ?? null,
        options: null,
        correct_answer: null,
        model_answer: null,
        marking_guide: null,
      };

      if (item.type === "mcq" || item.type === "scenario_mcq") {
        row.options = item.options ?? null;
        row.correct_answer = item.correct_answer ?? null;
      } else if (item.type === "dropdown") {
        row.options = item.dropdowns ?? null;
        row.correct_answer = item.correct_answers ?? null;
      } else {
        row.model_answer = item.model_answer ?? null;
        row.marking_guide = item.marking_guide ?? null;
      }

      rows.push(row);
    }
  }

  return rows.sort((a, b) => {
    if (a.part !== b.part) return (a.part ?? 0) - (b.part ?? 0);
    return (a.position ?? 0) - (b.position ?? 0);
  });
}
