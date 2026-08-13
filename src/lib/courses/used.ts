/**
 * 14-Day Unused Guarantee — has the learner touched a Paid Feature?
 *
 * Policy: err toward reporting use. A false "unused" pays a refund that was
 * not owed; a false "used" denies a refund that was.
 *
 * Rules match legal/TERMS_OF_SERVICE.md Schedule (keep in sync).
 */

import { createServiceClient } from "../supabase/admin.ts";
import { PMQ_COURSE_ID } from "./ids.ts";
import { PFQ_SECTION_IDS } from "../pfq/section-ids.ts";

/**
 * PFQ Schedule: opened a lesson, answered a practice question, or started the mock.
 */
export async function hasUsedPfqPaidFeature(userId: string): Promise<boolean> {
  const supabase = createServiceClient();
  const sectionIds = Object.values(PFQ_SECTION_IDS);

  const { data: lessonRows, error: lessonError } = await supabase
    .from("section_progress")
    .select(
      "id, checklist_state, completed_at, orient_reached_at, learn_reached_at, video_reached_at, audio_reached_at, apply_reached_at, quiz_completed_at",
    )
    .eq("user_id", userId)
    .in("section_id", sectionIds)
    .limit(20);

  if (lessonError) {
    console.error("[courses/used] pfq lessons", lessonError.message);
    return true;
  }

  for (const row of lessonRows ?? []) {
    const checklist = Array.isArray(row.checklist_state)
      ? row.checklist_state
      : [];
    if (
      checklist.length > 0 ||
      row.completed_at ||
      row.orient_reached_at ||
      row.learn_reached_at ||
      row.video_reached_at ||
      row.audio_reached_at ||
      row.apply_reached_at ||
      row.quiz_completed_at
    ) {
      return true;
    }
  }

  const { data: sessions, error: sessionError } = await supabase
    .from("pfq_practice_sessions")
    .select("id")
    .eq("user_id", userId)
    .limit(50);
  if (sessionError) {
    console.error("[courses/used] pfq practice sessions", sessionError.message);
    return true;
  }
  const sessionIds = (sessions ?? []).map((s) => s.id as string);
  if (sessionIds.length > 0) {
    const { count, error } = await supabase
      .from("pfq_practice_answers")
      .select("question_id", { count: "exact", head: true })
      .in("session_id", sessionIds)
      .not("answered_at", "is", null)
      .limit(1);
    if (error) {
      console.error("[courses/used] pfq practice answers", error.message);
      return true;
    }
    if ((count ?? 0) > 0) return true;
  }

  const { count: signalCount, error: signalError } = await supabase
    .from("pfq_coverage_signals")
    .select("learning_outcome", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("source", "practice")
    .limit(1);
  if (signalError) {
    console.error("[courses/used] pfq coverage", signalError.message);
    return true;
  }
  if ((signalCount ?? 0) > 0) return true;

  const { count: mockCount, error: mockError } = await supabase
    .from("pfq_attempts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .limit(1);
  if (mockError) {
    console.error("[courses/used] pfq mock", mockError.message);
    return true;
  }
  return (mockCount ?? 0) > 0;
}

/**
 * PMQ Schedule: AI tutor message under a Paid Unlock, opened a paid quiz set,
 * or started any mock exam beyond the first.
 */
export async function hasUsedPmqPaidFeature(userId: string): Promise<boolean> {
  const supabase = createServiceClient();

  // Paid quiz sets: attempts.context like quiz_set_2 … quiz_set_8 (not set 1).
  const { data: paidAttempts, error: quizError } = await supabase
    .from("attempts")
    .select("id, context")
    .eq("user_id", userId)
    .eq("course_id", PMQ_COURSE_ID)
    .is("exam_session_id", null)
    .like("context", "quiz_set_%")
    .limit(50);

  if (quizError) {
    console.error("[courses/used] pmq quiz attempts", quizError.message);
    return true;
  }
  for (const row of paidAttempts ?? []) {
    const ctx = String(row.context ?? "");
    const match = /^quiz_set_(\d+)$/.exec(ctx);
    if (match && Number(match[1]) >= 2) return true;
  }

  // Mock beyond the first.
  const { count: mockCount, error: mockError } = await supabase
    .from("exam_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("course_id", PMQ_COURSE_ID)
    .gt("exam_set", 1)
    .limit(1);
  if (mockError) {
    console.error("[courses/used] pmq mocks", mockError.message);
    return true;
  }
  if ((mockCount ?? 0) > 0) return true;

  // AI tutor under Paid Unlock.
  const { data: entitlement } = await supabase
    .from("feature_entitlements")
    .select("feature")
    .eq("user_id", userId)
    .eq("course_id", PMQ_COURSE_ID)
    .in("feature", ["pro", "ai_pro"])
    .limit(1)
    .maybeSingle();

  if (entitlement) {
    const { count: tutorCount, error: tutorError } = await supabase
      .from("tutor_messages")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("course_id", PMQ_COURSE_ID)
      .eq("role", "user")
      .limit(1);
    if (tutorError) {
      console.error("[courses/used] pmq tutor", tutorError.message);
      return true;
    }
    if ((tutorCount ?? 0) > 0) return true;
  }

  const { count: creditCount, error: creditError } = await supabase
    .from("tutor_usage_credits")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("course_id", PMQ_COURSE_ID)
    .lt("delta_gbp_cents", 0)
    .limit(1);
  if (creditError) {
    if (!/does not exist|schema cache|column/i.test(creditError.message)) {
      console.error("[courses/used] pmq credits", creditError.message);
      return true;
    }
  } else if ((creditCount ?? 0) > 0) {
    return true;
  }

  return false;
}
