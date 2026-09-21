"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatGbp } from "@/lib/pmq/constants";
import {
  planInheritsLabel,
  PMQ_PLANS,
  type PmqPlan,
  type PmqPlanId,
} from "@/lib/pmq/plans";
import {
  PLAN_FEATURE_ICONS,
  PlanFeatureText,
  PlanInheritsArrow,
} from "@/components/pmq/plan-features";
import { JoinWaitlistButton } from "@/components/pmq/JoinWaitlistButton";
import { PmqProCheckoutButton } from "@/components/pmq/PmqProCheckoutButton";
import { CtaArrow } from "@/components/stamp-chip";
import { Spinner } from "@/components/ui/spinner";
import { PMQ_SLUG } from "@/lib/pmq/constants";
import { withSoftNavFrom } from "@/lib/soft-nav-back";
import styles from "./PmqPlanCards.module.css";

const GUEST_PATH = `/courses/${PMQ_SLUG}/preview`;
const SIGNED_IN_PATH = "/dashboard";

function PlanName({
  plan,
  soonBadge,
}: {
  plan: PmqPlan;
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

function PlanFeatures({ plan }: { plan: PmqPlan }) {
  return (
    <ul className={styles.features}>
      {plan.features.map((feature) => {
        const Icon = PLAN_FEATURE_ICONS[feature.icon];
        return (
          <li key={`${feature.icon}-${feature.label}`} className={styles.feature}>
            <Icon className={styles.featureIcon} />
            <span className={styles.featureLabel}>
              <PlanFeatureText
                feature={feature}
                valueClassName={styles.featureValue}
              />
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
  const guestHref = withSoftNavFrom(GUEST_PATH, "pricing");

  return (
    <button
      type="button"
      disabled={pending}
      aria-busy={pending}
      aria-label={pending ? "Opening course" : label}
      className={`group ${styles.ctaBtn} ${styles.ctaSecondary}`}
      onClick={() => {
        startTransition(() => {
          router.push(isSignedIn ? SIGNED_IN_PATH : guestHref);
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

type PmqPlanCardsProps = {
  isSignedIn: boolean;
  /** Where Stripe returns the buyer after Pro checkout. */
  proReturnPath?: string;
  /** True when this user already owns the paid bundle. */
  hasPro?: boolean;
  /** Set when the user arrived back from auth with Pro buy intent. */
  resumeProCheckout?: boolean;
  /** Subset of plans to render. Default: all three. */
  planIds?: PmqPlanId[];
  /** When false, omit card CTAs (e.g. preview page with signup beside). */
  showCtas?: boolean;
};

/**
 * Three-tier plan ladder for PMQ in 5 days.
 *
 * Pro is the only card with a live checkout. AI Pro is waitlist-only.
 * Prices come from `PMQ_PLANS`, where Pro's is derived from the same constant
 * Stripe charges.
 */
export function PmqPlanCards({
  isSignedIn,
  proReturnPath,
  hasPro = false,
  resumeProCheckout = false,
  planIds,
  showCtas = true,
}: PmqPlanCardsProps) {
  const plans = planIds?.length
    ? PMQ_PLANS.filter((plan) => planIds.includes(plan.id))
    : PMQ_PLANS;

  return (
    <>
      <ul
        className={plans.length === 1 ? styles.gridSingle : styles.grid}
        role="list"
      >
        {plans.map((plan) => {
          const inherits = planInheritsLabel(plan);

          return (
            <li key={plan.id} className={styles.card}>
              <PlanName
                plan={plan}
                soonBadge={plan.status === "waitlist"}
              />

              <div className={styles.priceRow}>
                <span
                  className={`${styles.price} ${
                    plan.priceCents === null ? styles.priceFree : ""
                  }`}
                >
                  {plan.priceCents === null
                    ? "Free"
                    : formatGbp(plan.priceCents)}
                </span>
                <span className={styles.priceNote}>{plan.priceNote}</span>
              </div>

              <p className={styles.tagline}>{plan.tagline}</p>

              <div className={styles.split}>
                {inherits ? (
                  <p className={styles.inherits}>
                    <PlanInheritsArrow className={styles.inheritsIcon} />
                    {inherits}
                  </p>
                ) : null}

                <PlanFeatures plan={plan} />
              </div>

              {showCtas ? (
                <div className={styles.cta}>
                  {plan.status === "free" ? (
                    <StartFreeButton
                      isSignedIn={isSignedIn}
                      label={plan.ctaLabel}
                    />
                  ) : null}

                  {plan.status === "buyable" ? (
                    hasPro ? (
                      <span
                        className={`${styles.ctaBtn} ${styles.ctaSecondary} ${styles.ctaOwned}`}
                        aria-label="You already own the Pro Bundle"
                      >
                        Owned
                      </span>
                    ) : (
                      <PmqProCheckoutButton
                        returnPath={proReturnPath}
                        className={`${styles.ctaBtn} ${styles.ctaPrimary}`}
                        label={plan.ctaLabel}
                        isSignedIn={isSignedIn}
                        autoStart={resumeProCheckout}
                      />
                    )
                  ) : null}

                  {plan.status === "waitlist" ? <JoinWaitlistButton /> : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </>
  );
}
