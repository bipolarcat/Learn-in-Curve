# PFQ in 2 Days, course overview page copy

**Version 1, 14 September 2026.**
**Target file:** `src/app/courses/pfq-in-2-days/page.tsx` (branch `wip-2026-08-19`)
**Register:** Enthusiast, per `VOICE_GUIDE.md` §0. Answer first, no warm-up, no "just", one "however" pivot on the page.
**Style constraint:** no em dashes or en dashes anywhere, in this document or in the copy. Commas, colons, full stops and parentheses only.
**Sibling document:** `PMQ_OVERVIEW_PAGE_COPY.md`. This page follows the same shape so the two course pages read as one product.

---

## 0. What changed vs the current live-ish page

1. **Trap School is removed** from every section, chip, plan card and CTA on this page.
2. The page gains three sections it does not have: an exam facts strip, a syllabus map, and a mid-page "try it" band.
3. Plan detail stays off this page. This page sells the course, `/pricing` sells the plans.

---

## 1. Rules this copy follows

**Question counts are stated once and qualified once.** The bank is 565 practice questions plus 180 mock questions across three papers. Free gets 50 of them (5 per objective). An unqualified "565 practice questions" sitting next to an "Enrol for Free" button reads as a free-tier promise, which is a misleading omission under the CPRs. One qualifying line under the feature grid solves it without a plan table.

**No official-material implication.** Learn in Curve is not an APM accredited provider. The page may say the course is aimed at the published PFQ syllabus. It may not say it contains APM material, and the objective titles used on this page are study labels, not APM's copyright wording (see the note in `src/lib/pfq/outcomes.ts`).

**No pass claims, no learner count.** `VOICE_GUIDE.md` §5 rules out pass-rate language, and there is no outcome data for PFQ.

**Nothing on this page may promise a purchase while `PFQ_CHECKOUT_ENABLED` is false.** "See pricing" is a safe CTA. "Buy Pro" is not, until checkout is live.

---

## 2. Hero

**Eyebrow**

> APM Project Fundamentals Qualification

**Title**

> PFQ in **2 Days**

**Lead, recommended**

> The PFQ is a definitions exam. Sixty multiple-choice questions in an hour, testing whether you know the vocabulary and the standard structures, not whether you can run a project. This course is built to match that: short lessons across all ten learning objectives, practice questions that tell you why the other option was wrong, and full mock papers in the real format.

**Alternatives**

| | Lead | Tone | Best for |
|---|---|---|---|
| A (recommended) | *The PFQ is a definitions exam. Sixty multiple-choice questions in an hour, testing whether you know the vocabulary and the standard structures, not whether you can run a project. This course is built to match that: short lessons across all ten learning objectives, practice questions that tell you why the other option was wrong, and full mock papers in the real format.* | Confident, informed | Visitors who have already booked the exam |
| B | *Everything on the APM PFQ syllabus, in the order you need it. Ten learning objectives, 59 learning outcomes, practice questions for each one, and three timed mock papers.* | Plain, feature-forward | Cold search and paid traffic |
| C | *Two days is enough for this exam, if you spend them on the right things. Learn the ten objectives, drill the definitions, sit a mock in the real format, and see the gaps while you can still close them.* | Sequential, calm | If A tests as too flat |

**Primary CTA:** `Enrol for Free`
**Secondary CTA:** `See Pricing`

**Trust strip under the buttons**

> Free to start. No card. All ten learning objectives.

---

## 3. Exam facts strip

New section, sits directly under the hero. Four or five stat tiles in a row, collapsing to two columns on mobile. No prose.

| Tile | Value | Label |
|---|---|---|
| 1 | 60 | questions, multiple choice |
| 2 | 1 hour | closed book |
| 3 | 36 / 60 | to pass |
| 4 | None | entry requirements |
| 5 (optional) | No | negative marking |

**Optional caption under the strip, one line**

> Sat online at home with a remote invigilator, or in a classroom with an accredited provider.

