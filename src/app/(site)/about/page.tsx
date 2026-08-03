import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import { ScrollReveal } from "@/components/ScrollReveal";
import { stampCtaPrimary } from "@/components/stamp-chip";
import styles from "./AboutPage.module.css";

export const metadata: Metadata = {
  title: "About - Learn in Curve",
  description:
    "Why Learn in Curve exists — simple, honest revision for project management exams.",
};

function LinkedInIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

/** Small straight stamp — fixed size so Next `fill` never collapses. */
function ArtFrame({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <div className="relative h-[128px] w-[128px] shrink-0 overflow-hidden rounded-lg border border-ink/30 bg-paper shadow-[2px_2px_0_var(--shadow-ink)] sm:h-[144px] sm:w-[144px]">
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="144px"
        className="object-cover"
      />
    </div>
  );
}

function SectionHeading({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  return (
    <h2
      id={id}
      className="mb-3 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-extrabold tracking-[-0.03em] text-balance text-ink"
    >
      {children}
    </h2>
  );
}

type BlockProps = {
  id: string;
  title: string;
  src: string;
  alt: string;
  body: ReactNode;
  /** Art on the right (Goal). Default: art left. */
  artEnd?: boolean;
  priority?: boolean;
};

function AboutBlock({
  id,
  title,
  src,
  alt,
  body,
  artEnd = false,
  priority = false,
}: BlockProps) {
  return (
    <section
      className={`${styles.block} relative overflow-hidden`}
      aria-labelledby={id}
    >
      <div className="wrap">
        <ScrollReveal>
          <div
            className={`flex max-w-[52rem] items-start gap-5 sm:gap-6 ${
              artEnd ? "flex-row-reverse" : ""
            }`}
          >
            <ArtFrame src={src} alt={alt} priority={priority} />
            <div className="min-w-0 flex-1 pt-0.5">
              <SectionHeading id={id}>{title}</SectionHeading>
              <p className="max-w-[48ch] text-base leading-relaxed text-pretty text-ink/80 sm:text-[17px]">
                {body}
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/**
 * About — continuous dotted paper; tiny stamp art inline with copy.
 */
export default function AboutPage() {
  return (
    <div className="relative text-ink">
      <section
        className={`${styles.hero} relative overflow-hidden`}
        aria-labelledby="about-hero-title"
      >
        <div className="wrap relative z-[1] text-left">
          <h1
            id="about-hero-title"
            className="hero-enter mb-4 max-w-[16ch] font-display text-[clamp(2.5rem,5.5vw,4rem)] font-extrabold leading-[0.94] tracking-[-0.035em] text-ink"
            style={{ "--hero-i": 0 } as CSSProperties}
          >
            About Us
          </h1>
          <p
            className="hero-enter max-w-[28ch] font-display text-[clamp(1.35rem,2.8vw,1.9rem)] font-semibold leading-[1.15] tracking-[-0.025em] text-pretty text-ink"
            style={{ "--hero-i": 1 } as CSSProperties}
          >
            Why Learn in <span className="text-orange">Curve</span> exists
          </p>
        </div>
      </section>

      <AboutBlock
        id="about-vision"
        title="Vision"
        src="/brand/inspo/about-vision.jpg"
        alt="Flat poster illustration of a person studying with a ticket-shaped booklet"
        priority
        body={
          <>
            Studying for a project management exam shouldn&apos;t feel like a
            chore. We want revision to feel simple, honest, and actually
            doable — something you can fit into a lunch break or a commute and
            still feel like it&apos;s working.
          </>
        }
      />

      <AboutBlock
        id="about-goal"
        title="Goal"
        src="/brand/inspo/about-goal.jpg"
        alt="Flat poster illustration of a figure before a bold orange arch"
        artEnd
        body={
          <>
            Our goal is simple: help you walk into your PMQ exam feeling
            properly ready, not just like you&apos;ve scrolled through a lot of
            slides. Everything here is built around one thing — getting you to
            pass.
          </>
        }
      />

      <AboutBlock
        id="about-values"
        title="Values"
        src="/brand/inspo/about-values.jpg"
        alt="Flat poster illustration of an orange stamp seal beside paper"
        body={
          <>
            We value honesty over polish, usefulness over fluff, and care over
            scale. That means saying plainly what&apos;s free and what
            isn&apos;t, building the thing that actually helps you pass, and
            never dressing up a weak product with hype — even when the flashy
            version would be easier to ship.
          </>
        }
      />

      <section
        className={`${styles.founder} relative overflow-hidden`}
        aria-labelledby="about-founder"
      >
        <div className="wrap">
          <ScrollReveal>
            <div className={`${styles.aboutRow} flex max-w-[52rem] items-start gap-5 border-t border-ink/20 pt-10 sm:gap-6 sm:pt-12`}>
              <div className="relative h-[128px] w-[128px] shrink-0 overflow-hidden rounded-lg border border-ink/30 bg-sand shadow-[2px_2px_0_var(--shadow-ink)] sm:h-[144px] sm:w-[144px]">
                <Image
                  src="/brand/sim-profile.jpg"
                  alt="Sim, founder of Learn in Curve"
                  fill
                  sizes="144px"
                  className="object-cover object-top"
                />
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <SectionHeading id="about-founder">Founder</SectionHeading>
                <p className="max-w-[48ch] text-base leading-relaxed text-pretty text-ink/80 sm:text-[17px]">
                  Learn in Curve was built by one person — a working project
                  manager named Sim, who&apos;s spent years managing real projects
                  and real deadlines, and who got curious about what AI could do
                  to make studying less painful. This isn&apos;t a big company.
                  It&apos;s a genuine attempt to build the thing he wished someone
                  had built for him — made with a lot of care, and a bit of
                  stubbornness.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <a
                    href="https://www.linkedin.com/in/simsamaarshened"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={stampCtaPrimary}
                  >
                    <LinkedInIcon className="shrink-0" />
                    Connect with Sim on LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
