import Image from "next/image";

type DiagramFigureProps = {
  src: string;          // e.g. "/diagrams/v2/lo4-swot.svg"
  alt: string;
  caption: string;
  figureNumber: string; // e.g. "4.2"
};

/**
 * Cream-background figure box for v2 course diagrams.
 *
 * Fixed at max 620 px on desktop (centred); shrinks fluidly below that.
 * Reserves the 1024×705 aspect ratio so there is no layout shift while
 * the SVG loads.
 */
export function DiagramFigure({
  src,
  alt,
  caption,
  figureNumber,
}: DiagramFigureProps) {
  return (
    <figure className="mx-auto my-8 w-full max-w-[620px] rounded-lg border border-ink/10 bg-cream p-4">
      <Image
        src={src}
        alt={alt}
        width={1024}
        height={705}
        className="block h-auto w-full"
        loading="lazy"
      />
      <figcaption className="mt-3 text-center text-sm italic text-ink/60">
        Figure {figureNumber} — {caption}
      </figcaption>
    </figure>
  );
}
