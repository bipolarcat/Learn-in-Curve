import type {
  MockExamConfig,
  MockExamSet,
  MockExamSetSummary,
  MockExamTier,
  PmqQuestion,
} from "@/types/pmq";

export const MOCK_EXAM_QUESTION_COUNT = 40;
export const MOCK_EXAM_TOTAL_MARKS = 90;
export const MOCK_EXAM_PART_QUESTION_COUNT = 20;
export const MOCK_EXAM_PART_MINUTES = 75;
/** 75 (Part 1) + 30 (break) + 75 (Part 2). Hard backstop — see expireBreakIfNeeded. */
export const MOCK_EXAM_TOTAL_BUDGET_MINUTES = 180;

/** Results / review are readable once scoring has completed. */
export const READABLE_MOCK_STATUSES = [
  "finalized",
  "expired",
  "abandoned",
] as const;

export type ReadableMockStatus = (typeof READABLE_MOCK_STATUSES)[number];

export function isReadableMockStatus(
  status: string,
): status is ReadableMockStatus {
  return (READABLE_MOCK_STATUSES as readonly string[]).includes(status);
}

export function parseMockExamTier(value: string | undefined): MockExamTier {
  return value === "full" ? "full" : "lite";
}

export function parseMockExamSet(value: string | undefined): MockExamSet | null {
  const parsed = Number(value ?? "1");
  return parsed === 1 || parsed === 2 || parsed === 3 || parsed === 4
    ? parsed
    : null;
}

export function tierForExamSet(examSet: MockExamSet): MockExamTier {
  return examSet === 1 ? "lite" : "full";
}

export function isValidMockExamSelection(
  tier: MockExamTier,
  examSet: MockExamSet,
): boolean {
  return tier === tierForExamSet(examSet);
}

export function parseMockExamSelection(
  tierValue: string | undefined,
  examValue: string | undefined,
): { tier: MockExamTier; examSet: MockExamSet } | null {
  const examSet = parseMockExamSet(examValue);
  if (!examSet) return null;
  const tier = parseMockExamTier(tierValue);
  return isValidMockExamSelection(tier, examSet) ? { tier, examSet } : null;
}

/**
 * @deprecated Collapses Pro and AI Pro into one "has entitlement" boolean, so
 * it cannot express "Pro gets papers 2-3 but not 4". Use `canAccessMockExam`
 * from ./tiers.ts, which gates on the actual paper. Kept only until the last
 * call site is migrated.
 */
export function canAccessMockTier(
  tier: MockExamTier,
  hasEntitlement: boolean,
): boolean {
  return tier === "lite" || hasEntitlement;
}

// NOTE: paper-level access lives in ./tiers.ts (`canAccessMockExam`), not here.
// `MockExamTier` ("lite" | "full") predates the three-tier ladder and buckets
// papers 2, 3 and 4 together — exactly the distinction that now matters, since
// Pro buys papers 2-3 and only AI Pro adds paper 4. This module is also imported
// directly by `node --test`, which can't resolve the `@/` alias or extensionless
// local imports, so it deliberately stays free of value imports.

export function questionsForTier(
  questions: PmqQuestion[],
  _tier: MockExamTier,
): PmqQuestion[] {
  return questions;
}

export function liteMockExamConfig(questions: PmqQuestion[]): MockExamConfig {
  const totalMarks = questions.reduce((sum, question) => sum + question.marks, 0);
  return {
    total_marks: totalMarks,
    pass_mark: Math.round(totalMarks * 0.6),
    pass_percentage: 60,
    time_allowed_minutes: 150,
    part_duration_minutes: MOCK_EXAM_PART_MINUTES,
    break_after_question: 20,
    break_duration_minutes: 30,
  };
}

export function isMockExamReady(
  questionCount: number,
  totalMarks: number = MOCK_EXAM_TOTAL_MARKS,
): boolean {
  return (
    questionCount === MOCK_EXAM_QUESTION_COUNT &&
    totalMarks === MOCK_EXAM_TOTAL_MARKS
  );
}