**Why this section exists.** It is the first thing every PFQ searcher wants and almost no competitor puts above the fold. It also makes the "2 Days" claim credible before the visitor has to take it on trust. Pattern reference: the Duolingo English Test overview page puts the test's format in an icon strip before it sells anything.

---

## 4. Positioning block

One heading, one paragraph, no card chrome.

**Heading**

> Two days works because of what this exam actually asks

**Body**

> Sixty questions, one hour, means about a minute a question, and most of them are asking whether you can tell two similar terms apart. Benefits from outputs. A risk from an issue. Verification from validation. However, the usual advice for the PFQ is to read a textbook cover to cover, which is the slowest possible way to learn a set of distinctions. Every lesson here is written to be read and parsed, and every practice question tells you why the option you nearly picked was the wrong one.

That "however" is the one on the page. `VOICE_GUIDE.md` §1.1 puts it at roughly one per piece.

---

## 5. What's included

Section heading:

> What's included

**Core three, as specified.**

**Ten lessons, the full syllabus** (`IconCore`)
> One lesson per learning objective, covering all 59 learning outcomes on the published PFQ syllabus. Written to be read and parsed, not padded out.

**565 practice questions** (`IconPractice`)
> Every question tagged to the outcome it tests, with an explanation of why the wrong options are wrong. Free starts you with five from each objective.

**Three timed mock papers** (`IconMock`)
> Sixty questions, one hour, marked the way the real paper is, with your score against the 36 mark pass line.

**Recommended additions, three more cards.** The grid reads thin at three, and each of these is already built.

**Coverage map** (`IconCoverage`)
> Every one of the 59 outcomes, green when you have proved it and amber when you have not. This is the page that tells you whether you are ready.

**Marks-weighted syllabus** (`IconWeight`)
> Planning is worth 11 marks. Roles and responsibilities is worth one. The course tells you which is which so you spend your two days where the marks are.

**Exam tips on the questions that catch people** (`IconTip`)
> Short notes on the pairs of terms the exam likes to swap, attached to the questions where they bite.

*(Card 6 replaces what Trap School used to do here. The underlying `tip` column on `pfq_questions` already exists and is populated, so this is a copy change, not a feature request.)*

**Underneath the grid, one line only**

> Free includes every lesson and five practice questions from each of the ten objectives. The rest of the question bank and all three mock papers are in the Pro Bundle.

That sentence carries the whole honesty burden. Do not delete it to tidy the layout.

**Tier chips.** `Pro` on the mock papers card and on the coverage map card if coverage stays Pro. Without chips the grid promises six free things and delivers three and a bit.

---

## 6. Syllabus map

New section. This is the highest-value addition on the page and the component already exists (`PfqExamGuideSections`, "Weight" tab).

**Heading**

> Ten objectives, 59 outcomes, 60 marks

**Body, one line**

> Split across two days, in the order the syllabus runs.

**Table or two-column list**

| Day | Obj | Topic | Marks |
|---|---|---|---|
| 1 | 1 | Project management and the operating environment | 6 |
| 1 | 2 | Project life cycles | 4 |
| 1 | 3 | Roles and responsibilities | 1 |
| 1 | 4 | Project management planning | 11 |
| 1 | 5 | Project scope management | 8 |
| 2 | 6 | Resource, scheduling and optimisation | 6 |
| 2 | 7 | Project risk and issue management | 8 |
| 2 | 8 | Quality | 6 |
| 2 | 9 | Communication | 5 |
| 2 | 10 | Leadership and teamwork | 4 |

**Footnote**

> Two days is the pace, not a deadline. Nothing expires and your progress saves.

Pattern reference: Webflow University's course overview pairs a short summary with a full outline and a per-item duration. A visitor who can see the whole syllabus before signing up does not meet it cold on the first screen inside, which is the same activation problem the PMQ page has.

---

## 7. Try it band

New section, sits between the syllabus map and pricing. One line, one button, full-width band.

**Heading**

> Try five questions before you sign up

**CTA:** `Try a practice set`, linking to `/courses/pfq-in-2-days/practice/sample`

