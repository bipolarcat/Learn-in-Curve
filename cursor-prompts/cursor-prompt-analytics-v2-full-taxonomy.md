# Cursor prompt — PostHog v2: full product instrumentation

**Written 2026-08-07 by Claude.** Follows `cursor-prompt-analytics-events.md`
(v1, shipped). v1 wired 7 events and `identify()`. This extends coverage to the
whole product surface.

Read `ANALYTICS_SPEC.md` §3 and `src/lib/analytics/events.ts` first — the
conventions there are already correct and this builds on them, it does not
replace them.

---

## Ground rules — apply to every event below

**Naming.** `snake_case`, `object_pastTenseVerb`. `mock_exam_started`, not
`startMockExam` or `MockExamStart`. Consistency matters more than elegance: in
six months you will filter by prefix.

**Every event goes through a named helper in `src/lib/analytics/events.ts`.**
No raw `capture("…")` strings at call sites, ever. The v1 definition-of-done
grep must keep passing:
`grep -rn 'capture("' src/` returns only `events.ts` and `PostHogProvider.tsx`.

**No PII in properties. Ever.** Supabase UUIDs only. Never email, name, or any
free text the learner typed — not a quiz answer, not a tutor message, not a
written mock answer. `ANALYTICS_SPEC.md` §5 forbids it and the Privacy Policy
tells users we don't do it. If an event needs "what did they write", the answer
is no.

**Properties over event names.** `quiz_attempt_submitted {lo_number: 3}` beats
`lo_3_quiz_attempt_submitted`. Twenty events with good properties are analysable;
two hundred bare event names are not. If you find yourself encoding a value into
a name, stop.

**Server actions can't capture.** `capture()` is browser-only. Pattern stays as
v1: the server action returns what happened, the client caller fires the event.
Do not add `posthog-node`.

---

## Group A — Auth and account (highest priority, blocks the funnel)

v1 left a hole in the middle of the core funnel. Fix first.

| Event | Where | Properties |
|---|---|---|
| `signed_up` | after successful sign-up, `AuthForm.tsx` | `method` (`email` \| `google`) |
| `signed_in` | after successful sign-in | `method` |
| `sign_up_failed` | auth error branch | `method`, `reason` (mapped code from `auth-errors.ts`, **not** the raw message) |
| `sign_in_failed` | auth error branch | `method`, `reason` |
| `password_reset_requested` | `ForgotPasswordForm.tsx` submit | — |
| `password_reset_completed` | `ResetPasswordForm.tsx` success | — |
| `password_reset_failed` | `ResetPasswordForm.tsx` error branch | `reason` |

`sign_up_failed` and `password_reset_failed` matter more than the happy paths.
The "Auth session missing" bug fixed on 2026-08-07 was invisible for exactly
this reason — nothing counted failures, so a broken reset flow looked identical
to nobody using it.

**Also set `signed_up` as the project's signup event** once it's live:
PostHog → project settings → `customer_analytics_config.signup_event`. Tell Sim
when it's shipped and Claude will set it.

---

## Group B — Course progression

| Event | Where | Properties |
|---|---|---|
| `course_started` | first LO opened for a course | `course_id` |
| `lo_opened` | `src/app/courses/pmq-in-5-days/lo/[loNumber]/page.tsx` | `lo_number` |
| `lo_stage_reached` | `LoStudyJourney.tsx` ~line 316, alongside `markLoStageReached` | `lo_number`, `stage_id` |
| `section_completed` | `LoCheckpointStage.tsx` ~lines 217/235 | `lo_number`, `section_id` |
| `lo_completed` | already wired in v1 | `lo_number` |
| `course_completed` | all LOs done | `course_id` |

`lo_stage_reached` is the highest-value addition in this group. `lo_completed`
alone tells you someone finished; the stage events tell you **where inside an LO
people stop**, which is the actionable version.

---

## Group C — Practice quizzes and tier gating

| Event | Where | Properties |
|---|---|---|
| `quiz_attempt_submitted` | wired in v1 | already has `lo_number`, `question_type`, `is_correct`, `xp_awarded`, `context` |
| `quiz_set_opened` | quiz set launch | `lo_number`, `quiz_set`, `tier_required` |
| `quiz_set_locked_hit` | when `getQuizSet` returns `locked` / `locked_ai_pro` | `lo_number`, `quiz_set`, `lock_reason`, `current_tier` |
| `hint_viewed` | `CheckAnswerHint.tsx` | `lo_number`, `question_type` |

`quiz_set_locked_hit` is your clearest paywall-demand signal — someone reaching
for content they can't have. Fire it on the *hit*, not on the upgrade click;
people who bounce without clicking are the interesting ones.

---

## Group D — Mock exams (nothing is instrumented today)

Given the two bugs found here on 2026-08-07, this group earns its place.

