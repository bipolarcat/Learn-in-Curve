import type { Metadata } from "next";
import { getLibraryPagesByGroup, LIBRARY_PAGES } from "@/content/library";
import { LIBRARY_HUB_APM_DISCLAIMER } from "@/lib/legal-copy";
import { LibraryHub } from "@/components/library/LibraryHub";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

export const metadata: Metadata = {
  title: "APM PMQ guides and exam prep | Learn in Curve",
  description:
    "Plain-English guides to the APM PMQ exam: format, pass mark, revision, and syllabus topics. Then test yourself with a free 15-question readiness check.",
  alternates: { canonical: `${SITE_URL}/library` },
  openGraph: {
    title: "APM PMQ guides and exam prep",
    description:
      "Plain-English guides to the APM PMQ exam, then a free 15-question readiness check.",
    url: `${SITE_URL}/library`,
    type: "website",
  },
};

export default function LibraryIndexPage() {
  const groups = getLibraryPagesByGroup();
  const pages = groups.flatMap((g) => g.pages);
  const draftCount = LIBRARY_PAGES.length - pages.length;

  return (
    <LibraryHub
      pages={pages}
      groups={groups}
      draftCount={draftCount}
      disclaimer={LIBRARY_HUB_APM_DISCLAIMER}
    />
  );
}
