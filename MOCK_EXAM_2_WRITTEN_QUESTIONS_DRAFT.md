# Mock Exam 2 — written questions (DRAFT, pending your approval — not migrated anywhere)

Status: draft 1 of 3 new Pro mock exams. This covers only the 15 written questions (10 long-form + 5 short-form, 60 marks) per your scope decision — the 25 auto-marked MCQ/dropdown questions (30 marks) will be selected separately from the existing practice bank once this batch is approved. Exams 3 and 4 follow once you've reviewed this one — I didn't want to draft all 45 questions blind before confirming the approach is right.

## Method, so you can sanity-check it

Every question below is grounded strictly in that LO's own structured content (`key_definitions`, `core_content`, `misconceptions`, `exam_technique.golden_rules`) from `PMQ in 5 days/content/lo{N}.json` — the same rule the existing content follows, and the same one that keeps this exam-scoped rather than pulling in non-APM terminology. None of the scenarios below reuse a `worked_example` from the LO files or a scenario already used in the current mock exam's 15 questions — those are shown elsewhere in the app, so reusing them here would mean a user seeing the same question twice.

I cross-checked the format against your own APM Learner Study Pack sample papers (`LIC - PMQ in 5days/pmqstudypack/`) — genuine APM-style practice papers with real mark schemes. The pattern there, and in your current 15 written questions, is consistent: no single "correct answer," instead "1 mark per valid point, up to N, capped at the question's total marks." I've followed that exactly.

**One finding while doing this, not something I acted on:** two of your *current* live short-form questions (Q15, Q17 in `mock.json`) have a `marks` field of 2, but their `marking_guide` text says "up to 5" / "Cap 5" — the guide and the mark value don't agree. I didn't touch those; flagging it as a small existing bug worth a fix pass, separate from this new content. Every question below has its marking guide summing exactly to its stated marks.

**LO coverage choice:** the current exam's 15 written questions already test LO10, LO22, LO12, LO4, LO23, LO13, LO8, LO3, LO20, LO5 (×2), LO9, LO14, LO1, LO24. For the 10 long-form questions here, I deliberately picked the 10 LOs the current exam's *written* portion doesn't touch at all (LO2, LO6, LO7, LO11, LO15, LO16, LO17, LO18, LO19, LO21) — so across the two exams so far, written-question coverage is broadening, not repeating. The 5 short-form questions here revisit LO10, LO22, LO12, LO4, LO8 — LOs the current exam already tests as long-form — but ask about a different fact within that same LO, at short-recall depth, so it's new content, not a duplicate.

---

## Long-form (5 marks each, 50 marks total)

### L1 — LO2 (Governance Arrangements)

**Question:** You are project manager on a £3.5m core-banking API integration for a regional building society, delivered under a matrix structure — engineering and data staff are seconded from IT and are also expected to support business-as-usual work. The newly appointed sponsor, previously an operations director, has started attending your daily stand-ups and instructing developers directly, and has asked you to "just make the technical calls together" on the business case going forward.

Explain (a) two ways the sponsor's responsibilities differ from the project manager's across the business case and governance, and (b) one risk the sponsor's current behaviour creates given the matrix structure this project operates under.

**Model answer:** (a) Business case: the sponsor owns and is accountable for the business case and its benefits; the project manager consults during its development and delivers outputs to achieve the benefits once it is approved — the sponsor should not be sharing ownership of the business case with the PM. Governance: the sponsor sits on the governance board and makes decisions at gates; the project manager plans, executes and reports progress against the plan, rather than directing delivery day to day. (b) Risk: because staff report to both their functional line manager and the project manager in a matrix structure, the sponsor instructing developers directly bypasses that balance of authority and the PM's own reporting line, risking conflicting instructions, confused accountability, and weaker line-manager buy-in for future resourcing.

**Marking guide:** 1 mark per differing responsibility area correctly identified (business case, governance), up to 2. 1 mark per correct explanation of the sponsor's vs PM's role within that area, up to 2. 1 mark for a risk explicitly linked to the matrix structure's dual reporting. Cap 5.

---

### L2 — LO6 (Reviews)

