"use client";

import * as Color from "color-bits";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

/** Convert any CSS color to rgba (handles CSS variables). */
export const getRGBA = (
  cssColor: React.CSSProperties["color"],
  fallback: string = "rgba(244, 233, 214)",
): string => {
  if (typeof window === "undefined") return fallback;
  if (!cssColor) return fallback;

  try {
    if (typeof cssColor === "string" && cssColor.includes("var(")) {
      const element = document.createElement("div");
      element.style.color = cssColor;
      document.body.appendChild(element);
      const computedColor = window.getComputedStyle(element).color;
      document.body.removeChild(element);
      return Color.formatRGBA(Color.parse(computedColor));
    }

    return Color.formatRGBA(Color.parse(cssColor));
  } catch (e) {
    console.error("Color parsing failed:", e);
    return fallback;
  }
};

export const colorWithOpacity = (color: string, opacity: number): string => {
  if (!color.startsWith("rgb")) return color;
  return Color.formatRGBA(Color.alpha(Color.parse(color), opacity));
};

/** Next injects a hashed family into --font-fraunces; canvas cannot use var(). */
function resolveFrauncesFamily(): string {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-fraunces")
    .trim();
  if (!raw) return "Georgia, serif";
  return `${raw}, Georgia, serif`;
}

type GridParams = {
  cols: number;
  rows: number;
  squares: Float32Array;
  /** 1 = letterform cell, 0 = ambient. Built once per resize/font. */
  textMask: Uint8Array;
  dpr: number;
};

interface FlickeringGridProps extends React.HTMLAttributes<HTMLDivElement> {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  /** Ambient flicker square color. */
  color?: string;
  /** Letterform square color; defaults to `color` when omitted. */
  textColor?: string;
  width?: number;
  height?: number;
  className?: string;
  maxOpacity?: number;
  text?: string;
  fontSize?: number;
  fontWeight?: number | string;
}

