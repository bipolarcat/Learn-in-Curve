import type { Metadata } from "next";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { PmqStartLink } from "@/components/PmqStartLink";
import { PmqFaqSection } from "@/components/pmq/PmqFaqSection";
import {
  CtaArrow,
  stampCtaPrimary,
  stampCtaSecondary,
} from "@/components/stamp-chip";
import {
  IconAudio,
  IconCore,
  IconMemory,
  IconMisconceptions,
  IconMock,
  IconPractice,
  IconSly,
  IconVideo,
} from "@/components/pmq/PmqPreviewFeatureIcons";
import {
  PmqPathwayView,
  TrackedOverviewLink,
} from "@/components/course-overview/PmqOverviewTracked";
import { APM_DISCLAIMER } from "@/lib/legal-copy";
import { PMQ_SECTION_COUNT } from "@/lib/pmq/constants";
import {
  buildLoStages,
  LO_STAGE_COUNT,
  PMQ_TOTAL_PROGRESS_UNITS,
} from "@/lib/pmq/lo-stages";
import {
  MOCK_EXAM_QUESTION_COUNT,
  MOCK_EXAM_TOTAL_MARKS,
} from "@/lib/pmq/mock-domain";
import { getPmqPlan, PMQ_OVERVIEW_HREF, PMQ_PRICING_HREF } from "@/lib/pmq/plans";
import { canAccessMedia } from "@/lib/pmq/tiers";
import styles from "@/components/course-overview/CourseMarketing.module.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

const mediaLockedForStarter = !canAccessMedia("starter");
const slyWaitlisted = getPmqPlan("ai_pro").status === "waitlist";
const stages = buildLoStages();

export const metadata: Metadata = {
  title: "PMQ in 5 Days: Course overview | Learn in Curve",
  description: `The PMQ is an application exam, not a memory test. Study content for all ${PMQ_SECTION_COUNT} learning objectives, practice that shows you why you were wrong, and mock papers marked the way the real one is.`,
  alternates: { canonical: `${SITE_URL}${PMQ_OVERVIEW_HREF}` },
  openGraph: {
    title: "PMQ in 5 Days: Course overview | Learn in Curve",
    description: `The PMQ is an application exam, not a memory test. Study content for all ${PMQ_SECTION_COUNT} learning objectives, practice that shows you why you were wrong, and mock papers marked the way the real one is.`,
    url: `${SITE_URL}${PMQ_OVERVIEW_HREF}`,
    type: "website",
  },
};

