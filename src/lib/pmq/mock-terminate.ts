import type { SupabaseClient } from "@supabase/supabase-js";
import type { MockExamConfig } from "@/types/pmq";
import {
  MOCK_EXAM_TOTAL_BUDGET_MINUTES,
  MOCK_EXAM_TOTAL_MARKS,
  deadlineFromStart,
  isDeadlineExpired,
} from "@/lib/pmq/mock-domain";
import {
  scoreMockSession,
  type MockScoreBreakdown,
} from "@/lib/pmq/mock-scoring";

const TERMINATE_GRADING_TIMEOUT_MS = 20_000;

type TerminableSession = {
  id: string;
  status: string;
  exam_set?: number | null;
  tier?: string | null;
  part_1_submitted_at?: string | null;
  part_2_submitted_at?: string | null;
  total_score?: number | null;
  max_score?: number | null;
  passed?: boolean | null;
  submitted_at?: string | null;
  finalized_at?: string | null;
  config_snapshot?:
    | (MockExamConfig & {
        exam_set?: number;
        question_ids?: string[];
      })
    | null;
};

export type SessionScorePreview = {
  breakdown: MockScoreBreakdown;
  passed: boolean;
};

/**
 * Read attempts/questions and compute the score expireSession would write.
 * No DB writes and no AI grading — ungradedWritten reflects current rows.
 */
export async function previewSessionScore(
  supabase: SupabaseClient,
  userId: string,
  _courseId: string,
  session: TerminableSession,
): Promise<SessionScorePreview> {
  const config = session.config_snapshot;
  const questionIds = config?.question_ids ?? [];
  const maxScore = config?.total_marks ?? MOCK_EXAM_TOTAL_MARKS;
  const passMark = config?.pass_mark ?? Math.round(maxScore * 0.6);

  const [{ data: questions }, { data: attempts }] = await Promise.all([
    questionIds.length
      ? supabase
          .from("questions")
          .select("id, marks, question_type, part")
          .in("id", questionIds)
      : Promise.resolve({
          data: [] as Array<{
            id: string;
            marks: number;
            question_type: string;
            part: number | null;
          }>,
        }),
    supabase
      .from("attempts")
      .select("question_id, is_correct, ai_score, grading_status")
      .eq("exam_session_id", session.id)
      .eq("user_id", userId),
  ]);

  const breakdown = scoreMockSession(
    (questions ?? []).map((q) => ({
      id: q.id as string,
      marks: q.marks as number,
      question_type: q.question_type as string,
      part: (q.part as number | null) ?? null,
    })),
    (attempts ?? []).map((a) => ({
      question_id: a.question_id as string,
      is_correct: (a.is_correct as boolean | null) ?? null,
      ai_score: (a.ai_score as number | null) ?? null,
      grading_status: (a.grading_status as string | null) ?? null,
    })),
    maxScore,
  );

  // D4: incomplete sittings never pass, regardless of marks earned.
  const bothPartsSubmitted = Boolean(
    session.part_1_submitted_at && session.part_2_submitted_at,
  );
  const passed = bothPartsSubmitted && breakdown.totalScore >= passMark;

  return { breakdown, passed };
}

/**
 * Score an incomplete sitting and write a terminal status (`expired` or
 * `abandoned`). Never issues a certificate. Grades pending written answers
 * best-effort (timeout fail-open) so page-load expiry cannot hang forever.
 */
export async function expireSession<T extends TerminableSession>(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
  session: T,
  fromStatuses: string[],
  terminalStatus: "expired" | "abandoned",
): Promise<T> {
  const config = session.config_snapshot;
  const questionIds = config?.question_ids ?? [];
  const examSet = session.exam_set ?? config?.exam_set ?? 1;
  const tier = session.tier ?? (examSet === 1 ? "lite" : "full");

  if (questionIds.length > 0) {
    try {
      const { gradeWrittenAttemptsForTerminate } = await import(
        "./mock-written-grading"
      );
      await Promise.race([
        gradeWrittenAttemptsForTerminate(supabase, userId, {
          id: session.id,
          exam_set: examSet,
          tier,
          config_snapshot: {
            ...(config as MockExamConfig),
            question_ids: questionIds,
            exam_set: examSet,
          },
        }),
        new Promise<never>((_, reject) => {
          setTimeout(
            () => reject(new Error("grading timeout")),
            TERMINATE_GRADING_TIMEOUT_MS,
          );
        }),
      ]);
    } catch {
      await supabase
        .from("attempts")
        .update({
          grading_status: "error",
          grading_error:
            "Marking timed out or failed when the exam ended.",
        })
        .eq("exam_session_id", session.id)
        .eq("user_id", userId)
        .in("grading_status", ["pending", "grading"]);
    }
  }

  const { breakdown, passed } = await previewSessionScore(
    supabase,
    userId,
    courseId,
    session,
  );

  const now = new Date().toISOString();
  const { data } = await supabase
    .from("exam_sessions")
    .update({
      status: terminalStatus,
      submitted_at: now,
      finalized_at: now,
      total_score: breakdown.totalScore,
      max_score: breakdown.maxScore,
      passed,
    })
    .eq("id", session.id)
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .in("status", fromStatuses)
    .select(
      "status, total_score, max_score, passed, finalized_at, submitted_at",
    )
    .maybeSingle();

  if (!data) return session;
  return {
    ...session,
    status: data.status as string,
    total_score: data.total_score as number | null,
    max_score: data.max_score as number | null,
    passed: data.passed as boolean | null,
    finalized_at: data.finalized_at as string | null,
    submitted_at: data.submitted_at as string | null,
  };
}

