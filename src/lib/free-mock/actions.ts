"use server";

import { createServiceClient } from "@/lib/supabase/admin";
import { isInternalEmail } from "@/lib/email/internal";
import {
  FREE_MOCK_MAX_SCORE,
  FREE_MOCK_QUESTIONS,
} from "@/content/free-mock-exam";
import {
  buildLoBreakdown,
  isQuestionCorrect,
  weakestLos,
  type FreeMockAnswer,
  type LoBreakdownRow,
} from "@/lib/free-mock/scoring";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SubmitFreeMockLeadInput = {
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
  const email = normalizeEmail(input.email);
  if (!email) {
    return { ok: false, error: "Enter a valid email address." };
  }

  const answers = input.answers ?? {};
  let score = 0;
  for (const q of FREE_MOCK_QUESTIONS) {
    if (isQuestionCorrect(q, answers[q.id])) score += 1;
  }

  const loBreakdown = buildLoBreakdown(FREE_MOCK_QUESTIONS, answers);
  const weakest = weakestLos(loBreakdown, 3);
  const isInternal = isInternalEmail(email);
  const marketingConsent = isInternal ? false : Boolean(input.marketingConsent);
  const now = new Date().toISOString();
  const attr = input.attribution ?? {};

  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from("leads").insert({
      email,
      score,
      max_score: FREE_MOCK_MAX_SCORE,
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

  return {
    ok: true,
    score,
    maxScore: FREE_MOCK_MAX_SCORE,
    loBreakdown,
    weakest,
  };
}
