import type { Metadata } from "next";
import { LabCanvas } from "@/components/lab/LabCanvas";
import { LabHero } from "@/components/lab/LabHero";

/**
 * Design sandbox — same site shell as the homepage (header + footer +
 * cream dotted body). Spike homepage / marketing ideas here.
 *
 * Current spike: 21st background-paths hero adapted to LIC (`LabHero`).
 * Live `/` is unchanged until a design is promoted.
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
