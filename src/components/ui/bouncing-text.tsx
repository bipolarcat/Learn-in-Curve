"use client";

import { type ComponentPropsWithoutRef, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, SplitText);

type BouncingTextProps = {
  /** Loop forever (`true`), play once (`false`), or N repeats. */
  repeat?: boolean | number;
  /**
   * Drop distance in px before the settle lands. Keep small for inline
   * headline use so characters never cross the line above.
   */
  fromY?: number;
  /**
   * When true, skip the final fly-away so the word stays readable
   * (needed for the home hero “curve” lockup).
   */
  persist?: boolean;
} & ComponentPropsWithoutRef<"span">;

/**
 * Per-character settle via GSAP SplitText — ease-out only (no bounce/elastic).
 * Renders as `<span>`; SplitText wrappers are forced to inline.
 */
export function BouncingText({
  repeat = true,
  fromY = -18,
  persist = false,
  ...props
}: BouncingTextProps) {
  const textRef = useRef<HTMLSpanElement | null>(null);

  useGSAP(
    () => {
      if (!textRef.current) return;

      const split = new SplitText(textRef.current, {
        type: "chars",
        // Keep heading markup valid — never wrap chars in <div>.
        tag: "span",
      });
      const bounceChars = split.chars;

      bounceChars.forEach((el, i) => {
        gsap.set(el, {
          display: "inline-block",
          y: fromY,
          opacity: 0.35,
        });
        const tl = gsap.timeline({
          repeat: repeat === true ? -1 : repeat === false ? 0 : repeat,
          delay: i * 0.035,
        });
        // Short ease-out settle — no overshoot past y:0.
        tl.to(el, {
          duration: 0.45,
          y: 0,
          opacity: 1,
          ease: "power2.out",
        });
        if (!persist) {
          tl.to(el, {
            duration: 0.5,
            y: fromY,
            opacity: 0.35,
            delay: 1.2,
            ease: "power2.in",
          });
        }
      });

      return () => {
        split.revert();
      };
    },
    { scope: textRef, dependencies: [repeat, fromY, persist] },
  );

  return <span {...props} ref={textRef} />;
}

export default BouncingText;
