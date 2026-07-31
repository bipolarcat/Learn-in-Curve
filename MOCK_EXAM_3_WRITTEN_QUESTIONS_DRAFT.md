# Mock Exam 3 — written questions (DRAFT, pending your approval — not migrated anywhere)

Status: draft 2 of 3 new Pro mock exams, following the same method and quality bar as `MOCK_EXAM_2_WRITTEN_QUESTIONS_DRAFT.md`. 15 written questions (10 long-form + 5 short-form, 60 marks). The 25 auto-marked MCQ/dropdown questions will be selected separately from the existing practice bank, per your scope decision. Exam 4 follows in a separate file.

## Method (same as Exam 2, repeated for reference)

Every question is grounded strictly in that LO's own structured content (`key_definitions`, `core_content`, `misconceptions`, `exam_technique.golden_rules`) from `PMQ in 5 days/content/lo{N}.json`. No scenario below reuses a `worked_example` from the LO files, a scenario from the current live mock exam's 15 questions, or a scenario from Exam 2's 15 questions. Marking guides follow the real APM convention — "1 mark per valid point, up to N, capped at the question's total marks" — and every guide below sums to exactly its stated marks.

**New finding while researching this batch, not something I acted on:** the current live mock exam's Q29 is tagged `LO9` but its actual content ("explain the importance of regularly reviewing the business case and describe four triggers for review") is LO4 content (Business Case, outcome 4b), not LO9 (Benefits Management) — LO9 is specifically about the five-step benefits management process (identification, definition, planning, tracking, realisation), which is unrelated to business case review triggers. This looks like a mistagged `lo_reference` in the existing data, separate from the marks/marking-guide bug I flagged in Exam 2's notes. I haven't touched it — flagging it for a fix pass. My own LO9 questions below (L7, and Exam 4's S3) are grounded in the real LO9 content.

**LO coverage choice:** for the 10 long-form questions, five LOs (LO1, LO3, LO13, LO20, LO23) have never been tested as long-form anywhere across the current exam or Exam 2 — using them here means every one of the 24 LOs will have at least one long-form appearance across the battery once Exam 4 is also in place. The other five (LO2, LO9, LO14, LO16, LO24) get a second long-form pass, each on a different fact/sub-outcome and a different scenario than their first appearance, so nothing is a near-duplicate. The five short-form questions (LO6, LO7, LO11, LO17, LO21) test LOs that have only appeared as long-form in Exam 2 — testing a different, narrower fact within each at short-recall depth. Across the current exam + Exam 2 + this exam, no LO has been tested as short-form more than once.

---

## Long-form (5 marks each, 50 marks total)

### L1 — LO1 (Life cycles)

**Question:** You are project manager on an ERP replacement for a mid-sized manufacturer. The finance module's requirements are fully defined by fixed accounting and regulatory rules. A separate custom analytics dashboard has requirements that are expected to evolve significantly as users see early versions and provide feedback.

Explain (a) which life cycle you would recommend overall and why, (b) two reasons a purely linear life cycle would not suit the analytics dashboard workstream, and (c) one reason a purely iterative life cycle would not suit the finance module workstream.

**Model answer:** (a) A hybrid life cycle, combining linear and iterative approaches as appropriate to the work, because the two workstreams have genuinely different characteristics — one stable and rule-driven, one evolving — and applying a single life cycle to both would be poorly matched to at least one of them. (b) Two reasons: (1) the dashboard's requirements are expected to evolve as user feedback comes in, but a linear life cycle assumes reasonably complete knowledge upfront with scope reviewed and fixed at predefined milestones; (2) linear offers less flexibility to incorporate change once a phase's outputs are reviewed, which would force the dashboard's design to be frozen before real user feedback is available. (c) One reason: the finance module's requirements are fixed by accounting and regulatory rules that are already known, so applying an iterative life cycle — suited to uncertainty and evolving scope — would introduce unnecessary duration and cost uncertainty and make the business case harder to justify for something already well understood.

**Marking guide:** 1 mark for correctly recommending hybrid. 1 mark for a valid overall reason it fits both workstreams. 1 mark per valid reason linear does not suit the dashboard, up to 2. 1 mark for a valid reason iterative does not suit the finance module. Cap 5.

