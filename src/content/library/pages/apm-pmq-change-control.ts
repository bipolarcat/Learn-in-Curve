import { scaffoldLibraryPage } from "../scaffold";

export const page = scaffoldLibraryPage({
  slug: "apm-pmq-change-control",
  title: "APM PMQ change control: what you need to know",
  metaTitle: "APM PMQ Change Control: The Process, Baselines and Configuration Management | Learn in Curve",
  metaDescription:
    "Change control for the APM PMQ: the stages of the change control process, what a baseline is for, change freeze and change budget, and how configuration management differs.",
  group: "syllabus",
  related: [
    "apm-pmq-breakdown-structures",
    "apm-pmq-business-case",
    "apm-pmq-quality-management",
  ],
  status: "published",
  updatedAt: "2026-08-19",
  answerFirst:
    "Change control is the process for evaluating and deciding requested changes to a baseline. It exists to make change visible and deliberate, not to prevent it. Configuration management then keeps track of what the current version actually is.",
  body: `Change control produces some of the most confidently wrong answers on the paper, because candidates treat it as an administrative gate rather than a decision process. The exam almost always describes someone asking for something reasonable, and the marks are in how you handle it rather than whether you allow it.

## Start with the baseline

A **baseline** is the agreed version of the plan, the scope, the budget and the schedule at a point in time. It is what you measure against.

Without a baseline there is no change, because there is nothing for the request to be a change from. That is why change control is meaningless before definition and why scenarios set during early concept work are usually testing something else.

## The change control process

The process runs in stages, and an answer that walks them in order scores better than one that names them.

**Request.** The change is captured formally, with enough detail to be assessed, and logged in the change register. Anyone can raise one.

**Initial evaluation.** A quick filter. Is this actually a change, is it worth the cost of assessing properly, and is it a duplicate of something already logged. Some requests stop here.

**Detailed evaluation.** The real work. Assess the impact on scope, time, cost, quality, risk, benefits and stakeholders, and produce options rather than a single answer. This is where the project manager earns their marks.

**Decision.** Someone with the authority approves, rejects or defers it. Which authority depends on the size of the change against defined thresholds, which is where this topic meets governance.

**Implementation and update.** If approved, the work is done and, critically, the baseline, the plans and the documentation are all updated so that the new position is the one being measured against.

The last step is the one candidates omit. An approved change that never moves the baseline leaves the project reporting against a plan it has already abandoned.

## Change freeze and change budget

A **change freeze** stops changes being accepted after a defined point, usually because implementing them would cost more than the benefit they bring. Common late in delivery, and it should be a governance decision with a date, not an informal mood.

A **change budget** is money set aside in advance for changes that are expected but not yet specified. It is not contingency. Contingency covers risks that were identified; a change budget covers the near certainty that requirements will move.

## Configuration management is a different job

Change control decides whether something changes. **Configuration management** keeps track of what the thing currently is.

It runs through identification, naming the items under control, control of the versions themselves, status accounting, so you can say what version is where, and verification or audit, checking that what exists matches what the records claim.

However, the distinction is worth more than the definitions suggest. On a project with poor configuration management, the change control process can work perfectly and two teams can still build to different drawings, because the decision was made and the current version was never established.

## A worked example

Take a school extension in construction. Eight weeks before handover the client asks for the main hall to be fitted with additional acoustic treatment after a noise complaint from a neighbouring property.

A weak answer says: raise a change request and reject it because of the freeze.

A stronger answer runs the process. Log it, then evaluate it initially, which confirms it is a genuine change to the baselined specification rather than a defect. Detailed evaluation then produces options rather than a verdict: full treatment now, which adds around three weeks and breaks the handover date; a partial installation that meets the immediate complaint and defers the rest to a post-handover works order; or acceptance with a monitoring condition. It states the impact of each on cost, programme, the business case and the tenant's occupation date.

The decision then goes to whoever holds authority at that value, which at this size is the sponsor rather than the project manager. Whatever they choose, the baseline is updated to match, and the change register records the decision, the date and who made it.

Essentially: change control exists to make change deliberate, always evaluate before recommending, take the decision to the right authority, update the baseline afterwards, and keep configuration management separate in your head as the discipline that tells you which version is real.`,
  faqs: [
    {
      question: "What does the APM PMQ cover on change control?",
      answer:
        "The purpose of change control, the stages of the change control process from request through to implementation, the role of baselines, change freeze and change budget, and the relationship between change control and configuration management.",
    },
    {
      question: "What are the stages of the change control process?",
      answer:
        "Request and logging, initial evaluation as a filter, detailed evaluation of the impact across scope, time, cost, quality, risk and benefits, a decision by the appropriate authority, and implementation with the baseline and documentation updated to match.",
    },
    {
      question: "What is the difference between change control and configuration management?",
      answer:
        "Change control decides whether a change is made. Configuration management identifies, versions and tracks the items under control so that everyone knows what the current version is and can verify that what exists matches the records.",
    },
    {
      question: "What is the difference between a change budget and contingency?",
      answer:
        "Contingency is held against identified risks that may or may not materialise. A change budget is set aside for changes that are expected in principle but not yet specified, which is a near certainty on most projects rather than an uncertainty.",
    },
    {
      question: "Why does the baseline have to be updated after an approved change?",
      answer:
        "Because progress is measured against the baseline. If an approved change is implemented but the baseline is not moved, the project reports variance against a plan it has already replaced, and the reporting stops being useful.",
    },
  ],
});
