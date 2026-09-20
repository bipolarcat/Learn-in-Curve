import Image from "next/image";
import { LabArtPlate } from "@/components/lab/LabArtPlate";
import { ScrollReveal } from "@/components/ScrollReveal";

const TILES = [
  {
    id: "mocks",
    title: "Full mock exams",
    body: "Timed papers that mirror exam pressure — so the real sitting feels familiar.",
    src: "/brand/features/mocks.webp",
    alt: "Illustrated mock exam desk scene.",
    stickerSrc: "/brand/hero/hero-animals-poster.png",
    objectPosition: "center 40%",
    tone: "teal" as const,
  },
  {
    id: "practice",
    title: "Practice quizzes",
    body: "Short retrieval sets as you learn — catch gaps before they pile up.",
    src: "/brand/features/practice.webp",
    alt: "Illustrated practice quiz scene.",
    stickerSrc: "/mascot/fox-face.svg",
    objectPosition: "center 45%",
    tone: "cream" as const,
  },
  {
    id: "syllabus",
    title: "Full syllabus",
    body: "Structured lessons for every learning outcome — built around how the exam works.",
    src: "/brand/features/core.webp",
    alt: "Illustrated syllabus study scene.",
    stickerSrc: "/mascot/fox-full-body.svg",
    objectPosition: "center 35%",
    tone: "paper" as const,
  },
  {
    id: "sly",
    title: "Sly, your AI tutor",
    body: "Ask exam questions in plain English. Beta taster on the page — unlimited with AI Pro later.",
    src: "/brand/features/sly.webp",
    alt: "Illustrated Sly AI tutor scene.",
    stickerSrc: "/brand/sly/sly-tutor-portrait.png",
    objectPosition: "center 30%",
    tone: "orange" as const,
  },
];

/**
 * Product feature tiles — fewer than the old 7-card stack, with brand art + animal stickers.
 * Mobile: 1 col. sm+: 2×2.
 */
export function LabFeatureTiles() {
  return (
    <section
      id="lab-features"
      aria-labelledby="lab-features-heading"
      className="relative overflow-x-clip border-t border-ink/[0.06] pt-[clamp(2.25rem,5vw,3.5rem)] pb-[clamp(2.5rem,6vw,4.5rem)]"
    >
      <div className="wrap relative z-[1]">
        <ScrollReveal className="mx-auto max-w-[40rem] text-center">
          <p className="mb-2 font-body text-[12px] font-bold uppercase tracking-[0.14em] text-teal sm:text-[13px]">
            What’s inside
          </p>
          <h2
            id="lab-features-heading"
            className="font-display text-[clamp(1.65rem,3.5vw,2.35rem)] font-bold leading-[1.05] tracking-[-0.03em] text-ink"
          >
            Everything you need before exam day
          </h2>
          <p className="mx-auto mt-3 max-w-[34rem] text-pretty font-body text-[15px] leading-relaxed text-ink/65 sm:text-[16px]">
            Mocks, quizzes, the syllabus, and Sly — illustrated the LIC way, not
            a feature dump.
          </p>
        </ScrollReveal>

        <ul className="mt-8 grid list-none grid-cols-1 gap-5 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:gap-6">
          {TILES.map((tile, i) => (
            <li key={tile.id}>
              <ScrollReveal delay={0.05 * i} className="h-full">
                <article className="flex h-full flex-col gap-3 overflow-hidden rounded-2xl border border-ink/10 bg-paper/60 p-3 sm:p-3.5">
                  <LabArtPlate
                    src={tile.src}
                    alt={tile.alt}
                    stickerSrc={tile.stickerSrc}
                    objectPosition={tile.objectPosition}
                    tone={tile.tone}
                    className="!rounded-xl !shadow-none"
                  />
                  <div className="px-1 pb-1 pt-0.5">
                    <h3 className="font-display text-[1.2rem] font-semibold leading-snug tracking-[-0.02em] text-ink sm:text-[1.35rem]">
                      {tile.title}
                    </h3>
                    <p className="mt-1.5 text-pretty font-body text-[14px] leading-relaxed text-ink/65 sm:text-[15px]">
                      {tile.body}
                    </p>
                  </div>
                </article>
              </ScrollReveal>
            </li>
          ))}
        </ul>

        {/* Decorative animal strip — same cast as the hero, static poster for perf */}
        <ScrollReveal delay={0.12} className="mt-8 sm:mt-10">
          <div className="relative mx-auto flex max-w-[28rem] items-end justify-center px-4">
            <div className="relative h-[7.5rem] w-full max-w-[22rem] sm:h-[9rem] sm:max-w-[26rem]">
              <Image
                src="/brand/hero/hero-animals-poster.png"
                alt=""
                fill
                sizes="(max-width: 640px) 88vw, 416px"
                className="object-contain object-bottom"
                aria-hidden
              />
            </div>
          </div>
          <p className="mt-2 text-center font-body text-[12px] tracking-tight text-ink/45 sm:text-[13px]">
            Same crew. Different scenes.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
