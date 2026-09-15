"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import {
  updatePfqCheckpoint,
} from "@/lib/pfq/lesson-actions";
import { LoCheckpointCelebration } from "@/components/pmq/LoCheckpointCelebration";

type Props = {
  objective: number;
  items: string[];
  initialCompleted: number[];
  initiallyComplete: boolean;
  /** Fires when checklist readiness changes (all items done). */
  onReadyChange?: (ready: boolean) => void;
};

export function PfqCheckpointList({
  objective,
  items,
  initialCompleted,
  initiallyComplete,
  onReadyChange,
}: Props) {
  const router = useRouter();
  const [completed, setCompleted] = useState(() => new Set(initialCompleted));
  const [isComplete, setIsComplete] = useState(initiallyComplete);
  const [celebrating, setCelebrating] = useState(false);
  const [error, setError] = useState("");
  const initialKey = initialCompleted.join(",");
  const wasCompleteRef = useRef(initiallyComplete);

  useEffect(() => {
    setCompleted(new Set(initialCompleted));
    setIsComplete(initiallyComplete);
    wasCompleteRef.current = initiallyComplete;
    onReadyChange?.(initiallyComplete || items.length <= 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- key sync
  }, [initialKey, initiallyComplete, items.length]);

  useEffect(() => {
    onReadyChange?.(isComplete || items.length <= 0);
  }, [isComplete, items.length, onReadyChange]);

  const endCelebration = useCallback(() => {
    setCelebrating(false);
  }, []);

  const toggle = (index: number, checked: boolean) => {
    setError("");
    setCompleted((prev) => {
      const next = new Set(prev);
      if (checked) next.add(index);
      else next.delete(index);
      const allDone = items.length > 0 && next.size >= items.length;
      if (allDone && !wasCompleteRef.current) {
        wasCompleteRef.current = true;
        queueMicrotask(() => setCelebrating(true));
      } else if (!allDone) {
        wasCompleteRef.current = false;
      }
      setIsComplete(allDone);
      return next;
    });

    void (async () => {
      const result = await updatePfqCheckpoint({
        objective,
        checkpointIndex: index,
        checked,
      });
      if (!result.ok) {
        setError(result.error);
        setCompleted((prev) => {
          const next = new Set(prev);
          if (checked) next.delete(index);
          else next.add(index);
          const allDone = items.length > 0 && next.size >= items.length;
          setIsComplete(allDone);
          wasCompleteRef.current = allDone;
          return next;
        });
        return;
      }
      setIsComplete(result.completed);
      router.refresh();
    })();
  };

  return (
    <div className="flex w-full flex-col gap-3">
      <ul className="m-0 w-full list-none divide-y divide-ink/10 p-0">
        {items.map((item, index) => {
          const isChecked = completed.has(index);
          return (
            <li key={item} className="m-0 w-full">
              <label className="group flex w-full min-w-0 cursor-pointer items-start gap-3 py-3 first:pt-1 last:pb-1">
                <span className="relative mt-0.5 inline-flex shrink-0">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => toggle(index, e.target.checked)}
                    className="peer absolute inset-0 z-10 m-0 h-full w-full cursor-pointer opacity-0"
                    aria-label={item}
                  />
                  <span
                    aria-hidden
                    className={`pointer-events-none inline-flex size-[1.125rem] items-center justify-center rounded-[0.25rem] border ${
                      isChecked
                        ? "border-orange bg-orange text-paper"
                        : "border-ink/25 bg-paper text-transparent"
                    }`}
                  >
                    <Check
                      className={`size-3 ${isChecked ? "opacity-100" : "opacity-0"}`}
                      strokeWidth={3}
                    />
                  </span>
                </span>
                <span
                  className={`w-full min-w-0 flex-1 font-body text-[15px] leading-[1.55] ${
                    isChecked ? "text-ink/55" : "text-ink/90"
                  }`}
                >
                  {item}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      {error ? (
        <p
          className="m-0 font-body text-sm text-[color:rgb(var(--rust-rgb,180_65_45))]"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <LoCheckpointCelebration open={celebrating} onDone={endCelebration} />
    </div>
  );
}