**Question:** You are project manager on an eighteen-month flood-defence upgrade for a local authority, currently at the end of Phase 2 of a linear life cycle with a decision gate due next week. Separately, the sponsor wants to know when to check whether the £40m business case's flood-risk-reduction benefits actually materialised, and the authority's internal audit team has asked to run an independent check of contractor compliance next month.

Explain (a) which of the three named review types (decision gates, benefits reviews, audits) applies to each of the three situations described, and (b) one factor that would typically be reported on to support the decision at next week's gate.

**Model answer:** (a) The gate next week is a decision gate: an event-driven review at the end of a linear phase, giving the sponsor and governance board the chance to confirm the project is still on track before authorising the next phase. Checking whether flood-risk-reduction benefits materialised is a benefits review, typically held by the sponsor 6–12 months after handover to confirm the business case benefits were achieved. The audit team's compliance check is an audit: an independent assessment, carried out by personnel independent of the project, that increases stakeholder confidence that governance and processes are being followed. (b) One reporting factor: actual costs against forecast costs (or Earned Value), the factor most commonly used to demonstrate how a project is performing at a gate.

**Marking guide:** 1 mark per situation correctly matched to its review type, up to 3. 1 mark for a valid reporting factor for the gate review. 1 mark for a brief, correct justification of why that factor is relevant. Cap 5.

---

### L3 — LO7 (Assurance)

**Question:** You are project manager on a £6m data-centre migration for a national insurer. The Chief Risk Officer, who sits on the governance board, has said she will not approve the next £2m drawdown until she has independent confidence the migration's risk controls are actually working — not just what your monthly status report says.

Explain (a) two benefits an assurance activity would give the governance board in this situation, and (b) one reason you would recommend an external review rather than relying only on your internal PMO's compliance checks.

**Model answer:** (a) Two benefits: assurance gives the board an objective view of how the migration is genuinely performing, independent of the project team's own reporting, directly answering the CRO's concern; it also supports the board's decision-making on the £2m drawdown by validating the data behind the request, increasing the probability the release of funds is well-founded. (b) One reason: to ensure the assurance is genuinely independent and not influenced by the project team or by the organisation's own concerns about how the migration is perceived — the CRO has specifically asked for confidence beyond internal reporting, and an external reviewer with no stake in the project can supply that independence.

**Marking guide:** 1 mark per distinct benefit of assurance to the board, up to 2. 1 mark per benefit explicitly linked to confidence or decision-support (not simply repeated), up to 2. 1 mark for a valid reason favouring external over internal-only review. Cap 5.

---

### L4 — LO11 (Conflict Resolution)

**Question:** You are project manager on a merger integration between two regional airlines. The Head of Flight Operations (protecting established safety procedures, resistant to change) and the newly hired Head of Customer Experience (pushing for a fast rebrand to capture market share) have clashed in three consecutive steering meetings, and the steering group chair has asked you to resolve it before the next meeting in one week.

Using the Thomas Kilmann model, explain (a) which conflict mode best describes each Head's current behaviour, (b) which mode you would aim to steer the conflict towards and why, and (c) one practical action you would take given the one-week deadline.

**Model answer:** (a) The Head of Flight Operations is showing Avoid or Compete behaviour (low or high assertiveness, low cooperativeness), resisting change without engaging with the rebrand's rationale. The Head of Customer Experience is showing Compete (high assertiveness, low cooperativeness), pushing their position without accommodating safety concerns. (b) Ideally Collaborate, since both goals — protecting safety standards and capturing market share — are legitimate and the relationship between the two roles needs to last well beyond this merger; but with only one week available, Compromise is the realistic fallback if a fully collaborative solution can't be reached in time. (c) Facilitate a joint session where each Head states their underlying need rather than their position (why the rebrand pace matters; what specifically about it risks safety procedures), so a middle-ground option — such as a phased rebrand that leaves safety-critical materials untouched first — can be found within the week.

**Marking guide:** 1 mark per Head's current behaviour correctly identified as a TKI mode, up to 2. 1 mark for a valid target mode named with justification. 1 mark for correctly linking the one-week deadline to mode choice (e.g. Compromise as fallback). 1 mark for one practical, time-bound facilitation action. Cap 5.

---

### L5 — LO15 (Ethics, Compliance and Professionalism)

