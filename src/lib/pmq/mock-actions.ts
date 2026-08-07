"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isDemoSkipAuth } from "@/lib/demo";
import {
  deadlineFromStart,
  finalizationDisposition,
  isMockExamReady,
  isDeadlineExpired,
  isReadableMockStatus,
  isValidMockExamSelection,
  mockPartForQuestion,
  partDurationMinutes,
} from "@/lib/pmq/mock-domain";
import { expireBreakIfNeeded, expireSession } from "@/lib/pmq/mock-terminate";
import {
  scoreAutoMarkedQuestion,
  scoreMockSession,
  type MockScoreBreakdown,
} from "@/lib/pmq/mock-scoring";
import { gradeWrittenAttempts } from "@/lib/pmq/mock-written-grading";
import {
  getAiTutorEntitlement,
  getAiTutorPriceCents,
  getMockExamConfig,
  getMockExamQuestions,
  getPmqCourse,
  getPmqTier,
} from "@/lib/pmq/queries";
import {
  canAccessMockExam,
  tierForMockExam,
  type PmqMockExamSet,
} from "@/lib/pmq/tiers";
import { PMQ_COURSE_ID, pmqMockHref } from "@/lib/pmq/constants";
import type {
  MockExamConfig,
  MockExamReview,
  MockExamSet,
  MockExamTier,
  PmqQuestion,
} from "@/types/pmq";

type SessionRow = {
  id: string;
  user_id: string;
  course_id: string;
  tier: MockExamTier;
  exam_set: MockExamSet;
  status: string;
  started_at: string;
  deadline_at: string;
  break_started_at: string | null;
  break_ends_at: string | null;
  submitted_at: string | null;
  total_score: number | null;
  max_score: number | null;
  passed: boolean | null;
  current_part: 1 | 2;
  current_question_id: string | null;
  part_1_started_at: string | null;
  part_1_deadline_at: string | null;
  part_1_submitted_at: string | null;
  part_2_started_at: string | null;
  part_2_deadline_at: string | null;
  part_2_submitted_at: string | null;
  config_snapshot: MockExamConfig & {
    exam_set: MockExamSet;
    question_ids: string[];
  };
};

async function authenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

async function ownedSession(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  sessionId: string,
): Promise<SessionRow | null> {
  const { data } = await supabase
    .from("exam_sessions")
    .select(
      "id, user_id, course_id, tier, exam_set, status, started_at, deadline_at, break_started_at, break_ends_at, submitted_at, total_score, max_score, passed, current_part, current_question_id, part_1_started_at, part_1_deadline_at, part_1_submitted_at, part_2_started_at, part_2_deadline_at, part_2_submitted_at, config_snapshot",
    )
    .eq("id", sessionId)
    .eq("user_id", userId)
    .eq("course_id", PMQ_COURSE_ID)
    .maybeSingle();
  const session = (data as SessionRow | null) ?? null;
  if (!session) return null;
  // Self-heal a session left stuck past a deadline before any action reads
  // or mutates it — same lazy on-read reconciliation getActiveExamSession
  // and getMockExamSetSummaries already apply (see expireBreakIfNeeded in
  // mock-terminate.ts). Every server action in this file goes through
  // ownedSession, so this covers all of them in one place.
  return expireBreakIfNeeded(supabase, userId, PMQ_COURSE_ID, session);
}

function answerIsValid(
  question: PmqQuestion,
  answer: string | Record<string, string>,
): boolean {
  if (question.question_type === "select_from_list") {
    return (
      typeof answer === "object" &&
      !Array.isArray(answer) &&
      Object.keys((question.options as Record<string, string[]>) ?? {}).every(
        (key) => typeof answer[key] === "string" && answer[key].trim().length > 0,
      )
    );
  }
  return typeof answer === "string" && answer.trim().length > 0;
}

async function loadSessionQuestion(
  supabase: Awaited<ReturnType<typeof createClient>>,
  session: SessionRow,
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
  const question = data as PmqQuestion | null;
  return question ?? null;
}

