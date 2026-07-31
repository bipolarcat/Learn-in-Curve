import Image from "next/image";

type LogoProps = {
  size?: number;
  className?: string;
  priority?: boolean;
  /** Pass empty string when a visible wordmark sits next to the mark. */
  alt?: string;
};

export function Logo({
  size = 40,
  className = "",
  priority = false,
  alt = "Learn in Curve",
}: LogoProps) {
  return (
    <Image
      src="/brand/logo/fox-logo-png.png"
      alt={alt}
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      priority={priority}
    />
  );
}
