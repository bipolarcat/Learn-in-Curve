# Cursor Prompt — Growth Pass 2: The `/learn` Content Hub

**Written by:** Claude, 2026-08-08
**For:** Cursor
**Related:** `MARKETING_STRATEGY.md` (§4 Tier 1a), `cursor-prompt-growth-pass-1.md`, `VOICE_GUIDE.md`
**Depends on:** Pass 1 merged. `/free-mock-exam` exists and the `leads` migration is applied.

---

## Why this exists

learnincurve.com has one indexed page and zero search traffic. `/free-mock-exam` now exists as a conversion mechanism but nothing sends traffic to it.

This pass builds the traffic layer: a public, indexable content hub at `/learn` where each page answers one question a PMQ candidate actually types into Google or asks an AI assistant, and funnels them to the free mock.

The existing LO pages at `/courses/pmq-in-5-days/lo/[loNumber]` are auth-gated and invisible to search. This is a **separate, public, thinner** layer. Do not un-gate the paid pages.

---

## THE SPLIT — read this first, it governs the whole pass

**You build the machine. You do not write the prose.**

These pages compete against auto-generated exam-dump content farms. Sounding like a real person is the entire competitive advantage. AI-generated marketing prose defeats the purpose of the exercise.

| Cursor builds | Sim + Claude supply |
|---|---|
| Route, template, content schema | The body prose |
| Index page, internal links | FAQ answers |
| Schema markup, metadata, sitemap | Intro paragraphs |
| Sample-question rendering | Page titles/meta descriptions |

For every page, populate the content file with a clearly marked placeholder:

```ts
body: "TODO_COPY — see VOICE_GUIDE.md. Do not ship.",
```

Structure, headings, FAQ *questions*, slugs, LO mappings and sample-question selection are yours. The sentences are not. If a page's copy is still `TODO_COPY`, it must be excluded from the sitemap and carry `noindex` — see §6.

---

## 1. Routes

```
/learn                → index: lists all published pages, grouped
/learn/[slug]         → individual page
```

Put both in the `(site)` route group. Server components. No auth.

## 2. Content model

Follow the pattern already established in `src/content/free-mock-exam.ts` — static typed TS, not a CMS. Suggest `src/content/learn/`, one file per page plus an index that exports them all.

Each page needs at minimum:

```ts
type LearnPage = {
  slug: string;
  title: string;              // H1
  metaTitle: string;
  metaDescription: string;
  group: "exam-prep" | "choosing" | "syllabus";
  answerFirst: string;        // ≤40 words. The direct answer. Extracted by AI assistants.
  body: string;               // markdown, 600–900 words
  faqs: { question: string; answer: string }[];
  sampleQuestionLos: number[]; // which LOs to pull sample questions from
  related: string[];          // slugs, for internal linking
  status: "draft" | "published";
  updatedAt: string;          // ISO date — freshness signal, see §6
};
```

Design it so adding page #40 is dropping in one file. Group C below scales to one page per learning objective eventually — no hand-coded pages.

## 3. The 10 pages

**Group A — exam-prep intent (highest value)**

| slug | Question it answers |
|---|---|
| `apm-pmq-pass-mark` | What's the pass mark? |
| `how-hard-is-apm-pmq` | How hard is it really? |
| `apm-pmq-exam-format` | What's the format? |
| `how-long-to-revise-for-apm-pmq` | How much time do I need? |

**Group B — choosing a qualification**

| slug | Question it answers |
|---|---|
| `apm-pmq-vs-pfq` | Which one should I take? |
| `apm-pmq-vs-prince2` | How do they compare? |
| `is-apm-pmq-worth-it` | Is it worth it for my career? |

**Group C — syllabus topics**

| slug | Question it answers |
|---|---|
| `apm-pmq-business-case` | Explain this topic |
| `apm-pmq-risk-management` | Explain this topic |
| `apm-pmq-stakeholder-management` | Explain this topic |

## 4. Page template

Rendered order, top to bottom:

