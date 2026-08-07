import { capture } from "@/components/PostHogProvider";

/**
 * Every custom PostHog event the app fires. Centralised on purpose: a typo in a
 * raw capture("quiz_atempt_submitted") string is invisible until you go looking
 * for a funnel that has no data in it. Named functions make that a compile
 * error instead.
 *
 * Naming convention: snake_case, object_pastTenseVerb. Match it exactly for any
 * event added later.
 *
 * No PII in any property. Supabase UUIDs only, and even those are usually
 * redundant because identify() already attaches the person.
 */

export function trackCtaClicked(props: {
  variant: string;
  location: string;
}): void {
  capture("cta_clicked", props);
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

export function trackQuizAttemptSubmitted(props: {
  lo_number: number;
  question_type: string;
  is_correct: boolean | null;
  xp_awarded: number;
  context: string;
}): void {
  capture("quiz_attempt_submitted", props);
}

export function trackStreakIncremented(props: { new_streak: number }): void {
  capture("streak_incremented", props);
}

export function trackLoCompleted(props: { lo_number: number }): void {
  capture("lo_completed", props);
}

export function trackAiTutorUnlockClicked(props: {
  location: string;
  price_cents: number;
}): void {
  capture("ai_tutor_unlock_clicked", props);
}
