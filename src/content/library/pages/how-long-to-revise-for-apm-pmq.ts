import { scaffoldLibraryPage } from "../scaffold";

export const page = scaffoldLibraryPage({
  slug: "how-long-to-revise-for-apm-pmq",
  title: "How long should I revise for the APM PMQ?",
  metaTitle: "How Long to Revise for the APM PMQ | Learn in Curve",
  metaDescription:
    "How much revision the APM PMQ actually needs, how to weight your time to match where the 90 marks sit, and when to sit your first mock exam.",
  group: "exam-prep",
  sampleQuestionLos: [],
  related: [
    "how-hard-is-apm-pmq",
    "apm-pmq-exam-format",
    "is-apm-pmq-worth-it",
  ],
  status: "published",
  updatedAt: "2026-08-08",
  answerFirst:
    "There's no single number, because it depends on whether you already work in project delivery. What matters more is how you spend it: 50 of the 90 marks come from written answers, so most revision should be writing, not reading.",
  body: `The honest answer is that the question is slightly the wrong one. Two people can both revise for three weeks and walk out with completely different results, because one spent it reading the syllabus and the other spent it writing five-mark answers against the clock.

So here is the useful version: how much time, given where you're starting from, and what you should actually be doing with it.

## Where you're starting from

**Already working in project delivery.** You are not learning this material. You are learning what it's called and how the APM frames it. You'll meet business cases, risk registers, stakeholder maps and change control under exam names and recognise most of them. Your work is mapping what you already do onto the syllabus vocabulary, then practising the written format.

**New to project management, or coming from an adjacent role.** You're doing both jobs at once, learning the concepts and learning the exam. That's a materially bigger task and it needs materially more time.

**Coming from the PFQ.** You have the vocabulary already, which is a genuine head start on Areas A and B. However, the PFQ did not ask you to write anything, so the ten long responses are entirely new ground.

## Where your hours should go

Whatever total you land on, weight it the way the paper weights its marks:

| Type | Questions | Marks | Share |
|---|---|---|---|
| Multiple response | 20 | 20 | 22% |
| Select from list | 5 | 10 | 11% |
| Short typed | 5 | 10 | 11% |
| Long typed | 10 | 50 | **56%** |

Over half your result comes from ten questions you have to write out. So over half your revision should be writing answers out.

Almost nobody does this. Practice questions are satisfying because the score goes up and you can see progress. Writing a five-mark answer, then honestly marking whether a stranger could find three distinct points in it, is slower, duller and much more useful.

The same weighting applies across the syllabus. Area C, people and behaviours, is 25 to 35% of the paper. Area D, planning and managing deployment, is 30 to 40%. Together they're the majority of your marks. Areas A and B are 15 to 20% each. Revising all 24 learning objectives with equal intensity means overspending on roughly a third of the paper.

## A workable shape

Whether this fits in one week or six, run it in this order:

**First, a diagnostic.** Sit something exam-shaped before you revise anything. It feels premature and it is genuinely uncomfortable, but it tells you which learning objectives are weak, which stops you spending week one on the topics you already knew. Nearly everyone revises what they enjoy revising unless a score tells them otherwise.

**Then, targeted content.** Work your weak learning objectives, weighted towards Areas C and D. Do not read the syllabus end to end in order. It is not a book and reading it that way is the least efficient use of your time available.

**Then, written practice.** This is the part that gets cut when time runs short, and it's the part carrying 56% of the marks. Write full five-mark answers. Time them. Structure them in the order the question asks for. Check that the points are separable rather than buried in a paragraph.

**Finally, a full mock under real conditions.** 2.5 hours, two parts, no notes, no pausing. Not the day before, because you need time to act on what it shows you. Roughly a week out is about right.

## On revising in five days

I built a five-day plan, so I have an obvious interest here, and I'd rather be straight about what it is.

Five days is intense, and it works for people who already do this job and need structure, sequencing and written practice rather than teaching from scratch. It is not a shortcut around the written answers, and it is not a promise. If you're new to project management, five days is not the right frame and I'd say so before you paid for anything.

What a short window forces is prioritisation, which is why it works when it works. You cannot read everything in five days, so you stop trying to, and you spend the time on the marks that matter.

Essentially: pick a window that's honest about your starting point, then spend most of it writing rather than reading. The candidates who run out of time in the exam are almost never the ones who ran out of knowledge.`,
  faqs: [
    {
      question: "Is five days enough to revise for the APM PMQ?",
      answer:
        "For someone already working in project delivery who needs structure and written practice rather than teaching from scratch, a focused five days can work. If you're new to project management, it isn't a realistic window. Either way it depends far more on how the time is spent than on the number of days.",
    },
    {
      question: "Should I revise all 24 learning objectives equally?",
      answer:
        "No. Area C (people and behaviours) is 25 to 35% of the paper and Area D (planning and managing deployment) is 30 to 40%, while Areas A and B are 15 to 20% each. Equal intensity across all 24 objectives overspends on roughly a third of the marks.",
    },
    {
      question: "When should I sit a mock exam in my revision plan?",
      answer:
        "Twice. Something exam-shaped at the very start as a diagnostic, so you revise your actual weak areas rather than your favourite ones, and a full 2.5-hour mock about a week before the real thing, leaving time to act on the result.",
    },
    {
      question: "How much of my revision should be written practice?",
      answer:
        "Roughly half, because ten long typed responses carry 50 of the 90 marks. Most candidates spend far more time on multiple response questions, which are worth 20 marks in total.",
    },
  ],
});
