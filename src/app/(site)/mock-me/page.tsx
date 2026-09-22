import type { Metadata } from "next";
import Link from "next/link";
import { FREE_MOCK_EXAM_IDS, FREE_MOCK_EXAMS } from "@/lib/free-mock/config";
import type { FreeMockExamId } from "@/lib/free-mock/types";
import { MockMeExamCard } from "@/components/MockMeExamCard";
import { SoftNavBackLink } from "@/components/SoftNavBackLink";
import { parseSoftNavFrom, SOFT_NAV_BACK } from "@/lib/soft-nav-back";
import styles from "./MockMePage.module.css";
import { ogImages, twitterImages } from "@/lib/seo/og";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

const PAGE_TITLE = "Mock Me - Free PMQ, PFQ and PMP Readiness Checks";
const PAGE_DESCRIPTION =
  "Pick a free readiness check: APM PMQ, APM PFQ, or PMP. No account required.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/mock-me` },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/mock-me`,
    type: "website",
    ...ogImages(SITE_URL),
  },
  twitter: {
    ...twitterImages(SITE_URL),
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

/**
 * Hub card art — character-only plates (no baked marketing copy).
 */
const CARD_ART: Record<
  FreeMockExamId,
  {
    src: string;
    alt: string;
    objectPosition?: string;
    /** `contain` = full plate; `zoom` = between contain and cover. */
    objectFit?: "cover" | "contain" | "zoom";
  }
> = {
  "apm-pmq": {
    src: "/brand/mock-me/pmq.png",
    alt: "Bear writing a timed mock exam",
    objectPosition: "center 45%",
  },
  "apm-pfq": {
    src: "/brand/mock-me/pfq.png",
    alt: "Wolf and cat high-fiving after study",
    objectPosition: "center center",
    objectFit: "zoom",
  },
  pmp: {
    src: "/brand/mock-me/pmp.png",
    alt: "Dog and rabbit boarding a plane with headphones",
    objectPosition: "center 40%",
  },
};

/** Hub card titles only — short `mark` stays for the exam runner chrome. */
const CARD_MARK: Record<FreeMockExamId, string> = {
  "apm-pmq": "APM - PMQ",
  "apm-pfq": "APM - PFQ",
  pmp: "PMI - PMP",
};

type MockMeHubPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MockMeHubPage({
  searchParams,
}: MockMeHubPageProps) {
  const from = parseSoftNavFrom((await searchParams)?.from);
  // Same soft-nav back as Courses catalogue when arriving from home (hero CTA).
  // Always offer Back to home on this hub so menu/direct visits get it too.
  const back =
    from === "home" || from == null ? SOFT_NAV_BACK.home : SOFT_NAV_BACK[from];

  return (
    <div className={styles.page}>
      <div className="wrap">
        <SoftNavBackLink
          href={back.href}
          label={back.label}
          busyLabel={back.busyLabel}
          className={styles.back}
        />
        <header className={styles.header}>
          <h1 className={styles.title}>
            Mock <span className="text-orange">Me</span>
          </h1>
          <p className={styles.lead}>
            A short mock exam to see where you stand. Get your score and find
            out which topics to revise. No sign-up. No payment.
          </p>
        </header>

        <ul className={styles.grid}>
          {FREE_MOCK_EXAM_IDS.map((examId) => {
            const exam = FREE_MOCK_EXAMS[examId];
            return (
              <li key={examId}>
                <MockMeExamCard
                  href={exam.path}
                  mark={CARD_MARK[examId]}
                  questionCount={exam.questionCount}
                  art={CARD_ART[examId]}
                  priority={examId === "apm-pmq"}
                />
              </li>
            );
          })}
        </ul>

        <p className={styles.coursesLink}>
          Looking for a full course? <Link href="/courses">Browse courses</Link>
        </p>
      </div>
    </div>
  );
}
