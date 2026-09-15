# PFQ in 2 Days, visual and structural parity with PMQ in 5 Days

Handoff spec for Cursor. Written 2026-09-05. Revised same day after a bank audit
resolved the open stage-set question and the course-overview section mapping.

**Goal:** PFQ in 2 Days currently reads as a different product from PMQ in 5 Days.
Bring it to full parity, routes, shell, lesson architecture, progress chrome, course
overview and dashboard treatment, so the two courses are visibly one brand. Driver is
brand consistency and cross-sell, not a shared course engine: prefer the smallest
generalisation that achieves parity over building a generic course framework.

**Read before starting:** `CLAUDE.md`, `DESIGN.md` (v4 tokens are the visual source of
truth), `PFQ in 2 days/PFQ_RESEARCH.md` §2, §4, §6 and §7, and `OPERATIONS.md`
(section_progress gotchas). Sections below are ordered by dependency.

**Related prompt:** `cursor-prompt-pfq-trap-backfill.md` is a prerequisite for the
inline trap callouts in section 3. It can run in parallel with sections 1 and 2.

---

## 0. Decisions already locked, do not relitigate

1. **PFQ's differentiators stay.** The 59-outcome coverage map, trap school, the
   Surpass-faithful mock simulator and the practice runner are the product's wedge
   per `PFQ_RESEARCH.md` §6. They are **restyled only**. Do not fold them into a
   PMQ-shaped structure, do not demote them in navigation, do not change their
   behaviour.
2. **Coverage and section progress are separate systems and both stay.** Per the
   product rule dated 2026-08-13 in `src/lib/pfq/lesson-actions.ts`: lesson
   checkpoints do NOT write `pfq_coverage_signals`; coverage stays measured from
   practice and mock only. This spec touches `section_progress` and never
   `pfq_coverage_signals`.
3. **Routes move to `/courses/pfq-in-2-days/*`.** The slug already exists in
   `src/lib/courses/registry-data.ts`.
4. **No database migration is required.** Verified against the live schema:
   `section_progress` already has `course_id`, `checklist_state`, `completed_at`,
   `orient_reached_at`, `learn_reached_at`, `video_reached_at`, `audio_reached_at`,
   `apply_reached_at`, `content_completed_at`, `quiz_completed_at`. If you believe you
   need a migration, stop and report why before writing one.
5. **PFQ uses a 4-stage pathway and trap school stays a standalone global module.**
   Decided 2026-09-05 after auditing the bank, see section 3a for the numbers.

---

## 1. Shell, generalise the course header (do this first)

`src/components/pmq/PmqCourseHeader.tsx` is already almost course-agnostic. Its props
(`courseName`, `breadcrumb`, `completionPercent`, `showProgress`, `streak`, `userTier`,
`showOverviewLink`, `trailing`) all generalise. The only PMQ-specific binding is the
hardcoded `PMQ_SLUG` import used to build the overview link.

1. Move it to `src/components/course/CourseHeader.tsx`.
2. Add a required `slug: CourseSlug` prop; derive the overview href from it.
3. Keep `PmqCourseHeader` as a thin wrapper that passes `slug={PMQ_SLUG}` so no PMQ
   call site changes in this step. Do not touch PMQ's rendered output.
4. `CourseChromeProgress` moves alongside it if it has no PMQ-specific logic; check
   before moving.

Acceptance: PMQ pages render byte-identically to before. Verify by screenshotting
`/courses/pmq-in-5-days` and one LO page before and after.

## 2. Routes, move PFQ under /courses

Move `src/app/(site)/pfq/**` to `src/app/courses/pfq-in-2-days/**`, preserving the
subtree shape:

```
courses/pfq-in-2-days/page.tsx
courses/pfq-in-2-days/learn/page.tsx
courses/pfq-in-2-days/learn/[objective]/page.tsx
courses/pfq-in-2-days/practice/page.tsx
courses/pfq-in-2-days/practice/[objective]/page.tsx
courses/pfq-in-2-days/mock/page.tsx
courses/pfq-in-2-days/mock/[attemptId]/page.tsx
courses/pfq-in-2-days/trap-school/page.tsx
courses/pfq-in-2-days/pricing/page.tsx
courses/pfq-in-2-days/preview/page.tsx
```

Then:

