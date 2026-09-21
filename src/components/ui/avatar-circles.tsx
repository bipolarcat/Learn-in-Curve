"use client";

import { AvatarImage } from "@/components/AvatarImage";
import { cn } from "@/lib/utils";
import type { AvatarId } from "@/lib/avatars";

interface AvatarCirclesProps {
  className?: string;
  numPeople?: number;
  /** Local profile animals (preferred — matches dashboard selector). */
  avatarIds?: AvatarId[];
  /** Remote / arbitrary image URLs (fallback). */
  avatarUrls?: string[];
}

const AvatarCircles = ({
  numPeople,
  className,
  avatarIds,
  avatarUrls,
}: AvatarCirclesProps) => {
  const count = avatarIds?.length ?? avatarUrls?.length ?? 0;

  return (
    <div
      className={cn(
        "z-10 flex shrink-0 flex-row flex-nowrap items-center",
        className,
      )}
    >
      {avatarIds?.map((id, index) => (
        <span
          key={id}
          className={cn(
            "relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-avatar-plate ring-1 ring-ink/20",
            index > 0 && "-ml-3.5",
          )}
          style={{ zIndex: index + 1 }}
        >
          <AvatarImage avatarId={id} size={32} />
        </span>
      ))}
      {!avatarIds &&
        avatarUrls?.map((url, index) => (
          // eslint-disable-next-line @next/next/no-img-element -- remote URL fallback
          <img
            key={url}
            className={cn(
              "relative h-8 w-8 rounded-full border border-ink/20 bg-cream object-cover",
              index > 0 && "-ml-3.5",
            )}
            style={{ zIndex: index + 1 }}
            src={url}
            width={32}
            height={32}
            alt=""
            loading="lazy"
            decoding="async"
          />
        ))}
      {typeof numPeople === "number" && numPeople > 0 ? (
        <span
          className="-ml-3.5 relative flex h-8 w-8 items-center justify-center rounded-full bg-ink text-center text-[11px] font-semibold tabular-nums text-paper ring-1 ring-ink/20"
          style={{ zIndex: count + 1 }}
          aria-hidden
        >
          +{numPeople}
        </span>
      ) : null}
    </div>
  );
};

export { AvatarCircles };
