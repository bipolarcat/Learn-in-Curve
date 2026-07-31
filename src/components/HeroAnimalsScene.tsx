"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "@/components/HeroAnimalsScene.module.css";

const VIDEO_SRC = "/brand/hero/hero-animals-2.mp4";
/** First keyed/cropped video frame — must match canvas framing 1:1 (cache-bust when regenerated). */
const POSTER_SRC = "/brand/hero/hero-animals-poster.png?v=1011";

/** Side pillarbox — trim past black rails without eating character ink. */
const CROP_X = 0.105;

/** Skip sizing until the laid-out box is big enough to avoid stretch flash. */
const MIN_READY_CSS = 64;

/**
 * Hard ceiling — anything larger is a FOUC / DPR flash, not a real layout.
 * Desktop max scene width is min(380px, 42vw).
 */
const MAX_READY_CSS = 420;

/** If motion never paints, fall back to the poster so mobile never stays blank. */
const MOTION_FALLBACK_MS = 2500;

/**
 * Inline critical clamps. Width comes from globals `[data-hero-animals]`
 * so media-query breakpoints still apply.
 */
const SCENE_STYLE = {
  position: "relative" as const,
  zIndex: 1,
  maxWidth: "100%",
  // Matches cropped source: 1280*(1-2*CROP_X) × 720 — same as poster + canvas.
  aspectRatio: "1011 / 720",
  margin: "0 auto 0.75rem",
  overflow: "hidden" as const,
  contain: "strict" as const,
  background: "transparent",
};

const FILL_STYLE = {
  position: "absolute" as const,
  inset: 0,
  width: "100%",
  height: "100%",
  maxWidth: "100%",
  maxHeight: "100%",
  display: "block" as const,
};

/** True cream plate only — loose thresholds punched holes in anti-aliased strokes. */
function isStrongPlate(r: number, g: number, b: number): boolean {
  if (r >= 248 && g >= 245 && b >= 230) return true;
  return (
    r >= 215 &&
    g >= 200 &&
    b >= 155 &&
    Math.min(r, g, b) >= 150 &&
    Math.abs(r - g) < 40 &&
    r + g > b + 175
  );
}

function isInk(r: number, g: number, b: number): boolean {
  return (r + g + b) / 3 <= 95;
}

function keyFrame(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const img = ctx.getImageData(0, 0, w, h);
  const data = img.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (!isStrongPlate(r, g, b)) continue;

      let touchesInk = false;
      for (let dy = -1; dy <= 1 && !touchesInk; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const ni = (ny * w + nx) * 4;
          if (isInk(data[ni], data[ni + 1], data[ni + 2])) {
            touchesInk = true;
            break;
          }
        }
      }
      if (touchesInk) continue;
      data[i + 3] = 0;
    }
  }

  ctx.putImageData(img, 0, 0);
}

function isSaneBox(cssW: number, cssH: number) {
  return (
    cssW >= MIN_READY_CSS &&
    cssH >= MIN_READY_CSS &&
    cssW <= MAX_READY_CSS &&
    cssH <= MAX_READY_CSS
  );
}

/**
 * Brand-hero animals — source mp4 through cream key (exact outline fidelity).
 *
 * Load / remount contract (no distortion flash):
 * 1. Poster is the only visible layer until motion has 3 stable keyed paints.
 * 2. Canvas stays visibility:hidden + opacity:0 during every buffer resize.
 * 3. Scene reveals on poster+box (never waits on canvas) — soft-nav shows poster, not a warped frame.
 * 4. After first show, canvas bitmap size is frozen (CSS scales) so resize can't flash DPR px.
 */
