"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

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

function GeometricPaths({ animate }: { animate: boolean }) {
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-25"
      viewBox="0 0 800 480"
      aria-hidden
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
  );
}

function FlowPaths({ animate }: { animate: boolean }) {
  const flowPaths = Array.from({ length: 12 }, (_, i) => {
    const amplitude = 50 + i * 10;
    const offset = i * 60;
    return {
      id: `flow-${i}`,
      d: `M-100,${200 + offset} Q200,${200 + offset - amplitude} 500,${200 + offset} T900,${200 + offset}`,
      strokeWidth: 1 + i * 0.3,
      opacity: 0.08 + i * 0.04,
      delay: i * 0.8,
    };
  });

  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-40"
      viewBox="0 0 800 800"
      aria-hidden
    >
      {flowPaths.map((path) => (
        <motion.path
          key={path.id}
          d={path.d}
          fill="none"
          stroke="currentColor"
          strokeWidth={path.strokeWidth}
          strokeLinecap="round"
          initial={animate ? { pathLength: 0 } : false}
          animate={
            animate
              ? {
                  pathLength: [0, 1, 0.8, 0],
                  opacity: [0, path.opacity, path.opacity * 0.7, 0],
                }
              : { pathLength: 0.5, opacity: path.opacity * 0.6 }
          }
          transition={
            animate
              ? {
                  duration: 15,
                  delay: path.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
              : undefined
          }
        />
      ))}
    </svg>
  );
}

type NeuralNode = { x: number; y: number; id: string };
type NeuralConn = { id: string; d: string; delay: number };

function buildNeural(): { nodes: NeuralNode[]; connections: NeuralConn[] } {
  const rand = mulberry32(77);
  const nodes: NeuralNode[] = Array.from({ length: 50 }, (_, i) => ({
    x: rand() * 800,
    y: rand() * 600,
    id: `node-${i}`,
  }));

  const connections: NeuralConn[] = [];
  nodes.forEach((node, i) => {
    nodes.forEach((other, j) => {
      if (i >= j) return;
      const distance = Math.hypot(node.x - other.x, node.y - other.y);
      if (distance < 120 && rand() > 0.6) {
        connections.push({
          id: `conn-${i}-${other.id}`,
          d: `M${node.x},${node.y} L${other.x},${other.y}`,
          delay: rand() * 10,
        });
      }
    });
  });

  return { nodes, connections };
}

const NEURAL = buildNeural();

function NeuralPaths({ animate }: { animate: boolean }) {
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-20"
      viewBox="0 0 800 600"
      aria-hidden
    >
      {NEURAL.connections.map((conn) => (
        <motion.path
          key={conn.id}
          d={conn.d}
          stroke="currentColor"
          strokeWidth="0.5"
          fill="none"
          initial={animate ? { pathLength: 0, opacity: 0 } : false}
          animate={
            animate
              ? { pathLength: [0, 1, 0], opacity: [0, 0.7, 0] }
              : { pathLength: 0.5, opacity: 0.25 }
          }
          transition={
            animate
              ? {
                  duration: 6,
                  delay: conn.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
              : undefined
          }
        />
      ))}
      {NEURAL.nodes.map((node) => (
        <motion.circle
          key={node.id}
          cx={node.x}
          cy={node.y}
          r="2"
          fill="currentColor"
          initial={animate ? { scale: 0, opacity: 0 } : false}
          animate={
            animate
              ? { scale: [0, 1, 1.2, 1], opacity: [0, 0.5, 0.7, 0.5] }
              : { scale: 1, opacity: 0.35 }
          }
          transition={
            animate
              ? { duration: 4, repeat: Infinity, ease: "easeInOut" }
              : undefined
          }
        />
      ))}
    </svg>
  );
}

function SpiralPaths({ animate }: { animate: boolean }) {
  const spirals = Array.from({ length: 8 }, (_, i) => {
    const centerX = 400 + ((i % 4) - 1.5) * 200;
    const centerY = 300 + (Math.floor(i / 4) - 0.5) * 200;
    const radius = 80 + i * 15;
    const turns = 3 + i * 0.5;

    let path = `M${centerX + radius},${centerY}`;
    for (let angle = 0; angle <= turns * 360; angle += 5) {
      const radian = (angle * Math.PI) / 180;
      const currentRadius = radius * (1 - angle / (turns * 360));
      const x = centerX + currentRadius * Math.cos(radian);
      const y = centerY + currentRadius * Math.sin(radian);
      path += ` L${x},${y}`;
    }

    return { id: `spiral-${i}`, d: path, delay: i * 1.2 };
  });

  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-30"
      viewBox="0 0 800 600"
      aria-hidden
    >
      {spirals.map((spiral) => (
        <motion.path
          key={spiral.id}
          d={spiral.d}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={animate ? { pathLength: 0 } : false}
          animate={
            animate
              ? { pathLength: [0, 1, 0], rotate: [0, 360] }
              : { pathLength: 0.45, rotate: 0 }
          }
          transition={
            animate
              ? {
                  pathLength: {
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  delay: spiral.delay,
                }
              : undefined
          }
        />
      ))}
    </svg>
  );
}

const PATTERNS = ["neural", "flow", "geometric", "spiral"] as const;

/**
 * 21st “modern background paths” adapted for LIC — teal/ink strokes over
 * the shared cream dotted body (no slate gradient wash).
 */
export function LabBackgroundPaths() {
  const reduce = useReducedMotion();
  const animate = !reduce;
  const [currentPattern, setCurrentPattern] = useState(0);

  useEffect(() => {
    if (!animate) return;
    const interval = setInterval(() => {
      setCurrentPattern((prev) => (prev + 1) % PATTERNS.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [animate]);

  const pattern = (() => {
    switch (currentPattern) {
      case 1:
        return <FlowPaths animate={animate} />;
      case 2:
        return <GeometricPaths animate={animate} />;
      case 3:
        return <SpiralPaths animate={animate} />;
      default:
        return <NeuralPaths animate={animate} />;
    }
  })();

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden text-teal"
      aria-hidden
    >
      <motion.div
        key={currentPattern}
        initial={animate ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: animate ? 2 : 0 }}
        className="absolute inset-0"
      >
        {pattern}
      </motion.div>

      {/* Soft cream fades so paths sit under type without a white wash */}
      <div className="absolute inset-0 bg-gradient-to-t from-cream/70 via-transparent to-cream/50" />

      {animate ? (
        <div className="absolute right-4 top-4 z-[1] flex gap-1.5 sm:right-6 sm:top-6">
          {PATTERNS.map((_, i) => (
            <span
              key={PATTERNS[i]}
              className={`size-1.5 rounded-full transition-colors duration-300 ${
                i === currentPattern ? "bg-teal" : "bg-ink/20"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
