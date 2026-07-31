# Mock exam expansion: short/long-form content, AI grading, more Pro mock exams

Research pass, 2026-07-18. Everything below is verified against the live Supabase database (`dbjoimidfbftammchnql`) and the actual application code — not docs, not memory, not assumptions. Where a figure is quoted, it came from a live `execute_sql` query or a direct file read, not an estimate.

## Bottom line

Yes, this is buildable, and most of the hard infrastructure already exists — an AI grading system for short/long-form answers is already live in the codebase, cost per graded answer is negligible, and there's a proven content-authoring pipeline that already produced the current written questions. But there's a real bug sitting in front of all of it: the live database is missing columns the mock-exam code depends on, which means the Full Mock Exam almost certainly errors out for a real user right now. That has to get fixed before any new content work, or new questions would just be feeding a broken feature. Below is the full picture, then a recommended sequence.

## What's actually live right now

The `questions` table in Supabase holds 804 rows, not the "1,000+" the free-tier practice CTA copy claims (`PracticeQuizSection.tsx`) and somewhat under the "800+ questions" figure used in the Pro-upsell copy (`pro-included.ts`) — that second one is at least close to accurate. Breakdown by context:

| Context | Rows live in Supabase | Rows authored in local `lo*.json` |
|---|---|---|
| `practice_quiz` (quiz set 1) | 240 | 240 (24 LOs × ~10 each) |
| `quiz_set_2` | 240 | 240 |
| `quiz_set_3` | 240 | 240 |
| `quiz_set_4` | 10 | 240 |
| `quiz_set_5` | 10 | 240 |
| `quiz_set_6` | 10 | 240 |
| `quiz_set_7` | 14 | 240 |
| `quiz_set_8` | 0 | ~210 (missing for 3 LOs) |
| `mock_exam` | 40 | 40 |
| **Total** | **804** | **1,858** |

There are roughly **1,054 already-written, already-reviewed practice questions sitting in the repo that were never migrated into the live database.** Quiz sets 4 through 8 are almost entirely missing live despite being fully authored locally. This is a bigger, faster win than writing anything new: migrating what already exists would take the live question count from 804 to 1,858 — comfortably past "1,000+" — with zero new content generation. Worth doing before or alongside anything else in this report, and it's also what makes the current "1,000+ questions" marketing claim actually true rather than a live compliance risk (more on that below).

All practice-quiz content, at every tier, is deliberately MCQ/scenario-MCQ/dropdown only — this was a considered decision from 2026-07-02, confirmed still in force: written (short/long-form) questions were explicitly removed from the practice bank because they can't be auto-marked, and instant deterministic feedback is core to how the practice tier is designed to work. That decision still holds and I'd recommend not reopening it — it means new written-answer content belongs in the mock exam, not the practice quizzes, which lines up with what you asked for anyway.

## The mock exam itself

One mock exam exists: 40 questions, 90 marks — 25 auto-marked (20 MCQ + 5 dropdown, 30 marks) and 15 written (10 long-form + 5 short-form, 60 marks). This is genuinely one exam, served from a single fixed question pool; there's a Lite tier (auto-marked-only, free, 45-minute timed) and a Full tier (all 40 questions, Pro-only, 150-minute timed with a scheduled break) — both pull from that same 40-question set, Lite just filters down to the auto-markable subset.

**The AI grading system already exists and is well-built.** `callExamGrader.ts` calls Gemini with a structured JSON response schema (bounded integer score, feedback string, rubric-evidence array), temperature 0 for consistency, and an explicit instruction to mark conservatively against a supplied rubric and model answer. It's wired into the exam finalization flow (`gradeWrittenAttempts()` in `mock-actions.ts`): every written answer gets graded individually, retried on failure, and the whole thing is gated behind the same Pro entitlement and the same fair-usage cost budget that already governs AI tutor chat. Each written question already has the three fields the grader needs — `question`, `model_answer`, `marking_guide` — averaging a few hundred words each. This is not a system that needs to be built; it's a system that needs more content fed into it.

**Cost is not a real constraint.** Gemini pricing in this codebase is $0.50/million input tokens, $3.00/million output tokens. A single graded answer (question + student response + rubric + model answer in, a short feedback string out, capped at 800 output tokens) costs a fraction of a UK penny — well under 1p per question graded. The entire Pro fair-usage budget is $3.15 (≈£2.50) per user, shared across tutor chat and exam grading combined. Even tripling the written-question count per exam attempt wouldn't meaningfully dent that budget. Don't let AI-grading cost be a factor in deciding how many questions to add.