export default async function PmqMarketingOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isSignedIn = !!user;

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <header>
          <p className={styles.eyebrow}>APM Project Management Qualification</p>
          <h1 className={styles.title}>
            PMQ in <span className="text-orange">5 Days</span>
          </h1>
          <p className={styles.lead}>
            The PMQ is an application exam, not a memory test. Everything here
            is built for that: study content for all {PMQ_SECTION_COUNT}{" "}
            learning objectives, practice that shows you why you were wrong, and
            mock papers marked the way the real one is.
          </p>
          <div className={styles.actions}>
            <PmqStartLink
              isSignedIn={isSignedIn}
              from="pmq"
              className={stampCtaPrimary}
              analyticsLocation="pmq_overview"
            >
              Enrol for Free
            </PmqStartLink>
            <TrackedOverviewLink
              href={PMQ_PRICING_HREF}
              className={stampCtaSecondary}
              variant="See What's Included"
              location="pmq_overview"
            >
              See What&apos;s Included
              <CtaArrow />
            </TrackedOverviewLink>
          </div>
          <p className={styles.note}>
            Free forever. No card. All {PMQ_SECTION_COUNT} learning objectives.
          </p>
        </header>

        <div className={styles.art}>
          <Image
            src="/brand/Courses/pmq-in-5-days.png"
            alt=""
            fill
            sizes="(max-width: 47.99rem) 92vw, 28rem"
            className={styles.artImage}
            priority
          />
        </div>
      </div>

      <section className={styles.pitch} aria-labelledby="pmq-pitch-heading">
        <h2 id="pmq-pitch-heading" className={styles.pitchTitle}>
          Most PMQ revision prepares you for the wrong exam
        </h2>
        <p className={styles.pitchBody}>
          The syllabus reads like a list of things to memorise, so that is
          usually how people revise it. Learn what goes in a business case,
          recite it back. However, very little of the paper asks you what
          something is. It gives you a situation and asks what you would do
          about it. Every question in here is written that way, because that is
          the paper you sit.
        </p>
      </section>

      <section className={styles.featureBlock} aria-labelledby="pmq-features-heading">
        <h2 id="pmq-features-heading" className={styles.sectionTitle}>
          What&apos;s in the course
        </h2>
        <ul className={styles.features}>
          <li className={styles.feature}>
            <IconCore className={styles.featureIcon} />
            <div className={styles.featureHead}>
              <h3 className={styles.featureTitle}>Core study content</h3>
            </div>
            <p className={styles.featureBody}>
              Every one of the {PMQ_SECTION_COUNT} learning objectives, written
              from scratch and aimed at the published syllabus.
            </p>
          </li>
          <li className={styles.feature}>
            <IconPractice className={styles.featureIcon} />
            <div className={styles.featureHead}>
              <h3 className={styles.featureTitle}>1,800+ practice questions</h3>
            </div>
            <p className={styles.featureBody}>
              Across the full course, each one tagged to the objective it tests.
              The free plan starts you with a complete set.
            </p>
          </li>
          <li className={styles.feature}>
            <IconMock className={styles.featureIcon} />
            <div className={styles.featureHead}>
              <h3 className={styles.featureTitle}>
                Mock papers in the real format
              </h3>
            </div>
            <p className={styles.featureBody}>
              <span className={styles.stat}>{MOCK_EXAM_QUESTION_COUNT}</span>{" "}
              questions,{" "}
              <span className={styles.stat}>{MOCK_EXAM_TOTAL_MARKS}</span>{" "}
              marks, sat under exam conditions. Written answers are AI-marked,
              including on the free paper.
            </p>
          </li>
          <li className={styles.feature}>
            <IconMisconceptions className={styles.featureIcon} />
            <div className={styles.featureHead}>
              <h3 className={styles.featureTitle}>Common misconceptions</h3>
            </div>
            <p className={styles.featureBody}>
              The things most candidates get confidently wrong, corrected before
              they cost you marks in the exam.
            </p>
          </li>
          <li className={styles.feature}>
            <IconMemory className={styles.featureIcon} />
            <div className={styles.featureHead}>
              <h3 className={styles.featureTitle}>Memory aids</h3>
            </div>
            <p className={styles.featureBody}>
              Acronyms and hooks for the lists that keep sliding out of your
              head the moment you close the book.
            </p>
          </li>
          <li className={styles.feature}>
            <IconCore className={styles.featureIcon} />
            <div className={styles.featureHead}>
              <h3 className={styles.featureTitle}>Command words, decoded</h3>
            </div>
            <p className={styles.featureBody}>
              State, Explain, Describe, Compare. Each one tells you how many
              marks are on offer and what shape the answer needs.
            </p>
          </li>
          <li className={styles.feature}>
            <IconVideo className={styles.featureIcon} />
            <div className={styles.featureHead}>
              <h3 className={styles.featureTitle}>
                Video overview per objective
              </h3>
              {mediaLockedForStarter ? (
                <span className={styles.chipPro}>Pro</span>
              ) : null}
            </div>
            <p className={styles.featureBody}>
              A recap for every objective, for the days when reading is not
              going to happen.
            </p>
          </li>
          <li className={styles.feature}>
            <IconAudio className={styles.featureIcon} />
            <div className={styles.featureHead}>
              <h3 className={styles.featureTitle}>
                Audio overview per objective
              </h3>
              {mediaLockedForStarter ? (
                <span className={styles.chipPro}>Pro</span>
              ) : null}
            </div>
            <p className={styles.featureBody}>
              The same content to listen to, on the commute or the walk.
            </p>
          </li>
          <li className={styles.feature}>
            <IconSly className={styles.featureIcon} />
            <div className={styles.featureHead}>
              <h3 className={styles.featureTitle}>Sly, your AI tutor</h3>
              {slyWaitlisted ? (
                <span className={styles.chipSoon}>Launching soon</span>
              ) : null}
            </div>
            <p className={styles.featureBody}>
              Reads how you are getting things wrong and points at the objective
              that needs the work. Scoped to the APM PMQ, so revision stays on
              the exam.
            </p>
          </li>
        </ul>
        <p className={styles.qualify}>
          The free plan includes the study content, practice questions, a full
          mock paper, misconceptions and memory aids for all {PMQ_SECTION_COUNT}{" "}
          objectives.
        </p>
      </section>

      <PmqPathwayView
        className={styles.pathway}
        progressUnits={PMQ_TOTAL_PROGRESS_UNITS}
        stageCount={LO_STAGE_COUNT}
      >
        <h2 id="pmq-pathway-heading" className={styles.sectionTitle}>
          What five days actually looks like
        </h2>
        <p className={styles.sectionBody}>
          {PMQ_SECTION_COUNT} learning objectives, each running the same{" "}
          {LO_STAGE_COUNT} stages, with your place saved as you go.
        </p>
        <div className={styles.pathwayTrack}>
          <ol className={styles.pathwayList}>
            {stages.map((stage, index) => (
              <li key={stage.id} className={styles.pathwayStage}>
                <span className={`${styles.pathwayIndex} ${styles.stat}`}>
                  {index + 1} / {LO_STAGE_COUNT}
                </span>
                <p className={styles.pathwayLabel}>{stage.label}</p>
              </li>
            ))}
          </ol>
        </div>
        <p className={styles.pathwayNote}>
          Five days is the pace, not a deadline. Streaks track daily, and
          nothing expires.
        </p>
      </PmqPathwayView>

      <section className={styles.sly} aria-labelledby="pmq-sly-heading">
        <h2 id="pmq-sly-heading" className={styles.sectionTitle}>
          When you want a tutor rather than another question
        </h2>
        <p className={styles.sectionBody}>
          Sly reads how you are getting things wrong and points at the objective
          that needs the work. It stays on the topic in front of you, framed for
          the APM PMQ rather than general chat, so revision does not wander.
        </p>
        <p className={styles.slyStatus}>
          Sly is part of the AI Pro Bundle, which is not on sale yet. You can{" "}
          <TrackedOverviewLink
            href="/"
            className={styles.slyLink}
            variant="try it on the homepage"
            location="pmq_overview_sly"
          >
            try it on the homepage
          </TrackedOverviewLink>{" "}
          without an account.
        </p>
      </section>

      <section className={styles.handoff} aria-labelledby="pmq-pricing-heading">
        <h2 id="pmq-pricing-heading" className={styles.sectionTitle}>
          Start free. Upgrade when you want more
        </h2>
        <p className={styles.sectionBody}>
          The free plan is not a trial and does not expire. Paid bundles are a
          single payment with no subscription and nothing that renews.
        </p>
        <div className={styles.actions}>
          <TrackedOverviewLink
            href={PMQ_PRICING_HREF}
            className={stampCtaSecondary}
            variant="See Plans and Pricing"
            location="pmq_overview_pricing"
          >
            See Plans and Pricing
            <CtaArrow />
          </TrackedOverviewLink>
        </div>
      </section>

      <PmqFaqSection
        leadingItems={[
          {
            question: "Is it actually free?",
            answer: (
              <p>
                Yes. The free plan does not expire and does not ask for a card.
                You get study content for all {PMQ_SECTION_COUNT} learning
                objectives, a full set of practice questions, a complete{" "}
                {MOCK_EXAM_QUESTION_COUNT}-question mock paper, misconceptions
                and memory aids.
              </p>
            ),
          },
          {
            question: "Is this official APM material?",
            answer: (
              <p>
                No. Learn in Curve is not affiliated with or endorsed by APM.
                Everything here is written from scratch and aimed at their
                published syllabus.
              </p>
            ),
          },
          {
            question: "How long do I really need?",
            answer: (
              <p>
                Five days is the pace this is built around, and it assumes you
                are already working in a project environment. Starting from
                further back is fine. Nothing expires and your progress saves.
              </p>
            ),
          },
        ]}
      />

      <div className={styles.close}>
        <h2 className={styles.closeTitle}>
          Find out what you cannot answer yet
        </h2>
        <div className={styles.actions}>
          <PmqStartLink
            isSignedIn={isSignedIn}
            from="pmq"
            className={stampCtaPrimary}
            analyticsLocation="pmq_overview_footer"
          >
            Enrol for Free
          </PmqStartLink>
          <TrackedOverviewLink
            href={PMQ_PRICING_HREF}
            className={stampCtaSecondary}
            variant="See Plans and Pricing"
            location="pmq_overview_footer"
          >
            See Plans and Pricing
            <CtaArrow />
          </TrackedOverviewLink>
        </div>
      </div>

      <p className={styles.legal}>{APM_DISCLAIMER}</p>
    </div>
  );
}
