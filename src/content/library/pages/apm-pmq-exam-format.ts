import { scaffoldLibraryPage } from "../scaffold";

export const page = scaffoldLibraryPage({
  slug: "apm-pmq-exam-format",
  title: "What's the APM PMQ exam format?",
  metaTitle: "APM PMQ Exam Format: 40 Questions, 90 Marks, 2.5 Hours | Learn in Curve",
  metaDescription:
    "The full APM PMQ format: two parts, four question types, where the 90 marks sit, and how the syllabus is weighted. Plus the rule about Part 1 that catches people out.",
  group: "exam-prep",
  related: [
    "apm-pmq-pass-mark",
    "how-hard-is-apm-pmq",
    "how-long-to-revise-for-apm-pmq",
  ],
  status: "published",
  updatedAt: "2026-08-08",
  answerFirst:
    "The APM PMQ is 2.5 hours, taken online through the Surpass platform with remote proctoring. It's 40 questions worth 90 marks in total, split into two parts with an optional break of up to 30 minutes between them.",
  body: `Most format guides stop at "40 questions, 2.5 hours" and leave you no better prepared than before. The bits that actually affect how you sit the paper are further down, so here is the whole thing.

## The shape of the sitting

You take it online through the Surpass platform, remotely proctored, so you can sit it from home or an office rather than travelling to a test centre.

It runs 2.5 hours and is split into two parts, with an optional break of up to 30 minutes in between. The break is worth planning for rather than deciding about on the day: two and a half hours of writing is genuinely tiring, and the quality of a five-mark answer written by a fatigued brain is noticeably worse than one written twenty minutes after a coffee.

However, there is one rule here that catches people out every sitting, and it's the single most important thing on this page.

**Once you submit Part 1, you cannot go back and edit those answers.**

Not during the break. Not later if you have time spare at the end. It's closed. So the habit some people carry from other exams, skim the whole thing, answer what you know, come back at the end, does not work here across the two parts. Whatever you leave incomplete in Part 1 stays incomplete.

The related advice from the APM is blunt and worth taking literally: attempt every question. There's no negative marking. A partial answer to a five-mark question is worth more than a blank one, and a blank one is worth exactly nothing.

## Where the 90 marks sit

Four question types, and they are not evenly weighted:

| Type | Number | Marks each | Total |
|---|---|---|---|
| Multiple response | 20 | 1 | 20 |
| Select from list | 5 | 2 | 10 |
| Short response (typed) | 5 | 2 | 10 |
| Long response (typed) | 10 | 5 | 50 |

Fifty of the 90 marks come from ten questions. That's 56% of your result produced by a quarter of the paper, and all of it typed out by you from scratch.

The 20 multiple response questions, by contrast, are worth 20 marks between them. They are also the easiest thing in the world to revise, which is precisely the trap. It is very possible to spend three weeks feeling productive drilling multiple choice, and walk into a paper where over half the marks are waiting in a format you have barely rehearsed.

If you take one thing from this page: your revision time should be weighted roughly the way the marks are.

## How the syllabus is weighted

The four syllabus areas do not get equal airtime either:

| Area | Learning objectives | Share of the paper |
|---|---|---|
| A. Setting up for success | 1 to 4 | 15 to 20% |
| B. Preparing for change | 5 to 9 | 15 to 20% |
| C. People and behaviours | 10 to 15 | 25 to 35% |
| D. Planning and managing deployment | 16 to 24 | 30 to 40% |

Areas C and D together account for somewhere between 55% and 75% of the paper. People and behaviours alone can be up to 35%.

That surprises a lot of candidates from technical backgrounds, and it surprised me. The instinct is that a project management exam will be mostly planning, scheduling, cost and risk. Area D does cover a lot of that. But leadership, teams, communication, conflict and ethics are not a soft add-on to this syllabus. On a given paper they can be worth more than the whole of Areas A and B combined.

## Writing the long answers

Since 50 marks depend on it, the mechanics are worth knowing.

The answer box size indicates the expected length. Treat it as a hint from the examiner about how much content a full-mark answer contains. A large box on a five-mark question is telling you that two lines will not do it.

The text box supports basic formatting: font size, bold, italic, underline, alignment, indent. Use it. An answer with three clearly separated points is easier to mark than the same content as one dense paragraph, and easier to mark means more of your marks actually get awarded.

Structure your answer in the order the question asks for. If it says explain three benefits and describe one limitation, then three benefits followed by one limitation is the structure. Disjointed answers make it hard for a marker to find the points, and marks that cannot be found are marks you do not get, even when the knowledge was there.

## Essentially

Two and a half hours, two parts, no going back after Part 1, and just over half the marks sitting in ten typed answers weighted towards people and deployment.

Prepare for that paper, rather than the one you imagine from the syllabus contents page.`,
  faqs: [
    {
      question: "How many questions are on the APM PMQ?",
      answer:
        "40 questions worth 90 marks in total: 20 multiple response (1 mark each), 5 select from list (2 marks each), 5 short typed responses (2 marks each), and 10 long typed responses (5 marks each).",
    },
    {
      question: "Can I go back and change my Part 1 answers?",
      answer:
        "No. Once you submit Part 1 those answers are locked, including during the break and at the end of the exam. Finish Part 1 properly before submitting it.",
    },
    {
      question: "What question types appear on the paper?",
      answer:
        "Four: multiple response, select from list, short typed response and long typed response. The two typed formats carry 60 of the 90 marks between them.",
    },
    {
      question: "Where do I sit the APM PMQ?",
      answer:
        "Online, through the Surpass platform with remote proctoring, so you can sit it from home or an office rather than travelling to a test centre.",
    },
    {
      question: "Is there a break in the middle?",
      answer:
        "Yes, an optional break of up to 30 minutes between Part 1 and Part 2. Plan for it rather than deciding on the day, because answer quality drops noticeably when you are tired.",
    },
  ],
});
