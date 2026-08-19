import {
  capture,
  setPersonProperties,
} from "@/components/PostHogProvider";
import { getAttribution } from "@/lib/analytics/attribution";

/**
 * Every custom PostHog event the app fires. Centralised on purpose: a typo in a
 * raw capture("quiz_atempt_submitted") string is invisible until you go looking
 * for a funnel that has no data in it. Named functions make that a compile
 * error instead.
 *
 * Naming: snake_case, object_pastTenseVerb. No PII in any property — Supabase
 * UUIDs only; never email, name, or learner-typed text.
 */

function bucketMessageLength(length: number): "short" | "medium" | "long" {
  if (length < 40) return "short";
  if (length < 160) return "medium";
  return "long";
}

function attributionProps() {
  const a = getAttribution();
  return {
    source: a.source,
    utm_source: a.utm_source,
    utm_medium: a.utm_medium,
    utm_campaign: a.utm_campaign,
    utm_content: a.utm_content,
    utm_term: a.utm_term,
    referrer_category: a.referrer_category,
  };
}

// —— Group A: Auth ————————————————————————————————————————————————

export function trackSignedUp(props: {
  signup_method: "email" | "google";
}): void {
  capture("signup_completed", {
    ...attributionProps(),
    signup_method: props.signup_method,
  });
}

export function trackSignedIn(props: { method: "email" | "google" }): void {
  capture("signed_in", props);
}

export function trackSignUpFailed(props: {
  method: "email" | "google";
  reason: string;
}): void {
  capture("sign_up_failed", props);
}

export function trackSignInFailed(props: {
  method: "email" | "google";
  reason: string;
}): void {
  capture("sign_in_failed", props);
}

export function trackPasswordResetRequested(): void {
  capture("password_reset_requested");
}

export function trackPasswordResetCompleted(): void {
  capture("password_reset_completed");
}

export function trackPasswordResetFailed(props: { reason: string }): void {
  capture("password_reset_failed", props);
}

// —— Group B: Course progression ————————————————————————————————————

export function trackCourseStarted(props: { course_id: string }): void {
  capture("course_started", props);
}

export function trackLoOpened(props: { lo_number: number }): void {
  capture("lo_opened", props);
}

export function trackLoStageReached(props: {
  lo_number: number;
  stage_id: string;
}): void {
  capture("lo_stage_reached", props);
}

export function trackSectionCompleted(props: {
  lo_number: number;
  section_id: string;
}): void {
  capture("section_completed", props);
}

export function trackLoCompleted(props: { lo_number: number }): void {
  capture("lo_completed", props);
}

export function trackCourseCompleted(props: { course_id: string }): void {
  capture("course_completed", props);
}

// —— Group C: Practice quizzes ——————————————————————————————————————

export function trackQuizAttemptSubmitted(props: {
  lo_number: number;
  question_type: string;
  is_correct: boolean | null;
  xp_awarded: number;
  context: string;
}): void {
  capture("quiz_attempt_submitted", props);
}

export function trackQuizSetOpened(props: {
  lo_number: number;
  quiz_set: number | string;
  tier_required: string;
}): void {
  capture("quiz_set_opened", props);
}

export function trackQuizSetLockedHit(props: {
  lo_number: number;
  quiz_set: number | string;
  lock_reason: string;
  current_tier: string;
}): void {
  capture("quiz_set_locked_hit", props);
}

export function trackHintViewed(props: {
  lo_number: number;
  question_type: string;
}): void {
  capture("hint_viewed", props);
}

// —— Homepage / CTA (v1) ————————————————————————————————————————————

export function trackCtaClicked(props: {
  variant: string;
  location: string;
}): void {
  capture("cta_clicked", props);
}

export function trackPmqOverviewPathwayViewed(props: {
  progress_units: number;
  stage_count: number;
}): void {
  capture("pmq_overview_pathway_viewed", props);
}

export function trackQuizDemoQuestionAnswered(props: {
  question_index: number;
  correct: boolean;
}): void {
  capture("quiz_demo_question_answered", props);
}

export function trackQuizDemoCompleted(props: {
  correct_count: number;
  total: number;
}): void {
  capture("quiz_demo_completed", props);
}

// —— Group D: Mock exams ————————————————————————————————————————————

export function trackMockExamStarted(props: {
  exam_set: number;
  tier: string;
}): void {
  capture("mock_exam_started", props);
}

export function trackMockPartSubmitted(props: {
  exam_set: number;
  part: number;
  answered_count: number;
  question_count: number;
}): void {
  capture("mock_part_submitted", props);
}

export function trackMockBreakStarted(props: { exam_set: number }): void {
  capture("mock_break_started", props);
}

export function trackMockPartTwoStarted(props: { exam_set: number }): void {
  capture("mock_part_two_started", props);
}

