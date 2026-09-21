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
    <div className={cn("z-10 flex -space-x-3 rtl:space-x-reverse", className)}>
      {avatarUrls.map((url, index) => (
        // eslint-disable-next-line @next/next/no-img-element -- remote stock faces; no next/image domain config required
        <img
          key={url}
          className="h-7 w-7 rounded-full border-2 border-paper object-cover sm:h-8 sm:w-8"
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
          className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-paper bg-ink text-center text-[10px] font-semibold tabular-nums text-paper sm:h-8 sm:w-8 sm:text-[11px]"
          aria-hidden
        >
          +{numPeople}
        </span>
      ) : null}
    </div>
  );
};

export { AvatarCircles };
