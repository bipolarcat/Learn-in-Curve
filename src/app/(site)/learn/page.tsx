import type { Metadata } from "next";
import Link from "next/link";
import { getLearnPagesByGroup, LEARN_PAGES } from "@/content/learn";
import { LEARN_HUB_APM_DISCLAIMER } from "@/lib/legal-copy";
import { stampCtaPrimary } from "@/components/stamp-chip";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

export const metadata: Metadata = {
  title: "Learn APM PMQ — guides and exam prep | Learn in Curve",
  description:
    "Plain-English guides to the APM PMQ exam: format, pass mark, revision, and syllabus topics. Then test yourself with a free 15-question readiness check.",
  alternates: { canonical: `${SITE_URL}/learn` },
  openGraph: {
    title: "Learn APM PMQ — guides and exam prep",
    description:
      "Plain-English guides to the APM PMQ exam, then a free 15-question readiness check.",
    url: `${SITE_URL}/learn`,
    type: "website",
  },
};

export default function LearnIndexPage() {
  const groups = getLearnPagesByGroup();
  const publishedCount = groups.reduce((n, g) => n + g.pages.length, 0);
  // Drafts are reachable by URL for copy work but not listed until published.
  const draftCount = LEARN_PAGES.length - publishedCount;

  return (
    <div className="pb-16 pt-8 sm:pb-20 sm:pt-10">
      <div className="wrap">
        <header className="mx-auto max-w-[42rem] text-center">
          <p className="m-0 font-body text-[11px] font-bold uppercase tracking-[0.14em] text-orange">
            Learn
          </p>
          <h1 className="mt-2 text-balance font-display text-[clamp(1.85rem,4vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-ink">
            APM PMQ guides
          </h1>
          <p className="mx-auto mt-4 max-w-[36rem] text-pretty font-body text-[16px] leading-relaxed text-ink/80">
            Direct answers to the questions candidates actually ask — then a free
            readiness check when you want to test yourself.
          </p>
        </header>

        <div className="mx-auto mt-10 max-w-[42rem] space-y-10">
          {publishedCount === 0 ? (
            <div className="rounded-xl border border-ink/10 bg-paper px-5 py-6 text-center">
              <p className="m-0 font-display text-lg font-semibold text-ink">
                Guides are being written
              </p>
              <p className="mt-2 font-body text-[14.5px] text-ink/70">
                {draftCount} draft page{draftCount === 1 ? "" : "s"} in progress.
                Meanwhile, take the free mock.
              </p>
              <Link
                href="/free-mock-exam"
                className={`${stampCtaPrimary} mt-5 inline-flex`}
              >
                Free 15-question APM PMQ check →
              </Link>
            </div>
          ) : (
            groups.map((group) =>
              group.pages.length === 0 ? null : (
                <section key={group.group} aria-labelledby={`learn-${group.group}`}>
                  <h2
                    id={`learn-${group.group}`}
                    className="font-display text-xl font-semibold tracking-[-0.02em] text-ink"
                  >
                    {group.label}
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {group.pages.map((page) => (
                      <li key={page.slug}>
                        <Link
                          href={`/learn/${page.slug}`}
                          className="font-body text-[16px] font-semibold text-orange underline-offset-2 hover:underline"
                        >
                          {page.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ),
            )
          )}
        </div>

        <div className="mx-auto mt-12 max-w-[42rem] text-center">
          <Link
            href="/free-mock-exam"
            className="font-body text-[14px] font-semibold text-orange underline-offset-2 hover:underline"
          >
            Test yourself: free 15-question APM PMQ check →
          </Link>
        </div>

        <p className="mx-auto mt-12 max-w-[42rem] border-t border-ink/10 pt-6 font-body text-[12px] leading-snug text-ink/50">
          {LEARN_HUB_APM_DISCLAIMER}
        </p>
      </div>
    </div>
  );
}
