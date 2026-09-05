import type { Metadata } from "next";
import Link from "next/link";
import { requirePfqProOrRedirect } from "@/lib/pfq/require-pro";
import { PFQ_LEARN_HREF } from "@/lib/pfq/constants";
import PfqTrapSchool from "@/components/pfq/PfqTrapSchool";

export const metadata: Metadata = {
  title: "Trap School — PFQ in 2 Days",
  robots: { index: false, follow: false },
};

export default async function PfqTrapSchoolPage() {
  await requirePfqProOrRedirect();

  return (
    <div className="mx-auto flex w-full max-w-wrap flex-col gap-8 px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10">
      <p className="m-0 font-body text-[13px]">
        <Link
          href={PFQ_LEARN_HREF}
          className="text-ink/60 underline decoration-ink/20 underline-offset-2 hover:text-ink"
        >
          ← Back to course
        </Link>
      </p>
      <PfqTrapSchool />
    </div>
  );
}
