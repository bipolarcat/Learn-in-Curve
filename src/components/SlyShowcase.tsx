"use client";

import Image from "next/image";

import { ScrollReveal } from "@/components/ScrollReveal";
import { SlyTutorWindow } from "@/components/SlyTutorWindow";
import styles from "@/components/SlyShowcase.module.css";
import {
  AiTutorBadge,
  BetaBadge,
} from "@/components/pmq/tier-badge";

type SlyShowcaseProps = {
  isSignedIn: boolean;
};

/**
 * Sly — console plus text, one window.
 *
 * Compliance note: Sly is a Beta taster of a paid feature, so the free/paid
 * boundary has to be unmissable. A free account gets the course; the tutor
 * questions here are a taster; unlimited Sly ships later with AI Pro (a
 * waitlist tier in `plans.ts`, not on sale). If a visitor could reasonably read
 * "free account" as including the tutor, that's a misleading omission under the
 * CPRs — and in practice it generates refund requests.
 */
export function SlyShowcase({ isSignedIn }: SlyShowcaseProps) {
  return (
    <section
      id="sly"
      className="sly-showcase relative overflow-x-clip pt-[clamp(2rem,5vw,3rem)] pb-[clamp(3rem,6vw,5rem)] text-ink"
      aria-labelledby="sly-showcase-heading"
    >
      <div className="wrap relative z-[1] grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-center lg:gap-12">
        <ScrollReveal
          delay={0.12}
          className={`${styles.consoleReveal} order-2 w-full min-w-0 lg:order-1`}
        >
          <SlyTutorWindow isSignedIn={isSignedIn} />
        </ScrollReveal>

        <ScrollReveal
          className={`${styles.textPop} order-1 max-w-[22rem] lg:order-2 lg:justify-self-end`}
        >
          <div
            className={`${styles.popItem} flex flex-col items-start`}
            style={{ ["--i" as string]: 0 }}
          >
            <div className="flex items-center gap-3">
              <span className="relative -mt-1 inline-flex h-12 w-12 shrink-0 overflow-hidden rounded-full border border-ink/12 bg-paper shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.06)] sm:-mt-2 sm:h-16 sm:w-16">
                <Image
                  src="/brand/sly/sly-tutor-portrait.png"
                  alt="Sly, the AI tutor — fox portrait"
                  width={64}
                  height={64}
                  className="h-full w-full scale-[1.2] object-cover object-[center_18%] sm:scale-[1.28] sm:object-[center_19%]"
                />
              </span>
              <AiTutorBadge />
            </div>
            <div className="min-w-0">
              <h2
                id="sly-showcase-heading"
                className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-display text-[clamp(1.55rem,3.2vw,2.35rem)] font-bold leading-[1.05] tracking-[-0.03em] text-ink text-balance"
              >
                <span>
                  Learn faster with <span className="text-orange">Sly</span> — Your
                  personal AI Tutor
                </span>
                <BetaBadge />
              </h2>
            </div>
          </div>

          <p
            className={`${styles.popItem} mt-3 text-[14px] leading-relaxed text-ink/65 text-pretty`}
            style={{ ["--i" as string]: 1 }}
          >
            Ask, learn and get unstuck. Unlimited Sly access is coming soon with AI
            Pro.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
