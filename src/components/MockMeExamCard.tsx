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
  art: { src: string; alt: string; objectPosition?: string };
  priority?: boolean;
};

/**
 * Mock Me picker card. The Start mock control uses the 21st motion-button
 * expand — triggered on pointer down (click), never on hover.
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
    <Link
      href={href}
      className={styles.card}
      onPointerDown={() => setPressed(true)}
    >
      <div className={styles.art}>
        <Image
          src={art.src}
          alt={art.alt}
          fill
          sizes="(max-width: 39.99rem) 92vw, 18rem"
          className={styles.artImage}
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
        <MotionButton
          label="Start mock"
          pressed={pressed}
          className={styles.ctaMotion}
        />
      </div>
    </Link>
  );
}
