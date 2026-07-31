import Link from "next/link";
import type { UserCourse } from "@/types/database";
import { getCourseHref } from "@/lib/courses";
import { formatGbp, PMQ_SLUG } from "@/lib/pmq/constants";
import { PMQ_TICKET_SELL_POINTS } from "@/lib/pmq/pro-included";
import { PMQ_PRICING_HREF } from "@/lib/pmq/plans";
import { SLY_UNLOCK_PRICE_CENTS } from "@/lib/tutor/constants";
import { PmqStartLink } from "@/components/PmqStartLink";
import {
  stampCtaPrimary,
  stampCtaSecondary,
  CtaArrow,
} from "@/components/stamp-chip";
import { productSurface } from "@/components/ui/semantic";
import styles from "@/components/CourseTicket.module.css";

type CourseTicketProps = {
  course: UserCourse;
  showCta?: boolean;
  /** Required for live PMQ CTA so unsigned users hit enrollment, not the course home. */
  isSignedIn?: boolean;
  /** Stripe return path after Pro unlock checkout. */
  proReturnPath?: string;
};

export function CourseTicket({
  course,
  showCta = true,
  isSignedIn = false,
}: CourseTicketProps) {
  const isLive = course.status === "live";
  const isLocked = !isLive;
  const isPmq = course.slug === PMQ_SLUG;
  const priceLabel = formatGbp(SLY_UNLOCK_PRICE_CENTS);

  return (
    <article
      className={`${productSurface} ${
        isPmq ? styles.live : styles.planned
      } relative flex flex-col overflow-hidden transition-[box-shadow,transform] duration-200 ease-[var(--ease-out-quint)] hover:shadow-[0_2px_4px_rgb(var(--ink-rgb)_/_0.05),0_10px_28px_rgb(var(--ink-rgb)_/_0.08)]`}
    >
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <span
          className={`mb-4 inline-flex w-fit items-center rounded-md px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-[0.08em] ${
            isLive ? "bg-olive text-paper" : "bg-gold/90 text-ink"
          }`}
        >
          {isLive ? "Free · Live" : "Coming soon"}
        </span>

        {isPmq ? (
          <h2 className="mb-2 font-display text-[clamp(1.45rem,2.6vw,1.75rem)] font-bold tracking-[-0.03em] text-balance text-ink">
            PMQ in <span className="text-orange">5 days</span>
          </h2>
        ) : (
          <h2 className="mb-2 font-display text-[clamp(1.45rem,2.6vw,1.75rem)] font-bold tracking-[-0.03em] text-balance text-ink">
            PFQ in <span className="text-orange">2 days</span>
          </h2>
        )}

        <p className="mb-5 max-w-[36ch] text-[14px] leading-relaxed text-pretty text-ink/75">
          {course.description}
        </p>

        {isPmq && isLive ? (
          <>
            <ul className="mb-5 grid list-none gap-2">
              {PMQ_TICKET_SELL_POINTS.map((point) => (
                <li
                  key={point}
                  className="flex gap-2.5 text-[13px] leading-snug text-ink/85"
                >
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange"
                    aria-hidden
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <div className={styles.proNote}>
              <p className="text-[13px] leading-relaxed text-ink/72">
                Optional Pro adds Sly, every quiz set and the full mock exam.
              </p>
              <span className="shrink-0 font-body text-[11px] font-bold text-teal">
                {priceLabel} once
              </span>
            </div>
          </>
        ) : null}

        {!isPmq ? (
          <div className="mb-5 flex flex-wrap gap-x-4 gap-y-1 font-body text-[11px] uppercase tracking-[0.06em] text-teal">
            {course.has_mock_exam && <span>Mock exam</span>}
            <span>{isLive ? "24 objectives" : "TBC"}</span>
            <span>{isLive ? "~5 days" : "~2 days"}</span>
          </div>
        ) : null}

        {showCta && isLive && isPmq ? (
          <div className="mt-auto flex flex-wrap items-center gap-2">
            <PmqStartLink
              isSignedIn={isSignedIn}
              className={stampCtaPrimary}
            >
              Start learning for free
            </PmqStartLink>
            <Link href={PMQ_PRICING_HREF} className={stampCtaSecondary}>
              View plans
            </Link>
          </div>
        ) : null}

        {showCta && isLive && !isPmq ? (
          <Link
            href={getCourseHref(course.slug)}
            className={`${stampCtaPrimary} mt-auto`}
          >
            Start free
            <CtaArrow />
          </Link>
        ) : null}

        {showCta && isLocked ? (
          <span className="mt-auto inline-flex w-fit font-body text-[11px] uppercase tracking-[0.06em] text-ink/45">
            Coming soon
          </span>
        ) : null}
      </div>
    </article>
  );
}
