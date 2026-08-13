"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import {
  resetPfqObjectiveProgress,
  updatePfqCheckpoint,
} from "@/lib/pfq/lesson-actions";
import { stampCtaSecondary } from "@/components/stamp-chip";

type Props = {
  objective: number;
  items: string[];
  initialCompleted: number[];
  initiallyComplete: boolean;
};

export function PfqCheckpointList({
  objective,
  items,
  initialCompleted,
  initiallyComplete,
}: Props) {
  const router = useRouter();
  const [completed, setCompleted] = useState(() => new Set(initialCompleted));
  const [isComplete, setIsComplete] = useState(initiallyComplete);
  const [error, setError] = useState("");
  const initialKey = initialCompleted.join(",");
  const wasCompleteRef = useRef(initiallyComplete);

  useEffect(() => {
    setCompleted(new Set(initialCompleted));
    setIsComplete(initiallyComplete);
    wasCompleteRef.current = initiallyComplete;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- key sync
  }, [initialKey, initiallyComplete, items.length]);

  const toggle = (index: number, checked: boolean) => {
    setError("");
    setCompleted((prev) => {
      const next = new Set(prev);
      if (checked) next.add(index);
      else next.delete(index);
      const allDone = items.length > 0 && next.size >= items.length;
      setIsComplete(allDone);
      wasCompleteRef.current = allDone;
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
          return next;
        });
        return;
      }
      setIsComplete(result.completed);
      router.refresh();
    })();
  };

  const reset = () => {
    setError("");
    void (async () => {
      const result = await resetPfqObjectiveProgress({ objective });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCompleted(new Set());
      setIsComplete(false);
      wasCompleteRef.current = false;
      router.refresh();
    })();
  };

  return (
    <div className="flex w-full flex-col gap-3">
      {isComplete ? (
        <p className="m-0 font-body text-[13px] font-semibold tracking-wide uppercase text-[color:rgb(var(--olive-rgb,90_110_60))]">
          Objective complete
        </p>
      ) : null}
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
      {isComplete || completed.size > 0 ? (
        <button type="button" className={stampCtaSecondary} onClick={() => reset()}>
          Reset checklist
        </button>
      ) : null}
      {error ? (
        <p className="m-0 font-body text-sm text-[color:rgb(var(--rust-rgb,180_65_45))]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
