import { scaffoldLibraryPage } from "../scaffold";

export const page = scaffoldLibraryPage({
  slug: "how-to-answer-apm-pmq-exam-questions",
  title: "How to answer APM PMQ exam questions",
  metaTitle: "How to Answer APM PMQ Exam Questions: Marks Per Point and Command Words | Learn in Curve",
  metaDescription:
    "Exam technique for the APM PMQ: how to work out marks per point, what each command word is asking for, why half the marks are in the justification, and a worked five-mark answer.",
  group: "exam-prep",
  related: [
    "apm-pmq-exam-format",
    "how-hard-is-apm-pmq",
    "apm-pmq-pass-mark",
  ],
  status: "published",
  updatedAt: "2026-08-19",
  answerFirst:
    "Divide the marks by the number of things the question asks for. That gives you marks per point. One mark per point wants a short fact. More than one wants the fact plus a reason tied to the scenario.",
  body: `Sixty of the 90 marks on the APM PMQ come from answers you type yourself, and 50 of those sit in ten long-response questions. Technique is not a finishing touch on this paper. It is most of the paper.

The good news is that the technique is mechanical once you see it, and almost nobody revises it.

## Work out the marks per point first

Before writing anything, read the question and count two numbers: the marks available, and the number of discrete things being asked for.

Divide one by the other. That is your marks per point, and it tells you what shape the answer needs.

Real papers behave consistently here. Explain the purpose of each of five steps, for five marks, is one mark per purpose. State two review points, for two marks, is one mark per point. In both cases a short, correct, specific sentence collects the mark, and anything beyond it is unpaid work.

**One mark per point means write a sentence and move on.** The single most expensive habit in this exam is writing a paragraph where a sentence was worth one mark, then running short on a five-mark question later.

## When there is more than one mark per point

This is where the marks actually live, and where most candidates leave them.

If a question offers five marks for two things, you are being paid roughly two and a half marks per thing. You cannot earn that with a definition. The extra marks are there for justification.

Accredited providers describe the split as basic understanding and further understanding, worth roughly half each. Basic understanding is naming the thing correctly. Further understanding is saying why it matters, in this scenario, for this project.

The practical version: after every point you make, write the word **because**, and finish the sentence with something from the scenario in front of you. If you cannot finish it, you have written a definition and stopped halfway.

## The command words

The instruction verb tells you what kind of answer is being bought.

**State** wants a short factual answer, typically one mark for each item.

**Explain** wants the point and the reasoning behind it.

**Describe** wants an account with the relevant characteristics, not a bare name.

**Compare** wants similarities and differences, which means an answer that only lists features of both has not compared anything.

One caveat, because it affects how much weight to put on any command-word list you find online. APM publishes a command-words document that does not define "State" at all, yet real PMQ papers use it. Treat command words as a guide to the shape of the answer, and the marks-per-point calculation as the thing that sizes it.

## A claim doing the rounds that is simply wrong

You will find guidance saying that explain, describe and differentiate questions are always worth ten marks per point, and state or outline questions five marks per point.

That is not the PMQ. Those figures belong to an accounting exam that shares the initials, and applying them here produces enormous answers to questions worth five marks in total. Count the marks and divide.

## Structure so the marks can be found

The answer box supports basic formatting, and it is worth using. Separate your points, number them when the question asked for a specific number, and answer in the order it asks. If it wants three benefits and one limitation, write three benefits then one limitation. A marker reading a dense paragraph has to hunt for your points, and a point that cannot be found does not score, even when you knew it.

However, the constraint underneath all of this is time. You have 150 minutes for 90 marks, so spending time in proportion to marks gives you roughly eight minutes for each five-mark question and under two minutes for each one-mark one. That is a planning guide rather than a rule, and its real use is as a warning: if you are ten minutes into a five-mark answer, the problem is not the question.

There is no negative marking, so attempt everything. A half-formed answer scores more than a blank one, and a blank one scores exactly nothing.

## A worked five-mark answer

Take a question worth five marks: explain two benefits of engaging stakeholders early, on a project where the client's operations team was introduced eight weeks into delivery.

Five marks, two benefits, so about two and a half marks each. That is a fact plus a reason, twice, with a little room to spare.

A weak answer: early engagement improves communication and reduces risk. Both true, both worth about a mark, and the answer has finished at two out of five.

A stronger answer names the benefit and then pays off the because. Early engagement surfaces requirements while they can still be changed cheaply, because this operations team's access constraints affect a deployment sequence that has already been planned. And it builds commitment from the people who have to accept the output, because a team that first sees the design eight weeks in has every reason to challenge it and no ownership of it.

Same knowledge. The difference is that the second one connects each point to the scenario on the page.

Essentially: count the marks, divide by the points asked for, write a sentence when it is one mark and a fact-plus-because when it is more, structure it so a marker can find it, and never spend five-mark effort on a one-mark question.`,
  faqs: [
    {
      question: "How many marks is each point worth on the APM PMQ?",
      answer:
        "It depends on the question. Divide the marks available by the number of discrete things asked for. There is no fixed mark value per command word, despite guidance online claiming otherwise.",
    },
    {
      question: "What does an explain question want that a state question does not?",
      answer:
        "Reasoning. State wants a short factual answer, usually one mark per item. Explain wants the point and why it matters, and on this paper the justification is typically worth around half the marks available for that point.",
    },
    {
      question: "How long should an APM PMQ long-response answer be?",
      answer:
        "Long enough to make the number of points the marks pay for, with justification where there is more than one mark per point. The size of the answer box is a deliberate hint from the examiner about the expected length.",
    },
    {
      question: "Should I attempt questions I am unsure about?",
      answer:
        "Yes. There is no negative marking on the APM PMQ, so a partial answer can score and a blank one cannot. This matters most in Part 1, because those answers are locked once you submit that part.",
    },
    {
      question: "How should I split my time in the exam?",
      answer:
        "Roughly in proportion to the marks. With 150 minutes for 90 marks, that works out at about eight minutes for a five-mark question and under two minutes for a one-mark one. Use it as a warning signal rather than a stopwatch.",
    },
  ],
});
