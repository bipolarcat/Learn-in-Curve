import { AudioLines, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { LoExplainerAudio } from "@/components/pmq/LoExplainerAudio";
import { LoMediaPlaceholder } from "@/components/pmq/LoMediaPlaceholder";
import { ProMediaLockedPreview } from "@/components/pmq/ProMediaLockedPreview";
import { productSurfaceOpaque } from "@/components/ui/semantic";
import motion from "@/components/pmq/PmqMotion.module.css";
import type { LoMediaAsset } from "@/lib/pmq/constants";

type LoAudioStageProps = {
  audio: LoMediaAsset;
  loNumber: number;
  loTitle: string;
  mediaLocked: boolean;
  priceCents: number;
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
 * Audio — Orient/Learn dialect: Lucide title, opaque card, wrap width.
 */
export function LoAudioStage({
  audio,
  loNumber,
  loTitle,
  mediaLocked,
  priceCents,
}: LoAudioStageProps) {
  return (
    <div className="lo-audio-stage min-w-0" aria-label="Audio">
      <section
        className={`${productSurfaceOpaque} ${motion.panel} min-w-0 overflow-x-clip p-4 sm:p-5`}
        aria-labelledby="lo-audio-title"
      >
        <SectionTitle id="lo-audio-title" icon={AudioLines}>
          Audio overview
        </SectionTitle>

        <div className="mt-3 min-w-0 sm:mt-3.5">
          {!audio.src ? (
            <LoMediaPlaceholder
              kind="audio"
              loNumber={loNumber}
              loTitle={loTitle}
            />
          ) : mediaLocked ? (
            <ProMediaLockedPreview
              kind="audio"
              src={audio.src}
              title={audio.title}
              loNumber={loNumber}
              loTitle={loTitle}
              priceCents={priceCents}
            />
          ) : (
            <LoExplainerAudio src={audio.src} title={audio.title} />
          )}
        </div>
      </section>
    </div>
  );
}
