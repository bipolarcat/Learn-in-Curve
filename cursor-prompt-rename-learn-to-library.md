# Cursor Prompt — Rename `/learn` to `/library` + FAQ accordion

**Written by:** Claude, 2026-08-08
**For:** Cursor
**Related:** `cursor-prompt-growth-pass-2.md`
**Contents:** Part A is a mechanical rename. Part B is a small UI change. Do A first, commit, then B, so the rename diff stays readable.

---

## Why

**The rename:** `learnincurve.com/learn` repeats the brand word, and it collides with the paid product. The course *is* learning. A visitor reading the nav cannot tell which item is free and which they pay for. `/library` reads as free reference material and stays correct once PFQ and PMP content is added. Nothing is deployed or indexed yet, so this is a free rename with no redirect debt.

**The accordion:** each Library page ends with 4 to 5 FAQs rendered as a flat list, which makes the page bottom-heavy. Collapsing them tightens the layout without losing content.

---

# PART A — Rename `/learn` to `/library`

## ⚠️ DO NOT blanket find-and-replace "learn" → "library"

This is the one way to get this badly wrong, and it would be hard to unpick.

Around 100 files in `src/` contain the string "learn". **Almost all of them must not change.** Specifically, leave alone:

- **"Learn in Curve"** — the brand name, everywhere, including every `metaTitle` ending `| Learn in Curve`
- **`src/components/pmq/LoLearnStage.tsx`** and the `learn` stage id in `src/lib/pmq/lo-stages.ts` — this is the *paid course's* study stage. Unrelated. Renaming it breaks the product.
- **The ordinary English word "learn"** in body copy, marketing text and legal pages
- Anything under `src/lib/tutor/`, `src/lib/pmq/`, `src/app/courses/`

Rename only the items explicitly listed below. If you find yourself editing a file not on this list, stop and report it instead.

## A1. Directories (4)

```
src/app/(site)/learn/     →  src/app/(site)/library/
src/components/learn/     →  src/components/library/
src/content/learn/        →  src/content/library/
src/lib/learn/            →  src/lib/library/
```

Use `git mv` so history is preserved.

## A2. Files containing `/learn` URL strings (8)

Change the **path** only:

| File | What changes |
|---|---|
| `src/app/(site)/learn/page.tsx` | `` href={`/learn/${page.slug}`} `` |
| `src/app/(site)/learn/[slug]/page.tsx` | canonical + OG url |
| `src/app/sitemap.ts` | `"/learn"` in `staticPaths`, both priority/changeFrequency conditionals, and `` `${SITE_URL}/learn/${page.slug}` `` |
| `src/components/learn/LearnArticle.tsx` | JSON-LD `url`, breadcrumb `href="/learn"`, related-page hrefs |
| `src/components/SiteFooter.tsx` | footer link |
| `src/components/SiteHeaderControls.tsx` | 3 places: active-route check (`pathname === "/learn"` and `startsWith("/learn/")`) plus 2 nav hrefs |
| `scripts/build-learn-sample-pool.mjs` | output path `src/content/learn/sample-pool.ts` |
| `scripts/verify-learn-samples-ringfence.mjs` | same path |

Also check `src/app/robots.ts` for any `/learn` reference and update if present.

## A3. Symbols

Rename these identifiers. All are defined inside the four directories above, so they are unambiguous.

| From | To |
|---|---|
| `LearnPage` | `LibraryPage` |
| `LearnGroup` | `LibraryGroup` |
| `LEARN_PAGES` | `LIBRARY_PAGES` |
| `LEARN_GROUP_LABELS` | `LIBRARY_GROUP_LABELS` |
| `getLearnPage` | `getLibraryPage` |
| `getAllLearnSlugs` | `getAllLibrarySlugs` |
| `getPublishedLearnPages` | `getPublishedLibraryPages` |
| `getLearnPagesByGroup` | `getLibraryPagesByGroup` |
| `isLearnPageIndexable` | `isLibraryPageIndexable` |
| `scaffoldLearnPage` | `scaffoldLibraryPage` |
| `LearnArticle` | `LibraryArticle` |
| `LearnSampleQuestions` | `LibrarySampleQuestions` |
| `LearnSampleQuestion` / `LearnSampleMcq` / `LearnSampleDropdown` | `Library…` equivalents |
| `LEARN_SAMPLE_POOL` | `LIBRARY_SAMPLE_POOL` |
| `pickLearnSamples` | `pickLibrarySamples` |
| `learnSampleCollisions` | `librarySampleCollisions` |
| `LEARN_HUB_APM_DISCLAIMER` (in `src/lib/legal-copy.ts`) | `LIBRARY_HUB_APM_DISCLAIMER` |
| `eligibleCountForLo` | unchanged |

