import Link from "next/link";
import { pmqMockHref } from "@/lib/pmq/constants";
import styles from "@/components/pmq/PmqCommandWords.module.css";
import resourceStyles from "@/components/pmq/PmqMoreResources.module.css";

const INCLUDED_ITEMS = [
  {
    title: "24 Learning Objectives",
    body: "Every APM PMQ learning objective covered in structured study notes.",
    icon: "📖",
  },
  {
    title: "Interactive Quizzes",
    body: "Test your knowledge after each LO with exam-style questions and instant feedback.",
    icon: "💡",
  },
  {
    title: "Full Mock Exam",
    body: "40-question timed mock paper mirroring the real APM PMQ format.",
    icon: "🏆",
  },
  {
    title: "Common Misconceptions",
    body: "Know what trips candidates up and why the right answer is right.",
    icon: "✕",
  },
  {
    title: "Exam Techniques",
    body: "Command word guidance and examiner tips built into every LO.",
    icon: "🎯",
  },
  {
    title: "Memory Aids",
    body: "Flashcard-style memory aids for key concepts.",
    icon: "💭",
  },
];

const COMMAND_WORD_GROUPS = [
  {
    type: "Multiple response",
    verbs: "Select, Choose",
    action: "Pick the correct option or combination.",
  },
  {
    type: "Select from list",
    verbs: "Select, Choose",
    action: "Choose the option that completes the text.",
  },
  {
    type: "Short response",
    verbs: "Give, List, State, Provide, Identify",
    action: "A single word, phrase, or short list.",
  },
  {
    type: "Long response",
    verbs: "Differentiate",
    action: "Explain how the areas differ.",
  },
  {
    type: "Long response",
    verbs: "Describe, Explain",
    action: "Give key characteristics, qualities or events.",
  },
  {
    type: "Long response",
    verbs: "Interpret",
    action: "Explain the meaning in the given context.",
  },
  {
    type: "Long response",
    verbs: "Outline",
    action: "Give the main points or characteristics.",
  },
];

const GLOBAL_FURTHER_READING = [
  {
    title: "APM Body of Knowledge, 8th Edition",
    body: "The official reference behind APM’s foundation and practitioner syllabuses.",
    href: "https://www.apm.org.uk/book-shop/apm-body-of-knowledge-8th-edition/",
    linkLabel: "Visit website →",
    icon: "📚",
  },
  {
    title: "APM Glossary",
    body: "Official A–Z of project management terms used across APM qualifications.",
    href: "https://www.apm.org.uk/resources/glossary/",
    linkLabel: "Open glossary →",
    icon: "📖",
  },
  {
    title: "Parallel Project Training: PMQ 2024 Podcast Series",
    body: "Free podcast series covering all learning objectives.",
    href: "https://www.parallelprojecttraining.com/podcast/apm-project-management-qualification-pmq-2024-podcast-series/",
    linkLabel: "Listen free →",
    icon: "🎧",
  },
];

const PFQ_FURTHER_READING = [
  {
    title: "APM Glossary",
    body: "Official A–Z of project management terms used across APM qualifications.",
    href: "https://www.apm.org.uk/resources/glossary/",
    linkLabel: "Open glossary →",
    icon: "📖",
  },
  {
    title: "APM Body of Knowledge, 8th Edition",
    body: "The official reference behind APM’s foundation and practitioner syllabuses.",
    href: "https://www.apm.org.uk/book-shop/apm-body-of-knowledge-8th-edition/",
    linkLabel: "Visit website →",
    icon: "📚",
  },
];

type FurtherReadingItem = (typeof GLOBAL_FURTHER_READING)[number];

function MoreResourcesPanel({
  headingId,
  items,
}: {
  headingId: string;
  items: readonly FurtherReadingItem[];
}) {
  return (
    <section aria-labelledby={headingId}>
      <div className={resourceStyles.panel} data-more-resources="">
        <div className={resourceStyles.titleBar}>
          <h2 id={headingId} className={resourceStyles.title}>
            More <span className={resourceStyles.titleAccent}>resources</span>
          </h2>
        </div>
        <p className={resourceStyles.lede}>
          Optional extras if you want more depth alongside the course.
        </p>

        <ul className={resourceStyles.list}>
          {items.map((item) => (
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

/** Optional external resources — flat console; title “More resources”. */
export function PmqGlobalFurtherReading() {
  return (
    <MoreResourcesPanel
      headingId="pmq-more-resources-heading"
      items={GLOBAL_FURTHER_READING}
    />
  );
}

/** PFQ learn overview — same chrome as PMQ More resources. */
export function PfqGlobalFurtherReading() {
  return (
    <MoreResourcesPanel
      headingId="pfq-more-resources-heading"
      items={PFQ_FURTHER_READING}
    />
  );
}

export function PmqHeroStats() {
  return (
    <div className="inline-flex flex-wrap items-center gap-2 rounded-full border-2 border-ink bg-paper px-5 py-2.5 font-body text-xs font-bold uppercase tracking-wider text-orange shadow-stickerSm">
      <span>24 learning objectives</span>
      <span className="text-ink/30" aria-hidden>
        ·
      </span>
      <span>100+ quiz questions</span>
      <span className="text-ink/30" aria-hidden>
        ·
      </span>
      <Link
        href="/free-mock-exam/apm-pmq"
        className="hover:text-orange transition-colors"
      >
        Free readiness check
      </Link>
      <span className="text-ink/30" aria-hidden>
        ·
      </span>
      <Link
        href={pmqMockHref()}
        className="hover:text-orange transition-colors"
      >
        Mock exams
      </Link>
    </div>
  );
}

export function PmqWhatsIncluded() {
  /** Kept for preview page; course overview no longer mounts this (2026-07-12). */
  return (
    <section>
      <span className="section-tag">Course contents</span>
      <h2 className="section-title">What&apos;s Included?</h2>
      <p className="section-sub">Everything you need to pass, in one place.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {INCLUDED_ITEMS.map((item) => (
          <article key={item.title} className="ticket-card p-6">
            <span
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gold/15 text-xl mb-4"
              aria-hidden
            >
              {item.icon}
            </span>
            <h3 className="font-display text-xl font-semibold mb-2">
              {item.title}
            </h3>
            <p className="text-[14.5px] leading-relaxed text-ink/75">
              {item.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

/**
 * Examiner command-word reference. Two-column rows: command words left,
 * question type right; action under the verbs.
 */
export function PmqCommandWordsTable() {
  return (
    <section aria-labelledby="pmq-command-words-heading">
      <div className={styles.panel} data-command-words="">
        <div className={styles.titleBar}>
          <h2 id="pmq-command-words-heading" className={styles.title}>
            Command <span className={styles.titleAccent}>words</span>
          </h2>
        </div>
        <p className={styles.lede}>
          Examiners use these words in questions. Know what each one is asking
          for before you write.
        </p>

        <div className={styles.colHead} aria-hidden>
          <span className={styles.colLabel}>Command word</span>
          <span className={styles.colLabel}>Question type</span>
        </div>

        <ul className={styles.list} aria-label="Command words">
          {COMMAND_WORD_GROUPS.map((row, i) => (
            <li key={`${row.type}-${row.verbs}-${i}`} className={styles.row}>
              <div className={styles.left}>
                <p className={styles.verbs}>{row.verbs}</p>
                <p className={styles.action}>{row.action}</p>
              </div>
              <span className={styles.type}>{row.type}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
