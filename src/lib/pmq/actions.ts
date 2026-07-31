"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isDemoSkipAuth } from "@/lib/demo";
import { isQaMode } from "@/lib/qa";
import {
  formatGbp,
  PMQ_COURSE_ID,
  pmqLoHref,
  PMQ_SLUG,
} from "@/lib/pmq/constants";
import {
  getAiTutorEntitlement,
  getPmqQuizSetQuestions,
  getPmqTier,
} from "@/lib/pmq/queries";
import { canAccessQuizSet, tierForQuizSet } from "@/lib/pmq/tiers";
import { quizSetContext } from "@/lib/pmq/quiz-sets";
import { STAGE_REACHED_COLUMN, type LoStageId } from "@/lib/pmq/lo-stages";
import {
  SLY_TOPUP_MIN_CENTS,
  SLY_UNLOCK_CREDIT_GBP_CENTS,
  SLY_UNLOCK_PRICE_CENTS,
  topUpCreditGbpCents,
} from "@/lib/tutor/constants";
import type { PmqQuestion } from "@/types/pmq";

const PMQ_PATHS = [
  `/courses/${PMQ_SLUG}`,
  "/dashboard",
] as const;

function revalidatePmqPaths(loNumber?: number) {
  if (loNumber != null) {
    revalidatePath(pmqLoHref(loNumber));
  }
  for (const path of PMQ_PATHS) {
    revalidatePath(path);
  }
  revalidatePath("/courses/pmq-in-5-days/mock");
}

