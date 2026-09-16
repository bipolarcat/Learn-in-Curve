"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";

/** Matches `body` cream dots in `globals.css` (`background-size: 20px`). */
const DOT = 20;
/** Dot centres sit at 1.25px inside each 20px tile. */
const DOT_CENTER = 1.25;
/** Boxes span two dots so corners land on the lattice. */
const CELL = DOT * 2;

/** Deterministic PRNG — same boxes across remounts. */
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type GridPath = { id: string; d: string; delay: number };

/** First dot-centre ≥ 0 in local coords, given element offset into the body tile. */
function firstDotLocal(offsetIntoBody: number) {
  const inTile = ((offsetIntoBody % DOT) + DOT) % DOT;
  return ((DOT_CENTER - inTile) + DOT) % DOT;
}

function buildAlignedBoxes(
  width: number,
  height: number,
  phaseX: number,
  phaseY: number,
): GridPath[] {
  const rand = mulberry32(42);
  const paths: GridPath[] = [];
  let i = 0;

  for (let x = phaseX; x < width + CELL; x += CELL) {
    for (let y = phaseY; y < height + CELL; y += CELL) {
      if (rand() > 0.62) {
        paths.push({
          id: `box-${i}`,
          d: `M${x},${y} L${x + CELL},${y} L${x + CELL},${y + CELL} L${x},${y + CELL} Z`,
          delay: rand() * 5,
        });
      }
      i += 1;
    }
  }

  return paths;
}

type Scene = {
  width: number;
  height: number;
  paths: GridPath[];
};

/**
 * Lab hero background — geometric boxes locked to the cream-dot lattice
 * (corners sit on dot centres; 1 CSS px = 1 SVG unit).
 */
export function LabBackgroundPaths() {
  const reduce = useReducedMotion();
  const animate = !reduce;
  const rootRef = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState<Scene | null>(null);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const sync = () => {
      const width = el.clientWidth;
      const height = el.clientHeight;
      if (width < 2 || height < 2) return;

      const body = document.body;
      const bodyRect = body.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      const offsetX = rect.left - bodyRect.left;
      const offsetY = rect.top - bodyRect.top;

      const phaseX = firstDotLocal(offsetX);
      const phaseY = firstDotLocal(offsetY);

      setScene({
        width,
        height,
        paths: buildAlignedBoxes(width, height, phaseX, phaseY),
      });
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0 overflow-hidden text-teal"
      aria-hidden
    >
      {scene ? (
        <svg
          className="absolute inset-0 opacity-[0.28]"
          width={scene.width}
          height={scene.height}
          viewBox={`0 0 ${scene.width} ${scene.height}`}
          shapeRendering="crispEdges"
        >
          {scene.paths.map((path) => (
            <motion.path
              key={path.id}
              d={path.d}
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              initial={animate ? { pathLength: 0, opacity: 0 } : false}
              animate={
                animate
                  ? {
                      pathLength: [0, 1, 0],
                      opacity: [0, 0.7, 0],
                    }
                  : { pathLength: 0.45, opacity: 0.3 }
              }
              transition={
                animate
                  ? {
                      duration: 8,
                      delay: path.delay,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
                  : undefined
              }
            />
          ))}
        </svg>
      ) : null}

      {/* Soft fade only — keep centre clear so lattice alignment reads */}
      <div className="absolute inset-0 bg-gradient-to-t from-cream/55 via-transparent to-cream/35" />
    </div>
  );
}
