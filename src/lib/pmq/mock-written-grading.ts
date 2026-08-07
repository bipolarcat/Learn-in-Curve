import type { SupabaseClient } from "@supabase/supabase-js";
import { callExamGrader } from "@/lib/pmq/callExamGrader";
import { PMQ_COURSE_ID } from "@/lib/pmq/constants";
import { getPmqTier } from "@/lib/pmq/queries";
import {
  canAccessMockExam,
  type PmqMockExamSet,
} from "@/lib/pmq/tiers";
import {
  PAID_MOCK_GRADING_BUDGET_GBP_CENTS,
  STARTER_MOCK_GRADING_BUDGET_GBP_CENTS,
} from "@/lib/tutor/constants";
import type { MockExamConfig, MockExamSet, MockExamTier, PmqQuestion } from "@/types/pmq";

export type GradeableExamSession = {
  id: string;
  exam_set: MockExamSet | number;
  tier: MockExamTier | string;
  config_snapshot: MockExamConfig & {
    exam_set?: MockExamSet | number;
    question_ids?: string[];
  };
};

async function loadSessionQuestion(
  supabase: SupabaseClient,
  session: GradeableExamSession,
  questionId: string,
): Promise<PmqQuestion | null> {
  const questionIds = session.config_snapshot.question_ids ?? [];
  if (!questionIds.includes(questionId)) return null;
  const { data } = await supabase
    .from("questions")
    .select("*")
    .eq("id", questionId)
    .eq("course_id", PMQ_COURSE_ID)
    .eq("context", "mock_exam")
    .eq("exam_set", session.exam_set)
    .maybeSingle();
  return (data as PmqQuestion | null) ?? null;
}

/**
 * AI-grade pending/error written attempts for a session. Shared by finalize
 * and terminate-on-expiry. On budget/rubric failure marks the attempt error
 * and continues; callers decide whether that blocks finalization.
 */
export async function gradeWrittenAttempts(
  supabase: SupabaseClient,
  userId: string,
  session: GradeableExamSession,
): Promise<{ ok: true } | { error: string; failures?: string[] }> {
  const isStarterExam = session.exam_set === 1;

  let budgetGbpCents: number;
  let spentGbpCents: number;
  const exhaustedMessage = isStarterExam
    ? "The free grading budget for this exam has been used up."
    : "Your Pro fair-usage credit is exhausted.";

  if (isStarterExam) {
    budgetGbpCents = STARTER_MOCK_GRADING_BUDGET_GBP_CENTS;
    const { data: priorGrading } = await supabase
      .from("attempts")
      .select("ai_cost_gbp_cents")
      .eq("exam_session_id", session.id)
      .eq("user_id", userId);
    spentGbpCents = (priorGrading ?? []).reduce(
      (sum, row) => sum + ((row.ai_cost_gbp_cents as number | null) ?? 0),
      0,
    );
  } else {
    if (session.tier !== "full") return { ok: true as const };

    const userTier = await getPmqTier(supabase, userId, PMQ_COURSE_ID);
    if (!canAccessMockExam(userTier, session.exam_set as PmqMockExamSet)) {
      return { error: "Your plan doesn't include this mock exam." };
    }

    budgetGbpCents = PAID_MOCK_GRADING_BUDGET_GBP_CENTS;
    const { data: priorGrading } = await supabase
      .from("attempts")
      .select("ai_cost_gbp_cents")
      .eq("exam_session_id", session.id)
      .eq("user_id", userId);
    spentGbpCents = (priorGrading ?? []).reduce(
      (sum, row) => sum + ((row.ai_cost_gbp_cents as number | null) ?? 0),
      0,
    );
  }

  if (spentGbpCents >= budgetGbpCents) {
    return { error: exhaustedMessage };
  }

  const { data: attempts, error } = await supabase
    .from("attempts")
    .select("id, question_id, submitted_answer, grading_status, grading_attempts")
    .eq("exam_session_id", session.id)
    .eq("user_id", userId)
    .in("grading_status", ["pending", "error"]);
  if (error) return { error: error.message };

  const failures: string[] = [];
  for (const attempt of attempts ?? []) {
    if (spentGbpCents >= budgetGbpCents) {
      failures.push(attempt.question_id);
      await supabase
        .from("attempts")
        .update({
          grading_status: "error",
          grading_error: exhaustedMessage,
        })
        .eq("id", attempt.id);
      continue;
    }
    const question = await loadSessionQuestion(
      supabase,
      session,
      attempt.question_id,
    );
    if (
      !question ||
      typeof attempt.submitted_answer !== "string" ||
      !question.marking_guide ||
      !question.model_answer
    ) {
      failures.push(attempt.question_id);
      await supabase
        .from("attempts")
        .update({
          grading_status: "error",
          grading_error: "This question has no complete marking rubric.",
        })
        .eq("id", attempt.id);
      continue;
    }

    await supabase
      .from("attempts")
      .update({
        grading_status: "grading",
        grading_error: null,
        grading_attempts: (attempt.grading_attempts ?? 0) + 1,
      })
      .eq("id", attempt.id);
    try {
      const grade = await callExamGrader({
        prompt: question.prompt,
        submittedAnswer: attempt.submitted_answer,
        markingGuide: question.marking_guide,
        modelAnswer: question.model_answer,
        maxMarks: question.marks,
      });
      await supabase
        .from("attempts")
        .update({
          ai_score: grade.score,
          ai_feedback: grade.feedback,
          ai_rubric_evidence: grade.rubricEvidence,
          ai_model: grade.model,
          ai_input_tokens: grade.inputTokens,
          ai_output_tokens: grade.outputTokens,
          ai_cost_gbp_cents: grade.costGbpCents,
          is_correct: grade.score >= question.marks * 0.5,
          grading_status: "graded",
          grading_error: null,
          graded_at: new Date().toISOString(),
        })
        .eq("id", attempt.id);
      spentGbpCents += grade.costGbpCents;
    } catch (gradingError) {
      failures.push(attempt.question_id);
      await supabase
        .from("attempts")
        .update({
          grading_status: "error",
          grading_error:
            gradingError instanceof Error
              ? gradingError.message
              : "Marking failed. Please retry.",
        })
        .eq("id", attempt.id);
    }
  }
  return failures.length
    ? { error: "Some written answers could not be marked.", failures }
    : { ok: true as const };
}

/** Best-effort grade for terminate paths — never throws; failures stay as error rows. */
export async function gradeWrittenAttemptsForTerminate(
  supabase: SupabaseClient,
  userId: string,
  session: GradeableExamSession,
): Promise<void> {
  await gradeWrittenAttempts(supabase, userId, session);
}
