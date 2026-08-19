import { scaffoldLibraryPage } from "../scaffold";

export const page = scaffoldLibraryPage({
  slug: "apm-pmq-risk-management",
  title: "APM PMQ risk management: what you need to know",
  metaTitle: "APM PMQ Risk Management: What the Exam Actually Tests | Learn in Curve",
  metaDescription:
    "Risk and issue management for the APM PMQ: the risk versus issue distinction, why opportunities count as risks, risk owner versus action owner, and how the questions are framed.",
  group: "syllabus",
  related: [
    "apm-pmq-business-case",
    "apm-pmq-stakeholder-management",
    "how-hard-is-apm-pmq",
    "apm-pmq-scheduling-and-critical-path",
    "apm-pmq-quality-management",
  ],
  status: "published",
  updatedAt: "2026-08-08",
  answerFirst:
    "A risk is an uncertain event that has not happened yet. An issue is one that has. The APM PMQ tests whether you can identify, assess, respond to and monitor risks, including opportunities, not just describe a risk register.",
  body: `Risk is where the gap between knowing the vocabulary and being able to use it shows up most clearly. Everyone can define a risk register. Very few candidates can write five marks' worth of convincing argument about what to do in a specific situation, which is what the paper asks.

## Risk or issue

The distinction is simple and it's examined constantly, so have it precise.

A **risk** is uncertain. It might happen. It has a probability and an impact, and because it hasn't happened yet you can still do something about it in advance.

An **issue** has happened, or is happening now. Uncertainty is gone. You are no longer managing probability, you're managing consequences.

The reason this matters beyond terminology: they need different handling and different routes. Risks are managed proactively by the project, within an agreed appetite. Issues frequently need escalating, because they often exceed the project manager's authority to resolve.

A risk that materialises becomes an issue. That transition is a favourite exam scenario, and the good answer is rarely "put it in the issue log."

## Opportunities are risks too

This trips people up. Risk in this syllabus is uncertainty in both directions. An uncertain event with a positive impact is still a risk, and it should be managed rather than hoped for.

That gives you two families of response, and being able to name both cleanly is worth marks:

**For threats:** avoid it, reduce it, transfer it, or accept it.

**For opportunities:** exploit it, enhance it, share it, or reject it.

If a question mentions a possible upside, a supplier who might deliver early, a technology that might cut effort, and your answer only discusses mitigation, you've answered half of it.

## Risk owner and action owner

Another distinction that reliably appears.

The **risk owner** is accountable for the risk overall: monitoring it, judging whether the response is working, escalating when it isn't.

The **action owner** is responsible for carrying out a specific response action.

They're often different people, and they should be. The risk owner is usually whoever is best placed to see the risk coming and has the authority to act; the action owner is whoever actually does the task.

## What a good scenario answer looks like

Take a realistic case. A project depends on a specialist component with a single credible supplier, and their lead time consumes most of the float before an immovable installation window.

A weak answer says: log it as a high risk with a mitigation plan.

A stronger answer works the process. Identify it as a schedule risk with a single point of failure and a hard downstream dependency. Assess it: high impact because the installation window cannot move, moderate probability, and critically, high proximity, meaning it will bite soon rather than eventually. Then respond deliberately, and say which response you've chosen and why: reduce it by placing the order early and paying to hold a slot, or transfer part of the exposure contractually, or accept it with a fallback already agreed, such as a temporary alternative that keeps the window intact. Then monitor: named owner, reviewed on a defined cadence, with a trigger point at which the fallback is invoked rather than debated.

Notice that the register is barely mentioned. The register is where the thinking gets recorded. The marks are in the thinking.

Proximity is worth carrying into the exam, incidentally. Two risks with identical probability and impact are not equally urgent if one lands next month and the other in a year.

## Qualitative and quantitative

Know the difference and when each fits.

**Qualitative** assessment ranks risks by judged probability and impact so you can prioritise. It's quick, it's subjective, and it's what most projects run on day to day.

**Quantitative** assessment models the numerical effect on cost or schedule. It costs more effort and needs decent data, so it tends to be reserved for large or high-exposure projects, or specific decisions worth modelling.

Qualitative first, quantitative where the stakes justify it.

## The point to hold onto

However thorough your register, it prevents nothing on its own. Risk management works when a response was agreed in advance and someone acted on it, which is exactly why exam questions describe situations rather than asking for definitions.

Essentially: know the risk and issue split, remember opportunities count, keep risk owner and action owner separate, and when a scenario appears, walk the process and say what you'd do and why.`,
  faqs: [
    {
      question: "What does the APM PMQ cover on risk and issues?",
      answer:
        "Identifying, assessing, responding to and monitoring risk across the life cycle, including opportunities as well as threats, the risk and issue distinction, ownership, escalation, and the difference between qualitative and quantitative assessment.",
    },
    {
      question: "How are risk questions typically framed in the exam?",
      answer:
        "As scenarios. You're given a situation and asked what you would do, why a particular response suits it, or what should happen when a risk materialises. Answers that only describe a risk register tend to score poorly.",
    },
    {
      question: "What's the difference between a risk and an issue?",
      answer:
        "A risk is uncertain and hasn't happened yet, so you can still act in advance. An issue has already happened, so you're managing consequences rather than probability. Issues often need escalating because they exceed the project manager's authority.",
    },
    {
      question: "Are opportunities really treated as risks?",
      answer:
        "Yes. Risk covers uncertainty in both directions. Opportunities have their own response set: exploit, enhance, share or reject, which mirrors avoid, reduce, transfer and accept for threats.",
    },
    {
      question: "What's the difference between a risk owner and an action owner?",
      answer:
        "The risk owner is accountable for the risk overall, including monitoring and escalation. The action owner is responsible for carrying out a specific response action. They are frequently different people.",
    },
  ],
});
