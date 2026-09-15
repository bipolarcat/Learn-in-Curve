"use client";

import { FaqAccordion, type FaqAccordionItem } from "@/components/FaqAccordion";

const FAQ_ITEMS = [
  {
    question: "What is the APM Project Management Qualification?",
    answer: (
      <p>
        The APM Project Management Qualification (PMQ) is a knowledge-based,
        internationally recognised certification offered by the{" "}
        <a
          href="https://www.apm.org.uk/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Association for Project Management (APM)
        </a>{" "}
        – the UK&apos;s chartered body for the project profession. It
        demonstrates your ability to understand and apply project management
        principles across a wide range of environments, from individual
        assignments to large-scale capital projects.
      </p>
    ),
  },
  {
    question: "Who is this certification for?",
    answer: (
      <p>
        The PMQ is ideal for professionals already working in a project
        environment – typically those with 2–3 years of experience – or those
        pursuing a project management degree or apprenticeship. It is the perfect
        next step after the APM Project Fundamentals Qualification (PFQ) if you
        want to deepen your expertise rather than focus on a single methodology.
      </p>
    ),
  },
  {
    question: "How does it help your career?",
    answer: (
      <p>
        PMQ demonstrates to employers that you have a comprehensive
        understanding of project management. It provides a strong foundation
        towards becoming a Chartered Project Professional (ChPP), the
        profession&apos;s highest standard. The qualification is respected
        across sectors globally and equips you with practical skills in risk,
        resource, stakeholder, commercial and people management.
      </p>
    ),
  },
  {
    question: "What is the exam format?",
    answer: (
      <p>
        The exam format is explained in detail in the Exam Essentials section
        above.
      </p>
    ),
  },
  {
    question: "How do I book my exam?",
    answer: (
      <p>
        You can book directly through the{" "}
        <a
          href="https://www.apm.org.uk/qualifications-and-training/qualifications-find-out-more/open-exams/#pmq"
          target="_blank"
          rel="noopener noreferrer"
        >
          APM exam booking page
        </a>{" "}
        or via an accredited training provider. Self-study candidates can book
        an Open Online Exam directly on the APM website. Most candidates book
        through a training provider, which typically includes structured
        coursework and study materials.
      </p>
    ),
  },
];

/**
 * Flat FAQ accordion. The five items above are locked qualification copy.
 * Pass `leadingItems` for extra product questions on the public overview only.
 */
export function PmqFaqSection({
  leadingItems = [],
}: {
  leadingItems?: FaqAccordionItem[];
}) {
  return (
    <FaqAccordion
      items={[...leadingItems, ...FAQ_ITEMS]}
      headingId="pmq-faqs-heading"
      title="FAQs"
      subtitle="Frequently asked questions"
      defaultOpenIndex={null}
      idPrefix="pmq-faq"
    />
  );
}
