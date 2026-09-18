"use server";

import { createServiceClient } from "@/lib/supabase/admin";
import { isInternalEmail } from "@/lib/email/internal";
import { captureServer } from "@/lib/analytics/server";
import { getFreeMockBank } from "@/lib/free-mock/banks";
import { isFreeMockExamId } from "@/lib/free-mock/config";
import {
  buildCategoryBreakdown,
  isQuestionCorrect,
  toLoBreakdownRows,
  weakestCategories,
  type FreeMockAnswer,
  type LoBreakdownRow,
} from "@/lib/free-mock/scoring";
import type { FreeMockExamId } from "@/lib/free-mock/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SubmitFreeMockLeadInput = {
  examId: FreeMockExamId;
  email: string;
  marketingConsent: boolean;
  answers: Record<string, FreeMockAnswer>;
  attribution?: {
    utm_source?: string | null;
    utm_medium?: string | null;
    utm_campaign?: string | null;
    utm_content?: string | null;
    utm_term?: string | null;
    referrer_category?: string | null;
  };
};

export type SubmitFreeMockLeadResult =
  | {
      ok: true;
      score: number;
      maxScore: number;
      loBreakdown: LoBreakdownRow[];
      weakest: LoBreakdownRow[];
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

/**
 * Persist a free-mock lead and return the scored breakdown.
 * Never creates auth.users. Uses the service role (RLS: no public insert).
 */
export async function submitFreeMockLead(
  input: SubmitFreeMockLeadInput,
): Promise<SubmitFreeMockLeadResult> {
  if (!isFreeMockExamId(input.examId)) {
    return { ok: false, error: "Invalid exam." };
  }

  const email = normalizeEmail(input.email);
  if (!email) {
    return { ok: false, error: "Enter a valid email address." };
  }

  const examId = input.examId;
  const items = getFreeMockBank(examId);
  const maxScore = items.length;
  const answers = input.answers ?? {};
  let score = 0;
  for (const item of items) {
    if (isQuestionCorrect(item, answers[item.id])) score += 1;
  }

  const categoryBreakdown = buildCategoryBreakdown(items, answers);
  const loBreakdown = toLoBreakdownRows(categoryBreakdown);
  const weakest = toLoBreakdownRows(weakestCategories(categoryBreakdown, 3));
  const isInternal = isInternalEmail(email);
  const marketingConsent = isInternal ? false : Boolean(input.marketingConsent);
  const now = new Date().toISOString();
  const attr = input.attribution ?? {};

  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from("leads").insert({
      email,
      exam_id: examId,
      score,
      max_score: maxScore,
      weakest_los: weakest.map((w) => w.lo_code),
      lo_breakdown: loBreakdown,
      marketing_consent: marketingConsent,
      consent_timestamp: marketingConsent ? now : null,
      utm_source: clip(attr.utm_source),
      utm_medium: clip(attr.utm_medium),
      utm_campaign: clip(attr.utm_campaign),
      utm_content: clip(attr.utm_content),
      utm_term: clip(attr.utm_term),
      referrer_category: clip(attr.referrer_category, 40),
      source: "free_mock_exam",
      is_internal: isInternal,
    });

    if (error) {
      console.error("[submitFreeMockLead]", error.message);
      return { ok: false, error: "Could not save your results. Try again." };
    }
  } catch (err) {
    console.error("[submitFreeMockLead]", err);
    return { ok: false, error: "Could not save your results. Try again." };
  }

  try {
    await captureServer(email, "free_mock_lead_captured", {
      exam_id: examId,
      score,
      max_score: maxScore,
      marketing_consent: marketingConsent,
      lead_source: "free_mock_exam",
      utm_source: clip(attr.utm_source),
      utm_medium: clip(attr.utm_medium),
      utm_campaign: clip(attr.utm_campaign),
    });
  } catch (err) {
    console.error("[submitFreeMockLead] analytics", err);
  }

  return {
    ok: true,
    score,
    maxScore,
    loBreakdown,
    weakest,
  };
}