export function mockExamSelectorState(
  summary: MockExamSetSummary,
  hasEntitlement: boolean,
  activeExamSet: MockExamSet | null,
): { status: string; action: string; enabled: boolean } {
  if (!summary.ready) {
    return { status: "Coming soon", action: "Coming soon", enabled: false };
  }
  const status =
    summary.latestStatus === "break"
      ? "On break"
      : summary.latestStatus === "self_assessing"
        ? "Self-assessment"
        : summary.latestStatus === "grading"
          ? "Marking"
          : summary.latestStatus === "expired"
            ? "Time expired"
            : summary.latestStatus === "abandoned"
              ? "Ended early"
              : summary.latestStatus === "active" || summary.activeSessionId
                ? "In progress"
                : summary.hasPassed
                  ? "Passed"
                  : summary.latestResult === "refer"
                    ? "Completed · Refer"
                    : "Ready";
  if (!hasEntitlement) {
    return { status, action: "Pro required", enabled: false };
  }
  // A finalized/expired/abandoned exam set is a terminal, read-only outcome —
  // it isn't something the user could "start" or "resume," so another exam
  // set being active must never block it. Found 2026-07-29: this check ran
  // unconditionally, so a completed Exam 2 showed "Finish Exam 3 first"
  // while Exam 3 was in progress, instead of "View Exam 2 result." Only
  // exam sets the user could actually attempt (not yet started) get gated.
  const isTerminal =
    summary.latestStatus === "finalized" ||
    summary.latestStatus === "expired" ||
    summary.latestStatus === "abandoned";
  if (!isTerminal && activeExamSet != null && activeExamSet !== summary.examSet) {
    return {
      status,
      action: `Finish Exam ${activeExamSet} first`,
      enabled: false,
    };
  }
  return {
    status,
    action: isTerminal
      ? `View Exam ${summary.examSet} result →`
      : summary.activeSessionId
        ? `Resume Exam ${summary.examSet} →`
        : `Start Exam ${summary.examSet} →`,
    enabled: true,
  };
}

export function deadlineFromStart(
  startedAt: string,
  timeLimitMinutes: number,
): string {
  return new Date(
    new Date(startedAt).getTime() + timeLimitMinutes * 60_000,
  ).toISOString();
}

export function isDeadlineExpired(deadlineAt: string, now = Date.now()): boolean {
  return new Date(deadlineAt).getTime() <= now;
}

export function mockPartForQuestion(question: { part: number | null }): 1 | 2 {
  return question.part === 2 ? 2 : 1;
}

export function partDurationMinutes(config: MockExamConfig): number {
  return config.part_duration_minutes ?? Math.floor(config.time_allowed_minutes / 2);
}

export function overallSecondsRemaining(
  currentPart: 1 | 2,
  currentPartSeconds: number,
  partMinutes: number = MOCK_EXAM_PART_MINUTES,
): number {
  return Math.max(
    0,
    currentPartSeconds + (currentPart === 1 ? partMinutes * 60 : 0),
  );
}

export function formatExamTime(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(secs).padStart(2, "0");
  if (hours > 0) return `${hours}h ${mm}m ${ss}s`;
  return `${minutes}m ${ss}s`;
}

/** Full clock for overview console — always H:MM:SS. */
export function formatExamClock(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;
  return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function secondsUntilDeadline(iso: string | null, now = Date.now()): number {
  if (!iso) return 0;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - now) / 1000));
}

/**
 * Live remaining seconds for an in-progress mock on the overview console.
 * Active part → overall budget (current part + remaining part if any).
 * Break → break window. Marking / self-assessment → no timer.
 */
export function mockExamConsoleSecondsRemaining(
  summary: MockExamSetSummary,
  now = Date.now(),
): number | null {
  if (!summary.activeSessionId) return null;
  const status = summary.latestStatus;
  if (status === "break") {
    if (!summary.activeBreakEndsAt) return null;
    return secondsUntilDeadline(summary.activeBreakEndsAt, now);
  }
  if (status === "self_assessing" || status === "grading") return null;
  if (status !== "active" && status != null) return null;
  if (!summary.activePartDeadlineAt) return null;
  const part = summary.activeCurrentPart === 2 ? 2 : 1;
  const partSecs = secondsUntilDeadline(summary.activePartDeadlineAt, now);
  return overallSecondsRemaining(part, partSecs);
}

export function canFinalizeStatus(status: string): boolean {
  return (
    status === "active" ||
    status === "break" ||
    status === "self_assessing" ||
    status === "grading"
  );
}

export function finalizationDisposition(
  status: string,
): "run" | "idempotent" | "blocked" {
  if (status === "finalized") return "idempotent";
  return canFinalizeStatus(status) ? "run" : "blocked";
}
