import type { Metadata } from "next";
import { LabCanvas } from "@/components/lab/LabCanvas";

/**
 * Design sandbox — same site shell as the homepage (header + footer +
 * cream dotted body). Spike homepage / marketing ideas here.
 *
 * How to use:
 * 1. Build a new component under `src/components/lab/` (e.g. `HeroExperimentA.tsx`)
 * 2. Mount it: `return <LabCanvas><HeroExperimentA /></LabCanvas>`
 * 3. Visit `/lab` — live `/` is unchanged
 * 4. When a design wins, promote it into the real homepage in one deliberate swap
 *
 * Do not import or edit `HomeBrandHero` / `(site)/page.tsx` from experiments
 * unless you are intentionally promoting a winner.
 */
export const metadata: Metadata = {
  title: "Lab — Learn in Curve",
  description: "Internal design sandbox. Not indexed.",
  robots: { index: false, follow: false },
};

export default function LabPage() {
  return <LabCanvas />;
}
