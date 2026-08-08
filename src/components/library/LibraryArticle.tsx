import Link from "next/link";
import { MarkdownBlock } from "@/components/pmq/MarkdownBlock";
import { LibrarySampleQuestions } from "@/components/library/LibrarySampleQuestions";
import { FaqAccordion } from "@/components/FaqAccordion";
import { stampCtaPrimary } from "@/components/stamp-chip";
import { productSurfaceOpaque } from "@/components/ui/semantic";
import {
  getLibraryPage,
  pageHasTodoCopy,
  type LibraryPage,
} from "@/content/library";
import { pickLibrarySamples } from "@/lib/library/pick-samples";
import { LIBRARY_HUB_APM_DISCLAIMER } from "@/lib/legal-copy";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

export function buildLibraryJsonLd(page: LibraryPage) {
  const url = `${SITE_URL}/library/${page.slug}`;
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
        name: "Library",
        item: `${SITE_URL}/library`,
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

export function LibraryArticle({ page }: { page: LibraryPage }) {
  // Sample questions belong only on syllabus-topic pages, where they teach a
  // specific learning objective. Exam-prep and choosing pages end on the free
  // mock CTA instead: they answer a decision, not a topic, and drawing samples
  // across many pages from a shallow pool caused repeats between pages.
  const samples =
    page.group === "syllabus"
      ? pickLibrarySamples(page.sampleQuestionLos, 3, page.slug)
      : [];
  const related = page.related
    .map((slug) => getLibraryPage(slug))
    .filter((p): p is LibraryPage => Boolean(p));
  const showPlaceholderBanner = pageHasTodoCopy(page) || page.status === "draft";

  const faqItems = page.faqs.map((item) => ({
    question: item.question,
    answer: <p>{item.answer}</p>,
  }));

  return (
    <article className="pb-16 pt-8 sm:pb-20 sm:pt-10">
      {buildLibraryJsonLd(page).map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}

      <div className="wrap">
        <nav
          aria-label="Breadcrumb"
          className="mx-auto mb-6 max-w-[46rem] font-body text-[13px] text-ink/55"
        >
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-orange">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/library" className="hover:text-orange">
                Library
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-ink/80">{page.title}</li>
          </ol>
        </nav>

        <div
          className={`mx-auto max-w-[46rem] ${productSurfaceOpaque} px-5 py-7 sm:px-8 sm:py-9`}
        >
          <header>
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

          <div className="mt-8">
            <MarkdownBlock
              content={page.body}
              className="pmq-markdown--library-core"
            />
          </div>

          {samples.length > 0 ? (
            <div className="mt-12">
              <LibrarySampleQuestions questions={samples} />
            </div>
          ) : null}

          <div className="mt-12">
            <FaqAccordion
              items={faqItems}
              headingId="library-faq-heading"
              title="Frequently asked questions"
              defaultOpenIndex={0}
              idPrefix="library-faq"
            />
          </div>

          <div className="mt-12 rounded-xl border border-ink/10 bg-cream/60 px-5 py-6 text-center sm:px-7">
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
            <section className="mt-12" aria-labelledby="library-related-heading">
              <h2
                id="library-related-heading"
                className="font-display text-xl font-semibold tracking-[-0.02em] text-ink"
              >
                Related
              </h2>
              <ul className="mt-4 space-y-2 font-body text-[15px]">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/library/${r.slug}`}
                      className="font-semibold text-orange underline-offset-2 hover:underline"
                    >
                      {r.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <p className="mt-12 border-t border-ink/10 pt-6 font-body text-[12px] leading-snug text-ink/50">
            {LIBRARY_HUB_APM_DISCLAIMER}
          </p>
        </div>
      </div>
    </article>
  );
}
