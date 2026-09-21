import type { ComponentType } from "react";
import {
  IconAudio,
  IconCore,
  IconMemory,
  IconMisconceptions,
  IconMock,
  IconPractice,
  IconReport,
  IconSly,
  IconVideo,
} from "@/components/pmq/PmqPreviewFeatureIcons";
import type { PmqPlanFeature } from "@/lib/pmq/plans";

/**
 * Every icon key on `PmqPlanFeature` has a component here.
 *
 * Typed as a full Record, not Partial: a new feature row with no icon is a
 * type error, which is what left blank glyphs on the dashboard when the card
 * only knew about a subset of the pricing icons.
 */
export const PLAN_FEATURE_ICONS: Record<
  PmqPlanFeature["icon"],
  ComponentType<{ className?: string }>
> = {
  core: IconCore,
  practice: IconPractice,
  mock: IconMock,
  misconceptions: IconMisconceptions,
  memory: IconMemory,
  sly: IconSly,
  video: IconVideo,
  audio: IconAudio,
  report: IconReport,
};

/** Same mark as the pricing card's "Everything in Starter, plus" row. */
export function PlanInheritsArrow({ className }: { className?: string }) {
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

/** `{value} {label}` in the same order the pricing card uses. */
export function PlanFeatureText({
  feature,
  valueClassName,
}: {
  feature: PmqPlanFeature;
  valueClassName?: string;
}) {
  if (!feature.value) return feature.label;
  return (
    <>
      <span className={valueClassName}>{feature.value}</span> {feature.label}
    </>
  );
}