---

### L2 — LO3 (Sustainability)

**Question:** You are project manager on a new data centre for a cloud provider, built in a former industrial area with high youth unemployment. The facility consumes significant energy and water for cooling. The regional council has offered planning fast-track status in exchange for local job commitments.

Explain (a) two of the four sustainability elements most relevant to this project, with one scenario-specific consideration for each, and (b) two potential impacts on the project if sustainability is not built in from concept.

**Model answer:** (a) Environmental: energy and water efficiency of the cooling systems, given the scale of resource consumption a data centre requires and its contribution to climate impact. Social: community impact and equity, given the council's job-commitment condition and the area's high youth unemployment — local employment and training access is a direct social consideration here. (Economic — affordability and exposure to energy price volatility — or Administrative — health and safety and resource-efficiency regulation for cooling systems — could also be credited if justified.) (b) Two impacts: (1) breaching environmental legislation on energy or water use could result in financial penalties, reputational damage, and could jeopardise the fast-track planning status itself; (2) failing to deliver on the local job commitments could disengage the community and the council, generating bad publicity or withdrawal of planning support, and creating social inequity if the promised opportunities are not genuinely accessible to local people.

**Marking guide:** 1 mark per sustainability element correctly identified, up to 2. 1 mark per element correctly paired with a valid scenario-linked consideration, up to 2. 1 mark per valid impact of ignoring sustainability, up to 2. Cap 5.

---

### L3 — LO13 (Team Management)

**Question:** You are project manager opening a new 40-bed hospital ward. The team combines clinical staff transferring from other wards, newly hired band-5 nurses, and an estates project team who have never worked with clinical staff before. Two ward sisters and the estates lead will coordinate remotely from other sites for the first six weeks.

Explain (a) two characteristics of an effective team you would aim to build in this newly formed group, (b) one team-development model, other than Tuckman, you could use to understand how the group works together, and (c) one challenge created by the six-week period where three coordinators work remotely.

**Model answer:** (a) Two characteristics: clear roles and responsibilities aligned to each person's skills and experience, so clinical staff work to clinical roles and estates staff to estates roles without overlap or gaps; and open, honest communication that builds trust across a group that has not worked together before, given the mix of transferring staff, new hires and estates staff. (b) Belbin: a model identifying nine preferred team roles that combine to produce an effective team, letting the leader recognise and use the strengths and behaviours already present in this mixed group rather than assuming everyone should work the same way. (c) One challenge: it is harder to build deep trust and to detect early signs of conflict when team members are working remotely, so the two ward sisters and the estates lead risk feeling disconnected from decisions being made by the co-located majority during those six weeks.

**Marking guide:** 1 mark per characteristic of an effective team correctly identified, up to 2. 1 mark for correctly naming a team-development model other than Tuckman. 1 mark for correctly describing what that model offers. 1 mark for a valid remote-working challenge linked to the scenario. Cap 5.

---

### L4 — LO20 (Schedule Management)

**Question:** You are project manager relocating a 300-person insurance claims department to a new office. The current office's IT helpdesk, a business-as-usual (BAU) function, must keep operating throughout the move to support ongoing claims processing, and several helpdesk staff are also assigned part-time to your project.

Explain (a) what a Work Breakdown Structure is and how it would help you plan this relocation, and (b) two ways the ongoing BAU helpdesk activity could impact your project schedule.

**Model answer:** (a) A Work Breakdown Structure (WBS) is a hierarchical breakdown of the work needed to deliver the project's products, with the lowest level being a work package. It would let me break the relocation into work packages — such as IT decommissioning, cabling, furniture move and go-live testing — and allocate resources, estimate and schedule each one, rather than treating the move as a single undifferentiated task. (b) Two impacts: (1) helpdesk staff who are part-time on my project may be pulled onto BAU support tickets when claims-processing issues spike, creating resource conflicts that delay tasks depending on them; (2) BAU equipment or systems the helpdesk needs to keep running, such as shared servers or phone lines, may be unavailable for project use at the same time, creating a scheduling dependency between BAU availability and project activities such as final cutover.

