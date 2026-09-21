"use client";

import { ScrollReveal } from "@/components/ScrollReveal";
import { SlyTutorWindow } from "@/components/SlyTutorWindow";
import styles from "@/components/SlyShowcase.module.css";
import { BetaBadge } from "@/components/pmq/tier-badge";

type SlyShowcaseProps = {
  isSignedIn: boolean;
};

/**
 * Sly — console plus text, one window.
 *
 * No stadium/panel chrome — sits on page paper. Presence from heading scale +
 * console lift only (Method band already owns the coloured stage).
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
      className={`${styles.section} sly-showcase relative overflow-x-clip text-ink`}
      aria-labelledby="sly-showcase-heading"
    >
      <div className="wrap relative z-[1]">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-center lg:gap-12">
          <ScrollReveal
            delay={0.12}
            className={`${styles.consoleReveal} order-2 w-full min-w-0 lg:order-1`}
          >
            <SlyTutorWindow isSignedIn={isSignedIn} />
          </ScrollReveal>

          <ScrollReveal
            className={`${styles.textPop} order-1 w-full max-w-[28rem] lg:order-2 lg:justify-self-end`}
          >
            <div
              className={`${styles.popItem}`}
              style={{ ["--i" as string]: 0 }}
            >
              <h2
                id="sly-showcase-heading"
                className={`${styles.heading} min-w-0 max-w-full font-display text-ink text-balance`}
              >
                <span className="block">Stuck on a syllabus topic?</span>
                <span className="block">
                  Ask <span className="text-orange">Sly</span>.{" "}
                  <span className="relative -top-0.5 inline-flex align-middle">
                    <BetaBadge />
                  </span>
                </span>
              </h2>
            </div>

            <p
              className={`${styles.popItem} ${styles.lede}`}
              style={{ ["--i" as string]: 1 }}
            >
              Ask, learn and get unstuck with your personal{" "}
              <span className="whitespace-nowrap">AI tutor.</span>
              <br />
              Sly is trained on the APM PMQ syllabus. Ask three questions free,
              no sign-up required.
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
