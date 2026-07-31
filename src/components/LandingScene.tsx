import Image from "next/image";

type LandingSceneMotion = "ken-burns" | "float" | "float-reverse" | "sway";

type LandingSceneProps = {
  src: string;
  alt: string;
  /** Object-position focus (e.g. "center right"). */
  objectPosition?: string;
  motion?: LandingSceneMotion;
  /** Dark vignette for ink/rust bands. */
  tone?: "light" | "dark" | "rust";
  className?: string;
  sizes?: string;
  priority?: boolean;
};

const motionClass: Record<LandingSceneMotion, string> = {
  "ken-burns": "landing-ken-burns",
  float: "motion-safe:animate-float-slow",
  "float-reverse": "motion-safe:animate-float-slow-reverse",
  sway: "landing-sway",
};

/**
 * Decorative mid-century illustration plane for marketing sections.
 * Always pointer-events-none — never steals CTA clicks.
 */
export function LandingScene({
  src,
  alt,
  objectPosition = "center",
  motion = "ken-burns",
  tone = "light",
  className = "",
  sizes = "(max-width: 768px) 100vw, 42vw",
  priority = false,
}: LandingSceneProps) {
  const wash =
    tone === "dark"
      ? "from-ink via-ink/75 to-ink/25"
      : tone === "rust"
        ? "from-rust via-rust/80 to-rust/20"
        : "from-cream via-cream/70 to-transparent";

  return (
    <div
      className={`landing-scene pointer-events-none relative overflow-hidden rounded-2xl border-[2.5px] border-ink shadow-stickerSm ${className}`}
      aria-hidden
    >
      <div className={`absolute inset-0 overflow-hidden ${motionClass[motion]}`}>
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover"
          style={{ objectPosition }}
        />
      </div>
      <div
        className={`absolute inset-0 bg-gradient-to-r ${wash}`}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent"
        aria-hidden
      />
    </div>
  );
}
