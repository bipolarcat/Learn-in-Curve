"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
} from "react";
import { useReducedMotion } from "framer-motion";
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
import { useActivityPlayCourse } from "@/components/pmq/activities/ActivityPlayCourseContext";
import type { ActivityWrongTurnDetail } from "@/components/pmq/activities/persistence-types";
import {
  finishActivityAttempt,
  recordWrongTurn,
  startActivityAttempt,
} from "@/lib/pmq/activity-progress";
import {
  trackActivityAbandoned,
  trackActivityCompleted,
  trackActivityOpened,
  trackActivityWrongTurn,
} from "@/lib/analytics/events";
import { showProLockHint } from "@/components/pmq/ProLockHint";
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

function playHowTo(
  type: LoActivity["type"],
  reduceMotion: boolean | null,
): string {
  if (type === "pairup") {
    return reduceMotion
      ? "Select a meaning, then tap its term."
      : "Drag a meaning onto its term.";
  }
  if (type === "lineup") {
    return reduceMotion
      ? "Tap two cards to swap, then check your answer."
      : "Drag cards into order, then check your answer.";
  }
  return "Drag each card into its tray.";
}

function detectDevice(): "mobile" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  return window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop";
}

function beaconFinish(body: {
  attemptId: string;
  outcome: "completed" | "abandoned";
  moves: number;
  durationMs: number | null;
}) {
  const payload = JSON.stringify(body);
  const url = "/api/pmq/activity-attempt/finish";
  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([payload], { type: "application/json" });
      if (navigator.sendBeacon(url, blob)) return;
    }
  } catch {
    /* fall through */
  }
  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  });
}

type ActivityLauncherProps = {
  activity: LoActivity;
  className?: string;
  iconClassName?: string;
  /**
   * Starter LO2–24: show the icon with a padlock; do not open play.
   * Payload was already stripped server-side via `redactPmqInsights`.
   */
  locked?: boolean;
};

