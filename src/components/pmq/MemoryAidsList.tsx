"use client";

import { useReducedMotion } from "framer-motion";
import { useId, useState } from "react";
import type { MemoryAid } from "@/types/pmq";
import styles from "@/components/pmq/MemoryFlashCard.module.css";

type MemoryAidsListProps = {
  items: MemoryAid[];
};

/**
 * Quiet flip flashcards — acronym front, expansion back.
 * Tokens via *-rgb; reduced-motion face swap.
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
    <button
      type="button"
      onClick={onFlip}
      aria-pressed={flipped}
      aria-label={
        flipped
          ? `${item.acronym}: ${item.expansion}. Flip back`
          : `${item.acronym}. Flip to reveal`
      }
      className={`${styles.card} ${flipped ? styles.cardFlipped : ""} ${
        reduceMotion ? styles.cardReduced : ""
      }`}
    >
      <span className={styles.scene}>
        <span className={styles.inner}>
          <span
            className={`${styles.face} ${styles.faceFront}`}
            aria-hidden={flipped}
          >
            <span className={styles.acronym}>{item.acronym}</span>
            <span className={styles.rule} aria-hidden />
            <span className={styles.hint}>Flip to reveal</span>
          </span>

          <span
            className={`${styles.face} ${styles.faceBack}`}
            aria-hidden={!flipped}
          >
            <span className={styles.backAcronym}>{item.acronym}</span>
            <span className={styles.expansion}>{item.expansion}</span>
          </span>
        </span>
      </span>
    </button>
  );
}
