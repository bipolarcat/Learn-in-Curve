"use server";

import { headers } from "next/headers";
import { createServiceClient } from "@/lib/supabase/admin";
import { isInternalEmail } from "@/lib/email/internal";
import { captureServer } from "@/lib/analytics/server";
import { getFreeMockBank } from "@/lib/free-mock/banks";
import {
  getFreeMockExamConfig,
  isFreeMockExamId,
} from "@/lib/free-mock/config";
import {
  buildFormatLoss,
  buildQuestionTimings,
  readinessBand,
  recommendedNextSteps,
  scoreAttempt,
} from "@/lib/free-mock/report";
import type { FreeMockAnswer, LoBreakdownRow } from "@/lib/free-mock/scoring";
import type { FreeMockExamId } from "@/lib/free-mock/types";
import { NEWSLETTER_LIST_KEY } from "@/lib/notify/lists";
import { sendFreeMockReportEmail } from "@/lib/notify/send-free-mock-report-email";
import type { FormatLossRow, QuestionTimingRow } from "@/lib/free-mock/report";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SubmitFreeMockReportInput = {
  examId: FreeMockExamId;
  email: string;
  attemptId: string;
  answers: Record<string, FreeMockAnswer>;
  questionTimings: Record<string, number>;
  durationMs: number;
  overTime: boolean;
  sourcePath?: string;
  attribution?: {
    utm_source?: string | null;
    utm_medium?: string | null;
    utm_campaign?: string | null;
    utm_content?: string | null;
    utm_term?: string | null;
    referrer_category?: string | null;
  };
};

export type SubmitFreeMockReportResult =
  | {
      ok: true;
      score: number;
      maxScore: number;
      loBreakdown: LoBreakdownRow[];
      weakest: LoBreakdownRow[];
      formatLoss: FormatLossRow[];
      questionTimings: QuestionTimingRow[];
      nextSteps: string[];
    }
  | { ok: false; error: string };

function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) return null;
  return email;
}

function clip(value: string | null | undefined, max = 200): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

async function upsertNewsletterContact(
  supabase: ReturnType<typeof createServiceClient>,
  email: string,
  course: string,
  isInternal: boolean,
): Promise<string | null> {
  const now = new Date().toISOString();
  const row: Record<string, unknown> = {
    email,
    course,
    is_internal: isInternal,
    marketing_consent: !isInternal,
  };
  if (!isInternal) row.marketing_consent_at = now;

  const { data: inserted, error } = await supabase
    .from("newsletter_subscribers")
    .insert(row)
    .select("unsubscribe_token")
    .single();

  if (!error) {
    await supabase.from("waitlist_signups").upsert(
      {
        email,
        list_key: NEWSLETTER_LIST_KEY,
        is_internal: isInternal,
      },
      { onConflict: "email,list_key", ignoreDuplicates: true },
    );
    return inserted?.unsubscribe_token ?? null;
  }

  if (error.code === "23505") {
    if (isInternal) {
      await supabase
        .from("newsletter_subscribers")
        .update({ is_internal: true })
        .eq("email", email);
    } else {
      await supabase
        .from("newsletter_subscribers")
        .update({
          marketing_consent: true,
          marketing_consent_at: now,
          course,
        })
        .eq("email", email);
      await supabase.from("waitlist_signups").upsert(
        {
          email,
          list_key: NEWSLETTER_LIST_KEY,
          is_internal: false,
        },
        { onConflict: "email,list_key", ignoreDuplicates: true },
      );
    }
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("unsubscribe_token")
      .eq("email", email)
      .maybeSingle();
    return existing?.unsubscribe_token ?? null;
  }

  console.error("[submitFreeMockReport] newsletter upsert", error.message);
  return null;
}

/**
 * Soft-opt-in email capture: unlock gated report, upsert contact, email a copy.
 */
