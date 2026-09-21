"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MotionButton } from "@/components/ui/motion-button";
import styles from "@/app/(site)/mock-me/MockMePage.module.css";

type MockMeExamCardProps = {
  href: string;
  mark: string;
  questionCount: number;
  art: {
    src: string;
    alt: string;
    objectPosition?: string;
    objectFit?: "cover" | "contain";
  };
  priority?: boolean;
};

/**
 * Mock Me picker card. Only the Start mock control navigates —
 * the card surface itself is not a link.
 */
export function MockMeExamCard({
  href,
  mark,
  questionCount,
  art,
  priority = false,
}: MockMeExamCardProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <article className={styles.card}>
      <div className={styles.art}>
        <Image
          src={art.src}
          alt={art.alt}
          fill
          sizes="(max-width: 39.99rem) 92vw, 18rem"
          className={
            art.objectFit === "contain" ? styles.artImageContain : styles.artImage
          }
          style={
            art.objectPosition
              ? { objectPosition: art.objectPosition }
              : undefined
          }
          priority={priority}
        />
      </div>
      <div className={styles.meta}>
        <div className={styles.topRow}>
          <h2 className={styles.mark}>{mark}</h2>
          <p className={styles.count}>{questionCount} questions</p>
        </div>
        <Link
          href={href}
          className={styles.ctaLink}
          onPointerDown={() => setPressed(true)}
          aria-label={`Start ${mark} mock`}
        >
          <MotionButton label="Start mock" pressed={pressed} />
        </Link>
      </div>
    </article>
  );
}
