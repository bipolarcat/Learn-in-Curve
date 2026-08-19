import { scaffoldLibraryPage } from "../scaffold";

export const page = scaffoldLibraryPage({
  slug: "apm-pmq-stakeholder-management",
  title: "APM PMQ stakeholder management: what you need to know",
  metaTitle: "APM PMQ Stakeholder Management: What the Exam Tests | Learn in Curve",
  metaDescription:
    "Stakeholder engagement and communication for the APM PMQ: why engagement is not the same as communication, how analysis drives the plan, and how the questions are framed.",
  group: "syllabus",
  related: [
    "apm-pmq-business-case",
    "apm-pmq-risk-management",
    "is-apm-pmq-worth-it",
    "apm-pmq-leadership-and-teams",
    "apm-pmq-governance",
  ],
  status: "published",
  updatedAt: "2026-08-08",
  answerFirst:
    "Stakeholder management means identifying who is affected by or can affect the project, analysing their influence and interest, and planning engagement accordingly. The APM PMQ treats engagement and communication as linked but distinct, and examines both.",
  body: `This sits in Area C, people and behaviours, which is 25 to 35% of the paper. If your background is technical, that weighting probably surprises you, and this is one of the topics where it shows.

## Engagement is not communication

Start here, because a lot of answers lose marks by treating them as the same thing.

**Communication** is the flow of information. Who needs to know what, in what form, how often.

**Engagement** is the relationship. Building support, understanding resistance, involving people in decisions, shifting someone from sceptical to neutral to advocate.

You can communicate impeccably and still have a stakeholder actively working against you, because they were informed but never listened to. A monthly report is communication. Asking a hostile department head what would make the change workable for their team, and then changing something, is engagement.

The exam tests both, and questions that appear to be about a communication plan frequently want you to notice the engagement problem underneath it.

## Identification, and who gets missed

Stakeholders are anyone affected by the project or able to affect it. That second half is the one people forget, and it's where the trouble usually is.

The obvious ones get identified immediately: sponsor, client, project team, end users. The ones that cause problems are the quieter ones. A regulator whose approval sits on the critical path. An operations team who will have to run the thing after handover and have never been asked what they need. A neighbouring business affected during construction. An internal function whose process the project quietly changes.

Identification also isn't a one-off. New stakeholders appear as a project moves through its life cycle, and the ones who matter most shift. Whoever was central during design may be peripheral during installation, and the operations team who barely featured early become critical near handover.

## Analysis drives the plan

The point of analysis is proportionality. You cannot engage everyone equally, and trying to means the people who genuinely matter get the same attention as those who don't.

The common approach maps stakeholders on two axes, typically their power or influence over the project and their interest in it, which sorts them into groups needing different treatment. High power and high interest gets close, active engagement. High power and low interest still needs keeping onside, because a disengaged stakeholder with authority can block something late. Low power and high interest usually wants information and consultation. Low on both needs monitoring rather than effort.

However, the thing to say in an answer if you want the marks: this is a snapshot, and attitude matters as much as position. Two stakeholders with identical power and interest are not the same problem if one supports the project and one opposes it. The strongest answers acknowledge that analysis is repeated as things change.

## What a scenario answer needs to do

A typical five-mark question describes a situation where a stakeholder is causing difficulty and asks what you would do.

The weak answer is a communication plan. More updates, a fortnightly report, add them to the distribution list.

The stronger answer diagnoses first. Why is this person behaving this way? A department head resisting a new system may be worried about their team's workload during transition, or about losing control of a process, or may have been through a badly handled rollout before. Those causes need different responses, and none of them is fixed by more reports.

Then act proportionately: understand the concern, involve them in the decisions that affect them, adjust what can be adjusted, be honest about what cannot, and use the sponsor's authority where the issue genuinely sits above your own.

That's the shape markers are looking for. Diagnose, then respond to the actual cause.

## Sponsor and stakeholder

Worth having ready as a clean distinction.

The **sponsor** is a specific and senior role: accountable for the business case and the investment, owns the benefits, and provides the authority and top cover the project needs. Singular, and accountable.

A **stakeholder** is anyone with an interest in or influence over the project. Many of them, with no accountability implied.

The sponsor is a stakeholder. Most stakeholders are not the sponsor.

Essentially: identify widely including the people who can affect you, analyse so your effort is proportionate, remember engagement is a relationship rather than a mailing list, and when a scenario hands you a difficult stakeholder, work out why before you decide what to do.`,
  faqs: [
    {
      question: "What does the APM PMQ expect on stakeholder engagement?",
      answer:
        "Identifying stakeholders including those who can affect the project, analysing influence and interest to set proportionate engagement, planning communication accordingly, and revisiting all of it as the project moves through its life cycle.",
    },
    {
      question: "How are communication and stakeholder questions linked?",
      answer:
        "Closely, but they aren't the same. Communication is the flow of information. Engagement is the relationship. Questions that look like communication planning often want you to identify an engagement problem that more reporting would not solve.",
    },
    {
      question: "What's the difference between a stakeholder and a sponsor?",
      answer:
        "The sponsor is a single senior role accountable for the business case, the investment and the benefits, providing authority to the project. A stakeholder is anyone with an interest in or influence over it. The sponsor is a stakeholder; most stakeholders are not the sponsor.",
    },
    {
      question: "How much of the APM PMQ is about people?",
      answer:
        "Area C, people and behaviours, accounts for 25 to 35% of the paper, covering stakeholder engagement, communication, leadership, teams, conflict, diversity and ethics. Candidates from technical backgrounds often underestimate it.",
    },
  ],
});
