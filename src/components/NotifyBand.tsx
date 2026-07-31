"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { NewsletterSignup } from "@/components/NewsletterSignup";

/**
 * Homepage waitlist — glass shell matching SiteHeader, with scroll-tipped mailbox.
 * Compact row: headline + email form; subjects line below.
 */
export function NotifyBand() {
  const bandRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const [delivered, setDelivered] = useState(false);

  // Tip late — once the band has risen well into mid-viewport.
  const { scrollYProgress } = useScroll({
    target: bandRef,
    offset: ["start 0.75", "start 0.25"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (reduceMotion) return;
    if (latest >= 0.75) setDelivered(true);
    else if (latest < 0.45) setDelivered(false);
  });

  return (
    <div
      ref={bandRef}
      className="notify-band flex w-full max-w-wrap flex-col gap-3 rounded-xl border border-black/[0.08] bg-paper/90 px-4 py-3.5 shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.04),0_6px_20px_rgb(var(--ink-rgb)_/_0.06)] backdrop-blur-xl supports-[backdrop-filter]:bg-paper/75 sm:gap-3.5 sm:px-5 sm:py-4 lg:px-6 dark:border-white/[0.12] [@media(prefers-reduced-transparency:reduce)]:bg-paper [@media(prefers-reduced-transparency:reduce)]:backdrop-blur-none"
    >
      <div className="flex flex-col gap-3 sm:gap-3.5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <div className="flex min-w-0 items-end gap-1 sm:gap-1.5">
          <NotifyMailboxIcon
            delivered={delivered}
            reduceMotion={reduceMotion}
          />
          <h2 className="min-w-0 pb-px font-display text-[clamp(1.15rem,2.8vw,1.5rem)] font-semibold leading-none tracking-[-0.025em] text-balance text-ink">
            Join our <span className="text-orange">newsletter</span>.
          </h2>
        </div>
        <div className="min-w-0 w-full lg:max-w-sm lg:flex-1">
          <NewsletterSignup variant="notify" />
        </div>
      </div>

      <p className="border-t border-black/[0.08] pt-2.5 text-[12px] leading-snug text-ink/65 sm:pt-3 sm:text-[13px] lg:whitespace-nowrap dark:border-white/[0.12]">
        Learn in <span className="font-semibold text-orange">Curve</span> is
        built around two subjects: Project management and AI.
      </p>
    </div>
  );
}

function NotifyMailboxIcon({
  delivered,
  reduceMotion,
}: {
  delivered: boolean;
  reduceMotion: boolean;
}) {
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-end justify-center sm:h-11 sm:w-11"
      aria-hidden
    >
      <svg
        viewBox="0 0 400 400"
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        overflow="visible"
      >
        <title>Mailbox</title>
        <line
          x1="90"
          y1="360"
          x2="310"
          y2="360"
          stroke="#1B6560"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <rect x="185" y="260" width="30" height="100" rx="6" fill="#241A12" />
        <path
          d="M110,270 L110,190 A90,90 0 0 1 290,190 L290,270 Z"
          fill="#D5501F"
          stroke="#241A12"
          strokeWidth="14"
          strokeLinejoin="round"
        />
        <path
          d="M124,192 A78,78 0 0 1 162,108"
          fill="none"
          stroke="#241A12"
          strokeWidth="16"
          strokeLinecap="round"
          opacity="0.45"
        />
        <line
          x1="130"
          y1="228"
          x2="270"
          y2="228"
          stroke="#241A12"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <motion.g
          initial={false}
          animate={{ rotate: delivered ? 78 : 0 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
          }
          style={{ transformOrigin: "72.5% 49%", transformBox: "view-box" }}
        >
          <line
            x1="290"
            y1="196"
            x2="290"
            y2="156"
            stroke="#241A12"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <polygon
            points="290,156 322,144 322,182"
            fill="#1B6560"
            stroke="#241A12"
            strokeWidth="8"
            strokeLinejoin="round"
          />
        </motion.g>
      </svg>
    </div>
  );
}
