"use client";

import { CoursesCatalog } from "@/components/CoursesCatalog";
import { ScrollReveal } from "@/components/ScrollReveal";
import { CATALOG_COURSES } from "@/lib/courses-catalog";

type LabExamPathsProps = {
  isSignedIn: boolean;
};

/**
 * Home exam/course paths — same catalogue tiles as `/courses`, under a
 * landing section heading. CTAs go to course overview + plans (not mock-first).
 */
export function LabExamPaths({ isSignedIn }: LabExamPathsProps) {
  return (
    <section
      id="lab-exams"
      aria-labelledby="lab-exams-heading"
      className="relative overflow-x-clip pt-[clamp(2.25rem,5vw,3.5rem)] pb-[clamp(2.5rem,6vw,4.5rem)]"
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
            Same courses as Explore. Open the overview for your exam, or check
            plans when you’re ready.
          </p>
        </ScrollReveal>

        <div className="mt-8 sm:mt-10">
          <CoursesCatalog
            courses={CATALOG_COURSES}
            isSignedIn={isSignedIn}
            showToolbar={false}
          />
        </div>
      </div>
    </section>
  );
}
