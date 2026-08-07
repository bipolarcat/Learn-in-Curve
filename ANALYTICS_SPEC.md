# Analytics Spec — PostHog Integration (v1)

Tracked as LIC-19 in Linear. Written 2026-07-08, first pass — flag anything
below that doesn't match how Sim actually wants this to work before building.

## 0. Why / scope

PostHog goes in to answer real questions that are currently guesses:
where people drop off between homepage and LO1 completion, whether
Gamification Phase A (streaks/XP, see `GAMIFICATION_SPEC.md`) actually drives
retention, and which of two homepage CTA copy options (LIC-5) converts
better. Scope for v1: event tracking, funnels, one feature flag experiment.
**Not** in scope for v1: session replay rollout, self-hosting, server-side
capture — see §6.

## 1. Consent gating — non-negotiable, ships with LIC-11

PostHog must not fire — no script load, no init — until the user has
accepted non-essential cookies via the LIC-11 banner. This is a hard
sequencing dependency, not a nice-to-have:

- Default state: PostHog client either not loaded at all, or loaded with
  `opt_out_capturing_by_default: true`.
- On banner accept → call `posthog.opt_in_capturing()` (or lazy-load the
  script for the first time).
- On banner decline → PostHog never loads, ever, until the user changes
  their preference (banner needs a way to re-open — check LIC-11's build
  covers this).
- **Definition of done for LIC-11 should include:** "no PostHog network
  requests fire before consent" as a literal test, not just a visual check.

## 2. Setup

- `posthog-js` via a client-side provider component wrapping the app root
  (confirm exact root layout file in the current Next.js structure before
  implementing — not verified against the live codebase for this spec).
- Reverse-proxy `/ingest` route: recommended (ad-blockers drop a meaningful
  chunk of direct PostHog calls otherwise) but can slip to a fast-follow if
  it adds meaningful setup time — flag as a follow-up ticket if so, don't
  silently skip it.
- Env vars: `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`. Add to
  `.env.local` (gitignored) and Railway's env var settings for prod. **Sim
  adds the actual project API key himself once signed up** — not something
  to paste into chat, standard secret-handling practice even though a
  PostHog project key isn't as sensitive as, say, a Stripe secret key.

## 3. Event taxonomy — v1

| Event | Fired where | Why it matters |
|---|---|---|
| `cta_clicked` (props: `variant`, `location`) | Homepage header/hero CTA | Feeds the LIC-5 A/B test in §4 |
| `quiz_demo_question_answered` (props: `question_index`, `correct`) | `QuizDemo.tsx` | Homepage funnel step, ties to LIC-10 |
| `quiz_demo_completed` | `QuizDemo.tsx` | Funnel step right before the enrol CTA |
| `signed_up` / `signed_in` | Auth callback | Funnel anchor point |
| `quiz_attempt_submitted` (props: `lo_number`, `question_type`, `is_correct`, `xp_awarded`) | `submitQuizAttempt` server action | Real (not demo) engagement signal, ties to `GAMIFICATION_SPEC.md` |
| `streak_incremented` (props: `new_streak`) | Same action, streak branch | Retention signal — the actual test of whether gamification is working |
| `lo_completed` | Section/LO completion checkpoint | Progress funnel |
| `ai_tutor_unlock_clicked` | AI tutor paywall CTA | Early monetization signal, useful even while tutor itself ships "Coming soon" |

Component/action names above are based on what `GAMIFICATION_SPEC.md`
documents (`actions.ts`, `queries.ts`, `QuizDemo.tsx`, `QuizRunner.tsx`) —
confirm against the current codebase before wiring events in, since that
doc may have drifted from what's actually shipped.

## 4. Feature flags / experiments

First flag: `homepage-cta-copy` — "Sign Up" vs "Get Started" (LIC-5).
Settle that ticket with data instead of a design guess. Structure so a
second flag (next experiment, TBD) can reuse the same pattern.

## 5. Definition of done

- No PostHog network activity before consent is accepted (verified in
  Network tab, not just visually).
- Declining consent = zero PostHog calls, until the user actively re-opens
  the banner and accepts.
- Core funnel (homepage → quiz demo → signup → LO1 complete) is visible as
  a single PostHog Insight.
- No PII (email, name) sent as event properties — Supabase user UUID only.

## 6. Explicitly out of scope for v1, not forgotten

- Self-hosting PostHog — use PostHog Cloud's free tier (1M events/month).
- Server-side capture — client-side only for v1.
- ~~Session replay~~ — **superseded 2026-08-07. Replay is intentionally
  live.** See §7.

## 7. Session replay — decision record, 2026-08-07

§6 originally deferred session replay. That deferral is **withdrawn**. Replay
has been recording since 2026-08-06 (PostHog enables it at project level, so
it came on without a code change) and the decision now is to keep it on
deliberately rather than let the spec and reality stay out of step.

