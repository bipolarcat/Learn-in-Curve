"use client";

import { useEffect, useRef } from "react";

type Circulo = { x: number; y: number; size: number; color: string };

const COLORS = [
  "rgb(213 80 31 / 0.22)",
  "rgb(27 101 96 / 0.18)",
  "rgb(217 164 65 / 0.2)",
  "rgb(95 122 61 / 0.16)",
];

/**
 * Soft brand-colour wipe — LIC take on the demo’s circle reveal.
 * Cream paper stays; translucent discs sweep across, then settle.
 * Skipped under prefers-reduced-motion.
 */
export function StatusCircleWipe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestIdRef = useRef<number | null>(null);
  const timerRef = useRef(0);
  const circulosRef = useRef<Circulo[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) return;

    const initArr = () => {
      circulosRef.current = [];
      const count = Math.min(
        160,
        Math.max(60, Math.floor((canvas.width * canvas.height) / 12000)),
      );
      for (let i = 0; i < count; i++) {
        const randomX =
          Math.floor(
            Math.random() * (canvas.width * 3 - canvas.width * 1.2 + 1),
          ) +
          canvas.width * 1.2;
        const randomY =
          Math.floor(
            Math.random() * (canvas.height - canvas.height * -0.2 + 1),
          ) +
          canvas.height * -0.2;
        circulosRef.current.push({
          x: randomX,
          y: randomY,
          size: canvas.width / 1400,
          color: COLORS[i % COLORS.length],
        });
      }
    };

    const draw = () => {
      timerRef.current += 1;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);

      const distanceX = canvas.width / 90;
      const growthRate = canvas.width / 1200;

      for (const circulo of circulosRef.current) {
        if (timerRef.current < 70) {
          circulo.x -= distanceX;
          circulo.size += growthRate;
        } else if (timerRef.current < 420) {
          circulo.x -= distanceX * 0.02;
          circulo.size += growthRate * 0.15;
        }

        context.beginPath();
        context.fillStyle = circulo.color;
        context.arc(circulo.x, circulo.y, circulo.size, 0, Math.PI * 2);
        context.fill();
      }

      if (timerRef.current > 420) {
        if (requestIdRef.current) cancelAnimationFrame(requestIdRef.current);
        requestIdRef.current = null;
        return;
      }

      requestIdRef.current = requestAnimationFrame(draw);
    };

    const start = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      timerRef.current = 0;
      if (requestIdRef.current) cancelAnimationFrame(requestIdRef.current);
      initArr();
      draw();
    };

    start();
    window.addEventListener("resize", start);

    return () => {
      window.removeEventListener("resize", start);
      if (requestIdRef.current) cancelAnimationFrame(requestIdRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}
