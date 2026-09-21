import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LIBRARY_AUTHOR } from "@/content/library/author";

type LibraryAuthorBylineProps = {
  className?: string;
};

/** Author plate for the bottom of every Shelf guide. */
export function LibraryAuthorByline({ className = "" }: LibraryAuthorBylineProps) {
  return (
    <div
      className={`flex items-center gap-3 border-t border-ink/10 pt-6 ${className}`}
    >
      <div className="relative size-11 shrink-0 overflow-hidden rounded-full border border-ink/10 bg-cream">
        <Image
          src={LIBRARY_AUTHOR.imageSrc}
          alt={LIBRARY_AUTHOR.imageAlt}
          fill
          sizes="44px"
          className="object-cover object-top"
        />
      </div>
      <div className="min-w-0">
        <p className="m-0 font-body text-[14px] font-semibold tracking-[-0.01em] text-ink">
          <Link
            href={LIBRARY_AUTHOR.url}
            rel="author"
            className="rounded-sm underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55"
          >
            {LIBRARY_AUTHOR.name}
          </Link>
        </p>
        <p className="m-0 mt-0.5 flex flex-wrap items-center gap-x-1 font-body text-[12.5px] text-ink/55">
          <span>Founder,</span>
          <span className="inline-flex items-center gap-1">
            <Logo
              size={14}
              className="h-3.5 w-3.5"
              alt=""
            />
            <span>Learn in Curve</span>
          </span>
        </p>
      </div>
    </div>
  );
}
