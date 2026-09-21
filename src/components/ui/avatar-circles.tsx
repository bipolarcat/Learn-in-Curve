"use client";

import { cn } from "@/lib/utils";

interface AvatarCirclesProps {
  className?: string;
  numPeople?: number;
  avatarUrls: string[];
}

const AvatarCircles = ({
  numPeople,
  className,
  avatarUrls,
}: AvatarCirclesProps) => {
  return (
    <div
      className={cn(
        "z-10 flex shrink-0 flex-row flex-nowrap items-center -space-x-2.5",
        className,
      )}
    >
      {avatarUrls.map((url) => (
        // eslint-disable-next-line @next/next/no-img-element -- local /avatars assets
        <img
          key={url}
          className="h-7 w-7 rounded-full border border-ink/20 bg-cream object-cover sm:h-8 sm:w-8"
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
          className="flex h-7 w-7 items-center justify-center rounded-full border border-ink/20 bg-ink text-center text-[10px] font-semibold tabular-nums text-paper sm:h-8 sm:w-8 sm:text-[11px]"
          aria-hidden
        >
          +{numPeople}
        </span>
      ) : null}
    </div>
  );
};

export { AvatarCircles };
