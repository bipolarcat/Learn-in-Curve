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
   * Drop distance in px before the bounce lands. 21st default is 200 —
   * too tall for inline headline use; pass a smaller value there.
   */
  fromY?: number;
  /**
   * When true, skip the final fly-away so the word stays readable
   * (needed for the home hero “curve” lockup).
   */
  persist?: boolean;
} & ComponentPropsWithoutRef<"span">;

/**
 * 21st.dev BouncingText — per-character bounce via GSAP SplitText.
 * Renders as `<span>` so it can sit inside headings.
 */
export function BouncingText({
  repeat = true,
  fromY = -200,
  persist = false,
  ...props
}: BouncingTextProps) {
  const textRef = useRef<HTMLSpanElement | null>(null);

  useGSAP(
    () => {
      if (!textRef.current) return;

      const split = new SplitText(textRef.current, { type: "words,chars" });
      const bounceChars = split.chars;
      let bounceCount = 0;

      bounceChars.forEach((el) => {
        const tl = gsap.timeline({
          repeat: repeat === true ? -1 : repeat === false ? 0 : repeat,
        });
        tl.to(el, {
          duration: 0,
          y: fromY,
        });
        tl.to(el, {
          duration: 2,
          y: 0,
          rotate: -10,
          ease: "bounce",
        });
        tl.to(el, {
          duration: 1,
          y: 0,
          rotate: 0,
          ease: "bounce",
        });
        if (!persist) {
          tl.to(el, {
            duration: 2,
            y: fromY,
            rotate: 0,
            delay: 1,
            ease: "elastic",
          });
        }
        tl.delay(bounceCount / 8);
        bounceCount++;
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
