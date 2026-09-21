import type { Metadata } from "next";
import { getLibraryPagesByGroup, LIBRARY_PAGES } from "@/content/library";
import { LibraryHub } from "@/components/library/LibraryHub";
import { buildTitle } from "@/lib/seo/title";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

export const metadata: Metadata = {
  title: buildTitle("Guides"),
  description:
    "Plain-English project management guides — exam preparation, qualification comparisons, and syllabus topics.",
  alternates: { canonical: `${SITE_URL}/library` },
  openGraph: {
    title: "Guides | Learn in Curve",
    description:
      "Plain-English project management guides — browse by topic, then open one.",
    url: `${SITE_URL}/library`,
    type: "website",
  },
};

export default function LibraryIndexPage() {
  const groups = getLibraryPagesByGroup();
  const pages = groups.flatMap((g) => g.pages);
  const draftCount = LIBRARY_PAGES.length - pages.length;

  return (
    <LibraryHub pages={pages} groups={groups} draftCount={draftCount} />
  );
}