1. **Update the href constants** in `src/lib/pfq/constants.ts`
   (`PFQ_PRICING_HREF`, `PFQ_LEARN_HREF`, `PFQ_MOCK_HREF`, `PFQ_PRACTICE_HREF`,
   `PFQ_TRAP_SCHOOL_HREF`). Every one becomes `/courses/pfq-in-2-days/...`.
   Grep for any remaining hardcoded `"/pfq` string literals across `src/`, there are
   several, including inside `hasPfqProIntent`.
2. **Fix `revalidatePath` calls.** `src/lib/pfq/lesson-actions.ts` and
   `src/lib/pfq/practice-actions.ts` both revalidate literal `/pfq/...` paths. These
   fail silently if left stale, the page just serves stale progress. Derive them from
   the constants instead of re-hardcoding.
3. **Add 301 redirects in `middleware.ts`** for the whole old subtree. The current
   middleware only calls `updateSession`; add a path rewrite ahead of it that maps
   `/pfq` and `/pfq/:path*` to the new location with a permanent redirect. This must
   ship in the **same deploy** as the move.
4. **Update `src/app/sitemap.ts`.** `/pfq` and `/pfq/pricing` are the only two PFQ
   entries and the only two with real SEO weight. Point them at the new URLs.
5. **Delete the now-empty `(site)/pfq` directory.** Do not leave a stub.

Acceptance: `/pfq/learn` 301s to `/courses/pfq-in-2-days/learn`; a signed-in Pro user's
existing lesson progress still shows (section UUIDs are deterministic and unchanged,
so this should be automatic, verify, do not assume).

## 3. Lesson pathway, the main piece

Today `src/components/pfq/PfqObjectiveLesson.tsx` renders one long scrolling
`<article>` with stacked sections. Its own comment notes it does not reuse
`LoStudyJourney`. That changes.

**Do not fork `LoStudyJourney`.** Extract, then reuse:

1. Create `src/components/course/StudyJourney.tsx` holding the stage shell currently
   in `LoStudyJourney`: stage panel, continue button, jump nav, progress ring, spine
   scrollbar, stage pie, checkpoint celebration, reduced-motion handling. It takes a
   stage list plus a render function per stage, it must not know about PMQ or PFQ.
2. Create `src/lib/course/stages.ts` from the generic half of `src/lib/pmq/lo-stages.ts`
   (`collectUnlockedLoStages`, unlock/seal logic, the reached-column map). The PMQ
   stage list and the `24 × 7 = 168` progress unit constant stay in `lo-stages.ts`.
3. Rewrite `LoStudyJourney` to compose `StudyJourney` with the PMQ stage list. **PMQ's
   rendered output must not change.**
4. Create `src/lib/pfq/lesson-stages.ts` with the PFQ stage list per section 3a.
5. Rewrite `PfqObjectiveLesson` to compose `StudyJourney` with the PFQ stage list.

### 3a. The PFQ stage set, 4 stages, decided

PMQ runs 7 stages. PFQ has no video or audio content and no `worked_example` or
`exam_technique` in its lesson model, so a 1:1 copy leaves empty stages.

A 5th "traps" stage was considered and **rejected on evidence**. Bank audit,
2026-09-05, 306 active questions:

| Obj | Questions | Negative stems | Multi-select | Tagged `traps` |
|---|---|---|---|---|
| 1 | 28 | 5 | 2 | 5 |
| 2 | 22 | 2 | 0 | 1 |
| 3 | 7 | 1 | 0 | 1 |
| 4 | 56 | 3 | 1 | 4 |
| 5 | 42 | 2 | 1 | 3 |
| 6 | 30 | 5 | 0 | 3 |
| 7 | 42 | 5 | 0 | 5 |
| 8 | 30 | 2 | 0 | 3 |
| 9 | 26 | 2 | 0 | 2 |
| 10 | 23 | 2 | 1 | 2 |

Objective 3 has 7 questions total and is a 1-mark outcome. Six of ten objectives have
zero multi-select questions. A per-objective trap stage would render empty across most
of the course. Traps are also a *format* skill, not an LO-specific one, a negative
stem behaves identically in LO1 and LO7, so teaching it ten times is repetition without
variation.

**Build this stage list, as data, in `src/lib/pfq/lesson-stages.ts`:**

