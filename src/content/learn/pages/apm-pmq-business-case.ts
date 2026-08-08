import { scaffoldLearnPage } from "../scaffold";

export const page = scaffoldLearnPage({
  slug: "apm-pmq-business-case",
  title: "APM PMQ business case: what you need to know",
  metaTitle: "APM PMQ Business Case: What the Exam Actually Tests | Learn in Curve",
  metaDescription:
    "The business case for the APM PMQ: who owns it, why it stays alive through the life cycle, and how five-mark questions on it are actually framed.",
  group: "syllabus",
  sampleQuestionLos: [4],
  related: [
    "apm-pmq-risk-management",
    "apm-pmq-stakeholder-management",
    "apm-pmq-exam-format",
  ],
  status: "published",
  updatedAt: "2026-08-08",
  answerFirst:
    "The business case sets out why a project is worth doing: the justification, the expected benefits, the whole-life costs and the risks. It's owned by the sponsor, not the project manager, and it stays live across the whole life cycle.",
  body: `Most candidates arrive at this topic able to list what goes in a business case. Far fewer can answer the question the exam actually asks, which is almost never "what does it contain."

## The two things that get examined

**Ownership.** The business case belongs to the sponsor. The project manager may write large parts of it, maintains it, and feeds it evidence, but accountability for the investment sits with the sponsor. This distinction comes up constantly, and it comes up because it reflects something real: the person accountable for delivering the outputs and the person accountable for the investment paying off are not the same person, and shouldn't be.

**It's a living document.** This is the one people get wrong. The instinct is that a business case is an approval artefact: you write it, it gets signed, the project starts, and it goes in a drawer. That's not the model being examined. It is reviewed at defined points across the life cycle, and the question at each review is not "did we approve this" but "is this still worth doing, given what we now know."

That second point is where the five-mark questions live.

## Why "still worth doing" is the whole idea

A project approved on a set of assumptions will, some months in, be running against different assumptions. Costs move. The market moves. The organisation reprioritises. Benefits that looked certain start looking optimistic.

The purpose of keeping the business case current is to make it possible to stop. An organisation that cannot cancel a project it no longer needs will keep spending on it, because the alternative feels like admitting a mistake. A live business case reframes that: cancelling isn't failure, it's the governance process working.

Here's the shape of it in practice. A refurbishment programme is approved on the basis that consolidating three buildings into two saves a defined annual sum. Eighteen months in, the organisation has shifted to hybrid working and the occupancy assumptions underneath that saving no longer hold. The delivery is on schedule and on budget. However, the benefit it was funded to produce has largely evaporated.

A project reporting only on time and cost looks healthy right up to the point it delivers something nobody needed. That's the scenario a business case question is usually testing you against.

## What the case actually weighs

The comparison is not simply cost against benefit. It's whole-life cost against benefit, over the period the benefits are realised.

Whole-life means the cost of running, maintaining and eventually replacing the thing, not just the cost of building it. A cheaper option to deliver can be the more expensive option to own, and a business case that stops at capital cost will pick the wrong one.

Benefits need to be measurable, with a baseline. "Improved efficiency" is not a benefit you can hold anyone to. "Reduces average processing time from twelve days to five" is, because someone can check.

Risks belong in the case too, because the justification has to survive contact with what might go wrong. And the do-nothing option is a real option that should be evaluated honestly rather than included as a straw man to make the preferred option look inevitable.

## The distinction to have ready

**Business case:** the justification for the investment. Owned by the sponsor. Answers whether the project should happen and continue.

**Benefits management plan:** how the expected benefits will actually be realised and measured, including after the project closes. It hangs off the business case rather than replacing it.

The relationship is worth being able to state cleanly, because it's a natural question and a lot of answers blur the two.

## How to answer a five-mark question on this

Look at what the question asks for and mirror it. If it asks you to explain why the business case is reviewed through the life cycle, you need reasons, separated so a marker can count them.

Something like: assumptions change over time; continued investment must remain justified; it enables a decision to stop; it keeps benefits visible when delivery pressure crowds them out. Four distinct points, each stated plainly, each with a sentence of expansion. That structure is easy to mark and easy to award marks against.

Compare that with one dense paragraph containing all four ideas woven together. Same knowledge, harder to mark, fewer marks awarded in practice.

Essentially: know who owns it, know it stays alive, and know why being able to stop a project is a feature rather than an admission.`,
  faqs: [
    {
      question: "What does the APM PMQ expect you to know about the business case?",
      answer:
        "That it justifies the investment through whole-life costs against measurable benefits, that the sponsor owns it, and that it's reviewed across the life cycle so continued investment stays justified. Recall of contents alone won't carry a five-mark answer.",
    },
    {
      question: "How is the business case tested in the exam?",
      answer:
        "Usually through scenarios asking you to explain or justify rather than define. Common framings include why it's reviewed at defined points, who is accountable for it, and what should happen when the benefits underpinning it no longer look achievable.",
    },
    {
      question: "What's the difference between a business case and a benefits management plan?",
      answer:
        "The business case is the justification for the investment, owned by the sponsor. The benefits management plan sets out how the expected benefits will be realised and measured, often continuing after the project closes. The plan supports the case rather than replacing it.",
    },
    {
      question: "Who owns the business case, the sponsor or the project manager?",
      answer:
        "The sponsor. The project manager typically drafts and maintains it and supplies the evidence, but accountability for the investment and for the benefits being realised sits with the sponsor.",
    },
  ],
});
