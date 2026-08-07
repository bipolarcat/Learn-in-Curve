# Cursor prompt — wire PostHog v1 event taxonomy (LIC-19)

**Written 2026-08-07 by Claude. Verified against actual repo state, not against
`ANALYTICS_SPEC.md` alone — that spec has drifted in places and this file wins
where they disagree.**

## Context you need before touching anything

PostHog is already live and consent-gated. `src/components/PostHogProvider.tsx`
works correctly and is receiving real traffic from `www.learnincurve.com` since
2026-08-06. **Do not restructure the provider's consent logic.** It implements a
PECR requirement (no capture before consent) and is deliberately written the way
it is.

What is missing is everything downstream: the exported `capture()` helper in
that provider has **zero callers**. No custom event has ever fired. This prompt
wires them.

Three constraints that shape the design:

1. **`capture()` is client-only.** It reads a module-level `posthogInstance` that
   only exists in the browser. Server actions in `src/lib/pmq/actions.ts` cannot
   call it. Server-side capture is explicitly out of scope (`ANALYTICS_SPEC.md`
   §6), so the pattern is: **the server action returns what happened; the client
   caller fires the event.**
2. **No `identify()` call exists anywhere in the codebase**, while the provider
   sets `person_profiles: "identified_only"`. Net effect: PostHog is creating
   **no person profiles at all**, so retention, cohorts and per-user funnels are
   currently impossible. Task 1 below fixes this and is the highest-value item
   here — wire it even if you ship nothing else.
3. **`submitQuizAttempt` has five call sites in `QuizRunner.tsx`** (lines ~268,
   ~353, ~464, ~553, ~639). Do not copy-paste a `capture()` block five times.
   Route them through one shared helper (Task 3).

---

## Task 1 — Identify signed-in users

### 1a. Add an `identify` export to `src/components/PostHogProvider.tsx`

Alongside the existing `capture()` export at the bottom of the file:

```ts
/**
 * Associates subsequent events with a stable user. Required for retention,
 * cohorts and any per-user funnel — with `person_profiles: "identified_only"`
 * PostHog creates no profile at all until this fires.
 *
 * Pass the Supabase user UUID only. Never email, never name: ANALYTICS_SPEC.md
 * §5 forbids PII in PostHog, and a UUID is enough to join back to Supabase
 * when we need the human behind a number.
 */
export function identify(
  userId: string,
  properties?: Record<string, unknown>,
): void {
  posthogInstance?.identify(userId, properties);
}
```

### 1b. New client component `src/components/analytics/AnalyticsIdentify.tsx`

```tsx
"use client";

import { useEffect } from "react";
import { identify } from "@/components/PostHogProvider";

/**
 * Mounted in the authenticated layout so every signed-in page view is attached
 * to a person. Safe to mount repeatedly — posthog.identify is idempotent for
 * the same distinct_id.
 *
 * Deliberately takes only the UUID and the tier. Tier is a person property
 * (not an event property) because it describes the user, not the moment.
 */
export function AnalyticsIdentify({
  userId,
  tier,
}: {
  userId: string;
  tier?: string;
}) {
  useEffect(() => {
    if (!userId) return;
    identify(userId, tier ? { tier } : undefined);
  }, [userId, tier]);

  return null;
}
```

### 1c. Mount it

In `src/app/(site)/layout.tsx` and `src/app/courses/layout.tsx`, fetch the
current user server-side (these are already server components; use the existing
`createClient()` from `@/lib/supabase/server` pattern used elsewhere) and render
`<AnalyticsIdentify userId={user.id} tier={tier} />` when a user exists. Get
`tier` from the existing `getPmqTier` in `@/lib/pmq/queries` if it is cheap to
call there; if it adds a query round-trip to every page load, **omit `tier` and
tell Sim** rather than slowing the app down for an analytics nicety.

**Do not** call identify for signed-out visitors. Anonymous events are fine and
intentional.

---

## Task 2 — Central event module `src/lib/analytics/events.ts`

Single source of truth so event names can never drift via typo. Every event
below is fired through a named function, never a raw string at the call site.

```ts
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
```

---

## Task 3 — Quiz attempt, streak, LO completion

### 3a. Extend the `submitQuizAttempt` return value

`src/lib/pmq/actions.ts` line 128. It currently returns `xpAwarded`, `totalXp`,
`currentStreak` — enough for XP, **not** enough to know whether the streak
actually *incremented* this call or whether an LO completed. Without that the
client would fire `streak_incremented` on every single answer, which makes the
retention signal meaningless.

