"use client";

import { GetProBundleButton } from "@/components/pmq/GetProBundleButton";

type ProMediaLockedPreviewProps = {
  kind: "video" | "audio";
  /** Kept for audio metadata preload only — never used to stream locked video. */
  src?: string | null;
  /** Static poster for locked video preview (no MP4 fetch). */
  posterSrc?: string | null;
  title: string;
  loNumber: number;
  loTitle: string;
  priceCents: number;
};

/**
 * Free-tier Video/Audio: quiet poster/chrome + Pro upsell.
 * Locked video uses a JPEG poster — never loads the full MP4.
 */
export function ProMediaLockedPreview({
  kind,
  src = null,
  posterSrc = null,
  title,
  loNumber,
  priceCents,
}: ProMediaLockedPreviewProps) {
  const isVideo = kind === "video";
  const overviewHeading = isVideo
    ? `Watch the overview for LO ${loNumber}`
    : `Listen to the overview for LO ${loNumber}`;

  return (
    <div className="grid min-w-0 gap-2.5">
      <div
        className={`relative overflow-hidden rounded-lg border border-black/[0.08] dark:border-white/[0.12] ${
          isVideo ? "bg-ink" : "bg-ink/[0.03]"
        }`}
      >
        {isVideo ? (
          <div className="relative aspect-video w-full bg-ink" aria-hidden>
            {posterSrc ? (
              // eslint-disable-next-line @next/next/no-img-element -- static public poster; avoid optimizer for local course assets
              <img
                src={posterSrc}
                alt=""
                className="h-full w-full object-cover brightness-[0.55] saturate-[0.9]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-ink">
                <span className="font-body text-[12px] font-semibold tracking-tight text-paper/45">
                  Pro video
                </span>
              </div>
            )}
          </div>
        ) : (
          <div
            className="relative flex min-h-[9.5rem] w-full flex-col justify-end px-4 py-4 sm:min-h-[10.5rem] sm:px-5 sm:py-5"
            aria-hidden
          >
            <div className="mb-4 flex h-10 items-end justify-center gap-[3px] opacity-35 sm:h-11">
              {WAVEFORM.map((h, i) => (
                <span
                  key={i}
                  className="w-1 rounded-full bg-ink/45 sm:w-1.5"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="flex items-center gap-3 opacity-40">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ink text-paper">
                <PlayGlyph />
              </span>
              <div className="min-w-0 flex-1">
                <div className="h-1 w-full overflow-hidden rounded-full bg-ink/12">
                  <div className="h-full w-[12%] rounded-full bg-ink/30" />
                </div>
                <p className="mt-1.5 truncate font-body text-[12px] font-medium text-ink/65">
                  {title}
                </p>
              </div>
            </div>
            {src ? (
              <audio className="sr-only" preload="none" tabIndex={-1}>
                <source src={src} type="audio/mp4" />
                <source src={src} type="audio/x-m4a" />
              </audio>
            ) : null}
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-ink/25 p-3 sm:p-4">
          <div className="w-full max-w-[20rem] rounded-xl border border-black/[0.08] bg-paper px-3.5 py-3.5 text-center shadow-[0_8px_24px_rgb(var(--ink-rgb)_/_0.12)] dark:border-white/[0.12] sm:px-4 sm:py-4">
            <h3 className="font-body text-[15px] font-semibold leading-snug tracking-tight text-balance text-ink">
              {overviewHeading}
            </h3>

            <div className="mt-3 flex justify-center">
              <GetProBundleButton priceCents={priceCents} loNumber={loNumber} />
            </div>
          </div>
        </div>
      </div>

      <p className="sr-only">
        {overviewHeading}. This {isVideo ? "video" : "audio"} is included with
        Pro and cannot be played on the free tier.
      </p>
    </div>
  );
}

function PlayGlyph() {
  return (
    <svg
      className="h-3.5 w-3.5 translate-x-px"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
    >
      <path d="M4.5 2.8v10.4L13 8 4.5 2.8Z" />
    </svg>
  );
}

const WAVEFORM = [
  28, 42, 55, 38, 70, 48, 62, 35, 78, 52, 40, 88, 45, 60, 32, 72, 50, 66, 38,
  58, 44, 80, 36, 54, 48, 64, 30, 74, 42, 56,
];
