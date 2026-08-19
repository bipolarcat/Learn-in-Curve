import { scaffoldLibraryPage } from "../scaffold";

export const page = scaffoldLibraryPage({
  slug: "apm-pmq-project-life-cycles",
  title: "APM PMQ project life cycles: what you need to know",
  metaTitle: "APM PMQ Project Life Cycles: Linear, Iterative and Hybrid | Learn in Curve",
  metaDescription:
    "Life cycles for the APM PMQ: linear versus iterative versus hybrid, what gate reviews are for, and the difference between a project, extended and product life cycle.",
  group: "syllabus",
  related: [
    "apm-pmq-governance",
    "apm-pmq-breakdown-structures",
    "apm-pmq-exam-format",
  ],
  status: "published",
  updatedAt: "2026-08-19",
  answerFirst:
    "A life cycle is the set of phases a project moves through from start to handover. The PMQ tests whether you can choose between linear, iterative and hybrid for a given situation and justify the choice.",
  body: `Life cycles look like the easiest topic on the syllabus and produce some of the weakest answers, because candidates learn the phase names and stop there. Naming the phases is worth very little. Saying which life cycle suits a described project, and why, is where the marks sit.

## The phases, briefly

A linear life cycle moves through **concept**, where the idea is tested and an outline case is made, then **definition**, where the plan and the business case are developed in detail, then **deployment**, where the work is actually done, then **transition**, where the output is handed over and accepted.

That is the spine. What matters more is what each phase is deciding.

## Project, extended and product life cycles

Three terms that look similar and are examined as a distinction.

The **project life cycle** ends at handover. The output exists and has been accepted.

The **extended life cycle** carries on past handover into benefits realisation, because an output that nobody uses has produced no benefit and the investment was justified on benefits.

The **product life cycle** is longer still. It covers the whole operational life of the thing, including its eventual decommissioning or disposal.

The reason this appears in scenarios: a sponsor asking whether the project succeeded is usually asking an extended life cycle question, and answering it with "we delivered on time" is answering the wrong one.

## Linear, iterative, hybrid

**Linear** works through the phases in sequence, defining the output up front and then building it. It suits work where the requirements are stable and well understood, where the cost of change later is high, and where the output is physical.

**Iterative** repeats cycles of design, build and review, producing something usable early and refining it. It suits work where requirements are uncertain, where users cannot describe what they want until they see something, and where change is cheap.

**Hybrid** applies both to different parts of the same project.

However, the exam almost never gives you a clean case. It gives you a project with a fixed regulatory deadline and half-formed user requirements, and the marks are in the reasoning rather than the label.

## Gate reviews

A gate review sits between phases and asks a decision, not a status question: does this project still justify continuing, and is it ready for the next phase?

Three outcomes are worth naming in an answer. Proceed. Proceed with conditions. Stop.

Stop is the one candidates omit and the one that makes governance real. A gate that can only say yes is a formality.

## A worked example

Take a project replacing a customer-facing booking system in an organisation that also has to refit twelve physical service desks to match it.

A weak answer picks one life cycle for the whole thing.

A stronger answer splits it. The software is a good iterative candidate: the users cannot fully specify what they need in advance, early releases will produce better requirements than a workshop will, and changing software is comparatively cheap. The desk refit is a good linear candidate: the design has to be fixed before anything is manufactured, the work is physical, and changing it after installation is expensive and disruptive.

Then it names the consequence, which is where the better marks are. A hybrid needs a defined integration point, so the desk design has to be frozen at the moment the software's core interaction model is stable, and that freeze becomes a gate rather than an assumption.

## Choosing, and defending the choice

You've got four questions that will carry most scenario answers on this topic. How well are the requirements understood now. How expensive is change later. How much does the customer need to see something before they can decide. And is there a fixed external date that constrains everything else.

Essentially: learn the phases once, then spend your revision time on the choice. The exam is testing whether you can look at a described project and say which life cycle fits it, what that decision costs you, and where the gates go.`,
  faqs: [
    {
      question: "What does the APM PMQ cover on life cycles?",
      answer:
        "The phases of a linear life cycle, the differences between linear, iterative and hybrid approaches, how to select an approach for a given context, the purpose of gate reviews, and the distinction between project, extended and product life cycles.",
    },
    {
      question: "What is the difference between a project life cycle and an extended life cycle?",
      answer:
        "A project life cycle ends at handover, when the output has been delivered and accepted. An extended life cycle continues past handover into benefits realisation, because the investment was justified on benefits rather than on outputs.",
    },
    {
      question: "When would you choose an iterative life cycle over a linear one?",
      answer:
        "When requirements are uncertain, when users need to see something before they can say what they want, and when the cost of changing the output is low. Linear suits stable requirements and expensive change, which is typical of physical work.",
    },
    {
      question: "What is a gate review for?",
      answer:
        "It is a decision point between phases. It asks whether the project still justifies continuing and whether it is ready for the next phase. The available outcomes include stopping, which is what makes a gate a control rather than a formality.",
    },
    {
      question: "How are life cycle questions framed in the exam?",
      answer:
        "Usually as a described project with mixed characteristics, asking which approach you would use and why. Answers that name a life cycle without justifying it against the specifics of the scenario tend to score poorly.",
    },
  ],
});