1. **H1** — the page title
2. **`answerFirst`** — visually distinct (lead paragraph or callout). This is the first thing in the DOM after the H1. AI assistants extract the top of the page; burying the answer loses the citation.
3. **Body** — the 600–900 words
4. **2–3 sample questions** — see §5
5. **FAQ** — rendered visibly *and* mirrored in JSON-LD
6. **CTA** — "Test yourself: free 15-question APM PMQ check →" linking `/free-mock-exam`
7. **Related pages** — internal links from `related`

All server-rendered. `curl` must return the full text.

## 5. Sample questions — ring-fencing rule

**Do not render paid Exam 1–4 questions on a public page.** That is giving away inventory to anonymous visitors.

Use the same rule Pass 1 established (see the header comment in `src/content/free-mock-exam.ts`): practice inventory where `mock_suitable = false` and the prompt does not appear in `mock.json`.

Also exclude the 15 used by `/free-mock-exam` — someone who reads a `/learn` page and then takes the mock shouldn't meet the same question twice.

Pull by `lo_number` from `sampleQuestionLos`. Show the question, options, correct answer and explanation — these are teaching aids, not a test.

If the eligible pool for an LO is too small after both exclusions, **say so in your report** rather than silently falling back to paid questions.

## 6. SEO

- `generateMetadata` per page from `metaTitle` / `metaDescription`, plus canonical and OpenGraph
- **`FAQPage` JSON-LD** matching visible FAQ text exactly. Mismatched schema is a manual-action risk.
- **`Article` JSON-LD** with `dateModified` from `updatedAt`. Freshness is a documented AI-citation factor — 83% of citations come from pages updated within 12 months.
- **`BreadcrumbList` JSON-LD** — Home → Learn → page
- **Extend `src/app/sitemap.ts`** to include `/learn` and every page where `status === "published"`. Draft pages must **not** appear.
- Any page still carrying `TODO_COPY`, or with `status: "draft"`, gets `robots: { index: false }` in its metadata. We must not ship placeholder text to Google.
- Internal links: every `/learn` page links to `/free-mock-exam` and to its `related` pages. Add a "Free mock exam" and "Learn" entry to the main nav if not already present.

## 7. Content constraints (apply when copy lands, enforce structurally now)

- **No duplicate or near-duplicate text across pages.** Ten near-identical pages is thin content and Google discounts all of them. If two pages need the same explanation, one links to the other.
- **Do not reproduce APM's published syllabus text.** Explanations must be original prose. Reproducing APM's wording is a copyright exposure, and it's also just worse content.
- **No pass-rate or outcome claims** — no "pass first time", no percentages. Zero outcome data exists. CAP Code exposure (`MARKETING_STRATEGY.md` §8.4).
- **No implied APM endorsement.** The site-wide disclaimer must be present on these pages:
  > Learn in Curve is not affiliated with, endorsed by, or accredited by the Association for Project Management.
- Pages answer the question fully but do not substitute for the course. Give the answer, not the syllabus.

---

## Constraints

**Do not:**
- Modify `/courses/pmq-in-5-days/*` behaviour or gating
- Render paid Exam 1–4 questions publicly
- Write final marketing prose (see THE SPLIT)
- Include draft/placeholder pages in the sitemap or allow them to be indexed
- Regress anything from Pass 1 — `/free-mock-exam`, consent gating, `leads` writes

**Expect:** pre-commit hook bumps site version by 0.1.

## Definition of done — report evidence, not "done"

1. `/learn` and all 10 `/learn/[slug]` routes resolve logged-out in incognito
2. `curl` one page — H1, `answerFirst`, body and FAQ text present in **raw HTML**
3. `/sitemap.xml` contains `/learn` and published pages only; no `TODO_COPY` page appears
4. A draft page returns `noindex` in its meta robots tag
5. FAQPage + Article + BreadcrumbList JSON-LD all validate in Google Rich Results Test
6. Sample questions rendered on any `/learn` page do **not** appear in `mock.json` or in `FREE_MOCK_QUESTIONS` — show the query or script you used to prove it
7. `/free-mock-exam` and `/courses/pmq-in-5-days/mock` both still behave exactly as before
8. With cookie consent denied, no PostHog requests fire on `/learn` pages

**Answer back rather than guess:**
- Which LOs had too small an eligible sample-question pool after exclusions
- Whether `src/app/sitemap.ts` needed restructuring to handle dynamic entries
- Anything in the existing `(site)` layout that fought the template
