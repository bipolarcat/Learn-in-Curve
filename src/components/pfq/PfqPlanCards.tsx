"use client";

import type { ComponentType } from "react";
import { formatGbp } from "@/lib/pmq/constants";
import {
  PFQ_PLANS,
  type PfqPlan,
  type PfqPlanFeature,
} from "@/lib/pfq/plans";
import { PFQ_AI_PRO_NOTIFY_KEY } from "@/lib/notify/lists";
import {
  IconCore,
  IconMisconceptions,
  IconMock,
  IconPractice,
  IconReport,
} from "@/components/pmq/PmqPreviewFeatureIcons";
import { JoinWaitlistButton } from "@/components/pmq/JoinWaitlistButton";
import { PfqCheckoutButton } from "@/components/pfq/PfqCheckoutButton";
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
    ) : (
      <>
        <span className={styles.aiProMark}>AI Pro</span> Bundle
      </>
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

type PfqPlanCardsProps = {
  isSignedIn: boolean;
  hasPro?: boolean;
  resumeProCheckout?: boolean;
};

/**
 * Two-tier plan ladder for PFQ in 2 days — same card chrome as PMQ.
 * Pro checkout stays behind PFQ_CHECKOUT_ENABLED. AI Pro is waitlist-only.
 */
export function PfqPlanCards({
  isSignedIn,
  hasPro = false,
  resumeProCheckout = false,
}: PfqPlanCardsProps) {
  return (
    <ul className={styles.gridTwo} role="list">
      {PFQ_PLANS.map((plan) => {
        const inherited = plan.inheritsFrom
          ? PFQ_PLANS.find((item) => item.id === plan.inheritsFrom)
          : null;

        return (
          <li key={plan.id} className={styles.card}>
            <div className={styles.head}>
              <p className={styles.courseKicker}>For PFQ in 2 Days</p>
              <PlanName plan={plan} soonBadge={plan.status === "waitlist"} />

              <div className={styles.priceRow}>
                <span className={styles.price}>{formatGbp(plan.priceCents)}</span>
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
              {plan.status === "buyable" ? (
                hasPro ? (
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