function utcDateString(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function utcYesterdayString(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return utcDateString(d);
}

function computeXpAwarded(
  questionType: string,
  isCorrect: boolean | null,
): number {
  if (
    questionType === "multiple_choice" ||
    questionType === "select_from_list"
  ) {
    return isCorrect === true ? 10 : 0;
  }
  if (questionType === "long_answer" || questionType === "short_answer") {
    return 2;
  }
  return 0;
}

async function awardXpAndUpdateStreak(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  courseId: string,
  questionType: string,
  isCorrect: boolean | null,
): Promise<{ xpAwarded: number; totalXp: number; currentStreak: number }> {
  const xpAwarded = computeXpAwarded(questionType, isCorrect);
  const today = utcDateString();
  const yesterday = utcYesterdayString();

  const { data: stats } = await supabase
    .from("user_course_stats")
    .select("total_xp, current_streak, longest_streak, last_activity_date")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  const prev = {
    total_xp: stats?.total_xp ?? 0,
    current_streak: stats?.current_streak ?? 0,
    longest_streak: stats?.longest_streak ?? 0,
    last_activity_date: stats?.last_activity_date ?? null,
  };

  const totalXp = prev.total_xp + xpAwarded;
  let currentStreak = prev.current_streak;
  let longestStreak = prev.longest_streak;
  let lastActivityDate = prev.last_activity_date;

  if (prev.last_activity_date !== today) {
    if (prev.last_activity_date === yesterday) {
      currentStreak = prev.current_streak + 1;
    } else {
      currentStreak = 1;
    }
    longestStreak = Math.max(prev.longest_streak, currentStreak);
    lastActivityDate = today;
  }

  const row = {
    user_id: userId,
    course_id: courseId,
    total_xp: totalXp,
    current_streak: currentStreak,
    longest_streak: longestStreak,
    last_activity_date: lastActivityDate,
    updated_at: new Date().toISOString(),
  };

  if (stats) {
    await supabase
      .from("user_course_stats")
      .update(row)
      .eq("user_id", userId)
      .eq("course_id", courseId);
  } else {
    await supabase.from("user_course_stats").insert(row);
  }

  return { xpAwarded, totalXp, currentStreak };
}

export async function submitQuizAttempt(input: {
  questionId: string;
  courseId: string;
  learningObjective: string;
  submittedAnswer: string | Record<string, string>;
  isCorrect: boolean | null;
  loNumber: number;
  checkpointTotal?: number;
  /** Defaults to practice_quiz. Paid sets (quiz_set_N) must not gate LO completion. */
  context?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (isDemoSkipAuth()) return { ok: true as const };
    return { error: "not_signed_in" as const };
  }

  const attemptContext = input.context ?? "practice_quiz";

  const { data: existingAttempt } = await supabase
    .from("attempts")
    .select("id")
    .eq("user_id", user.id)
    .eq("question_id", input.questionId)
    .eq("context", attemptContext)
    .limit(1)
    .maybeSingle();

  if (existingAttempt) {
    return { error: "already_attempted" as const };
  }

  const { error } = await supabase.from("attempts").insert({
    user_id: user.id,
    question_id: input.questionId,
    course_id: input.courseId,
    learning_objective: input.learningObjective,
    context: attemptContext,
    submitted_answer: input.submittedAnswer,
    is_correct: input.isCorrect,
    attempted_at: new Date().toISOString(),
  });

  if (error) {
    console.error(
      `[submitQuizAttempt] insert failed — user=${user.id} question=${input.questionId} context=${attemptContext}:`,
      error.message,
    );
    return { error: error.message };
  }

  const { data: question } = await supabase
    .from("questions")
    .select("section_id, question_type")
    .eq("id", input.questionId)
    .maybeSingle();

  // LO completion / quiz_completed_at stays scoped to practice_quiz only.
  if (question?.section_id && attemptContext === "practice_quiz") {
    await maybeMarkQuizComplete(
      supabase,
      user.id,
      question.section_id,
      input.courseId,
      input.loNumber,
      input.checkpointTotal,
    );
  }

  let gamification = { xpAwarded: 0, totalXp: 0, currentStreak: 0 };
  if (question?.question_type) {
    gamification = await awardXpAndUpdateStreak(
      supabase,
      user.id,
      input.courseId,
      question.question_type,
      input.isCorrect,
    );
  }

  if (
    question?.section_id &&
    input.checkpointTotal != null &&
    attemptContext === "practice_quiz"
  ) {
    await tryMarkSectionCompleteIfReady(
      supabase,
      user.id,
      question.section_id,
      input.courseId,
      input.loNumber,
      input.checkpointTotal,
    );
  }

  revalidatePmqPaths(input.loNumber);
  return {
    ok: true as const,
    xpAwarded: gamification.xpAwarded,
    totalXp: gamification.totalXp,
    currentStreak: gamification.currentStreak,
  };
}

/**
 * Tier-gated practice quiz sets (LIC-22 / LIC-59 / LIC-98).
 * Set 1 is free and loaded on the page; sets 2-5 need Pro, sets 6-8 need AI Pro.
 * Returns `locked` or `locked_ai_pro` so the caller can offer the right upgrade.
 */
export async function getQuizSet(input: {
  loNumber: number;
  /** Paid set number (2+). Set 1 is free and loaded on the page. */
  setNumber: number;
}): Promise<
  | {
      ok: true;
      questions: PmqQuestion[];
      priorAttempts: Record<
        string,
        {
          submittedAnswer: string | Record<string, string>;
          isCorrect: boolean | null;
        }
      >;
    }
  | { error: "locked" | "not_signed_in" | "not_found" | string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "not_signed_in" };
  }

  if (!Number.isInteger(input.setNumber) || input.setNumber < 2) {
    return { error: "not_found" };
  }

  // Two unlock levels, not one: sets 2-5 are Pro, sets 6-8 are AI Pro. A plain
  // "has entitlement" check here would hand every Pro buyer the AI Pro sets.
  const userTier = await getPmqTier(supabase, user.id, PMQ_COURSE_ID);
  if (!canAccessQuizSet(userTier, input.setNumber)) {
    return {
      error: tierForQuizSet(input.setNumber) === "ai_pro" ? "locked_ai_pro" : "locked",
    };
  }

  const { data: section, error: sectionError } = await supabase
    .from("sections")
    .select("id")
    .eq("course_id", PMQ_COURSE_ID)
    .eq("order_index", input.loNumber)
    .maybeSingle();

  if (sectionError) {
    return { error: sectionError.message };
  }
  if (!section) {
    return { error: "not_found" };
  }

  const context = quizSetContext(input.setNumber);
  const questions = await getPmqQuizSetQuestions(
    supabase,
    section.id,
    context,
    input.loNumber,
  );

  const questionIds = questions.map((q) => q.id);
  let priorAttempts: Record<
    string,
    { submittedAnswer: string | Record<string, string>; isCorrect: boolean | null }
  > = {};

  if (questionIds.length > 0) {
    const { data: attempts } = await supabase
      .from("attempts")
      .select("question_id, submitted_answer, is_correct, attempted_at")
      .eq("user_id", user.id)
      .eq("context", context)
      .in("question_id", questionIds)
      .order("attempted_at", { ascending: true });

    for (const row of attempts ?? []) {
      if (!row.question_id || row.submitted_answer == null) continue;
      priorAttempts[row.question_id] = {
        submittedAnswer: row.submitted_answer as
          | string
          | Record<string, string>,
        isCorrect: row.is_correct,
      };
    }
  }

  return { ok: true, questions, priorAttempts };
}

