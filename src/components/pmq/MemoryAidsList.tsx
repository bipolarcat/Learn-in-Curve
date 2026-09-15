"use client";

import { useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import type { MemoryAid } from "@/types/pmq";
import { cn } from "@/lib/utils";
import styles from "@/components/pmq/MemoryFlashCard.module.css";

type MemoryAidsListProps = {
  items: MemoryAid[];
};

/**
 * Compact 2-up flip tiles (Quizlet match grid) with a 21st.dev 3D spring flip.
 * Acronym on the front; expansion on the back. Reduced motion crossfades.
 */
export function MemoryAidsList({ items }: MemoryAidsListProps) {
  const [flipped, setFlipped] = useState<Set<string>>(() => new Set());
  const reduceMotion = useReducedMotion();
  const liveId = useId();

  if (items.length === 0) return null;

  const lastFlipped = [...flipped].at(-1);
  const liveItem = lastFlipped
    ? items.find((item) => item.acronym === lastFlipped)
    : null;

  const toggle = (acronym: string) => {
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(acronym)) next.delete(acronym);
      else next.add(acronym);
      return next;
    });
  };

  return (
    <>
      <p id={liveId} className="sr-only" aria-live="polite">
        {liveItem ? `${liveItem.acronym}: ${liveItem.expansion}` : ""}
      </p>
      <ul className={styles.grid} aria-label="Memory aids">
        {items.map((item) => {
          const isFlipped = flipped.has(item.acronym);
          return (
            <li key={item.acronym} className={styles.cell}>
              <MemoryFlashCard
                item={item}
                flipped={isFlipped}
                reduceMotion={Boolean(reduceMotion)}
                onFlip={() => toggle(item.acronym)}
              />
            </li>
          );
        })}
      </ul>
    </>
  );
}

const flipSpring = {
  type: "spring" as const,
  stiffness: 170,
  damping: 14,
  mass: 0.85,
};

function MemoryFlashCard({
  item,
  flipped,
  reduceMotion,
  onFlip,
}: {
  item: MemoryAid;
  flipped: boolean;
  reduceMotion: boolean;
  onFlip: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onFlip}
      aria-pressed={flipped}
      aria-label={
        flipped
          ? `${item.acronym}: ${item.expansion}. Flip back`
          : `${item.acronym}. Flip to reveal`
      }
      className={styles.card}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
    >
      <span className={styles.scene}>
        {reduceMotion ? (
          <span className={styles.inner}>
            <span
              className={cn(
                styles.face,
                styles.faceStatic,
                flipped ? styles.faceBack : styles.faceFront,
              )}
            >
              <Face item={item} side={flipped ? "back" : "front"} />
            </span>
          </span>
        ) : (
          <motion.span
            className={styles.inner}
            style={{ transformStyle: "preserve-3d" }}
            initial={false}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={flipSpring}
          >
            <span className={styles.sizer} aria-hidden>
              <Face item={item} side="back" />
            </span>
            <span className={cn(styles.face, styles.faceFront)}>
              <Face item={item} side="front" />
            </span>
            <span className={cn(styles.face, styles.faceBack)}>
              <Face item={item} side="back" />
            </span>
          </motion.span>
        )}
      </span>
    </motion.button>
  );
}

function Face({
  item,
  side,
}: {
  item: MemoryAid;
  side: "front" | "back";
}) {
  if (side === "front") {
    return (
      <>
        <span className={styles.acronym}>{item.acronym}</span>
        <span className={styles.hint}>
          <RotateCcw className="size-3" strokeWidth={2.25} aria-hidden />
          Flip
        </span>
      </>
    );
  }

  return (
    <>
      <span className={styles.backAcronym}>{item.acronym}</span>
      <span className={styles.expansion}>{item.expansion}</span>
    </>
  );
}
