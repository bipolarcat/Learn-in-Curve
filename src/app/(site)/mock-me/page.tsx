import type { Metadata } from "next";
import Link from "next/link";
import { stampCtaPrimary } from "@/components/stamp-chip";
import { FREE_MOCK_EXAM_IDS, FREE_MOCK_EXAMS } from "@/lib/free-mock/config";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

const PAGE_TITLE = "Mock Me - Free PMQ, PFQ and PMP Readiness Checks";
const PAGE_DESCRIPTION =
  "Pick a free readiness check: APM PMQ (15 questions), APM PFQ (10 questions), or PMP (15 questions). No account required.";

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

const CARD_BLURB: Record<(typeof FREE_MOCK_EXAM_IDS)[number], string> = {
  "apm-pmq":
    "Real APM PMQ-style formats: multiple choice, scenario, and select-from-list.",
  "apm-pfq":
    "APM PFQ-style multiple choice across learning objectives. Spot gaps before you book.",
  pmp: "Scenario questions across People, Process and Business Environment. Readiness check only.",
};

export default function MockMeHubPage() {
  return (
    <div className="pb-16 pt-8 sm:pb-20 sm:pt-10">
      <div className="wrap">
        <header className="mx-auto max-w-[42rem] text-center">
          <h1 className="text-balance font-display text-[clamp(1.85rem,4vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-ink">
            Mock <span className="text-orange">Me</span>
          </h1>
          <p className="mx-auto mt-4 max-w-[36rem] text-pretty font-body text-[16px] leading-relaxed text-ink/80 sm:text-[17px]">
            Free readiness checks. No account needed. Score shows as soon as you
            finish — email unlocks the full diagnostic.
          </p>
        </header>

        <ul className="mx-auto mt-12 grid max-w-[52rem] list-none gap-5 p-0 sm:grid-cols-3">
          {FREE_MOCK_EXAM_IDS.map((examId) => {
            const exam = FREE_MOCK_EXAMS[examId];
            return (
              <li
                key={examId}
                className="flex flex-col rounded-xl border border-ink/10 bg-paper px-5 py-6 text-left"
              >
                <p className="m-0 font-body text-[11px] font-bold uppercase tracking-[0.14em] text-orange">
                  {exam.questionCount} questions
                </p>
                <h2 className="m-0 mt-2 font-display text-[1.35rem] font-semibold tracking-[-0.02em] text-ink">
                  {exam.displayName}
                </h2>
                <p className="mt-3 flex-1 font-body text-[14px] leading-relaxed text-ink/75">
                  {CARD_BLURB[examId]} No account required.
                </p>
                <Link
                  href={exam.path}
                  className={`${stampCtaPrimary} mt-5 self-start`}
                >
                  Start {exam.mark} check
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="mx-auto mt-10 max-w-[40rem] text-center font-body text-[13px] text-ink/60">
          Looking for a full course?{" "}
          <Link
            href="/courses"
            className="text-orange underline-offset-2 hover:underline"
          >
            Browse courses
          </Link>
        </p>
      </div>
    </div>
  );
}