async function maybeMarkQuizComplete(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  sectionId: string,
  courseId: string,
  loNumber: number,
  checkpointTotal?: number,
) {
  const [{ data: sectionQuestions }, { data: attempts }] = await Promise.all([
    supabase
      .from("questions")
      .select("id")
      .eq("section_id", sectionId)
      .eq("context", "practice_quiz"),
    supabase
      .from("attempts")
      .select("question_id")
      .eq("user_id", userId)
      .eq("context", "practice_quiz")
      .eq("course_id", courseId),
  ]);

  if (!sectionQuestions?.length) return;

  const sectionQuestionIds = new Set(sectionQuestions.map((q) => q.id));
  const attemptedIds = new Set(
    (attempts ?? [])
      .filter((a) => sectionQuestionIds.has(a.question_id))
      .map((a) => a.question_id),
  );

  const allAnswered = sectionQuestions.every((q) => attemptedIds.has(q.id));
  if (!allAnswered) return;

  const now = new Date().toISOString();
  const { data: existing } = await supabase
    .from("section_progress")
    .select("id, quiz_completed_at")
    .eq("user_id", userId)
    .eq("section_id", sectionId)
    .maybeSingle();

  if (existing?.quiz_completed_at) {
    if (checkpointTotal != null && checkpointTotal > 0) {
      await tryMarkSectionCompleteIfReady(
        supabase,
        userId,
        sectionId,
        courseId,
        loNumber,
        checkpointTotal,
      );
    }
    return;
  }

  if (existing?.id) {
    await supabase
      .from("section_progress")
      .update({ quiz_completed_at: now, updated_at: now })
      .eq("id", existing.id);
  } else {
    await supabase.from("section_progress").insert({
      user_id: userId,
      section_id: sectionId,
      course_id: courseId,
      checklist_state: [],
      quiz_completed_at: now,
      updated_at: now,
    });
  }

  if (checkpointTotal != null && checkpointTotal > 0) {
    await tryMarkSectionCompleteIfReady(
      supabase,
      userId,
      sectionId,
      courseId,
      loNumber,
      checkpointTotal,
    );
  }

  const { maybeDeliverCourseCompletionSummary } = await import(
    "@/lib/tutor/course-completion-summary"
  );
  await maybeDeliverCourseCompletionSummary(supabase, userId, courseId);

  revalidatePmqPaths(loNumber);
}

async function tryMarkSectionCompleteIfReady(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  sectionId: string,
  courseId: string,
  loNumber: number,
  checkpointTotal: number,
) {
  const { data: progress } = await supabase
    .from("section_progress")
    .select("checklist_state, completed_at")
    .eq("user_id", userId)
    .eq("section_id", sectionId)
    .maybeSingle();

  if (progress?.completed_at) return;

  const checkedCount = Array.isArray(progress?.checklist_state)
    ? progress.checklist_state.length
    : 0;
  if (checkpointTotal > 0 && checkedCount < checkpointTotal) return;

  const now = new Date().toISOString();
  const { data: existing } = await supabase
    .from("section_progress")
    .select("id")
    .eq("user_id", userId)
    .eq("section_id", sectionId)
    .maybeSingle();

  if (existing?.id) {
    await supabase
      .from("section_progress")
      .update({ completed_at: now, updated_at: now })
      .eq("id", existing.id);
  } else {
    await supabase.from("section_progress").insert({
      user_id: userId,
      section_id: sectionId,
      course_id: courseId,
      checklist_state: [],
      completed_at: now,
      updated_at: now,
    });
  }

  revalidatePmqPaths(loNumber);
}

