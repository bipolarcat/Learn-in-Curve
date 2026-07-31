import type { SupabaseClient } from "@supabase/supabase-js";
import type { WeakArea } from "./buildSystemPrompt";
import type { ExamPaceSignal, MistakeDetail, SpacedReviewSignal } from "./types";
import { summarizeFairUsage } from "./fair-usage";
import { loadLoContent } from "./loadLoContent";

/** Contexts that count as "practice" for mistake recall — mock_exam is deliberately excluded (separate AI-graded flow, LIC-40). */
const PRACTICE_CONTEXT_FILTER = "context.eq.practice_quiz,context.like.quiz_set_%";

export type TutorMessageRow = {
  id: string;
  role: "user" | "assistant";
  content: string;
  learning_objective: string | null;
  rating: number | null;
  input_tokens: number | null;
  output_tokens: number | null;
  created_at: string;
};

export async function countUserMessages(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("tutor_messages")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("role", "user");

  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function fetchTutorMessages(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
): Promise<TutorMessageRow[]> {
  const { data, error } = await supabase
    .from("tutor_messages")
    .select(
      "id, role, content, learning_objective, rating, input_tokens, output_tokens, created_at",
    )
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as TutorMessageRow[];
}

export async function fetchTokenUsageRows(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
): Promise<{ input_tokens: number | null; output_tokens: number | null }[]> {
  const { data, error } = await supabase
    .from("tutor_messages")
    .select("input_tokens, output_tokens")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("role", "assistant");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function sumTutorCreditGbpCents(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("tutor_usage_credits")
    .select("credit_gbp_cents")
    .eq("user_id", userId)
    .eq("course_id", courseId);

  if (error) {
    // Migration not applied yet — treat as zero credits (legacy unlock fallback still works).
    console.error("tutor_usage_credits query failed:", error.message);
    return 0;
  }
  return (data ?? []).reduce(
    (sum, row) => sum + (row.credit_gbp_cents as number),
    0,
  );
}

export async function getAiTutorFairUsageSummary(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
  opts: { hasEntitlement?: boolean } = {},
) {
  const [rows, creditGbpCents] = await Promise.all([
    fetchTokenUsageRows(supabase, userId, courseId),
    sumTutorCreditGbpCents(supabase, userId, courseId),
  ]);
  return summarizeFairUsage(rows, creditGbpCents, {
    hasEntitlement: opts.hasEntitlement,
  });
}

export async function getWeakAreasForLo(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
  loNumber: number,
): Promise<WeakArea[]> {
  const lo = loadLoContent(loNumber);
  const loObjective = lo?.lo_code ?? `LO${loNumber}`;

  const { data, error } = await supabase
    .from("attempts")
    .select("learning_objective, is_correct")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("context", "practice_quiz")
    .eq("learning_objective", loObjective);

  if (error) throw new Error(error.message);

  const byLo = new Map<string, { wrong: number; total: number }>();
  for (const row of data ?? []) {
    const key = row.learning_objective ?? loObjective;
    const entry = byLo.get(key) ?? { wrong: 0, total: 0 };
    entry.total += 1;
    if (row.is_correct === false) entry.wrong += 1;
    byLo.set(key, entry);
  }

  return Array.from(byLo.entries()).map(([learningObjective, stats]) => ({
    learningObjective,
    wrongCount: stats.wrong,
    totalCount: stats.total,
  }));
}

/**
 * Recent wrong practice-quiz answers for this LO, with full question detail
 * (prompt, options, correct answer, what the learner actually submitted,
 * explanation) — not just a wrong/total count. Lets Sly say "you picked X
 * on the hybrid life-cycle question, but it's actually Y" instead of only
 * "you've struggled on this LO." Covers practice_quiz + quiz_set_N (the
 * Pro question bank) — mock_exam attempts are excluded, different flow.
 */
export async function getRecentMistakesForLo(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
  loNumber: number,
  limit = 5,
): Promise<MistakeDetail[]> {
  const lo = loadLoContent(loNumber);
  const loObjective = lo?.lo_code ?? `LO${loNumber}`;

  const { data: wrongAttempts, error } = await supabase
    .from("attempts")
    .select("question_id, submitted_answer, attempted_at")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("learning_objective", loObjective)
    .eq("is_correct", false)
    .or(PRACTICE_CONTEXT_FILTER)
    .order("attempted_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  if (!wrongAttempts?.length) return [];

  const questionIds = wrongAttempts
    .map((a) => a.question_id)
    .filter((id): id is string => !!id);

  if (!questionIds.length) return [];

  const { data: questions, error: qError } = await supabase
    .from("questions")
    .select("id, prompt, question_type, options, correct_answer, explanation")
    .in("id", questionIds);

  if (qError) throw new Error(qError.message);

  const byId = new Map((questions ?? []).map((q) => [q.id as string, q]));

  return wrongAttempts
    .map((a): MistakeDetail | null => {
      const q = byId.get(a.question_id as string);
      if (!q) return null;
      return {
        questionId: a.question_id as string,
        prompt: q.prompt as string,
        questionType: q.question_type as string,
        options: q.options,
        correctAnswer: q.correct_answer,
        submittedAnswer: a.submitted_answer,
        explanation: (q.explanation as string | null) ?? null,
        attemptedAt: a.attempted_at as string,
      };
    })
    .filter((m): m is MistakeDetail => m !== null);
}

export async function getWeakAreasForCourse(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
): Promise<WeakArea[]> {
  const { data, error } = await supabase
    .from("attempts")
    .select("learning_objective, is_correct")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("context", "practice_quiz");

  if (error) throw new Error(error.message);

  const byLo = new Map<string, { wrong: number; total: number }>();
  for (const row of data ?? []) {
    const key = row.learning_objective ?? "unknown";
    const entry = byLo.get(key) ?? { wrong: 0, total: 0 };
    entry.total += 1;
    if (row.is_correct === false) entry.wrong += 1;
    byLo.set(key, entry);
  }

  return Array.from(byLo.entries())
    .map(([learningObjective, stats]) => ({
      learningObjective,
      wrongCount: stats.wrong,
      totalCount: stats.total,
    }))
    .sort((a, b) => b.wrongCount - a.wrongCount);
}

export async function hasCourseCompletionSummary(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
  completionLo: string,
): Promise<boolean> {
  const { count, error } = await supabase
    .from("tutor_messages")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("learning_objective", completionLo)
    .eq("role", "assistant");

  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}

export type CourseCompletionReportRow = {
  id: string;
  user_id: string;
  course_id: string;
  per_lo: unknown;
  key_takeaways: unknown;
  weak_lo_notes: unknown;
  improvement_tips: unknown;
  pdf_storage_path: string | null;
  generated_at: string;
};

export async function getCourseCompletionReport(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
): Promise<CourseCompletionReportRow | null> {
  const { data, error } = await supabase
    .from("course_completion_reports")
    .select(
      "id, user_id, course_id, per_lo, key_takeaways, weak_lo_notes, improvement_tips, pdf_storage_path, generated_at",
    )
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as CourseCompletionReportRow | null) ?? null;
}

/** Lightweight existence check for dashboard / overview UI. */
export async function hasCourseCompletionReport(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
): Promise<boolean> {
  const { count, error } = await supabase
    .from("course_completion_reports")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("course_id", courseId);

  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}

export async function countQuizCompletedSections(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("section_progress")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .not("quiz_completed_at", "is", null);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

/**
 * Completed LOs in the order the learner actually finished them (not raw LO
 * number order) — `sections.order_index` doubles as the LO number in this
 * course. Used for both spaced-repetition eligibility and exam-pace timing.
 */
async function getCompletedLoTimeline(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
): Promise<{ loNumber: number; completedAt: string }[]> {
  const { data, error } = await supabase
    .from("section_progress")
    .select("quiz_completed_at, sections!inner(order_index)")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .not("quiz_completed_at", "is", null)
    .order("quiz_completed_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? [])
    .map((row) => {
      const section = Array.isArray(row.sections)
        ? row.sections[0]
        : row.sections;
      return {
        loNumber: section?.order_index as number | undefined,
        completedAt: row.quiz_completed_at as string,
      };
    })
    .filter(
      (row): row is { loNumber: number; completedAt: string } =>
        typeof row.loNumber === "number",
    );
}

/**
 * Spacing rule: a completed LO's mistakes become eligible for resurfacing
 * once 5 further LOs have been completed after it (by completion order, not
 * raw LO number, so it also works if the learner studies out of sequence).
 * Each source LO only ever fires once — tracked via `tutor_spaced_reviews`.
 * Returns null if nothing is eligible, or the eligible LO had no mistakes.
 */
export async function getEligibleSpacedReview(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
): Promise<SpacedReviewSignal | null> {
  const timeline = await getCompletedLoTimeline(supabase, userId, courseId);
  if (timeline.length < 6) return null; // need a source LO + 5 after it

  const { data: surfaced, error: surfacedError } = await supabase
    .from("tutor_spaced_reviews")
    .select("source_lo_number")
    .eq("user_id", userId)
    .eq("course_id", courseId);

  if (surfacedError) throw new Error(surfacedError.message);
  const alreadySurfaced = new Set(
    (surfaced ?? []).map((r) => r.source_lo_number as number),
  );

  for (let i = 0; i < timeline.length - 5; i++) {
    const candidate = timeline[i].loNumber;
    if (alreadySurfaced.has(candidate)) continue;

    const mistakes = await getRecentMistakesForLo(
      supabase,
      userId,
      courseId,
      candidate,
    );
    if (!mistakes.length) continue; // nothing to review, skip to the next eligible LO

    // Mark it surfaced now (fire-and-forget) so it's never shown again.
    const { error: insertError } = await supabase
      .from("tutor_spaced_reviews")
      .insert({ user_id: userId, course_id: courseId, source_lo_number: candidate });
    if (insertError) throw new Error(insertError.message);

    return { sourceLoNumber: candidate, mistakes };
  }

  return null;
}

/**
 * Exam-deadline pace signal from `profiles.target_exam_date`. Even-pace
 * assumption (straight line from first completed LO to exam date) is the
 * baseline; once within 10 days of the deadline, recent completion rate
 * (trailing 7 days) takes over as the more accurate signal. Throttled to at
 * most once every ~20 hours via `tutor_deadline_nudges` so it doesn't repeat
 * on every message during a multi-day "close to deadline" window. Returns
 * null when there's no deadline set, or the nudge is currently throttled.
 */
export async function getExamPaceSignal(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
): Promise<ExamPaceSignal | null> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("target_exam_date")
    .eq("user_id", userId)
    .maybeSingle();

  if (profileError) throw new Error(profileError.message);
  const examDateRaw = profile?.target_exam_date as string | null | undefined;
  if (!examDateRaw) return null;

  const examDate = new Date(`${examDateRaw}T00:00:00Z`);
  const today = new Date(
    `${new Date().toISOString().slice(0, 10)}T00:00:00Z`,
  );
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysRemaining = Math.round(
    (examDate.getTime() - today.getTime()) / msPerDay,
  );

  const [{ count: losTotal, error: totalError }, timeline] = await Promise.all([
    supabase
      .from("sections")
      .select("id", { count: "exact", head: true })
      .eq("course_id", courseId),
    getCompletedLoTimeline(supabase, userId, courseId),
  ]);
  if (totalError) throw new Error(totalError.message);

  const losCompleted = timeline.length;
  const losRemaining = Math.max(0, (losTotal ?? 24) - losCompleted);

  let onTrack: boolean | null = null;
  let method: ExamPaceSignal["method"] = "insufficient_data";

  if (timeline.length > 0) {
    const courseStart = new Date(timeline[0].completedAt);
    const totalDays = (examDate.getTime() - courseStart.getTime()) / msPerDay;
    const elapsedDays = (today.getTime() - courseStart.getTime()) / msPerDay;
    if (totalDays > 0) {
      const expectedLos = Math.min(
        losTotal ?? 24,
        Math.max(0, (losTotal ?? 24) * (elapsedDays / totalDays)),
      );
      onTrack = losCompleted >= expectedLos - 1; // 1 LO grace
      method = "even_pace";
    }
  }

  const closeToDeadline = daysRemaining <= 10 && daysRemaining > 0;
  if (closeToDeadline) {
    const sevenDaysAgo = new Date(today.getTime() - 7 * msPerDay);
    const recentCount = timeline.filter(
      (row) => new Date(row.completedAt) >= sevenDaysAgo,
    ).length;
    const requiredPerDay = losRemaining / daysRemaining;
    const recentPerDay = recentCount / 7;
    onTrack = recentPerDay >= requiredPerDay * 0.8;
    method = "recent_pace";
  }

  const shouldNudge =
    (daysRemaining <= 7 && daysRemaining >= 0) ||
    onTrack === false ||
    (losCompleted === 0 && daysRemaining <= 14 && daysRemaining >= 0);

  if (!shouldNudge) return null;

  // Throttle: at most once every ~20 hours per user/course.
  const { data: nudgeRow, error: nudgeError } = await supabase
    .from("tutor_deadline_nudges")
    .select("last_nudged_at")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();
  if (nudgeError) throw new Error(nudgeError.message);

  const lastNudged = nudgeRow?.last_nudged_at
    ? new Date(nudgeRow.last_nudged_at as string)
    : null;
  const hoursSinceLastNudge = lastNudged
    ? (Date.now() - lastNudged.getTime()) / (60 * 60 * 1000)
    : Infinity;
  if (hoursSinceLastNudge < 20) return null;

  const { error: upsertError } = await supabase
    .from("tutor_deadline_nudges")
    .upsert(
      { user_id: userId, course_id: courseId, last_nudged_at: new Date().toISOString() },
      { onConflict: "user_id,course_id" },
    );
  if (upsertError) throw new Error(upsertError.message);

  return {
    daysRemaining,
    losCompleted,
    losTotal: losTotal ?? 24,
    losRemaining,
    onTrack,
    method,
  };
}
