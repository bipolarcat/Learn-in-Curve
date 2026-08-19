import { scaffoldLibraryPage } from "../scaffold";

export const page = scaffoldLibraryPage({
  slug: "apm-pmq-vs-pfq",
  title: "APM PMQ vs PFQ: which should you take?",
  metaTitle: "APM PMQ vs PFQ: Which Should You Take? | Learn in Curve",
  metaDescription:
    "The real difference between the APM PFQ and PMQ, who each one is for, whether you need the PFQ first, and how the exams differ in format and difficulty.",
  group: "choosing",
  related: [
    "how-hard-is-apm-pmq",
    "apm-pmq-exam-format",
    "is-apm-pmq-worth-it",
  ],
  status: "published",
  updatedAt: "2026-08-08",
  answerFirst:
    "The PFQ tests whether you know the terminology. The PMQ tests whether you can apply it and write the answer out. If you already work in project delivery, the PMQ is usually the right target.",
  body: `These two get compared as though they're rungs on the same ladder, a smaller version and a bigger version of the same thing. They aren't. They test different things, and picking between them is mostly a question of what you already do all day.

## What each one is actually testing

The **PFQ** (Project Fundamentals Qualification) is about vocabulary and awareness. Do you know what a business case is for, what a life cycle looks like, what distinguishes a risk from an issue. It's an entry qualification, and it's designed to be sat by people who are new to the discipline or who work alongside it without running projects themselves.

The **PMQ** (Project Management Qualification) assumes you have the vocabulary and asks what you'd do with it. Its paper is 40 questions and 90 marks, and 50 of those marks come from ten long typed responses worth five marks each. Those questions describe a situation and ask you to explain, justify or recommend.

That's the whole difference in one line: the PFQ asks whether you recognise the right answer. The PMQ asks you to produce it.

## The format gap is bigger than the content gap

People preparing to step up focus on the extra syllabus content. However, the thing that actually catches them out is the writing.

The PMQ paper runs 2.5 hours, split into two parts with an optional break of up to 30 minutes. Once you submit Part 1 you cannot go back to it. And ten of those questions want five marks' worth of structured written argument, produced under time pressure, in a text box.

If you've come from a qualification where you selected answers rather than composed them, that's a genuinely new skill, and it carries over half of your result. Coming from the PFQ, expect the content to feel familiar and the format to feel unfamiliar.

## Do you need the PFQ before the PMQ?

No. The PFQ is not a prerequisite for the PMQ, and plenty of people go straight to the PMQ.

Whether you *should* is a different question, and it comes down to one thing: how much of your working week is actually spent on project delivery.

**Go straight to the PMQ** if you already run projects, or work inside a project team, and you meet business cases, schedules, risk registers and stakeholder maps in your normal work. You aren't learning this material, you're learning what the APM calls it. Going via the PFQ adds a fee, a sitting and several weeks to reach a qualification that employers weight less heavily.

**Consider the PFQ first** if you're moving into project management from a different discipline, or you support projects without running them, or the terminology in the PMQ syllabus is genuinely unfamiliar rather than just formally worded. Starting at the harder exam and failing is more expensive than starting at the right one and passing.

There's also a middle route worth naming. The PFQ is a reasonable, low-stakes way to confirm you actually want to do this before committing to the bigger qualification, particularly if someone else is paying and the sequencing doesn't cost you anything personally.

## Where the syllabus differs in emphasis

One thing that surprises people stepping up: the PMQ leans heavily towards people and delivery. Area C (people and behaviours) is 25 to 35% of the paper, and Area D (planning and managing deployment) is 30 to 40%. Together that's the majority of your marks.

If your mental model of a project management exam is planning, scheduling and cost, you'll under-prepare for leadership, teams, conflict, communication and ethics, all of which are examined and all of which appear in those five-mark written questions where judgement is what's being marked.

## Essentially

If you're already doing the job, take the PMQ. The PFQ will teach you words you mostly know.

If you're arriving from outside project delivery, the PFQ is a sensible first step and there's no prize for skipping it.

Either way, the thing to prepare for in the PMQ isn't more content. It's writing ten structured answers in two and a half hours.`,
  faqs: [
    {
      question: "Do I need the APM PFQ before taking the PMQ?",
      answer:
        "No. The PFQ is not a prerequisite for the PMQ and many candidates go straight to the PMQ, particularly if they already work in project delivery.",
    },
    {
      question: "How much harder is the PMQ than the PFQ?",
      answer:
        "The step up is in kind rather than volume. The PFQ tests recognition of terminology. The PMQ tests applied judgement, and 50 of its 90 marks come from ten long typed answers written under time pressure.",
    },
    {
      question: "Which qualification do employers prefer?",
      answer:
        "The PMQ carries more weight because it evidences applied capability rather than awareness. The PFQ is best understood as an entry point rather than a competing option.",
    },
    {
      question: "Is the PFQ a waste of time if I'm going to do the PMQ anyway?",
      answer:
        "Not necessarily, but it's an extra fee and an extra sitting. If you already work in project delivery it usually is skippable. If you're moving in from another discipline, it's a low-stakes way to build the vocabulary the PMQ assumes you have.",
    },
  ],
});