Update all 11 page files under `src/content/library/pages/` to import `scaffoldLibraryPage`.

Rename the CSS class `pmq-markdown--learn-core` to `pmq-markdown--library-core` in `src/app/globals.css` and its usage in the article component.

Optional but tidy: rename the three scripts to `build-library-sample-pool.mjs`, `report-library-sample-pool.mjs`, `verify-library-samples-ringfence.mjs`, and update any `package.json` entries referencing them.

## A4. User-facing labels

- Breadcrumb JSON-LD and the visible breadcrumb: **"Learn" → "Library"**
- Nav label in header and footer: **"Library"**
- `src/app/(site)/library/page.tsx` heading and intro copy: replace references to "Learn" with "Library". Keep the meaning; do not rewrite the copy beyond the word itself.
- Leave every `metaTitle` suffix `| Learn in Curve` exactly as is.

## A5. Do not change

- Page slugs (`apm-pmq-pass-mark` etc.) and the `related` arrays, which reference slugs not paths
- The `group` values `"exam-prep"`, `"choosing"`, `"syllabus"`
- Any page body copy, FAQ text, `answerFirst`, `metaTitle` or `metaDescription`
- Sample question behaviour: syllabus pages show 3 from their own LO, other groups show none

---

# PART B — FAQ accordion on Library pages

## B1. What to build

The FAQ block at the bottom of each Library article becomes a collapsible accordion.

Reuse the existing pattern in **`src/components/pmq/PmqFaqSection.tsx`** so the Library matches the rest of the site. That component already uses a `useState` open index, a real `<button type="button">` trigger, and `aria-expanded`. Either extract it into something shared or mirror it. Do not introduce a new accordion library.

**One deviation from the existing component:** open the **first item by default** on Library pages. An entirely collapsed stack does not always read as expandable, and the first answer doing some work for a skimming reader costs nothing.

```
useState<number | null>(0)   // not null
```

## B2. ⚠️ The SEO constraint — this is the part that matters

**Both the question and the answer text must be present in the server-rendered HTML.** Collapse them **visually only**.

Google has been explicit since mobile-first indexing that content hidden behind accordions and tabs is indexed and ranks normally. What breaks it is fetching or mounting the answer on click. Then there is nothing in the HTML for a crawler to read, **and the FAQPage JSON-LD no longer matches visible content, which is a structured-data violation rather than merely a missed opportunity.**

So:

- ✅ Render all answers, hide with CSS or a `hidden` attribute, toggle on click
- ❌ Conditionally render (`{isOpen && <p>{answer}</p>}`) so closed answers are absent from the DOM
- ❌ Any lazy load, fetch, or dynamic import of answer content

If in doubt, prefer keeping the element mounted and toggling a class.

## B3. Accessibility

- Trigger must be a real `<button type="button">`, not a div with an onClick
- `aria-expanded` reflecting state, `aria-controls` pointing at the answer panel id
- Answer panel gets a matching `id`
- Keyboard: Enter and Space toggle. Native `<button>` gives this for free
- Do not remove focus outlines

## B4. Leave alone

- The FAQPage JSON-LD in the article component. It stays exactly as is. Schema and visible content must continue to match.
- FAQ question and answer text.
- The free mock exam CTA below the FAQs. It must remain visible and must not move above the fold of the FAQ block.

---

# Definition of done — report evidence, not "done"

**Part A:**

1. `/library` and all 11 `/library/[slug]` routes resolve logged-out; `/learn` returns 404 (expected, nothing was deployed)
2. `grep -rn '"/learn' src scripts` returns **no results**
3. `grep -rn 'Learn in Curve' src | wc -l` is **unchanged** from before the rename (report both numbers)
4. `src/components/pmq/LoLearnStage.tsx` and the `learn` stage id in `lo-stages.ts` are **untouched** — prove with `git diff --stat`
5. `/sitemap.xml` contains `/library` and 11 `/library/...` URLs, no `/learn`
6. Syllabus pages still render exactly 3 samples each from their own LO; exam-prep and choosing pages render none
7. `librarySampleCollisions()` returns an empty array

**Part B:**

8. `curl` a Library page and confirm **every** FAQ answer string appears in the raw HTML, including collapsed ones. Paste an excerpt showing a collapsed answer present in the source.
9. First FAQ item is open on load, the rest closed
10. Accordion is keyboard operable and `aria-expanded` flips correctly
11. FAQ JSON-LD is byte-identical to before Part B

**Both:**

12. Typecheck and build pass clean
13. `/free-mock-exam` and `/courses/pmq-in-5-days/mock` behave exactly as before

Expect the pre-commit hook to bump the site version by 0.1 per commit.

**Answer back rather than guess:** whether `PmqFaqSection` was cleanly extractable into a shared component or had to be mirrored, and anything in the rename that touched a file not listed above.