export const FlickeringGrid: React.FC<FlickeringGridProps> = ({
  squareSize = 3,
  gridGap = 3,
  flickerChance = 0.2,
  color = "rgb(var(--cream-rgb))",
  textColor,
  width,
  height,
  className,
  maxOpacity = 0.15,
  text = "",
  fontSize = 140,
  fontWeight = 700,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fontFamilyRef = useRef("Georgia, serif");
  const [isInView, setIsInView] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const memoizedColor = useMemo(() => getRGBA(color), [color]);
  const memoizedTextColor = useMemo(
    () => getRGBA(textColor ?? color),
    [textColor, color],
  );

  useEffect(() => {
    let cancelled = false;

    async function prepareFonts() {
      fontFamilyRef.current = resolveFrauncesFamily();
      const face = `${fontWeight} ${fontSize}px ${fontFamilyRef.current}`;
      try {
        await document.fonts.ready;
        if (text) {
          await document.fonts.load(face);
        }
      } catch {
        // Fall through with Georgia fallback already in the stack.
      }
      if (!cancelled) setFontsReady(true);
    }

    void prepareFonts();
    return () => {
      cancelled = true;
    };
  }, [text, fontSize, fontWeight]);

  const buildTextMask = useCallback(
    (
      canvasWidth: number,
      canvasHeight: number,
      cols: number,
      rows: number,
      dpr: number,
    ): Uint8Array => {
      const mask = new Uint8Array(cols * rows);
      if (!text) return mask;

      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = canvasWidth;
      maskCanvas.height = canvasHeight;
      const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
      if (!maskCtx) return mask;

      maskCtx.save();
      maskCtx.scale(dpr, dpr);
      maskCtx.fillStyle = "white";
      maskCtx.font = `${fontWeight} ${fontSize}px ${fontFamilyRef.current}`;
      maskCtx.textAlign = "center";
      maskCtx.textBaseline = "middle";
      maskCtx.fillText(
        text,
        canvasWidth / (2 * dpr),
        canvasHeight / (2 * dpr),
      );
      maskCtx.restore();

      // One read for the whole bitmap — not per cell, not per frame.
      const imageData = maskCtx.getImageData(0, 0, canvasWidth, canvasHeight);
      const { data } = imageData;
      const cell = squareSize * dpr;
      const stride = (squareSize + gridGap) * dpr;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x0 = Math.floor(i * stride);
          const y0 = Math.floor(j * stride);
          const x1 = Math.min(canvasWidth, Math.ceil(x0 + cell));
          const y1 = Math.min(canvasHeight, Math.ceil(y0 + cell));
          let hasText = 0;
          for (let y = y0; y < y1 && !hasText; y++) {
            const rowStart = y * canvasWidth * 4;
            for (let x = x0; x < x1; x++) {
              if (data[rowStart + x * 4] > 0) {
                hasText = 1;
                break;
              }
            }
          }
          mask[i * rows + j] = hasText;
        }
      }

      return mask;
    },
    [text, fontSize, fontWeight, squareSize, gridGap],
  );

  const drawGrid = useCallback(
    (ctx: CanvasRenderingContext2D, params: GridParams) => {
      const { cols, rows, squares, textMask, dpr } = params;
      const canvasWidth = ctx.canvas.width;
      const canvasHeight = ctx.canvas.height;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      const cell = squareSize * dpr;
      const stride = (squareSize + gridGap) * dpr;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const idx = i * rows + j;
          const hasText = textMask[idx] === 1;
          const opacity = squares[idx] ?? 0;
          const finalOpacity = hasText
            ? Math.min(1, opacity * 3 + 0.55)
            : opacity;

          ctx.fillStyle = colorWithOpacity(
            hasText ? memoizedTextColor : memoizedColor,
            finalOpacity,
          );
          ctx.fillRect(i * stride, j * stride, cell, cell);
        }
      }
    },
    [memoizedColor, memoizedTextColor, squareSize, gridGap],
  );

  const setupCanvas = useCallback(
    (canvas: HTMLCanvasElement, w: number, h: number): GridParams => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const cols = Math.ceil(w / (squareSize + gridGap));
      const rows = Math.ceil(h / (squareSize + gridGap));

      const squares = new Float32Array(cols * rows);
      for (let i = 0; i < squares.length; i++) {
        squares[i] = Math.random() * maxOpacity;
      }

      const textMask = buildTextMask(canvas.width, canvas.height, cols, rows, dpr);

      return { cols, rows, squares, textMask, dpr };
    },
    [squareSize, gridGap, maxOpacity, buildTextMask],
  );

  const updateSquares = useCallback(
    (squares: Float32Array, deltaTime: number) => {
      for (let i = 0; i < squares.length; i++) {
        if (Math.random() < flickerChance * deltaTime) {
          squares[i] = Math.random() * maxOpacity;
        }
      }
    },
    [flickerChance, maxOpacity],
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReduceMotion(mq.matches);
    syncMotion();
    mq.addEventListener("change", syncMotion);
    return () => mq.removeEventListener("change", syncMotion);
  }, []);

  useEffect(() => {
    if (!fontsReady) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId = 0;
    let gridParams = setupCanvas(
      canvas,
      width || container.clientWidth,
      height || container.clientHeight,
    );

    const paint = () => {
      drawGrid(ctx, gridParams);
    };

    const clear = () => {
      // Off-screen: keep layout height, skip GPU work.
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const updateCanvasSize = () => {
      const newWidth = width || container.clientWidth;
      const newHeight = height || container.clientHeight;
      setCanvasSize({ width: newWidth, height: newHeight });
      gridParams = setupCanvas(canvas, newWidth, newHeight);
      if (isInView) {
        paint();
      } else {
        clear();
      }
    };

    updateCanvasSize();

    let lastTime = 0;
    const animate = (time: number) => {
      if (!isInView || reduceMotion) return;

      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      updateSquares(gridParams.squares, deltaTime);
      paint();
      animationFrameId = requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        setIsInView(Boolean(entry?.isIntersecting));
      },
      { threshold: 0, rootMargin: "180px 0px" },
    );
    intersectionObserver.observe(canvas);

    if (isInView) {
      // Always show a frame when visible — freeze under reduced motion.
      paint();
      if (!reduceMotion) {
        animationFrameId = requestAnimationFrame(animate);
      }
    } else {
      clear();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [
    fontsReady,
    setupCanvas,
    updateSquares,
    drawGrid,
    width,
    height,
    isInView,
    reduceMotion,
  ]);

  return (
    <div
      ref={containerRef}
      className={cn("h-full w-full", className)}
      {...props}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
        }}
      />
    </div>
  );
};

export function useMediaQuery(query: string) {
  const [value, setValue] = useState(false);

  useEffect(() => {
    function checkQuery() {
      setValue(window.matchMedia(query).matches);
    }

    checkQuery();
    window.addEventListener("resize", checkQuery);
    const mediaQuery = window.matchMedia(query);
    mediaQuery.addEventListener("change", checkQuery);

    return () => {
      window.removeEventListener("resize", checkQuery);
      mediaQuery.removeEventListener("change", checkQuery);
    };
  }, [query]);

  return value;
}
