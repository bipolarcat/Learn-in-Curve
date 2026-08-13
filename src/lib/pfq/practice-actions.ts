"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { buildOptionOrdersForAttempt } from "@/lib/pfq/generator";
import { bankToDisplayAnswer, shuffleInPlace } from "@/lib/pfq/shuffle";
import { isDisplayAnswerCorrect } from "@/lib/pfq/scoring";
import {
  assertNoSecretsInPublicPayload,
  toPublicPfqQuestion,
} from "@/lib/pfq/public-question";
import { getPfqTier } from "@/lib/pfq/entitlement";
import { canAccessPfqMock } from "@/lib/pfq/tiers";
import { PFQ_PRACTICE_ENABLED } from "@/lib/pfq/constants";
import { PFQ_OBJECTIVES } from "@/lib/pfq/outcomes";
import { buildCoverageFromSignals } from "@/lib/pfq/coverage";
import { upsertCoverageSignals } from "@/lib/pfq/coverage-signals";
import type {
  PfqCoverageSignal,
  PfqPublicQuestion,
  PfqQuestionRow,
} from "@/lib/pfq/types";

function asQuestionRow(raw: Record<string, unknown>): PfqQuestionRow {
  return {
    id: String(raw.id),
    learning_outcome: String(raw.learning_outcome),
    objective: Number(raw.objective),
    day: Number(raw.day),
    verb: String(raw.verb),
    type: raw.type === "multi_select" ? "multi_select" : "single",
    traps: Array.isArray(raw.traps) ? (raw.traps as string[]) : [],
    stem: String(raw.stem),
    items: Array.isArray(raw.items) ? (raw.items as string[]) : null,
    options: (raw.options ?? {}) as Record<string, string>,
    answer: String(raw.answer),
    explanation: String(raw.explanation),
    active: raw.active !== false,
    mock_suitable: Boolean(raw.mock_suitable),
    variant: Number(raw.variant ?? 1),
  };
}

async function requirePfqProUser(): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  if (!PFQ_PRACTICE_ENABLED) {
    return { ok: false, error: "Practice is not enabled yet." };
  }
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Sign in required." };
    const tier = await getPfqTier(supabase, user.id);
    if (!canAccessPfqMock(tier)) {
      return { ok: false, error: "PFQ Pro is required." };
    }
    return { ok: true, userId: user.id };
  } catch {
    return { ok: false, error: "Sign in required." };
  }
}

export type StartPfqPracticeResult =
  | {
      ok: true;
      sessionId: string;
      objective: number;
      objectiveTitle: string;
      questions: PfqPublicQuestion[];
    }
  | { ok: false; error: string };

export async function startPfqPractice(input: {
  objective: number;
}): Promise<StartPfqPracticeResult> {
  try {
    const access = await requirePfqProUser();
    if (!access.ok) return access;

    const objective = Number(input.objective);
    const meta = PFQ_OBJECTIVES.find((o) => o.objective === objective);
    if (!meta) return { ok: false, error: "Unknown learning objective." };

    const supabase = createServiceClient();
    const { data: bank, error: bankError } = await supabase
      .from("pfq_questions")
      .select("*")
      .eq("active", true)
      .eq("objective", objective);
    if (bankError) throw bankError;
    if (!bank?.length) {
      return {
        ok: false,
        error:
          "No practice questions for this objective yet. Seed the bank or pick another LO.",
      };
    }

    const rows = bank.map((r) => asQuestionRow(r as Record<string, unknown>));
    const shuffled = shuffleInPlace(rows);
    const questionIds = shuffled.map((q) => q.id);
    const optionOrders = buildOptionOrdersForAttempt(questionIds);

    const { data: session, error: sessionError } = await supabase
      .from("pfq_practice_sessions")
      .insert({
        user_id: access.userId,
        objective,
        question_ids: questionIds,
      })
      .select("id")
      .single();
    if (sessionError) throw sessionError;

    const answerRows = questionIds.map((question_id) => ({
      session_id: session.id,
      question_id,
      option_order: optionOrders[question_id],
      selected: null,
      correct: null,
      answered_at: null,
    }));
    const { error: answersError } = await supabase
      .from("pfq_practice_answers")
      .insert(answerRows);
    if (answersError) throw answersError;

    const byId = new Map(rows.map((q) => [q.id, q]));
    const questions = questionIds.map((id) => {
      const q = byId.get(id)!;
      return toPublicPfqQuestion(q, optionOrders[id]!);
    });

    assertNoSecretsInPublicPayload({ questions });

    return {
      ok: true,
      sessionId: session.id,
      objective,
      objectiveTitle: meta.title,
      questions,
    };
  } catch (err) {
    console.error("[pfq] startPractice", err);
    return { ok: false, error: "Couldn’t start practice. Try again." };
  }
}

