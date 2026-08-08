import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LearnArticle } from "@/components/learn/LearnArticle";
import {
  getAllLearnSlugs,
  getLearnPage,
  isLearnPageIndexable,
  pageHasTodoCopy,
} from "@/content/learn";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

type Params = { slug: string };

export function generateStaticParams() {
  return getAllLearnSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getLearnPage(slug);
  if (!page) return {};

  const indexable = isLearnPageIndexable(page);
  const noindex = !indexable || pageHasTodoCopy(page);

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: `${SITE_URL}/learn/${page.slug}` },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url: `${SITE_URL}/learn/${page.slug}`,
      type: "article",
    },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export default async function LearnSlugPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const page = getLearnPage(slug);
  if (!page) notFound();
  return <LearnArticle page={page} />;
}
