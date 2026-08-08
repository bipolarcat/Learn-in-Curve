import Link from "next/link";
import { MarkdownBlock } from "@/components/pmq/MarkdownBlock";
import { LearnSampleQuestions } from "@/components/learn/LearnSampleQuestions";
import { stampCtaPrimary } from "@/components/stamp-chip";
import {
  getLearnPage,
  pageHasTodoCopy,
  type LearnPage,
} from "@/content/learn";
import { pickLearnSamples } from "@/lib/learn/pick-samples";
import { LEARN_HUB_APM_DISCLAIMER } from "@/lib/legal-copy";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

export function buildLearnJsonLd(page: LearnPage) {
  const url = `${SITE_URL}/learn/${page.slug}`;
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.title,
    description: page.metaDescription,
    dateModified: page.updatedAt,
    datePublished: page.updatedAt,
    mainEntityOfPage: url,
    author: {
      "@type": "Organization",
      name: "Learn in Curve",
    },
    publisher: {
      "@type": "Organization",
      name: "Learn in Curve",
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SITE_URL}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Learn",
        item: `${SITE_URL}/learn`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: page.title,
        item: url,
      },
    ],
  };

  return [faqLd, articleLd, breadcrumbLd];
}

export function LearnArticle({ page }: { page: LearnPage }) {
  // Sample questions belong only on syllabus-topic pages, where they teach a
  // specific learning objective. Exam-prep and choosing pages end on the free
  // mock CTA instead: they answer a decision, not a topic, and drawing samples
  // across many pages from a shallow pool caused repeats between pages.
  const samples =
    page.group === "syllabus"
      ? pickLearnSamples(page.sampleQuestionLos, 3, page.slug)
      : [];
  const related = page.related
    .map((slug) => getLearnPage(slug))
    .filter((p): p is LearnPage => Boolean(p));
  const showPlaceholderBanner = pageHasTodoCopy(page) || page.status === "draft";

  return (
    <article className="pb-16 pt-8 sm:pb-20 sm:pt-10">
      {buildLearnJsonLd(page).map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}

      <div className="wrap">
        <nav
          aria-label="Breadcrumb"
          className="mx-auto mb-6 max-w-[42rem] font-body text-[13px] text-ink/55"
        >
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-orange">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/learn" className="hover:text-orange">
                Learn
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-ink/80">{page.title}</li>
          </ol>
        </nav>

        <header className="mx-auto max-w-[42rem]">
          <h1 className="text-balance font-display text-[clamp(1.75rem,3.8vw,2.6rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-ink">
            {page.title}
          </h1>
          <p className="mt-5 rounded-xl border border-orange/25 bg-orange/[0.06] px-4 py-3.5 font-body text-[16px] leading-relaxed text-ink sm:text-[17px]">
            {page.answerFirst}
          </p>
          {showPlaceholderBanner ? (
            <p className="mt-3 font-body text-[12px] text-ink/45">
              Draft / placeholder copy — not for indexing.
            </p>
          ) : null}
        </header>

        <div className="mx-auto mt-8 max-w-[42rem]">
          <MarkdownBlock content={page.body} className="pmq-markdown--learn-core" />
        </div>

        {samples.length > 0 ? (
          <div className="mx-auto mt-12 max-w-[42rem]">
            <LearnSampleQuestions questions={samples} />
          </div>
        ) : null}

        <section
          className="mx-auto mt-12 max-w-[42rem]"
          aria-labelledby="learn-faq-heading"
        >
          <h2
            id="learn-faq-heading"
            className="font-display text-xl font-semibold tracking-[-0.02em] text-ink"
          >
            Frequently asked questions
          </h2>
          <dl className="mt-5 space-y-5">
            {page.faqs.map((item) => (
              <div key={item.question}>
                <dt className="font-display text-lg font-semibold text-ink">
                  {item.question}
                </dt>
                <dd className="mt-1.5 font-body text-[15px] leading-relaxed text-ink/75">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="mx-auto mt-12 max-w-[42rem] rounded-xl border border-ink/10 bg-paper px-5 py-6 text-center sm:px-7">
          <p className="m-0 font-display text-xl font-semibold text-ink">
            Ready to check where you stand?
          </p>
          <p className="mx-auto mt-2 max-w-[28rem] font-body text-[14.5px] text-ink/70">
            Fifteen questions in real APM PMQ format. No account required.
          </p>
          <Link
            href="/free-mock-exam"
            className={`${stampCtaPrimary} mt-5 inline-flex`}
          >
            Test yourself: free 15-question APM PMQ check →
          </Link>
        </div>

        {related.length > 0 ? (
          <section
            className="mx-auto mt-12 max-w-[42rem]"
            aria-labelledby="learn-related-heading"
          >
            <h2
              id="learn-related-heading"
              className="font-display text-xl font-semibold tracking-[-0.02em] text-ink"
            >
              Related
            </h2>
            <ul className="mt-4 space-y-2 font-body text-[15px]">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/learn/${r.slug}`}
                    className="font-semibold text-orange underline-offset-2 hover:underline"
                  >
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <p className="mx-auto mt-12 max-w-[42rem] border-t border-ink/10 pt-6 font-body text-[12px] leading-snug text-ink/50">
          {LEARN_HUB_APM_DISCLAIMER}
        </p>
      </div>
    </article>
  );
}
