import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PfqStartLink } from "@/components/pfq/PfqStartLink";
import { PfqPlanCards } from "@/components/pfq/PfqPlanCards";
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
import { PFQ_ATP_DISCLAIMER } from "@/lib/legal-copy";
import { getPfqTier } from "@/lib/pfq/entitlement";
import {
  formatPfqPriceGbp,
  PFQ_LEARN_HREF,
  PFQ_PRICING_HREF,
} from "@/lib/pfq/constants";
import styles from "@/components/course-overview/CourseMarketing.module.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

const PRICE = formatPfqPriceGbp();

export const metadata: Metadata = {
  title: `PFQ in 2 Days — Course overview | Learn in Curve`,
  description: `59 lessons, 306 practice questions, and a full mock mapped to every APM PFQ learning outcome. Pro Bundle ${PRICE}.`,
  alternates: { canonical: `${SITE_URL}/pfq` },
  openGraph: {
    title: `PFQ in 2 Days — Course overview | Learn in Curve`,
    description: `59 lessons, 306 practice questions, and a full mock mapped to every APM PFQ learning outcome. Pro Bundle ${PRICE}.`,
    url: `${SITE_URL}/pfq`,
    type: "website",
  },
};

export default async function PfqLandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const tier = await getPfqTier(supabase, user?.id);
  const hasPro = tier === "pro";

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <header>
          <p className={styles.eyebrow}>
            APM Project Fundamentals Qualification
          </p>
          <h1 className={styles.title}>
            PFQ in <span className="text-orange">2 Days</span>
          </h1>
          <p className={styles.lead}>
            A lesson, practice questions, and a mock for every published
            learning outcome — so you can see exactly which ones you cannot
            answer yet.
          </p>
          {/*
            Three states, because an existing PMQ learner is not a new visitor.
            Sending someone who already has an account to a sign-up page (or to
            a PMQ dashboard that says nothing about PFQ) is the dead end this
            branch exists to prevent.
          */}
          <div className={styles.actions}>
            {hasPro ? (
              <Link href={PFQ_LEARN_HREF} className={stampCtaPrimary}>
                Continue the course
                <CtaArrow />
              </Link>
            ) : user ? (
              <Link href={PFQ_PRICING_HREF} className={stampCtaPrimary}>
                Unlock the full course
                <CtaArrow />
              </Link>
            ) : (
              <>
                <PfqStartLink
                  isSignedIn={false}
                  from="pfq"
                  className={stampCtaPrimary}
                  analyticsLocation="pfq_overview"
                >
                  Enrol for Free
                </PfqStartLink>
                <Link href={PFQ_PRICING_HREF} className={stampCtaSecondary}>
                  View Plans
                  <CtaArrow />
                </Link>
              </>
            )}
          </div>
          <p className={styles.note}>
            {hasPro
              ? "You have the Pro Bundle. Lessons, practice, the mock and Trap School are all unlocked."
              : user
                ? "You are signed in. PFQ unlocks on this same account, one payment, no subscription and no second sign-up."
                : "Create an account free. The course itself unlocks with Pro — one payment, no subscription."}
          </p>
        </header>

        <div className={styles.art}>
          <Image
            src="/brand/Courses/pfq-in-2-days.png"
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
          <IconCore className={styles.featureIcon} />
          <h2 className={styles.featureTitle}>59 lessons</h2>
          <p className={styles.featureBody}>
            One for every learning outcome in the APM syllabus, split across
            two days.
          </p>
        </li>
        <li className={styles.feature}>
          <IconPractice className={styles.featureIcon} />
          <h2 className={styles.featureTitle}>306 practice questions</h2>
          <p className={styles.featureBody}>
            Each tagged to the outcome it tests, with why the right answer is
            right.
          </p>
        </li>
        <li className={styles.feature}>
          <IconMock className={styles.featureIcon} />
          <h2 className={styles.featureTitle}>Full mock + coverage map</h2>
          <p className={styles.featureBody}>
            A 60-question paper, then a map of which outcomes you can answer
            and which you cannot.
          </p>
        </li>
      </ul>

      <section className={styles.plans} id="plans" aria-labelledby="pfq-plans">
        <h2 id="pfq-plans" className={styles.plansTitle}>
          Plans for PFQ in <span className="text-orange">2 Days</span>
        </h2>
        <PfqPlanCards isSignedIn={!!user} hasPro={hasPro} />
      </section>

      <p className={styles.legal}>
        For context: the APM exam itself currently costs £278.40 for
        non-members, booked and paid separately with APM. This course prepares
        you for it. It is not the exam and it is not a qualification.
      </p>
      <p className={styles.legal}>{PFQ_ATP_DISCLAIMER}</p>
    </div>
  );
}