**Marking guide:** 1 mark for a correct definition of a WBS. 1 mark per BAU impact on schedule correctly identified, up to 2. 1 mark per impact correctly explained with scenario-linked reasoning, up to 2. Cap 5.

---

### L5 — LO23 (Risk and Issue Management)

**Question:** You are project manager on a customer-data migration to a new CRM platform. During testing, a data-mapping error is discovered that has already caused around 200 customer records to be duplicated in the new system. No one has yet formally logged it.

Explain (a) why this is an issue rather than a risk, (b) the stages of the issue management process you would follow, and (c) one reason governance matters in how this issue is handled.

**Model answer:** (a) A risk is an uncertain event that may or may not happen in the future; an issue is a problem that has already occurred or exists now and requires action to resolve. The duplicate records have already happened, so this must be managed through the issue process, not the risk process. (b) Log and analyse — record the issue in the issue register and prioritise it against success criteria, scope, time, cost and benefits; Escalate — raise it to the sponsor and, if needed, the governance board, given the potential impact on customer data integrity; Assign actions — give responsibility for fixing the duplication to whoever is best placed to resolve it, such as the data migration lead; Apply change control — if fixing the mapping error changes the baselined migration approach or timeline, route the fix through formal change control to update the plans. (c) One reason: governance sets clear escalation routes and thresholds so an issue affecting customer data integrity is guaranteed to reach the right decision-makers promptly, rather than being quietly fixed and under-reported, and it ensures consistent treatment and reporting so lessons are captured for future migrations.

**Marking guide:** 1 mark for correctly distinguishing issue from risk with reference to the scenario. 1 mark per issue management stage correctly named in a sensible order, up to 3 (any three of the four). 1 mark for a valid reason governance matters. Cap 5.

---

### L6 — LO2 (Governance Arrangements)

**Question:** You are project manager at a mid-sized charity running its first-ever digital fundraising platform, funded by a one-off grant. The organisation has never run a formal project before — there are no agreed decision-making processes, and the trustee board has asked why "some proper structure" is needed when "everyone just wants to get on with the work."

Explain (a) two aspects of governance you would put in place and why each is required, and (b) why it matters that this project is explicitly linked to the charity's strategic objectives.

**Model answer:** (a) Two aspects: Policies — a deliberate set of principles guiding how decisions get made, such as who can approve spend from the grant, because without agreed policies, decisions will be made inconsistently and disputes will arise about who had the authority to decide; and delegated responsibilities — using a tool such as a RACI to make roles explicit (who is responsible for content, who is accountable for grant spend, who must be consulted or informed), because in an organisation that has never run a formal project, ambiguity about ownership will otherwise slow every decision and create duplicated or dropped work. (b) It matters because projects exist to deliver strategic change; if this platform is not explicitly linked to the charity's strategic objectives (for example, growing sustainable income), there is a risk of misallocating scarce grant-funded resource on work that does not address the charity's actual priorities, of measuring performance against the wrong metrics, and of reputational risk if the platform's execution contradicts the charity's values or mission.

**Marking guide:** 1 mark per aspect of governance correctly named, up to 2. 1 mark per aspect correctly justified with a reason it is required, up to 2. 1 mark for a valid reason linking to strategic objectives matters. Cap 5.

---

### L7 — LO9 (Benefits Management)

**Question:** You are project manager on a local council's smart-bin sensor rollout, expected to reduce collection costs and improve recycling rates. The council's Head of Communications has asked how you will keep residents and refuse-collection crews engaged with the change, and how you will show councillors the rollout is delivering on the council's published sustainability strategy.

Explain (a) one tool you would use to link the project's benefits to the council's strategic objectives, and (b) two appropriate methods for communicating benefits to residents and to councillors respectively, with a reason for each choice.

**Model answer:** (a) Benefits mapping: a visual tool linking the project's outputs (sensor-fitted bins, route-optimisation software) to intermediate benefits (fewer unnecessary collections, better route efficiency) to end benefits (reduced collection costs, improved recycling rates) to the council's strategic objective — its published sustainability strategy — making the cause-and-effect chain explicit for councillors and residents alike. (b) For residents: email, the council website or social media, appropriate for broad-reach awareness of a change affecting many households, though it risks being ignored if not paired with more visible communication. For councillors: a formal report at a scheduled council or committee meeting, appropriate for a governance audience that needs an evidence trail and the ability to scrutinise progress against the sustainability strategy before further investment decisions.

