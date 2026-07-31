import { Video, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { LoExplainerVideo } from "@/components/pmq/LoExplainerVideo";
import { LoMediaPlaceholder } from "@/components/pmq/LoMediaPlaceholder";
import { ProMediaLockedPreview } from "@/components/pmq/ProMediaLockedPreview";
import { productSurfaceOpaque } from "@/components/ui/semantic";
import motion from "@/components/pmq/PmqMotion.module.css";
import type { LoMediaAsset } from "@/lib/pmq/constants";

type LoVideoStageProps = {
  video: LoMediaAsset;
  loNumber: number;
  loTitle: string;
  mediaLocked: boolean;
  priceCents: number;
  onJumpToLearn?: () => void;
};

const headingClass =
  "min-w-0 flex-1 font-body text-lg font-semibold leading-none tracking-tight text-balance text-ink";

function PathwayGlyph({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <Icon
      className="size-7 shrink-0 text-orange sm:size-8"
      strokeWidth={1.75}
      aria-hidden
    />
  );
}

function SectionTitle({
  id,
  icon,
  children,
}: {
  id: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div className="flex w-full min-w-0 items-center gap-1.5 sm:gap-2">
      <PathwayGlyph icon={icon} />
      <h2 id={id} className={headingClass}>
        {children}
      </h2>
    </div>
  );
}

/**
 * Video — Orient/Learn dialect: Lucide title, opaque card, wrap width.
 */
export function LoVideoStage({
  video,
  loNumber,
  loTitle,
  mediaLocked,
  priceCents,
  onJumpToLearn,
}: LoVideoStageProps) {
  return (
    <div className="lo-video-stage min-w-0" aria-label="Video">
      <section
        className={`${productSurfaceOpaque} ${motion.panel} min-w-0 overflow-x-clip p-4 sm:p-5`}
        aria-labelledby="lo-video-title"
      >
        <SectionTitle id="lo-video-title" icon={Video}>
          Video overview
        </SectionTitle>

        <div className="mt-3 min-w-0 sm:mt-3.5">
          {mediaLocked && video.src ? (
            <ProMediaLockedPreview
              kind="video"
              posterSrc={video.posterSrc}
              title={video.title}
              loNumber={loNumber}
              loTitle={loTitle}
              priceCents={priceCents}
            />
          ) : video.src ? (
            <LoExplainerVideo
              src={video.src}
              title={video.title}
              posterSrc={video.posterSrc}
              captionsSrc={video.captionsSrc}
              onJumpToLearn={onJumpToLearn}
            />
          ) : (
            <LoMediaPlaceholder
              kind="video"
              loNumber={loNumber}
              loTitle={loTitle}
            />
          )}
        </div>
      </section>
    </div>
  );
}
