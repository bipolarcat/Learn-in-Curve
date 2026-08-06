"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { StatusCircleWipe } from "@/components/SiteStatusCircleWipe";
import { Spinner } from "@/components/ui/spinner";
import {
  formActionPrimary,
  formActionSecondary,
} from "@/components/ui/semantic";

export type SiteStatusVariant = "not-found" | "error";

type SiteStatusPageProps = {
  variant: SiteStatusVariant;
  /** Kept for callers (`error.tsx`); secondary CTA is always Go back. */
  onRetry?: () => void;
};

const COPY: Record<
  SiteStatusVariant,
  { title: ReactNode; body: string }
> = {
  "not-found": {
    title: (
      <>
        Page not <span className="text-orange">found</span>
      </>
    ),
    body: "That page might have moved, been renamed, or never existed. Let's get you back on track.",
  },
  error: {
    title: (
      <>
        Something went <span className="text-orange">wrong</span>
      </>
    ),
    body: "We hit an unexpected snag loading this page. Go back or head home and pick up from there.",
  },
};

/**
 * Shared LIC status surface for 404 + runtime error.
 * Cream paper, Fraunces headline, body CTAs, soft colour wipe
 * (LIC rewrite of the black/stick-figure demo).
 */
export function SiteStatusPage({ variant }: SiteStatusPageProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [homePending, startHome] = useTransition();
  const [backPending, startBack] = useTransition();

  const copy = COPY[variant];

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setVisible(true);
      return;
    }
    const t = window.setTimeout(() => setVisible(true), 900);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-12 sm:px-8 sm:py-16">
      <StatusCircleWipe />

      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <span className="status-float absolute left-[8%] top-[18%] block size-10 rounded-full border border-ink/10 bg-paper/70 shadow-[2px_2px_0_rgb(var(--ink-rgb)_/_0.06)] sm:size-12" />
        <span className="status-float absolute right-[10%] top-[28%] block size-8 rounded-full border border-orange/25 bg-orange/10 shadow-[2px_2px_0_rgb(var(--ink-rgb)_/_0.05)] [animation-delay:-3s] sm:size-10" />
        <span className="status-float absolute bottom-[16%] left-[14%] block size-9 rounded-full border border-teal/20 bg-teal/10 shadow-[2px_2px_0_rgb(var(--ink-rgb)_/_0.05)] [animation-delay:-5.5s] sm:size-11" />
      </div>

      <div
        className={`relative z-[1] flex w-full max-w-[28rem] flex-col items-center text-center transition-opacity duration-500 ease-[var(--ease-out-quint)] motion-reduce:transition-none ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <Link
          href="/"
          className="brand mb-7 inline-flex items-center gap-2.5 no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2"
        >
          <Logo size={36} className="h-9 w-9" alt="" />
          <span className="brand-name flex w-max flex-col font-display text-[clamp(0.68rem,1.3vw,0.8rem)] font-bold leading-none tracking-[-0.02em] text-ink">
            <span className="whitespace-nowrap leading-none">Learn in</span>
            <span className="-mt-[0.08em] whitespace-nowrap text-[1.41em] leading-none tracking-[-0.03em] text-orange">
              Curve
            </span>
          </span>
        </Link>

        <h1 className="m-0 font-display text-[clamp(1.85rem,4.5vw,2.6rem)] font-bold leading-[1.08] tracking-[-0.035em] text-balance text-ink">
          {copy.title}
        </h1>
        <p className="mt-1 font-display text-[clamp(3.5rem,12vw,5.5rem)] font-extrabold leading-none tracking-[-0.04em] text-ink/12">
          {variant === "not-found" ? "404" : "!"}
        </p>
        <p className="mt-3 max-w-[36ch] font-body text-[15px] leading-relaxed text-pretty text-ink/70">
          {copy.body}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            disabled={backPending}
            aria-busy={backPending}
            className={`${formActionSecondary} !min-h-10 !px-4 !text-[13px] disabled:cursor-wait disabled:opacity-80`}
            onClick={() => {
              startBack(() => {
                if (window.history.length > 1) {
                  router.back();
                } else {
                  router.push("/");
                }
              });
            }}
          >
            {backPending ? (
              <Spinner
                variant="ellipsis"
                size={14}
                className="text-current"
                aria-hidden
              />
            ) : (
              "Go back"
            )}
          </button>

          <button
            type="button"
            disabled={homePending}
            aria-busy={homePending}
            className={`${formActionPrimary} !min-h-10 !px-4 !text-[13px] disabled:cursor-wait disabled:opacity-80`}
            onClick={() => {
              startHome(() => {
                router.push("/");
              });
            }}
          >
            {homePending ? (
              <Spinner
                variant="ellipsis"
                size={14}
                className="text-current"
                aria-hidden
              />
            ) : (
              "Go home"
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
