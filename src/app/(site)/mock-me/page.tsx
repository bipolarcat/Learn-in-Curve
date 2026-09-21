import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FREE_MOCK_EXAM_IDS, FREE_MOCK_EXAMS } from "@/lib/free-mock/config";
import type { FreeMockExamId } from "@/lib/free-mock/types";
import styles from "./MockMePage.module.css";

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
  },
};

/**
 * Illustrations not used on the homepage catalogue / lab feature tiles.
 * PMQ + PFQ use unused course-card art; PMP uses the overview feature plate.
 */
const CARD_ART: Record<
  FreeMockExamId,
  { src: string; alt: string; objectPosition?: string }
> = {
  "apm-pmq": {
    src: "/brand/Courses/pmq-in-5-days-card.png",
    alt: "PMQ study illustration",
    objectPosition: "center 35%",
  },
  "apm-pfq": {
    src: "/brand/Courses/pfq-notify-me.png",
    alt: "PFQ study illustration",
    objectPosition: "center 45%",
  },
  pmp: {
    src: "/brand/features/overviews.webp",
    alt: "PMP study illustration",
    objectPosition: "center 40%",
  },
};

/** Hub card titles only — short `mark` stays for the exam runner chrome. */
const CARD_MARK: Record<FreeMockExamId, string> = {
  "apm-pmq": "APM - PMQ",
  "apm-pfq": "APM - PFQ",
  pmp: "PMI - PMP",
};

export default function MockMeHubPage() {
  return (
    <div className={styles.page}>
      <div className="wrap">
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
            const art = CARD_ART[examId];
            return (
              <li key={examId}>
                <Link href={exam.path} className={styles.card}>
                  <div className={styles.art}>
                    <Image
                      src={art.src}
                      alt={art.alt}
                      fill
                      sizes="(max-width: 39.99rem) 92vw, 18rem"
                      className={styles.artImage}
                      style={
                        art.objectPosition
                          ? { objectPosition: art.objectPosition }
                          : undefined
                      }
                      priority={examId === "apm-pmq"}
                    />
                  </div>
                  <div className={styles.meta}>
                    <h2 className={styles.mark}>{CARD_MARK[examId]}</h2>
                    <p className={styles.count}>
                      {exam.questionCount} questions
                    </p>
                    <span className={styles.cta}>
                      <span className={styles.ctaLabel}>Start mock</span>
                      <span className={styles.ctaDisc} aria-hidden>
                        <svg
                          className={styles.ctaArrow}
                          viewBox="0 0 16 16"
                          fill="none"
                          width="14"
                          height="14"
                        >
                          <path
                            d="M3.5 8h9M8.5 4l4 4-4 4"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