**Why keeping it is the right call at this stage:** at single-digit user
numbers, aggregate charts are noise. Watching one real learner get stuck is
worth more than any funnel until there are a few hundred users per step.

**Why it is acceptable from a data-protection standpoint** — all four
mitigations the original deferral was insuring against are already in place:

1. **Consent gate.** Replay cannot run pre-consent. The entire PostHog script
   is only fetched after Accept, so this inherits the same PECR-compliant
   gating as event capture (§1).
2. **Masking.** `maskAllInputs: true` and `maskTextSelector: "*"` in
   `PostHogProvider.tsx`. All text and all typed input is stripped in the
   visitor's browser before transmission. We get clicks, mouse movement, page
   transitions and layout — never exam answers or personal details. This is
   what keeps replay out of high-risk-processing territory; **if that config
   is ever loosened, this decision must be revisited, and a DPIA becomes a
   live question.**
3. **Disclosure.** Described specifically (not lumped under "analytics") in
   both `legal/COOKIE_NOTICE.md` and `legal/PRIVACY_POLICY.md` §5, including
   an accurate description of the masking.
4. **EU processing.** PostHog EU Cloud, so no international-transfer question.

**Retention — verified in PostHog 2026-08-07, not assumed:**

- Session replays: `session_recording_retention_period: 30d`. Already correct.
- Events: `event_retention_months: 84` — **7 years.** This is the plan default
  and nobody chose it. See §8.
- `anonymize_ips: true` — PostHog discards the IP at ingestion, so no raw IP is
  ever stored. Good, and stronger than the spec previously assumed.

`PRIVACY_POLICY.md` §6 states these numbers verbatim as of 2026-08-07.
**They must stay in sync — changing a retention setting in PostHog without
changing the policy makes the published policy false**, which is a worse
problem than the retention period itself.

## 8. Audit findings, 2026-08-07 — and what was done about them

Logged here because these were discovered, not decided.

**Applied on 2026-08-07:**

- **Internal traffic now excluded from insights.** `test_account_filters` gained
  a `$host not_in [localhost:3000, 192.168.1.147:3000, 127.0.0.1:3000,
  localhost]` rule alongside the pre-existing cohort rule. Note the cohort rule
  ("Internal / Test users", id 175873) matches on a person property
  `$internal_or_test_user` that **nothing in the app ever sets** — it contains
  zero people and is decorative. The host rule is what actually works.
- **`test_account_filters_default_checked: true`.** Previously null, meaning
  every new insight silently included dev traffic unless someone remembered to
  tick a box. This is the setting that makes the filter above matter.
- **Console log capture turned OFF** (`capture_console_log_opt_in: false`).
  See 8b.
- Verified effect: production-only pageviews resolve to
  `www.learnincurve.com` alone.

**Filtering is display-time, not ingestion-time.** Dev events are still stored
and still count toward billing quota. That is the right trade — a display
filter is reversible, deletion isn't.

**8a. Event retention is 7 years.** UK GDPR's storage-limitation principle says
personal data is kept no longer than necessary for the stated purpose. The
stated purpose here is product improvement. Justifying a 7-year need for
"which button did an anonymous visitor click in 2026" is difficult, and it is
the kind of thing a regulator or an enterprise buyer's due-diligence
questionnaire asks about. Not urgent at current scale, but it should be
shortened to something defensible (12–24 months) before real launch, and the
policy updated to match. Note `events_retention_enforced: false`, so this is
currently a stated ceiling rather than an enforced deletion job — worth
confirming with PostHog what actually gets deleted and when.

**Not fixable from the API.** `event_retention_months` is not writable via
`project-settings-update`; it is a plan-level setting. Changing it means
PostHog billing settings or a support request. **Sim to action before real
launch.** Until then `PRIVACY_POLICY.md` truthfully states 7 years, which is
the correct order of operations — never publish a shorter number than the one
actually configured.

**8b. Console log capture — RESOLVED 2026-08-07, now OFF.** It had been ON
(`capture_console_log_opt_in: true`), attaching browser console output to
session replays. Nobody chose this, and it was the one setting with a real
leak path: **replay masking does not apply to console output**, so whatever the
app writes to the console went to PostHog verbatim. `src/lib/pmq/actions.ts`
already logs user UUIDs and question IDs on error — tolerable in itself, but
the exposure was open-ended; any future `console.log` of a request body, token
or email address would have been captured silently. Now disabled. **If anyone
re-enables it for debugging, treat it as a privacy change, not a config
tweak.**

**8c. Network performance capture is ON**
(`capture_performance_opt_in: true`). Records request timing and URLs. Low risk
in itself, but any URL carrying a token or identifier in its query string would
be recorded. Worth a quick audit of whether any app route does that.

**Outstanding verification (Sim, before relying on replay):** record a session
in which you type a fake email and a fake exam answer, then play it back in
PostHog. If any typed text is legible, masking is broken and this decision is
void until fixed. Do not assume the config works because it is written down.
