"use client";

import { HeroAnimalsScene } from "@/components/HeroAnimalsScene";

/**
 * Lab hero starting point — animals only.
 * Iterate here; promote into `HomeBrandHero` only when a design wins.
 */
export function LabHero() {
  return (
    <section
      id="lab-hero"
      aria-label="Lab hero"
      className="hero relative overflow-x-clip overflow-y-visible pb-4 pt-4 sm:pb-5 sm:pt-6 lg:pb-6 lg:pt-8"
    >
      <div className="wrap relative z-[1]">
        <div className="mx-auto flex w-full max-w-[min(100%,52rem)] flex-col items-center text-center xl:max-w-[58rem]">
          <div className="relative w-full">
            <HeroAnimalsScene />
          </div>
        </div>
      </div>
    </section>
  );
}