export async function startMockExamSession(input: {
  tier: MockExamTier;
  examSet: MockExamSet;
}) {
  const { tier, examSet } = input;
  if (!isValidMockExamSelection(tier, examSet)) {
    return { error: "That mock exam tier and paper do not match." };
  }
  const { supabase, user } = await authenticatedUser();
  if (!user) {
    if (isDemoSkipAuth() && tier === "lite" && examSet === 1) {
      return { demo: true as const };
    }
    return { error: "Sign in to start this mock exam." };
  }

  const course = await getPmqCourse(supabase);
  if (!course) return { error: "Course not found." };

  // Gate on the PAPER, not the lite/full tier. "full" buckets papers 2, 3 and 4
  // together, so an entitlement check here would let a Pro buyer start paper 4 —
  // which belongs to AI Pro. Every paper is AI-graded, so this gate is also the
  // spend cap: it's the only thing stopping a Pro user from running more grading
  // passes than £8 covers.
  const userTier = await getPmqTier(supabase, user.id, course.id);
  if (!canAccessMockExam(userTier, examSet)) {
    return {
      error:
        tierForMockExam(examSet) === "ai_pro"
          ? "Mock exam 4 is part of the AI Pro Bundle."
          : "The Pro Bundle is required for this mock exam.",
    };
  }

  const { data: claimed } = await supabase
    .from("exam_sessions")
    .select("id, deadline_at, exam_set, status")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .eq("exam_set", examSet)
    .order("started_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (claimed?.id) {
    return {
      sessionId: claimed.id,
      deadlineAt: claimed.deadline_at,
      status: claimed.status,
      alreadyClaimed: true as const,
    };
  }

  if (tier === "full") {
    const { data: existing } = await supabase
      .from("exam_sessions")
      .select("id, deadline_at, exam_set")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .eq("tier", tier)
      .in("status", ["active", "break", "self_assessing", "grading"])
      .maybeSingle();
    if (existing?.id && existing.exam_set !== examSet) {
      return {
        error: `Finish Exam ${existing.exam_set} before opening Exam ${examSet}.`,
        conflictExamSet: existing.exam_set as MockExamSet,
      };
    }
  }

  const questions = await getMockExamQuestions(supabase, examSet);
  const totalMarks = questions.reduce(
    (sum, question) => sum + question.marks,
    0,
  );
  if (!isMockExamReady(questions.length, totalMarks)) {
    return {
      error: `Exam ${examSet} is not ready. It must contain exactly 40 questions totaling 90 marks.`,
      notReady: true as const,
    };
  }
  const config = getMockExamConfig(course);
  const startedAt = new Date().toISOString();
  const partMinutes = partDurationMinutes(config);
  const deadlineAt = deadlineFromStart(startedAt, partMinutes);
  const snapshot = {
    ...config,
    part_duration_minutes: partMinutes,
    exam_set: examSet,
    question_ids: questions.map((question) => question.id),
    premium_price_cents: getAiTutorPriceCents(course),
  };

  const { data, error } = await supabase
    .from("exam_sessions")
    .insert({
      user_id: user.id,
      course_id: course.id,
      tier,
      exam_set: examSet,
      status: "active",
      started_at: startedAt,
      deadline_at: deadlineAt,
      current_part: 1,
      current_question_id: questions[0]?.id ?? null,
      part_1_started_at: startedAt,
      part_1_deadline_at: deadlineAt,
      time_limit_minutes: config.time_allowed_minutes,
      config_snapshot: snapshot,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };
  return { sessionId: data.id, deadlineAt };
}

export async function submitMockAttempt(input: {
  sessionId: string;
  questionId: string;
  submittedAnswer: string | Record<string, string>;
}) {
  const { supabase, user } = await authenticatedUser();
  if (!user) {
    if (isDemoSkipAuth()) return { ok: true as const };
    return { error: "Not signed in." };
  }

  const session = await ownedSession(supabase, user.id, input.sessionId);
  if (!session || session.status !== "active") {
    return { error: "This exam is no longer accepting answers." };
  }
  const partDeadline =
    session.current_part === 1
      ? session.part_1_deadline_at
      : session.part_2_deadline_at;
  if (!partDeadline || isDeadlineExpired(partDeadline)) {
    return { error: "Time expired.", expired: true as const };
  }

  const question = await loadSessionQuestion(
    supabase,
    session,
    input.questionId,
  );
  if (!question || !answerIsValid(question, input.submittedAnswer)) {
    return { error: "That answer is not valid for this exam question." };
  }
  const questionPart = mockPartForQuestion(question);
  const partSubmitted =
    questionPart === 1
      ? session.part_1_submitted_at
      : session.part_2_submitted_at;
  if (questionPart !== session.current_part || partSubmitted) {
    return { error: "That part is locked and can no longer be edited." };
  }

  const written =
    question.question_type === "short_answer" ||
    question.question_type === "long_answer";
  const isCorrect = written
    ? null
    : scoreAutoMarkedQuestion(question, input.submittedAnswer);
  const { error } = await supabase.from("attempts").upsert(
    {
      user_id: user.id,
      question_id: question.id,
      course_id: PMQ_COURSE_ID,
      learning_objective: question.learning_objective ?? "mock",
      context: "mock_exam",
      submitted_answer: input.submittedAnswer,
      exam_session_id: session.id,
      is_correct: isCorrect,
      ai_score: null,
      ai_feedback: null,
      ai_rubric_evidence: null,
      grading_status: written ? "pending" : "not_required",
      grading_error: null,
      attempted_at: new Date().toISOString(),
    },
    { onConflict: "exam_session_id,question_id" },
  );
  if (error) return { error: error.message };
  return { ok: true as const };
}

export async function setMockCurrentQuestion(input: {
  sessionId: string;
  questionId: string;
}) {
  const { supabase, user } = await authenticatedUser();
  if (!user) return { error: "Not signed in." };
  const session = await ownedSession(supabase, user.id, input.sessionId);
  if (!session || session.status !== "active") {
    return { error: "This exam is not accepting navigation changes." };
  }
  const deadline =
    session.current_part === 1
      ? session.part_1_deadline_at
      : session.part_2_deadline_at;
  if (!deadline || isDeadlineExpired(deadline)) {
    return { error: "Time expired for this part." };
  }
  const question = await loadSessionQuestion(
    supabase,
    session,
    input.questionId,
  );
  if (!question || mockPartForQuestion(question) !== session.current_part) {
    return { error: "That question is not available in the current part." };
  }
  const { error } = await supabase
    .from("exam_sessions")
    .update({ current_question_id: question.id })
    .eq("id", session.id)
    .eq("user_id", user.id)
    .eq("status", "active")
    .eq("current_part", session.current_part);
  return error ? { error: error.message } : { ok: true as const };
}

export async function toggleMockQuestionFlag(input: {
  sessionId: string;
  questionId: string;
  flagged: boolean;
}) {
  const { supabase, user } = await authenticatedUser();
  if (!user) return { error: "Not signed in." };
  const session = await ownedSession(supabase, user.id, input.sessionId);
  if (!session || session.status !== "active") {
    return { error: "Flags can only be changed in the active part." };
  }
  const deadline =
    session.current_part === 1
      ? session.part_1_deadline_at
      : session.part_2_deadline_at;
  if (!deadline || isDeadlineExpired(deadline)) {
    return { error: "Time expired for this part." };
  }
  const question = await loadSessionQuestion(
    supabase,
    session,
    input.questionId,
  );
  if (!question || mockPartForQuestion(question) !== session.current_part) {
    return { error: "That question is not available in the current part." };
  }
  if (input.flagged) {
    const { error } = await supabase.from("exam_question_flags").upsert(
      {
        exam_session_id: session.id,
        question_id: question.id,
        user_id: user.id,
      },
      { onConflict: "exam_session_id,question_id" },
    );
    return error ? { error: error.message } : { ok: true as const };
  }
  const { error } = await supabase
    .from("exam_question_flags")
    .delete()
    .eq("exam_session_id", session.id)
    .eq("question_id", question.id)
    .eq("user_id", user.id);
  return error ? { error: error.message } : { ok: true as const };
}

export async function submitMockPart(input: {
  sessionId: string;
  part: 1 | 2;
}) {
  const { supabase, user } = await authenticatedUser();
  if (!user) return { error: "Not signed in." };
  const session = await ownedSession(supabase, user.id, input.sessionId);
  if (
    !session ||
    session.status !== "active" ||
    session.current_part !== input.part
  ) {
    return { error: "That exam part is no longer active." };
  }
  const now = new Date().toISOString();

  if (input.part === 1) {
    const breakMinutes = session.config_snapshot.break_duration_minutes ?? 30;
    const breakEndsAt = deadlineFromStart(now, breakMinutes);
    const { data, error } = await supabase
      .from("exam_sessions")
      .update({
        status: "break",
        part_1_submitted_at: now,
        break_started_at: now,
        break_ends_at: breakEndsAt,
        current_question_id: null,
      })
      .eq("id", session.id)
      .eq("user_id", user.id)
      .eq("status", "active")
      .eq("current_part", 1)
      .is("part_1_submitted_at", null)
      .select("id")
      .maybeSingle();
    if (error) return { error: error.message };
    if (!data) return { error: "Part 1 has already been submitted." };
    return { ok: true as const, breakEndsAt };
  }

  const { data, error } = await supabase
    .from("exam_sessions")
    .update({
      part_2_submitted_at: now,
      submitted_at: now,
      current_question_id: null,
    })
    .eq("id", session.id)
    .eq("user_id", user.id)
    .eq("status", "active")
    .eq("current_part", 2)
    .is("part_2_submitted_at", null)
    .select("id")
    .maybeSingle();
  if (error) return { error: error.message };
  if (!data) return { error: "Part 2 has already been submitted." };
  return finalizeMockExam({ sessionId: session.id });
}

export async function startMockPartTwo(sessionId: string) {
  const { supabase, user } = await authenticatedUser();
  if (!user) return { error: "Not signed in." };
  const session = await ownedSession(supabase, user.id, sessionId);
  if (
    !session ||
    session.status !== "break" ||
    !session.part_1_submitted_at
  ) {
    return session?.status === "abandoned" || session?.status === "expired"
      ? { error: "Break time ran out — this exam is now complete." }
      : { error: "Break unavailable." };
  }
  const startedAt = new Date().toISOString();
  const deadlineAt = deadlineFromStart(
    startedAt,
    partDurationMinutes(session.config_snapshot),
  );
  const secondPartQuestionId =
    session.config_snapshot.question_ids[
      session.config_snapshot.break_after_question ?? 20
    ] ?? null;
  const { data, error } = await supabase
    .from("exam_sessions")
    .update({
      status: "active",
      current_part: 2,
      current_question_id: secondPartQuestionId,
      part_2_started_at: startedAt,
      part_2_deadline_at: deadlineAt,
      deadline_at: deadlineAt,
    })
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .eq("course_id", PMQ_COURSE_ID)
    .eq("status", "break")
    .is("part_2_started_at", null)
    .select("id")
    .maybeSingle();
  if (!data && !error) {
    const refreshed = await ownedSession(supabase, user.id, sessionId);
    if (refreshed?.part_2_deadline_at) {
      return {
        ok: true as const,
        deadlineAt: refreshed.part_2_deadline_at,
      };
    }
  }
  return error
    ? { error: error.message }
    : { ok: true as const, deadlineAt };
}

/** Backwards-compatible aliases while callers migrate to explicit part actions. */
export async function beginMockBreak(sessionId: string) {
  return submitMockPart({ sessionId, part: 1 });
}

export async function endMockBreak(sessionId: string) {
  return startMockPartTwo(sessionId);
}

export async function finalizeMockExam(input: { sessionId: string }) {
  const { supabase, user } = await authenticatedUser();
  if (!user) {
    if (isDemoSkipAuth()) return { ok: true as const, demo: true as const };
    return { error: "Not signed in." };
  }
  const session = await ownedSession(supabase, user.id, input.sessionId);
  if (!session) return { error: "Exam session not found." };
  const disposition = finalizationDisposition(session.status);
  if (disposition === "idempotent") {
    return {
      ok: true as const,
      totalScore: session.total_score ?? 0,
      passed: session.passed ?? false,
    };
  }
  if (disposition === "blocked") {
    return { error: "This exam cannot be finalized." };
  }
  if (
    ["active", "break"].includes(session.status) &&
    !session.part_2_submitted_at
  ) {
    return { error: "Submit Part 2 before finalizing this exam." };
  }

  if (session.status !== "grading") {
    const { data: claimed, error: claimError } = await supabase
      .from("exam_sessions")
      .update({ status: "grading" })
      .eq("id", session.id)
      .eq("status", session.status)
      .select("id")
      .maybeSingle();
    if (claimError) return { error: claimError.message };
    if (!claimed) {
      return {
        error: "This exam is already being finalized.",
        gradingPending: true as const,
      };
    }
  } else {
    const { count } = await supabase
      .from("attempts")
      .select("id", { count: "exact", head: true })
      .eq("exam_session_id", session.id)
      .eq("grading_status", "grading");
    if ((count ?? 0) > 0) {
      return {
        error: "Written answers are already being marked.",
        gradingPending: true as const,
      };
    }
  }
  const grading = await gradeWrittenAttempts(supabase, user.id, session);
  if ("error" in grading) return { ...grading, gradingPending: true as const };

  const { data: attempts, error: attemptsError } = await supabase
    .from("attempts")
    .select("question_id, is_correct, ai_score, grading_status")
    .eq("exam_session_id", session.id)
    .eq("user_id", user.id)
    .eq("context", "mock_exam");
  if (attemptsError) return { error: attemptsError.message };

  const questionIds = session.config_snapshot.question_ids ?? [];
  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("id, marks, question_type, part")
    .in("id", questionIds);
  if (questionsError) return { error: questionsError.message };

  const config = session.config_snapshot;
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
    config.total_marks,
  );
  const totalScore = breakdown.totalScore;
  const passed = totalScore >= config.pass_mark;
  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("exam_sessions")
    .update({
      status: "finalized",
      submitted_at: now,
      finalized_at: now,
      total_score: totalScore,
      max_score: config.total_marks,
      passed,
    })
    .eq("id", session.id)
    .eq("user_id", user.id)
    .eq("status", "grading");
  if (updateError) return { error: updateError.message };

  if (passed) {
    const { data: certificate } = await supabase
      .from("certificates")
      .select("id")
      .eq("exam_session_id", session.id)
      .maybeSingle();
    if (!certificate) {
      await supabase.from("certificates").insert({
        user_id: user.id,
        course_id: PMQ_COURSE_ID,
        exam_session_id: session.id,
      });
    }
  }
  revalidatePath(pmqMockHref(session.tier, session.exam_set));
  return { ok: true as const, totalScore, passed, breakdown };
}