**Question:** You are project manager on a housing-association fire-safety remediation programme. Nine months in, new government fire-safety regulation is published, tightening cladding inspection requirements. Your organisation's risk team is two people covering the whole portfolio, and your sponsor has asked how the project will respond and how you personally will keep your own knowledge current given how fast this area is changing.

Explain (a) two project processes the new regulation is likely to influence and why, and (b) how you would apply the CPD cycle to keep your own knowledge of fire-safety regulation current.

**Model answer:** (a) Risk management, because the new regulation should be logged on the risk register and its impact on scope, time and cost assessed; and quality planning, because inspection acceptance criteria and assurance arrangements need updating to reflect the tightened cladding requirements. Change control may also be triggered if remediation scope needs to expand to comply. (b) CPD cycle: Reflection on practice — recognise that fire-safety regulation knowledge needs refreshing given the pace of change; Planning — identify how to close the gap, e.g. a regulatory-update course or engaging a fire-safety specialist; Action — complete the learning, such as attending a briefing from the regulator or a professional body; Evaluation — assess what was learned and how it changes the project's approach, feeding back into future reflection.

**Marking guide:** 1 mark per project process correctly identified with a valid reason, up to 2. 1 mark per correctly named CPD cycle step applied to the scenario, up to 3 (any three of the four steps). Cap 5.

---

### L6 — LO16 (Requirements Management)

**Question:** You are project manager on a new patient-appointment booking system for an NHS trust. Fifty-five requirements have been gathered from clinicians, admin staff and patients, but the trust can only fund delivery of about two-thirds of them in this phase. The finance director wants confidence that the requirements being cut won't damage patient safety.

Explain (a) the technique you would use to prioritise the fifty-five requirements and how it works, and (b) how configuration management would help protect the agreed scope once requirements are baselined.

