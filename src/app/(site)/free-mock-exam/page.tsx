import type { Metadata } from "next";
import Link from "next/link";
import { FreeMockExamClient } from "@/components/free-mock/FreeMockExamClient";
import { APM_DISCLAIMER } from "@/lib/legal-copy";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

const PAGE_TITLE = "Free APM PMQ Mock Exam — 15-Question Readiness Check";
const PAGE_DESCRIPTION =
  "Take a free 15-question APM PMQ readiness check in real exam format. See which learning objectives to revise first — no account required.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/free-mock-exam` },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/free-mock-exam`,
    type: "website",
  },
};

const FAQS = [
  {
    q: "Is this the full APM PMQ mock exam?",
    a: "No. This is a free 15-question readiness check using the same question styles as the real APM PMQ (multiple choice, scenario, and select-from-list). The full timed mock papers live inside the PMQ in 5 Days course.",
  },
  {
    q: "Do I need an account?",
    a: "No account is required to take the check. After you finish, enter your email to unlock your learning-objective breakdown. Creating an account is optional if you want to start the 5-day revision plan.",
  },
  {
    q: "Will you email me marketing messages?",
    a: "Only if you tick the optional checkbox. Your email is used to show your results. Marketing tips are separate and unticked by default — you can unsubscribe any time.",
  },
  {
    q: "Is Learn in Curve affiliated with APM?",
    a: "No. Learn in Curve is not affiliated with, endorsed by, or accredited by APM (the Association for Project Management). Our revision material is aimed at their published syllabus.",
  },
] as const;

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

export default function FreeMockExamPage() {
  return (
    <div className="pb-16 pt-8 sm:pb-20 sm:pt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="wrap">
        <header className="mx-auto max-w-[42rem] text-center">
          <p className="m-0 font-body text-[11px] font-bold uppercase tracking-[0.14em] text-orange">
            Free readiness check
          </p>
          <h1 className="mt-2 text-balance font-display text-[clamp(1.85rem,4vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-ink">
            Free APM PMQ mock exam
          </h1>
          <p className="mx-auto mt-4 max-w-[36rem] text-pretty font-body text-[16px] leading-relaxed text-ink/80 sm:text-[17px]">
            Fifteen questions in real APM PMQ format — multiple choice, scenario,
            and select-from-list. No account needed. Takes about 15–20 minutes.
          </p>
          <p className="mx-auto mt-3 max-w-[36rem] text-pretty font-body text-[15px] leading-relaxed text-ink/70">
            When you finish, we show your score and which learning objectives to
            revise first. Pair it with our 5-day revision plan when you are ready
            to go deeper.
          </p>
          <p className="mx-auto mt-3 max-w-[36rem] text-pretty font-body text-[14px] leading-relaxed text-ink/55">
            This is a practice readiness check, not an official APM exam and not
            a guarantee of exam performance.
          </p>
        </header>

        <div className="mx-auto mt-10 w-full max-w-[46rem]">
          <FreeMockExamClient />
        </div>

        <section
          className="mx-auto mt-14 max-w-[42rem]"
          aria-labelledby="free-mock-faq-heading"
        >
          <h2
            id="free-mock-faq-heading"
            className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink"
          >
            Frequently asked questions
          </h2>
          <dl className="mt-6 space-y-5">
            {FAQS.map((item) => (
              <div key={item.q}>
                <dt className="font-display text-lg font-semibold text-ink">
                  {item.q}
                </dt>
                <dd className="mt-1.5 font-body text-[15px] leading-relaxed text-ink/75">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <p className="mx-auto mt-12 max-w-[42rem] border-t border-ink/10 pt-6 font-body text-[12px] leading-snug text-ink/50">
          {APM_DISCLAIMER}{" "}
          <Link href="/privacy" className="text-orange underline-offset-2 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