export async function getFinalizedMockReview(
  sessionId: string,
): Promise<{
  reviews?: MockExamReview[];
  breakdown?: MockScoreBreakdown;
  status?: string;
  error?: string;
}> {
  const { supabase, user } = await authenticatedUser();
  if (!user) return { error: "Not signed in." };
  const session = await ownedSession(supabase, user.id, sessionId);
  if (!session || !isReadableMockStatus(session.status)) {
    return { error: "Results aren't ready for this exam yet." };
  }
  const questionIds = session.config_snapshot.question_ids ?? [];
  const [{ data: questions, error: questionsError }, { data: attempts, error: attemptsError }] =
    await Promise.all([
      supabase
        .from("questions")
        .select(
          "id, prompt, question_type, options, part, position, marks, correct_answer, model_answer, marking_guide",
        )
        .eq("course_id", PMQ_COURSE_ID)
        .eq("context", "mock_exam")
        .eq("exam_set", session.exam_set)
        .in("id", questionIds)
        .order("part")
        .order("position"),
      supabase
        .from("attempts")
        .select(
          "question_id, submitted_answer, is_correct, ai_score, ai_feedback, grading_status",
        )
        .eq("exam_session_id", session.id)
        .eq("user_id", user.id),
    ]);
  if (questionsError) return { error: questionsError.message };
  if (attemptsError) return { error: attemptsError.message };
  const attemptByQuestion = new Map(
    (attempts ?? []).map((attempt) => [attempt.question_id, attempt]),
  );
  const breakdown = scoreMockSession(
    (questions ?? []).map((q) => ({
      id: q.id as string,
      marks: (q.marks as number) ?? 0,
      question_type: q.question_type as string,
      part: (q.part as number | null) ?? null,
    })),
    (attempts ?? []).map((a) => ({
      question_id: a.question_id as string,
      is_correct: (a.is_correct as boolean | null) ?? null,
      ai_score: (a.ai_score as number | null) ?? null,
      grading_status: (a.grading_status as string | null) ?? null,
    })),
    session.config_snapshot.total_marks,
  );
  return {
    status: session.status,
    breakdown,
    reviews: (questions ?? []).map((question) => {
      const attempt = attemptByQuestion.get(question.id);
      return {
        questionId: question.id,
        prompt: question.prompt ?? "",
        questionType:
          (question.question_type as PmqQuestion["question_type"]) ??
          "multiple_choice",
        options: (question.options as PmqQuestion["options"]) ?? null,
        part: question.part === 2 ? 2 : 1,
        position: question.position ?? 0,
        marks: question.marks ?? 0,
        submittedAnswer:
          (attempt?.submitted_answer as
            | string
            | Record<string, string>
            | null) ?? null,
        correctAnswer:
          (question.correct_answer as
            | string
            | Record<string, string>
            | null) ?? null,
        modelAnswer: question.model_answer ?? null,
        markingGuide: question.marking_guide ?? null,
        score: attempt?.ai_score ?? (attempt?.is_correct ? question.marks ?? 0 : 0),
        feedback: attempt?.ai_feedback ?? null,
      };
    }),
  };
}