export function HeroAnimalsScene() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stillRef = useRef(false);
  const bufferFrozenRef = useRef(false);
  const [still, setStill] = useState(false);
  const [boxReady, setBoxReady] = useState(false);
  const [posterReady, setPosterReady] = useState(false);
  const [motionReady, setMotionReady] = useState(false);
  const [sceneVisible, setSceneVisible] = useState(false);

  const goStill = () => {
    stillRef.current = true;
    setStill(true);
  };

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const check = () => {
      const { width, height } = wrap.getBoundingClientRect();
      if (isSaneBox(Math.round(width), Math.round(height))) setBoxReady(true);
    };

    check();
    const ro = new ResizeObserver(check);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  // Reveal scene on poster only — never gate first paint on canvas.
  useLayoutEffect(() => {
    if (!boxReady || !posterReady) {
      setSceneVisible(false);
      return;
    }
    let cancelled = false;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) setSceneVisible(true);
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, [boxReady, posterReady]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) {
      goStill();
      return;
    }

    // Wait until the reserved box is measured before attaching the paint loop.
    if (!boxReady) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!video || !canvas || !wrap) return;

    video.setAttribute("webkit-playsinline", "true");
    video.setAttribute("playsinline", "true");

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      goStill();
      return;
    }

    let alive = true;
    let markedReady = false;
    let goodPaints = 0;
    let lastCssKey = "";
    let playing = false;
    let visible = true;
    let raf = 0;
    let vfc = 0;
    const useVfc = typeof video.requestVideoFrameCallback === "function";

    const hideCanvasHard = () => {
      canvas.style.setProperty("visibility", "hidden", "important");
      canvas.style.setProperty("opacity", "0", "important");
    };

    const showCanvasSoft = () => {
      canvas.style.removeProperty("visibility");
      canvas.style.removeProperty("opacity");
    };

    // Start fully hidden — never paint an unsized buffer to the user.
    hideCanvasHard();
    canvas.style.setProperty("width", "100%", "important");
    canvas.style.setProperty("height", "100%", "important");
    canvas.style.setProperty("max-width", "100%", "important");
    canvas.style.setProperty("max-height", "100%", "important");
    canvas.style.setProperty("position", "absolute", "important");
    canvas.style.setProperty("inset", "0", "important");

    const fallbackTimer = window.setTimeout(() => {
      if (!alive || markedReady || stillRef.current) return;
      goStill();
    }, MOTION_FALLBACK_MS);

    const sizeForPaint = () => {
      if (!video.videoWidth) return null;
      const rect = wrap.getBoundingClientRect();
      const cssW = Math.max(1, Math.round(rect.width));
      const cssH = Math.max(1, Math.round(rect.height));
      if (!isSaneBox(cssW, cssH)) return null;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const bw = Math.max(1, Math.round(cssW * dpr));
      const bh = Math.max(1, Math.round(cssH * dpr));

      // After first public show, freeze bitmap size — CSS 100% scales it.
      // Changing canvas.width while visible is what caused the soft-nav flash.
      if (bufferFrozenRef.current) {
        return { bw: canvas.width, bh: canvas.height, cssW, cssH };
      }

      if (canvas.width !== bw || canvas.height !== bh) {
        hideCanvasHard();
        // CSS size stays 100% of parent (already sane) — never set buffer px as layout.
        canvas.width = bw;
        canvas.height = bh;
        goodPaints = 0;
        lastCssKey = "";
      }
      return { bw, bh, cssW, cssH };
    };

    const paint = () => {
      if (!alive || !playing || stillRef.current) return;
      if (video.readyState < 3) return;

      const size = sizeForPaint();
      if (!size) return;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, size.bw, size.bh);

      const sx = video.videoWidth * CROP_X;
      const sw = video.videoWidth * (1 - CROP_X * 2);
      ctx.drawImage(
        video,
        sx,
        0,
        sw,
        video.videoHeight,
        0,
        0,
        size.bw,
        size.bh,
      );
      keyFrame(ctx, size.bw, size.bh);

      if (markedReady) return;

      const cssKey = `${size.cssW}x${size.cssH}`;
      if (cssKey === lastCssKey) goodPaints += 1;
      else {
        lastCssKey = cssKey;
        goodPaints = 1;
      }

      if (goodPaints < 3) return;
      markedReady = true;
      bufferFrozenRef.current = true;
      window.clearTimeout(fallbackTimer);
      // One more frame hidden after freeze, then allow React opacity to take over.
      requestAnimationFrame(() => {
        if (!alive) return;
        showCanvasSoft();
        setMotionReady(true);
      });
    };

    const stopLoop = () => {
      playing = false;
      cancelAnimationFrame(raf);
      if (useVfc && vfc) video.cancelVideoFrameCallback?.(vfc);
      vfc = 0;
      video.pause();
    };

    const tickRaf = () => {
      if (!alive || !playing) return;
      paint();
      raf = requestAnimationFrame(tickRaf);
    };

    const tickVfc = () => {
      if (!alive || !playing) return;
      paint();
      vfc = video.requestVideoFrameCallback(tickVfc);
    };

    const startLoop = () => {
      if (!alive || !visible || reduce.matches || stillRef.current) return;
      if (video.readyState < 3) return;
      sizeForPaint();
      void video
        .play()
        .then(() => {
          if (!alive || !visible || stillRef.current) return;
          playing = true;
          if (useVfc) {
            if (vfc) video.cancelVideoFrameCallback?.(vfc);
            vfc = video.requestVideoFrameCallback(tickVfc);
          } else {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(tickRaf);
          }
        })
        .catch(() => {
          if (!alive) return;
          window.clearTimeout(fallbackTimer);
          stopLoop();
          goStill();
        });
    };

    const onVisTab = () => {
      if (document.hidden) stopLoop();
      else if (visible) startLoop();
    };

    const onReduce = () => {
      if (!reduce.matches) return;
      alive = false;
      window.clearTimeout(fallbackTimer);
      stopLoop();
      goStill();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = (entry?.intersectionRatio ?? 0) >= 0.1;
        if (visible) startLoop();
        else stopLoop();
      },
      { threshold: [0, 0.1, 0.25] },
    );
    io.observe(wrap);

    const ro = new ResizeObserver(() => {
      if (!alive || !playing || stillRef.current) return;
      // After freeze, only re-paint into the fixed buffer (no canvas.width change).
      paint();
    });
    ro.observe(wrap);

    const boot = () => {
      void (document.fonts?.ready ?? Promise.resolve()).then(() => {
        if (!alive) return;
        startLoop();
      });
    };

    video.addEventListener("canplaythrough", boot);
    video.addEventListener("canplay", boot);
    video.addEventListener("loadeddata", boot);
    document.addEventListener("visibilitychange", onVisTab);
    reduce.addEventListener("change", onReduce);
    if (video.readyState >= 3) boot();
    try {
      video.load();
    } catch {
      /* ignore */
    }

    return () => {
      alive = false;
      bufferFrozenRef.current = false;
      window.clearTimeout(fallbackTimer);
      stopLoop();
      io.disconnect();
      ro.disconnect();
      video.removeEventListener("canplaythrough", boot);
      video.removeEventListener("canplay", boot);
      video.removeEventListener("loadeddata", boot);
      document.removeEventListener("visibilitychange", onVisTab);
      reduce.removeEventListener("change", onReduce);
    };
  }, [boxReady]);

  const showPoster = still || !motionReady;
  const showCanvas = !still && motionReady;

  return (
    <div
      ref={wrapRef}
      className={styles.scene}
      style={{
        ...SCENE_STYLE,
        visibility: sceneVisible ? "visible" : "hidden",
      }}
      aria-hidden
      data-hero-animals=""
      data-box-ready={boxReady ? "true" : "false"}
      data-poster-ready={posterReady ? "true" : "false"}
      data-motion-ready={motionReady ? "true" : "false"}
      data-revealed={sceneVisible ? "true" : "false"}
      data-still={still ? "true" : "false"}
    >
      <video
        ref={videoRef}
        src={VIDEO_SRC}
        className={styles.hiddenVideo}
        muted
        playsInline
        loop
        preload="auto"
        disablePictureInPicture
        controls={false}
        tabIndex={-1}
      />

      <div
        className={`${styles.stack} ${sceneVisible ? styles.stackVisible : ""}`}
      >
        {/* Canvas under poster: hidden until 3 stable keyed paints + buffer freeze. */}
        {boxReady && !still ? (
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            style={{
              ...FILL_STYLE,
              opacity: showCanvas ? 1 : 0,
              visibility: showCanvas ? "visible" : "hidden",
            }}
          />
        ) : null}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={POSTER_SRC}
          alt=""
          draggable={false}
          decoding="async"
          fetchPriority="high"
          className={styles.poster}
          style={{
            ...FILL_STYLE,
            // Same fill as canvas — poster is the keyed first frame at identical aspect.
            objectFit: "fill",
            objectPosition: "center",
            opacity: showPoster ? 1 : 0,
          }}
          onLoad={() => setPosterReady(true)}
          ref={(el) => {
            if (el?.complete && el.naturalWidth > 0) setPosterReady(true);
          }}
        />
      </div>
    </div>
  );
}