/**
 * Self-heals a session left stuck past a deadline in any open state. Three
 * things this catches, checked in order:
 *
 * 1. Hard 180-minute backstop (75 + 30 + 75) from `started_at`. No matter
 *    what state the session is stuck in — active, break, self_assessing,
 *    grading — once 180 minutes have passed since it started, it's
 *    expired. Added 2026-07-30 per explicit requirement: nothing should
 *    ever be able to run a sitting past its intended total budget again.
 *
 * 2. Part 1 left open past its own 75-minute deadline (tab closed, never
 *    clicked submit). Before this fix, nothing caught this server-side —
 *    reopening the exam let the client's own "time's up" handler call
 *    submitMockPart at click-time, which anchored break_started_at /
 *    break_ends_at to "now" instead of the deadline that had actually
 *    passed. That silently granted extra time (the exact bug reported
 *    2026-07-30: left mid-Part-1, came back later, got a fresh 30-minute
 *    break instead of an expired one). Fixed by transitioning to break
 *    here first, anchored to the true `part_1_deadline_at`, before the
 *    client ever gets a chance to run its own click-time logic.
 *
 * 3. Part 2 left open past its own 75-minute deadline — expires with a
 *    scored result (objective marks + best-effort written grading).
 *
 * Plus the original check this function started as: an unattended break
 * window (`break_ends_at` expired) expires rather than letting Part 2
 * start days later.
 *
 * This is a lazy, on-read check (no cron in this app) — a stuck session
 * only flips state the next time something touches it via one of this
 * function's call sites, not the instant a deadline elapses.
 *
 * Terminal state on clock expiry is `expired` (scored, never a certificate).
 * Manual abandon uses the same scorer with status `abandoned`.
 */
export async function expireBreakIfNeeded<
  T extends TerminableSession & {
    started_at: string;
    break_ends_at: string | null;
    current_part?: 1 | 2 | null;
    part_1_deadline_at?: string | null;
    part_2_deadline_at?: string | null;
  },
>(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
  session: T,
): Promise<T> {
  const openStatuses = ["active", "break", "self_assessing", "grading"];
  if (!openStatuses.includes(session.status)) return session;

  const now = Date.now();

  const hardDeadline =
    new Date(session.started_at).getTime() +
    MOCK_EXAM_TOTAL_BUDGET_MINUTES * 60_000;
  if (now >= hardDeadline) {
    return expireSession(
      supabase,
      userId,
      courseId,
      session,
      openStatuses,
      "expired",
    );
  }

  if (
    session.status === "active" &&
    session.current_part === 1 &&
    !session.part_1_submitted_at &&
    session.part_1_deadline_at &&
    isDeadlineExpired(session.part_1_deadline_at, now)
  ) {
    const breakMinutes = session.config_snapshot?.break_duration_minutes ?? 30;
    const breakEndsAt = deadlineFromStart(session.part_1_deadline_at, breakMinutes);
    const { data } = await supabase
      .from("exam_sessions")
      .update({
        status: "break",
        part_1_submitted_at: session.part_1_deadline_at,
        break_started_at: session.part_1_deadline_at,
        break_ends_at: breakEndsAt,
        current_question_id: null,
      })
      .eq("id", session.id)
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .eq("status", "active")
      .eq("current_part", 1)
      .is("part_1_submitted_at", null)
      .select("status, break_ends_at, part_1_submitted_at, break_started_at")
      .maybeSingle();
    if (data) {
      return {
        ...session,
        status: data.status as string,
        break_ends_at: data.break_ends_at as string,
        part_1_submitted_at: data.part_1_submitted_at as string,
        break_started_at: data.break_started_at as string,
      };
    }
    return session;
  }

  if (
    session.status === "active" &&
    session.current_part === 2 &&
    session.part_1_submitted_at &&
    !session.part_2_submitted_at &&
    session.part_2_deadline_at &&
    isDeadlineExpired(session.part_2_deadline_at, now)
  ) {
    return expireSession(
      supabase,
      userId,
      courseId,
      session,
      ["active"],
      "expired",
    );
  }

  if (
    session.status === "break" &&
    session.break_ends_at &&
    isDeadlineExpired(session.break_ends_at, now)
  ) {
    return expireSession(
      supabase,
      userId,
      courseId,
      session,
      ["break"],
      "expired",
    );
  }

  return session;
}

