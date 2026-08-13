import type { Metadata } from "next";
import Link from "next/link";
import { CtaArrow, stampCtaPrimary, stampCtaSecondary } from "@/components/stamp-chip";
import {
  formatPfqPriceGbp,
  PFQ_PRICING_HREF,
} from "@/lib/pfq/constants";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

/** Price from registry — never hardcode £5 in copy strings. */
const PRICE = formatPfqPriceGbp();

/**
 * Verbatim from PFQ in 2 days/PFQ_LANDING_COPY.md (13 Aug 2026).
 * Do not paraphrase. Price figures are substituted from the registry only.
 */
const PAGE_TITLE = `APM PFQ Course, ${PRICE} — 59 Lessons, 306 Practice Questions, Full Mock | Learn in Curve`;
const PAGE_DESCRIPTION = `Prepare for the APM Project Fundamentals Qualification for ${PRICE}. A lesson for every one of the 59 syllabus learning outcomes, 306 tagged practice questions, and a full 60-question mock. Find out exactly which outcomes you cannot answer yet.`;

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/pfq` },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/pfq`,
    type: "website",
  },
};

export default function PfqLandingPage() {
  return (
    <div className="mx-auto flex w-full max-w-wrap flex-col gap-14 px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10">
      {/* Hero */}
      <header className="flex max-w-2xl flex-col gap-4">
        <h1 className="m-0 font-display text-[clamp(1.85rem,4.5vw,2.75rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-ink text-balance">
          The PFQ exam asks 59 questions you can see in advance.
        </h1>
        <p className="m-0 font-body text-[1.05rem] leading-relaxed text-ink/75">
          APM publishes the syllabus, and the qualification handbook says every
          learning outcome in it is assessed, with one asked twice. Fifty-nine
          outcomes, sixty questions. So &quot;am I ready?&quot; has an exact
          answer, and this course is built to give it to you.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href={PFQ_PRICING_HREF} className={stampCtaPrimary}>
            Get the course, {PRICE}
            <CtaArrow />
          </Link>
          <Link href="#whats-inside" className={stampCtaSecondary}>
            See what&apos;s inside
          </Link>
        </div>
        <p className="m-0 font-body text-[13px] leading-relaxed text-ink/55">
          One payment. No subscription. Yours for good.
        </p>
      </header>

      {/* Section 2 */}
      <section className="flex max-w-2xl flex-col gap-3">
        <h2 className="m-0 font-display text-[clamp(1.35rem,3vw,1.75rem)] font-semibold tracking-[-0.02em] text-ink text-balance">
          Most courses tell you a percentage. This one tells you which outcomes
          you can&apos;t answer yet.
        </h2>
        <p className="m-0 font-body text-[1rem] leading-relaxed text-ink/75">
          Sit a mock anywhere else and you get a score. A score tells you roughly
          how you did and nothing about what to do next.
        </p>
        <p className="m-0 font-body text-[1rem] leading-relaxed text-ink/75">
          Because the PFQ syllabus is public and every outcome is assessed
          exactly once, we can do something better. Every lesson, every practice
          question and the mock exam are all tagged to the specific learning
          outcome they test. Finish anything, and the coverage map updates.
        </p>
        <p className="m-0 font-body text-[1rem] leading-relaxed text-ink/75">
          What you see is not 68 per cent. It is: you can currently answer 47 of
          59 outcomes, here are the 12 you can&apos;t, and here is which lesson
          teaches each one.
        </p>
      </section>

      {/* Section 3 — no H2 in approved copy; id for secondary CTA only */}
      <section
        id="whats-inside"
        className="flex max-w-2xl scroll-mt-24 flex-col gap-4"
      >
        <div className="flex flex-col gap-4 font-body text-[1rem] leading-relaxed text-ink/80">
          <p className="m-0">
            <strong className="font-semibold text-ink">
              59 lessons, one per learning outcome.
            </strong>{" "}
            Written to the published APM syllabus, in syllabus order, split
            across two days. Each one covers what it is, what it is tested
            against, and what catches people out. Nothing padded, because a
            25-hour qualification does not need a textbook.
          </p>
          <p className="m-0">
            <strong className="font-semibold text-ink">
              306 practice questions.
            </strong>{" "}
            Every one tagged to the outcome it tests, every one with an
            explanation of why the right answer is right and why the near-misses
            are wrong. Between four and eight questions on each outcome.
          </p>
          <p className="m-0">
            <strong className="font-semibold text-ink">A full mock exam.</strong>{" "}
            Sixty questions, sixty minutes, one per outcome plus the doubled
            one, formatted like the real thing. You can flag questions, filter
            your review by unattempted or flagged, and see the clock throughout.
            The only free practice paper APM publishes is a PDF from 2022 that
            asks you to fill in an answer sheet with an HB pencil. This is not
            that.
          </p>
          <p className="m-0">
            <strong className="font-semibold text-ink">The coverage map.</strong>{" "}
            The thing this course is actually for.
          </p>
          <p className="m-0">
            <strong className="font-semibold text-ink">Trap School.</strong>{" "}
            Roughly a fifth of the marks on a PFQ paper turn on question format
            rather than knowledge: negatively worded stems, multi-select
            combinations, near-miss definitions. Twelve minutes of content, and
            nobody else teaches it.
          </p>
        </div>
      </section>

      {/* Section 4 */}
      <section className="flex max-w-2xl flex-col gap-3">
        <h2 className="m-0 font-display text-[clamp(1.35rem,3vw,1.75rem)] font-semibold tracking-[-0.02em] text-ink text-balance">
          Project management planning is worth 11 marks. Roles and
          responsibilities is worth 1.
        </h2>
        <p className="m-0 font-body text-[1rem] leading-relaxed text-ink/75">
          You should know that before you decide what to revise tonight. Most
          courses present ten modules as ten equal blocks. We show you the real
          mark weighting on every screen, because study time is finite and the
          syllabus is not evenly distributed.
        </p>
      </section>

      {/* Section 5 */}
      <section className="flex max-w-2xl flex-col gap-3">
        <h2 className="m-0 font-display text-[clamp(1.35rem,3vw,1.75rem)] font-semibold tracking-[-0.02em] text-ink">
          Facts about the exam
        </h2>
        <p className="m-0 font-body text-[1rem] leading-relaxed text-ink/75">
          Straight from the APM qualification handbook. Worth knowing before you
          book.
        </p>
        <ul className="m-0 list-disc space-y-2 pl-5 font-body text-[1rem] leading-relaxed text-ink/80">
          <li>60 multiple-choice questions, 60 minutes, one mark each</li>
          <li>
            Pass mark is 36 out of 60, which is 60 per cent. You can get 24 wrong
            and still pass
          </li>
          <li>
            No negative marking. A wrong answer and a blank both score zero, so
            never leave a blank
          </li>
          <li>
            Sat online, all year round, through a training provider or as an open
            online exam
          </li>
          <li>No prior experience or qualifications required</li>
          <li>APM says it typically takes around 25 hours of study</li>
        </ul>
      </section>

      {/* Section 6 */}
      <section className="flex max-w-2xl flex-col gap-3">
        <h2 className="m-0 font-display text-[clamp(1.35rem,3vw,1.75rem)] font-semibold tracking-[-0.02em] text-ink">
          Who it&apos;s for
        </h2>
        <div className="flex flex-col gap-3 font-body text-[1rem] leading-relaxed text-ink/80">
          <p className="m-0">
            <strong className="font-semibold text-ink">
              You&apos;re booked in and want to know if you&apos;re ready.
            </strong>{" "}
            The mock gives you a mark and a named gap list in an hour.
          </p>
          <p className="m-0">
            <strong className="font-semibold text-ink">
              You&apos;ve failed once and are paying for a resit.
            </strong>{" "}
            You know the content roughly. What you need is the specific outcomes
            that cost you the marks, and that is exactly what this is built to
            find.
          </p>
          <p className="m-0">
            <strong className="font-semibold text-ink">
              You&apos;re self-studying without a course.
            </strong>{" "}
            APM&apos;s open online exam route exists for you and comes with no
            teaching attached. This fills that gap for {PRICE}.
          </p>
        </div>
      </section>

      {/* Section 7 — price (legal context paragraph must survive) */}
      <section className="flex max-w-2xl flex-col gap-4">
        <h2 className="m-0 font-display text-[clamp(1.35rem,3vw,1.75rem)] font-semibold tracking-[-0.02em] text-ink">
          {PRICE}. One payment.
        </h2>
        <p className="m-0 font-body text-[1rem] leading-relaxed text-ink/75">
          Everything above. No subscription, no upsell, no locked modules.
        </p>
        <p className="m-0 font-body text-[1rem] leading-relaxed text-ink/75">
          For context: the APM exam itself currently costs £278.40 for
          non-members, booked and paid separately with APM. Accredited two-day
          courses run into the hundreds. This is preparation, not the exam, and
          not a qualification.
        </p>
        <div>
          <Link href={PFQ_PRICING_HREF} className={stampCtaPrimary}>
            Get the course, {PRICE}
            <CtaArrow />
          </Link>
        </div>
      </section>

      {/* Footer legal block — verbatim from PFQ_LANDING_COPY.md */}
      <footer className="max-w-3xl border-t border-ink/10 pt-6">
        <p className="m-0 font-body text-[12px] leading-relaxed text-ink/55">
          Learn in Curve is not an APM Accredited Training Provider. We do not
          sell, administer or invigilate the APM Project Fundamentals
          Qualification exam, and completing this course does not award a
          qualification. All practice questions and lesson content are written by
          us against APM&apos;s published syllabus. None are taken from any APM
          exam paper.
        </p>
        <p className="mt-3 m-0 font-body text-[12px] leading-relaxed text-ink/55">
          APM, Association for Project Management and Project Fundamentals
          Qualification are trademarks of the Association for Project Management.
          This site is not affiliated with, endorsed by, or approved by APM.
        </p>
      </footer>
    </div>
  );
}
