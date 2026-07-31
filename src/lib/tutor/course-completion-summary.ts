import type { SupabaseClient } from "@supabase/supabase-js";
import { PMQ_SECTION_COUNT } from "@/lib/pmq/constants";
import { getAiTutorEntitlement } from "@/lib/pmq/queries";
import { callTutorModelJson } from "./callTutorModel";
import { buildSystemPrompt } from "./buildSystemPrompt";
import { COURSE_COMPLETION_LO, SLY_UNLOCK_CREDIT_GBP_CENTS } from "./constants";
import {
  buildPerLoMeters,
  COURSE_REPORT_JSON_SCHEMA,
  parseCourseReportPayload,
} from "./course-report";
import { isFairUsageExceeded } from "./fair-usage";
import {
  countQuizCompletedSections,
  fetchTokenUsageRows,
  getCourseCompletionReport,
  getWeakAreasForCourse,
  hasCourseCompletionSummary,
  sumTutorCreditGbpCents,
} from "./tutor-db";

/**
 * Server-side one-time course-completion summary + downloadable report (LIC-52 / LIC-65).
 * Call after section_progress.quiz_completed_at is set.
 */
export async function maybeDeliverCourseCompletionSummary(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
): Promise<void> {
  const entitlement = await getAiTutorEntitlement(supabase, userId, courseId);
  if (!entitlement) return;

  const completed = await countQuizCompletedSections(supabase, userId, courseId);
  if (completed < PMQ_SECTION_COUNT) return;

  const [alreadySent, existingReport] = await Promise.all([
    hasCourseCompletionSummary(
      supabase,
      userId,
      courseId,
      COURSE_COMPLETION_LO,
    ),
    getCourseCompletionReport(supabase, userId, courseId),
  ]);
  if (alreadySent && existingReport) return;

  const [usageRows, creditGbpCents] = await Promise.all([
    fetchTokenUsageRows(supabase, userId, courseId),
    sumTutorCreditGbpCents(supabase, userId, courseId),
  ]);
  const budget =
    creditGbpCents > 0 ? creditGbpCents : SLY_UNLOCK_CREDIT_GBP_CENTS;
  if (isFairUsageExceeded(usageRows, budget)) return;

  const courseWeakAreas = await getWeakAreasForCourse(supabase, userId, courseId);
  const perLo = buildPerLoMeters(courseWeakAreas);
  const focusLos = perLo.filter(
    (m) => m.tier === "weak" || m.tier === "developing",
  );

  const systemPrompt = [
    buildSystemPrompt({
      loNumber: 24,
      weakAreas: [],
      mode: "course_completion",
      courseWeakAreas,
    }),
    "",
    "## Structured report output",
    "Respond ONLY with JSON matching the schema. Do not invent quiz scores — use the meter tiers below.",
    "chatMessage: existing course-completion chat prose; mention their downloadable end-of-course report is ready.",
    "keyTakeaways: 3-5 short bullets.",
    "weakLoNotes: only for LOs listed as weak or developing below — one short note each.",
    "improvementTips: at most 5 practical tips.",
    "",
    "## Computed meter tiers (authoritative — never contradict)",
    perLo
      .map(
        (m) =>
          `LO${m.loNumber}: ${m.tier} (${m.totalCount - m.wrongCount}/${m.totalCount} correct)`,
      )
      .join("\n"),
    "",
    focusLos.length
      ? `Focus notes on: ${focusLos.map((m) => `LO${m.loNumber}`).join(", ")}`
      : "No weak/developing LOs — keep weakLoNotes empty and celebrate consistency.",
  ].join("\n");

  const result = await callTutorModelJson(
    systemPrompt,
    [
      {
        role: "user",
        content:
          "I've finished all 24 learning objectives. Produce my course-completion chat summary and downloadable report fields.",
      },
    ],
    COURSE_REPORT_JSON_SCHEMA as unknown as Record<string, unknown>,
  );

  let payload;
  try {
    payload = parseCourseReportPayload(result.content);
  } catch (err) {
    console.error(
      "course completion report JSON parse failed:",
      err instanceof Error ? err.message : err,
    );
    return;
  }

  // Filter model notes to weak/developing only (never trust model for tier list).
  const allowed = new Set(focusLos.map((m) => m.loNumber));
  const weakLoNotes = payload.weakLoNotes.filter((n) => allowed.has(n.loNumber));

  if (!existingReport) {
    const { error: reportError } = await supabase
      .from("course_completion_reports")
      .insert({
        user_id: userId,
        course_id: courseId,
        per_lo: perLo,
        key_takeaways: payload.keyTakeaways,
        weak_lo_notes: weakLoNotes,
        improvement_tips: payload.improvementTips,
        pdf_storage_path: null,
      });

    if (reportError) {
      // Unique violation = concurrent insert — treat as success for idempotency.
      if (reportError.code !== "23505") {
        console.error(
          "course completion report insert failed:",
          reportError.message,
        );
        return;
      }
    }
  }

  if (!alreadySent) {
    const { error } = await supabase.from("tutor_messages").insert({
      user_id: userId,
      course_id: courseId,
      role: "assistant",
      content: payload.chatMessage,
      learning_objective: COURSE_COMPLETION_LO,
      input_tokens: result.inputTokens,
      output_tokens: result.outputTokens,
    });

    if (error) {
      console.error("course completion summary insert failed:", error.message);
    }
  }
}