/**
 * Persists that the learner has reached one of the 5 pre-quiz pathway
 * stages (Orient/Learn/Video/Audio/Apply) to `section_progress`, so
 * per-LO and overall course progress — and which stage to resume on —
 * are entirely DB-backed (the client-only sessionStorage journey cache
 * this used to sit alongside has been removed; see lo-stages.ts and
 * OPERATIONS.md). Idempotent: only sets the timestamp if it isn't
 * already set, so re-visiting a stage never resets its reached time.
 */
export async function markLoStageReached(input: {
  sectionId: string;
  courseId: string;
  loNumber: number;
  stageId: LoStageId;
}) {
  const column = STAGE_REACHED_COLUMN[input.stageId];
  if (!column) return { ok: true as const };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (isDemoSkipAuth()) return { ok: true as const };
    return { error: "not_signed_in" as const };
  }

  const { data: existing } = await supabase
    .from("section_progress")
    .select("id, " + column)
    .eq("user_id", user.id)
    .eq("section_id", input.sectionId)
    .maybeSingle();

  const existingRow = existing as unknown as {
    id?: string;
    [key: string]: unknown;
  } | null;
  if (existingRow && existingRow[column]) {
    return { ok: true as const };
  }

  const now = new Date().toISOString();

  if (existingRow?.id) {
    const { error } = await supabase
      .from("section_progress")
      .update({ [column]: now, updated_at: now })
      .eq("id", existingRow.id);
    if (error) {
      console.error(
        `[markLoStageReached] update failed — user=${user.id} section=${input.sectionId} stage=${input.stageId}:`,
        error.message,
      );
      return { error: error.message };
    }
  } else {
    const { error } = await supabase.from("section_progress").insert({
      user_id: user.id,
      section_id: input.sectionId,
      course_id: input.courseId,
      checklist_state: [],
      [column]: now,
      updated_at: now,
    });
    if (error) {
      console.error(
        `[markLoStageReached] insert failed — user=${user.id} section=${input.sectionId} stage=${input.stageId}:`,
        error.message,
      );
      return { error: error.message };
    }
  }

  revalidatePmqPaths(input.loNumber);
  return { ok: true as const };
}

export async function markSectionComplete(input: {
  sectionId: string;
  courseId: string;
  loNumber: number;
  /** Required checklist length — seal gated on full checklist only. */
  checkpointTotal?: number;
  /** QA-only bypass for ungated complete (requires QA mode env). */
  forceQa?: boolean;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (isDemoSkipAuth()) return { ok: true as const };
    return { error: "Not signed in" };
  }

  const now = new Date().toISOString();
  const { data: existing } = await supabase
    .from("section_progress")
    .select("id, completed_at, checklist_state")
    .eq("user_id", user.id)
    .eq("section_id", input.sectionId)
    .maybeSingle();

  if (existing?.completed_at) {
    return { ok: true as const };
  }

  const allowForce = Boolean(input.forceQa) && isQaMode();
  if (!allowForce) {
    const checkpointTotal = input.checkpointTotal ?? 0;
    const checkedCount = Array.isArray(existing?.checklist_state)
      ? existing.checklist_state.length
      : 0;

    if (checkpointTotal > 0 && checkedCount < checkpointTotal) {
      return { error: "Finish the checklist to lock this LO." };
    }
  }

  if (existing?.id) {
    const { error } = await supabase
      .from("section_progress")
      .update({ completed_at: now, updated_at: now })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("section_progress").insert({
      user_id: user.id,
      section_id: input.sectionId,
      course_id: input.courseId,
      checklist_state: [],
      completed_at: now,
      updated_at: now,
    });
    if (error) return { error: error.message };
  }

  // LIC-52: also fire from LO-complete path (not only quiz_completed_at).
  const { maybeDeliverCourseCompletionSummary } = await import(
    "@/lib/tutor/course-completion-summary"
  );
  await maybeDeliverCourseCompletionSummary(supabase, user.id, input.courseId);

  revalidatePmqPaths(input.loNumber);
  return { ok: true as const };
}

