import Image from "next/image";

type DiagramFigureProps = {
  src: string;          // e.g. "/diagrams/v2/lo4-swot.svg"
  alt: string;
  caption: string;
  figureNumber: string; // e.g. "4.2"
};

/**
 * Cream-background figure for v2 course diagrams.
 *
 * Full content width (capped on very wide screens); diagram SVG should be
 * cropped tight in the asset — this shell stays quiet (no extra frame).
 */
export function DiagramFigure({
  src,
  alt,
  caption,
  figureNumber,
}: DiagramFigureProps) {
  return (
    <figure className="mx-auto my-6 w-full max-w-[720px]">
      <Image
        src={src}
        alt={alt}
        width={1024}
        height={705}
        className="block h-auto w-full"
        loading="lazy"
      />
      <figcaption className="mt-2.5 text-center text-sm italic text-ink/60">
        Figure {figureNumber} — {caption}
      </figcaption>
    </figure>
  );
}
