# Cursor Prompt — Growth Pass 1: Analytics Instrumentation + Public Free Mock Exam

**Written by:** Claude, 2026-08-08
**For:** Cursor
**Related:** `MARKETING_STRATEGY.md` (§4 Tier 1)
**Scope:** Two related pieces of work that touch the same signup flow. Do both in one pass so the signup path isn't edited twice.

---

## Why this exists (read before coding)

learnincurve.com currently has 17 total sign-ups and **no way to attribute any of them**. PostHog has three days of data, zero visits from search engines or AI assistants, and no conversion event. There is also no public, un-gated page anywhere on the site that a stranger from Google can use — the mock exam exists but redirects to sign-in.

This pass fixes both: makes sign-ups measurable, and creates the first public page designed to convert search traffic into email addresses.

**Do not** change how the paid product works. Nothing in `/courses/pmq-in-5-days/*` should behave differently after this pass.

---

# PART A — Analytics instrumentation

## A1. `signup_completed` event

Fire a PostHog event when a user account is successfully created.

- Event name: `signup_completed`
- Properties: `source` (see A2), `utm_source`, `utm_medium`, `utm_campaign`, `referrer_category` (see A3), `signup_method` (`email` | `oauth` | whatever exists)
- Fire **once**, on genuine account creation — not on sign-in, not on repeat page loads.

**Hard constraint — consent.** `src/lib/analytics/consent.ts` exists and is load-bearing. Read it first. PostHog must not initialise or capture anything until `readConsent()` returns `"granted"`. Do not work around this, do not add a "just this one event" exception. The Cookie Notice commits us to it and UK PECR reg 6 requires it.

If a user signs up while consent is `denied` or `unset`, the event simply does not fire. That is the correct behaviour. Do not queue it for later replay.

## A2. UTM capture and persistence

Problem to solve: someone clicks a tagged link, browses three pages, then signs up. By signup time the UTMs are long gone from the URL.

- On first page load of a session, read `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` from the query string.
- Persist for the session so they're still available at signup.
- **Consent-gated.** If storage is used for this, it is non-essential and must sit behind the same consent gate. If consent is `denied`, skip capture entirely.
- Attach to `signup_completed`.

## A3. AI referrer classification

Right now AI-assistant traffic would land in PostHog as `$direct` or an unclassified referrer, and be invisible.

Add a `referrer_category` derived from `$referring_domain`:

| Category | Matches |
|---|---|
| `ai_assistant` | `chatgpt.com`, `chat.openai.com`, `perplexity.ai`, `claude.ai`, `gemini.google.com`, `copilot.microsoft.com`, `you.com` |
| `search` | `google.*`, `bing.com`, `duckduckgo.com`, `search.brave.com`, `ecosia.org` |
| `social` | `linkedin.com`, `lnkd.in`, `com.linkedin.android`, `reddit.com`, `com.reddit.frontpage`, `instagram.com`, `t.co`, `x.com` |
| `direct` | empty / `$direct` |
| `other` | everything else |

Put the mapping in one exported function (suggest `src/lib/analytics/referrer.ts`) so it can be unit-tested and extended. Match on domain suffix, not exact string — subdomains and mobile app referrers must resolve correctly.

Set `referrer_category` as a person/session property so it's available for breakdowns, and include it on `signup_completed`.

**Why this matters:** published data shows AI-referred visitors converting several times better than organic search. We cannot verify that for our own funnel unless the category exists as a dimension from day one.

---

# PART B — Public free mock exam at `/free-mock-exam`

## B1. What it is

A single **public, un-authenticated, indexable** page. A stranger arriving from Google can take a 15-question APM PMQ readiness check with no account. At the end, results are gated behind an email address.

**Route:** `/free-mock-exam` — put it in the `(site)` route group alongside `about`, `contact`, `privacy`.

**Do not modify** `src/app/courses/pmq-in-5-days/mock/page.tsx`. It stays auth-gated and tier-gated exactly as it is. This is a new, separate, thinner thing.

## B2. Question set — ring-fenced

The 15 questions must come from a set that is **not** used by the paid Exams 1–4. We are not giving away paid inventory.

Inspect the questions schema first (`exam_set`, and whatever the questions table is called) and **propose a mechanism before implementing** — e.g. a dedicated `exam_set` value, or a boolean flag column, or a curated ID list. Report which you chose and why.

Requirements for the set:
- 15 questions, drawn from across multiple learning objectives so the per-LO breakdown in B4 is meaningful
- Same question types the real exam uses (MCQ, scenario MCQ, dropdown) — reuse existing rendering
- Deterministic order, or seeded random — the same person retaking should not get a trivially different score

Reuse existing components (`MockExamSession` or a trimmed variant) rather than writing a second exam engine. If the existing component is too coupled to auth/tiers, extract the presentational core rather than forking it.

## B3. Anonymous attempt handling

No account exists while they're taking it. Hold answers client-side for the duration. Only persist server-side at the point they submit their email (B4).

Do not create `auth.users` rows for anonymous takers.

## B4. The results gate — the point of the whole page

On finishing question 15, show a wall:

> **You scored X/15.**
> Enter your email to see which learning objectives you're weakest on and what to revise first.

