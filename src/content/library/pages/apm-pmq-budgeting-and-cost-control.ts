import { scaffoldLibraryPage } from "../scaffold";

export const page = scaffoldLibraryPage({
  slug: "apm-pmq-budgeting-and-cost-control",
  title: "APM PMQ budgeting and cost control (LO22): what you need to know",
  metaTitle: "APM PMQ Budgeting and Cost Control (LO22) | Learn in Curve",
  metaDescription:
    "APM PMQ LO22 budgeting and cost control: the cost breakdown structure, cost types, contingency, earned value formulas and how to read CPI and SPI.",
  group: "syllabus",
  related: [
    "apm-pmq-integrated-planning",
    "apm-pmq-resource-management",
    "apm-pmq-scheduling-and-critical-path",
    "apm-pmq-breakdown-structures",
    "apm-pmq-risk-management",
  ],
  loNumber: 22,
  status: "published",
  updatedAt: "2026-11-14",
  answerFirst:
    "APM PMQ budgeting and cost control (LO22) tests whether you can build a budget through a cost breakdown structure, tell cost types apart, hold contingency properly, and use earned value to compare spend with progress. Be ready to calculate and interpret CPI and SPI.",
  body: `Budgeting is the money half of the delivery controls, and the twin of scheduling (LO20). Cost planning takes the resourced schedule from LO21 as an input, which is why it comes after them: you cannot cost a schedule you have not built. The budget then sits inside the integrated plan (LO19), and earned value is the technique that joins cost and schedule in the same units.

## What APM tests you on in LO22

The learning objective is about estimating costs, developing and agreeing budgets, and monitoring actual costs against forecast. It splits into two learning outcomes:

- **22a:** how to create a budget, including a cost breakdown structure, and the different kinds of cost it contains (fixed, variable, direct, indirect and so on).
- **22b:** how to forecast and refine budgets using cost control techniques such as earned value.

The topic has four elements: estimate the cost, agree a budget, track actual and forecast spend against it, and close the finances down properly at the end.

## Building the budget

The cost breakdown structure (CBS) defines scope in budget terms. It is the fourth breakdown structure, alongside the PBS (things to create), the WBS (activities to complete) and the OBS (people). Building the budget through a CBS means every cost traces back to a work package. That is what makes variance analysis possible later: an overspend can be located, not just observed.

Costs are grouped by type (labour, services, materials and consumables, and assets) and by behaviour:

| Pair | The distinction |
|---|---|
| Fixed vs variable | Fixed costs do not change with quantity; variable costs rise with how much is used or made |
| One-off vs recurring | Paid once, such as a computer, or repeatedly, such as a software licence |
| Capital vs revenue | Treated according to the organisation's accounting rules, with capital spend tightly controlled |
| Direct vs indirect | Direct costs attach to a specific work package; indirect costs support the project without tracing to one item |

In an iterative life cycle, each iteration carries its own largely fixed cost, so total cost rises in steps as scope is released. That lets a sponsor cap future commitment by funding fewer iterations.

A budget is not just a total. Costs are profiled over the life of the project as a cash flow forecast, which in earned value terms is the planned value. So the budget is a curve, and that curve is the baseline cost control measures against. Funding may also be released only at stage gates or per iteration, so money that exists but cannot yet be drawn down is not available money.

Estimating differs by cost type, and the main bias to watch is optimism bias: assuming everything goes to plan. The counters are review and challenge, and contingency for each cost area. Whole-life costing extends the budget to end of life and decommissioning, because the cheapest option to build is often not the cheapest to own.

## Contingency and management reserve

There is no unlimited purse, so budgets include money for the unexpected.

| Type | Covers | Released by |
|---|---|---|
| Planned contingency | Known risks and anticipated events | Authorised drawdown when the risk occurs |
| Management reserve | Unanticipated issues | The governance board |

Contingency is a management tool controlled through governance, not a spare pot for the project manager. It can be held at different levels for different risks. Some, such as currency or interest rate exposure, are better held at organisational level.

## Cost control and reporting

Cost control compares actual spend with the approved cash flow forecast. Track spend as close to real time as you can, and more often when money is going out quickly. Accounting systems tend to lag behind commitments the project has already made, so committed cost and recorded cost are not the same thing.

Monitoring lets deviations be corrected quickly. It also supports re-forecasting when the budget cannot be recovered, authorising supplier payments, unlocking funding at stage gates and seeking contingency drawdown. Good financial reports cover three things: current status and trend, why the plan was missed, and a forecast with the action being taken.

## Earned value: the measures and formulas

Comparing budget with spend tells you how much was spent, not what it bought. Earned value adds the missing third measure.

| Measure | Also called | Meaning |
|---|---|---|
| PV, planned value | BCWS | Budgeted cost of the work scheduled by now |
| EV, earned value | BCWP | Budgeted cost of the work actually completed |
| AC, actual cost | ACWP | What has actually been spent |
| BAC | Budget at completion | The total approved budget |

| Measure | Formula | Reading |
|---|---|---|
| Cost variance (CV) | EV minus AC | Negative means over budget |
| Schedule variance (SV) | EV minus PV | Negative means behind schedule |
| Cost performance index (CPI) | EV divided by AC | Below 1.0 means over budget |
| Schedule performance index (SPI) | EV divided by PV | Below 1.0 means behind schedule |
| Estimate at completion (EAC) | BAC divided by CPI | Forecast final cost if efficiency continues |

The pattern: both variances subtract from EV, both indices divide EV. Compare against AC for cost, against PV for schedule.

A quick illustration. A project has a BAC of £500,000. At review, PV is £200,000, EV is £160,000 and AC is £200,000. Spend matches the plan exactly, yet CPI is 0.8 and SPI is 0.8: the project is over budget and behind schedule. EAC is £500,000 divided by 0.8, which is £625,000. This is exactly the trap earned value exists to expose.

Two points to carry. Critical chain does not use earned value; it tracks buffer consumption instead. And iterative projects are usually easier to control financially but harder to forecast, because they are chosen where uncertainty is high.

Financial closedown is the forgotten fourth element: pay outstanding invoices, return unused contingency, close timesheets and expenses, report final financial performance against the business case, close cost centres and archive records for audit.

## Worked scenario: weak answer vs strong answer

> *At month five, a project has a planned value of £300,000, an earned value of £240,000 and an actual cost of £320,000. Explain what earned value analysis shows about the project's performance. (5 marks)*

**Weak answer:** "The project has spent more than it planned, so it is over budget. The project manager should try to reduce costs and report it to the sponsor."

That answer compares only spend with plan, which is the mistake earned value exists to prevent. It calculates nothing. It might earn one mark.

**Strong answer:**

- **Cost variance** is £240,000 minus £320,000, which is minus £80,000, so the project is over budget.
- **Schedule variance** is £240,000 minus £300,000, which is minus £60,000, so it is behind schedule.
- **CPI** is 240,000 divided by 320,000, which is 0.75: every pound spent is earning only 75p of planned value.
- **SPI** is 240,000 divided by 300,000, which is 0.8: work is being completed at 80% of the planned rate.
- The project is **both over budget and behind schedule**, so a revised forecast and recovery actions should go to the sponsor or governance board.

Five distinct points, each a figure with its meaning attached.

## Common exam traps

- **"A budget is the total cost."** No. It is profiled over time as a cash flow forecast, and that curve is the baseline.
- **"Half the budget spent means half the work done."** No. Only earned value shows whether spend and progress match.
- **"A CPI below 1.0 means behind schedule."** No. CPI below 1.0 means over budget; SPI below 1.0 means behind schedule.
- **"Contingency is the project manager's spare money."** No. Governance controls it, and the board releases management reserve.
- **"Earned value applies to every project."** No. Critical chain monitors buffer consumption instead.
- **"The budget work ends when delivery ends."** No. Financial closedown is a distinct task.
`,
  practice: [
    {
      prompt: "Earned value is £90,000 and actual cost is £100,000. What is the CPI?",
      options: [
        { key: "A", label: "1.11" },
        { key: "B", label: "0.9" },
        { key: "C", label: "minus £10,000" },
        { key: "D", label: "0.1" },
      ],
      correctKey: "B",
    },
    {
      prompt: "Who typically releases the management reserve?",
      options: [
        { key: "A", label: "The project manager" },
        { key: "B", label: "The supplier" },
        { key: "C", label: "The governance board" },
        { key: "D", label: "The PMO analyst" },
      ],
      correctKey: "C",
    },
    {
      prompt: "A cost that does not change however many units are produced is best described as:",
      options: [
        { key: "A", label: "Variable" },
        { key: "B", label: "Indirect" },
        { key: "C", label: "Recurring" },
        { key: "D", label: "Fixed" },
      ],
      correctKey: "D",
    },
  ],
  faqs: [
    {
      question: "What is LO22 in the APM PMQ?",
      answer:
        "LO22 is budgeting and cost control: estimating costs, developing and agreeing budgets, and monitoring actual costs against forecast. It covers the cost breakdown structure, cost types, contingency and earned value.",
    },
    {
      question: "What is the difference between CPI and SPI?",
      answer:
        "CPI is earned value divided by actual cost and measures cost efficiency; below 1.0 means over budget. SPI is earned value divided by planned value and measures schedule progress; below 1.0 means behind schedule.",
    },
    {
      question: "What is the difference between contingency and management reserve?",
      answer:
        "Planned contingency covers known risks and is drawn down with authority when a risk occurs. Management reserve covers unanticipated issues and is released by the governance board rather than the project manager.",
    },
    {
      question: "What is a cost breakdown structure?",
      answer:
        "A cost breakdown structure defines the project scope in budget terms, so every cost traces back to a work package or deliverable. That makes it possible to locate where an overspend has come from.",
    },
  ],
  sources: [
    {
      label: "APM Project Management Qualification (PMQ)",
      url: "https://www.apm.org.uk/qualifications-and-training/project-management-qualification/",
      publisher: "Association for Project Management",
    },
  ],
});
