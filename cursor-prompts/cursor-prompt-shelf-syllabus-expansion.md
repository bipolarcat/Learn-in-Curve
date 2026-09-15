# Cursor prompt — remove Shelf sample questions, publish 8 new library pages

**Written 19 Aug 2026.** Two changes in one pass: delete the library sample-question subsystem, and register eight new library pages whose content files are already in the repo (seven syllabus, one exam-prep).

Do them in the order below. **Task 1 must land before anything typechecks** — the eight new page files deliberately omit `sampleQuestionLos`, so the build will fail until the field is removed from the type.

## Why

Sample questions rendered only on `/library` syllabus pages. Three pages used them, drawing from a 55KB ring-fenced pool that exists for no other purpose. They are being removed from the product, which makes the whole subsystem dead code. Dead code with a large unused content file behind it is worse than no feature, so it goes rather than being left disabled.

Separately, the Shelf's syllabus group goes from 3 pages to 10, and the exam-prep group from 4 to 5.

---

## Task 1 — remove the sample-question subsystem

**1a. Verify before deleting.** Grep the whole of `src/` for consumers of each of the following, and report what you find before removing anything:

- `sample-pool` / `LIBRARY_SAMPLE_POOL` / `LibrarySampleQuestion`
- `pick-samples` / `pickLibrarySamples` / `eligibleCountForLo` / `librarySampleCollisions`
- `LibrarySampleQuestions`
- `sampleQuestionLos`

If any of these is imported by something outside `/library` — a script under `scripts/`, a test, the free mock exam, an admin route — **stop and report instead of deleting.** Do not assume the only consumers are the ones named below.

**1b. If nothing else consumes them, delete:**

- `src/content/library/sample-pool.ts`
- `src/lib/library/pick-samples.ts`
- `src/components/library/LibrarySampleQuestions.tsx`
- the now-empty `src/lib/library/` directory, if `pick-samples.ts` was the only file in it

**1c. Remove the field from the content model.** In `src/content/library/types.ts`, delete the `sampleQuestionLos` property from the `LibraryPage` type and its doc comment. Nothing replaces it.

**1d. Remove the field from the three pages that set it**, and from the eight that set it to an empty array:

- `apm-pmq-business-case.ts` (`[4]`), `apm-pmq-risk-management.ts` (`[23]`), `apm-pmq-stakeholder-management.ts` (`[10]`)
- `apm-pmq-exam-format.ts`, `apm-pmq-pass-mark.ts`, `apm-pmq-vs-pfq.ts`, `apm-pmq-vs-pmp.ts`, `apm-pmq-vs-prince2.ts`, `how-hard-is-apm-pmq.ts`, `how-long-to-revise-for-apm-pmq.ts`, `is-apm-pmq-worth-it.ts` (all `[]`)

**1e. Strip the render path.** In `src/components/library/LibraryArticle.tsx`, remove the `samples` const, the `page.group === "syllabus"` gate, the `pickLibrarySamples` import, the `LibrarySampleQuestions` import, and the `{samples.length > 0 ? … : null}` block. Delete the explanatory comment above the const with it — it documents a decision that no longer applies.

The reading card then ends on the markdown body. Check the spacing still looks right, since the body was previously followed by a `mt-12` block.

---

## Task 2 — register the eight new pages

The content files already exist at `src/content/library/pages/`. Do not rewrite their copy — it is final and voice-checked against `VOICE_GUIDE.md`.

Seven in the syllabus group:

- `apm-pmq-governance.ts`
- `apm-pmq-project-life-cycles.ts`
- `apm-pmq-breakdown-structures.ts`
- `apm-pmq-scheduling-and-critical-path.ts`
- `apm-pmq-change-control.ts`
- `apm-pmq-quality-management.ts`
- `apm-pmq-leadership-and-teams.ts`

One in the exam-prep group:

- `how-to-answer-apm-pmq-exam-questions.ts`

