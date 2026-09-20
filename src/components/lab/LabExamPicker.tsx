"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
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
  open: boolean;
  intent: LabExamPickerIntent;
  onClose: () => void;
  isSignedIn: boolean;
  /** Analytics location prefix, e.g. lab-hero */
  analyticsLocation: string;
};

const ROW =
  "group flex w-full min-h-[3.5rem] items-center gap-3 px-4 py-3.5 text-left no-underline transition-[background-color] duration-150 ease-[var(--ease-out-quint)] hover:bg-ink/[0.04] active:bg-ink/[0.07] sm:min-h-[3.75rem] focus-visible:outline-none focus-visible:bg-ink/[0.05] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange";

/**
 * iOS-style exam picker sheet — PFQ / PMQ for mock or course.
 * Phone-width bottom sheet (centred on desktop).
 */
export function LabExamPicker({
  open,
  intent,
  onClose,
  isSignedIn,
  analyticsLocation,
}: LabExamPickerProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  const title =
    intent === "mock" ? "Take a free mock" : "Start a free course";
  const subtitle = "Choose your exam";
  const location = `${analyticsLocation}-${intent}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    const { body, documentElement: html } = document;
    const prev = {
      bodyOverflow: body.style.overflow,
      htmlOverflow: html.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
      bodyPaddingRight: body.style.paddingRight,
    };
    const scrollbarGap = window.innerWidth - html.clientWidth;

    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    if (scrollbarGap > 0) {
      body.style.paddingRight = `${scrollbarGap}px`;
    }

    const t = window.setTimeout(() => closeRef.current?.focus(), 50);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      body.style.overflow = prev.bodyOverflow;
      html.style.overflow = prev.htmlOverflow;
      body.style.position = prev.bodyPosition;
      body.style.top = prev.bodyTop;
      body.style.width = prev.bodyWidth;
      body.style.paddingRight = prev.bodyPaddingRight;
      window.scrollTo(0, scrollY);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div
          className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center"
          role="presentation"
        >
          <motion.button
            type="button"
            aria-label="Dismiss"
            className="absolute inset-0 bg-ink/40 backdrop-blur-[6px] motion-reduce:backdrop-blur-none"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-[1] flex w-full max-w-[390px] flex-col px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:px-4 sm:pb-4"
            initial={reduce ? false : { opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={
              reduce
                ? { duration: 0 }
                : { type: "spring", bounce: 0.08, duration: 0.42 }
            }
          >
            <div className="overflow-hidden rounded-[1.35rem] border border-ink/[0.08] bg-paper/95 shadow-[0_12px_40px_-8px_rgb(var(--ink-rgb)_/_0.35)] backdrop-blur-2xl supports-[backdrop-filter]:bg-paper/88">
              <div
                className="flex flex-col items-center pt-2.5 pb-1"
                aria-hidden
              >
                <span className="h-1 w-9 rounded-full bg-ink/15" />
              </div>

              <div className="px-5 pb-3 pt-1 text-center">
                <p className="font-body text-[12px] font-medium tracking-tight text-ink/45">
                  {subtitle}
                </p>
                <h2
                  id={titleId}
                  className="mt-0.5 font-display text-[1.25rem] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[1.35rem]"
                >
                  {title}
                </h2>
              </div>

              <div className="mx-3 mb-3 overflow-hidden rounded-[1.05rem] bg-cream/90 ring-1 ring-ink/[0.06]">
                {intent === "mock" ? (
                  <ul className="m-0 list-none p-0">
                    <li>
                      <MockExamRow
                        href="/free-mock-exam/apm-pmq"
                        location={location}
                        analyticsLabel="Free PMQ mock"
                        code="APM PMQ"
                        name="Project Management Qualification"
                      />
                    </li>
                    <li className="mx-4 h-px bg-ink/[0.08]" aria-hidden />
                    <li>
                      <MockExamRow
                        href="/free-mock-exam/apm-pfq"
                        location={location}
                        analyticsLabel="Free PFQ mock"
                        code="APM PFQ"
                        name="Project Fundamentals Qualification"
                      />
                    </li>
                  </ul>
                ) : (
                  <ul className="m-0 list-none p-0">
                    <li>
                      <PmqStartLink
                        isSignedIn={isSignedIn}
                        className={ROW}
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
                    <li className="mx-4 h-px bg-ink/[0.08]" aria-hidden />
                    <li>
                      <PfqStartLink
                        isSignedIn={isSignedIn}
                        className={ROW}
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
                  </ul>
                )}
              </div>
            </div>

            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="mt-2 flex min-h-[3.25rem] w-full items-center justify-center rounded-[1.35rem] border border-ink/[0.08] bg-paper/95 font-body text-[16px] font-semibold tracking-[-0.01em] text-teal shadow-[0_8px_24px_-10px_rgb(var(--ink-rgb)_/_0.25)] backdrop-blur-2xl transition-[transform,background-color] duration-150 ease-[var(--ease-out-quint)] hover:bg-cream active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 supports-[backdrop-filter]:bg-paper/88 sm:min-h-[3.4rem]"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

function ExamRowLabel({ code, name }: { code: string; name: string }) {
  return (
    <span className="flex w-full min-w-0 flex-1 items-center gap-3">
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-body text-[16px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[17px]">
          {code}
        </span>
        <span className="font-body text-[12.5px] font-normal leading-snug tracking-tight text-ink/50 sm:text-[13px]">
          {name}
        </span>
      </span>
      <ChevronRight
        className="h-[1.15rem] w-[1.15rem] shrink-0 text-ink/25 transition-transform duration-150 ease-[var(--ease-out-quint)] group-hover:text-ink/40 group-active:translate-x-0.5"
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
      aria-busy={pending || undefined}
      aria-label={pending ? `Opening ${analyticsLabel}` : `${code} — ${name}`}
      tabIndex={pending ? -1 : undefined}
      className={`${ROW} ${pending ? "pointer-events-none opacity-80" : ""}`}
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
