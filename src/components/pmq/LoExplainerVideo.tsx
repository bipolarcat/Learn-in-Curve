import { LoVideoOverviewNotes } from "@/components/pmq/LoVideoOverviewNotes";

type LoExplainerVideoProps = {
  /** Public URL path, e.g. /videos/pmq/lo-17.mp4 */
  src: string;
  title: string;
  /** Poster still — avoids blank ink frame before first paint. */
  posterSrc?: string | null;
  /** WebVTT captions when available (`/videos/pmq/captions/lo-NN.vtt`). */
  captionsSrc?: string | null;
  /** Plain-text transcript / media alternative when captions aren’t ready. */
  transcript?: string | null;
  /** Jump to the Learn stage (written alternative while captions are pending). */
  onJumpToLearn?: () => void;
};

/**
 * Inline explainer video — native controls, no autoplay.
 * Quiet frame to match Orient/Learn opaque cards.
 */
export function LoExplainerVideo({
  src,
  title,
  posterSrc = null,
  captionsSrc = null,
  transcript = null,
  onJumpToLearn,
}: LoExplainerVideoProps) {
  return (
    <div className="grid min-w-0 gap-2.5">
      <div className="overflow-hidden rounded-lg border border-black/[0.08] bg-ink dark:border-white/[0.12]">
        <video
          className="aspect-video w-full bg-ink"
          controls
          preload="metadata"
          playsInline
          title={title}
          poster={posterSrc ?? undefined}
          crossOrigin={captionsSrc ? "anonymous" : undefined}
        >
          <source src={src} type="video/mp4" />
          {captionsSrc ? (
            <track
              kind="captions"
              srcLang="en"
              label="English"
              src={captionsSrc}
              default
            />
          ) : null}
          <div className="bg-ink p-4 font-body text-[13px] text-paper">
            Your browser doesn&apos;t support embedded video.{" "}
            <a
              href={src}
              className="font-semibold text-paper underline decoration-orange underline-offset-2"
            >
              Download the video
            </a>
            .
          </div>
        </video>
      </div>

      <LoVideoOverviewNotes
        hasCaptions={Boolean(captionsSrc)}
        transcript={transcript}
        onJumpToLearn={onJumpToLearn}
      />
    </div>
  );
}
