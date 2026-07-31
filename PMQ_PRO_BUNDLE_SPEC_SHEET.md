# PMQ in 5 Days — Pro Bundle Spec Sheet

**Price: £9.99, one-time unlock. Not a subscription.**

Source: `FEATURES.md` (canonical feature doc) + live Supabase counts verified 2026-07-27. Numbers below are DB-verified, not estimates.

---

## Everything in Starter, plus:

### Sly, the AI tutor
- Unlimited chat (subject to fair-usage policy), exam-focused answers only — Sly's whole purpose is getting the learner to pass, not general chit-chat
- End-of-course report — strengths, weaknesses, suggestions, generated from quiz performance + chat history once all 24 LOs are complete

### Practice — full question bank
- **1,862 total practice questions** across all 24 LOs (vs. 240 in Starter) — **1,622 extra questions** unlocked
- Every additional quiz set per learning objective

### Media
- One video per learning objective (24 videos)
- Audio overview per learning objective

### Mock exams — full set
- 4 complete 40-question, 90-mark papers total (**160 questions**) — Starter includes only Exam 1; Pro adds Exams 2, 3 and 4 (**120 additional questions**)
- All four exams' written answers are AI-graded by Gemini (updated 2026-07-28 — Exam 1 is no longer self-assessed; free tier has a flat 50p/user grading budget vs. Pro's £5 credit)
- Timed, proctored-style format with a scheduled break — mirrors the real exam experience

### Pricing mechanics
- £9.99 one-time unlock
- £5 of that is credited as Sly usage allowance
- Top-ups available once the allowance runs out; 70% of any top-up credits further Sly usage (30% platform fee)

---

## Quick comparison table (for landing page)

| | Starter (Free) | Pro (£9.99) |
|---|---|---|
| Learning objectives | 24, full syllabus | 24, full syllabus |
| Practice questions | 240 | 1,862 total |
| Mock exam papers | 1 (AI-graded) | 4 (all AI-graded) |
| AI tutor (Sly) | — | Unlimited chat + end-of-course report |
| Video per LO | — | 24 videos |
| Audio per LO | — | 24 audio overviews |

---

## Status

`FEATURES.md` updated 2026-07-27: free tier renamed Lite → Starter, quiz counts corrected to live DB-verified numbers (240 Starter / 1,862 total / 1,622 Pro-exclusive). `PmqPreviewCompare.tsx` (the live landing comparison table) already carried the correct numbers and is now updated to "Starter" too.

Not touched: the internal `MockExamTier` code value `"lite"` in `src/lib/pmq/*.ts` and `src/types/pmq.ts` — that's a routing/logic identifier, not user-facing copy. Say the word if you want that renamed too.
