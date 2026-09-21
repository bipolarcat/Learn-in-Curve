import { FaqAccordion } from "@/components/FaqAccordion";
import { FreeMockExamClient } from "@/components/free-mock/FreeMockExamClient";
import { SoftNavBackLink } from "@/components/SoftNavBackLink";
import type { FreeMockExamConfig } from "@/lib/free-mock/config";
import {
  FREE_MOCK_SOFT_NAV_BACK,
  parseFreeMockSoftNavFrom,
} from "@/lib/soft-nav-back";

type FreeMockExamShellProps = {
  config: FreeMockExamConfig;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function FreeMockExamShell({
  config,
  searchParams,
}: FreeMockExamShellProps) {
  const from = parseFreeMockSoftNavFrom((await searchParams)?.from);
  const back = from
    ? FREE_MOCK_SOFT_NAV_BACK[from]
    : {
        href: "/mock-me",
        label: "Back to Mock Me",
        busyLabel: "Opening Mock Me",
      };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: config.faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  const faqItems = config.faqs.map((item) => ({
    question: item.q,
    answer: item.a,
  }));

  const markHighlight =
    config.mark === "PMQ" || config.mark === "PFQ" || config.mark === "PMP"
      ? config.mark
      : null;

  return (
    <div className="pb-16 pt-8 sm:pb-20 sm:pt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="wrap">
        <SoftNavBackLink
          href={back.href}
          label={back.label}
          busyLabel={back.busyLabel}
          className="mb-5"
        />

        <header className="mx-auto max-w-[42rem] text-center">
          <h1 className="text-balance font-display text-[clamp(1.85rem,4vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-ink">
            {config.examId === "pmp" ? (
              <>
                Free PMI{" "}
                <span className="text-orange">PMP</span> mock exam
              </>
            ) : (
              <>
                Free APM{" "}
                <span className="text-orange">{markHighlight}</span> mock exam
              </>
            )}
          </h1>
          <p className="mx-auto mt-4 w-full text-pretty font-body text-[16px] leading-relaxed text-ink/80 sm:max-w-[36rem] sm:text-[17px]">
            {config.heroSupport}
          </p>
        </header>

        <div className="mx-auto mt-10 w-full max-w-[46rem]">
          <FreeMockExamClient
            examId={config.examId}
            items={config.items}
            config={config}
          />
        </div>

        <div className="mx-auto mt-14 w-full max-w-[46rem]">
          <FaqAccordion
            items={faqItems}
            headingId={`${config.examId}-faq-heading`}
            title={
              <>
                Frequently <span className="text-orange">asked</span> questions
              </>
            }
            defaultOpenIndex={0}
            idPrefix={`${config.examId}-faq`}
          />
        </div>
      </div>
    </div>
  );
}
