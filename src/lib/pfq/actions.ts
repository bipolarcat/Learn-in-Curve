"use server";

import { createHash, randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import {
  buildOptionOrdersForAttempt,
  drawPfqMockQuestionIds,
} from "@/lib/pfq/generator";
import { PFQ_DURATION_SECONDS, PFQ_QUESTION_COUNT } from "@/lib/pfq/outcomes";
import { buildPfqResults, isDisplayAnswerCorrect } from "@/lib/pfq/scoring";
import { toPublicPfqQuestion } from "@/lib/pfq/public-question";
import { getPfqTier } from "@/lib/pfq/entitlement";
import { canAccessPfqMock } from "@/lib/pfq/tiers";
import { upsertCoverageSignals } from "@/lib/pfq/coverage-signals";
import type {
  PfqAttemptRow,
  PfqPublicQuestion,
  PfqQuestionRow,
  PfqResultsPayload,
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

function toPublic(
  q: PfqQuestionRow,
  optionOrder: string[],
): PfqPublicQuestion {
  return toPublicPfqQuestion(q, optionOrder);
}

async function currentUserId(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

async function requirePfqProUser(): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Sign in required." };
  const authClient = await createClient();
  const tier = await getPfqTier(authClient, userId);
  if (!canAccessPfqMock(tier)) {
    return { ok: false, error: "PFQ Pro is required." };
  }
  return { ok: true, userId };
}

function normalizeGuestToken(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const token = raw.trim();
  if (token.length < 16 || token.length > 128) return null;
  return token;
}

async function loadQuestionsByIds(
  ids: string[],
): Promise<Map<string, PfqQuestionRow>> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("pfq_questions")
    .select("*")
    .in("id", ids);
  if (error) throw error;
  const map = new Map<string, PfqQuestionRow>();
  for (const row of data ?? []) {
    const q = asQuestionRow(row as Record<string, unknown>);
    map.set(q.id, q);
  }
  return map;
}

async function assertAttemptAccess(
  attempt: PfqAttemptRow,
  guestToken: string | null,
  userId: string | null,
): Promise<boolean> {
  if (userId && attempt.user_id === userId) return true;
  if (guestToken && attempt.guest_token === guestToken) return true;
  return false;
}

export type StartPfqAttemptResult =
  | {
      ok: true;
      attemptId: string;
      startedAt: string;
      endsAt: string;
      questions: PfqPublicQuestion[];
      answers: Record<string, string | null>;
      flags: string[];
    }
  | { ok: false; error: string };

export async function startPfqAttempt(_input: {
  guestToken?: string | null;
}): Promise<StartPfqAttemptResult> {
  try {
    const access = await requirePfqProUser();
    if (!access.ok) return access;
    const userId = access.userId;
    // guest_token column retained for a possible future trial; unused while Pro-gated.
    const guestToken = null;

    const supabase = createServiceClient();
    const { data: bank, error: bankError } = await supabase
      .from("pfq_questions")
      .select("*")
      .eq("active", true);
    if (bankError) throw bankError;
    if (!bank?.length) {
      return {
        ok: false,
        error: "Question bank is empty. Run npm run seed:pfq after applying the migration.",
      };
    }

    const rows = bank.map((r) => asQuestionRow(r as Record<string, unknown>));
    const questionIds = drawPfqMockQuestionIds(rows);
    if (questionIds.length !== PFQ_QUESTION_COUNT) {
      return {
        ok: false,
        error: `Expected ${PFQ_QUESTION_COUNT} questions, drew ${questionIds.length}.`,
      };
    }

    const optionOrders = buildOptionOrdersForAttempt(questionIds);
    const startedAt = new Date();
    const { data: attempt, error: attemptError } = await supabase
      .from("pfq_attempts")
      .insert({
        user_id: userId,
        guest_token: guestToken,
        question_ids: questionIds,
        started_at: startedAt.toISOString(),
      })
      .select("id, started_at")
      .single();
    if (attemptError) throw attemptError;

    const answerRows = questionIds.map((question_id) => ({
      attempt_id: attempt.id,
      question_id,
      selected: null,
      correct: null,
      flagged: false,
      option_order: optionOrders[question_id],
    }));
    const { error: answersError } = await supabase
      .from("pfq_answers")
      .insert(answerRows);
    if (answersError) throw answersError;

    const byId = new Map(rows.map((q) => [q.id, q]));
    const questions = questionIds.map((id) => {
      const q = byId.get(id)!;
      return toPublic(q, optionOrders[id]!);
    });

    const endsAt = new Date(
      startedAt.getTime() + PFQ_DURATION_SECONDS * 1000,
    ).toISOString();

    return {
      ok: true,
      attemptId: attempt.id,
      startedAt: attempt.started_at,
      endsAt,
      questions,
      answers: Object.fromEntries(questionIds.map((id) => [id, null])),
      flags: [],
    };
  } catch (err) {
    console.error("[pfq] startAttempt", err);
    return { ok: false, error: "Couldn’t start the mock. Try again." };
  }
}

export type ResumePfqAttemptResult =
  | {
      ok: true;
      status: "in_progress" | "submitted";
      attemptId: string;
      startedAt: string;
      endsAt: string;
      submittedAt: string | null;
      score: number | null;
      questions: PfqPublicQuestion[];
      answers: Record<string, string | null>;
      flags: string[];
      results?: PfqResultsPayload;
    }
  | { ok: false; error: string };

export async function loadPfqAttempt(input: {
  attemptId: string;
  guestToken?: string | null;
}): Promise<ResumePfqAttemptResult> {
  try {
    const access = await requirePfqProUser();
    if (!access.ok) return { ok: false, error: access.error };
    const userId = access.userId;
    const guestToken = normalizeGuestToken(input.guestToken);
    const supabase = createServiceClient();

    const { data: attempt, error } = await supabase
      .from("pfq_attempts")
      .select("*")
      .eq("id", input.attemptId)
      .maybeSingle();
    if (error) throw error;
    if (!attempt) return { ok: false, error: "Attempt not found." };

    const row = attempt as PfqAttemptRow;
    if (!(await assertAttemptAccess(row, guestToken, userId))) {
      return { ok: false, error: "You don’t have access to this attempt." };
    }

    const { data: answers, error: answersError } = await supabase
      .from("pfq_answers")
      .select("question_id, selected, flagged, option_order, correct")
      .eq("attempt_id", row.id);
    if (answersError) throw answersError;

    const questionsById = await loadQuestionsByIds(row.question_ids);
    const answerMap = new Map(
      (answers ?? []).map((a) => [a.question_id as string, a]),
    );

    const questions: PfqPublicQuestion[] = row.question_ids.map((id) => {
      const q = questionsById.get(id);
      if (!q) throw new Error(`Missing question ${id}`);
      const order = (answerMap.get(id)?.option_order as string[]) ?? [
        "a",
        "b",
        "c",
        "d",
      ];
      return toPublic(q, order);
    });

    const started = new Date(row.started_at).getTime();
    const endsAt = new Date(started + PFQ_DURATION_SECONDS * 1000).toISOString();
    const flags = (answers ?? [])
      .filter((a) => a.flagged)
      .map((a) => a.question_id as string);
    const selected = Object.fromEntries(
      (answers ?? []).map((a) => [a.question_id, a.selected as string | null]),
    );

    if (row.submitted_at) {
      const results = buildPfqResults({
        attemptId: row.id,
        questionIds: row.question_ids,
        questionsById,
        answers: (answers ?? []).map((a) => ({
          question_id: a.question_id as string,
          selected: a.selected as string | null,
          correct: a.correct as boolean | null,
          flagged: Boolean(a.flagged),
          option_order: a.option_order as string[],
        })),
      });
      return {
        ok: true,
        status: "submitted",
        attemptId: row.id,
        startedAt: row.started_at,
        endsAt,
        submittedAt: row.submitted_at,
        score: row.score,
        questions,
        answers: selected,
        flags,
        results,
      };
    }

    // Auto-submit if time already elapsed (reload after expiry).
    if (Date.now() >= started + PFQ_DURATION_SECONDS * 1000) {
      const submitted = await submitPfqAttempt({
        attemptId: row.id,
        guestToken,
        reason: "timeout",
      });
      if (submitted.ok) {
        return loadPfqAttempt(input);
      }
    }

    return {
      ok: true,
      status: "in_progress",
      attemptId: row.id,
      startedAt: row.started_at,
      endsAt,
      submittedAt: null,
      score: null,
      questions,
      answers: selected,
      flags,
    };
  } catch (err) {
    console.error("[pfq] loadAttempt", err);
    return { ok: false, error: "Couldn’t load this attempt." };
  }
}

export async function savePfqAnswer(input: {
  attemptId: string;
  questionId: string;
  selected: string | null;
  guestToken?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const access = await requirePfqProUser();
    if (!access.ok) return access;
    const userId = access.userId;
    const guestToken = normalizeGuestToken(input.guestToken);
    const supabase = createServiceClient();

    const { data: attempt, error } = await supabase
      .from("pfq_attempts")
      .select("*")
      .eq("id", input.attemptId)
      .maybeSingle();
    if (error) throw error;
    if (!attempt) return { ok: false, error: "Attempt not found." };
    const row = attempt as PfqAttemptRow;
    if (row.submitted_at) return { ok: false, error: "Attempt already submitted." };
    if (!(await assertAttemptAccess(row, guestToken, userId))) {
      return { ok: false, error: "Access denied." };
    }
    if (!row.question_ids.includes(input.questionId)) {
      return { ok: false, error: "Unknown question." };
    }

    const selected =
      input.selected === null || input.selected === ""
        ? null
        : ["a", "b", "c", "d"].includes(input.selected)
          ? input.selected
          : null;

    const { error: updateError } = await supabase
      .from("pfq_answers")
      .update({ selected })
      .eq("attempt_id", input.attemptId)
      .eq("question_id", input.questionId);
    if (updateError) throw updateError;
    return { ok: true };
  } catch (err) {
    console.error("[pfq] saveAnswer", err);
    return { ok: false, error: "Couldn’t save answer." };
  }
}

export async function togglePfqFlag(input: {
  attemptId: string;
  questionId: string;
  flagged: boolean;
  guestToken?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const access = await requirePfqProUser();
    if (!access.ok) return access;
    const userId = access.userId;
    const guestToken = normalizeGuestToken(input.guestToken);
    const supabase = createServiceClient();

    const { data: attempt, error } = await supabase
      .from("pfq_attempts")
      .select("*")
      .eq("id", input.attemptId)
      .maybeSingle();
    if (error) throw error;
    if (!attempt) return { ok: false, error: "Attempt not found." };
    const row = attempt as PfqAttemptRow;
    if (row.submitted_at) return { ok: false, error: "Attempt already submitted." };
    if (!(await assertAttemptAccess(row, guestToken, userId))) {
      return { ok: false, error: "Access denied." };
    }

    const { error: updateError } = await supabase
      .from("pfq_answers")
      .update({ flagged: Boolean(input.flagged) })
      .eq("attempt_id", input.attemptId)
      .eq("question_id", input.questionId);
    if (updateError) throw updateError;
    return { ok: true };
  } catch (err) {
    console.error("[pfq] toggleFlag", err);
    return { ok: false, error: "Couldn’t update flag." };
  }
}

export type SubmitPfqResult =
  | { ok: true; results: PfqResultsPayload }
  | { ok: false; error: string };

export async function submitPfqAttempt(input: {
  attemptId: string;
  guestToken?: string | null;
  reason?: "manual" | "timeout";
}): Promise<SubmitPfqResult> {
  try {
    const access = await requirePfqProUser();
    if (!access.ok) return { ok: false, error: access.error };
    const userId = access.userId;
    const guestToken = normalizeGuestToken(input.guestToken);
    const supabase = createServiceClient();

    const { data: attempt, error } = await supabase
      .from("pfq_attempts")
      .select("*")
      .eq("id", input.attemptId)
      .maybeSingle();
    if (error) throw error;
    if (!attempt) return { ok: false, error: "Attempt not found." };
    const row = attempt as PfqAttemptRow;
    if (!(await assertAttemptAccess(row, guestToken, userId))) {
      return { ok: false, error: "Access denied." };
    }

    const { data: answers, error: answersError } = await supabase
      .from("pfq_answers")
      .select("question_id, selected, flagged, option_order, correct")
      .eq("attempt_id", row.id);
    if (answersError) throw answersError;

    const questionsById = await loadQuestionsByIds(row.question_ids);

    if (!row.submitted_at) {
      for (const a of answers ?? []) {
        const q = questionsById.get(a.question_id as string);
        if (!q) continue;
        const correct = isDisplayAnswerCorrect(
          q.answer,
          a.selected as string | null,
          a.option_order as string[],
        );
        await supabase
          .from("pfq_answers")
          .update({ correct })
          .eq("attempt_id", row.id)
          .eq("question_id", a.question_id);
        a.correct = correct;
      }
    }

    const results = buildPfqResults({
      attemptId: row.id,
      questionIds: row.question_ids,
      questionsById,
      answers: (answers ?? []).map((a) => ({
        question_id: a.question_id as string,
        selected: a.selected as string | null,
        correct: a.correct as boolean | null,
        flagged: Boolean(a.flagged),
        option_order: a.option_order as string[],
      })),
    });

    if (!row.submitted_at) {
      const { error: stampError } = await supabase
        .from("pfq_attempts")
        .update({
          submitted_at: new Date().toISOString(),
          score: results.score,
        })
        .eq("id", row.id);
      if (stampError) throw stampError;

      // Feed the combined coverage map (most recent answer wins per outcome).
      const byOutcome = new Map<
        string,
        { correct: boolean; question_id: string }
      >();
      for (const chip of results.coverage) {
        if (chip.state === "unattempted") continue;
        const gap = results.gaps.find((g) => g.code === chip.code);
        const review = results.reviews.find(
          (r) => r.learning_outcome === chip.code,
        );
        byOutcome.set(chip.code, {
          correct: chip.state === "correct",
          question_id: gap?.questionId || review?.id || "",
        });
      }
      await upsertCoverageSignals({
        userId,
        source: "mock",
        outcomes: [...byOutcome.entries()].map(([learning_outcome, v]) => ({
          learning_outcome,
          correct: v.correct,
          question_id: v.question_id,
        })),
      });
    }

    return { ok: true, results };
  } catch (err) {
    console.error("[pfq] submit", err);
    return { ok: false, error: "Couldn’t submit the mock." };
  }
}

/** Mint a guest token for the browser (no PII). */
export async function mintPfqGuestToken(): Promise<string> {
  const id = randomUUID();
  const hash = createHash("sha256").update(id).digest("hex").slice(0, 32);
  return `pfq_${hash}`;
}