| Event | Where | Properties |
|---|---|---|
| `mock_exam_started` | `startMockExamSession` caller | `exam_set`, `tier` |
| `mock_part_submitted` | `submitMockPart` caller | `exam_set`, `part`, `answered_count`, `question_count` |
| `mock_break_started` | `beginMockBreak` | `exam_set` |
| `mock_part_two_started` | `startMockPartTwo` | `exam_set` |
| `mock_exam_finalized` | `finalizeMockExam` success | `exam_set`, `total_score`, `max_score`, `passed` |
| `mock_exam_expired` | when `expireSession` writes `expired` | `exam_set`, `total_score`, `part_1_submitted`, `part_2_submitted` |
| `mock_exam_abandoned` | user-initiated abandon | `exam_set`, `answered_count` |
| `mock_review_opened` | the "Review answers" button | `exam_set`, `status` |

`mock_exam_expired` is the one to watch. It fires exactly when a learner loses a
sitting to a clock, which is both a product-quality signal and the thing that
was silently zeroing real scores.

**Note:** `expireSession` lives in `mock-terminate.ts` and runs server-side on
page load. It cannot call `capture()`. Return an "expired on this call" flag up
to the client caller (same pattern as `streakIncremented` in v1) and fire there.

---

## Group E — Sly (AI tutor) and monetisation

| Event | Where | Properties |
|---|---|---|
| `tutor_opened` | tutor panel open | `surface` (`guest` \| `course` \| `dashboard`), `lo_number` if applicable |
| `tutor_message_sent` | message submit | `surface`, `message_length_bucket` (`short`\|`medium`\|`long`) |
| `tutor_limit_hit` | guest/credit limit reached | `surface`, `limit_type` |
| `ai_tutor_unlock_clicked` | wired in v1 | `location`, `price_cents` |
| `checkout_started` | `createAiTutorCheckout` / `createSlyTopUpCheckout` / Pro checkout | `product`, `price_cents` |
| `checkout_completed` | Stripe return/success page | `product`, `price_cents` |
| `topup_clicked` | Sly top-up CTA | `amount_cents` |

**`message_length_bucket`, never the message.** Bucket it client-side before it
leaves the browser. The Privacy Policy states tutor conversation content isn't
stored; sending lengths is fine, sending text would make that statement false.

`tutor_opened` matters more than it looks: guest Sly has been live in production
since 2026-07-17 with £0 spent on it, and nobody knows whether people find it.
That's a discovery question this event answers.

---

## Group F — Gamification and retention

| Event | Where | Properties |
|---|---|---|
| `streak_incremented` | wired in v1 | `new_streak` |
| `streak_broken` | when streak resets to 1 from >1 | `previous_streak` |
| `xp_awarded` | `awardXpAndUpdateStreak` result | `amount`, `total_xp`, `source` |
| `exam_date_set` | profile exam deadline save | `days_until_exam` (a number, not the date) |

`streak_broken` paired with `streak_incremented` is the honest test of whether
Gamification Phase A works. `days_until_exam` rather than the date itself keeps
it non-identifying while still segmenting by urgency, which is likely your
strongest predictor of engagement.

---

## Group G — Person properties (set via `identify`)

Not events — attributes of the person, updated when they change. Extend the
`AnalyticsIdentify` component from v1.

- `tier` — the entitlement tier. **v1 deliberately skipped this** because
  `getPmqTier` would add a query to every page load. Correct call. Add it
  **dashboard-only**, where the tier is already fetched, using
  `posthog.setPersonProperties`. Do not reintroduce a query.
- `has_exam_date` (boolean), `days_until_exam` (number)
- `current_streak`, `total_xp`
- `los_completed` (count)

These make cohorts possible: "learners with an exam in under 14 days who
haven't completed LO1" is a real segment you can act on.

---

## What NOT to do

- **Don't instrument every button.** `$autocapture` is on and already records
  clicks generically. Named events are for moments with *meaning*, and each one
  is a maintenance cost — a renamed prop silently breaks a funnel.
- **Don't fire events in loops or on scroll/hover.** You have a free-tier event
  quota and 84-month retention; volume is not free.
- **Don't add `posthog-node` for server-side capture.** Still out of scope
  (`ANALYTICS_SPEC.md` §6). Return-and-fire from the client.
- **Don't gate any of this behind a check other than the existing consent
  gate.** `capture()` is already a no-op pre-consent by design. Adding your own
  guard risks getting it wrong.

---

## Definition of done

- `npm run build` passes.
- The v1 grep still returns only `events.ts` and `PostHogProvider.tsx`.
- Every event above appears in PostHog's Activity feed after exercising the
  relevant flow on localhost with cookies accepted.
- **Consent regression test:** decline cookies, exercise a flow from each group,
  confirm zero requests to any `posthog.com` host. This is the one item here
  that is a legal obligation, not a product nicety.
- No event property contains an email, a name, or any learner-typed text.
  Grep the diff for `submitted_answer`, `message`, `email`, `prompt` before
  calling it done.

## Then tell Sim

Once shipped, Claude will set `customer_analytics_config.signup_event` to
`signed_up` and build the core funnel + a starter dashboard in PostHog. That
can't happen until the events exist.
