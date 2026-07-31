import type { SupabaseClient } from "@supabase/supabase-js";
import type { Course } from "@/types/database";
import type {
  CaseStudy,
  ExamSession,
  FeatureEntitlement,
  LessonBody,
  MockAttempt,
  MockExamConfig,
  MockExamSet,
  MockExamSetSummary,
  MockExamTier,
  PublicMockQuestion,
  PmqLesson,
  PmqQuestion,
  PmqSection,
  SectionProgress,
  UserCourseStats,
} from "@/types/pmq";
import {
  getDayForLo,
  PMQ_COURSE_ID,
  PMQ_SECTION_COUNT,
  PMQ_SLUG,
} from "./constants";
import { PMQ_PAID_TIERS, toTier, type PmqTier } from "./tiers";
import { SLY_UNLOCK_PRICE_CENTS } from "@/lib/tutor/constants";
import { getLoReachedCountFromProgress, LO_STAGE_COUNT } from "./lo-stages";
import {
  loadLoPageFromJson,
  loadMockQuestionsFromJson,
  loadPracticeSetCountFromJson,
  loadQuizSetFromJson,
  loadSectionsFromJson,
  mergeSections,
} from "./content-fallback";
import {
  isPracticeQuizContext,
  totalSetsFromContexts,
} from "./quiz-sets";
import {
  expireBreakIfNeeded,
  isMockExamReady,
  liteMockExamConfig,
  questionsForTier,
} from "./mock-domain";

export async function getPmqCourse(supabase: SupabaseClient): Promise<Course | null> {
  const { data } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", PMQ_SLUG)
    .single();

  return (data as Course | null) ?? null;
}

export async function getPmqSections(
  supabase: SupabaseClient,
): Promise<PmqSection[]> {
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("course_id", PMQ_COURSE_ID)
    .order("day")
    .order("order_index");

  if (error) throw error;
  const dbSections = (data ?? []) as PmqSection[];
  const sections =
    dbSections.length >= PMQ_SECTION_COUNT
      ? dbSections
      : mergeSections(dbSections, loadSectionsFromJson());
  return sections.map(withCanonicalDay);
}

function withCanonicalDay(section: PmqSection): PmqSection {
  const day = getDayForLo(section.order_index);
  return day === section.day ? section : { ...section, day };
}

export async function getPmqLoPageData(
  supabase: SupabaseClient,
  loNumber: number,
): Promise<{
  section: PmqSection;
  lesson: PmqLesson;
  body: LessonBody;
  questions: PmqQuestion[];
} | null> {
  const { data: section, error: sectionError } = await supabase
    .from("sections")
    .select("*")
    .eq("course_id", PMQ_COURSE_ID)
    .eq("order_index", loNumber)
    .maybeSingle();

  if (sectionError) throw sectionError;
  if (!section) {
    return loadLoPageFromJson(loNumber);
  }

  const [{ data: lesson, error: lessonError }, { data: questions, error: questionsError }] =
    await Promise.all([
      supabase
        .from("lessons")
        .select("*")
        .eq("section_id", section.id)
        .eq("lesson_type", "content")
        .order("order_index")
        .limit(1)
        .maybeSingle(),
      supabase
        .from("questions")
        .select("*")
        .eq("section_id", section.id)
        .eq("context", "practice_quiz"),
    ]);

  if (lessonError) throw lessonError;
  if (questionsError) throw questionsError;
  if (!lesson) return loadLoPageFromJson(loNumber);

  const sortedQuestions = [...(questions ?? [])].sort((a, b) => {
    const num = (id: string) => parseInt(id.replace(/\D/g, "") || "0", 10);
    return num(a.external_id) - num(b.external_id);
  });

  return {
    section: withCanonicalDay(section as PmqSection),
    lesson: lesson as PmqLesson,
    body: lesson.body as LessonBody,
    questions: sortedQuestions as PmqQuestion[],
  };
}