**Model answer:** (a) MoSCoW: classify each requirement as Must have (non-negotiable, e.g. patient-safety-critical checks), Should have (high priority but the system survives without it short-term), Could have (desirable if time and budget allow) or Won't have (explicitly out of scope this phase). Anchoring priority to patient safety and benefit value, not stakeholder pressure, directly answers the finance director's concern, since Must-haves would only be reduced as a genuine last resort. (b) Configuration management protects the baseline through five activities: Planning (defining process and responsibilities), Identification (giving each system component a unique reference), Control (ensuring changes to items and their dependencies are managed formally), Status Accounting (tracking each item's version through an audit trail), and Verification Audit (confirming delivered components conform to what was baselined) — together these stop scope drifting from the agreed, prioritised requirements.

**Marking guide:** 1 mark for correctly naming MoSCoW with a description of at least two categories. 1 mark for linking prioritisation to benefit/safety value rather than stakeholder pressure. 1 mark per configuration management activity correctly named, up to 3. Cap 5.

---

### L7 — LO17 (Solutions Development)

**Question:** You are project manager on a new self-service kiosk for a mid-sized supermarket chain. A competitor launched a similar kiosk two months ago, so the board wants speed. Thirty requirements are on the table, and the product owner wants real customer usage data before committing to the full feature set.

Explain (a) the prioritisation technique you would use for the thirty requirements, (b) which life cycle approach best fits this situation and why, and (c) what the first release should be called and what it should contain.

**Model answer:** (a) MoSCoW: classify the thirty requirements as Must, Should, Could or Won't have, anchoring priority to value delivered to the customer rather than internal pressure to match the competitor. (b) Iterative life cycle, because there is pressure for speed, requirements can evolve as real usage data comes in, and the product owner explicitly wants feedback before further investment — a linear approach would lock in the full feature set too early. (c) The first release should be a Minimum Viable Product (MVP): the smallest set of Must-have features (e.g. core payment and scan functions) needed to let real customers use the kiosk and generate feedback, before the chain invests further towards a Minimum Marketable Product with the full commercially viable feature set.

**Marking guide:** 1 mark for correctly naming MoSCoW. 1 mark for correctly recommending iterative with a valid reason. 1 mark for correctly naming MVP. 1 mark for correctly describing what MVP contains (Must-haves only, for feedback). 1 mark for correctly distinguishing MVP from MMP. Cap 5.

---

### L8 — LO18 (Quality Management)

**Question:** You are project manager on a pharmaceutical packaging-line upgrade. A batch of newly installed sealing equipment has just failed an on-site output test against the specified seal-strength requirement. The quality plan agreed sampling frequency, pass/fail criteria and supplier certificate checks at the outset. Your sponsor wants to know whether this is a one-off fault or a sign the supplier's own processes are the problem.

Explain (a) the purpose of the quality plan in this situation, (b) two elements the quality plan should have defined before this test happened, and (c) the difference between the Quality Control check that has just failed and the Quality Assurance activity that would answer the sponsor's question about the supplier's processes.

**Model answer:** (a) The quality plan sets out how quality will be verified against requirements, defining what "good" looks like so a failed test like this has a clear, pre-agreed pass/fail basis rather than a dispute after the fact. (b) Two elements: pass/fail criteria for the seal-strength test (so the failure is unambiguous), and the frequency of testing (so it's clear whether this was the first sample or a pattern). (c) Quality Control is the sealing-equipment output test itself: inspection/testing of the physical output against acceptance criteria, performed as part of the project team's work, giving a binary pass/fail — which is what has just happened. Quality Assurance would independently audit whether the supplier's own manufacturing and quality processes were actually followed, which is what would tell the sponsor whether this is an isolated fault or a wider process problem at the supplier.

**Marking guide:** 1 mark for a valid statement of the quality plan's purpose. 1 mark per quality plan element correctly identified, up to 2. 1 mark for correctly distinguishing QC as output-focused. 1 mark for correctly distinguishing QA as process-focused and independent. Cap 5.

---

### L9 — LO19 (Integrated Planning)

**Question:** You are project manager on a £4m schools broadband-upgrade programme spanning IT infrastructure, staff training and cyber-security workstreams. The programme sponsor, a local authority director, has asked for a single document the education committee can use to get confidence the programme is properly set up — but two workstream leads think this level of planning is slowing them down and the team should "just get on with it."

Explain (a) four elements you would include in the integrated project management plan and why each matters for this programme, and (b) one reason producing this plan supports the programme's success despite the workstream leads' objection.

**Model answer:** (a) Scope, including a breakdown of deliverables and acceptance criteria across the three workstreams so "done" is unambiguous for infrastructure, training and cyber-security alike; Resources, showing roles, responsibilities and reporting lines across workstreams so accountability is clear; Cost, allocating the £4m across workstreams and over time so overspend in one area is visible early; Management, covering risk, quality and change-control strategies that hold the three workstreams together as one coherent programme rather than three disconnected projects. (b) The plan acts as a single source of truth, so the education committee, the three workstream leads and delivery partners are all working from the same agreed brief — reducing the very kind of misalignment and rework that "just getting on with it" would otherwise risk.

**Marking guide:** 1 mark per PMP element correctly named with a reason relevant to the scenario, up to 4. 1 mark for a valid, scenario-linked reason the PMP supports success. Cap 5.

---

### L10 — LO21 (Resource Management)

**Question:** You are project manager on a large solar-farm construction project. A national skills shortage in electrical installation has caused several sub-contractors to over-commit their crews across multiple sites. The project sponsor has said the grid-connection deadline is fixed and cannot move, but is willing to spend more to protect it.

Explain (a) which resource optimisation technique you would apply and why, (b) two practical actions you would take, and (c) one situation in which this technique alone would not be enough to protect the deadline.

**Model answer:** (a) Resource smoothing, because the sponsor has explicitly protected the end date over cost — smoothing answers "what resources do I need to deliver the work within the fixed timescale?" rather than letting the date slip. (b) Two actions: bring in additional electrical crews or sub-contractors to reduce task durations on the critical path; and parallelise non-dependent activities (e.g. panel mounting and inverter installation) that the original schedule had running sequentially, spreading resource demand more evenly. (c) One limiting situation: if qualified electrical installers are genuinely unavailable in the labour market regardless of price — a true skills shortage, not just a cost constraint — no amount of smoothing can manufacture capacity that doesn't exist, and the project would need to explore levelling, scope reduction, or accept schedule risk against the connection window.

**Marking guide:** 1 mark for correctly naming resource smoothing with a valid reason linked to the fixed deadline. 1 mark per practical smoothing action correctly described, up to 2. 1 mark for a valid limiting scenario where smoothing is insufficient. 1 mark for correctly linking that limitation to genuine resource scarcity, not just cost. Cap 5.

---

## Short-form (2 marks each, 12 marks total)

### S1 — LO10 (Stakeholder Engagement and Communications Management)

**Question:** State two factors that can negatively affect communication on a project.

**Model answer:** Any two of: poorly defined roles and responsibilities; language or cultural misunderstandings; personality clashes; a busy or distracting environment; unstable or unreliable technology for virtual communication; misalignment between verbal and non-verbal signals; overuse of technical or business jargon; high stress or workload.

**Marking guide:** 1 mark per valid distinct negative factor, up to 2. Cap 2.

### S2 — LO22 (Budgeting and Cost Control)

**Question:** A project cost is described as "variable" and "indirect." State what each of these terms means.

**Model answer:** Variable cost: a cost that changes in proportion to the level of resource consumed or output produced (e.g. materials per unit). Indirect cost: a cost that cannot be directly attributed to a specific project output and instead relates to running the wider organisation (e.g. a share of head-office overhead).

**Marking guide:** 1 mark for a correct definition of variable cost. 1 mark for a correct definition of indirect cost. Cap 2.

### S3 — LO12 (Leadership)

**Question:** State the leadership style best suited to (a) an emergency requiring an immediate decision, and (b) an experienced, high-performing team that needs little oversight.

**Model answer:** (a) Autocratic (directive) style — the leader makes the decision with limited team input, appropriate when speed and clarity matter most. (b) Delegative (laissez-faire) style — decision-making authority is largely handed to the team, appropriate when the team is established and capable of self-direction.

**Marking guide:** 1 mark for correctly naming autocratic for the emergency. 1 mark for correctly naming delegative for the established team. Cap 2.

### S4 — LO4 (Business Case)

**Question:** State two of the six PESTLE categories, and give one example of what each covers.

**Model answer:** Any two of: Political (e.g. government stance, internal politics); Economic (e.g. market conditions, funding climate); Sociological (e.g. societal trends, demographics); Technological (e.g. emerging technology, obsolescence risk); Legal (e.g. employment law, regulatory compliance); Environmental (e.g. sustainability obligations, environmental impact).

**Marking guide:** 1 mark per correctly named PESTLE category with a valid example, up to 2. Cap 2.

### S5 — LO8 (Transition Management)

**Question:** A new system has just gone live. State the four stages of progressive implementation a user typically moves through as they adopt it.

**Model answer:** Launch (what's this?), Experimentation (I tried it once), Practising (I sometimes use it), Embedded (it's how we do things here).

**Marking guide:** 1 mark for naming at least two of the four stages correctly. 1 mark for naming all four stages correctly, roughly in order. Cap 2.

### S6 — LO23 (Risk and Issue Management)

**Question:** State two of the four typical proactive responses to a risk that is a threat.

**Model answer:** Any two of: Avoid (eliminate the threat or its impact entirely, e.g. changing approach to remove the risk); Reduce/Mitigate (take action to lower the probability or impact); Transfer (pass the financial or other consequence to a third party, e.g. via insurance or contract); Accept (take no action, but retain contingency to manage the impact if it occurs).

**Marking guide:** 1 mark per valid, distinct threat response correctly named, up to 2. Cap 2.

---

## What I need from you

Does this hit the bar — depth, tone, difficulty, and the mark-scheme style? Specifically worth checking: whether the scenario industries feel varied enough (I used building society, local authority, insurer, airline merger, housing association, NHS trust, supermarket, pharma, schools programme, solar farm), whether 5-mark long-form questions with 2–3 sub-parts match what you'd expect a real PMQ exam question to look like, and whether the marking-guide granularity (1 mark per point, capped) is right or you want it tighter/looser.

Once you confirm this batch, I'll use the exact same method for Exams 3 and 4 — different LO combinations again, so all three new exams plus the current one give broad, non-repeating syllabus coverage across the full four-exam set. I have not touched `mock.json`, Supabase, or any code — this file is the only thing that exists so far.