| PFQ stage    | Content source                             | Persistence column   |
|--------------|--------------------------------------------|----------------------|
| `orient`     | `where_this_fits` + `key_definitions`      | `orient_reached_at`  |
| `learn`      | `core_content` blocks (incl. `watch_for`)  | `learn_reached_at`   |
| `drill`      | practice questions for this objective      | `quiz_completed_at`  |
| `checkpoint` | `progress_checkpoint`                      | `completed_at`       |

`video_reached_at`, `audio_reached_at` and `apply_reached_at` are simply unused by PFQ.
Leave them alone. Do not drop them. PMQ uses them.

**Legacy rows: treat a non-null `completed_at` as every stage reached.** Resolve this on
read. Do **not** backfill the stage columns in the database and do **not** write a
migration for it.

There is already one such row in production (`section_id
f8a2c1e0-4d3b-4a9e-9c06-2e1d0b9a8c7d`, objective 6): `completed_at` is set, the
checklist has 6 entries, and every stage timestamp is null, because the staged pathway
did not exist when it was written. Without this rule that objective renders as complete
with zero of four stages, which reads as broken. The same rule covers anyone who
finishes an objective between now and this phase shipping.

### 3b. Inline trap callouts in the Drill stage

This replaces the rejected trap stage and is where the per-LO trap benefit actually
lands.

When a learner answers a trap-tagged question **incorrectly** in the Drill stage,
render the matching trap explanation inline, immediately, alongside the normal answer
explanation. Not before the question, not on a separate page, at the moment they fell
for it.

- Source the explanation from `PFQ_TRAP_SCHOOL.traps` in
  `src/lib/pfq/trap-school-content.ts`. Use the `whatToDo` field as the callout body
  and the module `title` as its heading.
- Map the question's `traps[]` tag values to trap school module ids. **Three tags
  only** (`absolutes` was dropped as a category on 2026-09-05, see 3d):
  `negative_stem` → `negative`, `multi_select` → `combination`,
  `near_miss` → `near_miss`.
  **Put this map in one exported constant** (`src/lib/pfq/trap-tags.ts`), not inline at
  the call site. The tag vocabulary and the module ids disagree and that is a real
  footgun. That file already exists; remove the `absolutes` entry from it.
- **A question can carry two tags.** `PFQP-7-7-2` is currently the only one (both a
  negative stem and a near-miss), so it is the single test case for this rule. Show exactly one callout, resolved by this fixed priority:
  **`near_miss` > `negative_stem` > `multi_select`.** Near-miss wins because it teaches
  something content-specific about the two terms the learner confused, where a negative
  stem callout only restates a generic reading habit. Do not stack callouts.
- Link the callout to `/courses/pfq-in-2-days/trap-school#<module-id>` with text along
  the lines of "More on this trap". Trap school gains anchor ids for this.
- Show nothing on a correct answer. This is corrective feedback, not a lecture.

**Depends on `cursor-prompt-pfq-trap-backfill.md`.** Only 29 of 306 questions currently
carry a `traps` tag, so without the backfill these callouts will almost never fire.
Build the component regardless; it degrades to showing nothing.

### 3c. Content mapping for the stages

From the existing `PfqLesson` shape in `src/lib/pfq/content.ts`. This is a re-layout,
no content authoring:

- `orient`, `where_this_fits`, then `key_definitions` via a component matching
  PMQ's `DefinitionsReveal` treatment.
- `learn`, `core_content[]`, each block using the PMQ `CoreContentBlock` visual
  treatment. `watch_for` has no PMQ equivalent: render it in the same slot and style
  PMQ uses for `misconceptions` callouts. Then `misconceptions` and `memory_aids`
  (reuse `MemoryAidsList` as-is, it is already generic over `{acronym, expansion, type}`).
- `drill`, the existing `PfqPracticeRunner`, embedded as a stage rather than a
  separate route, plus the trap callouts from 3b. The standalone practice route stays.
- `checkpoint`, `progress_checkpoint[]` via the PMQ `ProgressCheckpointList`
  treatment, writing `checklist_state` and `completed_at` exactly as
  `lesson-actions.ts` already does. **Do not change the reset behaviour**, it must
  keep clearing both fields (OPERATIONS.md gotcha).

Acceptance: a PFQ objective page shows the 4-stage pathway with a working progress
ring; stage timestamps land in `section_progress`; `pfq_coverage_signals` is untouched
by anything on this page; PMQ LO pages are visually unchanged.