export async function getPmqQuizSetQuestions(
  supabase: SupabaseClient,
  sectionId: string,
  context: string,
  loNumber?: number,
): Promise<PmqQuestion[]> {
  // Pure JSON sections (no DB) — load from lo*.json.
  if (sectionId.startsWith("json-")) {
    return loNumber != null ? loadQuizSetFromJson(loNumber, context) : [];
  }

  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("section_id", sectionId)
    .eq("context", context);

  if (error) {
    console.error("quiz set questions query failed:", error.message);
    return [];
  }

  return [...(data ?? [])].sort((a, b) => {
    const num = (id: string) => parseInt(id.replace(/\D/g, "") || "0", 10);
    return num(a.external_id) - num(b.external_id);
  }) as PmqQuestion[];
}

/**
 * Highest practice set number available for this LO section
 * (1 = free practice_quiz only; 3 = classic; 7+ = widened banks).
 *
 * Inventory is public metadata — free users must see locked Set 2…N pills
 * even when RLS hides paid question rows from their session client. Prefer
 * service-role count, then fall back to the user client, then JSON, and take
 * the max so neither path can under-count.
 */
export async function getPmqPracticeSetCount(
  supabase: SupabaseClient,
  sectionId: string,
  loNumber?: number,
): Promise<number> {
  if (sectionId.startsWith("json-")) {
    if (loNumber == null) return 1;
    return loadPracticeSetCountFromJson(loNumber);
  }

  async function countFrom(client: SupabaseClient): Promise<number | null> {
    const { data, error } = await client
      .from("questions")
      .select("context")
      .eq("section_id", sectionId);

    if (error) {
      console.error("practice set count query failed:", error.message);
      return null;
    }
    return Math.max(
      1,
      totalSetsFromContexts((data ?? []).map((r) => r.context)),
    );
  }

  let dbTotal = 1;
  try {
    const { createServiceClient } = await import("@/lib/supabase/admin");
    const adminTotal = await countFrom(createServiceClient());
    if (adminTotal != null) {
      dbTotal = adminTotal;
    } else {
      const userTotal = await countFrom(supabase);
      if (userTotal != null) dbTotal = userTotal;
    }
  } catch {
    const userTotal = await countFrom(supabase);
    if (userTotal != null) dbTotal = userTotal;
  }

  const jsonTotal =
    loNumber != null ? loadPracticeSetCountFromJson(loNumber) : 1;
  return Math.max(1, dbTotal, jsonTotal);
}

export async function getAiTutorEntitlement(
  supabase: SupabaseClient,
  userId: string,
  courseId: string = PMQ_COURSE_ID,
): Promise<FeatureEntitlement | null> {
  const { data, error } = await supabase
    .from("feature_entitlements")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .in("feature", PMQ_PAID_TIERS)
    .maybeSingle();

  if (error) {
    console.error("feature_entitlements query failed:", error.message);
    return null;
  }
  return (data as FeatureEntitlement | null) ?? null;
}

/**
 * The user's tier for this course — the entry point every gate should use.
 *
 * Returns `starter` for signed-out users, users with no row, and any row whose
 * `feature` isn't recognized. Failing closed is deliberate: a database blip or a
 * stray value must never hand someone paid content. See src/lib/pmq/tiers.ts for
 * what each tier unlocks.
 */
export async function getPmqTier(
  supabase: SupabaseClient,
  userId: string | null | undefined,
  courseId: string = PMQ_COURSE_ID,
): Promise<PmqTier> {
  if (!userId) return "starter";
  const entitlement = await getAiTutorEntitlement(supabase, userId, courseId);
  return toTier(entitlement?.feature);
}