export async function getMockExamResultSummary(sessionId: string): Promise<{
  status?: string;
  totalScore?: number;
  maxScore?: number;
  passed?: boolean;
  breakdown?: MockScoreBreakdown;
  error?: string;
}> {
  const { supabase, user } = await authenticatedUser();
  if (!user) return { error: "Not signed in." };
  const session = await ownedSession(supabase, user.id, sessionId);
  if (!session || !isReadableMockStatus(session.status)) {
    return { error: "Results aren't ready for this exam yet." };
  }
  const questionIds = session.config_snapshot.question_ids ?? [];
  const [{ data: questions }, { data: attempts }] = await Promise.all([
    supabase
      .from("questions")
      .select("id, marks, question_type, part")
      .in("id", questionIds),
    supabase
      .from("attempts")
      .select("question_id, is_correct, ai_score, grading_status")
      .eq("exam_session_id", session.id)
      .eq("user_id", user.id),
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
    session.config_snapshot.total_marks,
  );
  return {
    status: session.status,
    totalScore: session.total_score ?? breakdown.totalScore,
    maxScore: session.max_score ?? breakdown.maxScore,
    passed: session.passed ?? false,
    breakdown,
  };
}

export async function abandonMockExamSession(sessionId: string) {
  const { supabase, user } = await authenticatedUser();
  if (!user) return { ok: true as const };
  const session = await ownedSession(supabase, user.id, sessionId);
  if (!session) return { ok: true as const };
  const openStatuses = ["active", "break", "self_assessing", "grading"];
  if (!openStatuses.includes(session.status)) {
    return {
      ok: true as const,
      totalScore: session.total_score ?? 0,
      passed: session.passed ?? false,
      status: session.status,
    };
  }
  const updated = await expireSession(
    supabase,
    user.id,
    PMQ_COURSE_ID,
    session,
    openStatuses,
    "abandoned",
  );
  revalidatePath(pmqMockHref());
  return {
    ok: true as const,
    totalScore: updated.total_score ?? 0,
    passed: updated.passed ?? false,
    status: updated.status,
  };
}