In `src/content/library/index.ts`, add the imports and the array entries. Keep the existing pages in their current order and append the new ones, so the syllabus group reads business case, risk, stakeholders, then the seven new ones:

```ts
import { page as apmPmqGovernance } from "./pages/apm-pmq-governance";
import { page as apmPmqProjectLifeCycles } from "./pages/apm-pmq-project-life-cycles";
import { page as apmPmqBreakdownStructures } from "./pages/apm-pmq-breakdown-structures";
import { page as apmPmqScheduling } from "./pages/apm-pmq-scheduling-and-critical-path";
import { page as apmPmqChangeControl } from "./pages/apm-pmq-change-control";
import { page as apmPmqQualityManagement } from "./pages/apm-pmq-quality-management";
import { page as apmPmqLeadershipAndTeams } from "./pages/apm-pmq-leadership-and-teams";
import { page as howToAnswerApmPmq } from "./pages/how-to-answer-apm-pmq-exam-questions";
```

and append to `LIBRARY_PAGES`:

```ts
  apmPmqGovernance,
  apmPmqProjectLifeCycles,
  apmPmqBreakdownStructures,
  apmPmqScheduling,
  apmPmqChangeControl,
  apmPmqQualityManagement,
  apmPmqLeadershipAndTeams,
  howToAnswerApmPmq,
```

All eight are `status: "published"` with real copy, so they become indexable and enter the sitemap automatically via `getPublishedLibraryPages()`. No change to `sitemap.ts` is needed.

---

## Task 3 — wire the cluster both ways

The new pages already point at siblings. The three existing syllabus pages still point only at each other, which leaves the cluster one-directional. Update their `related` arrays:

- `apm-pmq-business-case.ts` — add `"apm-pmq-governance"` and `"apm-pmq-change-control"`
- `apm-pmq-risk-management.ts` — add `"apm-pmq-scheduling-and-critical-path"` and `"apm-pmq-quality-management"`
- `apm-pmq-stakeholder-management.ts` — add `"apm-pmq-leadership-and-teams"` and `"apm-pmq-governance"`
- `apm-pmq-exam-format.ts` — add `"how-to-answer-apm-pmq-exam-questions"`
- `how-hard-is-apm-pmq.ts` — add `"how-to-answer-apm-pmq-exam-questions"`
- `apm-pmq-pass-mark.ts` — add `"how-to-answer-apm-pmq-exam-questions"`

Keep each array to at most five entries; drop the least relevant existing entry if that limit is reached rather than letting the block grow.

---

## Task 4 — verify

Report actual output for each, not a claim that it passed.

1. `npx tsc --noEmit` clean.
2. `npm run build` clean, and `generateStaticParams` produces 19 library routes.
3. Fetch `/sitemap.xml` from a local build and confirm the library entry count goes from 11 to 19, with the eight new slugs present and no `sampleQuestionLos` references anywhere in the tree.
4. Load two of the new pages in a browser, one syllabus and the exam-prep one, and confirm: the answer-first box renders, the markdown body renders with headings, there is no sample-question block, the FAQ accordion works, the related links render as **real `<a href>` anchors** and not buttons — this is the orphan-page regression fixed on 19 Aug, do not reintroduce it.
5. Confirm the three JSON-LD blocks (FAQPage, Article, BreadcrumbList) still emit on a new page, and that `dateModified` reads `2026-08-19`.
6. Confirm no page shows the "Draft / placeholder copy" banner.

## Do not

- Do not change any copy in the eight new files, or in the existing eleven. Content is out of scope for this task.
- Do not delete anything in Task 1b without completing the grep in Task 1a first.
- Do not add sample questions back in any other form on these pages.
- Do not change `sitemap.ts`, `robots.ts` or any canonical.
- Do not reintroduce `router.push` navigation anywhere in the library components.

## Report back

Append to `BUSINESS_STATE.md`: what the Task 1a grep found, what was deleted, the before and after library route count (11 to 19), the sitemap entry count, and any inconsistency you hit. Leave the Linear ticket at In Review.
