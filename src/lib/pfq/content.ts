/**
 * PFQ lesson content — build-time load + schema validation.
 * Source: PFQ in 2 days/lessons/objective-*.json
 *
 * source_confidence is loaded for validation only and never exposed on
 * learner-facing types (must not appear in the client bundle).
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PFQ_EXPECTED_OUTCOMES, PFQ_OBJECTIVES } from "./outcomes.ts";

const LESSONS_DIR = join(process.cwd(), "PFQ in 2 days", "lessons");
const EM_DASH_RE = /—/;
const BOLD_MD_RE = /\*\*/;

export type PfqKeyDefinition = {
  term: string;
  definition: string;
  plain_english: string;
};

export type PfqCoreContentBlock = {
  outcome_code: string;
  outcome_title: string;
  key_takeaway: string;
  body_markdown: string;
  watch_for: string;
  /** Optional — diagrams decision pending; treat as absent for now. */
  diagrams?: unknown;
};

export type PfqMisconception = {
  wrong: string;
  right: string;
};

export type PfqMemoryAid = {
  type: string;
  acronym: string;
  expansion: string;
};

/** Learner-safe lesson body — no source_confidence. */
export type PfqObjectiveLesson = {
  objective_number: number;
  objective_code: string;
  title: string;
  day: 1 | 2;
  apm_learning_objective: string;
  learning_outcomes: string[];
  exam_coverage_note: string;
  source_ref: string;
  competence_area: null | string;
  competence_area_note: string;
  authored_on: string;
  review_status: string;
  where_this_fits: string;
  key_definitions: PfqKeyDefinition[];
  core_content: PfqCoreContentBlock[];
  misconceptions: PfqMisconception[];
  memory_aids: PfqMemoryAid[];
  progress_checkpoint: string[];
};

