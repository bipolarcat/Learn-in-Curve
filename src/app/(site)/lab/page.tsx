import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { LabCanvas } from "@/components/lab/LabCanvas";
import { LabExamPaths } from "@/components/lab/LabExamPaths";
import { LabFeatureTiles } from "@/components/lab/LabFeatureTiles";
import { LabHero } from "@/components/lab/LabHero";
import { LabHowItWorks } from "@/components/lab/LabHowItWorks";
import { LabSlySection } from "@/components/lab/LabSlySection";

/**
 * Design sandbox — illustrated landing redesign spike.
 * Order: Hero → How it works → Features → Exam paths → Sly.
 * Live `/` unchanged until promote.
 */
export const metadata: Metadata = {
  title: "Lab — Learn in Curve",
  description: "Internal design sandbox. Not indexed.",
  robots: { index: false, follow: false },
};

export default async function LabPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isSignedIn = !!user;

  return (
    <LabCanvas>
      <LabHero isSignedIn={isSignedIn} />
      <LabHowItWorks />
      <LabFeatureTiles />
      <LabExamPaths isSignedIn={isSignedIn} />
      <LabSlySection isSignedIn={isSignedIn} />
    </LabCanvas>
  );
}
