import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  LibraryArticle,
  LIBRARY_OG_IMAGE,
} from "@/components/library/LibraryArticle";
import {
  getAllLibrarySlugs,
  getLibraryPage,
  isLibraryPageIndexable,
  pageHasTodoCopy,
} from "@/content/library";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

type Params = { slug: string };

export function generateStaticParams() {
  return getAllLibrarySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getLibraryPage(slug);
  if (!page) return {};

  const indexable = isLibraryPageIndexable(page);
  const noindex = !indexable || pageHasTodoCopy(page);

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: `${SITE_URL}/library/${page.slug}` },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url: `${SITE_URL}/library/${page.slug}`,
      type: "article",
      publishedTime: page.updatedAt,
      modifiedTime: page.updatedAt,
      images: [{ url: `${SITE_URL}${LIBRARY_OG_IMAGE}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: page.metaTitle,
      description: page.metaDescription,
      images: [`${SITE_URL}${LIBRARY_OG_IMAGE}`],
    },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export default async function LibrarySlugPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const page = getLibraryPage(slug);
  if (!page) notFound();
  return <LibraryArticle page={page} />;
}
