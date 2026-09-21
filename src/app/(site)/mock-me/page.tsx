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

export default function MockMeHubPage() {
  return (
    <div className={styles.page}>
      <div className="wrap">
        <header className={styles.header}>
          <h1 className={styles.title}>
            Mock <span className="text-orange">Me</span>
          </h1>
          <p className={styles.lead}>
            A short mock exam that scores you and shows which topics to revise.
            No sign-up, no payment.
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
                    <h2 className={styles.mark}>{exam.mark}</h2>
                    <p className={styles.count}>
                      {exam.questionCount} questions
                    </p>
                    <span className={styles.cta}>
                      Start
                      <span className={styles.ctaArrow} aria-hidden>
                        →
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
