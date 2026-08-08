import type { Metadata } from "next";
import { FaqAccordion } from "@/components/FaqAccordion";
import { FreeMockExamClient } from "@/components/free-mock/FreeMockExamClient";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

const PAGE_TITLE = "Free APM PMQ Mock Exam — 15-Question Readiness Check";
const PAGE_DESCRIPTION =
  "Take a free 15-question APM PMQ readiness check in real exam format. See which learning objectives to revise first — no account required.";

/** Page-local disclaimer: no em dash, no Privacy Policy link (Terms footer still carries site-wide copy). */
const FREE_MOCK_APM_DISCLAIMER =
  "Not affiliated with, endorsed by, or acting on behalf of APM (the Association for Project Management). Revision material is our own, aimed at their published syllabus, not official APM content.";

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

const faqItems = FAQS.map((item) => ({
  question: item.q,
  answer: item.a,
}));

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
            Free APM <span className="text-orange">PMQ</span> mock exam
          </h1>
          <p className="mx-auto mt-4 max-w-[36rem] text-pretty font-body text-[16px] leading-relaxed text-ink/80 sm:text-[17px]">
            Test yourself with real APM PMQ-style questions covering multiple
            choice, scenario-based, and select-from-list formats.
          </p>
          <p className="mx-auto mt-2 max-w-[36rem] text-pretty font-body text-[16px] leading-relaxed text-ink/80 sm:text-[17px]">
            Complete it in within 5 minutes.
          </p>
          <p className="mx-auto mt-3 max-w-[36rem] text-pretty font-body text-[15px] leading-relaxed text-ink/70">
            When you finish, we show your score and which learning objectives to
            revise first. Pair it with our 5-day revision plan when you are ready
            to go deeper.
          </p>
        </header>

        <div className="mx-auto mt-10 w-full max-w-[46rem]">
          <FreeMockExamClient />
        </div>

        <div className="mx-auto mt-14 max-w-[42rem]">
          <FaqAccordion
            items={faqItems}
            headingId="free-mock-faq-heading"
            title="Frequently asked questions"
            defaultOpenIndex={0}
            idPrefix="free-mock-faq"
          />
        </div>

        <p className="mx-auto mt-12 max-w-[42rem] border-t border-ink/10 pt-6 font-body text-[12px] leading-snug text-ink/50">
          {FREE_MOCK_APM_DISCLAIMER}
        </p>
      </div>
    </div>
  );
}
