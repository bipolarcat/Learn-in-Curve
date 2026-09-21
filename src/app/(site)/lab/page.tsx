import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/server";
import { LabCanvas } from "@/components/lab/LabCanvas";
import { LabFeatureTiles } from "@/components/lab/LabFeatureTiles";
import { LabHero } from "@/components/lab/LabHero";
import { LabSlySection } from "@/components/lab/LabSlySection";
import { FeatureStack } from "@/components/FeatureStack";
import { PmqLaunchProof } from "@/components/PmqLaunchProof";
import { buildTitle } from "@/lib/seo/title";

/**
 * Design sandbox — illustrated landing redesign spike.
 * Order: Hero → Activity demo → Feature tiles → What's included → PMQ live →
 * standalone TrialQuiz → Sly.
 * Testing method + exam paths (`LabExamPaths`) live on `/`.
 * How-you-practise (`LabActivityDemo`) is on `/lab` and live `/`.
 * 2026-09-20: exam paths ↔ `PmqLaunchProof`; `FeatureStack` + standalone
 * `TrialQuiz` moved here from `/`.
 */
export const metadata: Metadata = {
  title: buildTitle("Lab"),
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

const TrialQuiz = dynamic(
  () =>
    import("@/components/TrialQuiz").then((m) => ({ default: m.TrialQuiz })),
  {
    loading: () => (
      <div className="mx-auto min-h-[24rem] max-w-[46rem]" aria-hidden />
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
      <LabActivityDemo isSignedIn={isSignedIn} />
      <LabFeatureTiles />
      <FeatureStack />
      <PmqLaunchProof isSignedIn={isSignedIn} />
      <section
        id="lab-trial-quiz"
        className="relative overflow-x-clip pt-[clamp(2rem,5vw,3rem)] pb-[clamp(3rem,6vw,5rem)]"
      >
        <div className="wrap relative z-[1]">
          <div className="mx-auto w-full max-w-[46rem]">
            <TrialQuiz isSignedIn={isSignedIn} />
          </div>
        </div>
      </section>
      <LabSlySection isSignedIn={isSignedIn} />
    </LabCanvas>
  );
}
