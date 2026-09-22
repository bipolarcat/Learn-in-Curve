import { MarkdownBlock } from "@/components/pmq/MarkdownBlock";
import { LibraryAuthorByline } from "@/components/library/LibraryAuthorByline";
import { LibrarySoftNavLink } from "@/components/library/LibrarySoftNavLink";
import { FaqAccordion } from "@/components/FaqAccordion";
import { FreeMockExamLink } from "@/components/FreeMockExamLink";
import { SoftNavBackLink } from "@/components/SoftNavBackLink";
import { stampCtaPrimary } from "@/components/stamp-chip";
import { productSurfaceOpaque } from "@/components/ui/semantic";
import {
  getLibraryPage,
  pageHasTodoCopy,
  type LibraryPage,
} from "@/content/library";
import { LIBRARY_AUTHOR } from "@/content/library/author";
import { LIBRARY_HUB_APM_DISCLAIMER } from "@/lib/legal-copy";
import { OG_DEFAULT_IMAGE_PATH } from "@/lib/seo/og";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

/** Shared social + schema image for every Shelf guide. */
export const LIBRARY_OG_IMAGE = OG_DEFAULT_IMAGE_PATH;

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
    url,
    inLanguage: "en-GB",
    image: `${SITE_URL}${LIBRARY_OG_IMAGE}`,
    author: {
      "@type": "Person",
      name: LIBRARY_AUTHOR.name,
      // author.url is what lets a search or answer engine follow the byline
      // to a real person. Without it the author block is unverifiable.
      url: `${SITE_URL}${LIBRARY_AUTHOR.url}`,
      image: `${SITE_URL}${LIBRARY_AUTHOR.imageSrc}`,
      jobTitle: LIBRARY_AUTHOR.role,
    },
    publisher: {
      "@type": "Organization",
      name: "Learn in Curve",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}${LIBRARY_OG_IMAGE}`,
      },
    },
    ...(page.sources?.length
      ? {
          citation: page.sources.map((src) => ({
            "@type": "CreativeWork",
            name: src.label,
            url: src.url,
            publisher: { "@type": "Organization", name: src.publisher },
          })),
        }
      : {}),
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

/**
 * "August 2026". Readers and answer engines both want to know how current
 * exam content is, and the date existed only in JSON-LD until now.
 */
function formatUpdated(iso: string): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(ms));
}

export function LibraryArticle({ page }: { page: LibraryPage }) {
  const related = (page.related ?? [])
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
        <div className="mx-auto mb-6 max-w-[46rem]">
          <SoftNavBackLink
            href="/library"
            label="Back to the shelf"
            busyLabel="Opening the shelf"
          />
        </div>

        {/* Reading card — title, answer-first, body */}
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
            <p className="mt-3 font-body text-[12.5px] text-ink/50">
              Updated{" "}
              <time dateTime={page.updatedAt}>
                {formatUpdated(page.updatedAt)}
              </time>
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

          {page.sources?.length ? (
            <section className="mt-10" aria-labelledby="library-sources-heading">
              <h2
                id="library-sources-heading"
                className="m-0 font-body text-[13px] font-semibold uppercase tracking-[0.08em] text-ink/55"
              >
                Sources
              </h2>
              <ul className="mt-3 space-y-2 font-body text-[14px] leading-relaxed">
                {page.sources.map((src) => (
                  <li key={src.url}>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-sm font-semibold text-orange underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55"
                    >
                      {src.label}
                    </a>
                    <span className="text-ink/50"> ({src.publisher})</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <LibraryAuthorByline className="mt-10" />
        </div>

        {/* FAQ — own accordion card, full section width */}
        <div className="mx-auto mt-12 w-full max-w-[46rem]">
          <FaqAccordion
            items={faqItems}
            headingId="library-faq-heading"
            title="Frequently asked questions"
            defaultOpenIndex={0}
            idPrefix="library-faq"
          />
        </div>

        {/* Free mock CTA — own card */}
        <div
          className={`mx-auto mt-12 w-full max-w-[46rem] ${productSurfaceOpaque} px-5 py-6 text-center sm:px-7`}
        >
          <p className="m-0 font-display text-xl font-semibold text-ink">
            Ready to check where you stand?
          </p>
          <p className="mx-auto mt-2 max-w-[28rem] font-body text-[14.5px] text-ink/70">
            Fifteen questions in real APM PMQ format. No account required.
          </p>
          <FreeMockExamLink
            className={`${stampCtaPrimary} mt-5`}
            label="Start free PMQ mock exam"
            location="library_article"
            showArrow
            from="library"
          />
        </div>

        {related.length > 0 ? (
          <section
            className="mx-auto mt-12 max-w-[46rem]"
            aria-labelledby="library-related-heading"
          >
            <h2
              id="library-related-heading"
              className="font-display text-xl font-semibold tracking-[-0.02em] text-ink"
            >
              Related
            </h2>
            <ul className="mt-4 space-y-2 font-body text-[15px]">
              {related.map((r) => (
                <li key={r.slug}>
                  <LibrarySoftNavLink
                    href={`/library/${r.slug}`}
                    busyLabel={`Opening ${r.title}`}
                    className="font-semibold text-orange underline-offset-2 hover:underline"
                  >
                    {r.title}
                  </LibrarySoftNavLink>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <p className="mx-auto mt-12 max-w-[46rem] border-t border-ink/10 pt-6 font-body text-[12px] leading-snug text-ink/50">
          {LIBRARY_HUB_APM_DISCLAIMER}
        </p>
      </div>
    </article>
  );
}