export function trackMockExamFinalized(props: {
  exam_set: number;
  total_score: number;
  max_score: number;
  passed: boolean;
}): void {
  capture("mock_exam_finalized", props);
}

export function trackMockExamExpired(props: {
  exam_set: number;
  total_score: number;
  part_1_submitted: boolean;
  part_2_submitted: boolean;
}): void {
  capture("mock_exam_expired", props);
}

export function trackMockExamAbandoned(props: {
  exam_set: number;
  answered_count: number;
}): void {
  capture("mock_exam_abandoned", props);
}

export function trackMockReviewOpened(props: {
  exam_set: number;
  status: string;
}): void {
  capture("mock_review_opened", props);
}

// —— Group E: Sly / monetisation ————————————————————————————————————

export function trackTutorOpened(props: {
  surface: "guest" | "course" | "dashboard";
  lo_number?: number;
}): void {
  capture("tutor_opened", props);
}

export function trackTutorMessageSent(props: {
  surface: "guest" | "course" | "dashboard";
  message_length: number;
}): void {
  capture("tutor_message_sent", {
    surface: props.surface,
    message_length_bucket: bucketMessageLength(props.message_length),
  });
}

export function trackTutorLimitHit(props: {
  surface: "guest" | "course" | "dashboard";
  limit_type: string;
}): void {
  capture("tutor_limit_hit", props);
}

export function trackAiTutorUnlockClicked(props: {
  location: string;
  price_cents: number;
}): void {
  capture("ai_tutor_unlock_clicked", props);
}

export function trackCheckoutStarted(props: {
  product: string;
  price_cents: number;
}): void {
  capture("checkout_started", props);
}

export function trackCheckoutCompleted(props: {
  product: string;
  price_cents: number;
}): void {
  capture("checkout_completed", props);
}

export function trackTopupClicked(props: { amount_cents: number }): void {
  capture("topup_clicked", props);
}

// —— Group F: Gamification ——————————————————————————————————————————

export function trackStreakIncremented(props: { new_streak: number }): void {
  capture("streak_incremented", props);
}

export function trackStreakBroken(props: { previous_streak: number }): void {
  capture("streak_broken", props);
}

export function trackXpAwarded(props: {
  amount: number;
  total_xp: number;
  source: string;
}): void {
  capture("xp_awarded", props);
}

export function trackExamDateSet(props: { days_until_exam: number }): void {
  capture("exam_date_set", props);
}

export function trackLoCoreSequenceViewed(props: {
  lo_number: number;
  outcome_code: string;
}): void {
  capture("lo_core_sequence_viewed", props);
}

export function trackLoCoreSequenceStarted(props: {
  lo_number: number;
  outcome_code: string;
}): void {
  capture("lo_core_sequence_started", props);
}

export function trackLoCoreSequenceChecked(props: {
  lo_number: number;
  outcome_code: string;
  correct_count: number;
  total: number;
}): void {
  capture("lo_core_sequence_checked", props);
}

export function trackLoCoreSequenceRevealed(props: {
  lo_number: number;
  outcome_code: string;
}): void {
  capture("lo_core_sequence_revealed", props);
}

export function trackLoCoreSequenceRetried(props: {
  lo_number: number;
  outcome_code: string;
}): void {
  capture("lo_core_sequence_retried", props);
}

// —— Growth: free mock / leads ——————————————————————————————————————

export function trackFreeMockCompleted(props: {
  score: number;
  max_score: number;
  marketing_consent: boolean;
}): void {
  capture("free_mock_completed", {
    ...attributionProps(),
    score: props.score,
    max_score: props.max_score,
    marketing_consent: props.marketing_consent,
  });
}

export function trackLeadCaptured(props: {
  score: number;
  max_score: number;
  marketing_consent: boolean;
  lead_source: "free_mock_exam";
}): void {
  capture("lead_captured", {
    ...attributionProps(),
    score: props.score,
    max_score: props.max_score,
    marketing_consent: props.marketing_consent,
    lead_source: props.lead_source,
  });
}

// —— Group G: Person properties ——————————————————————————————————————

export function setAnalyticsPersonProperties(props: {
  tier?: string;
  has_exam_date?: boolean;
  days_until_exam?: number | null;
  current_streak?: number;
  total_xp?: number;
  los_completed?: number;
}): void {
  const cleaned: Record<string, string | number | boolean | null> = {};
  if (props.tier != null) cleaned.tier = props.tier;
  if (props.has_exam_date != null) cleaned.has_exam_date = props.has_exam_date;
  if (props.days_until_exam !== undefined) {
    cleaned.days_until_exam = props.days_until_exam;
  }
  if (props.current_streak != null) cleaned.current_streak = props.current_streak;
  if (props.total_xp != null) cleaned.total_xp = props.total_xp;
  if (props.los_completed != null) cleaned.los_completed = props.los_completed;
  if (Object.keys(cleaned).length === 0) return;
  setPersonProperties(cleaned);
}
