import { MarkdownBlock } from "@/components/pmq/MarkdownBlock";
import { MisconceptionsList } from "@/components/pmq/MisconceptionsList";
import { MemoryAidsList } from "@/components/pmq/MemoryAidsList";
import { PfqCheckpointList } from "@/components/pfq/PfqCheckpointList";
import type { PfqObjectiveLesson } from "@/lib/pfq/content";
import { pfqOutcomeDisplayTitle } from "@/lib/pfq/outcome-titles";
import styles from "@/components/pfq/PfqObjectiveLesson.module.css";

type Props = {
  lesson: PfqObjectiveLesson;
  checklistState: number[];
  completed: boolean;
};

/**
 * PFQ objective lesson page.
 * Reuses PMQ MarkdownBlock / MisconceptionsList / MemoryAidsList.
 * Does not reuse LoStudyJourney (PMQ multi-stage pathway).
 * Never receives source_confidence.
 */
export function PfqObjectiveLessonView({
  lesson,
  checklistState,
  completed,
}: Props) {
  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <p className={styles.kicker}>
          Day {lesson.day} · Objective {lesson.objective_number} ·{" "}
          {lesson.exam_coverage_note}
        </p>
        <h1 className={styles.title}>{lesson.title}</h1>
        <p className={styles.apm}>{lesson.apm_learning_objective}</p>
      </header>

      <section className={styles.section} aria-labelledby="where-fits">
        <h2 id="where-fits" className={styles.sectionTitle}>
          Where this fits
        </h2>
        <p className={styles.prose}>{lesson.where_this_fits}</p>
      </section>

      <section className={styles.section} aria-labelledby="key-defs">
        <h2 id="key-defs" className={styles.sectionTitle}>
          Key definitions
        </h2>
        <dl className={styles.defList}>
          {lesson.key_definitions.map((d) => (
            <div key={d.term} className={styles.defItem}>
              <dt className={styles.defTerm}>{d.term}</dt>
              <dd className={styles.defGloss}>
                <span className={styles.defLabel}>In plain English</span>
                {d.plain_english}
              </dd>
              <dd className={styles.defFormal}>
                <span className={styles.defLabel}>Definition</span>
                {d.definition}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={styles.section} aria-labelledby="core">
        <h2 id="core" className={styles.sectionTitle}>
          Core content
        </h2>
        <div className={styles.coreStack}>
          {lesson.core_content.map((block) => (
            <section
              key={block.outcome_code}
              id={block.outcome_code}
              className={styles.outcome}
              aria-labelledby={`heading-${block.outcome_code}`}
            >
              <h3
                id={`heading-${block.outcome_code}`}
                className={styles.outcomeTitle}
              >
                <span className={styles.outcomeCode}>{block.outcome_code}</span>
                {block.outcome_title ||
                  pfqOutcomeDisplayTitle(block.outcome_code)}
              </h3>
              <p className={styles.takeaway}>
                <span className={styles.takeawayLabel}>Key takeaway</span>
                {block.key_takeaway}
              </p>
              <MarkdownBlock
                content={block.body_markdown}
                className="pmq-markdown--learn-core"
              />
              <aside className={styles.watchFor}>
                <p className={styles.watchLabel}>Watch for</p>
                <p className={styles.watchBody}>{block.watch_for}</p>
              </aside>
            </section>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="misconceptions">
        <h2 id="misconceptions" className={styles.sectionTitle}>
          Common misconceptions
        </h2>
        <MisconceptionsList items={lesson.misconceptions} />
      </section>

      <section className={styles.section} aria-labelledby="memory">
        <h2 id="memory" className={styles.sectionTitle}>
          Memory aids
        </h2>
        <MemoryAidsList items={lesson.memory_aids} />
      </section>

      <section className={styles.section} aria-labelledby="checkpoint">
        <h2 id="checkpoint" className={styles.sectionTitle}>
          Progress checkpoint
        </h2>
        <p className={styles.checkpointLead}>
          Tick when you can do each of these. Completing every item marks this
          objective done. Self-assessment stays off the coverage map — that
          number only moves when you answer practice or mock questions.
        </p>
        <PfqCheckpointList
          objective={lesson.objective_number}
          items={lesson.progress_checkpoint}
          initialCompleted={checklistState}
          initiallyComplete={completed}
        />
      </section>
    </article>
  );
}
