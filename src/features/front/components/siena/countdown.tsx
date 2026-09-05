"use client";

import { useEffect, useRef } from "react";
import { cn } from "@heroui/theme";
import Image from "next/image";

type Props = {
  backgroundImage?: string;
  imageClassName?: string;
  panStart?: string;
  panEnd?: string;
};

const SMOOTH_TIME = 0.15; // segundos. Sube = más suave/lento, baja = más inmediato.
const MAX_DT = 1 / 24; // clamp para evitar saltos tras pausas del rAF

function parsePosition(str: string): [number, number] {
  const match = str.match(/-?\d+(\.\d+)?/g)?.map(Number) || [50, 50];
  const x = match[0] ?? 50;
  const y = match[1] ?? match[0] ?? 50;
  return [x, y];
}

// Overscan dinámico: cuánto hay que escalar la imagen para que el
// translate máximo no descubra bordes vacíos.
function computeOverscan(start: [number, number], end: [number, number]) {
  const range =
    Math.max(start[0], start[1], end[0], end[1]) -
    Math.min(start[0], start[1], end[0], end[1]);
  return 1 + range / 100 + 0.3;
}

function toTransform(x: number, y: number, overscan: number) {
  // translate en % (respecto al propio elemento) — se compone en GPU,
  // no dispara layout ni paint.
  return `translate3d(${50 - x}%, ${50 - y}%, 0) scale(${overscan})`;
}

export default function CountDown({
  backgroundImage = "/img/countdown.webp",
  imageClassName = "",
  panStart = "50% 50%",
  panEnd,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const lastTime = useRef(0);
  const rafId = useRef<number | null>(null);
  const isVisible = useRef(true);

  useEffect(() => {
    if (!panEnd || !containerRef.current || !imageRef.current) return;

    const container = containerRef.current;
    const image = imageRef.current;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const start = parsePosition(panStart);
    const end = parsePosition(panEnd);
    const overscan = computeOverscan(start, end);

    const applyProgress = (p: number) => {
      const x = start[0] + (end[0] - start[0]) * p;
      const y = start[1] + (end[1] - start[1]) * p;
      image.style.transform = toTransform(x, y, overscan);
    };

    const computeTargetProgress = () => {
      const rect = container.getBoundingClientRect();
      const windowHeight = window.visualViewport?.height ?? window.innerHeight;
      const distance = windowHeight - rect.top;
      const totalDistance = windowHeight + rect.height;
      const p = totalDistance > 0 ? distance / totalDistance : 0;
      targetProgress.current = Math.max(0, Math.min(1, p));
    };

    const stopLoop = () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };

    const loop = (timestamp: number) => {
      const rawDt = lastTime.current
        ? (timestamp - lastTime.current) / 1000
        : 1 / 60;
      const dt = Math.min(rawDt, MAX_DT);
      lastTime.current = timestamp;

      const factor = 1 - Math.exp(-dt / SMOOTH_TIME);
      currentProgress.current +=
        (targetProgress.current - currentProgress.current) * factor;

      applyProgress(currentProgress.current);
      rafId.current = requestAnimationFrame(loop);
    };

    const ensureLoopRunning = () => {
      if (rafId.current === null && isVisible.current) {
        lastTime.current = 0;
        rafId.current = requestAnimationFrame(loop);
      }
    };

    const handleScroll = () => {
      computeTargetProgress();
      if (prefersReducedMotion) {
        currentProgress.current = targetProgress.current;
        applyProgress(currentProgress.current);
        return;
      }
      ensureLoopRunning();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting;
        if (isVisible.current) ensureLoopRunning();
        else stopLoop();
      },
      { threshold: 0 },
    );

    computeTargetProgress();
    currentProgress.current = targetProgress.current;
    applyProgress(currentProgress.current);

    observer.observe(container);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      stopLoop();
    };
  }, [panStart, panEnd]);

  const staticStyle = !panEnd ? { objectPosition: panStart } : undefined;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[100svh] bg-transparent"
    >
      {backgroundImage && (
        <div
          className="absolute inset-0 w-full h-full z-0"
          style={{ clipPath: "inset(0 0 0 0)" }}
        >
          <div className="fixed top-0 max-w-[500px] 2xl:max-w-[600px] w-full h-screen overflow-hidden">
            <Image
              ref={imageRef}
              src={backgroundImage}
              alt="Fondo de la invitación"
              fill
              priority
              sizes="100vh"
              className={cn(
                "object-cover will-change-transform",
                imageClassName,
              )}
              style={staticStyle}
            />
          </div>
        </div>
      )}

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center pointer-events-none" />
    </div>
  );
}