Change `awardXpAndUpdateStreak` (line 65) to also return
`streakIncremented: boolean` — true only when the streak value it wrote is
greater than the value it read. Then extend the final return at line 228:

```ts
return {
  ok: true as const,
  xpAwarded: gamification.xpAwarded,
  totalXp: gamification.totalXp,
  currentStreak: gamification.currentStreak,
  // Analytics only — lets the client fire the right event without re-deriving
  // state it can't see. Both default false so existing callers are unaffected.
  streakIncremented: gamification.streakIncremented,
  loCompleted: /* true when tryMarkSectionCompleteIfReady actually completed
                  the LO on this call, not when it was already complete */,
  questionType: question?.question_type ?? null,
};
```

`tryMarkSectionCompleteIfReady` (called at line 217) must return a boolean for
this. **Read that function before changing it** — per `OPERATIONS.md`,
`section_progress` has two completion signals (timestamps *and*
`checklist_state`), so "did this call complete the LO" is not as simple as it
looks. If it is ambiguous, return `false` and flag it to Sim rather than
guessing and creating a false `lo_completed` count.

### 3b. One shared helper in `QuizRunner.tsx`

Add near the top of the component file:

```ts
function trackAttempt(
  result: Awaited<ReturnType<typeof submitQuizAttempt>>,
  loNumber: number,
  context: string,
) {
  if (!("ok" in result) || !result.ok) return;
  trackQuizAttemptSubmitted({
    lo_number: loNumber,
    question_type: result.questionType ?? "unknown",
    is_correct: null, // pass the real value from the call site
    xp_awarded: result.xpAwarded ?? 0,
    context,
  });
  if (result.streakIncremented) {
    trackStreakIncremented({ new_streak: result.currentStreak ?? 0 });
  }
  if (result.loCompleted) {
    trackLoCompleted({ lo_number: loNumber });
  }
}
```

Adjust the signature so `is_correct` comes from the call site (each of the five
sites already has it in scope). Then call `trackAttempt(result, …)` immediately
after each of the five `await submitQuizAttempt(...)` calls at lines ~268, ~353,
~464, ~553, ~639. **No other logic changes at those sites.**

---

## Task 4 — Homepage funnel events

### 4a. `src/components/QuizDemo.tsx`

- Line ~182, inside `handleAnswer`: fire
  `trackQuizDemoQuestionAnswered({ question_index: i, correct })`.
- When the demo reaches its final state (the branch that renders the
  `enrolHref` Link at line ~215): fire `trackQuizDemoCompleted` **once** — guard
  it with a `useRef` so a re-render does not double-count.
- On the `enrolHref` Link click (line ~215): fire
  `trackCtaClicked({ variant: "enrol", location: "quiz_demo" })`.

### 4b. Homepage hero/header CTAs — `src/app/(site)/page.tsx`

Fire `trackCtaClicked({ variant: <the button's copy>, location: "hero" | "header" })`
on each primary CTA. This is the input to the `homepage-cta-copy` experiment in
`ANALYTICS_SPEC.md` §4 — **do not build the feature flag itself in this pass**,
just the event, so the flag has data waiting for it when Sim turns it on.

### 4c. AI tutor paywall

Wherever `createAiTutorCheckout` (`actions.ts` line 751) is triggered from the
UI, fire `trackAiTutorUnlockClicked({ location, price_cents: SLY_UNLOCK_PRICE_CENTS })`
**before** the redirect to Stripe. Fire on the click, not on successful
checkout — the whole point is measuring intent that does not convert.

---

## Definition of done

- `npm run build` passes with no new type errors.
- `grep -rn "capture(\"" src/` returns **only** `PostHogProvider.tsx` (the two
  `$pageview` calls) and `src/lib/analytics/events.ts`. Every other call site
  goes through a named function.
- Manually: accept cookies on localhost, answer a practice quiz question, and
  confirm in the browser Network tab that a request to `eu.i.posthog.com`
  carries `quiz_attempt_submitted`.
- **Regression check that matters most:** with cookies *declined*, no request to
  any `posthog.com` host fires at any point in that same flow. Consent gating is
  the one thing here that is a legal obligation rather than a product nicety.
- No event property anywhere contains an email address, name, or free-text the
  learner typed.

## Explicitly not in this pass

- The `homepage-cta-copy` feature flag / experiment (LIC-5) — events only.
- Server-side capture via `posthog-node`.
- Any change to session replay configuration.
