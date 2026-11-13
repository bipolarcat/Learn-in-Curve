"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MOTION_BUTTON_EXPAND_MS,
  MotionButton,
} from "@/components/ui/motion-button";
import styles from "@/app/(site)/mock-me/MockMePage.module.css";

type MockMeExamCardProps = {
  href: string;
  mark: string;
  questionCount: number;
  art: {
    src: string;
    alt: string;
    objectPosition?: string;
    objectFit?: "cover" | "contain" | "zoom";
  };
  priority?: boolean;
};

/**
 * Mock Me picker card. The whole card is one link, so a tap on the
 * picture starts the mock. Navigation waits until the press expand
 * animation finishes so the motion reads clearly.
 */
export function MockMeExamCard({
  href,
  mark,
  questionCount,
  art,
  priority = false,
}: MockMeExamCardProps) {
  const router = useRouter();
  const [pressed, setPressed] = useState(false);
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
    };
  }, []);

  const artClass =
    art.objectFit === "contain"
      ? styles.artImageContain
      : art.objectFit === "zoom"
        ? styles.artImageZoom
        : styles.artImage;

  function startMock(event: React.MouseEvent<HTMLAnchorElement>) {
    // Let modified clicks (new tab) and non-primary buttons use the href.
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }
    event.preventDefault();
    if (pressed) return;

    setPressed(true);
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delay = reduceMotion ? 0 : MOTION_BUTTON_EXPAND_MS;

    navTimerRef.current = setTimeout(() => {
      router.push(href);
    }, delay);
  }

  return (
    <Link
      href={href}
      className={styles.card}
      onClick={startMock}
      aria-label={`Start ${mark} mock, ${questionCount} questions`}
    >
      <div className={styles.art}>
        <Image
          src={art.src}
          alt={art.alt}
          fill
          sizes="(max-width: 39.99rem) 92vw, 18rem"
          className={artClass}
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
        <span className={styles.ctaLink} aria-busy={pressed || undefined}>
          <MotionButton label="Start mock" pressed={pressed} />
        </span>
      </div>
    </Link>
  );
}
