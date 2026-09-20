"use client";

import Image from "next/image";
import { FreeMockExamLink } from "@/components/FreeMockExamLink";
import { PmqStartLink } from "@/components/PmqStartLink";
import { PfqStartLink } from "@/components/pfq/PfqStartLink";
import { ScrollReveal } from "@/components/ScrollReveal";
import {
  stampCtaSecondaryFlat,
  stampCtaTealFlat,
} from "@/components/stamp-chip";

const CTA_MOCK =
  `${stampCtaTealFlat} !normal-case !text-[12px] !font-semibold !tracking-[-0.01em] !min-h-10 !px-3.5 sm:!text-[13px]`;
const CTA_COURSE =
  `${stampCtaSecondaryFlat} !normal-case !text-[12px] !font-semibold !tracking-[-0.01em] !min-h-10 !px-3.5 sm:!text-[13px]`;

type LabExamPathsProps = {
  isSignedIn: boolean;
};

const PATHS = [
  {
    id: "pmq",
    exam: "APM PMQ",
    tagline: "Project Management Qualification",
    blurb:
      "Deeper syllabus, tougher scenarios. Free mock first — then the free PMQ course when you’re ready.",
    art: "/brand/Courses/pmq-in-5-days.png",
    artAlt: "PMQ in 5 Days course illustration.",
    sticker: "/mascot/fox-full-body.svg",
    mockHref: "/free-mock-exam/apm-pmq",
    tone: "from-orange/15 via-cream/80 to-cream",
  },
  {
    id: "pfq",
    exam: "APM PFQ",
    tagline: "Project Fundamentals Qualification",
    blurb:
      "Foundations, faster. Free mock first — then the free PFQ course when you’re ready.",
    art: "/brand/Courses/pfq-in-2-days.png",
    artAlt: "PFQ in 2 Days course illustration.",
    sticker: "/brand/auth/sign-up-fox-transparent.webp",
    mockHref: "/free-mock-exam/apm-pfq",
    tone: "from-teal/15 via-cream/80 to-cream",
  },
] as const;

/**
 * Illustrated PFQ vs PMQ path cards — each routes mock + course (exam-matched).
 * Mobile: stacked full-width cards. Desktop: equal 2-col.
 */
export function LabExamPaths({ isSignedIn }: LabExamPathsProps) {
  return (
    <section
      id="lab-exams"
      aria-labelledby="lab-exams-heading"
      className="relative overflow-x-clip border-t border-ink/[0.06] pt-[clamp(2.25rem,5vw,3.5rem)] pb-[clamp(2.5rem,6vw,4.5rem)]"
    >
      <div className="wrap relative z-[1]">
        <ScrollReveal className="mx-auto max-w-[40rem] text-center">
          <p className="mb-2 font-body text-[12px] font-bold uppercase tracking-[0.14em] text-teal sm:text-[13px]">
            Pick your exam
          </p>
          <h2
            id="lab-exams-heading"
            className="font-display text-[clamp(1.65rem,3.5vw,2.35rem)] font-bold leading-[1.05] tracking-[-0.03em] text-ink"
          >
            PFQ or PMQ — same curve
          </h2>
          <p className="mx-auto mt-3 max-w-[34rem] text-pretty font-body text-[15px] leading-relaxed text-ink/65 sm:text-[16px]">
            Sitting either qualification in the next eight weeks? Start with the
            free mock for your exam, then enrol on the matching free course.
          </p>
        </ScrollReveal>

        <ul className="mt-8 grid list-none grid-cols-1 gap-5 sm:mt-10 lg:grid-cols-2 lg:gap-6">
          {PATHS.map((path, i) => (
            <li key={path.id}>
              <ScrollReveal delay={0.06 * i} className="h-full">
                <article
                  className={`relative flex h-full flex-col overflow-hidden rounded-2xl border border-ink/10 bg-gradient-to-b ${path.tone} shadow-[0_1px_0_rgb(var(--ink-rgb)_/_0.04),0_14px_32px_-20px_rgb(var(--ink-rgb)_/_0.3)]`}
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-[5/3]">
                    <Image
                      src={path.art}
                      alt={path.artAlt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover object-center"
                    />
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-cream via-cream/20 to-transparent"
                      aria-hidden
                    />
                    <div
                      className="pointer-events-none absolute bottom-2 right-2 h-16 w-16 sm:bottom-3 sm:right-3 sm:h-20 sm:w-20"
                      aria-hidden
                    >
                      <Image
                        src={path.sticker}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-contain drop-shadow-[0_6px_14px_rgb(var(--ink-rgb)_/_0.2)]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-1 sm:px-5 sm:pb-5 sm:pt-2">
                    <div>
                      <p className="font-stamp text-[11px] font-bold uppercase tracking-[0.1em] text-orange">
                        {path.tagline}
                      </p>
                      <h3 className="mt-1 font-display text-[1.45rem] font-bold leading-none tracking-[-0.03em] text-ink sm:text-[1.65rem]">
                        {path.exam}
                      </h3>
                      <p className="mt-2 text-pretty font-body text-[14px] leading-relaxed text-ink/65 sm:text-[15px]">
                        {path.blurb}
                      </p>
                    </div>

                    <div className="mt-auto flex flex-col gap-2 pt-1 sm:flex-row sm:flex-wrap">
                      <FreeMockExamLink
                        className={`${CTA_MOCK} w-full justify-center sm:w-auto`}
                        from="home"
                        location="lab-exam-paths"
                        href={path.mockHref}
                        label="Take free mock"
                        analyticsLabel={`${path.exam} free mock`}
                        showArrow
                      />
                      {path.id === "pmq" ? (
                        <PmqStartLink
                          isSignedIn={isSignedIn}
                          className={`${CTA_COURSE} w-full justify-center sm:w-auto`}
                          from="home"
                          analyticsLocation="lab-exam-paths"
                          analyticsVariant="Start PMQ course"
                        >
                          Start free course
                        </PmqStartLink>
                      ) : (
                        <PfqStartLink
                          isSignedIn={isSignedIn}
                          className={`${CTA_COURSE} w-full justify-center sm:w-auto`}
                          from="home"
                          analyticsLocation="lab-exam-paths"
                          analyticsVariant="Start PFQ course"
                        >
                          Start free course
                        </PfqStartLink>
                      )}
                    </div>
                  </div>
                </article>
              </ScrollReveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