After a valid email is submitted, reveal:
- Score out of 15
- Per-learning-objective breakdown
- Their three weakest learning objectives, named
- CTA into the product: "The 5-day plan covers [weakest LO] in depth — start free →"

Store the lead. Create a table (suggest `leads`) with at minimum: `email`, `score`, `weakest_los`, `marketing_consent` (boolean), `consent_timestamp`, `utm_*`, `referrer_category`, `created_at`.

**All `user_id`-style FKs, if any are added, need `ON DELETE CASCADE`** — we have been bitten by this before (see the 2026-08-04 signup trigger incident).

Fire `free_mock_completed` and `lead_captured` PostHog events (consent-gated, same rules as Part A).

## B5. Consent — read this carefully, it is not optional

Two **separate** things, and conflating them is a UK GDPR/PECR breach:

1. **The email needed to show results.** This is the service they asked for. No separate tick needed.
2. **Adding them to marketing email.** This is different, and needs its own **unticked** checkbox, with plain wording:

   > ☐ Email me PMQ revision tips and updates from Learn in Curve. You can unsubscribe any time.

Requirements:
- The box must be **unticked by default**. Never pre-ticked.
- Submitting **must work** whether or not it's ticked. Results are not conditional on marketing consent.
- Store `marketing_consent` and `consent_timestamp` — we must be able to evidence when and how consent was given.
- Link the privacy notice at the point of collection.
- Anyone with `marketing_consent = false` must be excluded from every marketing send.

Retrofitting this later means re-consenting the entire list. Build it right the first time.

## B6. SEO — the page must be findable

**This is the part that is easy to skip and fatal to skip.** Google indexes text, not JavaScript quiz widgets. A page that is only a quiz will never rank.

The page needs real, server-rendered, crawlable copy around the quiz:

```
[H1: Free APM PMQ Mock Exam]

[Intro: 3–4 paragraphs of genuine text — what the APM PMQ is,
 the 40-question / 90-mark / 2.5-hour format, what a mock is for.
 Direct answer in the first 40 words.]

[The quiz — Start button]

[FAQ section, 4–5 Q&As]
```

Placeholder copy is fine for this pass — Sim supplies final copy. But the **structure and rendering must be server-side and crawlable**, not client-only.

Also required:

- `generateMetadata` — title, description, canonical, OpenGraph
- **`FAQPage` JSON-LD schema** matching the visible FAQ (schema must reflect visible content — mismatched schema is a manual-action risk)
- **`src/app/sitemap.ts`** — does not currently exist. Create it. Include all public routes: `/`, `/about`, `/contact`, `/courses`, `/courses/pmq-in-5-days`, `/free-mock-exam`, legal pages. Exclude auth-gated routes.
- **`src/app/robots.ts`** — does not currently exist. Create it. Allow crawling of public routes, disallow `/dashboard`, `/auth/*`, and authenticated course routes. Reference the sitemap.
- Page must render fully without JS for the text content (quiz can hydrate).

## B7. Entry points

Add links to `/free-mock-exam`:

- Homepage hero — secondary CTA next to the existing primary
- Top nav — "Free Mock Exam"
- Footer
- `/courses/pmq-in-5-days` page

(`/learn/*` pages don't exist yet — that's Growth Pass 2. Don't stub them.)

## B8. Claims and disclaimers

Copy on this page must not:
- State or imply a pass rate, or promise a pass ("pass first time", "guaranteed pass"). We have zero outcome data; unsubstantiated claims breach the CAP Code and Google Ads policy.
- Imply APM endorsement, affiliation, or accreditation.

Must include, in the footer or page base:

> Learn in Curve is not affiliated with, endorsed by, or accredited by the Association for Project Management.

Safe framing: "15 questions in the real APM PMQ format", "a 5-day revision plan covering the full syllabus".

---

# Constraints and definition of done

**Do not:**
- Change behaviour of `/courses/pmq-in-5-days/mock` or any tier gating
- Un-gate any paid content
- Fire any analytics before consent is `granted`
- Pre-tick the marketing consent box
- Add paid Exam 1–4 questions to the free set

**Expect:** the pre-commit hook bumps the site version by 0.1. That's normal.

**Before reporting done, verify and state the evidence:**

1. `/free-mock-exam` loads in a logged-out incognito window, no redirect
2. `curl` the page — the intro copy and FAQ text are present in the **raw HTML**, not injected client-side
3. `/sitemap.xml` and `/robots.txt` resolve and contain the expected routes
4. FAQ JSON-LD validates (Google Rich Results Test) and matches visible text
5. With consent denied, **no** PostHog network requests fire anywhere on the page
6. With consent granted, `free_mock_completed`, `lead_captured` and `signup_completed` appear in PostHog with `referrer_category` and UTM properties populated
7. A row lands in `leads` with `marketing_consent` correctly `false` when the box is left unticked
8. `/courses/pmq-in-5-days/mock` still redirects to sign-in when logged out

Report actual output (row counts, curl excerpts, PostHog event payloads) — not "done". Prior "done" reports on this project have not survived verification.

**Open questions to answer back rather than guess:**
- Which mechanism you chose for ring-fencing the free 15 questions, and why
- Whether `MockExamSession` was reusable as-is or needed extraction
- Anything in the existing signup flow that made `signup_completed` hard to fire exactly once
