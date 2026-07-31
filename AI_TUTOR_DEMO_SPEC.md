# AI Tutor Homepage Demo Spec (LIC-12)

> **Superseded 2026-07-17.** Sim chose a **live** homepage guest trial instead of
> the canned demo below: “Try Sly for free” opens a real Sly panel; unsigned
> visitors get 3 live Gemini messages per hashed IP, then a sign-up CTA. See
> `GuestSlyPanel`, `/api/tutor/guest-chat`, and migration
> `20260717130000_guest_tutor_usage.sql`. The canned recommendation below is
> retained as historical context only.

---

"Interactive 'what does the AI tutor do?' demo section" — a gamified section on the
marketing homepage where a visitor types a question/topic and gets back a tailored
summary of what the tutor can help with. Written 2026-07-08, Sim to review before
Cursor builds. Original ticket's open question: does typed input call a live LLM,
or match against canned capability summaries? Recommendation below.

## Recommendation: canned/curated responses, not a live model call

This widget sits on the public homepage, pre-signup, unauthenticated. Anyone can
hit it any number of times with no rate limit or entitlement check — the opposite
of every other AI-cost surface in this app, which are all deliberately gated
(§ AI tutor is the one paid feature specifically *because* it costs money to run,
per the 2026-07-02 and 2026-07-06 decision log entries). A live, ungated LLM call
on the homepage is a real, unbounded cost/abuse exposure — someone could script
requests against it all day.

**Build it as keyword-matched canned responses instead:**

- Curate ~10-12 short capability summaries, each tagged with matching keywords
  covering common PMQ topics and concerns (e.g. "risk register," "stakeholder,"
  "earned value," "exam technique," "governance," plus generic ones like "not sure
  where to start").
- Visitor types free text; simple keyword/substring match against the tag list
  picks the closest summary. No match → generic fallback ("I can help with any PMQ
  topic — try asking about risk, stakeholders, or exam technique").
- Response is written to *feel* live (typing/streaming-in animation, per the site's
  existing gamified interaction patterns — see `QuizDemo.tsx` for the established
  animation vocabulary) even though it's not calling a model. This gets the "wow"
  UX without the cost/abuse surface.
- Zero new API cost, zero new backend route, ships fast, no dependency on
  LIC-42.

## Alternative (only if Sim wants a real live response here)

A rate-limited, unauthenticated Supabase Edge Function (same pattern as the
already-built `supabase/functions/survey`) calling Claude with a short, generic
system prompt (no syllabus grounding needed — this is a capability teaser, not
real tutoring) and a hard per-IP rate limit (e.g. 5 requests/hour) plus a low
`max_tokens` cap to bound cost per call. More build time, ongoing cost exposure,
needs monitoring. Only worth it if the canned version tests as unconvincing.

**Flag for Sim: pick one before Cursor builds.** Spec below assumes the
recommended (canned) version; the live version would replace §2 with an Edge
Function call but keep everything else the same.

## 1. Placement & visual language

Same design system as `QuizDemo.tsx` / `JourneyPath.tsx` — card-based, retro-70s
brand tokens, positioned per the ticket alongside the other homepage interactive
sections. Reuse existing components where possible rather than introducing new
visual patterns.

## 2. Component — `src/components/AiTutorDemo.tsx`

- Text input ("Ask what you're stuck on...").
- On submit: run the keyword match client-side (the tag list can ship as a small
  static JSON/TS constant, no API call needed) against a canned response set.
- Animate the response in (reuse `QuizDemo`'s existing fly-in/reveal pattern for
  visual consistency, don't invent a new animation).
- Below the response, a CTA matching the rest of the homepage funnel ("Start free
  with PMQ" → same destination as the existing hero CTA).

## 3. Content

Write the ~10-12 capability summaries grounded in what the tutor actually does
(per AI_TUTOR_BACKEND_SPEC.md §2) — don't overpromise features that don't exist.
Each summary should reference genuine PMQ content so it doesn't read as generic
filler. This is a small content-writing task, can be done alongside the component
build rather than blocking it.

## 4. Definition of done

- Typing any of the tagged keywords produces a relevant-feeling summary.
- Typing something unrelated (e.g. "pizza recipe") gets the generic fallback, not
  an error or blank state.
- No network request fires on submit (confirms it's the canned path, not
  accidentally wired to a live endpoint).
- CTA below the response routes correctly for both new and returning visitors
  (reuse the auth-state logic from LIC-5, once that ships).
