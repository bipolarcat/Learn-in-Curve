"use client";

import { useState, useTransition, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { formatGbp } from "@/lib/pmq/constants";
import {
  PFQ_PLANS,
  type PfqPlan,
  type PfqPlanFeature,
} from "@/lib/pfq/plans";
import { PFQ_LEARN_HREF, PFQ_PREVIEW_HREF, PFQ_PRICING_HREF } from "@/lib/pfq/constants";
import { PFQ_AI_PRO_NOTIFY_KEY } from "@/lib/notify/lists";
import {
  IconCore,
  IconMisconceptions,
  IconMock,
  IconPractice,
  IconReport,
  IconSly,
} from "@/components/pmq/PmqPreviewFeatureIcons";
import { JoinWaitlistButton } from "@/components/pmq/JoinWaitlistButton";
import { PfqCheckoutButton } from "@/components/pfq/PfqCheckoutButton";
import { CtaArrow } from "@/components/stamp-chip";
import { Spinner } from "@/components/ui/spinner";
import { withSoftNavFrom } from "@/lib/soft-nav-back";
import { pfqTierAtLeast, type PfqTier } from "@/lib/pfq/tiers";
import styles from "@/components/pmq/PmqPlanCards.module.css";

const FEATURE_ICONS: Record<
  PfqPlanFeature["icon"],
  ComponentType<{ className?: string }>
> = {
  core: IconCore,
  practice: IconPractice,
  mock: IconMock,
  misconceptions: IconMisconceptions,
  report: IconReport,
  sly: IconSly,
};

function ArrowDownRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M3 3v5.5a2 2 0 0 0 2 2h7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 8l3 2.5-3 2.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlanName({
  plan,
  soonBadge,
}: {
  plan: PfqPlan;
  soonBadge?: boolean;
}) {
  const title =
    plan.id === "pro" ? (
      <>
        <span className={styles.proMark}>Pro</span> Bundle
      </>
    ) : plan.id === "ai_pro" ? (
      <>
        <span className={styles.aiProMark}>AI Pro</span> Bundle
      </>
    ) : (
      plan.name
    );

  return (
    <div className={styles.nameRow}>
      <h3 className={styles.name}>{title}</h3>
      {soonBadge ? (
        <span className={styles.badgeSoon}>Launching soon</span>
      ) : null}
    </div>
  );
}

function PlanFeatures({ plan }: { plan: PfqPlan }) {
  return (
    <ul className={styles.features}>
      {plan.features.map((feature) => {
        const Icon = FEATURE_ICONS[feature.icon];
        return (
          <li
            key={`${feature.icon}-${feature.label}`}
            className={styles.feature}
          >
            <Icon className={styles.featureIcon} />
            <span className={styles.featureLabel}>
              {feature.value ? (
                <>
                  <span className={styles.featureValue}>{feature.value}</span>{" "}
                </>
              ) : null}
              {feature.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function StartFreeButton({
  isSignedIn,
  label,
}: {
  isSignedIn: boolean;
  label: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const guestHref = withSoftNavFrom(PFQ_PREVIEW_HREF, "pricing");

  return (
    <button
      type="button"
      disabled={pending}
      aria-busy={pending}
      aria-label={pending ? "Opening course" : label}
      className={`group ${styles.ctaBtn} ${styles.ctaSecondary}`}
      onClick={() => {
        startTransition(() => {
          router.push(isSignedIn ? PFQ_LEARN_HREF : guestHref);
        });
      }}
    >
      {pending ? (
        <Spinner variant="ellipsis" size={14} className="text-ink" aria-hidden />
      ) : (
        <>
          {label}
          <CtaArrow />
        </>
      )}
    </button>
  );
}

type PfqPlanCardsProps = {
  isSignedIn: boolean;
  /** Highest PFQ tier the signed-in user holds. */
  userTier?: PfqTier;
  /** @deprecated Prefer userTier — true when tier is Pro or above. */
  hasPro?: boolean;
  resumeProCheckout?: boolean;
};

/**
 * Three-tier plan ladder for PFQ in 2 days — same card chrome as PMQ.
 * Pro checkout stays behind PFQ_CHECKOUT_ENABLED. AI Pro is waitlist-only.
 */
export function PfqPlanCards({
  isSignedIn,
  userTier = "starter",
  hasPro,
  resumeProCheckout = false,
}: PfqPlanCardsProps) {
  const ownsPro =
    hasPro ?? pfqTierAtLeast(userTier, "pro");

  return (
    <ul className={styles.grid} role="list">
      {PFQ_PLANS.map((plan) => {
        const inherited = plan.inheritsFrom
          ? PFQ_PLANS.find((item) => item.id === plan.inheritsFrom)
          : null;

        return (
          <li key={plan.id} className={`${styles.card} ${styles.cardWithCourse}`}>
            <p className={styles.courseChip}>
              PFQ · <span className="text-orange">2 days</span>
            </p>
            <div className={styles.head}>
              <PlanName plan={plan} soonBadge={plan.status === "waitlist"} />

              <div className={styles.priceRow}>
                <span
                  className={`${styles.price} ${
                    plan.priceCents === null ? styles.priceFree : ""
                  }`}
                >
                  {/* priceCents is null on the free tier: show the word, not "£0". */}
                  {plan.priceCents === null
                    ? "Free"
                    : formatGbp(plan.priceCents)}
                </span>
                <span className={styles.priceNote}>{plan.priceNote}</span>
              </div>

              <p className={styles.tagline}>{plan.tagline}</p>
            </div>

            <div className={styles.split}>
              {inherited ? (
                <p className={styles.inherits}>
                  <ArrowDownRight className={styles.inheritsIcon} />
                  Everything in {inherited.name}, plus
                </p>
              ) : null}

              <PlanFeatures plan={plan} />
            </div>

            <div className={styles.cta}>
              {plan.status === "free" ? (
                <StartFreeButton isSignedIn={isSignedIn} label={plan.ctaLabel} />
              ) : null}

              {plan.status === "buyable" ? (
                ownsPro ? (
                  <span
                    className={`${styles.ctaBtn} ${styles.ctaSecondary} ${styles.ctaOwned}`}
                    aria-label="You already own the Pro Bundle"
                  >
                    Owned
                  </span>
                ) : (
                  <PfqCheckoutButton
                    isSignedIn={isSignedIn}
                    autoStart={resumeProCheckout}
                    returnPath={PFQ_PRICING_HREF}
                    label={plan.ctaLabel}
                    className={`${styles.ctaBtn} ${styles.ctaPrimary}`}
                  />
                )
              ) : null}

              {plan.status === "waitlist" ? (
                <JoinWaitlistButton
                  notifyKey={PFQ_AI_PRO_NOTIFY_KEY}
                  subjectLabel="PFQ AI Pro Bundle"
                  courseCopy="the PFQ AI Pro Bundle"
                  label={plan.ctaLabel}
                />
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
