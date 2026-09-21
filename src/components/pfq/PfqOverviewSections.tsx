import { FaqAccordion } from "@/components/FaqAccordion";

export function PfqFaqSection() {
  return (
    <FaqAccordion
      items={[
        {
          question: "What is the APM Project Fundamentals Qualification?",
          answer: (
            <p>
              APM&apos;s foundation-level qualification. It tests whether you
              know the vocabulary and the standard structures of project
              management, not whether you can run a project. One 60-question
              multiple-choice exam, no coursework, no interview.
            </p>
          ),
        },
        {
          question:
            "Do I need experience or an accredited course to sit it?",
          answer: (
            <p>
              No. There are no entry requirements. You can study with an APM
              accredited training provider or self-study and book the exam
              directly with APM. APM names self-study as a legitimate route, and
              it is the one this course is built for.
            </p>
          ),
        },
        {
          question: "How long should I study for?",
          answer: (
            <p>
              APM puts the total qualification time at about 25 hours. This
              course is structured as two days because the exam rewards recall
              of definitions and named lists, which responds better to short
              repeated passes than to long reading sessions.
            </p>
          ),
        },
        {
          question: "What happens if I do not know an answer?",
          answer: (
            <p>
              Answer anyway. There is no negative marking, so a guess can only
              help, and an unanswered question is a guaranteed zero. Eliminate
              the options you know are wrong first: most questions come down to
              two plausible ones.
            </p>
          ),
        },
        {
          question: "What is the pass mark, and when do I find out?",
          answer: (
            <p>
              36 out of 60, fixed. Your provisional result appears on screen as
              soon as you submit, with the formal confirmation, certificate and
              digital badge by email within about two weeks.
            </p>
          ),
        },
        {
          question: "Can I resit if I fail?",
          answer: (
            <p>
              Yes, as many times as you need, at a reduced fee, and you can book
              again straight away. Your coverage map from this course shows
              which outcomes to target rather than starting the whole syllabus
              again.
            </p>
          ),
        },
      ]}
      headingId="pfq-faqs-heading"
      title="FAQs"
      defaultOpenIndex={null}
      idPrefix="pfq-faq"
    />
  );
}
