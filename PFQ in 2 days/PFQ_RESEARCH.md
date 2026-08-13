# PFQ in 2 Days — Deep Research & Product Thesis

**Date:** 13 August 2026
**Author:** Claude (research pass, LIC)
**Primary sources:** APM PFQ Qualification Handbook `APM-QS-PFQ-8 V5` (April 2026, attached), APM published PFQ Sample Exam Paper `APM-QS-PFQ-6 V.2` (© 2022), APM website (fetched 13 Aug 2026), competitor sites (fetched 13 Aug 2026), Learn in Curve production Supabase (`learn-in-curve`, queried 13 Aug 2026).

**Evidence rule for this document:** every factual claim is either (a) quoted/derived from a primary source and cited, or (b) explicitly labelled as an inference or as unverified in §11. No numbers are estimated silently.

---

## 1. The headline finding

**The PFQ exam is fully enumerable, and nobody in the market is selling it that way.**

Three facts from the handbook, which only become interesting when you put them together:

1. The syllabus contains **10 learning objectives broken into 59 learning outcomes** (counted directly from Handbook §11d: 6 + 4 + 1 + 11 + 8 + 6 + 8 + 6 + 5 + 4 = 59).
2. "**All the learning objectives and learning outcomes in the syllabus... will be assessed in your exam with one learning outcome assessed twice**" (Handbook §12c).
3. The exam is **60 questions, 1 mark each, pass mark 36/60 (60%)** (Handbook §2, §12a, §14a).

59 outcomes + 1 doubled = 60 questions. **The exam is a one-question-per-learning-outcome map of a published syllabus.** There is no sampling, no topic weighting to guess at, no "this year risk was heavy." Every sitting covers every outcome exactly once.

I verified this empirically rather than taking the handbook's word for it: I mapped all 60 questions in APM's published sample paper to individual learning outcomes. It resolves perfectly — 59 outcomes covered once each, with **LO 10.4 (team development models) appearing twice** (Q34 Belbin, Q48 Tuckman). Full mapping in §4.3.

