"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { updateCheckpointProgress } from "@/lib/pmq/actions";

type ProgressCheckpointListProps = {
  items: string[];
  sectionId: string;
  courseId: string;
  loNumber: number;
  initialCompleted: number[];
  quizCompleted?: boolean;
  /** Sealed LO — checklist is review-only. */
  readOnly?: boolean;
  /** Fires once when the list transitions to fully checked (not on mount if already full). */
  onJustCompleted?: () => void;
  /** Fires whenever full-checklist readiness changes (including mount). */
  onReadyChange?: (ready: boolean) => void;
};

/**
 * Quiet SaaS checklist — optimistic ticks; completion notifies parent for celebration.
 */
export function ProgressCheckpointList({
  items,
  sectionId,
  courseId,
  loNumber,
  initialCompleted,
  readOnly = false,
  onJustCompleted,
  onReadyChange,
}: ProgressCheckpointListProps) {
  const router = useRouter();
  const [completed, setCompleted] = useState(() => new Set(initialCompleted));
  const initialKey = initialCompleted.join(",");
  const wasCompleteRef = useRef(
    items.length > 0 && initialCompleted.length >= items.length,
  );

  useEffect(() => {
    setCompleted(new Set(initialCompleted));
    wasCompleteRef.current =
      items.length > 0 && initialCompleted.length >= items.length;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional key sync
  }, [initialKey, items.length]);

  useEffect(() => {
    const ready = items.length === 0 || completed.size >= items.length;
    onReadyChange?.(ready);
  }, [completed, items.length, onReadyChange]);

  const toggle = (index: number, checked: boolean) => {
    if (readOnly) return;

    setCompleted((prev) => {
      const next = new Set(prev);
      if (checked) next.add(index);
      else next.delete(index);

      const allDone = items.length > 0 && next.size >= items.length;
      if (allDone && !wasCompleteRef.current) {
        wasCompleteRef.current = true;
        queueMicrotask(() => onJustCompleted?.());
      } else if (!allDone) {
        wasCompleteRef.current = false;
      }

      return next;
    });

    void (async () => {
      const result = await updateCheckpointProgress({
        sectionId,
        courseId,
        checkpointIndex: index,
        checked,
        loNumber,
        checkpointTotal: items.length,
      });
      if (!result.ok) {
        setCompleted((prev) => {
          const next = new Set(prev);
          if (checked) next.delete(index);
          else next.add(index);
          wasCompleteRef.current =
            items.length > 0 && next.size >= items.length;
          return next;
        });
        return;
      }
      router.refresh();
    })();
  };

  return (
    <ul className="m-0 w-full list-none divide-y divide-black/[0.06] p-0 dark:divide-white/[0.1]">
      {items.map((item, index) => {
        const isChecked = completed.has(index);
        return (
          <li key={item} className="m-0 w-full">
            <label
              className={`group flex w-full min-w-0 cursor-pointer items-start gap-3 py-3 transition-colors duration-100 ease-[var(--ease-out-quint)] first:pt-1 last:pb-1 ${
                readOnly ? "cursor-default" : "hover:bg-ink/[0.02]"
              }`}
            >
              <span className="relative mt-0.5 inline-flex shrink-0">
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={readOnly}
                  onChange={(e) => toggle(index, e.target.checked)}
                  className="peer absolute inset-0 z-10 m-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-default"
                  aria-label={item}
                />
                <span
                  aria-hidden
                  className={`pointer-events-none inline-flex size-[1.125rem] items-center justify-center rounded-[0.25rem] border transition-[background-color,border-color,transform,box-shadow] duration-100 ease-[var(--ease-out-quint)] motion-safe:peer-active:scale-90 ${
                    isChecked
                      ? "border-orange bg-orange text-paper shadow-[inset_0_0_0_1px_rgb(213_80_31_/_0.2)]"
                      : "border-ink/25 bg-paper text-transparent peer-hover:border-ink/40 peer-focus-visible:ring-2 peer-focus-visible:ring-orange/55 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-paper"
                  }`}
                >
                  <Check
                    className={`size-3 transition-[transform,opacity] duration-100 ease-[var(--ease-out-quint)] ${
                      isChecked
                        ? "scale-100 opacity-100"
                        : "scale-75 opacity-0"
                    }`}
                    strokeWidth={3}
                  />
                </span>
              </span>
              <span
                className={`w-full min-w-0 flex-1 font-body text-[15px] leading-[1.55] transition-colors duration-100 ease-[var(--ease-out-quint)] ${
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
  );
}
