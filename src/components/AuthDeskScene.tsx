import Image from "next/image";

/**
 * Looping Sly animation above the auth card.
 * Container is slightly shorter than the asset so the baked-in desk baseline is cropped out.
 */
export function AuthDeskScene() {
  return (
    <div className="relative z-[1] mx-auto -mb-0.5 aspect-[400/331] w-[min(200px,62vw)] overflow-hidden sm:w-[min(220px,58%)]">
      <Image
        src="/brand/auth/sign-up-fox-transparent.webp"
        alt=""
        width={400}
        height={336}
        priority
        unoptimized
        draggable={false}
        className="absolute inset-x-0 top-0 h-[101.6%] w-full max-w-none select-none object-cover object-top"
      />
    </div>
  );
}