**Marking guide:** 1 mark for correctly naming benefits mapping (or another valid strategic-alignment tool) with a valid description. 1 mark per audience-appropriate communication method correctly identified, up to 2. 1 mark per method correctly justified with a reason it suits that audience, up to 2. Cap 5.

---

### L8 — LO14 (Diversity and Inclusion)

**Question:** You are project manager assembling a project team for a global product launch, recruiting from offices in the UK, India and the UAE. During shortlisting, a hiring manager comments that a strong candidate "might struggle to fit in" because of their age, and that another candidate's visible religious dress "could be an issue with some clients."

Explain (a) two protected characteristics referenced in the hiring manager's comments, and (b) the difference between conscious and unconscious bias, applying each to what has happened in this scenario.

**Model answer:** (a) Two protected characteristics: age (referenced in "might struggle to fit in... because of their age") and religion or belief (referenced in the comment about visible religious dress) — both are characteristics that, under frameworks such as the UK Equality Act, may cause a person to be treated less favourably if acted upon. (b) Conscious bias is deliberate prejudice or preference a person knows they hold and acts on; unconscious bias is involuntary prejudice, often from societal stereotype, that a person does not realise is shaping their judgement. If the hiring manager genuinely believes clients would react badly and knowingly factors that belief into the decision, that is conscious bias being acted on directly. If the manager is unaware that assumptions about age or religious dress are influencing their view of "fit," and would deny holding any bias, that is unconscious bias — it still needs active counter-measures, such as structured, objective selection criteria, even though the manager does not intend it.

**Marking guide:** 1 mark per protected characteristic correctly identified from the scenario, up to 2. 1 mark for a correct definition of conscious bias. 1 mark for a correct definition of unconscious bias. 1 mark for correctly applying at least one of the two definitions back to the scenario. Cap 5.

---

### L9 — LO16 (Requirements Management)

**Question:** You are project manager on a new ERP system for a mid-sized manufacturer. Eighty requirements have been gathered from production, finance, warehouse and sales stakeholders, ranging from "the system must record batch numbers for traceability" to "the system should feel modern and be pleasant to use."

Explain (a) the four-step requirements management process you would follow to take these eighty requirements from initial gathering to an agreed scope baseline, and (b) which of the two example requirements given is functional and which is non-functional, with a reason for each.

**Model answer:** (a) Gather — identify all relevant stakeholders (production, finance, warehouse, sales) and capture requirements through interviews, workshops, observation or document review, ensuring no stakeholder group is missed; Analysis — use a technique such as Function (Cost) Analysis to understand the value of each requirement, identify gaps and resolve conflicts between stakeholder groups, then feed findings back to stakeholders; Justifying requirements — prioritise using a technique such as MoSCoW and link priorities to benefit value, then report the justified priorities back to stakeholders; Baseline needs — set the agreed requirements baseline, from which the team determines deliverables, manages change formally, and guards against scope creep. (b) "The system must record batch numbers for traceability" is a functional requirement, because it describes a capability the system must provide. "The system should feel modern and be pleasant to use" is a non-functional requirement, because it describes a quality or performance characteristic — usability — rather than a specific function the system performs.

**Marking guide:** 1 mark per requirements-management step correctly named in a sensible sequence, up to 3 (any three of the four). 1 mark for correctly classifying the functional requirement with a reason. 1 mark for correctly classifying the non-functional requirement with a reason. Cap 5.

---

### L10 — LO24 (Change Control)

**Question:** You are project manager on a marketing-automation platform build. The Head of Sales has emailed asking for a new integration with a lead-scoring tool to be added, giving a two-line description and no further detail, saying "just get it added, it's important." You are five weeks from planned go-live.

Explain (a) three fields the change request should capture before it can be properly evaluated, and (b) two questions you would ask to justify a recommendation to approve, reject or defer this request.

