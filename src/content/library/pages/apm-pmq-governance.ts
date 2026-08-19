import { scaffoldLibraryPage } from "../scaffold";

export const page = scaffoldLibraryPage({
  slug: "apm-pmq-governance",
  title: "APM PMQ governance: what you need to know",
  metaTitle: "APM PMQ Governance: What the Exam Actually Tests | Learn in Curve",
  metaDescription:
    "Governance for the APM PMQ: sponsor versus project manager accountability, what a steering group decides, what a PMO does, and why assurance has to sit outside the delivery team.",
  group: "syllabus",
  related: [
    "apm-pmq-business-case",
    "apm-pmq-stakeholder-management",
    "apm-pmq-project-life-cycles",
  ],
  status: "published",
  updatedAt: "2026-08-19",
  answerFirst:
    "Governance is the framework of roles, decisions and accountability a project runs inside. Management is the work done within that framework. The exam tests whether you can say who decides what, and why the split matters.",
  body: `Governance is the topic candidates most often revise as a list of job titles. The paper rarely asks for titles. It describes a project where a decision is stuck, or a sponsor has gone quiet, or reporting has become a monthly slide with no decision attached, and asks what should happen.

## Governance and management are not the same thing

Governance is the framework: who holds authority, which decisions sit at which level, what has to be reported, and how the organisation satisfies itself that the project is being run properly.

Management is what happens inside that framework. Planning the work, running the team, controlling cost and schedule.

The clean way to hold it: **governance sets the rules and holds people to account. Management plays inside them.** A project manager who escalates a decision they do not have authority to make is not failing, they are using the governance structure correctly.

## Sponsor and project manager

This is the single most examined split on the topic, so have it sharp.

The **sponsor** owns the business case. They are accountable for the investment being worth making, for securing the funding, for the benefits actually landing after handover, and for making the decisions that exceed the project manager's authority.

The **project manager** is responsible for delivering the agreed outputs to time, cost and quality, and for surfacing anything that threatens them.

Two consequences worth writing down in an answer. The sponsor is accountable for benefits, not the project manager, because benefits usually arrive after the project has closed and the team has dispersed. And an absent sponsor is a governance failure with a named owner, not background noise the project manager should route around.

## The steering group

The steering group, or project board, is the decision-making forum. It exists so that decisions above the project manager's threshold get made by people who can commit the organisation to them.

It normally brings together the sponsor, the people who will use or operate the output, and whoever supplies it. Its job is to decide, not to be updated. A steering group that only receives reports has become an audience.

## What the PMO actually does

A project management office is a function, not a filing cabinet. Depending on how the organisation has set it up, it will do some mix of setting standards and templates, consolidating reporting across projects, managing shared resource, holding lessons learned, and providing assurance.

The exam will not ask you to define it. It will describe an organisation running fifteen projects with no consistent reporting and ask what would help.

## Assurance has to be independent

Assurance is the check that the project is being managed properly, and the whole value of it comes from the person doing it not being the person doing the work.

However, this is exactly where scenario questions catch people out. A project manager who writes their own assurance report has produced an opinion, not assurance. The point is not the document, it is the independence.

## A worked example

Take a project delivering a new operational system. Halfway through definition, the operations director asks for an additional integration that adds roughly nine weeks and pushes the forecast past the approved budget.

A weak answer says: raise a change request.

A stronger answer works the governance. The project manager evaluates the impact on time, cost, quality and benefits, and takes it to the sponsor, because it changes the business case rather than only the plan. The sponsor decides whether the additional benefit justifies the additional investment, and if it exceeds their delegated authority, they take it to the steering group. Once decided, the baseline moves, the change is recorded, and the reporting reflects the new position rather than quietly absorbing it.

Notice that the project manager decides nothing about whether to do it. They make the decision possible.

## Reporting is a governance control

Reporting exists so that the people accountable can act while acting is still cheap. That means it needs a defined cadence, a defined audience, and a defined threshold at which something gets escalated rather than noted.

You've got a reliable test for a good answer here: does the report end in a decision, or does it end?

Essentially: know that governance is the framework and management is the work, keep sponsor accountability and project manager responsibility separate, remember the steering group exists to decide, and when a scenario describes a stuck decision, name who should be making it and what they need in order to make it.`,
  faqs: [
    {
      question: "What does the APM PMQ cover on governance?",
      answer:
        "The purpose of governance, the roles and responsibilities within a governance structure including the sponsor, project manager, steering group and project team, the function of a PMO, the role of assurance, and how reporting and escalation support decision making.",
    },
    {
      question: "What is the difference between the sponsor and the project manager?",
      answer:
        "The sponsor is accountable for the business case, the funding and the realisation of benefits, and makes decisions beyond the project manager's authority. The project manager is responsible for delivering the agreed outputs to time, cost and quality.",
    },
    {
      question: "Who is accountable for benefits realisation?",
      answer:
        "The sponsor. Benefits usually arrive after the project has closed and handed over, at which point the project manager and the team have moved on, so accountability sits with the role that continues.",
    },
    {
      question: "Why does assurance need to be independent?",
      answer:
        "Because assurance is a check that the project is being managed properly, and a check carried out by the people doing the work is an opinion rather than a check. Independence is what gives the assurance any value.",
    },
    {
      question: "How are governance questions framed in the exam?",
      answer:
        "As scenarios. A decision has stalled, a sponsor is disengaged, or reporting is not producing action, and you are asked what should happen. Answers that only list roles tend to score poorly compared with answers that say who decides what and why.",
    },
  ],
});