### 3d. Absolutes is not a trap category, decided 2026-09-05

A fourth tag, `absolutes`, was specced and then dropped after reviewing the detector
output. 85 candidates were generated; roughly 14 were genuine. The reason for dropping
it is not detection noise, it is that the category is incoherent: the detector cannot
separate an absolute word used as an overclaim (which is *why* the option is wrong)
from one used descriptively in an option that is wrong for an unrelated reason.
"recording the current version of every project document" is a *correct* description of
configuration management serving as a near-miss distractor, and tagging it `absolutes`
would tell the learner the wrong thing about their own mistake.

`trap-school-content.ts` says so itself: absolutes is "a tie-breaker, not a rule. Use it
when you're down to two options and out of time." It is a strategy the learner applies
when stuck, not a property a question has. It also carries no measured frequency where
traps 1 and 2 both do, and `PFQ_RESEARCH.md` never mentions it.

**Trap School keeps its Trap 4 section as reading material.** Only the *tag* is dropped.
Do not delete the module from `trap-school-content.ts` and do not remove its anchor id.

## 4. Course overview, the section stack

`/courses/pfq-in-2-days/page.tsx` is currently a sales page: hero, three feature tiles,
plan cards, legal. PMQ's overview has twelve sections. Restructure PFQ to the same
rhythm.

Add `CourseHeader` with `slug="pfq-in-2-days"`, course completion percent and streak,
then build the section stack below.

**Every factual claim in this section comes from `PFQ_RESEARCH.md` §2 and §4. Do not
paraphrase from memory and do not round any figure.**

### 4a. Section mapping

| PMQ section | PFQ treatment |
|---|---|
| `PmqHeroStats` | Direct port, PFQ numbers |
| `PmqWhatsIncluded` (6 tickets) | Direct port, new copy |
| `PmqDayPlan` (5 days) | 2-day plan, 8 sessions. Content is in `PFQ_RESEARCH.md` §7 |
| `PmqMockExamsSection` | One 60-question Surpass-alike mock |
| `PmqExamStructureSection` | Direct, richer content |
| `PmqMarksBreakdownSection` | **Merge into exam structure**, 60 × 1 mark is too thin to stand alone |
| `PmqSyllabusWeightSection` | Direct, and **promote up the page** |
| `PmqCommandWordsTable` | **Does not transfer. Replace with a Trap School teaser** |
| `PmqMarkingGuidanceSection` | **Does not transfer. Replace with a guessing-policy section** |
| `PmqPassMarkSection` | Direct |
| `PmqGlobalFurtherReading` | Direct port |
| `PmqFaqSection` | Direct port |
|, | **New: coverage map teaser.** No PMQ counterpart |

Generalise the PMQ section components where the layout is identical (they share
`PmqExamGuideSections.module.css`); do not copy-paste the CSS modules.

### 4b. The two that do not transfer, and why

**Command words.** PMQ has a command words table because 60 of its 90 marks are
written and the command word signals what the marker wants. PFQ is 60 multiple choice
questions. There is no command word and there is no marker. Porting the table would
teach a skill the exam does not test.

Command words is PMQ's *format risk* section. PFQ's format risk is negative stems
(8.3% of the paper) and numbered-list multi-selects (10%). So that slot holds a **Trap
School teaser**: heading, the "roughly a fifth of the marks turn on question format"
line from `PFQ_TRAP_SCHOOL.why`, and a CTA to the module.

**Marking guidance.** PFQ is auto-marked. The scoring fact a candidate needs instead:
**no negative marking, unanswered scores zero, and APM explicitly advises guessing**
(§13a). Build that as the replacement section.

### 4c. Content for the sections that do transfer

- **Exam structure**, 60 questions, 1 mark each, 60 minutes, four options, delivered
  online in Surpass, remote-invigilated or classroom. Include the line that carries the
  whole product thesis: **59 outcomes, one question each, plus LO 10.4 twice, equals
  exactly 60. Every sitting covers every outcome exactly once. There is no sampling.**
- **Syllabus weighting**. LO4 = 11 marks, LO3 = 1 mark. LO4 + LO5 + LO7 = 27 marks,
  45% of the paper. Frame it as what it is: study-time allocation advice competitors do
  not give.
