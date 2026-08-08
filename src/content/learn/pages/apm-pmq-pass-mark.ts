import { scaffoldLearnPage } from "../scaffold";

export const page = scaffoldLearnPage({
  slug: "apm-pmq-pass-mark",
  title: "What's the APM PMQ pass mark?",
  metaTitle: "APM PMQ Pass Mark: Why There Isn't a Fixed Number | Learn in Curve",
  metaDescription:
    "The APM PMQ pass mark changes between exam papers. Here's how it's set, why 50 of the 90 marks sit in ten questions, and what a borderline fail actually means.",
  group: "exam-prep",
  sampleQuestionLos: [],
  related: [
    "apm-pmq-exam-format",
    "how-hard-is-apm-pmq",
    "how-long-to-revise-for-apm-pmq",
  ],
  status: "published",
  updatedAt: "2026-08-08",
  answerFirst:
    "There isn't a fixed one. The APM PMQ pass mark changes from paper to paper, set using a modified Angoff method so that a harder version of the exam doesn't penalise you. The maximum score is 90 marks.",
  body: `Almost every search for this expects a percentage back. Sixty per cent, seventy, something you can write on a sticky note and revise towards. The APM doesn't work that way, and the reason is worth understanding, because it changes how you should prepare.

Every sitting of the PMQ uses a different paper. Those papers are not identical in difficulty, no matter how carefully they're written. So rather than fixing the pass mark and letting your luck depend on which version you're handed, the APM sets the mark per paper using a modified Angoff method. In plain terms: subject experts work through the actual questions and judge what a borderline-competent candidate would score on that specific paper. The threshold moves so the standard stays still.

There are two practical consequences.

The first is that chasing a number is the wrong target. You cannot revise to 62%, because 62% might be a pass on one paper and a fail on another. What you can do is aim comfortably clear of the boundary, wherever it lands.

The second is more encouraging. If you're handed a genuinely brutal paper, you have not been handed a harder exam. You've been handed a paper with a lower threshold. That's the whole point of the method, and it's worth knowing on the day, because the moment you think "this version is nastier than the practice ones" is exactly the moment people start rushing.

## Where the marks actually are

However, the far more useful question is not what the pass mark is. It's where the marks live, because the answer is lopsided and most candidates revise as though it isn't.

The paper is 40 questions and 90 marks, split like this:

- 20 multiple response questions, 1 mark each, 20 marks
- 5 select from list questions, 2 marks each, 10 marks
- 5 short typed responses, 2 marks each, 10 marks
- 10 long typed responses, 5 marks each, 50 marks

Look at the bottom row. Ten questions carry 50 of the 90 marks available. Just over half your result comes from a quarter of the paper, and every one of those is something you have to write out.

Meanwhile the 20 multiple response questions, which is where most people spend most of their revision time because they're the easiest thing to practise, are worth 20 marks between them. All of them together are worth less than four long responses.

That's the single biggest misallocation I see. People drill multiple choice until they're scoring well, walk in feeling ready, and then meet ten written questions worth five marks each that they've barely rehearsed.

## What "borderline" means

If you finish within three marks of the pass mark on the wrong side of it, your paper is automatically re-marked. You don't request it and you don't pay for it.

This is a genuinely good piece of news and almost nobody mentions it. It doesn't mean a near miss becomes a pass, because the second marker may well agree with the first. It does mean the process has a deliberate check built in for exactly the situation where a single marking judgement decides your result.

It also tells you something about how the marks are awarded. A five-mark written answer is not marked on a vibe. There are specific points available, and a marker is looking for them. Which brings us to the thing that decides whether you get them.

## Write so the marks can be found

The instruction that matters most: structure your answer in an order that reflects the instructions in the question.

If a question asks you to explain three benefits, the marker is looking for three benefits. If your answer is one continuous paragraph that contains all three somewhere inside it, you're relying on the marker to go digging. Sometimes they will find everything. Sometimes they won't, and you'll lose marks on knowledge you genuinely had.

Two smaller things worth knowing. The size of the answer box is a signal: it indicates the expected length, so a large box is telling you five marks' worth of content is wanted, not two lines. And the text box supports basic formatting (bold, italics, alignment, indentation), which means you can lay an answer out so the structure is visible at a glance rather than buried in prose.

## So what do you actually do with this

Essentially, stop revising towards a percentage and start revising towards the shape of the paper.

Practise writing five-mark answers under time pressure. Practise structuring them in the order the question asks for. Get comfortable with the fact that over half your marks come from ten questions where you have to produce the words yourself, not recognise them in a list.

The pass mark will be whatever it is on the day. What you can control is whether the marker can find your marks.`,
  faqs: [
    {
      question: "Is the APM PMQ pass mark a fixed percentage?",
      answer:
        "No. It's set separately for each exam paper using a modified Angoff method, where subject experts judge what a borderline-competent candidate would score on that specific set of questions. This keeps the standard consistent even though papers vary in difficulty.",
    },
    {
      question: "What happens if I miss the pass mark by a few marks?",
      answer:
        "A borderline fail, meaning within three marks of the pass mark, is automatically re-marked. You don't have to request it. The second marker may agree with the first, so it isn't a guaranteed reprieve, but the check is built into the process.",
    },
    {
      question: "Does every paper have the same pass mark?",
      answer:
        "No, and that's deliberate. Different versions of the exam are not identical in difficulty, so the threshold moves to keep the standard the same. A harder paper carries a lower pass mark.",
    },
    {
      question: "What is the maximum score on the APM PMQ?",
      answer:
        "90 marks, across 40 questions. Fifty of those 90 marks come from ten long typed responses worth five marks each.",
    },
  ],
});
