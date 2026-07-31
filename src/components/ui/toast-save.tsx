"use client";

import { Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export type ToastSaveState = "initial" | "loading" | "success";

type ToastSaveProps = {
  state: ToastSaveState;
  onSave?: () => void;
  loadingText?: string;
  successText?: string;
  initialText?: string;
  saveText?: string;
  className?: string;
};

const InfoIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 18 18"
    className={cn("text-current", className)}
    aria-hidden
  >
    <g
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      stroke="currentColor"
    >
      <circle cx="9" cy="9" r="7.25" />
      <line x1="9" y1="12.819" x2="9" y2="8.25" />
      <path
        d="M9,6.75c-.552,0-1-.449-1-1s.448-1,1-1,1,.449,1,1-.448,1-1,1Z"
        fill="currentColor"
        stroke="none"
      />
    </g>
  </svg>
);

const springConfig = {
  type: "spring" as const,
  stiffness: 500,
  damping: 30,
  mass: 1,
};

/**
 * Compact morphing save bar — unsaved → saving → saved.
 * Brand tokens (orange / olive); uses shared Spinner + Button.
 */
export function ToastSave({
  state = "initial",
  onSave,
  loadingText = "Saving",
  successText = "Changes Saved",
  initialText = "Unsaved changes",
  saveText = "Save",
  className,
}: ToastSaveProps) {
  return (
    <motion.div
      className={cn(
        "inline-flex h-8 w-fit max-w-full items-center justify-center overflow-hidden rounded-full",
        "border border-black/[0.08] bg-paper/95 backdrop-blur",
        "shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_4px_10px_-3px_rgba(0,0,0,0.08)]",
        "dark:border-white/[0.08]",
        "dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_4px_10px_-3px_rgba(0,0,0,0.2)]",
        className,
      )}
      initial={false}
      animate={{ width: "auto" }}
      transition={springConfig}
      role="status"
      aria-live="polite"
    >
      <div className="flex h-full w-full items-center justify-between gap-1.5 px-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            className="flex items-center gap-1.5 text-ink"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0 }}
          >
            {state === "loading" && (
              <>
                <Spinner
                  variant="circle"
                  size={13}
                  className="text-ink/55"
                  aria-hidden
                />
                <div className="whitespace-nowrap text-[11px] font-medium leading-tight tracking-tight">
                  {loadingText}
                </div>
              </>
            )}
            {state === "success" && (
              <>
                <div className="flex items-center justify-center overflow-hidden rounded-full border border-olive/20 bg-olive/10 p-0.5 dark:border-olive/25 dark:bg-olive/25">
                  <Check
                    className="size-2.5 text-olive"
                    strokeWidth={3}
                    aria-hidden
                  />
                </div>
                <div className="whitespace-nowrap text-[11px] font-medium leading-tight tracking-tight">
                  {successText}
                </div>
              </>
            )}
            {state === "initial" && (
              <>
                <div className="text-ink/50">
                  <InfoIcon />
                </div>
                <div className="whitespace-nowrap text-[11px] font-medium leading-tight tracking-tight">
                  {initialText}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
        <AnimatePresence>
          {state === "initial" && (
            <motion.div
              className="ml-1 flex items-center"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ ...springConfig, opacity: { duration: 0 } }}
            >
              <Button
                type="button"
                onClick={onSave}
                className={cn(
                  "h-6 rounded-full px-2.5 py-0 text-[11px] font-semibold text-paper",
                  "border border-transparent bg-orange",
                  "hover:bg-action-hover",
                  "shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.28)]",
                  "transition-colors duration-150",
                )}
              >
                {saveText}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
