import Link from "next/link";
import { FaqAccordion } from "@/components/FaqAccordion";
import { CtaArrow } from "@/components/stamp-chip";
import { PFQ_TRAP_SCHOOL_HREF } from "@/lib/pfq/constants";
import { PFQ_TRAP_SCHOOL } from "@/lib/pfq/trap-school-content";
import commandStyles from "@/components/pmq/PmqCommandWords.module.css";
import resourceStyles from "@/components/pmq/PmqMoreResources.module.css";

const FURTHER_READING = [
  {
    title: "APM Body of Knowledge, 8th Edition",
    body: "Official reference mapped by the PFQ handbook to each learning objective.",
    href: "https://www.apm.org.uk/book-shop/apm-body-of-knowledge-8th-edition/",
    linkLabel: "Visit website →",
  },
  {
    title: "APM Project Fundamentals Qualification",
    body: "APM's public page for the PFQ syllabus, handbook, and exam booking.",
    href: "https://www.apm.org.uk/qualifications-and-training/project-fundamentals-qualification-pfq/",
    linkLabel: "Visit website →",
  },
];

/**
 * Format-risk slot (PMQ command-words equivalent). Trap School teaser only.
 */
export function PfqTrapSchoolTeaser() {
  return (
    <section aria-labelledby="pfq-trap-teaser-heading">
      <div className={commandStyles.panel} data-trap-teaser="">
        <div className={commandStyles.titleBar}>
          <h2 id="pfq-trap-teaser-heading" className={commandStyles.title}>
            Format <span className={commandStyles.titleAccent}>traps</span>
          </h2>
        </div>
        <p className={commandStyles.lede}>{PFQ_TRAP_SCHOOL.why.body}</p>
        <div className="px-3 pb-4 sm:px-4">
          <Link
            href={PFQ_TRAP_SCHOOL_HREF}
            className="inline-flex min-h-8 items-center gap-1 rounded-xl border border-ink/12 bg-transparent px-3 text-[12.5px] font-semibold text-ink/80 no-underline transition-colors duration-150 hover:bg-ink/[0.04]"
          >
            Open Trap School
            <CtaArrow className="!h-2.5 !w-2.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function PfqFurtherReading() {
  return (
    <section aria-labelledby="pfq-more-resources-heading">
      <div className={resourceStyles.panel} data-more-resources="">
        <div className={resourceStyles.titleBar}>
          <h2 id="pfq-more-resources-heading" className={resourceStyles.title}>
            More <span className={resourceStyles.titleAccent}>resources</span>
          </h2>
        </div>
        <p className={resourceStyles.lede}>
          Optional extras if you want more depth alongside the course.
        </p>
        <ul className={resourceStyles.list}>
          {FURTHER_READING.map((item) => (
            <li key={item.title} className={resourceStyles.item}>
              <h3 className={resourceStyles.itemTitle}>{item.title}</h3>
              <p className={resourceStyles.itemBody}>{item.body}</p>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={resourceStyles.itemLink}
              >
                {item.linkLabel}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function PfqFaqSection() {
  return (
    <FaqAccordion
      items={[
        {
          question: "What is the APM Project Fundamentals Qualification?",
          answer: (
            <p>
              The PFQ is APM&apos;s foundation-level, knowledge-based
              qualification. It covers the published learning outcomes for
              project fundamentals and is assessed by a 60-question multiple
              choice exam.
            </p>
          ),
        },
        {
          question: "How is the exam structured?",
          answer: (
            <p>
              Sixty questions, one mark each, sixty minutes, four options.
              Delivered online in Surpass. Every sitting covers every published
              learning outcome exactly once (LO 10.4 twice). There is no
              sampling.
            </p>
          ),
        },
        {
          question: "Is there negative marking?",
          answer: (
            <p>
              No. Unanswered questions score zero. APM advises guessing when you
              are unsure.
            </p>
          ),
        },
        {
          question: "What is the pass mark?",
          answer: (
            <p>
              Fixed at 36 out of 60 (60%) for every sitting. It does not vary
              between papers.
            </p>
          ),
        },
        {
          question: "Is Learn in Curve an APM Accredited Training Provider?",
          answer: (
            <p>
              No. We do not sell, administer, or invigilate the APM PFQ exam.
              This course is independent revision material aimed at the
              published syllabus.
            </p>
          ),
        },
      ]}
      headingId="pfq-faqs-heading"
      title="FAQs"
      subtitle="Frequently asked questions"
      defaultOpenIndex={null}
      idPrefix="pfq-faq"
    />
  );
}
