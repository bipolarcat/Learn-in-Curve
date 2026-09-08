"use client";

import { useRef, useState } from "react";
import { LayoutGrid, Link2, ListOrdered, type LucideIcon } from "lucide-react";
import type { LoActivity } from "@/types/pmq";
import { ActivityModal } from "@/components/pmq/activities/ActivityModal";
import { ACTIVITY_DISPLAY_NAMES } from "@/components/pmq/activities/names";
import { Pairup } from "@/components/pmq/activities/Pairup";
import { Lineup } from "@/components/pmq/activities/Lineup";
import { Groupup } from "@/components/pmq/activities/Groupup";
import { cn } from "@/lib/utils";

const ICONS: Record<LoActivity["type"], LucideIcon> = {
  pairup: Link2,
  lineup: ListOrdered,
  groupup: LayoutGrid,
};

type ActivityLauncherProps = {
  activity: LoActivity;
  className?: string;
};

/** Icon in a study table rowhead — opens the recall activity modal. */
export function ActivityLauncher({ activity, className }: ActivityLauncherProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const label = ACTIVITY_DISPLAY_NAMES[activity.type];
  const Icon = ICONS[activity.type];

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(true)}
        title={label}
        aria-label={`${label}: ${activity.title}`}
        className={cn(
          "inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-teal/30 bg-teal/10 text-teal transition-colors duration-150 ease-[var(--ease-out-quint)] touch-manipulation hover:border-teal/50 hover:bg-teal/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55",
          className,
        )}
      >
        <Icon className="size-3.5" strokeWidth={2} aria-hidden />
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
