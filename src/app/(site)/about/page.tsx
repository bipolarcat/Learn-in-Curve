import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import { ScrollReveal } from "@/components/ScrollReveal";
import { stampCtaPrimaryCompact } from "@/components/stamp-chip";
import styles from "./AboutPage.module.css";

export const metadata: Metadata = {
  title: "About - Learn in Curve",
  description:
    "An AI-powered education platform helping project managers stay ahead of the curve.",
};

const FOUNDER_LINKEDIN = "https://www.linkedin.com/in/simsamaarshened";

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
    <div className={styles.artFrame}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 640px) 100vw, 240px"
        className="object-cover"
      />
    </div>
  );
}

type BlockProps = {
  id: string;
  title: string;
  src: string;
  alt: string;
  lead: string;
  body: ReactNode;
  artEnd?: boolean;
  priority?: boolean;
};

function AboutBlock({
  id,
  title,
  src,
  alt,
  lead,
  body,
  artEnd = false,
  priority = false,
}: BlockProps) {
  return (
    <section className={styles.block} aria-labelledby={id}>
      <div className={`${styles.row} ${artEnd ? styles.rowReverse : ""}`}>
        <ArtFrame src={src} alt={alt} priority={priority} />
        <div className={styles.copy}>
          <h2 id={id} className={styles.sectionTitle}>
            {title}
          </h2>
          <p className={styles.lead}>{lead}</p>
          <div className={styles.body}>{body}</div>
        </div>
      </div>
    </section>
  );
}

/**
 * About — one continuous cream-paper stack (hero → story → founder).
 * Copy from Notion “About section content update” (2026-08-06).
 */
export default function AboutPage() {
  return (
    <div className={`relative text-ink ${styles.page}`}>
      <div className={`wrap ${styles.stack}`}>
        <section
          className={styles.hero}
          aria-labelledby="about-hero-title"
        >
          <div className={styles.heroInner}>
            <h1
              id="about-hero-title"
              className={`hero-enter ${styles.heroTitle}`}
              style={{ "--hero-i": 0 } as CSSProperties}
            >
              About{" "}
              <span className="whitespace-nowrap">
                Learn in <span className="text-orange">Curve</span>
              </span>
            </h1>
            <p
              className={`hero-enter ${styles.heroSupport}`}
              style={{ "--hero-i": 1 } as CSSProperties}
            >
              An AI-powered education platform helping project managers stay
              ahead of the curve
            </p>
          </div>
        </section>

        <div className={styles.story}>
          <ScrollReveal>
            <AboutBlock
              id="about-vision"
              title="Vision"
              src="/brand/inspo/about-vision.jpg"
              alt="Flat poster illustration of a person studying with a ticket-shaped booklet"
              priority
              lead="Professional learning shouldn't feel overwhelming, expensive, or impossible to fit into a busy life."
              body={
                <>
                  <p>
                    We believe anyone with the ambition to grow their career
                    should have access to clear, practical, and effective
                    learning tools.
                  </p>
                  <p>
                    Learn in Curve exists to transform the way professionals
                    prepare for qualifications by turning complex material into
                    structured learning journeys that fit around real work, real
                    commitments, and real life.
                  </p>
                </>
              }
            />
          </ScrollReveal>

          <ScrollReveal>
            <AboutBlock
              id="about-goal"
              title="Goal"
              src="/brand/inspo/about-goal.jpg"
              alt="Flat poster illustration of a figure before a bold orange arch"
              artEnd
              lead="Our goal is simple: help you walk into your exam with confidence, not uncertainty."
              body={
                <>
                  <p>
                    Every part of Learn in Curve is designed around one outcome:
                    helping you understand the material, build your knowledge,
                    test your progress, and achieve your qualification.
                  </p>
                  <p>
                    No endless slides. No overwhelming textbooks. Just focused
                    learning that moves you closer to passing.
                  </p>
                </>
              }
            />
          </ScrollReveal>

          <ScrollReveal>
            <AboutBlock
              id="about-values"
              title="Values"
              src="/brand/inspo/about-values.jpg"
              alt="Flat poster illustration of an orange stamp seal beside paper"
              lead="We believe learning should be honest, useful, and built around the learner, not the business model."
              body={
                <>
                  <p>
                    That means creating genuinely valuable free resources, being
                    transparent about what is included, and building features
                    that solve real problems rather than adding unnecessary
                    complexity.
                  </p>
                  <p>
                    We don&apos;t chase hype. We focus on building tools that
                    genuinely help people learn, grow, and succeed.
                  </p>
                </>
              }
            />
          </ScrollReveal>
        </div>

        <section className={styles.founder} aria-labelledby="about-founder">
          <ScrollReveal>
            <div className={styles.founderPanel}>
              <div className={styles.founderPhoto}>
                <Image
                  src="/brand/sim-profile.jpg"
                  alt="Sim Samaar Shened, founder of Learn in Curve"
                  fill
                  sizes="(max-width: 640px) 100vw, 180px"
                  className="object-cover object-top"
                />
              </div>

              <div className={styles.founderCopy}>
                <h2 id="about-founder" className={styles.sectionTitle}>
                  Founder
                </h2>
                <p className={styles.founderLead}>
                  Learn in Curve was founded by Sim Samaar Shened, a project
                  management professional who experienced first-hand how
                  expensive, time-consuming, and inaccessible professional
                  learning can be.
                </p>
                <div className={styles.body}>
                  <p>
                    While managing complex projects and working towards industry
                    certifications, Sim recognised an opportunity to use AI to
                    transform how professionals learn by making study more
                    personalised, practical, and genuinely effective.
                  </p>
                  <p>
                    What began as a tool to solve his own challenges has evolved
                    into Learn in Curve: an AI-first learning platform built to
                    help professionals master new skills, earn certifications,
                    and accelerate their careers.
                  </p>
                </div>
                <p className={styles.belief}>
                  Built by one founder. Driven by one belief: exceptional
                  learning should be accessible to everyone.
                </p>
                <div className={styles.founderActions}>
                  <a
                    href={FOUNDER_LINKEDIN}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${stampCtaPrimaryCompact} ${styles.founderLinkedIn}`}
                  >
                    <LinkedInIcon className="shrink-0" />
                    Connect with Sim
                  </a>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </div>
    </div>
  );
}