export async function submitFreeMockReport(
  input: SubmitFreeMockReportInput,
): Promise<SubmitFreeMockReportResult> {
  if (!isFreeMockExamId(input.examId)) {
    return { ok: false, error: "Invalid exam." };
  }
  if (!isUuid(input.attemptId)) {
    return { ok: false, error: "Invalid attempt." };
  }

  const email = normalizeEmail(input.email);
  if (!email) {
    return { ok: false, error: "Enter a valid email address." };
  }

  const examId = input.examId;
  const config = getFreeMockExamConfig(examId);
  const items = getFreeMockBank(examId);
  const answers = input.answers ?? {};
  const { score, maxScore, loBreakdown, weakest } = scoreAttempt(items, answers);
  const formatLoss = buildFormatLoss(items, answers);
  const questionTimingRows = buildQuestionTimings(
    items,
    answers,
    input.questionTimings ?? {},
    config.targetPaceMsPerQuestion,
  );
  const nextSteps = recommendedNextSteps(
    weakest,
    config.breakdownNoun,
    config.mark,
  );
  const band = readinessBand(score, maxScore);
  const isInternal = isInternalEmail(email);
  const now = new Date().toISOString();
  const attr = input.attribution ?? {};
  const durationMs = Math.max(0, Math.round(input.durationMs ?? 0));
  const overTime = Boolean(input.overTime);
  const sourcePath = clip(input.sourcePath, 120) ?? config.path;

  let unsubscribeToken: string | null = null;

  try {
    const supabase = createServiceClient();
    unsubscribeToken = await upsertNewsletterContact(
      supabase,
      email,
      config.course,
      isInternal,
    );

    const leadPayload = {
      email,
      exam_id: examId,
      course: config.course,
      attempt_id: input.attemptId,
      score,
      max_score: maxScore,
      weakest_los: weakest.map((w) => w.lo_code),
      lo_breakdown: loBreakdown,
      format_breakdown: formatLoss,
      question_timings: input.questionTimings ?? {},
      duration_ms: durationMs,
      over_time: overTime,
      source_path: sourcePath,
      marketing_basis: "soft_opt_in",
      marketing_consent: !isInternal,
      consent_timestamp: isInternal ? null : now,
      utm_source: clip(attr.utm_source),
      utm_medium: clip(attr.utm_medium),
      utm_campaign: clip(attr.utm_campaign),
      utm_content: clip(attr.utm_content),
      utm_term: clip(attr.utm_term),
      referrer_category: clip(attr.referrer_category, 40),
      source: "free_mock_exam",
      is_internal: isInternal,
    };

    const { data: existingLead } = await supabase
      .from("leads")
      .select("id")
      .eq("attempt_id", input.attemptId)
      .maybeSingle();

    const { error } = existingLead
      ? await supabase
          .from("leads")
          .update(leadPayload)
          .eq("id", existingLead.id)
      : await supabase.from("leads").insert(leadPayload);

    if (error) {
      console.error("[submitFreeMockReport]", error.message);
      return { ok: false, error: "Could not save your report. Try again." };
    }
  } catch (err) {
    console.error("[submitFreeMockReport]", err);
    return { ok: false, error: "Could not save your report. Try again." };
  }

  try {
    await captureServer(email, "report_email_submitted", {
      exam_id: examId,
      course: config.course,
      score,
      max_score: maxScore,
      duration_ms: durationMs,
      over_time: overTime,
      attempt_id: input.attemptId,
    });
    await captureServer(email, "report_unlocked", {
      exam_id: examId,
      course: config.course,
      score,
      max_score: maxScore,
      attempt_id: input.attemptId,
    });
  } catch (err) {
    console.error("[submitFreeMockReport] analytics", err);
  }

  if (unsubscribeToken) {
    try {
      const h = await headers();
      const host = h.get("x-forwarded-host") ?? h.get("host");
      const proto = h.get("x-forwarded-proto") ?? "https";
      const origin =
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
        (host ? `${proto}://${host}` : "https://www.learnincurve.com");
      await sendFreeMockReportEmail({
        email,
        unsubscribeToken,
        origin,
        displayName: config.displayName,
        mark: config.mark,
        score,
        maxScore,
        band,
        durationMs,
        overTime,
        loBreakdown,
        formatLoss,
        nextSteps,
        breakdownNounPlural: config.breakdownNounPlural,
      });
    } catch (err) {
      console.error("[submitFreeMockReport] email", err);
    }
  }

  return {
    ok: true,
    score,
    maxScore,
    loBreakdown,
    weakest,
    formatLoss,
    questionTimings: questionTimingRows,
    nextSteps,
  };
}

/** @deprecated Prefer submitFreeMockReport — kept for older clients. */
export async function submitFreeMockLead(input: {
  examId: FreeMockExamId;
  email: string;
  marketingConsent: boolean;
  answers: Record<string, FreeMockAnswer>;
  attribution?: SubmitFreeMockReportInput["attribution"];
}): Promise<
  | {
      ok: true;
      score: number;
      maxScore: number;
      loBreakdown: LoBreakdownRow[];
      weakest: LoBreakdownRow[];
    }
  | { ok: false; error: string }
> {
  const attemptId = crypto.randomUUID();
  const result = await submitFreeMockReport({
    examId: input.examId,
    email: input.email,
    attemptId,
    answers: input.answers,
    questionTimings: {},
    durationMs: 0,
    overTime: false,
    attribution: input.attribution,
  });
  if (!result.ok) return result;
  return {
    ok: true,
    score: result.score,
    maxScore: result.maxScore,
    loBreakdown: result.loBreakdown,
    weakest: result.weakest,
  };
}
