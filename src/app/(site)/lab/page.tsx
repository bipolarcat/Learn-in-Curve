import type { Metadata } from "next";
import { LabCanvas } from "@/components/lab/LabCanvas";
import { LabHero } from "@/components/lab/LabHero";

/**
 * Design sandbox — same site shell as the homepage (header + footer +
 * cream dotted body). Spike homepage / marketing ideas here.
 *
 * How to use:
 * 1. Iterate on `LabHero` / components under `src/components/lab/`
 * 2. Visit `/lab` — live `/` is unchanged
 * 3. When a design wins, promote it into the real homepage in one deliberate swap
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
  return (
    <LabCanvas>
      <LabHero />
    </LabCanvas>
  );
}