export async function updateCheckpointProgress(input: {
  sectionId: string;
  courseId: string;
  checkpointIndex: number;
  checked: boolean;
  loNumber: number;
  checkpointTotal?: number;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (isDemoSkipAuth()) return { ok: true, checklist_state: [] };
    return { error: "Not signed in" };
  }

  const { data: existing } = await supabase
    .from("section_progress")
    .select("id, checklist_state, completed_at")
    .eq("user_id", user.id)
    .eq("section_id", input.sectionId)
    .maybeSingle();

  if (existing?.completed_at) {
    return {
      ok: true,
      checklist_state: Array.isArray(existing.checklist_state)
        ? existing.checklist_state
        : [],
    };
  }

  const current = new Set<number>(
    Array.isArray(existing?.checklist_state) ? existing.checklist_state : [],
  );

  if (input.checked) {
    current.add(input.checkpointIndex);
  } else {
    current.delete(input.checkpointIndex);
  }

  const checklist_state = Array.from(current).sort((a, b) => a - b);

  if (existing?.id) {
    const { error } = await supabase
      .from("section_progress")
      .update({ checklist_state, updated_at: new Date().toISOString() })
      .eq("id", existing.id);

    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("section_progress").insert({
      user_id: user.id,
      section_id: input.sectionId,
      course_id: input.courseId,
      checklist_state,
      updated_at: new Date().toISOString(),
    });

    if (error) return { error: error.message };
  }

  if (input.checkpointTotal != null && input.checkpointTotal > 0) {
    await tryMarkSectionCompleteIfReady(
      supabase,
      user.id,
      input.sectionId,
      input.courseId,
      input.loNumber,
      input.checkpointTotal,
    );
  }

  revalidatePmqPaths(input.loNumber);
  return { ok: true, checklist_state };
}

/**
 * Consumer Contracts (Information, Cancellation and Additional Charges)
 * Regulations 2013 — digital content supplied immediately.
 *
 * A UK consumer normally has 14 days to cancel a distance contract for any
 * reason. For digital content delivered straight away, that right is only lost
 * if **all three** of these happen *before* delivery starts:
 *
 *   1. the consumer gives express consent to immediate supply,
 *   2. they acknowledge that they thereby lose the right to cancel, and
 *   3. the trader confirms both in a durable medium.
 *
 * Miss any one and the buyer keeps the full 14-day right *even after consuming
 * the content* — i.e. an unconditional refund on demand. Our Terms §5 already
 * promise a 14-day window "if unused", but the promise isn't what matters here;
 * the captured consent is.
 *
 * `consent_collection.terms_of_service: "required"` makes Stripe render a
 * blocking checkbox and record the outcome on the Session
 * (`consent.terms_of_service = "accepted"`), which is our evidence. The
 * `custom_text` supplies the acknowledgement wording — Stripe's default label
 * only covers the Terms, not the cancellation waiver.
 *
 * ⚠️ Dashboard dependency: `consent_collection` requires a Terms of service URL
 * set under Stripe → Settings → Business → Public details. Without it Stripe
 * rejects session creation, so checkout will fail closed (loudly) rather than
 * silently drop the consent. That's deliberate — a missing waiver is a real
 * liability, so it should break the build-out, not pass quietly.
 *
 * Educational note, not legal advice: the *mechanism* here is sound but the
 * exact wording is worth a solicitor's eye before volume goes up.
 */