Pattern reference: Duolingo drops a "Take a free practice test" band into the middle of its overview page rather than waiting for the footer CTA. The sample route already exists and is the single strongest thing this page has, and right now nothing on the page points at it.

---

## 8. Who this is for

Optional section, three lines. The PFQ has no entry requirements, so a large share of the traffic is people who are not sure the exam is for them. Answering that is worth more than another feature card.

**Heading**

> Who sits the PFQ

> People moving into project work from another role, and who need the vocabulary before anyone will hand them a project.
> PMO, coordinator and support roles where the terminology is assumed and never taught.
> Anyone planning to sit the PMQ later, using the PFQ as the stepping stone.

**Cross-sell line, one sentence**

> Sitting the PMQ instead? PMQ in 5 Days covers all 24 objectives of the harder paper. (link)

---

## 9. Pricing handoff

No plan cards on this page. One band, one line, one button.

**Heading**

> Start free. Upgrade when you want the full bank

**Body**

> The free plan is not a trial and does not expire. The Pro Bundle is a single payment with no subscription and nothing that renews.

**CTA:** `See Pricing`, linking to `PFQ_PRICING_HREF`.

---

## 10. FAQ

`PfqFaqSection` already holds six good exam questions (what the PFQ is, entry requirements, study hours, no negative marking, pass mark and results, resits). Keep all six exactly as they are. Add three product questions above them.

**Is it actually free?**
> Yes. The free plan does not expire and does not ask for a card. You get all ten lessons and five practice questions from each objective, 50 in total.

**Is this official APM material?**
> No. Learn in Curve is not affiliated with, accredited by or endorsed by APM. Everything here is written from scratch and aimed at their published syllabus.

**Do I book the exam through you?**
> No. You book the exam with APM or an accredited provider. This course prepares you for it and nothing more.

That third question is not optional. Without it, a visitor who has just read "PFQ in 2 Days" and "Enrol for Free" can reasonably form the belief that the exam itself is included. That belief is a misleading omission risk, and it is also the most likely refund request you will get.

---

## 11. Closing

**Heading**

> Find out what you cannot define yet

**CTAs:** `Enrol for Free` and `See Pricing`

**Legal:** `PFQ_ATP_DISCLAIMER`, unchanged, and it must stay visible on the page rather than being folded into the footer.

---

## 12. Verify before this ships

Five things this copy asserts that must be checked against production, not against this document.

1. **565 and 180.** Count `pfq_questions` where `mock_set is null` and where it is not, in the production database. The numbers moved twice in September.
2. **Three mock papers.** Confirm `mock_set` values '1', '2' and '3' each hold 60 rows in production.
3. **Free allowance.** `registry-data.ts` currently has `freeFeatures: []` for `pfq-in-2-days` while `constants.ts` says lesson access is always free and `free-sample.ts` gives 5 per objective. The page must state whatever entitlement actually enforces. Fix the registry or fix the copy, but do not ship them disagreeing.
4. **Checkout.** `PFQ_CHECKOUT_ENABLED` is false. If it is still false on the day this page goes live, `/pricing` needs to say so rather than presenting a dead button.
5. **Trap School removal.** This is a code change, not just a copy change. It touches `PFQ_TRAP_SCHOOL_HREF` in `constants.ts`, the `trap-school` route, `PfqTrapSchool.tsx`, `PfqTrapCallout.tsx`, `trap-school-content.ts`, `trap-tags.ts`, `trap-callout.ts`, `PfqPlanCards.tsx` and the hero string in `page.tsx`. Log it as its own ticket.

---

## 13. What the page still lacks

Same three gaps as the PMQ page, and they are still worth more than any sentence above.

**No social proof.** Not a testimonial, a count, or a review anywhere.

**No screenshots.** `PfqCoverageMap`, `PfqPracticeRunner` and `PfqMockRunner` all exist. A visitor currently cannot see the thing they are being asked to enrol in. One screenshot in section 5 or 6 would do more than this entire document.

**No named author.** "Just a fellow project manager who's been exploring AI tools" is the most trust-building sentence in the corpus and it appears nowhere on this page.
