import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { LabCanvas } from "@/components/lab/LabCanvas";
import { LabHero } from "@/components/lab/LabHero";
import { LabMethod } from "@/components/lab/LabMethod";
import { LabSlySection } from "@/components/lab/LabSlySection";

/**
 * Design sandbox — landing redesign spike (Uxcel-inspired structure on LIC brand).
 * Funnel: free mock (PMQ/PFQ chooser) → free course (exam-matched).
 * Live `/` is unchanged until this design is promoted.
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
      <LabMethod />
      <LabSlySection isSignedIn={isSignedIn} />
    </LabCanvas>
  );
}