- **Pass mark**, 36 out of 60, 60%, fixed for every sitting. State plainly that it
  does not vary between papers. This is a better story than PMQ's floating Angoff cut
  score and the copy should be confident about it.
- **Coverage map teaser**, no PMQ component to inherit from, so design it with the
  existing ticket and stamp-chip vocabulary. Lead with the enumerable-completeness
  claim above.

### 4d. Ordering

PMQ's exam-guide sections exist to demystify a complicated exam. PFQ's exam is fully
transparent and enumerable, so the overview's job is to *demonstrate completeness*
rather than demystify. Order accordingly: coverage map and syllabus weighting high,
exam mechanics below them, FAQ last.

### 4e. Legal

`PFQ_RESEARCH.md` §13d: APM's exam regulations prohibit reproducing exam questions
"anywhere or in any way". If any overview section shows an example question it must be
independently authored, not lifted from the sample paper. Keep `PFQ_ATP_DISCLAIMER`
and the "not an APM Accredited Training Provider" statement on the page.

## 5. Dashboard card

`DashboardPmqCourseCard` becomes `DashboardCourseCard` taking course identity, ring
percent, streak, tier and a resume href. PFQ appears on `/dashboard` with the same
ring, badge and hover treatment as PMQ. `src/app/(site)/dashboard/page.tsx` already
calls `getUserCourses`, so PFQ should slot in without new queries, verify.

## 6. Restyle-only surfaces

Visual treatment to match PMQ; **no behaviour change, no prop changes**:
`PfqCoverageMap`, `PfqLessonMap`, `PfqTrapSchool`, `PfqMockRunner`,
`PfqPracticeRunner`, `PfqResults`, `PfqPlanCards`.

Bring them onto the same token usage, border radius, shadow, eyebrow and stamp-chip
conventions PMQ uses. Reuse `stamp-chip` and the `productSurfaceQuiet` /
`productActionSecondary` semantic helpers rather than bespoke CSS where they fit.
`PfqMockRunner` must keep its Surpass-faithful behaviour exactly, flag, review panel,
unattempted filter, pacing. Restyle the chrome, not the mechanics.

`PfqTrapSchool` additionally needs stable anchor ids per trap module
(`#negative`, `#combination`, `#near_miss`, `#absolutes`) for the callout links in 3b.
`#absolutes` is included deliberately: Trap 4 stays in the module as reading material,
it is only the machine tag that was retired (3d).

---

## Sequencing and shipping

Ship after each phase. Do not do this as one drop.

- **Phase 1**, sections 1 and 2 (shell + routes). Most of the visible parity, no
  content risk. The trap backfill prompt can run in parallel here.
- **Phase 2**, section 3 (pathway + inline callouts). Largest piece.
- **Phase 3**, section 4 (overview). Second largest, and the most copy-heavy.
- **Phase 4**, sections 5 and 6.

## Constraints

- Never use em dashes or en dashes in any user-facing copy you write. Commas, colons,
  full stops or parentheses instead.
- Every visual decision comes from `DESIGN.md` v4 tokens. If `BRAND_KIT_v4.html`
  disagrees with `DESIGN.md`, the HTML wins.
- PMQ's rendered output must not change at any point in this work. Any diff to a PMQ
  page is a regression, and screenshots before/after are the check.
- Do not touch `pfq_coverage_signals`, the coverage resolve rule, or the mock scoring
  logic.
- Every exam fact on the overview must be traceable to `PFQ_RESEARCH.md`. If a figure
  is not in that document, do not invent it, flag it and leave a TODO.
- Report status by appending a `BUSINESS_STATE.md` decision-log entry. Do not claim a
  phase is done without stating what you actually verified (route responses, a real
  `section_progress` row, a screenshot diff).

## Verification checklist before calling any phase done

1. `/pfq/*` old URLs 301 to the new paths, including deep links.
2. A signed-in PFQ Pro user's pre-existing lesson progress still renders.
3. Ticking a checkpoint persists across a refresh, and resetting clears both
   `completed_at` and `checklist_state`.
4. `pfq_coverage_signals` row count is unchanged after walking a full lesson.
5. Answering a trap-tagged question wrong in Drill shows exactly one trap callout;
   answering it right shows none.
6. `/courses/pmq-in-5-days` and one PMQ LO page are pixel-identical to pre-change.
7. `npm run build` clean, no new type errors.
