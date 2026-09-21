import type { Metadata } from "next";
import { getLibraryPagesByGroup, LIBRARY_PAGES } from "@/content/library";
import { LibraryHub } from "@/components/library/LibraryHub";
import { LIBRARY_OG_IMAGE } from "@/components/library/LibraryArticle";
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
    title: "APM PMQ Guides | Learn in Curve",
    description:
      "Plain-English APM PMQ guides: exam format, pass mark, syllabus topics and qualification comparisons.",
    url: `${SITE_URL}/library`,
    type: "website",
    images: [{ url: `${SITE_URL}${LIBRARY_OG_IMAGE}`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "APM PMQ Guides | Learn in Curve",
    description:
      "Plain-English APM PMQ guides: exam format, pass mark, syllabus topics and qualification comparisons.",
    images: [`${SITE_URL}${LIBRARY_OG_IMAGE}`],
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
