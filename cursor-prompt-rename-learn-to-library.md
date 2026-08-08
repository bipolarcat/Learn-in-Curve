# Cursor Prompt — Rename `/learn` to `/library`

**Written by:** Claude, 2026-08-08
**For:** Cursor
**Related:** `cursor-prompt-growth-pass-2.md`
**Size:** Mechanical rename. No behaviour changes, no copy rewrites.

---

## Why

`learnincurve.com/learn` repeats the brand word, and worse, it collides with the paid product. The course *is* learning. A visitor reading the nav cannot tell which item is free and which one they pay for. `/library` reads as free reference material and stays correct once PFQ and PMP content is added.

Nothing is deployed or indexed yet, so this is a free rename with no redirect debt.

---

## ⚠️ DO NOT blanket find-and-replace "learn" → "library"

This is the one way to get this badly wrong, and it would be hard to unpick.

Around 100 files in `src/` contain the string "learn". **Almost all of them must not change.** Specifically, leave alone:

- **"Learn in Curve"** — the brand name, everywhere, including every `metaTitle` ending `| Learn in Curve`
- **`src/components/pmq/LoLearnStage.tsx`** and the `learn` stage id in `src/lib/pmq/lo-stages.ts` — this is the *paid course's* study stage. Unrelated. Renaming it breaks the product.
- **The ordinary English word "learn"** in body copy, marketing text and legal pages
- Anything under `src/lib/tutor/`, `src/lib/pmq/`, `src/app/courses/`

Rename only the items explicitly listed below. If you find yourself editing a file not on this list, stop and report it instead.

---

## 1. Directories (4)

```
src/app/(site)/learn/     →  src/app/(site)/library/
src/components/learn/     →  src/components/library/
src/content/learn/        →  src/content/library/
src/lib/learn/            →  src/lib/library/
```

Use `git mv` so history is preserved.

## 2. Files containing `/learn` URL strings (8)

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

## 3. Symbols

Rename these identifiers. They are unambiguous, all defined inside the four directories above.

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
| `eligibleCountForLo` | unchanged |
| `learnSampleCollisions` | `librarySampleCollisions` |
| `LEARN_HUB_APM_DISCLAIMER` (in `src/lib/legal-copy.ts`) | `LIBRARY_HUB_APM_DISCLAIMER` |

Update all 11 page files under `src/content/library/pages/` to import `scaffoldLibraryPage`.

Also rename the CSS class `pmq-markdown--learn-core` to `pmq-markdown--library-core` in `src/app/globals.css` and its usage in the article component.

Optional but tidy: rename the three scripts to `build-library-sample-pool.mjs`, `report-library-sample-pool.mjs`, `verify-library-samples-ringfence.mjs`, and update any `package.json` script entries that reference them.

## 4. User-facing labels

- Breadcrumb JSON-LD and the visible breadcrumb: **"Learn" → "Library"**
- Nav label in header and footer: **"Library"**
- `src/app/(site)/library/page.tsx` heading and intro copy: replace references to "Learn" with "Library". Keep the meaning, do not rewrite the copy beyond the word itself.
- Leave every `metaTitle` suffix `| Learn in Curve` exactly as is.

## 5. Do not change

- Page slugs (`apm-pmq-pass-mark` etc.) and the `related` arrays, which reference slugs not paths
- The `group` values `"exam-prep"`, `"choosing"`, `"syllabus"`
- Any page body copy, FAQ text, `answerFirst`, `metaTitle` or `metaDescription`
- Sample question behaviour: syllabus pages show 3 from their own LO, other groups show none

---

## Definition of done — report evidence

1. `/library` and all 11 `/library/[slug]` routes resolve logged-out; `/learn` returns 404 (expected, nothing was deployed)
2. `grep -rn '"/learn' src scripts` returns **no results**
3. `grep -rn 'Learn in Curve' src | wc -l` is **unchanged** from before the rename
4. `src/components/pmq/LoLearnStage.tsx` and the `learn` stage id in `lo-stages.ts` are **untouched** (`git diff --stat` proves it)
5. `/sitemap.xml` contains `/library` and 11 `/library/...` URLs, no `/learn`
6. Typecheck and build pass clean
7. Syllabus pages still render exactly 3 samples each from their own LO; exam-prep and choosing pages render none
8. `librarySampleCollisions()` returns an empty array

Report the actual grep counts and `git diff --stat`, not a summary.
