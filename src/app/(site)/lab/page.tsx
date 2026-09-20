import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/server";
import { LabCanvas } from "@/components/lab/LabCanvas";
import { LabExamPaths } from "@/components/lab/LabExamPaths";
import { LabFeatureTiles } from "@/components/lab/LabFeatureTiles";
import { LabHero } from "@/components/lab/LabHero";
import { LabSlySection } from "@/components/lab/LabSlySection";

/**
 * Design sandbox — illustrated landing redesign spike.
 * Order: Hero → Activity demo → Features → Exam paths → Sly.
 * Testing method lives on live `/` (between hero and PMQ proof).
 * LabHowItWorks was promoted off `/lab`; activity demo sits where it was.
 */
export const metadata: Metadata = {
  title: "Lab — Learn in Curve",
  description: "Internal design sandbox. Not indexed.",
  robots: { index: false, follow: false },
};

const LabActivityDemo = dynamic(
  () =>
    import("@/components/lab/LabActivityDemo").then((m) => ({
      default: m.LabActivityDemo,
    })),
  {
    loading: () => (
      <div
        className="mx-auto min-h-[22rem] w-full border-t border-ink/[0.06]"
        aria-hidden
      />
    ),
  },
);

export default async function LabPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isSignedIn = !!user;

  return (
    <LabCanvas>
      <LabHero isSignedIn={isSignedIn} />
      <LabActivityDemo />
      <LabFeatureTiles />
      <LabExamPaths isSignedIn={isSignedIn} />
      <LabSlySection isSignedIn={isSignedIn} />
    </LabCanvas>
  );
}
