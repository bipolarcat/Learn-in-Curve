import { scaffoldLibraryPage } from "../scaffold";

export const page = scaffoldLibraryPage({
  slug: "apm-pmq-breakdown-structures",
  title: "APM PMQ breakdown structures: what you need to know",
  metaTitle: "APM PMQ Breakdown Structures: PBS, WBS, OBS, CBS and RAM | Learn in Curve",
  metaDescription:
    "Breakdown structures for the APM PMQ: product versus work breakdown structure, what a work package is, how a RAM combines WBS and OBS, and how RACI is examined.",
  group: "syllabus",
  related: [
    "apm-pmq-scheduling-and-critical-path",
    "apm-pmq-project-life-cycles",
    "apm-pmq-change-control",
  ],
  status: "published",
  updatedAt: "2026-08-19",
  answerFirst:
    "A product breakdown structure sets out what the project delivers. A work breakdown structure sets out the work needed to create it. Everything else, including cost, organisation and responsibility, hangs off those two.",
  body: `Breakdown structures are the most mechanical topic on the syllabus and one of the most reliably rewarding, because the distinctions are precise and the exam asks for them precisely.

## Product first, then work

The **product breakdown structure** decomposes the output. It answers what the project is going to deliver, broken down into components, with no verbs in it.

The **work breakdown structure** decomposes the work required to produce those products. It answers what has to be done.

The order matters and is examined. You cannot sensibly plan work until you know what you are producing. Candidates who describe a WBS as a list of activities have skipped a step, because a WBS built without a PBS behind it tends to capture the work someone remembered rather than all of the work the output requires.

The lowest level of a WBS is a **work package**: a chunk of work small enough to be estimated, assigned to one owner and controlled as a unit.

## The 100 per cent rule

A breakdown structure should capture all of the scope and nothing outside it. Every level sums to the level above.

This sounds pedantic and is quietly the most useful thing on the topic. It is what lets you say later that something is out of scope, because it is not in the structure, and that is a scope argument with evidence rather than a memory of a conversation.

## The other two structures

The **organisational breakdown structure** decomposes who is involved: teams, functions, suppliers.

The **cost breakdown structure** decomposes the money, in a way that maps onto the work rather than onto the finance department's habits.

## The responsibility assignment matrix

A RAM is what you get when you cross the WBS with the OBS. Work packages down one axis, people or teams across the other, and the intersections say who is doing what.

**RACI** is the common notation. Responsible does the work. Accountable owns the outcome and answers for it. Consulted gives input before the decision. Informed is told afterwards.

The rule that carries marks: **there is exactly one A per row.** Two accountable people means nobody is accountable, and a scenario describing an argument over who owns a failure is usually a RACI question wearing a costume.

## A worked example

Take a refurbishment of a floor of a working office building, delivered while the floor below stays occupied.

The PBS says what is being produced: fitted workspaces, a rebuilt services layer, a finished meeting suite, and the commissioning evidence that lets the client accept it.

The WBS then decomposes the work under each of those. Under the services layer sits strip-out, containment, first fix, second fix, testing and commissioning. Testing and commissioning becomes a work package: one owner, one estimate, one deliverable and a defined completion.

The OBS names who is involved, including the mechanical subcontractor and the client's own facilities team, who are not part of the project organisation but control access.

The RAM then makes the awkward thing explicit. Out-of-hours access is Responsible to the main contractor and Accountable to the client's facilities lead, because the contractor cannot grant themselves access to a building the client operates. Writing that down before the work starts is the difference between a planning assumption and a three-week delay.

However, the structures produce none of that on their own. They produce it because building them forces the conversation about who does what while there is still time to change the answer.

## Why the exam cares

Breakdown structures feed almost everything downstream. You estimate at work package level. You schedule at work package level. You control cost at work package level. You assess a change request by asking which work packages it touches.

Essentially: build the PBS before the WBS, know that a work package is the unit of estimating and control, remember the 100 per cent rule, and when a scenario describes confusion over who owns something, reach for a RAM with one accountable name per row.`,
  faqs: [
    {
      question: "What does the APM PMQ cover on breakdown structures?",
      answer:
        "Product, work, organisational and cost breakdown structures, the definition and purpose of a work package, how a responsibility assignment matrix is produced from the work and organisational structures, and how these feed estimating, scheduling and control.",
    },
    {
      question: "What is the difference between a PBS and a WBS?",
      answer:
        "A product breakdown structure decomposes what the project delivers. A work breakdown structure decomposes the work required to deliver it. The product structure normally comes first, because the work cannot be defined until the output is.",
    },
    {
      question: "What is a work package?",
      answer:
        "The lowest level of the work breakdown structure. It is a piece of work small enough to be estimated, assigned to a single owner and controlled as a unit, which is why it becomes the basis for scheduling and cost control.",
    },
    {
      question: "What is a responsibility assignment matrix?",
      answer:
        "A matrix that crosses the work breakdown structure with the organisational breakdown structure so that every work package has named responsibility. RACI is the usual notation, and each row should carry exactly one accountable party.",
    },
    {
      question: "Why does the 100 per cent rule matter?",
      answer:
        "Because a structure that captures all of the scope and nothing beyond it gives you an evidenced basis for saying what is in and out of scope later, which is what makes change control and scope arguments resolvable.",
    },
  ],
});
