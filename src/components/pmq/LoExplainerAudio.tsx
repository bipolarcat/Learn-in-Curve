import { AiMediaOverviewDisclaimer } from "@/components/pmq/AiMediaOverviewDisclaimer";

type LoExplainerAudioProps = {
  /** Public URL path, e.g. /audio/pmq/….m4a */
  src: string;
  title: string;
};

/**
 * Inline audio overview — native controls, no autoplay.
 * Flat player strip matching Learn card quietness.
 */
export function LoExplainerAudio({ src, title }: LoExplainerAudioProps) {
  return (
    <div className="grid min-w-0 gap-2.5">
      <div className="rounded-lg border border-black/[0.08] bg-ink/[0.03] px-3 py-3 dark:border-white/[0.12] dark:bg-white/[0.04] sm:px-3.5 sm:py-3.5">
        <audio
          className="block w-full max-w-full"
          controls
          preload="metadata"
          title={title}
        >
          <source src={src} type="audio/mp4" />
          <source src={src} type="audio/x-m4a" />
          <span className="font-body text-[13px] text-ink/70">
            Your browser doesn&apos;t support embedded audio.{" "}
            <a href={src} className="font-semibold text-orange underline">
              Download the audio
            </a>
            .
          </span>
        </audio>
      </div>
      <AiMediaOverviewDisclaimer kind="audio" />
    </div>
  );
}
