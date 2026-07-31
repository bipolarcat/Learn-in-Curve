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
- Session replay — revisit once core events are flowing cleanly; turning it
  on day one adds a second GDPR surface (recording real user sessions) on
  top of the event-tracking one, worth doing as a deliberate follow-up
  decision, not a default.
