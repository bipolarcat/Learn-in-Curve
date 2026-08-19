import { scaffoldLibraryPage } from "../scaffold";

export const page = scaffoldLibraryPage({
  slug: "how-hard-is-apm-pmq",
  title: "How hard is the APM PMQ really?",
  metaTitle: "How Hard Is the APM PMQ? An Honest Answer | Learn in Curve",
  metaDescription:
    "The APM PMQ isn't hard because the content is difficult. It's hard because most people prepare for a memory test and sit an application test. Here's the difference.",
  group: "exam-prep",
  related: [
    "apm-pmq-pass-mark",
    "apm-pmq-exam-format",
    "how-long-to-revise-for-apm-pmq",
  ],
  status: "published",
  updatedAt: "2026-08-08",
  answerFirst:
    "The content isn't difficult. The APM PMQ is hard because most people revise it as a memory test and then sit an application test, where 50 of the 90 marks come from ten written answers about scenarios they've never seen.",
  body: `Nobody fails the PMQ because they couldn't understand a business case. The concepts in this syllabus are not intellectually demanding, and if you work in project delivery you already meet most of them every week under different names.

The difficulty is somewhere else, and it's structural.

## The exam you prepare for versus the exam you sit

The syllabus reads like a list of things to know. Twenty-four learning objectives, each with a set of topics underneath. So people revise it the way the document is shaped: learn what a business case contains, learn the stages of a life cycle, learn the difference between a risk and an issue. Recite, check, move on.

Then the paper arrives, and 50 of the 90 marks are ten questions worth five marks each, none of which ask what something is. They give you a situation and ask what you would do about it, or why a particular approach suits it, or what would go wrong if you didn't.

That is a completely different skill from recall, and it's the one almost nobody rehearses.

Take risk. Knowing that a risk register records identified risks with owners and mitigations is worth close to nothing on this paper. What gets marked is whether you can look at a project where the supplier submission is due three weeks before a foundation pour, recognise that as a schedule risk with a hard downstream dependency, and explain what you'd put in place before it materialises.

I've watched exactly that scenario play out on a real programme. The risk was logged early, presented to the client, monitored weekly. It materialised anyway. However, because it had been anticipated, the fallback was already agreed: split the submission so the critical foundation element went in on time and the rest followed. The risk register did not prevent anything. The thinking around it did.

That distinction, between knowing the artefact and knowing what it's for, is roughly what separates a comfortable pass from a near miss.

## The two genuinely hard bits

**Writing under time pressure.** You have 2.5 hours, and ten of those questions want five marks' worth of structured written argument each. If you have not practised producing that in the time available, you will run out of clock. People rarely fail on knowledge. They fail on the last three long answers being noticeably thinner than the first three.

**Area C.** People and behaviours is 25 to 35% of the paper, and Area D, planning and managing deployment, is another 30 to 40%. Candidates from technical or engineering backgrounds routinely underestimate the people half. Leadership, teams, conflict, communication and ethics are not a soft add-on here. On a given paper they can carry more marks than the whole of Areas A and B combined.

If your instinct is that a project management exam will mostly be planning and cost control, that instinct will cost you marks.

## What makes it easier than people expect

Three things sit in your favour.

The pass mark is not fixed. It's set per paper using a modified Angoff method, so being handed a harder version doesn't punish you. A nastier paper carries a lower threshold.

There's no negative marking, and the guidance is to attempt every question. A partial answer to a five-mark question beats a blank one every time.

And a borderline fail, meaning within three marks of the pass mark, is automatically re-marked without you asking.

## So, how hard is it?

Compared to the PFQ it's a significant step up, and not mainly because there's more content. The PFQ asks whether you know the vocabulary. The PMQ asks whether you can use it, and it asks you to type the answer.

If you're working in project delivery and you give it a properly structured run at it, it's very passable. Essentially the whole thing turns on one decision: whether you spend your revision recognising answers or producing them.

Practising multiple choice feels productive because you can see your score climbing. However, those 20 questions are worth 20 marks. Ten written answers are worth 50. Weight your preparation the way the paper weights its marks, and it gets a great deal less hard.`,
  faqs: [
    {
      question: "Is the APM PMQ harder than the PFQ?",
      answer:
        "Yes, and the step up is in kind rather than volume. The PFQ tests whether you know the terminology. The PMQ tests whether you can apply it to a scenario and write the answer out, with 50 of the 90 marks coming from ten long typed responses.",
    },
    {
      question: "What do people find hardest about the exam?",
      answer:
        "Two things. Producing ten structured five-mark written answers inside 2.5 hours, and the weighting towards people and behaviours, which is 25 to 35% of the paper and often underestimated by candidates from technical backgrounds.",
    },
    {
      question: "Can I pass with a short revision window?",
      answer:
        "It depends entirely on your starting point. Someone already working in project delivery is revising to recognise familiar things under exam names, which is very different from learning the material cold. What matters more than the number of days is whether you spend them practising written application rather than drilling multiple choice.",
    },
    {
      question: "Do I need project management experience to pass?",
      answer:
        "It isn't required, but it helps a great deal, because the paper rewards judgement about realistic situations rather than recall of definitions. Without that experience you'll need to build the same instinct through worked scenarios and practice questions.",
    },
  ],
});