/** Icon in a study table rowhead — opens the recall activity modal. */
export function ActivityLauncher({
  activity,
  className,
  iconClassName,
  locked = false,
}: ActivityLauncherProps) {
  const { loNumber, courseId } = useActivityPlayCourse();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [playKey, setPlayKey] = useState(0);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [wrongTurns, setWrongTurns] = useState(0);
  const [completed, setCompleted] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const startedAtRef = useRef<number>(0);
  const movesRef = useRef(0);
  const attemptIdRef = useRef<string | null>(null);
  const completedRef = useRef(false);
  const wrongTurnsRef = useRef(0);
  const attemptNumberRef = useRef(1);
  const finishingRef = useRef(false);

  const reduceMotion = useReducedMotion();
  const label = ACTIVITY_DISPLAY_NAMES[activity.type];
  const Icon = ICONS[activity.type];
  const morphActive = open || hovered;
  const note = playHowTo(activity.type, reduceMotion);
  const inputMode = reduceMotion ? "tap" : "drag";

  attemptIdRef.current = attemptId;
  completedRef.current = completed;
  wrongTurnsRef.current = wrongTurns;
  attemptNumberRef.current = attemptNumber;

  const beginAttempt = useCallback(async () => {
    startedAtRef.current = Date.now();
    movesRef.current = 0;
    finishingRef.current = false;
    setCompleted(false);
    setAttemptId(null);
    setWrongTurns(0);

    const result = await startActivityAttempt({
      activity,
      courseId,
      loNumber,
      inputMode,
      device: detectDevice(),
    });

    if (!result.ok) {
      console.error("startActivityAttempt:", result.error);
      return;
    }

    setAttemptId(result.data.attemptId);
    setAttemptNumber(result.data.attemptNumber);
    setWrongTurns(result.data.totalWrongTurns);
    trackActivityOpened({
      activity_id: activity.id,
      activity_type: activity.type,
      lo_number: loNumber,
      attempt_number: result.data.attemptNumber,
      wrong_turns: result.data.totalWrongTurns,
      input_mode: inputMode,
      device: detectDevice(),
    });
  }, [activity, courseId, inputMode, loNumber]);

  useEffect(() => {
    if (!open) return;
    void beginAttempt();
  }, [open, playKey, beginAttempt]);

  const endAttempt = useCallback(
    async (
      outcome: "completed" | "abandoned",
      opts?: { beacon?: boolean; moves?: number },
    ) => {
      const id = attemptIdRef.current;
      if (!id || finishingRef.current) return;
      if (outcome === "abandoned" && completedRef.current) return;
      finishingRef.current = true;

      const moves = opts?.moves ?? movesRef.current;
      const durationMs = startedAtRef.current
        ? Math.max(0, Date.now() - startedAtRef.current)
        : null;
      const turns = wrongTurnsRef.current;
      const number = attemptNumberRef.current;

      if (outcome === "completed") {
        trackActivityCompleted({
          activity_id: activity.id,
          activity_type: activity.type,
          lo_number: loNumber,
          attempt_number: number,
          wrong_turns: turns,
          moves,
        });
      } else {
        trackActivityAbandoned({
          activity_id: activity.id,
          activity_type: activity.type,
          lo_number: loNumber,
          attempt_number: number,
          wrong_turns: turns,
          moves,
        });
      }

      if (opts?.beacon) {
        beaconFinish({
          attemptId: id,
          outcome,
          moves,
          durationMs,
        });
        return;
      }

      await finishActivityAttempt({
        attemptId: id,
        outcome,
        moves,
        durationMs,
      });
    },
    [activity.id, activity.type, loNumber],
  );

  useEffect(() => {
    if (!open) return;

    function onPageHide() {
      if (!attemptIdRef.current || completedRef.current) return;
      void endAttempt("abandoned", { beacon: true });
    }

    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, [open, endAttempt]);

  function handleClose() {
    void endAttempt("abandoned");
    setOpen(false);
  }

  function handleRetry() {
    void (async () => {
      await endAttempt("abandoned");
      setPlayKey((n) => n + 1);
    })();
  }

  const handleWrongTurn = useCallback(
    (detail: ActivityWrongTurnDetail) => {
      setWrongTurns((n) => n + 1);

      const id = attemptIdRef.current;
      const msSinceStart = startedAtRef.current
        ? Math.max(0, Date.now() - startedAtRef.current)
        : null;

      trackActivityWrongTurn({
        activity_id: activity.id,
        activity_type: activity.type,
        lo_number: loNumber,
        attempt_number: attemptNumberRef.current,
        wrong_turns: wrongTurnsRef.current + 1,
      });

      const payload = {
        attemptId: id ?? "",
        item: detail.item,
        chosen: detail.chosen,
        expected: detail.expected,
        detail: detail.detail ?? null,
        msSinceStart,
      };

      void (async () => {
        // Wait briefly if start is still in flight.
        let attemptId = id;
        if (!attemptId) {
          for (let i = 0; i < 20 && !attemptIdRef.current; i += 1) {
            await new Promise((r) => window.setTimeout(r, 50));
          }
          attemptId = attemptIdRef.current;
        }
        if (!attemptId) return;

        const body = { ...payload, attemptId };
        let result = await recordWrongTurn(body);
        if (!result.ok) {
          result = await recordWrongTurn(body);
        }
        if (result.ok) {
          setWrongTurns(result.totalWrongTurns);
        }
      })();
    },
    [activity.id, activity.type, loNumber],
  );

  const handleComplete = useCallback(
    (moves: number) => {
      movesRef.current = Math.max(movesRef.current, moves);
      setCompleted(true);
      void endAttempt("completed", { moves: movesRef.current });
    },
    [endAttempt],
  );

  const persistence = {
    wrongTurns,
    onWrongTurn: handleWrongTurn,
    onComplete: handleComplete,
  };

  if (locked) {
    return (
      <button
        type="button"
        onClick={(e) => showProLockHint("recall", e.currentTarget)}
        className={cn(
          "inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink/30 opacity-45 touch-manipulation [-webkit-tap-highlight-color:transparent]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55",
          className,
        )}
        title={`${label} — Pro`}
        aria-label={`${label} locked — Pro. Unlock recall activities with the Pro bundle.`}
      >
        <Icon active={false} className={cn("size-6", iconClassName)} />
      </button>
    );
  }

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
        <Icon
          active={morphActive}
          className={cn("size-6", iconClassName)}
        />
      </button>

      <ActivityModal
        open={open}
        onClose={handleClose}
        onRetry={handleRetry}
        returnFocusRef={buttonRef}
        eyebrow={label}
        eyebrowIcon={<Icon active className="size-4" />}
        title={activity.title}
        note={note}
        size={activity.type === "groupup" ? "wide" : "default"}
        scrollable={activity.type !== "groupup"}
      >
        {open ? (
          activity.type === "pairup" ? (
            <Pairup
              key={`${activity.id}-${playKey}`}
              activity={activity}
              {...persistence}
            />
          ) : activity.type === "lineup" ? (
            <Lineup
              key={`${activity.id}-${playKey}`}
              activity={activity}
              {...persistence}
            />
          ) : (
            <Groupup
              key={`${activity.id}-${playKey}`}
              activity={activity}
              {...persistence}
            />
          )
        ) : null}
      </ActivityModal>
    </>
  );
}