const DIGITAL_CONTENT_CONSENT: Pick<
  // `import type` is erased at compile time, so this keeps the Stripe SDK out of
  // the runtime graph while still type-checking the shape against the real API.
  import("stripe").Stripe.Checkout.SessionCreateParams,
  "consent_collection" | "custom_text"
> = {
  consent_collection: {
    terms_of_service: "required",
  },
  custom_text: {
    terms_of_service_acceptance: {
      message:
        "I agree to the Terms of Service and Privacy Policy. I want access straight away, and I understand that once access begins I lose my 14-day right to cancel — except where the content is faulty or not as described, which my statutory rights still cover.",
    },
  },
};

export async function createAiTutorCheckout(input: {
  loNumber?: number;
  returnPath?: string;
} = {}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not signed in" };
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!stripeKey) {
    return { error: "Stripe is not configured" };
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id, name, exam_config")
    .eq("id", PMQ_COURSE_ID)
    .single();

  if (!course) {
    return { error: "Course not found" };
  }

  const priceCents = SLY_UNLOCK_PRICE_CENTS;

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(stripeKey);

  const returnPath =
    input.returnPath ?? pmqLoHref(input.loNumber ?? 1);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "gbp",
          unit_amount: priceCents,
          product_data: {
            name: "Pro Bundle — PMQ in 5 days",
            // Built from the same constants as the amount charged. This string
            // renders on the Stripe checkout page beside the price, so a
            // hardcoded figure here drifting from `unit_amount` shows the buyer
            // two different prices at the moment of payment — a misleading price
            // indication, not just untidy copy. It said "£9.99" for a while after
            // the price moved to £8. Never hardcode the number again.
            description: `One-time ${formatGbp(SLY_UNLOCK_PRICE_CENTS)} unlock including ${formatGbp(SLY_UNLOCK_CREDIT_GBP_CENTS)} of Sly fair-usage credit, plus Sly tutoring, extra quiz sets, and the AI-graded full mock.`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      user_id: user.id,
      course_id: PMQ_COURSE_ID,
      // The tier this purchase grants. Read by the Stripe webhook and written
      // straight into `feature_entitlements.feature` — see tiers.ts.
      feature: "pro",
    },
    ...DIGITAL_CONTENT_CONSENT,
    success_url: `${appUrl}${returnPath}?tutor_unlocked=1`,
    cancel_url: `${appUrl}${returnPath}`,
    customer_email: user.email ?? undefined,
  });

  if (!session.url) {
    return { error: "Could not create checkout session" };
  }

  return { url: session.url };
}

export async function createSlyTopUpCheckout(input: {
  amountCents: number;
  returnPath?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not signed in" };
  }

  const amountCents = Math.round(input.amountCents);
  if (
    !Number.isFinite(amountCents) ||
    amountCents < SLY_TOPUP_MIN_CENTS
  ) {
    return { error: "Minimum top-up is £1" };
  }

  if (amountCents > 50000) {
    return { error: "Maximum top-up is £500" };
  }

  const entitlement = await getAiTutorEntitlement(
    supabase,
    user.id,
    PMQ_COURSE_ID,
  );
  if (!entitlement) {
    return { error: "Unlock Sly before topping up" };
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!stripeKey) {
    return { error: "Stripe is not configured" };
  }

  const creditCents = topUpCreditGbpCents(amountCents);
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(stripeKey);
  const returnPath = input.returnPath ?? "/dashboard";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "gbp",
          unit_amount: amountCents,
          product_data: {
            name: "Sly fair-usage top-up",
            description: `Adds £${(creditCents / 100).toFixed(2)} to your Sly fair-usage metre (70% of payment; includes 30% platform fee).`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      user_id: user.id,
      course_id: PMQ_COURSE_ID,
      feature: "ai_tutor_topup",
      amount_cents: String(amountCents),
    },
    ...DIGITAL_CONTENT_CONSENT,
    success_url: `${appUrl}${returnPath}?sly_topup=1`,
    cancel_url: `${appUrl}${returnPath}`,
    customer_email: user.email ?? undefined,
  });

  if (!session.url) {
    return { error: "Could not create checkout session" };
  }

  return { url: session.url };
}
