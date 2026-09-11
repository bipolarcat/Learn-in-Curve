"use client";

import { useRef, useState, type ComponentType } from "react";
import type { LoActivity } from "@/types/pmq";
import { ActivityModal } from "@/components/pmq/activities/ActivityModal";
import { ACTIVITY_DISPLAY_NAMES } from "@/components/pmq/activities/names";
import { Pairup } from "@/components/pmq/activities/Pairup";
import { Lineup } from "@/components/pmq/activities/Lineup";
import { Groupup } from "@/components/pmq/activities/Groupup";
import {
  ActivityGroupupIcon,
  ActivityLineupIcon,
  ActivityPairupIcon,
} from "@/components/pmq/activities/ActivityIcons";
import { cn } from "@/lib/utils";

type ActivityIconProps = {
  active?: boolean;
  className?: string;
};

const ICONS: Record<
  LoActivity["type"],
  ComponentType<ActivityIconProps>
> = {
  pairup: ActivityPairupIcon,
  lineup: ActivityLineupIcon,
  groupup: ActivityGroupupIcon,
};

type ActivityLauncherProps = {
  activity: LoActivity;
  className?: string;
};

/** Icon in a study table rowhead — opens the recall activity modal. */
export function ActivityLauncher({ activity, className }: ActivityLauncherProps) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const label = ACTIVITY_DISPLAY_NAMES[activity.type];
  const Icon = ICONS[activity.type];
  const morphActive = open || hovered;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title={label}
        aria-label={`${label}: ${activity.title}`}
        aria-expanded={open}
        className={cn(
          "group inline-flex size-9 shrink-0 items-center justify-center rounded-md text-teal transition-colors duration-150 ease-[var(--ease-out-quint)] touch-manipulation [-webkit-tap-highlight-color:transparent]",
          "hover:text-teal/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55",
          open && "text-teal",
          className,
        )}
      >
        <Icon active={morphActive} className="size-4" />
      </button>

      <ActivityModal
        open={open}
        onClose={() => setOpen(false)}
        returnFocusRef={buttonRef}
        eyebrow={label}
        title={activity.title}
        note={activity.note}
      >
        {/* Remount on each open so shuffle runs again */}
        {open ? (
          activity.type === "pairup" ? (
            <Pairup key={activity.id} activity={activity} />
          ) : activity.type === "lineup" ? (
            <Lineup key={activity.id} activity={activity} />
          ) : (
            <Groupup key={activity.id} activity={activity} />
          )
        ) : null}
      </ActivityModal>
    </>
  );
}
