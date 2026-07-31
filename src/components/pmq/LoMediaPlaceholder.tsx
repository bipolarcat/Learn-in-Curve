type LoMediaPlaceholderProps = {
  kind: "video" | "audio";
  loNumber: number;
  loTitle: string;
};

/**
 * Shown when media isn’t on disk yet (`src` is null in `constants.ts`).
 */
export function LoMediaPlaceholder({
  kind,
  loNumber,
}: LoMediaPlaceholderProps) {
  const isVideo = kind === "video";
  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-dashed border-black/[0.12] bg-ink/[0.02] dark:border-white/[0.14] dark:bg-white/[0.03] ${
        isVideo ? "aspect-video" : "min-h-[9.5rem] sm:min-h-[10.5rem]"
      }`}
    >
      <div className="flex h-full min-h-[inherit] flex-col items-center justify-center gap-2 px-5 py-8 text-center">
        <p className="font-body text-[11px] font-semibold tracking-tight text-ink/50">
          Coming soon
        </p>
        <p className="max-w-[36ch] font-body text-[15px] font-semibold leading-snug tracking-tight text-pretty text-ink">
          {isVideo ? "Video" : "Audio"} overview for LO {loNumber}
        </p>
        <p className="max-w-[40ch] font-body text-[13px] leading-relaxed text-pretty text-ink/60">
          {isVideo
            ? "This explainer isn’t available in the app yet."
            : "This audio overview isn’t available in the app yet."}
        </p>
      </div>
    </div>
  );
}
