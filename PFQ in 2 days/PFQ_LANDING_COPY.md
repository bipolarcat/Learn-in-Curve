# `/pfq` landing page — final copy

Build agent renders this verbatim. Do not rewrite, shorten or "improve" the wording in code — if something doesn't fit the layout, flag it and Claude will re-cut it.

Voice: follows `VOICE_GUIDE.md`. Plain, specific, no hype, no exclamation marks. Every claim on this page is checkable.

---

## Hero

**H1:** The PFQ exam has 59 learning outcomes. Find out which ones you can't answer yet.

**Sub:** APM's syllabus contains 59 learning outcomes, and the exam asks one question on every single one. That means "am I ready?" has an exact answer. Sit a free 60-question mock and get it.

**Primary CTA:** Sit the free mock — 60 questions, 60 minutes
**Secondary CTA:** See how it works

**Under CTA, small:** No account needed. No card. Nothing to install.

---

## The claim, explained (section 2)

**H2:** Why we can promise a number

APM publishes the PFQ syllabus, and the qualification handbook states that every learning outcome in it is assessed in the exam, with one outcome assessed twice. Fifty-nine outcomes, sixty questions.

So unlike almost every other exam, there is nothing to guess at. There's no topic that might come up. There's a finite list, and you either know each item or you don't.

Our mock asks one question per outcome, in the same format and to the same difficulty as the real paper. When you finish, you don't get a percentage — you get the list of outcomes you'd currently drop marks on, ordered by how many marks each one is worth.

---

## What you get (section 3)

**Sixty questions, one per learning outcome.** Not a random pool. Every outcome in the syllabus, covered exactly once, the way the real exam does it.

**A timer and an interface that behaves like the real one.** The PFQ is sat online in Surpass — you can flag questions, filter your review by unattempted or flagged, and see time remaining throughout. The only free practice paper APM publishes is a PDF from 2022 that asks you to fill in an answer sheet with an HB pencil. This isn't that.

**A gap list, not a grade.** Every outcome you missed, what it's called, why the right answer is right, and which day of study it belongs to.

**Honest weighting.** Project management planning is worth 11 marks. Roles and responsibilities is worth 1. You should know that before you decide what to revise tonight.

---

## Facts about the exam (section 4)

Straight from the APM qualification handbook. Worth knowing before you book.

- 60 multiple-choice questions, 60 minutes, one mark each
- Pass mark is 36 out of 60 — that's 60%, and you can get 24 wrong and still pass
- No negative marking. A wrong answer and a blank both score zero, so never leave a blank
- Sat online, all year round, either through a training provider or as an open online exam
- No prior experience or qualifications required
- Around 25 hours of study is what APM says it typically takes

**Link:** Read the full research →  *(links to a public write-up of PFQ_RESEARCH.md, or omit until that exists)*

---

## Who this is for (section 5)

**You're booked in and want to know if you're ready.** The mock gives you a mark and a named gap list, in an hour.

**You've failed once and are paying for a resit.** You already know the content roughly. What you need is to find the specific outcomes that cost you the marks — and this is built to do exactly that.

**You're self-studying without a course.** APM's open online exam route exists precisely for you, and it comes with no teaching attached. This fills part of that gap for free.

---

## After the mock (section 6)

**H2:** PFQ in 2 Days

The full course is in build: both days, all 59 outcomes taught in syllabus order, the definitions engine, and unlimited mocks. Leave your email and we'll tell you once — when it launches, and not otherwise.

*(Wire to the existing `PfqNotifyDialog` / `pfq-in-2-days` launch list. Keep the optional, unticked marketing box exactly as `lists.ts` defines it.)*

---

## Footer — legal block (must ship with the page)

> Learn in Curve is not an APM Accredited Training Provider. We do not sell, administer or invigilate the APM Project Fundamentals Qualification exam, and completing this mock does not lead to a qualification. All practice questions are written by us against APM's published syllabus; none are taken from any APM exam paper.
>
> APM, Association for Project Management and Project Fundamentals Qualification are trademarks of the Association for Project Management. This site is not affiliated with, endorsed by, or approved by APM.

---

## Words this page must not use

Not stylistic preference — advertising-claim exposure. Anything here needs sign-off before it goes near the site.

- "official", "accredited", "approved", "endorsed", "certified"
- "guaranteed pass", "pass first time", "pass rate" *(unless it's our own measured figure, with the sample size printed next to it)*
- "APM's questions", "real exam questions", "actual past paper"
- "everything you need to pass" *(implies a completeness guarantee we can't stand behind)*

## Meta

**Title:** Free APM PFQ Practice Exam — 60 Questions, All 59 Learning Outcomes | Learn in Curve
**Description:** A free, full-length APM PFQ mock exam. 60 questions, 60 minutes, one per syllabus learning outcome. Get a named list of the outcomes you'd drop marks on — not just a score.