**Why this is the product:** a PFQ learner's real question is not "have I studied enough?" — it's "is there anything left that could show up?" For this exam, uniquely, that question has a finite, provable answer. A course that renders the 59 outcomes as a coverage state machine — *you can currently answer 47 of 59; here are the 12 that would cost you marks today* — is a categorically different product from "15 study areas" (which is what APM's own study guide sells) or "5 practice exams" (which is what Udemy sells). This is the out-of-the-box angle, and it is defensible because it is *true of the PFQ and not true of the PMQ*.

---

## 2. What the PFQ actually is — verified facts

All from Handbook §2 unless noted.

| Attribute | Fact |
|---|---|
| Full name | APM Project Fundamentals Qualification (PFQ) |
| Level | SCQF Level 6 = RQF Level 3 = EQF Level 4 (§5) |
| Prior experience | None required |
| Total Qualification Time | ~25 hours |
| Guided Learning Hours | ~15 hours (+ ~9 hours directed development on a taught course, §9) |
| Exam length | 60 minutes |
| Format | 60 multiple-choice questions, 4 options, exactly one correct, 1 mark each |
| Pass mark | 60% — **36/60** (§14a) |
| Negative marking | None. Unanswered = 0 marks. APM explicitly advises guessing (§13a) |
| Delivery | Online, **Surpass** platform; remote-invigilated or classroom (§12a) |
| Availability | 24/7, all year round (§8) |
| Result | Immediate provisional score on submit; email + PDF certificate + Credly digital badge within 2 weeks (§14a) |
| Resits | Unlimited, any time, at reduced fee (§14c) |
| Language | English only; IELTS 6.0 / CEFR B2 recommended minimum (§12b) |
| Structure | Based on the APM Body of Knowledge; referenced to the 4 areas of the APM Competence Framework (§11a) |

**Cost to the candidate (APM open online exam, fetched 13 Aug 2026):** £260.40 member / **£278.40 non-member** / £207.60 resit, inc. VAT. Via an Accredited Training Provider the exam element is **£197 per delegate as of Apr-26** (Wellingtone, who bundle it into course fees).

**Two legitimate routes** (§7a): study with an APM Accredited Training Provider, or **self-study + open online exam** ("exam-only route"). APM names the self-study route as suitable for people who want to self-study, re-takers, international candidates, and those with existing PM knowledge. **This route is the entire addressable market for a product like ours** — we cannot sell the exam, and we are not an ATP.

---

## 3. The syllabus, decoded

### 3.1 The 10 learning objectives and their weights

Weight = number of learning outcomes = number of exam questions. This *is* the exam blueprint.

| # | Learning objective | Outcomes | Marks | % of exam | Marks needed context |
|---|---|---|---|---|---|
| 4 | Project management planning | 11 | 11 | 18.3% | Largest single block |
| 5 | Project scope management | 8 | 8 | 13.3% | |
| 7 | Project risk and issue management | 8 | 8 | 13.3% | |
| 1 | Project management and the operating environment | 6 | 6 | 10.0% | |
| 6 | Resource, scheduling and optimisation | 6 | 6 | 10.0% | |
| 8 | Quality | 6 | 6 | 10.0% | |
| 9 | Communication | 5 | 5 | 8.3% | |
| 2 | Project life cycles | 4 | 4 | 6.7% | |
| 10 | Leadership and teamwork | 4 | 5* | 8.3% | *10.4 doubled in sample paper |
| 3 | Roles and responsibilities | 1 | 1 | 1.7% | Single outcome, single mark |
| | **Total** | **59** | **60** | **100%** | Pass = 36 |

Two immediately actionable observations:

- **LO4 + LO5 + LO7 = 27 marks (45%).** Planning, scope and risk/issue are three-quarters of a pass on their own. Any "2 day" structure that treats the ten objectives as ten equal chunks is misallocating study time by a factor of eleven at the extremes (LO4 = 11 marks; LO3 = 1 mark).
- **LO3 is a single outcome ("Outline project management roles and responsibilities") but that outcome enumerates seven roles** — sponsor, project manager, governance, team members, end users, product owner, PMO. One mark, seven definitions. It is the worst effort-to-mark ratio in the syllabus and should be taught as such, honestly, rather than padded out to look like a proper module.

### 3.2 The cognitive demand is mostly recall — and that is measurable

Every learning outcome opens with a command verb. Counted across all 59:

| Verb | Count | % | What it means for question design |
|---|---|---|---|
| Define | 18 | 30.5% | Verbatim-ish definition recall |
| Outline | 18 | 30.5% | List the stages/contents/options |
| State | 11 | 18.6% | Recall a purpose or a fixed list |
| Explain | 7 | 11.9% | Cause and effect, "why" |
| Describe | 3 | 5.1% | How something is used |
| Differentiate | 2 | 3.4% | A-vs-B discrimination |

**29 of 59 outcomes (49%) are Define or State — pure vocabulary recall.** Another 18 are Outline, which in practice means "know the members of a named list" (the stages of change control; the activities of configuration management; the phases of a life cycle). Only 12 of 59 outcomes (20%) ask for reasoning at all.

This is the single most important design input for the product. **The PFQ is a vocabulary and list-recall exam wearing a project management costume.** The right core mechanic is therefore spaced-repetition over ~59 definitions and ~18 named lists — not lecture video, not scenario walkthroughs, not case studies. Anything that reads like PMQ pedagogy is over-engineering for this exam.

### 3.3 The named lists a candidate must be able to recite

Extracted from the syllabus where "(including...)" appears — the handbook states explicitly that bracketed "including" content **is examinable** (§11a):

- **Roles** (3.1): project sponsor, project manager, project governance, project team members, end users, product owner, PMO
- **Estimating methods** (4.8): analytical, analogous, parametric
- **Configuration management activities** (5.8): planning, identification, control, status accounting, verification audit
- **Resource optimisation options** (6.5): resource levelling, resource smoothing
- **Risk management stages** (7.3): identification, analysis, response, closure
- **Communication methods** (9.2, 9.3): face to face, physical, virtual — *advantages and disadvantages are separate outcomes, i.e. 2 marks*
- **Team development models** (10.4): Belbin, Tuckman — *the outcome most likely to be the doubled one*

Plus lists named in outcome text without "including": phases of linear / iterative / hybrid / extended life cycles (LO2), stages of a change control process (5.7), stages of an issue resolution process (7.8), purposes of decision gates / post-project reviews / benefit reviews / project audits (8.6), contents of a communication plan (9.4), breakdown structures PBS/WBS/CBS/OBS/RAM (5.3, 5.4).

---

## 4. What the exam actually looks like

### 4.1 Question construction (Handbook §12d)

- Short stem, **four options, one correct**, standalone (no question depends on another).
- Three named presentation styles: a query ("Which of the following…?"), a statement completion ("Project management can be defined as…."), and a fill-the-missing-word.
- A fourth style is shown in the handbook's own worked example and is heavily used in the sample paper: the **numbered-list multi-select** — four numbered items, options are combinations ("1, 2 and 4").
- Papers are generated by "a set of commands which specifies the number of questions to be selected from each learning outcome. The commands also control the overall difficulty of each exam" (§12e). Confirms the fixed-blueprint model *and* that difficulty is deliberately balanced sitting-to-sitting.

### 4.2 Traps, counted from the published sample paper

- **Negatively-worded stems: 5 of 60 (8.3%)** — Q1 "is *not* a stage", Q11 "would *not* help", Q21 "is *false*", Q37 "is *not* a key element", Q45 "is *not* an output". Under a 60-second-per-question clock this is the highest-frequency avoidable error in the paper, and no competitor product I found teaches it explicitly.
- **Numbered-list multi-select: 6 of 60 (10%)** — Q2, Q6, Q33, Q42, Q43, Q60. These are effectively four true/false judgments for one mark; partial knowledge scores zero.
- **Near-miss definition distractors:** the dominant failure mode. Q39/Q41 (risk vs issue) use each other's definitions as distractors; Q22 offers four plausible "starting point for X" phrasings for *deployment baseline*. Discrimination between adjacent APM terms — not comprehension — is what is being tested.
- **Pacing:** APM's own advice is 1 minute per question including reading (§13a). The exam UI supports flagging and a review panel filterable by Unattempted / Attempted / Flagged (§13c).

### 4.3 Verification: sample paper → learning outcome map

I mapped every sample question to a syllabus outcome. This is the evidence for §1.

| Q | LO | Q | LO | Q | LO | Q | LO |
|---|---|---|---|---|---|---|---|
| 1 | 7.8 | 16 | 6.5 | 31 | 5.2 | 46 | 5.4 |
| 2 | 10.3 | 17 | 8.2 | 32 | 7.7 | 47 | 2.1 |
| 3 | 5.7 | 18 | 7.6 | 33 | 9.1 | 48 | **10.4** |
| 4 | 8.5 | 19 | 5.3 | 34 | **10.4** | 49 | 1.3 |
| 5 | 1.6 | 20 | 4.7 | 35 | 2.4 | 50 | 8.1 |
| 6 | 2.2 | 21 | 6.1 | 36 | 8.3 | 51 | 8.4 |
| 7 | 3.1 | 22 | 4.1 | 37 | 5.1 | 52 | 8.6 |
| 8 | 9.4 | 23 | 5.8 | 38 | 4.2 | 53 | 4.10 |
| 9 | 4.5 | 24 | 4.6 | 39 | 7.1 | 54 | 7.2 |
| 10 | 1.5 | 25 | 1.1 | 40 | 4.3 | 55 | 7.3 |
| 11 | 10.2 | 26 | 4.4 | 41 | 7.5 | 56 | 5.6 |
| 12 | 1.2 | 27 | 9.3 | 42 | 10.1 | 57 | 7.4 |
| 13 | 4.11 | 28 | 9.5 | 43 | 4.8 | 58 | 5.5 |
| 14 | 4.9 | 29 | 2.3 | 44 | 6.6 | 59 | 6.3 |
| 15 | 9.2 | 30 | 1.4 | 45 | 6.2 | 60 | 6.4 |

Every one of the 59 outcomes appears exactly once except 10.4, which appears twice. This is a clean confirmation of Handbook §12c against an independent published artefact, and it means **our question bank can be architected as 59 numbered slots, not as an undifferentiated pool.**

---

## 5. The market: who sells what, at what price

All prices fetched 13 Aug 2026, inc. VAT unless stated.

| Provider | Product | Price | Exam included? | Format |
|---|---|---|---|---|
| **APM** | Open online exam (exam only) | **£278.40** non-member / £260.40 member / £207.60 resit | Yes (it *is* the exam) | Self-study, Surpass |
| APM | PFQ Study Guide | £25 paperback / £20 digital | No | Book. 15 study areas, 200+ quiz questions |
| APM | PFQ Study Pack (8th ed.) | £72 | No | Study Guide + BoK 8 |
| Career Smarter (via ITonlinelearning, an ATP) | PFQ online course | **£295** (from £449) | **No** — "add at checkout" | Self-paced e-learning, ~25 hrs |
| Provek | PFQ online self-study on "PM Channel" | **£495 + VAT (£594)** | **Yes** | E-learning + printed book + **AI coach** + expert support |
| Wellingtone | 2-day (public sittings run 3 days) taught course | Not published on page | Yes (£197 exam element) | Classroom / remote-live, trainer-invigilated |
| Udemy (various) | PFQ practice-test bundles | Typically low-£ promo pricing | No | 250–500 MCQs, no teaching |
| "Dumps" sites (Testpassport, dumpsplanet, StackBlitz collections) | Leaked/scraped question sets | Various | No | **Exam-integrity violation** — see §9 |

**Real all-in cost to a self-funding candidate today: £278 (exam) + £0–£295 (prep) = £278–£573.**

### 5.1 Who actually pays

Three distinct buyers, and this materially changes the product:

1. **Employer-funded apprentices.** The PFQ is commonly taken inside the **Level 4 Associate Project Manager apprenticeship**, typically in the first months of a 15-month programme (TESS Group). The apprentice does not choose or buy the training.
2. **ELCAS-funded service leavers.** MoD Enhanced Learning Credits fund the PFQ through approved providers; Wellingtone runs a dedicated "Project Management for Service Leavers with APM PFQ" course. Again — funder chooses, learner doesn't pay.
3. **Self-funders on the open-exam route.** Career changers, people whose employer will pay the £278 exam but not a £600 course, international candidates, and **re-takers** (APM names re-takers first in its own list of who the self-study route suits, §7a).

**Segment 3 is our only realistic market**, and inside it the sharpest sub-segment is **re-takers and exam-imminent candidates** — people who have already spent £278, already failed or are about to sit, and for whom £10 to remove the risk of a £207.60 resit is a trivially rational purchase. That is a much cleaner value proposition than "learn project management."

### 5.2 Where the incumbents are weak — evidenced, not asserted

1. **APM's own sample paper is stale and misleading about the exam.** The only free official practice artefact is `APM-QS-PFQ-6 V.2`, © 2022, and it is a **paper-based** instrument: "The pro-forma answer sheet must be completed using a **HB pencil**", "Do not open this paper until instructed by the invigilator." The actual exam is online in Surpass with flagging, a filterable review panel and a live progress chart (§13c). **Every candidate's only free rehearsal is of an interface that no longer exists.** A faithful Surpass-alike simulator is an immediate, demonstrable gap.
2. **Nobody sells against the 59-outcome structure.** APM's own guide organises around "15 study areas". Udemy sells undifferentiated 500-question pools. Coverage against the actual assessed unit — the learning outcome — is not on the market.
3. **Price/value gap is wide.** Provek at £594 and Career Smarter at £295 (+ exam) are pricing taught-course economics into a 25-hour qualification. There is a lot of room underneath.
4. **The AI angle is already contested — take it seriously.** Provek bundles an "AI coach... exam practice tests and intuitive feedback" at £495+VAT. We are not first to "AI + PFQ". We can still be first to *good* — but "we have an AI tutor" is no longer a differentiator on its own. (This is why §1's coverage-map thesis, not the tutor, is the wedge.)
5. **Dumps sites are ranking on PFQ keywords.** Multiple appeared on page 1 for practice-question queries. A legitimate, free, high-quality practice exam has an unusually weak field to outrank.

---

## 6. What "better than PMQ in 5 Days" concretely means

PMQ in 5 Days' constraints came from the PMQ: 2.5 hours, 40 questions/90 marks, mixed format with written long-response answers, 55% pass mark, assessed against the Competence Framework. Almost none of that transfers. Building PFQ as "PMQ but shorter" would import the wrong pedagogy.

Six things this product can do that PMQ in 5 Days structurally cannot:

1. **Provable completeness.** 59 outcomes, tracked individually, with a visible "you are 47/59 exam-ready" state. The PMQ cannot do this — its assessment is sampled and written. This is the headline feature and it should be the landing page.
2. **A genuinely faithful exam simulator.** 60 questions, 60 minutes, four options, flag/review/unattempted filter, one-minute pacing coach, immediate provisional score — mirroring §13c behaviour exactly. Cheap to build (MCQ only), high perceived value, and directly fills the gap left by APM's pencil-and-paper PDF.
3. **A definitions engine, not a course.** 29 recall outcomes + 18 list outcomes = the whole exam is flashcard-shaped. Spaced repetition keyed to the 59 outcomes, with distractors built from *adjacent APM terms* (risk vs issue; quality assurance vs quality control vs quality planning; levelling vs smoothing; PBS vs WBS vs CBS vs OBS vs RAM). This is exactly the discrimination the real paper tests (§4.2).
4. **Trap training as a first-class module.** Negative stems (8.3% of marks) and multi-select combination questions (10%) — nearly a fifth of the paper is format risk, not knowledge risk. Nobody teaches this. It is 20 minutes of content that moves the score.
5. **Honest weighting.** Tell the learner LO4 is 11 marks and LO3 is 1 mark, and let them allocate. Every competitor presents a flat module list. This costs nothing and instantly reads as insider knowledge.
6. **A real 2-day plan that matches published reality.** APM's own TQT is ~25 hours and ATP courses run 2 days (Wellingtone). "PFQ in 2 Days" is therefore *consistent with the accredited market norm*, not a stretch claim — unlike "PMQ in 5 Days", which compresses a 40+ hour qualification. This is a materially safer advertising position (see §9).

---

## 7. Proposed content architecture

Structured to the exam blueprint, not to the textbook.

**Day 1 — the 45% block plus vocabulary spine (27 marks)**
- Session 1: LO1 Environment + LO2 Life cycles (10 marks). Front-loaded because everything else references life cycles.
- Session 2: LO4 Planning (11 marks) — business case, baselines, estimating funnel, stakeholder analysis, success criteria, progress reporting.
- Session 3: LO5 Scope (8 marks) — breakdown structures, change control, configuration management. The two process-stage lists (5.7, 5.8) are the highest-value rote items in the syllabus.
- Session 4: LO7 Risk & issues (8 marks) — with explicit risk-vs-issue discrimination drilling.

**Day 2 — the remaining 33 marks plus exam mechanics**
- Session 5: LO6 Scheduling & resources (6) + LO8 Quality (6).
- Session 6: LO9 Communication (5) + LO10 Leadership & teamwork (5) + LO3 Roles (1) — flagged honestly as a 1-mark outcome that costs 7 definitions.
- Session 7: **Trap school** — negative stems, multi-select combinations, near-miss distractors, guessing policy (no negative marking, §13a), pacing.
- Session 8: **Full 60-question timed mock in the simulator**, scored per learning outcome, producing a gap list of named outcomes rather than a percentage.

**The artefact that ties it together:** a single "59 Outcomes" wall — every outcome as a chip, coloured by mastery state, filterable by learning objective. It is the product's memorable object, its progress system, and its revision tool at once.

---

## 8. Reuse from the existing platform

From the repo audit (`src/`, `learn-in-curve` Supabase):

**Reusable as-is:** auth and account flow; `section_progress` model (with the known two-completion-signal gotcha — timestamps *and* `checklist_state`); the waitlist/consent registry in `src/lib/notify/lists.ts` (already has `pfq-in-2-days` as a live launch list); the confirmation-email pipeline via Resend; Sly the AI tutor (must be re-grounded on the PFQ syllabus, not the PMQ one); gamification/streaks; PostHog consent-gated analytics; the tier/entitlement split in `tiers.ts`.

**Must be rebuilt, not ported:** the question model. The PMQ bank carries `scenario_mcq` and `dropdown` types and a 90-mark written component; PFQ needs only single-answer 4-option MCQ plus the numbered-list multi-select variant, and every question must carry a **`learning_outcome` foreign key** (e.g. `4.10`) — that field is the entire product. Retrofitting it later would be painful; it should exist in the first migration.

**Must not be ported:** the PMQ exam-session/`exam_set` machinery as-is. PFQ mocks are a fixed 60-slot template drawn one-per-outcome, which is a simpler and different generator.

---

## 9. Legal and compliance flags

*Informal, educational guidance — not legal advice, and not a substitute for a solicitor. Items marked **(solicitor)** should be reviewed before any paid launch.*

1. **Do not reproduce APM's sample-paper questions.** The paper is © 2022 Association for Project Management, and the handbook's exam regulations prohibit copying or reproducing exam questions "anywhere or in any way" (§13d). Our 60 questions must be independently authored against the *syllabus* (which is factual scope, not protected expression). Using the sample paper as a *style and difficulty reference* is fine; lifting stems or distractors is not. This is the single highest-risk content decision in the build.
2. **Stay away from dumps.** Several sites ranking for PFQ practice questions are distributing scraped live-exam content. Any proximity to that material — including "inspired by" question sets bought from third parties — risks both copyright infringement and being seen by APM as facilitating exam malpractice. Question provenance should be documented per item.
3. **Trademark.** "APM" and "Association for Project Management" are APM's marks; PFQ is its qualification name. Nominative use ("a course to prepare you for the APM Project Fundamentals Qualification") is normally permissible, but the site must not imply accreditation or endorsement. Career Smarter — who *are* fronting an actual ATP — still carry an explicit IP acknowledgement in their footer; we should carry a stronger one, plus a clear "not an APM Accredited Training Provider; we do not sell or administer the exam" statement. **(solicitor)**
4. **Advertising claims (CAP Code).** "PFQ in 2 Days" is defensible — APM's own TQT is ~25 hours and accredited providers deliver in 2 days. **Do not** claim or imply a guaranteed pass, a pass rate we cannot evidence, or "official"/"accredited" status. Any pass-rate statistic must be our own measured data with the sample size shown.
5. **UK GDPR / PECR.** Already handled well in `lists.ts` (separate launch vs marketing consent, no pre-ticked boxes) — carry that model over unchanged. PostHog must stay consent-gated.
6. **Consumer rights.** If sold as digital content, the 14-day cancellation right and the express-consent-to-immediate-supply waiver need to be in the T&Cs before money changes hands. **(solicitor)**
7. **Accessibility.** APM commits to reasonable adjustments (§10b). A product whose whole promise is "you'll be ready" should meet WCAG 2.1 AA — and it is also the lowest-friction way to serve candidates who get extra time in the real exam.

---

## 10. The honest strategic counter-argument

This has to be in the document, because two prior strategy passes in this repo concluded the opposite of what building this implies.

`ACQUISITION_PLAN_AUG_2026.md` (8 Aug) explicitly lists "Building PFQ in 2 Days as a second product" under what *not* to do: *"24 sign-ups is a distribution problem, and a second product doubles your maintenance surface while solving none of it. A free PFQ practice test as a lead magnet is fine. A second course is not."* `PMP_COURSE_DECISION.md` reaches the same conclusion.

Production data as of 13 Aug 2026 (queried directly, `learn-in-curve`):

- **24 total accounts**, 23 created in the last 30 days, most recent 12 Aug — so acquisition is live and running at roughly one signup/day.
- **16 users with any section progress**, 87 progress rows total.
- **7 exam sessions across 4 distinct users.**
- Waitlists: `pmq-in-5-days-ai-pro` = **3**, `pfq-in-2-days` = **1**, `newsletter` = **1**.

Read plainly: the PFQ course card has been live on the courses page with a working notify dialog and has produced **one** signup — a third of the interest the AI Pro bundle drew from the same traffic. That is not evidence of demand for PFQ. It is also not evidence of absence — n is far too small for either conclusion, and a "(coming soon)" card is a weak demand instrument.

**The reconciliation that respects both the research and the prior advice:** the highest-value artefact identified in this document — the **59-outcome coverage map plus a faithful 60-question Surpass-alike mock** — is *exactly* the free lead magnet both prior docs recommended. It is not a second course. It is one page, one question bank, no new content universe, and it feeds PMQ (the natural progression: APM itself positions PMQ as the next step, Handbook §15). If it draws traffic and email signups, the full 2-day course becomes an evidenced decision rather than a bet. If it doesn't, we have spent a fortnight, not a quarter.

**Recommendation: build the free PFQ mock + outcome coverage map first. Treat the full course as gated on its results.**

---

## 11. What I could not verify

Stated explicitly so this document isn't read as more certain than it is.

- **PFQ candidate volumes.** APM does not publish exam volumes; I could not locate them in APM's annual report or Charity Commission filings. The size of the addressable market is therefore *unknown*, not estimated.
- **PFQ pass rates.** No official figure exists publicly. Third-party blogs cite "70–80% across APM qualifications" with no source; I would not repeat that number anywhere public.
- **Search volume for PFQ terms.** Ahrefs is available in the plugin set but not authorised in this session. Keyword demand is unmeasured — worth doing before any SEO-led plan.
- **BoK edition status is genuinely ambiguous right now, and APM's own site contradicts itself.** The open-exams page states the PFQ exam is "*aligned to APM Body of Knowledge 7th edition*"; the PFQ product page says the syllabus "covers knowledge areas from the *APM Body of Knowledge 8th edition*"; the Handbook (V5, Apr 2026) maps every outcome to **both** editions; and APM's bookshop now sells a **PFQ Study Pack (8th edition)** with the Study Guide's terminology "aligned to the *APM Body of Knowledge 8th edition*". Training ByteSize (15 Jun 2026) reports the PFQ stayed on BoK 7 at BoK 8's launch, with APM updating it "as part of a wider qualification review". **Practical implication:** the *syllabus outcomes* are stable and are what we build to; where 7th and 8th edition terminology differs, teach the term and note the variant. Worth a direct email to `qualifications@apm.org.uk` to pin down, since a syllabus revision mid-build is the main content risk.
- **The doubled learning outcome is not fixed.** 10.4 is doubled in the 2022 sample paper; the handbook says only that *one* outcome is doubled, not which. Do not build logic that assumes 10.4.
- **Wellingtone's course price** is not published on their page (enquiry-gated), so the taught-course price band is represented by the providers who do publish.

---

## 12. Recommended next actions

1. **Decide the scope question in §10** — free mock + coverage map, or full course. Everything else follows from this.
2. **Email APM qualifications** to confirm BoK edition alignment and whether a syllabus revision is scheduled. One email, removes the biggest content risk.
3. **Author 59 original questions**, one per learning outcome, plus a 60th for a doubled outcome — with `learning_outcome` as a first-class field in the schema from migration one. Style-match the sample paper; copy nothing from it.
4. **Build the Surpass-alike simulator shell** — flag, review panel with Unattempted/Attempted/Flagged filters, progress chart, 60:00 timer, provisional score on submit.
5. **Ship the coverage map as the landing page**, not as an internal feature.
6. **Log all of the above to Linear (LIC)** as self-contained issues per the repo's standing workflow, and fill in `PFQ in 2 days/brainstorming.md`'s decision log with whatever Sim decides on point 1.

---

## Sources

- APM Project Fundamentals Qualification Handbook, `APM-QS-PFQ-8 V5`, April 2026 (attached PDF) — [APM handbook page](https://www.apm.org.uk/media/kcjbezhz/apm-project-fundamentals-qualification-handbook.pdf)
- [APM PFQ Sample Exam Paper, `APM-QS-PFQ-6 V.2`, © 2022](https://www.apm.org.uk/media/dealgn2n/project-fundamentals-qualification-sample-exam-paper.pdf)
- [APM — Project Fundamentals Qualification (PFQ) product page](https://www.apm.org.uk/qualifications-and-training/project-management-fundamentals/)
- [APM — Open online examinations (pricing)](https://www.apm.org.uk/qualifications-and-training/qualifications-find-out-more/open-exams/)
- [APM — PFQ Study Guide (bookshop)](https://www.apm.org.uk/book-shop/apm-project-fundamentals-qualification-pfq-study-guide/)
- [APM — PFQ Study Pack, 8th edition (bookshop)](https://www.apm.org.uk/book-shop/apm-project-fundamentals-qualification-pfq-study-pack-8th-edition/)
- [APM — Project management apprenticeships](https://www.apm.org.uk/qualifications-and-training/apprenticeships/)
- [Wellingtone — 2-Day APM PFQ course (exam fee £197 as of Apr-26)](https://wellingtone.co.uk/training/apm-qualifications/apm-project-fundamentals-qualification/)
- [Career Smarter — APM courses (PFQ £295, exam not included)](https://www.careersmarter.com/courses/apm-courses/)
- [Provek — APM PFQ online self-study with AI coach (£495 + VAT)](https://www.provek.co.uk/training/apm-pfq-online/)
- [Training ByteSize — APM Body of Knowledge 7th vs 8th edition (15 Jun 2026)](https://www.trainingbytesize.com/blog/apm-body-of-knowledge-8th-edition-changes/)
- [TESS Group — Associate Project Manager Level 4 apprenticeship (PFQ in first months)](https://tessgroup.co.uk/programmes/associate-project-manager-l4)
- [20|20 Project Management — ELCAS-approved APM courses](https://2020projectmanagement.com/knowledge-hub/20-20-is-an-approved-provider-for-elcas)
- Learn in Curve production database (`learn-in-curve`, Supabase), queried 13 Aug 2026 — user, progress, exam-session and waitlist counts.