export type SubmitPfqPracticeAnswerResult =
  | {
      ok: true;
      correct: boolean;
      explanation: string;
      learning_outcome: string;
      correct_key: string;
    }
  | { ok: false; error: string };

export async function submitPfqPracticeAnswer(input: {
  sessionId: string;
  questionId: string;
  selected: string;
}): Promise<SubmitPfqPracticeAnswerResult> {
  try {
    const access = await requirePfqProUser();
    if (!access.ok) return access;

    const selected =
      typeof input.selected === "string" &&
      ["a", "b", "c", "d"].includes(input.selected)
        ? input.selected
        : null;
    if (!selected) return { ok: false, error: "Pick an option." };

    const supabase = createServiceClient();
    const { data: session, error: sessionError } = await supabase
      .from("pfq_practice_sessions")
      .select("*")
      .eq("id", input.sessionId)
      .maybeSingle();
    if (sessionError) throw sessionError;
    if (!session || session.user_id !== access.userId) {
      return { ok: false, error: "Session not found." };
    }
    if (!(session.question_ids as string[]).includes(input.questionId)) {
      return { ok: false, error: "Unknown question." };
    }

    const { data: item, error: itemError } = await supabase
      .from("pfq_practice_answers")
      .select("*")
      .eq("session_id", input.sessionId)
      .eq("question_id", input.questionId)
      .maybeSingle();
    if (itemError) throw itemError;
    if (!item) return { ok: false, error: "Unknown question." };
    if (item.answered_at) {
      return { ok: false, error: "Already answered." };
    }

    const { data: qRow, error: qError } = await supabase
      .from("pfq_questions")
      .select("*")
      .eq("id", input.questionId)
      .maybeSingle();
    if (qError) throw qError;
    if (!qRow) return { ok: false, error: "Question missing from bank." };

    const q = asQuestionRow(qRow as Record<string, unknown>);
    const optionOrder = item.option_order as string[];
    const correct = isDisplayAnswerCorrect(q.answer, selected, optionOrder);
    const answeredAt = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("pfq_practice_answers")
      .update({
        selected,
        correct,
        answered_at: answeredAt,
      })
      .eq("session_id", input.sessionId)
      .eq("question_id", input.questionId);
    if (updateError) throw updateError;

    // Most recent answer wins for this learning outcome.
    await upsertCoverageSignals({
      userId: access.userId,
      source: "practice",
      outcomes: [
        {
          learning_outcome: q.learning_outcome,
          correct,
          question_id: q.id,
        },
      ],
    });

    return {
      ok: true,
      correct,
      explanation: q.explanation,
      learning_outcome: q.learning_outcome,
      correct_key: bankToDisplayAnswer(q.answer, optionOrder),
    };
  } catch (err) {
    console.error("[pfq] submitPracticeAnswer", err);
    return { ok: false, error: "Couldn’t check that answer." };
  }
}

export async function loadPfqCombinedCoverage(): Promise<
  | {
      ok: true;
      headlineCorrect: number;
      outcomeCount: number;
      coverage: ReturnType<typeof buildCoverageFromSignals>["coverage"];
      objectives: ReturnType<typeof buildCoverageFromSignals>["objectives"];
    }
  | { ok: false; error: string }
> {
  try {
    const access = await requirePfqProUser();
    if (!access.ok) return access;

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("pfq_coverage_signals")
      .select("learning_outcome, correct, source, question_id, updated_at")
      .eq("user_id", access.userId);
    if (error) throw error;

    const signals: PfqCoverageSignal[] = (data ?? []).map((row) => ({
      learning_outcome: String(row.learning_outcome),
      correct: Boolean(row.correct),
      source: row.source as PfqCoverageSignal["source"],
      question_id: (row.question_id as string | null) ?? null,
      updated_at: String(row.updated_at),
    }));

    const built = buildCoverageFromSignals(signals);
    return { ok: true, ...built };
  } catch (err) {
    console.error("[pfq] loadCombinedCoverage", err);
    return { ok: false, error: "Couldn’t load coverage." };
  }
}
