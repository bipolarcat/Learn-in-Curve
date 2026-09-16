"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Deterministic PRNG — path layouts must match SSR and client. */
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type GridPath = { id: string; d: string; delay: number };

function buildGeometricPaths(): GridPath[] {
  const rand = mulberry32(42);
  const gridSize = 40;
  const paths: GridPath[] = [];
  for (let x = 0; x < 20; x++) {
    for (let y = 0; y < 12; y++) {
      if (rand() > 0.7) {
        paths.push({
          id: `grid-${x}-${y}`,
          d: `M${x * gridSize},${y * gridSize} L${(x + 1) * gridSize},${y * gridSize} L${(x + 1) * gridSize},${(y + 1) * gridSize} L${x * gridSize},${(y + 1) * gridSize} Z`,
          delay: rand() * 5,
        });
      }
    }
  }
  return paths;
}

const GEOMETRIC_PATHS = buildGeometricPaths();

/**
 * Lab hero background — geometric box grid only, looping forever.
 * Teal strokes over the shared cream dotted body.
 */
export function LabBackgroundPaths() {
  const reduce = useReducedMotion();
  const animate = !reduce;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden text-teal"
      aria-hidden
    >
      <svg
        className="absolute inset-0 h-full w-full opacity-25"
        viewBox="0 0 800 480"
        preserveAspectRatio="xMidYMid slice"
      >
        {GEOMETRIC_PATHS.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            initial={animate ? { pathLength: 0, opacity: 0 } : false}
            animate={
              animate
                ? {
                    pathLength: [0, 1, 0],
                    opacity: [0, 0.55, 0],
                    scale: [1, 1.05, 1],
                  }
                : { pathLength: 0.4, opacity: 0.25 }
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

      <div className="absolute inset-0 bg-gradient-to-t from-cream/70 via-transparent to-cream/50" />
    </div>
  );
}
