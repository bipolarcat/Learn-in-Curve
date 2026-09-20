import Image from "next/image";
import type { ReactNode } from "react";

type LabArtPlateProps = {
  /** Main illustration */
  src: string;
  alt: string;
  /** Optional animal / sticker overlay (corner badge) */
  stickerSrc?: string;
  stickerAlt?: string;
  /** Visual crop / object position for the main art */
  objectPosition?: string;
  /** Soft wash behind the plate */
  tone?: "cream" | "teal" | "orange" | "paper";
  className?: string;
  priority?: boolean;
  children?: ReactNode;
};

const TONE: Record<NonNullable<LabArtPlateProps["tone"]>, string> = {
  cream: "bg-cream/90",
  teal: "bg-[color-mix(in_srgb,var(--teal)_12%,var(--cream))]",
  orange: "bg-[color-mix(in_srgb,var(--orange)_10%,var(--cream))]",
  paper: "bg-paper",
};

/**
 * Illustrated plate for lab landing sections — main art + optional animal sticker.
 */
export function LabArtPlate({
  src,
  alt,
  stickerSrc,
  stickerAlt = "",
  objectPosition = "center",
  tone = "cream",
  className = "",
  priority = false,
  children,
}: LabArtPlateProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-ink/10 shadow-[0_1px_0_rgb(var(--ink-rgb)_/_0.04),0_12px_28px_-18px_rgb(var(--ink-rgb)_/_0.35)] ${TONE[tone]} ${className}`}
    >
      <div className="relative aspect-[4/3] w-full sm:aspect-[5/4]">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
          className="object-cover"
          style={{ objectPosition }}
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/[0.08] via-transparent to-transparent"
          aria-hidden
        />
      </div>
      {stickerSrc ? (
        <div
          className="pointer-events-none absolute -bottom-1 -right-1 h-[4.5rem] w-[4.5rem] sm:-bottom-2 sm:-right-2 sm:h-[5.5rem] sm:w-[5.5rem]"
          aria-hidden={stickerAlt === ""}
        >
          <Image
            src={stickerSrc}
            alt={stickerAlt}
            fill
            sizes="88px"
            className="object-contain drop-shadow-[0_6px_12px_rgb(var(--ink-rgb)_/_0.18)]"
          />
        </div>
      ) : null}
      {children}
    </div>
  );
}
