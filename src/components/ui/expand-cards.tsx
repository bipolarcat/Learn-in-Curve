"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "@/components/ui/expand-cards.module.css";

export type ExpandCardImage = {
  src: string;
  alt: string;
  label: string;
  badge?: string;
  badgeTone?: "pro" | "ai-pro";
};

type ExpandCardsProps = {
  images: ExpandCardImage[];
  initialIndex?: number;
  className?: string;
};

/**
 * Compact image accordion for landscape marketing slides.
 *
 * Closed cards are labelled orange plates that crossfade into the artwork on
 * open, so the collapsed state reads as a contents list at either size.
 * Desktop expands on hover, focus or click; mobile stacks tap-sized rows.
 */
export default function ExpandCards({
  images,
  initialIndex = 0,
  className = "",
}: ExpandCardsProps) {
  const safeInitial = Math.min(Math.max(initialIndex, 0), images.length - 1);
  const [expandedIndex, setExpandedIndex] = useState(safeInitial);

  if (images.length === 0) return null;

  return (
    <div
      className={`${styles.deck} ${className}`.trim()}
      role="group"
      aria-label="What’s inside PMQ in 5 Days"
    >
      {images.map((image, index) => {
        const active = expandedIndex === index;

        return (
          <button
            key={image.src}
            type="button"
            className={`${styles.card} ${active ? styles.cardActive : ""}`}
            onMouseEnter={() => setExpandedIndex(index)}
            onFocus={() => setExpandedIndex(index)}
            onClick={() => setExpandedIndex(index)}
            aria-pressed={active}
            aria-label={`Show slide ${index + 1} of ${images.length}: ${image.alt}`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 767.98px) 86vw, (max-width: 75rem) 48vw, 34rem"
              className={styles.image}
              priority={index === safeInitial}
            />
            <span className={styles.cover} aria-hidden />
            <span className={styles.collapsedLabel} aria-hidden>
              <span>{image.label}</span>
              <span className={styles.collapsedNumber}>
                {index + 1}/{images.length}
              </span>
            </span>
            <span className={styles.slideNumber} aria-hidden>
              {index + 1}/{images.length}
            </span>
            {image.badge ? (
              <span
                className={`${styles.badge} ${
                  image.badgeTone === "ai-pro"
                    ? styles.badgeAiPro
                    : styles.badgePro
                }`}
              >
                {image.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
