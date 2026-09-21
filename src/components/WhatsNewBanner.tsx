"use client";

import { useEffect, useId, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReleaseNote } from "@/content/whats-new";
import { markWhatsNewSeen } from "@/lib/whats-new/actions";
import {
  trackWhatsNewBannerClicked,
  trackWhatsNewBannerShown,
  trackWhatsNewDismissed,
} from "@/lib/analytics/events";
import { productSurfaceQuiet } from "@/components/ui/semantic";

type WhatsNewBannerProps = {
  note: ReleaseNote;
};

/**
 * Dismissible inline strip for the newest unseen release.
 * Not a modal — CTA and dismiss both mark the registry as seen.
 */
export function WhatsNewBanner({ note }: WhatsNewBannerProps) {
  const titleId = useId();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    trackWhatsNewBannerShown({ note_id: note.id });
  }, [note.id]);

  function dismiss() {
    trackWhatsNewDismissed({ note_id: note.id });
    startTransition(async () => {
      await markWhatsNewSeen();
      router.refresh();
    });
  }

  function onCtaClick() {
    trackWhatsNewBannerClicked({ note_id: note.id, href: note.href });
    startTransition(async () => {
      await markWhatsNewSeen();
    });
  }

  return (
    <section
      aria-labelledby={titleId}
      className={`${productSurfaceQuiet} relative mb-6 px-4 py-4 sm:px-5 sm:py-4`}
    >
      <div className="flex items-start gap-3 pr-8">
        <div className="min-w-0 flex-1">
          <p className="m-0 font-body text-[11px] font-semibold uppercase tracking-[0.06em] text-orange">
            What&apos;s new
          </p>
          <h2
            id={titleId}
            className="mt-1 font-display text-[1.125rem] font-bold tracking-[-0.02em] text-ink sm:text-[1.25rem]"
          >
            {note.title}
          </h2>
          <p className="mt-1.5 max-w-[48ch] font-body text-[13px] leading-relaxed text-ink/65 text-pretty">
            {note.body}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              href={note.href}
              onClick={onCtaClick}
              className="inline-flex min-h-9 items-center justify-center rounded-lg bg-action px-3.5 text-[13px] font-semibold text-paper transition-[background-color,transform] duration-150 ease-[var(--ease-out-quint)] hover:bg-action-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            >
              {note.cta}
            </Link>
            <Link
              href="/whats-new"
              className="font-body text-[13px] font-semibold text-ink/55 underline-offset-2 transition-colors hover:text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55 focus-visible:ring-offset-2"
            >
              See all updates
            </Link>
          </div>
        </div>
      </div>
      <button
        type="button"
        aria-label="Dismiss update"
        disabled={pending}
        onClick={dismiss}
        className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-ink/45 transition-colors hover:bg-ink/[0.06] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55 disabled:opacity-60"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
        >
          <path
            d="M4 4l8 8M12 4 4 12"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </section>
  );
}