export async function getSectionProgress(
  supabase: SupabaseClient,
  userId: string,
  sectionId: string,
): Promise<SectionProgress | null> {
  const { data, error } = await supabase
    .from("section_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("section_id", sectionId)
    .maybeSingle();

  if (error) {
    console.error("section_progress query failed:", error.message);
    return null;
  }
  return (data as SectionProgress | null) ?? null;
}

const ZERO_COURSE_STATS: UserCourseStats = {
  total_xp: 0,
  current_streak: 0,
  longest_streak: 0,
  last_activity_date: null,
};

export async function getUserCourseStats(
  supabase: SupabaseClient,
  userId: string,
  courseId: string = PMQ_COURSE_ID,
): Promise<UserCourseStats> {
  const { data, error } = await supabase
    .from("user_course_stats")
    .select("total_xp, current_streak, longest_streak, last_activity_date")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (error) {
    console.error("user_course_stats query failed:", error.message);
    return ZERO_COURSE_STATS;
  }

  if (!data) return ZERO_COURSE_STATS;

  return {
    total_xp: data.total_xp ?? 0,
    current_streak: data.current_streak ?? 0,
    longest_streak: data.longest_streak ?? 0,
    last_activity_date: data.last_activity_date ?? null,
  };
}

export async function getSectionAttemptCount(
  supabase: SupabaseClient,
  userId: string,
  sectionId: string,
): Promise<number> {
  const { data: sectionQuestions, error: questionsError } = await supabase
    .from("questions")
    .select("id")
    .eq("section_id", sectionId)
    .eq("context", "practice_quiz");

  if (questionsError) {
    console.error("section questions query failed:", questionsError.message);
    return 0;
  }

  if (!sectionQuestions?.length) return 0;

  const questionIds = sectionQuestions.map((q) => q.id);

  const { data: attempts, error: attemptsError } = await supabase
    .from("attempts")
    .select("question_id")
    .eq("user_id", userId)
    .eq("context", "practice_quiz")
    .in("question_id", questionIds);

  if (attemptsError) {
    console.error("section attempts query failed:", attemptsError.message);
    return 0;
  }

  return new Set((attempts ?? []).map((a) => a.question_id)).size;
}

export type LoQuizPriorAttempt = {
  submittedAnswer: string | Record<string, string>;
  isCorrect: boolean | null;
};

/** Latest practice attempt per question for this LO (all practice sets). One-shot. */
export async function getLoQuizPriorAttempts(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
  loCode: string,
): Promise<Record<string, LoQuizPriorAttempt>> {
  const { data, error } = await supabase
    .from("attempts")
    .select("question_id, submitted_answer, is_correct, attempted_at, context")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("learning_objective", loCode)
    .or("context.eq.practice_quiz,context.like.quiz_set_%")
    .order("attempted_at", { ascending: true });

  if (error) {
    console.error("lo quiz prior attempts query failed:", error.message);
    return {};
  }

  const map: Record<string, LoQuizPriorAttempt> = {};
  for (const row of data ?? []) {
    if (!row.question_id || row.submitted_answer == null) continue;
    if (row.context && !isPracticeQuizContext(row.context)) continue;
    map[row.question_id] = {
      submittedAnswer: row.submitted_answer as string | Record<string, string>,
      isCorrect: row.is_correct,
    };
  }
  return map;
}

/** XP from correct practise answers: 10 each. Scope to one LO or whole course. */
export async function getPractiseQuizXp(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
  loCode?: string,
): Promise<number> {
  let query = supabase
    .from("attempts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("is_correct", true)
    .or("context.eq.practice_quiz,context.like.quiz_set_%");

  if (loCode) {
    query = query.eq("learning_objective", loCode);
  }

  const { count, error } = await query;

  if (error) {
    console.error("practise quiz xp query failed:", error.message);
    return 0;
  }

  return (count ?? 0) * 10;
}

/**
 * Overall course progress = average of every LO's own pathway progress
 * (0–100 each, from `getLoReachedCountFromProgress` — 7 equally-weighted
 * stages: Orient/Learn/Video/Audio/Apply/Quiz/Checkpoint), not a binary
 * count of fully-sealed LOs. An LO with no `section_progress` row at all
 * (never started) contributes 0, same as before. `completedCount` keeps
 * its original meaning (fully sealed LOs) for callers that gate on
 * "all 24 done" (e.g. course-complete checks) — only `percent` changed.
 */
export async function getCourseCompletion(
  supabase: SupabaseClient,
  userId: string,
  courseId: string = PMQ_COURSE_ID,
): Promise<{
  completedCount: number;
  totalCount: number;
  percent: number;
  /**
   * Same figure as `percent` but un-rounded (e.g. 7.738…). One pathway stage
   * is only 100/168 ≈ 0.595%, so rounding here quantises away the very steps
   * we want the header bar to animate through. Display components round at
   * the last moment; anything that *animates* should use this.
   */
  percentExact: number;
}> {
  const { data, error } = await supabase
    .from("section_progress")
    .select(
      "completed_at, quiz_completed_at, orient_reached_at, learn_reached_at, video_reached_at, audio_reached_at, apply_reached_at",
    )
    .eq("user_id", userId)
    .eq("course_id", courseId);

  if (error) {
    console.error("course completion query failed:", error.message);
    return {
      completedCount: 0,
      totalCount: PMQ_SECTION_COUNT,
      percent: 0,
      percentExact: 0,
    };
  }

  const rows = data ?? [];
  const completedCount = rows.filter((r) => r.completed_at != null).length;
  const reachedSum = rows.reduce(
    (sum, row) => sum + getLoReachedCountFromProgress(row),
    0,
  );
  const percentExact =
    (reachedSum / (PMQ_SECTION_COUNT * LO_STAGE_COUNT)) * 100;

  return {
    completedCount,
    totalCount: PMQ_SECTION_COUNT,
    percent: Math.round(percentExact),
    percentExact,
  };
}

/**
 * Per-section pathway-reached count (0…LO_STAGE_COUNT), keyed by
 * `section_id`, for every section the user has a `section_progress` row
 * for. Missing sections mean 0 reached (never started) — feeds the LO-list
 * progress pies in `PmqDayPlan`. DB-only; the client-only sessionStorage
 * count this replaced has been removed entirely (see lo-stages.ts).
 */
export async function getLoStageReachedMap(
  supabase: SupabaseClient,
  userId: string,
  courseId: string = PMQ_COURSE_ID,
): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("section_progress")
    .select(
      "section_id, completed_at, quiz_completed_at, orient_reached_at, learn_reached_at, video_reached_at, audio_reached_at, apply_reached_at",
    )
    .eq("user_id", userId)
    .eq("course_id", courseId);

  if (error) {
    console.error("lo stage reached map query failed:", error.message);
    return {};
  }

  const map: Record<string, number> = {};
  for (const row of data ?? []) {
    if (!row.section_id) continue;
    map[row.section_id] = getLoReachedCountFromProgress(row);
  }
  return map;
}

/** Section IDs the user has marked complete (`completed_at` set). */
export async function getCompletedSectionIds(
  supabase: SupabaseClient,
  userId: string,
  courseId: string = PMQ_COURSE_ID,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("section_progress")
    .select("section_id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .not("completed_at", "is", null);

  if (error) {
    console.error("completed section ids query failed:", error.message);
    return [];
  }

  return (data ?? [])
    .map((row) => row.section_id as string | null)
    .filter((id): id is string => !!id);
}

export function groupSectionsByDay(
  sections: PmqSection[],
): Map<number, PmqSection[]> {
  const grouped = new Map<number, PmqSection[]>();

  for (const section of sections) {
    const day = getDayForLo(section.order_index);
    const daySections = grouped.get(day) ?? [];
    daySections.push(section);
    grouped.set(day, daySections);
  }

  for (const [day, daySections] of grouped) {
    daySections.sort((a, b) => a.order_index - b.order_index);
    grouped.set(day, daySections);
  }

  return grouped;
}

export function getAiTutorPriceCents(_course: Course): number {
  // Premium bundle is locked at £8.00 (SLY_UNLOCK_PRICE_CENTS). Keep reading
  // course for call-site compatibility; amount lives in one constant.
  return SLY_UNLOCK_PRICE_CENTS;
}

export function getMockExamConfig(
  course: Course,
): MockExamConfig {
  const config = course.exam_config as { mock_exam?: MockExamConfig };
  return (
    config?.mock_exam ?? {
      total_marks: 90,
      pass_mark: 54,
      pass_percentage: 60,
      time_allowed_minutes: 150,
      break_after_question: 20,
      break_duration_minutes: 30,
    }
  );
}

export function getCaseStudy(course: Course): CaseStudy | null {
  const config = course.exam_config as { case_study?: CaseStudy };
  return config?.case_study ?? null;
}

export async function getMockExamQuestions(
  supabase: SupabaseClient,
  examSet: MockExamSet,
): Promise<PmqQuestion[]> {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("course_id", PMQ_COURSE_ID)
    .eq("context", "mock_exam")
    .eq("exam_set", examSet)
    .order("part")
    .order("position");

  if (error) throw error;
  const dbQuestions = (data ?? []) as PmqQuestion[];
  if (dbQuestions.length > 0) return dbQuestions;
  if (examSet !== 1) return [];
  return loadMockQuestionsFromJson().map((question) => ({
    ...question,
    exam_set: 1 as const,
  }));
}

export async function getLiteMockExamQuestions(
  supabase: SupabaseClient,
): Promise<PmqQuestion[]> {
  return questionsForTier(await getMockExamQuestions(supabase, 1), "lite");
}

export function getLiteMockExamConfig(
  questions: PmqQuestion[],
): MockExamConfig {
  return liteMockExamConfig(questions);
}

export function toPublicMockQuestions(
  questions: PmqQuestion[],
): PublicMockQuestion[] {
  return questions.map(
    ({
      correct_answer: _correctAnswer,
      model_answer: _modelAnswer,
      marking_guide: _markingGuide,
      explanation: _explanation,
      ...question
    }) => question,
  );
}

export async function getMockUnlockStatus(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ completedCount: number; unlocked: boolean }> {
  // Progress count kept for dashboards/stats; mock exam is no longer gated
  // on completing all 24 LOs (decision 2026-07-12).
  const { count, error } = await supabase
    .from("section_progress")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("course_id", PMQ_COURSE_ID)
    .not("quiz_completed_at", "is", null);

  if (error) throw error;
  return {
    completedCount: count ?? 0,
    unlocked: true,
  };
}

export async function getActiveExamSession(
  supabase: SupabaseClient,
  userId: string,
  tier: MockExamTier,
  examSet?: MockExamSet,
): Promise<ExamSession | null> {
  let query = supabase
    .from("exam_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", PMQ_COURSE_ID)
    .eq("tier", tier)
    .order("started_at", { ascending: true })
    .limit(1);

  if (examSet != null) query = query.eq("exam_set", examSet);
  const { data, error } = await query.maybeSingle();

  if (error) throw error;
  if (!data) return null;

  // Self-heals a session left stuck in "break" past its 30-minute window
  // (lazy, on-read — see expireBreakIfNeeded in mock-domain.ts).
  const reconciled = await expireBreakIfNeeded(
    supabase,
    userId,
    PMQ_COURSE_ID,
    data as ExamSession & { id: string; status: string; break_ends_at: string | null },
  );
  return reconciled as ExamSession;
}

export async function getExamSessionFlags(
  supabase: SupabaseClient,
  userId: string,
  sessionId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("exam_question_flags")
    .select("question_id")
    .eq("user_id", userId)
    .eq("exam_session_id", sessionId);

  if (error) throw error;
  return (data ?? []).map((row) => row.question_id as string);
}

export async function getMockExamSetSummaries(
  supabase: SupabaseClient,
  userId: string,
): Promise<MockExamSetSummary[]> {
  let inventoryClient = supabase;
  try {
    const { createServiceClient } = await import("@/lib/supabase/admin");
    inventoryClient = createServiceClient();
  } catch {
    // User client remains a safe fallback; unavailable rows render Coming soon.
  }

  const [{ data: inventory, error: inventoryError }, { data: sessions, error: sessionsError }] =
    await Promise.all([
      inventoryClient
        .from("questions")
        .select("exam_set, marks")
        .eq("course_id", PMQ_COURSE_ID)
        .eq("context", "mock_exam")
        .in("exam_set", [1, 2, 3, 4]),
      supabase
        .from("exam_sessions")
        .select(
          "id, exam_set, status, passed, finalized_at, started_at, break_ends_at, current_part, part_1_deadline_at, part_1_submitted_at, part_2_deadline_at, part_2_submitted_at, deadline_at, config_snapshot",
        )
        .eq("user_id", userId)
        .eq("course_id", PMQ_COURSE_ID)
        .in("exam_set", [1, 2, 3, 4])
        .order("started_at", { ascending: false }),
    ]);

  if (inventoryError) {
    console.error("mock exam inventory query failed:", inventoryError.message);
  }
  if (sessionsError) {
    console.error("mock exam summaries query failed:", sessionsError.message);
  }

  // Self-heal any session stuck past a deadline (unattended Part 1, expired
  // break, unattended Part 2, or the 180-minute hard cap) before it's used
  // to compute what the exam selector shows (see expireBreakIfNeeded in
  // mock-domain.ts — same lazy on-read reconciliation as
  // getActiveExamSession).
  const reconcilableStatuses = ["active", "break", "self_assessing", "grading"];
  const reconciledSessions = await Promise.all(
    (sessions ?? []).map(async (session) => {
      if (!reconcilableStatuses.includes(session.status)) return session;
      const reconciled = await expireBreakIfNeeded(
        supabase,
        userId,
        PMQ_COURSE_ID,
        session as typeof session & {
          id: string;
          started_at: string;
          break_ends_at: string | null;
        },
      );
      return {
        ...session,
        status: reconciled.status,
        break_ends_at: reconciled.break_ends_at,
        part_1_deadline_at: reconciled.part_1_deadline_at,
        part_2_deadline_at: reconciled.part_2_deadline_at,
        current_part: reconciled.current_part,
      };
    }),
  );

  const openStatuses = new Set([
    "active",
    "break",
    "self_assessing",
    "grading",
  ]);
  return ([1, 2, 3, 4] as MockExamSet[]).map((examSet) => {
    const questionCount = (inventory ?? []).filter(
      (row) => row.exam_set === examSet,
    ).length;
    const totalMarks = (inventory ?? [])
      .filter((row) => row.exam_set === examSet)
      .reduce((sum, row) => sum + (row.marks ?? 0), 0);
    const setSessions = reconciledSessions.filter(
      (session) => session.exam_set === examSet,
    );
    const active = setSessions.find((session) =>
      openStatuses.has(session.status),
    );
    const completed = setSessions.filter(
      (session) => session.status === "finalized",
    );
    const latest = completed[0];
    const currentPart =
      active?.current_part === 2 ? 2 : active?.current_part === 1 ? 1 : null;
    const activePartDeadlineAt =
      active == null
        ? null
        : currentPart === 2
          ? (active.part_2_deadline_at as string | null)
          : ((active.part_1_deadline_at as string | null) ??
            (active.deadline_at as string | null));
    return {
      examSet,
      questionCount,
      totalMarks,
      ready: isMockExamReady(questionCount, totalMarks),
      activeSessionId: active?.id ?? null,
      latestResult: latest ? (latest.passed ? "passed" : "refer") : null,
      hasPassed: completed.some((session) => session.passed),
      latestStatus:
        ((active?.status ?? setSessions[0]?.status) as MockExamSetSummary["latestStatus"]) ??
        null,
      activePartDeadlineAt,
      activeBreakEndsAt: (active?.break_ends_at as string | null) ?? null,
      activeCurrentPart: currentPart,
    };
  });
}

export async function getExamSessionAttempts(
  supabase: SupabaseClient,
  sessionId: string,
): Promise<MockAttempt[]> {
  const { data, error } = await supabase
    .from("attempts")
    .select(
      "id, question_id, submitted_answer, is_correct, ai_score, ai_feedback, ai_rubric_evidence, ai_model, ai_input_tokens, ai_output_tokens, ai_cost_gbp_cents, grading_status, grading_error, grading_attempts, graded_at, attempted_at",
    )
    .eq("exam_session_id", sessionId)
    .eq("context", "mock_exam");

  if (error) throw error;
  return (data ?? []) as MockAttempt[];
}
