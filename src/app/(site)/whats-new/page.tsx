import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RELEASE_NOTES } from "@/content/whats-new";
import { WhatsNewPageBeacon } from "@/components/WhatsNewPageBeacon";
import { buildTitle } from "@/lib/seo/title";
import { productSurfaceQuiet } from "@/components/ui/semantic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

export const metadata: Metadata = {
  title: buildTitle("What's New"),
  description:
    "Recent updates to Learn in Curve: new study tools, free mocks, and product changes.",
  alternates: { canonical: `${SITE_URL}/whats-new` },
};

function formatPublishedDate(isoDate: string): string {
  const ms = Date.parse(isoDate);
  if (Number.isNaN(ms)) return isoDate;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(ms));
}

export default async function WhatsNewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <section className="relative z-0 min-h-[calc(100dvh-4.25rem-7.5rem)] px-3 py-10 sm:min-h-[calc(100dvh-4.75rem-7.5rem)] sm:px-5 sm:py-14">
      <WhatsNewPageBeacon signedIn={!!user} />
      <div className="mx-auto max-w-wrap">
        <header className="mb-8 max-w-[40rem]">
          <h1 className="font-display text-[1.75rem] font-bold tracking-[-0.02em] text-ink sm:text-[2.15rem]">
            What&apos;s new
          </h1>
          <p className="mt-2 font-body text-[15px] leading-relaxed text-ink/65 text-pretty">
            Recent updates to the platform. Newest first.
          </p>
        </header>

        <ol className="m-0 flex list-none flex-col gap-4 p-0">
          {RELEASE_NOTES.map((note) => (
            <li key={note.id} id={note.id}>
              <article
                className={`${productSurfaceQuiet} px-5 py-5 sm:px-6 sm:py-6`}
              >
                <time
                  dateTime={note.publishedAt}
                  className="font-body text-[11px] font-semibold uppercase tracking-[0.06em] text-ink/45"
                >
                  {formatPublishedDate(note.publishedAt)}
                </time>
                <h2 className="mt-2 font-display text-[1.25rem] font-bold tracking-[-0.02em] text-ink sm:text-[1.375rem]">
                  {note.title}
                </h2>
                <p className="mt-2 max-w-[48ch] font-body text-[14px] leading-relaxed text-ink/65 text-pretty">
                  {note.body}
                </p>
                <Link
                  href={note.href}
                  className="mt-4 inline-flex min-h-9 items-center justify-center rounded-lg bg-action px-3.5 text-[13px] font-semibold text-paper transition-[background-color,transform] duration-150 ease-[var(--ease-out-quint)] hover:bg-action-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55 focus-visible:ring-offset-2"
                >
                  {note.cta}
                </Link>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