## The blocking issue: the database doesn't match the code

This is the most important finding in this report, and it wasn't something I was looking for — it turned up while checking the entitlement logic. The application code (`mock-actions.ts`, `mock-domain.ts`) reads and writes `exam_sessions.tier`, `.status`, `.deadline_at`, `.break_started_at`, `.break_ends_at`, `.config_snapshot`, and `.finalized_at`. **None of those columns exist on the live `exam_sessions` table.** The live schema only has `id, user_id, course_id, started_at, submitted_at, time_limit_minutes, total_score, max_score, passed, created_at`. I checked the full migration history (21 migrations, most recent 2026-07-17) — nothing ever added those columns.

In practice, this means `startMockExamSession()` — the very first thing that runs when someone clicks "Start" on either mock exam tier — is very likely attempting an `insert` with fields the database will reject outright. I did not test this against a live session (didn't want to write test data into production), but structurally, this looks like the Lite/Full split shipped as application code without its matching Supabase migration ever being written or applied. This is the exact "Cursor reported done, verify before trusting" pattern already documented a few times in `BUSINESS_STATE.md` for this project, just not yet caught for this particular feature.

**Recommendation: this is a Priority-0 fix, ahead of any content work.** Confirm live by attempting a real mock exam start (or ask Cursor to check), and if confirmed, write the missing migration for `exam_sessions` before touching question content — there's no point authoring 20 new written questions for an exam flow that currently can't be started.

## Answering what you actually asked

**Can more short-form and long-form questions be added to the mock exam?** Yes, and the path is proven — this is exactly the same shape of work as the LO quiz rebuild from earlier this month (LIC-28), which successfully authored ~240 new MCQ/dropdown questions from LO content alone. The written-question schema is simple and already has 15 working examples to pattern-match: `question`, `model_answer`, `marking_guide`, `marks`, `lo_reference`, `type` (`long_form` or `short_recall`). Source material is exactly what you listed: the 24 `lo*.json` files (key definitions, core content, misconceptions, exam technique per LO), the 341-page APM delegate pack PDF, and the 24 official APM "sample paper" PDFs sitting in `LIC - PMQ in 5days/pmqstudypack/` — one per syllabus module, which I hadn't seen referenced anywhere in the docs until this pass but are a strong source for realistic exam-style scenario framing.

One content-quality note carried over from an earlier decision: the mock exam used to have 9 questions built around a fictional "Space App" case study, which got fully replaced in favor of generic, standalone scenarios (supply-chain upgrades, factory automation, etc.) with no named company or persona. Any new written questions should follow that same pattern — original scenarios grounded in the syllabus, not reused or lightly-reworded APM specimen questions from the sample papers. The sample papers are APM's commercial content; safe to use them as a reference for realistic phrasing, command-word style, and mark-weighting patterns, not safe to lift actual questions or model answers from them. This is worth being explicit about in whatever prompt goes to Claude or Cursor for the actual authoring pass.

**NotebookLM's role:** you've already got per-LO NotebookLM notebooks set up (`LIC - PMQ in 5days/Notebook LM/LO1`–`LO24`, each with source PDFs) — currently used for the audio-overview feature, not content generation. It could reasonably be used as a comprehension aid while drafting new scenarios (asking it to surface realistic professional-practice angles per LO), but I wouldn't treat its output as publishable directly — the existing pipeline's rule (author from the LO's own structured JSON plus the delegate pack, not open-ended generation) has been deliberate specifically to avoid non-APM terminology drift, and that reasoning applies here too.

**Can there be more mock exams for the Pro bundle (plural — Mock Exam 2, 3, etc.)?** Not with the current schema, not without real engineering work. The `questions.context` column has a hard database check constraint listing exactly nine allowed values (`practice_quiz`, `mock_exam`, `quiz_set_2` through `quiz_set_8`) — there's no `mock_exam_2` slot, and `exam_sessions` has no concept of "which exam" beyond the lite/full tier. Two realistic ways to get there:

- **Fast path — grow and rotate the single pool.** Add the new written questions (and optionally more auto-marked ones) into the existing `mock_exam` context, then change question-selection from "serve all 40 fixed questions every time" to "randomly sample N written + M auto-marked questions per attempt from a larger pool." This gets you the thing you actually want — less repetition, fresher content on retakes — without a schema migration. This is the one I'd do first.
- **Real path — genuinely separate exams.** Add an exam identifier (new column or a broader context scheme), extend `exam_sessions` to record which exam variant was attempted, and build UI for exam selection. This is a legitimate roadmap item if the goal is literally "Mock Exam 1 / Mock Exam 2" as distinct, marketable products, but it's a bigger lift and should come after the Priority-0 schema fix and probably after the fast-path version proves out.

**Pro bundle / entitlement model, for context:** there's currently one single entitlement (`ai_tutor` feature flag, checked via `getAiTutorEntitlement()`) that gates the AI tutor, the Full mock exam, AI grading, and — per the marketing copy — video/audio LO recaps and the end-of-course report. "Pro bundle" isn't multiple SKUs; it's one purchase that unlocks all of the above. More written mock-exam content or a second mock exam would sit inside that same existing entitlement, not need a new pricing tier.

## Legal and compliance notes (informal guidance, not a substitute for a solicitor)

A few things surfaced directly by this research that are worth flagging now rather than at the pre-launch legal pass:

The "Unlock 1,000+ questions" claim (`PracticeQuizSection.tsx`) is a specific, quantifiable number shown to consumers, and it's currently false against what the live database actually serves (804). Under UK consumer protection law this kind of claim needs to be substantiated at the time it's shown — this was already flagged in your own legal checklist per `BUSINESS_STATE.md`, and this research gives you the precise current gap. Migrating the ~1,054 unshipped questions (which fixes this for free) or adjusting the copy are the two options; I'd do the migration regardless since the content already exists.

The delegate pack and sample-paper PDFs are APM's copyrighted material, not yours. Using them as grounding/reference for writing original questions is standard and low-risk (facts and syllabus scope aren't copyrightable, APM's specific wording and specimen questions are); reproducing or closely paraphrasing their actual sample-paper questions or model answers into the product would not be. Worth stating explicitly in any content-generation brief, the same way the Space App replacement already established "original scenarios only" as the working pattern.

Written exam answers are personal data sent to Google's Gemini API for grading and then stored in the `attempts` table with no retention/expiry column visible in the schema — unlike tutor chat, which already has a documented 12-month rolling retention policy. Worth confirming whether the existing Gemini data-processing terms (tracked under LIC-50 per the decision log) actually cover this separate grading code path, and whether the privacy policy explicitly discloses that written exam answers specifically (not just tutor chat messages) go to a third-party AI processor. Expanding the volume of written answers increases the amount of this kind of data flowing through the system, so it's a good moment to close this gap rather than after the fact.

There's no visible appeal or human-review path for an AI-assigned mock exam score, and a "pass" currently triggers a certificate. As written-answer volume grows, so does the surface area for a wrong AI grade to affect that outcome. This is a fairness/trust consideration more than a hard legal requirement, but worth a product decision — even a simple "flag this grade" mechanism would go a long way, and it's worth confirming the certificate UI is unambiguous that this is a Learn in Curve mock-exam certificate, not an APM-recognized credential.

## Recommended sequence

First, confirm and fix the `exam_sessions` schema gap — this blocks the Full Mock Exam entirely if my read of the code is right, and it's a five-minute check (attempt a real session start, or grep Cursor's actual shipped migration list) to confirm before writing the fix. Second, migrate the ~1,054 already-authored practice questions from the local JSON into Supabase — this is pure upside, no new authoring, and it's what makes the existing marketing claims true. Third, author the new written mock-exam questions (15–20 as you proposed, following the existing schema and sourcing rules above) and switch the mock exam to sample from a pool rather than serving a fixed set — this gets you "more mock exams" in effect without a schema migration. Fourth, if a genuinely separate second mock exam is still wanted after that, scope it as its own piece of engineering work with a real exam-identifier schema.

I haven't logged any of this to Linear — it's not connected in this session. Once it is (or if you paste this to Cursor/Linear yourself), the schema-gap fix and the content-migration item should probably be Urgent/High given the first one is a live-blocking bug and the second is a standing legal-checklist item with a ready fix.