**Model answer:** (a) Three fields: a clear description of the change — what the integration should actually do, beyond the two-line email; the reason for the change — why the lead-scoring integration is needed now, such as a sales driver or customer demand; and the areas impacted — a first-pass view of which parts of the platform build the integration would touch. A named change request owner, accountable for progressing it, should also be captured. (b) Two questions: (1) Does the project have the skills and resources to deliver this integration within the five weeks remaining, or would external support be needed? (2) Does the change affect the go-live date, and if so, are the outcomes still useful to the business at a later date, or does the five-week window make approval unrealistic without deferring either the integration or go-live itself?

**Marking guide:** 1 mark per change request field correctly identified, up to 3. 1 mark per valid justification question correctly linked to the scenario, up to 2. Cap 5.

---

## Short-form (2 marks each, 12 marks total)

### S1 — LO6 (Reviews)

**Question:** State two reasons why project activities might need to be re-planned following a review.

**Model answer:** Any two of: planned scope is not achieving the requirements; project team morale and satisfaction is low; contractor or supplier performance is poor; committed costs and cashflow exceed forecasts; the risk profile has changed; stakeholder communication is ineffective; resource availability has changed.

**Marking guide:** 1 mark per valid, distinct re-planning reason, up to 2. Cap 2.

### S2 — LO7 (Assurance)

**Question:** State the three types of assurance activity used to give a governance board confidence in a project, and what each one confirms.

**Model answer:** Any two of: Controls — the day-to-day management system (policies, procedures, standards) that confirms risk impact is being minimised by design. Compliance — regular monitoring and checks (such as audits or PMO reviews) that confirm controls are actually being used. Independent review — internal or external audit or peer review that gives a strategic overview of the whole system of control.

**Marking guide:** 1 mark per assurance activity type correctly named with what it confirms, up to 2. Cap 2.

### S3 — LO11 (Conflict Resolution)

**Question:** State two typical sources of conflict that can arise during the deployment phase of a project.

**Model answer:** Any two of: resource availability and commitment issues; missed deadlines; project processes not being followed; supplier or contractor underperformance.

**Marking guide:** 1 mark per valid, distinct source of conflict correctly linked to the deployment phase, up to 2. Cap 2.

### S4 — LO17 (Solutions Development)

**Question:** Besides MoSCoW, state two other techniques that could be used to prioritise requirements when developing a solution.

**Model answer:** Any two of: investment appraisal (weighing cost against benefit and risk); numerical assignment (grouping requirements into numbered priority bands); the ABC model (classifying into three tiers of importance); the 5 Whys (questioning to uncover the underlying need behind a requirement); stakeholder commitment to a solution; market capability or supply availability.

**Marking guide:** 1 mark per valid, distinct prioritisation technique named, up to 2. Cap 2.

### S5 — LO21 (Resource Management)

**Question:** State what each of the four letters in a RACI matrix stands for.

**Model answer:** R = Responsible (does the work); A = Accountable (approves the work, held to account); C = Consulted (provides input, two-way dialogue); I = Informed (kept up to date, one-way communication).

**Marking guide:** 1 mark for correctly stating at least two of the four letters. 1 mark for correctly stating all four letters. Cap 2.

### S6 — LO18 (Quality Management)

**Question:** State two of the elements a quality plan should define for each quality activity.

**Model answer:** Any two of: Methods of verification (how quality will be checked, e.g. inspection, testing, audit); Resources (the people, equipment and tools needed); Frequency (how often the activity takes place); Pass/fail criteria (the standard against which the check is judged); Responsibility (who is accountable for carrying out the check).

**Marking guide:** 1 mark per valid, distinct quality plan element correctly named, up to 2. Cap 2.

---

## What I need from you

Same checks as Exam 2: does this hit the depth/tone/difficulty/mark-scheme bar? This batch also closes out the "every LO gets at least one long-form appearance" goal (LO1, LO3, LO13, LO20, LO23 were previously untested at long-form depth). Flag anything that reads off, and I'll fold the fix into Exam 4 or come back to this file.

Exam 4 (final batch: LO6, LO7, LO11, LO15, LO17, LO18, LO19, LO21, LO4, LO12 long-form; LO5, LO2, LO9, LO14, LO24 short-form) is in a separate file, drafted using the same method.
