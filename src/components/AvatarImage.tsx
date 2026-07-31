import Image from "next/image";
import { getAvatarOption, type AvatarId } from "@/lib/avatars";

type AvatarImageProps = {
  avatarId: AvatarId;
  /** CSS display size in px */
  size: number;
  className?: string;
  priority?: boolean;
};

/**
 * Profile animal portrait — 3× retina bitmap.
 * Plate stays light cream in dark mode (PNGs are baked on that plate);
 * slight scale covers the translate so theme bg never peeks through.
 */
export function AvatarImage({
  avatarId,
  size,
  className = "",
  priority = false,
}: AvatarImageProps) {
  const avatar = getAvatarOption(avatarId);
  const px = Math.max(32, Math.round(size * 3));

  return (
    <Image
      src={avatar.src}
      alt=""
      width={px}
      height={px}
      priority={priority}
      draggable={false}
      className={`h-full w-full origin-center scale-[1.14] object-cover object-center translate-y-[6%] ${className}`}
    />
  );
}
