import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PmqStartLink } from "@/components/PmqStartLink";
import {
  CtaArrow,
  stampCtaPrimary,
  stampCtaSecondary,
} from "@/components/stamp-chip";
import {
  IconCore,
  IconMock,
  IconPractice,
} from "@/components/pmq/PmqPreviewFeatureIcons";
import { APM_DISCLAIMER } from "@/lib/legal-copy";
import {
  PMQ_OVERVIEW_HREF,
  PMQ_PRICING_HREF,
  planFeatureValue,
} from "@/lib/pmq/plans";
import styles from "@/components/course-overview/CourseMarketing.module.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

const PRACTICE = planFeatureValue("starter", "practice");
const MOCKS = planFeatureValue("starter", "mock");

export const metadata: Metadata = {
  title: "PMQ in 5 Days — Course overview | Learn in Curve",
  description:
    "Practice questions and mock exams mapped to all 24 APM PMQ learning objectives. Start free, upgrade only if you need more.",
  alternates: { canonical: `${SITE_URL}${PMQ_OVERVIEW_HREF}` },
  openGraph: {
    title: "PMQ in 5 Days — Course overview | Learn in Curve",
    description:
      "Practice questions and mock exams mapped to all 24 APM PMQ learning objectives. Start free, upgrade only if you need more.",
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
            Practice questions and mock exams mapped to every learning
            objective — the fastest way to find what you still cannot answer.
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
            <Link href={PMQ_PRICING_HREF} className={stampCtaSecondary}>
              View Plans
              <CtaArrow />
            </Link>
          </div>
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

      <ul className={styles.features}>
        <li className={styles.feature}>
          <IconPractice className={styles.featureIcon} />
          <h2 className={styles.featureTitle}>{PRACTICE} practice questions</h2>
          <p className={styles.featureBody}>
            Start free with a full practice set. Pro adds more questions for
            every learning objective.
          </p>
        </li>
        <li className={styles.feature}>
          <IconMock className={styles.featureIcon} />
          <h2 className={styles.featureTitle}>
            {MOCKS} mock exam to start
          </h2>
          <p className={styles.featureBody}>
            Sit a paper in exam conditions. Upgrade for extra mocks when you
            want more reps.
          </p>
        </li>
        <li className={styles.feature}>
          <IconCore className={styles.featureIcon} />
          <h2 className={styles.featureTitle}>All 24 learning objectives</h2>
          <p className={styles.featureBody}>
            Core study content for the whole PMQ syllabus — mapped to the
            practice and the mocks.
          </p>
        </li>
      </ul>

      <div className={styles.actions}>
        <PmqStartLink
          isSignedIn={isSignedIn}
          from="pmq"
          className={stampCtaPrimary}
          analyticsLocation="pmq_overview_footer"
        >
          Enrol for Free
        </PmqStartLink>
        <Link href={PMQ_PRICING_HREF} className={stampCtaSecondary}>
          View Plans
          <CtaArrow />
        </Link>
      </div>

      <p className={styles.legal}>{APM_DISCLAIMER}</p>
    </div>
  );
}
