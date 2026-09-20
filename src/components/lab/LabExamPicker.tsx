"use client";

import {
  useEffect,
  useId,
  useRef,
  useTransition,
  type MouseEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { PmqStartLink } from "@/components/PmqStartLink";
import { PfqStartLink } from "@/components/pfq/PfqStartLink";
import { Spinner } from "@/components/ui/spinner";
import { trackCtaClicked } from "@/lib/analytics/events";
import {
  isSoftNavClick,
  withSoftNavFrom,
} from "@/lib/soft-nav-back";

const EASE = [0.22, 1, 0.36, 1] as const;

export type LabExamPickerIntent = "mock" | "course";

type LabExamPickerProps = {
  intent: LabExamPickerIntent | null;
  onClose: () => void;
  isSignedIn: boolean;
  /** Analytics location prefix, e.g. lab-hero */
  analyticsLocation: string;
};

const ROW =
  "group flex w-full min-h-12 items-center gap-3 px-3.5 py-2.5 text-left no-underline transition-[background-color,transform] duration-150 ease-[var(--ease-out-quint)] hover:bg-ink/[0.05] active:scale-[0.99] active:bg-ink/[0.08] focus-visible:outline-none focus-visible:bg-ink/[0.05] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange sm:min-h-[3.25rem] sm:px-4";

/**
 * Inline exam dropdown under the hero/Sly CTAs — cleaner list rows, not a modal.
 */
export function LabExamPicker({
  intent,
  onClose,
  isSignedIn,
  analyticsLocation,
}: LabExamPickerProps) {
  const open = intent !== null;
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const location = intent ? `${analyticsLocation}-${intent}` : analyticsLocation;

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    const onPointer = (e: Event) => {
      const el = panelRef.current;
      if (!el) return;
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (el.contains(target)) return;
      if (
        target instanceof Element &&
        target.closest("[data-lab-exam-cta]")
      ) {
        return;
      }
      onClose();
    };

    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, onClose]);

  const heading =
    intent === "mock"
      ? "Which mock?"
      : intent === "course"
        ? "Which course?"
        : "";

  return (
    <AnimatePresence>
      {open && intent ? (
        <motion.div
          ref={panelRef}
          id={panelId}
          role="listbox"
          aria-label={
            intent === "mock"
              ? "Choose exam for free mock"
              : "Choose exam for free course"
          }
          className="w-full max-w-[22rem] origin-top"
          initial={reduce ? false : { opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={
            reduce
              ? { duration: 0 }
              : { type: "spring", bounce: 0.12, duration: 0.32 }
          }
        >
          <div className="overflow-hidden rounded-2xl border border-ink/10 bg-paper/95 shadow-[0_1px_0_rgb(var(--ink-rgb)_/_0.04),0_12px_32px_-12px_rgb(var(--ink-rgb)_/_0.28)] backdrop-blur-xl supports-[backdrop-filter]:bg-paper/88">
            <div className="flex items-center justify-between gap-2 border-b border-ink/[0.06] px-3.5 py-2.5 sm:px-4">
              <p className="font-body text-[12px] font-semibold tracking-tight text-ink/50">
                {heading}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-2 py-1 font-body text-[12px] font-medium text-ink/45 transition-colors hover:bg-ink/[0.05] hover:text-ink/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
              >
                Close
              </button>
            </div>

            <ul className="m-0 list-none p-1 sm:p-1.5">
              {intent === "mock" ? (
                <>
                  <li role="option">
                    <MockExamRow
                      href="/free-mock-exam/apm-pmq"
                      location={location}
                      analyticsLabel="Free PMQ mock"
                      code="APM PMQ"
                      name="Project Management Qualification"
                    />
                  </li>
                  <li className="mx-2.5 h-px bg-ink/[0.07]" aria-hidden />
                  <li role="option">
                    <MockExamRow
                      href="/free-mock-exam/apm-pfq"
                      location={location}
                      analyticsLabel="Free PFQ mock"
                      code="APM PFQ"
                      name="Project Fundamentals Qualification"
                    />
                  </li>
                </>
              ) : (
                <>
                  <li role="option">
                    <PmqStartLink
                      isSignedIn={isSignedIn}
                      className={`${ROW} rounded-xl`}
                      from="home"
                      showArrow={false}
                      analyticsLocation={location}
                      analyticsVariant="Start PMQ course"
                    >
                      <ExamRowLabel
                        code="APM PMQ"
                        name="Project Management Qualification"
                      />
                    </PmqStartLink>
                  </li>
                  <li className="mx-2.5 h-px bg-ink/[0.07]" aria-hidden />
                  <li role="option">
                    <PfqStartLink
                      isSignedIn={isSignedIn}
                      className={`${ROW} rounded-xl`}
                      from="home"
                      showArrow={false}
                      analyticsLocation={location}
                      analyticsVariant="Start PFQ course"
                    >
                      <ExamRowLabel
                        code="APM PFQ"
                        name="Project Fundamentals Qualification"
                      />
                    </PfqStartLink>
                  </li>
                </>
              )}
            </ul>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function ExamRowLabel({ code, name }: { code: string; name: string }) {
  return (
    <span className="flex w-full min-w-0 flex-1 items-center gap-2.5">
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-body text-[14px] font-semibold leading-tight tracking-[-0.015em] text-ink sm:text-[15px]">
          {code}
        </span>
        <span className="font-body text-[11.5px] font-normal leading-snug tracking-tight text-ink/48 sm:text-[12px]">
          {name}
        </span>
      </span>
      <ChevronRight
        className="h-4 w-4 shrink-0 text-ink/25 transition-transform duration-150 ease-[var(--ease-out-quint)] group-hover:translate-x-0.5 group-hover:text-teal"
        strokeWidth={2.25}
        aria-hidden
      />
    </span>
  );
}

function MockExamRow({
  href: hrefProp,
  location,
  analyticsLabel,
  code,
  name,
}: {
  href: string;
  location: string;
  analyticsLabel: string;
  code: string;
  name: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const href = withSoftNavFrom(hrefProp, "home");

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    trackCtaClicked({ variant: analyticsLabel, location });
    if (!isSoftNavClick(event)) return;
    event.preventDefault();
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <Link
      href={href}
      role="option"
      aria-busy={pending || undefined}
      aria-label={pending ? `Opening ${analyticsLabel}` : `${code} — ${name}`}
      tabIndex={pending ? -1 : undefined}
      className={`${ROW} rounded-xl ${pending ? "pointer-events-none opacity-80" : ""}`}
      onClick={onClick}
    >
      {pending ? (
        <span className="flex w-full items-center justify-center py-1">
          <Spinner variant="ellipsis" size={14} className="text-ink/50" />
        </span>
      ) : (
        <ExamRowLabel code={code} name={name} />
      )}
    </Link>
  );
}