export type PfqContentFailure = {
  code: string;
  message: string;
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function collectTextStrings(lesson: PfqObjectiveLesson): string[] {
  const out: string[] = [
    lesson.where_this_fits,
    ...lesson.progress_checkpoint,
  ];
  for (const d of lesson.key_definitions) {
    out.push(d.term, d.definition, d.plain_english);
  }
  for (const block of lesson.core_content) {
    out.push(
      block.outcome_title,
      block.key_takeaway,
      block.body_markdown,
      block.watch_for,
    );
  }
  for (const m of lesson.misconceptions) {
    out.push(m.wrong, m.right);
  }
  for (const a of lesson.memory_aids) {
    out.push(a.acronym, a.expansion);
  }
  return out;
}

export function validatePfqObjectiveLesson(
  raw: unknown,
  fileLabel: string,
): { lesson: PfqObjectiveLesson | null; failures: PfqContentFailure[] } {
  const failures: PfqContentFailure[] = [];
  if (!raw || typeof raw !== "object") {
    return {
      lesson: null,
      failures: [
        { code: "not_object", message: `${fileLabel}: root must be an object` },
      ],
    };
  }
  const o = raw as Record<string, unknown>;

  const requiredStringKeys = [
    "objective_code",
    "title",
    "apm_learning_objective",
    "exam_coverage_note",
    "source_ref",
    "competence_area_note",
    "authored_on",
    "review_status",
    "where_this_fits",
  ] as const;

  for (const key of requiredStringKeys) {
    if (!isNonEmptyString(o[key])) {
      failures.push({
        code: "missing_field",
        message: `${fileLabel}: missing or empty ${key}`,
      });
    }
  }

  for (const section of [
    "key_definitions",
    "misconceptions",
    "memory_aids",
    "progress_checkpoint",
    "core_content",
    "learning_outcomes",
  ] as const) {
    if (!Array.isArray(o[section]) || (o[section] as unknown[]).length === 0) {
      failures.push({
        code: "missing_section",
        message: `${fileLabel}: missing non-empty ${section}`,
      });
    }
  }

  if (!("source_confidence" in o) || !Array.isArray(o.source_confidence)) {
    failures.push({
      code: "missing_section",
      message: `${fileLabel}: missing source_confidence (internal, still required in file)`,
    });
  }

  if (!("where_this_fits" in o) || !isNonEmptyString(o.where_this_fits)) {
    failures.push({
      code: "missing_section",
      message: `${fileLabel}: missing where_this_fits`,
    });
  }

  const objective_number = Number(o.objective_number);
  if (!Number.isInteger(objective_number) || objective_number < 1 || objective_number > 10) {
    failures.push({
      code: "bad_objective",
      message: `${fileLabel}: objective_number must be 1–10`,
    });
  }

  const day = Number(o.day);
  if (day !== 1 && day !== 2) {
    failures.push({
      code: "bad_day",
      message: `${fileLabel}: day must be 1 or 2`,
    });
  }

  // competence_area is deliberately null — allow null only.
  if (o.competence_area !== null && o.competence_area !== undefined) {
    if (typeof o.competence_area !== "string") {
      failures.push({
        code: "competence_area",
        message: `${fileLabel}: competence_area must be null (or string if handbook ever maps it)`,
      });
    }
  }

  const learning_outcomes = Array.isArray(o.learning_outcomes)
    ? (o.learning_outcomes as unknown[]).map(String)
    : [];
  const core_content = Array.isArray(o.core_content)
    ? (o.core_content as Record<string, unknown>[])
    : [];

  const coreCodes = core_content.map((b) => String(b.outcome_code ?? ""));
  const loSet = new Set(learning_outcomes);
  const coreSet = new Set(coreCodes);
  if (
    loSet.size !== learning_outcomes.length ||
    coreSet.size !== coreCodes.length ||
    loSet.size !== coreSet.size ||
    [...loSet].some((c) => !coreSet.has(c))
  ) {
    failures.push({
      code: "outcome_mismatch",
      message: `${fileLabel}: learning_outcomes must match core_content[].outcome_code exactly`,
    });
  }

  for (const block of core_content) {
    for (const key of [
      "outcome_code",
      "outcome_title",
      "key_takeaway",
      "body_markdown",
      "watch_for",
    ] as const) {
      if (!isNonEmptyString(block[key])) {
        failures.push({
          code: "core_field",
          message: `${fileLabel}: core_content missing ${key}`,
        });
      }
    }
    if (
      isNonEmptyString(block.body_markdown) &&
      BOLD_MD_RE.test(block.body_markdown)
    ) {
      failures.push({
        code: "bold_markdown",
        message: `${fileLabel}: ${block.outcome_code} body_markdown contains ** (bold not used in core content)`,
      });
    }
  }

  if (failures.length > 0) {
    return { lesson: null, failures };
  }

  const lesson: PfqObjectiveLesson = {
    objective_number,
    objective_code: String(o.objective_code),
    title: String(o.title),
    day: day as 1 | 2,
    apm_learning_objective: String(o.apm_learning_objective),
    learning_outcomes,
    exam_coverage_note: String(o.exam_coverage_note),
    source_ref: String(o.source_ref),
    competence_area:
      o.competence_area === null || o.competence_area === undefined
        ? null
        : String(o.competence_area),
    competence_area_note: String(o.competence_area_note),
    authored_on: String(o.authored_on),
    review_status: String(o.review_status),
    where_this_fits: String(o.where_this_fits),
    key_definitions: (o.key_definitions as PfqKeyDefinition[]).map((d) => ({
      term: String(d.term),
      definition: String(d.definition),
      plain_english: String(d.plain_english),
    })),
    core_content: core_content.map((b) => ({
      outcome_code: String(b.outcome_code),
      outcome_title: String(b.outcome_title),
      key_takeaway: String(b.key_takeaway),
      body_markdown: String(b.body_markdown),
      watch_for: String(b.watch_for),
      ...(b.diagrams !== undefined ? { diagrams: b.diagrams } : {}),
    })),
    misconceptions: (o.misconceptions as PfqMisconception[]).map((m) => ({
      wrong: String(m.wrong),
      right: String(m.right),
    })),
    memory_aids: (o.memory_aids as PfqMemoryAid[]).map((a) => ({
      type: String(a.type),
      acronym: String(a.acronym),
      expansion: String(a.expansion),
    })),
    progress_checkpoint: (o.progress_checkpoint as string[]).map(String),
  };

  for (const text of collectTextStrings(lesson)) {
    if (EM_DASH_RE.test(text)) {
      failures.push({
        code: "em_dash",
        message: `${fileLabel}: em dash (U+2014) found in learner-facing copy`,
      });
      break;
    }
  }

  // Re-check bold on assembled body (already checked above).
  if (failures.length > 0) {
    return { lesson: null, failures };
  }

  return { lesson, failures: [] };
}

export function validatePfqLessonCorpus(
  lessons: PfqObjectiveLesson[],
): PfqContentFailure[] {
  const failures: PfqContentFailure[] = [];
  if (lessons.length !== 10) {
    failures.push({
      code: "file_count",
      message: `Expected 10 objective files, got ${lessons.length}`,
    });
  }

  const allCodes = lessons.flatMap((l) =>
    l.core_content.map((b) => b.outcome_code),
  );
  const found = new Set(allCodes);
  const expected = new Set(PFQ_EXPECTED_OUTCOMES);

  for (const code of expected) {
    if (!found.has(code)) {
      failures.push({
        code: "missing_outcome",
        message: `Missing outcome ${code} across lesson corpus`,
      });
    }
  }
  for (const code of found) {
    if (!expected.has(code as (typeof PFQ_EXPECTED_OUTCOMES)[number])) {
      failures.push({
        code: "extra_outcome",
        message: `Unexpected outcome ${code} in lesson corpus`,
      });
    }
  }
  if (allCodes.length !== found.size) {
    failures.push({
      code: "duplicate_outcome",
      message: "Duplicate outcome_code across lesson files",
    });
  }

  for (const lesson of lessons) {
    const meta = PFQ_OBJECTIVES.find(
      (o) => o.objective === lesson.objective_number,
    );
    if (meta && meta.day !== lesson.day) {
      failures.push({
        code: "day_mismatch",
        message: `Objective ${lesson.objective_number}: day ${lesson.day} ≠ syllabus day ${meta.day}`,
      });
    }
  }

  return failures;
}

function loadRawObjective(n: number): unknown {
  const padded = String(n).padStart(2, "0");
  const path = join(LESSONS_DIR, `objective-${padded}.json`);
  if (!existsSync(path)) {
    throw new Error(`PFQ lesson file missing: ${path}`);
  }
  return JSON.parse(readFileSync(path, "utf8"));
}

function loadAllLessonsOrThrow(): PfqObjectiveLesson[] {
  if (!existsSync(LESSONS_DIR)) {
    throw new Error(`PFQ lessons directory missing: ${LESSONS_DIR}`);
  }

  const files = readdirSync(LESSONS_DIR).filter((f) =>
    /^objective-\d{2}\.json$/.test(f),
  );
  if (files.length !== 10) {
    throw new Error(
      `PFQ lessons: expected 10 objective-XX.json files, found ${files.length}`,
    );
  }

  const lessons: PfqObjectiveLesson[] = [];
  const allFailures: PfqContentFailure[] = [];

  for (let n = 1; n <= 10; n += 1) {
    const raw = loadRawObjective(n);
    const { lesson, failures } = validatePfqObjectiveLesson(
      raw,
      `objective-${String(n).padStart(2, "0")}.json`,
    );
    allFailures.push(...failures);
    if (lesson) lessons.push(lesson);
  }

  allFailures.push(...validatePfqLessonCorpus(lessons));

  if (allFailures.length > 0) {
    const msg = allFailures.map((f) => `  [${f.code}] ${f.message}`).join("\n");
    throw new Error(`PFQ lesson content invalid:\n${msg}`);
  }

  return lessons.sort((a, b) => a.objective_number - b.objective_number);
}

/** Validated corpus — throws at import/build time if malformed. */
export const PFQ_LESSONS: readonly PfqObjectiveLesson[] =
  loadAllLessonsOrThrow();

export function getPfqLesson(objective: number): PfqObjectiveLesson | null {
  return PFQ_LESSONS.find((l) => l.objective_number === objective) ?? null;
}
